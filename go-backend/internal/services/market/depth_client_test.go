package market

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/contracts"
)

type fakeDepthSource struct {
	lastExchange  string
	lastAssetType string
	lastPair      contracts.Pair
	snapshot      contracts.OrderbookSnapshot
	snapshots     <-chan contracts.OrderbookSnapshot
	errors        <-chan error
	err           error
}

func (f *fakeDepthSource) GetOrderbook(_ context.Context, exchange string, pair contracts.Pair, assetType string) (contracts.OrderbookSnapshot, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAssetType = assetType
	return f.snapshot, f.err
}

func (f *fakeDepthSource) OpenOrderbookStream(_ context.Context, exchange string, pair contracts.Pair, assetType string) (<-chan contracts.OrderbookSnapshot, <-chan error, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAssetType = assetType
	return f.snapshots, f.errors, f.err
}

func TestDepthClient_GetOrderbookUsesMarketTarget(t *testing.T) {
	source := &fakeDepthSource{
		snapshot: contracts.OrderbookSnapshot{
			Exchange:  "Binance",
			AssetType: "spot",
			Pair:      contracts.Pair{Base: "BTC", Quote: "USDT"},
		},
	}
	client := NewDepthClient(source)

	target := contracts.MarketTarget{
		Exchange:  "binance",
		AssetType: "spot",
		Pair:      contracts.Pair{Base: "btc", Quote: "usdt"},
	}
	snapshot, err := client.GetOrderbook(context.Background(), target)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if snapshot.Symbol() != "BTC/USDT" {
		t.Fatalf("expected BTC/USDT, got %q", snapshot.Symbol())
	}
	if source.lastExchange != "binance" {
		t.Fatalf("expected normalized exchange to be forwarded, got %q", source.lastExchange)
	}
	if source.lastPair.Base != "BTC" || source.lastPair.Quote != "USDT" {
		t.Fatalf("expected normalized pair, got %+v", source.lastPair)
	}
	if source.lastAssetType != "spot" {
		t.Fatalf("expected spot asset type, got %q", source.lastAssetType)
	}
}

func TestDepthClient_OpenOrderbookStreamUsesMarketTarget(t *testing.T) {
	snapshots := make(chan contracts.OrderbookSnapshot)
	errors := make(chan error)
	source := &fakeDepthSource{
		snapshots: snapshots,
		errors:    errors,
	}
	client := NewDepthClient(source)

	snapshotChannel, errorChannel, err := client.OpenOrderbookStream(context.Background(), contracts.MarketTarget{
		Exchange:  " Kraken ",
		AssetType: " spot ",
		Pair:      contracts.Pair{Base: " btc ", Quote: " usd "},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if snapshotChannel == nil || errorChannel == nil {
		t.Fatal("expected non-nil stream channels")
	}
	if source.lastExchange != "Kraken" {
		t.Fatalf("expected trimmed exchange Kraken, got %q", source.lastExchange)
	}
	if source.lastPair.Base != "BTC" || source.lastPair.Quote != "USD" {
		t.Fatalf("expected normalized pair BTC/USD, got %+v", source.lastPair)
	}
}
