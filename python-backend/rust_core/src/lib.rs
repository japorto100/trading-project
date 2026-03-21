use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use std::collections::HashMap;

pub mod error;
pub mod helper;
mod config; // Phase 20 stub — Rust Compute Service config
mod ohlcv_cache;

fn sma(values: &[f64], period: usize) -> Vec<f64> {
    if values.is_empty() {
        return Vec::new();
    }
    if period <= 1 {
        return values.to_vec();
    }

    let mut out = Vec::with_capacity(values.len());
    let mut running = 0.0_f64;
    for (i, value) in values.iter().enumerate() {
        running += *value;
        if i >= period {
            running -= values[i - period];
        }
        let window = period.min(i + 1) as f64;
        out.push(running / window);
    }
    out
}

fn ema(values: &[f64], period: usize) -> Vec<f64> {
    if values.is_empty() {
        return Vec::new();
    }
    let alpha = 2.0 / (period as f64 + 1.0);
    let mut out = Vec::with_capacity(values.len());
    out.push(values[0]);
    for value in &values[1..] {
        let prev = *out.last().unwrap();
        out.push(alpha * value + (1.0 - alpha) * prev);
    }
    out
}

fn rsi(values: &[f64], period: usize) -> Vec<f64> {
    // F2: Wilder RSI warmup — SMA for first `period` changes, then Wilder smoothing
    if values.len() < 2 {
        return vec![50.0; values.len()];
    }
    let mut gains = vec![0.0_f64];
    let mut losses = vec![0.0_f64];
    for i in 1..values.len() {
        let delta = values[i] - values[i - 1];
        gains.push(if delta > 0.0 { delta } else { 0.0 });
        losses.push(if delta < 0.0 { -delta } else { 0.0 });
    }
    let n = gains.len();
    let mut out = vec![50.0_f64; n];
    if n <= period {
        return out;
    }
    // SMA warmup: average of first `period` changes (indices 1..=period)
    let mut avg_gain: f64 = gains[1..=period].iter().sum::<f64>() / period as f64;
    let mut avg_loss: f64 = losses[1..=period].iter().sum::<f64>() / period as f64;
    out[period] = if avg_loss == 0.0 {
        100.0
    } else {
        100.0 - 100.0 / (1.0 + avg_gain / avg_loss)
    };
    // Wilder smoothing for the rest
    let p = period as f64;
    for i in (period + 1)..n {
        avg_gain = (avg_gain * (p - 1.0) + gains[i]) / p;
        avg_loss = (avg_loss * (p - 1.0) + losses[i]) / p;
        out[i] = if avg_loss == 0.0 {
            100.0
        } else {
            100.0 - 100.0 / (1.0 + avg_gain / avg_loss)
        };
    }
    out
}

fn atr(highs: &[f64], lows: &[f64], closes: &[f64], period: usize) -> Vec<f64> {
    if closes.len() < 2 {
        return vec![0.0; closes.len()];
    }
    let mut tr = vec![0.0_f64];
    for i in 1..closes.len() {
        let h = highs[i];
        let l = lows[i];
        let prev_c = closes[i - 1];
        tr.push(f64::max(
            h - l,
            f64::max((h - prev_c).abs(), (l - prev_c).abs()),
        ));
    }
    // F1: Wilder ATR — EMA with alpha=1/period (span = 2*period-1)
    ema(&tr, period * 2 - 1)
}

fn sample_std(values: &[f64]) -> f64 {
    // F3: sample std-dev (/ n-1) — matches pandas rolling.std() used in book formulas
    let n = values.len();
    if n < 2 {
        return 0.0;
    }
    let mean = values.iter().sum::<f64>() / n as f64;
    let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / (n as f64 - 1.0);
    variance.sqrt()
}

fn bb_bandwidth(values: &[f64], period: usize, num_std: f64) -> Vec<f64> {
    let len = values.len();
    let mut out = Vec::with_capacity(len);
    for i in 0..len {
        let start = (i + 1).saturating_sub(period);
        let window = &values[start..=i];
        let n = window.len() as f64;
        let mid = window.iter().sum::<f64>() / n;
        let std = sample_std(window);
        let upper = mid + num_std * std;
        let lower = mid - num_std * std;
        out.push(if mid != 0.0 {
            (upper - lower) / mid
        } else {
            0.0
        });
    }
    out
}

fn bb_percent_b(values: &[f64], period: usize, num_std: f64) -> Vec<f64> {
    let len = values.len();
    let mut out = Vec::with_capacity(len);
    for i in 0..len {
        let start = (i + 1).saturating_sub(period);
        let window = &values[start..=i];
        let n = window.len() as f64;
        let mid = window.iter().sum::<f64>() / n;
        let std = sample_std(window);
        let upper = mid + num_std * std;
        let lower = mid - num_std * std;
        let bw = upper - lower;
        out.push(if bw != 0.0 {
            (values[i] - lower) / bw
        } else {
            0.5
        });
    }
    out
}

fn wma(values: &[f64], period: usize) -> Vec<f64> {
    if values.is_empty() {
        return Vec::new();
    }
    if period <= 1 {
        return values.to_vec();
    }
    let mut out = Vec::with_capacity(values.len());
    for i in 0..values.len() {
        let start = (i + 1).saturating_sub(period);
        let window = &values[start..=i];
        let w = window.len();
        let denom = (w * (w + 1)) as f64 / 2.0;
        let total: f64 = window.iter().enumerate().map(|(j, v)| (j + 1) as f64 * v).sum();
        out.push(total / denom);
    }
    out
}

fn hma(values: &[f64], period: usize) -> Vec<f64> {
    if values.len() < period {
        return values.to_vec();
    }
    let half = ((period as f64 / 2.0).round() as usize).max(1);
    let sqrt_p = ((period as f64).sqrt().round() as usize).max(1);
    let wma_half = wma(values, half);
    let wma_full = wma(values, period);
    let diff: Vec<f64> = wma_half
        .iter()
        .zip(wma_full.iter())
        .map(|(h, f)| 2.0 * h - f)
        .collect();
    wma(&diff, sqrt_p)
}

fn macd_components(
    closes: &[f64],
    fast: usize,
    slow: usize,
    signal: usize,
) -> (Vec<f64>, Vec<f64>, Vec<f64>) {
    let ema_fast = ema(closes, fast);
    let ema_slow = ema(closes, slow);
    let macd_line: Vec<f64> = ema_fast
        .iter()
        .zip(ema_slow.iter())
        .map(|(f, s)| f - s)
        .collect();
    let signal_line = ema(&macd_line, signal);
    let hist: Vec<f64> = macd_line
        .iter()
        .zip(signal_line.iter())
        .map(|(m, s)| m - s)
        .collect();
    (macd_line, signal_line, hist)
}

fn stochastic(
    highs: &[f64],
    lows: &[f64],
    closes: &[f64],
    k_period: usize,
    d_period: usize,
) -> (Vec<f64>, Vec<f64>) {
    let n = closes.len();
    let mut k_vals = Vec::with_capacity(n);
    for i in 0..n {
        let start = (i + 1).saturating_sub(k_period);
        let highest_high = highs[start..=i]
            .iter()
            .cloned()
            .fold(f64::NEG_INFINITY, f64::max);
        let lowest_low = lows[start..=i]
            .iter()
            .cloned()
            .fold(f64::INFINITY, f64::min);
        let denom = highest_high - lowest_low;
        let k = if denom < 1e-9 {
            50.0
        } else {
            (closes[i] - lowest_low) / denom * 100.0
        };
        k_vals.push(k);
    }
    let d_vals = sma(&k_vals, d_period);
    (k_vals, d_vals)
}

fn wilder_sum(vals: &[f64], period: usize) -> Vec<f64> {
    let n = vals.len();
    if n < period {
        return vec![0.0; n];
    }
    let mut result = vec![0.0_f64; period - 1];
    let init: f64 = vals[..period].iter().sum();
    result.push(init);
    for i in period..n {
        let prev = *result.last().unwrap();
        result.push(prev - prev / period as f64 + vals[i]);
    }
    result
}

fn wilder_avg(vals: &[f64], period: usize) -> Vec<f64> {
    let n = vals.len();
    if n < period {
        return vec![0.0; n];
    }
    let mut result = vec![0.0_f64; period - 1];
    let init: f64 = vals[..period].iter().sum::<f64>() / period as f64;
    result.push(init);
    for i in period..n {
        let prev = *result.last().unwrap();
        result.push(prev - prev / period as f64 + vals[i] / period as f64);
    }
    result
}

