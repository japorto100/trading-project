// Package agentservice provides a Go client for the Python agent service (port 8094).
// Phase 10e: WebMCP Tools proxy via Go Policy Gateway.
package agentservice

import (
	"context"
	"fmt"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/ipc"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "http://127.0.0.1:8094"

type Config struct {
	BaseURL        string
	GrpcAddress    string
	RequestTimeout time.Duration
	Registry       *connectorregistry.Registry
}

type Client struct {
	ipcClient *ipc.Client
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
		ipcClient: ipc.NewClient(ipc.ConfigWithRegistry(
			cfg.Registry,
			"agentservice",
			baseURL,
			strings.TrimSpace(cfg.GrpcAddress),
			timeout,
		)),
	}
}

func (c *Client) Post(ctx context.Context, path string, body []byte) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("agentservice client unavailable")
	}
	headers := map[string]string{
		"Content-Type": "application/json",
		"Accept":       "application/json",
	}
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		headers["X-Request-ID"] = requestID
	}
	status, respBody, err := c.ipcClient.Do(ctx, "POST", path, body, headers)
	if err != nil {
		return 0, nil, fmt.Errorf("agentservice POST %s: %w", path, err)
	}
	return status, respBody, nil
}

func (c *Client) Get(ctx context.Context, path string) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("agentservice client unavailable")
	}
	headers := map[string]string{"Accept": "application/json"}
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		headers["X-Request-ID"] = requestID
	}
	status, body, err := c.ipcClient.Get(ctx, path, nil, headers)
	if err != nil {
		return 0, nil, fmt.Errorf("agentservice GET %s: %w", path, err)
	}
	return status, body, nil
}
