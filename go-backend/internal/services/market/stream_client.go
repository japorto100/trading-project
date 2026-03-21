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

type quoteRouter interface {
	GetTicker(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item) (gct.Ticker, error)
}

type cryptoStreamClient interface {
	OpenTickerStream(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item) (<-chan gct.Ticker, <-chan error, error)
}

type stockStreamClient interface {
	OpenTradeStream(ctx context.Context, symbol string) (<-chan gct.Ticker, <-chan error, error)
}

type StreamClient struct {
	quoteRouter  quoteRouter
	cryptoStream cryptoStreamClient
	stockStream  stockStreamClient
	planner      *orchestrator.Planner
}

func NewStreamClient(quoteRouter quoteRouter, cryptoStream cryptoStreamClient, stockStream stockStreamClient) *StreamClient {
	return &StreamClient{
		quoteRouter:  quoteRouter,
		cryptoStream: cryptoStream,
		stockStream:  stockStream,
		planner:      orchestrator.New(nil),
	}
}

func (c *StreamClient) SetAdaptiveRouter(router *adaptive.Router) {
	c.planner.SetRouter(router)
}

func (c *StreamClient) GetTicker(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	if c.quoteRouter == nil {
		return gct.Ticker{}, fmt.Errorf("quote router unavailable")
	}
	ticker, err := c.quoteRouter.GetTicker(ctx, exchange, pair, assetType)
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("get stream ticker for %s/%s/%s: %w", exchange, pair.String(), assetType.String(), err)
	}
	return ticker, nil
}

func (c *StreamClient) GetTickerTarget(ctx context.Context, target contracts.MarketTarget) (gct.Ticker, error) {
	exchange, pair, assetType := normalizeMarketTarget(target)
	return c.GetTicker(ctx, exchange, pair, assetType)
}

func (c *StreamClient) OpenTickerStream(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item) (<-chan gct.Ticker, <-chan error, error) {
	if strings.EqualFold(exchange, "AUTO") {
		return c.openAutoTickerStream(ctx, pair, assetType)
	}
	if strings.EqualFold(exchange, "FINNHUB") {
		if c.stockStream == nil {
			return nil, nil, fmt.Errorf("stock stream client unavailable")
		}
		ticks, errs, err := c.stockStream.OpenTradeStream(ctx, pair.Base.String())
		if err != nil {
			return nil, nil, fmt.Errorf("open stock trade stream for %s: %w", pair.Base.String(), err)
		}
		return ticks, errs, nil
	}

	if c.cryptoStream == nil {
		return nil, nil, fmt.Errorf("crypto stream client unavailable")
	}
	ticks, errs, err := c.cryptoStream.OpenTickerStream(ctx, exchange, pair, assetType)
	if err != nil {
		return nil, nil, fmt.Errorf("open crypto ticker stream for %s/%s/%s: %w", exchange, pair.String(), assetType.String(), err)
	}
	return ticks, errs, nil
}

func (c *StreamClient) openAutoTickerStream(ctx context.Context, pair currency.Pair, assetType asset.Item) (<-chan gct.Ticker, <-chan error, error) {
	assetClass := strings.ToLower(strings.TrimSpace(assetType.String()))
	switch assetClass {
	case "equity":
		plan := c.planner.Plan("us_equities_realtime", []string{"finnhub"})
		var lastErr error
		for _, provider := range plan.Candidates {
			if !strings.EqualFold(provider, "finnhub") {
				continue
			}
			if c.stockStream == nil {
				lastErr = fmt.Errorf("stock stream client unavailable")
				c.planner.RecordFailure(provider, lastErr)
				continue
			}
			ticks, errs, err := c.stockStream.OpenTradeStream(ctx, pair.Base.String())
			if err == nil {
				c.planner.RecordSuccess(provider)
				return ticks, errs, nil
			}
			lastErr = err
			c.planner.RecordFailure(provider, err)
		}
		if lastErr == nil {
			lastErr = fmt.Errorf("no stock stream providers configured")
		}
		return nil, nil, fmt.Errorf("open auto stock ticker stream for %s: %w", pair.Base.String(), lastErr)
	default:
		plan := c.planner.Plan("crypto_spot", []string{"binance", "kraken", "coinbase", "okx", "bybit"})
		var lastErr error
		for _, provider := range plan.Candidates {
			if c.cryptoStream == nil {
				lastErr = fmt.Errorf("crypto stream client unavailable")
				c.planner.RecordFailure(provider, lastErr)
				continue
			}
			normalizedPair := normalizeCryptoPairForProvider(provider, pair)
			ticks, errs, err := c.cryptoStream.OpenTickerStream(ctx, providerDisplayName(provider), normalizedPair, assetType)
			if err == nil {
				c.planner.RecordSuccess(provider)
				return ticks, errs, nil
			}
			lastErr = err
			c.planner.RecordFailure(provider, err)
		}
		if lastErr == nil {
			lastErr = fmt.Errorf("no crypto stream providers configured")
		}
		return nil, nil, fmt.Errorf("open auto crypto ticker stream for %s/%s: %w", pair.Base.String(), pair.Quote.String(), lastErr)
	}
}

func (c *StreamClient) OpenTickerStreamTarget(ctx context.Context, target contracts.MarketTarget) (<-chan gct.Ticker, <-chan error, error) {
	normalized := target.Normalized()
	if strings.EqualFold(normalized.Exchange, "AUTO") && (strings.EqualFold(normalized.AssetType, "equity") || strings.EqualFold(normalized.AssetType, "stock")) {
		plan := c.planner.Plan("us_equities_realtime", []string{"finnhub"})
		var lastErr error
		for _, provider := range plan.Candidates {
			if !strings.EqualFold(provider, "finnhub") {
				continue
			}
			if c.stockStream == nil {
				lastErr = fmt.Errorf("stock stream client unavailable")
				c.planner.RecordFailure(provider, lastErr)
				continue
			}
			ticks, errs, err := c.stockStream.OpenTradeStream(ctx, strings.TrimSpace(normalized.Pair.Base))
			if err == nil {
				c.planner.RecordSuccess(provider)
				return ticks, errs, nil
			}
			lastErr = err
			c.planner.RecordFailure(provider, err)
		}
		if lastErr == nil {
			lastErr = fmt.Errorf("no stock stream providers configured")
		}
		return nil, nil, fmt.Errorf("open auto stock ticker stream for %s: %w", strings.TrimSpace(normalized.Pair.Base), lastErr)
	}
	exchange, pair, assetType := normalizeMarketTarget(target)
	return c.OpenTickerStream(ctx, exchange, pair, assetType)
}
