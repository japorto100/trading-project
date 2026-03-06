// Package duplex defines the stable ExchangeAdapter interface for direct exchange
// connectivity outside of GCT. Implementations live under pkg/duplex/{exchange}/.
// NoopAdapter is the safe default when no real adapter is configured.
package duplex

import (
	"context"

	"tradeviewfusion/go-backend/pkg/protocol"
)

// ExchangeAdapter is the minimal surface for direct exchange integration.
// Keep implementations thin — protocol translation only; no business logic.
type ExchangeAdapter interface {
	// Subscribe opens a live feed for symbol (e.g. "BTC/USDT").
	// Returns a channel of StreamEvents; the channel is closed when the feed ends.
	Subscribe(ctx context.Context, symbol string) (<-chan StreamEvent, error)

	// SubmitOrder sends a new order to the exchange.
	SubmitOrder(ctx context.Context, req OrderRequest) (OrderResponse, error)

	// CancelOrder cancels an open order by its exchange-assigned ID.
	CancelOrder(ctx context.Context, orderID string) error

	// GetBalance returns the available balance for the given asset (e.g. "USDT").
	GetBalance(ctx context.Context, asset string) (float64, error)

	// Capabilities reports which optional features this adapter supports.
	Capabilities() AdapterCapabilities

	// Close drains any pending I/O and shuts down the adapter cleanly.
	Close() error
}

// StreamEvent wraps a single real-time price update from a direct exchange feed.
// Error is non-nil when the feed encounters a recoverable or terminal error.
type StreamEvent struct {
	Tick  protocol.Tick
	Error error
}

// AdapterCapabilities declares which operations an adapter implements.
// Callers should check before calling optional methods.
type AdapterCapabilities struct {
	LiveStream    bool
	OrderSubmit   bool
	MarginTrading bool
	Futures       bool
}
