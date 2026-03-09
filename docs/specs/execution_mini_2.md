# Execution Mini-Plan 2: Buch-Nähe, Compute-Split & Indikator-Erweiterung

> **Stand:** 06 Mär 2026 (Rev. 2)
> **Zweck:** Plan für maximale Nähe zu Kaabar (Mastering Financial Markets with Python 2026) und Deep Learning with Rust (Maleki 2026), plus aktualisiertes Zielbild für Go/Python/Rust-Verantwortlichkeiten, Rust-Übernahme schwerer Compute-Pfade und die geplante Indikator-Erweiterung. Buchbezüge mit Zeilenangaben für spätere Agent-Arbeit.
> **Referenzen:** [`INDICATOR_ARCHITECTURE.md`](../INDICATOR_ARCHITECTURE.md), [`RUST_LANGUAGE_IMPLEMENTATION.md`](../RUST_LANGUAGE_IMPLEMENTATION.md), [`execution_mini_plan.md`](./execution_mini_plan.md), [`execution_mini_plan_3.md`](./execution_mini_plan_3.md), [`../Master_master_architecture_2026_IMPORTANT.md`](../Master_master_architecture_2026_IMPORTANT.md)

---

## 1. Gesamtplan

| Phase | Ziel | Priorität |
|-------|------|-----------|
| **A** | Python: Swing Detection + Exotic MAs buchnah | HOCH |
| **B** | Python: Fehlende Indikatoren (CARSI, HMA, SWV, etc.) | MITTEL |
| **C** | Rust: Crate-Struktur + Rayon + Concurrency | HOCH |
| **D** | Rust: Indikator-Portierung (KAMA, ALMA, HMA, Stochastic) | MITTEL |
| **E** | Go/Python/Rust Zielbild + Compute-Split + Service-Grenzen | HOCH |
| **F** | Indikator-Erweiterung (geplant) | MITTEL |

---

## 2. Ist-Zustand

### 2.1 Python (indicator-service, pipeline.py)

| Komponente | Status | Datei |
|------------|--------|-------|
| KAMA | ✅ Implementiert | `pipeline.py` L365–381 |
| ALMA | ✅ Implementiert | `pipeline.py` L344–363 |
| IWMA | ✅ Implementiert | `pipeline.py` L324–341 |
| OLS MA | ✅ Implementiert | `pipeline.py` L303–321 |
| SMA, EMA, SMMA | ✅ Implementiert | `pipeline.py` L270–300 |
| RSI | ✅ Implementiert | `pipeline.py` L384–400 |
| ATR-adjusted RSI | ✅ Implementiert | `pipeline.py` L1734–1756 |
| Bollinger-on-RSI | ✅ Implementiert | `pipeline.py` |
| BB Bandwidth, %B, Squeeze | ✅ Implementiert | `pipeline.py` |
| Harmonic (Gartley, Bat, Butterfly, Crab, FEIW) | ✅ Implementiert | `pipeline.py` L894–1000 |
| Fibonacci Levels + Confluence | ✅ Implementiert | `pipeline.py` |
| Candlestick (Doji, Extreme Euphoria, …) | ✅ Teilweise | `pipeline.py` L706–891 |
| Heikin-Ashi, K's Candles, Volume Candles | ✅ Implementiert | `pipeline.py` |
| K's Collection | ✅ Implementiert | `pipeline.py` L673–711 |
| **Swing Detection** | ⚠️ Abweichend | `pipeline.py` L430–489 |
| **HMA** | ❌ Fehlt | — |
| **CARSI** | ❌ Fehlt | — |
| **SWV** | ❌ Fehlt | — |
| **Rainbow Collection** | ❌ Fehlt | — |

### 2.2 Rust (rust_core)

