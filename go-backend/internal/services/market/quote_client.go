package market

import (
	"context"
	"fmt"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/gct"
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

func (c *QuoteClient) GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error) {
	if strings.EqualFold(exchange, "FRED") || strings.EqualFold(exchange, "FED") || strings.EqualFold(exchange, "BOJ") || strings.EqualFold(exchange, "SNB") {
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
