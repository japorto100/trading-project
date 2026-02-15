# Tradeview Fusion - Tiefenanalyse & Architektur-Audit

> Stand: 15. Februar 2026
> Scope: Code-Qualitaet, Duplikationen, fehlende Verbindungen, Backend-Architektur, Sprachempfehlungen

---

## Inhaltsverzeichnis

1. [Pre-8: Offene Restpunkte aus Kapitel 1-7](#pre-8-offene-restpunkte-aus-kapitel-1-7)
2. [Backend-Architektur: Go + Python + TypeScript](#8-backend-architektur-go--python--typescript)
3. [Konkrete Empfehlung: GoCryptoTrader als Infrastruktur-Backend](#9-konkrete-empfehlung-gocryptotrader-als-infrastruktur-backend)
4. [Priorisierte Roadmap](#10-priorisierte-roadmap)

---

## Pre-8: Offene Restpunkte aus Kapitel 1-7

Die Detailkapitel 1-7 wurden zur Klarstellung nach `docs/archive/PROJECT_AUDIT.md` verschoben.

### Noch offen aus Kapitel 6 (Paper Trading / Portfolio)

- P&L History (persistente Historie/Reports)
- Risk Management (Sizing/Rules, z. B. ATR-basiert)
- Trade Journal (Notizen, Kontext, Screenshots)
- Backtesting Engine
- Strategy Engine (regelbasiert/automatisiert)

### Pre-8 Entscheidungsstand (15. Februar 2026)

- **P&L History:** bereits teilweise in TypeScript vorhanden (`src/lib/orders/portfolio.ts` erzeugt `equityCurve` + Drawdown aus Fill-Historie). Naechster Schritt bleibt persistente Snapshot-Historie/Reporting.
- **Risk Management:** kurzfristig in TypeScript (UI-Risk-Estimate, Paper-Flows), strategisch fuer Backtest/Execution in Go ueber GCT-Backtester-Portfolio-Manager.
- **Trade Journal:** bleibt vorerst in TypeScript/Prisma (UI-nahe Notizen, Screenshots, Tags); kein Mehrwert im GCT-Core.
- **Backtesting Engine:** klar in Go verorten (GCT-Backtester vorhanden); Gateway stellt spaeter nur stabile Produkt-Contracts bereit.
- **Strategy Engine:** regelbasiert/ML-lastig in Python (FastAPI Service), nicht im Frontend und nicht direkt im GCT-Core.

### Noch offen aus Kapitel 7 (Geopolitical AI/ML)

- Vollausbau `news_cluster` (z. B. Embeddings + fortgeschrittenes Clustering)
- Vollausbau social_surge (z. B. FinBERT/Domain-Sentiment)
- Vollausbau `narrative_shift` (z. B. LLM-gestuetzte Narrative-Analyse)
- Erweiterte Datenquellen/Adapters ueber den aktuellen MVP hinaus

Hinweis: Diese offenen Punkte koennen ganz oder teilweise durch Referenz-Implementierungen in `docs/REFERENCE_PROJECTS.md` abgedeckt bzw. beschleunigt werden.

---
## 8. Backend-Architektur: Go + Python + TypeScript

### 8.0 Review-Stand (GoCryptoTrader, verifiziert)

- Lokale Fork-Basis liegt unter `go-backend/vendor-forks/gocryptotrader` (Source-Mirror aus Upstream).
- GCT ist technisch sehr umfangreich (WebSocket, Backtester, Portfolio, gRPC/JSON-RPC), aber klar bot-zentriert.
- `config_example.json` zeigt unsichere Defaults fuer Remote-Control (`username: admin`, `password: Password`) und muss vor produktiver Nutzung gehaertet werden.
- Architekturentscheidung: GCT als Engine nutzen, aber nie ungefiltert direkt ans Frontend anbinden. Davor bleibt ein eigener `go-backend` Gateway mit stabilen Produkt-Contracts.
- Review-Notizen und naechster Slice: `go-backend/FORK_NOTES.md`.
- Fortschritt (15. Februar 2026, umgesetzt):
  - Gateway-Skeleton baut und startet lokal reproduzierbar.
  - Endpunkte `/health` und `/api/v1/stream/market` laufen im Gateway.
  - GCT-Connector ist nicht mehr rein statisch: `/health` prueft jetzt live `/v1/getinfo` (inkl. Fehlerstatus bei nicht erreichbarem GCT).
  - Neuer minimaler Quote-Contract vorhanden: `GET /api/v1/quote?symbol=BTC/USDT&exchange=binance&assetType=spot` (liefert bei fehlendem Upstream bewusst `502` mit stabiler Error-Antwort).
  - Quote-Endpoint gehaertet: striktes Input-Validation-Set (Exchange/AssetType/Symbol), Timeout/Retry im Connector und klarere Fehler-Mappings (`400`/`502`/`504`).
  - Fork-Check abgeschlossen: vorhandene GCT-RPC-Endpoints (`/v1/getticker`, `/v1/getinfo`) und Auth-Layer bestaetigt; Gateway bleibt bewusst als Contract/Validation-Layer davor.
  - Laufzeit-Detail aus Fork-Tests: GCT gRPC-Proxy auf `9053` spricht TLS; Gateway unterstuetzt dafuer nun `https` + optional `GCT_JSONRPC_INSECURE_TLS=true` (lokales self-signed Zertifikat).
  - Root-Cause Fix fuer Quote-`502` im Live-Betrieb: `lastUpdated` kommt von GCT als String; Connector akzeptiert jetzt String+Number robust.
  - Quote-Endpunkt liefert im Minimal-Stack jetzt erfolgreich `200` mit Live-Daten (`Binance BTC/USDT`).
  - Reproduzierbarer Dev-Stack vorhanden: `go-backend/scripts/dev-stack.ps1` (automatische Minimal-Config: 1 Exchange + 1 Pair).
  - `/api/v1/stream/market` liefert jetzt Live-Quote-SSE-Events (`ready`, `quote`, `heartbeat`, `upstream_error`) statt nur Heartbeat-Stub.
  - Go-Umgebung verifiziert: `go.exe` liegt auf `C:\Program Files\Go\bin\go.exe`; `GOPATH`, `GOMODCACHE`, `GOCACHE`, `GOBIN`, `GOTMPDIR` liegen unter `D:\DevCache\go\...`.
  - SSE-gRPC-Stream stabilisiert: kein erzwungener Request-Timeout mehr fuer langlaufende Streams (`OpenTickerStream` nutzt eigenen cancelbaren Stream-Context statt `withTimeout`).
  - Connector-Konfig-Fix: `GCT_PREFER_GRPC=false` wird jetzt korrekt respektiert (kein erzwungenes Zuruecksetzen auf `true` im Client).
  - E2E-Minimal-Stack erneut verifiziert: `/health` = `200`, `/api/v1/quote` = `200`, `/api/v1/stream/market` liefert `ready` + `quote`.
  - E2E-Fallback ebenfalls verifiziert: mit `GCT_PREFER_GRPC=false` liefern `/health` und `/api/v1/quote` weiterhin `200` (HTTP-RPC-Pfad aktiv).
  - Pflicht-Quality-Gates fuer diesen Slice: `go test ./...`, `go vet ./...`, `go test -race ./...`.
  - Wichtiger Runner-Hinweis: fuer `go test -race` auf Windows muss `CGO_ENABLED=1` gesetzt sein und ein C-Compiler im `PATH` liegen (hier: `C:\msys64\ucrt64\bin\gcc.exe`).
  - Reproduzierbarer Test-Runner vorhanden: `go-backend/scripts/test-go.ps1` (fuehrt `test` + `vet` + optional `-race` in einem Schritt aus).
  - Erster Nicht-Crypto-Adapter ist live: `exchange=ecb` + `assetType=forex` nutzt offiziellen ECB-FX-Feed (`eurofxref-daily.xml`) fuer stabile Forex-Quotes.

### 8.1 Warum drei Sprachen Sinn machen

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                           │
│              Next.js + React 19                       │
│    (Charts, UI, API Gateway, Einfache Indikatoren)   │
│              TypeScript (23 Indikatoren)              │
└──────────┬───────────────┬───────────────┬───────────┘
           │               │               │
     REST/gRPC         REST/HTTP        REST/HTTP
           │               │               │
┌──────────▼───────┐ ┌─────▼──────────┐ ┌──────▼──────────┐
│  GO UNIFIED      │ │  PYTHON        │ │  NEXT.js API    │
│  DATA LAYER      │ │  (FastAPI)     │ │  ROUTES (exist.)│
│                  │ │                │ │                  │
│ CRYPTO (GCT):   │ │ ROLLE 1: AI/ML│ │ - Geo Pipeline  │
│ - 30+ Exchange   │ │ - NLP/LLM     │ │ - Order CRUD UI │
│   WebSockets     │ │ - FinBERT     │ │ - SSE Stream    │
│ - Order Execution│ │ - HDBSCAN     │ │                  │
│ - Backtesting    │ │ - Sentiment   │ │ (TS Provider     │
│ - Portfolio Mgmt │ │ (empfaengt    │ │  als Uebergang   │
│                  │ │  Rohdaten     │ │  bis Go-Adapter  │
│ STOCKS/FOREX:    │ │  von Go)      │ │  fertig sind)    │
│ - Go-Adapter     │ │               │ │                  │
│   (REST + WS)    │ │ ROLLE 2: INDI.│ └──────────────────┘
│                  │ │ - Patterns    │
│ MACRO DATA:      │ │ - K's Collect.│
│ - FRED, ECB      │ │ - Composite   │
│   Go-Adapter     │ │ - Elliott Wave│
│                  │ │ - Perf. Eval  │
│ NEWS FETCHING:   │ │               │
│ - RSS, GDELT     │ │               │
│ - Finviz, Yahoo  │ │               │
│   (Rohdaten ->   │ │               │
│    Python)       │ │               │
│                  │ │               │
│ - gRPC API       │ │               │
│ - Historical DB  │ │               │
└──────────────────┘ └────────────────┘
```

### 8.2 Go: Unified Data Layer + Trading

Die Go-Schicht ist der **einzige Ort fuer alle externe Daten-Beschaffung**. GoCryptoTrader liefert Crypto nativ; eigene Go-Adapter (im selben Fork) decken Stocks, Forex, Macro und News ab.

**GoCryptoTrader (Crypto) bietet:**
- 30+ Exchange-Verbindungen (Binance, Kraken, Coinbase, etc.) mit WebSocket UND REST
- Unified Order Execution (Place/Cancel/Modify auf jeder Exchange)
- Portfolio Tracker mit P&L, Drawdown, Unrealized PnL
- Backtesting Engine mit historischen Daten
- gRPC API die von jedem Frontend ansprechbar ist
- Datenbank-Support (PostgreSQL, SQLite)
- Rate Limiting pro Exchange eingebaut

**Eigene Go-Adapter (im GCT-Fork) fuer:**
- **Stocks/Forex:** Finnhub, Twelve Data, Polygon, Alpha Vantage (REST + WebSocket). Goroutines fuer persistente WS-Verbindungen
- **Macro Data:** FRED, ECB (Scheduled Polling, lokaler Cache)
- **News Fetching:** RSS Feeds, GDELT, Finviz, Yahoo News. Go holt Rohdaten, sendet sie per gRPC/HTTP an Python zur Verarbeitung (NLP, Sentiment, Clustering)

**Was man NICHT braucht von GoCryptoTrader:**
- Dessen CLI/TUI Interface (headless betreiben)
- Dessen Config-System (eigenes Config in Next.js)
- Dessen Web-UI (euer Frontend bleibt Next.js)

**Konkreter Nutzen fuer euer Projekt:**

| Aktuelles Problem | Go-Schicht Loesung |
|-------------------|----------------------|
| 14 fragile TS REST-Provider | Go-Adapter mit eingebautem Rate Limiting, Caching, Circuit Breaker |
| Kein WebSocket | 30+ Crypto Exchanges + Stock/Forex WS via Goroutines |
| SSE Polling Loop (1-5s Latenz) | Native WebSocket Push (<100ms) |
| Kein Level 2 / Orderbook | Exchange Orderbook Streaming |
| Kein Backtesting | Eingebaute Backtest Engine |
| Kein Portfolio Tracking | Portfolio Management System |
| Kein echtes Order-Routing | Multi-Exchange Order Execution |
| News Fetching verstreut (TS) | Zentraler Go News-Fetcher, Python verarbeitet |
| Macro Data (FRED/ECB) in TS | Go-Adapter mit Scheduled Polling + Cache |
| Paper Trading ohne Backtest-Verifikation | Strategy + Backtest -> Paper -> Live Pipeline |

### 8.3 Python: Wann und wofuer

Python hat **zwei Rollen** im System:

**Rolle 1: AI/ML Soft-Signal Adapter (Verarbeitung, KEIN Fetching)**

> **Wichtig:** Python holt KEINE Daten selbst. Alle Rohdaten (News, OHLCV, Macro) kommen von der Go-Schicht. Python empfaengt und verarbeitet sie.

1. **AI/ML Soft-Signal Adapter** (FinBERT, HDBSCAN, Sentence-Transformers) -- empfaengt News-Rohdaten von Go
2. **LLM-Integration** (Ollama fuer lokale Modelle, OpenAI API fuer Cloud)
3. **News Clustering** (HDBSCAN, UMAP -- empfaengt vorab von Go geholte Artikel)
4. **Sentiment Analysis** (FinBERT, FinGPT -- verarbeitet Go-News-Feed)

**Rolle 2: Indicator Service (NEU -- basierend auf "Mastering Financial Markets with Python")**
5. **Komplexe Indikator-Berechnung** (KAMA, ALMA, K's Collection, Rainbow -- zu komplex/exotisch fuer TS)
6. **Pattern Recognition** (Candlestick, Harmonic, Timing, Price Patterns -- 4 Kapitel, 20+ Patterns)
7. **Composite Signals** (Dreier-Signal: 50-Day + Heartbeat + Volume Kombination)
8. **Elliott Wave Detection** (rekursive Wave-Zaehlung, Fibonacci-Validation)
9. **Performance Evaluation** (Sharpe, Sortino, Expectancy, Backtesting Framework)
10. **Alternative Charting** (Heikin-Ashi, Volume Candles, K's Candles, CARSI Transformationen)

**Was in TypeScript BLEIBT:**
- Einfache Indikatoren fuer <50ms Chart-Rendering (SMA, EMA, RSI, MACD, Bollinger etc. -- alle 23 bestehenden)
- WebSocket-Handling bleibt bei Go
- REST API Gateway bleibt bei Next.js

**Setup:** Ein FastAPI-Server mit Endpunkten fuer BEIDE Rollen:
```
# Rolle 1: AI/ML
POST /api/v1/cluster-headlines    -> news_cluster Adapter
POST /api/v1/social-surge         -> social_surge Adapter
POST /api/v1/narrative-shift      -> narrative_shift Adapter
GET  /api/v1/sentiment/{symbol}   -> Sentiment Score fuer ein Symbol

# Rolle 2: Indicator Service
POST /api/v1/signals/composite    -> Dreier-Signal (50-Day + Heartbeat + Volume)
POST /api/v1/patterns/candlestick -> Candlestick Pattern Recognition (Ch.7)
POST /api/v1/patterns/harmonic    -> Harmonic Pattern Recognition (Ch.8)
POST /api/v1/patterns/timing      -> Timing Patterns (Ch.9)
POST /api/v1/patterns/price       -> Price Patterns (Ch.10)
POST /api/v1/patterns/elliott-wave -> Elliott Wave Detection
POST /api/v1/indicators/exotic-ma  -> KAMA, ALMA, IWMA etc. (Ch.3)
POST /api/v1/indicators/ks-collection -> K's Reversal I+II, ATR-RSI etc. (Ch.11)
POST /api/v1/evaluate/strategy     -> Performance Evaluation (Ch.12)
```

> **Vollstaendige Architektur:** Siehe [`docs/INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sektion 7 fuer die komplette Service-Struktur, Projekt-Layout, API Formate und Abhaengigkeiten.

### 8.4 TypeScript/Next.js: Was bleibt

**Behaelt:**
- Gesamtes Frontend (React 19, Tailwind v4, shadcn/ui)
- API Gateway / Routing (Proxy zu Go + Python)
- Geopolitical Pipeline (Validation, Confidence, Dedup, Anti-Noise, Alerts)
- Einfache Indikator-Berechnungen (23 Indikatoren in `lib/indicators/` -- SMA, EMA, RSI, MACD etc. fuer <50ms Chart-Rendering)
- Chart-Rendering (LWC + Custom Engine)
- State Management (Zustand)

**Wird langfristig ersetzt (Uebergangs-Loesung):**
- Die 14 REST-Provider (`src/lib/providers/`) bleiben als **Uebergangs-Loesung** bis Go-Adapter sie ersetzen. Konkret: Finnhub, Twelve Data, Polygon, Alpha Vantage, FRED, ECB etc. werden schrittweise in Go-Adapter migriert.
- News-Fetching in `src/lib/news/sources.ts` wandert ebenfalls in die Go-Schicht.

> **Querverweis:** Fuer die vollstaendige Liste aller Referenz-Projekte und deren Zuordnung zu den drei Schichten, siehe [`docs/REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md). Die Zuordnung:
>
> | Schicht | REFERENCE_PROJECTS.md Sektionen |
> |---------|-------------------------------|
> | Go (Unified Data Layer) | Sektion 4.5 (Crypto + Stock/Forex/Macro/News Adapter) |
> | Python (FastAPI) | Sektion 8 (AI/ML + SOTA), Sektion 4.6 (Indicator Service), Sektion 3 (GeoPulse/GameTheory) |
> | TypeScript (Next.js) | Sektionen 1-2 (TV-Klone, Charts), 5-6 (Paper Trading, Backtesting). Provider in Sektion 4 als Uebergang |

---

## 9. Konkrete Empfehlung: GoCryptoTrader als Infrastruktur-Backend

### 9.1 Fork-Strategie

GoCryptoTrader ist **MIT-lizenziert** -- uneingeschraenkt forkbar, modifizierbar und kommerziell nutzbar.

**Warum Fork statt Clone:**
- Ihr braucht nur 5-10 der 30+ Exchanges (Binance, Kraken, Coinbase, etc.) -- den Rest koennt ihr rauswerfen
- Das CLI/TUI Interface ist unnoetig (headless reicht) -- rauswerfen spart Komplexitaet
- Eigene Events/Hooks fuer euer Frontend (z.B. Custom WebSocket Messages an Next.js)
- Config-System kann auf euer Setup angepasst werden
- Upstream-Updates koennt ihr selektiv cherry-picken

**Fork-Setup:**

```bash
# 1. Fork auf GitHub erstellen (Button auf github.com/thrasher-corp/gocryptotrader)
#    -> euer Fork: github.com/EUER-ORG/gocryptotrader

# 2. Fork klonen
git clone https://github.com/EUER-ORG/gocryptotrader.git
cd gocryptotrader

# 3. Upstream als Remote hinzufuegen (fuer spaetere Updates)
git remote add upstream https://github.com/thrasher-corp/gocryptotrader.git

# 4. Go installieren falls noetig (https://go.dev/dl/)

# 5. Binary bauen (eine einzige ausfuehrbare Datei, kein Docker!)
go build -o gct ./cmd/gocryptotrader

# 6. Config generieren
./gct --config genconfig

# 7. Headless starten
./gct --config config.json
```

**Kein Docker noetig.** Go kompiliert zu einer einzelnen Binary. Keine Runtime-Dependencies.

**Was ihr im Fork anpassen solltet:**

| Bereich | Aktion | Warum |
|---------|--------|-------|
| `cmd/gocryptotrader/` | CLI/TUI Flags entfernen die ihr nicht braucht | Weniger Komplexitaet |
| `exchanges/` | Nur relevante Exchanges behalten (Binance, Kraken, Coinbase, ...) | Build-Groesse und Wartung |
| `config/` | Default-Config auf euer Setup anpassen | Schnelleres Onboarding |
| `engine/` | Custom Event-Hooks fuer Next.js Integration | WebSocket Push an Frontend |
| `gctscript/` | Evtl. entfernen (braucht ihr wahrscheinlich nicht) | Weniger Angriffsflaeche |

**Upstream-Sync (bei Bedarf):**
```bash
git fetch upstream
git merge upstream/main  # oder cherry-pick einzelner Commits
```

> **Kernpunkt:** Der Fork gibt euch die komplette Infrastruktur (WebSocket, Orders, Backtesting, Portfolio) die ihr aktuell nicht habt -- ohne alles von Null zu bauen. Das sind geschaetzt **20.000-40.000 Zeilen Go-Code** die ihr nicht selbst schreiben muesst.

### 9.2 Integration mit Next.js

GoCryptoTrader bietet einen gRPC-Server. Die Integration:

1. **gRPC-Client in Next.js** -- via `@grpc/grpc-js` npm Package
2. **Oder:** gRPC-Gateway (HTTP/JSON Proxy) den GoCryptoTrader eingebaut hat
3. **Einfachste Option:** REST Wrapper um gRPC -- GoCryptoTrader hat auch einen REST-Endpoint

### 9.3 Migration in Phasen

| Phase | Was | Aufwand |
|-------|-----|---------|
| Phase 1 | GoCryptoTrader starten, Binance/Kraken WebSocket aktivieren | 1-2 Tage |
| Phase 2 | Next.js SSE durch GCT WebSocket Feed ersetzen | 2-3 Tage |
| Phase 3 | Paper Trading an GCT Order Engine anbinden | 3-5 Tage |
| Phase 4 | Backtesting mit GCT Backtest Engine | 3-5 Tage |
| Phase 5 | Portfolio Tracking mit GCT Portfolio | 2-3 Tage |

### 9.4 Was die vorhandenen REST-Provider danach noch machen

Die 14 REST-Provider in `src/lib/providers/` bleiben relevant -- GoCryptoTrader **ersetzt** sie nicht, sondern **ergaenzt** sie:

| Datenpipeline | Primaere Quelle | Asset-Klassen | Protokoll |
|---------------|-----------------|---------------|----------|
| **Crypto Market Data** | GoCryptoTrader | BTC, ETH, alle 30+ Exchange-Assets | WebSocket (nativ) |
| **Stocks Market Data** | Finnhub, Polygon, Alpha Vantage | US/EU Stocks, ETFs, Options | REST (bestehend), optional WS Upgrade |
| **Forex** | Finnhub, Twelve Data, Finage | Major/Minor Pairs | REST (bestehend), optional WS Upgrade |
| **Wirtschaftsdaten** | FRED, ECB | Macro-Indikatoren, Wechselkurse | REST (bestehend) |
| **Crypto Fallback** | CCXT (TS-nativ) | Long-Tail Exchanges die GCT nicht abdeckt | REST (Unified API) |

**Wichtig:**
- Die `ProviderManager`-Architektur mit Circuit Breaker bleibt bestehen und wird nicht angetastet
- GoCryptoTrader wird als **zusaetzlicher Provider** in die Kette integriert -- aber der primaere fuer Crypto
- Fuer Stocks/Forex/Macro aendert sich nichts an der bestehenden Architektur
- **CCXT** ([github.com/ccxt/ccxt](https://github.com/ccxt/ccxt)) dient als TS-native Bridge fuer Exchanges die GoCryptoTrader nicht abdeckt und als leichtgewichtiger Fallback wenn der Go-Service nicht laeuft
- Zwei parallele Daten-Pipelines: Go (Crypto WebSocket) neben TypeScript (Stocks/Forex REST) -- kein gegenseitiges Abhaengigkeitsrisiko

---

## 10. Priorisierte Roadmap

### Sofort machbar (TypeScript only, kein neuer Service)

| # | Aktion | Aufwand | Wirkung |
|---|--------|---------|---------|
| 1 | **Indikator-Konsolidierung**: `chart/indicators/` loeschen, alles aus `lib/indicators/` nutzen | 2-3h | 1650 Zeilen toter Code weg |
| 2 | **chartData.ts Legacy entfernen**: SMA/EMA/RSI nach `lib/indicators/` migrieren | 1h | Duplikate weg |
| 3 | **IndicatorPanel erweitern**: Ichimoku, ADX, Parabolic SAR, Keltner, etc. aus `lib/indicators/` hinzufuegen | 4-6h | 9 weitere Indikatoren im UI |
| 4 | **Volume Profile Visualisierung**: `calculateVolumeProfile()` an Chart-Overlay anbinden | 3-4h | Wichtiger Volume-Indikator sichtbar |
| 5 | **Support/Resistance Overlay**: `findSupportResistance()` als horizontale Linien rendern | 2-3h | Direkt nuetzlich fuer Trading |

### Kurzfristig (1-2 Wochen, Go Backend Setup)

| # | Aktion | Aufwand | Wirkung |
|---|--------|---------|---------|
| 6 | GoCryptoTrader **forken/basisieren**, Config haerten, minimale Exchange-Selection aktivieren (siehe 9.1) | 1-2 Tage | Sichere WebSocket-Infrastruktur |
| 7 | WebSocket-zu-SSE-Bridge bauen (GCT -> eigener Go-Gateway -> Next.js -> Client) | 2-3 Tage | Echtzeit-Daten <100ms + stabile Contracts |
| 7a | Gateway Vertical Slice (Health + SSE + Quote + Live-GCT-Connector-Basis) | **ERLEDIGT (14.02.2026)** | Laufender Service mit stabilem Contract und klarer Upstream-Fehlerfuehrung |
| 7b | Quote-Livepfad haerten (TLS, Canonical Exchange Mapping, Timestamp-Parsing, Tests) | **ERLEDIGT (15.02.2026)** | `/api/v1/quote` liefert im Minimal-Stack reproduzierbar `200` |
| 7c | SSE-Livequote-Slice (Quote-Events statt Heartbeat-Stub) | **ERLEDIGT (15.02.2026)** | `/api/v1/stream/market` liefert `quote`-Events mit stabilem Contract |
| 7d | SSE-Stream-Stabilisierung + Go-Test-Runner-Gates (`test`/`vet`/`race`) | **ERLEDIGT (15.02.2026)** | Stream bleibt offen (kein 4s-Deadline-Abbruch), Quality-Gates als Pflicht dokumentiert |
| 7e | Erster Nicht-Crypto Adapter (ECB Forex) im Gateway-Quote-Contract | **ERLEDIGT (15.02.2026)** | `GET /api/v1/quote?symbol=EUR/USD&exchange=ecb&assetType=forex` liefert `200` mit Quelle `ecb` |
| 8 | Portfolio Tracking UI bauen | **ERLEDIGT** | P&L, Drawdown, Positionen |

### Mittelfristig (3-6 Wochen, Go-Adapter + Python Microservice)

**Go-Schicht: Stock/Forex/Macro/News Adapter**

| # | Aktion | Aufwand | Wirkung |
|---|--------|---------|---------|
| 9 | Stock/Forex Go-Adapter Planung (API-Mapping, Rate Limits) | **TEILWEISE ERLEDIGT (15.02.2026)** | Grundlage steht; erster produktiver Slice via ECB-Forex-Adapter im Gateway vorhanden |
| 10 | Erster Go-Adapter: Finnhub REST + WS (Stocks) | 3-5 Tage | Ersetzt `src/lib/providers/finnhub.ts` |
| 11 | News-Fetching Go-Adapter: RSS + GDELT + Finviz | 3-5 Tage | Rohdaten -> Python Pipeline |
| 12 | Macro Data Go-Adapter: FRED + ECB | 2-3 Tage | Ersetzt `src/lib/providers/fred.ts` + `ecb.ts` |

**Python Rolle 1: AI/ML Soft-Signal Adapter (empfaengt Daten von Go)**

| # | Aktion | Aufwand | Wirkung |
|---|--------|---------|---------|
| 13 | FastAPI Microservice aufsetzen (Basis fuer BEIDE Rollen) | 1 Tag | AI/ML + Indicator Infrastruktur |
| 14 | news_cluster Adapter implementieren (HDBSCAN + Embeddings) | 3-5 Tage | Automatische Event-Erkennung |
| 15 | social_surge Adapter implementieren (FinBERT) | 3-5 Tage | Social Media Monitoring |

**Python Rolle 2: Indicator Service (Buch "Mastering Financial Markets")**

| # | Aktion | Aufwand | Buch-Referenz |
|---|--------|---------|--------------|
| 16 | `swing_detect()` + Fibonacci Retracements implementieren | 1-2 Tage | Ch.5 L3255-3481 |
| 17 | Composite Signal (Dreier-Signal: 50-Day + Heartbeat + Volume) | 2-3 Tage | INDICATOR_ARCHITECTURE.md Sektion 3 |
| 18 | Pattern Recognition: Candlestick + Harmonic + Timing + Price | 8-12 Tage | Ch.7-10 (L3851-5242) |
| 19 | Elliott Wave Detection (eigene Python-Implementierung) | 3-5 Tage | INDICATOR_ARCHITECTURE.md Sektion 4 |
| 20 | K's Collection (6 Indikatoren) + Exotische MAs (KAMA, ALMA, IWMA) | 3-4 Tage | Ch.11 L5260-5682, Ch.3 L1675-1965 |
| 21 | Performance Evaluation + Backtesting Framework | 2-3 Tage | Ch.12 L5694-6067 |
| 22 | Backtesting mit GoCryptoTrader integrieren | 5-7 Tage | Strategy-Validierung |

> **Detaillierter Plan mit 34 Todos, Phasen A-E, und allen Buch-Zeilennummern:** Siehe [`docs/INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sektion 8.

---

## Anhang A: Datei-Referenz

| Datei | Zeilen | Status | Empfehlung |
|-------|--------|--------|-----------|
| `src/lib/indicators/index.ts` | 824 | AKTIV | BEHALTEN - primaere Quelle |
| `src/chart/indicators/advanced.ts` | 616 | TOT | LOESCHEN - Code nach lib/indicators/ migrieren |
| `src/chart/indicators/index.ts` | 1033 | TOT | LOESCHEN - Registry-Konzept uebernehmen, Rest weg |
| `src/lib/chartData.ts` | ~80 (Indikatoren) | LEGACY | LOESCHEN - durch lib/indicators/ ersetzen |
| `src/chart/engine/ChartEngine.ts` | 580 | TEILAKTIV | BEHALTEN - Custom Engine hat Wert |
| `src/chart/engine/Layers.ts` | 810+ | TEILAKTIV | BEHALTEN - IndicatorLayer anschliessen |
| `src/lib/providers/index.ts` | 456 | AKTIV | UEBERGANG - langfristig durch Go-Adapter ersetzen |
| `src/lib/geopolitical/adapters/soft-signals.ts` | 34 | SCAFFOLD | ERWEITERN - Python Integration |
| `src/features/trading/SignalInsightsBar.tsx` | 103 | AKTIV | BEHALTEN + erweitern |
| `src/components/IndicatorPanel.tsx` | 499 | AKTIV | ERWEITERN - mehr Indikatoren |
| `src/lib/orders/types.ts` | 31 | AKTIV | ERWEITERN - Portfolio, Positions |

## Anhang B: Typ-Inkompatibilitaeten

Die drei Indikator-Systeme verwenden verschiedene Input/Output-Typen:

```
lib/indicators/index.ts:     OHLCV -> IndicatorData[]
                              (time: number, value: number)

chart/indicators/index.ts:   Candle -> IndicatorPoint[]
                              (time: number, value: number)
                              Candle hat dieselben Felder wie OHLCV, nur andere Benamsung

lib/chartData.ts:            CandleData -> IndicatorData[]
                              CandleData = { time: Time, open, high, low, close, volume }
                              Time = string | BusinessDay (Lightweight Charts spezifisch)
```

**Loesung:** Einen einheitlichen `OHLCV`-Typ festlegen. Alle Indikatoren verwenden `OHLCV -> IndicatorData[]`. Adapter-Funktionen fuer LWC-spezifische Time-Formate.

---

## Anhang C: Naechste Schritte und Verweise

### Reihenfolge fuer einen Coding Agent

Dieses Audit ist das **primaere Arbeitsdokument**. Arbeite es in dieser Reihenfolge ab:

**Phase 1 -- Sofort (TypeScript, kein neuer Service):**
Roadmap Sektion 10 "Sofort machbar" (Punkte 1-5). Rein interner Cleanup und UI-Erweiterungen. Keine externen Abhaengigkeiten. Kann in einem Tag erledigt werden.

**Phase 2 -- GoCryptoTrader Fork (Go Backend):**
Das ist der wichtigste infrastrukturelle Schritt. GoCryptoTrader schliesst die groessten Luecken im Projekt (WebSocket, Backtesting, Portfolio, Order Execution -- alles was aktuell komplett fehlt).

- **Fork-Strategie:** Sektion 9.1 in diesem Dokument -- beschreibt wie forken, was im Fork anpassen/rauswerfen, wie Upstream-Sync funktioniert
- **Integration mit Next.js:** Sektion 9.2 -- gRPC-Client, REST-Gateway, WebSocket Bridge
- **Phasen-Plan:** Sektion 9.3 -- 5 Phasen von "Binary bauen" bis "Portfolio Tracking"
- **Provider-Koexistenz:** Sektion 9.4 -- was die bestehenden REST-Provider weiterhin machen

**Phase 3 -- Python Indicator Service (Indikator-Architektur):**
Der zweitwichtigste Schritt. Python uebernimmt zwei Rollen: AI/ML Adapter UND Indicator Service. Der detaillierte Plan steht in einem eigenen Dokument.

- **Blueprint:** [`docs/INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) -- Architektur-Diagramm, funktionale Grenzen TS/Python/Go, alle Indikatoren mit Buch-Zeilennummern
- **Composite Signal:** INDICATOR_ARCHITECTURE.md Sektion 3 -- "Dreier-Signal" (50-Day + Heartbeat + Volume)
- **Elliott Wave:** INDICATOR_ARCHITECTURE.md Sektion 4 -- warum eigene Python-Implementierung noetig
- **Buch-Referenz-Index:** INDICATOR_ARCHITECTURE.md Sektion 5 -- Kapitel 1-12 mit exakten Zeilen fuer jeden Algorithmus
- **34 Todos in 5 Phasen:** INDICATOR_ARCHITECTURE.md Sektion 8 -- priorisiert und mit Abhaengigkeiten
- **Buch-Datei:** `docs/books/mastering-finance-python.md` (6469 Zeilen) -- "Mastering Financial Markets with Python" von Sofien Kaabar

**Phase 3 -- Python Microservice (AI/ML):**
Roadmap Sektion 10 "Mittelfristig" (Punkte 9-12). FastAPI aufsetzen, Soft-Signal Adapter implementieren. Braucht die leeren Adapter in `src/lib/geopolitical/adapters/soft-signals.ts`.

### Weitergehende Referenzen in `docs/REFERENCE_PROJECTS.md`

Das Audit beschreibt **was zu tun ist**. `REFERENCE_PROJECTS.md` beschreibt **welche externen Projekte und Libraries dabei helfen**. Relevante Sektionen dort:

| Wenn du an ... arbeitest | Dann lies in REFERENCE_PROJECTS.md |
|--------------------------|-----------------------------------|
| GoCryptoTrader Fork + Go-Adapter | **Sektion 4.5** -- Vollstaendige Projekt-Beschreibung, Features, Unified Data Layer |
| Stock/Forex/Macro Go-Adapter | **Sektion 4.5** -- Go-Adapter Architektur, Sektion 4 fuer TS-Uebergangs-Provider |
| Chart-Indikatoren / LWC Plugins | **Sektion 2** -- LWC Plugin-System, EquiCharts als Referenz |
| Backtesting (nach GCT Setup) | **Sektion 6** -- PineTS, BacktestJS als TS-native Ergaenzung zu GCT |
| Soft-Signal Adapter (Python) | **Sektion 8** -- Chronicle, Scout, FinBERT, FinGPT, GDELT mit Adapter-Mapping |
| Geopolitical Map Erweiterung | **Sektion 3** -- GeoPulse, GameTheory |
| WebSocket (Crypto + Stocks/Forex) | **Sektion 7** -- Referenz-Patterns (Umsetzung in Go-Goroutines, nicht TS) |
| Paper Trading UI | **Sektion 5** -- Foursight, NeonDash als UI-Referenzen |

> **Wichtig:** `REFERENCE_PROJECTS.md` ist Recherche-Kontext, kein Aktionsplan. Die konkreten Aufgaben stehen hier im Audit. Die Reference hilft wenn du verstehen willst *warum* eine bestimmte Library empfohlen wird oder *wie* ein externes Projekt aufgebaut ist.

