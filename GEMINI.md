# Gemini Workspace Guide

## Read Order
1. `AGENTS.md` (mandatory, source of truth)
2. This file (Gemini-specific notes)

## Project Context
- Next.js 16 + React 19 trading platform with Tailwind v4, shadcn/ui, Prisma (SQLite).
- Two pages: Trading Dashboard (`/`) and Geopolitical Map (`/geopolitical-map`).
- ~30 API routes, 13 market-data providers with circuit-breaker and fallback chain.
- Single-user mode. Authentication (`next-auth`) is installed but intentionally not active.
- Database is SQLite (`file:./dev.db`). Enums in Prisma schema are commented out and replaced with String fields.

## Gemini-Specific Focus
- Tool-first investigation, then minimal-change implementation.
- Optimize for fast repo navigation and precise diffs.
- Keep reasoning concrete and tied to files/commands.

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

## Pitfalls
- After `bun install`, always run `bun run db:generate` before dev or build. Without it, Prisma client is missing and build fails with `Cannot find module '.prisma/client/default'`.
- `tailwind.config.ts` is a v3 relic. Do not restore it as active v3 config. Tailwind v4 reads from `globals.css`.
- Enums in `prisma/schema.prisma` are commented out (SQLite). Do not uncomment unless switching back to PostgreSQL.
- `packageManager` field was removed from `package.json`. Do not re-add it — it caused pnpm to destroy bun-installed node_modules during build.
- Do not create `pnpm-lock.yaml` or `package-lock.json`. `bun.lock` is authoritative.

## Investigation Priorities
When debugging common issues:
- Tailwind/styling problems: check `src/app/globals.css`, NOT `tailwind.config.ts`.
- Lint errors: config is `biome.json`. Use `bunx --bun biome check ./src` for diagnostics. To suppress a line: `// biome-ignore lint/rule/name: reason`.
- Database errors: run `bun run db:generate` and verify `.env` has `DATABASE_URL="file:./dev.db"`.
- Build lock errors (`Unable to acquire lock`): delete `.next/lock` file, then retry.
- Dependency conflicts: `bun.lock` is authoritative. Never use pnpm or npm in this project.
- Provider failures: check `src/lib/providers/` for circuit-breaker state and API key presence in `.env`.

## Key Files For Context
- `PROJECT_AUDIT.md` — full audit with current issues and prioritized phase plan.
- `docs/SQLITE_MIGRATION.md` — why SQLite, what changed, how to roll back to PostgreSQL.
- `docs/GEOPOLITICAL_MAP_MASTERPLAN.md` — comprehensive spec for the map feature.

## Memory Management
- Run `/memory refresh` after editing `GEMINI.md` or `AGENTS.md` to reload context.

## Completion Checklist
1. Behavior verified for changed scope.
2. Dependencies and security impact checked when relevant.
3. Clear summary plus next action options.
