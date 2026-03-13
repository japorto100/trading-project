# Indicator Implementation Delta

> **Stand:** 12. Maerz 2026 (Rev. 2)
> **Zweck:** Wahrheit fuer Indikator-IST-Zustand (Python vs. Rust),
> fehlende Indikatoren mit Empfehlung, Book-Referenzen und Python-First-Strategie.
> **Aenderungshistorie:**
> - Rev. 1 (12.03.2026): Initial — IST-Zustand, Lueckenliste, Python-First-Entscheid, Buch-Querverweise
> - Rev. 2 (12.03.2026): MACD/ADX/Stochastic/HMA/VWAP/Keltner Python DONE; WMA DONE; 44/44 Python-Tests grueen; allow_threads via py.detach() DONE (IND.V1,V5,V6 geschlossen)
> - Rev. 3 (12.03.2026): WMA/HMA/MACD/Stochastic/ADX Rust DONE in calculate_indicators_batch; 28/28 Rust-Tests grueen (IND.V2,V3,V4 geschlossen)

---

## 0. Execution Contract

### Scope In

- IST-Zustand: welche Indikatoren existieren und wo (Python / Rust)
- SOLL: fehlende Indikatoren mit Empfehlung Python vs. Rust
- Python-First-Strategie: erst Python (Buch-Referenz), dann Rust-Port-Entscheid
- Book-Querverweise fuer Formeln und Implementierungen
- Best-Practice-Check: Rust-Impl gegen Buch-Formeln verifizieren

### Scope Out

- Frontend-Chart-Integration (Owner: `frontend_refinement_perf_delta.md`)
- Pattern Detection (Phase 8, Python, DONE)
- Regime/HMM/Markov (Phase 15c, Python, DONE)
- Kand-Adoption (DEFER, siehe `rust_kand_evaluation_delta.md`)

### Mandatory Upstream Sources

- `docs/INDICATOR_ARCHITECTURE.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/books/mastering-finance-python.md` (Hauptreferenz TA-Implementierungen)
- `docs/books/deeplearning-with-rust.md` (Python→Rust-Port-Referenz)
- `docs/specs/execution/compute_delta.md`
- `docs/specs/execution/rust_kand_evaluation_delta.md`

---

## 1. IST-Zustand (12.03.2026)

### In Rust (`python-backend/rust_core/src/lib.rs`)

Alle via `calculate_indicators_batch` PyO3-Endpoint abrufbar:

| Indikator | Funktion | Notiz |
|:----------|:---------|:------|
| SMA | `calculate_sma` | partielle Berechnung ab Index 0 (kein NaN) |
| EMA | `calculate_ema` | alpha = 2/(N+1) — Standard-EMA |
| RSI | `calculate_rsi` | Wilder-Smoothing (alpha = 1/N) — korrekt |
| ATR | `calculate_atr` | Wilder-Smoothing — korrekt |
| BB Bandwidth | `calculate_bb_bandwidth` | BW = (Upper-Lower)/Middle |
| BB %B | `calculate_bb_percent_b` | %B = (Close-Lower)/(Upper-Lower) |
| R-Vol (Relative Volume) | `calculate_relative_volume` | Vol/SMA(Vol) |
| Composite SMA50 Slope | `composite_sma50_slope_norm` | normalisierter Slope fuer Regime-Signal |
| Heartbeat | `heartbeat_indicator` | proprietaer, Swing-Metrik |

**Best-Practice-Status:**
- EMA: alpha 2/(N+1) ✓ (Standard per Appel/Murphy)
- RSI: Wilder Smoothing (1/N) ✓ (Wilder 1978 korrekt)
- ATR: Wilder Smoothing ✓
- BB: Periode=20, StdDev=2 ✓ (Bollinger Standard)
- SMA: exakt ✓

**allow_threads:** `py.detach(move || {...})` in allen 5 bestehenden PyO3-Wrappern
eingebaut (12.03.2026, IND.V6 ✓). Neue Funktionen: per Standard-Regel aus
`python_runtime_eval_delta.md`.

