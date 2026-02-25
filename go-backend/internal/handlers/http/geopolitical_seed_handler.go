package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalSeedCandidateStore interface {
	List(filters geopoliticalServices.CandidateListFilters) ([]map[string]any, error)
	UpsertCandidate(candidate map[string]any) error
}

type geopoliticalSeedContradictionsStore interface {
	List(filters geopoliticalServices.ContradictionListFilters) ([]geopoliticalServices.GeoContradiction, error)
	Create(input geopoliticalServices.CreateContradictionInput) (*geopoliticalServices.GeoContradiction, error)
}

type geopoliticalSeedTimelineStore interface {
	Append(entry geopoliticalServices.GeoTimelineEntry) (*geopoliticalServices.GeoTimelineEntry, error)
}

type geopoliticalSeedEventsStore interface {
	List(limit int) ([]geopoliticalServices.GeoEventRecord, error)
	Create(input geopoliticalServices.CreateGeoEventRecordInput) (*geopoliticalServices.GeoEventRecord, error)
}

type geoSeedTargets struct {
	Events         int `json:"events"`
	Candidates     int `json:"candidates"`
	Contradictions int `json:"contradictions"`
}

type geoSeedRequest struct {
	Targets *geoSeedTargets `json:"targets"`
	Reset   bool            `json:"reset"`
}

func GeopoliticalSeedHandler(
	candidates geopoliticalSeedCandidateStore,
	contradictions geopoliticalSeedContradictionsStore,
	timeline geopoliticalSeedTimelineStore,
	events geopoliticalSeedEventsStore,
	runsStore geopoliticalIngestRunsStore,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if candidates == nil || contradictions == nil || timeline == nil || events == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "geopolitical seed unavailable"})
			return
		}
		startedAt := timeNowRFC3339()
		req := geoSeedRequest{}
		if r.Body != nil {
			var parsed geoSeedRequest
			if err := json.NewDecoder(r.Body).Decode(&parsed); err == nil {
				req = parsed
			}
		}
		targets := geoSeedTargets{Events: 40, Candidates: 200, Contradictions: 10}
		if req.Targets != nil {
			if req.Targets.Events > 0 {
				targets.Events = req.Targets.Events
			}
			if req.Targets.Candidates > 0 {
				targets.Candidates = req.Targets.Candidates
			}
			if req.Targets.Contradictions > 0 {
				targets.Contradictions = req.Targets.Contradictions
			}
		}

		beforeEvents, err := events.List(10000)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "seed events list failed"})
			return
		}
		beforeCandidates, err := candidates.List(geopoliticalServices.CandidateListFilters{})
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "seed candidates list failed"})
			return
		}
		beforeContradictions, err := contradictions.List(geopoliticalServices.ContradictionListFilters{})
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "seed contradictions list failed"})
			return
		}

		actor := trimmedStringOr(geoActorFromRequest(r), "seed-engine")
		createdEvents := 0
		createdCandidates := 0
		createdContradictions := 0

		for idx := len(beforeEvents); idx < targets.Events; idx++ {
			input := buildGoSeedEventInput(idx, actor)
			event, createErr := events.Create(input)
			if createErr != nil || event == nil {
				writeJSON(w, http.StatusBadGateway, map[string]string{"error": "seed event create failed"})
				return
			}
			createdEvents++
			_, _ = timeline.Append(geopoliticalServices.GeoTimelineEntry{
				EventID:     event.ID,
				Action:      "created",
				Actor:       actor,
				DiffSummary: "Seeded Earth event: " + event.Title,
			})
		}

		for idx := len(beforeContradictions); idx < targets.Contradictions; idx++ {
			input := buildGoSeedContradictionInput(idx, actor)
			item, createErr := contradictions.Create(input)
			if createErr != nil || item == nil {
				writeJSON(w, http.StatusBadGateway, map[string]string{"error": "seed contradiction create failed"})
				return
			}
			createdContradictions++
			_, _ = timeline.Append(geopoliticalServices.GeoTimelineEntry{
				EventID:     "contradiction:" + item.ID,
				Action:      "contradiction_created",
				Actor:       actor,
				DiffSummary: "Seeded contradiction: " + item.Title,
			})
		}

		currentCandidates, err := candidates.List(geopoliticalServices.CandidateListFilters{})
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "seed candidates list failed"})
			return
		}
		for idx := len(currentCandidates); idx < targets.Candidates; idx++ {
			candidate := buildGoSeedCandidate(idx)
			if upsertErr := candidates.UpsertCandidate(candidate); upsertErr != nil {
				writeJSON(w, http.StatusBadGateway, map[string]string{"error": "seed candidate create failed"})
				return
			}
			createdCandidates++
		}

		afterEvents, _ := events.List(10000)
		afterCandidates, _ := candidates.List(geopoliticalServices.CandidateListFilters{})
		afterContradictions, _ := contradictions.List(geopoliticalServices.ContradictionListFilters{})

		result := map[string]any{
			"targets": map[string]any{
				"events":         targets.Events,
				"candidates":     targets.Candidates,
				"contradictions": targets.Contradictions,
			},
			"before": map[string]any{
				"events":         len(beforeEvents),
				"candidates":     len(beforeCandidates),
				"contradictions": len(beforeContradictions),
			},
			"created": map[string]any{
				"events":         createdEvents,
				"candidates":     createdCandidates,
				"contradictions": createdContradictions,
			},
			"after": map[string]any{
				"events":         len(afterEvents),
				"candidates":     len(afterCandidates),
				"contradictions": len(afterContradictions),
			},
			"note": "Go-owned earth seed bootstrap for GeoMap migration/cutover testing.",
		}

		if runsStore != nil {
			_, _ = runsStore.Append(geopoliticalServices.GeoIngestRun{
				Kind:               "seed",
				Mode:               "go-owned-gateway-v1",
				UpstreamPath:       "gateway-local-seed",
				Actor:              actor,
				RequestID:          strings.TrimSpace(r.Header.Get("X-Request-ID")),
				StatusCode:         http.StatusOK,
				Success:            true,
				StartedAt:          startedAt,
				FinishedAt:         timeNowRFC3339(),
				CandidateSyncCount: createdCandidates,
				Notes: []string{
					"gateway_seed_ensure",
					"target_events:" + strconv.Itoa(targets.Events),
					"target_candidates:" + strconv.Itoa(targets.Candidates),
					"target_contradictions:" + strconv.Itoa(targets.Contradictions),
				},
			})
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"success": true,
			"scope":   "earth-phase4",
			"seeded": map[string]any{
				"events":         createdEvents,
				"candidates":     createdCandidates,
				"contradictions": createdContradictions,
			},
			"result": result,
		})
	}
}

