# Code-Review: Codex-Änderungen (Phasen 0–4, 9e, 12, 14)

> **Stand:** 23. Februar 2026  
> **Gegenstand:** Systematisches Review aller uncommitteten Änderungen (git diff + untracked) im Projekt `tradeview-fusion`, die dem Execution Plan (Phasen 0–4, 9e, 12, 14) zuzuordnen sind.

---

## 1. Übersicht

- **Geänderte Dateien:** ~106 modified, viele neue untracked (Go-Handler, Connectors, Middleware, GeoMap-Stores, Tests).
- **Zeilen:** ~+10.3k / −3.8k (netto stark positiv; Refactors wie GeopoliticalMapShell reduzieren Lok deutlich).
- **Bewertung Gesamt:** Die Änderungen setzen den Execution Plan konsequent um (Go-First, Auth-Baseline, Rust/Polars/Streaming, GeoMap v2, Phase 9e). Qualität und Struktur sind gut; einige Punkte verdienen vor Merge/Release besondere Beachtung.

---

## 2. Go Backend

### 2.1 Positiv

- **Middleware (`internal/app/middleware.go`):** Request-ID, Security-Header (inkl. API-CSP), CORS mit Allowlist und OPTIONS-Handling, Logging inkl. `userRole`/`userId`/`authVerified` – sauber und einheitlich.
- **Wiring (`internal/app/wiring.go`):** Klar strukturiert: ENV-basierte Config, Secure-Env-Decoder für GCT (optional AES-GCM), viele Connectors (BCB, Banxico, BOK, BCRA, TCMB, RBI, SDMX-Basis) über `RoutedMacroClient` mit Prefix-Registry. Kein Wiring-Chaos; Erweiterung neuer Quellen folgt erkennbarem Muster.
- **BaseConnector-Migration:** Bestehende Connectors (ACLED, Finnhub, FRED, ECB, News, GDELT, GameTheory, CrisisWatch, etc.) nutzen gemeinsamen `base.Client`; Retry/Timeout/Ratelimit zentral. Entspricht Phase 0b.
- **Quote/OHLCV/News/Search:** Handler und Services mit Failover (Quote `exchange=auto`, OHLCV `FINANCE_BRIDGE_URLS`), Fehlerklassifizierung für Adaptive Router, Tests ergänzt (z. B. `quote_handler_test.go`, `macro_history_handler_test.go`, `news_service_test.go`).
- **SSE Market Stream (`internal/handlers/sse/market_stream.go`):** Candle Builder, Alert Engine, Snapshot/Reconnect-Basis, `ready`/`snapshot`/`quote`/`candle`/`alert`/`stream_status` – Phase-3-Baseline erkennbar.
- **Testabdeckung:** Viele neue/erweiterte `*_test.go` (Handlers, Services, Connectors, Middleware, Audit, JWT, GeoMap-Stores). Gute Basis für Regression.

### 2.2 Kritik / Risiken

- **Wiring-Umfang:** `wiring.go` wächst stark (~600+ Zeilen). Irgendwann sinnvoll, große Blöcke (z. B. „alle Macro-Connectors“, „alle Geo-Services“) in Sub-Packages oder Builder-Funktionen auszulagern, um Lesbarkeit und Testbarkeit zu erhalten.
- **Flag-Gates:** RBAC, Rate-Limit, JWT-Enforcement standardmäßig `false`. Für Produktion müssen diese aktiviert und E2E-getestet werden; sonst bleibt die Security-Baseline „Scaffold“.
- **GCT/Exchange-Key:** AES-GCM-Helper und optionale ENV-Verschlüsselung für GCT-Credentials sind da; Anbindung an echtes Config-/Key-Management (z. B. DB, Vault) fehlt noch (explizit als Backlog im Plan).

### 2.3 Empfehlung

