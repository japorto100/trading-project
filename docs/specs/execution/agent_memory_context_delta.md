# Agent/Memory/Context Runtime Delta

> **Stand:** 18. Maerz 2026 (Rev. 2)
> **Zweck:** Aktiver Arbeitsplan fuer Agent-Runtime, Tooling, Memory und Context
> Assembly als zusammenhaengende Laufzeitflaeche.
> **Aenderungshistorie:**
> - Rev. 1 (13.03.2026): Erstanlage — AMC1–AMC18 Contracts, Verify-Gates, Testpflichten
> - Rev. 2 (18.03.2026): AMC1/AMC3/AMC5 als code-complete-stub markiert (Phase 22g Loop-Neubau); Live-Verify-Gates ergaenzt

---

## 0. Execution Contract

### Scope In

- Agent-Runtime-Flows, Tool-Policy und Capability-Boundaries
- Memory-/KG-/retrieval-nahe Integritaet und Betriebsgates
- Context-Assembly-Qualitaet fuer produktive Agentantworten

### Scope Out

- Provider-Rollout ohne Agentbezug
- rein theoretische Modellvergleiche ohne Runtime-Relevanz
- Agent-Security-Hardening als eigener Owner-Slice
  (`agent_security_runtime_delta.md`)

### Mandatory Upstream Sources

- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/AGENT_SECURITY.md`
- `docs/AGENT_CODE_MODE.md` (evaluate-only bei High-Volume Context/Tool-Payloads)
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/RAG_GRAPHRAG_STRATEGY_2026.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/source_persistence_snapshot_delta.md`
- `docs/specs/execution/vector_ingestion_delta.md`
- `docs/POLITICAL_ECONOMY_KNOWLEDGE.md`
- `docs/ENTROPY_NOVELTY.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`

### Security Baseline (Research, frisch)

- arXiv (11.03.2026): `The Attack and Defense Landscape of Agentic AI`
  — https://arxiv.org/pdf/2603.11088

---

## 1. Offene Deltas

- [x] **AMC1** Runtime-Flow: repraesentativer Agent-Request inkl. Tool-Handoff nachvollziehbar — **code-complete stub (18.03.2026)**
  - `run_agent_loop()` in `python-agent/agent/loop.py`: messages-Liste als Loop-State, `_run_tool()` als Tool-Handoff-Punkt, Tool-Results werden als `user`-Message in messages zurückgefaltet
  - `ToolRegistry.load()` ladt alle 6 Standard-Tools (chart_state/portfolio/geomap/memory); Loop ermittelt per `ctx.find_tool(name)` → `tool.execute()`
  - Provider-agnostisch: `_loop_anthropic` (Anthropic SDK) + `_loop_openai` (OpenAI SDK, deckt OpenRouter/Ollama/vLLM ab)
  - _Full Chain (loop→memory-service→KG/vector) deferred → Sprint 4; Live-Verify: AMC.V1-LV offen_
- [ ] **AMC2** Tool-Policy: erlaubte/gesperrte Toolpfade mit Fehlerklassifikation verifiziert
- [x] **AMC3** Memory-Write/Read Konsistenz in typischen Multi-Step-Flows verifiziert — **code-complete (18.03.2026)**
  - `SaveMemoryTool` + `LoadMemoryTool` in `python-agent/agent/tools/memory_tool.py`
  - `working_memory_set(thread_id, key, content)` + `working_memory_get(thread_id)` als Write/Read-Primitives (delegiert an `ml_ai`-Layer)
  - Key-basierter Zugriff; `LoadMemoryTool` gibt `{ok, key, content, found}` — kein silent-fail
  - _E2E gegen laufenden memory-service: Live-Verify offen → Sprint 4_
- [ ] **AMC4** Context-Assembly: Quellenrangfolge und Konfliktaufloesung dokumentiert
- [x] **AMC5** Degradationspfad: fehlende Quelle/Tool/Memory liefert kontrollierten Fallback — **code-complete pattern (18.03.2026)**
  - `RepairableError` + `CriticalError` in `python-agent/agent/errors.py`
  - Loop fängt `RepairableError` (Tool-Error, memory-miss) → emittiert `ToolErrorPacket` → streamt weiter; kein 500
  - `CriticalError` (Sicherheitsverletzung, Policy) → Loop bricht sauber ab, emittiert `ErrorPacket` mit code/category
  - _Degradationspfad fuer fehlenden memory-service (HTTP-Timeout/503): noch offen → Sprint 4 (AMC6)_
