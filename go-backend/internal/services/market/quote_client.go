package market

import (
	"context"
	"fmt"
	"strings"

	baseconnectors "tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type cryptoTickerClient interface {
	GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error)
}

type forexTickerClient interface {
	GetTicker(ctx context.Context, pair gct.Pair) (gct.Ticker, error)
}

type stockTickerClient interface {
	GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error)
}

type macroTickerClient interface {
	GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error)
}

type QuoteClient struct {
	cryptoClient cryptoTickerClient
	stockClient  stockTickerClient
	macroClient  macroTickerClient
	forexClient  forexTickerClient
	router       *adaptive.Router
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
	}
}

func (c *QuoteClient) SetAdaptiveRouter(router *adaptive.Router) {
	c.router = router
}

func (c *QuoteClient) GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error) {
	if strings.EqualFold(exchange, "AUTO") {
		return c.getTickerWithAutoFailover(ctx, pair, assetType)
	}
	if strings.EqualFold(exchange, "FRED") || strings.EqualFold(exchange, "FED") || strings.EqualFold(exchange, "BOJ") || strings.EqualFold(exchange, "SNB") || strings.EqualFold(exchange, "BCB") || strings.EqualFold(exchange, "BANXICO") || strings.EqualFold(exchange, "BOK") || strings.EqualFold(exchange, "BCRA") || strings.EqualFold(exchange, "TCMB") || strings.EqualFold(exchange, "RBI") {
		if c.macroClient == nil {
			return gct.Ticker{}, fmt.Errorf("macro client unavailable")
		}
		pair.Base = ResolveMacroSeries(exchange, pair.Base)
		if pair.Quote == "" {
			pair.Quote = "USD"
		}
		return c.macroClient.GetTicker(ctx, pair, assetType)
	}

	if strings.EqualFold(exchange, "FINNHUB") {
		if c.stockClient == nil {
			return gct.Ticker{}, fmt.Errorf("stock client unavailable")
		}
		return c.stockClient.GetTicker(ctx, pair, assetType)
	}

	if strings.EqualFold(exchange, "ECB") {
		if c.forexClient == nil {
			return gct.Ticker{}, fmt.Errorf("forex client unavailable")
		}
		return c.forexClient.GetTicker(ctx, pair)
	}

	if c.cryptoClient == nil {
		return gct.Ticker{}, fmt.Errorf("crypto client unavailable")
	}
	return c.cryptoClient.GetTicker(ctx, exchange, pair, assetType)
}

func (c *QuoteClient) getTickerWithAutoFailover(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	asset := strings.ToLower(strings.TrimSpace(assetType))
	switch asset {
	case "equity":
		return c.tryStockProviders(ctx, pair, assetType, []string{"finnhub"}, "us_equities_realtime")
	case "forex":
		return c.tryForexProviders(ctx, pair, []string{"ecb"}, "forex_spot")
	case "macro":
		return c.tryMacroProviders(ctx, pair, assetType, []string{"fred", "fed", "boj", "snb", "bcb", "banxico", "bok", "bcra", "tcmb", "rbi"}, "macro")
	default:
		return c.tryCryptoProviders(ctx, pair, assetType, []string{"binance", "kraken", "coinbase", "okx", "bybit"}, "crypto_spot")
	}
}

func (c *QuoteClient) providerCandidates(assetClass string, fallback []string) []string {
	if c.router == nil {
		return fallback
	}
	candidates := c.router.Candidates(assetClass, fallback)
	if len(candidates) == 0 {
		return fallback
	}
	return candidates
}

func (c *QuoteClient) tryCryptoProviders(ctx context.Context, pair gct.Pair, assetType string, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.cryptoClient == nil {
		return gct.Ticker{}, fmt.Errorf("crypto client unavailable")
	}
	var lastErr error
	for _, provider := range c.providerCandidates(assetClass, fallback) {
		ticker, err := c.cryptoClient.GetTicker(ctx, providerDisplayName(provider), pair, assetType)
		if err == nil {
			if c.router != nil {
				c.router.RecordSuccess(provider)
			}
			return ticker, nil
		}
		lastErr = err
		c.recordProviderFailure(provider, err)
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no crypto providers configured")
	}
	return gct.Ticker{}, lastErr
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
	default:
		return strings.TrimSpace(provider)
	}
}

func (c *QuoteClient) tryStockProviders(ctx context.Context, pair gct.Pair, assetType string, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.stockClient == nil {
		return gct.Ticker{}, fmt.Errorf("stock client unavailable")
	}
	var lastErr error
	for _, provider := range c.providerCandidates(assetClass, fallback) {
		switch strings.ToLower(provider) {
		case "finnhub":
			ticker, err := c.stockClient.GetTicker(ctx, pair, assetType)
			if err == nil {
				if c.router != nil {
					c.router.RecordSuccess(provider)
				}
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

func (c *QuoteClient) tryForexProviders(ctx context.Context, pair gct.Pair, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.forexClient == nil {
		return gct.Ticker{}, fmt.Errorf("forex client unavailable")
	}
	var lastErr error
	for _, provider := range c.providerCandidates(assetClass, fallback) {
		switch strings.ToLower(provider) {
		case "ecb":
			ticker, err := c.forexClient.GetTicker(ctx, pair)
			if err == nil {
				if c.router != nil {
					c.router.RecordSuccess(provider)
				}
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

func (c *QuoteClient) tryMacroProviders(ctx context.Context, pair gct.Pair, assetType string, fallback []string, assetClass string) (gct.Ticker, error) {
	if c.macroClient == nil {
		return gct.Ticker{}, fmt.Errorf("macro client unavailable")
	}
	var lastErr error
	for _, provider := range c.providerCandidates(assetClass, fallback) {
		exchange := strings.ToUpper(provider)
		p := pair
		if strings.EqualFold(exchange, "FRED") || strings.EqualFold(exchange, "FED") || strings.EqualFold(exchange, "BOJ") || strings.EqualFold(exchange, "SNB") || strings.EqualFold(exchange, "BCB") || strings.EqualFold(exchange, "BANXICO") || strings.EqualFold(exchange, "BOK") || strings.EqualFold(exchange, "BCRA") || strings.EqualFold(exchange, "TCMB") || strings.EqualFold(exchange, "RBI") {
			p.Base = ResolveMacroSeries(exchange, p.Base)
		}
		if p.Quote == "" {
			p.Quote = "USD"
		}
		ticker, err := c.macroClient.GetTicker(ctx, p, assetType)
		if err == nil {
			if c.router != nil {
				c.router.RecordSuccess(provider)
			}
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
	if c.router == nil {
		return
	}
	c.router.RecordFailureWithClass(provider, err, baseconnectors.ClassifyError(err, nil))
}