| Komponente | Status | Datei |
|------------|--------|-------|
| SMA, EMA | ✅ | `rust_core/src/lib.rs` |
| RSI | ✅ | `rust_core/src/lib.rs` |
| ATR | ✅ | `rust_core/src/lib.rs` |
| BB Bandwidth, %B | ✅ | `rust_core/src/lib.rs` |
| RVOL | ✅ | `rust_core/src/lib.rs` |
| composite_sma50_slope_norm | ✅ | `rust_core/src/lib.rs` |
| calculate_heartbeat | ✅ | `rust_core/src/lib.rs` |
| calculate_indicators_batch | ✅ | `rust_core/src/lib.rs` |
| redb OHLCV Cache | ✅ | `rust_core/src/ohlcv_cache.rs` |
| **HMA, KAMA, ALMA** | ❌ Fehlt | — |
| **Stochastic** | ❌ Fehlt | — |
| **Rayon** | ❌ Fehlt | — |
| **Crate-Struktur** (indicators/, patterns/) | ❌ Alles in lib.rs | — |
| **Concurrency** (Threads, Barrier) | ❌ Fehlt | — |

### 2.3 Buch-Referenzen

| Buch | Datei | Zeilen |
|------|-------|--------|
| Mastering Financial Markets with Python | `docs/books/mastering-finance-python.md` | 6469 |
| Deep Learning with Rust | `docs/books/deeplearning-with-rust.md` | ~7580 |
| Advanced in Financial Markets ML | `docs/books/advanced-in-financial-markets-ml.md` | — |
| Quantitative Trading | `docs/books/quantitative-trading.md` | — |

---

## 3. Nötige Annäherung (Python, Kaabar)

### 3.1 Swing Detection (KRITISCH)

| Aspekt | Buch | Ist | Aktion |
|--------|------|-----|--------|
| **Buch-Referenz** | `mastering-finance-python.md` **L3319–3399, L3370** | — | — |
| **Methode** | `rolling(window=swing_lookback, min_periods=1, center=True).min()/max()` auf `low`/`high` | Lokale Extrema: `center == max/min` in symmetrischem Fenster | **Option A:** Buch-Logik portieren (rolling min/max). **Option B:** Default `window=20` setzen, `detect_swings`-Parameter dokumentieren |
| **Default Lookback** | `swing_lookback=20` | `window=3` | Default auf 20 ändern oder API-Parameter `swing_lookback` hinzufügen |
| **Output** | DataFrame mit `swing_low`/`swing_high` (NaN wo kein Swing) | Liste von `Pivot`-Objekten | Pivot-Format beibehalten; Logik buchnah |

**Implementierungshinweis:** Buch-Code L3370–3376:
```python
my_time_series['swing_low'] = my_time_series['low'].rolling(window=swing_lookback, min_periods=1, center=True).min()
my_time_series['swing_low'] = my_time_series.apply(lambda row: row['low'] if row['low'] == row['swing_low'] else 0, axis=1)
my_time_series['swing_low'] = my_time_series['swing_low'].replace(0, np.nan)
# analog für swing_high
```

### 3.2 HMA (Hull Moving Average)

| Aspekt | Buch | Ist | Aktion |
|--------|------|-----|--------|
| **Buch-Referenz** | `mastering-finance-python.md` **L1755–1794** | — | — |
| **Formel** | `WMA(2*WMA(n/2) - WMA(n), sqrt(n))` | Nur in TS | In Python `pipeline.py` ergänzen, in `exotic-ma` Endpoint aufnehmen |

### 3.3 CARSI (Candlestick RSI)

| Aspekt | Buch | Ist | Aktion |
|--------|------|-----|--------|
| **Buch-Referenz** | `mastering-finance-python.md` **L3129–3160** (Ch.4), **L4178–4314** (Ch.7) | — | — |
| **Beschreibung** | RSI-Werte als Kerzen dargestellt; Pattern Recognition auf RSI-Candlesticks | Fehlt | Chart-Transform `carsi` + CARSI-Patterns in Candlestick |

### 3.4 Harmonics Toleranz

| Aspekt | Buch | Ist | Aktion |
|--------|------|-----|--------|
| **Buch-Referenz** | `mastering-finance-python.md` **L4342–4754** | — | — |
| **Toleranz** | Nicht explizit | `tol=0.05` (5 %) | Buch prüfen; ggf. reduzieren |

---

## 4. Nötige Annäherung (Rust, RUST.md + Deep Learning with Rust)

### 4.1 Crate-Struktur

