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
  - `GET /api/v1/quote` (stable multi-source contract: GCT + ECB + FINNHUB + FRED/FED/BOJ/SNB)
  - `GET /api/v1/macro/history` (historical macro/forex points via FRED/FED/BOJ/SNB/ECB)
  - `GET /api/v1/news/headlines` (RSS + GDELT + Finviz aggregation contract)
  - `GET /api/v1/geopolitical/game-theory/impact` (ACLED filter -> Python scoring contract)
  - `GET /api/v1/backtest/capabilities` (GCT backtester capabilities + strategy example discovery)
  - `POST /api/v1/backtest/runs` (create run lifecycle)
  - `GET /api/v1/backtest/runs` (list latest runs)
  - `GET /api/v1/backtest/runs/{id}` (single run status/result)
  - `POST /api/v1/backtest/runs/{id}/cancel` (cancel queued/running run)
  - `GET /api/v1/backtest/runs/{id}/stream` (SSE progress stream: `ready`, `run`, `heartbeat`, `done`)
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
- Macro central-bank extension is active:
  - `exchange=fed|fred|boj|snb` + `assetType=macro` share the same stable contract
  - BOJ/SNB policy-rate defaults are resolved via FRED-series aliases (`POLICY_RATE`)
- Optional macro ingest/ETL baseline is active:
  - `MACRO_INGEST_ENABLED=true` runs periodic snapshots to `go-backend/data/macro`
- Optional real backtest executor is active (env-gated):
  - default mode: simulated run executor (for local/dev contract validation)
  - real mode: GCT backtester task lifecycle via gRPC (`ExecuteStrategyFromFile` -> `StartTask` -> `ListAllTasks`)
  - real mode includes best-effort report extraction (Strategy Movement, Sharpe, Drawdown, Trades) from generated HTML report artifacts
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
- `http://127.0.0.1:9060/api/v1/quote?symbol=POLICY_RATE&exchange=boj&assetType=macro`
- `http://127.0.0.1:9060/api/v1/quote?symbol=POLICY_RATE&exchange=snb&assetType=macro`
- `http://127.0.0.1:9060/api/v1/macro/history?symbol=CPIAUCSL&exchange=fred&assetType=macro&limit=30`
- `http://127.0.0.1:9060/api/v1/macro/history?symbol=EUR/USD&exchange=ecb&assetType=forex&limit=30`
- `http://127.0.0.1:9060/api/v1/macro/history?symbol=POLICY_RATE&exchange=fed&assetType=macro&limit=30`
- `http://127.0.0.1:9060/api/v1/macro/history?symbol=POLICY_RATE&exchange=boj&assetType=macro&limit=30`
- `http://127.0.0.1:9060/api/v1/macro/history?symbol=POLICY_RATE&exchange=snb&assetType=macro&limit=30`
- `http://127.0.0.1:9060/api/v1/news/headlines?symbol=AAPL&limit=3`
- `http://127.0.0.1:9060/api/v1/geopolitical/game-theory/impact?country=Ukraine&eventType=Battles&from=2026-01-01&to=2026-01-31&limit=50`
- `http://127.0.0.1:9060/api/v1/stream/market?symbol=AAPL&exchange=finnhub&assetType=equity`
- `http://127.0.0.1:9060/api/v1/backtest/capabilities`
- `curl -s -X POST http://127.0.0.1:9060/api/v1/backtest/runs -H \"Content-Type: application/json\" -d '{\"strategy\":\"dca-api-candles.strat\",\"symbol\":\"BTC/USDT\",\"exchange\":\"binance\",\"assetType\":\"spot\"}'`
- `curl -s -X POST http://127.0.0.1:9060/api/v1/backtest/runs/{id}/cancel`
- `http://127.0.0.1:9060/api/v1/backtest/runs/{id}/stream`

Environment for Finnhub:

- `FINNHUB_BASE_URL` (default: `https://finnhub.io/api/v1`)
- `FINNHUB_WS_BASE_URL` (default: `wss://ws.finnhub.io`)
- `FINNHUB_API_KEY`
- `FINNHUB_HTTP_TIMEOUT_MS` (default: `4000`)

Environment for FRED:

- `FRED_BASE_URL` (default: `https://api.stlouisfed.org/fred`)
- `FRED_API_KEY`
- `FRED_HTTP_TIMEOUT_MS` (default: `4000`)

BOJ/SNB/FED series aliases (same FRED connector):

- `exchange=fed` + `symbol=POLICY_RATE` -> `FEDFUNDS`
- `exchange=boj` + `symbol=POLICY_RATE` -> `IRSTCI01JPM156N`
- `exchange=snb` + `symbol=POLICY_RATE` -> `IR3TIB01CHM156N`

Environment for News:

- `NEWS_HTTP_TIMEOUT_MS` (default: `4000`)
- `NEWS_HTTP_RETRIES` (default: `1`)
- `NEWS_RSS_FEEDS` (comma-separated feed URLs)
- `GDELT_BASE_URL` (default: `https://api.gdeltproject.org/api/v2/doc/doc`)
- `FINVIZ_RSS_BASE_URL` (default: `https://finviz.com/rss.ashx`)

Environment for Geopolitical GameTheory bridge:

- `GEOPOLITICAL_GAMETHEORY_URL` (default: `http://127.0.0.1:8091`)
- `GEOPOLITICAL_GAMETHEORY_TIMEOUT_MS` (default: `5000`)

Environment for Backtest capability discovery:

- `GCT_STRATEGY_EXAMPLES_DIR` (default: `vendor-forks/gocryptotrader/backtester/config/strategyexamples`)

Environment for real GCT backtest execution (optional):

- `GCT_BACKTEST_EXECUTOR_ENABLED` (default: `false`)
- `GCT_BACKTEST_GRPC_ADDRESS` (example: `127.0.0.1:9054`)
- `GCT_BACKTEST_USERNAME` (fallback: `GCT_USERNAME`)
- `GCT_BACKTEST_PASSWORD` (fallback: `GCT_PASSWORD`)
- `GCT_BACKTEST_INSECURE_TLS` (default: `false`)
- `GCT_BACKTEST_REQUEST_TIMEOUT_MS` (default: `8000`)
- `GCT_BACKTEST_POLL_INTERVAL_MS` (default: `750`)
- `GCT_BACKTEST_RUN_TIMEOUT_MS` (default: `300000`)
- `GCT_BACKTEST_REPORT_OUTPUT_DIR` (default: `vendor-forks/gocryptotrader/backtester/results`)

Backtest run status model:

- `queued`
- `running`
- `cancel_requested`
- `canceled`
- `completed`
- `failed`

Environment for macro ingest snapshots:

- `MACRO_INGEST_ENABLED` (default: `false`)
- `MACRO_INGEST_INTERVAL_MS` (default: `1800000`)
- `MACRO_INGEST_REQUEST_TIMEOUT_MS` (default: `8000`)
- `MACRO_INGEST_OUTPUT_DIR` (default: `data/macro`)
- `MACRO_INGEST_TARGETS` (optional; format: `EXCHANGE|SYMBOL|ASSET|LIMIT;...`)

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
