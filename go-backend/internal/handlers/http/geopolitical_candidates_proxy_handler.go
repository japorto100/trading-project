package http

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalCandidatesProxyClient interface {
	Do(ctx context.Context, method, path string, payload []byte, headers map[string]string) (status int, body []byte, err error)
}

type geopoliticalCandidateQueueStore interface {
	List(filters geopoliticalServices.CandidateListFilters) ([]map[string]any, error)
	UpsertCandidate(candidate map[string]any) error
	UpsertCandidates(candidates []map[string]any) error
	Get(id string) (map[string]any, error)
	UpdateState(id string, patch geopoliticalServices.CandidateStateUpdate) (before map[string]any, after map[string]any, err error)
}

type geopoliticalEventsStore interface {
	Create(input geopoliticalServices.CreateGeoEventRecordInput) (*geopoliticalServices.GeoEventRecord, error)
	AddSource(eventID string, source map[string]any, actor string) (*geopoliticalServices.GeoEventRecord, error)
}

func GeopoliticalCandidatesProxyHandler(
	client geopoliticalCandidatesProxyClient,
	store geopoliticalCandidateQueueStore,
	timeline geopoliticalTimelineStore,
	events geopoliticalEventsStore,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if client == nil && store == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical candidates proxy unavailable"})
			return
		}

		targetPath, ok := mapGeopoliticalCandidatesProxyPath(r)
		if !ok {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "unsupported geopolitical candidates route"})
			return
		}

		if !isSupportedGeopoliticalCandidatesMethod(r.Method, r.URL.Path) {
			w.Header().Set("Allow", "GET, POST")
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}

		if r.Method == http.MethodGet {
			if store == nil {
				writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical candidate queue store unavailable"})
				return
			}
			items, err := store.List(filtersFromCandidateListRequest(r))
			if err != nil {
				writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geopolitical candidate queue read failed"})
				return
			}
			writeJSON(w, http.StatusOK, map[string]any{
				"success":    true,
				"candidates": items,
			})
			return
		}

		if candidateID, action, ok := parseCandidateActionPath(r.URL.Path); ok && (action == "reject" || action == "snooze" || action == "accept") {
			if action != "accept" || events != nil {
				handleLocalCandidateReviewAction(w, r, store, timeline, events, candidateID, action)
				return
			}
		}

		if r.Method == http.MethodPost && r.URL.Path == "/api/v1/geopolitical/candidates" && strings.TrimSpace(r.URL.Query().Get("mode")) == "" {
			if store != nil {
				handleLocalCandidateCreate(w, r, store, timeline)
				return
			}
		}

		if client == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical candidates proxy unavailable"})
			return
		}

		var payload []byte
		if r.Method == http.MethodPost {
			body, err := io.ReadAll(r.Body)
			if err != nil {
				writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
				return
			}
			payload = body
		}

		status, body, err := client.Do(r.Context(), r.Method, targetPath, payload, forwardedGeopoliticalCandidateHeaders(r))
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geopolitical candidates proxy request failed"})
			return
		}
		if status <= 0 {
			status = http.StatusOK
		}
		if status >= 200 && status < 300 {
			if store != nil {
				_ = syncCandidateStoreFromResponse(store, body)
			}
			if candidateID, action, ok := parseCandidateActionPath(r.URL.Path); ok && action == "accept" && timeline != nil {
				_ = syncCandidateAcceptTimelineFromResponse(timeline, r, candidateID, body)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_, _ = w.Write(body)
	}
}

func parseCandidateActionPath(path string) (candidateID, action string, ok bool) {
	const prefix = "/api/v1/geopolitical/candidates/"
	if !strings.HasPrefix(path, prefix) {
		return "", "", false
	}
	rest := strings.TrimPrefix(path, prefix)
	parts := strings.Split(rest, "/")
	if len(parts) != 2 {
		return "", "", false
	}
	candidateID = strings.TrimSpace(parts[0])
	action = strings.TrimSpace(parts[1])
	if candidateID == "" || action == "" {
		return "", "", false
	}
	return candidateID, action, true
}