---

### In Python (`python-backend/services/indicator-service/`)

Phase 7 (Python-Referenz-Layer, parallel zu Rust):
- SMA, EMA, RSI, ATR, BB, RVOL (Python — dienen als Referenz/Oracle)

Phase 8 (Pattern Detection, Python, CODE-COMPLETE):
- Elliott Wave, Harmonic Patterns (XABCD), Price Patterns (H&S)
- Candlestick Patterns (Dragonfly/Gravestone, Piercing Line, etc.)
- TD Timing (Setup/Countdown)

Phase 15b (Volatility Suite, Python, CODE-COMPLETE):
- Hist. Volatility (HV), Parkinson, Garman-Klass
- Absolute + Relative Regime-Klassifikation

Phase 15c (Regime Detection, Python, CODE-COMPLETE):
- Markov Chain Regime Transitions
- HMM (Hidden Markov Model)

---

## 2. Fehlende Indikatoren + Empfehlung

### Strategie: Python First

1. Python-Implementierung aus Buch erstellen + Unit-Tests gegen pandas-ta/TA-Lib
2. Entscheiden: bleibt in Python (komplex / nicht hot-path) oder geht nach Rust
3. Rust-Port anhand der getesteten Python-Formeln (deterministisch, kein Guess-Work)
4. Optional: `docs/books/deeplearning-with-rust.md` fuer PyO3-Binding-Pattern

---

### Priorisierte Lueckenliste

| Indikator | Empfehlung | Buch-Referenz | Prio | Begruendung |
|:----------|:-----------|:--------------|:-----|:------------|
| **MACD** | Python → Rust | mastering-finance-python.md L5264-5298 | HOCH | Momentum-Signal, nach EMA trivial; hot-path |
| **ADX / DI+/DI-** | Python → Rust | INDICATOR_ARCHITECTURE.md L451 | HOCH | Regime-Detection Input (SMA-Slope + ADX); hot-path |
| **Stochastic %K/%D** | Python → Rust | mastering-finance-python.md (suchen); INDICATOR_ARCH L446 | HOCH | Signal-Generation, tick-frequent |
| **KAMA** | Python zuerst → defer Rust | mastering-finance-python.md L1795-1869 | MITTEL | Adaptiv, ER-basiert; Python gut lesbar; Rust nur wenn profiliert |
| **ATR Trailing Stop** | Rust direkt | ATR schon da, Step-Logic | MITTEL | Stopplevel-Berechnung, tick-nah |
| **Ichimoku** | Python (bleibt) | INDICATOR_ARCHITECTURE.md L452 | HOCH | 5 Linien komplex, nicht tick-frequent; TS-Impl als Referenz |
| **Keltner Channels** | Python (bleibt) | INDICATOR_ARCHITECTURE.md L454 | MITTEL | ATR-Envelope, selten hot-path |
| **VWAP** | Python (bleibt) | — | MITTEL | Volume-weighted + Daily-Reset-Logik; needs volume stream |
| **HMA (Hull MA)** | Python zuerst → evaluate Rust | INDICATOR_ARCHITECTURE.md L450 | MITTEL | WMA-Komposition; Port moeglich aber kein sofortiger Bedarf |
| **ALMA** | Python (bleibt) | INDICATOR_ARCHITECTURE.md L480 | LOW | Gaussfenster, Research-Charakter |

---

### Book-Referenz Kurzliste

| Book | Relevanz |
|:-----|:---------|
| `docs/books/mastering-finance-python.md` | **Hauptreferenz** — KAMA L1795, MACD L5264, BB L~, weitere MAs; Python-Code vorhanden |
| `docs/books/advanced-in-financial-markets-ml.md` | ML-Anwendungen, Feature Engineering; sekundaer fuer Indicator-Implementierungen |
| `docs/books/quantitative-trading.md` | Backtest-Perspektive, weniger Indikator-Detail |
| `docs/books/deeplearning-with-rust.md` | **PyO3-Pattern-Referenz** fuer Python→Rust-Ports; Ownership-/Safety-Patterns |
| `docs/INDICATOR_ARCHITECTURE.md` | Unser eigener Katalog — normative Quelle, Zeilennummern exakt |

