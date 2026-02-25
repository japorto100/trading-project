package tcmb

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

import "tradeviewfusion/go-backend/internal/connectors/base"

const DefaultBaseURL = "https://evds3.tcmb.gov.tr"

const (
	defaultSeriesPath = "/igmevdsms-dis/fe"
	seriesPrefix      = "TCMB_EVDS_"
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
	apiCode, canonical, ok := normalizeSeriesCode(pair.Base)
	if !ok {
		return gct.Ticker{}, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid TCMB series code")}
	}
	series, err := c.getSeries(ctx, apiCode, assetType, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}
	value := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
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
	apiCode, _, ok := normalizeSeriesCode(pair.Base)
	if !ok {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid TCMB series code")}
	}
	return c.getSeries(ctx, apiCode, assetType, limit)
}

func (c *Client) getSeries(ctx context.Context, apiCode, assetType string, limit int) ([]gct.SeriesPoint, error) {
	if strings.ToLower(strings.TrimSpace(assetType)) != "macro" {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("unsupported tcmb assetType")}
	}
	if c == nil || c.baseClient == nil {
		return nil, fmt.Errorf("tcmb client unavailable")
	}
	if limit <= 0 {
		limit = 1
	}
	if limit > 1000 {
		limit = 1000
	}

	endTime := time.Now().UTC()
	startTime := endTime.AddDate(-60, 0, 0)
	payload := map[string]any{
		"type":             "json",
		"series":           apiCode,
		"aggregationTypes": "last",
		"formulas":         "0",
		"startDate":        startTime.Format("02-01-2006"),
		"endDate":          endTime.Format("02-01-2006"),
		"frequency":        "0", // original frequency
		"decimalSeperator": ".",
		"decimal":          "2",
		"dateFormat":       "0",
		"lang":             "tr",
		"yon":              "0",
		"sira":             "0",
		"ozelFormuller":    []any{},
		"groupSeperator":   true,
		"isRaporSayfasi":   false,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal tcmb payload: %w", err)
	}

	req, err := c.baseClient.NewRequest(ctx, http.MethodPost, defaultSeriesPath, nil, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build tcmb request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: defaultSeriesPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: resp.StatusCode}
	}

	var decoded struct {
		TotalCount int                          `json:"totalCount"`
		Items      []map[string]json.RawMessage `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&decoded); err != nil {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadGateway, Cause: fmt.Errorf("decode tcmb response: %w", err)}
	}
	if len(decoded.Items) == 0 {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}

	valueKey := responseSeriesValueKey(decoded.Items[0], apiCode)
	if valueKey == "" {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadGateway, Cause: fmt.Errorf("missing series value field")}
	}

	points := make([]gct.SeriesPoint, 0, len(decoded.Items))
	for _, row := range decoded.Items {
		value, ok := parseTCMBValue(row[valueKey])
		if !ok {
			continue
		}
		ts, ok := parseTCMBUnixTime(row["UNIXTIME"])
		if !ok {
			ts, _ = parseTCMBDate(row["Tarih"])
		}
		if ts <= 0 {
			ts = time.Now().Unix()
		}
		points = append(points, gct.SeriesPoint{Timestamp: ts, Value: value})
	}
	if len(points) == 0 {
		return nil, &gct.RequestError{Path: defaultSeriesPath, StatusCode: http.StatusBadGateway, Cause: fmt.Errorf("no parsable observations")}
	}
	ensureLatestFirst(points)
	if len(points) > limit {
		points = points[:limit]
	}
	return points, nil
}

func normalizeSeriesCode(value string) (apiCode string, canonical string, ok bool) {
	raw := strings.ToUpper(strings.TrimSpace(value))
	if raw == "" {
		return "", "", false
	}
	raw = strings.TrimPrefix(raw, seriesPrefix)
	raw = strings.ReplaceAll(raw, " ", "_")
	raw = strings.ReplaceAll(raw, "-", "_")
	raw = strings.Trim(raw, "._")
	if raw == "" {
		return "", "", false
	}
	raw = strings.ReplaceAll(raw, "__", "_")
	if strings.Contains(raw, ".") {
		apiCode = raw
	} else {
		apiCode = strings.ReplaceAll(raw, "_", ".")
	}
	apiCode = strings.Trim(apiCode, ".")
	if apiCode == "" {
		return "", "", false
	}
	for _, r := range apiCode {
		if (r < 'A' || r > 'Z') && (r < '0' || r > '9') && r != '.' && r != '_' {
			return "", "", false
		}
	}
	canonical = seriesPrefix + strings.ReplaceAll(apiCode, ".", "_")
	return apiCode, canonical, true
}

func responseSeriesValueKey(row map[string]json.RawMessage, apiCode string) string {
	want := strings.ReplaceAll(strings.ToUpper(strings.TrimSpace(apiCode)), ".", "_")
	if _, ok := row[want]; ok {
		return want
	}
	for key := range row {
		upper := strings.ToUpper(strings.TrimSpace(key))
		if upper == "TARIH" || upper == "UNIXTIME" || strings.HasPrefix(upper, "YEAR") {
			continue
		}
		return key
	}
	return ""
}

func parseTCMBValue(raw json.RawMessage) (float64, bool) {
	var asString string
	if err := json.Unmarshal(raw, &asString); err == nil {
		norm := strings.ReplaceAll(strings.TrimSpace(asString), ",", "")
		if norm == "" {
			return 0, false
		}
		value, parseErr := strconv.ParseFloat(norm, 64)
		if parseErr == nil {
			return value, true
		}
	}
	var asFloat float64
	if err := json.Unmarshal(raw, &asFloat); err == nil {
		return asFloat, true
	}
	return 0, false
}

func parseTCMBUnixTime(raw json.RawMessage) (int64, bool) {
	if len(raw) == 0 {
		return 0, false
	}
	var wrapped struct {
		NumberLong string `json:"$numberLong"`
	}
	if err := json.Unmarshal(raw, &wrapped); err != nil {
		return 0, false
	}
	if wrapped.NumberLong == "" {
		return 0, false
	}
	parsed, err := strconv.ParseInt(wrapped.NumberLong, 10, 64)
	if err != nil {
		return 0, false
	}
	return parsed, true
}

func parseTCMBDate(raw json.RawMessage) (int64, bool) {
	if len(raw) == 0 {
		return 0, false
	}
	var value string
	if err := json.Unmarshal(raw, &value); err != nil {
		return 0, false
	}
	value = strings.TrimSpace(value)
	for _, layout := range []string{"02-01-2006", "2006-01", "2006"} {
		if parsed, err := time.Parse(layout, value); err == nil {
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
