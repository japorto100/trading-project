// trend.rs — Moving average family
//
// Migrates from lib.rs:
//   sma, ema, wma, hma, smma, kama, alma, iwma, ols_ma
//
// Phase 20 adds: *_inc() incremental variants for live streaming.
// Phase 20 adds: NaN-fill for warmup period (replaces current zero-fill).
