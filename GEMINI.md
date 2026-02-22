# Gemini Workspace Guide

## Read Order
1. `AGENTS.md` (mandatory, source of truth)
2. This file (Gemini-specific notes)
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

## Gemini-Specific Focus
- Tool-first investigation, then minimal-change implementation.
- Optimize for fast repo navigation and precise diffs.
- Keep reasoning concrete and tied to files/commands.
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
- Start with `rg` scans for ownership and usage before editing.
- Use `bun why <pkg>` and `bun pm untrusted` for dependency incidents.
- Validate map-related changes against `src/features/geopolitical/MapCanvas.tsx` stack assumptions.
- Keep instructions and docs aligned with actual code paths.
- After editing code, run `bun run lint` to verify no new Biome errors. Use `bun run lint:fix` for safe auto-fixes.
- For error handling in API routes: `catch (error: unknown)` + `getErrorMessage()` from `@/lib/utils`. Never use `catch (error: any)`.
- Do not re-add ESLint. Biome (`biome.json`) is the sole linter/formatter.
- When updating spec documents: update `Stand` date, add `Aenderungshistorie` entry, update cross-references in related docs.

## Pitfalls
- After `bun install`, always run `bun run db:generate` before dev or build. Without it, Prisma client is missing and build fails with `Cannot find module '.prisma/client/default'`.
- `tailwind.config.ts` is a v3 relic. Do not restore it as active v3 config. Tailwind v4 reads from `globals.css`.
- Enums in `prisma/schema.prisma` are commented out (SQLite). Do not uncomment unless switching back to PostgreSQL.
- `packageManager` field was removed from `package.json`. Do not re-add it — it caused pnpm to destroy bun-installed node_modules during build.
- Do not create `pnpm-lock.yaml` or `package-lock.json`. `bun.lock` is authoritative.
- Phase numbers changed with EXECUTION_PLAN Rev. 3 (22. Feb 2026). Old Phase 6 (Auth) is now Phase 1. Always use Rev. 3 numbers.
- Do not add Leaflet, MapLibre, or any alternative map library. GeoMap uses d3-geo exclusively.

## Investigation Priorities
When debugging common issues:
- Tailwind/styling problems: check `src/app/globals.css`, NOT `tailwind.config.ts`.
- Lint errors: config is `biome.json`. Use `bunx --bun biome check ./src` for diagnostics. To suppress a line: `// biome-ignore lint/rule/name: reason`.
- Database errors: run `bun run db:generate` and verify `.env` has `DATABASE_URL="file:./dev.db"`.
- Build lock errors (`Unable to acquire lock`): delete `.next/lock` file, then retry.
- Dependency conflicts: `bun.lock` is authoritative. Never use pnpm or npm in this project.
- Provider failures: check `src/lib/providers/` for circuit-breaker state and API key presence in `.env`.

## Key Files For Context
- `docs/specs/EXECUTION_PLAN.md` — 22+1 phase roadmap with sub-phases, dependencies, and current progress marker.
- `docs/specs/SYSTEM_STATE.md` — IST/SOLL per architecture layer (17 sections). Ground truth for what exists.
- `docs/specs/API_CONTRACTS.md` — all endpoint definitions incl. Memory (Sek. 11), Agent (Sek. 12), State Observation (Sek. 13).
- `docs/GEOPOLITICAL_MAP_MASTERPLAN.md` — comprehensive spec for the map feature (35+ sections).
- `docs/GEOPOLITICAL_OPTIONS.md` — D3 module catalog, feature-to-module matrix, staged install plan.

## Memory Management
- Run `/memory refresh` after editing `GEMINI.md` or `AGENTS.md` to reload context.

## Completion Checklist
1. Behavior verified for changed scope.
2. Dependencies and security impact checked when relevant.
3. Clear summary plus next action options.
4. If spec docs were touched: `Stand` date updated, `Aenderungshistorie` entry added.
