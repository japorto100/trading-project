package http

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestJWTJTIRevocationHandler_RevokesJTI(t *testing.T) {
	var (
		revokedJTI string
		revokedExp time.Time
	)
	handler := JWTJTIRevocationHandler(func(jti string, expiresAt time.Time) {
		revokedJTI = jti
		revokedExp = expiresAt
	})

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/jti", strings.NewReader(`{"jti":"jti-123","exp":1893456000}`))
	req.Header.Set("Content-Type", "application/json")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusAccepted {
		t.Fatalf("expected status 202, got %d", res.Code)
	}
	if revokedJTI != "jti-123" {
		t.Fatalf("expected jti-123 to be revoked, got %q", revokedJTI)
	}
	if revokedExp.Unix() != 1893456000 {
		t.Fatalf("expected exp unix 1893456000, got %d", revokedExp.Unix())
	}

	var body struct {
		Accepted bool   `json:"accepted"`
		JTI      string `json:"jti"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Accepted || body.JTI != "jti-123" {
		t.Fatalf("unexpected response body: %+v", body)
	}
}

func TestJWTJTIRevocationHandler_Validation(t *testing.T) {
	t.Run("method not allowed", func(t *testing.T) {
		handler := JWTJTIRevocationHandler(func(string, time.Time) {})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/revocations/jti", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected status 405, got %d", res.Code)
		}
	})

	t.Run("missing revoker", func(t *testing.T) {
		handler := JWTJTIRevocationHandler(nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/jti", strings.NewReader(`{"jti":"x"}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", res.Code)
		}
	})

	t.Run("invalid body", func(t *testing.T) {
		handler := JWTJTIRevocationHandler(func(string, time.Time) {})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/jti", strings.NewReader(`{`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", res.Code)
		}
	})

	t.Run("missing jti", func(t *testing.T) {
		handler := JWTJTIRevocationHandler(func(string, time.Time) {})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/revocations/jti", strings.NewReader(`{"jti":" "}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", res.Code)
		}
	})
}
