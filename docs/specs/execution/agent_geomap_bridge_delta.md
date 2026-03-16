# Agent GeoMap Bridge Delta

> **Stand:** 16. Maerz 2026  
> **Zweck:** Schlanker Companion-Slice fuer die Agent<->GeoMap Bridge. Fokus auf GeoMap-relevante Agent-Schnittstellen (Policy, Audit, Failure/Degradation), ohne Agent-Core neu zu oeffnen.  
> **Einordnung:** Option-B-Slice (Bridge-only) zwischen `backend_geomap_delta.md` und bestehenden Agent-Ownern. Higher-level Owner fuer plattformweite Agent-Backend-Themen ist `agent_backend_program_delta.md`.

---

## 0. Execution Contract

### Scope In

- Agent->GeoMap Aktionstypen (read / bounded-write / approval-write)
- Bridge-Policy fuer erlaubte/verbotene Actions in GeoMap-Kontext
- verpflichtende Audit-/Evidence-Felder fuer Agent-initiierte GeoMap-Mutationen
- standardisierte Failure-/Degraded-Envelope fuer Agent-GeoMap-Pfade
- Contract-Tests fuer allow/deny/pause/resume/fail

### Scope Out

- generische Agent-Core-Orchestrierung (Owner: `agent_memory_context_delta.md`)
- Agent-Security-Grundmodell (Owner: `agent_security_runtime_delta.md`)
- Harness-/Sandbox-Core (Owner: `agent_harness_runtime_delta.md`)
- plattformweite Agent-Backend-Governance/Contracts (Owner: `agent_backend_program_delta.md`)
- Graph-UI-/Graph-Runtime-Interaktionen (Owner: `graph_execution_delta.md`)

### Mandatory Upstream Sources

- `docs/AGENTS_BACKEND.md`
- `docs/specs/execution/agent_backend_program_delta.md`
- `docs/specs/execution/backend_geomap_delta.md`
- `docs/specs/execution/agent_memory_context_delta.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/agent_harness_runtime_delta.md`
- `docs/specs/execution/geomap_closeout.md`
- `docs/geo/OGI_AI_REVIEW.md`

### Referenzpfade (extern)

- OGI Clone: `D:/tradingview-clones/_tmp_ref_review/geo/ogi`
- OGI Mirror: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/ogi_mirror`
- OGI Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/extraction_manifest.txt`

---

## 1. Offene Deltas

- [ ] **AGB.0** — Schnittstellen-Hierarchie explizit halten: `agent_backend_program_delta` (plattformweit) -> `agent_*_runtime` (cross-cutting runtime) -> `agent_geomap_bridge_delta` (GeoMap-spezifische Bridge)
- [ ] **AGB.1** — Agent-GeoMap-Aktionsmatrix normativ festziehen (`read-only`, `bounded-write`, `approval-write`, `forbidden`)
- [ ] **AGB.2** — GeoMap-Bridge-API-Contract definieren (request meta, action class, scope, policy decision)
- [ ] **AGB.3** — verpflichtende Auditfelder fuer agent-initiierte Geo-Mutationen erzwingen (`actor`, `agent_id`, `run_id`, `reason`, `old/new`, `policy`, `timestamp`)
- [ ] **AGB.4** — Failure-/Degraded-Envelope fuer Agent-GeoMap-Pfade vereinheitlichen (kein silent failure)
- [ ] **AGB.5** — Approval-flow fuer GeoMap-relevante Mutationen festziehen (pause/resume/reject semantics)
- [ ] **AGB.6** — Adaptergrenze dokumentieren: keine direkte Kopplung auf OGI-Agent-Core; nur pattern-adapted Contracts
- [ ] **AGB.7** — Mapping auf bestehende Agent-Owner dokumentieren (welcher Teil gehoert wohin)

---

## 2. Verify-Gates

### Code-complete

- [ ] **AGB.V1** — Aktionsmatrix fuer Agent-GeoMap ist zentral definiert und von API-Schicht erzwungen
- [ ] **AGB.V2** — Mutierende Agent-GeoMap-Aktionen ohne erforderliche Auditfelder werden abgewiesen
- [ ] **AGB.V3** — Approval-required Aktionen folgen reproduzierbar `pending -> approved/rejected -> resolved`
- [ ] **AGB.V4** — Fehler-/Degraded-Antworten sind konsistent und maschinenlesbar

### Live-Verify

- [ ] **AGB.V5-LV** — Allow-/Deny-Pfade fuer Agent-GeoMap im laufenden Stack nachvollziehbar
- [ ] **AGB.V6-LV** — Approval-flow ist operator-tauglich (inkl. audit trail und request correlation)
- [ ] **AGB.V7-LV** — Provider-/backend-Ausfall fuehrt zu degradiertem Bridge-Verhalten ohne Datenverlust

---

## 3. Testpflichten

- [ ] **AGB.T1** — Unit: Action-class resolution + role/policy checks
- [ ] **AGB.T2** — Unit: Audit field validator fuer agent-initiierte Mutationen
- [ ] **AGB.T3** — Integration: approval-required mutation flow (approve/reject)
- [ ] **AGB.T4** — Integration: degraded/failure envelope consistency
- [ ] **AGB.T5** — E2E/API: agent->geomap mutation + audit append + replay visibility

---

## 4. Evidence Requirements

Fuer jeden geschlossenen Punkt mindestens:

- ID (`AGB.*`, `AGB.V*`, `AGB.T*`)
- reproduzierbarer Ablauf (API/Test)
- erwartetes vs. beobachtetes Ergebnis
- Referenz auf Owner-Dokument(e)
- bei Live-Gates: Request/Response-Beispiele mit Request-ID und Audit-Nachweis

---

## 5. Propagation Targets

- `docs/AGENTS_BACKEND.md`
- `docs/specs/execution/agent_backend_program_delta.md`
- `docs/specs/execution/backend_geomap_delta.md`
- `docs/specs/execution/geomap_closeout.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/geo/OGI_AI_REVIEW.md`

---

## 6. Exit Criteria

- `AGB.1-AGB.6` abgeschlossen oder sauber deferred mit Owner/Datum
- mindestens `AGB.V1-AGB.V4` code-complete nachgewiesen
- mindestens `AGB.T1-AGB.T4` vorhanden
- offene Live-Gates als Folgearbeit explizit verankert

