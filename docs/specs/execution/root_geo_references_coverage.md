# Root/Geo/References Coverage Matrix

> **Stand:** 09. Maerz 2026  
> **Zweck:** Vollstaendige Zuordnung aller Root-MDs, `docs/geo/*.md` und
> `docs/references/**/*.md` auf Execution-Owner, Checkpoints und Folgeaktionen.
> Dieses Dokument ist der operative Beleg, dass keine relevante Quelle ohne
> Execution-Anbindung bleibt.

---

## 0. Execution Contract

### Mandatory Read Rule

CLI-Agents duerfen keine Task-Abnahme aus diesem Dokument als "geschlossen"
bewerten, ohne die jeweilige Quell-MD gelesen zu haben.

### Owner-Regel

- Bestehende Owner:  
  `cross_cutting_verify.md`, `compute_delta.md`, `infra_provider_delta.md`,
  `storage_layer_delta.md`, `source_onboarding_and_keys.md`,
  `geomap_closeout.md`
- Neue Owner (wenn benoetigt):  
  `agent_memory_context_delta.md`, `claim_verification_delta.md`,
  `uil_candidate_promotion_delta.md`, `domain_intelligence_delta.md`,
  `references_projects_evaluate_delta.md`

---

## 1. Root-MDs (`docs/*.md`)

| Quelle | Klasse | Execution-Owner | Checkpoint |
|:-------|:-------|:----------------|:-----------|
| `README.md` | index/owner-map | `EXECUTION_PLAN.md` | `COV.ROOT.001` Root-Read-Order gegen Owner-Matrix synchron |
| `GO_GATEWAY.md` | runtime/gateway | `infra_provider_delta.md` | `COV.ROOT.002` Gateway-Boundary + rollout-konforme Verify-Gates |
| `go-gct-gateway-connections.md` | runtime/perf | `infra_provider_delta.md` | `COV.ROOT.003` Benchmark-/stream-hardening checkpoints angezogen |
| `go-research-financial-data-aggregation-2025-2026.md` | provider research | `infra_provider_delta.md` | `COV.ROOT.004` nur konkrete rollout-faehige Slices uebernommen |
| `storage_layer.md` | storage root decision | `storage_layer_delta.md` | `COV.ROOT.005` Decision-Heuristik in SL1-SL12 gespiegelt |
| `INDICATOR_ARCHITECTURE.md` | compute domain | `compute_delta.md` | `COV.ROOT.006` Research-vs-Hotpath Trennung verifiziert |
| `RUST_LANGUAGE_IMPLEMENTATION.md` | compute runtime | `compute_delta.md` | `COV.ROOT.007` Rust-Portierungsprioritaet und Ownership konsistent |
| `Portfolio-architecture.md` | portfolio analytics | `cross_cutting_verify.md` | `COV.ROOT.008` Phase-5 Verify-Flows an Architekturziele gekoppelt |
| `UNIFIED_INGESTION_LAYER.md` | ingestion/promotion | `uil_candidate_promotion_delta.md` (neu) | `COV.ROOT.009` candidate->promotion Contracts operationalisiert |
| `AGENT_ARCHITECTURE.md` | agent runtime | `agent_memory_context_delta.md` (neu) | `COV.ROOT.010` agent-runtime checkpoints/Gates abgeleitet |
| `AGENT_TOOLS.md` | tools/capabilities | `agent_memory_context_delta.md` (neu) | `COV.ROOT.011` tool-policy + capability verify aufgenommen |
| `MEMORY_ARCHITECTURE.md` | memory graph | `agent_memory_context_delta.md` (neu) | `COV.ROOT.012` memory integrity + retrieval checkpoints |
| `CONTEXT_ENGINEERING.md` | context assembly | `agent_memory_context_delta.md` (neu) | `COV.ROOT.013` context quality/evidence checkpoints |
| `CLAIM_VERIFICATION_ARCHITECTURE.md` | claim/evidence | `claim_verification_delta.md` (neu) | `COV.ROOT.014` contradiction/evidence/trace verify |
| `GAME_THEORY.md` | domain intelligence | `domain_intelligence_delta.md` (neu) | `COV.ROOT.015` simulation/strategy acceptance gates |
| `ENTROPY_NOVELTY.md` | domain signals | `domain_intelligence_delta.md` (neu) | `COV.ROOT.016` signal novelty checkpoints |
| `POLITICAL_ECONOMY_KNOWLEDGE.md` | domain knowledge | `domain_intelligence_delta.md` (neu) | `COV.ROOT.017` macro-political signal integration gates |
| `REFERENCE_PROJECTS.md` | root bridge | `references_projects_evaluate_delta.md` (neu) | `COV.ROOT.018` bridge->references handoff verifiziert |
| `REFERENCE_SOURCE_STATUS.md` | root bridge | `source_onboarding_and_keys.md` + `infra_provider_delta.md` | `COV.ROOT.019` bridge-status konsistent mit `references/status.md` |
| `Advanced-architecture-for-the-future.md` | long-range ref | `EXECUTION_PLAN.md` | `COV.ROOT.020` nur als optional backlog-radar markiert |
| `Future-Quant-trading.md` | long-range ref | `compute_delta.md` + `domain_intelligence_delta.md` (neu) | `COV.ROOT.021` nur konkrete, testbare slices extrahiert |
| `FRONTEND_COMPONENTS.md` | UI component ref | `frontend_refinement_perf_delta.md` (neu) | `COV.ROOT.022` UI-gates mit component-surface geprueft |
| `MRKTEDGE.AI-deep research chatgptp2.md` | benchmark ref | `references_projects_evaluate_delta.md` (neu) | `COV.ROOT.023` evaluate/decision-gate statt lose Referenz |

