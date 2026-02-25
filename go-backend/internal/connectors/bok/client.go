package bok

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

const DefaultBaseURL = "https://ecos.bok.or.kr"

const (
	defaultStatisticPath = "/api/StatisticSearch"
	seriesPrefix         = "BOK_ECOS_"
	defaultLanguage      = "en"
)

type Config struct {
	BaseURL        string
	APIKey         string
	RequestTimeout time.Duration
}

type Client struct {
	baseClient *base.Client
	apiKey     string
}

type seriesSpec struct {
	StatCode  string
	Cycle     string
	ItemCode1 string
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
		baseClient: base.NewClient(base.Config{BaseURL: baseURL, Timeout: timeout, RetryCount: 1}),
		apiKey:     strings.TrimSpace(cfg.APIKey),
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	series, err := c.GetSeries(ctx, pair, assetType, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{Path: defaultStatisticPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}
	spec, _ := parseSeriesSpec(pair.Base)
	currency := buildSeriesID(spec)
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}
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
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("unsupported bok assetType")}
	}
	if c == nil || c.baseClient == nil {
		return nil, fmt.Errorf("bok client unavailable")
	}
	if strings.TrimSpace(c.apiKey) == "" {
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: http.StatusUnauthorized, Cause: fmt.Errorf("missing BOK_ECOS_API_KEY")}
	}
	spec, ok := parseSeriesSpec(pair.Base)
	if !ok {
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid BOK ECOS series id")}
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 500 {
		limit = 500
	}

	endTime := time.Now().UTC()
	startTime := estimateStartTime(endTime, spec.Cycle, limit)
	startCode, endCode, ok := formatRange(spec.Cycle, startTime, endTime)
	if !ok {
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("unsupported BOK ECOS cycle")}
	}

	path := fmt.Sprintf("%s/%s/json/%s/1/%d/%s/%s/%s/%s/%s", defaultStatisticPath, c.apiKey, defaultLanguage, limit, spec.StatCode, spec.Cycle, startCode, endCode, spec.ItemCode1)
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, path, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("build bok request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: defaultStatisticPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: resp.StatusCode}
	}

	var payload struct {
		Result *struct {
			Code    string `json:"CODE"`
			Message string `json:"MESSAGE"`
		} `json:"RESULT"`
		StatisticSearch *struct {
			Rows []struct {
				Time      string `json:"TIME"`
				DataValue string `json:"DATA_VALUE"`
			} `json:"row"`
		} `json:"StatisticSearch"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode bok response: %w", err)
	}
	if payload.Result != nil && payload.Result.Code != "" {
		status := http.StatusBadGateway
		if strings.EqualFold(payload.Result.Code, "INFO-100") {
			status = http.StatusUnauthorized
		}
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: status, Cause: fmt.Errorf("%s", payload.Result.Message)}
	}
	if payload.StatisticSearch == nil || len(payload.StatisticSearch.Rows) == 0 {
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}

	points := make([]gct.SeriesPoint, 0, len(payload.StatisticSearch.Rows))
	for _, row := range payload.StatisticSearch.Rows {
		value, parseErr := strconv.ParseFloat(strings.TrimSpace(row.DataValue), 64)
		if parseErr != nil {
			continue
		}
		ts, ok := parseECOSTime(spec.Cycle, row.Time)
		if !ok {
			ts = time.Now().Unix()
		}
		points = append(points, gct.SeriesPoint{Timestamp: ts, Value: value})
	}
	if len(points) == 0 {
		return nil, &gct.RequestError{Path: defaultStatisticPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid observation value")}
	}
	ensureLatestFirst(points)
	if len(points) > limit {
		points = points[:limit]
	}
	return points, nil
}

func parseSeriesSpec(value string) (seriesSpec, bool) {
	raw := strings.ToUpper(strings.TrimSpace(value))
	raw = strings.ReplaceAll(raw, "-", "_")
	raw = strings.ReplaceAll(raw, " ", "_")
	raw = strings.TrimPrefix(raw, seriesPrefix)
	parts := strings.Split(raw, "_")
	if len(parts) < 3 {
		return seriesSpec{}, false
	}
	spec := seriesSpec{
		StatCode:  strings.TrimSpace(parts[0]),
		Cycle:     strings.TrimSpace(parts[1]),
		ItemCode1: strings.TrimSpace(parts[2]),
	}
	if spec.StatCode == "" || spec.Cycle == "" || spec.ItemCode1 == "" {
		return seriesSpec{}, false
	}
	for _, token := range []string{spec.StatCode, spec.Cycle, spec.ItemCode1} {
		for _, r := range token {
			if (r < 'A' || r > 'Z') && (r < '0' || r > '9') {
				return seriesSpec{}, false
			}
		}
	}
	return spec, true
}

func buildSeriesID(spec seriesSpec) string {
	return seriesPrefix + spec.StatCode + "_" + spec.Cycle + "_" + spec.ItemCode1
}

func estimateStartTime(end time.Time, cycle string, limit int) time.Time {
	switch strings.ToUpper(strings.TrimSpace(cycle)) {
	case "D":
		return end.AddDate(0, 0, -(limit + 10))
	case "A":
		return end.AddDate(-(limit + 2), 0, 0)
	case "Q":
		return end.AddDate(0, -(limit+2)*3, 0)
	case "M":
		fallthrough
	default:
		return end.AddDate(0, -(limit + 6), 0)
	}
}

func formatRange(cycle string, start, end time.Time) (string, string, bool) {
	switch strings.ToUpper(strings.TrimSpace(cycle)) {
	case "D":
		return start.Format("20060102"), end.Format("20060102"), true
	case "M":
		return start.Format("200601"), end.Format("200601"), true
	case "A":
		return start.Format("2006"), end.Format("2006"), true
	case "Q":
		return quarterCode(start), quarterCode(end), true
	default:
		return "", "", false
	}
}

func quarterCode(t time.Time) string {
	q := int((t.Month()-1)/3) + 1
	return fmt.Sprintf("%dQ%d", t.Year(), q)
}

func parseECOSTime(cycle, value string) (int64, bool) {
	v := strings.TrimSpace(value)
	switch strings.ToUpper(strings.TrimSpace(cycle)) {
	case "D":
		if ts, err := time.Parse("20060102", v); err == nil {
			return ts.Unix(), true
		}
	case "M":
		if ts, err := time.Parse("200601", v); err == nil {
			return ts.Unix(), true
		}
	case "A":
		if ts, err := time.Parse("2006", v); err == nil {
			return ts.Unix(), true
		}
	case "Q":
		if len(v) == 6 && v[4] == 'Q' {
			year, yErr := strconv.Atoi(v[:4])
			quarter, qErr := strconv.Atoi(v[5:])
			if yErr == nil && qErr == nil && quarter >= 1 && quarter <= 4 {
				month := time.Month((quarter-1)*3 + 1)
				return time.Date(year, month, 1, 0, 0, 0, 0, time.UTC).Unix(), true
			}
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
