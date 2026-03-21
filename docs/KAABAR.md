# Kaabar 2026 — Indicator & Pattern Reference

> **Buch:** "Mastering Financial Markets with Python — New Horizons in Technical Analysis" (Sofien Kaabar, CFA, 2026)
> **Stand:** 20. Maerz 2026
> **Module:** `python-backend/python-compute/indicator_engine/`
> **Audit-Details:** `docs/archive/KAABAR_BOOK_AUDIT.md` (vollstaendiger Kapitel-fuer-Kapitel Abgleich)
> **Ch.2-Referenz:** `docs/archive/KAABAR_CH2_PYTHON_REFERENCE.md` (Python-Stack, Dependencies, Buchcode-Repo)
> **Buchcode-Repo:** https://github.com/sofienkaabar/mastering-financial-markets-in-python

---

## Grundprinzipien (Kap. 1)

### Regime-aware Signal Weighting

> "Bullish signals within an ascending trend have more weight than bearish signals within
> an ascending trend. During sideways regimes, both bullish and bearish signals have the same weight."

3 Regime: **bullish / bearish / ranging**. Jeder Indikator koennte einen optionalen Regime-Filter
bekommen der Signale gewichtet — als Post-Processing-Layer, nicht pro Indikator.

**Implementation:** `regime_weighting.py` — `apply_regime_weight(signal, regime, weight_ratio)`.
Noch nicht in alle Signal-Pipelines integriert.

### Dekorrelation moderner Indikatoren

> "The condition is for the indicator to have a better-than-random forecasting ability.
> There is no added value from having two extremely correlated indicators with accuracy greater than 50%."

Unser `build_composite_signal` nutzt RSI + OBV + CMF + SMA (Momentum + Volume + Trend) —
gute Mischung, aber Korrelation wird nicht explizit gemessen.

### Elliott Wave in moderner TA

> "Elliott wave theory in its classic form is not valid in modern technical analysis.
> However, it can be rendered objective through the use of smart algorithms."

Kaabar bietet keine Implementation — unser `build_elliott_wave_patterns` (R1-R6) ist
unabhaengig von Kaabar, mit eigenem Konfidenz-Scoring.

---

## Kapitel 3 — Moderne Indikatoren

### Exotic Moving Averages

| MA | Modul | Funktion | Status |
|:---|:------|:---------|:-------|
| WMA | `trend.py` | `wma()` | KORREKT |
| IWMA | `trend.py` | `iwma()` | KORREKT |
| HMA | `trend.py` | `hma()` | KORREKT — WMA(n/2)×2 − WMA(n) → WMA(√n) |
| KAMA | `trend.py` | `kama()` | KORREKT — Kaufman Adaptive, fast=2, slow=30 |
| ALMA | `trend.py` | `alma()` | KORREKT — sigma=6 (Standard), Kaabar nutzt sigma=3 (responsive). `sigma` ist Parameter. |
| OLS-MA | `trend.py` | `ols_ma()` | KORREKT — Kaabar nennt es "LSMA" |
| EMA | `trend.py` | `ema()` | KORREKT — α=2/(n+1) |
| SMMA | `trend.py` | `smma()` | KORREKT — Wilder: EWM span=2n-1 |

**WMA/IWMA Cross-Strategie** → `calculate_wma_iwma_cross()`

> "Use WMA as short-term MA, IWMA as long-term MA with the SAME lookback period.
> This removes one parameter from the strategy."

Statt zwei Lookback-Perioden nutzt man WMA (recent bias) und IWMA (historical bias)
mit identischem Lookback — natuerliches Cross-Signal.

**Go-Proxy: OFFEN** — Endpoint `/api/v1/indicators/wma-iwma-cross` noch nicht gewired.

### Bollinger Band Signal-Techniken

| Technik | Modul | Funktion | Buch-Ref |
|:--------|:------|:---------|:---------|
| Conservative (Re-Entry) | `volatility.py` | `calculate_bb_conservative()` | Close kreuzt UEBER Lower Band zurueck, bleibt unter Middle |
| Aggressive (Pierce) | `volatility.py` | `calculate_bb_aggressive()` | Close kreuzt UNTER Lower Band |
| Trend-Friendly | `volatility.py` | `calculate_bb_trend_friendly()` | Conservative + Close > SMA(100) Trendfilter |
| BB-RSI Overlay | `volatility.py` | `calculate_bollinger_on_rsi()` | KORREKT implementiert |

