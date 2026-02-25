package geopolitical

import (
	"path/filepath"
	"testing"
)

func TestEventsStore_CreateAndAddSource(t *testing.T) {
	store := NewEventsStore(filepath.Join(t.TempDir(), "events.json"))

	event, err := store.Create(CreateGeoEventRecordInput{
		Title:        "Fed policy decision",
		Symbol:       "gavel",
		Category:     "central_banks",
		Status:       "confirmed",
		Severity:     3,
		Confidence:   4,
		CountryCodes: []string{"US"},
		RegionIDs:    []string{"north-america"},
		Coordinates:  []GeoEventCoordinate{{Lat: 39.8, Lng: -98.5}},
		Summary:      "Accepted candidate",
		AnalystNote:  "Accepted candidate gc_1",
		Actor:        "analyst",
	})
	if err != nil {
		t.Fatalf("create event: %v", err)
	}
	if event == nil || event.ID == "" {
		t.Fatalf("expected event with id, got %+v", event)
	}
	if len(event.Sources) != 0 {
		t.Fatalf("expected empty sources initially, got %+v", event.Sources)
	}

	updated, err := store.AddSource(event.ID, map[string]any{
		"provider": "fed",
		"url":      "https://example.test/fed",
	}, "analyst")
	if err != nil {
		t.Fatalf("add source: %v", err)
	}
	if updated == nil || len(updated.Sources) != 1 {
		t.Fatalf("expected one source after add, got %+v", updated)
	}

	items, err := store.List(10)
	if err != nil {
		t.Fatalf("list events: %v", err)
	}
	if len(items) != 1 || items[0].ID != event.ID {
		t.Fatalf("expected list to contain created event, got %+v", items)
	}
}
