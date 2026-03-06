# Execution Mini-Plan (Checkliste)

> **Stand:** 05 Mär 2026 (Rev. 21 — Phase 5 SOTA 2026 Caching & Data Fetching CODE-COMPLETE)
> **Archiv:** [`docs/archive/execution_mini_plan_rev5_2026-03-03.md`](../archive/execution_mini_plan_rev5_2026-03-03.md)

Dieses Dokument dient als **dynamische Checkliste** für die finalen Meter vor dem Phase-4-Closeout und den Verify-Gates.

---

## Offene Gates (EXECUTION_PLAN.md Rev. 3.28)

| Gate | Phase | Status |
|:-----|:------|:-------|
| Phase 5 SOTA 2026 Caching & Data Fetching | 5 | **CODE-COMPLETE** ✅ (05.03.2026) — Live-Verify offen (Browser) |
| Phase 0 X-Request-ID Propagation | 0 | **DONE** ✅ (Go, Python, Next.js Middleware) |
| Phase 0e Live-Verify (OTel → OpenObserve) | 0e | **DONE** ✅ (Traces, Logs, Metrics verified) — 04.03.2026 |
| Phase 0f Error Boundaries (ERRORS.md §1) | 0f | **DONE** ✅ (global, root, geomap granular) — 04.03.2026 |
| Phase 1 Live-Verify (Browser/E2E) | 1 | **DONE** ✅ (Elite SOTA 2026 Flow verified) — 04.03.2026 |
| Phase 2 Contract-Check (Go/Next JSON parity) | 2 | **CODE-COMPLETE** — Browser-Flow offen |
| Phase 3 Live-Verify (SSE, Alert, Reconnect) | 3 | **3.v1 DONE** (event:ready curl ✅) — Browser-Gates offen |
| Phase 4 GeoMap E2E + Performance + ADR Closeout | 4 | Offen — Browser + laufender Next nötig |
| Phase 7 Verify Gates (swing_detect, MAs, Fibonacci) | 7 | **7.v1 DONE** (swings/fib/kama curl ✅) — 7.v2–7.v3 Browser nötig |
| Phase 8 Verify Gates (Elliott, Harmonic, Patterns) | 8 | **8.v1 DONE** (candlestick pattern curl ✅) |
| Phase 10 Verify Gates (10.v1–10.v3) | 10 | Offen — LLM-Endpoint im Stack nötig |
| Phase 12a NLP Verify (Embedding-Cluster-Endpoint) | 12a | **12a.v1+v2+v3 DONE** — (HDBSCAN cluster endpoint live, 2 Cluster korrekt) |
| Phase 12 Verify Gates (Contradiction, Alert, PDF Export) | 12 | Offen — Stack + Browser nötig |
| Phase 13 Live-Verify (curl + Browser) | 13 | **13.v1–13.v3+13.v5 DONE** — (HRP/Kelly/RegimeSizing/VPIN) — 13.v4 partial |
| Phase 14 Sanctions Fetch (UN/OFAC/SECO) | 14 | **14.v2 DONE** — (UN live: echte Entities von scsanctions.un.org) |
| Phase 15 Remaining (Order Flow, Eval Baseline, CUSUM) | 15 | **15.v6+v7+v8 DONE** — (OrderFlow/EvalBaseline/CUSUM curl verified) |

---

## Phase 0e: Live-Verify (OTel → OpenObserve)

**Root-Cause-Fix (04.03.2026):** dev-stack lädt alle 3 `.env`-Files sequenziell. Spätere Dateien überschrieben Go's `localhost:5081`. Go-gRPC-Exporter lehnte `http://`-Präfix ab (`too many colons in address`). Fix: `stripScheme()` in `go-backend/internal/telemetry/auth.go` — strippt `http://`/`https://` vor Übergabe an alle 3 gRPC-Exporter.

---

## Phase 0f: Error Boundaries (ERRORS.md §1) — SOTA 2026 Elite

