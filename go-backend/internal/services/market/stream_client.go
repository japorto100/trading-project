package market

import (
	"context"
	"fmt"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type quoteRouter interface {
	GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error)
}

type cryptoStreamClient interface {
	OpenTickerStream(ctx context.Context, exchange string, pair gct.Pair, assetType string) (<-chan gct.Ticker, <-chan error, error)
}

type stockStreamClient interface {
	OpenTradeStream(ctx context.Context, symbol string) (<-chan gct.Ticker, <-chan error, error)
}

type StreamClient struct {
	quoteRouter  quoteRouter
	cryptoStream cryptoStreamClient
	stockStream  stockStreamClient
}

func NewStreamClient(quoteRouter quoteRouter, cryptoStream cryptoStreamClient, stockStream stockStreamClient) *StreamClient {
	return &StreamClient{
		quoteRouter:  quoteRouter,
		cryptoStream: cryptoStream,
		stockStream:  stockStream,
	}
}

func (c *StreamClient) GetTicker(ctx context.Context, exchange string, pair gct.Pair, assetType string) (gct.Ticker, error) {
	if c.quoteRouter == nil {
		return gct.Ticker{}, fmt.Errorf("quote router unavailable")
	}
	return c.quoteRouter.GetTicker(ctx, exchange, pair, assetType)
}

func (c *StreamClient) OpenTickerStream(ctx context.Context, exchange string, pair gct.Pair, assetType string) (<-chan gct.Ticker, <-chan error, error) {
	if strings.EqualFold(exchange, "FINNHUB") {
		if c.stockStream == nil {
			return nil, nil, fmt.Errorf("stock stream client unavailable")
		}
		return c.stockStream.OpenTradeStream(ctx, pair.Base)
	}

	if c.cryptoStream == nil {
		return nil, nil, fmt.Errorf("crypto stream client unavailable")
	}
	return c.cryptoStream.OpenTickerStream(ctx, exchange, pair, assetType)
}
