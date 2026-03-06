package duplex_test

import (
	"context"
	"testing"

	"tradeviewfusion/go-backend/pkg/duplex"
)

// TestInterfaceCompileCheck verifies NoopAdapter satisfies ExchangeAdapter at compile time.
func TestInterfaceCompileCheck(t *testing.T) {
	var _ duplex.ExchangeAdapter = duplex.NoopAdapter{}
}

// TestNoopSubscribeClosesChannel verifies Subscribe returns an immediately-closed channel.
func TestNoopSubscribeClosesChannel(t *testing.T) {
	adapter := duplex.NoopAdapter{}
	ch, err := adapter.Subscribe(context.Background(), "BTC/USDT")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	_, ok := <-ch
	if ok {
		t.Fatal("expected closed channel, got open channel")
	}
}

// TestNoopCapabilitiesAllFalse verifies all capabilities are false for the noop.
func TestNoopCapabilitiesAllFalse(t *testing.T) {
	caps := duplex.NoopAdapter{}.Capabilities()
	if caps.LiveStream || caps.OrderSubmit || caps.MarginTrading || caps.Futures {
		t.Fatal("expected all capabilities false for NoopAdapter")
	}
}
