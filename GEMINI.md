# Gemini Workspace Guide

> **Dokumentations-Hierarchie:** [`docs/specs/DOCUMENTATION_ARCHITECTURE.md`](docs/specs/DOCUMENTATION_ARCHITECTURE.md)

## Read Order
1. `AGENTS.md` (mandatory, source of truth)
2. This file (Gemini-specific notes)
3. `docs/specs/EXECUTION_PLAN.md` (phases, dependencies, current progress)
4. Spec document for the area you are working on (table in `AGENTS.md`)

## Project Context
- Projekt-Status und Architektur: `docs/specs/SYSTEM_STATE.md` und `docs/specs/EXECUTION_PLAN.md` sind die Source of Truth.
- Diese Datei enthaelt nur Gemini-spezifische Hinweise; keine projektische Fachtruth duplizieren.

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

## Full Stack (PowerShell) — alle Services opt-out via Skip-Flags
```powershell
.\scripts\dev-stack.ps1                          # alles startet (Go, Python, NATS, Observability, Next.js, GCT)
.\scripts\dev-stack.ps1 -SkipGCT -SkipNext      # typisch für Backend-Dev
# Flags: -SkipGo -SkipGCT -SkipPython -SkipNext -SkipNats -SkipObservability
```

## Practical Rules
- Start with `rg` scans for ownership and usage before editing.
- Use `bun why <pkg>` and `bun pm untrusted` for dependency incidents.
- Read the owning spec before editing; root docs and books are fallback context, not first-read truth.
- Validate map-related changes against `src/features/geopolitical/MapCanvas.tsx` stack assumptions.
- Keep instructions and docs aligned with actual code paths.
- After editing code, run `bun run lint` to verify no new Biome errors. Use `bun run lint:fix` for safe auto-fixes.
- For error handling in API routes: `catch (error: unknown)` + `getErrorMessage()` from `@/lib/utils`. Never use `catch (error: any)`.
- Do not re-add ESLint. Biome (`biome.json`) is the sole linter/formatter.
- When updating spec documents: update `Stand` date, add `Aenderungshistorie` entry, update cross-references in related docs.

## CLI Tooling Policy (Windows + Git Bash)
- Prefer `rg`/`fd` over `grep`/`find` for exploration and search.
- Use `jq`/`yq` for JSON/YAML processing in scripts and triage.
- Use `gh` for GitHub operations when available.
- Prefer `D:\DevCache` as install root and PATH target for user-managed CLIs. Current preferred PATH order: `D:\DevCache\cargo\.cargo\bin` then `D:\DevCache\bin`.
- Installer ownership:
  - System CLIs -> prefer portable/user-level placement under `D:\DevCache`; use `choco` only when no clean D-drive path exists or the tool is intentionally system-managed.
  - Rust CLIs -> `cargo` / `cargo-binstall`
  - Python CLIs -> `uv tool`
  - Node CLIs -> `pnpm -g`
- Current verified baseline:
  - `cargo-binstall`, `starship`, `atuin`, `coreutils.exe` -> `D:\DevCache\cargo\.cargo\bin`
  - `gh`, `direnv` -> `D:\DevCache\bin`
  - `winget`, `curl` may remain on system paths.
- Verify each tool after install (`command -v`, `<tool> --version`).
- `uutils-coreutils` is optional and does not replace `grep`/`sed`/`awk`.

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
- Provider or infra questions: cross-check the current contract/spec before assuming legacy frontend-provider ownership.

## Key Files For Context
- `docs/specs/EXECUTION_PLAN.md` — 22+1 phase roadmap with sub-phases, dependencies, and current progress marker.
- `docs/specs/SYSTEM_STATE.md` — IST/SOLL per architecture layer (17 sections). Ground truth for what exists.
- `docs/specs/DOCUMENTATION_ARCHITECTURE.md` — Doc layers, read order, ownership, split rules.
- `docs/specs/API_CONTRACTS.md` — umbrella API contract; use `docs/specs/api/` for boundary-specific details.
- `docs/specs/AUTH_SECURITY.md` — umbrella security spec; use `docs/specs/security/` for focused auth/policy/secrets/encryption docs.
- `docs/specs/geo/GEOMAP_OVERVIEW.md` — comprehensive spec for the map feature (35+ sections).
- `docs/specs/geo/GEOMAP_MODULE_CATALOG.md` — D3 module catalog, feature-to-module matrix, staged install plan.
- `docs/PROXY_CONVENTIONS.md` — Phase 0/1: Correlation-ID, thin proxy, provider-bypass rules.
- `docs/specs/geo/GEOMAP_VERIFY_GATES.md` — Phase 4: Draw-workflow, E2E acceptance, save error paths.
- `docs/BASEMAP_POLICY.md`, `docs/GEOCODING_STRATEGY.md`, `docs/PMTILES_CONTRACT.md`, `docs/PERFORMANCE_BASELINE.md` — Phase 4 GeoMap policy docs.

## Memory Management
- Run `/memory refresh` after editing `GEMINI.md` or `AGENTS.md` to reload context.

## Completion Checklist
1. Behavior verified for changed scope.
2. Dependencies and security impact checked when relevant.
3. Clear summary plus next action options.
4. If spec docs were touched: `Stand` date updated, `Aenderungshistorie` entry added.

<!-- gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **tradeview-fusion** (29980 symbols, 87674 relationships, 300 execution flows).

## MANDATORY: Use GitNexus before any architecture/refactor/impact task

**BEFORE exploring code manually, ALWAYS call `mcp__gitnexus__context` first.**

```
mcp__gitnexus__context  repo=tradeview-fusion
mcp__gitnexus__query    repo=tradeview-fusion  question="..."
mcp__gitnexus__impact   repo=tradeview-fusion  symbol="..."
```

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
