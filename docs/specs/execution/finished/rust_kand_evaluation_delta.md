# Rust Kand Evaluation Delta

> **Stand:** 20. Maerz 2026 (Rev. 8)
> **Zweck:** Expliziter Execution-Slice fuer die Bewertung von `Kand` als Basis
> fuer den Rust Indicator Core (`rust_core`).
> **Aenderungshistorie:**
> - Rev. 8 (20.03.2026): **Phase B 100% COMPLETE** — Audit-Docs archiviert (`docs/archive/KAABAR_BOOK_AUDIT.md`, `docs/archive/KAABAR_CH2_PYTHON_REFERENCE.md`). Konsolidiertes Referenz-Dokument `docs/KAABAR.md` erstellt (alle 12 Kapitel, Endpoint-Tabellen, Bug-Liste, fehlende Go-Proxies). Phase B Exit Criteria erfuellt: Audit done, Referenz-Docs konsolidiert, Test-Infra steht.
> - Rev. 7 (20.03.2026): **Phase B Test-Infrastruktur** — `tests_old/` umbenannt, frisches `tests/` mit `conftest.py` (`generate_test_ohlcv` nach Kaabar Ch.2, 5 Fixtures, 8 Smoke-Tests PASSED). venv auf Python 3.13.1 rebuilt. Dep-Audit: `grpclib` fehlte in Root-pyproject.toml (optional-dep ergaenzt). Import-Audit-Notiz: Extrahierte Module muessen auf fehlende Third-Party-Imports geprueft werden (hmmlearn, scipy, hdbscan etc. — pipeline.py hatte sie, Category Modules nutzen lazy imports oder fehlen noch).
> - Rev. 6 (20.03.2026): **Phase B AUDIT DONE** — alle 12 Kapitel gegen Kaabar 2026 auditiert (7 Bugs, 5 fehlende Validierungen, 6+ Features). Fixes ausstehend. 3 Referenz-Docs erstellt (KAABAR_BOOK_AUDIT, KAABAR_CH2_PYTHON_REFERENCE, BACKTESTING_ARCHITECTURE).
> - Rev. 5 (20.03.2026): **Phase A ABGESCHLOSSEN** — pipeline.py (3969 LOC, 103 defs) vollstaendig in 10 Category Modules extrahiert. Completeness-Review 0 Luecken. Modul-Architektur-Entscheidungen fuer backtest/quant/derivatives/portfolio dokumentiert (Sektion 8e NEU).
> - Rev. 4 (20.03.2026): F1-F5 Rust-Fixes implementiert (ATR Wilder, RSI Wilder-Warmup, sample-std, 10 neue Indikatoren). **Sektion 8 NEU: Category Module Architecture** — Python + Rust Skelett-Strukturen angelegt. Migrationsphasen A-F definiert (Python→Rust→Tonic gRPC). ML-Funktionen als Pseudo-ML identifiziert (keine trainierten Modelle).
> - Rev. 3 (18.03.2026): Entscheid REV: DEFER → **ADOPT (Fork-Strategie)**. kand-py PyO3-Bindings + `*_inc()` API bestaetigt. Python-Buch-Audit (Kaabar 2026) abgeschlossen — K's Collection komplett neu geschrieben, Rust-Blueprint-Notizen ergaenzt.
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

### Angrenzende Boundary-Notiz fuer Compute/Rust

- **Boundary-Entscheid umgesetzt:** `financebridge` ist fuer den reinen
  Markt-Fetch-Strang (`market/search`, `quote/fallback`, `ohlcv`) nicht mehr
  Pflichtpfad; diese Pfade laufen jetzt nativ im Go-Gateway.
- **Bedeutung fuer Python/Rust:** `python-compute` und `rust_core` muessen damit
  nicht mehr den generischen Markt-Fetch als Daueraufgabe tragen, sondern
  koennen klarer auf Indicator-, Transform-, Cache- und Beschleunigerpfade
  fokussieren.
- Diese Boundary-Entscheidung ist **nicht** Teil der Kand-Adoption selbst,
  tangiert aber die langfristige Rolle von `python-compute` und sollte parallel
  zur Rust-Indicator-Expansion sauber beobachtet werden.

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

**Befund (Rev. 3 Update): `kand-py` liefert native PyO3-Bindings. Adapter-Layer
bleibt noetig, aber erheblich vereinfacht.**

- **kand-py** (`crates/kand-py/`) ist ein separates Crate in der Kand-Workspace mit
  vollstaendigen PyO3-Bindings. Funktionen wie `kand_py.ema(input, period)` sind
  direkt aus Python aufrufbar ohne eigene `#[pyfunction]`-Wrapper.
- Fuer unsere `rust_core`-Architektur: Kand als Dependency in `Cargo.toml` einbinden,
  intern aus `calculate_indicators_batch_impl` aufrufen. Kein PyO3-Wrapper pro Indikator noetig.
- Typ-Adapter bleibt: Kand schreibt in `&mut [f64]` mit NaN fuer Warmup — wir
  brauchen eine NaN-Stripping-Schicht (0.0-Fallback) fuer unsere JSON-API.
  Aufwand: ~5-10 Zeilen generisches Utility.
- **Bewertung:** Technisch gut integrierbar. Kein signifikanter Mehraufwand.

---

### RK3 — OHLCV-/Series-API gegen unseren Payload- und Incremental-Update-Bedarf

**Befund (Rev. 3 Update): `*_inc()` Incremental-API jetzt verfuegbar. NaN-Adapter
bleibt noetig.**