| Aspekt | RUST_LANGUAGE_IMPLEMENTATION.md | Ist | Aktion |
|--------|----------------------------------|-----|--------|
| **Referenz** | Sektion 2, Zeilen 149–191 | — | — |
| **Ziel** | `indicators/`, `patterns/`, `strategy/`, `cache/` | Alles in `lib.rs` | Module auslagern |

### 4.2 Rayon (Data-Parallelism)

| Aspekt | Buch | Ist | Aktion |
|--------|------|-----|--------|
| **Buch-Referenz** | `deeplearning-with-rust.md` **Kap. 4.5, L3230–3310** | — | — |
| **RUST-Referenz** | RUST_LANGUAGE_IMPLEMENTATION.md **DL-2, L1222–1253** | — | — |
| **Pattern** | `indicators.par_iter().map(...).collect()` | Sequentiell | `calculate_indicators_batch` mit `rayon::par_iter` |

### 4.3 Concurrency (Producer-Consumer, Barrier)

| Aspekt | Buch | Ist | Aktion |
|--------|------|-----|--------|
| **Buch-Referenz** | `deeplearning-with-rust.md` **Kap. 6, L4209–4620** (DL-1) | — | — |
| **RUST-Referenz** | RUST_LANGUAGE_IMPLEMENTATION.md **DL-1, L1179–1220** | — | — |
| **Pattern** | `mpsc::channel`, `Arc<Barrier>`, `thread::spawn` | — | Composite Signal: Elliott, Harmonic, Fibonacci, Candlestick parallel berechnen |

### 4.4 Kand/VectorTA Evaluierung

| Aspekt | RUST_LANGUAGE_IMPLEMENTATION.md | Ist | Aktion |
|--------|----------------------------------|-----|--------|
| **Referenz** | Sektion 3, L195–224 | — | — |
| **Ziel** | Kand als Basis für SMA, EMA, RSI, MACD, VWAP, OBV | Eigenimplementierung | Kand evaluieren; fehlende Indikatoren (HMA, KAMA, ALMA) identifizieren |

### 4.5 Rust-Indikatoren (Portierung aus Buch)

| Indikator | Buch (Kaabar) | RUST | Aktion |
|-----------|---------------|------|--------|
| HMA | L1755–1794 | Fehlt | In Rust portieren |
| KAMA | L1795–1869 | Fehlt | In Rust portieren |
| ALMA | L1870–1965 | Fehlt | In Rust portieren |
| Stochastic | L5986–5993 (Ch.12) | Fehlt | In Rust portieren |

---

## 5. Zielbild 2026: Go, Python, Rust

### 5.1 Arbeitsformel und Ownership

Dieses Dokument übernimmt den Compute-/Service-Schnitt jetzt als führende Leitlinie für Indikator-, Pattern-, Portfolio- und Simulationsarbeit.

**Arbeitsformel (übernommen aus Master-Master):**
- **Go transportiert, schützt, ordnet.**
- **Python modelliert, plant, verifiziert, simuliert.**
- **Rust beschleunigt punktuell.**

| Schicht | Primäre Verantwortung | Gehört ausdrücklich **nicht** primär hierhin |
|---------|------------------------|----------------------------------------------|
| **Go Gateway** | Contracts, Provider-Routing, Auth/Policy, Streaming, NATS-Publish, Request-Korrelation, sync/async Orchestration | Mathematisch breite Indikator-Library, ML-Inferenz, Forschungs-Notebooks |
| **Python Services** | Agentik, Retrieval, ML, Regime Detection, Forschungs-/Referenzimplementierungen, Simulation-Logik, Game-/Control-Theory-Modellierung | Hot-Path Tick-Compute als Intermediär zwischen Go und Rust |
| **Rust Core / Rust Service** | Indikator-Kernels, Monte-Carlo-Kernels, Pattern-/Signal-Kernels, ODE-/Rollout-Beschleunigung, dichte numerische Loops | Frontdoor-HTTP, Policy, breit veränderliche Forschungslogik |

### 5.2 Übernommene Gemini-Leitlinie (aus `execution_mini_plan_3.md`)

Die frühere Gemini-Sektion aus `execution_mini_plan_3.md` wird inhaltlich hierher verschoben. Sie ist keine reine Infra-Frage, sondern die **führende Compute- und Sprachgrenzen-Entscheidung**.

**Zielbild:**

