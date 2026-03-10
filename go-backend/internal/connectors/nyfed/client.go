// Package nyfed provides NY Fed (Federal Reserve Bank of New York) connector. Phase 14b.2.
// Ref: REFERENCE_SOURCE_STATUS.md, https://markets.newyorkfed.org
// Treasury rates, SOFR, EFFR, Repo reference rates.
package nyfed

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

const DefaultBaseURL = "https://markets.newyorkfed.org/api"

const (
	seriesPrefix = "NYFED_"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	httpClient  *base.Client
	defaultPath string
}

type refRatesResponse struct {
	RefRates []refRate `json:"refRates"`
}

type refRate struct {
	EffectiveDate string  `json:"effectiveDate"`
	Type          string  `json:"type"`
	PercentRate   float64 `json:"percentRate"`
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
		defaultPath: "/rates",
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
			Cause:      fmt.Errorf("unsupported nyfed assetType"),
		}
	}
	if c == nil || c.httpClient == nil {
		return nil, fmt.Errorf("nyfed client unavailable")
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 1000 {
		limit = 1000
	}

	rateType, rateGroup, canonical, err := parseSeriesSymbol(pair.Base.String())
	if err != nil {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      err,
		}
	}

	endDate := time.Now().UTC()
	lookbackDays := max(limit*3, 14)
	startDate := endDate.AddDate(0, 0, -lookbackDays)
	query := url.Values{}
	query.Set("startDate", startDate.Format("2006-01-02"))
	query.Set("endDate", endDate.Format("2006-01-02"))

	path := fmt.Sprintf("%s/%s/%s/search.json", strings.TrimRight(c.defaultPath, "/"), rateGroup, strings.ToLower(rateType))
	req, err := c.httpClient.NewRequest(ctx, http.MethodGet, path, query, nil)
	if err != nil {
		return nil, fmt.Errorf("build nyfed request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: path, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{
			Path:       path,
			StatusCode: resp.StatusCode,
			Cause:      fmt.Errorf("nyfed rate request failed"),
		}
	}

	var payload refRatesResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, &gct.RequestError{Path: path, Cause: fmt.Errorf("decode nyfed response: %w", err)}
	}
	converted := make([]gct.SeriesPoint, 0, len(payload.RefRates))
	for _, entry := range payload.RefRates {
		effectiveDate := strings.TrimSpace(entry.EffectiveDate)
		if effectiveDate == "" {
			continue
		}
		parsedTime, parseErr := time.Parse("2006-01-02", effectiveDate)
		if parseErr != nil {
			continue
		}
		converted = append(converted, gct.SeriesPoint{
			Timestamp: parsedTime.UTC().Unix(),
			Value:     entry.PercentRate,
		})
	}
	if len(converted) == 0 {
		return nil, &gct.RequestError{
			Path:       path,
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no parsable observations for %s", canonical),
		}
	}
	ensureLatestFirst(converted)
	if len(converted) > limit {
		converted = converted[:limit]
	}
	return converted, nil
}

func parseSeriesSymbol(raw string) (string, string, string, error) {
	canonical := normalizeCanonical(raw)
	if canonical == "" {
		return "", "", "", fmt.Errorf("invalid NYFed symbol")
	}
	rateType := strings.TrimSpace(strings.TrimPrefix(canonical, seriesPrefix))
	switch rateType {
	case "SOFR", "TGCR", "BGCR":
		return rateType, "secured", canonical, nil
	case "EFFR", "OBFR":
		return rateType, "unsecured", canonical, nil
	default:
		return "", "", "", fmt.Errorf("invalid NYFed symbol: expected NYFED_{SOFR|TGCR|BGCR|EFFR|OBFR}")
	}
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
