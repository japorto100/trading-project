package streaming

import (
	"testing"
	"time"

	"tradeviewfusion/go-backend/internal/contracts"
)

func TestParseTimeframe(t *testing.T) {
	t.Parallel()

	cases := []struct {
		in   string
		want string
	}{
		{"1m", "1m"},
		{"1H", "1H"},
		{"2H", "2H"},
		{"1D", "1D"},
		{"1W", "1W"},
		{"1M", "1M"},
		{"", "1m"},
	}
	for _, tc := range cases {
		tc := tc
		t.Run(tc.in, func(t *testing.T) {
			t.Parallel()
			tf, err := ParseTimeframe(tc.in)
			if err != nil {
				t.Fatalf("unexpected err: %v", err)
			}
			if tf.Label != tc.want {
				t.Fatalf("expected %s, got %s", tc.want, tf.Label)
			}
		})
	}
}

func TestCandleBuilderAggregatesAndOutOfOrder(t *testing.T) {
	t.Parallel()

	builder, err := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 4, MaxOutOfOrderBuckets: 2})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	r1 := builder.ApplyTick(Tick{Timestamp: 65, Last: 100, Volume: 10})
	if !r1.Changed || !r1.WasNewCandle {
		t.Fatalf("expected first tick to create candle, got %+v", r1)
	}
	if r1.Candle.Time != 60 {
		t.Fatalf("expected bucket 60, got %d", r1.Candle.Time)
	}

	r2 := builder.ApplyTick(Tick{Timestamp: 70, Last: 103, Volume: 12})
	if !r2.Changed || r2.WasNewCandle {
		t.Fatalf("expected same candle update, got %+v", r2)
	}
	if r2.Candle.Open != 100 || r2.Candle.High != 103 || r2.Candle.Low != 100 || r2.Candle.Close != 103 {
		t.Fatalf("unexpected candle values: %+v", r2.Candle)
	}
	if r2.Candle.Volume != 12 {
		t.Fatalf("expected monotonic max volume 12, got %f", r2.Candle.Volume)
	}

	r3 := builder.ApplyTick(Tick{Timestamp: 121, Last: 99, Volume: 2})
	if !r3.WasNewCandle || r3.Candle.Time != 120 {
		t.Fatalf("expected new candle at 120, got %+v", r3)
	}

	// Out-of-order patch on previous candle within lookback.
	r4 := builder.ApplyTick(Tick{Timestamp: 80, Last: 98, Volume: 20})
	if !r4.OutOfOrder || !r4.Changed {
		t.Fatalf("expected out-of-order update, got %+v", r4)
	}
	snap := builder.Snapshot(10)
	if len(snap) != 2 {
		t.Fatalf("expected 2 candles, got %d", len(snap))
	}
	if snap[0].Low != 98 {
		t.Fatalf("expected previous candle low to patch to 98, got %f", snap[0].Low)
	}
}

func TestCandleBuilderRingBufferTrim(t *testing.T) {
	t.Parallel()

	builder, err := NewCandleBuilder("1m", CandleBuilderOptions{MaxCandles: 8, MaxOutOfOrderBuckets: 1})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	for i := int64(0); i < 12; i++ {
		res := builder.ApplyTick(Tick{
			Timestamp: i*60 + 1,
			Last:      100 + float64(i),
			Volume:    float64(i),
		})
		if !res.Changed {
			t.Fatalf("expected changed for tick %d", i)
		}
	}
	snap := builder.Snapshot(10)
	if len(snap) != 8 {
		t.Fatalf("expected 8 candles after trim, got %d", len(snap))
	}
	if snap[0].Time != 240 {
		t.Fatalf("expected oldest retained bucket 240, got %d", snap[0].Time)
	}
}

func TestSnapshotStoreClonesState(t *testing.T) {
	t.Parallel()

	store := NewSnapshotStore()
	key := SnapshotKey{Symbol: "BTC/USDT", Exchange: "binance", AssetType: "spot", Timeframe: "1m"}
	quote := contracts.Quote{Symbol: key.Symbol, Exchange: key.Exchange, AssetType: key.AssetType, Last: 123.45, Timestamp: 1700000000}
	store.UpsertQuote(key, quote)
	candle := contracts.Candle{Time: 1700000000, Open: 120, High: 125, Low: 119, Close: 123.45, Volume: 10}
	store.UpsertCandle(key, candle, []contracts.Candle{candle})

	got, ok := store.Get(key)
	if !ok {
		t.Fatalf("expected snapshot")
	}
	if got.Quote == nil || got.Candle == nil {
		t.Fatalf("expected quote and candle in snapshot: %+v", got)
	}
	got.Candles[0].Close = 999
	got2, _ := store.Get(key)
	if got2.Candles[0].Close != 123.45 {
		t.Fatalf("snapshot store leaked internal slice mutation")
	}
}

func TestAlertEngineThresholdAndCrossDedup(t *testing.T) {
	t.Parallel()

	engine := NewAlertEngine()
	rules := []AlertRule{
		{ID: "r1", Symbol: "AAPL", Condition: AlertCrossesUp, Target: 100, Enabled: true, Message: "cross up"},
		{ID: "r2", Symbol: "AAPL", Condition: AlertAbove, Target: 105, Enabled: true},
	}

	events := engine.EvaluateQuote("AAPL", 99, rules, time.Unix(1, 0))
	if len(events) != 0 {
		t.Fatalf("unexpected events on seed price: %+v", events)
	}
	events = engine.EvaluateQuote("AAPL", 106, rules, time.Unix(2, 0))
	if len(events) != 2 {
		t.Fatalf("expected 2 events, got %d", len(events))
	}
	events = engine.EvaluateQuote("AAPL", 107, rules, time.Unix(3, 0))
	if len(events) != 0 {
		t.Fatalf("expected dedup to suppress repeat triggers, got %d", len(events))
	}
}
