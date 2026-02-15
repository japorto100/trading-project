package http

import (
	"encoding/json"
	"net/http"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func HealthHandler(client *gct.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		gctHealth := client.Health(r.Context())

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"ok":      true,
			"service": "go-gateway",
			"gct":     gctHealth,
		})
	}
}
