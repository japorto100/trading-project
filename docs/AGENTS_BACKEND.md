# Agents Backend Program

> **Stand:** 16. Maerz 2026  
> **Zweck:** Root-Owner fuer das allgemeine Agent-Backend-Programm von TradeView Fusion (plattformweit, nicht nur GeoMap).  
> **Rolle:** Orchestriert bestehende Agent-Root-MDs und Execution-Slices, statt diese zu ersetzen.  
> **Nicht-Ziel:** Kein UI-Blueprint-Dokument; Frontend-Details bleiben in `docs/frontend_chat_ui.md` und `execution/agent_chat_ui_delta.md`.

---

## 1. Warum dieses Dokument

TradeView Fusion hat inzwischen mehrere starke Agent- und Referenzstränge:

- eigene Root-Architektur (`AGENT_ARCHITECTURE`, `AGENT_SECURITY`, `AGENT_HARNESS`, `AGENT_TOOLS`)
- mehrere aktive Agent-Execution-Slices
- externe Referenzprojekte (`agentzero-complete`, `onyx`, `perplexica`, `tambo`, `ogi`, `worldwideview`, `shadowbroker`, `mcp-manager`)

Dieses Dokument stellt sicher, dass daraus ein **einheitliches Backend-Programm** wird:

- klare Ownership
- klare Scope-Grenzen
- klare Adoptionsregeln (`adopt-as-is`, `adapt-mit-wrapper`, `reference-only`)
- klare Verify-/Evidence-Disziplin

---

## 2. Owner-Schichtung (wichtig)

## 2.1 Bestehende Root-MDs bleiben Owner

- `docs/AGENT_ARCHITECTURE.md` -> Rollen, Orchestration, Systembild
- `docs/AGENT_TOOLS.md` -> Tool-/Capability-Contracts
- `docs/AGENT_SECURITY.md` -> Policy, Trust, Hardening
- `docs/AGENT_HARNESS.md` -> Constrain/Inform/Verify/Correct, Sandbox-Boundary
- `docs/MEMORY_ARCHITECTURE.md` + `docs/CONTEXT_ENGINEERING.md` -> Memory/Context-Grundlagen

## 2.2 Execution-Slices fuer Delivery

- `docs/specs/execution/agent_memory_context_delta.md` -> Runtime + Memory/Context
- `docs/specs/execution/agent_security_runtime_delta.md` -> Security Runtime
- `docs/specs/execution/agent_harness_runtime_delta.md` -> Harness/Sandbox
- `docs/specs/execution/agent_backend_program_delta.md` -> programmweite Agent-Backend-Steuerung (plattformweit)
- `docs/specs/execution/agent_geomap_bridge_delta.md` -> GeoMap-Bridge (spezifisch)
- `docs/specs/execution/backend_geomap_delta.md` -> GeoMap-Backend (spezifisch)

## 2.3 Was dieses Dokument tut

- priorisiert und verbindet die obigen Owner
- mappt externe Referenzen auf konkrete Slices
- definiert Programm-Gates fuer backendweite Agent-Arbeit

---

## 3. Scope des Agents-Backend-Programms

### Scope In

- Agent run/step lifecycle, approvals, retries/replan, abort semantics
- Tool execution contracts, capability gating, policy decisions
- retrieval/provenance/context assembly contracts
- audit/trace/request-correlation, failure/degraded envelopes
- connector/provider governance fuer agentische Datenpfade
- evals und regression gates fuer Agent-Backend-Qualitaet

### Scope Out

- rein visuelle Chat- oder Panel-UX-Details
- GeoMap-spezifische Graph/UI-Arbeit ohne Agent-Backend-Relevanz
- ad-hoc Referenzuebernahmen ohne Slice-Owner und Verify-Gates

---

## 4. Referenzlage: extraction_candidates + Kernprojekte

## 4.1 Extraction-Kandidaten (quergeprueft)

- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/extraction_manifest.txt`
  - stark fuer Agent-Orchestrierung, step-store, worker, tool contracts, audit/eventing
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/worldwideview/extraction_manifest.txt`
  - stark fuer polling/cache/databus/adapters, key verification, availability/history endpoints
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker/extraction_manifest.txt`
  - kein direkter LLM-stack, aber stark fuer multi-source ingestion resilience und fallback transport
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/mcp-manager`
  - primaer Control-Surface-/Ops-Governance-Referenz; fuer Agent-Backend nur supporting (OAuth/proxy/vault-init patterns), nicht Core-Orchestrator-Owner
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/agentzero-complete/extraction_manifest.txt`
  - stark fuer orchestration/control queueing/resilience/process lifecycle (`selected_count=47`, backend-first)
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/onyx/extraction_manifest.txt`
  - stark fuer packet/session lifecycle, tool runtime, mcp/connectors, auth-boundary (`selected_count=88`, `residual_high_value_gaps=0`)
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/perplexica/extraction_manifest.txt`
  - stark fuer stream/reconnect/search/source contracts und provider/degradation handling (`selected_count=46`, backend-first)
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/tambo/extraction_manifest.txt`
  - backendseitig supporting fuer component/event/thread contracts und mcp/session token flows (`selected_count=112`, `residual_high_value_gaps=0`)

