package http

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

type geopoliticalSoftIngestNewsClient interface {
	Headlines(ctx context.Context, symbol string, query string, lang string, limit int) ([]marketServices.Headline, error)
}

type geopoliticalSoftIngestSignalClient interface {
	PostJSON(ctx context.Context, path string, payload []byte) (status int, body []byte, err error)
}

type geoSoftIngestRequest struct {
	Sources  []string `json:"sources"`
	Adapters []string `json:"adapters"`
	Limit    int      `json:"limit"`
	DryRun   bool     `json:"dryRun"`
}

type geoSoftSignalArticleInput struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	PublishedAt string `json:"publishedAt"`
	Source      string `json:"source"`
	Summary     string `json:"summary,omitempty"`
}

type geoSoftSignalRequestPayload struct {
	AdapterID     string                      `json:"adapterId"`
	GeneratedAt   string                      `json:"generatedAt"`
	Articles      []geoSoftSignalArticleInput `json:"articles"`
	MaxCandidates int                         `json:"maxCandidates"`
}

type geoSoftSignalSourceRef struct {
	Provider    string  `json:"provider"`
	URL         string  `json:"url"`
	Title       string  `json:"title"`
	PublishedAt string  `json:"publishedAt"`
	SourceTier  string  `json:"sourceTier"`
	Reliability float64 `json:"reliability"`
}

type geoSoftSignalCandidate struct {
	Headline     string                   `json:"headline"`
	Confidence   float64                  `json:"confidence"`
	SeverityHint int                      `json:"severityHint"`
	RegionHint   string                   `json:"regionHint"`
	CountryHints []string                 `json:"countryHints"`
	SourceRefs   []geoSoftSignalSourceRef `json:"sourceRefs"`
	Symbol       string                   `json:"symbol"`
	Category     string                   `json:"category"`
	HotspotIDs   []string                 `json:"hotspotIds"`
}

type geoSoftSignalResponse struct {
	Candidates []geoSoftSignalCandidate `json:"candidates"`
}

type geoSoftIngestAdapterSpec struct {
	ID           string
	Path         string
	Query        string
	TriggerType  string
	DefaultLimit int
}

var geoSoftIngestAdapters = []geoSoftIngestAdapterSpec{
	{
		ID:           "news_cluster",
		Path:         "/api/v1/cluster-headlines",
		Query:        "geopolitics sanctions central bank conflict ceasefire election",
		TriggerType:  "news_cluster",
		DefaultLimit: 30,
	},
	{
		ID:           "social_surge",
		Path:         "/api/v1/social-surge",
		Query:        "reddit OR social media OR x.com geopolitics sanctions narrative",
		TriggerType:  "social_surge",
		DefaultLimit: 30,
	},
	{
		ID:           "narrative_shift",
		Path:         "/api/v1/narrative-shift",
		Query:        "narrative shift policy escalation sanctions rhetoric central bank messaging",
		TriggerType:  "narrative_shift",
		DefaultLimit: 36,
	},
}

