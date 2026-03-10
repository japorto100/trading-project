package cftc

import (
	"bytes"
	"net/http"
	"testing"
	"time"
)

func TestParseCOTCSV(t *testing.T) {
	csv := "market,position\nEURO FX,123\nUS TREASURY,456\n"
	items, err := parseCOTCSV(bytes.NewReader([]byte(csv)))
	if err != nil {
		t.Fatalf("parseCOTCSV: %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("expected 3 rows including header, got %d", len(items))
	}
	firstRow, ok := items[1].([]string)
	if !ok {
		t.Fatalf("expected []string row, got %T", items[1])
	}
	if firstRow[0] != "EURO FX" || firstRow[1] != "123" {
		t.Fatalf("unexpected first data row: %v", firstRow)
	}
}

func TestNewCOTFetcher(t *testing.T) {
	fetcher := NewCOTFetcher(&http.Client{Timeout: 2 * time.Second})
	if fetcher == nil {
		t.Fatal("expected non-nil fetcher")
	}
}
