# TODOs

## Wichtig
- Auth ist aktuell **nicht aktiviert**.
- Auth/DB-Strukturen dürfen vorbereitet werden, aber ohne Login-Zwang im Produktfluss.
- Ziel: keine unnötigen Schranken, zuerst Produktkern stabilisieren.

## Status (aktuell)
- Projekt ist im Übergang A+/B- mit starker UI + Provider/API-Basis.
- Größte Lücke war konsistentes OHLCV im Chart; dieser Punkt ist für P0 adressiert.
- Sidebar/UX ist auf Single-Fusion-Mode vereinheitlicht.
- Zusatz-Umsetzung: Daily-SMA50-Line, Alert-Self-Check, Provider-Benchmark-Tabelle, neue Indikatoren (VWAP/ATR) und Backend-Persistenz-API-Scaffold.

## Prioritäten

### P0 = Muss jetzt (Produktkern)

- [x] **P0.1 Chart auf echte OHLCV umstellen (mit Fallback)**
  - Ergebnis: `page.tsx` lädt primär über `/api/market/ohlcv`, bei Fehler fallback auf Demo-Candles.
  - Dateien: `tradeview-fusion/src/app/page.tsx`, `tradeview-fusion/src/app/api/market/ohlcv/route.ts`
  - Kontext: Symbol-/Timeframe-Wechsel triggern API-Load; Statusmeldung für API/Fallback ist vorhanden.

- [x] **P0.2 Alerts an echte Preisupdates koppeln**
  - Ergebnis: Quote-Polling ruft `checkAlerts(...)` auf; Trigger erzeugen sichtbare Notifications.
  - Dateien: `tradeview-fusion/src/app/page.tsx`, `tradeview-fusion/src/lib/alerts/index.ts`, `tradeview-fusion/src/components/AlertPanel.tsx`, `tradeview-fusion/docs/ALERT_VERIFICATION.md`
  - Kontext: Persistenz-/Update-Events für Alerts/Notifications ergänzt; reproduzierbarer `above/below` Self-check inklusive Duplicate-Check vorhanden.

- [x] **P0.3 Symbol-Normalisierung end-to-end**
  - Ergebnis: Canonical-Format + Alias-Auflösung für UI/API/Provider-Flows.
  - Dateien: `tradeview-fusion/src/lib/fusion-symbols.ts`, `tradeview-fusion/src/app/api/market/quote/route.ts`, `tradeview-fusion/src/app/api/market/ohlcv/route.ts`, `tradeview-fusion/src/lib/alerts/index.ts`
  - Kontext: Search/Watchlist/Quote/OHLCV sind auf normalisierte Symbole abgestimmt.

- [x] **P0.4 `.env.example` ergänzen (Onboarding fix)**
  - Ergebnis: Setup-Variablen sind dokumentiert und konsistent.
  - Dateien: `tradeview-fusion/.env.example`
  - Kontext: Enthält `TWELVE_DATA_API_KEY`, `ALPHA_VANTAGE_API_KEY`, `FINNHUB_API_KEY` sowie optionale DB/Auth-Variablen.

### P1 = Hoher Hebel danach (Analysequalität)

- [x] **P1.1 `page.tsx` modularisieren**
  - Ergebnis: `page.tsx` ist jetzt primär Orchestrierung/State-Komposition.
  - Ausgelagerte Features:
    - `tradeview-fusion/src/features/trading/TopMenuBar.tsx`
    - `tradeview-fusion/src/features/trading/TradingHeader.tsx`
    - `tradeview-fusion/src/features/trading/TradingSidebar.tsx`
    - `tradeview-fusion/src/features/trading/TradingWorkspace.tsx`
    - `tradeview-fusion/src/features/trading/BottomStats.tsx`
    - `tradeview-fusion/src/features/trading/SignalInsightsBar.tsx`
    - `tradeview-fusion/src/features/trading/TradingPageSkeleton.tsx`
    - `tradeview-fusion/src/features/trading/types.ts`
  - Kontext: Rendering-Blöcke für Chart-Workspace und Skeleton wurden aus `tradeview-fusion/src/app/page.tsx` ausgelagert, Verhalten bleibt erhalten.

- [x] **P1.2 Signalpaket „Line / Power / Rhythm“**
  - Ergebnis: Line/Power/Rhythm-Berechnungen + UI-Anzeige + Formel-Doku sind integriert.
  - Dateien:
    - `tradeview-fusion/src/lib/indicators/index.ts`
    - `tradeview-fusion/src/app/page.tsx`
    - `tradeview-fusion/src/features/trading/SignalInsightsBar.tsx`
    - `tradeview-fusion/docs/SIGNAL_FORMULAS.md`
  - Kontext: SMA-Cross-Events inkl. Alert-Templates vorhanden; **Line läuft auf Daily SMA50**, Power/Rhythm auf aktiver Datenbasis.

