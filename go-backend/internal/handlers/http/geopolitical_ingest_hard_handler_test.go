package http

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type fakeGeopoliticalEventsLister struct {
	items []geopoliticalServices.Event
	err   error
	last  geopoliticalServices.Query
	all   []geopoliticalServices.Query
	fn    func(geopoliticalServices.Query) ([]geopoliticalServices.Event, error)
}

func (f *fakeGeopoliticalEventsLister) ListEvents(_ context.Context, query geopoliticalServices.Query) ([]geopoliticalServices.Event, error) {
	f.last = query
	f.all = append(f.all, query)
	if f.fn != nil {
		return f.fn(query)
	}
	if f.err != nil {
		return nil, f.err
	}
	return append([]geopoliticalServices.Event(nil), f.items...), nil
}

func TestGeopoliticalHardIngestHandler_CreatesCandidatesLocally(t *testing.T) {
	events := &fakeGeopoliticalEventsLister{
		items: []geopoliticalServices.Event{
			{
				ID:         "acled-1",
				EventDate:  "2026-02-23",
				Country:    "DE",
				Region:     "Europe",
				EventType:  "Protests",
				Source:     "acled",
				URL:        "https://example.test/acled-1",
				Notes:      "Large protest in Berlin",
				Latitude:   52.52,
				Longitude:  13.40,
				Fatalities: 1,
			},
		},
	}
	store := &fakeGeopoliticalCandidateQueueStore{}
	runs := &fakeGeopoliticalIngestRunsStore{}
	handler := GeopoliticalHardIngestHandler(events, store, runs)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/hard", strings.NewReader(`{"source":"acled","limit":10}`))
	req.Header.Set("X-Auth-User", "analyst.lea")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if events.last.Source != "acled" || events.last.Limit != 10 {
		t.Fatalf("unexpected events query: %+v", events.last)
	}
	if store.upsertedOne == nil {
		t.Fatalf("expected local candidate upsert")
	}
	if got := store.upsertedOne["triggerType"]; got != "hard_signal" {
		t.Fatalf("expected triggerType hard_signal, got %v", got)
	}
	if len(runs.runs) != 1 || runs.runs[0].Kind != "hard" || runs.runs[0].Mode != "go-owned-gateway-v1" {
		t.Fatalf("expected hard ingest run record, got %+v", runs.runs)
	}
	body := res.Body.String()
	if !strings.Contains(body, "\"mode\":\"go-owned-gateway-v1\"") || !strings.Contains(body, "\"adapters\"") {
		t.Fatalf("unexpected response body: %s", body)
	}
}

func TestGeopoliticalHardIngestHandler_DryRunSkipsWrites(t *testing.T) {
	events := &fakeGeopoliticalEventsLister{
		items: []geopoliticalServices.Event{{ID: "acled-2", EventDate: "2026-02-23", Country: "US", Region: "North America", EventType: "Violence against civilians", Source: "acled"}},
	}
	store := &fakeGeopoliticalCandidateQueueStore{}
	handler := GeopoliticalHardIngestHandler(events, store, nil)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/hard", strings.NewReader(`{"dryRun":true}`))
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if store.upsertedOne != nil || store.lastGetID != "" {
		t.Fatalf("expected no store writes in dryRun, got store=%+v lastGet=%q", store.upsertedOne, store.lastGetID)
	}
}

func TestGeopoliticalHardIngestHandler_DegradesOnEventsFetchError(t *testing.T) {
	events := &fakeGeopoliticalEventsLister{err: errors.New("acled events client unavailable")}
	store := &fakeGeopoliticalCandidateQueueStore{}
	runs := &fakeGeopoliticalIngestRunsStore{}
	handler := GeopoliticalHardIngestHandler(events, store, runs)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/hard", strings.NewReader(`{}`))
	req.Header.Set("X-Auth-User", "analyst.lea")
	req.Header.Set("X-Request-ID", "rid-123")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200 on degraded hard ingest, got %d", res.Code)
	}
	body := res.Body.String()
	if !strings.Contains(body, `"success":true`) || !strings.Contains(body, `"ok":false`) {
		t.Fatalf("expected degraded adapter status in body, got %s", body)
	}
	if store.upsertedOne != nil {
		t.Fatalf("expected no candidate upsert on fetch error")
	}
	if len(runs.runs) != 1 {
		t.Fatalf("expected one ingest run, got %+v", runs.runs)
	}
	if runs.runs[0].StatusCode != http.StatusOK || !runs.runs[0].Success {
		t.Fatalf("expected degraded run recorded as HTTP 200 success, got %+v", runs.runs[0])
	}
	if len(runs.runs[0].AdapterStats) != 1 {
		t.Fatalf("expected adapter stats on degraded run, got %+v", runs.runs[0])
	}
}

func TestGeopoliticalHardIngestHandler_FallsBackToGdeltWhenAcledFails(t *testing.T) {
	events := &fakeGeopoliticalEventsLister{
		fn: func(query geopoliticalServices.Query) ([]geopoliticalServices.Event, error) {
			if query.Source == "acled" {
				return nil, errors.New("request /acled/read failed with status 401")
			}
			return []geopoliticalServices.Event{{
				ID:        "gdelt-1",
				EventDate: "2026-02-23",
				Country:   "US",
				Region:    "North America",
				EventType: "Protests",
				Source:    "gdelt",
				URL:       "https://example.test/gdelt-1",
			}}, nil
		},
	}
	store := &fakeGeopoliticalCandidateQueueStore{}
	runs := &fakeGeopoliticalIngestRunsStore{}
	handler := GeopoliticalHardIngestHandler(events, store, runs)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/hard", strings.NewReader(`{"source":"acled"}`))
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200 with fallback, got %d", res.Code)
	}
	if len(events.all) < 2 || events.all[0].Source != "acled" || events.all[1].Source != "gdelt" {
		t.Fatalf("expected acled->gdelt fallback sequence, got %+v", events.all)
	}
	body := res.Body.String()
	if !strings.Contains(body, `"adapterId":"gateway_events_gdelt"`) || !strings.Contains(body, `fallback:acled-`) {
		t.Fatalf("expected gdelt fallback response, got %s", body)
	}
	if store.upsertedOne == nil {
		t.Fatalf("expected candidate upsert after gdelt fallback")
	}
}
