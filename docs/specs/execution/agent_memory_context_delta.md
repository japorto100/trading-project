# Agent/Memory/Context Runtime Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Aktiver Arbeitsplan fuer Agent-Runtime, Tooling, Memory und Context
> Assembly als zusammenhaengende Laufzeitflaeche.

---

## 0. Execution Contract

### Scope In

- Agent-Runtime-Flows, Tool-Policy und Capability-Boundaries
- Memory-/KG-/retrieval-nahe Integritaet und Betriebsgates
- Context-Assembly-Qualitaet fuer produktive Agentantworten

### Scope Out

- Provider-Rollout ohne Agentbezug
- rein theoretische Modellvergleiche ohne Runtime-Relevanz

### Mandatory Upstream Sources

- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/POLITICAL_ECONOMY_KNOWLEDGE.md`
- `docs/ENTROPY_NOVELTY.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`

---

## 1. Offene Deltas

- [ ] **AMC1** Runtime-Flow: repraesentativer Agent-Request inkl. Tool-Handoff nachvollziehbar
- [ ] **AMC2** Tool-Policy: erlaubte/gesperrte Toolpfade mit Fehlerklassifikation verifiziert
- [ ] **AMC3** Memory-Write/Read Konsistenz in typischen Multi-Step-Flows verifiziert
- [ ] **AMC4** Context-Assembly: Quellenrangfolge und Konfliktaufloesung dokumentiert
- [ ] **AMC5** Degradationspfad: fehlende Quelle/Tool/Memory liefert kontrollierten Fallback
- [ ] **AMC6** Runtime-Metriken: Request-ID, Latenzklasse und Fehlerklasse sichtbar
- [ ] **AMC7** Knowledgebase-Ingestion: politische/oekonomische Konzepte aus `POLITICAL_ECONOMY_KNOWLEDGE.md` in Semantic-Memory/KG strukturiert aufgenommen
- [ ] **AMC8** Entropy-Novelty-Konzepte als semantische Knoten/Signale mit Retrieval-Regeln verankert
- [ ] **AMC9** Trennung truth/belief/scenario fuer Knowledgebase-Slices explizit verifiziert (kein stilles Mischen)

---

## 2. Verify-Gates

- [ ] **AMC.V1** Agent->Tool->Result End-to-End
- [ ] **AMC.V2** Memory-Semantik fuer Follow-up-Fragen
- [ ] **AMC.V3** Policy-Error-Path (blocked tool / missing capability)
- [ ] **AMC.V4** Context-Conflict-Path (mehrere widerspruechliche Quellen)
- [ ] **AMC.V5** Knowledgebase-Retrieval gibt fuer Political-Economy/Entropy konsistente, zitierbare Ergebnisse

---

## 3. Evidence Requirements

Pro geschlossenem Punkt:

- AMC-ID + kurzer Ablauf
- API-/UI-/Log-Nachweis
- beobachtetes Verhalten bei Fehlerfall
- Rueckspiegelung in Owner-Dokumente

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/POLITICAL_ECONOMY_KNOWLEDGE.md`
- `docs/ENTROPY_NOVELTY.md`

---

## 5. Exit Criteria

- `AMC1-6` entschieden (geschlossen oder deferred mit Owner/Datum)
- mindestens ein valider E2E-Flow plus ein kontrollierter Degradationsflow nachgewiesen
- keine offene Runtime-Divergenz zwischen Execution und Root-Owner
