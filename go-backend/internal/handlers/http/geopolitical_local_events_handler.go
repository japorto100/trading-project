package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type geopoliticalLocalEventsStore interface {
	ListFiltered(filters geopoliticalServices.GeoEventListFilters) ([]geopoliticalServices.GeoEventRecord, error)
	Get(eventID string) (*geopoliticalServices.GeoEventRecord, error)
	Create(input geopoliticalServices.CreateGeoEventRecordInput) (*geopoliticalServices.GeoEventRecord, error)
	Update(eventID string, input geopoliticalServices.UpdateGeoEventRecordInput) (*geopoliticalServices.GeoEventRecord, error)
	AddSource(eventID string, source map[string]any, actor string) (*geopoliticalServices.GeoEventRecord, error)
	AddAsset(eventID string, asset map[string]any, actor string) (*geopoliticalServices.GeoEventRecord, error)
	Archive(eventID string, actor string) (*geopoliticalServices.GeoEventRecord, error)
	Delete(eventID string) (bool, error)
}

func GeopoliticalLocalEventsHandler(store geopoliticalLocalEventsStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if store == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "local geopolitical events store unavailable"})
			return
		}

		const basePath = "/api/v1/geopolitical/local-events"
		if r.URL.Path == basePath {
			switch r.Method {
			case http.MethodGet:
				handleGeopoliticalLocalEventsList(w, r, store)
			case http.MethodPost:
				handleGeopoliticalLocalEventsCreate(w, r, store)
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
		remainder := strings.TrimPrefix(r.URL.Path, basePath+"/")
		parts := strings.Split(strings.Trim(remainder, "/"), "/")
		if len(parts) == 0 || parts[0] == "" {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}
		eventID := strings.TrimSpace(parts[0])

		if len(parts) == 1 {
			switch r.Method {
			case http.MethodGet:
				handleGeopoliticalLocalEventsGet(w, store, eventID)
			case http.MethodPatch:
				handleGeopoliticalLocalEventsPatch(w, r, store, eventID)
			case http.MethodDelete:
				handleGeopoliticalLocalEventsDelete(w, store, eventID)
			default:
				w.Header().Set("Allow", "GET, PATCH, DELETE")
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			}
			return
		}

		if len(parts) != 2 {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
			return
		}

		switch parts[1] {
		case "sources":
			if r.Method != http.MethodPost {
				w.Header().Set("Allow", http.MethodPost)
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
				return
			}
			handleGeopoliticalLocalEventsAddSource(w, r, store, eventID)
		case "assets":
			if r.Method != http.MethodPost {
				w.Header().Set("Allow", http.MethodPost)
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
				return
			}
			handleGeopoliticalLocalEventsAddAsset(w, r, store, eventID)
		case "archive":
			if r.Method != http.MethodPost {
				w.Header().Set("Allow", http.MethodPost)
				writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
				return
			}
			handleGeopoliticalLocalEventsArchive(w, r, store, eventID)
		default:
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		}
	}
}

func handleGeopoliticalLocalEventsList(w http.ResponseWriter, r *http.Request, store geopoliticalLocalEventsStore) {
	minSeverity := 0
	if raw := strings.TrimSpace(r.URL.Query().Get("minSeverity")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid minSeverity"})
			return
		}
		minSeverity = parsed
	}
	limit := 0
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid limit"})
			return
		}
		limit = parsed
	}
	items, err := store.ListFiltered(geopoliticalServices.GeoEventListFilters{
		Status:      strings.TrimSpace(r.URL.Query().Get("status")),
		Category:    strings.TrimSpace(r.URL.Query().Get("category")),
		RegionID:    strings.TrimSpace(r.URL.Query().Get("regionId")),
		MinSeverity: minSeverity,
		Query:       strings.TrimSpace(r.URL.Query().Get("q")),
		Limit:       limit,
	})
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical events list failed"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "source": "local", "events": items})
}

func handleGeopoliticalLocalEventsGet(w http.ResponseWriter, store geopoliticalLocalEventsStore, eventID string) {
	item, err := store.Get(eventID)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical event read failed"})
		return
	}
	if item == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "event not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "event": item})
}

func handleGeopoliticalLocalEventsCreate(w http.ResponseWriter, r *http.Request, store geopoliticalLocalEventsStore) {
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	title := trimStringMax(body["title"], 200)
	if title == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title is required"})
		return
	}
	input := geopoliticalServices.CreateGeoEventRecordInput{
		Title:        title,
		Symbol:       trimStringMax(body["symbol"], 80),
		Category:     trimStringMax(body["category"], 120),
		Status:       trimStringMax(body["status"], 32),
		Severity:     intNumberField(body["severity"], 2),
		Confidence:   intNumberField(body["confidence"], 2),
		CountryCodes: stringArrayField(body["countryCodes"]),
		RegionIDs:    stringArrayField(body["regionIds"]),
		Summary:      trimStringMax(body["summary"], 2000),
		AnalystNote:  trimStringMax(body["analystNote"], 500),
		Actor:        geoActorFromRequest(r),
	}
	lat := numberField(body["lat"])
	lng := numberField(body["lng"])
	if lat != nil && lng != nil {
		input.Coordinates = []geopoliticalServices.GeoEventCoordinate{{Lat: *lat, Lng: *lng}}
	}
	created, err := store.Create(input)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical event create failed"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "event": created})
}

