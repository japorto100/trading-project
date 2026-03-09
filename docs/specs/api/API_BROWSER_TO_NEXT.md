# API Browser to Next.js

> **Stand:** 09. Maerz 2026
> **Zweck:** Vertrag fuer die Browser-Seite der Kommunikation: was der Browser
> aufrufen darf und was nicht.
> **Index:** [`../API_CONTRACTS.md`](../API_CONTRACTS.md)

---

## Scope und Source of Truth

Dieses Dokument ist Owner fuer die Browser-seitige Entry Surface:

- welche Next.js-Routen der Browser direkt nutzen darf
- welche APIs nur intern / agent-intern / UI-intern sind
- welche direkten Browser-Bypaesse verboten sind

Nicht Owner dieses Dokuments:

- Go-, Python-, Rust- oder GCT-Details
- interne Service-Boundaries hinter dem Gateway

---

## Externe Entry Surface: Browser -> Next.js

- Browser ruft ausschliesslich `src/app/api/*` bzw. Pages/Server Actions auf.
- Direkte Browser-Calls nach Go, Python, GCT oder externen Providern sind fuer
  Domainpfade nicht erlaubt.

### Erlaubte Pfade

| Pfad-Typ | Beispiele | Hinweis |
|:---------|:----------|:--------|
| Market / Streaming BFF | `/api/market/*` | Browser spricht nur Next.js |
| Geo / UIL BFF | `/api/geopolitical/*` | Go bleibt Domain-Owner |
| Memory BFF | `/api/memory/*` | Next bleibt Proxy, Go/Python besitzen Domainlogik |
| Auth / Security | `/api/auth/*` | Session-/Auth.js- und Security-Surfaces |
| Server Actions | app/pages Server Actions | nur wenn keine direkte Domain-Bypass-Logik entsteht |

### Next-only State Observation

Diese APIs gehoeren zur Browser-/Next-Grenze und laufen **nicht** ueber Go:

| Pfad | Rolle |
|:-----|:------|
| `/api/agent/state` | On-demand Frontend-State-Snapshot fuer agentische Context-Assembly |
| `/api/agent/state-stream` | Live-Frontend-State-Events fuer Agent-/Observation-Szenarien |

Regel:

- diese APIs liefern Observation-Kontext, sind aber **kein Ersatz** fuer
  serverseitige Domain-Reads/Writes
- mutierende Fachlogik bleibt auf Go-geschuetzten Pfaden

Kurzbeispiele:

```json
// GET /api/agent/state
{
  "page": "/chart/AAPL",
  "chart": { "symbol": "AAPL", "timeframe": "4H" },
  "geomap": { "mode": "game-theory", "zoom": 5 },
  "watchlist": ["AAPL", "GLD", "BTC-USD"]
}
```

```json
// WS /api/agent/state-stream
{ "type": "chart_symbol_change", "data": { "from": "AAPL", "to": "GLD" } }
```

### Verboten

- Direkte `fetch()` zu Go Gateway-URL
- Direkte Aufrufe zu Python-Services
- Direkte Aufrufe zu GCT
- Direkte Aufrufe zu externen Providern (Finnhub, etc.) fuer Domainpfade

---

## Querverweise

- [`API_NEXT_TO_GO.md`](./API_NEXT_TO_GO.md)
- [`API_SHARED_INVARIANTS.md`](./API_SHARED_INVARIANTS.md)
- [`../UIL_ROUTE_MATRIX.md`](../UIL_ROUTE_MATRIX.md)
