package http

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

func TestGeopoliticalSeedHandler_TopsUpGoOwnedStores(t *testing.T) {
	tmp := t.TempDir()
	candidates := geopoliticalServices.NewCandidateReviewStore(filepath.Join(tmp, "candidates.json"))
	contradictions := geopoliticalServices.NewContradictionsStore(filepath.Join(tmp, "contradictions.json"))
	timeline := geopoliticalServices.NewTimelineStore(filepath.Join(tmp, "timeline.json"))
	events := geopoliticalServices.NewEventsStore(filepath.Join(tmp, "events.json"))
	runs := geopoliticalServices.NewIngestRunsStore(filepath.Join(tmp, "runs.json"))

	handler := GeopoliticalSeedHandler(candidates, contradictions, timeline, events, runs)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/admin/seed", strings.NewReader(`{"targets":{"events":3,"candidates":8,"contradictions":2}}`))
	req.Header.Set("X-Auth-User", "analyst.seed")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", res.Code, res.Body.String())
	}
	body := res.Body.String()
	if !strings.Contains(body, `"success":true`) || !strings.Contains(body, `"scope":"earth-phase4"`) {
		t.Fatalf("unexpected response body: %s", body)
	}
	if !strings.Contains(body, `"events":3`) || !strings.Contains(body, `"candidates":8`) || !strings.Contains(body, `"contradictions":2`) {
		t.Fatalf("expected seeded target counts in response, got %s", body)
	}

	eventItems, err := events.List(100)
	if err != nil {
		t.Fatalf("list events: %v", err)
	}
	if len(eventItems) != 3 {
		t.Fatalf("expected 3 events, got %d", len(eventItems))
	}
	candidateItems, err := candidates.List(geopoliticalServices.CandidateListFilters{})
	if err != nil {
		t.Fatalf("list candidates: %v", err)
	}
	if len(candidateItems) != 8 {
		t.Fatalf("expected 8 candidates, got %d", len(candidateItems))
	}
	contradictionItems, err := contradictions.List(geopoliticalServices.ContradictionListFilters{})
	if err != nil {
		t.Fatalf("list contradictions: %v", err)
	}
	if len(contradictionItems) != 2 {
		t.Fatalf("expected 2 contradictions, got %d", len(contradictionItems))
	}
	timelineItems, err := timeline.List("", 100)
	if err != nil {
		t.Fatalf("list timeline: %v", err)
	}
	if len(timelineItems) < 5 {
		t.Fatalf("expected timeline audit entries for seed creates, got %d", len(timelineItems))
	}
	runItems, err := runs.List(geopoliticalServices.IngestRunsListFilters{Kind: "seed", Limit: 10})
	if err != nil {
		t.Fatalf("list ingest runs: %v", err)
	}
	if len(runItems) != 1 || runItems[0].Mode != "go-owned-gateway-v1" {
		t.Fatalf("expected one seed ingest run, got %+v", runItems)
	}
}

func TestGeopoliticalSeedHandler_Errors(t *testing.T) {
	t.Run("method not allowed", func(t *testing.T) {
		handler := GeopoliticalSeedHandler(nil, nil, nil, nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/admin/seed", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected 405, got %d", res.Code)
		}
	})

	t.Run("dependencies unavailable", func(t *testing.T) {
		handler := GeopoliticalSeedHandler(nil, nil, nil, nil, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/admin/seed", strings.NewReader(`{}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d", res.Code)
		}
	})
}
