# Backend Setup (Fusion Persistence)

This project now includes a persistence backend scaffold:

- `GET /api/fusion/persistence/status`
- `GET /api/fusion/preferences?profileKey=...`
- `PUT /api/fusion/preferences`

## Required Environment

- `DATABASE_URL` (PostgreSQL)

## Initialize DB

1. `pnpm db:generate`
2. `pnpm db:push`

## Notes

- Without `DATABASE_URL`, the app continues in local-only mode.
- Frontend preferences (favorites/layout) are synced to backend when available.
- Profile isolation is currently anonymous via local `profileKey` (no auth lock-in yet).
