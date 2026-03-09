# UIL & Candidate Promotion Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Aktiver Delta-Plan fuer Unified Ingestion Layer, Candidate-Lifecycle
> und Promotion-Entscheidungen in produktionsnahen Pfaden.

---

## 0. Execution Contract

### Scope In

- intake/reclassify/metadata-Flows im UIL
- candidate->promotion Lifecycle und Entscheidungsgrenzen
- Governance-/Readiness-Schnitt fuer produktive Promotions

### Scope Out

- rein frontendseitige Visualisierungen ohne UIL-Contract-Relevanz
- provider-spezifische credential-Details (Owner: infra/source onboarding)

### Mandatory Upstream Sources

- `docs/UNIFIED_INGESTION_LAYER.md`
- `docs/specs/UIL_ROUTE_MATRIX.md`
- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/ROLLOUT_GATES.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/ARCHITECTURE.md`

---

## 1. Offene Deltas

- [ ] **UIL1** intake contracts fuer representative sourcetypen verifiziert
- [ ] **UIL2** reclassify path mit policy guardrails abgesichert
- [ ] **UIL3** metadata normalization fuer candidate entities konsistent
- [ ] **UIL4** promotion gate (candidate -> promoted) mit audit trail dokumentiert
- [ ] **UIL5** rollback/de-promotion path fuer Fehlklassifikation vorhanden

---

## 2. Verify-Gates

- [ ] **UIL.V1** intake->candidate Happy Path
- [ ] **UIL.V2** candidate->promotion Gate inkl. owner approval
- [ ] **UIL.V3** failed promotion mit sauberem Error/rollback
- [ ] **UIL.V4** governance/readiness-mapping fuer promoted items

---

## 3. Evidence Requirements

- UIL-ID + Ablauf
- API/contract Nachweis
- Governance-/Audit-Hinweis
- Ergebnis in capability/readiness Dokumenten gespiegelt

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/UNIFIED_INGESTION_LAYER.md`
- `docs/specs/UIL_ROUTE_MATRIX.md`
- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/ROLLOUT_GATES.md`

---

## 5. Exit Criteria

- `UIL1-UIL5` entschieden
- candidate->promotion lifecycle ist testbar und auditierbar
- keine offene Divergenz zwischen UIL-Root-Doc und Execution-Gates
