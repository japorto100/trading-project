# Agent Backend Program Delta

> **Stand:** 16. Maerz 2026  
> **Zweck:** Programmweiter Execution-Owner fuer Agent-Backend-Arbeit in TradeView Fusion (plattformweit, nicht GeoMap-only).  
> **Root-Owner:** `docs/AGENTS_BACKEND.md`  
> **Scope-Notiz:** Dieser Slice orchestriert bestehende Agent-Slices, ersetzt sie nicht.

---

## 0. Execution Contract

### Scope In

- run/step lifecycle contracts (start, think, tool, result, finish, fail, cancel)
- policy/capability gating fuer tool actions
- approval flows (pending/approved/rejected/resolved)
- audit/trace/request-correlation standards
- failure/degraded envelope standards
- connector/retrieval/provenance contracts fuer agentische Pfade
- reference-driven adoption governance (extract -> evaluate -> adopt)

### Scope Out

- GeoMap-spezifische Bridge-Details (`agent_geomap_bridge_delta.md`)
- GeoMap-Backend-spezifische API/Policy-Pfade (`backend_geomap_delta.md`)
- rein frontendseitige Chat-UX-Details (`agent_chat_ui_delta.md`)

### Mandatory Upstream Sources

- `docs/AGENTS_BACKEND.md`
- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/AGENT_SECURITY.md`
- `docs/AGENT_HARNESS.md`
- `docs/specs/execution/agent_memory_context_delta.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/specs/execution/references_projects_evaluate_delta.md`

### External Reference Inputs (Extraction)

- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/extraction_manifest.txt`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/worldwideview/extraction_manifest.txt`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker/extraction_manifest.txt`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/agentzero-complete/extraction_manifest.txt`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/onyx/extraction_manifest.txt`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/perplexica/extraction_manifest.txt`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/tambo/extraction_manifest.txt`

---

## 1. Offene Deltas

- [ ] **ABP.1** — Canonical Agent Run/Step Contract festziehen (statuses, transitions, correlation fields)
- [ ] **ABP.2** — Tool Action Policy Contract normieren (allowed/blocked/approval-required)
- [ ] **ABP.3** — Approval Flow Contract vereinheitlichen (`pending -> approved/rejected -> resolved`)
- [ ] **ABP.4** — Audit Contract fuer mutierende/high-risk agent actions erzwingen
- [ ] **ABP.5** — Failure/Degraded Envelope Contract fuer agent backend responses standardisieren
- [ ] **ABP.6** — Provenance Contract fuer retrieval/context outputs normieren (`source`, `evidence`, `confidence`)
- [ ] **ABP.7** — Connector/Adapter Reliability Contract (timeouts, fallback, retry budget, rate guards)
- [ ] **ABP.8** — Reference Adoption Matrix (adopt-as-is / adapt-mit-wrapper / reference-only) als programmweite Entscheidungstabelle pflegen
- [ ] **ABP.9** — Drift Gate: Modell-/Tool-/Schema-Aenderungen vor Rollout maschinell pruefen
- [ ] **ABP.10** — Cross-slice ownership map fixieren (welcher Teil gehoert in AMC/ASR/AHR/AGB/BG)

---

## 2. Verify-Gates

### Code-complete

- [ ] **ABP.V1** — Run/Step lifecycle ist typed, dokumentiert und in mindestens einem End-to-End Pfad nachweisbar
- [ ] **ABP.V2** — Policy/Capability checks blockieren unzulaessige tool actions reproduzierbar
- [ ] **ABP.V3** — Approval-path inklusive reject/fail führt zu konsistenten Endstates
- [ ] **ABP.V4** — Audit trail enthält Pflichtfelder fuer high-risk/mutating actions
- [ ] **ABP.V5** — Degraded/failure envelopes sind konsistent, maschinenlesbar und no-silent-failure

### Live-Verify

- [ ] **ABP.V6-LV** — representative agent workflow bleibt stabil unter provider degradation
- [ ] **ABP.V7-LV** — retry/fallback/rate-limit Pfade sind operational nachvollziehbar
- [ ] **ABP.V8-LV** — reference-adapted backend pattern liefert messbaren Mehrwert ohne policy regression

---

## 3. Testpflichten

- [ ] **ABP.T1** — Unit: run/step transition validator
- [ ] **ABP.T2** — Unit: policy/capability decision table
- [ ] **ABP.T3** — Integration: approval-required tool flow
- [ ] **ABP.T4** — Integration: degraded/failure envelope consistency
- [ ] **ABP.T5** — Integration: provenance/audit append contract
- [ ] **ABP.T6** — Regression: schema/tool/model drift guard

---

## 4. Reference-to-Slice Mapping (kurz)

