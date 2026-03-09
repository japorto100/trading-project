# Compute-Split & Indicator Delta

> **Stand:** 09. Maerz 2026
> **Zweck:** Aktiver Delta-Plan fuer Go/Python/Rust-Ownership, Compute-Grenzen,
> Rust-Hot-Paths und die verbleibenden offenen Indikator-/Research-Entscheidungen.
> Dieses Dokument ist nicht mehr der Vollkatalog bereits inventarisierter
> Buch-/Indikatorstaende.

---

## 0. Execution Contract (verbindlich fuer CLI-Agents)

### Scope In

- Go/Python/Rust-Ownership fuer produktive Compute-Pfade
- Rust-Portierungsentscheidungen fuer stabile Heavy-Compute-Kerne
- klare Trennung von Research-/Reference-Pfaden gegenueber Hot-Path-Produktion

### Scope Out

- pauschale Vollmigration nach Rust
- ungezielte Rewrites ohne Profiling-/Nutzungsbezug
- Datenquellen-Rollout ohne Compute-Bezug (Owner: `infra_provider_delta.md`)

### Mandatory Upstream Sources (vor Abarbeitung lesen)

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/INDICATOR_ARCHITECTURE.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/Portfolio-architecture.md`
- `docs/REFERENCE_PROJECTS.md`
- `docs/references/projects/python-and-rust.md`

### Arbeitsprinzip

- Jede Delta-Entscheidung braucht eine **Evidence-Basis** (Profiling, Benchmark, Lastpfad oder Akzeptanzgrund).
- Bei Konflikt zwischen Root-Domain-Dokument und aktueller Umsetzung gilt: Root-Owner pruefen, Delta hier konkretisieren, danach State/Plan nachziehen.

---

## 1. Leitentscheidung

### Arbeitsformel

- **Go transportiert, schuetzt, ordnet.**
- **Python modelliert, plant, verifiziert, simuliert.**
- **Rust beschleunigt gezielt.**

### Produktionsrichtung

Die Zielrichtung fuer schwere Compute-Pfade lautet:

`Go Gateway -> Rust compute boundary -> Python consumes features / runs ML, agents, simulation`

Was dabei **nicht** Ziel ist:

- Python als dauerhafter synchroner Hot-Path-Intermediaer fuer numerisch schwere
  Produktionsarbeit
- vorzeitige Full-Rewrites in Rust
- Research-/Buchnaehe pauschal mit Produktionspfaden verwechseln

---

## 2. Was offen ist

| Thema | Offener Delta-Punkt |
|:------|:--------------------|
| Go↔Rust Boundary | produktionsreife direkte Grenze und Ownership festziehen |
| Python Reference Layer | klarer von produktionsreifen Heavy-Compute-Pfaden trennen |
| Rust Kernels | priorisierte Portierungen fuer stabile, CPU-lastige Funktionen |
| Monte Carlo / Rollouts | entscheiden, was Python bleiben darf und was nach Rust muss |
| finance-bridge | Rolle als temporaerer Python-Adapter vs. spaetere Go-Uebernahme klären |

---

## 3. Service-Split

| Modul / Service | Kurzfristige Rolle | Gewuenschte Richtung |
|:----------------|:-------------------|:---------------------|
| `indicator-service` | Python-Referenzschicht, API-Experiment, bestehende Quant-Pfade | Research-/reference-Layer sauber von Rust-backed Produktionskern trennen |
| `rust_core` / spaeterer Rust signal processor | lokale Beschleunigung via PyO3 | klarer Produktions-Compute-Layer fuer Indikatoren, Pattern, MC, Signal-Kerne |
| `finance-bridge` | bequemer Python-Datenadapter | mittelfristig aus dem Kern der Intelligence Plane herausziehen |
| `agent-service` | Python-first Agentik | bleibt Python |
| `memory-service` | Python-first semantic / KG / vector Arbeit | bleibt Python |
| `geopolitical-soft-signals` | Python-Modellierung mit numerischen Teilpfaden | innere numerische Loops selektiv nach Rust ziehen |

---

## 4. Priorisierte technische Deltas

### A. Boundary / Ownership

- [ ] **G1** — Go→Rust Produktionsgrenze definieren; Python nicht mehr Default
      fuer Hot-Path-Compute
- [ ] **G2** — Rust Signal Processor als klarer Compute-Layer benennen und gegen
      Python-/Go-Rollen abgrenzen
- [ ] **G5** — PyO3 explizit als Fallback/Test-Utility einordnen, nicht als
      alleinige Zukunftsgrenze

### B. Python vs. Rust Rollenteilung

- [ ] **G3** — `indicator-service` trennt Referenz-/Research-Pfade von
      produktionsreifer Heavy-Compute-Arbeit
- [ ] **G4** — Python bleibt klarer Owner fuer ML, Agentik, Retrieval, Regime
      Detection und Simulationslogik
- [ ] **G7** — Rolle von `finance-bridge` finalisieren

### C. Numerische Portierungsentscheidungen

- [ ] **G6** — Monte-Carlo-/Rollout-Review: welche Pfade duerfen in
      NumPy/Polars bleiben, welche muessen nach Rust
- [ ] priorisierte Rust-Portierungen fuer stabile Kerne festlegen:
      `HMA`, `KAMA`, `ALMA`, `Stochastic`, spaetere Pattern-/Composite-Kerne

---

## 5. Buch-Strategie

### Regel

- Buchformeln zuerst nachvollziehbar und testbar halten
- Python bleibt gutes Referenz- und Orakelmedium
- stabile und haeufig genutzte CPU-Kerne wandern nach Rust

### Konsequenz

Python-Finance-Buecher sind **Vorlage fuer Mathematik und Testfaelle**, nicht
automatisch Vorlage fuer produktive Hot-Path-Implementierung.

---

## 6. Externe Quant-Stacks

| Stack | Arbeitsregel |
|:------|:-------------|
| QuantLib | beobachten und selektiv als Referenz / Validierung nutzen |
| ORE | aktuell nur beobachten |
| FINOS / Legend | fuer Modellierung / Governance interessant, nicht als Kernersatz |

Keine aktive Adoption, bevor der eigene Go/Python/Rust-Schnitt sauber ist.

---

## 7. No-New-Mini-Regel

Die Compute-/Indicator-Arbeit bleibt in diesem Mini gebuendelt.

Es entsteht kein separates `mini4` nur fuer:

- Rust ports
- Monte Carlo
- Quant reference work

...solange diese Themen keine eigene, stabile Dokument-Ownership ausserhalb des
Compute-Splits brauchen.

---

## 8. Querverweise

| Frage | Dokument |
|:------|:---------|
| Hoechste Roadmap / offene Arbeit | [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) |
| Runtime-/Layer-Wahrheit | [`../SYSTEM_STATE.md`](../SYSTEM_STATE.md) |
| Normative Sync-/Async-Architektur | [`../ARCHITECTURE.md`](../ARCHITECTURE.md) |
| GeoMap Rendering-/Stack-Gates | [`../../geo/GEOMAP_FOUNDATION.md`](../../geo/GEOMAP_FOUNDATION.md) und [`../../geo/GEOMAP_MODULE_CATALOG.md`](../../geo/GEOMAP_MODULE_CATALOG.md) |
| Infra / provider / messaging / rollout | [`infra_provider_delta.md`](./infra_provider_delta.md) |

---

## 9. Evidence Requirements

Fuer jeden geschlossenen Punkt (`G1-G7`) mindestens:

- Delta-ID und betroffener Service
- Profiling-/Benchmark-/Lastpfad-Hinweis oder begruendete Ausnahme
- dokumentierter Vorher/Nachher-Entscheid
- Folgeupdate in `SYSTEM_STATE.md` und ggf. `ARCHITECTURE.md`

---

## 10. Exit Criteria

- `G1-G7` sind entschieden (umgesetzt oder bewusst deferred mit Owner/Datum)
- Compute-Ownership ist in `SYSTEM_STATE.md` konsistent gespiegelt
- Root-Fachdokumente (`INDICATOR_ARCHITECTURE.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`) sind nicht im Widerspruch zur Delta-Realitaet