```text
Exchange WebSocket/REST
        ↓
  Go Gateway (Orchestrator / Contracts / Routing)
        ↓
  Rust Signal Processor
  - Indikatoren
  - Monte Carlo / Rollouts
  - schwere Pattern Detection
        ↓
  Python ML / Agent / Simulation Layer
  - Regime / ML / LLM / Research
  - konsumiert Features statt Raw Ticks
        ↓
  Next.js / UI
```

**Damit wird eliminiert:**
- Python als synchroner Intermediär im Hot-Path
- Go→Python→Rust als Standardkette für schwere Compute-Arbeit
- PyO3 als primäre Produktionsgrenze zwischen Go und Rust

**Damit bleibt ausdrücklich erhalten:**
- Python als Referenz- und Forschungsoberfläche für Buch-Nähe
- Python als ML-/Agent-/Simulationsschicht
- PyO3 als Fallback, Test-Utility und lokale Entwicklungsbrücke

### 5.3 Service-Split und Migrationsmatrix

| Service / Modul | Kurzfristige Rolle | Mittelfristige Richtung |
|-----------------|--------------------|-------------------------|
| **`indicator-service`** | Python-Referenzschicht für Buch-Nähe, Feature-/API-Experimente, einige bestehende Quant-Endpunkte | In Research-/Reference-Layer und Rust-backed Produktionspfade aufspalten; schwere/stabile Kerne nach Rust |
| **`rust_core` / künftiger Rust Signal Processor** | lokale Beschleunigung via PyO3 | eigenständiger Service oder klarer Compute-Layer für Indikatoren, Monte Carlo, Pattern Detection |
| **`finance-bridge`** | Datenadapter mit Python-Komfort (`yfinance`, Polars, Cache) | mittelfristig stärker Richtung Go-/Connector-Schicht ziehen; kein Kern der Intelligence Plane |
| **`agent-service`** | Python-first | bleibt Python; LangGraph/LLM/Tool-Orchestration lebt hier |
| **`memory-service`** | Python-first | bleibt Python; semantische/KG/vector-nahe Arbeit gehört hierhin |
| **`geopolitical-soft-signals`** | Python-Modellierung plus heuristische Quant-Teile | Modellierungslogik bleibt Python; numerische innere Loops/MC/ODE später selektiv nach Rust |

### 5.4 Buch-Strategie: Python als Referenz, Rust als Produktionskernel

Die Python-Finance-Bücher bleiben wichtig, aber nicht als Argument für eine Python-Only-Produktionsschicht.

**Arbeitsregel:**
- Buchformeln zuerst in Python buchnah oder testbar nachvollziehbar implementieren
- Python-Version als Referenz, Oracle und schnelles Forschungsmedium behalten
- stabile, häufig genutzte, CPU-lastige Kerne danach nach Rust portieren

**Besonders relevant für Portierung nach Rust:**
- HMA, KAMA, ALMA, Stochastic
- größere Indikator-Suites
- Monte Carlo / VaR / Rollouts
- Composite- und Pattern-Detection mit hoher Parallelität

### 5.5 Externe Quant-Stacks: Einordnung

| Stack | Empfehlung | Warum |
|-------|------------|-------|
| **QuantLib** | **Beobachten + selektiv als Referenz nutzen** | gut für Pricing-/Risk-Validierung, aber kein Ziel-Stack für Gateway/Agent/Streaming |
| **ORE** | **Nur beobachten, aktuell nicht übernehmen** | stark für institutionelle Risk-/XVA-Workloads, für den aktuellen Produktkern zu schwer |
| **FINOS / Legend** | **Beobachten für Datenmodellierung/Governance** | interessant für Semantik, Lineage, Modellierung; kein Ersatz für Go/Python/Rust-Service-Schnitt |

**Konsequenz:** Erst den eigenen Go/Python/Rust-Schnitt sauber machen. Externe Großframeworks nur dann aktiv adoptieren, wenn ein klarer fachlicher Pull entsteht.

### 5.6 Übernommene Checkpoints / Verify Gates

