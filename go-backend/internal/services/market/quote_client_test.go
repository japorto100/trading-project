package market

import (
	"context"
	"errors"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/contracts"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type fakeCryptoTickerClient struct {
	mu           sync.Mutex
	lastExchange string
	lastPair     gct.Pair
	lastAsset    asset.Item
	ticker       gct.Ticker
	tickerByEx   map[string]gct.Ticker
	errByEx      map[string]error
	delayByEx    map[string]time.Duration
	calls        []string
}

func (f *fakeCryptoTickerClient) GetTicker(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	exactExchange := strings.TrimSpace(exchange)
	normalizedExchange := strings.ToLower(exactExchange)
	if delay := f.delayByEx[exactExchange]; delay > 0 {
		timer := time.NewTimer(delay)
		defer timer.Stop()
		select {
		case <-ctx.Done():
			return gct.Ticker{}, ctx.Err()
		case <-timer.C:
		}
	} else if delay := f.delayByEx[normalizedExchange]; delay > 0 {
		timer := time.NewTimer(delay)
		defer timer.Stop()
		select {
		case <-ctx.Done():
			return gct.Ticker{}, ctx.Err()
		case <-timer.C:
		}
	}

	f.mu.Lock()
	defer f.mu.Unlock()
	f.lastExchange = exactExchange
	f.lastPair = pair
	f.lastAsset = assetType
	f.calls = append(f.calls, exactExchange)
	if err := f.errByEx[exactExchange]; err != nil {
		return gct.Ticker{}, err
	}
	if err := f.errByEx[normalizedExchange]; err != nil {
		return gct.Ticker{}, err
	}
	if ticker, ok := f.tickerByEx[exactExchange]; ok {
		return ticker, nil
	}
	if ticker, ok := f.tickerByEx[normalizedExchange]; ok {
		return ticker, nil
	}
	return f.ticker, nil
}

type fakeForexTickerClient struct {
	lastPair gct.Pair
	ticker   gct.Ticker
}

func (f *fakeForexTickerClient) GetTicker(_ context.Context, pair currency.Pair) (gct.Ticker, error) {
	f.lastPair = pair
	return f.ticker, nil
}

type fakeFinnhubTickerClient struct {
	lastPair  gct.Pair
	lastAsset asset.Item
	ticker    gct.Ticker
}

func (f *fakeFinnhubTickerClient) GetTicker(_ context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	f.lastPair = pair
	f.lastAsset = assetType
	return f.ticker, nil
}

type fakeFredTickerClient struct {
	lastPair  gct.Pair
	lastAsset asset.Item
	ticker    gct.Ticker
}

func (f *fakeFredTickerClient) GetTicker(_ context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	f.lastPair = pair
	f.lastAsset = assetType
	return f.ticker, nil
}

