# Fusion Setup Runbook

This runbook is the clean start path for local development with pnpm.

## 1) Install and env

```bash
cd tradeview-fusion
pnpm install
```

Create local env file:

```bash
# PowerShell
Copy-Item .env.example .env
```

Fill only the keys you have (market/news providers). Empty keys are fine for fallback mode.

## 2) Database (Prisma)

If you want DB-backed persistence, set `DATABASE_URL` in `.env`, then:

```bash
pnpm db:generate
pnpm db:push
```

Optional for schema-change workflow:

```bash
pnpm db:migrate
```

## 3) Run app

```bash
pnpm dev
```

App runs on `http://localhost:3000`.

## 4) Quality gates

Run when you want to validate branch quality:

```bash
pnpm lint
pnpm build
```

## 5) Troubleshooting

### Prisma generate fails with missing package (example: `effect`)

```bash
pnpm install
pnpm add -D effect
pnpm db:generate
```

If issue persists, clear lock/install state and retry:

```bash
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm db:generate
```

### DB push fails

- Verify `DATABASE_URL` is reachable from your machine.
- Check if DB user has create/alter rights.
- Re-run:

```bash
pnpm db:push
```

## 6) Optional services

- python services monorepo: `python-backend/README.md`
- yfinance bridge: see `python-backend/services/finance-bridge/README.md`
- geopolitical soft-signals: `python-backend/services/geopolitical-soft-signals/README.md`
- full local autostart (Next.js + both Python services): `bun run dev:with-python`
- soft-signal candidate smoke test: `bun run smoke:soft-signals`
- provider order and safety knobs: see `.env.example` + `docs/PROVIDER_LIMITS.md`
- persistence/API status: `GET /api/fusion/persistence/status`

## 7) Practical next steps

1. Add at least one strong market provider key (Twelve Data or Finnhub) for stable realtime usage.
2. Enable one news provider key (`NEWSDATA_API_KEY` or `GNEWS_API_KEY`) to reduce fallback-only behavior.
3. Keep DB enabled if you want server-side order history across sessions.


