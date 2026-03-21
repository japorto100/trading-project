package geopolitical

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"sort"
	"strings"
	"sync"
	"time"
)

type EventsStore struct {
	mu       sync.Mutex
	filePath string
}

type GeoEventCoordinate struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type GeoEventRecord struct {
	ID           string               `json:"id"`
	Title        string               `json:"title"`
	Symbol       string               `json:"symbol"`
	Category     string               `json:"category"`
	Status       string               `json:"status"`
	Severity     int                  `json:"severity"`
	Confidence   int                  `json:"confidence"`
	CountryCodes []string             `json:"countryCodes"`
	RegionIDs    []string             `json:"regionIds"`
	Coordinates  []GeoEventCoordinate `json:"coordinates"`
	Summary      string               `json:"summary,omitempty"`
	AnalystNote  string               `json:"analystNote,omitempty"`
	Sources      []map[string]any     `json:"sources"`
	Assets       []map[string]any     `json:"assets"`
	CreatedAt    string               `json:"createdAt"`
	UpdatedAt    string               `json:"updatedAt"`
	CreatedBy    string               `json:"createdBy"`
	UpdatedBy    string               `json:"updatedBy"`
}

type GeoEventListFilters struct {
	Status      string
	Category    string
	RegionID    string
	MinSeverity int
	Query       string
	Limit       int
}

type CreateGeoEventRecordInput struct {
	Title        string
	Symbol       string
	Category     string
	Status       string
	Severity     int
	Confidence   int
	CountryCodes []string
	RegionIDs    []string
	Coordinates  []GeoEventCoordinate
	Summary      string
	AnalystNote  string
	Actor        string
}

type UpdateGeoEventRecordInput struct {
	Title           *string
	Symbol          *string
	Category        *string
	Status          *string
	Severity        *int
	Confidence      *int
	CountryCodes    []string
	HasCountryCodes bool
	RegionIDs       []string
	HasRegionIDs    bool
	Coordinates     []GeoEventCoordinate
	HasCoordinates  bool
	Summary         *string
	AnalystNote     *string
	Actor           string
}

type eventsStoreFile struct {
	Events []GeoEventRecord `json:"events"`
}

func NewEventsStore(filePath string) *EventsStore {
	trimmed := strings.TrimSpace(filePath)
	if trimmed == "" {
		trimmed = filepath.Join("data", "geopolitical", "gateway-events.json")
	}
	return &EventsStore{filePath: trimmed}
}

