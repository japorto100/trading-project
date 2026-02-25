package ecbsdmx

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://data-api.ecb.europa.eu/service"

const (
	defaultDataflowFM    = "FM"
	defaultSeriesPath    = "/data/FM"
	seriesPrefix         = "ECB_SDMX_"
	defaultPolicyRateKey = "M.U2.EUR.4F.KR.MRR_FR.LEV"
)

var fmDimensionOrder = []string{"D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"}

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	httpClient  *base.Client
	fmSDMX      *base.SDMXClient
	defaultPath string
}

func NewClient(cfg Config) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}
	httpClient := base.NewClient(base.Config{
		BaseURL:    baseURL,
		Timeout:    timeout,
		RetryCount: 1,
	})
	return &Client{
		httpClient: httpClient,
		fmSDMX: base.NewSDMXClient(base.SDMXConfig{
			HTTPClient:             httpClient,
			DataflowID:             defaultDataflowFM,
			Provider:               base.SDMXProviderECB,
			DimensionOrder:         fmDimensionOrder,
			Format:                 "jsondata",
			DimensionAtObservation: "TIME_PERIOD",
			DataPathPrefix:         "/data",
		}),
		defaultPath: defaultSeriesPath,
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
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
	canonical := normalizeCanonical(pair.Base)
	if canonical == "" {
		canonical = seriesPrefix + defaultDataflowFM + "_" + defaultPolicyRateKey
	}
	return gct.Ticker{
		Pair:        gct.Pair{Base: canonical, Quote: "USD"},
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

func (c *Client) GetSeries(ctx context.Context, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	if strings.ToLower(strings.TrimSpace(assetType)) != "macro" {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported ecb_sdmx assetType"),
		}
	}
	if c == nil || c.fmSDMX == nil {
		return nil, fmt.Errorf("ecb sdmx client unavailable")
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 1000 {
		limit = 1000
	}

	flow, dims, canonical, err := parseSeriesSymbol(pair.Base)
	if err != nil {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      err,
		}
	}
	if flow != defaultDataflowFM {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported ECB SDMX dataflow %s", flow),
		}
	}

	points, err := c.fmSDMX.GetSeries(ctx, dims, "", "")
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

func parseSeriesSymbol(raw string) (string, map[string]string, string, error) {
	canonical := normalizeCanonical(raw)
	if canonical == "" {
		return "", nil, "", fmt.Errorf("invalid ECB SDMX symbol")
	}
	payload := strings.TrimPrefix(canonical, seriesPrefix)
	parts := strings.SplitN(payload, "_", 2)
	if len(parts) != 2 {
		return "", nil, "", fmt.Errorf("invalid ECB SDMX symbol")
	}
	flow := strings.ToUpper(strings.TrimSpace(parts[0]))
	key := strings.TrimSpace(parts[1])
	if flow == "" || key == "" {
		return "", nil, "", fmt.Errorf("invalid ECB SDMX symbol")
	}
	for _, r := range flow {
		if (r < 'A' || r > 'Z') && (r < '0' || r > '9') {
			return "", nil, "", fmt.Errorf("invalid ECB SDMX flow")
		}
	}
	keyParts := strings.Split(key, ".")
	if len(keyParts) != len(fmDimensionOrder) {
		return "", nil, "", fmt.Errorf("unsupported ECB SDMX key cardinality")
	}
	dims := make(map[string]string, len(fmDimensionOrder))
	for idx, dimKey := range fmDimensionOrder {
		part := strings.TrimSpace(strings.ToUpper(keyParts[idx]))
		if part == "" {
			part = "."
		}
		for _, r := range part {
			if (r < 'A' || r > 'Z') && (r < '0' || r > '9') && r != '_' && r != '.' {
				return "", nil, "", fmt.Errorf("invalid ECB SDMX key segment")
			}
		}
		dims[dimKey] = part
		keyParts[idx] = part
	}
	canonical = seriesPrefix + flow + "_" + strings.Join(keyParts, ".")
	return flow, dims, canonical, nil
}

func normalizeCanonical(raw string) string {
	value := strings.ToUpper(strings.TrimSpace(raw))
	if value == "" {
		return ""
	}
	value = strings.ReplaceAll(value, " ", "_")
	value = strings.ReplaceAll(value, "-", "_")
	if value == "POLICY_RATE" || value == "DEFAULT" {
		return seriesPrefix + defaultDataflowFM + "_" + defaultPolicyRateKey
	}
	if strings.HasPrefix(value, seriesPrefix) {
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
