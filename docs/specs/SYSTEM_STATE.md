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
| **Auth** | Authentifizierung, Autorisierung | next-auth 4.24 installiert aber **inaktiv**. Anonymer `profileKey`. Keine API-Absicherung. | **WebAuthn/Passkeys** (passwortlos, SOTA 2026). CSP Headers. RBAC (Analyst/Viewer/Trader). **KG Encryption** (PRF/Fallback). **WebMCP Security**. Consent Server-Side. API Keys nur in Go. → Details: `AUTH_SECURITY.md` Sek. 2-13 |
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

---

## 3. Tool- und Library-Spezifikationen (Der Stack)

### Frontend
- **Framework:** Next.js 16.1.1 (App Router), React 19.0.0, TypeScript 5
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix), Framer Motion 12
- **Charting:** `lightweight-charts` 5.1.0 (Haupt-Chart), `d3-geo` (GeoMap Globe), `recharts` (Analytics)
- **State & Data:** Zustand 5.0, TanStack Query 5.82
- **Auth:** next-auth 4.24 (installiert, inaktiv)
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
- **ML/Data:** Pandas, NumPy, Scikit-learn, Scipy, yfinance (finance-bridge)

### Rust Core (SOLL)
- **Crate:** PyO3 0.28 (GIL-free), `kand` (TA Crate, O(1) incremental), Polars (DataFrame), `ndarray`, `linfa`
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

---

## 9. Auth und Security (3-Schichten-Modell)

> **Detail-Dokument:** [`AUTH_SECURITY.md`](./AUTH_SECURITY.md) — Vollständige Architektur mit GCT-Internals, Exchange Key Hardening, RBAC Matrix, Auth Flows, und Implementation-Reihenfolge.

| Aspekt | IST-Zustand | SOLL-Zustand |
|:---|:---|:---|
| **Schicht 1: User Auth** | next-auth 4.24 installiert, **komplett inaktiv**. Anonymer `profileKey`. | **WebAuthn/Passkeys** (passwortlos, SOTA 2026). next-auth v5 mit Passkey Provider. JWT in httpOnly Cookie (Refresh-Rotation, `jti`-Blocklist). Rollen: `viewer`, `analyst`, `trader`. **KG Encryption** (PRF/Fallback, `AUTH_SECURITY.md` Sek. 13). **WebMCP Security** (Tool-Call Audit, RBAC, `AUTH_SECURITY.md` Sek. 8.1). **Consent Server-Side** (DB-Lookup, `AUTH_SECURITY.md` Sek. 9). → Details: `AUTH_SECURITY.md` Sek. 2-13 |
| **Schicht 2: GCT Auth** | Basic Auth (`admin`/`Password` Default). Go → GCT gRPC (9052) / JSON-RPC (9053). Kein Rate Limit, kein Audit. | Starke Credentials. TLS Verify. Go-seitiges Rate Limit (2 req/min für Orders). Audit-Log in DB. → Details: `AUTH_SECURITY.md` Sek. 3 |
| **Schicht 3: Exchange Keys** | Exchange API Keys in GCT `config.json`. Ggf. unverschlüsselt. Kein Credential Scoping, keine IP Whitelist. | Config Encryption (AES-GCM). **Kein Withdrawal-Permission.** IP Whitelist Exchange-seitig. 90-Tage Rotation. → Details: `AUTH_SECURITY.md` Sek. 4 |
| **RBAC** | Keine Rollen. Alles offen. | `viewer` (read), `analyst` (+reviews), `trader` (+orders). Go Middleware prüft JWT Claims. → Details: `AUTH_SECURITY.md` Sek. 2.3 |
| **API Keys (Provider)** | Split: Market-Provider Keys in root `.env` (Frontend-seitig). | **Alle Provider-Keys nur in `go-backend/.env`.** Frontend hat null Secrets. |
| **CSP/CORS** | Keine Content Security Policy Headers. | CSP + Strict CORS in Go Gateway. |
| **Rate Limiting** | Keine. | Pro Endpoint-Gruppe: 100/s allgemein, 10/s Compute, **2/min GCT-Orders**. → Details: `AUTH_SECURITY.md` Sek. 2.4 |
| **Audit** | Keine Audit-Logs. | Jede GCT-Order: User-ID + Action + Symbol + Amount + Correlation ID → DB. Key Rotation Checks. |
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

> **Teilfortschritt (22. Feb 2026, Codex):** Go Gateway hat jetzt ein Request-Middleware-Baseline fuer `X-Request-ID` (Header setzen/echo) und request-scoped JSON-Logs via `slog`. Zusaetzlich ist ein TS -> Go -> Python Header-Pfad fuer `geopolitical/game-theory/impact` verdrahtet. Durchgaengige Propagation Next.js -> Go -> Python -> Rust ist noch nicht vollstaendig.

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