func (s *EventsStore) Create(input CreateGeoEventRecordInput) (*GeoEventRecord, error) {
	if s == nil {
		return nil, fmt.Errorf("events store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC().Format(time.RFC3339)
	record := GeoEventRecord{
		ID:           randomPrefixedID("ge"),
		Title:        trimMax(input.Title, 200),
		Symbol:       trimmedOr(input.Symbol, "gavel"),
		Category:     trimmedOr(input.Category, "sanctions_export_controls"),
		Status:       trimmedOr(input.Status, "confirmed"),
		Severity:     clampInt(input.Severity, 1, 5, 2),
		Confidence:   clampInt(input.Confidence, 0, 4, 2),
		CountryCodes: cloneStrings(input.CountryCodes),
		RegionIDs:    cloneStrings(input.RegionIDs),
		Coordinates:  cloneCoordinates(input.Coordinates),
		Summary:      trimMax(input.Summary, 2000),
		AnalystNote:  trimMax(input.AnalystNote, 500),
		Sources:      []map[string]any{},
		Assets:       []map[string]any{},
		CreatedAt:    now,
		UpdatedAt:    now,
		CreatedBy:    trimmedOr(input.Actor, "local-analyst"),
		UpdatedBy:    trimmedOr(input.Actor, "local-analyst"),
	}
	if record.CountryCodes == nil {
		record.CountryCodes = []string{}
	}
	if record.RegionIDs == nil {
		record.RegionIDs = []string{}
	}
	if len(record.Coordinates) == 0 {
		record.Coordinates = []GeoEventCoordinate{{Lat: 20.0, Lng: 0.0}}
	}
	store.Events = append([]GeoEventRecord{record}, store.Events...)
	if err := s.writeLocked(store); err != nil {
		return nil, err
	}
	copy := record
	return &copy, nil
}

func (s *EventsStore) Get(eventID string) (*GeoEventRecord, error) {
	if s == nil {
		return nil, fmt.Errorf("events store unavailable")
	}
	eventID = strings.TrimSpace(eventID)
	if eventID == "" {
		return nil, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	for _, item := range store.Events {
		if item.ID == eventID {
			copy := cloneGeoEventRecord(item)
			return &copy, nil
		}
	}
	return nil, nil
}

func (s *EventsStore) AddSource(eventID string, source map[string]any, actor string) (*GeoEventRecord, error) {
	if s == nil {
		return nil, fmt.Errorf("events store unavailable")
	}
	eventID = strings.TrimSpace(eventID)
	if eventID == "" {
		return nil, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	for i, item := range store.Events {
		if item.ID != eventID {
			continue
		}
		next := item
		next.Sources = append(next.Sources, cloneAnyMaps([]map[string]any{source})...)
		next.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
		next.UpdatedBy = trimmedOr(actor, item.UpdatedBy)
		store.Events[i] = next
		if err := s.writeLocked(store); err != nil {
			return nil, err
		}
		copy := next
		return &copy, nil
	}
	return nil, nil
}

func (s *EventsStore) AddAsset(eventID string, asset map[string]any, actor string) (*GeoEventRecord, error) {
	if s == nil {
		return nil, fmt.Errorf("events store unavailable")
	}
	eventID = strings.TrimSpace(eventID)
	if eventID == "" {
		return nil, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	for i, item := range store.Events {
		if item.ID != eventID {
			continue
		}
		next := item
		next.Assets = append(next.Assets, cloneAnyMaps([]map[string]any{asset})...)
		next.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
		next.UpdatedBy = trimmedOr(actor, item.UpdatedBy)
		store.Events[i] = next
		if err := s.writeLocked(store); err != nil {
			return nil, err
		}
		copy := cloneGeoEventRecord(next)
		return &copy, nil
	}
	return nil, nil
}

func (s *EventsStore) Update(eventID string, input UpdateGeoEventRecordInput) (*GeoEventRecord, error) {
	if s == nil {
		return nil, fmt.Errorf("events store unavailable")
	}
	eventID = strings.TrimSpace(eventID)
	if eventID == "" {
		return nil, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	for i, item := range store.Events {
		if item.ID != eventID {
			continue
		}
		next := cloneGeoEventRecord(item)
		if input.Title != nil {
			next.Title = trimMax(*input.Title, 200)
		}
		if input.Symbol != nil {
			next.Symbol = trimmedOr(*input.Symbol, next.Symbol)
		}
		if input.Category != nil {
			next.Category = trimmedOr(*input.Category, next.Category)
		}
		if input.Status != nil {
			next.Status = trimmedOr(*input.Status, next.Status)
		}
		if input.Severity != nil {
			next.Severity = clampInt(*input.Severity, 1, 5, next.Severity)
		}
		if input.Confidence != nil {
			next.Confidence = clampInt(*input.Confidence, 0, 4, next.Confidence)
		}
		if input.HasCountryCodes {
			next.CountryCodes = cloneStrings(input.CountryCodes)
		}
		if input.HasRegionIDs {
			next.RegionIDs = cloneStrings(input.RegionIDs)
		}
		if input.HasCoordinates {
			next.Coordinates = cloneCoordinates(input.Coordinates)
		}
		if input.Summary != nil {
			next.Summary = trimMax(*input.Summary, 2000)
		}
		if input.AnalystNote != nil {
			next.AnalystNote = trimMax(*input.AnalystNote, 500)
		}
		next.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
		next.UpdatedBy = trimmedOr(input.Actor, item.UpdatedBy)
		store.Events[i] = next
		if err := s.writeLocked(store); err != nil {
			return nil, err
		}
		copy := cloneGeoEventRecord(next)
		return &copy, nil
	}
	return nil, nil
}

func (s *EventsStore) Archive(eventID string, actor string) (*GeoEventRecord, error) {
	status := "archived"
	return s.Update(eventID, UpdateGeoEventRecordInput{
		Status: &status,
		Actor:  actor,
	})
}

func (s *EventsStore) Delete(eventID string) (bool, error) {
	if s == nil {
		return false, fmt.Errorf("events store unavailable")
	}
	eventID = strings.TrimSpace(eventID)
	if eventID == "" {
		return false, nil
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	store, err := s.readLocked()
	if err != nil {
		return false, err
	}
	initial := len(store.Events)
	filtered := store.Events[:0]
	for _, item := range store.Events {
		if item.ID == eventID {
			continue
		}
		filtered = append(filtered, item)
	}
	if len(filtered) == initial {
		return false, nil
	}
	store.Events = append([]GeoEventRecord(nil), filtered...)
	if err := s.writeLocked(store); err != nil {
		return false, err
	}
	return true, nil
}

func (s *EventsStore) List(limit int) ([]GeoEventRecord, error) {
	return s.ListFiltered(GeoEventListFilters{Limit: limit})
}

func (s *EventsStore) ListFiltered(filters GeoEventListFilters) ([]GeoEventRecord, error) {
	if s == nil {
		return nil, fmt.Errorf("events store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	statusFilter := strings.ToLower(strings.TrimSpace(filters.Status))
	categoryFilter := strings.ToLower(strings.TrimSpace(filters.Category))
	regionFilter := strings.TrimSpace(filters.RegionID)
	queryFilter := strings.ToLower(strings.TrimSpace(filters.Query))
	items := make([]GeoEventRecord, 0, len(store.Events))
	for _, item := range store.Events {
		if statusFilter != "" && strings.ToLower(item.Status) != statusFilter {
			continue
		}
		if categoryFilter != "" && strings.ToLower(item.Category) != categoryFilter {
			continue
		}
		if filters.MinSeverity > 0 && item.Severity < filters.MinSeverity {
			continue
		}
		if regionFilter != "" && !containsString(item.RegionIDs, regionFilter) {
			continue
		}
		if queryFilter != "" && !geoEventMatchesQuery(item, queryFilter) {
			continue
		}
		items = append(items, cloneGeoEventRecord(item))
	}
	sort.SliceStable(items, func(i, j int) bool {
		return parseRFC3339(items[i].UpdatedAt).After(parseRFC3339(items[j].UpdatedAt))
	})
	if filters.Limit > 0 && len(items) > filters.Limit {
		items = items[:filters.Limit]
	}
	return items, nil
}

func (s *EventsStore) readLocked() (eventsStoreFile, error) {
	raw, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return eventsStoreFile{Events: []GeoEventRecord{}}, nil
		}
		return eventsStoreFile{}, fmt.Errorf("read events store: %w", err)
	}
	var parsed eventsStoreFile
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return eventsStoreFile{}, fmt.Errorf("decode events store: %w", err)
	}
	if parsed.Events == nil {
		parsed.Events = []GeoEventRecord{}
	}
	for i := range parsed.Events {
		if parsed.Events[i].Sources == nil {
			parsed.Events[i].Sources = []map[string]any{}
		}
		if parsed.Events[i].Assets == nil {
			parsed.Events[i].Assets = []map[string]any{}
		}
	}
	return parsed, nil
}

func (s *EventsStore) writeLocked(store eventsStoreFile) error {
	return writeJSONFileAtomic(s.filePath, store)
}

func clampInt(value, min, max, fallback int) int {
	if value < min || value > max {
		return fallback
	}
	return value
}

func cloneCoordinates(coords []GeoEventCoordinate) []GeoEventCoordinate {
	if len(coords) == 0 {
		return nil
	}
	return append([]GeoEventCoordinate(nil), coords...)
}

func cloneGeoEventRecord(item GeoEventRecord) GeoEventRecord {
	item.CountryCodes = cloneStrings(item.CountryCodes)
	item.RegionIDs = cloneStrings(item.RegionIDs)
	item.Coordinates = cloneCoordinates(item.Coordinates)
	item.Sources = cloneAnyMaps(item.Sources)
	item.Assets = cloneAnyMaps(item.Assets)
	return item
}

func containsString(items []string, needle string) bool {
	return slices.Contains(items, needle)
}

func geoEventMatchesQuery(item GeoEventRecord, query string) bool {
	if query == "" {
		return true
	}
	return strings.Contains(strings.ToLower(item.Title), query) ||
		strings.Contains(strings.ToLower(item.Summary), query) ||
		strings.Contains(strings.ToLower(item.Category), query)
}
