# Ecosystem Optionality Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Aktiver Delta-Plan fuer Phase 24: Internal Plugin Pilot,
> Partner Boundary, Payment Adapter und reversible Rollout-Governance.

---

## 0. Execution Contract

### Scope In

- Plugin-Pilot-Hardening (Allowlist, Signatures, Kill-Switch, Sandbox)
- Partner-/ISV-Boundary mit contract-testbarer Capability-/Quota-/Audit-Grenze
- optionale Payment-Adapter-Domain als kontrollierter Add-on-Pfad
- reversible Rollout-Gates von internal bis general

### Scope Out

- Behauptung produktiver externer GA ohne geschlossene Gates
- ungebundene Marketplace-Features ohne Boundary-/Rollout-Regeln

### Mandatory Upstream Sources

- `docs/specs/PLUGIN_PILOT.md`
- `docs/specs/PARTNER_BOUNDARY.md`
- `docs/specs/PAYMENT_ADAPTER.md`
- `docs/specs/ROLLOUT_GATES.md`
- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/ERRORS.md`
- `docs/specs/EXECUTION_PLAN.md`

---

## 1. Offene Deltas

- [ ] **ECO1** Plugin-Signaturpruefung von Target-State zu verifizierbarem Runtime-Pfad heben
- [ ] **ECO2** Sandbox-Limits (FS/Netz/CPU/Memory) als testbare Guardrails nachweisen
- [ ] **ECO3** Partner-Boundary Contracts fuer representative Capabilities contract-testbar machen
- [ ] **ECO4** Quota-/Audit-Pfade fuer mutierende Aktionen verifizieren
- [ ] **ECO5** Payment-Adapter nur ueber feature-gated, additive Domainpfade aktivieren
- [ ] **ECO6** Rollout-Stage-Gates mit KPI-/Rollback-Evidence operationalisieren
- [ ] **ECO7** Feature-Flag-Pfade (`Unleash`/`Flagsmith` oder aequivalente Runtime-Flags) fuer Plugin/Partner/Payment klar dokumentieren
- [ ] **ECO8** Kill-Switch-Rollout pruefen (global + pro capability) inkl. degraded-mode Kennzeichnung

---

## 2. Verify-Gates

- [ ] **ECO.V1** Internal Plugin Pilot (allowlist + kill switch + basic guardrails) verifiziert
- [ ] **ECO.V2** Partner-Boundary Contract-Test fuer mindestens einen read-capability path
- [ ] **ECO.V3** Rollback-Kriterium reproduzierbar ausloesbar (manuell oder automatisiert)
- [ ] **ECO.V4** Payment-Adapter deaktiviert/aktiviert ohne Core-Bypass nachgewiesen
- [ ] **ECO.V5** Feature-Flag-Aenderung wirkt kontrolliert auf Runtime-Stages (internal/pilot/limited/general)

---

## 3. Evidence Requirements

- ECO-ID + betroffener Teilbereich (Plugin/Partner/Payment/Rollout)
- Contract-/API-Nachweis inkl. Error-Path
- Security-/Audit-/Quota-Nachweis bei mutierenden Pfaden
- Entscheidungseintrag: adopt/defer/reject mit Owner und Datum

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/PLUGIN_PILOT.md`
- `docs/specs/PARTNER_BOUNDARY.md`
- `docs/specs/PAYMENT_ADAPTER.md`
- `docs/specs/ROLLOUT_GATES.md`
- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/execution/references_projects_evaluate_delta.md` (bei externen Kandidaten)

---

## 5. Exit Criteria

- `ECO1-ECO6` entschieden
- mindestens ein sicherer internal path und ein klarer external-gated path verifiziert
- Phase 24 hat konkrete Runtime-/Governance-Gates statt reiner Target-State-Beschreibung
