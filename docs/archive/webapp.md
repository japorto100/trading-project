# Webapp Status -- TradeView Pro

> **Status (09. Maerz 2026):** Archivierte operative Arbeitsnotiz. Nicht mehr als
> aktive Architekturquelle verwenden. Fuer Frontend-Ownership siehe
> `docs/specs/FRONTEND_ARCHITECTURE.md`; fuer aktive UI-Surfaces siehe
> `docs/FRONTEND_COMPONENTS.md`.

> Stand: 2026-02-25 | Stack: Next.js 16.1.6 (Turbopack), Go Gateway, Python Services, GCT (Kraken)  
> **Zweck: Arbeitsdokument.** Hier werden Frontend-Bugs, Fixes, Visual Audits und Test-Ergebnisse dokumentiert. Kein Architektur-Dokument -- dafÃ¼r siehe [`FRONTEND_ARCHITECTURE.md`](./FRONTEND_ARCHITECTURE.md).  
> **Nutzung:** WÃ¤hrend der Entwicklung: Bug entdeckt â†’ hier notieren â†’ Fix beschreiben â†’ Status setzen. Nach jeder Phase: Visual Audit Ergebnis hier festhalten.

---

## 1. Funktioniert (getestet)

### Chart & Daten
- **Candlestick-Chart (TradingView)** -- laed korrekt, zeigt OHLC + Volume
- **Live-Preise** -- Watchlist aktualisiert sich real-time ueber CCXT/REST-Provider
- **Timeframe-Wechsel** -- 1m, 3m, 5m, 15m, 30m, 1H, 2H, 4H, 1D, 1W, 1M funktionieren
- **Symbol-Wechsel** -- Klick in Watchlist wechselt Header, Chart, Signal-Leiste
- **Data Source** -- "Demo" Modus mit Stream: Live
- **Signal-Leiste** -- SMA50, Last Cross, RVOL, CMF, OBV, Rhythm, ATR berechnet und angezeigt
- **Bar-Cap Warning** -- "Requested range exceeded bar cap for 1H; showing latest 5000 bars."

### Layout & Sidebars (Neu)
- **3-Spalten Layout:** Watchlist (Links) | Chart (Mitte) | Details (Rechts)
- **Resizable:** Alle Panels sind in der Breite verstellbar (`react-resizable-panels`)
- **Left Sidebar:** Reine Watchlist mit Kategorien (Crypto, Stocks, FX, etc.)
- **Right Sidebar:** Tabs fuer Indicators, News, Orders, Portfolio

### Indikatoren (Right Sidebar)
16 Indikatoren mit Toggle-Switches:
SMA, EMA, RSI, MACD, Bollinger Bands, VWAP, VWMA, ATR, SMA+/-ATR Channel,
HMA, ADX, Ichimoku, Parabolic SAR, Keltner, Volume Profile, Support/Resistance

### Navigation & Menus
- **Top Header:** Symbol-Suche, Timeframes, Replay-Controls, Globale Actions (Refresh, Screenshot, Fullscreen, Settings)
- **Chart Header:** History Range (From Year), Chart Type, Compare, Active Indicator Badges
- **Geopolitical Map:** Button im Top Header

### GeoMap
- **Route:** `/geopolitical-map`
- Features: Heatmap, Soft Signal Pulses, Timeline, Event Inspector

---

## 2. GCT Integration
- GoCryptoTrader verbunden: `connected: true` (Kraken, public data)
- gRPC auf `127.0.0.1:9052`
- JSON-RPC auf `https://127.0.0.1:9053` (InsecureTLS fuer self-signed cert)

---

## 3. Behobene Bugs (2026-02-16)

### Bug 1-7 (Archiviert)
Siehe vorherige Versionen fuer Details zu Scroll-Fixes, Timeouts und Layout-Bugs.

### Bug 8: Watchlist-Tabs ueberlappen Filter-Input
- **Problem:** Die neuen Tabs "Comm" und "Index" wrappen in eine zweite Zeile.
- **Fix:** `h-auto` zu `TabsList` hinzugefuegt + `overflow-x-auto` mit `scrollbar-hide` und Gradient-Fade.
- **Status:** Bestaetigt behoben.

### Bug 9: BottomStats "komischer Balken"
- **Problem:** Ein Toggle-Balken mit "0.000000" erscheint initial.
- **Fix:** Komponente rendert jetzt erst wenn `lastPrice > 0`.
- **Status:** Bestaetigt behoben.

