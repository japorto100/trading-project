# Backtesting-Architektur — Gateway, Indikatoren & Datenfluss

> **Stand:** 20. Maerz 2026
> **Zweck:** Big-Picture-Ueberblick ueber alle Backtester-Schichten, Datenquellen-Mapping,
> und wie Kaabar's Python-Ansatz in unsere Go/Rust/Python-Architektur uebersetzt wird
> **Referenzen:** `docs/INDICATOR_ARCHITECTURE.md` (Sek. 5), `docs/KAABAR_BOOK_AUDIT.md`,
> `go-backend/internal/services/backtest/` (Code)

---

## 1. Drei Backtester — Drei Schichten

Wir haben DREI verschiedene Backtesting-Ebenen die sich ergaenzen, nicht ueberlappen:

### 1a. GCT Exchange Backtester (Fremdprodukt — Go)

**Was:** GoCryptoTrader's eigener Backtester (`go-backend/go-crypto-trader/backtester/`).
**Wer:** Upstream-Projekt (thrasher-corp), nicht von uns geschrieben.
**Kann:**
- Historisches Order-Matching auf 30+ Exchanges (Binance, Kraken, Coinbase etc.)
- Portfolio Management (Holdings, Sizing, Risk-Checks)
- Slippage, Fees, Funding Rates (Exchange-realistisch)
- Strategy-Plugins (Go-Interface, eigene Strategien ladbar)
- gRPC API (`btrpc`) — unser `GCTExecutor` verbindet sich darauf

**Unser Zugriff:** `go-backend/internal/services/backtest/gct_executor.go`
- Verbindet sich via gRPC auf GCT's Backtester-Service
- `ExecuteStrategyFromFile()` — sendet Strategy-Config JSON
- `StartTask()` / `ListAllTasks()` — Orchestrierung
- Frontend: `BacktestCapabilitiesHandler` listet verfuegbare Strategy-Configs

**Limitierungen fuer uns:**
- Strategies muessen in Go geschrieben oder als Config-JSON definiert sein
- GCT's eigene Indikatoren (`indicators/` Package: SMA, EMA, RSI, MACD etc.)
  werden intern genutzt — NICHT unsere Python/Rust-Indikatoren