**Go-Proxy: OFFEN** — Endpoints `/api/v1/indicators/bb-conservative`, `/bb-aggressive`, `/bb-trend-friendly` noch nicht gewired.

### RSI Signal-Techniken

| Technik | Modul | Funktion | Buch-Ref |
|:--------|:------|:---------|:---------|
| V-Technique | `oscillators.py` | `calculate_rsi_v_technique()` | RSI(5), Barriers 15/85, V-Form Bounce-Signal |
| DCC (Dual Conservative) | `oscillators.py` | `calculate_rsi_dcc()` | RSI(13) UND RSI(34) beide ueber 30 gleichzeitig — Fibonacci-Lookbacks |
| MA-Cross | `oscillators.py` | `calculate_rsi_ma_cross()` | RSI vs SMA(RSI) Cross waehrend RSI < 25 oder > 75 |

> V-Technique: "The V-form shows the RSI briefly dipped below the extreme level and immediately
> came back — a sign of strong counterreaction."

**Go-Proxy: OFFEN** — Endpoints `/api/v1/indicators/rsi-v-technique`, `/rsi-dcc`, `/rsi-ma-cross` noch nicht gewired.

### Rainbow Collection (7 Indikatoren)

| Farbe | Modul | Beschreibung | Status |
|:------|:------|:-------------|:-------|
| Red | `rainbow.py` | EMA-BB extreme-duration reversal | KORREKT |
| Orange | `rainbow.py` | RSI(8) crossover 35/65 | KORREKT |
| Yellow | `rainbow.py` | Slope-Divergenz SMA vs. Close | KORREKT |
| Green | `rainbow.py` | EMA(5) vs. SMA(200) dual-cross | KORREKT |
| Blue | `rainbow.py` | Stochastic(8,3) crossover 20/80 | KORREKT |
| Indigo | `rainbow.py` | Fibonacci-lag RSI reversal | KORREKT |
| Violet | `rainbow.py` | HMA-Slope Richtungswechsel | KORREKT |

**Rainbow Confluence** → `calculate_rainbow_confluence()`: Signale innerhalb ±3 Perioden ueber alle 7 Indikatoren.
**Rainbow Composite Score** → `rainbow_composite_score()`: Aggregierter Score aller 7 Indikatoren.

> "Ideally, signals should occur within ±3 time periods of each other for a signal to be strong."

**Go-Proxy: OFFEN** — Endpoints `/api/v1/indicators/rainbow/*` noch nicht gewired.

---

## Kapitel 4 — Alternative Charting Systems

Alle 4 Systeme transformieren OHLC-Daten als Preprocessing-Schritt.
Implementiert in `patterns.py:apply_chart_transform()`.

| System | Endpoint | Status |
|:-------|:---------|:-------|
| Heikin-Ashi | `/api/v1/charting/transform` (type=heikin_ashi) | KORREKT |
| Volume Candlesticks | `/api/v1/charting/transform` (type=volume) | BUG: Verzerrt OHLC-Daten statt nur Breite zu variieren |
| K's CCS | `/api/v1/charting/transform` (type=k_candles) | EMA(5) auf alle 4 OHLC-Spalten |
| CARSI | `/api/v1/charting/transform` (type=carsi) | BUG: RSI nur auf Close statt auf alle 4 OHLC-Spalten |

**K's CCS (Candlestick Charting System):**
> "Its main aim is to smooth the data and improve the efficacy of candlestick patterns."

EMA(5) auf Open, High, Low, Close separat — einfacher als Heikin-Ashi, einstellbarer Lookback.
Preprocessing fuer Candlestick-Patterns (Kap. 7) und Swarming-Validierung.

**CARSI (Candlestick RSI):**
RSI(14) auf alle 4 OHLC-Spalten → Candlestick-Chart im 0-100 Bereich.
Ermoeglicht Candlestick-Pattern-Erkennung auf dem RSI — einzigartig.

**Swarming-Philosophie** → `swarm_validate()`:
> "Consider the signal only when it's visible across all three candlestick systems."

