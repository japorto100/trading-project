# Project Audit - Kapitel 1-7 (ausgelagert aus project_audit2)

Stand: 14. Februar 2026
Quelle: docs/project_audit2.md

---
## 1. Executive Summary

### Umsetzungsstatus (14. Februar 2026)

#### Erledigt

- Phase 1.1 umgesetzt: `src/chart/indicators/` entfernt (toter Code-Pfad aufgeloest).
- Phase 1.2 umgesetzt: Legacy-Duplikate (`calculateSMA`, `calculateEMA`, `calculateRSI`) aus `src/lib/chartData.ts` entfernt.
- Phase 1.3 umgesetzt: Indicator-UI erweitert (`HMA`, `ADX`, `Ichimoku`, `Parabolic SAR`, `Keltner`, `Volume Profile`, `Support/Resistance`).
- Phase 1.4 umgesetzt: `calculateVolumeProfile()` an Chart-Overlay angebunden (Top-Volumenlevel als horizontale Linien).
- Phase 1.5 umgesetzt: `findSupportResistance()` als horizontale Linien im Chart gerendert.
- Erweiterte Indikator-Bibliothek konsolidiert in `src/lib/indicators/index.ts` (u.a. `HMA`, `ADX`, `Ichimoku`, `Parabolic SAR`, `Keltner`).
- Phase 3.9 umgesetzt: FastAPI-Soft-Signal-Microservice als optionales Sidecar unter `python-backend/services/geopolitical-soft-signals/` angelegt und an Next.js-Adapter angebunden.
- `/api/geopolitical/candidates/ingest/soft` fuehrt jetzt Adapter aus, wendet Anti-Noise + Budget an und persistiert Kandidaten.
- Python-Backend konsolidiert in `python-backend/` mit klarer Trennung:
  - Services: `python-backend/services/finance-bridge` und `python-backend/services/geopolitical-soft-signals`
  - ML/AI-Pipeline: `python-backend/ml_ai/geopolitical_soft_signals/`
  - Shared Runtime/Deps + Scripts: `python-backend/.venv` + `python-backend/pyproject.toml` und `python-backend/scripts/`
- Python-Setup auf `uv` standardisiert (venv + dependency install), inkl. optionalem ML-Requirements-Layer.
- Lokaler Komfort-Start vorhanden: `bun run dev:with-python` (Next.js + Python-Sidecars).
- Smoke-Runner fuer Soft-Signal-Kandidaten verfuegbar: `bun run smoke:soft-signals`.
- Portfolio Tracking UI umgesetzt: neuer Sidebar-Tab `Portfolio` mit Positionen, P&L (realized/unrealized/total), Win-Rate und Max Drawdown auf Basis der Paper-Orders.

#### Offen

- Keine offenen Punkte mehr in Phase 1 (Roadmap 10, Punkte 1-5 abgeschlossen).
- Roadmap 10/11 sind als NLP/ML-MVP umgesetzt (TF-IDF + MiniBatchKMeans optional via scikit-learn, heuristischer Fallback ohne ML-Dependencies).

#### Best-Practice ENV (Soft-Signals)

- `GEOPOLITICAL_SOFT_SIGNAL_ENABLED=false` (Default; nur aktivieren wenn Service wirklich laeuft)
- `GEOPOLITICAL_SOFT_SIGNAL_URL=http://127.0.0.1:8091` (expliziter Loopback)
- `GEOPOLITICAL_SOFT_SIGNAL_TIMEOUT_MS=8000` (kurzer Timeout fuer robuste API-Route)
- `GEOPOLITICAL_SOFT_SIGNAL_MAX_CANDIDATES=6` (kontrollierte Last + dedup-freundlich)

### Befund

Das Projekt hat **solide mathematische Indikator-Implementierungen** (~2470 Zeilen), aber leidet unter:

