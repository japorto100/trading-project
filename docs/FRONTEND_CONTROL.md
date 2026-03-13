# FRONTEND_CONTROL Blueprint
#
# TradeView Fusion - Control Surface (Mission Control inspired, product-safe)
#
# Stand: 13 Mar 2026

## 1) Zweck und Positionierung

Dieses Dokument definiert die Control-Flaeche fuer TradeView Fusion als
ops-/runtime-nahe Erweiterung des bestehenden Produkt-Frontends.

Wichtig:

- Kein 1:1 Port von Mission Control.
- Kein zweites, konkurrierendes Frontend.
- Ziel ist eine integrierte Control-Ebene fuer Memory/KG, Security, Sessions,
  Tool-Events, Skills und Agent Discovery.

## 2) Verbindliche Root-MD Leitplanken

Die folgenden Regeln sind fuer `Control` verpflichtend:

- `docs/GO_GATEWAY.md`
  - Go Gateway bleibt Single Entry Point fuer kernnahe Flows.
  - Browser-Default bleibt `REST + SSE`, stream-first mit kontrolliertem fallback.
- `docs/AGENT_SECURITY.md`
  - Policy before convenience.
  - Kein direkter Tool-/Storage-Zugriff aus dem Browser.
  - Auditierbare Entscheidungskette ist Pflicht.
- `docs/AGENT_HARNESS.md`
  - Runtime-Guardrails zwischen Agent-Loop und Tool/Output.
  - Constrain/Inform/Verify/Correct als Betriebsprinzip.
- `docs/AGENT_TOOLS.md`
  - Agent-UI-Surfaces bleiben read-only oder bounded-write.
  - Mutationen nur policy-gated ueber Backend.
- `docs/CONTEXT_ENGINEERING.md`
  - Kontext nur aus normalisierten Artefakten.
  - Degradation sichtbar machen (`NO_KG_CONTEXT`, `NO_VECTOR_CONTEXT`, etc.).
- `docs/MEMORY_ARCHITECTURE.md`
  - Trennung von Backend Domain-KG (shared truth) und Frontend User-KG (overlay).
  - M1/M2/M3/M4/M5 konsistent sichtbar statt implizit versteckt.

## 2.1) Ist-Zustand (TradeView Fusion, im Code verifiziert)

Dieser Abschnitt beschreibt den aktuell verifizierten Zustand, damit Control auf
Realitaet basiert (nicht auf Annahmen).

- Auth + Rollenmodell ist aktiv vorhanden:
  - `viewer | analyst | trader | admin`
  - Quellen: `src/proxy.ts`, `src/lib/auth.ts`, `src/lib/auth/runtime-flags.ts`
- API-Rollen-Gates laufen aktuell primaer im Next-Proxy:
  - methodenspezifische Regeln fuer kritische Pfade
  - 401/403 Enforcement vor Route-Handlern
- Security Header sind zentral gesetzt:
  - API-CSP (default deny), XFO, nosniff, COOP/CORP, Referrer-Policy
  - Page-CSP ueber Runtime-Flags (`off | report-only | enforce`)
  - Quelle: `src/proxy.ts`
- Request-Korrelation ist bereits angelegt:
  - `X-Request-ID` wird erzeugt/weitergereicht
  - mehrere Routen geben die ID zurueck
- Admin-Rollenverwaltung existiert bereits:
  - `src/app/api/admin/users/route.ts`
  - serverseitige Admin-Session-Pruefung
- Tenant/Workspace-Isolation als explizites Modell ist derzeit nicht durchgaengig
  sichtbar:
  - vorhanden sind user/session-scopes und fachliche `profileKey`-Scoping-Muster
  - ein konsistentes `workspaceId`-Boundary fuer alle Control-APIs ist noch nicht
    als Standard verdrahtet

Konsequenz fuer Control:

