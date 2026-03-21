---
name: golang-expert
description: Expert guidance for modern Go development, including concurrency, performance tuning, testing, architecture, and production quality gates. Use when building, reviewing, debugging, or optimizing Go services and tooling.
---

# Golang Expert

Provide practical, production-oriented guidance for modern Go with emphasis on correctness, maintainability, operational clarity, and repeatable quality gates.

## First Rule

If the repository has its own Go guidance, read that first and let it override this skill:

- `AGENTS.md`
- language-specific rules files
- local `DEVELOPMENT.md`
- architecture and error specs

This skill is the default fallback, not the project owner.

## When To Use

- Designing or extending Go services, CLIs, gateways, workers, or libraries
- Refactoring legacy Go code toward clearer package and boundary structure
- Debugging concurrency, race, timeout, and deadlock issues
- Improving test strategy, reliability, and CI quality gates
- Hardening observability, error handling, and external system boundaries
- Preparing a Go codebase for PostgreSQL, typed query layers, and safer migrations

## Core Principles

1. Prefer clarity over cleverness. Keep APIs small and explicit.
2. Pass `context.Context` through request-scoped call chains.
3. Return wrapped errors with actionable context.
4. Use goroutines only with clear ownership, shutdown, and cancellation semantics.
5. Benchmark before optimizing; profile before rewriting.
6. Treat tests as contract protection for production behavior, not as decoration.

## Repository-Aware Defaults

- Package layout: `cmd/`, `internal/`, optional `pkg/`
- Keep interfaces near consumers, not producers
- Minimize global state; inject dependencies explicitly
- Prefer standard library HTTP unless the repository has a deliberate alternative
- Prefer `log/slog` for structured logging
- Prefer explicit SQL and typed DB access over opaque ORM magic for core backend paths

## Error And Boundary Rules

- Never leak raw external or interface errors across transport, connector, messaging, or storage boundaries
- Use `%w` so `errors.Is` / `errors.As` keep working
- Good default:

```go
return fmt.Errorf("load user profile: %w", err)
```

- Distinguish:
  - domain errors
  - permission/policy errors
  - upstream/provider failures
  - infrastructure/runtime failures

## Concurrency Guidance

- Use `errgroup` for request-scoped fan-out/fan-in
- Prefer channels for coordination and mutexes for shared mutable state
- Always define shutdown and cancellation paths
- Use `testing/synctest` for deterministic concurrency tests when timing would otherwise require sleeps
- Run race detection for concurrent or stateful code paths
- Watch for context growth in loops; `fatcontext`-style issues are real

## Testing And Quality

- Table-driven tests with subtests (`t.Run`)
- Deterministic tests: avoid sleep-based timing assertions
- Mock only process boundaries; prefer real collaborators internally
- Add persistence and transport tests at real boundaries
- If a test and the production contract disagree, validate the contract first
- Stale tests may be updated when the production semantics are already consistent and documented

## Recommended Quality Gate Order

For meaningful Go changes:

1. `golangci-lint run ./...`
2. `go build ./...`
3. `go test ./...`
4. `go test -race ./...`
5. `govulncheck ./...`

For large repos, it is acceptable and often preferable to run tests and race tests in grouped package families instead of a single monolithic `./...` invocation.

## High-Signal Linters To Respect

- `wrapcheck`
- `errorlint`
- `fatcontext`
- `gosec`
- `spancheck`
- `loggercheck`
- `sqlclosecheck`
- `modernize`
- `govet` analyzers such as `shadow`, `waitgroup`, `hostport`

## Modern Go Features Worth Using

- `errors.Join`
- `errors.AsType`
- `slices` / `maps`
- `min` / `max`
- `strings.CutPrefix` / `strings.CutSuffix`
- `testing/synctest`
- fuzzing via `go test -fuzz`
- toolchain pinning for rapid CVE response

## Database Direction

- SQLite is acceptable for local/dev and low-concurrency bridges
- PostgreSQL is the typical production target
- For typed backend data access, prefer explicit SQL plus `sqlc` or equivalent over hidden ORM behavior
- Keep migration strategy explicit and reviewable

## Observability Defaults

- Structured logs with stable keys
- Correlation and trace propagation on request boundaries
- Metrics and traces on critical external calls
- Record and wrap upstream failures with enough context for logs and traces to be useful

## Common Commands

- `go mod tidy`
- `golangci-lint run ./...`
- `go build ./...`
- `go test ./...`
- `go test -race ./...`
- `govulncheck ./...`
- `go test -bench . -benchmem ./...`
- `go test -fuzz=Fuzz -fuzztime=30s ./...`
- `go tool pprof`
