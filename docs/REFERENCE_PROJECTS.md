# Reference-Projekte: Open-Source Inspiration fuer Tradeview Fusion

> **Vollständige Version (alle Sektionen 1–9, Detailbeschreibungen, Review-Vermerk):**  
> [`docs/archive/REFERENCE_PROJECTS_full.md`](./archive/REFERENCE_PROJECTS_full.md)
>
> **Status-Hinweis (23. Feb 2026, Codex — wichtig fuer Reihenfolge):**  
> Die priorisierte **Bestands-Connector-Queue im Go-Gateway** wurde vor der Reference-Expansion bereits weitgehend auf die gemeinsame `internal/connectors/base.Client`-Basis migriert (`acled`, `finnhub`, `fred`, `ecb`, `indicatorservice`, `financebridge`, `softsignals`, `geopoliticalnext`, `gdelt`, `news/*`, `gametheory`, `crisiswatch`).  
> **Naechster Schritt ab jetzt:** `REFERENCE_PROJECTS.md`-Quellen **gruppenweise und contract-first** integrieren (zuerst **G4 Zentralbank-Zeitreihen**, dann **G3 SDMX**), inklusive Router-Metadaten (`group`, `kind`, `capabilities`) und ENV-Examples bei neuen Keys/Tokens.
> **Fortschritt (23. Feb 2026, Codex — G4 gestartet):** Die ersten echten Reference-Provider aus `G4` sind integriert: **BCB SGS (Banco Central do Brasil)**, **Banxico SIE (Mexiko)**, **Bank of Korea ECOS**, **BCRA Principales Variables v4 (Argentinien)**, **TCMB EVDS3 (Tuerkei)** und ein erster **RBI DBIE (Indien)**-Slice (FX Reserves) als Go-Connectoren (`internal/connectors/bcb`, `internal/connectors/banxico`, `internal/connectors/bok`, `internal/connectors/bcra`, `internal/connectors/tcmb`, `internal/connectors/rbi`) auf `base.Client`, vertikal verdrahtet in Quote/Macro-History (`exchange=bcb|banxico|bok|bcra|tcmb|rbi`). `BCB` hat `POLICY_RATE -> BCB_SGS_432`, `BoK` hat `POLICY_RATE -> BOK_ECOS_722Y001_M_0101000`, `BCRA` hat derzeit `POLICY_RATE -> BCRA_160`; `Banxico`, `TCMB` und `RBI` nutzen vorerst explizite Serien-IDs/Patterns (`BANXICO_<id>` bzw. `TCMB_EVDS_<series>` bzw. `RBI_DBIE_FXRES_<reserve>_<currency>_<freq>`). Das Prefix-basierte Macro-Routing (`BCB_SGS_*`, `BANXICO_*`, `BOK_ECOS_*`, `BCRA_*`, `TCMB_EVDS_*`, `RBI_DBIE_FXRES_*`) ist damit als Muster fuer weitere G4-Quellen etabliert.

**Zweck:** Schnell-Navigator und Kategorien (Baseline / Sekundär / Offen) fuer den beschleunigten Ausbau von Tradeview Fusion. Welche Projekte nutzen wir aktiv, welche optional, welche noch zu prüefen.

---

## Bedeutung: Baseline / Sekundär / Offen

| Kategorie | Bedeutung | Wo sichtbar |
|-----------|-----------|-------------|
| **Baseline** | Produktiv umgesetzt oder als Referenz fest eingeplant. Code/Patterns sind oder werden uebernommen. | Referenz-Intake 22a-22o. Ehem. `project_audit2.md` (archiviert in `archive/project_audit2.md`). Ehemals: Roadmap „ERLEDIGT“/„TEILWEISE ERLEDIGT“, Referenz-Intake 22a–22o. |
| **Sekundär** | Optional, selektiv oder nur als Fallback. Nicht Kern, aber bei Bedarf genutzt (z. B. UX-Referenz, zweite Engine, Export). | Voll-Dokument: Projekt-Review-Vermerk „Nehmen (gezielt)“ / „selektiv“ / „optional“. |
| **Offen** | Noch zu prüefen, zurueckgestellt oder Lizenz-/Policy-Gate. Keine aktive Uebernahme bis Entscheidung. | Voll-Dokument: „GEPLANT“, „Deferred“, „DERZEIT NICHT EINBAUEN“, „404“. |

---

## Themen-Uebersicht: Beste Ressource pro Bereich

