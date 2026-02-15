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
- `GET /api/v1/macro/history` (historical macro/forex points via FRED/ECB)
- `GET /api/v1/news/headlines` (RSS + GDELT + Finviz aggregation contract)
  - `GET /api/v1/backtest/capabilities` (GCT backtester capabilities + strategy example discovery)
  - `GET /api/v1/stream/market` (SSE quote events via GCT connector)
- Connector currently calls live GCT RPC endpoints:
  - `/v1/getinfo` for health reachability
  - `/v1/getticker` for quotes
- First non-crypto adapter is active:
  - `exchange=ecb` + `assetType=forex` routes to ECB daily FX feed (`eurofxref-daily.xml`)
- Second non-crypto adapter slice is active:
  - `exchange=finnhub` + `assetType=equity` routes to Finnhub quote endpoint
- Finnhub stock stream slice is active:
  - `GET /api/v1/stream/market?symbol=AAPL&exchange=finnhub&assetType=equity` routes to Finnhub WebSocket (`trade` events), with polling fallback via quote endpoint
- Third non-crypto adapter slice is active:
  - `exchange=fred` + `assetType=macro` routes to FRED latest observation endpoint
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
- `http://127.0.0.1:9060/api/v1/quote?symbol=AAPL&exchange=finnhub&assetType=equity`
- `http://127.0.0.1:9060/api/v1/quote?symbol=CPIAUCSL&exchange=fred&assetType=macro`
- `http://127.0.0.1:9060/api/v1/macro/history?symbol=CPIAUCSL&exchange=fred&assetType=macro&limit=30`
- `http://127.0.0.1:9060/api/v1/macro/history?symbol=EUR/USD&exchange=ecb&assetType=forex&limit=30`
- `http://127.0.0.1:9060/api/v1/news/headlines?symbol=AAPL&limit=3`
- `http://127.0.0.1:9060/api/v1/stream/market?symbol=AAPL&exchange=finnhub&assetType=equity`
- `http://127.0.0.1:9060/api/v1/backtest/capabilities`

Environment for Finnhub:

- `FINNHUB_BASE_URL` (default: `https://finnhub.io/api/v1`)
- `FINNHUB_WS_BASE_URL` (default: `wss://ws.finnhub.io`)
- `FINNHUB_API_KEY`
- `FINNHUB_HTTP_TIMEOUT_MS` (default: `4000`)

Environment for FRED:

- `FRED_BASE_URL` (default: `https://api.stlouisfed.org/fred`)
- `FRED_API_KEY`
- `FRED_HTTP_TIMEOUT_MS` (default: `4000`)

Environment for News:

- `NEWS_HTTP_TIMEOUT_MS` (default: `4000`)
- `NEWS_HTTP_RETRIES` (default: `1`)
- `NEWS_RSS_FEEDS` (comma-separated feed URLs)
- `GDELT_BASE_URL` (default: `https://api.gdeltproject.org/api/v2/doc/doc`)
- `FINVIZ_RSS_BASE_URL` (default: `https://finviz.com/rss.ashx`)

Environment for Backtest capability discovery:

- `GCT_STRATEGY_EXAMPLES_DIR` (default: `vendor-forks/gocryptotrader/backtester/config/strategyexamples`)

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
