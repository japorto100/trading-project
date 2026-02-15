package http

import (
	"context"
	"net/http"
	"strconv"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"
	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalGameTheoryClient interface {
	AnalyzeImpact(ctx context.Context, query geopoliticalServices.Query) (geopoliticalServices.GameTheoryImpactResult, error)
}

func GeopoliticalGameTheoryImpactHandler(client geopoliticalGameTheoryClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := geopoliticalServices.Query{
			Country:      strings.TrimSpace(r.URL.Query().Get("country")),
			Region:       strings.TrimSpace(r.URL.Query().Get("region")),
			EventType:    strings.TrimSpace(r.URL.Query().Get("eventType")),
			SubEventType: strings.TrimSpace(r.URL.Query().Get("subEventType")),
			StartDate:    strings.TrimSpace(r.URL.Query().Get("from")),
			EndDate:      strings.TrimSpace(r.URL.Query().Get("to")),
			Limit:        50,
		}

		if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
			parsedLimit, err := strconv.Atoi(rawLimit)
			if err != nil || parsedLimit < 1 || parsedLimit > 500 {
				writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalGameTheoryData]{
					Success: false,
					Error:   "invalid limit",
				})
				return
			}
			query.Limit = parsedLimit
		}

		if query.StartDate != "" && !datePattern.MatchString(query.StartDate) {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalGameTheoryData]{
				Success: false,
				Error:   "invalid from date format, expected YYYY-MM-DD",
			})
			return
		}
		if query.EndDate != "" && !datePattern.MatchString(query.EndDate) {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalGameTheoryData]{
				Success: false,
				Error:   "invalid to date format, expected YYYY-MM-DD",
			})
			return
		}

		result, err := client.AnalyzeImpact(r.Context(), query)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, contracts.APIResponse[*contracts.GeopoliticalGameTheoryData]{
				Success: false,
				Error:   "geopolitical game-theory request failed",
			})
			return
		}

		source := strings.TrimSpace(result.Source)
		if source == "" {
			source = "game_theory_heuristic_v1"
		}
		source = "acled+" + source

		mappedItems := make([]contracts.GeopoliticalGameTheoryImpactItem, 0, len(result.Items))
		for _, item := range result.Items {
			mappedItems = append(mappedItems, contracts.GeopoliticalGameTheoryImpactItem{
				ID:          item.ID,
				EventID:     item.EventID,
				EventTitle:  item.EventTitle,
				Region:      item.Region,
				MarketBias:  item.MarketBias,
				ImpactScore: item.ImpactScore,
				Confidence:  item.Confidence,
				Drivers:     append([]string{}, item.Drivers...),
				Symbols:     append([]string{}, item.Symbols...),
				EventDate:   item.EventDate,
			})
		}

		writeJSON(w, http.StatusOK, contracts.APIResponse[*contracts.GeopoliticalGameTheoryData]{
			Success: true,
			Data: &contracts.GeopoliticalGameTheoryData{
				Source: source,
				Filters: contracts.GeopoliticalGameTheoryFilters{
					Country:      query.Country,
					Region:       query.Region,
					EventType:    query.EventType,
					SubEventType: query.SubEventType,
					StartDate:    query.StartDate,
					EndDate:      query.EndDate,
					Limit:        query.Limit,
				},
				Summary: contracts.GeopoliticalGameTheorySummary{
					AnalyzedEvents: result.Summary.AnalyzedEvents,
					AvgImpactScore: result.Summary.AvgImpactScore,
					RiskOnCount:    result.Summary.RiskOnCount,
					RiskOffCount:   result.Summary.RiskOffCount,
					NeutralCount:   result.Summary.NeutralCount,
					TopRegion:      result.Summary.TopRegion,
				},
				Items: mappedItems,
			},
		})
	}
}