| Problem | Schwere | Details |
|---------|---------|---------|
| **Dreifach-Duplikation** bei Indikatoren | HOCH | SMA, EMA, RSI existieren in 3 separaten Dateien |
| **Tote Code-Pfade** | HOCH | `src/chart/indicators/` (1650 Zeilen) wird nirgends importiert |
| **UI-Luecke** | HOCH | 22+ berechnete Indikatoren, nur 9 im UI-Panel sichtbar |
| **Kein WebSocket** | HOCH | 14 REST-Provider, 0 WebSocket-Verbindungen |
| **Kein Backtesting** | HOCH | Null Implementierung vorhanden |
| **Leere AI-Adapter** | MITTEL | 3 Soft-Signal-Adapter sind Scaffolds (empty functions) |
| **Kein Go/Python Backend** | INFO | Alles laeuft in Next.js API Routes (single-process) |

### Staerken

- Mathematik der Indikatoren ist **korrekt und produktionsreif**
- Paper Trading mit Prisma/SQLite ist **funktional**
- Provider-System mit Circuit-Breaker ist **gut durchdacht**
- Geopolitical Pipeline (Confidence, Anti-Noise, Dedup) ist **architektonisch sauber**
- SignalInsightsBar zeigt, dass **Custom-Konzepte (Heartbeat, RVOL, CMF)** bereits live sind

---

## 2. Indikator-System: Vollstaendige Analyse

### 2.1 Drei separate Implementierungen (Duplikation!)

Es gibt **drei Dateien** die unabhaengig voneinander Indikatoren implementieren:

#### Datei A: `src/lib/indicators/index.ts` (824 Zeilen) - PRIMAER
**Status: AKTIV - wird von page.tsx und components importiert**

| Indikator | Funktion | Zeilen | Mathematisch korrekt? | Im UI verbunden? |
|-----------|----------|--------|----------------------|-----------------|
| SMA | `calculateSMA()` | 22-37 | Ja - Standard Sliding Window | Ja (Overlay + SignalInsights) |
| EMA | `calculateEMA()` | 40-68 | Ja - korrekte Multiplier-Formel | Ja (Overlay) |
| WMA | `calculateWMA()` | 71-96 | Ja - gewichtete Summe | Nein - nur exportiert |
| RSI | `calculateRSI()` | 98-141 | Ja - Wilder's smoothing | Ja (Sub-Chart) |
| Stochastic | `calculateStochastic()` | 144-189 | Ja - %K und %D korrekt | Nein - nur exportiert |
| MACD | `calculateMACD()` | 191-260 | Ja - Fast/Slow EMA + Signal | Nein - nur exportiert |
| Bollinger Bands | `calculateBollingerBands()` | 264-300 | Ja - SMA +/- n*StdDev | Ja (Overlay) |
| ATR | `calculateATR()` | 302-340 | Ja - True Range smoothed | Ja (SignalInsights) |
| Volume Profile | `calculateVolumeProfile()` | 352-394 | Ja - price-level volume distribution | Nein - nur exportiert |
| VWAP | `calculateVWAP()` | 400-440 | Ja - kumulative TypPrice*Vol/Vol | Ja (Overlay) |
| VWMA | `calculateVWMA()` | 443-445 | Ja - delegiert an SMAATRChannel | Ja (Overlay) |
| SMA-ATR Channel | `calculateSMAATRChannel()` | 448-494 | Ja - SMA +/- ATR*Multiplier | Ja (Overlay) |
| SMA Cross Events | `detectSMACrossEvents()` | 498-552 | Ja - Cross-Up/Down Detection | Ja (SignalInsights) |
| RVOL | `calculateRVOL()` | 555-597 | Ja - Relative Volume vs SMA | Ja (SignalInsights) |
| OBV | `calculateOBV()` | 574-598 (ueberlappend) | Ja - On-Balance Volume | Ja (SignalInsights) |
| CMF | `calculateCMF()` | 600-640 | Ja - Chaikin Money Flow | Ja (SignalInsights) |
| Heartbeat Pattern | `analyzeHeartbeatPattern()` | 643-738 | Ja - Pivot + CV-Scoring | Ja (SignalInsights) |
| Support/Resistance | `findSupportResistance()` | 751-800 | Ja - Local Extrema Clustering | Nein - nur exportiert |

