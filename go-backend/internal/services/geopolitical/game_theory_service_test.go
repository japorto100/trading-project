package geopolitical

import (
	"context"
	"errors"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/acled"
	"tradeviewfusion/go-backend/internal/connectors/gametheory"
)

type fakeGameTheoryFetcher struct {
	events []acled.Event
	err    error
	query  acled.Query
}

func (f *fakeGameTheoryFetcher) FetchEvents(_ context.Context, query acled.Query) ([]acled.Event, error) {
	f.query = query
	if f.err != nil {
		return nil, f.err
	}
	return f.events, nil
}

type fakeGameTheoryScorer struct {
	response gametheory.ImpactResponse
	err      error
	input    gametheory.ImpactRequest
}

func (f *fakeGameTheoryScorer) ScoreImpact(_ context.Context, input gametheory.ImpactRequest) (gametheory.ImpactResponse, error) {
	f.input = input
	if f.err != nil {
		return gametheory.ImpactResponse{}, f.err
	}
	return f.response, nil
}

func TestGameTheoryServiceAnalyzeImpactMapsEvents(t *testing.T) {
	t.Parallel()

	fetcher := &fakeGameTheoryFetcher{
		events: []acled.Event{
			{
				ID:           "ev-1",
				EventDate:    "2026-02-15",
				Country:      "Ukraine",
				Region:       "Europe",
				EventType:    "Battles",
				SubEventType: "Armed clash",
				Fatalities:   12,
				Source:       "acled",
				Notes:        "escalation",
			},
		},
	}
	scorer := &fakeGameTheoryScorer{
		response: gametheory.ImpactResponse{
			Source: "game_theory_heuristic_v1",
			Summary: gametheory.ImpactSummary{
				AnalyzedEvents: 1,
			},
			Items: []gametheory.ImpactItem{
				{ID: "gt-1", EventID: "ev-1"},
			},
		},
	}

	service := NewGameTheoryService(fetcher, scorer)
	result, err := service.AnalyzeImpact(context.Background(), Query{
		Country: "Ukraine",
		Limit:   25,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if result.Summary.AnalyzedEvents != 1 {
		t.Fatalf("expected analyzedEvents=1, got %d", result.Summary.AnalyzedEvents)
	}
	if scorer.input.Limit != 25 {
		t.Fatalf("expected limit 25, got %d", scorer.input.Limit)
	}
	if len(scorer.input.Events) != 1 {
		t.Fatalf("expected one mapped event, got %d", len(scorer.input.Events))
	}
}

func TestGameTheoryServiceAnalyzeImpactPropagatesFetcherError(t *testing.T) {
	t.Parallel()

	service := NewGameTheoryService(
		&fakeGameTheoryFetcher{err: errors.New("fetch failed")},
		&fakeGameTheoryScorer{},
	)
	_, err := service.AnalyzeImpact(context.Background(), Query{})
	if err == nil {
		t.Fatal("expected fetcher error")
	}
}

func TestGameTheoryServiceAnalyzeImpactPropagatesScorerError(t *testing.T) {
	t.Parallel()

	service := NewGameTheoryService(
		&fakeGameTheoryFetcher{
			events: []acled.Event{
				{
					ID:        "ev-1",
					EventDate: "2026-02-15",
					Country:   "Ukraine",
					EventType: "Battles",
				},
			},
		},
		&fakeGameTheoryScorer{err: errors.New("score failed")},
	)
	_, err := service.AnalyzeImpact(context.Background(), Query{})
	if err == nil {
		t.Fatal("expected scorer error")
	}
}