- Vor Merge: `go test -race ./...` im Go-Backend laufen lassen und ggf. flaky Tests fixen.
- `.env.example` prüfen: Keine echten Secrets; Platzhalter wie `replace-me` sind in Ordnung. Sicherstellen, dass neue ENV-Variablen (Auth, GeoMap-Cutover, Stream-Flags) dokumentiert sind.

---

## 3. Frontend / Next.js

### 3.1 Positiv

- **Proxy (`src/proxy.ts`):** Zentrale Stelle für Request-ID, Security-Header, CORS, API-CSP, Page-CSP (modes: off/report-only/enforce). Path-basierte RBAC-Regeln (viewer/analyst/trader/admin), methodensensitiv; 401/403 bei fehlender Session bzw. Rolle. Auth-Bypass nur mit expliziten Flags, Prod-Guard (fail-closed) erwähnt – Architektur stimmig.
- **API-Routen (Market):** `quote`, `ohlcv`, `news`, `search`, `providers`, `stream`, `stream/quotes` – durchgängig Go-first bzw. strict Go-only. Kein `getProviderManager()` mehr für Datenabfragen; nur noch `PROVIDER_REGISTRY`/Types in `providers/route.ts`. 502 bei Gateway-Fehler, 500 für unerwartete Fehler; konsistent.
- **Auth (`src/lib/auth.ts`):** Auth.js/next-auth v5 (beta), Prisma-Adapter, Credentials + Passkey-Provider + optionaler Passkey-Scaffold. Rollen-Normalisierung, Passwort-Hash (Scrypt) für Credentials – sinnvolle Baseline.
- **GeopoliticalMapShell:** Starker Refactor: von ~1800 auf ~520 Zeilen; Zustand-Store, Hooks, Shell-Komponenten (Header, Sidebars, Timeline, Viewport, Footer). Kein useState-Wust mehr; Wartbarkeit deutlich verbessert.
- **GeoMap Hard/Soft-Signals:** Hard-Signal-Adapter (Rates, Sanctions, ACLED-Threshold) mit Delta-State, Dedup, Observability-Stats; Soft-Signals Go-first. Ingestion-Contracts und DTOs geteilt – vorbereitet für Phase 9e Cutover.
- **Portfolio/Stream:** Snapshot-Service nutzt Go-Quote-Fetches; Stream-Routen nutzen interne Market-Routen (OHLCV/Quote) statt direkter Provider. Legacy-Polling flag-gated und in Prod fail-closed.

### 3.2 Kritik / Risiken

- **`lib/providers`:** Typen (`QuoteData`, `OHLCVData`, `TimeframeValue`) werden weiterhin aus `@/lib/providers/types` importiert; nur die Datenbeschaffung läuft über Go. Das ist gewollt (Contract-Kompatibilität). Langfristig könnte man Typen in ein neutrales Modul (z. B. `@/lib/market-types`) verschieben, um die verbleibende Abhängigkeit von `lib/providers` zu reduzieren.
- **Große Komponenten:** `MapCanvas.tsx` und `TimelineStrip.tsx` sind weiterhin sehr groß (z. B. 1000+ bzw. 700+ Zeilen). Phase-4-Scope ist erfüllt; für spätere Phasen wäre weitere Aufteilung (z. B. Canvas-Stages, Timeline-Subkomponenten) hilfreich.
- **CORS-Header:** In `proxy.ts` werden `X-Geo-Actor`, `X-Request-ID`, `X-User-Role` in Allow-Headers gesetzt; in Go sind es `X-Auth-User`, `X-Auth-JTI`. Sicherstellen, dass alle benötigten Header in beiden Schichten erlaubt sind, sobald Go-JWT aktiv ist.

### 3.3 Empfehlung

- Einmal durchgehen: Alle `/api/*`-Aufrufe aus dem Frontend (fetch/SWR/Query) prüfen, ob sie bei aktivierter Auth (ohne Bypass) die erwarteten 401/403 bekommen und ob Request-ID/Header korrekt ankommen.
- AGENTS.md/README erwähnen, dass für lokale Dev oft `AUTH_STACK_BYPASS` bzw. `NEXT_PUBLIC_AUTH_STACK_BYPASS` gesetzt wird und in Prod deaktiviert sein muss.

