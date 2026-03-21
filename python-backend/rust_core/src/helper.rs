// helper.rs — Candlestick geometry and lookback helpers.
// Adapted from kand (MIT/Apache-2.0).

use crate::error::{TAError, TAResult};

/// Candlestick real body length: |close - open|
#[inline]
#[must_use]
pub fn real_body(open: f64, close: f64) -> f64 {
    (close - open).abs()
}

/// Upper shadow length: high - max(open, close)
#[inline]
#[must_use]
pub fn upper_shadow(high: f64, open: f64, close: f64) -> f64 {
    high - if close >= open { close } else { open }
}

/// Lower shadow length: min(open, close) - low
#[inline]
#[must_use]
pub fn lower_shadow(low: f64, open: f64, close: f64) -> f64 {
    (if close >= open { open } else { close }) - low
}

/// True if the second candle's real body gaps above the first candle's real body.
#[inline]
#[must_use]
pub fn has_gap_up(open2: f64, close2: f64, open1: f64, close1: f64) -> bool {
    open2.min(close2) > open1.max(close1)
}

/// True if the second candle's real body gaps below the first candle's real body.
#[inline]
#[must_use]
pub fn has_gap_down(open2: f64, close2: f64, open1: f64, close1: f64) -> bool {
    open2.max(close2) < open1.min(close1)
}

/// Number of bars back to the lowest value in a lookback window.
/// Returns 0 if the lowest is at `start_idx` itself.
pub fn lowest_bars(array: &[f64], start_idx: usize, lookback: usize) -> TAResult<usize> {
    if array.is_empty() || start_idx >= array.len() || lookback == 0 || start_idx < lookback - 1 {
        return Err(TAError::InvalidParameter("lowest_bars: invalid index/lookback"));
    }
    let mut lowest = array[start_idx];
    let mut lowest_idx = 0;
    for i in 1..lookback {
        if array[start_idx - i] < lowest {
            lowest = array[start_idx - i];
            lowest_idx = i;
        }
    }
    Ok(lowest_idx)
}

/// Number of bars back to the highest value in a lookback window.
/// Returns 0 if the highest is at `start_idx` itself.
pub fn highest_bars(array: &[f64], start_idx: usize, lookback: usize) -> TAResult<usize> {
    if array.is_empty() || start_idx >= array.len() || lookback == 0 || start_idx < lookback - 1 {
        return Err(TAError::InvalidParameter("highest_bars: invalid index/lookback"));
    }
    let mut highest = array[start_idx];
    let mut highest_idx = 0;
    for i in 1..lookback {
        if array[start_idx - i] > highest {
            highest = array[start_idx - i];
            highest_idx = i;
        }
    }
    Ok(highest_idx)
}

/// EMA smoothing factor: k = 2 / (period + 1)
#[inline]
pub fn period_to_k(period: usize) -> TAResult<f64> {
    if period == 0 {
        return Err(TAError::InvalidParameter("period must be > 0"));
    }
    Ok(2.0 / (period as f64 + 1.0))
}
