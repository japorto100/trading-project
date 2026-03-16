# Frontend Intelligence Calendar Delta

> **Stand:** 16. Maerz 2026  
> **Zweck:** Execution-Owner fuer die Umsetzung von
> `docs/FRONTEND_INTELLIGENCE_CALENDAR.md` als produktive Frontend-Surface
> (Event-Intelligence statt Terminliste).  
> **High-Level-Quelle:** `docs/MRKTEDGE.AI-deep research chatgptp2.md` bleibt
> das uebergeordnete Benchmark-/Transfer-MD fuer diese und
> `docs/FRONTEND_RESEARCH_HOME.md`.

---

## 0. Execution Contract

### Scope In

- Calendar-Surface als first-class UI (Route oder Modul innerhalb Research Home)
- EventCard/EventDetail/EventPlaybook/EventEvidence Komponenten
- Surprise-/Impact-Darstellung inkl. Confidence- und Freshness-Signale
- Drilldowns zu Chart, Geo, Portfolio, Alerts
- Frontend-Vertragsgrenzen fuer Event-Objekt und Degradation-Reasons
- Placement-Evaluation im globalen Kontext (TopNav/Shell/Route-Ownership)

### Scope Out

- providerseitige Ingestion-/ETL-Implementierung
- scoring engine intern (regel- oder ML-seitig)
- globale Security-Policy-Ownerentscheidungen
- nicht-calendarbezogene Trading-Workspace-Refactors

### Mandatory Upstream Sources

- `docs/FRONTEND_INTELLIGENCE_CALENDAR.md`
- `docs/FRONTEND_RESEARCH_HOME.md`
- `docs/MRKTEDGE.AI-deep research chatgptp2.md` (**High-Level-MD**)
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/UNIFIED_INGESTION_LAYER.md`
- `docs/specs/AUTH_SECURITY.md`

### Baseline (aktuell)

- Globale Surface-Navigation: `Trading`, `Map`, `Control`, `Files` in `GlobalTopBar`
- Landing: `src/app/page.tsx` redirect auf `/trading`
- Keine dedizierten Routes fuer `/calendar` oder `/event/:eventId`
- Trading-Surface ist umfangreich vorhanden (`src/app/(shell)/trading/page.tsx`)

---

## 1. Offene Deltas

### A. Placement und Routing (global kontextsensitiv)

- [ ] **FIC1** Placement-Decision dokumentieren: eigenstaendige `/calendar`-Route vs. Lane in `/research`
- [ ] **FIC2** Zielroute fuer Event-Detail festlegen (`/event/[eventId]`)
- [ ] **FIC3** Deep-Link-Verhalten fuer Notifications finalisieren
- [ ] **FIC4** GlobalTopBar-Integration evaluieren (neue Surface ja/nein in Phase 1)

### B. Surface und Komponenten

- [ ] **FIC5** `CalendarToolbar` (region/impact/date/asset filter) definieren
- [ ] **FIC6** `EventList`/`EventTimeline` + `EventCard` + Keyboard-Navigation spezifizieren
- [ ] **FIC7** `EventPlaybookPanel` und `EventEvidencePanel` verbindlich machen
- [ ] **FIC8** `EventDrilldownActions` (chart/geo/portfolio/alerts) mit stabilen Link-Contracts

### C. Datenvertraege und Zustandsmanagement

- [ ] **FIC9** `EventIntelligence` Frontend-Type + `zod` Runtime-Schema abstimmen
- [ ] **FIC10** Degradation-Enum vertraglich erzwingen (`NO_PROVIDER_DATA`, `STALE_DATA`, `MISSING_EXPECTED_RANGE`, `LOW_CONFIDENCE`, `SERVICE_DEGRADED`)
- [ ] **FIC11** Cache-/Refresh-Regeln in Query-Layer (`@tanstack/react-query`) festlegen
- [ ] **FIC12** Realtime-Dedupe-Regel (`eventId + updatedAt`) verbindlich aufnehmen

### D. UX-/Governance-Konsistenz

- [ ] **FIC13** Keine Impact-/Bias-Darstellung ohne Confidence + Sources
- [ ] **FIC14** `verified`/`inferred`/`unknown`-Darstellung in UI-Tonality verankern
- [ ] **FIC15** Stale- und Partial-States sichtbar statt stilles Null-Rendering

---

## 2. Verify-Gates

- [ ] **FIC.V1** Placement final ist gegen globalen Kontext validiert (TopBar, Shell, Landing)
- [ ] **FIC.V2** Event-Detail ist deep-link-stabil (`/event/[eventId]`)
- [ ] **FIC.V3** Jede nicht-triviale Event-Aussage zeigt Confidence + Sources
- [ ] **FIC.V4** Degradation-Reasons werden im UI deterministisch dargestellt
- [ ] **FIC.V5** Drilldowns zu Chart/Geo/Portfolio/Alerts funktionieren konsistent
- [ ] **FIC.V6** Keyboard-/A11y-Basics fuer Liste/Detail werden eingehalten

---

## 3. Evidence Requirements

- Routing-/Placement-Entscheidprotokoll mit Global-Context-Abwaegung
- Beispielpayloads fuer EventList/EventDetail inkl. Degradation-Reasons
- UI-Screens fuer Normal-, Degraded- und Low-Confidence-State
- Link-Matrix fuer Drilldowns inkl. Fehlerfaelle
- Querverweise auf `API_CONTRACTS`, `FRONTEND_ARCHITECTURE`, `AUTH_SECURITY`

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/UNIFIED_INGESTION_LAYER.md`
- `docs/specs/ROLLOUT_GATES.md`