---

## 3. Best-Practice-Check-Regel

Vor Rust-Port eines Indikators:

1. Python-Impl aus Buch erstellen (MACD: L5264, KAMA: L1795, etc.)
2. Tests gegen pandas-ta + TA-Lib laufen lassen (Referenz-Orakel)
3. Formel-Details mit INDICATOR_ARCHITECTURE.md abgleichen
4. Erst dann nach Rust portieren (deterministisch, keine Vermutungen)
5. Rust-Impl im Batch-API-Muster (`calculate_indicators_batch`) ergaenzen
6. `py.allow_threads(|| {...})` immer einbauen (vgl. `python_runtime_eval_delta.md`)

---

## 4. Naechste Schritte

| Aufgabe | Slot | Status |
|:--------|:-----|:-------|
| MACD Python-Impl | Pre-Phase-20 | **DONE 12.03.2026** |
| ADX/DI+/DI- Python-Impl | Pre-Phase-20 | **DONE 12.03.2026** |
| Stochastic %K/%D Python-Impl | Pre-Phase-20 | **DONE 12.03.2026** |
| WMA + HMA Python-Impl | Pre-Phase-20 | **DONE 12.03.2026** |
| VWAP Python-Impl | Phase-20 | **DONE 12.03.2026** |
| Keltner Channels Python-Impl | Phase-20 | **DONE 12.03.2026** |
| allow_threads (py.detach) in bestehende rust_core Funktionen | sofort (Quick-Win) | **DONE 12.03.2026** |
| MACD Rust-Port (WMA/HMA/Stochastic/ADX incl.) | Phase-20 | **DONE 12.03.2026** |
| ADX Rust-Port | Phase-20 | **DONE 12.03.2026** |
| Stochastic Rust-Port | Phase-20 | **DONE 12.03.2026** |
| WMA + HMA Rust-Port | Phase-20 | **DONE 12.03.2026** |
| KAMA Python-Impl | Phase-20 | bereits in pipeline.py L420 — DONE |
| Ichimoku Python-Impl (bleibt Python) | Phase-20 | pending |

---

## 5. Verify-Gates

- [x] **IND.V1** MACD Python implementiert, 44/44 Unit-Tests grueen (12.03.2026)
- [x] **IND.V2** MACD/WMA/HMA Rust-Port in `calculate_indicators_batch`, 28/28 Rust-Tests grueen (12.03.2026)
- [x] **IND.V3** ADX Python + Rust, DI+/DI- korrekt, 28/28 Rust-Tests grueen (12.03.2026)
- [x] **IND.V4** Stochastic Python + Rust, 28/28 Rust-Tests grueen (12.03.2026)
- [x] **IND.V5** VWAP/HMA/WMA/Keltner/Stochastic/ADX Python implementiert, 44/44 Tests grueen (12.03.2026)
- [x] **IND.V6** py.detach() in allen 5 bestehenden Rust-PyO3-Wrappern (12.03.2026)

---

## 6. Exit Criteria

- [x] MACD, ADX, Stochastic, WMA, HMA in Rust + `calculate_indicators_batch` — 28/28 Tests grueen
- [x] KAMA, VWAP, Keltner, Stochastic, MACD, ADX in Python — 44/44 Tests grueen
- [x] py.detach() in allen `calculate_*` Funktionen in rust_core
- [ ] Ichimoku Python-Impl (Phase-20, not hot-path)
- [ ] `INDICATOR_ARCHITECTURE.md` Rust-Portierungsliste konsistent aktualisieren (follow-up)
