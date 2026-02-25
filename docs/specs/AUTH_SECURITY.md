# AUTH & SECURITY ARCHITECTURE

> **Stand:** 22. Februar 2026 (Rev. 2 — kritisches Review eingearbeitet)  
> **Zweck:** Vollständige Sicherheitsarchitektur für das 3-Schichten-Modell: User Auth → Go Gateway → GCT → Exchanges. Dieses Dokument definiert wie echtes Geld geschützt wird.  
> **Quellen:** GCT Fork (`vendor-forks/gocryptotrader/`), `go-backend/internal/connectors/gct/client.go`, `go-backend/internal/app/wiring.go`, RFC 9700 (OAuth2 Security BCP 2025), W3C WebAuthn Level 3 (2025), FIDO Alliance Passkey Best Practices (2026), Binance/Kraken API Security Docs  
> **Lebendes Dokument:** Wird nach jeder Security-relevanten Phase aktualisiert. Referenziert in `SYSTEM_STATE.md` Sek. 9 und `EXECUTION_PLAN.md` Phase 0 + Phase 6.  
> **Änderungshistorie:** Rev. 1 (20. Feb 2026) — Erstfassung. Rev. 2 (22. Feb 2026) — Kritische Items nach Phase 0 vorgezogen, Recovery Flows, JWT Revocation, Incident Response, Monitoring, Secrets Management ergänzt. Consent aus JWT entfernt (→ Server-Side Lookup). Rev. 3 (22. Feb 2026) — Sek. 13: Client-Side Data Encryption fuer Frontend User-KG (WebAuthn PRF + Server-Fallback). Sprint 6.1 erweitert. Rev. 4 (22. Feb 2026) — Sek. 8.1: WebMCP Security (W3C Draft, XSS-Risiko, Tool-Scoping, Audit, Haertungs-Massnahmen). Entscheidungsmatrix WebMCP vs. Chrome DevTools MCP in `AGENT_TOOLS.md`.

---

## 1. Architektur-Überblick: 3-Schichten-Modell

