// Package ofr provides OFR (Office of Financial Research) connector. Phase 14b.2.
// Ref: REFERENCE_SOURCE_STATUS.md, https://data.financialresearch.gov/v1
// Financial Stress Index, Short-term Funding Monitor, Credit Spreads.
package ofr

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"time"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://data.financialresearch.gov/v1"

const (
	seriesPrefix = "OFR_"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
	CacheTTL       time.Duration
}

type Client struct {
	httpClient    *base.Client
	defaultPath   string
	responseCache *base.JSONHotCache
}

type seriesPayload struct {
	Timeseries struct {
		Aggregation [][]any `json:"aggregation"`
	} `json:"timeseries"`
}

func NewClient(cfg Config) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 6 * time.Second
	}
	return &Client{
		httpClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 1,
		}),
		defaultPath:   "/series/full",
		responseCache: base.NewJSONHotCache("ofr-series", cfg.CacheTTL),
	}
}

func (c *Client) GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	series, err := c.GetSeries(ctx, pair, assetType, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no observations"),
		}
	}
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}
	canonical := normalizeCanonical(pair.Base.String())
	return gct.Ticker{
		Pair:        currency.NewPair(currency.NewCode(canonical), currency.NewCode("USD")),
		Currency:    canonical,
		LastUpdated: lastUpdated,
		Last:        value,
		Bid:         value,
		Ask:         value,
		High:        value,
		Low:         value,
		Volume:      0,
	}, nil
}

func (c *Client) GetSeries(ctx context.Context, pair currency.Pair, assetType asset.Item, limit int) ([]gct.SeriesPoint, error) {
	if !gct.IsSemanticAssetType(assetType, "macro") {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported ofr assetType"),
		}
	}
	if c == nil || c.httpClient == nil {
		return nil, fmt.Errorf("ofr client unavailable")
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 1000 {
		limit = 1000
	}

	mnemonic, canonical, err := parseSeriesSymbol(pair.Base.String())
	if err != nil {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      err,
		}
	}
	cacheKey := base.StableCacheKey(canonical, fmt.Sprintf("%d", limit))
	if c.responseCache != nil {
		var cached []gct.SeriesPoint
		if c.responseCache.Get(ctx, cacheKey, &cached) && len(cached) > 0 {
			return cached, nil
		}
	}

	endDate := time.Now().UTC()
	lookbackDays := max(limit*3, 14)
	startDate := endDate.AddDate(0, 0, -lookbackDays)
	query := url.Values{}
	query.Set("mnemonic", mnemonic)
	query.Set("start_date", startDate.Format("2006-01-02"))
	query.Set("end_date", endDate.Format("2006-01-02"))
	query.Set("remove_nulls", "true")

	req, err := c.httpClient.NewRequest(ctx, http.MethodGet, c.defaultPath, query, nil)
	if err != nil {
		return nil, fmt.Errorf("build ofr request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: c.defaultPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: resp.StatusCode,
			Cause:      fmt.Errorf("ofr series request failed"),
		}
	}

	var payload map[string]seriesPayload
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, &gct.RequestError{Path: c.defaultPath, Cause: fmt.Errorf("decode ofr response: %w", err)}
	}
	series, ok := payload[mnemonic]
	if !ok {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("missing OFR mnemonic payload for %s", canonical),
		}
	}
	converted := make([]gct.SeriesPoint, 0, len(series.Timeseries.Aggregation))
	for _, entry := range series.Timeseries.Aggregation {
		if len(entry) < 2 {
			continue
		}
		rawDate, ok := entry[0].(string)
		if !ok || strings.TrimSpace(rawDate) == "" {
			continue
		}
		parsedTime, parseErr := time.Parse("2006-01-02", rawDate)
		if parseErr != nil {
			continue
		}
		value, ok := entry[1].(float64)
		if !ok {
			continue
		}
		converted = append(converted, gct.SeriesPoint{
			Timestamp: parsedTime.UTC().Unix(),
			Value:     value,
		})
	}
	if len(converted) == 0 {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no parsable observations for %s", canonical),
		}
	}
	ensureLatestFirst(converted)
	if len(converted) > limit {
		converted = converted[:limit]
	}
	if c.responseCache != nil {
		c.responseCache.Set(ctx, cacheKey, converted)
	}
	return converted, nil
}

func parseSeriesSymbol(raw string) (string, string, error) {
	canonical := normalizeCanonical(raw)
	if canonical == "" {
		return "", "", fmt.Errorf("invalid OFR symbol")
	}
	mnemonic := strings.TrimSpace(strings.TrimPrefix(canonical, seriesPrefix))
	if mnemonic == "" || !strings.Contains(mnemonic, "-") {
		return "", "", fmt.Errorf("invalid OFR symbol: expected OFR_<DATASET>-<SERIES_IDENTIFIER>")
	}
	return mnemonic, canonical, nil
}

func normalizeCanonical(raw string) string {
	value := strings.TrimSpace(raw)
	if value == "" {
		return ""
	}
	upper := strings.ToUpper(value)
	if strings.HasPrefix(upper, seriesPrefix) {
		return seriesPrefix + value[len(seriesPrefix):]
	}
	return seriesPrefix + upper
}

func ensureLatestFirst(points []gct.SeriesPoint) {
	if len(points) < 2 {
		return
	}
	if points[0].Timestamp >= points[len(points)-1].Timestamp {
		return
	}
	slices.Reverse(points)
}
