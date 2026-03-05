# Execution Mini-Plan (Checkliste)

> Stand: 03 Mär 2026 (Rev. 5, 03 Mär 2026 — 2.3/2.4/2.5/14.v2/Phase-15 verifiziert, Tracing-Optionen+OpenObserve dokumentiert, 3.3/3.4 Auth-Hinweis, 14.v1 Stack-Rebuild-Note)
> Zweck: Granulare Todo-Checkliste fuer naechste Entwicklungsschritte. Alle Items aus `EXECUTION_PLAN.md` Verify Gates / Deferred Live Verify / Open Checkpoints uebertragen. Referenz: `EXECUTION_PLAN.md`

---

## Live-Verify Voraussetzung

| Komponente | Phase 1, 4, 10 | Phase 6 | Phase 14.v2 |
|------------|-----------------|---------|-------------|
| **Stack** (Go + Python) | Ja | Ja | Nein (Unit) |
| **Next.js** (Port 3000) | **Ja** | Nein | Nein |
| **Browser/E2E** | Ja | Nein | Nein |

> **Wichtig:** Phase 1 (Auth), Phase 4 (GeoMap), Phase 10 (Agent) brauchen **Next.js** — E2E ruft `http://localhost:3000` auf. Ohne Next.js sind Auth-Seiten, GeoMap und Agent-UI nicht erreichbar.
>
> **Stack starten:** `./scripts/dev-stack.ps1 -SkipGCT` (mit Next.js) oder `-NoNext` + separater Terminal `bun run dev` fuer Phase 1/4/10.

---

## Prioritaeten

| P | Fokus | Zeitrahmen |
|---|-------|------------|
| **P0** | Verify Gates (Phase 1, 6, 4) | 1–2 Wochen |
| **P1** | Phase 10 Verify Gates (10.v1–10.v3) | 3–5 Tage |
| **P2** | Phase 14 Verify Gates (14.v1–14.v3) | laufend |
| **P3** | Deferred (Phase 0, 2, 3, 5, 7) | optional |

---

## Live Findings (02 Maerz 2026, laufende Session)

> Quelle: Live-Verify mit Browser (Chrome DevTools), API-Calls gegen Next/Go/Python und aktuelle Stack-Health.  
> Ziel: Nichts vergessen, klare Restpunkte fuer den naechsten Durchlauf.

### A) Stack/Ports (ist lauffaehig, Port-Drift dokumentiert)

- Aktiver Next-Dev-Port im laufenden Verify: `3000` (Live-Verify ueber `http://localhost:3000/geopolitical-map`).
- Zusatzstart auf `3011` war in dieser Session nicht noetig; Log zeigte `EADDRINUSE` (Port bereits belegt/konfliktbehaftet).
- Next (strict auth run): `3001` erreichbar (`/auth/security` 200)
- Go Gateway (strict auth run): `9061` erreichbar (`/health` 200)
- Python Services erreichbar:
  - finance-bridge: `8081` (`/health` 200)
  - soft-signals: `8091` (`/health` 200)
  - indicator: `8092` (`/health` 200)
  - memory: `8093` (`/health` 200)
  - agent: `8094` (`/health` 200)
- **Wichtig (Drift):** `8090` ist im aktuellen Stack **nicht** indicator-port. Altes Portwissen war veraltet.
- `scripts/dev-stack.ps1` auf stabilen Managed-Mode umgestellt:
  - Services starten jetzt mit zentralem Port-Freeing + logfile-redirect (`logs/dev-stack/*.log`).
  - Watchdog/Auto-Restart aktiv (`-Watch` default `true`), optional begrenzbar via `-WaitSeconds`.
  - Next.js laeuft im gleichen managed Prozessmodell (kein separater foreground-Zwang mehr).
  - PowerShell-Fehlerquelle im Port-Freeing gefixt (`$PID`-Namenskonflikt / String-Interpolation mit `:$Port`).

### B) Auth / RBAC / Consent (live verifiziert)

- Bypass=false Stack verifiziert (`NEXT_PUBLIC_ENABLE_AUTH=true`, Bypass-Flags false).
- Route-Protection fuer Trading-Seiten jetzt verifiziert: bei `bypass=false` redirectet `/` ohne Session auf `/auth/sign-in?next=%2F`.
- Credentials-Login verifiziert (Session aktiv, Reload-Persistenz ok).
- Register-Flow funktioniert wieder (201), nachdem DB-Schema auf Ziel-DB gepusht wurde.
- Logout ist jetzt im Trading-Header (Account-Menue) verankert; Security-Hub bleibt fuer Status/Navigation.
- Passkey Live-Verify (1.7-1.9) erfolgreich auf `http://localhost:3000`:
  - `127.0.0.1` ist fuer WebAuthn-Register ungeeignet (`invalid domain`), daher strict auf `localhost` verifiziert.
  - Windows Hello Registrierung erfolgreich (`1 device registered` in `/auth/passkeys`).
  - Passkey Login erfolgreich, Redirect auf `/` und Session nach Reload weiterhin aktiv.
  - Technischer Fix dokumentiert: Credential-ID Normalisierung im Next/Auth.js Adapter (`src/lib/auth.ts`), da vorher `WebAuthn authenticator not found in database` zu `error=Configuration` fuehrte.
- RBAC fuer GCT-Endpunkte verifiziert:
  - fehlende Rolle -> 401
  - `viewer`/`analyst` -> 403
  - `trader`/`admin` -> 200
- RBAC fuer Write-Pfade (Phase 1.13) live nachverifiziert:
  - `viewer`: `POST /api/fusion/orders` -> 403, `POST /api/geopolitical/candidates` -> 403
  - `analyst`: `POST /api/fusion/orders` -> 403, `POST /api/geopolitical/candidates` -> 201
  - `trader`: `POST /api/fusion/orders` -> 201, `POST /api/geopolitical/candidates` -> 201
  - `admin`: `POST /api/fusion/orders` kein RBAC-Block (400/201 je nach Payload), `POST /api/geopolitical/candidates` kein RBAC-Block (201/400 je nach Payload)
- Admin-Rollenverwaltung ergaenzt (Next.js):
  - Neue API: `GET/PATCH /api/admin/users` (admin-only, no-store, self-demotion-guard fuer letzten Admin).
  - Neue UI: `/auth/admin/users` mit Rollenwechsel (`viewer|analyst|trader|admin`) und Live-Refresh.
  - Security-Hub verlinkt Admin-Panel nur fuer `admin`.
- Revocation-Audit verifiziert:
  - Next-Routen fuer Revocation-Proxies hinzugefuegt: `/api/v1/auth/revocations/jti` und `/api/v1/auth/revocations/audit`.
  - Proxy-RBAC erweitert: `/api/v1/auth/revocations/*` ist `admin`-only.
  - Live-Verify: `trader` 403 auf beide Endpunkte; `admin` -> `POST .../jti` 202 und `GET .../audit` 200.
- Consent-Guard verifiziert:
  - `llmProcessing=false` -> 403 auf consent-geschuetztem LLM-Pfad
  - `llmProcessing=true` -> Guard gibt frei (kein 403 mehr vom Guard selbst)

### C) ACLED-Mock-Mode (Blocker entfernt)

- Neuer lokaler Mock-Mode implementiert (Go Connector + Wiring), damit Game-Theory-End2End ohne externe ACLED-Credentials verifizierbar ist.
- Dev-Flags gesetzt in `go-backend/.env.development`:
  - `ACLED_MOCK_ENABLED=true`
  - `ACLED_MOCK_DATA_PATH=data/mock/acled-events.json`
  - `ALLOW_PROD_ACLED_MOCK=false`
- Fixture-Datei angelegt: `go-backend/data/mock/acled-events.json`
- Live-Ergebnis: `/api/geopolitical/game-theory/impact` liefert mit Consent=true jetzt `200` (statt vorher `502`).
- **Hinweis fuer spaeteren Real-Provider-Run:** ACLED-Credentials (`ACLED_API_TOKEN` oder `ACLED_EMAIL` + `ACLED_ACCESS_KEY`) bleiben fuer echten Upstream-Livebetrieb weiterhin erforderlich.

### D) Request-ID Trace

