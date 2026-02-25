package app

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestWithRateLimit_DisabledBypasses(t *testing.T) {
	handler := withRateLimit(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rateLimitConfig{enabled: false})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
}

func TestWithRateLimit_EnforcesFixedWindow(t *testing.T) {
	now := time.Date(2026, 2, 22, 12, 0, 0, 0, time.UTC)
	handler := withRateLimit(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rateLimitConfig{
		enabled: true,
		nowFunc: func() time.Time { return now },
	})

	makeReq := func() *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/portfolio/order", nil)
		req.RemoteAddr = "127.0.0.1:50000"
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		return res
	}

	if code := makeReq().Code; code != http.StatusOK {
		t.Fatalf("first request expected 200, got %d", code)
	}
	if code := makeReq().Code; code != http.StatusOK {
		t.Fatalf("second request expected 200, got %d", code)
	}
	third := makeReq()
	if third.Code != http.StatusTooManyRequests {
		t.Fatalf("third request expected 429, got %d", third.Code)
	}
	if third.Header().Get("Retry-After") == "" {
		t.Fatal("expected Retry-After header")
	}

	now = now.Add(time.Minute)
	if code := makeReq().Code; code != http.StatusOK {
		t.Fatalf("request after window reset expected 200, got %d", code)
	}
}

func TestWithRateLimit_AdminRevocationEndpointRule(t *testing.T) {
	now := time.Date(2026, 2, 22, 12, 0, 0, 0, time.UTC)
	handler := withRateLimit(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rateLimitConfig{
		enabled: true,
		nowFunc: func() time.Time { return now },
	})

	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/jti", nil)
		req.RemoteAddr = "127.0.0.1:50000"
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("request %d expected 200, got %d", i+1, res.Code)
		}
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/jti", nil)
	req.RemoteAddr = "127.0.0.1:50000"
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 on sixth revocation request, got %d", res.Code)
	}
}

func TestWithRateLimit_PublicRoutesExcluded(t *testing.T) {
	now := time.Date(2026, 2, 22, 12, 0, 0, 0, time.UTC)
	handler := withRateLimit(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rateLimitConfig{
		enabled: true,
		nowFunc: func() time.Time { return now },
	})

	publicPaths := []string{"/health", "/api/v1/stream/market"}
	for _, path := range publicPaths {
		t.Run(path, func(t *testing.T) {
			for i := 0; i < 5; i++ {
				req := httptest.NewRequest(http.MethodGet, path, nil)
				res := httptest.NewRecorder()
				handler.ServeHTTP(res, req)
				if res.Code != http.StatusOK {
					t.Fatalf("expected status 200, got %d", res.Code)
				}
			}
		})
	}
}

func TestRateLimitClientKey_UsesXForwardedForFirstIP(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
	req.RemoteAddr = "127.0.0.1:50000"
	req.Header.Set("X-Forwarded-For", "203.0.113.10, 10.0.0.1")

	got := rateLimitClientKey(req)
	if got != "203.0.113.10" {
		t.Fatalf("expected first forwarded IP, got %q", got)
	}
}
