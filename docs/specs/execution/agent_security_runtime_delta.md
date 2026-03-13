# Agent Security Runtime Delta

> **Stand:** 13. Maerz 2026
> **Zweck:** Execution-Owner fuer agentische Runtime-Sicherheitsgrenzen
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
- `docs/CONTEXT_ENGINEERING.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`

---

## 1. Offene Deltas

- [ ] **ASR1** Retrieval Broker als erzwungene Agent-Read-Boundary aktivieren
- [ ] **ASR2** Retrieval-Policies um ACL/sensitivity/source-trust/provenance erweitern
- [ ] **ASR3** Tool Proxy als einzige Tool-Execution-Boundary fuer Agenten durchsetzen
- [ ] **ASR4** Capability Envelope-Schema und Runtime-Validation verbindlich machen
- [ ] **ASR5** Agentic-Storage Write-Path mit versioniertem Publish-Gate einfuehren
- [ ] **ASR6** High-risk Writes nur mit Policy-Decision-ID + Audit durchlassen
- [ ] **ASR7** Evidence-Completeness Rules fuer kritische Agent-Antworten definieren
- [ ] **ASR8** Security-Eval-Suite (injection/misuse/leakage) als Pflichtgate anbinden

---

## 2. Verify-Gates

- [ ] **ASR.V1** Kein Agent-Read ohne Retrieval Broker (negative test)
- [ ] **ASR.V2** Kein Tool-Call ohne valide Capability Envelope
- [ ] **ASR.V3** High-risk Tool-Calls ohne Approval/Scope werden geblockt
- [ ] **ASR.V4** Agentic Writes sind versioniert und auditierbar nachvollziehbar
- [ ] **ASR.V5** Evidence-Completeness Gate markiert/stoppt unvollstaendige Claims
- [ ] **ASR.V6** Security-Regression-Suite laeuft stabil in lokaler und CI-naher Umgebung

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