```
┌──────────────────────────────────────────────────────────┐
│                    SCHICHT 1                              │
│              User → Next.js → Go Gateway                 │
│                                                          │
│  Browser ──► Next.js (next-auth v5)                      │
│              ├─ WebAuthn/Passkeys (passwortlos)           │
│              ├─ JWT in httpOnly/Secure/SameSite Cookie    │
│              └─ Rollen-Claim: viewer|analyst|trader       │
│                        │                                 │
│              Go Gateway (9060)                           │
│              ├─ JWT Validation (Signatur, Expiration)     │
│              ├─ RBAC Check (Rolle → erlaubte Endpoints)   │
│              ├─ Rate Limiting (pro Endpoint-Gruppe)       │
│              ├─ CSP + CORS Headers                       │
│              ├─ Correlation ID (X-Request-ID)            │
│              └─ Audit-Log (DB, nicht nur Log-File)       │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                    SCHICHT 2                              │
│              Go Gateway → GCT                            │
│                                                          │
│  Go Gateway ──► GCT gRPC (9052) / JSON-RPC Proxy (9053)  │
│              ├─ Basic Auth (Service-Account)              │
│              ├─ TLS (Server-Certs, kein InsecureSkip)    │
│              ├─ 1 Service-Account für alle Requests      │
│              ├─ Network: GCT nur auf 127.0.0.1           │
│              └─ Go loggt WELCHER User die Aktion war     │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                    SCHICHT 3                              │
│              GCT → Exchanges (echtes Geld)               │
│                                                          │
│  GCT ──► Binance/Kraken/etc. API                        │
│              ├─ API Keys in GCT config.json              │
│              ├─ Config Encryption (AES-GCM, at-rest)     │
│              ├─ Credential Scoping (KEIN Withdrawal)     │
│              ├─ IP Whitelist (Exchange-seitig)           │
│              ├─ Withdrawal Address Whitelist (GCT)       │
│              └─ Keys rotieren alle 90 Tage               │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Schicht 1: User Auth (WebAuthn/Passkeys)

### 2.1 IST-Zustand

| Aspekt | Status |
|:---|:---|
| next-auth | v5 Beta (`next-auth@5.0.0-beta.x`) aktiv als Transitional/Product-Baseline; Credentials + Passkey Provider verdrahtet |
| Auth Flow | Keiner. Anonymer `profileKey` in Frontend. |
| Rollen | Keine. Alles offen. |
| Session | Keine. Kein Cookie, kein JWT. |
| Geschützte Routes | Keine. Alle API-Routes offen. |

### 2.2 SOLL-Zustand

| Aspekt | Empfehlung | Begründung |
|:---|:---|:---|
| **Primär-Mechanismus** | WebAuthn/Passkeys via next-auth v5 Passkey Provider | Passwortlos = kein Credential Stuffing, kein Phishing, kein Password-Reuse. FIDO2/W3C WebAuthn Level 3 Standard. |
| **Fallback Stufe 1** | TOTP (Time-Based One-Time Password) via Hardware-Key (YubiKey) oder Authenticator-App | Für Geräte/Browser ohne Passkey-Support. Starkes Passwort (min. 16 Zeichen, zufällig) + TOTP als 2FA. |
| **Fallback Stufe 2** | OAuth2 Provider (GitHub/Google) + TOTP-Pflicht | Für Umgebungen ohne WebAuthn und ohne lokale TOTP-App. OAuth2 allein reicht NICHT — TOTP wird nach OAuth-Login erzwungen. |
| **Notfall-Fallback** | Recovery Codes (einmalig, 8 Codes à 16 Zeichen, bei Registrierung generiert) | Letzter Ausweg wenn alle Authenticator-Methoden ausfallen. Siehe Sek. 2.5 Recovery Flow. |
| **Dependencies** | `@simplewebauthn/server@^10`, `@simplewebauthn/browser@^10`, `otplib@^12` (TOTP) | Required by next-auth Passkey Provider + TOTP Fallback. |
| **Prisma Schema** | Neue Tabellen: `Authenticator` (WebAuthn), `TotpDevice` (TOTP secrets), `RecoveryCode` (hashed codes), `UserConsent` (consent status, server-side) | Multi-Method Auth: Jeder User kann mehrere Auth-Methoden registrieren. |
| **Session** | JWT in `httpOnly`, `Secure`, `SameSite=Strict` Cookie | httpOnly = kein JS-Zugriff (XSS-sicher). Secure = nur HTTPS. SameSite=Strict = kein CSRF. |
| **JWT Claims** | `{ sub: userId, role: "trader", jti: unique-id, iat, exp }` | Rolle im Token für schnelle Autorisierung. `jti` (JWT ID) für Revocation-Blocklist. Kein Consent im Token (→ Server-Side Lookup, Sek. 9.1). |
| **Token Lifetime** | Access: 15 min. Refresh: 7 Tage (rotierend, one-time-use). | Kurze Access Tokens limitieren Schaden bei Kompromiss. Refresh Tokens werden bei Nutzung invalidiert und neu ausgestellt (Rotation). |
| **Refresh Token Storage** | DB-Tabelle `RefreshToken`: `{ tokenHash, userId, expiresAt, usedAt, replacedBy, createdByIp }` | Ermöglicht Replay-Detection: Wenn ein bereits genutzter Refresh Token erneut vorgelegt wird → alle Tokens des Users invalidieren (Token Family Revocation, RFC 9700 Sek. 4.14). |

### 2.2a Implementierungs-Slice (22. Feb 2026, Codex) — Scaffold / Migration-Vorbereitung

**Ziel dieses Slices:** Phase `1a`/`1b` vorbereiten ohne Produktions-Auth zu aktivieren.

- **NextAuth/Auth.js-Scaffold erweitert (v5-Baseline):**
  - `next-auth@5` (beta) ist als Transitional/Product-Baseline verdrahtet; Route-Handler exportiert `handlers` aus der zentralen Auth-Konfiguration.
  - `next-auth` verwendet jetzt den **offiziellen Prisma Adapter** (`@auth/prisma-adapter`) als DB-Adapter-Baseline; der frühere lokale Transitional Adapter wurde entfernt.
  - JWT/Session enthalten jetzt einen `role`-Claim (`viewer|analyst|trader|admin`) als Übergang für RBAC-Tests.
  - **Next.js 16 Proxy-Konsolidierung:** `src/middleware.ts` entfernt (Konflikt mit `src/proxy.ts`); `src/proxy.ts` ist jetzt die einzige API-Interception-Schicht.
  - `src/proxy.ts` nutzt path-basierte Public-/Protected-Regeln und kann bei aktivierter Auth (`NEXT_PUBLIC_ENABLE_AUTH=true`) `401/403` erzwingen.
  - `src/proxy.ts` injiziert zusätzlich `X-User-Role` für Downstream-Proxies (transitional bis Go-JWT-Validation bzw. direkte Bearer-Clients aktiv sind).
  - `src/proxy.ts` reicht außerdem `X-Auth-User` (aus `token.sub`), optional `X-Auth-JTI` (aus `token.jti`) und `X-Auth-Verified=next-proxy-session` weiter, damit Downstream-Audits bereits User-/Session-Kontext erfassen können.
  - Role-Regeln in `src/proxy.ts` matchen jetzt auch reale **Next.js-API-Pfade** (z. B. `fusion/orders`, geopolitische Candidate-POSTs) methodensensitiv; zuvor waren Teile der Regeln nur auf interne `/api/v1/*`-Pfade ausgerichtet.
  - `src/proxy.ts` setzt/propagiert außerdem `X-Request-ID` sowie konsolidierte API-Security-/CORS-Response-Header (inkl. API-CSP-Baseline).
  - `src/proxy.ts` setzt zusätzlich **Page/UI-Security-Header** auf Nicht-API-Routen; das UI-CSP ist als transitional Hardening **toggbar** (`PAGE_SECURITY_HEADERS_ENABLED`, `PAGE_CSP_MODE=off|report-only|enforce`, optional `PAGE_CSP_POLICY`) und defaultet kompatibel (`off` in Dev, `report-only` in Prod).
  - **Test-/Dev-Bypass (neu):** Mit `AUTH_STACK_BYPASS=true` (serverseitig) bzw. `NEXT_PUBLIC_AUTH_STACK_BYPASS=true` (Frontend/Proxy) kann die Auth-Kette für lokale Tests deaktiviert werden; `src/proxy.ts` markiert Requests dann mit `X-Auth-Bypass=1`, setzt einen konfigurierbaren Bypass-Role-Header (`NEXT_PUBLIC_AUTH_BYPASS_ROLE`/`AUTH_BYPASS_ROLE`, default `admin`) und überspringt Session-/RBAC-Checks.
  - **Prod-Guard fuer Bypass (neu):** Next.js (`src/lib/auth.ts`) und Go-Gateway (`NewServerFromEnv`) blockieren den Auth-Bypass in Production standardmaessig (fail-closed), ausser ein expliziter Emergency-Override `ALLOW_PROD_AUTH_STACK_BYPASS=true` ist gesetzt.
- **Go-Gateway Security-Scaffolds (flag-gated):**
  - `AUTH_JWT_ENFORCE` — Bearer JWT Validation (HS256, transitional vorbereitend)
  - Optional stricter Claim-/Parser-Checks im JWT-Scaffold: `AUTH_JWT_ISSUER`, `AUTH_JWT_AUDIENCE`, `AUTH_JWT_ALLOWED_ALGS` (HMAC allowlist) und `AUTH_JWT_LEEWAY_SEC` (Clock-Skew-Leeway) als Übergang Richtung finalem Auth.js-Token-Contract
  - `AUTH_RBAC_ENFORCE` — path-basierte RBAC-Policy
  - `AUTH_RATE_LIMIT_ENFORCE` — path-basierte In-Memory Rate Limits
  - `AUTH_STACK_BYPASS` — globaler Test-/Dev-Bypass, der JWT/RBAC/RateLimit-Enforcement im Go-Wiring zentral deaktiviert (optional kann `NEXT_PUBLIC_AUTH_STACK_BYPASS` als Spiegel-Flag gelesen werden)
  - Revocation-Audit besitzt jetzt optional eine **Go-native SQLite-Persistenz** (`AUTH_JWT_REVOCATION_AUDIT_DB_*`) als DB-Baseline; der In-Memory-Ringbuffer bleibt fuer schnelle Runtime-Reads erhalten, hash-chain JSONL bleibt als append-only Trail parallel moeglich.
  - API-CSP-Baseline auf Go- und Next.js-**Proxy**-Ebene (`src/proxy.ts`) (`default-src 'none'; frame-ancestors 'none'; ...`)
  - Phase-1c Scaffold: `/api/v1/gct/*` ist im Go-RBAC als `trader` klassifiziert (erster Endpunkt: `/api/v1/gct/health`) und im Rate-Limit-Scaffold auf 2/min begrenzt.
  - Phase-1c Scaffold: Append-only GCT-Audit-JSONL Middleware (`GCT_AUDIT_ENABLED`, `GCT_AUDIT_JSONL_PATH`) loggt `/api/v1/gct/*` Requests persistent (transitional).
  - Phase-1c Scaffold: Start-Up Hardening-Validation (`GCT_ENFORCE_HARDENING`) kann schwache GCT Service-Credentials und `InsecureSkipVerifyTLS` blockieren (mit expliziten Opt-in Overrides).
- **Prisma Auth-Tabellen-Scaffold ergänzt (`prisma/schema.prisma`):**
  - `User`, `Account`, `Session`, `VerificationToken`
  - `Authenticator` (Passkey/WebAuthn Vorbereitung)
  - `RefreshToken`, `TotpDevice`, `RecoveryCode`, `UserConsent`
  - `User.passwordHash` (Credentials-Register/Login Baseline)
- **Credentials-Register/Login Baseline (Next.js + Prisma):**
  - `POST /api/auth/register` erstellt User mit Scrypt-Hash (`passwordHash`) in Prisma.
  - `next-auth` Credentials-Provider prueft jetzt zuerst Prisma-User (`email`/`name`) und faellt erst danach auf den lokalen Env-Admin-Scaffold zurueck.
  - `/auth/register` Seite vorhanden (auto sign-in nach erfolgreicher Registrierung, best-effort).
- **Passkey/WebAuthn API-Scaffold ergänzt (feature-flagged, Next.js):**
  - `POST /api/auth/passkeys/register/options`
  - `GET/DELETE /api/auth/passkeys/devices` ist im **Auth-Bypass-Modus** testfreundlich: `GET` liefert eine synthetische, leere Geräteliste statt `401`; mutierende Calls bleiben geblockt (`409`) bis Bypass deaktiviert wird.
  - `POST /api/auth/passkeys/register/verify`
  - `POST /api/auth/passkeys/authenticate/options`
  - `POST /api/auth/passkeys/authenticate/verify`
  - Implementiert via `@simplewebauthn/server`, httpOnly Challenge-Cookies (TTL), Prisma-`Authenticator` Persistenz + Counter-Update.
  - `authenticate/verify` kann bei aktivierter Auth (`NEXT_PUBLIC_ENABLE_AUTH=true`) zusaetzlich ein kurzlebiges `sessionBootstrap`-Proof fuer einen transitional NextAuth-Credentials-Exchange (`passkey-scaffold`) liefern.
  - `src/lib/auth/passkey-client.ts` + `/auth/passkeys-lab` koennen diesen Exchange jetzt testweise bis zur NextAuth-Session durchziehen.
- **Minimale Auth-UI (transitional→baseline) ergänzt:**
  - `next-auth` Sign-In-Page zeigt jetzt auf `/auth/sign-in` statt `/`.
  - `/auth/sign-in` bietet Credentials-Login plus **echten Auth.js Passkey-Provider-Login** (`next-auth/webauthn` → Provider `passkey`) und unterstuetzt `?next=/zielpfad` Redirect nach erfolgreichem Sign-in.
  - `/auth/passkeys` bietet eine session-gebundene Passkey-Device-Ansicht (Liste + Registrieren + Entfernen, letzter Passkey ist geschützt); zusätzliche Passkeys können über den Auth.js-Passkey-Provider (`action=register`) registriert werden.
  - `/auth/security` bündelt Login/Register/Passkeys/Consent/KG-Lab als zentralen Security-Hub für manuelle Verifikation und Dev/QA.
  - Das bisherige `passkey-scaffold` (API + `passkeys-lab`) bleibt als Fallback/Testpfad optional erhalten.
- **JWT Revocation Blocklist (Go-Gateway Scaffold) ergänzt:**
  - `jti`-basierte In-Memory Blocklist mit expiry-aware Cleanup (on read).
  - Transitional Preload via `AUTH_JWT_REVOKED_JTIS` + `AUTH_JWT_BLOCKLIST_DEFAULT_TTL_MS`.
  - Runtime-Revocation-Audit als In-Memory-Ringbuffer + Admin-Read-Endpoint `GET /api/v1/auth/revocations/audit` (Kapazitaet via `AUTH_JWT_REVOCATION_AUDIT_CAPACITY`).
  - Zusaetzlich persistenter append-only JSONL-Audit-Write (optional, default on) mit SHA-256-Hash-Chain (`AUTH_JWT_REVOCATION_AUDIT_JSONL_ENABLED`, `AUTH_JWT_REVOCATION_AUDIT_JSONL_PATH`) fuer tamper-evident Verlauf.
- **Privacy/KG (Phase 1e/1f Scaffold) ergänzt:**
  - `/auth/kg-encryption-lab` + `src/lib/kg/encrypted-indexeddb.ts` demonstrieren AES-GCM-verschlüsselte IndexedDB-Records (KG-ähnliche Daten) über Server-Fallback-Key-Material.
  - `/auth/privacy` + `/api/auth/consent` (GET/PATCH) für serverseitige Consent-Toggles.
  - `/auth/security` bündelt die Phase-1-Auth-/Security-Flows (Sign-In, Register, Passkeys, Consent, KG-Lab) als zentrale Bedienoberfläche für Dev/QA ohne E2E-Runner.
  - Fehlender LLM-Consent wird auf ausgewählten geopolitischen LLM-nahen Routen (`game-theory/impact`, Soft-Ingest) bereits mit `403` erzwungen.
- **CSP-/Header-Hardening (Phase 1b) erweitert:**
  - `src/proxy.ts` setzt neben API-CSP jetzt auch Page-/UI-Security-Header (inkl. COOP/CORP) mit transitional UI-CSP (`PAGE_CSP_MODE`, optional `PAGE_CSP_POLICY`) und gestrafftem Default (`object-src 'none'`, `frame-src 'none'`, `manifest-src 'self'`).
- **Revocation-Audit Persistenz (Phase 1b) erweitert:**
  - Optionaler Go-nativer SQLite-Audit-Store (`AUTH_JWT_REVOCATION_AUDIT_DB_ENABLED`, `AUTH_JWT_REVOCATION_AUDIT_DB_PATH`) ist verdrahtet; `GET /api/v1/auth/revocations/audit` kann aus SQLite lesen und fällt bei DB-Fehlern auf den In-Memory-Ringbuffer zurück.
- **Exchange-Key Hardening Scaffold (Phase 1c) ergänzt:**
  - Go Utility `internal/security/aesgcm` (AES-GCM Encrypt/Decrypt + Base64-32B-Key Parsing) als Baustein für spätere verschlüsselte Exchange-Key-/Config-Blobs.
  - GCT Service-Credentials können jetzt optional verschlüsselt via ENV geliefert werden (`GCT_USERNAME_ENC`, `GCT_PASSWORD_ENC`, optional auch `GCT_BACKTEST_USERNAME_ENC`, `GCT_BACKTEST_PASSWORD_ENC`) und werden beim Gateway-Start über `GCT_SERVICE_CREDS_AES256_KEY_B64` (Fallback `GCT_EXCHANGE_KEYS_AES256_KEY_B64`) entschlüsselt.
- **Audit-Hardening (Phase 1c) erweitert:**
  - GCT-JSONL-Audit nutzt jetzt ebenfalls eine SHA-256-Hash-Chain (append-only, tamper-evident pro Datei/Chain-Verlauf) statt reiner JSONL-Zeilen ohne Verknuepfung.
- **Noch offen nach Phase-1-Baseline (ohne Browser/E2E):**
  - Produkt-/UX-Polish für Auth-/Consent-/Security-Seiten (funktionale Flows sind vorhanden: `/auth/sign-in`, `/auth/register`, `/auth/passkeys`, `/auth/privacy`, `/auth/security`)
  - GCT-spezifische Verfeinerungen: DB-Audit für GCT-Aktionen, persistente Exchange-Key-/Config-Storage-Verschlüsselung
  - Optional: Service-issued Bearer-/OAuth-Flow falls Go-Gateway künftig Sessions unabhängig vom Next.js-Proxy validieren soll (aktueller Architekturpfad: Next.js-Proxy validiert Session-Cookie, Go validiert Bearer-Tokens)

### 2.3 RBAC Rollen

| Rolle | Darf | Darf NICHT |
|:---|:---|:---|
| **`viewer`** | Dashboard ansehen, Charts, öffentliche Daten | GeoMap Reviews, Portfolio Orders, Admin-Funktionen |
| **`analyst`** | Alles was Viewer darf + GeoMap Candidate Reviews, UIL Reviews, Analytics | Portfolio Orders, GCT-Steuerung |
| **`trader`** | Alles was Analyst darf + Portfolio Orders, GCT-Order-Endpoints | Admin-Funktionen (User-Management, Key-Rotation) |
| **`admin`** (Zukunft) | Alles + User-Management, Key-Rotation-Trigger, Audit-Log-Zugriff | -- |

### 2.4 Geschützte Endpoints (Go Gateway)

| Endpoint-Pattern | Mindest-Rolle | Rate Limit |
|:---|:---|:---|
| `GET /api/v1/quote`, `/ohlcv`, `/news/*` | `viewer` | 100 req/s |
| `GET /api/v1/geopolitical/*` (read) | `viewer` | 100 req/s |
| `POST /api/v1/geopolitical/candidates/*/review` | `analyst` | 30 req/s |
| `POST /api/v1/indicators/*`, `/patterns/*`, `/signals/*` | `viewer` | 10 req/s |
| `POST /api/v1/ingest/classify` | `analyst` | 10 req/s |
| `GET /api/v1/portfolio/*` (read) | `viewer` | 30 req/s |
| `POST /api/v1/portfolio/order/*` | **`trader`** | **2 req/min** |
| `GET /api/v1/portfolio/balances/*` | **`trader`** | 10 req/s |
| `GET /api/v1/gct/*` | **`trader`** | **2 req/min** (Scaffold, `/api/v1/gct/health` implementiert) |
| `POST /api/v1/auth/revocations/jti` | **`admin`** | 5 req/min (**Scaffold implementiert**) |
| `/health`, `/api/v1/stream/*` | Kein Auth (public) | 5 connections |

### 2.5 Auth Recovery & Device Management

> **Problem:** WebAuthn bindet Credentials an ein physisches Gerät. Verlust des Geräts = Aussperrung. Bei einem System mit echtem Geld ist das inakzeptabel.

**Fallback-Kette (Priorität):**

```
Passkey vorhanden?  ──► Ja → WebAuthn Login
       │ Nein
       ▼
TOTP-Device registriert?  ──► Ja → Passwort + TOTP Login
       │ Nein
       ▼
OAuth2 verbunden?  ──► Ja → OAuth2 + TOTP-Pflicht
       │ Nein
       ▼
Recovery Code vorhanden?  ──► Ja → Recovery Code Login
       │ Nein                          (erzwingt sofort neue Auth-Methode)
       ▼
Account gesperrt → manueller Admin-Eingriff
```

**Recovery Codes:**

| Aspekt | Details |
|:---|:---|
| **Generierung** | 8 Codes à 16 alphanumerische Zeichen, kryptographisch zufällig (`crypto.randomBytes`) |
| **Speicherung** | Nur bcrypt-Hashes in DB (Tabelle `RecoveryCode`). Klartext wird dem User EINMAL angezeigt. |
| **Einmal-Nutzung** | Jeder Code wird nach Verwendung als `used` markiert. Kein Replay. |
| **Erzwungene Re-Registrierung** | Nach Recovery-Code-Login MUSS der User eine neue primäre Auth-Methode registrieren (Passkey oder TOTP). |
| **Regenerierung** | User kann jederzeit alle Codes neu generieren lassen → alte Codes werden sofort invalidiert. |

**Multi-Device Management:**

| Aspekt | Details |
|:---|:---|
| **Mehrere Passkeys** | Ein User kann mehrere Passkeys registrieren (z.B. Laptop + Phone + YubiKey). Empfohlen: mindestens 2. |
| **Device-Liste** | Settings-Seite zeigt alle registrierten Authenticator-Devices mit `credentialDeviceType`, `lastUsed`, `createdAt`. |
| **Device-Revocation** | User kann einzelne Devices entfernen. Letztes Device kann nur entfernt werden wenn mindestens 1 andere Auth-Methode aktiv ist. |
| **Admin-Override** | `admin`-Rolle kann für gesperrte User die Auth zurücksetzen (Audit-Log-Eintrag Pflicht). |

### 2.6 JWT Revocation (Emergency Kill Switch)

> **Problem:** JWTs sind stateless — ein ausgestelltes Token ist bis zum Ablauf gültig. Bei einem Trading-System können 15 Minuten mit kompromittiertem Token katastrophal sein.

**Lösung: Hybrid-Ansatz (Stateless + Lightweight Blocklist)**

| Mechanismus | Details |
|:---|:---|
| **Normal-Betrieb** | JWT wird stateless validiert (Signatur + Expiration). Kein DB-Lookup. Schnell. |
| **Emergency Revocation** | `jti` (JWT ID) wird in In-Memory-Blocklist geschrieben (Go `sync.Map`). Jede JWT-Validierung prüft zusätzlich die Blocklist. |
| **Blocklist-Größe** | Maximal `(aktive User) × (Token-Lifetime / Refresh-Interval)` Einträge. Bei 5 Usern und 15 min Tokens: <50 Einträge. Negligible Memory. |
| **Blocklist-Cleanup** | Einträge werden automatisch entfernt wenn `exp` des geblocklisten Tokens erreicht ist. Kein unbegrenztes Wachstum. |
| **Trigger** | 1) Admin revoked User-Session. 2) Anomalie erkannt (Sek. 11). 3) User ändert Rolle. 4) User ändert Passwort/Auth-Methode. |
| **Refresh Token Revocation** | Zusätzlich: Alle Refresh Tokens des Users in DB als `revoked` markieren. Verhindert Re-Authentifizierung. |
| **Sofortwirkung** | Bei Rolle-Änderung: altes JWT wird geblocklisted + neues JWT mit neuer Rolle ausgestellt. Kein 15-Minuten-Delay. |

**Revocation Flow:**

```
Admin/System erkennt Kompromiss
    │
    ├─ 1. Access Token JTI → Go Blocklist (sofort, In-Memory)
    ├─ 2. Alle Refresh Tokens des Users → DB: revoked=true
    ├─ 3. Audit-Log: { action: "SESSION_REVOKED", userId, reason, by }
    │
    ▼
Nächster Request mit altem JWT:
    Go Gateway → Blocklist-Check → JTI gefunden → 401 Unauthorized
    Client → Refresh-Versuch → DB: Token revoked → 401
Client → Redirect zu Login
```

**Implementierungsstand (22. Feb 2026, Codex — Scaffold):**

- Go-Gateway JWT-Middleware prueft bereits `jti` gegen eine In-Memory-Revocation-Blocklist (expiry-aware Cleanup bei Lookup).
- Transitional Admin-Endpoint im Go-Gateway vorhanden: `POST /api/v1/auth/revocations/jti` (schreibt `jti` in die In-Memory-Blocklist).
- Damit ist der technische Hook fuer Sofort-Sperrung auf Access-Token-Ebene vorhanden.
- Noch offen fuer SOLL-Zustand:
  - Admin-/System-Trigger, der `jti` dynamisch in die Blocklist schreibt
  - Persistente Audit-Logs fuer Revocation-Events
  - Gemeinsamer Flow mit Refresh-Token-Revocation (DB)

---

## 3. Schicht 2: Go Gateway → GCT (Service-to-Service)

### 3.1 IST-Zustand (GCT Auth Mechanismus)

| Aspekt | Details | Quellcode |
|:---|:---|:---|
| **gRPC Auth (9052)** | Basic Auth in gRPC Metadata. Jeder RPC-Call einzeln validiert. | `engine/rpcserver.go` → `authenticateClient()` |
| **JSON-RPC Proxy (9053)** | HTTP Basic Auth, gleiche Credentials. | `engine/rpcserver.go` → `authClient()` |
| **TLS** | Self-signed ECDSA P256, 1 Jahr. Auto-generiert wenn fehlend. | `engine/helpers.go` → `CheckCerts()`, `genCert()` |
| **Defaults** | `username: "admin"`, `password: "Password"` | `config/config_types.go` Zeile 72-73 |
| **Unser Gateway** | `GCT_USERNAME`/`GCT_PASSWORD` aus `go-backend/.env`. Default: `"replace-me"`. | `internal/app/wiring.go` Zeile 36-37 |
| **InsecureSkipVerify** | Konfigurierbar via `GCT_JSONRPC_INSECURE_TLS`. | `internal/app/wiring.go` Zeile 39 |
| **Audit** | Failed Auth → App-Log (IP + Path). Kein Audit-DB-Eintrag. | `engine/rpcserver.go` → `log.Warnf()` |
| **Rate Limiting** | Keines auf RPC-Ebene. | -- |
| **IP Whitelist** | Keine. | -- |

### 3.2 SOLL-Zustand (Härtung)

| Maßnahme | Priorität | Details |
|:---|:---|:---|
| **Starke Credentials** | KRITISCH | `GCT_USERNAME` und `GCT_PASSWORD` in `go-backend/.env` auf starke, generierte Werte setzen. Mindestens 32 Zeichen, zufällig. Müssen mit GCT `config.json` `remoteControl` übereinstimmen. |
| **TLS verifizieren** | HOCH | `GCT_JSONRPC_INSECURE_TLS=false` in Prod. Eigene CA oder Certificate Pinning. Self-signed Certs sind OK wenn der Fingerprint in Go Gateway gepinnt wird. |
| **Network Isolation** | HOCH | GCT `listenAddress: "127.0.0.1:9052"` (nur localhost). Bereits Standard, aber verifizieren. Von außen darf GCT nicht erreichbar sein. |
| **Go-seitiges Rate Limiting** | HOCH | Go Gateway begrenzt GCT-Requests auf **2 Order-Requests/min** bevor sie an GCT weitergeleitet werden. Schutz falls User-Auth kompromittiert. |
| **Audit-Log in Go** | HOCH | Da GCT nur 1 Service-Account kennt (keine User-Info), loggt **Go Gateway** welcher User welche GCT-Aktion ausgelöst hat. Schema: `{ userId, action, symbol, amount, gctEndpoint, correlationId, timestamp }`. In Datenbank, nicht nur File. **SQLite-Limitation:** SQLite ist mittelfristig die DB. WAL-Mode aktivieren für concurrent reads während writes. Zusätzlich: Append-Only JSON-Log als Backup (`audit-log-YYYY-MM.jsonl`), damit bei DB-Korruption kein Audit-Verlust entsteht. Langfristig: Migration auf PostgreSQL evaluieren wenn Audit-Volumen oder Compliance-Anforderungen steigen. |
| **Request-Scope prüfen** | MITTEL | Go Gateway erlaubt nur definierte GCT-Endpoints weiterzuleiten. Kein Wildcard-Proxy. Whitelist: `/GetPortfolioSummary`, `/GetAccountInfo`, `/SubmitOrder`, etc. |

### 3.3 GCT Auth Flow (Detailliert)

```
User (Browser) klickt "Buy 0.1 BTC"
    │
    ▼
Next.js POST /api/v1/portfolio/order
    │  JWT Cookie wird mitgesendet
    ▼
Go Gateway (9060)
    ├─ 1. JWT validieren (Signatur, Expiration)
    ├─ 2. Rolle prüfen: role == "trader"? Sonst → 403
    ├─ 3. Rate Limit prüfen: <2 Orders/min? Sonst → 429
    ├─ 4. Audit-Log: { userId: "u123", action: "SubmitOrder",
    │     symbol: "BTC/USD", amount: 0.1, timestamp: "..." }
    ├─ 5. Correlation ID an GCT-Request anhängen
    │
    ▼
GCT gRPC (9052) via Basic Auth + TLS
    ├─ Authentifiziert: Service-Account OK
    ├─ Führt Order aus via Exchange API
    │
    ▼
Binance API
    ├─ API Key (nur Trading, KEIN Withdrawal)
    ├─ IP Whitelist: nur unsere Server-IP
    ├─ Order wird ausgeführt
    │
    ▼ (Response-Kette zurück)
Go Gateway → Audit-Log Update (Ergebnis) → Next.js → Browser
```

---

## 4. Schicht 3: Exchange API Keys (Das Geld)

### 4.1 Wo Keys leben

| Ort | Was | Zugriff |
|:---|:---|:---|
| **GCT `config.json`** | Exchange API Keys (`key`, `secret`, `clientID`, `pemKey`, `otpSecret`, `tradePassword`, `pin`) | Nur GCT-Prozess. Datei-Permissions: `600` (Owner-only). Optional AES-GCM verschlüsselt. |
| **`go-backend/.env`** | `GCT_USERNAME`, `GCT_PASSWORD` (Service-Account für GCT RPC) | Nur Go-Gateway-Prozess. |
| **Root `.env`** | `NEXTAUTH_SECRET`, `DATABASE_URL` | Nur Next.js-Prozess. |
| **NIEMALS** | Exchange Keys in `.env`, Go-Code, Logs, API-Responses, Frontend | -- |

### 4.2 GCT Config Encryption

GCT unterstützt Verschlüsselung der gesamten Config-Datei (inkl. Exchange Keys) at-rest:

| Aspekt | Details |
|:---|:---|
| **Algorithmus** | AES-256-GCM (Modern, authentifiziert). Legacy: AES-CFB (wird automatisch migriert). |
| **Key Derivation** | `scrypt` (CPU+Memory-hard, resistent gegen Brute-Force). |
| **Aktivierung** | `"encryptConfig": 1` in `config.json`. Beim Start fragt GCT nach Encryption-Key. |
| **Quellcode** | `config/config_encryption.go` → `EncryptConfigData()`, `DecryptConfigData()` |
| **Empfehlung** | **Aktivieren.** Encryption-Key als Umgebungsvariable oder interaktiv beim Start eingeben, nicht in Datei speichern. |

### 4.3 Exchange-seitige Absicherung (SOTA 2025-2026)

> Quelle: Binance API Security Docs, RFC 9700, API Stronghold 2025 Research

| Maßnahme | Priorität | Details |
|:---|:---|:---|
| **Credential Scoping** | **KRITISCH** | Exchange API Key **nur mit Trading-Permission** erstellen. **Withdrawal-Permission DEAKTIVIEREN.** Das ist der wichtigste einzelne Schutz: selbst bei vollem System-Kompromiss können keine Funds abgezogen werden. |
| **IP Whitelist** | **KRITISCH** | Auf Exchange-Seite (Binance/Kraken API Settings): nur die Server-IP erlauben. Selbst mit geleaktem Key + Secret kann niemand von einem anderen Server handeln. |
| **Withdrawal Address Whitelist** | HOCH | GCT's eingebaute Address Whitelist aktivieren (`portfolio/withdraw` → `IsWhiteListed()`). Nur vordefinierte Adressen erlaubt. |
| **Key Rotation** | HOCH | Exchange API Keys alle 90 Tage rotieren. Neuen Key auf Exchange generieren → in GCT Config updaten → alten Key revoken. Go Gateway warnt wenn Key-Alter >80 Tage. |
| **OTP/2FA auf Exchange** | HOCH | Exchange-Account mit Hardware-2FA (YubiKey) sichern. Nicht SMS-basiert. |
| **Monitoring** | MITTEL | Exchange-seitige Alerts aktivieren (Login von neuem Gerät, API-Nutzung, etc.). |
| **Keine Secrets in Logs** | KRITISCH | Go Gateway loggt niemals Exchange Keys, GCT Passwords, oder JWT Secrets. Log-Sanitization als Regel. |

---

## 5. Bekannte Lücken und Risiken

### 5.1 Aktuelle Lücken (IST-Zustand)

> **Prinzip:** Maßnahmen die <5 Minuten dauern und kritisches Risiko eliminieren werden SOFORT umgesetzt, nicht auf Phase 6 geschoben. Echtes Geld wartet nicht auf Sprint-Planung.

| Lücke | Risiko | Schwere | Fix in Phase | Begründung Timing |
|:---|:---|:---|:---|:---|
| **GCT Default Credentials** | `admin`/`Password` = sofortiger Zugriff für jeden der GCT kennt | KRITISCH | **Phase 0 (SOFORT)** | 5 Minuten Arbeit: Starkes Passwort generieren, in `.env` + GCT Config setzen. |
| **Keine Credential Scoping auf Exchange** | API Key mit Withdrawal = Funds weg | KRITISCH | **Phase 0 (SOFORT)** | 5 Minuten auf Exchange-Webseite: Neuen Key nur mit Trading-Permission erstellen. |
| **Keine IP Whitelist auf Exchange** | Geleakter Key = Trading von überall | KRITISCH | **Phase 0 (SOFORT)** | 5 Minuten auf Exchange-Webseite: Server-IP eintragen. |
| **Exchange Keys ggf. unverschlüsselt** | File-Access = Key-Access | HOCH | **Phase 0** | GCT Config Encryption aktivieren (`encryptConfig: 1`). |
| **`InsecureSkipVerifyTLS` möglich** | MitM zwischen Go und GCT | HOCH | **Phase 0** | `GCT_JSONRPC_INSECURE_TLS=false` in `.env` setzen. |
| **Keine User-Auth** | Jeder kann alles aufrufen | KRITISCH | Phase 6 | Erfordert next-auth Setup, Prisma Schema, Go Middleware. Nicht trivial. |
| **Kein Rate Limit auf GCT-Orders** | Endlose Orders wenn Auth kompromittiert | HOCH | Phase 6 | Erfordert Go Middleware-Implementierung. |
| **Kein Audit-Log für GCT-Aktionen** | Keine Nachvollziehbarkeit wer was gehandelt hat | HOCH | Phase 6 | Erfordert DB-Schema + Go Middleware. |
| **Provider Keys im Frontend `.env`** | Keys im Browser-Prozess sichtbar | MITTEL | Phase 0 (teilweise), Phase 6 (abschließend) | Phase 0: Keys in Go-Backend verschieben. Phase 6: Restliche Bereinigung. |
| **Kein CSP/CORS** | XSS-Risiko | MITTEL | Phase 6 | Erfordert Header-Middleware in Go. |
| **Kein Monitoring/Alerting** | Kompromiss bleibt unbemerkt | HOCH | Phase 6 | Siehe Sek. 11 (Monitoring & Alerting). |
| **Kein Incident Response Plan** | Keine Prozedur bei Kompromiss | HOCH | **Phase 0 (Dokument)** | Sek. 10 definiert den Plan. Kein Code nötig, nur Dokumentation. |
| **Secrets in `.env`-Klartext** | Kein Schutz jenseits File-Permissions | MITTEL | Phase 6 (Langfristig) | Siehe Sek. 12 (Secrets Management). Kurzfristig: File-Permissions + `.gitignore`. |

### 5.2 Risiken die NICHT durch Software gelöst werden

| Risiko | Erklärung | Mitigation |
|:---|:---|:---|
| **Server-Kompromiss** | Root-Zugriff = alles lesbar (Config, Keys, DB) | OS-Härtung, Firewall, SSH-Key-Only, regelmäßige Updates. Nicht unser Scope aber wichtig. |
| **Supply Chain Attack** | Bösartige npm/pip/cargo Dependency | `npm audit`, `pip audit`, Dependabot. Lock-Files committen. |
| **Social Engineering** | Exchange-Account-Takeover über Support-Ticket | Exchange 2FA mit Hardware-Key. Withdrawal Address Whitelist. |
| **Insider Threat** | Entwickler mit Zugriff auf Prod-Config | Principle of Least Privilege. Audit-Logs. Key Rotation nach Team-Änderungen. |

---

## 6. Implementation-Reihenfolge

### Phase 0: Sofort-Maßnahmen (kein Code, kein Sprint — JETZT)

> Diese Items erfordern keinen Code, keinen Sprint, keine Planung. Sie eliminieren die kritischsten Risiken in Minuten.

- [ ] **0.1** GCT Credentials härten: `openssl rand -base64 32` → `GCT_USERNAME` und `GCT_PASSWORD` in `go-backend/.env` setzen. Gleiche Werte in GCT `config.json` `remoteControl` übernehmen.
- [ ] **0.2** Exchange API Keys: Auf Exchange-Webseite neuen API Key erstellen mit **nur Trading-Permission**. Withdrawal-Permission DEAKTIVIEREN. Alten Key mit Withdrawal-Permission revoken.
- [ ] **0.3** Exchange IP Whitelist: Auf Exchange-Webseite die Server-IP als einzige erlaubte IP eintragen.
- [ ] **0.4** TLS Verify: `GCT_JSONRPC_INSECURE_TLS=false` in `go-backend/.env` setzen.
- [ ] **0.5** GCT Config Encryption: `encryptConfig: 1` in GCT Config setzen. Encryption-Key als Umgebungsvariable.
- [ ] **0.6** `.env`-Dateien: Verifizieren dass `go-backend/.env` und `.env` in `.gitignore` stehen. File-Permissions `600`.
- [ ] **0.7** Incident Response Plan dokumentieren (Sek. 10 dieses Dokuments).

### Phase 6: Auth + Security Hardening (Sprint-basiert)

Phase 6 in `EXECUTION_PLAN.md` wird in dieser Reihenfolge umgesetzt. Voraussetzung: Phase 0 Sofort-Maßnahmen abgeschlossen.

### Sprint 6.1: Fundament (User Auth + Recovery + Client-Side Encryption)
1. Prisma Schema erweitern: `Authenticator`, `TotpDevice`, `RecoveryCode`, `RefreshToken`, `UserConsent`, `KGEncryptionKey` Tabellen
2. next-auth v5 mit Passkey Provider konfigurieren
3. TOTP-Fallback implementieren (`otplib` + QR-Code-Generierung)
4. Recovery Codes generieren und sicher anzeigen (einmalig, dann nur Hashes in DB)
5. Login/Register Flow mit Fallback-Kette (Sek. 2.5)
6. JWT in httpOnly Cookie mit `jti` Claim
7. Refresh Token Rotation mit Replay-Detection (Sek. 2.2)
8. Protected Routes in Next.js
9. Multi-Device Management UI (Settings-Seite: Devices auflisten, entfernen)
10. PRF-Salt in `Authenticator`-Tabelle speichern (ein Salt pro Passkey) (Sek. 13)
11. Server-Fallback KG-Encryption-Key generieren und in `KGEncryptionKey` speichern (Sek. 13.4)
12. `GET /api/auth/kg-key` Endpoint fuer Fallback-Key-Auslieferung (AES-KW wrapped) (Sek. 13.4)
13. Frontend: `KGEncryptionLayer` Wrapper um KuzuDB WASM (encrypt/decrypt) (Sek. 13.2)
14. Frontend: PRF-Detection + Fallback-Logik beim Login (Sek. 13.3, 13.4)
15. Server-Backup: Verschluesselte KG-Kopie bei Sync (Sek. 13.6)

### Sprint 6.2: Go Gateway Hardening
10. JWT Validation Middleware in Go (Signatur + Expiration + `jti`-Blocklist)
11. JWT Revocation Blocklist (In-Memory `sync.Map` mit Auto-Cleanup, Sek. 2.6)
12. RBAC Middleware (Rolle aus JWT Claims prüfen)
13. Rate Limiting pro Endpoint-Gruppe (inkl. 2 req/min für GCT-Orders)
14. CSP + CORS Headers
15. Correlation ID in allen Services

### Sprint 6.3: GCT Auth Integration
16. GCT Endpoint Whitelist in Go (nur erlaubte RPC-Methods, kein Wildcard-Proxy)
17. Audit-Log in DB (User → GCT Action Mapping)
18. GCT Withdrawal Address Whitelist konfigurieren
19. Key-Rotation-Check implementieren (Warnung bei >80 Tage)

### Sprint 6.4: Monitoring & Alerting
20. Failed Auth Tracking + Threshold-Alerting (Sek. 11)
21. Order-Anomalie-Detection (ungewöhnliche Amounts/Frequenz)
22. GCT Health-Monitoring (Response-Time, Connection-State)
23. Log-Sanitization: Keine Secrets in Logs (Structured JSON Logging mit Field-Level Redaction)

### Sprint 6.5: Cleanup & Verify
24. Alle Provider Keys aus root `.env` entfernen (in Go-Backend)
25. Consent-System: `UserConsent` Tabelle + Server-Side Lookup (Sek. 9.1)
26. Security Audit Checklist durchgehen
27. Penetration Test: Alle Endpoints ohne Auth aufrufen → müssen 401/403 returnen

---

## 7. Technologie-Entscheidungen

| Frage | Entscheidung | Begründung |
|:---|:---|:---|
| **Warum Go für Auth, nicht Rust/Java?** | Go's `crypto/*` ist production-grade (Kubernetes, Docker, Cloudflare nutzen es). Auth ist kein Memory-Safety-Problem. Rust/Java wäre massiver Overhead für einen Auth-Layer. | Pragmatisch: Go ist bereits unser Gateway. Kein neuer Service nur für Auth. |
| **Warum WebAuthn als Primär-Auth?** | Passwortlos = kein Credential Stuffing, kein Phishing, kein Password-Reuse. FIDO2-Standard. Aber: Für 1-5 User ist der Hauptnutzen UX (kein Passwort merken), nicht Skalierungs-Sicherheit. Deshalb mit TOTP-Fallback + Recovery Codes (Sek. 2.5) für Robustheit. | OAuth2 als dritter Fallback. WebAuthn allein ohne Recovery-Konzept wäre fahrlässig. |
| **Warum JWT statt Session-Store?** | Go Gateway kann JWT im Normal-Betrieb ohne DB-Lookup validieren. Kein Redis nötig. Aber: Hybrid-Ansatz mit In-Memory-Blocklist für Emergency Revocation (Sek. 2.6). Bei 1-5 Usern wäre ein Session-Store gleichwertig — JWT gewählt wegen Konsistenz mit next-auth. | Short-lived Tokens (15 min) + Refresh-Rotation + Replay-Detection (Sek. 2.2). |
| **Warum kein separater Auth-Service?** | 1 User. Später 3-5 User. Ein Auth-Service (Keycloak, Auth0) wäre Overkill. next-auth in Next.js reicht. | Kann später zu eigenem Service extrahiert werden wenn nötig. |
| **Warum Audit in Go, nicht in GCT?** | GCT kennt nur 1 Service-Account. GCT weiß nicht welcher User die Aktion ausgelöst hat. Go Gateway hat den JWT mit User-ID → Go loggt den Audit. | GCT's eingebauter Audit-Mechanismus ergänzt (nicht ersetzt) unseren Go-Audit. |

---

## 8. MCP (Model Context Protocol) — Sicherheit bei optionaler Aktivierung

> **Kontext:** MCP ermöglicht AI-Agents (Cursor, Claude) Zugriff auf Go Gateway Tools. Siehe `docs/GO_GATEWAY.md` Sek. 2 für Use Cases. **MCP ist by default unsicher** — kein Auth, kein RBAC, kein Audit.

### Risiken ohne Härtung

| Risiko | Beschreibung |
|:---|:---|
| **Unbeschränkter Zugriff** | Jeder Prozess mit MCP-Connection kann alle Tools aufrufen |
| **Kein User-Kontext** | MCP kennt keine JWT, keine Rollen — Agent = anonym |
| **Portfolio-Exposition** | `get_portfolio_summary` ohne Auth = sensible Daten lesbar |
| **Rate-Limit-Bypass** | MCP umgeht HTTP-Rate-Limits wenn nicht explizit implementiert |

### Anforderungen wenn MCP aktiviert wird

| Maßnahme | Priorität | Details |
|:---|:---|:---|
| **MCP als Sub-Process** | KRITISCH | MCP-Server läuft nur als Child des Go Gateways, nicht eigenständig. Gateway proxied alle Tool-Calls. |
| **JWT-Validierung** | KRITISCH | Jeder MCP-Tool-Call muss ein gültiges JWT (oder Session-Token) übergeben. Gateway validiert vor Weiterleitung. |
| **RBAC auf Tools** | KRITISCH | Nur `viewer`-Level Tools exponiert: `get_quote`, `get_ohlcv`, `get_news`, `get_geopolitical_events`. **Kein** `get_portfolio`, **kein** Order-Tools. |
| **Rate Limiting** | HOCH | Pro Agent-Session: max 10 Tool-Calls/min. Strikter als REST (Agent kann viele parallele Calls machen). |
| **Audit-Log** | HOCH | Jeder MCP-Call: `{ agentId, tool, userId?, timestamp }` in DB. |
| **Network Isolation** | HOCH | MCP-Server nur auf `127.0.0.1`. Kein externer Zugriff. |

### Empfehlung

MCP **nicht aktivieren** bis Phase 6 (Auth + Security Hardening) vollständig abgeschlossen ist. Phase 0 Sofort-Maßnahmen (Sek. 6) sind dafür **nicht ausreichend** — MCP erfordert die volle Auth-Pipeline (JWT, RBAC, Rate Limiting). Wenn aktiviert: zuerst alle obigen Maßnahmen umsetzen. Siehe `docs/GO_GATEWAY.md` für Details.

### 8.1 WebMCP — Sicherheit bei Frontend-Tool-Exposition

> **Kontext:** WebMCP ([W3C Community Draft](https://webmachinelearning.github.io/webmcp/)) erlaubt dem Frontend, Tools direkt im Browser via `navigator.modelContext.registerTool()` zu registrieren. Der Agent ruft diese Tools auf wie einen normalen MCP-Server. Shipped in Chrome 146 (Canary). Siehe `docs/AGENT_TOOLS.md` Sek. 3 fuer Details.
>
> **Fundamentaler Unterschied zu Chrome DevTools MCP:** WebMCP Tools laufen im JS-Context der Seite (Browser), nicht in einem separaten Server-Prozess. Die Tools erben automatisch die User-Session, Cookies und CORS-Policies.

#### Risiken

| Risiko | Beschreibung | Schwere |
|:---|:---|:---|
| **XSS → Tool-Zugriff** | Bei einer XSS-Schwachstelle kann Angreifer-JS alle registrierten WebMCP-Tools aufrufen — mit der vollen User-Session. Das ist der gravierendste Angriffsvektor. | KRITISCH |
| **Tool-Enumeration** | Ein Angreifer (oder malicious Extension) kann `navigator.modelContext` abfragen um alle registrierten Tools zu entdecken → Information Disclosure ueber System-Capabilities. | MITTEL |
| **Sensitive Data in Tool-Responses** | Tools wie `get_portfolio_summary` oder `get_chart_state` koennten sensitive Daten zurueckgeben die im Browser-Memory verbleiben. | HOCH |
| **Keine native Audit-Ebene** | WebMCP hat (Stand W3C Draft Feb 2026) keinen eingebauten Audit-Trail. Tool-Calls werden nicht automatisch geloggt. | HOCH |
| **Malicious Browser Extension** | Extensions mit `tabs`/`scripting`-Permission koennen Tools registrieren oder bestehende Tool-Handler ueberschreiben. | HOCH |

#### Haertungs-Massnahmen

| Massnahme | Prioritaet | Details |
|:---|:---|:---|
| **CSP haerten** | KRITISCH | Strenge Content Security Policy (Sek. 5.1) verhindert Inline-Script-Injection. CSP ist die primaere XSS-Barriere und damit der wichtigste Schutz fuer WebMCP-Tools. |
| **Tool-Call Interception + Logging** | KRITISCH | Jeder `registerTool()`-Handler wird mit einem Wrapper versehen der vor Ausfuehrung loggt: `{ tool, args, timestamp, sessionId }`. Logs werden an Backend gesendet (Audit-Log, Sek. 9.3). |
| **Tool-Scoping nach Auth-State** | KRITISCH | Tools werden erst registriert NACHDEM der User authentifiziert ist. Bei Logout: alle Tools de-registrieren. Sensitive Tools (`get_portfolio_summary`, Order-Tools) nur bei Rolle `trader`. |
| **Rate Limiting im Handler** | HOCH | Jeder Tool-Handler prueft: max N Calls/min. Ueberschreitung → Tool gibt Fehler zurueck + Alert. Verhindert dass ein kompromittierter Agent das Frontend spammed. |
| **Input Validation** | HOCH | Alle `args` in Tool-Handlern werden gegen das JSON Schema validiert bevor sie ausgefuehrt werden. Keine beliebigen Strings an DOM-APIs weiterreichen. |
| **Keine Mutation ohne Bestaetigung** | HOCH | Write-Tools (Order platzieren, Alert setzen) fordern User-Bestaetigung an bevor sie ausgefuehrt werden (Browser-native `confirm()` oder Custom-Modal). Agent kann nicht still Orders platzieren. |
| **Tool-Integrity-Check** | MITTEL | Beim App-Start: Pruefen ob `navigator.modelContext` manipuliert wurde (Prototype Pollution Detection). Hash der registrierten Tool-Liste vergleichen mit erwartetem Wert. |
| **Sensitive Data Redaction** | MITTEL | Tool-Responses die an den Agent gehen, duerfen keine vollen API-Keys, Passwords oder vollstaendige Portfolio-Werte enthalten. Nur aggregierte/redacted Daten. |

#### Verbindung zu bestehenden Sicherheitsschichten

| Bestehende Massnahme (Sek. 1-7) | Wie sie WebMCP schuetzt |
|:---|:---|
| **JWT + httpOnly Cookie (Sek. 2.2)** | WebMCP Tools erben die Session — aber der Agent kann den JWT nicht lesen (httpOnly). Tool-Calls sind implizit authentifiziert. |
| **RBAC (Sek. 2.3)** | Tool-Registration ist Rollen-abhaengig: `viewer`-Tools fuer alle, `trader`-Tools nur nach Rollenpruefung. |
| **CSP + CORS (Sek. 5)** | XSS-Schutz = WebMCP-Schutz. Ohne XSS kann kein Angreifer Tools aufrufen. |
| **Audit-Log (Sek. 9.3)** | WebMCP Tool-Call Logs werden in dasselbe Audit-System geschrieben wie alle anderen Aktionen. |
| **Monitoring (Sek. 11)** | Ungewoehnliche Tool-Call-Patterns (z.B. 100 `get_portfolio_summary` in 1 min) triggern SEV-3 Alert. |

#### Empfehlung

WebMCP-Tools koennen **vor Phase 6** aktiviert werden — aber NUR read-only Tools (`get_chart_state`, `get_geomap_focus`) die keine sensitiven Daten exponieren. Write-Tools und Portfolio-Tools erst nach vollstaendiger Auth-Pipeline (Phase 6). Siehe `docs/AGENT_TOOLS.md` Sek. 3 + 4.2 fuer die vollstaendige Entscheidungsmatrix.

---

## 9. Datenschutz und Consent — Privacy-Leitlinien

> **Status:** Architektur-Leitlinie. Implementierung beginnt mit Sprint 6.1 (User Auth UI) und Sprint 6.5 (Consent-System).  
> **Detail-Architektur:** [`Advanced-architecture-for-the-future.md`](../Advanced-architecture-for-the-future.md) Sek. 8a (Privacy-Preserving ML Patterns).  
> **Scope:** Dieses System verarbeitet Finanzdaten, User-Feedback und LLM-Inputs. Keine biometrischen Daten, keine Emotionserkennung.

### 9.1 Granularer Consent (Server-Side, NICHT im JWT)

**Prinzip:** Kein pauschaler "Ich stimme allem zu"-Button. Differenzierte Consent-Abfragen nach Datentyp.

**Architektur-Entscheidung:** Consent wird in der `UserConsent`-Tabelle (Prisma) gespeichert und bei Bedarf server-side geprüft. **Nicht im JWT**, weil:
- Consent-Änderungen sofort wirken müssen (GDPR Art. 7(3): Widerruf muss genauso einfach sein wie Erteilung)
- JWTs sind immutable — alter Token trägt alten Consent bis zum Ablauf
- Bei 1-5 Usern ist ein DB-Lookup (~0.1ms bei SQLite) vernachlässigbar

**`UserConsent` Prisma Schema:**

```prisma
model UserConsent {
  id            String   @id @default(cuid())
  userId        String   @unique
  consentPaste  Boolean  @default(false)    // Opt-In
  consentTrain  Boolean  @default(true)     // Opt-Out
  consentChat   Boolean  @default(false)    // Opt-In
  consentStats  Boolean  @default(true)     // Opt-Out
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
}
```

| Consent-Bereich | Default | Abwaehlbar? | Erklaerung fuer den User |
|---|---|---|---|
| Marktdaten-Verarbeitung (OHLCV → Indikatoren) | ON | Nein (Kernfunktion) | "Wir berechnen Indikatoren aus oeffentlichen Marktdaten" |
| Copy/Paste LLM-Verarbeitung | **OFF** | Ja (Opt-In) | "Eingefuegte Texte werden durch KI analysiert. Originaltexte werden nach Verarbeitung geloescht" |
| Feedback fuer ML-Training | ON | Ja (Opt-Out) | "Deine Signal/Noise-Bewertungen helfen dem System besser zu werden" |
| Chat-Export Import | **OFF** | Ja (Opt-In) | "Importierte Chatverlaeufe werden durch KI analysiert und danach geloescht" |
| Anonymisierte Nutzungsstatistiken | ON | Ja (Opt-Out) | "Aggregierte, nicht-persoenliche Nutzungsdaten fuer Produktverbesserung" |

**UI-Implementierung (Sprint 6.5):**
- Settings-Seite mit Toggle pro Consent-Bereich
- Erstmaliger Login: Privacy-Overlay mit verstaendlicher Erklaerung pro Punkt (kein 50-seitiges Dokument)
- Jederzeit aenderbar, **Aenderung wirkt sofort** (DB-Update → naechster Request prueft neuen Status)
- Go Gateway: Bei LLM-Endpoints (`/ingest/classify`, `/signals/*`) wird `UserConsent` geladen und gegen den Request-Typ geprueft. Fehlender Consent → 403 mit erklaerung.

### 9.2 Data Minimization

**Regel:** Speichere nur was funktional noetig ist, nicht "weil wir es koennen".

| Daten | Was gespeichert wird | Was NICHT gespeichert wird | Loeschfrist |
|---|---|---|---|
| UIL Raw Content | Summary + Entities + Confidence (LLM-Output) | Originaler Volltext (Transcript, Reddit-Post) | Original: sofort nach Processing |
| News | URL + Title + Snippet (<200 Zeichen) + Hash | Volltext des Artikels | Metadata: unbegrenzt |
| Analyst-Feedback | Decision + Override-Reason + Timestamp | Browserseitige Interaktion (Mausbewegungen, Verweildauer) | Unbegrenzt (Training) |
| Trading-Aktionen | Order-Audit-Log (Symbol, Amount, Timestamp, UserId) | Browsing-Verhalten auf der Plattform | 1 Jahr (regulatorisch) |
| Session-Daten | JWT Claims + Last-Login + IP (gehasht) | Vollstaendige Browser-Fingerprints | 90 Tage |

### 9.3 Audit-Log Privacy

Das Audit-Log muss selbst privacy-konform sein:

| Log-Feld | Gespeichert | NICHT gespeichert |
|---|---|---|
| Wer | UserId (UUID) | Kein Klarname im Log |
| Was | Aktions-Typ (`ORDER_PLACED`, `SIGNAL_OVERRIDE`, `LOGIN`) | Keine Portfolio-Werte, keine Betraege |
| Wann | Timestamp (UTC) | -- |
| Woher | IP-Hash (SHA256, nicht reversibel) | Keine Klartext-IP |
| Ergebnis | Success/Failure + Error-Code | Keine vollstaendigen Error-Messages mit User-Daten |

**GDPR Art. 17 (Right to Erasure):** Bei Account-Loeschung werden Audit-Logs anonymisiert (UserId → `DELETED_USER_<hash>`), nicht geloescht, um regulatorische Anforderungen zu erfuellen.

### 9.4 Verbindung zu Zero Trust (Sek. 1-8)

| Bestehendes Zero-Trust-Prinzip | Privacy-Ergaenzung |
|---|---|
| "Never trust, always verify" (JWT, RBAC) | Services bekommen nur Daten die sie laut Consent-Policy (DB-Lookup) verarbeiten duerfen |
| "Least Privilege" (Rollen) | LLM-Pipeline prueft `UserConsent.consentPaste` bevor sie User-Input verarbeitet |
| "Audit everything" (Audit-Log) | Audit-Logs selbst sind privacy-geschuetzt (Sek. 9.3) |
| "Defense in Depth" (3 Schichten) | Data Minimization als vierte, orthogonale Schutz-Dimension |

---

## 10. Incident Response Plan

> **Zweck:** Definiert was passiert WENN (nicht falls) ein Sicherheitsvorfall eintritt. Bei einem System mit echtem Geld muss die Reaktion vordefiniert sein — im Ernstfall bleibt keine Zeit für Planung.

### 10.1 Severity-Stufen

| Stufe | Definition | Beispiel | Max. Reaktionszeit |
|:---|:---|:---|:---|
| **SEV-1 (Kritisch)** | Funds in Gefahr, aktiver Zugriff durch Unbefugte | Exchange Key geleakt, unbekannte Orders | **Sofort** (alles stoppen) |
| **SEV-2 (Hoch)** | System-Kompromiss ohne direkten Fund-Zugriff | Server-Root-Zugriff, GCT-Credentials geleakt | **<1 Stunde** |
| **SEV-3 (Mittel)** | Auth-Anomalie ohne bestätigten Kompromiss | Brute-Force auf Login, ungewöhnliche API-Patterns | **<24 Stunden** |
| **SEV-4 (Niedrig)** | Potentielle Schwachstelle entdeckt | Dependency mit bekanntem CVE, Config-Fehler | **<1 Woche** |

### 10.2 SEV-1 Runbook: Exchange Key Kompromiss

```
SOFORT (Minuten 0-5):
  1. Exchange-Website öffnen → API Key DEAKTIVIEREN (nicht löschen — Audit-Trail)
  2. GCT stoppen: `Ctrl+C` oder `kill <pid>` (verhindert weitere Orders)
  3. Exchange: Alle offenen Orders canceln
  4. Exchange: Withdrawal-Sperre aktivieren (24h Cooldown auf den meisten Exchanges)

DANACH (Minuten 5-30):
  5. Exchange: Neuen API Key erstellen (nur Trading, IP Whitelist)
  6. GCT Config updaten mit neuem Key
  7. GCT Config Encryption Key rotieren
  8. Audit-Log prüfen: Alle Orders der letzten 24h reviewen
  9. Go Gateway Logs prüfen: Ungewöhnliche Requests?

NACHBEREITUNG (24h):
  10. Root Cause Analysis: Wie wurde der Key geleakt?
  11. Falls Server-Kompromiss → SEV-2 Runbook zusätzlich
  12. Dokumentation: Was ist passiert, was wurde getan, was wird geändert
```

### 10.3 SEV-2 Runbook: Server/GCT-Credentials Kompromiss

```
SOFORT:
  1. GCT stoppen
  2. Go Gateway stoppen
  3. GCT Credentials rotieren (neues Passwort, `go-backend/.env` + GCT Config)
  4. NEXTAUTH_SECRET rotieren (invalidiert alle JWTs sofort)
  5. Exchange API Keys rotieren (vorsichtshalber)

DANACH:
  6. Server-Zugang prüfen: SSH-Keys, autorisiertee Users, offene Ports
  7. OS-Level Audit: `last`, `auth.log`, unbekannte Prozesse
  8. Alle .env-Dateien auf Veränderungen prüfen
  9. Git-History prüfen: Wurden Secrets committed?
```

### 10.4 SEV-3 Runbook: Auth-Anomalie

```
  1. Betroffenen User-Account temporär sperren (JWT-Revocation, Sek. 2.6)
  2. Audit-Log analysieren: Welche Endpoints wurden aufgerufen?
  3. IP-Analyse: Bekannte IP oder neue Quelle?
  4. Falls bestätigt → Eskalation zu SEV-2
  5. Falls False Positive → Account entsperren, Schwellwerte anpassen
```

---

## 11. Monitoring & Alerting

> **Zweck:** Ein Security-System ohne Monitoring ist blind. Angriffe werden nur erkannt wenn aktiv danach geschaut wird.

### 11.1 Auth Monitoring

| Metrik | Schwellwert | Aktion |
|:---|:---|:---|
| **Failed Login Attempts** (pro IP) | >5 in 10 min | IP temporär blocken (15 min). Alert an Admin. |
| **Failed Login Attempts** (pro User) | >3 in 5 min | Account temporär sperren (30 min). Alert an Admin. |
| **JWT Validation Failures** | >10 in 1 min | Möglicher Token-Brute-Force. Rate Limit verschärfen. |
| **Refresh Token Replay** | Jedes Auftreten | **Sofort alle Tokens des Users invalidieren** (Token Family Revocation). SEV-3 Alert. |
| **Rolle-Escalation-Versuch** | Jedes Auftreten (JWT-Claim manipuliert) | Request blocken. SEV-2 Alert. IP loggen. |

### 11.2 Trading Monitoring

| Metrik | Schwellwert | Aktion |
|:---|:---|:---|
| **Order-Frequenz** | >2/min (bereits Rate-Limited) | Log + Alert wenn Rate Limit wiederholt getriggert wird (>5x in 1h). |
| **Order-Volumen** | >10x des historischen Durchschnitts | Alert an Admin. Order wird NICHT automatisch geblockt (könnte legitim sein), aber Audit-Eintrag mit Flag. |
| **Neues Trading-Pair** | Erstes Mal ein bestimmtes Pair gehandelt | Info-Alert (kein Block). Hilft bei Anomalie-Erkennung. |
| **GCT Connection Loss** | Timeout >5s oder Connection Refused | SEV-2 Alert. Go Gateway gibt 503 zurück, keine Order-Retries. |

### 11.3 System Monitoring

| Metrik | Schwellwert | Aktion |
|:---|:---|:---|
| **GCT Response Time** | p95 >2s | Warnung. Mögliches Netzwerk-Problem oder Exchange-Throttling. |
| **Audit-Log Write Failure** | Jedes Auftreten | **GCT-Orders stoppen** bis Audit-Log wieder schreibbar. Keine ungeloggte Order darf durchgehen. |
| **SQLite DB-Größe** | >500 MB | Warnung. Retention-Policy prüfen, alte Daten archivieren. |
| **Certificate Expiry** | <30 Tage bis Ablauf | Alert. TLS-Cert für GCT-Verbindung erneuern. |
| **Exchange Key Alter** | >80 Tage | Warnung (bereits in Sek. 4.3). Bei >90 Tage: Täglicher Alert. |

### 11.4 Implementierung (Pragmatisch)

Kein Prometheus/Grafana für 1-5 User. Stattdessen:

| Komponente | Lösung |
|:---|:---|
| **Alert-Kanal** | Structured JSON Log → Go parst eigene Logs → bei Schwellwert-Überschreitung: Desktop-Notification (OS-native) + optionaler Webhook (Discord/Telegram). |
| **Metriken-Speicher** | SQLite-Tabelle `SecurityMetrics`: `{ metric, value, timestamp }`. Einfache Aggregation via SQL. |
| **Dashboard** | Frontend-Seite `/admin/security` (nur `admin`-Rolle): Letzte Auth-Events, aktive Sessions, Order-Historie, Alerts. |
| **Log-Rotation** | JSONL-Files: `logs/security-YYYY-MM.jsonl`. Retention: 12 Monate. Ältere Files komprimieren (gzip). |

---

## 12. Secrets Management

> **Zweck:** Definiert wo Secrets leben, wie sie geschützt sind, und was die Roadmap von `.env`-Files zu einer robusteren Lösung ist.

### 12.1 IST-Zustand (Pragmatisch, SQLite-Phase)

| Secret | Speicherort | Schutz | Risiko |
|:---|:---|:---|:---|
| `GCT_USERNAME`, `GCT_PASSWORD` | `go-backend/.env` | File-Permissions `600`, `.gitignore` | Klartext auf Disk. File-Access = Secret-Access. |
| `NEXTAUTH_SECRET` | `.env` | File-Permissions `600`, `.gitignore` | Klartext auf Disk. |
| `DATABASE_URL` | `.env` | File-Permissions `600`, `.gitignore` | SQLite-Pfad (weniger sensitiv). |
| Exchange API Keys | GCT `config.json` | AES-256-GCM Encryption (at-rest) via GCT | **Besser geschützt als die .env-Files.** |

### 12.2 Sofort-Maßnahmen (Phase 0)

| Maßnahme | Details |
|:---|:---|
| **`.gitignore` verifizieren** | `*.env`, `.env.*`, `config.json` müssen in `.gitignore` stehen. `git log --all --diff-filter=A -- '*.env'` um zu prüfen ob jemals committed. |
| **File-Permissions** | `chmod 600 go-backend/.env .env`. Nur Owner darf lesen/schreiben. |
| **Git-History scannen** | `git log --all -p -- '*.env' '**/.env'` — falls Secrets jemals committed wurden: History rewriting (BFG Repo-Cleaner) + alle Secrets sofort rotieren. |
| **Keine Secrets in Logs** | Go Gateway: Structured Logging mit Field-Level Redaction. Felder `password`, `secret`, `key`, `token` werden automatisch als `[REDACTED]` geloggt. |

