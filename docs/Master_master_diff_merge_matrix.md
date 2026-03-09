# MASTER-MASTER DIFF / MERGE MATRIX 2026

## 0. Zweck

Dieses Dokument ist die operative Folgearbeit zum `master_master_architecture_2026.md`.
Es beantwortet nicht mehr die Frage **"wie sieht die Zielarchitektur aus?"**, sondern die Frage:

> **Welche bestehenden Dokumente bleiben maßgeblich, welche Inhalte werden in den Master-Master hochgezogen, welche bleiben spezialisierte Fach-MDs, und wo sollten neue Zieldokumente entstehen?**

Es dient damit als **Transfer- und Konsolidierungsmatrix**.

---

## 1. Arbeitsregeln für den Merge

1. **Nicht alles in den Master-Master kopieren.**  
   Der Master-Master bleibt die normative Zielarchitektur; Spezialisierung bleibt in Fach-MDs.

2. **Verträge und Grundprinzipien nach oben ziehen, Implementierungsdetails unten lassen.**  
   Beispiel: Merge-/Overlay-Regeln gehören nach oben; konkrete Engine-Wahlen bleiben in Fachdocs oder Execution-Plänen.

3. **Simulation, Belief und Wahrheit strikt trennen.**  
   Alles, was hypothetisch ist, darf den kanonischen Wissensraum nicht direkt verunreinigen.

4. **Go bleibt Control Plane.**  
   Python und Rust dürfen rechnen; Go besitzt Policy, Gateway, Audit, Scheduling und kontrollierte Writes.

5. **Das Gespräch selbst ist Quelle.**  
   Dieses Mapping berücksichtigt nicht nur die MDs, sondern auch die im Dialog explizit erarbeiteten Designentscheidungen.

---

## 2. Empfohlener Soll-Dokumentenschnitt

### 2.1 Normative Kern-Dokumente

Diese Dokumente sollten langfristig die eigentliche Verfassung des Systems bilden:

- `master_master_architecture_2026.md` — Gesamtsynthese und normative Zielarchitektur
- `ARCHITECTURE.md` — kompakter technischer Kern / produktionsnahe Architekturformel
- `API_CONTRACTS.md` — formale Schnittstellen und Verträge
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` — Wissensraum-, Overlay-, Claim- und Branch-Verträge
- `EXECUTION_PLAN.md` — Roadmap, Gates, Realisierungspfad
- `AUTH_SECURITY.md` — Auth, Policy, Security und Trust Boundaries
- `ERRORS.md` — Error-/Observability-/Operational-Standard

### 2.2 Spezialisierte Fach-Dokumente, die bestehen bleiben sollten

- `GAME_THEORY.md`
- `GEOPOLITICAL_MAP_MASTERPLAN.md`
- `GEOPOLITICAL_OPTIONS.md`
- `CLAIM_VERIFICATION_ARCHITECTURE.md`
- `MEMORY_ARCHITECTURE.md`
- `CONTEXT_ENGINEERING.md`
- `AGENT_ARCHITECTURE.md`
- `AGENT_TOOLS.md`
- `INDICATOR_ARCHITECTURE.md`
- `Portfolio-architecture.md`
- `UNIFIED_INGESTION_LAYER.md`
- `RUST_LANGUAGE_IMPLEMENTATION.md`
- `FRONTEND_ARCHITECTURE.md`
- `FRONTEND_DESIGN_TOOLING.md`
- `KG_ONTOLOGY.md`
- `POLITICAL_ECONOMY_KNOWLEDGE.md`
- `ENTROPY_NOVELTY.md`
- `GEOCODING_STRATEGY.md`
- `PMTILES_CONTRACT.md`
- `GEOMAP_VERIFY.md`
- `FRONTEND_COMPONENTS.md` *(neu empfohlen; fuer konkrete UI-Surfaces und Component-Familien)*

### 2.3 Arbeits-, Pilot-, Migrations- und Randdokumente

Diese Dokumente bleiben wichtig, sind aber **nicht** die normative Verfassung:

- `execution_mini_plan.md`
- `execution_mini_2.md`
- `execution_mini_plan_3.md`
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`
- `SYSTEM_STATE.md`
- `UIL_ROUTE_MATRIX.md`
- `CAPABILITY_REGISTRY.md`
- `PROVIDER_LIMITS.md`
- `REFERENCE_SOURCE_STATUS.md`
- `ROLLOUT_GATES.md`
- `PARTNER_BOUNDARY.md`
- `PAYMENT_ADAPTER.md`
- `PLUGIN_PILOT.md`
- `ERRORS2.md`
- `TOOL_SEARCH.md`
- `plan-modus-agent.txt`

### 2.4 Neue Zieldokumente, die sich jetzt lohnen würden

Diese neuen Dokumente würden das System deutlich lesbarer machen:

- `RETRIEVAL_AND_DISCOVERY_ARCHITECTURE.md`
- `SIMULATION_AND_GEOMAP_ARCHITECTURE.md`
- `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`
- `SOURCE_CONFIDENCE_AND_PROMOTION_POLICY.md`
- `SCENARIO_SNAPSHOT_AND_BRANCHING_SPEC.md`
- `FRONTEND_COMPONENTS.md`

---

## 3. Merge-Aktionen pro Quelle

Legende:

- **PROMOTE** = Kerninhalte in Master-Master oder normative Kerndocs hochziehen
- **RETAIN** = als eigenständiges Fachdokument bestehen lassen
- **SPLIT** = Teile hochziehen, Teile lokal belassen
- **REFERENCE** = nur referenzieren, nicht umformulieren
- **ARCHIVE-LATER** = später evtl. in anderes Doc integrieren / ablösen

