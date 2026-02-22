package http

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"
	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalContextClient interface {
	ListContext(ctx context.Context, query geopoliticalServices.ContextQuery) ([]geopoliticalServices.ContextItem, error)
}

func GeopoliticalContextHandler(client geopoliticalContextClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		source := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("source")))
		if source == "" {
			source = "all"
		}
		if source != "all" && source != "cfr" && source != "crisiswatch" {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalContextData]{
				Success: false,
				Error:   "invalid source, expected all|cfr|crisiswatch",
			})
			return
		}

		limit := 20
		if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
			parsedLimit, err := strconv.Atoi(rawLimit)
			if err != nil || parsedLimit < 1 || parsedLimit > 100 {
				writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalContextData]{
					Success: false,
					Error:   "invalid limit",
				})
				return
			}
			limit = parsedLimit
		}

		query := geopoliticalServices.ContextQuery{
			Source: source,
			Limit:  limit,
			Region: strings.TrimSpace(r.URL.Query().Get("region")),
			Query:  strings.TrimSpace(r.URL.Query().Get("q")),
		}

		items, err := client.ListContext(r.Context(), query)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, contracts.APIResponse[*contracts.GeopoliticalContextData]{
				Success: false,
				Error:   "geopolitical context request failed",
			})
			return
		}

		mapped := make([]contracts.GeopoliticalContextItem, 0, len(items))
		for _, item := range items {
			mapped = append(mapped, contracts.GeopoliticalContextItem{
				ID:          item.ID,
				Source:      item.Source,
				Title:       item.Title,
				URL:         item.URL,
				Summary:     item.Summary,
				PublishedAt: item.PublishedAt,
				Region:      item.Region,
			})
		}

		writeJSON(w, http.StatusOK, contracts.APIResponse[*contracts.GeopoliticalContextData]{
			Success: true,
			Data: &contracts.GeopoliticalContextData{
				Source: source,
				Filters: contracts.GeopoliticalContextFilters{
					Source: source,
					Query:  query.Query,
					Region: query.Region,
					Limit:  limit,
				},
				Items: mapped,
			},
		})
	}
}
