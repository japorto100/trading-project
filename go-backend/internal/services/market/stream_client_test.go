package market

import (
	"context"
	"errors"
	"testing"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/contracts"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type fakeQuoteRouter struct {
	ticker       gct.Ticker
	err          error
	lastExchange string
	lastAsset    asset.Item
	lastPair     gct.Pair
}

func (f *fakeQuoteRouter) GetTicker(_ context.Context, exchange string, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAsset = assetType
	if f.err != nil {
		return gct.Ticker{}, f.err
	}
	return f.ticker, nil
}

type fakeCryptoStreamClient struct {
	tickerChannel <-chan gct.Ticker
	errorChannel  <-chan error
	err           error
	lastExchange  string
	lastAsset     asset.Item
	lastPair      gct.Pair
}

func (f *fakeCryptoStreamClient) OpenTickerStream(_ context.Context, exchange string, pair currency.Pair, assetType asset.Item) (<-chan gct.Ticker, <-chan error, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAsset = assetType
	return f.tickerChannel, f.errorChannel, f.err
}

type fakeStockStreamClient struct {
	tickerChannel <-chan gct.Ticker
	errorChannel  <-chan error
	err           error
	lastSymbol    string
}

func (f *fakeStockStreamClient) OpenTradeStream(_ context.Context, symbol string) (<-chan gct.Ticker, <-chan error, error) {
	f.lastSymbol = symbol
	return f.tickerChannel, f.errorChannel, f.err
}