func handleLocalCandidateReviewAction(
	w http.ResponseWriter,
	r *http.Request,
	store geopoliticalCandidateQueueStore,
	timeline geopoliticalTimelineStore,
	events geopoliticalEventsStore,
	candidateID string,
	action string,
) {
	if store == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical candidate queue store unavailable"})
		return
	}
	candidate, err := store.Get(candidateID)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "candidate queue read failed"})
		return
	}
	if candidate == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "candidate not found"})
		return
	}
	if state := strings.TrimSpace(stringFieldCandidateMap(candidate, "state")); state != "open" {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "candidate is " + state + " and cannot be " + action + "ed"})
		return
	}

	reviewNote := parseCandidateReviewNote(r)
	var nextState string
	var timelineAction string
	switch action {
	case "reject":
		nextState = "rejected"
		timelineAction = "candidate_rejected"
	case "snooze":
		nextState = "snoozed"
		timelineAction = "candidate_snoozed"
	case "accept":
		handleLocalCandidateAccept(w, r, store, timeline, events, candidate)
		return
	default:
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "unsupported candidate action"})
		return
	}

	before, updated, err := store.UpdateState(candidateID, geopoliticalServices.CandidateStateUpdate{
		State:      nextState,
		ReviewNote: reviewNote,
	})
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "candidate queue update failed"})
		return
	}
	if updated == nil || before == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "candidate not found"})
		return
	}

	actor := geoActorFromRequest(r)
	if timeline != nil {
		_, _ = timeline.Append(geopoliticalServices.GeoTimelineEntry{
			EventID:     candidateID,
			Action:      timelineAction,
			Actor:       actor,
			DiffSummary: "Candidate " + candidateID + " " + action + "ed",
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "candidate": updated})
}

func handleLocalCandidateCreate(
	w http.ResponseWriter,
	r *http.Request,
	store geopoliticalCandidateQueueStore,
	timeline geopoliticalTimelineStore,
) {
	if store == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical candidate queue store unavailable"})
		return
	}
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	if body == nil {
		body = map[string]any{}
	}
	candidate, err := buildLocalCandidateCreateRecord(body)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	candidateID := strings.TrimSpace(stringFieldCandidateMap(candidate, "id"))
	existing, err := store.Get(candidateID)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "candidate queue read failed"})
		return
	}
	deduped := existing != nil
	if err := store.UpsertCandidate(candidate); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "candidate queue write failed"})
		return
	}
	if !deduped && timeline != nil {
		_, _ = timeline.Append(geopoliticalServices.GeoTimelineEntry{
			EventID:     candidateID,
			Action:      "created",
			Actor:       geoActorFromRequest(r),
			DiffSummary: "New candidate: " + strings.TrimSpace(stringFieldCandidateMap(candidate, "headline")),
		})
	}
	writeJSON(w, ternaryStatus(deduped, http.StatusOK, http.StatusCreated), map[string]any{
		"success":   true,
		"candidate": candidate,
		"deduped":   deduped,
	})
}