func GeopoliticalSoftIngestHandler(
	news geopoliticalSoftIngestNewsClient,
	signals geopoliticalSoftIngestSignalClient,
	store geopoliticalCandidateQueueStore,
	runsStore geopoliticalIngestRunsStore,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if news == nil || signals == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical soft ingest unavailable"})
			return
		}

		startedAt := timeNowRFC3339()
		reqBody := geoSoftIngestRequest{}
		if r.Body != nil {
			var parsed geoSoftIngestRequest
			if err := json.NewDecoder(r.Body).Decode(&parsed); err == nil {
				reqBody = parsed
			}
		}

		selected := selectGeoSoftIngestAdapters(reqBody)
		limitOverride := clampSoftIngestLimit(reqBody.Limit)
		createdCount := 0
		dedupedCount := 0
		allCandidates := make([]map[string]any, 0, len(selected)*3)
		adapterStats := make([]map[string]any, 0, len(selected))

		for _, adapter := range selected {
			newsLimit := adapter.DefaultLimit
			if limitOverride > 0 {
				newsLimit = limitOverride
			}
			headlines, err := news.Headlines(r.Context(), "", adapter.Query, "", newsLimit)
			if err != nil {
				adapterStats = append(adapterStats, map[string]any{
					"adapterId": adapter.ID,
					"ok":        false,
					"produced":  0,
					"promoted":  0,
					"created":   0,
					"deduped":   0,
					"message":   "news fetch failed",
				})
				continue
			}
			articles := geoSoftArticlesFromHeadlines(headlines)
			if len(articles) == 0 {
				adapterStats = append(adapterStats, map[string]any{
					"adapterId": adapter.ID,
					"ok":        true,
					"produced":  0,
					"promoted":  0,
					"created":   0,
					"deduped":   0,
					"message":   "no articles",
				})
				continue
			}

			payload, _ := json.Marshal(geoSoftSignalRequestPayload{
				AdapterID:     adapter.ID,
				GeneratedAt:   timeNowRFC3339(),
				Articles:      articles,
				MaxCandidates: 6,
			})
			status, body, err := signals.PostJSON(r.Context(), adapter.Path, payload)
			if err != nil || status < 200 || status >= 300 {
				adapterStats = append(adapterStats, map[string]any{
					"adapterId": adapter.ID,
					"ok":        false,
					"produced":  0,
					"promoted":  0,
					"created":   0,
					"deduped":   0,
					"message":   "soft-signal service call failed",
				})
				continue
			}

			var parsed geoSoftSignalResponse
			if err := json.Unmarshal(body, &parsed); err != nil {
				adapterStats = append(adapterStats, map[string]any{
					"adapterId": adapter.ID,
					"ok":        false,
					"produced":  0,
					"promoted":  0,
					"created":   0,
					"deduped":   0,
					"message":   "invalid soft-signal response",
				})
				continue
			}

			adapterCandidates := make([]map[string]any, 0, len(parsed.Candidates))
			localCreated := 0
			localDeduped := 0
			for i, candidate := range parsed.Candidates {
				fallback := geoSoftFallbackArticle(articles, i)
				mapped := geoSoftCandidateToMap(adapter, candidate, fallback)
				if mapped == nil {
					continue
				}
				adapterCandidates = append(adapterCandidates, mapped)
				allCandidates = append(allCandidates, mapped)
				if reqBody.DryRun || store == nil {
					continue
				}
				existing, _ := store.Get(strings.TrimSpace(stringFieldCandidateMap(mapped, "id")))
				if existing != nil {
					localDeduped++
					dedupedCount++
				} else {
					localCreated++
					createdCount++
				}
				_ = store.UpsertCandidate(mapped)
			}

			adapterStats = append(adapterStats, map[string]any{
				"adapterId": adapter.ID,
				"ok":        true,
				"produced":  len(parsed.Candidates),
				"promoted":  len(adapterCandidates),
				"created":   localCreated,
				"deduped":   localDeduped,
				"message":   softIngestAdapterMessage(reqBody.DryRun),
			})
		}

		if runsStore != nil {
			_, _ = runsStore.Append(geopoliticalServices.GeoIngestRun{
				Kind:               "soft",
				Mode:               "go-owned-gateway-v1",
				UpstreamPath:       "gateway-local-soft",
				Actor:              geoActorFromRequest(r),
				RequestID:          strings.TrimSpace(r.Header.Get("X-Request-ID")),
				StatusCode:         http.StatusOK,
				Success:            true,
				StartedAt:          startedAt,
				FinishedAt:         timeNowRFC3339(),
				CandidateSyncCount: len(allCandidates),
				AdapterStats:       adapterStats,
				Notes:              softIngestNotes(reqBody, selected),
			})
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"success":      true,
			"mode":         "go-owned-gateway-v1",
			"adapters":     adapterStats,
			"createdCount": ternaryInt(reqBody.DryRun, 0, createdCount),
			"candidates":   allCandidates,
			"budget": map[string]any{
				"providerCallsUsed": len(selected),
				"candidateBudget":   len(allCandidates),
				"dryRun":            reqBody.DryRun,
			},
		})
	}
}