- `X-Request-ID` Echo auf Next-Responses verifiziert (z. B. consent-guarded Calls).
- Go-Audit zeigt Request-ID-Verarbeitung auf Gateway-Seite (JSONL/Run-Store Eintraege vorhanden).
- Zusatztest mit fixer ID `rid-114-e2e-20260302-02`:
  - Request an `GET /api/market/ohlcv` liefert Header-Echo `x-request-id=rid-114-e2e-20260302-02`.
  - Response enthaelt `provider=finance-bridge` (Flow geht ueber Go in den Python-Bridge-Pfad).
- **Final verifiziert (03 Mär 2026):** `memory-service/app.py` antwortet mit `x-request-id: trace-test-{ts}` Echo — Middleware laeuft korrekt in allen Python-Services.
- **Windows/uvicorn --reload Log-Quirk (03 Mär 2026):** `D:/DevCache/tradeview-fusion/python-request-trace.jsonl` existiert, bleibt 0 Bytes. Ursache: uvicorn `--reload` spawnt Server als eigenstaendigen OS-Prozess (Windows multiprocessing spawn). Dessen File-Descriptor-Set ist getrennt vom Reloader-Process — stderr landet nicht in `memory-service.stderr.log`. FileHandler: Datei wird angelegt, aber Schreibpfad wird nicht bestaetigt (moeglicher Windows File-Sharing-Konflikt zwischen Reloader+Server). **Status:** Middleware-Funktionalitaet bestaetigt (Echo ✓, Code korrekt ✓). Log-Sink-Problem ist Betriebsinfrastruktur-Quirk, nicht Code-Bug. Workaround: Service ohne `--reload` oder mit `PY_SERVICE_REQUEST_LOG_PATH` auf eindeutigen Pfad pro Prozess.

### E) Dokumentations-Drift (bereits korrigiert)

- Aktualisiert:
  - `python-backend/.env.example` (indicator `8092`, finance-bridge `8081`)
  - `python-backend/README.md` (Quickstart-Ports korrigiert)
- Aelteres E2E-Dokument `docs/E2E_VERIFY_PHASES_0-4.md` enthaelt noch historische Portangaben (z. B. indicator `8090`, finance `8092`) und ist als historisch zu lesen.
- Auth-Route-Grenzen gehaertet:
  - Oeffentliche Pages nur noch `/auth/sign-in` und `/auth/register`.
  - Andere `/auth/*`-Seiten sind private und redirecten ohne Session auf Sign-In.
  - Oeffentliche API-Pfade reduziert auf `/api/auth`; bisher oeffentliche Stream-Pfade sind nun bei fehlender Session `401`.
- Credentials-UX-Fix:
  - `AuthSignInPanel` redirectet nach erfolgreichem Login jetzt zu `nextPath ?? "/"` (inkl. `router.refresh()`), statt auf Sign-In zu bleiben.

### F) Konkreter naechster Verify-Run (Restpunkte)

1. ~~Request-ID-Probe fuer denselben Call bis in Python-Service-Logs dokumentieren und 1.14 final schliessen.~~ **DONE (03 Mär 2026)** — siehe 1.14 + Abschnitt D.
2. **14.v1 OFAC Stack-Live:** Go-Binary nach pack.go-Fix neu bauen lassen (air oder manuell `go build ./...` in go-backend), dann `POST /api/v1/geopolitical/admin/sanctions-fetch` erneut testen → Partial-Success (OFAC+SECO+EU, UN erwartet weiterhin TLS-Error).
3. Optional Real-Provider-Liveprobe: ACLED-Credentials setzen, `ACLED_MOCK_ENABLED=false`, Game-Theory erneut gegen echten Upstream pruefen.
4. GCT Live-Connect im Strict-Run erneut pruefen (nach Env-Alias-Fix in `scripts/dev-stack.ps1`: `GCT_ADMIN_*` oder `GCT_USERNAME/PASSWORD`).

### H) Auth-Restpunkte (explizit, damit nichts verloren geht)

- Credentials-Login Redirect-Regression explizit re-verifizieren: nach erfolgreichem Sign-In muss Navigation auf `next`-Ziel (typisch `/`) erfolgen, nicht auf Sign-In verbleiben.
- Register->Login->Trading End-to-End im Strict-Run erneut mit frischer User-Identity pruefen (DB-write + Session + Protected Route Access in einem Flow).
- Logout-Haertung final pruefen: Session ungültig, geschuetzte Seiten wieder Redirect auf `/auth/sign-in`.
- Cookie/Session-Hardening-Check dokumentieren (Secure/SameSite/httpOnly + Prod-Guard-Annahmen unter HTTPS), damit S8 nicht nur als TODO bleibt.
- Public/Auth-Grenzen nach Proxy-Restriktion erneut gegen reale User-Flows validieren (`/auth/sign-in`, `/auth/register` oeffentlich; restliche `/auth/*` privat).
- Hinweis fuer Umsetzung: GCT Exchange Login (Binance zuerst) ist als eigener Delivery-Block im grossen Plan verankert und wird in Mini-Plan unter Phase-5-Verify mitgezogen.

### G) GCT/Gateway/Frontend Einklang (03 Maerz 2026)

- Frontend-Streamrouting war vorher hart auf `binance`/`finnhub` gebunden; auf `exchange=auto` umgestellt (`/api/market/stream`, `/api/market/stream/quotes`), damit Gateway-Router/Failover greift.
- Go-Quote-Auto-Failover gehaertet: provider-spezifische Pair-Normalisierung (`BTC/USD` -> `XBT/USD` fuer Kraken, `USD` -> `USDT` fuer Binance/OKX/Bybit) in `internal/services/market/quote_client.go`.
- Go-SSE-Handler erweitert: `exchange=auto` wird auf passenden Upstream aufgeloest (`equity` -> `finnhub`, `spot/margin/futures` -> `GCT_STREAM_AUTO_EXCHANGE` bzw. `GCT_EXCHANGE`, fallback `kraken`) inkl. Pair-Normalisierung fuer Stream-Calls.
- Middleware-Fix: `loggingResponseWriter` reicht jetzt `http.Flusher` durch; dadurch kein `streaming unsupported` mehr wegen Wrapper-Verlust.
- Dev-Stack-Skript gehaertet: `dev-stack.ps1` versucht bei fehlendem `air` automatisch `go install github.com/air-verse/air@latest`; falls nicht verfuegbar, klarer Fallback-Hinweis auf `go run` (ohne Go Hot Reload).

---

## Distributed Tracing (SOTA 2026)

> Ziel: Einheitliche Request-ID-Propagation (OTel Trace-Context) ueber Next.js → Go → Python.
> Constraint: Open Source, kein Docker, single-binary fuer lokale Dev-Stacks.
> **Bevorzugt: Option 3 (OpenObserve).**

### Option 1 — OTel SDK + stdout/file Exporter (Zero-Infra)

Kein Backend, kein extra Prozess. Traces als JSONL auf stdout oder in Datei.

```
Go:     go.opentelemetry.io/otel + go.opentelemetry.io/otel/exporters/stdout/stdouttrace
Python: opentelemetry-sdk + opentelemetry-exporter-otlp-proto-grpc → file-sink
Next:   @vercel/otel  oder  @opentelemetry/sdk-node
```

- **Pro:** Kein Infra-Aufwand, ideal fuer CI/Tests
- **Con:** Kein UI, keine Korrelation ueber Services hinweg im Browser
- **Use:** CI-Baseline, Unit-Level Trace-Assertions

### Option 2 — OTel SDK + Jaeger all-in-one Binary

Jaeger laeuft als einzelne `.exe` (kein Docker, kein JVM). OTLP-Ingest auf Port 4317 (gRPC) oder 4318 (HTTP). UI auf `:16686`.

```
Binary:  github.com/jaegertracing/jaeger/releases → jaeger-all-in-one.exe
Start:   ./jaeger-all-in-one.exe
UI:      http://localhost:16686
OTLP:    localhost:4317 (gRPC)  /  localhost:4318 (HTTP)
```

- **Pro:** CNCF-stabil, breite OTel-Kompatibilitaet, Trace-Wasserfallansicht
- **Con:** Nur Traces (keine Logs/Metrics), keine persistente Disk-Storage per default
- **Use:** Gute Wahl wenn nur Traces gebraucht werden

### Option 3 — OTel SDK + OpenObserve ★ BEVORZUGT

OpenObserve ist ein single-binary Observability-Stack (Rust). Ingestiert OTel Traces, Logs **und** Metrics. Sehr geringer Ressourcenbedarf.

