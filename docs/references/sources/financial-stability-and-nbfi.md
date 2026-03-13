# Financial Stability and NBFI Sources

> **Scope:** Shadow Banking, Basel-/Stress-/Stabilitaetsquellen, Margin-, ATS-,
> Liquidity- und systemische Stress-Indikatoren.

---

## Relevante Quellen

| Quelle | Rolle |
|--------|-------|
| `OFR Financial Stress Index` | Stress- und Regime-Signal |
| `NY Fed Markets API` | Markets-/liquidity-nahe Stabilitaetsdaten |
| `BIS Early Warning Indicators` | Fruehwarn- und Basel-nahe Daten |
| `ISDA SwapsInfo` | Derivatives-/Swap-Markt-Kontext |
| `BIS RCAP` | Basel-Regime und Regulierungs-Compliance |
| `FINRA Margin Statistics` | Margin-/Leverage-Proxy |
| `FSB NBFI Report` | Shadow-Banking- und NBFI-Kontext |

---

## Tiering-Schnitt (SS3)

### Global baseline

| Quelle | Warum Baseline |
|--------|----------------|
| `OFR Financial Stress Index` | klarer Stress-/Regime-Anker |
| `NY Fed Markets API` | Liquiditaets- und Geldmarkt-Baseline mit hoher Signalqualitaet |
| `BIS Early Warning Indicators` | globale Fruehwarn- und Kreditzyklen-Basis |
| `FRED liquidity series` | breiter US-/conditions-Fallback fuer Zeitreihen |

### Tier-1 official / specialist

| Quelle | Warum Tier-1 |
|--------|--------------|
| `CFTC TFF / COT` | offizieller Positioning-/Leverage-Layer |
| `FINRA Margin Statistics` | klarer Margin-/Leverage-Proxy fuer Risk-On/Risk-Off-Interpretation |
| `FINRA ATS` | Dark-pool-/ATS-Speziallayer bei echtem Produktbedarf |
| `BIS RCAP` | Supervisory-/Basel-Regime-Sonderwert fuer Policy-/Stability-Slices |

### Tier-1-Mehrwert gegenueber der Baseline

| Quelle | Baseline-Vergleich | Konkreter Mehrwert |
|--------|--------------------|--------------------|
| `CFTC TFF / COT` | `OFR Financial Stress Index` / `FRED liquidity series` | direkte Positioning- und Leverage-Einsicht statt nur aggregierter Stress-/Liquidity-Proxys |
| `FINRA Margin Statistics` | `OFR Financial Stress Index` / `NY Fed Markets API` | spezifischer Margin-/Leverage-Proxy mit klarerer Retail-/brokerage-Naehe |
| `FINRA ATS` | `NY Fed Markets API` / `FRED liquidity series` | Dark-pool-/ATS-Sichtbarkeit, die in allgemeinen Liquidity-Baselines fehlt; nur bei explizitem Equity-Microstructure-Bedarf |
| `BIS RCAP` | `BIS Early Warning Indicators` | supervisories und Basel-Regime-Detail statt makroprudenzieller Fruehwarnaggregation |

### Long-tail deferred

| Quelle | Warum deferred |
|--------|----------------|
| `ISDA SwapsInfo`, `FSB NBFI Report`, `BIS statistics` | wichtig fuer tieferen Stability-/Research-Kontext, aber nicht alle als sofortiger aktiver Ingest noetig |

---

## Expliziter Quellenkatalog

### Stress / Liquidity / Regime

| Quelle | Rolle |
|--------|-------|
| `OFR Financial Stress Index` | US financial stress benchmark |
| `NY Fed Markets API` | SOMA, ON RRP, reserves, operations, liquidity plumbing |
| `BIS Early Warning Indicators` | Systemic early-warning metrics |
| `FRED liquidity series` | SOFR, reserves, TGA, RRP, conditions series |

### NBFI / Derivatives / Leverage

| Quelle | Rolle |
|--------|-------|
| `ISDA SwapsInfo` | Derivatives / swaps transparency context |
| `FINRA Margin Statistics` | Margin debt / leverage proxy |
| `FINRA ATS` | Dark-pool / ATS weekly trading volume |
| `CFTC TFF / COT` | Leveraged positioning in futures markets |
| `FSB NBFI Report` | Shadow banking / non-bank financial intermediation |

### Basel / Supervisory Regime

| Quelle | Rolle |
|--------|-------|
| `BIS RCAP` | Basel regime / compliance assessment |
| `BIS statistics` | Cross-border credit / bank claims / debt context |

---

## Arbeitsregel

- Source-Onboarding startet hier nicht direkt aus Kataloginteresse, sondern erst nach Tiering in `../../specs/execution/source_selection_delta.md`.
- Stress-/Liquidity-Baselines zuerst, tiefere NBFI-/Derivatives-/Supervisory-Layer nur bei klarem Produkt- oder Signalbedarf.
- Persistenzstandard fuer diese Gruppe:
  - `OFR`, `NY Fed`, `FRED liquidity series` primaer `api-hot`
  - `FINRA ATS` `api-snapshot`
  - `CFTC TFF / COT` `file-snapshot`
  - supervisory-/report-nahe Spezialquellen koennen spaeter `file-snapshot`
    oder kuratierten textbasierten vector input liefern, aber nicht direkt aus
    Rohdateien embeddet werden

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_selection_delta.md`
- `../../specs/execution/source_persistence_snapshot_delta.md`
- `../../specs/execution/vector_ingestion_delta.md`
- `../../ENTROPY_NOVELTY.md`
- `../../GAME_THEORY.md`
- `../../specs/geo/GEOMAP_MODULE_CATALOG.md`
