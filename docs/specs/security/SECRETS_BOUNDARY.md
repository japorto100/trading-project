# Secrets Boundary

> **Stand:** 16. Maerz 2026
> **Zweck:** Spec fuer Secret-Lebensorte, GCT-/Exchange-Key-Grenzen,
> Sofortmassnahmen und Hardening-Roadmap.
> **Rolle:** Fokussierte Teil-Spec unter dem Umbrella-Dokument
> [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md).

---

## 1. Scope

Dieses Dokument ist Owner fuer:

- Speicherorte und Transportwege von Secrets
- GCT- und Exchange-Key-Schutz
- kurzfristige `.env`-Pragmatik vs. langfristige Secret-Strategie
- Log-Sanitization fuer sensitive Felder

Nicht Owner dieses Dokuments:

- User-Auth- und Session-Logik: [`AUTH_MODEL.md`](./AUTH_MODEL.md)
- Policy-/Consent-/MCP-Governance: [`POLICY_GUARDRAILS.md`](./POLICY_GUARDRAILS.md)

---

## 2. Wo Secrets leben duerfen

| Ort | Inhalt | Mindestschutz |
|:---|:---|:---|
| GCT `config.json` | Exchange API Keys | AES-256-GCM / Config Encryption, restriktive File-Rechte |
| `go-backend/.env` | GCT Service-Credentials, serverseitige API-Secrets | `.gitignore`, restriktive File-Rechte |
| Root `.env*` | NextAuth-/Auth-/DB-Secrets | `.gitignore`, restriktive File-Rechte |
| verschluesselte ENV-Varianten | optionale encrypted service creds | AES-256-Key ueber separaten Key-Slot |
| **Niemals** | Exchange Keys im Frontend, in Logs oder im Code | verboten |

Wesentliche Trennung:

- Exchange Keys gehoeren in die GCT-/Gateway-Grenze, nicht in Browser- oder
  Frontend-Build-Kontext.
- User-supplied request-scoped Provider-Credentials sind eine andere Boundary
  als langfristig gespeicherte Exchange-Keys.

---

## 3. GCT- und Exchange-Key-Hardening

### 3.1 Baseline

- GCT-Config-Encryption fuer gespeicherte Exchange-Keys aktiv halten
- Keys nur mit minimal noetigem Scope ausstellen
- **kein Withdrawal-Scope**
- IP-Whitelist auf Exchange-Seite
- Withdrawal-Address-Whitelist in GCT
- Rotationsziel: alle 90 Tage

### 3.2 Service-Credentials

- Go -> GCT Service-Creds koennen optional verschluesselt per ENV geliefert werden
- Entschluesselung beim Gateway-Start, nicht im Browser
- schwache oder unsaubere Credentials duerfen im produktiven Hardening blockiert werden

### 3.3 GCT Auth Boundary

| Aspekt | Vorgabe |
|:---|:---|
| gRPC Auth | Basic Auth in Metadata, keine schwachen Defaults |
| JSON-RPC | nur fallback / transitional path |
| TLS | `InsecureSkipVerify` nicht in Production |
| Network | GCT nur localhost / enge Netzwerkgrenze |
| Audit | Go mappt User-Kontext, nicht GCT selbst |

### 3.4 GCT Config Encryption

| Thema | Vorgabe |
|:---|:---|
| Algorithmus | AES-256-GCM |
| KDF | `scrypt` |
| Aktivierung | `encryptConfig: 1` |
| Key-Handling | nicht in Datei ablegen; per ENV oder interaktiv zufuehren |

---

## 4. Sofortmassnahmen

| Massnahme | Ziel |
|:---|:---|
| `.gitignore` fuer alle `.env*` verifizieren | keine versehentlichen Commits |
| restriktive File-Rechte | lokales File-Leak-Risiko senken |
| Secrets nie in Browser-Bundles | Frontend bleibt secret-free |
| Feld-Level-Redaction in Logs | kein Secret-Leak ueber Observability |

Diese Massnahmen sind nicht die Endloesung, aber die minimale Baseline bis
SOPS/Vault/KMS oder vergleichbare Loesungen noetig werden.

---

## 5. Log-Sanitization

Log-Regel:

- nie komplette `.env`-Werte loggen
- API-Keys, Tokens, Passwoerter, Cookies und Authorization-Header immer maskieren
- Audit-Logs sollen Scope, User, Request-ID und Entscheidung enthalten, nicht
  das Secret selbst

Pflicht fuer sensitive Pfade:

- Auth-/Revocation-Endpoints
- GCT-Service-Credentials
- Exchange- und Provider-Credentials
- Consent-/LLM-nahe Payloads mit potenziell sensitiven Nutzerdaten

---

## 6. Langfristige Roadmap

| Stufe | Loesung | Bemerkung |
|:---|:---|:---|
| 1 | `.env` + File-Permissions | pragmatische Baseline fuer lokale / kleine Setups |
| 2 | SOPS / age-encrypted ENV | guter Zwischenschritt ohne vollen Secret-Manager |
| 3 | Vault / Cloud KMS | bevorzugt bei wachsender Team- oder Deploy-Komplexitaet |

Ein wichtiger Architekturpunkt:

- nicht jeder Secret-Typ braucht sofort denselben Lifecycle
- Exchange-Keys, Service-Creds und User-scoped Provider-Credentials sollten
  getrennt betrachtet und nicht in einer einzigen "Secrets"-Schublade vermischt
  werden

---

## 7. Residuale Risiken

- `.env` bleibt Klartext auf Disk und ist nur ueber File-Rechte geschuetzt
- Rotation und Provenance sind ohne Secret-Manager schwerer nachweisbar
- request-scoped provider creds brauchen langfristig strengere Boundary-Regeln

---

## 8. Querverweise

| Thema | Dokument |
|:------|:---------|
| Umbrella Security Spec | [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md) |
| Auth- und Sessionmodell | [`AUTH_MODEL.md`](./AUTH_MODEL.md) |
| Policy-/Consent-/MCP-Governance | [`POLICY_GUARDRAILS.md`](./POLICY_GUARDRAILS.md) |
| Incident-Runbooks bei Kompromiss | [`INCIDENT_RESPONSE.md`](./INCIDENT_RESPONSE.md) |
