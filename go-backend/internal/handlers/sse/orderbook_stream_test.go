package sse

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"tradeviewfusion/go-backend/internal/contracts"
)

type fakeOrderbookStreamClient struct {
	lastTarget contracts.MarketTarget
	snapshots  <-chan contracts.OrderbookSnapshot
	errors     <-chan error
	err        error
}

func (f *fakeOrderbookStreamClient) OpenOrderbookStream(_ context.Context, target contracts.MarketTarget) (<-chan contracts.OrderbookSnapshot, <-chan error, error) {
	f.lastTarget = target
	return f.snapshots, f.errors, f.err
}

func TestOrderbookStreamHandler_EmitsSnapshotEvent(t *testing.T) {
	snapshots := make(chan contracts.OrderbookSnapshot, 1)
	errors := make(chan error, 1)
	snapshots <- contracts.OrderbookSnapshot{
		Exchange:  "Binance",
		AssetType: "spot",
		Pair:      contracts.Pair{Base: "BTC", Quote: "USDT"},
		Bids:      []contracts.OrderbookLevel{{Price: 100, Amount: 1}},
		Asks:      []contracts.OrderbookLevel{{Price: 101, Amount: 2}},
		Timestamp: 1700000000,
	}
	close(snapshots)
	close(errors)

	client := &fakeOrderbookStreamClient{
		snapshots: snapshots,
		errors:    errors,
	}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/stream/orderbook?symbol=btc/usdt&exchange=binance&assetType=spot", nil)
	res := httptest.NewRecorder()

	OrderbookStreamHandler(client).ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if !strings.Contains(res.Body.String(), "event: orderbook") {
		t.Fatalf("expected orderbook event, got %s", res.Body.String())
	}
	if client.lastTarget.Symbol() != "BTC/USDT" {
		t.Fatalf("expected normalized target, got %q", client.lastTarget.Symbol())
	}
}
