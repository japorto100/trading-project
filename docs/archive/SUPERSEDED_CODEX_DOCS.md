# Archivierte Codex-generierte Docs

> **Archiviert am:** 19. Februar 2026
> **Grund:** Diese Dokumente wurden automatisch von Codex erstellt und sind durch aktuellere Dokumentation ersetzt.
> **Aktuelle offene Punkte** wurden in [`ADR-001-streaming-architecture.md`](../ADR-001-streaming-architecture.md) konsolidiert.
> **Signal-Formeln** wurden in [`INDICATOR_ARCHITECTURE.md`](../INDICATOR_ARCHITECTURE.md) konsolidiert.
> **Setup-Info** wurde in [`README.md`](../../README.md) konsolidiert.
> **Provider/News-Tracking** wurde in [`PROVIDER_LIMITS.md`](../PROVIDER_LIMITS.md) konsolidiert.

---

## 1. BACKEND_SETUP.md (superseded)

> **Ersetzt durch:** `SETUP_RUNBOOK.md` + `SQLITE_MIGRATION.md`
> **Veraltung:** Referenziert PostgreSQL, Projekt nutzt seit Migration SQLite.

### Originalinhalt

This project now includes a persistence backend scaffold:

- `GET /api/fusion/persistence/status`
- `GET /api/fusion/preferences?profileKey=...`
- `PUT /api/fusion/preferences`

Required Environment: `DATABASE_URL` (PostgreSQL)

Initialize DB:
1. `pnpm db:generate`
2. `pnpm db:push`

Notes:
- Without `DATABASE_URL`, the app continues in local-only mode.
- Frontend preferences (favorites/layout) are synced to backend when available.
- Profile isolation is currently anonymous via local `profileKey` (no auth lock-in yet).

---

## 2. PERSISTENCE_MODEL.md (superseded)

> **Ersetzt durch:** `ADR-001-streaming-architecture.md` Sektion 2.5 (aktueller Stand) + `SQLITE_MIGRATION.md`
> **Veraltung:** PostgreSQL-Annahme ueberholt. Architektur-Info wurde konsolidiert.

### Originalinhalt

Auth is intentionally disabled. Persistence is prepared in two layers:

**1) Runtime Storage Adapter**
- `src/lib/storage/adapter.ts`
  - `createLocalJsonStorageAdapter(...)`
  - `createDbReadyJsonStorageAdapter(...)`
- `src/lib/storage/preferences.ts`
  - typed preferences for: favorites, layout

Current behavior:
- local storage is active by default.
- db-ready adapter keeps the same caller contract and can be swapped to server-side persistence later.
- when backend is available, client preferences can be synced through API routes.

**2) DB-Ready Data Model**

Prisma schema: `prisma/schema.prisma`

Prepared entities:
- `UserProfile`
- `Watchlist`
- `WatchlistItem`
- `PriceAlertRecord`
- `LayoutPreference`

Notes:
- `profileKey` allows anonymous persistence without login.
- Relation/unique/index constraints are included for practical query paths.

API Scaffold:
- `GET /api/fusion/persistence/status`
- `GET /api/fusion/preferences?profileKey=...`
- `PUT /api/fusion/preferences`

Server helpers:
- `src/lib/server/prisma.ts`
- `src/lib/server/persistence-mappers.ts`

Migration Path (when DB is enabled):
1. Set `DATABASE_URL`.
2. Run `pnpm db:generate`.
3. Run `pnpm db:push` (or migrations).
4. Replace `createDbReadyJsonStorageAdapter(...)` internals with API/DB calls.
5. Keep local adapter as fallback/offline mode.

---

## 3. ZUSATZ_GAP_CHECK.md (superseded)

> **Ersetzt durch:** `ADR-001-streaming-architecture.md` Sektionen 2 + 3
> **Veraltung:** Einmaliger Gap-Check-Snapshot vom 13.02.2026. Offene Punkte wurden konsolidiert.

### Originalinhalt (Date: 2026-02-13)

**Already covered in current fusion code:**
- Provider-backed OHLCV in main chart with demo fallback
- Alerts wired to live quote polling
- Symbol normalization across UI/API/alerts
- Page modularization into feature components
- Signal package with Daily SMA50 line logic + power/rhythm metrics
- Incremental chart update path
- Replay preview mode
- Persistence model + backend API scaffold

**Implemented from Zusatz emphasis:**
- Indicators expanded: VWAP overlay, ATR toggle/period, VWMA overlay, SMA ± ATR channel
- Alert reproducibility check: in-app self-check for above/below + duplicate prevention
- Backend setup: persistence status, preferences, anonymous profileKey sync

**Still open (moved to ADR-001):**
- Drawing object model with real persistence
- Streaming ingestion + candle builder + server-side alert engine
- Integration/E2E flow for search → chart reload → favorite persistence
- Broader screener/scanner workflow and strategy presets

---

## 4. SIGNAL_FORMULAS.md (superseded)

> **Ersetzt durch:** `INDICATOR_ARCHITECTURE.md` Sektionen 2.1 + 3 + Kurzreferenz in `ADR-001` Sektion 2.4
> **Veraltung:** Formeln und Implementierungs-Referenzen sind vollstaendig in INDICATOR_ARCHITECTURE.md abgedeckt.

### Originalinhalt

Scope: Line / Power / Rhythm calculations.

**Line:**
- SMA: `SMA_n(t) = (close_t + close_(t-1) + ... + close_(t-n+1)) / n`
  - Impl: `calculateSMA()`
