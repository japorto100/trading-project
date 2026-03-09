# FRONTEND ARCHITECTURE

> **Stand:** 09. Maerz 2026
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
| Charts | `lightweight-charts` 5.1.0, `recharts`, `d3-geo` |
| Server State | TanStack Query 5 |
| Local / domain state | React state + Zustand |
| Auth | Auth.js / next-auth v5 beta Baseline |
| Validation | Zod vorhanden; breiterer Contract-Einsatz bleibt Folgearbeit |

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
| Domain workspace state | aktive Symbolwahl, Watchlist-Kontext, GeoMap-Workspace, laengerlebige UI-Domaenen | Zustand |
| Server state | Quotes, provider status, portfolio analytics, memory status, route data | TanStack Query |
| Persistence / preferences | profile keys, settings, lokale UX-Praeferenzen | `lib/storage` + Browser |

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

### Primaere Produktflaechen

- Trading workspace
- GeoMap / geopolitical workspace
- Auth / security surfaces
- portfolio / analytics panels
- provider / settings / diagnostics surfaces

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
| Client updates | SSE-Events aktualisieren Query-Cache / UI-State kontrolliert |
| Legacy fallback | nur explizit gegated, nicht implizit |
| Alerts | Richtung server-side in Go, nicht rein clientseitig |

---

## 9. Offene Frontend-Arbeit

### Noch wichtig

- weitere BFF-Routen und Legacy-Helfer konsequent auf Go-first-/thin-proxy-Regeln
  pruefen
- `lib/providers` weiter von alten Produktivpfaden befreien
- mehr Response-Validierung an der Frontend-Grenze
- GeoMap- und Trading-Workspace weiter in kleinere, klarere Ownership-Blöcke
  schneiden

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

