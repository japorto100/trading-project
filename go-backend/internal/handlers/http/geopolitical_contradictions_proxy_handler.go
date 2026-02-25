package http

import (
	"context"
	"io"
	"net/http"
	"strings"
)

type geopoliticalContradictionsProxyClient interface {
	Do(ctx context.Context, method, path string, payload []byte, headers map[string]string) (status int, body []byte, err error)
}

func GeopoliticalContradictionsProxyHandler(client geopoliticalContradictionsProxyClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical contradictions proxy unavailable"})
			return
		}

		targetPath, ok := mapGeopoliticalContradictionsProxyPath(r)
		if !ok {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "unsupported geopolitical contradictions route"})
			return
		}
		if !isSupportedGeopoliticalContradictionsMethod(r.Method, r.URL.Path) {
			w.Header().Set("Allow", "GET, POST, PATCH")
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}

		var payload []byte
		if r.Method == http.MethodPost || r.Method == http.MethodPatch {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
				return
			}
			payload = body
		}

		status, body, err := client.Do(r.Context(), r.Method, targetPath, payload, forwardedGeopoliticalCandidateHeaders(r))
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geopolitical contradictions proxy request failed"})
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

func mapGeopoliticalContradictionsProxyPath(r *http.Request) (string, bool) {
	requestURI := r.URL.RequestURI()
	const prefix = "/api/v1/geopolitical/contradictions"
	if !strings.HasPrefix(requestURI, prefix) {
		return "", false
	}
	suffix := strings.TrimPrefix(requestURI, "/api/v1")
	if suffix == "" {
		return "", false
	}
	if suffix == "/geopolitical/contradictions" || strings.HasPrefix(suffix, "/geopolitical/contradictions?") {
		return "/api" + suffix, true
	}
	pathOnly := r.URL.Path
	if !strings.HasPrefix(pathOnly, prefix+"/") {
		return "", false
	}
	rest := strings.TrimPrefix(pathOnly, prefix+"/")
	if strings.TrimSpace(rest) == "" || strings.Contains(rest, "/") {
		return "", false
	}
	return "/api/geopolitical/contradictions/" + rest, true
}

func isSupportedGeopoliticalContradictionsMethod(method, path string) bool {
	const exact = "/api/v1/geopolitical/contradictions"
	if path == exact {
		return method == http.MethodGet || method == http.MethodPost
	}
	if strings.HasPrefix(path, exact+"/") {
		return method == http.MethodGet || method == http.MethodPatch
	}
	return false
}

func GeopoliticalTimelineProxyHandler(client geopoliticalContradictionsProxyClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical timeline proxy unavailable"})
			return
		}

		targetPath := "/api/geopolitical/timeline"
		if rawQuery := strings.TrimSpace(r.URL.RawQuery); rawQuery != "" {
			targetPath += "?" + rawQuery
		}

		status, body, err := client.Do(r.Context(), http.MethodGet, targetPath, nil, forwardedGeopoliticalCandidateHeaders(r))
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geopolitical timeline proxy request failed"})
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
