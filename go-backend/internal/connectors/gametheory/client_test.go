package gametheory

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestClientScoreImpactSuccess(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", r.Method)
		}
		if r.URL.Path != defaultPath {
			t.Fatalf("expected path %s, got %s", defaultPath, r.URL.Path)
		}
		var body ImpactRequest
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		if len(body.Events) != 1 {
			t.Fatalf("expected one event, got %d", len(body.Events))
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(ImpactResponse{
			Source: "game_theory_heuristic_v1",
			Summary: ImpactSummary{
				AnalyzedEvents: 1,
				AvgImpactScore: 0.72,
				RiskOffCount:   1,
			},
			Items: []ImpactItem{
				{
					ID:          "gt-1",
					EventID:     "ev-1",
					EventTitle:  "Battles: Ukraine",
					Region:      "Europe",
					MarketBias:  "risk_off",
					ImpactScore: 0.72,
					Confidence:  0.65,
					Drivers:     []string{"fatalities_high"},
					Symbols:     []string{"DAX", "EURUSD"},
					EventDate:   "2026-02-15T00:00:00Z",
				},
			},
		})
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL:        server.URL,
		RequestTimeout: 2 * time.Second,
	})
	response, err := client.ScoreImpact(context.Background(), ImpactRequest{
		GeneratedAt: "2026-02-15T12:00:00Z",
		Limit:       10,
		Events: []InputEvent{
			{
				ID:        "ev-1",
				EventDate: "2026-02-15",
				Country:   "Ukraine",
				EventType: "Battles",
			},
		},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if response.Summary.AnalyzedEvents != 1 {
		t.Fatalf("expected analyzedEvents=1, got %d", response.Summary.AnalyzedEvents)
	}
	if len(response.Items) != 1 {
		t.Fatalf("expected one item, got %d", len(response.Items))
	}
}

func TestClientScoreImpactRejectsUpstreamStatus(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		http.Error(w, "upstream fail", http.StatusServiceUnavailable)
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL:        server.URL,
		RequestTimeout: 2 * time.Second,
	})
	_, err := client.ScoreImpact(context.Background(), ImpactRequest{
		GeneratedAt: "2026-02-15T12:00:00Z",
		Events: []InputEvent{
			{
				ID:        "ev-1",
				EventDate: "2026-02-15",
				Country:   "Ukraine",
				EventType: "Battles",
			},
		},
	})
	if err == nil {
		t.Fatal("expected error for upstream status")
	}
	if !strings.Contains(err.Error(), "status 503") {
		t.Fatalf("expected status hint in error, got %v", err)
	}
}

func TestClientScoreImpactEmptyEventsShortCircuit(t *testing.T) {
	t.Parallel()

	client := NewClient(Config{})
	response, err := client.ScoreImpact(context.Background(), ImpactRequest{
		GeneratedAt: "2026-02-15T12:00:00Z",
		Events:      []InputEvent{},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if response.Summary.AnalyzedEvents != 0 {
		t.Fatalf("expected analyzedEvents=0, got %d", response.Summary.AnalyzedEvents)
	}
	if len(response.Items) != 0 {
		t.Fatalf("expected no items, got %d", len(response.Items))
	}
}
