# Frontend Components, Workbench Surfaces & UI References

> **Stand:** 07. Maerz 2026
> **Zweck:** Sammeldokument fuer konkrete UI-Surfaces, Component-Familien, Dashboard-/Workbench-Patterns und externe Frontend-Referenzen.
> **Status:** Ziel-Dokument im Aufbau. Dient als kuenftige Heimat fuer frontendnahe Teile aus `docs/specs/ERRORS.md` Sek. 23 sowie fuer weitere UI-Referenzen aus Agent-, Memory- und Dashboard-Themen.
> **Nicht dieses Dokuments:** Keine normative Frontend-Gesamtarchitektur, keine Agent- oder Memory-Verfassung, keine Design-System-Bibel.

---

## 0. Abgrenzung

Der empfohlene Schnitt ist:

- `docs/specs/FRONTEND_ARCHITECTURE.md`
  - Routing, Shell, State, Datenfluss, API-Wege, Surface-Grenzen
- `docs/FRONTEND_COMPONENTS.md`
  - konkrete UI-Surfaces, Komponentenfamilien, Workbench-Patterns,
    Design-to-code-/UI-Tooling-Entscheidungen und externe UI-Referenzen
- `docs/AGENT_ARCHITECTURE.md`
  - Rollen, Capability-Grenzen, Agent-Verhalten
- `docs/MEMORY_ARCHITECTURE.md`
  - semantische Bedeutung von Memory-/KG-/Overlay-Surfaces

---

## 1. Warum dieses Dokument existiert

Bestimmte Inhalte aus `ERRORS.md` sind klar frontendnah, aber keine Error-/Observability-Spec:

- Agent-Workbench-Referenzen
- Dashboard- und Control-Room-Muster
- graphische Knowledge-/Memory-Surfaces
- Dokumenten-/Research-Workspaces
- Chat-/Tool-Output-Komponenten

Wenn diese Referenzen in `ERRORS.md`, `AGENT_ARCHITECTURE.md` oder `FRONTEND_ARCHITECTURE.md` verteilt bleiben, gehen konkrete UI-Ideen leicht verloren oder vermischen sich mit eigentlichen Architekturregeln.

---

## 2. Grundsatz

**Aladdin-Gap (Drawing Persistence):** Drawing Objects in DB persistieren. Keine externe OSS-Lib; Prisma-Schema erweitern. Priorität: Niedrig.

Alle hier genannten Produkte, Frameworks und UIs sind **Optionen / Referenzen / Pattern-Quellen**.
Sie sind **keine** automatische Produktentscheidung fuer `tradeview-fusion`.

Tool- und Library-Namen sollen bewusst erhalten bleiben, damit spaetere Evaluierungen moeglich bleiben, auch wenn die finale Implementierung projektspezifisch erfolgt.

---

## 3. Kandidaten aus `ERRORS.md` Sektion 23

### 3.1 `Agent Zero`

Rolle als Referenz:

- Tool-orientierte Agent-Workbench
- Terminal-/Execution-Flaechen
- Skill-/Tool-Orchestrierung
- experimentelle Agent-Surface

Fuer `tradeview-fusion` interessant als:

- Pattern fuer agentische Power-User-Surfaces
- Inspiration fuer Debug-/Execution-Panels
- Referenz fuer "chaotische" Out-of-Bounds-Agent-Aufgaben ausserhalb des Trading-Kerns

Nicht uebernehmen als:

- komplette Blackbox-UI
- direkte Host-Ausfuehrung ohne Sandbox

### 3.2 `Perplexica`

Rolle als Referenz:

- Search-/Research-UI
- Suchergebnis-Layout
- Self-hosted Recherche-Workbench

Fuer `tradeview-fusion` interessant als:

- Referenz fuer News-/Research-Surfaces
- Pattern fuer Web-Recherche mit Quellenliste, Antwortblock und Folgeaktionen

### 3.3 `Mission Control`

Rolle als Referenz:

- Agent-Orchestrierungs-Dashboard
- Task-/Pipeline-/Logs-/Memory-Monitoring

Fuer `tradeview-fusion` interessant als:

- Referenz fuer Agent-Operations-Dashboards
- Control-Room-Ansicht fuer Agent-Laufzeiten, States, Tokens, Errors, Jobs

### 3.4 `GitNexus Web`

Rolle als Referenz:

- graphische Exploration fuer Code-/Knowledge-Graphen
- interaktive Node-/Edge-Navigation

Fuer `tradeview-fusion` interessant als:

- UI-Referenz fuer Frontend User-KG
- Graph-Exploration fuer Domain-KG, Claim/Evidence, Verlinkungen

### 3.5 `Paperless-ngx`

Rolle als Referenz:

