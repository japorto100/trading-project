# MASTER EXECUTION PLAN

> **Stand:** 09. Maerz 2026 (Doc Refresh Rev. 4)
> **Zweck:** Hoechst-Level Roadmap, Statusspiegel fuer offene Arbeit und Einstieg
> in die fuehrenden Detaildokumente. Dieses Dokument ist bewusst **kein**
> Changelog, kein Vollindex aller historischen Slices und keine zweite
> `SYSTEM_STATE.md`.
> **Historie / Ledger:** [`../archive/EXECUTION_PLAN_HISTORY.md`](../archive/EXECUTION_PLAN_HISTORY.md)

---

## 1. Was dieses Dokument besitzt

`EXECUTION_PLAN.md` ist nach dem Refresh nur noch Owner fuer:

- offene und aktive Roadmap
- Phasenstatus auf hoher Ebene
- aktuelle Verify-Gates
- Verweise auf fuehrende Mini-Plaene und Fachdokumente
- Dokument-Ownership fuer Arbeitsplanung

Es ist **nicht** mehr Owner fuer:

- lange Revisionshistorien
- erledigte Sprint-Erzaehlungen
- IST/SOLL pro Schicht
- tiefes Endpoint- oder Frontend-Detail

### Pflegepflicht fuer Specs

Die aktiven `docs/specs/*.md` muessen fortlaufend **up to date** gehalten werden.
Wenn Code-, Port-, Boundary-, Auth- oder Ownership-Realitaet sich aendert, wird
nicht nur der Code, sondern auch die fuehrende Spec aktualisiert. Historische
Erzaehlungen gehoeren ins Archiv, nicht in aktive Sources of Truth.

Dafuer gelten:

- Runtime- und Schichtenwahrheit: [`SYSTEM_STATE.md`](./SYSTEM_STATE.md)
- Sync-/Async-/Boundary-Architektur: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- API- und Transportvertraege: [`API_CONTRACTS.md`](./API_CONTRACTS.md) (Index; Details in `api/`)
- Auth / Policy / Trust: [`AUTH_SECURITY.md`](./AUTH_SECURITY.md) (Index; Details in `security/`)
- Frontend-Boundaries und State-Schnitt: [`FRONTEND_ARCHITECTURE.md`](./FRONTEND_ARCHITECTURE.md)

---

## 2. Fuehrende Detaildokumente

| Thema | Fuehrendes Dokument | Rolle |
|:------|:--------------------|:------|
| Gesamt-Roadmap | `EXECUTION_PLAN.md` | Priorisierung, Status, offene Gates |
| IST/SOLL Schichten | `SYSTEM_STATE.md` | kompakte Runtime-Wahrheit |
| Sync/Async Zielarchitektur | `ARCHITECTURE.md` | technische Leitplanken |
| API / Transport / Headers | `API_CONTRACTS.md` | Contract-Authority |
| Frontend / BFF / State | `FRONTEND_ARCHITECTURE.md` | Frontend-Authority |
| Auth / RBAC / Security | `AUTH_SECURITY.md` | Security-Authority |
| Compute-Split Go/Python/Rust | `execution/compute_delta.md` | aktiver Delta-Plan |
| Infra / Provider / Messaging | `execution/infra_provider_delta.md` | aktiver Delta-Plan |
| Storage Layer (SeaweedFS/Garage) | `execution/storage_layer_delta.md` | aktiver Delta-Plan |
| Quellen / Keys / Env-Onboarding | `execution/source_onboarding_and_keys.md` | operative Onboarding-Checkliste |
| GeoMap Closeout / offene Punkte | `execution/geomap_closeout.md` | GeoMap-Checkliste + Verify-Gates |
| Cross-cutting Verify Restpunkte | `execution/cross_cutting_verify.md` | aktive Checkliste |
| Root/Geo/References Vollabdeckung | `execution/root_geo_references_coverage.md` | File-fuer-File Coverage-Matrix |
| Agent/Memory/Context Runtime | `execution/agent_memory_context_delta.md` | aktiver Runtime-/Quality-Delta-Plan |
| Claim Verification / Evidence | `execution/claim_verification_delta.md` | aktiver Claim-/Evidence-Delta-Plan |
| UIL / Candidate Promotion | `execution/uil_candidate_promotion_delta.md` | aktiver Intake-/Promotion-Delta-Plan |
| Domain Intelligence | `execution/domain_intelligence_delta.md` | aktiver Domain-Signal-Delta-Plan |
| References Evaluate / To-Watch | `execution/references_projects_evaluate_delta.md` | aktiver Evaluate-to-Decision-Plan |
| Frontend Refinement / Performance | `execution/frontend_refinement_perf_delta.md` | aktiver Frontend-Refinement-/Perf-Delta-Plan |
| Ecosystem Optionality | `execution/ecosystem_optionality_delta.md` | aktiver Plugin-/Partner-/Payment-/Rollout-Delta-Plan |