- [ ] **AMC6** Runtime-Metriken: Request-ID, Latenzklasse und Fehlerklasse sichtbar
- [ ] **AMC7** Knowledgebase-Ingestion: politische/oekonomische Konzepte aus `POLITICAL_ECONOMY_KNOWLEDGE.md` in Semantic-Memory/KG strukturiert aufgenommen
- [ ] **AMC8** Entropy-Novelty-Konzepte als semantische Knoten/Signale mit Retrieval-Regeln verankert
- [ ] **AMC9** Trennung truth/belief/scenario fuer Knowledgebase-Slices explizit verifiziert (kein stilles Mischen)
- [ ] **AMC10** Context-/Vector-Pfade greifen nur auf normalisierte,
  provenance-markierte Inputs zu, nicht direkt auf Rohsnapshots
- [ ] **AMC11** Retrieval-Broker-Integration: Context Assembler nutzt nur
  policy-gepruefte Read-Pfade (kein direkter Bypass auf Raw/Store-Layer)
- [ ] **AMC12** Evidence-Completeness-Handshake:
  Context-Runtime liefert Pflichtquellen-/Coverage-Signale an
  Agent-Security-Gates
- [ ] **AMC13** Query-Mode-Routing fuer `Search/Compare/Verify/Global` ist
  runtime-seitig dokumentiert und reproduzierbar umgesetzt
- [ ] **AMC14** Rerank-Baseline im Retrieval-Pfad verbindlich (Top-N -> Rerank
  -> Top-K fuer Context Assembly)
- [ ] **AMC15** Language-Drift-Guard fuer multilingual retrieval ist in
  Context-Assembly-/Decoding-Regeln verankert
- [ ] **AMC16** UQ-light/Confidence-Gating fuer claim-nahe Antworten ist
  operationalisiert (inkl. abstain/defer Verhalten)
- [ ] **AMC17** Kontextlabel/taint-Weitergabe in Context-Assembly
  (`trusted/untrusted/sensitive`) bis in Antwort- und Tool-Vorstufen verankern
- [ ] **AMC18** High-Volume-Context-Kompaktierung ueber evaluate-only Code-Mode pruefen
  (nur als optionaler Pfad, kein Default-Switch)

---

## 2. Verify-Gates

- [ ] **AMC.V1** Agent->Tool->Result End-to-End
  - _Code-Complete: `run_agent_loop()` Pfad ist typed + dokumentiert (18.03.2026)_
  - _Live-Verify (Stack noetig → Sprint 4): AMC.V1-LV — `run_agent_loop()` + memory-save/load E2E nachweisbar_
- [ ] **AMC.V2** Memory-Semantik fuer Follow-up-Fragen
- [ ] **AMC.V3** Policy-Error-Path (blocked tool / missing capability)
  - _Code-Complete: `validate_tool_call()` + `CapabilityEnvelope.check()` implementiert; Tests offen → ABP.T2_
- [ ] **AMC.V4** Context-Conflict-Path (mehrere widerspruechliche Quellen)
- [ ] **AMC.V5** Knowledgebase-Retrieval gibt fuer Political-Economy/Entropy konsistente, zitierbare Ergebnisse
- [ ] **AMC.V6** Retrieval aus Vector-/Context-Pfaden verletzt nicht die
  Source-Persistence-Grenze
- [ ] **AMC.V7** Context Assembly umgeht nicht den Retrieval-Broker-Pfad
- [ ] **AMC.V8** Query-Router waehlt fuer repraesentative Faelle korrekt zwischen
  `Search/Compare/Verify/Global`
- [ ] **AMC.V9** Rerank-Pfad verbessert Relevanz konsistent gegen unge-rerankte
  Baseline (vergleichbarer Testkorpus)
- [ ] **AMC.V10** Language-Drift/UQ-Gates verhindern ueberkonfidente Antworten
  bei multilingualen oder evidenzarmen Faellen
- [ ] **AMC.V11** Context-Label/Taint bleibt in mehrstufigen Retrieval->Assemble-Pfaden erhalten
- [ ] **AMC.V12** Code-Mode-Kompaktierung reduziert Kontextgroesse ohne Evidenzverlust

---

## 3. Evidence Requirements

Pro geschlossenem Punkt:

- AMC-ID + kurzer Ablauf
- API-/UI-/Log-Nachweis
- beobachtetes Verhalten bei Fehlerfall
- Rueckspiegelung in Owner-Dokumente

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/AGENT_SECURITY.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/RAG_GRAPHRAG_STRATEGY_2026.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/source_persistence_snapshot_delta.md`
- `docs/specs/execution/vector_ingestion_delta.md`
- `docs/POLITICAL_ECONOMY_KNOWLEDGE.md`
- `docs/ENTROPY_NOVELTY.md`

---

## 5. Exit Criteria

- `AMC1-6` entschieden (geschlossen oder deferred mit Owner/Datum)
- mindestens ein valider E2E-Flow plus ein kontrollierter Degradationsflow nachgewiesen
- RAG/GraphRAG-Runtime-Bausteine (`AMC13-16`, `AMC.V8-V10`) sind fuer
  mindestens einen produktnahen Pfad nachvollziehbar verifiziert
- keine offene Runtime-Divergenz zwischen Execution und Root-Owner