Signal auf Standard + Heikin-Ashi + K's CCS gleichzeitig = maximale Conviction.
`swarming_ratio = count_fired / 3` (0.33, 0.67, 1.0) als Confidence-Booster.

**Go-Proxy: OFFEN** — Endpoint `/api/v1/indicators/swarm-validate` noch nicht gewired.

---

## Kapitel 5 — Fibonacci

### Fibonacci Levels & Confluence

| Funktion | Modul | Beschreibung |
|:---------|:------|:-------------|
| `fibonacci_levels()` | `patterns.py` | 9 Ratios (0.236–2.618) auf letzte 2 Pivots — Snapshot |
| `build_fibonacci_confluence()` | `patterns.py` | Multi-Swing Cluster, Sortierung nach Strength — FORTSCHRITTLICHER als Kaabar |
| `detect_swings()` | `helpers.py` | Strikte Pivot-Detection mit Boundary-Pivots und Deduplizierung |

**Fehlende Ratios:** 88.6%, 113.0%, 200.0% — kritisch fuer Harmonic Patterns (Bat PRZ, Butterfly Extension, AB=CD Projektion).

### Signal-Techniken (Kaabar-spezifisch)

| Technik | Beschreibung | Status |
|:--------|:-------------|:-------|
| 23.6% Reintegration | Bruch des 23.6%-Levels → Bearish Continuation erwartet | OFFEN |
| 61.8% Reactionary | Preis erreicht 61.8%-Level → Mean-Reversion-Signal | OFFEN |

> "The 61.8% level can be referred to as the most important Fibonacci support level."

---

## Kapitel 6 — Volatilitaet

### ATR (Average True Range)

| Funktion | Modul | Smoothing | Status |
|:---------|:------|:----------|:-------|
| `_atr_wilder()` | `volatility.py` | SMMA (Wilder) — `ema(tr, period*2-1)` | KORREKT |
| `calculate_atr()` | `volatility.py` | Rust-first, Python-Fallback SMA | BUG: Fallback nutzt SMA statt SMMA |

Kaabar: **"The ATR is the SMMA of the TR."** — Wilder's Original. `span = (2n-1)` Transformation.

### Spike-Weighted Volatility (SWV)

`calculate_volatility_suite()` in `volatility.py`

| Aspekt | Kaabar (SOLL) | Unsere Impl. (IST) |
|:-------|:-------------|:-------------------|
| Spike-Gewichtung | Kontinuierlich (z-Score proportional) | Binaer (2× oder 1×) |
| Return-Typ | `pct_change()` (prozentual) | `log()` (logarithmisch) |
| Zeitreihe | Rolling pro Bar | Ein Snapshot |

> "This makes high-volatility periods contribute more to the total **without being binary**."

**SWV 4-Tier Regime** (Kaabar):

| SWV-Wert | Marktlage |
|:---------|:----------|
| 0.002–0.005 | Sehr ruhig — Mean-Reversion |
| 0.005–0.015 | Normal — Routine |
| 0.015–0.030 | Erhoeht — Breakouts |
| > 0.030 | Hochvolatil — News/Panik |

### VIX-Cross-Asset Convergence

`calculate_cross_asset_convergence()` — RSI auf SPX + RSI auf VIX gleichzeitig als Conviction-Booster.
Daten ueber FRED-Connector (`VIXCLS`).

**Go-Proxy: OFFEN** — Endpoint `/api/v1/indicators/cross-asset-convergence` noch nicht gewired.

---

## Kapitel 7 — Candlestick Patterns

`build_candlestick_patterns()` in `patterns.py`

### Standard-Patterns (KORREKT)

Doji (Standard/Dragonfly/Gravestone), Spinning Top, Engulfing (Bullish/Bearish),
Hammer/Inverted Hammer, Piercing Line, Dark Cloud Cover, Morning/Evening Star,
Three White Soldiers, Three Black Crows.

### Kaabar-proprietaere Patterns

| Pattern | Status | Beschreibung |
|:--------|:-------|:-------------|
| R-Pattern | `rainbow.py` | 4-Bar V-Form in Lows/Highs + RSI(14) < 50 Filter |
| Bottle | BUG (Rewrite noetig) | 2-Bar Continuation: `open == low` (bullish) + Gap-Pruefung |
| Double Trouble | BUG (Rewrite noetig) | 2-Bar ATR-gefiltert: `body > 2 × ATR(14)` |
| Extreme Euphoria | BUG (Rewrite noetig) | 5 konsekutive gleiche Richtung + zunehmende Body-Groesse |