---

## 2. Geo-MDs (`docs/geo/*.md`)

| Quelle | Klasse | Execution-Owner | Checkpoint |
|:-------|:-------|:----------------|:-----------|
| `GEOMAP_OVERVIEW.md` | umbrella/owner matrix | `geomap_closeout.md` | `COV.GEO.001` read-order + owner-matrix in closeout gespiegelt |
| `GEOMAP_PRODUCT_AND_POLICY.md` | product/policy | `geomap_closeout.md` | `COV.GEO.002` M-/D-/E-/F-punkte policy-konsistent |
| `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` | contracts/feedback | `geomap_closeout.md` + `claim_verification_delta.md` (neu) | `COV.GEO.003` API-/feedback-/contradiction checkpoints operationalisiert |
| `GEOMAP_SOURCES_AND_PROVIDER_POLICY.md` | source/provider policy | `infra_provider_delta.md` + `source_onboarding_and_keys.md` | `COV.GEO.004` source-policy in rollout/onboarding gespiegelt |
| `GEOMAP_FOUNDATION.md` | basemap/geocoding/rendering | `geomap_closeout.md` | `COV.GEO.005` FD.* + gate A/B/C verify abgedeckt |
| `GEOMAP_MODULE_CATALOG.md` | module strategy | `geomap_closeout.md` | `COV.GEO.006` d3-module checkpoints O.* und budgets gepflegt |
| `GEOMAP_VERIFY_GATES.md` | geo verification | `geomap_closeout.md` + `cross_cutting_verify.md` | `COV.GEO.007` E2E/perf/save-failure Nachweise konsistent |
| `GEOMAP_ROADMAP_AND_MILESTONES.md` | milestones | `geomap_closeout.md` + `EXECUTION_PLAN.md` | `COV.GEO.008` milestone status mit Phase-Board synchron |

---

## 3. References-MDs (`docs/references/**/*.md`)