**Bewertung:** 18 Indikatoren, 12 aktiv verbunden, 6 nur exportiert aber nicht genutzt.

#### Datei B: `src/chart/indicators/advanced.ts` (616 Zeilen) - INAKTIV
**Status: TOTER CODE - wird von nichts ausserhalb des chart/indicators/ Verzeichnisses importiert**

| Indikator | Funktion | Zeilen | Mathematisch korrekt? | Im UI verbunden? |
|-----------|----------|--------|----------------------|-----------------|
| Elliott Wave | `detectElliottWaves()` | 27-102 | Vereinfacht - nur Swing Detection | NEIN |
| Ichimoku Cloud | `calculateIchimoku()` | 118-191 | Ja - alle 5 Linien + Cloud | NEIN |
| HMA (Hull MA) | `calculateHMA()` | 197-258 | Ja - WMA(2*WMA(n/2) - WMA(n), sqrt(n)) | NEIN |
| ADX | `calculateADX()` | 261-335 | Ja - DI+, DI-, ADX korrekt | NEIN |
| Parabolic SAR | `calculateParabolicSAR()` | 342-415 | Ja - AF-Stepping korrekt | NEIN |
| Williams %R | `calculateWilliamsR()` | 417-439 | Ja - (H-C)/(H-L)*-100 | NEIN |
| CCI | `calculateCCI()` | 441-468 | Ja - (TP-SMA)/(0.015*MD) | NEIN |
| MFI | `calculateMFI()` | 470-512 | Ja - Money Flow Index korrekt | NEIN |
| Keltner Channels | `calculateKeltnerChannels()` | 520-616 | Ja - EMA +/- ATR*Mult | NEIN |

**Bewertung:** 9 Indikatoren, ALLE mathematisch korrekt, KEINER verbunden. 616 Zeilen toter Code.

#### Datei C: `src/chart/indicators/index.ts` (1033 Zeilen) - TEILWEISE INAKTIV
**Status: TOTER CODE - Reimplementiert alles aus A+B mit eigenem Typsystem**

Diese Datei reimplementiert viele der obigen Indikatoren nochmals mit einem `Candle`-Typ (statt `OHLCV`-Typ aus Datei A):
- `calculateSMA()` (nochmal, Zeile 16)
- `calculateEMA()` (nochmal, Zeile 36)
- `calculateHMA()` (nochmal, Zeile 118)
- `calculateMACD()` (nochmal, Zeile 185)
- `calculateADX()` (nochmal, Zeile 235)
- `calculateIchimoku()` (nochmal, Zeile 296)
- `calculateParabolicSAR()` (nochmal, Zeile 345)
- `calculateBollingerBands()` (nochmal, Zeile 408)
- `calculateKeltnerChannels()` (nochmal, Zeile 440)
- `calculateATR()` (nochmal, Zeile 476)
- `calculateRSI()` (nochmal, Zeile 520)
- `calculateStochastic()` (nochmal, Zeile 582)
- `calculateCCI()` (nochmal, Zeile 623)
- `calculateWilliamsR()` (nochmal, Zeile 652)
- `calculateMFI()` (nochmal, Zeile 675)
- `calculateVWAP()` (nochmal, Zeile 732)
- `calculateOBV()` (nochmal, Zeile 757)

PLUS ein `INDICATORS[]`-Registry-Array (Zeile 841) mit `IndicatorDefinition`-Objekten und einer `calculateIndicator()`-Dispatcher-Funktion. Dieses Registry-System ist **architektonisch gut**, aber **von nichts importiert**.

#### Datei D: `src/lib/chartData.ts` (Zeilen 120-200) - LEGACY
**Status: LEGACY - dritte Kopie von SMA/EMA/RSI mit `CandleData`-Typ**

