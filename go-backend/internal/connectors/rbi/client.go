package rbi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"net/http"
	"sort"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://data.rbi.org.in"

const (
	sessionTokenPath = "/CIMS_Gateway_DBIE/GATEWAY/SERVICES/security_generateSessionToken"
	fxReservesPath   = "/CIMS_Gateway_DBIE/GATEWAY/SERVICES/dbie_foreignExchangeReserves"
	seriesPrefix     = "RBI_DBIE_FXRES_"
	defaultChannel   = "key2"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type Client struct {
	baseClient *base.Client
}

type seriesSpec struct {
	ReserveCode   string
	CurrencyCode  string
	FrequencyAPI  string
	FrequencyNorm string
}

func NewClient(cfg Config) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 5 * time.Second
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
		return gct.Ticker{}, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}
	_, canonical, _ := normalizeSeriesSpec(pair.Base)
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
	if strings.ToLower(strings.TrimSpace(assetType)) != "macro" {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("unsupported rbi assetType")}
	}
	if c == nil || c.baseClient == nil {
		return nil, fmt.Errorf("rbi client unavailable")
	}
	spec, canonical, ok := normalizeSeriesSpec(pair.Base)
	if !ok {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusBadRequest, Cause: fmt.Errorf("invalid RBI DBIE FX reserve series")}
	}
	_ = canonical
	if limit <= 0 {
		limit = 1
	}
	if limit > 1000 {
		limit = 1000
	}

	authToken, cookieHeader, err := c.generateSessionToken(ctx)
	if err != nil {
		return nil, err
	}
	points, err := c.fetchFXReserves(ctx, spec, limit, authToken, cookieHeader)
	if err != nil {
		return nil, err
	}
	if len(points) == 0 {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}
	return points, nil
}

func (c *Client) generateSessionToken(ctx context.Context) (authHeader string, cookieHeader string, err error) {
	body := []byte(`{"body":{}}`)
	req, err := c.baseClient.NewRequest(ctx, http.MethodPost, sessionTokenPath, nil, bytes.NewReader(body))
	if err != nil {
		return "", "", fmt.Errorf("build rbi session-token request: %w", err)
	}
	applyGatewayHeaders(req)

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return "", "", &gct.RequestError{Path: sessionTokenPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return "", "", &gct.RequestError{Path: sessionTokenPath, StatusCode: resp.StatusCode}
	}

	authHeader = strings.TrimSpace(resp.Header.Get("Authorization"))
	if authHeader == "" {
		return "", "", &gct.RequestError{Path: sessionTokenPath, StatusCode: http.StatusBadGateway, Cause: fmt.Errorf("missing authorization header")}
	}
	if cookies := resp.Header.Values("Set-Cookie"); len(cookies) > 0 {
		// RBI DBIE accepts a single gateway cookie in our verified browser flow.
		cookieHeader = strings.TrimSpace(strings.SplitN(cookies[0], ";", 2)[0])
	}
	return authHeader, cookieHeader, nil
}

func (c *Client) fetchFXReserves(ctx context.Context, spec seriesSpec, limit int, authHeader, cookieHeader string) ([]gct.SeriesPoint, error) {
	endTime := time.Now().UTC()
	startTime := estimateStartTime(endTime, spec.FrequencyNorm, limit)
	payload := map[string]any{
		"body": map[string]any{
			"currencyCode": spec.CurrencyCode,
			"reserveCode":  spec.ReserveCode,
			"fromDate":     startTime.Format("2006-01-02 15:04:05"),
			"toDate":       endTime.Format("2006-01-02 15:04:05"),
			"frequency":    spec.FrequencyAPI,
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal rbi fx reserves payload: %w", err)
	}

	req, err := c.baseClient.NewRequest(ctx, http.MethodPost, fxReservesPath, nil, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build rbi fx reserves request: %w", err)
	}
	applyGatewayHeaders(req)
	req.Header.Set("Authorization", authHeader)
	if cookieHeader != "" {
		req.Header.Set("Cookie", cookieHeader)
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return nil, &gct.RequestError{Path: fxReservesPath, Cause: err}
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: resp.StatusCode}
	}

	decodedBytes, err := decodeHTMLJSONBody(resp.Body)
	if err != nil {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusBadGateway, Cause: err}
	}

	var payloadResp struct {
		Header struct {
			Status       string `json:"status"`
			ErrorCode    string `json:"errorCode"`
			ErrorMessage string `json:"errorMessage"`
		} `json:"header"`
		Body struct {
			ResultList []struct {
				TimeDate int64   `json:"timeDate"`
				Amount   float64 `json:"amount"`
			} `json:"resultList"`
		} `json:"body"`
	}
	if err := json.Unmarshal(decodedBytes, &payloadResp); err != nil {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusBadGateway, Cause: fmt.Errorf("decode rbi response: %w", err)}
	}
	if strings.EqualFold(strings.TrimSpace(payloadResp.Header.Status), "error") {
		status := http.StatusBadGateway
		if strings.TrimSpace(payloadResp.Header.ErrorCode) == "400" {
			status = http.StatusBadRequest
		}
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: status, Cause: fmt.Errorf("%s", strings.TrimSpace(payloadResp.Header.ErrorMessage))}
	}
	if len(payloadResp.Body.ResultList) == 0 {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusNotFound, Cause: fmt.Errorf("no observations")}
	}

	points := make([]gct.SeriesPoint, 0, len(payloadResp.Body.ResultList))
	for _, row := range payloadResp.Body.ResultList {
		if row.TimeDate <= 0 {
			continue
		}
		points = append(points, gct.SeriesPoint{
			Timestamp: row.TimeDate / 1000,
			Value:     row.Amount,
		})
	}
	if len(points) == 0 {
		return nil, &gct.RequestError{Path: fxReservesPath, StatusCode: http.StatusBadGateway, Cause: fmt.Errorf("no parsable observations")}
	}
	ensureLatestFirst(points)
	if len(points) > limit {
		points = points[:limit]
	}
	return points, nil
}

