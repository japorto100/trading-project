// Package oecd provides OECD SDMX connector. Phase 14a.2.
// Ref: REFERENCE_SOURCE_STATUS.md, OECD Stats API
// OECD REST SDMX: https://stats.oecd.org/restsdmx/sdmx.ashx/GetData/<dataset>/<dimensions>
package oecd

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://stats.oecd.org/restsdmx/sdmx.ashx"

const (
	seriesPrefix       = "OECD_"
	defaultDataflowMEI = "MEI"
	defaultSeriesPath  = "GetData/MEI"
	// MEI dimensions: LOCATION, SUBJECT, MEASURE, FREQUENCY
	// Default: USA GDP index quarterly
	defaultMEIKey = "USA.GDP.IDX.Q"
)

var meiDimensionOrder = []string{"LOCATION", "SUBJECT", "MEASURE", "FREQUENCY"}

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	httpClient  *base.Client
	meiSDMX     *base.SDMXClient
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
		meiSDMX: base.NewSDMXClient(base.SDMXConfig{
			HTTPClient:             httpClient,
			DataflowID:             defaultDataflowMEI,
			Provider:               base.SDMXProviderOECD,
			DimensionOrder:         meiDimensionOrder,
			Format:                 "jsondata",
			DimensionAtObservation: "TIME_PERIOD",
			DataPathPrefix:         "GetData",
			PathSuffix:             "OECD",
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
		canonical = seriesPrefix + strings.ReplaceAll(defaultMEIKey, ".", "_")
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
			Cause:      fmt.Errorf("unsupported oecd assetType"),
		}
	}
	if c == nil || c.meiSDMX == nil {
		return nil, fmt.Errorf("oecd sdmx client unavailable")
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

	points, err := c.meiSDMX.GetSeries(ctx, dims, "", "")
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
		return nil, "", fmt.Errorf("invalid OECD MEI symbol")
	}
	payload := strings.TrimPrefix(canonical, seriesPrefix)
	payload = strings.ReplaceAll(payload, ".", "_")
	parts := strings.Split(payload, "_")
	if len(parts) != len(meiDimensionOrder) {
		return nil, "", fmt.Errorf("invalid OECD MEI symbol: expected LOCATION_SUBJECT_MEASURE_FREQUENCY (e.g. USA_GDP_IDX_Q)")
	}
	dims := make(map[string]string, len(meiDimensionOrder))
	for idx, dimKey := range meiDimensionOrder {
		part := strings.TrimSpace(strings.ToUpper(parts[idx]))
		if part == "" {
			part = "."
		}
		for _, r := range part {
			if (r < 'A' || r > 'Z') && (r < '0' || r > '9') && r != '_' && r != '.' {
				return nil, "", fmt.Errorf("invalid OECD MEI key segment")
			}
		}
		dims[dimKey] = part
	}
	canonical = seriesPrefix + strings.Join(parts, "_")
	return dims, canonical, nil
}

func normalizeCanonical(raw string) string {
	value := strings.ToUpper(strings.TrimSpace(raw))
	if value == "" {
		return ""
	}
	value = strings.ReplaceAll(value, " ", "_")
	value = strings.ReplaceAll(value, "-", "_")
	if value == "GDP" || value == "DEFAULT" || value == "POLICY_RATE" {
		return seriesPrefix + strings.ReplaceAll(defaultMEIKey, ".", "_")
	}
	if strings.HasPrefix(value, seriesPrefix) {
		return value
	}
	if strings.HasPrefix(value, "OECD_") {
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