- [x] 0f.1 — `src/app/global-error.tsx` (Last Resort, Hard-Reset, SOTA 2026 UI) ✅ 04.03.2026
- [x] 0f.2 — `src/app/error.tsx` (Top-Level, SOTA 2026 UI) ✅ 04.03.2026
- [x] 0f.3 — `src/app/geopolitical-map/error.tsx` (granular – Map-Crash, SOTA 2026 UI) ✅ 04.03.2026
- [x] **0f.4 — Deep OTel API Integration:** `console.error` Logs durch echtes `@opentelemetry/api` Span-Tagging ersetzen (via structured logs auto-pickup). ✅ 04.03.2026
- [x] **0f.5 — Client Metrics Bridge:** Metriken wie `error_boundary_trigger_count` via OTLP an OpenObserve (instrumentation.ts). ✅ 04.03.2026
- [x] **0f.6 — Integration-Verify (Crash Test):** Manuelles Triggern eines Frontend-Crashes. Verifikation: UI erscheint ✅ + Console-Logs/Traces in OO ✅. 04.03.2026
- [x] **0f.7 — Durable State Recovery:** Gezieltes Caching des "Last Known Good State" vor dem Reset (sessionStorage reset-protection). ✅ 04.03.2026


---

## Phase 1: Elite Auth & Lifecycle (SOTA 2026)

#### 1. Core Auth Flow (Standard Gates)
- [x] **1.v1 — Identity Verification:** Login mit Credentials (`new_elite_trader` / `ElitePassword2026!`) funktioniert. ✅ 04.03.2026
- [x] **1.v2 — Session Transport:** Verifikation des HTTP-only Cookies (`fusion.session-token`) inkl. SOTA-Flags. ✅ 04.03.2026
- [x] **1.v3 — Sliding Window Check:** Sitzung verlängert sich bei Aktivität automatisch (5m Update-Intervall). ✅ 04.03.2026
- [x] **1.v4 — Local Logout:** User-Icon Dropdown -> Sign Out zerstört Session-Cookie. ✅ 04.03.2026

#### 2. Backend Integration (Elite Revocation Bridge)
- [x] **1.v5 — Global Revocation Bridge:** Implementierung des `onSignOut` Callbacks in `src/lib/auth.ts`, der die JTI an Go-Gateway sendet. ✅ 04.03.2026
- [x] **1.v6 — Real-time JTI Validation:** Der `jwt` Callback in Next.js prüft die JTI alle 60s gegen Go-Revocation Store (Hybrid). ✅ 04.03.2026
- [x] **1.v7 — Audit Hash-Chain:** Sperrungen im Go-Backend werden in JSONL fälschungssicher geloggt. ✅ 04.03.2026

#### 3. Cross-Stack Sync (Go-Backend Upgrade)
- [x] **1.g1 — Global User Revocation Store:** Go extended um `map[userId]revokedBefore`. ✅ 04.03.2026
- [x] **1.g2 — Revocation API Expansion:** Endpoint `POST /api/v1/auth/revocations/user` aktiv. ✅ 04.03.2026
- [x] **1.g3 — Enhanced JWT Middleware:** Go prüft `iat` gegen `revokedBefore` + `amr` MFA-Check. ✅ 04.03.2026
- [x] **1.g4 — Go Security Audit:** Neue Events in `jwt-revocations.jsonl`. ✅ 04.03.2026

#### 4. Next.js Frontend Elite (The Bridge)
- [x] **1.f1 — JWT Payload Enrichment:** `amr` Claim (`["pwd", "mfa"]`) im Callback aktiv. ✅ 04.03.2026
- [x] **1.f2 — Cross-Stack Revocation Signal:** `changePassword` / `resetPassword` senden User-Revocation an Go. ✅ 04.03.2026
- [x] **1.f3 — Recovery Code Logic:** UI für Reset via 8 Einmal-Codes (Option 1) implementiert. ✅ 04.03.2026

