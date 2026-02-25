# TradeView Fusion — Agent Guide

> **Stand:** 22. Februar 2026
> Shared source of truth for all coding agents in this workspace.
> **Detaillierte Regeln:** `.cursor/rules/` (project.mdc, go-backend.mdc, python-backend.mdc, frontend.mdc, specs.mdc)

## Start Here

1. Read **this file** completely (mandatory).
2. Read `docs/specs/EXECUTION_PLAN.md` — master roadmap with 22+1 phases, sub-phases, dependencies, and current progress marker.
3. Read `docs/specs/SYSTEM_STATE.md` — IST/SOLL per architecture layer (ground truth for what exists vs. what is planned).
4. Read the model-specific guide if present: `CLAUDE.md`, `GEMINI.md`, or `CODEX.md`.
5. Read the spec document for the area you are working on (see table below).

> **Rule:** Never implement a feature without first reading its spec document. Cross-check phase dependencies in `EXECUTION_PLAN.md`.

## Project

Multi-service trading platform: real-time charting, geopolitical risk map, portfolio management, algorithmic signal analysis, AI-driven agent system with game theory simulation and memory architecture.

## Architecture (IST: 4 Services + GCT | SOLL: +3 geplant)

| Service | Sprache | Port(s) | Ordner | Status |
|:---|:---|:---|:---|:---|
| **Frontend** | TypeScript (Next.js 16, React 19) | 3000 | `src/` | Aktiv |
| **Go Gateway** | Go 1.23+ | 9060 | `go-backend/` | Aktiv |
| **Python Indicator** | Python 3.12+ (FastAPI) | 8090 | `python-backend/` | Aktiv |
| **Python Soft-Signals** | Python 3.12+ (FastAPI) | 8091 | `python-backend/` | Aktiv |
| **Python Finance-Bridge** | Python 3.12+ (FastAPI) | 8092 | `python-backend/` | Aktiv |
| **Rust Core** | Rust (PyO3) | -- (lib) | `python-backend/rust_core/` | Skeleton |
| **GCT (Fork)** | Go | 9052 (gRPC), 9053 (JSON-RPC) | `go-backend/vendor-forks/gocryptotrader/` | Aktiv |
| **Redis** | -- | 6379 | Docker | Geplant (Phase 6) |
| **Memory Service** | Python (FastAPI) | 8093 | `python-backend/` | Geplant (Phase 6) |
| **Agent Service** | Python (FastAPI) | 8094 | `python-backend/` | Geplant (Phase 10) |

**Data Flow:** Browser → Next.js → Go Gateway → Python/Rust oder GCT oder External Provider.
**Rule #1:** Frontend darf NUR Go aufrufen. Keine direkten Provider- oder Python-Calls.

## Spec-Dateien (LESEN VOR IMPLEMENTIERUNG)

### Specs (docs/specs/)

| Datei | Inhalt | Lesen wenn... |
|:---|:---|:---|
| `EXECUTION_PLAN.md` | Phasen-Roadmap (22+1 Phasen), Sub-Phasen, Dependencies, Current Progress | Immer zuerst |
| `SYSTEM_STATE.md` | IST/SOLL pro Architektur-Bereich (17 Sektionen) | Immer zuerst |
| `API_CONTRACTS.md` | Alle Endpoint-Definitionen, Request/Response Schemas (13 Sektionen) | Endpoint-Arbeit |
| `AUTH_SECURITY.md` | 3-Schichten Auth, RBAC, WebMCP Security, Exchange Key Security | Auth, Security |
| `FRONTEND_ARCHITECTURE.md` | Komponentenstruktur, State Management, Dependencies, Phase-Mapping | Frontend-Arbeit |

### Domain Docs (docs/)