### Bug 10 & 11: Chart-Crash & ReferenceError
- **Problem:** `ReferenceError: showDrawingToolbar is not defined`.
- **Ursache:** State wurde beim Refactoring vergessen.
- **Fix:** State in `page.tsx` wiederhergestellt.
- **Status:** Bestaetigt behoben.

---

## 7. Phase 1 & 2 Redesign (Completed 2026-02-16)

### 7.1 UI Refinement & Layout Split
- **Dual-Sidebar Architektur:**
  - `TradingSidebar.tsx` wurde **aufgeteilt** (ist jetzt Legacy/Dead Code).
  - **Links (`WatchlistSidebar.tsx`):** Fokus auf Symbol-Navigation.
  - **Rechts (`RightDetailsSidebar.tsx`):** Kontext-Tabs (Indic, News, Orders, Port).
- **Timeframes:** Erweiterung um `3m` und `2H` inkl. Provider-Mappings.
- **Header Optimierung:**
  - **Replay:** Controls vom Chart-Overlay in den Top-Header verschoben.
  - **History Range:** "From Year" Input direkt in den Chart-Header (nahe der Zeitachse) verschoben.
- **Resizable Panels:** Implementierung eines modernen, flexiblen Layouts.

### 7.2 Geopolitical Map
- **Conflict Heatmap:** LÃ¤nderspezifische EinfÃ¤rbung nach Event-Severity.
- **Soft Signals:** Animierte "Glowing Pulses" fÃ¼r aufkommende Risiken.
- **Navigation:** Nahtlose Integration mit dem Trading-Workspace.

---

## 8. Visual Audit Results
- **Dashboard:** Layout wirkt professionell ("TradingView-Style"). Platznutzung durch vertikale Toolbar und Header-Integration optimiert.
- **Interaktion:** Sidebars lassen sich flÃ¼ssig auf/zu-klappen und resizen.
- **Code Health:** Biome Linting ohne Fehler.

---

## 9. Recommended Workflow

1. **Start Full Stack:**
   ```bash
   bun run dev:full:gct
   ```
2. **Entwicklung:**
   - Frontend: `src/app/page.tsx` (Main Layout), `src/features/trading/` (Komponenten).
   - `TradingSidebar.tsx` ignorieren (Legacy).

---

## 10. SOTA UI/UX & Tailwind v4 Strategy

Um die Plattform auf Professional-Niveau zu heben, werden folgende Konzepte implementiert:

### 10.1 High-Performance Workstation Layout
- **Dynamic Bento Grid:** Weiterentwicklung der Resizable Panels hin zu einem frei konfigurierbaren Dashboard (User-defined Layouts).
- **Focus Mode (Zen):** Shortcut zum Ausblenden aller UI-Elemente außer dem Haupt-Chart (maximale Immersion).
- **Command Palette (Cmd+K):** Integration einer zentralen Steuerung fuer Asset-Suche, Indikator-Wechsel und Order-Execution.

### 10.2 Tailwind v4 & Chromatic Design
- **OKLCH Colors:** Umstellung der Kern-Farbpalette (Profit/Loss, Signals) auf OKLCH fuer lebendigere, konsistente Farben auf modernen Displays.
- **Glassmorphism 2.0:** Subtile Nutzung von Transparenz und Blur (backdrop-blur) fuer Overlays, ohne die Lesbarkeit zu beeintraechtigen.
- **Subtle Glows:** Aktive Signale oder gefuellte Patterns (XABCD) erhalten dezente Outer-Glows zur visuellen Priorisierung.

### 10.3 Real-time Feedback Loop
- **Micro-Interactions:** Background-Flashes oder Border-Highlights bei Preis-Ticks (Price Pulse).
- **Skeleton Flow:** Optimierte Loading-States, die exakt die Geometrie der finalen Widgets widerspiegeln.
- **Canvas-Backed Widgets:** Fuer extrem schnelle Daten (Orderbooks) wird von React-DOM auf Canvas-Rendering innerhalb der Widgets umgestellt, um die 120Hz-Fluiditaet zu garantieren.

### 10.4 Intelligence Integration
- **Context-Aware Overlays:** Smart Tooltips, die beim Hover ueber Harmonic Patterns direkt die statistische Wahrscheinlichkeit des Breakouts anzeigen.
- **Global State Sync:** Nahtlose Synchronisation zwischen der Geopolitical Map und dem Trading-Asset (z.B. Highlighten von Öl-Events, wenn WTI/Brent getradet wird).

