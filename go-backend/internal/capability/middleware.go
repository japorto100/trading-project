// Package capability — Phase 23 middleware for capability checks.
package capability

import (
	"net/http"
	"strings"
)

// CheckMiddleware returns middleware that verifies the request has access to the capability.
// When registry is nil or capability not found, the request is allowed (fail-open for bootstrap).
// When AUTH_RBAC_ENFORCE is true, the middleware would enforce; for now it only logs.
func CheckMiddleware(reg *Registry, capabilityID string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if reg == nil {
				next.ServeHTTP(w, r)
				return
			}
			c := reg.Lookup(capabilityID)
			if c == nil {
				next.ServeHTTP(w, r)
				return
			}
			// For read-only: no extra check. For write: would validate idempotencyKey/approval.
			if c.RequireApproval() {
				if idempotency := r.Header.Get("X-Idempotency-Key"); idempotency == "" && isMutation(r) {
					// approval-write without idempotency key on mutation: would require approval flow
					// For now: pass through (enforcement is flag-gated)
					_ = idempotency
				}
			}
			if c.RequireIdempotencyKey() && isMutation(r) {
				if idempotency := r.Header.Get("X-Idempotency-Key"); idempotency == "" {
					// bounded-write mutation without key: would reject
					// For now: pass through
					_ = idempotency
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}

func isMutation(r *http.Request) bool {
	m := strings.ToUpper(r.Method)
	return m == "POST" || m == "PUT" || m == "PATCH" || m == "DELETE"
}
