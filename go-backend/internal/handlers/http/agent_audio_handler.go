package http

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// agentAudioHTTPClient is shared for audio proxy calls.
// No streaming — responses are buffered (transcript JSON or audio bytes).
var agentAudioHTTPClient = agentChatHTTPClient // reuse same 5-min timeout client

// agentAudioProxyHandler is the shared implementation for audio proxy routes.
// It proxies POST requests to the Python agent-service, forwarding auth headers,
// and streams (or buffers) the response back to the client.
// Phase 22f: ACR-A2, ACR-A6.
func agentAudioProxyHandler(agentServiceBaseURL string, upstreamPath string) http.HandlerFunc {
	baseURL := strings.TrimRight(strings.TrimSpace(agentServiceBaseURL), "/")
	if baseURL == "" {
		baseURL = "http://127.0.0.1:8094"
	}
	upstreamURL := baseURL + upstreamPath

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}

		// Read and validate body size (audio payloads can be large — cap at 25 MB).
		const maxBodyBytes = 25 << 20 // 25 MB
		body, err := io.ReadAll(io.LimitReader(r.Body, maxBodyBytes+1))
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("read body: %v", err)})
			return
		}
		if int64(len(body)) > maxBodyBytes {
			writeJSON(w, http.StatusRequestEntityTooLarge, map[string]string{"error": "request body exceeds 25 MB limit"})
			return
		}
		if !json.Valid(body) {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "request body is not valid JSON"})
			return
		}

		upstreamReq, err := http.NewRequestWithContext(r.Context(), http.MethodPost, upstreamURL, bytes.NewReader(body))
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": fmt.Sprintf("build upstream request: %v", err)})
			return
		}
		upstreamReq.Header.Set("Content-Type", "application/json")

		// Forward auth headers.
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

		upstreamResp, err := agentAudioHTTPClient.Do(upstreamReq)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "agent service unavailable"})
			return
		}
		defer func() { _ = upstreamResp.Body.Close() }()

		if upstreamResp.StatusCode != http.StatusOK {
			errBody, _ := io.ReadAll(io.LimitReader(upstreamResp.Body, 4096))
			writeJSON(w, http.StatusBadGateway, map[string]any{
				"error":           "agent service returned non-200",
				"upstream_status": upstreamResp.StatusCode,
				"detail":          string(errBody),
			})
			return
		}

		// Forward Content-Type from upstream (JSON for transcribe, audio/mpeg for synthesize).
		ct := upstreamResp.Header.Get("Content-Type")
		if ct != "" {
			w.Header().Set("Content-Type", ct)
		}
		if cd := upstreamResp.Header.Get("Content-Disposition"); cd != "" {
			w.Header().Set("Content-Disposition", cd)
		}
		w.WriteHeader(http.StatusOK)
		_, _ = io.Copy(w, upstreamResp.Body)
	}
}

// AgentAudioTranscribeHandler proxies POST /api/v1/audio/transcribe to the Python agent-service.
// Accepts JSON body: { audio_base64, mime_type?, language? }
// Returns JSON: { ok, text } or { ok, error }.
// Phase 22f: ACR-A2.
func AgentAudioTranscribeHandler(agentServiceBaseURL string) http.HandlerFunc {
	return agentAudioProxyHandler(agentServiceBaseURL, "/api/v1/audio/transcribe")
}

// AgentAudioSynthesizeHandler proxies POST /api/v1/audio/synthesize to the Python agent-service.
// Accepts JSON body: { text, voice?, model? }
// Returns audio/mpeg bytes.
// Phase 22f: ACR-A6.
func AgentAudioSynthesizeHandler(agentServiceBaseURL string) http.HandlerFunc {
	return agentAudioProxyHandler(agentServiceBaseURL, "/api/v1/audio/synthesize")
}
