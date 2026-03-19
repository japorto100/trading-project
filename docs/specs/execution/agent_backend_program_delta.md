# Agent Backend Program Delta

> **Stand:** 18. Maerz 2026
> **Zweck:** Programmweiter Execution-Owner fuer Agent-Backend-Arbeit in TradeView Fusion (plattformweit, nicht GeoMap-only).
> **Root-Owner:** `docs/AGENTS_BACKEND.md`
> **Scope-Notiz:** Dieser Slice orchestriert bestehende Agent-Slices, ersetzt sie nicht.
> **Aenderungshistorie:**
> - Rev. 1 (16.03.2026): Erstanlage — ABP.1–ABP.12 Contracts, Verify-Gates, Testpflichten
> - Rev. 2 (18.03.2026): ABP.1–ABP.3 code-complete (Phase 22g Loop-Neubau); Verify-Gates ABP.V1–V3 als code-complete markiert; Live-Verify-Gates ergaenzt; AC-Notation fuer Phase-22g-Implementierung ergaenzt
> - Rev. 3 (18.03.2026): ABP.2b/2c/2d code-complete (Phase 22g Quality Pass) — Pydantic Tool Inputs, shared httpx Client, anyio Tool-Timeout; Rust Agent Hotpaths (entity extraction, context dedup, tool scoring)

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
- `docs/AGENT_CODE_MODE.md` (optionaler Runtime-Pfad; kein Default-Switch)
- `docs/specs/execution/agent_memory_context_delta.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/specs/execution/references_projects_evaluate_delta.md`

### Security Baseline (Research, frisch)

- arXiv (11.03.2026): `The Attack and Defense Landscape of Agentic AI`
  — https://arxiv.org/pdf/2603.11088

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

- [x] **ABP.1** — Canonical Agent Run/Step Contract festziehen — **code-complete (18.03.2026)**
  - `run_agent_loop()` in `python-agent/agent/loop.py`: `MAX_ITERATIONS=10`, `stop_reason` (end_turn/tool_calls/exhausted), `loop_state` via messages-Liste; `AgentExecutionContext` (frozen dataclass) als Run-Container
  - Streaming: `ThreadIdPacket` → `TextStartPacket` → `TextDeltaPacket*` → `TextEndPacket` → `MessageMetaPacket` → `FinishPacket` (Vercel AI Data Stream Protocol)
  - Provider-agnostisch: `_loop_anthropic` + `_loop_openai` (OpenRouter, Ollama, vLLM via OPENAI_BASE_URL)
  - _Tests + Live-Verify: offen → ABP.T1 / ABP.V1_
- [x] **ABP.2** — Tool Action Policy Contract normieren — **code-complete (18.03.2026)**
  - `TradingTool` ABC in `tools/base.py`: `name / definition() / validate() / execute()`
  - `ToolRegistry.load()` in `tools/registry.py`: 6 Standard-Tools (get_chart_state, set_chart_state, get_portfolio_summary, get_geomap_focus, save_memory, load_memory)
  - `CapabilityEnvelope` in `context.py`: `allowed_tools` frozenset + `check()` raises `CapabilityViolation`
  - `validate_tool_call()` in `validators/trading.py`: advisory-Agent kann ORDER_TOOLS nicht nutzen; Envelope-Check
  - `ADVISORY_ENVELOPE` als Default: nur read-only + memory tools erlaubt
  - _Tests + Live-Verify: offen → ABP.T2 / ABP.V2_