---

## 3. Phase Board

| Phase | Status | Kurzlage | Fuehrende Execution-Owner |
|:------|:-------|:---------|:--------------------------|
| 0 Foundation / Go-first Boundary | **CLOSED** | Go-first, Thin-Proxy, Request-ID, Observability-Baseline und Gateway-Foundation stehen | `execution/infra_provider_delta.md`, `execution/cross_cutting_verify.md` |
| 1 Auth / Security | **BASELINE COMPLETE, residual verify open** | produktive Baseline steht; einzelne advanced E2E-/MFA-/recovery-Gates bleiben offen | `execution/cross_cutting_verify.md` |
| 2 Rust Core | **BASELINE COMPLETE** | Rust-Core vorhanden; Produktionsgrenze Go↔Rust wird weiter geschaerft | `execution/compute_delta.md` |
| 3 Streaming | **BASELINE COMPLETE, browser verify open** | Go-SSE, Snapshot- und Alert-Bausteine aktiv; Rest sind Live-/Browser-Gates | `execution/cross_cutting_verify.md`, `execution/infra_provider_delta.md` |
| 4 GeoMap v2 | **BASELINE COMPLETE, closeout open** | Code und Doc-Fundament stehen; Doc-Abarbeitung ueber `docs/geo/*` + E2E/Perf via `GEOMAP_VERIFY_GATES.md` | `execution/geomap_closeout.md`, `execution/cross_cutting_verify.md` |
| 5 Portfolio Bridge / Analytics | **BASELINE COMPLETE, browser verify open** | Portfolio-/Analytics-Slices geliefert; Browser-/cache-/query-Gates und GCT-Onboarding offen | `execution/cross_cutting_verify.md`, `execution/infra_provider_delta.md` |
| 6 Memory | **CLOSED** | Phase-6 Baseline und Live-Verify abgeschlossen | `execution/agent_memory_context_delta.md` |
| 7 Indicator Catalog Core | **BASELINE COMPLETE, residual browser verify open** | Kernindikatoren geliefert; Rest sind Frontend-/Browser-Gates | `execution/compute_delta.md`, `execution/cross_cutting_verify.md` |
| 8 Pattern Detection | **BASELINE COMPLETE, final acceptance open** | Implementiert und manuell geprueft; finale pytest-/browserbasierte Abnahme offen | `execution/compute_delta.md`, `execution/cross_cutting_verify.md` |
| 9 Unified Ingestion Layer | **CLOSED, promotion verify open** | Go-owned UIL-Frontdoor und reclassify/metadata-Slice stehen; Candidate-/Promotion-Follow-ups ueber `execution/uil_candidate_promotion_delta.md` | `execution/uil_candidate_promotion_delta.md` |
| 10 Agent Runtime | **CODE COMPLETE, verify open** | Agent-/Context-/Tool-Baseline steht; Runtime- und E2E-Verifikation offen | `execution/agent_memory_context_delta.md`, `execution/cross_cutting_verify.md` |
| 12a NLP Upgrade | **CLOSED** | Embedding-/HDBSCAN-Clusterpfad implementiert und verifiziert | `execution/agent_memory_context_delta.md`, `execution/claim_verification_delta.md` |
| 13 Portfolio Advanced | **VERIFIED** | Kelly / Regime / VaR / VPIN-Pfade live verifiziert | `execution/cross_cutting_verify.md`, `execution/compute_delta.md` |
| 14 Provider Expansion | **CODE COMPLETE, rollout verify open** | breite Providerbasis steht; gruppenweise Success-/Error-Path-Verifikation plus Pflege von `docs/references/sources/*`, `references/status.md` und Quellen-/Key-Onboarding offen | `execution/infra_provider_delta.md`, `execution/source_onboarding_and_keys.md`, `execution/references_projects_evaluate_delta.md` |
| 15 Advanced Indicators / Regime | **PARTIALLY VERIFIED** | Volatility/Regime live verifiziert; weitere Produktionshaertung bleibt | `execution/compute_delta.md`, `execution/cross_cutting_verify.md`, `execution/domain_intelligence_delta.md` |
| 16 Backtesting / Eval Hardening | **BASELINE COMPLETE** | Kernpfade stehen; Release-/OOS-Gates offen | `execution/cross_cutting_verify.md`, `execution/references_projects_evaluate_delta.md` |
| 17 Game Theory | **IN PROGRESS** | Baseline-Endpunkte vorhanden; Systemvertiefung und Domain-Gates laufen ueber `execution/domain_intelligence_delta.md` | `execution/domain_intelligence_delta.md` |
| 18 Options / Dark Pool / DeFi | **BASELINE COMPLETE** | Kernendpunkte stehen; echte Provider-/Live-Daten-Abnahme offen | `execution/infra_provider_delta.md`, `execution/cross_cutting_verify.md` |
| 19 Compute / Rust Service Follow-up | **PLANNED** | spaetere harte Rust-/Compute- und messaging-nahe Folgearbeit | `execution/compute_delta.md`, `execution/infra_provider_delta.md` |
| 20 ML Pipeline | **BASELINE COMPLETE** | Feature-/Classify-/Fusion-/Bias-Pfade stehen; Kalibrierung offen | `execution/compute_delta.md`, `execution/agent_memory_context_delta.md` |
| 21 Frontend Refinement | **PLANNED** | Aufraeumen, Zod Contracts, weitere Strukturverbesserungen | `execution/frontend_refinement_perf_delta.md`, `execution/cross_cutting_verify.md` |
| 22 Advanced Frontend / Perf | **PLANNED** | spaetere UI-/chart-/GPU- oder workspace-lastige Themen | `execution/frontend_refinement_perf_delta.md`, `execution/geomap_closeout.md` |
| 23 Platform Readiness | **CODE COMPLETE, promotion-governance verify open** | Capability Registry / Governance / readiness basis vorhanden; UIL-/Promotion-Governance ueber `execution/uil_candidate_promotion_delta.md` | `execution/uil_candidate_promotion_delta.md`, `execution/root_geo_references_coverage.md` |
| 24 Ecosystem Optionality | **CODE COMPLETE, hardening verify open** | Plugin/Partner/Payment/Rollout-Spezifikationen vorhanden; Runtime-Hardening und reversible Rollout-Gates ueber dedizierten Owner offen | `execution/ecosystem_optionality_delta.md`, `execution/references_projects_evaluate_delta.md`, `execution/infra_provider_delta.md`, `execution/source_onboarding_and_keys.md` |

