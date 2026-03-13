# Frontend Components, Workbench Surfaces & UI References


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


## 3. Referenzen (nicht Chat-Core)

Die tiefen Chat-UI-Referenzen sind in `docs/frontend_chat_ui.md` konsolidiert
und werden hier bewusst nicht doppelt gefuehrt.

### 3.1 `Mission Control`

Rolle als Referenz:

- Agent-Orchestrierungs-Dashboard
- Task-/Pipeline-/Logs-/Memory-Monitoring

Fuer `tradeview-fusion` interessant als:

- Referenz fuer Agent-Operations-Dashboards
- Control-Room-Ansicht fuer Agent-Laufzeiten, States, Tokens, Errors, Jobs

### 3.2 `GitNexus Web`

Rolle als Referenz:

- graphische Exploration fuer Code-/Knowledge-Graphen
- interaktive Node-/Edge-Navigation

Fuer `tradeview-fusion` interessant als:

- UI-Referenz fuer Frontend User-KG
- Graph-Exploration fuer Domain-KG, Claim/Evidence, Verlinkungen

### 3.3 `Paperless-ngx`

Rolle als Referenz:

- Dokumenten-Workspace
- OCR-/Index-/Archiv-Surface
- Review-/Tagging-/Source-Flaechen

Fuer `tradeview-fusion` interessant als:

- DMS-/Research-Workspace-Referenz
- Pattern fuer Quellenablage, Dokumentensichtung und RAG-nahe Oberflaechen

### 3.4 `Vercel AI SDK`

Rolle als Referenz:

- Chat-/Streaming-UI-Schicht
- `useChat`-artige Netzwerkschicht fuer interaktive Agent-Surfaces

Fuer `tradeview-fusion` interessant als:

- moegliche Option fuer agentische Chat-/Tool-Surfaces
- Referenz fuer Streaming + State-Handling auf React-Seite

### 3.4a Lokaler Clone-Status (Referenzprojekte)

Die folgenden Referenzprojekte sind lokal unter `d:\tradingview-clones\_tmp_ref_review\` gespiegelt:

- `mission-control`
- `gitnexus-web`
- `paperless-ngx`

Wichtige Arbeitsnotizen dazu:

- Nur Pattern-Extraktion, kein blindes Uebernehmen kompletter UIs.
- Security/Runtime-Boundaries bleiben fuer Agent-Surfaces verpflichtend (kein unkontrollierter Host-Execution-Pfad).
- `Paperless-ngx` bleibt primaer DMS-/OCR-Patternquelle fuer Research-/Source-Surfaces.

### 3.5 Design-to-Code und read-only Agent-UI-Tooling

Aus der frueheren Design-Tooling-Notiz bleiben fuer dieses Dokument vor allem die
Frontend-nahen Produktionsregeln relevant:


| **Agent-UI Tooling (allgemein)** | read-only Agent-UI / dynamische Output-Komponenten | Agent Playground, Analyse-Karten, Monitor-/Dashboard-Surfaces | nicht fuer Order-Placement, Wallet-/Account-Mutationen oder andere schreibende Finanzaktionen |

Arbeitsregeln:

- Design-Tools kommen **nach** sauberer Frontend-/Gateway-Architektur, nicht davor.

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

-