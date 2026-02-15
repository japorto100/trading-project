# Tradeview Fusion

Latest execution updates (2026-02-13):
- P0.2 DoD verification helper added (`Self-check` in Alerts panel).
- P1.2 `Line` now uses Daily SMA50 source (`1D` feed with fallback).
- Provider benchmark table added (environment run, keys currently missing).
- Added indicators and rendering:
  - VWAP overlay in chart
  - ATR metric strip + Signal bar value
- Backend persistence scaffold added:
  - `GET /api/fusion/persistence/status`
  - `GET/PUT /api/fusion/preferences`
  - Prisma server helper + mapper utilities

Current baseline:
- Core architecture from `tradeview-glm5-pro.tar` (Next.js + API/provider layer + lightweight-charts).
- Symbol universe and symbol-alias behavior merged from `tradeview-kimik2.5/app` into `src/lib/fusion-symbols.ts`.

Already merged:
- Fixed `lucide-react` fullscreen import issue in `src/app/page.tsx`.
- Replaced side-effect misuse of `useState` with `useEffect` in `src/app/page.tsx`.
- Removed hard dependency on remote Google fonts in `src/app/layout.tsx`.
- Unified and expanded symbols/search/watchlist categories using combined catalog from both projects.
- Added reusable Fusion UI components from Kimi-style UX:
  - `src/components/fusion/SymbolSearch.tsx`
  - `src/components/fusion/WatchlistPanel.tsx`
- Wired Fusion watchlist panel to GLM provider API via `GET /api/market/quote?symbols=...` for live quote refresh.
- Removed dedicated `/kimi` route and moved to one main entry (`/`) only.
- Replaced dual workspace architecture with one single fusion mode in `src/app/page.tsx`.
- Brought Kimi sidebar panel concept into fusion:
  - left panel switch: `Watchlist`, `Indicators`, `News`, `Orders`
  - retained Fusion watchlist tabs: `All`, `Fav`, `Crypto`, `Stocks`, `FX`
  - added inline indicator controls for SMA/EMA/RSI/MACD/Bollinger
- Removed obsolete Kimi standalone layer:
  - `src/App.tsx`
  - `src/app/kimi-mode.css`
  - `src/store/TradingContext.tsx`
  - `src/types/index.ts`
  - `src/lib/mockDataProvider.ts`
  - `src/lib/kimi-indicators.ts`
  - `src/components/ui-custom/*`
  - `src/components/chart/*`
- Fixed runtime compatibility issues after merge:
  - `lightweight-charts` series API compatibility in `src/components/TradingChart.tsx`
  - nested button hydration issue in `src/components/fusion/WatchlistPanel.tsx`
- Verified `npm run lint` (no errors) and `npm run build` (success).

Next high-value merge steps:
1. Split `src/app/page.tsx` into feature modules (header/sidebar/chart panels) to reduce regression risk.
2. Normalize symbol formats (`BTC-USD` and `BTC/USD`) end-to-end in provider fetch/search.
3. Add one integration test flow for symbol search -> chart reload -> watchlist favorite persistence.
4. Replace demo candles with provider-backed OHLCV for parity with quote refresh.

Provider benchmark (run date: 2026-02-13, environment-based)

Method:
- 10 representative symbols (stocks/crypto/fx) per provider.
- One OHLCV request per symbol.
- Metrics: success rate, median latency, p95 latency, granularity consistency.
- In this environment, provider API keys were not set.

| Provider | API key set | Success (10) | Success rate | Median latency | P95 latency | Granularity consistency | Cost/limit fit |
|---|---:|---:|---:|---:|---:|---:|---|
| Twelve Data | No | 0 | 0% | 99ms | 324ms | 0% | Blocked until key configured |
| Alpha Vantage | No | 0 | 0% | 107ms | 367ms | 0% | Blocked until key configured |
| Finnhub | No | 0 | 0% | 210ms | 578ms | 0% | Blocked until key configured |

Follow-up to complete benchmark acceptance:
- Set `TWELVE_DATA_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `FINNHUB_API_KEY`.
- Re-run same benchmark and replace blocked rows with real success/latency/consistency values.