fn adx_components(
    highs: &[f64],
    lows: &[f64],
    closes: &[f64],
    period: usize,
) -> (Vec<f64>, Vec<f64>, Vec<f64>) {
    let n = closes.len();
    if n < 2 {
        return (vec![0.0; n], vec![0.0; n], vec![0.0; n]);
    }
    let mut tr = vec![0.0_f64];
    let mut dm_plus = vec![0.0_f64];
    let mut dm_minus = vec![0.0_f64];
    for i in 1..n {
        let h = highs[i];
        let l = lows[i];
        let prev_c = closes[i - 1];
        let prev_h = highs[i - 1];
        let prev_l = lows[i - 1];
        tr.push(f64::max(
            h - l,
            f64::max((h - prev_c).abs(), (l - prev_c).abs()),
        ));
        let up_move = h - prev_h;
        let down_move = prev_l - l;
        dm_plus.push(if up_move > down_move && up_move > 0.0 { up_move } else { 0.0 });
        dm_minus.push(if down_move > up_move && down_move > 0.0 { down_move } else { 0.0 });
    }
    let s_tr = wilder_sum(&tr, period);
    let s_dmp = wilder_sum(&dm_plus, period);
    let s_dmm = wilder_sum(&dm_minus, period);
    let mut di_plus = Vec::with_capacity(n);
    let mut di_minus = Vec::with_capacity(n);
    let mut dx = Vec::with_capacity(n);
    for i in 0..n {
        let tr_v = s_tr[i];
        let dip = if tr_v > 1e-9 { 100.0 * s_dmp[i] / tr_v } else { 0.0 };
        let dim = if tr_v > 1e-9 { 100.0 * s_dmm[i] / tr_v } else { 0.0 };
        di_plus.push(dip);
        di_minus.push(dim);
        let di_sum = dip + dim;
        dx.push(if di_sum > 1e-9 { 100.0 * (dip - dim).abs() / di_sum } else { 0.0 });
    }
    let adx_vals = wilder_avg(&dx, period);
    (adx_vals, di_plus, di_minus)
}

// ---------------------------------------------------------------------------
// F4: New MA types — SMMA, KAMA, ALMA, IWMA, OLS-MA, Ichimoku
// ---------------------------------------------------------------------------

fn smma(values: &[f64], period: usize) -> Vec<f64> {
    // SMMA = Wilder smoothing: alpha=1/period = EMA with span=2*period-1
    if period == 0 {
        return values.to_vec();
    }
    ema(values, 2 * period - 1)
}

fn kama(values: &[f64], period: usize, fast: usize, slow: usize) -> Vec<f64> {
    // Kaufman Adaptive MA
    if values.is_empty() {
        return Vec::new();
    }
    let fast_sc = 2.0 / (fast as f64 + 1.0);
    let slow_sc = 2.0 / (slow as f64 + 1.0);
    let n = values.len();
    let mut out = vec![values[0]; n];
    for i in period..n {
        let direction = (values[i] - values[i - period]).abs();
        let volatility: f64 = (i - period + 1..=i).map(|k| (values[k] - values[k - 1]).abs()).sum();
        let er = if volatility < 1e-10 { 0.0 } else { direction / volatility };
        let sc = (er * (fast_sc - slow_sc) + slow_sc).powi(2);
        out[i] = out[i - 1] + sc * (values[i] - out[i - 1]);
    }
    out
}

fn alma(values: &[f64], period: usize, offset: f64, sigma: f64) -> Vec<f64> {
    // Arnaud Legoux MA — Gaussian-weighted MA
    if values.is_empty() || period == 0 {
        return Vec::new();
    }
    let m = (offset * (period as f64 - 1.0)) as usize;
    let s = period as f64 / sigma;
    let weights: Vec<f64> = (0..period)
        .map(|i| {
            let diff = i as f64 - m as f64;
            (-(diff * diff) / (2.0 * s * s)).exp()
        })
        .collect();
    let wsum: f64 = weights.iter().sum();
    let n = values.len();
    let mut out = vec![0.0_f64; n];
    for i in (period - 1)..n {
        let window = &values[i + 1 - period..=i];
        out[i] = weights.iter().zip(window.iter()).map(|(w, v)| w * v).sum::<f64>() / wsum;
    }
    out
}

fn iwma(values: &[f64], period: usize) -> Vec<f64> {
    // Inverse Weighted MA — oldest bar gets weight 1/period, newest gets 1/1
    if values.is_empty() || period == 0 {
        return Vec::new();
    }
    let weights: Vec<f64> = (0..period).map(|j| 1.0 / (period - j) as f64).collect();
    let wsum: f64 = weights.iter().sum();
    let n = values.len();
    let mut out = vec![0.0_f64; n];
    for i in (period - 1)..n {
        let window = &values[i + 1 - period..=i];
        out[i] = weights.iter().zip(window.iter()).map(|(w, v)| w * v).sum::<f64>() / wsum;
    }
    out
}

fn ols_ma(values: &[f64], period: usize) -> Vec<f64> {
    // OLS Linear Regression fitted value at last bar of each window
    if values.is_empty() || period == 0 {
        return Vec::new();
    }
    let n = values.len();
    let mut out = vec![0.0_f64; n];
    for i in (period - 1)..n {
        let window = &values[i + 1 - period..=i];
        let w = window.len() as f64;
        let x_mean = (w - 1.0) / 2.0;
        let y_mean = window.iter().sum::<f64>() / w;
        let mut num = 0.0_f64;
        let mut den = 0.0_f64;
        for (j, y) in window.iter().enumerate() {
            let xj = j as f64;
            num += (xj - x_mean) * (y - y_mean);
            den += (xj - x_mean).powi(2);
        }
        let slope = if den < 1e-10 { 0.0 } else { num / den };
        let intercept = y_mean - slope * x_mean;
        out[i] = intercept + slope * (w - 1.0);
    }
    out
}

fn ichimoku_series(
    highs: &[f64],
    lows: &[f64],
    closes: &[f64],
) -> (Vec<f64>, Vec<f64>, Vec<f64>, Vec<f64>, Vec<f64>) {
    // Ichimoku: Tenkan(9), Kijun(26), Span A=(T+K)/2, Span B midpoint(52), Chikou=close
    let n = closes.len();
    let mut tenkan = vec![0.0_f64; n];
    let mut kijun = vec![0.0_f64; n];
    let mut span_a = vec![0.0_f64; n];
    let mut span_b = vec![0.0_f64; n];
    let chikou = closes.to_vec();
    for i in 0..n {
        let t_s = i.saturating_sub(8);
        let t_hh = highs[t_s..=i].iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        let t_ll = lows[t_s..=i].iter().cloned().fold(f64::INFINITY, f64::min);
        tenkan[i] = (t_hh + t_ll) / 2.0;

        let k_s = i.saturating_sub(25);
        let k_hh = highs[k_s..=i].iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        let k_ll = lows[k_s..=i].iter().cloned().fold(f64::INFINITY, f64::min);
        kijun[i] = (k_hh + k_ll) / 2.0;

        span_a[i] = (tenkan[i] + kijun[i]) / 2.0;

        let sb_s = i.saturating_sub(51);
        let sb_hh = highs[sb_s..=i].iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        let sb_ll = lows[sb_s..=i].iter().cloned().fold(f64::INFINITY, f64::min);
        span_b[i] = (sb_hh + sb_ll) / 2.0;
    }
    (tenkan, kijun, span_a, span_b, chikou)
}

// ---------------------------------------------------------------------------
// F5: New oscillators / volume indicators — VWAP, Keltner, OBV, CMF
// ---------------------------------------------------------------------------

fn vwap_series(highs: &[f64], lows: &[f64], closes: &[f64], volumes: &[f64]) -> Vec<f64> {
    // Session VWAP: cumulative(typical_price * vol) / cumulative(vol)
    let n = closes.len();
    let mut out = Vec::with_capacity(n);
    let mut cum_tp_vol = 0.0_f64;
    let mut cum_vol = 0.0_f64;
    for i in 0..n {
        let tp = (highs[i] + lows[i] + closes[i]) / 3.0;
        cum_tp_vol += tp * volumes[i];
        cum_vol += volumes[i];
        out.push(if cum_vol < 1e-10 { closes[i] } else { cum_tp_vol / cum_vol });
    }
    out
}

