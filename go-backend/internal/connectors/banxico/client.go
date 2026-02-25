package banxico

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

const DefaultBaseURL = "https://www.banxico.org.mx/SieAPIRest"

const (
	defaultSeriesPath = "/service/v1/series"
	seriesPrefix      = "BANXICO_"
)

type Config struct {
	BaseURL        string
	APIToken       string
	RequestTimeout time.Duration
}

type Client struct {
	baseClient *base.Client
	apiToken   string
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
		apiToken: strings.TrimSpace(cfg.APIToken),
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	series, err := c.GetSeries(ctx, pair, assetType, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}
	seriesID, _ := normalizeSeriesID(pair.Base)
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}
	currency := seriesPrefix + seriesID
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
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("unsupported banxico assetType")}
	}
	if c == nil || c.baseClient == nil {
		return nil, fmt.Errorf("banxico client unavailable")
	}
	if c.apiToken == "" {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusUnauthorized, Cause: fmt.Errorf("missing BANXICO_API_TOKEN")}
	}
	seriesID, ok := normalizeSeriesID(pair.Base)
	if !ok {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid Banxico series id")}
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 500 {
		limit = 500
	}

	path := fmt.Sprintf("%s/%s/datos", defaultSeriesPath, seriesID)
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, path, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("build banxico request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Bmx-Token", c.apiToken)

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: defaultSeriesPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: resp.StatusCode}
	}

	var payload struct {
		BMX struct {
			Series []struct {
				IDSerie string `json:"idSerie"`
				Datos   []struct {
					Fecha string `json:"fecha"`
					Dato  string `json:"dato"`
				} `json:"datos"`
			} `json:"series"`
		} `json:"bmx"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode banxico response: %w", err)
	}
	if len(payload.BMX.Series) == 0 {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("series not found")}
	}

	rawPoints := payload.BMX.Series[0].Datos
	points := make([]gct.SeriesPoint, 0, len(rawPoints))
	for _, row := range rawPoints {
		valueStr := normalizeBanxicoNumber(row.Dato)
		value, parseErr := strconv.ParseFloat(valueStr, 64)
		if parseErr != nil {
			continue
		}
		timestamp, ok := parseBanxicoDate(row.Fecha)
		if !ok {
			timestamp = time.Now().Unix()
		}
		points = append(points, gct.SeriesPoint{Timestamp: timestamp, Value: value})
	}
	if len(points) == 0 {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid observation value")}
	}

	ensureLatestFirst(points)
	if len(points) > limit {
		points = points[:limit]
	}
	return points, nil
}

func normalizeSeriesID(value string) (string, bool) {
	raw := strings.ToUpper(strings.TrimSpace(value))
	raw = strings.ReplaceAll(raw, "-", "_")
	raw = strings.ReplaceAll(raw, " ", "_")
	raw = strings.TrimPrefix(raw, seriesPrefix)
	if raw == "" {
		return "", false
	}
	for _, r := range raw {
		if (r < 'A' || r > 'Z') && (r < '0' || r > '9') {
			return "", false
		}
	}
	return raw, true
}

func normalizeBanxicoNumber(value string) string {
	trimmed := strings.TrimSpace(value)
	trimmed = strings.ReplaceAll(trimmed, ",", "")
	return trimmed
}

func parseBanxicoDate(value string) (int64, bool) {
	trimmed := strings.TrimSpace(value)
	for _, layout := range []string{"02/01/2006", "2006-01-02"} {
		if parsed, err := time.Parse(layout, trimmed); err == nil {
			return parsed.Unix(), true
		}
	}
	return 0, false
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