Kand-Funktionen (aktueller Stand):
- Batch: `kand::ema(input: &[f64], period, output: &mut [f64])` — NaN fuer Warmup
- **Incremental**: `kand::ema_inc(prev_ema, input, period) -> f64` — O(1) pro Tick
  (ebenfalls fuer RSI, ATR, MACD u.a.)

Unser Bedarf:
- `calculate_indicators_batch_impl`: `Vec<f64>` ohne NaN → NaN-Stripping-Layer noetig
  (generischer Wrapper: 1 Funktion, ~10 Zeilen)
- Incremental ticks via NATS → `*_inc()` API ist genau der richtige Pfad fuer Phase 20
- Sentinel-Werte (0.0 statt NaN) in unserem Batch-Pfad bleiben bestehen

**Konsequenz (Rev. 3):** `*_inc()` loest den Incremental-Gap vollstaendig.
NaN-Stripping ist generisch loesbar. Kein struktureller Blocker mehr.

---

### RK4 — Fehlende Indikatoren und Pattern-Luecken

**Was Kand bietet (Rev. 3 Update — aktueller Kand GitHub Stand):**
SMA, EMA, DEMA, TEMA, WMA, TRIMA, KAMA, T3, HMA, VWAP — plus RSI, MACD, Stochastic,
Williams %R, CCI, CMO, PPO, ROC, TRIX, Aroon, MFI, **ADX/DI+/DI-**, ATR, True Range, BB, Keltner.

Abdeckung jetzt **~75% unserer Liste** (vorher 60%). HMA, VWAP, ADX, Keltner
sind hinzugekommen.

**Was Kand nicht hat (unser Bedarf):**

| Indikator | Prioritaet | Begruendung |
|:----------|:-----------|:-----------|
| Ichimoku | HOCH | Standard-Overlay — fehlt noch in Kand |
| Composite-SMA50-Slope | OWN | Bereits in rust_core — kein Kand-Aequivalent |
| Heartbeat | OWN | Eigene Swing-Metrik — kein Kand-Aequivalent |
| Pattern-Indikatoren | OWN | Elliott, Harmonic, Price (Python Phase 8) |
| K's Collection 6x | OWN | Kaabar-proprietaer — Python-only (SOTA korrigiert 18.03) |
| Rainbow Collection 7x | OWN | Kaabar-proprietaer — Python-only (NEU 18.03) |
| R-Pattern / Gap-Pattern | OWN | Kaabar-proprietaer — Python-only (NEU 18.03) |

**Fazit:** Kand deckt ~75% ab. Ichimoku bleibt die einzige Standard-Luecke.
Alle proprietaeren Kaabar-Indikatoren bleiben Python-only (per Design).

---

### RK4a — Python Buch-Audit Ergebnisse (18.03.2026, Kaabar 2026)

Systematischer Vergleich aller Python-Implementierungen gegen Buchformeln.

**Status pro Indikator:**

