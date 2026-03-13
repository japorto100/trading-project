# FRONTEND ARCHITECTURE

> **Stand:** 12. Maerz 2026 (Rev. 2 — Trading-Refactor TRF1–TRF42 reflektiert)
> **Zweck:** Frontend-Authority fuer Next.js/BFF-Boundaries, State-Schichten,
> UI-Ownership und die aktuelle Rolle des Browsers innerhalb der Gesamtarchitektur.
> **Nicht dieses Dokuments:** Vollstaendige Roadmap, historische Bugchronik oder
> Backend-Changelog.

---

## 1. Frontend-Leitformel

Das Frontend ist eine **lokale User-Intelligence-Surface** auf Basis von Next.js
16, aber **nicht** die zweite Domain-Truth des Systems.

Kurzform:

- Browser spricht Next.js
- Next.js spricht fuer Domainpfade Go
- React bleibt interaktiv und client-first dort, wo Charting, Streaming und
  Workspace-Interaktion dominieren
- Domain- und Provider-Logik wandert nicht zurueck in `src/lib/providers`

---

## 2. Tech Stack

| Bereich | Aktueller Stand |
|:--------|:----------------|
| Framework | Next.js `16.1.1` App Router |
| React | `19` |
| Styling | Tailwind 4 + shadcn/ui + Framer Motion |
| Theming | `next-themes` — 4 Themes: `light`, `dark`, `blue-dark`, `green-dark`; Theme-Picker in TradingHeader (DropdownMenu) + CommandPalette |
| Charts | `lightweight-charts` 5.1.0, `recharts`, `d3-geo` |
| Server State | TanStack Query 5 |
| Local / domain state | React state + Zustand (`tradingWorkspaceStore`, `geopoliticalMapStore`) |
| Auth | Auth.js / next-auth v5 beta Baseline |
| Validation | Zod vorhanden; breiterer Contract-Einsatz bleibt Folgearbeit (FE2) |

### Caching / Fetching Default

- Server-seitig: Next.js `"use cache"` dort, wo Daten wirklich cachebar sind
- Client-seitig: TanStack Query fuer polling, cache invalidation und SSE-nahe
  Datenaktualisierung
- Streaming- und Live-Market-Pfade bleiben standardmaessig `no-store` bzw.
  stream-first

---

## 3. Frontend-Boundaries

### Browser -> Next.js

- alle User-Interaktionen laufen ueber Pages, Server Components, Client
  Components, Route Handlers oder Server Actions
- keine direkten Browser-Calls an Go, Python, GCT oder externe Market-Provider

### Next.js -> Go Gateway

- `api/market/*`, `api/fusion/*`, `api/geopolitical/*`, `api/memory/*` und
  weitere Domainpfade bleiben BFF-/Thin-Proxy-Flaechen
- die Route-Haendler duplizieren keine Policy-, Routing- oder Provider-Logik

### Verbotene Rueckfaelle

- kein direkter Datenzugriff aus dem Browser auf `lib/providers`
- keine stillen Frontend-Provider-Fallbacks, wenn Go oder Downstreams fehlschlagen
- keine dauerhafte Ablage produktiver Provider-Secrets im Browser als einzige
  Wahrheit

---

## 4. Auth- und Credential-Modell im Frontend

### Session / Identity

- Auth.js / next-auth v5 beta ist aktiv
- Security-/Session-/Passkey-Flows leben im Frontend und im Auth-Layer, nicht in
  den Domain-BFF-Routen

### Provider-Credentials fuer Market-Pfade

- lokale UI-Eingabe fuer read-only Provider-Keys bleibt fuer UX erlaubt
- `SettingsPanel` synchronisiert diese Keys zusaetzlich in einen serverlesbaren,
  kontrolliert gesetzten Cookie fuer Next-Market-Routen
- Next.js rekonstruiert daraus den Gateway-Header
  `X-Tradeview-Provider-Credentials`
- der Browser bleibt damit **nicht** der direkte Upstream fuer echte Provider-API
  Calls

### Konsequenz

Das Frontend ist fuer Credential-UX zustaendig, aber **nicht** der normative
Secret-Owner fuer produktive Market- oder Broker-Integrationen.

---

## 5. State-Schichten

| Schicht | Typische Inhalte | Owner |
|:--------|:-----------------|:------|
| UI-local state | Drawer offen/zu, Tabs, Eingabefelder, Chart-Interaktionen | React local state |
| Domain workspace state | `tradingWorkspaceStore`: `currentSymbol`, `favorites`, `layout`; `geopoliticalMapStore`: drawing mode, viewport, events | Zustand |
| Server state | Quotes (OHLCV), Orderbook-Snapshots, portfolio analytics, composite signals, memory status | TanStack Query |
| Live stream state | Candle-Updates, Orderbook-Updates via SSE → `queryClient.setQueryData` | `useMarketStream`, `useOrderbookStream` |
| Persistence / preferences | profile keys, settings, lokale UX-Praeferenzen, Favorites, Layout | `lib/storage` + Browser |

### Regel

- Query-/server state nicht in ad hoc `useEffect`-Ketten vergraben
- Workspace- und UI-State nicht in den BFF-Routen verstecken
- echte Domain-Truth nicht im Client simulieren

---

## 6. Struktur und Ownership

