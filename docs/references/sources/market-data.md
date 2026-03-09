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

## Themenblöcke aus dem alten Katalog

- Commodities
- Erweitertes Forex
- Erweiterte Aktien / europaeische Maerkte
- Futures-Spezifika (COT, Continuous Contracts, Term Structure)
- Bonds / Fixed Income
- Symbol-Universum / Kuerzel
- DEX vs CEX Daten-Integration
- Options + Dark Pool

Diese Themen wurden aus `REFERENCE_PROJECTS.md` ausgelagert und sollen hier
weiter verdichtet werden.

---

## Arbeitsregel

- Diese Datei ist Quellenkatalog, **nicht** Statusmatrix.
- Implementierte und gescaffoldete Provider stehen in `../status.md`.
- Auth-pflichtige Marktquellen wie `Finnhub` muessen zusaetzlich in
  `../../specs/execution/source_onboarding_and_keys.md` und den betroffenen
  `*.env`-Vorlagen auftauchen.
- Architektur- und BaseConnector-Regeln bleiben in
  `../../go-research-financial-data-aggregation-2025-2026.md`.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_onboarding_and_keys.md`
- `../../go-research-financial-data-aggregation-2025-2026.md`
- `../../UNIFIED_INGESTION_LAYER.md`
