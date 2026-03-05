package eu

import (
	"bytes"
	"testing"
)

func TestParseEUSanctionsJSON_Array(t *testing.T) {
	json := `[{"id": "eu1", "name": "Entity EU"}, {"id": "eu2"}]`
	got, err := parseEUSanctionsJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseEUSanctionsJSON: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 records, got %d", len(got))
	}
	if got[0]["id"] != "eu1" || got[0]["name"] != "Entity EU" {
		t.Fatalf("unexpected record 0: %v", got[0])
	}
}

func TestParseEUSanctionsJSON_ObjectWithResults(t *testing.T) {
	json := `{"results":[{"id":"r1","name":"Entity R"}]}`
	got, err := parseEUSanctionsJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseEUSanctionsJSON: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 record, got %d", len(got))
	}
}

func TestParseEUSanctionsJSON_EmptyArray(t *testing.T) {
	json := `[]`
	got, err := parseEUSanctionsJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseEUSanctionsJSON: %v", err)
	}
	if len(got) != 0 {
		t.Fatalf("expected 0 records, got %d", len(got))
	}
}

func TestParseEUSanctionsJSON_Invalid(t *testing.T) {
	_, err := parseEUSanctionsJSON(bytes.NewReader([]byte("not json")))
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
