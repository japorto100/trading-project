# Claude Workspace Guide

## Read Order
1. `AGENTS.md` (mandatory, source of truth)
2. This file (Claude-specific execution notes)
3. `docs/specs/EXECUTION_PLAN.md` (phases, dependencies, current progress)
4. Spec document for the area you are working on (table in `AGENTS.md`)

## Project Context
- Projekt-Status und Architektur: `docs/specs/SYSTEM_STATE.md` und `EXECUTION_PLAN.md` sind die Source of Truth.
- Diese Datei enthaelt nur modell-spezifische Hinweise; keine Fachtruth duplizieren.
- Dokumentations-Hierarchie und Split-Regeln stehen in `docs/specs/DOCUMENTATION_ARCHITECTURE.md`.

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

## Full Stack (PowerShell) — alle Services opt-out via Skip-Flags
```powershell
.\scripts\dev-stack.ps1                          # alles startet (Go, Python, NATS, Observability, Next.js, GCT)
.\scripts\dev-stack.ps1 -SkipGCT -SkipNext      # typisch für Backend-Dev
# Flags: -SkipGo -SkipGCT -SkipPython -SkipNext -SkipNats -SkipObservability
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

## CLI Tooling Policy (Windows + Git Bash)
- Prefer `rg`/`fd` over `grep`/`find` for discovery and code search.
- Prefer `jq`/`yq` for structured output processing.
- Use `gh` for GitHub workflows when available.
- Installer ownership:
  - System CLIs -> `choco`
  - Rust CLIs -> `cargo` / `cargo-binstall`
  - Python CLIs -> `uv tool`
  - Node CLIs -> `pnpm -g`
- Always verify tool availability and version after install (`command -v`, `<tool> --version`).
- `uutils-coreutils` is optional and does not replace `grep`/`sed`/`awk`.

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
- `docs/specs/DOCUMENTATION_ARCHITECTURE.md` — doc layers, read order, ownership and split rules.
- `docs/specs/API_CONTRACTS.md` — umbrella API contract; use `docs/specs/api/` for boundary details.
- `docs/specs/AUTH_SECURITY.md` — umbrella security spec; use `docs/specs/security/` for focused auth/policy/secrets/encryption docs.
- `docs/specs/geo/GEOMAP_OVERVIEW.md` — comprehensive spec for the map feature (35+ sections).
- `docs/specs/geo/GEOMAP_MODULE_CATALOG.md` — D3 module catalog, feature-to-module matrix, staged install plan.
- `docs/PROXY_CONVENTIONS.md` — Phase 0/1: Correlation-ID, thin proxy, provider-bypass rules.
- `docs/specs/geo/GEOMAP_VERIFY_GATES.md` — Phase 4: Draw-workflow, E2E acceptance, save error paths.
- `docs/BASEMAP_POLICY.md`, `docs/GEOCODING_STRATEGY.md`, `docs/PMTILES_CONTRACT.md`, `docs/PERFORMANCE_BASELINE.md` — Phase 4 GeoMap policy docs.

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

<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **tradeview-fusion** (30144 symbols, 87944 relationships, 300 execution flows).

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
