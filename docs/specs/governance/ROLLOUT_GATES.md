# Reversible Rollout Gates — Phase 24.4

> **Stand:** 16. Maerz 2026
> **Zweck:** Spec fuer reversible Rollout-Stages, KPI-Gates und Rollback-Regeln
> fuer spaetere externe Oeffnung.
> **Source-of-Truth-Rolle:** Zielbild fuer Rollout-Governance; aktuelle
> Go-Registry-Scaffolds sind nur der Anfang, nicht die vollstaendige Runtime.

---

## Scope

- Stages `internal -> pilot -> limited external -> general`
- KPI-Schwellen und Rollback-Kriterien
- einfache Registry-/Config-Scaffolds als Startpunkt

Nicht Teil dieser Spec:

- Behauptung, dass jede Rollback-API bereits implementiert ist
- produktive SLO-/Observability-Dashboards
- Partner-/Plugin-spezifische Vertragsdetails

---

## Status

- Target-State mit vorhandenem Go-Scaffold fuer Stage-Registry
- manuelle Rollback- und KPI-Automation sind als Zielbild zu lesen, bis die
  entsprechenden Handler / Pipelines explizit existieren

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
- Manueller Rollback via `POST /api/v1/rollout/{feature}/rollback` ist
  Zielzustand, nicht bereits als bestaetigte Runtime-API gesetzt

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

## Querverweise

- `EXECUTION_PLAN.md`
- `ARCHITECTURE.md`
- `PLUGIN_PILOT.md`
