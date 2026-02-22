# Rust Language Implementation Strategy -- TradeView Fusion

> Stand: 19. Februar 2026
> Kontext: Strategische Analyse wo Rust im bestehenden Stack (Next.js + Go + Python) realen Mehrwert liefert.
> Grundprinzip: Rust ist additiv, nicht destruktiv. Kein Full Rewrite. Praezises Skalpell fuer Performance- und Sicherheitskritische Bereiche.
> **Zusammenspiel mit Indikator-Architektur:** [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sektion 0.8 beschreibt wie rust-core/PyO3 in den Python Indicator Service integriert wird.

---

## Inhaltsverzeichnis

1. [Entscheidungsmatrix](#1-entscheidungsmatrix)
2. [Definitiv einbauen: Rust Indicator Core via PyO3](#2-definitiv-einbauen-rust-indicator-core-via-pyo3)
3. [Stark empfohlen: Kand als Basis evaluieren](#3-stark-empfohlen-kand-als-basis-evaluieren)
4. [Sinnvoll mittelfristig: WASM fuer leichte Frontend-Indikatoren](#4-sinnvoll-mittelfristig-wasm-fuer-leichte-frontend-indikatoren)
5. [Sinnvoll mittelfristig: Backtesting Engine](#5-sinnvoll-mittelfristig-backtesting-engine)
5a. [Sinnvoll mittelfristig: Polars als DataFrame-Layer](#5a-sinnvoll-mittelfristig-polars-als-dataframe-layer)
5b. [Sinnvoll mittelfristig: Embedded OHLCV-Cache (redb)](#5b-sinnvoll-mittelfristig-embedded-ohlcv-cache-redb)
6. [Optional langfristig: Chart Engine Compute Layer](#6-optional-langfristig-chart-engine-compute-layer)
7. [Optional langfristig: Tauri v2 Desktop App](#7-optional-langfristig-tauri-v2-desktop-app)
8. [Beobachten: Rust AI Agent Frameworks](#8-beobachten-rust-ai-agent-frameworks)
9. [Nicht einbauen: Go Gateway ersetzen](#9-nicht-einbauen-go-gateway-ersetzen)
10. [Nicht einbauen: Python ML/AI ersetzen](#10-nicht-einbauen-python-mlai-ersetzen)
11. [Nicht einbauen: React Frontend ersetzen](#11-nicht-einbauen-react-frontend-ersetzen)
12. [Nicht einbauen: GoCryptoTrader ersetzen](#12-nicht-einbauen-gocryptotrader-ersetzen)
13. [Geo Map -- Rust fuer Backend Spatial Queries](#13-geo-map----rust-fuer-backend-spatial-queries-nicht-fuer-rendering)
14. [Technische Konzepte: SIMD, Memory64, FFI](#14-technische-konzepte-simd-memory64-ffi)
15. [Referenz-Libraries und SOTA 2026](#15-referenz-libraries-und-sota-2026)
16. [Architektur-Zielbild](#16-architektur-zielbild)
17. [Phasen-Roadmap](#17-phasen-roadmap)
18. [Deep-Learning-Patterns aus Rust fuer TradeView Fusion](#18-deep-learning-patterns-aus-rust-fuer-tradeview-fusion)
19. [Quellen und Referenzen](#19-quellen-und-referenzen)

---

## 1. Entscheidungsmatrix

| Bereich | Empfehlung | Prioritaet | Grund |
|---------|-----------|-----------|-------|
| **PyO3 Indicator Core** | Definitiv | Hoch | 25+ Indikatoren, 5000+ Bars, PyO3 0.28 GIL-free, eliminiert Code-Duplikation |
| **Kand evaluieren** | Stark empfohlen | Hoch | Existierende Rust TA-Lib mit PyO3 + WASM, O(1) incremental |
| **WASM Frontend-Indikatoren** | Sinnvoll | Mittel | 3-8x schneller bei Multi-Indikator + langen Historien |
| **Backtesting Engine** | Sinnvoll | Mittel | EIN Backtester fuer alle Assets (Aktien/Forex/Crypto). GCT liefert nur Daten, kein CGO noetig. Nautilus-Trader-Pattern (Sek. 5) |
| **Chart Compute Layer** | Optional | Niedrig | Viewport-Culling, Koordinaten-Transform; erst bei 50k+ Bars |
| **Tauri v2 Desktop** | Optional | Niedrig | 3-10 MB App, nativer Indicator Core, langfristige Vision |
| **Rust AI Agents** | Beobachten | -- | ADK-Rust, AgentSDK existieren; Python-Ecosystem dominiert noch |
| **Go Gateway ersetzen** | Nein | -- | I/O-bound, Go perfekt positioniert, gut strukturiert |
| **Python ML/AI ersetzen** | Nein | -- | Sentiment-Modelle (FinBERT/FinGPT/XLM-R etc.), HuggingFace, scikit-learn haben kein Rust-Equivalent |
| **React ersetzen** | Nein | -- | Next.js 16 + Ecosystem unschlagbar, Dioxus/Leptos unreif |
| **GCT ersetzen** | Nein (Daten+Execution) | -- | 30+ Exchanges, Portfolio, Execution bleiben. Backtester wird langfristig durch Rust+Python ersetzt (Sek. 5 Evaluation) |
| **Geo Map Backend (h3o)** | Sinnvoll ab v3 | Niedrig | Frontend bleibt JS/TS (d3→deck.gl). Rust h3o fuer Backend Spatial Queries bei >5k Events. 26x schneller als JS |
| **Polars DataFrame-Layer** | Sinnvoll | Mittel | Rust-basierter DataFrame-Ersatz fuer pandas. 10-100x schneller, Arrow-backed, native PyO3-Integration. Wir nutzen pandas noch kaum -- Polars von Anfang an statt spaeter migrieren |
| **Embedded OHLCV-Cache (redb)** | Sinnvoll | Mittel-Hoch | Rust-native Key-Value DB fuer lokalen OHLCV-Cache. Eliminiert redundante API-Calls, 3x schneller als sled bei Writes, ACID-compliant |
| **AKQuant Architektur-Ref.** | Referenz | -- | Zweite SOTA-Referenz neben Nautilus Trader: Rust-Core + PyO3 + Zero-Copy, 20x schneller als Backtrader. Walk-Forward-Validation Pattern |

---

## 2. Definitiv einbauen: Rust Indicator Core via PyO3

### Problem

Schwere Indikatoren (Elliott Wave, Harmonic Patterns, Fibonacci, Candlestick-Patterns, Strategy Evaluation) laufen im Python `indicator-service` (Port 8092). Python ist fuer diese CPU-intensiven numerischen Berechnungen langsamer als noetig. Gleichzeitig existieren 25+ leichte Indikatoren als TypeScript in `src/lib/indicators/index.ts` (1122 Zeilen) -- Code-Duplikation zwischen Frontend und Backend.

### Loesung

Rust-Modul das die rechenintensive Kernlogik implementiert und via PyO3 als Python-Paket exponiert.

### Pattern

```
Python indicator-service (FastAPI, Port 8092)
    |
    v calls
Rust-Modul via PyO3 (compilierte Kernlogik)
    |
    v returns
Python formatiert HTTP-Response
```

### Betroffene Endpoints

Aus `python-backend/services/indicator-service/app.py`:

- `/api/v1/patterns/candlestick` -- Candlestick-Pattern-Erkennung
- `/api/v1/patterns/harmonic` -- Harmonic-Pattern-Erkennung
- `/api/v1/patterns/timing` -- TD-Timing-Patterns
- `/api/v1/patterns/price` -- Price-Patterns
- `/api/v1/patterns/elliott-wave` -- Elliott-Wave-Erkennung
- `/api/v1/signals/composite` -- Composite-Signal-Berechnung
- `/api/v1/evaluate/strategy` -- Strategy-Metriken
- `/api/v1/fibonacci/levels` -- Fibonacci-Level-Berechnung
- `/api/v1/indicators/exotic-ma` -- Exotische Moving Averages
- `/api/v1/charting/transform` -- Chart-Transformationen

### Warum PyO3

- PyO3 0.28 (Februar 2026): Free-threaded Python Support ist jetzt opt-out statt opt-in
- Python 3.13+ ohne GIL + Rust-Bindings = echte parallele Ausfuehrung
- Zero-Copy NumPy Integration moeglich
- ~7ns Overhead pro Funktionsaufruf (Kand-Benchmark)
- Kein Netzwerk-Roundtrip noetig -- Rust laeuft im selben Prozess

### Erwarteter Gewinn

- 10-50x Speedup bei Pattern-Detection gegenueber purem Python (VectorTA-Benchmarks)
- Eliminierung der Code-Duplikation zwischen TS-Frontend und Python-Backend
- Deterministische Ergebnisse durch Rust's Typsystem
- GIL-freie parallele Ausfuehrung von 10+ Pattern-Algos gleichzeitig

### Vorgeschlagene Crate-Struktur

```
rust-core/
  Cargo.toml
  src/
    lib.rs                # Core-Logik, Feature-Flags
    indicators/
      mod.rs
      moving_averages.rs  # SMA, EMA, WMA, HMA, Exotic MAs
      oscillators.rs      # RSI, Stochastic, MACD
      volatility.rs       # ATR, Bollinger, Keltner
      volume.rs           # VWAP, VWMA, OBV, CMF, RVOL
      trend.rs            # ADX, Ichimoku, Parabolic SAR
    patterns/
      mod.rs
      candlestick.rs      # Hammer, Doji, Engulfing, etc.
      harmonic.rs         # Gartley, Butterfly, Bat, Crab
      elliott.rs          # Wave Detection
      fibonacci.rs        # Levels, Retracements
      support_resistance.rs
      heartbeat.rs        # Rhythmus-Analyse
    strategy/
      mod.rs
      composite.rs        # Signal-Aggregation
      evaluation.rs       # Strategy-Metriken (Sharpe, Drawdown)
    backtest/             # Spaeter (Phase 3)
      mod.rs
      engine.rs
      portfolio.rs
    cache/                # OHLCV-Cache (Phase 1-2, Sek. 5b)
      mod.rs
      ohlcv_store.rs      # redb Key-Value Store
      ttl.rs              # TTL-Policy (Intraday/Daily/Weekly)
  python/                 # PyO3-Bindings
    Cargo.toml            # cdylib Target
    src/
      lib.rs              # #[pymodule] Definitionen
  wasm/                   # WASM-Bindings (Phase 2)
    Cargo.toml
    src/
      lib.rs              # #[wasm_bindgen] Exports
```

---

## 3. Stark empfohlen: Kand als Basis evaluieren

### Was ist Kand

[Kand](https://github.com/kand-ta/kand) ist eine Rust Technical Analysis Library (Dezember 2025, aktiv maintained) mit:

- SMA, EMA, WMA, RSI, MACD, OBV, VWAP, Supertrend und mehr
- PyO3 Python-Bindings mit ~7ns Overhead und Zero-Copy NumPy Integration
- WASM-Bindings fuer Browser
- O(1) Incremental Updates fuer Real-time (kein Re-Calc der ganzen Serie)
- Result-Types mit NaN-Detection und Error Handling
- GIL-free fuer thread-safe parallele Ausfuehrung
- Feature-Flags fuer Precision-Modi (32-bit/64-bit)

### Empfehlung

Kand als Basis fuer den Rust Indicator Core evaluieren statt alles von Null zu bauen. Die Grundlagen-Indikatoren (SMA, EMA, RSI, MACD, VWAP, OBV) sind abgedeckt. Schwere Patterns (Elliott Wave, Harmonic, Candlestick) muessten trotzdem selbst implementiert oder aus anderen Quellen portiert werden.

### Evaluierungs-Checkliste

- [ ] Kand lokal bauen und testen (`cargo test`)
- [ ] PyO3-Bindings gegen unseren indicator-service testen
- [ ] WASM-Build gegen unsere Frontend-Indikatoren benchmarken
- [ ] API-Kompatibilitaet mit unserem OHLCV-Format pruefen
- [ ] Fehlende Indikatoren identifizieren (ADX, Ichimoku, Keltner, HMA, etc.)
- [ ] Lizenz pruefen (MIT/Apache erwartet)

### Alternative: VectorTA

[VectorTA](https://vectoralpha.dev/projects/ta/) implementiert 194+ Indikatoren in Rust mit CUDA und SIMD (AVX2/AVX-512). Deutlich umfangreicher als Kand, aber komplexer. Evaluieren falls Kand nicht ausreicht.

---

## 4. Sinnvoll mittelfristig: WASM fuer leichte Frontend-Indikatoren

### Aktueller Stand

23 Indikatoren in `src/lib/indicators/index.ts` (1122 Zeilen):
SMA, EMA, WMA, RSI, Stochastic, MACD, Bollinger, ATR, HMA, ADX, Ichimoku, Parabolic SAR, Keltner, Volume Profile, VWAP, VWMA, SMA+ATR Channel, Support/Resistance, SMA Cross Events, RVOL, OBV, CMF, Heartbeat Analysis.

### Entscheidung

Schwere Indikatoren werden ins Python-Backend verschoben. Leichte bleiben im Frontend. Die Frage: Brauchen die leichten WASM?

### Antwort: Nicht sofort, aber mittelfristig ja

Bei 5000 Bars ist ein einzelner SMA in JavaScript unter 1ms. Das ist kein Bottleneck.

WASM lohnt sich wenn:
- Viele Indikatoren gleichzeitig aktiv sind (16 Toggles in der Right Sidebar)
- Sehr lange Historien geladen werden (50.000+ Bars)
- Echtzeit-Streaming mit Re-Calc auf jedem Tick laeuft
- Incremental Updates gewuenscht sind (O(1) statt O(n) bei jedem neuen Bar)

### Benchmarks (SOTA 2026)

| Methode | Faktor vs. JS | Quelle |
|---------|--------------|--------|
| Rust WASM (wasm-bindgen) | 3-5x schneller | byteiota.com 2025 Benchmarks |
| Rust WASM (raw, ohne Bindings) | 8-10x schneller | byteiota.com 2025 Benchmarks |
| Rust WASM + SIMD | 10-15x schneller | dev.to Benchmarks |

### Integration

```
React Component
    |
    v import
wasm-pack generiertes npm-Paket (TypeScript-Types automatisch)
    |
    v call
Rust WASM Modul (gleicher Code wie PyO3-Backend, anderes Build-Target)
```

wasm-bindgen generiert automatisch `.d.ts` TypeScript-Definitionen. Kein manuelles Type-Mapping noetig.

---

## 5. Sinnvoll mittelfristig: Backtesting Engine

### Aktueller Stand

Zwei Executors in `go-backend/internal/services/backtest/`:
- `SimulatedExecutor` -- Fake-Ergebnisse fuer Entwicklung (Hash-basiert, deterministisch)
- `GCTExecutor` -- Realer GoCryptoTrader Backtester via gRPC (`btrpc.ExecuteStrategyFromFile`)

Manager-Pattern mit Run-Lifecycle: Queued -> Running -> Completed/Failed/Canceled.

### Warum Rust hier mittelfristig Sinn macht

- CPU-bound: Tausende Trades ueber Jahre simulieren
- Speicher-sensitiv: Grosse Zeitreihen im RAM halten
- Determinismus kritisch: Gleiche Inputs muessen gleiche Outputs liefern
- Parallelismus: Multi-Strategy-Evaluation via Rayon
- Shared Code: Nutzt direkt den Rust Indicator Core (kein Netzwerk-Roundtrip)

### Warum NICHT im Go-Layer (trotz gutem Network Layer)?

Der Go Data Router ([`go-research-financial-data-aggregation-2025-2026.md`](./go-research-financial-data-aggregation-2025-2026.md)) ist korrekt als **Datenlieferant** positioniert. Backtesting dort einzubauen waere falsch:

| Aspekt | Go | Python + Rust Core |
|---|---|---|
| CPU-Performance | 2.7x langsamer als Rust (Pereira 2017) | Rust-nativ |
| ML-Ecosystem | Nicht vorhanden | PyTorch, scipy, quantstats, pyfolio |
| Indikator-Zugriff | Netzwerk-Roundtrip zu Python noetig | Direkt im Prozess (PyO3, zero-copy) |
| Strategy-Definition | Boilerplate-heavy in Go | Python-DSL natuerlich lesbar |
| Reporting/Tearsheets | Manuell implementieren | Polars + quantstats (via `.to_pandas()` Fallback) out-of-the-box |

Go liefert die historischen OHLCV-Daten (15+ Quellen, adaptive Gesundheitsmessung). Die Berechnung darauf passiert in Python + Rust Core.

### SOTA-Referenz: Nautilus Trader

[Nautilus Trader](https://nautilustrader.io/) (v1.215+, aktiv 2026) validiert exakt dieses Architektur-Pattern:

| Aspekt | Nautilus Trader | Unser Ansatz |
|---|---|---|
| **Core Engine** | Rust (`nautilus_core/`) | `rust-core/` (Kand/eigener Core) |
| **Python Bindings** | PyO3 (Cython teilweise migriert zu PyO3) | PyO3 0.28 (GIL-free) |
| **Orchestrator** | Python (Strategy, Event-Loop, Reporting) | Python (FastAPI, Strategy-DSL) |
| **Parallelismus** | Tokio async + Rayon | Rayon (Data-Parallelism) |
| **Determinismus** | Garantiert (gleiche Inputs = gleiche Outputs) | Gleiches Ziel |
| **Live + Backtest** | Gleicher Code fuer beide Modi | Schrittweise (Backtest zuerst) |
| **Multi-Venue** | 20+ Adapter (Binance, IB, Betfair) | GCT (30+ Exchanges) + Data Router |

Nautilus Trader hat gezeigt, dass Cython-zu-PyO3-Migration messbare Speedups bringt und Python als Strategy-Orchestrator bei Rust-Core skaliert. Ihr Architektur-Split (Rust: Matching/Accounting/OrderBook, Python: Strategy/Risk/Reporting) ist der Referenz-Standard 2026.

### SOTA-Referenz 2: AKQuant (leichtgewichtig, Walk-Forward)

[AKQuant](https://akquant.akfamily.xyz/en/) (v0.1.42+, aktiv 2026) validiert denselben Rust+PyO3-Ansatz mit Fokus auf Einfachheit und ML-Integration:

| Aspekt | AKQuant | Unser Ansatz | Nautilus Trader |
|---|---|---|---|
| **Core Engine** | Rust (PyO3-exposed) | `rust-core/` (Kand/eigener Core) | Rust (`nautilus_core/`) |
| **Speed** | **20x schneller als Backtrader** (152k Bars/sec bei SMA-Strategy) | Gleiches Ziel | Vergleichbar |
| **Zero-Copy** | PyO3 Buffer Protocol + NumPy Views | PyO3 0.28 + Arrow (Polars) | PyO3 |
| **Walk-Forward-Validation** | Built-in Framework mit sklearn/PyTorch Adapter | Geplant (Phase 3+) | Nicht built-in |
| **Risk Management** | `RiskManager` im Rust-Layer (interceptiert Orders vor Execution) | Geplant (Phase 3) | Ja |
| **Market Models** | Pluggable (A-Share T+1, Futures T+0) | Erweiterbar (Aktien/Forex/Crypto) | 20+ Venues |
| **Komplexitaet** | Niedrig (Einsteigerfreundlich) | Mittel | Hoch |

**Was wir von AKQuant lernen:**

1. **Risk-Intercept im Rust-Layer:** AKQuant prueft Order-Limits direkt in Rust bevor sie an Python zurueckgehen. Das ist sicherer als Python-seitige Checks. Unser `rust-core/src/backtest/` sollte dasselbe Pattern implementieren
2. **Walk-Forward als First-Class Feature:** AKQuant hat Walk-Forward-Validation (Train auf historischen Daten → Test auf Out-of-Sample) als eingebautes Feature. Fuer unsere ML-Strategien (Regime Detection, Elliott-ML) ist das essentiell
3. **Incremental Indicators im Engine-Layer:** AKQuant berechnet Indikatoren inkrementell innerhalb der Rust-Engine, nicht als separaten Call. Unser Kand-Core macht dasselbe (O(1) Updates) -- bestaetigt den Ansatz
4. **Streaming CSV fuer grosse Historien:** AKQuant laedt grosse Dateien mit minimalem RAM. Relevant fuer unseren redb-Cache (Sek. 5b): Streaming aus dem Cache statt alles in RAM laden

### Evaluation: EIN Backtester fuer alles (Rust+Python) vs. GCT-Backtester behalten

> **Kernfrage:** Der Go Data Router liefert Daten via HTTP an den Rust+Python Backtester. GCT kann Daten via gRPC liefern. Gleicher Pattern, kein CGO. Warum also nicht den GCT-Backtester komplett durch den Rust+Python Backtester ersetzen?

**Analyse:** CGO ist kein Argument. Weder der Go Gateway noch GCT brauchen CGO um mit dem Python/Rust Backtester zu kommunizieren. Der Datenfluss ist identisch:

```
Aktien/Forex:  Go Data Router ──HTTP──► Python/Rust Backtester (lokal rechnen)
Crypto:        GCT            ──gRPC──► Python/Rust Backtester (lokal rechnen)
```

In beiden Faellen: Daten werden EINMAL geholt (ein HTTP/gRPC-Call), danach laeuft der gesamte Backtest lokal in Python+Rust ohne weitere Go-Kommunikation. Kein CGO, kein In-Process-FFI, kein Performance-Problem.

**Der einzige verbleibende Grund fuer GCT's Backtester** ist Exchange-spezifische Simulationslogik die tief in GCT steckt (~2000 LoC):

| GCT-Simulationslogik | Was sie tut | Portierungsaufwand |
|---|---|---|
| Funding Rates | Futures-Positionen kosten alle 8h eine Fee, pro Exchange verschieden | Mittel (~200 LoC) |
| Liquidation | Leverage-basierte Zwangsliquidation, Exchange-spezifische Regeln | Mittel (~300 LoC) |
| Collateral-Management | Welche Assets als Sicherheit akzeptiert werden, pro Exchange | Mittel (~200 LoC) |
| Position Sizing | Min/Max Order Size pro Exchange, BuySide/SellSide Limits | Niedrig (~100 LoC) |
| Slippage (Exchange-aware) | Orderbook-basierte Slippage vs. statistische Schaetzung | Niedrig (~50 LoC) |
| BinanceCashAndCarry | Exchange-spezifische Arbitrage-Strategie | Niedrig (Nische) |

**Entscheidung: Phasenweise Migration zu EINEM Backtester**

| Phase | Was passiert | GCT-Backtester Status |
|---|---|---|
| **Jetzt** | Rust+Python Backtester fuer Aktien/Forex/Commodities + einfache Crypto-Backtests (Buy/Sell mit Flat-Fee) | GCT bleibt fuer komplexe Crypto-Szenarien |
| **Mittelfristig** | Funding-Rate-Simulation und Liquidation im Rust Core nachbauen (nach Nautilus-Trader-Vorbild, die haben das geloest) | GCT-Backtester wird weniger gebraucht |
| **Langfristig** | Volle Exchange-Simulation im Rust Core, GCT liefert nur noch Daten via gRPC | GCT-Backtester faellt weg |

**Fazit:** Das Ziel ist EIN Backtester (Python+Rust) fuer alle Asset-Klassen. GCT's Backtester ist ein Uebergangsartefakt, kein Architektur-Ziel. Er bleibt nur so lange wie die Exchange-Simulationslogik noch nicht im Rust Core existiert.

### Datenfluss (Zielbild)

```
Datenquellen (Go, einmaliger Abruf)          Backtester (Python + Rust, lokal)
┌──────────────────────────────┐            ┌──────────────────────────────┐
│ Go Data Router (Port 9060)   │            │ Python Orchestrator          │
│   Polygon, Yahoo, Finnhub,  │──HTTP/──►  │   Strategy-Definition        │
│   FRED, ECB, Tiingo...      │  gRPC      │   Event-Loop (OnBar/OnFill)  │
│                              │  (EINMAL)  │   ML-Signal-Integration      │
│ GCT (gRPC 9052)             │            │   Reporting (quantstats)     │
│   Binance, Kraken, Coinbase │──gRPC──►   │                              │
│   30+ Crypto-Exchanges      │  (EINMAL)  │ Rust Core (PyO3, im Prozess) │
└──────────────────────────────┘            │   Indikator-Engine (Kand)    │
                                            │   Trade-Matching-Simulation  │
Danach: Go ist raus.                        │   Metriken (Sharpe, DD...)   │
Alles laeuft lokal in                       │   Rayon-parallel             │
Python + Rust.                              │   Exchange-Sim (spaeter)     │
                                            └──────────────────────────────┘
```

### Drei Deployment-Targets

1. **Native CLI**: Schnellstes Target, fuer Batch-Backtests
2. **Service** (Axum): HTTP-API, integrierbar in den Go-Gateway
3. **WASM**: Quick-Backtests direkt im Browser (mit Memory64 auch grosse Historien)

---

## 5a. Sinnvoll mittelfristig: Polars als DataFrame-Layer

> **Update 2026-02-19:** Neue Sektion. Polars wurde als fehlender Baustein identifiziert -- Rust-nativer DataFrame-Layer der pandas in unserem Stack von Anfang an ersetzt.
> **Buch-Referenz:** Das Buch *Deep Learning with Rust* (Kap. 4.4.2, L3188-3207) vergleicht CSV-Datenverarbeitung in Python (pandas) vs. Rust (ndarray + csv Crate) und zeigt: Rust vermeidet Zwischen-Allokationen, profitiert von SIMD/Loop-Unrolling via LLVM, und kann Millionen Zeilen parallel via Rayon verarbeiten. Polars baut genau auf diesen Vorteilen auf (Rust-Kern, Arrow statt NumPy, native Parallelisierung) und macht sie ueber ein DataFrame-API zugaenglich -- ohne dass wir rohes ndarray+csv schreiben muessen.

### Ausgangslage: Wir nutzen pandas (noch) kaum

pandas 2.3/3.0 ist zwar in `uv.lock` als Dependency vorhanden (transitiv ueber andere Pakete), aber unser Code importiert pandas nirgends direkt. Das ist der ideale Zeitpunkt: Polars von Anfang an einsetzen statt spaeter eine pandas→Polars Migration durchfuehren.

### Was ist Polars

[Polars](https://pola.rs/) ist ein in Rust geschriebenes DataFrame-Framework mit Python-Bindings:

| Eigenschaft | pandas | Polars |
|---|---|---|
| Kern-Sprache | C/Cython | **Rust** |
| Parallelismus | Single-threaded (GIL) | **Native Multi-Core** (Rayon) |
| Memory-Backend | NumPy | **Apache Arrow** (Zero-Copy) |
| Lazy Evaluation | Nein | **Ja** (Query-Optimierung) |
| Speed (Finance-Ops) | Baseline | **10-100x schneller** (RocketEdge 2025 Benchmarks) |
| OHLCV-Timeseries | `pd.resample()` | `group_by_dynamic()`, native |
| Streaming/Large Files | Nein (alles in RAM) | **Ja** (Streaming CSV/Parquet) |

### Warum Polars statt pandas (Entscheidung: JA, direkt Polars)

1. **Kein Migrations-Aufwand:** Wir haben keinen bestehenden pandas-Code → kein Rewrite noetig
2. **Rust-Alignment:** Polars ist Rust-nativ und passt in unsere Rust-Strategie (gleiche Sprache wie rust-core, PyO3, Kand)
3. **OHLCV-Verarbeitung:** Databento hat gezeigt dass Polars + PyO3 fuer Tick→Bar-Aggregation (OHLCV) die performanteste Python-Loesung ist
4. **Arrow Zero-Copy:** Polars DataFrames koennen ohne Serialisierung an Rust-Funktionen uebergeben werden (gleicher Arrow-Memory-Layout wie rust-core)
5. **Lazy Execution:** Query-Optimierer reorganisiert Operationen (Predicate Pushdown, Projection Pruning) -- bei grossen OHLCV-Historien (50k+ Bars) relevant

### Wo Polars eingesetzt wird

| Service | Aktuell | Mit Polars |
|---|---|---|
| `indicator-service` (Port 8092) | Rohe Python-Listen/NumPy | Polars DataFrame als Standard-Datenstruktur fuer OHLCV |
| `finance-bridge` (Port 8081) | Python-Dicts | Polars fuer Portfolio-Daten, Korrelations-Matrizen |
| Backtester (Phase 3) | -- (geplant) | Polars fuer Trade-Log, Performance-Metriken, Tearsheets |
| Geo-Map Soft-Signals (Port 8091) | Python-Listen | Polars fuer Candidate-Aggregation, Dedup-Batch-Ops |

### Ecosystem-Integration

```
Polars DataFrame (Arrow-backed)
  |
  +-- PyO3 Zero-Copy ──► rust-core (Kand, Indicators, Patterns)
  |                        gleicher Arrow Memory Layout
  |
  +-- .to_pandas() ──► Legacy-Libraries die pandas brauchen (quantstats, pyfolio)
  |                     Fallback, nicht Normalfall
  |
  +-- .write_parquet() ──► Persistierung (effizienter als CSV/JSON)
  |
  +-- polars-ta-extension ──► TA-Lib Wrapper direkt auf Polars Series
```

### Polars-spezifische Crates (Rust-Seite)

| Crate | Funktion | Relevanz |
|---|---|---|
| `polars` (Rust) | DataFrame-Engine direkt in Rust (ohne Python) | Fuer den Rust Backtester (Phase 3): Trades, Metriken, Reporting direkt in Rust |
| `polars-arrow` | Arrow-Interop | Zero-Copy zwischen Polars Python und rust-core |

### Phase und Prioritaet

**Phase 1 (parallel zu PyO3-Core):** Polars als Standard-DataFrame in `indicator-service` und `finance-bridge` einfuehren. Alle neuen Endpoints nutzen `pl.DataFrame` statt `list[dict]` oder pandas.

**Phase 3 (Backtester):** Rust-seitiger Polars fuer Trade-Logs und Performance-Reports direkt im Backtester ohne Python-Roundtrip.

### Evaluierungs-Checkliste

- [ ] `polars` in `indicator-service` Dependency hinzufuegen (`uv add polars`)
- [ ] OHLCV-Datenstruktur als `pl.DataFrame` definieren (Schema: date, open, high, low, close, volume)
- [ ] Benchmark: `group_by_dynamic` vs. manuelle Rolling-Window-Berechnung
- [ ] PyO3 Zero-Copy Test: Polars DataFrame → rust-core Arrow Arrays
- [ ] quantstats/pyfolio Kompatibilitaet via `.to_pandas()` Fallback pruefen

---

## 5b. Sinnvoll mittelfristig: Embedded OHLCV-Cache (redb)

> **Update 2026-02-19:** Neue Sektion. Lokaler OHLCV-Cache als Rust-native Embedded DB eliminiert redundante API-Calls und beschleunigt Backtesting/Indikator-Berechnung erheblich.
> **Buch-Referenz:** Kap. 6.4.1 (L4370-4410, Listing 6.1) zeigt das Producer-Consumer-Pattern mit `mpsc::channel` fuer paralleles Laden und Verarbeiten von Daten-Batches in Rust. Genau dieses Pattern wenden wir auf den Cache an: ein Hintergrund-Thread laedt bei Cache-Miss Daten vom Go Data Router, waehrend der Haupt-Thread bereits aus dem Cache liest. Kap. 4.4.1 (L3169-3187) erklaert warum Rust hier schneller ist: keine GC-Pausen, effizientes Memory-Layout, weniger Cache-Misses bei sequentiellen OHLCV-Reads.

### Problem

Jeder Backtest, jede Indikator-Berechnung und jeder Timeframe-Wechsel holt aktuell OHLCV-Daten via HTTP vom Go Data Router (Port 9060), der wiederum externe APIs aufruft (Yahoo, Finnhub, Polygon, etc.). Das bedeutet:

1. **Redundante Netzwerk-Calls:** Gleiche Daten werden mehrfach geholt (verschiedene Indikatoren, verschiedene Zeitpunkte)
2. **API-Rate-Limits:** Go Data Router hat Rate-Budgets die durch Cache-Misses schneller erschoepft werden
3. **Latenz bei Backtests:** Historische Daten aendern sich nicht -- trotzdem wird jedes Mal neu gefetcht
4. **Kein Offline-Modus:** Ohne Netzwerk keine Berechnung moeglich

### Loesung: Rust Embedded Key-Value Store

Ein lokaler OHLCV-Cache der einmal gefetchte Daten persistent speichert. Rust-native DB ohne externen Server.

### Evaluation: redb vs. sled vs. SurrealKV

| Eigenschaft | redb | sled | SurrealKV |
|---|---|---|---|
| **Architektur** | Copy-on-Write B-Tree (LMDB-inspiriert) | Lock-Free B-Tree | LSM-Tree |
| **ACID** | Ja | Ja | Ja |
| **Write Performance** | **920ms** (Benchmark) | 2,701ms | Gut (keine direkten Vergleichszahlen) |
| **Read Performance** | 934ms | Schnell | Schnell |
| **Multi-Thread Reads** | 410ms (32 Threads) | Gut | Gut |
| **Pure Rust** | Ja | Ja | Ja |
| **Stabilitaet** | Stabil, stable File Format | Bekannte Bugs (sled 1.0 nie released) | Aktiv, aber SurrealDB-gebunden |
| **Dependencies** | Minimal | Minimal | Mehr (SurrealDB-Ecosystem) |
| **Empfehlung** | **Erste Wahl** | Nicht empfohlen (Maintenance-Risiko) | Overkill fuer Key-Value OHLCV |

**Entscheidung: redb** -- einfachstes API, schnellste Writes, stabiles File-Format, pure Rust, keine Altlasten.

### Datenmodell

```
Key:   "{symbol}:{timeframe}:{date}"     z.B. "AAPL:1D:2024-01-15"
Value: OHLCV struct (bincode-serialisiert, ~40 Bytes pro Bar)

Alternativ fuer Batch-Reads:
Key:   "{symbol}:{timeframe}"
Value: Vec<OHLCV> (gesamte Historie, komprimiert mit LZ4)
```

### Architektur-Integration

```
                                    redb OHLCV Cache
                                    ┌─────────────────────┐
                                    │ Symbol:TF → Vec<Bar> │
Go Data Router (Port 9060)          │ TTL-Metadata          │
  Polygon, Yahoo, Finnhub ──HTTP──► │ ~500MB fuer 5 Jahre   │
  (nur bei Cache-Miss)              │ 10k Symbole, 1D Bars  │
                                    └──────────┬────────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                     indicator-service    Rust Backtester    WASM Frontend
                     (PyO3, Zero-Copy)   (native, direkt)   (optional)
```

### Wo der Cache lebt

| Option | Vorteil | Nachteil |
|---|---|---|
| **Im rust-core (PyO3)** | Gleicher Prozess wie Indicator-Service, zero-copy | Gekoppelt an Python-Service |
| **Eigener Micro-Service** | Unabhaengig, auch vom Backtester nutzbar | Netzwerk-Overhead |
| **Library-Crate** | `rust-core/src/cache/` als shared Modul, jeder Consumer bindet es ein | **Empfohlen:** flexibel, kein Netzwerk, jeder Build-Target kann cachen |

**Empfehlung:** `rust-core/src/cache/` als Library-Modul. PyO3-Service, nativer Backtester und CLI nutzen alle denselben Cache.

### Verbundene Layer

- **Go:** Data Router wird zum Write-Through-Quelle. Bei Cache-Miss holt er die Daten und schreibt sie via PyO3/HTTP in den Cache
- **Python:** `indicator-service` liest OHLCV aus Cache statt via HTTP. Cache-Hit: <1ms, Cache-Miss: 200-2000ms (API-Call)
- **React:** Profitiert indirekt durch schnellere Antwortzeiten bei Timeframe-Wechsel
- **Backtester:** Groesster Profiteur -- historische Daten fuer Multi-Year-Backtests liegen lokal vor

### Phase und Prioritaet

**Prioritaet: Mittel-Hoch** (hoeher als Geo-Map Backend, da es ALLE Services beschleunigt)

**Phase 1-2 (parallel zu PyO3-Core):**
1. `rust-core/src/cache/mod.rs` mit redb implementieren (~150 LoC)
2. Write-Pfad: Go Data Router → HTTP → Python → PyO3 → redb
3. Read-Pfad: Python → PyO3 → redb (Cache-Hit) oder Go (Cache-Miss)
4. TTL-Policy: Intraday-Daten 5min, Daily 24h, Weekly/Monthly unbegrenzt

**Phase 3 (Backtester):**
5. Nativer Rust-Backtester liest direkt aus redb (kein Python-Roundtrip)
6. Bulk-Import: CLI-Tool das historische Daten in den Cache laedt

### Evaluierungs-Checkliste

- [ ] `redb` Crate in `rust-core/Cargo.toml` hinzufuegen
- [ ] OHLCV Schema definieren (bincode/rkyv Serialisierung)
- [ ] Benchmark: Cache-Read vs. HTTP-Fetch fuer 5000 Bars
- [ ] TTL-Logik implementieren (Metadata-Table in redb)
- [ ] Speicherverbrauch messen: 10k Symbole × 5 Jahre Daily × 40 Bytes
- [ ] Concurrent-Read-Test: indicator-service + Backtester gleichzeitig

---

## 6. Optional langfristig: Chart Engine Compute Layer

### Aktueller Stand

`src/chart/engine/ChartEngine.ts` (581 Zeilen): Canvas 2D Rendering mit 9 Layern (Background, Grid, Candle, Volume, Indicator, Crosshair, Drawing, PriceScale, TimeScale). Funktioniert gut fuer 5000 Bars.

### Wo Rust helfen koennte

Nicht das Rendering selbst (DOM/Canvas-Interaktion hat hohen JS-WASM-Bridge-Overhead), sondern die Datenaufbereitung vor dem Rendering:

- Viewport-Culling (welche Candles sind sichtbar?)
- Coordinate-Transformation (Preis zu Pixel, linear/log)
- Volume-Profile Aggregation
- Drawing-Intersection-Tests
- Auto-Range-Berechnung

Diese sind reine Berechnungen ohne DOM-Zugriff -- geeignet fuer WASM.

### Alternative: ChartGPU (kein Rust noetig)

[ChartGPU](https://github.com/ChartGPU/ChartGPU) (Januar 2026) ist eine TypeScript-Library die WebGPU fuer Finanz-Charts nutzt:
- Candlestick Charts mit Millionen Datenpunkten bei 120+ FPS
- Streaming via `appendData()` fuer Live-Updates
- LTTB + OHLC Sampling
- Crosshair, Tooltips, Zoom
- React-Integration via `chartgpu-react`

Evaluation-Entscheidung: ChartGPU koennte den Performance-Gewinn bringen ohne Rust-Komplexitaet. Nur wenn ein nativer Desktop-Chart (Tauri + wgpu) gewuenscht ist, waere ein Rust-Rendering-Layer sinnvoll.

---

## 7. Optional langfristig: Tauri v2 Desktop App

> **Wichtige Möglichkeit:** Tauri v2 ist nicht nur Desktop (Win/Mac/Linux), sondern auch **Mobile (Android, iOS)** aus einer Codebase. React-Frontend bleibt 1:1, Rust-Backend (Indicator Core, Backtester) läuft nativ. 3-10 MB statt 250 MB (Electron). SOTA 2026 für plattformübergreifende Apps mit Rust-Backend.

### Warum relevant

Tauri v2 ermoeglicht eine Desktop-Version von TradeView Fusion mit:

| Eigenschaft | Tauri v2 | Electron |
|------------|---------|---------|
| App-Groesse | 3-10 MB | 100-250 MB |
| RAM (idle) | 30-50 MB | 150-300 MB |
| Backend | Rust (nativ) | Node.js |
| Rendering | System WebView | Bundled Chromium |
| Mobile | iOS + Android (v2) | Nein |

### Architektur

```
Tauri Desktop App
  Frontend: React/Next.js (im System WebView, 1:1 bestehender Code)
  Rust Backend:
    Indicator Core (nativ, kein WASM-Overhead)
    Lokaler Backtester (Rayon-parallel)
    Direct Exchange Connections (optional)
    SQLite / Local Storage
```

### Voraussetzung

Rust Indicator Core muss zuerst stehen (Phase 1-2). Dann ist der Schritt zu Tauri inkrementell.

### Bekannte Einschraenkung (SOTA 2026)

Tauri nutzt das System-WebView (WebKit auf Mac, WebView2/Edge auf Windows, WebKitGTK auf Linux). Divergenzen zwischen diesen Engines koennen UI-Bugs verursachen. Fuer eine Trading-App mit primaer Desktop-Nutzung (Chrome-aehnliches Verhalten auf Windows/Mac) ist das akzeptabel.

---

## 8. Beobachten: Rust AI Agent Frameworks

### Stand Februar 2026

Neue Rust-Frameworks fuer AI Agents:
- **ADK-Rust** ([adk-rust.com](https://www.adk-rust.com/)): Multi-Agent Workflows, Model-agnostic (Gemini, OpenAI, Anthropic), Visual Workflow Design
- **AgentSDK** ([agentsdk.build](https://www.agentsdk.build/)): Type-safe, async-first, Streaming, Observability, Multi-Model-Routing
- **AiRust**: Trainable, local-first Agents, PDF-Extraction, Context Memory

### Relevanz fuer uns

Unsere Soft-Signal-Pipelines (cluster-headlines, social-surge, narrative-shift) und Game-Theory-Analyse koennten langfristig als Multi-Agent-System in Rust laufen. Vorteile: Determinismus, Speicher-Effizienz, Compiler-Safety.

### Empfehlung: Beobachten, aber AI-Safety-Layer ist schon jetzt relevant

Python-Ecosystem fuer ML/AI (HuggingFace, PyTorch, Sentiment-Modelle wie FinBERT/FinGPT/XLM-R) ist 2026 noch unangreifbar. Rust AI Agents sind fuer Orchestrierung interessant, nicht fuer Model-Inference. Fruehestens 2027 erneut evaluieren.

**Aber:** Der untenstehende AI-Safety-Layer-Aspekt ist *schon heute* relevant und wird 2026 immer wichtiger, unabhaengig davon ob wir Rust-Agent-Frameworks einsetzen.

### Rust Compiler als AI-Safety-Layer (2026: zunehmend kritisch)

> **Buch-Referenz:** Kap. 3.5 "Memory Safety in AI Workflows" (L2746-2901) ist die ausfuehrlichste Quelle hierzu. Das Buch argumentiert: "AI workflows often manipulate large datasets, tensors, or model parameters in memory-intensive environments. In memory-unsafe languages such as C or C++, a single invalid pointer dereference or use-after-free bug can silently corrupt training data [...] By enforcing memory safety at compile time, Rust eliminates entire classes of runtime errors without sacrificing performance." Kap. 3.6 (L2903-3002) demonstriert Ownership fuer Data Handling mit konkretem Pipeline-Beispiel. Kap. 4.2 (L3102-3113) fasst die Safety-Argumentation im DL-Kontext zusammen.

Unabhaengig von Agent-Frameworks: Wenn AI-Agents (Claude, GPT, Codex) zunehmend Code fuer unser Projekt generieren -- und das tun sie bereits jetzt --, faengt Rust's Compiler eine ganze Klasse von Bugs ab die in Python/JS/Go durchrutschen:

| Bug-Klasse | Python/JS | Go | Rust |
|---|---|---|---|
| Null/None-Dereferenzierung | Runtime Crash | Runtime Panic | **Compile Error** (Option<T>) |
| Data Race (Multi-Threading) | Silent Corruption | `go test -race` (Runtime) | **Compile Error** (Send + Sync) |
| Buffer Overflow | Runtime | Runtime | **Compile Error** (Bounds Check) |
| Use-After-Free | Garbage Collected | Garbage Collected | **Compile Error** (Ownership) |
| Type Confusion | Runtime (duck typing) | Compile (partial) | **Compile Error** (strict) |

**Warum das 2026 zunehmend wichtig ist:**

1. **AI-generierter Code wächst:** Mehr Rust-Code im `rust-core` = mehr Compiler-gepruefte Safety fuer AI-generierten Code in Performance-kritischen Pfaden (Indikatoren, Backtesting, Cache)
2. **Kore-Projekt-Validierung:** DeepSeek-R1 fine-tuned auf Rust-aehnlicher Sprache erreicht 99.6% Korrektheit, weil der Compiler als Reward-Signal dient. Unsere Rust-Module profitieren davon implizit
3. **Financial Safety:** Falsche Indikator-Berechnung oder Race Condition im Backtester kann zu falschen Trading-Entscheidungen fuehren. Rust's Compiler ist hier ein zusaetzlicher Sicherheits-Layer den Python/Go nicht bieten
4. **Guardrails fuer unsere eigene AI-Pipeline:** Wenn unser Geo-Map Transformer (DL-7) oder Regime-LSTM (DL-6) in Rust inferiert, verhindert der Compiler Memory-Bugs in der Inference-Pipeline. In Python wuerde ein Shape-Mismatch erst zur Runtime auffallen

**Konkreter Einfluss auf unsere Architektur-Entscheidungen:**
- Jeder neue numerische/kritische Pfad sollte bevorzugt in `rust-core` landen (nicht in Python), auch wenn Python "schneller zu schreiben" waere
- AI-Tools (Claude, Cursor) schreiben Rust fuer `rust-core` → Compiler prueft automatisch → sicherer als AI-generierter Python-Code
- Langfristig: Mehr Code in Rust = groessere Safety-Abdeckung fuer das Gesamtprojekt

---

## 9. Nicht einbauen: Go Gateway ersetzen

### Entscheidung: Nein

### Begruendung

Der Go-Gateway (`go-backend/`) ist gut strukturiert mit:
- Sauberer Connector-Architektur (GCT, ECB, Finnhub, FRED, ACLED, GDELT, CrisisWatch, News)
- SSE-Streaming via Goroutines
- gRPC-Integration zu GoCryptoTrader
- Quote-Aggregation ueber mehrere Quellen
- Getestete Quality-Gates (`go test`, `go vet`, `go test -race`)

Die Arbeit die der Gateway macht (API-Calls aggregieren, JSON mappen, SSE forwarden) ist I/O-bound, nicht CPU-bound. Rust's Staerken (Memory-Safety, CPU-Performance) bringen hier keinen messbaren Vorteil gegenueber Go's exzellentem Concurrency-Modell.

Axum (Rust Web Framework) ist 2026 zwar deutlich besser geworden (v0.8, keine async_trait-Dependency mehr, OpenAPI via Utopia), aber ein Rewrite eines funktionierenden Go-Gateways hat negativen ROI.

### Ausnahme

Wenn ein komplett neuer Microservice gebaut wird (z.B. dedizierter Backtesting-Service), ist Axum eine legitime Option neben Go. Nicht als Ersatz, sondern als Ergaenzung.

---

## 10. Nicht einbauen: Python ML/AI ersetzen

### Entscheidung: Nein (nur PyO3-Bindings fuer Rechenlogik)

### Begruendung

| Aspekt | Python | Rust | Go |
|--------|--------|------|-----|
| ML Libraries | PyTorch, TensorFlow, scikit-learn | tch-rs (Wrapper), candle (experimental) | goml (minimal) |
| NLP / Sentiment (FinBERT, FinGPT, XLM-R etc.) | HuggingFace Transformers (komplett) | rust-bert (limitiert) | Nichts brauchbares |
| Data Science | pandas, numpy, scipy (20+ Jahre) | **Polars** (Rust-nativ, unser Standard -- Sek. 5a), numpy via ndarray | Nichts vergleichbar |
| Pretrained Models | 99% aller Models verfuegbar | ~1% portiert | ~0.1% portiert |

Unsere AI-Pipelines (Sentiment-Modelle -- siehe [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 18.2 fuer Optionen, Narrative-Analyse, Game-Theory-Impact, Elliott-Wave-ML) brauchen dieses Ecosystem. Rust ersetzt Python hier nicht.

Was Rust tut: Die rechenintensiven Teilschritte innerhalb der Python-Pipelines beschleunigen (via PyO3). Python bleibt Orchestrator und ML-Runtime.

### Go-Rust Bindings als Python-Ersatz?

Technisch moeglich (ueber CGO + Rust C-FFI oder gRPC). Aber: Go hat kein ML-Ecosystem. Und Go-Rust-FFI via CGO ist fehleranfaellig und verliert Go's Garbage-Collection-Vorteile. Nicht empfohlen.

---

## 11. Nicht einbauen: React Frontend ersetzen

### Entscheidung: Nein

### Begruendung

Unser Stack: Next.js 16.1.6 (Turbopack), React 19, TypeScript 5, Tailwind 4, shadcn/ui, Zustand, TanStack Query, Framer Motion. Das React-Ecosystem ist extrem reif:
- UI-Iteration schnell
- Hiring/Community riesig
- Browser-Ecosystem JS-dominiert
- Komponentenbibliotheken (shadcn, Radix) ausgereift

Rust-Frontend-Frameworks (Dioxus, Leptos, Yew) sind 2026 vielversprechend aber nicht auf diesem Reifegrad. Dioxus hat seit Mitte 2025 einen nativen Renderer, Leptos ist fuer Full-Stack-SSR interessant -- aber beide haben Bruchteile der Komponenten-Libraries und Community.

Rust im Frontend ausschliesslich als WASM-Modul hinter der React-UI, nicht als Ersatz.

---

## 12. Nicht einbauen: GoCryptoTrader ersetzen

### Entscheidung: Nein, und Gateway + GCT getrennt halten

### Begruendung

GoCryptoTrader ist eine vollstaendige Go-Engine die als Vendor-Fork unter `go-backend/vendor-forks/gocryptotrader/` liegt. Sie bietet:
- 30+ Exchange-Connections
- WebSocket-Streams
- Backtester (eigener gRPC-Service, `btrpc`)
- Portfolio-Management
- Order-Execution

Der Gateway ist eine Fassade, GCT ist eine Engine dahinter. Dieses Pattern funktioniert.

### Warum nicht zusammenmergen

1. GCT ist ein Monolith (Exchanges + Wallets + Orders + Backtesting in einem Prozess)
2. Unser Gateway aggregiert aus vielen Quellen (GCT + ECB + Finnhub + FRED + ACLED + GDELT)
3. Entkopplung: GCT-Crash betrifft nicht Macro/Geo/News
4. Vendor-Fork: Upstream-Updates werden schwieriger je mehr eigener Code reinfliesst

### Richtige Strategie

GCT als Service nutzen und mehr Features ueber gRPC/JSON-RPC anzapfen (Live Trading, mehr Exchanges, Portfolio). Nicht den Code rausholen, sondern die API nutzen.

### Ausnahme: GCT-Backtester faellt langfristig weg => muss aber evaluiert werden

Der GCT-Backtester (112 Go-Files, ~5000 LoC) wird langfristig durch den Rust+Python Backtester ersetzt. GCT liefert dann nur noch Crypto-OHLCV-Daten via gRPC -- gleicher Datenfluss wie der Go Data Router fuer Aktien/Forex. Kein CGO noetig. Siehe [Sektion 5: Backtesting Engine -- Evaluation](#5-sinnvoll-mittelfristig-backtesting-engine) fuer die vollstaendige Analyse und Phasenplan.

---

## 13. Geo Map -- Rust fuer Backend Spatial Queries (nicht fuer Rendering)

> **Update 2026-02-19:** Urspruengliche Bewertung "Kein Rust noetig" revidiert nach Rendering-Tiefenanalyse und h3o-Evaluation. Frontend-Rendering bleibt JS/TS (d3-geo → Hybrid → deck.gl). Backend Spatial Queries werden ab v3 in Rust gemacht.
> **Vollstaendige Rendering-Analyse:** Siehe [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.4

### Aktueller Stand

`src/features/geopolitical/MapCanvas.tsx` (599 Zeilen): Reines SVG via d3-geo `geoOrthographic`. Probleme bei Scale: Rotation recomputed alle 50ms den gesamten Map-Model (177 Countries + alle Marker + Drawings), kein Viewport-Culling, kein Clustering, CSS-Transitions auf hunderten SVG-Paths.

### Frontend-Rendering Roadmap (kein Rust)

| Stufe | Phase | Technik | Aufwand |
|---|---|---|---|
| 1 | v1.1 | d3-geo **Canvas + SVG Hybrid** (Canvas fuer Countries/Heatmap, SVG fuer interaktive Marker) + Supercluster.js | 2-3 Tage |
| 2 | v2 | **deck.gl v9.2** (WebGL2, React-Integration, GeoJsonLayer + HeatmapLayer + ScatterplotLayer) | 1-2 Wochen |
| 3 | -- | maplibre-rs (Rust/WASM WebGPU) -- **zu unreif** Stand 02/2026, fruehestens 2027 evaluieren | -- |

### Wo Rust ab v3 reinkommt: Backend Spatial Queries

| Crate | Funktion | Performance | Status |
|---|---|---|---|
| **h3o** (v0.9.4) | H3 Spatial Indexing. Jedes Event bekommt H3-Cell-Index. Radius-Queries via `grid_disk(k)` statt Brute-Force | 26x schneller als JS (h3-js), 7.8x bei Polygon-to-Cell. 837k Downloads | Production-ready |
| **geo-rs** | Geometrie-Operationen (Intersections, Buffer, Distance) | Schneller als Turf.js bei komplexen Operationen | Stabil |
| **petgraph** | Entity Graph Traversal (Actor→Event→Asset→Chokepoint). Wird relevant ab >10k Nodes | O(V+E) BFS/DFS in Rust vs. O(V+E) in JS -- gleich algorithmisch, aber geringerer Overhead | Stabil |

**Deployment-Optionen:**

1. **PyO3-Modul:** h3o als Rust-Funktion im Python-Backend (wie Indicator Core). Geringster Integrationsaufwand
2. **Eigener Rust Microservice:** `geo-query-service` mit REST API. Unabhaengig deploybar
3. **WASM im Next.js Backend:** h3o als WASM-Modul direkt in API Routes. Kein separater Service noetig

**Empfehlung:** Option 1 (PyO3) wenn Python-Backend fuer Geo existiert, sonst Option 3 (WASM in Next.js API Routes) als leichtgewichtigste Loesung.

### Was NICHT in Rust gemacht wird

- Frontend-Rendering: d3-geo → deck.gl Pfad ist etabliert und performant genug
- maplibre-rs: Proof-of-Concept, fehlende Features (Labels, Symbols, 3D Terrain), WebGPU-Abhaengigkeit
- Einfaches Dedup/Hashing: 108 LoC TypeScript reichen, kein CPU-Bottleneck

---

## 14. Technische Konzepte: SIMD, Memory64, FFI

### SIMD (Single Instruction, Multiple Data)

CPU-Anweisung die mehrere Datenpunkte gleichzeitig verarbeitet.

Normaler Code (4 Instruktionen):
```
preis[0] + preis[1] -> Ergebnis 1
preis[2] + preis[3] -> Ergebnis 2
preis[4] + preis[5] -> Ergebnis 3
preis[6] + preis[7] -> Ergebnis 4
```

SIMD (1 Instruktion):
```
[preis[0..4]] + [preis[4..8]] -> [Ergebnis 1..4]
```

Fuer Indikator-Berechnungen extrem relevant (Arrays von Floats: Close-Preise, Volumes). Rust kann SIMD direkt nutzen (AVX2/AVX-512 auf modernen CPUs). WASM unterstuetzt SIMD seit 2024 in allen modernen Browsern. VectorTA zeigt 10-50x Speedup mit SIMD bei grossen Datasets.

### Memory64 (WASM)

Hebt die 4GB-Grenze fuer WebAssembly auf. Stand Februar 2026:

| Browser | Support |
|---------|---------|
| Chrome 133+ | Ja |
| Edge 133+ | Ja |
| Firefox 134+ | Ja |
| Opera 118+ | Ja |
| Safari | Nein |
| Safari iOS | Nein |

Relevant fuer: Browser-Backtests mit grossen Historien, grosse Chart-Datasets. Fuer Trading-Apps akzeptabel -- Trader sitzen typischerweise auf Chrome/Firefox Desktop.

Rust Target: `wasm64-unknown-unknown` (Tier 3, experimentell).

### FFI (Foreign Function Interface)

Faehigkeit, Funktionen aus anderen Sprachen aufzurufen. Relevant fuer:
- **PyO3**: Rust <-> Python (unser Hauptanwendungsfall)
- **wasm-bindgen**: Rust <-> JavaScript/TypeScript
- **CGO + extern "C"**: Rust <-> Go (moeglich, aber nicht empfohlen fuer unseren Stack)
- **napi-rs**: Rust <-> Node.js (Alternative zu WASM)

LLMs/AI-Agents machen FFI-Code einfacher zu schreiben (boilerplate-heavy, aber deterministisch). Rust's Compiler validiert die Korrektheit.

---

## 15. Referenz-Libraries und SOTA 2026

### Indicator / Technical Analysis

| Library | Sprache | Indikatoren | PyO3 | WASM | SIMD | Status |
|---------|---------|-------------|------|------|------|--------|
| [Kand](https://github.com/kand-ta/kand) | Rust | ~20 | Ja (GIL-free) | Ja | Nein | Aktiv (Dez 2025) |
| [VectorTA](https://vectoralpha.dev/projects/ta/) | Rust | 194+ | Ja | ? | Ja (AVX2/512, CUDA) | Aktiv |
| [TA-Lib](https://ta-lib.org/) | C/C++ | 200+ | Ja (via Wrapper) | Nein | Nein | Standard-Referenz |
| [pandas-ta](https://pypi.org/project/pandas-ta/) | Python | 150+ | Nein | Nein | Nein | Aktiv |

### Web Frameworks

| Framework | Version | Highlight 2026 |
|-----------|---------|-----------------|
| [Axum](https://github.com/tokio-rs/axum) | 0.8.8 (Jan 2026) | Keine async_trait-Dep, RFC6570 Paths, Utopia OpenAPI |
| [Actix Web](https://actix.rs/) | 4.x | Hoechste raw Performance, komplexer |

### WASM Tooling

| Tool | Zweck |
|------|-------|
| [wasm-pack](https://rustwasm.github.io/wasm-pack/) | Build + npm-Paket-Generierung |
| [wasm-bindgen](https://rustwasm.github.io/wasm-bindgen/) | Rust <-> JS Interop, automatische .d.ts |
| Memory64 | >4GB WASM (Chrome/Firefox/Edge, nicht Safari) |

### Desktop

| Framework | Ansatz | Reife |
|-----------|--------|-------|
| [Tauri v2](https://v2.tauri.app/) | Rust Backend + Web Frontend (System WebView) | Production-ready |
| [Iced](https://iced.rs/) | Deklarativ (Elm-like), WASM-Mode | Gut |
| [Dioxus](https://dioxuslabs.com/) | React-aehnlich, nativer Renderer (2025) | Vielversprechend |

### AI Agent Frameworks

| Framework | Fokus |
|-----------|-------|
| [ADK-Rust](https://www.adk-rust.com/) | Multi-Agent, Visual Workflow, Model-agnostic |
| [AgentSDK](https://www.agentsdk.build/) | Type-safe, Streaming, Observability |

### Backtesting / Trading Engines

| Library | Sprache | Core | Architektur-Pattern | Status |
|---------|---------|------|---------------------|--------|
| [Nautilus Trader](https://nautilustrader.io/) | Python + Rust | Rust (`nautilus_core/`, PyO3) | Strategy in Python, Matching/Accounting in Rust. Cython→PyO3-Migration. Tokio + Rayon. Live + Backtest gleicher Code. 20+ Venue-Adapter | Aktiv, SOTA-Referenz |
| [AKQuant](https://akquant.akfamily.xyz/en/) | Python + Rust | Rust (PyO3) | 20x Backtrader-Speed, Walk-Forward-Validation, Risk-Intercept in Rust, Zero-Copy. Zweite Architektur-Referenz (Sek. 5) | Aktiv (v0.1.42+) |
| [VectorBT Pro](https://vectorbt.pro/) | Python + C/Numba | C/Numba JIT | Vektorisierte Backtests, Portfolio-Optimierung, kein Rust | Aktiv, kommerziell |
| [Backtrader](https://www.backtrader.com/) | Pure Python | Python | Event-driven, Community-Standard, aber langsam bei grossen Historien | Stabil, wenig Updates |
| GoCryptoTrader | Go | Go | Crypto-spezifisch, Exchange-aware, gRPC-Service. Unser Vendor-Fork | Aktiv (unser Fork) |

**Einordnung:** Nautilus Trader ist die primaere Architektur-Referenz fuer unseren Rust-Backtester (Sektion 5). AKQuant ist die zweite Referenz (leichtgewichtiger, staerker auf Walk-Forward-Validation fokussiert). Gleicher Split: Rust-Core fuer CPU-bound Compute, Python fuer Strategy-Orchestrierung und ML-Integration.

### Chart / Visualization

| Library | Technologie | Highlight |
|---------|------------|-----------|
| [ChartGPU](https://github.com/ChartGPU/ChartGPU) | TypeScript + WebGPU | 120+ FPS, Millionen Punkte, Candlestick |
| [wgpu](https://docs.rs/wgpu/) | Rust + WebGPU/Vulkan/Metal/D3D12 | Cross-Platform GPU, fuer Tauri-Desktop |

### DataFrame / Data Processing

| Library | Sprache | Highlight | Status |
|---------|---------|-----------|--------|
| [Polars](https://pola.rs/) | Rust (Python-Bindings) | 10-100x schneller als pandas, Arrow-backed, Lazy Evaluation, Native Multi-Core (Rayon), Zero-Copy PyO3 | **SOTA 2026**, unsere Wahl (Sek. 5a) |
| [polars-ta-extension](https://github.com/yvictor/polars_ta_extension) | Python (Polars Plugin) | TA-Lib Wrapper direkt auf Polars Series | Aktiv |
| [polars-trading](https://github.com/ngriffiths13/polars-finance) | Rust (Polars Plugin) | Market-Data-Processing Plugins fuer Polars | Aktiv |

### Embedded Databases (Rust-native)

| Library | Architektur | Highlight | Empfehlung |
|---------|-------------|-----------|------------|
| [redb](https://lib.rs/crates/redb) | Copy-on-Write B-Tree | ACID, stable File Format, pure Rust, schnellste Writes (920ms vs. sled 2701ms), MVCC | **Erste Wahl** (Sek. 5b) |
| [sled](https://docs.rs/sled/) | Lock-Free B-Tree | Gutes API, aber 1.0 nie released, Maintenance-Risiko | Nicht empfohlen |
| [SurrealKV](https://github.com/surrealdb/surrealkv) | LSM-Tree | Time-Travel Queries, Compression, aber SurrealDB-gebunden | Overkill fuer OHLCV-Cache |

### Real-Time Streaming (Beobachten)

| Library | Protokoll | Highlight | Status |
|---------|-----------|-----------|--------|
| [wtransport](https://docs.rs/wtransport/) | WebTransport (QUIC/HTTP3) | Pure Rust, async (tokio), bidirektional, Multistream, unreliable Datagrams | v0.6.1, aktiv |
| [wtransport-rs](https://github.com/wtransport/wtransport-rs) | WebTransport | Neuerer Fork, Jan 2026 | Frueh |
| [web-transport](https://docs.rs/web-transport/) | WebTransport (generic) | Native + WASM-Switch (quinn fuer QUIC) | v0.9.7 |

> **WebTransport-Einordnung:** QUIC/HTTP3-basiert, theoretisch besser als WebSocket/SSE fuer Real-Time Financial Streaming (Head-of-Line-Blocking eliminiert, Multiplexing, unreliable Datagrams fuer Tick-Daten). W3C Spec aktiv (Editor's Draft Feb 2026). Aber: Browser-Support noch nicht universell, Go-Gateway nutzt SSE das funktioniert. **Beobachten fuer v3+**, kein akuter Handlungsbedarf.

### Python Bindings

| Tool | Version | Highlight 2026 |
|------|---------|-----------------|
| [PyO3](https://pyo3.rs/) | 0.28.0 (Feb 2026) | Free-threaded Python opt-out, min Rust 1.83 |

---

## 16. Architektur-Zielbild

### Aktuell (Stand Februar 2026)

```
React / Next.js 16
  |
  |-- Leichte Indikatoren (TypeScript, 1122 Zeilen)
  |-- Chart Engine (Canvas 2D, 581 Zeilen)
  |-- Geo Map (d3-geo SVG, 600 Zeilen)
  |
  +---> Next.js API Routes
          |
          +---> Go Gateway (Port 9060)
          |       |-- GCT Connector (gRPC/JSON-RPC)
          |       |-- ECB, Finnhub, FRED, ACLED, GDELT
          |       |-- SSE Streaming
          |       |-- Backtest Manager
          |       +-- News Aggregator
          |
          +---> Python Services
          |       |-- indicator-service (Port 8092)
          |       |-- soft-signals (Port 8091)
          |       +-- finance-bridge (Port 8081)
          |
          +---> GoCryptoTrader (gRPC 9052 / JSON-RPC 9053)
          |
          +---> Prisma / SQLite
```

### Zielbild mit Rust (nach Phase 1-3)

```
React / Next.js 16
  |
  |-- Leichte Indikatoren -----> Kand WASM (Phase 2)
  |     (SMA, EMA, RSI, ...)     O(1) incremental, SIMD
  |
  |-- Chart Engine (Canvas 2D)
  |     evtl. ChartGPU (WebGPU, kein Rust noetig)
  |
  |-- Geo Map (d3-geo SVG → Canvas Hybrid v1.1 → deck.gl v2)
  |
  +---> Next.js API Routes
          |
          +---> Go Gateway (Port 9060, unveraendert)
          |       |-- GCT, ECB, Finnhub, FRED, ACLED, GDELT
          |       |-- SSE Streaming
          |       |-- Backtest Manager
          |       +-- News Aggregator
          |
          +---> Python Services (Polars statt pandas)   <--- NEU
          |       |-- indicator-service (Port 8092)
          |       |     +-- Kand PyO3 0.28 (Phase 1) <--- RUST
          |       |     |   GIL-free, Zero-Copy Arrow
          |       |     |   Pattern-Detection parallel
          |       |     |   Elliott, Harmonic, Fibonacci
          |       |     +-- Polars DataFrame (Phase 1)  <--- RUST
          |       |     |   OHLCV als pl.DataFrame
          |       |     |   Arrow Zero-Copy zu rust-core
          |       |     +-- FastAPI bleibt HTTP-Layer
          |       |
          |       |-- soft-signals (Port 8091, Python bleibt)
          |       +-- finance-bridge (Port 8081, Polars fuer Portfolio)
          |
          +---> Rust Backtester (Phase 3, optional) <--- RUST
          |       Nutzt gleichen Indicator Core
          |       Polars (Rust-native) fuer Trade-Logs
          |       Axum HTTP oder CLI
          |       Rayon-parallel
          |
          +---> Rust Geo-Query Service (Phase v3) <--- RUST
          |       h3o Spatial Indexing
          |       petgraph Entity Graph (>10k Nodes)
          |       PyO3 oder WASM in Next.js API Routes
          |
          +---> GoCryptoTrader (unveraendert)
          +---> Prisma / SQLite (unveraendert)

                 +-----------------------------------------+
                 |           Shared Rust Core               |
                 |  rust-core/                              |
                 |    src/indicators/  (SMA..Ichimoku)      |
                 |    src/patterns/   (Elliott..Harmonic)   |
                 |    src/strategy/   (Composite, Eval)     |
                 |    src/backtest/   (Engine, Portfolio)    |
                 |    src/cache/      (redb OHLCV) [Ph 1-2] |
                 |    src/geo/        (h3o, petgraph) [v3]  |
                 |                                          |
                 |  Build-Targets:                          |
                 |    python/ -> PyO3 cdylib (Phase 1)      |
                 |    wasm/   -> wasm-pack   (Phase 2)      |
                 |    native  -> CLI/Axum    (Phase 3)      |
                 |                                          |
                 |  Data Layer:                             |
                 |    Polars (Python) / polars (Rust-native) |
                 |    redb (Embedded OHLCV Cache)           |
                 +-----------------------------------------+

Langfristig (optional):
  +---> Tauri v2 Desktop App
          React Frontend (System WebView)
          Rust Indicator Core (nativ, kein WASM)
          Lokaler Backtester
          3-10 MB statt 250 MB (Electron)
```

---

## 17. Phasen-Roadmap

### Phase 1: Rust Indicator Core + PyO3 + Polars + Cache (2-3 Wochen)

**Ziel:** Schwere Indikatoren im Python indicator-service durch Rust beschleunigen. Polars als DataFrame-Standard einfuehren. OHLCV-Cache aufbauen.

1. Kand evaluieren (1-2 Tage)
   - Lokal bauen, testen, API pruefen
   - Entscheidung: Kand als Basis oder eigener Core
2. Rust Crate anlegen (`rust-core/`)
3. Top-5 Indikatoren portieren/wrappen (SMA, EMA, RSI, MACD, Bollinger)
4. PyO3-Bindings erstellen
5. **Polars als DataFrame-Standard** in `indicator-service` einfuehren (Sek. 5a)
   - OHLCV-Schema als `pl.DataFrame`
   - Arrow Zero-Copy zu rust-core testen
6. **redb OHLCV-Cache** in `rust-core/src/cache/` implementieren (Sek. 5b)
   - Write-Through bei API-Calls
   - TTL-Policy (Intraday 5min, Daily 24h)
7. In `indicator-service` einbinden
8. A/B-Benchmark: Python-pure vs. Rust-PyO3 (mit Polars + Cache)
9. Schrittweise Pattern-Detection migrieren (Elliott, Harmonic, Fibonacci)

**Erfolgskriterium:** `/api/v1/patterns/*` Endpoints nutzen Rust, messbar schneller. OHLCV-Daten kommen aus lokalem Cache statt via HTTP.

### Phase 2: WASM Frontend-Indikatoren (1-2 Wochen, nach Phase 1)

**Ziel:** Gleicher Rust Core als WASM im Browser fuer leichte Indikatoren.

1. wasm-pack Build-Target hinzufuegen
2. npm-Paket generieren mit TypeScript-Types
3. `src/lib/indicators/index.ts` schrittweise ersetzen
4. A/B-Benchmark: JS vs. WASM mit 5000+ Bars und 10+ Indikatoren

**Erfolgskriterium:** Spuerbar schnellerer Timeframe-Wechsel bei vielen aktiven Indikatoren.

### Phase 3: Backtesting Engine (spaeter, wenn Bedarf waechst)

**Ziel:** Schneller, deterministischer Backtester der den Indicator Core nutzt. Architektur-Referenzen: Nautilus Trader (Sek. 5) + AKQuant (Sek. 5).

1. `rust-core/src/backtest/` implementieren
2. Rayon fuer parallele Strategy-Evaluation
3. **Risk-Intercept im Rust-Layer** (AKQuant-Pattern: Order-Validierung vor Execution)
4. **Walk-Forward-Validation** als First-Class Feature (AKQuant-Pattern)
5. **Polars (Rust-native)** fuer Trade-Logs und Performance-Reports direkt im Backtester
6. **redb-Cache** als primaere Datenquelle (kein HTTP-Fetch fuer historische Daten)
7. CLI-Target fuer Batch-Backtests
8. Optional: Axum HTTP-Service
9. Optional: WASM-Target fuer Browser-Quick-Backtests

**Erfolgskriterium:** 10x schneller als GCT-Backtester fuer indikator-basierte Strategien. Alle historischen Daten aus lokalem Cache.

### Phase 4+: Langfristige Optionen (nur bei Bedarf)

- ChartGPU evaluieren fuer Chart-Performance (kein Rust noetig)
- Tauri v2 Desktop App
- Rust AI Agent Integration fuer deterministische Pipelines
- **Geo-Map Backend Spatial Queries** (h3o + petgraph): Wenn Event-Volumen >5k waechst. Siehe Sek. 13 und [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.4 Stufe 3
- **Geo-Map Transformer Severity-Klassifikation** (DL-7): tch-rs Inference fuer Candidate Pipeline. Siehe Sek. 18, DL-7
- **Geo-Map LSTM Regime Detection** (DL-6): Pro-Region Regime-State. Siehe Sek. 18, DL-6

---

## 18. Deep-Learning-Patterns aus Rust fuer TradeView Fusion

> **Quelle:** *Deep Learning with Rust* (Mehrdad Maleki, Apress 2026) -- [`docs/books/deeplearning-with-rust.md`](./books/deeplearning-with-rust.md)
> **Kontext:** Das Buch implementiert Neural Networks, RNNs, LSTMs, GANs und Transformers komplett in Rust (mit `ndarray`, `tch-rs`, `linfa`). Diese Sektion extrahiert die fuer unser Projekt anwendbaren Patterns mit klarer Prioritaet und Machbarkeit.
> **Grundprinzip:** Das Buch ist Lern-Referenz und Pattern-Quelle, kein Copy-Paste-Material. Production-Code kommt von Kand/VectorTA (Phase 1) und tch-rs/Burn (Phase 3+).

### 18.1 Uebersichtstabelle: Buch-Kapitel → Projekt-Anwendung

| # | Buch-Kapitel | Prio | Phase | Verbundener Layer | Betrifft Dokument | Machbarkeit | Anwendungsfall |
|---|---|---|---|---|---|---|---|
| DL-1 | **Kap 6: Rust Concurrency in AI** (Threads, Channels, Barrier) | **HOCH** | 1 | Python (PyO3) | [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 0.8 | Sofort umsetzbar | Parallele Indikator-Berechnung im `rust-core` |
| DL-2 | **Kap 4.5: Rayon Parallelism** (par_iter, Benchmarks) | **HOCH** | 1 | Python (PyO3) | [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 0.1-0.2 | Sofort umsetzbar | Data-parallele Berechnung ueber OHLCV-Arrays |
| DL-3 | **Kap 1.3: Energy/Performance-Tabelle** | **HOCH** | -- | Alle (Argumentation) | Dieses Dokument Sek. 1 | Referenz-Daten | Quantitative Begruendung der Rust-Strategie |
| DL-4 | **Kap 2: Loss Functions + Gradient Descent** | MITTEL | 1-2 | Python (PyO3) | [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 5 | Direkt portierbar | Strategy Evaluation Metriken (Sharpe, MSE, MAE) |
| DL-5 | **Kap 5: Autodiff in Rust** | MITTEL | 3 | Python (PyO3) | [`Portfolio-architecture.md`](./Portfolio-architecture.md) Sek. 5.3 | Machbar, nicht dringend | Monte Carlo VaR Sensitivity-Analyse |
| DL-6 | **Kap 7.6-7.7: RNN + LSTM** (tch-rs) | MITTEL | 3+ | Python (PyO3), indirekt Go (Daten) | [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Todos #35, #43 | Machbar, ~200 LoC | Regime Detection, einfache Zeitreihen-Vorhersage |
| DL-7 | **Kap 8.4-8.5: Transformers** (Self-Attention, Sentiment) | MITTEL | 4+ | Python (ersetzt/ergaenzt soft-signals), indirekt React (Geo-Map UI) | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 18 | Machbar, braucht Training | Severity-Klassifikation fuer Geo-Event-Candidates |
| DL-8 | **Kap 4.6: Burn, Candle, Linfa** | NIEDRIG | 4+ | Python (PyO3) | [`Portfolio-architecture.md`](./Portfolio-architecture.md) Sek. 5.3 | Ecosystem noch jung | HRP Clustering in Rust statt scipy (>200 Assets) |
| DL-9 | **Kap 8.1-8.3: GANs** | NIEDRIG | 5+ | Python | -- | Theoretisch, kein klarer ROI | Synthetische Geo-Events / Marktdaten fuer Testing |
| DL-10 | **Kap 4.4.2: CSV Preprocessing Rust vs. Python** | **HOCH** | 1 | Python (Polars/PyO3) | Dieses Dokument Sek. 5a | Direkt anwendbar | Polars nutzt exakt die Vorteile die das Buch beschreibt (SIMD, keine Zwischen-Allokationen, Rayon-parallel) |
| DL-11 | **Kap 6.4.1: Concurrent Data Loading** (Producer-Consumer) | **HOCH** | 1-2 | Python (PyO3), Rust-native | Dieses Dokument Sek. 5b | Sofort umsetzbar | redb Cache: Background-Thread laedt bei Miss, Haupt-Thread liest aus Cache |
| DL-12 | **Kap 3.5 + 3.6: Memory Safety + Ownership fuer Data** | **HOCH** | -- | Alle (Argumentation) | Dieses Dokument Sek. 8 | Referenz-Material | AI-Safety-Layer: Compiler faengt Bugs in AI-generiertem Code ab |

### 18.2 Detailbeschreibung der High-Priority Items

#### DL-1: Concurrency-Patterns fuer parallele Indikator-Berechnung

**Buch-Referenz:** Kapitel 6, Zeilen 4209-4620 (deeplearning-with-rust.md)

**Problem:** Unser `indicator-service` (Port 8092) berechnet 10+ Pattern-Algorithmen sequentiell pro Request. Elliott Wave, Harmonic Patterns, Fibonacci und Candlestick-Detection laufen nacheinander -- die Composite-Signal-Aggregation wartet auf alle.

**Was das Buch liefert:**

| Pattern | Buch-Listing | Unser Anwendungsfall |
|---|---|---|
| `mpsc::channel` Producer-Consumer | Listing 6.1 (L4500) | Rust-Worker-Threads berechnen Patterns parallel, senden Ergebnisse ueber Channel an Aggregator |
| `Arc<Barrier>` Synchronisation | Listing 6.2 (L4530) | Alle Pattern-Berechnungen muessen abgeschlossen sein bevor Composite Signal berechnet wird |
| `Arc<Mutex<T>>` Shared State | Listing 6.3 (L4570) | Shared OHLCV-Daten die von mehreren Pattern-Threads gelesen werden (RwLock fuer Read-Heavy) |
| Concurrent Logging | Listing 6.4 (L4610) | Benchmark-Metriken (Laufzeit pro Pattern) parallel loggen ohne Training zu blockieren |

**Architektur im `rust-core`:**

```
POST /api/v1/signals/composite (FastAPI, Python)
  |
  v calls PyO3
rust_core::composite_signal(ohlcv: &[OHLCV], params: &CompositeParams)
  |
  +-- thread::spawn → elliott_wave(ohlcv)     ─┐
  +-- thread::spawn → harmonic_patterns(ohlcv) ─┤
  +-- thread::spawn → fibonacci_levels(ohlcv)  ─┤  Arc<Barrier>
  +-- thread::spawn → candlestick_scan(ohlcv)  ─┤  wartet auf alle
  +-- thread::spawn → support_resistance(ohlcv) ─┘
  |
  v  Barrier::wait() -- alle fertig
  aggregate_signals(results) → CompositeSignal
```

**Verbundene Layer:**
- **Python:** PyO3-Aufruf aus `indicator-service/app.py`, FastAPI bleibt HTTP-Layer
- **Go:** Liefert OHLCV-Daten via Data Router ([`go-research-financial-data-aggregation-2025-2026.md`](./go-research-financial-data-aggregation-2025-2026.md))
- **React:** Konsumiert `/api/v1/signals/composite` Response, zeigt in Right Sidebar

**Machbarkeit:** Sofort. Alle Rust-Primitives sind stabil (std::thread, std::sync). Kein externes Crate noetig.

#### DL-2: Rayon Data-Parallelism fuer OHLCV-Berechnungen

**Buch-Referenz:** Kapitel 4.5, Zeilen 3230-3310 (deeplearning-with-rust.md)

**Benchmark aus dem Buch:**

| Modus | Zeit (sec) | Speedup vs. Serial |
|---|---|---|
| Rust Serial | 0.0145 | 1.00x |
| Rust Parallel (Rayon) | 0.0019 | **7.64x** |
| Python Serial | 0.0510 | 0.28x |
| Python Parallel (multiprocessing) | >600 | <0.00002x |

**Anwendung auf unsere Indikatoren:**

```rust
use rayon::prelude::*;

pub fn calculate_indicators_batch(
    ohlcv: &[OHLCV],
    indicators: &[IndicatorConfig],
) -> Vec<IndicatorResult> {
    indicators.par_iter()
        .map(|config| match config.kind {
            IndicatorKind::SMA => compute_sma(ohlcv, config.period),
            IndicatorKind::EMA => compute_ema(ohlcv, config.period),
            IndicatorKind::RSI => compute_rsi(ohlcv, config.period),
            // ...
        })
        .collect()
}
```

Wenn ein User 16 Indikatoren gleichzeitig aktiviert hat (Right Sidebar Toggles), berechnet Rayon alle parallel statt sequentiell. Bei 5000 Bars und 16 Indikatoren: geschaetzte **5-8x Beschleunigung** (nicht 7.64x wegen Overhead pro Indikator-Typ, aber signifikant).

**Verbundene Layer:**
- **Python (Phase 1):** PyO3 Batch-Call -- ein Aufruf, alle Indikatoren parallel
- **WASM (Phase 2):** Selber Code, `wasm-bindgen` Export -- Rayon funktioniert nicht in WASM, dort `wasm-bindgen-rayon` oder Web Workers
- **React:** Profitiert durch schnelleren Timeframe-Wechsel

**Machbarkeit:** Sofort. `rayon` ist das stabilste Rust-Crate fuer Data-Parallelism (>11k Stars, production-ready).

### 18.3 Detailbeschreibung der Medium-Priority Items

#### DL-4: Loss Functions und Metriken in Rust

**Buch-Referenz:** Kapitel 2, Zeilen 1020-1220 (deeplearning-with-rust.md)

Das Buch implementiert MSE, MAE, Cross-Entropy und KL-Divergence mathematisch und in Rust-Code. Unsere Strategy Evaluation (`/api/v1/evaluate/strategy`) berechnet aehnliche Metriken: Sharpe Ratio (Mittelwert/Standardabweichung), Max Drawdown (kumulatives Minimum), Win Rate.

**Mapping:**

| Buch-Metrik | Unsere Metrik | Formel-Verbindung |
|---|---|---|
| MSE (L1144) | Strategy RMSE | `sqrt(1/N * sum((predicted - actual)^2))` |
| MAE (L1155) | Tracking Error | `1/N * sum(abs(strategy_return - benchmark))` |
| Cross-Entropy (L1199) | Signal Confidence Score | `-sum(y * log(ŷ))` fuer Klassifikation (Buy/Sell/Hold) |
| Gradient Descent (L1100) | Adaptive MA Optimierung | KAMA, ALMA passen Parameter per Gradient an |

**Verbundene Layer:**
- **Python (PyO3):** Metriken im `rust-core/src/strategy/evaluation.rs`
- **React:** [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Todo #37 (Strategy Evaluator UI)

**Machbarkeit:** Direkt portierbar. Reine Mathematik, keine externen Dependencies.

#### DL-5: Autodiff fuer Monte Carlo VaR Sensitivity

**Buch-Referenz:** Kapitel 5, Zeilen 3800-4000 (deeplearning-with-rust.md)

Monte Carlo VaR (100k+ Simulationen) ist als Rust/PyO3 Task in [`Portfolio-architecture.md`](./Portfolio-architecture.md) Aufgabe P-29 geplant. Das Buch zeigt Automatic Differentiation in Rust -- damit laesst sich nicht nur VaR berechnen, sondern auch `dVaR/dPosition` (Sensitivity: wie aendert sich das Risiko wenn ich 1% mehr AAPL halte?).

**Verbundene Layer:**
- **Python (PyO3):** Aufruf aus `/api/v1/portfolio/optimize`
- **Go:** Liefert OHLCV-Historien fuer die Simulation via Data Router
- **React:** Portfolio Tab "Optimize" zeigt Sensitivity-Heatmap

**Machbarkeit:** Machbar mit `autodiff` Crate. Nicht dringend -- scipy reicht fuer <200 Assets.

#### DL-6: Kleines RNN/LSTM fuer Regime Detection

**Buch-Referenz:** Kapitel 7.6-7.7, Zeilen 5300-5900 (deeplearning-with-rust.md)

Das Buch implementiert ein vollstaendiges RNN + LSTM in Rust mit `tch-rs` (PyTorch Bindings). Die LSTM-Gates (Forget, Input, Output) sind konzeptuell ideal fuer Regime-Erkennung:
- **Forget Gate:** "Vergiss das alte Regime (bull market)"
- **Input Gate:** "Uebernimm das neue Signal (volatility spike = regime change)"
- **Output Gate:** "Gib das aktuelle Regime an die Position-Sizing weiter"

Ein trainiertes Mini-LSTM (3 Hidden Units, ~200 LoC Rust) koennte direkt im `rust-core` laufen:

```
OHLCV (5000 Bars) → Rust LSTM → regime: "trending" | "mean_reverting" | "crisis"
                                  ↓
                          Position Sizing Multiplikator (0.5x / 1.0x / 0.25x)
```

**Verbundene Layer:**
- **Python (PyO3):** Training in Python (tch / PyTorch), Inference in Rust via exportiertes Modell
- **Go:** Liefert OHLCV-Daten
- **React:** Regime-Ampel im Portfolio Tab "Optimize" (Gruen/Gelb/Rot pro Position)

**Betrifft:**
- [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Todo #35 (Regime Detection), Todo #43 (Regime-Sizing)
- [`Portfolio-architecture.md`](./Portfolio-architecture.md) Sek. 5.2.6 (Regime-basierte Empfehlungen)

**Machbarkeit:** Machbar. `tch-rs` ist stabil (PyTorch C++ Backend). Training in Python, Inference in Rust via `torch::CModule::load()`. ~200 Zeilen Rust fuer die Inference-Pipeline.

#### DL-7: Transformer-basierte Severity-Klassifikation fuer Geo-Events

**Buch-Referenz:** Kapitel 8.4-8.5, Zeilen 6300-7070 (deeplearning-with-rust.md)

Das Buch implementiert einen Encoder-Only Transformer mit Binary Sentiment Classification in Rust. Unsere Geopolitical Map braucht in v2/v3 eine NLP-Pipeline:

```
News-Text → Entity Extraction → Category Classification → Severity Tagging → Candidate
```

Das Buch-Pattern adaptiert fuer unseren Anwendungsfall:

| Transformer-Komponente | Buch-Implementation | Unser Geo-Map Nutzen |
|---|---|---|
| Multi-Head Self-Attention | Listing 8.1-8.2 (L6500-6700) | Head 1: Laender-Entitaeten, Head 2: Severity-Woerter ("sanctions", "war"), Head 3: Asset-Mentions ("oil", "USD") |
| Positional Encoding | Sinusoidal (L6350) | Wort-Reihenfolge in Headlines bewahren |
| Classification Head | Mean Pooling + Linear (L6716) | Output: Severity S1-S5 (5 Klassen statt 2) |

**Deployment:**

```
Geo-Map Candidate Pipeline (aktuell Python soft-signals):
  News-Text
    ↓
  Rust Transformer (severity: S1-S5, confidence: 0.0-1.0)
    ↓                                    ↑
  falls confidence > 0.75:        trainiert in Python (tch/HuggingFace)
    → Candidate Queue                  exportiert als TorchScript .pt
    → Event Inspector                  geladen in Rust via tch-rs CModule
```

**Verbundene Layer:**
- **Python:** Training + Fine-Tuning auf gelabelten Geo-Events (HuggingFace Trainer → TorchScript Export)
- **React:** Candidate Queue UI, Event Inspector zeigt Severity + Confidence ([`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 6, 9, 18)
- **Go:** Liefert News-Daten via ACLED/GDELT/News-Adapter ([`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 12, 14)

**Betrifft:**
- [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 18 (Soft-Signal NLP/ML Pipeline)
- [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 6 (Confidence Ladder C0-C4)
- [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 17 (Hard-Signal Scoring)
- Indirekt: [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 0.4 (ML/AI Modelle generell)

**Machbarkeit:** Machbar, aber braucht gelabelte Trainingsdaten (Geo-Events mit Severity-Labels). Fruehestens Phase 4 (Geo-Map v3). Das Buch zeigt die Rust-Implementation, aber Production-Quality braucht Fine-Tuning auf Domain-Daten.

### 18.4 Performance-Referenzdaten aus dem Buch

Aus Kapitel 1.3 (Tabelle 1.1, basierend auf Pereira et al. 2017 -- breit zitierte Benchmark-Studie):

| Sprache | Energy (relativ zu C) | Time (relativ zu C) | Memory (MB) | Unser Layer |
|---|---|---|---|---|
| **C** | 1.00 | 1.00 | 1.17 | -- (Referenz) |
| **Rust** | 1.03 | 1.04 | 1.54 | `rust-core` (PyO3, WASM, native) |
| **C++** | 1.34 | 1.56 | 1.34 | -- |
| **Go** | 3.23 | 2.83 | 1.05 | Go Gateway, GCT, Data Router |
| **JavaScript** | 4.45 | 6.52 | 4.59 | -- |
| **TypeScript** | 21.50 | 46.20 | 4.69 | React/Next.js Frontend, TS-Indikatoren |
| **Python** | 75.88 | 71.90 | 2.80 | indicator-service, soft-signals, finance-bridge |

**Interpretation fuer unsere Architektur:**
- Rust ist **73x** energieeffizienter als Python → bestaetigt PyO3 fuer CPU-bound Indicator Core
- Rust ist **69x** schneller als Python → Pattern-Detection, Backtesting
- Go ist **2.7x** langsamer als Rust bei CPU → akzeptabel fuer I/O-bound Gateway
- TypeScript ist **44x** langsamer als Rust bei CPU → bestaetigt WASM-Strategie fuer Frontend-Indikatoren (Phase 2)
- Go hat den **niedrigsten Memory-Footprint** (1.05 MB) → bestaetigt Go fuer langlebige Services (Gateway, GCT)

### 18.5 Rust-DL-Crates Referenz (aus dem Buch, Kapitel 4.6)

| Crate | Rolle | Buch-Kapitel | Unser Nutzen | Phase |
|---|---|---|---|---|
| **tch-rs** | PyTorch C++ Bindings fuer Rust | 7.6, 7.7, 8.3, 8.5 | Inference von trainierten Modellen (LSTM, Transformer) im `rust-core` | 3+ |
| **ndarray** | N-dimensionale Arrays (Rust-numpy) | 5, 7 (CNN) | Numerische Berechnungen in `rust-core/src/indicators/` | 1 |
| **linfa** | ML-Toolkit (Clustering, SVM, Regression) | 4.6 | HRP Clustering fuer Portfolio-Optimierung bei >200 Assets | 4+ |
| **Burn** | Modulares DL-Framework (CPU + GPU) | 4.6 | Alternative zu tch-rs falls kein PyTorch-Dependency gewuenscht | 4+ |
| **Candle** | Minimalistisches DL (PyTorch-inspiriert) | 4.6 | Leichte Inference ohne PyTorch-Backend (z.B. im WASM-Target) | 4+ |
| **autodiff** | Forward-Mode Automatic Differentiation | 5 | Sensitivity-Analyse (dMetrik/dParameter) in Strategy Evaluation | 3 |
| **rayon** | Data-Parallelism (par_iter, work-stealing) | 4.5 | Parallele Indikator-Berechnung, Backtesting | 1 |
| **polars** | Rust-nativer DataFrame (Arrow-backed) | -- | OHLCV-Datenstruktur, Trade-Logs, Performance-Reports (Sek. 5a) | 1 |
| **redb** | Embedded Key-Value Store (ACID, B-Tree) | -- | Lokaler OHLCV-Cache, eliminiert redundante API-Calls (Sek. 5b) | 1-2 |

### 18.6 Querverweis-Matrix: Buch → Projekt-Dokumente

| Buch-Kapitel | RUST_LANGUAGE_IMPL | INDICATOR_ARCH | Portfolio-arch | Geo-Map MASTERPLAN | go-research |
|---|---|---|---|---|---|
| Kap 1.3 (Performance) | Sek. 1 (Matrix) | -- | -- | -- | -- |
| Kap 2 (Loss/Gradient) | Sek. 2 (PyO3 Core) | Sek. 5, Todo #37 | -- | -- | -- |
| Kap 4.5 (Rayon) | Sek. 2, 5 | Sek. 0.1-0.2 | -- | -- | -- |
| Kap 5 (Autodiff) | Sek. 5 (Backtesting) | -- | Sek. 5.3, P-29 | -- | -- |
| Kap 6 (Concurrency) | Sek. 2, 5 | Sek. 0.8 | -- | -- | Indirekt (Data Flow) |
| Kap 7.6-7.7 (RNN/LSTM) | Sek. 8 (AI Agents) | Todo #35, #43 | Sek. 5.2.6 | -- | -- |
| Kap 8.4-8.5 (Transformer) | Sek. 8 (AI Agents) | Sek. 0.4 | -- | Sek. 6, 17, 18 | -- |
| Kap 4.6 (Burn/Candle) | Sek. 15 (Libraries) | -- | Sek. 5.3 | -- | -- |
| Kap 4.4.2 (CSV vs. Rust) | **Sek. 5a (Polars)** | -- | -- | -- | -- |
| Kap 4.4.1 (Performance) | **Sek. 5b (redb Cache)** | -- | -- | -- | Indirekt (Data Flow) |
| Kap 6.4.1 (Data Loading) | **Sek. 5b (redb Cache)** | -- | -- | -- | Indirekt (Data Flow) |
| Kap 3.5 (Memory Safety) | **Sek. 8 (AI-Safety)** | -- | -- | -- | -- |

---

## 19. Quellen und Referenzen

### Benchmarks und Analysen
- [Rust WebAssembly Performance 2025 Benchmarks](https://byteiota.com/rust-webassembly-performance-8-10x-faster-2025-benchmarks/) -- 8-10x vs JS
- [WebAssembly vs JavaScript 2025 Deep Dive](https://toxigon.com/webassembly-vs-javascript-2025)
- [Rust + WASM: JS vs wasm-bindgen vs Raw WASM + SIMD](https://dev.to/bence_rcz_fe471c168707c1/rust-webassembly-performance-javascript-vs-wasm-bindgen-vs-raw-wasm-with-simd-4pco)
- [Deriv: WebAssembly Beyond the Browser (Trading Charts)](https://deriv.com/derivtech/feed/webassembly-beyond-the-browser)
- [Rust vs JavaScript & TypeScript (JetBrains 2026)](https://blog.jetbrains.com/rust/2026/01/27/rust-vs-javascript-typescript/)

### State of Rust 2026
- [JetBrains State of Rust Ecosystem 2025](https://blog.jetbrains.com/rust/2026/02/11/state-of-rust-2025/)
- [Rust Web Frameworks 2026 Comparison](https://aarambhdevhub.medium.com/rust-web-frameworks-in-2026-axum-vs-actix-web-vs-rocket-vs-warp-vs-salvo-which-one-should-you-2db3792c79a2)

### Libraries
- [Kand: Rust TA Library](https://github.com/kand-ta/kand) -- PyO3 + WASM, O(1) incremental
- [VectorTA: 194+ Indikatoren, SIMD/CUDA](https://vectoralpha.dev/projects/ta/)
- [ChartGPU: WebGPU Charts](https://github.com/ChartGPU/ChartGPU) -- 120+ FPS, Candlestick
- [PyO3 0.28 Changelog](https://pyo3.rs/latest/changelog) -- Free-threaded Python
- [wasm-bindgen Guide](https://rustwasm.github.io/docs/wasm-bindgen/)
- [Memory64 Browser Support](https://caniuse.com/wf-wasm-memory64)

### Backtesting / Trading Engines
- [Nautilus Trader](https://nautilustrader.io/) -- Python + Rust Core (PyO3), primaere SOTA-Referenz. [GitHub](https://github.com/nautechsystems/nautilus_trader)
- [AKQuant](https://akquant.akfamily.xyz/en/) -- Python + Rust (PyO3), zweite Referenz. 20x Backtrader-Speed, Walk-Forward-Validation, Risk-Intercept in Rust. [PyPI](https://pypi.org/project/akquant/)
- [VectorBT Pro](https://vectorbt.pro/) -- Vektorisierte Backtests in Python + Numba/C

### DataFrame / Data Processing
- [Polars](https://pola.rs/) -- Rust-nativer DataFrame, 10-100x schneller als pandas, Arrow-backed. [GitHub](https://github.com/pola-rs/polars)
- [Polars Finance Benchmarks](https://rocketedge.com/2025/10/02/turbocharging-finance-data-pipelines-in-python-why-polars-joblib-and-vs-code-should-be-your-new-default/) -- RocketEdge 2025 Speed-Vergleich Polars vs. pandas
- [Databento: OHLCV Downsampling mit Polars + Rust](https://databento.com/blog/downsampling-pricing-data-2) -- Production-Beispiel fuer Tick→Bar-Aggregation

### Embedded Databases
- [redb](https://lib.rs/crates/redb) -- Pure Rust, ACID, Copy-on-Write B-Tree, stabile File-Format
- [SurrealDB CRUD-Bench](https://github.com/surrealdb/crud-bench) -- Benchmark-Tool fuer Embedded DBs

### Real-Time Streaming (Beobachten)
- [wtransport](https://docs.rs/wtransport/) -- Pure Rust WebTransport (QUIC/HTTP3), async
- [W3C WebTransport Spec](https://w3c.github.io/webtransport/) -- Editor's Draft Feb 2026

### Desktop
- [Tauri v2](https://v2.tauri.app/)
- [Tauri vs Electron 2026 Guide](https://blog.nishikanta.in/tauri-vs-electron-the-complete-developers-guide-2026)

### AI Agent Frameworks
- [ADK-Rust](https://www.adk-rust.com/)
- [AgentSDK](https://www.agentsdk.build/)
- [Kore: Rust Compiler als AI Reward Signal](https://github.com/konf-dev/kore)

### Deep Learning mit Rust (Buch)
- Maleki, Mehrdad. *Deep Learning with Rust: Mastering Efficient and Safe Neural Networks in the Rust Ecosystem.* Apress, 2026. ISBN 979-8-8688-2208-7
- [GitHub Repository (Apress)](https://github.com/Apress/Deep-Learning-with-Rust) -- Source Code zum Buch
- Lokale Kopie: [`docs/books/deeplearning-with-rust.md`](./books/deeplearning-with-rust.md)
- Pereira et al. 2017: Energy Efficiency across Programming Languages (Basis fuer Tabelle 1.1 im Buch) -- [ACM DL](https://doi.org/10.1145/3136014.3136031)

### Video-Referenz
- Dreams of Code: "Why I'm mass mass mass bullish on Rust in 2026" (Transcript-basierte Analyse)
