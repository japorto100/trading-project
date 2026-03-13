# Trading Page Audit

> **Stand:** 10. Maerz 2026
> **Zweck:** Vollstaendige Bestandsaufnahme von `src/app/page.tsx` (Trading Dashboard).
> Grundlage fuer `docs/specs/execution/trading_page_refactor_delta.md`.
> **Nicht dieses Dokuments:** Implementierungsdetails, GeoMap, Auth-Flows.

---

## 1. Problem-Summary

`src/app/page.tsx` ist eine 1217-Zeilen God-Component:
- TradingDashboard lebt auf `/` statt auf `/trading`
- 31 `useState` + 4 Refs + 10 `useEffect` + 8 `useMemo` + 14 `useCallback` — alles inline
- 230-Zeilen SSE-Handler direkt in page.tsx
- Inline Render-Logik die eigene Komponenten waeren
- Inline Types/Consts/Helpers die in `types.ts` / `constants.ts` gehoeren
- Kein Zustand Store fuer Domain-Workspace-State (per Spec Pflicht)
- Kein TanStack Query fuer server state (per Spec Pflicht)

**Spec-Referenz:** `docs/specs/FRONTEND_ARCHITECTURE.md` §5 (State-Schichten), §8 (Realtime), §9 (Offene Arbeit)

---

## 2. Datei-IST

```
src/app/page.tsx   1217 Zeilen
```

Einziger Export: `Home()` → wrapped `<TradingDashboard>` in `<Suspense>`.
Die gesamte Applogik sitzt in `TradingDashboard`.

---

## 3. Komponenten-Inventar

### 3a. Bereits extrahiert — features/trading/

| Datei | Rolle |
|:------|:------|
| `TradingHeader.tsx` | Top-Header mit Symbol-Search, Timeframe, Controls, Replay |
| `TradingWorkspace.tsx` | Chart-Bereich + DrawingToolbar + Pattern Overlays |
| `TradingPageSkeleton.tsx` | Loading-Skeleton (SSR-Guard) |
| `WatchlistSidebar.tsx` | Linke Sidebar: Symbol-Liste, Tabs, Favoriten |
| `RightDetailsSidebar.tsx` | Rechte Sidebar: Panels-Container (Indicators/Orders/Portfolio/etc.) |
| `BottomStats.tsx` | Preisstatistiken-Leiste unten |
| `CommandPalette.tsx` | Cmd+K Palette |
| `SignalInsightsBar.tsx` | Signal-Insights-Anzeige |
| `TradingSidebar.tsx` | Sidebar-Wrapper |
| `TopMenuBar.tsx` | Menue-Leiste |
| `OrdersPanel.tsx` | Paper-Trading-Orders-Panel |
| `PortfolioPanel.tsx` | Portfolio-Uebersicht |
| `PortfolioAnalyticsPanel.tsx` | Portfolio-Analytik |
| `PortfolioOptimizePanel.tsx` | Portfolio-Optimierung + VPIN |
| `KellyAllocationPanel.tsx` | Kelly-Allokation |
| `MonteCarloVarPanel.tsx` | Monte Carlo VaR |
| `RegimeSizingPanel.tsx` | Regime-Detection-Panel |
| `MacroPanel.tsx` | Makro-Overlay-Panel |
| `NewsPanel.tsx` | News-Feed |
| `LiveBalancesPanel.tsx` | Live-Balances |
| `StrategyLabPanel.tsx` | Strategy-Lab |
| `useIndicatorActions.ts` | Hook: Alle Indicator-Setter-Actions |
| `types.ts` | Trading-Typen |

### 3b. Bereits extrahiert — components/

| Datei | Rolle |
|:------|:------|
| `TradingChart.tsx` | Chart-Komponente (lightweight-charts) |
| `IndicatorPanel.tsx` | Indicator-Settings-Panel |
| `DrawingToolbar.tsx` | Zeichenwerkzeuge |
| `ChartTypeSelector.tsx` | Chart-Typ-Auswahl |
| `TimeframeSelector.tsx` | Timeframe-Auswahl |
| `AlertPanel.tsx` | Alert-Panel |
| `CompareSymbol.tsx` | Symbol-Vergleich |
| `fusion/SymbolSearch.tsx` | Symbol-Suche |
| `fusion/WatchlistPanel.tsx` | Watchlist-Panel |
| `fusion/watchlist/WatchlistFilterBar.tsx` | Filter-Leiste |
| `fusion/watchlist/WatchlistRow.tsx` | Watchlist-Zeile |
| `fusion/watchlist/WatchlistStreamStatus.tsx` | Stream-Status |

### 3c. NICHT extrahiert — noch inline in page.tsx