### Regel: Execution-Owner je Phase ist Pflicht

Wenn eine Phase keinen klaren `execution/*.md`-Owner hat, ist das ein Hinweis auf
eine fehlende Execution-Spec. In diesem Fall wird zuerst ein passendes
Execution-MD angelegt und dann die Phase referenziert.

---

## 4. Aktueller Fokus

### A. Verify- und Rollout-Arbeit

- Phase 1: verbleibende Auth-E2E-/MFA-/Recovery-Gates schliessen
- Phase 3 bis 5: Browser-/SSE-/Portfolio-Abnahme dort schliessen, wo nur noch
  Live-Gates fehlen
- Phase 7 bis 8: Browser-/pytest-Akzeptanz fuer Indicator- und Pattern-Slices
- Phase 10: Agent-Runtime-/Tooling-Verifikation
- Phase 14: Provider-Rollout gruppenweise statt einzeln abarbeiten
- Phase 14: `docs/references/sources/*`, `references/status.md` und
  `execution/source_onboarding_and_keys.md` bei jeder neuen oder geaenderten
  Quelle mitpflegen

### B. Architektur-Delta statt Rewrite

- Compute-Grenze Go/Python/Rust weiter schaerfen, ohne Mini-Planausweitung
- weitere read-only Provider und GCT-Slices auf die neue Gateway-Grenze heben
- Credential-Transport und Connector-Hardening breiter ausrollen

