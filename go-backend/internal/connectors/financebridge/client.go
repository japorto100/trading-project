package financebridge

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
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "http://127.0.0.1:8081"

type Config struct {
	BaseURL        string
	BaseURLs       []string
	RequestTimeout time.Duration
}

type Candle struct {
	Time   int64   `json:"time"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

type OHLCVRequest struct {
	Symbol    string
	Timeframe string
	Limit     int
	Start     *int64
	End       *int64
}

type SearchResult struct {
	Symbol string `json:"symbol"`
	Name   string `json:"name"`
	Type   string `json:"type"`
}

type Quote struct {
	Symbol        string  `json:"symbol"`
	Price         float64 `json:"price"`
	Change        float64 `json:"change"`
	ChangePercent float64 `json:"changePercent"`
	High          float64 `json:"high"`
	Low           float64 `json:"low"`
	Open          float64 `json:"open"`
	Volume        float64 `json:"volume"`
	Timestamp     int64   `json:"timestamp"`
}

type Client struct {
	baseURLs    []string
	baseClients []*base.Client
}

func NewClient(cfg Config) *Client {
	baseURLs := normalizeBaseURLs(cfg.BaseURLs)
	if trimmed := strings.TrimSpace(cfg.BaseURL); trimmed != "" {
		baseURLs = append([]string{trimmed}, baseURLs...)
	}
	baseURLs = normalizeBaseURLs(baseURLs)
	if len(baseURLs) == 0 {
		baseURLs = []string{strings.TrimRight(DefaultBaseURL, "/")}
	}

	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 8 * time.Second
	}

	return &Client{
		baseURLs:    baseURLs,
		baseClients: newBaseClients(baseURLs, timeout),
	}
}

func (c *Client) GetOHLCV(ctx context.Context, req OHLCVRequest) ([]Candle, error) {
	if c == nil {
		return nil, fmt.Errorf("financebridge client unavailable")
	}
	symbol := strings.TrimSpace(req.Symbol)
	if symbol == "" {
		return nil, fmt.Errorf("symbol required")
	}

	timeframe := strings.TrimSpace(req.Timeframe)
	if timeframe == "" {
		timeframe = "1H"
	}

	limit := req.Limit
	if limit <= 0 {
		limit = 300
	}

	query := url.Values{}
	query.Set("symbol", symbol)
	query.Set("timeframe", timeframe)
	query.Set("limit", strconv.Itoa(limit))
	if req.Start != nil {
		query.Set("start", strconv.FormatInt(*req.Start, 10))
	}
	if req.End != nil {
		query.Set("end", strconv.FormatInt(*req.End, 10))
	}
	var lastErr error
	for _, client := range c.baseClients {
		httpReq, err := client.NewRequest(ctx, http.MethodGet, "/ohlcv", query, nil)
		if err != nil {
			lastErr = fmt.Errorf("build financebridge request: %w", err)
			continue
		}
		httpReq.Header.Set("Accept", "application/json")
		if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
			httpReq.Header.Set("X-Request-ID", requestID)
		}

		resp, err := client.Do(httpReq)
		if err != nil {
			lastErr = fmt.Errorf("financebridge ohlcv request failed: %w", err)
			continue
		}

		if resp.StatusCode >= http.StatusBadRequest {
			status := resp.StatusCode
			_ = resp.Body.Close()
			if status < http.StatusInternalServerError {
				return nil, fmt.Errorf("financebridge ohlcv upstream status %d", status)
			}
			lastErr = fmt.Errorf("financebridge ohlcv upstream status %d", status)
			continue
		}

		var payload struct {
			Data []Candle `json:"data"`
		}
		decodeErr := json.NewDecoder(resp.Body).Decode(&payload)
		_ = resp.Body.Close()
		if decodeErr != nil {
			lastErr = fmt.Errorf("decode financebridge ohlcv response: %w", decodeErr)
			continue
		}
		if payload.Data == nil {
			payload.Data = []Candle{}
		}
		return payload.Data, nil
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("financebridge ohlcv request failed")
	}
	return nil, lastErr
}

func (c *Client) Search(ctx context.Context, query string) ([]SearchResult, error) {
	if c == nil {
		return nil, fmt.Errorf("financebridge client unavailable")
	}
	q := strings.TrimSpace(query)
	if q == "" {
		return nil, fmt.Errorf("query required")
	}

	params := url.Values{}
	params.Set("q", q)
	httpReq, err := c.primaryClient().NewRequest(ctx, http.MethodGet, "/search", params, nil)
	if err != nil {
		return nil, fmt.Errorf("build financebridge search request: %w", err)
	}
	httpReq.Header.Set("Accept", "application/json")
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		httpReq.Header.Set("X-Request-ID", requestID)
	}

	resp, err := c.primaryClient().Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("financebridge search request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("financebridge search upstream status %d", resp.StatusCode)
	}

	var payload struct {
		Data []SearchResult `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode financebridge search response: %w", err)
	}
	if payload.Data == nil {
		payload.Data = []SearchResult{}
	}
	return payload.Data, nil
}

func (c *Client) GetQuote(ctx context.Context, symbol string) (Quote, error) {
	if c == nil {
		return Quote{}, fmt.Errorf("financebridge client unavailable")
	}
	s := strings.TrimSpace(symbol)
	if s == "" {
		return Quote{}, fmt.Errorf("symbol required")
	}

	params := url.Values{}
	params.Set("symbol", s)
	httpReq, err := c.primaryClient().NewRequest(ctx, http.MethodGet, "/quote", params, nil)
	if err != nil {
		return Quote{}, fmt.Errorf("build financebridge quote request: %w", err)
	}
	httpReq.Header.Set("Accept", "application/json")
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		httpReq.Header.Set("X-Request-ID", requestID)
	}

	resp, err := c.primaryClient().Do(httpReq)
	if err != nil {
		return Quote{}, fmt.Errorf("financebridge quote request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return Quote{}, fmt.Errorf("financebridge quote upstream status %d", resp.StatusCode)
	}

	var payload struct {
		Data Quote `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return Quote{}, fmt.Errorf("decode financebridge quote response: %w", err)
	}
	return payload.Data, nil
}

func (c *Client) primaryClient() *base.Client {
	if c != nil && len(c.baseClients) > 0 && c.baseClients[0] != nil {
		return c.baseClients[0]
	}
	return base.NewClient(base.Config{
		BaseURL:    DefaultBaseURL,
		Timeout:    8 * time.Second,
		RetryCount: 0,
	})
}

func normalizeBaseURLs(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	out := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		trimmed := strings.TrimRight(strings.TrimSpace(value), "/")
		if trimmed == "" {
			continue
		}
		if _, exists := seen[trimmed]; exists {
			continue
		}
		seen[trimmed] = struct{}{}
		out = append(out, trimmed)
	}
	return out
}

func newBaseClients(baseURLs []string, timeout time.Duration) []*base.Client {
	if len(baseURLs) == 0 {
		return nil
	}
	clients := make([]*base.Client, 0, len(baseURLs))
	for _, baseURL := range baseURLs {
		clients = append(clients, base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 0,
		}))
	}
	return clients
}
