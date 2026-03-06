package circuitbreaker_test

import (
	"context"
	"errors"
	"testing"

	"tradeviewfusion/go-backend/pkg/circuitbreaker"
)

func TestBreakerClosedPassesThrough(t *testing.T) {
	b := circuitbreaker.New[string](circuitbreaker.Config{FailureThreshold: 3}, nil)
	got, err := b.Execute(context.Background(), func() (string, error) {
		return "ok", nil
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != "ok" {
		t.Fatalf("unexpected result: %s", got)
	}
	if b.State() != "closed" {
		t.Fatalf("expected closed, got %s", b.State())
	}
}

func TestBreakerOpensAfterThreshold(t *testing.T) {
	b := circuitbreaker.New[int](circuitbreaker.Config{FailureThreshold: 2}, nil)
	boom := errors.New("fail")

	for range 2 {
		_, _ = b.Execute(context.Background(), func() (int, error) { return 0, boom })
	}

	if !b.IsOpen() {
		t.Fatal("expected circuit to be open after threshold failures")
	}
	if b.State() != "open" {
		t.Fatalf("expected state=open, got %s", b.State())
	}
}

func TestBreakerCustomHandleIf(t *testing.T) {
	// Only treat result == -1 as failure.
	b := circuitbreaker.New[int](circuitbreaker.Config{FailureThreshold: 2},
		func(r int, err error) bool { return r == -1 })

	for range 2 {
		_, _ = b.Execute(context.Background(), func() (int, error) { return -1, nil })
	}

	if !b.IsOpen() {
		t.Fatal("expected circuit open on custom handleIf")
	}
}
