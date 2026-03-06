package streaming

import (
	"math"
	"testing"
)

// vwap computes Volume-Weighted Average Price from a tick batch.
// Scalar baseline for future GOEXPERIMENT=simd comparison (P4.3).
func vwap(ticks []Tick) float64 {
	var sumPV, sumV float64
	for i := range ticks {
		price := normalizeTickPrice(ticks[i])
		vol := normalizeNonNegative(ticks[i].Volume)
		sumPV += price * vol
		sumV += vol
	}
	if sumV == 0 {
		return math.NaN()
	}
	return sumPV / sumV
}

// BenchmarkVWAP — scalar VWAP over 100 ticks (P4.2 baseline for SIMD eval).
func BenchmarkVWAP(b *testing.B) {
	ticks := make([]Tick, 100)
	for i := range ticks {
		ticks[i] = Tick{Last: float64(100 + i%10), Volume: float64(1 + i%5)}
	}
	b.ResetTimer()
	for range b.N {
		_ = vwap(ticks)
	}
}

// BenchmarkVWAPBatch — scalar VWAP over 1000 ticks: shows scaling behaviour.
func BenchmarkVWAPBatch(b *testing.B) {
	ticks := make([]Tick, 1000)
	for i := range ticks {
		ticks[i] = Tick{Last: float64(100 + i%10), Volume: float64(1 + i%5)}
	}
	b.ResetTimer()
	for range b.N {
		_ = vwap(ticks)
	}
}

// BenchmarkApplyTick measures single-threaded throughput of the OHLCV hot path.
func BenchmarkApplyTick(b *testing.B) {
	builder, _ := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 1024})
	b.ResetTimer()
	for i := range b.N {
		builder.ApplyTick(Tick{Timestamp: int64(i%60) + 1, Last: 100.5})
	}
}

// BenchmarkApplyTickParallel exposes lock contention under concurrent writers.
// If parallel throughput degrades by > 2× vs single-thread → evaluate shard-lock or sync.Map.
func BenchmarkApplyTickParallel(b *testing.B) {
	builder, _ := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 1024})
	b.RunParallel(func(pb *testing.PB) {
		i := int64(0)
		for pb.Next() {
			builder.ApplyTick(Tick{Timestamp: i%60 + 1, Last: 100.5})
			i++
		}
	})
}

// BenchmarkSnapshot measures the read path (RLock) across 100 pre-loaded candles.
func BenchmarkSnapshot(b *testing.B) {
	builder, _ := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 1024})
	for i := range 100 {
		builder.ApplyTick(Tick{Timestamp: int64(i)*60 + 1, Last: float64(100 + i)})
	}
	b.ResetTimer()
	for range b.N {
		_ = builder.Snapshot(100)
	}
}