- Dokumenten-Workspace
- OCR-/Index-/Archiv-Surface
- Review-/Tagging-/Source-Flaechen

Fuer `tradeview-fusion` interessant als:

- DMS-/Research-Workspace-Referenz
- Pattern fuer Quellenablage, Dokumentensichtung und RAG-nahe Oberflaechen

### 3.6 `Tambo`

Rolle als Referenz:

- interaktive Agent-Output-Komponenten
- dynamische Tool-Output-Renderings
- Chat-nahe Workbench-Komponenten

Fuer `tradeview-fusion` interessant als:

- Referenz fuer Agent Playground
- Pattern fuer strukturierte Output-Karten, Status-Widgets und Tool-Result-Surfaces

### 3.7 `Vercel AI SDK`

Rolle als Referenz:

- Chat-/Streaming-UI-Schicht
- `useChat`-artige Netzwerkschicht fuer interaktive Agent-Surfaces

Fuer `tradeview-fusion` interessant als:

- moegliche Option fuer agentische Chat-/Tool-Surfaces
- Referenz fuer Streaming + State-Handling auf React-Seite

### 3.8 Design-to-Code und read-only Agent-UI-Tooling

Aus der frueheren Design-Tooling-Notiz bleiben fuer dieses Dokument vor allem die
Frontend-nahen Produktionsregeln relevant:

| Tool / Pattern | Rolle fuer `tradeview-fusion` | Wo sinnvoll | Wo nicht |
|---|---|---|---|
| **Pencil.dev** | Component-/Screen-Design mit strukturierter Agent-Uebergabe | Auth-, Settings-, Admin-, statische Workspace-Raender | nicht fuer Trading-Chart, GeoMap-Rendering oder datengetriebene Viz-Kerne |
| **Figma MCP** | stabile Design-to-code-Bridge ohne UI-Neubau im Prompt | Layout-, Spacing- und System-Komponenten | nicht als Ersatz fuer Frontend-Architektur oder API-Grenzen |
| **Tambo** | read-only Agent-UI / dynamische Output-Komponenten | Agent Playground, Analyse-Karten, Monitor-/Dashboard-Surfaces | nicht fuer Order-Placement, Wallet-/Account-Mutationen oder andere schreibende Finanzaktionen |

Arbeitsregeln:

- Design-Tools kommen **nach** sauberer Frontend-/Gateway-Architektur, nicht davor.
- Programmatische Viz-Surfaces bleiben programmatisch: `lightweight-charts`,
  GeoMap/D3, Analytics-Charts.

### 3.9 Chart-Plugins (LWC)

| Ressource | Rolle | Link |
|-----------|-------|------|
| **LWC Plugin Examples** | Volume Profile, Rectangle, Trend Line, Vertical Line, Session Highlighting — offizielle TradingView-Dokumentation | [Plugin Examples](https://tradingview.github.io/lightweight-charts/plugin-examples/) |
- AI-generierte UI darf im Trading-Kontext nur read-only oder assistiv sein;
  finanzielle Mutation bleibt in deterministischen, explizit getesteten
  Komponenten.

---

## 4. Verknuepfung mit bestehenden Fachdocs

Diese Referenzen muessen spaeter mit bestehenden Domaenen-Dokumenten gekoppelt werden:

- `docs/specs/FRONTEND_ARCHITECTURE.md`
  - welche Surfaces es gibt und wie sie geroutet werden
- `docs/AGENT_ARCHITECTURE.md`
  - welche Agent-Rollen eine UI-Flaeche brauchen
- `docs/MEMORY_ARCHITECTURE.md`
  - wie Memory-/KG-/Overlay-Surfaces semantisch eingebettet sind
- `docs/CONTEXT_ENGINEERING.md`
  - welche Kontexte in welchen UI-Surfaces sichtbar und bearbeitbar sein muessen

---

## 5. Was hier bewusst nicht hinein gehoert

- globale Frontend-Routing- oder State-Architektur
- Backend-/IPC-/Transport-Entscheidungen
- Error-/Observability-Normen
- Security-/Policy-Verfassung
- Future-Radar wie `WebTransport`, `eBPF`, `Nix`, `Confidential Computing`

Diese Themen haben andere Heimatdokumente.

---

## 6. Erste spaetere Ausbaurichtung

Dieses Dokument kann spaeter konkret gegliedert werden in:

- Research Home
- Trading Workspace
- GeoMap Surfaces
- Agent Playground / Mission Control
- Knowledge Graph / Memory Surfaces
- Document & Source Review
- Alert / Timeline / Event Intelligence Widgets

---

## 7. Quellen

- `docs/specs/ERRORS.md` Sek. 23
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/AGENT_ARCHITECTURE.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/archive/FRONTEND_DESIGN_TOOLING.md`
