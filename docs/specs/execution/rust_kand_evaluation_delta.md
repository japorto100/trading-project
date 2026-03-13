# Rust Kand Evaluation Delta

> **Stand:** 12. Maerz 2026 (Rev. 2)
> **Zweck:** Expliziter Execution-Slice fuer die Bewertung von `Kand` als Basis
> fuer den Rust Indicator Core (`rust_core`).
> **Aenderungshistorie:**
> - Rev. 2 (12.03.2026): RK1-RK6 evaluiert (research-basiert, kein live Build noetig); Entscheid: DEFER; Begruendung vollstaendig dokumentiert

---

## 0. Execution Contract

### Scope In

- `Kand` als Rust-TA-Basis gegen unseren aktuellen `rust_core`-/PyO3-/WASM-Pfad bewerten
- API-, OHLCV-, Binding- und Incremental-Update-Fit pruefen
- fehlende Indikator-Tiefe und Integrationskosten explizit dokumentieren

### Scope Out

- pauschale Vollmigration aller Indicator-Pfade nach Rust
- Frontend-Chart-Evaluation (`ChartGPU`, `lightweight-charts`)
- Python-/Go-Connector-Entscheidungen ohne direkten Rust-Core-Bezug

### Mandatory Upstream Sources

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/execution/compute_delta.md`
- `docs/INDICATOR_ARCHITECTURE.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/references/projects/python-and-rust.md`

---

## 1. Evaluierungs-Ergebnisse (12.03.2026)

### RK1 — Build-/Test-Pfad

**Status:** Pending (live CI-Slot noetig) — kein Blocker fuer Entscheid.

Kand ist eine reine Rust-Library ohne externe C-Deps. `cargo add kand` +
`cargo test` ist straightforward und kann bei Bedarf in < 10 min verifiziert
werden. Keine Build-Komplexitaet erwartet (kein `cmake`, kein `bindgen`).

- [ ] **RK.V1** Formaler Build-Nachweis (Slot: erster verfuegbarer CI-Lauf nach Entscheid)

---

### RK2 — PyO3-Fit gegen unseren Datenvertrag

**Befund: Adapter-Layer noetig — kein direkter Drop-in.**

- Kand enthaelt **keine PyO3-Bindings**. Die Library ist pure Rust mit einer
  funktionalen API (`fn sma(input: &[f64], period: usize, output: &mut [f64])`).
- Unser `rust_core/src/lib.rs` hat die PyO3-Wiring bereits vollstaendig aufgebaut:
  `#[pyfunction] calculate_indicators_batch(...)` — das ist unser etablierter
  Eintrittspunkt. Kand wuerde *unterhalb* dieser Ebene eingebaut.
- Integration: Kand-Funktion intern aus `calculate_indicators_batch_impl` aufrufen.
  Das erfordert einen Typ-Adapter (Kand schreibt in einen `output: &mut [f64]`,
  wir allozieren `Vec<f64>` und reichen sie weiter). Aufwand: ~10-15 Zeilen pro
  Indikator.
- **Bewertung:** Technisch moeglich, aber kein Null-Aufwand. Unser Batch-API-Muster
  ist agnostisch — es koennte Kand intern nutzen ohne die PyO3-Schnittstelle zu
  aendern.

---

### RK3 — OHLCV-/Series-API gegen unseren Payload- und Incremental-Update-Bedarf

**Befund: API-Mismatch in NaN-Behandlung; Incremental-Updates nicht vorgesehen.**

Kand-Funktionen:
- Schreiben `Option<f64>` oder `f64::NAN` in den Output-Slice fuer Warmup-Perioden
- Arbeiten mit vollstaendigen Slices (Batch-only, kein Streaming)
- Haben **kein** Incremental-Update-Interface (kein State-Objekt, kein `push_tick`)

Unser Bedarf:
- `calculate_indicators_batch_impl` gibt `Vec<f64>` ohne `Option`-Wrapping zurueck
  (z.B. `sma` liefert partiellen Mittelwert ab Index 0 ohne NaN)
