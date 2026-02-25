package http

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalIngestAdminProxyClient interface {
	Do(ctx context.Context, method, path string, payload []byte, headers map[string]string) (status int, body []byte, err error)
}

type geopoliticalContradictionsReplaceStore interface {
	ReplaceAll(items []geopoliticalServices.GeoContradiction) error
}

type geopoliticalTimelineReplaceStore interface {
	ReplaceAll(items []geopoliticalServices.GeoTimelineEntry) error
}

type geopoliticalIngestRunsStore interface {
	Append(run geopoliticalServices.GeoIngestRun) (*geopoliticalServices.GeoIngestRun, error)
}

func GeopoliticalIngestAdminProxyHandler(
	client geopoliticalIngestAdminProxyClient,
	upstreamPath string,
	store geopoliticalCandidateQueueStore,
	contradictionsStore geopoliticalContradictionsReplaceStore,
	timelineStore geopoliticalTimelineReplaceStore,
	runsStore geopoliticalIngestRunsStore,
	shadowCompare bool,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		startedAt := timeNowRFC3339()
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical ingest/admin proxy unavailable"})
			return
		}

		payload, err := io.ReadAll(r.Body)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}

		status, body, err := client.Do(r.Context(), http.MethodPost, upstreamPath, payload, forwardedGeopoliticalCandidateHeaders(r))
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geopolitical ingest/admin proxy request failed"})
			return
		}
		if status <= 0 {
			status = http.StatusOK
		}
		candidateSyncCount := 0
		if status >= 200 && status < 300 {
			if store != nil {
				candidateSyncCount = countCandidatesInResponse(body)
				_ = syncCandidateStoreFromResponse(store, body)
			}
			if strings.HasSuffix(strings.TrimSpace(upstreamPath), "/api/geopolitical/seed") {
				_ = refreshCandidateQueueStoreFromNext(r.Context(), client, store, forwardedGeopoliticalCandidateHeaders(r))
				_ = refreshContradictionsStoreFromNext(r.Context(), client, contradictionsStore, forwardedGeopoliticalCandidateHeaders(r))
				_ = refreshTimelineStoreFromNext(r.Context(), client, timelineStore, forwardedGeopoliticalCandidateHeaders(r))
			}
		}
		recordIngestProxyRun(r, client, store, runsStore, shadowCompare, upstreamPath, status, body, startedAt, candidateSyncCount)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_, _ = w.Write(body)
	}
}

func recordIngestProxyRun(
	r *http.Request,
	client geopoliticalIngestAdminProxyClient,
	store geopoliticalCandidateQueueStore,
	runsStore geopoliticalIngestRunsStore,
	shadowCompare bool,
	upstreamPath string,
	status int,
	body []byte,
	startedAt string,
	candidateSyncCount int,
) {
	if runsStore == nil {
		return
	}
	kind := "unknown"
	switch strings.TrimSpace(upstreamPath) {
	case "/api/geopolitical/candidates/ingest/hard":
		kind = "hard"
	case "/api/geopolitical/candidates/ingest/soft":
		kind = "soft"
	case "/api/geopolitical/seed":
		kind = "seed"
	}
	run := geopoliticalServices.GeoIngestRun{
		Kind:               kind,
		Mode:               "next-proxy",
		UpstreamPath:       upstreamPath,
		Actor:              geoActorFromRequest(r),
		RequestID:          strings.TrimSpace(r.Header.Get("X-Request-ID")),
		StatusCode:         status,
		Success:            status >= 200 && status < 300,
		StartedAt:          startedAt,
		FinishedAt:         timeNowRFC3339(),
		CandidateSyncCount: candidateSyncCount,
		AdapterStats:       adapterStatsFromIngestResponse(body),
	}
	if shadowCompare && kind != "seed" {
		nextCount, goCount, err := compareOpenCandidateCounts(r.Context(), client, store, forwardedGeopoliticalCandidateHeaders(r))
		if err == nil {
			run.NextOpenCount = &nextCount
			run.GoOpenCount = &goCount
			delta := goCount - nextCount
			run.OpenCountDelta = &delta
		} else {
			run.Notes = append(run.Notes, "shadow_compare_failed")
		}
	}
	_, _ = runsStore.Append(run)
}