---

## 4. Python Backend + Rust Core

### 4.1 Positiv

- **Shared App Factory (`services/_shared/app_factory.py`):** Einheitliche Request-ID-Middleware (Echo + JSON-Log mit requestId, method, path, status, duration_ms). Alle Python-Services können dieselbe Basis nutzen – gut für Observability.
- **Pipeline (`ml_ai/indicator_engine/pipeline.py`):** Polars optional (Graceful Degradation), Rust-Bridge für `composite_sma50_slope_norm`, `calculate_heartbeat`, `calculate_indicators_batch`; Engine-Marker/Fallback erkennbar. Composite-Signal baut auf Rust bevorzugt auf.
- **Finance-Bridge:** Polars-Preprocessing, redb-OHLCV-Cache (PyO3), read-through mit `cache.hit`/`lookupMs`/`storeMs` – Phase-2-Scope umgesetzt.
- **Indicator-Service:** `/health` mit `rustCore`-Status, Composite-Pfad über Go erreichbar; Frontend zeigt Backend-Badges (SMA50, Heartbeat, etc.).

### 4.2 Kritik / Risiken

- **Polars-Import:** `try/except` mit `pl = None` ist pragmatisch; klar dokumentieren, dass bei fehlendem Polars (z. B. falsche Runtime) Fallback auf Pandas/andere Pfade läuft und ggf. Metadaten (`dataframeEngine`) fehlen.
- **Rust/redb:** DB-Handle-Reuse und P50-Benchmark (<1 ms) sind erwähnt; Abhängigkeit von Host (z. B. CPU-Kompatibilität, `polars[rtcompat]`) ist bewusst. Bei neuen Plattformen (CI, andere Rechner) Build und Tests prüfen.

### 4.3 Empfehlung

- Python-Tests (inkl. Phase-2-Rust-Composite) in CI ausführen; `maturin develop` bzw. Build-Schritt dokumentieren (z. B. in AGENTS.md oder README).

---

## 5. Docs & Config

### 5.1 Positiv

- **EXECUTION_PLAN.md:** Phasen 0–4 als abgeschlossen (Baseline/Implementierung) markiert; Verify-Gates teils [x], teils „Deferred Live Verify“. Sehr detaillierter „Teilfortschritt“-Block; Phase 9e mit Cutover-Runbook und Upgrades 1–6, Phase 12/14 mit Status-Blöcken. Gut nachvollziehbar, was gemacht wurde und was bewusst zurückgestellt ist.
- **SYSTEM_STATE.md:** IST-Zustand pro Schicht aktualisiert (Data Flow, Frontend, Python, Rust, Streaming, Auth, Observability). „Teilfortschritt (22./23. Feb 2026, Codex)“-Einträge geben klare Schnappschüsse.
- **API_CONTRACTS.md:** Erweitert um viele neue Endpoints (Quote-Fallback, Router, Macro-Exchanges, Stream-Parameter, GeoMap-Candidates/Contradictions/Ingest/Seed). Hinweise zu G4-Providern und Implementierungsstand – nützlich für Anschlussarbeit.
- **Prisma-Schema:** Auth-/Security-Modelle (User, Account, Session, Authenticator, RefreshToken, UserConsent, etc.) vorhanden; `passwordHash` für Credentials. Migrationen und `db:generate` vor Dev/Build sind in AGENTS.md erwähnt.
- **.env.example (Go):** Keine echten Secrets; Platzhalter und optionale ENV-Variablen für Auth, GeoMap-Modi, Stream-Fallback dokumentiert.

### 5.2 Kritik / Risiken

