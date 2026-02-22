# Future Quant Trading -- Referenz fuer spaetere Erweiterung

> **Stand:** 18. Februar 2026
> **Zweck:** Dokumentiert reine Quant-Konzepte aus drei Buechern die NICHT in `INDICATOR_ARCHITECTURE.md` gehoeren, aber bei bekannten Firmen empirisch funktionieren. Falls das Projekt spaeter Richtung systematischer/automatisierter Handel erweitert wird, sind diese Konzepte die naechsten Bausteine.
> **Status:** Nur Referenz. Nichts davon ist geplant oder hat Todos.

---

## Quellen

| Kuerzel | Buch | Autor | Fokus |
|---|---|---|---|
| **AFML** | Advances in Financial Machine Learning | Marcos Lopez de Prado | ML fuer Hedge Funds, Backtest-Methodik, Feature Engineering |
| **QT** | Quantitative Trading (2nd Ed.) | Ernest P. Chan | Algorithmischer Handel, Strategie-Entwicklung, Execution |
| **PfF** | Python for Finance | Yves Hilpisch | Derivatives Pricing, Stochastische Simulation, Risk Analytics |

---

## 1. ML-Pipeline fuer Strategie-Entwicklung (AFML)

### 1.1 Meta-Labeling (AFML Ch.3)

**Was:** Zweistufiges ML-System. Modell 1 sagt Richtung vorher (Long/Short). Modell 2 sagt vorher ob Modell 1 *diesmal* recht hat und bestimmt die Bet-Size.

**Wer nutzt es:** De Prado (Guggenheim Partners, ~$310B AuM), systematische Hedge Funds.

**Warum es funktioniert:** Reduziert False Positives drastisch. Ein Signal das "Long" sagt aber von Meta-Label als "unsicher" klassifiziert wird, wird uebersprungen oder mit kleiner Position gehandelt.

**Was es braucht:**
- Trainiertes ML-Modell (Random Forest, XGBoost) fuer Richtung
- Zweites ML-Modell fuer Confidence/Sizing
- Feature-Pipeline (technische + fundamentale + alternative Daten)
- Walk-Forward Retraining Infrastruktur

**AFML Referenz:** Ch.3 L2634-2710 (Meta-Labeling Definition + Use Cases)

### 1.2 Fractionally Differentiated Features (AFML Ch.5)

**Was:** Statt Preis-Returns (erste Differenz, d=1) zu verwenden, benutzt man fraktionale Differenzierung (d≈0.3-0.5). Das macht die Zeitreihe stationaer (ML-Voraussetzung) und behaelt gleichzeitig Trend-Memory bei.

**Wer nutzt es:** Jeder ML-basierte Quant Fund der auf Preis-Features trainiert.

**Warum es funktioniert:** `pct_change()` (d=1) zerstoert langfristige Memory komplett. Rohe Preise (d=0) sind nicht stationaer. Fracdiff findet den Sweet Spot.

**Was es braucht:**
- ML-Training-Pipeline (sonst irrelevant -- fuer Indikatoren braucht man keine stationaeren Features)
- `fracdiff` Python Library oder eigene Implementierung (~100 LoC)

**AFML Referenz:** Ch.5 L3535-3680 (Methode + Implementierung)

### 1.3 Sample Weights und Uniqueness (AFML Ch.4)

**Was:** Wenn ML-Samples ueberlappende Zeitraeume abdecken (z.B. 10-Day Return Labels die sich ueberlappen), muss jedes Sample gewichtet werden nach seiner "Uniqueness". Ohne das: massives Overfitting weil das Modell dasselbe Event mehrfach sieht.

**Wer nutzt es:** Standard bei jeder serioeser Financial ML Pipeline.

**Was es braucht:** ML-Training-Pipeline mit kontrolliertem Sampling.

**AFML Referenz:** Ch.4 L2998-3530 (Overlapping Outcomes, Sequential Bootstrapping)

### 1.4 Purged K-Fold Cross-Validation (AFML Ch.7+12)

