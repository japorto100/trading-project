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
- Frontend-Surface `/calendar` ist als `src/app/(shell)/calendar/page.tsx` implementiert
- Feature-Owner-Pfad liegt modular unter `src/features/intelligence_calendar/`
- Gemeinsamer Event-Detail-Pfad liegt jetzt unter `src/app/(shell)/events/[eventId]/page.tsx`
- Alter Research-Pfad `/research/events/[eventId]` redirectet auf die neutrale Shared-Route
- Trading-Surface ist umfangreich vorhanden (`src/app/(shell)/trading/page.tsx`)

---

## 1. Offene Deltas

### A. Placement und Routing (global kontextsensitiv)

- [x] **FIC1** Placement-Decision dokumentieren: eigenstaendige `/calendar`-Route vs. Lane in `/research` — Root-Owner-Entscheid: `Calendar` bleibt eine operative Event-Surface als eigener Einstieg im selben Decision-System wie `Research`; nicht nur eine Lane innerhalb von `/research`
- [x] **FIC2** Zielroute fuer Event-Detail festlegen (`/event/[eventId]`) — gemeinsamer neutraler Shared-Detailpfad ist umgesetzt; `Research` und `Calendar` verweisen auf dieselbe Route mit `returnTo`
- [x] **FIC3** Deep-Link-Verhalten fuer Notifications finalisieren — `/calendar?origin=notification&focusEvent=...` ist als Frontend-Verhalten definiert; die Surface fokussiert den Ziel-Event und haelt `returnTo` stabil
- [x] **FIC4** GlobalTopBar-Integration evaluieren (neue Surface ja/nein in Phase 1) — Phase-1-Default: `Calendar` nicht sofort als eigene Top-Level-Surface erzwingen; zuerst research-linked operativer Einstieg, spaetere Promotion nur mit Usage-/Complexity-Evidence

### B. Surface und Komponenten

- [x] **FIC5** `CalendarToolbar` (region/impact/date/asset filter) definieren
- [~] **FIC6** `EventList`/`EventTimeline` + `EventCard` + Keyboard-Navigation spezifizieren — `EventList` + modulare `EventCard` sind implementiert; Fokus-/Arrow-Key-Navigation fuer die Liste steht, weitergehende Detail-A11y bleibt offen
- [x] **FIC7** `EventPlaybookPanel` und `EventEvidencePanel` verbindlich machen
- [~] **FIC8** `EventDrilldownActions` (chart/geo/portfolio/alerts) mit stabilen Link-Contracts — Event detail, Trading, GeoMap und Control sind verdrahtet; Portfolio/Alerts sind als bewusste pending actions markiert, bis `execution/frontend_portfolio_alerts_shell_delta.md` echte Shell-Ziele liefert
- [x] **FIC8a** `EventRangeRow` als Pflichtbaustein aufnehmen (`min / consensus / max / previous / actual`)
- [x] **FIC8b** `EventSurpriseState` als Pflichtbaustein aufnehmen (in-range / above-range / below-range) und klar von editorial summary trennen

### C. Datenvertraege und Zustandsmanagement

- [x] **FIC9** `EventIntelligence` Frontend-Type + `zod` Runtime-Schema abstimmen
- [x] **FIC10** Degradation-Enum vertraglich erzwingen (`NO_PROVIDER_DATA`, `STALE_DATA`, `MISSING_EXPECTED_RANGE`, `LOW_CONFIDENCE`, `SERVICE_DEGRADED`) — Frontend-Contract nutzt jetzt explizite Enum-Reasons; lokale Uebergangsgruende bleiben zusaetzlich typisiert statt freie Strings zu sein
- [x] **FIC11** Cache-/Refresh-Regeln in Query-Layer (`@tanstack/react-query`) festlegen
- [x] **FIC12** Realtime-Dedupe-Regel (`eventId + updatedAt`) verbindlich aufnehmen

### D. UX-/Governance-Konsistenz

- [x] **FIC13** Keine Impact-/Bias-Darstellung ohne Confidence + Sources — Evidence-Panel zeigt Confidence + Sources explizit; Playbook-Inferenz wird ohne Evidenz nicht normal ausgespielt
- [x] **FIC14** `verified`/`inferred`/`unknown`-Darstellung in UI-Tonality verankern
- [x] **FIC15** Stale- und Partial-States sichtbar statt stilles Null-Rendering
- [x] **FIC16** Pre-event- und post-event-State sichtbar unterschiedlich gestalten; Calendar bleibt operative Event-Surface statt generischer Datentabelle

---

## 2. Verify-Gates

- [~] **FIC.V1** Placement final ist gegen globalen Kontext validiert (TopBar, Shell, Landing) — Phase-1-Entscheid ist dokumentiert, Live-Browser-Validierung bleibt offen
- [x] **FIC.V2** Event-Detail ist deep-link-stabil (`/event/[eventId]`) — Shared-Detailroute ist vorhanden; alter Research-Pfad redirectet darauf
- [x] **FIC.V3** Jede nicht-triviale Event-Aussage zeigt Confidence + Sources — oder wird als Playbook-Inferenz bis zur Evidenzlage zurueckgehalten
- [x] **FIC.V4** Degradation-Reasons werden im UI deterministisch dargestellt
- [~] **FIC.V5** Drilldowns zu Chart/Geo/Portfolio/Alerts funktionieren konsistent — Trading/Geo/Control sind vorhanden, Portfolio/Alerts sind explizit als pending markiert statt auf kaputte Ziele zu zeigen; Rest-Owner ist `execution/frontend_portfolio_alerts_shell_delta.md`
- [x] **FIC.V6** Keyboard-/A11y-Basics fuer Liste/Detail werden eingehalten — Listenfokus, Arrow-Key-Navigation, Enter-Open, Landmark-/Heading-Struktur und sprechende Labels fuer Detail-/Source-Links sind vorhanden
- [x] **FIC.V7** Erwartungsband und Surprise-State bleiben auf einen Blick lesbar (`min / consensus / max`, actual, in-range/out-of-range)
- [x] **FIC.V8** Kalender und Research teilen denselben Event-Detail-/Return-Kontext, statt konkurrierende Deep-Link-Pfade aufzubauen

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