### 12.3 Langfristige Roadmap (Post-Phase 6)

| Stufe | Lösung | Wann |
|:---|:---|:---|
| **Stufe 1 (Jetzt)** | `.env` + File-Permissions + `.gitignore` | Phase 0 |
| **Stufe 2 (Optional)** | SOPS (Mozilla) oder age-encrypted `.env` Files. Secrets werden verschlüsselt committed, nur auf dem Server entschlüsselt. | Wenn Remote-Deployment beginnt |
| **Stufe 3 (Zukunft)** | HashiCorp Vault oder Cloud KMS (AWS Secrets Manager, GCP Secret Manager). Secrets werden nie auf Disk gespeichert. | Wenn Multi-Server oder Team >3 |

### 12.4 Log-Sanitization (Implementierung)

```go
// Konzept für Go Gateway — Field-Level Redaction
var sensitiveFields = map[string]bool{
    "password": true, "secret": true, "key": true,
    "token": true, "authorization": true, "cookie": true,
}

// Jedes Log-Field wird vor dem Schreiben geprüft.
// Sensitive Fields → "[REDACTED]"
// Keine Regex auf dem gesamten Log-String — das ist fragil.
// Stattdessen: Structured Logging (slog) mit Custom Handler.
```

---

## 13. Client-Side Data Encryption (Frontend User-KG)