- [x] **ABP.2b** — Pydantic Tool Input Models — **code-complete (18.03.2026)**
  - `TradingTool.input_model: type[BaseModel] | None = None` als Klassen-Attribut in `tools/base.py`
  - Default `validate()` ruft `input_model(**tool_input)` auf wenn gesetzt → `ValidationError` → `ToolValidationError`
  - `SaveMemoryInput` (`key: str min_length=1, content: str min_length=1`) in `tools/memory_tool.py`
  - `LoadMemoryInput` (`key: str min_length=1`) in `tools/memory_tool.py`
  - `SetChartStateInput` (`symbol: str, timeframe: str`) in `tools/chart_state.py`
  - `definition()` nutzt `Model.model_json_schema()` → auto-generiertes JSON-Schema fuer Anthropic/OpenAI
  - `execute()` instanziiert Model fuer type-safe Feldzugriff statt `tool_input["key"]`
  - `SetChartStateTool.validate()` ruft `super().validate()` zuerst (Pydantic), dann Capability-Guard
  - _Tools ohne Inputs (GetChartState, GetGeomapFocus, GetPortfolioSummary): keine Aenderung noetig_
- [x] **ABP.2c** — Shared httpx AsyncClient — **code-complete (18.03.2026)**
  - `python-agent/agent/http_client.py` NEU: `get_client()` → Singleton `httpx.AsyncClient`
  - `Timeout(10.0, connect=5.0)`, `Limits(max_connections=20, max_keepalive_connections=10)`
  - `close_client()` in `app.py` via `app.add_event_handler("shutdown", _close_http_client)`
  - Alle Tool-Dateien (`chart_state.py`, `geomap.py`, `portfolio.py`) + `memory_client.py` nutzen `get_client()`
  - `memory_client.post_kg_seed()` nutzt `timeout=30.0` per-call (langsame Seed-Operation), alle anderen Default
  - Effekt: kein TCP-Reconnect pro Tool-Call, Connection Reuse ueber Keep-Alive
- [x] **ABP.2d** — anyio Tool-Timeout — **code-complete (18.03.2026)**
  - `TOOL_TIMEOUT_SEC = float(os.environ.get("AGENT_TOOL_TIMEOUT_SEC", "30"))` in `loop.py`
  - `anyio.move_on_after(TOOL_TIMEOUT_SEC)` als Cancel-Scope um `tool.execute()` in `_run_tool()`
  - Bei Timeout: `result = {"error": "tool timed out after Ns", "timed_out": True}` → LLM sieht Fehler
  - `anyio` ist bereits via FastAPI/Starlette vorhanden — kein neues Dependency
  - `AGENT_TOOL_TIMEOUT_SEC` dokumentiert in allen 3 python-backend `.env`-Dateien (default 30s)
- [x] **ABP.2e** — Rust Agent Hotpath Stubs — **code-complete (18.03.2026)**
  - `rust_core/Cargo.toml`: `serde_json = "1"` hinzugefuegt
  - `rust_core/src/lib.rs`: 3 private Helpers (`contains_whole_word`, `normalize_content_hash`, `tokenize_words`) + 3 Impl-Funktionen + 3 PyO3-Wrapper + Registration
  - `extract_entities_from_text(text: str) -> str` — JSON-Array von `{type, value}`-Entitaeten (ticker `$XXX`/`XXX/YYY`, country, metric, asset_class); GIL-frei via `py.detach()`
  - `dedup_context_fragments(fragments_json: str, threshold: float) -> str` — Hash-basiertes Dedup (erste 64 normalisierte Zeichen), sortiert nach `relevance_f64` desc
  - `score_tools_for_query(query, tool_names, tool_descriptions) -> list[float]` — Token-Overlap + Name-Boost (+0.25), clamp [0.0, 1.0]
  - `typings/tradeviewfusion_rust_core.pyi`: 3 neue Stubs + nachtraeglich fehlende `redb_cache_set/get` Stubs ergaenzt
  - 10 neue Unit-Tests in `rust_core/src/lib.rs` (40/40 gruen nach Korrektur)
