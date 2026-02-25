package financebridge

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/requestctx"
)

func TestClientGetQuote_ParsesPayloadAndForwardsRequestID(t *testing.T) {
	var gotPath string
	var gotSymbol string
	var gotRequestID string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotSymbol = r.URL.Query().Get("symbol")
		gotRequestID = r.Header.Get("X-Request-ID")
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": map[string]any{
				"symbol":        "SPY",
				"price":         501.25,
				"change":        2.5,
				"changePercent": 0.5,
				"high":          502.0,
				"low":           498.0,
				"open":          499.0,
				"volume":        123456,
				"timestamp":     1700000000,
			},
		})
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	ctx := requestctx.WithRequestID(context.Background(), "req-123")
	quote, err := client.GetQuote(ctx, "SPY")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if gotPath != "/quote" {
		t.Fatalf("expected /quote path, got %s", gotPath)
	}
	if gotSymbol != "SPY" {
		t.Fatalf("expected symbol SPY, got %s", gotSymbol)
	}
	if gotRequestID != "req-123" {
		t.Fatalf("expected X-Request-ID req-123, got %q", gotRequestID)
	}
	if quote.Symbol != "SPY" || quote.Price != 501.25 {
		t.Fatalf("unexpected quote: %+v", quote)
	}
}

func TestClientGetOHLCV_ParsesRows(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/ohlcv" {
			t.Fatalf("expected /ohlcv path, got %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": []map[string]any{
				{"time": 1, "open": 10, "high": 12, "low": 9, "close": 11, "volume": 100},
				{"time": 2, "open": 11, "high": 13, "low": 10, "close": 12, "volume": 200},
			},
		})
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	rows, err := client.GetOHLCV(context.Background(), OHLCVRequest{
		Symbol:    "AAPL",
		Timeframe: "1D",
		Limit:     2,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(rows) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(rows))
	}
	if rows[1].Close != 12 {
		t.Fatalf("expected second close=12, got %f", rows[1].Close)
	}
}

func TestClientGetOHLCV_FailsOverAcrossBaseURLs(t *testing.T) {
	primary := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/ohlcv" {
			t.Fatalf("expected /ohlcv path, got %s", r.URL.Path)
		}
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer primary.Close()

	secondary := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": []map[string]any{
				{"time": 1, "open": 10, "high": 11, "low": 9, "close": 10.5, "volume": 50},
			},
		})
	}))
	defer secondary.Close()

	client := NewClient(Config{
		BaseURLs: []string{primary.URL, secondary.URL},
	})
	rows, err := client.GetOHLCV(context.Background(), OHLCVRequest{Symbol: "AAPL", Timeframe: "1D", Limit: 1})
	if err != nil {
		t.Fatalf("expected failover success, got %v", err)
	}
	if len(rows) != 1 || rows[0].Close != 10.5 {
		t.Fatalf("unexpected rows: %+v", rows)
	}
}

func TestClientSearch_ParsesResults(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/search" {
			t.Fatalf("expected /search path, got %s", r.URL.Path)
		}
		if q := r.URL.Query().Get("q"); q != "AAP" {
			t.Fatalf("expected q=AAP, got %s", q)
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": []map[string]any{
				{"symbol": "AAPL", "name": "Apple Inc.", "type": "stock"},
			},
		})
	}))
	defer server.Close()

	client := NewClient(Config{BaseURL: server.URL})
	results, err := client.Search(context.Background(), "AAP")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(results) != 1 || results[0].Symbol != "AAPL" {
		t.Fatalf("unexpected results: %+v", results)
	}
}
