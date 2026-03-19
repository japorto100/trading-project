# Service-Config-Konsolidierung — Delta

**Stand:** 17.03.2026
**Phase:** Cross-cutting / DX
**Status:** Next.js DONE — Go/Python/Rust PLANNED

## Aenderungshistorie

| Datum | Autor | Aenderung |
|-------|-------|-----------|
| 17.03.2026 | Agent | Initial: Next.js Gateway-URL konsolidiert |

## Problem

Vor diesem Slice gab es ~30 Stellen im Next.js-Layer, die den Go-Gateway-Base-URL
hardcodierten (`http://127.0.0.1:9060`) oder per eigener Inline-Funktion aus
`process.env.GO_GATEWAY_BASE_URL` lasen — ohne einheitliche Fallback-Logik oder
gemeinsame Testbarkeit.

Patterns, die ersetzt wurden:
- `const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060"` + Inline-Aufloesung
- `const GATEWAY_BASE = (process.env.GO_GATEWAY_BASE_URL ?? "http://127.0.0.1:9060").trim()`
- `const GO_GATEWAY_BASE = process.env.GO_GATEWAY_BASE_URL ?? "http://127.0.0.1:9060"`
- Lokale `buildGatewayURL()` / `buildGatewayBaseURL()` Helper

## Loesung Next.js

Neue Single Source of Truth: `src/lib/server/gateway.ts`

```ts
export function getGatewayBaseURL(): string {
  return (process.env.GO_GATEWAY_BASE_URL ?? "http://127.0.0.1:9060").trim();
}
```

Alle 33 betroffenen Dateien importieren jetzt `getGatewayBaseURL` von dort.
Lokale Konstanten und Hilfsfunktionen wurden entfernt.

### Betroffene Dateien (33 total + 1 neu)

**Neu erstellt:**
- `src/lib/server/gateway.ts`

**Geaendert (lib/server, lib/strategy, lib/geopolitical):**
- `src/lib/server/market-gateway-quotes.ts`
- `src/lib/server/geopolitical-gateway-proxy.ts`
- `src/lib/server/geopolitical-game-theory-bridge.ts`
- `src/lib/server/geopolitical-context-bridge.ts`
- `src/lib/server/geopolitical-acled-bridge.ts`
- `src/lib/strategy/indicator-service.ts`
- `src/lib/geopolitical/adapters/soft-signals.ts`

**Geaendert (API routes):**
- `src/app/api/audio/transcribe/route.ts`
- `src/app/api/audio/synthesize/route.ts`
- `src/app/api/agent/completion/route.ts`
- `src/app/api/agent/chat/route.ts`
- `src/app/api/market/stream/route.ts`
- `src/app/api/market/stream/quotes/route.ts`
- `src/app/api/market/search/route.ts`
- `src/app/api/market/providers/route.ts`
- `src/app/api/market/ohlcv/route.ts`
- `src/app/api/market/news/route.ts`
- `src/app/api/control/tool-events/route.ts`
- `src/app/api/control/skills/route.ts`
- `src/app/api/control/sessions/route.ts`
- `src/app/api/control/kg-context/route.ts`
- `src/app/api/control/evals/route.ts`
- `src/app/api/control/security/route.ts`
- `src/app/api/control/memory/route.ts`
- `src/app/api/control/agents/route.ts`
- `src/app/api/control/overview/route.ts`
- `src/app/api/control/sessions/[id]/kill/route.ts`
- `src/app/api/geopolitical/news/route.ts`
- `src/app/api/geopolitical/macro-quote/route.ts`
- `src/app/api/geopolitical/macro-overlay/route.ts`
- `src/app/api/fusion/portfolio/live/route.ts`
- `src/app/api/fusion/portfolio/analytics/[slug]/route.ts`

**Nicht geaendert** (andere Logik / kein Fallback-Pattern):
- `src/lib/server/consent.ts`
- `src/lib/server/auth-user.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/fusion/preferences/route.ts`

## Offen (spaetere Slices)

| Layer | Aufgabe | Phase |
|-------|---------|-------|
| Go | `internal/config/config.go` zentralisieren | Pre-P11 |
| Python | `pydantic-settings` BaseSettings fuer alle Services | P8-Folgearbeit |
| Rust | `config` crate einheitlich fuer Compute-Service | P20 |
| .env | `.env.example` Sync: GO_GATEWAY_BASE_URL dokumentieren | naechste DX-Runde |