### 3.1 Kernarchitektur / Verträge / Zustand

| Quelle | Primäre Rolle | Aktion | Was hochziehen | Was lokal lassen | Ziel(e) |
|---|---|---:|---|---|---|
| `ARCHITECTURE.md` | komprimierte technische Zielarchitektur | SPLIT | Architekturformel, Sync/Async-Prinzipien, Go→Python/Rust-Grenzen | konkrete produktionsnahe Kürze als Referenzarchitektur | `master_master_architecture_2026.md`, `API_CONTRACTS.md` |
| `EXECUTION_PLAN.md` | Umsetzungs- und Gate-Plan | SPLIT | Phasenlogik, Phase-17-Simulation, Priorisierung, Gate-Denken | detaillierte Checklisten und Delivery-Reihenfolge | `master_master_architecture_2026.md`, `SIMULATION_AND_GEOMAP_ARCHITECTURE.md` |
| `SYSTEM_STATE.md` | IST-vs.-SOLL-Korrekturen | SPLIT | aktuelle Defizite und Korrekturrichtung | operative Lückenliste | `EXECUTION_PLAN.md`, `ARCHITECTURE.md` |
| `API_CONTRACTS.md` | formale Schnittstellen | PROMOTE | Contract-first-Prinzip, Gateway-Grenzen, typed contracts | konkrete Endpoint-Spezifikation | `master_master_architecture_2026.md`, `API_CONTRACTS.md` |
| `AUTH_SECURITY.md` | Auth- und Security-Modell | PROMOTE | 3-Schichten-Modell, Policy-Grenzen, Trust Boundaries | Implementierungsdetails von Passkeys/Stacks | `master_master_architecture_2026.md`, `AUTH_SECURITY.md` |
| `CAPABILITY_REGISTRY.md` | Capability-Katalog | SPLIT | Registry-Prinzip, Capability Discovery, Tool/Agent-Kopplung | konkrete Schema-/Implementierungsdetails | `master_master_architecture_2026.md`, `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `UIL_ROUTE_MATRIX.md` | Next→Go→Python-Regelwerk | SPLIT | Route-Prinzipien, kein Browser→Python, Policy Metadata | konkrete Routentabelle | `ARCHITECTURE.md`, `API_CONTRACTS.md` |
| `ROLLOUT_GATES.md` | reversible Rollouts | RETAIN | Rollout-Gates als Prinzip erwähnen | KPI-/Rollback-Schwellen konkret | `EXECUTION_PLAN.md`, `ERRORS.md` |
| `ERRORS.md` | error/observability/betriebsnorm | SPLIT | Error Taxonomy, Route Bubble, Action Pattern, traces, structured logging; normative Resilience-Prinzipien | konkrete Lib-Empfehlungen / Low-Level-Muster; Frontend-Workbench-Referenzen; Future-/Radar-Themen | `master_master_architecture_2026.md`, `ERRORS.md`, `FRONTEND_COMPONENTS.md`, `Advanced-architecture-for-the-future.md` |
| `ERRORS2.md` | alternative Fehler-/Observability-Notizen | REFERENCE | nur wenn Ergänzung nötig | bleibt Vergleichs-/Backup-Material | `ERRORS.md` |
| `FRONTEND_ARCHITECTURE.md` | Frontend-Grundgerüst | SPLIT | lokale User-Intelligence-Surface, UI-Schichten, Projektstrukturprinzip | Ordnerdetails / konkrete UI-Probleme | `master_master_architecture_2026.md`, `SIMULATION_AND_GEOMAP_ARCHITECTURE.md` |

### 3.2 GeoMap / Simulation / Geo-Infrastruktur

| Quelle | Primäre Rolle | Aktion | Was hochziehen | Was lokal lassen | Ziel(e) |
|---|---|---:|---|---|---|
| `GEOPOLITICAL_MAP_MASTERPLAN.md` | GeoMap-Zielbild | PROMOTE | GeoMap als räumliche Intelligence Surface, Scope-Grenzen, Kartenmodi | library-spezifische Breite, optionale spätere Pfade | `master_master_architecture_2026.md`, `SIMULATION_AND_GEOMAP_ARCHITECTURE.md` |
| `GEOPOLITICAL_OPTIONS.md` | D3-/Geo-Module-Roadmap | SPLIT | welche Visual-Familien nötig sind, Fokus/Simulationsmodus | konkrete Package-Listen und Roadmap-Tiefen | `SIMULATION_AND_GEOMAP_ARCHITECTURE.md`, `FRONTEND_DESIGN_TOOLING.md` |
| `GAME_THEORY.md` | fachlicher Simulationskern | PROMOTE | drei Weltbilder, Simulationsfamilien, spieltheoretische Schichten, Übergang zu Control Theory | lange fachliche Ausführungen, Buch-/Autor-Nähe | `master_master_architecture_2026.md`, `SIMULATION_AND_GEOMAP_ARCHITECTURE.md` |
| `CLAIM_VERIFICATION_ARCHITECTURE.md` | Belief-/Claim-Pipeline | PROMOTE | decomposer→retrieval→verifier→belief-state→impact | papernahe Details und Taxonomie-Tiefe | `master_master_architecture_2026.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `SOURCE_CONFIDENCE_AND_PROMOTION_POLICY.md` |
| `GEOCODING_STRATEGY.md` | Geocoding- und Provider-Kette | RETAIN | Geocoding als Provider-Abstraktion kurz erwähnen | Cache, ISO/Fallback, Chain-of-responsibility | `SIMULATION_AND_GEOMAP_ARCHITECTURE.md` |
| `PMTILES_CONTRACT.md` | Karten-Tile-Vertrag | RETAIN | static-vs-live-layers Prinzip erwähnen | Dateiformat / Implementierungsdetails | `SIMULATION_AND_GEOMAP_ARCHITECTURE.md`, `API_CONTRACTS.md` |
| `GEOMAP_VERIFY.md` | Phase-4-Verifikation | REFERENCE | nur QA-/Abnahmewert | Workflow, Save-Fehlerpfade | `EXECUTION_PLAN.md` |

