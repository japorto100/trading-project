# Agent Security Runtime Delta

> **Stand:** 18. Maerz 2026 (Rev. 2)
> **Zweck:** Execution-Owner fuer agentische Runtime-Sicherheitsgrenzen
> **Aenderungshistorie:**
> - Rev. 1 (13.03.2026): Erstanlage — ASR1–ASR13 Contracts, Verify-Gates
> - Rev. 2 (18.03.2026): ASR3/ASR4 code-complete; ASR2 partial code-complete (Phase 22g Loop-Neubau)
> (Retrieval Broker, Tool Proxy, Capability Envelope, Agentic-Storage Write-Path,
> Evidence-Completeness Gates, Security-Evals).

---

## 0. Execution Contract

### Scope In

- Retrieval Broker als verpflichtender Zugriffspfad fuer Agent-Kontext
- Tool Proxy mit Capability Envelope und JIT-Scope
- kontrollierter Agentic-Storage Write-Path (`draft -> review -> approved -> published`)
- Evidence-Completeness Gates fuer kritische Claims/Actions
- Security-Evals als dauerhafte Verify-Gates

### Scope Out

- allgemeine Auth-/Session-Details (Owner: `specs/security/AUTH_MODEL.md`)
- Secrets-Storage im engeren Sinn (Owner: `specs/security/SECRETS_BOUNDARY.md`)
- Incident-Runbooks (Owner: `specs/security/INCIDENT_RESPONSE.md`)

### Mandatory Upstream Sources

