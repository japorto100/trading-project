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

type fakeFinnhubTickerClient struct {
	lastPair  gct.Pair
	lastAsset string
	ticker    gct.Ticker
}

func (f *fakeFinnhubTickerClient) GetTicker(_ context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	f.lastPair = pair
	f.lastAsset = assetType
	return f.ticker, nil
}

type fakeFredTickerClient struct {
	lastPair  gct.Pair
	lastAsset string
	ticker    gct.Ticker
}

func (f *fakeFredTickerClient) GetTicker(_ context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	f.lastPair = pair
	f.lastAsset = assetType
	return f.ticker, nil
}

func TestQuoteClient_RoutesECBToForexClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	forex := &fakeForexTickerClient{ticker: gct.Ticker{Last: 1.1}}
	client := NewQuoteClient(crypto, nil, nil, forex)

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
	client := NewQuoteClient(crypto, nil, nil, forex)

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

func TestQuoteClient_RoutesFinnhubToStockClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{ticker: gct.Ticker{Last: 205.12}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, nil, forex)

	ticker, err := client.GetTicker(context.Background(), "FINNHUB", gct.Pair{Base: "AAPL", Quote: "USD"}, "equity")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 205.12 {
		t.Fatalf("expected ticker from stock client, got %f", ticker.Last)
	}
	if stock.lastPair.Base != "AAPL" || stock.lastAsset != "equity" {
		t.Fatalf("unexpected stock call pair=%s/%s asset=%s", stock.lastPair.Base, stock.lastPair.Quote, stock.lastAsset)
	}
	if crypto.lastExchange != "" {
		t.Fatalf("expected crypto client not called, got exchange %s", crypto.lastExchange)
	}
}

func TestQuoteClient_RoutesFredToMacroClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 3.2}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	ticker, err := client.GetTicker(context.Background(), "FRED", gct.Pair{Base: "CPIAUCSL", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 3.2 {
		t.Fatalf("expected ticker from macro client, got %f", ticker.Last)
	}
	if macro.lastPair.Base != "CPIAUCSL" || macro.lastAsset != "macro" {
		t.Fatalf("unexpected macro call pair=%s/%s asset=%s", macro.lastPair.Base, macro.lastPair.Quote, macro.lastAsset)
	}
	if crypto.lastExchange != "" {
		t.Fatalf("expected crypto client not called, got exchange %s", crypto.lastExchange)
	}
}

func TestQuoteClient_RoutesBojWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 0.1}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BOJ", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base != DefaultBojPolicySeries {
		t.Fatalf("expected BOJ alias to %s, got %s", DefaultBojPolicySeries, macro.lastPair.Base)
	}
}
