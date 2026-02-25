package bcra

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetSeries_ParsesBCRAPayloadLatestFirst(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"status":200,"results":[{"idVariable":160,"detalle":[{"fecha":"2026-02-23","valor":29.0},{"fecha":"2026-02-20","valor":29.0}]}]}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	points, err := client.GetSeries(context.Background(), gct.Pair{Base: "BCRA_160", Quote: "USD"}, "macro", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 2 {
		t.Fatalf("expected 2 points, got %d", len(points))
	}
	if points[0].Value != 29.0 {
		t.Fatalf("unexpected latest value %f", points[0].Value)
	}
	if points[0].Timestamp < points[1].Timestamp {
		t.Fatalf("expected latest-first order")
	}
}

func TestGetSeries_RejectsInvalidSeriesID(t *testing.T) {
	client := NewClient(Config{BaseURL: "https://example.invalid"})
	_, err := client.GetSeries(context.Background(), gct.Pair{Base: "BCRA_BAD", Quote: "USD"}, "macro", 1)
	if err == nil {
		t.Fatal("expected error")
	}
	if status, ok := gct.StatusCode(err); !ok || status != http.StatusBadRequest {
		t.Fatalf("expected bad request request-error, got %v", err)
	}
}

func TestGetTicker_UsesPrefixedCurrency(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"status":200,"results":[{"idVariable":160,"detalle":[{"fecha":"2026-02-23","valor":29.0}]}]}`))
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "160", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Currency != "BCRA_160" {
		t.Fatalf("unexpected currency %q", ticker.Currency)
	}
}

func TestNormalizeSeriesID(t *testing.T) {
	tests := []struct {
		in   string
		ok   bool
		want int
	}{
		{"BCRA_160", true, 160},
		{"160", true, 160},
		{"0", false, 0},
		{"bad", false, 0},
	}
	for _, tc := range tests {
		got, ok := normalizeSeriesID(tc.in)
		if ok != tc.ok || got != tc.want {
			t.Fatalf("normalizeSeriesID(%q) = (%d,%v), want (%d,%v)", tc.in, got, ok, tc.want, tc.ok)
		}
	}
}
