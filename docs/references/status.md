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
| UN | Scaffold | `UN_*` | `un` | 14a.2 |
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
| FRED | Implementiert | `fred` | Phase 14b.2 |
| OFR | Scaffold | `OFR_*` | `ofr` | 14b.2 |
| NYFed | Scaffold | `NYFED_*` | `nyfed` | 14b.2 |

---

## BulkFetcher / DiffWatcher

| Source | Status | Notes |
|:-------|:-------|:-----|
| CFTC COT | Scaffold | 14c.1 |
| FINRA ATS | Scaffold | 14c.2 |
| LBMA Gold Fix | Scaffold | 14c.3 |
| FXCM Sentiment | Scaffold | 14c.3 |
| OFAC SDN | Scaffold | 14d.1 |
| UN Sanctions | Scaffold | 14d.2 |
| SECO Sanctions | Scaffold | 14d.2 |
| EU Sanctions | Scaffold | 14d.2 |
| GeoMap Source Pack | Scaffold | 14g.1 |

---

## Credential-bearing Quellen

| Provider | Auth-Art | Env-Variable(n) | Pflicht-Check |
|:---------|:---------|:----------------|:--------------|
| Finnhub | API Key | `FINNHUB_API_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production` |
| FRED | API Key | `FRED_API_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production` |
| ACLED | Token + Account-Daten | `ACLED_API_TOKEN`, `ACLED_EMAIL`, `ACLED_ACCESS_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production` |
| Banxico | API Token | `BANXICO_API_TOKEN` | `go-backend/.env.example`, `.env.development`, `.env.production` |
| BoK ECOS | API Key | `BOK_ECOS_API_KEY` | `go-backend/.env.example`, `.env.development`, `.env.production` |

Neue auth-pflichtige Quellen muessen zusaetzlich in
`../specs/execution/source_onboarding_and_keys.md` nachgezogen werden.

---

## Aenderungshistorie

| Datum | Aenderung |
|:------|:----------|
| 28. Feb 2026 | Initial — Phase 14 Status-Matrix |
| 01. Mär 2026 | 14c.3 LBMA/FXCM, 14d.2 UN/SECO/EU, 14g.1 GeoMap Source Pack |
