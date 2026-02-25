package http

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

func TestGeopoliticalContradictionsHandler_CreatePatchAndTimeline(t *testing.T) {
	dir := t.TempDir()
	contradictionsStore := geopoliticalServices.NewContradictionsStore(filepath.Join(dir, "contradictions.json"))
	timelineStore := geopoliticalServices.NewTimelineStore(filepath.Join(dir, "timeline.json"))
	handler := GeopoliticalContradictionsHandler(contradictionsStore, timelineStore)
	timelineHandler := GeopoliticalTimelineHandler(timelineStore)

	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/contradictions", strings.NewReader(`{
		"title":"Conflicting statements",
		"statementA":"A says escalation",
		"statementB":"B says de-escalation",
		"severityHint":4,
		"regionId":"mena"
	}`))
	createReq.Header.Set("Content-Type", "application/json")
	createReq.Header.Set("X-Geo-Actor", "analyst.zoe")
	createRes := httptest.NewRecorder()
	handler.ServeHTTP(createRes, createReq)
	if createRes.Code != http.StatusCreated {
		t.Fatalf("expected 201 create, got %d body=%s", createRes.Code, createRes.Body.String())
	}

	listReq := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/contradictions?state=open&regionId=mena", nil)
	listRes := httptest.NewRecorder()
	handler.ServeHTTP(listRes, listReq)
	if listRes.Code != http.StatusOK {
		t.Fatalf("expected 200 list, got %d body=%s", listRes.Code, listRes.Body.String())
	}

	items, err := contradictionsStore.List(geopoliticalServices.ContradictionListFilters{})
	if err != nil || len(items) != 1 {
		t.Fatalf("expected store contradiction after create, err=%v len=%d", err, len(items))
	}
	id := items[0].ID

	patchReq := httptest.NewRequest(http.MethodPatch, "/api/v1/geopolitical/contradictions/"+id, strings.NewReader(`{
		"state":"resolved",
		"resolution":{"outcome":"defer_monitoring","note":"await official source"},
		"addEvidence":[{"kind":"note","label":"Analyst note","note":"monitor next bulletin"}]
	}`))
	patchReq.Header.Set("Content-Type", "application/json")
	patchReq.Header.Set("X-Geo-Actor", "analyst.zoe")
	patchRes := httptest.NewRecorder()
	handler.ServeHTTP(patchRes, patchReq)
	if patchRes.Code != http.StatusOK {
		t.Fatalf("expected 200 patch, got %d body=%s", patchRes.Code, patchRes.Body.String())
	}

	updated, err := contradictionsStore.Get(id)
	if err != nil || updated == nil {
		t.Fatalf("expected updated contradiction, err=%v", err)
	}
	if updated.State != "resolved" || updated.Resolution == nil || len(updated.Evidence) != 1 {
		t.Fatalf("unexpected updated contradiction: %+v", updated)
	}

	tlReq := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/timeline?eventId=contradiction:"+id+"&limit=10", nil)
	tlRes := httptest.NewRecorder()
	timelineHandler.ServeHTTP(tlRes, tlReq)
	if tlRes.Code != http.StatusOK {
		t.Fatalf("expected 200 timeline, got %d body=%s", tlRes.Code, tlRes.Body.String())
	}
}

func TestGeopoliticalContradictionsHandler_Validation(t *testing.T) {
	handler := GeopoliticalContradictionsHandler(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/contradictions", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", res.Code)
	}
}
