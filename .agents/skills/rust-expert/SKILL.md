---
name: rust-expert
description: >
  Expert guidance for modern Rust development (SOTA 2026). Covers production systems,
  PyO3/Python bridges, Tonic gRPC services, WASM modules, async Tokio, Rayon, error
  handling, Cargo workspaces, tracing, and performance tuning. Use when writing new
  Rust code, creating PyO3 extension modules, planning a gRPC service, building WASM
  modules, migrating hot paths to Rust, or reviewing Rust for correctness and safety.
  Triggers on: Cargo.toml, *.rs files, PyO3, Tonic, wasm-bindgen questions.
---

# Rust Expert (SOTA 2026)

Provide practical, production-oriented Rust guidance. Correctness first, then
performance. Prefer explicit over clever. Rust is a precision tool — use it where it
measurably wins, not everywhere.

## When To Use

- Writing new Rust code or extending an existing Rust extension module
- Migrating a CPU-heavy path to Rust (indicators, Monte Carlo, batch compute, pattern scan)
- Planning or implementing a Tonic gRPC service
- Building a WASM module for frontend or browser compute
- Structuring a Cargo workspace across multiple crates
- Choosing between `thiserror` / `anyhow` / custom error types
- Writing async code with Tokio or CPU-parallel code with Rayon
- Setting up `tracing` + OpenTelemetry
- Reviewing Rust for safety, clippy compliance, and test coverage

## Core Principles

1. **Safe by default** — `unwrap()` only in tests; `expect("reason")` or `?` everywhere else.
2. **Inner logic stays pure** — separate business logic from FFI (PyO3/WASM) wrappers.
3. **Benchmark before porting** — profile first; migrate only what is proven to be a bottleneck.
4. **Edition 2021** — stable and battle-tested; migrate to 2024 deliberately with `cargo fix --edition`.
5. **Clippy is the bar** — `cargo clippy --all-targets -- -D warnings` must pass before merge.

---

## 1. Cargo & Workspace

```toml
# workspace Cargo.toml
[workspace]
resolver = "2"
members  = ["rust-core", "rust-service"]

[workspace.dependencies]
tokio       = { version = "1", features = ["full"] }
tonic       = "0.12"
pyo3        = { version = "0.23", features = ["extension-module"] }
redb        = "2"
thiserror   = "2"
anyhow      = "2"
serde       = { version = "1", features = ["derive"] }
tracing     = "0.1"
rayon       = "1"

[profile.release]
lto           = true
codegen-units = 1
opt-level     = 3
strip         = "symbols"
```

→ Full template: `examples/workspace_cargo.toml`

---

## 2. Error Handling

| Context | Crate | Rule |
|:--------|:------|:-----|
| Library / crate-internal types | `thiserror 2.0` | Callers need matchable enum arms |
| Binary / `main.rs` / top-level app | `anyhow 2.0` | Errors are logged, not matched |
| PyO3 bridge | `thiserror` enum → `.map_err(\|e\| PyValueError::new_err(e.to_string()))` | Python sees only string |
| Tonic gRPC service | `thiserror` → `impl From<E> for tonic::Status` | gRPC needs Status codes |

→ Full patterns: `examples/error_types.rs`

---

## 3. Async & Concurrency

- **Tokio** for I/O-bound async — `#[tokio::main]`, `#[tokio::test]`
- **Rayon** for CPU-bound parallel — `par_iter()` on compute loops
- **Never** block inside a Tokio task — use `tokio::task::spawn_blocking`
- **Graceful shutdown** — `CancellationToken` + `JoinSet`
- `tokio::time::timeout(Duration, future)` on every external call

→ Full patterns: `examples/async_tokio.rs`

---

## 4. PyO3 Bridge

```toml
pyo3 = { version = "0.23", features = ["extension-module", "abi3-py311"] }
[lib]
crate-type = ["cdylib"]
```

```rust
// ALWAYS: inner pure fn (testable without Python runtime)
fn ema_impl(values: &[f64], period: usize) -> Vec<f64> { /* ... */ }

// PyO3 wrapper = type conversion + error mapping ONLY
#[pyfunction]
fn ema(values: Vec<f64>, period: usize) -> PyResult<Vec<f64>> {
    if period == 0 { return Err(PyValueError::new_err("period > 0 required")); }
    Ok(ema_impl(&values, period))
}

#[pymodule]
fn my_module(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(ema, m)?)?;
    m.add("__version__", env!("CARGO_PKG_VERSION"))?;
    Ok(())
}
```

- `abi3-py311` → one binary for Python 3.11/3.12/3.13
- `maturin develop --release` locally · `maturin build --release` in CI
- GIL-free possible with `pyo3 >= 0.23` + `#[pyclass(frozen)]`

→ Full module: `examples/pyo3_bridge.rs`

