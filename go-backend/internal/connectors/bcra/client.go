package bcra

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://api.bcra.gob.ar"

const (
	defaultPath  = "/estadisticas/v4.0/Monetarias"
	seriesPrefix = "BCRA_"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	baseClient *base.Client
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
	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 1,
		}),
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	series, err := c.GetSeries(ctx, pair, assetType, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{Path: defaultPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}
	id, _ := normalizeSeriesID(pair.Base)
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}
	currency := seriesPrefix + strconv.Itoa(id)
	return gct.Ticker{
		Pair:        gct.Pair{Base: currency, Quote: "USD"},
		Currency:    currency,
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
		return nil, &gct.RequestError{Path: defaultPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("unsupported bcra assetType")}
	}
	if c == nil || c.baseClient == nil {
		return nil, fmt.Errorf("bcra client unavailable")
	}
	seriesID, ok := normalizeSeriesID(pair.Base)
	if !ok {
		return nil, &gct.RequestError{Path: defaultPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid BCRA series id")}
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 1000 {
		limit = 1000
	}

	path := fmt.Sprintf("%s/%d", defaultPath, seriesID)
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, path, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("build bcra request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: defaultPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{Path: defaultPath, StatusCode: resp.StatusCode}
	}

	var payload struct {
		Status   int `json:"status"`
		Metadata struct {
			Resultset struct {
				Count int `json:"count"`
				Limit int `json:"limit"`
			} `json:"resultset"`
		} `json:"metadata"`
		Results []struct {
			IDVariable int `json:"idVariable"`
			Detalle    []struct {
				Fecha string  `json:"fecha"`
				Valor float64 `json:"valor"`
			} `json:"detalle"`
		} `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode bcra response: %w", err)
	}
	if payload.Status != 0 && payload.Status != 200 {
		return nil, &gct.RequestError{Path: defaultPath, StatusCode: http.StatusBadGateway, Cause: fmt.Errorf("bcra api status %d", payload.Status)}
	}
	if len(payload.Results) == 0 || len(payload.Results[0].Detalle) == 0 {
		return nil, &gct.RequestError{Path: defaultPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}

	points := make([]gct.SeriesPoint, 0, len(payload.Results[0].Detalle))
	for _, row := range payload.Results[0].Detalle {
		parsedDate, dateErr := base.ParseSeriesTime(base.DateFormatISODate, row.Fecha)
		ts := time.Now().Unix()
		if dateErr == nil {
			ts = parsedDate.Unix()
		}
		points = append(points, gct.SeriesPoint{
			Timestamp: ts,
			Value:     row.Valor,
		})
	}
	if len(points) == 0 {
		return nil, &gct.RequestError{Path: defaultPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid observation value")}
	}
	// BCRA endpoint currently returns latest-first; normalize only if order drifts.
	ensureLatestFirst(points)
	if len(points) > limit {
		points = points[:limit]
	}
	return points, nil
}

func normalizeSeriesID(value string) (int, bool) {
	raw := strings.ToUpper(strings.TrimSpace(value))
	raw = strings.ReplaceAll(raw, "-", "_")
	raw = strings.ReplaceAll(raw, " ", "_")
	raw = strings.TrimPrefix(raw, seriesPrefix)
	if raw == "" {
		return 0, false
	}
	for _, r := range raw {
		if r < '0' || r > '9' {
			return 0, false
		}
	}
	id, err := strconv.Atoi(raw)
	if err != nil || id <= 0 {
		return 0, false
	}
	return id, true
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
