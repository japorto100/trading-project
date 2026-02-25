package geopolitical

import (
	"path/filepath"
	"testing"
)

func TestCandidateReviewStore_UpsertAndListFilters(t *testing.T) {
	store := NewCandidateReviewStore(filepath.Join(t.TempDir(), "candidates.json"))

	if err := store.UpsertCandidates([]map[string]any{
		{
			"id":          "c-1",
			"headline":    "Fed hold likely",
			"state":       "open",
			"regionHint":  "north-america",
			"confidence":  0.82,
			"generatedAt": "2026-02-23T10:00:00Z",
		},
		{
			"id":          "c-2",
			"headline":    "ECB rate cut discussion",
			"state":       "snoozed",
			"regionHint":  "europe",
			"confidence":  0.77,
			"generatedAt": "2026-02-23T12:00:00Z",
		},
	}); err != nil {
		t.Fatalf("upsert candidates: %v", err)
	}

	minConfidence := 0.8
	items, err := store.List(CandidateListFilters{
		State:         "open",
		RegionHint:    "north-america",
		MinConfidence: &minConfidence,
		Query:         "fed",
	})
	if err != nil {
		t.Fatalf("list candidates: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(items))
	}
	if got := items[0]["id"]; got != "c-1" {
		t.Fatalf("expected c-1, got %v", got)
	}

	// Upsert should replace existing record.
	if err := store.UpsertCandidate(map[string]any{
		"id":          "c-1",
		"headline":    "Fed hold confirmed",
		"state":       "accepted",
		"regionHint":  "north-america",
		"confidence":  0.95,
		"generatedAt": "2026-02-23T13:00:00Z",
	}); err != nil {
		t.Fatalf("upsert candidate: %v", err)
	}

	items, err = store.List(CandidateListFilters{})
	if err != nil {
		t.Fatalf("list all candidates: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(items))
	}
	if got := items[0]["id"]; got != "c-1" {
		t.Fatalf("expected newest c-1 first after upsert, got %v", got)
	}
	if got := items[0]["state"]; got != "accepted" {
		t.Fatalf("expected updated state accepted, got %v", got)
	}

	reviewNote := "snoozed for confirmation"
	before, after, err := store.UpdateState("c-2", CandidateStateUpdate{
		State:      "snoozed",
		ReviewNote: &reviewNote,
	})
	if err != nil {
		t.Fatalf("update state: %v", err)
	}
	if before == nil || after == nil {
		t.Fatalf("expected before/after candidate snapshots")
	}
	if before["state"] != "snoozed" || after["reviewNote"] != reviewNote {
		t.Fatalf("unexpected state update snapshots before=%v after=%v", before, after)
	}
}
