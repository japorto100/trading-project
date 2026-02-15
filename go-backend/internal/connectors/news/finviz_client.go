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
	RequestRetries int
}

type FinvizClient struct {
	baseURL        string
	requestRetries int
	httpClient     *http.Client
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
	retries := cfg.RequestRetries
	if retries < 0 {
		retries = 0
	}
	return &FinvizClient{
		baseURL:        baseURL,
		requestRetries: retries,
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

	attempts := c.requestRetries + 1
	for attempt := 1; attempt <= attempts; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL, nil)
		if err != nil {
			return nil, err
		}
		req.Header.Set("Accept", "application/xml")
		req.Header.Set("User-Agent", "tradeview-fusion-go-backend/1.0")

		resp, err := c.httpClient.Do(req)
		if err != nil {
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, err
		}

		if resp.StatusCode >= http.StatusInternalServerError {
			_ = resp.Body.Close()
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, nil
		}
		if resp.StatusCode >= http.StatusBadRequest {
			_ = resp.Body.Close()
			return nil, nil
		}

		items, parseErr := parseRSS(resp.Body, "finviz", limit)
		_ = resp.Body.Close()
		if parseErr != nil {
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, parseErr
		}
		return items, nil
	}
	return nil, nil
}
