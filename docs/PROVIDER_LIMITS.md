# Provider Limits (Configured Baseline)

These are the baseline limits used for local provider-guard logic in Fusion.
Treat them as operational defaults and re-validate against your current paid/free tier.

| Provider | Baseline Limit |
|---|---|
| Yahoo Finance (`yfinance`/unofficial) | no hard fixed limit (community/best-effort) |
| Finnhub | 60 requests / minute |
| Financial Modeling Prep (FMP) | 250 requests / day |
| Twelve Data | ~8 requests / minute (800/day) |
| Alpha Vantage | 25 requests / day |
| EODHD | 20 requests / day |
| Marketstack | 100 requests / month |
| Polygon.io | 5 requests / minute (free tier, US-focused) |
| CoinMarketCap | plan-dependent (API key required) |
| Finage | plan-dependent (API key required) |
| FRED | practically unrestricted for our app use |

## Where it is wired

- Registry metadata:
  - `src/lib/providers/types.ts`
- Runtime rate/circuit guard:
  - `src/lib/providers/index.ts`
- Env tuning:
  - `.env.example`