Noch eine weitere Kopie von `calculateSMA`, `calculateEMA`, `calculateRSI` -- diesmal mit dem `CandleData`-Typ aus der Lightweight Charts Integration. Wird von `TradingChart.tsx` verwendet.

### 2.2 Zusammenfassung: Indikator-Chaos

```
Indikator-Funktionen Total: ~45 Funktionen
Davon Duplikate:           ~20 (3x SMA, 3x EMA, 3x RSI, 2x MACD, 2x ATR, 2x Bollinger, etc.)
Davon toter Code:          ~25 Funktionen (chart/indicators/ komplett + chartData.ts teilweise)
Einzigartige Algorithmen:  ~22 verschiedene Indikatoren
Im UI sichtbar/nutzbar:     9 (IndicatorPanel: SMA, EMA, RSI, MACD, Bollinger, VWAP, VWMA, ATR, ATR-Channel)
In SignalInsightsBar:        7 (SMA50, Cross Events, RVOL, CMF, OBV, Heartbeat, ATR)
Nicht verbunden:            ~9 (Elliott Wave, Ichimoku, HMA, ADX, Parabolic SAR, Williams%R, CCI, MFI, Keltner, VolumeProfile, S/R)
```

### 2.3 Spezifische Konzepte im Detail

#### "50-Day Average" (Line in the Sand)
- **Implementiert:** Ja, in `src/lib/indicators/index.ts` als `calculateSMA(data, 50)`
- **Verbunden:** Ja, in `page.tsx` Zeile 681: `calculateSMA(lineData, 50)`
- **UI-Anzeige:** Ja, im `SignalInsightsBar` als "Line (Daily SMA50): above/below"
- **Cross-Detection:** Ja, `detectSMACrossEvents(lineData, 50)` mit "Last Cross" Anzeige
- **Bewertung:** VOLLSTAENDIG implementiert und funktional

#### "Heartbeat Pattern" (Rhythm of Money)
- **Implementiert:** Ja, in `src/lib/indicators/index.ts` als `analyzeHeartbeatPattern()`
- **Algorithmus:** Pivot-Detection + Coefficient-of-Variation (CV) fuer Period/Amplitude Stability
- **Output:** Score (0-1), cycleBars (mittlere Zykluslaenge), swings, periodStability, amplitudeStability
- **Verbunden:** Ja, in `page.tsx` Zeile 696: `analyzeHeartbeatPattern(viewCandleData, 0.02)`
- **UI-Anzeige:** Ja, im `SignalInsightsBar` als "Rhythm: X% (~Y bars)" mit Farbkodierung (gruen >70%, gelb >40%, grau)
- **Bewertung:** VOLLSTAENDIG implementiert und funktional. Eigenentwicklung (kein Standard-Indikator).

#### "Volume = Power" (Follow the Smart Money)
- **RVOL (Relative Volume):** Implementiert, `calculateRVOL()` - zeigt ob aktuelles Volume ueberdurchschnittlich ist
- **OBV (On-Balance Volume):** Implementiert, `calculateOBV()` - kumulativer Kauf-/Verkaufsdruck
- **CMF (Chaikin Money Flow):** Implementiert, `calculateCMF()` - Geldfluss-Indikator
- **Volume Profile:** Implementiert, `calculateVolumeProfile()` - ABER nicht im UI verbunden
- **VWAP:** Implementiert, `calculateVWAP()` - im UI als Overlay verfuegbar
- **Verbunden:** Ja, RVOL/OBV/CMF alle im SignalInsightsBar sichtbar
- **Bewertung:** GROSSTEILS implementiert. Volume Profile fehlt im UI. Kein Order-Flow-Analyse (Level 2).

### 2.4 Was WIRKLICH fehlt bei den Indikatoren

