# GoCryptoTrader Fork Notes (Review 2026-02-14)

## What was done

- Upstream source mirrored locally to:
  - `go-backend/vendor-forks/gocryptotrader`
- Source review performed for:
  - feature surface (`README.md`)
  - runtime defaults (`config_example.json`)
  - RPC layer presence (`gctrpc/*`)

## Verified observations

- GCT provides broad exchange coverage, WebSocket support, backtester, portfolio features, and gRPC + JSON-RPC gateway.
- GCT is bot-oriented and ships generic defaults.
- `config_example.json` includes insecure remote control defaults (`admin` / `Password`) and must not be used unchanged.

## Architecture decision

- Use GCT as **engine layer**, not as direct frontend API.
- Keep a dedicated `go-backend` gateway that owns:
  - auth/security boundaries
  - app-specific DTO contracts
  - symbol normalization
  - endpoint exposure policy

## Environment status

- `git` and `go` are available in this workspace.
- Go toolchain and caches are configured for reproducible local runs.

## Next implementation slice

1. Start GCT with hardened config (localhost-only, non-default creds).
2. Implement one live connector path (`BTC/USDT` quote + stream) in gateway.
3. Feed Next.js from gateway (`/api/v1/quote`, `/api/v1/stream/market`).

## Fork check: duplicate-work assessment (2026-02-14)

Reviewed areas in `vendor-forks/gocryptotrader`:

- `gctrpc/rpc.proto` + generated `rpc.pb.gw.go` already expose:
  - `POST /v1/getticker`
  - `POST /v1/getinfo`
  - ticker stream endpoints
- `gctrpc/auth` and `engine/rpcserver.go` already implement BasicAuth flow for RPC.
- `cmd/gctcli/commands.go` already demonstrates canonical `GetTicker` request shape (`exchange`, `pair`, `assetType`).

Conclusion:

- No duplicate work inside the fork itself: we are not re-implementing exchange logic.
- Gateway connector code intentionally remains thin as anti-corruption layer (contracts, validation, error mapping) in `go-backend/internal/connectors/gct`.
- Future reduction of glue code is possible by switching the connector from HTTP JSON-RPC calls to direct gRPC client usage against `gctrpc` types.

## Runtime findings from local fork execution

- Fork binary builds successfully from repo root via `go build .` (`gocryptotrader.exe` produced).
- In this workspace, default GCT data dir under `%APPDATA%` is not writable for cert generation; use writable override:
  - `-datadir D:\\Temp\\gct-data`
- gRPC proxy exposes TLS on `9053`; gateway JSON-RPC address must use `https://...`.
- Gateway health is now able to connect to local GCT when configured with:
  - `GCT_JSONRPC_ADDRESS=https://127.0.0.1:9053`
  - `GCT_JSONRPC_INSECURE_TLS=true` (local self-signed cert case)
- Quote path root cause and fix:
  - GCT returns `lastUpdated` as string payload in `/v1/getticker`.
  - Gateway connector now parses both numeric and string timestamps.
  - Verified end-to-end `200` for `GET /api/v1/quote?symbol=BTC/USDT&exchange=binance&assetType=spot` in minimal stack mode.
- SSE stream slice:
  - `GET /api/v1/stream/market` now emits live `quote` events from GCT connector (with `ready`, `heartbeat`, and `upstream_error` event types).
  - Stream context fix applied: long-lived gRPC ticker stream is no longer bound to unary request timeout.
  - Config regression fix applied: `GCT_PREFER_GRPC=false` is now respected by connector initialization.
  - Verified end-to-end against minimal profile (`Binance`, `BTC-USDT`): `/health` 200, `/api/v1/quote` 200, `/api/v1/stream/market` emits `ready` + `quote`.
  - Verified fallback behavior: with `GCT_PREFER_GRPC=false`, `/health` and `/api/v1/quote` still return 200 via HTTP JSON-RPC path.
  - Go quality gates executed for this slice: `go test ./...`, `go vet ./...`, `go test -race ./...` (`CGO_ENABLED=1`, `gcc` in PATH).

## Gateway extension beyond fork

- First non-crypto adapter added at gateway level:
  - `exchange=ecb` + `assetType=forex` is served via official ECB daily FX feed (`eurofxref-daily.xml`).
- Second non-crypto adapter slice added at gateway level:
  - `exchange=finnhub` + `assetType=equity` routes to Finnhub `/quote` (API key based).
- Third non-crypto adapter slice added at gateway level:
  - `exchange=fred` + `assetType=macro` routes to FRED `/series/observations` (API key based).
- News aggregation slice added at gateway level:
  - `GET /api/v1/news/headlines` merges RSS + GDELT + Finviz feeds into one contract.
- This keeps GCT focused as crypto engine while the gateway starts handling multi-asset routing under one contract.
