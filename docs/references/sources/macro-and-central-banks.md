# Macro and Central Banks Sources

> **Scope:** SDMX, Zentralbanken, globale Macro-Erweiterungen und verwandte
> Zeitreihen-/Statistikquellen.

---

## Hauptgruppen

| Gruppe | Beispiele |
|--------|-----------|
| `G3 SDMX` | IMF IFS/WEO, OECD, ECB, UN, ADB |
| `G4 Zeitreihen / Zentralbanken` | FRED, BCB, Banxico, BoK, BCRA, TCMB, RBI |
| Globale Erweiterung | Tushare, e-Stat, IBGE, INEGI, NBS |

---

## Bereits wichtige Quellen

| Quelle | Rolle |
|--------|-------|
| `IMF IFS` | Globaler Macro-Hebel |
| `World Bank WDI` | Entwicklungs- und Realwirtschaftsdaten |
| `OECD Data Explorer` | Ländervergleich, CLI, standardisierte Indikatoren |
| `BCB`, `Banxico`, `BoK`, `BCRA`, `TCMB`, `RBI` | EM-Zentralbanken |
| `FRED` | US-/globaler Zeitreihen-Anker |

---

## Expliziter Quellenkatalog

### SDMX / International Institutions

| Quelle | Rolle |
|--------|-------|
| `IMF IFS` | International Financial Statistics |
| `IMF WEO` | World Economic Outlook datasets |
| `World Bank WDI` | World Development Indicators |
| `OECD Data Explorer` | Standardisierte OECD-/MEI-Indikatoren |
| `ECB SDW / eurofxref` | ECB data warehouse und FX reference feeds |
| `UN Data` | UN statistics / international comparisons |
| `ADB Data Library` | Asian Development Bank macro datasets |
| `BIS Statistics` | Cross-border banking, credit, debt, FX, EWI-nahe Daten |

### Central Banks / Official Time Series

| Quelle | Rolle |
|--------|-------|
| `FRED` | US macro, rates, financial conditions, derived anchors |
| `BCB SGS` | Banco Central do Brasil series |
| `Banxico SIE` | Banco de Mexico time series |
| `BoK ECOS` | Bank of Korea ECOS API |
| `BCRA` | Banco Central de la Republica Argentina series |
| `TCMB EVDS` | Central Bank of the Republic of Turkiye data service |
| `RBI DBIE` | Reserve Bank of India database on Indian economy |
| `OFR` | Office of Financial Research APIs / series |
| `NY Fed Markets API` | New York Fed market operations / liquidity data |

### Global / Regional Expansion

| Quelle | Rolle |
|--------|-------|
| `Tushare` | China equities + macro + commodities bridge |
| `e-Stat` | Japan government statistics |
| `IBGE` | Brazil statistics institute |
| `INEGI` | Mexico statistics institute |
| `NBS China` | National Bureau of Statistics China |
| `PBoC` | People's Bank of China releases / reference series |

---

## Arbeitsregel

- Die operative Reife einer Quelle lebt in `../status.md`.
- Auth-pflichtige Quellen wie `FRED`, `Banxico` oder `BoK` muessen zusaetzlich in
  `../../specs/execution/source_onboarding_and_keys.md` und den betroffenen
  `*.env`-Vorlagen gepflegt werden.
- `FRED`, `Banxico` und `BoK` sind nicht mehr nur ENV-only gedacht: die
  Gateway-Connectoren akzeptieren jetzt denselben request-scoped
  Credential-Pfad wie `Finnhub`, damit user-supplied Keys ohne
  Frontend-direct-fetch transportiert werden koennen.
- Router-, BaseConnector- und Integrationsregeln bleiben in
  `../../go-research-financial-data-aggregation-2025-2026.md`.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../specs/EXECUTION_PLAN.md`
