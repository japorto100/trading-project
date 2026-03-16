// Package payment provides Payment Orchestration Adapter scaffold. Phase 24.3.
package payment

import (
	"context"
	"fmt"
)

type PaymentIntentRequest struct {
	Amount   float64
	Currency string
	Metadata map[string]string
}

type PaymentIntent struct {
	ID     string
	Status string
}

type ReconciliationReport struct {
	Period     string
	Matched    int
	Mismatched int
}

type Adapter interface {
	CreateIntent(ctx context.Context, req PaymentIntentRequest) (*PaymentIntent, error)
	Reconcile(ctx context.Context, period string) (*ReconciliationReport, error)
}

type NoopAdapter struct{}

func (NoopAdapter) CreateIntent(ctx context.Context, req PaymentIntentRequest) (*PaymentIntent, error) {
	_ = ctx
	_ = req
	return nil, fmt.Errorf("payment adapter not configured")
}

func (NoopAdapter) Reconcile(ctx context.Context, period string) (*ReconciliationReport, error) {
	_ = ctx
	_ = period
	return nil, fmt.Errorf("payment adapter not configured")
}