func selectGeoSoftIngestAdapters(req geoSoftIngestRequest) []geoSoftIngestAdapterSpec {
	allowed := map[string]struct{}{}
	for _, item := range req.Adapters {
		if key := strings.ToLower(strings.TrimSpace(item)); key != "" {
			allowed[key] = struct{}{}
		}
	}
	for _, item := range req.Sources {
		key := strings.ToLower(strings.TrimSpace(item))
		switch key {
		case "rss", "news":
			allowed["news_cluster"] = struct{}{}
			allowed["narrative_shift"] = struct{}{}
		case "reddit", "social", "x", "x.com":
			allowed["social_surge"] = struct{}{}
		}
	}
	if len(allowed) == 0 {
		return append([]geoSoftIngestAdapterSpec(nil), geoSoftIngestAdapters...)
	}
	selected := make([]geoSoftIngestAdapterSpec, 0, len(allowed))
	for _, adapter := range geoSoftIngestAdapters {
		if _, ok := allowed[adapter.ID]; ok {
			selected = append(selected, adapter)
		}
	}
	if len(selected) == 0 {
		return append([]geoSoftIngestAdapterSpec(nil), geoSoftIngestAdapters...)
	}
	return selected
}

func clampSoftIngestLimit(limit int) int {
	if limit <= 0 {
		return 0
	}
	if limit > 100 {
		return 100
	}
	if limit < 5 {
		return 5
	}
	return limit
}

func geoSoftArticlesFromHeadlines(headlines []marketServices.Headline) []geoSoftSignalArticleInput {
	out := make([]geoSoftSignalArticleInput, 0, len(headlines))
	for _, item := range headlines {
		title := strings.TrimSpace(item.Title)
		rawURL := strings.TrimSpace(item.URL)
		if title == "" || rawURL == "" {
			continue
		}
		publishedAt := item.PublishedAt.UTC().Format(time.RFC3339)
		if item.PublishedAt.IsZero() {
			publishedAt = timeNowRFC3339()
		}
		out = append(out, geoSoftSignalArticleInput{
			Title:       title,
			URL:         rawURL,
			PublishedAt: publishedAt,
			Source:      strings.TrimSpace(item.Source),
			Summary:     strings.TrimSpace(item.Summary),
		})
	}
	return out
}

func geoSoftFallbackArticle(items []geoSoftSignalArticleInput, idx int) *geoSoftSignalArticleInput {
	if len(items) == 0 {
		return nil
	}
	if idx < 0 {
		idx = 0
	}
	if idx >= len(items) {
		idx = len(items) - 1
	}
	item := items[idx]
	return &item
}

func geoSoftCandidateToMap(
	adapter geoSoftIngestAdapterSpec,
	item geoSoftSignalCandidate,
	fallback *geoSoftSignalArticleInput,
) map[string]any {
	headline := strings.TrimSpace(item.Headline)
	if headline == "" && fallback != nil {
		headline = strings.TrimSpace(fallback.Title)
	}
	if headline == "" {
		return nil
	}

	regionHint := strings.TrimSpace(item.RegionHint)
	if regionHint == "" {
		regionHint = "global"
	}
	severity := item.SeverityHint
	if severity < 1 || severity > 5 {
		severity = 2
	}
	confidence := item.Confidence
	if confidence < 0 {
		confidence = 0
	}
	if confidence > 1 {
		confidence = 1
	}

	sourceRefs := geoSoftSourceRefsToMaps(adapter.ID, item.SourceRefs, fallback)
	idParts := []string{"soft", adapter.ID, headline}
	if len(sourceRefs) > 0 {
		idParts = append(idParts, strings.TrimSpace(stringFieldCandidateMap(sourceRefs[0], "url")))
	}
	id := stableGeoCandidateID(idParts...)

	reviewNote := "AUTO[soft/" + adapter.ID + "] conf=" + strconv.FormatFloat(confidence, 'f', 2, 64)
	if fallback != nil && strings.TrimSpace(fallback.Source) != "" {
		reviewNote += " src=" + strings.TrimSpace(fallback.Source)
	}

	countryHints := make([]string, 0, len(item.CountryHints))
	for _, code := range item.CountryHints {
		code = strings.ToUpper(strings.TrimSpace(code))
		if code != "" {
			countryHints = append(countryHints, code)
		}
	}
	if len(countryHints) == 0 && fallback != nil {
		countryHints = inferSoftCountryHints(fallback.Title + " " + fallback.Summary)
	}

	return map[string]any{
		"id":           id,
		"generatedAt":  timeNowRFC3339(),
		"triggerType":  adapter.TriggerType,
		"confidence":   confidence,
		"severityHint": severity,
		"headline":     trimStringForCandidate(headline, 220),
		"regionHint":   regionHint,
		"countryHints": countryHints,
		"sourceRefs":   sourceRefs,
		"state":        "open",
		"reviewNote":   trimStringForCandidate(reviewNote, 500),
		"symbol":       trimmedStringOr(item.Symbol, "newspaper"),
		"category":     trimmedStringOr(item.Category, "news_narrative"),
		"hotspotIds":   item.HotspotIDs,
	}
}

