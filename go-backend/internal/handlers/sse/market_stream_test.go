package sse

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestResolveStreamParams_Defaults(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/stream/market", nil)

	params, err := resolveStreamParams(request)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if params.Exchange != "binance" || params.GCTExchange != "Binance" {
		t.Fatalf("unexpected exchange mapping: %+v", params)
	}
	if params.AssetType != "spot" {
		t.Fatalf("expected spot asset type, got %s", params.AssetType)
	}
	if params.Pair.Base != "BTC" || params.Pair.Quote != "USDT" {
		t.Fatalf("expected BTC/USDT pair, got %s/%s", params.Pair.Base, params.Pair.Quote)
	}
}

func TestResolveStreamParams_RejectsInvalidExchange(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/stream/market?exchange=badex", nil)

	_, err := resolveStreamParams(request)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestResolveStreamParams_RejectsInvalidSymbol(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/stream/market?symbol=BTCUSDT", nil)

	_, err := resolveStreamParams(request)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
