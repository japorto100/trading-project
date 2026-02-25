# SYSTEM STATE (IST vs. SOLL)

> **Stand:** 22. Februar 2026 (Rev. 2 — Memory, Agent, Game Theory, WebMCP, Entropy ergaenzt. Redis-Entscheidung korrigiert.)
> **Zweck:** Zentrale Wahrheit ueber alle Architektur-Schichten — wo wir heute stehen (IST) und wo wir hin muessen (SOLL). Ein einziges End-to-End-Bild.
> **Quellen:** `package.json`, `go.mod`, `pyproject.toml`, `prisma/schema.prisma`, `dev-stack.ps1`, alle Docs im `docs/`-Ordner.
> **Lebendes Dokument:** IST-Zustand wird nach jeder abgeschlossenen Phase in `EXECUTION_PLAN.md` aktualisiert.
> **Aenderungshistorie:** Rev. 1 (20. Feb) — Erstfassung (Sek. 1-12). Rev. 2 (22. Feb) — Sek. 13-17 (Memory, Agent, Game Theory, WebMCP/MCP, Entropy) ergaenzt. "Kein Redis" → "Redis JA". Auth um KG Encryption + WebMCP Security erweitert.

---

## 1. Architektur-Übersicht: Schichten

| Komponente | Rolle | IST-Zustand (Feb 2026) | SOLL-Zustand |
|:---|:---|:---|:---|
| **Frontend (Next.js)** | UI, Charting, User Input | 44 API-Routes. Holt Market-Data teilweise direkt von Providern oder Python. | **Darf nur mit Go kommunizieren.** Keine direkten Provider- oder Python-Aufrufe. |
| **Go Gateway** | API Gateway, Data Router, SSE | Holt Geo, Macro, News, Backtests. Ignoriert aktuell Market-Data-Anfragen vom Frontend. SSE-Streaming für Market-Data funktioniert. | **Single Point of Entry.** Adaptive Data Router mit Health Scoring. Holt Market-Data, routet Analytics an Python. Rate Limiting. |
| **Python Services** | Analytics, LLM, ML | 3 FastAPI-Services (8081, 8091, 8092). Werden teils direkt vom Frontend aufgerufen. | **Interne Services.** Nur Go darf Python aufrufen. Python agiert als Thin Wrapper für den Rust-Core. Polars statt Pandas. |
| **Rust Core** | Heavy Compute, Patterns, Backtesting | Existiert nicht. | **PyO3 Crate** (`rust-core/`). Wird in Python importiert via `maturin`. kand-Crate für TA, Polars für DataFrames. GIL-free. |
| **GoCryptoTrader** | Crypto-Engine, Order Execution | Lokaler Fork vorhanden, startbar per `-WithGCT`. gRPC 9052, JSON-RPC 9053. Portfolio-Polling (60s). | Bleibt als Crypto-Datenlieferant & Order-Engine hinter dem Go-Gateway. GCT Bridge für Portfolio-Endpoints. |
| **Datenbank** | Persistenz | Prisma 6.11 + SQLite (`dev.db`). GeoMap nutzt Dual-Write (Prisma + JSON-Fallback). | SQLite bleibt fuer lokale Dev. **Redis** fuer Hot-Path Cache. Schema-Erweiterungen fuer Portfolio, Episodes, Consent. |
| **Auth** | Authentifizierung, Autorisierung | Auth.js/next-auth v5 (beta) als Transitional/Product-Baseline aktiv: Credentials-Login/Register + Passkey-Provider (`passkey`), `src/proxy.ts`-RBAC/Header-Enforcement, Bypass-Flags für Dev/CI. | **WebAuthn/Passkeys** (passwortlos, SOTA 2026). CSP Headers. RBAC (Analyst/Viewer/Trader). **KG Encryption** (PRF/Fallback). **WebMCP Security**. Consent Server-Side. API Keys nur in Go. → Details: `AUTH_SECURITY.md` Sek. 2-13 |
| **Memory** | Caching, Knowledge, Episodic | Zustand Stores (Frontend), vereinzelte DB-Calls. Kein zentrales Memory-System. | **3-Schichten:** Working (Redis), Episodic (PostgreSQL), Semantic (KG + Vector Store). → Details: [`MEMORY_ARCHITECTURE.md`](../MEMORY_ARCHITECTURE.md) |
| **Agent** | AI-Agenten, Autonome Analyse | Nicht vorhanden. Statische API-Aufrufe. | **Agent Framework** (Python FastAPI WS). Rollen: Extractor/Verifier/Guard/Synthesizer/Monitor. Context Engineering. WebMCP Tools. → Details: [`AGENT_ARCHITECTURE.md`](../AGENT_ARCHITECTURE.md), [`AGENT_TOOLS.md`](../AGENT_TOOLS.md), [`CONTEXT_ENGINEERING.md`](../CONTEXT_ENGINEERING.md) |
| **Game Theory** | Geopolitische Spieltheorie | Statische Keyword-Heuristik (v1) im Go Game-Theory Connector. | **v1-v7 Roadmap:** Nash → Bayesian → Regime → Transmission → Monte Carlo → EGT → Mean Field. Simulation Page. → Details: [`GAME_THEORY.md`](../GAME_THEORY.md) |
| **Entropy** | System-Selbstueberwachung | Nicht vorhanden. | **Entropy Health Monitor** (5 Dim.), KG-Confidence Dampening, Market Entropy Index, Exergie-Exposure. → Details: [`ENTROPY_NOVELTY.md`](../ENTROPY_NOVELTY.md) |
| **Dev Tooling** | Lokale Entwicklung | `dev-stack.ps1` startet Go + 3 Python Services + Next.js. Health-Check nur fuer Go Gateway. | Erweiterung um `maturin develop` (Rust), Redis + ChromaDB Container. Health-Check fuer alle Services. Kein Docker lokal. |

---

## 2. Datenfluss-Korrekturen (Kritische Lücken)

### Market Data (OHLCV & Quotes)
- **IST (FALSCH):** `Browser → Next.js API → Provider (Yahoo/Finnhub/usw.)` oder `→ Python finance-bridge (8081)`
- **SOLL (KORREKT):** `Browser → Next.js API → Go Gateway (9060) → Provider/GCT`
  - Go übernimmt Adaptive Health Scoring, Rate Limiting, Caching und Failover-Logik (Data Router).
- **Teilfortschritt (22./23. Feb 2026, Codex):** `quote`, `ohlcv`, `market/news` und `geopolitical/news` laufen in den Next.js API-Routes jetzt ueber den Go-Layer; `quote`, `ohlcv` und `market/news` sind dabei **strict Go-only** (kein Frontend-Provider-/TS-News-Aggregator-Fallback mehr in den Routes), `geopolitical/news` nutzt Go-only fuer den News-Fetch bei lokaler Geo-Query-Bildung. Go exponiert dafür u. a. `GET /api/v1/ohlcv`, `GET /api/v1/quote/fallback` (Go -> Finance-Bridge `/quote`) und `GET /api/v1/news/headlines`.
- **Teilfortschritt (22. Feb 2026, Codex):** `market/search` läuft über ein transitional `GET /api/v1/search` (Go -> Python Finance-Bridge) jetzt **strict Go-only** (kein Frontend-Provider-Fallback mehr).
- **Teilfortschritt (22. Feb 2026, Codex):** Die SSE-Market-Streams (`market/stream`, `market/stream/quotes`) holen Candle-/Quote-Daten nicht mehr direkt über `lib/providers`, sondern über interne Next-Market-Routes und damit indirekt Go-first (`/api/market/ohlcv`, `/api/market/quote`).
- **Teilfortschritt (22. Feb 2026, Codex):** Fusion-Portfolio-Snapshots (`src/lib/orders/snapshot-service.ts`) nutzen Go-first Quote-Fetches fuer Preisaktualisierung ohne lokalen Provider-Fallback; fehlende Live-Preise werden toleriert (realized PnL bleibt korrekt).
- **Teilfortschritt (22. Feb 2026, Codex):** `src/app/api/market/providers` verwendet keinen Frontend-Provider-Manager mehr; Status basiert transitional auf `PROVIDER_REGISTRY` + Go-`/health`-Reachability (Heuristik statt direkter Provider-Probes).
- **Teilfortschritt (22./23. Feb 2026, Codex):** In `src/app/api/market/*` gibt es keine direkten `lib/providers`-Fetches bzw. `getProviderManager()`-Aufrufe mehr; zudem verwendet `src/app/api/*` fuer Market/Geopolitical-News keinen lokalen `fetchMarketNews(...)`-Aggregator mehr. Verbleibende Fallback-/Transitional-Logik liegt im Go-Layer oder in Next-Streaming-Resilience-Pfaden (Go-SSE primär, legacy polling fallback).