> **Kontext:** Der Frontend User-KG (`MEMORY_ARCHITECTURE.md` Sek. 5.2 M2b) speichert Portfolio-Positionen (Symbol, Groesse, Entry-Preis), Alerts, Trade-Journal, Geo-Annotationen und Override-Patterns in KuzuDB WASM, persistiert via IndexedDB (IDBFS). Ohne Verschluesselung liegen diese finanziell sensitiven Daten im Klartext auf der Festplatte.
> **Referenz:** [`MEMORY_ARCHITECTURE.md`](../MEMORY_ARCHITECTURE.md) Sek. 5.2 (Zwei-Schichten-KG), Sek. 6.4 (Frontend User-KG Schema)

### 13.1 Bedrohungsmodell

| Angreifer | Angriffspfad | Risiko ohne Encryption | Risiko mit Encryption |
|:---|:---|:---|:---|
| **Infostealer-Malware** | Kopiert IndexedDB-Dateien vom Disk | Voller Zugriff auf Portfolio-Daten | Nur verschluesselte Blobs, nutzlos ohne Key |
| **Malicious Browser Extension** | Liest IndexedDB via JS API | Voller Zugriff | Zugriff auf verschluesselte Blobs, Key nur im Memory waehrend Session |
| **XSS im Projekt** | JS-Injection liest IndexedDB | Voller Zugriff | Key im Memory lesbar waehrend Session (reduziertes Fenster) |
| **Shared Computer** | Anderer User am selben OS-Konto | Voller Zugriff via DevTools | Kein Zugriff ohne Passkey/Auth |
| **Physischer Zugriff** | Laptop gestohlen | Voller Zugriff | Kein Zugriff ohne Passkey |

