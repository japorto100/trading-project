# Control Surface Delta

> **Stand:** 13. Maerz 2026 (Rev. 1)
> **Phase:** 22b - Control Surface (Ops/Runtime Layer)
> **Zweck:** Execution-Owner fuer die integrierte Control-Flaeche im TradeView-Frontend (Mission-Control-inspiriert, produkt- und security-konform).
> **Aenderungshistorie:**
> - Rev. 1 (13.03.2026): Initialer Slice erstellt, basierend auf `docs/FRONTEND_CONTROL.md` inkl. Ist-Zustand, RBAC/Action-Klassen, Verify-Gates

---

## 0. Execution Contract

### Scope In

- Control Entry im Trading Header (primaer) und im Agent Chat (sekundaer)
- neue Control-Route inkl. URL-getriebener Subtab-Navigation
- Subtabs fuer Overview, Sessions, Tool Events, Memory, KG/Context, Security, Skills, Agents, Evals
- read-only Default mit expliziter Klassifizierung (`read-only`, `bounded-write`, `approval-write`, `forbidden`)
- Control-BFF Endpunkte unter `/api/control/*` mit Auth/RBAC/Audit- und Request-ID-Weitergabe
- sichtbare Degradation-/Health-Signale (SSE, Memory/KG, Security posture, policy decisions)
- Mission-Control Patterns als Blueprint (Adapt, kein 1:1 Port)

### Scope Out

- Vollport von Mission Control UI/API
- neue Agent-Business-Logik im Python Runtime Layer
- Umstellung des globalen Auth-Stacks (NextAuth/Proxy/Gateway bleibt)
- trading-kritische Mutationen direkt aus Control (Orders/Portfolio-Execution)
- Tenant-Multi-Workspace-Neudesign als separates Plattformprojekt (nur vorbereitende v1 Hooks hier)

### Priorisierungsregel (verbindlich)

1. Navigation + read-only Observability zuerst
2. Security/RBAC/Action-Klassen technisch erzwingen
3. bounded-write/approval-write Flows nur mit Audit + Approval
4. optionales v2 (workspaceId, advanced integrations) nachgelagert

### Mandatory Upstream Sources

- `docs/FRONTEND_CONTROL.md`
- `docs/AGENT_SECURITY.md`
- `docs/AGENT_TOOLS.md`
- `docs/GO_GATEWAY.md`
- `docs/AGENT_HARNESS.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/specs/execution/frontend_enhancement_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`

### Baseline (wichtig)

- Aktuell existiert noch keine Control-Surface im Code:
  - kein `src/app/control/*`
  - kein `src/features/control/*`
- Bestehende, verifizierte Sicherheitsbasis:
  - Rollenmodell `viewer | analyst | trader | admin`
  - zentrale API-Gates/Headers in `src/proxy.ts`
  - bestehende Admin-Role-Verwaltung in `src/app/api/admin/users/route.ts`
- Ziel-Aufrufkette bleibt verbindlich:
  - `UI -> Next BFF -> Go Gateway -> Downstream Services`

---

## 1. Offene Deltas

### A. Entry Points und Routing

- [ ] **AC1** `TradingHeader` um Control-Entry erweitern (neben Map, klare Label/Icon-Semantik)
- [ ] **AC2** `AgentChatPanel` um sekundaeren Control-Entry erweitern (Settings/Toolbar, Deep-Link-faehig)
- [ ] **AC3** Route-Shell unter `src/app/control/*` anlegen (page/layout + top nav)
- [ ] **AC4** URL als Source-of-Truth fuer Subtabs implementieren (reload-stabil, deep-link-stabil)

### B. Control IA und Subtabs (v1 read-only first)

- [ ] **AC5** Overview Tab mit Runtime-/Health-Summary umsetzen (SSE, Memory/KG, Security posture)
- [ ] **AC6** Sessions Tab mit lifecycle Sicht umsetzen (status, filter, token pressure, drilldown)
- [ ] **AC7** Tool Events Tab mit collapsible timeline umsetzen (running/success/error, duration, trace)
- [ ] **AC8** Memory + KG/Context Tabs mit sichtbaren Layer-/Degradation-Signalen umsetzen
- [ ] **AC9** Security Tab mit blocked/approved Events, posture trend und trust-indikatoren umsetzen
- [ ] **AC10** Skills/Agents/Evals Tabs als v1 observability surfaces liefern (discover/registry/status)

### C. BFF/API Contract und Datenpfade

- [ ] **AC11** Control-BFF Endpunkte unter `/api/control/*` anlegen (overview, sessions, tool-events, memory, kg-context, security, skills, agents, evals)
- [ ] **AC12** Request-IDs durchgaengig propagieren (`X-Request-ID`) und in Responses rueckgeben
- [ ] **AC13** no-store + klare Fehler-/Degradation-Antwortform fuer Control-Endpunkte standardisieren
- [ ] **AC14** Control-Endpunkte strikt an Gateway-bound Pfade binden (kein Browser-Direktpfad zu Tool/Runtime)

