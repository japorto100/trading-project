package geopolitical

import (
	"path/filepath"
	"testing"
)

func TestContradictionsStore_CreateListUpdateAndTimeline(t *testing.T) {
	dir := t.TempDir()
	contradictions := NewContradictionsStore(filepath.Join(dir, "contradictions.json"))
	timeline := NewTimelineStore(filepath.Join(dir, "timeline.json"))

	created, err := contradictions.Create(CreateContradictionInput{
		Title:        "Conflicting sanctions reports",
		SeverityHint: 4,
		RegionID:     "europe",
		CountryCode:  "de",
		StatementA:   "Source A reports expansion",
		StatementB:   "Source B reports no change",
		CreatedBy:    "analyst",
	})
	if err != nil {
		t.Fatalf("create contradiction: %v", err)
	}
	if created.State != "open" || created.CountryCode != "DE" {
		t.Fatalf("unexpected created contradiction: %+v", created)
	}

	items, err := contradictions.List(ContradictionListFilters{State: "open", RegionID: "europe"})
	if err != nil {
		t.Fatalf("list contradictions: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 contradiction, got %d", len(items))
	}

	summary := "Need additional official source confirmation"
	before, updated, err := contradictions.Update(created.ID, "resolved", "analyst", PatchContradictionInput{
		Summary: &summary,
		Resolution: &PatchResolutionInput{
			Outcome: "defer_monitoring",
			Note:    "Awaiting formal bulletin",
		},
		AddEvidence: []AddEvidenceInput{{
			Kind:  "note",
			Label: "Analyst review",
			Note:  "Sources disagree on scope",
		}},
	})
	if err != nil {
		t.Fatalf("update contradiction: %v", err)
	}
	if before == nil || updated == nil {
		t.Fatalf("expected before/after contradictions")
	}
	if updated.State != "resolved" || updated.Resolution == nil || len(updated.Evidence) != 1 {
		t.Fatalf("unexpected updated contradiction: %+v", updated)
	}

	if _, err := timeline.Append(GeoTimelineEntry{
		EventID:     "contradiction:" + created.ID,
		Action:      "contradiction_resolved",
		Actor:       "analyst",
		DiffSummary: "resolved",
	}); err != nil {
		t.Fatalf("append timeline entry: %v", err)
	}
	timelineItems, err := timeline.List("contradiction:"+created.ID, 10)
	if err != nil {
		t.Fatalf("list timeline: %v", err)
	}
	if len(timelineItems) != 1 {
		t.Fatalf("expected 1 timeline item, got %d", len(timelineItems))
	}
}

func TestContradictionsAndTimelineStore_ReplaceAll(t *testing.T) {
	dir := t.TempDir()
	contradictions := NewContradictionsStore(filepath.Join(dir, "contradictions.json"))
	timeline := NewTimelineStore(filepath.Join(dir, "timeline.json"))

	if err := contradictions.ReplaceAll([]GeoContradiction{{
		ID:         "gctrd_seed1",
		Title:      "Seed contradiction",
		State:      "open",
		StatementA: "A",
		StatementB: "B",
		CreatedAt:  "2026-02-23T10:00:00Z",
		UpdatedAt:  "2026-02-23T10:00:00Z",
		CreatedBy:  "seed",
		UpdatedBy:  "seed",
	}}); err != nil {
		t.Fatalf("replace contradictions: %v", err)
	}
	items, err := contradictions.List(ContradictionListFilters{})
	if err != nil {
		t.Fatalf("list contradictions after replace: %v", err)
	}
	if len(items) != 1 || items[0].ID != "gctrd_seed1" {
		t.Fatalf("unexpected contradictions after replace: %+v", items)
	}

	if err := timeline.ReplaceAll([]GeoTimelineEntry{{
		ID:          "gt_seed1",
		EventID:     "contradiction:gctrd_seed1",
		Action:      "contradiction_created",
		Actor:       "seed",
		At:          "2026-02-23T10:00:00Z",
		DiffSummary: "seeded",
	}}); err != nil {
		t.Fatalf("replace timeline: %v", err)
	}
	timelineItems, err := timeline.List("", 10)
	if err != nil {
		t.Fatalf("list timeline after replace: %v", err)
	}
	if len(timelineItems) != 1 || timelineItems[0].ID != "gt_seed1" {
		t.Fatalf("unexpected timeline after replace: %+v", timelineItems)
	}
}