type geoSeedRegion struct {
	ID      string
	Label   string
	Country string
	Lat     float64
	Lng     float64
}

type geoSeedSymbol struct {
	Symbol   string
	Label    string
	Category string
}

var geoSeedRegions = []geoSeedRegion{
	{ID: "north-america", Label: "North America", Country: "US", Lat: 41, Lng: -100},
	{ID: "europe", Label: "Europe", Country: "DE", Lat: 50, Lng: 12},
	{ID: "mena", Label: "MENA", Country: "SA", Lat: 28, Lng: 35},
	{ID: "east-asia", Label: "East Asia", Country: "CN", Lat: 36, Lng: 117},
	{ID: "south-asia", Label: "South Asia", Country: "IN", Lat: 22, Lng: 78},
	{ID: "southeast-asia", Label: "Southeast Asia", Country: "SG", Lat: 8, Lng: 105},
}

var geoSeedSymbols = []geoSeedSymbol{
	{Symbol: "gavel", Label: "Sanctions", Category: "sanctions_export_controls"},
	{Symbol: "percent", Label: "Rates", Category: "monetary_policy_rates"},
	{Symbol: "shield-alert", Label: "Conflict", Category: "conflict_security"},
	{Symbol: "fuel", Label: "Energy", Category: "energy_supply_shock"},
}