### 3.3 Knowledge / Memory / Overlay / Retrieval / Agenten

| Quelle | Primäre Rolle | Aktion | Was hochziehen | Was lokal lassen | Ziel(e) |
|---|---|---:|---|---|---|
| `MASTER_ARCHITECTURE_SYNTHESIS_2026.md` | abstraktes Brücken- und Rationale-Dokument | SPLIT | Overlay-first, query merge, simulation as branch, graph/vector separation | Snapshot-/Rationale-Funktion als eigenes Synthesis-Doc | `master_master_architecture_2026.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` |
| `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` | Wissensraum-Vertrag | PROMOTE | Canonical/Event/User graph, namespace rules, conflict classes, claim/evidence/stance, simulation branch | konkrete Engine-Wahlen nur weich belassen | `master_master_architecture_2026.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `SCENARIO_SNAPSHOT_AND_BRANCHING_SPEC.md` |
| `KG_ONTOLOGY.md` | Domänenontologie | RETAIN | Ontologieprinzip, competency questions, relationstypen kurz hochziehen | Schema, Domain-Semantik, relation map | `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `POLITICAL_ECONOMY_KNOWLEDGE.md` |
| `MEMORY_ARCHITECTURE.md` | Memory-Schichten | PROMOTE | M1/M2/M3/M4/M5-Denken, Backend-vs-User-KG, episodic vs semantic | tiefere Ist-/Soll-Prosa | `master_master_architecture_2026.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` |
| `CONTEXT_ENGINEERING.md` | Context-Assembly | PROMOTE | Consumer-Typen, Latenzbudgets, sim-spezifische Context-Selektion | konkrete Consumer-Abhängigkeiten | `master_master_architecture_2026.md`, `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `AGENT_ARCHITECTURE.md` | Multi-Agent-Struktur | PROMOTE | Agent-Rollen, warum nicht Single-LLM, orchestrierte Workflows | Beispiel-Prosa und Agentenbeschreibungen | `master_master_architecture_2026.md`, `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `AGENT_TOOLS.md` | Tooling-Universum | SPLIT | Tool-Taxonomie, GeoMap Game Theory Simulation Mode, capability families | konkrete Toollisten und Interface-Ideen | `master_master_architecture_2026.md`, `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `ai_retrieval_knowledge_infra_full.md` | Retrieval-/Discovery-Fachdokument | SPLIT | Retrieval als Architektur-Säule, hybrid/federated retrieval, open web als discovery | Exa-zentrierte Beispiele und vendornahe Form | `master_master_architecture_2026.md`, `RETRIEVAL_AND_DISCOVERY_ARCHITECTURE.md` |
| `TOOL_SEARCH.md` | lazy tool loading / dynamic discovery | RETAIN | Prinzip Tool Search als runtime optimization erwähnen | MCP-/Tool-Search-spezifische Anleitung | `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `plan-modus-agent.txt` | Planner/Executor/Replanner-Muster | SPLIT | Plan-Execute-Refine, human-editable plan projection, replanning loop | md-checklist als konkrete Technik nicht normativ | `master_master_architecture_2026.md`, `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `UNIFIED_INGESTION_LAYER.md` | Ingestion-Grenzen und Candidate-Logik | PROMOTE | UIL = candidate fabric, Go fetches, Python processes, TS review, no direct truth writes | genaue Source-bezogene Ausführung | `master_master_architecture_2026.md`, `API_CONTRACTS.md`, `RETRIEVAL_AND_DISCOVERY_ARCHITECTURE.md` |

### 3.4 Compute / Indicators / Portfolio / Rust / Domain Seeds

| Quelle | Primäre Rolle | Aktion | Was hochziehen | Was lokal lassen | Ziel(e) |
|---|---|---:|---|---|---|
| `INDICATOR_ARCHITECTURE.md` | heavy compute / sync-vs-async | SPLIT | indicator hot path vs async jobs, compute separation | detaillierte indicator families und ML-Details | `master_master_architecture_2026.md`, `ARCHITECTURE.md`, `SIMULATION_AND_GEOMAP_ARCHITECTURE.md` |
| `Portfolio-architecture.md` | Portfolio-Welt | SPLIT | Portfolio als eigener Consumer und Overlay-Kontext für Simulation | GoCryptoTrader-spezifische Ist-Zustände | `master_master_architecture_2026.md`, `RETRIEVAL_AND_DISCOVERY_ARCHITECTURE.md` |
| `RUST_LANGUAGE_IMPLEMENTATION.md` | Sprachgrenzen / ownership matrix | PROMOTE | Python-vs-Rust Ownership, IPC, hot path placement | konkrete Bridge-/Packaging-Details | `master_master_architecture_2026.md`, `ARCHITECTURE.md`, `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `ENTROPY_NOVELTY.md` | thermodynamische / novelty-Perspektive | RETAIN | Entropy/novelty als optionale scoring-/signal-theorie erwähnen | papernahe Interpretation und tiefe Theorie | `SIMULATION_AND_GEOMAP_ARCHITECTURE.md`, `INDICATOR_ARCHITECTURE.md` |
| `POLITICAL_ECONOMY_KNOWLEDGE.md` | Domain-D Seed | RETAIN | politische Ökonomie als semantischer Domain Seed und KG-Futter | volle historische / fachliche Ausarbeitung | `KG_ONTOLOGY.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` |