func handleGeopoliticalLocalEventsPatch(w http.ResponseWriter, r *http.Request, store geopoliticalLocalEventsStore, eventID string) {
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	var patch geopoliticalServices.UpdateGeoEventRecordInput
	patch.Actor = geoActorFromRequest(r)

	if _, exists := body["title"]; exists {
		value := trimStringMax(body["title"], 200)
		patch.Title = &value
	}
	if _, exists := body["symbol"]; exists {
		value := trimStringMax(body["symbol"], 80)
		patch.Symbol = &value
	}
	if _, exists := body["category"]; exists {
		value := trimStringMax(body["category"], 120)
		patch.Category = &value
	}
	if _, exists := body["status"]; exists {
		value := trimStringMax(body["status"], 32)
		patch.Status = &value
	}
	if _, exists := body["severity"]; exists {
		value := intNumberField(body["severity"], 2)
		patch.Severity = &value
	}
	if _, exists := body["confidence"]; exists {
		value := intNumberField(body["confidence"], 2)
		patch.Confidence = &value
	}
	if _, exists := body["countryCodes"]; exists {
		patch.CountryCodes = stringArrayField(body["countryCodes"])
		patch.HasCountryCodes = true
	}
	if _, exists := body["regionIds"]; exists {
		patch.RegionIDs = stringArrayField(body["regionIds"])
		patch.HasRegionIDs = true
	}
	_, hasLat := body["lat"]
	_, hasLng := body["lng"]
	if hasLat != hasLng {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "lat and lng must be provided together"})
		return
	}
	if hasLat && hasLng {
		lat := numberField(body["lat"])
		lng := numberField(body["lng"])
		if lat == nil || lng == nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "lat and lng must be numeric"})
			return
		}
		patch.Coordinates = []geopoliticalServices.GeoEventCoordinate{{Lat: *lat, Lng: *lng}}
		patch.HasCoordinates = true
	}
	if _, exists := body["summary"]; exists {
		value := trimStringMax(body["summary"], 2000)
		patch.Summary = &value
	}
	if _, exists := body["analystNote"]; exists {
		value := trimStringMax(body["analystNote"], 500)
		patch.AnalystNote = &value
	}

	updated, err := store.Update(eventID, patch)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical event update failed"})
		return
	}
	if updated == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "event not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "event": updated})
}

func handleGeopoliticalLocalEventsDelete(w http.ResponseWriter, store geopoliticalLocalEventsStore, eventID string) {
	removed, err := store.Delete(eventID)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical event delete failed"})
		return
	}
	if !removed {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "event not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func handleGeopoliticalLocalEventsAddSource(w http.ResponseWriter, r *http.Request, store geopoliticalLocalEventsStore, eventID string) {
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	provider := trimStringMax(body["provider"], 120)
	url := trimStringMax(body["url"], 2048)
	if provider == "" || url == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "provider and url are required"})
		return
	}
	source := map[string]any{
		"id":          trimStringMax(body["id"], 80),
		"provider":    provider,
		"url":         url,
		"title":       trimStringMax(body["title"], 220),
		"publishedAt": trimStringMax(body["publishedAt"], 64),
		"fetchedAt":   trimStringMax(body["fetchedAt"], 64),
		"sourceTier":  trimStringMax(body["sourceTier"], 4),
		"reliability": floatNumberField(body["reliability"]),
	}
	updated, err := store.AddSource(eventID, source, geoActorFromRequest(r))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical event source update failed"})
		return
	}
	if updated == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "event not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "event": updated})
}

func handleGeopoliticalLocalEventsAddAsset(w http.ResponseWriter, r *http.Request, store geopoliticalLocalEventsStore, eventID string) {
	var body map[string]any
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	symbol := trimStringMax(body["symbol"], 64)
	if symbol == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "symbol is required"})
		return
	}
	asset := map[string]any{
		"id":         trimStringMax(body["id"], 80),
		"symbol":     symbol,
		"assetClass": trimStringMax(body["assetClass"], 32),
		"relation":   trimStringMax(body["relation"], 32),
		"weight":     floatNumberField(body["weight"]),
		"rationale":  trimStringMax(body["rationale"], 500),
	}
	updated, err := store.AddAsset(eventID, asset, geoActorFromRequest(r))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical event asset update failed"})
		return
	}
	if updated == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "event not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "event": updated})
}

func handleGeopoliticalLocalEventsArchive(w http.ResponseWriter, r *http.Request, store geopoliticalLocalEventsStore, eventID string) {
	updated, err := store.Archive(eventID, geoActorFromRequest(r))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "local geopolitical event archive failed"})
		return
	}
	if updated == nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "event not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "event": updated})
}

func numberField(value any) *float64 {
	switch v := value.(type) {
	case float64:
		return &v
	case float32:
		out := float64(v)
		return &out
	case int:
		out := float64(v)
		return &out
	case int64:
		out := float64(v)
		return &out
	default:
		return nil
	}
}

func floatNumberField(value any) any {
	switch v := value.(type) {
	case float64:
		return v
	case float32:
		return float64(v)
	case int:
		return float64(v)
	case int64:
		return float64(v)
	default:
		return nil
	}
}
