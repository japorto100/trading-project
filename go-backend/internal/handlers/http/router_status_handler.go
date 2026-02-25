package http

import "net/http"

type providerStateSnapshotter[T any] interface {
	Snapshot() []T
}

func RouterProvidersHandler[T any](snapshotter providerStateSnapshotter[T]) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if snapshotter == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "router unavailable"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"success":   true,
			"providers": snapshotter.Snapshot(),
		})
	}
}