| Datei | Inhalt | Phase(n) |
|:---|:---|:---|
| `GEOPOLITICAL_MAP_MASTERPLAN.md` | GeoMap Vision, 35+ Sektionen, Rendering-Pfad | 4, 12, 19 |
| `GEOPOLITICAL_OPTIONS.md` | D3-Module-Katalog, Geo-Extensions, Feature→Module Matrix, Install-Plan | 4, 12, 19 |
| `go-research-financial-data-aggregation-2025-2026.md` | Go Data Router, BaseConnector, 40+ Provider | 0, 7 |
| `GO_GATEWAY.md` | Gateway-Architektur, Routing, Middleware | 0 |
| `INDICATOR_ARCHITECTURE.md` | 112 Indikator-Tasks, Rust/Python Split, ML Pipeline | 8, 11, 14, 15 |
| `RUST_LANGUAGE_IMPLEMENTATION.md` | Polars, redb Cache, WASM, Backtesting Engine | 2, 15 |
| `Portfolio-architecture.md` | Portfolio Management, HRP, Kelly, Rebalancing | 5, 13 |
| `UNIFIED_INGESTION_LAYER.md` | UIL: Candidate Pipeline, Review UI, Dedup | 9 |
| `MEMORY_ARCHITECTURE.md` | 3-Tier Memory (Working/Episodic/Semantic), KG, Vector Store | 6 |
| `AGENT_ARCHITECTURE.md` | Agent Roles, Deterministic Guards, Workflow Patterns | 10, 16 |
| `AGENT_TOOLS.md` | MCP, WebMCP, Browser Control, Agentic Search, A2A | 10, 16, 21 |
| `CONTEXT_ENGINEERING.md` | Context Strategy, Token Budget, Dynamic Pruning | 10, 16 |
| `GAME_THEORY.md` | Nash→EGT→MFG Progression, 36 Strategeme KG, Simulation | 17 |
| `ENTROPY_NOVELTY.md` | Entropy Health Monitor, Market Entropy Index, Early Warning | 18 |
| `POLITICAL_ECONOMY_KNOWLEDGE.md` | Keen/Minsky, Heterodox Economics, Crisis Modeling | Referenz |
| `FRONTEND_DESIGN_TOOLING.md` | Design Tokens, Component Library, Tooling Decisions | 21 |
| `ADR-001-streaming-architecture.md` | SSE Streaming Architecture Decision | 3 |
| `PROVIDER_LIMITS.md` | Provider Rate Limits, Quotas, Fallback Chain | 0, 7 |

### Nicht-relevante Docs (nur bei expliziter Anfrage lesen)

`Advanced-architecture-for-the-future.md`, `CHERI-relevant-2027-2030.md`, `Future-Quant-trading.md`, `ENV_VARS.md`, `REMOTE_DEV_SETUP.md`, `REFERENCE_PROJECTS.md`

## Database

- **Provider:** SQLite (not PostgreSQL). `DATABASE_URL="file:./dev.db"` in `.env` (Dev). **Für Production:** echte Datenbank setzen (z. B. `DATABASE_URL="postgresql://…"`) in `.env.production` / Deployment-Env; nicht `file:./dev.db` in Prod nutzen.
- **ORM:** Prisma. Schema: `prisma/schema.prisma`.
- After `bun install`, always run **`bun run db:generate`** before dev or build.
- Enums are commented out (SQLite limitation). Fields use `String` instead.
- **Geplant (Phase 6):** Redis fuer Caching + Working Memory. PostgreSQL fuer Episodic Store. KuzuDB WASM fuer Client-Side Knowledge Graph.

**Local dev:** For API calls without login, set `AUTH_STACK_BYPASS=true` and/or `NEXT_PUBLIC_AUTH_STACK_BYPASS=true` in `.env`. **In production these must be off** (or use explicit emergency override `ALLOW_PROD_AUTH_STACK_BYPASS=true`). Rust Core: run `cd python-backend/rust_core && maturin develop --release` once so Python can use the PyO3 crate.

**Production secrets:** For production, generate and set **AUTH_SECRET**, **NEXTAUTH_SECRET**, **AUTH_JWT_SECRET** (Go), and **AUTH_KG_FALLBACK_KEY** via your deployment env (not in committed files). Use the same value for Auth in Next.js and Go. Example: `openssl rand -base64 32`. Replace any `CHANGE-ME-use-openssl-rand-base64-32` placeholders before going live.

**Env (Next.js):** `.env.development` und `.env.production` (umbenannt aus `.env.dev`/`.env.prod`) – Next.js lädt sie automatisch bei `bun run dev` (development) bzw. `bun run build`/`start` (production). Kein Copy nach `.env` nötig. Referenz aller Keys: `.env.example`. **Prod:** Domain/URL-Platzhalter (`your-domain.com`, `api.your-domain.com`) in `.env.production` bis zur echten Domain so lassen; bei Deployment ersetzen. Secrets: `openssl rand -base64 32`, gleicher Wert in Next und Go. Siehe `review.md` (Checkliste, verbundene Variablen Frontend ↔ Go).

**Frontend-Env Kurz erklärt:** (1) **News:** Primär im Go-Backend; Frontend (`src/lib/news/aggregator.ts`, Soft-Signal-Adapter) nutzt NEWS_* nur für Fallback/Legacy-Pfade – NEWS_* im Frontend-Env optional. (2) **NEXTAUTH_ADMIN_ROLE:** Rolle des Users beim Login per Credentials Provider (Admin-Benutzer/Passwort) in Auth.js; lebt im Frontend, weil Auth in Next.js läuft. (3) **AUTH_BYPASS_ROLE:** Wenn Auth-Bypass aktiv ist (Dev), bekommt der virtuelle User diese Rolle (z. B. `admin`); Server-Fallback zu `NEXT_PUBLIC_AUTH_BYPASS_ROLE`. (4) **ACLED_THRESHOLD_* / GEOPOLITICAL_MAX_PROVIDER_CALLS_PER_RUN:** Nur relevant, wenn Geo-Ingest im Next-Proxy-Modus läuft (`GEOPOLITICAL_INGEST_*_MODE=next-proxy`); sonst macht Go den Ingest – dann Defaults im Code reichen, kein Muss im Frontend-Env.

