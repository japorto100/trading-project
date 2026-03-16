# Policy Guardrails

> **Stand:** 16. Maerz 2026
> **Zweck:** Policy- und Boundary-Spec fuer GCT-Zugriff, MCP/WebMCP,
> Consent/Privacy, Monitoring und residuale Sicherheits-Gates.
> **Rolle:** Fokussierte Teil-Spec unter dem Umbrella-Dokument
> [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md).

---

## 1. Scope

Dieses Dokument ist Owner fuer Regeln, die nicht primaer Auth- oder
Secret-Storage-Themen sind, sondern Laufzeit-Policy:

- Gateway-zu-GCT Guardrails
- MCP- und WebMCP-Freigaberegeln
- Consent-/Privacy-Enforcement
- Monitoring-, Audit- und Residual-Risk-Gates

---

## 2. Go Gateway -> GCT Boundary

### 2.1 Mindestvorgaben

- Basic Auth zwischen Go und GCT
- TLS ohne `InsecureSkipVerify` in Production
- GCT nur auf `127.0.0.1` bzw. eng isolierter Netzwerkgrenze
- Go protokolliert, welcher User welche GCT-Aktion ausgeloest hat
- kein Wildcard-Proxy auf unkontrollierte GCT-Methoden

### 2.2 Trading-nahe Policy

| Bereich | Guardrail |
|:---|:---|
| Orders | mindestens `trader`, hartes Rate Limit |
| Withdrawals | nicht ueber generische User-Flows exponieren |
| GCT Health | read-only, aber weiter auditierbar |
| Service-Creds | nur serverseitig, niemals im Browser |

### 2.3 Residuale Runtime-Gaps

- Audit-Persistenz und produktive DB-Haertung weiter ausbauen
- finaler Endpoint-/Method-Contract fuer alle sensitiven GCT-Aktionen
- produktive Whitelists und Rate-Limits weiter verfeinern

---

## 3. MCP Security

### 3.1 Grundsatz

MCP ist standardmaessig **nicht** vertrauenswuerdig genug fuer fruehe
Produktivfreigabe. Tool-Scopes muessen wie API-Scopes behandelt werden.

### 3.2 Mindestanforderungen vor Aktivierung

- Tool-Call-Authentifizierung ueber denselben Auth-/Policy-Stack wie APIs
- RBAC pro Tool oder Tool-Gruppe
- Rate Limiting pro Tool-Scope
- Audit-Log fuer jeden Tool-Call
- Network Isolation und enge Prozessgrenze
- klare Read-only/Mutations-Trennung

### 3.3 Empfehlung

MCP erst aktivieren, wenn fuer den konkreten Scope Auth, Policy, Audit und
Rollback sauber stehen. Read-only Discovery-Scopes sind frueher denkbar als
Mutation.

---

## 4. WebMCP Security

### 4.1 Spezifisches Risiko

WebMCP liegt im Browser-/JS-Kontext und erbt damit Session, DOM-Naehe und
XSS-Risiko. Deshalb ist WebMCP kein harmloser UI-Helfer, sondern eine direkte
Security-Boundary.

### 4.2 Kritische Risiken

| Risiko | Bedeutung |
|:---|:---|
| XSS -> Tool-Zugriff | kritischster Angriffsvektor |
| fehlendes natives Audit | Tool-Calls muessen aktiv geloggt werden |
| ueberbreite Tool-Surfaces | Browser-Agent bekommt zu viel Macht |
| Mutation ohne User-Intent | hoher Missbrauchspfad |

### 4.3 Guardrails

- harte CSP als primaere XSS-Barriere
- Tool-Interception und Logging
- Tool-Scoping nach Auth-State und Rollen
- keine portfolio- oder secrets-nahen Write-Tools ohne explizite Bestaetigung
- fruehe Aktivierung nur fuer enge read-only Faelle wie `get_chart_state`

---

## 5. Consent und Privacy

### 5.1 Consent-Modell