func geoSoftSourceRefsToMaps(
	adapterID string,
	refs []geoSoftSignalSourceRef,
	fallback *geoSoftSignalArticleInput,
) []map[string]any {
	out := make([]map[string]any, 0, len(refs)+1)
	for _, ref := range refs {
		provider := strings.TrimSpace(ref.Provider)
		rawURL := strings.TrimSpace(ref.URL)
		if provider == "" || rawURL == "" {
			continue
		}
		out = append(out, map[string]any{
			"provider":    provider,
			"url":         rawURL,
			"title":       strings.TrimSpace(ref.Title),
			"publishedAt": strings.TrimSpace(ref.PublishedAt),
			"sourceTier":  trimmedStringOr(ref.SourceTier, "C"),
			"reliability": ref.Reliability,
		})
	}
	if len(out) == 0 && fallback != nil {
		out = append(out, map[string]any{
			"provider":    adapterID + ":" + trimmedStringOr(strings.TrimSpace(fallback.Source), "unknown"),
			"url":         strings.TrimSpace(fallback.URL),
			"title":       strings.TrimSpace(fallback.Title),
			"publishedAt": strings.TrimSpace(fallback.PublishedAt),
			"sourceTier":  "C",
			"reliability": 0.55,
		})
	}
	return out
}

func inferSoftCountryHints(text string) []string {
	lower := strings.ToLower(text)
	switch {
	case strings.Contains(lower, "fomc"), strings.Contains(lower, "federal reserve"), strings.Contains(lower, "washington"):
		return []string{"US"}
	case strings.Contains(lower, "ecb"), strings.Contains(lower, "eurozone"), strings.Contains(lower, "frankfurt"):
		return []string{"DE"}
	case strings.Contains(lower, "uk"), strings.Contains(lower, "britain"), strings.Contains(lower, "london"):
		return []string{"GB"}
	case strings.Contains(lower, "russia"), strings.Contains(lower, "kremlin"), strings.Contains(lower, "moscow"):
		return []string{"RU"}
	case strings.Contains(lower, "ukraine"), strings.Contains(lower, "kyiv"), strings.Contains(lower, "kiev"):
		return []string{"UA"}
	default:
		return nil
	}
}

func softIngestAdapterMessage(dryRun bool) string {
	if dryRun {
		return "dry-run"
	}
	return ""
}

func softIngestNotes(req geoSoftIngestRequest, adapters []geoSoftIngestAdapterSpec) []string {
	notes := []string{"gateway_softsignals_ingest"}
	if req.DryRun {
		notes = append(notes, "dry_run")
	}
	if req.Limit > 0 {
		notes = append(notes, "limit:"+strconv.Itoa(req.Limit))
	}
	for _, adapter := range adapters {
		notes = append(notes, "adapter:"+adapter.ID)
	}
	return notes
}
