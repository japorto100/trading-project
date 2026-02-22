# FRONTEND ARCHITECTURE

> **Stand:** 22. Februar 2026  
> **Zweck:** Landkarte der Frontend-Architektur. IST-Zustand (wie der Code jetzt organisiert ist) und SOLL-Zustand (wohin wir wollen). Nicht als 100%-Detail-Plan, sondern als Orientierung: welche Ordner gibt es, wer owned welchen State, welche Dependencies sterben, welche kommen.  
> **Arbeitsdokument für Bugs/Fixes:** [`webapp.md`](./webapp.md)  
> **API-Contracts:** [`API_CONTRACTS.md`](./API_CONTRACTS.md)  
> **Execution Plan Frontend-Tasks:** [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md) Phase 0 (Foundation), Phase 21 (Frontend Refinement)
>
> **Aenderungshistorie:**
> - Rev. 1 (20. Feb 2026) — Erstfassung mit Phasen 0-9
> - Rev. 2 (22. Feb 2026) — Phasen-Referenzen auf EXECUTION_PLAN Rev. 3 Nummerierung (0-22) aktualisiert. Sek. 6 erweitert mit Memory/Agent/GT-Phasen.

---

## 1. Tech Stack

| Kategorie | IST | SOLL | Notizen |
|:---|:---|:---|:---|
| **Framework** | Next.js 16.1.6 (App Router, Turbopack) | Bleibt | -- |
| **React** | React 19 | Bleibt | -- |
| **Styling** | Tailwind CSS 4 + shadcn/ui (Radix) | Bleibt | 50+ UI-Primitives in `components/ui/` |
| **Charting** | `lightweight-charts` 5.1.0 | Bleibt | Haupt-Chart (Candlestick, Line, Area) |
| **GeoMap** | `d3-geo` (Orthographic Globe, SVG) | Canvas/SVG Hybrid | Performance-Upgrade in Phase 4 |
| **Analytics Charts** | `recharts` | Bleibt | Portfolio-Charts, Analytics |
| **Animation** | Framer Motion 12 | Bleibt | Transitions, Layout-Animationen |
| **State** | React Hooks (useState, useReducer) | **Zustand** für Domain-State | Siehe Sek. 4 |
| **Server State** | TanStack Query 5.82 | Bleibt + ausbauen | Caching, Invalidation, Optimistic Updates |
| **Validation** | Keine Runtime-Validierung | **Zod** für alle API-Responses | Phase 21 |
| **Auth** | next-auth 4.24 (inaktiv) | next-auth v5 + WebAuthn | Phase 1, siehe `AUTH_SECURITY.md` |

---

## 2. Ordner-Struktur

