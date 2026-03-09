# Capability Registry (Phase 23)

> **Stand:** 09. Maerz 2026
> **Zweck:** Spec fuer Capability-IDs, Scopes, Owner und Risk-Tiers im Go Policy
> Gateway und angrenzenden Tool-/API-Surfaces.
> **Source-of-Truth-Rolle:** Autoritativ fuer die Capability-Taxonomie, nicht
> fuer jeden einzelnen Handler- oder Produkt-Endpoint.

---

## Scope

- Capability-IDs fuer API- oder Tool-Surfaces
- Scope-Mapping und Risk-Tier-Semantik
- Ownership fuer Policy-/Approval-Entscheidungen

Nicht Teil dieser Spec:

- vollstaendige Handler-Liste des gesamten Produkts
- Partner-/Plugin-Vertraege im Detail
- konkrete Rollout-Gates

---

## Konzept

- **Capability:** Ein API-Pfad oder Tool mit Scope, Owner, Risk-Tier
- **Risk-Tier:** `read-only` | `bounded-write` | `approval-write`
- **Owner:** Team/Service verantwortlich fuer die Capability

---

## Aktuelle Runtime-Basis

Code-Rueckhalt vorhanden:

- `go-backend/internal/capability/registry.go`
- Go Policy Gateway nutzt Capability-Checks fuer ausgewaehlte Tool-/Handler-Surfaces

Wichtige Abgrenzung:

- Registry und Tier-Logik sind real vorhanden
- nicht jede moegliche Produktflaeche ist bereits vollstaendig in Capability-IDs
  ueberfuehrt

---

## Schema

```yaml
capabilities:
  - id: "api.v1.memory.kg.seed"
    scope: ["kg:write"]
    owner: "memory-service"
    risk_tier: "bounded-write"
    deprecated: false
  - id: "api.v1.gct.portfolio.order"
    scope: ["portfolio:write", "order:create"]
    owner: "gct-gateway"
    risk_tier: "approval-write"
    deprecated: false
  - id: "tool.get_chart_state"
    scope: ["chart:read"]
    owner: "agent-tools"
    risk_tier: "read-only"
```

---

## Implementierungsstatus

- [x] Go Package `internal/capability/registry.go`
- [x] Policy-Tier Logik fuer `read-only`, `bounded-write`, `approval-write`
- [~] Capability-Check vor ausgewaehlten Handlern / Tool-Proxies
- [x] Agent Policy Tiers: read-only, bounded-write, approval-write

---

## Design-Regeln

- `read-only`: keine Mutation, kein Approval, keine Idempotency-Pflicht
- `bounded-write`: mutierend, aber stark begrenzt; Idempotency-/Policy-Gates
  empfohlen
- `approval-write`: explizite Freigabe / Approval / besonders strenge Auditierung

Capabilities sollen lieber klein und reviewbar bleiben, statt grosse
Sammel-Surfaces unpraezise zu klassifizieren.

---

## Querverweise

- `docs/specs/ARCHITECTURE.md`
- `docs/specs/PLUGIN_PILOT.md`
- `docs/specs/PARTNER_BOUNDARY.md`
- `docs/other_project/SUPERAPP.md` (strategische Referenz)