func applyGatewayHeaders(req *http.Request) {
	if req == nil {
		return
	}
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("datatype", "application/json")
	req.Header.Set("channelkey", defaultChannel)
	req.Header.Set("Origin", "https://data.rbi.org.in")
	req.Header.Set("Referer", "https://data.rbi.org.in/DBIE/")
}

func decodeHTMLJSONBody(r io.Reader) ([]byte, error) {
	raw, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("read response body: %w", err)
	}
	trimmed := strings.TrimSpace(string(raw))
	if trimmed == "" {
		return nil, fmt.Errorf("empty response body")
	}
	unescaped := html.UnescapeString(trimmed)
	unescaped = strings.ReplaceAll(unescaped, "\u00a0", " ")
	return []byte(unescaped), nil
}

func normalizeSeriesSpec(value string) (seriesSpec, string, bool) {
	raw := strings.ToUpper(strings.TrimSpace(value))
	raw = strings.ReplaceAll(raw, "-", "_")
	raw = strings.ReplaceAll(raw, " ", "_")
	raw = strings.TrimPrefix(raw, seriesPrefix)
	raw = strings.TrimPrefix(raw, "FXRES_")
	raw = strings.Trim(raw, "_")
	parts := strings.Split(raw, "_")
	if len(parts) < 3 {
		return seriesSpec{}, "", false
	}
	reserveCode := strings.TrimSpace(parts[0])
	currencyCode := strings.TrimSpace(parts[1])
	freqRaw := strings.TrimSpace(strings.Join(parts[2:], "_"))
	freqAPI, freqNorm, ok := normalizeFrequency(freqRaw)
	if !ok {
		return seriesSpec{}, "", false
	}
	if !isAlnum(reserveCode) || !isAlnum(currencyCode) {
		return seriesSpec{}, "", false
	}
	spec := seriesSpec{
		ReserveCode:   reserveCode,
		CurrencyCode:  currencyCode,
		FrequencyAPI:  freqAPI,
		FrequencyNorm: freqNorm,
	}
	canonical := buildSeriesID(spec)
	return spec, canonical, true
}

func normalizeFrequency(value string) (api string, norm string, ok bool) {
	f := strings.ToUpper(strings.TrimSpace(value))
	switch f {
	case "W", "WK", "WEEK", "WEEKLY":
		return "Weekly", "WEEKLY", true
	case "M", "MON", "MONTH", "MONTHLY":
		return "Monthly", "MONTHLY", true
	case "D", "DAY", "DAILY":
		return "Daily", "DAILY", true
	default:
		return "", "", false
	}
}

func buildSeriesID(spec seriesSpec) string {
	return seriesPrefix + spec.ReserveCode + "_" + spec.CurrencyCode + "_" + spec.FrequencyNorm
}

func estimateStartTime(end time.Time, frequency string, limit int) time.Time {
	if limit <= 0 {
		limit = 1
	}
	switch strings.ToUpper(strings.TrimSpace(frequency)) {
	case "DAILY":
		return end.AddDate(0, 0, -(limit + 14))
	case "MONTHLY":
		return end.AddDate(0, -(limit + 6), 0)
	case "WEEKLY":
		fallthrough
	default:
		return end.AddDate(0, 0, -((limit + 8) * 7))
	}
}

func ensureLatestFirst(points []gct.SeriesPoint) {
	sort.Slice(points, func(i, j int) bool {
		return points[i].Timestamp > points[j].Timestamp
	})
}

func isAlnum(value string) bool {
	if strings.TrimSpace(value) == "" {
		return false
	}
	for _, r := range value {
		if (r < 'A' || r > 'Z') && (r < '0' || r > '9') {
			return false
		}
	}
	return true
}

// parseTimeDateMillis is kept small/testable in case RBI changes numeric encoding.
