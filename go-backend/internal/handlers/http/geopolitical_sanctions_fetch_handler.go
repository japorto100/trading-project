// Package http provides GeopoliticalSanctionsFetchHandler for Phase 14g.1.
// Triggers GeoMapSourcePack.FetchAndMapToCandidates and upserts results to the candidate store.
package http

import (
	"net/http"

	geomapsources "tradeviewfusion/go-backend/internal/connectors/geomapsources"
)

type geopoliticalSanctionsFetchStore interface {
	UpsertCandidates(candidates []map[string]any) error
}

// GeopoliticalSanctionsFetchHandler returns a handler that fetches sanctions deltas from OFAC, UN, SECO, EU
// and upserts them as GeoMap candidates. Phase 14g.1 bridge to 14.v1 (OFAC SDN Update → Auto-Candidate).
func GeopoliticalSanctionsFetchHandler(
	pack *geomapsources.GeoMapSourcePack,
	store geopoliticalSanctionsFetchStore,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if pack == nil || store == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "sanctions fetch unavailable"})
			return
		}
		candidates, err := pack.FetchAndMapToCandidates(r.Context())
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "sanctions fetch failed: " + err.Error()})
			return
		}
		if len(candidates) == 0 {
			writeJSON(w, http.StatusOK, map[string]any{
				"success":    true,
				"upserted":   0,
				"candidates": []any{},
				"note":       "No new sanctions deltas (Added) from OFAC, UN, SECO, EU.",
			})
			return
		}
		if err := store.UpsertCandidates(candidates); err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "candidate upsert failed: " + err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"success":    true,
			"upserted":   len(candidates),
			"candidates": candidates,
			"note":       "Sanctions deltas from OFAC, UN, SECO, EU mapped and upserted to GeoMap candidates.",
		})
	}
}
