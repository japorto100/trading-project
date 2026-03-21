package market

import (
	"context"
	"fmt"
	"strings"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/connectors/orchestrator"
	"tradeviewfusion/go-backend/internal/contracts"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type cryptoTickerClient interface {
	GetTicker(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item) (gct.Ticker, error)
}

type forexTickerClient interface {
	GetTicker(ctx context.Context, pair currency.Pair) (gct.Ticker, error)
}

type stockTickerClient interface {
	GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error)
}

type macroTickerClient interface {
	GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error)
}

type QuoteClient struct {
	cryptoClient cryptoTickerClient
	stockClient  stockTickerClient
	macroClient  macroTickerClient
	forexClient  forexTickerClient
	planner      *orchestrator.Planner
}

func NewQuoteClient(
	cryptoClient cryptoTickerClient,
	stockClient stockTickerClient,
	macroClient macroTickerClient,
	forexClient forexTickerClient,
) *QuoteClient {
	return &QuoteClient{
		cryptoClient: cryptoClient,
		stockClient:  stockClient,
		macroClient:  macroClient,
		forexClient:  forexClient,
		planner:      orchestrator.New(nil),
	}
}

func (c *QuoteClient) SetAdaptiveRouter(router *adaptive.Router) {
	c.planner.SetRouter(router)
}

func (c *QuoteClient) GetTickerTarget(ctx context.Context, target contracts.MarketTarget) (gct.Ticker, error) {
	exchange, pair, assetType := normalizeMarketTarget(target)
	return c.GetTicker(ctx, exchange, pair, assetType)
}

func (c *QuoteClient) GetTicker(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	if strings.EqualFold(exchange, "AUTO") {
		return c.getTickerWithAutoFailover(ctx, pair, assetType)
	}
	if IsMacroProvider(exchange) {
		if c.macroClient == nil {
			return gct.Ticker{}, fmt.Errorf("macro client unavailable")
		}
		pair.Base = currency.NewCode(ResolveMacroSeries(exchange, pair.Base.String()))
		if pair.Quote.String() == "" {
			pair.Quote = currency.NewCode("USD")
		}
		ticker, err := c.macroClient.GetTicker(ctx, pair, assetType)
		if err != nil {
			return gct.Ticker{}, fmt.Errorf("get macro ticker for %s/%s: %w", exchange, pair.String(), err)
		}
		return ticker, nil
	}

	if strings.EqualFold(exchange, "FINNHUB") {
		if c.stockClient == nil {
			return gct.Ticker{}, fmt.Errorf("stock client unavailable")
		}
		ticker, err := c.stockClient.GetTicker(ctx, pair, assetType)
		if err != nil {
			return gct.Ticker{}, fmt.Errorf("get stock ticker for %s: %w", pair.String(), err)
		}
		return ticker, nil
	}

	if strings.EqualFold(exchange, "ECB") {
		if c.forexClient == nil {
			return gct.Ticker{}, fmt.Errorf("forex client unavailable")
		}
		ticker, err := c.forexClient.GetTicker(ctx, pair)
		if err != nil {
			return gct.Ticker{}, fmt.Errorf("get forex ticker for %s: %w", pair.String(), err)
		}
		return ticker, nil
	}

	if c.cryptoClient == nil {
		return gct.Ticker{}, fmt.Errorf("crypto client unavailable")
	}
	ticker, err := c.cryptoClient.GetTicker(ctx, exchange, pair, assetType)
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("get crypto ticker for %s/%s/%s: %w", exchange, pair.String(), assetType.String(), err)
	}
	return ticker, nil
}

func (c *QuoteClient) getTickerWithAutoFailover(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	assetClass := strings.ToLower(strings.TrimSpace(assetType.String()))
	switch assetClass {
	case "equity":
		return c.tryStockProviders(ctx, pair, assetType, []string{"finnhub"}, "us_equities_realtime")
	case "forex":
		return c.tryForexProviders(ctx, pair, []string{"ecb"}, "forex_spot")
	case "macro":
		return c.tryMacroProviders(ctx, pair, assetType, []string{"fred", "fed", "boj", "snb", "bcb", "banxico", "bok", "bcra", "tcmb", "rbi", "imf", "oecd", "worldbank", "un", "adb", "ofr", "nyfed"}, "macro")
	default:
		return c.tryCryptoProviders(ctx, pair, assetType, []string{"binance", "kraken", "coinbase", "okx", "bybit"}, "crypto_spot")
	}
}

func (c *QuoteClient) tryCryptoProviders(ctx context.Context, pair currency.Pair, assetType asset.Item, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.cryptoClient == nil {
		return gct.Ticker{}, fmt.Errorf("crypto client unavailable")
	}
	plan := c.planner.Plan(assetClass, fallback)
	if len(plan.Candidates) == 0 {
		return gct.Ticker{}, fmt.Errorf("no crypto providers configured")
	}
	result, err := orchestrator.ExecuteFirst(ctx, c.planner, plan, func(callCtx context.Context, provider string) (gct.Ticker, error) {
		normalizedPair := normalizeCryptoPairForProvider(provider, pair)
		return c.cryptoClient.GetTicker(callCtx, providerDisplayName(provider), normalizedPair, assetType)
	})
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("execute crypto provider plan: %w", err)
	}
	return result.Value, nil
}

