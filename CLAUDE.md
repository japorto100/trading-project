# Claude Workspace Guide

## Read Order
1. `AGENTS.md` (mandatory, source of truth)
2. This file (Claude-specific execution notes)
3. `docs/specs/EXECUTION_PLAN.md` (phases, dependencies, current progress)
4. Spec document for the area you are working on (table in `AGENTS.md`)

## Project Context
- Next.js 16 + React 19 trading platform with Tailwind v4, shadcn/ui, Prisma (SQLite).
- Two pages: Trading Dashboard (`/`) and Geopolitical Map (`/geopolitical-map`).
- ~30 API routes, 13 market-data providers with circuit-breaker and fallback chain.
- Single-user mode. Auth not implemented yet (Phase 1).
- Database is SQLite (`file:./dev.db`). Enums in Prisma schema are commented out and replaced with String fields.
- 22+1 phase roadmap. Phases 0-4 not started. Memory (Phase 6), Agents (Phase 10), Game Theory (Phase 17) planned.
- 4 active services + GCT fork. 3 planned services (Redis, Memory, Agent). See `AGENTS.md` architecture table.

## Claude-Specific Focus
- Be concise and execution-oriented.
- Prefer direct implementation over long planning when scope is clear.
- Report blockers with exact command/output context.
- Always check `EXECUTION_PLAN.md` phase dependencies before starting work.
- Cross-reference `SYSTEM_STATE.md` to verify IST vs. SOLL before assuming anything exists.

## Recommended Workflow
```bash
cd tradeview-fusion
bun install
bun run db:generate   # required after fresh install
bun run lint          # Biome check (0 errors expected)
bun run build
```

## Practical Rules
- Use `rg` for search and `bun why` for dependency traces.
- For dependency warnings, include root cause and exact package chain.
- For security findings, include severity, affected path, and concrete remediation.
- Keep edits minimal and localized; avoid broad refactors unless asked.
- After editing code, run `bun run lint` to verify no new Biome errors. Warnings are acceptable for existing `any` patterns but new code should be warning-free.
- Use `bun run lint:fix` to auto-fix safe issues (import sorting, formatting, unused imports).
- For error handling in API routes: `catch (error: unknown)` + `getErrorMessage()` from `@/lib/utils`. Never introduce `catch (error: any)`.
- When updating spec documents: update `Stand` date, add `Aenderungshistorie` entry, update cross-references in related docs.

## Pitfalls
- After `bun install`, always run `bun run db:generate` before dev or build. Without it, Prisma client is missing and build fails with `Cannot find module '.prisma/client/default'`.
- `tailwind.config.ts` is a v3 relic. Do not restore it as active v3 config. Tailwind v4 reads from `globals.css`.
- Enums in `prisma/schema.prisma` are commented out (SQLite). Do not uncomment unless switching back to PostgreSQL.
- `prisma as any` exists in `src/app/api/fusion/preferences/route.ts` as a workaround. Do not spread this pattern.
- `packageManager` field was removed from `package.json`. Do not re-add it — it caused pnpm to destroy bun-installed node_modules during build.
- Do not re-add ESLint or create `eslint.config.mjs`. Biome (`biome.json`) is the sole linter/formatter.
- Phase numbers changed with EXECUTION_PLAN Rev. 3 (22. Feb 2026). Old Phase 6 (Auth) is now Phase 1. Always use Rev. 3 numbers.

## Do Not Touch
- `tailwind.config.ts` — do not convert back to v3 plugin system.
- Do not create `pnpm-lock.yaml` or `package-lock.json`. `bun.lock` is authoritative.
- Do not re-add ESLint. `biome.json` is the sole linting/formatting config.
- `docs/archive/` — historical material, do not modify.
- Do not add Leaflet, MapLibre, or any alternative map library. GeoMap uses d3-geo exclusively.

## Key Files For Context
- `docs/specs/EXECUTION_PLAN.md` — 22+1 phase roadmap with sub-phases, dependencies, and current progress marker.
- `docs/specs/SYSTEM_STATE.md` — IST/SOLL per architecture layer (17 sections). Ground truth for what exists.
- `docs/specs/API_CONTRACTS.md` — all endpoint definitions incl. Memory (Sek. 11), Agent (Sek. 12), State Observation (Sek. 13).
- `docs/GEOPOLITICAL_MAP_MASTERPLAN.md` — comprehensive spec for the map feature (35+ sections).
- `docs/GEOPOLITICAL_OPTIONS.md` — D3 module catalog, feature-to-module matrix, staged install plan.

## Core Domain Models
Key Prisma models in `prisma/schema.prisma` (all use String instead of enums for SQLite):
- `UserProfile` — single-user profile with watchlists, alerts, orders, layout preferences.
- `PaperOrderRecord` — paper trading orders (buy/sell, market/limit/stop, with stop-loss/take-profit).
- `GeoEventRecord` — confirmed geopolitical events on the map (severity, confidence, sources, assets).
- `GeoCandidateRecord` — proposed events awaiting human review (accept/reject/snooze).
- `GeoTimelineRecord` — audit trail for every event mutation.
- `GeoDrawingRecord` — map drawings (line, polygon, text).

## Completion Checklist
1. Requirements satisfied.
2. Minimum gate: `bun run lint && bun run build` passes.
3. Any risk or follow-up item clearly stated.
4. If spec docs were touched: `Stand` date updated, `Aenderungshistorie` entry added.
