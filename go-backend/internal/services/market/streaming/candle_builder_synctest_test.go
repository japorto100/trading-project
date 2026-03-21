package streaming

import (
	"sync"
	"testing"
	"testing/synctest"
)

// TestCandleBuilderConcurrentWrites verifies that N goroutines writing to distinct
// buckets concurrently produce exactly N candles with no data races.
// MaxOutOfOrderBuckets=16 ensures all buckets are accepted regardless of goroutine
// scheduling order.
func TestCandleBuilderConcurrentWrites(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		builder, err := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 16, MaxOutOfOrderBuckets: 16})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		var wg sync.WaitGroup
		for i := range 8 {
			bucket := int64(i)
			wg.Go(func() {
				builder.ApplyTick(Tick{Timestamp: bucket*60 + 1, Last: float64(100 + bucket)})
			})
		}
		synctest.Wait() // all goroutines in the bubble are idle (done or durably blocked)
		wg.Wait()
		snap := builder.Snapshot(16)
		if len(snap) != 8 {
			t.Fatalf("expected 8 candles, got %d", len(snap))
		}
	})
}

// TestCandleBuilderConcurrentReadsDuringWrite verifies snapshot isolation under
// concurrent writer + reader goroutines. Mutations to a returned snapshot slice
// must not affect the builder's internal state.
func TestCandleBuilderConcurrentReadsDuringWrite(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		builder, err := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 16, MaxOutOfOrderBuckets: 8})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		// Pre-populate 4 candles so readers always have data.
		for i := range 4 {
			builder.ApplyTick(Tick{Timestamp: int64(i*60 + 1), Last: float64(100 + i)})
		}
		var wg sync.WaitGroup
		// concurrent writer: appends 4 more sequential candles
		wg.Go(func() {
			for i := range 4 {
				bucket := int64(i + 4)
				builder.ApplyTick(Tick{Timestamp: bucket*60 + 1, Last: float64(100 + bucket)})
			}
		})
		// concurrent readers: mutate returned snapshots to probe isolation
		for range 4 {
			wg.Go(func() {
				snap := builder.Snapshot(16)
				for j := range snap {
					snap[j].Close = 999 // mutate copy — must not affect builder
				}
				_, _ = builder.Latest()
			})
		}
		synctest.Wait()
		wg.Wait()
		// snapshot isolation: internal state must not carry reader mutations
		final := builder.Snapshot(16)
		for _, c := range final {
			if c.Close == 999 {
				t.Fatal("snapshot isolation violated: internal state mutated via returned slice")
			}
		}
	})
}
