// Package agentservice provides a Go client for the Python agent service (port 8094).
// Phase 10e: WebMCP Tools proxy via Go Policy Gateway.
package agentservice

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "http://127.0.0.1:8094"

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
		timeout = 5 * time.Second
	}
	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 0,
		}),
	}
}

func (c *Client) Post(ctx context.Context, path string, body []byte) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("agentservice client unavailable")
	}
	req, err := c.baseClient.NewRequest(ctx, http.MethodPost, path, nil, strings.NewReader(string(body)))
	if err != nil {
		return 0, nil, fmt.Errorf("agentservice build POST %s: %w", path, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		req.Header.Set("X-Request-ID", requestID)
	}
	resp, err := c.baseClient.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("agentservice POST %s: %w", path, err)
	}
	defer func() { _ = resp.Body.Close() }()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, nil, err
	}
	return resp.StatusCode, respBody, nil
}

func (c *Client) Get(ctx context.Context, path string) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("agentservice client unavailable")
	}
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, path, nil, nil)
	if err != nil {
		return 0, nil, fmt.Errorf("agentservice build GET %s: %w", path, err)
	}
	req.Header.Set("Accept", "application/json")
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		req.Header.Set("X-Request-ID", requestID)
	}
	resp, err := c.baseClient.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("agentservice GET %s: %w", path, err)
	}
	defer func() { _ = resp.Body.Close() }()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, nil, err
	}
	return resp.StatusCode, body, nil
}
