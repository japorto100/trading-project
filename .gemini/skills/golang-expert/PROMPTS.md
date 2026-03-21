# SOTA 2026 Golang Prompts

## Quality Gates
- "Run a full Go gateway quality pass: golangci-lint, build, tests, race, and govulncheck. Group large test scopes pragmatically if needed."
- "Sweep this package for wrapcheck and errorlint issues without changing behavior."
- "Review this Go service for stale tests versus current production contract before editing implementation."
- "Upgrade the Go toolchain to the nearest safe patch version and re-run govulncheck."

## Architecture & Boundaries
- "Review this Go gateway change for boundary discipline: transport, service, connector, messaging, and storage responsibilities."
- "Design a Go HTTP or gRPC boundary that preserves request context, trace propagation, and wrapped error paths."
- "Refactor this handler-service-storage chain so transport and domain concerns are cleaner without changing behavior."

## Concurrency & Testing
- "Replace sleep-based concurrency tests with testing/synctest."
- "Add race-safe grouped test commands for a large Go repository instead of a single monolithic ./... run."
- "Add a fuzz target for this parser or identifier builder and define a useful seed corpus."
- "Review this worker or stream client for goroutine leaks, missing cancellation, or context growth in loops."

## Database & Persistence
- "Refactor this repository or storage path to preserve typed errors, wrapped SQL failures, and explicit boundary semantics."
- "Sketch a pgx/sqlc migration path for this Go storage layer without introducing ORM-style drift."
- "Review this SQLite path for low-concurrency safety and PostgreSQL migration readiness."

## Observability
- "Instrument this Go boundary with slog and OpenTelemetry while preserving wrapped error chains."
- "Audit this package for spancheck/loggercheck-style issues and fix them with minimal behavioral change."

## Modernization
- "Apply safe modernize-style improvements to this package without changing external behavior."
- "Replace legacy string and slice helpers with current Go 1.26 standard library features where it improves clarity."
