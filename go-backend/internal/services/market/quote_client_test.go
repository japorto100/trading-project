package market

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type fakeCryptoTickerClient struct {
	lastExchange string
	lastPair     gct.Pair
	lastAsset    string
	ticker       gct.Ticker
}

func (f *fakeCryptoTickerClient) GetTicker(_ context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAsset = assetType
	return f.ticker, nil
}

type fakeForexTickerClient struct {
	lastPair gct.Pair
	ticker   gct.Ticker
}

func (f *fakeForexTickerClient) GetTicker(_ context.Context, pair gct.Pair) (gct.Ticker, error) {
	f.lastPair = pair
	return f.ticker, nil
}

func TestQuoteClient_RoutesECBToForexClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	forex := &fakeForexTickerClient{ticker: gct.Ticker{Last: 1.1}}
	client := NewQuoteClient(crypto, forex)

	ticker, err := client.GetTicker(context.Background(), "ECB", gct.Pair{Base: "EUR", Quote: "USD"}, "forex")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 1.1 {
		t.Fatalf("expected ticker from forex client, got %f", ticker.Last)
	}
	if forex.lastPair.Base != "EUR" || forex.lastPair.Quote != "USD" {
		t.Fatalf("unexpected forex pair %s/%s", forex.lastPair.Base, forex.lastPair.Quote)
	}
	if crypto.lastExchange != "" {
		t.Fatalf("expected crypto client not called, got exchange %s", crypto.lastExchange)
	}
}

func TestQuoteClient_RoutesNonECBToCryptoClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{ticker: gct.Ticker{Last: 42000}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, forex)

	ticker, err := client.GetTicker(context.Background(), "Binance", gct.Pair{Base: "BTC", Quote: "USDT"}, "spot")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 42000 {
		t.Fatalf("expected ticker from crypto client, got %f", ticker.Last)
	}
	if crypto.lastExchange != "Binance" || crypto.lastAsset != "spot" {
		t.Fatalf("unexpected crypto call exchange=%s asset=%s", crypto.lastExchange, crypto.lastAsset)
	}
}