fn keltner_channels(
    highs: &[f64],
    lows: &[f64],
    closes: &[f64],
    ema_period: usize,
    atr_period: usize,
    mult: f64,
) -> (Vec<f64>, Vec<f64>, Vec<f64>) {
    // Keltner Channels: EMA ± mult*ATR
    let middle = ema(closes, ema_period);
    let atr_vals = atr(highs, lows, closes, atr_period);
    let upper = middle.iter().zip(atr_vals.iter()).map(|(m, a)| m + mult * a).collect();
    let lower = middle.iter().zip(atr_vals.iter()).map(|(m, a)| m - mult * a).collect();
    (upper, middle, lower)
}

fn obv_series(closes: &[f64], volumes: &[f64]) -> Vec<f64> {
    // On-Balance Volume: cumulative ±vol based on price direction
    let n = closes.len();
    let mut out = Vec::with_capacity(n);
    let mut obv = 0.0_f64;
    out.push(obv);
    for i in 1..n {
        if closes[i] > closes[i - 1] {
            obv += volumes[i];
        } else if closes[i] < closes[i - 1] {
            obv -= volumes[i];
        }
        out.push(obv);
    }
    out
}

fn cmf_series(highs: &[f64], lows: &[f64], closes: &[f64], volumes: &[f64], period: usize) -> Vec<f64> {
    // Chaikin Money Flow = rolling(CLV*vol, p) / rolling(vol, p)
    let n = closes.len();
    let mut clv_vol: Vec<f64> = Vec::with_capacity(n);
    for i in 0..n {
        let hl = highs[i] - lows[i];
        let clv = if hl < 1e-10 {
            0.0
        } else {
            ((closes[i] - lows[i]) - (highs[i] - closes[i])) / hl
        };
        clv_vol.push(clv * volumes[i]);
    }
    let mut out = Vec::with_capacity(n);
    for i in 0..n {
        let start = (i + 1).saturating_sub(period);
        let vol_sum: f64 = volumes[start..=i].iter().sum();
        let cv_sum: f64 = clv_vol[start..=i].iter().sum();
        out.push(if vol_sum < 1e-10 { 0.0 } else { cv_sum / vol_sum });
    }
    out
}

fn composite_sma50_slope_norm_impl(closes: &[f64]) -> Result<(f64, f64, f64), &'static str> {
    if closes.len() < 2 {
        return Err("at least 2 close values required");
    }

    let sma50 = sma(closes, 50);
    let last_sma = *sma50.last().unwrap_or(&0.0);
    let slope_period = 5_usize.min(sma50.len().saturating_sub(1));
    let slope_value = if slope_period == 0 {
        0.0
    } else {
        last_sma - sma50[sma50.len() - 1 - slope_period]
    };
    let denom = last_sma.abs().max(1e-9);
    let slope_norm = slope_value / denom;
    Ok((slope_value, slope_norm, last_sma))
}

fn calculate_heartbeat_impl(
    closes: &[f64],
    highs: &[f64],
    lows: &[f64],
    sensitivity: f64,
) -> Result<f64, &'static str> {
    if closes.len() < 3 || highs.len() != closes.len() || lows.len() != closes.len() {
        return Err("closes/highs/lows must have same length >= 3");
    }

    let mut swings: Vec<(usize, f64)> = Vec::new();
    let threshold = sensitivity.abs().max(1e-6);

    for i in 1..(closes.len() - 1) {
        let prev = closes[i - 1];
        let curr = closes[i];
        let next = closes[i + 1];
        let is_turn = (curr > prev && curr > next) || (curr < prev && curr < next);
        if is_turn {
            let amplitude = (highs[i] - lows[i]).abs();
            if amplitude >= threshold {
                swings.push((i, curr));
            }
        }
    }

    if swings.len() < 4 {
        return Ok(0.0);
    }

    let mut periods = Vec::new();
    let mut amplitudes = Vec::new();
    for window in swings.windows(2) {
        let period = (window[1].0 as i64 - window[0].0 as i64).unsigned_abs() as f64;
        let amp = (window[1].1 - window[0].1).abs();
        if period > 0.0 {
            periods.push(period);
            amplitudes.push(amp);
        }
    }

    if periods.len() < 3 {
        return Ok(0.0);
    }

    let period_mean = periods.iter().sum::<f64>() / periods.len() as f64;
    let amp_mean = amplitudes.iter().sum::<f64>() / amplitudes.len() as f64;
    if period_mean <= 0.0 || amp_mean <= 0.0 {
        return Ok(0.0);
    }

    let period_var = periods
        .iter()
        .map(|value| {
            let delta = *value - period_mean;
            delta * delta
        })
        .sum::<f64>()
        / periods.len() as f64;
    let amp_var = amplitudes
        .iter()
        .map(|value| {
            let delta = *value - amp_mean;
            delta * delta
        })
        .sum::<f64>()
        / amplitudes.len() as f64;

    let period_cv = period_var.sqrt() / period_mean;
    let amp_cv = amp_var.sqrt() / amp_mean;
    let period_stability = (1.0 - period_cv).clamp(0.0, 1.0);
    let amp_stability = (1.0 - amp_cv).clamp(0.0, 1.0);
    Ok(((period_stability + amp_stability) / 2.0).clamp(0.0, 1.0))
}

