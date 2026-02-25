package base

import (
	"context"
	"sync"
	"time"
)

type simpleRateLimiter struct {
	mu       sync.Mutex
	interval time.Duration
	nextAt   time.Time
}

func newSimpleRateLimiter(ratePerSecond float64) *simpleRateLimiter {
	if ratePerSecond <= 0 {
		return nil
	}
	interval := time.Duration(float64(time.Second) / ratePerSecond)
	if interval <= 0 {
		interval = time.Millisecond
	}
	return &simpleRateLimiter{interval: interval}
}

func (l *simpleRateLimiter) Wait(ctx context.Context) error {
	if l == nil {
		return nil
	}

	for {
		l.mu.Lock()
		now := time.Now()
		if l.nextAt.IsZero() || !now.Before(l.nextAt) {
			l.nextAt = now.Add(l.interval)
			l.mu.Unlock()
			return nil
		}
		waitFor := time.Until(l.nextAt)
		l.mu.Unlock()

		timer := time.NewTimer(waitFor)
		select {
		case <-ctx.Done():
			if !timer.Stop() {
				<-timer.C
			}
			return ctx.Err()
		case <-timer.C:
		}
	}
}