- [ ] **G1** — Go→Rust direkte Produktionsgrenze definieren; Python nicht mehr Default-Intermediär für Hot-Path-Compute
- [ ] **G2** — Rust Signal Processor als eigenständiger Service oder klarer Compute-Layer benannt und eingeplant
- [ ] **G3** — `indicator-service` trennt Referenz-/Research-Pfade von produktionsreifer Heavy-Compute-Arbeit
- [ ] **G4** — Python bleibt Owner für ML, Agentik, Regime Detection, Retrieval und Simulationslogik
- [ ] **G5** — PyO3 bleibt Fallback/Test-Utility, nicht Haupt-Bridge
- [ ] **G6** — Monte-Carlo-Review abgeschlossen: welche Pfade in NumPy/Polars bleiben dürfen, welche nach Rust müssen
- [ ] **G7** — `finance-bridge` Rolle entschieden: temporärer Python-Adapter vs. spätere Go-Connector-Übernahme

---

## 6. Indikator-Erweiterung (geplant)

> Alle Einträge mit Buch-Zeilenangaben für spätere Agent-Arbeit.

### 6.1 Python (Kaabar)

| # | Todo | Buch-Referenz | Aufwand |
|---|------|---------------|---------|
| P1 | `swing_detect()` buchnah (rolling min/max, default 20) | `mastering-finance-python.md` **L3319–3399, L3370** | 0.5 Tage |
| P2 | HMA in Python | `mastering-finance-python.md` **L1755–1794** | 0.25 Tage |
| P3 | CARSI Chart-Transform | `mastering-finance-python.md` **L3129–3160** | 0.5 Tage |
| P4 | CARSI Patterns (Ch.7) | `mastering-finance-python.md` **L4178–4314** | 1 Tag |
| P5 | Spike-Weighted Volatility (SWV) | `mastering-finance-python.md` **L3725–3799** | 0.5 Tage |
| P6 | Exponentially Weighted StdDev | `mastering-finance-python.md` **L3634–3673** | 0.25 Tage |
| P7 | Volatility Index | `mastering-finance-python.md` **L3800–3850** | 0.5 Tage |
| P8 | Rainbow Collection (7 Indikatoren) | `mastering-finance-python.md` **L2459–2931** | 2 Tage |
| P9 | BB Signal Variants (5+ Methoden) | `mastering-finance-python.md` **L2027–2281, L2088–2261** | 1 Tag |
| P10 | R Pattern, Bottle, Double Trouble (Candlestick) | `mastering-finance-python.md` **L3934–4118** | 1 Tag |

### 6.2 Rust (RUST.md + Rust-Buch)

| # | Todo | Buch-Referenz | Aufwand |
|---|------|---------------|---------|
| R1 | Crate-Struktur (indicators/, patterns/, strategy/) | `RUST_LANGUAGE_IMPLEMENTATION.md` **L149–191** | 1 Tag |
| R2 | Rayon in `calculate_indicators_batch` | `deeplearning-with-rust.md` **L3230–3310** | 0.5 Tage |
| R3 | Concurrency für Composite (DL-1) | `deeplearning-with-rust.md` **L4209–4620** | 1–2 Tage |
| R4 | HMA in Rust | `mastering-finance-python.md` **L1755–1794** | 0.5 Tage |
| R5 | KAMA in Rust | `mastering-finance-python.md` **L1795–1869** | 0.5 Tage |
| R6 | ALMA in Rust | `mastering-finance-python.md` **L1870–1965** | 0.5 Tage |
| R7 | Stochastic in Rust | `mastering-finance-python.md` **L5986–5993** | 0.5 Tage |
| R8 | Kand evaluieren | `RUST_LANGUAGE_IMPLEMENTATION.md` **L195–224** | 0.5 Tage |

### 6.3 INDICATOR_ARCHITECTURE Todos (Übernahme)

