# TradeView Fusion — Agent Guide

> Shared source of truth for all coding agents in this workspace.
> **Doc hierarchy:** [`docs/specs/DOCUMENTATION_ARCHITECTURE.md`](docs/specs/DOCUMENTATION_ARCHITECTURE.md)
> **Detailed rules:** `.cursor/rules/` (project.mdc, go-backend.mdc, python-backend.mdc, frontend.mdc, specs.mdc)

## Start Here

1. Read **this file** completely.
2. Read `docs/specs/EXECUTION_PLAN.md` — working plan, phases, current progress.
3. Read `docs/specs/SYSTEM_STATE.md` — ground truth for what exists vs. what is planned.
4. Read model-specific guide if present: `CLAUDE.md`, `GEMINI.md`.
5. Read the spec for your work area (table below).

> Never implement without first reading the spec. Check phase dependencies in `EXECUTION_PLAN.md`.

## Spec Navigation

Full index and read order: `docs/specs/DOCUMENTATION_ARCHITECTURE.md`.

| Priority | Doc | When to read |
|:---------|:----|:-------------|
| Always | `docs/specs/EXECUTION_PLAN.md` | Phases, dependencies, current progress |
| Always | `docs/specs/SYSTEM_STATE.md` | IST/SOLL per layer — ground truth |
| Architecture | `docs/specs/ARCHITECTURE.md` | Umbrella → `architecture/` subspecs (8 files) |
| API | `docs/specs/API_CONTRACTS.md` | Umbrella → `api/` subspecs (5 files) |
| Security | `docs/specs/AUTH_SECURITY.md` | Umbrella → `security/` subspecs (6 files) |
| Data | `docs/specs/data/DATA_ARCHITECTURE.md` | Data flow, zones, sources, IST |
| Frontend | `docs/specs/architecture/FRONTEND_ARCHITECTURE.md` + `docs/specs/architecture/FRONTEND_QUALITY_RULES.md` | Frontend/BFF authority plus frontendweite Quality-/Boundary-Regeln |
| Agent/Memory | `docs/specs/architecture/AGENT_RUNTIME_ARCHITECTURE.md` | Agent bounds, memory-write policy |
| Governance | `docs/specs/GOVERNANCE.md` | Umbrella → `governance/` blueprints (Phase B/C) |
| Errors/Obs | `docs/specs/ERRORS.md` + `docs/specs/OBSERVABILITY.md` | Error taxonomy, OTel, Correlation IDs |
| Execution | `docs/specs/execution/*.md` | Checklists, verify gates, compute delta |

Root domain docs in `docs/*.md` give deep context — read only when the spec references them.

## Project

Multi-service trading platform: real-time charting, geopolitical risk map, portfolio management, algorithmic signal analysis, AI-driven agent system with game theory simulation and memory architecture.

## Services and Infrastructure

Port source of truth: `scripts/dev-stack.ps1` (comment line: *"Map ports per API_CONTRACTS/SYSTEM_STATE"*).

| Service / Infra | Language | Port(s) | Folder | Status |
|:---|:---|:---|:---|:---|
| **Frontend** | TypeScript (Next.js 16, React 19) | 3000 | `src/` | Aktiv |
| **Go Gateway** | Go 1.26 | 9060 | `go-backend/` | Aktiv |
| **indicator-service** | Python 3.12+ (FastAPI) | 8092 | `python-backend/python-compute/indicator_engine/` | Aktiv |
| **geopolitical-soft-signals** | Python 3.12+ (FastAPI) | 8091 | `python-backend/python-compute/geopolitical-soft-signals/` | Aktiv |
| **memory-service** | Python 3.12+ (FastAPI) | 8093 | `python-backend/python-agent/memory/` | Aktiv |
| **agent-service** | Python 3.12+ (FastAPI) | 8094 | `python-backend/python-agent/agent/` | Aktiv (WS scaffold) |
| **Rust Core** | Rust (PyO3) | — (lib) | `python-backend/rust_core/` | Aktiv |
| **GCT** | Go | 9052 (gRPC), 9053 (proxy) | `go-backend/go-crypto-trader/` | Aktiv |
| **SeaweedFS** | — | 8333 (S3), 9333 (master), 8888 (filer) | `tools/seaweedfs/` | Aktiv (local dev) |
| **NATS JetStream** | — | 4222, monitoring :8222 | `tools/nats/` | Aktiv |
| **OpenObserve** | — | 5080 (UI), 5081 (gRPC) | `tools/openobserve/` | Aktiv (OTel) |

