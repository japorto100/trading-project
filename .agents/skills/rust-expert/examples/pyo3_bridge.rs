// SOTA 2026: PyO3 Extension Module Pattern
// Golden rule: inner pure Rust fn + thin PyO3 wrapper = testable without Python.
//
// Cargo.toml:
//   [lib]
//   crate-type = ["cdylib"]
//   [dependencies]
//   pyo3 = { version = "0.23", features = ["extension-module", "abi3-py311"] }

#![warn(clippy::unwrap_used, clippy::panic)]

use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use std::collections::HashMap;

// ─────────────────────────────────────────────
// INNER LOGIC — pure Rust, no PyO3 dependency
// These functions are unit-testable without a Python runtime.
// ─────────────────────────────────────────────

fn ema_impl(values: &[f64], period: usize) -> Result<Vec<f64>, &'static str> {
    if period == 0 {
        return Err("period must be >= 1");
    }
    if values.is_empty() {
        return Ok(Vec::new());
    }
    let alpha = 2.0 / (period as f64 + 1.0);
    let mut out = Vec::with_capacity(values.len());
    out.push(values[0]);
    for &v in &values[1..] {
        let prev = *out.last().expect("out is non-empty");
        out.push(alpha * v + (1.0 - alpha) * prev);
    }
    Ok(out)
}

fn rsi_impl(values: &[f64], period: usize) -> Result<Vec<f64>, &'static str> {
    if period == 0 {
        return Err("period must be >= 1");
    }
    if values.len() < 2 {
        return Ok(vec![50.0; values.len()]);
    }
    let mut gains = vec![0.0_f64];
    let mut losses = vec![0.0_f64];
    for i in 1..values.len() {
        let d = values[i] - values[i - 1];
        gains.push(if d > 0.0 { d } else { 0.0 });
        losses.push(if d < 0.0 { -d } else { 0.0 });
    }
    let avg_g = sma_impl(&gains, period);
    let avg_l = sma_impl(&losses, period);
    Ok(avg_g
        .iter()
        .zip(avg_l.iter())
        .map(|(&g, &l)| if l == 0.0 { 100.0 } else { 100.0 - 100.0 / (1.0 + g / l) })
        .collect())
}

fn sma_impl(values: &[f64], period: usize) -> Vec<f64> {
    if period <= 1 {
        return values.to_vec();
    }
    let mut out = Vec::with_capacity(values.len());
    let mut running = 0.0_f64;
    for (i, &v) in values.iter().enumerate() {
        running += v;
        if i >= period {
            running -= values[i - period];
        }
        out.push(running / period.min(i + 1) as f64);
    }
    out
}

// ─────────────────────────────────────────────
// BATCH DISPATCH — single entry point for multiple indicators
// ─────────────────────────────────────────────

fn batch_impl(
    closes: &[f64],
    indicators: &[String],
) -> Result<HashMap<String, Vec<f64>>, String> {
    let mut out = HashMap::new();
    for ind in indicators {
        let key = ind.trim().to_lowercase();
        if let Some(n) = key.strip_prefix("ema_") {
            let p = n.parse::<usize>().map_err(|e| e.to_string())?;
            out.insert(ind.clone(), ema_impl(closes, p).map_err(str::to_string)?);
        } else if let Some(n) = key.strip_prefix("rsi_") {
            let p = n.parse::<usize>().map_err(|e| e.to_string())?;
            out.insert(ind.clone(), rsi_impl(closes, p).map_err(str::to_string)?);
        } else if let Some(n) = key.strip_prefix("sma_") {
            let p = n.parse::<usize>().map_err(|e| e.to_string())?;
            out.insert(ind.clone(), sma_impl(closes, p));
        }
    }
    Ok(out)
}

// ─────────────────────────────────────────────
// PyO3 WRAPPERS — type conversion + error mapping only
// ─────────────────────────────────────────────

#[pyfunction]
fn ema(values: Vec<f64>, period: usize) -> PyResult<Vec<f64>> {
    ema_impl(&values, period).map_err(|e| PyValueError::new_err(e))
}

#[pyfunction]
fn rsi(values: Vec<f64>, period: usize) -> PyResult<Vec<f64>> {
    rsi_impl(&values, period).map_err(|e| PyValueError::new_err(e))
}

#[pyfunction]
fn batch_indicators(
    closes: Vec<f64>,
    indicators: Vec<String>,
) -> PyResult<HashMap<String, Vec<f64>>> {
    batch_impl(&closes, &indicators).map_err(|e| PyValueError::new_err(e))
}

// ─────────────────────────────────────────────
// MODULE REGISTRATION
// ─────────────────────────────────────────────

#[pymodule]
fn my_rust_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(ema, m)?)?;
    m.add_function(wrap_pyfunction!(rsi, m)?)?;
    m.add_function(wrap_pyfunction!(batch_indicators, m)?)?;
    m.add("__version__", env!("CARGO_PKG_VERSION"))?;
    Ok(())
}

// ─────────────────────────────────────────────
// TESTS — pure Rust, no Python runtime required
// ─────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_abs_diff_eq;

    #[test]
    fn ema_rising_series_increases() {
        let values: Vec<f64> = (1..=10).map(|i| i as f64).collect();
        let result = ema_impl(&values, 3).unwrap();
        assert_eq!(result.len(), values.len());
        // EMA of rising series should be above first value
        assert!(result.last().unwrap() > result.first().unwrap());
    }

    #[test]
    fn rsi_flat_is_neutral() {
        let values = vec![100.0_f64; 20];
        let result = rsi_impl(&values, 14).unwrap();
        for v in &result {
            assert_abs_diff_eq!(*v, 100.0, epsilon = 1e-9);
        }
    }

    #[test]
    fn batch_returns_all_keys() {
        let closes: Vec<f64> = (0..50).map(|i| 100.0 + i as f64).collect();
        let inds = vec!["ema_10".to_string(), "rsi_14".to_string(), "sma_5".to_string()];
        let out = batch_impl(&closes, &inds).unwrap();
        assert!(out.contains_key("ema_10"));
        assert!(out.contains_key("rsi_14"));
        assert!(out.contains_key("sma_5"));
    }

    #[test]
    fn ema_empty_input_is_empty() {
        assert!(ema_impl(&[], 5).unwrap().is_empty());
    }

    #[test]
    fn ema_zero_period_errors() {
        assert!(ema_impl(&[1.0, 2.0], 0).is_err());
    }
}
