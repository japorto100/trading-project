package lbma

import (
	"bytes"
	"testing"
)

func TestParseGoldCSV(t *testing.T) {
	csv := `date,am,pm
2024-01-15,2025.50,2026.25
2024-01-16,2027.00,2028.00`
	got, err := parseGoldCSV(bytes.NewReader([]byte(csv)))
	if err != nil {
		t.Fatalf("parseGoldCSV: %v", err)
	}
	if len(got) != 3 {
		t.Fatalf("expected 3 rows, got %d", len(got))
	}
	row0, ok := got[0].([]string)
	if !ok || len(row0) != 3 || row0[0] != "date" {
		t.Fatalf("unexpected row 0: %v", got[0])
	}
}

func TestParseGoldCSV_Empty(t *testing.T) {
	got, err := parseGoldCSV(bytes.NewReader([]byte("")))
	if err != nil {
		t.Fatalf("parseGoldCSV: %v", err)
	}
	if len(got) != 0 {
		t.Fatalf("expected 0 rows, got %d", len(got))
	}
}

func TestNewGoldFetcher(t *testing.T) {
	f := NewGoldFetcher(nil)
	if f == nil {
		t.Fatal("expected non-nil fetcher")
	}
}