**Wichtig:** Encryption schuetzt nicht gegen XSS waehrend der aktiven Session (Key ist im Memory). Aber sie schuetzt gegen alle Offline-Angriffe (Infostealer, physischer Zugriff, Shared Computer). Das ist der primaere Threat-Vektor fuer persistierte Daten.

### 13.2 Encryption-Strategie: Hybrid (PRF Primary + Server Fallback)

```
Passkey Login (next-auth v5, Sek. 2.2)
    │
    ├── WebAuthn PRF Extension verfuegbar?
    │     │
    │     ├── JA: prfSeed = navigator.credentials.get({
    │     │          publicKey: {
    │     │            extensions: { prf: { eval: { first: salt } } }
    │     │          }
    │     │        })
    │     │        kgKey = HKDF(prfSeed, "tradeview-user-kg-v1", 256)
    │     │        keySource = "prf"
    │     │
    │     └── NEIN (Windows Hello, Firefox ohne HW-Key, aeltere Browser):
    │              kgKeyWrapped = await fetch("/api/auth/kg-key")
    │              kgKey = AES-KW-Unwrap(kgKeyWrapped, sessionKey)
    │              keySource = "server"
    │
    ▼
KG Encryption Layer (transparent fuer KuzuDB WASM)
    │
    ├── write(data):
    │     nonce = crypto.getRandomValues(new Uint8Array(12))
    │     encrypted = AES-256-GCM(kgKey, nonce, serialize(data))
    │     → IndexedDB (IDBFS): nonce + encrypted + authTag
    │
    └── read():
          blob = IndexedDB (IDBFS)
          data = AES-256-GCM-Decrypt(kgKey, blob.nonce, blob.encrypted)
          → KuzuDB WASM (arbeitet mit Klartext im Memory)
```

