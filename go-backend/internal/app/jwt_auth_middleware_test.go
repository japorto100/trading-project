package app

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func signedTestJWT(t *testing.T, secret string, claims gatewayJWTClaims) string {
	t.Helper()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return signed
}

func TestWithJWTAuth_DisabledBypasses(t *testing.T) {
	handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), jwtAuthConfig{enabled: false})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
}

func TestWithJWTAuth_PublicPathBypassesEvenWhenEnabled(t *testing.T) {
	handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), jwtAuthConfig{enabled: true, secret: "secret"})

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
}

func TestWithJWTAuth_RejectsMissingOrInvalidToken(t *testing.T) {
	handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), jwtAuthConfig{enabled: true, secret: "secret"})

	t.Run("missing token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", res.Code)
		}
	})

	t.Run("invalid token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		req.Header.Set("Authorization", "Bearer not-a-jwt")
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", res.Code)
		}
	})

	t.Run("expired token", func(t *testing.T) {
		token := signedTestJWT(t, "secret", gatewayJWTClaims{
			Role: "viewer",
			RegisteredClaims: jwt.RegisteredClaims{
				Subject:   "u1",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Minute)),
			},
		})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusUnauthorized {
			t.Fatalf("expected status 401, got %d", res.Code)
		}
	})
}

func TestWithJWTAuth_ValidatesIssuerAndAudienceWhenConfigured(t *testing.T) {
	handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), jwtAuthConfig{enabled: true, secret: "secret", issuer: "tvf-auth", audience: "tvf-gateway"})

	mkReq := func(claims gatewayJWTClaims) *httptest.ResponseRecorder {
		token := signedTestJWT(t, "secret", claims)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		return res
	}

	valid := mkReq(gatewayJWTClaims{
		Role: "viewer",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "u1",
			Issuer:    "tvf-auth",
			Audience:  jwt.ClaimStrings{"tvf-gateway"},
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})
	if valid.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", valid.Code)
	}

	badIssuer := mkReq(gatewayJWTClaims{
		Role: "viewer",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "u1",
			Issuer:    "other-issuer",
			Audience:  jwt.ClaimStrings{"tvf-gateway"},
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})
	if badIssuer.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401 for issuer mismatch, got %d", badIssuer.Code)
	}

	badAudience := mkReq(gatewayJWTClaims{
		Role: "viewer",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "u1",
			Issuer:    "tvf-auth",
			Audience:  jwt.ClaimStrings{"other-audience"},
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})
	if badAudience.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401 for audience mismatch, got %d", badAudience.Code)
	}
}

func TestWithJWTAuth_RespectsAllowedAlgorithmsAndLeeway(t *testing.T) {
	t.Run("allows configured HS512", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS512, gatewayJWTClaims{
			Role: "viewer",
			RegisteredClaims: jwt.RegisteredClaims{
				Subject:   "u1",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			},
		})
		signed, err := token.SignedString([]byte("secret"))
		if err != nil {
			t.Fatalf("sign token: %v", err)
		}

		handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
		}), jwtAuthConfig{enabled: true, secret: "secret", validAlgs: []string{"HS512"}})

		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		req.Header.Set("Authorization", "Bearer "+signed)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", res.Code)
		}
	})

	t.Run("accepts slight clock skew via leeway", func(t *testing.T) {
		token := signedTestJWT(t, "secret", gatewayJWTClaims{
			Role: "viewer",
			RegisteredClaims: jwt.RegisteredClaims{
				Subject:   "u2",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(-2 * time.Second)),
			},
		})

		handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
		}), jwtAuthConfig{enabled: true, secret: "secret", leeway: 5 * time.Second})

		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected status 200 with leeway, got %d", res.Code)
		}
	})
}

func TestWithJWTAuth_InjectsHeadersFromClaims(t *testing.T) {
	handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("X-User-Role"); got != "trader" {
			t.Fatalf("expected injected role trader, got %q", got)
		}
		if got := r.Header.Get("X-Auth-User"); got != "user-123" {
			t.Fatalf("expected injected user id, got %q", got)
		}
		if got := r.Header.Get("X-Auth-JTI"); got != "jti-1" {
			t.Fatalf("expected injected jti, got %q", got)
		}
		w.WriteHeader(http.StatusOK)
	}), jwtAuthConfig{enabled: true, secret: "secret"})

	token := signedTestJWT(t, "secret", gatewayJWTClaims{
		Role: "trader",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "user-123",
			ID:        "jti-1",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/portfolio/order", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
}

func TestWithJWTAuth_InjectsRoleFromAliasClaims(t *testing.T) {
	t.Run("userRole", func(t *testing.T) {
		handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if got := r.Header.Get("X-User-Role"); got != "analyst" {
				t.Fatalf("expected analyst role from userRole, got %q", got)
			}
			w.WriteHeader(http.StatusOK)
		}), jwtAuthConfig{enabled: true, secret: "secret"})

		token := signedTestJWT(t, "secret", gatewayJWTClaims{
			UserRole: "analyst",
			RegisteredClaims: jwt.RegisteredClaims{
				Subject:   "u-analyst",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			},
		})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/candidates", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", res.Code)
		}
	})

	t.Run("app_role", func(t *testing.T) {
		handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if got := r.Header.Get("X-User-Role"); got != "admin" {
				t.Fatalf("expected admin role from app_role, got %q", got)
			}
			w.WriteHeader(http.StatusOK)
		}), jwtAuthConfig{enabled: true, secret: "secret"})

		token := signedTestJWT(t, "secret", gatewayJWTClaims{
			AppRole: "admin",
			RegisteredClaims: jwt.RegisteredClaims{
				Subject:   "u-admin",
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			},
		})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", res.Code)
		}
	})
}

func TestWithJWTAuth_RejectsRevokedJTI(t *testing.T) {
	revocations := newJWTRevocationBlocklist()
	revocations.Revoke("jti-revoked", time.Now().Add(time.Hour))

	handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), jwtAuthConfig{
		enabled:     true,
		secret:      "secret",
		revocations: revocations,
	})

	token := signedTestJWT(t, "secret", gatewayJWTClaims{
		Role: "viewer",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "user-1",
			ID:        "jti-revoked",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", res.Code)
	}
}

func TestWithJWTAuth_MisconfiguredSecretReturns503(t *testing.T) {
	handler := withJWTAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}), jwtAuthConfig{enabled: true, secret: ""})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote", nil)
	req.Header.Set("Authorization", "Bearer anything")
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected status 503, got %d", res.Code)
	}
}

func TestExtractBearerToken(t *testing.T) {
	if got := extractBearerToken("Bearer abc"); got != "abc" {
		t.Fatalf("expected abc, got %q", got)
	}
	if got := extractBearerToken("bearer abc"); got != "abc" {
		t.Fatalf("expected abc, got %q", got)
	}
	if got := extractBearerToken("Token abc"); got != "" {
		t.Fatalf("expected empty token, got %q", got)
	}
}
