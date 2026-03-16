# ORCHESTRATION AND MESSAGING

> **Stand:** 16. Maerz 2026  
> **Zweck:** Klare Trennlinie zwischen Event/Messaging und durable
> Prozessorchestrierung fuer langlaufende Flows.
> **Source-of-Truth-Rolle:** Autoritativ fuer die Auswahlregeln NATS vs.
> Workflow-Engine.

---

## 1. Grundsatz

- `NATS JetStream` bleibt Event-Backbone und Worker-Entkopplung.
- `NATS` ersetzt keine vollwertige Workflow-Semantik.
- Workflow-Engine wird nur dort eingefuehrt, wo Durable-State und Resume
  betriebsrelevant sind.

---

## 2. Wann NATS reicht

NATS-first ist passend bei:

- Event-Verteilung und Fanout
- kurzen bis mittleren asynchronen Jobs
- at-least-once Konsum und Replay auf Stream-Ebene
- einfachen Retries ohne komplexe Prozessketten

---

## 3. Wann Workflow noetig wird

Workflow-Layer wird noetig bei:

- langen Laufzeiten (Minuten bis Tage)
- mehrstufigen Prozessketten mit Checkpoints
- robusten Retry-/Timeout-/Compensation-Anforderungen
- Resume nach Crash/Deploy
- expliziten Prozesszustaenden mit Auditierbarkeit

---

## 4. Entscheidungs-Gate

Vor Einfuehrung einer Workflow-Engine gilt:

1. Braucht der Flow durable Zwischenzustaende?
2. Muss er auf Schritt-Ebene resume-faehig sein?
3. Reicht bei Fehlern ein kompletter Neustart ohne Semantikverlust?

Wenn Neustart ausreicht, bleibt NATS-first der Default.

---

## 5. Flow-Matrix

| Flow | Startpunkt | Upgrade-Kriterium |
|:-----|:-----------|:------------------|
| ingest (kurz, idempotent) | NATS + Worker-Retry | Prozesskette wird mehrstufig + resume-kritisch |
| reindex/backfill | frueh NATS, schnell evaluate | langlebig, checkpoint-lastig, starke Resume-Anforderung |
| agent long-runs | NATS + service-state bei kurzen Runs | unterbrechbare lange Runs mit expliziten Zustandsuebergaengen |
| backtest batch | Queue + statusfuehrender Service | starke Branching-/Compensation-/Resume-Logik |

---

## 6. Toolklassen (orientierend)

- **Task Queue:** Asynq, BullMQ, Celery, Oban
- **Lightweight Durable:** Hatchet, River
- **Heavy Durable:** Temporal (nur bei klarer Notwendigkeit)
- **Managed Workflows:** z. B. Cloud-Workflow-Dienste bei Ops-Fokus

---

## 7. Upgrade-Pfad

1. **Phase 1:** NATS-first fuer einfache Pipelines.
2. **Phase 2:** Pro kritischem Flow auf lightweight durable erweitern.
3. **Phase 3:** Nur bei belegter Notwendigkeit auf schwere Durable-Orchestrierung.

---

## 8. Querverweise

- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/ARCHITECTURE_NEW_EXTENSION.md` (Bridge/Archiv)
