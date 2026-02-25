package app

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type jwtAuthConfig struct {
	enabled     bool
	secret      string
	issuer      string
	audience    string
	validAlgs   []string
	leeway      time.Duration
	revocations *jwtRevocationBlocklist
}

type gatewayJWTClaims struct {
	Role     string `json:"role"`
	UserRole string `json:"userRole,omitempty"`
	AppRole  string `json:"app_role,omitempty"`
	jwt.RegisteredClaims
}

func withJWTAuth(next http.Handler, cfg jwtAuthConfig) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requiredRole, protected := requiredRoleForPath(r.Method, r.URL.Path)
		_ = requiredRole
		if !cfg.enabled || !protected {
			next.ServeHTTP(w, r)
			return
		}

		secret := strings.TrimSpace(cfg.secret)
		if secret == "" {
			writeJWTAuthError(w, http.StatusServiceUnavailable, "jwt auth misconfigured")
			return
		}

		rawToken := extractBearerToken(r.Header.Get("Authorization"))
		if rawToken == "" {
			writeJWTAuthError(w, http.StatusUnauthorized, "missing bearer token")
			return
		}

		claims := &gatewayJWTClaims{}
		parseOptions := []jwt.ParserOption{jwt.WithExpirationRequired()}
		if cfg.leeway > 0 {
			parseOptions = append(parseOptions, jwt.WithLeeway(cfg.leeway))
		}
		validAlgs := normalizedJWTSigningMethods(cfg.validAlgs)
		parseOptions = append(parseOptions, jwt.WithValidMethods(validAlgs))
		token, err := jwt.ParseWithClaims(rawToken, claims, func(token *jwt.Token) (any, error) {
			return []byte(secret), nil
		}, parseOptions...)
		if err != nil || token == nil || !token.Valid {
			writeJWTAuthError(w, http.StatusUnauthorized, "invalid bearer token")
			return
		}
		if issuer := strings.TrimSpace(cfg.issuer); issuer != "" {
			if strings.TrimSpace(claims.Issuer) != issuer {
				writeJWTAuthError(w, http.StatusUnauthorized, "invalid token issuer")
				return
			}
		}
		if audience := strings.TrimSpace(cfg.audience); audience != "" {
			matchedAudience := false
			for _, aud := range claims.Audience {
				if strings.TrimSpace(aud) == audience {
					matchedAudience = true
					break
				}
			}
			if !matchedAudience {
				writeJWTAuthError(w, http.StatusUnauthorized, "invalid token audience")
				return
			}
		}

		role := normalizeJWTClaimRole(claims.Role)
		if role == "" {
			role = normalizeJWTClaimRole(claims.UserRole)
		}
		if role == "" {
			role = normalizeJWTClaimRole(claims.AppRole)
		}
		if role != "" {
			r.Header.Set("X-User-Role", role)
		}
		r.Header.Set("X-Auth-Verified", "bearer-jwt")
		if sub := strings.TrimSpace(claims.Subject); sub != "" {
			r.Header.Set("X-Auth-User", sub)
		}
		if jti := strings.TrimSpace(claims.ID); jti != "" {
			if cfg.revocations != nil && cfg.revocations.IsRevoked(jti, time.Now()) {
				writeJWTAuthError(w, http.StatusUnauthorized, "token revoked")
				return
			}
			r.Header.Set("X-Auth-JTI", jti)
		}

		next.ServeHTTP(w, r)
	})
}

func extractBearerToken(headerValue string) string {
	value := strings.TrimSpace(headerValue)
	if value == "" {
		return ""
	}
	parts := strings.SplitN(value, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}

func normalizeJWTClaimRole(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "viewer", "analyst", "trader", "admin":
		return strings.ToLower(strings.TrimSpace(raw))
	default:
		return ""
	}
}

func normalizedJWTSigningMethods(raw []string) []string {
	if len(raw) == 0 {
		return []string{jwt.SigningMethodHS256.Alg()}
	}
	out := make([]string, 0, len(raw))
	for _, value := range raw {
		alg := strings.ToUpper(strings.TrimSpace(value))
		switch alg {
		case jwt.SigningMethodHS256.Alg(), jwt.SigningMethodHS384.Alg(), jwt.SigningMethodHS512.Alg():
			out = append(out, alg)
		}
	}
	if len(out) == 0 {
		return []string{jwt.SigningMethodHS256.Alg()}
	}
	return out
}

func writeJWTAuthError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}