### C. GeoMap Doc-Abarbeitung

- **GEOMAP_OVERVIEW:** Owner-/Read-Order fuer GeoMap-Specs
- **GEOMAP_FOUNDATION / GEOMAP_MODULE_CATALOG:** Basemap/Geocoding/Rendering + d3-Modulstrategie
- **GEOMAP_VERIFY_GATES:** E2E-Abnahme, Draw-Workflow, Save-Fehlerpfad, Performance-Baseline
- **GEOMAP_PRODUCT_AND_POLICY / GEOMAP_ROADMAP_AND_MILESTONES:** Milestones, UX-Restpunkte und SOTA-Backlog

Arbeits-Checkliste: `execution/geomap_closeout.md` (Doc-Abarbeitung Sek. 0).

### D. Dokumentations-Disziplin

- Masterplan bleibt schlank
- `SYSTEM_STATE.md` bleibt IST/SOLL-Spiegel
- Execution-Workpacks unter `docs/specs/execution/*.md` bleiben die aktiven
  Arbeitsdeltas; neue Workpacks nur bei klar getrenntem Backlog und Owner

### E. References-Katalog als Delivery-Pflicht

- Der `docs/references/`-Ordner ist kein lose angehaengter Lesekatalog, sondern
  Teil der Delivery fuer Provider-/Quellenarbeit
- Neue oder veraenderte Quellen sind erst dann wirklich eingeplant, wenn
  `sources/*.md`, `references/status.md` und bei Auth-Bedarf
  `execution/source_onboarding_and_keys.md` aktualisiert sind
- Evaluate-/Watch-Kandidaten fuer externe Projekte und Libraries laufen ueber
  `projects/evaluate.md` und `projects/to-watch.md`, nicht mehr ueber
  verstreute Root-Notizen

---

### F. Agentenfeste Vollabdeckung (neu)

- Vollabdeckung wird nicht mehr implizit erwartet, sondern explizit ueber
  `execution/root_geo_references_coverage.md` gesteuert
- Jede Root-/Geo-/References-MD braucht einen `COV.*`-Checkpoint mit Owner
- Neue Themen aus Root-/References-Dokumenten werden nur noch ueber klaren
  Execution-Owner (`execution/*.md`) in aktive Delivery ueberfuehrt

---

## 5. Aktive Verify-Gates