### CARSI-Patterns (blockiert durch CARSI-Bug)

| Pattern | Beschreibung |
|:--------|:-------------|
| Hidden Shovel | Nur Low-RSI taucht in Extremzone (< 30), Rest normal — fruehes Reversal |
| Absolute U-Turn | 5 Bars RSI_low < 20, dann Wende — langanhaltender Extremzustand loest sich |

---

## Kapitel 8 — Harmonic Patterns

`build_harmonic_patterns()` in `patterns.py`

| Pattern | Fibonacci-Ratios | Status |
|:--------|:----------------|:-------|
| ABCD | AB ≈ CD (Symmetrie) | Anderer Ansatz (Fib statt Symmetrie) — D-Projektion fehlt |
| Gartley | AD/XA ≈ 0.786 | AD/XA-Validierung FEHLT |
| Bat | AD/XA ≈ 0.886 | UNSERE ERWEITERUNG — AD/XA-Validierung FEHLT |
| Butterfly | AD/XA ≈ 1.272 | UNSERE ERWEITERUNG — AD/XA-Validierung FEHLT |
| Crab | AD/XA ≈ 1.618, CD/BC ≈ 2.240–3.618 | AD/XA-Validierung FEHLT |
| FEIW | Failed Breakout/Breakdown | Fib-Ratio-Validierung FEHLT |

### Risk Management (NICHT IMPLEMENTIERT)

Kaabar definiert einheitliches Schema fuer alle Harmonics:
- **Target 1:** 38.2% Retracement des A→D Swings
- **Target 2:** 61.8% Retracement des A→D Swings
- **Stop:** D ± 2 × ATR(14)

### Buch-Bug erkannt

`fib_tolerance=3` im Buchcode macht `np.isclose` bei Ratios 0.382–1.618 bedeutungslos.
Unsere expliziten Range-Checks sind besser.

---

## Kapitel 9 — Timing Patterns

`build_td_timing_patterns()` in `patterns.py`

### TD Setup 9

| Aspekt | Kaabar (SOLL) | Unsere Impl. (IST) |
|:-------|:-------------|:-------------------|
| Bullish | 9× `close[i] < close[i-4]` (fallend = Erschoepfung) | BUG: Richtung INVERTIERT |
| Perfected | Low[8/9] < Low[6/7] zusaetzlich | FEHLT — Backtest zeigt: Perfected profitabler |

**Perfected vs Unperfected** (Kaabar Backtest-Daten):

| Metrik | Unperfected | Perfected |
|:-------|:------------|:----------|
| Hit Ratio | 47.22% | 34.78% |
| Expectancy | **-0.33** | **+1.41** |
| Risk-Reward | 0.95 | **3.07** |

### TD Countdown 13 (UNSERE ERWEITERUNG)

13-Bar Countdown nach Setup-Completion. Bearish: `close[i] <= low[i-2]` fuer 13 Bars.
Nicht in Kaabar's Code, aber bekannte DeMark-Erweiterung.

### TDST Levels (UNSERE ERWEITERUNG)

`min(closes)` der 9 Setup-Bars als Support (bullish) / `max(closes)` als Resistance (bearish).

### Fibonacci Timing Pattern (Kaabar-proprietaer)

8 konsekutive Bars mit Fib-Lookbacks (5, 21):
`close[i] < close[i-5]` UND `close[i-5] < close[i-21]`.

> "Inspired by the TD setup, the Fibonacci timing pattern uses Fibonacci numbers as time variables."

Nutzbar in Tandem mit TD Setup fuer **Swarming**.

---

## Kapitel 10 — Price Patterns

`build_price_patterns()` in `patterns.py`

### Double Top/Bottom

| Aspekt | Status |
|:-------|:-------|
| Swing-Struktur (Low-High-Low / High-Low-High) | KORREKT |
| Toleranz-basiert | KORREKT |
| **Neckline-Breakout-Bestaetigung** | FEHLT — mehr False Positives ohne |

### Head & Shoulders

