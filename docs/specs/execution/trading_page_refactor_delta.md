# Trading Page Refactor Delta

> **Stand:** 14. Maerz 2026 (Rev. 4)
> **Zweck:** Execution-Slice fuer die Aufloesung der God-Component `src/app/page.tsx`.
> URL-Routing, Hook-Extraktion, Zustand Store, TanStack Query Wiring.
> **Root-Audit:** `docs/trading_page_audit.md`
> **Spec-Referenz:** `docs/specs/FRONTEND_ARCHITECTURE.md` §5, §7, §8, §9

---

## 0. Execution Contract

### Scope In

- URL-Routing: `/trading` als dedizierte Route
- Extraktion von Hooks, Komponenten, Konstanten/Utils aus page.tsx
- Zustand Store fuer Domain-Workspace-State
- TanStack Query fuer server state (OHLCV, daily signal, composite)
- SSE-Stream-Hook entkoppelt von page.tsx
- page.tsx als reine Composition (~100–150 Zeilen)

### Scope Out

- Neue Features (neue Panels, neue Indikatoren, etc.)
- GeoMap-Aenderungen
- Backend-/BFF-Aenderungen
- Design/Styling-Aenderungen

### Pflicht-Upstream

- `docs/trading_page_audit.md` — vollstaendige Bestandsaufnahme
- `docs/specs/FRONTEND_ARCHITECTURE.md` — State-Schichten, Boundaries
- `docs/specs/EXECUTION_PLAN.md` — Phase-Board

---

## 1. Non-Live Tasks (ohne Stack)

### Phase A — Routing & Cleanup

- [x] **TRF1** `src/app/trading/page.tsx` anlegen — TradingDashboard hierher verschieben (URL: `/trading`)
- [x] **TRF2** `src/app/page.tsx` zu Redirect → `/trading` (Next.js `redirect()`)
- [x] **TRF3** `CompositeSignalRoute*` Interfaces aus page.tsx in `src/features/trading/types.ts` verschieben
- [x] **TRF4** `DEFAULT_INDICATORS` in `src/features/trading/constants.ts` extrahieren
- [x] **TRF5** `formatPrice`, `formatVolume`, `componentScore` in `src/features/trading/utils.ts` extrahieren

### Phase B — Komponenten-Extraktion

- [x] **TRF6** `StatusBar.tsx` extrahieren → `src/features/trading/StatusBar.tsx`
  - Props: `dataMode`, `dataProvider`, `streamState`, `streamAgeLabel`, `streamReconnects`, `replayMode`, `replayPlaying`, `sidebarOpen`, `rightSidebarOpen`, `layout`, `activeSidebarPanel`
- [x] **TRF7** `SidebarToggles.tsx` extrahieren → `src/features/trading/SidebarToggles.tsx`
  - Props: `sidebarOpen`, `rightSidebarOpen`, `onToggleLeft`, `onToggleRight`

### Phase C — Einfache Hooks

- [x] **TRF8** `useStreamClock.ts` → `src/features/trading/hooks/useStreamClock.ts`
  - Returns: `streamClockMs: number`
- [x] **TRF9** `useWorkspaceLayout.ts` → `src/features/trading/hooks/useWorkspaceLayout.ts`
  - State: `sidebarOpen`, `rightSidebarOpen`, `activeSidebarPanel`
  - Logic: auto-route macro symbol → macro panel
- [x] **TRF10** `useWatchlist.ts` → `src/features/trading/hooks/useWatchlist.ts`
  - State: `searchQuery`, `showSearch`, `activeTab`
  - Derived: `filteredSymbols`, `popularSymbols`, `watchlistSymbols`
- [x] **TRF11** `useReplayMode.ts` → `src/features/trading/hooks/useReplayMode.ts`
  - State: `replayMode`, `replayPlaying`, `replayIndex`
  - Derived: `viewCandleData`; forward-reference fix: Aufruf vor `useMarketStream`

### Phase D — Data Hooks (TanStack Query)

- [x] **TRF12** `useChartData.ts` → `src/features/trading/hooks/useChartData.ts`
  - `useQuery` ersetzt `loadChartData` useEffect; API-first, demo-fallback im `queryFn`
  - Returns: `{ candleData, dataMode, dataProvider, dataStatusMessage, isLoading, refetch, historyWindow }`
- [x] **TRF13** `useDailySignalData.ts` → `src/features/trading/hooks/useDailySignalData.ts`
  - `useQuery({ queryKey: ['ohlcv-daily', symbol] })` — staleTime 5min