### 2.1 IST-Zustand

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Haupt-Trading-Page (~alles in einer Datei)
│   ├── geopolitical-map/
│   │   └── page.tsx              # GeoMap Page
│   ├── layout.tsx                # Root Layout (Metadata, Dark Theme, Toaster)
│   └── api/                      # 44 API Route Handler
│       ├── auth/[...nextauth]/   # Auth (inaktiv)
│       ├── market/               # quote, ohlcv, search, news, providers, stream
│       ├── fusion/               # orders, portfolio, alerts, trade-journal, strategy, risk
│       └── geopolitical/         # events, candidates, drawings, timeline, regions, ...
│
├── chart/                        # Chart Engine (Custom)
│   ├── types.ts
│   └── engine/                   # ChartEngine, Renderer, CoordinateSystem, Layers
│
├── components/                   # Shared Components
│   ├── TradingChart.tsx          # Haupt-Chart Wrapper
│   ├── TimeframeSelector.tsx
│   ├── DrawingToolbar.tsx
│   ├── IndicatorPanel.tsx
│   ├── SettingsPanel.tsx
│   ├── AlertPanel.tsx
│   ├── trading-chart/            # Chart-spezifische Sub-Components
│   ├── fusion/                   # WatchlistPanel, SymbolSearch
│   └── ui/                       # 50+ shadcn Primitives (Button, Dialog, Card, ...)
│
├── features/                     # Feature Modules
│   ├── trading/                  # ~16 Dateien
│   │   ├── TradingWorkspace.tsx
│   │   ├── TradingHeader.tsx
│   │   ├── WatchlistSidebar.tsx
│   │   ├── RightDetailsSidebar.tsx
│   │   ├── TradingSidebar.tsx    # ⚠️ DEAD CODE (Legacy, aufgeteilt)
│   │   ├── BottomStats.tsx
│   │   ├── PortfolioPanel.tsx
│   │   ├── NewsPanel.tsx
│   │   ├── OrdersPanel.tsx
│   │   ├── SignalInsightsBar.tsx
│   │   ├── StrategyLabPanel.tsx
│   │   ├── TopMenuBar.tsx
│   │   ├── TradingPageSkeleton.tsx
│   │   ├── useIndicatorActions.ts
│   │   └── types.ts
│   └── geopolitical/             # ~16 Dateien + shell/
│       ├── GeopoliticalMapShell.tsx  # ⚠️ 1450 LoC Monolith (~40 useState)
│       ├── MapCanvas.tsx
│       ├── EventInspector.tsx
│       ├── CandidateQueue.tsx
│       ├── TimelineStrip.tsx
│       ├── SymbolToolbar.tsx
│       ├── *Panel.tsx            # GameTheory, Context, PulseInsights, SourceHealth
│       └── shell/                # Shell Sub-Components
│           ├── MapShellHeader.tsx
│           ├── CreateMarkerPanel.tsx
│           ├── EditMarkerPanel.tsx
│           └── ...
│
├── hooks/                        # Global Hooks
│   ├── use-toast.ts
│   └── use-mobile.ts
│
└── lib/                          # Shared Libraries
    ├── auth.ts                   # NextAuth Config
    ├── db.ts                     # DB Client
    ├── utils.ts                  # cn(), getErrorMessage()
    ├── chartData.ts              # Candle Types, Timeframe Helpers
    ├── demoData.ts               # Seed-Daten
    ├── fusion-symbols.ts         # Symbol-Liste, Kategorien
    ├── history-range.ts          # History Range Utils
    ├── proxy.ts                  # Request Helpers
    │
    ├── alerts/                   # Price Alerts (Client-Side, localStorage)
    ├── geopolitical/             # Geo Domain Logic (Types, Adapters, Validation, Dedup, ...)
    ├── hooks/                    # useDebouncedValue
    ├── indicators/               # 23+ TS Indikatoren (SMA, EMA, RSI, MACD, ...)
    ├── news/                     # News Aggregator
    ├── orders/                   # Portfolio Logic, Risk Calc
    │
    ├── providers/                # ⚠️ 16 Market Data Provider Implementations
    │   ├── alpha-vantage/
    │   ├── ccxt/
    │   ├── coinmarketcap/
    │   ├── demo/ + demo-provider/
    │   ├── ecb/
    │   ├── eodhd/
    │   ├── finage/
    │   ├── finnhub/
    │   ├── fmp/
    │   ├── fred/
    │   ├── marketstack/
    │   ├── polygon/
    │   ├── twelve-data/
    │   ├── yahoo-unofficial/
    │   └── yfinance-bridge/
    │
    ├── server/                   # Server-Only (Prisma Stores + Bridges)
    │   ├── prisma.ts
    │   ├── orders-store.ts
    │   ├── portfolio-history-store.ts
    │   ├── trade-journal-store.ts
    │   ├── price-alerts-store.ts
    │   ├── geopolitical-*-store.ts  # events, candidates, drawings, timeline, regions
    │   ├── geopolitical-acled-bridge.ts
    │   ├── geopolitical-game-theory-bridge.ts
    │   └── geopolitical-context-bridge.ts
    │
    ├── storage/                  # Client Preferences (localStorage, profileKey)
    └── strategy/                 # Indicator Service Bridge
