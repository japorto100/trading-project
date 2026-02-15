# ADR-001: Streaming Architecture for Market Data + Alerts

## Status
Proposed

## Context
Current fusion mode uses REST polling (`/api/market/quote`, `/api/market/ohlcv`) with local alert evaluation.
To support lower latency and scalable alerting, we need a streaming-capable architecture.

## Decision
Adopt a staged architecture with three layers:

1. Ingestion
- Provider WebSocket clients (Twelve/Finnhub/others)
- Normalize incoming ticks to canonical symbols
- Publish normalized ticks into an internal stream channel

2. Processing
- Candle builder service aggregates ticks into target timeframes
- Alert engine evaluates:
  - price threshold alerts
  - cross events (line-based)
  - optional indicator-based triggers
- Persist latest candles and alert state snapshots

3. Delivery
- Frontend subscribes via server WebSocket/SSE
- Push incremental chart updates (`update(...)` path) and alert notifications
- Fallback to REST polling if stream unavailable

## Component Sketch
- `ws-ingestor`: provider sockets, reconnect/backoff, heartbeat
- `symbol-normalizer`: alias -> canonical (`BTC/USD`, etc.)
- `candle-aggregator`: tick -> OHLCV bars
- `alert-engine`: stateless evaluator + state store
- `stream-gateway`: multiplexed client subscriptions
- `snapshot-store`: latest quote/candle/alert state for recovery

## Risks
- Provider limits and disconnect behavior vary by plan/tier.
- Clock drift and out-of-order ticks can corrupt candle boundaries.
- Alert deduplication can fail under reconnect/replay unless state checkpoints are robust.
- Multi-provider blending requires deterministic precedence/failover rules.

## Migration Path
1. Keep existing REST endpoints as source of truth.
2. Add internal ingestion + normalization service in parallel.
3. Feed candle builder and expose debug stream endpoint.
4. Switch chart updates to stream-first with REST fallback.
5. Move alert checks from client polling to server alert-engine.
6. Add replay/recovery via snapshot-store.