- [x] **TRF14** `useCompositeSignal.ts` → `src/features/trading/hooks/useCompositeSignal.ts`
  - `useQuery` mit debounced fingerprint, ersetzt E10 useEffect

### Phase E — Komplexe Hooks

- [x] **TRF15** `useSignalSnapshot.ts` → `src/features/trading/hooks/useSignalSnapshot.ts`
  - Pure `useMemo`; SMA50/RVOL/CMF/OBV/ATR/heartbeat — kein Fetch, kein useEffect
- [x] **TRF16** `useMarketStream.ts` → `src/features/trading/hooks/useMarketStream.ts`
  - SSE-Block extrahiert; candle events → `queryClient.setQueryData` per Spec §8
- [x] **TRF17** `usePreferencesSync.ts` → `src/features/trading/hooks/usePreferencesSync.ts`
  - hydrate (one-time mount) + push sync; biome-ignore fuer intentional [mounted]-dep

### Phase F — Zustand Store

- [x] **TRF18** `tradingWorkspaceStore.ts` → `src/features/trading/store/tradingWorkspaceStore.ts`
  - Zustand v5; State: `currentSymbol`, `favorites`, `layout`; persistiert via `writeFusionPreferences`

### Phase G — Integration & Cleanup

- [x] **TRF19** `TradingHeader` Props-Audit: nach Store-Wiring reduzieren (aktuell ~30 Props → 21)
- [x] **TRF20** `RightDetailsSidebar` Indicator-Callbacks: `useIndicatorActions` gibt jetzt `onSet*`-Keys zurück; Spread `{...indicatorActions}` typsicher
- [x] **TRF21** `src/app/trading/page.tsx`: ~340 Zeilen (Composition + inline-Handlers) — TRF19 kann weiter reduzieren
- [x] **TRF22** `bun run lint` → 0 Errors/Warnings ✓ · `bunx tsc --noEmit` → 0 Errors ✓ · Build-Gate offen (live verify)

### Phase H — Theme System (next-themes)

- [x] **TRF24** `globals.css` — `@custom-variant dark` auf alle dunklen Theme-Klassen erweitern + `.blue-dark` / `.green-dark` CSS-Variable-Bloecke
- [x] **TRF25** `providers.tsx` — `ThemeProvider` (attribute="class", defaultTheme="dark", themes=[light,dark,blue-dark,green-dark])
- [x] **TRF26** `layout.tsx` — `className="dark"` entfernen (ThemeProvider steuert das)
- [x] **TRF27** `TradingChart.tsx` — `isDarkMode: boolean` prop entfernen, `useTheme()` intern; Canvas-Farben per `resolvedTheme`
- [x] **TRF28** `TradingWorkspace.tsx` — `isDarkMode` prop entfernen
- [x] **TRF29** `TradingHeader.tsx` + TRF19 — `isDarkMode` + `onThemeToggle` + `currentSymbol` + `favorites` + `onToggleFavorite` + `onLayoutChange` entfernen; Store + useTheme intern (27 → 21 Props)
- [x] **TRF30** `CommandPalette.tsx` — `isDarkMode` + `onThemeToggle` entfernen, `useTheme()` intern
- [x] **TRF31** `usePreferencesSync.ts` — `isDarkMode` aus Options entfernen; `RemoteFusionPreferences.darkMode` optional
- [x] **TRF32** `trading/page.tsx` — `isDarkMode` useState + Handler entfernen; Komponenten-Aufrufe aktualisieren

### Phase K — Theme Picker

- [x] **TRF42** Theme-Toggle → Theme-Dropdown-Picker (SOTA 2026, Option C)
  - `TradingHeader.tsx` — binary `<Button onClick={setTheme(dark/light)}>` → `<DropdownMenu>` mit 4 Eintraegen (Light/Dark/Blue Dark/Green Dark); Trigger-Icon: Sun/Moon/Palette je nach `resolvedTheme`; aktiver Eintrag mit `<Check>`-Icon markiert
  - `CommandPalette.tsx` — einzelner "Toggle Theme"-Eintrag entfernt; neue `CommandGroup heading="Theme"` mit 4 separaten Items (Theme: Light/Dark/Blue Dark/Green Dark), aktiver Eintrag mit `<Check>`; `⌘T`-Shortcut entfernt (kein sinnvoller Single-Toggle mehr)
  - Pattern: Linear/Vercel/Raycast — Dropdown fuer Maus-User, Command Palette fuer Keyboard-User

