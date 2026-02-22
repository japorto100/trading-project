package geopolitical

import (
	"context"
	"fmt"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/acled"
	"tradeviewfusion/go-backend/internal/connectors/gdelt"
)

const (
	defaultLimit = 50
	maxLimit     = 500
)

type acledEventsFetcher interface {
	FetchEvents(ctx context.Context, query acled.Query) ([]acled.Event, error)
}

// Backward-compatible alias used by game-theory service wiring in the same package.
type eventsFetcher = acledEventsFetcher

type gdeltEventsFetcher interface {
	FetchEvents(ctx context.Context, query gdelt.Query) ([]gdelt.Event, error)
}

type Query struct {
	Source       string
	Country      string
	Region       string
	EventType    string
	SubEventType string
	StartDate    string
	EndDate      string
	Limit        int
}

type Event struct {
	ID           string
	URL          string
	EventDate    string
	Country      string
	Region       string
	EventType    string
	SubEventType string
	Actor1       string
	Actor2       string
	Fatalities   int
	Location     string
	Latitude     float64
	Longitude    float64
	Source       string
	Notes        string
}

type EventsService struct {
	acledClient acledEventsFetcher
	gdeltClient gdeltEventsFetcher
}

func NewEventsService(acledClient acledEventsFetcher, gdeltClient gdeltEventsFetcher) *EventsService {
	return &EventsService{
		acledClient: acledClient,
		gdeltClient: gdeltClient,
	}
}

func (s *EventsService) ListEvents(ctx context.Context, query Query) ([]Event, error) {
	if s == nil {
		return nil, fmt.Errorf("geopolitical events service unavailable")
	}

	normalizedSource := normalizeSource(query.Source)
	normalized := Query{
		Source:       normalizedSource,
		Country:      strings.TrimSpace(query.Country),
		Region:       strings.TrimSpace(query.Region),
		EventType:    strings.TrimSpace(query.EventType),
		SubEventType: strings.TrimSpace(query.SubEventType),
		StartDate:    strings.TrimSpace(query.StartDate),
		EndDate:      strings.TrimSpace(query.EndDate),
		Limit:        normalizeLimit(query.Limit),
	}

	switch normalizedSource {
	case "acled":
		if s.acledClient == nil {
			return nil, fmt.Errorf("acled events client unavailable")
		}
		items, err := s.acledClient.FetchEvents(ctx, acled.Query{
			Country:      normalized.Country,
			Region:       normalized.Region,
			EventType:    normalized.EventType,
			SubEventType: normalized.SubEventType,
			StartDate:    normalized.StartDate,
			EndDate:      normalized.EndDate,
			Limit:        normalized.Limit,
		})
		if err != nil {
			return nil, err
		}
		result := make([]Event, 0, len(items))
		for _, item := range items {
			result = append(result, Event{
				ID:           item.ID,
				URL:          "",
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
		return result, nil
	case "gdelt":
		if s.gdeltClient == nil {
			return nil, fmt.Errorf("gdelt events client unavailable")
		}
		items, err := s.gdeltClient.FetchEvents(ctx, gdelt.Query{
			Country:      normalized.Country,
			Region:       normalized.Region,
			EventType:    normalized.EventType,
			SubEventType: normalized.SubEventType,
			StartDate:    normalized.StartDate,
			EndDate:      normalized.EndDate,
			Limit:        normalized.Limit,
		})
		if err != nil {
			return nil, err
		}
		result := make([]Event, 0, len(items))
		for _, item := range items {
			result = append(result, Event{
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
		return result, nil
	default:
		return nil, fmt.Errorf("unsupported source")
	}
}

func normalizeLimit(limit int) int {
	if limit <= 0 {
		return defaultLimit
	}
	if limit > maxLimit {
		return maxLimit
	}
	return limit
}

func normalizeSource(source string) string {
	normalized := strings.ToLower(strings.TrimSpace(source))
	if normalized == "" {
		return "acled"
	}
	if normalized == "gdelt" {
		return "gdelt"
	}
	return "acled"
}
