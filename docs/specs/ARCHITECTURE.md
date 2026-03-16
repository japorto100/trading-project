# ARCHITECTURE (Umbrella)

> **Stand:** 16. Maerz 2026  
> **Zweck:** Navigations-Spec fuer die Plattformarchitektur.
> Alle verbindlichen Details leben in den Owner-Specs unter `docs/specs/architecture/`.

---

## Architecture Owner Specs (`docs/specs/architecture/`)

| Datei | Inhalt |
|:------|:-------|
| `ARCHITECTURE_BASELINE.md` | IST + Zielrichtung, Arch-Prinzipien, Sync/Async-Pfade, Operational Controls, Service Blueprint |
| `FRONTEND_ARCHITECTURE.md` | Frontend/BFF Authority (Next.js 16, React 19, TanStack Query 5, Zustand) |
| `RUST_COMPUTE_LAYER.md` | Rust ADR (No-Julia-first), PyO3-Boundary-Regeln, Kernel-Module, Einsatz-Kriterien |
| `GO_GATEWAY_BOUNDARY.md` | Gateway-Grenzkontrakte, Provider-Expansion, Streaming-Defaults, Agent-Tool-Policy |
| `AGENT_RUNTIME_ARCHITECTURE.md` | Agent-Grenzen, Guardrails, Orchestrationsprinzipien, Memory-Write-Policy |
| `MEMORY_AND_STORAGE_BOUNDARIES.md` | Memory-Schichten (M1–M5), Storage-Ownership, KG-Tech-Entscheidungen |
| `ORCHESTRATION_AND_MESSAGING.md` | Event-Backbone (NATS) vs. Workflow-Engine — Abgrenzung und Entscheidungsregeln |
| `DOMAIN_CONTRACTS.md` | Kanonische Kernobjekte (Claim, Evidence, Entity, Scenario) + Retrieval- und Simulationsvertraege |

---

## Data Owner Specs (`docs/specs/data/`)

| Datei | Inhalt |
|:------|:-------|
| `DATA_ARCHITECTURE.md` | Datenfluss-Topologie, Datenzonen, Canonical Data Model, IST |
| `AGGREGATION_IST_AND_GAPS.md` | IST-Stand Aggregation, Contract-Drifts, Prioritaeten |
| `STORAGE_AND_PERSISTENCE.md` | Storage-Prinzipien, Persistenzklassen, Cache-Abgrenzung |
| `UNSTRUCTURED_INGESTION_UIL.md` | UIL-Grenzkontrakte, Sprachgrenzen-Vertrag |
| `SOURCE_STATUS.md` | Provider-Status-Matrix (implementiert / scaffold / geplant) |

---

## Weitere Boundary-Owner Docs

| Datei | Inhalt |
|:------|:-------|
| `SYSTEM_STATE.md` | Kompakter Runtime-Snapshot, Versions-/Port-Fakten, offene Drifts |
| `API_CONTRACTS.md` | API-Umbrella → `api/*.md` (5 Subspecs inkl. UIL-Routes) + bekannte P0-Drifts |
| `CAPABILITY_REGISTRY.md` | Capability-IDs, Risk-Tiers, Enforcement-Status |
| `AUTH_SECURITY.md` | Security-Umbrella → `security/*.md` |
| `GOVERNANCE.md` | Governance-Umbrella → `governance/*.md` (4 Blueprint-Specs) |
| `ERRORS.md` | Error-Taxonomie, Resilience-Patterns (Retry/Fallback/Circuit Breaker) |
| `OBSERVABILITY.md` | OTel-Normen, Structured Logging, Correlation IDs, Golden Signals |

---

## Governance Blueprints (`docs/specs/governance/`)

> Future-facing Zielbild-Specs — Phase B/C. Kein produktiver Runtime-Vertrag.
> Umbrella: **`GOVERNANCE.md`**

| Datei | Inhalt |
|:------|:-------|
| `governance/ROLLOUT_GATES.md` | Reversible Rollout-Stages, KPI-Gates, Rollback-Regeln |
| `governance/PLUGIN_PILOT.md` | Interner Plugin-Runtime-Pilot: Allowlist, Kill-Switch, Sandbox |
| `governance/PARTNER_BOUNDARY.md` | Partner-/ISV-Boundary: Capabilities, Quotas, Audit |
| `governance/PAYMENT_ADAPTER.md` | Payment-Domain: Adapter-Interface, Routing, Reconciliation |

---

## Read Order fuer CLI-Agenten

1. `ARCHITECTURE.md` (diese Datei) — Navigationseinstieg
2. `architecture/ARCHITECTURE_BASELINE.md` — Kern-IST und Prinzipien
3. `SYSTEM_STATE.md` — aktueller Runtime-Stand und Drifts
4. `data/DATA_ARCHITECTURE.md` — Datenpfade und Ownership
5. `API_CONTRACTS.md` + `architecture/GO_GATEWAY_BOUNDARY.md` — Contracts
6. Bereichs-Owner-Spec nach Bedarf (Agent, Memory, Orchestration, UIL, Security)