### Phase J — Surface Polish & Component Cleanup

- [x] **TRF34** `StatusBar.tsx` — Debug-Readout (`L/R/UI/Panel`) entfernen; kein User braucht das, Dev-Artefakt
- [x] **TRF35** `SidebarToggles.tsx` — Doppelter Button fuer linke Sidebar konsolidieren; button1 war DOM-gerendert mit `translate-x-[-100%]`, button2 war Conditional — vereinfachen auf sauberes ternary
- [x] **TRF36** `SignalInsightsBar.tsx` — 3 tote `_`-Props entfernen (`sma50`, `obv`, `heartbeatCycleBars`) aus Interface + TradingWorkspace-Aufruf; Werte bleiben in `SignalSnapshot`
- [x] **TRF37** `BottomStats.tsx` — `formatPrice`/`formatVolume` direkt importieren statt als Props durchreichen; Interface-Cleanup + page.tsx
- [x] **TRF38** `WatchlistSidebar.tsx` — `currentSymbol`, `favorites`, `onToggleFavorite` aus Props entfernen; direkt aus `useTradingWorkspaceStore()` lesen (7 → 4 Props)
- [x] **TRF39** `CommandPalette.tsx` — `.slice(0, 10)` entfernen; cmdk filtert bereits per Texteingabe
- [x] **TRF40** `RightDetailsSidebar.tsx` — 25 granulare `onSet*` Props → 1 `onIndicatorsChange: (patch: Partial<IndicatorSettings>) => void`; `useIndicatorActions.ts` wird obsolet; page.tsx vereinfacht

### Phase I — Trading Surface Candidates

- [x] **TRF33** Library-Evaluation abgeschlossen (10. Mär 2026) — Entscheid: **ABLEHNEN, Custom bauen**
  - `@lab49/react-order-book` v0.1.4: letztes Release Dez 2022, peer dep `react ^16||17||18` — kein React 19 Support, de facto abandoned
  - `react-trading-ui`: ebenfalls abandoned (2020)
  - Kein anderes npm-Package mit React 19 + aktivem Maintainer gefunden (GitHub Topics Scan Feb 2026)
  - **SOTA 2026 Pattern**: Custom `OrderbookPanel` mit `useQuery` (REST snapshot `/api/v1/orderbook`) + SSE-Hook (stream `/api/v1/stream/orderbook`, identisches Pattern wie `useMarketStream`)
  - Backend-Contracts sind fertig und getestet: `OrderbookSnapshot { Bids/Asks []OrderbookLevel{Price, Amount} }`
  - Adapter trivial: `l => [l.price.toString(), l.amount.toString()]` fuer beliebige Visualisierung
  - TanStack Virtual optional — nur noetig bei >50 sichtbaren Levels; Standard sind 10–25

- [x] **TRF41** `OrderbookPanel.tsx` bauen → `src/features/trading/OrderbookPanel.tsx`
  - `useQuery` fuer REST-Snapshot (staleTime 5s), SSE-Hook fuer Live-Updates via `setQueryData`
  - Renders: Bids/Asks Tabelle mit relativer Tiefenbalken-Visualisierung (% vom Max-Volumen), Spread-Zeile
  - In `RightDetailsSidebar` als neuer Tab `"orderbook"` einhaengen (Icon: `BookOpen`)
  - Kein externer Library-Dep — nur vorhandene TanStack Query + shadcn-Primitives

### Phase L — Global Nav Shell (SOTA 2026, 14.03.2026)

> Cross-cutting: betrifft alle 4 Surfaces (trading, geopolitical-map, control, files).
> Entscheid: **Slim Persistent GlobalTopBar (40px) + Next.js Route Group `(shell)`** — kein Side-Rail, kein doppelter Header.
> Referenz: SOTA-Research 14.03.2026 (TradingView/Binance-Pattern; NN/G Vertical Nav; Next.js Route Groups).

- [x] **TRF43** `src/app/(shell)/layout.tsx` — Route Group wrapper mit `<GlobalTopBar />` (40px) + `flex-1 overflow-hidden` Content-Slot; alle Surface-Routen darin — 14.03.2026
  - Verschoben: `trading/`, `geopolitical-map/`, `control/`, `files/` → `(shell)/`
  - URL-Pfade unveraendert (`/trading`, `/geopolitical-map`, `/control`, `/files`)
