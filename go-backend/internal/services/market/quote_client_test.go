package market

import (
	"context"
	"errors"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type fakeCryptoTickerClient struct {
	lastExchange string
	lastPair     gct.Pair
	lastAsset    string
	ticker       gct.Ticker
	errByEx      map[string]error
	calls        []string
}

func (f *fakeCryptoTickerClient) GetTicker(_ context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error) {
	f.lastExchange = exchange
	f.lastPair = pair
	f.lastAsset = assetType
	f.calls = append(f.calls, exchange)
	if err := f.errByEx[exchange]; err != nil {
		return gct.Ticker{}, err
	}
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

func TestQuoteClient_RoutesBcbWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 13.25}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BCB", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base != DefaultBcbPolicySeries {
		t.Fatalf("expected BCB alias to %s, got %s", DefaultBcbPolicySeries, macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBanxicoWithSeriesPrefix(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 20.25}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BANXICO", gct.Pair{Base: "SF43718", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base != "BANXICO_SF43718" {
		t.Fatalf("expected Banxico prefix alias, got %s", macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBokWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 3.5}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BOK", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base != DefaultBokPolicySeries {
		t.Fatalf("expected BOK alias to %s, got %s", DefaultBokPolicySeries, macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBcraWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 29.0}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BCRA", gct.Pair{Base: "POLICY_RATE", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base != DefaultBcraPolicySeries {
		t.Fatalf("expected BCRA alias to %s, got %s", DefaultBcraPolicySeries, macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesTcmbWithSeriesPrefix(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 211784.46}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "TCMB", gct.Pair{Base: "TP_AB_TOPLAM", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base != "TCMB_EVDS_TP_AB_TOPLAM" {
		t.Fatalf("expected TCMB prefix alias, got %s", macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesRbiWithSeriesPrefix(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 7.1025e11}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "RBI", gct.Pair{Base: "FXRES_TR_USD_W", Quote: "USD"}, "macro")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base != "RBI_DBIE_FXRES_TR_USD_WEEKLY" {
		t.Fatalf("expected RBI prefix alias, got %s", macro.lastPair.Base)
	}
}

func TestQuoteClient_AutoFailoverForCrypto(t *testing.T) {
	crypto := &fakeCryptoTickerClient{
		ticker: gct.Ticker{Last: 42000},
		errByEx: map[string]error{
			"Binance": errors.New("binance down"),
		},
	}
	client := NewQuoteClient(crypto, nil, nil, nil)

	ticker, err := client.GetTicker(context.Background(), "AUTO", gct.Pair{Base: "BTC", Quote: "USDT"}, "spot")
	if err != nil {
		t.Fatalf("expected failover success, got %v", err)
	}
	if ticker.Last != 42000 {
		t.Fatalf("expected ticker from failover provider, got %f", ticker.Last)
	}
	if len(crypto.calls) < 2 {
		t.Fatalf("expected multiple provider attempts, got %v", crypto.calls)
	}
	if crypto.calls[0] != "Binance" {
		t.Fatalf("expected binance attempted first, got %s", crypto.calls[0])
	}
}

func TestQuoteClient_AutoFailoverRecordsClassifiedRouterFailures(t *testing.T) {
	crypto := &fakeCryptoTickerClient{
		ticker: gct.Ticker{Last: 42000},
		errByEx: map[string]error{
			"Binance": errors.New("timeout"),
		},
	}
	client := NewQuoteClient(crypto, nil, nil, nil)
	router := adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}},
		},
	})
	client.SetAdaptiveRouter(router)

	_, err := client.GetTicker(context.Background(), "AUTO", gct.Pair{Base: "BTC", Quote: "USDT"}, "spot")
	if err != nil {
		t.Fatalf("expected failover success, got %v", err)
	}

	snap := router.Snapshot()
	var binance *adaptive.ProviderState
	for i := range snap {
		if snap[i].Name == "binance" {
			binance = &snap[i]
			break
		}
	}
	if binance == nil {
		t.Fatalf("expected binance provider in router snapshot, got %+v", snap)
	}
	if got := string(binance.LastErrorClass); got != "timeout" {
		t.Fatalf("expected timeout error class, got %q", got)
	}
	if got := binance.FailureClasses["timeout"]; got != 1 {
		t.Fatalf("expected timeout failure count 1, got %d", got)
	}
}