```

### 2.2 Bekannte Probleme im IST-Zustand

| Problem | Wo | Schwere | Fix in Phase |
|:---|:---|:---|:---|
| **16 Provider-Implementierungen** | `lib/providers/` | HOCH | Phase 0: Frontend-Implementierungen werden gelöscht. Die Provider-Logik **zieht um nach Go** (`go-backend/internal/connectors/`). Frontend ruft nur noch Go auf. |
| **GeoMap Monolith** | `GeopoliticalMapShell.tsx` (1450 LoC, ~40 useState) | HOCH | Phase 4: Refactor zu Zustand Store + kleinere Components |
| **Dead Code** | `TradingSidebar.tsx` (Legacy) | NIEDRIG | Phase 21: Löschen |
| **Keine State Management Lib** | Zustand installiert, nirgends benutzt | MITTEL | Schrittweise: GeoMap (Phase 4), Portfolio (Phase 5) |
| **Keine Runtime-Validierung** | API-Responses werden blind vertraut | MITTEL | Phase 21: Zod-Schemas für alle Go-Gateway-Responses |
| **44 API Routes** | `app/api/` | INFO | Viele werden in Phase 0 zu reinen Go-Proxies. Einige sterben. |
| **Provider Keys im Frontend** | `.env` enthält Provider API Keys | HOCH | Phase 0: Alle Keys nach `go-backend/.env` |
| **Alerts Client-seitig** | `lib/alerts/` (localStorage) | MITTEL | Phase 3: Server-Side Alerts in Go |

### 2.3 SOLL-Zustand (nach Phase 21)

```
src/
├── app/
│   ├── page.tsx                  # Schlank: nur Layout-Komposition
│   ├── geopolitical-map/page.tsx
│   ├── layout.tsx
│   └── api/                      # Reduziert: nur Auth + Go-Proxy-Routes
│
├── chart/                        # Unverändert
│
├── components/
│   ├── ui/                       # shadcn Primitives (unverändert)
│   └── [shared components]       # Bleiben, ggf. refactored
│
├── features/
│   ├── trading/                  # Aufgeräumt, kein Dead Code
│   └── geopolitical/
│       ├── store.ts              # NEU: Zustand Store (ersetzt 40 useState)
│       ├── GeopoliticalMapShell.tsx  # Schlank: delegiert an Store + Sub-Components
│       └── [components]
│
├── hooks/
│
└── lib/
    ├── indicators/               # Bleibt (schnelle Client-Side TA)
    ├── geopolitical/             # Bleibt (Domain Logic)
    ├── orders/                   # Bleibt
    ├── providers/                # ❌ GELÖSCHT (alles über Go)
    ├── server/                   # Bleibt (Prisma Stores)
    ├── storage/                  # Bleibt
    ├── validation/               # NEU: Zod-Schemas für Go-Gateway-Responses
    └── gateway/                  # NEU: Typisierter Go-Gateway-Client
