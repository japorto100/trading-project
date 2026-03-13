# Source Selection & Tiering Delta

> **Stand:** 10. Maerz 2026
> **Zweck:** Operativer Entscheidungs-Slice fuer die Auswahl und Tiering-Regeln
> externer Datenquellen in `docs/references/sources/*`, bevor Source-Onboarding
> und Implementierung beginnen.

---

## 0. Execution Contract

### Scope In

- Quellenauswahl pro Quellenklasse (`market`, `macro`, `central banks`, `legal`, `financial stability`, `sovereign/corridors`)
- Tiering-Regel `global baseline` vs. `tier-1 official` vs. `long-tail deferred`
- Begruendete Aufnahme oder Nichtaufnahme vor technischem Onboarding

### Scope Out

- Env-/Key-Pflichten und konkrete Credential-Arbeit (Owner: `source_onboarding_and_keys.md`)
- Cache-/Snapshot-/Retention-Logik aktiver Quellen (Owner: `source_persistence_snapshot_delta.md`)
- batchweiser Provider-Rollout und Runtime-Verify (Owner: `infra_provider_delta.md`)
- OSS-/Library-Kandidaten aus `projects/*` (Owner: `references_projects_evaluate_delta.md`)

### Mandatory Upstream Sources

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/references/README.md`
- `docs/references/sources/README.md`
- `docs/references/status.md`
- `docs/REFERENCE_SOURCE_STATUS.md`
- `docs/go-research-financial-data-aggregation-2025-2026.md`
- `docs/specs/execution/source_persistence_snapshot_delta.md`

---

## 1. Leitregel

### Tiering pro Quellentyp

- **Global baseline**
  - breite Abdeckung
  - standardisierte Vergleiche
  - Default fuer die meisten Laender und Quellengruppen
- **Tier-1 official**
  - nur fuer grosse oder produktrelevante Akteure
  - Aufnahme nur bei klarem Mehrwert gegenueber der Baseline
- **Long-tail deferred**
  - interessant, aber aktuell nicht delivery-wuerdig
  - bleibt im Quellenkatalog, aber ohne aktives Onboarding

### Kritische Aufnahme-Regel

Eine offizielle Spezialquelle wird nur dann Tier-1, wenn sie gegenueber der
globalen Baseline mindestens **zwei** der folgenden Punkte verbessert:

- Aktualitaet
- Granularitaet
- Policy-/Market-Relevanz
- Reliability / Contract-Clarity

---

## 2. Offene Deltas

- [x] **SS1** Macro-/Central-Banks-Quellen in `global baseline`, `tier-1 official`, `long-tail deferred` schneiden
- [x] **SS2** Market-Data-Quellen nach derselben Regel schneiden
- [x] **SS3** Legal-/Regulatory- und Financial-Stability-Quellen nach derselben Regel schneiden
- [x] **SS4** Sovereign-/Corridor- und verwandte Spezialquellen auf echten Produktbedarf pruefen
- [x] **SS5** Fuer jede Quellengruppe explizit festhalten, welche globale Baseline der Default ist
- [x] **SS6** Fuer jede Tier-1-Quelle den Mehrwert gegenueber der Baseline dokumentieren
- [x] **SS7** `long-tail deferred`-Kandidaten klar markieren, damit sie nicht still in Source-Onboarding rueberkippen

---

## 3. Verify-Gates

- [x] **SS.V1** jede relevante Quellenklasse besitzt eine dokumentierte Baseline-Quelle
- [x] **SS.V2** jede Tier-1-Quelle hat eine begruendete Ausnahme gegenueber der Baseline
- [x] **SS.V3** kein neues Source-Onboarding ohne vorherige Tiering-Entscheidung

---

## 4. Evidence Requirements

- SS-ID + betroffene Quellenklasse
- dokumentierte Baseline-Quelle
- dokumentierter Tier-1-Mehrwert oder Deferred-Begruendung
- Verweis auf betroffene `sources/*.md`, `references/status.md` und Folge-Owner

### SS6 Evidence (10. Maerz 2026)

- `macro-and-central-banks.md`: Tier-1-Mehrwert fuer `FRED`, `ECB`, `NY Fed`, `OFR`, selektive EM-Zentralbanken und konditionale `PBoC`
- `market-data.md`: Tier-1-Mehrwert fuer `CFTC COT`, `Nasdaq Data Link`, `SEC Company Facts / Filings`, `Polygon Options` / `Tradier Options` / `CBOE VIX`
- `legal-and-regulatory.md`: Tier-1-Mehrwert fuer `SECO`, `EU Sanctions`, `FINMA Enforcement`, `SEC Enforcement RSS`
- `financial-stability-and-nbfi.md`: Tier-1-Mehrwert fuer `CFTC TFF / COT`, `FINRA Margin Statistics`, `FINRA ATS`, `BIS RCAP`
- `sovereign-and-corridors.md`: Tier-1-Mehrwert fuer `Atlantic Council CBDC Tracker`, `SWIFT RMB Tracker`, `WTO disputes / trade materials`, `Fragile States Index`

---

## 5. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/references/sources/README.md`
- `docs/references/sources/market-data.md`
- `docs/references/sources/macro-and-central-banks.md`
- `docs/references/sources/legal-and-regulatory.md`
- `docs/references/sources/financial-stability-and-nbfi.md`
- `docs/references/sources/sovereign-and-corridors.md`
- `docs/references/status.md`
- `docs/REFERENCE_SOURCE_STATUS.md`
- `docs/specs/execution/source_onboarding_and_keys.md`
- `docs/specs/execution/source_persistence_snapshot_delta.md`
- `docs/specs/execution/infra_provider_delta.md`

---

## 6. Exit Criteria

- `SS1-SS7` sind entschieden
- jede aktive Quellenklasse hat einen expliziten Baseline-/Tier-1-/Deferred-Schnitt
- Source-Onboarding startet nicht mehr aus reinem Kataloginteresse, sondern nur nach dokumentierter Auswahl
- Persistenz-/Vector-Owner werden erst nach dokumentierter Auswahl aktiviert