| Was | Zeilen | Soll werden |
|:----|:-------|:------------|
| `StatusBar` | 1027–1076 | `features/trading/StatusBar.tsx` |
| `SidebarToggles` | 1169–1198 | `features/trading/SidebarToggles.tsx` |

---

## 4. State-Inventar (31 useState + 4 Refs)

| State | Typ | Soll-Ziel |
|:------|:----|:----------|
| `isDarkMode` | `boolean` | Zustand Store oder `usePreferencesSync` |
| `currentSymbol` | `FusionSymbol` | **Zustand Store** (Domain-State per Spec §5) |
| `currentTimeframe` | `TimeframeValue` | **Zustand Store** |
| `historyRangePreset` | `HistoryRangePreset` | `useChartData` |
| `customStartYear` | `number` | `useChartData` |
| `chartType` | `ChartType` | lokal oder Zustand Store |
| `indicators` | `IndicatorSettings` | lokal (UI-state per Spec §5) |
| `candleData` | `OHLCVData[]` | **TanStack Query** |
| `dailySignalData` | `OHLCVData[]` | **TanStack Query** |
| `loading` | `boolean` | entfaellt mit TanStack Query |
| `dataMode` | `DataMode` | aus Query-Result abgeleitet |
| `dataProvider` | `string` | aus Query-Result abgeleitet |
| `dataStatusMessage` | `string \| null` | lokal |
| `searchQuery` | `string` | `useWatchlist` |
| `showSearch` | `boolean` | `useWatchlist` |
| `layout` | `LayoutMode` | **Zustand Store** |
| `favorites` | `string[]` | **Zustand Store** |
| `activeTab` | `WatchlistTab` | `useWatchlist` |
| `activeSidebarPanel` | `SidebarPanel` | **Zustand Store** |
| `sidebarOpen` | `boolean` | `useWorkspaceLayout` |
| `rightSidebarOpen` | `boolean` | `useWorkspaceLayout` |
| `showDrawingToolbar` | `boolean` | lokal (konstant `true`) |
| `compareSymbol` | `string \| null` | lokal |
| `replayMode` | `boolean` | `useReplayMode` |
| `replayPlaying` | `boolean` | `useReplayMode` |
| `replayIndex` | `number` | `useReplayMode` |
| `remoteHydrated` | `boolean` | `usePreferencesSync` |
| `streamState` | enum | `useMarketStream` |
| `streamReconnects` | `number` | `useMarketStream` |
| `streamLastTickAt` | `number \| null` | `useMarketStream` |
| `streamClockMs` | `number` | `useStreamClock` |
| `compositeSignalInsights` | object | **TanStack Query** |

**Refs:** `requestSequenceRef`, `dailySignalRequestRef`, `lastQuoteBySymbolRef`, `streamDegradedRef`
→ alle wandern in ihre jeweiligen Hooks

---

## 5. useEffect-Inventar (10 Effects)

| # | Zweck | Soll-Ziel |
|:--|:------|:----------|
| E1 | Dark-mode DOM sync | `usePreferencesSync` |
| E2 | Stream-Clock 1s-Ticker | `useStreamClock` |
| E3 | Symbol-Wechsel → clamp start year | `useChartData` |
| E4 | Macro-Symbol → auto-route sidebar | bleibt in page.tsx oder `useWorkspaceLayout` |
| E5 | Chart data load (reaktiv) | **TanStack Query** (entfaellt) |
| E6 | SSE Streaming (230 Zeilen) | `useMarketStream` |
| E7 | Daily signal data load | **TanStack Query** (entfaellt) |
| E8 | Remote preferences hydrate | `usePreferencesSync` |
| E9 | Remote preferences push/sync | `usePreferencesSync` |
| E10 | Composite signal fetch (debounced) | **TanStack Query** (entfaellt) |
| E11 | Replay mode/playing effects | `useReplayMode` |

---

## 6. useMemo-Inventar (8+)

| Memo | Soll-Ziel |
|:-----|:----------|
| `symbolMinimumStartYear` | `useChartData` |
| `historyWindow` | `useChartData` |
| `streamLastTickAgeSec` | `useMarketStream` |
| `viewCandleData` (replay slice) | `useReplayMode` |
| `stats` (OHLCV-Statistiken) | `useSignalSnapshot` oder `BottomStats` intern |
| `signalSnapshot` | `useSignalSnapshot` |
| `compositeSignalOhlcv` | `useCompositeSignal` |
| `allSymbols`, `filteredSymbols`, `popularSymbols`, `watchlistSymbols` | `useWatchlist` |

---

## 7. Inline-Definitionen die ausgelagert werden muessen

