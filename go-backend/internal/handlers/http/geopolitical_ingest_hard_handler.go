package http

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalEventsLister interface {
	ListEvents(ctx context.Context, query geopoliticalServices.Query) ([]geopoliticalServices.Event, error)
}

type geoHardIngestRequest struct {
	Source  string `json:"source"`
	Country string `json:"country"`
	Region  string `json:"region"`
	Limit   int    `json:"limit"`
	DryRun  bool   `json:"dryRun"`
}

func GeopoliticalHardIngestHandler(
	events geopoliticalEventsLister,
	store geopoliticalCandidateQueueStore,
	runsStore geopoliticalIngestRunsStore,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if events == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical hard ingest unavailable"})
			return
		}
		startedAt := timeNowRFC3339()
		reqBody := geoHardIngestRequest{Source: "acled", Limit: 25}
		if r.Body != nil {
			var parsed geoHardIngestRequest
			if err := json.NewDecoder(r.Body).Decode(&parsed); err == nil {
				if strings.TrimSpace(parsed.Source) != "" {
					reqBody.Source = parsed.Source
				}
				if parsed.Limit > 0 {
					reqBody.Limit = parsed.Limit
				}
				reqBody.Country = parsed.Country
				reqBody.Region = parsed.Region
				reqBody.DryRun = parsed.DryRun
			}
		}
		query := geopoliticalServices.Query{
			Source:  strings.TrimSpace(reqBody.Source),
			Country: strings.TrimSpace(reqBody.Country),
			Region:  strings.TrimSpace(reqBody.Region),
			Limit:   reqBody.Limit,
		}
		items, usedSource, fetchErr := listHardIngestEventsWithFallback(r.Context(), events, query)
		err := fetchErr
		if err != nil {
			adapters := []map[string]any{{
				"adapterId": "gateway_events_" + strings.ToLower(strings.TrimSpace(query.Source)),
				"ok":        false,
				"produced":  0,
				"promoted":  0,
				"created":   0,
				"deduped":   0,
				"message":   trimStringForCandidate(err.Error(), 220),
			}}
			if runsStore != nil {
				_, _ = runsStore.Append(geopoliticalServices.GeoIngestRun{
					Kind:               "hard",
					Mode:               "go-owned-gateway-v1",
					UpstreamPath:       "gateway-local-hard",
					Actor:              geoActorFromRequest(r),
					RequestID:          strings.TrimSpace(r.Header.Get("X-Request-ID")),
					StatusCode:         http.StatusOK,
					Success:            true,
					StartedAt:          startedAt,
					FinishedAt:         timeNowRFC3339(),
					CandidateSyncCount: 0,
					AdapterStats:       adapters,
					Notes:              append(hardIngestNotes(reqBody, strings.TrimSpace(query.Source), strings.TrimSpace(query.Source)), "events_fetch_failed"),
				})
			}
			writeJSON(w, http.StatusOK, map[string]any{
				"success":      true,
				"mode":         "go-owned-gateway-v1",
				"adapters":     adapters,
				"createdCount": 0,
				"candidates":   []map[string]any{},
				"budget": map[string]any{
					"providerCallsUsed": 1,
					"candidateBudget":   0,
					"dryRun":            reqBody.DryRun,
				},
			})
			return
		}

		candidates := make([]map[string]any, 0, len(items))
		createdCount := 0
		dedupedCount := 0
		for _, item := range items {
			candidate := hardEventToCandidate(item)
			candidates = append(candidates, candidate)
			if reqBody.DryRun || store == nil {
				continue
			}
			existing, _ := store.Get(strings.TrimSpace(stringFieldCandidateMap(candidate, "id")))
			if existing != nil {
				dedupedCount++
			} else {
				createdCount++
			}
			_ = store.UpsertCandidate(candidate)
		}

		adapters := []map[string]any{{
			"adapterId": "gateway_events_" + strings.ToLower(strings.TrimSpace(usedSource)),
			"ok":        true,
			"produced":  len(items),
			"promoted":  len(candidates),
			"created":   createdCount,
			"deduped":   dedupedCount,
			"message":   hardIngestMessage(reqBody.DryRun, usedSource, strings.TrimSpace(query.Source)),
		}}
		if runsStore != nil {
			_, _ = runsStore.Append(geopoliticalServices.GeoIngestRun{
				Kind:               "hard",
				Mode:               "go-owned-gateway-v1",
				UpstreamPath:       "gateway-local-hard",
				Actor:              geoActorFromRequest(r),
				RequestID:          strings.TrimSpace(r.Header.Get("X-Request-ID")),
				StatusCode:         http.StatusOK,
				Success:            true,
				StartedAt:          startedAt,
				FinishedAt:         timeNowRFC3339(),
				CandidateSyncCount: len(candidates),
				AdapterStats:       adapters,
				Notes:              hardIngestNotes(reqBody, usedSource, strings.TrimSpace(query.Source)),
			})
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"success":      true,
			"mode":         "go-owned-gateway-v1",
			"adapters":     adapters,
			"createdCount": ternaryInt(reqBody.DryRun, 0, createdCount),
			"candidates":   candidates,
			"budget": map[string]any{
				"providerCallsUsed": 1,
				"candidateBudget":   len(candidates),
				"dryRun":            reqBody.DryRun,
			},
		})
	}
}