func normalizeCryptoPairForProvider(provider string, pair currency.Pair) currency.Pair {
	normalized := pair
	base := strings.ToUpper(strings.TrimSpace(normalized.Base.String()))
	quote := strings.ToUpper(strings.TrimSpace(normalized.Quote.String()))
	name := strings.ToLower(strings.TrimSpace(provider))

	switch name {
	case "kraken":
		if base == "BTC" {
			base = "XBT"
		}
		if quote == "" {
			quote = "USD"
		}
	case "coinbase":
		if quote == "" {
			quote = "USD"
		}
	case "binance", "okx", "bybit":
		if quote == "" || quote == "USD" {
			quote = "USDT"
		}
	default:
		if quote == "" {
			quote = "USDT"
		}
	}

	normalized.Base = currency.NewCode(base)
	normalized.Quote = currency.NewCode(quote)
	return normalized
}

func providerDisplayName(provider string) string {
	switch strings.ToLower(strings.TrimSpace(provider)) {
	case "binance":
		return "Binance"
	case "kraken":
		return "Kraken"
	case "coinbase":
		return "Coinbase"
	case "okx":
		return "OKX"
	case "bybit":
		return "Bybit"
	case "finnhub":
		return "FINNHUB"
	case "ecb":
		return "ECB"
	case "fred":
		return "FRED"
	case "fed":
		return "FED"
	case "boj":
		return "BOJ"
	case "snb":
		return "SNB"
	case "bcb":
		return "BCB"
	case "banxico":
		return "BANXICO"
	case "bok":
		return "BOK"
	case "bcra":
		return "BCRA"
	case "tcmb":
		return "TCMB"
	case "rbi":
		return "RBI"
	case "worldbank":
		return "WORLDBANK"
	case "imf":
		return "IMF"
	case "un":
		return "UN"
	case "adb":
		return "ADB"
	case "ofr":
		return "OFR"
	case "nyfed":
		return "NYFED"
	case "oecd":
		return "OECD"
	default:
		return strings.TrimSpace(provider)
	}
}

func (c *QuoteClient) tryStockProviders(ctx context.Context, pair currency.Pair, assetType asset.Item, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.stockClient == nil {
		return gct.Ticker{}, fmt.Errorf("stock client unavailable")
	}
	var lastErr error
	for _, provider := range c.planner.Plan(assetClass, fallback).Candidates {
		if strings.ToLower(provider) == "finnhub" {
			ticker, err := c.stockClient.GetTicker(ctx, pair, assetType)
			if err == nil {
				c.planner.RecordSuccess(provider)
				return ticker, nil
			}
			lastErr = err
			c.recordProviderFailure(provider, err)
		}
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no stock providers configured")
	}
	return gct.Ticker{}, lastErr
}

func (c *QuoteClient) tryForexProviders(ctx context.Context, pair currency.Pair, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.forexClient == nil {
		return gct.Ticker{}, fmt.Errorf("forex client unavailable")
	}
	var lastErr error
	for _, provider := range c.planner.Plan(assetClass, fallback).Candidates {
		if strings.ToLower(provider) == "ecb" {
			ticker, err := c.forexClient.GetTicker(ctx, pair)
			if err == nil {
				c.planner.RecordSuccess(provider)
				return ticker, nil
			}
			lastErr = err
			c.recordProviderFailure(provider, err)
		}
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no forex providers configured")
	}
	return gct.Ticker{}, lastErr
}

func (c *QuoteClient) tryMacroProviders(ctx context.Context, pair currency.Pair, assetType asset.Item, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.macroClient == nil {
		return gct.Ticker{}, fmt.Errorf("macro client unavailable")
	}
	var lastErr error
	for _, provider := range c.planner.Plan(assetClass, fallback).Candidates {
		exchange := strings.ToUpper(provider)
		p := pair
		if IsMacroProvider(exchange) {
			p.Base = currency.NewCode(ResolveMacroSeries(exchange, p.Base.String()))
		}
		if p.Quote.String() == "" {
			p.Quote = currency.NewCode("USD")
		}
		ticker, err := c.macroClient.GetTicker(ctx, p, assetType)
		if err == nil {
			c.planner.RecordSuccess(provider)
			return ticker, nil
		}
		lastErr = err
		c.recordProviderFailure(provider, err)
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no macro providers configured")
	}
	return gct.Ticker{}, lastErr
}

func (c *QuoteClient) recordProviderFailure(provider string, err error) {
	c.planner.RecordFailure(provider, err)
}