## Dev Commands

```bash
# Frontend
bun install && bun run db:generate
bun run dev                    # Next.js dev server (port 3000)
bun run lint                   # Biome check (read-only)
bun run lint:fix               # Biome auto-fix
bun run build                  # Production build

# Go Gateway
cd go-backend && go run ./cmd/gateway

# Python
cd python-backend && source .venv/bin/activate
uvicorn main:app --port 8090

# Rust Core (inside python-backend)
cd python-backend/rust_core && maturin develop --release

# Full Stack (PowerShell)
.\scripts\dev-stack.ps1

# Database
bun run db:push                # Sync schema
bun run db:generate            # Generate Prisma client
```

## Coding Standards

### TypeScript (Frontend)
- Biome linting (`biome.json`). Tabs, indent 2, double quotes, semicolons.
- No ESLint. Do not re-add.
- Tailwind v4 (CSS-first, `globals.css` is source of truth, NOT `tailwind.config.ts`).
- No `any` in new code. `catch (error: unknown)`.
- Components: Keep <700 LoC. Split when touching large files.

### Go (Gateway)
- Standard `net/http` + Gorilla Mux. No framework.
- `log/slog` for structured logging. Include `requestId`.
- Error wrapping: `fmt.Errorf("scope: %w", err)`.
- Config via `os.Getenv()`. No hardcoded secrets.
- Tests: `go test -race ./...`

### Python (Services)
- FastAPI + Pydantic v2. Async handlers.
- Type hints required on all signatures.
- Polars for new DataFrames, Pandas only for yfinance compat.
- `structlog` for JSON logging.

### Rust (Core)
- PyO3 + maturin build chain.
- `kand` for TA indicators, `polars` for DataFrames.
- Tests: `cargo test` + Python integration tests.

## Architectural Rules

1. Frontend → Go only. No direct provider or Python calls.
2. All API keys in `go-backend/.env`. Zero secrets in frontend.
3. Go is the network layer. Everything external goes through Go.
4. Python is thin wrapper. Heavy computation → Rust (PyO3).
5. Every request has `X-Request-ID` (UUID v4). All services log it.
6. Contract-first: define endpoint in `API_CONTRACTS.md` before coding.
7. Vertical development: one boundary at a time (TS↔Go, then Go↔Py/Rs).
8. Auth zuerst (Phase 1), Memory vor Agents (Phase 6 vor Phase 10).
9. Redis JA (Phase 6). Entscheidung dokumentiert in `SYSTEM_STATE.md`.
10. WebMCP ist Default fuer Frontend-Agent-Interaktion. Chrome DevTools MCP fuer Debugging.

## Known Stubs and Gaps

- DrawingToolbar Undo/Redo: console.log stubs.
- Hard-signal adapters: create candidates but don't fetch real Fed/ECB/OFAC data.
- Candidate TTL expiration: not implemented.
- Auth: not implemented. All endpoints open. Phase 1.
- Zustand: installed but unused. Planned for Phase 4-5.
- `@tanstack/react-query`: installed but unused. Planned for adoption.
- Price alerts: localStorage only, not Prisma-persistent.
- 16 frontend provider implementations in `src/lib/providers/`: will be deleted in Phase 0 (logic moves to Go).
- Memory/KG/Vector Store: nicht implementiert. Phase 6.
- Agent Framework: nicht implementiert. Phase 10.
- Game Theory: statische Heuristik in Soft-Signals. Formalisierung ab Phase 17.
- Entropy Monitoring: nicht implementiert. Phase 18.

## Map Stack

- `d3-geo` + `d3-drag` + `d3-selection` + `d3-zoom` + `topojson-client` + `world-atlas`.
- Primary component: `src/features/geopolitical/MapCanvas.tsx`.
- Extend, do not replace. No alternative map libraries (no Leaflet, no MapLibre).
- Planned additions (Phase 4): `d3-scale`, `d3-scale-chromatic`, `d3-transition`, `d3-timer`, `d3-ease`, `supercluster`.
- Planned additions (Phase 12): `d3-inertia`, `d3-geo-voronoi`, `d3-hierarchy`, `d3-force`.
- Full module catalog: `docs/GEOPOLITICAL_OPTIONS.md`.

## Security

- Never trust all lifecycle scripts. Review before `bun pm trust`.
- No secrets in logs, API responses, or frontend code.
- See `docs/specs/AUTH_SECURITY.md` for full security architecture (incl. WebMCP hardening).
