// Package messaging provides the Publisher abstraction for NATS JetStream.
// Default: NoopPublisher (silent discard). Enable the real backend via NATS_ENABLED=true.
package messaging

import "context"

// Publisher is the minimal interface for publishing market events to the message bus.
type Publisher interface {
	// PublishTick publishes a raw tick payload (JSON bytes) for the given symbol.
	PublishTick(ctx context.Context, symbol string, payload []byte) error

	// PublishCandle publishes an OHLCV candle payload (JSON bytes).
	// Subject routing is handled by the implementation.
	PublishCandle(ctx context.Context, payload []byte) error

	// Ping checks liveness of the backend connection.
	Ping(ctx context.Context) error

	// BackendName returns a short identifier ("noop", "nats").
	BackendName() string
}

// NoopPublisher satisfies Publisher with all operations discarding data silently.
// It is always safe to call — no network I/O, no allocations beyond the call itself.
type NoopPublisher struct{}

func (NoopPublisher) PublishTick(_ context.Context, _ string, _ []byte) error { return nil }
func (NoopPublisher) PublishCandle(_ context.Context, _ []byte) error          { return nil }
func (NoopPublisher) Ping(_ context.Context) error                             { return nil }
func (NoopPublisher) BackendName() string                                      { return "noop" }