### 13.3 Option A: WebAuthn PRF (Primary, SotA 2026)

> Die PRF (Pseudo-Random Function) Extension ist Teil von WebAuthn Level 3 und erlaubt es, deterministisch kryptographische Keys aus einem Passkey abzuleiten. Bitwarden nutzt genau dieses Pattern fuer Vault-Encryption.

| Aspekt | Details |
|:---|:---|
| **Mechanismus** | Bei jedem Login liefert der Authenticator einen 32-Byte PRF-Seed, abgeleitet aus dem Passkey-Private-Key + einem Server-Salt |
| **Key Derivation** | `HKDF-SHA256(prfSeed, salt="tradeview-user-kg-v1", info="aes-256-gcm")` → 256-bit AES Key |
| **Key-Lebensdauer** | Nur im Memory waehrend der Session. Wird bei Logout / Tab-Close verworfen |
| **Disk-Persistenz** | **Nie.** Key existiert nur im JS-Heap. IndexedDB enthaelt nur verschluesselte Blobs |
| **Zero-Knowledge** | Server kennt den Encryption Key nicht. Nur der User mit dem physischen Passkey kann entschluesseln |
| **Offline-Faehigkeit** | Ja. Passkey-Auth funktioniert offline (wenn Authenticator lokal ist). KG bleibt entschluesselbar ohne Server |
| **Dependency** | `@simplewebauthn/browser@^10` (bereits geplant, Sek. 2.2) — PRF ist eine Extension davon |