---

## 11. Implementation Progress (SOTA Upgrades) -- 2026-02-25

### 11.1 Core UI
- [x] **Command Palette:** `Cmd+K` global verfuegbar (Dashboard & Map).
- [x] **AI Shortcuts:** `Cmd+J` (Chat) und `Cmd+Shift+A` (Audio) als Platzhalter registriert.
- [x] **OKLCH Migration:** Kern-Variablen in `globals.css` auf OKLCH umgestellt (inkl. subtilem Blue-Tint im Dark Mode).
- [x] **Semantic Colors:** `--success` und `--error` für Trading-Signale definiert.

### 11.2 Interactive Elements
- [x] **Price Pulse:** Visuelles Feedback in `BottomStats` bei Preisänderungen (OKLCH Green/Red Flash).
- [x] **Glassmorphism:** `backdrop-blur` auf alle Sidebars und die Geopolitical Map Overlays angewendet.
- [x] **Chart Styling:** TradingView Charts nutzen jetzt die systemweiten OKLCH-Farben für Background, Grid und Candles.

### 11.3 Map Enhancements
- [x] **HUD-Style Overlays:** Map-Controls und Info-Popups nutzen jetzt Glassmorphismus und Chromatic Glows.

### 11.4 Future SOTA Opportunities (Identified via Visual Audit)
- **Context HUD (SignalInsightsBar):** Umwandlung der flachen Badge-Liste in ein dreigeteiltes Dashboard (Regime, Volume, AI Score) mit Icons und Mini-Gauges für bessere visuelle Hierarchie.
- **Dynamic OHLC Header:** Implementierung von "Number Flip"-Animationen für die Open/High/Low/Close Werte bei Chart-Hover sowie konsequente Nutzung der semantischen OKLCH-Farben.
- **Connectivity Dot:** Reduzierung der Status-Badges ("Market ready", "Provider: demo") auf einen pulsierenden Status-Indikator im Haupt-Header für ein aufgeräumteres UI.
- **Watchlist Hover Effects:** Dezenter `shadow-chromatic` Glow bei Hover in den Watchlist-Zeilen.
- **Custom Floating Legend:** Ersetzen der statischen Lightweight-Charts-Legende durch ein über dem Chart schwebendes, per Glassmorphismus gestyltes Overlay.

### 11.5 Implementation Progress Update -- 2026-02-25
- [x] **SOTA Order Ticket:** Visuelle R:R Gauge und dynamische Side-Tints (Green/Red) implementiert.
- [x] **Scroll Consistency:** Alle Sidebars (Dashboard & Map) nutzen nun `ScrollArea`.
- [x] **Header Refinement:** Einheitliche SOTA-Header (10px Bold Caps) fuer alle Panels.
- [x] **Bottom Panel Fix:** Detail-Grid in `BottomStats` ist nun scrollbar und nicht mehr abgeschnitten.

---

## 12. Next Level SOTA Recommendations (Phase 5+)

Um die Marktführerschaft im Bereich UI/UX zu zementieren, werden folgende "Next Level" Features empfohlen:

### 12.1 Dynamic Liquid Depth
- **Depth HUD:** Ein vertikaler Canvas-Indikator direkt neben der Chart-Preisskala, der das Orderbuch-Volumen (Liquidität) in Echtzeit visualisiert.
- **Sentiment Glow:** Das News-Panel erhaelt einen pulsierenden Border-Glow, dessen Farbe sich nach dem aggregierten Sentiment der neuesten Schlagzeilen richtet (Bullish = Emerald, Bearish = Rose).

### 12.2 AI-Driven Immersion
- **Cmd+J Focus Mode:** Beim Starten des AI-Chats wird der Rest des UIs dezent abgedunkelt, um den Fokus voll auf die Analyse-Konversation zu legen.
- **Audio Pulse Visualizer:** Wenn `Cmd+Shift+A` (Audio) aktiv ist, zeigt das "Connectivity HUD" eine minimalistische Waveform-Animation anstelle des Dots.

### 12.3 Professional HUD Elements
- **Floating Legend:** Die statische Chart-Legende (oben links im Chart) wird durch eine schwebende Glassmorphism-Card ersetzt, die per Drag&Drop verschiebbar ist.
- **Fill Flash:** Bei Ausfuehrung einer Order erfaehrt der gesamte Bildschirmrand einen Millisekunden-kurzen "Chromatic Flash" in der Farbe der Order-Seite (Execution Feedback).
