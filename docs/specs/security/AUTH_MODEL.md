# Auth Model

> **Stand:** 16. Maerz 2026
> **Zweck:** Fokussierte Auth-Spec fuer User-Authentifizierung, Session-Modell,
> Recovery, RBAC und Idle-Schutz.
> **Rolle:** Boundary-Doc unter dem weiterhin vollstaendigen Umbrella-Dokument
> [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md).

---

## 1. Scope und Authority

Dieses Dokument zieht alle auth-zentrierten Teile aus `AUTH_SECURITY.md`
zusammen, damit Agents und Menschen die produktive Login-/Session-/RBAC-Logik
ohne das komplette Security-Dokument lesen koennen.

Normativ fuer dieses Dokument:

- User-Auth-Mechanismen und Fallback-Kette
- Rollen, Session- und JWT-Modell
- Recovery-, Revocation- und Idle-Schutz
- geschuetzte Auth-/Trading-nahen Boundary-Regeln

Nicht Owner dieses Dokuments:

- MCP/WebMCP-Policy und Consent: [`POLICY_GUARDRAILS.md`](./POLICY_GUARDRAILS.md)
- Secrets und Exchange-Key-Grenzen: [`SECRETS_BOUNDARY.md`](./SECRETS_BOUNDARY.md)
- Incident-Runbooks: [`INCIDENT_RESPONSE.md`](./INCIDENT_RESPONSE.md)
- Client-seitige KG-/Browser-Verschluesselung:
  [`CLIENT_DATA_ENCRYPTION.md`](./CLIENT_DATA_ENCRYPTION.md)

---

## 2. Architektur-Ueberblick: 3-Schichten-Modell

```
┌──────────────────────────────────────────────────────────┐
│ SCHICHT 1: User -> Next.js -> Go Gateway                 │
│ Browser -> next-auth v5 / Passkeys / Session-Cookies     │
│ Go: JWT-Validation, RBAC, Rate Limit, Audit              │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│ SCHICHT 2: Go Gateway -> GCT                             │
│ Basic Auth, TLS, Service-Account, localhost boundary     │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│ SCHICHT 3: GCT -> Exchanges                              │
│ API Keys, config encryption, credential scoping          │
└──────────────────────────────────────────────────────────┘
```

Fuer Auth ist Schicht 1 die primaere Kontrollgrenze. Schicht 2 und 3 sind
downstream sensitive boundaries, deren Nutzung an Rollen, Audit und Policy
gehaengt wird.

---

## 3. User Auth Baseline

### 3.1 IST-Zustand

| Aspekt | Status |
|:---|:---|
| next-auth | v5 Beta / Auth.js Product-Baseline aktiv |
| Auth-Flows | Sign-in, Register, Passkeys, Recovery- und Security-Surfaces vorhanden |
| Rollen | `viewer`, `analyst`, `trader`, `admin` als Scaffold-/Zielmodell |
| Session | `maxAge` 8h, 10min Soft-Lock als primaerer Idle-Schutz |
| Geschuetzte Routen | Next-/Go-seitige JWT-/Policy-/RBAC-Scaffolds vorhanden |

### 3.2 SOLL-Fallback-Kette

1. WebAuthn/Passkeys als Primaer-Mechanismus.
2. TOTP als starker Fallback fuer Browser/Geraete ohne Passkey-Support.
3. OAuth2 nur kombiniert mit TOTP-Pflicht.
4. Recovery Codes als letzter, einmaliger Notfallpfad.

### 3.3 Session- und Token-Modell

| Aspekt | Vorgabe |
|:---|:---|
| Session-Cookie | `httpOnly`, `Secure`, `SameSite=Strict` |
| Claims | `sub`, `role`, `jti`, `iat`, `exp` |
| Session-Strategie | 8h Session-Baseline + 10min Soft-Lock |
| Revocation | `jti`-Blocklist + Refresh-Token-Familie |
| Consent | niemals im JWT; immer serverseitiger Lookup |

Das Ziel ist nicht maximale Token-Kuerze um jeden Preis, sondern ein
pragmatisches Modell fuer ein kleines Team mit klaren Re-Auth- und Audit-Gates.

---

## 4. Implementierte und erwartete Auth-Slices

### 4.1 Baseline-Slices, die bereits im Scope liegen

