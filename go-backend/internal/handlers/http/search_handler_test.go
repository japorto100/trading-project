package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	financebridge "tradeviewfusion/go-backend/internal/connectors/financebridge"
)

type fakeSearchClient struct {
	results []financebridge.SearchResult
	err     error
	lastQ   string
}

func (f *fakeSearchClient) Search(_ context.Context, query string) ([]financebridge.SearchResult, error) {
	f.lastQ = query
	return f.results, f.err
}

func TestSearchHandler_ReturnsStableContract(t *testing.T) {
	client := &fakeSearchClient{
		results: []financebridge.SearchResult{
			{Symbol: "AAPL", Name: "Apple Inc.", Type: "stock"},
		},
	}
	handler := SearchHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/search?q=AAPL", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body struct {
		Success bool                         `json:"success"`
		Query   string                       `json:"query"`
		Count   int                          `json:"count"`
		Results []financebridge.SearchResult `json:"results"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success=true")
	}
	if body.Query != "AAPL" {
		t.Fatalf("expected query AAPL, got %s", body.Query)
	}
	if body.Count != 1 || len(body.Results) != 1 {
		t.Fatalf("expected one result, count=%d len=%d", body.Count, len(body.Results))
	}
	if client.lastQ != "AAPL" {
		t.Fatalf("expected forwarded query AAPL, got %s", client.lastQ)
	}
}

func TestSearchHandler_ValidationAndErrors(t *testing.T) {
	t.Run("missing query", func(t *testing.T) {
		handler := SearchHandler(&fakeSearchClient{})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/search?q=", nil)
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", res.Code)
		}
	})

	t.Run("upstream error", func(t *testing.T) {
		handler := SearchHandler(&fakeSearchClient{err: errors.New("boom")})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/search?q=BTC", nil)
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadGateway {
			t.Fatalf("expected status 502, got %d", res.Code)
		}
	})

	t.Run("nil client", func(t *testing.T) {
		handler := SearchHandler(nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/search?q=BTC", nil)
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", res.Code)
		}
	})
}