| Quelle | Klasse | Execution-Owner | Checkpoint |
|:-------|:-------|:----------------|:-----------|
| `references/README.md` | references index | `references_projects_evaluate_delta.md` (neu) | `COV.REF.001` intake/owner-regeln in execution gespiegelt |
| `references/status.md` | active source status | `infra_provider_delta.md` + `source_onboarding_and_keys.md` | `COV.REF.002` rollout-status und key-matrix konsistent |
| `references/sources/README.md` | source taxonomy | `source_onboarding_and_keys.md` | `COV.REF.003` intake-regel als onboarding-gate verankert |
| `references/sources/market-data.md` | source catalog | `infra_provider_delta.md` | `COV.REF.004` representative provider gates fuer Gruppe gesetzt |
| `references/sources/macro-and-central-banks.md` | source catalog | `infra_provider_delta.md` | `COV.REF.005` Batch-2/3 Verify-Vertrag gespiegelt |
| `references/sources/legal-and-regulatory.md` | source catalog | `infra_provider_delta.md` | `COV.REF.006` legal/reg source paths mit error/timeout verify |
| `references/sources/financial-stability-and-nbfi.md` | source catalog | `infra_provider_delta.md` | `COV.REF.007` stress/nbfi feeds als representative rollout gates |
| `references/sources/unconventional-and-translation.md` | source catalog | `references_projects_evaluate_delta.md` (neu) | `COV.REF.008` low-trust sources nur via evaluate/guardrails |
| `references/sources/sovereign-and-corridors.md` | source catalog | `domain_intelligence_delta.md` (neu) | `COV.REF.009` sovereign/corridor domain gates |
| `references/projects/README.md` | projects index | `references_projects_evaluate_delta.md` (neu) | `COV.REF.010` evaluate/to-watch->decision workflow |
| `references/projects/evaluate.md` | active evaluation | `references_projects_evaluate_delta.md` (neu) | `COV.REF.011` evaluation gates + decision ledger |
| `references/projects/to-watch.md` | watchlist | `references_projects_evaluate_delta.md` (neu) | `COV.REF.012` promote/defer/reject criteria |
| `references/projects/frontend-ui.md` | project catalog | `references_projects_evaluate_delta.md` (neu) + `cross_cutting_verify.md` | `COV.REF.013` ui-kandidaten an browser-verify gekoppelt |
| `references/projects/go-clients-and-adapters.md` | project catalog | `references_projects_evaluate_delta.md` (neu) + `infra_provider_delta.md` | `COV.REF.014` adapter-kandidaten in rollout-checks |
| `references/projects/python-and-rust.md` | project catalog | `references_projects_evaluate_delta.md` (neu) + `compute_delta.md` | `COV.REF.015` compute-kandidaten in G1-G7 decisions |
| `references/projects/knowledge-and-ml.md` | project catalog | `references_projects_evaluate_delta.md` (neu) + `agent_memory_context_delta.md` (neu) | `COV.REF.016` ml/kg-kandidaten in runtime-gates |

---

## 4. Coverage-Status nach dieser Runde

### Bestehende Execution-Owner decken direkt ab

- Gateway/provider/onboarding/storage/compute/geo verify
- cross-cutting acceptance ueber zentrale Phasen

### Gaps, die neue Owner erfordern

- Agent/Memory/Context Runtime
- Claim Verification / Evidence Pipeline
- UIL / Candidate Promotion
- Domain Intelligence (Game Theory, Entropy, Political Economy, Sovereign/Corridors)
- References Projects Evaluate/To-Watch Workflow

---

## 5. Abschlussregel fuer Matrixpflege

- Keine neue Root-/Geo-/References-MD ohne neuen `COV.*`-Checkpoint.
- Bei Umbenennung/Archivierung von Quellen wird Matrix-Eintrag sofort angepasst.
- `EXECUTION_PLAN.md` uebernimmt nur konsolidierte Ergebnisse; diese Matrix bleibt Detail-Owner fuer Vollabdeckung.
