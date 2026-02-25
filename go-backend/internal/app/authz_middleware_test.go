package app

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWithRBAC_DisabledBypassesChecks(t *testing.T) {
	handler := withRBAC(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rbacConfig{enabled: false})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
}

func TestWithRBAC_EnforcesRoleForProtectedRoutes(t *testing.T) {
	handler := withRBAC(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), rbacConfig{enabled: true})

	t.Run("missing role gets 401", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", res.Code)
		}
	})

	t.Run("viewer can access quote", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		req.Header.Set("X-User-Role", "viewer")
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", res.Code)
		}
	})

	t.Run("viewer denied trader endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/portfolio/order", nil)
		req.Header.Set("X-User-Role", "viewer")
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusForbidden {
			t.Fatalf("expected status 403, got %d", res.Code)
		}
	})

	t.Run("trader allowed trader endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/portfolio/order", nil)
		req.Header.Set("X-User-Role", "trader")
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", res.Code)
		}
	})

	t.Run("viewer denied gct endpoint", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/gct/health", nil)
		req.Header.Set("X-User-Role", "viewer")
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusForbidden {
			t.Fatalf("expected status 403, got %d", res.Code)
		}
	})

	t.Run("public health remains open", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/health", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", res.Code)
		}
	})
}

func TestRequiredRoleForPath(t *testing.T) {
	cases := []struct {
		method    string
		path      string
		protected bool
		role      roleLevel
	}{
		{method: http.MethodGet, path: "/health", protected: false, role: roleUnknown},
		{method: http.MethodGet, path: "/api/v1/stream/market", protected: false, role: roleUnknown},
		{method: http.MethodGet, path: "/api/v1/quote", protected: true, role: roleViewer},
		{method: http.MethodPost, path: "/api/v1/auth/revocations/jti", protected: true, role: roleAdmin},
		{method: http.MethodPost, path: "/api/v1/geopolitical/candidates/123/review", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/candidates", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/candidates/123/accept", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/candidates/123/reject", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/candidates/123/snooze", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/contradictions", protected: true, role: roleAnalyst},
		{method: http.MethodPatch, path: "/api/v1/geopolitical/contradictions/123", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/ingest/hard", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/ingest/soft", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/geopolitical/admin/seed", protected: true, role: roleAnalyst},
		{method: http.MethodPost, path: "/api/v1/portfolio/order", protected: true, role: roleTrader},
		{method: http.MethodGet, path: "/api/v1/gct/health", protected: true, role: roleTrader},
	}

	for _, tc := range cases {
		t.Run(tc.path, func(t *testing.T) {
			role, protected := requiredRoleForPath(tc.method, tc.path)
			if protected != tc.protected || role != tc.role {
				t.Fatalf("expected protected=%v role=%v, got protected=%v role=%v", tc.protected, tc.role, protected, role)
			}
		})
	}
}
