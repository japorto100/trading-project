package base

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	baseURL    string
	timeout    time.Duration
	retryCount int
	httpClient *http.Client
	limiter    *simpleRateLimiter
}

func NewClient(cfg Config) *Client {
	baseURL := strings.TrimRight(strings.TrimSpace(cfg.BaseURL), "/")

	timeout := cfg.Timeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}

	retryCount := cfg.RetryCount
	if retryCount < 0 {
		retryCount = 0
	}

	transport := cfg.Transport
	if transport == nil {
		if defaultTransport, ok := http.DefaultTransport.(*http.Transport); ok {
			transport = defaultTransport.Clone()
		} else {
			transport = http.DefaultTransport
		}
	}

	return &Client{
		baseURL:    baseURL,
		timeout:    timeout,
		retryCount: retryCount,
		httpClient: &http.Client{Timeout: timeout, Transport: transport},
		limiter:    newSimpleRateLimiter(cfg.RateLimitPerSecond),
	}
}

func (c *Client) BaseURL() string {
	if c == nil {
		return ""
	}
	return c.baseURL
}

func (c *Client) Timeout() time.Duration {
	if c == nil {
		return 0
	}
	return c.timeout
}

func (c *Client) HTTP() *http.Client {
	if c == nil {
		return nil
	}
	return c.httpClient
}

func (c *Client) NewRequest(ctx context.Context, method, path string, query url.Values, body io.Reader) (*http.Request, error) {
	if c == nil {
		return nil, fmt.Errorf("base client unavailable")
	}
	target, err := c.buildURL(path, query)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, method, target, body)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	return req, nil
}

func (c *Client) buildURL(path string, query url.Values) (string, error) {
	if c == nil {
		return "", fmt.Errorf("base client unavailable")
	}

	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		endpoint, err := url.Parse(path)
		if err != nil {
			return "", fmt.Errorf("build url: %w", err)
		}
		if len(query) > 0 {
			endpoint.RawQuery = query.Encode()
		}
		return endpoint.String(), nil
	}

	baseURL := c.baseURL
	if baseURL == "" {
		return "", fmt.Errorf("base url required")
	}
	endpoint, err := url.Parse(baseURL)
	if err != nil {
		return "", fmt.Errorf("parse base url: %w", err)
	}
	joined, err := endpoint.Parse(path)
	if err != nil {
		return "", fmt.Errorf("build request url: %w", err)
	}
	if len(query) > 0 {
		joined.RawQuery = query.Encode()
	}
	return joined.String(), nil
}

func (c *Client) Do(req *http.Request) (*http.Response, error) {
	if c == nil {
		return nil, fmt.Errorf("base client unavailable")
	}
	if req == nil {
		return nil, fmt.Errorf("request required")
	}

	maxAttempts := c.retryCount + 1
	if maxAttempts < 1 {
		maxAttempts = 1
	}

	var lastErr error
	for attempt := 0; attempt < maxAttempts; attempt++ {
		clonedReq, cloneErr := cloneRequest(req)
		if cloneErr != nil {
			return nil, cloneErr
		}

		if waitErr := c.limiter.Wait(clonedReq.Context()); waitErr != nil {
			return nil, waitErr
		}

		resp, err := c.httpClient.Do(clonedReq)
		if !shouldRetry(clonedReq.Method, resp, err) || attempt == maxAttempts-1 {
			return resp, err
		}

		if resp != nil && resp.Body != nil {
			_ = resp.Body.Close()
		}
		lastErr = err

		timer := time.NewTimer(retryBackoff(attempt))
		select {
		case <-clonedReq.Context().Done():
			if !timer.Stop() {
				<-timer.C
			}
			if clonedReq.Context().Err() != nil {
				return nil, clonedReq.Context().Err()
			}
			if lastErr != nil {
				return nil, lastErr
			}
			return nil, context.Canceled
		case <-timer.C:
		}
	}

	if lastErr != nil {
		return nil, lastErr
	}
	return nil, fmt.Errorf("request failed after retries")
}

func cloneRequest(req *http.Request) (*http.Request, error) {
	cloned := req.Clone(req.Context())
	if req.Body == nil {
		cloned.Body = nil
		return cloned, nil
	}
	if req.GetBody == nil {
		if isIdempotentMethod(req.Method) {
			// For safety we do not retry non-replayable bodies.
			if cloned != nil {
				cloned = req
			}
			return cloned, nil
		}
		return nil, fmt.Errorf("request body is not replayable")
	}
	body, err := req.GetBody()
	if err != nil {
		return nil, fmt.Errorf("clone request body: %w", err)
	}
	cloned.Body = body
	return cloned, nil
}
