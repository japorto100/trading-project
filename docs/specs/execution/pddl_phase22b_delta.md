# Execution Delta -- Phase 22b Formal Planning (PDDL / ADL)

> **Stand:** 13. Maerz 2026 (Rev. 2)
> **Status:** PLANNED (gated pilot)
> **Owner:** Agent Runtime / Orchestration
> **Zweck:** Operativer Delta-Plan fuer formale Plan-Validierung in Agent-Workflows
> mit temporalen/numerischen Constraints.

---

## 0. Execution Contract

### Scope In

- formale Plan-Pruefung fuer komplexe Multi-Step-Agent-Workflows
- PDDL/ADL-Domain fuer Pilot "Morning Research Run"
- Solver-gestuetzte Validierung vor Ausfuehrung (`Plan -> Validate -> Execute/Replan`)
- messbare Go/No-Go-Entscheidung fuer weitere Adoption

### Scope Out

- Low-Latency-Trade-Execution
- triviale CRUD-/UI-Workflows
- Ersatz der bestehenden JSON Tool Schemas oder API-Vertraege

### Sprach-/Spec-Schichtung (verbindlich)

| Layer | Primaere Spezifikation | Rolle im Stack | Solver noetig |
|---|---|---|---|
| Tool Use / Agent-IO | JSON Tool Schemas | LLM-nahe Tool-Vertraege (heute primaer) | Nein |
| API / Transport | OpenAPI / JSON Schema | HTTP-/MCP-/Contract-Validierung | Nein |
| Formale Ablaufplanung | PDDL / ADL | Plan-Validierung fuer harte zeitl./numerische Constraints | Ja |

**Arbeitsregel:** PDDL/ADL ergaenzt JSON/OpenAPI, ersetzt sie nicht.

### Mandatory Upstream Sources

- `docs/AGENT_TOOLS.md` (Sek. 15)
- `docs/AGENT_ARCHITECTURE.md` (Sek. 12.5a, 12.5b)
- `docs/specs/EXECUTION_PLAN.md` (Phase 22b)
- `docs/specs/API_CONTRACTS.md` (API-/Schema-Authority)

---

## 1. Zielbild und Integrationsmuster

PDDL/ADL wird **nicht** als generelle App-Sprache eingefuehrt, sondern als
optionale Validierungsschicht fuer Plaene mit harten Constraints:

- Dauer und Deadlines
- Ressourcenbudgets (API-Limits, CPU, Queue-Slots)
- erlaubte/unerlaubte Parallelitaet
- Replan-Trigger bei Constraint-Verletzung

Integrationsmuster:

1. Planner erzeugt Runtime-Plan (DAG/Steps)
2. Formale Validierung prueft Plan gegen Domain-Constraints
3. Nur valide Plaene werden ausgefuehrt, sonst Replanning

Baseline bleibt: JSON Tool Schemas + deterministische Runtime-Checks.

---

## 2. Pilot-Usecase (Pflicht)

**Pilot:** Morning Research Run vor Marktstart.

Minimaler Ablauf:

1. Makrodaten + News + Kalender laden
2. Feature-/Embedding-Refresh starten
3. Konsistenz-/Frische-Gates pruefen
4. Deadline vor Market Open einhalten
5. Fallback-Provider nutzen, falls Primarquelle fehlschlaegt

---

## 3. Offene Deltas

- [ ] **P22B1** Pilot-Domain/Problem modellieren (PDDL + ADL-Features nur wo noetig)
- [ ] **P22B2** Zeit-/Ressourcen-Constraints als harte Guards abbilden
- [ ] **P22B3** konservative Modellierung festhalten (non-self-overlapping actions)
- [ ] **P22B4** Solver-Pfad 1 integrieren (FastDownward via Python subprocess)
- [ ] **P22B5** optionalen Vergleichspfad evaluieren (unified_planning)
- [ ] **P22B6** Runtime-Hook zwischen Planner und Executor einbauen
- [ ] **P22B7** Invalid-Plan Fehlerklassen + Replan-Trigger strukturieren
- [ ] **P22B8** Sprach-/Spec-Grenzen dokumentieren:
  JSON Tool Schemas vs OpenAPI/JSON Schema vs PDDL/ADL
- [ ] **P22B9** Go/No-Go-Entscheid mit Evidence dokumentieren (Adopt/Defer)

---

## 4. Verify-Gates

- [ ] **P22B.V1** Valide Plaene passieren den Formal-Check reproduzierbar
- [ ] **P22B.V2** Invalid-Plaene werden korrekt geblockt und liefern brauchbaren Fehlergrund
- [ ] **P22B.V3** Replanning wird bei Constraint-Verletzung stabil ausgeloest
- [ ] **P22B.V4** p95 Planerzeugung + Validierung <= 2s (Pilot-Szenarien)
- [ ] **P22B.V5** Deadline-Adherence im Pilot ist mindestens baseline-neutral
- [ ] **P22B.V6** Kein Contract-Drift in JSON Tool Schemas oder OpenAPI-Vertraegen

---

## 5. Evidence Requirements

- P22B-ID + Szenario + Constraint-Set
- reproduzierbarer Input-Plan und beobachtetes Ergebnis (valid/invalid + Grund)
- Erfolgspfad und Error-/Replan-Pfad als Nachweis
- Vergleich gegen Baseline (ohne formale Validierung)
- dokumentierte Impact-Einschaetzung fuer Runtime-Komplexitaet

---

## 6. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md` (Phase-Board / Status)
- `docs/AGENT_TOOLS.md` (Sek. 15, Tool-/Sprachen-Einordnung)
- `docs/AGENT_ARCHITECTURE.md` (Sek. 12.5a/12.5b, Orchestration-Pattern)
- `docs/specs/API_CONTRACTS.md` (falls Contract-Boundaries nachgezogen werden muessen)

---

## 7. Go/No-Go-Kriterien

Adopt-Kandidat nur wenn alle Punkte stabil erfuellt sind:

- Plan-Validitaet >= 95% auf definiertem Testset
- p95 Planerzeugung + Validierung <= 2s
- Deadline-Adherence verbessert oder mindestens nicht schlechter als Baseline
- Replan-Rate sinkt in Konfliktfaellen gegenueber rein heuristischem Planner
- keine signifikante Runtime-Komplexitaet fuer Standardfaelle

Defer, wenn Modellierungs-/Betriebsaufwand den Nutzen uebersteigt.

---

## 8. Offene Punkte

- Welche Domain-Slices sind nach dem Pilot der naechste Kandidat?
- Reicht ein Solver-Pfad oder brauchen wir zwei Engines fuer Vergleich/Robustheit?
- Wie tief gehen wir in ADL-Features, bevor wir produktiv schalten?