- [x] **P1.3 Inkrementelle Chart-Updates vorbereiten**
  - Ergebnis: Fast-Path aktualisiert Candle-, Volume-, SMA-, EMA-, Bollinger- und RSI-Serien ohne kompletten Re-Init.
  - Datei: `tradeview-fusion/src/components/TradingChart.tsx`
  - Kontext: Re-Init-Signatur reduziert auf strukturelle Faktoren (`chartType`, Theme, RSI-Panel). Overlays werden im laufenden Chart add/remove + `setData(...)` aktualisiert.

- [x] **P1.4 Historische Timerange (symbolabhängig)**
  - Ergebnis: Header hat jetzt `YTD/1Y/3Y/5Y/10Y/MAX/CUSTOM`, inkl. symbolabhängigem Startjahr (z. B. `DJI` bis 1896, `AAPL` ab 1980).
  - Dateien:
    - `tradeview-fusion/src/lib/history-range.ts`
    - `tradeview-fusion/src/lib/fusion-symbols.ts`
    - `tradeview-fusion/src/app/page.tsx`
    - `tradeview-fusion/src/app/api/market/ohlcv/route.ts`
    - `tradeview-fusion/src/lib/providers/yahoo-unofficial.ts`
    - `tradeview-fusion/src/lib/providers/yfinance-bridge.ts`
    - `tradeview-fusion/tools/yfinance-bridge/app.py`
  - Kontext: API-Requests senden `start/end/limit`; Long-History-Queries priorisieren Yahoo/yfinance-Kette und filtern serverseitig auf den gewünschten Zeitraum.

### P2 = Plattform-Bausteine (B-Reife)

- [x] **P2.1 Persistenz-Basis (ohne aktive Auth)**
  - Ergebnis: Storage-Adapter (`local` + `db-ready` contract), Preferences-Persistenz und DB-Modell sind vorbereitet.
  - Dateien:
    - `tradeview-fusion/src/lib/storage/adapter.ts`
    - `tradeview-fusion/src/lib/storage/preferences.ts`
    - `tradeview-fusion/src/app/page.tsx`
    - `tradeview-fusion/prisma/schema.prisma`
    - `tradeview-fusion/docs/PERSISTENCE_MODEL.md`
  - Kontext: Produkt bleibt ohne Login nutzbar; DB-Anbindung kann später ohne API-Bruch aktiviert werden.

- [x] **P2.2 Replay/Backtest-Preview**
  - Ergebnis: Replay-Mode mit Play/Pause/Reset + Zeit-Scrubber und deterministischem Candle-Fortschritt ist eingebaut.
  - Dateien:
    - `tradeview-fusion/src/app/page.tsx`
    - `tradeview-fusion/src/features/trading/TradingWorkspace.tsx`

- [x] **P2.3 Streaming-Architektur-Skizze**
  - Ergebnis: ADR mit Komponenten, Risiken und Migrationspfad erstellt.
  - Datei: `tradeview-fusion/docs/ADR-001-streaming-architecture.md`

- [x] **P2.4 Realtime-Candle-Stream (SSE)**
  - Ergebnis: `/api/market/stream` liefert kontinuierlich letzte Candle-Updates je Symbol/Timeframe.
  - Dateien:
    - `tradeview-fusion/src/app/api/market/stream/route.ts`
    - `tradeview-fusion/src/app/page.tsx`
  - Kontext: Frontend merged Candle-Updates inkrementell und zeigt Reconnect-Status bei Stream-Unterbruch.

- [x] **P2.5 Orders-Backend-Basis**
  - Ergebnis: Paper-Orders laufen über API (`GET/POST/PATCH`) statt rein lokalem UI-State.
  - Dateien:
    - `tradeview-fusion/src/app/api/fusion/orders/route.ts`
    - `tradeview-fusion/src/app/api/fusion/orders/[orderId]/route.ts`
    - `tradeview-fusion/src/lib/server/orders-store.ts`
    - `tradeview-fusion/src/lib/orders/types.ts`
    - `tradeview-fusion/src/features/trading/OrdersPanel.tsx`
  - Kontext: Persistenz aktuell filebasiert in `tradeview-fusion/data/paper-orders.json` (via `.gitignore` ausgenommen), Profile-Key-gebunden.

- [x] **P2.6 Auto-Fill SL/TP (serverseitig)**
  - Ergebnis: Offene Orders mit Stop-Loss / Take-Profit werden bei Live-Preis-Treffern automatisch auf `filled` gesetzt.
  - Dateien:
    - `tradeview-fusion/src/lib/server/orders-store.ts`
    - `tradeview-fusion/src/app/api/market/quote/route.ts`
    - `tradeview-fusion/src/app/api/market/stream/route.ts`
    - `tradeview-fusion/src/app/page.tsx`
  - Kontext: Trigger läuft bei Quote-Requests und Stream-Candle-Ticks; Quote-Response liefert `executionsCount` für UI-Hinweise.