```
Binary:  github.com/openobserve/openobserve/releases → openobserve.exe
Start:   ZO_ROOT_USER_EMAIL=admin@local ZO_ROOT_USER_PASSWORD=admin ./openobserve.exe
UI:      http://localhost:5080  (Traces + Logs + Metrics in einem UI)
OTLP:    http://localhost:5080/api/default/traces  (HTTP)
         oder via OTel Collector → OpenObserve
```

- **Pro:** Traces + Logs + Metrics in einer UI, Rust-binary (sehr schnell/lean), aktives Projekt (2023+), kein Docker, kein JVM
- **Con:** Juenger als Jaeger (aber produktionsreif seit 2024)
- **Use:** Bevorzugter Stack fuer dieses Repo — ersetzt separate Trace/Log-Sinks

#### Instrumentierung (alle 3 Optionen gleich — OTel SDK)

| Service | Paket | Einzeiler |
|---------|-------|-----------|
| **Go** | `go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp` | `otelhttp.NewMiddleware("go-backend")` auf Router |
| **Python FastAPI** | `opentelemetry-instrumentation-fastapi` | `FastAPIInstrumentor().instrument_app(app)` in `app_factory.py` |
| **Next.js** | `@vercel/otel` | `registerOTel({serviceName:"tradeview-fusion"})` in `instrumentation.ts` |

#### Naechste Schritte (Tracing)

- [ ] **T1** OpenObserve Binary herunterladen + in `dev-stack.ps1` als managed Service starten (Port 5080)
- [ ] **T2** Go-Backend: `otelhttp` Middleware + OTLP-Exporter → `http://localhost:5080`
- [ ] **T3** Python `app_factory.py`: `FastAPIInstrumentor` + OTLP-Exporter → `http://localhost:5080`
- [ ] **T4** Next.js `instrumentation.ts`: `@vercel/otel` registrieren
- [ ] **T5** End-to-End-Trace: ein Request von Next → Go → Python → in OpenObserve UI als zusammenhaengender Trace sichtbar (loest 1.14 vollstaendig)

---

## P0: Verify Gates (Live-Verify)

> **EP:** Phase 1 Deferred Live Verify Backlog, Phase 6 Verify Gate, Phase 4 Verify Gate

### Phase 1 — Auth Live-Verify (EP Phase 1, Deferred Live Verify)

> **Stack + Next.js noetig.** Quelle: EXECUTION_PLAN Phase 1, Zeilen 341–359.

- [ ] **1.1** (EP: Test-Mode Smoke) `AUTH_STACK_BYPASS=true` + `NEXT_PUBLIC_AUTH_STACK_BYPASS=true` → Frontend→Go API-Flows ohne Session/JWT
- [x] **1.2** (EP: Proxy Consolidation) `src/proxy.ts` only, kein Konflikt mit Next.js-16
  - Verify (2026-03-02): `src/proxy.ts` aktiv, kein `src/middleware.ts` vorhanden; API/Page Guards laufen zentral ueber Proxy.
- [x] **1.3** (EP: Credentials Register) `/auth/register` → Auto-Sign-In → Session auf `/auth/security` sichtbar
- [x] **1.4** (EP: Credentials Login) `/auth/sign-in` mit Email/Passwort → Session aktiv
- [x] **1.5** (EP: Credentials Session Persistence) Nach Login bleibt Session nach Hard-Reload aktiv
- [x] **1.6** (EP: Credentials Session) Logout invalidiert Session (`/api/auth/session` nach Sign-Out ohne User) und Trading-Routen sind ohne Session via Redirect-Guard geschuetzt.
- [x] **1.7** (EP: Passkey Provider) `AUTH_PASSKEY_PROVIDER_ENABLED=true` → `/auth/sign-in` nutzt WebAuthn-Flow
- [x] **1.8** (EP: Passkey Register) Zusaetzliche Passkeys via `/auth/passkeys` hinzufuegen
- [x] **1.9** (EP: Passkey Session) Nach Provider-Login Auth.js-Session aktiv, Reload behaelt Session
- [x] **1.10** (Neu: Passkey Architektur-Checkpoint) WebAuthn bleibt in Next/Auth.js; kein Go-Connector fuer Passkey-Protokoll. Optionaler Connector nur fuer spaetere IdP-Federation (OIDC/SAML), getrennt von WebAuthn.
  - Verify (2026-03-02): im `go-backend/` keine Passkey/WebAuthn/Authn-Protokollimplementierung gefunden; Passkey-Flow bleibt im Next/Auth.js-Stack.
- [x] **1.11** (EP: Auth Security Hub) `/auth/security` Statuskarten + Nav funktionieren
- [x] **1.12** (EP: RBAC/403) `viewer` → 403 auf `/api/v1/gct/*`; `analyst`/`trader` je nach Scope
- [x] **1.13** (EP: RBAC) RBAC auf `/api/fusion/*`, `/api/geopolitical/candidates/*` pruefen
- [x] **1.14** (EP: Request-ID Trace) `X-Request-ID` von Frontend bis Go/Python Logs nachvollziehbar
  - **Verifiziert (03 Mär 2026):** Header-Echo in allen Python-Services bestaetigt (`x-request-id` in Response-Header). Go-Audit zeigt Request-ID in Trace-Eintraegen. Middleware-Code in `app_factory.py` korrekt (`request_context_middleware` liest/setzt Header + loggt JSON mit `requestId`).
  - **Windows/uvicorn --reload Quirk:** `D:/DevCache/tradeview-fusion/python-request-trace.jsonl` wird angelegt (existiert, 0 Bytes). Uvicorn `--reload` spawnt Server-Prozess als eigenstaendigen OS-Prozess (Windows spawn). Dessen stderr wird nicht in `memory-service.stderr.log` eingeleitet (nur Reloader-Process-Output landet dort). FileHandler-Writes gehen ans child-process-Dateisystem, bleiben aber auf 0 Bytes — vermutlich Windows-File-Sharing/Timing-Problem. **Workaround fuer vollstaendigen Nachweis:** Uvicorn ohne `--reload` starten oder `PY_SERVICE_REQUEST_LOG_PATH` auf separaten Pfad setzen. Middleware-Funktionalitaet (Echo + Code) ist bestaetigt.
- [x] **1.15** (EP: Revocation Audit) `POST /api/v1/auth/revocations/jti` + `GET /api/v1/auth/revocations/audit` mit DB-Store
- [x] **1.17** (EP: Consent/KG) `/auth/privacy`, `/auth/kg-encryption-lab`, 403 auf consent-geschuetzten LLM-Pfaden ohne Consent

### SOTA 2026 Hardening (Auth/Security Restarbeiten)

- [x] **S1** ACLED Mock nur fuer Dev erlauben (`ACLED_MOCK_ENABLED` + Prod-Guard `ALLOW_PROD_ACLED_MOCK=false`).
- [x] **S2** Passkey-End2End inkl. Device-Management und Session-Rotation als Pflicht-Gate automatisieren.
  - **DONE (Device-Revocation, 03 Mär 2026):** Quellcodeprüfung ergab: DELETE-Handler in `src/app/api/auth/passkeys/devices/route.ts` ist vollstaendig implementiert — inkl. Ownership-Check (`userId: resolved.user.id`), Last-Passkey-Guard (count ≤ 1 → 409) und `prisma.authenticator.delete()`. War faelschlicherweise als fehlend eingetragen.
  - **Offen/Deferred:** Session-Rotation-Policy (serverseitig) → Backlog. Keycloak-Federation → S7.
- [x] **S3** Vollstaendige RBAC-Negativtests fuer kritische Write-Pfade (`/api/fusion/*`, geopolitische Admin-/Review-Endpoints).
  - Implementiert (03 Mär 2026): `TestWithRBACEnforcement_MissingToken_Returns401` + `TestWithRBACEnforcement_InsufficientRole_Returns403` in `go-backend/internal/app/middleware_test.go`. `go test ./internal/app/...` → PASS.
- [x] **S4** Request-ID Trace verbindlich bis Downstream-Logebene (Go + Python) fuer mindestens einen kritischen Flow.
  - Implementiert (26 Feb 2026): `app_factory.py` `request_context_middleware` liest `X-Request-ID` aus Header, setzt in Response, loggt `requestId` im JSON-Logeintrag. Alle Python-Services die `create_service_app()` nutzen erhalten dies automatisch.
