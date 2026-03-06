package messaging_test

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/internal/messaging"
)

// TestInterfaceCheck verifies NoopPublisher satisfies Publisher at compile time.
func TestInterfaceCheck(t *testing.T) {
	var _ messaging.Publisher = messaging.NoopPublisher{}
}

// TestNoopPing verifies Ping always returns nil for the noop.
func TestNoopPing(t *testing.T) {
	p := messaging.NoopPublisher{}
	if err := p.Ping(context.Background()); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

// TestNoopBackendName verifies the backend name is "noop".
func TestNoopBackendName(t *testing.T) {
	p := messaging.NoopPublisher{}
	if got := p.BackendName(); got != "noop" {
		t.Fatalf("expected 'noop', got %q", got)
	}
}

// TestTopicFormat verifies subject format for tick and candle subjects.
func TestTopicFormat(t *testing.T) {
	cases := []struct {
		name string
		got  string
		want string
	}{
		{"TickSubject slash", messaging.TickSubject("BTC/USDT"), "market.BTC-USDT.tick"},
		{"CandleSubject slash+tf", messaging.CandleSubject("ETH/USDT", "1m"), "market.candle.ETH-USDT.1m"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.got != tc.want {
				t.Fatalf("got %q, want %q", tc.got, tc.want)
			}
		})
	}
}
