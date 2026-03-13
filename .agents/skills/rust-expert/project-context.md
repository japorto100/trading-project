# tradeview-fusion — Rust Project Context

> This file is a project-local supplement to the general `rust-expert` skill.
> It is NOT deployed to global skill directories.

## Stack Formula

**Go transports · Python models · Rust accelerates**

| Layer | Rust Role |
|:------|:----------|
| `python-backend/rust_core/` (PyO3 cdylib) | SMA/EMA/RSI/ATR/BB indicators, OHLCV redb cache |
| Tonic gRPC service (Phase 19 roadmap) | Standalone compute service called by Go Gateway |
| WASM module (Phase 22+ roadmap) | Frontend indicator compute, GeoMap spatial queries |
| NOT Rust | Go gateway I/O, Python ML/agents/retrieval, React UI |

## Key Paths

- **Rust core**: `python-backend/rust_core/`
- **Architecture doc**: `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- **Compute migration planning**: `docs/specs/execution/compute_delta.md`
- **Live redb example**: `python-backend/rust_core/src/ohlcv_cache.rs`

## Current IST State (March 2026)

- `pyo3 = "0.23"`, `redb = "2.6"`, `edition = "2021"`
- Indicators implemented in Rust: SMA, EMA, RSI, ATR, Bollinger Bands
- OHLCV cache backed by redb using the `OnceLock<Mutex<HashMap>>` pool pattern
- Phase 19 (Tonic gRPC service) and Phase 22+ (WASM) are planned but not yet started

## Project-Specific Checklist Additions

```
□ maturin develop --release + python smoke-test after any PyO3 change
□ Spec docs: update Stand date + Aenderungshistorie entry
□ New Rust feature → update docs/RUST_LANGUAGE_IMPLEMENTATION.md IST section
```