func TestQuoteClient_RoutesECBToForexClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	forex := &fakeForexTickerClient{ticker: gct.Ticker{Last: 1.1}}
	client := NewQuoteClient(crypto, nil, nil, forex)

	ticker, err := client.GetTicker(context.Background(), "ECB", currency.NewPair(currency.NewCode("EUR"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 1.1 {
		t.Fatalf("expected ticker from forex client, got %f", ticker.Last)
	}
	if forex.lastPair.Base.String() != "EUR" || forex.lastPair.Quote.String() != "USD" {
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

	ticker, err := client.GetTicker(context.Background(), "Binance", currency.NewPair(currency.NewCode("BTC"), currency.NewCode("USDT")), asset.Spot)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 42000 {
		t.Fatalf("expected ticker from crypto client, got %f", ticker.Last)
	}
	if crypto.lastExchange != "Binance" || crypto.lastAsset != asset.Spot {
		t.Fatalf("unexpected crypto call exchange=%s asset=%s", crypto.lastExchange, crypto.lastAsset)
	}
}

func TestQuoteClient_RoutesFinnhubToStockClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{ticker: gct.Ticker{Last: 205.12}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, nil, forex)

	ticker, err := client.GetTicker(context.Background(), "FINNHUB", currency.NewPair(currency.NewCode("AAPL"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 205.12 {
		t.Fatalf("expected ticker from stock client, got %f", ticker.Last)
	}
	if stock.lastPair.Base.String() != "AAPL" || stock.lastAsset != asset.Empty {
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

	ticker, err := client.GetTicker(context.Background(), "FRED", currency.NewPair(currency.NewCode("CPIAUCSL"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 3.2 {
		t.Fatalf("expected ticker from macro client, got %f", ticker.Last)
	}
	if macro.lastPair.Base.String() != "CPIAUCSL" || macro.lastAsset != asset.Empty {
		t.Fatalf("unexpected macro call pair=%s/%s asset=%s", macro.lastPair.Base, macro.lastPair.Quote, macro.lastAsset)
	}
	if crypto.lastExchange != "" {
		t.Fatalf("expected crypto client not called, got exchange %s", crypto.lastExchange)
	}
}

func TestQuoteClient_RoutesNyfedToMacroClient(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 4.3}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "NYFED", currency.NewPair(currency.NewCode("DEFAULT"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != "NYFED_SOFR" {
		t.Fatalf("expected NYFED alias to NYFED_SOFR, got %s", macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBojWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 0.1}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BOJ", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != DefaultBojPolicySeries {
		t.Fatalf("expected BOJ alias to %s, got %s", DefaultBojPolicySeries, macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBcbWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 13.25}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BCB", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != DefaultBcbPolicySeries {
		t.Fatalf("expected BCB alias to %s, got %s", DefaultBcbPolicySeries, macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBanxicoWithSeriesPrefix(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 20.25}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BANXICO", currency.NewPair(currency.NewCode("SF43718"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != "BANXICO_SF43718" {
		t.Fatalf("expected Banxico prefix alias, got %s", macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBokWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 3.5}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BOK", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != DefaultBokPolicySeries {
		t.Fatalf("expected BOK alias to %s, got %s", DefaultBokPolicySeries, macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesBcraWithPolicyAlias(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 29.0}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "BCRA", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != DefaultBcraPolicySeries {
		t.Fatalf("expected BCRA alias to %s, got %s", DefaultBcraPolicySeries, macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesTcmbWithSeriesPrefix(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 211784.46}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "TCMB", currency.NewPair(currency.NewCode("TP_AB_TOPLAM"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != "TCMB_EVDS_TP_AB_TOPLAM" {
		t.Fatalf("expected TCMB prefix alias, got %s", macro.lastPair.Base)
	}
}

func TestQuoteClient_RoutesRbiWithSeriesPrefix(t *testing.T) {
	crypto := &fakeCryptoTickerClient{}
	stock := &fakeFinnhubTickerClient{}
	macro := &fakeFredTickerClient{ticker: gct.Ticker{Last: 7.1025e11}}
	forex := &fakeForexTickerClient{}
	client := NewQuoteClient(crypto, stock, macro, forex)

	_, err := client.GetTicker(context.Background(), "RBI", currency.NewPair(currency.NewCode("FXRES_TR_USD_W"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if macro.lastPair.Base.String() != "RBI_DBIE_FXRES_TR_USD_WEEKLY" {
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

	ticker, err := client.GetTicker(context.Background(), "AUTO", currency.NewPair(currency.NewCode("BTC"), currency.NewCode("USD")), asset.Spot)
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
	if crypto.lastExchange != "Kraken" {
		t.Fatalf("expected failover to kraken, got %s", crypto.lastExchange)
	}
	if crypto.lastPair.Base.String() != "XBT" || crypto.lastPair.Quote.String() != "USD" {
		t.Fatalf("expected normalized kraken pair XBT/USD, got %s/%s", crypto.lastPair.Base, crypto.lastPair.Quote)
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

	_, err := client.GetTicker(context.Background(), "AUTO", currency.NewPair(currency.NewCode("BTC"), currency.NewCode("USDT")), asset.Spot)
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

func TestQuoteClient_AutoFailoverLatencyFirstRunsProvidersConcurrently(t *testing.T) {
	crypto := &fakeCryptoTickerClient{
		tickerByEx: map[string]gct.Ticker{
			"binance": {Last: 100},
			"kraken":  {Last: 200},
		},
		delayByEx: map[string]time.Duration{
			"binance": 60 * time.Millisecond,
			"kraken":  5 * time.Millisecond,
		},
	}
	client := NewQuoteClient(crypto, nil, nil, nil)
	router := adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"crypto_spot": {Providers: []string{"binance", "kraken"}, Strategy: "latency_first"},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"binance": {Group: "ws"},
			"kraken":  {Group: "ws"},
		},
	})
	client.SetAdaptiveRouter(router)

	ticker, err := client.GetTicker(context.Background(), "AUTO", currency.NewPair(currency.NewCode("BTC"), currency.NewCode("USD")), asset.Spot)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 200 {
		t.Fatalf("expected faster provider result from Kraken, got %f", ticker.Last)
	}
}

func TestQuoteClient_AutoFailoverLatencyFirstHonorsGroupConcurrencyBudget(t *testing.T) {
	crypto := &fakeCryptoTickerClient{
		tickerByEx: map[string]gct.Ticker{
			"binance": {Last: 100},
			"kraken":  {Last: 200},
		},
		delayByEx: map[string]time.Duration{
			"binance": 60 * time.Millisecond,
			"kraken":  5 * time.Millisecond,
		},
	}
	client := NewQuoteClient(crypto, nil, nil, nil)
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

	ticker, err := client.GetTicker(context.Background(), "AUTO", currency.NewPair(currency.NewCode("BTC"), currency.NewCode("USD")), asset.Spot)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 100 {
		t.Fatalf("expected sequential budget to keep first provider result, got %f", ticker.Last)
	}
}

func TestQuoteClient_GetTickerTargetUsesGatewayMarketTarget(t *testing.T) {
	crypto := &fakeCryptoTickerClient{ticker: gct.Ticker{Last: 42000}}
	client := NewQuoteClient(crypto, nil, nil, nil)

	ticker, err := client.GetTickerTarget(context.Background(), contracts.MarketTarget{
		Exchange:  " binance ",
		AssetType: " spot ",
		Pair:      contracts.Pair{Base: " btc ", Quote: " usdt "},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 42000 {
		t.Fatalf("expected last 42000, got %f", ticker.Last)
	}
	if crypto.lastExchange != "binance" {
		t.Fatalf("expected normalized exchange, got %q", crypto.lastExchange)
	}
	if crypto.lastPair.Base.String() != "BTC" || crypto.lastPair.Quote.String() != "USDT" {
		t.Fatalf("expected normalized pair BTC/USDT, got %s/%s", crypto.lastPair.Base, crypto.lastPair.Quote)
	}
}
