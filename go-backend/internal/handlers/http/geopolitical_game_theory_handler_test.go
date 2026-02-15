package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type fakeGeopoliticalGameTheoryClient struct {
	result    geopoliticalServices.GameTheoryImpactResult
	err       error
	lastQuery geopoliticalServices.Query
}

func (f *fakeGeopoliticalGameTheoryClient) AnalyzeImpact(_ context.Context, query geopoliticalServices.Query) (geopoliticalServices.GameTheoryImpactResult, error) {
	f.lastQuery = query
	if f.err != nil {
		return geopoliticalServices.GameTheoryImpactResult{}, f.err
	}
	return f.result, nil
}

func TestGeopoliticalGameTheoryHandlerReturnsStableContract(t *testing.T) {
	t.Parallel()

	client := &fakeGeopoliticalGameTheoryClient{
		result: geopoliticalServices.GameTheoryImpactResult{
			Source: "game_theory_heuristic_v1",
			Summary: geopoliticalServices.GameTheorySummary{
				AnalyzedEvents: 2,
				AvgImpactScore: 0.71,
				RiskOffCount:   2,
				TopRegion:      "Europe",
			},
			Items: []geopoliticalServices.GameTheoryImpactItem{
				{
					ID:          "gt-1",
					EventID:     "ev-1",
					EventTitle:  "Battles: Ukraine",
					Region:      "Europe",
					MarketBias:  "risk_off",
					ImpactScore: 0.73,
					Confidence:  0.66,
					Drivers:     []string{"fatalities_high"},
					Symbols:     []string{"DAX", "EURUSD"},
					EventDate:   "2026-02-15T00:00:00Z",
				},
			},
		},
	}

	handler := GeopoliticalGameTheoryImpactHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/game-theory/impact?country=Ukraine&limit=12", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body struct {
		Success bool `json:"success"`
		Data    struct {
			Source  string `json:"source"`
			Summary struct {
				AnalyzedEvents int `json:"analyzedEvents"`
			} `json:"summary"`
			Items []struct {
				MarketBias string `json:"marketBias"`
				EventID    string `json:"eventId"`
			} `json:"items"`
		} `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success=true")
	}
	if body.Data.Source != "acled+game_theory_heuristic_v1" {
		t.Fatalf("unexpected source %q", body.Data.Source)
	}
	if body.Data.Summary.AnalyzedEvents != 2 {
		t.Fatalf("expected analyzedEvents=2, got %d", body.Data.Summary.AnalyzedEvents)
	}
	if len(body.Data.Items) != 1 || body.Data.Items[0].EventID != "ev-1" {
		t.Fatalf("unexpected items payload")
	}
}

func TestGeopoliticalGameTheoryHandlerRejectsInvalidDate(t *testing.T) {
	t.Parallel()

	handler := GeopoliticalGameTheoryImpactHandler(&fakeGeopoliticalGameTheoryClient{})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/game-theory/impact?from=20260215", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}

func TestGeopoliticalGameTheoryHandlerMapsServiceErrors(t *testing.T) {
	t.Parallel()

	handler := GeopoliticalGameTheoryImpactHandler(&fakeGeopoliticalGameTheoryClient{
		err: errors.New("boom"),
	})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/game-theory/impact", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusBadGateway {
		t.Fatalf("expected status 502, got %d", res.Code)
	}
}