### D. RBAC, Action-Klassen, Approval

- [ ] **AC15** Action-Klassen technisch verankern (`read-only`, `bounded-write`, `approval-write`, `forbidden`)
- [ ] **AC16** Mindestrollen pro Action gemaess `FRONTEND_CONTROL.md` v1 Matrix serverseitig erzwingen
- [ ] **AC17** bounded-write Aktionen im UI explizit markieren und auf enge Allowlist begrenzen
- [ ] **AC18** approval-write Flow fuer kritische Aktionen implementieren (confirm + backend second check + expiry)
- [ ] **AC19** `forbidden`-Aktionen hart blocken (insb. direkte Trading-Mutationen aus Control)

### E. Auditierbarkeit und Security Hardening (Control-spezifisch)

- [ ] **AC20** Audit-Felder fuer mutierende Control-Actions erzwingen (`requestId`, `actorUserId`, `role`, `decisionId`, `ts`, plus target)
- [ ] **AC21** Security-Ereignisse klar trennen: general platform signals vs control action signals
- [ ] **AC22** Operator-taugliche Fehlerpfade bereitstellen (keine silent failures, kein full-page crash)
- [ ] **AC23** Control-spezifische Rate-Limit/Abuse-Schutzanforderungen fuer mutierende Endpunkte nachweisbar dokumentieren

### F. Tenant/Workspace Vorbereitung (v1 -> v2)

- [ ] **AC24** v1 actor-scoping in allen Control-Endpunkten nachweisbar umsetzen (keine unautorisierte Cross-Scope Sicht)
- [ ] **AC25** v2 Hook vorbereiten: optionale `workspaceId` Weitergabe im Contract und Audit-Feldern (noch nicht global verpflichtend)

---

## 2. Verify-Gates

- [ ] **AC.V1** Header-Entry funktioniert (`TradingHeader` -> `/control/*`) ohne Bruch bestehender Navigation
- [ ] **AC.V2** Chat-Entry funktioniert (`AgentChatPanel` -> `/control/*`) inkl. Deep-Link auf Subtabs
- [ ] **AC.V3** Subtab-Routing bleibt bei Reload stabil und ist direkt teilbar (URL truth)
- [ ] **AC.V4** Overview/Sessions/Tool-Events zeigen lauffaehige read-only Daten inklusive Fehler-/Leerlaufzustand
- [ ] **AC.V5** Memory/KG Context zeigt Layer/Degradation sichtbar (keine stillen Fallbacks)
- [ ] **AC.V6** Security Tab zeigt blocked/approved/policy-signale nachvollziehbar
- [ ] **AC.V7** Kein browser-direkter Tool-Wirkpfad vorhanden (nur `UI -> BFF -> Gateway`)
- [ ] **AC.V8** Action-Klassen im UI sichtbar und serverseitig erzwungen (inkl. forbidden hard-block)
- [ ] **AC.V9** approval-write Aktion braucht explizite Freigabe und erzeugt vollstaendigen Audit-Record
- [ ] **AC.V10** Trader/Admin sensitive Actions sind rollenrichtig begrenzt; Viewer kann keine mutierenden Flows ausfuehren
- [ ] **AC.V11** Control-Endpunkte liefern konsistente Fehlerstruktur + `X-Request-ID`
- [ ] **AC.V12** Tenant/Workspace-v1 Schutz: keine Cross-Scope Daten ohne Berechtigung sichtbar

---

## 3. Evidence Requirements

- Screenshot/Recording fuer AC.V1-AC.V6 (Navigation, Subtabs, Datenzustand, Fehlerzustand)
- Technischer Nachweis fuer AC.V7 (Request-Trace/Codepfad, keine Browser-Direktmutation)
- Testnachweis fuer AC.V8-AC.V10 (Rollenmatrix + Action-Klassen + Approval/Forbidden)
- API Contract Samples fuer `/api/control/*` (happy path + error + degraded)
- Audit-Beispiele fuer mutierende Actions mit Pflichtfeldern (`requestId`, `actorUserId`, `decisionId`, `ts`)
- Kurzer Nachweis `v1 actor scope` und `v2 workspaceId hook` (AC24/AC25)
- Referenzabgleich:
  - `docs/FRONTEND_CONTROL.md` (Entry Points, IA, Matrix)
  - `docs/AGENT_SECURITY.md` / `docs/GO_GATEWAY.md` (Policy- und Gateway-Boundary)

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/execution/frontend_enhancement_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/FRONTEND_CONTROL.md`
