package http

import (
	"context"
	"io"
	"net/http"
)

type indicatorProxyClient interface {
	PostJSON(ctx context.Context, path string, payload []byte) (status int, body []byte, err error)
}

func IndicatorProxyHandler(client indicatorProxyClient, upstreamPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "indicator proxy unavailable"})
			return
		}

		payload, err := io.ReadAll(r.Body)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}

		status, body, err := client.PostJSON(r.Context(), upstreamPath, payload)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "indicator proxy request failed"})
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
