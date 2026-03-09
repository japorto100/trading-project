package market

import (
	"context"
	"fmt"

	"tradeviewfusion/go-backend/internal/contracts"
)

type depthSource interface {
	GetOrderbook(ctx context.Context, exchange string, pair contracts.Pair, assetType string) (contracts.OrderbookSnapshot, error)
	OpenOrderbookStream(ctx context.Context, exchange string, pair contracts.Pair, assetType string) (<-chan contracts.OrderbookSnapshot, <-chan error, error)
}

type DepthClient struct {
	source depthSource
}

func NewDepthClient(source depthSource) *DepthClient {
	return &DepthClient{source: source}
}

func (c *DepthClient) GetOrderbook(ctx context.Context, target contracts.MarketTarget) (contracts.OrderbookSnapshot, error) {
	if c == nil || c.source == nil {
		return contracts.OrderbookSnapshot{}, fmt.Errorf("depth client unavailable")
	}

	normalized := target.Normalized()
	return c.source.GetOrderbook(ctx, normalized.Exchange, normalized.Pair, normalized.AssetType)
}

func (c *DepthClient) OpenOrderbookStream(ctx context.Context, target contracts.MarketTarget) (<-chan contracts.OrderbookSnapshot, <-chan error, error) {
	if c == nil || c.source == nil {
		return nil, nil, fmt.Errorf("depth client unavailable")
	}

	normalized := target.Normalized()
	return c.source.OpenOrderbookStream(ctx, normalized.Exchange, normalized.Pair, normalized.AssetType)
}
