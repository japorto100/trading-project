package ipc

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"maps"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/groups"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/proto/ipc"

	"google.golang.org/grpc"
	"google.golang.org/grpc/connectivity"
	"google.golang.org/grpc/credentials/insecure"
)

const grpcPortOffset = 1000

// Config configures the IPC client (gRPC-first, HTTP fallback).
type Config struct {
	// GrpcAddress is the gRPC server address (e.g. "127.0.0.1:9092").
	// If empty, derived from HTTPBaseURL by adding 1000 to the port.
	GrpcAddress string
	// HTTPBaseURL is the HTTP fallback base URL (e.g. "http://127.0.0.1:8092").
	HTTPBaseURL string
	// Timeout for both gRPC and HTTP.
	Timeout time.Duration
	// Provider is the canonical provider/service name in the connector registry.
	Provider string
	// Descriptor carries registry-backed provider metadata.
	Descriptor base.ProviderDescriptor
	// GroupPolicy carries registry-backed group policy metadata.
	GroupPolicy groups.Policy
}

// Client is a gRPC-first, HTTP-fallback client for Python IPC.
type Client struct {
	cfg        Config
	grpcAddr   string
	httpBase   string
	httpClient *base.Client
	provider   string
	descriptor base.ProviderDescriptor
	group      groups.Policy

	grpcMu   sync.Mutex
	grpcConn *grpc.ClientConn
	grpcCli  ipc.PythonIPCClient
}

func ConfigWithRegistry(reg *connectorregistry.Registry, provider, httpBaseURL, grpcAddress string, timeout time.Duration) Config {
	cfg := Config{
		GrpcAddress: grpcAddress,
		HTTPBaseURL: httpBaseURL,
		Timeout:     timeout,
		Provider:    normalizeProviderName(provider),
	}
	if reg == nil {
		return cfg
	}
	if descriptor, ok := reg.Descriptor(provider); ok {
		cfg.Provider = descriptor.Name
		cfg.Descriptor = descriptor
		if descriptor.Group != "" {
			if policy, ok := reg.GroupPolicy(descriptor.Group); ok {
				cfg.GroupPolicy = policy
			}
		}
	}
	return cfg
}

// NewClient creates an IPC client. GrpcAddress is derived from HTTPBaseURL if empty.
func NewClient(cfg Config) *Client {
	httpBase := strings.TrimRight(strings.TrimSpace(cfg.HTTPBaseURL), "/")
	if httpBase == "" {
		httpBase = "http://127.0.0.1:8092"
	}
	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = 8 * time.Second
	}

	grpcAddr := strings.TrimSpace(cfg.GrpcAddress)
	if grpcAddr == "" {
		grpcAddr = deriveGrpcAddress(httpBase)
	}

	return &Client{
		cfg:        cfg,
		grpcAddr:   grpcAddr,
		httpBase:   httpBase,
		httpClient: base.NewClient(base.Config{BaseURL: httpBase, Timeout: timeout, RetryCount: 0}),
		provider:   normalizeProviderName(cfg.Provider),
		descriptor: cfg.Descriptor,
		group:      cfg.GroupPolicy,
	}
}

func deriveGrpcAddress(httpBaseURL string) string {
	u, err := url.Parse(httpBaseURL)
	if err != nil {
		return "127.0.0.1:9092"
	}
	host := u.Hostname()
	if host == "" {
		host = "127.0.0.1"
	}
	port := 9092
	if p := u.Port(); p != "" {
		if n, err := strconv.Atoi(p); err == nil && n > 0 {
			port = n + grpcPortOffset
		}
	}
	return fmt.Sprintf("%s:%d", host, port)
}

func (c *Client) grpcClient(ctx context.Context) (ipc.PythonIPCClient, error) {
	c.grpcMu.Lock()
	defer c.grpcMu.Unlock()

	if c.grpcConn != nil {
		s := c.grpcConn.GetState()
		if s == connectivity.Ready || s == connectivity.Idle {
			return c.grpcCli, nil
		}
		if s == connectivity.Shutdown || s == connectivity.TransientFailure {
			_ = c.grpcConn.Close()
			c.grpcConn = nil
			c.grpcCli = nil
		}
	}

	dialCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	conn, err := grpc.DialContext(dialCtx, c.grpcAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)
	if err != nil {
		return nil, fmt.Errorf("dial ipc grpc %s: %w", c.grpcAddr, err)
	}
	c.grpcConn = conn
	c.grpcCli = ipc.NewPythonIPCClient(conn)
	return c.grpcCli, nil
}

