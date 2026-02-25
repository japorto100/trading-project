package base

import (
	"errors"
	"net"
	"net/http"
	"strings"
	"time"
)

func isIdempotentMethod(method string) bool {
	switch strings.ToUpper(strings.TrimSpace(method)) {
	case http.MethodGet, http.MethodHead, http.MethodOptions:
		return true
	default:
		return false
	}
}

func shouldRetry(method string, resp *http.Response, err error) bool {
	if !isIdempotentMethod(method) {
		return false
	}
	if err != nil {
		var netErr net.Error
		if errors.As(err, &netErr) {
			return true
		}
		return true
	}
	if resp == nil {
		return false
	}
	if resp.StatusCode == http.StatusTooManyRequests {
		return true
	}
	return resp.StatusCode >= http.StatusInternalServerError
}

func retryBackoff(attempt int) time.Duration {
	if attempt < 0 {
		attempt = 0
	}
	// Conservative connector-level backoff. Keep short to avoid UI stalls.
	base := 100 * time.Millisecond
	delay := base << min(attempt, 4)
	if delay > 1500*time.Millisecond {
		delay = 1500 * time.Millisecond
	}
	return delay
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
