package streaming

import (
	"math"
	"slices"
	"sync"

	"tradeviewfusion/go-backend/internal/contracts"
)

type Tick struct {
	Symbol    string
	Exchange  string
	AssetType string
	Source    string
	Timestamp int64
	Last      float64
	Bid       float64
	Ask       float64
	High      float64
	Low       float64
	Volume    float64
}

type CandleApplyResult struct {
	Candle       contracts.Candle
	Changed      bool
	OutOfOrder   bool
	Dropped      bool
	WasNewCandle bool
}

type CandleBuilderOptions struct {
	MaxCandles           int
	MaxOutOfOrderBuckets int
}

type CandleBuilder struct {
	mu                   sync.RWMutex
	timeframe            Timeframe
	maxCandles           int
	maxOutOfOrderBuckets int64
	candles              []contracts.Candle
}

func NewCandleBuilder(timeframe string, opts CandleBuilderOptions) (*CandleBuilder, error) {
	tf, err := ParseTimeframe(timeframe)
	if err != nil {
		return nil, err
	}
	maxCandles := opts.MaxCandles
	if maxCandles < 8 {
		maxCandles = 256
	}
	maxOoo := opts.MaxOutOfOrderBuckets
	if maxOoo < 0 {
		maxOoo = 0
	}
	if maxOoo == 0 {
		maxOoo = 2
	}
	return &CandleBuilder{
		timeframe:            tf,
		maxCandles:           maxCandles,
		maxOutOfOrderBuckets: int64(maxOoo),
		candles:              make([]contracts.Candle, 0, maxCandles),
	}, nil
}

func (b *CandleBuilder) Timeframe() string {
	return b.timeframe.Label
}

func (b *CandleBuilder) ApplyTick(tick Tick) CandleApplyResult {
	price := normalizeTickPrice(tick)
	if !isFinitePositive(price) || tick.Timestamp <= 0 {
		return CandleApplyResult{Dropped: true}
	}
	bucket := BucketStartUnix(tick.Timestamp, b.timeframe)
	volume := normalizeNonNegative(tick.Volume)

	b.mu.Lock()
	defer b.mu.Unlock()

	if len(b.candles) == 0 {
		c := newCandle(bucket, price, volume)
		b.candles = append(b.candles, c)
		return CandleApplyResult{Candle: c, Changed: true, WasNewCandle: true}
	}

	latest := b.candles[len(b.candles)-1]
	if bucket < latest.Time {
		earliestAllowed := latest.Time - b.maxOutOfOrderBuckets*b.timeframe.Seconds()
		if bucket < earliestAllowed {
			return CandleApplyResult{Dropped: true, OutOfOrder: true}
		}
		for i := len(b.candles) - 1; i >= 0; i-- {
			if b.candles[i].Time == bucket {
				changed := updateCandle(&b.candles[i], price, volume)
				return CandleApplyResult{
					Candle:     b.candles[i],
					Changed:    changed,
					OutOfOrder: true,
				}
			}
			if b.candles[i].Time < bucket {
				c := newCandle(bucket, price, volume)
				b.candles = slices.Insert(b.candles, i+1, c)
				b.trimLocked()
				return CandleApplyResult{
					Candle:       c,
					Changed:      true,
					OutOfOrder:   true,
					WasNewCandle: true,
				}
			}
		}
		c := newCandle(bucket, price, volume)
		b.candles = slices.Insert(b.candles, 0, c)
		b.trimLocked()
		return CandleApplyResult{
			Candle:       c,
			Changed:      true,
			OutOfOrder:   true,
			WasNewCandle: true,
		}
	}

	if bucket == latest.Time {
		idx := len(b.candles) - 1
		changed := updateCandle(&b.candles[idx], price, volume)
		return CandleApplyResult{Candle: b.candles[idx], Changed: changed}
	}

	c := newCandle(bucket, price, volume)
	b.candles = append(b.candles, c)
	b.trimLocked()
	return CandleApplyResult{Candle: c, Changed: true, WasNewCandle: true}
}

func (b *CandleBuilder) Latest() (contracts.Candle, bool) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	if len(b.candles) == 0 {
		return contracts.Candle{}, false
	}
	return b.candles[len(b.candles)-1], true
}

func (b *CandleBuilder) Snapshot(limit int) []contracts.Candle {
	b.mu.RLock()
	defer b.mu.RUnlock()
	if len(b.candles) == 0 {
		return nil
	}
	if limit <= 0 || limit >= len(b.candles) {
		out := make([]contracts.Candle, len(b.candles))
		copy(out, b.candles)
		return out
	}
	start := len(b.candles) - limit
	out := make([]contracts.Candle, len(b.candles[start:]))
	copy(out, b.candles[start:])
	return out
}

func (b *CandleBuilder) trimLocked() {
	if len(b.candles) <= b.maxCandles {
		return
	}
	excess := len(b.candles) - b.maxCandles
	b.candles = slices.Clone(b.candles[excess:])
}

func newCandle(bucket int64, price float64, volume float64) contracts.Candle {
	return contracts.Candle{
		Time:   bucket,
		Open:   price,
		High:   price,
		Low:    price,
		Close:  price,
		Volume: volume,
	}
}

func updateCandle(c *contracts.Candle, price float64, volume float64) bool {
	before := *c
	if price > c.High {
		c.High = price
	}
	if price < c.Low {
		c.Low = price
	}
	c.Close = price
	// Transitional volume policy: many upstreams expose cumulative session volume, so use monotonic max.
	if volume > c.Volume {
		c.Volume = volume
	}
	return before != *c
}

func normalizeTickPrice(tick Tick) float64 {
	if isFinitePositive(tick.Last) {
		return tick.Last
	}
	if isFinitePositive(tick.Bid) && isFinitePositive(tick.Ask) {
		return (tick.Bid + tick.Ask) / 2
	}
	if isFinitePositive(tick.Bid) {
		return tick.Bid
	}
	if isFinitePositive(tick.Ask) {
		return tick.Ask
	}
	return 0
}

func isFinitePositive(value float64) bool {
	return value > 0 && !math.IsNaN(value) && !math.IsInf(value, 0)
}

func normalizeNonNegative(value float64) float64 {
	if math.IsNaN(value) || math.IsInf(value, 0) || value < 0 {
		return 0
	}
	return value
}
