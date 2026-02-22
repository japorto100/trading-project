# GO GATEWAY — Integration & Optionen

> **Stand:** 20. Februar 2026  
> **Zweck:** Detaillierte Integration des Go Gateways mit Frontend, AI-Agents und alternativen Protokollen. Ergänzt `.cursor/rules/go-backend.mdc` und `docs/specs/API_CONTRACTS.md`.  
> **Auth-Referenz:** `docs/specs/AUTH_SECURITY.md` — MCP-Sicherheit siehe dort Sek. 8.

---

## 1. React Server Components (RSC) — SOTA 2026

### Was ist RSC

Next.js 16 nutzt **Server Components by default**. Sie laufen auf dem Server, fetchen Daten direkt (ohne Client-JS), und streamen HTML. Client Components (`'use client'`) nur wo Interaktivität nötig ist.

### Integration mit Go Gateway

| Aspekt | Details |
|:---|:---|
| **Aufruf** | RSC ruft Go Gateway per `fetch()` direkt auf (gleiche URLs wie Client). Kein Code-Change in Go. |
| **Auth** | Server-seitiger Fetch: Cookies (JWT) werden automatisch mitgesendet. Go validiert wie gewohnt. |
| **Caching** | Next.js `fetch` cached per Default. Für Market Data: `cache: 'no-store'` oder `next: { revalidate: 30 }`. |
| **Fehler** | RSC kann `error.tsx` / `loading.tsx` nutzen. Go-Fehler → Error Boundary. |

### Wo RSC einsetzen (SOTA-Pattern)

| Seite/Bereich | RSC? | Begründung |
|:---|:---|:---|
| **Dashboard initial** | Ja | Watchlist-Symbole, erste Quote-Snapshots. Schnellerer First Paint, kein `useEffect` + `fetch` im Client. |
| **GeoMap initial** | Ja | Events, Timeline, Regionen beim ersten Load. Danach Client für Interaktion. |
| **Portfolio Summary** | Ja | Statische Übersicht. Live-Updates per Client + TanStack Query. |
| **Chart** | Nein | Braucht `lightweight-charts`, DOM, Interaktion → Client Component. |
| **Watchlist** | Hybrid | Liste per RSC, Klicks/State im Client. |
| **News Panel** | Ja | Headlines initial per RSC, Polling/SSE im Client. |

### Beispiel (RSC)

```tsx
// app/page.tsx (Server Component)
export default async function TradingPage() {
  const symbols = await fetch(`${process.env.GO_GATEWAY_BASE_URL}/api/v1/market/search?q=top`, {
    cache: 'no-store',
    headers: { 'X-Request-ID': crypto.randomUUID() },
  }).then(r => r.json());

  return (
    <TradingLayout>
      <WatchlistSidebar symbols={symbols} />  {/* Server-rendered */}
      <TradingChart />  {/* Client Component, 'use client' */}
    </TradingLayout>
  );
}
```

### Go-Seite: Keine Änderung nötig

Go Gateway bleibt unverändert. RSC nutzt dieselben REST-Endpoints. Einzige Anforderung: Go muss **server-seitige Requests** akzeptieren (andere `User-Agent`, gleiche Auth via Cookie-Forwarding durch Next.js).

---

## 2. MCP (Model Context Protocol) — Optional

### Was ist MCP

**Model Context Protocol** — Standard damit AI-Agents (Cursor, Claude, etc.) Tools und Ressourcen nutzen können. Ein MCP-Server exponiert z.B. `get_quote`, `get_portfolio` als "Tools".

**Go MCP SDK:** `github.com/modelcontextprotocol/go-sdk` — offizielle Implementierung für MCP-Server und -Clients in Go.

### Use Cases (wenn aktiviert)

| Tool | Beschreibung | Sensibilität |
|:---|:---|:---|
| `get_quote(symbol)` | Aktueller Preis eines Symbols | Niedrig |
| `get_ohlcv(symbol, timeframe, limit)` | OHLCV-Historie | Niedrig |
| `get_portfolio_summary()` | Portfolio-Übersicht | **Hoch** |
| `get_geopolitical_events(region?)` | Geo-Events für Region | Niedrig |
| `get_news(symbol?)` | News-Headlines | Niedrig |
| `submit_order(...)` | **Niemals** als MCP-Tool | Kritisch |

### Warum MCP unsicher by default

- MCP-Server lauscht typischerweise auf `stdio` oder `localhost` — kein Auth-Layer
- AI-Agents können alle exponierten Tools aufrufen
- Kein RBAC, kein Rate Limit, kein Audit-Log im Standard
- **Ohne Härtung:** Jeder mit Zugriff auf den Agent kann Portfolio-Daten lesen oder schlimmeres

### Auth-Anforderungen für MCP (wenn aktiviert)

Siehe `docs/specs/AUTH_SECURITY.md` Sek. 9. Kurz:

- MCP-Server nur als **Sub-Process** des Gateways, nicht als eigenständiger Service
- Jeder MCP-Tool-Call muss **JWT-validiert** durch den Go Gateway
- **RBAC:** Nur `viewer`-Tools für MCP (Quote, News, Events). Kein Portfolio, keine Orders
- **Rate Limit:** Strikte Limits pro Agent-Session
- **Audit:** Jeder MCP-Tool-Call wird geloggt (Agent-ID, Tool, User)

### Empfehlung

**Optional, Phase 9+.** Nur wenn AI-Agents (Cursor Composer, Claude Code) explizit auf unsere Daten zugreifen sollen. Ohne Auth-Härtung nicht aktivieren.

---

## 3. Weitere Optionen

### WebTransport (QUIC/HTTP3)

- **Status:** Beobachten. W3C Spec aktiv, Browser-Support noch nicht universell.
- **Vorteil:** Kein Head-of-Line-Blocking wie WebSocket/SSE. Multiplexing, unreliable Datagrams für Tick-Daten.
- **Relevanz:** Für Real-Time Market-Streaming (Phase 5). Aktuell SSE ausreichend.
- **Crates:** `wtransport`, `web-transport` (Rust). Go: experimentelle `net/http` HTTP/3 Support.

### gRPC-Web

- **Status:** Go Gateway könnte gRPC-Web für Browser-Clients anbieten.
- **Vorteil:** Binär-Protokoll, weniger Overhead als JSON-REST.
- **Nachteil:** Mehr Komplexität, REST reicht für unser Volumen.
- **Empfehlung:** Nicht priorisieren. REST + SSE bleibt Standard.

### GraphQL

- **Status:** Nicht geplant.
- **Begründung:** REST-API ist überschaubar, Contract-First mit `API_CONTRACTS.md`. GraphQL Overhead nicht gerechtfertigt.
