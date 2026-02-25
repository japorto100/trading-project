package bcb

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://api.bcb.gov.br"

const (
	defaultPathPrefix = "/dados/serie"
	defaultPath       = "/dados/serie/bcdata.sgs"
	seriesPrefix      = "BCB_SGS_"
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
		return gct.Ticker{}, &gct.RequestError{
			Path:       defaultPath,
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no observations"),
		}
	}
	seriesID, _ := normalizeSeriesID(pair.Base)
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}
	return gct.Ticker{
		Pair:        gct.Pair{Base: seriesPrefix + seriesID, Quote: "USD"},
		Currency:    seriesPrefix + seriesID,
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
			Path:       defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported bcb assetType"),
		}
	}
	if c == nil || c.baseClient == nil {
		return nil, fmt.Errorf("bcb client unavailable")
	}
	seriesID, ok := normalizeSeriesID(pair.Base)
	if !ok {
		return nil, &gct.RequestError{
			Path:       defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("invalid BCB series id"),
		}
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 500 {
		limit = 500
	}

	path := fmt.Sprintf("%s/bcdata.sgs.%s/dados/ultimos/%d", defaultPathPrefix, seriesID, limit)
	query := url.Values{}
	query.Set("formato", "json")
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, path, query, nil)
	if err != nil {
		return nil, fmt.Errorf("build bcb request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: defaultPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{
			Path:       defaultPath,
			StatusCode: resp.StatusCode,
		}
	}

	var payload []struct {
		Date  string `json:"data"`
		Value string `json:"valor"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode bcb response: %w", err)
	}
	points := make([]gct.SeriesPoint, 0, len(payload))
	for _, row := range payload {
		valueStr := strings.TrimSpace(strings.ReplaceAll(row.Value, ",", "."))
		value, parseErr := strconv.ParseFloat(valueStr, 64)
		if parseErr != nil {
			continue
		}
		timestamp := time.Now().Unix()
		if parsedDate, dateErr := time.Parse("02/01/2006", strings.TrimSpace(row.Date)); dateErr == nil {
			timestamp = parsedDate.Unix()
		}
		points = append(points, gct.SeriesPoint{
			Timestamp: timestamp,
			Value:     value,
		})
	}
	if len(points) == 0 {
		return nil, &gct.RequestError{
			Path:       defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("invalid observation value"),
		}
	}
	// BCB often returns ascending order; normalize to latest-first to match FRED expectations.
	reverseSeries(points)
	return points, nil
}

func normalizeSeriesID(value string) (string, bool) {
	raw := strings.ToUpper(strings.TrimSpace(value))
	raw = strings.ReplaceAll(raw, "-", "_")
	raw = strings.ReplaceAll(raw, " ", "_")
	raw = strings.TrimPrefix(raw, seriesPrefix)
	raw = strings.TrimPrefix(raw, "SGS_")
	raw = strings.TrimPrefix(raw, "BCDATA.SGS.")
	if raw == "" {
		return "", false
	}
	for _, r := range raw {
		if r < '0' || r > '9' {
			return "", false
		}
	}
	return raw, true
}

func reverseSeries(values []gct.SeriesPoint) {
	for i, j := 0, len(values)-1; i < j; i, j = i+1, j-1 {
		values[i], values[j] = values[j], values[i]
	}
}
