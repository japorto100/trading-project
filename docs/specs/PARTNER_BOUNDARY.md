# Partner/ISV Boundary Spec — Phase 24.2

> Stand: 27 Feb 2026  
> Zweck: Vertragliche und technische Boundary fuer Partner-Module (Capabilities, Quotas, Audit).

---

## Scope

- Versionierte Boundary-Spec
- Contract-testbar (z.B. Pact, OpenAPI-diff)
- Capabilities, Quotas, Audit-Pflichten

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

## Referenzen

- EXECUTION_PLAN.md Phase 24b
- CAPABILITY_REGISTRY.md