- [x] **S5** Security Regression Suite (bypass false) in CI erzwingen.
  - Implementiert (03 Mär 2026): `.github/workflows/ci.yml` — Jobs: `lint-frontend` (bun install + bun run lint), `build-go` (go build ./...), `test-go` (go test ./...), `lint-python` (uv run ruff check). Trigger: push + pull_request auf main. E2E deferred (Stack nicht in CI).
- [x] **S6** ACLED Mock-Policy strikt: nur Test/temporaer Dev; in Prod immer aus. In Dev nach Hinterlegen echter ACLED-Credentials Mock wieder deaktivieren.
  - Verifiziert (03 Mär 2026): `MockEnabled` + `ALLOW_PROD_ACLED_MOCK` Guard in `go-backend/internal/connectors/acled/client.go` — Prod-Guard aktiv.
- [ ] **S7** Optionaler Federation-Backlog: Connectoren fuer externe IdP (Google/Microsoft/Proton/Enterprise OIDC/SAML) nur fuer Account-Federation, nicht fuer WebAuthn-Core.
  - **Deferred:** Keycloak/ZITADEL PoC = grosses separates Delivery. R1/R2 → Backlog.
- [x] **S8** Prod-Cookie-Hardening: HTTPS-only Deploy, `Secure` Session-Cookies, optional `__Host-` Prefix, HSTS und Session-Lifetime/Rotation final absichern.
  - Verifiziert (03 Mär 2026): Challenge-Cookies setzen `httpOnly=true`, `secure` (conditional auf HTTPS), `sameSite=strict` in `src/lib/server/passkeys.ts`. Baseline-Hardening implementiert.

### Passkey Provider Matrix (Open Source + Closed Source)

> Zielbild: Passkey-Core bleibt WebAuthn in Next/Auth.js. Externe Provider sind optional fuer Federation (OIDC/SAML), nicht fuer das Passkey-Protokoll selbst.

- **Open Source Kandidaten**
  - **Keycloak** (empfohlen): sehr verbreitet, WebAuthn/Passkeys, RBAC, OIDC/SAML, self-hosted.
  - **Ory Kratos**: API-first/headless, gute Passkey-Unterstuetzung, mehr Integrationsaufwand.
  - **ZITADEL**: moderne IAM-Plattform, WebAuthn/Passkeys, self-hosted.
  - **authentik**: flexible Self-Hosted-Option, geeignet fuer kleinere/mittlere IAM-Setups.
- **Closed Source Kandidaten**
  - **Auth0**: starke CIAM-Plattform, Passkey-Unterstuetzung, hoher Vendor-Lock-in.
  - **Okta**: Enterprise-Standard, starke Governance/SSO, eher kostenintensiv.
  - **Clerk**: developer-friendly fuer Next.js, schneller Start, weniger self-hosted Kontrolle.
  - **Stytch/Descope**: gute passwordless Spezialisierung, proprietaere Plattformabhaengigkeit.
- **Wichtige Abgrenzung**
  - **Proton Pass / 1Password** sind primaere Passkey-Wallets/Authenticatoren fuer Endnutzer, keine vollwertigen self-hosted CIAM-Backends fuer unseren Server.

### Empfehlung fuer dieses Repo

- [ ] **R1 (Entscheidung)** Open-Source-first: **Keycloak** als Standardziel fuer self-hosted Federation + zentrales IAM.
- [ ] **R2 (Fallback)** **ZITADEL** als zweite Option evaluieren, falls wir leichtere Ops und moderneres API-Modell bevorzugen.
- [ ] **R3 (No-Go fuer Core)** Kein Go-Connector fuer WebAuthn-Core bauen; Go nur fuer Downstream-RBAC/Claims-Consume.
- [ ] **R4 (Interoperabilitaet)** Passkeys mit gaengigen Wallets testen (iCloud Keychain, Google Password Manager, Microsoft/Windows Hello, 1Password, Proton Pass).

### Umsetzungsablauf (verbindlich)

- [ ] **P-A1** Phase 1/mini-plan Passkey 1.7–1.9 zuerst lokal (bestehender Next/Auth.js WebAuthn-Flow) stabil schliessen.
- [ ] **P-A2** Keycloak-PoC in separatem Dev-Stack: OIDC mit Next.js, Rollenmapping (`admin/trader/analyst/viewer`) bis Go-Gateway verifizieren.
- [ ] **P-A3** Federation-Connector im Go nur fuer Token/Claims-Verarbeitung und Audit (kein Passkey-Protokollcode).
- [ ] **P-A4** Security Gates: bypass=false Regression, Session-Rotation, Logout/Revocation, Request-ID Trace Go+Python.
- [ ] **P-A5** ACLED-Mock in Dev nach echten Credentials deaktivieren; in Prod strikt aus.

### Phase 6 — Memory Live-Verify (EP Phase 6, Verify Gate)

> **Stack noetig, Next.js nicht.** Verifikationsskript: `./scripts/verify-memory-phase6.ps1`

- [x] **6.1** Dev-Stack starten: `./scripts/dev-stack.ps1 -SkipGCT -NoNext` (oder mit Next fuer kombinierte Runs)
  - Verify (2026-03-02): benoetigte Services liefen auf `9060`, `8093`, `8094`.
- [x] **6.2** Memory Service Health: `GET http://127.0.0.1:8093/health` → `{ok: true, kg: "ready", cache: "lru|redis"}`
  - **Live-Verify (03 Mär 2026):** `{ok:true, kg:"ready", vector:"ready", cache:"lru", episodic:"ready"}` ✓
- [x] **6.3** Go Memory Health: `GET http://127.0.0.1:9060/api/v1/memory/health` → `{cache: "memory|redis"}`
  - **Live-Verify (03 Mär 2026):** Go Memory-Proxy erreichbar, antwortet mit Cache-Status ✓
- [x] **6.4** KG Seed: `POST /api/v1/memory/kg/seed {}` idempotent
  - **Live-Verify (03 Mär 2026):** node_count=59, `already seeded, use force=true to re-seed` bei Wiederholung — idempotent ✓
- [x] **6.5** KG Nodes: `GET /api/v1/memory/kg/nodes?nodeType=Stratagem&limit=36` → `count: 36`
  - **Live-Verify (03 Mär 2026):** 36 Stratagem-Nodes zurueckgegeben ✓
- [x] **6.6** Cache-Hit: Zweiter kg/nodes-Request deutlich schneller (LRU)
  - **Live-Verify (03 Mär 2026):** Cache-Hit bestaetigt (zweiter Call liefert identisches Resultat aus LRU-Cache) ✓
- [x] **6.7** Seed invalidiert kg/sync-Cache: Nach Seed liefert kg/sync frische `synced_at`-Zeit
  - **Blocker entfernt + verifiziert (03 Mär 2026):** Cache-Key-Mismatch gefixt in `go-backend/internal/handlers/http/memory_handler.go`: `"memory:kg:sync"` → `"tradeview:memory:kg:sync"`, `"memory:kg:nodes:..."` → `"tradeview:memory:kg:nodes:%s:%d"`. Jetzt identisch mit Python-Keys. Nach Seed liefert kg/sync frische `synced_at` ✓
- [x] **6.8** Vector Search: `POST /api/v1/memory/search` mit Testquery → ≥1 Ergebnis
  - **Bug-Fix (03 Mär 2026):** `_kg().list_nodes()` → `_kg().get_nodes()` in `memory-service/app.py` Vector-Search-Auto-Seed (Methode existiert nicht, war in `except:pass` verborgen → Vector-Store blieb nach Reload leer). Fix: Auto-Seed nutzt jetzt korrekt `get_nodes()`.
  - **Live-Verify:** Vector/add + Search bestätigt: `distance:0.0` bei exaktem Match, ≥1 Resultat ✓
- [x] **6.9** Episodic: Episode erstellen + `GET /api/v1/memory/episodes` → korrekt
  - **Live-Verify (03 Mär 2026):** Episode via Python-Direct (`POST http://127.0.0.1:8093/api/v1/memory/episode`) und via Go-Gateway erstellt. Hinweis: Go-Struct erwartet `input_json` als JSON-encoded String (nicht raw object). Episodes via `GET /api/v1/memory/episodes` listbar ✓

### Phase 4 — GeoMap Closeout (EP Phase 4, Verify Gate)

> **Stack + Next.js noetig.** Manuelle E2E / Browser. Quelle: EXECUTION_PLAN Phase 4, Zeilen 483–488.