func hardEventToCandidate(item geopoliticalServices.Event) map[string]any {
	generatedAt := normalizeEventDateToRFC3339(item.EventDate)
	regionHint := slugifyRegionHint(item.Region)
	countryHints := candidateCountryHints(item.Country)
	confidence := hardEventConfidence(item)
	severity := hardEventSeverity(item)
	id := stableGeoCandidateID("hard", item.Source, item.ID, generatedAt, item.Country, item.Region, item.EventType)
	headline := strings.TrimSpace(item.EventType)
	if headline == "" {
		headline = "Geopolitical event"
	}
	if item.Country != "" {
		headline = headline + " - " + strings.TrimSpace(item.Country)
	}
	if item.Location != "" {
		headline = headline + " (" + strings.TrimSpace(item.Location) + ")"
	}
	reviewNote := trimStringForCandidate(item.Notes, 500)
	if reviewNote == "" && item.SubEventType != "" {
		reviewNote = trimStringForCandidate(item.SubEventType, 500)
	}
	sourceRefs := []map[string]any{{
		"provider": strings.TrimSpace(item.Source),
		"url":      strings.TrimSpace(item.URL),
		"title":    strings.TrimSpace(item.EventType),
	}}
	if sourceRefs[0]["provider"] == "" {
		sourceRefs[0]["provider"] = "acled"
	}
	return map[string]any{
		"id":           id,
		"generatedAt":  generatedAt,
		"triggerType":  "hard_signal",
		"confidence":   confidence,
		"severityHint": severity,
		"headline":     trimStringForCandidate(headline, 220),
		"regionHint":   regionHint,
		"countryHints": countryHints,
		"sourceRefs":   sourceRefs,
		"state":        "open",
		"reviewNote":   reviewNote,
		"symbol":       "gavel",
		"category":     hardEventCategory(item),
	}
}

func stableGeoCandidateID(parts ...string) string {
	joined := strings.Join(parts, "|")
	sum := sha256.Sum256([]byte(joined))
	return "gcg_" + hex.EncodeToString(sum[:8])
}

func normalizeEventDateToRFC3339(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return time.Now().UTC().Format(time.RFC3339)
	}
	if t, err := time.Parse(time.RFC3339, raw); err == nil {
		return t.UTC().Format(time.RFC3339)
	}
	if t, err := time.Parse("2006-01-02", raw); err == nil {
		return t.UTC().Format(time.RFC3339)
	}
	return time.Now().UTC().Format(time.RFC3339)
}

