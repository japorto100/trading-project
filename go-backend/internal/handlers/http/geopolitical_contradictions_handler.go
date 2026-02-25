package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalContradictionsStore interface {
	List(filters geopoliticalServices.ContradictionListFilters) ([]geopoliticalServices.GeoContradiction, error)
	Get(id string) (*geopoliticalServices.GeoContradiction, error)
	Create(input geopoliticalServices.CreateContradictionInput) (*geopoliticalServices.GeoContradiction, error)
	Update(id, nextState, actor string, patch geopoliticalServices.PatchContradictionInput) (*geopoliticalServices.GeoContradiction, *geopoliticalServices.GeoContradiction, error)
}

type geopoliticalTimelineStore interface {
	List(eventID string, limit int) ([]geopoliticalServices.GeoTimelineEntry, error)
	Append(entry geopoliticalServices.GeoTimelineEntry) (*geopoliticalServices.GeoTimelineEntry, error)
}

func GeopoliticalContradictionsHandler(store geopoliticalContradictionsStore, timeline geopoliticalTimelineStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if store == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "contradictions store unavailable"})
			return
		}

		const basePath = "/api/v1/geopolitical/contradictions"
		if r.URL.Path == basePath {
			switch r.Method {
			case http.MethodGet:
				handleGeopoliticalContradictionsList(w, r, store)
			case http.MethodPost:
				handleGeopoliticalContradictionsCreate(w, r, store, timeline)
			default:
				w.Header().Set("Allow", "GET, POST")
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
			return
		}

		if !strings.HasPrefix(r.URL.Path, basePath+"/") {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		id := strings.TrimPrefix(r.URL.Path, basePath+"/")
		if id == "" || strings.Contains(id, "/") {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}

		switch r.Method {
		case http.MethodGet:
			handleGeopoliticalContradictionsGet(w, r, store, id)
		case http.MethodPatch:
			handleGeopoliticalContradictionsPatch(w, r, store, timeline, id)
		default:
			w.Header().Set("Allow", "GET, PATCH")
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		}
	}
}

func GeopoliticalTimelineHandler(store geopoliticalTimelineStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if store == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "timeline store unavailable"})
			return
		}
		eventID := strings.TrimSpace(r.URL.Query().Get("eventId"))
		limit := 120
		if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
			if parsed, err := strconv.Atoi(raw); err == nil {
				limit = parsed
			}
		}
		items, err := store.List(eventID, limit)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "timeline read failed"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "timeline": items})
	}
}

func handleGeopoliticalContradictionsList(w http.ResponseWriter, r *http.Request, store geopoliticalContradictionsStore) {
	state := strings.TrimSpace(r.URL.Query().Get("state"))
	if state != "" && state != "open" && state != "resolved" {
		state = ""
	}
	regionID := strings.TrimSpace(r.URL.Query().Get("regionId"))
	items, err := store.List(geopoliticalServices.ContradictionListFilters{
		State:    state,
		RegionID: regionID,
	})
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "contradictions list failed"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "contradictions": items})
}

func handleGeopoliticalContradictionsGet(w http.ResponseWriter, _ *http.Request, store geopoliticalContradictionsStore, id string) {
	item, err := store.Get(id)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "contradiction read failed"})
		return
	}
	if item == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "contradiction not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "contradiction": item})
}

func handleGeopoliticalContradictionsCreate(
	w http.ResponseWriter,
	r *http.Request,
	store geopoliticalContradictionsStore,
	timeline geopoliticalTimelineStore,
) {
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	title := trimStringMax(body["title"], 180)
	statementA := trimStringMax(body["statementA"], 800)
	statementB := trimStringMax(body["statementB"], 800)
	if title == "" || statementA == "" || statementB == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title, statementA and statementB are required"})
		return
	}
	actor := geoActorFromRequest(r)
	severityHint := intNumberField(body["severityHint"], 2)
	if severityHint < 1 || severityHint > 5 {
		severityHint = 2
	}
	created, err := store.Create(geopoliticalServices.CreateContradictionInput{
		Title:        title,
		SeverityHint: severityHint,
		RegionID:     trimStringMax(body["regionId"], 120),
		CountryCode:  trimStringMax(body["countryCode"], 8),
		Summary:      trimStringMax(body["summary"], 2000),
		StatementA:   statementA,
		StatementB:   statementB,
		SourceRefs:   anyMapsField(body["sourceRefs"]),
		CandidateIDs: stringArrayField(body["candidateIds"]),
		CreatedBy:    actor,
	})
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "contradiction create failed"})
		return
	}
	appendContradictionTimeline(timeline, created.ID, "contradiction_created", actor, "Contradiction created: "+created.Title)
	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "contradiction": created})
}

