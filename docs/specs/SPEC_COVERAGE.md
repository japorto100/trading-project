# SPEC COVERAGE (ohne Execution-Specs)

> **Stand:** 16. Maerz 2026  
> **Zweck:** Schneller Up-to-date-Check fuer alle Specs in `docs/specs/`, wobei
> `EXECUTION_PLAN.md` und `docs/specs/execution/*` bewusst ausgenommen sind.
> **Legende:** `green` = aktuell/stimmig, `yellow` = grundsaetzlich ok aber bald
> refreshen, `blueprint` = bewusst future-facing Zielbild.

---

## 1. Core Specs (Root)

| Datei | Status | Einordnung |
|:------|:-------|:-----------|
| `ARCHITECTURE.md` | `green` | Reines Umbrella/Navigation-Dokument; kein inhaltlicher Owner mehr; alle Details in `architecture/` und `data/` |
| `SYSTEM_STATE.md` | `green` | kompakter Runtime-Snapshot; SoT-Tabelle auf neue Subspec-Pfade aktualisiert |
| `DATA_ARCHITECTURE.md` | `green` | Redirect-Stub auf `data/DATA_ARCHITECTURE.md`; kein inhaltlicher Owner mehr |
| `API_CONTRACTS.md` | `green` | Stand 16.03; bekannte Drifts (agent/chat, portfolio/order) dokumentiert |
| `AUTH_SECURITY.md` | `green` | Stand 16.03; Umbrella ok; Details in `security/` |
| `DOCUMENTATION_ARCHITECTURE.md` | `green` | auf neue Subspec-Struktur angehoben |
| `SPEC_CONVENTIONS.md` | `green` | Namens-/Split-Regeln auf neue Struktur erweitert |
| `CAPABILITY_REGISTRY.md` | `green` | Stand 16.03; IST-Hinweis zu fail-open Enforcement ergaenzt |
| `GOVERNANCE.md` | `green` | Stand 16.03; neu; Umbrella fuer governance/ Blueprints mit Read Order |
| `ERRORS.md` | `green` | Stand 16.03; Error-Taxonomie, Resilience-Patterns — Observability ausgelagert |
| `OBSERVABILITY.md` | `green` | Stand 16.03; neu; OTel-Normen, Structured Logging, Correlation IDs, Golden Signals |

---

## 2. API Subspecs (`docs/specs/api/`)

| Datei | Status | Einordnung |
|:------|:-------|:-----------|
| `api/API_SHARED_INVARIANTS.md` | `green` | Stand 16.03; Kernregeln stabil |
| `api/API_BROWSER_TO_NEXT.md` | `green` | Stand 16.03; BFF-Surface-Regeln stabil |
| `api/API_NEXT_TO_GO.md` | `green` | Stand 16.03; bekannte Drifts (agent/chat, portfolio/order) dokumentiert |
| `api/API_INTERNAL_SERVICES.md` | `green` | Stand 16.03; interne Service-Grenzen stabil |
| `api/API_UIL_ROUTES.md` | `green` | Stand 16.03; verschoben von Root; UIL-Route-Matrix (Next→Go→Python), Policy-Metadaten-Contract |

---

## 3. Security Subspecs (`docs/specs/security/`)

| Datei | Status | Einordnung |
|:------|:-------|:-----------|
| `security/AUTH_MODEL.md` | `green` | Stand 16.03; Session-/RBAC-Modell gueltig |
| `security/POLICY_GUARDRAILS.md` | `green` | Stand 16.03; Policy-Grenzen gueltig |
| `security/SECRETS_BOUNDARY.md` | `green` | Stand 16.03; Vault-Entscheidung noch offen, aber Grenzregel klar |
| `security/CLIENT_DATA_ENCRYPTION.md` | `green` | Stand 16.03; Key-Policy klar |
| `security/INCIDENT_RESPONSE.md` | `green` | Stand 16.03; Severity-Stufen gueltig |
| `security/SECURITY_HARDENING_TRACKS.md` | `green` | Stand 16.03; Track-Struktur sinnvoll |

---

## 4. Architecture Subspecs (`docs/specs/architecture/`)

| Datei | Status | Einordnung |
|:------|:-------|:-----------|
| `architecture/ARCHITECTURE_BASELINE.md` | `green` | Owner fuer IST/SOLL, Prinzipien, Sync/Async-Pfade, Operational Controls, Service Blueprint |
| `architecture/FRONTEND_ARCHITECTURE.md` | `green` | Stand 16.03 Rev. 3; Shell-Architektur, Control/Files/AgentChat-Surfaces, alle Routen und lib/-Schichten verifiziert gegen Codebase |
| `architecture/RUST_COMPUTE_LAYER.md` | `green` | Stand 16.03; neu; Rust ADR, PyO3-Regeln, Kernel-Module, Einsatz-Kriterien |
| `architecture/GO_GATEWAY_BOUNDARY.md` | `green` | Owner fuer Gateway-Grenzkontrakte, Streaming, Agent-Tool-Policy |
| `architecture/AGENT_RUNTIME_ARCHITECTURE.md` | `green` | Owner fuer Agent-Grenzen, Guardrails, Memory-Write-Policy |
| `architecture/MEMORY_AND_STORAGE_BOUNDARIES.md` | `green` | Owner fuer Memory-Schichten und Storage-Ownership |
| `architecture/ORCHESTRATION_AND_MESSAGING.md` | `green` | Owner fuer NATS-vs-Workflow-Entscheidung |
| `architecture/DOMAIN_CONTRACTS.md` | `green` | Owner fuer Kernobjekte (Claim, Evidence, Entity, Scenario), Retrieval-Prozesskontrakte, epistemische Schichten |

