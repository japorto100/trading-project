# External Data Source Notes

This file tracks requested external providers, legal references, and integration state.

## Requested additions

- Insightsentry:
  - `https://insightsentry.com`
  - Status: tracked as external research/comparison source (no direct provider adapter wired yet)
- London Stock Exchange retail investor data waiver:
  - `https://www.londonstockexchange.com/equities-trading/market-data/retail-investor-market-data-end-user-fee-waiver`
  - Status: legal/licensing reference for redistribution planning
- Finage:
  - `https://finage.co.uk/product/stocks`
  - Status: provider adapter added (`src/lib/providers/finage.ts`)
- CoinMarketCap API:
  - `https://coinmarketcap.com/api/documentation/v1/`
  - Status: provider adapter added (`src/lib/providers/coinmarketcap.ts`)

## News sources integrated

- Finviz
- Yahoo Finance
- MarketWatch
- Barron's
- WSJ
- Bloomberg
- Reddit `r/StockMarket`
- Reddit `r/investing`
- NewsData.io (API)
- NewsAPI.ai / EventRegistry (API)
- GNews API
- Webz.io News API Lite

Wired in:

- `src/lib/news/sources.ts`
- `src/lib/news/aggregator.ts` (multi-source API aggregation + cache)
- `src/app/api/market/news/route.ts`
- `src/features/trading/NewsPanel.tsx` (headlines + modal reader)