- Kein Zugriff auf unsere Custom-Indikatoren (K's Collection, Rainbow, CARSI etc.)
- Kein Walk-Forward, kein Deflated Sharpe, kein Triple-Barrier

**Wann nutzen:** Exchange-realistisches Backtesting mit echten Order-Constraints.
Wenn die Frage ist "Haette dieser Trade auf Binance Geld verdient, inklusive Fees?"

### 1b. Signal-Evaluator (Unserer — Python → Rust)

**Was:** `indicator_engine/quant.py` + `indicator_engine/backtest.py`
**Wer:** Von uns gebaut, basierend auf Kaabar + eigene Erweiterungen.
**Kann:**
- `evaluate_indicator()` — Performance-Metriken fuer beliebige Signale
- Triple Barrier Labeling (realistischere Stop/TP-basierte Evaluation)
- Walk-Forward Testing (Rolling Train/Test Split)
- Deflated Sharpe (Overfitting-Korrektur)
- Parameter Sensitivity Analysis
- Signal Quality Chain (Multi-Faktor-Bewertung)
- Alle Kaabar-Metriken: Hit Ratio, Profit Factor, Expectancy, Sharpe, Sortino, RRR

**Datenfluss:**
```
Go Gateway → OHLCV Daten holen (Finnhub/GCT/FRED)
         → Python indicator_engine → Signal berechnen
         → quant.py evaluate_indicator() → Metriken zurueck
         → (Phase E: Rust gRPC statt Python)
```

**Limitierungen:**
- Kein echtes Order-Matching (idealisiert: "Kauf am Signal-Close")
- Keine Exchange-spezifischen Fees/Slippage (Todo #37 in INDICATOR_ARCHITECTURE.md)
- Holding Period fix (default 10 Bars, konfigurierbar)

**Wann nutzen:** Signal-Qualitaet bewerten. "Ist dieser Indikator ueberhaupt profitabel?"
Schnell, ohne Exchange-Infrastruktur. Hauptanwendung fuer Indikator-Entwicklung.

### 1c. Gateway Backtester (Unserer — Go)

**Was:** `go-backend/internal/services/backtest/manager.go` + `executor.go`
**Wer:** Von uns gebaut.
**Kann:**
- Run-Orchestrierung (Queue, Cancel, Progress-SSE, Status-Tracking)
- Abstraktes `Executor`-Interface — pluggable Backends:
  - `GCTExecutor` — delegiert an GCT's Backtester via gRPC
  - `SimulatedExecutor` — Mock fuer Tests (80ms delay)
  - **(GEPLANT)** `IndicatorExecutor` — delegiert an Python/Rust Signal-Evaluator
- Run-Management: `RunStatusQueued → Running → Completed/Failed/Canceled`
- Report-Extraktion aus GCT-Ergebnissen

**Datenfluss:**
```
Frontend → POST /api/backtest/run → Go Manager
Go Manager → waehlt Executor basierend auf Request-Typ
  → GCTExecutor: gRPC → GCT Backtester (Exchange-realistisch)
  → IndicatorExecutor (geplant): HTTP/gRPC → Python/Rust (Signal-Evaluation)
```

**Warum das wichtig ist:** Der Go Manager ist die EINZIGE Schnittstelle fuer das Frontend.
Egal welcher Backtester-Typ verwendet wird — das Frontend spricht immer mit Go.

---

## 2. Datenquellen-Mapping: Kaabar → Wir

### Kaabar's Datenquellen (Ch. 2)

| Kaabar Provider | Python-Lib | Asset-Klasse |
|:----------------|:-----------|:-------------|
| `yahoo_finance` | `yfinance` | Aktien, ETFs, Indizes |
| `metatrader` | `MetaTrader5` | Forex (EURUSD etc.) |
| `fred` | `pandas_datareader` | Wirtschaftsdaten (CPI, GDP) |
| `manual_import_*` | `pandas` | CSV/XLSX lokal |

### Unsere Aequivalente (Go Gateway)

| Kaabar Provider | Unser Connector | Ort | Anmerkung |
|:----------------|:----------------|:----|:----------|
| `yahoo_finance` | **Finnhub** | `go-backend/internal/connectors/finnhub/` | Aktien, ETFs, Indizes. REST API, kein Desktop noetig |
| `metatrader` | **GCT** (30+ Exchanges) | `go-backend/go-crypto-trader/` | Crypto + Forex via Exchange-Adapter |
| `fred` | **FRED Connector** | `go-backend/internal/connectors/fred/` | Bereits implementiert, Go-nativ |
| `manual_import_*` | **Nicht noetig** | — | Go-Connectors liefern alles programmatisch |

### Backtesting-Datenfluss

```
                      ┌─────────────────────┐
                      │   Datenquellen       │
                      │ Finnhub  GCT  FRED   │
                      └────────┬────────────┘
                               │ REST/WS/gRPC
                      ┌────────▼────────────┐
                      │   Go Gateway         │
                      │ Connectors → Storage │
                      │ (SQLite / Postgres)  │
                      └────────┬────────────┘
                               │
              ┌────────────────┼─────────────────┐
              │                │                  │
    ┌─────────▼────────┐ ┌────▼──────────┐ ┌─────▼──────────┐
    │ GCT Backtester   │ │ Python Eval   │ │ Rust gRPC      │
    │ (Exchange-real)  │ │ (Signal-Eval) │ │ (Phase E Ziel) │
    │ Fees, Slippage   │ │ Sharpe, WF    │ │ Hot-Path Ind.  │
    │ GCT indicators/  │ │ quant.py      │ │ kand crate     │
    └─────────┬────────┘ └────┬──────────┘ └─────┬──────────┘
              │               │                   │
              └───────────────┼───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Go Manager      │
                    │ Orchestrierung    │
                    │ Queue, SSE, State │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │    Frontend       │
                    │ StrategyLabPanel  │
                    │ BacktestResults   │
                    └───────────────────┘
```

**Wichtig:** Kaabar's `import_data()` holt Daten DIREKT in Python. Bei uns laufen
ALLE Daten durch Go — auch fuer Backtesting. Python/Rust erhalten OHLCV als Input,
holen keine Daten selbst. Das ist architektonisch sauberer (eine Datenquelle, ein Cache).

---

## 3. GCT und unsere Indikatoren — Bruecke oder Trennung?

### Status Quo

GCT hat eigene Indikatoren in `go-crypto-trader/indicators/`:
- Standard: SMA, EMA, RSI, MACD, Bollinger Bands, ATR, ADX etc.
- Werden **nur intern** von GCT's Backtester genutzt
- Wir nutzen sie NICHT fuer unsere Indikator-Berechnung

Unsere Indikatoren leben in Python (`indicator_engine/`) und kuenftig Rust (`rust_core/`):
- Custom: K's Collection, Rainbow, CARSI, Harmonic Patterns, Elliott Wave etc.
- Kaabar-proprietaere Formeln die GCT nicht hat

### Das Problem

Wenn der GCT Backtester laeuft, nutzt er SEINE eigenen Indikatoren.
Er weiss nichts von unseren K's Collection oder Rainbow Signalen.
Das heisst: **GCT kann unsere Custom-Strategien nicht backtesten.**

### Die Loesung: Zwei Wege

**Weg A — Signal-Injection (pragmatisch, Phase E+):**
```
1. Python/Rust berechnet Custom-Signal auf historischen Daten
2. Signal wird als Zeitreihe (timestamp → buy/sell) exportiert
3. GCT Backtester erhaelt Signal als "external signal" Strategy-Plugin
4. GCT fuehrt Order-Execution realistisch durch
```
Vorteil: Nutzt GCT's Exchange-Realismus fuer unsere Signale.
Nachteil: Braucht Custom GCT Strategy-Plugin (Go-Code im Fork).

**Weg B — Eigener realistischerer Evaluator (langfristig):**
```
1. quant.py/Rust erhaelt Slippage/Fee/Funding-Parameter (Todo #37)
2. Evaluation wird Exchange-realistischer OHNE GCT
3. GCT bleibt fuer Live-Trading, nicht fuer Indikator-Backtesting
```
Vorteil: Kein GCT-Fork-Code noetig. Alles in unserem Stack.
Nachteil: Order-Matching nie so realistisch wie GCT (Orderbook-Depth etc.)

### Empfehlung

**Phase E (kurzfristig):** Weg B — quant.py/Rust mit Slippage/Fee-Modell erweitern.
Reicht fuer Indikator-Evaluation (Kaabar-Level + besser).

**Post-Phase E (langfristig):** Weg A — Signal-Injection in GCT fuer
Exchange-realistisches Backtesting von Custom-Strategien. Nur wenn
tatsaechlich Live-Trading mit echtem Geld geplant ist.

---

## 4. Python vs. Rust — Was berechnet was?

### Aktuell (Phase B)

| Berechnung | Ort | Grund |
|:-----------|:----|:------|
| Alle Indikatoren | Python `indicator_engine/` | Monolith, funktioniert |
| EMA, RSI, ATR, BB | Rust `rust_core/` (PyO3) | Phase 2, Hot-Path Beschleunigung |
| Signal-Evaluation | Python `quant.py` | Kaabar-Metriken + Erweiterungen |
| Exchange-Backtest | GCT (Go) | Fremdprodukt, eigener Stack |

### Ziel (Phase E)

| Berechnung | Ort | Grund |
|:-----------|:----|:------|
| Hot-Path Indikatoren | **Rust gRPC** (Tonic) | Go → gRPC → Rust, ein Hop |
| K's Collection, Rainbow | **Rust gRPC** | Gleicher Service, batch compute |
| Harmonic/Elliott Patterns | **Rust oder Python** | Komplex, Rust-Port aufwaendig |
| Signal-Evaluation | **Rust gRPC** | Sharpe/Sortino/WF sind pure Math |
| ML-Features + Training | **Python** (bleibt) | ML-Frameworks nur in Python |
| rainbow.py | **Python** (bleibt) | Kaabar-proprietaer, kein Rust-Port |

### Warum nicht alles in GCT?

GCT's Indikatoren sind **Standard-Implementierungen** (SMA, EMA, RSI etc.).
Unsere Value-Add sind **Custom-Indikatoren** die GCT nicht hat:
- K's Collection (6 proprietaere Indikatoren)
- Rainbow (7-Indikator Confluence)
- CARSI (Candlestick RSI)
- Kaabar's Candlestick Patterns (Bottle, Double Trouble, Extreme Euphoria etc.)
- Signal Quality Chain (Multi-Faktor-Evaluation)
- Walk-Forward + Deflated Sharpe (Overfitting-Schutz)

Diese MUESSEN in unserem Stack (Python → Rust) leben, nicht in GCT.

---

## 5. Kaabar's `generate_ohlc_data()` — Test-Utility

Kaabar Ch. 2 definiert eine nuetzliche OHLC-Generator-Funktion:

```python
def generate_ohlc_data(length_data=1000):
    # Generiert realistisches OHLCV mit Constraints:
    # - open[i] = close[i-1] + noise (Kontinuitaet)
    # - high >= max(open, close)
    # - low <= min(open, close)
```

**Relevanz:** Unsere Tests nutzen aktuell manuell erstellte Listen.
Diese Funktion gewaehrleistet OHLC-Constraints automatisch.
Potenzielle Platzierung: `indicator_engine/helpers.py` als `generate_test_ohlcv()`
oder besser in `tests/conftest.py` als pytest Fixture.

---

## 6. pandas `rolling().std()` = Sample Std (ddof=1)

Kaabar bestaetigt in Ch. 2 explizit: `rolling(window).std()` nutzt **sample standard
deviation** (ddof=1) per Default. Das bestaetigt unseren F3-Fix in der Indikator-Engine.
Wilder (1978) und die meisten Trading-Bibliotheken verwenden ebenfalls ddof=1.
