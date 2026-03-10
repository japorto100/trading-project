# Reference Source Status

> **Stand:** 09. Maerz 2026  
> **Zweck:** Aktive Provider-/Quellen-Status-Matrix fuer implementierte,
> gescaffoldete und geplante Source-Gruppen.

---

## SDMX-Provider

| Provider | Status | Symbolformat | Exchange | Notes |
|:---------|:-------|:-------------|:---------|:-----|
| IMF IFS | Implementiert | `IMF_IFS_<FREQ>_<REF_AREA>_<INDICATOR>`, `POLICY_RATE` | `imf` | Phase 14a |
| ECB | Implementiert | ECB-spezifisch | `ecb` | ecbsdmx |
| OECD | Implementiert | `OECD_<LOCATION>_<SUBJECT>_<MEASURE>_<FREQUENCY>`, `GDP` | `oecd` | 14a.2 MEI |
| World Bank | Implementiert | `WB_WDI_<FREQ>_<SERIES>_<REF_AREA>`, `POPULATION` | `worldbank` | 14a.2 WDI |
| UN | Implementiert | `UN_<DATAFLOW>__<KEY>` | `un` | 14a.2; REST path `data/{dataflow}/{key}`, canonical symbol uppercased by gateway |
| ADB | Scaffold | `ADB_*` | `adb` | 14a.2 |

---

## TimeSeries / EM Central Banks

| Provider | Status | Exchange | Notes |
|:---------|:-------|:---------|:-----|
| BCB (Brazil) | Implementiert | `bcb` | Phase 14b |
| Banxico | Implementiert | `banxico` | Phase 14b |
| BoK (Korea) | Implementiert | `bok` | Phase 14b |
| BCRA (Argentina) | Implementiert | `bcra` | Phase 14b |
| TCMB (Turkey) | Implementiert | `tcmb` | Phase 14b |
| RBI (India) | Implementiert | `rbi` | Phase 14b |
| FRED | Implementiert | `fred` | Phase 14b.2; request-scoped API-Key-Transport im Gateway verifiziert |
| OFR | Implementiert | `OFR_<DATASET>-<SERIES_IDENTIFIER>` | `ofr` | 14b.2; official STFM `series/full` mnemonic query |
| NYFed | Implementiert | `NYFED_{SOFR|TGCR|BGCR|EFFR|OBFR}` | `nyfed` | 14b.2; official Markets API reference rates |

---

## BulkFetcher / DiffWatcher

| Source | Status | Notes |
|:-------|:-------|:-----|
| CFTC COT | Implementiert | 14c.1; official historical compressed zip path on CFTC bulk fetcher |
| FINRA ATS | Scaffold | 14c.2 |
| LBMA Gold Fix | Scaffold | 14c.3 |
| FXCM Sentiment | Scaffold | 14c.3 |
| OFAC SDN | Implementiert | 14d.1; offizieller XML-Diff-Watcher + GeoMap sanctions pack |
| UN Sanctions | Implementiert | 14d.2; offizieller UN consolidated XML watcher + GeoMap sanctions pack |
| SECO Sanctions | Implementiert | 14d.2; JSON watcher im GeoMap sanctions pack, derzeit ueber normalisierten OpenSanctions-Feed statt direkter offizieller XML-Line |
| EU Sanctions | Implementiert | 14d.2; JSON watcher im GeoMap sanctions pack, derzeit ueber normalisierten OpenSanctions-Feed |
| GeoMap Source Pack | Implementiert | 14g.1; sanctions watcher aggregation + candidate mapping + admin fetch path verifiziert |

---

## Credential-bearing Quellen

| Provider | Auth-Art | Env-Variable(n) | Pflicht-Check |
|:---------|:---------|:----------------|:--------------|
| Finnhub | API Key | `FINNHUB_API_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production`; request-scoped Override via Next Cookie/Header verifiziert |
| FRED | API Key | `FRED_API_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production`; request-scoped Override im Go-Connector verifiziert |
| ACLED | Token + Account-Daten | `ACLED_API_TOKEN`, `ACLED_EMAIL`, `ACLED_ACCESS_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production` |
| Banxico | API Token | `BANXICO_API_TOKEN` | `go-backend/.env.example`, `.env.development`, `.env.production`; request-scoped Override im Go-Connector verifiziert |
| BoK ECOS | API Key | `BOK_ECOS_API_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production`; request-scoped Override im Go-Connector verifiziert |

Neue auth-pflichtige Quellen muessen zusaetzlich in
`../specs/execution/source_onboarding_and_keys.md` nachgezogen werden.

---

## Aenderungshistorie

| Datum | Aenderung |
|:------|:----------|
| 28. Feb 2026 | Initial — Phase 14 Status-Matrix |
| 01. Mär 2026 | 14c.3 LBMA/FXCM, 14d.2 UN/SECO/EU, 14g.1 GeoMap Source Pack |
| 09. Mär 2026 | Finnhub/FRED/Banxico/BoK Credential-Transport (request-scoped) verifiziert |
| 10. Mär 2026 | OECD, World Bank, UN, NYFed und OFR Batch-2 Happy/Error-Pfade mit Gateway-Tests verifiziert |
| 10. Mär 2026 | OFAC, UN, SECO und EU Sanctions-Watcher inkl. GeoMap sanctions pack / admin fetch erneut verifiziert; SECO/EU aktuell ueber normalisierte OpenSanctions-Feeds |
| 10. Mär 2026 | CFTC COT Bulk-Fetcher auf offiziellen Historical-Compressed-ZIP-Pfad gehoben und mit ZIP-/Parser-Tests verifiziert |
