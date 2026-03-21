package market

import (
	"context"
	"fmt"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/orchestrator"
	"tradeviewfusion/go-backend/internal/contracts"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type depthSource interface {
	GetOrderbook(ctx context.Context, exchange string, pair contracts.Pair, assetType string) (contracts.OrderbookSnapshot, error)
	OpenOrderbookStream(ctx context.Context, exchange string, pair contracts.Pair, assetType string) (<-chan contracts.OrderbookSnapshot, <-chan error, error)
}

type DepthClient struct {
	source  depthSource
	planner *orchestrator.Planner
}

func NewDepthClient(source depthSource) *DepthClient {
	return &DepthClient{
		source:  source,
		planner: orchestrator.New(nil),
	}
}

func (c *DepthClient) SetAdaptiveRouter(router *adaptive.Router) {
	c.planner.SetRouter(router)
}

func (c *DepthClient) GetOrderbook(ctx context.Context, target contracts.MarketTarget) (contracts.OrderbookSnapshot, error) {
	if c == nil || c.source == nil {
		return contracts.OrderbookSnapshot{}, fmt.Errorf("depth client unavailable")
	}

	normalized := target.Normalized()
	resolvedExchange, pairLabel, err := c.resolveExchange(normalized)
	if err != nil {
		return contracts.OrderbookSnapshot{}, err
	}
	snapshot, err := c.source.GetOrderbook(ctx, resolvedExchange, normalized.Pair, normalized.AssetType)
	if err != nil {
		if strings.EqualFold(normalized.Exchange, "AUTO") {
			c.planner.RecordFailure(strings.ToLower(resolvedExchange), err)
		}
		return contracts.OrderbookSnapshot{}, fmt.Errorf("get orderbook for %s/%s/%s: %w", resolvedExchange, pairLabel, normalized.AssetType, err)
	}
	if strings.EqualFold(normalized.Exchange, "AUTO") {
		c.planner.RecordSuccess(strings.ToLower(resolvedExchange))
	}
	return snapshot, nil
}

func (c *DepthClient) OpenOrderbookStream(ctx context.Context, target contracts.MarketTarget) (<-chan contracts.OrderbookSnapshot, <-chan error, error) {
	if c == nil || c.source == nil {
		return nil, nil, fmt.Errorf("depth client unavailable")
	}

	normalized := target.Normalized()
	resolvedExchange, pairLabel, err := c.resolveExchange(normalized)
	if err != nil {
		return nil, nil, err
	}
	snapshots, errs, err := c.source.OpenOrderbookStream(ctx, resolvedExchange, normalized.Pair, normalized.AssetType)
	if err != nil {
		if strings.EqualFold(normalized.Exchange, "AUTO") {
			c.planner.RecordFailure(strings.ToLower(resolvedExchange), err)
		}
		return nil, nil, fmt.Errorf("open orderbook stream for %s/%s/%s: %w", resolvedExchange, pairLabel, normalized.AssetType, err)
	}
	if strings.EqualFold(normalized.Exchange, "AUTO") {
		c.planner.RecordSuccess(strings.ToLower(resolvedExchange))
	}
	return snapshots, errs, nil
}

func (c *DepthClient) resolveExchange(target contracts.MarketTarget) (string, string, error) {
	pairLabel := target.Pair.Base + "/" + target.Pair.Quote
	if !strings.EqualFold(target.Exchange, "AUTO") {
		return target.Exchange, pairLabel, nil
	}

	plan := c.planner.Plan("crypto_spot", []string{"binance", "kraken", "coinbase", "okx", "bybit"})
	for _, provider := range plan.Candidates {
		if strings.TrimSpace(provider) == "" {
			continue
		}
		return providerDisplayName(provider), pairLabel, nil
	}
	return "", pairLabel, fmt.Errorf("no depth providers configured")
}
