# Document Widgets Control Delta

> **Stand:** 13. Maerz 2026 (Rev. 1)
> **Phase:** 22b - Control Surface Document Widgets
> **Zweck:** Execution-Owner fuer die organisatorische Document-UI als Control-Subsurface (`/control/documents`) inklusive Search/Filter/Sets/Connector-Status/Indexing-Issues und research-naher Evidence-Widgets.
> **Aenderungshistorie:**
> - Rev. 1 (13.03.2026): Initialer Slice auf Basis `FRONTEND_DOCUMENT.md` + `control_surface_delta.md`

---

## 0. Execution Contract

### Scope In

- Document-Subsurface innerhalb Control (kein separates Frontend)
- read-only first Widgets:
  - Overview
  - Search + Filter
  - Document Sets
  - Connector Health/Status
  - Indexing Issues
- research-nahe Ops-Widgets:
  - Evidence Coverage
  - Research Scope Presets (search/compare/verify/global)
- BFF-Contracts unter `/api/control/documents/*` im bestehenden Gateway-Pfad
- klare Action-Klassen fuer mutierende Dokumentaktionen (`bounded-write`, `approval-write`)
- klare UI-Degradation statt silent fallback



==============> musst evaluiert werden ob wirklich zusammen mit control oder eigener button/tab


### Scope Out

- Chat-UI oder Chat-Composer-Funktionen
- 1:1 Port von Onyx als Produkt-UI
- direkter Browserzugriff auf Runtime/Tools/Storage
- Trading-Mutationen aus der Document-Surface
- neuer Frontend-Framework-Stack fuer v1

### Priorisierungsregel (verbindlich)

1. Routing + read-only Observability zuerst
2. BFF-Contracts + Gateway-Boundary erzwingen
3. bounded-/approval-write nur mit Audit + Policy
4. research-nahe Zusatzwidgets nach stabiler v1-Basis

### Mandatory Upstream Sources

- `../../../../FRONTEND_DOCUMENT.md`
- `docs/FRONTEND_CONTROL.md`
- `docs/specs/execution/control_surface_delta.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/GO_GATEWAY.md`
- `docs/AGENT_SECURITY.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/MEMORY_ARCHITECTURE.md`

### Baseline (wichtig)

- Control-Surface ist als Gesamtziel definiert, Document-Subsurface ist bislang nicht als eigener Execution-Slice operationalisiert.
- Bestehender Stack reicht fuer v1:
  - `next`/`react`
  - `@tanstack/react-query`
  - `@tanstack/react-table`
  - `@tanstack/react-virtual`
  - `@dnd-kit/*` (optional)
- Zielkette bleibt verbindlich:
  - `UI -> Next BFF -> Go Gateway -> downstream services`

---

## 1. Offene Deltas

### A. Routing und Surface Shell

- [ ] **DW1** Route `/control/documents` als eigener Subtab im Control-Navigationsmodell verankern
- [ ] **DW2** URL-getriebene Subtab-Navigation fuer Document-Surface stabilisieren (`overview`, `search`, `sets`, `connectors`, `issues`, `evidence`)
- [ ] **DW3** Leerlauf-/Lade-/Fehlerzustand als lokale Widget-States umsetzen (kein Full-Page-Crash)

### B. Read-only Widgets (v1)

- [ ] **DW4** `DocumentsOverviewWidget` (gesamt docs, stale sets, failed jobs, last sync) liefern
- [ ] **DW5** `DocumentSearchWidget` + `DocumentFilterBarWidget` (query, source, set, time) liefern
- [ ] **DW6** `DocumentSetsWidget` (set status: up-to-date/syncing/deleting + visibility) liefern
- [ ] **DW7** `ConnectorsStatusWidget` (health, permission sync, last indexed) liefern
- [ ] **DW8** `IndexingIssuesWidget` (failed attempts, details, retry-intent) liefern

### C. BFF / Contract / Boundary

- [ ] **DW9** Endpunkte unter `/api/control/documents/*` definieren:
  - `/overview`
  - `/search`
  - `/sets`
  - `/connectors`
  - `/issues`
  - `/evidence`
- [ ] **DW10** `X-Request-ID` durchgaengig propagieren und in Responses rueckgeben
- [ ] **DW11** no-store + konsistentes Fehler-/Degradation-Schema fuer alle Document-Endpunkte erzwingen
- [ ] **DW12** harte Gateway-Boundary pruefen (keine Browser-Direktpfade)

### D. Action-Klassen / Security / Audit

- [ ] **DW13** UI-seitig Actions sichtbar klassifizieren (`read-only`, `bounded-write`, `approval-write`, `forbidden`)
- [ ] **DW14** bounded-write Pfade (z. B. visibility/boost) strikt serverseitig allowlisten
- [ ] **DW15** approval-write Pfade (z. B. destructive reindex/delete) mit Confirm + second check + expiry umsetzen
- [ ] **DW16** Audit-Pflichtfelder fuer mutierende Pfade erzwingen (`requestId`, `actorUserId`, `role`, `decisionId`, `ts`, target)

### E. Research-nahe Ops Widgets (v1.5)

- [ ] **DW17** `EvidenceCoverageWidget` (missing sources, contradiction markers, stale evidence flags) liefern
- [ ] **DW18** `ResearchScopeWidget` (search/compare/verify/global presets) liefern
- [ ] **DW19** Kontext-Degradation sichtbar machen (`NO_KG_CONTEXT`, `NO_VECTOR_CONTEXT`, etc.)

### F. Stack- und Abhaengigkeitsregeln

- [ ] **DW20** v1 ohne neuen grossen UI-Stack umsetzen (bestehende `package.json` Dependencies nutzen)
- [ ] **DW21** nur gezielte Add-ons bei nachgewiesenem Gap; mit Begruendung dokumentieren

---

## 2. Verify-Gates

- [ ] **DW.V1** `/control/documents` ist ueber Header/Control-Navigation erreichbar und reload-stabil
- [ ] **DW.V2** alle v1 Widgets laufen read-only stabil inkl. Empty/Error/Loading
- [ ] **DW.V3** Search/Filter verhalten sich deterministisch (keine stillen Fallbacks)
- [ ] **DW.V4** Document Sets/Connectors/Issues zeigen Status und Zeitbezug nachvollziehbar
- [ ] **DW.V5** keine Browser-Direktpfade zu Runtime/Tools/Storage vorhanden
- [ ] **DW.V6** Action-Klassen sind UI-sichtbar und serverseitig erzwungen
- [ ] **DW.V7** approval-write erzeugt vollstaendigen Audit-Record
- [ ] **DW.V8** Degradation-Flags werden sichtbar gerendert, nicht versteckt
- [ ] **DW.V9** Keine neue Kern-UI-Library fuer v1 eingefuehrt (Stack-Regel eingehalten)

---

## 3. Evidence Requirements

- Screenshots/Recording fuer alle v1 Widgets (happy path + empty + error)
- API Contract Samples fuer `/api/control/documents/*` (happy + degraded + error)
- Request-Trace fuer Gateway-Boundary-Nachweis (`UI -> BFF -> Gateway`)
- Rollen-/Action-Matrix Nachweis fuer `bounded-write` und `approval-write`
- Audit-Beispiele mit Pflichtfeldern fuer mutierende Aktionen
- kurzer Dependency-Nachweis: vorhandener Stack genutzt, keine v1-Framework-Ausweitung

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/execution/control_surface_delta.md`
- `docs/specs/execution/frontend_enhancement_delta.md`
- `../../../../FRONTEND_DOCUMENT.md`
