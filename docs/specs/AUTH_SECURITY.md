# AUTH & SECURITY ARCHITECTURE

> **Stand:** 16. Maerz 2026 (Rev. 6.2 - Umbrella-Spec auf granulare
> `security/`-Subspecs verteilt)
> **Zweck:** Dach- und Navigations-Spec fuer die Sicherheitsarchitektur im
> 3-Schichten-Modell `User -> Next.js/Go Gateway -> GCT -> Exchanges`.
> **Source-of-Truth-Rolle:** Dieses Dokument ist Owner fuer die Security-
> Topologie und die Aufteilung der Security-Themen auf fokussierte Subspecs.
> **Aenderungshistorie:** Rev. 1-5: Vollspezifikation in einer Datei. Rev. 6:
> erste Splits fuer Auth/Policy/Secrets/Incident. Rev. 6.2: Umbrella-Dokument
> bewusst verschlankt; Details leben nun in `docs/specs/security/*.md`.

---

## 1. Scope

Dieses Dokument beantwortet autoritativ:

- wie die Security-Architektur thematisch geschnitten ist
- welche Subspec fuer welchen Security-Bereich Owner ist
- welche Read Order fuer Security-Arbeit gilt

Nicht der Zweck dieses Dokuments:

- alle Security-Details erneut voll zu duplizieren
- operative Checklisten, Runbooks und Restarbeit parallel in mehreren Dateien zu
  pflegen

---

## 2. Sicherheitsmodell

```text
SCHICHT 1: User -> Next.js -> Go Gateway
  - Auth.js / Sessions / Rollen / Revocation / Soft Lock

SCHICHT 2: Go Gateway -> GCT
  - Service-Credentials / TLS / Policy / Audit / Rate Limits

SCHICHT 3: GCT -> Exchanges
  - Exchange Keys / Config Encryption / Credential Scoping / IP Whitelist
```

Leitprinzipien:

- Go bleibt Security-Frontdoor fuer Policy, Audit und Downstream-Kontrolle.
- Browser ist nie Secret-Owner fuer Trading-/Exchange-Secrets.
- GCT und andere interne Services bleiben hinter Go.
- MCP/WebMCP erhalten nur so viel Scope, wie Auth/Policy/Audit bereits sauber
  tragen koennen.

---

## 3. Security-Subspecs

| Thema | Fuehrendes Dokument |
|:------|:--------------------|
| User Auth, Recovery, Revocation, Soft Lock | [`security/AUTH_MODEL.md`](./security/AUTH_MODEL.md) |
| Go->GCT Policy, MCP/WebMCP, Consent, Monitoring | [`security/POLICY_GUARDRAILS.md`](./security/POLICY_GUARDRAILS.md) |
| Secrets, GCT-/Exchange-Keys, Config Encryption | [`security/SECRETS_BOUNDARY.md`](./security/SECRETS_BOUNDARY.md) |
| Browser-/KG-Verschluesselung, PRF, Fallback-Key | [`security/CLIENT_DATA_ENCRYPTION.md`](./security/CLIENT_DATA_ENCRYPTION.md) |
| Severity-Stufen und Incident-Runbooks | [`security/INCIDENT_RESPONSE.md`](./security/INCIDENT_RESPONSE.md) |
| Risiken, Sofortmassnahmen, Folge-Tracks, Leitentscheidungen | [`security/SECURITY_HARDENING_TRACKS.md`](./security/SECURITY_HARDENING_TRACKS.md) |

---

## 4. Read Order fuer Security-Arbeit

1. Dieses Dokument fuer die Topologie lesen.
2. `SYSTEM_STATE.md` fuer den aktuellen IST/SOLL-Stand gegenpruefen.
3. Die fuehrende Subspec fuer den Arbeitsbereich lesen.
4. `EXECUTION_PLAN.md` und bei Bedarf `execution/*.md` fuer offene Arbeit und
   Verify-Gates lesen.

Faustregel:

- Auth-/Session-Arbeit -> `AUTH_MODEL.md`
- Policy-/MCP-/Consent-/Monitoring-Arbeit -> `POLICY_GUARDRAILS.md`
- Secret-/Key-/GCT-Hardening -> `SECRETS_BOUNDARY.md`
- Browser-KG-/PRF-/Encryption-Arbeit -> `CLIENT_DATA_ENCRYPTION.md`
- Vorfall-/Runbook-Fragen -> `INCIDENT_RESPONSE.md`
- Restlage / Priorisierung / Security-Programm -> `SECURITY_HARDENING_TRACKS.md`

---

## 5. Referenz- und Owner-Matrix

| Frage | Owner |
|:------|:------|
| Wie funktioniert Login / Recovery / Soft Lock? | `security/AUTH_MODEL.md` |
| Welche Policy gilt fuer GCT, MCP, WebMCP, Consent? | `security/POLICY_GUARDRAILS.md` |
| Wo leben Secrets und wie werden sie gehaertet? | `security/SECRETS_BOUNDARY.md` |
| Wie wird lokaler Browser-/KG-Kontext verschluesselt? | `security/CLIENT_DATA_ENCRYPTION.md` |
| Was tun wir im Incident? | `security/INCIDENT_RESPONSE.md` |
| Welche Risiken / Tracks / Leitentscheidungen sind offen? | `security/SECURITY_HARDENING_TRACKS.md` |
| Welche Arbeit ist offen? | `EXECUTION_PLAN.md` |
| Was existiert heute wirklich? | `SYSTEM_STATE.md` |

---

## 6. Querverweise

- `SYSTEM_STATE.md`
- `EXECUTION_PLAN.md`
- `API_CONTRACTS.md`
- `ARCHITECTURE.md`
