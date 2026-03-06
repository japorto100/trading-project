// Package circuitbreaker provides a generic circuit breaker wrapper around
// github.com/failsafe-go/failsafe-go for use across multiple binaries in pkg/.
// HTTP connectors use failsafe-go directly via failsafehttp.NewRoundTripper;
// this wrapper targets non-HTTP calls (NATS, gRPC, custom exchange adapters).
package circuitbreaker

import (
	"context"
	"fmt"
	"time"

	"github.com/failsafe-go/failsafe-go"
	"github.com/failsafe-go/failsafe-go/circuitbreaker"
)

// Config holds circuit breaker thresholds.
type Config struct {
	// FailureThreshold is the number of consecutive failures before opening.
	// Default: 3.
	FailureThreshold uint
	// Delay is the half-open wait time before a trial call is allowed.
	// Default: 10s.
	Delay time.Duration
}

func (c *Config) withDefaults() Config {
	out := *c
	if out.FailureThreshold == 0 {
		out.FailureThreshold = 3
	}
	if out.Delay <= 0 {
		out.Delay = 10 * time.Second
	}
	return out
}

// Breaker is a typed circuit breaker. R is the result type of the guarded call.
// Create via New; safe for concurrent use.
type Breaker[R any] struct {
	cb circuitbreaker.CircuitBreaker[R]
}

// New creates a Breaker[R]. handleIf returns true for results/errors that count
// as failures (open the circuit). Pass nil to treat any non-nil error as failure.
func New[R any](cfg Config, handleIf func(R, error) bool) *Breaker[R] {
	c := cfg.withDefaults()
	if handleIf == nil {
		handleIf = func(_ R, err error) bool { return err != nil }
	}
	cb := circuitbreaker.NewBuilder[R]().
		HandleIf(handleIf).
		WithFailureThreshold(c.FailureThreshold).
		WithDelay(c.Delay).
		Build()
	return &Breaker[R]{cb: cb}
}

// Execute runs fn through the circuit breaker.
// Returns circuitbreaker.ErrOpen if the circuit is open.
func (b *Breaker[R]) Execute(ctx context.Context, fn func() (R, error)) (R, error) {
	return failsafe.With[R](b.cb).WithContext(ctx).Get(fn)
}

// IsOpen reports whether the circuit is currently open (calls will fail fast).
func (b *Breaker[R]) IsOpen() bool {
	return b.cb.IsOpen()
}

// State returns a human-readable state string: "closed", "open", or "half-open".
func (b *Breaker[R]) State() string {
	switch {
	case b.cb.IsOpen():
		return "open"
	case b.cb.IsHalfOpen():
		return "half-open"
	default:
		return "closed"
	}
}

// ErrOpen is returned when a call is rejected because the circuit is open.
// Callers can use errors.Is(err, circuitbreaker.ErrOpen) from failsafe-go directly,
// or wrap with this sentinel for domain-agnostic error handling.
var ErrOpen = fmt.Errorf("circuit breaker open")
