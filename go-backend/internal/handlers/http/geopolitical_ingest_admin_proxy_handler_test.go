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

type fakeGeopoliticalIngestAdminProxyClient struct {
	status      int
	body        []byte
	err         error
	doFunc      func(method, path string, payload []byte, headers map[string]string) (int, []byte, error)
	lastMethod  string
	lastPath    string
	lastBody    []byte
	lastHeaders map[string]string
}

func (f *fakeGeopoliticalIngestAdminProxyClient) Do(_ context.Context, method, path string, payload []byte, headers map[string]string) (int, []byte, error) {
	f.lastMethod = method
	f.lastPath = path
	f.lastBody = append([]byte(nil), payload...)
	f.lastHeaders = map[string]string{}
	for k, v := range headers {
		f.lastHeaders[k] = v
	}
	if f.doFunc != nil {
		return f.doFunc(method, path, payload, headers)
	}
	return f.status, f.body, f.err
}

type fakeGeopoliticalContradictionsReplaceStore struct {
	items      []geopoliticalServices.GeoContradiction
	replaceErr error
}

func (f *fakeGeopoliticalContradictionsReplaceStore) ReplaceAll(items []geopoliticalServices.GeoContradiction) error {
	if f.replaceErr != nil {
		return f.replaceErr
	}
	f.items = append([]geopoliticalServices.GeoContradiction(nil), items...)
	return nil
}

type fakeGeopoliticalTimelineReplaceStore struct {
	items      []geopoliticalServices.GeoTimelineEntry
	replaceErr error
}

func (f *fakeGeopoliticalTimelineReplaceStore) ReplaceAll(items []geopoliticalServices.GeoTimelineEntry) error {
	if f.replaceErr != nil {
		return f.replaceErr
	}
	f.items = append([]geopoliticalServices.GeoTimelineEntry(nil), items...)
	return nil
}

type fakeGeopoliticalIngestRunsStore struct {
	runs []geopoliticalServices.GeoIngestRun
	err  error
}

func (f *fakeGeopoliticalIngestRunsStore) Append(run geopoliticalServices.GeoIngestRun) (*geopoliticalServices.GeoIngestRun, error) {
	if f.err != nil {
		return nil, f.err
	}
	f.runs = append(f.runs, run)
	copy := run
	return &copy, nil
}

func TestGeopoliticalIngestAdminProxyHandler_ForwardsPost(t *testing.T) {
	client := &fakeGeopoliticalIngestAdminProxyClient{
		status: http.StatusOK,
		body:   []byte(`{"success":true,"candidates":[{"id":"c1","headline":"Fed","state":"open"}]}`),
	}
	store := &fakeGeopoliticalCandidateQueueStore{}
	runs := &fakeGeopoliticalIngestRunsStore{}
	handler := GeopoliticalIngestAdminProxyHandler(client, "/api/geopolitical/candidates/ingest/hard", store, nil, nil, runs, false)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/hard", strings.NewReader(`{"dryRun":true}`))
	req.Header.Set("X-Auth-User", "analyst.kai")
	req.Header.Set("X-User-Role", "analyst")
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if client.lastMethod != http.MethodPost {
		t.Fatalf("expected POST, got %s", client.lastMethod)
	}
	if client.lastPath != "/api/geopolitical/candidates/ingest/hard" {
		t.Fatalf("unexpected target path: %s", client.lastPath)
	}
	if string(client.lastBody) != `{"dryRun":true}` {
		t.Fatalf("unexpected body: %s", string(client.lastBody))
	}
	if got := client.lastHeaders["X-Geo-Actor"]; got != "analyst.kai" {
		t.Fatalf("expected X-Geo-Actor forwarded from X-Auth-User, got %q", got)
	}
	if len(store.upsertedMany) != 1 {
		t.Fatalf("expected store sync from candidates array, got %+v", store.upsertedMany)
	}
	if len(runs.runs) != 1 || runs.runs[0].Kind != "hard" || runs.runs[0].Mode != "next-proxy" {
		t.Fatalf("expected ingest run record, got %+v", runs.runs)
	}
}

