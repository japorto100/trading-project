# ARCHIVIERT -- Tradeview Fusion - Tiefenanalyse & Architektur-Audit

> **ARCHIVIERT am 19. Februar 2026.**
> Alle offenen Punkte wurden in spezialisierte Domain-Dokumente verteilt (siehe Extraktions-Uebersicht unten).
> Dieses Dokument dient nur noch als historische Referenz.

> **Original-Stand:** 15. Februar 2026
> **Scope:** Code-Qualitaet, Duplikationen, fehlende Verbindungen, Backend-Architektur, Sprachempfehlungen

---

## Extraktions-Uebersicht (Was wurde wohin verteilt?)

| Audit-Sektion | Inhalt | Ziel-Dokument | Status |
|---------------|--------|---------------|--------|
| **Pre-8, Kap. 7** | Soft-Signal Ausbaustufen (news_cluster, social_surge, narrative_shift) | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](../GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 18.1 | EXTRAHIERT |
| **Pre-8, Kap. 7** | ACLED Conflict Index/Monitors | [`REFERENCE_PROJECTS.md`](../REFERENCE_PROJECTS.md) (Deferred-Status-Tabelle) | BEREITS DORT |
| **Sek. 8.1-8.4** | Go/Python/TS Sprachgrenzen-Vertrag | [`UNIFIED_INGESTION_LAYER.md`](../UNIFIED_INGESTION_LAYER.md) Sek. 1, [`INDICATOR_ARCHITECTURE.md`](../INDICATOR_ARCHITECTURE.md) Sek. 2 | SUPERSEDED |
| **Sek. 8.5** | Geo-Daten-Luecken (ACLED Credentials, LLM-Summary, localStorage, Zombies) | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](../GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 25a (Infrastruktur-Luecken) | EXTRAHIERT |
| **Sek. 9** | GoCryptoTrader Fork-Strategie (komplett) | [`go-research-financial-data-aggregation-2025-2026.md`](../go-research-financial-data-aggregation-2025-2026.md) Sek. 10 | EXTRAHIERT |
| **Sek. 10, 22c** | PineTS AGPL Lizenz-Gate | [`INDICATOR_ARCHITECTURE.md`](../INDICATOR_ARCHITECTURE.md) Sek. 2.1 (Offener Punkt), [`REFERENCE_PROJECTS.md`](../REFERENCE_PROJECTS.md) Sek. 6 | EXTRAHIERT |
| **Sek. 10, 22i** | Backtesting Vollausbau + GCT Artefakt-Extraktion | [`RUST_LANGUAGE_IMPLEMENTATION.md`](../RUST_LANGUAGE_IMPLEMENTATION.md) Phase 3, Sek. 5 (AKQuant) | SUPERSEDED |
| **Sek. 10, 21/22** | Performance-Eval + Order Replay | [`RUST_LANGUAGE_IMPLEMENTATION.md`](../RUST_LANGUAGE_IMPLEMENTATION.md) Phase 3 (Erfolgskriterium) | SUPERSEDED |
| **Sek. 10.1** | Reference-Intake Plan | [`REFERENCE_PROJECTS.md`](../REFERENCE_PROJECTS.md) (Intake bereits geschehen) | HISTORISCH |
| **Anhang A** | File-Reference-Tabelle | Veraltet -- Codebase hat sich seit 15.02 stark veraendert | OBSOLET |
| **Anhang B** | Type-Incompatibilities | Mehrheitlich durch Go-Gateway gelöst | HISTORISCH |
| **Anhang C** | Next Steps + Cross-References | Veraltet -- kennt UIL, Advanced-Arch, CHERI, Portfolio-Arch nicht | OBSOLET |

---

## Inhaltsverzeichnis (Original)

1. [Pre-8: Offene Restpunkte aus Kapitel 1-7](#pre-8-offene-restpunkte-aus-kapitel-1-7)
2. [Backend-Architektur: Go + Python + TypeScript](#8-backend-architektur-go--python--typescript)
3. [Konkrete Empfehlung: GoCryptoTrader als Infrastruktur-Backend](#9-konkrete-empfehlung-gocryptotrader-als-infrastruktur-backend)
4. [Priorisierte Roadmap](#10-priorisierte-roadmap)

---

## Pre-8: Offene Restpunkte aus Kapitel 1-7

Die Detailkapitel 1-7 wurden zur Klarstellung nach `docs/archive/PROJECT_AUDIT.md` verschoben.

### Noch offen aus Kapitel 6 (Paper Trading / Portfolio)

- P&L History (persistente Historie/Reports) -- **ERLEDIGT (15.02.2026, Backend-Slice)**
- Risk Management (Sizing/Rules, z. B. ATR-basiert) -- **ERLEDIGT (15.02.2026, minimaler Sizing-Slice)**
- Trade Journal (Notizen, Kontext, Screenshots) -- **ERLEDIGT (15.02.2026, API+Persistence-Slice)**
- Backtesting Engine -- **TEILWEISE ERLEDIGT (15.02.2026, Capability + Strategy-Eval Slice)**
- Strategy Engine (regelbasiert/automatisiert) -- **TEILWEISE ERLEDIGT (15.02.2026, Python Indicator-Service Slice)**

### Pre-8 Entscheidungsstand (15. Februar 2026)

- **P&L History:** persistente Snapshot-Historie ist jetzt umgesetzt (`/api/fusion/portfolio/history` + optional `persist=true` bei `/api/fusion/portfolio`), inkl. Prisma/File-Fallback.
- **Risk Management:** minimaler produktiver Sizing-Contract ist live (`POST /api/fusion/risk/position-size`, inkl. ATR-basiertem Stop-Distance-Ansatz).
- **Trade Journal:** TypeScript/Prisma-Slice ist live (`/api/fusion/trade-journal`, `/api/fusion/trade-journal/[entryId]`) mit Notiz/Tags/Context/Screenshot-URL.
- **Backtesting Engine:** klar in Go verorten (GCT-Backtester vorhanden); Go bleibt kanonische Engine fuer lauffaehige Backtest-Ergebnisse.
- **Strategy Engine:** regelbasiert/ML-lastig in Python (FastAPI Service), nicht im Frontend und nicht direkt im GCT-Core; Python liefert Signale/Research, nicht die kanonische Ausfuehrungslogik.

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
  - Zweiter Nicht-Crypto-Slice ist live: `exchange=finnhub` + `assetType=equity` liefert Aktien-Quotes ueber Finnhub (Gateway-Routing + Tests + E2E mit Mock-Upstream verifiziert).
  - Finnhub-WS-Slice ist live: `/api/v1/stream/market?symbol=AAPL&exchange=finnhub&assetType=equity` nutzt Finnhub-Trade-WebSocket mit Polling-Fallback und stabilem SSE-Contract.
  - Dritter Nicht-Crypto-Slice ist live: `exchange=fred` + `assetType=macro` liefert FRED-Makro-Observations (`series/observations`) ueber denselben Quote-Contract.
  - News-Adapter-Slice ist live: neuer Endpoint `GET /api/v1/news/headlines` aggregiert RSS + GDELT + Finviz unter einem stabilen Gateway-Contract.
  - News-Hardening ist umgesetzt: Retries (`NEWS_HTTP_RETRIES`), normalisierte Headlines und Source-Quota-Balancing im Aggregator.
  - Macro-History-Slice ist live: `GET /api/v1/macro/history` liefert FRED-Historie sowie ECB-Forex-History-Punkte im Gateway-Contract.
  - Macro-Exchange-Ausbau ist live: `exchange=fed|fred|boj|snb` (macro) und `exchange=ecb` (forex) sind im selben Contract verfuegbar; BOJ/SNB laufen als FRED-Series-Aliases.
  - Macro-Scheduled-Ingest ist live: optionaler Snapshot-Runner (`MACRO_INGEST_ENABLED`) persistiert FED/ECB/BOJ/SNB Daten nach `go-backend/data/macro`.
  - Backtester-Fork-Capability ist direkt im Gateway sichtbar: `GET /api/v1/backtest/capabilities` listet verfuegbare GCT-Strategiebeispiele (`*.strat`) und vermeidet Doppelimplementierung.
  - Backtest-Run-Orchestrierung ist live: `POST/GET /api/v1/backtest/runs`, `GET /api/v1/backtest/runs/{id}`, `POST /api/v1/backtest/runs/{id}/cancel`, `GET /api/v1/backtest/runs/{id}/stream`.
  - Optionaler echter GCT-Executor ist integriert (Env-gesteuert): statt Simulationspfad kann der Manager reale Backtester-Tasks (`ExecuteStrategyFromFile` + `StartTask` + `ListAllTasks`) gegen den Fork-Backtester ausfuehren.
  - Ergebnis-Mapping wurde erweitert: best-effort Extraktion von `Strategy Movement`, `Sharpe Ratio`, `Biggest/Max Drawdown`, `Total Orders` aus GCT-Report-Artefakten in den stabilen `RunResult`-Contract.
  - Doppelarbeit-Fork-Check abgeschlossen: Portfolio/Order/Backtesting bleiben bewusst in GCT; Gateway und Python liefern nur stabile Produkt-Contracts davor (kein Rebuild der GCT-Engine).
  - Python Soft-Signal-Service ist produktiv als Basis vorhanden (`/api/v1/cluster-headlines`, `/api/v1/social-surge`, `/api/v1/narrative-shift`), Smoke-Test verifiziert.
  - Python Indicator-Service Vertical Slice ist produktiv vorhanden (`/api/v1/signals/composite`, `/api/v1/patterns/*`, `/api/v1/indicators/exotic-ma`, `/api/v1/indicators/ks-collection`, `/api/v1/evaluate/strategy`, `/api/v1/fibonacci/levels`, `/api/v1/charting/transform`), Smoke-Test verifiziert.
  - Frontend-Referenz-Slice aus TV-Klonen ist produktiv uebernommen: debounced Symbolsuche + Keyboard-/Highlight-Navigation im Header-Suchdropdown (`src/lib/hooks/useDebouncedValue.ts`, `src/components/fusion/SymbolSearch.tsx`, `src/features/trading/TradingHeader.tsx`, `src/app/page.tsx`).
  - Review-Entscheidung dokumentiert: fuer StockTraderPro/react-next-tradingview aktuell keine weitere direkte Code-Uebernahme geplant; Nutzung nur noch als punktuelle UX-Referenz.
  - Referenz-Status Kapitel-1/2 nachgezogen: GoChart und Divergex-Links aktuell `404`; EquiCharts/FirChart bleiben als begrenzte UX-/Engine-Referenzen (kein Full-Import, nur selektive Pattern-Entnahme).
  - EquiCharts/FirChart-Pattern-Slice ist im Frontend uebernommen: Drawing-Toolbar erhielt Tool-Gruppierung, Magnet-Modus, Visibility/Lock-Toggles, Hotkeys und lokale Persistenz (`src/components/DrawingToolbar.tsx`, `src/features/trading/TradingWorkspace.tsx`).
  - LWC-Plugin-Pattern-Slice ist im Chart umgesetzt: Primitive-Zeichnungen (Trendline/Rectangle/Horizontal/Vertical), Undo/Redo/Clear-Command-Flow und Magnet-Snapping laufen direkt in `TradingChart` (`src/components/TradingChart.tsx`).
  - Naechster Referenz-Review ist abgeschlossen (`LWC`, `GeoPulse`, `GeoInsight`): LWC bleibt aktive Plugin-Basis; GeoPulse/GeoInsight werden nur selektiv als Pattern-Quelle genutzt (kein direkter Code-Import).
  - GeoInsight-ACLED-Slice ist im Go-Gateway live: `GET /api/v1/geopolitical/events` nutzt einen echten ACLED-Connector (Token oder Legacy-Key), stabile Filter-Parameter und festen JSON-Contract.
  - ACLED-Filterausbau ist live: `region` + `subEventType` sind im Go-Connector/Handler als echte Query-Parameter enthalten und testabgedeckt.
  - Frontend-Bridge ist live: `GET /api/geopolitical/events` unterstuetzt jetzt `source=acled` (Go-Gateway-Proxy mit Cache + Paging) neben dem lokalen Store-Modus.
  - ACLED-Statusgrenze ist dokumentiert: produktiv ist derzeit die Event-API-Anbindung; ACLED Conflict Index/Monitors bleiben bis Lizenz-/Tier-Freigabe und Credentials als separater Intake-Block zurueckgestellt.
  - CFR Global Conflict Tracker ist als Research-/Context-Quelle eingeordnet: kein frei dokumentiertes Public API voraussetzen, nur eigener Kurzsummary + Deep-Link, keine CFR-Textspiegelung.
  - CrisisWatch ist als RSS-basierter Intake eingeordnet: Polling ueber offiziellen Feed (ohne Scraping), persistiert werden `guid/link`, `title`, `published_at`.
  - Geopolitical Context Slice ist live: Go-Endpoint `GET /api/v1/geopolitical/context?source=all|cfr|crisiswatch&limit=12` liefert stabilen Context-Contract (CFR link-only + CrisisWatch RSS).
  - Frontend-Context-Bridge ist live: `GET /api/geopolitical/context` proxied den Go-Contract inkl. Cache; `GeopoliticalMapShell` zeigt CFR/CrisisWatch im neuen Context-Panel.
  - CFR-Context wurde auf konfliktbezogene Detail-Links gehaertet (nicht nur Tracker-Root), weiterhin strikt link-only ohne Textspiegelung.
  - CrisisWatch-Connector ist gehaertet: optionaler TTL- + Persist-Store (`CRISISWATCH_CACHE_TTL_MS`, `CRISISWATCH_CACHE_PERSIST_PATH`) reduziert Live-Fetch-Druck und erlaubt Failover auf zuletzt bekannten Snapshot.
  - GeoPulse-Backend-Slice ist live: neuer Endpoint `GET /api/geopolitical/graph` liefert Event-Relations (Region/EventType/SubEventType/Asset) fuer Insights-Panels.
  - Weiterer Referenz-Review ist abgeschlossen (`GameTheory`, `CCXT`, `ffetch`): Job-Orchestrierung/Geo-Scoring-Patterns, Crypto-Fallback-Grenzen und HTTP-Hardening-Optionen sind als Intake-Regeln dokumentiert.
  - GameTheory Vertical Slice ist live: Python-Endpoint `POST /api/v1/game-theory/impact`, Go-Endpoint `GET /api/v1/geopolitical/game-theory/impact`, Next-Bridge `GET /api/geopolitical/game-theory/impact` und neues Sidebar-Panel im Geopolitical-Workspace.
  - ffetch-Entscheidung ist finalisiert: vorerst kein produktiver Einbau; bestehende Provider-HTTP-Schicht bleibt aktiv, Re-Evaluierung nur bei messbarem Hardening-Bedarf.
  - Offener Validierungspunkt: ein echter Live-E2E-Lauf mit parallel gestarteten Go- und Python-Services (inkl. `GET /api/v1/geopolitical/game-theory/impact` und `GET /api/geopolitical/game-theory/impact`) wurde in diesem Run noch nicht als durchgehender Runtime-Check dokumentiert und bleibt als manueller Smoke-Step ausstehend.

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

> **Architektur-Prinzip:** GCT = Motor (Order, Backtest, Portfolio). Gateway = stabiler HTTP-Contract + Validation + zusaetzliche Adapter (Finnhub, FRED, Geo, News). Spaetere Forex/US-Stock-Erweiterung baut auf denselben GCT-Primitiven auf -- kein Rebuild.

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

> **Strategischer Vermerk (14.02.2026):** GCT ist der **Motor** fuer saemtliche Order-Execution- und Backtesting-Logik.
> Wenn spaeter Forex- und US-Stock-Trading hinzukommt, liefert GCT die bestehende Infrastruktur
> (Order Placement, Cancel, Modify, Backtest-Tasks, Portfolio-Tracking, Rate-Limiting pro Exchange).
> Eigene Go-Adapter im Fork ergaenzen lediglich die **Datenquellen** (Finnhub, Polygon, Twelve Data, etc.) --
> die **Ausfuehrungs- und Backtest-Engine bleibt zentral in GCT**, nicht im Gateway und nicht in Python.
> Das Gateway (go-backend) stellt nur den stabilen, produktspezifischen HTTP-Contract davor.
> **Kein Rebuild von Order/Backtest/Portfolio ausserhalb GCT** -- nur stabile Contracts + Validation drumherum.

### 8.3 Python: Wann und wofuer

Python hat **zwei Rollen** im System:

**Rolle 1: AI/ML Soft-Signal Adapter (Verarbeitung, KEIN Fetching)**

> **Wichtig:** Python holt KEINE Daten selbst. Alle Rohdaten (News, OHLCV, Macro) kommen von der Go-Schicht. Python empfaengt und verarbeitet sie.

1. **AI/ML Soft-Signal Adapter** (FinBERT, HDBSCAN, Sentence-Transformers) -- empfaengt News-Rohdaten von Go
2. **LLM-Integration** (Ollama fuer lokale Modelle, OpenAI API fuer Cloud)
3. **News Clustering** (HDBSCAN, UMAP -- empfaengt vorab von Go geholte Artikel)
4. **Sentiment Analysis** (FinBERT, FinGPT -- verarbeitet Go-News-Feed)

**Datenfluss-Beispiel: Game-Theory Impact (Go orchestriert, Python scored)**

```
ACLED (extern)                 Python Soft-Signals
  |                                    ^
  v                                    |
Go eventsClient.FetchEvents()   Go scorer.ScoreImpact()
  |                                    ^
  v                                    |
GameTheoryService.AnalyzeImpact() ─────┘
  |
  v
  Go-Handler -> JSON -> Frontend
```

> Der `gametheory`-Connector ist ein **HTTP-Client** (kein eigener Datenfetcher).
> Die **Quellen** (ACLED-Konfliktereignisse) werden vom Go `eventsClient` geholt.
> Python empfaengt die Events und liefert Impact-Scores (risk_on/risk_off/neutral,
> impactScore, confidence, affected symbols) zurueck. Go orchestriert beides.

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
>
> **Rust-Beschleunigung:** Siehe [`docs/RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) fuer die strategische Analyse wo Rust den Indicator Service (PyO3 Core, Phase 1), die Frontend-Indikatoren (WASM, Phase 2) und die Backtesting Engine (Phase 3) beschleunigt. Rust ist additiv -- Python bleibt Orchestrator und ML-Runtime, Go bleibt Data Layer, TS bleibt Frontend. `INDICATOR_ARCHITECTURE.md` Sektion 0.8 beschreibt die konkrete PyO3-Integration.

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
| 1 | **Indikator-Konsolidierung**: `chart/indicators/` loeschen, alles aus `lib/indicators/` nutzen | **ERLEDIGT** | Altes `src/chart/indicators/*` entfernt; `src/lib/indicators` ist alleinige Quelle |
| 2 | **chartData.ts Legacy entfernen**: SMA/EMA/RSI nach `lib/indicators/` migrieren | **ERLEDIGT** | `src/lib/chartData.ts` enthaelt nur noch Demo-/Format-Helfer, keine Indicator-Duplikate |
| 3 | **IndicatorPanel erweitern**: Ichimoku, ADX, Parabolic SAR, Keltner, etc. aus `lib/indicators/` hinzufuegen | **ERLEDIGT** | Panel + Actions + Series-Wiring fuer Ichimoku/ADX/SAR/Keltner/HMA/ATR-Channel aktiv |
| 4 | **Volume Profile Visualisierung**: `calculateVolumeProfile()` an Chart-Overlay anbinden | **ERLEDIGT** | Volume-Profile-Linien werden aus `calculateVolumeProfile()` im Chart gerendert |
| 5 | **Support/Resistance Overlay**: `findSupportResistance()` als horizontale Linien rendern | **ERLEDIGT** | Support/Resistance-Linien inkl. Strength/Farbkodierung aktiv |

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
| 7f | Zweiter Nicht-Crypto Adapter Slice (Finnhub Equity Quote, REST) | **ERLEDIGT (15.02.2026)** | `GET /api/v1/quote?symbol=AAPL&exchange=finnhub&assetType=equity` liefert `200` mit Quelle `finnhub` |
| 7g | Dritter Nicht-Crypto Adapter Slice (FRED Macro Quote, REST) | **ERLEDIGT (15.02.2026)** | `GET /api/v1/quote?symbol=CPIAUCSL&exchange=fred&assetType=macro` liefert `200` mit Quelle `fred` |
| 7h | News Vertical Slice (RSS + GDELT + Finviz Aggregation) | **ERLEDIGT (15.02.2026)** | `GET /api/v1/news/headlines?symbol=AAPL&limit=3` liefert aggregierte Headlines mit stabilem Contract |
| 7i | Geopolitical Events Slice (ACLED Connector + Gateway Contract) | **ERLEDIGT (15.02.2026)** | `GET /api/v1/geopolitical/events?country=Ukraine&eventType=Battles&from=2026-01-01&to=2026-01-31&limit=25` liefert stabilen ACLED-Contract |
| 7j | Geopolitical Bridge Slice (Next.js -> Go ACLED + Paging/Cache) | **ERLEDIGT (15.02.2026)** | `GET /api/geopolitical/events?source=acled&page=1&pageSize=50&country=...` liefert gemappten `GeoEvent`-Contract inkl. Meta |
| 8 | Portfolio Tracking UI bauen | **ERLEDIGT** | P&L, Drawdown, Positionen |

### Mittelfristig (3-6 Wochen, Go-Adapter + Python Microservice)

**Go-Schicht: Stock/Forex/Macro/News Adapter**

| # | Aktion | Aufwand | Wirkung |
|---|--------|---------|---------|
| 9 | Stock/Forex Go-Adapter Planung (API-Mapping, Rate Limits) | **ERLEDIGT (15.02.2026, baseline)** | Routing/Validation/Rate-Layer fuer Finnhub+ECB stabil, Erweiterungspfade dokumentiert |
| 10 | Erster Go-Adapter: Finnhub REST + WS (Stocks) | **ERLEDIGT (15.02.2026)** | REST-Quote + WS-SSE-Slice live (`/api/v1/quote` + `/api/v1/stream/market` fuer `exchange=finnhub`) |
| 11 | News-Fetching Go-Adapter: RSS + GDELT + Finviz | **ERLEDIGT (15.02.2026)** | Aggregations-Endpoint + Hardening (Retries/Quotas/Normalization) im Gateway live |
| 12 | Macro Data Go-Adapter: FRED + ECB | **ERLEDIGT (15.02.2026, baseline+)** | `fed/fred/boj/snb/ecb` im Macro-Contract + optionaler Scheduled-Ingest (Snapshot-ETL) live |
| 12a | GCT-Backtester Capability Slice im Gateway | **ERLEDIGT (15.02.2026)** | `GET /api/v1/backtest/capabilities` zeigt vorhandene Fork-Strategiebeispiele und dokumentiert wiederverwendbare Engine-Flaechen |
| 12b | ACLED Geopolitical Adapter (Go) | **ERLEDIGT (15.02.2026, baseline)** | echter ACLED-Connector + Service + Handler (`/api/v1/geopolitical/events`) mit Tests und stabilem Contract |
| 12c | ACLED-Filterausbau (region + subEventType) | **ERLEDIGT (15.02.2026)** | Go-Connector/Handler unterstuetzen beide Filter serverseitig inkl. Testabdeckung |

**Python Rolle 1: AI/ML Soft-Signal Adapter (empfaengt Daten von Go)**

| # | Aktion | Aufwand | Wirkung |
|---|--------|---------|---------|
| 13 | FastAPI Microservice aufsetzen (Basis fuer BEIDE Rollen) | **ERLEDIGT (15.02.2026)** | `geopolitical-soft-signals` + `indicator-service` laufen lokal reproduzierbar inkl. Smoke-Runner |
| 14 | news_cluster Adapter implementieren (HDBSCAN + Embeddings) | **TEILWEISE ERLEDIGT (15.02.2026)** | TF-IDF + MiniBatchKMeans plus Recency/Source-Weighting aktiv; Embedding-Modelle bleiben optional |
| 15 | social_surge Adapter implementieren (FinBERT) | **TEILWEISE ERLEDIGT (15.02.2026)** | Heuristik + Source/Recency + optionaler FinBERT-HF-Boost aktiv (Token-basiert), Fine-Tuning offen |

**Python Rolle 2: Indicator Service (Buch "Mastering Financial Markets")**

| # | Aktion | Aufwand | Buch-Referenz |
|---|--------|---------|--------------|
| 16 | `swing_detect()` + Fibonacci Retracements implementieren | **ERLEDIGT (15.02.2026, baseline)** | Ch.5 L3255-3481 |
| 17 | Composite Signal (Dreier-Signal: 50-Day + Heartbeat + Volume) | **ERLEDIGT (15.02.2026, baseline)** | INDICATOR_ARCHITECTURE.md Sektion 3 |
| 18 | Pattern Recognition: Candlestick + Harmonic + Timing + Price | **ERLEDIGT (15.02.2026, baseline)** | Ch.7-10 (L3851-5242) |
| 19 | Elliott Wave Detection (eigene Python-Implementierung) | **ERLEDIGT (15.02.2026, baseline)** | INDICATOR_ARCHITECTURE.md Sektion 4 |
| 20 | K's Collection (6 Indikatoren) + Exotische MAs (KAMA, ALMA, IWMA) | **ERLEDIGT (15.02.2026, baseline)** | Ch.11 L5260-5682, Ch.3 L1675-1965 |
| 21 | Performance Evaluation + Backtesting Framework | **TEILWEISE ERLEDIGT (15.02.2026)** | Ch.12 L5694-6067 |
| 22 | Backtesting mit GoCryptoTrader integrieren | **TEILWEISE ERLEDIGT (15.02.2026)** | Strategy-Validierung |

Status-Detail zu 21/22:
- `POST /api/v1/evaluate/strategy` liefert produktive Kernmetriken (Net Return, Hit Ratio, RRR, Expectancy, Profit Factor, Sharpe, Sortino).
- Backtest-Orchestrierung ist als Gateway-Slice live (`POST/GET /api/v1/backtest/runs`, `GET /api/v1/backtest/runs/{id}`, `POST /api/v1/backtest/runs/{id}/cancel`, `GET /api/v1/backtest/runs/{id}/stream`) mit Progress/Result-Store.
- Echter GCT-Executor-Pfad ist als optionaler Runtime-Modus umgesetzt (Env-gesteuert, Task-Lifecycle gegen Backtester gRPC).
- Ergebnisextraktion ist als baseline live (Sharpe/Drawdown/Orders/Strategy-Movement via Report-Parsing); offen bleibt der Vollausbau auf vollstaendige Artefakt-/Metrikabdeckung aus GCT.

### E2E- und Go-Qualitaets-Check -- **ERLEDIGT (16.02.2026)**

**Frontend (Next.js 16.1.6 / Turbopack):**
- `bun run lint` (Biome): 224 Dateien, 0 Fehler
- `bun run build`: Compiled + TypeScript OK, 34 Seiten generiert, exit 0

**Python (FastAPI / uv):**
- Alle 3 Services importieren fehlerfrei: soft-signals, indicator-service, finance-bridge
- Health-Checks `GET /health` auf Port 8200 + 8300: jeweils `200 {"ok":true}`
- `POST /api/v1/game-theory/impact`: 200 -- Game-Theory Heuristik liefert Ergebnis
- `POST /api/v1/indicators/exotic-ma`: 200 -- KAMA-Berechnung korrekt

**Go (Gateway auf Port 9060):**
- `go vet ./cmd/... ./internal/...`: sauber
- `go test ./cmd/... ./internal/...`: 15 Packages, alle pass
- `go test -race ./cmd/... ./internal/...`: keine Data Races
- `golangci-lint run` (v2.9): **0 Issues** (errcheck/govet/ineffassign/staticcheck/unused)
  - 5x `defer resp.Body.Close()` errcheck gefixt
  - 1x ineffassign in ECB-Client gefixt (toter `limit = 1`)
  - SA1019 (grpc.DialContext deprecated) + ST1000/ST1003 (Style) bewusst suppressed
- `GET /health`: 200 (GCT `connected:false` erwartet ohne laufenden GCT)
- `GET /api/v1/quote?symbol=EUR/USD&exchange=ecb&assetType=forex`: **200 -- EUR/USD live ECB-Kurs**

**E2E-Stack-Fazit:** Alle 3 Schichten starten, Health-Checks pass, kritische Datenpfade (Forex-Quote via ECB, Game-Theory, Indicator KAMA) liefern korrekte Ergebnisse. GCT-abhaengige Pfade (Crypto, Finnhub via GCT) erfordern laufenden GCT-Prozess.

- **Go-Backend bei Erweiterung:** Pflicht-Gates: `go test ./...`, `go vet ./...`, `go test -race ./...`, `golangci-lint run` (Config: `.golangci.yml`). Orientierung an golang-expert (Graceful Shutdown, `context.Context`, `errgroup` bei Fan-Out).

### 8.5 Geopolitical Data Gaps & Persistence (Audit 16.02.2026)

- **Daten-Density (ACLED/GDELT):** Die Bruecke steht, aber die Datenmenge ist aktuell gering. 
  - *Ursache A:* ACLED erfordert zwingend validierte Credentials im `.env` (`ACLED_EMAIL`, `ACLED_ACCESS_KEY`). Ohne diese liefert der Go-Gateway `502` oder leere Resultate.
  - *Ursache B:* GDELT-Queries muessen fuer den Go-Connector hochpraezise sein, sonst liefert die Public-API Timeouts.
- **LLM-Summary-Gap:** Das Feld `summary` in den Events ist vorbereitet fuer LLM-Enrichment via Python (Rolle 1). Derzeit wird nur Roh-Content angezeigt. Die "Intelligenz" (Zusammenfassung von N News zu 1 Event) ist die naechste Ausbaustufe.
- **Backend-Stabilitaet (Zombie-Processes):** Der Go-Gateway (Port 9060) beendet sich bei harten Abbruechen des Dev-Stacks unter Windows manchmal nicht sauber. Manuelle Bereinigung via `netstat -ano | findstr :9060` -> `taskkill` ist gelegentlich noetig.
- **Persistence-Luecke:** Viele Geopolitical-Features (wie Zeichnungen auf der Map oder manuelle Marker-Korrekturen) laufen noch ueber `localStorage` statt Prisma/SQLite. Migration in die `dev.db` ist fuer Phase 3 priorisiert.


### 10.1 Reference-Intake Plan (Frontend + Backend, 15.02.2026)

| # | Aktion | Ziel | Status |
|---|--------|------|--------|
| 22a | CCXT-Fallback-Slice in TypeScript hinter Feature-Flag pruefen (`exchange`-Subset) | Crypto-Exchange-Reichweite als Uebergang; Stocks/Forex bleiben auf Finnhub/TwelveData/Polygon/AlphaVantage/FRED/ECB-Spur | **ERLEDIGT (15.02.2026, baseline)** |
| 22b | BacktestJS Strategy-Lab im Frontend (Parameter-Panel + Ergebnis-Widgets) | Schnelles UX-Refinement fuer Strategie-Workflows | **ERLEDIGT (15.02.2026, baseline)** |
| 22c | PineTS Indicator-Playground als optionales Modul evaluieren | Pine-kompatible Indicator-Logik fuer Frontend-Prototyping | **GEPLANT (Lizenz-Gate AGPL-3.0)** |
| 22d | Foursight/NeonDash UI-Pattern-Adoption (Order-Ticket, PnL, Watchlist) | Paper-Trading-Frontend gezielt verbessern | **ERLEDIGT (15.02.2026, baseline)** |
| 22e | Chronicle/Scout/FinGPT als Python-Adapter-POCs strukturieren | `news_cluster`, `social_surge`, `narrative_shift` qualitativ ausbauen | **TEILWEISE ERLEDIGT (15.02.2026, baseline)** |
| 22f | LWC/GeoPulse/GeoInsight Review und Intake-Entscheidung | Chart-Plugins und Geo-Referenzen trennscharf einordnen (nehmen vs. nicht nehmen) | **ERLEDIGT (15.02.2026, Review-Entscheidungen dokumentiert)** |
| 22g | GameTheory/CCXT/ffetch Review und Intake-Entscheidung | Geo-Impact-, Crypto-Fallback- und HTTP-Infra-Referenzen sauber einordnen | **ERLEDIGT (15.02.2026, Review-Entscheidungen dokumentiert)** |
| 22l | GameTheory Vertical Slice (Python + Go + Frontend) | Erklaerbaren Impact-Contract von ACLED-Filtern bis UI-Panel produktiv verfuegbar machen | **ERLEDIGT (15.02.2026, baseline)** |
| 22h | GeoPulse-Slice (Backend-Graph + Frontend-Insights) | Event-Relationen als Graph-View fuer schnelle Kontextanalyse sichtbar machen | **ERLEDIGT (15.02.2026, baseline)** |
| 22i | ACLED Conflict Index/Monitors Intake-Gate | Gratis-first sauber halten: Event-API aktiv, Index/Monitor nur bei expliziter Lizenz-/Tier-Freigabe + Credentials | **GEPLANT (Policy fixiert, 15.02.2026)** |
| 22j | CFR Conflict-Tracker Context Layer | Konfliktkarten mit eigener Kurzbeschreibung + CFR-Link anreichern, ohne CFR-Textuebernahme | **ERLEDIGT (15.02.2026, baseline)** |
| 22k | CrisisWatch RSS Adapter Slice (Go + UI) | Offiziellen RSS-Feed pollen, normalisieren und im Frontend als Source-Timeline rendern | **ERLEDIGT (15.02.2026, baseline)** |
| 22m | Finnhub-WS Referenz-Hardening im Gateway-Stream | Reconnect-/Fallback-Status explizit machen (`live`/`polling_fallback`/`reconnecting`) | **ERLEDIGT (15.02.2026, baseline+)** |
| 22n | Crypton Batch-Streaming Pattern fuer Multi-Symbol Watchlist | Quote-Batches ueber SSE + UI-Merge statt reinem Polling | **ERLEDIGT (15.02.2026, baseline+)** |
| 22o | FinBERT Runtime-Hardening fuer Soft-Signal-Pipeline | HF-Timeout/Cache/TTL stabilisieren und Narrative/Social-Signale anreichern | **ERLEDIGT (15.02.2026, baseline+)** |

Status-Detail zu 22a:
- Optionaler CCXT-Provider ist live als TS-Fallback (`src/lib/providers/ccxt.ts`), nur aktiv bei `ENABLE_CCXT_FALLBACK=true`.
- Konfigurierbar via `.env`: `CCXT_DEFAULT_EXCHANGE`, `CCXT_API_KEY`, `CCXT_SECRET`, `CCXT_PASSWORD`.
- Provider-Registry/Priority ist erweitert (`src/lib/providers/types.ts`, `src/lib/providers/index.ts`), Stocks/Forex/Macro bleiben auf der bestehenden Nicht-CCXT-Spur.
- Build-Pfad ist verifiziert (zusaetzlich benoetigt: `protobufjs` als CCXT-Subdependency im Next.js-Bundle).

Status-Detail zu 22b:
- Strategy-Lab Baseline ist im Frontend live (`src/features/trading/StrategyLabPanel.tsx`) mit Parametersteuerung (Mode, Lookback, Hold, Fees, Risk-Free-Rate).
- Das Panel ruft produktiv `POST /api/fusion/strategy/evaluate` auf und rendert stabile KPI-Widgets (`Net Return`, `Hit Ratio`, `R:R`, `Expectancy`, `Profit Factor`, `Sharpe`, `Sortino`).
- Integration ist in der Workspace aktiv (`src/features/trading/TradingWorkspace.tsx`) und laeuft ohne neuen Backend-Sonderpfad.

Status-Detail zu 22d:
- Watchlist UX verfeinert (`src/components/fusion/WatchlistPanel.tsx`): Live-Filter, Sort-Modi (`default`/`movers`/`favorites`) und Quick-Mover-Header.
- Order-Ticket UX verfeinert (`src/features/trading/OrdersPanel.tsx`): Quick-Size Buttons und explizite `R:R` Anzeige.
- Portfolio UX verfeinert (`src/features/trading/PortfolioPanel.tsx`): Return-% KPI plus Top-Winner/Top-Loser-Snapshot.

Status-Detail zu 22e:
- Python Soft-Signal-Pipeline hat nun explizite Referenz-POC-Flags:
  - `SOFT_SIGNAL_CHRONICLE_POC_ENABLED`
  - `SOFT_SIGNAL_SCOUT_POC_ENABLED`
  - `SOFT_SIGNAL_FINGPT_POC_ENABLED`
- Chronicle-POC: dedupe-first Cluster-Verarbeitung + `chronicle:*` Provider-Tags.
- Scout-POC: Source-Momentum-gewichtete Social-Surge-Bewertung + `scout:*` Tags.
- FinGPT-POC: Narrative-Shift-Boost via Sentiment-Drift-Heuristik + `fingpt:*` Tags.
- Dokumentiert in `.env.example` und `python-backend/services/geopolitical-soft-signals/README.md`.

Status-Detail zu 22f:
- LWC: Plugin-Examples als konkrete Quellen fuer Primitive-basierte Zeichentools/Alerts bestaetigt (`rectangle-drawing-tool`, `trend-line`, `user-price-alerts`, `volume-profile`).
- GeoPulse: interessante Graph-/Filter-Patterns und NLP-Pipeline bestaetigt, aber kein direkter Import wegen hardcoded Secrets, Oel-Domain-Coupling und Qualitaetsrisiken.
- GeoInsight: ACLED-Filter- und Cache-Muster bestaetigt; baseline-Umsetzung ist im Go-Gateway live (`GET /api/v1/geopolitical/events`), aber kein Leaflet/jQuery-Uebernahmepfad (Map-Stack bleibt `d3-geo` gemaess Projektregeln).
- GDELT als zweiter Event-Fallback ist live: neuer Go `gdelt`-Connector liefert Headlines als Ereignisse, Gateway `source=gdelt` Parameter plus Next.js-Bridge `fetchExternalEventsViaGateway` und Geo-Map Filter (Country/Region/EventType/SubEventType) machen das zweite Event-Pattern vollständig.

Status-Detail zu 22g:
- GameTheory: FastAPI-Job-/Backtest-Orchestrierung und Dashboard-Patterns bestaetigt; Modelllogik bleibt forschungsnah und wird nicht ungeprueft als Trading-Signal uebernommen.
- CCXT: optionaler Crypto-Fallback bleibt valide; Multi-Asset-Kernpfad bleibt im Go-/Gateway-Layer.
- ffetch: als TS-HTTP-Hardening-Baustein bestaetigt, aber derzeit bewusst nicht integriert; bestehende Provider-Clients bleiben der produktive Standard bis ein klarer Mehrwert belegt ist.

Status-Detail zu 22l:
- Python-Service erweitert: `POST /api/v1/game-theory/impact` liefert stabilen Impact-Contract (`summary + items`) aus explainable Heuristics.
- Go-Gateway erweitert: `GET /api/v1/geopolitical/game-theory/impact` mappt ACLED-Filter (`country/region/eventType/subEventType/from/to/limit`) auf Python-Scoring.
- Next.js-Bridge + UI erweitert: `GET /api/geopolitical/game-theory/impact` inkl. Cache-Option; `GeopoliticalMapShell` rendert ein dediziertes GameTheory-Impact-Panel fuer ACLED-Analysen.

Status-Detail zu 22h:
- Neuer Backend-Graph-Endpoint ist live: `GET /api/geopolitical/graph` (liefert Knoten/Kanten + Top-Regionen + Top-Sub-Events).
- Geopolitical Shell hat Source-Modus (`local` vs `acled`) mit ACLED-Filtern, Filter-Chips, Paging und read-only Guard fuer externe Events.
- GeoPulse-Insights-Panel rendert Graph-Kennzahlen/Top-Relationen im rechten Sidebar-Stack.

Status-Detail zu 22i-22k:
- ACLED bleibt produktiv auf Event-API-Contract (`/api/v1/geopolitical/events`) fokussiert; fuer Conflict Index/Monitors ist ohne passende ACLED-Tier-/Lizenzfreigabe kein produktiver Intake vorgesehen.
- CFR-Layer ist als baseline umgesetzt: Go liefert `source=cfr` im Context-Contract, Frontend rendert Link-first Karten (Kurzsummary + "Open original"), keine Textspiegelung.
- CrisisWatch-Layer ist als baseline umgesetzt: Go-RSS-Connector (`source=crisiswatch`) liefert `id/title/url/publishedAt/region`; Frontend rendert denselben Contract im Context-Panel.
- Schichten-Schnitt ist produktiv: Go uebernimmt Fetch/Cache/Normalisierung (`/api/v1/geopolitical/context`), Next.js bridged (`/api/geopolitical/context`), Frontend zeigt Source-Badges und externe Links; Python bleibt optional fuer spaeteres Enrichment/Scoring.

Status-Detail zu 22m-22o:
- Finnhub-Referenz ist im Go-Gateway gehaertet: `go-backend/internal/handlers/sse/market_stream.go` emittiert jetzt `stream_status`-Events (`live`, `polling_fallback`, `reconnecting`) inkl. Reconnect-Counter und automatischem Reconnect-Loop aus dem Polling-Fallback.
- Crypton-Pattern ist als Multi-Symbol-Slice live: `GET /api/market/stream/quotes` liefert deduplizierte `quote_batch`-Events; `src/components/fusion/WatchlistPanel.tsx` nutzt EventSource + Fallback-Polling und zeigt Stream-Health (`state`, `last update`, `reconnects`) direkt im UI.
- Trading-Hauptstream wurde synchron gehaertet: `src/app/api/market/stream/route.ts`, `src/app/page.tsx` und `src/features/trading/BottomStats.tsx` zeigen Stream-Zustand/Last-Tick/Reconnects fuer bessere Runtime-Transparenz.
- FinBERT-Hardening ist produktiv im Python-Service: `python-backend/ml_ai/geopolitical_soft_signals/pipeline.py` nutzt HF-Timeout-Config + In-Memory-Cache (TTL/Max-Entries) und optionalen FinBERT-Drift-Einfluss fuer `narrative_shift`/`social_surge`; Konfig ist in `.env.example` und `python-backend/services/geopolitical-soft-signals/README.md` dokumentiert.
- Qualitaets-Gates fuer diesen Slice sind gelaufen: `go test ./...`, `go vet ./...`, `go test -race ./...` (mit UCRT64 `gcc` im Prozess-`PATH`), `bun run lint`, `bun run build`, `python python-backend/scripts/smoke-soft-signals.py`.

> **Detaillierter Plan mit 34 Todos, Phasen A-E, und allen Buch-Zeilennummern:** Siehe [`docs/INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sektion 8.

---

## Anhang A: Datei-Referenz

| Datei | Zeilen | Status | Empfehlung |
|-------|--------|--------|-----------|
| `src/lib/indicators/index.ts` | 824 | AKTIV | BEHALTEN - primaere Quelle |
| `src/chart/indicators/advanced.ts` | 616 | TOT | LOESCHEN - Code nach lib/indicators/ migrieren |
| `src/chart/indicators/index.ts` | 1033 | TOT | LOESCHEN - Registry-Konzept uebernehmen, Rest weg |
| `src/lib/chartData.ts` | Generator-Utilities | AKTIV | BEHALTEN - Demo-/Fixture-Utilities, keine Indikator-Duplikate mehr |
| `src/chart/engine/ChartEngine.ts` | 580 | TEILAKTIV | BEHALTEN - Custom Engine hat Wert |
| `src/chart/engine/Layers.ts` | 810+ | TEILAKTIV | BEHALTEN - IndicatorLayer anschliessen |
| `src/lib/providers/index.ts` | 456 | AKTIV | UEBERGANG - langfristig durch Go-Adapter ersetzen |
| `src/lib/geopolitical/adapters/soft-signals.ts` | 280+ | AKTIV | BEHALTEN - Python-Service-Integration inkl. Budget/Timeout/Contract-Mapping |
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
```

**Loesung:** Einen einheitlichen `OHLCV`-Typ festlegen. Alle Indikatoren verwenden `OHLCV -> IndicatorData[]`. `src/lib/chartData.ts` bleibt als Demo-/Fixture-Generator ohne eigene Indikator-Typen.

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

**Phase 3b -- Rust Indicator Core (Beschleunigung):**
Rust beschleunigt den Python Indicator Service und die Frontend-Indikatoren. Kein Rewrite -- additives Skalpell fuer CPU-intensive Bereiche.

- **Strategie-Dokument:** [`docs/RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) -- Entscheidungsmatrix (was einbauen / was nicht), Kand/VectorTA-Evaluation, PyO3-Integration, WASM-Benchmarks, Phasen-Roadmap
- **PyO3 Indicator Core (Phase 1):** Schwere Pattern-Detection (Elliott, Harmonic, Fibonacci, Candlestick) via Rust beschleunigen; 10-50x Speedup erwartet
- **WASM Frontend-Indikatoren (Phase 2):** Gleicher `rust-core/` als WASM im Browser fuer leichte Indikatoren bei langen Historien (3-8x schneller)
- **Backtesting Engine (Phase 3):** Deterministischer Rust-Backtester als Ergaenzung zu GCT; nutzt Indicator Core direkt ohne Netzwerk-Roundtrip
- **Zusammenspiel:** INDICATOR_ARCHITECTURE.md Sektion 0.8 beschreibt wie `rust-core/PyO3` in den Python Indicator Service integriert wird

**Phase 3 -- Python Microservice (AI/ML):**
Roadmap Sektion 10 "Mittelfristig" (Punkte 9-12). FastAPI aufsetzen, Soft-Signal Adapter implementieren. Braucht die leeren Adapter in `src/lib/geopolitical/adapters/soft-signals.ts`.

**Phase 3c -- Go Data Router (Adaptive Multi-Source Routing):**
Statische Provider-Prioritaet im TS-`ProviderManager` durch intelligentes Asset-Class-Routing im Go-Layer ersetzen. ~500 LoC, 2-3 Tage Aufwand.

- **Architektur-Blueprint:** [`docs/go-research-financial-data-aggregation-2025-2026.md`](./go-research-financial-data-aggregation-2025-2026.md) -- Paketstruktur, Config-Format, Datenfluss, Aufwandschaetzung
- **Kern:** Asset-Class-Routing (YAML-Config) + Bifrost-Pattern (adaptive Gewichtung) + `failsafe-go` (Circuit Breaker, Retry, Fallback-Chain)
- **Voraussetzung:** Go-Adapter aus Phase 2 muessen stehen (mindestens Finnhub, Polygon, Alpha Vantage)

### Weitergehende Referenzen in `docs/REFERENCE_PROJECTS.md`

Das Audit beschreibt **was zu tun ist**. `REFERENCE_PROJECTS.md` und `RUST_LANGUAGE_IMPLEMENTATION.md` beschreiben **welche externen Projekte, Libraries und Technologien dabei helfen**. Relevante Sektionen:

| Wenn du an ... arbeitest | Dann lies ... |
|--------------------------|---------------|
| GoCryptoTrader Fork + Go-Adapter | REFERENCE_PROJECTS.md **Sektion 4.5** -- Vollstaendige Projekt-Beschreibung, Features, Unified Data Layer |
| Stock/Forex/Macro Go-Adapter | REFERENCE_PROJECTS.md **Sektion 4.5** -- Go-Adapter Architektur, Sektion 4 fuer TS-Uebergangs-Provider |
| Chart-Indikatoren / LWC Plugins | REFERENCE_PROJECTS.md **Sektion 2** -- LWC Plugin-System, EquiCharts als Referenz |
| Backtesting (nach GCT Setup) | REFERENCE_PROJECTS.md **Sektion 6** -- PineTS, BacktestJS als TS-native Ergaenzung zu GCT |
| Soft-Signal Adapter (Python) | REFERENCE_PROJECTS.md **Sektion 8** -- Chronicle, Scout, FinBERT, FinGPT, GDELT mit Adapter-Mapping |
| Geopolitical Map Erweiterung | REFERENCE_PROJECTS.md **Sektion 3** -- GeoPulse, GameTheory |
| WebSocket (Crypto + Stocks/Forex) | REFERENCE_PROJECTS.md **Sektion 7** -- Referenz-Patterns (Umsetzung in Go-Goroutines, nicht TS) |
| Paper Trading UI | REFERENCE_PROJECTS.md **Sektion 5** -- Foursight, NeonDash als UI-Referenzen |
| Rust Indicator Core / PyO3 / WASM | [RUST_LANGUAGE_IMPLEMENTATION.md](./RUST_LANGUAGE_IMPLEMENTATION.md) -- Entscheidungsmatrix, Kand/VectorTA, Phasen-Roadmap; [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) **Sektion 0.8** fuer PyO3-Integration |
| Commodity/Forex/Aktien-Datenquellen | REFERENCE_PROJECTS.md **Datenquellen-Erweiterung** -- Neue APIs, Go-Adapter-Prioritaet, Coverage-Matrix |
| Go Data Router (Multi-Source Routing) | [go-research-financial-data-aggregation-2025-2026.md](./go-research-financial-data-aggregation-2025-2026.md) -- Adaptive Asset-Class-Routing, Bifrost-Gewichtung, failsafe-go, Paketstruktur |
| **Portfolio Analytics (Korrelation, Rolling Metriken, HRP, Regime-Sizing)** | **[INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) Sektion 5.P + Todos #51-57** -- Analytics Endpoints und Todos |
| **Portfolio Gesamt-Architektur (GCT Bridge, Multi-Asset, Network, Frontend Charts)** | **[Portfolio-architecture.md](./Portfolio-architecture.md)** -- Vollstaendiger Deep Dive: Ist-Zustand aller 3 Schichten, GCT `asset.Item` Erweiterung, Broker-Adapter (Alpaca/IBKR), Chart-Libraries (lightweight-charts + nivo + recharts), Network Layer, 5-Phasen-Roadmap mit ~31 Aufgaben (P-1 bis P-31), Buch-Referenzen (PfF, QT, AFML, DL-Rust) |
| Reine Quant-Konzepte (ML-Pipeline, Pairs Trading, Derivatives, Factor Models) | [Future-Quant-trading.md](./Future-Quant-trading.md) -- Referenz fuer spaetere Erweiterung Richtung systematischer Handel. Nicht geplant, nur dokumentiert |

> **Wichtig:** `REFERENCE_PROJECTS.md` ist Recherche-Kontext, kein Aktionsplan. `RUST_LANGUAGE_IMPLEMENTATION.md` ist Strategie-Kontext mit eigener Phasen-Roadmap. `go-research-financial-data-aggregation-2025-2026.md` ist der Architektur-Blueprint fuer den adaptiven Data Router im Go-Layer. `Future-Quant-trading.md` ist reine Zukunfts-Referenz ohne aktive Todos. `INDICATOR_ARCHITECTURE.md` Sektion 5.P enthaelt die Analytics-Endpoints + Todos #51-57. `Portfolio-architecture.md` ist der vollstaendige Portfolio Deep Dive mit GCT-Bridge, Multi-Asset-Erweiterung, Network Layer, Frontend-Charts und eigener Roadmap (P-1 bis P-31). Die konkreten Aufgaben stehen hier im Audit sowie in den jeweiligen Architektur-Dokumenten. Die Referenzen helfen wenn du verstehen willst *warum* eine bestimmte Library empfohlen wird oder *wie* ein externes Projekt aufgebaut ist.