#### 5. User Self-Service (Password Security Suite)
- [x] **1.v8 — Password Change Flow:** UI-Panel in Security Hub + Server Action aktiv. ✅ 04.03.2026
- [x] **1.v9 — Recovery Flow (Forgot Password):** Magic-Link via OTel-Log + Recovery Code Reset. ✅ 04.03.2026
- [x] **1.v10 — Password Strength 2026:** Zod-Validierung + Unique Username im RegisterPanel. ✅ 04.03.2026

#### 6. Advanced Hardware Auth (Passkey & MFA)
- [x] **1.v11 — Passkey Enrollment:** UI im Security Hub zur WebAuthn-Registrierung (Windows Hello). ✅ 04.03.2026
- [x] **1.v12 — MFA Suite:** TOTP Setup (QR-Code SVG via `qrcode.react`) + Recovery Codes in DB. ✅ 04.03.2026

#### 7. High-Fidelity Observability (Audit Trail)
- [x] **1.v13 — Security Event Tagging:** `SECURITY_EVENT_LOGIN_SUCCESS` etc. in OO sichtbar. ✅ 04.03.2026
- [x] **1.v14 — Correlation-ID Mapping:** `X-Request-ID` in allen Auth-Logs enthalten. ✅ 04.03.2026

#### 8. Quality & Verify Gates (Cross-Stack)
- [x] **1.q1 — Go Expert Testing:** Unit-Tests + `go test -race` + `golangci-lint` (0 issues). ✅ 04.03.2026
- [x] **1.q2 — Frontend Integrity:** Biome Clean ✅ + `tsc --noEmit` ✅. 04.03.2026
- [ ] **1.v17 — Global Revocation E2E:** Password Change in Tab B führt zu `401` in Tab A (Go-Route).
- [ ] **1.v18 — MFA Enforcement Check:** Zugriff auf sensible Go-Route ohne MFA-Login wird abgelehnt.
- [ ] **1.v19 — Hardware Recovery Check:** Passwort-Reset via Recovery-Code erfolgreich.
- [x] **1.v20 — JTI Bridge Verify:** Logout -> JTI in Go Audit Log sichtbar. ✅ 04.03.2026
- [x] **1.v21 — User Revocation Verify:** Passwort ändern -> GLOBAL_USER_REVOCATION in Go Audit Log. ✅ 04.03.2026
- [ ] **1.v22 — MFA "amr" Verify:** Login mit MFA -> JWT Claim `amr: ["pwd", "mfa"]` in OO.
- [x] **1.v23 — Recovery Code "Burn" Verify:** Einmal-Code für Passwort-Reset nutzen -> Gelöscht. ✅ 04.03.2026
- [x] **1.v24 — Session Suspension (Soft Lock):** ✅ 05.03.2026
    *   `src/components/InactivityMonitor.tsx` — `useIdleTimer` (10min, crossTab, BroadcastChannel). `react-idle-timer@5.7.2`.
    *   `src/components/LockScreen.tsx` — Blur-Overlay (z-[9999], backdrop-blur-xl), Re-Auth via `signIn("credentials")`, 5-Strike Hard-Logout.
    *   `src/components/providers.tsx` — `dynamic(() => import InactivityMonitor, { ssr: false })` (verhindert Date.now()-Prerender-Fehler).
    *   `src/lib/auth.ts` — `maxAge: 8 * 60 * 60` (8h statt 15min; Soft Lock ist primäre Sicherheitsschicht).
    *   RAM-State (TradingWorkspace, Chart, Portfolio) bleibt erhalten — LockScreen rendert über bestehenden React-Tree.
    *   `TVP_LOCK_STATE` sessionStorage-Key (Pattern aus `global-error.tsx:TVP_LAST_CRASH_MARKER`).
    *   `bun run lint && bun run build` clean ✅

---

## Phase 5: Elite Caching Strategy (Evaluation)

> **Zweck:** Nutzung der Next.js 16 `"use cache"` Direktive zur Performance-Steigerung teurer Berechnungen.