```

---

## 3. Pages und Routing

| Route | Page | Beschreibung | Auth (SOLL) |
|:---|:---|:---|:---|
| `/` | `app/page.tsx` | Trading Dashboard (Chart, Watchlist, Sidebars) | `viewer` |
| `/geopolitical-map` | `app/geopolitical-map/page.tsx` | GeoMap mit Globe, Timeline, Events | `viewer` (read), `analyst` (review) |
| `/auth/login` (SOLL) | Noch nicht vorhanden | WebAuthn/Passkey Login | public |

### API Routes: IST → SOLL

| Gruppe | IST (Anzahl) | SOLL | Begründung |
|:---|:---|:---|:---|
| `api/market/*` | 7 Routes | **Bleiben als Go-Proxies.** Rufen nur `GO_GATEWAY_BASE_URL` auf. | Frontend → Next.js API → Go Gateway. Next.js als BFF (Backend for Frontend). |
| `api/fusion/*` | 14 Routes | **Bleiben.** Orders, Portfolio, Alerts, Strategy → Go. | Server-Actions oder API-Routes für Mutations. |
| `api/geopolitical/*` | 22 Routes | **Bleiben.** Events, Candidates, Drawings → Go. | Komplexe Domain, viele Endpoints. |
| `api/auth/*` | 1 Route | **Bleibt + erweitert** (WebAuthn). | next-auth Handler. |

**Wichtig:** Alle `api/*` Routes werden zu **dünnen Proxies**. Keine Business-Logik im Frontend. Kein direkter Provider-Call.

---

## 4. State Management

### 4.1 IST-Zustand: Kein Zustand (Library), nur React Hooks

| State-Art | Wo | Wie | Problem |
|:---|:---|:---|:---|
| **UI State** (Modals, Tabs, Sidebar open/close) | Lokale Components | `useState` | OK, gehört lokal. |
| **Trading Page State** | `app/page.tsx` | `useState` (~20+ States) | Zu viel in einer Datei, aber überschaubar. |
| **GeoMap State** | `GeopoliticalMapShell.tsx` | `useState` (~40 States!) | **Kritisch.** Unübersichtlich, schwer testbar, Props-Drilling überall. |
| **Server State** | `lib/server/*.ts` | Prisma + DB | OK, Server-Side. |
| **Client Preferences** | `lib/storage/` | localStorage + profileKey | OK für jetzt. |
| **Cached Server Data** | Via API Routes | TanStack Query (teilweise) | Ausbaufähig. |

### 4.2 SOLL-Zustand: Zustand für Domain State, React Hooks für UI

**Prinzip (Feature-Sliced Design / SOTA 2025-2026):**

| State-Art | Wo | Wie | Beispiel |
|:---|:---|:---|:---|
| **UI State** | Lokale Components | `useState` / `useReducer` | Modal open, Tab active, Sidebar width |
| **Domain State** | Zustand Stores (pro Feature) | `zustand` mit Slices | GeoMap-State, Portfolio-State, Watchlist-Auswahl |
| **Server State** | TanStack Query | `useQuery` / `useMutation` | OHLCV-Daten, Portfolio-Positionen, News |
| **Form State** | Lokale Components | `useState` oder React Hook Form | Order-Eingabe, Marker-Erstellung |
| **Persistent Client** | `lib/storage/` | localStorage (Zustand Middleware optional) | Theme, Preferences, Layout |

### 4.3 Geplante Zustand Stores

| Store | Feature | Ersetzt | Phase |
|:---|:---|:---|:---|
| `features/geopolitical/store.ts` | GeoMap | ~40 useState in Shell | Phase 4 |
| `features/trading/watchlist-store.ts` | Watchlist Selection, Active Symbol | Props-Kette in page.tsx | Phase 21 (oder frueher) |
| `features/trading/portfolio-store.ts` | Portfolio UI State (Active Tab, Filters) | useState in PortfolioPanel | Phase 5 |

**Kein Overkill:** Nicht alles braucht Zustand. `useState` bleibt für rein lokalen UI-State (Modal, Toggle, Input).

---

## 5. Datenfluss

### 5.1 IST (Problematisch)

```
Browser ──► Next.js API Route ──► Provider direkt (Finnhub, Yahoo, etc.)
                                  ↕
Browser ──► Next.js API Route ──► Python direkt (8090, 8091)
                                  ↕  
Browser ──► Next.js API Route ──► Go Gateway (9060) ──► Geo, News, Macro
```

3 verschiedene Wege. Inkonsistent. Provider Keys im Frontend.

### 5.2 SOLL (Nach Phase 0)

```
Browser ──► Next.js API Route ──► Go Gateway (9060) ──► alles
                                       │
                                       ├──► Provider (Market Data)
                                       ├──► Python (Analytics, ML)
                                       ├──► GCT (Portfolio, Orders)
                                       └──► SSE (Streaming)
```

1 Weg. Konsistent. Keine Secrets im Frontend.

### 5.3 TanStack Query Pattern (SOLL)

```typescript
// Jeder Go-Gateway-Call folgt diesem Muster:
const { data, isLoading, error } = useQuery({
  queryKey: ['ohlcv', symbol, timeframe],
  queryFn: () => fetch(`/api/market/ohlcv?symbol=${symbol}&tf=${timeframe}`)
    .then(res => res.json())
    .then(data => OhlcvResponseSchema.parse(data)),  // Zod Validation
  staleTime: 30_000,
});
```

---

## 6. Was in welcher Phase passiert (Frontend-Sicht)

> **Hinweis:** Phasen-Nummern entsprechen `EXECUTION_PLAN.md` Rev. 3. Nur Phasen mit Frontend-Relevanz gelistet.

| Phase | Name (EP Rev. 3) | Frontend-Aenderungen |
|:---|:---|:---|
| **Phase 0** | Foundation | `lib/providers/` → alle Calls auf Go umleiten. API-Routes werden Go-Proxies. Provider Keys entfernen. |
| **Phase 1** | Auth + Security | Login Page (WebAuthn). Protected Routes. RBAC-basierte UI (Trader sieht Order-Buttons, Viewer nicht). WebMCP Security Hardening. |
| **Phase 2** | Rust Core + Composite Signal | Signal-Leiste erweitern: Rust-berechnete Composite Signals anzeigen (kommen von Go). |
| **Phase 3** | Streaming Migration | SSE-Upgrade: Stream-First + Server-Side Alerts → Alert-Panel zeigt Server-Events. |
| **Phase 4** | GeoMap v2.0 | GeoMap Refactor: `GeopoliticalMapShell.tsx` → Zustand Store + Canvas/SVG Hybrid. d3-scale, d3-scale-chromatic, d3-transition. Clustering (supercluster). Keyboard Shortcuts. |
| **Phase 5** | Portfolio Bridge | Portfolio-Tabs: Paper / Live / Analytics. Neue Charts (EquityCurve, Drawdown). `portfolio-store.ts` (Zustand). |
| **Phase 6** | Memory Architecture | Frontend: KuzuDB WASM User-KG in IndexedDB. Encrypted KG Storage (WebAuthn PRF). KG-Sync SSE-Listener. |
| **Phase 8** | Pattern Detection | Pattern-Overlays auf Chart (Elliott Wave, Harmonic Patterns). |
| **Phase 9** | Unified Ingestion Layer | UIL Review-UI: Candidate-Karten mit Accept/Reject/Reclassify. Copy/Paste Import. |
| **Phase 10** | Agent Architecture | Agent State Observation API (`/api/agent/state`, WS `/api/agent/state-stream`). WebMCP Tool Registration (read-only + mutation mit User Confirmation). |
| **Phase 12** | GeoMap v2.5 — Advanced | d3-geo-voronoi, d3-inertia, d3-hierarchy (Scenario Tree), d3-force (Entity Graph). Advanced Overlays. |
| **Phase 13** | Portfolio Advanced | HRP Optimizer UI, Kelly Criterion, Multi-Asset Rebalancing. |
| **Phase 17** | Game Theory Mode | Game Theory Simulation Page. Spielbaum-Visualisierung (d3-hierarchy). GeoMap GT-Overlay. Timeline-Slider (d3-brush). |
| **Phase 19** | GeoMap v3 | Canvas/WebGL Hybrid. Rust/WASM Rendering. Collaboration Features. |
| **Phase 21** | Frontend Refinement | Zod Validation. Dead Code loeschen. Loading States. Error Boundaries. Dark Mode Check. Accessibility. watchlist-store.ts. |

---

## 7. Dependencies: Keep / Kill / Add

### Kill (Phase 0-21)

| Package | Grund | Phase |
|:---|:---|:---|
| Frontend Provider-Code in `lib/providers/` | Logik zieht um nach Go (`internal/connectors/`). Frontend-Implementierungen werden gelöscht. | 0 |
| Direkte Python-Calls in API-Routes | Go Proxy | 0 |
| `TradingSidebar.tsx` | Dead Code | 21 |

### Keep

| Package | Version | Zweck |
|:---|:---|:---|
| `lightweight-charts` | 5.1.0 | Haupt-Chart |
| `d3-geo` | -- | GeoMap Globe |
| `recharts` | -- | Analytics Charts |
| `framer-motion` | 12 | Animationen |
| `@tanstack/react-query` | 5.82 | Server State |
| `react-resizable-panels` | -- | Layout |
| `next-auth` | → v5 | Auth |

### Add (geplant)

| Package | Zweck | Phase |
|:---|:---|:---|
| `zustand` | Domain State (schon installiert, noch unbenutzt) | 4, 5 |
| `zod` | Runtime Response Validation | 21 |
| `@simplewebauthn/browser` | WebAuthn Client-Side | 1 |
| `supercluster` | GeoMap Point Clustering | 4 |
| `@aspect-build/kuzu-wasm` | User-KG im Browser (IndexedDB) | 6 |
| `d3-scale` + `d3-scale-chromatic` | GeoMap Choropleth Color Logic | 4 |
| `d3-transition` + `d3-timer` + `d3-ease` | GeoMap Animationen | 4 |
| `d3-inertia` | Globe Rotation Inertia | 12 |
| `d3-hierarchy` | Scenario Tree / Spielbaum | 17 |

---

## 8. Konventionen (SOLL)

| Regel | Details |
|:---|:---|
| **Frontend darf nur Go aufrufen** | Über Next.js API Routes als Proxy. Keine direkten Provider/Python-Calls. |
| **State-Ownership klar definiert** | UI-State = lokal, Domain-State = Zustand, Server-State = TanStack Query. |
| **Jede API-Response wird validiert** | Zod-Schema. Parse Error → User-freundliche Fehlermeldung + `requestId` loggen. |
| **Feature-Ordner sind eigenständig** | `features/trading/` und `features/geopolitical/` haben eigene Types, Stores, Components. |
| **Keine Business-Logik in API-Routes** | API-Routes sind Proxies (fetch → Go → return). Logik lebt in Go/Python. |
| **Dead Code sofort markieren** | `// ⚠️ DEAD CODE` Kommentar + in `webapp.md` notieren → Phase 21 loeschen. |