### 3.5 Arbeits-, Pilot- und Migrationsdokumente

| Quelle | Primäre Rolle | Aktion | Was hochziehen | Was lokal lassen | Ziel(e) |
|---|---|---:|---|---|---|
| `execution_mini_plan.md` | operative Kurz-Checkliste | REFERENCE | nur wenn Gates/Abhängigkeiten illustriert werden sollen | konkrete To-dos | `EXECUTION_PLAN.md` |
| `execution_mini_2.md` | Indikator-/Buch-Nähe-Plan | REFERENCE | nur wo Indicator/Rust-Pfade geschärft werden | operative Detailplanung | `EXECUTION_PLAN.md`, `INDICATOR_ARCHITECTURE.md` |
| `execution_mini_plan_3.md` | Gemini-inspirierter infra evolution track | SPLIT | Go as orchestrator, Rust service boundary, Connect/NATS-Impuls, Python aus Hot Path | Sprint-/Tasks, pkg-Struktur, Verify-Gates | `master_master_architecture_2026.md`, `ARCHITECTURE.md`, `EXECUTION_PLAN.md` |
| `PROVIDER_LIMITS.md` | externe Providerlage | RETAIN | Provider-/Quellenlimitierung als Governance-Thema erwähnen | konkrete Limits und Lückenliste | `RETRIEVAL_AND_DISCOVERY_ARCHITECTURE.md`, `EXECUTION_PLAN.md` |
| `REFERENCE_SOURCE_STATUS.md` | Quellenstatus | RETAIN | Source maturity / scaffold status als Governance kurz hochziehen | laufender Statusbericht | `EXECUTION_PLAN.md`, `SOURCE_CONFIDENCE_AND_PROMOTION_POLICY.md` |
| `PARTNER_BOUNDARY.md` | ISV/Partner-Grenzen | RETAIN | capability/quotas/audit-Prinzipien kurz erwähnen | konkrete Boundary-Spec | `AUTH_SECURITY.md`, `API_CONTRACTS.md` |
| `PAYMENT_ADAPTER.md` | Payment-Orchestration-Spec | REFERENCE | nur falls Integrationsgrenzen relevant sind | bleibt eigenständige Spezial-Spec | `API_CONTRACTS.md` |
| `PLUGIN_PILOT.md` | internal plugin pilot | SPLIT | signed manifests, allowlist, kill switch als plugin-grundprinzip | Pilot-spezifische Ausführung | `AUTH_SECURITY.md`, `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` |
| `FRONTEND_DESIGN_TOOLING.md` | Design-to-code und UI tooling | RETAIN | nur UI-tooling-Prinzipien knapp erwähnen | konkrete Toolbewertungen | `FRONTEND_ARCHITECTURE.md` |

---

## 4. Gesprächsbasierte Architekturentscheidungen, die **nicht** in einem einzelnen MD sauber enthalten sind

Diese Punkte stammen wesentlich aus unserem Gespräch und sollten **explizit** als Designentscheidungen erhalten bleiben:

### 4.1 Deliberate Reasoning / Search

- nacktes LLM != formale BFS/MCTS-Suche
- Beam Search ist wahrscheinlich die beste erste produktive Suchstrategie
- MCTS wird wichtig, wenn Branching, Unsicherheit und mehrstufige Gegenreaktionen stark steigen
- Search braucht explizit:
  - `SearchNode`
  - frontier management
  - scoring
  - pruning
  - termination
  - tool integration

**Ziel:** `master_master_architecture_2026.md`, später `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`

### 4.2 OpenSandbox als Runtime-Schicht

- Sandbox ist nicht bloß Dev-Tooling, sondern Teil der Agent-Runtime
- Basisimage mit kuratiertem Preinstall-Set
- domänenspezifische derivative images
- kontrollierte runtime installation via allowlist / limits / logs
- reproduzierbare execution artifacts

**Ziel:** `master_master_architecture_2026.md`, später `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`

### 4.3 GeoMap ↔ Simulation als gekoppelter Dual-Modus

- Simulation nicht in die normale Map pressen
- aber auch nicht komplett abtrennen
- richtige Form = gemeinsame Surface mit fokussiertem Simulationsmodus
- Simulation rechnet, GeoMap zeigt räumlich zurück

**Ziel:** `master_master_architecture_2026.md`, später `SIMULATION_AND_GEOMAP_ARCHITECTURE.md`

### 4.4 Epistemische Hierarchie für Websearch

- Websearch ist discovery/freshness/gap-fill
- Websearch ist nicht source of truth
- Open Web darf KG nicht direkt mutieren
- erst claim decomposition + retrieval + verifier + belief update + promotion gate

**Ziel:** `master_master_architecture_2026.md`, später `SOURCE_CONFIDENCE_AND_PROMOTION_POLICY.md`

### 4.5 Sprachgrenzen als strategische Architekturentscheidung

- Go = network / policy / gateway / orchestration / audit / scheduling
- Python = reasoning / modeling / ML / simulation orchestration
- Rust = hot path compute / numerical kernels / MC / ODE / heavy graph/spatial compute
- Frontend = local user intelligence surface

