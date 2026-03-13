// SOTA 2026: Rust Error Handling Patterns
// Covers: thiserror (library), anyhow (binary), PyO3 bridge, tonic::Status mapping

use std::num::ParseIntError;

// ─────────────────────────────────────────────
// 1. LIBRARY CRATE — thiserror 2.0
//    Use when callers need to match on specific error variants.
// ─────────────────────────────────────────────

#[derive(Debug, thiserror::Error)]
pub enum CacheError {
    #[error("database error: {0}")]
    Db(#[from] redb::Error),

    #[error("ttl must be > 0")]
    InvalidTtl,

    #[error("cache record corrupted")]
    Corrupted,

    #[error("key not found: {key}")]
    NotFound { key: String },
}

#[derive(Debug, thiserror::Error)]
pub enum SignalError {
    #[error("insufficient data: need {need}, got {got}")]
    InsufficientData { need: usize, got: usize },

    #[error("invalid period {period}: must be >= 1")]
    InvalidPeriod { period: usize },

    #[error("cache error: {0}")]
    Cache(#[from] CacheError),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

// ─────────────────────────────────────────────
// 2. BINARY / APPLICATION — anyhow 2.0
//    Use in main.rs, CLI entrypoints, integration glue.
//    Errors are displayed, not matched.
// ─────────────────────────────────────────────

fn run_app() -> anyhow::Result<()> {
    use anyhow::Context as _;

    let config_str = std::fs::read_to_string("config.toml")
        .context("failed to read config.toml")?;

    let _value: u64 = config_str
        .trim()
        .parse()
        .context("config must be a valid u64")?;

    Ok(())
}

// ─────────────────────────────────────────────
// 3. PyO3 BRIDGE — map to PyValueError
//    Never expose internal error types to Python.
//    Pattern: internal Result → .map_err(|e| PyValueError::new_err(e.to_string()))
// ─────────────────────────────────────────────

use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;

fn compute_ema_impl(values: &[f64], period: usize) -> Result<Vec<f64>, SignalError> {
    if period == 0 {
        return Err(SignalError::InvalidPeriod { period });
    }
    if values.len() < period {
        return Err(SignalError::InsufficientData {
            need: period,
            got: values.len(),
        });
    }
    // ... computation
    Ok(values.to_vec())
}

#[pyfunction]
pub fn compute_ema(values: Vec<f64>, period: usize) -> PyResult<Vec<f64>> {
    compute_ema_impl(&values, period)
        .map_err(|e| PyValueError::new_err(e.to_string()))
}

// ─────────────────────────────────────────────
// 4. TONIC gRPC BOUNDARY — map to tonic::Status
//    Convert typed errors to gRPC status codes.
// ─────────────────────────────────────────────

impl From<SignalError> for tonic::Status {
    fn from(e: SignalError) -> Self {
        match e {
            SignalError::InsufficientData { .. } | SignalError::InvalidPeriod { .. } => {
                tonic::Status::invalid_argument(e.to_string())
            }
            SignalError::Cache(CacheError::NotFound { .. }) => {
                tonic::Status::not_found(e.to_string())
            }
            _ => tonic::Status::internal(e.to_string()),
        }
    }
}

// ─────────────────────────────────────────────
// 5. ADDING CONTEXT — anyhow::Context in application code
// ─────────────────────────────────────────────

fn load_and_parse(path: &str) -> anyhow::Result<u64> {
    use anyhow::Context as _;
    let s = std::fs::read_to_string(path)
        .with_context(|| format!("reading file {path}"))?;
    let n: u64 = s.trim().parse()
        .with_context(|| format!("parsing u64 from {path}"))?;
    Ok(n)
}

// ─────────────────────────────────────────────
// 6. SENTINEL ERRORS — reusable typed sentinels
// ─────────────────────────────────────────────

// For simple cases where you need is/as matching without thiserror:
mod sentinel {
    pub static NOT_FOUND: &str = "not_found";

    // Prefer thiserror enums in real code; this is only for illustration.
    #[derive(Debug)]
    pub struct AppError {
        pub kind: &'static str,
        pub message: String,
    }

    impl std::fmt::Display for AppError {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "[{}] {}", self.kind, self.message)
        }
    }

    impl std::error::Error for AppError {}
}