| # | Todo | INDICATOR_ARCHITECTURE | Buch-Referenz |
|---|------|------------------------|---------------|
| I1 | swing_detect | Todo #2 | Ch.5 L3370 |
| I2 | Fibonacci Retracements | Todo #3 | Ch.5 L3255–3481 |
| I3 | KAMA | Todo #8 | Ch.3 L1795–1869 |
| I4 | ALMA | Todo #9 | Ch.3 L1870–1965 |
| I5 | IWMA + OLS MA | Todo #10 | Ch.3 L1675–1754, L1587 |
| I6 | moving_average() generalisiert | Todo #11 | Ch.3 L2001–2017 |
| I7 | BB Signal Variants | Todo #12 | Ch.3 L2027–2281 |
| I8 | RSI Variants | Todo #13 | Ch.3 L2282–2458 |
| I9 | Candlestick (inkl. CARSI) | Todo #14 | Ch.7 L3851–4314 |
| I10 | Harmonic (ABCD, Gartley, Crab) | Todo #15 | Ch.8 L4342–4660 |
| I11 | Tom DeMark TD Setup | Todo #18 | Ch.9 L4792–4922 |
| I12 | Heikin-Ashi + Volume Candles + CARSI | Todo #25 | Ch.4 L2948–3160 |
| I13 | Rainbow Collection | Todo #26 | Ch.3 L2459–2931 |
| I14 | SWV + Volatility Index + Exp-Weighted StdDev | Todo #27 | Ch.6 L3634–3850 |

---

## 7. Buchbezüge-Tabelle (Schnellreferenz)

| Thema | mastering-finance-python.md | deeplearning-with-rust.md | RUST_LANGUAGE_IMPLEMENTATION.md |
|-------|-----------------------------|---------------------------|---------------------------------|
| Swing Detection | L3319–3399, L3370 | — | — |
| KAMA | L1795–1869 | — | — |
| ALMA | L1870–1965 | — | — |
| HMA | L1755–1794 | — | — |
| IWMA | L1675–1754 | — | — |
| OLS MA | L1587 | — | — |
| moving_average() | L2001–2017 | — | — |
| BB Variants | L2027–2281, L2088–2261 | — | — |
| RSI Variants | L2282–2458, L2221–2310 | — | — |
| CARSI | L3129–3160, L4178 | — | — |
| Heikin-Ashi | L3015–3076, L3047–3061 | — | — |
| Fibonacci | L3255–3481 | — | — |
| Harmonic | L4342–4754 | — | — |
| Candlestick | L3851–4314 | — | — |
| K's Collection | L5260–5682 | — | — |
| SWV | L3725–3799 | — | — |
| Stochastic | L5986–5993 | — | — |
| Rayon | — | Kap. 4.5, L3230–3310 | DL-2, L1222–1253 |
| Concurrency | — | Kap. 6, L4209–4620 | DL-1, L1179–1220 |
| Producer-Consumer | — | Kap. 6.4.1, L4370–4410 | DL-11, Sek. 5b |
| Crate-Struktur | — | — | L149–191 |
| Kand | — | — | L195–224 |

**Ergänzende Bücher (INDICATOR_ARCHITECTURE):**
- AFML: `advanced-in-financial-markets-ml.md` — CUSUM (Ch.17), Triple-Barrier (Ch.3), VPIN (Ch.19), Deflated Sharpe (Ch.14), HRP (Ch.16)
- QT: `quantitative-trading.md` — Mean-Rev/Momentum (Ch.7), Kelly (Ch.6)

---

## 8. Verify Gates (nach Umsetzung)

```bash
# Swing Detection buchnah (default 20)
curl -X POST http://127.0.0.1:9060/api/v1/indicators/swings \
  -H "Content-Type: application/json" \
  -d '{"ohlcv":[...], "window":20}'

# HMA Exotic MA
curl -X POST http://127.0.0.1:9060/api/v1/indicators/exotic-ma \
  -H "Content-Type: application/json" \
  -d '{"ohlcv":[...], "maType":"hma", "period":20}'

# CARSI Chart Transform
curl -X POST http://127.0.0.1:9060/api/v1/charting/transform \
  -H "Content-Type: application/json" \
  -d '{"ohlcv":[...], "transformType":"carsi"}'
```

---

## 9. Abhängigkeiten

| Phase | Abhängigkeit |
|-------|--------------|
| P1 (Swing) | — |
| P2 (HMA) | — |
| P3–P4 (CARSI) | — |
| P5–P7 (Volatility) | — |
| P8 (Rainbow) | P1 |
| R1 (Crate-Struktur) | — |
| R2 (Rayon) | R1 |
| R3 (Concurrency) | R1 |
| R4–R7 (Rust-Indikatoren) | R1 |
