package news

import (
	"context"
	"net/http"
	"strings"
	"time"

	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

const DefaultFinvizBaseURL = "https://finviz.com/rss.ashx"

type FinvizClientConfig struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type FinvizClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewFinvizClient(cfg FinvizClientConfig) *FinvizClient {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultFinvizBaseURL
	}
	return &FinvizClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *FinvizClient) Fetch(ctx context.Context, symbol string, limit int) ([]marketServices.Headline, error) {
	symbol = strings.ToUpper(strings.TrimSpace(symbol))
	if symbol == "" {
		return nil, nil
	}
	if limit <= 0 {
		limit = 20
	}

	requestURL := c.baseURL
	if strings.Contains(requestURL, "?") {
		requestURL = requestURL + "&t=" + symbol
	} else {
		requestURL = requestURL + "?t=" + symbol
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "tradeview-fusion-go-backend/1.0")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, nil
	}
	return parseRSS(resp.Body, "finviz", limit)
}