func handleLocalCandidateAccept(
	w http.ResponseWriter,
	r *http.Request,
	store geopoliticalCandidateQueueStore,
	timeline geopoliticalTimelineStore,
	events geopoliticalEventsStore,
	candidate map[string]any,
) {
	if store == nil || events == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical candidate accept dependencies unavailable"})
		return
	}
	candidateID := strings.TrimSpace(stringFieldCandidateMap(candidate, "id"))
	actor := geoActorFromRequest(r)
	lat, lng := defaultGeoCoordinateForRegion(strings.TrimSpace(stringFieldCandidateMap(candidate, "regionHint")))
	confidence := confidenceToLadder(numberFieldCandidateMap(candidate, "confidence"))
	severity := int(numberFieldCandidateMap(candidate, "severityHint"))
	if severity < 1 || severity > 5 {
		severity = 2
	}
	event, err := events.Create(geopoliticalServices.CreateGeoEventRecordInput{
		Title:        strings.TrimSpace(stringFieldCandidateMap(candidate, "headline")),
		Symbol:       trimmedStringOr(stringFieldCandidateMap(candidate, "symbol"), "gavel"),
		Category:     trimmedStringOr(stringFieldCandidateMap(candidate, "category"), "sanctions_export_controls"),
		Status:       "confirmed",
		Severity:     severity,
		Confidence:   confidence,
		CountryCodes: stringSliceFieldCandidateMap(candidate, "countryHints"),
		RegionIDs:    regionIDsFromCandidateMap(candidate),
		Coordinates:  []geopoliticalServices.GeoEventCoordinate{{Lat: lat, Lng: lng}},
		Summary:      strings.TrimSpace(stringFieldCandidateMap(candidate, "reviewNote")),
		AnalystNote:  "Accepted candidate " + candidateID,
		Actor:        actor,
	})
	if err != nil || event == nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "geopolitical events store create failed"})
		return
	}
	for _, src := range sourceRefsFromCandidateMap(candidate) {
		_, _ = events.AddSource(event.ID, src, actor)
	}
	_, updated, err := store.UpdateState(candidateID, geopoliticalServices.CandidateStateUpdate{
		State:             "accepted",
		MergedIntoEventID: &event.ID,
	})
	if err != nil || updated == nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "candidate queue update failed"})
		return
	}
	if timeline != nil {
		_, _ = timeline.Append(geopoliticalServices.GeoTimelineEntry{
			EventID:     event.ID,
			Action:      "candidate_accepted",
			Actor:       actor,
			DiffSummary: "Candidate " + candidateID + " accepted into event " + event.ID,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "candidate": updated, "event": event})
}

func parseCandidateReviewNote(r *http.Request) *string {
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		return nil
	}
	if body == nil {
		return nil
	}
	if note, ok := body["reviewNote"].(string); ok {
		trimmed := strings.TrimSpace(note)
		if len(trimmed) > 500 {
			trimmed = trimmed[:500]
		}
		return &trimmed
	}
	return nil
}

func buildLocalCandidateCreateRecord(input map[string]any) (map[string]any, error) {
	headline := strings.TrimSpace(stringFieldCandidateMap(input, "headline"))
	if len(headline) < 6 {
		return nil, errInvalidCandidateCreate("headline is required and must be at least 6 characters")
	}
	triggerType := strings.TrimSpace(stringFieldCandidateMap(input, "triggerType"))
	switch triggerType {
	case "", "manual_import":
		triggerType = "manual_import"
	case "hard_signal", "news_cluster":
	default:
		return nil, errInvalidCandidateCreate("triggerType is invalid")
	}
	id := strings.TrimSpace(stringFieldCandidateMap(input, "id"))
	if id == "" {
		id = "gcg_" + strconv.FormatInt(time.Now().UTC().UnixNano(), 36)
	}
	generatedAt := time.Now().UTC().Format(time.RFC3339)
	confidence := clampFloat(numberFieldCandidateMap(input, "confidence"), 0, 1, 0.5)
	severityHint := clampInt(int(numberFieldCandidateMap(input, "severityHint")), 1, 5, 2)

	out := map[string]any{
		"id":           id,
		"generatedAt":  generatedAt,
		"state":        "open",
		"triggerType":  triggerType,
		"confidence":   confidence,
		"severityHint": severityHint,
		"headline":     trimStringForAPI(headline, 300),
		"sourceRefs":   sanitizeSourceRefsCandidateMap(input),
	}
	if regionHint := trimStringForAPI(stringFieldCandidateMap(input, "regionHint"), 120); regionHint != "" {
		out["regionHint"] = regionHint
	}
	if countryHints := sanitizeStringSliceCandidateMap(input, "countryHints"); len(countryHints) > 0 {
		out["countryHints"] = countryHints
	}
	if merged := trimStringForAPI(stringFieldCandidateMap(input, "mergedIntoEventId"), 100); merged != "" {
		out["mergedIntoEventId"] = merged
	}
	if reviewNote := trimStringForAPI(stringFieldCandidateMap(input, "reviewNote"), 1000); reviewNote != "" {
		out["reviewNote"] = reviewNote
	}
	if symbol := trimStringForAPI(stringFieldCandidateMap(input, "symbol"), 50); symbol != "" {
		out["symbol"] = symbol
	}
	if category := trimStringForAPI(stringFieldCandidateMap(input, "category"), 80); category != "" {
		out["category"] = category
	}
	if hotspotIDs := sanitizeStringSliceCandidateMap(input, "hotspotIds"); len(hotspotIDs) > 0 {
		out["hotspotIds"] = hotspotIDs
	}
	return out, nil
}

