package http

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type fakeGeopoliticalIngestRunsListStore struct {
	items       []geopoliticalServices.GeoIngestRun
	lastFilters geopoliticalServices.IngestRunsListFilters
	err         error
}

func (f *fakeGeopoliticalIngestRunsListStore) List(filters geopoliticalServices.IngestRunsListFilters) ([]geopoliticalServices.GeoIngestRun, error) {
	f.lastFilters = filters
	if f.err != nil {
		return nil, f.err
	}
	return append([]geopoliticalServices.GeoIngestRun(nil), f.items...), nil
}

func TestGeopoliticalIngestRunsHandler(t *testing.T) {
	store := &fakeGeopoliticalIngestRunsListStore{
		items: []geopoliticalServices.GeoIngestRun{{ID: "gir_1", Kind: "hard", Mode: "next-proxy"}},
	}
	handler := GeopoliticalIngestRunsHandler(store)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/ingest/runs?kind=hard&limit=25", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if store.lastFilters.Kind != "hard" || store.lastFilters.Limit != 25 {
		t.Fatalf("unexpected filters passed to store: %+v", store.lastFilters)
	}
	body := res.Body.String()
	if !strings.Contains(body, "\"success\":true") || !strings.Contains(body, "\"gir_1\"") {
		t.Fatalf("unexpected response body: %s", body)
	}
}

func TestGeopoliticalMigrationStatusHandler(t *testing.T) {
	candidateStore := &fakeGeopoliticalCandidateQueueStore{
		items: []map[string]any{{"id": "c1", "state": "open"}, {"id": "c2", "state": "accepted"}},
	}
	contradictionsStore := &fakeGeopoliticalContradictionsStoreForMigration{
		items: []geopoliticalServices.GeoContradiction{
			{ID: "gct_1", State: "open"},
			{ID: "gct_2", State: "resolved"},
		},
	}
	timelineStore := &fakeGeopoliticalTimelineStore{}
	timelineStore.appended = []geopoliticalServices.GeoTimelineEntry{{ID: "gt1"}}
	runsStore := &fakeGeopoliticalIngestRunsListStore{
		items: []geopoliticalServices.GeoIngestRun{
			{ID: "gir_soft_1", Kind: "soft", Mode: "go-owned-gateway-v1", Success: true, StatusCode: 200, FinishedAt: "2026-02-23T10:00:00Z", CandidateSyncCount: 2},
			{ID: "gir_hard_1", Kind: "hard", Mode: "go-owned-gateway-v1", Success: true, StatusCode: 200, FinishedAt: "2026-02-23T09:00:00Z", CandidateSyncCount: 4},
		},
	}
	handler := GeopoliticalMigrationStatusHandler(GeopoliticalMigrationStatusConfig{
		CandidatesListMode:        "go-owned",
		CandidateRejectSnoozeMode: "go-owned",
		CandidateAcceptMode:       "go-owned",
		ContradictionsMode:        "go-owned",
		TimelineMode:              "go-owned",
		IngestHardMode:            "go-owned-gateway-v1",
		IngestSoftMode:            "go-owned-gateway-v1",
		AdminSeedMode:             "next-proxy+go-sync",
		IngestShadowCompare:       true,
		CandidatesStore:           candidateStore,
		ContradictionsStore:       contradictionsStore,
		TimelineStore:             timelineStore,
		IngestRunsStore:           runsStore,
	})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/migration/status", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	body := res.Body.String()
	if !strings.Contains(body, "\"candidatesList\"") || !strings.Contains(body, "\"go-owned\"") || !strings.Contains(body, "\"ingestShadowCompare\":true") {
		t.Fatalf("unexpected response body: %s", body)
	}
	if !strings.Contains(body, "\"diagnostics\"") || !strings.Contains(body, "\"openCandidates\":2") || !strings.Contains(body, "\"recentRuns\"") {
		t.Fatalf("expected diagnostics with counts and recent runs, got %s", body)
	}
}

type fakeGeopoliticalContradictionsStoreForMigration struct {
	items []geopoliticalServices.GeoContradiction
	err   error
}

func (f *fakeGeopoliticalContradictionsStoreForMigration) List(_ geopoliticalServices.ContradictionListFilters) ([]geopoliticalServices.GeoContradiction, error) {
	if f.err != nil {
		return nil, f.err
	}
	return append([]geopoliticalServices.GeoContradiction(nil), f.items...), nil
}