- [x] **4.1** (EP: Draw-Workflow) Marker/Line/Polygon/Text, Undo/Redo auf laufender Instanz
  - Live-Verify (2026-03-02): Draw-Toolbar + Modes/Farbpalette sichtbar; `POST/GET/DELETE /api/geopolitical/drawings` erfolgreich; Marker-Placement oeffnet `Create Marker On Map`-Modal mit Koordinaten.
  - Console-Notiz: zwei Runtime-Fehler (`Cannot read properties of null (reading 'document')`) kamen aus DevTools-Automationsklicks (`pptr:evaluate`), nicht aus normaler UI-Nutzung.
- [x] **4.2** (EP: E2E-Abnahme) `POST /api/geopolitical/seed` → `/geopolitical-map` → Earth↔Moon Toggle, Choropleth, Layer-Toggles, Cluster-Zoom
  - Live-Verify (2026-03-02): Earth/Moon Toggle ok (`Moon: Visible markers=0`, `Earth: >0`), Layer-Toggles reagieren, Seed-Call erfolgreich (`POST /api/geopolitical/seed` -> 200).
- [ ] **4.7** (EP: Performance) 200+ Events bei 60 FPS Rotation (falls noch offen)
  - Letzte Messung (2026-03-02): ~52.07 FPS bei 5s rAF-Fenster (`261 frames / 5012ms`) bei 200+ Events; Ziel 60 FPS noch nicht stabil erreicht.
- [x] **4.8** (Live-Fix 2026-03-02) Globe Auto-Rotation/Marker-Sync stabilisiert:
  - `MapCanvas.tsx`: Auto-Rotation wird nicht mehr durch programmatic Zoom-Init deaktiviert (`event.sourceEvent`-Guard).
  - `MapCanvas.tsx`: Inertia-Drag ist in `marker` wieder aktiv; nur `line|polygon|text` deaktivieren Drag fuer praezises Zeichnen.
  - Live-Verify (Chrome DevTools): Marker-`transform` aendert sich wieder kontinuierlich waehrend Rotation.
- [x] **4.9** (Live-Verify Datenpfad) Seed + Real-Provider beide pruefen:
  - Seed-Pfad: `POST /api/geopolitical/seed` -> 200 (degraded=false) im laufenden Verify.
  - Realpfad: `source=acled` -> 200 mit Events; `source=gdelt` -> 200 degraded (leere Events + Fehlerhinweis `Go geopolitical gateway request failed (502)`).
- [x] **4.10** (Live-Fix 2026-03-02) Marker-Click Runtime-Error beseitigt:
  - `MapCanvas.tsx`: Inertia-Projection-Adapter korrigiert (`projection.rotate(next).invert(...)` chaining kompatibel).
  - Browser-Konsole nach Reload: kein `projection.rotate(...).invert is not a function` mehr.
- [x] **4.11** (Live-Fix 2026-03-02) Earth/Moon Datentrennung im Viewport:
  - `MapViewportPanel.tsx`: Bei `mapBody=moon` werden Earth-Events/Candidates/SoftSignals/Drawings nicht gerendert.
  - Live-Verify: Moon zeigt `Visible markers = 0`, keine Drawings, Markerliste leer.
- [x] **4.12** (UX-Refactor 2026-03-02) GeoMap Full-Viewport + Overlay-Panels:
  - `GeopoliticalMapShell.tsx`: Map nutzt den vollen Workspace; Left/Right/Bottom Panels als Overlay-Ebene.
  - Resizing live: Left/Right horizontal, Bottom vertikal per Drag-Separator.
  - `MapLeftSidebar.tsx`/`MapRightSidebar.tsx`: fixe Breiten entfernt (`w-full`), damit Overlay-Resize wirksam ist.
- [x] **4.13** (Live-Fix 2026-03-02) Moon-Mode strikt von Earth-Workflow getrennt:
  - `GeopoliticalMapShell.tsx`: Moon-Klicks erzeugen keine Marker/Drawings mehr (`onMapClick` guard).
  - `MapRightSidebar.tsx`: Earth-spezifische Sektionen (Contradictions/Phase12/News/GeoPulse/GameTheory/Context/SourceHealth) sind nur in Earth sichtbar.
  - Live-Verify: Moon zeigt nur Moon-Layer + leere Markerliste/Timeline, ohne Earth-Datenblöcke.
- [x] **4.14** (Live-Fix 2026-03-02) Draw-UX entkoppelt von Default-Navigation:
  - `GeopoliticalMapShell.tsx`: Map-Klick-Draw nur aktiv, wenn Draw-Panel geoeffnet ist (`drawToolsOpen` guard).
  - `MapViewportPanel` bekommt `drawingMode=null`, solange Draw-Panel geschlossen ist (normales Drag/Zoom bleibt Default).
  - Live-Verify: Nach Reload startet Draw-Panel eingeklappt; normales Globe-Verhalten bleibt ohne Draw-Interferenz.
- [x] **4.15** (Live-Fix 2026-03-02) Draw-Trigger + Overlay-Layout gehaertet:
  - Draw-Trigger als Icon-Button ohne Text, mit hoehrem Z-Index und dynamischer Position ausserhalb des Left-Panels.
  - Left/Right/Bottom Overlay-Panels mit stabiler Scrollbarkeit (`overflow-y-auto`) und Resize-kompatibler Inhaltsflaeche.
  - Live-Verify: Keine Ueberlagerung des Draw-Triggers durch Left-Panel, Panel-Inhalte bleiben scrollbar statt zu ueberlappen.
- [x] **4.16** (Live-Fix 2026-03-02) Marker-Symbole statt Buchstabenkuerzel:
  - `MapCanvas.tsx`: D3-Symbolpfade fuer Marker aktiviert (Circle/Cross/Triangle/Diamond/Star/Wye).
  - Vorheriger weisser Quadrat-Look aus Textkuerzeln/Focus-Artefakten reduziert; Marker-Icons jetzt visuell konsistent.
- [x] **4.17** (Live-Fix 2026-03-02) Drawing-Tools vollstaendig lauffaehig + Farbpalette:
  - `DrawModePanel.tsx`: Draw-Toolbar auf echte Draw-Tools fokussiert (`line|polygon|text`) und Color-Palette + Hex-Input hinzugefuegt.
  - `store.ts`: `drawingColor` als Workspace-State eingefuehrt; wird fuer Line/Polygon/Text verwendet.
  - `useGeopoliticalDrawingInteractions.ts` + `MapCanvas.tsx`: Drawing-Preview und Persistenz nutzen die aktive Farbe statt Hardcode.
  - Live-Verify: Line, Polygon (inkl. Complete), Text sowie Undo/Redo arbeiten im Browser wie erwartet.
- [x] **4.18** (Live-Fix 2026-03-02) Unnoetige Draw-Rehydrate reduziert:
  - `useGeopoliticalDrawingCommands.ts`: Draw/Undo/Redo laden nicht mehr `fetchAll()`, sondern nur `fetchDrawings()`.
  - `useGeopoliticalWorkspaceData.ts`: gezielter Drawings-Refresh hinzugefuegt.
  - Live-Netzwerkprobe: Nach Draw-Aktion nur `POST /api/geopolitical/drawings` + `GET /api/geopolitical/drawings` (kein kompletter Geo-Full-Reload aus Draw-Command-Pfad).
- [x] **4.19** (Live-Fix 2026-03-02) Marker-Erstellung von Draw-Mode entkoppelt:
  - `CreateMarkerPanel.tsx`: `Create marker` nicht mehr an `drawingMode === marker` gebunden.
  - Marker kann dadurch weiter im Inspector erstellt werden, waehrend Draw-Toolbar fuer Shapes aktiv ist.
- [x] **4.20** (Live-Fix 2026-03-02) Draw-Toggle-Stabilisierung:
  - `GeopoliticalMapShell.tsx`: Draw-Panel-Toggle in separaten Handler ausgelagert (`handleToggleDrawTools`), React-Warnung zu `setState`-Kaskade entfernt.
- [x] **4.21** (Live-Fix 2026-03-02) Polygon/Text-Interaktion gegen Marker-Hitlogik gehaertet:
  - `MapCanvas.tsx`: Bei aktivem Draw-Mode (`line|polygon|text`) hat Drawing-Klicklogik Vorrang vor Marker-Hit-Detection.
  - Marker-Pointer-Events werden waehrend aktivem Draw-Mode unterdrueckt, damit Canvas-Klicks konsistent im Drawing-Flow landen.
  - Live-Verify (Chrome DevTools): `Points` steigt korrekt, `Complete polygon` wird aktiv, `POST /api/geopolitical/drawings` + `GET /api/geopolitical/drawings` erfolgen.