| Aspekt | Status |
|:-------|:-------|
| 5-Pivot-Erkennung (LS-LV-H-RV-RS) | KORREKT |
| Target Price (Neckline ± Head-Height) | KORREKT |
| Slanted Neckline (Linie durch 2 Valleys) | UNSERE ERWEITERUNG — Kaabar nutzt horizontal |

### Gap Pattern

| Aspekt | Kaabar | Wir |
|:-------|:-------|:----|
| Richtung | KONTRAER (Gap Down = bullish, Gap-Fuellung) | DIREKTIONAL (Gap Up = bullish, Momentum) |
| Mindestgroesse | ATR(14) × min_size (adaptiv) | Prozentuale Threshold (statisch) |
| Gap-Definition | `open vs prev_close` | `low vs prev_high` (strenger) |

Beide Ansaetze valide — `rainbow.py` implementiert Kaabar's kontraere Version mit ATR-Filter.

---

## Kapitel 11 — K's Collection

`calculate_ks_collection()` in `oscillators.py`

| Indikator | Formel | Status |
|:----------|:-------|:-------|
| K's Reversal I | BB(100, 2σ) + MACD(12/26/9) Crossover | KORREKT |
| K's Reversal II | SMA(13) + 21-Bar Count ueber/unter SMA | KORREKT — Buch-Copy-Paste-Bug erkannt |
| K's ATR-RSI | RSI(13) × ATR(5) → RSI(13) | KORREKT |
| K's RSI² | RSI(14) → RSI(5) | KORREKT — Buch-Code/Text-Diskrepanz erkannt |
| K's MARSI | SMA(200) → RSI(20), Schwellen 2/98 | Berechnung KORREKT, Signal-Logik FEHLT |
| K's Fibonacci MA | 15 Fib-EMAs auf High+Low | KORREKT + Mid-Erweiterung |

**Buch-Bugs erkannt:** Reversal II Copy-Paste-Fehler, RSI² falscher Lookback im Code.
Wir folgen der Text-Beschreibung.

> "K's collection is different from the rainbow indicators: the former are more sophisticated,
> while the latter can mostly be considered as techniques applied to indicators."

---

## Kapitel 12 — Performance & Backtesting

### Performance-Metriken (KORREKT + Erweiterungen)

| Metrik | Kaabar | Unsere Impl. |
|:-------|:-------|:-------------|
| Net Return | `(end - start) / start` | `prod(1+r) - 1` ✓ |
| Hit Ratio | `wins / total` | ✓ |
| Risk-Reward | `avg_gain / avg_loss` | ✓ |
| Expectancy | `(hit × gain) - ((1-hit) × loss)` | ✓ |
| Profit Factor | `total_gains / total_losses` | ✓ |
| Sharpe/Sortino | Standard | Annualisiert ×√252 ✓ |

**Unsere Erweiterungen (ueber Kaabar hinaus):**
Max Drawdown, Deflated Sharpe, Walk-Forward Validation, Signal Quality Chain, Triple Barrier Labels.

### Rob Booker Reversal

`calculate_rob_booker_reversal()` — Stochastic(70,10,10) + MACD(12/26/9) Zero-Cross.

> Backtest: 60% Hit Ratio, Profit Factor 1.50, Risk-Reward 2.57, Sortino 2.05.

Nicht Kaabar-proprietaer (Rob Booker = externer Trader).

**Go-Proxy: OFFEN** — Endpoint `/api/v1/indicators/rob-booker-reversal` noch nicht gewired.

---

## Zusaetzliche Features (ueber Kaabar hinaus)

| Feature | Modul | Beschreibung |
|:--------|:------|:-------------|
| Regime Weighting Post-Processor | `regime_weighting.py` | Signale nach Regime gewichten |
| Swarming Multi-Chart Validation | `patterns.py` | Signal ueber 3 Chart-Systeme bestaetigen |
| Regime Detection 3-Tier | `volatility.py` | Rule-based + Markov + HMM |
| Volatility Suite mit SWV | `volatility.py` | HV + SWV + relative Regime |
| Slanted Neckline bei H&S | `patterns.py` | Linie statt Durchschnitt |
| TDST Level + TD Countdown 13 | `patterns.py` | DeMark-Erweiterungen |
| Fibonacci Confluence (Multi-Swing) | `patterns.py` | Cluster nach Strength |
| Bat/Butterfly Harmonics | `patterns.py` | Scott Carney Standard-Patterns |
| Deflated Sharpe + Walk-Forward | `quant.py` | Overfitting-Korrektur |
| Triple Barrier Labels | `quant.py` / `backtest.py` | Lopez de Prado |
| Signal Quality Chain | `quant.py` | Markov-Transition-Matrix |

