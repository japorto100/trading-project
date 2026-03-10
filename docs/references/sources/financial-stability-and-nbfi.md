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

## Querverweise

- `../status.md`
- `../../ENTROPY_NOVELTY.md`
- `../../GAME_THEORY.md`
- `../../specs/geo/GEOMAP_MODULE_CATALOG.md`
