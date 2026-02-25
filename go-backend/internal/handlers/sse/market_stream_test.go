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

	if params.Exchange != "binance" || params.UpstreamExchange != "Binance" {
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

func TestResolveStreamParams_AcceptsFinnhubInstrument(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/stream/market?symbol=AAPL&exchange=finnhub&assetType=equity", nil)

	params, err := resolveStreamParams(request)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if params.Exchange != "finnhub" || params.UpstreamExchange != "FINNHUB" {
		t.Fatalf("unexpected exchange mapping: %+v", params)
	}
	if params.Source != "finnhub" {
		t.Fatalf("expected source finnhub, got %s", params.Source)
	}
	if params.Symbol != "AAPL" {
		t.Fatalf("expected normalized symbol AAPL, got %s", params.Symbol)
	}
	if params.Pair.Base != "AAPL" || params.Pair.Quote != "USD" {
		t.Fatalf("expected pair AAPL/USD, got %s/%s", params.Pair.Base, params.Pair.Quote)
	}
}

func TestResolveStreamParams_RejectsUnsupportedFinnhubAssetType(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/api/v1/stream/market?symbol=AAPL&exchange=finnhub&assetType=spot", nil)

	_, err := resolveStreamParams(request)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestResolveStreamParams_AcceptsTimeframeAndAlertRules(t *testing.T) {
	request := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/stream/market?symbol=BTC/USDT&timeframe=1m&alertRules="+
			`%5B%7B%22id%22%3A%22a1%22%2C%22symbol%22%3A%22BTC%2FUSDT%22%2C%22condition%22%3A%22above%22%2C%22target%22%3A100%2C%22enabled%22%3Atrue%7D%5D`,
		nil,
	)

	params, err := resolveStreamParams(request)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if params.Timeframe != "1m" {
		t.Fatalf("expected timeframe 1m, got %s", params.Timeframe)
	}
	if len(params.AlertRules) != 1 {
		t.Fatalf("expected 1 alert rule, got %d", len(params.AlertRules))
	}
	if params.AlertRules[0].ID != "a1" || string(params.AlertRules[0].Condition) != "above" {
		t.Fatalf("unexpected alert rule: %+v", params.AlertRules[0])
	}
}

func TestResolveStreamParams_RejectsInvalidAlertRules(t *testing.T) {
	request := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/stream/market?alertRules=%7Bbad-json",
		nil,
	)
	_, err := resolveStreamParams(request)
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}