- **Umfang der Docs:** EXECUTION_PLAN und SYSTEM_STATE sind sehr lang. Für neue Teammitglieder könnte eine kurze „Was ist fertig, was ist der nächste Schritt?“-Sektion oben in EXECUTION_PLAN oder in AGENTS.md helfen.
- **Verify-Gates:** Viele „Deferred Live Verify“-Checkboxen (E2E/Browser). Ohne diese läuft die Baseline „Code-complete“, aber ohne formale Abnahme. Planen, wann und wie (z. B. manuell, Playwright) diese nachgezogen werden.

### 5.3 Empfehlung

- Vor Merge: EXECUTION_PLAN.md und SYSTEM_STATE.md einmal gegen den aktuellen Branch prüfen (z. B. keine veralteten „NICHT GESTARTET“-Einträge für 0–4).
- Cutover-Runbook (Phase 9e) und GeoMap-Thin-Proxy-Modi in einer kurzen Operations-/Runbook-Datei referenzieren (z. B. `docs/GEOMAP_CUTOVER.md`), damit sie auffindbar bleiben.

---

## 6. Risiken & offene Punkte (priorisiert)

1. **Auth in Produktion:** RBAC/JWT/Rate-Limit in Go standardmäßig aus; Next-Proxy macht 401/403. Für echte Prod-Nutzung: Flags aktivieren, E2E-Tests für Passkey/Credentials und Rollen durchführen, Prod-Guard (Bypass blockieren) verifizieren.
2. **Phase 9e Cutover:** GeoMap Candidate/Review/Contradictions/Ingest/Seed laufen wahlweise Next-proxy oder Go-owned. Nach Cutover Conditional-Logik für `GET /api/geopolitical/candidates` und verbleibende Next-Domainlogik dokumentieren und ggf. aufräumen. **`GEOPOLITICAL_INGEST_SHADOW_COMPARE=1`** für Review/Validierung setzen (Next und Go parallel, Ergebnisvergleich); nach abgeschlossenem Cutover wieder entfernen oder auf leer setzen.
3. **Stream-Legacy-Fallback:** `MARKET_STREAM_*_LEGACY_FALLBACK_ENABLED` und `ALLOW_PROD_MARKET_STREAM_LEGACY_FALLBACK` – in Prod ohne Override fail-closed. Sicherstellen, dass alle relevanten Umgebungen (Staging/Prod) ohne Legacy-Fallback laufen, sobald Go-SSE überall stabil ist.
4. **GCT/Exchange-Key:** AES-GCM und optionale ENV-Credentials sind da; DB-Audit und persistentes Key-Management fehlen noch. Bis dahin: Hinweis in AUTH_SECURITY.md und OPERATIONS beibehalten.
5. **Große UI-Dateien:** MapCanvas, TimelineStrip, ggf. PortfolioPanel – bei künftigen Features an weitere Aufteilung denken, um 700-LoC-Empfehlung (AGENTS.md) nicht dauerhaft zu überschreiten.

---

## 7. Empfehlungen für das weitere Vorgehen

- **Commit-Strategie:** Änderungen in logische Commits aufteilen (z. B. „Phase 0 Go-First + BaseConnector“, „Phase 1 Auth-Baseline“, „Phase 2 Rust/Polars/redb“, „Phase 3 Streaming“, „Phase 4 GeoMap“, „Phase 9e Go-GeoMap-Frontdoor“, „Docs/EXECUTION_PLAN + SYSTEM_STATE“). So bleibt die Historie nachvollziehbar.
- **Untracked prüfen:** Alle neuen Go-/Frontend-Dateien (Handlers, Connectors, Stores, Hooks) in einem ersten Commit als „Add Phase-X implementation“ o. ä. hinzufügen; keine wichtigen Dateien vergessen.
- **CI:** `go test -race ./...`, `bun run lint` (bzw. `lint:fix` nur wo gewollt), `bun run build`, ggf. Python-Tests und `maturin build` in Pipeline aufnehmen.
- **Deferred Verify:** Backlog (E2E, Browser-Checks für Auth, Phase 2/3/4) in einem eigenen Ticket/Backlog-Eintrag pflegen und schrittweise abarbeiten.
- **Verbundene Variablen Frontend ↔ Go:** Bei Änderungen an Frontend-`.env.development`/`.env.production` immer prüfen, ob Go-Env angepasst werden muss: **AUTH_JWT_SECRET** (Go) = **AUTH_SECRET** bzw. **NEXTAUTH_SECRET** (Next); **CORS_ALLOWED_ORIGINS** (Go) = Frontend-Origin(s) (z. B. `http://localhost:3000` in Dev, `https://your-domain.com` in Prod). Vorlagen: Frontend `.env.development`/`.env.production`, Go `go-backend/.env.dev`/`.env.prod`.

