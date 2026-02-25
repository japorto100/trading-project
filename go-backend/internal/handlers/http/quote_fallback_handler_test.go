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

type fakeFinanceBridgeQuoteClient struct {
	quote      financebridge.Quote
	err        error
	lastSymbol string
}

func (f *fakeFinanceBridgeQuoteClient) GetQuote(_ context.Context, symbol string) (financebridge.Quote, error) {
	f.lastSymbol = symbol
	return f.quote, f.err
}

func TestFinanceBridgeQuoteFallbackHandler_ReturnsQuoteContract(t *testing.T) {
	client := &fakeFinanceBridgeQuoteClient{
		quote: financebridge.Quote{
			Symbol:        "SPY",
			Price:         500.12,
			Change:        1.2,
			ChangePercent: 0.24,
			High:          501.0,
			Low:           498.0,
			Open:          499.0,
			Volume:        1000,
			Timestamp:     1700000000,
		},
	}
	handler := FinanceBridgeQuoteFallbackHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/quote/fallback?symbol=SPY&assetType=etf", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body struct {
		Success bool `json:"success"`
		Data    struct {
			Symbol    string  `json:"symbol"`
			Exchange  string  `json:"exchange"`
			AssetType string  `json:"assetType"`
			Last      float64 `json:"last"`
			Open      float64 `json:"open"`
			Source    string  `json:"source"`
		} `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success=true")
	}
	if body.Data.Exchange != "finance-bridge" || body.Data.Source != "finance-bridge" {
		t.Fatalf("unexpected exchange/source: %+v", body.Data)
	}
	if body.Data.AssetType != "etf" {
		t.Fatalf("expected assetType etf, got %s", body.Data.AssetType)
	}
	if client.lastSymbol != "SPY" {
		t.Fatalf("expected symbol SPY forwarded, got %s", client.lastSymbol)
	}
}

func TestFinanceBridgeQuoteFallbackHandler_ValidatesAndMapsErrors(t *testing.T) {
	t.Run("missing symbol", func(t *testing.T) {
		handler := FinanceBridgeQuoteFallbackHandler(&fakeFinanceBridgeQuoteClient{})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote/fallback", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadRequest {
			t.Fatalf("expected status 400, got %d", res.Code)
		}
	})

	t.Run("upstream error", func(t *testing.T) {
		handler := FinanceBridgeQuoteFallbackHandler(&fakeFinanceBridgeQuoteClient{err: errors.New("boom")})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote/fallback?symbol=GLD", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadGateway {
			t.Fatalf("expected status 502, got %d", res.Code)
		}
	})

	t.Run("nil client", func(t *testing.T) {
		handler := FinanceBridgeQuoteFallbackHandler(nil)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/quote/fallback?symbol=GLD", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", res.Code)
		}
	})
}