- RBAC nicht neu erfinden, sondern auf bestehendes Rollenmodell aufsetzen.
- Security Hardening in zwei Ebenen trennen:
  - global/spec (plattformweit)
  - control-spezifisch (Subtabs, Actions, Approvals, Audit-Events)

## 2.2) Mission Control als Blueprint (klarer Scope)

Mission Control dient als Blueprint fuer Informationsarchitektur, UI-Patterns und
Ops-Sichtbarkeit (Sessions, Tool-Events, Memory/KG, Security, Skills, Agents).

Fuer TradeView gilt weiterhin:

- adaptieren statt portieren
- vorhandene Auth/RBAC/Security-Mechanik respektieren
- keine Bypass-Pfade um `UI -> Next BFF -> Go Gateway -> Downstream`

## 3) Entry Points (UI)

## 3.1 Header Entry (primaer)

Control-Button im Trading Header neben Map.

Aktueller Anker:

- `src/features/trading/TradingHeader.tsx`
  - existierender Map-Link: `href="/geopolitical-map"`
  - geplanter Control-Link daneben: `href="/control"` oder externer Target-Link.

Empfohlene UX:

- Label: `Control`
- Icon: ops/monitoring nah (z. B. shield, sliders, activity)
- Verhalten:
  - intern: `Link /control`
  - optional extern (wenn Mission Control separat deployed): neues Tab
    mit klarer Kennzeichnung.

## 3.2 Chat Entry (sekundaer)

Control aus Chat-Umfeld erreichbar ueber Chat-Settings/Toolbar.

Aktuelle Basis:

- `src/features/agent-chat/AgentChatPanel.tsx` (derzeit stub)

Vorgabe:

- in Chat-Toolbar oder Settings-Menu einen klaren Action-Entry:
  - `Open Control`
  - optional direkte Deep-Links (`/control/security`, `/control/sessions`)

Hinweis:

- Chat bleibt produktnah; Control bleibt ops-nah.
- Der Chat-Einstieg darf nicht zu versteckten mutierenden Actions fuehren.

## 3.3 Map Entry (optional, nicht blockierend)

Optional ein weiterer Einstieg aus der Map-Shell.

Aktuelle Basis:

- `src/features/geopolitical/shell/MapShellHeader.tsx`

Nur optional, weil Header + Chat-Entry bereits ausreichen.

## 4) Routing und Navigationsmodell

## 4.1 Primarroute

- Neue Seite: `src/app/control/page.tsx`
- optional Layout: `src/app/control/layout.tsx`

## 4.2 Subroute-Modell

Empfohlen als tab-basierte URL-Struktur:

- `/control/overview`
- `/control/sessions`
- `/control/tool-events`
- `/control/memory`
- `/control/kg-context`
- `/control/security`
- `/control/skills`
- `/control/agents`
- `/control/evals`

Optional:

- `/control/integrations`
- `/control/workload`

## 4.3 Navigation Behavior

- URL ist source-of-truth fuer aktiven Subtab.
- harter reload darf Zustand nicht verlieren (Subtab bleibt).
- deep-link faehig aus Header und Chat.

## 5) Informationsarchitektur der Control-Page

## 5.1 Overview

Ziel:

- komprimierte Gesamtlage in einem Screen.

Inhalte:

- Runtime health (SSE, reconnects, stream age)
- Memory/KG health summary (M1-M5, freshness)
- Security posture score
- letzte Tool-Fehler / letzte Blocked-Policies
- aktive Sessions / High token usage indicator

## 5.2 Sessions

Ziel:

- Session-Lebenszyklus observierbar und steuerbar.

Mission-Control Referenzen:

- UI:
  - `_tmp_ref_review/mission-control/src/components/panels/session-details-panel.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/conversation-list.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/chat-workspace.tsx`
- API:
  - `_tmp_ref_review/mission-control/src/app/api/sessions/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/sessions/[id]/control/route.ts`

TradeView Ziele:

- Session-Liste, Filter, Status, token pressure.
- Nur erlaubte Controls (pause/terminate nur wenn policy-konform).
- Keine versteckten Kill-/mutation Aktionen.