- [x] **ABP.2f** — ml_ai Merge in python-agent — **code-complete (Phase 22g, 18.03.2026)**
  - Inhalte aus `python-backend/ml_ai/agent/` in `python-agent/agent/` uebernommen:
    - `context.py` — `AgentExecutionContext` (frozen dataclass), `CapabilityEnvelope`, `ENVELOPES`, `ADVISORY_ENVELOPE`
    - `context_assembler.py` — `assemble_context()`: KG + Episodic + Vector Layer-Assembly
    - `guards.py` — `CapabilityViolation`, Guard-Logik
    - `memory_client.py` — Go-Gateway-Proxy fuer KG/Vector/Episodes/Health
    - `roles.py` — `AgentRole` Enum (analyst/researcher/strategist/advisor)
    - `search.py` — Retrieval/Search-Hilfsfunktionen
    - `working_memory.py` — M5-Scratchpad: `working_memory_set/get/append()` (in-memory dict, thread_id-keyed)
    - `tools/__init__.py`, `tools/chart.py` (→ `chart_state.py`), `tools/geomap.py`, `tools/portfolio.py`
  - Inhalte aus `python-backend/ml_ai/context/` uebernommen:
    - `context/merge.py` — Fragment-Merge-Logik
    - `context/relevance.py` — Relevanz-Scoring
    - `context/token_budget.py` — Token-Budget-Verwaltung
  - Alle alten `ml_ai/`-Pfade in `python-backend/archive/` archiviert (git-rename, kein Hard-Delete)
  - `python-agent/` hat eigenes `pyproject.toml` + eigenes `uv`-venv — eigenstaendiges Modul
- [x] **ABP.3** — Approval Flow Contract vereinheitlichen — **code-complete stub (18.03.2026)**
  - `needs_approval()` in `validators/trading.py`: `set_chart_state` erfordert Approval in advisory mode
  - `ApprovalRequestPacket` in `streaming.py`: SSE-Event `{"type":"approval-request","tool_call_id","tool_name","tool_input"}`
  - Loop emittiert Approval-Request und gibt `pending_approval` als Tool-Result zurueck (kein Execute)
  - `AgentApproveHandler` in `agent_chat_handler.go`: Stub-Endpoint `POST /api/v1/agent/approve` → `{"ok":true}` (async dispatch Phase 22g+)
  - _Tests + Live-Verify: offen → ABP.T3 / ABP.V3; async channel dispatch deferred_
- [ ] **ABP.4** — Audit Contract fuer mutierende/high-risk agent actions erzwingen
- [ ] **ABP.5** — Failure/Degraded Envelope Contract fuer agent backend responses standardisieren
- [ ] **ABP.6** — Provenance Contract fuer retrieval/context outputs normieren (`source`, `evidence`, `confidence`)
- [ ] **ABP.7** — Connector/Adapter Reliability Contract (timeouts, fallback, retry budget, rate guards)
- [ ] **ABP.8** — Reference Adoption Matrix (adopt-as-is / adapt-mit-wrapper / reference-only) als programmweite Entscheidungstabelle pflegen
- [ ] **ABP.9** — Drift Gate: Modell-/Tool-/Schema-Aenderungen vor Rollout maschinell pruefen
- [ ] **ABP.10** — Cross-slice ownership map fixieren (welcher Teil gehoert in AMC/ASR/AHR/AGB/BG)
- [ ] **ABP.11** — Identity/Delegation Contract normieren
  (`user_id`, `agent_id`, `task_id`, delegated_scope, expiry, revocation)
- [ ] **ABP.12** — Secret-Handling Contract fuer Backend-Tool-Adapter erzwingen
  (`secret_ref` statt Klartext, redaction by default)

---

## 2. Verify-Gates

### Code-complete

- [x] **ABP.V1** — Run/Step lifecycle ist typed, dokumentiert und in mindestens einem End-to-End Pfad nachweisbar
  - `run_agent_loop()` + `AgentExecutionContext` + `streaming.py` Packet-Typen; E2E via `/api/v1/agent/chat` (18.03.2026)
  - _Live-Verify: Stack noetig → Sprint 3_
- [x] **ABP.V2** — Policy/Capability checks blockieren unzulaessige tool actions reproduzierbar
  - `validate_tool_call()` + `CapabilityEnvelope.check()` + `TradingTool.validate()` (18.03.2026)
  - _Tests offen → ABP.T2; Live-Verify: Stack noetig → Sprint 3_