func TestStreamClient_UsesQuoteRouterForTicker(t *testing.T) {
	quoteRouter := &fakeQuoteRouter{
		ticker: gct.Ticker{Last: 123.45},
	}
	client := NewStreamClient(quoteRouter, &fakeCryptoStreamClient{}, &fakeStockStreamClient{})

	ticker, err := client.GetTicker(context.Background(), "FINNHUB", currency.NewPair(currency.NewCode("AAPL"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 123.45 {
		t.Fatalf("expected last 123.45, got %f", ticker.Last)
	}
	if quoteRouter.lastExchange != "FINNHUB" {
		t.Fatalf("expected FINNHUB exchange, got %s", quoteRouter.lastExchange)
	}
}

func TestStreamClient_RoutesFinnhubStreamToStockClient(t *testing.T) {
	tickers := make(chan gct.Ticker)
	errors := make(chan error)
	stockStream := &fakeStockStreamClient{
		tickerChannel: tickers,
		errorChannel:  errors,
	}
	client := NewStreamClient(&fakeQuoteRouter{}, &fakeCryptoStreamClient{}, stockStream)

	tickerChannel, errorChannel, err := client.OpenTickerStream(context.Background(), "FINNHUB", currency.NewPair(currency.NewCode("AAPL"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if tickerChannel == nil || errorChannel == nil {
		t.Fatal("expected non-nil stream channels")
	}
	if stockStream.lastSymbol != "AAPL" {
		t.Fatalf("expected symbol AAPL, got %s", stockStream.lastSymbol)
	}
}

func TestStreamClient_RoutesCryptoStreamToGCTClient(t *testing.T) {
	tickers := make(chan gct.Ticker)
	errors := make(chan error)
	cryptoStream := &fakeCryptoStreamClient{
		tickerChannel: tickers,
		errorChannel:  errors,
	}
	client := NewStreamClient(&fakeQuoteRouter{}, cryptoStream, &fakeStockStreamClient{})

	tickerChannel, errorChannel, err := client.OpenTickerStream(context.Background(), "Binance", currency.NewPair(currency.NewCode("BTC"), currency.NewCode("USDT")), asset.Spot)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if tickerChannel == nil || errorChannel == nil {
		t.Fatal("expected non-nil stream channels")
	}
	if cryptoStream.lastExchange != "Binance" {
		t.Fatalf("expected exchange Binance, got %s", cryptoStream.lastExchange)
	}
}

func TestStreamClient_OpenTickerStreamTargetUsesGatewayMarketTarget(t *testing.T) {
	tickers := make(chan gct.Ticker)
	errors := make(chan error)
	cryptoStream := &fakeCryptoStreamClient{
		tickerChannel: tickers,
		errorChannel:  errors,
	}
	client := NewStreamClient(&fakeQuoteRouter{}, cryptoStream, &fakeStockStreamClient{})

	tickerChannel, errorChannel, err := client.OpenTickerStreamTarget(context.Background(), contracts.MarketTarget{
		Exchange:  " binance ",
		AssetType: " spot ",
		Pair:      contracts.Pair{Base: " btc ", Quote: " usdt "},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if tickerChannel == nil || errorChannel == nil {
		t.Fatal("expected non-nil stream channels")
	}
	if cryptoStream.lastExchange != "binance" {
		t.Fatalf("expected normalized exchange, got %q", cryptoStream.lastExchange)
	}
	if cryptoStream.lastPair.Base.String() != "BTC" || cryptoStream.lastPair.Quote.String() != "USDT" {
		t.Fatalf("expected normalized pair BTC/USDT, got %s/%s", cryptoStream.lastPair.Base, cryptoStream.lastPair.Quote)
	}
}

func TestStreamClient_AutoCryptoStreamUsesRegistryCandidates(t *testing.T) {
	tickers := make(chan gct.Ticker)
	errorsCh := make(chan error)
	cryptoStream := &fakeCryptoStreamClient{
		tickerChannel: tickers,
		errorChannel:  errorsCh,
		err:           errors.New("binance unavailable"),
	}
	client := NewStreamClient(&fakeQuoteRouter{}, cryptoStream, &fakeStockStreamClient{})
	router := adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}, Strategy: "latency_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"ws": {MaxConcurrency: 1},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"binance": {Group: "ws"},
			"kraken":  {Group: "ws"},
		},
	})
	client.SetAdaptiveRouter(router)
	cryptoStream.err = nil

	tickerChannel, errorChannel, err := client.OpenTickerStream(context.Background(), "AUTO", currency.NewPair(currency.NewCode("BTC"), currency.NewCode("USD")), asset.Spot)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if tickerChannel == nil || errorChannel == nil {
		t.Fatal("expected non-nil stream channels")
	}
	if cryptoStream.lastExchange != "Binance" {
		t.Fatalf("expected first registry-selected provider Binance, got %s", cryptoStream.lastExchange)
	}
	if cryptoStream.lastPair.Base.String() != "BTC" || cryptoStream.lastPair.Quote.String() != "USDT" {
		t.Fatalf("expected normalized Binance pair BTC/USDT, got %s/%s", cryptoStream.lastPair.Base, cryptoStream.lastPair.Quote)
	}
}

func TestStreamClient_AutoEquityStreamUsesFinnhubProvider(t *testing.T) {
	tickers := make(chan gct.Ticker)
	errorsCh := make(chan error)
	stockStream := &fakeStockStreamClient{
		tickerChannel: tickers,
		errorChannel:  errorsCh,
	}
	client := NewStreamClient(&fakeQuoteRouter{}, &fakeCryptoStreamClient{}, stockStream)
	router := adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"us_equities_realtime": {Providers: []string{"finnhub"}, Strategy: "freshness_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"rest": {MaxConcurrency: 1},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"finnhub": {Group: "rest"},
		},
	})
	client.SetAdaptiveRouter(router)

	tickerChannel, errorChannel, err := client.OpenTickerStreamTarget(context.Background(), contracts.MarketTarget{
		Exchange:  "auto",
		AssetType: "equity",
		Pair:      contracts.Pair{Base: "AAPL", Quote: "USD"},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if tickerChannel == nil || errorChannel == nil {
		t.Fatal("expected non-nil stream channels")
	}
	if stockStream.lastSymbol != "AAPL" {
		t.Fatalf("expected AAPL symbol, got %s", stockStream.lastSymbol)
	}
}