**Ziel:** `master_master_architecture_2026.md`, `ARCHITECTURE.md`

### 4.6 `MRKTEDGE.AI` als externer Produktbenchmark

- `MRKTEDGE.AI` dient hier als **Produkt-/UX-/Packaging-Referenz**, nicht als zu kopierende Zielarchitektur
- wichtig sind vor allem:
  - Research-Home vor Deep-Trade-Workspace
  - Economic Calendar als Event-Intelligence statt Terminliste
  - generischer Actor-/Narrative-/Volatility-Tracker statt Einzelfeature
  - PWA-first als pragmatische frühe Produktentscheidung
  - CMS/Analytics/Video/Payments als austauschbare Peripherie
- zusätzlich darf **nicht verloren gehen**:
  - Event als produktisiertes Kernobjekt
  - Surprise-/Impact-Logik und "`What matters now?`"-Scoring
  - Drilldowns von Event/Headline/Asset in Chart, GeoMap, News, Portfolio, Alerts
  - privacy-first analytics und Replay-Grenzen
  - explizite Prompt-/Output-/Retention-/Provenance-Governance
- dieser Block sollte **vorerst im Master-Master gebündelt** bleiben, damit die Ableitungen nicht in Einzelnotizen zerfallen
- später wird er auf Arbeitsdokumente verteilt:
  - `FRONTEND_ARCHITECTURE.md`
  - `ARCHITECTURE.md`
  - `EXECUTION_PLAN.md`
  - `API_CONTRACTS.md`
  - `UIL_ROUTE_MATRIX.md`
  - `AUTH_SECURITY.md`
  - `UNIFIED_INGESTION_LAYER.md`
  - `AGENT_ARCHITECTURE.md`
  - `AGENT_TOOLS.md`
  - `CLAIM_VERIFICATION_ARCHITECTURE.md`
  - `GEOPOLITICAL_MAP_MASTERPLAN.md`
  - `GAME_THEORY.md`
  - `CAPABILITY_REGISTRY.md`
  - `ROLLOUT_GATES.md`
  - optional `PAYMENT_ADAPTER.md`
  - optional später ein eigenes Event-Intelligence-Fachdokument
- es sollte **kein dauerhaftes eigenes "MRKTEDGE-Dokument" als Architekturverfassung** entstehen; die externe Referenz ist Hilfsrahmen, nicht Kernquelle

**Ziel:** `master_master_architecture_2026.md`, später die genannten Arbeitsdokumente

### 4.7 `ERRORS.md` als echte Spec, nicht als Sammelcontainer

- `ERRORS.md` soll langfristig **nur** Error-, Observability- und Operational-Normen tragen
- Tool-/Library-Namen bleiben erhalten, aber als **Optionen / Referenzen / Evaluationspfade**
- frontendnahe UI-/Workbench-Referenzen aus `ERRORS.md` §23 sollten in `FRONTEND_COMPONENTS.md`
- Geo-/Rendering-nahe Optionen wie `deck.gl`, `WebGPU` bleiben bei GeoMap/Performance/ADR-Dokumenten
- Transport-/IPC-Optionen wie `Connect RPC` bleiben bei Gateway-/IPC-/Execution-Dokumenten
- klarer `later later`-Radar aus `ERRORS.md` gehört nach `Advanced-architecture-for-the-future.md`
- weitere nicht-error-spezifische Bloecke aus `ERRORS.md` sollten direkt in Arbeitsdokumente uebergehen:
  - Contract-Driven / Codegen -> `API_CONTRACTS.md`, `ARCHITECTURE.md`, `EXECUTION_PLAN.md`
  - Shift-left / Supply Chain -> `EXECUTION_PLAN.md`, `SYSTEM_STATE.md`, `AUTH_SECURITY.md`
  - Feature Flags -> `CAPABILITY_REGISTRY.md`, `ROLLOUT_GATES.md`, `AUTH_SECURITY.md`, `EXECUTION_PLAN.md`
  - Data Layer Evolution / DuckDB-Polars-Arrow -> `ARCHITECTURE.md`, `EXECUTION_PLAN.md`, `INDICATOR_ARCHITECTURE.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`, `UNIFIED_INGESTION_LAYER.md`
  - AI Routing / Agent Safety -> `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`, `AUTH_SECURITY.md`, `EXECUTION_PLAN.md`

**Ziel:** `ERRORS.md`, `FRONTEND_COMPONENTS.md`, `GEOPOLITICAL_MAP_MASTERPLAN.md`, `EXECUTION_PLAN.md`, `GO_GATEWAY.md`, `Advanced-architecture-for-the-future.md`

### 4.8 Legacy-Mapping der ursprünglichen `ERRORS.md`-Sektionen (1–31)

Die frühere Fassung von `ERRORS.md` enthielt 31 Themenblöcke. Damit bei der Bereinigung nichts verloren geht, wird hier die Zielablage je Alt-Sektion festgehalten.

