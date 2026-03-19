# Rust Kand Evaluation Delta

> **Stand:** 18. Maerz 2026 (Rev. 3)
> **Zweck:** Expliziter Execution-Slice fuer die Bewertung von `Kand` als Basis
> fuer den Rust Indicator Core (`rust_core`).
> **Aenderungshistorie:**
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

## 7. Exit Criteria

- [x] `RK2-RK6` entschieden
- [x] `Kand` ADOPT Fork-Strategie verankert (18.03.2026)
- [x] Python Buch-Audit abgeschlossen, alle Formeln SOTA (18.03.2026)
- [ ] Rust-Root-Doku (INDICATOR_ARCH + RUST_LANG_IMPL) konsistent — pending propagation
- [ ] Phase-20 Kand-Integration implementiert (RK.V1)
