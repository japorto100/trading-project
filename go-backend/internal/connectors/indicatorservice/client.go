package indicatorservice

import (
	"context"
	"fmt"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/ipc"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "http://127.0.0.1:8092"

type Config struct {
	BaseURL        string
	GrpcAddress    string // optional; derived from BaseURL (port+1000) if empty
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
		timeout = 8 * time.Second
	}

	return &Client{
		ipcClient: ipc.NewClient(ipc.ConfigWithRegistry(
			cfg.Registry,
			"indicatorservice",
			baseURL,
			strings.TrimSpace(cfg.GrpcAddress),
			timeout,
		)),
	}
}

func (c *Client) PostJSON(ctx context.Context, path string, payload []byte) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("indicatorservice client unavailable")
	}
	headers := map[string]string{
		"Content-Type": "application/json",
		"Accept":       "application/json",
	}
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		headers["X-Request-ID"] = requestID
	}
	status, body, err := c.ipcClient.Do(ctx, "POST", path, payload, headers)
	if err != nil {
		return 0, nil, fmt.Errorf("indicatorservice request failed: %w", err)
	}
	return status, body, nil
}