| Alt-Sektion | Thema | Primäre Zielablage | Bemerkung |
|---|---|---|---|
| 1 | Error Boundaries & Route Bubble | `ERRORS.md`, `FRONTEND_ARCHITECTURE.md`, `EXECUTION_PLAN.md` | Normativer Kern + konkrete Frontend-Umsetzung |
| 2 | Action Pattern statt Exceptions | `ERRORS.md`, `API_CONTRACTS.md` | Error-Spec + Contract-Form |
| 3 | Optimistic UI & Auto-Rollback | `ERRORS.md`, `FRONTEND_ARCHITECTURE.md` | Error-Verhalten im UI, nicht allgemeine Frontend-Verfassung |
| 4 | Backend Error Handling (Go) | `ERRORS.md` | Mit Optionen wie `errors.AsType[T]`, `errors.Join` |
| 5 | Backend Error Handling (Python) | `ERRORS.md` | Mit Optionen wie `returns`, `python-result-type`, `except*` |
| 6 | Observability & Telemetrie | `ERRORS.md`, `EXECUTION_PLAN.md` | Spec + konkrete Rollout-/Verify-Gates |
| 7 | Container-Orchestrierung & DX | `EXECUTION_PLAN.md`, `SYSTEM_STATE.md` | Kein Error-Spec-Kern |
| 8 | Contract-Driven Development | `API_CONTRACTS.md`, `ARCHITECTURE.md`, `EXECUTION_PLAN.md` | Mit `OpenAPI 3.1`, `Orval`, `Kiota`, `oapi-codegen` |
| 9 | Shift-Left Quality | `EXECUTION_PLAN.md`, `SYSTEM_STATE.md`, `AUTH_SECURITY.md` | Mit `Lefthook`, `Husky` |
| 10 | Unit- & Component-Testing | `EXECUTION_PLAN.md`, `FRONTEND_ARCHITECTURE.md` | Tooling-/Quality-Frage, nicht Error-Kern |
| 11 | Dependency Management & Supply Chain | `AUTH_SECURITY.md`, `EXECUTION_PLAN.md`, `SYSTEM_STATE.md` | Mit `Renovate`, `Dependabot`, `Trivy`, `Semgrep` |
| 12 | Feature Flags | `CAPABILITY_REGISTRY.md`, `ROLLOUT_GATES.md`, `AUTH_SECURITY.md`, `EXECUTION_PLAN.md` | Mit `Unleash`, `Flagsmith` |
| 13 | Server State Management | `FRONTEND_ARCHITECTURE.md` | `TanStack Query` bleibt Frontend-Architektur |
| 14 | Drizzle ORM vs. Prisma | `ARCHITECTURE.md`, `EXECUTION_PLAN.md` | Kontextabhängige Datenbank-/ORM-Wahl |
| 14a | Zanzibar / Fine-Grained Auth | `AUTH_SECURITY.md` | Mit `SpiceDB`, `Topaz` als Optionen |
| 15 | DuckDB + Polars + Apache Arrow | `ARCHITECTURE.md`, `INDICATOR_ARCHITECTURE.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`, `UNIFIED_INGESTION_LAYER.md`, `EXECUTION_PLAN.md` | Analytischer Compute-Pfad, nicht HFT-Execution-Grundlage |
| 16 | On-Premise vs. MotherDuck | `ARCHITECTURE.md`, `EXECUTION_PLAN.md` | Skalierungsoption, nicht früher Kern |
| 17 | Hybride Backtester-Architektur | `INDICATOR_ARCHITECTURE.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`, `ARCHITECTURE.md` | Go/Rust/Python-Rollenschnitt |
| 18 | AI Model Routing & FinOps | `AGENT_ARCHITECTURE.md`, `AUTH_SECURITY.md`, `EXECUTION_PLAN.md` | Mit `LiteLLM`, `RouteLLM` |
| 19 | Strategische Platzierung im Stack | `AGENT_ARCHITECTURE.md`, `ARCHITECTURE.md` | Agent-/Gateway-Einordnung |
| 20 | DSPy | `Advanced-architecture-for-the-future.md`, spaeter `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` | Späterer methodischer Pfad |
| 21 | Agent Safety (Sandwich) | `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`, `AUTH_SECURITY.md`, spaeter `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` | Mit `PydanticAI`, `Guardrails AI`, `OpenSandbox`, `Scallop`, `Z3` |
| 22 | ACP -> A2A | `Advanced-architecture-for-the-future.md`, `AGENT_TOOLS.md`, `EXECUTION_PLAN.md` | A2A klar später, aber dokumentiert |
| 23 | Agent UI/UX & Scaffolding | `FRONTEND_COMPONENTS.md` | Mit `Agent Zero`, `Perplexica`, `Mission Control`, `GitNexus Web`, `Paperless-ngx`, `Tambo`, `Vercel AI SDK` |
| 24 | WebGPU & deck.gl | `GEOPOLITICAL_MAP_MASTERPLAN.md`, `PERFORMANCE_BASELINE.md`, `EXECUTION_PLAN.md`, `ADR-002` | Geo-/Rendering-Entscheidung, gate-basiert |
| 24a | Servo | `Advanced-architecture-for-the-future.md` | Kein früher Kern |
| 25 | eBPF für Security & Observability | `Advanced-architecture-for-the-future.md`, optional später `AUTH_SECURITY.md` / Ops-Dokus | Später infra-/plattformnah |
| 26 | WebTransport vs. WebSockets | `Advanced-architecture-for-the-future.md`, `GO_GATEWAY.md`, `EXECUTION_PLAN.md` | Name erhalten, aber klar später |
| 27 | Connect RPC & gRPC | `GO_GATEWAY.md`, `ARCHITECTURE.md`, `EXECUTION_PLAN.md`, `API_CONTRACTS.md` | Für Go↔Rust / IPC-Kontext, nicht pauschaler Browser-Standard |
| 28 | Local-First / Durable Execution | `Advanced-architecture-for-the-future.md`, spaeter `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` | `Temporal`, `Restate` als späterer Radar |
| 29 | Sequencer-Centric & Messaging | `Advanced-architecture-for-the-future.md`, optional spaeter Messaging-/Trading-Docs | `Redpanda`, `Aeron`, `Point72/csp` als Evaluationslib fuer reactive stream processing; klar spät |
| 30 | Type-Safe Configuration & Platform Engineering | `Advanced-architecture-for-the-future.md` | `Pkl`, `KCL`, `OpenTofu`, `Crossplane` |
| 31 | Spatial Data Architecture | `GEOPOLITICAL_MAP_MASTERPLAN.md`, `PERFORMANCE_BASELINE.md`, `ADR-002` | `PMTiles`, `FlatGeobuf`, `deck.gl`, `Three.js`, `D3.js` |