| Fehlend | Kategorie | Wichtigkeit | Empfehlung |
|---------|-----------|-------------|------------|
| Fibonacci Retracements/Extensions | Technisch | HOCH | In TypeScript machbar, Drawing Tool Erweiterung |
| Pivot Points (Standard, Camarilla, Woodies) | Technisch | MITTEL | Einfache Berechnung, TypeScript |
| Supertrend | Trend | MITTEL | ATR-basiert, TypeScript |
| Donchian Channels | Volatilitaet | NIEDRIG | Einfach, TypeScript |
| VWMA (eigenstaendig) | Volume | NIEDRIG | Schon als Teil von SMAATRChannel |
| Order Flow / Footprint | Markttiefe | HOCH | Benoetigt WebSocket L2-Daten -> Go Backend |
| Heatmap / Liquidation Levels | Crypto-spezifisch | HOCH | Benoetigt Exchange WebSocket -> Go Backend |
| **Pattern Recognition (Candlestick)** | Analyse | **HOCH** | **Python Service, Buch Ch.7 (Doji, R Pattern, Extreme Euphoria etc.)** |
| **Pattern Recognition (Harmonic)** | Analyse | **HOCH** | **Python Service, Buch Ch.8 (ABCD, Gartley, Crab, FEIW)** |
| **Pattern Recognition (Timing)** | Analyse | **HOCH** | **Python Service, Buch Ch.9 (TD Setup, Fibonacci Timing)** |
| **Pattern Recognition (Price)** | Analyse | **HOCH** | **Python Service, Buch Ch.10 (Double Top, H&S, Gaps)** |
| **Composite Signal (Dreier-Signal)** | Trading Signal | **HOCH** | **Python Service, eigene Architektur (50-Day + Heartbeat + Volume)** |
| **Elliott Wave (richtige Impl.)** | Analyse | **HOCH** | **Python Service, eigene Impl. (alte advanced.ts war nur Stub)** |
| **K's Indicator Collection (6 Stueck)** | Indikator | MITTEL | Python Service, Buch Ch.11 (K's Reversal I+II, ATR-RSI, RSI^2, MARSI, Fib MA) |
| **Performance Evaluation** | Bewertung | **HOCH** | **Python Service, Buch Ch.12 (Sharpe, Sortino, Expectancy, Profit Factor)** |
| **Alternative Charting** | Visualisierung | MITTEL | Python Transform + TS Render, Buch Ch.4 (Heikin-Ashi, Volume Candles, CARSI) |
| **Advanced Fibonacci** | Technisch | **HOCH** | **Python Service, Buch Ch.5 (swing_detect, Retracements, 23.6%/61.8% Techniken)** |
| **Exotische Moving Averages** | Indikator | MITTEL | Python Service, Buch Ch.3 (KAMA, ALMA, IWMA) |
| **Advanced Volatility** | Indikator | MITTEL | Python Service, Buch Ch.6 (Spike-Weighted Volatility, Volatility Index) |

