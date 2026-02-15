package fred

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetTicker_ReturnsLatestObservation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/series/observations" {
			t.Fatalf("expected /series/observations, got %s", r.URL.Path)
		}
		_, _ = w.Write([]byte(`{"observations":[{"date":"2026-02-14","value":"3.2"}]}`))
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL: server.URL,
		APIKey:  "token",
	})

	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "CPIAUCSL", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 3.2 {
		t.Fatalf("expected last 3.2, got %f", ticker.Last)
	}
	if ticker.Currency != "CPIAUCSL" {
		t.Fatalf("expected currency CPIAUCSL, got %s", ticker.Currency)
	}
}

func TestGetTicker_RejectsMissingKey(t *testing.T) {
	client := NewClient(Config{})
	_, err := client.GetTicker(context.Background(), gct.Pair{Base: "CPIAUCSL", Quote: "USD"}, "macro")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	requestErr, ok := err.(*gct.RequestError)
	if !ok {
		t.Fatalf("expected *gct.RequestError, got %T", err)
	}
	if requestErr.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", requestErr.StatusCode)
	}
}

func TestGetSeries_ReturnsObservations(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/series/observations" {
			t.Fatalf("expected /series/observations, got %s", r.URL.Path)
		}
		_, _ = w.Write([]byte(`{"observations":[{"date":"2026-02-14","value":"3.2"},{"date":"2026-02-13","value":"3.1"}]}`))
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL: server.URL,
		APIKey:  "token",
	})

	series, err := client.GetSeries(context.Background(), gct.Pair{Base: "CPIAUCSL", Quote: "USD"}, "macro", 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(series) != 2 {
		t.Fatalf("expected 2 observations, got %d", len(series))
	}
	if series[0].Value != 3.2 {
		t.Fatalf("expected first value 3.2, got %f", series[0].Value)
	}
}
