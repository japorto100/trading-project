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

- [x] **FRH1** Placement entscheiden: neue `/research`-Surface vs. modulare Einbettung
- [x] **FRH2** Landing-Strategie festlegen: `/` bleibt `/trading` oder spaeter `/research`
- [x] **FRH3** GlobalTopBar-Integration evaluieren (Research als Top-Level ja/nein, wann)
- [~] **FRH4** Context-preserving Navigation definieren (`back`-Pfad ohne Kontextverlust) — `Research -> Event detail -> back` ist frontend-seitig vorhanden; vollstaendige Rueckwege ueber alle Zielsurfaces bleiben Verify-Arbeit

### B. IA und Module

- [x] **FRH5** IA-Module als konkrete Komponenten schneiden (`TopSummaryRow`, `WhatMattersNow`, `EventLane`, `NarrativeLane`, `ActionRail`)
- [x] **FRH6** Ranking-Karten mit reason/confidence/freshness verpflichtend
- [ ] **FRH7** Personalisierung sichtbar machen ohne globale Critical-Items zu verstecken
- [~] **FRH8** ActionRail-Links zu Event/Workspace/Geo/Portfolio/Alerts stabilisieren — Workspace/Geo/Control sind vorhanden; Portfolio/Alerts fehlen noch als eigener Research-Flow

### C. Contracts und Runtime-Verhalten

- [x] **FRH9** `ResearchHomePayload` und `zod` Runtime-Guards abstimmen
- [~] **FRH10** Modulweises Degradation-Verhalten (reason enums) festlegen — `local`/`fallback` und `moduleStates` sind frontend-seitig typisiert; produktive reason-enums gegen Gateway-Vertrag bleiben offen
- [~] **FRH11** Partial-Load-Verhalten definieren (Home bleibt nutzbar trotz Modul-Ausfall) — sichtbarer `fallback`/degraded-Pfad ist vorhanden; echte modulweise Partial-Loads haengen noch am produktiven Datenpfad
- [x] **FRH12** Cache-/Refetch-Strategie im Query-Layer festziehen
- [ ] **FRH12a** Offenen Datenpfad explizit schliessen: `local` (frontend-/Next-owned Zwischenaggregation), `fallback` (sichtbarer degradierter UI-Pfad) und `gateway` (produktiver Upstream) muessen als drei getrennte Modi dokumentiert, typisiert und fuer Rollout/Verify sauber gegeneinander abgegrenzt werden; Slice ist nicht geschlossen, solange der echte produktive Datenpfad nicht belastbar auf `gateway` umgestellt werden kann

### D. UX-/Governance-Qualitaet

- [x] **FRH13** "No opaque scoring": jede Ranking-Aussage erklaert im UI
- [~] **FRH14** Unsicherheit explizit (`unknown`/low confidence), kein certainty wording — frontend copy folgt dem Prinzip, finale Wirkung haengt aber an echten Datenmodi
- [x] **FRH15** MRKT-carryover-Pflichten als Acceptance-Kriterien uebernehmen

---

## 2. Verify-Gates

- [ ] **FRH.V1** Placement ist im globalen Kontext entschieden und begruendet
- [~] **FRH.V2** Research-Home bleibt bei partiellen Backend-Ausfaellen nutzbar — `fallback` ist sichtbar und nutzbar; echte Partial-Backend-Ausfaelle gegen produktiven Gateway-Pfad bleiben offen
- [x] **FRH.V3** Jede MattersNow-Karte zeigt reason + confidence + freshness
- [ ] **FRH.V4** Personalisierung verdeckt keine globalen critical items
- [~] **FRH.V5** Cross-surface continuity funktioniert reproduzierbar — `Research -> Event detail -> Workspace/Geo -> back` ist frontend-seitig vorbereitet, aber nicht voll verifiziert
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
