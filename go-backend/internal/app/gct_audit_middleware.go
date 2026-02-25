package app

import (
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/auditjsonl"
)

type gctAuditConfig struct {
	enabled  bool
	path     string
	onRecord func(record map[string]any)
}

type gctAuditLogger struct{ chain *auditjsonl.HashChainLogger }

func newGCTAuditLogger(path string) *gctAuditLogger {
	if strings.TrimSpace(path) == "" {
		return nil
	}
	return &gctAuditLogger{chain: auditjsonl.NewHashChainLogger(path)}
}

func (l *gctAuditLogger) append(record map[string]any) {
	if l == nil || l.chain == nil {
		return
	}
	_ = l.chain.Append(record)
}

func withGCTAudit(next http.Handler, cfg gctAuditConfig) http.Handler {
	logger := newGCTAuditLogger(cfg.path)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !cfg.enabled || !shouldAuditGCTPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		lrw := &loggingResponseWriter{ResponseWriter: w}
		start := time.Now()
		next.ServeHTTP(lrw, r)

		status := lrw.statusCode
		if status == 0 {
			status = http.StatusOK
		}

		record := map[string]any{
			"ts":         time.Now().UTC().Format(time.RFC3339Nano),
			"requestId":  strings.TrimSpace(r.Header.Get(requestIDHeader)),
			"method":     r.Method,
			"path":       r.URL.Path,
			"status":     status,
			"durationMs": time.Since(start).Milliseconds(),
			"remoteAddr": sanitizeRemoteAddr(r.RemoteAddr),
			"userId":     strings.TrimSpace(r.Header.Get("X-Auth-User")),
			"userRole":   strings.TrimSpace(r.Header.Get("X-User-Role")),
		}
		if q := sanitizeAuditQuery(r.URL.Query()); len(q) > 0 {
			record["query"] = q
		}

		logger.append(record)
		if cfg.onRecord != nil {
			cfg.onRecord(record)
		}
	})
}

func shouldAuditGCTPath(path string) bool {
	return strings.HasPrefix(path, "/api/v1/gct/")
}

func sanitizeAuditQuery(values map[string][]string) map[string]string {
	if len(values) == 0 {
		return nil
	}
	out := make(map[string]string)
	for k, v := range values {
		key := strings.ToLower(strings.TrimSpace(k))
		switch key {
		case "password", "token", "secret", "apikey", "api_key":
			out[k] = "[redacted]"
		default:
			if len(v) > 0 {
				out[k] = v[0]
			}
		}
	}
	return out
}

func sanitizeRemoteAddr(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	return trimmed
}
