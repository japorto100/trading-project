package duplex

import (
	"context"
	"errors"
)

// NoopAdapter implements ExchangeAdapter with all methods returning safe zero values.
// Use as the default in tests and when no real adapter is configured.
type NoopAdapter struct{}

var errNoopAdapter = errors.New("noop: no adapter configured")

// Subscribe returns an already-closed channel — no events will be emitted.
func (NoopAdapter) Subscribe(_ context.Context, _ string) (<-chan StreamEvent, error) {
	ch := make(chan StreamEvent)
	close(ch)
	return ch, nil
}

func (NoopAdapter) SubmitOrder(_ context.Context, _ OrderRequest) (OrderResponse, error) {
	return OrderResponse{}, errNoopAdapter
}

func (NoopAdapter) CancelOrder(_ context.Context, _ string) error {
	return errNoopAdapter
}

func (NoopAdapter) GetBalance(_ context.Context, _ string) (float64, error) {
	return 0, errNoopAdapter
}

func (NoopAdapter) Capabilities() AdapterCapabilities {
	return AdapterCapabilities{}
}

func (NoopAdapter) Close() error {
	return nil
}
