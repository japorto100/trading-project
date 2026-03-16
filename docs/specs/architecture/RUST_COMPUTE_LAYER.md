# RUST COMPUTE LAYER

> **Stand:** 16. Maerz 2026
> **Zweck:** Owner-Spec fuer die Rust-Strategie: ADR (No-Julia-first), PyO3-Boundary-Regeln,
> bekannte Kernel-Module und Einsatz-Kriterien.
> **Source-of-Truth-Rolle:** Autoritativ fuer Rust-Einsatzentscheidungen und PyO3-Kontrakte.

---

## 1. Leitprinzip

Rust ist der **selektive Hot-Path-Compute-Layer** des Systems.

- Einbindung ausschliesslich via `PyO3` (Python/Rust-Boundary).
- Einsatz nur dort, wo Profiling einen nachweislichen Engpass belegt.
- Keine unilaterale Rust-Einfuehrung ohne Benchmark + Business-Impact-Nachweis.

Sprachschnitt-Kurzformel:

| Sprache | Rolle |
|:--------|:------|
| Go | Control Plane — Policy, Auth, Routing, Audit |
| Python | Intelligence Plane — ML, Agentik, Retrieval, Simulation |
| Rust | Acceleration Plane — gezielter Hot-Path via PyO3 |

---

## 2. ADR: No-Julia-first

**Entscheidung:** Die Plattform verfolgt bis auf Weiteres eine **No-Julia-first** Strategie.

- Primaerer Compute-Stack bleibt `Python + Rust (PyO3)`.
- Rust ist der bevorzugte Pfad fuer performance-kritische Produktionslogik.
- Julia ist optionaler Spezialpfad fuer eng abgegrenzte numerische Use Cases.

**Trigger fuer Julia (alle Punkte muessen erfuellt sein):**

1. Bottleneck ist nachweislich numerisch-algorithmisch (Profiling + reproduzierbarer Benchmark).
2. Rust-Implementierung erreicht Ziel-SLO nicht.
3. Klarer Business-Impact quantifiziert.
4. Betriebsmodell geklaert (Packaging, Security, Monitoring, Oncall-Faehigkeit).
5. Exit-/Portierungsplan fuer langfristigen Lock-in-Schutz vorhanden.

**Bevorzugte Upgrades vor Julia:**

1. Rust Hot-Path Ausbau (SIMD/parallel/no-copy boundaries).
2. Direkte Go-Rust-Service-/Compute-Grenze evaluieren.
3. PyO3 Boundary-Hardening (strict schemas, error contracts, perf counters).
4. Wasm-Component Plugin-Pfade fuer kontrollierte Erweiterbarkeit.

---

## 3. Einsatz-Kriterien und Optimierungspyramide

Rust kommt erst nach Ausschoepfung der ersten drei Stufen:

1. **Algorithmen/Batching** — logische Optimierung, bessere Datenstrukturen
2. **Caching/Data locality** — Hot-Path-Daten nah am Compute halten
3. **Concurrency/Parallelism** — Python-native Parallelisierung (asyncio, Multiprocessing)
4. **Native Acceleration (Rust via PyO3)** — erst nach Profiling-Nachweis

---

## 4. Rust Acceleration Plane (IST)

Aktuelle und geplante Kernel-Module:

| Modul | Beschreibung | Status |
|:------|:-------------|:-------|
| `graph-kernels` | Graph-Traversal und Community-Detection | geplant |
| `spatial-kernels` | Geo-Berechnungen, Distanz-/Polygon-Logik | geplant |
| `ode-kernels` | Differentialgleichungs-Solver | geplant |
| `mc-kernels` | Monte-Carlo-Simulation, Rollout-Scoring | geplant |
| `indicator-kernels` | Technische Indikatoren (OHLCV-Compute) | geplant |

Alle Kernel:
- werden als PyO3-Extension-Modul gebaut
- besitzen strikt typisierte Eingangs-/Ausgangs-Schemas
- geben strukturierte Fehler zurueck (kein Rust-Panic durch die Boundary)
- werden per reproduzierbarem Benchmark gegen Python-Baseline validiert

---

## 5. PyO3-Boundary-Regeln

| Regel | Detail |
|:------|:-------|
| Strict Schemas | Alle Inputs/Outputs versioniert typisiert (keine Any/untyped Dicts) |
| Error Contracts | Rust gibt `Err` zurueck, kein Panic durch die Python-Boundary |
| Perf Counters | Jeder Kernel misst Latenz und gibt sie an Telemetrie-Layer weiter |
| No Side Effects | Rust-Kernel haben keine unilateralen DB- oder Netzwerk-Zugriffe |
| Stateless by default | Kein Shared Mutable State zwischen PyO3-Aufrufen ohne explizite Synchronisation |

---

## 6. Performance-Strategie (Rust-Anteil)

- Standardpfad: Go fuer IO/Routing → Python fuer ML/Analytics → Rust fuer Hot Paths.
- SIMD-Nutzung wo CPU-Profiling zeigt, dass vektorielle Operationen dominieren.
- `no-copy boundaries` anstreben: Python-Buffer-Protokoll / NumPy-compatible Arrays.
- Parallelism (Rayon) fuer embarrasingly-parallel Batch-Compute.

---

## 7. Querverweise

- `docs/specs/architecture/ARCHITECTURE_BASELINE.md` (Gesamtarchitektur, Performance-Strategie)
- `docs/specs/architecture/AGENT_RUNTIME_ARCHITECTURE.md` (Python-Agentik-Schicht, Rust-Nutzung fuer Simulation)
- `docs/specs/ARCHITECTURE.md` (Umbrella)
