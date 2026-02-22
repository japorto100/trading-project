# ADR-001: Streaming Architecture for Market Data + Alerts

> **Stand:** 19. Februar 2026
> **Konsolidiert aus:** `ADR-001` (original), `ZUSATZ_GAP_CHECK.md`, `PERSISTENCE_MODEL.md`, `BACKEND_SETUP.md`, `SIGNAL_FORMULAS.md`
> Veraltete/historische Inhalte der konsolidierten Dateien liegen in `archive/SUPERSEDED_CODEX_DOCS.md`.

## Status
Proposed

---

## 1. Streaming-Architektur (Kerndesign)

### Context
Current fusion mode uses REST polling (`/api/market/quote`, `/api/market/ohlcv`) with local alert evaluation.
To support lower latency and scalable alerting, we need a streaming-capable architecture.

### Decision
Adopt a staged architecture with three layers:

**1. Ingestion**
- Provider WebSocket clients (Twelve/Finnhub/others)
- Normalize incoming ticks to canonical symbols
- Publish normalized ticks into an internal stream channel

**2. Processing**
- Candle builder service aggregates ticks into target timeframes
- Alert engine evaluates:
  - price threshold alerts
  - cross events (line-based)
  - optional indicator-based triggers
- Persist latest candles and alert state snapshots

**3. Delivery**
- Frontend subscribes via server WebSocket/SSE
- Push incremental chart updates (`update(...)` path) and alert notifications
- Fallback to REST polling if stream unavailable

### Component Sketch
- `ws-ingestor`: provider sockets, reconnect/backoff, heartbeat
- `symbol-normalizer`: alias -> canonical (`BTC/USD`, etc.)
- `candle-aggregator`: tick -> OHLCV bars
- `alert-engine`: stateless evaluator + state store
- `stream-gateway`: multiplexed client subscriptions
- `snapshot-store`: latest quote/candle/alert state for recovery

### Risks
- Provider limits and disconnect behavior vary by plan/tier.
- Clock drift and out-of-order ticks can corrupt candle boundaries.
- Alert deduplication can fail under reconnect/replay unless state checkpoints are robust.
- Multi-provider blending requires deterministic precedence/failover rules.

### Migration Path
1. Keep existing REST endpoints as source of truth.
2. Add internal ingestion + normalization service in parallel.
3. Feed candle builder and expose debug stream endpoint.
4. Switch chart updates to stream-first with REST fallback.
5. Move alert checks from client polling to server alert-engine.
6. Add replay/recovery via snapshot-store.

---

## 2. Offene Punkte (konsolidiert)

### 2.1 Drawing Object Model + Persistence
- Drawing toolbar is currently UI-only workflow
- Needs a real persistence layer for drawing objects (lines, polygons, text)
- Existing Prisma schema has `GeoDrawingType` (line, polygon, text) as String field (SQLite)
- Requires: object model definition, API endpoints for CRUD, sync between sessions

### 2.2 Integration / E2E Flow
- Full flow: search -> chart reload -> favorite persistence needs end-to-end wiring
- Current state: individual parts work (search, chart, favorites), but no integration test or seamless flow

### 2.3 Screener / Scanner Workflow
- Broader screener/scanner workflow not yet designed
- Strategy presets (pre-configured signal combinations) not implemented
- Would build on top of Composite Signal (see `INDICATOR_ARCHITECTURE.md` Sektion 3)

### 2.4 Signal Formulas -- Quick Reference

Die vollstaendige Indikator-Dokumentation liegt in [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md).
Hier die Kurzreferenz der aktuell aktiven Signal-Formeln (Line / Power / Rhythm):