func slugifyRegionHint(region string) string {
	normalized := strings.ToLower(strings.TrimSpace(region))
	replacer := strings.NewReplacer(" ", "-", "_", "-", "/", "-", ".", "-")
	normalized = replacer.Replace(normalized)
	for strings.Contains(normalized, "--") {
		normalized = strings.ReplaceAll(normalized, "--", "-")
	}
	return strings.Trim(normalized, "-")
}

func candidateCountryHints(country string) []string {
	c := strings.TrimSpace(country)
	if c == "" {
		return nil
	}
	if len(c) == 2 || len(c) == 3 {
		return []string{strings.ToUpper(c)}
	}
	return nil
}

func hardEventConfidence(item geopoliticalServices.Event) float64 {
	base := 0.68
	if item.Fatalities > 0 {
		base += 0.07
	}
	if item.URL != "" {
		base += 0.03
	}
	if item.Actor1 != "" || item.Actor2 != "" {
		base += 0.02
	}
	if base > 0.95 {
		base = 0.95
	}
	return base
}

func hardEventSeverity(item geopoliticalServices.Event) int {
	switch {
	case item.Fatalities >= 25:
		return 5
	case item.Fatalities >= 10:
		return 4
	case item.Fatalities >= 1:
		return 3
	default:
		return 2
	}
}

func hardEventCategory(item geopoliticalServices.Event) string {
	eventType := strings.ToLower(strings.TrimSpace(item.EventType))
	switch {
	case strings.Contains(eventType, "protest"):
		return "civil_unrest"
	case strings.Contains(eventType, "violence"), strings.Contains(eventType, "battle"), strings.Contains(eventType, "attack"):
		return "conflict_security"
	default:
		return "geopolitical_security"
	}
}

func listHardIngestEventsWithFallback(
	ctx context.Context,
	events geopoliticalEventsLister,
	query geopoliticalServices.Query,
) (items []geopoliticalServices.Event, usedSource string, err error) {
	usedSource = strings.TrimSpace(query.Source)
	items, err = events.ListEvents(ctx, query)
	if err == nil {
		return items, usedSource, nil
	}
	if !strings.EqualFold(strings.TrimSpace(query.Source), "acled") {
		return nil, usedSource, err
	}
	fallbackQuery := query
	fallbackQuery.Source = "gdelt"
	fallbackItems, fallbackErr := events.ListEvents(ctx, fallbackQuery)
	if fallbackErr != nil {
		return nil, usedSource, err
	}
	return fallbackItems, "gdelt", nil
}

func hardIngestMessage(dryRun bool, usedSource string, requestedSource string) string {
	parts := []string{}
	if dryRun {
		parts = append(parts, "dry-run")
	}
	req := strings.ToLower(strings.TrimSpace(requestedSource))
	used := strings.ToLower(strings.TrimSpace(usedSource))
	if req != "" && used != "" && req != used {
		parts = append(parts, "fallback:"+req+"->"+used)
	}
	return strings.Join(parts, "; ")
}

func hardIngestNotes(req geoHardIngestRequest, usedSource string, requestedSource string) []string {
	notes := []string{"gateway_events_ingest"}
	if req.DryRun {
		notes = append(notes, "dry_run")
	}
	if src := strings.TrimSpace(req.Source); src != "" {
		notes = append(notes, "source:"+strings.ToLower(src))
	}
	if used := strings.TrimSpace(usedSource); used != "" {
		notes = append(notes, "used_source:"+strings.ToLower(used))
	}
	if reqSrc := strings.TrimSpace(requestedSource); reqSrc != "" && !strings.EqualFold(reqSrc, usedSource) {
		notes = append(notes, "fallback:"+strings.ToLower(reqSrc)+"->"+strings.ToLower(usedSource))
	}
	if req.Limit > 0 {
		notes = append(notes, "limit:"+strconv.Itoa(req.Limit))
	}
	return notes
}

func trimStringForCandidate(value string, max int) string {
	value = strings.TrimSpace(value)
	if max > 0 && len(value) > max {
		return value[:max]
	}
	return value
}

func ternaryInt(cond bool, whenTrue, whenFalse int) int {
	if cond {
		return whenTrue
	}
	return whenFalse
}