func refreshCandidateQueueStoreFromNext(
	ctx context.Context,
	client geopoliticalIngestAdminProxyClient,
	store geopoliticalCandidateQueueStore,
	headers map[string]string,
) error {
	if client == nil || store == nil {
		return nil
	}
	status, body, err := client.Do(ctx, http.MethodGet, "/api/geopolitical/candidates?state=open", nil, headers)
	if err != nil || status < 200 || status >= 300 {
		return err
	}
	return syncCandidateStoreFromResponse(store, body)
}

func compareOpenCandidateCounts(
	ctx context.Context,
	client geopoliticalIngestAdminProxyClient,
	store geopoliticalCandidateQueueStore,
	headers map[string]string,
) (nextOpenCount int, goOpenCount int, err error) {
	if client == nil || store == nil {
		return 0, 0, nil
	}
	status, body, err := client.Do(ctx, http.MethodGet, "/api/geopolitical/candidates?state=open", nil, headers)
	if err != nil || status < 200 || status >= 300 {
		return 0, 0, err
	}
	var parsed struct {
		Candidates []map[string]any `json:"candidates"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return 0, 0, nil
	}
	items, listErr := store.List(geopoliticalServices.CandidateListFilters{State: "open"})
	if listErr != nil {
		return len(parsed.Candidates), 0, listErr
	}
	return len(parsed.Candidates), len(items), nil
}

func refreshContradictionsStoreFromNext(
	ctx context.Context,
	client geopoliticalIngestAdminProxyClient,
	store geopoliticalContradictionsReplaceStore,
	headers map[string]string,
) error {
	if client == nil || store == nil {
		return nil
	}
	status, body, err := client.Do(ctx, http.MethodGet, "/api/geopolitical/contradictions", nil, headers)
	if err != nil || status < 200 || status >= 300 {
		return err
	}
	var parsed struct {
		Contradictions []geopoliticalServices.GeoContradiction `json:"contradictions"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil
	}
	return store.ReplaceAll(parsed.Contradictions)
}

func refreshTimelineStoreFromNext(
	ctx context.Context,
	client geopoliticalIngestAdminProxyClient,
	store geopoliticalTimelineReplaceStore,
	headers map[string]string,
) error {
	if client == nil || store == nil {
		return nil
	}
	status, body, err := client.Do(ctx, http.MethodGet, "/api/geopolitical/timeline?limit=500", nil, headers)
	if err != nil || status < 200 || status >= 300 {
		return err
	}
	var parsed struct {
		Timeline []geopoliticalServices.GeoTimelineEntry `json:"timeline"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil
	}
	return store.ReplaceAll(parsed.Timeline)
}

func countCandidatesInResponse(payload []byte) int {
	var parsed map[string]any
	if err := json.Unmarshal(payload, &parsed); err != nil {
		return 0
	}
	if candidates, ok := parsed["candidates"].([]any); ok {
		return len(candidates)
	}
	if _, ok := parsed["candidate"].(map[string]any); ok {
		return 1
	}
	return 0
}

func adapterStatsFromIngestResponse(payload []byte) []map[string]any {
	if len(payload) == 0 {
		return nil
	}
	var parsed map[string]any
	if err := json.Unmarshal(payload, &parsed); err != nil {
		return nil
	}
	raw, ok := parsed["adapters"].([]any)
	if !ok {
		return nil
	}
	out := make([]map[string]any, 0, len(raw))
	for _, item := range raw {
		if mapped, ok := item.(map[string]any); ok {
			out = append(out, mapped)
		}
	}
	return out
}

func timeNowRFC3339() string {
	return time.Now().UTC().Format(time.RFC3339)
}
