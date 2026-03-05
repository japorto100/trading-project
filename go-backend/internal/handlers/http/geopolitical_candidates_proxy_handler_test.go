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

type fakeGeopoliticalCandidatesProxyClient struct {
	status      int
	body        []byte
	err         error
	lastMethod  string
	lastPath    string
	lastBody    []byte
	lastHeaders map[string]string
}

func (f *fakeGeopoliticalCandidatesProxyClient) Do(_ context.Context, method, path string, payload []byte, headers map[string]string) (int, []byte, error) {
	f.lastMethod = method
	f.lastPath = path
	f.lastBody = append([]byte(nil), payload...)
	f.lastHeaders = map[string]string{}
	for k, v := range headers {
		f.lastHeaders[k] = v
	}
	return f.status, f.body, f.err
}

type fakeGeopoliticalCandidateQueueStore struct {
	items          []map[string]any
	lastFilters    geopoliticalServices.CandidateListFilters
	upsertedOne    map[string]any
	upsertedMany   []map[string]any
	lastGetID      string
	lastUpdateID   string
	lastStatePatch geopoliticalServices.CandidateStateUpdate
	listErr        error
	upsertOneErr   error
	upsertManyErr  error
	getErr         error
	updateStateErr error
}

func (f *fakeGeopoliticalCandidateQueueStore) List(filters geopoliticalServices.CandidateListFilters) ([]map[string]any, error) {
	f.lastFilters = filters
	if f.listErr != nil {
		return nil, f.listErr
	}
	return f.items, nil
}

func (f *fakeGeopoliticalCandidateQueueStore) UpsertCandidate(candidate map[string]any) error {
	f.upsertedOne = candidate
	return f.upsertOneErr
}

func (f *fakeGeopoliticalCandidateQueueStore) UpsertCandidates(candidates []map[string]any) error {
	f.upsertedMany = candidates
	return f.upsertManyErr
}

func (f *fakeGeopoliticalCandidateQueueStore) Get(id string) (map[string]any, error) {
	f.lastGetID = id
	if f.getErr != nil {
		return nil, f.getErr
	}
	for _, item := range f.items {
		if item["id"] == id {
			cloned := map[string]any{}
			for k, v := range item {
				cloned[k] = v
			}
			return cloned, nil
		}
	}
	return nil, nil
}

func (f *fakeGeopoliticalCandidateQueueStore) UpdateState(id string, patch geopoliticalServices.CandidateStateUpdate) (map[string]any, map[string]any, error) {
	f.lastUpdateID = id
	f.lastStatePatch = patch
	if f.updateStateErr != nil {
		return nil, nil, f.updateStateErr
	}
	for index, item := range f.items {
		if item["id"] != id {
			continue
		}
		before := map[string]any{}
		for k, v := range item {
			before[k] = v
		}
		next := map[string]any{}
		for k, v := range item {
			next[k] = v
		}
		if patch.State != "" {
			next["state"] = patch.State
		}
		if patch.ReviewNote != nil {
			next["reviewNote"] = *patch.ReviewNote
		}
		if patch.MergedIntoEventID != nil {
			next["mergedIntoEventId"] = *patch.MergedIntoEventID
		}
		f.items[index] = next
		return before, next, nil
	}
	return nil, nil, nil
}

type fakeGeopoliticalTimelineStore struct {
	appended  []geopoliticalServices.GeoTimelineEntry
	appendErr error
}

func (f *fakeGeopoliticalTimelineStore) List(_ string, _ int) ([]geopoliticalServices.GeoTimelineEntry, error) {
	return nil, nil
}

func (f *fakeGeopoliticalTimelineStore) Append(entry geopoliticalServices.GeoTimelineEntry) (*geopoliticalServices.GeoTimelineEntry, error) {
	if f.appendErr != nil {
		return nil, f.appendErr
	}
	f.appended = append(f.appended, entry)
	cloned := entry
	return &cloned, nil
}

type fakeGeopoliticalEventsStore struct {
	created []geopoliticalServices.CreateGeoEventRecordInput
	sources []struct {
		eventID string
		source  map[string]any
		actor   string
	}
	createErr    error
	addSourceErr error
}

func (f *fakeGeopoliticalEventsStore) Create(input geopoliticalServices.CreateGeoEventRecordInput) (*geopoliticalServices.GeoEventRecord, error) {
	if f.createErr != nil {
		return nil, f.createErr
	}
	f.created = append(f.created, input)
	return &geopoliticalServices.GeoEventRecord{
		ID:      "ge_evt_1",
		Title:   input.Title,
		Status:  input.Status,
		Sources: []map[string]any{},
	}, nil
}