## 4.2 Referenzprojekte (direkt)

- `agentzero-complete` -> orchestration/control/busy-queue/robustness patterns
- `onyx` -> streaming packet models, message/session lifecycle, tool-state discipline
- `perplexica` -> streaming + structured blocks + search/source handling contracts
- `tambo` -> primaer UI registry; backendseitig relevant bei component/event contracts und thread protocol, nicht als transport-owner

---

## 5. Mapping: Was ist GeoMap-spezifisch vs. allgemein

## 5.1 GeoMap-spezifisch (in GeoMap-Slices halten)

- Agent<->GeoMap action classes und mutation approvals
- GeoMap-spezifische audit fields und replay visibility
- GeoMap provider outage/degradation innerhalb Geo-Routen

Owner:

- `execution/agent_geomap_bridge_delta.md`
- `execution/backend_geomap_delta.md`
- `execution/geomap_closeout.md`

## 5.2 Allgemeines Agent-Backend (plattformweit)

- run/step orchestration contracts
- tool policy / capability gating
- context/provenance envelopes
- generic failure/degraded schema
- eval gates, drift gates, rollback gates

Owner:

- `execution/agent_memory_context_delta.md`
- `execution/agent_security_runtime_delta.md`
- `execution/agent_harness_runtime_delta.md`
- `execution/agent_backend_program_delta.md`

---

## 6. Adoptionsregeln fuer Referenzprojekte

### `adopt-as-is` (nur selten)

- testharness-patterns, contract-check scaffolds, selected ci checks

### `adapt-mit-wrapper` (default)

- orchestrator/store/worker patterns
- streaming/event packet contracts
- policy/audit/degradation envelopes

### `reference-only`

- stark projektspezifische runtime assumptions
- framework lock-in ohne klaren Mehrwert
- codepfade mit hohen security-/ops-risiken

---

## 7. Programm-Gates (backendweit)

- **PBG.1** Lifecycle Gate: run/step/approval/replan/abort model ist typed und getestet
- **PBG.2** Policy Gate: tool actions sind capability- und role-gated
- **PBG.3** Audit Gate: mutierende und high-risk actions sind tracebar
- **PBG.4** Degradation Gate: outage/failure envelopes sind konsistent
- **PBG.5** Provenance Gate: retrieval/context outputs enthalten source/evidence metadata
- **PBG.6** Eval Gate: Regressionen bei quality/safety/cost werden vor rollout erkannt

---

## 8. Priorisierte Integrationsreihenfolge

1. OGI agent runtime patterns in `agent_memory_context` / `agent_harness`
2. Worldwideview adapter/polling/availability contracts in backend connector lanes
3. Shadowbroker resilience patterns fuer fallback transport und cache strategy
4. Onyx/Perplexica streaming-model harmonisierung fuer backend event contracts
5. Tambo nur dort backendseitig, wo component/event/thread contracts echten Mehrwert liefern

---

## 9. Tambo: Backend-Relevanz explizit

`tambo` bleibt primaer frontend-/component-registry-stark.  
Backendseitig ist `tambo` relevant, wenn:

- component rendering events/server payload contracts vereinheitlicht werden muessen
- thread protocol / structured output framing backendseitig normalisiert werden soll
- tool-result to UI-component mapping als server contract gebraucht wird

`tambo` ist **nicht** default-owner fuer euren Transportstack oder Agent-Orchestrator.

---

## 10. Verknuepfungen

- Frontend-Chat-Blueprint: `docs/frontend_chat_ui.md`
- Agent-Chat-Slice: `docs/specs/execution/agent_chat_ui_delta.md`
- GeoMap-Bridge-Slice: `docs/specs/execution/agent_geomap_bridge_delta.md`
- GeoMap-Backend-Slice: `docs/specs/execution/backend_geomap_delta.md`
- Referenz-Evaluate-Owner: `docs/specs/execution/references_projects_evaluate_delta.md`

---

## 11. Exit-Kriterien fuer dieses Programm-Dokument

- Referenz-Mapping auf Slices ist eindeutig
- GeoMap-spezifische und allgemeine Agent-Backend-Arbeit sind sauber getrennt
- Tambo-Backend-Relevanz ist klar abgegrenzt (kein stiller Scope-Shift)
- execution owner koennen pro Thema sofort zugeordnet werden