**Browser-Support (Stand Februar 2026):**

| Platform | PRF Support | Fallback noetig? |
|:---|:---|:---|
| Chrome/Edge 128+ (Desktop) | Ja | Nein |
| Chrome 130+ (Android) | Ja | Nein |
| Safari 18+ (macOS/iOS) | Ja (platform credentials) | Nein |
| Firefox | Nur mit Hardware Security Keys | Ja (fuer Platform Passkeys) |
| Windows Hello | Noch nicht | Ja |

Geschaetzte Abdeckung: ~70-80% der User brauchen keinen Fallback.

### 13.4 Option B: Server-Derived Key (Fallback)

Fuer Browser/Platforms ohne PRF-Support:

| Aspekt | Details |
|:---|:---|
| **Mechanismus** | Server generiert bei Account-Erstellung einen User-spezifischen KG-Encryption-Key. Key wird in DB gespeichert (verschluesselt mit `NEXTAUTH_SECRET`) |
| **Auslieferung** | Nach erfolgreichem Login: `GET /api/auth/kg-key` liefert den Key, verschluesselt mit einem aus dem Session-Token abgeleiteten Transport-Key (AES-KW, Key Wrapping) |
| **Key im Client** | Nur im Memory (JS Variable). Nie in localStorage, sessionStorage oder IndexedDB |
| **Offline** | **Nein.** Bei jedem App-Start muss der Key vom Server geholt werden. Ohne Server kein Zugriff auf den KG |
| **Sicherheit** | Schwaecher als PRF (Server kennt den Key), aber staerker als kein Encryption. XSS waehrend Session kann Key aus Memory lesen |

