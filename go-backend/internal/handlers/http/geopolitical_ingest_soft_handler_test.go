package http

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

type fakeGeopoliticalSoftIngestNewsClient struct {
	items []marketServices.Headline
	err   error
	calls []struct {
		symbol string
		query  string
		lang   string
		limit  int
	}
}

func (f *fakeGeopoliticalSoftIngestNewsClient) Headlines(_ context.Context, symbol string, query string, lang string, limit int) ([]marketServices.Headline, error) {
	f.calls = append(f.calls, struct {
		symbol string
		query  string
		lang   string
		limit  int
	}{symbol: symbol, query: query, lang: lang, limit: limit})
	if f.err != nil {
		return nil, f.err
	}
	return append([]marketServices.Headline(nil), f.items...), nil
}

type fakeGeopoliticalSoftIngestSignalClient struct {
	status   int
	body     []byte
	err      error
	lastPath string
	lastBody []byte
	calls    int
}

func (f *fakeGeopoliticalSoftIngestSignalClient) PostJSON(_ context.Context, path string, payload []byte) (int, []byte, error) {
	f.calls++
	f.lastPath = path
	f.lastBody = append([]byte(nil), payload...)
	return f.status, f.body, f.err
}

func TestGeopoliticalSoftIngestHandler_CreatesCandidatesLocally(t *testing.T) {
	news := &fakeGeopoliticalSoftIngestNewsClient{
		items: []marketServices.Headline{{
			Title:       "FOMC signals possible cut after inflation cools",
			URL:         "https://example.test/news/fomc-cut",
			Source:      "reuters",
			PublishedAt: time.Date(2026, 2, 23, 12, 0, 0, 0, time.UTC),
			Summary:     "Markets react to expected policy pivot.",
		}},
	}
	signals := &fakeGeopoliticalSoftIngestSignalClient{
		status: http.StatusOK,
		body:   []byte(`{"candidates":[{"headline":"FOMC policy narrative softening","confidence":0.71,"severityHint":2,"regionHint":"north-america","countryHints":["US"],"sourceRefs":[{"provider":"reuters","url":"https://example.test/news/fomc-cut","title":"FOMC signals possible cut after inflation cools","publishedAt":"2026-02-23T12:00:00Z","sourceTier":"A","reliability":0.88}],"symbol":"percent","category":"monetary_policy_rates"}]}`),
	}
	store := &fakeGeopoliticalCandidateQueueStore{}
	runs := &fakeGeopoliticalIngestRunsStore{}

	handler := GeopoliticalSoftIngestHandler(news, signals, store, runs)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/soft", strings.NewReader(`{"adapters":["news_cluster"],"limit":12}`))
	req.Header.Set("X-Auth-User", "analyst.zoe")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if signals.calls != 1 || signals.lastPath != "/api/v1/cluster-headlines" {
		t.Fatalf("expected one signal call to cluster endpoint, got calls=%d path=%q", signals.calls, signals.lastPath)
	}
	if len(news.calls) != 1 || news.calls[0].limit != 12 {
		t.Fatalf("expected one news call with limit override 12, got %+v", news.calls)
	}
	if store.upsertedOne == nil {
		t.Fatalf("expected candidate upsert")
	}
	if got := store.upsertedOne["triggerType"]; got != "news_cluster" {
		t.Fatalf("expected triggerType news_cluster, got %v", got)
	}
	if got := store.upsertedOne["state"]; got != "open" {
		t.Fatalf("expected state open, got %v", got)
	}
	if len(runs.runs) != 1 || runs.runs[0].Kind != "soft" || runs.runs[0].Mode != "go-owned-gateway-v1" {
		t.Fatalf("expected soft ingest run record, got %+v", runs.runs)
	}
	if !strings.Contains(res.Body.String(), `"mode":"go-owned-gateway-v1"`) {
		t.Fatalf("unexpected response body: %s", res.Body.String())
	}
}

func TestGeopoliticalSoftIngestHandler_DryRunSkipsStoreWrites(t *testing.T) {
	news := &fakeGeopoliticalSoftIngestNewsClient{
		items: []marketServices.Headline{{
			Title:       "Sanctions narrative accelerates in Europe",
			URL:         "https://example.test/news/sanctions-eu",
			Source:      "bloomberg",
			PublishedAt: time.Now().UTC(),
		}},
	}
	signals := &fakeGeopoliticalSoftIngestSignalClient{
		status: http.StatusOK,
		body:   []byte(`{"candidates":[{"headline":"Sanctions narrative shift","confidence":0.62,"severityHint":3,"regionHint":"europe","countryHints":["DE"]}]}`),
	}
	store := &fakeGeopoliticalCandidateQueueStore{}

	handler := GeopoliticalSoftIngestHandler(news, signals, store, nil)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/soft", strings.NewReader(`{"dryRun":true,"adapters":["narrative_shift"]}`))
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if store.upsertedOne != nil || store.lastGetID != "" {
		t.Fatalf("expected no store writes in dryRun, got upsert=%+v get=%q", store.upsertedOne, store.lastGetID)
	}
	if !strings.Contains(res.Body.String(), `"createdCount":0`) {
		t.Fatalf("expected createdCount 0 in dryRun response, got %s", res.Body.String())
	}
}

func TestGeopoliticalSoftIngestHandler_Errors(t *testing.T) {
	t.Run("nil dependencies", func(t *testing.T) {
		handler := GeopoliticalSoftIngestHandler(nil, nil, nil, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/soft", strings.NewReader(`{}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d", res.Code)
		}
	})

	t.Run("method not allowed", func(t *testing.T) {
		handler := GeopoliticalSoftIngestHandler(&fakeGeopoliticalSoftIngestNewsClient{}, &fakeGeopoliticalSoftIngestSignalClient{}, nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/ingest/soft", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected 405, got %d", res.Code)
		}
	})

	t.Run("adapter errors become adapter stats", func(t *testing.T) {
		news := &fakeGeopoliticalSoftIngestNewsClient{err: errors.New("boom")}
		signals := &fakeGeopoliticalSoftIngestSignalClient{status: http.StatusOK, body: []byte(`{"candidates":[]}`)}
		runs := &fakeGeopoliticalIngestRunsStore{}
		handler := GeopoliticalSoftIngestHandler(news, signals, nil, runs)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/soft", strings.NewReader(`{"adapters":["news_cluster"]}`))
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", res.Code)
		}
		if signals.calls != 0 {
			t.Fatalf("expected no softsignals call when news fetch fails, got %d", signals.calls)
		}
		if len(runs.runs) != 1 || len(runs.runs[0].AdapterStats) != 1 {
			t.Fatalf("expected run with adapter stats, got %+v", runs.runs)
		}
	})
}