#### 1. Caching Evaluation
- [ ] **5.v1 — Metadata Caching:** Identifikation von Routen, die `"use cache"` für Länderlisten nutzen können.
- [ ] **5.v2 — Historical Data Cache:** Evaluierung von Caching-Strategien für historische Marktdaten.
- [ ] **5.v3 — Cache Invalidation:** Implementierung von `cacheTag` und `revalidateTag`.

#### Legacy Cleanup Documentation (04.03.2026)
Folgende Dateien wurden vom SOTA-inkompatiblen `force-dynamic` befreit (Next.js 16 Unified Caching Mode):
- `src/app/auth/security/page.tsx`
- `src/app/auth/sign-in/page.tsx`
- `src/app/api/market/stream/route.ts`
- `src/app/api/market/stream/quotes/route.ts`
- `src/app/auth/privacy/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/auth/passkeys-lab/page.tsx`
- `src/app/auth/passkeys/page.tsx`
- `src/app/auth/kg-encryption-lab/page.tsx`
- `src/app/api/auth/passkeys/authenticate/verify/route.ts`
- `src/app/api/auth/passkeys/authenticate/options/route.ts`
- `src/app/api/auth/passkeys/register/verify/route.ts`
- `src/app/api/auth/passkeys/register/options/route.ts`
- `src/app/auth/admin/users/page.tsx`
- `src/app/api/geopolitical/contradictions/[contradictionId]/route.ts`
- `src/app/api/geopolitical/events/[eventId]/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/accept/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/reclassify/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/reject/route.ts`
- `src/app/api/geopolitical/candidates/[candidateId]/snooze/route.ts`

Ebenfalls entfernt wurde die redundante `runtime = "nodejs"` Direktive in folgenden API-Routen:
- `src/app/api/memory/search/route.ts`, `/episodes/route.ts`, `/health/route.ts`, `/kg/query/route.ts`, `/kg/sync/route.ts`, `/kg/seed/route.ts`, `/kg/nodes/route.ts`, `/episode/route.ts`
- `src/app/api/market/stream/route.ts`, `/quotes/route.ts`
- `src/app/api/geopolitical/timeline/route.ts`, `/stream/route.ts`, `/seed/route.ts`, `/events/route.ts`, `/ingest/classify/route.ts`, `/graph/route.ts`, `/game-theory/impact/route.ts`, `/candidates/route.ts`, `/ingest/hard/route.ts`, `/ingest/soft/route.ts`, `/contradictions/route.ts`, `/context/route.ts`

---

## Phase 7 Verify Gates (Stack + Browser erforderlich)

*(Gates siehe EXECUTION_PLAN.md Phase 7)*

---

## Phase 5: SOTA 2026 Caching & Data Fetching (CODE-COMPLETE 05.03.2026)

### 5.v1–5.v3: "use cache" Server-Primitive
- [x] **5.v1** — `geopolitical/regions/route.ts`: `getRegions()` Helper + `cacheTag("geo-regions")` + `cacheLife("hours")` ✅
- [x] **5.v2** — `geopolitical/alerts/policy/route.ts`: `getAlertPolicy()` Helper + `cacheTag("geo-alert-policy")` + `cacheLife("minutes")` + `revalidateTag("geo-alert-policy", "minutes")` in PATCH ✅
- [x] **5.v3a** — `geopolitical/overlays/central-bank/route.ts`: `getCentralBankOverlay()` Helper + `cacheTag` + `cacheLife` + `revalidateTag` in PATCH ✅
- [x] **5.v3b** — `geopolitical/sources/health/route.ts`: `getSourceHealth()` Helper + `cacheTag("geo-source-health")` + `cacheLife("minutes")` ✅
- **Note:** Next.js 16 `revalidateTag(tag, profile)` erfordert zweites Argument — `"minutes"` als Profil-String. Wurde im Build entdeckt und gefixt.

### 5.v4: QueryClientProvider
- [x] **5.v4** — `src/lib/query-client.ts` NEU: `QueryClient` mit `staleTime: 30_000, retry: 2` ✅
- [x] **5.v4** — `src/components/providers.tsx`: `QueryClientProvider` nach SessionProvider gewrappt ✅

