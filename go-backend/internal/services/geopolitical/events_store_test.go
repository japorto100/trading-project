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

func TestEventsStore_FullLifecycle(t *testing.T) {
	store := NewEventsStore(filepath.Join(t.TempDir(), "events.json"))

	created, err := store.Create(CreateGeoEventRecordInput{
		Title:        "Shipping chokepoint stress",
		Symbol:       "anchor",
		Category:     "supply_chains",
		Status:       "confirmed",
		Severity:     4,
		Confidence:   3,
		CountryCodes: []string{"EG"},
		RegionIDs:    []string{"mena"},
		Coordinates:  []GeoEventCoordinate{{Lat: 30.0, Lng: 32.5}},
		Summary:      "Canal disruption risk rising",
		AnalystNote:  "watch tanker routes",
		Actor:        "analyst",
	})
	if err != nil {
		t.Fatalf("create event: %v", err)
	}

	fetched, err := store.Get(created.ID)
	if err != nil {
		t.Fatalf("get event: %v", err)
	}
	if fetched == nil || fetched.Title != created.Title {
		t.Fatalf("expected fetched event, got %+v", fetched)
	}

	note := "confirmed rerouting underway"
	severity := 5
	confidence := 4
	updated, err := store.Update(created.ID, UpdateGeoEventRecordInput{
		Severity:    &severity,
		Confidence:  &confidence,
		AnalystNote: &note,
		Actor:       "lead-analyst",
	})
	if err != nil {
		t.Fatalf("update event: %v", err)
	}
	if updated == nil || updated.Severity != 5 || updated.Confidence != 4 || updated.AnalystNote != note {
		t.Fatalf("expected updated event, got %+v", updated)
	}

	withAsset, err := store.AddAsset(created.ID, map[string]any{
		"symbol":     "XLE",
		"assetClass": "etf",
		"relation":   "beneficiary",
	}, "lead-analyst")
	if err != nil {
		t.Fatalf("add asset: %v", err)
	}
	if withAsset == nil || len(withAsset.Assets) != 1 {
		t.Fatalf("expected one asset, got %+v", withAsset)
	}

	archived, err := store.Archive(created.ID, "lead-analyst")
	if err != nil {
		t.Fatalf("archive event: %v", err)
	}
	if archived == nil || archived.Status != "archived" {
		t.Fatalf("expected archived event, got %+v", archived)
	}

	items, err := store.ListFiltered(GeoEventListFilters{
		Status:      "archived",
		RegionID:    "mena",
		MinSeverity: 5,
		Query:       "shipping",
		Limit:       5,
	})
	if err != nil {
		t.Fatalf("list filtered: %v", err)
	}
	if len(items) != 1 || items[0].ID != created.ID {
		t.Fatalf("expected filtered list to contain archived event, got %+v", items)
	}

	deleted, err := store.Delete(created.ID)
	if err != nil {
		t.Fatalf("delete event: %v", err)
	}
	if !deleted {
		t.Fatalf("expected delete to succeed")
	}

	afterDelete, err := store.Get(created.ID)
	if err != nil {
		t.Fatalf("get after delete: %v", err)
	}
	if afterDelete != nil {
		t.Fatalf("expected deleted event to be gone, got %+v", afterDelete)
	}
}