// Do performs the request via gRPC first, falls back to HTTP on gRPC failure.
func (c *Client) Do(ctx context.Context, method, path string, body []byte, headers map[string]string) (statusCode int, respBody []byte, err error) {
	if c == nil {
		return 0, nil, fmt.Errorf("ipc client unavailable")
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	headers = c.enrichHeaders(headers)

	// Try gRPC first
	cli, grpcErr := c.grpcClient(ctx)
	if grpcErr == nil {
		req := &ipc.ProxyRequest{
			Method:  method,
			Path:    path,
			Body:    body,
			Headers: headers,
		}
		resp, callErr := cli.ForwardRequest(ctx, req)
		if callErr == nil {
			return int(resp.StatusCode), resp.Body, nil
		}
		// gRPC call failed; fall through to HTTP
		err = callErr
	} else {
		err = grpcErr
	}

	// HTTP fallback
	httpReq, buildErr := c.httpClient.NewRequest(ctx, method, path, nil, bytes.NewReader(body))
	if buildErr != nil {
		return 0, nil, fmt.Errorf("build http fallback request: %w", buildErr)
	}
	for k, v := range headers {
		httpReq.Header.Set(k, v)
	}
	resp, doErr := c.httpClient.Do(httpReq)
	if doErr != nil {
		return 0, nil, fmt.Errorf("http fallback failed: %w", doErr)
	}
	defer func() { _ = resp.Body.Close() }()
	respBody, readErr := io.ReadAll(resp.Body)
	if readErr != nil {
		return resp.StatusCode, nil, fmt.Errorf("read http response: %w", readErr)
	}
	return resp.StatusCode, respBody, nil
}

// PostJSON is a convenience for POST with JSON body and headers.
func (c *Client) PostJSON(ctx context.Context, path string, payload []byte) (int, []byte, error) {
	headers := map[string]string{
		"Content-Type": "application/json",
		"Accept":       "application/json",
	}
	return c.Do(ctx, http.MethodPost, path, payload, headers)
}

// Get performs a GET request. Extra headers are merged with Accept.
func (c *Client) Get(ctx context.Context, path string, query url.Values, headers map[string]string) (int, []byte, error) {
	if len(query) > 0 {
		path = path + "?" + query.Encode()
	}
	h := map[string]string{"Accept": "application/json"}
	maps.Copy(h, headers)
	return c.Do(ctx, http.MethodGet, path, nil, h)
}

func (c *Client) enrichHeaders(headers map[string]string) map[string]string {
	out := make(map[string]string, len(headers)+4)
	maps.Copy(out, headers)
	if c.provider != "" && strings.TrimSpace(out["X-TVF-Connector-Provider"]) == "" {
		out["X-TVF-Connector-Provider"] = c.provider
	}
	groupName := groups.Normalize(c.descriptor.Group)
	if groupName == "" {
		groupName = groups.Normalize(c.group.Name)
	}
	if groupName != "" && strings.TrimSpace(out["X-TVF-Connector-Group"]) == "" {
		out["X-TVF-Connector-Group"] = groupName
	}
	retryProfile := strings.TrimSpace(c.descriptor.RetryProfile)
	if retryProfile == "" {
		retryProfile = strings.TrimSpace(c.group.RetryProfile)
	}
	if retryProfile != "" && strings.TrimSpace(out["X-TVF-Retry-Profile"]) == "" {
		out["X-TVF-Retry-Profile"] = retryProfile
	}
	if bridge := strings.TrimSpace(c.descriptor.Bridge); bridge != "" && strings.TrimSpace(out["X-TVF-Bridge-Mode"]) == "" {
		out["X-TVF-Bridge-Mode"] = bridge
	}
	return out
}

func normalizeProviderName(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

// Close closes the gRPC connection. Call when shutting down.
func (c *Client) Close() error {
	c.grpcMu.Lock()
	defer c.grpcMu.Unlock()
	if c.grpcConn != nil {
		err := c.grpcConn.Close()
		c.grpcConn = nil
		c.grpcCli = nil
		if err != nil {
			return fmt.Errorf("close ipc grpc connection: %w", err)
		}
		return nil
	}
	return nil
}
