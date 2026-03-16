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

## Tiering-Schnitt (SS2)

### Global baseline

| Quelle | Warum Baseline |
|--------|----------------|
| `Finnhub` | breiter Multi-Asset-Default fuer produktnahe Quotes/FX/Realtime |
| `World Bank Commodity Prices` | stabile Commodity-Macro-Basis |
| `IMF Primary Commodity Prices` | standardisierte Commodity-Benchmarks |
| `CoinGecko` | breite Crypto-Universe- und Mapping-Basis |

### Tier-1 official / specialist

| Quelle | Warum Tier-1 |
|--------|--------------|
| `CFTC COT` | offizieller Positioning-/Futures-Layer mit hohem Signalwert |
| `Nasdaq Data Link` | tieferer historischer Dataset-Mehrwert fuer Commodities und Spezialreihen |
| `SEC Company Facts / Filings` | offizieller Issuer-/Filing-Layer fuer Equity-Referenzdaten |
| `Polygon Options`, `Tradier Options`, `CBOE VIX` | nur fuer Options-/Volatility-Slices mit echtem Produktbedarf |

### Tier-1-Mehrwert gegenueber der Baseline

| Quelle | Baseline-Vergleich | Konkreter Mehrwert |
|--------|--------------------|--------------------|
| `CFTC COT` | `Finnhub` / `Nasdaq Data Link` / generische Market APIs | offizieller Positioning-Datensatz, den breite Quote-/OHLCV-Provider nicht liefern; hoher Leverage-/Regime-Signalwert |
| `Nasdaq Data Link` | `World Bank Commodity Prices` / `IMF Primary Commodity Prices` | tiefere historische Spezialreihen und Dataset-Breite fuer Commodity-/Research-Slices |
| `SEC Company Facts / Filings` | `Finnhub` / `FMP` / `EODHD` | offizieller Issuer-/Filing-Truth-Layer mit besserer Provenance und Contract-Klarheit fuer Fundamentals/Referenzdaten |
| `Polygon Options`, `Tradier Options`, `CBOE VIX` | `Finnhub` / `CoinGecko` / breite Market-Baselines | nur bei Options-/Volatility-Produkten noetig, weil Chain-, Greeks-, Volatility- und VIX-Spezialdaten in den Baselines fehlen |

### Long-tail deferred

| Quelle | Warum deferred |
|--------|----------------|
| `Polygon`, `Twelve Data`, `Alpha Vantage`, `EODHD`, `FMP`, `Marketstack` | nuetzliche Coverage-Provider, aber nicht alle gleichzeitig als aktive Kernquellen noetig |
| `Yahoo (unofficial)` | nur inoffizieller Fallback mit klarer Provenance-Einschraenkung |
| `LBMA Gold Fix`, `FXCM Sentiment`, `CoinMarketCap`, `CCXT-supported exchanges` | Spezial- oder Scaffold-Faelle ohne aktuellen Kernhebel |
| `Unusual Whales`, `FINRA ATS` | produktrelevant nur bei explizitem Options-/Dark-Pool-Slice |

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
| `YFinance bridge` | Praktischer Wrapper-/Bridge-Pfad fuer Yahoo chart/history endpoints |

### Commodity / Futures / Benchmark Feeds

| Quelle | Rolle |
|--------|-------|
| `Nasdaq Data Link` | Historische Commodity-/dataset-Pakete |
| `World Bank Commodity Prices` | Pink-Sheet / Commodity-Macro-Basis |
| `IMF Primary Commodity Prices` | Commodity-Benchmarks im Macro-/SDMX-Nahbereich |
| `CFTC COT` | Positioning / futures commitment data |
| `LBMA Gold Fix` | Gold benchmark fixing |
| `FXCM Sentiment` | Retail-FX positioning / sentiment |

### News / Headline Feeds

| Quelle | Rolle |
|--------|-------|
| `RSS feed basket` | einfacher Multi-Feed-Headline-Layer fuer Markt-/Macro-News |
| `Finviz RSS` | symbolnahe Equity-News-Headlines |
| `GDELT News` | globale News-/Media-Breite fuer Finance-/Markets-Queries |
| `MarketWatch Top Stories` | aktueller Default im RSS-Basket |

### Aktuelle Runtime-Notiz

- `CFTC COT` ist im aktuellen Go-Slice als Bulk-Fetcher ueber den offiziellen Historical-Compressed-ZIP-Pfad der CFTC verdrahtet.
- `LBMA Gold Fix` bleibt wegen Lizenz-/Portalgrenze weiterhin nur Katalog-/Scaffold-Kandidat.
- `FXCM Sentiment` bleibt mangels sauber belegter offener Maschinen-Schnittstelle weiterhin Scaffold.
- Der News-/Headline-Block ist im Go-Gateway aktiv:
  - generischer RSS-Basket ueber `NEWS_RSS_FEEDS`
  - symbolbezogener `Finviz RSS`-Connector
  - separater `GDELT News`-Connector fuer JSON-Headline-Fetches
  - `GDELT News` besitzt jetzt den ersten News-`api-snapshot`-Pfad mit
    Raw-JSON, normalized snapshot plus `source_snapshot_metadata`;
    Live-Object-Storage-Verify bleibt deferred
