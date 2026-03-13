# Sovereign, Corridors and Attractiveness Sources

> **Scope:** CBDC-Tracking, De-Dollarization, Sovereign-Parameter, Bilateral
> Trade Corridors und Country-Attractiveness-Quellen.

---

## Themen

| Thema | Beispiele |
|-------|-----------|
| CBDC / De-Dollarization | CBDC-Tracker, IMF COFER, Reserve- und Settlement-Signale |
| Sovereign Parameters | Policy-, reserve-, sanctions-, trust- und fragility-nahe Daten |
| Trade Corridors | UN Comtrade, WTO, bilaterale Handelsdaten |
| Country Attractiveness | Heritage EFI, WGI, CPI, Henley, FSI, Chinn-Ito |

---

## Tiering-Schnitt (SS4)

### Global baseline

| Quelle | Warum Baseline |
|--------|----------------|
| `IMF COFER` | globaler Reserve- und De-Dollarization-Anker |
| `UN Comtrade` | Standardbasis fuer bilaterale Trade-Corridors |
| `WGI` | Governance-Baseline |
| `Chinn-Ito KAOPEN` | Capital-openness-Baseline |

### Tier-1 official / specialist

| Quelle | Warum Tier-1 |
|--------|--------------|
| `Atlantic Council CBDC Tracker` | klarer CBDC-Speziallayer mit direktem Produktwert |
| `SWIFT RMB Tracker` | Settlement-/Internationalization-Sonderwert fuer RMB-Signale |
| `WTO disputes / trade materials` | formalisierter Trade-friction-Layer |
| `Fragile States Index` | expliziter Stress-/fragility-Sonderwert fuer Sovereign-Risk-Overlays |

### Tier-1-Mehrwert gegenueber der Baseline

| Quelle | Baseline-Vergleich | Konkreter Mehrwert |
|--------|--------------------|--------------------|
| `Atlantic Council CBDC Tracker` | `IMF COFER` / `UN Comtrade` | operative CBDC-Rollout- und Pilot-Sicht statt nur Reserve- oder Trade-Basisdaten |
| `SWIFT RMB Tracker` | `IMF COFER` | schnellere und spezifischere RMB-Settlement-/Internationalization-Signale als globale Reserve-Aggregate |
| `WTO disputes / trade materials` | `UN Comtrade` | formalisierte Trade-Frictions und Streitfaelle statt nur Handelsvolumen; hoehere Policy-Relevanz |
| `Fragile States Index` | `WGI` / `Chinn-Ito KAOPEN` | expliziter Fragility-/state-stress-Layer fuer Sovereign-Overlays, den Governance- und Capital-Openness-Baselines nicht direkt liefern |

### Long-tail deferred

| Quelle | Warum deferred |
|--------|----------------|
| `Atlantic Council Dollar / geoeconomic tracking`, `Heritage EFI`, `CPI`, `Henley Passport Index`, `reserve / sanctions / trust overlays` | nuetzlich fuer spaetere Composite- oder Attractiveness-Slices, aber aktuell nicht alles gleichzeitig delivery-wuerdig |

---

## Expliziter Quellenkatalog

### CBDC / De-Dollarization

| Quelle | Rolle |
|--------|-------|
| `Atlantic Council CBDC Tracker` | CBDC rollout / pilot / research status |
| `IMF COFER` | Reserve composition / USD share trend |
| `SWIFT RMB Tracker` | RMB settlement / internationalization signal |
| `Atlantic Council Dollar / geoeconomic tracking` | De-dollarization context and narrative support |

### Trade Corridors / Sovereign Flows

| Quelle | Rolle |
|--------|-------|
| `UN Comtrade` | Bilateral trade / corridor data |
| `WTO disputes / trade materials` | Trade-friction and formal dispute layer |

### Country Attractiveness / Sovereign Parameters

| Quelle | Rolle |
|--------|-------|
| `Heritage EFI` | Economic freedom / business environment |
| `WGI` | World Governance Indicators |
| `CPI` | Corruption Perceptions Index |
| `Fragile States Index` | State fragility / governance stress |
| `Henley Passport Index` | Mobility / attractiveness proxy |
| `Chinn-Ito KAOPEN` | Capital account openness |
| `reserve / sanctions / trust overlays` | Composite sovereign parameter bucket |

---

## Einsatz im System

- GeoMap / geopolitische Szenarien
- Entropy / novelty / regime tracking
- Sovereign-risk- und corridor-bezogene Overlay-Signale

---

## Arbeitsregel

- Source-Onboarding startet hier nicht direkt aus Kataloginteresse, sondern erst nach Tiering in `../../specs/execution/source_selection_delta.md`.
- Default zuerst auf globale Reserve-, Governance- und Trade-Baselines; zusammengesetzte Attractiveness- und Geoeconomics-Layer nur bei echtem Produktbedarf.

---

## Querverweise

- `../../specs/geo/GEOMAP_PRODUCT_AND_POLICY.md`
- `../../specs/execution/source_selection_delta.md`
- `../../ENTROPY_NOVELTY.md`
- `../../POLITICAL_ECONOMY_KNOWLEDGE.md`