## 5.3 Tool Events

Ziel:

- Tool-Aufrufe als zeitlicher Verlauf mit Status, Dauer und Fehlern.

Mission-Control Referenzen:

- UI:
  - `_tmp_ref_review/mission-control/src/components/chat/message-bubble.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/message-list.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/chat-workspace.tsx`
- API:
  - `_tmp_ref_review/mission-control/src/app/api/chat/messages/route.ts`
  - `_tmp_ref_review/mission-control/src/lib/event-bus.ts`

TradeView Ziele:

- Collapsible tool rows.
- status: running/success/error.
- duration + output snippet.
- full audit trace id verlinkbar.

## 5.4 Memory

Ziel:

- Datei-/Dokumenten-nahe Memory Inspection mit Health/Pipeline Sicht.

Mission-Control Referenzen:

- UI:
  - `_tmp_ref_review/mission-control/src/components/panels/memory-browser-panel.tsx`
  - `_tmp_ref_review/mission-control/src/components/panels/memory-graph.tsx`
- API:
  - `_tmp_ref_review/mission-control/src/app/api/memory/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/memory/health/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/memory/graph/route.ts`

TradeView Ziele:

- clear split: operational memory files vs platform context health.
- read-only default.
- edit/write nur bounded-write und explizit markiert.

## 5.5 KG + Context

Ziel:

- Sichtbar machen, welche Kontextschichten tatsaechlich aktiv waren.

Inhalte:

- M1/M2a/M2b/M3/M4 Verfuegbarkeit
- freshness/staleness
- merge mode (intersection/union/priority)
- degradation flags

Root-MD Bindung:

- `docs/CONTEXT_ENGINEERING.md`
- `docs/MEMORY_ARCHITECTURE.md`

## 5.6 Security

Ziel:

- Security posture, events und Agent trust zentral sehen.

Mission-Control Referenzen:

- UI:
  - `_tmp_ref_review/mission-control/src/components/panels/security-audit-panel.tsx`
  - `_tmp_ref_review/mission-control/src/components/modals/exec-approval-overlay.tsx`
- API:
  - `_tmp_ref_review/mission-control/src/app/api/security-audit/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/exec-approvals/route.ts`

TradeView Ziele:

- posture score + trend
- auth/rate-limit/injection signals
- blocked vs approved actions
- trust view pro agent

## 5.7 Skills

Ziel:

- Skill-Lifecycle: discover, scan, install, inspect.

Mission-Control Referenzen:

- UI:
  - `_tmp_ref_review/mission-control/src/components/panels/skills-panel.tsx`
- API:
  - `_tmp_ref_review/mission-control/src/app/api/skills/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/skills/registry/route.ts`

TradeView Ziele:

- installed/registry split
- security-scan status sichtbar
- install target explizit
- kein silent install

## 5.8 Agents (inkl. Discovery)

Ziel:

- Agent Registry + Discovery + Kommunikationssicht.

Mission-Control Referenzen:

- UI:
  - `_tmp_ref_review/mission-control/src/components/panels/agent-squad-panel.tsx`
  - `_tmp_ref_review/mission-control/src/components/panels/agent-detail-tabs.tsx`
  - `_tmp_ref_review/mission-control/src/components/panels/agent-comms-panel.tsx`
  - `_tmp_ref_review/mission-control/src/components/panels/local-agents-doc-panel.tsx`
- API:
  - `_tmp_ref_review/mission-control/src/app/api/agents/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/agents/sync/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/local/agents-doc/route.ts`

TradeView Ziele:

- discovery source sichtbar (`local`, `registry`, `gateway`)
- per-agent capabilities sichtbar (read-only vs bounded-write vs approval-write)
- comms feed mit klarer provenance.

## 5.9 Evals

Ziel:

- dauerhafte Qualitäts-/Drift-Sicht als Gate.

Mission-Control Referenzen:

- UI:
  - `_tmp_ref_review/mission-control/src/components/panels/security-audit-panel.tsx`
    (agent eval dashboard block)
- API:
  - `_tmp_ref_review/mission-control/src/app/api/agents/evals/route.ts`

TradeView Ziele:

- convergence, drift alerts, layer scores.
- release gate reference fuer agent changes.

## 6) Uebernahme-Matrix (deterministisch)

## 6.1 Adopt (direkt uebernehmen)

- session list + status patterns
- tool event collapsible rendering
- security posture and timeline patterns
- skills installed/registry dual-tab pattern
- memory browser split views (files/graph/health/pipeline)

## 6.2 Adapt (mit Anpassung)

- agent discovery flows (an eigene sources koppeln)
- memory graph visuals (an eigenes KG schema koppeln)
- session controls (nur policy-konforme actions)
- eval scoring model (an eigene metrics koppeln)

## 6.3 Avoid (nicht uebernehmen)

- OpenClaw-spezifische assumptions als harte produktweite Defaults
- ungefilterte admin-heavy panels ohne Produktbezug
- security-relevante shortcuts, die Gateway/BFF umgehen

## 7) Konkrete Datei-Targets in TradeView Fusion

## 7.1 Header + Navigation

- `src/features/trading/TradingHeader.tsx`
  - Control-Button neben Map.
- `src/features/geopolitical/shell/MapShellHeader.tsx`
  - optionaler Control quick action.

## 7.2 Chat Entry

- `src/features/agent-chat/AgentChatPanel.tsx`
  - Open-Control Action im Chat-Settings-Menu.

## 7.3 Neue Control Surface

- `src/app/control/page.tsx`
- `src/features/control/ControlPage.tsx`
- `src/features/control/components/ControlTopNav.tsx`
- `src/features/control/components/subtabs/`:
  - `ControlOverviewTab.tsx`
  - `ControlSessionsTab.tsx`
  - `ControlToolEventsTab.tsx`
  - `ControlMemoryTab.tsx`
  - `ControlKgContextTab.tsx`
  - `ControlSecurityTab.tsx`
  - `ControlSkillsTab.tsx`
  - `ControlAgentsTab.tsx`
  - `ControlEvalsTab.tsx`

## 7.4 BFF/API Pfade (TradeView)

Mindestens:

- `src/app/api/control/overview/route.ts`
- `src/app/api/control/sessions/route.ts`
- `src/app/api/control/tool-events/route.ts`
- `src/app/api/control/memory/route.ts`
- `src/app/api/control/kg-context/route.ts`
- `src/app/api/control/security/route.ts`
- `src/app/api/control/skills/route.ts`
- `src/app/api/control/agents/route.ts`
- `src/app/api/control/evals/route.ts`

Alle Endpunkte folgen:

`UI -> Next BFF -> Go Gateway -> downstream services`

## 8) Interaktionsregeln, Action-Klassen und RBAC (Control v1)

## 8.1) Action-Klassen

- `read-only`: reine Ansicht/Abfrage, keine Zustandsaenderung.
- `bounded-write`: begrenzte, klar definierte Mutation mit engen Guardrails.
- `approval-write`: Mutation nur mit explizitem Approval-Flow.
- `forbidden`: nicht in Control erlaubt (auch wenn technisch moeglich).

## 8.2) General Security vs Control-Security

General (plattformweit, specs/security):

- Auth, Session, globale Header/CSP, CORS, zentrale Role-Gates.
- Grundlage dafuer liegt bereits im Ist-Zustand vor (siehe 2.1).

Control-spezifisch (dieses Dokument):

- welche Subtab-Action welche Klasse hat
- welche Rolle mindestens noetig ist
- welcher Backend-Guard + Audit-Felder verpflichtend sind

## 8.3) Control v1 Minimal-Matrix (Ist-Zustand einbezogen)

