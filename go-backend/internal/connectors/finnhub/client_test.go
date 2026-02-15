package finnhub

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetTicker_ReturnsQuoteForEquity(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/quote" {
			t.Fatalf("expected /quote path, got %s", r.URL.Path)
		}
		if r.URL.Query().Get("symbol") != "AAPL" {
			t.Fatalf("expected symbol AAPL, got %s", r.URL.Query().Get("symbol"))
		}
		_, _ = w.Write([]byte(`{"c":205.12,"h":207.5,"l":203.9,"t":1771200000}`))
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL: server.URL,
		APIKey:  "token",
	})

	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "AAPL", Quote: "USD"}, "equity")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 205.12 {
		t.Fatalf("expected last 205.12, got %f", ticker.Last)
	}
	if ticker.Currency != "AAPL" {
		t.Fatalf("expected currency AAPL, got %s", ticker.Currency)
	}
}

func TestGetTicker_RejectsMissingKey(t *testing.T) {
	client := NewClient(Config{})
	_, err := client.GetTicker(context.Background(), gct.Pair{Base: "AAPL", Quote: "USD"}, "equity")
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

func TestGetTicker_RejectsUnsupportedAssetType(t *testing.T) {
	client := NewClient(Config{
		APIKey: "token",
	})
	_, err := client.GetTicker(context.Background(), gct.Pair{Base: "AAPL", Quote: "USD"}, "spot")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	requestErr, ok := err.(*gct.RequestError)
	if !ok {
		t.Fatalf("expected *gct.RequestError, got %T", err)
	}
	if requestErr.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", requestErr.StatusCode)
	}
}
