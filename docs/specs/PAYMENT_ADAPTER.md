# Payment Orchestration Adapter — Phase 24.3

> Stand: 27 Feb 2026  
> Zweck: Optionaler Adapter-Layer fuer Payment/Routing/Reconciliation als eigene Domain.

---

## Scope

- Additive Domain — keine Core-Bypaesse
- Payment, Routing, Reconciliation
- Optional: Nur aktiv wenn Payment-Feature enabled

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

## Referenzen

- EXECUTION_PLAN.md Phase 24c
- ARCHITECTURE.md B4
