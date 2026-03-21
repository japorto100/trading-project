# Kaabar Ch. 2 — Python & Daten-Referenz

> **Quelle:** Mastering Financial Markets with Python (Kaabar 2026), Kapitel 2
> **Stand:** 20. Maerz 2026
> **Zweck:** Extraktion der relevanten Utility-Funktionen und Datenquellen

---

## GitHub Repository

Kaabar's Buch-Code: https://github.com/sofienkaabar/mastering-financial-markets-in-python

Enthaelt:
- `master_library.py` — alle Funktionen des Buchs als Modul
- Historische OHLC-Dateien (CSV/XLSX) zum manuellen Import
- Alle Kapitel-Skripte

---

## Datenimport — master function `import_data()`

Kaabar nutzt eine zentrale Importfunktion mit 4 Providern:

```python
from master_library import import_data

# 1. Yahoo Finance (Default) — Aktien, ETFs, Indizes
my_data = import_data(name='AAPL', start_date='2017-01-01',
                      end_date='2025-06-01',
                      data_provider='yahoo_finance',
                      time_frame='daily')

# 2. MetaTrader 5 — Forex (EURUSD etc.), benoetigt MT5 Installation + Demo-Account
my_data = import_data(name='EURUSD', start_date='2017-01-01',
                      end_date='2025-06-01',
                      data_provider='metatrader',
                      time_frame='hourly')

# 3. FRED St. Louis — Wirtschaftsdaten (CPI, GDP, etc.), nur Close-Preis
my_data = import_data(name='CPIAUCSL', start_date='2017-01-01',
                      end_date='2025-06-01',
                      data_provider='fred')

# 4. Manuell — lokale Dateien
my_data = import_data(name='data.xlsx', data_provider='manual_import_xlsx')
my_data = import_data(name='data.csv', data_provider='manual_import_csv')
```

**Dependencies:** `yfinance`, `MetaTrader5`, `pandas_datareader`

**Relevanz fuer uns:** Wir nutzen Go-Gateway-Connectors (GCT, Finnhub, FRED etc.) statt
Python-Direktimport. Diese Funktion ist primaer fuer isoliertes Testen/Backtesting relevant.

---

## Hypothetische OHLC-Daten generieren

Nuetzlich fuer Unit-Tests und Backtesting ohne echte Marktdaten:

```python
def generate_ohlc_data(length_data=1000):
    data = {
        'open': np.zeros(length_data),
        'high': np.zeros(length_data),
        'low': np.zeros(length_data),
        'close': np.zeros(length_data)
    }
    data['open'][0] = np.random.uniform(100, 200)
    data['close'][0] = data['open'][0] + np.random.uniform(-5, 5)
    data['high'][0] = max(data['open'][0], data['close'][0]) + np.random.uniform(0, 5)
    data['low'][0] = min(data['open'][0], data['close'][0]) - np.random.uniform(0, 5)

    for i in range(1, length_data):
        data['open'][i] = data['close'][i-1] + np.random.uniform(-3, 3)
        data['close'][i] = data['open'][i] + np.random.uniform(-5, 5)
        data['high'][i] = max(data['open'][i], data['close'][i]) + np.random.uniform(0, 5)
        data['low'][i] = min(data['open'][i], data['close'][i]) - np.random.uniform(0, 5)

    return pd.DataFrame(data)
```

**Relevanz:** Unsere Tests nutzen aktuell manuell erstellte Listen. Diese Funktion koennte
als `generate_test_ohlcv()` in `indicator_engine/helpers.py` oder einem Test-Utility landen.
Vorteil: Realistische OHLC-Constraints (high >= max(open, close), low <= min(open, close)).

---

## Charting — `ohlc_plot()` + `signal_chart()`

Kaabar's Visualisierungsfunktionen (matplotlib-basiert):

- **`ohlc_plot()`**: 3 Modi — `bars` (duenne schwarze Balken), `candlesticks` (gruen/rot),
  `line` (nur Close)
- **`signal_chart()`**: Baut auf `ohlc_plot()` auf, ueberlagert gruene Pfeile (bullish) und
  rote Pfeile (bearish) an den Signal-Bars

**Relevanz:** Wir nutzen Frontend-Charts (TradingChart.tsx, ChartRenderer.ts). Diese
Matplotlib-Funktionen koennten aber fuer Jupyter-Notebooks oder Python-seitige
Debugging-Visualisierung nuetzlich sein.

---

## pandas Kurzreferenz (Buch-Konventionen)

