# Agent Harness Runtime Delta

> **Stand:** 13. Maerz 2026
> **Zweck:** Execution-Owner fuer Harness-Haertung aus `docs/AGENT_HARNESS.md`
> mit Fokus auf Runtime-Guardrails, OpenSandbox-Boundary, minimalistische
> Agent-Control-Flows und eval-getriebene Regression-Gates.

---

## 0. Execution Contract

### Scope In

- Harness-Leitlinien als verbindliche Runtime-Regeln (Constrain/Inform/Verify/Correct)
- OpenSandbox als erzwungene Execution-Boundary fuer agentische Code-/Tool-Runs
- minimalistische Control-Flow-Standards statt unkontrolliertem Framework-Bloat
- Guardrail-Runtime fuer Input/Retrieval/Execution/Output
- Agentic-Evals und Security-Regressions als Pflicht-Gates
- LLM-Routing-/FinOps-Optionen (`LiteLLM`, `RouteLLM`) als evaluate-only Pfad mit klaren Adoption-Gates
- Token-/Semantic-Caching (Prefix-/Prompt-Cache vs. Semantic-Cache) als evaluate-only mit Adoption-Gates; cache-stabile Prompt-Struktur (statisch/dynamisch trennen) als Runtime-Standard

### Scope Out

- allgemeine Produkt-UX- oder Styling-Themen
- nicht-agentische Compute-/Provider-Optimierungen
- tiefe Policy-Detailregeln ausserhalb der Agent-Runtime-Boundary

### Mandatory Upstream Sources

- `docs/AGENT_HARNESS.md`
- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/AGENT_SECURITY.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/agent_memory_context_delta.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`

---

## 1. Offene Deltas

- [ ] **AHR1** Harness-Boundary-Contract (`Constrain/Inform/Verify/Correct`) als Runtime-Owner-Matrix festziehen
- [ ] **AHR2** OpenSandbox als verpflichtenden Agent-Execution-Pfad technisch erzwingen (inkl. Session-Lifecycle, Audit-Trace, Kill-Switch)
- [ ] **AHR3** Host-Execution-Bypass fuer agentische Code-/Tool-Ausfuehrung blockieren (negative paths)
- [ ] **AHR4** minimalistische Agent-Control-Flow-Standards definieren (State-Machine, Retry, Replan, Abort, Human-Approval fuer High-Risk-Pfade)
- [ ] **AHR5** Framework-Adoption-Guard definieren (nur bei Evidence fuer DAG-/Cycle-Mehrwert)
- [ ] **AHR6** Guardrail-Rails fuer Input/Retrieval/Execution/Output verbindlich machen
- [ ] **AHR7** Eval-Suite aus realen Failure-Cases ableiten und versioniert pflegen
- [ ] **AHR8** Security-Regression (injection/misuse/leakage) als blockierendes Delivery-Gate anbinden
- [ ] **AHR9** Drift-Checks fuer Modell-/Tool-Interface-Aenderungen (inkl. MCP-/Schema-Kompatibilitaet) etablieren
- [ ] **AHR10** AgentFlow (OpenDCAI) als optionalen Framework-Kandidaten evaluieren (Evaluate-only, kein Default-Switch ohne Evidence)
- [ ] **AHR11** LiteLLM evaluate: Provider-Abstraktion, Budget-Gates und Fallback-Routing gegen bestehenden Runtime-Pfad vergleichen
- [ ] **AHR12** RouteLLM evaluate: learned routing policy nur bei belastbarer Eval-Datenlage und klaren Failure-Klassen pruefen
- [ ] **AHR13** Token-/Semantic-Caching evaluieren (Prefix-/Prompt-Cache vs. Semantic-Cache, Safety/Invalidation, FinOps-Metriken); evaluate-only, kein Default ohne Evidence
- [ ] **AHR14** Cache-stabile Prompt-Struktur (statisch/dynamisch strikt getrennt) als Runtime-Standard durchsetzen
- [ ] **AHR15** Runtime-Prozesssteuerung (z. B. supervisord) fuer API+Worker-Setups dokumentieren bzw. Beispiel-Config bereitstellen (`tools/supervisor/supervisord.example.conf`)

---

## 2. Verify-Gates

- [ ] **AHR.V1** Kein agentischer Code-/Tool-Run ausserhalb OpenSandbox (negative test)
- [ ] **AHR.V2** Harness-Contract wird in mindestens einem End-to-End-Agent-Flow vollstaendig eingehalten
- [ ] **AHR.V3** Guardrail-Rails blockieren Injection-/Policy-Verletzungen reproduzierbar
- [ ] **AHR.V4** Framework-Guard verhindert ungerechtfertigten Orchestrierungs-Bloat
- [ ] **AHR.V5** Agentic-Evals laufen stabil lokal und CI-nah mit dokumentierter Baseline
- [ ] **AHR.V6** Modell-/Tool-Interface-Drift wird vor Rollout erkannt und eskaliert
- [ ] **AHR.V7** AgentFlow-Eval belegt Mehrwert in mindestens zwei relevanten Failure-Klassen (z. B. Replan/Coordination/Tool-Routing) ohne Regression bei Guardrails/OpenSandbox
- [ ] **AHR.V8** Routing-FinOps-Gate: `cost per successful run` sinkt gegen Baseline, ohne Erfolgsquote oder Policy-Compliance zu verschlechtern
- [ ] **AHR.V9** Mode-/Tool-Routing-Gate: over-call/under-call/tool-misroute sind gegen Baseline reduziert und reproduzierbar dokumentiert
- [ ] **AHR.V10** Cache-FinOps-Gate: Hit-Rate/Token-Saved/Cost-Saved gegen Baseline, ohne Qualitaets-/Policy-Regression
- [ ] **AHR.V11** Cache-Safety-Gate: Tenant-Isolation, keine Cross-User-Leaks, Stale-Hit-Rate begrenzt

---

## 3. Evidence Requirements

- Positiv-/Negativnachweise fuer OpenSandbox-Enforcement
- Trace-Beispiele fuer Guardrail-Entscheidungen je Rail-Typ
- reproduzierbare Eval-Ergebnisse mit klaren Success/Fail-Kriterien
- dokumentierte Failure-Replays und deren Korrekturpfade
- Querverweise auf aktualisierte Root- und Spec-Dokumente
- bei `AHR10`: Vergleichsprotokoll `status quo` vs. `AgentFlow` mit
  expliziter Go/No-Go-Entscheidung
- bei `AHR11-AHR12`: Vergleichsprotokoll `status quo` vs. Router-Pfad
  (`LiteLLM`/`RouteLLM`) inkl. Kosten-, Erfolgs- und Policy-Metriken
- bei `AHR13-AHR14`: Cache-Strategie- und Benchmark-Protokoll (Hit-Rate, Token-Saved, Safety/Invalidation), reproduzierbar

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`
- `docs/specs/security/SECURITY_HARDENING_TRACKS.md`
- `docs/specs/execution/agent_security_runtime_delta.md`
- `docs/specs/execution/agent_memory_context_delta.md`
