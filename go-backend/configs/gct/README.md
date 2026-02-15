# GCT Config Notes

Use `go-backend/vendor-forks/gocryptotrader/config_example.json` as baseline, but override before use:

- change `remoteControl.username` / `remoteControl.password` (never keep defaults)
- keep gRPC + gRPC proxy (`json-rpc`) bound to localhost only
- enable only required exchanges first (phased rollout)
- keep authenticated live trading disabled until paper-flow validation is complete

## Minimal hardening checklist

1. Set strong credentials in `remoteControl`.
2. Keep `listenAddress` and `grpcProxyListenAddress` on `127.0.0.1` / `localhost`.
3. Disable exchanges you do not use for the current slice.
4. Start gateway with matching `GCT_*` env vars from `go-backend/.env.example`.
5. If GCT gRPC proxy is served via TLS (default), set `GCT_JSONRPC_ADDRESS=https://127.0.0.1:9053` and optionally `GCT_JSONRPC_INSECURE_TLS=true` for local self-signed certs.

## Start order (local dev)

1. Start GCT (with hardened config).
2. Start gateway (`go run ./cmd/gateway`).
3. Validate:
   - `GET http://127.0.0.1:9060/health`
   - `GET http://127.0.0.1:9060/api/v1/quote?symbol=BTC/USDT&exchange=binance&assetType=spot`

Shortcut:

- `go-backend/scripts/dev-stack.ps1` builds a minimal runtime profile automatically (single exchange + pair) and starts both services in order.