---

## Endpoint-Uebersicht

### Gewired in wiring.go (via IndicatorProxyHandler)

| Route | Python-Modul | Buch-Kap. |
|:------|:-------------|:----------|
| `/api/v1/indicators/exotic-ma` | `trend.py` | 3 |
| `/api/v1/indicators/ks-collection` | `oscillators.py` | 11 |
| `/api/v1/indicators/ichimoku` | `trend.py` | — |
| `/api/v1/indicators/macd` | `oscillators.py` | 11 |
| `/api/v1/indicators/stochastic` | `oscillators.py` | 12 |
| `/api/v1/indicators/adx` | `oscillators.py` | 6 |
| `/api/v1/indicators/hma` | `trend.py` | 3 |
| `/api/v1/indicators/vwap` | `volume.py` | 6 |
| `/api/v1/indicators/keltner` | `volatility.py` | 6 |
| `/api/v1/indicators/swings` | `helpers.py` | 5 |
| `/api/v1/indicators/bollinger/bandwidth` | `volatility.py` | 3 |
| `/api/v1/indicators/bollinger/percent-b` | `volatility.py` | 3 |
| `/api/v1/indicators/bollinger/squeeze` | `volatility.py` | 3/6 |
| `/api/v1/indicators/rsi/atr-adjusted` | `oscillators.py` | 11 |
| `/api/v1/indicators/rsi/bollinger` | `volatility.py` | 3 |
| `/api/v1/indicators/volatility-suite` | `volatility.py` | 6 |
| `/api/v1/patterns/candlestick` | `patterns.py` | 7 |
| `/api/v1/patterns/harmonic` | `patterns.py` | 8 |
| `/api/v1/patterns/timing` | `patterns.py` | 9 |
| `/api/v1/patterns/price` | `patterns.py` | 10 |
| `/api/v1/patterns/elliott-wave` | `patterns.py` | — |
| `/api/v1/fibonacci/levels` | `patterns.py` | 5 |
| `/api/v1/fibonacci/confluence` | `patterns.py` | 5 |
| `/api/v1/charting/transform` | `patterns.py` | 4 |
| `/api/v1/regime/detect` | `volatility.py` | 6 |
| `/api/v1/regime/markov` | `volatility.py` | 6 |
| `/api/v1/regime/hmm` | `volatility.py` | 6 |
| `/api/v1/v1/signals/composite` | `oscillators.py` | 1 |
| `/api/v1/eval/performance-metrics` | `quant.py` | 12 |
| `/api/v1/eval/indicator` | `quant.py` | 12 |
| `/api/v1/eval/deflated-sharpe` | `quant.py` | 12 |
| `/api/v1/backtest/run` | `backtest.py` | 12 |
| `/api/v1/backtest/walk-forward` | `backtest.py` | 12 |

### Fehlende Go-Proxies (OFFEN)

| Route (vorgeschlagen) | Python-Modul | Buch-Kap. |
|:-----------------------|:-------------|:----------|
| `/api/v1/indicators/rainbow/confluence` | `rainbow.py` | 3 |
| `/api/v1/indicators/rainbow/composite` | `rainbow.py` | 3 |
| `/api/v1/indicators/swarm-validate` | `patterns.py` | 4/9 |
| `/api/v1/indicators/regime-weighted` | `regime_weighting.py` | 1 |
| `/api/v1/indicators/rsi-v-technique` | `oscillators.py` | 3 |
| `/api/v1/indicators/rsi-dcc` | `oscillators.py` | 3 |
| `/api/v1/indicators/rsi-ma-cross` | `oscillators.py` | 3 |
| `/api/v1/indicators/bb-conservative` | `volatility.py` | 3 |
| `/api/v1/indicators/bb-aggressive` | `volatility.py` | 3 |
| `/api/v1/indicators/bb-trend-friendly` | `volatility.py` | 3 |
| `/api/v1/indicators/wma-iwma-cross` | `trend.py` | 3 |
| `/api/v1/indicators/rob-booker-reversal` | `oscillators.py` | 12 |
| `/api/v1/indicators/cross-asset-convergence` | `volatility.py` | 6 |

