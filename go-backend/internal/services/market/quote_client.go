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

type QuoteClient struct {
	cryptoClient cryptoTickerClient
	forexClient  forexTickerClient
}

func NewQuoteClient(cryptoClient cryptoTickerClient, forexClient forexTickerClient) *QuoteClient {
	return &QuoteClient{
		cryptoClient: cryptoClient,
		forexClient:  forexClient,
	}
}

func (c *QuoteClient) GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error) {
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