### 13.5 Zusaetzlich: Non-Extractable CryptoKey (Disk-Schutz)

Unabhaengig von PRF oder Server-Key wird ein **non-extractable AES-256 CryptoKey** via Web Crypto API erzeugt und in IndexedDB gespeichert. Browser verschluesseln non-extractable Keys automatisch via OS Keychain (macOS: Keychain, Windows: DPAPI, Linux: Secret Service).

Dieser Key schuetzt die verschluesselten KG-Blobs zusaetzlich gegen Disk-Level-Angriffe (Infostealer die IndexedDB-Dateien kopieren koennen den CryptoKey nicht extrahieren).

```
Encryption Stack (von innen nach aussen):
  1. KG-Daten (Klartext)
  2. AES-256-GCM mit PRF/Server-Key (User-gebunden)
  3. Non-extractable CryptoKey (Device-gebunden, OS-Keychain)
  4. IndexedDB auf Disk
```

### 13.6 Key Recovery und Rotation

| Szenario | Loesung |
|:---|:---|
| **User loescht Passkey** | PRF-Seed ist verloren. **Server-Backup:** Bei jedem KG-Sync wird eine Server-verschluesselte Kopie des KG in der DB gespeichert (mit Server-Key aus Option B). User kann nach Recovery-Login (Sek. 2.5) den KG aus dem Server-Backup wiederherstellen und mit dem neuen Passkey re-encrypten |
| **User registriert neuen Passkey** | Neuer PRF-Seed → neuer kgKey. KG wird mit altem Key entschluesselt und mit neuem Key re-encrypted. Automatisch beim naechsten Login mit neuem Passkey |
| **Server-Key Rotation** | Bei `NEXTAUTH_SECRET` Rotation: alle Server-gespeicherten KG-Keys re-encrypten (Batch-Job). User merkt nichts |
| **Multi-Device** | Jedes Device hat seinen eigenen PRF-Seed (Passkey ist device-gebunden). KG wird pro Device separat verschluesselt. Sync zwischen Devices via Server-Backup |

### 13.7 Implementation (Sprint 6.1 Erweiterung)

In Sprint 6.1 (Sek. 6) werden folgende Items ergaenzt:

| # | Item | Abhaengigkeit |
|:---|:---|:---|
| 6.1.10 | PRF-Salt in `Authenticator`-Tabelle speichern (ein Salt pro registriertem Passkey) | Prisma Schema (6.1.1) |
| 6.1.11 | `KGEncryptionKey`-Tabelle: `{ userId, encryptedKey, keySource: "server" }` fuer Fallback-Keys | Prisma Schema |
| 6.1.12 | `GET /api/auth/kg-key` Endpoint: Liefert wrapped Key nach Auth-Check | JWT Validation (6.1.6) |
| 6.1.13 | Frontend: `KGEncryptionLayer` Wrapper um KuzuDB WASM (encrypt on write, decrypt on read) | KuzuDB WASM Setup |
| 6.1.14 | Frontend: PRF-Detection beim Login (`PublicKeyCredential.getClientExtensionResults().prf`) | WebAuthn Flow (6.1.2) |
| 6.1.15 | Frontend: Fallback zu Server-Key wenn PRF nicht verfuegbar | Endpoint (6.1.12) |
| 6.1.16 | Server-Backup: Verschluesselte KG-Kopie bei Sync an Backend senden | KG Sync (MEMORY_ARCHITECTURE Sek. 5.2) |

### 13.8 Verbindung zu bestehendem Auth-Flow

```
Registrierung (Sek. 2.2):
  1. WebAuthn Passkey erstellen
  2. PRF-Salt generieren und in Authenticator-Tabelle speichern
  3. Server-Fallback-Key generieren und verschluesselt in DB speichern
  4. Leerer User-KG wird mit PRF-Key (oder Server-Key) initialisiert

Login:
  1. WebAuthn Auth (Sek. 2.2)
  2. PRF Extension: kgKey = HKDF(prfSeed, salt)
  3. Falls kein PRF: kgKey = fetch(/api/auth/kg-key)
  4. IndexedDB KG entschluesseln → KuzuDB WASM laden
  5. Session aktiv: KG im Memory, verschluesselt auf Disk

Logout / Tab-Close:
  1. KG-Aenderungen verschluesseln und in IndexedDB persistieren
  2. kgKey aus Memory loeschen (Variable = null, GC)
  3. KuzuDB WASM Instance entladen
```

---

## 14. Referenzen

| Quelle | Relevanz |
|:---|:---|
| [RFC 9700 — OAuth 2.0 Security BCP (Jan 2025)](https://datatracker.ietf.org/doc/html/rfc9700) | Aktuellste OAuth2 Security Best Practices. Token Rotation (Sek. 4.14). |
| [W3C WebAuthn Level 3 (2025)](https://www.w3.org/TR/webauthn-3/) | WebAuthn Spezifikation, Attestation, Credential Management, PRF Extension |
| [FIDO Alliance Passkey Best Practices (2026)](https://fidoalliance.org/passkeys/) | Recovery Flows, Multi-Device Credentials, UX Guidance |
| [Auth.js WebAuthn Docs](https://authjs.dev/getting-started/authentication/webauthn) | next-auth Passkey Provider Setup |
| [SimpleWebAuthn PRF Docs](https://simplewebauthn.dev/docs/advanced/prf) | PRF Extension Implementation mit @simplewebauthn |
| [Corbado — Passkeys & PRF for E2E Encryption (2026)](https://corbado.com/blog/passkeys-prf-webauthn) | PRF-basierte Client-Side Encryption Patterns, Browser-Support-Matrix |
| [Bitwarden PRF Implementation](https://contributing.bitwarden.com/architecture/deep-dives/passkeys/implementations/relying-party/prf) | Produktions-Referenz: PRF fuer Vault-Encryption mit HKDF Key Stretching |
| [Yubico — CTAP2 HMAC Secret Deep Dive](https://developers.yubico.com/WebAuthn/Concepts/PRF_Extension/CTAP2_HMAC_Secret_Deep_Dive.html) | Technische Details der PRF/HMAC-Secret Extension auf Authenticator-Ebene |
| [W3C Device Bound Session Credentials (Aug 2025)](https://w3.org/TR/2025/WD-dbsc-1-20250821) | Zukuenftiger Standard fuer Device-gebundene Session-Sicherheit |
| [Browsertech Digest — Encrypting Offline Storage](https://digest.browsertech.com/archive/browsertech-digest-encrypting-offline-storage-for/) | Best Practices fuer verschluesselte Client-Side Persistenz in Local-First Apps |
| [MDN — SubtleCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) | Web Crypto API Referenz (AES-GCM, HKDF, Key Wrapping) |
| [Binance API Security Hardening](https://toolstac.com/tool/binance-api/production-security-hardening) | Exchange-seitige Key-Absicherung |
| [API Stronghold — Exchange Key Management (2025)](https://www.apistronghold.com/blog/securing-crypto-ai-agents-api-key-management-trading-bots) | Crypto-spezifische Key-Risiken und Mitigations |
| [Sodot — Zero Exposure Playbook](https://www.sodot.dev/blog/exchange-api-keys) | 30-Tage-Plan fuer Exchange Key Security |
| [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) | JWT Revocation Patterns, Token Binding |
| GCT Source: `engine/rpcserver.go`, `config/config_encryption.go` | GCT Auth Internals |
| GCT Source: `internal/connectors/gct/client.go`, `internal/app/wiring.go` | Unser Gateway → GCT Verbindung |
