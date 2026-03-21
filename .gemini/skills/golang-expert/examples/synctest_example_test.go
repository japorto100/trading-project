package examples

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"testing/synctest"
	"time"
)

func retryOnce(ctx context.Context, attempts *atomic.Int32) error {
	attempts.Add(1)
	select {
	case <-time.After(30 * time.Second):
		return errors.New("retry timeout")
	case <-ctx.Done():
		return ctx.Err()
	}
}

func TestRetryWithoutRealSleep(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var attempts atomic.Int32
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		go func() {
			_ = retryOnce(ctx, &attempts)
		}()

		synctest.Wait()
		time.Sleep(30 * time.Second)
		synctest.Wait()

		if attempts.Load() != 1 {
			t.Fatalf("got %d attempts, want 1", attempts.Load())
		}
	})
}
