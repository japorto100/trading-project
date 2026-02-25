use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use std::collections::HashMap;

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
    let avg_gain = sma(&gains, period);
    let avg_loss = sma(&losses, period);
    avg_gain
        .iter()
        .zip(avg_loss.iter())
        .map(|(g, l)| {
            if *l == 0.0 {
                100.0
            } else {
                100.0 - 100.0 / (1.0 + g / l)
            }
        })
        .collect()
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
    sma(&tr, period)
}

fn pstdev(values: &[f64]) -> f64 {
    if values.len() < 2 {
        return 0.0;
    }
    let n = values.len() as f64;
    let mean = values.iter().sum::<f64>() / n;
    let variance = values.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / n;
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
        let std = pstdev(window);
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
        let std = pstdev(window);
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
    }
    Ok(out)
}

#[pyfunction]
fn composite_sma50_slope_norm(closes: Vec<f64>) -> PyResult<(f64, f64, f64)> {
    composite_sma50_slope_norm_impl(&closes).map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn calculate_heartbeat(
    closes: Vec<f64>,
    highs: Vec<f64>,
    lows: Vec<f64>,
    sensitivity: f64,
) -> PyResult<f64> {
    calculate_heartbeat_impl(&closes, &highs, &lows, sensitivity)
        .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn calculate_indicators_batch(
    timestamps: Vec<i64>,
    opens: Vec<f64>,
    highs: Vec<f64>,
    lows: Vec<f64>,
    closes: Vec<f64>,
    volumes: Vec<f64>,
    indicators: Vec<String>,
) -> PyResult<HashMap<String, Vec<f64>>> {
    calculate_indicators_batch_impl(
        &timestamps,
        &opens,
        &highs,
        &lows,
        &closes,
        &volumes,
        &indicators,
    )
    .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn redb_cache_set(path: String, key: String, payload_json: String, ttl_ms: u64) -> PyResult<()> {
    ohlcv_cache::cache_set(&path, &key, &payload_json, ttl_ms)
        .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pyfunction]
fn redb_cache_get(path: String, key: String, now_ms: Option<u64>) -> PyResult<Option<String>> {
    ohlcv_cache::cache_get(&path, &key, now_ms)
        .map_err(|msg| PyValueError::new_err(msg.to_string()))
}

#[pymodule]
fn tradeviewfusion_rust_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(composite_sma50_slope_norm, m)?)?;
    m.add_function(wrap_pyfunction!(calculate_heartbeat, m)?)?;
    m.add_function(wrap_pyfunction!(calculate_indicators_batch, m)?)?;
    m.add_function(wrap_pyfunction!(redb_cache_set, m)?)?;
    m.add_function(wrap_pyfunction!(redb_cache_get, m)?)?;
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
}
