package app

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

type flusherRecorder struct {
	*httptest.ResponseRecorder
	flushCalled bool
}

func (f *flusherRecorder) Flush() {
	f.flushCalled = true
	f.ResponseRecorder.Flush()
}

func TestWithSecurityHeaders_SetsBaselineHeaders(t *testing.T) {
	handler := withSecurityHeaders(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if got := res.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Fatalf("expected nosniff, got %q", got)
	}
	if got := res.Header().Get("X-Frame-Options"); got != "DENY" {
		t.Fatalf("expected DENY, got %q", got)
	}
	if got := res.Header().Get("Referrer-Policy"); got == "" {
		t.Fatal("expected Referrer-Policy header")
	}
	if got := res.Header().Get("Content-Security-Policy"); got == "" {
		t.Fatal("expected Content-Security-Policy header")
	}
}

func TestWithCORS_AllowedOriginAndPreflight(t *testing.T) {
	handler := withCORS(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), []string{"http://localhost:3000"})

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/quote", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusNoContent {
		t.Fatalf("expected status 204, got %d", res.Code)
	}
	if got := res.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Fatalf("expected allow-origin header, got %q", got)
	}
}

func TestWithRequestIDAndLogging_SetsResponseHeader(t *testing.T) {
	handler := withRequestIDAndLogging(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := RequestIDFromContext(r.Context()); got == "" {
			t.Fatal("expected request id in context")
		}
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if got := res.Header().Get("X-Request-ID"); got == "" {
		t.Fatal("expected X-Request-ID response header")
	}
}

func TestWithRequestIDAndLogging_PreservesFlusher(t *testing.T) {
	handler := withRequestIDAndLogging(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		if _, ok := w.(http.Flusher); !ok {
			t.Fatal("expected wrapped writer to implement http.Flusher")
		}
		w.(http.Flusher).Flush()
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/stream/market", nil)
	recorder := &flusherRecorder{ResponseRecorder: httptest.NewRecorder()}
	handler.ServeHTTP(recorder, req)

	if !recorder.flushCalled {
		t.Fatal("expected flush to be delegated to underlying writer")
	}
}

func TestWithRBACEnforcement_MissingToken_Returns401(t *testing.T) {
	handler := withRBAC(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rbacConfig{enabled: true})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
	// No X-User-Role header — should be treated as anonymous → 401
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing token, got %d", res.Code)
	}
}

func TestWithRBACEnforcement_InsufficientRole_Returns403(t *testing.T) {
	handler := withRBAC(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rbacConfig{enabled: true})

	req := httptest.NewRequest(http.MethodPost, "/api/v1/portfolio/order", nil)
	req.Header.Set("X-User-Role", "viewer") // viewer cannot access trader endpoints
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for insufficient role, got %d", res.Code)
	}
}