**Data Flow:** Browser → Next.js → Go Gateway → Python/Rust or GCT or External Provider.
**Rule #1:** Frontend calls Go only — no direct provider or Python calls from the browser.

## Database

- **Provider:** SQLite (dev). `DATABASE_URL="file:./dev.db"` in `.env`. Production: set real DB (PostgreSQL).
- **ORM:** Prisma. Schema: `prisma/schema.prisma`. Enums commented out (SQLite → use `String`).
- After `bun install`, always run `bun run db:generate` — missing Prisma client breaks build with `Cannot find module '.prisma/client/default'`.

**Auth bypass (dev only):** Set `AUTH_STACK_BYPASS=true` in `.env`. Must be off in production.
**Secrets:** Generate `AUTH_SECRET`, `NEXTAUTH_SECRET`, `AUTH_JWT_SECRET`, `AUTH_KG_FALLBACK_KEY` via `openssl rand -base64 32`. Same value for Next.js and Go. See `review.md`.
**Env files:** `.env.development` / `.env.production` — loaded automatically by Next.js; no copy to `.env` needed.

## Dev Commands

```bash
# Frontend
bun install && bun run db:generate
bun run dev                    # Next.js :3000
bun run lint                   # Biome check (0 errors expected)
bun run lint:fix               # Biome auto-fix
bun run build                  # Production build

# Go Gateway
cd go-backend && go run ./cmd/gateway
cd go-backend && make bench             # all benchmarks
cd go-backend && make bench-streaming   # CandleBuilder hot-path

# Python (adjust port per service: 8092 / 8091 / 8081 / 8093 / 8094)
cd python-backend && source .venv/bin/activate
uvicorn app:app --host 127.0.0.1 --port 8092 --reload

# Rust Core
cd python-backend/rust_core && maturin develop --release

# Full Stack (PowerShell) — all services start by default
.\scripts\dev-stack.ps1
.\scripts\dev-stack.ps1 -SkipGCT -SkipNext                  # backend only
.\scripts\dev-stack.ps1 -SkipGCT -SkipNext -SkipNats         # without NATS
# Flags: -SkipGo -SkipGCT -SkipPython -SkipNext -SkipNats -SkipSeaweedfs -SkipObservability

# Database
bun run db:push && bun run db:generate
```

## Git Submodules

Nach einem frischen Clone alle Submodules initialisieren:
```bash
git submodule update --init --recursive
```

### GCT (`go-backend/go-crypto-trader`)
- Upstream: `https://github.com/thrasher-corp/gocryptotrader`
- Eingebunden via `go.mod replace ./go-crypto-trader` — **muss vorhanden sein**, sonst schlägt `go build` fehl.
- Keine eigenen Patches — reiner Upstream-Clone. Remote bleibt auf `thrasher-corp` bis ein eigener GitHub-Fork angelegt wird (geplant pre-Phase 11).
- Update auf neuesten Stand:
```bash
git submodule update --remote go-backend/go-crypto-trader
cd go-backend && go mod tidy
```

### Referenz-Clones (`_tmp_ref_review/`)
22 externe Repos (agents, geo, graph, security) — nur zum Lesen/Referenzieren, nicht im Build verwendet.
```bash
# Alle auf einmal updaten
git submodule update --remote --merge -- $(git submodule | awk '{print $2}' | grep _tmp_ref_review)
```

## CLI Tooling Policy (Windows + Git Bash)