---

## Frontend-Hinweise

- **Chart Transform Dropdown:** Standard / Heikin-Ashi / Volume Candles / K's CCS / CARSI
  - Volume Candles: OHLC unveraendert, Kerzenbreite via `volume_tier` (1-4) — rein visuelles Frontend-Feature
  - K's CCS: Preprocessing fuer Pattern-Erkennung — Patterns auf geglaetteten Daten laufen lassen
- **Rainbow als Overlay oder Sub-Panel:** 7 Indikatoren parallel, Confluence-Score als Badge
- **Regime-Badge anzeigen:** Bullish/Bearish/Ranging + SWV-Tier (ruhig/normal/erhoeht/hochvolatil)
- **Swarming als Confidence-Booster:** Kein eigener Indikator sondern Badge/Score (0.33/0.67/1.0)
  neben jedem Signal das auf mehreren Chart-Systemen bestaetigt ist
- **Harmonic Pattern Targets:** Bei Erkennung direkt Target 1/2 + Stop-Level einzeichnen
- **FX/Crypto-Warnung:** Volume Candles deaktivieren/warnen bei dezentralisierten Maerkten

---

## Go-Backend Hinweise

- Alle existierenden Kaabar-Endpoints laufen via `IndicatorProxyHandler` in `wiring.go` (Zeile 642-703)
- Python indicator-service (`indicatorServiceClient`) ist das Proxy-Ziel
- Neue Endpoints aus der "Fehlende Go-Proxies" Tabelle benoetigen:
  1. Entsprechende FastAPI-Route in `indicator_engine/app.py`
  2. `mux.HandleFunc(...)` Zeile in `wiring.go`
- Kein separater Go-Code noetig — reine Proxy-Durchleitung

---

## Bekannte Bugs (aus Audit)

| # | Bug | Modul | Schwere |
|:--|:----|:------|:--------|
| 1 | Bottle: prueft kleine Bodies statt Docht+Gap | `patterns.py` | HOCH |
| 2 | Double Trouble: prueft Dojis statt ATR-gefilterte grosse Kerzen | `patterns.py` | HOCH |
| 3 | Extreme Euphoria: 7 Bar statt 5, falsche Checks, nur bearish | `patterns.py` | HOCH |
| 4 | TD Setup Richtung INVERTIERT | `patterns.py` | KRITISCH |
| 5 | CARSI: RSI nur auf Close statt alle 4 OHLC | `patterns.py` | HOCH |
| 6 | Volume Candles: OHLC-Daten verzerrt statt nur Breite | `patterns.py` | MITTEL |
| 7 | ATR `calculate_atr()` Fallback: SMA statt SMMA | `volatility.py` | MITTEL |
| 8 | SWV binaer statt kontinuierlich (z-Score) | `volatility.py` | MITTEL |

---

## Buch-Bugs erkannt

| # | Bug im Buch | Unsere Loesung |
|:--|:------------|:---------------|
| 1 | `fib_tolerance=3` (macht `np.isclose` bei 0.382-1.618 bedeutungslos) | Explizite Range-Checks |
| 2 | K's Reversal II: Copy-Paste von Reversal I Code | Text-Beschreibung gefolgt |
| 3 | K's RSI²: Code nutzt RSI(14) statt RSI(5) fuer zweiten RSI | Text-Beschreibung gefolgt |

---

## Primaerquellen

| Referenz | Relevanz |
|:---------|:---------|
| **Carney 2004/2007** — Harmonic Trading Vol. 1+2 | Definitive Ratios fuer Gartley/Bat/Butterfly/Crab |
| **DeMark 2002** — DeMark Indicators | TD Setup/Countdown Original |
| **Wilder 1978** — New Concepts in Technical Trading Systems | RSI + ATR Original (SMMA, nicht EMA) |
| **Kaabar** — Mastering Financial Pattern Recognition (O'Reilly) | Erweiterte Pattern-Analyse |