type invalidCandidateCreateError string

func (e invalidCandidateCreateError) Error() string { return string(e) }

func errInvalidCandidateCreate(message string) error { return invalidCandidateCreateError(message) }

func stringFieldCandidateMap(m map[string]any, key string) string {
	if m == nil {
		return ""
	}
	if value, ok := m[key].(string); ok {
		return value
	}
	return ""
}

func sanitizeStringSliceCandidateMap(m map[string]any, key string) []string {
	if m == nil {
		return nil
	}
	values := stringSliceFieldCandidateMap(m, key)
	if len(values) == 0 {
		return nil
	}
	out := make([]string, 0, len(values))
	for _, item := range values {
		if trimmed := strings.TrimSpace(item); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	if len(out) == 0 {
		return nil
	}
	return out
}

func sanitizeSourceRefsCandidateMap(m map[string]any) []map[string]any {
	refs := sourceRefsFromCandidateMap(m)
	if len(refs) == 0 {
		return []map[string]any{}
	}
	out := make([]map[string]any, 0, len(refs))
	for _, ref := range refs {
		if ref == nil {
			continue
		}
		provider := trimStringForAPI(stringFieldCandidateMap(ref, "provider"), 120)
		url := trimStringForAPI(stringFieldCandidateMap(ref, "url"), 2048)
		if provider == "" || url == "" {
			continue
		}
		entry := map[string]any{
			"id":          trimmedStringOr(trimStringForAPI(stringFieldCandidateMap(ref, "id"), 100), "gs_"+strconv.FormatInt(time.Now().UTC().UnixNano(), 36)),
			"provider":    provider,
			"url":         url,
			"sourceTier":  trimmedStringOr(trimStringForAPI(stringFieldCandidateMap(ref, "sourceTier"), 1), "C"),
			"reliability": clampFloat(numberFieldCandidateMap(ref, "reliability"), 0, 1, 0.5),
			"fetchedAt":   trimmedStringOr(trimStringForAPI(stringFieldCandidateMap(ref, "fetchedAt"), 40), time.Now().UTC().Format(time.RFC3339)),
		}
		if title := trimStringForAPI(stringFieldCandidateMap(ref, "title"), 220); title != "" {
			entry["title"] = title
		}
		if publishedAt := trimStringForAPI(stringFieldCandidateMap(ref, "publishedAt"), 40); publishedAt != "" {
			entry["publishedAt"] = publishedAt
		}
		if entry["sourceTier"] != "A" && entry["sourceTier"] != "B" && entry["sourceTier"] != "C" {
			entry["sourceTier"] = "C"
		}
		out = append(out, entry)
	}
	return out
}

func numberFieldCandidateMap(m map[string]any, key string) float64 {
	if m == nil {
		return 0
	}
	switch value := m[key].(type) {
	case float64:
		return value
	case float32:
		return float64(value)
	case int:
		return float64(value)
	case int64:
		return float64(value)
	case json.Number:
		parsed, err := value.Float64()
		if err == nil {
			return parsed
		}
	}
	return 0
}

func trimStringForAPI(value string, max int) string {
	trimmed := strings.TrimSpace(value)
	if max > 0 && len(trimmed) > max {
		return trimmed[:max]
	}
	return trimmed
}

func clampFloat(value, min, max, fallback float64) float64 {
	if value < min {
		if value == 0 {
			return fallback
		}
		return min
	}
	if value > max {
		return max
	}
	return value
}

func clampInt(value, min, max, fallback int) int {
	if value == 0 {
		return fallback
	}
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func ternaryStatus(cond bool, whenTrue, whenFalse int) int {
	if cond {
		return whenTrue
	}
	return whenFalse
}

func stringSliceFieldCandidateMap(m map[string]any, key string) []string {
	if m == nil {
		return nil
	}
	raw, ok := m[key].([]any)
	if !ok {
		if direct, ok := m[key].([]string); ok {
			return append([]string(nil), direct...)
		}
		return nil
	}
	out := make([]string, 0, len(raw))
	for _, item := range raw {
		if s, ok := item.(string); ok {
			s = strings.TrimSpace(s)
			if s != "" {
				out = append(out, s)
			}
		}
	}
	return out
}

func sourceRefsFromCandidateMap(m map[string]any) []map[string]any {
	if m == nil {
		return nil
	}
	raw, ok := m["sourceRefs"].([]any)
	if !ok {
		if direct, ok := m["sourceRefs"].([]map[string]any); ok {
			return direct
		}
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

func regionIDsFromCandidateMap(m map[string]any) []string {
	region := strings.TrimSpace(stringFieldCandidateMap(m, "regionHint"))
	if region == "" {
		return nil
	}
	return []string{region}
}

func trimmedStringOr(value, fallback string) string {
	if trimmed := strings.TrimSpace(value); trimmed != "" {
		return trimmed
	}
	return fallback
}

func confidenceToLadder(confidence float64) int {
	switch {
	case confidence >= 0.85:
		return 5
	case confidence >= 0.7:
		return 4
	case confidence >= 0.55:
		return 3
	case confidence >= 0.4:
		return 2
	default:
		return 1
	}
}

func defaultGeoCoordinateForRegion(regionHint string) (lat, lng float64) {
	normalized := strings.ToLower(strings.TrimSpace(regionHint))
	switch {
	case strings.Contains(normalized, "europe"):
		return 50.5, 10.4
	case strings.Contains(normalized, "mena"):
		return 28.5, 37.8
	case strings.Contains(normalized, "east-asia"), strings.Contains(normalized, "east asia"):
		return 34.4, 121.2
	case strings.Contains(normalized, "south-america"), strings.Contains(normalized, "south america"):
		return -15.3, -58.1
	case strings.Contains(normalized, "north-america"), strings.Contains(normalized, "north america"):
		return 39.8, -98.5
	default:
		return 20.0, 0.0
	}
}

func filtersFromCandidateListRequest(r *http.Request) geopoliticalServices.CandidateListFilters {
	query := r.URL.Query()
	filters := geopoliticalServices.CandidateListFilters{
		State:      strings.TrimSpace(query.Get("state")),
		RegionHint: strings.TrimSpace(query.Get("regionHint")),
		Query:      strings.TrimSpace(query.Get("q")),
	}
	if raw := strings.TrimSpace(query.Get("minConfidence")); raw != "" {
		if value, err := strconv.ParseFloat(raw, 64); err == nil {
			filters.MinConfidence = &value
		}
	}
	return filters
}

func syncCandidateStoreFromResponse(store geopoliticalCandidateQueueStore, payload []byte) error {
	if store == nil || len(payload) == 0 {
		return nil
	}
	var parsed map[string]any
	if err := json.Unmarshal(payload, &parsed); err != nil {
		return nil
	}
	if candidateRaw, ok := parsed["candidate"].(map[string]any); ok {
		return store.UpsertCandidate(candidateRaw)
	}
	if candidatesRaw, ok := parsed["candidates"].([]any); ok {
		candidates := make([]map[string]any, 0, len(candidatesRaw))
		for _, item := range candidatesRaw {
			if mapped, ok := item.(map[string]any); ok {
				candidates = append(candidates, mapped)
			}
		}
		if len(candidates) > 0 {
			return store.UpsertCandidates(candidates)
		}
	}
	return nil
}

func syncCandidateAcceptTimelineFromResponse(
	timeline geopoliticalTimelineStore,
	r *http.Request,
	candidateID string,
	payload []byte,
) error {
	if timeline == nil || len(payload) == 0 {
		return nil
	}
	var parsed map[string]any
	if err := json.Unmarshal(payload, &parsed); err != nil {
		return nil
	}
	eventRaw, _ := parsed["event"].(map[string]any)
	eventID := strings.TrimSpace(stringFieldCandidateMap(eventRaw, "id"))
	if eventID == "" {
		return nil
	}
	actor := geoActorFromRequest(r)
	_, err := timeline.Append(geopoliticalServices.GeoTimelineEntry{
		EventID:     eventID,
		Action:      "candidate_accepted",
		Actor:       actor,
		DiffSummary: "Candidate " + candidateID + " accepted into event " + eventID,
	})
	return err
}

func mapGeopoliticalCandidatesProxyPath(r *http.Request) (string, bool) {
	requestURI := r.URL.RequestURI()
	const prefix = "/api/v1/geopolitical/candidates"
	if !strings.HasPrefix(requestURI, prefix) {
		return "", false
	}
	suffix := strings.TrimPrefix(requestURI, "/api/v1")
	if suffix == "" {
		return "", false
	}

	// Exact queue route (+ optional query)
	if suffix == "/geopolitical/candidates" || strings.HasPrefix(suffix, "/geopolitical/candidates?") {
		return "/api" + suffix, true
	}

	// Candidate review actions: /candidates/:id/{accept|reject|snooze}
	pathOnly := r.URL.Path
	if !strings.HasPrefix(pathOnly, prefix+"/") {
		return "", false
	}
	rest := strings.TrimPrefix(pathOnly, prefix+"/")
	parts := strings.Split(rest, "/")
	if len(parts) != 2 {
		return "", false
	}
	if strings.TrimSpace(parts[0]) == "" {
		return "", false
	}
	action := strings.TrimSpace(parts[1])
	switch action {
	case "accept", "reject", "snooze":
		return "/api/geopolitical/candidates/" + parts[0] + "/" + action, true
	default:
		return "", false
	}
}

func isSupportedGeopoliticalCandidatesMethod(method, path string) bool {
	const exact = "/api/v1/geopolitical/candidates"
	if path == exact {
		return method == http.MethodGet || method == http.MethodPost
	}
	if strings.HasPrefix(path, exact+"/") {
		return method == http.MethodPost
	}
	return false
}

func forwardedGeopoliticalCandidateHeaders(r *http.Request) map[string]string {
	headers := map[string]string{}
	if actor := strings.TrimSpace(r.Header.Get("X-Geo-Actor")); actor != "" {
		headers["X-Geo-Actor"] = actor
	} else if actor := strings.TrimSpace(r.Header.Get("X-Auth-User")); actor != "" {
		headers["X-Geo-Actor"] = actor
	}
	if role := strings.TrimSpace(r.Header.Get("X-User-Role")); role != "" {
		headers["X-User-Role"] = role
	}
	if user := strings.TrimSpace(r.Header.Get("X-Auth-User")); user != "" {
		headers["X-Auth-User"] = user
	}
	return headers
}