fn calculate_indicators_batch_impl(
    _timestamps: &[i64],
    _opens: &[f64],
    highs: &[f64],
    lows: &[f64],
    closes: &[f64],
    volumes: &[f64],
    indicators: &[String],
) -> Result<HashMap<String, Vec<f64>>, &'static str> {
    let len = closes.len();
    if len == 0 {
        return Ok(HashMap::new());
    }
    if volumes.len() != len {
        return Err("volumes length must match closes");
    }

    let mut out: HashMap<String, Vec<f64>> = HashMap::new();
    for indicator in indicators {
        let key = indicator.trim().to_lowercase();
        if let Some(period_str) = key.strip_prefix("sma_") {
            let period = period_str.parse::<usize>().unwrap_or(1).max(1);
            out.insert(indicator.clone(), sma(closes, period));
            continue;
        }
        if let Some(period_str) = key.strip_prefix("ema_") {
            let period = period_str.parse::<usize>().unwrap_or(1).max(1);
            out.insert(indicator.clone(), ema(closes, period));
            continue;
        }
        if let Some(period_str) = key.strip_prefix("rsi_") {
            let period = period_str.parse::<usize>().unwrap_or(14).max(1);
            out.insert(indicator.clone(), rsi(closes, period));
            continue;
        }
        if let Some(period_str) = key.strip_prefix("rvol_") {
            let period = period_str.parse::<usize>().unwrap_or(20).max(1);
            let baseline = sma(volumes, period);
            let mut series = Vec::with_capacity(len);
            for i in 0..len {
                let denom = baseline[i].abs().max(1e-9);
                series.push(volumes[i] / denom);
            }
            out.insert(indicator.clone(), series);
            continue;
        }
        // atr_N — requires highs and lows to be provided
        if let Some(period_str) = key.strip_prefix("atr_") {
            let period = period_str.parse::<usize>().unwrap_or(14).max(1);
            if highs.len() == len && lows.len() == len {
                out.insert(indicator.clone(), atr(highs, lows, closes, period));
            }
            continue;
        }
        // bb_bw_N — Bollinger Bandwidth with default numStd=2.0
        if let Some(period_str) = key.strip_prefix("bb_bw_") {
            let period = period_str.parse::<usize>().unwrap_or(20).max(2);
            out.insert(indicator.clone(), bb_bandwidth(closes, period, 2.0));
            continue;
        }
        // bb_pctb_N — Bollinger %B with default numStd=2.0
        if let Some(period_str) = key.strip_prefix("bb_pctb_") {
            let period = period_str.parse::<usize>().unwrap_or(20).max(2);
            out.insert(indicator.clone(), bb_percent_b(closes, period, 2.0));
            continue;
        }
        if key == "close" {
            out.insert(indicator.clone(), closes.to_vec());
            continue;
        }
        // wma_N — weighted moving average
        if let Some(period_str) = key.strip_prefix("wma_") {
            let period = period_str.parse::<usize>().unwrap_or(1).max(1);
            out.insert(indicator.clone(), wma(closes, period));
            continue;
        }
        // hma_N — hull moving average
        if let Some(period_str) = key.strip_prefix("hma_") {
            let period = period_str.parse::<usize>().unwrap_or(9).max(1);
            out.insert(indicator.clone(), hma(closes, period));
            continue;
        }
        // macd_fast_slow_signal — inserts macd_line_*, macd_signal_*, macd_hist_*
        if let Some(params) = key.strip_prefix("macd_") {
            let parts: Vec<&str> = params.splitn(3, '_').collect();
            let fast = parts.first().and_then(|s| s.parse().ok()).unwrap_or(12_usize).max(1);
            let slow = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(26_usize).max(1);
            let signal = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(9_usize).max(1);
            let (ml, sl, hist) = macd_components(closes, fast, slow, signal);
            out.insert(format!("macd_line_{fast}_{slow}_{signal}"), ml);
            out.insert(format!("macd_signal_{fast}_{slow}_{signal}"), sl);
            out.insert(format!("macd_hist_{fast}_{slow}_{signal}"), hist);
            continue;
        }
        // stoch_kp_dp — inserts stoch_k_*, stoch_d_*  (requires highs and lows)
        if let Some(params) = key.strip_prefix("stoch_") {
            let parts: Vec<&str> = params.splitn(2, '_').collect();
            let k_period = parts.first().and_then(|s| s.parse().ok()).unwrap_or(14_usize).max(1);
            let d_period = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(3_usize).max(1);
            if highs.len() == len && lows.len() == len {
                let (k, d) = stochastic(highs, lows, closes, k_period, d_period);
                out.insert(format!("stoch_k_{k_period}_{d_period}"), k);
                out.insert(format!("stoch_d_{k_period}_{d_period}"), d);
            }
            continue;
        }
        // adx_N — inserts adx_N, di_plus_N, di_minus_N  (requires highs and lows)
        if let Some(period_str) = key.strip_prefix("adx_") {
            let period = period_str.parse::<usize>().unwrap_or(14).max(1);
            if highs.len() == len && lows.len() == len {
                let (adx_v, dip, dim) = adx_components(highs, lows, closes, period);
                out.insert(format!("adx_{period}"), adx_v);
                out.insert(format!("di_plus_{period}"), dip);
                out.insert(format!("di_minus_{period}"), dim);
            }
            continue;
        }
        // smma_N — Smoothed/Wilder MA
        if let Some(period_str) = key.strip_prefix("smma_") {
            let period = period_str.parse::<usize>().unwrap_or(14).max(1);
            out.insert(indicator.clone(), smma(closes, period));
            continue;
        }
        // kama_N — Kaufman Adaptive MA (fast=2, slow=30)
        if let Some(period_str) = key.strip_prefix("kama_") {
            let period = period_str.parse::<usize>().unwrap_or(10).max(1);
            out.insert(indicator.clone(), kama(closes, period, 2, 30));
            continue;
        }
        // alma_N — Arnaud Legoux MA (offset=0.85, sigma=6.0)
        if let Some(period_str) = key.strip_prefix("alma_") {
            let period = period_str.parse::<usize>().unwrap_or(9).max(1);
            out.insert(indicator.clone(), alma(closes, period, 0.85, 6.0));
            continue;
        }
        // iwma_N — Inverse Weighted MA
        if let Some(period_str) = key.strip_prefix("iwma_") {
            let period = period_str.parse::<usize>().unwrap_or(10).max(1);
            out.insert(indicator.clone(), iwma(closes, period));
            continue;
        }
        // ols_N — OLS Linear Regression MA
        if let Some(period_str) = key.strip_prefix("ols_") {
            let period = period_str.parse::<usize>().unwrap_or(14).max(1);
            out.insert(indicator.clone(), ols_ma(closes, period));
            continue;
        }
        // ichimoku — inserts 5 series (requires highs and lows)
        if key == "ichimoku" {
            if highs.len() == len && lows.len() == len {
                let (tenkan, kijun, span_a, span_b, chikou) = ichimoku_series(highs, lows, closes);
                out.insert("ichimoku_tenkan".to_string(), tenkan);
                out.insert("ichimoku_kijun".to_string(), kijun);
                out.insert("ichimoku_span_a".to_string(), span_a);
                out.insert("ichimoku_span_b".to_string(), span_b);
                out.insert("ichimoku_chikou".to_string(), chikou);
            }
            continue;
        }
        // vwap — session VWAP (requires highs, lows, volumes)
        if key == "vwap" {
            if highs.len() == len && lows.len() == len {
                out.insert(indicator.clone(), vwap_series(highs, lows, closes, volumes));
            }
            continue;
        }
        // keltner_N — Keltner Channels (EMA=N, ATR=N, mult=1.5); requires highs and lows
        // inserts keltner_upper_N, keltner_mid_N, keltner_lower_N
        if let Some(period_str) = key.strip_prefix("keltner_") {
            let period = period_str.parse::<usize>().unwrap_or(20).max(1);
            if highs.len() == len && lows.len() == len {
                let (upper, mid, lower) = keltner_channels(highs, lows, closes, period, period, 1.5);
                out.insert(format!("keltner_upper_{period}"), upper);
                out.insert(format!("keltner_mid_{period}"), mid);
                out.insert(format!("keltner_lower_{period}"), lower);
            }
            continue;
        }
        // obv — On-Balance Volume
        if key == "obv" {
            out.insert(indicator.clone(), obv_series(closes, volumes));
            continue;
        }
        // cmf_N — Chaikin Money Flow (requires highs, lows, volumes)
        if let Some(period_str) = key.strip_prefix("cmf_") {
            let period = period_str.parse::<usize>().unwrap_or(20).max(1);
            if highs.len() == len && lows.len() == len {
                out.insert(indicator.clone(), cmf_series(highs, lows, closes, volumes, period));
            }
            continue;
        }
    }
    Ok(out)
}

