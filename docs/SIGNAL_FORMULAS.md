# Signal Formulas (P1.2)

This document defines the `Line / Power / Rhythm` calculations used in fusion.

## Scope
- `Line`: SMA50 state + cross events
- `Power`: RVOL, OBV, CMF
- `Rhythm`: ZigZag-style cycle stability score

## Line

### SMA (Simple Moving Average)
- Formula:
  - `SMA_n(t) = (close_t + close_(t-1) + ... + close_(t-n+1)) / n`
- Implementation:
  - `src/lib/indicators/index.ts` -> `calculateSMA(...)`

### SMA Cross Events
- `cross_up`: previous close `<` previous SMA and current close `>=` current SMA
- `cross_down`: previous close `>` previous SMA and current close `<=` current SMA
- Implementation:
  - `src/lib/indicators/index.ts` -> `detectSMACrossEvents(...)`
  - `src/lib/indicators/index.ts` -> `getSMACrossAlertTemplates(...)`

## Power

### VWMA (Volume Weighted Moving Average)
- Formula:
  - `VWMA_n(t) = sum(close_i * volume_i) / sum(volume_i)` over `i = t-n+1 ... t`
- Interpretation:
  - Acts like an MA that gives more weight to bars with high participation.
- Implementation:
  - `src/lib/indicators/index.ts` -> `calculateVWMA(...)`

### RVOL (Relative Volume)
- Formula:
  - `RVOL_n(t) = volume_t / average(volume_t ... volume_(t-n+1))`
- Interpretation:
  - `> 1`: above-average activity
  - `< 1`: below-average activity
- Implementation:
  - `src/lib/indicators/index.ts` -> `calculateRVOL(...)`

### OBV (On-Balance Volume)
- Formula:
  - start `OBV_0 = 0`
  - if `close_t > close_(t-1)`, then `OBV_t = OBV_(t-1) + volume_t`
  - if `close_t < close_(t-1)`, then `OBV_t = OBV_(t-1) - volume_t`
  - else `OBV_t = OBV_(t-1)`
- Implementation:
  - `src/lib/indicators/index.ts` -> `calculateOBV(...)`

### CMF (Chaikin Money Flow)
- Money Flow Multiplier:
  - `MFM_t = ((close_t - low_t) - (high_t - close_t)) / (high_t - low_t)`
- Money Flow Volume:
  - `MFV_t = MFM_t * volume_t`
- CMF:
  - `CMF_n(t) = sum(MFV_t ... MFV_(t-n+1)) / sum(volume_t ... volume_(t-n+1))`
- Implementation:
  - `src/lib/indicators/index.ts` -> `calculateCMF(...)`

## Rhythm

### Heartbeat Cycle Score (experimental)
- Approach:
  - Detect alternating pivot points (ZigZag-like) above a minimum move threshold.
  - Build swing intervals and amplitudes.
  - Compute coefficient of variation (CV) for interval and amplitude.
- Stability:
  - `periodStability = max(0, 1 - CV(intervals))`
  - `amplitudeStability = max(0, 1 - CV(amplitudes))`
  - `score = clamp((periodStability + amplitudeStability) / 2, 0, 1)`
- Output:
  - `score`, `cycleBars`, `swings`, `amplitudeStability`, `periodStability`
- Implementation:
  - `src/lib/indicators/index.ts` -> `analyzeHeartbeatPattern(...)`

## Volatility Channel

### SMA +/- ATR Channel
- Formula:
  - `middle_t = SMA_smaPeriod(close)_t`
  - `width_t = ATR_atrPeriod(t) * multiplier`
  - `upper_t = middle_t + width_t`
  - `lower_t = middle_t - width_t`
- Interpretation:
  - Defines a volatility-aware envelope around the trend line.
  - Useful for rhythm/touch analysis around a moving baseline.
- Implementation:
  - `src/lib/indicators/index.ts` -> `calculateSMAATRChannel(...)`

## UI Binding
- Signal strip rendering:
  - `src/features/trading/SignalInsightsBar.tsx`
- Data selection and per-symbol/per-timeframe updates:
  - `src/app/page.tsx` (`signalSnapshot` memo based on `candleData`)