| Gate-Cluster | Fuehrendes Dokument | Restlage |
|:-------------|:--------------------|:---------|
| Auth residual E2E | `execution/cross_cutting_verify.md` | `1.v17`, `1.v18`, `1.v19`, `1.v22` |
| Streaming browser verification | `execution/cross_cutting_verify.md` | SSE reconnect / alert / browser flows |
| GeoMap closeout | `execution/geomap_closeout.md` | Doc-Abarbeitung (`docs/geo/*`), Phase-4-Gate, Milestones D/E/F, SOTA-Backlog, Tests |
| Portfolio browser verification | `execution/cross_cutting_verify.md` | Phase-5: 5.1–5.3 (Bridge, GCT-Onboarding, Panel-Flows) |
| Indicator / Pattern acceptance | `execution/cross_cutting_verify.md` | Phase 7/8 Restgates |
| Agent runtime verification | `execution/cross_cutting_verify.md` | 10.v1-10.v3 |
| Market credential flow | `execution/infra_provider_delta.md` | `MC1-MC5` |
| Provider rollout matrix | `execution/infra_provider_delta.md` | Batch 1-4 Verify-Contract |
| Source-/Key-Onboarding | `execution/source_onboarding_and_keys.md` | Env-/Doku-Pflichten fuer neue Quellen |
| References-Katalog-Pflege | `references/status.md`, `references/sources/*`, `references/projects/*` | neue Quellen/Kandidaten muessen parallel zur Umsetzung nachgezogen werden |
| Compute split / Rust boundary | `execution/compute_delta.md` | `G1-G7` |
| Agent/Memory/Context Runtime | `execution/agent_memory_context_delta.md` | `AMC1-AMC6`, `AMC.V1-AMC.V4` |
| Claim Verification | `execution/claim_verification_delta.md` | `CV1-CV5`, `CV.V1-CV.V4` |
| UIL / Candidate Promotion | `execution/uil_candidate_promotion_delta.md` | `UIL1-UIL5`, `UIL.V1-UIL.V4` |
| Domain Intelligence | `execution/domain_intelligence_delta.md` | `DI1-DI5`, `DI.V1-DI.V3` |
| References Evaluate Decision Gates | `execution/references_projects_evaluate_delta.md` | `RPE1-RPE5`, `RPE.V1-RPE.V3` |
| Frontend Refinement / Perf | `execution/frontend_refinement_perf_delta.md` | `FE1-FE6`, `FE.V1-FE.V4` |
| Ecosystem Optionality Hardening | `execution/ecosystem_optionality_delta.md` | `ECO1-ECO6`, `ECO.V1-ECO.V4` |
| Root/Geo/References Coverage | `execution/root_geo_references_coverage.md` | `COV.ROOT.*`, `COV.GEO.*`, `COV.REF.*` |
| Coverage Completion Governance | `execution/root_geo_references_coverage.md`, `execution/cross_cutting_verify.md` | nur geschlossen, wenn COV-Checkpoints Evidence + Propagation Targets haben |

---

## 6. Execution-Spec Strategy

Die Execution-Specs leben unter `docs/specs/execution/`:

- `cross_cutting_verify.md` — cross-cutting verify checklist
- `compute_delta.md` — Compute-/Indicator-/Go-Python-Rust-Delta-Plan
- `infra_provider_delta.md` — Infra-, Messaging-, Provider- und Rollout-Delta-Plan
- `storage_layer_delta.md` — Storage-/Object-Layer-Auswahl und Integrationscheckliste (SeaweedFS/Garage)
- `source_onboarding_and_keys.md` — Quellen-/Key-/Env-Onboarding-Checkliste
- `geomap_closeout.md` — GeoMap-spezifischer Arbeitsplan mit Checkliste, Verify-Gates, SOTA-Backlog
- `root_geo_references_coverage.md` — Vollabdeckungsmatrix fuer Root/Geo/References
- `agent_memory_context_delta.md` — Agent-/Memory-/Context-Runtime-Delta
- `claim_verification_delta.md` — Claim-/Evidence-/Contradiction-Delta
- `uil_candidate_promotion_delta.md` — UIL-/Candidate-/Promotion-Delta
- `domain_intelligence_delta.md` — Game-Theory/Entropy/Political-Economy-Delta
- `references_projects_evaluate_delta.md` — References-Projects Evaluate-/Decision-Delta
- `frontend_refinement_perf_delta.md` — Frontend-Refinement-/Performance-Delta
- `ecosystem_optionality_delta.md` — Plugin-/Partner-/Payment-/Rollout-Delta