- [x] **TRF44** `src/components/GlobalTopBar.tsx` — 40px persistent nav (`<header>`); extrahiert aus TradingHeader — 14.03.2026
  - Logo (Link → `/trading`) + 4 Surface-Buttons (`Trading|Map|Control|Files`) mit Active-State via `usePathname`
  - `data-testid="link-{surface}"` auf allen Buttons
  - Rechts: Uhr (hidden md) + `AlertPanel` + Account-Dropdown + Theme-Switcher
  - Kein Re-Mount beim Surface-Wechsel (App-Router Layout-Garantie)
- [x] **TRF45** `TradingHeader.tsx` → reine Chart-Toolbar (`role="toolbar"`) — 14.03.2026
  - Entfernt: Logo, Nav-Links (Map/Control/Files), Uhr, Account-Dropdown, Theme-Switcher
  - Behalten: SymbolSearch, Symbol-Badge+Favorites, TimeframeSelector, Replay-Controls, ChartTypeSelector, CompareSymbol, IndicatorPanel, Layout-Switcher, Refresh/Export/Fullscreen, SettingsPanel
  - Props-Interface unveraendert (kein Breaking-Change an Aufruf-Sites)
- [x] **TRF46** Error Pages fuer alle 4 Surfaces (framer-motion + OTel-Logging) — 14.03.2026
  - `(shell)/trading/error.tsx` — `TrendingDown`-Icon, domain=`Trading/ChartWorkspace`
  - `(shell)/geopolitical-map/error.tsx` — `ShieldX`-Icon (pre-existing), domain=`Geopolitical/D3MapCanvas`
  - `(shell)/control/error.tsx` — `SlidersHorizontal`-Icon, domain=`Control/AgentRuntime`
  - `(shell)/files/error.tsx` — `FolderX`-Icon, domain=`Files/DocumentViewer`
- [x] **TRF47** Verify-Gates fuer Shell ergaenzt (`TRF.V17–TRF.V20`) — 14.03.2026

---

## 2. Monitor / Deferred Decisions

> Kein Handlungsbedarf jetzt. Hier dokumentiert, damit der Entscheid nicht verloren geht.

- [ ] **MON-1 ChartGPU vs. lightweight-charts** — Aktuell: `lightweight-charts` v5 bleibt. `ChartGPU` (WebGL/WebGPU) nur evaluieren, falls WASM-/Rust-Chartpfad (Phase 22+) die Anforderungen nicht erfuellt oder 10k+-Kerzen-Grid entsteht. Referenz: `docs/references/projects/to-watch.md` + `FE6` in `frontend_refinement_perf_delta.md`. Entscheid bei Phase 22.
- [x] **MON-2 next-themes Theme-System** — CODE-COMPLETE (10 Mär 2026). TRF24–TRF32 implementiert. Loest ab: `isDarkMode` useState + Prop-Drilling durch 6 Komponenten. Live-Verify: TRF.V9.
- [x] **MON-3 Orderbook-UI Candidate** — EVALUIERT (10. Mär 2026). Kein taugliches npm-Package (alle abandoned oder React 19-inkompatibel). Entscheid: Custom `OrderbookPanel` (TRF41). Kein externer Dep noetig.

---

## 3. Live Verify Gates (vorerst offen)

