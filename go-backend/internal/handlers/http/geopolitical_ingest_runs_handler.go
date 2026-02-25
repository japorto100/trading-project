package http

import (
	"net/http"
	"strconv"
	"strings"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalIngestRunsListStore interface {
	List(filters geopoliticalServices.IngestRunsListFilters) ([]geopoliticalServices.GeoIngestRun, error)
}

func GeopoliticalIngestRunsHandler(store geopoliticalIngestRunsListStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if store == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "ingest runs store unavailable"})
			return
		}
		limit := 50
		if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
			if parsed, err := strconv.Atoi(raw); err == nil {
				limit = parsed
			}
		}
		items, err := store.List(geopoliticalServices.IngestRunsListFilters{
			Kind:  strings.TrimSpace(r.URL.Query().Get("kind")),
			Limit: limit,
		})
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "ingest runs read failed"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "runs": items})
	}
}