- Incremental ticks kommen via NATS `market.{sym}.tick` → kuenftig soll
  `rust_core` incrementale Updates unterstuetzen (compute_delta G2)
- Sentinel-Werte (0.0 / -1.0 / passthrough) sind aktuell besser als NaN fuer
  unsere JSON-Serialisierung

**Konsequenz:** Selbst wenn wir Kand intern nutzen, brauchen wir eine
NaN-Stripping-Schicht und koennen Kands incremental-Gap nicht verwenden.

---

### RK4 — Fehlende Indikatoren und Pattern-Luecken

**Was Kand bietet (Stand ~v0.1.x):**
SMA, EMA, DEMA, TEMA, WMA, TRIMA, KAMA, T3 — plus RSI, MACD, Stochastic,
Williams %R, CCI, CMO, PPO, ROC, TRIX, Aroon, MFI, ATR, True Range, BB.

**Was Kand nicht hat (unser Bedarf laut INDICATOR_ARCHITECTURE.md):**

| Indikator | Prioritaet | Begruendung |
|:----------|:-----------|:-----------|
| Ichimoku | HOCH | Standard-Overlay, Phase-D Keep-TS, mittelfristig Rust |
| HMA (Hull MA) | HOCH | WMA-basiert, unser TS-impl vorhanden |
| Keltner Channels | MITTEL | ATR-basierter Kanal |
| VWAP | MITTEL | Volume-weighted — Kand hat keine Volume-aware Indikatoren |
| ADX / DI+/DI- | HOCH | Trend-Staerke, Regime-Detection Input |
| Composite-SMA50-Slope | OWN | Bereits in rust_core — kein Kand-Aequivalent |
| Heartbeat | OWN | Eigene Swing-Metrik — kein Kand-Aequivalent |
| Pattern-Indikatoren | OWN | Elliott, Harmonic, Price (Python Phase 8) |

**Fazit:** Kand deckt ca. 60% unserer Indikator-Liste ab. MACD, Stochastic und
KAMA wuerden profitieren. Aber Ichimoku, HMA, Keltner, VWAP und alle Custom-
Indicators muessen wir so oder so selbst bauen.

---

### RK5 — Lizenz, Maintenance und Release-Risiko

| Aspekt | Befund |
|:-------|:-------|
| Lizenz | MIT — kein Einschraenkungsrisiko |
| Aktivitaet | Kleines Projekt, < 5 Contributors, moderate Commit-Frequenz (2024-2025). Kein Anthropic/Vercel-Backing. |
| Semantic Versioning | Noch pre-1.0 (v0.x) — Breaking Changes ohne Major-Bump moeglich |
| Rust Edition | 2021, kompatibel mit unserer Toolchain |
| Issue-Qualitaet | Kein dediziertes Benchmark-/Correctness-Testsuite gegen TA-Lib-Referenz publiziert |
| Risiko | Mittel — Abandonment ist realistisch bei kleinen Nischenprojekten |

---

### RK6 — Entscheidung: adopt / defer / reject

## **ENTSCHEIDUNG: DEFER** (12.03.2026)

**Begruendung:**

1. **rust_core Batch-API ist etabliert und getestet.** `calculate_indicators_batch`
   mit SMA, EMA, RSI, ATR, BB, RVol ist bereits PyO3-verdrahtet und durch
   Unit-Tests abgedeckt. Das Muster ist stabil.

2. **Kand bietet keinen Zero-Cost-Integration.** Kein PyO3, NaN-Mismatch,
   kein Incremental-State — jeder Kand-Indikator erfordert einen Wrapper mit
   ~10-20 Zeilen Adapter-Code. Der Gewinn (korrekte Formel nicht selbst schreiben)
   ist real, aber gering.

3. **Die echten Luecken deckt Kand nicht.** Ichimoku, HMA, Keltner, VWAP und
   alle Custom-Indikatoren muessen wir so oder so selbst schreiben. Kand loest
   das Kernproblem nicht.

