package fred

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "https://api.stlouisfed.org/fred"

type Config struct {
	BaseURL        string
	APIKey         string
	RequestTimeout time.Duration
	CacheTTL       time.Duration
}

type Client struct {
	baseClient    *base.Client
	apiKey        string
	responseCache *base.JSONHotCache
}

func (c *Client) apiKeyForContext(ctx context.Context) string {
	if creds, ok := requestctx.ProviderCredential(ctx, "fred"); ok {
		if key := strings.TrimSpace(creds.Key); key != "" {
			return key
		}
	}
	return strings.TrimSpace(c.apiKey)
}

func NewClient(cfg Config) *Client {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}

	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}

	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 1,
		}),
		apiKey:        strings.TrimSpace(cfg.APIKey),
		responseCache: base.NewJSONHotCache("fred-series", cfg.CacheTTL),
	}
}

func (c *Client) GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	series, err := c.GetSeries(ctx, pair, assetType, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no observations"),
		}
	}

	seriesID := strings.ToUpper(strings.TrimSpace(pair.Base.String()))
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}

	return gct.Ticker{
		Pair:        currency.NewPair(currency.NewCode(seriesID), currency.NewCode("USD")),
		Currency:    seriesID,
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
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported fred assetType"),
		}
	}
	apiKey := c.apiKeyForContext(ctx)
	if apiKey == "" {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusUnauthorized,
			Cause:      fmt.Errorf("missing FRED_API_KEY"),
		}
	}

	seriesID := strings.ToUpper(strings.TrimSpace(pair.Base.String()))
	if seriesID == "" {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("missing series id"),
		}
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 500 {
		limit = 500
	}
	cacheKey := base.StableCacheKey(seriesID, strconv.Itoa(limit))
	if c.responseCache != nil {
		var cached []gct.SeriesPoint
		if c.responseCache.Get(ctx, cacheKey, &cached) && len(cached) > 0 {
			return cached, nil
		}
	}

	query := url.Values{}
	query.Set("series_id", seriesID)
	query.Set("api_key", apiKey)
	query.Set("file_type", "json")
	query.Set("sort_order", "desc")
	query.Set("limit", fmt.Sprintf("%d", limit))
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, "/series/observations", query, nil)
	if err != nil {
		return nil, fmt.Errorf("build fred observations request for %s: %w", seriesID, err)
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		timeout := false
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			timeout = true
		}
		return nil, &gct.RequestError{
			Path:    "/series/observations",
			Timeout: timeout,
			Cause:   err,
		}
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: resp.StatusCode,
		}
	}

	var payload struct {
		Observations []struct {
			Date  string `json:"date"`
			Value string `json:"value"`
		} `json:"observations"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode fred observations: %w", err)
	}
	if len(payload.Observations) == 0 {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no observations"),
		}
	}

	series := make([]gct.SeriesPoint, 0, len(payload.Observations))
	for _, observation := range payload.Observations {
		value, parseErr := strconv.ParseFloat(strings.TrimSpace(observation.Value), 64)
		if parseErr != nil {
			continue
		}
		timestamp := time.Now().Unix()
		if parsedDate, dateErr := time.Parse("2006-01-02", observation.Date); dateErr == nil {
			timestamp = parsedDate.Unix()
		}
		series = append(series, gct.SeriesPoint{
			Timestamp: timestamp,
			Value:     value,
		})
	}

	if len(series) == 0 {
		return nil, &gct.RequestError{
			Path:       "/series/observations",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("invalid observation value"),
		}
	}
	if c.responseCache != nil {
		c.responseCache.Set(ctx, cacheKey, series)
	}

	return series, nil
}
