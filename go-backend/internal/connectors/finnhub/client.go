package finnhub

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultBaseURL = "https://finnhub.io/api/v1"

type Config struct {
	BaseURL        string
	APIKey         string
	RequestTimeout time.Duration
}

type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

func NewClient(cfg Config) *Client {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}

	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	baseURL = strings.TrimRight(baseURL, "/")

	return &Client{
		baseURL: baseURL,
		apiKey:  strings.TrimSpace(cfg.APIKey),
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	if strings.ToLower(strings.TrimSpace(assetType)) != "equity" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported finnhub assetType"),
		}
	}
	if c.apiKey == "" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusUnauthorized,
			Cause:      fmt.Errorf("missing FINNHUB_API_KEY"),
		}
	}

	symbol := strings.ToUpper(strings.TrimSpace(pair.Base))
	if symbol == "" {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("missing symbol"),
		}
	}

	endpoint, err := url.Parse(c.baseURL + "/quote")
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("build finnhub url: %w", err)
	}
	query := endpoint.Query()
	query.Set("symbol", symbol)
	query.Set("token", c.apiKey)
	endpoint.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("build request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		timeout := false
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			timeout = true
		}
		return gct.Ticker{}, &gct.RequestError{
			Path:    "/quote",
			Timeout: timeout,
			Cause:   err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: resp.StatusCode,
		}
	}

	var payload struct {
		Current   float64 `json:"c"`
		High      float64 `json:"h"`
		Low       float64 `json:"l"`
		Timestamp int64   `json:"t"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return gct.Ticker{}, fmt.Errorf("decode finnhub quote: %w", err)
	}
	if payload.Current <= 0 {
		return gct.Ticker{}, &gct.RequestError{
			Path:       "/quote",
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("no quote data"),
		}
	}

	high := payload.High
	if high <= 0 {
		high = payload.Current
	}
	low := payload.Low
	if low <= 0 {
		low = payload.Current
	}
	lastUpdated := payload.Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}

	return gct.Ticker{
		Pair:        gct.Pair{Base: symbol, Quote: "USD"},
		Currency:    symbol,
		LastUpdated: lastUpdated,
		Last:        payload.Current,
		Bid:         payload.Current,
		Ask:         payload.Current,
		High:        high,
		Low:         low,
		Volume:      0,
	}, nil
}
