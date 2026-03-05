package fxcm

import (
	"bytes"
	"testing"
)

func TestParseSentimentJSON_Array(t *testing.T) {
	json := `[{"symbol":"EUR/USD","long":65,"short":35},{"symbol":"GBP/USD","long":60,"short":40}]`
	got, err := parseSentimentJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSentimentJSON: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 items, got %d", len(got))
	}
}

func TestParseSentimentJSON_ObjectWithData(t *testing.T) {
	json := `{"data":[{"symbol":"EUR/USD","long":65}]}`
	got, err := parseSentimentJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSentimentJSON: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 item, got %d", len(got))
	}
}

func TestParseSentimentJSON_ObjectWithItems(t *testing.T) {
	json := `{"items":[{"symbol":"X"}]}`
	got, err := parseSentimentJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSentimentJSON: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 item, got %d", len(got))
	}
}

func TestParseSentimentJSON_SingleObject(t *testing.T) {
	json := `{"symbol":"EUR/USD","long":65}`
	got, err := parseSentimentJSON(bytes.NewReader([]byte(json)))
	if err != nil {
		t.Fatalf("parseSentimentJSON: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("expected 1 item (wrapped), got %d", len(got))
	}
}

func TestParseSentimentJSON_Invalid(t *testing.T) {
	_, err := parseSentimentJSON(bytes.NewReader([]byte("not json")))
	if err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}

func TestNewSentimentFetcher(t *testing.T) {
	f := NewSentimentFetcher(nil)
	if f == nil {
		t.Fatal("expected non-nil fetcher")
	}
}