| Bereich | Beste Ressource | Schicht | Voll-Dokument |
|---------|-----------------|---------|----------------|
| **Chart-Plugin** | [LWC](https://github.com/tradingview/lightweight-charts) | TS | Sektion 2 |
| **Custom Chart** | [EquiCharts](https://github.com/alenjohn05/EquiCharts) | TS | Sektion 2 |
| **Indikatoren (Pine)** | [PineTS](https://github.com/QuantForgeOrg/PineTS) | TS | Sektion 6 |
| **Geo Events** | [GDELT](https://www.gdeltproject.org/data.html), [ACLED](https://acleddata.com/acled-api-documentation) | Go/API | Sektion 3, 8 |
| **Crypto Backend** | [GoCryptoTrader](https://github.com/thrasher-corp/gocryptotrader) | Go | Sektion 4.5 |
| **Stock/Forex/Macro/News** | Eigene Go-Adapter (GCT-Fork) | Go | Sektion 4.5 |
| **TS Data Fallback** | [CCXT](https://github.com/ccxt/ccxt) | TS | Sektion 4 |
| **AI/ML Sentiment** | [FinBERT](https://huggingface.co/ProsusAI/finbert), [Chronicle](https://github.com/dukeblue1994-glitch/chronicle), [FinGPT](https://github.com/AI4Finance-Foundation/FinGPT) | Python | Sektion 8 |
| **Indikatoren/Patterns** | [Mastering Financial Markets with Python](./books/mastering-finance-python.md) + [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md) | Python | Sektion 4.6 |
| **Backtesting (TS)** | [BacktestJS](https://github.com/backtestjs/framework) | TS | Sektion 6 |
| **Paper Trading UX** | [Foursight](https://github.com/h0i5/Foursight), [NeonDash](https://github.com/tiraten-bot/Next-TradingSystem) | TS | Sektion 5 |

---

## Drei-Schichten-Architektur

| Schicht | Zustaendig | Referenz-Sektionen (Voll-Dokument) |
|---------|------------|-----------------------------------|
| **Go (Unified Data Layer)** | Crypto, Stock/Forex/Macro/News-Fetching, Order, Backtest, Portfolio | 4.5 |
| **Python (FastAPI)** | Sentiment, News-Verarbeitung, Indicator Service, Pattern Recognition | 8, 4.6 |
| **TypeScript (Next.js)** | Charts, Geo-Map, 23 einfache Indikatoren, API Gateway | 1–7 |

> **Prinzip:** Go ist der einzige Ort fuer Daten-Beschaffung. Python verarbeitet, holt nicht selbst. TS-Provider (`src/lib/providers/`) sind Uebergang bis Go-Adapter sie ersetzen.
>
> **Rust als Querschnitts-Schicht:** Rust ist additiv zu den drei Schichten -- kein Ersatz. Ein gemeinsamer `rust-core/` beschleunigt rechenintensive Logik via PyO3 (Python Indicator Service) und WASM (Frontend-Indikatoren). Details: [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md).

---

## Top-7 Prioritaeten (Kurz)

| # | Thema | Impact | Voll-Dokument |
|---|-------|--------|----------------|
| 1 | **GoCryptoTrader + Go Unified Data Layer** | Sehr hoch | Sektion 4.5, Top-7 §1 |
| 2 | **LWC Plugin-System** | Hoch | Sektion 2, Top-7 §2 |
| 3 | **Chronicle + GDELT (Soft-Signal)** | Sehr hoch | Sektion 8, Top-7 §3 |
| 4 | **GeoPulse + GameTheory (Geo Map)** | Hoch | Sektion 3, Top-7 §4 |
| 5 | **PineTS + BacktestJS (Indikator/Strategy)** | Hoch | Sektion 6, Top-7 §5 |
| 6 | **EquiCharts (Custom Engine)** | Mittel | Sektion 2, Top-7 §6 |
| 7 | **Mastering Financial Markets (Buch)** | Sehr hoch | Sektion 4.6, [INDICATOR_ARCHITECTURE.md](./INDICATOR_ARCHITECTURE.md), Top-7 §7 |

---

## Baseline (produktiv / fest eingeplant)

Diese Referenzen sind umgesetzt oder als naechster Schritt fest eingeplant:

- **Go:** GoCryptoTrader-Fork, Gateway (Health, Quote, SSE, ECB/Finnhub/FRED/Macro/News/ACLED/Backtest-Runs), Quality-Gates (`go test`, `vet`, `race`).
- **Python:** Soft-Signal-Adapter (cluster-headlines, social-surge, narrative-shift), Indicator-Service (composite, patterns, exotic-ma, ks-collection, evaluate/strategy).
- **TS/Frontend:** LWC, BacktestJS Strategy-Lab, Foursight/NeonDash UX (Watchlist, Order-Ticket, Portfolio), StockTraderPro/react-next-tradingview Search/Keyboard-Muster, CCXT-Fallback (Feature-Flag), Geo-Bridges (ACLED, Context, CrisisWatch, GeoPulse-Graph, GameTheory-Impact).
- **Daten/APIs:** ACLED Events, CFR/CrisisWatch Context, Finnhub WS-Slice, Crypton Batch-Stream, News Headlines, Macro History/Ingest.

Details: Referenz-Intake 22a-22o. Ehem. `project_audit2.md` (archiviert in `archive/project_audit2.md`).

---

## Sekundär (optional / selektiv / Fallback)

| Projekt | Nutzung | Voll-Dokument |
|---------|---------|----------------|
| **EquiCharts** | Custom-Engine-Referenz, selektiv | Sektion 2 |
| **gocharts** | Go-Reporting/Export, optional | Sektion 2 |
| **FirChart** | Chart-Idee, optional | Sektion 2 |
| **Backtest-Kit** | TS-Backtesting, sekundaer zu BacktestJS | Sektion 6 |
| **PineTS** | Indikator-Playground, Lizenz-Gate AGPL-3.0 | Sektion 6 |
| **GeoPulse / GeoInsight** | Nur Pattern/Contract, kein direkter Code-Import | Sektion 3 |
| **CCXT** | Crypto-Fallback hinter Feature-Flag | Sektion 4 |
| **StockTraderPro / react-next-tradingview** | Nur noch punktuelle UX-Referenz | Sektion 1 |
| **Chronicle / Scout / FinGPT** | POC-Flags, gezielte Modi | Sektion 8 |
| **GameTheory** | Impact-Contract produktiv, Modelllogik selektiv | Sektion 3 |

---

## Offen (zurueckgestellt / zu prüefen)

| Projekt / Thema | Status | Voll-Dokument |
|------------------|--------|----------------|
| **GoChart, Divergex** | Repo 404, nicht mehr als Quelle | Sektion 1 |
| **ffetch** | Derzeit nicht einbauen, Re-Open bei Hardening-Bedarf | Projekt-Review-Vermerk |
| **ACLED Conflict Index / Monitors** | Deferred (gratis-first), bei Lizenz/Tier-Freigabe | Sektion 3 |
| **PineTS** | Lizenz-Gate AGPL-3.0 vor Einsatz pruefen | Sektion 6, Audit 22c |

---

## Neu gefunden (bewertet 18.02.2026)

Gezielte Suche nach **Frontend-**, **Python-**, **Go-** und **Rust-**Referenzen. Jeder Eintrag ist in Baseline / Sekundaer / Offen eingeordnet und in der Quick-Reference unten enthalten.

### Frontend (TS/React/Next.js)

| Projekt / Ressource | Kategorie | Kontext | Link / Hinweis |
|---------------------|-----------|---------|-----------------|
| **LWC Plugin Examples (Volume Profile, Drawing)** | **Baseline** | Offizielle Primitives: Volume Profile, Rectangle, Trend Line, Vertical Line, Session Highlighting. Direkt in unserem LWC-Chart nutzbar. | [Plugin Examples](https://tradingview.github.io/lightweight-charts/plugin-examples/) |
| **@lab49/react-order-book** | **Sekundaer** | Order-Book-Komponente, TypeScript, unopinionated Styling, Streaming; fuer Order-Ticket/Book-Verfeinerung wenn GCT Orderbook-Daten liefert. | [GitHub](https://github.com/lab49/react-order-book) |
| **Order Vantage (ordervantage-react)** | **Sekundaer** | Trading-UI mit React 19, Vite, TS, Kraken Order Book, WebSocket, Tailwind, Framer Motion; Performance-Referenz. | [GitHub](https://github.com/unholy0X/ordervantage-react) |
| **shadcn/ui + Shadcnblocks** | **Baseline** | Bereits im Stack; Data Table / Dashboard-Blocks fuer Watchlist/Portfolio-Tabellen. | [shadcn Table](https://ui.shadcn.com/), [Shadcnblocks](https://shadcnblocks.com/) |

### Python (Indikatoren / Backtest / Buch-Ergaenzung)

| Projekt / Ressource | Kategorie | Kontext | Link / Hinweis |
|---------------------|-----------|---------|-----------------|
| **pandas-ta** | **Sekundaer** | 150+ Indikatoren, 60+ Candlestick-Patterns; ergaenzt Buch + indicator-service als Algorithmen-Referenz. Langfristig durch Rust/PyO3-Core abgeloest (siehe [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md)). | [PyPI](https://pypi.org/project/pandas-ta/) |
| **TA-Lib** | **Sekundaer** | C/C++ mit Python-Bindings, 200+ Indikatoren; Standard-Referenz fuer Korrektheit und Algorithmen. Langfristig: Kand/VectorTA (Rust) als schnellere Alternative. | [ta-lib.org](https://ta-lib.org/) |
| **Technical Analysis Library in Python (TA)** | **Offen** | Pandas-basiert, Feature-Engineering; geringere Prioritaet neben pandas-ta und Rust-Pfad. | [Read the Docs](https://technical-analysis-library-in-python.readthedocs.io/) |

### Go (Marktdaten / Exchange-Adapter)

| Projekt / Ressource | Kategorie | Kontext | Link / Hinweis |
|---------------------|-----------|---------|-----------------|
| **finnhub-go (offiziell)** | **Sekundaer** | Offizieller Go-Client fuer Finnhub; Referenz fuer API-Coverage/Updates. Eigener Connector existiert. | [GitHub](https://github.com/Finnhub-Stock-API/finnhub-go) |
| **go-alpha-vantage** | **Offen** | Alpha-Vantage-Client in Go; wenig Stars, AV bereits ueber bestehende Adapter abgedeckt. | [GitHub](https://github.com/ga42quy/go-alpha-vantage) |
| **goexchange (evdnx)** | **Sekundaer** | Einheitliche Clients Binance/Coinbase/Swyftx, REST+WS, Retry/Backoff; Pattern-Referenz fuer weitere Exchange-Adapter. | [GitHub](https://github.com/evdnx/goexchange) |
| **CCXT (Go-Variante)** | **Offen** | Multi-Exchange in Go; TS-Fallback existiert, Go-Variante erst bei messbarem Bedarf. | [CCXT](https://github.com/ccxt/ccxt) |

### Rust (Indicator Core / WASM / Backtesting)

> Vollstaendige Analyse: [`docs/RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md)

| Projekt / Ressource | Kategorie | Kontext | Link / Hinweis |
|---------------------|-----------|---------|-----------------|
| **Kand** | **Sekundaer** (Evaluation) | Rust TA-Library mit PyO3 + WASM, O(1) incremental, GIL-free; Kandidat als Basis fuer `rust-core/`. | [GitHub](https://github.com/kand-ta/kand) |
| **VectorTA** | **Offen** | 194+ Indikatoren in Rust, SIMD + CUDA; umfangreicher als Kand, Fallback falls Kand nicht reicht. | [vectoralpha.dev](https://vectoralpha.dev/projects/ta/) |
| **ChartGPU** | **Offen** | TypeScript + WebGPU, 120+ FPS, Millionen Datenpunkte; Alternative zu Rust WASM fuer Chart-Performance (kein Rust noetig). | [GitHub](https://github.com/ChartGPU/ChartGPU) |
| **Tauri v2** | **Offen** | Rust-Backend + Web-Frontend Desktop-App; 3-10 MB vs. 250 MB Electron. Erst nach Rust Indicator Core (Phase 1-2). | [tauri.app](https://v2.tauri.app/) |
| **PyO3 0.28** | **Baseline** (Tooling) | Free-threaded Python, Zero-Copy NumPy, ~7ns Overhead; Kern-Technologie fuer Rust-Python-Bridge im Indicator Service. | [pyo3.rs](https://pyo3.rs/) |

---

## Quick-Reference (alle Projekte)

> Kategorie-Legende: **Baseline** = produktiv/fest eingeplant | **Sekundaer** = optional/selektiv/Fallback | **Offen** = zu pruefen/zurueckgestellt

| Projekt | Kategorie | Stack | Schicht | Referenz |
|---------|-----------|-------|---------|----------|
| **GoCryptoTrader** | Baseline | Go + gRPC | Go | Sektion 4.5 |
| **LWC** | Baseline | TS + Canvas | TS | Sektion 2 |
| **LWC Plugin Examples** | Baseline | TS | TS | Sektion 2 |
| **Mastering Financial Markets (Buch)** | Baseline | Python | Python | Sektion 4.6, [INDICATOR_ARCH](./INDICATOR_ARCHITECTURE.md) |
| **BacktestJS** | Baseline | TypeScript | TS | Sektion 6 |
| **Foursight / NeonDash** | Baseline | Next.js | TS | Sektion 5 |
| **Finnhub WS / Crypton** | Baseline | React/Node | TS | Sektion 7 |
| **ACLED / CFR / CrisisWatch** | Baseline | Go + API | Go | Sektion 3 |
| **GDELT** | Baseline | API | Go | Sektion 3, 8 |
| **shadcn/ui + Shadcnblocks** | Baseline | TS | TS | Sektion 1 |
| **PyO3 0.28** | Baseline (Tooling) | Rust + Python | Rust/Python | [RUST_LANG](./RUST_LANGUAGE_IMPLEMENTATION.md) |
| **EquiCharts** | Sekundaer | TS + Canvas | TS | Sektion 2 |
| **CCXT** | Sekundaer | JS/TS | TS | Sektion 4 |
| **Chronicle / Scout / FinGPT / FinBERT** | Sekundaer | Python / API | Python | Sektion 8 |
| **GeoPulse / GameTheory / GeoInsight** | Sekundaer | Next.js + Python | TS+Python | Sektion 3 |
| **StockTraderPro / react-next-tradingview** | Sekundaer | Next.js | TS | Sektion 1 |
| **gocharts / FirChart / Backtest-Kit** | Sekundaer | Go/TS | Go/TS | Sektion 2, 6 |
| **@lab49/react-order-book** | Sekundaer | TS | TS | -- |
| **Order Vantage** | Sekundaer | TS | TS | -- |
| **pandas-ta / TA-Lib** | Sekundaer | Python / C | Python | -- |
| **finnhub-go / goexchange** | Sekundaer | Go | Go | -- |
| **Kand** | Sekundaer (Evaluation) | Rust | Rust/Python/TS | [RUST_LANG](./RUST_LANGUAGE_IMPLEMENTATION.md) |
| **PineTS** | Offen (AGPL) | TypeScript | TS | Sektion 6 |
| **GoChart / Divergex** | Offen (404) | -- | -- | Sektion 1 |
| **ACLED Conflict Index/Monitors** | Offen (Lizenz) | API | Go | Sektion 3 |
| **VectorTA** | Offen | Rust | Rust/Python | [RUST_LANG](./RUST_LANGUAGE_IMPLEMENTATION.md) |
| **ChartGPU** | Offen | TS + WebGPU | TS | [RUST_LANG](./RUST_LANGUAGE_IMPLEMENTATION.md) |
| **Tauri v2** | Offen | Rust + Web | Rust/TS | [RUST_LANG](./RUST_LANGUAGE_IMPLEMENTATION.md) |
| **TA (Python)** | Offen | Python | Python | -- |
| **go-alpha-vantage / CCXT Go** | Offen | Go | Go | -- |
| **SECO Sanktionslisten** | Offen | XML | Go | Legal & Reg |
| **Open Legal Data** | Offen | REST/JSON | Go | Legal & Reg |
| **SCD Bundesgericht (ETH)** | Offen | CSV/SQLite | Go | Legal & Reg |
| **Fedlex (Bundesrecht)** | Offen | SPARQL/RDF | Go | Legal & Reg |
| **EUR-Lex** | Offen | REST/XML | Go | Legal & Reg |
| **CourtListener / RECAP** | Offen | REST/JSON | Go | Legal & Reg |
| **FINMA Enforcement** | Offen | HTML/PDF | Go | Legal & Reg |
| **Global Legal Monitor (LoC)** | Offen | RSS | Go | Legal & Reg |
| **LeReTo / entscheidsuche.ch** | Offen | Web | -- | Legal & Reg |
| **Lawsearch (Weblaw)** | Offen (Enterprise) | API | Go | Legal & Reg |
| **AsianLII** | Offen | HTML | Go | Legal & Reg |
| **AfricanLII / SAFLII** | Offen | HTML | Go | Legal & Reg |
| **Indian Kanoon / SEBI** | Offen | JSON/HTML | Go | Legal & Reg |
| **DIFC / ADGM Courts** | Offen | HTML | Go | Legal & Reg |
| **FATF / IOSCO / FSB** | Offen | PDF/HTML | Go | Legal & Reg |
| **CVM + BCB (Brasilien)** | Offen | JSON/HTML | Go | Legal & Reg |
| **FSA Japan / MAS Singapore** | Offen | HTML | Go | Legal & Reg |
| **CanLII (Kanada)** | Offen | HTML | Go | Legal & Reg |
| **BAILII (UK+Irland)** | Offen | HTML | Go | Legal & Reg |
| **IMF IFS (Erweiterung)** | Offen | SDMX/JSON | Go | Global Macro |
| **IMF WEO** | Offen | JSON | Go | Global Macro |
| **World Bank WDI (Erweiterung)** | Offen | JSON | Go | Global Macro |
| **OECD Data Explorer** | Offen | SDMX/JSON | Go | Global Macro |
| **BCB SGS (Brasilien)** | Baseline | JSON | Go | Global CB |
| **Bank of Korea ECOS** | Baseline | JSON/XML | Go | Global CB |
| **RBI DBIE (Indien)** | Baseline | JSON/CSV | Go | Global CB |
| **TCMB EVDS (Tuerkei)** | Baseline | JSON | Go | Global CB |
| **Banxico SIE (Mexiko)** | Baseline | JSON | Go | Global CB |
| **BCRA (Argentinien)** | Baseline | JSON | Go | Global CB |
| **Tushare (China)** | Offen | JSON | Go | Global Equities |
| **J-Quants (Japan)** | Offen | JSON | Go | Global Equities |
| **IBGE SIDRA (Brasilien)** | Offen | JSON | Go | Global Stats |
| **INEGI (Mexiko)** | Offen | JSON | Go | Global Stats |
| **NBS (China)** | Offen | JSON | Go | Global Stats |
| **e-Stat (Japan)** | Offen | JSON/XML | Go | Global Stats |
| **OFR Financial Stress Index** | Offen | REST/JSON | Go | Fin. Stability |
| **NY Fed Markets API** | Offen | REST/JSON | Go | Fin. Stability |
| **BIS Early Warning Indicators** | Offen | API | Go | Fin. Stability |
| **ISDA SwapsInfo** | Offen | REST | Go | Fin. Stability |
| **BIS RCAP (Basel-Regime)** | Offen | HTML/Excel | Go | Fin. Stability |
| **FINRA Margin Statistics** | Offen | CSV | Go | Fin. Stability |
| **FSB NBFI Report** | Offen | PDF/Excel | -- | Fin. Stability |

---

## Datenquellen-Erweiterung: Commodities, Forex, Aktien, Futures, Derivate

> **Stand:** 2026-02-18 | **Kontext:** Crypto ist via GCT + CCXT gut abgedeckt (inkl. Perpetual Futures, Funding Rates -- siehe unten). Ziel: Luecken bei Commodities, erweitertem Forex, europaeischen/globalen Aktienmaerkten, **Futures-Spezifika** (COT, Term Structure, Continuous Contracts) und **Options/Bonds** schliessen. Alle neuen Quellen hier sind fuer **Go-Adapter** im Unified Data Layer vorgesehen.
>
> **Hintergrund-Recherche:** Web, Reddit (r/algotrading, r/Commodities, r/quant), YouTube, API-Dokumentationen, Community-Vergleiche.
>
> **Bewertete und verworfene Meta-Projekte:** OpenBB Platform (Python-only, passt nicht in Go-Data-Layer), AKShare (China-lastig, Scraping), pandas-datareader (veraltet, <20 Quellen), OpenAlgo (Indien-Broker, kein Daten-Aggregator). Diese Projekte sind als **Research-Referenz** nuetzlich (z.B. OpenBB im Jupyter-Notebook zum Testen von Endpoints), aber nicht als Produktions-Dependency.

### Implementierungsprinzip fuer viele Quellen (Go Data Layer)

> **Wichtig:** Die 50+ Quellen werden **nicht** als 50 vollstaendige Einzel-Clients gebaut. Stattdessen: **Quellen-Gruppen + BaseConnector-Module** (siehe `go-research-financial-data-aggregation-2025-2026.md`, Sek. 12). Dadurch sinkt der Aufwand pro neuer Quelle von „voller Client mit Boilerplate“ auf „dunne Config + Parser“.

| Quellen-Gruppe | Typische Quellen | Base-Modul (Go) | Implementierungs-Strategie |
|---|---|---|---|
| **G1 REST-API (Standard)** | Finnhub, FMP, Polygon, Banxico, BCB | `internal/connectors/base/http_client.go` | Standardfall: `base.Client` + Provider-spezifischer Parser + Router-Metadaten |
| **G2 WebSocket Streams** | Finnhub WS, Exchange WS (GCT), Tiingo WS | `services/market/streaming/*` + Connector-Layer | Reconnect/Heartbeat zentral; Provider nur Subscribe-/Payload-Mapping |
| **G3 SDMX** | IMF IFS/WEO, OECD, ECB SDW, UN | `internal/connectors/base/sdmx_client.go` | Ein generischer SDMX-Client, pro Provider nur Config/Dataflow |
| **G4 Zentralbank-Zeitreihen** | FRED, BCB, RBI, BoK, TCMB, Banxico | `internal/connectors/base/timeseries.go` | `URLTemplate` + Feldmapping (`date/value`) + AuthStyle statt Full-Client |
| **G5 Bulk/Periodic** | CFTC COT, FINRA ATS, LBMA, FXCM Hist | `internal/connectors/base/bulk_fetcher.go` | Scheduler + Parser + Idempotenz; kein Realtime-Fallback nötig |
| **G6 RSS/Atom** | Legal/Regulatory Feeds, News-Feeds | `internal/connectors/base/rss_client.go` | Poll + Dedup + UIL/News-Routing |
| **G7 Diff-Listen (XML/JSON)** | SECO/OFAC/UN/EU Sanctions | `internal/connectors/base/diff_watcher.go` | Version speichern, Diff berechnen, nur Änderungen emittieren |
| **G8 Non-English Quellen** | NBS China, PBoC, lokale Gerichte/Behörden | `internal/connectors/base/translation.go` | Go fetcht roh; Python LLM-Pipeline übersetzt/extrahiert |
| **G9 Inoffiziell/Scraping** | Yahoo (inoffiziell), NSE, investing.com | `base.Client` + Schema-Drift-Checks | Nur Fallback-Quelle; strenge Formatvalidierung/Monitoring |
| **G10 Oracle Networks** | Chainlink, Pyth, Band, Redstone | `internal/connectors/base/oracle_client.go` | Web2-Cross-Check, Disagreement-Signal statt Primärpreisquelle |

### Effiziente Reihenfolge (empfohlen)

1. **G1 + G4 zuerst**: deckt den Großteil der „offenen“ Makro-/Zentralbank-/Standard-APIs ab.
2. **G3 (SDMX)**: hoher Hebel, weil mehrere globale Quellen mit einem Client erschlossen werden.
3. **G5/G6/G7**: Batch-/Regulatory-/Legal-Quellen für Geo/Compliance ohne Realtime-Komplexität.
4. **G8/G9** nur gezielt bei Produktbedarf/Lizenzfreigabe.
5. **G10** als Verifikations-/Stress-Signal-Layer nach stabilem Web2-Fundament.

### Operative Regel im Go-Router

- Jeder Provider bekommt in `go-backend/config/provider-router.yaml` mindestens:
  - `group` (z. B. `g4_centralbank_timeseries`)
  - `kind` (z. B. `macro_timeseries`)
- Diese Metadaten dienen später für:
  - gruppenspezifische Fallback-Semantik
  - Priorisierung im Router
  - Migrations-Tracking („welche Gruppen sind bereits im Go-Layer abgedeckt?“)

### GCT als Methoden-Quelle (nicht als harte Kopplung)

> **Strategie:** Fuer die breite Quellen-Expansion uebernehmen wir aus **GoCryptoTrader** vor allem **Betriebs-/Robustheitsmuster**, nicht blind dessen interne Paketstruktur fuer alle Nicht-Crypto-Provider.

Was wir aktiv uebernehmen sollten (Pattern-Ebene):

- **WebSocket-Lifecycle-Management** (Reconnect, Heartbeat, Resubscribe, Stale Detection)
- **Capability-Matrix pro Provider** statt „ein Interface fuer alles“
- **Fehlerklassifizierung** (`retryable`, `auth`, `quota`, `schema drift`, `temporary upstream`)
- **Symbol-/Market-Normalisierung**
- **Transport-Hygiene** (Timeouts, Retries, Rate Limits, strukturierte Logs)

Was wir vermeiden sollten:

- tiefe Kopplung an GCT-Internals fuer Nicht-Crypto-Domaenen
- ein monolithisches „Super-Interface“ fuer alle Quellen
- Copy/Paste von Exchange-spezifischen Payload-Modellen in Macro/Legal/Geo-Connectoren

**Technische Umsetzung (Go-Layer, begonnen):**
- `internal/connectors/base/capabilities.go` (Capability-Matrix-Scaffold)
- `internal/connectors/base/error_classification.go` (Fehlerklassen fuer Router/Fallback)
- spaeter: `base/ws_client.go` + `streaming/reconnect_policy.go` / `subscription_registry.go`

### Provider-Inventar: Was wir HABEN (alle Schichten)

> **Wichtig:** Die TS-Provider sind **Uebergangsloesung** bis Go-Adapter sie ersetzen. Nur Go-Connectoren sind im Unified Data Layer. TS-Provider laufen im Next.js-Frontend und sind direkt vom Browser aus erreichbar.

| Provider | Schicht | Asset-Klassen | Besonderheit |
|---|---|---|---|
| **GoCryptoTrader (GCT)** | **Go** | Crypto (30+ Exchanges) | gRPC + JSON-RPC; Order/Backtest/Portfolio; WebSocket nativ |
| **Finnhub** | **Go + TS** | Stocks, FX, Crypto | Go: REST Quote + WebSocket Stream; TS: REST Fallback |
| **FRED** | **Go + TS** | Macro (Zinsen, Inflation, BIP) | Go: Observations + Scheduled Ingest; TS: Fallback |
| **ECB** | **Go + TS** | Forex (30+ Paare) | Go: XML-Feed daily; TS: Fallback |
| **Polygon.io** | **TS only** | Stocks, FX, Crypto, Indices, Options | Volle Impl. (`src/lib/providers/polygon.ts`); hat auch Futures/Options-Endpoints |
| **Twelve Data** | **TS only** | Stocks, FX, Crypto, Commodities | Volle Impl.; Free Tier limitiert |
| **Alpha Vantage** | **TS only** | Stocks, FX, Crypto, Commodities | Volle Impl.; Commodity-Endpoint (monatlich) |
| **EODHD** | **TS only** | Stocks, ETFs, Commodities | Volle Impl.; Free Tier: 20 req/Tag |
| **FMP (Financial Modeling Prep)** | **TS only** | Stocks, ETFs, Indices, Fundamentals | Volle Impl. (`src/lib/providers/fmp.ts`); nicht in bisheriger Bestandsaufnahme |
| **Marketstack** | **TS only** | Stocks, ETFs, Indices | Volle Impl. (`src/lib/providers/marketstack.ts`); nicht in bisheriger Bestandsaufnahme |
| **CoinMarketCap** | **TS only** | Crypto | Volle Impl. (`src/lib/providers/coinmarketcap.ts`) |
| **Finage** | **TS only** | Stocks, FX | Volle Impl. (`src/lib/providers/finage.ts`) |
| **Yahoo (unofficial)** | **TS only** | Stocks, FX, Futures, Crypto, Indices | Volle Impl.; Futures via `GC=F` etc. (delayed) |
| **yfinance-bridge** | **TS only** | Wie Yahoo, via externen Bridge-Service | Delegiert an separaten yfinance-Server |
| **CCXT** | **TS only** | Crypto (107+ Exchanges, inkl. Derivatives) | Feature-Flag `ENABLE_CCXT_FALLBACK`; siehe Crypto-Derivatives-Note |

> **Crypto-Derivatives-Abdeckung (CCXT + GCT):**
> - **Perpetual Futures:** CCXT unterstuetzt Perps ueber Unified API (`binanceusdm`, `bybit`, `bitmex`, `okx`, `krakenfutures` etc.). GCT verbindet zu denselben Exchanges.
> - **Funding Rates:** CCXT: `fetchFundingRate()` + `fetchFundingRateHistory()` auf vielen Exchanges. GCT: geplant, nicht voll dokumentiert.
> - **Open Interest:** CCXT: teilweise (in Funding-Response enthalten). Kein einheitliches `fetchOpenInterest()`.
> - **Options:** CCXT: partiell (Deribit, OKX). Kein breites Options-Ecosystem.
> - **Liquidations:** Weder CCXT noch GCT haben unified API. Exchange-spezifische WebSocket-Streams moeglich.
> - **Fazit:** Fuer Crypto-Spot + Perps + Funding sind wir mit GCT + CCXT **gut abgedeckt**. Crypto-Options und Liquidations bleiben Nischen-Features.

### Bestandsaufnahme: Was wir HABEN (Commodity-/Futures-relevant)

| Provider (bestehend) | Schicht | Commodity-Faehigkeit | Konkret |
|---|---|---|---|
| **Yahoo (unofficial)** | TS | Futures-Symbole (delayed) | `GC=F` Gold, `SI=F` Silber, `CL=F` WTI, `HG=F` Kupfer, `PL=F` Platin, `NG=F` Erdgas, `ZW=F` Weizen, `ZC=F` Mais |
| **Polygon.io** | TS | Stocks, FX, Crypto, Options, Indices | Futures/Options-Endpoints vorhanden; bisher nur fuer Stocks/FX genutzt |
| **EODHD** | TS | `commodity` in supportedAssets | Metals, Energy, Agrar; Free Tier: 20 req/Tag |
| **Alpha Vantage** | TS | Commodity-Endpoint | `WTI`, `BRENT`, `NATURAL_GAS`, `COPPER`, `ALUMINUM`, `WHEAT`, `CORN`, `COTTON`, `SUGAR`, `COFFEE` (monatlich) |
| **Twelve Data** | TS | Teilweise | Commodity-Futures ueber Exchange-Symbole, Free Tier limitiert |
| **FMP** | TS | Commodity-Quotes vorhanden | Commodity-Preise ueber `/api/v3/quote/`; nicht aktiviert |
| **FRED** | Go + TS | Indirekt (EOD) | Gold: `GOLDAMGBD228NLBM`, Oil: `DCOILWTICO`, diverse Commodity-Preisreihen |
| **Finnhub** | Go + TS | Stocks/Forex, kein Commodity | -- |

### Spezifische Exchanges: Kostenloser Zugang (Realitaets-Check)

| Exchange | Real-time kostenlos? | Delayed/EOD kostenlos? | Anmerkung |
|---|---|---|---|
| **COMEX (CME Group)** | Nein (CME-Lizenz $$$) | Ja, via Yahoo Futures (delayed), Nasdaq Data Link (historisch) | CME DataMine: ab $0.50/GB + Fees. Real-time nur ueber lizenzierte Distributoren. |
| **LBMA (London)** | Nein (ICE Benchmark Admin) | Ja, taegliche Fixing-Preise (Gold AM/PM, Silber, Platin, Palladium) | Fixing-Daten auf lbma.org.uk als Download. Intraday-Daten erst 4h nach Publikation via ICE. |
| **LME (London Metal Exchange)** | Nein (kostenpflichtig) | Teilweise (historische Reports auf lme.com) | Lizenzierung ueber datalicensing.lme.com. Industriemetalle (Cu, Al, Zn, Ni, Pb, Sn). |
| **Shanghai Gold Exchange (SGE)** | Nein | Praktisch nein | Kein offizieller Free-API-Zugang fuer Auslaender. Einzelne Delayed-Snapshots nur via Scraping. |
| **SIX Swiss Exchange** | Nein (LSEG-Lizenz) | Teilweise via Finnhub/Twelve Data (Aktien) | Edelmetalle/Commodities auf SIX: kein kostenloser Zugang. |
| **Eurex / EEX** | Nein | Ueber Databento (ab $199/mo) | Eurex Energy-Derivate, kein Free Tier. |

> **Fazit Exchanges:** Direkte Exchange-Feeds (COMEX, LME, SGE) sind fuer Retail/Indie-Projekte **nicht kostenlos verfuegbar**. Die Strategie ist: aggregierte Drittanbieter-APIs nutzen, die Delayed/EOD-Daten dieser Exchanges bereitstellen.

---

### NEUE Quellen: Commodities (Edelmetalle, Energie, Agrar)

#### Tier 1 -- Hoher Wert, kostenlos, stabile API (Go-Adapter priorisieren)

| Quelle | Was sie liefert | Free Tier | API-Stil | Go-Aufwand | Link |
|---|---|---|---|---|---|
| **Nasdaq Data Link (ex-Quandl)** | COMEX-Futures (historisch), LBMA Gold/Silber Fix, 50+ Commodity-Datasets, Macro-Serien | 50 req/Tag, API Key required | REST, JSON, gut dokumentiert | Klein (~100 LoC) | [data.nasdaq.com](https://data.nasdaq.com/), [API-Doku](https://blog.data.nasdaq.com/api-for-commodity-data) |
| **World Bank Commodity Prices ("Pink Sheet")** | 70+ Commodities (Metalle, Energie, Agrar), monatlich + jaehrlich, ab 1960 | Voellig kostenlos, keine Auth, CC-BY-4.0 | REST (SDMX), JSON/CSV/Excel | Minimal | [DataBank](https://databank.worldbank.org/databases/commodity-price-data), [API](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures) |
| **IMF Primary Commodity Prices (PCPS)** | 68 Commodities in 4 Klassen (Energy, Agrar, Fertilizer, Metals), monatlich ab 1980 | Voellig kostenlos, SDMX-API | REST (SDMX 2.1 + 3.0), JSON | Klein | [imf.org/commodity-prices](https://www.imf.org/en/research/commodity-prices), [API](https://data.imf.org/en/Resource-Pages/IMF-API) |
| **Free Gold API** | Gold-Preise 1258-2025(!), Gold/Silber-Ratio ab 1687, taegliches Update 6AM UTC | Komplett kostenlos, kein API Key, CORS | Static JSON + CSV (GitHub-hosted) | Trivial | [freegoldapi.com](https://freegoldapi.com/) |

#### Tier 2 -- Spezialisierte Metals/Commodity-APIs (Free Tier mit Limits)

| Quelle | Was sie liefert | Free Tier | Einschraenkung | Link |
|---|---|---|---|---|
| **GoldAPI.io** | Gold (XAU), Silber (XAG), Platin (XPT), Palladium (XPD); 30+ Waehrungen; Historisch ab 1968 | Sandbox: 100 req/Monat, Daily-Aufloesung | Paid: $99/mo unlimited. Kein Intraday im Free Tier. | [goldapi.io](https://www.goldapi.io/) |
| **Metals-API** | 170+ Commodities + Waehrungen, LBMA/LME-Preise, regionale Gold-Preise (Indien), ETF-Preise | Free Tier vorhanden (Limits unklar) | Millisekunden-Antwortzeit. Genauere Free-Limits auf Anfrage. | [metals-api.com](https://metals-api.com/) |
| **AllTick** | Real-time Tick-Daten: Gold, Silber, Stahl, Brent, Erdgas; ~170ms Latenz | Free API Key, Real-time + Historisch | Go-SDK verfuegbar. Neu am Markt, Stabilitaet noch zu pruefen. | [alltick.co](https://alltick.co/), [Futures-API](https://api.alltick.co/futures-api) |
| **FinanceFlow API** | 80+ Commodities (Metals, Energy, Agrar), Economic Calendar, Stocks | Test: $5/mo (200 req/mo) | Kein echter Free Tier; guenstigster Einstieg. ~1min Update-Intervall. | [financeflowapi.com](https://financeflowapi.com/commodities-data-api) |

#### Tier 3 -- Bulk-Download / Scraping (kein API, aber nuetzlich fuer Historien)

| Quelle | Was sie liefert | Zugang | Einschraenkung | Link |
|---|---|---|---|---|
| **LBMA Daily Fixing** | Gold AM/PM Fix, Silber Fix, Platin, Palladium (taeglicher Benchmark) | CSV-Download auf Website | Kein REST-API; Go-Adapter muss CSV parsen oder Seite scrapen. | [lbma.org.uk/prices-and-data](https://www.lbma.org.uk/prices-and-data/precious-metal-prices) |
| **Stooq.pl** | Historische Commodity/Futures/FX/Aktien-Daten; Daily + Hourly + 5min | ASCII-Download (DB-Sektion) | Kein offizieller API-Endpoint. Community-Wrapper existieren (Haskell, Python). Stabil aber inoffiziell. | [stooq.com/db](https://stooq.com/db/) |
| **LME Historical Reports** | Industriemetalle (Cu, Al, Zn, Ni, Pb, Sn) -- historische Reports | Website-Download | Kein API. Limitierte historische Tiefe kostenlos. Voll-Zugang kostenpflichtig. | [lme.com/Market-data/Reports-and-data](https://www.lme.com/en/Market-data/Reports-and-data) |

---

### NEUE Quellen: Erweitertes Forex

| Quelle | Was sie liefert | Free Tier | Besonderheit | Link |
|---|---|---|---|---|
| **Frankfurter** (Open Source) | ECB-Referenzkurse, 30+ Waehrungspaare, ab 1999 | Komplett kostenlos, kein API Key, keine Limits | Open-source, self-hostable. Basiert auf ECB-Daten (wie unser ECB-Adapter), aber mit besserem API-Design. Taegliches Update ~16:00 CET. | [frankfurter.app](https://www.frankfurter.app/) |
| **Tiingo Forex** | 140+ Forex-Ticker, Top-of-Book (Bid/Ask) von Tier-1-Banken, Intraday OHLC, REST + WebSocket | Starter: 500 Symbole/mo, 50 req/h, 1000 req/Tag | Qualitativ hochwertig (Dark-Pool-Daten). Free Tier nur fuer internen Gebrauch (keine Redistribution). Power: $30/mo. | [tiingo.com/documentation/forex](https://www.tiingo.com/documentation/forex) |
| **FXCM Historical Tick Data** | 26 Waehrungspaare, 4 Jahre Tick-Daten + 21 Paare 6 Jahre Candle-Daten | Komplett kostenlos (Bulk-Download) | CSV.GZ-Dateien pro Instrument/Woche. Kein REST-API, aber Go kann Files direkt fetchen + gunzip. Daten ab 2015. | [fxcmapi.github.io](https://fxcmapi.github.io/), [Tick-Data-Repo](https://tickdata.fxcorporate.com/) |
| **ExchangeRate-API** | Taegliche Wechselkurse, breit | Open Access: kein Key noetig, 1x taeglich Update | Erfordert Attribution. Paid: 1500 req/mo ohne Attribution. | [exchangerate-api.com](https://www.exchangerate-api.com/docs/free) |
| **UniRate API** | 593 Waehrungen, 57 Jahre Historie (ab 1999), 15min Updates | 200 req/Tag, 30 req/min | Breite Waehrungs-Abdeckung inkl. exotische Paare. Pro: $9/mo. | [unirateapi.com](https://unirateapi.com/) |

---

### NEUE Quellen: Erweiterte Aktien / Europaeische Maerkte

| Quelle | Was sie liefert | Free Tier | Besonderheit | Link |
|---|---|---|---|---|
| **Tiingo Equities** | 99'100 globale Securities, End-of-Day + Intraday, Fundamentals | Starter: 500 Symbole/mo, 50 req/h | Gute globale Abdeckung (US + International). News-Sentiment inklusive. Free nur intern. | [tiingo.com/about/pricing](https://www.tiingo.com/about/pricing) |
| **Trading Economics** | 300'000+ Indikatoren, Commodity-Preise, Aktien-Indices, Bonds, FX | Kein offizieller Free Tier (Kontakt noetig) | Sehr breite Abdeckung. Rate-Limit: 1 req/s. Python + Node.js Packages. | [tradingeconomics.com](https://tradingeconomics.com/api/pricing.aspx), [Docs](https://docs.tradingeconomics.com/) |
| **Stooq.pl (Europaeische Aktien)** | LSE (3746 Stocks, 4611 ETFs), polnische/ungarische Boersen, US-Aktien | ASCII-Bulk-Download, kostenlos | Daily + Hourly + 5min Daten. Kein offizieller API. | [stooq.com/db](https://stooq.com/db/) |
| **Euronext Stream API** | Real-time Daten: Paris, Amsterdam, Bruessel, Dublin, Lissabon, Mailand, Oslo | Kontakt: datasolutions@euronext.com | WebSocket, JSON. Preismodell unklar (vermutlich kostenpflichtig). | [euronext.com](https://www.euronext.com/en/products-services/euronext-stream-api) |
| **Databento** | 650'000+ Symbole; CME, ICE, Eurex, EEX; Equities + Futures | Ab $199/mo (Standard) | Institutional-grade. Kein Free Tier. Erwaegen wenn Budget vorhanden. Rollout Commodities bis 06/2025. | [databento.com](https://databento.com/futures/commodity) |

---

### NEUE Quellen: Futures-Spezifika (COT, Continuous Contracts, Term Structure)

> **Luecke:** Bisherige Commodity-Quellen liefern Spot-/Front-Month-Preise. Fuer ernsthafte Futures-Analyse fehlen: Positioning-Daten (COT), Continuous Contracts (rollover-bereinigt fuer Backtesting), Open Interest, Term Structure (Contango/Backwardation), Contract-Specs.

#### Tier 1 -- Kostenlos, hoher analytischer Wert

| Quelle | Was sie liefert | Free Tier | API-Stil | Go-Aufwand | Link |
|---|---|---|---|---|---|
| **CFTC COT Reports** | Woechentliches Futures-Positioning: Commercials, Large Speculators, Small Speculators; Futures + Options; ab 1986 | Komplett kostenlos, kein Key, Public Domain | REST (PRE Portal), CSV/TSV/XML Download | Klein (~120 LoC, woechentlicher Cron + CSV-Parse) | [cftc.gov/COT](https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm), [PRE-Portal](https://publicreporting.cftc.gov/) |
| **Nasdaq Data Link CHRIS** | Continuous Futures (rollover-bereinigt): CME, ICE, LIFFE, Eurex; Settlement, OI, Volume | 300 req/10s, 50k/Tag (Free Key) | REST, JSON/CSV | Klein (gleicher Adapter wie Prio 2 Commodities, nur Dataset `CHRIS/` ergaenzen) | [CHRIS Dataset](https://data.nasdaq.com/data/CHRIS-wiki-continuous-futures) |
| **US Treasury Fiscal Data API** | Auction-Ergebnisse, Outstanding Debt, Yield-Daten | Komplett kostenlos, kein Key | REST, JSON/CSV/XML | Klein (~80 LoC) | [fiscaldata.treasury.gov](https://fiscaldata.treasury.gov/api-documentation/) |
| **FRED Yield Curve** | US Treasury Yields (1M-30Y), Spread-Berechnung moeglich; Series: `DGS1MO`...`DGS30` | Komplett kostenlos (FRED-Adapter existiert) | REST (bereits implementiert) | Trivial (nur Series-IDs zum bestehenden FRED-Adapter hinzufuegen) | [FRED Treasury](https://fred.stlouisfed.org/categories/115) |

#### Tier 2 -- Options-Daten (Free Tier mit Limits)

| Quelle | Was sie liefert | Free Tier | Einschraenkung | Link |
|---|---|---|---|---|
| **CBOE All Access API** | Options Trades, Quotes, EOD; historische Daten | Free: 500 Punkte/Tag (Punkte variieren pro Endpoint) | 14-Tage-Abo-Start; danach Kontoverlaengerung noetig | [datashop.cboe.com](https://datashop.cboe.com/cboe-all-access-api) |
| **Tradier (Lite)** | Options Chains, Quotes, Greeks; US Equities + Options | Free: API-Zugang inkl., $0.35/Contract Trading | Sandbox nur delayed; Live-Daten mit Brokerage-Account | [tradier.com](https://tradier.com/individuals/pricing), [API-Docs](https://documentation.tradier.com/) |
| **Polygon.io Options** | Options Contracts, Chains, Greeks, IV, Last Trade | Basic: $29/mo (Options-Endpoints); Free Tier nur Stocks | Bereits im TS-Stack (`polygon.ts`); Options-Endpoints nicht aktiviert | [polygon.io/options](https://polygon.io/docs/options) |
| **Yahoo Finance Options** | Options Chains fuer US-Aktien + ETFs, Expiry-Dates, Bid/Ask, OI, Greeks | Kostenlos, inoffiziell, kein Key | Kein offizielles API; Community-Libraries (`yahooquery`); fragil | [finance.yahoo.com](https://finance.yahoo.com/) |

> **Options-Einordnung:** Options sind ein eigenes Feature-Vertical mit hoher Komplexitaet (Chains, Greeks, IV Surface, Expiry-Handling). Empfehlung: **Offen** -- erst angehen wenn ein konkreter Options-Analyse-Usecase definiert ist. Yahoo + Tradier Lite als erste kostenlose Quellen vormerken.

---

### NEUE Quellen: Bonds / Fixed Income

| Quelle | Was sie liefert | Free Tier | Go-Aufwand | Link |
|---|---|---|---|---|
| **FRED (bestehend)** | US Treasury Yields (1M-30Y), Corporate Bond Spreads (BAA, AAA), TED Spread | Komplett kostenlos (Adapter existiert) | Trivial (Series-IDs ergaenzen) | [FRED](https://fred.stlouisfed.org/) |
| **US Treasury Fiscal Data** | Auction Results, Debt Outstanding, Interest Expense | Komplett kostenlos, kein Key | Klein (~80 LoC) | [fiscaldata.treasury.gov](https://fiscaldata.treasury.gov/) |
| **ECB Yield Curves** | Euro-Area Yield Curves (AAA, all issuers), ab 2004, taeglich | Komplett kostenlos (ECB Statistical Data Warehouse) | Klein (SDMX-API, aehnlich ECB-FX-Adapter) | [ECB SDW](https://data.ecb.europa.eu/data/data-categories/financial-markets-and-interest-rates/government-bond-yields-and-spreads) |

> **Bonds-Einordnung:** FRED + US Treasury decken die Basis ab (Yield Curve, Spreads, Auktionen). Fuer individuelle Anleihepreise (Corporate Bonds, Sovereign Debt) sind kostenpflichtige Quellen noetig (Bloomberg, Refinitiv). Empfehlung: Yield-Curve-Daten via **bestehenden FRED-Adapter** (nur Series-IDs erweitern) + ECB Yield Curves als zweiter Adapter.

---

### Meta-Projekte / Aggregatoren (nur als Referenz / Research-Tool)

| Projekt | Was es ist | Warum NICHT als Dependency | Nutzung fuer uns | Link |
|---|---|---|---|---|
| **OpenBB Platform** | Python-basierter Unified Data Layer, 20+ Provider-Extensions, Fallback-Logik | Python-only -- bricht Go-Data-Layer-Prinzip. Wuerde separaten Python-Microservice nur fuer Fetching erfordern. | **Research-Tool**: `pip install openbb` im Jupyter-Notebook zum schnellen Testen von Provider-Endpoints und Datenformaten. Provider-Prioritaetslisten als Planungsreferenz fuer Go-Adapter-Reihenfolge. | [github.com/OpenBB-finance/OpenBB](https://github.com/OpenBB-finance/OpenBB), [Docs](https://docs.openbb.co/) |
| **AKShare** | Python-Library, extrem breite Abdeckung (China/Asia-lastig), viele Endpunkte | Scraping/inoffizielle Endpoints, fragil, ToS-Grauzone. Kein Go-Support. | Maximal als Exploration fuer Asia-Daten. Nicht fuer Produktion. | [github.com/akfamily/akshare](https://github.com/akfamily/akshare) |
| **pandas-datareader** | Python, <20 Quellen (Yahoo, Stooq, FRED, OECD, IEX, Nasdaq) | Veraltet, wenig maintained, zu klein fuer unsere Anforderungen. | Keine. Uebersprungen. | [pandas-datareader.readthedocs.io](https://pandas-datareader.readthedocs.io/) |

---

### Empfohlene Go-Adapter-Prioritaet (Commodity-Erweiterung)

> Basierend auf Kosten/Nutzen-Verhaeltnis, API-Stabilitaet und Abdeckungs-Luecken.

| Prio | Adapter | Abdeckung | Aufwand | Begruendung |
|---|---|---|---|---|
| **1** | **Yahoo Commodity-Erweiterung** | Gold, Silber, Oil, Gas, Kupfer, Agrar (Delayed Futures) | Minimal (Provider existiert, nur Symbol-Mapping erweitern) | Schnellster Weg zu Commodity-Charts. Bereits im Stack. |
| **2** | **Nasdaq Data Link (ex-Quandl)** | 50+ historische Commodity-Datasets, COMEX, LBMA Fix | Klein (~100-150 LoC, REST/JSON) | Groesster einzelner Hebel fuer historische Commodity-Daten. |
| **3** | **World Bank + IMF** | 70+ (WB) + 68 (IMF) Commodities, monatlich, ab 1960/1980 | Klein (SDMX/JSON, ~80 LoC je) | Komplett kostenlos, autoritativ, gut fuer Macro-Overlay und langfristige Charts. |
| **4** | **Free Gold API + LBMA Fixing** | Gold historisch (768 Jahre!), Gold/Silber-Ratio, LBMA-Benchmark | Trivial (Static JSON) + Klein (CSV-Parse) | Nischen-Adapter, aber extrem wertvoller Gold-Datensatz. |
| **5** | **GoldAPI.io / Metals-API** | Edelmetalle Spot-Preise, LBMA/LME-Referenz | Klein (REST/JSON) | Ergaenzung fuer tagesaktuelle Edelmetall-Spot-Preise wenn Yahoo/FRED nicht reicht. |
| **6** | **Tiingo** (Forex + Equities) | 140+ FX, 99k Securities, Bid/Ask, Intraday | Mittel (~200 LoC, REST+WS) | Qualitativ hochwertig aber Free-Tier-Einschraenkungen. Lohnt sich wenn FX-Tiefe gebraucht wird. |
| **7** | **AllTick** (Commodities Real-time) | Gold, Silber, Brent, Erdgas Tick-Daten | Mittel (REST+WS, Go-SDK vorhanden) | Noch neu -- Stabilitaet beobachten. Interessant wenn Near-Realtime Commodity-Ticks gebraucht werden. |
| **8** | **FXCM Historical Bulk** | 26 FX-Paare, Tick-Level, 4+ Jahre | Mittel (Bulk-Download + CSV-Parse in Go) | Nicht fuer Live, aber Gold-Standard fuer FX-Backtesting-Historien. |

### Erweiterte Go-Adapter-Prioritaet (Futures / Bonds ergaenzt)

> Ergaenzung zu den Commodity-Prios 1-8 oben. Neue Prios fuer Futures-Spezifika und Bonds.

| Prio | Adapter | Abdeckung | Aufwand | Begruendung |
|---|---|---|---|---|
| **9** | **CFTC COT Reports** | Woechentliches Positioning fuer alle US-Futures-Maerkte | Klein (~120 LoC, Cron + CSV) | Komplett kostenlos, extrem hoher analytischer Wert, kein Equivalent |
| **10** | **Nasdaq Data Link CHRIS (Continuous Futures)** | Rollover-bereinigte Futures-Serien fuer Backtesting | Trivial (Erweiterung von Prio 2, nur Dataset) | Gleicher Adapter, nur `CHRIS/` Dataset hinzufuegen |
| **11** | **FRED Yield Curve Erweiterung** | US Treasury Yields 1M-30Y, Bond Spreads | Trivial (Series-IDs im bestehenden Adapter) | Adapter existiert, nur IDs ergaenzen; sofort umsetzbar |
| **12** | **US Treasury Fiscal Data** | Auction Results, Debt Outstanding | Klein (~80 LoC, REST/JSON) | Komplett kostenlos, autoritativ, Bond-Analyse-Basis |
| **13** | **ECB Yield Curves** | Euro-Area Yields + Spreads | Klein (~100 LoC, SDMX-API) | Komplett kostenlos, ergaenzt FRED fuer Euro-Zinsen |

### Zusammenfassung: Coverage-Matrix nach Adapter-Ausbau

| Asset-Klasse | Jetzt (bestehend) | Nach Prio 1-4 | Nach Prio 1-13 (voll) | Nach Global G1-G16 |
|---|---|---|---|---|
| **Crypto (Spot)** | Sehr gut (GCT + CCXT) | Sehr gut | Sehr gut | Sehr gut |
| **Crypto (Derivatives)** | Gut (CCXT Perps + Funding, GCT Exchanges) | Gut | Gut | Gut |
| **US-Aktien** | Gut (Finnhub, Twelve Data, Polygon, AV, Yahoo, FMP) | Gut | Sehr gut (+Tiingo) | Sehr gut |
| **EU-Aktien** | Mittel (Finnhub, EODHD, Yahoo, Marketstack) | Mittel | Gut (+Tiingo, +Stooq) | Gut |
| **Asien-Aktien (Japan)** | Schwach (Yahoo) | Schwach | Schwach | **Gut** (+J-Quants, +e-Stat) |
| **Asien-Aktien (China)** | Fehlt | Fehlt | Fehlt | **Gut** (+Tushare: 8000+ A-Shares) |
| **Asien-Aktien (Korea/Indien)** | Schwach (Yahoo) | Schwach | Schwach | **Mittel** (+Yahoo, via Aggregatoren) |
| **EM-Aktien (Latam/MENA/Afrika)** | Schwach (Yahoo/EODHD) | Schwach | Schwach | Mittel (+Yahoo, via Aggregatoren) |
| **Forex (Majors)** | Basis (ECB daily, Finnhub, Twelve Data) | Basis | Gut (+Tiingo WS, +FXCM History) | Gut |
| **Forex (EM-Waehrungen)** | Fehlt | Fehlt | Fehlt | **Gut** (+BCB, +Banxico, +BCRA, +TCMB, +BoK) |
| **Edelmetalle** | Schwach (Yahoo Futures delayed, FRED EOD) | Gut (+Nasdaq DL, +WB/IMF, +LBMA, +FreeGoldAPI) | Sehr gut (+GoldAPI, +AllTick) | Sehr gut |
| **Energie** | Schwach (Yahoo Futures delayed, FRED EOD, AV monatlich) | Gut (+Nasdaq DL, +WB/IMF) | Gut | Gut |
| **Agrar** | Schwach (AV monatlich, Yahoo Futures) | Gut (+Nasdaq DL, +WB/IMF) | Gut | Gut |
| **Industriemetalle** | Kaum (AV monatlich) | Mittel (+WB/IMF) | Mittel (+Metals-API) | Mittel |
| **Asian Commodities (SHFE/DCE)** | Fehlt | Fehlt | Fehlt | **Mittel** (+Tushare fuer SHFE/DCE) |
| **Futures (COT/Positioning)** | Fehlt | Fehlt | **Gut** (+CFTC COT) | Gut |
| **Futures (Continuous/Backtest)** | Fehlt | Mittel (+Nasdaq DL CHRIS via Prio 2) | **Gut** (+CHRIS voll) | Gut |
| **Options** | Fehlt | Fehlt | **Offen** (Yahoo/Tradier/CBOE) | Offen |
| **Bonds / Yield Curve** | Schwach (FRED einzelne Series) | Schwach | **Gut** (+FRED Yields, +US Treasury, +ECB Yields) | Gut |
| **Macro (USA)** | Sehr gut (FRED) | Sehr gut | Sehr gut | Sehr gut |
| **Macro (EU/UK/CH)** | Gut (ECB, BoE, SNB) | Gut | Gut | Sehr gut (+OECD) |
| **Macro (Japan)** | Mittel (BoJ Balance Sheet) | Mittel | Mittel | **Sehr gut** (+e-Stat, +IMF IFS) |
| **Macro (China)** | Schwach (BIS-Aggregate) | Schwach | Schwach | **Gut** (+IMF IFS, +NBS, +Tushare) |
| **Macro (Indien)** | Schwach (BIS-Aggregate) | Schwach | Schwach | **Gut** (+RBI DBIE, +IMF IFS) |
| **Macro (Brasilien)** | Schwach (BIS-Aggregate) | Schwach | Schwach | **Sehr gut** (+BCB SGS, +IBGE, +IMF IFS) |
| **Macro (Rest Welt)** | Fehlt | Fehlt | Fehlt | **Gut** (+IMF IFS/WEO 200+ Laender, +OECD, +WDI) |
| **Financial Stress (Composite)** | Schwach (nur VIX via FRED) | Schwach | Schwach | **Gut** (+OFR FSI, +NFCI, +STLFSI, +ECB CISS, +BIS EWI) |
| **Repo/Liquiditaet** | Schwach (FRED einzelne Series) | Schwach | Schwach | **Sehr gut** (+ON RRP, +SOFR, +TGA, +NY Fed API) |
| **NBFI/Shadow Banking** | Fehlt | Fehlt | Fehlt | **Mittel** (+Z.1 Flows, +OFR HF Monitor, +CFTC TFF, +ISDA) |
| **Basel-Regime (global)** | Fehlt | Fehlt | Fehlt | **Mittel** (+BIS RCAP als GeoMap-Layer) |
| **Legal/Regulatory** | Fehlt | Fehlt | Fehlt | Siehe Legal-Sektion (L1-L16) |

> **Naechste Schritte (priorisiert, alle Sektionen):**
> - **Sofort (kein neuer Adapter):** Prio 1 (Yahoo Commodity-Symbole) + Prio 11 (FRED Yield Curve Series-IDs) + G16 (RSS-Feeds Nikkei/Caixin/ET zum bestehenden `rss_client.go`).
> - **Groesster globaler Hebel:** G1 (IMF IFS Erweiterung) -- ein Adapter-Update deckt Macro fuer 200+ Laender ab.
> - **Erster neuer Adapter:** Prio 2 (Nasdaq Data Link) deckt Commodities + Continuous Futures in einem Adapter ab.
> - **Hoher ROI, kleiner Aufwand:** Prio 9 (CFTC COT) + G4 (BCB Brasilien) + G11 (BCRA Argentinien) -- exzellente APIs, ~80 LoC je.

---

---

### NEUE Quellen: Zentralbank Balance Sheets, Datenportale und APIs (NEU 2026-02-19)

> Bilanzdaten sind fuer alle grossen Zentralbanken oeffentlich zugaenglich. Frequenz und Granularitaet variieren.
> **Geo-Map-Kontext:** Zentralbank-Daten speisen den Zentralbank-Filter-Layer (siehe [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.13).
> **Go-Router-Kontext:** Macro-Asset-Class im Data Router (siehe [`go-research-financial-data-aggregation-2025-2026.md`](./go-research-financial-data-aggregation-2025-2026.md) Sek. 2 Config `macro:`).

#### Direkte Zentralbank-Datenportale + APIs

| Zentralbank | Portal / API | Frequenz | Transparenz | API-Format |
|---|---|---|---|---|
| **Fed (USA)** | Data Download Program: https://www.federalreserve.gov/datadownload/ | Woechentlich | Sehr hoch | CSV, XML |
| **Fed via FRED** | https://fred.stlouisfed.org/docs/api/fred/ | Woechentlich | Sehr hoch | JSON, XML |
| **EZB** | Weekly Financial Statement + Jahresabschluss: https://www.ecb.europa.eu/press/annual-reports-financial-statements/annual/annual-accounts/html/index.de.html | Woechentlich | Sehr hoch | CSV, XML |
| **BoE** | Statistical Interactive Database (IADB): https://www.bankofengland.co.uk/boeapps/database/help.asp | Woechentlich | Hoch | CSV, XML, Excel |
| **BoJ** | Time-Series Data Search (200k+ Serien): https://www.stat-search.boj.or.jp/index_en.html | Periodisch | Hoch | CSV |
| **SNB** | Datenportal: https://data.snb.ch/en -- API-Doku: https://data.snb.ch/en/help_api | Jaehrlich/Quartal | Mittel-hoch | CSV, JSON via `https://data.snb.ch/api/cube/<cubeId>/data/json/en` |
| **PBoC** | Web-Download: http://www.pbc.gov.cn/diaochatongjisi/ -- Kein REST-API, Mandarin. M0/M1/M2, Kreditdaten, FX-Reserven. Besser via NBS oder BIS | Periodisch | Mittel | HTML, Excel |
| **RBI (Indien)** | **DBIE Portal + API:** https://data.rbi.org.in/DBIE/ -- REST-API, 12k+ Serien, kein Key noetig. Repo Rate, CPI/WPI, INR/USD, Banking | Periodisch | Mittel-hoch | JSON, CSV |
| **Banco Central do Brasil** | **SGS REST-API:** `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{id}/dados?formato=json` -- 50k+ Serien, kein Key, exzellent. SELIC, IPCA, BRL/USD | Woechentlich | Hoch | JSON |
| **Bank of Russia** | https://cbr.ru/eng/statistics/ -- Limitierte Web-Statistiken. Detaillierte Daten via CEIC (kostenpflichtig) oder BIS-Aggregate | Periodisch | Mittel | HTML, Excel |
| **Bank of Korea** | **ECOS REST-API:** `https://ecos.bok.or.kr/api/` -- 100k+ Serien, Free Key. Base Rate, CPI, GDP, KRW/USD, BOP | Periodisch | Hoch | JSON, XML |
| **TCMB (Tuerkei)** | **EVDS REST-API:** `https://evds2.tcmb.gov.tr/service/evds/` -- Free Key. Leitzins, CPI, TRY/USD, Gold-Reserven | Woechentlich | Hoch | JSON |
| **Banxico (Mexiko)** | **SIE REST-API:** `https://www.banxico.org.mx/SieAPIRest/` -- Free Token. Zinsen, Inflation, MXN/USD, Remittances | Periodisch | Hoch | JSON |
| **BCRA (Argentinien)** | **REST-API:** `https://api.bcra.gob.ar/estadisticas/v2.0/` -- Kein Key. Leitzins, ARS/USD offiziell + parallel ("Blue Dollar"!) | Periodisch | Mittel-hoch | JSON |
| **Bank of Thailand** | FRED-aehnliches Portal: https://www.bot.or.th/en/statistics.html -- API-Endpoints. Policy Rate, CPI, THB/USD, Tourismus | Periodisch | Mittel-hoch | JSON, CSV |
| **SARB (Suedafrika)** | Quarterly Bulletin + Statistik: https://www.resbank.co.za/ -- CSV-Download. Repo Rate, CPI, ZAR/USD, GDP | Quartal | Mittel | CSV, Excel |
| **SAMA (Saudi-Arabien)** | Reports: https://www.sama.gov.sa/ -- Kein REST-API, Excel/PDF. Geldmenge, Inflation, SAR-Peg, FX-Reserven | Periodisch | Mittel | Excel, PDF |

#### Aggregatoren (Cross-Country)

- BIS Datenportal (Cross-Country Vergleiche): https://data.bis.org/topics/CBTA
- TradingEconomics (Zeitreihen): https://tradingeconomics.com/country-list/central-bank-balance-sheet

#### Community/Wrapper (Zentralbank-Daten)

| Sprache | Library | Zentralbank | Link |
|---|---|---|---|
| **Rust** | `iadb-api` | BoE | https://github.com/rsadykhov/iadb-api |
| **Python** | `bojpy` | BoJ | https://github.com/philsv/bojpy |
| **Python** | Tutorial | BoE | https://www.pythonsherpa.com/tutorials/5/ |
| **R** | `SNBdata` | SNB | https://cran.r-project.org/web/packages/SNBdata/SNBdata.pdf |
| **R** | `BOJ` | BoJ | https://cran.r-project.org/web/packages/BOJ/vignettes/BOJ.html |
| **R** | `BOJfame` | BoJ | https://github.com/stefanangrick/BOJfame |
| **R** | `pdfetch` (`pdfetch_BOE()`) | BoE | https://cran.r-project.org/web/packages/pdfetch/pdfetch.pdf |

#### Weitere US-Wirtschaftsdaten-APIs (relevant fuer Macro-Context)

| Quelle | Beschreibung | Link |
|---|---|---|
| NY Fed Markets Data APIs | Policy-Implementation/Market Operations Daten | https://markets.newyorkfed.org/static/docs/markets-api.html |
| Bureau of Labor Statistics (BLS) | Inflation, Employment, CPI, PPI | https://www.bls.gov/bls/api_features.htm |
| Bureau of Economic Analysis (BEA) | GDP, National Accounts | https://us-bea.github.io/econ-visual-guide/access-economic-data-via-the-bea-api.html |
| US Treasury Fiscal Data | Debt, Interest, Auction Results | https://fiscaldata.treasury.gov/api-documentation/ |
| FDIC BankFind Suite | Bankenstammdaten, Reports | https://api.fdic.gov/banks/docs/ |
| SEC EDGAR APIs | Filings, Company Tickers, Fundamentals | https://www.sec.gov/search-filings/edgar-application-programming-interfaces |

> **Go-Adapter-Empfehlung:** Fed-Daten laufen ueber bestehenden FRED-Adapter (Series-IDs erweitern). BoE/BoJ/SNB/EZB brauchen eigene Adapter (jeweils ~80-120 LoC). BLS/BEA/Treasury erst wenn Macro-Dashboard Feature gebaut wird.

---

### NEUE Quellen: On-Chain / Crypto Intelligence (NEU 2026-02-19)

| Quelle | Was sie liefert | Zugang | Besonderheit | Link |
|---|---|---|---|---|
| **Arkham Intelligence** | Entity Labels, Wallet Flows, Token Movement, Exchange Flows | API-Key (Pilot-Programm) | Daten sind probabilistisch (Wallet→Entity Zuordnung). Kein direktes Trading-Signal, sondern Kontext-Layer | https://intel.arkm.com/api/ |
| **Arkham API Docs** | Offizielle Dokumentation | -- | -- | https://intel.arkm.com/api/docs |
| **Inoffizieller API-Wrapper** | Community-Spec der Arkham API | Offen | Nicht offiziell supported | https://cipher-rc5.github.io/UnofficialArkhamAPI/ |

> **Einordnung:** Arkham ist primaer fuer den Geo-Map On-Chain-Layer relevant (grosse Wallet-Bewegungen als Geo-Events). Fuer Trading-Signale nicht direkt nutzbar, aber als Sentiment/Flow-Kontext wertvoll. Kategorie: **Offen** (API-Key-Zugang klaeren).

---

### NEUE Quellen: Symbol-Universum (Woher kommen die Kuerzel?) (NEU 2026-02-19)

> **Offene Frage:** Wie bekommen wir eine vollstaendige, aktuelle Liste aller handelbaren Symbole pro Asset-Klasse?

| Asset-Klasse | Beste Quelle fuer Symbol-Listen | API/Format | Anmerkung |
|---|---|---|---|
| **US Equities** | SEC EDGAR Company Tickers: https://www.sec.gov/files/company_tickers.json | JSON, frei | ~10k Tickers, taegliche Updates |
| **US Equities (Detail)** | Polygon Tickers API: `GET /v3/reference/tickers` | JSON, API-Key | Inkl. Delisted, Typ-Filter |
| **International Equities** | OpenBB `obb.equity.search()` oder Finnhub `/stock/symbol` | JSON | Multi-Exchange |
| **Forex Pairs** | Finnhub `/forex/symbol` oder Alpha Vantage Listing | JSON | ~200 Paare |
| **Crypto (CEX)** | CoinMarketCap `/v1/cryptocurrency/map` oder CoinGecko `/coins/list` | JSON | 10k+ Coins |
| **Crypto (DEX)** | CoinGecko `/coins/list?include_platform=true` (inkl. Contract Addresses) | JSON | DEX-Token inkl. Chain-ID |
| **Futures/Commodities** | Nasdaq Data Link Codes oder Yahoo Finance (`=F` Suffix) | Varies | Kontraktbasiert, nicht so sauber |
| **Indizes** | Finnhub `/index/list` oder Yahoo Finance (`^` Prefix) | JSON | S&P500, DAX, Nikkei, etc. |

> **Go-Router-Kontext:** Symbol-Katalog-Service im Go-Backend (periodisch 1x/Tag alle Listen pullen, normalisiertes Format speichern). Siehe [`go-research-financial-data-aggregation-2025-2026.md`](./go-research-financial-data-aggregation-2025-2026.md) Sek. 9.

---

### NEUE Quellen: DEX vs CEX Daten-Integration (NEU 2026-02-19)

| Aspekt | CEX (Binance, Coinbase, etc.) | DEX (Uniswap, SushiSwap, etc.) |
|---|---|---|
| **Daten-Zugang** | REST APIs, Websockets, gut dokumentiert | On-Chain via RPC oder Aggregatoren (0x, 1inch) |
| **Symbol-Normalisierung** | Relativ standardisiert (BTC-USDT) | Token Address + Chain ID ist die Wahrheit |
| **Volumen** | Zentralisiert, einfach | Kann Wash-Trading enthalten, schwerer zu verifizieren |
| **In unserem Router** | Bereits via `gct` + `ccxt` | Noch nicht: braucht Chain-spezifische Adapter |
| **Prioritaet** | Bereits implementiert | v2: wenn Crypto-Deepdive gewuenscht |

> **DEX-Token-Strategie:** CoinGecko Contract-Address-Mapping als Einstieg. Spaeter optional Arkham Entity-Labels fuer Wallet→Token Zuordnung.

---

### NEUE Quellen: Sonstige (NEU 2026-02-19)

| Quelle | Was sie liefert | Zugang | Anmerkung | Link |
|---|---|---|---|---|
| **investing.com (inoffiziell)** | Breite Marktdaten (Aktien, Forex, Commodities, Crypto) | Python-Wrapper, inoffiziell | Nutzung auf eigenes Risiko, kein offizielles Rate-Limit, ToS-Grauzone | https://github.com/PhamHuyThien/investing-com-api-v2 |
| **crypto.com** | Exchange API (Spot + Derivatives) | REST + WS | Pruefen ob als Provider in `ccxt` oder direkt sinnvoll | https://exchange-docs.crypto.com/ |

> **Einordnung:** Beide **Offen** -- investing.com ist inoffiziell (Scraping-Risiko), crypto.com laeuft vermutlich bereits ueber CCXT.

---

### Unkonventionelle Quellen: YouTube Transcripts + Reddit (UIL) (NEU 2026-02-19)

> **Kontext:** Unstrukturierte Quellen die durch LLM verarbeitet und menschlich reviewed werden muessen. Architektur in [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md). Alle automatisch gefetchten Quellen laufen ueber Go (konsistent mit Sprachgrenzen-Vertrag).

**YouTube Transcript Go-Libraries:**

| Library | Beschreibung | Link |
|---------|-------------|------|
| **youtube-transcript-go** (rahadiangg) | Pure Go, keine Dependencies, CLI + Library, Multi-Language, Auto-/Manual-Captions | https://github.com/rahadiangg/youtube-transcript-go |
| **youtube-transcript-api-go** (horiagug) | MIT, JSON/Text Output, v0.0.13 (Sept 2025), 15 Stars | https://github.com/horiagug/youtube-transcript-api-go |
| **yt-transcript** (paulstuart) | Wrapper mit "smooshed text" + time-indexed offsets, CLI | https://github.com/paulstuart/yt-transcript |

> **Empfehlung:** `youtube-transcript-go` (rahadiangg) als Primaer-Library -- pure Go, keine externen Dependencies, aktiv gepflegt. Neue-Video-Erkennung ueber YouTube RSS Feed pro Kanal: `https://www.youtube.com/feeds/videos.xml?channel_id={ID}` via bestehenden `rss_client.go`.

**Konfigurierte YouTube-Kanaele (UIL, persistent, per Checkbox ein/ausschaltbar):**

| Kanal | Thema | Warum relevant | Anmerkung |
|-------|-------|----------------|-----------|
| Euro Dollar University | Macro, Dollar-System, Eurodollar, Liquiditaet | Eurodollar-Mechanismen fuer Forex + Macro-Regime | Neigt zu Uebertreibung -- kritisch hinterfragen |
| Marc Friedrich | Macro, Gold, Wirtschaft, Inflation (DE) | DE-Perspektive, Gold/Commodity-Kontext | Eher neutral, gelegentlich Gold-Bias |
| Blocktrainer | Bitcoin, Crypto, Geldtheorie (DE) | Crypto-Sentiment + On-Chain fuer Crypto-Modul | Noch evaluieren |
| [Richard J Murphy](https://www.youtube.com/@RichardJMurphy) | Tax, Macro, MMT, Fiskalpolitik, Sektorenbilanzen (EN) | Fiskalpolitik-Kontext (Steuerpolitik, Kapitalfluesse) | Professor. Blog [taxresearch.org.uk](https://www.taxresearch.org.uk/Blog/) als eigene RSS-Quelle (UIL Sek. 2.1) |
| [Prof Steve Keen](https://www.youtube.com/@profstevekeen) | Post-Keynesian, Debt Dynamics, Minsky-Modelle, Private Debt (EN) | Debt-Zyklen als Fruehwarnsystem fuer Macro-Regime-Shifts | Professor, hohe akademische Qualitaet |
| [George Gammon](https://www.youtube.com/@GeorgeGammon) | Macro, Fed, Liquiditaet, Repo-Markt, Real Estate (EN) | Liquiditaet + Fed-Mechanismen, visuelle Erklaerungen. 700k+ Subs | Populaer, eher libertaer |
| [Lyn Alden](https://www.youtube.com/@LynAldenContact) | Macro, Liquiditaet, Schuldenzyklen, Fiscal Dominance (EN) | Top-Analystin. Fiscal/Monetary Policy → konkrete Asset-Implikationen | Sehr hohe Qualitaet, datengetrieben |
| [Money & Macro](https://www.youtube.com/@MoneyMacro) | Geldpolitik, Zentralbanken, Wirtschaftsgeschichte (EN) | Historische Parallelen fuer Regime-Erkennung | ~500k Subs, eher educational |
| [Patrick Boyle](https://www.youtube.com/@PBoyle) | Hedge Funds, Macro, Derivate (EN) | Wie institutionelle Investoren denken -- Smart Money Interpretation | Ex-Hedge-Fund-Manager, 1-2x/Woche |
| [Felix & Friends / Goat Academy](https://www.youtube.com/@FelixFriends) | Trading-Strategie, Technische Analyse, Volume, 50-Day SMA (EN) | **Direkte Quelle fuer Composite Signal** (Heartbeat + Volume + 50-Day). Siehe [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 3 | Kommerziell. Team inkl. ex-Market-Makers (LME, Bear Stearns, CBOE). TradeVision = kommerzielles AI-Alert-Tool, nicht Open Source |
| [The Jack Mallers Show](https://www.youtube.com/@thejackmallersshow) | Bitcoin, Lightning Network, Macro, Monetary Policy, Geldtheorie (EN) | CEO von Strike (Lightning-Payments). Top-Bitcoin-Analyst mit Macro-Tiefgang: Fed, Liquiditaet, Dollar-System, El Salvador. Live jeden Montag | Frueher "Money Matters" -- gleicher Kanal, umbenannt. Co-Hosts: Bill Mallers Jr., Dylan Lieteau. Kein Blog (strike.me/blog ist Produkt-Blog, kein Macro) |

**Blogs/Newsletters (RSS, UIL Sek. 2.1):**

| Quelle | Thema | Warum relevant |
|--------|-------|----------------|
| [Tax Research UK](https://www.taxresearch.org.uk/Blog/) (Murphy) | Tax, Macro, MMT, Fiskalpolitik | ~7-8 Posts/Tag, eigenstaendige Artikel. Komplementaer zu YT (Blog = Summaries, kein Duplikat) |
| [fx:macro (Substack)](https://www.fxmacro.info/) | FX, Zentralbanken, Intermarket | Woechentlich, speziell fuer Trader. Direkt verwertbar fuer Forex + Macro |
| [MacroAnchor (Substack)](https://macroanchor.substack.com/) | Debt, Geopolitics, Regime Shifts | Ex-Zentralbanker. Schulden-Dynamik + geopolitische Regime-Shifts |
| [Wolf Street](https://wolfstreet.com/) | US-Wirtschaft, Fed, Housing, Kredite | Taeglich, datengetrieben. US-Housing als Macro-Fruehindikator |

**Reddit Subreddits (UIL, Migration von TS nach Go):**

| Subreddit | Thema | Ist-Zustand |
|-----------|-------|------------|
| r/StockMarket | Aktien allgemein | Aktuell in TS (`aggregator.ts`), Migration nach Go geplant |
| r/investing | Investment-Diskussionen | Aktuell in TS (`aggregator.ts`), Migration nach Go geplant |
| r/algotrading | Algorithmic Trading | Neu (UIL) |
| r/Commodities | Rohstoffe | Neu (UIL) |
| r/quant | Quantitative Finance | Neu (UIL) |

> **Go-Implementierung:** Public JSON API `https://www.reddit.com/r/{subreddit}/hot.json?limit=25`. Rate-Limit: 60 req/min ohne OAuth. Neuer Connector: `go-backend/internal/connectors/reddit/client.go`.

---

### NEUE Quellen: Options + Dark Pool (NEU 2026-02-19)

> **Kontext:** Neue Datenklassen fuer Features aus INDICATOR_ARCHITECTURE.md Sek. 5n-5p + Portfolio-architecture.md P-32. Vollstaendige Provider-Details in [`go-research-financial-data-aggregation-2025-2026.md`](./go-research-financial-data-aggregation-2025-2026.md) Sek. 11.

**Options-Daten:**

| Provider | Was | Kosten | Status | Feature |
|----------|-----|--------|--------|---------|
| **Polygon Options** | Options-Chain: Strike, Expiry, IV, OI, Greeks (Delta/Gamma/Theta/Vega) | Kostenlos (EOD), $29/Mo (RT) | **Offen** -- Go-Adapter zu bauen (go-research Sek. 11) | Todo #59 GEX, #60 Expected Move, #61 Options Calc |
| **Tradier** | Options-Chain + Greeks, Quotes, Historical | Kostenlos mit Account | **Offen** -- Alternative zu Polygon | Todo #60, #61 |
| **Unusual Whales** | Ungewoehnliche Options-Flows (Sweeps, Blocks, Dark Pool Combined) | Freemium | **Offen** -- Evaluieren bei V2 | Todo #59 GEX-Kontext |
| **CBOE VIX / VIX9D** | S&P500 30/9-Tage Implied Volatility (Index-Level) | Kostenlos (via FRED) | **Baseline** -- bereits `fred`-Adapter | Todo #60 Expected Move S&P |

**Dark Pool Daten:**

| Provider | Was | Kosten | Status | Feature |
|----------|-----|--------|--------|---------|
| **FINRA ATS** | Dark Pool Volumen pro US-Equity-Symbol (woechentlich) | Kostenlos | **Offen** -- neuer Go-Fetcher (go-research Sek. 11.3) | Todo #58 Dark Pool Signal |
| **CBOE BZX Dark** | Real-Time Dark Pool Orderbook | ~$500/Mo | **Zurueckgestellt** -- zu teuer fuer Phase 1 | Spaeter als Premium-Upgrade |

> **Einordnung:** FINRA ATS und Polygon Options Free sind **Offen** (naeChste Schritte). Alle anderen Options-Provider sind **Offen/Zurueckgestellt** je nach Budget. CBOE VIX via FRED ist bereits **Baseline** (Adapter existiert).

---

### NEUE Quellen: Globale Datenquellen-Erweiterung -- Emerging Markets, Asien-Pazifik, Lateinamerika, Afrika, MENA (NEU 2026-02-22)

> **Stand:** 2026-02-22 | **Kontext:** Bisherige Quellen (FRED, ECB, Finnhub, Polygon, etc.) sind stark westlich gewichtet (USA, EU, UK, CH). Ziel: globale Abdeckung fuer Zentralbanken, Macro-Statistik, Boersen, EM-Forex und Commodities. Alle neuen Quellen hier sind fuer **Go-Adapter** im Unified Data Layer vorgesehen.
> **Go-Router-Kontext:** Neue Asset-Classes in `config.yaml` (siehe [`go-research-financial-data-aggregation-2025-2026.md`](./go-research-financial-data-aggregation-2025-2026.md) Sek. 2).
> **GeoMap-Kontext:** Zentralbank-Daten speisen den Zentralbank-Filter-Layer (Masterplan Sek. 35.13). Macro-Statistiken fuer Country-Level-Overlays.

#### 1. Zentralbank-APIs (Non-Western) -- Lücken schliessen

> **Ist-Zustand:** Fed/FRED, EZB, BoE, BoJ, SNB sind mit API-Details dokumentiert. PBoC, RBI, BCB, Bank of Russia stehen als Einzeiler ohne API-Details. Viele EM-Zentralbanken haben **production-ready REST-APIs** auf FRED-Niveau.

| Zentralbank | Land | API-URL / Portal | Format | Free? | API-Qualitaet | Serien-Beispiele |
|---|---|---|---|---|---|---|
| **BCB SGS** (Banco Central do Brasil) | Brasilien | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{id}/dados?formato=json` | JSON | Ja, kein Key | **Exzellent** -- 50k+ Serien, REST, kein Auth | SELIC (Leitzins), IPCA (Inflation), BRL/USD, Kreditvolumen, Zahlungsbilanz |
| **Banxico SIE** | Mexiko | `https://www.banxico.org.mx/SieAPIRest/service/v1/series/{id}/datos` | JSON | Ja, Free Token | **Gut** -- dokumentiert, stabil | Zinsen, Inflation, FX-Reserven, Ueberweisungen (Remittances) |
| **RBI DBIE** | Indien | `https://data.rbi.org.in/DBIE/` (+ REST-Endpoints) | JSON, CSV | Ja, kein Key | **Gut** -- 12k+ Serien | Repo Rate, CPI/WPI, INR/USD, Banking-Aggregat, Zahlungsbilanz |
| **Bank of Korea ECOS** | Suedkorea | `https://ecos.bok.or.kr/api/StatisticSearch/{key}/{format}/` | JSON, XML | Ja, Free Key | **Gut** -- 100k+ Serien | Base Rate, CPI, GDP, KRW/USD, Zahlungsbilanz |
| **TCMB EVDS** (Tuerkische Zentralbank) | Tuerkei | `https://evds2.tcmb.gov.tr/service/evds/` | JSON | Ja, Free Key | **Gut** -- REST, gut dokumentiert | Leitzins, CPI (offiziell), TRY/USD, Gold-Reserven, Kreditdaten |
| **BCRA** | Argentinien | `https://api.bcra.gob.ar/estadisticas/v2.0/` | JSON | Ja, kein Key | **Gut** -- REST/JSON, kein Auth noetig | Leitzins (Leliq), Inflation, ARS/USD (offiziell + parallel/"Blue Dollar"!) |
| **Bank of Thailand** | Thailand | `https://www.bot.or.th/en/statistics.html` (+ API-Endpoints) | JSON, CSV | Ja | **Gut** -- FRED-aehnliches Portal | Policy Rate, CPI, THB/USD, Tourismus-Einnahmen (THB-Treiber), Kredit |
| **Bank Indonesia (BI)** | Indonesien | `https://data.bi.go.id/` | JSON, CSV | Ja | **Mittel** -- Portal + einige APIs | BI Rate, CPI, IDR/USD, FX-Reserven |
| **SARB** (South African Reserve Bank) | Suedafrika | `https://www.resbank.co.za/en/home/what-we-do/statistics/key-statistics` | CSV, Excel | Ja | **Mittel** -- Quarterly Bulletin, CSV-Download | Repo Rate, CPI, ZAR/USD, GDP, Zahlungsbilanz |
| **SAMA** (Saudi Central Bank) | Saudi-Arabien | `https://www.sama.gov.sa/en-US/EconomicReports/` | Excel, PDF | Ja | **Mittel** -- Portal, kein REST-API | Geldmenge, Inflation, SAR/USD (Peg!), Banking, FX-Reserven |
| **CBUAE** | Verein. Arab. Emirate | `https://www.centralbank.ae/en/statistics` | Excel | Ja | **Schwach** -- nur Download | Banking, FX, Zinsen |
| **PBoC Statistics** | China | `http://www.pbc.gov.cn/diaochatongjisi/` | HTML, Excel | Ja | **Schwach** -- kein REST-API, Mandarin | M0/M1/M2 Geldmenge, Kreditdaten, FX-Reserven (besser via NBS) |
| **CBN** (Central Bank of Nigeria) | Nigeria | `https://www.cbn.gov.ng/rates/` | HTML, Excel | Ja | **Schwach** -- limitierte Statistiken | Naira/USD (offiziell vs. Parallel!), MPR, Inflation |
| **BCCh** | Chile | `https://si3.bcentral.cl/siete` | CSV, API vorhanden | Ja | **Mittel** -- Statistik-DB + API | Leitzins (TPM), CPI, CLP/USD, Kupferpreis (Chile = #1 Produzent) |
| **BanRep** (Banco de la Republica) | Kolumbien | `https://www.banrep.gov.co/en/statistics` | CSV, Excel | Ja | **Mittel** | Leitzins, CPI, COP/USD |
| **BSP** (Bangko Sentral ng Pilipinas) | Philippinen | `https://www.bsp.gov.ph/statistics/` | PDF, Excel | Ja | **Schwach** -- PDF-Reports | Zinsen, CPI, PHP/USD, Remittances (10% des BIP!) |

> **Empfohlene Go-Adapter-Reihenfolge (Zentralbanken):**
> 1. **BCB SGS** -- beste EM-Zentralbank-API weltweit. 50k+ Serien, kein Auth, JSON. ~80 LoC.
> 2. **Bank of Korea ECOS** -- 100k+ Serien, #10 Volkswirtschaft. ~100 LoC.
> 3. **RBI DBIE** -- #5 Volkswirtschaft. ~100 LoC.
> 4. **TCMB EVDS** -- TRY-Volatilitaet ist eigenes Trading-Signal. ~100 LoC.
> 5. **Banxico SIE** -- MXN = meist gehandelte EM-Waehrung. ~100 LoC.
> 6. **BCRA** -- Einzige API die den "Blue Dollar" (Parallel-Kurs) liefert. ~80 LoC.
> 7. **Bank of Thailand** -- FRED-aehnlich, sauber. ~80 LoC.
>
> **Schluessel-Insight EM-Forex:** Fuer Argentinien, Nigeria, Aegypten ist der **offizielle vs. Parallel-Kurs** das wichtigste Signal. Kein westlicher Provider liefert das -- nur die Zentralbank-APIs direkt (BCRA fuer ARS, CBN fuer NGN).

#### 2. Nationale Statistikaemter -- Das globale FRED-Aequivalent

> **Ist-Zustand:** FRED deckt USA ab. World Bank + IMF werden nur fuer Commodities genutzt. Fuer ein globales Macro-Dashboard fehlen laenderspezifische Statistiken (GDP, CPI, Industrie-Output, Arbeitsmarkt, Handel).

**Laenderspezifische Statistik-APIs:**

| Amt | Land | API-URL / Portal | Format | API-Qualitaet | Wichtigste Serien |
|---|---|---|---|---|---|
| **NBS** (National Bureau of Statistics) | China | `https://data.stats.gov.cn/english/easyquery.htm` | JSON | **Mittel** -- API vorhanden, Doku auf Chinesisch | GDP, Industrie-Output, Retail Sales, PMI, CPI, PPI, Fixed-Asset-Investment |
| **e-Stat** | Japan | `https://api.e-stat.go.jp/rest/3.0/` | JSON, XML | **Gut** -- REST-API, Free Key, 600+ Datasets | Alle japanischen Regierungsstatistiken zentral |
| **MOSPI + data.gov.in** | Indien | `https://data.gov.in/resource/apis` | JSON | **Mittel** -- API verfuegbar | GDP, CPI, IIP (Industrial Production), Trade Balance |
| **KOSIS** | Suedkorea | `https://kosis.kr/openapi/` | JSON, XML | **Gut** -- API | Umfassende koreanische Wirtschaftsdaten, Demographie, Handel |
| **IBGE SIDRA** | Brasilien | `https://apisidra.ibge.gov.br/` | JSON | **Gut** -- REST-API, dokumentiert | GDP, IPCA (Inflation), Arbeitsmarkt, Industrie, Handel |
| **INEGI** | Mexiko | `https://www.inegi.org.mx/servicios/api_indicadores.html` | JSON | **Gut** -- REST-API | GDP, Inflation, Industrie, Handel, Arbeitsmarkt |
| **Stats SA** | Suedafrika | `https://superweb2.statssa.gov.za/` | JSON | **Mittel** -- Superweb2-Portal | GDP, CPI, PPI, Arbeitsmarkt, Handel |
| **TUIK (TurkStat)** | Tuerkei | `https://data.tuik.gov.tr/` | JSON | **Mittel** -- Web + APIs | GDP, Inflation (offiziell vs. ENAG-alternativ!), Handel, Industrie |
| **BPS** | Indonesien | `https://www.bps.go.id/` | Excel, Web | **Schwach** -- Web/Excel-Download | GDP, Inflation, Handel |
| **GASTAT** | Saudi-Arabien | `https://www.stats.gov.sa/en` | Portal | **Mittel** | GDP, Inflation, Handel, Vision-2030-KPIs |
| **DOSM** | Malaysia | `https://open.dosm.gov.my/` | JSON, CSV | **Gut** -- Open Data Portal | GDP, CPI, Trade, Palmoel-Produktion |
| **PSA** | Philippinen | `https://psa.gov.ph/` | Excel, Web | **Schwach** | GDP, CPI, Remittances, Trade |

**Multi-Country-Aggregatoren (noch nicht voll genutzt):**

| Aggregator | Abdeckung | API-URL | Format | Free? | Was fehlt bei uns |
|---|---|---|---|---|---|
| **IMF IFS** (International Financial Statistics) | 200+ Laender | `https://dataservices.imf.org/REST/SDMX_JSON.svc/` | JSON (SDMX) | Ja, kein Key | **DAS globale FRED.** Zinsen, FX, Zahlungsbilanz, GDP fuer alle Laender. Aktuell nur PCPS (Commodities) genutzt! |
| **IMF WEO** (World Economic Outlook) | 190+ Laender | `https://www.imf.org/external/datamapper/api/v1/` | JSON | Ja | **Forward-Looking:** GDP-Prognosen, Inflation-Prognosen. Kein Aequivalent |
| **World Bank WDI** | 200+ Laender, 1400+ Indikatoren | `https://api.worldbank.org/v2/` | JSON, XML | Ja, kein Key | Breiteste einzelne Macro-Quelle. Aktuell nur Commodities (Pink Sheet) genutzt |
| **OECD Data Explorer** | 38 OECD + Partner | `https://sdmx.oecd.org/public/rest/` | JSON (SDMX) | Ja, kein Key | GDP, Inflation, Arbeitsmarkt, Handel, Bildung -- standardisiert und vergleichbar |
| **UN Data** | 200+ Laender | `https://data.un.org/SdmxRest/sdmx-json/` | JSON | Ja | Trade, Population, Energy, Industry |
| **Asian Development Bank (ADB)** | 49 asiatische Laender | `https://kidb.adb.org/api/` | JSON | Ja | Key Indicators fuer Asien: GDP, Poverty, Infrastructure |
| **African Development Bank (AfDB)** | 54 afrikanische Laender | `https://dataportal.opendataforafrica.org/` | JSON, CSV | Ja | African-spezifische Entwicklungsindikatoren |
| **Inter-American Development Bank (IDB)** | 26 Latam-Laender | `https://data.iadb.org/` | JSON, CSV | Ja | Latam-spezifische Wirtschafts- und Sozialindikatoren |

> **Groesster einzelner Hebel:** Die **IMF IFS API** allein wuerde Macro-Daten (Zinsen, FX, Zahlungsbilanz, GDP) fuer 200+ Laender liefern. Der bestehende IMF-Adapter (nur PCPS/Commodities) muesste nur um IFS- und WEO-Datasets erweitert werden -- ~100 LoC Zusatzaufwand, massiver Coverage-Gewinn.

#### 3. Boersen / Aktienmarkt-Daten (Non-Western)

> **Ist-Zustand:** Finnhub, Polygon, Twelve Data, Yahoo, FMP, EODHD, Marketstack -- primaer US + etwas EU/Global via Aggregatoren. Asiatische A-Shares (China) und dedizierte EM-Boersen-APIs fehlen.

| Boerse / Quelle | Region | API-Qualitaet | Free Tier | Besonderheit | Link |
|---|---|---|---|---|---|
| **Tushare** | China (SSE, SZSE, A-Shares) | **Gut** -- REST + Python, JSON | 500 req/Tag (Free Token) | De-facto Standard fuer chinesische Aktien/Futures/Funds. 8000+ A-Shares. Einziger vernuenftiger Zugang zu China-Daten | [tushare.pro](https://tushare.pro/) |
| **J-Quants (JPX)** | Japan (TSE) | **Mittel** -- REST-API | Free Tier vorhanden | Offiziell von Japan Exchange Group. Historisch + Live | [jpx-jquants.com](https://jpx-jquants.com/) |
| **KIS Developers** | Suedkorea (KRX, KOSPI/KOSDAQ) | **Gut** -- REST-API | Free Key | Korea Investment & Securities Open API | [apiportal.koreainvestment.com](https://apiportal.koreainvestment.com/) |
| **NSE India (inoffiziell)** | Indien (NSE/BSE) | **Mittel** -- inoffiziell, JSON | Kostenlos, fragil | Community-Wrapper (`nsepython`, `jugaad-data`). Offizielle API nur fuer Mitglieder | [nseindia.com](https://www.nseindia.com/) |
| **B3 Market Data** | Brasilien (Bovespa) | **Mittel** -- API | Teilweise kostenpflichtig | Groesste Latam-Boerse. Delayed kostenlos | [b3.com.br](https://www.b3.com.br/en_us/market-data-and-indices/) |
| **Tadawul** | Saudi-Arabien | **Mittel** -- Web-Portal | Delayed kostenlos | Groesste MENA-Boerse. Market Cap >$2.5T | [saudiexchange.sa](https://www.saudiexchange.sa/) |
| **DFM + ADX** | UAE (Dubai, Abu Dhabi) | **Schwach** -- Web-Portal | Delayed kostenlos | Wachsende Boersen. IPO-Boom 2023-2025 | [dfm.ae](https://www.dfm.ae/), [adx.ae](https://www.adx.ae/) |
| **Borsa Istanbul (BIST)** | Tuerkei | **Schwach** -- Web | Ueber Yahoo/EODHD | BIST100-Index. TRY-Volatilitaet = hohe Vola | [borsaistanbul.com](https://www.borsaistanbul.com/en/) |
| **JSE** | Suedafrika | **Schwach** -- kostenpflichtig | Ueber Yahoo/EODHD | Groesste afrikanische Boerse | [jse.co.za](https://www.jse.co.za/) |

> **Strategie:** Fuer die meisten EM-Boersen ist der beste Weg ueber **bestehende Aggregatoren** (Finnhub international, EODHD, Yahoo). Direkte Exchange-APIs lohnen sich primaer fuer **China (Tushare)** und **Japan (J-Quants)**, weil Aggregator-Abdeckung dort am schwaeChsten ist.

#### 4. Commodity-Boersen (Asiatisch)

> **Ist-Zustand:** COMEX (via Nasdaq DL/Yahoo), LME (limitiert), Stooq -- alles westlich. Chinesische Commodity-Boersen sind mittlerweile Preissetzer fuer Kupfer, Eisenerz und Stahl.

| Boerse | Land | Was sie handelt | Zugang | Globale Relevanz | Link |
|---|---|---|---|---|---|
| **SHFE** (Shanghai Futures Exchange) | China | Gold, Kupfer, Aluminium, Zink, Nickel, Stahl, Kautschuk | Web-Download, kein Free API. Via Tushare teilweise | **Hoch** -- SHFE-Kupfer ist Co-Preissetzer neben LME | [shfe.com.cn](https://www.shfe.com.cn/en/) |
| **DCE** (Dalian Commodity Exchange) | China | Eisenerz, Sojabohnen, Palmoel, Polyethylen | Web-Download. Via Tushare teilweise | **Sehr hoch** -- DCE-Eisenerz = globaler Benchmark | [dce.com.cn](http://www.dce.com.cn/DCE/TradingData/) |
| **ZCE** (Zhengzhou Commodity Exchange) | China | Baumwolle, Zucker, Weizen, Glas, PTA | Web-Download | **Mittel** -- weniger global relevant | [czce.com.cn](http://english.czce.com.cn/) |
| **MCX** (Multi Commodity Exchange) | Indien | Gold, Silber, Crude, Natural Gas, Metals | Web + teilweise API | **Mittel** -- groesster indischer Commodity-Markt | [mcxindia.com](https://www.mcxindia.com/) |
| **TOCOM** → JPX | Japan | Gold, Gummi, Rohoel, Platin | Via J-Quants/JPX-API | **Mittel** -- seit 2020 in JPX integriert | [jpx.co.jp](https://www.jpx.co.jp/english/markets/derivatives/) |
| **Bursa Malaysia Derivatives** | Malaysia | **Palmoel** (global Benchmark!), Rubber | Web-Download | **Hoch** -- globaler Palmoelpreis wird hier gesetzt | [bursamalaysia.com](https://www.bursamalaysia.com/market_information/market_statistics) |

> **Zugang:** Direkte APIs von SHFE/DCE/ZCE sind fuer Auslaender nicht frei verfuegbar. Bester Weg: **Tushare** (hat chinesische Futures-Daten) oder **Nasdaq Data Link** (einige Chinese Commodity Datasets vorhanden). Bursa Malaysia Palmoel ueber Yahoo (`PO1!`) oder Stooq.

#### 5. Forex -- Emerging Market Currencies

> **Ist-Zustand:** ECB (30 Paare, EUR-basiert), Finnhub, Tiingo (geplant). Primaer Major-Pairs. EM-Waehrungen fehlen -- vor allem die mit strukturellen Besonderheiten (Parallel-Kurse, Pegs, Kapitalverkehrskontrollen).

| Waehrungs-Klasse | Paare | Warum relevant | Beste Quelle (direkt) |
|---|---|---|---|
| **Latam** | BRL/USD, MXN/USD, ARS/USD, CLP/USD, COP/USD | BRL/USD = #5 meist gehandelt weltweit. ARS "Blue Dollar" = eigenes Trading-Signal | **BCB API** (BRL), **Banxico SIE** (MXN), **BCRA API** (ARS: offiziell + parallel!) |
| **Asien EM** | CNY/CNH, INR/USD, KRW/USD, THB/USD, IDR/USD, PHP/USD, TWD/USD | CNH (Offshore-Yuan) ≠ CNY (Onshore). Spread = Kapitalflucht-Signal. INR/KRW/THB durch Zentralbank-Interventionen gepraeGt | **PBoC** (CNY Fixing), **RBI** (INR), **BoK ECOS** (KRW), **Bank of Thailand** (THB) |
| **MENA** | TRY/USD, SAR/USD, AED/USD, EGP/USD, ILS/USD | TRY kollabiert regelmaessig (Erdogan-Policy). EGP mehrfach abgewertet seit 2022. SAR/AED sind USD-Pegs (Peg-Bruch = Black-Swan) | **TCMB EVDS** (TRY), Zentralbanken (SAR, AED, EGP) |
| **Afrika** | ZAR/USD, NGN/USD, KES/USD, GHS/USD | NGN offiziell vs. Parallel-Markt. ZAR sehr volatil (Load-Shedding-Sentiment) | **SARB** (ZAR), **CBN** (NGN -- Datenqualitaet fragwuerdig) |

> **Schluessel-Insight:** Fuer EM-Currencies ist der **offizielle vs. Parallel-Kurs** oft das wichtigste Signal. Das liefert kein westlicher Provider -- nur die Zentralbank-APIs direkt. GeoMap-Integration: Waehrungs-Spread als Heatmap-Layer pro Land.

#### 6. News / Sentiment (Non-Western)

> **Ist-Zustand:** Primaer englischsprachige Quellen (Chronicle, FinGPT, Reddit EN, RSS EN). Fuer asiatische/lateinamerikanische Maerkte fehlen lokale Quellen.

| Quelle | Region | Sprache | Typ | Zugang | Besonderheit |
|---|---|---|---|---|---|
| **Nikkei Asia** | Asien | EN | Business News, Asia-Fokus | RSS-Headlines frei, Paywall fuer Volltext | Wichtigste englischsprachige Asia-Business-Quelle |
| **Caixin Global** | China | EN | Wirtschaft/Finanzen | Headlines frei, Paywall | Liefert **Caixin PMI** -- oft marktbewegend, Gegengewicht zum offiziellen NBS-PMI |
| **South China Morning Post** | China/HK | EN | Business + Politik | Teilweise frei, RSS | Hong-Kong-Perspektive auf China |
| **Economic Times** | Indien | EN | Business/Markets | Frei, RSS | Groesstes indisches Business-Portal |
| **Valor Economico** | Brasilien | PT | Business | Paywall | Brasilianisches "Handelsblatt" |
| **El Financiero** | Mexiko | ES | Business/Markets | Frei, RSS | Wichtigste mexikanische Finanz-Quelle |
| **Al Jazeera Business** | MENA | EN/AR | Wirtschaft/Geopolitik | Frei, RSS | Nahostperspektive |
| **BusinessDay (SA)** | Suedafrika | EN | Business/Markets | Teilweise frei | Suedafrikanische Maerkte, JSE-Fokus |

> **UIL-Integration:** Alle RSS-faehigen Quellen koennen direkt ueber bestehenden `rss_client.go` laufen. Headlines werden via UIL Macro-Route (`geo`, `macro`, `trading`) klassifiziert. Sprach-Handling: EN-Quellen direkt, ES/PT/AR via LLM-Uebersetzung in Python.

#### Empfohlene Go-Adapter-Prioritaet (Globale Erweiterung)

> Basierend auf ROI (Coverage-Gewinn pro Aufwand), API-Qualitaet und Markt-Relevanz.

| Prio | Adapter | Abdeckung | Aufwand | Begruendung |
|---|---|---|---|---|
| **G1** | **IMF IFS API (Erweiterung)** | Macro-Daten fuer 200+ Laender (Zinsen, FX, BOP, GDP) | Klein (~100 LoC, SDMX-JSON; IMF-Adapter existiert, nur Dataset wechseln) | **Groesster einzelner Hebel.** Ein Adapter, globale Macro-Abdeckung. Das globale FRED |
| **G2** | **World Bank WDI (Erweiterung)** | 1400+ Entwicklungsindikatoren, 200+ Laender | Klein (~80 LoC; WB-Adapter existiert, nur Endpoint erweitern) | Ergaenzt IMF IFS mit Entwicklungs-/Sozial-Indikatoren. API existiert bereits fuer Commodities |
| **G3** | **IMF WEO** | GDP/Inflation-**Prognosen** fuer 190+ Laender | Klein (~80 LoC, REST/JSON) | **Forward-looking** -- einzigartig. Kein anderer Provider liefert offizielle Macro-Forecasts |
| **G4** | **BCB SGS (Brasilien)** | 50k+ Serien, beste EM-Zentralbank-API | Klein (~80 LoC, REST/JSON, kein Auth) | #9 Volkswirtschaft. API-Qualitaet auf FRED-Niveau |
| **G5** | **Bank of Korea ECOS** | 100k+ Serien (Zinsen, GDP, FX, BOP) | Klein (~100 LoC, REST/JSON, Free Key) | #10 Volkswirtschaft. Exzellente API |
| **G6** | **RBI DBIE (Indien)** | 12k+ Serien (Zinsen, CPI, INR, Banking) | Klein (~100 LoC, REST/JSON) | #5 Volkswirtschaft. 1.4 Mrd. Menschen |
| **G7** | **TCMB EVDS (Tuerkei)** | Zinsen, CPI, TRY/USD, Gold-Reserven | Klein (~100 LoC, REST/JSON, Free Key) | TRY-Volatilitaet = eigenes Trading-Signal. Erdogan-Policy direkt messbar |
| **G8** | **Banxico SIE (Mexiko)** | Zinsen, Inflation, MXN/USD, Remittances | Klein (~100 LoC, REST/JSON, Free Token) | MXN = meist gehandelte EM-Waehrung |
| **G9** | **OECD Data Explorer** | 38 OECD-Laender, standardisierte Indikatoren | Klein (~100 LoC, SDMX-JSON) | Ideal fuer Laender-Vergleiche. Composite Leading Indicators (CLI) als Fruehindikator |
| **G10** | **Tushare (China)** | A-Shares, Futures, Funds, Macro-Indikatoren | Mittel (~150 LoC, REST, Free Token) | Einziger Zugang zu chinesischen Boersen-Daten. 8000+ Aktien |
| **G11** | **BCRA (Argentinien)** | Zinsen, ARS offiziell + "Blue Dollar" | Klein (~80 LoC, REST/JSON, kein Auth) | Einzige API die Parallel-Kurs liefert |
| **G12** | **e-Stat (Japan)** | 600+ Datasets japanische Regierungsstatistiken | Klein (~100 LoC, REST/JSON, Free Key) | Ergaenzt BoJ mit nicht-monetaeren Statistiken |
| **G13** | **IBGE SIDRA (Brasilien)** | GDP, Inflation, Arbeitsmarkt | Klein (~80 LoC, REST/JSON) | Ergaenzt BCB mit Realwirtschaftsdaten |
| **G14** | **INEGI (Mexiko)** | GDP, Inflation, Industrie, Handel | Klein (~80 LoC, REST/JSON) | Ergaenzt Banxico |
| **G15** | **NBS China** | GDP, PMI, CPI, Industrie-Output | Mittel (~120 LoC, JSON, Doku Mandarin) | Offizielle chinesische Wirtschaftsdaten. Doku-Sprache = Huerdie |
| **G16** | **Nikkei Asia + Caixin + ET RSS** | Asien-Business-Headlines | Trivial (RSS, bestehender `rss_client.go`) | Sofort umsetzbar, kein neuer Connector noetig |

#### Zusammenfassung: Globale Coverage-Matrix (erweitert)

| Kategorie | Jetzt | Nach G1-G3 (Aggregatoren) | Nach G1-G16 (voll) |
|---|---|---|---|
| **Macro (USA)** | Sehr gut (FRED) | Sehr gut | Sehr gut |
| **Macro (EU)** | Gut (ECB, Eurostat via FRED) | Gut | Sehr gut (+OECD) |
| **Macro (Japan)** | Mittel (BoJ nur Balance Sheet) | Gut (+IMF IFS) | Sehr gut (+e-Stat, +J-Quants) |
| **Macro (China)** | Schwach (nur BIS-Aggregate) | Mittel (+IMF IFS) | Gut (+NBS, +Tushare Macro) |
| **Macro (Indien)** | Schwach (nur BIS-Aggregate) | Mittel (+IMF IFS) | Gut (+RBI DBIE, +MOSPI) |
| **Macro (Brasilien)** | Schwach (nur BIS-Aggregate) | Mittel (+IMF IFS) | Sehr gut (+BCB SGS, +IBGE) |
| **Macro (Rest Welt)** | Fehlt | **Gut** (+IMF IFS/WEO fuer 200 Laender!) | Sehr gut (+OECD, +WDI, +ADB) |
| **EM-Aktien (China)** | Fehlt | Fehlt | **Gut** (+Tushare) |
| **EM-Aktien (andere)** | Schwach (Yahoo/EODHD) | Schwach | Mittel (+J-Quants, Yahoo) |
| **EM-Forex** | Fehlt (nur Majors) | Mittel (+IMF IFS FX) | **Gut** (+BCB, +Banxico, +BCRA, +TCMB, +BoK) |
| **Asian Commodities** | Fehlt | Fehlt | Mittel (+Tushare fuer SHFE/DCE) |
| **Asia/EM News** | Fehlt | Mittel (+RSS) | **Gut** (+Nikkei, +Caixin, +ET) |

> **Naechste Schritte:**
> - **Sofort (kein neuer Adapter):** G16 (Nikkei/Caixin/ET RSS-Feeds zum bestehenden `rss_client.go` hinzufuegen).
> - **Groesster ROI:** G1 (IMF IFS Erweiterung) -- ein Adapter-Update deckt Macro fuer die ganze Welt ab.
> - **Low-Hanging Fruit:** G4 (BCB Brasilien) + G11 (BCRA Argentinien) -- exzellente APIs, ~80 LoC je, kein Auth.

---

### NEUE Quellen: Financial Stability, Shadow Banking / NBFI & Basel-Regime Intelligence (NEU 2026-02-22)

> **Kontext:** Non-Bank Financial Intermediation (NBFI / "Shadow Banking") umfasst ~$250T USD global (FSB 2024) -- fast so gross wie das regulierte Bankensystem. Repo-Maerkte, Collateral-Ketten, Private Credit, Hedge-Fund-Leverage und CLO/ABS-Maerkte sind die opaksten Bereiche des Finanzsystems. Selbst Zentralbanken geben zu, nur ~60-70% zu sehen.
> **Kausalkette:** Basel-Stringenz → NBFI-Wachstum → Collateral-Casino → Systemisches Risiko. Je strenger Basel in einem Land, desto mehr Aktivitaet wandert in Shadow Banking.
> **Architektur-Fit:** Grossteil laeuft ueber bestehenden FRED-Adapter (nur Series-IDs ergaenzen). OFR hat eigene REST-API. Basel-Regime als statischer GeoMap-Layer + RSS-Alerts bei Regulierungs-Aenderungen.
> **GeoMap-Kontext:** Neuer Layer "Regulatory Stringency / NBFI Risk" (Traffic-Light-Heatmap pro Land). Events: Basel-Endgame-Ankuendigungen, FINMA-TBTF-Reviews, NBFI-Krisen.

#### 1. Repo / Geldmarkt / Liquiditaets-Plumbing (taegliche Signale)

> **Warum zentral:** Repo-Maerkte sind das "Betriebssystem" des Finanzsystems. Repo-Stress (wie Sept 2019) propagiert innerhalb von Stunden in alle Asset-Klassen. ON RRP + TGA + Bank Reserves = Liquiditaets-Trifecta das Risiko-Assets treibt.

| Quelle | Was sie liefert | Zugang | Frequenz | FRED Series / Link |
|---|---|---|---|---|
| **NY Fed ON RRP** | Overnight Reverse Repo Volumen + Counterparties. $2T+ auf Peak | Kostenlos, NY Fed API | Taeglich | `RRPONTSYD`, [NY Fed Markets API](https://markets.newyorkfed.org/api/) |
| **SOFR** (Secured Overnight Financing Rate) | Repo-Zinssatz. Spikes = Repo-Stress | Kostenlos | Taeglich | `SOFR`, `SOFR1`, `SOFR30`, `SOFR90` |
| **Fed TGA** (Treasury General Account) | Cash der US-Regierung bei der Fed. Drainage = Liquiditaets-Injektion | Kostenlos | Woechentlich | `WTREGEN` |
| **Bank Reserves** | Reserven im Bankensystem. Knappheit → Repo-Stress | Kostenlos | Woechentlich | `TOTRESNS`, `WRESBAL` |
| **DTCC GCF Repo Index** | General Collateral Finance Repo Rate (Treasury + Agency) | Kostenlos | Taeglich | [DTCC GCF](https://www.dtcc.com/charts/dtcc-gcf-repo-index) |
| **Tri-Party Repo Volumes** | Volumen + Collateral-Typen im Tri-Party-Markt | Kostenlos | Taeglich | [NY Fed Tri-Party](https://www.newyorkfed.org/data-and-statistics/data-visualization/tri-party-repo/) |
| **Primary Dealer Statistics** | Positions, Financing, Fails der Primary Dealers. Zeigt Dealer-Balance-Sheet-Kapazitaet | Kostenlos | Woechentlich | [NY Fed PD Stats](https://www.newyorkfed.org/markets/primarydealer_statistics) |
| **Treasury Settlement Fails** | Woechentlich. Signal fuer Collateral-Knappheit | Kostenlos | Woechentlich | [NY Fed Fails](https://www.newyorkfed.org/data-and-statistics/data-visualization/treasury-securities-operations-fed-data) |
| **ECB €STR** | Euro Short-Term Rate (Euro-SOFR-Aequivalent) | Kostenlos | Taeglich | [ECB €STR](https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/euro_short-term_rate/) |
| **ECB MMSR** | Euro-Geldmarkt: Repos, Unsecured, FX Swaps (aggregiert) | Kostenlos | Taeglich | [ECB MMSR](https://www.ecb.europa.eu/stats/financial_markets_and_interest_rates/money_market/) |

> **Go-Adapter:** 6 der 10 Quellen laufen ueber bestehenden FRED-Adapter (nur Series-IDs ergaenzen). NY Fed Markets API und DTCC brauchen jeweils ~80 LoC neue Adapter.

#### 2. Financial Stress Indikatoren (Composite Scores)

| Quelle | Was sie liefert | Zugang | Frequenz | Besonderheit | Link |
|---|---|---|---|---|---|
| **OFR Financial Stress Index** | Composite: Credit, Equity, Funding, Safe Haven, Volatility | Kostenlos, **REST-API** (`https://data.financialresearch.gov/v1/`) | Taeglich | **Bester einzelner Stress-Indikator.** Office of Financial Research (US Treasury) | [OFR FSI](https://www.financialresearch.gov/financial-stress-index/) |
| **OFR Short-term Funding Monitor** | Repo, CP, CD Rates + Volumes | Kostenlos | Taeglich | Repo-Markt Echtzeit-Dashboard | [OFR STFM](https://www.financialresearch.gov/short-term-funding-monitor/) |
| **OFR Hedge Fund Monitor** | Aggregierte Hedge-Fund-Positionen (aus Form PF) | Kostenlos | Quartal | Einziger oeffentlicher Blick auf HF-Leverage | [OFR HF Monitor](https://www.financialresearch.gov/hedge-fund-monitor/) |
| **Chicago Fed NFCI** | National Financial Conditions Index (105 Indikatoren) | Kostenlos | Woechentlich | Breiter als OFR FSI | FRED: `NFCI`, `ANFCI` |
| **St. Louis Fed STLFSI** | Financial Stress Index (Alternative) | Kostenlos | Woechentlich | | FRED: `STLFSI4` |
| **ECB CISS** | Composite Indicator of Systemic Stress (Euro-Area) | Kostenlos | Wochentlich | Euro-Aequivalent zum OFR FSI | [ECB CISS](https://www.ecb.europa.eu/stats/macroprudential_indicators/) |
| **BIS Early Warning Indicators** | Credit-to-GDP Gap, Debt Service Ratios, Cross-Border Claims | Kostenlos, API | Quartal | **Globale Fruehwarnung fuer Finanzkrisen.** Funktioniert empirisch gut (1-3 Jahre Vorlauf) | [BIS EWI](https://www.bis.org/statistics/earlywarning.htm) |

> **Go-Adapter:** OFR hat eigene REST-API (~100 LoC neuer Connector). NFCI/STLFSI via FRED (Series-IDs). BIS EWI via BIS API (~80 LoC). ECB CISS via ECB SDW (SDMX-Client, Sek. 12.4 in go-research).

#### 3. NBFI / Shadow Banking -- Strukturelle Daten

| Quelle | Was sie liefert | Zugang | Frequenz | Lag | Link |
|---|---|---|---|---|---|
| **FSB Global Monitoring Report** | 29 Jurisdiktionen, NBFI Assets/Flows/Interconnectedness. **Beste globale Uebersicht** | Kostenlos, PDF + Excel | Jaehrlich | 18-24 Monate | [FSB NBFI](https://www.fsb.org/publications/?publication_type=Global-Monitoring-Report-on-Non-Bank-Financial-Intermediation) |
| **Fed Z.1 Flow of Funds** | Alle US-Finanzsektoren (inkl. NBFI). 100+ relevante Serien | Kostenlos, FRED | Quartal | 2-3 Monate | FRED: `BOGZ1...` Serien |
| **SEC Private Fund Statistics** | Aggregierte Hedge-Fund/PE/VC-Daten aus Form PF | Kostenlos, PDF + Excel | Quartal | 3-6 Monate | [SEC PFS](https://www.sec.gov/divisions/investment/private-funds-statistics.html) |
| **CFTC TFF** (Traders-in-Financial-Futures) | Woechentliches HF-Positioning in Futures. **Bester Echtzeit-Proxy** fuer Leveraged-Fund-Positioning | Kostenlos (Subset COT) | Woechentlich | 3 Tage | Erweiterung des bestehenden CFTC-Adapters |
| **FINRA Margin Statistics** | Total Debit Balances (Margin Debt). Leveraged-Long-Indikator | Kostenlos | Monatlich | 3-4 Wochen | [FINRA Margin](https://www.finra.org/investors/learn-to-invest/advanced-investing/margin-statistics) |
| **BIS OTC Derivatives Statistics** | $600T+ Notional aller OTC-Derivate. Interconnectedness-Signal | Kostenlos, API | Halbjaehrlich | 6 Monate | [BIS OTC](https://www.bis.org/statistics/derstats.htm) |
| **ISDA SwapsInfo** | CDS + Interest Rate Swap Volumes. CDS-Markt = Shadow Credit | Kostenlos | Woechentlich | Minimal | [ISDA SwapsInfo](https://swapsinfo.org/) |
| **SIFMA Issuance Data** | MBS, ABS, CLO, Corporate Bond Issuance | Teilweise kostenlos | Monatlich | 1-2 Monate | [SIFMA Stats](https://www.sifma.org/resources/research/us-fixed-income-issuance-and-outstanding/) |
| **Fed SLOOS** | Senior Loan Officer Survey: Credit Standards + Demand | Kostenlos | Quartal | Minimal | FRED: `DRTSCILM`, `DRTSCLCC` |

#### 4. Collateral / Rehypothecation -- Was NICHT messbar ist (ehrliche Einschaetzung)

> **Transparenz-Realitaet:** Das "Collateral Casino" (Rehypothecation-Ketten, Bilateral Repos, Securities Lending) ist der opakste Bereich. Es gibt **kein** vollstaendiges oeffentliches Monitoring.

| Was wir wissen wollen | Beste verfuegbare Quelle | Coverage | Problem |
|---|---|---|---|
| **Collateral Velocity** (wie oft wird Sicherheit wiederverwendet?) | Manmohan Singh / IMF Working Papers (akademisch, ~jaehrlich). Schaetzung: 2.5-3.0x | ~20% | Bilateral Repos nicht zentral reportiert. Nur Schaetzungen via Dealer-Bilanzen |
| **Rehypothecation-Ketten** | Indirekt via Primary Dealer Stats + Tri-Party | ~15% | Bilateral = per Definition keine zentrale Sichtbarkeit |
| **Private Credit** ($1.7T+) | Preqin / PitchBook ($$$$) | ~10% | Nahezu komplett opak. Keine Meldepflicht |
| **Securities Lending** | ISLA/Markit (kostenpflichtig). Fed SLB (nur Banken) | ~30% | Non-Bank Securities Lending = Blindspot |
| **CLO/ABS Live Performance** | Bloomberg/Intex ($$$). SIFMA nur Issuance | ~40% (Issuance) / ~10% (Performance) | Issuance-Daten ja, Live-Pricing nur via Terminal |
| **DeFi Lending** | DeFi Llama, Arkham (teilweise im Stack) | **~90%** | Paradoxerweise transparenter als TradFi Shadow Banking (on-chain!) |

> **Referenz-Paper:** Manmohan Singh (IMF) -- "Collateral and Finite Resources", "The (Sizable) Role of Rehypothecation in the Shadow Banking System". DER Experte fuer Collateral-Velocity. [IMF Working Papers](https://www.imf.org/en/Publications/Search?q=Manmohan+Singh+collateral)

#### 5. Basel-Regime-Intelligence (globaler Regulierungs-Layer)

> **Kausalkette:** Basel-Stringenz → NBFI-Wachstum. Wer den Regulierungsrahmen kennt, versteht wohin Kapital fliesst und wo systemische Risiken aufbauen.

**Autoritaive Quellen (Regime-Tracking):**

| Quelle | Was sie liefert | Zugang | Frequenz | Link |
|---|---|---|---|---|
| **BIS RCAP Dashboard** | Jurisdiction-by-jurisdiction Basel Assessment. Traffic-Light: Compliant / Largely Compliant / Materially Non-Compliant pro Komponente | Kostenlos | Bei Aenderung (unregelmaessig) | [BIS RCAP](https://www.bis.org/bcbs/implementation/rcap_jurisdictional.htm) |
| **BIS RCAP Reports** | Detaillierte Laenderberichte (Kapitalanforderungen, LCR, NSFR, Leverage Ratio, G-SIB/D-SIB) | Kostenlos, PDF | Pro Jurisdiktion | [BIS Implementation](https://www.bis.org/bcbs/implementation.htm) |
| **FSB Implementation Monitor** | Tracking aller G20-Finanzreformen (Basel + OTC-Derivate + NBFI + Resolution) | Kostenlos, PDF | Jaehrlich | [FSB Monitor](https://www.fsb.org/work-of-the-fsb/implementation-monitoring/) |
| **Basel Committee Progress Reports** | Halbjaehrlich, globaler Implementierungsstand | Kostenlos, PDF | Halbjaehrlich | [BCBS](https://www.bis.org/bcbs/publ/) |
| **EBA CRR III / CRD VI** | EU-spezifische Basel-Umsetzung, Uebergangsfristen, Output Floor | Kostenlos | Bei Aenderung | [EBA Basel](https://www.eba.europa.eu/regulation-and-policy/implementing-basel-iii-europe) |

**Laender-Regime-Uebersicht (statischer GeoMap-Layer):**

| Land | Basel-Status (2026) | Besonderheit | Trading-Relevanz |
|---|---|---|---|
| **USA** | ~Basel 2.5-3 (Endgame seit 2023 in Debatte, verwaeSSert) | Fed/OCC/FDIC streiten. Wall-Street-Lobby verwaeSSert. "Gold-Plating" bei G-SIB Surcharge, aber Standardansatz nicht implementiert | Jede Ankuendigung bewegt KBW Bank Index (BKX) |
| **Schweiz** | Basel III+ ("Swiss Finish") | Strengere Kapitalanforderungen. UBS TBTF-Surcharge besonders hoch nach CS-Uebernahme | FINMA-Ankuendigungen bewegen SIX-Bankentitel |
| **EU** | CRR III / CRD VI (Basel 3.1, ab Jan 2025) | Output Floor mit Uebergangsfristen bis 2032. SME-Supporting-Factor beibehalten | SX7E (Euro Banks Index) reagiert auf EBA-Announcements |
| **UK** | Basel 3.1 (PRA, ab Juli 2025) | Post-Brexit-Divergenz. "Strong and Simple" fuer kleine Banken | FTSE 350 Banks |
| **Japan** | Largely Compliant | Konservativ. Mega-Banks gut kapitalisiert | Wenig volatile Regulierungs-Debatte |
| **China** | Nominell compliant, in Praxis Luecken | Riesiger Shadow-Banking-Sektor (Trust Products, WMPs) umgeht Anforderungen | China-Banking-Krisen (Evergrande etc.) zeigen Papier-vs-Praxis-Luecke |
| **Indien** | Largely Compliant, einige Delays | RBI konservativ. Aber NBFCs = indisches Shadow Banking (IL&FS-Krise 2018) | NBFC-Regulierungs-Aenderungen bewegen Nifty Financial |
| **Singapur/HK** | Compliant bis Ueber-Compliant | Finanzplatz-Wettbewerb um "sauberste" Regulierung. Vorreiter Crypto-Basel | MAS-Announcements global beachtet |

> **GeoMap-Integration:** Basel-Regime als **statischer Heatmap-Layer** (Traffic-Light pro Land, aktualisiert bei Regime-Aenderung). Regulierungs-Announcements (Basel Endgame, CRR III Uebergangsfristen, FINMA TBTF-Review) als **Events** via RSS/Legal-Feeds.

#### Empfohlene Go-Adapter-Prioritaet (Financial Stability & NBFI)

| Prio | Adapter | Abdeckung | Aufwand | Begruendung |
|---|---|---|---|---|
| **S1** | **FRED Series-Erweiterung** (ON RRP, SOFR, TGA, Reserves, NFCI, SLOOS, Margin, Z.1) | Liquiditaets-Trifecta + Stress + Credit Cycle | Trivial (nur Series-IDs im bestehenden Adapter) | **Sofort umsetzbar, kein neuer Code.** ~15 Series-IDs ergaenzen |
| **S2** | **OFR Financial Stress Index API** | Bester Composite-Stress-Indikator, taeglich | Klein (~100 LoC, REST/JSON) | Eigene API, gut dokumentiert. Hoher Signal-Wert |
| **S3** | **NY Fed Markets API** (ON RRP Details, Tri-Party, PD Stats, Treasury Fails) | Repo-Markt-Tiefe die FRED nicht hat | Klein (~120 LoC, REST/JSON) | Ergaenzt FRED um intraday/granulare Repo-Daten |
| **S4** | **CFTC TFF Erweiterung** | Hedge-Fund-Positioning in Futures | Trivial (Erweiterung des geplanten CFTC-Adapters, Prio 9) | TFF = Subset des COT. Gleicher Adapter, anderes Report-Format |
| **S5** | **BIS Early Warning Indicators** | Globale Krisenfrueherkennung (Credit-to-GDP Gap, DSR) | Klein (~80 LoC, BIS API) | Empirisch bewiesenene 1-3 Jahre Vorlauf vor Finanzkrisen |
| **S6** | **ISDA SwapsInfo** | CDS + IRS Volumes, woechentlich | Klein (~80 LoC, REST) | CDS-Volumen-Aenderungen = Shadow-Credit-Stress-Proxy |
| **S7** | **BIS RCAP Dashboard** (Basel-Regime) | Regulierungs-Stringenz pro Land | Klein (~60 LoC, periodischer HTML/Excel-Parse) | Statischer Layer, seltene Updates. Basis fuer GeoMap-Heatmap |

> **Sofort ohne neuen Adapter (S1):** FRED Series-IDs fuer Liquiditaet, Stress und Credit-Cycle ergaenzen:
> - Liquiditaet: `RRPONTSYD` (ON RRP), `WTREGEN` (TGA), `TOTRESNS` (Reserves), `WRESBAL` (Reserve Balances)
> - Repo/Rates: `SOFR`, `SOFR30`, `SOFR90`, `EFFR` (Fed Funds)
> - Stress: `NFCI`, `ANFCI` (Adjusted NFCI), `STLFSI4`
> - Credit Cycle: `DRTSCILM` (SLOOS Tightening), `DRTSCLCC` (Consumer Credit Tightening), `BOGZ1FL664090005Q` (Shadow Banking Credit)
> - Margin: Nicht direkt in FRED -- FINRA Margin als separater Klein-Adapter (~40 LoC, monatlicher CSV-Download)

---

### NEUE Quellen: Legal & Regulatory Intelligence (NEU 2026-02-22)

> **Kontext:** Gerichts- und Regulierungs-Entscheide sind Fruehwarnsignale fuer Marktbewegungen -- Crypto-Regulierung, Bankrecht, Sanktionsdurchsetzung, Steuerrecht, Kapitalverkehr. Integration ueber UIL (Micro-Kategorie `sanctions` + neue Kategorie `legal_ruling`) und GeoMap (`gavel`-Icon).
> **Architektur-Fit:** Go-Adapter fuer strukturierte APIs; Python LLM-Pipeline fuer Volltext-Analyse (BTE-Patterns in Urteilsbegruendungen). Langfristig: Knowledge Graph (MEMORY_ARCHITECTURE.md Sek. 5.2) fuer Praezedenzfall-Verkettung.

#### Schweiz: Bundesgericht + Rechtsportale

> **Hintergrund:** Das Bundesgericht bietet keine direkte REST-API. Zugang erfolgt ueber Open-Data-Datensaetze, Drittplattform-APIs oder Web-Schnittstellen. Alle veroeffentlichten Urteile sind anonymisiert (teils KI-gestuetzt).

**Strukturierte Datensaetze (Open Data):**

| Quelle | Was sie liefert | Zugang | Format | Go-Aufwand | Link |
|---|---|---|---|---|---|
| **Swiss Federal Supreme Court Dataset (SCD)** | 120'000+ Urteile (2007-heute), 31 Variablen (Metadaten + Rohtexte) | Kostenlos, kein Key | CSV, SQLite | Klein (~100 LoC, CSV/SQLite Parse + Cron) | [ETH Research Collection](https://www.research-collection.ethz.ch/), [Kaggle](https://www.kaggle.com/datasets/unibe-lds/swiss-federal-supreme-court-dataset) |
| **Opendata.swiss (Bund)** | Juristische Metadaten via Schweizerisches Bundesarchiv (BAR), weitere Bundes-Datensaetze | Kostenlos, kein Key | DCAT-AP, JSON/CSV | Klein (REST/JSON) | [opendata.swiss](https://opendata.swiss/) |
| **Fedlex (Bundesrecht)** | Gesamtes Schweizer Bundesrecht, Systematische Rechtssammlung, SPARQL-Endpoint | Kostenlos, kein Key, CC0 | RDF/SPARQL, XML (Akoma Ntoso), JSON-LD | Mittel (~150 LoC, SPARQL-Client) | [fedlex.admin.ch](https://www.fedlex.admin.ch/), [SPARQL-API](https://fedlex.data.admin.ch/en-US/sparql) |

**API-Zugriff ueber Drittplattformen:**

| Quelle | Was sie liefert | Zugang | Besonderheit | Link |
|---|---|---|---|---|
| **Open Legal Data (openlegaldata.io)** | Urteile in maschinenlesbarer Form, Schweiz + Deutschland + EU | REST-API, kostenlos (Rate-Limits) | JSON-Output, gut strukturiert, Open Source | [openlegaldata.io](https://openlegaldata.io/), [API-Docs](https://de.openlegaldata.io/api/) |
| **LeReTo** | Legal Reference Tool -- Vernetzung Schweizer Rechtsquellen, Zitationsanalyse | Web-Interface, teilweise API | Akademisches Projekt (Uni Bern), Referenz-Graph zwischen Entscheiden | [lereto.ch](https://lereto.ch/) |
| **Lawsearch / Weblaw** | Groesster Bestand Schweizer Urteile, Enterprise-Schnittstellen | Kostenpflichtig (Enterprise-API) | Professionelle Plattform; API auf Anfrage fuer Unternehmen | [lawsearch.ch](https://www.lawsearch.ch/) |
| **Entscheidsuche.ch** | Schweizer Gerichtsentscheide aller Instanzen (Bund + Kantone), Volltextsuche | Web-Interface, kostenlos | Community-Projekt, breite Abdeckung (nicht nur Bundesgericht) | [entscheidsuche.ch](https://entscheidsuche.ch/) |

**Web-Schnittstellen (kein API, Scraping/manuell):**

| Quelle | Was sie liefert | Zugang | Link |
|---|---|---|---|
| **bger.ch Urteilsdatenbank** | Offizielle Volltextsuche Bundesgericht | Web-Interface, kein API-Export | [bger.ch](https://www.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?lang=de) |
| **Relevancy-Suche** | Einzelne Urteile ueber URL-Parameter ansteuerbar | `http://relevancy.bger.ch/[Datum]_[Dossiernummer]` | [relevancy.bger.ch](http://relevancy.bger.ch/) |

> **Datenschutz-Hinweis:** Alle Bundesgericht-Urteile werden vor Publikation anonymisiert (teils KI-gestuetzt). Fuer Weiterverarbeitung im Knowledge Graph relevant: Anonymisierung muss nicht nochmals erfolgen, aber Entity-Extraktion (z.B. beteiligte Firmen bei Wirtschaftsurteilen) ist eingeschraenkt.

#### EU: Gerichtshoefe + Regulierung

| Quelle | Was sie liefert | Zugang | Format | Go-Aufwand | Link |
|---|---|---|---|---|---|
| **EUR-Lex** | EU-Gesetzgebung, EuGH-Urteile, Richtlinien, Verordnungen | Kostenlos, REST-API, kein Key noetig | XML (Formex/Akoma Ntoso), JSON, RDF/SPARQL | Mittel (~150 LoC) | [eur-lex.europa.eu](https://eur-lex.europa.eu/), [API](https://eur-lex.europa.eu/content/help/eurlex-content/search-and-download-api.html) |
| **HUDOC (EGMR)** | Urteile des Europaeischen Gerichtshofs fuer Menschenrechte | Kostenlos, REST-API | JSON, gut dokumentiert | Klein (~80 LoC) | [hudoc.echr.coe.int](https://hudoc.echr.coe.int/), [API](https://hudoc.echr.coe.int/eng#{%22documentcollectionid2%22:[%22JUDGMENTS%22]}) |
| **ESMA (Europ. Wertpapieraufsicht)** | Regulierungsentscheide, Warnungen, Register (MiFID, EMIR) | Kostenlos, REST-API | JSON/XML | Klein (~80 LoC) | [esma.europa.eu](https://www.esma.europa.eu/databases-library/registers-and-data) |

#### USA: Courts + Financial Regulators

| Quelle | Was sie liefert | Zugang | Format | Go-Aufwand | Link |
|---|---|---|---|---|---|
| **CourtListener / RECAP** | US Federal Courts (inkl. Supreme Court), 80M+ Dokumente, REST-API | Kostenlos, API-Key (free), Rate-Limits | JSON, Bulk-Data | Klein (~100 LoC) | [courtlistener.com](https://www.courtlistener.com/), [API-Docs](https://www.courtlistener.com/help/api/) |
| **Supreme Court API (oyez.org)** | US Supreme Court Urteile, Audio, Metadaten | Kostenlos | JSON | Trivial | [api.oyez.org](https://api.oyez.org/) |
| **SEC Administrative Proceedings** | Enforcement Actions, Sanktionen gegen Firmen/Personen | Kostenlos, EDGAR RSS + Full-Text Search | XML/RSS, HTML | Klein (~100 LoC, RSS-Feed + Parser) | [sec.gov/litigation](https://www.sec.gov/litigation/admin.htm), [EDGAR](https://efts.sec.gov/LATEST/search-index?q=%22administrative%20proceeding%22) |
| **CFTC Enforcement** | Futures/Derivatives-Enforcement, Strafen, Verbote | Kostenlos | HTML/RSS | Klein | [cftc.gov/enforcement](https://www.cftc.gov/LawRegulation/Enforcement/index.htm) |

#### UK + Deutschland: Regulatoren

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **UK National Archives (Caselaw)** | UK Court Decisions, maschinenlesbar ab 2001 | Kostenlos, API | XML (Akoma Ntoso), JSON | [caselaw.nationalarchives.gov.uk](https://caselaw.nationalarchives.gov.uk/), [API](https://caselaw.nationalarchives.gov.uk/structured-search) |
| **FCA (UK Financial Conduct Authority)** | Enforcement Decisions, Warnungen, Register | Kostenlos | HTML/RSS | [fca.org.uk](https://www.fca.org.uk/news/search-results?search_term=&np_category=enforcement) |
| **BaFin (DE Finanzaufsicht)** | Sanktionen, Warnungen, Verbotsverfuegungen | Kostenlos | HTML/RSS | [bafin.de](https://www.bafin.de/SiteGlobals/Forms/Suche/Servicesuche_Formular.html?cl2Categories_Typ=Sanktion) |

#### Schweiz: Finanzmarktaufsicht + Crypto-spezifisch

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **FINMA (Eidg. Finanzmarktaufsicht)** | Enforcement-Entscheide, Bewilligungen, Warnlisten, Crypto-Token-Klassifizierung | Kostenlos, Web + PDF | HTML, PDF | [finma.ch](https://www.finma.ch/de/durchsetzung/enforcement-verfahren/) |
| **FINMA ICO/Crypto Guidelines** | Wegleitungen zu Token-Klassifizierung, Stablecoin-Regulierung | Kostenlos, PDF | PDF | [finma.ch/de/finma-public/](https://www.finma.ch/de/dokumentation/finma-aufsichtsmitteilungen/) |
| **SIF (Staatssekretariat fuer internationale Finanzfragen)** | Internationale Finanzpolitik CH, Sanktionslisten, DBA-Verhandlungen | Kostenlos | HTML | [sif.admin.ch](https://www.sif.admin.ch/) |
| **SECO Sanktionslisten** | Schweizer Umsetzung internationaler Sanktionen (UN, EU), XML-Download | Kostenlos, XML-Download | XML (maschinenlesbar!) | [seco.admin.ch](https://www.seco.admin.ch/seco/de/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/sanktionen-embargos.html) |

#### Asien-Pazifik: Gerichte + Finanzregulatoren

> **Warum relevant:** Asien ist der groesste Wachstumsmarkt (China, Indien, ASEAN). Crypto-Regulierung variiert extrem (Japan progressiv, China Verbot, Singapur Lizenz-Modell). Handelsrecht-Aenderungen (z.B. Indiens SEBI-Reformen, Chinas CSRC) bewegen globale Maerkte direkt.

**Japan:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **Courts in Japan (裁判所)** | Urteile des Obersten Gerichtshofs + untergeordnete Gerichte, Englisch teilweise verfuegbar | Kostenlos, Web-Suche | HTML | [courts.go.jp](https://www.courts.go.jp/english/index.html), [Urteilssuche](https://www.courts.go.jp/app/hanrei_en/search) |
| **EDINET (Electronic Disclosure)** | Pflichtmeldungen boersennotierter Firmen (10-K Aequivalent), XBRL | Kostenlos, REST-API | XBRL, JSON | [disclosure.edinet-fsa.go.jp](https://disclosure.edinet-fsa.go.jp/), [API-Docs](https://disclosure.edinet-fsa.go.jp/E01EW/download?1009=api) |
| **FSA Japan (金融庁)** | Finanzregulierer: Enforcement Actions, Crypto-Exchange-Lizenzen, Policy Statements | Kostenlos | HTML, teilweise EN | [fsa.go.jp/en](https://www.fsa.go.jp/en/) |
| **JFSA IOSCO Crypto Framework** | Japans Crypto-Regulierungsrahmen (weltweit Vorreiter seit 2017) | Kostenlos | PDF | [fsa.go.jp/en/refer/crypto](https://www.fsa.go.jp/en/refer/councils/virtual-currency/) |

**China:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **China Judgments Online (裁判文书网)** | Groesste Urteilsdatenbank weltweit: 130M+ Dokumente, alle Instanzen | Kostenlos, Web-Suche (nur Chinesisch) | HTML | [wenshu.court.gov.cn](https://wenshu.court.gov.cn/) |
| **CSRC (中国证监会)** | Wertpapieraufsicht: Enforcement, Listings, Policy. Bewegt A-Shares direkt | Kostenlos | HTML (CN + teilweise EN) | [csrc.gov.cn](http://www.csrc.gov.cn/csrc/c100220/common_list.shtml) |
| **PBoC Announcements** | Zentralbank-Policy, Crypto-Verbote, Kapitalverkehrs-Regulierung | Kostenlos | HTML (CN) | [pbc.gov.cn](http://www.pbc.gov.cn/en/3688006/index.html) |
| **PKULaw (北大法宝)** | Umfassendste chinesische Rechtsdatenbank (kommerziell), Free-Basis-Zugang | Teilweise kostenlos | HTML | [pkulaw.com](https://www.pkulaw.com/) |

> **China-Hinweis:** Hauptschwierigkeit ist Sprache (Mandarin). Go-Adapter braucht UTF-8 + ggf. Uebersetzungs-Pipeline (Python LLM). `wenshu.court.gov.cn` hat Anti-Scraping-Massnahmen -- strukturierter Zugang nur ueber PKULaw oder AsianLII.

**Indien:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **Indian Kanoon** | Supreme Court + High Courts + Tribunale, Volltextsuche, 90M+ Seiten | Kostenlos, inoffizielle API verfuegbar | HTML, JSON (inoffiziell) | [indiankanoon.org](https://indiankanoon.org/), [API](https://api.indiankanoon.org/doc/) |
| **Supreme Court of India** | Offizielle Urteile, Daily Orders, Cause Lists | Kostenlos | HTML, PDF | [sci.gov.in](https://www.sci.gov.in/) |
| **SEBI (Securities and Exchange Board)** | Enforcement Orders, Circulars, Informal Guidance. Bewegt NSE/BSE direkt | Kostenlos | HTML, PDF | [sebi.gov.in](https://www.sebi.gov.in/enforcement.html) |
| **RBI Notifications** | Zentralbank-Circulars, Forex-Regulierung, Crypto-Stance | Kostenlos | HTML, PDF | [rbi.org.in](https://www.rbi.org.in/Scripts/NotificationUser.aspx) |

**Suedkorea:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **Korean Legal Information Institute (KLII)** | Gesetze + Urteile, Englisch verfuegbar | Kostenlos | HTML | [law.go.kr](https://www.law.go.kr/LSW/eng/engMain.do) |
| **FSC/FSS Korea** | Finanzaufsicht: Crypto-Regulierung (VASP-Lizenz seit 2023), Enforcement | Kostenlos | HTML (KR + EN) | [fsc.go.kr/eng](https://www.fsc.go.kr/eng/index) |

**Singapur + Hongkong:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **Singapore Supreme Court (eLitigation)** | Court Judgments, Practice Directions | Kostenlos (Judgments), eLitigation teilweise kostenpflichtig | HTML, PDF | [judiciary.gov.sg](https://www.judiciary.gov.sg/judgments) |
| **MAS (Monetary Authority of Singapore)** | Finanzaufsicht + Zentralbank: Crypto-Lizenzen (Payment Services Act), Enforcement | Kostenlos | HTML | [mas.gov.sg](https://www.mas.gov.sg/regulation/enforcement) |
| **HKLII (Hong Kong LII)** | HK Court Judgments, Ordinances, 200k+ Dokumente | Kostenlos | HTML | [hklii.hk](https://www.hklii.hk/) |
| **SFC Hong Kong** | Securities and Futures Commission: Enforcement, Crypto-Regulierung (VATP-Regime) | Kostenlos | HTML | [sfc.hk](https://www.sfc.hk/en/Regulatory-functions/Enforcement) |

**Australien + Neuseeland:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **AustLII** | Groesste frei zugaengliche Rechtsdatenbank Australiens: High Court, Federal Court, alle States | Kostenlos | HTML | [austlii.edu.au](http://www.austlii.edu.au/) |
| **ASIC (Australian Securities)** | Enforcement, Crypto-Exchange-Regulierung, Market Integrity Rules | Kostenlos | HTML, RSS | [asic.gov.au](https://asic.gov.au/about-asic/news-centre/find-a-media-release/?filter=enforcement) |
| **NZLII** | Neuseeland: Court Decisions, Acts, Regulations | Kostenlos | HTML | [nzlii.org](http://www.nzlii.org/) |
| **FMA New Zealand** | Financial Markets Authority: Enforcement, Crypto-Provider-Register | Kostenlos | HTML | [fma.govt.nz](https://www.fma.govt.nz/library/enforcement-actions/) |

#### Lateinamerika: Gerichte + Finanzregulatoren

> **Warum relevant:** Brasilien (Bovespa) und Mexiko (BMV) sind grosse Emerging Markets. Argentiniens Kapitalverkehrskontrollen und Crypto-Adoption (Peso-Flucht) sind direkte Trading-Signale. El Salvador Bitcoin Legal Tender hat globale Praezedenzwirkung.

**Brasilien:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **STF (Supremo Tribunal Federal)** | Oberstes Bundesgericht, Volltextsuche, Portugiesisch | Kostenlos, Web-Suche + teilweise API | HTML, PDF | [portal.stf.jus.br](https://portal.stf.jus.br/jurisprudencia/) |
| **CVM (Comissão de Valores Mobiliários)** | Brasilianische SEC: Enforcement, Crypto-Regulierung, Bovespa-Regeln | Kostenlos | HTML (PT) | [gov.br/cvm](https://www.gov.br/cvm/pt-br/assuntos/noticias/decisoes-do-colegiado) |
| **BCB (Banco Central do Brasil)** | Zentralbank: Normativos, Crypto-Stance, Pix-Regulierung, Kapitalverkehr | Kostenlos, API vorhanden | JSON, HTML | [bcb.gov.br](https://www.bcb.gov.br/en/legalframework/normativeinstruments) |

**Mexiko:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **SCJN (Suprema Corte)** | Oberstes Gericht Mexiko, Urteile + Theses | Kostenlos | HTML (ES) | [scjn.gob.mx](https://www.scjn.gob.mx/sentencias-lista) |
| **CNBV** | Wertpapieraufsicht + FinTech-Regulierung (FinTech-Gesetz 2018, Crypto-Regeln) | Kostenlos | HTML (ES) | [gob.mx/cnbv](https://www.gob.mx/cnbv) |
| **Banxico** | Zentralbank: Policy, FX-Regulierung | Kostenlos | HTML | [banxico.org.mx](https://www.banxico.org.mx/indexEn.html) |

**Argentinien + Chile + Kolumbien:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **CSJN Argentinien** | Oberstes Gericht, Fallos-Datenbank | Kostenlos | HTML (ES) | [csjn.gov.ar](https://sj.csjn.gov.ar/sj/) |
| **CNV Argentinien** | Wertpapieraufsicht: Crypto-Regulierung, Kapitalverkehrskontrollen | Kostenlos | HTML (ES) | [argentina.gob.ar/cnv](https://www.argentina.gob.ar/cnv) |
| **CMF Chile** | Comision para el Mercado Financiero: Enforcement, FinTech-Gesetz (2023) | Kostenlos | HTML (ES) | [cmfchile.cl](https://www.cmfchile.cl/portal/principal/613/w3-propertyname-702.html) |
| **SFC Kolumbien** | Superintendencia Financiera: Banking + Securities Enforcement | Kostenlos | HTML (ES) | [superfinanciera.gov.co](https://www.superfinanciera.gov.co/) |

> **Lateinamerika-Hinweis:** Hauptsprache Spanisch/Portugiesisch. El Salvadors Bitcoin-Gesetzgebung (2021) und Argentiniens Crypto-Regulierung unter Milei sind besonders marktrelevant. Go-Adapter: RSS-Feeds wo verfuegbar, sonst periodischer Web-Fetch + LLM-Uebersetzung.

#### Afrika + Naher Osten: Gerichte + Finanzregulatoren

> **Warum relevant:** Naher Osten (Dubai DIFC, Abu Dhabi ADGM) sind neue Crypto-Hubs mit eigener Jurisdiktion. Suedafrika (JSE) ist der groesste afrikanische Markt. Nigeria hat 2024 Crypto reguliert. Saudi-Arabien (Tadawul, Vision 2030) oeffnet sich fuer auslaendische Investoren.

**Naher Osten:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **DIFC Courts (Dubai)** | Eigenstaendige Common-Law-Jurisdiktion, Urteile in Englisch, relevant fuer Finanzstreitigkeiten | Kostenlos | HTML, PDF | [difccourts.ae](https://www.difccourts.ae/rules-decisions/judgments-orders) |
| **ADGM Courts (Abu Dhabi)** | Eigenstaendige Common-Law-Jurisdiktion, Crypto-Framework (FSRA-Regulierung) | Kostenlos | HTML, PDF | [adgm.com](https://www.adgm.com/setting-up/courts) |
| **DFSA (Dubai Financial Services Authority)** | Enforcement, Crypto-Token-Regulierung, Fund-Lizenzen | Kostenlos | HTML | [dfsa.ae](https://www.dfsa.ae/Your-Resources/Regulatory-Actions) |
| **CMA Saudi-Arabien** | Capital Markets Authority: Enforcement, Tadawul-Regeln, REIT-Regulierung | Kostenlos | HTML (AR + EN) | [cma.org.sa](https://cma.org.sa/en/RulesRegulations/Pages/default.aspx) |

**Afrika:**

| Quelle | Was sie liefert | Zugang | Format | Link |
|---|---|---|---|---|
| **AfricanLII** | Pan-afrikanische Rechtsdatenbank: 16 Laender, Court Decisions, Legislation | Kostenlos | HTML | [africanlii.org](https://africanlii.org/) |
| **SAFLII (South Africa)** | Constitutional Court, Supreme Court of Appeal, alle Divisionen, umfangreich | Kostenlos | HTML | [saflii.org](http://www.saflii.org/) |
| **FSCA (South Africa)** | Financial Sector Conduct Authority: Enforcement, Crypto-Regulierung (FAIS) | Kostenlos | HTML | [fsca.co.za](https://www.fsca.co.za/Enforcement-Matters/Pages/default.aspx) |
| **Kenya Law** | Kenya Court Decisions, Acts, Legal Notices | Kostenlos | HTML, PDF | [kenyalaw.org](http://kenyalaw.org/caselaw/) |
| **CMA Kenya** | Capital Markets Authority: Enforcement, Sandbox (Crypto/FinTech) | Kostenlos | HTML | [cma.or.ke](https://www.cma.or.ke/) |
| **SEC Nigeria** | Securities and Exchange Commission: Crypto-Regulierung (VASP-Framework 2024), Enforcement | Kostenlos | HTML | [sec.gov.ng](https://sec.gov.ng/) |

> **Afrika-Hinweis:** AfricanLII ist der beste Einstiegspunkt (wie AustLII fuer Australien). Nigeria und Kenya haben aktive Crypto-Regulierung. Suedafrikas FSCA hat Crypto als "Financial Product" klassifiziert (2022).

#### Uebergreifend: Legal-Tech-Aggregatoren, LII-Netzwerk + Forschung

> **Das LII-Netzwerk (Legal Information Institutes)** ist das globale Rueckgrat fuer freien Zugang zu Rechtsinformationen. Jede Region hat ein eigenes LII-Portal -- alle kostenlos, alle von Universitaeten/NGOs betrieben.

**Regionale LII-Portale (Free Access to Law Movement):**

| Portal | Region / Abdeckung | Besonderheit | Link |
|---|---|---|---|
| **WorldLII** | 123 Laender, 2000+ Datenbanken | Meta-Suche ueber alle LII-Portale | [worldlii.org](http://www.worldlii.org/) |
| **AustLII** | Australien (alle Instanzen) | Aeltestes und groesstes nationales LII | [austlii.edu.au](http://www.austlii.edu.au/) |
| **HKLII** | Hongkong | 200k+ Dokumente | [hklii.hk](https://www.hklii.hk/) |
| **AsianLII** | 28 asiatische Jurisdiktionen | Inkl. China, Japan, Korea, Indien, ASEAN | [asianLII.org](http://www.asianlii.org/) |
| **AfricanLII** | 16 afrikanische Laender | Groesste freie afrikanische Rechtsdatenbank | [africanlii.org](https://africanlii.org/) |
| **PacificLII** | Pazifische Inselstaaten | 20 Jurisdiktionen (Fidschi, Samoa, Tonga, etc.) | [paclii.org](http://www.paclii.org/) |
| **CommonLII** | Commonwealth-Laender | Ueberschneidung mit nationalen LIIs, aber mit gemeinsamer Suche | [commonlii.org](http://www.commonlii.org/) |
| **BAILII** | UK + Irland | British and Irish Legal Information Institute | [bailii.org](https://www.bailii.org/) |
| **CanLII** | Kanada | Urteile + Gesetzgebung aller Provinzen | [canlii.ca](https://www.canlii.org/) |
| **NZLII** | Neuseeland | Urteile, Acts, Regulations | [nzlii.org](http://www.nzlii.org/) |
| **SAfLII** | Suedafrika | Alle Gerichte inkl. Constitutional Court | [saflii.org](http://www.saflii.org/) |
| **Indian Kanoon** | Indien | 90M+ Seiten, inoffizielle API | [indiankanoon.org](https://indiankanoon.org/) |

**Weitere uebergreifende Quellen:**

| Quelle | Was sie liefert | Zugang | Besonderheit | Link |
|---|---|---|---|---|
| **Free Law Project (CourtListener)** | Open-Source Legal-Data-Infrastruktur, US-fokussiert, Bulk-Data | Kostenlos, Open Source | Betreibt auch RECAP (PACER-Dokumente befreit) | [free.law](https://free.law/) |
| **Global Legal Monitor (Library of Congress)** | Gesetzesaenderungen weltweit, 200+ Jurisdiktionen | Kostenlos | HTML/RSS -- bester einzelner Feed fuer globale Legal-Events | [loc.gov/collections/global-legal-monitor](https://www.loc.gov/collections/global-legal-monitor/) |
| **OECD Legal Instruments** | Internationale Abkommen, Recommendations, Decisions | Kostenlos | HTML/PDF | [legalinstruments.oecd.org](https://legalinstruments.oecd.org/) |
| **IOSCO (International Organization of Securities Commissions)** | Standards fuer Wertpapieraufsicht weltweit, Policy Reports, Crypto-Framework | Kostenlos | PDF, HTML | [iosco.org](https://www.iosco.org/library/index.cfm) |
| **FATF (Financial Action Task Force)** | AML/CFT-Standards, Laender-Evaluationen, Crypto Travel Rule | Kostenlos | PDF, HTML | [fatf-gafi.org](https://www.fatf-gafi.org/en/publications.html) |
| **FSB (Financial Stability Board)** | Globale Finanzstabilitaet, Crypto-Asset-Framework, Systemrisiko-Reports | Kostenlos | PDF | [fsb.org](https://www.fsb.org/publications/) |
| **BIS (Bank for International Settlements)** | Zentralbank-Standards, Basel-Framework, CBDC-Reports | Kostenlos | PDF, API | [bis.org](https://www.bis.org/publ/index.htm) |
| **UN Trade Law (UNCITRAL)** | Internationales Handelsrecht, Model Laws, Arbitration | Kostenlos | HTML/PDF | [uncitral.un.org](https://uncitral.un.org/) |

#### Empfohlene Go-Adapter-Prioritaet (Legal & Regulatory)

| Prio | Adapter | Abdeckung | Aufwand | Begruendung |
|---|---|---|---|---|
| **L1** | **SECO Sanktionslisten** | CH-Sanktionen (XML), direkt in GeoMap-Sanctions-Layer | Klein (~80 LoC, XML-Parse + Cron) | Maschinenlesbar, direkt in bestehendes Sanctions-System integrierbar (Masterplan Sek. 17) |
| **L2** | **Open Legal Data API** | CH + DE + EU Urteile, JSON | Klein (~100 LoC, REST/JSON) | Einzige kostenlose REST-API fuer Schweizer Urteile. Sofort nutzbar |
| **L3** | **SCD Bundesgericht (ETH/Kaggle)** | 120k+ Urteile historisch, CSV/SQLite | Klein (~100 LoC, CSV + periodischer Bulk-Import) | Groesster offener Datensatz, ideal fuer historische Analyse + Knowledge Graph Training |
| **L4** | **SEC Enforcement RSS** | US Financial Enforcement Actions | Klein (~80 LoC, RSS-Feed) | Direkt marktrelevant (Aktien reagieren auf SEC-Aktionen). RSS-Parsing existiert bereits |
| **L5** | **EUR-Lex API** | EU-Gesetzgebung + EuGH-Urteile | Mittel (~150 LoC, REST+XML) | Breite Abdeckung fuer EU-Regulierung; relevant fuer Euro-Assets |
| **L6** | **CourtListener API** | US Federal Courts, 80M+ Dokumente | Klein (~100 LoC, REST/JSON) | Gut dokumentiert, hoher Wert fuer US-marktrelevante Urteile |
| **L7** | **Fedlex SPARQL** | Schweizer Bundesrecht komplett | Mittel (~150 LoC, SPARQL-Client) | Legislativ (nicht nur Urteile) -- fuer Gesetzesaenderungs-Tracking |
| **L8** | **Global Legal Monitor RSS** | Gesetzesaenderungen weltweit, 200+ Jurisdiktionen | Trivial (RSS) | Breiter Ueberblick, ideal als GeoMap-Feed |
| **L9** | **AsianLII** | 28 asiatische Jurisdiktionen, zentrale Suche | Klein (~100 LoC, HTML-Parse) | Groesster freier Zugang zu asiatischem Recht; deckt China, Japan, Korea, Indien, ASEAN |
| **L10** | **SEBI + RBI RSS (Indien)** | Indische Finanzaufsicht + Zentralbank-Circulars | Klein (~80 LoC, RSS) | NSE/BSE reagieren direkt auf SEBI-Orders; RBI fuer INR/Forex-Regulierung |
| **L11** | **AfricanLII + SAFLII** | 16 afrikanische Laender + Suedafrika komplett | Klein (~100 LoC, HTML-Parse) | Wichtigster Zugang fuer afrikanisches Recht; JSE-relevant |
| **L12** | **DIFC + ADGM Courts** | Dubai/Abu Dhabi Finanz-Jurisdiktionen (Englisch) | Klein (~80 LoC, HTML) | Crypto-Hub-Regulierung; englischsprachig = kein Uebersetzungsbedarf |
| **L13** | **FATF + IOSCO Publications** | Globale AML/Crypto-Standards, Laender-Evaluationen | Klein (~80 LoC, RSS/PDF-Parse) | Laender-Ratings (Greylist/Blacklist) bewegen Maerkte; Crypto Travel Rule |
| **L14** | **CVM + BCB Brasilien** | Brasilianische SEC + Zentralbank-API | Klein (~100 LoC, REST/JSON fuer BCB) | Groesster Latam-Markt; BCB hat gute JSON-API |
| **L15** | **FSA Japan (Enforcement)** | Japanische Finanzaufsicht, Crypto-Exchange-Lizenzen | Klein (~80 LoC, HTML) | Japan = aelteste Crypto-Regulierung; Mt. Gox-Praezedenz |
| **L16** | **MAS Singapore (Enforcement)** | Monetary Authority: Crypto-Lizenzen, Enforcement | Klein (~80 LoC, HTML) | Singapur = wichtigster Crypto-Hub Asiens |

> **Sprach-Strategie fuer nicht-englische Quellen:**
> - **Tier 1 (Englisch nativ):** USA, UK, Australien, Singapur, DIFC/ADGM, Indien, HKLII, CanLII -- direkt in Go-Adapter
> - **Tier 2 (Englisch verfuegbar):** Japan (FSA EN-Seite), Korea (KLII EN), EU (EUR-Lex EN), Brasilien (BCB EN) -- EN-Version bevorzugen
> - **Tier 3 (Uebersetzung noetig):** China (wenshu.court.gov.cn), Lateinamerika (ES/PT), arabische Quellen -- Go fetcht Rohtext, Python LLM-Pipeline uebersetzt + extrahiert
>
> **GeoMap-Integration:** Jede Legal-Quelle wird einer GeoMap-Region zugeordnet. `gavel`-Events erscheinen auf der Karte am Jurisdiktions-Standort. FATF-Greylist-Aenderungen erzeugen globale Events (multi-country).

> **LLM-Pipeline-Kontext (Python):** Urteilstexte sind ideal fuer BTE-Analyse (Behavior Ops Manual):
> - **Urteilsbegruendungen** enthalten Framing-Patterns die Politikrichtung signalisieren
> - **Dissenting Opinions** signalisieren Instabilitaet in der Rechtsprechung (Regime-Shift-Kandidat)
> - **FINMA Enforcement-Sprache** kann ueber Sentiment-Shift die Regulierungs-Temperatur messen
>
> **Knowledge-Graph-Kontext (MEMORY_ARCHITECTURE.md Sek. 5.2):** Praezedenzfall-Ketten als relationale Knoten: `Urteil_A → zitiert → Urteil_B → widerspricht → Urteil_C`. Ermoeglicht automatische Erkennung von Rechtsprechungsaenderungen.

---

### NEUE Quellen: Web3 Oracle Networks -- Dezentrale Preis-Verifikation (NEU 2026-02-22)

> **Kontext:** Web3-Oracle-Netzwerke aggregieren Echtzeit-Preisdaten (Crypto, FX, Commodities, Equities, Indices) aus dutzenden unabhaengigen Quellen mit eingebauter Median-Aggregation, Deviation-Thresholds und Manipulations-Erkennung. Sie sind keine reinen "Crypto-Quellen" -- Chainlink liefert z.B. CHF/USD ueber 17 unabhaengige Oracle-Operators mit 0.15% Deviation-Schwelle. Pyth Network wird von institutionellen Market Makern (Jump Trading, Jane Street, Wintermute, Flow Traders) gespeist.
> **Motivation (Entropy Network Parallel):** Die Architektur dieser Oracle-Netzwerke loest exakt das Problem das unser Data Router loest -- Multi-Source-Aggregation + Verifikation + Fallback. Der Unterschied: Oracle Networks operieren dezentral on-chain mit kryptographischer Verifizierung, waehrend unser Router zentral in Go laeuft. Fuer uns sind sie eine **zusaetzliche, unabhaengige Verifikationsschicht** fuer Preise die wir bereits von Web2-APIs (Finnhub, Polygon, etc.) holen.
> **Architektur-Fit:** Neue Quellen-Gruppe **G10: Oracle Networks** im Go-Router (siehe go-research Sek. 12). Chainlink/Pyth-Feeds lesen ist kostenlos (On-Chain Read oder REST-Gateway). Kein API-Key noetig.
> **Referenz:** UVD Whitepaper (Kiyan Sasan, uvd.money) Sek. 3.3: "A decentralised oracle mechanism supplies or aggregates these values" + Sek. 8.1: "Mitigations include multiple independent data sources, median or consensus aggregation, time-weighted averages."

#### 1. Oracle-Netzwerke als Datenquellen

| Oracle Network | Was es liefert | Publisher/Operators | Feeds | Zugang | Besonderheit | Link |
|---|---|---|---|---|---|---|
| **Chainlink Data Feeds** | Crypto, FX (CHF/USD, SGD/USD, EUR/USD, GBP/USD, JPY/USD, etc.), Commodities (XAU/USD, Oel), Equity Indices, Interest Rates | 17+ unabhaengige Oracle Operators (Chainlayer, Blockdaemon, LinkPool, P2P.org, etc.) | 1000+ Feeds, Ethereum + L2s | Kostenlos (On-Chain Read) | **De-facto Standard.** Risk-Klassifizierung (Low/Medium/High Market Risk). TWAP + Median-Aggregation. CHF/USD: 0.15% Deviation, 17 Operators | [docs.chain.link/data-feeds](https://docs.chain.link/data-feeds), [data.chain.link](https://data.chain.link/) |
| **Pyth Network** | Crypto, FX, Commodities, Equities | 120+ First-Party Publisher (Jump Trading, Jane Street, Wintermute, Flow Traders, Two Sigma Securities) | 295+ aktive Feeds | Kostenlos (REST oder On-Chain) | **Sub-Sekunde Latenz.** Publisher sind echte Market Maker/Institutionelle -- nicht Aggregatoren, sondern Primaerquellen. 107+ Blockchains | [pyth.network](https://pyth.network/), [Publisher Ranking](https://www.pyth.network/publishers/ranking) |
| **Band Protocol** | Crypto, FX, Commodities | Validatoren-Netzwerk, 80+ Nodes | 200+ Feeds | Kostenlos (REST-Gateway) | Cross-Chain, REST-freundlicher als Chainlink. Cosmos-basiert | [bandprotocol.com](https://www.bandprotocol.com/) |
| **Redstone Finance** | Crypto, FX, Commodities, RWA (Real World Assets) | 10+ Publisher | 1000+ Feeds | Kostenlos (REST oder On-Chain) | Modulares Push/Pull-Modell. Guenstiger als Chainlink fuer Custom Feeds. LST/LRT-Pricing | [redstone.finance](https://redstone.finance/) |
| **API3** | Crypto, FX, Commodities (via dAPIs) | First-Party Oracles (Daten direkt von Quelle, kein Mittelsmann) | 100+ | Kostenlos (via dAPIs) | **Kein Mittelsmann:** Daten kommen direkt von CoinGecko, Finage, Twelve Data etc. als signierte Feeds. Eliminiert Oracle-Layer-Risiko | [api3.org](https://api3.org/), [market.api3.org](https://market.api3.org/) |

> **Web2 vs Web3 Vergleich fuer unseren Use Case:**
>
> | Aspekt | Web2 API (Finnhub, Alpha Vantage) | Web3 Oracle (Chainlink, Pyth) |
> |---|---|---|
> | **Quellen-Diversitaet** | Einzelner Provider | 17+ unabhaengige Operators / 120+ Publisher |
> | **Aggregation** | Keine (was Provider liefert = Wahrheit) | Median aus N Quellen, TWAP, Deviation Threshold |
> | **Manipulations-Schutz** | Cross-Check nur durch eigene Logik | Built-in: Ausreisser werden rausgefiltert |
> | **Ausfallsicherheit** | Single Point of Failure | Dezentral, kein SPOF |
> | **Kosten** | Rate-Limited, oft teuer fuer RT | On-Chain lesen = kostenlos |
> | **Latenz** | 50-500ms (REST) | Pyth: <1s, Chainlink: Heartbeat 1-60min je Feed |
> | **Fuer uns** | Primaer-Datenquelle (Volumen, OHLCV, Fundamentals) | **Verifikations-Layer** (Preis-Cross-Check, Oracle Disagreement Signal) |

#### 2. Oracle Disagreement als eigenes Signal (E_o Konzept)

> **Entropy Network Parallel:** Das Entropy Network misst "Oracle Disagreement" (E_o) als einen von 5 Stress-Sensoren. Wenn verschiedene Orakel divergierende Preise liefern, steigt E_o und signalisiert Unsicherheit ueber den wahren Preis. Fuer uns: **Chainlink-Preis vs. Finnhub-Preis vs. Polygon-Preis** Divergenz ist ein eigenes Stress-Signal.
>
> Moegliche Implementierung:
> - Go-Router holt Preis von Web2-Provider (primaer) UND von Chainlink/Pyth (Verifikation)
> - Divergenz > X% → Data Quality Flag + Alert
> - Persistente Divergenz → Provider-Health-Score runter
> - Historische Divergenz-Daten als neuer Indikator: "Oracle Spread Index"

#### Empfohlene Go-Adapter-Prioritaet (Oracle Networks)

| Prio | Adapter | Was | Aufwand | Begruendung |
|---|---|---|---|---|
| **O1** | **Chainlink REST Gateway** | FX-Feeds (CHF/USD, SGD/USD, EUR/USD, GBP/USD, JPY/USD), XAU/USD, BTC/USD | Klein (~120 LoC, REST/JSON via Public RPC oder data.chain.link) | Hoechste Operator-Diversitaet, FX + Commodities + Crypto |
| **O2** | **Pyth Network REST** | Crypto + FX + Equity Feeds, Sub-Sekunde Latenz | Klein (~100 LoC, REST via Hermes API) | Institutional Publisher (Jane Street, Jump), niedrigste Latenz |
| **O3** | **Oracle Disagreement Detector** | Cross-Check Chainlink vs. Web2-Provider, Divergenz-Alerts | Mittel (~200 LoC, Integration in Router Health-Scoring) | Eigenes Stress-Signal, erhoeht Datenqualitaet des gesamten Systems |

---

### NEUE Quellen: On-Chain Stress, DeFi-Leverage & Bitcoin-Netzwerk-Daten (NEU 2026-02-22)

> **Kontext:** Das Entropy Network definiert 5 Stress-Sensoren (E_v Velocity, E_c Congestion, E_m Market Variance, E_l Leverage, E_o Oracle Disagreement). Auch wenn diese fuer den O-Token konzipiert sind, mappen die Konzepte direkt auf beobachtbare On-Chain-Daten die fuer unser System als **Signal-Kategorien** relevant sind. DeFi-Leverage ist das Crypto-Aequivalent von TradFi Shadow Banking / NBFI -- und paradoxerweise transparenter (on-chain einsehbar, waehrend Bilateral Repos opak bleiben).
> **Bitcoin-Netzwerk-Daten:** Die Idee der Bitcoin-Blockhoehe als "atomare Uhr" (UVD Whitepaper Sek. 4.6) ist fuer unser System nicht direkt als Timing relevant, aber Bitcoin-Netzwerk-Metriken (Hash Rate, Mempool, Fee Pressure, Miner Flows) sind eigenstaendige Makro-Signale.
> **Architektur-Fit:** DefiLlama und mempool.space haben hervorragende REST-APIs (kostenlos, kein Key). Coinglass hat Free Tier. Alle als Go-Adapter in bestehende On-Chain-Kategorie.

#### 1. DeFi-Leverage / Crypto-NBFI (das transparente Shadow Banking)

| Quelle | Was sie liefert | Zugang | Frequenz | Besonderheit | Link |
|---|---|---|---|---|---|
| **DefiLlama** | DeFi TVL (Total Value Locked) pro Protokoll/Chain, Yields, Revenue, Stablecoin-Flows, Liquidations, Bridges, Volumes | Kostenlos, **kein API-Key**, REST | Real-time / Taeglich | **Wichtigste DeFi-Dataquelle.** Open Source, keine Rate-Limits. TVL = Proxy fuer DeFi-Leverage-Aufbau. $150B+ TVL tracked | [defillama.com](https://defillama.com/), [API-Docs](https://defillama.com/docs/api) |
| **Coinglass** | Liquidation Heatmaps, Open Interest, Funding Rates, Long/Short Ratio, Exchange BTC/ETH Reserves, Grayscale Premium | Free Tier (Rate-Limited) | Real-time | **Bester Ueberblick ueber Crypto-Leverage.** Liquidation Heatmap zeigt wo Margin Calls clustern. Funding Rate = Markt-Sentiment-Indikator | [coinglass.com](https://www.coinglass.com/), [API](https://coinglass.com/pricing) |
| **Whale Alert** | Grosse Wallet-Transfers in Echtzeit (>$500k), Exchange In/Outflows | Free Tier (REST, 10 req/min) | Real-time | GeoMap-Events: Grosse Transfers als Punkte auf der Karte. ~500 Alerts/Tag | [whale-alert.io](https://whale-alert.io/), [API-Docs](https://docs.whale-alert.io/) |
| **Glassnode** | On-Chain Analytics: SOPR, MVRV, Exchange Flows, Supply Distribution, Miner Revenue, Realized Cap | Free Tier (eingeschraenkt, 10+ Metriken), Pro ab $39/Mo | Taeglich | Gold-Standard fuer Bitcoin On-Chain-Analyse. 200+ Metriken | [glassnode.com](https://glassnode.com/), [API-Docs](https://docs.glassnode.com/) |
| **CryptoQuant** | Exchange Reserve, Miner Flow, Fund Flow, Stablecoin Supply Ratio, Exchange Whale Ratio | Free Tier (eingeschraenkt) | Taeglich | Komplementaer zu Glassnode. Besonders stark bei Exchange-Flows und Miner-Daten | [cryptoquant.com](https://cryptoquant.com/), [API](https://docs.cryptoquant.com/) |
| **IntoTheBlock** | DeFi Analytics, Holder Composition, Large Transaction Volume, In/Out of Money, Whale Concentration | Free Tier | Taeglich | Machine-Learning-basierte Metriken. "In/Out of Money" = Unrealized P&L Distribution | [intotheblock.com](https://www.intotheblock.com/) |

> **Entropy-Parallel (E_l Leverage):** DefiLlama TVL + Coinglass OI/Funding + FINRA Margin (TradFi) zusammen ergeben ein "Total Financial Leverage"-Bild ueber TradFi und DeFi hinweg. Wenn beide gleichzeitig steigen → systemisches Risiko.

#### 2. Bitcoin-Netzwerk-Daten (Blockhoehe, Mempool, Mining)

> **UVD-Whitepaper-Kontext:** "A specific Bitcoin block height defines the boundary between weeks." -- Bitcoin-Blöcke als fälschungssichere Zeitreferenz. Für uns nicht als Timing-Mechanismus relevant (wir bauen nicht auf einer Blockchain), aber Bitcoin-Netzwerk-Metriken sind eigenstaendige Makro-Signale (Mining-Economics, Netzwerk-Nachfrage, Fee-Pressure).

| Quelle | Was sie liefert | Zugang | Frequenz | Besonderheit | Link |
|---|---|---|---|---|---|
| **mempool.space** | Mempool-Zustand (unbestaet. TX), Fee Estimation, Block Timing, Mining Pool Stats, Lightning Network Stats | Kostenlos, **Open Source**, REST-API, kein Key | Real-time | **Bester freier Zugang zu Bitcoin-Netzwerk-Daten.** Self-hostbar. Block-Timing-Irregularitaeten = Mining-Stress-Signal | [mempool.space](https://mempool.space/), [API-Docs](https://mempool.space/docs/api/rest) |
| **Blockchain.com API** | Block Height, Hash Rate, Difficulty, TX Volume, Mempool Size, Miner Revenue | Kostenlos, REST | Real-time | Aelteste Bitcoin-Explorer-API. Einfach, stabil | [blockchain.info/api](https://www.blockchain.com/explorer/api) |
| **Clark Moody Bitcoin Dashboard** | Bitcoin Network Visualizer (Hash Rate, Difficulty, Fees, Supply, Lightning) | Web | Real-time | Referenz-Dashboard fuer Netzwerk-Health. Kein API, aber Open-Source-Datenquellen dokumentiert | [bitcoin.clarkmoody.com](https://bitcoin.clarkmoody.com/dashboard/) |

> **Fuer unseren Use Case:**
> - **Hash Rate + Difficulty:** Proxy fuer Mining-Investment und Netzwerk-Sicherheit. Rapider Drop = Miner-Kapitulation (historisch korreliert mit Preis-Tiefs)
> - **Mempool Fee Pressure:** Hohe Fees = hohe Netzwerk-Nachfrage. Spikes korrelieren mit Volatilitaets-Events
> - **Block Timing Varianz:** Abweichung vom 10-Min-Schnitt = Mining-Difficulty-Adjustment-Signal

---

### NEUE Quellen: CBDC-Tracking + De-Dollarization + Geopolitische Geld-Architektur (NEU 2026-02-22)

> **Kontext:** Die UVD/UDRP-Architektur (Kiyan Sasan) adressiert die Abloesung des USD als Weltreservewaehrung durch ein neutrales, Bitcoin-basiertes System. Unabhaengig davon ob man dieses spezifische System fuer realistisch haelt: De-Dollarization ist ein **messbarer, laufender Prozess** (USD-Anteil an globalen Reserven gefallen von 72% auf ~58%), CBDC-Entwicklung betrifft 137 Laender, und Settlement-Infrastruktur-Verschiebungen (SWIFT-Alternativen, mBridge, BRICS-Clearing) sind direkte Makro-Signale.
> **GeoMap-Integration:** CBDC-Status als Heatmap-Layer (Launched/Pilot/Development/Research/Inaktiv). De-Dollarization-Metriken als Country-Overlay. Settlement-Infrastruktur-Events.

#### 1. CBDC-Tracking (Global)

| Quelle | Was sie liefert | Zugang | Frequenz | Besonderheit | Link |
|---|---|---|---|---|---|
| **Atlantic Council CBDC Tracker** | CBDC-Status fuer **137 Laender** (98% des globalen BIP). Kategorien: Research, Development, Pilot, Launched | Kostenlos, interaktive Karte | Unregelmaessig (bei Aenderungen) | **Beste einzelne CBDC-Uebersicht weltweit.** Aktuell: 49 Pilots, 3 Launched (Bahamas, Jamaica, Nigeria). e-CNY groesster Pilot (7T CNY Volumen). Cross-Border Wholesale verdoppelt seit 2022 | [atlanticcouncil.org/cbdctracker](https://www.atlanticcouncil.org/cbdctracker/) |
| **BIS Innovation Hub** | CBDC-Projekte: mBridge (Multi-CBDC), Project Dunbar, Project Icebreaker, Tourbillon | Kostenlos, PDF + Webseiten | Bei Milestone | Offizielles BIS-Portal fuer alle experimentellen CBDC-Projekte. mBridge = China+Thailand+UAE+HK Wholesale CBDC | [bis.org/about/bisih](https://www.bis.org/about/bisih/) |
| **BIS CPMI Statistics** | Cross-border Payment Flows, Settlement Volumes, FPS (Fast Payment Systems) Adoption | Kostenlos, API/Excel | Jaehrlich | Quantitative Daten zu globalem Zahlungsverkehr. Wie viel fliesst ueber welche Kanaele | [bis.org/cpmi/paysysinfo](https://www.bis.org/cpmi/paysysinfo.htm) |

> **GeoMap-Layer "CBDC Status":** Farb-Kodierung pro Land: Gruen=Launched, Gelb=Pilot, Orange=Development, Rot=Research, Grau=Inaktiv/Kein Programm. Daten aus Atlantic Council Tracker (periodischer Scrape oder manuelles Update). Events: Neue Laender die in Pilot-Phase eintreten.

#### 2. De-Dollarization Metriken

> **UVD-Whitepaper-Kontext:** "For as long as complex trade has existed, there has been a dominant unit of account and a dominant issuer behind it. [...] The problem is the recurring pattern: whenever one centre owns the scale, sooner or later the scale tilts." -- Die Messung dieses "Tilts" ist fuer Macro-Analyse direkt relevant.

| Quelle | Was sie liefert | Zugang | Frequenz | Besonderheit | Link |
|---|---|---|---|---|---|
| **IMF COFER** (Currency Composition of Official FX Reserves) | USD-Anteil, EUR-Anteil, CNY-Anteil, etc. an globalen Devisenreserven | Kostenlos, IMF Data API | Quartal | **Wichtigste De-Dollarization-Metrik.** USD gefallen von 72% (2000) auf ~58% (2024). CNY gestiegen auf ~2.5% | [data.imf.org/COFER](https://data.imf.org/regular.aspx?key=41175) |
| **SWIFT RMB Tracker** | Yuan-Anteil am internationalen Zahlungsverkehr via SWIFT | Kostenlos, PDF (monatlich) | Monatlich | CNY schwankt um ~3-4% Anteil. Spikes bei BRICS-Deals. Limit: misst nur SWIFT, nicht alternative Systeme (CIPS) | [swift.com/RMBtracker](https://www.swift.com/our-solutions/compliance-and-shared-services/business-intelligence/renminbi/rmb-tracker) |
| **Atlantic Council Dollar Dominance Monitor** | Aggregiert mehrere De-Dollarization-Metriken: Reserven, Trade Invoicing, SWIFT-Anteil, Debt Denomination | Kostenlos | Quartal/Unregelmaessig | **Bester aggregierter Ueberblick.** Kombiniert COFER + SWIFT + BIS-Daten | [atlanticcouncil.org/programs/geoeconomics-center/dollar-dominance-monitor](https://www.atlanticcouncil.org/programs/geoeconomics-center/) |
| **BIS Triennial Survey** | FX Turnover nach Waehrungspaar (wer handelt was, wie viel), OTC Derivatives Turnover | Kostenlos | Alle 3 Jahre (naechster 2025/2026) | Definitive Messung der globalen FX-Marktstruktur. $7.5T/Tag FX-Volumen | [bis.org/statistics/rpfx](https://www.bis.org/statistics/rpfx22.htm) |
| **IMF SDR Basket** | Zusammensetzung + Gewichtung des SDR (Special Drawing Right) | Kostenlos | Review alle 5 Jahre (naechster 2027) | SDR-Gewichtung reflektiert offizielle Sicht auf Waehrungsrelevanz: USD 43.4%, EUR 29.3%, CNY 12.3%, JPY 7.6%, GBP 7.4% | [imf.org/SDR](https://www.imf.org/en/About/Factsheets/Sheets/2023/special-drawing-rights-sdr) |

#### 3. Settlement-Infrastruktur + BRICS-Alternativen

> **UDRP-Kontext (Gemini-Gespraech):** "Das UDRP-Netzwerk ersetzt Korrespondenzbanken durch algorithmische Regeln und den neutralen Universe Dollar (UVD)." -- Unabhaengig von UVD: Die Abloesung der SWIFT/Korrespondenzbank-Architektur ist ein laufender geopolitischer Prozess.

| Quelle / System | Was es ist | Status | Relevanz fuer uns | Link |
|---|---|---|---|---|
| **SWIFT gpi (Global Payments Innovation)** | Modernisiertes SWIFT-Tracking fuer Cross-Border Payments | Produktiv, 4000+ Banken | Benchmark: Wie schnell/teuer ist das bestehende System? | [swift.com/gpi](https://www.swift.com/our-solutions/swift-gpi) |
| **CIPS (Cross-Border Interbank Payment System)** | Chinas SWIFT-Alternative. Yuan-denominated. 1400+ direkte/indirekte Teilnehmer | Produktiv, wachsend | China-Trade-Volumen das NICHT ueber SWIFT laeuft. Opak -- keine oeffentlichen Statistiken | [cips.com.cn](http://www.cips.com.cn/) |
| **mBridge (BIS/Multi-CBDC)** | Wholesale CBDC-Plattform: China, Thailand, UAE, HK, Saudi-Arabien | Pilot (MVP 2024) | Potentieller SWIFT-Konkurrent fuer Wholesale Settlement. BIS-gesponsert! | [bis.org/mbridge](https://www.bis.org/about/bisih/topics/cbdc/mcbdc_bridge.htm) |
| **BRICS Payment Initiative** | Geplantes Clearing-System fuer BRICS-Laender (RU, CN, IN, BR, ZA, etc.) | Diskussion/Planung | Noch nicht operativ. Politisch geladen. Jede Ankuendigung bewegt EM-FX | Diverse Nachrichtenquellen |
| **CLS Group** | FX Settlement: $6.5T/Tag. 18 Waehrungen. PvP-Settlement | Produktiv | Groesstes FX-Settlement-System. Statistiken teilweise oeffentlich | [cls-group.com](https://www.cls-group.com/) |

> **Einordnung:** CBDC-Tracker (Atlantic Council) ist **Hoch-Prioritaet** fuer GeoMap. IMF COFER und SWIFT RMB Tracker sind **Mittel-Prioritaet** (Quartal/Monat, Bulk-Fetch). CIPS/mBridge/BRICS sind **Kontext** (News-Layer, nicht API-fetchbar). CLS ist **Niedrig** (keine oeffentliche API).

---

### NEUE Quellen: Maschinenlesbare Finanz-Standards + Entity-Identifikation (NEU 2026-02-22)

> **Kontext:** Das UWD-Konzept (Kiyan Sasan, "How to Run a Country") beschreibt einen "Parameter State" wo Regierungen Steuer/Zoll-Regeln als maschinenlesbaren Code publizieren. In der Realitaet existieren bereits mehrere standardisierte, maschinenlesbare Finanz-Frameworks die fuer Entity-Resolution, Instrument-Identifikation und Regelwerk-Referenz relevant sind.
> **Architektur-Fit:** Primaer als Referenz-Datenbanken fuer Entity-Resolution und Instrument-Lookup im Go-Backend. Nicht als Echtzeit-Feeds, sondern als periodisch aktualisierte Stammdaten.

| Quelle | Was sie liefert | Zugang | Format | Besonderheit | Link |
|---|---|---|---|---|---|
| **GLEIF LEI** (Legal Entity Identifier) | Globale Identifikation aller Finanzmarkt-Teilnehmer (1.6M+ Entities). Wer ist das Unternehmen, wer ist die Mutter, wo ist der Sitz? | Kostenlos, REST-API, kein Key | JSON, CSV, XML | **Goldstandard fuer Entity-Resolution.** Pflicht fuer alle regulierten Finanztransaktionen. Ownership-Chains sichtbar (Ultimate Parent) | [gleif.org](https://www.gleif.org/), [API](https://www.gleif.org/en/lei-data/gleif-lei-look-up-api) |
| **OpenFIGI** | Financial Instrument Global Identifier. Mapping: ISIN ↔ FIGI ↔ Bloomberg Ticker ↔ CUSIP ↔ SEDOL ↔ Exchange-Ticker | Kostenlos, REST-API | JSON | **Instrument-Normalisierung.** Wenn verschiedene Provider verschiedene Ticker fuer dasselbe Instrument nutzen → OpenFIGI ist die Rosetta-Stone | [openfigi.com](https://www.openfigi.com/), [API](https://www.openfigi.com/api) |
| **ISDA CDM** (Common Domain Model) | Standardisiertes Datenmodell fuer Derivatives (Trades, Events, Legal Agreements). Maschinenlesbares Regelwerk | Kostenlos, Open Source (GitHub) | JSON Schema, Java, Python | **Referenz-Architektur** fuer "Finanzregeln als Code" (UWD-Konzept-Parallel). Zeigt wie Finanzkontrakte maschinenlesbar standardisiert werden | [github.com/finos/common-domain-model](https://github.com/finos/common-domain-model) |
| **ISO 20022 Message Catalog** | Internationaler Standard fuer Finanz-Messaging (Zahlungen, Securities, FX). SWIFT migriert zu ISO 20022 | Kostenlos (Katalog) | XML/ASN.1 | SWIFT-Migration auf ISO 20022 laeuft 2025-2027. Relevant als Referenz fuer Settlement-Datenstrukturen | [iso20022.org](https://www.iso20022.org/) |
| **XBRL International** | Structured Financial Reporting Standard. Alle boersennotierten Unternehmen muessen XBRL einreichen | Kostenlos (EDGAR XBRL via SEC) | XBRL/JSON | Bereits teilweise in unserem EDGAR-Zugang enthalten. Fuer systematisches Fundamental-Parsing relevant | [xbrl.org](https://www.xbrl.org/) |

> **Prioritaet:**
> - **GLEIF LEI API** → Mittel. Nuetzlich fuer GeoMap Entity-Resolution (z.B. "Welcher Konzern steckt hinter diesem FINMA-Enforcement?"). ~80 LoC Go-Adapter.
> - **OpenFIGI API** → Mittel. Instrument-Normalisierung zwischen Providern (Finnhub-Ticker ≠ Polygon-Ticker ≠ Yahoo-Ticker). ~60 LoC.
> - **ISDA CDM** → Niedrig (Referenz-Architektur, kein Datenfeed).
> - **ISO 20022 / XBRL** → Niedrig (Kontext, nicht direkt als Adapter).

---

---

### NEUE Quellen: Sovereign Parameter Tracking + Trade Corridor Daten + Country Attractiveness (NEU 2026-02-22)

> **Kontext:** Das UWD-Konzept (Kiyan Sasan) beschreibt "Corridors as Diplomacy" -- Handelskorridore als maschinenlesbare Vertragssprache. Unabhaengig von der Sasan-Vision: Handelskorridore, Sovereign Policy Parameters und Country Attractiveness sind messbare Datenpunkte die fuer Geopolitische Analyse direkt relevant sind.
> **Architektur-Fit:** GeoMap-Layers (Corridor Lines, Heatmaps) + Macro-Kontext-Daten fuer Agent-Pipeline.
> **Referenz:** [`ENTROPY_NOVELTY.md`](./ENTROPY_NOVELTY.md) Sek. 12-13 (UDRP Sovereign Parameters, UWD Module Surface).

#### 1. Trade Corridor / Bilateral Trade Daten

| Quelle | Was sie liefert | Zugang | Frequenz | Besonderheit | Link |
|---|---|---|---|---|---|
| **UN Comtrade** | Bilateraler Handel zwischen 200+ Laendern, HS-Code-Ebene, Import/Export-Volumen in USD | Kostenlos (API, 100k Datenpunkte), Premium fuer Bulk | Jaehrlich + Monatlich (ausgewaehlte Laender) | **Definitive Quelle** fuer "wer handelt was mit wem". Korridor-Volumen direkt ableitbar | [comtradeplus.un.org](https://comtradeplus.un.org/) |
| **WTO Statistics** | Trade Profiles, Tariff Profiles, Handels-Streitigkeiten, Anti-Dumping-Massnahmen | Kostenlos, REST-API | Jaehrlich/Quartal | Offizielle Tariff-Daten + Trade Dispute Tracker (WTO DS-Nummern als Events) | [stats.wto.org](https://stats.wto.org/) |
| **UNCTAD Stat** | FDI-Flows bilateral, Trade in Services, Commodity Prices, Maritime Transport | Kostenlos, Bulk Download | Jaehrlich | FDI = "wer investiert wo". Ergaenzt Handels-Daten um Investitions-Dimension | [unctadstat.unctad.org](https://unctadstat.unctad.org/) |
| **Observatory of Economic Complexity (OEC)** | Visuelle Trade-Analyse, Product Space, Complexity Indices, Trade Partner Diversitaet | Kostenlos (Web), API eingeschraenkt | Jaehrlich | Exzellente Visualisierung von Handelsbeziehungen. Economic Complexity Index (ECI) als Laender-Signal | [oec.world](https://oec.world/) |

> **GeoMap-Integration:** UN Comtrade Bilateral-Trade-Daten als Basis fuer **Corridor Lines**: Linien zwischen Laendern, Dicke proportional zu Handelsvolumen, Farbe nach Warengruppe (Energie=rot, Tech=blau, Agrar=gruen). WTO-Disputes als Events auf den Korridor-Linien.

#### 2. Country Governance / Attractiveness Indices

> **UWD-Kontext:** "A world with fair mobility becomes a race to the top: better institutions attract better people; better people build better institutions." -- Messung dieser "Attraktion" ist fuer Laender-Risiko-Bewertung relevant.

| Quelle | Was sie liefert | Zugang | Frequenz | Besonderheit | Link |
|---|---|---|---|---|---|
| **Heritage Economic Freedom Index** | 12 Dimensionen oekonomischer Freiheit fuer 184 Laender (Property Rights, Tax Burden, Trade Freedom, Monetary Freedom, etc.) | Kostenlos, Bulk Download | Jaehrlich | Quantifizierbarer "Attractiveness Score". Korreliert mit FDI-Zufluessen | [heritage.org/index](https://www.heritage.org/index/) |
| **World Bank Governance Indicators (WGI)** | 6 Governance-Dimensionen: Voice, Political Stability, Government Effectiveness, Regulatory Quality, Rule of Law, Control of Corruption | Kostenlos, API | Jaehrlich | Offizieller Governance-Standard. 200+ Laender seit 1996 | [info.worldbank.org/governance/wgi](https://info.worldbank.org/governance/wgi/) |
| **Henley Passport Index** | Visa-Freiheit pro Passport (190 Laender) | Kostenlos (Top-Level), Detail kostenpflichtig | Quartal | Proxy fuer Laender-Integration in globales System | [henleyglobal.com/passport-index](https://www.henleyglobal.com/passport-index) |
| **UN Human Development Index (HDI)** | Life Expectancy, Education, GNI per Capita fuer 191 Laender | Kostenlos, Bulk | Jaehrlich | Breiter "Quality of Life"-Indikator | [hdr.undp.org](https://hdr.undp.org/data-center/human-development-index) |
| **Fragile States Index (Fund for Peace)** | 12 Indikatoren fuer Staatsfragilitaet (178 Laender) | Kostenlos (Ranking), Detail-API unklar | Jaehrlich | Fruehwarnsystem fuer Staats-Zerfall. Direktes GeoMap-Heatmap-Potenzial | [fragilestatesindex.org](https://fragilestatesindex.org/) |
| **Transparency International CPI** | Corruption Perceptions Index (180 Laender) | Kostenlos | Jaehrlich | Korruptions-Wahrnehmung. Bewegt EM-Bond-Spreads bei Aenderungen | [transparency.org/cpi](https://www.transparency.org/en/cpi) |

> **Synthetischer Country Attractiveness Index (geplant):** Gewichteter Composite aus Heritage EFI + WGI Regulatory Quality + Henley Passport + HDI + Fragile States Index (invertiert) + CPI. Als GeoMap-Heatmap-Layer + Input fuer Laender-Risiko-Scoring in der Agent-Pipeline.

#### 3. CBDC Policy Parameter Tracking

> **UDRP-Kontext:** Sovereign Parameter Sets (Privacy, Fees, Capital Controls, Credit Permissions, Tax Logic) als maschinenlesbarer Standard. In der Realitaet existieren keine standardisierten maschinenlesbaren CBDC-Parameter -- aber einzelne Dimensionen sind trackbar.

| Dimension | Moegliche Quelle | Status | Machbarkeit |
|---|---|---|---|
| **CBDC Launch/Pilot Status** | Atlantic Council CBDC Tracker (bereits dokumentiert) | 137 Laender abgedeckt | HOCH -- periodischer Scrape |
| **Capital Controls (de facto)** | IMF AREAER (Annual Report on Exchange Arrangements) | Jaehrlich, PDF + strukturierte Daten | MITTEL -- PDF-Parsing noetig |
| **Tax Policy Aenderungen** | OECD Tax Database + PwC Worldwide Tax Summaries | Kostenlos (OECD API), PwC Web | MITTEL -- Go-Adapter fuer OECD REST |
| **Privacy Regulations** | DLA Piper Data Protection Laws (World Map) | Kostenlos (Web) | NIEDRIG -- kein API, manuelles Tracking |
| **Financial Openness** | Chinn-Ito KAOPEN Index (197 Laender, seit 1970) | Kostenlos, Excel/CSV | HOCH -- Bulk Download, jaehrlich |

> **Einordnung:** CBDC-Status + Chinn-Ito KAOPEN sind **Hoch-Prioritaet** (strukturierte Daten, API/Download). IMF AREAER + OECD Tax sind **Mittel** (periodisch, teilweise API). Privacy Regulations sind **Niedrig** (kein API).

#### Empfohlene Go-Adapter-Prioritaet (Corridor + Attractiveness)

| Prio | Adapter | Was | Aufwand | Begruendung |
|---|---|---|---|---|
| **CA1** | **UN Comtrade API** | Bilateral Trade Flows fuer Top-50-Korridore, jaehrlich + monatlich | Mittel (~150 LoC, REST/JSON, Auth-Token) | Basis fuer GeoMap Corridor Lines |
| **CA2** | **Heritage EFI Bulk** | Economic Freedom Scores, 184 Laender | Klein (~80 LoC, CSV/JSON Download) | Country Attractiveness Heatmap |
| **CA3** | **World Bank WGI API** | 6 Governance-Dimensionen, 200+ Laender | Klein (~100 LoC, REST/JSON) | Governance-Qualitaet als Risiko-Faktor |
| **CA4** | **Chinn-Ito KAOPEN** | Financial Openness Index, 197 Laender | Trivial (~40 LoC, CSV Bulk) | Capital Controls als Korridor-Parameter |
| **CA5** | **WTO Trade Disputes RSS** | Anti-Dumping, Disputes, Tariff-Aenderungen | Klein (~80 LoC, RSS/XML) | GeoMap Events auf Korridor-Linien |
| **CA6** | **Fragile States Index** | Fragilitaets-Scoring, 178 Laender | Klein (~60 LoC, CSV/JSON) | GeoMap Heatmap + Agent-Risk-Input |

---

### Zusammenfassung: Coverage-Matrix nach Entropy/Oracle/CBDC/Corridor-Erweiterung (NEU 2026-02-22)

> Erweiterung der bestehenden Coverage-Matrix um Web3 Oracle, DeFi, Bitcoin-Netzwerk, CBDC, De-Dollarization, Trade Corridors und Country Attractiveness.

| Kategorie | Jetzt | Nach Erweiterung | Kommentar |
|---|---|---|---|
| **Crypto-Preise (Verifikation)** | Gut (CEX via gct/ccxt) | **Sehr gut** (+Chainlink, +Pyth Cross-Check) | Oracle Disagreement als eigenes Signal |
| **DeFi-Leverage** | Fehlt | **Gut** (+DefiLlama TVL/Yields, +Coinglass OI/Funding/Liquidations) | Crypto-NBFI-Parallel zu TradFi Shadow Banking |
| **On-Chain Whale/Flow** | Schwach (nur Arkham, API-Key unklar) | **Gut** (+Whale Alert Free, +Glassnode Free Tier, +CryptoQuant) | GeoMap On-Chain-Events |
| **Bitcoin-Netzwerk** | Fehlt | **Gut** (+mempool.space, +Blockchain.com) | Hash Rate, Mempool, Fees als Makro-Signale |
| **CBDC-Status (global)** | Fehlt | **Sehr gut** (+Atlantic Council Tracker: 137 Laender) | GeoMap Heatmap-Layer |
| **De-Dollarization** | Fehlt | **Gut** (+IMF COFER, +SWIFT RMB, +AC Dollar Dominance) | Quartals-/Monatsdaten fuer Macro-Kontext |
| **Settlement-Infrastruktur** | Fehlt | **Mittel** (CIPS/mBridge/BRICS = News-Layer, keine APIs) | Kontext, nicht direkt fetchbar |
| **Entity-Resolution** | Fehlt | **Mittel** (+GLEIF LEI, +OpenFIGI) | Instrument- + Entity-Normalisierung |
| **Oracle Cross-Check** | Fehlt | **Neu** (Chainlink vs Web2 Divergenz) | Eigener Datenqualitaets-Indikator |
| **Trade Corridors** | Fehlt | **Gut** (+UN Comtrade bilateral, +WTO Disputes) | GeoMap Corridor Lines + Events |
| **Country Attractiveness** | Fehlt | **Gut** (+Heritage EFI, +WGI, +FSI, +CPI, +Henley) | Synthetischer Index fuer GeoMap Heatmap |
| **CBDC Policy Parameters** | Fehlt | **Mittel** (+Chinn-Ito KAOPEN, +OECD Tax) | Sovereign Parameter Tracking Ansatz |

---

*Vollstaendige Beschreibungen, Review-Entscheidungen und alle Sektionen 1-9:* [`docs/archive/REFERENCE_PROJECTS_full.md`](./archive/REFERENCE_PROJECTS_full.md)