func buildGoSeedEventInput(idx int, actor string) geopoliticalServices.CreateGeoEventRecordInput {
	region := geoSeedRegions[idx%len(geoSeedRegions)]
	symbol := geoSeedSymbols[idx%len(geoSeedSymbols)]
	lat, lng := seededGeoJitter(region.Lat, region.Lng, idx)
	return geopoliticalServices.CreateGeoEventRecordInput{
		Title:        "Seed " + symbol.Label + " monitoring update - " + region.Label + " #" + strconv.Itoa(idx+1),
		Symbol:       symbol.Symbol,
		Category:     symbol.Category,
		Status:       []string{"candidate", "confirmed", "persistent"}[idx%3],
		Severity:     2 + (idx % 4),
		Confidence:   1 + (idx % 4),
		CountryCodes: []string{region.Country},
		RegionIDs:    []string{region.ID},
		Coordinates:  []geopoliticalServices.GeoEventCoordinate{{Lat: lat, Lng: lng}},
		Summary:      "Go-owned seed event for GeoMap phase 9 cutover testing.",
		AnalystNote:  "seed:go-gateway",
		Actor:        actor,
	}
}

func buildGoSeedContradictionInput(idx int, actor string) geopoliticalServices.CreateContradictionInput {
	region := geoSeedRegions[idx%len(geoSeedRegions)]
	symbol := geoSeedSymbols[idx%len(geoSeedSymbols)]
	return geopoliticalServices.CreateContradictionInput{
		Title:        region.Label + ": contradictory signals for " + strings.ToLower(symbol.Label),
		SeverityHint: 2 + (idx % 3),
		RegionID:     region.ID,
		CountryCode:  region.Country,
		Summary:      "Seed contradiction for GeoMap review workflow and cutover validation.",
		StatementA:   region.Label + " reports escalation affecting " + strings.ToLower(symbol.Label) + " flows",
		StatementB:   region.Label + " officials deny escalation affecting " + strings.ToLower(symbol.Label) + " flows",
		SourceRefs: []map[string]any{{
			"provider":    "seed:official-monitor",
			"url":         "https://seed.local/contradictions/" + strconv.Itoa(idx),
			"title":       "Go-owned contradiction seed",
			"publishedAt": timeNowRFC3339(),
			"sourceTier":  "B",
			"reliability": 0.8,
		}},
		CreatedBy: actor,
	}
}

func buildGoSeedCandidate(idx int) map[string]any {
	region := geoSeedRegions[idx%len(geoSeedRegions)]
	symbol := geoSeedSymbols[idx%len(geoSeedSymbols)]
	id := stableGeoCandidateID("seed", "go", region.ID, symbol.Symbol, strconv.Itoa(idx))
	confidence := 0.46 + (float64((idx*37)%45) / 100)
	if confidence > 0.95 {
		confidence = 0.95
	}
	return map[string]any{
		"id":           id,
		"generatedAt":  timeNowRFC3339(),
		"triggerType":  ternaryString(idx%4 == 0, "hard_signal", "news_cluster"),
		"confidence":   confidence,
		"severityHint": 2 + (idx % 4),
		"headline":     region.Label + " " + strings.ToLower(symbol.Label) + " monitoring candidate #" + strconv.Itoa(idx+1),
		"regionHint":   region.ID,
		"countryHints": []string{region.Country},
		"sourceRefs": []map[string]any{{
			"provider":    ternaryString(idx%3 == 0, "Reuters", "OfficialMonitor"),
			"url":         "https://seed.local/candidates/" + strconv.Itoa(idx),
			"title":       "Go-owned seed candidate source",
			"publishedAt": timeNowRFC3339(),
			"sourceTier":  "B",
			"reliability": 0.72,
		}},
		"state":      "open",
		"reviewNote": "seed:go-gateway",
		"symbol":     symbol.Symbol,
		"category":   symbol.Category,
	}
}

func seededGeoJitter(baseLat, baseLng float64, seed int) (float64, float64) {
	lat := baseLat + ((float64((seed*17)%100)/100)-0.5)*14
	lng := baseLng + ((float64((seed*29)%100)/100)-0.5)*22
	if lat > 85 {
		lat = 85
	}
	if lat < -85 {
		lat = -85
	}
	for lng > 180 {
		lng -= 360
	}
	for lng < -180 {
		lng += 360
	}
	return lat, lng
}

func ternaryString(cond bool, whenTrue, whenFalse string) string {
	if cond {
		return whenTrue
	}
	return whenFalse
}