---

## 5. Tonic gRPC

```toml
# build-dependencies
tonic-build = "0.12"
```

```rust
// build.rs
fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true)
        .compile_protos(&["proto/signals.proto"], &["proto"])?;
    Ok(())
}
```

Key practices:
- Tower layers for auth, logging, timeouts — not inline middleware
- `tonic-health` crate for liveness/readiness
- Graceful shutdown: `Server::with_graceful_shutdown(signal)`
- `impl From<DomainError> for tonic::Status` — never expose internals raw
- Keep messages < 1 MB; large payloads → streaming or external store

→ Full server: `examples/tonic_grpc.rs`

---

## 6. WASM

```toml
wasm-bindgen        = "0.2"
web-sys             = { version = "0.3", features = ["CanvasRenderingContext2d"] }
serde-wasm-bindgen  = "0.6"
[lib]
crate-type = ["cdylib"]
```

```rust
#[wasm_bindgen]
pub fn compute_ema(prices: &[f64], period: usize) -> Vec<f64> {
    ema_impl(prices, period)   // reuses same pure inner fn as PyO3
}
```

- `wasm-pack build --target web` for ESM import in Next.js/Vite
- `wasm-opt -O3` in CI for smallest bundle
- `Float64Array` ↔ `&[f64]` is zero-copy via `wasm_bindgen`
- Serde complex types: `serde_wasm_bindgen::to_value(&result)?`

→ Full module: `examples/wasm_module.rs`

---

## 7. redb Embedded Cache

Pattern: `OnceLock<Mutex<HashMap<String, Arc<Database>>>>` as global DB pool.
One `Arc<Database>` per file path, created once, shared across calls.

→ Reusable template: `examples/redb_cache.rs`

---

## 8. Tracing & Observability

```toml
tracing            = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }
```

```rust
#[instrument(skip(payload), fields(len = payload.len()))]
pub async fn process(id: &str, payload: &[f64]) -> Result<(), AppError> {
    tracing::info!(signal_id = id, "processing signal");
    Ok(())
}
```

- JSON format in production (`tracing_subscriber::fmt().json()`)
- `RUST_LOG=info,my_crate=debug` via `EnvFilter::from_default_env()`
- For OTel: `tracing-opentelemetry` + `opentelemetry-otlp` → unified trace pipeline

→ Full setup: `examples/observability.rs`

---

## 9. Testing

```toml
[dev-dependencies]
approx   = "0.5"   # assert_abs_diff_eq!(got, 1.5, epsilon = 1e-9) — REQUIRED for f64
tempfile = "3"     # tmp dirs for redb / file tests
tokio    = { version = "1", features = ["test-util"] }
```

Rules:
- Pure inner logic always has `#[cfg(test)] mod tests { ... }` — no FFI needed
- Float comparisons: **always `approx`** — `assert_eq!` fails on f64
- `#[tokio::test]` for async — never `block_on` in test
- Integration tests in `tests/` (Cargo convention, not inside `src/`)
- `cargo test --all-features` in CI

---

## 10. Safety & Clippy Policy

```bash
cargo clippy --all-targets --all-features -- -D warnings
cargo fmt --check
cargo test --all-features
```

Add to library crate roots:
```rust
#![warn(clippy::unwrap_used, clippy::panic, clippy::indexing_slicing)]
```

| Rule | Where |
|:-----|:------|
| No `unwrap()` | library code + production bins |
| No `panic!` | library crate |
| `.get(i)` over `[i]` | hot paths with user-controlled input |
| `#[allow(...)]` | only with comment explaining why |

---

## 11. Performance Patterns

| Situation | Pattern |
|:----------|:--------|
| Batch compute over slices | `rayon::par_iter()` |
| Incremental indicator updates | O(1) state machine, no re-scan |
| Avoid heap in hot loop | `Vec::with_capacity(n)` upfront |
| Zero-copy to Python | `PyReadonlyArray` (numpy feature) |
| Zero-copy to WASM | `&[f64]` ↔ `Float64Array` |
| SIMD (opt-in) | `std::simd` (nightly) or `wide` crate |

---

## 12. Pre-Merge Checklist

```
□ cargo clippy --all-targets --all-features -- -D warnings  → 0 errors
□ cargo fmt --check                                          → clean
□ cargo test --all-features                                  → all green
□ No unwrap()/expect() without reason string in prod paths
□ Inner logic separated from FFI wrapper (testable standalone)
□ New PyO3 fn: maturin develop + python smoke-test
□ New gRPC method: health-check + integration test
□ Relevant docs updated if applicable
```

---

## Project Context (tradeview-fusion)

This project has additional Rust context: paths, IST/SOLL state, phase roadmap,
and project-specific checklist additions.

→ Read `project-context.md` (sibling file) before making any project-specific decisions.
