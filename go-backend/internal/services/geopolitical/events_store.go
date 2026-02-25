package geopolitical

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
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
		Confidence:   clampInt(input.Confidence, 1, 5, 3),
		CountryCodes: cloneStrings(input.CountryCodes),
		RegionIDs:    cloneStrings(input.RegionIDs),
		Coordinates:  append([]GeoEventCoordinate(nil), input.Coordinates...),
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

func (s *EventsStore) List(limit int) ([]GeoEventRecord, error) {
	if s == nil {
		return nil, fmt.Errorf("events store unavailable")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	store, err := s.readLocked()
	if err != nil {
		return nil, err
	}
	items := append([]GeoEventRecord(nil), store.Events...)
	if limit > 0 && len(items) > limit {
		items = items[:limit]
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