Weitere domain-spezifische Execution-Specs koennen bei Bedarf angelegt werden.

---

## 7. Root-Docs nach dem Refresh

| Cluster | Fuehrende Root-Dokumente |
|:--------|:-------------------------|
| Root-Architektur | `GO_GATEWAY.md`, `README.md` |
| Agent / Knowledge | `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`, `MEMORY_ARCHITECTURE.md`, `CONTEXT_ENGINEERING.md`, `archive/KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `CLAIM_VERIFICATION_ARCHITECTURE.md` |
| Geo / Map | `geo/GEOMAP_OVERVIEW.md`, `geo/GEOMAP_PRODUCT_AND_POLICY.md`, `geo/GEOMAP_MODULE_CATALOG.md`, `geo/GEOMAP_VERIFY_GATES.md` |
| Compute / Domain | `INDICATOR_ARCHITECTURE.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`, `Portfolio-architecture.md`, `GAME_THEORY.md` |
| Gateway / Provider | `GO_GATEWAY.md`, `gct-gateway-connections.md`, `go-research-financial-data-aggregation-2025-2026.md`, `references/status.md`, `REFERENCE_SOURCE_STATUS.md` |
| Reference / benchmark / archive | ueber `docs/README.md` und `docs/archive/` klassifiziert |

---

## 8. Naechste Architektur- und Delivery-Slices

1. Provider-Credential-Transport von `finnhub` auf weitere sinnvolle read-only
   Provider ausrollen.
2. Mehr read-only GCT-/Gateway-Slices auf dieselbe neutrale `MarketTarget`-
   Vertragsgrenze heben.
3. `docs/references/` als Pflicht-Begleitstruktur fuer Provider-, Quellen- und
   Evaluationsarbeit weiter vervollstaendigen.
4. Coverage-Matrix (`execution/root_geo_references_coverage.md`) laufend pflegen,
   so dass keine Root-/Geo-/References-MD ohne COV-Owner bleibt.
5. Agent-/Claim-/UIL-/Domain-Execution-Specs ueber ihre Verify-Gates schliessen.
6. Compute-Grenze Go↔Rust konkretisieren, ohne Python als Research-/Agent-
   Schicht zu entwerten.
7. Offene Verify-Gates systematisch schliessen, bevor neue grosse Themenflaechen
   aufgemacht werden.

---

## 9. Aenderungsregel

Bei kuenftigen Updates gilt:

- Statusaenderungen zuerst in den fuehrenden Minis und Fachdokumenten abgleichen
- danach `SYSTEM_STATE.md` und `EXECUTION_PLAN.md` synchronisieren
- historische Detailerzaehlungen nur noch in Archiv-/Ledger-Dokumente schreiben

---

## 10. Konsolidierungs-Closeout (strikt-vollstaendig)

Fuer die aktuelle Konsolidierungsrunde ist die Arbeitsreihenfolge verbindlich:

1. Restkontext aus Bridge-/Master-Docs in aktive Owner-Dokumente transferieren.
2. Root-Read-Order und Owner-Matrix aktualisieren.
3. Erst danach Bridge-/Master-Docs als archiviert markieren und in
   `docs/archive/` fuehren.

Transferstatus dieser Runde:

- Service-/Objekt-/Retrieval-/Simulation-Vertragsrest in `ARCHITECTURE.md`
  uebernommen.
- Striktes Archivkriterium in `DOCUMENTATION_ARCHITECTURE.md` verankert.
- Root-Klassifikation in `README.md` und Clusterliste in `EXECUTION_PLAN.md`
  auf archivierte Master-Docs umgestellt.

