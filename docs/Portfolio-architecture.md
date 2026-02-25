# Portfolio Architecture -- Deep Dive

> **Stand:** 18. Februar 2026
> **Scope:** Vollstaendige Portfolio-Architektur ueber alle Schichten (Go/GCT → Python Analytics → TypeScript/Next.js Frontend). Multi-Asset Erweiterung, GCT-Bridge, Analytics-Pipeline, Frontend-Visualisierung, Buch-Referenzen, ~30 konkrete Aufgaben.
> **Verknuepfungen:**
> - [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) Sektion 5.P (Portfolio Analytics Endpoints + Todos #51-57)
> - [project_audit2.md](./archive/project_audit2.md) (Gesamt-Audit, archiviert -- offene Items in Domain-MDs verteilt)
> - [go-research-financial-data-aggregation-2025-2026.md](./go-research-financial-data-aggregation-2025-2026.md) (Data Router fuer Multi-Source)
> - [Future-Quant-trading.md](./Future-Quant-trading.md) (Reine Quant-Konzepte -- ML-Pipeline, Factor Models)
> - [RUST_LANGUAGE_IMPLEMENTATION.md](./RUST_LANGUAGE_IMPLEMENTATION.md) (Rust/PyO3 Acceleration)

---

## Inhaltsverzeichnis

1. [Ist-Zustand: Drei getrennte Welten](#1-ist-zustand-drei-getrennte-welten)
2. [GCT Multi-Asset Erweiterung](#2-gct-multi-asset-erweiterung)
3. [Drei-Schichten-Zielarchitektur](#3-drei-schichten-zielarchitektur)
4. [Schicht 1: Go/GCT -- Daten und Execution](#4-schicht-1-gogct----daten-und-execution)
5. [Schicht 2: Python/FastAPI -- Analytics Intelligence](#5-schicht-2-pythonfastapi----analytics-intelligence)
6. [Schicht 3: TypeScript/Next.js -- Frontend](#6-schicht-3-typescriptnextjs----frontend)
7. [Network Layer: Wie die Schichten kommunizieren](#7-network-layer-wie-die-schichten-kommunizieren)
8. [Buch-Referenzen und theoretische Fundierung](#8-buch-referenzen-und-theoretische-fundierung)
9. [Implementierungs-Roadmap](#9-implementierungs-roadmap)
10. [Querverweis-Tabelle](#10-querverweis-tabelle)

---

## 1. Ist-Zustand: Drei getrennte Welten

Aktuell existieren drei Portfolio-Systeme die **nicht miteinander verbunden** sind:

### 1.1 GoCryptoTrader `portfolio/` (Live Wallet Tracker)

| Aspekt | Detail |
|---|---|
| **Pfad** | `go-backend/vendor-forks/gocryptotrader/portfolio/` |
| **Kern-Struct** | `Base` mit `[]Address` (Coin, Balance, Description, WhiteListed, ColdStorage) |
| **Was es tut** | Pollt Exchange-Balances alle 60s via `portfolioManager.processPortfolio()` |
| **Blockchain APIs** | Ethplorer (ETH), CryptoID (Multi-Coin), XRPScan (XRP) |
| **Summary** | `GetPortfolioSummary()` → Totals, Online/Offline, pro-Coin Prozentanteile |
| **Engine** | `engine/portfolio_manager.go` startet als Subsystem, laeuft im Hintergrund |
| **CLI** | `cmd/portfolio/portfolio.go` gibt alles in der Konsole aus |
| **Limitierung** | Nur Crypto. Nur Balances. Kein P&L, kein Drawdown, keine History |

### 1.2 GoCryptoTrader `backtester/eventhandlers/portfolio/` (Backtest Engine)

| Aspekt | Detail |
|---|---|
| **Pfad** | `go-backend/vendor-forks/gocryptotrader/backtester/eventhandlers/portfolio/` |
| **Holdings** | `Holding` Struct: BaseValue, TotalFees, TotalValueLostToSlippage, TotalValueLostToVolumeSizing, ChangeInTotalValuePercent, IsLiquidated |
| **Risk** | `Risk` Struct: MaximumHoldingRatio, MaxLeverageRate, MaximumOrdersWithLeverageRatio |
| **Size** | `Size` Struct: BuySide/SellSide MinMax Limits |
| **Compliance** | `Manager` mit `[]Snapshot` -- History aller Orders mit SlippageRate, CostBasis, VolumeAdjustedPrice |
| **PNL** | `PNLSummary` fuer Futures: Unrealised/Realised PNL mit CollateralCurrency |
| **Handler Interface** | `OnSignal()`, `OnFill()`, `ViewHoldingAtTimePeriod()`, `TrackFuturesOrder()`, `CheckLiquidationStatus()` |
| **Limitierung** | Lebt NUR im Backtester-Kontext. Nicht als Live-Service exponiert. Keine REST API |

### 1.3 TypeScript Frontend (Paper Trading)

| Aspekt | Detail |
|---|---|
| **Order Types** | `src/lib/orders/types.ts` (32 LoC): PaperOrder mit buy/sell, market/limit/stop, SL/TP |
| **Storage** | `src/lib/server/orders-store.ts` (534 LoC): Dual-Storage (Prisma DB primaer, JSON-File Fallback), Auto-Fill bei SL/TP Hit |
| **Snapshot** | `src/lib/orders/portfolio.ts` (259 LoC): `buildPortfolioSnapshot()` berechnet Positionen, P&L (realized/unrealized), Equity Curve, Max Drawdown, Win Rate |
| **Service** | `src/lib/orders/snapshot-service.ts` (37 LoC): Koordiniert Orders + Live-Preise → Snapshot |
| **History** | `src/lib/server/portfolio-history-store.ts` (213 LoC): Persistiert Snapshots ueber Zeit (Dual-Storage) |
| **API** | `GET /api/fusion/portfolio` (Snapshot) + `GET/POST /api/fusion/portfolio/history` |
| **UI** | `src/features/trading/PortfolioPanel.tsx` (245 LoC): Equity, Total P&L, Return%, Unrealized, Max DD, Open Positions, Win Rate, Top Winner/Loser, Positions-Liste |
| **Refresh** | 15-Sekunden Auto-Polling |
| **Limitierung** | Nur Paper-Orders. Keine echten Exchange-Balances. Kein Equity Curve Chart. Keine Multi-Asset Korrelation. Keine Verbindung zu GCT |

### 1.4 Die Luecke

```
GCT portfolioManager           Python Service             Frontend
┌──────────────────┐           ┌──────────────┐           ┌──────────────────┐
│ Exchange Balances │           │ (Indikatoren │           │ Paper Orders      │
│ Wallet Balances   │           │  + Patterns  │           │ P&L + Equity     │
│                   │  KEINE    │  -- kein     │  KEINE    │ Drawdown         │
│ Summary:          │  BRIDGE   │  Portfolio)  │  BRIDGE   │                  │
│ Totals, Online,   │◄━━━━━━━━►│              │◄━━━━━━━━►│ PortfolioPanel   │
│ Offline           │           │              │           │                  │
└──────────────────┘           └──────────────┘           └──────────────────┘
```

---

## 2. GCT Multi-Asset Erweiterung

### 2.1 Warum GCT erweitern statt neu bauen?

GCT's `IBotExchange` Interface (206 Zeilen, `exchanges/interfaces.go`) ist bereits **generisch**:

```go
type IBotExchange interface {
    UpdateAccountBalances(ctx, asset.Item) (accounts.SubAccounts, error)
    GetHistoricCandles(ctx, pair, asset.Item, interval, start, end) (*kline.Item, error)
    GetRecentTrades(ctx, pair, asset.Item) ([]trade.Data, error)
    UpdateTicker(ctx, pair, asset.Item) (*ticker.Price, error)
    // ... 80+ weitere Methoden
}
```

Nichts in diesem Interface ist crypto-spezifisch. `asset.Item` ist ein `uint32` Enum:

```go
const (
    Spot, Margin, CrossMargin, MarginFunding, Index, Binary,
    Futures, PerpetualContract, PerpetualSwap, DeliveryFutures,
    Options, OptionCombo, All // ...
)
```

**Was fehlt:** Asset-Typen fuer traditionelle Maerkte. GCT hat kein `Stock`, `Commodity`, `Forex`, `Bond` -- aber das Enum ist erweiterbar.

### 2.2 Erweiterungsstrategie

| Schritt | Was | Aufwand | Risiko |
|---|---|---|---|
| **A** | `asset.Item` Enum erweitern: `Equity`, `Commodity`, `ForexSpot`, `Bond`, `ETF` | 0.5 Tage | Niedrig -- ist nur ein `uint32` Enum |
| **B** | Adapter-Exchange fuer Broker-APIs (Alpaca, IBKR, Tradier) die `IBotExchange` implementieren | 3-5 Tage pro Broker | Mittel -- jeder Broker hat eigene API-Quirks |
| **C** | `portfolioManager` erweitern: nicht nur `ExchangeAddress` sondern auch `BrokerPosition` | 1-2 Tage | Niedrig |
| **D** | Data Router (`go-backend/internal/router/`) nutzt Asset-Class fuer Provider-Selection | Bereits konzipiert in `go-research-financial-data-aggregation-2025-2026.md` | - |

### 2.3 Portfolio-Datenmodell Erweiterung

Aktuelles GCT `portfolio.Address`:

```go
type Address struct {
    Address, AddressTag   string
    CoinType              currency.Code
    Balance               float64
    Description           string        // "Exchange" oder "Personal"
    WhiteListed, ColdStorage bool
    SupportedExchanges    string
}
```

Erweitertes Modell (vorgeschlagen):

```go
type Position struct {
    Symbol        string            // "AAPL", "BTC-USD", "GC=F"
    AssetClass    asset.Item        // Equity, Crypto, Commodity, ...
    Exchange      string            // "binance", "alpaca", "ibkr"
    Quantity      decimal.Decimal
    AveragePrice  decimal.Decimal
    CurrentPrice  decimal.Decimal
    MarketValue   decimal.Decimal
    UnrealizedPnl decimal.Decimal
    RealizedPnl   decimal.Decimal
    CostBasis     decimal.Decimal
    Currency      currency.Code     // USD, EUR, BTC
    LastUpdated   time.Time
}
```

Das neue `Position` Struct wuerde neben dem bestehenden `Address` Struct leben -- `Address` fuer Wallet-Balances (Crypto-spezifisch), `Position` fuer alle Asset-Klassen (inkl. Crypto-Exchange-Positionen). `portfolioManager` aggregiert beides.

### 2.4 Backtester-Portfolio: Keine Aenderung noetig

Das Backtester-Portfolio (`backtester/eventhandlers/portfolio/`) ist bereits generisch:
- `Holding` arbeitet mit `currency.Pair` + `asset.Item` -- kein Crypto-Lock-in
- `Risk`, `Size`, `Compliance` sind asset-agnostisch
- Wenn ein Alpaca-Adapter `IBotExchange` implementiert, funktioniert der Backtester automatisch mit Aktien

**Fazit:** Das Backtester-Portfolio braucht keine Aenderungen. Der Live-`portfolioManager` braucht nur das neue `Position`-Struct + Broker-Adapter.

---

## 3. Drei-Schichten-Zielarchitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│  SCHICHT 3: TypeScript / Next.js (Darstellung + Interaktion)       │
│                                                                     │
│  PortfolioPanel.tsx (bestehend, erweitern)                         │
│  ├─ Tab "Paper":  Bestehende Paper-Trading P&L (funktioniert)      │
│  ├─ Tab "Live":   Echte Balances + Positionen von GCT              │
│  ├─ Tab "Analytics": Korrelation, Rolling Metriken, Drawdown       │
│  └─ Tab "Optimize": HRP, Kelly, Regime-Sizing Empfehlungen         │
│                                                                     │
│  Chart-Libraries:                                                   │
│  ├─ lightweight-charts (TradingView): Equity Curve, Drawdown Plot  │
│  ├─ @nivo/heatmap: Korrelationsmatrix                              │
│  └─ recharts: Rolling Metriken (Sharpe/Sortino/Calmar Lines)       │
│                                                                     │
│  API Routes (Next.js):                                              │
│  ├─ /api/fusion/portfolio          (bestehend -- Paper Snapshot)    │
│  ├─ /api/fusion/portfolio/history  (bestehend -- Snapshot History)  │
│  ├─ /api/fusion/portfolio/live     (NEU -- GCT Bridge)             │
│  └─ /api/fusion/portfolio/analytics/* (NEU -- Proxy zu Python)     │
├─────────────────────────────────────────────────────────────────────┤
│  SCHICHT 2: Python / FastAPI (Analytische Intelligenz)             │
│                                                                     │
│  Portfolio Analytics Endpoints:                                     │
│  ├─ /api/v1/portfolio/correlations      (numpy + scipy)            │
│  ├─ /api/v1/portfolio/rolling-metrics   (pandas.rolling)           │
│  ├─ /api/v1/portfolio/drawdown-analysis (pandas)                   │
│  ├─ /api/v1/portfolio/optimize          (scipy -- HRP, MinVar)     │
│  ├─ /api/v1/portfolio/regime-sizing     (Regime + Sizing)          │
│  ├─ /api/v1/portfolio/kelly-allocation  (numpy.linalg)             │
│  └─ /api/v1/portfolio/risk-warning      (VPIN aggregiert)          │
│                                                                     │
│  Rust/PyO3 (spaeter, nur fuer compute-intensive Teile):            │
│  └─ Monte Carlo VaR mit 100k+ Simulationen                        │
├─────────────────────────────────────────────────────────────────────┤
│  SCHICHT 1: Go / GCT (Daten + Execution + Real-Time)              │
│                                                                     │
│  portfolioManager (bestehend, erweitern):                          │
│  ├─ Exchange Balances (Crypto -- bestehend)                        │
│  ├─ Wallet Balances   (Blockchain APIs -- bestehend)               │
│  ├─ Broker Positions  (NEU -- Alpaca, IBKR Adapter)               │
│  └─ Summary + Positions REST API (NEU)                             │
│                                                                     │
│  Data Router (go-backend/internal/router/):                        │
│  ├─ Asset-Class-Routing fuer OHLCV (bestehend/konzipiert)          │
│  └─ Multi-Source Fallback mit Health-Tracking                      │
│                                                                     │
│  Backtester Portfolio (unveraendert):                              │
│  └─ Holdings, Risk, Size, Compliance, PNL                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Schicht 1: Go/GCT -- Daten und Execution

### 4.1 Neue REST Endpoints im Go-Backend

Unser Go-Backend (`go-backend/`) muss GCT-Daten exponieren. Aktuell hat es **null** Portfolio-Endpoints.

| Endpoint | Methode | Response | Quelle |
|---|---|---|---|
| `/api/gct/portfolio/summary` | GET | `{ totals[], online[], offline[], onlineSummary{} }` | `portfolioManager.GetPortfolioSummary()` |
| `/api/gct/portfolio/positions` | GET | `Position[]` (erweitertes Modell) | `portfolioManager` + Broker-Adapter |
| `/api/gct/portfolio/balances/:exchange` | GET | `{ currencies: [{code, total, hold, available}] }` | `exchange.GetCachedCurrencyBalances()` |
| `/api/gct/exchanges` | GET | `{ exchanges: [{name, enabled, assetTypes[]}] }` | `exchangeManager.GetExchanges()` |
| `/api/gct/portfolio/ohlcv` | GET | `OHLCV[]` fuer gehaltene Assets (fuer Python) | Data Router → Provider-Chain |

### 4.2 Broker-Adapter Pattern

Fuer Multi-Asset brauchen wir Broker-Adapter die `IBotExchange` implementieren. Minimalversion:

```go
type AlpacaAdapter struct {
    exchange.Base
    client *alpaca.Client
}

func (a *AlpacaAdapter) UpdateAccountBalances(ctx context.Context, ai asset.Item) (accounts.SubAccounts, error) {
    positions, _ := a.client.ListPositions()
    // Map Alpaca positions → GCT accounts.SubAccounts
}

func (a *AlpacaAdapter) GetHistoricCandles(ctx context.Context, pair currency.Pair, ai asset.Item, ...) (*kline.Item, error) {
    bars, _ := a.client.GetBars(pair.String(), ...)
    // Map Alpaca bars → GCT kline.Item
}
```

**Prioritaet der Broker-Adapter:**

| Broker | Asset-Klassen | API-Qualitaet | Prioritaet |
|---|---|---|---|
| **Alpaca** | US Equities, Crypto | Exzellent (REST + WebSocket, kostenlos) | HOCH |
| **Interactive Brokers** | Alles (Aktien, Options, Futures, Forex, Bonds) | Komplex aber vollstaendig (TWS API) | MITTEL |
| **Tradier** | US Equities, Options | Gut (REST, kostenlos fuer Daten) | NIEDRIG |

### 4.3 portfolioManager Erweiterung

```go
type portfolioManager struct {
    // ... bestehende Felder ...
    base          *portfolio.Base       // Crypto Wallets (bestehend)
    positions     []portfolio.Position  // NEU: alle Asset-Klassen
    positionsMtx  sync.RWMutex
}

func (m *portfolioManager) processPortfolio() {
    m.updateExchangeBalances()    // bestehend: Crypto
    m.updateBrokerPositions()     // NEU: Aktien, Commodities, etc.
    m.updateWalletBalances()      // bestehend: Blockchain APIs
}
```

---

## 5. Schicht 2: Python/FastAPI -- Analytics Intelligence

### 5.1 Warum Python fuer Analytics?

| Berechnung | Benoetigte Library | Go-Aequivalent | Entscheidung |
|---|---|---|---|
| Korrelationsmatrix | `numpy.corrcoef` | Kein direktes Aequivalent (gonum hat Basics) | **Python** |
| Hierarchical Clustering | `scipy.cluster.hierarchy` | Nicht vorhanden | **Python** |
| Rolling Window Metriken | `pandas.rolling` | Manuell implementieren (~200 LoC) | **Python** |
| Portfolio Optimierung (HRP) | `scipy.spatial.distance` + `scipy.optimize` | Nicht vorhanden | **Python** |
| Monte Carlo (100k+ Sims) | `numpy` oder Rust/PyO3 | `gonum` moeglich, aber langsamer | **Python/Rust** |
| Kelly Multi-Asset | `numpy.linalg.inv` (Kovarianz-Inversion) | `gonum/mat` moeglich | **Python** (Konsistenz) |

**Fazit:** Portfolio-Analytics sind einmalige Berechnungen (Request → Compute → Response), nicht Streaming. Python's Scientific Stack (numpy/scipy/pandas) ist hier unerreicht. Go bleibt bei dem was es besser kann: Concurrency, Real-Time Balance Polling, WebSocket-Streaming.

### 5.2 Endpoint-Design (Detail)

Alle Endpoints leben im bestehenden Python Indicator Service (`python-backend/services/indicator-service/`), in einem neuen Router `app/routers/portfolio.py`.

#### 5.2.1 Korrelationsmatrix + Diversifikation

```python
@router.post("/api/v1/portfolio/correlations")
async def correlations(request: CorrelationRequest):
    """
    Berechnet paarweise Korrelation zwischen allen gehaltenen Assets.

    Buch-Referenz: PfF Ch.11 L19566-19580 (Covariance Matrix, rets.cov() * 252)
    """
    returns = pd.DataFrame({
        a.symbol: np.log(np.array(a.close) / np.roll(np.array(a.close), 1))[1:]
        for a in request.assets
    })
    corr = returns.corr(method=request.method)  # pearson oder spearman

    off_diag = corr.values[np.triu_indices_from(corr.values, k=1)]
    diversification_score = 1 - np.mean(np.abs(off_diag))

    # Cluster-Gruppen via hierarchical clustering (Basis fuer HRP)
    from scipy.cluster.hierarchy import fcluster, linkage
    from scipy.spatial.distance import squareform
    dist = squareform(0.5 * (1 - corr))
    link = linkage(dist, method="single")
    clusters = fcluster(link, t=0.5, criterion="distance")

    return {
        "correlation_matrix": corr.to_dict(),
        "diversification_score": round(diversification_score, 4),
        "cluster_groups": _group_by_cluster(corr.columns, clusters),
    }
```

#### 5.2.2 Rolling Performance Metriken

```python
@router.post("/api/v1/portfolio/rolling-metrics")
async def rolling_metrics(request: RollingMetricsRequest):
    """
    Buch-Referenz:
    - QT Ch.2 L1331-1414 (Sharpe Ratio Definition + Subtleties)
    - AFML Ch.14 (Deflated Sharpe -- adjustiert fuer Multiple Trials)
    """
    equity = pd.Series(
        [p.equity for p in request.equity_curve],
        index=pd.to_datetime([p.time for p in request.equity_curve])
    )
    returns = equity.pct_change().dropna()
    window = request.window_days
    rf = request.risk_free_rate / 252

    rolling_ret = returns.rolling(window)
    rolling_sharpe = (rolling_ret.mean() - rf) / rolling_ret.std() * np.sqrt(252)
    downside = returns.clip(upper=0)
    rolling_sortino = (rolling_ret.mean() - rf) / downside.rolling(window).std() * np.sqrt(252)

    # Calmar = Annualized Return / Max Drawdown (rolling)
    # ...
```

#### 5.2.3 HRP Portfolio-Optimierung

```python
@router.post("/api/v1/portfolio/optimize")
async def optimize(request: OptimizeRequest):
    """
    Buch-Referenz:
    - AFML Ch.16 (Hierarchical Risk Parity)
    - PfF Ch.11 L19461-19580 (Mean-Variance Portfolio Theory, Markowitz)

    HRP Vorteil gegenueber Markowitz: keine Kovarianz-Inversion noetig,
    stabiler bei vielen Assets, keine Singularitaets-Probleme.
    """
    if request.method == "hrp":
        weights = _hrp_optimize(returns, corr)
    elif request.method == "min_variance":
        weights = _min_variance_optimize(returns)
    elif request.method == "equal_weight":
        weights = {s: 1.0 / len(request.assets) for s in symbols}

    return {
        "weights": weights,
        "method": request.method,
        "dendrogram_data": _build_dendrogram(link) if request.method == "hrp" else None,
    }
```

### 5.3 Rust/PyO3 Acceleration (spaeter)

Relevanz aus "Deep Learning with Rust" (L1399-1403, L1737-1847):
- `ndarray` Crate fuer N-dimensionale Arrays (Rust-Aequivalent von numpy)
- `linfa` fuer ML-Algorithmen (Clustering, Regression)
- Ueber PyO3 als Python-Extension aufrufbar

**Wann Rust lohnt sich fuer Portfolio:**
- Monte Carlo VaR mit >100k Simulationen (PfF Ch.10 L16700-17800)
- Correlation Matrix fuer >500 Assets (numpy reicht bis ~200 Assets, darueber wird es langsam)
- Backtester-Loops mit >1M Bars

**Wann Rust sich NICHT lohnt:**
- Einmalige HRP-Optimierung fuer 5-50 Assets (scipy ist schnell genug, <10ms)
- Rolling Metriken (pandas.rolling ist C-optimiert, kaum zu schlagen)
- Alles unter 100ms Rechenzeit

---

## 6. Schicht 3: TypeScript/Next.js -- Frontend

### 6.1 Chart-Library-Strategie

Wir brauchen drei verschiedene Visualisierungstypen:

| Visualisierung | Library | Begruendung |
|---|---|---|
| **Equity Curve + Drawdown (Underwater) Plot** | `lightweight-charts` (TradingView) | Bereits im Projekt fuer Preis-Charts. Konsistentes Look&Feel. Area-Series fuer Equity, Baseline-Series fuer Drawdown. 35KB, GPU-beschleunigt |
| **Korrelationsmatrix (Heatmap)** | `@nivo/heatmap` | Dedizierte Heatmap-Komponente mit Farbskalen, Tooltips, Canvas-Rendering. Bester React-Heatmap-Support (npm: 665k weekly downloads) |
| **Rolling Metriken (Sharpe/Sortino/Calmar Lines)** | `recharts` | Bereits populaer im React-Oekosystem (3.6M weekly). Multi-Line-Chart mit Tooltips. Fuer 2-4 Linien optimal |

**Alternative evaluiert und verworfen:**
- SciChart: Overkill (WebAssembly, teuer, >500KB). Erst relevant bei >100k Datenpunkten
- Rosen Charts: Zu neu (2025), wenig Community
- CanvasJS: Proprietaer, Lizenzkosten

### 6.2 PortfolioPanel Erweiterung

Aktueller PortfolioPanel (`src/features/trading/PortfolioPanel.tsx`, 245 LoC) wird erweitert mit Tab-Navigation:

> **Ausfuehrungs-Hinweis (Execution Plan):**
> - **Phase 5e** deckt die strukturelle Trading-/Portfolio-UX-Konsolidierung ab (Panel-Komposition, konsistente States, responsive Verhalten, Prototype-Cleanup).
> - **Phase 13** bleibt fuer fortgeschrittene Portfolio-/Optimize-Features.
> - **Phase 21** bleibt fuer finalen cross-app UI-Polish / Hardening.

```
┌─────────────────────────────────────────────────┐
│ Portfolio Tracker                    [Live]      │
│ ┌──────┬──────┬───────────┬──────────┐          │
│ │Paper │ Live │ Analytics │ Optimize │          │
│ └──────┴──────┴───────────┴──────────┘          │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Tab-Inhalt je nach Auswahl]                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Tab "Paper"** (bestehend):
- Metrics Grid: Equity, Total P&L, Return%, Unrealized, Max DD, Win Rate
- Positions-Liste mit Qty, Avg, Last, Exposure, Realized/Unrealized/Total
- Auto-Refresh alle 15s

**Tab "Live"** (NEU):
- Echte Exchange-Balances von GCT (`/api/fusion/portfolio/live`)
- Pro Exchange aufgeschluesselt (Binance BTC: 0.5, Kraken ETH: 3.0, Alpaca AAPL: 50 shares)
- Online/Offline-Aufteilung
- Gesamtportfolio-Wert in USD

**Tab "Analytics"** (NEU):
- Equity Curve Chart (`lightweight-charts` Area Series)
- Drawdown Underwater Plot (`lightweight-charts` Baseline Series, rot unter 0)
- Rolling Metriken Chart (`recharts` Multi-Line: Sharpe, Sortino, Calmar)
- Korrelationsmatrix Heatmap (`@nivo/heatmap`)
- Drawdown-Perioden-Tabelle (Start, Trough, End, Depth, Duration, Recovery)

**Tab "Optimize"** (NEU, Prio 3):
- Aktuelle Gewichte vs. HRP-optimierte Gewichte (Bar-Chart Vergleich)
- Dendrogram-Visualisierung (Asset-Clustering)
- Kelly-Allocation mit Half-Kelly Empfehlung
- Regime-Warnung pro Position (Traffic Light: Gruen/Gelb/Rot)

### 6.3 Neue Komponenten

| Komponente | Pfad | LoC (geschaetzt) | Abhaengigkeit |
|---|---|---|---|
| `EquityCurveChart.tsx` | `src/features/trading/charts/` | ~120 | `lightweight-charts` |
| `DrawdownChart.tsx` | `src/features/trading/charts/` | ~100 | `lightweight-charts` |
| `CorrelationHeatmap.tsx` | `src/features/trading/charts/` | ~80 | `@nivo/heatmap` |
| `RollingMetricsChart.tsx` | `src/features/trading/charts/` | ~100 | `recharts` |
| `LiveBalancesPanel.tsx` | `src/features/trading/` | ~150 | GCT Bridge API |
| `OptimizePanel.tsx` | `src/features/trading/` | ~200 | Python Analytics API |
| `DrawdownTable.tsx` | `src/features/trading/` | ~80 | - |

### 6.4 API Routes (Next.js Proxy)

| Route | Methode | Target | Zweck |
|---|---|---|---|
| `/api/fusion/portfolio/live` | GET | Go: `/api/gct/portfolio/positions` + `/summary` | Echte Balances + Positionen |
| `/api/fusion/portfolio/analytics/correlations` | POST | Python: `/api/v1/portfolio/correlations` | Korrelationsmatrix |
| `/api/fusion/portfolio/analytics/rolling` | POST | Python: `/api/v1/portfolio/rolling-metrics` | Rolling Sharpe/Sortino/Calmar |
| `/api/fusion/portfolio/analytics/drawdown` | POST | Python: `/api/v1/portfolio/drawdown-analysis` | Erweiterte Drawdown-Daten |
| `/api/fusion/portfolio/analytics/optimize` | POST | Python: `/api/v1/portfolio/optimize` | HRP/MinVar/EqualWeight |
| `/api/fusion/portfolio/analytics/regime-sizing` | POST | Python: `/api/v1/portfolio/regime-sizing` | Regime-basierte Empfehlungen |
| `/api/fusion/portfolio/analytics/kelly` | POST | Python: `/api/v1/portfolio/kelly-allocation` | Kelly Multi-Asset |

---

## 7. Network Layer: Wie die Schichten kommunizieren

### 7.1 Request Flow

```
Browser
  │
  │ fetch("/api/fusion/portfolio/live")
  │
  ▼
Next.js API Route (TS)
  │
  │ 1) fetch("http://go-backend:8080/api/gct/portfolio/positions")
  │ 2) Merge mit Paper-Orders aus Prisma/JSON
  │
  ▼
Go Backend (GCT)
  │
  │ portfolioManager.GetPortfolioSummary()
  │ exchange.GetCachedCurrencyBalances()
  │
  ▼
Exchanges (Binance, Kraken, Alpaca, ...)
```

```
Browser
  │
  │ fetch("/api/fusion/portfolio/analytics/correlations", {assets, lookback})
  │
  ▼
Next.js API Route (TS)
  │
  │ 1) fetch("http://go-backend:8080/api/gct/portfolio/ohlcv?symbols=BTC,ETH,AAPL")
  │ 2) Forward OHLCV zu Python: fetch("http://python-service:5000/api/v1/portfolio/correlations")
  │
  ▼
Python FastAPI
  │
  │ numpy.corrcoef() + scipy.cluster.hierarchy
  │
  ▼
Response → Next.js → Browser
```

### 7.2 Service Discovery + Konfiguration

```yaml
# .env.local (oder Docker Compose)
GO_BACKEND_URL=http://localhost:8080
PYTHON_SERVICE_URL=http://localhost:5000

# Docker Compose (Production)
services:
  frontend:
    ports: ["3000:3000"]
    environment:
      GO_BACKEND_URL: http://go-backend:8080
      PYTHON_SERVICE_URL: http://python-service:5000
  go-backend:
    ports: ["8080:8080"]
  python-service:
    ports: ["5000:5000"]
```

### 7.3 Caching-Strategie

| Daten | Cache-Dauer | Wo | Begruendung |
|---|---|---|---|
| Exchange Balances | 60s (GCT polling interval) | Go (in-memory) | GCT pollt bereits alle 60s |
| OHLCV fuer Korrelation | 5 min | Next.js (in-memory LRU) | Aendert sich nicht schnell |
| Korrelationsmatrix | 5 min | Python (functools.lru_cache) | Teuerste Berechnung, aendert sich selten |
| Rolling Metriken | 15s (sync mit Panel refresh) | Kein Cache | Schnell genug (<50ms), soll aktuell sein |
| Paper-Order Snapshot | Real-time | Kein Cache | Muss sofort nach Order-Aenderung aktuell sein |

### 7.4 Error Handling ueber Schichten

```
Python Service down?
  → Next.js Proxy faengt Timeout (3s) ab
  → Analytics Tab zeigt "Analytics temporarily unavailable"
  → Paper + Live Tabs funktionieren weiter

Go Backend down?
  → Next.js faengt Timeout ab
  → Live Tab zeigt "Exchange data unavailable"
  → Paper Tab funktioniert weiter (eigene Daten)
  → Analytics Tab zeigt cached Daten oder Fallback

Exchange API down?
  → GCT Circuit Breaker (bestehend) faengt es ab
  → portfolioManager loggt Fehler, nutzt letzte bekannte Balances
  → Live Tab zeigt "Last updated: 5 min ago" Warnung
```

---

## 8. Buch-Referenzen und theoretische Fundierung

### 8.1 Portfolio-Theorie Grundlagen

| Konzept | Buch | Kapitel/Zeile | Verwendung in unserer Architektur |
|---|---|---|---|
| **Mean-Variance Portfolio Theory (Markowitz)** | PfF | Ch.11 L19461-19580 | Vergleichsmethode in `/portfolio/optimize` (method: "min_variance"). Historisch wichtig aber instabil bei vielen Assets |
| **Covariance Matrix** | PfF | Ch.11 L19566-19580 | Zentral fuer Korrelationsmatrix (`rets.cov() * 252`), HRP, und Kelly Multi-Asset |
| **Efficient Frontier (Monte Carlo)** | PfF | Ch.11 L19580+ | Optional: Scatter-Plot von 10k Random-Portfolios als Vergleich zur HRP-Loesung |
| **Kelly Formula (Single Asset)** | QT | Ch.6 L5541-5586 | Bereits in INDICATOR_ARCHITECTURE.md 5d-Ergaenzung, Todo #39 |
| **Kelly Formula (Multi-Asset)** | QT | Ch.6 L5541-5554 | `F* = C^{-1} * M` (Kovarianz-Inverse mal Mean-Excess-Returns). Endpunkt `/portfolio/kelly-allocation` |
| **Sharpe Ratio Subtleties** | QT | Ch.2 L1384-1414 | Annualisierung (`* sqrt(252)`), Dollar-Neutral vs Long-Only, Information Ratio vs Sharpe |
| **Drawdown + Max Drawdown Duration** | QT | Ch.2 L172-177, Ch.3 L177 | Bereits in Frontend berechnet, aber nur Max DD. Erweiterte Analyse in Python |

### 8.2 Fortgeschrittene Portfolio-Konzepte (Quant-Buecher)

| Konzept | Buch | Kapitel | Verwendung | Zugehoeriger Endpoint |
|---|---|---|---|---|
| **Hierarchical Risk Parity (HRP)** | AFML | Ch.16 | Portfolio-Optimierung ohne Kovarianz-Inversion. Stabiler als Markowitz | `/portfolio/optimize` (method: "hrp") |
| **Deflated Sharpe Ratio** | AFML | Ch.14 | Adjustiert Sharpe fuer Multiple Trials + Skew/Kurtosis. Verhindert Backtest-Overfitting | `/evaluate/strategy` (erweitert) |
| **VPIN Order Flow Toxicity** | AFML | Ch.19 | Portfolio-Level Warnung bei toxischem Orderflow in gehaltenen Assets | `/portfolio/risk-warning` |
| **Entropy Features** | AFML | Ch.18 | Meta-Signal: "Wie vorhersagbar ist der Markt gerade?" Als Portfolio-Quality-Indikator | `/regime/entropy` |
| **Risk Management via Kelly** | QT | Ch.6 L5588-5604 | Automatische Position-Reduktion bei Verlusten. Kelly diktiert Verkauf bei Drawdown | `/portfolio/kelly-allocation` + Regime |

### 8.3 Stochastische Simulation

| Konzept | Buch | Kapitel/Zeile | Verwendung |
|---|---|---|---|
| **Geometric Brownian Motion** | PfF | Ch.10 L16700-17800 | Basis fuer Monte Carlo Price Projection (INDICATOR_ARCHITECTURE.md 5h) |
| **Jump Diffusion (Merton)** | PfF | Ch.10 | Erweiterung: Modelliert Crashes. Relevant fuer Stress-Testing |
| **Monte Carlo VaR** | PfF | Ch.10 L18165-18490 | Portfolio-Level Value-at-Risk. 100k Simulationen → Rust/PyO3 sinnvoll |

### 8.4 Rust/PyO3 Relevanz (Deep Learning with Rust)

| Konzept | Buch | Zeile | Unsere Verwendung |
|---|---|---|---|
| **ndarray Crate** | DL-Rust | L1737-1847 | N-dimensionale Arrays fuer Matrix-Operationen in Rust. Alternative zu numpy fuer compute-intensive Portfolio-Berechnungen |
| **linfa Crate** | DL-Rust | L1399-1403 | ML-Algorithmen in Rust (Clustering fuer HRP). Aktuell nicht noetig (scipy reicht), aber Option fuer Skalierung |
| **tch-rs** | DL-Rust | L686-688 | PyTorch Bindings fuer Rust. Relevant falls wir ML-basierte Portfolio-Signals einbauen (siehe Future-Quant-trading.md: Meta-Labeling) |

### 8.5 Data Aggregation (Go Research)

| Konzept | Quelle | Relevanz fuer Portfolio |
|---|---|---|
| **Asset-Class-Routing** | go-research L62-99 | Portfolio braucht OHLCV fuer diverse Asset-Klassen. Der Data Router liefert automatisch den besten Provider pro Asset |
| **Adaptive Health-Tracking** | go-research L103-121 | Wenn ein Provider (z.B. Alpaca) degraded ist, wird automatisch auf Alternative geswitcht |
| **Unified Data Import** | Mastering Finance Python Ch.2 L1319-1381 | Pattern-Vorlage: ein Interface, multiple Provider. Exakt unser Go-Router-Ansatz |

---

## 9. Implementierungs-Roadmap

### Phase 1: GCT Bridge (Woche 1-2)

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---|---|---|
| P-1 | Go REST Endpoint `/api/gct/portfolio/summary` (exponiert `GetPortfolioSummary()`) | 0.5 Tage | - |
| P-2 | Go REST Endpoint `/api/gct/portfolio/positions` (neues `Position` Struct) | 1 Tag | P-1 |
| P-3 | Go REST Endpoint `/api/gct/portfolio/balances/:exchange` (pro Exchange) | 0.5 Tage | P-1 |
| P-4 | Next.js Route `/api/fusion/portfolio/live` (Bridge: Go → Frontend) | 1 Tag | P-1 + P-2 |
| P-5 | `LiveBalancesPanel.tsx` (Tab "Live" im PortfolioPanel) | 1 Tag | P-4 |
| P-6 | `EquityCurveChart.tsx` (lightweight-charts Area Series, Daten existieren bereits) | 0.5 Tage | lightweight-charts (bereits im Projekt) |
| P-7 | `DrawdownChart.tsx` (lightweight-charts Baseline Series, Underwater Plot) | 0.5 Tage | P-6 |
| P-8 | Tab-Navigation in PortfolioPanel (Paper / Live / Analytics / Optimize) | 0.5 Tage | P-5 |

**Ergebnis Phase 1:** Live Exchange-Balances im Frontend sichtbar. Equity Curve + Drawdown als Charts. Paper und Live in getrennten Tabs.

### Phase 2: Python Analytics (Woche 3-4)

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---|---|---|
| P-9 | Python Router `app/routers/portfolio.py` im Indicator Service | 0.5 Tage | Indicator Service (bestehend) |
| P-10 | Endpoint `/portfolio/correlations` (numpy + scipy) | 1 Tag | P-9 |
| P-11 | Endpoint `/portfolio/rolling-metrics` (pandas.rolling) | 1 Tag | P-9 |
| P-12 | Endpoint `/portfolio/drawdown-analysis` (erweiterte Drawdown-Perioden) | 0.5 Tage | P-9 |
| P-13 | Go Endpoint `/api/gct/portfolio/ohlcv` (OHLCV fuer gehaltene Assets) | 1 Tag | Data Router |
| P-14 | Next.js Proxy Routes `/api/fusion/portfolio/analytics/*` (6 Routes) | 1 Tag | P-10 + P-11 + P-12 |
| P-15 | `CorrelationHeatmap.tsx` (@nivo/heatmap) | 1 Tag | P-10, npm: @nivo/heatmap |
| P-16 | `RollingMetricsChart.tsx` (recharts Multi-Line) | 1 Tag | P-11, npm: recharts |
| P-17 | `DrawdownTable.tsx` (Drawdown-Perioden Tabelle) | 0.5 Tage | P-12 |
| P-18 | Tab "Analytics" im PortfolioPanel zusammenfuegen | 1 Tag | P-15 + P-16 + P-17 |

**Ergebnis Phase 2:** Analytics-Tab mit Korrelations-Heatmap, Rolling Sharpe/Sortino/Calmar, Drawdown-Plot + Perioden-Tabelle.

### Phase 3: Portfolio Optimierung (Woche 5-6)

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---|---|---|
| P-19 | Endpoint `/portfolio/optimize` (HRP + MinVar + EqualWeight) | 2 Tage | P-10 (braucht Korrelation) |
| P-20 | Endpoint `/portfolio/kelly-allocation` (Multi-Asset Kelly) | 1 Tag | P-10 |
| P-21 | Endpoint `/portfolio/regime-sizing` (Regime + Sizing kombiniert) | 2 Tage | INDICATOR_ARCHITECTURE Todos #35, #39, #43 |
| P-22 | `OptimizePanel.tsx` (Gewichte-Vergleich, Dendrogram) | 2 Tage | P-19, P-20 |
| P-23 | Tab "Optimize" im PortfolioPanel | 1 Tag | P-22 |

**Ergebnis Phase 3:** Optimize-Tab mit HRP-Empfehlungen, Kelly-Allocation, Regime-Warnings.

### Phase 4: Multi-Asset Broker-Adapter (Woche 7-8+)

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---|---|---|
| P-24 | `asset.Item` Enum erweitern (Equity, Commodity, ForexSpot, Bond, ETF) | 0.5 Tage | - |
| P-25 | Alpaca Broker-Adapter (`IBotExchange` Implementierung) | 3-5 Tage | P-24 |
| P-26 | `portfolioManager` Erweiterung: `Position` Struct + `updateBrokerPositions()` | 1-2 Tage | P-24 + P-25 |
| P-27 | End-to-End Test: Alpaca US Equities + Binance Crypto in einem Portfolio | 1 Tag | P-25 + P-26 |
| P-28 | VPIN Portfolio Risk Warning (`/portfolio/risk-warning`) | 1 Tag | INDICATOR_ARCHITECTURE Todo #49 |

**Ergebnis Phase 4:** Multi-Asset Portfolio: Aktien (Alpaca) + Crypto (GCT) in einem Dashboard mit Cross-Asset-Korrelation.

### Phase 5: Advanced + Rust (spaeter)

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---|---|---|
| P-29 | Monte Carlo VaR via Rust/PyO3 (100k+ Simulationen) | 2-3 Tage | RUST_LANGUAGE_IMPLEMENTATION.md |
| P-30 | IBKR Broker-Adapter (Options, Futures, Bonds) | 5+ Tage | P-24 |
| P-31 | Portfolio Alerts System (WebSocket: "BTC VPIN > 0.7, reduziere Position") | 2-3 Tage | P-28, GCT WebSocket |
| P-32 | **Options Calculator** (Black-Scholes P/L Simulator, Greeks, Multi-Leg Strategien) | 3-5 Tage | P-30 (IBKR) oder Tradier-Adapter (go-research Sek. 11) |
| P-33 | **Watchlists + Cross-Device Sync** (Prisma-persistiert, Auth-gebunden, SSE-Push) | 2-3 Tage | Prisma (Sektion 11) |

**P-32 Options Calculator -- Detail:**

Ein Options Calculator ermoeglicht es dem Nutzer, Options-Strategien zu simulieren bevor er sie ausfuehrt.

| Feature | Beschreibung | Implementierung |
|---------|-------------|----------------|
| **Einzeloption P/L** | Gewinn/Verlust-Kurve eines Long/Short Call/Put bei verschiedenen Kursszenarien | Python: Black-Scholes + `numpy` Payoff-Array |
| **Greeks** | Delta, Gamma, Theta, Vega, Rho fuer jede Leg | Python: BSM-Formeln + `scipy.stats.norm` |
| **Multi-Leg Strategien** | Bull Call Spread, Iron Condor, Straddle, Strangle etc. | Python: aggregierte Payoff-Arrays pro Leg |
| **Break-Even Berechnung** | Wo wird die Strategie profitabel? | Python: Nullstelle der P/L-Funktion |
| **Expiry-Slider** | P/L-Visualisierung mit DTE-Simulation | Frontend: Chart mit Slider-Interaktion |

**Python-Endpoint:** `/api/v1/options/calculate`
- Input: `legs[]` ({type: call/put, action: buy/sell, strike, expiry, quantity, premium}), `spot`, `iv`, `r` (risk-free rate)
- Output: `payoff_curve[]` (Preis → P/L), `greeks{}` (aggregiert + pro Leg), `break_even_points[]`, `max_profit`, `max_loss`

**Frontend:** Neue Komponente `OptionsCalculator.tsx` -- zugaenglich aus Trade-Panel oder eigenem Tab. Payoff-Kurve mit `lightweight-charts` oder `recharts` (Linie + gefaerbte Zonen).

**Buch-Referenz:** `Future-Quant-trading.md` Sek. 3.1 (Monte Carlo Pricing), PfF Ch.15-17 (DX Analytics Library)

---

## 11. Watchlists + Cross-Device Sync

### 11.1 Ist-Zustand

Watchlists existieren aktuell **nur im localStorage des Browsers** (TypeScript `src/lib/providers/` und `src/features/trading/`). Das bedeutet:
- Keine Synchronisation zwischen Desktop/Tablet/Mobile
- Verlust bei Browser-Cache-Clear oder neuem Geraet
- Keine Multi-User-Faehigkeit

### 11.2 Zielarchitektur

```
┌─────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                  │
│  WatchlistPanel.tsx: Symbole, Notizen, Gruppen      │
│  useWatchlist() Hook:                                │
│    - Optimistic Updates (sofortige UI-Aenderung)    │
│    - Background Sync via REST                        │
│    - WebSocket fuer Cross-Tab + Cross-Device Sync   │
├─────────────────────────────────────────────────────┤
│  Next.js API Routes                                  │
│  GET/POST/DELETE /api/fusion/watchlist               │
│  GET/POST        /api/fusion/watchlist/[id]/symbols  │
│  WebSocket-Push via SSE (Server-Sent Events)        │
├─────────────────────────────────────────────────────┤
│  Prisma / DB Layer                                   │
│  Watchlist { id, userId, name, color, createdAt }   │
│  WatchlistItem { id, watchlistId, symbol, note,     │
│                  assetClass, addedAt }               │
└─────────────────────────────────────────────────────┘
```

### 11.3 Datenmodell (Prisma Schema Erweiterung)

```prisma
model Watchlist {
  id          String          @id @default(cuid())
  userId      String          // Auth-User (oder "default" fuer Single-User-Mode)
  name        String
  color       String?         // Hex-Farbe fuer UI-Differenzierung
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  items       WatchlistItem[]
}

model WatchlistItem {
  id          String     @id @default(cuid())
  watchlistId String
  watchlist   Watchlist  @relation(fields: [watchlistId], references: [id], onDelete: Cascade)
  symbol      String     // "AAPL", "BTC-USD", "GC=F"
  assetClass  String?    // "equity", "crypto", "commodity", "forex"
  note        String?    // Optional: persoenliche Notiz
  alertPrice  Float?     // Optional: Preis-Alert
  addedAt     DateTime   @default(now())

  @@unique([watchlistId, symbol])
}
```

### 11.4 Cross-Device Sync via SSE

Statt WebSocket (komplex, erfordert persistente Verbindung) nutzen wir **Server-Sent Events (SSE)**:
- Browser oeffnet `/api/fusion/watchlist/stream` (persistente GET-Verbindung)
- Bei Aenderungen auf einem Geraet: Next.js pusht SSE-Event an alle anderen offenen Sessions desselben Users
- Einfacher als WebSocket: kein bi-direktionales Protokoll noetig, Fallback auf Polling trivial

```typescript
// src/app/api/fusion/watchlist/stream/route.ts
export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      // Subscribe to watchlist change events for this user
      const unsub = watchlistEmitter.subscribe(userId, send);
      req.signal.addEventListener("abort", unsub);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
```

### 11.5 Priorisierung der Implementierung

| Phase | Was | Aufwand | Wert |
|-------|-----|---------|------|
| **Sofort (P-33a)** | Prisma-Schema + CRUD API Routes + `useWatchlist()` Hook (localStorage → DB) | 1-2 Tage | Persistence, kein Cross-Device yet |
| **Danach (P-33b)** | SSE-Push fuer Cross-Tab Sync (einfach, kein Auth noetig) | 0.5 Tage | Cross-Tab Sync |
| **V2 (P-33c)** | Auth-Layer + User-spezifische Watchlists + Cross-Device | 1-2 Tage | Braucht Auth-Provider |

> **Single-User-Mode:** Ohne Auth nutzen wir `userId = "default"` -- funktioniert vollstaendig fuer einen Benutzer. Cross-Device-Sync benoetigt dann nur dieselbe DB (z.B. shared Postgres statt lokales SQLite).

---

## 10. Querverweis-Tabelle

| Wenn du an ... arbeitest | Lies in ... |
|---|---|
| **GCT Portfolio Grundlagen** | Dieses Dokument Sektion 1.1 + 1.2 |
| **Frontend Portfolio Grundlagen** | Dieses Dokument Sektion 1.3 |
| **GCT Multi-Asset Erweiterung** | Dieses Dokument Sektion 2 + 4 |
| **Broker-Adapter (Alpaca, IBKR)** | Dieses Dokument Sektion 4.2, Aufgaben P-25 + P-30 |
| **Python Analytics Endpoints** | Dieses Dokument Sektion 5 + [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) Sektion 5.P |
| **Frontend Charts (Equity, Heatmap)** | Dieses Dokument Sektion 6 |
| **Network Layer (Go ↔ Python ↔ TS)** | Dieses Dokument Sektion 7 |
| **Portfolio-Theorie (Markowitz, Kelly)** | Dieses Dokument Sektion 8.1 + PfF Ch.11, QT Ch.6 |
| **HRP / Deflated Sharpe / VPIN** | [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) Sektionen 5j-5m + Dieses Dokument Sektion 8.2 |
| **Rust/PyO3 fuer Portfolio** | [RUST_LANGUAGE_IMPLEMENTATION.md](./RUST_LANGUAGE_IMPLEMENTATION.md) + Dieses Dokument Sektion 5.3 |
| **Data Router (Multi-Source OHLCV)** | [go-research-financial-data-aggregation-2025-2026.md](./go-research-financial-data-aggregation-2025-2026.md) + Dieses Dokument Sektion 4.1 (P-13) |
| **Reine Quant-Konzepte (ML-Pipeline etc.)** | [Future-Quant-trading.md](./Future-Quant-trading.md) |
| **Implementierungs-Roadmap** | Dieses Dokument Sektion 9 (P-1 bis P-33) |
| **Options Calculator** | Dieses Dokument Phase 5 P-32 + [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) Todo #61 |
| **Watchlists + Cross-Device Sync** | Dieses Dokument Sektion 11 (P-33) + [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) Todo #62 |

---

## Anhang: NPM Dependencies

Neue Dependencies fuer Portfolio-Frontend:

```bash
# Korrelations-Heatmap
npm install @nivo/core @nivo/heatmap

# Rolling Metriken Charts (falls nicht bereits installiert)
npm install recharts

# lightweight-charts sollte bereits installiert sein
# npm install lightweight-charts
```

Python Dependencies (erweitern in `requirements.txt`):

```txt
# Bereits vorhanden: numpy, pandas, scipy
# Keine neuen Dependencies noetig fuer Phase 1-3
```
