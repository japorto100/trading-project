package messaging

import (
	"context"
	"fmt"
	"time"

	nats "github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

// NATSPublisher publishes market events to NATS JetStream.
// Create via NewNATSPublisher; call Close() on gateway shutdown.
type NATSPublisher struct {
	nc *nats.Conn
	js jetstream.JetStream
}

// NewNATSPublisher connects to the NATS server at url and returns a ready publisher.
// Returns an error if the connection, JetStream init, or stream provisioning fails — caller falls back to noop.
func NewNATSPublisher(url string) (*NATSPublisher, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("nats connect %s: %w", url, err)
	}
	js, err := jetstream.New(nc)
	if err != nil {
		nc.Close()
		return nil, fmt.Errorf("nats jetstream init: %w", err)
	}
	p := &NATSPublisher{nc: nc, js: js}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := p.ensureStreams(ctx); err != nil {
		nc.Close()
		return nil, err
	}
	return p, nil
}

// ensureStreams idempotently provisions the required JetStream streams.
// Called once on startup; safe to call if streams already exist (CreateOrUpdateStream).
func (p *NATSPublisher) ensureStreams(ctx context.Context) error {
	streams := []jetstream.StreamConfig{
		{
			Name:      "MARKET_CANDLES",
			Subjects:  []string{"market.candle", "market.candle.>"},
			MaxAge:    time.Hour,
			MaxMsgs:   100_000,
			Storage:   jetstream.MemoryStorage,
			Retention: jetstream.LimitsPolicy,
		},
		{
			Name:      "MARKET_TICKS",
			Subjects:  []string{"market.*.tick"},
			MaxAge:    time.Hour,
			MaxMsgs:   1_000_000,
			Storage:   jetstream.MemoryStorage,
			Retention: jetstream.LimitsPolicy,
		},
	}
	for _, cfg := range streams {
		if _, err := p.js.CreateOrUpdateStream(ctx, cfg); err != nil {
			return fmt.Errorf("nats ensure stream %s: %w", cfg.Name, err)
		}
	}
	return nil
}

func (p *NATSPublisher) PublishTick(ctx context.Context, symbol string, payload []byte) error {
	_, err := p.js.Publish(ctx, TickSubject(symbol), payload)
	return err
}

func (p *NATSPublisher) PublishCandle(ctx context.Context, payload []byte) error {
	_, err := p.js.Publish(ctx, "market.candle", payload)
	return err
}

func (p *NATSPublisher) Ping(_ context.Context) error {
	if !p.nc.IsConnected() {
		return fmt.Errorf("nats: not connected")
	}
	return nil
}

func (p *NATSPublisher) BackendName() string { return "nats" }

// Close drains pending publishes and closes the underlying NATS connection.
func (p *NATSPublisher) Close() error {
	return p.nc.Drain()
}
