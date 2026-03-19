# worldwideview Stage 2 Adapter Matrix

Source repo: `d:\tradingview-clones\_tmp_ref_review\geo\worldwideview`

## Extract vs Skip

| File | Decision | Why it matters for GeoMap |
|---|---|---|
| `src/app/api/aviation/route.ts` | Extract | Good fallback chain (memory cache -> Supabase history -> empty safe response). |
| `src/lib/aviation/polling.ts` | Extract | Strong adaptive polling pattern (timeout, retry, credential rotation, jitter, backoff). |
| `src/lib/aviation/credentials.ts` | Extract | Credential pool + rotation threshold model useful for provider budget resilience. |
| `src/app/api/maritime/route.ts` | Extract | Clean stream-to-GeoEntity normalization boundary. |
| `src/lib/ais-stream.ts` | Extract | Long-lived WS manager with reconnect, stale-cycle, bounded cache. |
| `src/app/api/military/route.ts` | Extract | Minimal stable API contract when upstream cache is empty/failing. |
| `src/lib/military/polling.ts` | Extract | Compact polling-backoff template for single-source feeds. |
| `src/app/api/wildfire/route.ts` | Extract (partial) | Useful: multi-tier cache + provider-key fallback + parse pipeline. Skip domain-specific clustering constants as-is. |
| `src/app/api/camera/traffic/route.ts` | Extract | Multi-source fan-in with stale cache fallback pattern. |
| `src/app/api/camera/proxy/route.ts` | Skip (review-only) | Open proxy shape; high SSRF risk without strict allowlist/signing. |
| `src/app/api/camera/gdot/gdotFetcher.ts` | Extract (partial) | Useful pagination adapter template for ArcGIS-style APIs. |
| `src/app/api/aviation/history/route.ts` | Extract | Strong nearest-timestamp history retrieval contract for playback/replay queries. |
| `src/app/api/aviation/availability/route.ts` | Extract | Useful availability-range API contract for timeline overlays/debug. |
| `src/lib/aviation/rate-limit.ts` | Extract | Header-driven adaptive backoff model with retry-after consumption. |
| `src/lib/aviation/supabase.ts` | Extract (partial) | Good persisted fallback/read-through pattern; keep architecture, not schema details. |
| `src/lib/aviation/auth.ts` | Extract | Clean token boundary for credential pool consumers. |
| `src/instrumentation.ts` | Extract | Runtime startup orchestration pattern for background pollers/streams. |
| `src/app/api/places/search/route.ts` | Extract (partial) | Useful server-side cached geocoding/autocomplete proxy with user-key override. |
| `src/app/api/places/details/route.ts` | Extract (partial) | Cached place-details lookup contract for map focus/handoff. |
| `src/app/api/keys/verify/route.ts` | Extract | Pragmatic key-verification endpoint pattern for provider diagnostics UX. |
| `src/lib/userApiKeys.ts` | Extract (partial) | Reusable client-side key registry/header mapping pattern (harden for security model). |
| `src/app/api/camera/tfl/tflFetcher.ts` | Extract (partial) | Source adapter normalization template for heterogeneous traffic feeds. |
| `src/app/api/camera/caltrans/caltransFetcher.ts` | Extract (partial) | Source adapter normalization template; pair with fan-in route pattern. |

## Transferable Patterns (for tradeview-fusion)

1. **Adapter fallback ladder**  
   Preferred source -> warm cache -> persisted snapshot/history -> empty deterministic payload.

2. **Polling resilience contract**  
   `timeout + backoff + jitter + rotation + source-specific max backoff`.

3. **Credential pool management**  
   Multiple credentials, active index, exhaustion tracking, auto-rotation.

4. **WS stream manager contract**  
   Global singleton state, reconnect scheduling, stale connection cycling, bounded in-memory cache.

5. **Fan-in API pattern**  
   `Promise.allSettled` merge of heterogeneous sources with partial success handling.

6. **Playback-backend contract**  
   Explicit `history` and `availability` endpoints for timeline-driven map state.

7. **Provider diagnostics contract**  
   Server-side key verification endpoint for source health/onboarding UX.

## Do-not-copy notes

- Do not copy source-specific URLs, thresholds, or category labels directly.
- Do not copy proxy endpoints without host allowlist + validation + explicit policy checks.
- Keep your existing GeoMap temporal contract (`view/filter/selected-time`) as source-of-truth.
