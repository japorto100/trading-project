package app

import (
	"encoding/json"
	"net/http"
	"strings"
)

type roleLevel int

const (
	roleUnknown roleLevel = iota
	roleViewer
	roleAnalyst
	roleTrader
	roleAdmin
)

type rbacConfig struct {
	enabled bool
}

func withRBAC(next http.Handler, cfg rbacConfig) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requiredRole, protected := requiredRoleForPath(r.Method, r.URL.Path)
		if !protected || !cfg.enabled {
			next.ServeHTTP(w, r)
			return
		}

		role := parseUserRole(r.Header.Get("X-User-Role"))
		if role == roleUnknown {
			writeRBACError(w, http.StatusUnauthorized, "missing user role")
			return
		}
		if role < requiredRole {
			writeRBACError(w, http.StatusForbidden, "insufficient role")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func parseUserRole(value string) roleLevel {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "viewer":
		return roleViewer
	case "analyst":
		return roleAnalyst
	case "trader":
		return roleTrader
	case "admin":
		return roleAdmin
	default:
		return roleUnknown
	}
}

func requiredRoleForPath(method, path string) (roleLevel, bool) {
	if path == "/health" || strings.HasPrefix(path, "/api/v1/stream/") {
		return roleUnknown, false
	}

	if strings.HasPrefix(path, "/api/v1/portfolio/order") {
		return roleTrader, true
	}
	if strings.HasPrefix(path, "/api/v1/portfolio/balances") {
		return roleTrader, true
	}
	if strings.HasPrefix(path, "/api/v1/gct/") {
		return roleTrader, true
	}
	if strings.HasPrefix(path, "/api/v1/auth/revocations/") {
		return roleAdmin, true
	}
	if method == http.MethodPost && path == "/api/v1/geopolitical/candidates" {
		return roleAnalyst, true
	}
	if method == http.MethodPost && strings.HasPrefix(path, "/api/v1/geopolitical/candidates/") {
		if strings.HasSuffix(path, "/accept") || strings.HasSuffix(path, "/reject") || strings.HasSuffix(path, "/snooze") {
			return roleAnalyst, true
		}
	}
	if method == http.MethodPost && path == "/api/v1/geopolitical/contradictions" {
		return roleAnalyst, true
	}
	if method == http.MethodPatch && strings.HasPrefix(path, "/api/v1/geopolitical/contradictions/") {
		return roleAnalyst, true
	}
	if method == http.MethodPost && (path == "/api/v1/geopolitical/ingest/hard" || path == "/api/v1/geopolitical/ingest/soft") {
		return roleAnalyst, true
	}
	if method == http.MethodPost && path == "/api/v1/geopolitical/admin/seed" {
		return roleAnalyst, true
	}
	if strings.Contains(path, "/review") && method == http.MethodPost {
		return roleAnalyst, true
	}
	if strings.HasPrefix(path, "/api/v1/") {
		return roleViewer, true
	}
	return roleUnknown, false
}

func writeRBACError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}