| Action | Klasse | Min Rolle | Backend-Guard (Ist + Soll) | Pflicht-Audit-Felder |
|---|---|---|---|---|
| Overview/Sessions/Tool-Events/Memory/KG/Security/Skills/Agents/Evals ansehen | read-only | viewer | `GET /api/control/*`, Auth + Proxy-Role-Gate, no-store | `requestId`, `actorUserId`, `role`, `tab`, `ts` |
| Session-Filter/Sort/Drilldown | read-only | viewer | rein query-basiert, keine Mutation | `requestId`, `actorUserId`, `sessionId?`, `ts` |
| Agent/Skill Discovery Sync anstossen | bounded-write | analyst | `POST /api/control/agents/sync` bzw. `.../skills/sync`, Rate-Limit, Policy-Check | `requestId`, `actorUserId`, `role`, `action`, `target`, `decisionId`, `ts` |
| Session pause/resume (falls eingefuehrt) | bounded-write | trader | explizite Allowlist pro Transition, Policy-Engine im Gateway | `requestId`, `actorUserId`, `sessionId`, `from`, `to`, `decisionId`, `ts` |
| Session terminate/force-stop | approval-write | admin | mandatory Approval-Flow + second check serverseitig | `requestId`, `actorUserId`, `approverId`, `sessionId`, `reason`, `decisionId`, `ts` |
| Exec approval erteilen/ablehnen | approval-write | admin | dedicated approval endpoint, replay-protection, expiry | `requestId`, `actorUserId`, `approvalId`, `decision`, `expiresAt`, `ts` |
| User-Rollen aendern | forbidden (in Control) | - | bleibt exklusiv in Admin-Flow (`/api/admin/users`) | eigener Admin-Audit-Stream |
| Trading-Orders direkt aus Control mutieren | forbidden (in Control) | - | keine direkten Order-Write-Actions im Control-UI | Sicherheitsverletzung falls versucht |

## 8.4) Tenant/Workspace fuer Control (Ist -> Zielbild)

Ist:

- user/session-basiert + fachliches `profileKey` Scoping in Teilbereichen.
- kein durchgaengiger `workspaceId`-Vertrag fuer alle Control-Routen.

Control v1:

- mindestens actor-basiertes Scoping durchsetzen.
- keine Cross-Account/Cross-Scope Uebersichten ohne explizite Berechtigung.

Control v2 (empfohlen):

- `workspaceId` als Pflichtfeld in Control-BFF/Gateway-Kontrakten.
- Audit immer mit `workspaceId` (und optional `tenantId`) anreichern.

## 9) UX-Regeln

- Keine Navigation-Fallen: von jedem Subtab zurueck zu Trading/Map/Chat.
- Keine modal-heavy Kaskaden fuer Kernaktionen.
- Degradation sichtbar statt silent fallback.
- Fehler lokal anzeigen (kein full-page crash).
- Control darf den Hauptworkflow nicht blockieren.

## 10) Verify Gates (Control)

- CV1 Header-Entry funktioniert (`TradingHeader` -> `Control` Route).
- CV2 Chat-Entry funktioniert (`AgentChatPanel` Settings -> `Control` Route).
- CV3 Subtab Routing ist deep-link-faehig.
- CV4 Security- und Tool-Events sind auditierbar dargestellt.
- CV5 Memory/KG Degradation Flags sind sichtbar.
- CV6 Keine browser-direkten Tool-Wirkpfade.
- CV7 bounded-write und approval-write klar unterschieden.
- CV8 Skills/Agent Discovery zeigen source + security status.

## 11) Delivery Reihenfolge (empfohlen)

Phase 1:

- Header Entry, Chat Entry, Control shell, Overview/Sessions/Security.

Phase 2:

- Tool Events, Memory, KG Context.

Phase 3:

- Skills, Agent Discovery, Evals, Integrations/Workload optional.

## 12) Nicht-Ziele

- Kein vollstaendiger Mission-Control Port.
- Kein Parallel-Backend fuer identische Aufgaben.
- Kein Aufweichen von Security/Harness/Context Regeln zugunsten schneller UI.