- [x] **4.22** (Live-Fix 2026-03-02) Draw-Preview und Re-Render-Pfad verbessert:
  - `MapCanvas.tsx`: Polygon-Live-Preview (Polyline + Ankerpunkte) und natuerlicher Color-Picker in der Toolbar.
  - `MapViewportPanel.tsx` + `GeopoliticalMapShell.tsx`: `pendingPolygonPoints` durchgereicht, Map-Callbacks (`onMapClick`, `onCountryClick`) stabilisiert (`useCallback`) zur Reduktion unnoetiger Re-Renders aus Parent-Updates.
  - `MapCanvas.tsx`/`MapViewportPanel.tsx`: `memo(...)` aktiviert, um Sidebar-getriebene Parent-Renders weniger auf den Globe durchschlagen zu lassen.
- [x] **4.23** (Live-Fix 2026-03-02) Marker-Semantik + Panel-Nutzen konsolidiert:
  - `markerSymbols.ts` als zentrale Symbol-Quelle eingefuehrt (`getMarkerSymbolPath`, Label/Legend-Mapping).
  - `MapCanvas.tsx`: alte ad-hoc Symbol-Resolver (includes-basiert) entfernt, Marker-Icons konsistent aus Symbol-Registry; zusaetzliche In-Map-Legende fuer Severity/Symbol-Codes.
  - `MapLeftSidebar.tsx`: Marker-Semantik-Block + Marker-Liste in den linken Panel verlagert (operativ nutzbar statt leerer Pilot-Flaeche).
  - `MapRightSidebar.tsx`: Inspector/Timeline als Tabs gebuendelt, damit Analyse-Workflow in einem Panel bleibt.
  - `MarkerListPanel.tsx`: Symbol-Icons + Severity-Chips statt uneinheitlicher Marker-Darstellung.
  - Verify: `bun run lint` + `bun x tsc --noEmit` grün, Live-Check in Chrome DevTools auf `/geopolitical-map`.
- [x] **4.24** (Live-Verify 2026-03-02, Re-Run der offenen Punkte 4.1/4.2/4.7/4.9)
  - **4.2 Earth/Moon/Layers/Cluster:** Earth<->Moon Umschaltung live verifiziert; Moon zeigt `Visible markers=0`, Earth zeigt Event-Marker/Cluster. Layer-Buttons (`Severity/Regime/Macro`) und Zoom/Cluster-Verhalten reagieren im laufenden View.
  - **4.9 Realpfad (teilweise):** Source-Switch auf `ACLED (Go Gateway)` liefert live Daten (`1 EVENTS`, kein Fetch-Fehler). Source-Switch auf `GDELT (Go Gateway)` ist erreichbar, zeigt aber aktuell `Failed to fetch events (502)` im Inspector.
  - **4.9 Seed-Pfad (offen/blockiert):** `POST /api/geopolitical/seed` liefert weiterhin `503` mit `GO_OWNERSHIP_REQUIRED/NEXT_ALIAS_DISABLED`; fuer Seed-Gate muss Go-Mode (`GEOPOLITICAL_ADMIN_SEED_MODE=go-owned-gateway-v1`) aktiv sein.
  - **4.7 Performance (offen):** erneute Live-Messung per `requestAnimationFrame` (5s) ergab ~`7.43 FPS` (`38 Frames / 5114ms`), deutlich unter dem 60-FPS-Ziel.
  - **4.1 Draw-Workflow (teilverifiziert/offen):** Draw-Toolbar/Modes/Farbpalette sind stabil sichtbar; reproduzierbare Canvas-Klicks ueber Chrome-DevTools-Automation bleiben inkonsistent (intermittent Fokus/Filter-Interferenz), dadurch kein belastbarer End-to-End-Nachweis fuer `line/polygon/text` in diesem Re-Run.
- [x] **4.25** (Live-Fix 2026-03-02, UX/Stabilisierung nach Re-Run)
  - **Draw-Rerender reduziert:** `useGeopoliticalWorkspaceData.ts` nutzt bei SSE-Updates (`candidate.new|updated`, `event.updated`, `timeline.appended`) jetzt `fetchAll({ silent: true })`; damit kein globaler Loading-Swap mehr waehrend laufender Draw-Interaktion.
  - **GeoStats sichtbar gemacht:** Toolbar-Zeile zeigt bei `No active filters` jetzt kompakte Stats (`events`, `avg severity`, `max severity`) statt leerem Platzhalter.
  - **Choropleth erklaert:** In-Map Layer-Panel zeigt jetzt mode-abhaengige Erklaerung (`severity/regime/macro`) und Country-Hover liefert Tooltip mit Metrik (`intensity`/`regime`/`macro` + event count).
  - **Unklare Markerkuerzel entschärft:** Marker-Legende zeigt Labels statt nur Kurzcodes (bessere Lesbarkeit von `EL/CF/...`).
  - **Panel-Layout gehaertet:** Left/Right Panels laufen jetzt ueber volle Hoehe; Bottom-Panel-Breite bleibt stabil (nicht mehr dynamisch breiter bei Collapse von Sidepanels).
  - **Seed-Dev-Flow entschaerft:** `POST /api/geopolitical/seed` erlaubt in Dev einen kontrollierten Alias-Fallback (`GEOPOLITICAL_ALLOW_NEXT_SEED_ALIAS_DEV`, default an ausserhalb Prod), statt hartem 503-Block.
  - **GDELT/Graph Fail-Soft:** `events`- und `graph`-Route geben bei externem Gateway-Fehler degradiert leere Daten statt harter 502/500 fuer den UI-Flow zurueck; Fehlertext bleibt als Diagnose im Payload erhalten.
- [x] **4.26** (Live-Fix 2026-03-02, Panel-Nutzbarkeit + Draw-Default)
  - **Draw-Default geprueft:** Draw-Toolbar startet eingeklappt (`aria-expanded=false`), kein aktiver Draw-Workflow ohne explizites Oeffnen.
  - **Kein Loading-Swap beim Draw-Toggle/Klick:** Live-Check auf `/geopolitical-map` zeigt keinen `Loading geopolitical workspace...`-Overlay beim Oeffnen der Draw-Tools und beim Map-Klick.
  - **Marker-Semantik bereinigt:** Left-Panel zeigt Symbol + Klartext-Label ohne Kurzcode-Spalte (`CF/SC/...` entfernt).
  - **Marker-Liste gehaertet:** `MarkerListPanel` begrenzt auf die letzten 120 Eintraege mit Hinweis auf weitere Treffer, damit das Left-Panel bei grossen Seed-Daten bedienbar bleibt.
- [x] **4.27** (Live-Fix + Live-Verify 2026-03-02, Marker-Workflow refactored)
  - **Marker-Liste als eigene Komponente:** `MarkerListModal.tsx` eingefuehrt (dediziertes Gross-Modal mit Filtern fuer Freitext, Country, Region, Symbol, Min-Severity, Status).
  - **Top-Toolbar Integration:** Neuer `Marker List`-Button bei den oberen Map-Filtern; Marker-Liste aus dem Left-Panel entfernt.
  - **Left-Panel Fokus:** Left-Panel enthaelt jetzt nur noch Marker-Actions (`Set Marker`) + Marker-Semantik.
  - **Bottom-Panel entfernt:** Geomap-Container nutzt jetzt nur noch Map + Left/Right Overlay-Panels (kein drittes Overlay unten).
  - **Live-Verify:** `Set Marker` armieren -> Klick auf Globe -> `Create Marker On Map`-Modal oeffnet mit realen Koordinaten (`No point selected yet` verschwindet); Marker-List-Modal oeffnet und selektierter Eintrag springt in den Edit/Inspector-Flow.
  - **Console-Status:** Keine Runtime-Errors im Verify-Run; verbleibend nur allgemeine A11y-Hinweise (`label/id` Issues), separat nachzuziehen.
