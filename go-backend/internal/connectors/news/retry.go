package news

import (
	"context"
	"time"
)

func backoffDuration(attempt int) time.Duration {
	if attempt < 1 {
		attempt = 1
	}
	return time.Duration(attempt) * 120 * time.Millisecond
}

func sleepWithContext(ctx context.Context, duration time.Duration) bool {
	timer := time.NewTimer(duration)
	defer timer.Stop()

	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}
