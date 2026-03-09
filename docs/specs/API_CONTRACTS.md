# API CONTRACTS

> **Stand:** 09. Maerz 2026
> **Zweck:** Umbrella- und Index-Spec fuer die aufgeteilten API-Vertraege.
> Route-, Header-, SSE- und Service-Boundary-Details liegen in
> `docs/specs/api/`.

---

## Scope und Source of Truth

Dieses Dokument beantwortet autoritativ:

- wo die API-Vertragsdetails heute leben
- welche Split-Dokumente fuer welche Boundary zuständig sind
- welche Nachbar-Specs fuer Runtime-Stand, Security und offene Arbeit Owner sind

Nicht der Zweck dieses Dokuments:

- komplette Request-/Response-Beispiele erneut voll zu duplizieren
- `SYSTEM_STATE.md` oder `EXECUTION_PLAN.md` als Runtime-/Arbeits-Owner zu ersetzen

---

## Aufteilung

| Datei | Inhalt |
|:------|:-------|
| [`api/API_SHARED_INVARIANTS.md`](./api/API_SHARED_INVARIANTS.md) | Oberste Regeln, Pflicht-Header, Fehlervertrag, request-scoped credential transport |
| [`api/API_BROWSER_TO_NEXT.md`](./api/API_BROWSER_TO_NEXT.md) | Browser -> Next.js Entry Surface, BFF-only Regeln, interne Next-only State APIs |
| [`api/API_NEXT_TO_GO.md`](./api/API_NEXT_TO_GO.md) | Next.js -> Go, Gateway-Baseline, Market, Streaming, Geo, Strategy, Portfolio, Memory, Agent/Auth |
| [`api/API_INTERNAL_SERVICES.md`](./api/API_INTERNAL_SERVICES.md) | Go -> Python, Go -> Rust, Go -> GCT, interne Memory-/Agent-/Compute-/Execution-Boundaries |

---

## Dokument-Ownership

| Frage | Dokument |
|:------|:---------|
| Welche Route / welches Header- oder SSE-Shape gilt? | `docs/specs/api/*.md` |
| Wer besitzt den aktuellen Runtime-Stand? | `SYSTEM_STATE.md` |
| Welche Arbeit ist offen? | `EXECUTION_PLAN.md` |
| Welche Frontend-Regeln gelten? | `FRONTEND_ARCHITECTURE.md` |
| Welche Security-Regeln gelten? | `docs/specs/security/*.md` |
| Welche UIL-Route-Zuordnung gilt? | `UIL_ROUTE_MATRIX.md` |
| Wie ist der Compute-Split Go/Python/Rust? | `execution/compute_delta.md` |

---

## Querverweise

- `SYSTEM_STATE.md`
- `EXECUTION_PLAN.md`
- `UIL_ROUTE_MATRIX.md`
- `docs/specs/security/AUTH_MODEL.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`

---

## Konsolidierungs-Addendum (Memory Merge / Claim / Simulation)

Die folgenden Endpoint-Familien gelten als verbindlicher Zielvertrag und werden
in den `docs/specs/api/`-Splitdocs weiter ausdetailliert.

### 1) Memory Merge

- `POST /api/v1/memory/merge/query`

Mindest-Contract:

- typed composite response
- getrennte `global_context` / `user_context` / `fusion`-Bloecke
- kein roher gemischter Persistenzgraph als Response

### 2) Claim APIs

- `POST /api/v1/memory/claims`
- `PATCH /api/v1/memory/claims/{id}`
- `POST /api/v1/memory/claims/{id}/evidence`
- `POST /api/v1/memory/claims/{id}/challenge`

Mindest-Contract:

- provenance-Felder
- status transitions (`active`, `challenged`, `archived`, `invalidated`)
- idempotency fuer write-Aufrufe

### 3) Simulation Branch APIs

- `POST /api/v1/simulation/branch`
- `GET /api/v1/simulation/branch/{id}`
- `POST /api/v1/simulation/branch/{id}/run`
- `POST /api/v1/simulation/branch/{id}/extract-claims`

Mindest-Contract:

- Branch als `s:*`-Artefakt modellieren
- canonical fact mutation durch Simulation explizit verbieten
- extract-claims schreibt in Claim/Evidence-Layer, nicht direkt in Canonical KG