```python
# DataFrame Zugriff
df['close']                     # Spalte
df[['high', 'low']]             # Mehrere Spalten
df.iloc[0]                      # Erste Zeile (Position)
df.iloc[-1]                     # Letzte Zeile
df.iloc[0:3]                    # Zeilen 0-2
df.iloc[:, 0]                   # Erste Spalte
df.loc[0, 'close']              # Zeile 0, Spalte 'close' (Label)

# Rolling-Berechnungen
df['sma'] = df['close'].rolling(window=5).mean()
df['std'] = df['close'].rolling(window=5).std()      # sample std (ddof=1)

# EMA / SMMA
df['ema'] = df['close'].ewm(span=N, adjust=False).mean()
df['smma'] = df['close'].ewm(span=(2*N-1), adjust=False).mean()

# Filter
df_filtered = df[df['close'] > 30]
df['above_30'] = df['close'] > 30
```

**Wichtig:** `rolling().std()` nutzt sample std (ddof=1) per default — deshalb unser F3-Fix.

---

## Kaabar's `master_library.py` Architektur

Kaabar packt ALLE Funktionen in eine einzige Datei `master_library.py`.
Unsere Phase-A-Extraktion (10 Category Modules) ist die Evolution dieses Patterns.

Kaabar's Importstil:
```python
from master_library import moving_average, generate_ohlc_data
```

Unser Aequivalent:
```python
from indicator_engine.trend import sma, ema
from indicator_engine.oscillators import rsi, macd
```

---

## Python-Dependencies — Kaabar vs. Wir

| Kaabar (Ch. 2) | Zweck | Wir | Anmerkung |
|:----------------|:------|:----|:----------|
| `numpy` | Numerik | `numpy>=2.0.0` | Gleich, in pyproject.toml |
| `pandas` | DataFrames | `pandas` | Gleich |
| `matplotlib` | Charts | — | Frontend-Charts (TradingChart.tsx) statt Python-Plots |
| `yfinance` | Aktien-Daten | — | Finnhub via Go Gateway |
| `MetaTrader5` | Forex-Daten | — | GCT via Go Gateway (30+ Exchanges) |
| `pandas_datareader` | FRED-Daten | — | `go-backend/internal/connectors/fred/` |
| `scipy` | Statistik | `scipy.stats` | Nur fuer Deflated Sharpe (unsere Erweiterung) |
| — | ML | `hmmlearn`, `scikit-learn` | Unsere Erweiterung (Regime Detection) |

**Kernunterschied:** Kaabar importiert Daten direkt in Python. Wir lassen Go alle Daten
holen und liefern OHLCV als Input an Python/Rust. Python hat keinen Netzwerk-Zugriff
auf Datenquellen im Production-Pfad.

---

## Buch-Struktur Ueberblick (alle 12 Kapitel)

| Kap. | Titel | Unsere Module |
|:-----|:------|:-------------|
| 1 | Classic vs Modern Technical Analysis | `trend.py` (SMA, EMA, RSI Basics) |
| 2 | Python & Time Series (diese Referenz) | Utility-Funktionen, keine Indikatoren |
| 3 | Modern Techniques & Indicators | `trend.py`, `oscillators.py`, `volatility.py` |
| 4 | Alternative Charting Systems | `volume.py` (Vol Candles), Heikin-Ashi, K's CCS |
| 5 | Advanced Fibonacci | `helpers.py` (Swing Detection), `patterns.py` (Fib) |
| 6 | Advanced Volatility | `volatility.py` (ATR, SWV, EWSD) |
| 7 | Candlestick Patterns | `patterns.py` (Doji, R, Bottle, etc.) |
| 8 | Harmonic Patterns | `patterns.py` (ABCD, Gartley, Crab, FEIW) |
| 9 | Timing Patterns | `patterns.py` (TD Setup, Fib Timing) |
| 10 | Price Patterns | `patterns.py` (Double Top/Bottom, H&S, Gaps) |
| 11 | K's Collection | `oscillators.py` (6 proprietaere Indikatoren) |
| 12 | Performance Evaluation | `quant.py` + `backtest.py` |

Detaillierter Audit aller Kapitel: `docs/KAABAR_BOOK_AUDIT.md`

---

## Fazit

Kapitel 2 liefert keine Indikator-Formeln, aber nuetzliche Referenzen:
1. **GitHub-Repo** fuer Buchcode-Vergleich
2. **`generate_ohlc_data()`** als potentielles Test-Utility
3. **pandas `rolling().std()` = sample std** — bestaetigt unseren F3-Fix
4. **FRED als Datenquelle** — wir haben bereits `go-backend/internal/connectors/fred/`
5. **Datenfluss-Architektur** grundlegend anders als Kaabar → siehe `docs/BACKTESTING_ARCHITECTURE.md`
