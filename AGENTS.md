# TradingView Clones Agent Guide

## Scope
- Primary app: `tradeview-fusion/`.
- `archive/` is historical material. Do not edit files there unless explicitly asked.
- This document is the shared source of truth for coding agents in this workspace.

## Project Role
Build and maintain a Next.js 16 + React 19 trading platform clone with:
- charting and paper-trading workflows,
- a geopolitical map module,
- Prisma-backed persistence,
- server and client routes in one monorepo-style app folder.

## Environment And CLI
Keep the modern CLI workflow at the top and verify tools before use.

```bash
command -v bun node git rg fd jq yq gh
cd tradeview-fusion
bun install
bun run dev
bun run lint
bun run build
bun audit
```

PowerShell equivalents are fine when needed.

## Database
- Active provider: **SQLite** (not PostgreSQL). See `docs/SQLITE_MIGRATION.md`.
- Connection: `DATABASE_URL="file:./dev.db"` in `.env`.
- After `bun install`, always run `bun run db:generate` before dev or build.
- Enums in `prisma/schema.prisma` are commented out because SQLite has no native enum support. The corresponding model fields use `String` instead. The original enum definitions are preserved as comments for reference and for switching back to PostgreSQL later.
- `bun run db:push` creates/syncs the SQLite file against the schema.

## Daily Commands
```bash
# after fresh install (required before dev/build)
bun run db:generate

# app lifecycle
bun run dev
bun run build
bun run start

# quality gates (Biome)
bun run lint          # biome check ./src (read-only)
bun run lint:fix      # biome check --write ./src (auto-fix safe issues)
bun run format        # biome format --write ./src
bun audit

# dependency inspection
bun pm untrusted
bun why <package>

# database
bun run db:push
bun run db:migrate
bun run db:reset
```

## Architecture Snapshot
`tradeview-fusion/src/` key areas:
- `app/`: Next.js app router — 2 pages (`/` trading dashboard, `/geopolitical-map`) and ~30 API routes.
- `features/trading/`: trading workspace, orders panel, news panel, signal insights, sidebar.
- `features/geopolitical/`: map shell, canvas, timeline, candidate queue, event inspector, source health.
- `lib/providers/`: 13 market-data providers with circuit-breaker, caching, and fallback chain.
- `lib/news/`: multi-source news aggregation with caching and symbol filtering.
- `lib/alerts/`: price alert system (currently localStorage-only, not Prisma-persistent).
- `lib/geopolitical/`: confidence ladder, dedup engine, anti-noise alerting, hard/soft-signal adapters.
- `lib/server/`: file-based JSON stores with Prisma dual-write pattern.
- `lib/storage/`: client-side preferences persistence (localStorage).
- `components/`: TradingChart (lightweight-charts), DrawingToolbar, SettingsPanel.
- `components/fusion/`: WatchlistPanel and trading-specific UI.
- SSE streams: `/api/market/stream` (candle data), `/api/geopolitical/stream` (map events).

## Map Stack Rules
- The current world map implementation uses `d3-geo` + `topojson-client` + `world-atlas`.
- Prefer extending `src/features/geopolitical/MapCanvas.tsx` over introducing alternative map libraries.
- Avoid re-adding `react-svg-map`; it is legacy for this codebase and mismatched with React 19 peer ranges.

## Tailwind v4
- Project uses **Tailwind CSS v4** with CSS-first configuration.
- `src/app/globals.css` is the source of truth: `@import "tailwindcss"` + `@import "tw-animate-css"`.
- Theme variables are defined in `globals.css` via `@theme inline`.
- `tailwind.config.ts` is a **v3 relic** and is ignored by Tailwind v4. Do not treat it as active config.
- Use `tw-animate-css` for animations, NOT `tailwindcss-animate` (v3 plugin, unused).

## Dependency Policy
- Use `bun` for add/remove/update so `bun.lock` remains authoritative.
- Keep dependency changes minimal and justified.
- After dependency changes:
  1. run `bun install`,
  2. run `bun pm untrusted`,
  3. review and trust scripts selectively,
  4. run `bun audit`.

## Security And Postinstall Guidance
- Never trust all lifecycle scripts blindly.
- Review each blocked script purpose before `bun pm trust <name>`.
- Prefer trusting only required packages (for example native bindings actually needed by runtime).

