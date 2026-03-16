# OBSERVABILITY

> **Stand:** 16. Maerz 2026
> **Zweck:** Verbindliche Telemetrie-, Logging- und Correlation-Normen fuer alle
> Services (Next.js, Go, Python).
> **Source-of-Truth-Rolle:** Autoritativ fuer OTel-Standard, Structured Logging,
> Correlation IDs und Golden Signals. Resilience-/Error-Normen leben in `ERRORS.md`.

---

## 1. OpenTelemetry als Standard

Geschaeftslogik wird **nicht** direkt an proprietaere Observability-SDKs gekoppelt.

| Aspekt | Norm |
|:-------|:-----|
| Emission | `OpenTelemetry` (Traces, Logs, Metrics) |
| Transport | `OTLP` als Standardpfad |
| Praeferierter Stack | `OpenObserve` |
| Moegliche Ergaenzungen | OTel Collector, Jaeger, Prometheus, Grafana, Loki |

---

## 2. Structured Logging

Logs sind strukturiert und korrelierbar.

| Stack | Option |
|:------|:-------|
| TypeScript / Next.js | `pino`, `winston` |
| Go | `log/slog` |
| Python | `structlog` |

**Pflichtfelder in Request-/Fehlerlogs:**

- Correlation ID / Request ID
- Service
- Route / Path
- Status
- Dauer / Latenz
- optional User-/Role-Kontext, wenn policy-relevant

---

## 3. Correlation IDs

Jeder relevante Request-Pfad ist durchgaengig korrelierbar:

- Browser / Next.js
- Go Gateway
- Python Services
- Jobs / Agenten / IPC / Streams

Kein Polyglott-Stack ohne Correlation IDs — Fehleranalyse ist sonst nicht ausreichend.

Konvention: Header `X-Request-ID` wird von Next.js gesetzt und von Go und Python durchgereicht.
Job-Flows erhalten zusaetzlich `traceId` und `jobId` im Job-Record.

---

## 4. Golden Signals

Pro Service verbindlich zu messen:

| Signal | Beschreibung |
|:-------|:-------------|
| Latency | Request-/Job-Dauer (p50, p95, p99) |
| Errors | Fehlerrate und Fehlerklassen |
| Saturation | CPU, Memory, Queue Depth |
| Throughput | Requests/Jobs pro Zeiteinheit |

---

## 5. OTel Trace Context

- W3C Trace Context ueber Sync und Async Grenzen.
- Log-Dedup fuer repetitive Fehler-/Health-Loglines.
- Jeder async Job: `jobId`, `idempotencyKey`, `dedupHash`, `traceId`.

---

## 6. Verify Gates

Observability-Normen sind nur wertvoll, wenn verifizierbar.
Konkrete Gates in:

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/governance/ROLLOUT_GATES.md`

---

## 7. Querverweise

- `docs/specs/ERRORS.md` (Error Taxonomy, Resilience — komplementaer)
- `docs/specs/architecture/ARCHITECTURE_BASELINE.md` (Operational Controls 7.2)
- `docs/specs/api/API_SHARED_INVARIANTS.md` (Correlation-ID-Contract)
- `docs/specs/SYSTEM_STATE.md` (Runtime-Snapshot)
