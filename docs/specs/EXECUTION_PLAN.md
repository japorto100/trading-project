# MASTER EXECUTION PLAN

> **Stand:** 22. Februar 2026 (Rev. 3 — Vollstaendige Neufassung: 22+1 Phasen mit Sub-Phasen, korrekte Abhaengigkeitsreihenfolge, ~90% Doc-Abdeckung)
> **Zweck:** Hoechst-Level Roadmap und **vollstaendiger Index** ueber alle `docs/*.md` Planungsdokumente. Jede Phase ist ein End-to-End Deliverable. Jede Sub-Phase referenziert die Detail-Sektion im jeweiligen Fach-Dokument. Keine Phase wird begonnen bevor die vorherige ihr Verify Gate bestanden hat.
>
> **Quellen (alle docs/*.md ohne Subdirectories, exkl. CHERI/Future-Quant/ENV_VARS/REMOTE_DEV):**
>
> | Kuerzel | Dokument | Tasks |
> |:--------|:---------|------:|
> | **IND** | [`INDICATOR_ARCHITECTURE.md`](../../docs/INDICATOR_ARCHITECTURE.md) | ~112 |
> | **GEO** | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](../../docs/GEOPOLITICAL_MAP_MASTERPLAN.md) | ~139 |
> | **GO-R** | [`go-research-financial-data-aggregation-2025-2026.md`](../../docs/go-research-financial-data-aggregation-2025-2026.md) | ~65 |
> | **RUST** | [`RUST_LANGUAGE_IMPLEMENTATION.md`](../../docs/RUST_LANGUAGE_IMPLEMENTATION.md) | ~52 |
> | **CE** | [`CONTEXT_ENGINEERING.md`](../../docs/CONTEXT_ENGINEERING.md) | ~35 |
> | **ENT** | [`ENTROPY_NOVELTY.md`](../../docs/ENTROPY_NOVELTY.md) | ~38 |
> | **MEM** | [`MEMORY_ARCHITECTURE.md`](../../docs/MEMORY_ARCHITECTURE.md) | ~30 |
> | **AGT** | [`AGENT_ARCHITECTURE.md`](../../docs/AGENT_ARCHITECTURE.md) | ~40 |
> | **AT** | [`AGENT_TOOLS.md`](../../docs/AGENT_TOOLS.md) | ~25 |
> | **GT** | [`GAME_THEORY.md`](../../docs/GAME_THEORY.md) | ~35 |
> | **PF** | [`Portfolio-architecture.md`](../../docs/Portfolio-architecture.md) | ~33 |
> | **UIL** | [`UNIFIED_INGESTION_LAYER.md`](../../docs/UNIFIED_INGESTION_LAYER.md) | ~20 |
> | **AUTH** | [`AUTH_SECURITY.md`](./AUTH_SECURITY.md) | ~25 |
> | **ADR** | [`ADR-001-streaming-architecture.md`](../../docs/ADR-001-streaming-architecture.md) | ~12 |
> | **OPTS** | [`GEOPOLITICAL_OPTIONS.md`](../../docs/GEOPOLITICAL_OPTIONS.md) | (D3 Modul-Katalog) |
> | **GOG** | [`GO_GATEWAY.md`](../../docs/GO_GATEWAY.md) | (RSC, MCP) |
> | **FDT** | [`FRONTEND_DESIGN_TOOLING.md`](../../docs/FRONTEND_DESIGN_TOOLING.md) | (Design Tools) |
> | **PEK** | [`POLITICAL_ECONOMY_KNOWLEDGE.md`](../../docs/POLITICAL_ECONOMY_KNOWLEDGE.md) | (KG Seed) |
> | **REF** | [`REFERENCE_PROJECTS.md`](../../docs/REFERENCE_PROJECTS.md) | (Referenz-Index) |
> | | **Gesamt** | **~661** |
>
> **Specs:** [`SYSTEM_STATE.md`](./SYSTEM_STATE.md), [`API_CONTRACTS.md`](./API_CONTRACTS.md), [`FRONTEND_ARCHITECTURE.md`](./FRONTEND_ARCHITECTURE.md)
> **Frontend Bugs:** [`webapp.md`](../../docs/webapp.md)
>
> **Aenderungshistorie:**
> - Rev. 1 (20. Feb 2026) — Erstfassung (10 Phasen, ~154 Tasks erfasst)
> - Rev. 2 (22. Feb 2026) — Phasen 10-12 ergaenzt, Auth/Memory/GT
> - Rev. 3 (22. Feb 2026) — **Vollstaendige Neufassung.** 22+1 Phasen mit Sub-Phasen. Auth auf Phase 1 hochgezogen. Memory vor Agents. Fehlende Themen eingefuegt (Entropy, Connector Expansion, Indicator Catalog, Backtesting, Options/DeFi, ML Pipeline, GeoMap v2.5/v3, WASM). ~90% der 661 geplanten Tasks jetzt referenziert.
> - Rev. 3.1 (22. Feb 2026) — Aktueller-Stand-Sektion eingefuegt. `API_CONTRACTS.md` um Sek. 11-13 (Memory, Agent, Agent State) erweitert. `FRONTEND_ARCHITECTURE.md` Phasen-Referenzen auf Rev. 3 Nummerierung aktualisiert.

---

## Aktueller Stand / Current Progress

> **Referenz:** Detaillierter IST-Zustand pro Schicht → [`SYSTEM_STATE.md`](./SYSTEM_STATE.md)

| Phase | Status | Bemerkung |
|:------|:-------|:----------|
| Phase 0 (Foundation) | **NICHT GESTARTET** | Go BaseConnector Scaffold existiert, Go Gateway laeuft auf Port 9060, 6 bestehende Endpoints funktional. Kein Provider produktiv ueber BaseConnector. |
| Phase 1 (Auth) | **NICHT GESTARTET** | Kein Auth implementiert. Alle Endpoints offen. |
| Phase 2 (Rust Core) | **NICHT GESTARTET** | Rust Workspace existiert (`rust-core/`), PyO3 Skeleton vorhanden. |
| Phase 3 (Streaming) | **NICHT GESTARTET** | SSE-Endpoint `/api/geopolitical/stream` existiert als Prototyp. |
| Phase 4 (GeoMap v2.0) | **NICHT GESTARTET** | GeoMap v1 funktional (d3-geo Orthographic, SVG, Marker). Keine Color-Scale, keine Animation. |
| Phase 5-22 | NICHT GESTARTET | — |

> **Empfohlener Startpunkt:** Phase 0 + Phase 1 parallel.
> Phase 0a-0c (Foundation) und Phase 1a-1c (Auth) haben keine Abhaengigkeiten zueinander und koennen gleichzeitig implementiert werden.
> Nach Abschluss beider: Phase 2 (Rust Core) und Phase 3 (Streaming) parallel.

> **Teilfortschritt (22. Feb 2026, Codex):**
> - Phase 1d (baseline, teilweise): Go Gateway hat Request-ID + Request-Logging Middleware (`X-Request-ID` Header gesetzt/weitergereicht, JSON `slog` startup in `cmd/gateway`).
> - Phase 1d (vertical slice erweitert): `src/app/api/geopolitical/game-theory/impact` erzeugt/propagiert `X-Request-ID`; Go `gametheory` Connector reicht Header an Python Soft-Signals Service weiter (TS -> Go -> Python Header-Chain fuer diesen Pfad).
> - Phase 1d (route rollout, teilweise): `src/app/api/geopolitical/events` + ACLED/GDELT-Bridge sowie `src/app/api/geopolitical/context` + Context-Bridge propagieren/echoen `X-Request-ID` fuer externe Geo-Fetches via Go.
> - Phase 0c (slice, teilweise): `src/app/api/market/quote` Single- und Batch-Quote Pfad proxied fuer gemappte `stock`/`fx`/`crypto` Symbole zum Go Gateway (Fanout im Batch-Pfad), mit Fallback auf den bestehenden Frontend-Provider-Manager fuer nicht gemappte Symboltypen.
> - Phase 0c (slice erweitert): `src/app/api/market/news` nutzt fuer Standard-Symbol-News den Go Gateway Endpoint (`/api/v1/news/headlines`) und mappt auf das bestehende Frontend-Response-Shape; erweiterte Query/Language-Pfade bleiben vorerst lokaler Fallback.
> - Verify Gate fuer Phase 0/1 weiterhin offen.

---

## Phasen-Loop (gilt fuer jede Phase)

- [ ] **1. Implementierung** — Code schreiben gemaess `API_CONTRACTS.md`. Vertikal: eine Boundary nach der anderen (TS↔Go → Go↔Py/Rs → End-to-End).
- [ ] **2. Unit/Integration Test**
- [ ] **3. Refinement & Debugging**
- [ ] **4. Verify Gate** — Automatisierbare Pruefung (pro Phase definiert)
- [ ] **5. Review Gate** — Code Review + Contract Check
- [ ] **6. Freeze** — Checkboxen `[x]` markieren, `SYSTEM_STATE.md` aktualisieren

### Boundary-Order (innerhalb jeder Phase)

```
Schritt A:  TS ↔ Go    (Frontend-Contract + Go-Endpoint + Mock-Response)
Schritt B:  Go ↔ Py/Rs (Echte Daten ersetzen Mocks)
Schritt C:  End-to-End  (TS → Go → Py/Rs → Go → TS)
```

---

## Uebersicht: 22+1 Phasen

| Phase | Name | Sub | Schwerpunkt | Abh. | Ref |
|:-----:|:-----|:---:|:------------|:-----|:----|
| 0 | Foundation | 3 | Go Data Router + BaseConnector Architecture | — | GO-R |
| **1** | **Auth + Security** | **6** | **WebAuthn, RBAC, KG Encryption, WebMCP Security, Consent** | **0** | **AUTH** |
| 2 | Rust Core + Composite Signal | 5 | PyO3, Polars, redb Cache, erster Durchstich | 0 | RUST, IND |
| 3 | Streaming Migration | 3 | Candle Builder, Alert Engine, Snapshot Store | 0 | ADR |
| 4 | GeoMap v2.0 | 8 | Shell Refactor, D3 Stack, Canvas Hybrid, Choropleth, Auto-Candidates | 0,1 | GEO, OPTS |
| 5 | Portfolio Bridge + Analytics | 4 | GCT Bridge, Python Analytics, Frontend Tabs | 0,1 | PF |
| **6** | **Memory Architecture** | **5** | **Redis, KG (KuzuDB), Episodic Store, Vector Store** | **1** | **MEM** |
| 7 | Indicator Catalog — Core | 5 | Phases A+B: swing_detect, MAs, Bollinger, RSI, Fibonacci, Composite | 2 | IND |
| 8 | Pattern Detection | 6 | Phase C: Elliott Wave, Harmonic, Candlestick, DeMark, Classical | 2 | IND |
| 9 | Unified Ingestion Layer | 4 | Go Connectors, LLM Pipeline, Review UI, Copy/Paste | 4,6 | UIL |
| **10** | **Agent Architecture + Context** | **8** | **Agent Roles, Context Engineering, Working Memory, WebMCP, Search** | **6,1** | **AGT, AT, CE** |
| **11** | **Entropy + Novelty Monitoring** | **5** | **Health Monitor, KG Dampening, Market Entropy Index, Exergie** | **6,10** | **ENT** |
| 12 | GeoMap v2.5 — Advanced | 7 | NLP Upgrade, Contradictions, Alerts, Exports, Timeline, Zentralbank | 4,6,9 | GEO |
| 13 | Portfolio Advanced + Optimize | 6 | HRP, Kelly, Regime Sizing, Monte Carlo VaR, VPIN | 5,8 | PF, IND |
| 14 | Global Provider Expansion | 6 | SDMX, EM Central Banks, BulkFetcher, DiffWatcher, Translation | 0 | GO-R |
| 15 | Indicator Catalog — Advanced | 7 | Phases D+E: K's Collection, Volatility, Regime, CUSUM, Order Flow | 7 | IND |
| 16 | Backtesting Engine | 7 | Rust Backtester, Walk-Forward, Triple-Barrier, Monte Carlo, Sharpe | 2,7 | RUST, IND |
| **17** | **Game Theory Mode + Simulation** | **8** | **Spielbaum, Transmission, Timeline, Monte Carlo, Strategeme, Planner** | **4,6,10** | **GT, AT** |
| 18 | Options + Dark Pool + DeFi | 6 | FINRA ATS, GEX, Expected Move, Black-Scholes, DeFi, Oracle | 13,14 | IND, GO-R |
| 19 | GeoMap v3 + Collaboration + Rust | 8 | CRDT/Yjs, Entity Graph, deck.gl, h3o, LSTM Regime, Active Learning | 4,12 | GEO, RUST |
| 20 | ML Pipeline | 5 | Feature Eng, XGBoost, Hybrid Fusion, Deep Learning, Bias Monitor | 7,15 | IND |
| 21 | Frontend Refinement + Hardening | 7 | Zod, Dead Code, RSC, UI Polish, Logging, a11y, Dependency Audit | alle | — |
| *(22)* | *(WASM + Desktop — optional)* | *3* | *WASM Indicators, Tauri v2, ChartGPU* | *2* | *RUST* |
| | **Summe** | **~133** | | | |

---

## Phase 0: Foundation (Go Data Router + BaseConnector)

> **Ref:** GO-R Sek. 1-12, GOG

**Ziel:** Go Gateway wird Single Point of Entry. BaseConnector-Abstraktion als Fundament fuer alle zukuenftigen Provider.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **0a** | Adaptive Data Router | GO-R Sek. 1-5 | `config.yaml`, Health Scoring (Bifrost-style), Provider States, Rate Limiting, Circuit Breaker (`failsafe-go`) |
| **0b** | BaseConnector Architecture | GO-R Sek. 12.2-12.3 | `base/` Package: `http_client.go`, `ratelimit.go`, `retry.go`, `types.go`. Alle bestehenden Connectors darauf migrieren (~700 LoC) |
| **0c** | Frontend Provider Migration | GO-R Sek. 6 | Alle direkten Provider-Calls im Frontend eliminieren. API-Routes auf `GO_GATEWAY_BASE_URL` umbiegen. ENV Keys nach `go-backend/.env` |

### Verify Gate
- [ ] Chart laedt OHLCV ausschliesslich via Go Gateway (Port 9060)
- [ ] Kein direkter Provider-Call im Network Tab
- [ ] Provider-Ausfall → Failover auf naechsten Provider
- [ ] BaseConnector: Mindestens 2 bestehende Connectors (ACLED, Finnhub) auf neue Basis migriert

---

## Phase 1: Auth + Security Hardening

> **Ref:** AUTH Sek. 1-13

**Ziel:** Authentifizierung, Autorisierung, KG-Encryption, WebMCP-Security, Consent. **Auth zuerst** weil alles darauf aufbaut (Memory KG Encryption, Agent RBAC, WebMCP Tool-Scoping, GCT Trader-Rolle).

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **1a** | WebAuthn/Passkeys | AUTH Sek. 2 | next-auth v5 + Passkey Provider, Login/Register, JWT httpOnly Cookie, Protected Routes |
| **1b** | Security Middleware + RBAC | AUTH Sek. 2.3-2.4 | CSP, CORS, Rate Limiting, JWT Validation. Rollen: viewer/analyst/trader |
| **1c** | GCT Auth 3-Schichten | AUTH Sek. 3-4 | Starke Credentials, TLS, Exchange Key Hardening (AES-GCM), Audit-Log |
| **1d** | Correlation IDs + JSON Logging | AUTH Sek. 7 | `X-Request-ID` durchgehend TS→Go→Py→Rust. Strukturiertes JSON in allen Services |
| **1e** | KG Encryption (PRF/Fallback) | AUTH Sek. 13 | PRF-Salt, Server-Fallback Key, `KGEncryptionLayer`, PRF-Detection + Fallback |
| **1f** | Privacy & Consent | AUTH Sek. 9 | `UserConsent` DB-Tabelle (server-side), Consent-UI, GDPR Art. 17, Privacy-Overlay |

### Verify Gate
- [ ] Passwortloses Login via Passkey funktioniert
- [ ] User ohne `trader`-Rolle → HTTP 403 auf GCT-Endpoints
- [ ] Correlation ID durchgehend in Logs nachvollziehbar
- [ ] KG-Daten in IndexedDB verschluesselt
- [ ] Consent-Toggle funktioniert, LLM respektiert fehlenden Consent

---

## Phase 2: Rust Core + Composite Signal

> **Ref:** RUST Sek. 1-5, IND Sek. 0.8 + Phase B

**Ziel:** Rust-Kern als PyO3-Modul + Polars als DataFrame-Standard + erster vertikaler Durchstich bis zum Frontend.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **2a** | PyO3 Setup + First Functions | RUST Sek. 1-2 | `cargo init --lib`, PyO3 0.28, `calculate_heartbeat`, `calculate_indicators_batch` (kand) |
| **2b** | Polars DataFrame Layer | RUST Sek. 5a | Polars statt Pandas in `indicator-service` + `finance-bridge`. Zero-copy via PyO3 Arrow FFI |
| **2c** | redb OHLCV Cache | RUST Sek. 5b | Embedded key-value Cache mit TTL fuer OHLCV. Write-Through, concurrent reads |
| **2d** | Composite Signal verdrahten | IND Sek. 3, Phase B | `POST /api/v1/signals/composite` via Go→Python→Rust. 50-Day Slope + Heartbeat + Volume |
| **2e** | SignalInsightsBar Frontend | IND Phase E #33 | React-Komponente zeigt Heartbeat Score, SMA50 Slope, Smart Money Score |

### Verify Gate
- [ ] SignalInsightsBar zeigt live berechnete Werte
- [ ] Voller Durchstich: Browser → Next.js → Go → Python/Rust → zurueck
- [ ] Polars DataFrame in `indicator-service` aktiv (kein `import pandas`)
- [ ] redb Cache: Second Hit <1ms

---

## Phase 3: Streaming Migration

> **Ref:** ADR Sek. 1-6

**Ziel:** Stream-First mit REST Fallback. Server-Side Alert Engine.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **3a** | Candle Builder | ADR Sek. 3 | Tick → OHLCV Aggregation, Ring Buffer, Out-of-Order Handling |
| **3b** | Server-Side Alert Engine | ADR Sek. 4 | Price Threshold, Line-Cross, State Store, Checkpointing |
| **3c** | Snapshot Store + Reconnect | ADR Sek. 5 | Latest State persistiert, Recovery bei Reconnect, Exponential Backoff |

### Verify Gate
- [ ] Chart aktualisiert via SSE (kein REST-Polling)
- [ ] Alert feuert server-seitig, erscheint im UI <1s
- [ ] Reconnect nach Abbruch: Snapshot-Recovery, kein Datenverlust

---

## Phase 4: GeoMap v2.0 — Shell + Rendering + D3 Stack

> **Ref:** GEO Sek. 25-36, OPTS Sek. 1-11

**Ziel:** Shell-Refactor, D3 Visualization Stack, Canvas Hybrid, Choropleth-Layer, Auto-Candidates.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **4a** | Shell Refactoring | GEO Sek. 25a, 36 Sprint 1 #1 | ~40 useState → Zustand Store (events, candidates, drawings, timeline) |
| **4b** | D3 v1.1 Modules | OPTS Sek. 11 (v1.1) | `d3-scale`, `d3-scale-chromatic`, `d3-interpolate`, `d3-transition`, `d3-timer`, `d3-ease`, `d3-inertia`, `d3-geo-voronoi` |
| **4c** | Canvas/SVG Hybrid | GEO Sek. 35.4 | Canvas fuer statische Elemente, SVG fuer interaktive. Viewport-Culling. Supercluster |
| **4d** | Choropleth Layer System | GEO Sek. 35.3a, OPTS | Layer-Abstraktion `{ name, dataFn, scaleFn, legendFn }`. Severity Heatmap + Regime-State |
| **4e** | Hard-Signal Auto-Candidates | GEO Sek. 25 Milestone F | ACLED Threshold, Sanctions (OFAC/UN), Central Bank Rate Decisions |
| **4f** | Soft-Signal Pipeline haerten | GEO Sek. 18.1 (Baseline) | Dedup SHA256 + Similarity, Confidence Scoring, `reason` String |
| **4g** | D3 v1.5 Modules | OPTS Sek. 11 (v1.5) | `d3-hierarchy`, `d3-shape`, `d3-brush`, `d3-axis`, `d3-array`, `d3-time`, `d3-format`, `d3-annotation`, `d3-legend` |
| **4h** | Seed Dataset + Keyboard Shortcuts | GEO Sek. 36 Sprint 1 #2-3 | 30-50 Events, 200 Candidates, 10 Contradictions. Keyboard M/L/P/T/Del/Ctrl+Z/R |

### Verify Gate
- [ ] 200+ Events bei 60 FPS Rotation
- [ ] Globe-Inertia funktioniert
- [ ] 2 Choropleth-Layer schaltbar (Severity + Regime-State)
- [ ] Clustering bei Zoom-Out aktiv
- [ ] Shell: Kein `useState` mehr in GeopoliticalMapShell.tsx

---

## Phase 5: Portfolio Bridge + Analytics

> **Ref:** PF Sek. 1-8 (P-1 bis P-18)

**Ziel:** GoCryptoTrader als Live-Datenquelle, Python-Analytics, Frontend-Tabs.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **5a** | GCT Bridge Endpoints | PF P-1 bis P-8 | `/portfolio/summary`, `/positions`, `/balances/:exchange`, `/ohlcv` via GCT gRPC/JSON-RPC |
| **5b** | Python Analytics | PF P-9 bis P-18 | `/correlations`, `/rolling-metrics`, `/drawdown-analysis` |
| **5c** | Frontend Tabs | PF Frontend | Paper / Live / Analytics. EquityCurveChart, CorrelationHeatmap, DrawdownTable |
| **5d** | Prisma Schema Extensions | PF DB | Portfolio-Snapshots fuer historische Equity Curve |

### Verify Gate
- [ ] Alle 3 Tabs funktional
- [ ] Live Tab zeigt GCT-Daten (wenn `-WithGCT`)
- [ ] Correlation Heatmap mathematisch korrekt

---

## Phase 6: Memory Architecture

> **Ref:** MEM Sek. 1-8 (M1-M5)

**Ziel:** Unified Memory Layer: Redis → PostgreSQL Episodic → Knowledge Graph → Vector Store.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **6a** | Redis Cache Layer (M1) | MEM Sek. 3 | Redis Container, Session/Token Cache, Market-Data Cache (15s TTL), LLM-Response Cache, Fallback |
| **6b** | PostgreSQL Episodic Store (M2) | MEM Sek. 4 | `agent_episodes`, `analysis_snapshots` Tabellen, Retention Policy 90d |
| **6c** | Knowledge Graph Core (M3) | MEM Sek. 5 | KuzuDB WASM + IndexedDB, Nodes: Region/Actor/Event/Strategem, Encryption (Phase 1e), Seed-Data |
| **6d** | Vector Store (M4) | MEM Sek. 6 | ChromaDB Container, Embedding Pipeline, Semantic Search API |
| **6e** | Memory API Layer | MEM Sek. 7 | `POST /api/memory/episode`, `GET /api/memory/episodes`, `GET /api/memory/kg/sync`, `POST /api/memory/search` |

### Verify Gate
- [ ] Redis: Hot-Symbol <5ms
- [ ] KG: 36 Strategeme traversierbar, verschluesselt in IndexedDB
- [ ] Vector Store: Top-5 semantische Treffer korrekt
- [ ] Episodic: 1000 Episodes korrekt abrufbar

---

## Phase 7: Indicator Catalog — Core (IND Phases A+B)

> **Ref:** IND Sek. 3-5, Todos #1-#13, #30-#34

**Ziel:** Fundament der Indikator-Bibliothek: swing_detect, erweiterte MAs, Enhanced Bollinger/RSI, Fibonacci, Integration.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **7a** | swing_detect Foundation | IND #2 | Basis fuer alle Pattern Recognition. O(N) Pivot Detection |
| **7b** | Advanced Moving Averages | IND #8-#11 | KAMA, ALMA, IWMA, OLS MA, Generalized `moving_average()` Selector |
| **7c** | Enhanced Bollinger + RSI | IND #12-#13 | 5+ Bollinger-Techniken, ATR-adjusted RSI, Bollinger-on-RSI |
| **7d** | Fibonacci Extensions + Confluence | IND #3, Sek. 4.4 #5+#8 | 23.6%-261.8% Levels, Confluence-Detection (2+ Levels <0.5%) |
| **7e** | Integration + Cleanup | IND #5, #30-#34 | API Routes als Proxy, IndicatorPanel-Eintraege, Registry-Pattern, `chartData.ts` Cleanup |

### Verify Gate
- [ ] swing_detect korrekt auf 5 Referenz-Charts
- [ ] KAMA/ALMA/IWMA im IndicatorPanel verfuegbar
- [ ] Fibonacci Confluence-Zones im Chart sichtbar

---

## Phase 8: Pattern Detection (IND Phase C)

> **Ref:** IND Sek. 4-5, Todos #14-#21

**Ziel:** Komplexe Mustererkennung in Python+Rust, Chart-Overlays im Frontend.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **8a** | Elliott Wave Detection | IND #21, Sek. 4 | swing_detect → 5+3 Wave Counting → Fibonacci Validation → Multi-Scenario Output |
| **8b** | Harmonic Patterns | IND #15-#17 | ABCD, Gartley, Bat, Butterfly, Crab. Potential + Invalidation Scoring. FEIW |
| **8c** | Candlestick Patterns | IND #14 | Doji, R Pattern, Bottle, Double Trouble, Extreme Euphoria, CARSI |
| **8d** | Tom DeMark + Combinations | IND #18-#19 | TD Setup, Fibonacci Timing, Patterns-on-Heikin-Ashi |
| **8e** | Classical Patterns | IND #20 | Double Top/Bottom, Head & Shoulders, Gap Patterns |
| **8f** | Chart Overlays Frontend | IND #31-#32 | Wave Labels, Harmonic Zones, Pattern Toggle in Toolbar |

### Verify Gate
- [ ] Elliott Waves sichtbar via Rust→Python→Go→Frontend
- [ ] Harmonic Patterns als farbige Zonen
- [ ] Pattern-Toggle ein/aus ohne Seiteneffekte

---

## Phase 9: Unified Ingestion Layer

> **Ref:** UIL Sek. 1-8, GEO Sek. 35.15

**Ziel:** Automatisierte Erfassung + LLM-Klassifizierung von YouTube, Reddit, RSS, Copy/Paste.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **9a** | Go Connectors | UIL Sek. 3 | YouTube Transcript (1h Poll), Reddit (15min Poll), RSS Erweiterung |
| **9b** | Python LLM Classification | UIL Sek. 4 | Language Detection → Summary → Entity Extraction → Category → Confidence → Dedup |
| **9c** | Review UI + Routing | UIL Sek. 5 | Double-Threshold (0.85/0.40), Signal/Noise/Uncertain/Reclassify. Routing: geo/macro/trading/research |
| **9d** | Copy/Paste Import | UIL Sek. 6, GEO Sek. 35.15 | Ctrl+V / Drag-Drop → LLM klassifiziert → Routing |

### Verify Gate
- [ ] YouTube Transcript eingespielt, klassifiziert, korrekt geroutet
- [ ] Auto-Route bei Confidence >=0.85 funktioniert
- [ ] Copy/Paste → LLM → Candidate

---

## Phase 10: Agent Architecture + Context Engineering

> **Ref:** AGT Sek. 1-11, AT Sek. 1-10, CE Sek. 1-10

**Ziel:** Agent-Schicht aktivieren. "100% Kontext" durch Context Assembly, Memory-Integration, WebMCP.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **10a** | Agent Framework | AGT Sek. 2 | Runtime (FastAPI WS), Rollen: Extractor/Verifier/Guard/Synthesizer, BTE/DRS Guards |
| **10b** | Context Engineering Pipeline | CE Sek. 4-6 | Relevance Scoring (4 Dimensionen), Token Budget Manager, DyCP, LLMLingua-2, Multi-Source Merge |
| **10c** | Agent Working Memory (M5) | MEM Sek. 8 | Redis Hash pro Session, Scratchpad, TTL 30min, Oldest-first Eviction |
| **10d** | Agentic Search | AT Sek. 6 | Codebase Search, News Search (Emergent Mind, arXiv), Memory Search (Episodic + Semantic) |
| **10e** | WebMCP Tools | AT Sek. 3-4 | Read-Only: `get_chart_state`, `get_portfolio_summary`, `get_geomap_focus`. Mutations: `set_chart_symbol`, `add_geomap_marker` (mit Confirm-Modal) |
| **10f** | Research Agent | AT Sek. 7 | Emergent Mind + arXiv Integration, Research → Summarize → Episodic Memory |
| **10g** | Monitor Agent | AGT Sek. 3 | Price Alerts, GeoEvent Alerts, Anomaly Detection (Volumen/Spreads) |
| **10h** | A2A Prep | AT Sek. 9 | Agent Card Schema, Inter-Agent Messages (JSON-RPC 2.0), Task Delegation |

### Verify Gate
- [ ] "Analyse EURUSD" → Extractor + Synthesizer liefern Analyse
- [ ] Context Assembly: Frontend-State + 5 Episodes + KG-Nodes korrekt
- [ ] Monitor Agent: Price Alert <5s nach Threshold-Breach
- [ ] WebMCP Mutation → Confirm-Modal → Chart aendert sich

---

## Phase 11: Entropy + Novelty Monitoring

> **Ref:** ENT Sek. 1-13

**Ziel:** System-Selbstueberwachung gegen Entropy-Collapse: Monokultur-Praevention, KG-Dampening, Exergie-Signale.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **11a** | Entropy Health Monitor | ENT Sek. 5.1 | 5 Dimensionen: Signal Diversity, Geo-Region, Strategem, KG-Confidence-Spread, Agent-Interpretation |
| **11b** | KG-Confidence Dampening | ENT Sek. 5.5 | Cap 0.95, -0.08 Decrement, -0.02/month Decay. Override-Cap (-0.30) + Monthly Decay (+0.05) |
| **11c** | Market Entropy Index | ENT Sek. 10.6, IND Sek. 5r | 5-Komponenten E-Metrik als Composite Indicator. `/api/v1/regime/market-entropy` |
| **11d** | Exergie-Exposure + keen_multiplier | ENT Sek. 5.6, 8.2 | `exergy_shock` Edge in KG, Keen-Multiplier Calibration (Phase 1-3) |
| **11e** | Signal Pipeline Monokultur-Prevention | ENT Sek. 4.3 | Min-Weight per Signal-Typ, Diversity Floor (3 Regionen, 2 Strategem-Types, 1 Weak Signal) |

### Verify Gate
- [ ] Entropy Health Score berechnet und auf Dashboard sichtbar
- [ ] KG-Node Confidence sinkt automatisch ueber Zeit
- [ ] Market Entropy Index als Indikator verfuegbar
- [ ] Monokultur-Warnung wenn <3 Signal-Typen aktiv

---

## Phase 12: GeoMap v2.5 — Advanced Features

> **Ref:** GEO Sek. 35.1-35.16, 36 Sprint 2-3

**Ziel:** NLP-Upgrade, Contradiction Tracking, Alert-System, Exports, Timeline, Zentralbank-Layer.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **12a** | NLP Pipeline Upgrade | GEO Sek. 18.1-18.2 | Embeddings + HDBSCAN (statt TF-IDF+KMeans), LLM-Narrativ-Analyse (Ollama), SentimentService Protocol |
| **12b** | Contradiction Tracking + Evidence | GEO Sek. 35.1-35.2 | SHA256 Source Hash, GeoContradiction auto-create, Evidence Score, optional Snapshot Storage |
| **12c** | Alert System | GEO Sek. 35.11 | Severity/Confidence Thresholds, Cooldown per Region+Category, Dedup, Mute Profiles |
| **12d** | Exports | GEO Sek. 35.12 | JSON Export, PNG/PDF Snapshot (html2canvas+jsPDF), CSV/Excel |
| **12e** | Timeline Playback + Confidence Decay | GEO Sek. 29, 35.3 | Scrubber-Animation, Status-Transitions (active→stabilizing→archived), Confidence Decay |
| **12f** | Evaluation Harness | GEO Sek. 35.6 | Accept Rate, Override Rate, Kappa, Top Override Reasons, Time-to-Review Dashboard |
| **12g** | Zentralbank + CBDC Layer | GEO Sek. 35.13, ENT Sek. 12.4 | Rate Decisions Filter, Balance Sheet Trend, CBDC Status Choropleth, Financial Openness (Chinn-Ito), De-Dollarization |

### Verify Gate
- [ ] NLP: Embedding-basiertes Clustering besser als TF-IDF (A/B Test)
- [ ] Contradiction Tab im Event Inspector funktional
- [ ] Alert mit Cooldown korrekt (max 1/h pro Region)
- [ ] PDF Export mit Karte + Legende + Zeitstempel

---

## Phase 13: Portfolio Advanced + Optimize

> **Ref:** PF P-19 bis P-33, IND Phase F Todos #51-#57

**Ziel:** Fortgeschrittene Portfolio-Optimierung, Regime-Sizing, Monte Carlo, VPIN.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **13a** | HRP + MinVar + EqualWeight | IND #48, PF P-19 | Hierarchical Risk Parity, Minimum Variance, Equal Weight Optimizer |
| **13b** | Kelly Multi-Asset | IND #55, PF P-21 | Covariance-basierte Kelly Allocation |
| **13c** | Regime-Based Sizing | IND #54, PF P-22 | Traffic-Light per Position (Green/Yellow/Red) basierend auf Regime |
| **13d** | Monte Carlo VaR (Rust) | IND #82, PF P-20 | 100k+ Simulationen via Rust/PyO3/Rayon |
| **13e** | VPIN Risk Warning | IND #49, PF P-23 | Volume-Synchronized Probability of Informed Trading, SSE bei VPIN > Threshold |
| **13f** | Frontend Optimize Tab | IND #57 | HRP Slider, Dendrogram, Kelly Chart, Regime-Indikator |

### Verify Gate
- [ ] HRP Empfehlung auf echtem Portfolio
- [ ] Monte Carlo VaR mathematisch korrekt (vs. Referenz)
- [ ] VPIN Alert triggert bei hoher Toxizitaet

---

## Phase 14: Global Provider Expansion

> **Ref:** GO-R Sek. 12.4-12.9, 13-14

**Ziel:** BaseConnector-Architektur (Phase 0b) nutzen um 40+ globale Provider anzubinden.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **14a** | SDMXClient | GO-R Sek. 12.4 | Ein Client fuer IMF, OECD, ECB, World Bank, UN, ADB (~6 Provider) |
| **14b** | TimeSeriesClient | GO-R Sek. 12.5 | EM Central Banks: BCB, Banxico, RBI, BoK, TCMB, BCRA (~7 Provider) |
| **14c** | BulkFetcher | GO-R Sek. 12.6 | CFTC COT, FINRA ATS, LBMA Gold Fix, FXCM Sentiment |
| **14d** | DiffWatcher | GO-R Sek. 12.7 | Sanctions XML Diffs: SECO, OFAC SDN, UN, EU |
| **14e** | TranslationBridge | GO-R Sek. 12.8 | Non-English API Responses → Python LLM Queue fuer Uebersetzung |
| **14f** | Symbol Catalog Service | GO-R Sek. 9 | Periodic Pull, Normalized Format, DEX Mapping |

### Verify Gate
- [ ] SDMXClient: IMF GDP-Daten korrekt abrufbar
- [ ] DiffWatcher: OFAC SDN Update → Auto-Candidate in GeoMap
- [ ] Symbol Catalog: 500+ Symbole normalisiert

---

## Phase 15: Indicator Catalog — Advanced (IND Phases D+E)

> **Ref:** IND Todos #22-#50, #63-#67

**Ziel:** Erweiterte Indikatoren: K's Collection, Volatility Suite, Regime Detection, Markov, Order Flow.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **15a** | K's Collection | IND #22-#26 | K's Reversal I+II, ATR-RSI, RSI², MARSI, Fibonacci MA, Rainbow (7er Batch) |
| **15b** | Volatility Suite | IND #27 | Spike-Weighted Volatility, Volatility Index, Exp-Weighted StdDev |
| **15c** | Regime Detection | IND #35, #63-#64 | SMA-Slope+ADX, Markov Regime Model, HMM (`hmmlearn`), BIC Model Selection |
| **15d** | Alternative Bars + CUSUM | IND #40-#41 | Volume/Dollar/Tick Bars, CUSUM Structural Break Detection |
| **15e** | Mean-Rev vs. Momentum | IND #42-#43 | Hurst, ADF, Half-Life Classification, Regime-Conditional Parameters |
| **15f** | Performance Metrics | IND #28 | Net Return, Hit Ratio, RRR, Expectancy, Profit Factor, Sharpe, Sortino |
| **15g** | Order Flow + Signal Chain | IND #65-#67 | Signal-Quality-Chain, Order Flow State Machine (Accum/Distrib/Squeeze), MCMC Portfolio Monte Carlo |

### Verify Gate
- [ ] Regime Detection: Bullish/Bearish/Ranging korrekt auf 5 Referenz-Perioden
- [ ] HMM: BIC waehlt optimale Anzahl Hidden States
- [ ] Order Flow State Machine: Korrekte Transitions

---

## Phase 16: Backtesting Engine

> **Ref:** RUST Sek. 5, IND Phase D Todos #29, #31, #36-#47

**Ziel:** Rust-basierter Backtester mit Walk-Forward, Triple-Barrier, Monte Carlo.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **16a** | Rust Backtester Core | RUST Sek. 5 | Rayon parallel, Risk-Intercept, Event-basierte Architektur |
| **16b** | Walk-Forward Validation | IND #36 | Rolling Train/Test Split, Out-of-Sample Performance |
| **16c** | Slippage/Commission Model | IND #37 | Realistisches Execution-Modell |
| **16d** | Triple-Barrier Labeling | IND #44 | AFML Ch.3: Take-Profit / Stop-Loss / Time-Out Labels |
| **16e** | Parameter Sensitivity | IND #38 | Grid Search ueber Indikator-Parameter |
| **16f** | Deflated Sharpe Ratio | IND #47 | AFML Ch.14: Korrektur fuer Multiple Testing |
| **16g** | Monte Carlo Price Projection | IND #45 | Geometric Brownian Motion, Confidence Bands im Chart |

### Verify Gate
- [ ] Backtester: 5-Jahres-Backtest <10s (Rust)
- [ ] Walk-Forward: Out-of-Sample Ergebnis kein Overfitting
- [ ] Triple-Barrier Labels mathematisch korrekt

---

## Phase 17: Game Theory Mode + Simulation

> **Ref:** GT Sek. 1-9, AT Sek. 10, OPTS Sek. 11 (v2+v3)

**Ziel:** Interaktive Simulationen auf der GeoMap. Hier laufen Memory (KG), Agents, und D3 zusammen.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **17a** | D3 v2+v3 Stack | OPTS Sek. 11 | `d3-force`, `d3-chord`, `d3-contour`, `d3-geo-polygon`, `d3-delaunay`, `@xyflow/react` |
| **17b** | Game Theory Kernlogik | GT Sek. 2-6 | Nash Solver (Pure/Mixed), Bayesian Updating, Regime Detection, Transmission Path Engine |
| **17c** | Monte Carlo Simulation | GT Sek. v5 | N Pfade, Confidence Bands, Regime-Switching GBM |
| **17d** | Spielbaum Visualisierung | GT Sek. 7 | ReactFlow/d3-hierarchy, Wahrscheinlichkeiten an Kanten, Market-Impact an Blaettern |
| **17e** | GeoMap GT Overlay | AT Sek. 10 | Transmission-Path-Arcs, Impact-Radius, Actor-Netzwerk, Sanction/Trade-Flow Chords |
| **17f** | Timeline Component | GT Sek. 8 | `d3-brush` Slider, historische Events, Regime-Wechsel als Baender |
| **17g** | KG Integration | GT Sek. 8.1 | 36 Strategeme Matching, Behavioral Ops (Chase Hughes), historische KG-Traversal |
| **17h** | Planner Agent | AGT Sek. 4 | Spielbaum generieren, Strategeme identifizieren, Szenarien bewerten |

### Verify Gate
- [ ] 3-Ebenen-Spielbaum korrekt visualisiert
- [ ] Transmission Paths: Event → 3 betroffene Maerkte mit Impact
- [ ] Timeline Brushing filtert Karte korrekt
- [ ] Monte Carlo: 1000 Pfade <5s

---

## Phase 18: Options + Dark Pool + DeFi

> **Ref:** IND Phase G Todos #58-#62, GO-R Sek. 11, 13.1, 14.1-14.2

**Ziel:** Alternative Daten-Layer: Options Flow, Dark Pool Signal, DeFi On-Chain, Oracle Cross-Check.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **18a** | Dark Pool Signal | IND #58, GO-R Sek. 11 | FINRA ATS Go-Fetcher + Python Smart Money Extension. `/api/v1/darkpool/signal` |
| **18b** | GEX Profile + Call/Put Walls | IND #59 | Polygon Options Chain → Gamma Calc. `/api/v1/options/gex-profile` |
| **18c** | Expected Move | IND #60 | IV → Price Cone im Chart. `/api/v1/options/expected-move` |
| **18d** | Options Calculator | IND #61, PF P-32 | Black-Scholes Greeks, P/L Simulation, Multi-Leg |
| **18e** | DeFi Connectors | GO-R Sek. 13.1 | DefiLlama (TVL), Coinglass (Funding/OI), Whale Alert, mempool.space |
| **18f** | Oracle Cross-Check | GO-R Sek. 14.1-14.2 | Chainlink/Pyth Preis-Vergleich, Disagreement Detector |

### Verify Gate
- [ ] Dark Pool Ratio Bar unter Volume-Panel sichtbar
- [ ] GEX Bar Chart mit Call/Put Wall Lines
- [ ] Oracle Disagreement → Alert

---

## Phase 19: GeoMap v3 + Collaboration + Rust

> **Ref:** GEO Sek. 35.4 (Stufe 3), 35.7-35.9, RUST Sek. 13

**Ziel:** Collaborative Editing (CRDT), Entity Graph, High-Density Rendering (deck.gl), Rust Spatial (h3o).

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **19a** | CRDT via Yjs | GEO Sek. 35.9 | Y.Map/Y.Array fuer Events/Candidates/Drawings, y-websocket Sync, Persistence |
| **19b** | Analyst Presence | GEO Sek. 35.9 | `@y-presence/react`, "Analyst B is looking at MENA" |
| **19c** | Entity Graph | GEO Sek. 35.8 | Actor/Asset/Sanction/Chokepoint Nodes + Edges, Graph-Queries |
| **19d** | deck.gl Integration | GEO Sek. 35.4 Stufe 2 | GeoJsonLayer, HeatmapLayer, ScatterplotLayer, PathLayer (Trade Corridors) |
| **19e** | h3o Spatial Indexing | RUST Sek. 13 | H3 Indices pro Event, `grid_disk` Radius-Queries, 26x schneller als JS |
| **19f** | Calibrated Confidence | GEO Sek. 35.7 | Platt Scaling / Isotonic Regression auf historischem Feedback |
| **19g** | Active Learning | GEO Sek. 35.7 | Disagreement Cases → Re-Training Candidates |
| **19h** | Non-Western Sources | GEO Sek. 12.2a | Yonhap API, WorldNewsAPI, Al Jazeera Portal, APIScout Africa |

### Verify Gate
- [ ] 2 Analysten sehen gegenseitige Aenderungen in <2s (CRDT)
- [ ] Entity Graph: "Events affecting semiconductor export controls" liefert Ergebnis
- [ ] deck.gl PathLayer: Trade Corridors sichtbar
- [ ] h3o: Radius-Query <1ms

---

## Phase 20: ML Pipeline

> **Ref:** IND Sek. 0.5 (Stufe 1-3), Sek. 3.5-3.6

**Ziel:** Machine Learning Schicht ueber dem Indikator-Katalog.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **20a** | Feature Engineering | IND Stufe 1 | 30+ Indikatoren als Feature-Vektor, Normalisierung, Feature Importance |
| **20b** | Classical ML | IND Stufe 2 | XGBoost/LightGBM Signal Classification, Random Forest, Isolation Forest Anomaly. `/api/v1/ml/classify-signal` |
| **20c** | Hybrid Fusion | IND Sek. 3.5 | Feature-Level XGBoost + Decision-Level Rules → Meta-Labeler (AFML Ch.3) |
| **20d** | Deep Learning (optional) | IND Stufe 3 | LSTM/GRU, Temporal Fusion Transformer, Autoencoder Regime Detection. Separater `ml-inference-service` |
| **20e** | Continuous Bias Monitoring | IND Sek. 3.6 | Geographic Distribution, Regime-Balance, Rule/ML Agreement Rate |

### Verify Gate
- [ ] XGBoost: Signal Classification >60% Accuracy auf Test-Set
- [ ] Meta-Labeler: Bet Size korreliert mit Signal Confidence
- [ ] Bias Monitor: Alert bei Geographic Imbalance

---

## Phase 21: Frontend Refinement + Hardening

> **Ref:** Diverse (Cleanup-Phase)

**Ziel:** Codebase bereinigen, Contracts validieren, UI polieren. Echtes Finale.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **21a** | Zod Validation | API_CONTRACTS | Zod-Schemata aus Specs, alle Gateway-Responses validieren |
| **21b** | Dead Code Cleanup | — | Verwaiste Provider-Calls, API-Routes, Dependencies entfernen |
| **21c** | RSC Migration | GOG Sek. 1 | Dashboard, GeoMap, Portfolio initial per React Server Components |
| **21d** | UI Polish | — | Loading States, Error Boundaries, Responsive, Dark Mode |
| **21e** | JSON Logging Rollout | — | `console.log` → JSON (Next.js), `fmt.Println` → `slog` (Go), `print` → `structlog` (Python) |
| **21f** | a11y Pass | GEO Sek. 9.4 | aria-Labels, Focus Management, Screen Reader, Non-Color Severity |
| **21g** | Dependency Audit + Docs | — | Keine ungenutzten Packages, keine Vulnerabilities. Alle Specs aktuell |

### Verify Gate
- [ ] Full Stack Smoke Test: Market Data → Chart → Pattern → Signal → Portfolio → GeoMap
- [ ] Kein Orphan Code
- [ ] a11y: Grundlegende Navigation per Keyboard moeglich

---

## Phase 22 (optional): WASM + Desktop

> **Ref:** RUST Sek. 4, 6, 7

**Ziel:** Rust-Code als WASM im Browser und optionale Desktop-App via Tauri.

| Sub | Name | Ref | Beschreibung |
|:----|:-----|:----|:-------------|
| **22a** | WASM Frontend Indicators | RUST Sek. 4 | `wasm-pack`, npm Package, SMA/EMA/RSI client-side statt TS |
| **22b** | Tauri v2 Desktop | RUST Sek. 7 | 3-10 MB App, native Rust Backend, Mobile-Support |
| **22c** | ChartGPU Evaluation | RUST Sek. 6 | WebGPU Chart-Rendering Performance-Test |

### Verify Gate
- [ ] WASM SMA: <0.1ms pro 2000 Candles im Browser
- [ ] Tauri: App startet, zeigt Dashboard, verbindet zu lokalen Services

---

## Architektur-Entscheidungen (Zusammenfassung)

| Entscheidung | Begruendung | Ref |
|:---|:---|:---|
| **Vertikale Entwicklung** | Jede Phase: End-to-End ueber alle Schichten | — |
| **Auth zuerst (Phase 1)** | KG Encryption, RBAC, WebMCP Security, Consent — alles braucht Auth | AUTH |
| **Correlation IDs** | `X-Request-ID` (UUID) durchgehend Frontend → Rust | AUTH Sek. 7 |
| **WebAuthn/Passkeys** | Passwortlos, SOTA 2026 | AUTH Sek. 2 |
| **Rate Limiting in Go** | Schutz vor Overload bevor Compute-Requests an Python gehen | AUTH Sek. 2.4 |
| **Zod aus Specs generieren** | API_CONTRACTS.md = Single Source of Truth | API_CONTRACTS |
| **Kein Docker lokal** | `dev-stack.ps1` primaer. Dockerfiles nur CI/Deployment | — |
| **Redis JA (Phase 6)** | Agent Working Memory, Market-Data Cache, LLM-Response Cache. SQLite bleibt fuer Persistent | MEM |
| **Polars statt Pandas** | Von Anfang an (Phase 2). Zero-copy via Arrow FFI | RUST Sek. 5a |
| **redb OHLCV Cache** | Embedded, concurrent, TTL-basiert. Kein externer Service noetig | RUST Sek. 5b |
| **Rust via PyO3** | Kein eigener HTTP-Server. ~7ns Overhead | RUST Sek. 2 |
| **Rust-Scope** | PyO3 (P2) → WASM (P22) → Backtester (P16) → h3o (P19) → Tauri (P22) | RUST Sek. 17 |
| **BaseConnector Architektur** | Abstraktions-Layer fuer 40+ Provider. Einmal bauen, immer wiederverwenden | GO-R Sek. 12 |
| **WebMCP primaer** | W3C Draft. `navigator.modelContext.registerTool()`. ~67% weniger Overhead | AT Sek. 3 |
| **Chrome DevTools MCP fuer Debugging** | Low-Level (Network, Performance, Console). Nicht fuer UI-Interaktion | AT Sek. 4.2 |
| **KuzuDB WASM + Client-Side Encryption** | KG im Browser, Offline-faehig, PRF-basierte Encryption | MEM Sek. 5, AUTH Sek. 13 |
| **Agent Framework Python** | LLM-Ecosystem. Orchestrierung via Go Gateway | AGT |
| **Consent Server-Side** | Sofort wirksam. DB-Lookup per Request, kein Token-Refresh noetig | AUTH Sek. 9 |
| **Entropy Monitoring** | System-Selbstueberwachung gegen Monokultur und Collapse | ENT |
| **Backtesting in Rust** | Rayon parallel, 10-100x schneller als Python | RUST Sek. 5 |

---

## Abdeckungs-Matrix: Docs → Phasen

| Dokument | Phasen | Geschaetzte Abdeckung |
|:---------|:-------|:---------------------:|
| INDICATOR_ARCHITECTURE (112 Tasks) | 2, 7, 8, 13, 15, 16, 18, 20 | ~90% |
| GEOPOLITICAL_MAP_MASTERPLAN (139 Tasks) | 4, 9, 12, 17, 19 | ~85% |
| go-research (65 Tasks) | 0, 14, 18 | ~85% |
| RUST_LANGUAGE_IMPLEMENTATION (52 Tasks) | 2, 16, 19, 22 | ~85% |
| CONTEXT_ENGINEERING (35 Tasks) | 10 | ~80% |
| ENTROPY_NOVELTY (38 Tasks) | 11, 12g | ~75% |
| MEMORY_ARCHITECTURE (30 Tasks) | 6, 10c | ~90% |
| AGENT_ARCHITECTURE (40 Tasks) | 10 | ~80% |
| AGENT_TOOLS (25 Tasks) | 10 | ~85% |
| GAME_THEORY (35 Tasks) | 17 | ~85% |
| Portfolio-architecture (33 Tasks) | 5, 13 | ~90% |
| UNIFIED_INGESTION_LAYER (20 Tasks) | 9 | ~90% |
| AUTH_SECURITY (25 Tasks) | 1 | ~95% |
| ADR-001 (12 Tasks) | 3 | ~95% |
| **Gesamt (~661 Tasks)** | **0-22** | **~87%** |

---

## Nicht in Sub-Phasen erfasste Tasks (~86 Tasks, ~13%)

Die folgenden Tasks sind **bewusst nicht als eigene Sub-Phasen** aufgefuehrt, sondern leben als Detail-Checkboxen in den jeweiligen Fach-Docs. Sie sind hier vollstaendig gelistet damit nichts verloren geht.

### Kat. 1: UX-Detailarbeit (zu granular fuer Sub-Phasen) — ~25 Tasks

| Task | Quelle | Einordnung |
|:-----|:-------|:-----------|
| Asset-Link UI: Dropdown `relation`, Dropdown `assetClass`, Slider `weight`, Textarea `rationale` | GEO Sek. 35.10 | Bei Phase 4a (Shell Refactor) miterledigen |
| Impact Horizon Feld pro Asset-Link (`1d/1w/1m/3m`) | GEO Sek. 35.10 | Bei Phase 4a |
| Event Modal zwei-Tier UX: Mini-Modal (hover) + Detail-Modal (double-click) | GEO Sek. 35.14 | Bei Phase 4a |
| Candidate Sort-Algorithmus (Confidence-first vs. Severity-first) | GEO Sek. 28 #5 | Bei Phase 4a |
| Lazy-Loading Strategie fuer Panels | GEO Sek. 25a | Bei Phase 4a |
| Globaler State fuer Geo-Daten (aktuell nur auf Map-Page) | GEO Sek. 25a | Bei Phase 4a |
| localStorage → Prisma Migration fuer Drawings/Manual Corrections | GEO Sek. 25a | Bei Phase 4a |
| Analyst Presence Indikatoren (`@y-presence`) | GEO Sek. 35.9 | Bei Phase 19a (CRDT) |
| Volume Candlesticks Rendering (variable Breite nach Volumen) | IND #25 | Bei Phase 7e (Integration) |
| Heikin-Ashi + K's Candles Charting | IND #25 | Bei Phase 7e |
| Volume Profile UI Binding (Funktion existiert, kein UI) | IND #110 | Bei Phase 7e |
| Watchlists + Cross-Device Sync (Prisma, WebSocket) | IND #62 | Bei Phase 5d (Prisma Extensions) |
| Briefing Mode Export (Region → auto-generiertes Brief MD/PDF) | GEO Sek. 35.12 | Bei Phase 12d (Exports) |
| Collaborative Review Voting-Logik (Majoritaet default, Unanimity S4+) | GEO Sek. 5.4.4 | Bei Phase 19a (CRDT) |
| Cohen's Kappa Berechnung ueber Multi-User Reviews | GEO Sek. 35.6 | Bei Phase 12f (Evaluation Harness) |
| Source Bias Profile Metadaten pro Provider (manuell kuratiert) | GEO Sek. 11.4 | Bei Phase 12b (Evidence) |
| JSON Rules Engine fuer konfigurierbare Candidate-Policies | GEO Sek. 35.5 | Bei Phase 12c (Alerts) |
| Per-Region Cooldown Config | GEO Sek. 35.5 | Bei Phase 12c |
| Per-Category Budgets (max Candidates/Tag) | GEO Sek. 35.5 | Bei Phase 12c |
| Exposure Templates (vordefinierte Asset-Buckets pro Event-Typ) | GEO Sek. 35.10 | Bei Phase 17e (GT Overlay) |
| Country Attractiveness Heatmap Layer (Heritage+WGI+Henley+HDI+FSI+CPI) | GEO Sek. 35.13d | Bei Phase 19d (deck.gl) |
| Trade Corridor PathLayer Spezifika (Dicke=Volumen, Farbe=Commodity, Dash=Sanctions) | GEO Sek. 35.13c | Bei Phase 19d |
| Financial Openness (Chinn-Ito KAOPEN) Heatmap Sub-Layer | GEO Sek. 35.13b, ENT Sek. 12 | Bei Phase 12g (Zentralbank) |
| De-Dollarization Trend Layer (Pfeile pro Land) | GEO Sek. 35.13b, ENT Sek. 12 | Bei Phase 12g |
| Exergy-Impact Badge in Event Modal (green/yellow/red + Contrarian Hint) | GEO Sek. 17.2.1 | Bei Phase 11d (Exergie) |

### Kat. 2: Operational Automation + Monitoring — ~15 Tasks

| Task | Quelle | Einordnung |
|:-----|:-------|:-----------|
| Job-Queue Architektur: ARQ async Redis fuer schwere Compute-Jobs (Elliott Wave, Backtests >5yr) | IND Sek. 0.3 | Bei Phase 16a (Backtester) oder separat wenn Last steigt |
| Horizontal Scaling: Stateless Indicator-Service Replicas hinter Go Load Balancer | IND Sek. 0.6 | Erst wenn Single-Node Limit erreicht |
| Daily Checks Automation (Source Health, Queue Volume, SLA Tracking) | GEO Sek. 34.1 | Bei Phase 12f (Evaluation Harness) |
| Weekly Checks (Reject Ratio, Threshold Tuning, Quota Validation, Key Rotation) | GEO Sek. 34.2 | Bei Phase 12f |
| Incident Response Tooling (Detect → Disable → Manual → Backfill) | GEO Sek. 34.3 | Bei Phase 12f |
| Geographic Coverage Dashboard (unterrepraesentierte Regionen in Source Feeds) | GEO Sek. 11.4 | Bei Phase 12f |
| Context Quality Metrics Dashboard (Coverage, KG-Hit-Rate, Staleness-Impact, Budget-Utilization) | CE Sek. 9.2 | Bei Phase 10b (Context Engineering) |
| Context Trace Logging (vollstaendiger Input-Context pro Agent-Analyse) | CE Sek. 9.1 | Bei Phase 10b |
| Context Trace Storage Strategie (welche Traces aufbewahren, wie lange) | CE Sek. 10.3 | Bei Phase 10b |
| Ablation Testing Framework (systematisch Context-Layer entfernen) | CE Sek. 9.3 | Bei Phase 10b |
| Continuous Bias Monitoring: BiasMonitor Klasse (Geographic, Regime-Balance, Rule/ML Agreement) | IND Sek. 3.6 | Bei Phase 20e |
| Audit-Log Tamper Protection: Hash-Chain (jeder Eintrag hasht den vorherigen) | GEO Sek. 35.16 | Bei Phase 1c (GCT Auth) oder Phase 12b |
| Key Rotation Checks: Auto-Check 90-Tage-Alter, Warning in Source Health Panel | GEO Sek. 35.16 | Bei Phase 1b (Security Middleware) |
| Terms-Aware Storage: Metadata-first, kein Volltext von bezahlten News | GEO Sek. 35.16 | Bei Phase 9b (LLM Pipeline) |
| Access Control per Action: Wer darf Events confirmen, Asset-Links editieren | GEO Sek. 35.16 | Bei Phase 19a (CRDT/Collaboration) |

### Kat. 3: Blocked / V3+ / Long-Term — ~20 Tasks

| Task | Quelle | Blocker / Grund |
|:-----|:-------|:----------------|
| Implied Volatility Surface (IV → Strike → Expiry Grid) | IND #46 | Braucht Options-Daten (Phase 18). Erst danach moeglich |
| PineTS Evaluation | IND Sek. 2.1 | **License-Gate:** AGPL-3.0 Kompatibilitaet muss vorab geklaert werden |
| Quartr Enterprise (Audio + Live Transcripts, 14k+ Companies) | GEO Sek. 12.4 A | Enterprise-Pricing, fruehestens v3+ |
| EarningsCall.biz SDK + WhisperX Diarization | GEO Sek. 12.4 A | $129/mo, v2.5 |
| Zentralbank Webcast Audio Pipeline (yt-dlp → WhisperX → Text/Audio) | GEO Sek. 12.4 D | GPU benoetigt fuer WhisperX, v3.0 |
| Knowledge Base YouTube Channels (Chase Hughes, Behavior Panel) via UIL | GEO Sek. 12.4 G | Abhaengig von Phase 9 (UIL), v3.0 |
| Xinhua, TASS, Anadolu, Bernama, PTI Enterprise-Kontakte | GEO Sek. 12.2a | Kurzfristig unrealistisch. RSS-Fallback als Alternative |
| SEC EDGAR MD&A Extraction (`edgartools`: 10-K Item 7, 10-Q, S-1) | GEO Sek. 12.4 B | v2.0, 1-2 Wochen wenn priorisiert |
| GDELT BigQuery GKG (Tone/Persons/Orgs, Pre/Post-Earnings) | GEO Sek. 12.4 C | BigQuery Kosten, v2.0 |
| BIS Central Bank Speeches Bulk Download + Parser | GEO Sek. 12.4 D | v2.0 |
| Hansard + Congressional Record API | GEO Sek. 12.4 E | v2.5 |
| Automatic Entropy-Collapse Detection | ENT Sek. 7 | v3+, braucht laengere Laufzeit-Daten |
| Exchange Simulation Migration (Funding Rates, Liquidation, Collateral ~850 LoC) | RUST Sek. 5 | Abhaengig von GCT-Stabilisierung |
| VectorTA Evaluation als Kand-Alternative (194+ Indikatoren, SIMD/CUDA) | RUST Sek. 3 | Nur wenn Kand Limitations zeigt |
| FinGPT als Sentiment-Upgrade | GEO Sek. 18.2 | GPU benoetigt, v3 |
| Ensemble Meta-Sentiment (gewichteter Durchschnitt ueber Modelle) | GEO Sek. 18.2 | v3, braucht mehrere Modelle |
| FinBERT2 fuer CN-spezifische Sentiment-Analyse | GEO Sek. 18.2 | v3, nur wenn China-Coverage Prioritaet wird |
| LSTM Regime Detection in Rust (tch-rs, CModule) | GEO Sek. 35.3, RUST Sek. 18.3 | v3, in Phase 19e vorgesehen aber Rust-DL ist komplex |
| Transformer Severity Classification (Rust, tch-rs, DL-7) | RUST Sek. 18.3 | v3, GPU + Training Pipeline benoetigt |
| Automerge-rs fuer Backend-State (Alternative zu Yjs) | GEO Sek. 35.9 | Nur evaluieren wenn Yjs Limits zeigt |

### Kat. 4: Fein-Spezifikationen innerhalb bestehender Sub-Phasen — ~18 Tasks

| Task | Quelle | Lebt innerhalb von |
|:-----|:-------|:-------------------|
| Override-Cap (-0.30) + Monthly Decay (+0.05) auf User Feedback | CE Sek. 4.4.1 | Sub-Phase 10b |
| Contrarian Context Injection (12% Rate im Synthesizer) | CE Sek. 8.3 | Sub-Phase 10b |
| Diversity Floor (min 3 Regionen, 2 Strategem-Types, 1 Weak Signal) | CE Sek. 4.3 | Sub-Phase 10b |
| Conflict Resolution: Frontend vs. Backend KG Praezedenz-Regeln | CE Sek. 6.3 | Sub-Phase 10b |
| Partial Availability / Graceful Degradation Matrix | CE Sek. 6.4 | Sub-Phase 10b |
| 5 Offene Forschungsfragen (Weights Calibration, Merge Latency, Trace Storage, Frontend Budget, Regime Refresh) | CE Sek. 10.1-10.5 | Sub-Phase 10b — muessen VOR Implementierung beantwortet werden |
| Proactive SSE Invalidation bei neuem GeoEvent (Cache + KG Update + Frontend Push) | CE Sek. 7.2 | Sub-Phase 10b |
| Rust DL-3: Zero-Copy Arrow FFI (PyO3 → Python → Polars) | RUST Sek. 18.2 | Sub-Phase 2b |
| Rust DL-4: Custom Error Hierarchy (`IndicatorError` enum) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-5: Property-Based Testing (`proptest`, `quickcheck`) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-8: Structured Logging (`tracing` crate, OpenTelemetry) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-9: Feature Flags (`cfg` + Cargo features) | RUST Sek. 18.2 | Sub-Phase 2a |
| Rust DL-10: Memory-Mapped I/O fuer grosse Backtests | RUST Sek. 18.2 | Sub-Phase 16a |
| Rust DL-11: Compile-Time Dimensional Analysis (`uom` crate) | RUST Sek. 18.2 | Optional, bei Bedarf |
| Rust DL-12: WASM-Specific Patterns (`wasm-bindgen`, `web-sys`) | RUST Sek. 18.2 | Sub-Phase 22a |
| Harmonic Multi-Timeframe Scoring (optionaler `timeframes[]` Param) | IND Ch.8 note | Sub-Phase 8b |
| Multi-Scenario Wave Output (Primary + Alternative + Invalidation) | IND Sek. 4.4 #6 | Sub-Phase 8a |
| Degree-Labeling (Grand Supercycle → Subminuette, Multi-TF Elliott) | IND Sek. 4.4 #7 | Sub-Phase 8a |

### Kat. 5: Entropy Gruppe-B Monetaer-Items — ~8 Tasks

| Task | Quelle | Einordnung |
|:-----|:-------|:-----------|
| URB-Index: Synthetischer Index (XAU 40%, CHF 30%, SGD 30%) | ENT Sek. 11.4, IND Sek. 5s | Bei Phase 11c (Market Entropy Index) als Sub-Indikator |
| H_exergy Daten-Pipeline (EIA/IEA Proxy: Oil Volatility, Shipping Rates, Semiconductor Lead Times) | ENT Sek. 6.1, 9.2 | Bei Phase 14 (Global Providers) — Datenquellen beschaffen |
| Dual-Entropy Metrik: H_info + H_exergy kombiniert als Fragilitaets-Fruehwarnung | ENT Sek. 6 | Bei Phase 11a (Entropy Health Monitor) |
| Entropy-Adaptive Signal-Gewichtung g(E): Dynamische Gewichte parallel | ENT Sek. 10.6 | Bei Phase 11c |
| Escalation-Severity Mapping (Sasan Ladder → Auto-Severity-Tagging) | ENT Sek. 13.5 | Bei Phase 4d (Choropleth Layer) |
| keen_multiplier Calibration Phasen 1-3 (Proxy → EM Econometrics → Live-Fit) | ENT Sek. 8.2 | Bei Phase 11d |
| CBDC Parameter Comparison Layer fuer GeoMap | ENT Sek. 12.4 | Bei Phase 12g (Zentralbank Layer) |
| Corridor Visualization: UN Comtrade Bulk-Import + Trade-Volume Weighted Paths | ENT Sek. 13.2, GO-R Sek. 14.5 | Bei Phase 14 (Daten) + 19d (deck.gl Rendering) |