### 5.v5: useEffect → useQuery Migration (8 Komponenten)
- [x] `OrdersPanel` — `useQuery({ queryKey: ["orders", profileKey, symbol], refetchInterval: 12_000 })` + `setQueryData` bei POST/PATCH ✅
- [x] `MemoryStatusBadge` — `useQuery({ queryKey: ["memory-health"], refetchInterval: 30_000, throwOnError: false })` ✅
- [x] `MacroPanel` — `useQuery({ queryKey: ["macro-quote", symbol], enabled: isMacroSymbol })` ✅
- [x] `NewsPanel` — `useQuery({ queryKey: ["news", symbol], staleTime: 60_000 })` ✅
- [x] `KellyAllocationPanel` — `useQuery({ queryKey: ["kelly-allocation", symbols], enabled: symbols.length > 0 })` (POST in queryFn) ✅
- [x] `RegimeSizingPanel` — `useQuery({ queryKey: ["regime-sizing", symbols], enabled: symbols.length > 0 })` ✅
- [x] `MonteCarloVarPanel` — `useQuery({ queryKey: ["monte-carlo-var", symbols, weights], enabled: symbols.length > 0 })` ✅
- [x] `SettingsPanel` — `useQuery({ queryKey: ["market-providers"], enabled: isOpen })` ✅

### 5.v6: SSE → setQueryData / invalidateQueries
- [x] `WatchlistPanel`: `queryClient.setQueryData(["quotes", symbolsKey], updater)` bei `quote_batch` SSE-Event ✅
- [x] `useGeopoliticalWorkspaceData`: `queryClient.invalidateQueries({ queryKey: ["geo-events"] })` bei SSE-Events statt `fetchAll({ silent: true })` ✅

### 5.v7: Docs
- [x] `FRONTEND_ARCHITECTURE.md` Rev. 3: Caching-Pyramide, useEffect-Regeln 2026, TanStack Query Setup, SSE+React Query Pattern ✅
- [x] `execution_mini_plan.md` Rev. 21: Phase 5 eingetragen ✅

### Verify Gates (Browser erforderlich)
- [ ] `bun run build` ohne Date.now/randomUUID-Prerender-Fehler ✅ (bereits verifiziert)
- [ ] regions GET: zweiter Request → Cache-Hit im Dev-Log
- [ ] alerts/policy: PATCH → `revalidateTag` → nächster GET frische Daten
- [ ] App startet ohne React Query Context-Error
- [ ] OrdersPanel lädt Daten, pollt alle 12s
- [ ] MemoryStatusBadge pollt alle 30s
- [ ] Portfolio-Panels (Kelly, Regime, VaR) laden korrekte POST-Ergebnisse

---

## Phase 1 Verify Gate 1.v24 (Browser erforderlich)

- [ ] `IDLE_SOFT_MS` auf 10_000 setzen → nach 10s LockScreen erscheint
- [ ] RAM-State (Symbol, Watchlist) nach Lock unverändert
- [ ] Falsches PW 5x → Hard signOut → `/auth/sign-in`
- [ ] Richtiges PW → Overlay weg, State intakt
- [ ] Tab B zeigt LockScreen wenn Tab A sperrt (BroadcastChannel)
- [ ] Nach 8h Inaktivität → Hard signOut

---

## Evaluation: ChartGPU (Trading-Chart Performance)

- [ ] **ChartGPU Evaluation** — WebGPU-basierte Chart-Rendering für Trading-Charts (Candlestick, 120+ FPS, Millionen Datenpunkte). **IST:** `lightweight-charts` 5.1.0. **SOLL:** Evaluation ob ChartGPU Performance-Gewinn ohne Rust-Komplexität bringt. Referenzen: [`REFERENCE_PROJECTS.md`](../REFERENCE_PROJECTS.md) (ChartGPU Eintrag), [`RUST_LANGUAGE_IMPLEMENTATION.md`](../RUST_LANGUAGE_IMPLEMENTATION.md) Sek. 6 (Alternative: ChartGPU). EXECUTION_PLAN Phase 22c.
