package http

import (
	"context"
	"net/http"
	"regexp"
	"strconv"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"
	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

var datePattern = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)

type geopoliticalEventsClient interface {
	ListEvents(ctx context.Context, query geopoliticalServices.Query) ([]geopoliticalServices.Event, error)
}

func GeopoliticalEventsHandler(client geopoliticalEventsClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		source := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("source")))
		if source == "" {
			source = "acled"
		}
		if source != "acled" && source != "gdelt" {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalEventsData]{
				Success: false,
				Error:   "invalid source, expected acled or gdelt",
			})
			return
		}

		query := geopoliticalServices.Query{
			Source:       source,
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
				writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalEventsData]{
					Success: false,
					Error:   "invalid limit",
				})
				return
			}
			query.Limit = parsedLimit
		}

		if query.StartDate != "" && !datePattern.MatchString(query.StartDate) {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalEventsData]{
				Success: false,
				Error:   "invalid from date format, expected YYYY-MM-DD",
			})
			return
		}
		if query.EndDate != "" && !datePattern.MatchString(query.EndDate) {
			writeJSON(w, http.StatusBadRequest, contracts.APIResponse[*contracts.GeopoliticalEventsData]{
				Success: false,
				Error:   "invalid to date format, expected YYYY-MM-DD",
			})
			return
		}

		items, err := client.ListEvents(r.Context(), query)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, contracts.APIResponse[*contracts.GeopoliticalEventsData]{
				Success: false,
				Error:   "geopolitical events request failed",
			})
			return
		}

		mappedItems := make([]contracts.GeopoliticalEvent, 0, len(items))
		for _, item := range items {
			mappedItems = append(mappedItems, contracts.GeopoliticalEvent{
				ID:           item.ID,
				URL:          item.URL,
				EventDate:    item.EventDate,
				Country:      item.Country,
				Region:       item.Region,
				EventType:    item.EventType,
				SubEventType: item.SubEventType,
				Actor1:       item.Actor1,
				Actor2:       item.Actor2,
				Fatalities:   item.Fatalities,
				Location:     item.Location,
				Latitude:     item.Latitude,
				Longitude:    item.Longitude,
				Source:       item.Source,
				Notes:        item.Notes,
			})
		}

		writeJSON(w, http.StatusOK, contracts.APIResponse[*contracts.GeopoliticalEventsData]{
			Success: true,
			Data: &contracts.GeopoliticalEventsData{
				Source: source,
				Filters: contracts.GeopoliticalEventsFilters{
					Source:       source,
					Country:      query.Country,
					Region:       query.Region,
					EventType:    query.EventType,
					SubEventType: query.SubEventType,
					StartDate:    query.StartDate,
					EndDate:      query.EndDate,
					Limit:        query.Limit,
				},
				Items: mappedItems,
			},
		})
	}
}
