# Reversible Rollout Gates — Phase 24.4

> Stand: 27 Feb 2026  
> Zweck: KPI-basierte Stage-Gates (internal → pilot → limited external) mit Rollback-Kriterien.

---

## Stages

| Stage | Beschreibung | Kriterium |
|-------|--------------|-----------|
| internal | Nur interne Nutzer | — |
| pilot | Ausgewaehlte Beta-Nutzer | Error-Rate < 1% |
| limited external | Begrenzte externe Nutzer | Latency p95 < 500ms |
| general | Allgemeine Verfuegbarkeit | Alle Gates bestanden |

---

## KPI-Gates

| KPI | Schwellwert | Messung |
|-----|-------------|---------|
| Error-Rate | < 1% | 24h Rolling |
| Latency p95 | < 500ms | API-Endpoints |
| Availability | > 99.5% | Uptime |
| Support-Tickets | < 5 pro Woche | Pro Feature |

---

## Rollback-Kriterien

- Error-Rate > 2% fuer 1h
- Latency p95 > 1s fuer 30min
- Kritischer Bug gemeldet
- Manueller Rollback via `POST /api/v1/rollout/{feature}/rollback`

---

## Config-Scaffold

```yaml
rollout:
  features:
    agent_chat:
      stage: pilot
      kpi_gates:
        error_rate: 0.01
        latency_p95_ms: 500
```

---

## Referenzen

- EXECUTION_PLAN.md Phase 24d
- ARCHITECTURE.md Rollout Plan