- Auth.js / next-auth v5 mit Prisma-Adapter als Auth-Baseline
- Credentials-Login plus Passkey-Provider-Flow
- Passkey-APIs fuer Register/Verify/Authenticate
- Register-/Security-/Passkey-/Privacy-Surfaces in Next.js
- Go-Scaffolds fuer JWT-Validation, RBAC, Rate Limits und Revocation-Audit
- Consent-Read/Patch-Route fuer serverseitige Consent-Entscheidungen

### 4.2 Residual-Gates, die noch sauber geschlossen werden muessen

- MFA-/Recovery-E2E nicht nur scaffolded, sondern durchverifiziert
- RBAC-/Rate-Limit-Regeln auf allen sensitiven Pfaden finalisieren
- Audit- und Revocation-Persistenz weiter haerten
- Security-UI und Recovery-UX produktreif polieren

---

## 5. Rollenmodell und geschuetzte Endpoints

### 5.1 Rollen

| Rolle | Darf | Darf nicht |
|:---|:---|:---|
| `viewer` | Dashboard, Charts, oeffentliche Daten | Reviews, Orders, Admin |
| `analyst` | + GeoMap-/UIL-Reviews | Portfolio Orders |
| `trader` | + Portfolio-/GCT-nahe Trading-Pfade | Admin |
| `admin` | User-/Key-/Revocation-Admin | -- |

### 5.2 Gateway-Pfade

| Pattern | Mindest-Rolle | Rate Limit |
|:---|:---|:---|
| `GET /api/v1/quote`, `/ohlcv`, `/news/*` | `viewer` | 100 req/s |
| `GET /api/v1/geopolitical/*` | `viewer` | 100 req/s |
| `POST /api/v1/geopolitical/candidates/*/review` | `analyst` | 30 req/s |
| `POST /api/v1/portfolio/order/*` | `trader` | 2 req/min |
| `GET /api/v1/portfolio/balances/*` | `trader` | 10 req/s |
| `GET /api/v1/gct/*` | `trader` | 2 req/min |
| `POST /api/v1/auth/revocations/jti` | `admin` | 5 req/min |
| `/health`, `/api/v1/stream/*` | public | 5 connections |

---

## 6. Recovery, Revocation und Device Management

### 6.1 Recovery-Kette

- Recovery Codes: 8 einmalige Codes, nur gehasht gespeichert
- nach Recovery-Login ist eine neue Primaer-Methode verpflichtend
- User kann alle Codes regenerieren; alte werden invalidiert

### 6.2 Device Management

- mehrere Passkeys pro User sind erlaubt
- letzter verbleibender Primaer-Passkey darf nicht versehentlich entfernt werden
- Device-Verwaltung ist session-gebunden und auditierbar

### 6.3 JWT Revocation

| Mechanismus | Zweck |
|:---|:---|
| `jti`-Blocklist | sofortige Emergency-Revocation laufender Sessions |
| Refresh-Token-Revocation | verhindert Re-Auth ueber kompromittierte Token-Familie |
| Audit-Read-Endpoint | nachvollziehbare Revocation-Historie fuer Admins |

Trigger fuer Revocation:

- Rollenwechsel
- Passwort-/Auth-Methoden-Wechsel
- erkannte Anomalie
- manueller Admin-Eingriff

---

## 7. InactivityMonitor und Soft Lock

| Aspekt | Vorgabe |
|:---|:---|
| Idle-Timeout | 10 Minuten |
| Session-MaxAge | 8 Stunden |
| Verhalten | Lock-Screen Overlay, RAM-State bleibt erhalten |
| Fehlversuche | 5 Fehlversuche -> Hard sign-out |
| Cross-Tab | BroadcastChannel Sync |

Der Soft-Lock ist die primaere Schutzschicht fuer Idle-Sessions. Er ersetzt
nicht Revocation, MFA oder Audit, sondern reduziert das Risiko geoeffneter,
unbeaufsichtigter Sessions.

---

## 8. Querverweise

| Thema | Dokument |
|:------|:---------|
| Umbrella Security Spec | [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md) |
| Policy, MCP, Consent, Monitoring | [`POLICY_GUARDRAILS.md`](./POLICY_GUARDRAILS.md) |
| Secrets, GCT, Exchange Keys | [`SECRETS_BOUNDARY.md`](./SECRETS_BOUNDARY.md) |
| Client-seitige Verschluesselung | [`CLIENT_DATA_ENCRYPTION.md`](./CLIENT_DATA_ENCRYPTION.md) |
| Incident Response | [`INCIDENT_RESPONSE.md`](./INCIDENT_RESPONSE.md) |
