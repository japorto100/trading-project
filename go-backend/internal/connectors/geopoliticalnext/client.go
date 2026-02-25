package geopoliticalnext

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

const DefaultBaseURL = "http://127.0.0.1:3000"

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

func (c *Client) Do(ctx context.Context, method, path string, payload []byte, headers map[string]string) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("geopoliticalnext client unavailable")
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	var body io.Reader
	if payload != nil {
		body = bytes.NewReader(payload)
	}
	req, err := c.baseClient.NewRequest(ctx, method, path, nil, body)
	if err != nil {
		return 0, nil, fmt.Errorf("build geopoliticalnext request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		req.Header.Set("X-Request-ID", requestID)
	}

	for key, value := range headers {
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		if key == "" || value == "" {
			continue
		}
		req.Header.Set(key, value)
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("geopoliticalnext request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, nil, fmt.Errorf("read geopoliticalnext response: %w", err)
	}
	return resp.StatusCode, respBody, nil
}