#[pyfunction]
fn composite_sma50_slope_norm(py: Python<'_>, closes: Vec<f64>) -> PyResult<(f64, f64, f64)> {
    // py.detach() releases the GIL for the duration of the computation (PyO3 0.22+ rename of allow_threads)
    py.detach(move || composite_sma50_slope_norm_impl(&closes))
        .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn calculate_heartbeat(
    py: Python<'_>,
    closes: Vec<f64>,
    highs: Vec<f64>,
    lows: Vec<f64>,
    sensitivity: f64,
) -> PyResult<f64> {
    py.detach(move || calculate_heartbeat_impl(&closes, &highs, &lows, sensitivity))
        .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn calculate_indicators_batch(
    py: Python<'_>,
    timestamps: Vec<i64>,
    opens: Vec<f64>,
    highs: Vec<f64>,
    lows: Vec<f64>,
    closes: Vec<f64>,
    volumes: Vec<f64>,
    indicators: Vec<String>,
) -> PyResult<HashMap<String, Vec<f64>>> {
    py.detach(move || {
        calculate_indicators_batch_impl(
            &timestamps,
            &opens,
            &highs,
            &lows,
            &closes,
            &volumes,
            &indicators,
        )
    })
    .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn redb_cache_set(
    py: Python<'_>,
    path: String,
    key: String,
    payload_json: String,
    ttl_ms: u64,
) -> PyResult<()> {
    py.detach(move || ohlcv_cache::cache_set(&path, &key, &payload_json, ttl_ms))
        .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn redb_cache_get(
    py: Python<'_>,
    path: String,
    key: String,
    now_ms: Option<u64>,
) -> PyResult<Option<String>> {
    py.detach(move || ohlcv_cache::cache_get(&path, &key, now_ms))
        .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

// ── Agent Hotpath Helpers (private, not exported) ─────────────────────────────

/// Byte-level whole-word check — no regex, no allocation.
fn contains_whole_word(haystack: &str, needle: &str) -> bool {
    if needle.is_empty() {
        return false;
    }
    let h = haystack.as_bytes();
    let n = needle.as_bytes();
    let nlen = n.len();
    if h.len() < nlen {
        return false;
    }
    for i in 0..=(h.len() - nlen) {
        if &h[i..i + nlen] == n {
            let before_ok = i == 0 || !h[i - 1].is_ascii_alphanumeric() && h[i - 1] != b'_';
            let after_ok =
                i + nlen >= h.len() || !h[i + nlen].is_ascii_alphanumeric() && h[i + nlen] != b'_';
            if before_ok && after_ok {
                return true;
            }
        }
    }
    false
}

/// First 64 normalised chars (lowercase, collapsed whitespace) — used as dedup hash key.
fn normalize_content_hash(content: &str) -> String {
    let joined = content
        .to_lowercase()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    joined.chars().take(64).collect()
}

/// Split text on non-alphanumeric boundaries → lowercase word tokens.
fn tokenize_words(text: &str) -> Vec<String> {
    text.to_lowercase()
        .split(|c: char| !c.is_alphanumeric())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .collect()
}

// ── Agent Hotpath Impl Functions ───────────────────────────────────────────────

fn extract_entities_from_text_impl(text: &str) -> String {
    let mut entities: Vec<serde_json::Value> = Vec::new();

    // Ticker patterns: $XXX (dollar-prefixed) or BASE/QUOTE (forex/crypto pairs)
    for word in text.split_whitespace() {
        let clean = word.trim_matches(|c: char| c == ',' || c == '.' || c == '!' || c == '?');
        if let Some(ticker) = clean.strip_prefix('$') {
            if ticker.len() >= 2
                && ticker.len() <= 6
                && ticker.chars().all(|c| c.is_ascii_uppercase())
            {
                entities.push(serde_json::json!({"type": "ticker", "value": ticker}));
            }
        } else if clean.contains('/') {
            let mut parts = clean.splitn(2, '/');
            if let (Some(base), Some(quote)) = (parts.next(), parts.next()) {
                if base.len() >= 2
                    && base.len() <= 6
                    && quote.len() >= 2
                    && quote.len() <= 6
                    && base.chars().all(|c| c.is_ascii_uppercase())
                    && quote.chars().all(|c| c.is_ascii_uppercase())
                {
                    entities.push(serde_json::json!({"type": "ticker", "value": clean}));
                }
            }
        }
    }

    let text_lower = text.to_lowercase();

    // Static country list
    const COUNTRIES: &[&str] = &[
        "usa", "china", "europe", "germany", "france", "japan", "russia", "india",
        "brazil", "canada", "australia", "switzerland", "israel", "iran", "ukraine",
        "taiwan", "singapore",
    ];
    for country in COUNTRIES {
        if contains_whole_word(&text_lower, country) {
            entities.push(serde_json::json!({"type": "country", "value": *country}));
        }
    }

    // Macro metrics and technical indicators
    const METRICS: &[&str] = &[
        "rsi", "macd", "atr", "ema", "sma", "vwap", "adx", "roc", "inflation", "gdp",
        "cpi", "ppi", "pce", "unemployment", "nfp", "fomc", "yield", "spread",
        "volatility", "correlation", "volume",
    ];
    for metric in METRICS {
        if contains_whole_word(&text_lower, metric) {
            entities.push(serde_json::json!({"type": "metric", "value": *metric}));
        }
    }

    // Asset classes
    const ASSET_CLASSES: &[&str] = &[
        "crypto", "forex", "equities", "bonds", "commodities", "futures", "options",
        "etf", "reit", "rates",
    ];
    for asset in ASSET_CLASSES {
        if contains_whole_word(&text_lower, asset) {
            entities.push(serde_json::json!({"type": "asset_class", "value": *asset}));
        }
    }

    serde_json::to_string(&entities).unwrap_or_else(|_| "[]".to_string())
}

fn dedup_context_fragments_impl(fragments_json: &str, _threshold: f64) -> Result<String, String> {
    let mut fragments: Vec<serde_json::Value> =
        serde_json::from_str(fragments_json).map_err(|e| format!("invalid JSON: {e}"))?;

    // Sort by relevance descending so we keep the highest-relevance duplicate.
    fragments.sort_by(|a, b| {
        let ra = a.get("relevance_f64").and_then(|v| v.as_f64()).unwrap_or(0.0);
        let rb = b.get("relevance_f64").and_then(|v| v.as_f64()).unwrap_or(0.0);
        rb.partial_cmp(&ra).unwrap_or(std::cmp::Ordering::Equal)
    });

    let mut seen = std::collections::HashSet::<String>::new();
    let mut result: Vec<serde_json::Value> = Vec::with_capacity(fragments.len());

    for fragment in fragments {
        let content_str = fragment
            .get("content_str")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let hash = normalize_content_hash(content_str);
        if seen.insert(hash) {
            result.push(fragment);
        }
    }

    serde_json::to_string(&result).map_err(|e| format!("serialization error: {e}"))
}

fn score_tools_for_query_impl(
    query: &str,
    tool_names: &[String],
    tool_descriptions: &[String],
) -> Vec<f64> {
    let query_tokens = tokenize_words(query);
    let total = query_tokens.len();
    let query_lower = query.to_lowercase();

    tool_names
        .iter()
        .zip(tool_descriptions.iter())
        .map(|(name, desc)| {
            if total == 0 {
                return 0.0;
            }
            let desc_tokens = tokenize_words(desc);
            let matched = query_tokens
                .iter()
                .filter(|qt| desc_tokens.contains(qt))
                .count();
            let mut score = matched as f64 / total as f64;

            // Name boost: +0.25 when tool name appears as substring in query
            let name_lower = name.to_lowercase();
            if !name_lower.is_empty() && query_lower.contains(name_lower.as_str()) {
                score += 0.25;
            }
            score.clamp(0.0, 1.0)
        })
        .collect()
}

// ── Agent Hotpath PyO3 Wrappers ────────────────────────────────────────────────

#[pyfunction]
fn extract_entities_from_text(py: Python<'_>, text: String) -> PyResult<String> {
    Ok(py.detach(move || extract_entities_from_text_impl(&text)))
}

#[pyfunction]
fn dedup_context_fragments(
    py: Python<'_>,
    fragments_json: String,
    threshold: f64,
) -> PyResult<String> {
    py.detach(move || dedup_context_fragments_impl(&fragments_json, threshold))
        .map_err(|msg| PyValueError::new_err(msg))
}

#[pyfunction]
fn score_tools_for_query(
    py: Python<'_>,
    query: String,
    tool_names: Vec<String>,
    tool_descriptions: Vec<String>,
) -> PyResult<Vec<f64>> {
    Ok(py.detach(move || {
        score_tools_for_query_impl(&query, &tool_names, &tool_descriptions)
    }))
}

// ── Portfolio Analytics (fast-path for portfolio.py) ──────────────────────────

/// Underwater (drawdown) curve: (equity[i] - running_max) / running_max.
/// Returns 0.0 at new highs, negative fractions in drawdown.
fn portfolio_drawdown_series_impl(equity: &[f64]) -> Vec<f64> {
    if equity.is_empty() {
        return Vec::new();
    }
    let mut out = Vec::with_capacity(equity.len());
    let mut running_max = equity[0];
    for &e in equity {
        if e > running_max {
            running_max = e;
        }
        let dd = if running_max > 0.0 {
            (e - running_max) / running_max
        } else {
            0.0
        };
        out.push(dd);
    }
    out
}

/// Rolling annualised Sharpe ratio. Returns NaN for positions before the first
/// full window. rf_daily = annual_rf / 252.
fn portfolio_rolling_sharpe_impl(returns: &[f64], window: usize, rf_daily: f64) -> Vec<f64> {
    let n = returns.len();
    let mut out = vec![f64::NAN; n];
    if window < 2 || n < window {
        return out;
    }
    let ann = 252.0_f64.sqrt();
    for i in (window - 1)..n {
        let slice = &returns[(i + 1 - window)..=i];
        let mean = slice.iter().sum::<f64>() / window as f64;
        let var = slice.iter().map(|r| (r - mean).powi(2)).sum::<f64>()
            / (window - 1) as f64;
        let std = var.sqrt();
        out[i] = if std > 1e-12 {
            (mean - rf_daily) / std * ann
        } else {
            0.0
        };
    }
    out
}

/// Single-asset Kelly fraction: mu / sigma² (clamped to [-2, 2]).
fn portfolio_kelly_fraction_impl(returns: &[f64]) -> f64 {
    if returns.len() < 2 {
        return 0.0;
    }
    let n = returns.len() as f64;
    let mean = returns.iter().sum::<f64>() / n;
    let var = returns.iter().map(|r| (r - mean).powi(2)).sum::<f64>() / (n - 1.0);
    if var <= 1e-14 {
        return 0.0;
    }
    (mean / var).clamp(-2.0, 2.0)
}

#[pyfunction]
fn portfolio_drawdown_series(py: Python<'_>, equity: Vec<f64>) -> PyResult<Vec<f64>> {
    Ok(py.detach(move || portfolio_drawdown_series_impl(&equity)))
}

#[pyfunction]
fn portfolio_rolling_sharpe(
    py: Python<'_>,
    returns: Vec<f64>,
    window: usize,
    rf_daily: f64,
) -> PyResult<Vec<f64>> {
    Ok(py.detach(move || portfolio_rolling_sharpe_impl(&returns, window, rf_daily)))
}

#[pyfunction]
fn portfolio_kelly_fraction(py: Python<'_>, returns: Vec<f64>) -> PyResult<f64> {
    Ok(py.detach(move || portfolio_kelly_fraction_impl(&returns)))
}

#[pymodule]
fn tradeviewfusion_rust_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(composite_sma50_slope_norm, m)?)?;
    m.add_function(wrap_pyfunction!(calculate_heartbeat, m)?)?;
    m.add_function(wrap_pyfunction!(calculate_indicators_batch, m)?)?;
    m.add_function(wrap_pyfunction!(redb_cache_set, m)?)?;
    m.add_function(wrap_pyfunction!(redb_cache_get, m)?)?;
    m.add_function(wrap_pyfunction!(extract_entities_from_text, m)?)?;
    m.add_function(wrap_pyfunction!(dedup_context_fragments, m)?)?;
    m.add_function(wrap_pyfunction!(score_tools_for_query, m)?)?;
    m.add_function(wrap_pyfunction!(portfolio_drawdown_series, m)?)?;
    m.add_function(wrap_pyfunction!(portfolio_rolling_sharpe, m)?)?;
    m.add_function(wrap_pyfunction!(portfolio_kelly_fraction, m)?)?;
    m.add("__version__", env!("CARGO_PKG_VERSION"))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_abs_diff_eq;

    #[test]
    fn test_sma_basic() {
        let values = vec![1.0, 2.0, 3.0, 4.0];
        let got = sma(&values, 2);
        assert_eq!(got.len(), 4);
        assert_abs_diff_eq!(got[0], 1.0, epsilon = 1e-12);
        assert_abs_diff_eq!(got[1], 1.5, epsilon = 1e-12);
        assert_abs_diff_eq!(got[2], 2.5, epsilon = 1e-12);
        assert_abs_diff_eq!(got[3], 3.5, epsilon = 1e-12);
    }

    #[test]
    fn test_composite_slope_norm_impl() {
        let mut closes = Vec::new();
        for i in 0..80 {
            closes.push(100.0 + (i as f64 * 0.5));
        }
        let (slope_value, slope_norm, last_sma) =
            composite_sma50_slope_norm_impl(&closes).expect("slope calc should work");
        assert!(last_sma > 0.0);
        assert!(slope_value > 0.0);
        assert!(slope_norm > 0.0);
    }

    #[test]
    fn test_calculate_heartbeat_impl_returns_bounded_score() {
        let mut closes = Vec::new();
        let mut highs = Vec::new();
        let mut lows = Vec::new();
        for i in 0..200 {
            let x = i as f64 / 5.0;
            let c = 100.0 + x.sin() * 2.0 + (i as f64 * 0.01);
            closes.push(c);
            highs.push(c + 0.3);
            lows.push(c - 0.3);
        }
        let score = calculate_heartbeat_impl(&closes, &highs, &lows, 0.05).expect("heartbeat");
        assert!((0.0..=1.0).contains(&score));
    }

    #[test]
    fn test_calculate_indicators_batch_impl_basic() {
        let closes = vec![1.0, 2.0, 3.0, 4.0];
        let volumes = vec![10.0, 20.0, 30.0, 40.0];
        let out = calculate_indicators_batch_impl(
            &[],
            &[],
            &[],
            &[],
            &closes,
            &volumes,
            &[
                "sma_2".to_string(),
                "rvol_2".to_string(),
                "close".to_string(),
            ],
        )
        .expect("batch");
        assert!(out.contains_key("sma_2"));
        assert!(out.contains_key("rvol_2"));
        assert!(out.contains_key("close"));
        assert_eq!(out["sma_2"].len(), 4);
        assert_eq!(out["close"][3], 4.0);
    }

    #[test]
    fn test_ema_basic() {
        // EMA(2) of [1,2,3,4]: alpha=2/3
        // out[0]=1, out[1]=2/3*2+1/3*1=5/3≈1.667, out[2]=2/3*3+1/3*5/3=2.556, out[3]≈3.185
        let values = vec![1.0, 2.0, 3.0, 4.0];
        let got = ema(&values, 2);
        assert_eq!(got.len(), 4);
        assert_abs_diff_eq!(got[0], 1.0, epsilon = 1e-9);
        assert_abs_diff_eq!(got[1], 1.6666666, epsilon = 1e-6);
        assert!(got[3] > got[2]); // monotone with rising input
    }

    #[test]
    fn test_rsi_flat_series_is_neutral() {
        // All same price → no gains or losses → RSI should be 100 (no loss denominator)
        let values = vec![10.0; 20];
        let got = rsi(&values, 14);
        assert_eq!(got.len(), 20);
        for v in &got {
            assert_abs_diff_eq!(*v, 100.0, epsilon = 1e-9);
        }
    }

    #[test]
    fn test_rsi_rising_series_above_50() {
        let values: Vec<f64> = (0..50).map(|i| 100.0 + i as f64).collect();
        let got = rsi(&values, 14);
        // Consistently rising price → all gains, no losses → RSI near 100
        for v in got.iter().skip(14) {
            assert!(*v > 50.0, "RSI should be > 50 in rising market, got {v}");
        }
    }

    #[test]
    fn test_atr_constant_candles_equals_zero() {
        // When H=L=C every bar, ATR = 0
        let n = 30;
        let highs = vec![100.0; n];
        let lows = vec![100.0; n];
        let closes = vec![100.0; n];
        let got = atr(&highs, &lows, &closes, 14);
        assert_eq!(got.len(), n);
        for v in &got {
            assert_abs_diff_eq!(*v, 0.0, epsilon = 1e-9);
        }
    }

    #[test]
    fn test_atr_known_value() {
        // Simple 3-bar case:
        // Bar0: H=105 L=95 C=100 → no prev close, tr=0 (first bar)
        // Bar1: H=108 L=97 C=105 → tr = max(11, |108-100|, |97-100|) = max(11,8,3) = 11
        // Bar2: H=110 L=100 C=108 → tr = max(10, |110-105|, |100-105|) = max(10,5,5) = 10
        // ATR(2) period=2: sma([0,11,10], 2)
        // sma[0]=0, sma[1]=(0+11)/2=5.5, sma[2]=(11+10)/2=10.5
        let highs = vec![105.0, 108.0, 110.0];
        let lows = vec![95.0, 97.0, 100.0];
        let closes = vec![100.0, 105.0, 108.0];
        let got = atr(&highs, &lows, &closes, 2);
        assert_eq!(got.len(), 3);
        assert_abs_diff_eq!(got[0], 0.0, epsilon = 1e-9);
        assert_abs_diff_eq!(got[1], 5.5, epsilon = 1e-9);
        assert_abs_diff_eq!(got[2], 10.5, epsilon = 1e-9);
    }

    #[test]
    fn test_bb_bandwidth_constant_is_zero() {
        // Constant series → std=0 → bandwidth=0
        let values = vec![50.0; 30];
        let got = bb_bandwidth(&values, 20, 2.0);
        assert_eq!(got.len(), 30);
        for v in &got {
            assert_abs_diff_eq!(*v, 0.0, epsilon = 1e-9);
        }
    }

    #[test]
    fn test_bb_bandwidth_positive() {
        let values: Vec<f64> = (0..40).map(|i| 100.0 + (i as f64 * 0.1)).collect();
        let got = bb_bandwidth(&values, 20, 2.0);
        // After enough bars for std to be non-trivial, bandwidth > 0
        assert!(got.iter().skip(20).all(|v| *v >= 0.0));
    }

    #[test]
    fn test_bb_percent_b_at_midband_is_half() {
        // When price == SMA (mid), %B should be 0.5
        // Use a flat series so mid == close
        let values = vec![100.0; 30];
        let got = bb_percent_b(&values, 20, 2.0);
        // flat series: upper=lower=mid=100, bw=0 → fallback 0.5
        for v in &got {
            assert_abs_diff_eq!(*v, 0.5, epsilon = 1e-9);
        }
    }

    #[test]
    fn test_wma_period2_manual() {
        // WMA(2) of [1,2,3]: weights [1,2], denom=3
        // idx1: (1*1 + 2*2)/3 = 5/3
        // idx2: (1*2 + 2*3)/3 = 8/3
        let values = vec![1.0, 2.0, 3.0];
        let got = wma(&values, 2);
        assert_abs_diff_eq!(got[1], 5.0 / 3.0, epsilon = 1e-10);
        assert_abs_diff_eq!(got[2], 8.0 / 3.0, epsilon = 1e-10);
    }

    #[test]
    fn test_wma_rising_above_sma() {
        let values: Vec<f64> = (1..=10).map(|i| i as f64).collect();
        let got = wma(&values, 10);
        let sma_val = values.iter().sum::<f64>() / 10.0;
        assert!(got[9] > sma_val);
    }

    #[test]
    fn test_hma_length_preserved() {
        let values: Vec<f64> = (0..60).map(|i| 100.0 + i as f64 * 0.5).collect();
        let got = hma(&values, 9);
        assert_eq!(got.len(), values.len());
    }

    #[test]
    fn test_hma_uptrend_rising_tail() {
        let values: Vec<f64> = (0..80).map(|i| 100.0 + i as f64 * 0.5).collect();
        let got = hma(&values, 9);
        let tail = &got[got.len() - 10..];
        for i in 0..tail.len() - 1 {
            assert!(tail[i] < tail[i + 1], "HMA tail should be rising");
        }
    }

    #[test]
    fn test_macd_uptrend_positive_line() {
        let closes: Vec<f64> = (0..60).map(|i| 100.0 + i as f64 * 0.5).collect();
        let (ml, sl, hist) = macd_components(&closes, 12, 26, 9);
        assert_eq!(ml.len(), 60);
        assert_eq!(sl.len(), 60);
        assert_eq!(hist.len(), 60);
        assert!(ml[59] > 0.0, "MACD line should be positive in uptrend");
    }

    #[test]
    fn test_macd_hist_is_line_minus_signal() {
        let closes: Vec<f64> = (0..60).map(|i| 100.0 + i as f64 * 0.5).collect();
        let (ml, sl, hist) = macd_components(&closes, 12, 26, 9);
        for i in 0..60 {
            assert_abs_diff_eq!(hist[i], ml[i] - sl[i], epsilon = 1e-12);
        }
    }

    #[test]
    fn test_stochastic_uptrend_k_near_100() {
        let closes: Vec<f64> = (0..60).map(|i| 100.0 + i as f64 * 0.5).collect();
        let highs: Vec<f64> = closes.iter().map(|c| c + 0.5).collect();
        let lows: Vec<f64> = closes.iter().map(|c| c - 0.5).collect();
        let (k, d) = stochastic(&highs, &lows, &closes, 14, 3);
        assert_eq!(k.len(), 60);
        assert_eq!(d.len(), 60);
        assert!(k[59] > 80.0, "Stochastic K should be near 100 in uptrend, got {}", k[59]);
    }

    #[test]
    fn test_stochastic_flat_is_50() {
        let closes = vec![100.0_f64; 20];
        let highs = vec![100.0_f64; 20];
        let lows = vec![100.0_f64; 20];
        let (k, _) = stochastic(&highs, &lows, &closes, 14, 3);
        assert_abs_diff_eq!(k[19], 50.0, epsilon = 1e-9);
    }

    #[test]
    fn test_adx_uptrend_di_plus_dominates() {
        let closes: Vec<f64> = (0..60).map(|i| 100.0 + i as f64 * 0.5).collect();
        let highs: Vec<f64> = closes.iter().map(|c| c + 0.5).collect();
        let lows: Vec<f64> = closes.iter().map(|c| c - 0.5).collect();
        let (adx_v, dip, dim) = adx_components(&highs, &lows, &closes, 14);
        assert_eq!(adx_v.len(), 60);
        assert!(dip[59] > dim[59], "DI+ should dominate in uptrend");
    }

    #[test]
    fn test_adx_bounded_0_100() {
        let closes: Vec<f64> = (0..80).map(|i| 100.0 + i as f64 * 0.5).collect();
        let highs: Vec<f64> = closes.iter().map(|c| c + 0.5).collect();
        let lows: Vec<f64> = closes.iter().map(|c| c - 0.5).collect();
        let (adx_v, _, _) = adx_components(&highs, &lows, &closes, 14);
        for v in &adx_v {
            assert!(*v >= 0.0 && *v <= 100.0 + 1e-9, "ADX out of bounds: {v}");
        }
    }

    #[test]
    fn test_adx_strong_trend_above_20() {
        let closes: Vec<f64> = (0..80).map(|i| 100.0 + i as f64 * 0.5).collect();
        let highs: Vec<f64> = closes.iter().map(|c| c + 0.5).collect();
        let lows: Vec<f64> = closes.iter().map(|c| c - 0.5).collect();
        let (adx_v, _, _) = adx_components(&highs, &lows, &closes, 14);
        assert!(adx_v[79] > 20.0, "Strong uptrend ADX should be > 20, got {}", adx_v[79]);
    }

    #[test]
    fn test_batch_macd_stoch_adx() {
        let n = 60;
        let closes: Vec<f64> = (0..n).map(|i| 100.0 + i as f64 * 0.5).collect();
        let highs: Vec<f64> = closes.iter().map(|c| c + 0.5).collect();
        let lows: Vec<f64> = closes.iter().map(|c| c - 0.5).collect();
        let volumes = vec![1000.0_f64; n];
        let timestamps: Vec<i64> = (0..n as i64).collect();

        let out = calculate_indicators_batch_impl(
            &timestamps,
            &[],
            &highs,
            &lows,
            &closes,
            &volumes,
            &[
                "macd_12_26_9".to_string(),
                "stoch_14_3".to_string(),
                "adx_14".to_string(),
                "wma_10".to_string(),
                "hma_9".to_string(),
            ],
        )
        .expect("batch ok");

        assert_eq!(out["macd_line_12_26_9"].len(), n);
        assert_eq!(out["macd_signal_12_26_9"].len(), n);
        assert_eq!(out["macd_hist_12_26_9"].len(), n);
        assert_eq!(out["stoch_k_14_3"].len(), n);
        assert_eq!(out["stoch_d_14_3"].len(), n);
        assert_eq!(out["adx_14"].len(), n);
        assert_eq!(out["di_plus_14"].len(), n);
        assert_eq!(out["di_minus_14"].len(), n);
        assert_eq!(out["wma_10"].len(), n);
        assert_eq!(out["hma_9"].len(), n);
    }

    #[test]
    fn test_contains_whole_word_basic() {
        // Caller is responsible for lowercasing both haystack and needle before calling.
        assert!(contains_whole_word("rsi broke 70", "rsi"));
        assert!(contains_whole_word("check the rsi-level", "rsi")); // dash = boundary
        assert!(!contains_whole_word("rising", "rsi")); // substring, not whole word
        assert!(contains_whole_word("gdp growth", "gdp"));
        assert!(!contains_whole_word("", "rsi"));
        assert!(!contains_whole_word("rsi", ""));
    }

    #[test]
    fn test_normalize_content_hash_dedup() {
        let a = normalize_content_hash("  Hello   World  ");
        let b = normalize_content_hash("hello world");
        assert_eq!(a, b);
        // Truncated to 64 chars
        let long = "a".repeat(200);
        assert_eq!(normalize_content_hash(&long).len(), 64);
    }

    #[test]
    fn test_tokenize_words_basic() {
        let tokens = tokenize_words("BTC/USD broke RSI 70!");
        assert!(tokens.contains(&"btc".to_string()));
        assert!(tokens.contains(&"usd".to_string()));
        assert!(tokens.contains(&"rsi".to_string()));
        assert!(tokens.contains(&"70".to_string()));
        assert!(!tokens.contains(&"btc/usd".to_string()));
    }

    #[test]
    fn test_extract_entities_from_text_ticker_slash() {
        let json = extract_entities_from_text_impl("BTC/USD broke RSI 70 today");
        let parsed: serde_json::Value = serde_json::from_str(&json).expect("valid json");
        let arr = parsed.as_array().expect("array");
        let tickers: Vec<&str> = arr
            .iter()
            .filter(|e| e["type"] == "ticker")
            .filter_map(|e| e["value"].as_str())
            .collect();
        assert!(tickers.contains(&"BTC/USD"), "BTC/USD should be detected as ticker");
    }

    #[test]
    fn test_extract_entities_from_text_dollar_ticker() {
        let json = extract_entities_from_text_impl("$AAPL earnings beat estimates");
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        let arr = parsed.as_array().unwrap();
        let tickers: Vec<&str> = arr
            .iter()
            .filter(|e| e["type"] == "ticker")
            .filter_map(|e| e["value"].as_str())
            .collect();
        assert!(tickers.contains(&"AAPL"));
    }

    #[test]
    fn test_extract_entities_from_text_metric() {
        let json = extract_entities_from_text_impl("RSI above 70 signals overbought");
        let parsed: serde_json::Value = serde_json::from_str(&json).unwrap();
        let metrics: Vec<&str> = parsed.as_array().unwrap()
            .iter()
            .filter(|e| e["type"] == "metric")
            .filter_map(|e| e["value"].as_str())
            .collect();
        assert!(metrics.contains(&"rsi"), "rsi metric not detected");
    }

    #[test]
    fn test_dedup_context_fragments_removes_dupes() {
        let input = serde_json::json!([
            {"source": "a", "content_str": "hello world", "relevance_f64": 0.9},
            {"source": "b", "content_str": "hello world", "relevance_f64": 0.5},
            {"source": "c", "content_str": "different content", "relevance_f64": 0.7},
        ]);
        let result_json = dedup_context_fragments_impl(&input.to_string(), 0.0).unwrap();
        let result: serde_json::Value = serde_json::from_str(&result_json).unwrap();
        let arr = result.as_array().unwrap();
        assert_eq!(arr.len(), 2, "duplicate 'hello world' should be removed");
    }

    #[test]
    fn test_dedup_context_fragments_sorted_by_relevance() {
        let input = serde_json::json!([
            {"source": "a", "content_str": "unique a", "relevance_f64": 0.3},
            {"source": "b", "content_str": "unique b", "relevance_f64": 0.9},
        ]);
        let result_json = dedup_context_fragments_impl(&input.to_string(), 0.0).unwrap();
        let result: serde_json::Value = serde_json::from_str(&result_json).unwrap();
        let arr = result.as_array().unwrap();
        // highest relevance first
        assert_eq!(arr[0]["relevance_f64"].as_f64().unwrap(), 0.9);
    }

    #[test]
    fn test_dedup_context_fragments_invalid_json() {
        let result = dedup_context_fragments_impl("not json", 0.0);
        assert!(result.is_err());
    }

    #[test]
    fn test_score_tools_for_query_basic() {
        let names = vec!["get_chart_state".to_string(), "get_portfolio_summary".to_string()];
        let descs = vec!["chart state symbol timeframe".to_string(), "portfolio positions exposure".to_string()];
        let scores = score_tools_for_query_impl("show chart", &names, &descs);
        assert_eq!(scores.len(), 2);
        // "chart" appears in first description → first score higher
        assert!(scores[0] > scores[1], "chart tool should score higher for 'show chart' query");
    }

    #[test]
    fn test_score_tools_for_query_name_boost() {
        let names = vec!["get_chart_state".to_string()];
        let descs = vec!["returns the current chart state".to_string()];
        // Query contains tool name substring
        let scores_with_name = score_tools_for_query_impl("get_chart_state for EURUSD", &names, &descs);
        let scores_without = score_tools_for_query_impl("show something for EURUSD", &names, &descs);
        assert!(scores_with_name[0] > scores_without[0], "name boost should apply");
    }

    #[test]
    fn test_score_tools_clamped_0_1() {
        let names = vec!["tool".to_string()];
        let descs = vec!["tool chart portfolio positions state".to_string()];
        let scores = score_tools_for_query_impl("tool chart portfolio positions state tool", &names, &descs);
        assert!(scores[0] >= 0.0 && scores[0] <= 1.0);
    }

    #[test]
    fn test_batch_ema_rsi_atr_bb() {
        let n = 50;
        let closes: Vec<f64> = (0..n).map(|i| 100.0 + i as f64 * 0.5).collect();
        let highs: Vec<f64> = closes.iter().map(|c| c + 1.0).collect();
        let lows: Vec<f64> = closes.iter().map(|c| c - 1.0).collect();
        let volumes = vec![1000.0_f64; n];
        let timestamps: Vec<i64> = (0..n as i64).collect();

        let out = calculate_indicators_batch_impl(
            &timestamps,
            &[],
            &highs,
            &lows,
            &closes,
            &volumes,
            &[
                "ema_10".to_string(),
                "rsi_14".to_string(),
                "atr_14".to_string(),
                "bb_bw_20".to_string(),
                "bb_pctb_20".to_string(),
            ],
        )
        .expect("batch ok");

        assert_eq!(out["ema_10"].len(), n);
        assert_eq!(out["rsi_14"].len(), n);
        assert_eq!(out["atr_14"].len(), n);
        assert_eq!(out["bb_bw_20"].len(), n);
        assert_eq!(out["bb_pctb_20"].len(), n);

        // ATR for H=c+1, L=c-1: TR[0]=0, TR[i]=max(2, |...|) ≈2 for small steps → ATR≈2
        for v in out["atr_14"].iter().skip(14) {
            assert_abs_diff_eq!(*v, 2.0, epsilon = 0.5);
        }
        // RSI all rising → should be > 50
        for v in out["rsi_14"].iter().skip(14) {
            assert!(*v > 50.0, "RSI should be > 50 in rising market");
        }
    }

    #[test]
    fn test_portfolio_drawdown_series_known_values() {
        // equity: 100 → 90 → 80 → 100 → 90
        // peaks:  100   100   100   100   100
        // dd:      0   -0.1  -0.2    0   -0.1
        let equity = vec![100.0, 90.0, 80.0, 100.0, 90.0];
        let dd = portfolio_drawdown_series_impl(&equity);
        assert_eq!(dd.len(), 5);
        assert_abs_diff_eq!(dd[0], 0.0, epsilon = 1e-10);
        assert_abs_diff_eq!(dd[1], -0.1, epsilon = 1e-10);
        assert_abs_diff_eq!(dd[2], -0.2, epsilon = 1e-10);
        assert_abs_diff_eq!(dd[3], 0.0, epsilon = 1e-10);
        assert_abs_diff_eq!(dd[4], -0.1, epsilon = 1e-10);
    }

    #[test]
    fn test_portfolio_drawdown_series_monotone_rise() {
        let equity: Vec<f64> = (1..=10).map(|i| i as f64 * 10.0).collect();
        let dd = portfolio_drawdown_series_impl(&equity);
        for v in &dd {
            assert_abs_diff_eq!(*v, 0.0, epsilon = 1e-10);
        }
    }

    #[test]
    fn test_portfolio_rolling_sharpe_nan_warmup() {
        let returns = vec![0.01; 50];
        let out = portfolio_rolling_sharpe_impl(&returns, 20, 0.0);
        assert_eq!(out.len(), 50);
        for v in &out[..19] {
            assert!(v.is_nan(), "positions before window should be NaN");
        }
        for v in &out[19..] {
            assert!(v.is_finite(), "positions from window onward should be finite");
        }
    }

    #[test]
    fn test_portfolio_rolling_sharpe_constant_returns_zero_std() {
        // Constant returns → std=0 → sharpe=0 (not NaN)
        let returns = vec![0.005; 30];
        let out = portfolio_rolling_sharpe_impl(&returns, 10, 0.0);
        for v in &out[9..] {
            assert_abs_diff_eq!(*v, 0.0, epsilon = 1e-10);
        }
    }

    #[test]
    fn test_portfolio_kelly_fraction_positive_edge() {
        // Strongly positive returns → positive Kelly
        let returns: Vec<f64> = vec![0.02; 100];
        let k = portfolio_kelly_fraction_impl(&returns);
        // Constant series → var=0 → returns 0.0
        assert_abs_diff_eq!(k, 0.0, epsilon = 1e-10);
    }

    #[test]
    fn test_portfolio_kelly_fraction_mixed_returns() {
        // Mix of wins and losses → finite Kelly in [-2, 2]
        let mut returns = vec![0.02_f64; 60];
        returns.extend(vec![-0.01_f64; 40]);
        let k = portfolio_kelly_fraction_impl(&returns);
        assert!(k.is_finite());
        assert!(k >= -2.0 && k <= 2.0);
    }
}
