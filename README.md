# TradeView Fusion

Multi-provider trading dashboard built with Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, and shadcn/ui.

## Quick Start

```bash
pnpm install
Copy-Item .env.example .env   # PowerShell
pnpm dev
```

App runs on `http://localhost:3000`. Empty API keys are fine -- the app falls back to demo data.

## Environment

Fill `.env` with the provider keys you have. All are optional:

- **Market data:** `TWELVE_DATA_API_KEY`, `FINNHUB_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `FMP_API_KEY`, `EODHD_API_KEY`, `POLYGON_API_KEY`, `COINMARKETCAP_API_KEY`, `FINAGE_API_KEY`, `FRED_API_KEY`
- **News:** `NEWSDATA_API_KEY`, `GNEWS_API_KEY`, `NEWSAPI_AI_KEY`, `WEBZ_API_KEY`
- **Optional services:** `YFINANCE_BRIDGE_URL`, `SOFT_SIGNAL_SERVICE_URL`, `INDICATOR_SERVICE_URL`

For best experience, add at least one strong market provider (Twelve Data or Finnhub) and one news provider (NewsData or GNews).

Rate limits per provider: see [`docs/PROVIDER_LIMITS.md`](./docs/PROVIDER_LIMITS.md).

## Database (SQLite / Prisma)

The project uses SQLite via Prisma. No external database server needed.

```bash
pnpm db:generate
pnpm db:push
```

Default `DATABASE_URL` is `file:./dev.db` (set in `.env`). Without it, the app runs in local-storage-only mode.

To revert to PostgreSQL: change `provider` in `prisma/schema.prisma`, re-enable commented enum blocks, set a PostgreSQL connection URL, then re-run `db:push` and `db:generate`.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js dev server (port 3000) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Biome linter check |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format with Biome |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:reset` | Reset database |
| `pnpm dev:with-python` | Next.js + Python services (finance-bridge + soft-signals) |
| `pnpm dev:full` | Full dev stack |
| `pnpm dev:full:gct` | Full dev stack + GoCryptoTrader |
| `pnpm smoke:soft-signals` | Smoke test: geopolitical soft-signal candidates |
| `pnpm smoke:indicator-service` | Smoke test: Python indicator service |

## Project Structure

```
tradeview-fusion/
├── src/
│   ├── app/                  # Next.js App Router (pages + API routes)
│   ├── components/           # Shared React components (AlertPanel, IndicatorPanel, ...)
│   ├── features/
│   │   ├── trading/          # Chart, SignalInsightsBar, NewsPanel, OrderPanel, ...
│   │   └── geopolitical/     # GeoMap, conflict timeline, soft-signal candidates
│   ├── lib/
│   │   ├── providers/        # Market data provider adapters (14 providers)
│   │   ├── indicators/       # TS indicators (SMA, EMA, RSI, MACD, Bollinger, ... 23 functions)
│   │   ├── alerts/           # Alert engine + verification
│   │   ├── news/             # News aggregator (12+ sources)
│   │   ├── orders/           # Paper trading + portfolio
│   │   ├── storage/          # Local + DB-ready storage adapters
│   │   ├── server/           # Prisma client + persistence mappers
│   │   ├── strategy/         # Strategy presets
│   │   └── geopolitical/     # Geo event scoring + game theory
│   ├── state/                # Zustand stores
│   ├── hooks/                # Custom React hooks
│   └── types/                # Shared TypeScript types
├── python-backend/
│   └── services/
│       ├── finance-bridge/           # yfinance REST bridge
│       ├── indicator-service/        # FastAPI: composite signals, patterns, exotic MAs
│       └── geopolitical-soft-signals/ # FinBERT + game theory soft-signal scoring
├── go-backend/               # GoCryptoTrader integration (WebSocket, backtesting)
├── prisma/                   # Schema (SQLite) + migrations
├── docs/                     # Architecture docs, indicator blueprint, geo masterplan
├── scripts/                  # Dev stack launchers
└── tools/                    # Build utilities
```

## Key Features

- **14 market data providers** with automatic failover, rate limiting, and circuit breaker
- **23 TypeScript indicators** (SMA, EMA, RSI, MACD, Bollinger, Ichimoku, Parabolic SAR, VWAP, ...)
- **Python indicator service** for advanced patterns (harmonic, Elliott Wave, composite signals)
- **12+ news sources** with multi-source aggregation and caching
- **Geopolitical map** with conflict scoring, soft-signal candidates, and game theory analysis
- **Paper trading** with order management and portfolio tracking
- **Alert engine** with price threshold + cross detection + self-check verification
- **Signal system** (Line / Power / Rhythm) with composite scoring

## Documentation

| Document | Content |
|----------|---------|
| [`docs/INDICATOR_ARCHITECTURE.md`](./docs/INDICATOR_ARCHITECTURE.md) | Indicator blueprint, ~57 implementation todos, book references |
| [`docs/GEOPOLITICAL_MAP_MASTERPLAN.md`](./docs/GEOPOLITICAL_MAP_MASTERPLAN.md) | Geo map architecture, event model, soft-signal pipeline |
| [`docs/RUST_LANGUAGE_IMPLEMENTATION.md`](./docs/RUST_LANGUAGE_IMPLEMENTATION.md) | Rust/PyO3 acceleration layer strategy |
| [`docs/ADR-001-streaming-architecture.md`](./docs/ADR-001-streaming-architecture.md) | Streaming architecture + consolidated open items |
| [`docs/PROVIDER_LIMITS.md`](./docs/PROVIDER_LIMITS.md) | Provider rate limits, news sources, external references |
| [`docs/Advanced-architecture-for-the-future.md`](./docs/Advanced-architecture-for-the-future.md) | Long-term architecture vision |
| [`docs/Portfolio-architecture.md`](./docs/Portfolio-architecture.md) | Portfolio analytics deep dive |

## Troubleshooting

**Prisma generate fails:**
```bash
pnpm install && pnpm db:generate
```

If it persists, clear and retry:
```bash
Remove-Item -Recurse -Force node_modules
pnpm install && pnpm db:generate
```

**DB push fails:** Verify `DATABASE_URL` in `.env` is set (default: `file:./dev.db`).
