package gct

import (
	"testing"

	"tradeviewfusion/go-backend/internal/contracts"

	gctrpc "github.com/thrasher-corp/gocryptotrader/gctrpc"
)

func TestFromGRPCOrderbook(t *testing.T) {
	response := &gctrpc.OrderbookResponse{
		CurrencyPair: "BTC/USDT",
		AssetType:    "spot",
		LastUpdated:  1700000000,
		Bids: []*gctrpc.OrderbookItem{
			{Price: 100, Amount: 1.25},
			{Price: 99, Amount: 0.5},
		},
		Asks: []*gctrpc.OrderbookItem{
			{Price: 101, Amount: 2.5},
		},
	}

	got := fromGRPCOrderbook("Binance", response)
	if got.Exchange != "Binance" {
		t.Fatalf("expected exchange Binance, got %q", got.Exchange)
	}
	if got.Symbol() != "BTC/USDT" {
		t.Fatalf("expected BTC/USDT symbol, got %q", got.Symbol())
	}
	if got.AssetType != "spot" {
		t.Fatalf("expected spot asset type, got %q", got.AssetType)
	}
	if got.Timestamp != 1700000000 {
		t.Fatalf("expected timestamp 1700000000, got %d", got.Timestamp)
	}
	if len(got.Bids) != 2 || len(got.Asks) != 1 {
		t.Fatalf("unexpected book depth: %+v", got)
	}
	if got.Bids[0] != (contracts.OrderbookLevel{Price: 100, Amount: 1.25}) {
		t.Fatalf("unexpected first bid: %+v", got.Bids[0])
	}
}
