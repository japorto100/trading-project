package http

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// agentChatHTTPClient is a minimal http.Client used for SSE streaming.
// We cannot use the buffering agentservice.Client here because we need to
// stream the response body chunk-by-chunk without buffering.
// agentApproveRequest mirrors the body sent by the frontend for tool approval.
type agentApproveRequest struct {
	ToolCallID string `json:"toolCallId"`
	Decision   string `json:"decision"` // "approve" | "deny"
	ThreadID   string `json:"threadId"`
}

// AgentApproveHandler handles POST /api/v1/agent/approve.
// ACR-G6: receives tool-call approval/denial from the frontend.
// Currently a stub — returns 200 OK. Full async channel dispatch will be added
// once Go maintains per-thread stream state.
func AgentApproveHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		var req agentApproveRequest
		if err := decodeJSONBody(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("invalid request: %v", err)})
			return
		}
		if req.ToolCallID == "" || (req.Decision != "approve" && req.Decision != "deny") {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "toolCallId and decision (approve|deny) are required"})
			return
		}
		// Stub: acknowledge receipt. Full dispatch wired in Phase 22g.
		writeJSON(w, http.StatusOK, map[string]any{"ok": true, "toolCallId": req.ToolCallID, "decision": req.Decision})
	}
}

var agentChatHTTPClient = &http.Client{
	Timeout: 5 * time.Minute, // Long timeout — LLM streams can run for minutes.
}

// agentAttachment mirrors the RequestAttachment type from the frontend.
type agentAttachment struct {
	Base64   string `json:"base64"`
	MimeType string `json:"mime_type"`
	Name     string `json:"name"`
}

// agentChatRequestBody mirrors the Python AgentChatRequest Pydantic model.
type agentChatRequestBody struct {
	Message        string            `json:"message"`
	ThreadID       *string           `json:"threadId,omitempty"`
	AgentID        *string           `json:"agentId,omitempty"`
	Context        *string           `json:"context,omitempty"`
	Model          *string           `json:"model,omitempty"`          // AC107: optional model override
	Attachments    []agentAttachment `json:"attachments,omitempty"`    // AC56: multimodal images
	ReasoningEffort *string          `json:"reasoningEffort,omitempty"` // AC108: low/medium/high
}

// AgentChatHandler proxies POST /api/v1/agent/chat to the Python agent-service
// and streams the Vercel AI Data Stream Protocol SSE response back to the client.
// Phase 22d: AC6 + AC79.
func AgentChatHandler(agentServiceBaseURL string) http.HandlerFunc {
	baseURL := strings.TrimRight(strings.TrimSpace(agentServiceBaseURL), "/")
	if baseURL == "" {
		baseURL = "http://127.0.0.1:8094"
	}
	upstreamURL := baseURL + "/api/v1/agent/chat"

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}

		// Read and re-encode the request body to validate it.
		var reqBody agentChatRequestBody
		if err := decodeJSONBody(r, &reqBody); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("invalid request: %v", err)})
			return
		}
		if strings.TrimSpace(reqBody.Message) == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "message is required"})
			return
		}

		upstreamBody, err := json.Marshal(reqBody)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to encode request"})
			return
		}

		upstreamReq, err := http.NewRequestWithContext(r.Context(), http.MethodPost, upstreamURL, bytes.NewReader(upstreamBody))
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("build upstream request: %v", err)})
			return
		}
		upstreamReq.Header.Set("Content-Type", "application/json")
		upstreamReq.Header.Set("Accept", "text/event-stream")

		// Forward auth headers from the incoming request context.
		for _, h := range []string{
			"X-Auth-User-Id",
			"X-Auth-User-Role",
			"X-Auth-User-Email",
			"X-Request-ID",
		} {
			if v := r.Header.Get(h); v != "" {
				upstreamReq.Header.Set(h, v)
			}
		}

		upstreamResp, err := agentChatHTTPClient.Do(upstreamReq)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "agent service unavailable"})
			return
		}
		defer func() { _ = upstreamResp.Body.Close() }()

		if upstreamResp.StatusCode != http.StatusOK {
			// Forward non-200 errors as JSON 502.
			body, _ := io.ReadAll(io.LimitReader(upstreamResp.Body, 4096))
			writeJSON(w, http.StatusBadGateway, map[string]any{
				"error":          "agent service returned non-200",
				"upstream_status": upstreamResp.StatusCode,
				"detail":         string(body),
			})
			return
		}

		// Set Vercel AI Data Stream Protocol headers (AC79).
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("X-Accel-Buffering", "no")
		w.Header().Set("x-vercel-ai-ui-message-stream", "v1")
		w.WriteHeader(http.StatusOK)

		// Stream response body directly — flush after each write so the client
		// receives chunks as they arrive rather than when the buffer fills.
		flusher, canFlush := w.(http.Flusher)
		buf := make([]byte, 4096)
		for {
			n, readErr := upstreamResp.Body.Read(buf)
			if n > 0 {
				if _, writeErr := w.Write(buf[:n]); writeErr != nil {
					// Client disconnected — stop streaming.
					return
				}
				if canFlush {
					flusher.Flush()
				}
			}
			if readErr != nil {
				// io.EOF is the normal end-of-stream.
				return
			}
		}
	}
}
