# GOVERNANCE (Umbrella)

> **Stand:** 16. Maerz 2026
> **Zweck:** Navigations-Spec fuer Governance-Blueprints: Rollout, Plugin-Pilot,
> Partner-Boundary und Payment-Adapter.
> **Status-Hinweis:** Alle Specs in `docs/specs/governance/` sind **Future-facing
> Zielbild-Specs** (Blueprint-Phase). Kein produktiver Runtime-Vertrag.
> Verbindliche operative Entscheidungen leben in `EXECUTION_PLAN.md` und den
> Core-Specs.

---

## Governance Blueprints (`docs/specs/governance/`)

| Datei | Thema | Phase |
|:------|:------|:------|
| [`governance/ROLLOUT_GATES.md`](./governance/ROLLOUT_GATES.md) | Reversible Rollout-Stages, KPI-Gates, Rollback-Regeln — Zielmodell fuer kontrolliertes Deployment neuer Capabilities | Phase B/C |
| [`governance/PLUGIN_PILOT.md`](./governance/PLUGIN_PILOT.md) | Interner Plugin-Runtime-Pilot: Allowlist, Kill-Switch, Sandbox-Grenzen | Phase C |
| [`governance/PARTNER_BOUNDARY.md`](./governance/PARTNER_BOUNDARY.md) | Partner-/ISV-Boundary: Capabilities, Quotas, Audit-Requirements, Consent-Model | Phase C |
| [`governance/PAYMENT_ADAPTER.md`](./governance/PAYMENT_ADAPTER.md) | Payment-Domain: Adapter-Interface, Provider-Routing, Reconciliation, Compliance-Hooks | Phase C |

---

## Abgrenzung zu operativen Docs

| Frage | Owner |
|:------|:------|
| Welche Arbeit ist offen und priorisiert? | `EXECUTION_PLAN.md` |
| Welche Capabilities sind aktiv / enforcement-gated? | `CAPABILITY_REGISTRY.md` |
| Welche Rollout-Phasen und Verify-Gates gelten aktuell? | `EXECUTION_PLAN.md` + `execution/*.md` |
| Welche Security-Grenzen fuer Partner / MCP? | `security/POLICY_GUARDRAILS.md` |
| Welche Payment-Domain-Runtime-Entscheidungen sind verbindlich? | noch kein produktiver Owner (Blueprint-Phase) |

---

## Read Order fuer Governance-Arbeit

1. Dieses Dokument — Uebersicht und Phase-Einordnung
2. `CAPABILITY_REGISTRY.md` — aktiver Enforcement-Stand
3. `EXECUTION_PLAN.md` — was davon aktiv priorisiert ist
4. Relevante Blueprint-Spec — z.B. `ROLLOUT_GATES.md` bei Deployment-Fragen

---

## Querverweise

- `docs/specs/ARCHITECTURE.md` (Umbrella — Governance-Sektion)
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/security/POLICY_GUARDRAILS.md`
