# Frontend Research Home Delta

> **Stand:** 16. Maerz 2026  
> **Zweck:** Execution-Owner fuer die Umsetzung von
> `docs/FRONTEND_RESEARCH_HOME.md` als primaere Decision-Surface.  
> **High-Level-Quelle:** `docs/MRKTEDGE.AI-deep research chatgptp2.md` bleibt
> das uebergeordnete Benchmark-/Transfer-MD fuer diese und
> `docs/FRONTEND_INTELLIGENCE_CALENDAR.md`.

---

## 0. Execution Contract

### Scope In

- Research-Home IA (TopSummary, WhatMattersNow, EventLane, NarrativeLane, ActionRail)
- route- und surfaceseitige Integration in bestehende Shell-Navigation
- cross-surface continuity (`ResearchHome -> Event -> Workspace -> back`)
- confidence/reason/freshness visibility fuer ranking-basierte Cards
- Placement-Evaluation im globalen Kontext (nicht isoliert pro Feature)

### Scope Out

- Trading-Workspace Kernlogik (charts/orders/layout intern)
- backend ranking internals (nur contract-level Erwartung)
- globale Rollen-/Security-Policy-Owneraenderungen
- nicht-researchbezogene Feature-Slices

### Mandatory Upstream Sources

- `docs/FRONTEND_RESEARCH_HOME.md`
- `docs/FRONTEND_INTELLIGENCE_CALENDAR.md`
- `docs/MRKTEDGE.AI-deep research chatgptp2.md` (**High-Level-MD**)
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/FRONTEND_COMPONENTS.md`

### Baseline (aktuell)

- GlobalTopBar fuehrt derzeit `Trading`, `Map`, `Control`, `Files`
- keine dedizierte `Research`-Surface in Navigation
- Landing zeigt auf `/trading`
- Trading-Surface ist produktiv primar

---

## 1. Offene Deltas

### A. Placement, Routing und Navigation

- [ ] **FRH1** Placement entscheiden: neue `/research`-Surface vs. modulare Einbettung
- [ ] **FRH2** Landing-Strategie festlegen: `/` bleibt `/trading` oder spaeter `/research`
- [ ] **FRH3** GlobalTopBar-Integration evaluieren (Research als Top-Level ja/nein, wann)
- [ ] **FRH4** Context-preserving Navigation definieren (`back`-Pfad ohne Kontextverlust)

### B. IA und Module

- [ ] **FRH5** IA-Module als konkrete Komponenten schneiden (`TopSummaryRow`, `WhatMattersNow`, `EventLane`, `NarrativeLane`, `ActionRail`)
- [ ] **FRH6** Ranking-Karten mit reason/confidence/freshness verpflichtend
- [ ] **FRH7** Personalisierung sichtbar machen ohne globale Critical-Items zu verstecken
- [ ] **FRH8** ActionRail-Links zu Event/Workspace/Geo/Portfolio/Alerts stabilisieren

### C. Contracts und Runtime-Verhalten

- [ ] **FRH9** `ResearchHomePayload` und `zod` Runtime-Guards abstimmen
- [ ] **FRH10** Modulweises Degradation-Verhalten (reason enums) festlegen
- [ ] **FRH11** Partial-Load-Verhalten definieren (Home bleibt nutzbar trotz Modul-Ausfall)
- [ ] **FRH12** Cache-/Refetch-Strategie im Query-Layer festziehen

### D. UX-/Governance-Qualitaet

- [ ] **FRH13** "No opaque scoring": jede Ranking-Aussage erklaert im UI
- [ ] **FRH14** Unsicherheit explizit (`unknown`/low confidence), kein certainty wording
- [ ] **FRH15** MRKT-carryover-Pflichten als Acceptance-Kriterien uebernehmen

---

## 2. Verify-Gates

- [ ] **FRH.V1** Placement ist im globalen Kontext entschieden und begruendet
- [ ] **FRH.V2** Research-Home bleibt bei partiellen Backend-Ausfaellen nutzbar
- [ ] **FRH.V3** Jede MattersNow-Karte zeigt reason + confidence + freshness
- [ ] **FRH.V4** Personalisierung verdeckt keine globalen critical items
- [ ] **FRH.V5** Cross-surface continuity funktioniert reproduzierbar
- [ ] **FRH.V6** Ranking-Erklaerung ist fuer Nutzer ohne Hidden-Logik nachvollziehbar

---

## 3. Evidence Requirements

- Placement-/Nav-ADR oder Entscheidungsnotiz mit Vor-/Nachteilen
- Screens fuer full/partial/degraded ResearchHome-States
- Beispielpayloads fuer `research/home` inklusive low-confidence und stale cases
- Nachweise fuer continuity-flows (`ResearchHome -> Event -> Workspace -> back`)
- Querverweise auf `FRONTEND_ARCHITECTURE`, `API_CONTRACTS`, `AUTH_SECURITY`

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/ROLLOUT_GATES.md`
- `docs/FRONTEND_COMPONENTS.md`
