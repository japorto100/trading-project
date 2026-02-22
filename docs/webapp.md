# Webapp Status -- TradeView Pro

> Stand: 2026-02-16 | Stack: Next.js 16.1.6 (Turbopack), Go Gateway, Python Services, GCT (Kraken)  
> **Zweck: Arbeitsdokument.** Hier werden Frontend-Bugs, Fixes, Visual Audits und Test-Ergebnisse dokumentiert. Kein Architektur-Dokument -- dafür siehe [`FRONTEND_ARCHITECTURE.md`](./FRONTEND_ARCHITECTURE.md).  
> **Nutzung:** Während der Entwicklung: Bug entdeckt → hier notieren → Fix beschreiben → Status setzen. Nach jeder Phase: Visual Audit Ergebnis hier festhalten.

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
- **Conflict Heatmap:** Länderspezifische Einfärbung nach Event-Severity.
- **Soft Signals:** Animierte "Glowing Pulses" für aufkommende Risiken.
- **Navigation:** Nahtlose Integration mit dem Trading-Workspace.

---

## 8. Visual Audit Results
- **Dashboard:** Layout wirkt professionell ("TradingView-Style"). Platznutzung durch vertikale Toolbar und Header-Integration optimiert.
- **Interaktion:** Sidebars lassen sich flüssig auf/zu-klappen und resizen.
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