- [x] **P2.7 Orders-Persistenz auf Prisma first (mit Fallback)**
  - Ergebnis: Orders werden bei verfügbarer DB über Prisma (`PaperOrderRecord`) persistiert; bei fehlender DB automatisch File-Store.
  - Dateien:
    - `tradeview-fusion/prisma/schema.prisma`
    - `tradeview-fusion/src/lib/server/orders-store.ts`
    - `tradeview-fusion/src/lib/orders/types.ts`
  - Kontext: Fallback bleibt kompatibel für local-only Betrieb ohne `DATABASE_URL`.

## Umsetzungsreihenfolge (empfohlen)
1. P0.1 OHLCV im Chart (API first, Demo fallback) ✅
2. P0.2 Alerts an Quote-Loop ✅
3. P0.3 Symbol-Normalisierung ✅
4. P0.4 `.env.example` ✅
5. P1.1 Modularisierung ✅
6. P1.2 Signale ✅
7. P1.3 Inkrementelle Updates ✅
8. P2.x Plattform-Schritte ✅

## Risiken / Hinweise
- API-Limits variieren je Provider/Tier und ändern sich; Limits nicht hartkodieren.
- Datenlizenz/Redistribution bleibt für spätere SaaS-Stufe ein eigener Blocker.
- Auth bleibt deaktiviert bis explizite Produktentscheidung.

## Zusätzliche Alternativen (ergänzt vor Implementierungsstart)

### Provider-Optionen für Markt-/OHLCV-Daten
- Twelve Data (bereits integriert):
  - Stark für schnellen Start (REST + WebSocket, breite Asset-Coverage).
  - Credit-/Plan-gesteuert; Symbol- und WS-Limits je Tier.
- Alpha Vantage (bereits integriert):
  - Einfach für Prototyping und technische Indikator-Endpunkte.
  - Free/Premium unterscheiden sich bei Tiefe/Frequenz.
- Finnhub (bereits integriert):
  - Gute API-Abdeckung, inklusive Echtzeit-Use-Cases.
  - Für harte Produktionsanforderungen Limits/Tier explizit verifizieren.
- Alpaca Market Data:
  - Klare API + WS-Doku; Basic mit IEX-limitiertem Echtzeitumfang, Plus mit Vollabdeckung.
  - Gut, wenn später Broker-/Trading-Nähe gewünscht ist.
- Polygon:
  - Sehr stark für professionelle Echtzeit-/Historie-Setups.
  - Kosten können je nach Echtzeit/Business/Redistribution deutlich steigen.
- FMP / EODHD:
  - Breite Endpunktpalette und günstige Einstiege für Research/Backtests.
  - Produktive Nutzung braucht genaue Prüfung von Latenz/Lizenz/Qualität.
- CCXT (Krypto):
  - Sehr gute Ergänzung für Multi-Exchange-Krypto, wenn wir Crypto-Feed ausbauen.
  - Sollte als eigener Adapter laufen (nicht Hauptquelle für alle Assetklassen).

## Entscheidung für den nächsten Sprint
- Wir bleiben für P0 bei der bestehenden Provider-Schicht (Twelve + Alpha + Finnhub + Demo-Fallback).
- Neu integrieren wir jetzt bewusst noch keinen weiteren Provider, um Scope zu kontrollieren.
- Nach P0 legen wir einen kurzen Provider-Benchmark an (Latenz, Fehlerrate, Kosten/Tier, Symbolabdeckung).

## Akzeptanzkriterien für den Provider-Benchmark (nach P0)
- Für 10 repräsentative Symbole (Stocks/Crypto/FX) je Provider:
  - Erfolgsquote der OHLCV-Calls
  - Median/95p Latenz
  - Konsistenz der Candle-Granularität
  - Kosten-/Limit-Fit für unseren geplanten Refresh
- Ergebnis als kurze Tabelle in `tradeview-fusion/FUSION_NOTES.md`.

## Online verifiziert (Kurz)
- Next.js Route Handlers (App Router) als stabile API-Basis.
- Lightweight Charts API mit `update(...)` auf Series für inkrementelle Updates.
- Twelve Data/FRED offizielle Doku vorhanden; Rate-Limits abhängig von Plan/Tier.

## Quellen
- Next.js Route Handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- TradingView Lightweight Charts Series API: https://tradingview.github.io/lightweight-charts/docs/api/interfaces/ISeriesApi
- Twelve Data Docs/Pricing: https://twelvedata.com/docs , https://twelvedata.com/pricing
- Twelve Data Support (Credits/WS): https://support.twelvedata.com/en/articles/5615854-credits , https://support.twelvedata.com/en/articles/5620516-how-to-stream-the-data
- FRED API: https://fred.stlouisfed.org/docs/api/fred/
- Alpaca Market Data: https://docs.alpaca.markets/docs/about-market-data-api
- Alpaca WebSocket Stream: https://docs.alpaca.markets/docs/streaming-market-data
- Polygon Docs/Pricing: https://polygon.io/docs/ , https://polygon.io/pricing
- FMP Docs: https://site.financialmodelingprep.com/developer/docs
- EODHD Docs: https://eodhd.com/financial-apis
- Alpha Vantage Docs: https://www.alphavantage.co/documentation/
- CCXT: https://github.com/ccxt/ccxt
