# Reference Source Status

> Stand: 09. Maerz 2026  
> Zweck: Aktive Provider-/Quellen-Status-Matrix fuer implementierte, gescaffoldete
> und geplante Source-Gruppen.
> **Hinweis:** Das fruehere Root-Dokument `PROVIDER_LIMITS.md` ist nur noch
> Archivmaterial. Operative Quota-/Auth-/Limit-Hinweise werden hier in `Notes`
> oder im Code-/Registry-Owner gepflegt, nicht mehr in einer separaten Root-Datei.

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

## Aenderungshistorie

| Datum | Aenderung |
|:------|:----------|
| 28. Feb 2026 | Initial — Phase 14 Status-Matrix |
| 01. Mär 2026 | 14c.3 LBMA/FXCM, 14d.2 UN/SECO/EU, 14g.1 GeoMap Source Pack |
