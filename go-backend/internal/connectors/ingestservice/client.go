package ingestservice

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/ipc"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/requestctx"
)

// DefaultBaseURL is a temporary scaffold default until python-ingest-workers
// exposes a finalized always-on runtime endpoint.
const DefaultBaseURL = "http://127.0.0.1:8098"

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
		timeout = 8 * time.Second
	}
	return &Client{
		ipcClient: ipc.NewClient(ipc.ConfigWithRegistry(
			cfg.Registry,
			"ingestservice",
			baseURL,
			strings.TrimSpace(cfg.GrpcAddress),
			timeout,
		)),
	}
}

func (c *Client) PostJSON(ctx context.Context, path string, payload []byte) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("ingestservice client unavailable")
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
		return 0, nil, fmt.Errorf("ingestservice POST %s: %w", path, err)
	}
	return status, body, nil
}

func (c *Client) Get(ctx context.Context, path string, query url.Values) (int, []byte, error) {
	if c == nil {
		return 0, nil, fmt.Errorf("ingestservice client unavailable")
	}
	headers := map[string]string{"Accept": "application/json"}
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		headers["X-Request-ID"] = requestID
	}
	status, body, err := c.ipcClient.Get(ctx, path, query, headers)
	if err != nil {
		return 0, nil, fmt.Errorf("ingestservice GET %s: %w", path, err)
	}
	return status, body, nil
}