func (f *fakeGeopoliticalEventsStore) AddSource(eventID string, source map[string]any, actor string) (*geopoliticalServices.GeoEventRecord, error) {
	if f.addSourceErr != nil {
		return nil, f.addSourceErr
	}
	f.sources = append(f.sources, struct {
		eventID string
		source  map[string]any
		actor   string
	}{eventID: eventID, source: source, actor: actor})
	return &geopoliticalServices.GeoEventRecord{ID: eventID}, nil
}

func TestGeopoliticalCandidatesProxyHandler_ForwardsListAndReviewActions(t *testing.T) {
	t.Run("list GET reads from store with filters", func(t *testing.T) {
		store := &fakeGeopoliticalCandidateQueueStore{
			items: []map[string]any{{"id": "c1", "headline": "Fed", "state": "open"}},
		}
		handler := GeopoliticalCandidatesProxyHandler(nil, store, nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/candidates?state=open&q=fed&regionHint=europe&minConfidence=0.7", nil)
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", res.Code)
		}
		if store.lastFilters.State != "open" || store.lastFilters.Query != "fed" || store.lastFilters.RegionHint != "europe" {
			t.Fatalf("unexpected filters: %+v", store.lastFilters)
		}
		if store.lastFilters.MinConfidence == nil || *store.lastFilters.MinConfidence != 0.7 {
			t.Fatalf("expected minConfidence 0.7, got %+v", store.lastFilters.MinConfidence)
		}
	})

	t.Run("base POST creates candidate locally and appends timeline", func(t *testing.T) {
		store := &fakeGeopoliticalCandidateQueueStore{}
		timeline := &fakeGeopoliticalTimelineStore{}
		handler := GeopoliticalCandidatesProxyHandler(nil, store, timeline, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates", strings.NewReader(`{
			"triggerType":"manual_import",
			"headline":"Fed minutes mention broader disinflation",
			"confidence":0.83,
			"severityHint":3,
			"regionHint":"north-america",
			"routeTarget":"macro",
			"reviewAction":"human_review",
			"dedupHash":"1111111111111111111111111111111111111111111111111111111111111111",
			"countryHints":["US"],
			"sourceRefs":[{"provider":"fed","url":"https://example.test/fed"}]
		}`))
		req.Header.Set("X-Auth-User", "analyst.zoe")
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d body=%s", res.Code, res.Body.String())
		}
		if store.upsertedOne == nil {
			t.Fatalf("expected local candidate upsert")
		}
		if got := store.upsertedOne["state"]; got != "open" {
			t.Fatalf("expected state=open, got %v", got)
		}
		if got := store.upsertedOne["headline"]; got != "Fed minutes mention broader disinflation" {
			t.Fatalf("unexpected headline: %v", got)
		}
		if got := store.upsertedOne["routeTarget"]; got != "macro" {
			t.Fatalf("expected routeTarget=macro, got %v", got)
		}
		if got := store.upsertedOne["reviewAction"]; got != "human_review" {
			t.Fatalf("expected reviewAction=human_review, got %v", got)
		}
		if got := store.upsertedOne["dedupHash"]; got != "1111111111111111111111111111111111111111111111111111111111111111" {
			t.Fatalf("expected dedupHash persisted, got %v", got)
		}
		if len(timeline.appended) != 1 || timeline.appended[0].Action != "created" || timeline.appended[0].Actor != "analyst.zoe" {
			t.Fatalf("expected created timeline append, got %+v", timeline.appended)
		}
		if !strings.Contains(res.Body.String(), `"deduped":false`) {
			t.Fatalf("expected deduped=false response, got %s", res.Body.String())
		}
	})

	t.Run("accept POST without local event deps returns 503 and does not proxy", func(t *testing.T) {
		client := &fakeGeopoliticalCandidatesProxyClient{
			status: http.StatusOK,
			body:   []byte(`{"success":true,"candidate":{"id":"c-123","state":"accepted","headline":"Fed update"},"event":{"id":"evt-9"}}`),
		}
		store := &fakeGeopoliticalCandidateQueueStore{
			items: []map[string]any{{
				"id":       "c-123",
				"headline": "Fed update",
				"state":    "open",
			}},
		}
		timeline := &fakeGeopoliticalTimelineStore{}
		handler := GeopoliticalCandidatesProxyHandler(client, store, timeline, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates/c-123/accept", strings.NewReader(`{"analystNote":"ok"}`))
		req.Header.Set("X-Auth-User", "analyst.alex")
		req.Header.Set("X-User-Role", "analyst")
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d", res.Code)
		}
		if client.lastPath != "" {
			t.Fatalf("expected no proxy call, got path %q", client.lastPath)
		}
	})

	t.Run("accept POST can be handled locally with go event store", func(t *testing.T) {
		store := &fakeGeopoliticalCandidateQueueStore{
			items: []map[string]any{{
				"id":           "c-88",
				"headline":     "ECB decision",
				"state":        "open",
				"regionHint":   "europe",
				"confidence":   0.82,
				"severityHint": 3,
				"sourceRefs": []any{
					map[string]any{"provider": "ecb", "url": "https://example.test/ecb"},
				},
			}},
		}
		timeline := &fakeGeopoliticalTimelineStore{}
		events := &fakeGeopoliticalEventsStore{}
		handler := GeopoliticalCandidatesProxyHandler(nil, store, timeline, events)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates/c-88/accept", strings.NewReader(`{}`))
		req.Header.Set("X-Auth-User", "analyst.mina")
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", res.Code)
		}
		if len(events.created) != 1 {
			t.Fatalf("expected 1 local event create, got %d", len(events.created))
		}
		if events.created[0].Title != "ECB decision" || events.created[0].Actor != "analyst.mina" {
			t.Fatalf("unexpected local event create input: %+v", events.created[0])
		}
		if len(events.sources) != 1 || events.sources[0].eventID != "ge_evt_1" {
			t.Fatalf("expected source linked to created event, got %+v", events.sources)
		}
		if store.lastStatePatch.State != "accepted" || store.lastStatePatch.MergedIntoEventID == nil || *store.lastStatePatch.MergedIntoEventID != "ge_evt_1" {
			t.Fatalf("expected accepted patch with mergedIntoEventId, got %+v", store.lastStatePatch)
		}
		if len(timeline.appended) != 1 || timeline.appended[0].Action != "candidate_accepted" || timeline.appended[0].EventID != "ge_evt_1" {
			t.Fatalf("expected local candidate_accepted timeline entry, got %+v", timeline.appended)
		}
	})

	t.Run("reject POST is handled locally via go store and appends timeline audit", func(t *testing.T) {
		store := &fakeGeopoliticalCandidateQueueStore{
			items: []map[string]any{{"id": "c-77", "headline": "OFAC update", "state": "open"}},
		}
		timeline := &fakeGeopoliticalTimelineStore{}
		handler := GeopoliticalCandidatesProxyHandler(nil, store, timeline, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates/c-77/reject", strings.NewReader(`{"reviewNote":"duplicate source"}`))
		req.Header.Set("X-Auth-User", "analyst.sam")
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", res.Code)
		}
		if store.lastGetID != "c-77" || store.lastUpdateID != "c-77" {
			t.Fatalf("expected local store get/update for c-77, got get=%q update=%q", store.lastGetID, store.lastUpdateID)
		}
		if store.lastStatePatch.State != "rejected" {
			t.Fatalf("expected rejected state patch, got %+v", store.lastStatePatch)
		}
		if store.lastStatePatch.ReviewNote == nil || *store.lastStatePatch.ReviewNote != "duplicate source" {
			t.Fatalf("expected reviewNote patch, got %+v", store.lastStatePatch.ReviewNote)
		}
		if len(timeline.appended) != 1 {
			t.Fatalf("expected 1 timeline event, got %d", len(timeline.appended))
		}
		if timeline.appended[0].Action != "candidate_rejected" || timeline.appended[0].Actor != "analyst.sam" {
			t.Fatalf("unexpected timeline entry: %+v", timeline.appended[0])
		}
	})

	t.Run("base POST ignores mode query and remains local go-owned create", func(t *testing.T) {
		store := &fakeGeopoliticalCandidateQueueStore{}
		timeline := &fakeGeopoliticalTimelineStore{}
		handler := GeopoliticalCandidatesProxyHandler(&fakeGeopoliticalCandidatesProxyClient{}, store, timeline, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates?mode=hard", strings.NewReader(`{
			"triggerType":"manual_import",
			"headline":"BoJ guidance shifts with inflation surprise"
		}`))
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusCreated {
			t.Fatalf("expected 201, got %d body=%s", res.Code, res.Body.String())
		}
		if store.upsertedOne == nil {
			t.Fatalf("expected local candidate upsert")
		}
	})

	t.Run("reclassify POST updates candidate metadata locally", func(t *testing.T) {
		store := &fakeGeopoliticalCandidateQueueStore{
			items: []map[string]any{{
				"id":         "c-90",
				"headline":   "Macro narrative update",
				"state":      "open",
				"category":   "news_narrative",
				"symbol":     "newspaper",
				"regionHint": "global",
			}},
		}
		timeline := &fakeGeopoliticalTimelineStore{}
		handler := GeopoliticalCandidatesProxyHandler(nil, store, timeline, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates/c-90/reclassify", strings.NewReader(`{
			"category":"macro_policy",
			"symbol":"percent",
			"routeTarget":"macro",
			"reviewAction":"auto_route",
			"regionHint":"europe",
			"reviewNote":"reclassify via queue"
		}`))
		req.Header.Set("X-Auth-User", "analyst.lee")
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", res.Code, res.Body.String())
		}
		if store.upsertedOne == nil {
			t.Fatalf("expected local upsert for reclassify")
		}
		if got := store.upsertedOne["category"]; got != "macro_policy" {
			t.Fatalf("expected category updated, got %v", got)
		}
		if got := store.upsertedOne["symbol"]; got != "percent" {
			t.Fatalf("expected symbol updated, got %v", got)
		}
		if got := store.upsertedOne["routeTarget"]; got != "macro" {
			t.Fatalf("expected routeTarget updated, got %v", got)
		}
		if got := store.upsertedOne["reviewAction"]; got != "auto_route" {
			t.Fatalf("expected reviewAction updated, got %v", got)
		}
		if len(timeline.appended) != 1 || timeline.appended[0].Action != "note_updated" {
			t.Fatalf("expected note_updated timeline append, got %+v", timeline.appended)
		}
	})
}

func TestGeopoliticalCandidatesProxyHandler_ValidationAndErrors(t *testing.T) {
	t.Run("nil client", func(t *testing.T) {
		handler := GeopoliticalCandidatesProxyHandler(nil, nil, nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/candidates", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d", res.Code)
		}
	})

	t.Run("unsupported subroute", func(t *testing.T) {
		handler := GeopoliticalCandidatesProxyHandler(&fakeGeopoliticalCandidatesProxyClient{}, &fakeGeopoliticalCandidateQueueStore{}, nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/candidates/c-1/history", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", res.Code)
		}
	})

	t.Run("action rejects GET", func(t *testing.T) {
		handler := GeopoliticalCandidatesProxyHandler(&fakeGeopoliticalCandidatesProxyClient{}, &fakeGeopoliticalCandidateQueueStore{}, nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/candidates/c-1/accept", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected 405, got %d", res.Code)
		}
	})

	t.Run("upstream error", func(t *testing.T) {
		handler := GeopoliticalCandidatesProxyHandler(&fakeGeopoliticalCandidatesProxyClient{err: errors.New("boom")}, nil, nil, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates", strings.NewReader(`{"headline":"Alpha beta gamma","triggerType":"manual_import"}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadGateway {
			t.Fatalf("expected 502, got %d", res.Code)
		}
	})

	t.Run("proxy forwards request-id and auth headers", func(t *testing.T) {
		client := &fakeGeopoliticalCandidatesProxyClient{
			status: http.StatusOK,
			body:   []byte(`{"success":true}`),
		}
		handler := GeopoliticalCandidatesProxyHandler(client, nil, nil, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates", strings.NewReader(`{"headline":"Alpha beta gamma","triggerType":"manual_import"}`))
		req.Header.Set("X-Request-ID", "req-123")
		req.Header.Set("X-User-Role", "analyst")
		req.Header.Set("X-Auth-User", "analyst.jo")
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", res.Code)
		}
		if client.lastHeaders["X-Request-ID"] != "req-123" {
			t.Fatalf("expected X-Request-ID passthrough, got %+v", client.lastHeaders)
		}
		if client.lastHeaders["X-User-Role"] != "analyst" || client.lastHeaders["X-Auth-User"] != "analyst.jo" {
			t.Fatalf("expected auth passthrough headers, got %+v", client.lastHeaders)
		}
	})

	t.Run("store read error on GET", func(t *testing.T) {
		handler := GeopoliticalCandidatesProxyHandler(nil, &fakeGeopoliticalCandidateQueueStore{listErr: errors.New("boom")}, nil, nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/candidates", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadGateway {
			t.Fatalf("expected 502, got %d", res.Code)
		}
	})

	t.Run("accept without proxy client returns 503", func(t *testing.T) {
		handler := GeopoliticalCandidatesProxyHandler(nil, &fakeGeopoliticalCandidateQueueStore{
			items: []map[string]any{{"id": "c-1", "headline": "Event", "state": "open"}},
		}, nil, nil)
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/candidates/c-1/accept", strings.NewReader(`{}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected 503, got %d", res.Code)
		}
	})
}
