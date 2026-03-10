# Source Onboarding and Key Checklist

> **Stand:** 09. Maerz 2026  
> **Zweck:** Operative Checkliste fuer neue Quellen, auth-pflichtige Provider,
> Env-Template-Pflichten und die zugehoerigen Doku-/Execution-Updates.

---

## 0. Execution Contract (verbindlich fuer CLI-Agents)

### Scope In

- neue Quelle/Provider in den aktiven Delivery-Prozess heben
- Key-/Token-/Env-Pflichten in allen betroffenen Schichten nachziehen
- references- und execution-seitige Synchronisation sicherstellen

### Scope Out

- rein theoretische Katalogeintraege ohne Umsetzungsabsicht
- API-Design-Details ohne Source-Onboarding-Bezug

### Mandatory Upstream Sources (vor Abarbeitung lesen)

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/references/README.md`
- `docs/references/status.md`
- `docs/references/sources/README.md`
- `docs/REFERENCE_SOURCE_STATUS.md`

### Arbeitsprinzip

- Neue Quelle ist erst "delivery-ready", wenn Env, Status, Source-Katalog und Verify-Owner synchron sind.
- Root-Dokumente bleiben Einstieg und Kontext, Execution-MDs bleiben Arbeitsvertrag.

---

## 1. Wann dieses Dokument greift

Dieses Dokument gilt, wenn mindestens eines davon zutrifft:

- neuer Provider / neue Quelle wird aufgenommen
- bestehende Quelle bekommt neue Auth- oder Token-Pflicht
- neue `BASE_URL`, `API_KEY`, `TOKEN`, `TIMEOUT`- oder Routing-Variable entsteht
- ein Provider aus `docs/references/sources/*.md` in echte Umsetzung oder Scaffold uebergeht

---

## 2. Pflicht-Update-Regel fuer Env-Dateien

### Immer pruefen

Wenn ein Provider auth- oder runtime-relevante Konfiguration braucht, muessen
die folgenden Vorlagen bewusst geprueft werden:

| Ort | Dateien |
|-----|---------|
| Root / Next.js | `.env.example`, `.env.development`, `.env.production` |
| Go Gateway | `go-backend/.env.example`, `go-backend/.env.development`, `go-backend/.env.production` |
| Python Services | `python-backend/.env.example`, `python-backend/.env.development` |

### Entscheidungsregel

| Fall | Wo muss die Variable hin? |
|------|----------------------------|
| Frontend-/BFF-Flag, UI-Mode, Gateway-URL | Root `.env.*` |
| Externer Provider wird von Go gefetcht | `go-backend/.env.*` |
| Externer Provider wird direkt von Python-Service gefetcht | `python-backend/.env.*` |
| Gemeinsamer, schichtenuebergreifender Runtime-Schalter | Root plus betroffene Service-Env |

### Nicht vergessen

- `*.example` dokumentiert den neuen Schalter
- `*.development` enthaelt dev-taugliche Defaults oder leere Platzhalter
- `*.production` enthaelt produktionsgeeignete Defaults oder leere Platzhalter

---

## 3. Pflicht-Update-Regel fuer Doku

Bei neuen Quellen oder Keys sind mindestens diese Stellen zu pruefen:

| Bereich | Pflicht |
|---------|---------|
| Referenz-Katalog | passendes `docs/references/sources/*.md` oder `projects/*.md` |
| Aktiver Status | `docs/references/status.md` |
| Root-Bridge | nur wenn Einstieg / Pfad sich aendert |
| Execution | dieses Dokument + ggf. `infra_provider_delta.md` |
| Specs | nur wenn Contract / Boundary / Ownership sich aendert |

---

## 4. Provider-Key-Matrix (heute)

### Go-fetchte Provider mit expliziter Key-/Credential-Pflicht

| Provider | Variable(n) | Ort |
|---------|--------------|-----|
| `finnhub` | `FINNHUB_API_KEY` | `go-backend/.env.*` |
| `fred` | `FRED_API_KEY` | `go-backend/.env.*` |
| `acled` | `ACLED_API_TOKEN`, `ACLED_EMAIL`, `ACLED_ACCESS_KEY` | `go-backend/.env.*` |
| `banxico` | `BANXICO_API_TOKEN` | `go-backend/.env.*` |
| `bok` | `BOK_ECOS_API_KEY` | `go-backend/.env.*` |
| `gct` | `GCT_USERNAME`, `GCT_PASSWORD` oder `*_ENC` + AES-Key | `go-backend/.env.*` |

### Root-/Frontend-seitige relevante Runtime-Pfade

| Thema | Variable(n) | Ort |
|-------|--------------|-----|
| Gateway-Basis | `GO_GATEWAY_BASE_URL` | Root `.env.*` |
| Secure provider-cookie storage | `PROVIDER_CREDENTIALS_COOKIE_SECRET`, `PROVIDER_CREDENTIALS_COOKIE_MAX_AGE_SECONDS` | Root `.env.*` |
| Geopolitical Modes | `GEOPOLITICAL_INGEST_*`, `GEOPOLITICAL_*` | Root `.env.*` |
| Indicator-/Soft-Signal URLs | `INDICATOR_SERVICE_URL`, `GEOPOLITICAL_SOFT_SIGNAL_URL` | Root `.env.*` und Go `.env.*` bei direkter Service-Nutzung |

---

## 5. Onboarding-Checklist fuer neue auth-pflichtige Quellen

- [ ] Quelle in passendem `docs/references/sources/*.md` oder `projects/*.md` erfasst
- [ ] `docs/references/status.md` mit `Scaffold` / `Implementiert` / `Geplant` erweitert
- [ ] Env-Variablen in allen betroffenen `*.example`, `*.development`, `*.production` Vorlagen ergaenzt
- [ ] Variablennamen und Kommentartext zwischen Dev/Prod konsistent gehalten
- [ ] Falls Gateway-fetchend: `go-backend/.env.*` geprueft
- [ ] Falls Root-/BFF-relevant: Root `.env.*` geprueft
- [ ] Falls Python-fetchend: `python-backend/.env.*` geprueft
- [ ] `infra_provider_delta.md` ergaenzt, wenn neuer Rollout- oder Verify-Block noetig ist
- [ ] API-/Contract-Spec geprueft, falls Request-/Payload-Grenzen neu sind

---

## 6. Rollout-Hinweis fuer References-Struktur

Wenn eine Quelle nur im Katalog auftaucht, aber noch keinen Scaffold hat:

- `docs/references/sources/*.md` = ja
- `docs/references/status.md` = optional `Geplant` / `Scaffold`, wenn konkret
- Env-Dateien = nur dann, wenn bereits klar ist, welche Variable wirklich kommt

Wenn eine Quelle in echten Scaffold oder Implementierung uebergeht:

- Env-Dateien sind Pflicht
- dieses Dokument ist Pflicht
- `infra_provider_delta.md` sollte den Verify-/Rollout-Pfad nennen

---

## 7. Querverweise

| Thema | Dokument |
|------|----------|
| Aktive Statusmatrix | [`../../references/status.md`](../../references/status.md) |
| Provider-Rollout / Verify | [`infra_provider_delta.md`](./infra_provider_delta.md) |
| Gesamtroadmap | [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) |
| Doku-Struktur | [`../DOCUMENTATION_ARCHITECTURE.md`](../DOCUMENTATION_ARCHITECTURE.md) |

---

## 8. Evidence Requirements

Bei jedem neuen auth-pflichtigen Onboarding:

- Quelle + Owner + Zielstatus (`Scaffold`/`Implementiert`)
- Env-Diff-Liste (welche `.env.*`-Vorlagen angepasst wurden)
- Verify-Block-Verweis (`MC*`, `PV.*` oder neuer Rollout-Block)
- aktualisierte Referenzstellen (`sources/*.md`, `references/status.md`)

---

## 9. Exit Criteria

- keine neue auth-pflichtige Quelle ohne vollstaendige Env-/Doku-Kette
- `references/status.md` und `infra_provider_delta.md` zeigen denselben Rollout-Zustand
- API-/Boundary-Aenderungen sind in Specs gespiegelt
