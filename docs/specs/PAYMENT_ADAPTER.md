# Payment Orchestration Adapter — Phase 24.3

> **Stand:** 09. Maerz 2026
> **Zweck:** Future-facing Scaffold-Spec fuer eine optionale Payment-Domain mit
> Adapter-, Routing- und Reconciliation-Grenze.
> **Source-of-Truth-Rolle:** Owner fuer das Zielbild des Payment-Adapters, nicht
> fuer bereits vorhandene Produktionspfade.

---

## Scope

- Additive Domain — keine Core-Bypaesse
- Payment, Routing, Reconciliation
- Optional: Nur aktiv wenn Payment-Feature enabled

Nicht Teil dieser Spec:

- aktuelle Core-Trading- oder Portfolio-Ausfuehrung
- Partner-/Plugin-Governance
- Behauptung, dass bereits ein Payment-Provider live integriert ist

---

## Adapter-Interface

```go
type PaymentAdapter interface {
    CreateIntent(ctx context.Context, req PaymentIntentRequest) (*PaymentIntent, error)
    Capture(ctx context.Context, intentID string, amount float64) error
    Reconcile(ctx context.Context, period string) (*ReconciliationReport, error)
}
```

---

## Routing

- Payment-Provider-Routing (Stripe, Adyen, etc.)
- Failover bei Provider-Ausfall
- Idempotency Keys fuer Retries

---

## Reconciliation

- Tagesabschluss: Soll vs. Ist
- Diskrepanz-Alerts
- Export fuer Buchhaltung

---

## Status

- Phase-24-Target-State
- aktuell als Architektur- und Interface-Scaffold zu lesen
- konkrete Provider-Integration, Secrets, Audit und Rollout-Gates folgen erst mit
  echter Produktentscheidung

---

## Querverweise

- `EXECUTION_PLAN.md`
- `ARCHITECTURE.md`
- `ROLLOUT_GATES.md`
