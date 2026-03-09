package http

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/contracts"
)

type fakeOrderbookClient struct {
	lastTarget contracts.MarketTarget
	snapshot   contracts.OrderbookSnapshot
	err        error
}

func (f *fakeOrderbookClient) GetOrderbook(_ context.Context, target contracts.MarketTarget) (contracts.OrderbookSnapshot, error) {
	f.lastTarget = target
	return f.snapshot, f.err
}

func TestOrderbookHandler_ValidatesAndReturnsContract(t *testing.T) {
	client := &fakeOrderbookClient{
		snapshot: contracts.OrderbookSnapshot{
			Exchange:  "binance",
			AssetType: "spot",
			Pair:      contracts.Pair{Base: "BTC", Quote: "USDT"},
			Bids:      []contracts.OrderbookLevel{{Price: 100, Amount: 1}},
			Asks:      []contracts.OrderbookLevel{{Price: 101, Amount: 2}},
			Timestamp: 1700000000,
			Source:    "gct",
		},
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/orderbook?symbol=btc/usdt&exchange=binance&assetType=spot", nil)
	res := httptest.NewRecorder()

	OrderbookHandler(client).ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body contracts.APIResponse[*contracts.OrderbookSnapshot]
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success || body.Data == nil {
		t.Fatalf("expected success response, got %+v", body)
	}
	if body.Data.Symbol() != "BTC/USDT" {
		t.Fatalf("expected BTC/USDT, got %q", body.Data.Symbol())
	}
	if client.lastTarget.Symbol() != "BTC/USDT" {
		t.Fatalf("expected normalized target symbol, got %q", client.lastTarget.Symbol())
	}
}

func TestOrderbookHandler_RejectsInvalidParams(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/orderbook?exchange=badex", nil)
	res := httptest.NewRecorder()

	OrderbookHandler(&fakeOrderbookClient{}).ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}
