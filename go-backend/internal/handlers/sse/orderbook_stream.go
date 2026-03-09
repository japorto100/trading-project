package sse

import (
	"context"
	"net/http"

	"tradeviewfusion/go-backend/internal/contracts"
)

type orderbookStreamClient interface {
	OpenOrderbookStream(ctx context.Context, target contracts.MarketTarget) (<-chan contracts.OrderbookSnapshot, <-chan error, error)
}

func OrderbookStreamHandler(client orderbookStreamClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if client == nil {
			http.Error(w, "orderbook stream client unavailable", http.StatusServiceUnavailable)
			return
		}

		params, err := resolveStreamParams(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")

		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming unsupported", http.StatusInternalServerError)
			return
		}

		snapshotChannel, errorChannel, streamErr := client.OpenOrderbookStream(r.Context(), params.Target)
		if streamErr != nil {
			http.Error(w, streamErr.Error(), http.StatusBadGateway)
			return
		}

		w.WriteHeader(http.StatusOK)
		flusher.Flush()

		for {
			select {
			case <-r.Context().Done():
				return
			case err, ok := <-errorChannel:
				if !ok {
					return
				}
				_ = writeSSEEvent(w, "upstream_error", map[string]string{"message": err.Error()})
				flusher.Flush()
				return
			case snapshot, ok := <-snapshotChannel:
				if !ok {
					return
				}
				_ = writeSSEEvent(w, "orderbook", snapshot)
				flusher.Flush()
			}
		}
	}
}