func handleGeopoliticalContradictionsPatch(
	w http.ResponseWriter,
	r *http.Request,
	store geopoliticalContradictionsStore,
	timeline geopoliticalTimelineStore,
	id string,
) {
	before, err := store.Get(id)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "contradiction read failed"})
		return
	}
	if before == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "contradiction not found"})
		return
	}

	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}

	nextState := ""
	if raw := strings.TrimSpace(stringFieldAny(body["state"])); raw != "" {
		if raw != "open" && raw != "resolved" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "state must be 'open' or 'resolved' when provided"})
			return
		}
		nextState = raw
	}

	var patch geopoliticalServices.PatchContradictionInput
	if _, exists := body["summary"]; exists {
		summary := trimStringMax(body["summary"], 2000)
		patch.Summary = &summary
	}
	if resolution := parseResolutionPatch(body["resolution"]); resolution != nil {
		patch.Resolution = resolution
	}
	patch.AddEvidence = parseAddEvidence(body["addEvidence"])
	patch.RemoveEvidenceIDs = stringArrayField(body["removeEvidenceIds"])

	actor := geoActorFromRequest(r)
	prev, updated, err := store.Update(id, nextState, actor, patch)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "contradiction update failed"})
		return
	}
	if updated == nil || prev == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "contradiction not found"})
		return
	}

	if prev.State != updated.State {
		if updated.State == "resolved" {
			appendContradictionTimeline(timeline, updated.ID, "contradiction_resolved", actor, "Contradiction resolved: "+updated.Title)
		} else {
			appendContradictionTimeline(timeline, updated.ID, "contradiction_reopened", actor, "Contradiction reopened: "+updated.Title)
		}
	}
	if resolutionChanged(prev, updated) {
		outcome := "cleared"
		if updated.Resolution != nil && strings.TrimSpace(updated.Resolution.Outcome) != "" {
			outcome = updated.Resolution.Outcome
		}
		appendContradictionTimeline(timeline, updated.ID, "contradiction_resolution_updated", actor, "Resolution updated ("+outcome+")")
	}
	if len(prev.Evidence) != len(updated.Evidence) {
		appendContradictionTimeline(
			timeline,
			updated.ID,
			"contradiction_evidence_updated",
			actor,
			"Evidence items: "+strconv.Itoa(len(prev.Evidence))+" -> "+strconv.Itoa(len(updated.Evidence)),
		)
	}

	writeJSON(w, http.StatusOK, map[string]any{"success": true, "contradiction": updated})
}

func geoActorFromRequest(r *http.Request) string {
	if actor := strings.TrimSpace(r.Header.Get("X-Geo-Actor")); actor != "" {
		return actor
	}
	if actor := strings.TrimSpace(r.Header.Get("X-Auth-User")); actor != "" {
		return actor
	}
	return "local-analyst"
}

func appendContradictionTimeline(store geopoliticalTimelineStore, contradictionID, action, actor, summary string) {
	if store == nil {
		return
	}
	_, _ = store.Append(geopoliticalServices.GeoTimelineEntry{
		EventID:     "contradiction:" + contradictionID,
		Action:      action,
		Actor:       actor,
		DiffSummary: summary,
	})
}

func trimStringMax(value any, max int) string {
	s := strings.TrimSpace(stringFieldAny(value))
	if max > 0 && len(s) > max {
		return s[:max]
	}
	return s
}

func stringFieldAny(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}

func intNumberField(value any, fallback int) int {
	switch v := value.(type) {
	case float64:
		return int(v)
	case float32:
		return int(v)
	case int:
		return v
	case int64:
		return int(v)
	default:
		return fallback
	}
}

func anyMapsField(value any) []map[string]any {
	items, ok := value.([]any)
	if !ok {
		return nil
	}
	out := make([]map[string]any, 0, len(items))
	for _, item := range items {
		if mapped, ok := item.(map[string]any); ok {
			out = append(out, mapped)
		}
	}
	return out
}

func stringArrayField(value any) []string {
	items, ok := value.([]any)
	if !ok {
		return nil
	}
	out := make([]string, 0, len(items))
	for _, item := range items {
		if s, ok := item.(string); ok {
			s = strings.TrimSpace(s)
			if s != "" {
				out = append(out, s)
			}
		}
	}
	if len(out) == 0 {
		return nil
	}
	return out
}

func parseResolutionPatch(value any) *geopoliticalServices.PatchResolutionInput {
	mapped, ok := value.(map[string]any)
	if !ok || mapped == nil {
		return nil
	}
	out := &geopoliticalServices.PatchResolutionInput{}
	if clear, ok := mapped["clear"].(bool); ok {
		out.Clear = clear
	}
	if outcome := strings.TrimSpace(stringFieldAny(mapped["outcome"])); outcome != "" {
		switch outcome {
		case "prefer_statement_a", "prefer_statement_b", "merged_into_event", "merged_into_candidate", "defer_monitoring", "insufficient_evidence":
			out.Outcome = outcome
		}
	}
	out.Note = trimStringMax(mapped["note"], 2000)
	out.MergedEventID = trimStringMax(mapped["mergedEventId"], 64)
	out.MergedCandidateID = trimStringMax(mapped["mergedCandidateId"], 64)
	return out
}

func parseAddEvidence(value any) []geopoliticalServices.AddEvidenceInput {
	items, ok := value.([]any)
	if !ok {
		return nil
	}
	out := make([]geopoliticalServices.AddEvidenceInput, 0, len(items))
	for _, item := range items {
		mapped, ok := item.(map[string]any)
		if !ok || mapped == nil {
			continue
		}
		out = append(out, geopoliticalServices.AddEvidenceInput{
			Kind:        trimStringMax(mapped["kind"], 64),
			Label:       trimStringMax(mapped["label"], 240),
			Note:        trimStringMax(mapped["note"], 2000),
			URL:         trimStringMax(mapped["url"], 2000),
			CandidateID: trimStringMax(mapped["candidateId"], 64),
			EventID:     trimStringMax(mapped["eventId"], 64),
		})
	}
	return out
}

func resolutionChanged(before, after *geopoliticalServices.GeoContradiction) bool {
	if before == nil || after == nil {
		return false
	}
	if before.Resolution == nil && after.Resolution == nil {
		return false
	}
	if (before.Resolution == nil) != (after.Resolution == nil) {
		return true
	}
	return before.Resolution.Outcome != after.Resolution.Outcome ||
		before.Resolution.Note != after.Resolution.Note ||
		before.Resolution.MergedEventID != after.Resolution.MergedEventID ||
		before.Resolution.MergedCandidateID != after.Resolution.MergedCandidateID
}
