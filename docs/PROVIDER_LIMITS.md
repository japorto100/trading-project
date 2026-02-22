# Provider Limits & External Sources

> **Stand:** 19. Februar 2026
> **Source of truth:** `src/lib/providers/types.ts` → `PROVIDER_REGISTRY`
> Werte hier spiegeln die im Code konfigurierten Baseline-Limits. Bei Tier-Wechsel im Code aktualisieren.

## Market Data Providers

| Provider | Key | Rate Limit (Code) | Assets | Auth |
|----------|-----|-------------------|--------|------|
| Alpha Vantage | `ALPHA_VANTAGE_API_KEY` | 25 req/day | stock, fx, crypto, index | yes |
| Finnhub | `FINNHUB_API_KEY` | 60 req/min | stock, crypto, fx | yes |
| Twelve Data | `TWELVE_DATA_API_KEY` | 800 req/day | stock, etf, fx, crypto, index | yes |
| Yahoo Finance (unofficial) | -- | 100 req/min | stock, etf, fx, crypto, index, commodity | no |
| yfinance Bridge | `YFINANCE_BRIDGE_URL` | 60 req/min | stock, etf, fx, crypto, index, commodity | no |
| Financial Modeling Prep | `FMP_API_KEY` | 250 req/day | stock, etf, index | yes |
| EODHD | `EODHD_API_KEY` | 20 req/day | stock, etf, fx, index, commodity | yes |
| Marketstack | `MARKETSTACK_API_KEY` | 100 req/month | stock, etf, index | yes |
| Polygon.io | `POLYGON_API_KEY` | 5 req/min | stock, fx, crypto, index | yes |
| CoinMarketCap | `COINMARKETCAP_API_KEY` | 30 req/min | crypto | yes |
| CCXT (crypto fallback) | -- | 20 req/min | crypto | no |
| Finage | `FINAGE_API_KEY` | 60 req/min | stock, etf, fx, crypto, index | yes |
| FRED | `FRED_API_KEY` | ~unlimited | index (macro) | yes |
| ECB | -- | 100 req/day | fx | no |
| Demo Data | -- | unlimited | all | no |

## Where it is wired

- Registry metadata: `src/lib/providers/types.ts` → `PROVIDER_REGISTRY`
- Runtime rate/circuit guard: `src/lib/providers/index.ts` (circuit breaker + rate limiter)
- Env config: `.env.example`

## News Sources

Aggregated in `src/lib/news/aggregator.ts`, rendered in `src/features/trading/NewsPanel.tsx`.

| Source | Type | Wired in |
|--------|------|----------|
| NewsData.io | API (`NEWSDATA_API_KEY`) | `src/lib/news/sources.ts` |
| NewsAPI.ai / EventRegistry | API (`NEWSAPI_AI_KEY`) | `src/lib/news/sources.ts` |
| GNews | API (`GNEWS_API_KEY`) | `src/lib/news/sources.ts` |
| Webz.io News API Lite | API (`WEBZ_API_KEY`) | `src/lib/news/sources.ts` |
| Finviz | Scrape/RSS | `src/lib/news/sources.ts` |
| Yahoo Finance | Scrape/RSS | `src/lib/news/sources.ts` |
| MarketWatch | Scrape/RSS | `src/lib/news/sources.ts` |
| Barron's | Scrape/RSS | `src/lib/news/sources.ts` |
| WSJ | Scrape/RSS | `src/lib/news/sources.ts` |
| Bloomberg | Scrape/RSS | `src/lib/news/sources.ts` |
| Reddit r/StockMarket | Scrape | `src/lib/news/sources.ts` |
| Reddit r/investing | Scrape | `src/lib/news/sources.ts` |

## Tracked External References (nicht integriert)

- **Insightsentry** (`https://insightsentry.com`): research/comparison source, kein Adapter
- **LSE Retail Investor Data Waiver** (`https://www.londonstockexchange.com/equities-trading/market-data/retail-investor-market-data-end-user-fee-waiver`): Lizenz-Referenz fuer Redistribution