| Signal | Indikator | Formel | Implementierung |
|--------|-----------|--------|-----------------|
| **Line** | SMA(50) | `SMA_n(t) = sum(close_t...close_(t-n+1)) / n` | `src/lib/indicators/index.ts` → `calculateSMA()` |
| **Line** | SMA Cross | `cross_up`: prev close < prev SMA && curr close >= curr SMA | `detectSMACrossEvents()`, `getSMACrossAlertTemplates()` |
| **Power** | VWMA | `sum(close_i * vol_i) / sum(vol_i)` ueber n Bars | `calculateVWMA()` |
| **Power** | RVOL | `volume_t / avg(volume, n)` | `calculateRVOL()` |
| **Power** | OBV | kumulativ: `+vol` bei close up, `-vol` bei close down | `calculateOBV()` |
| **Power** | CMF | `sum(MFV) / sum(vol)` mit `MFM = ((C-L)-(H-C))/(H-L)` | `calculateCMF()` |
| **Rhythm** | Heartbeat | ZigZag-Pivots → CV(intervals) + CV(amplitudes) → score | `analyzeHeartbeatPattern()` |
| **Channel** | SMA±ATR | `middle = SMA(close)`, `upper/lower = middle ± ATR * mult` | `calculateSMAATRChannel()` |

**UI Binding:**
- Signal strip: `src/features/trading/SignalInsightsBar.tsx`
- Data selection: `src/app/page.tsx` (`signalSnapshot` memo)

### 2.5 Persistence -- Aktueller Stand

> Die Persistence-Schicht wurde von PostgreSQL auf **SQLite** migriert (siehe `SQLITE_MIGRATION.md`).

**Runtime Storage Adapter:**
- `src/lib/storage/adapter.ts`: `createLocalJsonStorageAdapter()`, `createDbReadyJsonStorageAdapter()`
- `src/lib/storage/preferences.ts`: typed preferences (favorites, layout)
- Local storage aktiv per default; DB-ready adapter kann spaeter auf Server-Persistence umgestellt werden

**DB-Ready Data Model (Prisma, SQLite):**
- `prisma/schema.prisma`
- Entities: `UserProfile`, `Watchlist`, `WatchlistItem`, `PriceAlertRecord`, `LayoutPreference`
- `profileKey` erlaubt anonyme Persistence ohne Login
- Enums als Strings (SQLite-Limitation), Validierung im Anwendungscode (Zod)

**API Scaffold:**
- `GET /api/fusion/persistence/status`
- `GET /api/fusion/preferences?profileKey=...`
- `PUT /api/fusion/preferences`
- Server helpers: `src/lib/server/prisma.ts`, `src/lib/server/persistence-mappers.ts`

**Migration Path (wenn DB aktiviert wird):**
1. Set `DATABASE_URL` in `.env` (default: `file:./dev.db`)
2. `pnpm db:generate` + `pnpm db:push`
3. Replace `createDbReadyJsonStorageAdapter()` internals mit API/DB calls
4. Keep local adapter als Fallback/Offline-Mode

---

## 3. Was bereits abgedeckt ist (Stand 19.02.2026)

- Provider-backed OHLCV in main chart with demo fallback
- Alerts wired to live quote polling
- Symbol normalization across UI/API/alerts
- Page modularization into feature components
- Signal package with Daily SMA50 line logic + power/rhythm metrics
- Incremental chart update path
- Replay preview mode
- Persistence model + backend API scaffold
- VWAP overlay toggle and rendering
- ATR toggle/period with chart metric strip + signal bar value
- VWMA overlay toggle/period with chart rendering
- SMA ± ATR channel overlay (upper/middle/lower)
- Alert reproducibility check (self-check for above/below + duplicate prevention)
- Backend API routes (persistence status, preferences, anonymous profileKey sync)

---

## Querverweis

| Thema | Dokument |
|-------|----------|
| Indikator-Architektur + ~57 Todos | [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) |
| Rust Acceleration Layer | [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) |
| Provider Rate Limits + News Sources | [`PROVIDER_LIMITS.md`](./PROVIDER_LIMITS.md) |
| Setup, Scripts, DB, Troubleshooting | [`README.md`](../README.md) |
| Geopolitical Map | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) |
| Portfolio Architektur | [`Portfolio-architecture.md`](./Portfolio-architecture.md) |
| Archivierte Codex-Docs | [`archive/SUPERSEDED_CODEX_DOCS.md`](./archive/SUPERSEDED_CODEX_DOCS.md) |
