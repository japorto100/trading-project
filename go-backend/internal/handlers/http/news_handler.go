package http

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

type newsClient interface {
	Headlines(ctx context.Context, symbol string, limit int) ([]marketServices.Headline, error)
}

func NewsHandler(client newsClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		symbol := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("symbol")))
		limit := 20
		if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
			parsedLimit, err := strconv.Atoi(rawLimit)
			if err != nil || parsedLimit < 1 || parsedLimit > 100 {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid limit"})
				return
			}
			limit = parsedLimit
		}

		items, err := client.Headlines(r.Context(), symbol, limit)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "news request failed"})
			return
		}

		response := struct {
			Success bool `json:"success"`
			Data    struct {
				Symbol string                    `json:"symbol"`
				Items  []marketServices.Headline `json:"items"`
			} `json:"data"`
		}{
			Success: true,
		}
		response.Data.Symbol = symbol
		response.Data.Items = items

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(response)
	}
}