Kurzurteil:

- **Ja**, die Alt-Sektionen sind jetzt logisch ausgelagert und im Zielsystem zugeordnet.
- **Nein**, sie wurden nicht einfach 1:1 in ein einziges anderes Dokument kopiert; sie wurden absichtlich auf Spec-, Fach-, Frontend- und Future-Dokumente verteilt.
- Wo die operative Zielablage noch nicht vollständig befuellt ist, dient diese Tabelle als verbindliche Transfer-Checkliste.

---

## 5. Was in welches neue Zieldokument sollte

### 5.1 `RETRIEVAL_AND_DISCOVERY_ARCHITECTURE.md`

**Zweck:** Alles bündeln, was aktuell verstreut ist zu Websearch, UIL, domain packs, provider routing, source trust und hybrid retrieval.

**Einflüsse:**
- `ai_retrieval_knowledge_infra_full.md`
- `UNIFIED_INGESTION_LAYER.md`
- `PROVIDER_LIMITS.md`
- `REFERENCE_SOURCE_STATUS.md`
- `CLAIM_VERIFICATION_ARCHITECTURE.md`
- `CONTEXT_ENGINEERING.md`
- Gesprächsteil zu confidence hierarchy / websearch governance

### 5.2 `SIMULATION_AND_GEOMAP_ARCHITECTURE.md`

**Zweck:** Alles bündeln, was GeoMap, Simulation, Game Theory, Control Theory, Monte Carlo, Timeline, Overlay und Rückprojektion betrifft.

**Einflüsse:**
- `GAME_THEORY.md`
- `GEOPOLITICAL_MAP_MASTERPLAN.md`
- `GEOPOLITICAL_OPTIONS.md`
- `CLAIM_VERIFICATION_ARCHITECTURE.md`
- `INDICATOR_ARCHITECTURE.md`
- `Portfolio-architecture.md`
- `GEOCODING_STRATEGY.md`
- `PMTILES_CONTRACT.md`
- Gesprächsteil zu Beam/MCTS, Focused Mode, GeoMap ↔ Simulation

### 5.3 `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`

**Zweck:** Tooling, Planner/Executor/Replanner, Tool Search, OpenSandbox, execution jobs, capability discovery, stateful agents.

**Einflüsse:**
- `AGENT_ARCHITECTURE.md`
- `AGENT_TOOLS.md`
- `CAPABILITY_REGISTRY.md`
- `TOOL_SEARCH.md`
- `plan-modus-agent.txt`
- `RUST_LANGUAGE_IMPLEMENTATION.md`
- Gesprächsteil zu deliberate reasoning und OpenSandbox

### 5.4 `SOURCE_CONFIDENCE_AND_PROMOTION_POLICY.md`

**Zweck:** harte epistemische Regeln für claims, evidence, confidence, contradictions, promotion.

**Einflüsse:**
- `CLAIM_VERIFICATION_ARCHITECTURE.md`
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`
- `MEMORY_ARCHITECTURE.md`
- `REFERENCE_SOURCE_STATUS.md`
- `UNIFIED_INGESTION_LAYER.md`
- Gesprächsteil zu Websearch-Rolle und Trust-Hierarchie

### 5.5 `SCENARIO_SNAPSHOT_AND_BRANCHING_SPEC.md`

**Zweck:** Reproduzierbare Struktur für Simulation-Branches und Search-Nodes.

**Einflüsse:**
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`
- `GAME_THEORY.md`
- `AGENT_ARCHITECTURE.md`
- Gesprächsteil zu Beam/MCTS/ScenarioSnapshot/SearchNode

### 5.6 `FRONTEND_COMPONENTS.md`

**Zweck:** Konkrete UI-Surfaces, Component-Familien, Workbench-Patterns und externe Frontend-Referenzen bündeln, ohne `FRONTEND_ARCHITECTURE.md` oder `FRONTEND_DESIGN_TOOLING.md` zu überladen.

**Einflüsse:**
- `ERRORS.md` §23
- `FRONTEND_ARCHITECTURE.md`
- `FRONTEND_DESIGN_TOOLING.md`
- `AGENT_ARCHITECTURE.md`
- `MEMORY_ARCHITECTURE.md`
- `CONTEXT_ENGINEERING.md`
- externe UI-/Workbench-Referenzen wie `Agent Zero`, `Perplexica`, `Mission Control`, `GitNexus Web`, `Paperless-ngx`, `Tambo`, `Vercel AI SDK`

---

## 6. Welche Dokumente später wahrscheinlich teilweise ersetzt werden

### Kandidaten für spätere Teil-Ablösung

- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`  
  bleibt als Rationale-/Decision-Log-Dokument wertvoll, verliert aber normative Last, sobald Merge/Overlay sauber in Ziel-Docs verteilt ist.

- `ERRORS2.md`  
  dürfte langfristig überflüssig werden, sobald `ERRORS.md` bereinigt ist.

- `execution_mini_plan*.md`  
  bleiben nützlich als operative Notizschicht, aber sind kein dauerhafter Zielzustand.

- `TOOL_SEARCH.md` und `plan-modus-agent.txt`  
  bleiben Inspirations-/Pattern-Dokumente; ihre Kernideen sollten in einen saubereren Agent-Runtime-Text überführt werden.

---

## 7. Was **nicht** zusammengelegt werden sollte

### 7.1 Nicht alles in `ARCHITECTURE.md`

`ARCHITECTURE.md` sollte kompakt bleiben.  
Nicht hineinpressen:
- volle Merge-/Overlay-Theorie
- tiefe Simulationslogik
- Retrieval-Governance in aller Länge
- ausführliche Agent-Tooling-Theorie

### 7.2 Nicht alles in den Master-Master

Der Master-Master ist die Verfassung, nicht der gesamte Quellkatalog.  
Er soll:
- normativ sein
- Querverbindungen herstellen
- Entscheidungen klar machen

Er soll **nicht** jede Fachausführung vollständig duplizieren.

### 7.3 Nicht Simulation und Wahrheit verschmelzen

- Scenario branches bleiben ephemer oder episodisch
- Promotion in den kanonischen Wissensraum nur über Gate
- Map-Visualisierung darf hypothetische Pfade zeigen, aber epistemisch markieren

### 7.4 Nicht Websearch als Truth-Layer behandeln

- discovery ja
- truth no
- mutation nur über Verifikation und Promotion

---

## 8. Empfohlene Umsetzungsreihenfolge

### Phase A — Dokumentenschnitt stabilisieren

1. `ARCHITECTURE.md` gegen Master-Master abgleichen und verschlanken
2. `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` als harte Wissens-Vertragsquelle festziehen
3. `ERRORS.md` als cross-cutting standard bereinigen
4. `EXECUTION_PLAN.md` mit finalen Zieldokumenten referenzieren

### Phase B — fehlende Zieldokumente anlegen

5. `RETRIEVAL_AND_DISCOVERY_ARCHITECTURE.md`
6. `SIMULATION_AND_GEOMAP_ARCHITECTURE.md`
7. `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`
8. `SOURCE_CONFIDENCE_AND_PROMOTION_POLICY.md`
9. `SCENARIO_SNAPSHOT_AND_BRANCHING_SPEC.md`

### Phase C — Migrations- und Pattern-Dokumente zurückfalten

10. `MASTER_ARCHITECTURE_SYNTHESIS_2026.md` als Rationale-Dokument markieren
11. `execution_mini_plan*.md` stärker an neue Ziel-Docs hängen
12. `TOOL_SEARCH.md` und `plan-modus-agent.txt` in Agent-Runtime überführen

---

## 9. Externe Webquellen, die diese Konsolidierung besonders stützen

Diese Quellen dienen **nicht** als Primärwahrheit des Systems, sondern als externe Bestätigung für Architekturentscheidungen:

- **OpenSandbox** — Basis-/Derivat-Image-Modell, vorinstallierte Runtimes, kontrollierte Code-Execution  
  https://github.com/alibaba/OpenSandbox/blob/main/sdks/code-interpreter/python/README.md

- **Anthropic – Advanced Tool Use / Tool Search** — lazy tool loading, große Toolkataloge, Kontextreduktion  
  https://www.anthropic.com/engineering/advanced-tool-use

- **LangGraph Overview** — durable execution, graph/state orchestration, human-in-the-loop  
  https://docs.langchain.com/oss/python/langgraph/overview

- **NATS JetStream** — persistente Streams, replay, event backbone  
  https://docs.nats.io/nats-concepts/jetstream

- **Connect RPC** — browser-/gRPC-freundliche API-Grenzen und Connect-Query-Muster  
  https://connectrpc.com/docs/introduction/

- **Exa Search Reference** — ai-native search / contents / retrieval reference  
  https://exa.ai/docs/reference/search

- **MRKTEDGE.AI Updates / Product Surface** — externer Benchmark für Decision-Home, Economic Calendar, PWA-Verpackung und produktseitige Event-Inszenierung  
  https://www.mrktedge.ai/updates

- **MRKTEDGE.AI Economic Calendar / Dashboard / App Surface** — Referenz für event-orientierte UX, nicht für Systemwahrheit  
  https://www.mrktedge.ai/economic-calendar  
  https://www.mrktedge.ai/blog/smarter-trading-dashboard  
  https://app.mrktedge.ai/manifest.webmanifest

---

## 10. Schlussentscheidung

Der aktuelle Stand sollte so gelesen werden:

- Der **Master-Master** ist jetzt die normative Gesamtsynthese.
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` ist der wichtigste spezialisierte Wissensvertrag.
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md` bleibt wertvoll, aber als Rationale-/Bridge-Dokument.
- `ai_retrieval_knowledge_infra_full.md` ist wichtig, aber als Retrieval-Säule, nicht als Systemverfassung.
- `TOOL_SEARCH.md` und `plan-modus-agent.txt` liefern starke Runtime-/Planner-Muster, aber keine eigenständige Verfassung.
- Die im Gespräch entwickelten Entscheidungen zu **Beam/MCTS**, **OpenSandbox**, **GeoMap ↔ Simulation**, **Websearch-Governance** und **Go/Python/Rust-Grenzen** sind now part of the architectural contract und dürfen beim späteren Rückschnitt der Dokumente nicht verloren gehen.