- Search: `rg`/`fd` first; `grep`/`find` only for compatibility. JSON/YAML: `jq`/`yq`. GitHub: `gh`.
- Install root: `D:\DevCache`. PATH order: `D:\DevCache\cargo\.cargo\bin` → `D:\DevCache\bin`.
- Rust CLIs → `cargo`/`cargo-binstall`. Python CLIs → `uv tool`. Node CLIs → `pnpm -g`.
- Verified baseline: `cargo-binstall`, `starship`, `atuin`, `coreutils.exe` → `D:\DevCache\cargo\.cargo\bin`; `gh`, `direnv` → `D:\DevCache\bin`.
- `uutils-coreutils` does not replace `grep`/`sed`/`awk`.

## Coding Standards

### TypeScript (Frontend)
- Biome (`biome.json`). Tabs, indent 2, double quotes, semicolons. No ESLint — do not re-add.
- Tailwind v4: `globals.css` is source of truth. `tailwind.config.ts` is a v3 relic — do not restore.
- No `any` in new code. `catch (error: unknown)`. Components: keep <700 LoC, split when touching large files.

### Go (Gateway)
- `net/http` + Gorilla Mux. No framework. `log/slog` for structured logging. Include `requestId`.
- Error wrapping: `fmt.Errorf("scope: %w", err)`. Config via `os.Getenv()`. No hardcoded secrets.
- Goroutine-safety tests: `testing/synctest.Run()` + `synctest.Wait()` (Go 1.24+, no `time.Sleep`).

### Python (Services)
- FastAPI + Pydantic v2. Async handlers. Type hints required on all signatures.
- Polars for new DataFrames; Pandas only for yfinance compat. `structlog` for JSON logging.

### Rust (Core)
- PyO3 + maturin. `kand` for TA indicators, `polars` for DataFrames.
- Tests: `cargo test` + Python integration tests.

## Architectural Rules

1. Frontend → Go only. No direct provider or Python calls — keeps policy enforcement centralised.
2. All API keys in `go-backend/.env`. Zero secrets in frontend (provider keys flow via cookie → Go header).
3. Go is the network layer. Everything external goes through Go.
4. Python is thin wrapper. Heavy computation → Rust (PyO3) — only with profiling evidence.
5. Every request carries `X-Request-ID` (UUID v4). All services log it — required for trace correlation.
6. Contract-first: define endpoint in `docs/specs/API_CONTRACTS.md` before coding — prevents drift.
7. Vertical development: one boundary at a time (TS↔Go, then Go↔Py/Rs).
8. Auth before features (Phase 1). Memory before Agents (Phase 6 before Phase 10).
9. Idempotency everywhere — mutations and jobs must be replay-safe.
10. WebMCP is default for frontend agent interaction. Chrome DevTools MCP for debugging.

## Map Stack

- Core: `d3-geo` + `d3-drag` + `d3-selection` + `d3-zoom` + `topojson-client` + `world-atlas`.
- Active additions: `d3-scale`, `d3-scale-chromatic`, `d3-transition`, `d3-timer`, `d3-ease`, `d3-inertia`, `d3-geo-voronoi`, `d3-hierarchy`.
- Primary component: `src/features/geopolitical/MapCanvas.tsx`. Extend, do not replace.
- No Leaflet, no MapLibre — alternatives break the canvas rendering contract.
- Module catalog: `docs/specs/geo/GEOMAP_MODULE_CATALOG.md`.

## Security

- Never trust all lifecycle scripts — review before `bun pm trust`.
- No secrets in logs, API responses, or frontend code.
- Security topology: `docs/specs/AUTH_SECURITY.md` → `docs/specs/security/` for auth/policy/secrets/encryption details.

<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **tradeview-fusion** (199581 symbols, 611987 relationships, 300 execution flows).

## Always Start Here

1. **Read `gitnexus://repo/{name}/context`** — codebase overview + check index freshness
2. **Match your task to a skill below** and **read that skill file**
3. **Follow the skill's workflow and checklist**

> If step 1 warns the index is stale, run `npx gitnexus analyze` in the terminal first.

## Skills

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