## PrismJS Advisory Workflow
If audit reports PrismJS:
1. Check actual installed versions with `bun why prismjs`.
2. Prefer upgrading parent packages first (for example `react-syntax-highlighter`, editor packages).
3. If upstream is lagging, pin with `overrides` only after compatibility check.
4. Re-run `bun audit` and a smoke test of markdown/code highlighting.

## Known Stubs And Gaps
- DrawingToolbar Undo/Redo: only `console.log` stubs in `src/components/DrawingToolbar.tsx`.
- Hard-signal adapters (`src/lib/geopolitical/adapters/hard-signals.ts`): create candidates but do not fetch real data from Fed/ECB/OFAC/UK/UN sources.
- Candidate TTL expiration: not implemented. Candidates stay `open` indefinitely despite `GEOPOLITICAL_CANDIDATE_TTL_HOURS=72` in env.
- Authentication: `next-auth` is installed but intentionally not configured. Single-user mode, no auth required at this stage.
- Price alerts: persisted to localStorage only (`src/lib/alerts/index.ts`), not to Prisma despite `PriceAlertRecord` existing in schema.
- Drawings GET endpoint: `POST`/`DELETE` exist but no `GET` for loading saved drawings.

## Unused Dependencies
These packages are in `package.json` but not imported anywhere:
- `zustand` — state management, not used (React hooks used instead).
- `@tanstack/react-query` — data fetching, not used (direct fetch calls instead).
- `next-intl` — internationalization, not configured.
- `tailwindcss-animate` — replaced by `tw-animate-css` (Tailwind v4 compatible).

Can be removed or adopted later. Do not introduce usage without explicit request.

## Key Documentation
- `PROJECT_AUDIT.md` — full project audit with priorities and phase plan.
- `docs/SQLITE_MIGRATION.md` — SQLite migration details and rollback instructions.
- `docs/GEOPOLITICAL_MAP_MASTERPLAN.md` — comprehensive spec for the geopolitical map feature.

## Linting And Formatting — Biome
- **Biome** (`@biomejs/biome`) replaces ESLint + Prettier. Config: `biome.json`.
- ESLint has been removed. Do not re-add ESLint, `eslint.config.mjs`, or ESLint dependencies.
- Key rules active as **warnings** (not errors): `noExplicitAny`, `noUnusedVariables`, `noUnusedImports`, `useExhaustiveDependencies`, `useImportType`.
- Rules intentionally **off**: `noForEach`, `noNonNullAssertion`, `noConsole`, `a11y` (trading UI).
- Formatting: tabs, indent width 2, line width 100, double quotes, semicolons always.
- CSS: Tailwind directives (`@theme`, `@apply`, `@custom-variant`) are enabled via `css.parser.tailwindDirectives`.
- Import sorting is automatic via `assist.actions.source.organizeImports`.
- Current status: **0 errors, ~100 warnings** (91 are `noExplicitAny` — existing tech debt, not new code).
- To suppress a specific line: `// biome-ignore lint/rule/name: reason` (one line above the offending code).

## Coding Standards
- TypeScript-first. Goal is strict typing, but currently 91 `any` warnings (Biome) and `noImplicitAny` is `false` in `tsconfig.json`. For new code: use proper types. For existing code: replace `any` incrementally when touching a file.
- Error handling in API routes: use `catch (error: unknown)` with `getErrorMessage()` from `@/lib/utils`. Never use `catch (error: any)`.
- Keep components small and composable. Three files exceed 700 lines (`page.tsx`, `GeopoliticalMapShell.tsx`, `TradingChart.tsx`) and should be split when next modified.
- Use server/client boundaries intentionally in Next.js.
- Validate API inputs. Zod v4 is installed but not yet used — prefer Zod schemas for new route validation.
- Avoid silent fallbacks for critical flows.
- Keep files ASCII unless existing file already uses Unicode.

## Validation Before Handover
Run the smallest valid set for changed scope:
1. `bun run lint`
2. `bun run build` for routing/runtime/config changes
3. targeted runtime check (`bun run dev`) when UI or API behavior changed

## Collaboration Rules
- Do not revert user changes unless explicitly requested.
- Surface unknowns early and propose concrete next actions.
- Keep docs and instructions aligned with current repo reality.
