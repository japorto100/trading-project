# Persistence Model (P2.1)

Auth is intentionally disabled. Persistence is prepared in two layers:

## 1) Runtime Storage Adapter

- `src/lib/storage/adapter.ts`
  - `createLocalJsonStorageAdapter(...)`
  - `createDbReadyJsonStorageAdapter(...)`
- `src/lib/storage/preferences.ts`
  - typed preferences for:
    - favorites
    - layout

Current behavior:
- local storage is active by default.
- db-ready adapter keeps the same caller contract and can be swapped to server-side persistence later.
- when backend is available, client preferences can be synced through API routes.

## 2) DB-Ready Data Model

Prisma schema:
- `prisma/schema.prisma`

Prepared entities:
- `UserProfile`
- `Watchlist`
- `WatchlistItem`
- `PriceAlertRecord`
- `LayoutPreference`

Notes:
- `profileKey` allows anonymous persistence without login.
- Relation/unique/index constraints are included for practical query paths.

## API Scaffold

- `GET /api/fusion/persistence/status`
- `GET /api/fusion/preferences?profileKey=...`
- `PUT /api/fusion/preferences`

Server helpers:
- `src/lib/server/prisma.ts`
- `src/lib/server/persistence-mappers.ts`

## Migration Path (when DB is enabled)

1. Set `DATABASE_URL`.
2. Run `pnpm db:generate`.
3. Run `pnpm db:push` (or migrations).
4. Replace `createDbReadyJsonStorageAdapter(...)` internals with API/DB calls.
5. Keep local adapter as fallback/offline mode.
