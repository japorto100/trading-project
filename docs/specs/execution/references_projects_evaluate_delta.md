# References Projects Evaluate Delta

> **Stand:** 09. Maerz 2026  
> **Zweck:** Verbindlicher Arbeitsplan fuer externe Projekt-/Library-Evaluationen
> aus `docs/references/projects/*` bis zur klaren Entscheidung (adopt/defer/reject).

---

## 0. Execution Contract

### Scope In

- strukturierte Evaluationspfade fuer `evaluate.md` und `to-watch.md`
- Entscheidungsgates fuer Adoption in bestehende Architektur
- Rueckkopplung in Owner- und Rollout-Dokumente

### Scope Out

- lose Link-Sammlungen ohne Entscheidung
- Implementierungsdetails einzelner Komponenten ohne vorherigen Evaluate-Entscheid

### Mandatory Upstream Sources

- `docs/references/README.md`
- `docs/references/projects/README.md`
- `docs/references/projects/evaluate.md`
- `docs/references/projects/to-watch.md`
- `docs/REFERENCE_PROJECTS.md`
- `docs/specs/EXECUTION_PLAN.md`

---

## 1. Offene Deltas

- [ ] **RPE1** Evaluate-Kandidaten haben einheitliche Bewertungsfelder (fit, risk, ops, license)
- [ ] **RPE2** To-Watch Kandidaten besitzen klare Promote-/Drop-Kriterien
- [ ] **RPE3** Entscheide in Kategorien `adopt/defer/reject` mit Begruendung
- [ ] **RPE4** adoptierte Kandidaten werden in passenden Owner-Execution-MD ueberfuehrt
- [ ] **RPE5** root-bridge (`REFERENCE_PROJECTS.md`) bleibt mit references-katalog konsistent
- [ ] **RPE6** stueckweise publizierte OSS-Projekte besitzen ein explizites Monitoring-Datum und Re-Evaluate-Trigger (aktuell: `pharos-ai` Agent-Layer around `2026-03-12`)

---

## 2. Verify-Gates

- [ ] **RPE.V1** mindestens ein Kandidat sauber von Evaluate -> Adopt ueberfuehrt
- [ ] **RPE.V2** mindestens ein Kandidat mit begruendetem Defer/Reject
- [ ] **RPE.V3** Follow-up-Owner (compute/infra/agent/domain) eindeutig gesetzt

---

## 3. Evidence Requirements

- RPE-ID + Kandidat
- Bewertung entlang standardisierter Kriterien
- finale Entscheidung + Owner + naechster Schritt
- Verlinkung auf betroffene Execution- und Root-Dokumente

---

## 4. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/references/projects/evaluate.md`
- `docs/references/projects/to-watch.md`
- `docs/REFERENCE_PROJECTS.md`
- `docs/geo/PHAROS_AI_REVIEW.md`
- je nach Entscheidung: `compute_delta.md`, `infra_provider_delta.md`, `agent_memory_context_delta.md`, `domain_intelligence_delta.md`

---

## 5. Exit Criteria

- `RPE1-RPE5` entschieden
- kein Evaluate-Kandidat ohne klaren Status und Owner
- References-Projektkatalog ist mit Execution-Roadmap synchron