- `ogi` -> orchestrator/store/worker/tool contracts (`ABP.1-ABP.5`)
- `onyx` -> packet/session lifecycle + tool state discipline (`ABP.1`, `ABP.5`, `ABP.9`)
- `perplexica` -> stream framing + reconnect + source/result contracts (`ABP.5`, `ABP.6`)
- `agentzero-complete` -> queue/control/resilience/process orchestration (`ABP.1`, `ABP.7`)
- `tambo` -> component/event/thread protocol contracts (backend-supporting, no transport-owner) (`ABP.5`, `ABP.8`)
- `worldwideview` -> polling/cache/availability/key-verify adapter patterns (`ABP.7`)
- `shadowbroker` -> multi-source ingestion resilience/fallback transport (`ABP.7`)

---

## 5. Evidence Requirements

Fuer jeden geschlossenen Punkt mindestens:

- ID (`ABP.*`, `ABP.V*`, `ABP.T*`)
- reproduzierbarer Ablauf
- erwartetes vs. beobachtetes Ergebnis
- referenzierte Owner-Dokumente/Slices
- bei Live-Gates: Request/Response + correlation ID + audit proof

---

## 6. Propagation Targets

- `docs/AGENTS_BACKEND.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/execution/agent_memory_context_delta.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/specs/execution/references_projects_evaluate_delta.md`

---

## 7. Exit Criteria

- `ABP.1-ABP.8` abgeschlossen oder sauber deferred mit Owner/Datum
- mindestens `ABP.V1-ABP.V5` code-complete nachgewiesen
- mindestens `ABP.T1-ABP.T4` vorhanden
- reference adoption decisions dokumentiert und in Slices propagiert

---

## 8. Schritt-1 Fokusplan (`ABP.1` bis `ABP.5`)

Ziel von Schritt 1 ist ein lauffaehiger Contract-Baseline-Block fuer Agent-Backend-Core.  
Checkboxen werden erst auf `[x]` gesetzt, wenn die zugehoerigen Verify-/Testpflichten mit Evidence belegt sind.

### 8.1 Reihenfolge (strict order)

1. `ABP.1` Canonical Run/Step Contract
2. `ABP.2` Tool Action Policy Contract
3. `ABP.3` Approval Flow Contract
4. `ABP.4` Audit Contract
5. `ABP.5` Failure/Degraded Envelope Contract

### 8.2 Workpackage pro Delta

#### `ABP.1` Run/Step Contract

- **Output-Artefakt:** zentrale Status-/Transition-Tabelle inkl. erlaubter Kanten und Pflichtfeldern (`run_id`, `step_id`, `correlation_id`, `state`, `reason`)
- **Cross-Slice Sync:** `agent_memory_context_delta.md`
- **Verify-Mapping:** `ABP.V1`
- **Test-Mapping:** `ABP.T1`

#### `ABP.2` Policy/Capability Contract

- **Output-Artefakt:** policy decision table (`allowed`, `blocked`, `approval_required`) mit role/capability/intent Inputs
- **Cross-Slice Sync:** `agent_security_runtime_delta.md`, `AUTH_SECURITY.md`
- **Verify-Mapping:** `ABP.V2`
- **Test-Mapping:** `ABP.T2`

#### `ABP.3` Approval Flow Contract

- **Output-Artefakt:** normativer Approval-Stateflow inkl. timeout/cancel/reject semantics und idempotent resume
- **Cross-Slice Sync:** `agent_harness_runtime_delta.md`, `agent_security_runtime_delta.md`
- **Verify-Mapping:** `ABP.V3`
- **Test-Mapping:** `ABP.T3`

#### `ABP.4` Audit Contract

- **Output-Artefakt:** Pflichtfeldschema fuer high-risk/mutating actions (actor, tool, policy_decision, old/new, timestamp, request_id)
- **Cross-Slice Sync:** `API_CONTRACTS.md`, `AUTH_SECURITY.md`
- **Verify-Mapping:** `ABP.V4`
- **Test-Mapping:** `ABP.T5`

#### `ABP.5` Failure/Degraded Contract

- **Output-Artefakt:** einheitliches error/degraded envelope schema inkl. machine-readable `code`, `category`, `retryable`, `fallback_used`
- **Cross-Slice Sync:** `agent_memory_context_delta.md`, `agent_harness_runtime_delta.md`
- **Verify-Mapping:** `ABP.V5`
- **Test-Mapping:** `ABP.T4`

### 8.3 Definition of Done fuer Schritt 1

- `ABP.1-ABP.5` jeweils mit Artefakt + Cross-Slice Sync vorhanden
- `ABP.V1-ABP.V5` jeweils mit reproduzierbarem Nachweis dokumentiert
- `ABP.T1-ABP.T5` vorhanden und gruen
- erst dann Checkbox-Update auf `[x]`

