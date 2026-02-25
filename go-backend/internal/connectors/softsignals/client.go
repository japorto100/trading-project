package softsignals

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "http://127.0.0.1:8091"

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
		timeout = 8 * time.Second
	}

	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 0,
		}),
	}
}

func (c *Client) PostJSON(ctx context.Context, path string, payload []byte) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("softsignals client unavailable")
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	req, err := c.baseClient.NewRequest(ctx, "POST", path, nil, bytes.NewReader(payload))
	if err != nil {
		return 0, nil, fmt.Errorf("build softsignals request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		req.Header.Set("X-Request-ID", requestID)
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("softsignals request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, nil, fmt.Errorf("read softsignals response: %w", err)
	}
	return resp.StatusCode, body, nil
}
