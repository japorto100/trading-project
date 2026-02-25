package app

import (
	"encoding/json"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type rateLimitConfig struct {
	enabled bool
	nowFunc func() time.Time
}

type rateLimitRule struct {
	keyPrefix string
	limit     int
	window    time.Duration
}

type rateLimitCounter struct {
	windowStart time.Time
	count       int
}

type inMemoryRateLimiter struct {
	mu       sync.Mutex
	counters map[string]rateLimitCounter
	nowFunc  func() time.Time
}

func newInMemoryRateLimiter(nowFunc func() time.Time) *inMemoryRateLimiter {
	if nowFunc == nil {
		nowFunc = time.Now
	}
	return &inMemoryRateLimiter{
		counters: make(map[string]rateLimitCounter),
		nowFunc:  nowFunc,
	}
}

func (l *inMemoryRateLimiter) allow(key string, limit int, window time.Duration) (allowed bool, retryAfterSeconds int) {
	if limit <= 0 || window <= 0 {
		return true, 0
	}

	now := l.nowFunc()
	l.mu.Lock()
	defer l.mu.Unlock()

	current, exists := l.counters[key]
	if !exists || now.Sub(current.windowStart) >= window {
		l.counters[key] = rateLimitCounter{
			windowStart: now,
			count:       1,
		}
		return true, 0
	}

	if current.count >= limit {
		retryAfter := int(window.Seconds() - now.Sub(current.windowStart).Seconds())
		if retryAfter < 1 {
			retryAfter = 1
		}
		return false, retryAfter
	}

	current.count++
	l.counters[key] = current
	return true, 0
}

func withRateLimit(next http.Handler, cfg rateLimitConfig) http.Handler {
	limiter := newInMemoryRateLimiter(cfg.nowFunc)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rule, ok := rateLimitRuleForPath(r.Method, r.URL.Path)
		if !cfg.enabled || !ok {
			next.ServeHTTP(w, r)
			return
		}

		clientKey := rateLimitClientKey(r)
		key := rule.keyPrefix + "|" + clientKey
		allowed, retryAfter := limiter.allow(key, rule.limit, rule.window)
		if !allowed {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
			w.WriteHeader(http.StatusTooManyRequests)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "rate limit exceeded",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}

func rateLimitRuleForPath(method, path string) (rateLimitRule, bool) {
	if method == http.MethodOptions || path == "/health" || strings.HasPrefix(path, "/api/v1/stream/") {
		return rateLimitRule{}, false
	}
	if strings.HasPrefix(path, "/api/v1/portfolio/order") {
		return rateLimitRule{keyPrefix: "portfolio_order", limit: 2, window: time.Minute}, true
	}
	if strings.HasPrefix(path, "/api/v1/gct/") {
		return rateLimitRule{keyPrefix: "gct_sensitive", limit: 2, window: time.Minute}, true
	}
	if strings.HasPrefix(path, "/api/v1/auth/revocations/") {
		return rateLimitRule{keyPrefix: "auth_revocations", limit: 5, window: time.Minute}, true
	}
	if strings.HasPrefix(path, "/api/v1/portfolio/balances") {
		return rateLimitRule{keyPrefix: "portfolio_balances", limit: 10, window: time.Second}, true
	}
	if strings.HasPrefix(path, "/api/v1/signals/") ||
		strings.HasPrefix(path, "/api/v1/patterns/") ||
		strings.HasPrefix(path, "/api/v1/indicators/") {
		return rateLimitRule{keyPrefix: "indicators", limit: 10, window: time.Second}, true
	}
	if strings.HasPrefix(path, "/api/v1/") {
		return rateLimitRule{keyPrefix: "api_default", limit: 100, window: time.Second}, true
	}
	return rateLimitRule{}, false
}

func rateLimitClientKey(r *http.Request) string {
	if forwarded := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		if len(parts) > 0 {
			first := strings.TrimSpace(parts[0])
			if first != "" {
				return first
			}
		}
	}

	if host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr)); err == nil && host != "" {
		return host
	}

	if remote := strings.TrimSpace(r.RemoteAddr); remote != "" {
		return remote
	}

	return "unknown"
}
