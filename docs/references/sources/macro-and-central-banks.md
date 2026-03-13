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

## Tiering-Schnitt (SS1)

### Global baseline

| Quelle | Warum Baseline |
|--------|----------------|
| `IMF IFS` | globale makrooekonomische Vergleichbarkeit, standardisierte Struktur |
| `World Bank WDI` | breite Laenderabdeckung fuer Realwirtschaft und Entwicklung |
| `OECD Data Explorer` | standardisierte Indikatoren und gute Laendervergleiche |
| `UN Data` | internationale Vergleichs- und Statistikbasis |
| `BIS Statistics` | globale Banken-, Kredit- und Debt-Perspektive |

### Tier-1 official

| Quelle | Warum Tier-1 |
|--------|--------------|
| `FRED` | hoher Produktwert fuer US-/globalen Marktanker, schnelle Time-Series-Nutzung, starker Contract |
| `ECB SDW / eurofxref` | Eurozone-/FX-Relevanz, offizielle Policy- und Referenzdaten |
| `NY Fed Markets API` | geldmarkt- und liquiditaetsnahe US-Daten mit unmittelbarer Markt-/Regime-Relevanz |
| `OFR` | offizieller Stress-/financial-conditions-Layer mit Signalwert fuer Regime und NBFI |
| `BCB SGS`, `Banxico SIE`, `BoK ECOS`, `BCRA`, `TCMB EVDS`, `RBI DBIE` | selektive EM-Zentralbanken mit echtem FX-/Rates-/Policy-Mehrwert |
| `PBoC` | grosse Policy-/macro-Relevanz fuer China; nur wenn maschinenlesbarer Mehrwert gegenueber der Baseline belegbar ist |

### Tier-1-Mehrwert gegenueber der Baseline

| Quelle | Baseline-Vergleich | Konkreter Mehrwert |
|--------|--------------------|--------------------|
| `FRED` | `IMF IFS` / `OECD` / `World Bank` | bessere Aktualitaet, breitere US-Rates-/conditions-Abdeckung, klarer API-Contract fuer produktnahe Time-Series |
| `ECB SDW / eurofxref` | `IMF IFS` / `OECD` | offizielle Eurozone-Policy- und FX-Referenzdaten mit hoeherer Aktualitaet und institutioneller Eindeutigkeit |
| `NY Fed Markets API` | `FRED` / `IMF IFS` | granularere Geldmarkt-/liquidity-Plumbing-Daten, unmittelbare Policy-/market-Relevanz, offizieller Contract |
| `OFR` | `BIS Statistics` / `FRED` | spezifischer Stress-/financial-conditions-Layer, schnellere Regime-Signale, klar abgegrenzter offizieller Datensatz |
| `BCB SGS`, `Banxico SIE`, `BoK ECOS`, `BCRA`, `TCMB EVDS`, `RBI DBIE` | `IMF IFS` / `World Bank` / `OECD` | bessere Landesgranularitaet, schnellere Policy-/FX-/Rates-Updates und direktere Zentralbankkontrakte fuer selektive EM-Maerkte |
| `PBoC` | `IMF IFS` / `UN Data` | nur als Tier-1 bei nachgewiesener Aktualitaets- oder Policy-Luecke; sonst bleibt die globale Baseline ausreichend |

### Long-tail deferred

| Quelle | Warum deferred |
|--------|----------------|
| `ADB Data Library` | regional nuetzlich, aber kein erster globaler Default |
| `Tushare` | breiter China-Bridge-Wert, aber kein offizieller Tier-1-Default |
| `e-Stat`, `IBGE`, `INEGI`, `NBS China` | sinnvoll nur bei konkretem Landes- oder Produktbedarf |

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
- Source-Onboarding startet hier nicht direkt aus Kataloginteresse, sondern erst nach Tiering in `../../specs/execution/source_selection_delta.md`.
- Default-Regel:
  - globale Baseline zuerst (`IMF`, `World Bank`, `OECD`, `UN`, `BIS`)
  - offizielle Zentralbank-/Institutionenquellen nur als Tier-1-Ausnahmen bei klarem Mehrwert
- `ADB` ist im Go-Wiring bereits als Prefix-Client registriert, bleibt aber bewusst Scaffold, solange `GetSeries` nicht implementiert ist und kein echter regionaler Coverage-Gap gegen die Baseline dokumentiert wurde.
- Fuer kleinere oder selten marktbewegende Laender ist die globale Baseline der Default; offizielle Landesquellen brauchen einen expliziten Produkt- oder Signalhebel.
- Auth-pflichtige Quellen wie `FRED`, `Banxico` oder `BoK` muessen zusaetzlich in
  `../../specs/execution/source_onboarding_and_keys.md` und den betroffenen
  `*.env`-Vorlagen gepflegt werden.
- Persistenzstandard fuer diese Gruppe:
  - primaer `api-hot`
  - Cadence meist `hourly` bis `daily`
  - Retention standardmaessig `ephemeral`
  - snapshots nur selektiv fuer kuratierte Referenz- oder Audit-Serien
- `FRED`, `Banxico`, `BoK`, `OFR` und `NYFed` laufen jetzt nicht mehr nur nach
  Policy auf `api-hot`, sondern besitzen im Gateway bereits einen ersten
  gemeinsamen JSON-TTL-Cachepfad.
- `FRED`, `Banxico` und `BoK` sind nicht mehr nur ENV-only gedacht: die
  Gateway-Connectoren akzeptieren jetzt denselben request-scoped
  Credential-Pfad wie `Finnhub`, damit user-supplied Keys ohne
  Frontend-direct-fetch transportiert werden koennen.
- Router-, BaseConnector- und Integrationsregeln bleiben in
  `../../go-research-financial-data-aggregation-2025-2026.md`.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_selection_delta.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../specs/execution/source_persistence_snapshot_delta.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../specs/EXECUTION_PLAN.md`