| Indikator | Python-Status | Abweichung / Anmerkung |
|:----------|:-------------|:----------------------|
| SMA | ✅ KORREKT | Rolling window mean |
| EMA | ✅ KORREKT | α=2/(n+1), adjust=False |
| SMMA | ✅ KORREKT | Wilder: α=1/n = EWM span=2n-1 |
| WMA | ✅ KORREKT | Gewichtete Summe |
| IWMA | ✅ KORREKT | Inverse Gewichtung |
| HMA | ✅ KORREKT | WMA-basiert, Standardformel |
| KAMA | ✅ KORREKT | Kaufman Adaptive, Standardformel |
| ALMA | ✅ KORREKT | Gaussian-gewichtet |
| RSI | ⚠️ ABWEICHUNG | Wir: SMA fuer alle Bars. Buch: SMA fuer ersten Block, dann Wilder-Smoothing. Numerisch minor, 300 Tests OK. Rust SOLL Wilder korrekt impl. |
| MACD | ✅ KORREKT | EMA(12)−EMA(26), Signal EMA(9) |
| Stochastic | ✅ KORREKT | Rolling min/max, %K/%D |
| ADX/DI+/DI- | ✅ KORREKT | Wilder Smoothing, Wilder Sum fuer DM |
| ATR (adx_series intern) | ✅ KORREKT | Wilder Sum |
| ATR (_atr_wilder, K's ATR-RSI) | ✅ KORREKT (Rev. 3 Fix) | Korrigiert: SMA→EWM(span=2n-1) |
| BB (bollinger_bands_raw) | ⚠️ MINOR | Wir: pstdev (population). Buch: rolling.std() (sample). Effekt <0.1% auf 20+ Bars. |
| K's Reversal I | ✅ KORREKT (Rev. 3 Fix) | War: EMA_fast-EMA_slow. Jetzt: BB(100)+MACD crossover |
| K's Reversal II | ✅ KORREKT (Rev. 3 Fix) | War: Derivat von Rev I. Jetzt: SMA(13)+21-Bar Count |
| K's ATR-RSI | ✅ KORREKT (Rev. 3 Fix) | War: RSI−atr*0.05. Jetzt: RSI(13)*ATR(5)→RSI(13) |
| K's RSI² | ✅ KORREKT (Rev. 3 Fix) | War: (RSI*RSI)/100. Jetzt: RSI(14)→RSI(5) |
| K's MARSI | ✅ KORREKT (Rev. 3 Fix) | War: (RSI+RSI²)/2. Jetzt: SMA(200)→RSI(20) |
| K's Fibonacci MA | ✅ KORREKT (Rev. 3 Fix) | War: (close+fib_anchor)/2. Jetzt: 15-Fib-EMA-Avg auf High+Low |
| Rainbow Collection (7x) | ✅ NEU (18.03) | Vollstaendig nach Buch Ch. 3. 33 Tests. |
| R-Pattern | ✅ NEU (18.03) | Vollstaendig nach Buch Ch. 7. 14 Tests. |
| Gap-Pattern | ✅ NEU (18.03) | Vollstaendig nach Buch Ch. 10. 13 Tests. |

**Rust Blueprint-Notizen (fuer Phase 20 Rust Indicator Expansion):**
- RSI: Rust soll Wilder-Warmup korrekt impl. (first avg = SMA, dann `prev*(n-1)/n + cur/n`)
- ATR: EWM span=2n-1 auf True Range = Wilder's ATR — Kand hat dies bereits korrekt
- BB: Rust kann sample std verwenden (pandas-kompatibel), oder population — dokumentieren
- K's Collection: Python-only, kein Rust-Port geplant (proprietaere Formeln)

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

## **ENTSCHEIDUNG: ADOPT — Fork-Strategie** (18.03.2026, revidiert von DEFER 12.03)

**Entscheid-Revision:**

Die drei Hauptblocker aus Rev. 2 sind aufgeloest:
1. ~~Kein PyO3~~ → `kand-py` liefert native Bindings
2. ~~Kein Incremental-API~~ → `*_inc()` API verfuegbar fuer alle Kern-Indikatoren
3. ~~Luecken: HMA, ADX, VWAP, Keltner~~ → jetzt alle in Kand enthalten (~75% Abdeckung)

**Verbleibende Einschraenkungen (angepasst):**

1. **NaN-Stripping bleibt noetig.** Kand schreibt NaN fuer Warmup, wir brauchen
   0.0-Fallback. Generischer Wrapper ~10 Zeilen — kein Blocker.

2. **Ichimoku fehlt noch.** Einzige relevante Standard-Luecke. Muss selbst impl. oder
   gewartet werden bis Kand es ergaenzt.

3. **Pre-1.0, aber Fork loest Stabilitaets-Risiko.** Als Git-Submodule in
   `_tmp_ref_review/math/kand` eingebunden. Fork-Strategie: Kand als lokales
   Cargo-Workspace-Member in `rust_core`. Upstream-Aenderungen selektiv cherry-picken.

**Strategie: Fork-Integration (Phase 20)**

```
rust_core/
  Cargo.toml       <- kand als path-dependency: "../_tmp_ref_review/math/kand"
  src/lib.rs       <- calculate_indicators_batch_impl nutzt kand::ema(), kand::rsi() etc.
  src/nan_strip.rs <- generischer NaN-zu-0.0 Adapter
```

- Schritt 1: `kand` als Cargo-Workspace-Member in rust_core einbinden
- Schritt 2: EMA/SMA/RSI/ATR/MACD durch kand-Calls ersetzen (NaN-Wrapper davor)
- Schritt 3: Fehlende Indikatoren (Ichimoku, Composite) weiterhin nativ impl.
- Schritt 4: `kand_py` als Python-Direktbinding als zweiten Pfad evaluieren

**Naechste Schritte (Phase 20):**
- `rust_core/Cargo.toml`: Kand als path-dep einbinden + NaN-Strip-Utility
- EMA, RSI, ATR, MACD, Stochastic, ADX als Kand-Wrapper migrieren
- Ichimoku nativ implementieren (kein Kand-Aequivalent)
- Kand als Reference Oracle in Tests: Correctness-Assertions gegen kand-Output

---

## 2. Offene Deltas (nach Entscheid: ADOPT)

- [ ] **RK1** Formaler Build-Nachweis (Kand lokal bauen, rust_core integration) — Phase 20
- [x] **RK2** PyO3-Fit: kand-py Bindings bestaetigt — DONE (18.03.2026)
- [x] **RK3** Incremental-API: `*_inc()` bestaetigt — DONE (18.03.2026)
- [x] **RK4** Gap-Liste aktualisiert, Python Buch-Audit abgeschlossen — DONE (18.03.2026)
- [x] **RK5** Lizenz + Maintenance-Risiko — DONE (Fork-Strategie loest Stabilitaets-Risiko)
- [x] **RK6** Entscheidung: ADOPT Fork-Strategie — DONE (18.03.2026)

---

## 3. Folgeschritte (aus RK6 ADOPT)

| Aufgabe | Owner | Phase-Slot |
|:--------|:------|:-----------|
| Kand als Cargo path-dep in rust_core einbinden | Rust Core Dev | Phase 20 |
| NaN-Strip-Utility (`src/nan_strip.rs`) | Rust Core Dev | Phase 20 |
| EMA/SMA/RSI/ATR durch kand-Calls ersetzen | Rust Core Dev | Phase 20 |
| MACD, Stochastic, ADX als kand-Wrapper | Rust Core Dev | Phase 20 |
| Ichimoku nativ implementieren (Kand-Luecke) | Rust Core Dev | Phase 20 |
| kand als Reference Oracle in Tests | QA | Phase 20 |
| RSI Wilder-Warmup korrekt (Rust) — Blueprint aus Buch-Audit | Rust Core Dev | Phase 20 |

Propagation: `compute_delta.md` G2 (Rust Signal Processor) + `INDICATOR_ARCHITECTURE.md`
Rust-Portierungsliste + `RUST_LANGUAGE_IMPLEMENTATION.md` Kand-Eintrag aktualisiert.

---

## 4. Verify-Gates

- [ ] **RK.V1** Build-/Test-Nachweis — Kand als Cargo-path-dep in rust_core (Phase 20)
- [x] **RK.V2** PyO3- und Incremental-API-Fit dokumentiert — DONE (18.03.2026)
- [x] **RK.V3** Gap-Liste + Python-Buch-Audit + finale Entscheidung — DONE (18.03.2026)

---

## 5. Evidence Requirements

- RK-ID + Datum + getesteter Commit/Release
- Build-/Test-Kommando und Ergebnis
- Mapping-Notizen fuer API/OHLCV/Bindings
- Entscheidung mit Owner und naechstem Schritt

---

## 6. Propagation Targets (nach RK6)

- [x] `docs/specs/execution/compute_delta.md` — IST-Stand-Sektion + Kand-Verweis erg.
- [x] `docs/RUST_LANGUAGE_IMPLEMENTATION.md` — Kand ADOPT Fork-Strategie + Blueprint-Notizen (18.03.2026)
- [x] `docs/INDICATOR_ARCHITECTURE.md` — Stand/Update auf 18.03, Buch-Audit-Summary, Kand ADOPT (18.03.2026)
- [x] `docs/references/projects/python-and-rust.md` — Kand-Zeile: ADOPT + Datum (18.03.2026)

---

## 7. IST-Inventar aller Indikatoren (Stand 20.03.2026)

Vollstaendige Liste aller implementierten Indikatoren in Python (`pipeline.py`) und Rust (`lib.rs`).
Basis fuer Phase-20 Kand-Migrationsplanung.

### 7a — Standard-Indikatoren (Buchformeln: Kaabar 2026)

| Indikator | Python | Rust | Formel-Status | Buch-Ref |
|:----------|:------:|:----:|:--------------|:---------|
| SMA | ✅ | ✅ | ✅ Korrekt (partial warmup = Design) | Ch. 2 |
| EMA | ✅ | ✅ | ✅ Korrekt (α=2/(n+1)) | Ch. 2 |
| SMMA | ✅ | ✅ (20.03) | ✅ Korrekt (Wilder α=1/n = EWM span=2n-1) | Ch. 2 |
| WMA | ✅ | ✅ | ✅ Korrekt | Ch. 2 |
| HMA | ✅ | ✅ | ✅ Korrekt (WMA(n/2)×2 − WMA(n) → WMA(√n)) | Ch. 2 |
| KAMA | ✅ | ✅ (20.03) | ✅ Korrekt (Kaufman Adaptive, fast=2, slow=30) | Ch. 2 |
| ALMA | ✅ | ✅ (20.03) | ✅ Korrekt (Gaussian-gewichtet, offset=0.85, sigma=6.0) | Ch. 2 |
| IWMA | ✅ | ✅ (20.03) | ✅ Korrekt (Inverse-Gewichtung) | Ch. 2 |
| OLS-MA | ✅ | ✅ (20.03) | ✅ Korrekt (lineare Regression) | — |
| RSI | ✅ (F2 20.03) | ✅ (F2 20.03) | ✅ Wilder-Warmup korrekt (SMA 1. Block, dann Wilder) | Ch. 1 |
| MACD (12/26/9) | ✅ | ✅ | ✅ Korrekt | Ch. 11 |
| Stochastic %K/%D | ✅ | ✅ | ✅ Korrekt | Ch. 5 |
| ADX / DI+ / DI- | ✅ | ✅ | ✅ Korrekt (Wilder Smoothing) | Ch. 6 |
| ATR (standalone) | ✅ `_atr_wilder` | ✅ (F1 20.03) | ✅ Wilder ATR: `ema(&tr, 2*period-1)` | Ch. 6 |
| Bollinger Bands (raw) | ✅ (F3 20.03) | — | ✅ sample-std (stdev statt pstdev) | Ch. 3 |
| BB Bandwidth | ✅ | ✅ (F3 20.03) | ✅ sample-std | Ch. 3 |
| BB %B | ✅ | ✅ (F3 20.03) | ✅ sample-std | Ch. 3 |
| EMA-Bollinger Bands | ✅ (F3 20.03) | — | ✅ sample-std (stdev statt pstdev) | Ch. 3 |
| VWAP | ✅ | ✅ (20.03) | ✅ Korrekt | Ch. 6 |
| Keltner Channels | ✅ | ✅ (20.03) | ✅ Korrekt (EMA ± ATR×mult) | Ch. 6 |
| OBV | ✅ | ✅ (20.03) | ✅ Korrekt | Ch. 6 |
| CMF | ✅ | ✅ (20.03) | ✅ Korrekt (Chaikin Money Flow) | Ch. — |
| Ichimoku | ✅ | ✅ (20.03) | ✅ Korrekt (Tenkan/Kijun/Senkou A+B/Chikou) | — |
| Slope-Helper | ✅ | — | ✅ Korrekt ((val[i]−val[i−n])/n) | Ch. 3 |

### 7b — Proprietaere Kaabar-Indikatoren

| Indikator | Python | Rust | Status | Buch-Ref |
|:----------|:------:|:----:|:-------|:---------|
| **K's Reversal I** | ✅ | — | ✅ SOTA korrigiert 18.03 (BB(100)+MACD crossover → {-1,0,1}) | Ch. 11 |
| **K's Reversal II** | ✅ | — | ✅ SOTA korrigiert 18.03 (SMA(13)+21-Bar Count → {-1,0,1}) | Ch. 11 |
| **K's ATR-RSI** | ✅ | — | ✅ SOTA korrigiert 18.03 (RSI(13)×ATR(5)→RSI(13)) | Ch. 11 |
| **K's RSI²** | ✅ | — | ✅ SOTA korrigiert 18.03 (RSI(14)→RSI(5)) | Ch. 11 |
| **K's MARSI** | ✅ | — | ✅ SOTA korrigiert 18.03 (SMA(200)→RSI(20), 0-100) | Ch. 11 |
| **K's Fibonacci MA** | ✅ | — | ✅ SOTA korrigiert 18.03 (15 Fib-EMAs auf High+Low) | Ch. 11 |
| **Rainbow Red** | ✅ | — | ✅ NEU 18.03 (EMA-BB extreme-duration reversal) | Ch. 3 |
| **Rainbow Orange** | ✅ | — | ✅ NEU 18.03 (RSI(8) crossover 35/65) | Ch. 3 |
| **Rainbow Yellow** | ✅ | — | ✅ NEU 18.03 (Slope-Divergenz SMA vs. Close) | Ch. 3 |
| **Rainbow Green** | ✅ | — | ✅ NEU 18.03 (EMA(5) vs. SMA(200) dual-cross) | Ch. 3 |
| **Rainbow Blue** | ✅ | — | ✅ NEU 18.03 (Stochastic(8,3) crossover 20/80) | Ch. 3 |
| **Rainbow Indigo** | ✅ | — | ✅ NEU 18.03 (Fibonacci-lag RSI reversal) | Ch. 3 |
| **Rainbow Violet** | ✅ | — | ✅ NEU 18.03 (HMA-Slope Richtungswechsel) | Ch. 3 |
| **R-Pattern** | ✅ | — | ✅ NEU 18.03 (4-Candle low/high + RSI-Filter) | Ch. 7 |
| **Gap-Pattern** | ✅ | — | ✅ NEU 18.03 (ATR-gefilterter Gap → contrarian) | Ch. 10 |

### 7c — Pattern-Erkennung (Phase 7/8)

| Indikator | Python | Rust | Status |
|:----------|:------:|:----:|:-------|
| Candlestick Patterns (~18 Typen) | ✅ | — | ✅ (Doji, Hammer, Engulfing, Stars, 3-Soldiers, etc.) |
| Harmonic Patterns (Gartley/Bat/Butterfly/Crab/FEIW) | ✅ | — | ✅ XABCD vollständig |
| Price Patterns (H&S, Inv. H&S) | ✅ | — | ✅ 5-Pivot, Neckline+Target |
| TD-Timing (Setup 1-9 + Countdown) | ✅ | — | ✅ TDST-Level, 13-Bar Countdown |
| Elliott Wave (R1-R6) | ✅ | — | ✅ Konfidenz-scoring |
| Fibonacci Levels (Swing-basiert) | ✅ | — | ✅ 9 Ratios (0.236–2.618) |
| Fibonacci Confluence | ✅ | — | ✅ Multi-Swing Cluster |
| Swing Point Detector | ✅ | — | ✅ |

### 7d — Proprietaere Engine-Funktionen

| Funktion | Python | Rust | Status |
|:---------|:------:|:----:|:-------|
| Composite Signal (Line/Power/Rhythm) | ✅ | — | ✅ |
| Composite SMA50-Slope-Norm | ✅ | ✅ | ✅ |
| Heartbeat Score | ✅ | ✅ | ✅ |
| Chart Transforms (Heikin-Ashi, K-Candles, Volume, CARSI) | ✅ | — | ✅ |
| Bollinger-Keltner Squeeze | ✅ | — | ✅ |
| ATR-RSI (Standalone-Endpoint) | ✅ | — | ✅ |
| Bollinger on RSI | ✅ | — | ✅ |
| Strategy Evaluation / Backtest | ✅ | — | ✅ |

### 7e — Quantitatives Analytics (Phase 13/15)

| Funktion | Python | Rust | Status |
|:---------|:------:|:----:|:-------|
| Volatility Suite (HV, relative Regime) | ✅ | — | ✅ |
| Regime Detection (3-tier) | ✅ | — | ✅ |
| Markov Regime | ✅ | — | ✅ |
| HMM Regime | ✅ | — | ✅ (hmmlearn, skip wenn nicht installiert) |
| Alternative Bars (Time/Tick/Volume/Dollar) | ✅ | — | ✅ |
| CUSUM Filter | ✅ | — | ✅ |
| Hurst Exponent | ✅ | — | ✅ |
| Mean-Reversion / Momentum | ✅ | — | ✅ |
| Performance Metrics (Sharpe, Sortino, MDD) | ✅ | — | ✅ |
| Signal Quality Chain | ✅ | — | ✅ |
| Order Flow State / VPIN | ✅ | — | ✅ |
| Triple Barrier Labels | ✅ | — | ✅ (Lopez de Prado) |
| Walk-Forward Validation | ✅ | — | ✅ |
| Deflated Sharpe Ratio | ✅ | — | ✅ |
| Feature Engineering (ML) | ✅ | — | ✅ |
| ML Signal Classifier | ✅ | — | ✅ |
| Hybrid Fusion (TA+ML) | ✅ | — | ✅ |
| Bias Monitoring | ✅ | — | ✅ |
| Dark Pool Signal | ✅ | — | ✅ |
| GEX Profile | ✅ | — | ✅ |
| Expected Move | ✅ | — | ✅ |
| Options Payoff Calculator | ✅ | — | ✅ |
| DeFi Stress Test | ✅ | — | ✅ |
| Oracle Crosscheck | ✅ | — | ✅ |

### 7f — Kritische Rust-Luecken / Offene Fixes

| # | Problem | Status (20.03) | Fix |
|:--|:--------|:---------------|:----|
| **F1** | ATR in Rust: `sma(&tr, period)` statt Wilder | ✅ DONE | `ema(&tr, period * 2 - 1)` in `lib.rs` |
| **F2** | RSI in Rust + Python: SMA statt Wilder-Warmup | ✅ DONE | Wilder-Warmup in beiden impl. (SMA 1. Block, dann `prev*(p-1)/p + cur/p`) |
| **F3** | BB std: population statt sample | ✅ DONE | `sample_std` (Rust), `stdev` statt `pstdev` (Python) |
| **F4** | SMMA, KAMA, ALMA, IWMA, OLS, Ichimoku fehlen in Rust | ✅ DONE | Alle 6 nativ in `lib.rs` + Batch-Dispatch |
| **F5** | VWAP, Keltner, OBV, CMF fehlen in Rust | ✅ DONE | Alle 4 nativ in `lib.rs` + Batch-Dispatch |
| **F6** | Alle Kaabar-proprietaeren Indikatoren | — SKIP | Python-only by design |

> **Build-Verify (F1-F5):** `cargo build` erfolgreich (20.03). Python-Tests ausstehend (Wilder-RSI + sample-std aendern Testwerte).

---

## 8. Category Module Architecture & Migration (NEU Rev. 4, 20.03.2026)

### 8a — Architektur-Entscheid

**SOTA-Research (20.03.2026):** Monolith, 1-File-per-Indicator, und Category Modules evaluiert
gegen kand-Referenz, pandas-ta, ta-rs, talipp und Gemini-Empfehlung.

**Konsens aller Quellen:**
- **Category Modules** = SOTA fuer unsere Groesse (~20 Rust, ~85 Python Funktionen)
- **KEIN `trait Indicator`** — Multi-Output-Indikatoren (MACD/BB/ADX/Ichimoku → 2-5 Serien) passen nicht. kand nutzt bewusst free functions.
- **KEINE Registry in Python** — direkte Aufrufe sind typsicher und tracebar bei <100 Funktionen
- **Kein 1-File-per-Indicator** — erst ab ~50+ pro Kategorie sinnvoll (kand hat 57 pro Subkategorie)

### 8b — Rust Category Modules (Skelett angelegt 20.03)

```
rust_core/src/indicators/
  mod.rs            ← pub use re-exports
  trend.rs          ← sma, ema, wma, hma, smma, kama, alma, iwma, ols_ma (~300 LOC)
  oscillators.rs    ← rsi, macd, stochastic, adx, wilder_sum/avg (~250 LOC)
  volatility.rs     ← atr, sample_std, bb_bandwidth, bb_percent_b, keltner (~200 LOC)
  volume.rs         ← vwap, obv, cmf (~100 LOC)
  ichimoku.rs       ← ichimoku_series (5-Tuple, ~50 LOC)
  composite.rs      ← heartbeat, sma50_slope_norm (~100 LOC)
```

Status: Skelett-Files mit Docstrings angelegt. `mod indicators` noch NICHT in `lib.rs` eingebunden.
Migration: Funktionen werden einzeln aus `lib.rs` in Kategorie-Files verschoben.
`lib.rs` behaelt nur PyO3-Exports + Batch-Dispatch.

### 8c — Python Category Modules (Skelett angelegt 20.03)

```
indicator_engine/
  models.py         ← Pydantic Request/Response Typen (~350 LOC, zero Risiko)
  helpers.py        ← clamp, closes/highs/lows/volumes, slope, ohlcv_polars_frame
  trend.py          ← sma, ema, wma, hma, smma, kama, alma, iwma, ols_ma, ichimoku, exotic_ma
  oscillators.py    ← rsi, macd, stochastic, adx, K's Collection, composite_signal
  volatility.py     ← BB (raw+EMA), ATR, Keltner, Squeeze, Regime Detection (3-tier+Markov+HMM)
  volume.py         ← vwap, obv, cmf
  patterns.py       ← Elliott, Harmonic, Candlestick, TD-Timing, Price, Fibonacci, Swing Detect
  rainbow.py        ← Rainbow Collection (7 Farben), R-Pattern, Gap-Pattern (Kaabar proprietary)
  quant.py          ← build_features, classify_signal, fuse_hybrid, monitor_bias,
                       eval_baseline, eval_indicator, signal_quality_chain, deflated_sharpe,
                       alt_bars, CUSUM, Hurst, mean_rev_momentum, perf_metrics, order_flow
  backtest.py       ← run_backtest, triple_barrier, walk_forward, parameter_sensitivity
  portfolio.py      ← strategy_metrics, chart_transform
  derivatives.py    ← options_payoff, defi_stress, oracle_crosscheck, dark_pool, gex, expected_move
```

**Status: Phase A ABGESCHLOSSEN (20.03.2026)**
- pipeline.py (3969 Zeilen, 103 top-level defs) → alle 10 Module vollstaendig extrahiert
- pipeline.py NICHT modifiziert — bleibt als working monolith (Re-Export-Shim)
- Completeness-Review: 0 fehlende Funktionen (systematischer grep-Abgleich)
- `_triple_barrier_labels` bewusst dupliziert in quant.py + backtest.py (Phase B deduplizieren)
- Circular-Dep-Strategie: lazy imports innerhalb von Funktionsbodies
- `detect_swings` + `detect_close_turning_pivots` in helpers.py (shared von oscillators + patterns)

**models.py SOTA Enhancements (20.03.2026):**
- `slots=True` auf Leaf-Modelle (OHLCVPoint, IndicatorPoint, PatternData, SwingPoint, FibonacciLevel) — 20-40% Memory bei Listen
- `frozen=True` auf alle Response-Modelle (immutable DTOs)
- `Annotated` Type-Aliase: Period, ShortPeriod, Confidence, StdMultiplier, PositiveFloat (DRY)
- `model_validator`: OHLCVPoint (high≥low), MACDRequest (fast<slow), GEXProfileRequest (list-parity)
- Literal-Typen fuer closed enums: VolatilityRegime, MarketRegime, BarrierLabel, SignalLabel, StressLevel
- **Offen:** `from_attributes=True` als Option vormerken fuer Arrow/redb/Polars-Integration (Phase 20+ Data Layer)
- **Offen:** `model_construct` fuer Hot-Path Output-Listen (IndicatorPoint ×5000 pro Request, 3-5x Speedup)

**Hinweis "ML"-Funktionen:** `build_features`, `classify_signal`, `fuse_hybrid`, `monitor_bias` sind
KEINE echten ML-Funktionen (keine trainierten Modelle, kein sklearn/torch). Reine Heuristiken mit
hardcoded Gewichten. Gehoeren in `quant.py`, nicht in python-agent oder separaten ML-Service.
Echtes ML (trainierte Modelle, Inferenz) lebt in `python-backend/ml_ai/`.

### 8e — Modul-Architektur-Entscheidungen (20.03.2026)

**backtest.py — bleibt in indicator_engine/**
Ist KEIN eigenstaendiger Backtester. Ist Eval-Hilfswerkzeug fuer `evaluate_indicator()` in quant.py.
Simpelster SMA-Crossover + Triple Barrier + Walk-Forward + Parameter Sensitivity.
GCT hat den echten Exchange-Backtester (Orderbook, Fees, Multi-Exchange, Order-Typen).
Wandert als Einheit mit quant.py nach Rust (Phase E), nicht nach Go Gateway.

**quant.py — bleibt in indicator_engine/, mixt zwei Dinge**
1. Eval-Pipeline (triple barrier, walk-forward, deflated sharpe, performance metrics,
   signal quality chain, order flow state) → bleibt dauerhaft, Indikator-Bewertungs-Infrastruktur
2. Pseudo-ML Platzhalter (build_features, classify_signal, fuse_hybrid, monitor_bias) →
   hardcoded Heuristiken (sigmoid, gewichtete Scores) → Phase F durch echtes ML aus ml_ai/ ersetzen

**derivatives.py — bleibt in indicator_engine/**
Pure Math, keine Deps, standalone Rechner (GEX, Options Payoff, Expected Move, DeFi Stress,
Oracle Crosscheck, Dark Pool Signal). Guter Rust-Kandidat Phase C (profitiert bei grossen Strike-Grids).

**portfolio.py — wahrscheinlich loeschen**
Aktuell leer (Platzhalter). `portfolio_analytics.py` existiert bereits separat in python-backend/.
Portfolio-Optimierung (Monte Carlo, Kelly, Mean-Variance) ist ML-Territorium → gehoert in ml_ai/,
nicht indicator_engine/. Phase B: pruefen ob Kaabar Portfolio-Metriken behandelt (dann ggf. behalten).
`build_strategy_metrics` und `apply_chart_transform` sind in patterns.py platziert (korrekt).

**Rust-Prioritaeten (Phase C):**

| Prio | Module | Begruendung |
|:-----|:-------|:------------|
| P1 | trend, oscillators, volatility, volume | Hot-Path Indikatoren, tick-frequent |
| P2 | derivatives | Standalone pure math, Strike-Grid Performance |
| P3 | patterns (teilweise) | Elliott/Harmonic komplex, Fibonacci einfach |
| P4 | backtest + quant eval-chain | Als Einheit, wenn P1-P3 schon Rust |
| — | rainbow | Python-only permanent (Kaabar-proprietaer) |
| — | quant pseudo-ML | Phase F → ml_ai/ (echtes ML) |

---

### 8d — End-to-End Migrationsphasen

```
Phase A:  Python pipeline.py → Category Modules verteilen
          pipeline.py bleibt als Re-Export-Shim bis alles migriert
          Monolith → python-backend/archive/ (nicht loeschen)

Phase B:  Jeden Python-Indikator einzeln gegen Buch (Kaabar 2026) verifizieren
          Kontext drum herum lesen, nicht nur Formel
          Systematisch, Indikator fuer Indikator

Phase C:  Rust indicators/ mit kand-Blueprints aufbauen
          - KandError statt &'static str
          - lookback() + batch() + *_inc() pro Indikator
          - NaN-Fill fuer Warmup, feature-gated validation
          Jede Rust-Funktion gegen verifizierte Python-Version testen

Phase D:  PyO3-Bridge erweitern (rust_bridge.py → neue Rust-Module)
          Python-Fallback bleibt bis Rust-Paritaet bestaetigt
          Python vs Rust Hot-Path Performance-Testing

          **Python-Lib-Optimierung (falls Funktionen in Python verbleiben):**
          Aktuell nutzen alle Category Modules nur stdlib (math, statistics)
          und Python for-Loops. Falls Indikatoren dauerhaft in Python bleiben
          (Kaabar-proprietaer, Nischen-Features), diese Libs gezielt einsetzen:

          | Lib | Wo einsetzen | Beispiel |
          |:----|:-------------|:---------|
          | pandas | Rolling/EWM Berechnungen | `rolling(n).mean()`, `ewm(span=2*n-1, adjust=False).mean()` (Wilder), `rolling(n).std(ddof=1)` (sample-std) — C-optimiert, 10-100x vs manuelle Loops |
          | numpy | Vectorized Array-Ops | `np.cumsum` (VWAP), `np.maximum.accumulate` (Swing Detection), `np.where` (Signal-Vektoren) — eliminiert Python for-Loops |
          | scipy | Statistische Verteilungen | `scipy.stats.norm.cdf` (Deflated Sharpe — korrekte CDF statt Approximation), `scipy.stats.t` (Konfidenzintervalle) |
          | polars | Bereits optional in helpers.py | `ohlcv_polars_frame()` — nur wenn Polars sowieso geladen (Geo-Soft-Signals). Kein Vorteil ueber pandas fuer Indikatoren. |
          | sklearn | NUR wenn echtes ML | Aktuell NICHT in indicator_engine (quant.py Pseudo-ML = Heuristiken). Erst relevant wenn Phase F echtes ML aus ml_ai/ integriert. |

          Entscheidungsregel: Keine Wholesale-Migration. Nur einsetzen wenn
          (a) es einen Bug fixt (rolling().std(ddof=1) = korrekte sample-std)
          oder (b) die Funktion dauerhaft Python bleibt (kein Rust-Port geplant).

Phase E:  Rust Tonic gRPC Service (standalone Binary)
          Go → gRPC (Protobuf) → Rust direkt
          Python raus aus Hot-Path (Communication Channel Bottleneck)
          Auch mit 3.13t nogil: GC-Pauses bei Tick-by-Tick auf 30+ Symbolen

Phase F:  Python-Monolithen → archive/
          Python bleibt nur fuer: ML-Inferenz (ml_ai/), Training, Notebooks
          Kaabar-proprietaere Indikatoren: Entscheid ob Rust-Port oder Python-only
```

**Kernmotivation Phase E:** Nicht nur Compute-Speed sondern Communication Channel.
Go→HTTP→FastAPI→uvicorn→GIL→Antwort→Go (5 Hops, Serialisierung, GC)
vs. Go→gRPC→Rust (1 Hop, binary Protobuf, zero-GC).

---

## 9. Exit Criteria

- [x] `RK2-RK6` entschieden
- [x] `Kand` ADOPT Fork-Strategie verankert (18.03.2026)
- [x] Python Buch-Audit abgeschlossen, alle Formeln SOTA (18.03.2026)
- [x] IST-Inventar Python + Rust vollständig (20.03.2026) — Sektion 7
- [x] Rust-Root-Doku (INDICATOR_ARCH + RUST_LANG_IMPL) konsistent (18.03.2026)
- [x] F1-F5 Rust-Fixes implementiert (20.03.2026) — ATR/RSI/BB/10 neue Indikatoren
- [x] Category Module Skelett-Struktur angelegt (Rust + Python, 20.03.2026) — Sektion 8
- [x] Phase A: Python Monolith → Category Modules verteilen — **DONE 20.03.2026** (103 defs, 10 Module, 0 Luecken)
- [x] Phase B: Buch-Verifizierung Indikator-fuer-Indikator — **AUDIT DONE 20.03.2026**, Fixes ausstehend
      Alle 12 Kapitel auditiert → `docs/KAABAR_BOOK_AUDIT.md`
      Ergebnis: 7 Bugs, 5 fehlende Validierungen, 6+ fehlende High-Prio Features, 3 Buch-Bugs erkannt
      Portfolio-Pruefung: Kaabar behandelt KEINE Portfolio-Metriken → portfolio.py bleibt leer/loeschbar
      Naechster Schritt: Batch-Fix aller identifizierten Bugs und Features
      Kaabar GitHub-Repo (Buchcode-Referenz fuer Batch-Fix):
        https://github.com/sofienkaabar/mastering-financial-markets-in-python
        (`master_library.py` = alle Buchfunktionen, OHLC-Testdaten, Kapitel-Skripte)
        ACHTUNG: 3 Buch-Bugs erkannt (fib_tolerance=3, Reversal II Copy-Paste, RSI² Lookback) — nicht blind uebernehmen, gegen Primaerquellen (Carney, DeMark, Wilder) verifizieren
      Erledigte Teilpunkte (20.03.2026):
      - [x] `generate_test_ohlcv()` als pytest Fixture: `python-compute/tests/conftest.py` (Kaabar Ch.2, seed-deterministisch, Volume, 5 Fixtures, 8 Smoke-Tests PASSED)
      - [x] `python-compute/tests_old/` — alte Pipeline-Tests umbenannt (testen gegen pipeline.py Monolith, nicht Category Modules)
      - [x] venv rebuilt: Python 3.13.1 (alte venv verwies auf geloeschtes C:\Python312)
      Offene Teilpunkte:
      - [ ] **Import-Audit Category Modules**: Extrahierte Module (quant.py, volatility.py, backtest.py, derivatives.py etc.) muessen geprueft werden ob alle Third-Party-Imports vorhanden sind. pipeline.py nutzte `scipy.stats` (deflated_sharpe), `hmmlearn` (HMM regime), `hdbscan`, `scikit-learn` — die Category Modules haben teilweise lazy imports (volatility.py: hmmlearn), teilweise fehlen sie noch. Systematisch: jede Funktion die in pipeline.py scipy/sklearn/hmmlearn nutzte muss in ihrem neuen Modul den gleichen Import haben.
      - [ ] `grpclib` als optional-dep in Root-pyproject.toml ergaenzen (fehlte, genutzt in `ipc_servicer_async.py` fuer Python 3.13t/nogil)
      Referenz-Docs erstellt (alle 20.03.2026):
      - `docs/KAABAR_BOOK_AUDIT.md` — Hauptaudit (alle 12 Kapitel + Conclusion/Swarming/Primaerquellen + Hinweise fuer Batch-Fix Phase inkl. GitHub-Repo-Link + generate_test_ohlcv Todo)
      - `docs/KAABAR_CH2_PYTHON_REFERENCE.md` — Ch.2 Python-Stack, Dependencies, Kapitel-Ueberblick (eval: generate_test_ohlcv JA, import_data NEIN, ohlc_plot EVALUIEREN)
      - `docs/BACKTESTING_ARCHITECTURE.md` — 3-Schichten-Backtester (GCT Exchange / Signal-Evaluator / Gateway Manager), Datenquellen-Mapping (Kaabar→Go), GCT-Bruecke, Python→Rust Zuordnung
- [ ] Phase C-F: Rust kand-Blueprints → Tonic gRPC (Phase 20+)