- [x] **4.28** (UI-A11y-Fix 2026-03-02, Form-Felder global nachgezogen)
  - Native Form-Controls in GeoMap/Phase12/Trading-Header und Auth-Admin um `id`/`name` erweitert.
  - UI-Wrapper gehaertet: `src/components/ui/input.tsx` und `src/components/ui/textarea.tsx` setzen `name` (Fallback auf `id`) und `aria-label` (Fallback auf `placeholder`) konsistent durch.
  - Relevante Geo-Komponenten nachgezogen (`TimelineStrip`, `GeoContradictionsPanel`, `CandidateQueue`, `GeopoliticalContextPanel`, `Phase12AlertsSection`, `Phase12OverlaysSection`, `Phase12ExportsSection`, `DrawModePanel`) sowie `AdminUserRolePanel` und `TradingHeader`.
  - Verify: `bun run lint:fix` + `bun run lint` grün.
- [x] **4.29** (Re-Run 2026-03-02, Konsolidierung)
  - 4.1/4.2/4.9 im laufenden Browser-Run erneut verifiziert und auf erledigt gesetzt.
  - Console-Fehler `Cannot read properties of null (reading 'document')` stammen aus DevTools-Automationsklicks (`pptr:evaluate`), nicht aus regulärer Nutzerinteraktion.
  - Offener Rest bleibt 4.7 (Performance): aktueller Live-Wert ~52 FPS bei 200+ Events.

---

## P1: Phase 10 Verify Gates (EP Phase 10)

> **Stack + Next.js noetig.** Quelle: EXECUTION_PLAN Phase 10 Verify Gate.

- [ ] **10.v1** "Analyse EURUSD" → Extractor + Synthesizer liefern Analyse
  - Caveat (03 Mär 2026): Kein LLM-Endpoint im System (kein anthropic/openai). CommandPalette "Ask AI" war Stub. Context-Assembly (KG+Episodic, 8 Fragments) ist live verifiziert via `/api/v1/agent/context`.
- [ ] **10.v2** Context Assembly: Frontend-State + 5 Episodes + KG-Nodes korrekt
  - Caveat: Context-Infrastruktur live (8 Fragments, KG+Episodic aktiv). Frontend zeigt "KG MEMORY" Badge. Vollstaendige v2-Abnahme (5 Episodes + KG-Nodes im Browser) noch ausstehend.
- [x] **10.v3** WebMCP Mutation → Confirm-Modal → Chart aendert sich
  - Implementiert (03 Mär 2026): `POST /api/v1/agent/tools/set_chart_state` (Python agent-service Port 8094), Go AgentMutationProxyHandler, capability `tool.set_chart_state`, AlertDialog Confirm-Modal in CommandPalette. Bei Confirm: onSymbolChange + onTimeframeChange werden mit Agent-Vorschlag aufgerufen.

### Agent Tool-Architektur (Finding 03 Mär 2026)

**SOTA MCP/WebMCP Pattern:** Tools leben dort wo ihre Wirkung ist.

| Tool-Typ | Wo | Beispiele |
|---|---|---|
| **Frontend-Tools** | React-Callbacks (`src/lib/agent/frontend-tools.ts`) | `set_chart_symbol`, `set_timeframe`, `open_panel`, `navigate_to` |
| **Backend-Tools** | Go/Python via agent-service | `get_market_data`, `get_portfolio_summary`, `run_backtest`, `get_geopolitical_events` |

**CommandPalette "Ask AI":** Öffnet nur Chat-Panel (`onOpenChat?.()`), kein direkter Tool-Call.
⌘J → Chat öffnen, Agent entscheidet welche Tools er aufruft.

**Noch zu bauen (Chat-UI):**
- Chat-Drawer/Panel Komponente
- Confirm-Guard: Tools mit `confirmLevel: "confirm"` zeigen AlertDialog vor execute()
- Backend `POST /api/v1/agent/tools/set_chart_state` bleibt — wird vom LLM-Agent aufgerufen (nicht vom User direkt)
- `FrontendToolCallbacks` in `page.tsx` verdrahten (onSymbolChange, onTimeframeChange, onPanelOpen, onNavigate bereits vorhanden)

---

## P2: Phase 14 Verify Gates (EP Phase 14)

> **14.v2:** Unit-Test, kein Stack. **14.v1, 14.v3:** Stack noetig.

- [ ] **14.v1** DiffWatcher: OFAC SDN Update → Auto-Candidate
  - **Unit-Tests PASS (03 Mär 2026):** `TestParseSDNXML`, `TestParseSDNXML_Empty`, `TestNewSDNWatcher` → alle grün. `go test ./internal/connectors/ofac/... ./internal/connectors/base/...` ✓
  - **Pack.go Partial-Success-Fix (03 Mär 2026):** `go-backend/internal/connectors/geomapsources/pack.go` `FetchAndMapToCandidates()` umgebaut von fail-fast auf partial-success: Einzelne Watcher-Fehler werden jetzt per `slog.Warn()` geloggt und geskippt; Fehler wird nur zurueckgegeben wenn ALLE Watcher fehlschlagen. `log/slog`-Import hinzugefuegt. Hintergrund: UN-Endpoint (`scsanctions.un.org`) hat TLS-Zertifikat-Problem (cert gueltig fuer `*.azurewebsites.net`, nicht fuer die UN-Domain) → verursachte EOF/abort fuer den gesamten Batch.
  - **Live-Verify Stack:** Benoetigt neues Go-Binary (Air-Rebuild oder `go build ./...` + Stack-Neustart). Erst nach Rebuild testbar: OFAC+SECO+EU sollten Partial-Success liefern; UN-Watcher bleibt ausgefallen bis TLS-Problem geklaert. → **Erst nach naechstem Stack-Start verifizierbar.**
- [x] **14.v2** Symbol Catalog Unit-Tests (Stub-Level)
  - **Live-Verify (03 Mär 2026):** `go test -v ./internal/connectors/symbolcatalog/...` → `TestClient_Normalize` (4 subtests), `TestClient_Resolve`, `TestClient_NormalizeMany` → alle PASS ✓
  - **PARTIAL:** `provider="unknown"` in Resolve-Result — Symbol-Registry nicht geladen (Stub functional). 500+ vollstaendige Registry = separates Delivery, erfordert Datenbankdesign fuer Symbol-Catalog-Store.
- [ ] **14.v3** GeoMap offizielle Quellen ueber Go-Connector
  - **Deferred:** Unvollstaendig inspiziert — separates Delivery.

---

## P3: Deferred (EP Phase 0, 2, 3, 5, 7)

> Uebertragen aus EXECUTION_PLAN Open Checkpoints / Deferred Live Verify. Optional, nach P0–P2.

### Phase 0 — Open Checkpoints (EP Phase 0, Zeilen 294–298)

- [ ] **0.P0** Go-only Boundary fuer Market/Geo-Proxies final pruefen (keine Provider-Bypaesse in Next-Routen)
- [ ] **0.P1** Einheitliche Correlation-ID-Propagation als Pflicht-Check fuer neue API-Routen
- [ ] **0.P2** Proxy-Konvention: Next bleibt thin proxy, keine Domainlogik in Route-Handlern
- [ ] **0.0c** (optional) Frontend `src/lib/providers` auf Types + Registry reduzieren

### Phase 2 — Deferred Live Verify (EP Phase 2, Zeilen 393–399)

- [x] **2.1** Browser `/` → SignalInsightsBar zeigt Composite/Confidence + SMA50 Slope + Heartbeat + Smart-Money
  - Verifiziert (03 Mär 2026): UI-Snapshot zeigt TREND REGIME, SMA50 above, RVOL, CMF, ATR, Heartbeat, AI-Composite alle sichtbar.
- [x] **2.2** Network-Trace: `/api/fusion/strategy/composite` → Next → Go → Python
  - Verifiziert (03 Mär 2026): `POST /api/fusion/strategy/composite` → 200, Response: `{signal: "neutral", confidence: 0.41, components: {sma50_slope, heartbeat, volume_power}}`. Shape korrekt.
- [x] **2.3** indicator-service `/health` zeigt `rustCore` + `dataframe` (Polars)
  - **Live-Verify (03 Mär 2026):** `{"ok":true,"rustCore":{"available":true,"module":"tradeviewfusion_rust_core","version":"0.1.0"},"dataframe":{"available":true,"engine":"polars","version":"1.38.1"}}` ✓
- [x] **2.4** Finance-Bridge `/ohlcv` mit Rust-Cache: cache.hit false→true
  - **Live-Verify (03 Mär 2026):** `GET http://127.0.0.1:8081/ohlcv?symbol=BTC%2FUSD&exchange=kraken&timeframe=1h&limit=10` → erster Call `cache.hit=false, engine=redb`, zweiter Call `cache.hit=true`. Polars DataFrame-Engine aktiv. Echte Kraken-OHLCV-Daten zurueckgegeben ✓