---

## 5. Governance Blueprints (`docs/specs/governance/`)

| Datei | Status | Einordnung |
|:------|:-------|:-----------|
| `governance/ROLLOUT_GATES.md` | `blueprint` | Target-State Rollout-Stages und KPI-Gates |
| `governance/PLUGIN_PILOT.md` | `blueprint` | Interner Plugin-Pilot; Scaffold-Phase |
| `governance/PARTNER_BOUNDARY.md` | `blueprint` | Future-facing Partner-/ISV-Boundary |
| `governance/PAYMENT_ADAPTER.md` | `blueprint` | Future-facing Payment-Domain-Adapter |

---

## 6. Data Subspecs (`docs/specs/data/`)

| Datei | Status | Einordnung |
|:------|:-------|:-----------|
| `data/DATA_ARCHITECTURE.md` | `green` | Kanonischer Owner fuer Datenfluss, Datenzonen, Canonical Model |
| `data/AGGREGATION_IST_AND_GAPS.md` | `green` | IST-Stand Aggregation + priorisierte Gap-Liste |
| `data/STORAGE_AND_PERSISTENCE.md` | `green` | Owner fuer Storage-Prinzipien, Persistenzklassen, Cache-Abgrenzung |
| `data/UNSTRUCTURED_INGESTION_UIL.md` | `green` | Owner fuer UIL-Grenzkontrakte und Sprachgrenzen-Vertrag |
| `data/SOURCE_STATUS.md` | `green` | Provider-Status-Matrix (implementiert, scaffold, geplant) |

---

## 7. Bridge/Archiv-Dokumente (nicht mehr normative Owner)

| Datei | Status | Hinweis |
|:------|:-------|:--------|
| `docs/ARCHITECTURE_NEW_EXTENSION.md` | `bridge/archiv` | IST-Inhalte in `architecture/` Subspecs uebernommen |
| `docs/DATA_AGGREGATION_Master.md` | `bridge/archiv` | IST-Inhalte in `data/` Subspecs uebernommen; bleibt als Code-Analyse-Report |

---

## 8. Kurzfazit (16.03.2026 — Rev. 3)

- **Vollstaendiger Refresh abgeschlossen.** Alle aktiven Specs haben Stand 16.03.2026.
- **`FRONTEND_ARCHITECTURE.md` Rev. 3:** Shell-Architektur, `/control`, `/files`, AgentChat-Surface, alle Routen und lib/-Schichten gegen tatsaechliche Codebase verifiziert.
- **`GOVERNANCE.md`** neu: Umbrella fuer `governance/` Blueprints (bisher fehlte dieser Einstiegspunkt).
- **Pro-Stack-Ownership in `architecture/`:** `FRONTEND_ARCHITECTURE.md` und `RUST_COMPUTE_LAYER.md` als Owner-Specs; `ARCHITECTURE_BASELINE.md` auf cross-cutting Integration-Doc getrimmt.
- **`ERRORS.md` + `OBSERVABILITY.md` getrennt:** Fehler/Resilience vs. OTel/Logging/Correlation nun klar separiert.
- **`UIL_ROUTE_MATRIX.md` → `api/API_UIL_ROUTES.md`** verschoben; Root sauber.
- **4 Blueprint-Specs** (ROLLOUT_GATES, PLUGIN_PILOT, PARTNER_BOUNDARY, PAYMENT_ADAPTER) in `governance/`; Root bleibt sauber.
- **`ARCHITECTURE.md` ist reines Umbrella** (~70 Zeilen Navigation); alle Details in `architecture/`, `data/`, `governance/` Subspecs.
- **`DOMAIN_CONTRACTS.md`** (Kernobjekte, Retrieval-Prozess, Simulations-Stack, epistemische Schichten) aktiv.
- **Bekannte P0-Drifts** (agent/chat, portfolio/order, Capability-Enforcement) in `API_CONTRACTS.md`, `api/API_NEXT_TO_GO.md`, `CAPABILITY_REGISTRY.md` und `data/AGGREGATION_IST_AND_GAPS.md` dokumentiert.
- **`SYSTEM_STATE.md`** bleibt als kompakter Runtime-Snapshot mit aktuellem SoT-Register.
- **Root-Quelldokumente** (`ARCHITECTURE_NEW_EXTENSION.md`, `DATA_AGGREGATION_Master.md`) sind auf Bridge/Archiv reduziert.