- `docs/AGENT_SECURITY.md`
- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/AGENT_CODE_MODE.md` (fuer optionalen High-Volume-Processing-Pfad unter denselben Security-Gates)
- `docs/AGENT_MODEL_TOKEN_TUNING.md` (langfristige Modell-/Token-Tuning-Leitplanken; Security-Gates bleiben bindend)
- `docs/CONTEXT_ENGINEERING.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`

### Security Baseline (Research, frisch)

- arXiv (11.03.2026): `The Attack and Defense Landscape of Agentic AI`
  — https://arxiv.org/pdf/2603.11088

---

## 1. Offene Deltas

- [ ] **ASR1** Retrieval Broker als erzwungene Agent-Read-Boundary aktivieren
- [~] **ASR2** Retrieval-Policies um ACL/sensitivity/source-trust/provenance erweitern — **partial code-complete (18.03.2026)**
  - Capability-Teil implementiert: `CapabilityEnvelope.allowed_tools` frozenset + `check()` raises `CapabilityViolation`
  - `validate_tool_call()` in `validators/trading.py` erzwingt Envelope-Check vor jedem Tool-Call
  - _ACL/sensitivity/source-trust/provenance fehlen → Sprint 5 (ASR1 Retrieval Broker als Voraussetzung)_
- [x] **ASR3** Tool Proxy als einzige Tool-Execution-Boundary fuer Agenten durchsetzen — **code-complete (18.03.2026)**
  - `TradingTool` ABC in `python-agent/agent/tools/base.py`: `name / definition() / validate() / execute()`
  - Alle Standard-Tools subklassieren `TradingTool`; Loop ermittelt per `registry.lookup()` → kein direkter Bypass moeglich
  - `SetChartStateTool.validate()` blockt advisory-Agents; `validate_tool_call()` wird vor jedem `execute()` aufgerufen
  - _Verify: ASR.V2 (kein Tool-Call ohne valide Capability Envelope); Tests: ABP.T2 offen_
- [x] **ASR4** Capability Envelope-Schema und Runtime-Validation verbindlich machen — **code-complete (18.03.2026)**
  - `@dataclass(frozen=True) CapabilityEnvelope` in `python-agent/agent/context.py`: `agent_class`, `allowed_tools` frozenset, `risk_level`, `needs_human_approval`; `check(tool_name)` raises `CapabilityViolation`
  - `ADVISORY_ENVELOPE` als Default: `frozenset({get_chart_state, set_chart_state, get_portfolio_summary, get_geomap_focus, save_memory, load_memory})`
  - `ENVELOPES: dict[str, CapabilityEnvelope]` — erweiterbar fuer kuenftige agent_class-Typen
  - ORDER_TOOLS (`place_order, cancel_order, modify_position`) geblockt fuer advisory-class via `_ORDER_TOOLS` frozenset
  - _Verify: ASR.V2 + ASR.V3; Live-Verify (Stack noetig → Sprint 3): ABP.V2-LV_
- [ ] **ASR5** Agentic-Storage Write-Path mit versioniertem Publish-Gate einfuehren
- [ ] **ASR6** High-risk Writes nur mit Policy-Decision-ID + Audit durchlassen
- [ ] **ASR7** Evidence-Completeness Rules fuer kritische Agent-Antworten definieren
- [ ] **ASR8** Security-Eval-Suite (injection/misuse/leakage) als Pflichtgate anbinden
- [ ] **ASR9** Contextual-Security-Checks fuer kritische Tool-Calls erzwingen
  (task/context-integrity vor Ausfuehrung)
- [ ] **ASR10** Credential-Broker/Vault-Pfad als einzigen Secret-Zugriffspfad erzwingen
  (kein Klartext-Secret in Agent-Kontext)
- [ ] **ASR11** IFC/Taint-Baseline aktivieren (`trusted/untrusted/sensitive` Labels
  bis zu tool/output sinks)
- [ ] **ASR12** Cache-Security-Policy aus `AGENT_MODEL_TOKEN_TUNING.md` uebernehmen
  (tenant isolation, keying, invalidation, sensitive-prefix block)
- [ ] **ASR13** Langfristige Modell-/Kontext-Experimente nur hinter Security-Risk-Review
  und expliziter Freigabe durchfuehren (kein stiller Produktivpfad)

---

## 2. Verify-Gates

- [ ] **ASR.V1** Kein Agent-Read ohne Retrieval Broker (negative test)
- [ ] **ASR.V2** Kein Tool-Call ohne valide Capability Envelope
  - _Code-Complete: `CapabilityEnvelope.check()` + `validate_tool_call()` implementiert (18.03.2026)_
  - _Live-Verify (Stack noetig → Sprint 3): advisory Agent versucht ORDER_TOOL → `CapabilityViolation` als Tool-Error-SSE_
- [ ] **ASR.V3** High-risk Tool-Calls ohne Approval/Scope werden geblockt
  - _Code-Complete: `needs_approval()` + `ApprovalRequestPacket` SSE stub implementiert (18.03.2026)_
  - _Live-Verify: ABP.V3-LV (Sprint 3)_
- [ ] **ASR.V4** Agentic Writes sind versioniert und auditierbar nachvollziehbar
- [ ] **ASR.V5** Evidence-Completeness Gate markiert/stoppt unvollstaendige Claims
- [ ] **ASR.V6** Security-Regression-Suite laeuft stabil in lokaler und CI-naher Umgebung
- [ ] **ASR.V7** Contextual-Security blockiert Tool-Calls bei Kontextkonflikt reproduzierbar
- [ ] **ASR.V8** Secret-Zugriffe ohne Vault-Referenz werden reproduzierbar geblockt
- [ ] **ASR.V9** Taint-Labels propagieren korrekt und verhindern `sensitive -> external sink`
- [ ] **ASR.V10** Cache-Reuse ueber unterschiedliche Security-Kontexte wird reproduzierbar blockiert
- [ ] **ASR.V11** Langfrist-Experimente (Hybrid/Long-Context) zeigen keine Policy-Bypass-Pfade im Shadow-Run

---

## 3. Evidence Requirements

- reproduzierbare Positiv-/Negativtests pro Delta-ID
- auditable Decision-Trace (`who`, `scope`, `policy_decision`, `result`)
- Nachweis fuer blocked paths (scope violation, missing envelope, missing evidence)
- Querverweis auf aktualisierte Owner-Dokumente

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`
- `docs/specs/security/SECURITY_HARDENING_TRACKS.md`
- `docs/specs/execution/agent_memory_context_delta.md`
