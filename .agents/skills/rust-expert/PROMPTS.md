# Rust Expert — SOTA 2026 Prompts

## PyO3 / Python Bridge

- "Add a new `#[pyfunction]` to rust_core for [computation]."
- "Extend the PyO3 module with batch [indicator] support."
- "How do I pass a numpy array zero-copy from Python to Rust?"
- "Migrate this Python function to Rust via PyO3: [paste function]."
- "Why is my PyO3 function returning a GIL error?"
- "Set up `maturin` for a new cdylib crate."
- "How do I use `abi3-py311` for a stable ABI wheel?"

## gRPC / Tonic Service

- "Scaffold a standalone Tonic gRPC server for signal computation."
- "Generate a `.proto` definition for [domain] and its Rust implementation."
- "Add Tower middleware for auth + tracing to this Tonic service."
- "Implement graceful shutdown for a Tonic server."
- "Create a gRPC health-check endpoint using `tonic-health`."
- "How do I map domain errors to `tonic::Status` codes?"
- "Add bidirectional streaming to this gRPC service."
- "Set up `tonic-build` in `build.rs` for proto compilation."

## WASM / Frontend Compute

- "Create a `wasm-bindgen` module exposing [indicator] to JavaScript."
- "How do I pass a `Float64Array` from JS to Rust zero-copy?"
- "Build and integrate a WASM module into Next.js/Vite."
- "Optimize WASM bundle size with `wasm-opt`."
- "How do I serialize complex structs between Rust WASM and TypeScript?"
- "What's the right `wasm-pack` target for Next.js ESM import?"

## Async & Concurrency

- "Parallelize this indicator loop with Rayon."
- "Convert this blocking computation to `spawn_blocking` in Tokio."
- "Add `CancellationToken` + `JoinSet` graceful shutdown."
- "Debug this async deadlock / task starvation."
- "How do I combine Tokio and Rayon without blocking the runtime?"
- "Add timeout handling to all outbound gRPC calls."

## Error Handling

- "Design error types for [crate] — should I use `thiserror` or `anyhow`?"
- "Refactor these `.unwrap()` calls to proper `Result` propagation."
- "Map internal `CacheError` to `PyValueError` for the PyO3 boundary."
- "Add context to error chains using `anyhow::Context`."
- "When should I use `Box<dyn Error>` vs a typed error enum?"

## Cargo & Workspace

- "Set up a Cargo workspace for `rust-core` + `rust-signal-processor`."
- "Consolidate shared dependencies in `[workspace.dependencies]`."
- "Configure release profile with LTO for minimum binary size."
- "Why is my workspace build slow — diagnose dependency duplication."
- "Add `cargo-deny` or `cargo-audit` to CI for supply chain checks."
- "How do I migrate from edition 2021 to 2024?"

## Testing & Quality

- "Write `#[cfg(test)]` unit tests for [function] using `approx`."
- "Add a `tempfile`-based integration test for the redb cache."
- "Set up `#[tokio::test]` for async handler tests."
- "Add fuzz testing with `cargo-fuzz` for [parser]."
- "Configure clippy to deny `unwrap_used` in library code."
- "Generate table-driven tests for [function] with edge cases."

## Performance & Profiling

- "Profile this indicator function — where is the allocation hot spot?"
- "Replace this `Vec<Vec<f64>>` with a flat buffer for cache locality."
- "Use `Vec::with_capacity` to eliminate reallocations in [function]."
- "Is this computation worth porting from Python to Rust? Show me the tradeoffs."
- "Add SIMD support to this summation loop using `std::simd`."
- "Benchmark PyO3 overhead vs pure Rust for [batch size]."

## Observability

- "Add `#[instrument]` tracing to all public functions in [module]."
- "Set up `opentelemetry-otlp` exporter for the Rust gRPC service."
- "Configure JSON log output for production with `tracing-subscriber`."
- "Add span attributes for signal ID, asset, and timeframe."
- "Wire Rust traces into the unified OTel pipeline (Go + Python + Rust)."

## Compute Migration Decision

- "Should I port [Python function] to Rust? Help me decide."
- "What is the Go→Rust boundary for Phase 19?"
- "Which Monte Carlo paths should stay in NumPy vs move to Rust?"
- "Audit `indicator-service` for Rust-migration candidates."