> **Vollstaendige Indikator-Planung:** Fuer die detaillierte Aufschluesselung aller fehlenden Indikatoren, Pattern Recognition Algorithmen und Buch-Referenzen mit Zeilennummern siehe [`docs/INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md).

---

## 3. Zwei Chart-Engines: Zustand & Problem

### 3.1 Engine A: Lightweight Charts (TradingView)
- **Pfad:** Dynamischer Import in `src/components/TradingChart.tsx`
- **Nutzung:** Hauptchart + RSI Sub-Chart
- **Indikatoren:** SMA, EMA, Bollinger, VWAP, ATR-Channel ueber `indicatorSeries.ts`
- **Status:** AKTIV, Hauptvisualisierung

### 3.2 Engine B: Custom Canvas Engine
- **Pfad:** `src/chart/engine/` (ChartEngine.ts, Layers.ts, CoordinateSystem.ts, ChartRenderer.ts)
- **Features:** Layer-System, Drawing Tools, Crosshair, Zoom, Pan
- **Indikator-Layer:** `IndicatorLayer` existiert mit `setIndicators()` und `setIndicatorData()`
- **Problem:** Hat ein eigenes Indikator-Typsystem (`IndicatorConfig`, `IndicatorResult`) das nicht kompatibel ist mit den berechneten Daten aus `src/lib/indicators/`
- **Status:** TEILAKTIV - Engine wird fuer Chart-Typ-Wechsel (Candle/Line/Area) verwendet

### 3.3 Das Verbindungs-Problem

```
[src/lib/indicators/index.ts]  --> exportiert OHLCV-basierte IndicatorData[]
     |
     +--> [page.tsx / SignalInsightsBar]     VERBUNDEN (SMA50, Heartbeat, RVOL, CMF, OBV)
     +--> [TradingChart.tsx / indicatorSeries.ts]  VERBUNDEN (SMA, EMA, BB, VWAP via LWC)
     +--> [chart/engine/IndicatorLayer]      NICHT VERBUNDEN (braucht IndicatorResult-Format)

[src/chart/indicators/index.ts]  --> exportiert Candle-basierte IndicatorPoint[]
     |
     +--> NIRGENDS importiert. TOTER CODE.
     +--> Hat ein INDICATORS[] Registry das nirgends genutzt wird.

[src/chart/indicators/advanced.ts]  --> exportiert OHLCV-basierte spezifische Typen
     |
     +--> Nur von chart/indicators/index.ts importiert (was selbst tot ist)

[src/lib/chartData.ts]  --> exportiert CandleData-basierte IndicatorData[]
     |
     +--> Von TradingChart.tsx importiert (Legacy-Pfad)
```

### 3.4 Konkretes Resultat

- **22 Indikatoren berechnet, 16 nie auf dem Chart sichtbar**
- Die Custom Engine hat einen fertigen `IndicatorLayer` der auf Daten wartet die nie kommen
- Das `INDICATORS[]`-Registry in `chart/indicators/index.ts` ist ein **gutes Design** das nie angeschlossen wurde
- `TradingChart.tsx` importiert direkt aus `src/lib/indicators/` und `src/lib/chartData.ts` -- die Custom Engine wird umgangen

---

## 4. Datenfluss-Audit: Was verbunden ist, was nicht

### 4.1 Marktdaten-Pipeline

```
[14 REST-Provider] --> ProviderManager (Circuit Breaker + Fallback)
      |
      +--> /api/market/ohlcv  --> page.tsx --> CandleData state
      |                                         |
      |                                         +--> TradingChart (LWC)
      |                                         +--> Indicator Calculations
      |                                         +--> SignalInsightsBar
      |
      +--> /api/market/stream (SSE)  --> Real-time price updates
      |                                   |
      |                                   +--> Paper Order Auto-Fill
      |                                   +--> Ticker Price Display
      |
      +--> /api/market/quotes  --> Multi-Symbol Quotes
```

**Problem:** Alles REST-basiert. SSE fuer Streaming, kein WebSocket. Bedeutet:
- Keine echte Tick-by-Tick Daten
- Kein Level 2 / Order Book
- Kein sub-second Latenz moeglich
- SSE ist unidirektional (Server -> Client), keine Subscription-Verwaltung

### 4.2 Geopolitical Pipeline

```
[Hard Signals]                  [Soft Signals (LEER!)]
  |                                |
  +--> /api/geopolitical/         +--> 3x emptyAdapter()
       candidates/ingest/              - news_cluster: return []
       hard/                           - social_surge: return []
                                       - narrative_shift: return []
  |
  +--> Confidence Scoring (confidence.ts)     FUNKTIONAL
  +--> Anti-Noise Filter (anti-noise.ts)      FUNKTIONAL
  +--> Deduplication (dedup.ts)               FUNKTIONAL
  +--> Validation (validation.ts)             FUNKTIONAL + getestet
  +--> Alert Routing (alerts-routing.ts)      FUNKTIONAL + getestet
  +--> Source Health (source-health.ts)        FUNKTIONAL
  +--> Ingestion Budget (ingestion-budget.ts)  FUNKTIONAL
```

**Bewertung:** Die Pipeline-Architektur ist sauber. Die Hard-Signal-Seite funktioniert. Die Soft-Signal-Seite (AI/ML) ist komplett leer -- genau hier kommt Python rein.

### 4.3 Paper Trading Pipeline

```
[/api/fusion/orders] --> orders-store.ts (Prisma/SQLite)
      |
      +--> CREATE: Market/Limit/Stop/Stop-Limit Orders
      +--> FILL: Auto-Fill bei SSE-Price-Updates
      +--> SL/TP: Stop-Loss und Take-Profit Ausfuehrung
```

**Funktional, aber:**
- Kein Portfolio-Tracking (Gesamtwert, P&L, Drawdown)
- Kein Positions-Management (Aggregation mehrerer Orders)
- Kein Backtesting (historische Order-Ausfuehrung)
- Kein Risk-Management (Position Sizing, Max Drawdown)

---

## 5. Market Data Provider: Infrastruktur-Bewertung

### 5.1 Aktuelle Provider (14 Stueck)

| Provider | Typ | API Key noetig? | Asset-Klassen | Besonderheit |
|----------|-----|-----------------|---------------|-------------|
| Alpha Vantage | REST | Ja | Stocks, Forex, Crypto | Rate Limited (5/min free) |
| Finnhub | REST | Ja | Stocks, Forex, Crypto | Hat WebSocket API (NICHT genutzt!) |
| Twelve Data | REST | Ja | Stocks, Forex, Crypto | Solides OHLCV |
| Polygon | REST | Ja | Stocks, Options, Crypto | Bestes US-Stock API |
| FMP | REST | Ja | Stocks | Financial Modeling |
| EODHD | REST | Ja | Stocks, ETFs | End-of-Day fokussiert |
| MarketStack | REST | Ja | Stocks | Budget-Option |
| CoinMarketCap | REST | Ja | Crypto | Crypto-Rankings |
| Finage | REST | Ja | Stocks, Forex, Crypto | WebSocket verfuegbar (NICHT genutzt!) |
| Yahoo (inoffiziell) | REST/Scraping | Nein | Alles | Instabil, kann jederzeit brechen |
| YFinance Bridge | REST | Optional | Alles | Python-Bridge |
| FRED | REST | Ja | Wirtschaftsdaten | Macro-Indikatoren |
| ECB | REST | Nein | Wechselkurse | Europaeische Zentralbank |
| Demo | Intern | Nein | Simuliert | Fallback |

### 5.2 Circuit Breaker Implementierung

```typescript
// src/lib/providers/index.ts
circuitFailureThreshold = 3;  // 3 Fehler -> Circuit oeffnet
circuitOpenMs = 60000;        // 60s Wartezeit
timeoutMs = 7000;             // 7s Timeout pro Request
quotesConcurrency = 6;        // Max 6 parallele Anfragen
```

**Bewertung:** Solide Implementierung. Aber:
- Kein Health-Check (Provider werden nur bei Nutzung getestet)
- Kein automatisches Rate-Limiting pro Provider
- Fallback-Kette ist statisch (keine dynamische Priorisierung basierend auf Latenz)

### 5.3 Das WebSocket-Problem

Finnhub und Finage bieten beide WebSocket-APIs, die **bereits als Provider registriert** sind, aber nur ueber REST angesprochen werden. Das bedeutet:
- Jede "live" Price-Aktualisierung ist ein SSE-Polling-Loop der REST-Calls macht
- Latenz: 1-5 Sekunden statt <100ms
- CPU-Last: Server pollt staendig statt auf Push zu warten

**Zwei separate Entscheidungen:**
- **Crypto-WebSocket:** GoCryptoTrader uebernimmt nativ -- 30+ Exchanges mit WebSocket, Auto-Reconnect, Rate Limiting. Das ist der primaere Upgrade-Pfad.
- **Stocks/Forex-WebSocket:** Finnhub/Finage bieten native WS-APIs die unabhaengig von GoCryptoTrader als optionales Upgrade eingebaut werden koennen. Geringere Prioritaet, weil Stock-Daten seltener Tick-Level-Latenz brauchen.

**CCXT als Ergaenzung:** [CCXT](https://github.com/ccxt/ccxt) (40.900 Stars, MIT, 100+ Exchanges) ist als TS-native Library komplementaer zu GoCryptoTrader. GCT deckt 30+ Exchanges per WebSocket ab. CCXT deckt den "Long Tail" an Exchanges per REST ab und dient als Fallback in der TS-Schicht. Zwei parallele Pipelines -- **GCT = primaer fuer Crypto, bestehende REST-Provider = primaer fuer Stocks/Forex/Macro**.

---

## 6. Paper Trading & Order System: Luecken

### 6.1 Was existiert

| Feature | Status | Datei | Details |
|---------|--------|-------|---------|
| Order Types | Funktional | `orders/types.ts` | Market, Limit, Stop, Stop-Limit |
| Order CRUD | Funktional | `orders-store.ts` | Prisma/SQLite |
| Auto-Fill | Funktional | `page.tsx` | SSE-basiert |
| Stop-Loss | Funktional | `orders-store.ts` | Bei Market-Price Trigger |
| Take-Profit | Funktional | `orders-store.ts` | Bei Market-Price Trigger |

### 6.2 Was fehlt

| Feature | Wichtigkeit | Beschreibung |
|---------|-------------|-------------|
| Portfolio Tracking | HOCH | Gesamtwert, unrealisierter P&L, Drawdown |
| Position Aggregation | HOCH | Mehrere Orders zu einer Position zusammenfassen |
| P&L History | HOCH | Historische Performance-Tracking |
| Risk Management | HOCH | Position Sizing basierend auf ATR/Risk |
| Trade Journal | MITTEL | Notizen, Screenshots pro Trade |
| Backtesting | HOCH | Historische Strategy-Ausfuehrung -> Komplett fehlend |
| Strategy Engine | MITTEL | Regelbasierte Order-Generierung |
| Multi-Asset Portfolio | NIEDRIG | Mehrere Symbole gleichzeitig tracken |

---

## 7. Geopolitical Map: AI/ML-Luecken

### 7.1 Was existiert (Pipeline-Architektur)

Die Geopolitical-Pipeline hat **17 Dateien** und ist architektonisch sauber aufgebaut:

```
Ingestion -> Validation -> Confidence Scoring -> Deduplication -> Anti-Noise -> Alert Routing
```

Mit Tests fuer Validation, Quality und Alert Routing. Das ist solide.

### 7.2 Die drei leeren Soft-Signal-Adapter

```typescript
// src/lib/geopolitical/adapters/soft-signals.ts
async function emptyAdapter(): Promise<GeoCandidate[]> {
    return [];  // <-- Hier muss AI/ML rein
}

SOFT_SIGNAL_ADAPTERS = [
    { id: "news_cluster",    run: emptyAdapter },  // -> NLP: Headline Clustering
    { id: "social_surge",    run: emptyAdapter },  // -> NLP: Social Media Monitoring
    { id: "narrative_shift", run: emptyAdapter },  // -> NLP: Multi-Day Theme Tracking
]
```

### 7.3 Was hier rein muss (Python-Microservices)

| Adapter | Python-Technologie | Beschreibung |
|---------|-------------------|-------------|
| `news_cluster` | HDBSCAN + Sentence-Transformers | Headlines von News-Providern clustern, aehnliche Events gruppieren |
| `social_surge` | FinBERT + Volume-Detection | Social Media (Reddit, X) nach Chatter-Spikes durchsuchen |
| `narrative_shift` | LLM (Ollama/Mistral lokal) | Multi-Tages-Trends in Narrativen erkennen |

**Integrations-Muster:** Next.js API Route -> HTTP POST an Python FastAPI Microservice -> GeoCandidate[] zurueck.

---

