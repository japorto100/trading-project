// AgentToolProxyHandler proxies GET/POST requests to agent-service tools.
// Phase 10e.4: Tool-Calls ueber Go Policy Gateway (RBAC, Rate-Limit, Audit).
// Phase 10.v3: AgentMutationProxyHandler for POST mutation tools.
package http

import (
	"context"
	"io"
	"net/http"
)

type agentToolProxyClient interface {
	Get(ctx context.Context, path string) (status int, body []byte, err error)
}

type agentMutationProxyClient interface {
	Post(ctx context.Context, path string, body []byte) (status int, respBody []byte, err error)
}

// AgentToolProxyHandler returns a handler that forwards GET to agent-service.
// RBAC/Rate-Limit applied by existing middleware when AUTH_RBAC_ENFORCE / AUTH_RATE_LIMIT_ENFORCE.
func AgentToolProxyHandler(client agentToolProxyClient, upstreamPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "agent tool proxy unavailable"})
			return
		}
		status, body, err := client.Get(r.Context(), upstreamPath)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "agent tool request failed"})
			return
		}
		if status <= 0 {
			status = http.StatusOK
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_, _ = w.Write(body)
	}
}

// AgentMutationProxyHandler forwards POST mutation requests to agent-service. Phase 10.v3.
func AgentMutationProxyHandler(client agentMutationProxyClient, upstreamPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "agent mutation proxy unavailable"})
			return
		}
		bodyBytes, err := io.ReadAll(io.LimitReader(r.Body, 1<<16))
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "failed to read request body"})
			return
		}
		status, respBody, err := client.Post(r.Context(), upstreamPath, bodyBytes)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "agent mutation request failed"})
			return
		}
		if status <= 0 {
			status = http.StatusOK
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_, _ = w.Write(respBody)
	}
}
