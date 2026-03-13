// SOTA 2026: wasm-bindgen Module Pattern
// Build: wasm-pack build --target web --release
//
// Cargo.toml:
//   [lib]
//   crate-type = ["cdylib"]
//   [dependencies]
//   wasm-bindgen      = "0.2"
//   web-sys           = { version = "0.3", features = ["console"] }
//   serde             = { version = "1", features = ["derive"] }
//   serde-wasm-bindgen= "0.6"
//   [profile.release]
//   opt-level = "s"   # size optimization for WASM

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// ─────────────────────────────────────────────
// CONSOLE LOGGING (replaces println! in WASM)
// ─────────────────────────────────────────────

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}

// ─────────────────────────────────────────────
// SIMPLE SCALAR EXPORTS
// Float64Array ↔ &[f64] is zero-copy via wasm_bindgen
// ─────────────────────────────────────────────

#[wasm_bindgen]
pub fn compute_ema(prices: &[f64], period: usize) -> Vec<f64> {
    // Reuse same inner fn as PyO3 — shared core logic
    ema_impl(prices, period)
}

#[wasm_bindgen]
pub fn compute_sma(prices: &[f64], period: usize) -> Vec<f64> {
    sma_impl(prices, period)
}

#[wasm_bindgen]
pub fn compute_rsi(prices: &[f64], period: usize) -> Vec<f64> {
    rsi_impl(prices, period)
}

// ─────────────────────────────────────────────
// COMPLEX TYPES — use serde-wasm-bindgen
// ─────────────────────────────────────────────

#[derive(Serialize, Deserialize)]
pub struct IndicatorBundle {
    pub ema: Vec<f64>,
    pub sma: Vec<f64>,
    pub rsi: Vec<f64>,
}

#[wasm_bindgen]
pub fn compute_bundle(prices: &[f64], period: usize) -> JsValue {
    let bundle = IndicatorBundle {
        ema: ema_impl(prices, period),
        sma: sma_impl(prices, period),
        rsi: rsi_impl(prices, period),
    };
    // serde-wasm-bindgen: Rust struct → JS object
    serde_wasm_bindgen::to_value(&bundle).unwrap_or(JsValue::NULL)
}

// Accept complex input from JS:
#[wasm_bindgen]
pub fn process_config(config: JsValue) -> JsValue {
    #[derive(Deserialize)]
    struct Config {
        period: usize,
        smoothing: f64,
    }

    match serde_wasm_bindgen::from_value::<Config>(config) {
        Ok(cfg) => {
            console_log!("config: period={}, smoothing={}", cfg.period, cfg.smoothing);
            serde_wasm_bindgen::to_value(&cfg.period).unwrap_or(JsValue::NULL)
        }
        Err(e) => {
            console_log!("invalid config: {e}");
            JsValue::NULL
        }
    }
}

// ─────────────────────────────────────────────
// STATEFUL WASM CLASS (wasm_bindgen on struct)
// ─────────────────────────────────────────────

#[wasm_bindgen]
pub struct StreamingEma {
    alpha: f64,
    last: Option<f64>,
}

#[wasm_bindgen]
impl StreamingEma {
    #[wasm_bindgen(constructor)]
    pub fn new(period: usize) -> Self {
        Self {
            alpha: 2.0 / (period as f64 + 1.0),
            last: None,
        }
    }

    pub fn update(&mut self, value: f64) -> f64 {
        let next = match self.last {
            Some(prev) => self.alpha * value + (1.0 - self.alpha) * prev,
            None => value,
        };
        self.last = Some(next);
        next
    }

    pub fn reset(&mut self) {
        self.last = None;
    }
}

// ─────────────────────────────────────────────
// INNER PURE LOGIC — shared with PyO3 (same crate or shared lib)
// ─────────────────────────────────────────────

fn ema_impl(values: &[f64], period: usize) -> Vec<f64> {
    if values.is_empty() || period == 0 {
        return Vec::new();
    }
    let alpha = 2.0 / (period as f64 + 1.0);
    let mut out = Vec::with_capacity(values.len());
    out.push(values[0]);
    for &v in &values[1..] {
        let prev = *out.last().expect("non-empty");
        out.push(alpha * v + (1.0 - alpha) * prev);
    }
    out
}

fn sma_impl(values: &[f64], period: usize) -> Vec<f64> {
    if period == 0 {
        return values.to_vec();
    }
    let mut out = Vec::with_capacity(values.len());
    let mut sum = 0.0_f64;
    for (i, &v) in values.iter().enumerate() {
        sum += v;
        if i >= period {
            sum -= values[i - period];
        }
        out.push(sum / period.min(i + 1) as f64);
    }
    out
}

fn rsi_impl(values: &[f64], period: usize) -> Vec<f64> {
    if values.len() < 2 || period == 0 {
        return vec![50.0; values.len()];
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
    avg_g.iter().zip(avg_l.iter())
        .map(|(&g, &l)| if l == 0.0 { 100.0 } else { 100.0 - 100.0 / (1.0 + g / l) })
        .collect()
}

// ─────────────────────────────────────────────
// JS USAGE (after wasm-pack build --target web):
//
//   import init, { compute_ema, StreamingEma } from './pkg/my_wasm.js';
//   await init();
//
//   const prices = new Float64Array([100, 101, 102, 103]);
//   const ema = compute_ema(prices, 3);   // zero-copy Float64Array
//
//   const streaming = new StreamingEma(14);
//   const current = streaming.update(105.5);
// ─────────────────────────────────────────────
