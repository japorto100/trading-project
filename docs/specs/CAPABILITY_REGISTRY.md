# Capability Registry (Phase 23)

> Stand: 28 Feb 2026  
> Zweck: API/Tool scopes, owner, risk-tier. Referenz: ARCHITECTURE.md Sek. 13-14, SUPERAPP.md

---

## Konzept

- **Capability:** Ein API-Pfad oder Tool mit Scope, Owner, Risk-Tier
- **Risk-Tier:** `read-only` | `bounded-write` | `approval-write`
- **Owner:** Team/Service verantwortlich fuer die Capability

---

## Schema (geplant)

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
- [x] Middleware: Capability-Check vor Handler
- [x] Agent Policy Tiers: read-only, bounded-write, approval-write

---

## Referenzen

- `docs/specs/ARCHITECTURE.md` Sek. 13-14
- `docs/SUPERAPP.md` Sek. 5-7
