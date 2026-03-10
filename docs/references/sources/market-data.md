# Market Data Sources

> **Scope:** Commodities, Forex, Equities, Futures, Bonds, Symbol-Universum und
> allgemeine Marktquellen ausserhalb von SDMX/Zentralbanken.

---

## Bereits relevant oder wiederkehrend referenziert

| Quelle | Rolle |
|--------|-------|
| `Finnhub` | Equity-/FX-/Streaming-Referenz |
| `Polygon`, `Twelve Data`, `Alpha Vantage`, `EODHD`, `FMP`, `Marketstack` | TS-/Fallback- und Coverage-Referenzen |
| `Yahoo (unofficial)` | Inoffizieller, aber breiter Fallback fuer Futures/Indices |
| `Nasdaq Data Link` | Commodity-/historische Datensaetze |
| `World Bank Commodity Prices` | Commodity-Macro-Basis |
| `IMF Primary Commodity Prices` | SDMX-nahe Commodity-Basis |

---

## Expliziter Quellenkatalog

### Core Market Data / Multi-Asset

| Quelle | Rolle |
|--------|-------|
| `Finnhub` | Realtime Quotes, WebSocket, Equities, FX, basic fundamentals |
| `Polygon` | US equities/options snapshots, aggregates, market coverage |
| `Twelve Data` | Cross-asset OHLCV- und indicator-nahe Coverage |
| `Alpha Vantage` | Fallback fuer equities, FX, indicators und macro-nahe series |
| `EODHD` | End-of-day, fundamentals, internationale Marktbreite |
| `FMP` | Equity/fundamental/reference data |
| `Marketstack` | REST-Fallback fuer einfache equity time series |
| `Yahoo (unofficial)` | Breiter inoffizieller Fallback fuer indices, futures und misc symbols |

### Commodity / Futures / Benchmark Feeds

| Quelle | Rolle |
|--------|-------|
| `Nasdaq Data Link` | Historische Commodity-/dataset-Pakete |
| `World Bank Commodity Prices` | Pink-Sheet / Commodity-Macro-Basis |
| `IMF Primary Commodity Prices` | Commodity-Benchmarks im Macro-/SDMX-Nahbereich |
| `CFTC COT` | Positioning / futures commitment data |
| `LBMA Gold Fix` | Gold benchmark fixing |
| `FXCM Sentiment` | Retail-FX positioning / sentiment |

### Aktuelle Runtime-Notiz

- `CFTC COT` ist im aktuellen Go-Slice als Bulk-Fetcher ueber den offiziellen Historical-Compressed-ZIP-Pfad der CFTC verdrahtet.
- `LBMA Gold Fix` bleibt wegen Lizenz-/Portalgrenze weiterhin nur Katalog-/Scaffold-Kandidat.
- `FXCM Sentiment` bleibt mangels sauber belegter offener Maschinen-Schnittstelle weiterhin Scaffold.

### Options / Volatility / Dark Pool

| Quelle | Rolle |
|--------|-------|
| `Polygon Options` | Options chain, greeks, open interest, snapshots |
| `Tradier Options` | Options chains / greeks via retail-accessible API |
| `Unusual Whales` | Unusual options flow / blocks / sweeps |
| `FINRA ATS` | Dark-pool / ATS weekly volume |
| `CBOE VIX` | VIX / VVIX / volatility benchmarks |
| `FRED VIXCLS` | Historische VIX-Serie ueber FRED |

### Symbol-Universum / Mapping / Crypto-Market Breadth

| Quelle | Rolle |
|--------|-------|
| `SEC Company Facts / Filings` | Equity issuer / ticker / filing-reference basis |
| `CoinGecko` | Token / contract / exchange / market-cap mapping |
| `CoinMarketCap` | Sekundaerer Crypto universe / ranking reference |
| `CCXT-supported exchanges` | Exchange symbol mapping fuer crypto connectors |

---

## Themenblöcke aus dem alten Katalog

- Commodities
- Erweitertes Forex
- Erweiterte Aktien / europaeische Maerkte
- Futures-Spezifika (COT, Continuous Contracts, Term Structure)
- Bonds / Fixed Income
- Symbol-Universum / Kuerzel
- DEX vs CEX Daten-Integration
- Options + Dark Pool

---

## Arbeitsregel

- Diese Datei ist Quellenkatalog, **nicht** Statusmatrix.
- Implementierte und gescaffoldete Provider stehen in `../status.md`.
- Auth-pflichtige Marktquellen wie `Finnhub` muessen zusaetzlich in
  `../../specs/execution/source_onboarding_and_keys.md` und den betroffenen
  `*.env`-Vorlagen auftauchen.
- Fuer `Finnhub` ist der aktuelle Delivery-Pfad jetzt explizit:
  - Root-/UI-Speicherung fuer den User
  - serverlesbarer Next-Cookie
  - request-scoped Header zum Go Gateway
  - kein stiller Frontend-Fallback bei fehlendem Upstream-Key
- Architektur- und BaseConnector-Regeln bleiben in
  `../../go-research-financial-data-aggregation-2025-2026.md`.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../UNIFIED_INGESTION_LAYER.md`
