# Future Quant & Advanced Architecture Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Expliziter Delta-Plan fuer die langfristigen Referenzdokumente
> `Future-Quant-trading.md` und `Advanced-architecture-for-the-future.md`, damit
> Trigger-basierte Adoption nicht implizit bleibt.

---

## 0. Execution Contract

### Scope In

- Trigger-basierte Ueberfuehrung von Future-Quant-Konzepten in konkrete Backlog-Slices
- Uebernahme anwendbarer Advanced-Architecture-Patterns in testbare Workpacks
- harte Trennung zwischen Referenzradar und produktiver Delivery

### Scope Out

- automatische Adoption aller Referenzideen ohne Priorisierung
- Vollimplementierung langfristiger Forschungsthemen ohne Baseline-Reife

### Mandatory Upstream Sources

- `docs/Future-Quant-trading.md`
- `docs/Advanced-architecture-for-the-future.md`
- `docs/INDICATOR_ARCHITECTURE.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/UNIFIED_INGESTION_LAYER.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/compute_delta.md`
- `docs/specs/execution/domain_intelligence_delta.md`

---

## 1. Trigger-Matrix (wann wird was aktiv?)

| Trigger | Aktivierbare Slices | Ziel-Owner |
|:--------|:--------------------|:-----------|
| ML-Inference-Service produktionsreif | AFML Meta-Labeling, FracDiff, CPCV-basierte Evaluation | `compute_delta.md` |
| Regime/HMM/Markov Baseline steht | MDP-/Markov-Erweiterungen, Regime-Transitions | `domain_intelligence_delta.md` |
| UIL + Feedback-Loop stabil | Guardrails, Continual-Learning, Drift-Handling | `agent_memory_context_delta.md`, `claim_verification_delta.md` |
| Backtest Engine + OOS-Framework stabil | Synthetic-Data/Stress-Testing, Deflated Sharpe/Fragility | `compute_delta.md` |
| Frontend Perf + Explainability Surface bereit | SHAP/Counterfactual Surfaces, Explain-Why Panels | `frontend_refinement_perf_delta.md` |

---

## 2. Offene Deltas

- [ ] **FQAA1** Future-Quant Konzepte in priorisierte Cluster ueberfuehren (adopt/defer/reject)
- [ ] **FQAA2** Advanced-Architecture-Patterns auf direkte Uebertragbarkeit pruefen
- [ ] **FQAA3** Trigger->Owner-Routing verbindlich pflegen (kein orphan concept)
- [ ] **FQAA4** Referenzkonzepte mit vorhandenen Todos in `INDICATOR_ARCHITECTURE.md` abgleichen
- [ ] **FQAA5** Long-range Themen nur mit Evidence in aktive Phasen heben
- [ ] **FQAA6** Radar-Themen, die bewusst ausgeschlossen bleiben, explizit markieren

---

## 3. Verify-Gates

- [ ] **FQAA.V1** Mindestens ein Future-Quant-Cluster mit sauberer Adopt-Entscheidung
- [ ] **FQAA.V2** Mindestens ein Advanced-Architecture-Pattern mit begruendetem Defer/Reject
- [ ] **FQAA.V3** Kein Trigger-aktiviertes Konzept ohne Ziel-Owner-Execution-MD
- [ ] **FQAA.V4** Evidence-Log fuer Entscheidungen vorhanden

---

## 4. Evidence Requirements

- FQAA-ID + betroffenes Konzept
- Trigger-Nachweis (welche Voraussetzung ist erfuellt)
- Entscheidung (`adopt` / `defer` / `reject`) + Begruendung
- Ziel-Owner und naechster Verify-Punkt

---

## 5. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/Future-Quant-trading.md`
- `docs/Advanced-architecture-for-the-future.md`
- `docs/INDICATOR_ARCHITECTURE.md`
- `docs/specs/execution/root_geo_references_coverage.md`
- betroffene Ziel-Owner-MDs (`compute_delta.md`, `domain_intelligence_delta.md`, ...)

---

## 6. Exit Criteria

- `FQAA1-FQAA6` entschieden
- Trigger-Matrix und Phase-Board sind konsistent
- beide Referenzdocs sind explizit operationalisiert und nicht mehr nur indirekt abgedeckt