- [x] **ABP.V2b** — Pydantic-Schemas korrekt in `definition()` emittiert; `validate()` wirft `ToolValidationError` bei Schema-Verletzung (18.03.2026)
  - Smoke: `SaveMemoryTool().definition()["input_schema"]` → `model_json_schema()` korrekt
- [x] **ABP.V2c** — Shared httpx Client initialisiert sich lazy, wird beim Shutdown geschlossen (18.03.2026)
  - `get_client()` gibt singleton zurueck; `close_client()` via shutdown-handler
- [x] **ABP.V2d** — anyio cancel scope wirft `timed_out: True` nach `AGENT_TOOL_TIMEOUT_SEC` Sekunden (18.03.2026)
  - Unit-testbar ohne Stack via mock `tool.execute()` mit `asyncio.sleep()`
- [x] **ABP.V2e** — Rust Wheel `cargo test` 40/40 gruen; `maturin develop` baut neu; Smoke via `uv run python -c "..."` (18.03.2026)
- [x] **ABP.V2f** — `python-agent/` startet eigenstaendig (eigenes pyproject.toml); `assemble_context()`, `working_memory_*()`, alle 6 Tools ladbar (18.03.2026)
- [x] **ABP.V3** — Approval-path stub implementiert; `approval-request` SSE-Event emittiert; Tool-Result als `pending_approval` (18.03.2026)
  - _Async channel dispatch (Go-seitig) deferred → Phase 22g+; Live-Verify: Stack noetig_
- [ ] **ABP.V4** — Audit trail enthält Pflichtfelder fuer high-risk/mutating actions
- [ ] **ABP.V5** — Degraded/failure envelopes sind konsistent, maschinenlesbar und no-silent-failure
- [ ] **ABP.V9** — Delegations ohne gueltigen Scope/TTL werden reproduzierbar geblockt
- [ ] **ABP.V10** — Klartext-Secrets erscheinen weder in adapter logs noch response envelopes

### Live-Verify (Stack nötig — Sprint 3)

- [ ] **ABP.V1-LV** — `run_agent_loop()` laeuft E2E: Anthropic-Stream + Tool-Call-Cycle + Memory-Save/Load nachweisbar
- [ ] **ABP.V2-LV** — advisory Agent versucht ORDER_TOOL → `CapabilityViolation` wird als Tool-Error-SSE zurueckgegeben
- [ ] **ABP.V3-LV** — `set_chart_state` Aufruf → `approval-request` SSE-Event sichtbar; `POST /api/v1/agent/approve` → 200 OK
- [ ] **ABP.V6-LV** — representative agent workflow bleibt stabil unter provider degradation
- [ ] **ABP.V7-LV** — retry/fallback/rate-limit Pfade sind operational nachvollziehbar
- [ ] **ABP.V8-LV** — reference-adapted backend pattern liefert messbaren Mehrwert ohne policy regression

### Phase-22g-spezifisch (NEU 18.03.2026)

- [ ] **ABP.V11-LV** — `AGENT_PROVIDER=openai-compatible` + `OPENAI_BASE_URL=http://localhost:11434/v1` → Ollama-Modell antwortet; Tool-Definitions korrekt als OpenAI-Functions uebersetzt
- [ ] **ABP.V12-LV** — `python-agent` standalone venv (`uv sync` in python-agent/) startet agent-service auf Port 8094 ohne python-backend venv

---

## 3. Testpflichten

- [ ] **ABP.T1** — Unit: run/step transition validator
- [ ] **ABP.T2** — Unit: policy/capability decision table
- [ ] **ABP.T3** — Integration: approval-required tool flow
- [ ] **ABP.T4** — Integration: degraded/failure envelope consistency
- [ ] **ABP.T5** — Integration: provenance/audit append contract
- [ ] **ABP.T6** — Regression: schema/tool/model drift guard
- [ ] **ABP.T7** — Integration: delegation lifecycle (issue -> use -> revoke -> deny)
- [ ] **ABP.T8** — Integration: secret-ref resolution + redaction proof

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

