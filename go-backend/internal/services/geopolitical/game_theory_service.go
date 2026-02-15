package geopolitical

import (
	"context"
	"fmt"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/acled"
	"tradeviewfusion/go-backend/internal/connectors/gametheory"
)

type gameTheoryScorer interface {
	ScoreImpact(ctx context.Context, input gametheory.ImpactRequest) (gametheory.ImpactResponse, error)
}

type GameTheoryService struct {
	eventsClient eventsFetcher
	scorer       gameTheoryScorer
}

type GameTheoryImpactItem struct {
	ID          string
	EventID     string
	EventTitle  string
	Region      string
	MarketBias  string
	ImpactScore float64
	Confidence  float64
	Drivers     []string
	Symbols     []string
	EventDate   string
}

type GameTheorySummary struct {
	AnalyzedEvents int
	AvgImpactScore float64
	RiskOnCount    int
	RiskOffCount   int
	NeutralCount   int
	TopRegion      string
}

type GameTheoryImpactResult struct {
	Source  string
	Summary GameTheorySummary
	Items   []GameTheoryImpactItem
}

func NewGameTheoryService(eventsClient eventsFetcher, scorer gameTheoryScorer) *GameTheoryService {
	return &GameTheoryService{
		eventsClient: eventsClient,
		scorer:       scorer,
	}
}

func (s *GameTheoryService) AnalyzeImpact(ctx context.Context, query Query) (GameTheoryImpactResult, error) {
	if s == nil || s.eventsClient == nil || s.scorer == nil {
		return GameTheoryImpactResult{}, fmt.Errorf("game-theory service unavailable")
	}

	normalized := acled.Query{
		Country:      strings.TrimSpace(query.Country),
		Region:       strings.TrimSpace(query.Region),
		EventType:    strings.TrimSpace(query.EventType),
		SubEventType: strings.TrimSpace(query.SubEventType),
		StartDate:    strings.TrimSpace(query.StartDate),
		EndDate:      strings.TrimSpace(query.EndDate),
		Limit:        normalizeLimit(query.Limit),
	}

	events, err := s.eventsClient.FetchEvents(ctx, normalized)
	if err != nil {
		return GameTheoryImpactResult{}, err
	}

	inputEvents := make([]gametheory.InputEvent, 0, len(events))
	for _, event := range events {
		if strings.TrimSpace(event.ID) == "" || strings.TrimSpace(event.EventType) == "" {
			continue
		}
		inputEvents = append(inputEvents, gametheory.InputEvent{
			ID:           event.ID,
			EventDate:    event.EventDate,
			Country:      event.Country,
			Region:       event.Region,
			EventType:    event.EventType,
			SubEventType: event.SubEventType,
			Fatalities:   event.Fatalities,
			Source:       event.Source,
			Notes:        event.Notes,
		})
	}

	scored, err := s.scorer.ScoreImpact(ctx, gametheory.ImpactRequest{
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
		Limit:       normalizeLimit(query.Limit),
		Events:      inputEvents,
	})
	if err != nil {
		return GameTheoryImpactResult{}, err
	}

	result := GameTheoryImpactResult{
		Source: strings.TrimSpace(scored.Source),
		Summary: GameTheorySummary{
			AnalyzedEvents: scored.Summary.AnalyzedEvents,
			AvgImpactScore: scored.Summary.AvgImpactScore,
			RiskOnCount:    scored.Summary.RiskOnCount,
			RiskOffCount:   scored.Summary.RiskOffCount,
			NeutralCount:   scored.Summary.NeutralCount,
			TopRegion:      strings.TrimSpace(scored.Summary.TopRegion),
		},
		Items: make([]GameTheoryImpactItem, 0, len(scored.Items)),
	}
	for _, item := range scored.Items {
		result.Items = append(result.Items, GameTheoryImpactItem{
			ID:          strings.TrimSpace(item.ID),
			EventID:     strings.TrimSpace(item.EventID),
			EventTitle:  strings.TrimSpace(item.EventTitle),
			Region:      strings.TrimSpace(item.Region),
			MarketBias:  strings.TrimSpace(item.MarketBias),
			ImpactScore: item.ImpactScore,
			Confidence:  item.Confidence,
			Drivers:     append([]string{}, item.Drivers...),
			Symbols:     append([]string{}, item.Symbols...),
			EventDate:   strings.TrimSpace(item.EventDate),
		})
	}
	if result.Source == "" {
		result.Source = "game_theory_heuristic_v1"
	}
	return result, nil
}
