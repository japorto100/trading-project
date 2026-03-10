// Package worldbank provides World Bank SDMX connector. Phase 14a.2.
// Ref: REFERENCE_SOURCE_STATUS.md, https://datahelpdesk.worldbank.org/knowledgebase/articles/1886701-sdmx-api-queries
// WDI: World Development Indicators. Dimensions: FREQ, SERIES, REF_AREA (country)
package worldbank

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

const DefaultBaseURL = "https://api.worldbank.org/v2/sdmx/rest"

const (
	seriesPrefix       = "WB_WDI_"
	defaultDataflowWDI = "WDI"
	defaultSeriesPath  = "data/WDI"
	// WDI dimensions: FREQ, SERIES, REF_AREA. A=annual. SP_POP_TOTL=population, USA=United States
	defaultWDIKey = "A.SP_POP_TOTL.USA"
)

var wdiDimensionOrder = []string{"FREQ", "SERIES", "REF_AREA"}

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	httpClient  *base.Client
	wdiSDMX     *base.SDMXClient
	defaultPath string
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
	httpClient := base.NewClient(base.Config{
		BaseURL:    baseURL,
		Timeout:    timeout,
		RetryCount: 1,
	})
	return &Client{
		httpClient: httpClient,
		wdiSDMX: base.NewSDMXClient(base.SDMXConfig{
			HTTPClient:             httpClient,
			DataflowID:             defaultDataflowWDI,
			Provider:               base.SDMXProviderWorldBank,
			DimensionOrder:         wdiDimensionOrder,
			Format:                 "jsondata",
			DimensionAtObservation: "TIME_PERIOD",
			DataPathPrefix:         "data",
		}),
		defaultPath: defaultSeriesPath,
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
	if canonical == "" {
		canonical = seriesPrefix + strings.ReplaceAll(defaultWDIKey, ".", "_")
	}
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
			Cause:      fmt.Errorf("unsupported worldbank assetType"),
		}
	}
	if c == nil || c.wdiSDMX == nil {
		return nil, fmt.Errorf("worldbank sdmx client unavailable")
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 1000 {
		limit = 1000
	}

	dims, canonical, err := parseSeriesSymbol(pair.Base.String())
	if err != nil {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      err,
		}
	}

	points, err := c.wdiSDMX.GetSeries(ctx, dims, "", "")
	if err != nil {
		return nil, mapSDMXError(c.defaultPath, err)
	}
	converted := make([]gct.SeriesPoint, 0, len(points))
	for _, point := range points {
		ts := point.Time.UTC().Unix()
		if ts <= 0 {
			continue
		}
		converted = append(converted, gct.SeriesPoint{
			Timestamp: ts,
			Value:     point.Value,
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
	return converted, nil
}

func mapSDMXError(path string, err error) error {
	var reqErr *base.RequestError
	if errors.As(err, &reqErr) {
		return &gct.RequestError{
			Path:       path,
			StatusCode: reqErr.StatusCode,
			Cause:      fmt.Errorf("%s", reqErr.Error()),
		}
	}
	return &gct.RequestError{Path: path, Cause: err}
}

func parseSeriesSymbol(raw string) (map[string]string, string, error) {
	canonical := normalizeCanonical(raw)
	if canonical == "" {
		return nil, "", fmt.Errorf("invalid World Bank WDI symbol")
	}
	payload := strings.TrimPrefix(canonical, seriesPrefix)
	payload = strings.ReplaceAll(payload, ".", "_")
	parts := strings.Split(payload, "_")
	if len(parts) < len(wdiDimensionOrder) {
		return nil, "", fmt.Errorf("invalid WB WDI symbol: expected FREQ_SERIES_REF_AREA (e.g. A_SP_POP_TOTL_USA)")
	}
	freq := strings.TrimSpace(strings.ToUpper(parts[0]))
	refArea := strings.TrimSpace(strings.ToUpper(parts[len(parts)-1]))
	series := strings.TrimSpace(strings.ToUpper(strings.Join(parts[1:len(parts)-1], "_")))
	if freq == "" || series == "" || refArea == "" {
		return nil, "", fmt.Errorf("invalid WB WDI symbol: expected FREQ_SERIES_REF_AREA (e.g. A_SP_POP_TOTL_USA)")
	}
	dims := make(map[string]string, len(wdiDimensionOrder))
	dims["FREQ"] = freq
	dims["SERIES"] = series
	dims["REF_AREA"] = refArea
	canonical = seriesPrefix + strings.Join([]string{freq, series, refArea}, "_")
	return dims, canonical, nil
}

func normalizeCanonical(raw string) string {
	value := strings.ToUpper(strings.TrimSpace(raw))
	if value == "" {
		return ""
	}
	value = strings.ReplaceAll(value, " ", "_")
	value = strings.ReplaceAll(value, "-", "_")
	if value == "POPULATION" || value == "DEFAULT" || value == "GDP" {
		return seriesPrefix + strings.ReplaceAll(defaultWDIKey, ".", "_")
	}
	if strings.HasPrefix(value, seriesPrefix) {
		return value
	}
	if strings.HasPrefix(value, "WB_") {
		return value
	}
	return seriesPrefix + value
}

func ensureLatestFirst(points []gct.SeriesPoint) {
	if len(points) < 2 {
		return
	}
	if points[0].Timestamp >= points[len(points)-1].Timestamp {
		return
	}
	for i, j := 0, len(points)-1; i < j; i, j = i+1, j-1 {
		points[i], points[j] = points[j], points[i]
	}
}
