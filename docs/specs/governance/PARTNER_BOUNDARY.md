# Partner/ISV Boundary Spec — Phase 24.2

> **Stand:** 16. Maerz 2026
> **Zweck:** Future-facing Boundary-Spec fuer Partner-/ISV-Oeffnung:
> Capabilities, Quotas, Audit und Contract-Test-Regeln.
> **Source-of-Truth-Rolle:** Zielbild fuer eine spaetere Partnergrenze, nicht
> Aussage, dass diese Boundary heute bereits extern produktiv offen ist.

---

## Scope

- Versionierte Boundary-Spec
- Contract-testbar (z.B. Pact, OpenAPI-diff)
- Capabilities, Quotas, Audit-Pflichten

Nicht Teil dieser Spec:

- aktueller interner Plugin-Pilot
- Payment-Orchestrierung als eigene Domain
- heutige Runtime-Garantie einer externen GA-Partner-API

---

## Status

- Phase-24-Zielbild / Boundary-Scaffold
- keine Aussage, dass externe Partnerpfade bereits live oder voll verdrahtet sind
- konkrete Capability-/Approval-Mechanik haengt an `CAPABILITY_REGISTRY.md`

---

## Capabilities

| Capability | Beschreibung | Partner-Default |
|------------|--------------|-----------------|
| `read:market` | Marktdaten lesen | Ja |
| `read:portfolio` | Portfolio lesen | Ja |
| `write:order` | Order platzieren | Nein (approval) |
| `write:config` | Konfiguration aendern | Nein |

---

## Quotas

| Resource | Limit | Einheit |
|----------|-------|---------|
| API-Calls | 1000 | pro Stunde |
| WebSocket-Connections | 5 | pro Partner |
| Batch-Requests | 100 | pro Request |

---

## Audit-Pflichten

- Alle mutierenden Aktionen werden geloggt
- Partner-ID, Timestamp, Action, Resource
- Aufbewahrung: 90 Tage (konfigurierbar)

---

## Contract-Test-Input

```yaml
version: "1.0"
provider: tradeview-fusion
consumer: partner-acme
endpoints:
  - path: /api/v1/market/quote
    method: GET
    contract: openapi
```

---

## Querverweise

- `EXECUTION_PLAN.md`
- `CAPABILITY_REGISTRY.md`
- `ROLLOUT_GATES.md`