**Was:** Standard K-Fold CV leakt in Finance weil Training- und Test-Daten zeitlich ueberlappen koennen (ein Label in Test haengt von Daten im Training-Zeitraum ab). Purged CV entfernt diese Ueberlappung. CPCV (Combinatorial Purged CV) geht weiter und erzeugt multiple synthetische Backtests aus CV-Folds.

**Wer nutzt es:** De Prado nennt es den wichtigsten methodischen Beitrag seines Buchs. Standard bei serioeser Quant-Forschung.

**Warum es funktioniert:** Reduziert False Discoveries dramatisch. Normales CV ueberschaetzt Performance in Finance um Faktor 2-5x.

**Was es braucht:**
- ML-Training-Pipeline
- Eigene CV-Implementierung (sklearn's CV ist fehlerhaft fuer Finance, explizit erwaehnt in Ch.7)

**AFML Referenz:** Ch.7 L315-322, Ch.12 L6366-6500 (CPCV Algorithmus)

### 1.5 Bet Sizing from Predicted Probabilities (AFML Ch.10)

**Was:** Wenn ein ML-Modell nicht nur Richtung sondern auch Confidence (Wahrscheinlichkeit) liefert, kann die Positionsgroesse optimal an diese Confidence gekoppelt werden. Erweitert Kelly-Criterion um ML-spezifische Kalibrierung.

**Wer nutzt es:** Systematic Quant Funds mit ML-Signals.

**Was es braucht:** Kalibriertes ML-Modell das Wahrscheinlichkeiten liefert (nicht nur Labels).

**AFML Referenz:** Ch.10 L5484-5620 (Bet Sizing Approaches)

---

## 2. Strategie-Typen (QT)

### 2.1 Pairs Trading / Cointegration (QT Ch.7)

**Was:** Zwei Assets die langfristig zusammen laufen (cointegrated) werden gegeneinander gehandelt. Wenn der Spread vom Mittelwert abweicht: Long das "billigere", Short das "teurere". Warten bis Spread konvergiert.

**Wer nutzt es:** Jeder Statistical Arbitrage Desk weltweit. Seit 1980er Jahren (Nunzio Tartaglia, Morgan Stanley). Two Sigma, Citadel, DE Shaw, Renaissance.

**Warum es funktioniert:** Mathematisch begruendet -- cointegrated Spreads sind per Definition mean-reverting. Aelteste und bewaehrteste Quant-Strategie.

**Warum Renditen komprimiert sind:** Zu viele Teilnehmer, zu schnelle Arbitrage. Edge existiert noch aber ist kleiner geworden.

**Was es braucht:**
- Cointegration-Tests (Engle-Granger, Johansen) -- `statsmodels` in Python
- Hedge Ratio Berechnung (OLS Regression)
- Spread-Monitoring + Execution Engine
- Koennte theoretisch als "Pair Scanner" Feature existieren (findet cointegrated Paare), ist aber primaer eine Trading-Strategie.

**QT Referenz:** Ch.7 L6900-7200 (Cointegration Tests, GLD/GDX Beispiel, Correlation vs Cointegration)

### 2.2 Factor Models (QT Ch.7)

**Was:** Renditen werden in systematische Faktoren zerlegt (Value, Momentum, Size, Quality, Low Volatility, Carry). Alpha = was uebrig bleibt nach Abzug aller Faktor-Exposures.

**Wer nutzt es:** AQR ($140B), Dimensional Fund Advisors ($700B), BlackRock Factor ETFs, jeder grosse Asset Manager.

**Warum es funktioniert:** Fama-French und Nachfolger haben empirisch bewiesen dass bestimmte Faktoren langfristig Risikopraemien liefern. Nobelpreis-Level Forschung.

**Was es braucht:**
- Multi-Asset Daten mit fundamentalen Kennzahlen (P/E, P/B, Earnings Growth, etc.)
- Faktor-Berechnung und Attribution
- Portfolio-Konstruktion basierend auf Faktor-Exposure
- Das ist ein komplett eigenes Produkt (Faktor-Analytics Platform), nicht ein Feature.

**QT Referenz:** Ch.7 L119 (Factor Models Sektion)

### 2.3 Seasonal Trading Strategies (QT Ch.7)

**Was:** Ausnutzen von saisonalen Mustern (z.B. "Sell in May", Jahresend-Rallye, Commodity-Zyklen).

**Wer nutzt es:** Commodity Trading Advisors (CTAs), einige systematische Funds.

**Empirischer Nachweis:** Gemischt. Einige Muster (Turn-of-Month Effect, Holiday Effect) sind robust dokumentiert, andere sind Data-Mining Artefakte.

**QT Referenz:** Ch.7 L123 (Seasonal Strategies Sektion)

### 2.4 High-Frequency Trading (QT Ch.7)

**Was:** Market Making, Latency Arbitrage, Statistical Arbitrage auf Microsekunden-Level.

**Wer nutzt es:** Virtu Financial, Citadel Securities, Jump Trading, Tower Research.

**Warum es funktioniert:** Mathematisch solide (Queue Theory, Optimal Execution). Profitabel aber braucht massive Hardware-Investition.

**Was es braucht:**
- Co-Location bei Exchanges (~$10K-$50K/Monat)
- FPGA oder Custom Hardware
- Sub-Microsecond Latency Netzwerk
- Regulatorische Lizenzen (Market Maker)
- Absolut nichts davon ist fuer eine Analyse-Plattform relevant.

**QT Referenz:** Ch.7 L125-129 (HFT Strategies)

### 2.5 Conditional Parameter Optimization mit ML (QT Ch.7)

**Was:** Statt feste Indikator-Parameter zu verwenden, trainiert ein ML-Modell (Random Forest + Boosting) welche Parameter-Kombination morgen am besten performen wird, basierend auf aktuellen Markt-Features.

**Wer nutzt es:** Ernest Chan's eigener Fund (QTS Capital), via predictnow.ai Platform.

**Warum es funktioniert:** Empirisch gezeigt dass adaptive Parameter consistently besser performen als statische. Aber braucht ML-Pipeline fuer taegliches Retraining.

**Was es braucht:**
- ML-Training + Prediction Pipeline (taegliches Retraining)
- Feature Engineering (Z-Scores, Money Flow, etc. ueber multiple Lookbacks)
- API zu ML-Service (oder eigenes Training)

**QT Referenz:** Ch.7 L6400-6700 (CPO mit predictnow.ai, vollstaendiges Code-Beispiel)

> **Hinweis:** Unser Regime-Conditional Parameters (INDICATOR_ARCHITECTURE.md, 5f, Todo #43) ist eine *vereinfachte* Version davon -- regelbasiert statt ML-basiert. CPO ist die ML-Vollversion.

---

## 3. Derivatives Pricing und Risk Analytics (PfF)

### 3.1 Options Pricing via Monte Carlo (PfF Part III, Ch.15-17)

**Was:** DX Analytics Library -- vollstaendiges Framework fuer Monte Carlo Simulation zur Bewertung von Derivaten:
- Stochastische Prozesse: Geometric Brownian Motion, Jump Diffusion, Square-Root Diffusion
- European + American Options Pricing
- Multi-Asset Portfolios mit korrelierten Underlyings
- Greeks-Berechnung via Finite Differences

**Wer nutzt es:** Jede Investment Bank (Sell-Side), Hedge Funds mit Options-Strategien.

**Was es braucht:**
- Tiefes Verstaendnis von Stochastic Calculus
- Market Data Feeds fuer Options (Bid/Ask/IV pro Strike+Expiry)
- Das ist ein eigenstaendiges Produkt (Derivatives Analytics System), nicht ein Feature.

**PfF Referenz:** Ch.15-17 L26780+ (DX Library, Simulation Classes, Valuation)

### 3.2 Value-at-Risk / Credit-Value-at-Risk (PfF Ch.10)

**Was:** VaR quantifiziert den maximalen erwarteten Verlust bei gegebenem Confidence Level (z.B. "Mit 99% Sicherheit verliert das Portfolio nicht mehr als $X morgen"). CVaR erweitert das um Kreditrisiko.

**Wer nutzt es:** Jede Bank (regulatorisch Pflicht seit Basel II/III), Risk Desks.

**Warum es funktioniert:** Mathematisch solide, regulatorisch vorgeschrieben.

**Was es braucht:**
- Portfolio-Level Risk System
- Historische Simulation oder parametrische Berechnung
- Regulatorische Compliance-Anforderungen

**PfF Referenz:** Ch.10 L18355-18490 (VaR, CVaR mit Code)

### 3.3 Stochastic Processes Simulation (PfF Ch.10)

**Was:** Modellierung von Preispfaden als stochastische Prozesse:
- Geometric Brownian Motion (Standard, Black-Scholes Annahme)
- Jump Diffusion (Merton-Modell, modelliert Crashes/Spruenge)
- Square-Root Diffusion (Cox-Ingersoll-Ross, fuer Zinsen/Volatilitaet)

**Wer nutzt es:** Derivatives Desks, Structured Products Teams, Risk Management.

> **Hinweis:** Unsere Monte Carlo Price Projection (INDICATOR_ARCHITECTURE.md, 5h, Todo #45) verwendet GBM -- die einfachste Variante. Jump Diffusion und CIR waeren Erweiterungen fuer spaeter.

**PfF Referenz:** Ch.10 L16700-17800 (Simulation Klassen, GBM/JD/SRD)

---

## 4. Zusammenfassung: Was wann relevant wird

| Trigger | Dann relevant | Konzepte |
|---|---|---|
| **ML-Pipeline gebaut** (Python + Feature Store + Retraining) | Strategie-Automatisierung | Meta-Labeling, FracDiff, Sample Weights, CPCV, Bet Sizing, CPO |
| **Multi-Asset Portfolio View** (>5 Positionen pro User) | Portfolio-Optimierung | HRP (bereits in INDICATOR_ARCHITECTURE.md als Todo #48) |
| **Pair Scanner Feature** (findet korrelierte/cointegrated Assets) | Stat Arb Tools | Cointegration Tests, Spread-Monitoring |
| **Options Trading Feature** | Derivatives Analytics | Options Pricing, Greeks, IV Surface (bereits in INDICATOR als Todo #46) |
| **Execution Engine** (automatisierte Order-Ausfuehrung) | Algo Trading | HFT, Factor Models, Seasonal Strategies |
| **Regulatorisches Requirement** (Bank/Fund-Lizenz) | Risk Compliance | VaR, CVaR, Stress Testing |

---

## 5. Bereits in INDICATOR_ARCHITECTURE.md integrierte Quant-Konzepte

Zur Vollstaendigkeit -- diese Konzepte kamen aus den Quant-Buechern, sind aber bereits als Todos/Sektionen eingebaut:

| Konzept | Quelle | INDICATOR_ARCHITECTURE.md | Todo # |
|---|---|---|---|
| Volume/Dollar Bars | AFML Ch.2 | Sektion 5e | #40 |
| Triple-Barrier Labeling | AFML Ch.3 | Sektion 5g | #44 |
| CUSUM Structural Breaks | AFML Ch.17 | Sektion 5f | #41 |
| Kelly Criterion | QT Ch.6 | Sektion 5d-Ergaenzung | #39 |
| Mean-Rev vs Momentum Test | QT Ch.7 | Sektion 5f | #42 |
| Regime-Conditional Parameters | QT Ch.7 | Sektion 5f | #43 |
| Monte Carlo Projection | PfF Ch.3 | Sektion 5h | #45 |
| Implied Volatility Surface | PfF Ch.3 | Sektion 5i | #46 |
| Deflated Sharpe Ratio | AFML Ch.14 | Sektion 5j | #47 |
| HRP Portfolio-Optimierung | AFML Ch.16 | Sektion 5k | #48 |
| VPIN Order Flow Toxicity | AFML Ch.19 | Sektion 5l | #49 |
| Entropy Features | AFML Ch.18 | Sektion 5m | #50 |