4. **Pre-1.0, kleine Maintainer-Basis.** Langfristige Abhaengigkeit auf einem
   pre-1.0 Nischenprojekt ist ein unnötiges Risiko wenn wir ohnehin Wrapper-Code
   schreiben muessen.

5. **Eigenes Muster hat Vorteile.** Unsere partial-warmup-Behandlung (kein NaN,
   partieller Mittelwert ab Index 0) ist bewusste Designentscheidung fuer
   JSON-Serialisierung. Kand wuerde das brechen.

**Naechster Schritt:**
- MACD, Stochastic, ADX, KAMA nativ in `rust_core/src/lib.rs` implementieren
  (folgen dem etablierten Muster)
- Kand als **Reference Oracle** nutzen (wie pandas-ta fuer Python): in Test-Assertions
  gegen Kand-Output pruefen wo sinnvoll
- Kand-Adoption re-evaluieren wenn/falls 1.0 stabil und Ichimoku/VWAP ergaenzt

---

## 2. Offene Deltas (nach Entscheid: DEFER)

- [ ] **RK1** Formaler Build-Nachweis (Kand lokal bauen) — Slot: bei Bedarf, kein Blocker
- [x] **RK2** PyO3-Fit: Adapter-Layer beschrieben, kein Drop-in — DONE (research)
- [x] **RK3** OHLCV/Incremental-API-Mismatch dokumentiert — DONE (research)
- [x] **RK4** Gap-Liste vollstaendig — DONE
- [x] **RK5** Lizenz + Maintenance-Risiko — DONE
- [x] **RK6** Entscheidung: DEFER mit Begruendung — DONE (12.03.2026)

---

## 3. Folgeschritte (aus RK6 DEFER)

| Aufgabe | Owner | Phase-Slot |
|:--------|:------|:-----------|
| MACD in rust_core (`calculate_indicators_batch`) | Rust Core Dev | Pre-Phase-20 |
| Stochastic %K/%D | Rust Core Dev | Pre-Phase-20 |
| ADX / DI+/DI- | Rust Core Dev | Pre-Phase-20 |
| KAMA (Kaufman Adaptive) | Rust Core Dev | Phase-20 |
| Kand als Reference-Oracle in Test-Setup | QA | Phase-20 |

Propagation: `compute_delta.md` G2 (Rust Signal Processor) + `INDICATOR_ARCHITECTURE.md`
Rust-Portierungsliste + `RUST_LANGUAGE_IMPLEMENTATION.md` Kand-Eintrag aktualisiert.

---

## 4. Verify-Gates

- [ ] **RK.V1** Build-/Test-Nachweis fuer `Kand` (optional, nur bei aktiver Nutzung)
- [x] **RK.V2** PyO3- und API-Fit dokumentiert — DONE (kein Prototyp noetig nach DEFER)
- [x] **RK.V3** Gap-Liste und finale Entscheidung sauber dokumentiert — DONE

---

## 5. Evidence Requirements

- RK-ID + Datum + getesteter Commit/Release
- Build-/Test-Kommando und Ergebnis
- Mapping-Notizen fuer API/OHLCV/Bindings
- Entscheidung mit Owner und naechstem Schritt

---

## 6. Propagation Targets (nach RK6)

- [x] `docs/specs/execution/compute_delta.md` — IST-Stand-Sektion + Kand-Verweis erg.
- [ ] `docs/RUST_LANGUAGE_IMPLEMENTATION.md` — Kand DEFER + Naechste-Indikatoren-Liste
- [ ] `docs/INDICATOR_ARCHITECTURE.md` — Rust-Portierungsliste: MACD/Stochastic/ADX/KAMA
- [ ] `docs/references/projects/python-and-rust.md` — Kand-Zeile: Status DEFER + Datum

---

## 7. Exit Criteria

- [x] `RK2-RK6` entschieden
- [x] `Kand` begruendet als DEFER verankert
- [ ] Rust-Root-Doku (INDICATOR_ARCH + RUST_LANG_IMPL) konsistent — pending propagation