| Was | Typ | Soll-Ziel |
|:----|:----|:----------|
| `CompositeSignalRouteComponent` | Interface | `features/trading/types.ts` |
| `CompositeSignalRouteData` | Interface | `features/trading/types.ts` |
| `CompositeSignalRouteResponse` | Interface | `features/trading/types.ts` |
| `DEFAULT_INDICATORS` | Const | `features/trading/constants.ts` |
| `componentScore()` | Util-Fn | `features/trading/utils.ts` |
| `formatPrice()` | Format-Fn | `lib/format.ts` oder `features/trading/utils.ts` |
| `formatVolume()` | Format-Fn | `lib/format.ts` oder `features/trading/utils.ts` |

---

## 8. Spec-Verstösse (FRONTEND_ARCHITECTURE.md)

| Paragraph | Verstoss |
|:----------|:---------|
| §5 "Query-/server state nicht in ad hoc useEffect-Ketten" | `loadChartData`, `loadDailySignalData`, composite signal — alle useEffect-basiert, kein TanStack Query |
| §5 "Domain workspace state → Zustand" | `currentSymbol`, `favorites`, `layout`, `activeSidebarPanel` ohne Store |
| §8 "SSE-Events aktualisieren Query-Cache kontrolliert" | 230-Zeilen SSE-Handler in page.tsx, kein Query-Cache-Update |
| §6 "features/trading/* → Trading workspace composition" | page.tsx ist keine Composition, sondern die gesamte App |
| §9 "Trading-Workspace in kleinere Ownership-Blöcke schneiden" | Explizit als offene Arbeit aufgefuehrt |

---

## 9. URL-Problem

| IST | SOLL |
|:----|:-----|
| `src/app/page.tsx` → `/` | `src/app/trading/page.tsx` → `/trading` |
| — | `src/app/page.tsx` → Redirect zu `/trading` oder Landing-Page |

Begruendung: weitere Pages kommen (Research, Portfolio-View, Settings, etc.).
Jede Primary Surface braucht ihre eigene URL per `FRONTEND_ARCHITECTURE.md §7`.

---

## 10. Extraktionsplan — 18 neue Dateien

### Neue Route (1)
```
src/app/trading/page.tsx                              ← TradingDashboard
src/app/page.tsx                                      ← Redirect zu /trading
```

### Neue Komponenten (2)
```
src/features/trading/StatusBar.tsx                    ← Zeilen 1027–1076
src/features/trading/SidebarToggles.tsx               ← Zeilen 1169–1198
```

### Neue Konstanten/Utils (2)
```
src/features/trading/constants.ts                     ← DEFAULT_INDICATORS, formatPrice, formatVolume, componentScore
src/features/trading/types.ts                         ← + CompositeSignalRoute* Interfaces (bereits existent, erweiterbar)
```

### Neue Custom Hooks (10)
```
src/features/trading/hooks/useStreamClock.ts          ← 1s-Ticker
src/features/trading/hooks/useMarketStream.ts         ← 230-Zeilen SSE-Block
src/features/trading/hooks/useChartData.ts            ← TanStack Query fuer OHLCV
src/features/trading/hooks/useDailySignalData.ts      ← TanStack Query fuer daily OHLCV
src/features/trading/hooks/useCompositeSignal.ts      ← TanStack Query fuer composite signal
src/features/trading/hooks/useSignalSnapshot.ts       ← SMA50/RVOL/CMF/OBV/ATR/heartbeat
src/features/trading/hooks/useReplayMode.ts           ← Replay state + Effects
src/features/trading/hooks/useWorkspaceLayout.ts      ← sidebar open/close + activeSidebarPanel
src/features/trading/hooks/useWatchlist.ts            ← symbols, filter, favorites
src/features/trading/hooks/usePreferencesSync.ts      ← hydrate + push remote prefs
```

### Neuer Zustand Store (1)
```
src/features/trading/store/tradingWorkspaceStore.ts   ← currentSymbol, favorites, layout (Domain-State)
```

### Ergebnis
`src/app/trading/page.tsx` nach Extraktion: ~100–150 Zeilen (reine Composition).

---

## 11. SOTA 2026 Package-Empfehlungen

| Bereich | Aktuell | Empfehlung |
|:--------|:--------|:-----------|
| Server State | ad hoc useEffect | TanStack Query 5 `useQuery` — bereits im Projekt vorhanden |
| Domain State | useState in page | Zustand v5 — bereits im Projekt vorhanden |
| SSE Integration | inline EventSource | Custom hook + `queryClient.setQueryData()` fuer Cache-Update |
| Format Utils | inline Fns | `Intl.NumberFormat` nativ (kein extra Package nötig) |
| Debounce | `useDebouncedValue` | behalten (bereits in `lib/hooks/`) |

Keine neuen Packages nötig — alle benötigten Tools sind bereits installiert.
