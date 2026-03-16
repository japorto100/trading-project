# Incident Response Plan

> **Stand:** 16. Maerz 2026
> **Zweck:** Was passiert WENN ein Sicherheitsvorfall eintritt.
> **Source-of-Truth-Rolle:** Autoritativ fuer Severity-Stufen und Runbooks bei
> Security-Vorfaellen.
> **Index:** [`../AUTH_SECURITY.md`](../AUTH_SECURITY.md)

---

## Scope

- Severity-Stufen
- Reaktionszeiten
- Runbooks fuer Key-, Credential- und Auth-Vorfaelle

Nicht Teil dieses Dokuments:

- allgemeine Hardening-Roadmap
- Auth- oder Secrets-Architektur im Alltag

---

## Severity-Stufen

| Stufe | Definition | Max. Reaktionszeit |
|:---|:---|:---|
| SEV-1 (Kritisch) | Funds in Gefahr | Sofort |
| SEV-2 (Hoch) | System-Kompromiss | <1 Stunde |
| SEV-3 (Mittel) | Auth-Anomalie | <24 Stunden |
| SEV-4 (Niedrig) | Potentielle Schwachstelle | <1 Woche |

---

## SEV-1: Exchange Key Kompromiss

1. Exchange: API Key DEAKTIVIEREN
2. GCT stoppen
3. Exchange: Offene Orders canceln, Withdrawal-Sperre
4. Neuen Key erstellen (nur Trading, IP Whitelist)
5. GCT Config updaten, Encryption Key rotieren
6. Audit-Log pruefen

---

## SEV-2: Server/GCT-Credentials Kompromiss

1. GCT + Go Gateway stoppen
2. GCT Credentials rotieren
3. NEXTAUTH_SECRET rotieren
4. Exchange API Keys rotieren
5. Server-Zugang, .env, Git-History pruefen

---

## SEV-3: Auth-Anomalie

1. User-Account temporaer sperren (JWT-Revocation)
2. Audit-Log analysieren
3. Eskalation zu SEV-2 falls bestaetigt

---

## Grundregeln im Incident

- erst Schaden begrenzen, dann Ursachenanalyse
- keine ungeplanten "quick fixes" ohne Audit-Trail
- bei Fonds-/Trading-Risiko immer fail-closed priorisieren

---

## Querverweise

- [`AUTH_MODEL.md`](./AUTH_MODEL.md)
- [`SECRETS_BOUNDARY.md`](./SECRETS_BOUNDARY.md)
- [`POLICY_GUARDRAILS.md`](./POLICY_GUARDRAILS.md)
- [`SECURITY_HARDENING_TRACKS.md`](./SECURITY_HARDENING_TRACKS.md)