- `MarketWatch Top Stories` bleibt aktuell der explizite Default-Feed im RSS-Basket; weitere Feeds sollten nur mit klarer Provenance- und Dedup-Regel aufgenommen werden.
- Fuer den Yahoo-Fallback gilt als Referenzpfad der in Crucix genutzte Chart-Endpoint:
  `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}` (weiterhin `unofficial`, nur mit Guardrails/Fallback-Rolle).

### Options / Volatility / Dark Pool

| Quelle | Rolle |
|--------|-------|
| `Polygon Options` | Options chain, greeks, open interest, snapshots |
| `Tradier Options` | Options chains / greeks via retail-accessible API |
| `Unusual Whales` | Unusual options flow / blocks / sweeps |
| `FINRA ATS` | Dark-pool / ATS weekly volume |
| `CBOE VIX` | VIX / VVIX / volatility benchmarks |
| `FRED VIXCLS` | Historische VIX-Serie ueber FRED |

### FINRA ATS Runtime-Notiz

- `FINRA ATS` bleibt aktuell bewusst `Scaffold`.
- Der offizielle FINRA-Contract ist nicht der einfache GET-Stub aus dem alten Go-Code, sondern die OTC-Transparency-API/File-Download-Spezifikation mit `POST https://api.finra.org/data/group/otcMarket/name/weeklySummary` plus Filter-Payload bzw. ATS file-download flow.
- Fuer Equity-/OTCMarket-Datasets verlangt FINRA ausserdem einen Auth-/Bearer-Flow; `FINRA ATS` ist also nicht nur URL-, sondern auch Credential-Onboarding.
- Der Go-Scaffold spricht jetzt bereits OAuth/Bearer + JSON-POST fuer `weeklySummary`; offen bleiben produktive Filter-/Dataset-Haertung und ggf. der file-download-Zweig.

### Symbol-Universum / Mapping / Crypto-Market Breadth

| Quelle | Rolle |
|--------|-------|
| `SEC Company Facts / Filings` | Equity issuer / ticker / filing-reference basis |
| `GLEIF LEI API` | globaler Legal-Entity-Identifier-Layer (LEI), entity resolution / dedup / cross-jurisdiction matching |
| `OpenOwnership Register` | Beneficial-Ownership-Enrichment fuer UBO-/Control-Analysen |
| `UK Companies House API` | offizieller frei zugaenglicher Registry-Referenzlayer (jurisdiktional fokussiert, hohe Datenqualitaet) |
| `CoinGecko` | Token / contract / exchange / market-cap mapping |
| `CoinMarketCap` | Sekundaerer Crypto universe / ranking reference |
| `CCXT-supported exchanges` | Exchange symbol mapping fuer crypto connectors |

### Corporate Registry / Legal Entity Intelligence (Free-Stack Erweiterung)

| Quelle | Rolle |
|--------|-------|
| `GLEIF LEI API` | globaler Basislayer fuer juristische Entitaeten mit stabilen IDs und Rechtsform-/Beziehungsdaten |
| `OpenOwnership Register` | globaler (teils lueckiger) Ownership-/Control-Layer als Open-Data-Ergaenzung |
| `UK Companies House API` | hochqualitative freie Registry-API als erster Country-Registry-Baustein |
| `Country registries (phased)` | laenderweise offizielle Register als stufenweiser Ausbau statt One-Provider-Abhaengigkeit |

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
- Source-Onboarding startet hier nicht direkt aus Kataloginteresse, sondern erst nach Tiering in `../../specs/execution/source_selection_delta.md`.
- Default-Regel:
  - globale oder breit nutzbare Market-Baselines zuerst
  - spezialisierte offizielle oder provider-spezifische Quellen nur bei echtem Coverage-, Aktualitaets- oder Produkt-Mehrwert
- Nicht mehrere aehnliche REST-Market-Provider parallel aktivieren, solange kein klarer Coverage- oder Ausfallsicherheitsgrund besteht.
- `Finnhub` bleibt fuer produktnahe Quotes/Streams aktiv, aber Quotes laufen
  jetzt ueber einen kurzen Gateway-TTL-Cache (`FINNHUB_CACHE_TTL_MS`), waehrend
  Streaming bewusst uncached bleibt.
- Implementierte und gescaffoldete Provider stehen in `../status.md`.
- Auth-pflichtige Marktquellen wie `Finnhub` muessen zusaetzlich in
  `../../specs/execution/source_onboarding_and_keys.md` und den betroffenen
  `*.env`-Vorlagen auftauchen.
- Persistenzstandard fuer diese Gruppe:
  - `Finnhub` und breite Quote-Provider primaer `api-hot`
  - News-/Headline-Feeds eher `api-snapshot`; `GDELT News` ist dafuer bereits
    auf einem ersten Raw- plus normalized-snapshot-Pfad
  - `CFTC COT` klar `file-snapshot`
  - `FINRA ATS` klar `api-snapshot`
  - vectorization nur aus normalisierten News-/Dossier-Texten, nicht aus rohen
    API-Dumps oder Bulk-Dateien
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
- `../../specs/execution/source_selection_delta.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../specs/execution/source_persistence_snapshot_delta.md`
- `../../specs/execution/vector_ingestion_delta.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../UNIFIED_INGESTION_LAYER.md`