### Indicator Calculation (Heavy Compute)
- **IST (FALSCH):** `Browser → Next.js API → Python Indicator Service (8092)`
- **SOLL (KORREKT):** `Browser → Next.js API → Go Gateway (9060) → Python (8092) [powered by Rust-Core via PyO3]`
  - Go validiert Anfragen, fügt OHLCV-Daten bei (Python fetcht NICHT selbst), leitet an Python weiter.

### Indicator Calculation (Leichtgewichtig)
- **IST (KORREKT):** 23+ Indikatoren laufen lokal im TypeScript-Frontend (`src/lib/indicators`).
- **SOLL (KORREKT):** Bleibt unverändert. Schnelle, UI-nahe Indikatoren bleiben im Frontend.

### Streaming (SSE)
- **IST (KORREKT):** `Browser → Next.js API → Go Gateway (9060) → Finnhub WS / GCT`
- **SOLL (KORREKT):** Bleibt. Erweiterung um Candle Builder und Server-Side Alert Engine in Go.

### Geopolitical & Soft-Signals
- **IST (KORREKT):** `Browser → Next.js API → Go Gateway → ACLED/GDELT/CFR` und `Go → Python Soft-Signals (8091)`
- **SOLL (KORREKT):** Bleibt. Python Soft-Signal Pipeline wird gehärtet (Dedup, Confidence Scoring, LLM-Integration via UIL).
- **Teilfortschritt (22. Feb 2026, Codex):** Next.js Soft-Signal-Adapter (`cluster-headlines`, `social-surge`, `narrative-shift`) laufen jetzt Go-first über transitional Go-Proxies statt direkt gegen Python `8091`.

---

## 3. Tool- und Library-Spezifikationen (Der Stack)

### Frontend
- **Framework:** Next.js 16.1.1 (App Router), React 19.0.0, TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix), Framer Motion 12
- **Charting:** `lightweight-charts` 5.1.0 (Haupt-Chart), `d3-geo` (GeoMap Globe), `recharts` (Analytics)
- **State & Data:** Zustand 5.0, TanStack Query 5.82
- **Auth:** Auth.js/next-auth v5 beta (Credentials + Passkey-Provider Baseline, Prisma Adapter)
- **Validation:** Zod 3.24
- **Persistenz:** Prisma 6.11 (SQLite `dev.db`)

### Backend (Go Gateway)
- **Version:** Go 1.25
- **Ports:** 9060 (Gateway), 9052/9053 (GCT optional)
- **Pattern:** Gorilla Mux, Standard `net/http` Handler, Channels für SSE
- **Connectors:** ACLED, GDELT, CFR/CrisisWatch, ECB, Finnhub, FRED, GCT, News (RSS/GDELT/Finviz), Game-Theory

### Analytics (Python)
- **Python:** 3.12+, FastAPI 0.116, Uvicorn, Pydantic, httpx
- **Ports:** 8081 (finance-bridge), 8091 (soft-signals), 8092 (indicator-service)
- **ML/Data:** Pandas, NumPy, Scikit-learn, Scipy, yfinance (finance-bridge). **Phase-2 Slice:** `polars[rtcompat]` (1.38.x) im `python-backend` installiert; `indicator-service` Composite-Pfad nutzt Polars-DataFrame-Preprocessing (best effort / fallback Python).

### Rust Core (Phase 2 gestartet / SOLL)
- **Aktueller Stand (23. Feb 2026):** `python-backend/rust_core/` PyO3-Crate (`tradeviewfusion_rust_core`) existiert; erste Funktion `composite_sma50_slope_norm()` ist in den Python `indicator-service` (Composite Signal) verdrahtet. `indicator-service /health` exponiert `rustCore` Availability/Version.
- **SOLL Crate:** PyO3 0.28 (GIL-free), `kand` (TA Crate, O(1) incremental), Polars (DataFrame), `ndarray`, `linfa`
- **Build:** Maturin (`maturin develop` für Dev, `maturin build --release` für Prod)
- **Cache:** `redb` (embedded key-value, OHLCV cache mit TTL)

---

## 4. GeoMap