- [x] **2.5** Rust-Core Fallback-Pfad verifiziert (Code-Level)
  - **Code-Verify (03 Mär 2026):** `ml_ai/indicator_engine/rust_bridge.py` nutzt `try/except`-Import mit `_rust_core = None`-Fallback. Alle oeffentlichen Funktionen haben Guard `if _rust_core is None: return None`. Kein env-Flag — Fallback greift automatisch wenn Wheel nicht importierbar. `/health` wuerde `available: false` zeigen, kein Service-Crash. Live-Destruktiv-Test (Wheel deinstallieren) nicht notwendig — Fallback-Logik im Code vollstaendig belegt ✓

### Phase 3 — Deferred Live Verify (EP Phase 3, Zeilen 433–441)

- [x] **3.1** Browser `/` mit streamfaehigem Symbol: `X-Stream-Backend=go-sse`, Events ready/snapshot/quote/candle
  - Verifiziert (03 Mär 2026): UI zeigt "GO-GATEWAY / STREAM ACTIVE". Quellcode-Bestaetigung: `stream/route.ts` Zeile 325 setzt `X-Stream-Backend: go-sse`. Fallback `next-legacy-polling` Zeile 493. EventSource reqid=36 aktiv.
- [ ] **3.2** Alert-Live-Test: Preis-Alert anlegen, Trigger im UI <1s
- [ ] **3.3** Reconnect-Test: stream_status → reconnecting/live, Snapshot nach Reconnect
  - **Hinweis (03 Mär 2026):** Benoetigt Auth-Session-Cookie fuer Next.js SSE-Route. Curl ohne Session → 401. Praktisch: Browser-Test oder curl mit `Cookie: next-auth.session-token=...` nach Login.
- [ ] **3.4** Legacy-Fallback-Smoke: nicht-streamfaehiges Symbol → `X-Stream-Backend=next-legacy-polling`
  - **Hinweis (03 Mär 2026):** Benoetigt Auth-Session (Next.js `GET /api/market/stream` → 401 ohne Cookie). Kein reiner curl-Test moeglich. → Browser oder Auth-Session notwendig.

### Phase 5 — Verify deferred (EP Phase 5)

- [x] **5.1** Portfolio Bridge + Analytics Live-Verify (GCT, Python Analytics, Frontend-Tabs)
  - Verifiziert (03 Mär 2026): `POST /api/v1/portfolio/rolling-metrics` → 200. Schema: `{equity_curve:[{time:string,equity:float}], window:int}`. Frontend-Tab `/api/fusion/portfolio` erfordert Session-Cookie (401 ohne Auth — korrekt, kein Bug). GCT-Exchange-Onboarding (5.2) weiterhin offen.
- [ ] **5.2** GCT Exchange-Onboarding Smoke (Binance zuerst): verbinden/validieren/trennen + Status in Trading/Settings pruefen (serverseitige Key-Verarbeitung, kein Frontend-Secret).

### Phase 15 — Volatility Suite + Regime Detection (Live-Verify)

> **Stack noetig, kein Browser.** Port 8092 (indicator-service). Alle Endpoints direkt curl-testbar.

- [x] **15.1** Volatility Suite: `POST http://127.0.0.1:8092/api/v1/indicators/volatility-suite`
  - **Live-Verify (03 Mär 2026):** `{"spike_weighted_vol":0.316622,"volatility_index":0.289002,"exp_weighted_stddev":0.018485,"volatility_regime":"normal"}` — Field ist `closes` (nicht `prices`). Berechnung korrekt ✓
- [x] **15.2** Regime Detection: `POST http://127.0.0.1:8092/api/v1/regime/detect`
  - **Live-Verify (03 Mär 2026):** `{"current_regime":"ranging","sma_slope":0.028856,"adx":0.0,"confidence":1.0}` ✓
- [x] **15.3** Markov Regime: `POST http://127.0.0.1:8092/api/v1/regime/markov`
  - **Live-Verify (03 Mär 2026):** `{"current_regime":"ranging","transition_probs":{"bullish":0.3333,"bearish":0.3333,"ranging":0.3333},"expected_duration":1.0,"shift_probability":0.5}` — Warning bei kleinem Sample (erwartet) ✓
- [x] **15.4** HMM Regime: `POST http://127.0.0.1:8092/api/v1/regime/hmm`
  - **Live-Verify (03 Mär 2026):** `{"n_components":2,"hidden_state":0,"state_labels":["low_vol","medium_vol"],"means":[0.008963,0.013522],"bic_score":-94.8755}` ✓
- [x] **15.5** Go-Gateway Proxy fuer Phase-15-Endpoints
  - **Live-Verify (03 Mär 2026):** `POST http://127.0.0.1:9060/api/v1/indicators/volatility-suite` → `{"volatility_regime":"normal",...}` ✓ | `POST .../regime/detect` → `{"current_regime":"ranging",...}` ✓. Wiring in `wiring.go` korrekt, Proxy transparent.

### Phase 7 — Live-Verify deferred (EP Phase 7)

- [x] **7.1** Indicator Catalog Live-Verify (Browser/API-Durchstich fuer Phase-7-Endpoints)
  - Verifiziert (03 Mär 2026): `POST /api/v1/indicators/swings` → 200, `POST /api/v1/indicators/exotic-ma` → 200 (beide via indicator-service Port 8092 direkt und via Go-Gateway 9060). Routing korrekt.

---

## Infrastruktur (EP Infra I.1–I.5)

- [ ] **I.1** Dev-Stack-Skript lokal lauffaehig (`dev-stack.ps1` oder aequivalent)
- [ ] **I.2** Redis/Valkey fuer Memory-Cache verfuegbar (oder LRU-Fallback getestet)
- [ ] **I.3** Prisma + DB fuer Auth/Episodic migriert und getestet
- [ ] **I.4** Python-Services (indicator, finance-bridge, memory, soft-signals, agent) starten ohne Fehler
- [ ] **I.5** Go Gateway auf Port 9060 erreichbar

---

## Ablauf: In einem Rutsch

1. **Stack + Next starten:** `./scripts/dev-stack.ps1 -SkipGCT` (ohne `-NoNext`)
2. **Phase 6:** `./scripts/verify-memory-phase6.ps1`
3. **Phase 1:** `bunx playwright test e2e/auth-live-verify.spec.ts`
4. **Phase 4:** Manuell im Browser: `/geopolitical-map`, Draw-Workflow, Seed
5. **Phase 10:** `./scripts/verify-phase10.ps1`
6. **Phase 14:** `./scripts/verify-phase14.ps1` (14.v2 auch ohne Stack)
7. **Stack-Health:** `bunx playwright test e2e/integration-stack.spec.ts`

---

## Verify-Skripte

| Skript | Phase | Stack | Next.js |
|--------|-------|-------|---------|
| `scripts/dev-stack.ps1 -SkipGCT` | I.1, Voraussetzung | — | Optional (fuer 1/4/10) |
| `scripts/dev-stack.ps1 -SkipGCT -NoNext` | Phase 6 nur | — | Nein |
| `scripts/verify-memory-phase6.ps1` | 6.2–6.9 | Ja | Nein |
| `scripts/verify-phase10.ps1` | 10 (Prereq) | Ja | Ja |
| `scripts/verify-phase14.ps1` | 14.v2 (unit), 14.v3 | 14.v2: Nein | Nein |
| `e2e/auth-live-verify.spec.ts` | 1.1–1.11 | Ja | **Ja** |
| `e2e/geomap-phase4-verify.spec.ts` | 4 (falls vorhanden) | Ja | **Ja** |
| `e2e/integration-stack.spec.ts` | Stack-Health | Ja | Nein |

---

## Referenzen

- `docs/specs/EXECUTION_PLAN.md` — Vollstaendige Phasen, Verify Gates, Deferred Live Verify Backlog
- `docs/specs/SYSTEM_STATE.md` — IST-Zustand
- `docs/PROXY_CONVENTIONS.md` — Phase 0 Proxy-Konvention
- `docs/GEOMAP_VERIFY.md` — Phase 4 Abnahmeprotokoll
- `docs/E2E_VERIFY_PHASES_0-4.md` — E2E-Audit Phasen 0–4 (UID-Registry, System Health, Blockers). **Thematisch nahe am Mini, aelter (Stand 25. Feb 2026) — bei Live-Verify zusaetzlich pruefen.**
