package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

type fakeNewsClient struct {
	items       []marketServices.Headline
	err         error
	lastSymbol  string
	lastQuery   string
	lastLang    string
	lastMaxSize int
}

func (f *fakeNewsClient) Headlines(_ context.Context, symbol string, query string, lang string, limit int) ([]marketServices.Headline, error) {
	f.lastSymbol = symbol
	f.lastQuery = query
	f.lastLang = lang
	f.lastMaxSize = limit
	return f.items, f.err
}

func TestNewsHandler_ReturnsStableContract(t *testing.T) {
	client := &fakeNewsClient{
		items: []marketServices.Headline{
			{
				Title:       "Apple beats estimates",
				URL:         "https://example.com/a",
				Source:      "rss",
				PublishedAt: time.Date(2026, 2, 15, 9, 0, 0, 0, time.UTC),
				Summary:     "Test summary",
			},
		},
	}
	handler := NewsHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/news/headlines?symbol=AAPL&limit=5", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body struct {
		Success bool `json:"success"`
		Data    struct {
			Symbol string `json:"symbol"`
			Items  []struct {
				Title string `json:"title"`
				URL   string `json:"url"`
			} `json:"items"`
		} `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success=true")
	}
	if body.Data.Symbol != "AAPL" {
		t.Fatalf("expected symbol AAPL, got %s", body.Data.Symbol)
	}
	if len(body.Data.Items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(body.Data.Items))
	}
	if client.lastMaxSize != 5 {
		t.Fatalf("expected limit 5, got %d", client.lastMaxSize)
	}
}

func TestNewsHandler_RejectsInvalidLimit(t *testing.T) {
	handler := NewsHandler(&fakeNewsClient{})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/news/headlines?limit=-2", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}

func TestNewsHandler_ForwardsQueryParam(t *testing.T) {
	client := &fakeNewsClient{}
	handler := NewsHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/news/headlines?q=geopolitics&limit=7", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if client.lastSymbol != "" {
		t.Fatalf("expected empty symbol, got %q", client.lastSymbol)
	}
	if client.lastQuery != "geopolitics" {
		t.Fatalf("expected query geopolitics, got %q", client.lastQuery)
	}
	if client.lastLang != "" {
		t.Fatalf("expected empty lang, got %q", client.lastLang)
	}
	if client.lastMaxSize != 7 {
		t.Fatalf("expected limit 7, got %d", client.lastMaxSize)
	}
}

func TestNewsHandler_ForwardsLangParam(t *testing.T) {
	client := &fakeNewsClient{}
	handler := NewsHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/news/headlines?q=markets&lang=de&limit=4", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if client.lastLang != "de" {
		t.Fatalf("expected lang de, got %q", client.lastLang)
	}
}