> Quelle: [`GEOPOLITICAL_MAP_MASTERPLAN.md`](../GEOPOLITICAL_MAP_MASTERPLAN.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Version** | v1.0-beta (~85% v1 Abdeckung) | v2 → v3 |
| **Frontend** | 17 Dateien, ~3695 LoC. `GeopoliticalMapShell.tsx` ist 1450-LoC-Monolith (~40 useState). d3-geo Orthographic Globe (SVG). 9 Symbol-Typen. | Shell-Refactor (Zustand Store). Canvas/SVG Hybrid Rendering. Keyboard Shortcuts. Clustering (Supercluster.js). |
| **Workflow** | Candidate Queue (confirm/reject/snooze). Timeline Strip. Event Inspector. | Feedback-Driven Review (Signal/Noise/Uncertain + strukturierte Override-Erklärungen). Collaborative Review (3-5 User). |
| **Backend (Next.js)** | 22 API Routes (alle implementiert). Dual-Write (Prisma + JSON). SSE (5s Poll, 6 Event-Types). | `/review` Endpoint (ersetzt accept/reject/snooze). Feedback Metrics API. |
| **Backend (Go)** | ACLED + GDELT Connectors (implementiert + Tests). CFR/CrisisWatch Context. Game-Theory Impact. | Hard-Signal Auto-Candidates (ACLED threshold-basiert). ReliefWeb-Integration. |
| **Backend (Python 8091)** | Soft-Signals: TF-IDF + MiniBatchKMeans (news_cluster), Heuristik + FinBERT (social_surge), Sentiment-Drift (narrative_shift). Nur Headline-Forwarding. | Echte NLP-Pipeline (Embeddings, HDBSCAN, LLM-Narrativ-Analyse). Merge mit UIL-Pipeline. |
| **Daten** | events.json, candidates.json, timeline.json = **LEER**. regions.json (11 Regionen), symbol-catalog.json (9 Symbole). | Seed-Dataset (30-50 Events, 200 Candidates). Golden Set für Regression-Tests. |
| **Tests** | Keine Test-Dateien sichtbar. | Unit + Integration + E2E. |

---

## 5. Portfolio

> Quelle: [`Portfolio-architecture.md`](../Portfolio-architecture.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Frontend** | Paper Trading only (`orders-store.ts`, Prisma + JSON). `buildPortfolioSnapshot()`. PortfolioPanel.tsx. 15s Polling. | Tabs: Paper / Live / Analytics / Optimize. EquityCurveChart, DrawdownChart, CorrelationHeatmap, RollingMetricsChart. |
| **Go/GCT** | `portfolio/` live wallet tracker (60s Poll). Backtester-Portfolio (Holdings, Risk, PNL) existiert aber nicht als REST exponiert. | **GCT Bridge:** `/api/gct/portfolio/summary`, `/positions`, `/balances/:exchange`, `/ohlcv`. REST-Endpoints für Frontend. |
| **Python (8092)** | Keine Portfolio-Endpoints implementiert. | `/portfolio/correlations`, `/rolling-metrics`, `/drawdown-analysis`, `/optimize` (HRP/MinVar), `/kelly-allocation`, `/regime-sizing`. |
| **Rust** | Nicht vorhanden. | Monte Carlo VaR, Correlation Matrix (performance-kritisch). Phase 5. |
| **Phasen** | Paper Trading = P-0 (implementiert). | P-1–P-8 (GCT Bridge), P-9–P-18 (Analytics), P-19–P-23 (Optimize), P-24–P-28 (Multi-Asset), P-29–P-33 (Advanced). |

---

## 6. Go Data Router

> Quelle: [`go-research-financial-data-aggregation-2025-2026.md`](../go-research-financial-data-aggregation-2025-2026.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Routing** | Statische Provider-Priorität im TypeScript-Frontend (`src/lib/providers`). | **Adaptive Health Scoring** in Go (`internal/router/`). Config-basiert (`config.yaml`). ~500 LoC. |
| **Health Scoring** | Keine. Provider-Auswahl ist hardcoded. | Bifrost-style: `weight = (1 - error*0.5) * (1 - latency*0.2) * (1 - utilization*0.05) * momentum`. Alle 5s aktualisiert. States: Healthy → Degraded → Failed → Recovering. |
| **Asset-Class Routing** | Nicht vorhanden. Alles geht an denselben Provider. | Per Asset-Class eigene Provider-Liste: us_equities → [finnhub_ws, polygon, twelve_data]; crypto → [gct, ccxt]; forex → [ecb, finnhub]; macro → [fred, world_bank]. |
| **Circuit Breaker** | Nicht vorhanden. | `failsafe-go`: Circuit Breaker + Retry + Fallback Chain pro Provider. 3-State (sony/gobreaker). |
| **Rate Limiting** | Nicht vorhanden (Frontend-seitig). | Go enforced Provider-Limits (RPM, Daily) bevor Requests rausgehen. |
| **Packages** | N/A | `router.go`, `health.go`, `scoring.go`, `ratelimit.go`, `config.yaml` |

---

## 7. Unified Ingestion Layer (UIL)

> Quelle: [`UNIFIED_INGESTION_LAYER.md`](../UNIFIED_INGESTION_LAYER.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Status** | Nur Konzept. Kein Code. | Go Fetchers + Python LLM Pipeline + TS Review UI. |
| **Go Fetchers** | RSS-Client existiert (`rss_client.go`). | YouTube Transcript (`youtube-transcript-go`, 1h Poll), Reddit (public JSON API, 15min Poll), RSS (Blog-Feeds). |
| **Python Pipeline** | Soft-Signal-Service (8091) existiert, aber nur Headline-Forwarding. | LLM-Pipeline: Language Detection → Summary + Entity Extraction + Classification + Confidence Scoring → Dedup (SHA256 + Similarity) → Candidate Creation. Endpoint: `POST /api/v1/ingest/classify`. |
| **TS Review UI** | Nicht vorhanden. | Double-Threshold: ≥0.85 auto-route, 0.40–0.84 human review, <0.40 auto-reject. Signal/Noise/Uncertain/Reclassify Actions. Copy/Paste Import (Ctrl+V). |
| **Routing** | N/A | LLM bestimmt Ziel: GeoMap, Macro, Trading, Research. Geo-Content → GeoCandidate. |
| **LLM** | Nicht vorhanden. | Ollama (Default), OpenAI (Optional). FinBERT für Sentiment (später). |

---

## 8. Streaming-Architektur

> Quelle: [`ADR-001-streaming-architecture.md`](../ADR-001-streaming-architecture.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **SSE** | Go Gateway streamt Market-Data (Finnhub WS → SSE → Frontend). Funktioniert. | Bleibt. Erweitert um Candle-Events und Alert-Events. |
| **REST Polling** | Frontend pollt parallel zu SSE für OHLCV/Quotes. | **Stream-First mit REST Fallback.** REST nur als Recovery wenn Stream ausfällt. |
| **Candle Builder** | Nicht vorhanden. OHLCV kommt direkt vom Provider. | Go aggregiert Ticks → OHLCV Candles (beliebige Timeframes). Ring Buffer. Out-of-Order Handling. |
| **Alert Engine** | Client-seitig (Frontend prüft Preis-Thresholds). | **Server-Side** in Go. Price Thresholds, Line-Cross Events, Indicator Triggers. State Store für Dedup/Reconnect. |
| **Snapshot Store** | Nicht vorhanden. | Latest Quote/Candle/Alert State für Recovery und Reconnects. |
| **Phasen** | Phase 1 (REST-Polling) ist implementiert. | Phase 2-6: Ingestion → Normalization → Candle Builder → Stream-First → Server-Side Alerts → Replay/Recovery. |

- **Teilfortschritt (23. Feb 2026, Codex):** Neue gemeinsame Go-Streaming-Bausteine unter `go-backend/internal/services/market/streaming/` eingefuehrt (`Timeframe`, `CandleBuilder`, `SnapshotStore`, `AlertEngine`) als Phase-3-Basis.
- **Teilfortschritt (23. Feb 2026, Codex):** `go-backend/internal/handlers/sse/market_stream.go` akzeptiert optional `timeframe` und `alertRules` und emittiert `ready`, `snapshot`, `quote`, `candle`, `alert`, `stream_status`.
- **Teilfortschritt (23. Feb 2026, Codex):** `src/app/api/market/stream` ist Go-SSE-Passthrough mit serverseitiger Alert-Persistenz-Bridge (markiert `triggered=true`) und Legacy-Polling-Fallback fuer nicht-streamfaehige Symbole; der Fallback ist jetzt explizit runtime-flag-gated + in Prod ohne Override fail-closed.
- **Teilfortschritt (23. Feb 2026, Codex):** `src/app/page.tsx` konsumiert `snapshot`/`quote`/`candle`/`alert`; das separate 30s Quote+Alert-Polling wurde entfernt. `src/app/api/market/stream/quotes` nutzt jetzt Go-SSE-Multiplex fuer vollstaendig streamfaehige Symbolsets (Crypto/Stocks) und faellt nur bei mixed/unsupported Sets auf Legacy-Polling zurueck (ebenfalls flag-gated + Prod-Guard).

---

## 9. Auth und Security (3-Schichten-Modell)

> **Detail-Dokument:** [`AUTH_SECURITY.md`](./AUTH_SECURITY.md) — Vollständige Architektur mit GCT-Internals, Exchange Key Hardening, RBAC Matrix, Auth Flows, und Implementation-Reihenfolge.
>
> **Teilfortschritt (22. Feb 2026, Codex):** Phase-1b Baseline gestartet: Go Gateway setzt jetzt Baseline-Security-Header (`nosniff`, `DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP) **inkl. API-CSP-Baseline** (`default-src 'none'; frame-ancestors 'none'; ...`) sowie eine CORS-Allowlist-Middleware (inkl. `OPTIONS`-Preflight) vor den API-Handlern. Zusätzlich existieren im Go-Gateway ein path-basiertes RBAC-Scaffold (rollenbasierte Policy-Matrix, Public-Exceptions), flag-gated via `AUTH_RBAC_ENFORCE=false`, ein path-basiertes In-Memory-Rate-Limit-Scaffold (`AUTH_RATE_LIMIT_ENFORCE=false`) und ein Bearer-JWT-Validation-Scaffold (`AUTH_JWT_ENFORCE=false`, HS256, setzt `X-User-Role`/`X-Auth-*` Header bei Erfolg) **inkl. `jti`-basierter In-Memory-Revocation-Blocklist mit expiry-aware Cleanup** (transitional Preload via `AUTH_JWT_REVOKED_JTIS`) sowie einem **transitional Admin-Endpoint `POST /api/v1/auth/revocations/jti`** (Go-RBAC `admin`-only im Scaffold, Rate-Limit-Scaffold 5/min), der die Blocklist zur Laufzeit befuellen kann. Der Revocation-Scaffold fuehrt jetzt zusaetzlich eine **In-Memory-Audit-Historie (Ringbuffer) + Admin-Read-Endpoint `GET /api/v1/auth/revocations/audit`** fuer Debug/Review sowie optionales hash-chain JSONL-Persisting. **Next.js 16 Proxy-Konsolidierung:** `src/middleware.ts` wurde entfernt (Konflikt mit `src/proxy.ts`), und Request-ID + Security-/CORS-/API-CSP-Header laufen jetzt zentral ueber `src/proxy.ts` als einzige API-Interception-Schicht. Auf Next.js-Seite trägt der bestehende `next-auth` Credentials-Scaffold nun einen Role-Claim in JWT/Session, `src/proxy.ts` kann bei aktivierter Auth path-basiert 401/403 erzwingen und injiziert `X-User-Role` sowie zusaetzlich `X-Auth-User`/optional `X-Auth-JTI` + `X-Auth-Verified=next-proxy-session`; die Proxy-Rollenregeln matchen dabei nun auch reale Next.js-API-Pfade (methodensensitiv) statt nur interne `/api/v1/*`-Pfade. Mehrere Next.js->Go Pfade (Market/Strategy/Geopolitical inkl. Soft-Signal-Ingest) reichen den Header bereits weiter, inklusive der internen Fetches in `market/stream` und `market/stream/quotes`. Prisma enthält jetzt ein Auth-/Security-Tabellen-Scaffold (User/Session/Account/VerificationToken + Authenticator/RefreshToken/TotpDevice/RecoveryCode/UserConsent). Zusaetzlich existieren feature-flagged Passkey/WebAuthn API-Scaffolds unter `/api/auth/passkeys/*` (Challenge-Cookies + Prisma `Authenticator` Persistenz) **plus Browser-Client-Helper (`src/lib/auth/passkey-client.ts`), manuelle Testseite (`/auth/passkeys-lab`), minimale Sign-In-Seite (`/auth/sign-in`, inkl. `?next=` Redirect), serverseitig geschuetzte Passkey-Settings-Seite (`/auth/passkeys`) und ein session-gebundenes Device-Management (`GET/DELETE /api/auth/passkeys/devices`, inkl. Liste/Registrieren/Entfernen) fuer den Scaffold-Flow; `authenticate/verify` kann optional ein kurzlebiges `sessionBootstrap`-Proof fuer einen transitional NextAuth-Credentials-Exchange liefern, das bereits bis zur NextAuth-Session genutzt werden kann. Im TS-Layer sind Strategy- und Soft-Signal-Helper jetzt ebenfalls strict Go-only (kein direkter Python-Fallback mehr), und die Soft-Signal-Adapter beziehen ihre News-Artikelbasis (`q`-Queries) ueber den Go-News-Endpoint statt ueber lokale Aggregator-Provider-Calls.** Inzwischen ist die Auth.js/next-auth-v5-Baseline mit offiziellem Prisma-Adapter + echtem Passkey-Provider (`passkey`) fuer `/auth/sign-in` und `/auth/passkeys` verdrahtet; offen bleiben vor allem Browser/E2E-Live-Verifikation, finale UI-Polish/CSP-Live-Whitelists sowie GCT-nahe DB-/Key-Storage-Verfeinerungen.
>
> **Erweiterung (23. Feb 2026, Codex):** Phase 0/1 wurden weiter ausgebaut: Go besitzt jetzt ein **Adaptive-Router-Scaffold** (`internal/router/adaptive`, YAML-Config `go-backend/config/provider-router.yaml`) mit Health-Score/Circuit-State und `exchange=auto` Failover im Quote-Pfad sowie einen optionalen Debug-Endpoint `GET /api/v1/router/providers`. Zusätzlich existiert ein **BaseConnector-Scaffold** (`internal/connectors/base`) und die HTTP-Connectoren **ACLED + Finnhub** wurden auf diese gemeinsame Request-/Retry-/Timeout-Basis migriert. In Phase 1c kamen GCT-nahe Hardening-Scaffolds hinzu: geschuetzter `/api/v1/gct/*` Prefix (trader-only im RBAC-Scaffold, 2/min Rate-Limit-Rule, `/api/v1/gct/health` als erster Endpoint), Start-Up Policy Validation fuer starke GCT-Credentials/TLS (`GCT_ENFORCE_HARDENING` + opt-in Overrides), append-only JSONL Audit-Middleware fuer `/api/v1/gct/*` sowie ein AES-GCM Helper (`internal/security/aesgcm`) als Baustein fuer spaetere Exchange-Key-/Config-Verschluesselung. **Neu:** Sowohl GCT-Audit-JSONL als auch optionales JWT-Revocation-Audit-JSONL nutzen jetzt eine SHA-256-Hash-Chain (`prevHash`/`entryHash`) als tamper-evident Transitional Audit-Trail; Revocation-Audit bleibt parallel im In-Memory-Ringbuffer fuer den Admin-Read-Endpoint. Auf der Frontend/Auth-Seite ergaenzen `/auth/privacy` + `/api/auth/consent` (serverseitige Consent-Toggles) und das KG-Encryption-Lab (`/auth/kg-encryption-lab`, AES-GCM IndexedDB via Server-Fallback-Key) die Phase-1e/1f-Scaffolds; fehlender LLM-Consent wird bereits auf ausgewaehlten geopolitischen Routen mit `403` erzwungen.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice):** Der Adaptive Router kann jetzt optionale Provider-Metadaten (`group`, `kind`, `capabilities`) aus `go-backend/config/provider-router.yaml` laden und im `/api/v1/router/providers`-Snapshot ausgeben (Vorbereitung fuer gruppenspezifische Routing-/Fallback-Semantik in Phase 7/14). Das BaseConnector-Paket wurde um Gruppen-Scaffolds (`sdmx_client`, `timeseries`, `bulk_fetcher`, `rss_client`, `diff_watcher`, `translation`, `oracle_client`) sowie GCT-inspirierte Basismodule fuer Capability-Matrix und Fehlerklassifizierung erweitert; diese bilden das technische Geruest fuer eine effiziente Quellen-Integration aus `REFERENCE_PROJECTS.md` ohne 1:1-Boilerplate-Clients.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice II):** Bestehende Go-Failoverpfade (zunaechst `internal/services/market/quote_client.go`) melden Fehler jetzt klassifiziert (`timeout`, `quota`, `auth`, `schema_drift`, `upstream_5xx`, ...) an den Adaptive Router. Der Router speichert `lastErrorClass` und aggregierte `failureClasses` pro Provider im Snapshot (`/api/v1/router/providers`) und schafft damit die Grundlage fuer spaetere gruppenspezifische Retry-/Backoff-/Circuit-Policies auch fuer bereits bestehende Quellen.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice III):** Die bestehenden Connectoren **FRED** (`internal/connectors/fred/client.go`) und **ECB** (`internal/connectors/ecb/client.go`) wurden auf den gemeinsamen `internal/connectors/base.Client` umgestellt (Request-Building, Timeout, Retry, Ratelimit). Die providerspezifische Parserlogik bleibt lokal (FRED JSON, ECB XML), wodurch das BaseConnector-Muster schrittweise auf produktive Bestandsquellen ausgerollt wird, bevor weitere Quellen aus `REFERENCE_PROJECTS.md` hinzukommen.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice IV):** Der produktnahe Proxy-Connector **indicatorservice** (`internal/connectors/indicatorservice/client.go`) nutzt jetzt ebenfalls `internal/connectors/base.Client` statt eigenem `http.Client`; ein Unit-Test verifiziert Path-Normalisierung, JSON-Headers und `X-Request-ID`-Propagation. Damit wird die Base-Migration nicht nur auf Datenquellen, sondern auch auf interne Service-Proxies ausgerollt.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice V):** Die produktnahen Proxy-/Bridge-Connectoren **financebridge**, **softsignals** und **geopoliticalnext** nutzen jetzt ebenfalls `internal/connectors/base.Client`. `financebridge` behaelt sein vorhandenes OHLCV-Failover ueber mehrere Upstream-BaseURLs (jetzt als mehrere `base.Client`-Instanzen); neue Tests verifizieren fuer `softsignals`/`geopoliticalnext` weiterhin `X-Request-ID`-, Header- und Path-Propagation.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice VI):** Die bestehenden Connectoren **gdelt** (Geo Events) sowie die Market-News-Connectoren unter `internal/connectors/news/*` (`gdelt_client`, `finviz_client`, `rss_client`) nutzen jetzt ebenfalls `internal/connectors/base.Client` fuer die gemeinsame HTTP-Basis. Die bestehenden parser- und retry-nahen Verhaltensweisen bleiben dabei unveraendert; die Migration reduziert primär HTTP-Setup-Duplikate und vereinheitlicht Timeout/Transport-Basis vor der spaeteren Reference-Quellen-Expansion.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice VII):** Auch die verbleibenden produktnahen Connectoren **gametheory** und **crisiswatch** wurden auf `internal/connectors/base.Client` migriert. Damit ist der `base.Client`-Rollout ueber die priorisierte Bestands-HTTP-Connector-Queue (Market, Geo, interne Proxies) weitgehend abgeschlossen; als naechste Stufe folgt die gruppenweise `REFERENCE_PROJECTS.md`-Quellenintegration (zuerst `G4`, dann `G3`) auf Basis von `group`/`kind`/`capabilities` und Fehlerklassen im Adaptive Router.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice VIII / G4 Start):** Erster `REFERENCE_PROJECTS.md`-Provider aus `G4` ist integriert: **BCB SGS (Banco Central do Brasil)** als `internal/connectors/bcb` auf `internal/connectors/base.Client`. Ein neuer `market.RoutedMacroClient` routet Macro-Requests per Prefix (`BCB_SGS_*`) zwischen FRED-Familie und BCB, sodass `GET /api/v1/quote` (`exchange=bcb`, `assetType=macro`) und `GET /api/v1/macro/history` BCB-Zeitreihen bereits nutzen koennen, ohne `wiring.go` um weitere source-spezifische Verzweigungen aufzublaehen. Der Adaptive Router kennt `bcb` jetzt als `g4_centralbank_timeseries` Provider mit Capabilities im Snapshot.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice IX / G4 Banxico):** **Banxico SIE (Mexiko)** ist als weiterer `G4`-Provider integriert (`internal/connectors/banxico`, token-geschuetzt, `base.Client`). `market.RoutedMacroClient` besitzt jetzt eine Prefix-Registry (`RegisterPrefixClient`) und routet neben `BCB_SGS_*` auch `BANXICO_*` in Quote-/Macro-History-Pfaden (`exchange=banxico`, `assetType=macro`). Damit ist die G4-Expansion auf ein wiederverwendbares Prefix-Routing-Muster umgestellt, das fuer BoK/TCMB/RBI/BCRA weitergenutzt werden kann.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice X / G4 BoK):** **Bank of Korea ECOS** ist als dritter `G4`-Provider integriert (`internal/connectors/bok`, API-Key, `base.Client`) und nutzt das bestehende Prefix-Registry-Muster des `market.RoutedMacroClient` ueber `BOK_ECOS_*`. Sowohl `GET /api/v1/quote` (`exchange=bok`, `assetType=macro`) als auch `GET /api/v1/macro/history` sind vertikal verdrahtet; `POLICY_RATE` mappt fuer `exchange=bok` auf `BOK_ECOS_722Y001_M_0101000` (ECOS Basiszinssatz-Serie).
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice XI / G4 BCRA):** **BCRA Principales Variables v4** ist als weiterer `G4`-Provider integriert (`internal/connectors/bcra`, public JSON/OpenAPI, `base.Client`) und verwendet dasselbe Prefix-Routing-Muster (`BCRA_*`) im `market.RoutedMacroClient`. `GET /api/v1/quote` (`exchange=bcra`, `assetType=macro`) und `GET /api/v1/macro/history` sind vertikal angebunden; `POLICY_RATE` mappt im Projekt derzeit auf `BCRA_160` (temporäre Standardserie, spaeter verfeinerbar). Parallel wurde der Base-Layer um gemeinsame Datumsparser-Helfer (`internal/connectors/base/timeseries_parsing.go`) fuer typische G4-Formate erweitert.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice XII / G4 TCMB):** **TCMB EVDS3** ist als weiterer `G4`-Provider integriert (`internal/connectors/tcmb`, `base.Client`) und nutzt das Prefix-Routing-Muster (`TCMB_EVDS_*`) im `market.RoutedMacroClient`. `GET /api/v1/quote` (`exchange=tcmb`, `assetType=macro`) und `GET /api/v1/macro/history` sind vertikal angebunden; der Connector nutzt den live verifizierten EVDS3-Endpoint `POST /igmevdsms-dis/fe`, parst dynamische Serienfelder plus `UNIXTIME`/`Tarih` und akzeptiert sowohl Punkt- als auch Underscore-Seriencodes (z. B. `TP.AB.TOPLAM` bzw. `TCMB_EVDS_TP_AB_TOPLAM`).
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice XIII / G4 RBI):** **RBI DBIE** ist als weiterer `G4`-Provider im ersten vertikalen DBIE-Slice integriert (`internal/connectors/rbi`, `base.Client`): Der Connector fuehrt einen DBIE-Gateway-Handshake (`POST /CIMS_Gateway_DBIE/GATEWAY/SERVICES/security_generateSessionToken`, Header `authorization`) aus und ruft danach `POST /CIMS_Gateway_DBIE/GATEWAY/SERVICES/dbie_foreignExchangeReserves` auf. `GET /api/v1/quote` (`exchange=rbi`, `assetType=macro`) und `GET /api/v1/macro/history` sind ueber das Prefix-Routing-Muster (`RBI_DBIE_FXRES_*`) vertikal angebunden. Aktuell ist der RBI-Slice auf FX-Reserves-Zeitreihen fokussiert; weitere DBIE-Datasets folgen spaeter.
> **Erweiterung (23. Feb 2026, Codex — Provider-Foundation Slice XIV / G3 SDMX Base):** `internal/connectors/base/sdmx_client.go` ist nicht mehr nur Scaffold: Der Base-SDMX-Client kann jetzt geordnete Dimension-Keys fuer SDMX-REST bauen (inkl. Wildcards `.`), Dataflow-/Datastructure-Pfade erzeugen, Query-Optionen (`format`, `dimensionAtObservation`, `startPeriod`, `endPeriod`) setzen und ein gemeinsames SDMX-JSON-Single-Series-Format (`dataSets[].series[].observations`) in `base.SeriesPoint` parsen. Eine temporaere Intake-Matrix (`docs/tmp/G3_SDMX_SOURCE_INTAKE_2026-02-23.md`) dokumentiert Live-Probes fuer OECD/IMF/ECB und die naechsten Base-/Connector-Schritte.
> 
> **Erweiterung (23. Feb 2026, Codex — Phase 2 Slice):** Ein Rust-Core-Vertikalschnitt ist jetzt als Baseline verifiziert: `python-backend/rust_core/` (PyO3 + maturin) stellt `composite_sma50_slope_norm()`, `calculate_heartbeat(...)` und `calculate_indicators_batch(...)` bereit; `python-backend/ml_ai/indicator_engine/rust_bridge.py` kapselt Import/Status. `build_composite_signal()` nutzt Rust bevorzugt fuer SMA50-Slope, Heartbeat und `rvol_20` (Engine-Marker/Fallbacks in den Component-Details). `python-backend/services/indicator-service/app.py` erweitert `/health` um `rustCore` Status. Frontend-seitig zeigt `SignalInsightsBar` Backend-Composite-Badges (Composite/Confidence, SMA50-Slope inkl. Engine, **Heartbeat**, Smart-Money-Score) via `/api/fusion/strategy/composite`, wodurch der Durchstich Browser -> Next.js -> Go -> Python/Rust im UI sichtbar wird.
>
> **Erweiterung (23. Feb 2026, Codex — Phase 2b/2c Slice):** `indicator-service` **und** `finance-bridge` nutzen jetzt OHLCV-**Polars**-Preprocessing (Spalten `time/open/high/low/close/volume`) und exposen `dataframe`-/`dataframeEngine`-Metadaten in Health bzw. Composite-/OHLCV-Responses (best effort mit Python-Fallback). Wegen CPU-Kompatibilitaet auf diesem Host wird `polars[rtcompat]` statt Standard-Runtime genutzt. Im Rust-Core existiert ein **redb TTL-Cache** (`redb_cache_set/get` via PyO3), der im Python `finance-bridge` als transitional read-through Cache fuer `/ohlcv` aktiv ist (Debug-Felder `cache.hit/lookupMs/storeMs`).
> **Benchmark-Update (23. Feb 2026, Codex):** Nach Rust-seitigem `redb`-DB-Handle-Reuse (globaler DB-Cache pro Pfad) liegt der PyO3-Warm-Get-Benchmark lokal bei ca. `0.0027ms` P50 (`redb_cache_get`), und ein Python-Unittest guardet den Verify-Punkt `<1ms` P50.
> **Phase-2 Freeze (23. Feb 2026, Codex):** Sub-Phasen 2a-2e sind als **Code-Baseline implementiert**. Live-/E2E-Verifikationen (UI-Live-Werte und voller Browser->Next.js->Go->Python/Rust Durchstich) sind als **deferred Verify-Backlog** markiert (User-Vorgabe / spaeterer Durchlauf).
>
> **Ergaenzung (23. Feb 2026, Codex — Phase 1 Credentials/Auth-Bypass):** `User` besitzt jetzt optional `passwordHash` (Scrypt) fuer eine Prisma-basierte Credentials-Auth-Baseline; `POST /api/auth/register` + `/auth/register` sind vorhanden, und der `next-auth` Credentials-Provider prueft Prisma-User vor dem bisherigen lokalen Env-Admin-Scaffold. Auth.js/next-auth laeuft jetzt auf **v5 beta** mit offiziellem Prisma-Adapter (`@auth/prisma-adapter`) und echtem Passkey-Provider (`passkey`) als Baseline; das bisherige `passkey-scaffold` bleibt optional fuer Fallback/Lab. Der Auth-Bypass (`AUTH_STACK_BYPASS` / `NEXT_PUBLIC_AUTH_STACK_BYPASS`) ist weiterhin fuer Dev/CI-Smokes vorgesehen, wird aber in Production in Next + Go standardmaessig fail-closed blockiert (Override nur explizit via `ALLOW_PROD_AUTH_STACK_BYPASS=true`).

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Schicht 1: User Auth** | Auth.js/next-auth **v5 beta** ist als Transitional/Product-Baseline aktiv. **Teilweise Scaffold/Baseline:** offizieller Prisma-Adapter (`@auth/prisma-adapter`), Prisma-basierter Credentials-Login + `POST /api/auth/register` / `/auth/register`, echter Passkey-Provider (`passkey`) für finale Session-Ausstellung in `/auth/sign-in` und zusätzliche Passkey-Registrierung in `/auth/passkeys`; `passkey-scaffold` + `/auth/passkeys-lab` bleiben als optionaler Fallback/Testpfad. JWT/Session-Role-Claim im Next.js-Auth-Setup; `src/proxy.ts` kann (wenn Auth aktiviert) path-basiert 401/403 erzwingen und `X-User-Role` injizieren. Go-RBAC-Policy-Middleware vorhanden (flag-gated) und Go-Bearer-JWT-Validation-Scaffold vorhanden (flag-gated; HMAC allowlist + optionale `issuer`/`audience` + Leeway), aber keine direkte Go-Validierung von NextAuth-Session-Cookies (Architekturpfad bleibt Next.js-Proxy validiert Session, Go validiert Bearer). Prisma Auth-/Security-Tabellen sind als Scaffold angelegt. Zentraler Auth-/Security-Hub unter `/auth/security` verlinkt die vorhandenen Flows. | **WebAuthn/Passkeys** (passwortlos, SOTA 2026). next-auth v5 mit Passkey Provider. JWT in httpOnly Cookie (Refresh-Rotation, `jti`-Blocklist). Rollen: `viewer`, `analyst`, `trader`. **KG Encryption** (PRF/Fallback, `AUTH_SECURITY.md` Sek. 13). **WebMCP Security** (Tool-Call Audit, RBAC, `AUTH_SECURITY.md` Sek. 8.1). **Consent Server-Side** (DB-Lookup, `AUTH_SECURITY.md` Sek. 9). → Details: `AUTH_SECURITY.md` Sek. 2-13 |
| **Schicht 2: GCT Auth** | Basic Auth (`admin`/`Password` Default). Go → GCT gRPC (9052) / JSON-RPC (9053). **Teilweise Scaffold:** `/api/v1/gct/*` Prefix vorhanden (`/api/v1/gct/health`), trader-only RBAC-Rule + 2/min Rate-Limit-Rule, hash-chain JSONL-Audit-Middleware, Start-Up Hardening-Policy (`GCT_ENFORCE_HARDENING`) fuer starke Credentials/TLS. GCT Service-/Backtest-Credentials koennen optional verschluesselt via ENV (`*_ENC`) geliefert werden (AES-GCM Decode beim Gateway-Start). | Starke Credentials. TLS Verify. Go-seitiges Rate Limit (2 req/min für Orders). Audit-Log in DB. → Details: `AUTH_SECURITY.md` Sek. 3 |
| **Schicht 3: Exchange Keys** | Exchange API Keys in GCT `config.json`. Ggf. unverschlüsselt. Kein Credential Scoping, keine IP Whitelist. **Teilweise Scaffold:** Go AES-GCM Helper (`internal/security/aesgcm`) vorhanden; verschluesselte **Service-/Backtest-Credentials via ENV** sind verdrahtet, aber Exchange-Key-/GCT-Config-Blobs selbst sind noch nicht an persistentes Config-Management gekoppelt. | Config Encryption (AES-GCM). **Kein Withdrawal-Permission.** IP Whitelist Exchange-seitig. 90-Tage Rotation. → Details: `AUTH_SECURITY.md` Sek. 4 |
| **RBAC** | Keine Rollen. Alles offen. | `viewer` (read), `analyst` (+reviews), `trader` (+orders). Go Middleware prüft JWT Claims. → Details: `AUTH_SECURITY.md` Sek. 2.3 |
| **API Keys (Provider)** | Split: Market-Provider Keys in root `.env` (Frontend-seitig). | **Alle Provider-Keys nur in `go-backend/.env`.** Frontend hat null Secrets. |
| **CSP/CORS** | **Teilweise:** Go Gateway hat CORS-Allowlist + Baseline Security Headers **inkl. API-CSP-Baseline**; Next.js `src/proxy.ts` setzt API-CSP-Baseline und zusätzlich Page-/UI-Security-Header (inkl. COOP/CORP) mit transitional UI-CSP (`PAGE_CSP_MODE`, optional `PAGE_CSP_POLICY`). Finale produktive UI-CSP-Whitelists + Live-Validierung fehlen noch. | CSP + Strict CORS in Go Gateway (inkl. feinere CSP-Policies für UI/Page-Responses). |
| **Rate Limiting** | Keine. | Pro Endpoint-Gruppe: 100/s allgemein, 10/s Compute, **2/min GCT-Orders**. → Details: `AUTH_SECURITY.md` Sek. 2.4 |
| **Audit** | **Teilweise:** Revocation-Audit (In-Memory + optional hash-chain JSONL **+ optionale Go-native SQLite-DB-Baseline**) + GCT-JSONL-Audit-Scaffold fuer `/api/v1/gct/*` (jetzt ebenfalls hash-chain/tamper-evident). Kein DB-Audit fuer GCT-Aktionen. | Jede GCT-Order: User-ID + Action + Symbol + Amount + Correlation ID → DB. Key Rotation Checks. |
| **Bekannte Lücken** | 10 offene Lücken dokumentiert. | → Vollständige Liste: `AUTH_SECURITY.md` Sek. 5 |

---

## 10. ENV_VARS

> Quelle: [`ENV_VARS.md`](../ENV_VARS.md)

| Datei | IST-Inhalt | SOLL-Zustand |
|:---|:---|:---|
| **`go-backend/.env`** | Gateway Config (HOST, PORT), GCT Config (gRPC, JSON-RPC, Auth), ECB, Finnhub, FRED, ACLED, GDELT, CrisisWatch, Game-Theory, News, Backtest Config. | Bleibt + **alle Market-Provider Keys migrieren hierher** (Twelve Data, Alpha Vantage, Polygon, FMP, etc.). |
| **Root `.env`** | `GO_GATEWAY_BASE_URL`, Geopolitical Cache Settings, Indicator/Soft-Signal Service URLs, Market-Provider Keys (Twelve Data, Alpha Vantage, Polygon, FMP, CoinMarketCap, etc.), CCXT, News API Keys, `DATABASE_URL`, NEXTAUTH Config, CORS, Feature Flags. | **Nur noch:** `GO_GATEWAY_BASE_URL`, `DATABASE_URL`, `NEXTAUTH_*`, `NEXT_PUBLIC_*` Feature Flags. Alle Provider-Keys entfernt. |
| **Migration** | Provider Keys sind in root `.env` weil Frontend sie direkt nutzt. | Wenn Go Data Router steht (Phase 0), können alle Provider-Keys nach `go-backend/.env` wandern. |

---

## 11. Observability / Logging

> **Teilfortschritt (22. Feb 2026, Codex):** Go Gateway hat jetzt ein Request-Middleware-Baseline fuer `X-Request-ID` (Header setzen/echo) und request-scoped JSON-Logs via `slog`. Zusaetzlich ist ein TS -> Go -> Python Header-Pfad fuer `geopolitical/game-theory/impact` verdrahtet. Next.js setzt/propagiert `X-Request-ID` fuer API-Routes jetzt zentral in **`src/proxy.ts`** (nach Entfernung von `src/middleware.ts` wegen Next.js-16 `middleware.ts`/`proxy.ts` Konflikt); dieselbe Proxy-Schicht setzt auch konsolidierte Security-/CORS-Response-Header. Die Python Services teilen sich nun eine gemeinsame FastAPI-Middleware (Header-Echo + JSON-Request-Logs) via `services/_shared/app_factory.py`. Weitere Portfolio-Pfade (`fusion/portfolio`, `fusion/portfolio/history`) echoen `X-Request-ID` und reichen die ID bis zu den Go-Quote-Fetches im Snapshot-Service weiter; auch die SSE-Market-Streams (`market/stream*`) echoen die ID und geben sie an interne Market-Fetches weiter. Im Go-Request-Log werden bei aktivem JWT-Scaffold nun auch `userId`/`userRole`/`authVerified` mitgeloggt (wenn vorhanden). **Neu:** Test-/Dev-Bypass fuer die Auth-Kette (`AUTH_STACK_BYPASS` + optional `NEXT_PUBLIC_AUTH_STACK_BYPASS`) kann Frontend→Go Auth-Enforcement deaktivieren, waehrend Request-ID/Security-Header/Observability aktiv bleiben. Durchgaengige Propagation Next.js -> Go -> Python -> Rust ist noch nicht vollstaendig.

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Logging** | Verstreut: `console.log` (TS), `fmt.Println` (Go), `print`/`logging` (Python). Kein einheitliches Format. | **Strukturiertes JSON-Logging** in allen Services. Einheitliche Felder: `timestamp`, `level`, `service`, `requestId`, `message`, `data`. |
| **Request Tracking** | Kein Request-Tracking über Sprachgrenzen hinweg. | **Correlation ID Header** (`X-Request-ID`, UUID v4). Generiert von Next.js, durchgereicht durch Go → Python → Rust. In jedem Log-Eintrag. In jeder Error-Response. |
| **Metriken** | Keine. | Latenz pro Endpoint, Error Rate pro Provider, Rate-Limit-Utilization. Zunächst als JSON-Logs, später Prometheus-Exposition (optional). |
| **Error Tracing** | Fehler werden geloggt aber nicht korreliert. Bei einem Fehler in Rust/Python weiß das Frontend nicht warum. | Error-Response enthält `requestId`. Debug: `requestId` in allen Service-Logs suchen → vollständiger Request-Trace. |

---

## 12. Dev Tooling

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **`dev-stack.ps1`** | Startet: Go Gateway (9060), finance-bridge (8081), soft-signals (8091), indicator-service (8092), Next.js (3000). Optional: GCT (`-WithGCT`). Lädt `go-backend/.env`. | **Zusätzlich:** `maturin develop` für Rust-Core Kompilierung in Python-Venv. Health-Check für **alle** Services (nicht nur Go). Graceful Shutdown (Zombie-Process-Fix). |
| **Health Checks** | Nur `http://127.0.0.1:9060/health` (Go Gateway). Kein Check für Python-Services. | Health-Check nach Start aller Services: Go (`/health`), Python 8081/8091/8092 (`/health`), Rust (implizit via Python-Import). |
| **Docker** | Nicht vorhanden. Geht auf aktuellem PC nicht. | **Dockerfiles erstellen** für CI/Deployment. Lokal bleibt `dev-stack.ps1` der primäre Workflow. |
| **Flags** | `-WithGCT`, `-SkipGo`, `-SkipYfinance`, `-SkipSoftSignals`, `-SkipIndicatorService`, `-NoNext`, `-InstallMl`. | **Neu:** `-WithRust` (startet `maturin develop` vor Python). `-HealthCheck` (wartet auf alle Services). |
| **Chrome DevTools MCP** | Verfügbar (Cursor Default). | Nutzen für UI-Testing und E2E-Verifikation in allen Phasen. |

---

## 13. Memory Architecture

> Quelle: [`MEMORY_ARCHITECTURE.md`](../MEMORY_ARCHITECTURE.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Working Memory** | Zustand Stores im Frontend (fluechtiger Browser-State). In-Memory Maps in Go/Python. | **Redis** als zentraler Hot-Path Cache: Session/Token (Go), Market-Data 15s TTL (Python), LLM-Response 1h TTL (Python), Agent Working Memory 30min TTL. |
| **Episodic Memory** | Nicht vorhanden. Keine Historie von Analysen. | **PostgreSQL** `agent_episodes` + `analysis_snapshots` Tabellen. Retention 90d. Query: "Alle EURUSD-Analysen der letzten 7 Tage". |
| **Semantic Memory (KG)** | Nicht vorhanden. | **KuzuDB WASM** + IndexedDB im Browser. Nodes: Region/Actor/Event/Strategem. Client-Side Encryption (PRF/Fallback). Server-Backup (MinIO/S3). Seed: 36 Strategeme + 20 historische Crises. |
| **Semantic Memory (Vector)** | Nicht vorhanden. | **ChromaDB** Container. LLM-Analysen → Embeddings → Semantic Search (Cosine >0.85). |
| **Memory API** | Nicht vorhanden. | `POST /api/memory/episode`, `GET /api/memory/episodes`, `GET /api/memory/kg/sync`, `POST /api/memory/search`. Auth-Protected. |

---

## 14. Agent Architecture

> Quellen: [`AGENT_ARCHITECTURE.md`](../AGENT_ARCHITECTURE.md), [`AGENT_TOOLS.md`](../AGENT_TOOLS.md), [`CONTEXT_ENGINEERING.md`](../CONTEXT_ENGINEERING.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Agent Framework** | Nicht vorhanden. Statische API-Aufrufe (User klickt → Backend rechnet → Response). | **Python FastAPI WebSocket** Runtime. Orchestrierung via Go Gateway. Session-Context pro Agent. |
| **Rollen** | Keine. | Extractor, Verifier, Guard, Synthesizer, Router, Planner, Monitor, Research, Knowledge Synthesizer, Evaluator. Ref: `AGENT_ARCHITECTURE.md` Sek. 2. |
| **Guards** | Keine. | BTE (Bias-Transparency-Envelope), DRS (Decision-Record-Schema). Deterministische Pruefung jeder Agent-Antwort. |
| **Context Engineering** | Nicht vorhanden. | Relevance Scoring (4 Dimensionen: Freshness, User-Proximity, Confidence, Regime-Fit), Token Budget Manager, DyCP, LLMLingua-2 Compression, Multi-Source Merge. Ref: `CONTEXT_ENGINEERING.md`. |
| **WebMCP** | Nicht vorhanden. | `navigator.modelContext.registerTool()` (W3C Draft). Read-Only Tools (chart, portfolio, geomap). Mutation Tools (mit Confirm-Modal). ~67% weniger Overhead als Screenshot-Agents. Ref: `AGENT_TOOLS.md` Sek. 3. |
| **Chrome DevTools MCP** | Verfuegbar (Cursor Default). | Fuer Low-Level Debugging (Network, Performance, Console). Nicht fuer UI-Interaktion. Ref: `AGENT_TOOLS.md` Sek. 4.2. |
| **Agentic Search** | Nicht vorhanden. | Codebase Search, News Search (Emergent Mind, arXiv), Memory Search (Episodic + Semantic). Ref: `AGENT_TOOLS.md` Sek. 6. |
| **A2A** | Nicht vorhanden. | Agent Card Schema, JSON-RPC 2.0, Task Delegation. Vorbereitung fuer 2026/2027. Ref: `AGENT_TOOLS.md` Sek. 9. |

---

## 15. Game Theory

> Quelle: [`GAME_THEORY.md`](../GAME_THEORY.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Version** | v1 — Statische Keyword-Heuristik im Go Game-Theory Connector. | v1-v7 Roadmap: Nash (v2) → Bayesian (v3) → Regime (v4) → Monte Carlo (v5) → EGT (v6) → Mean Field (v7). |
| **Nash** | Nicht implementiert. Keywords ("sanction", "embargo") als Proxy. | 2-Player Pure/Mixed Solver, Bayesian Updating (Prior → Signal → Posterior). |
| **Regime Detection** | Nicht vorhanden. | 6 Zustaende: Dormant/Tension/Escalation/Conflict/De-escalation/Frozen. Markov-basierte Transitions. |
| **Transmission Paths** | Nicht vorhanden. | Region A Event → welche Maerkte/Symbole betroffen? Impact-Quantifizierung. |
| **Simulation** | Nicht vorhanden. | Monte Carlo (N Pfade, Confidence Bands), What-If Modus, historischer Vergleich via KG + Vector Store. |
| **Spielbaum** | Nicht vorhanden. | ReactFlow/d3-hierarchy. Szenarien, Wahrscheinlichkeiten, Market-Impact an Blaettern. Interaktiv. |
| **36 Strategeme** | Buch vorhanden, nicht integriert. | Knowledge Graph Nodes (Strategem-Type + Tipping Points + Signale). Matching: Situation → passendes Strategem. Ref: `GAME_THEORY.md` Sek. 8.1. |

---

## 16. Entropy + Novelty Monitoring

> Quelle: [`ENTROPY_NOVELTY.md`](../ENTROPY_NOVELTY.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Entropy Health Monitor** | Nicht vorhanden. | 5 Dimensionen: Signal Diversity, Geo-Region, Strategem, KG-Confidence-Spread, Agent-Interpretation. Dashboard-Widget. |
| **KG-Confidence Dampening** | Nicht vorhanden. | Cap 0.95, -0.08 Decrement pro Widerspruch, -0.02/month Decay. Override-Cap (-0.30). |
| **Market Entropy Index** | Nicht vorhanden. | 5-Komponenten Composite Indicator (E-Metrik). `/api/v1/regime/market-entropy`. |
| **Exergie-Exposure** | Nicht vorhanden. | `exergy_shock` Edge in KG mit `keen_multiplier`. Calibration-Strategie (Phase 1-3). |
| **Monokultur-Prevention** | Nicht vorhanden. | Min-Weight per Signal-Typ. Diversity Floor: min 3 Regionen, 2 Strategem-Types, 1 Weak Signal. |

---

## 17. WebMCP + MCP Protocols

> Quelle: [`AGENT_TOOLS.md`](../AGENT_TOOLS.md)

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **WebMCP** | Nicht vorhanden. Browser unterstuetzt ab Chrome 146 (2026). | `navigator.modelContext.registerTool()`. Read-Only + Mutation Tools im Frontend. ~98% Accuracy vs. Screenshot. Security: AUTH_SECURITY.md Sek. 8.1. |
| **Chrome DevTools MCP** | Server verfuegbar (Cursor). Nicht systematisch genutzt. | Fuer Debugging: Network Inspection, Performance Profiling, Console Logs, Screenshots. Go MCP SDK Tools. |
| **Faustregel** | — | WebMCP = Default fuer Frontend-State + UI-Interaktion. Chrome DevTools MCP = fuer "unter der Haube". Ref: `AGENT_TOOLS.md` Sek. 4.2 Entscheidungsmatrix. |

---

## Fazit: Der Paradigmenwechsel

Die bisherige Entwicklung war horizontal (erst alle UI-Komponenten, dann Backend-Stubs). Ab jetzt arbeiten wir **strikt vertikal**. Jedes neue Feature muss End-to-End durch alle Layer gebaut werden:

```
Browser → Next.js → Go Gateway → Python/Rust → Go → Next.js → Browser
```

Strikte Regeln:
1. **Frontend darf nur Go aufrufen.** Keine direkten Provider- oder Python-Calls.
2. **Python fetcht keine externen Daten.** Go liefert OHLCV als Payload mit.
3. **Rust ist kein eigener Service.** PyO3-Import in Python, kein HTTP.
4. **Alle API Keys leben in Go.** Frontend hat null Secrets.
5. **Jeder Request hat eine Correlation ID.** Durchgehend von Frontend bis Rust.
6. **Auth zuerst (Phase 1).** Keine Features ohne Sicherheit.
7. **Memory vor Agents.** Agents brauchen Episodic + KG + Vector Store.
8. **Redis JA.** Hot-Path Cache fuer Market-Data, LLM-Responses, Agent Working Memory.
