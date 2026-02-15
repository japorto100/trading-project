# Go Backend (Gateway + GCT Fork Base)

This folder hosts the Go layer for Tradeview Fusion.

## Goals

- Run GoCryptoTrader as the exchange/connectivity engine (crypto-first).
- Expose a stable, app-specific API surface to Next.js through a thin gateway.
- Keep security, symbol normalization, and contracts under our control.

## Structure

- `vendor-forks/gocryptotrader/`
  - Local fork base (downloaded source mirror of upstream).
- `cmd/gateway/`
  - Gateway entrypoint.
- `internal/`
  - Contracts, handlers, connectors, app wiring.
- `configs/`
  - Gateway env config and GCT notes.

## Why not expose GCT directly?

- GCT is feature-rich, but bot-oriented and generic by default.
- We need product-specific contracts for frontend/API stability.
- We must harden defaults (auth, ports, allowed endpoints, symbol mapping).

## Current status

- Local GCT fork base is present at `go-backend/vendor-forks/gocryptotrader`.
- Gateway skeleton is in place with:
  - `GET /health`
  - `GET /api/v1/quote` (stable multi-source contract: GCT + ECB)
  - `GET /api/v1/stream/market` (SSE quote events via GCT connector)
- Connector currently calls live GCT RPC endpoints:
  - `/v1/getinfo` for health reachability
  - `/v1/getticker` for quotes
- First non-crypto adapter is active:
  - `exchange=ecb` + `assetType=forex` routes to ECB daily FX feed (`eurofxref-daily.xml`)
- Quote endpoint has strict input validation + explicit gateway/upstream error mapping (`400`, `502`, `504`).
- SSE stream now emits:
  - `ready` event (resolved params)
  - `quote` event (live quote payloads)
  - `heartbeat` / `upstream_error` events for liveness and failure signaling

## Run (gateway skeleton)

```powershell
cd go-backend
go run ./cmd/gateway
```

Expected:

- `http://127.0.0.1:9060/health`
- `http://127.0.0.1:9060/api/v1/quote?symbol=BTC/USDT&exchange=binance&assetType=spot`
- `http://127.0.0.1:9060/api/v1/quote?symbol=EUR/USD&exchange=ecb&assetType=forex`

## Run (full local stack, minimal GCT profile)

```powershell
cd go-backend
.\scripts\dev-stack.ps1
```

What this does:

- creates a minimal local GCT config in `D:\Temp\gct-data\config.min.json`
- keeps only one exchange active (default: `Binance`)
- sets a focused spot pair (default: `BTC-USDT`)
- starts GCT with gRPC proxy and then the gateway with matching env vars

## Quality gates (Windows)

```powershell
cd go-backend
.\scripts\test-go.ps1
```

Optional:

- skip race run: `.\scripts\test-go.ps1 -SkipRace`
- custom GCC path: `.\scripts\test-go.ps1 -GccBin C:\msys64\ucrt64\bin`