- SMA Cross Events: `cross_up` / `cross_down`
  - Impl: `detectSMACrossEvents()`, `getSMACrossAlertTemplates()`

**Power:**
- VWMA: `sum(close_i * volume_i) / sum(volume_i)` over n bars → `calculateVWMA()`
- RVOL: `volume_t / average(volume, n)` → `calculateRVOL()`
- OBV: kumulativ (+vol on up, -vol on down) → `calculateOBV()`
- CMF: `sum(MFV) / sum(vol)` with MFM = `((C-L)-(H-C))/(H-L)` → `calculateCMF()`

**Rhythm:**
- Heartbeat Cycle Score: ZigZag-Pivots → CV(intervals) + CV(amplitudes)
  - `periodStability = max(0, 1 - CV(intervals))`
  - `amplitudeStability = max(0, 1 - CV(amplitudes))`
  - `score = clamp((periodStability + amplitudeStability) / 2, 0, 1)`
  - Impl: `analyzeHeartbeatPattern()`

**Volatility Channel:**
- SMA ± ATR: `middle = SMA(close)`, `upper/lower = middle ± ATR * mult` → `calculateSMAATRChannel()`

**UI Binding:**
- Signal strip: `src/features/trading/SignalInsightsBar.tsx`
- Data selection: `src/app/page.tsx` (`signalSnapshot` memo)

---

## 5. SETUP_RUNBOOK.md (superseded)

> **Ersetzt durch:** `README.md` (Quick Start, Scripts, Troubleshooting)
> **Veraltung:** Mischte pnpm/bun Befehle, DB-Sektion suggerierte PostgreSQL-Workflow obwohl SQLite aktiv, Optional-Services-Sektion teilweise veraltet.

### Originalinhalt

Fusion Setup Runbook -- clean start path for local development with pnpm.

1) Install: `pnpm install`, `Copy-Item .env.example .env`
2) Database: `pnpm db:generate`, `pnpm db:push` (optional `pnpm db:migrate`)
3) Run: `pnpm dev` (localhost:3000)
4) Quality gates: `pnpm lint`, `pnpm build`
5) Troubleshooting: Prisma generate fix (`pnpm add -D effect`), DB push fix
6) Optional services: python monorepo, yfinance bridge, soft-signals, `bun run dev:with-python`
7) Practical next steps: add market/news provider keys, keep DB enabled

---

## 6. SQLITE_MIGRATION.md (superseded)

> **Ersetzt durch:** `README.md` (Database-Sektion mit PostgreSQL-Rueckweg)
> **Veraltung:** Einmalige Migration ist abgeschlossen. Rueckweg-Anleitung in README aufgenommen.

### Originalinhalt

Projekt von PostgreSQL auf SQLite umgestellt.

Aenderungen:
- `prisma/schema.prisma`: provider = "sqlite"
- Enums auskommentiert (SQLite keine nativen Enums), als Strings ersetzt
- `DATABASE_URL="file:./dev.db"`

Enum-Referenz-Tabelle: AlertCondition, LayoutMode, OrderSide, OrderType, OrderStatus, GeoEventStatus, GeoCandidateState, GeoCandidateTriggerType, GeoDrawingType

Rueckweg zu PostgreSQL:
1. Provider zurueck auf "postgresql"
2. Enum-Bloecke einkommentieren
3. String-Zeilen entfernen, Enum-Zeilen aktivieren
4. DATABASE_URL auf PostgreSQL-Connection setzen
5. `db:push` + `db:generate`

Hinweise: Enum-Validierung bei SQLite im Anwendungscode (Zod). Json-Felder als Text gespeichert (Prisma serialisiert).

---

## 7. ALERT_VERIFICATION.md (superseded)

> **Ersetzt durch:** Feature ist implementiert und funktional. Code dokumentiert sich selbst.
> **Veraltung:** DoD-Nachweis (P0.2) fuer erledigtes Feature.

### Originalinhalt

Goal: verify one `above` and one `below` trigger reproducibly, verify no duplicate trigger.

In-App Self-Check:
1. Open alerts panel (Bell icon)
2. Click Self-check
3. Expected: `Self-check passed: above=1, below=1, duplicate=0`

Implementation: `src/lib/alerts/index.ts` → `runAlertVerificationScenario()`, `src/components/AlertPanel.tsx` → Self-check button.
Scenario swaps alert storage during verification and restores afterward.

---

## 8. DATA_SOURCE_NOTES.md (superseded)

> **Ersetzt durch:** `PROVIDER_LIMITS.md` (Provider-Tabelle + News-Tabelle + externe Referenzen)
> **Veraltung:** Provider-Adapter (Finage, CoinMarketCap) sind fertig integriert. News-Liste in PROVIDER_LIMITS konsolidiert. Offene externe Referenzen (Insightsentry, LSE) dort aufgenommen.

### Originalinhalt

Requested additions:
- Insightsentry: tracked, kein Adapter
- LSE Retail Investor Data Waiver: legal reference
- Finage: adapter added (`src/lib/providers/finage.ts`)
- CoinMarketCap: adapter added (`src/lib/providers/coinmarketcap.ts`)

News sources integrated: Finviz, Yahoo, MarketWatch, Barron's, WSJ, Bloomberg, Reddit r/StockMarket, Reddit r/investing, NewsData.io, NewsAPI.ai, GNews, Webz.io

Wired in: `src/lib/news/sources.ts`, `aggregator.ts`, API route, NewsPanel.tsx
