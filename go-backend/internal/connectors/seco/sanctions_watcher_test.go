package seco

import (
	"bytes"
	"testing"
)

func TestParseSECOSanctionsJSON_Array(t *testing.T) {
	json := `["invalid", {"id": "s1", "name": "Entity A"}, {"id": "s2", "name": "Entity B"}]`
	got, err := parseSECOSanctionsJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSECOSanctionsJSON: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 records (non-map items skipped), got %d", len(got))
	}
	if got[0]["id"] != "s1" || got[0]["name"] != "Entity A" {
		t.Fatalf("unexpected record 0: %v", got[0])
	}
}

func TestParseSECOSanctionsJSON_ObjectWithResults(t *testing.T) {
	json := `{"results":[{"id":"r1","name":"Entity R"}]}`
	got, err := parseSECOSanctionsJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSECOSanctionsJSON: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 record, got %d", len(got))
	}
	if got[0]["id"] != "r1" {
		t.Fatalf("unexpected record: %v", got[0])
	}
}

func TestParseSECOSanctionsJSON_ObjectWithEntities(t *testing.T) {
	json := `{"entities":[{"id":"e1"}]}`
	got, err := parseSECOSanctionsJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSECOSanctionsJSON: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 record, got %d", len(got))
	}
}

func TestParseSECOSanctionsJSON_EmptyArray(t *testing.T) {
	json := `[]`
	got, err := parseSECOSanctionsJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSECOSanctionsJSON: %v", err)
	}
	if len(got) != 0 {
		t.Fatalf("expected 0 records, got %d", len(got))
	}
}

func TestParseSECOSanctionsJSON_Invalid(t *testing.T) {
	_, err := parseSECOSanctionsJSON(bytes.NewReader([]byte("not json")))
	if err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}

func TestNewSanctionsWatcher(t *testing.T) {
	w := NewSanctionsWatcher("", nil)
	if w == nil {
		t.Fatal("expected non-nil watcher")
	}
}
