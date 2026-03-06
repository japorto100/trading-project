# Repository Layer

Placeholder for sqlc-generated repository code (Phase 20 / pre-Phase 11 eval).

- Generated from `internal/db/queries/*.sql` via `sqlc generate`
- Uses `github.com/jackc/pgx/v5/pgxpool` for connection pooling
- Pattern: thin repository structs injected into service layer

Not active during SQLite phases.