- [ ] **TRF.V1** `/trading` laedt korrekt — Chart erscheint, Symbol-Wechsel funktioniert
- [ ] **TRF.V2** `/` redirectet korrekt zu `/trading` (oder Landing erscheint)
- [ ] **TRF.V3** SSE-Stream aktiv nach Refactor — `streamState: live` erscheint in StatusBar
- [ ] **TRF.V4** Replay-Mode funktioniert — Play/Pause/Seek/Reset wie zuvor
- [ ] **TRF.V5** Chart-Data-Load bei Symbol- und Timeframe-Wechsel — kein Race-Condition
- [ ] **TRF.V6** Composite Signal erscheint in RightDetailsSidebar nach Datenload
- [ ] **TRF.V7** Preferences sync: Favoriten und Layout bleiben nach Page-Refresh erhalten
- [ ] **TRF.V8** Indicator-Toggles in RightDetailsSidebar funktionieren nach Props-Audit
- [ ] **TRF.V9** Theme-Toggle funktioniert — light/dark/blue-dark/green-dark wechseln korrekt; Chart-Canvas-Farben passen; kein Hydration-Flash beim SSR
- [ ] **TRF.V10** Indicator-Toggles nach TRF40 — alle Indikatoren (SMA/EMA/RSI/MACD/BB/ATR/Keltner etc.) toggeln korrekt ueber neuen `onIndicatorsChange`-Handler
- [ ] **TRF.V11** Sidebar-Toggles nach TRF35 — links oeffnen/schliessen zeigt korrektes Tab-/Button-Visual ohne DOM-Geister
- [ ] **TRF.V15** Theme-Dropdown in TradingHeader — Klick oeffnet Dropdown mit 4 Eintraegen; aktiver Eintrag hat Check-Icon; alle 4 Themes wechseln korrekt; Trigger-Icon aendert sich (Sun/Moon/Palette)
- [ ] **TRF.V16** Theme-CommandPalette — ⌘K oeffnet Palette; "Theme"-Gruppe mit 4 Items sichtbar; aktiver Eintrag hat Check; alle 4 setTheme-Calls funktionieren
- [ ] **TRF.V12** Orderbook-Tab in RightDetailsSidebar — Tab erscheint mit BookOpen-Icon; REST-Snapshot laedt Bids/Asks-Tabelle; Tiefenbalken sichtbar; Spread-Zeile korrekt; SSE-Stream liefert Live-Updates (Preise aendern sich ohne Reload)
- [ ] **TRF.V13** WatchlistSidebar nach TRF38 — Symbol-Highlight + Favoriten-Toggle korrekt ohne Props aus page.tsx (Store-only); kein Regressionsfehler bei Symbol-Wechsel
- [ ] **TRF.V14** CommandPalette nach TRF39 — Suche zeigt alle Symbole aus ALL_FUSION_SYMBOLS (nicht nur erste 10); Texteingabe filtert korrekt

### Shell / GlobalTopBar (Live-Verify noetig)

- [ ] **TRF.V17** `GlobalTopBar` sichtbar auf allen 4 Surfaces — `/trading`, `/geopolitical-map`, `/control`, `/files` — jeweils 40px am oberen Rand; kein Layout-Shift beim Surface-Wechsel
- [ ] **TRF.V18** Active-State korrekt: nur der aktive Surface-Button `bg-accent`; alle anderen `text-muted-foreground`; korrekt nach Browser-Reload
- [ ] **TRF.V19** `TradingHeader` zeigt weder Logo noch Nav-Links — nur Chart-Toolbar; `role="toolbar"` im DOM
- [ ] **TRF.V20** Error Pages ausloesbar: Fehler in Surface-Component → framer-motion Error-Card mit domain-spezifischem Icon + Reset-Button → `reset()` stellt Surface wieder her; Hard-Reload-Link funktioniert

---

## 4. Reihenfolge und Abhaengigkeiten

```
A (Routing + Cleanup)
  ↓
B (Komponenten) — unabhaengig von A
  ↓
C (Einfache Hooks) — nach B
  ↓
D (TanStack Query Hooks) — nach C
  ↓
E (Komplexe Hooks) — D muss zuerst (useChartData liefert candleData fuer Stream-Integration)
  ↓
F (Zustand Store) — E muss zuerst (Callbacks werden vereinfacht)
  ↓
G (Integration + Cleanup) — alle vorherigen
  ↓
Live Verify Gates
```

---

## 5. Evidence Requirements

- TRF-ID + geaenderte Dateipfade
- Vor/Nach Zeilenanzahl in page.tsx bei jedem Phase-Abschluss
- `bun run lint` Output nach Phase G
- Screenshot oder Browser-Log fuer Live Gates

---

## 6. Dead Code / Cleanup

### `src/features/trading/useIndicatorActions.ts` — DEAD FILE

**Status:** Obsolet seit TRF40 (10. Maerz 2026). Kann geloescht werden.

**Grund:** TRF40 hat die 25 granularen `onSet*`-Props in `RightDetailsSidebar` durch einen einzigen
`onIndicatorsChange: (patch: Partial<IndicatorSettings>) => void` ersetzt. Der Hook
`useIndicatorActions` hatte genau diese 25 Setter gebaut und per `{...indicatorActions}` in
`page.tsx` an `RightDetailsSidebar` weitergegeben. Da der Spread-Pattern entfernt und stattdessen
`handleIndicatorsChange` (inline `setIndicators(prev => ({ ...prev, ...patch }))`) in `page.tsx`
direkt definiert wurde, hat kein Modul mehr einen Import auf `useIndicatorActions`.

**Aktion:** `git rm src/features/trading/useIndicatorActions.ts` beim naechsten Cleanup-Commit.
