# Security Hardening Tracks

> **Stand:** 09. Maerz 2026
> **Zweck:** Operative Security-Sub-Spec fuer bekannte Risiken,
> Sofortmassnahmen, Folge-Tracks und Leitentscheidungen.
> **Source-of-Truth-Rolle:** Autoritativ fuer Security-Restlage und
> Hardening-Reihenfolge, nicht fuer Auth-, Secrets- oder Incident-Details im
> engeren Sinn.

---

## 1. Scope

Dieses Dokument ist Owner fuer:

- aktuelle Sicherheitsluecken und Restrisiken
- Sofortmassnahmen und Folge-Tracks
- Security-nahe Technologieentscheidungen

Nicht Teil dieses Dokuments:

- Detail-Regeln fuer Auth-/Session-Flows
- Secrets-/Key-Management im engeren Sinn
- Incident-Runbooks

---

## 2. Aktuelle Risiken

> **Prinzip:** Massnahmen, die in Minuten kritisches Risiko reduzieren, werden
> nicht auf spaetere Sprints verschoben.

| Luecke | Risiko | Schwere | Ziel |
|:---|:---|:---|:---|
| GCT Default Credentials | sofortiger RPC-Zugriff | KRITISCH | Sofortmassnahme |
| fehlendes Credential Scoping auf Exchange | Funds-Risiko | KRITISCH | Sofortmassnahme |
| keine Exchange IP Whitelist | Trading von ueberall | KRITISCH | Sofortmassnahme |
| unverschluesselte GCT Config moeglich | File-Access = Key-Access | HOCH | Sofortmassnahme |
| `InsecureSkipVerifyTLS` moeglich | MitM zu GCT | HOCH | Sofortmassnahme |
| residuale Auth-/Policy-Gates | Baseline noch nicht voll verifiziert | HOCH | Phase-1-Residual |
| Audit-/Rate-Limit-Haertung unvollstaendig | zu schwache Governance an sensitiven Pfaden | HOCH | Folge-Hardening |
| provider credentials transitional | BFF-Cookie jetzt verschluesselt und ohne Secret-`localStorage`, aber noch keine finale broker-/vault-grade Loesung | MITTEL | Folge-Hardening |
| CSP/CORS/Monitoring nicht final | Blindspots / zu breite Policies | MITTEL | Folge-Hardening |
| `.env` Klartext | Schutz nur ueber File-Rechte | MITTEL | Folge-Hardening |

### 2.1 Nicht rein softwareseitig loesbar

| Risiko | Mitigation |
|:---|:---|
| Server-Kompromiss | OS-Haertung, SSH-Key-only, Firewall, Patch-Level |
| Supply-Chain-Angriffe | lockfiles, audits, Update-Disziplin |
| Social Engineering | Hardware-2FA, Withdrawal-Whitelist |
| Insider Risk | Least Privilege, Audit, Rotation nach Teamwechsel |

---

## 3. Sofortmassnahmen

- [ ] GCT Credentials haerten und Defaults entfernen
- [ ] Exchange API Keys auf Trading-only reduzieren
- [ ] Exchange IP Whitelist setzen
- [ ] `GCT_JSONRPC_INSECURE_TLS=false` verifizieren
- [ ] GCT Config Encryption aktivieren
- [ ] `.env*`-Handling und File-Rechte verifizieren
- [ ] Incident-Runbooks aktuell halten

---

## 4. Folge-Tracks

### Track A1: Fundament

1. Auth-Methoden, Recovery und Consent-Basis vervollstaendigen
2. Client-side encryption / PRF / fallback sauber abschliessen
3. Security-UI und Recovery-UX verifizieren

### Track A2: Go Gateway Hardening

1. JWT Validation und Revocation komplett haerten
2. RBAC und Endpoint-Gruppen finalisieren
3. Correlation IDs, CSP und CORS konsolidieren
4. Rate Limits fuer sensitive Pfade absichern

### Track A3: GCT Auth Integration

1. GCT-Endpoint-Whitelist pflegen
2. Audit in DB + append-only backup konsolidieren
3. Withdrawal-Whitelist und Key-Age-Warnungen ziehen

### Track A4: Monitoring und Alerting

1. Failed Auth / replay / escalation Metriken erfassen
2. Order-Anomalien und GCT Health beobachten
3. Alert-Kanaele und Security-Dashboard konsistent machen

### Track A5: Cleanup und Verify

1. provider/env cleanup
2. Consent- und Security-Audit-Checklist abschliessen
3. negative Security-Tests regelmaessig fahren

---

## 5. Leitentscheidungen

| Frage | Entscheidung | Rationale |
|:---|:---|:---|
| Warum Go fuer Auth/Policy? | Gateway bleibt Security-Frontdoor | keine zusaetzliche Auth-Service-Komplexitaet |
| Warum WebAuthn primaer? | passwortlos + phishing-resistenter Standard | mit TOTP/Recovery fuer Robustheit |
| Warum JWT + Revocation-Hybrid? | pragmatisch fuer kleines Team | kein voller Session-Store zwingend noetig |
| Warum Audit in Go statt GCT? | nur Go kennt User-Kontext | GCT kennt nur Service-Account |
| Warum kein frueher MCP/WebMCP write-scope? | zu hohes Missbrauchsrisiko | Policy/Audit zuerst, Tooling spaeter |

---

## 6. Querverweise

- [`AUTH_MODEL.md`](./AUTH_MODEL.md)
- [`POLICY_GUARDRAILS.md`](./POLICY_GUARDRAILS.md)
- [`SECRETS_BOUNDARY.md`](./SECRETS_BOUNDARY.md)
- [`CLIENT_DATA_ENCRYPTION.md`](./CLIENT_DATA_ENCRYPTION.md)
- [`INCIDENT_RESPONSE.md`](./INCIDENT_RESPONSE.md)
- [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md)
