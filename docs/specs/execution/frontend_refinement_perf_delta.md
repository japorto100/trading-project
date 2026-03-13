# Frontend Refinement & Performance Delta

> **Stand:** 12. Maerz 2026 (Rev. 3)
> **Zweck:** Aktiver Delta-Plan fuer Phase 21/22: Frontend-Refinement,
> Surface-Konsistenz, Query-/State-Haertung und Performance-Gates.
> **Aenderungshistorie:**
> - Rev. 3 (12.03.2026): MON-1 IMPLEMENTIERT (Pacer Debounce); MON-3 IMPLEMENTIERT (Virtual Threshold 50); MON-2 Timing klargestellt; MON-4 Scaffold erstellt + Phase 22a in EXECUTION_PLAN; MON-5 Phase-20-Verweis ergaenzt
> - Rev. 2 (10.03.2026): TanStack-Ecosystem-Evaluation (Pacer/Form/Virtual/AI/DB), MON-1–MON-5; FE1-Kontext nach TRF1–TRF42 praezisiert

---

## 0. Execution Contract

### Scope In

- Frontend-Strukturverbesserungen (Routing, Contracts, Surface-Klarheit)
- UI-/Component-Schnitt aus `FRONTEND_COMPONENTS.md`
- Performance-/A11y-/Browser-Gates fuer produktnahe Surfaces
- TanStack-Ecosystem-Adoption (Pacer, Form, Virtual) an geeigneten Stellen

### Scope Out

- Backend-/Provider-Rollout-Details ohne Frontend-Auswirkung
- GeoMap-Engine-Details ausserhalb der Frontend-Surfaces

### Mandatory Upstream Sources

- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/FRONTEND_COMPONENTS.md`
- `docs/specs/ERRORS.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/cross_cutting_verify.md`
- `docs/geo/GEOMAP_VERIFY_GATES.md`

---

## 1. Offene Deltas

- [x] **FE1** Frontend-Surface-Matrix gegen aktuelle Routen/Panel-Flows synchronisieren (12.03.2026)
  - **Kontext nach TRF1–TRF42 (10.03.2026):** Trading-Page God-Component aufgeloest.
    Folgende Realitaeten sind noch nicht in `FRONTEND_COMPONENTS.md` / `FRONTEND_ARCHITECTURE.md` reflektiert:
    - `/trading` als dedizierte Route (war: `/`)
    - 10 extrahierte Custom Hooks unter `src/features/trading/hooks/`
    - `tradingWorkspaceStore` (Zustand v5) als neuer State-Owner fuer Symbol/Favorites/Layout
    - `useOrderbookStream` + `OrderbookPanel` (SSE + REST Snapshot, TRF41)
    - Theme-Picker (TRF42): DropdownMenu + CommandPalette-Gruppe, 4 Themes
    - `onIndicatorsChange`-Contract (TRF40): single patch-Handler statt 25 Props
    - `WatchlistSidebar` store-only (TRF38), `BottomStats` direkt-import (TRF37)
    - Dead File: `useIndicatorActions.ts` — pending `git rm`

- [ ] **FE2** Contract-Hardening fuer kritische UI-Inputs/Outputs
  - Zod-Schemas an API-Grenzen (Order-Entry, Settings, GeoMap Event-Creation)
  - **TanStack Form** als Evaluationskandidat (siehe MON-2) — integriert Zod nativ,
    typsichere Field-APIs, reaktive Validierung ohne extra Setup

- [ ] **FE3** Query-/Polling-/Cache-Fehlerpfade fuer zentrale Panels robust verifizieren

- [ ] **FE4** a11y Baseline fuer priorisierte Surfaces (Labels, Keyboard, Fokuspfade)

- [ ] **FE5** Performance-Baseline fuer UI-kritische Screens dokumentieren

- [ ] **FE6** Chart-/Viz-Performance-Evaluationspfad (inkl. ChartGPU-Entscheid) sauber protokollieren

  **Entscheid (12.03.2026): Defer auf Phase 22+**

  Begruendung: Aktuelle Chart-Implementierung (`lightweight-charts` via `TradingChart.tsx`) ist
  funktional und fuer den MVP ausreichend. GPU-Beschleunigung lohnt erst wenn FE5-Messungen
  einen konkreten Bottleneck zeigen.

  **Evaluationskandidaten fuer Phase 22:**
  | Kandidat | Ansatz | Wenn sinnvoll |
  |:---------|:-------|:--------------|
  | `lightweight-charts` GPU-Mode | Integrierter WebGL-Renderer (v5+) | Erste Option — kein Lib-Wechsel |
  | `@antv/g2` / `@antv/f2` | Canvas/WebGL Hybrid | Wenn komplexere Viz noetig (Heatmaps, Depth) |
  | `deck.gl` + eigene Layer | Full WebGL, max. Kontrolle | Nur wenn Geo+Chart-Fusion entsteht |
  | `echarts` WebGL-Extension | Grosse Community, gute Perf | Fallback wenn lightweight-charts limitiert |

  **Gate:** FE5-Messprotokoll muss Baseline liefern bevor Kandidaten verglichen werden.
  Kein Wechsel ohne messbaren Gewinn.

- [x] **FE7** TanStack Query Defaults pro Surface verifizieren (12.03.2026)

  **Audit-Ergebnis (alle 12 `useQuery`-Surfaces):**

  | Surface | queryKey (nach FE9-Migration) | staleTime | gcTime | retry | Besonderheit |
  |:--------|:------------------------------|:----------|:-------|:------|:-------------|
  | `useChartData` | `["market","ohlcv", sym, tf, win]` | 30s | 5min | false | Demo-Fallback ersetzt retry |
  | `useDailySignalData` | `["market","ohlcv-daily", sym]` | 5min | 15min | false | Tageskerzen, lang stale ok |
  | `useCompositeSignal` | `["market","composite-signal", fp]` | 30s | 2min | global | Pacer-Debounce 300ms auf Fingerprint |
  | `OrderbookPanel` | `["market","orderbook", sym]` | 5s | global | global | SSE haelt fresh; kurze staleTime |
  | `OrdersPanel` | `["portfolio","orders", pk, sym]` | 10s | global | global | Benutzeraktionen — kurz stale |
  | `MemoryStatusBadge` | `["memory","health"]` | 25s | global | global | Health-Polling ohne refetchInterval |
  | `MacroPanel` | `["market","macro-quote", sym]` | 60s | global | global | Makrodaten, 1min ok |
  | `NewsPanel` | `["market","news", sym]` | 60s | global | global | News, 1min ok |
  | `MonteCarloVarPanel` | `["portfolio","monte-carlo-var", s, w]` | 60s | global | global | Compute-intensiv, cache schonen |
  | `KellyAllocationPanel` | `["portfolio","kelly", s]` | 60s | global | global | dto. |
  | `RegimeSizingPanel` | `["portfolio","regime-sizing", s]` | 60s | global | global | dto. |
  | `SettingsPanel` | `["market","providers"]` | 30s | global | global | Provider-Liste |

  **Global Default (`src/lib/query-client.ts`) — nach Fix:**
  - `staleTime: 30s` — explizit dokumentiert
  - `gcTime: 5min` — war TQ5-Default, jetzt explizit
  - `retry: 2` — global; OHLCV-Hooks mit Demo-Fallback ueberschreiben auf `false`
  - `refetchOnWindowFocus: false` ✅ **FIXED** — war `true` (TQ5-Default); Trading-App
    will keine Surprise-Refetches bei Tab-Wechsel, SSE haelt Live-Daten aktuell

  **Offen / Deferred:**
  - `["memory-health"]` und `["orders"]` haben kurze staleTime aber kein `refetchInterval` —
    werden nur bei Mount/Focus neu geladen. Akzeptiert fuer jetzt; bei aktivem Health-Monitor
    (Phase 10) mit `refetchInterval` nachrüsten.
  - `refetchOnReconnect`: TQ5-Default `true` — behalten, korrekt fuer Netzwerk-Recovery.

- [ ] **FE8** Mutation-Error-Paths (optimistic rollback, form/action errors) fuer Kernflows explizit testen

- [x] **FE9** Query-Key- und Invalidation-Konzept dokumentiert und Namespace-Konvention festgelegt (12.03.2026)

  **Ist-Stand:** Alle Keys sind flache Strings (`"ohlcv"`, `"orders"`, `"memory-health"`).
  Funktioniert, aber gezielte Invalidation einer ganzen Surface-Gruppe ist nicht moeglich.

  **Ziel-Konvention (Namespace-Prefix):**

  ```ts
  // Market
  ["market", "ohlcv", symbol, timeframe, window]     // war: ["ohlcv", ...]
  ["market", "ohlcv-daily", symbol]                  // war: ["ohlcv-daily", ...]
  ["market", "orderbook", symbol]                    // war: ["orderbook", ...]  ← orderbookQueryKey
  ["market", "composite-signal", fingerprint]        // war: ["composite-signal", ...]
  ["market", "macro-quote", symbol]                  // war: ["macro-quote", ...]
  ["market", "providers"]                            // war: ["market-providers"]

  // Portfolio
  ["portfolio", "orders", profileKey, symbol]        // war: ["orders", ...]
  ["portfolio", "kelly", symbols]                    // war: ["kelly-allocation", ...]
  ["portfolio", "regime-sizing", symbols]            // war: ["regime-sizing", ...]
  ["portfolio", "monte-carlo-var", symbols, weights] // war: ["monte-carlo-var", ...]

  // Memory / Agent
  ["memory", "health"]                               // war: ["memory-health"]

  // Geo
  ["geo", "events"]                                  // war: ["geo-events"] — bereits in useGeopoliticalWorkspaceData
  ["geo", "news", symbol]                            // war: ["news", ...]
  ```

  **Vorteil:** `invalidateQueries({ queryKey: ["market"] })` invalidiert alle Marktdaten,
  `invalidateQueries({ queryKey: ["portfolio"] })` alle Portfolio-Panels auf einmal.

  **Implementierungsstatus:** Konvention **dokumentiert + migriert** (12.03.2026).
  - Alle 13 Dateien migriert: useChartData, useDailySignalData, useOrderbookStream, useCompositeSignal,
    MacroPanel, NewsPanel, OrdersPanel (queryKey + 2× setQueryData), MonteCarloVarPanel,
    KellyAllocationPanel, RegimeSizingPanel, MemoryStatusBadge, SettingsPanel, useGeopoliticalWorkspaceData
  - `bun run lint` — 0 errors post-migration ✅

---

## 2. Monitor / Deferred Decisions (TanStack Ecosystem)

> Evaluiert 10.03.2026. Alle Kandidaten aus dem TanStack-Ecosystem-Scan.
> Quellanalyse: `docs/Important-TS-AgentSec-Rag-and-so-on-10.03.2026.txt`

- [x] **MON-1 TanStack Pacer** — Scheduling-/Timing-Layer (v0.20.0 installiert, 12.03.2026)
  - **Was es loest:** Debounce / Throttle / Batch / Queue / Rate Limit als explizite Execution Policies.
  - **Implementiert (12.03.2026):**
    - `useWatchlist.ts`: `useDebouncedValue` → Pacer `useDebouncedValue({ wait: 180 })`
    - `useCompositeSignal.ts`: `useDebouncedValue` → Pacer `useDebouncedValue({ wait: 300 })`
    - `src/lib/hooks/useDebouncedValue.ts` geloescht (dead file nach Migration)
  - **Noch offen (naechste Use-Cases):**
    - `usePreferencesSync` Autosave → `useBatchedCallback`
    - GeoMap Drawing-Drag → `useThrottledCallback`
    - Order-Mutations Schnellklick → `useQueuer`

- [ ] **MON-2 TanStack Form** — Headless Form State + Validierung (Stable)
  - **Was es loest:** Typsichere Field-APIs, Zod-native Integration, reaktive Validierung,
    Field-level vs. Form-level Fehler — ersetzt ad-hoc controlled inputs.
  - **Kandidaten:** Order-Entry Panel, Settings, GeoMap Event-Creation (CreateMarkerPanel)
  - **Timing:** Erst nach Live-Verify der bestehenden Surfaces — Contract-Hardening (FE2)
    auf stabilem Boden. Kein sofortiger Dep.

- [x] **MON-3 TanStack Virtual** — Virtualisierung fuer lange Listen (v3.13.21 installiert, 12.03.2026)
  - **Was es loest:** DOM-only fuer sichtbare Items — notwendig ab ~50 Rows.
  - **Implementiert (12.03.2026):**
    - `WatchlistPanel.tsx`: Threshold-Pattern `VIRTUAL_THRESHOLD = 50`
      - `> 50 Items`: `useVirtualizer` mit `estimateSize: 44px`, `overscan: 8`
      - `≤ 50 Items`: Standard `ScrollArea` + `map()` unveraendert
  - **Noch offen:**
    - OrderbookPanel (>50 Levels) — bei FE5 Performance-Messung nachrüsten
    - GeoMap MarkerList — bei FE5 oder GeoMap-Closeout

- [ ] **MON-4 TanStack AI** — Streaming Chat-UI + Message-Thread-Management
  - **Was es loest:** SSE-Chunk-Rendering, Message-Thread-State, Tool-Call-Visualisierung
  - **Scaffold vorhanden (12.03.2026):**
    - `src/features/agent-chat/types.ts` — `ChatMessage`, `ChatThread`, `AgentChatConfig`
    - `src/features/agent-chat/AgentChatPanel.tsx` — Stub-Komponente
    - `execution/agent_chat_ui_delta.md` — vollstaendiger Execution-Owner
    - `EXECUTION_PLAN.md` Phase 22a — "Agent Chat UI"
  - **Entscheid:** `@tanstack/react-ai` adoptieren wenn Phase 22a startet und Stable/RC vorliegt.
    Fallback: Eigenimplementierung (SSE → local state → `<StreamingText>`).

- [ ] **MON-5 TanStack DB** — Client-side DB/Sync-Layer
  - **Was es loest:** Local-first strukturierte Datenhaltung (Watchlist, Paper Orders,
    GeoMap Drawings, Preferences) + Sync mit Backend
  - **Timing:** Phase 20+ — evaluieren wenn local-first Anforderungen konkret werden.
    Vermerkt in `EXECUTION_PLAN.md` Phase 20.
  - **Entscheid:** Kein aktiver Handlungsbedarf jetzt. Skip bis Stable Release + Phase-20-Gate.

---

## 3. Verify-Gates

### 3a. Konkrete Browser-Gates (Live-Stack erforderlich)

**FE7 — refetchOnWindowFocus: false**
- [ ] **FE7.V1** Trading-Page offen, Tab-Wechsel → kein Netzwerk-Request in DevTools (kein Surprise-Refetch)
- [ ] **FE7.V2** GeoMap offen, Tab-Wechsel → ebenso kein Refetch

**FE9 — Query Key Namespace-Migration**
- [ ] **FE9.V1** Alle 13 migrierten Panels laden Daten korrekt (kein leerer State, kein 404)
- [ ] **FE9.V2** OrdersPanel: Paper-Order platzieren → erscheint sofort in der Liste (setQueryData mit `["portfolio","orders",...]` wirkt)
- [ ] **FE9.V3** OrdersPanel: Order-Status aendern → wird sofort im UI reflektiert
- [ ] **FE9.V4** DevTools React-Query: `["market","ohlcv",...]` / `["portfolio","orders",...]` / `["memory","health"]` / `["geo","events"]` — alle Keys erscheinen mit korrektem Namespace

**MON-1 — TanStack Pacer Debounce**
- [ ] **MON1.V1** WatchlistSidebar Suche: Tippen → Filter aktualisiert sich nach ~180ms Pause, nicht bei jedem Keystroke
- [ ] **MON1.V2** Composite-Signal: Candle-Streaming triggert keinen neuen API-Call bei jedem Tick — erst nach 300ms Fingerprint-Stabilitaet

**MON-3 — TanStack Virtual**
- [ ] **MON3.V1** WatchlistPanel "All"-Tab (> 50 Symbole): Virtual-Pfad aktiv — DevTools zeigt nur ~10-15 DOM-Rows, nicht alle Symbole
- [ ] **MON3.V2** WatchlistPanel "Crypto"-Tab (≤ 50): Standard ScrollArea-Pfad — alle Rows im DOM sichtbar
- [ ] **MON3.V3** Virtual-Pfad scrollt fluessig (kein Row-Flicker, kein Layout-Shift)
- [ ] **MON3.V4** Suche im Virtual-Pfad funktioniert (gefilterte Liste virtualisiert korrekt)

**TRF42 — 4-Theme Picker (aus trading_page_refactor_delta.md)**
- [ ] **TRF42.V1** Dropdown in TradingHeader zeigt 4 Themes; aktives Theme hat Check-Icon
- [ ] **TRF42.V2** CommandPalette "Theme"-Gruppe zeigt alle 4 Eintraege mit Check fuer aktives Theme
- [ ] **TRF42.V3** Blue-Dark / Green-Dark Themes aendern das UI-Erscheinungsbild sichtbar
- [ ] **TRF42.V4** Theme-Wahl persistiert nach Page-Reload (next-themes localStorage)

### 3b. Phase-Level-Gates

- [ ] **FE.V1** Frontend-Refinement-Checklist fuer Phase 21 abgeschlossen
- [ ] **FE.V2** Performance-Gates fuer Phase 22 mit Messprotokoll abgeschlossen
- [ ] **FE.V3** Kritische Browser-Flows ohne Query-/Hydration-/State-Fehler
- [ ] **FE.V4** A11y-Quick-Acceptance auf priorisierten Screens dokumentiert
- [ ] **FE.V5** TanStack-Query-Fehler- und Retry-Verhalten fuer Kernsurfaces reproduzierbar nachgewiesen

---

## 4. Evidence Requirements

- FE-ID + betroffener Surface/Screen
- reproduzierbare Browser-Schritte und beobachtetes Ergebnis
- Messwerte bei Performance-Themen (mind. Baseline + Vergleich)
- Verweis auf aktualisierte Owner-Dokumente

---

## 5. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md` (falls Runtime/State-Grenzen betroffen)
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/FRONTEND_COMPONENTS.md`
- `docs/specs/execution/cross_cutting_verify.md`

---

## 6. Exit Criteria

- `FE1-FE9` entschieden (geschlossen oder deferred mit Owner/Datum)
- MON-1–MON-5 haben je einen klaren Adopt/Defer/Skip-Entscheid mit Datum
- Phase 21/22 sind nicht nur geplant, sondern mit konkreten Verify-Gates unterlegt
- keine offene Divergenz zwischen Frontend-Owner-Docs und Execution-Realitaet