### Aktiver Zuschnitt

```text
src/
  app/                 Next.js app + BFF/API layer
  components/          shared UI and cross-feature components
  features/            domain surfaces (trading, geopolitical, auth, etc.)
  lib/                 shared browser/server helpers
  chart/               chart engine and rendering-specific logic
```

### Ownership-Regeln

| Bereich | Primäre Verantwortung |
|:--------|:----------------------|
| `app/api/*` | dünne Proxies / BFF glue / auth-adjacent transport |
| `features/trading/*` | Trading workspace composition |
| `features/geopolitical/*` | GeoMap and review surfaces |
| `components/*` | wiederverwendbare UI-Surface-Bausteine |
| `lib/server/*` | server-only helpers fuer Route Handler und Stores |
| `lib/providers/*` | nur noch Legacy-/Metadaten-/Typ-Kontext, nicht produktive Datenabfrage |

### Zu `lib/providers`

`src/lib/providers` ist **nicht** mehr die normative Datenebene fuer Quotes,
OHLCV, Streams oder Search.

Aktive Rolle heute:

- Typen / Response-Shapes
- begrenzte Metadaten wie `PROVIDER_REGISTRY`
- Legacy-Reste, die perspektivisch weiter reduziert werden koennen

---

## 7. Frontend-Surfaces

### Routen (aktuell aktiv)

| Route | Surface | Anmerkung |
|:------|:--------|:----------|
| `/` | Redirect → `/trading` | `src/app/page.tsx` — Next.js `redirect()` |
| `/trading` | Trading Workspace | `src/app/trading/page.tsx` — dedizierte Route seit TRF1 |
| `/geopolitical-map` | GeoMap Workspace | `src/app/geopolitical-map/page.tsx` |
| `/auth/*` | Auth/Security surfaces | Sign-in, Passkeys, Security |
| `/api/v1/*` | Go Gateway Proxy | Thin BFF — kein Domain-Logik im Handler |
| `/api/fusion/*` | Next.js BFF | Preferences, Patterns, Composite Signal |
| `/api/geopolitical/*` | Next.js BFF | Events, Drawings, Regions |
| `/api/memory/*` | Next.js BFF | KG-Nodes, Sync, Seed |

### Primaere Produktflaechen

- Trading workspace (`/trading`)
- GeoMap / geopolitical workspace (`/geopolitical-map`)
- Auth / security surfaces (`/auth/*`)
- portfolio / analytics panels (eingebettet in Trading Workspace RightDetailsSidebar)
- provider / settings / diagnostics surfaces (eingebettet via SettingsPanel)

### Produkt-Richtung

Die Architektur bewegt sich Richtung:

- Research-/decision-surface als wichtiger Einstieg
- Trading-Workspace als tiefer Power-User-Modus
- Event-/Geo-/Portfolio-Drilldowns ueber dieselbe BFF-/Gateway-Grenze

Das ist eine Produkt- und Navigationsregel, keine Einladung zu einem zweiten
Frontend-Backend.

---

## 8. Realtime und Streaming

| Thema | Regel |
|:------|:------|
| Market streaming | Go-SSE ist der Standardpfad |
| Client updates | SSE-Events → `queryClient.setQueryData` — kein separater State-Layer |
| Konkrete Hooks | `useMarketStream` (Candles/OHLCV), `useOrderbookStream` (Bids/Asks) |
| SSE-Pattern | `EventSource` + named event (`"candle"`, `"orderbook"`) + Query-Key pro Symbol |
| Legacy fallback | nur explizit gegated, nicht implizit |
| Alerts | Richtung server-side in Go, nicht rein clientseitig |

---

## 9. Offene Frontend-Arbeit

### Noch wichtig

- weitere BFF-Routen und Legacy-Helfer konsequent auf Go-first-/thin-proxy-Regeln
  pruefen
- `lib/providers` weiter von alten Produktivpfaden befreien
- mehr Response-Validierung an der Frontend-Grenze (FE2: Zod-Contracts)
- GeoMap-Workspace weiter in kleinere, klarere Ownership-Blöcke schneiden
  (Trading-Workspace ist erledigt — TRF1–TRF42, 10.03.2026)
- TanStack Query Defaults vereinheitlichen: `staleTime`/`gcTime`/retry-Audit (FE7)
- Query-Key-Konzept fuer alle Surfaces konsolidieren (FE9)
- Dead File `src/features/trading/useIndicatorActions.ts` entfernen (`git rm`)

### Noch nicht sinnvoll

- neue Frontend-Minis nur fuer einzelne UI-Slices
- Rueckbau der BFF-Schicht zugunsten direkter Browser->Go Kommunikation
- Wiederaufleben lokaler Provider-Manager-Logik im Client

---

## 10. Querverweise

| Frage | Dokument |
|:------|:---------|
| Welche API-/Header-/SSE-Vertraege gelten? | `API_CONTRACTS.md` |
| Welche Runtime-/Port-Realitaet gilt? | `SYSTEM_STATE.md` |
| Welche Security-Grenzen gelten? | `AUTH_SECURITY.md` |
| Welche Roadmap-Punkte sind offen? | `EXECUTION_PLAN.md` |
| Welche konkreten UI-Surfaces sind erste Klasse? | `../FRONTEND_COMPONENTS.md` |