func TestGeopoliticalIngestAdminProxyHandler_SeedRefreshesGoOwnedStores(t *testing.T) {
	client := &fakeGeopoliticalIngestAdminProxyClient{}
	client.doFunc = func(method, path string, payload []byte, _ map[string]string) (int, []byte, error) {
		switch {
		case method == http.MethodPost && path == "/api/geopolitical/seed":
			return http.StatusOK, []byte(`{"success":true,"scope":"earth-phase4"}`), nil
		case method == http.MethodGet && path == "/api/geopolitical/candidates?state=open":
			return http.StatusOK, []byte(`{"success":true,"candidates":[{"id":"c-seed-1","headline":"Seed","state":"open"}]}`), nil
		case method == http.MethodGet && path == "/api/geopolitical/contradictions":
			return http.StatusOK, []byte(`{"success":true,"contradictions":[{"id":"gctrd_seed1","title":"Seed contradiction","state":"open","statementA":"A","statementB":"B","sourceRefs":[],"evidence":[],"createdAt":"2026-02-23T10:00:00Z","updatedAt":"2026-02-23T10:00:00Z","createdBy":"seed","updatedBy":"seed"}]}`), nil
		case method == http.MethodGet && path == "/api/geopolitical/timeline?limit=500":
			return http.StatusOK, []byte(`{"success":true,"timeline":[{"id":"gt_seed1","eventId":"contradiction:gctrd_seed1","action":"contradiction_created","actor":"seed","at":"2026-02-23T10:00:00Z","diffSummary":"seeded"}]}`), nil
		default:
			return http.StatusNotFound, []byte(`{"error":"unexpected path"}`), nil
		}
	}
	candidateStore := &fakeGeopoliticalCandidateQueueStore{}
	contradictionsStore := &fakeGeopoliticalContradictionsReplaceStore{}
	timelineStore := &fakeGeopoliticalTimelineReplaceStore{}
	runs := &fakeGeopoliticalIngestRunsStore{}
	handler := GeopoliticalIngestAdminProxyHandler(client, "/api/geopolitical/seed", candidateStore, contradictionsStore, timelineStore, runs, false)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/admin/seed", strings.NewReader(`{}`))
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if len(candidateStore.upsertedMany) != 1 || candidateStore.upsertedMany[0]["id"] != "c-seed-1" {
		t.Fatalf("expected candidate seed refresh sync, got %+v", candidateStore.upsertedMany)
	}
	if len(contradictionsStore.items) != 1 || contradictionsStore.items[0].ID != "gctrd_seed1" {
		t.Fatalf("expected contradictions seed refresh sync, got %+v", contradictionsStore.items)
	}
	if len(timelineStore.items) != 1 || timelineStore.items[0].ID != "gt_seed1" {
		t.Fatalf("expected timeline seed refresh sync, got %+v", timelineStore.items)
	}
	if len(runs.runs) != 1 || runs.runs[0].Kind != "seed" {
		t.Fatalf("expected seed run record, got %+v", runs.runs)
	}
}

func TestGeopoliticalIngestAdminProxyHandler_ShadowCompareRecordsCounts(t *testing.T) {
	client := &fakeGeopoliticalIngestAdminProxyClient{}
	client.doFunc = func(method, path string, payload []byte, _ map[string]string) (int, []byte, error) {
		switch {
		case method == http.MethodPost && path == "/api/geopolitical/candidates/ingest/soft":
			return http.StatusOK, []byte(`{"success":true,"adapters":[{"provider":"reddit","count":2}],"candidates":[{"id":"c-soft-1","state":"open"}]}`), nil
		case method == http.MethodGet && path == "/api/geopolitical/candidates?state=open":
			return http.StatusOK, []byte(`{"success":true,"candidates":[{"id":"c-soft-1","state":"open"}]}`), nil
		default:
			return http.StatusNotFound, []byte(`{"error":"unexpected path"}`), nil
		}
	}
	store := &fakeGeopoliticalCandidateQueueStore{
		items: []map[string]any{{"id": "c-soft-1", "state": "open"}},
	}
	runs := &fakeGeopoliticalIngestRunsStore{}
	handler := GeopoliticalIngestAdminProxyHandler(client, "/api/geopolitical/candidates/ingest/soft", store, nil, nil, runs, true)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/soft", strings.NewReader(`{}`))
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if len(runs.runs) != 1 {
		t.Fatalf("expected 1 ingest run, got %d", len(runs.runs))
	}
	run := runs.runs[0]
	if run.Kind != "soft" || run.NextOpenCount == nil || run.GoOpenCount == nil || run.OpenCountDelta == nil {
		t.Fatalf("expected shadow compare counts on run, got %+v", run)
	}
	if len(run.AdapterStats) != 1 {
		t.Fatalf("expected adapter stats, got %+v", run.AdapterStats)
	}
}

func TestGeopoliticalIngestAdminProxyHandler_Errors(t *testing.T) {
	t.Run("method not allowed", func(t *testing.T) {
		handler := GeopoliticalIngestAdminProxyHandler(&fakeGeopoliticalIngestAdminProxyClient{}, "/x", nil, nil, nil, nil, false)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/ingest/hard", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected 405, got %d", res.Code)
		}
	})

	t.Run("nil client", func(t *testing.T) {
		handler := GeopoliticalIngestAdminProxyHandler(nil, "/x", nil, nil, nil, nil, false)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/hard", strings.NewReader(`{}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d", res.Code)
		}
	})

	t.Run("upstream error", func(t *testing.T) {
		handler := GeopoliticalIngestAdminProxyHandler(&fakeGeopoliticalIngestAdminProxyClient{err: errors.New("boom")}, "/x", nil, nil, nil, nil, false)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/ingest/hard", strings.NewReader(`{}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadGateway {
			t.Fatalf("expected 502, got %d", res.Code)
		}
	})
}
