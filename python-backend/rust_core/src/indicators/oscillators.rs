// oscillators.rs — Momentum oscillators
//
// Migrates from lib.rs:
//   rsi, macd_components, stochastic, adx_components, wilder_sum, wilder_avg
//
// Phase 20 adds: *_inc() incremental variants.
// Phase 20 adds: NaN-fill for warmup (RSI currently fills 50.0).