---

**Fazit:** Die Änderungen sind in sich stimmig, gut dokumentiert und an den Execution Plan angelehnt. Mit den obigen Punkten (Auth-Prod, Cutover, Stream-Flags, Docs/Verify) ist die Basis solide für Merge und nächste Phasen (z. B. 5, 6, 9 Verify).

---

## 8. Konkret anschauen – Checkliste

**Vor dem ersten Commit / Merge:**

| # | Was | Wo / Wie |
|--:|-----|----------|
| 1 | **Go-Tests laufen** | `cd go-backend && go test -race ./...` – alle grün? Flaky Tests notieren. |
| 2 | **Frontend baut** | `bun run build` – keine Build-Fehler. |
| 3 | **Lint sauber** | `bun run lint` – ggf. `lint:fix` nur gezielt, nicht blind. |
| 4 | **Keine echten Secrets** | `.env` und `.env.example` durchsuchen: keine API-Keys/Passwörter committen; Platzhalter ok. |
| 5 | **Auth-Bypass in Prod** | In `src/lib/auth.ts` und Go `NewServerFromEnv`: Prüfen, dass bei `NODE_ENV=production` Bypass blockiert wird (ohne `ALLOW_PROD_AUTH_STACK_BYPASS`). |
| 6 | **CORS-Header abgleichen** | `src/proxy.ts` (Allow-Headers) vs. `go-backend/internal/app/middleware.go` (CORS): `X-Auth-User`, `X-Auth-JTI`, `X-User-Role`, `X-Request-ID` in beiden erlauben, sobald Go-JWT aktiv ist. |
| 7 | **Stream-Flags in Prod** | In Next-ENV: `MARKET_STREAM_*_LEGACY_FALLBACK_ENABLED` und `ALLOW_PROD_MARKET_STREAM_LEGACY_FALLBACK` – in Prod ungesetzt bzw. false, damit fail-closed. |
| 8 | **Phase-9e-Modi** | `GEOPOLITICAL_INGEST_HARD_MODE`, `GEOPOLITICAL_INGEST_SOFT_MODE`, `GEOPOLITICAL_ADMIN_SEED_MODE`: Entscheiden, ob Cutover auf `go-owned-gateway-v1` schon gewünscht ist; wenn ja, in Staging testen und dann setzen. **`GEOPOLITICAL_INGEST_SHADOW_COMPARE=1`** für Review/Validierung (Next+Go parallel); nach Cutover wieder entfernen. |
| 9 | **Untracked nicht vergessen** | `git status` – alle neuen Go-Handler, Connectors, Stores, Hooks (z. B. unter `go-backend/internal/`, `src/features/geopolitical/shell/`, `store/`) in einen Commit aufnehmen. |
| 10 | **Docs konsistent** | In `docs/specs/EXECUTION_PLAN.md`: Phasen 0–4 nicht mehr „NICHT GESTARTET“. In `docs/specs/SYSTEM_STATE.md`: IST-Einträge passen zum aktuellen Code. |