| Bereich | Regel |
|:---|:---|
| Speicherort | `UserConsent` in DB, nie im JWT |
| Lookup | serverseitig bei relevanten LLM-/Ingest-Pfaden |
| Bereiche | `paste`, `train`, `chat`, `stats` |

Typische Entscheidung:

- fehlender Consent auf LLM-/Ingest-Pfaden -> `403`
- Consent-Aenderungen muessen sofort wirken, nicht erst nach Session-Ablauf

### 5.2 Data Minimization

- nur notwendige Daten in LLM-/Agent-Pipelines uebergeben
- keine unnötige Kopplung zwischen Auth-Claims und Consent-Zustaenden
- sensitive Payloads nur mit klarer Zweckbindung weiterreichen

### 5.3 Audit-Privacy

- Logs muessen aussagekraeftig, aber nicht datenhungrig sein
- keine Secrets oder unnötigen sensitiven Payloads in Klartext loggen
- Request-ID, Scope, User und Entscheidung loggen; Inhalt nur wenn wirklich noetig

---

## 6. Monitoring und Alerting

### 6.1 Auth Monitoring

| Metrik | Schwellwert | Aktion |
|:---|:---|:---|
| Failed Login pro IP | >5 in 10 min | IP blocken / drosseln |
| Failed Login pro User | >3 in 5 min | Account sperren / Re-Auth erzwingen |
| Refresh-Token-Replay | jedes Ereignis | gesamte Token-Familie invalidieren |

### 6.2 Trading und GCT

| Metrik | Schwellwert | Aktion |
|:---|:---|:---|
| GCT Connection Loss | Timeout >5s | SEV-2 Alert |
| Order-Anomalie | ungewoehnliche Menge/Frequenz | manuelle Pruefung / Stop |
| Audit-Write-Fehler | jedes Ereignis | degradationssicher alarmieren |

### 6.2a Praktische Minimal-Implementierung

- fuer kleines Team reicht zunaechst Structured JSON Logging + einfache SQLite-
  oder gleichwertige Metrik-Persistenz
- wichtiger als ein grosses Monitoring-Stack ist, dass sensitive Events
  reproduzierbar, korrelierbar und alarmierbar sind

### 6.3 Systemische Residual-Gates

- CSP/CORS-Whitelists produktiv finalisieren
- Observability auf alle sensitiven Pfade konsistent ziehen
- Auth-E2E, Recovery-E2E und Consent-Gates regelmaessig verifizieren

---

## 7. Implementierungs-Restarbeit

Die wichtigsten Folge-Tracks aus `AUTH_SECURITY.md` fuer diese Boundary:

1. Go-Gateway-Hardening fuer JWT, RBAC, Rate Limits und Correlation IDs.
2. GCT-Auth-Integration mit Audit und Whitelists.
3. Monitoring-/Alerting-Ausbau fuer Auth und Trading.
4. Cleanup/Verify fuer Consent, Log-Sanitization und Security-Audit-Checklist.

---

## 8. Residuale Risiken

- WebMCP bleibt auch mit CSP eine heikle Browser-Boundary
- Tool-Surfaces duerfen nicht unbemerkt wachsen
- Consent-/Privacy-Pfade brauchen regelmaessige Re-Validierung bei neuen
  Agent-/LLM-Surfaces

---

## 9. Querverweise

| Thema | Dokument |
|:------|:---------|
| Umbrella Security Spec | [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md) |
| Auth-Flows, Recovery, Soft-Lock | [`AUTH_MODEL.md`](./AUTH_MODEL.md) |
| Secrets und Exchange-Key-Grenzen | [`SECRETS_BOUNDARY.md`](./SECRETS_BOUNDARY.md) |
| Hardening-Restlage und Track-Reihenfolge | [`SECURITY_HARDENING_TRACKS.md`](./SECURITY_HARDENING_TRACKS.md) |
| Incident-Runbooks | [`INCIDENT_RESPONSE.md`](./INCIDENT_RESPONSE.md) |
