package http

import (
	"context"
	"net/http"
	"strings"

	financebridge "tradeviewfusion/go-backend/internal/connectors/financebridge"
)

type searchClient interface {
	Search(ctx context.Context, query string) ([]financebridge.SearchResult, error)
}

func SearchHandler(client searchClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "search client unavailable"})
			return
		}

		query := strings.TrimSpace(r.URL.Query().Get("q"))
		if query == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": `Query parameter "q" is required (min 1 character)`})
			return
		}

		results, err := client.Search(r.Context(), query)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "symbol search request failed"})
			return
		}

		writeJSON(w, http.StatusOK, struct {
			Success bool                         `json:"success"`
			Query   string                       `json:"query"`
			Count   int                          `json:"count"`
			Results []financebridge.SearchResult `json:"results"`
		}{
			Success: true,
			Query:   query,
			Count:   len(results),
			Results: results,
		})
	}
}