| 10b | **Env für Review / Auth-Test** | Next lädt `.env.development` (dev) bzw. `.env.production` (build/start) automatisch; optional Copy nach `.env`. **Prod-Auth testen:** Echte Secrets setzen (`openssl rand -base64 32`), gleicher Wert in Next und Go (AUTH_SECRET / AUTH_JWT_SECRET); siehe AGENTS.md. Ohne das schlägt JWT-Validierung in Prod-Setup fehl. |

**Optional, aber sinnvoll:**

| # | Was | Wo / Wie |
|--:|-----|----------|
| 11 | **Einmal mit Auth durchklicken** | Auth an (Bypass aus), dann: Login → geschützte Route (z. B. Ingest) → erwarteter 403 ohne Rolle; mit Analyst/Trader → 200. Request-ID in Response-Header prüfen. |
| 12 | **Chart + Quote über Go** | App starten, Chart öffnen, Network-Tab: OHLCV/Quote gehen nach `:9060` (Go), keine direkten Provider-URLs. |
| 13 | **GeoMap-Candidates** | GeoMap öffnen, Candidate-Queue/Ingest einmal auslösen; je nach Modus Next oder Go antwortet – in Response-Header `X-GeoMap-Next-Route: thin-proxy` bei Go-Cutover. |
| 14 | **AGENTS.md / README** | Kurz ergänzen: „Lokale Dev: oft `AUTH_STACK_BYPASS=true`; in Prod deaktivieren.“ Und: „Nach `bun install`: `bun run db:generate`; für Rust: `cd python-backend/rust_core && maturin develop`.“ |

**Priorität:** 1–5 und 9–10 vor Merge; 6–8 wenn ihr Auth/Stream/GeoMap-Cutover aktiv nutzt; 11–14 für ruhiges Gewissen.

---

## 9. Durchgeführte Checks (23. Feb 2026)

| Check | Ergebnis |
|-------|----------|
| **Go vet** | `go vet ./...` → exit 0 (erfolgreich). |
| **Go build** | `go build ./cmd/gateway` → exit 0 (erfolgreich). |
| **Go test -race** | Teilmenge gestartet; volle Suite ggf. lokal ausführen: `cd go-backend && go test -race ./...`. |
| **bun run lint** | 3 Warnings (useImportType) → behoben (import type in accept/reject/snooze routes). |
| **bun run build** | Im Hintergrund gestartet; bei Bedarf erneut ausführen. |
| **.env** | Root- und go-backend/.env um alle Keys aus .env.example ergänzt (Auth, Streaming, Rust, Phase 9e). |
| **CORS** | proxy.ts: `X-Auth-User`, `X-Auth-JTI` zu Allow-Headers hinzugefügt (Abgleich mit Go-Middleware). |
| **Auth-Bypass** | Logik in `src/lib/auth/runtime-flags.ts`: `AUTH_STACK_BYPASS=true` oder `NEXT_PUBLIC_AUTH_STACK_BYPASS=true` aktiviert Bypass; in Production wirft `assertAuthBypassAllowedInRuntime()` außer bei `ALLOW_PROD_AUTH_STACK_BYPASS=true`. **Test:** Beide Bypass-Vars in .env auf `true` setzen, Dev-Server starten, geschützte Route (z. B. `/api/geopolitical/candidates/ingest/hard`) ohne Login aufrufen → erwartet 200/202 (nicht 401). |
| **Phase 9e** | Env-Vars in root- und go-backend/.env gesetzt (`GEOPOLITICAL_INGEST_*_MODE=next-proxy`, optional `GEOPOLITICAL_INGEST_SHADOW_COMPARE=1`). **Test:** Gateway + Next starten, dann `.\scripts\geomap-phase9e-shadow-run.ps1` ausführen (Seed + Hard/Soft-Runs + Diagnostics); oder manuell `GET http://127.0.0.1:9060/api/v1/geopolitical/migration/status` prüfen. |
| **AGENTS.md** | Hinweis zu Auth-Bypass (nur für Lokal; in Prod aus) und zu `maturin develop` für Rust Core ergänzt. |
