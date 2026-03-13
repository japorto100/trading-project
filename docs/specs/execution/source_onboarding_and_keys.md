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
- `docs/specs/execution/source_selection_delta.md`
- `docs/references/README.md`
- `docs/references/status.md`
- `docs/references/sources/README.md`
- `docs/REFERENCE_SOURCE_STATUS.md`

### Arbeitsprinzip

- Tiering-/Auswahlentscheidung in `source_selection_delta.md` kommt vor Env-/Key-Onboarding.
- Onboarding ist nicht das Ende der Kette: danach folgen Persistenz-/Cadence-
  Entscheidungen ueber `source_persistence_snapshot_delta.md`.
- Neue Quelle ist erst "delivery-ready", wenn Env, Status, Source-Katalog und Verify-Owner synchron sind.
- Root-Dokumente bleiben Einstieg und Kontext, Execution-MDs bleiben Arbeitsvertrag.

---

## 1. Wann dieses Dokument greift

Dieses Dokument gilt, wenn mindestens eines davon zutrifft:

- neuer Provider / neue Quelle wird aufgenommen
- bestehende Quelle bekommt neue Auth- oder Token-Pflicht
- neue `BASE_URL`, `API_KEY`, `TOKEN`, `TIMEOUT`- oder Routing-Variable entsteht
- ein Provider aus `docs/references/sources/*.md` in echte Umsetzung oder Scaffold uebergeht

**Voraussetzung:** Die Quelle wurde vorher ueber `source_selection_delta.md` als
delivery-wuerdig eingeordnet; reine Katalogeintraege ohne Tiering-Entscheid sind
kein Anlass fuer Onboarding.

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
| Execution | dieses Dokument + ggf. `infra_provider_delta.md` + `source_persistence_snapshot_delta.md` |
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
| `finra ats` | `FINRA_API_CLIENT_ID`, `FINRA_API_CLIENT_SECRET`, `FINRA_API_BEARER_TOKEN` | `go-backend/.env.*` |
| `gct` | `GCT_USERNAME`, `GCT_PASSWORD` oder `*_ENC` + AES-Key | `go-backend/.env.*` |

### Go-fetchte Provider ohne Key, aber mit explizitem Runtime-URL-Contract

| Provider | Variable(n) | Ort |
|---------|--------------|-----|
| `seco sanctions` | `SECO_SANCTIONS_URL` | `go-backend/.env.*` |
| `eu sanctions` | `EU_SANCTIONS_URL` | `go-backend/.env.*` |
| `ofac sanctions` | `OFAC_SDN_URL` | `go-backend/.env.*` |
| `un sanctions` | `UN_SANCTIONS_URL` | `go-backend/.env.*` |
| `finra ats` | `FINRA_ATS_API_URL`, `FINRA_ATS_HTTP_TIMEOUT_MS`, `FINRA_OAUTH_TOKEN_URL` | `go-backend/.env.*` |
| `adb` | `ADB_BASE_URL`, `ADB_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `ecb fx` | `ECB_RATES_URL`, `ECB_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `bcb` | `BCB_BASE_URL`, `BCB_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `imf` | `IMF_BASE_URL`, `IMF_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `oecd` | `OECD_BASE_URL`, `OECD_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `worldbank` | `WORLDBANK_BASE_URL`, `WORLDBANK_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `un macro` | `UN_BASE_URL`, `UN_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `bcra` | `BCRA_BASE_URL`, `BCRA_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `tcmb` | `TCMB_EVDS_BASE_URL`, `TCMB_EVDS_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `rbi` | `RBI_DBIE_BASE_URL`, `RBI_DBIE_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `ofr` | `OFR_BASE_URL`, `OFR_HTTP_TIMEOUT_MS`, `OFR_CACHE_TTL_MS` | `go-backend/.env.*` |
| `nyfed` | `NYFED_BASE_URL`, `NYFED_HTTP_TIMEOUT_MS`, `NYFED_CACHE_TTL_MS` | `go-backend/.env.*` |
| `financebridge` | `FINANCE_BRIDGE_URL`, `FINANCE_BRIDGE_URLS`, `FINANCE_BRIDGE_HTTP_TIMEOUT_MS` | `go-backend/.env.*` |
| `indicatorservice` | `INDICATOR_SERVICE_URL`, `INDICATOR_SERVICE_TIMEOUT_MS` | `go-backend/.env.*` |
| `softsignals` | `GEOPOLITICAL_SOFT_SIGNAL_URL`, `GEOPOLITICAL_SOFT_SIGNAL_TIMEOUT_MS` | `go-backend/.env.*` |
| `geopoliticalnext` | `GEOPOLITICAL_FRONTEND_API_URL`, `GEOPOLITICAL_FRONTEND_API_TIMEOUT_MS` | `go-backend/.env.*` |
| `memory` | `MEMORY_SERVICE_URL`, `MEMORY_SERVICE_TIMEOUT_MS` | `go-backend/.env.*` |
| `agentservice` | `AGENT_SERVICE_URL`, `AGENT_SERVICE_TIMEOUT_MS` | `go-backend/.env.*` |
| `acled` | `ACLED_BASE_URL`, `ACLED_HTTP_TIMEOUT_MS`, `ACLED_SNAPSHOT_STATE_PATH` | `go-backend/.env.*` |
| `gdelt` | `GDELT_BASE_URL`, `GDELT_HTTP_TIMEOUT_MS`, `GDELT_HTTP_RETRIES` | `go-backend/.env.*` |
| `gdelt news` | `GDELT_NEWS_SNAPSHOT_STATE_PATH`, plus `GDELT_BASE_URL`, `NEWS_HTTP_TIMEOUT_MS`, `NEWS_HTTP_RETRIES` | `go-backend/.env.*` |
| `news rss basket` | `NEWS_RSS_FEEDS`, `NEWS_HTTP_TIMEOUT_MS`, `NEWS_HTTP_RETRIES` | `go-backend/.env.*` |
| `finviz rss` | `FINVIZ_RSS_BASE_URL`, `NEWS_HTTP_TIMEOUT_MS`, `NEWS_HTTP_RETRIES` | `go-backend/.env.*` |
| `crisiswatch` | `CRISISWATCH_RSS_URL`, `CRISISWATCH_HTTP_TIMEOUT_MS`, `CRISISWATCH_CACHE_TTL_MS`, `CRISISWATCH_CACHE_PERSIST_PATH`, `CRISISWATCH_SNAPSHOT_STATE_PATH` | `go-backend/.env.*` |
| `gametheory` | `GEOPOLITICAL_GAMETHEORY_URL`, `GEOPOLITICAL_GAMETHEORY_TIMEOUT_MS` | `go-backend/.env.*` |

### Root-/Frontend-seitige relevante Runtime-Pfade

| Thema | Variable(n) | Ort |
|-------|--------------|-----|
| Gateway-Basis | `GO_GATEWAY_BASE_URL` | Root `.env.*` |
| Secure provider-cookie storage | `PROVIDER_CREDENTIALS_COOKIE_SECRET`, `PROVIDER_CREDENTIALS_COOKIE_MAX_AGE_SECONDS` | Root `.env.*` |
| Geopolitical Modes | `GEOPOLITICAL_INGEST_*`, `GEOPOLITICAL_*` | Root `.env.*` |
| Indicator-/Soft-Signal URLs | `INDICATOR_SERVICE_URL`, `GEOPOLITICAL_SOFT_SIGNAL_URL` | Root `.env.*` und Go `.env.*` bei direkter Service-Nutzung |
| Internal service bridges / geo proxy | `FINANCE_BRIDGE_URL`, `FINANCE_BRIDGE_URLS`, `GEOPOLITICAL_FRONTEND_API_URL`, `MEMORY_SERVICE_URL`, `AGENT_SERVICE_URL` | primaer `go-backend/.env.*`; Root nur wenn die BFF-/UI-Schicht denselben Pfad explizit braucht |

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

## 6. Aktuelle Delivery-Reihenfolge nach SS6

### Prioritaet A — bereits integrierte Tier-1-/Credential-Pfade sauber schliessen

| Quelle | Warum jetzt | Onboarding-Lage |
|--------|-------------|-----------------|
| `finnhub` | produktnaher Market-Default; Browser-/SSE-Gates noch offen | `FINNHUB_CACHE_TTL_MS` fuehrt jetzt den cache-first Quote-Pfad; Live-/UI-Verifikation in `infra_provider_delta.md` spaeter schliessen |
| `fred` | request-scoped Credential-Pfad bereits angelegt | Env-/Doku-Kette steht; `FRED_CACHE_TTL_MS` fuehrt jetzt den cache-first Pfad, echter Quote-/Error-Pfad und Live-Verify bleiben spaeter offen |
| `banxico`, `bok` | Tier-1-EM-Zentralbanken bereits im Gateway verdrahtet | Env-/Doku-Kette steht; `BANXICO_CACHE_TTL_MS` und `BOK_ECOS_CACHE_TTL_MS` fuehren jetzt den cache-first Pfad, UI-/Live-E2E fuer denselben Key-Pfad bleibt spaeter offen |

### Prioritaet B — offizielle Tier-1-Quellen, bei denen Runtime noch hinter der Selection liegt

| Quelle | Warum jetzt | Onboarding-Lage |
|--------|-------------|-----------------|
| `SECO Sanctions` | Tier-1 dokumentiert und jetzt auf offiziellem XML-Primärpfad | `SECO_SANCTIONS_URL` zeigt jetzt auf den offiziellen XML-Download; der Go-Watcher faellt bei transienten Problemen auf OpenSanctions zurueck, Live-Verify bleibt spaeter offen |
| `EU Sanctions` | Tier-1 dokumentiert, offizieller Machine-Readable-Pfad im Runtime-Slice noch nicht primaer | `EU_SANCTIONS_URL` jetzt explizit in `go-backend/.env.*`; naechster Schritt ist offizieller EU-Datensatz plus Parser-/Verify-Migration |
| `FINRA ATS` | Tier-1 fuer Microstructure-/Dark-Pool-Slices, aber nur Scaffold | Env-URL/Timeout/OAuth-Variablen jetzt explizit; Request-Haertung fuer Fields/Limit/Offset/CompareType und Async-Response-Guard sind drin, offen bleiben file-download-Zweig und spaeterer Live-Run |

### Prioritaet C — echte Coverage-Erweiterung nur bei klarer Luecke

| Quelle | Trigger | Onboarding-Lage |
|--------|---------|-----------------|
| `ADB` | Asien-/regionaler Makro-Bedarf, den `IMF` / `World Bank` / `OECD` nicht sauber decken | Env-Basis jetzt explizit; trotz Wiring bleibt der Connector Scaffold, bis ein echter Regional-Gap und die `GetSeries`-Integration belegt sind |
| `PBoC` | nachgewiesene Aktualitaets- oder Policy-Luecke gegen die globale Baseline | nur dann Auth-/Contract-/Statusarbeit starten, sonst Baseline ausreichend |

### Nicht als naechstes onborden

- neue Long-tail-Quellen ohne dokumentierten Produkt-Trigger
- weitere aehnliche REST-Market-Provider ohne klare Coverage- oder Failover-Luecke
- neue auth-pflichtige Quellen, solange die offenen Tier-1-Credential-Pfade nicht live verifiziert sind
- Research-/Compliance-Spezialfeeds wie `FINMA Enforcement`, `SEC Enforcement RSS`, `FINRA Margin Statistics`, `BIS EWI`, `BIS RCAP`, `FSB NBFI Report`, solange noch kein dokumentierter Produkt- oder Policy-Trigger existiert

### Deferred Verify-Follow-up fuer bestehende Quellen

- [ ] `finnhub`, `fred`, `banxico`, `bok`: echter Live-/Browser-Verify gegen
  laufenden Stack nachziehen
- [ ] `OFAC`, `UN`, `SECO`, `CFTC`: Object-Storage-Live-Gate nachziehen, sobald
  der lokale Snapshot-Bootstrap auf SeaweedFS statt Filesystem schreibt
- [ ] `ACLED`, `CrisisWatch`: `api-snapshot`-Live-Gates gegen laufenden
  Object-Storage und echte Upstream-Laeufe nachziehen
- [ ] `GDELT News`: erster `api-snapshot`-Pfad gegen laufenden Object-Storage und
  echten Upstream-Lauf verifizieren, nachdem der lokale Bootstrap dokumentiert
  ist
- [ ] `EU Sanctions`: offizieller Runtime-Switch plus anschliessender
  Live-Verify
- [ ] `FINRA ATS`: offizieller payload-/download-Zweig plus anschliessender
  Live-Run mit Credentials

### Todo-Batch vor weiteren neuen Quellen

- [ ] `EU Sanctions` offiziellen Runtime-/Parserpfad schliessen
- [ ] `FINRA ATS` download-Zweig und produktiven Replay-/Snapshot-Pfad schliessen
- [ ] bestehende `api-hot`-Cache-Vertraege fuer `Finnhub`, `FRED`, `Banxico`,
  `BoK`, `OFR`, `NYFed` in den Owner-Dokumenten konsistent halten
- [ ] Source-Persistence- und Storage-Slices vor jeder neuen file-/snapshot-
  Quelle zuerst nachziehen
- [ ] neue auth-pflichtige Quellen weiter zurueckstellen, solange die aktiven
  Tier-1-Pfade nicht mindestens dokumentarisch komplett geschlossen sind

---

## 7. Rollout-Hinweis fuer References-Struktur

Wenn eine Quelle nur im Katalog auftaucht, aber noch keinen Scaffold hat:

- `docs/references/sources/*.md` = ja
- `docs/references/status.md` = optional `Geplant` / `Scaffold`, wenn konkret
- Env-Dateien = nur dann, wenn bereits klar ist, welche Variable wirklich kommt

Wenn eine Quelle in echten Scaffold oder Implementierung uebergeht:

- Env-Dateien sind Pflicht
- dieses Dokument ist Pflicht
- `infra_provider_delta.md` sollte den Verify-/Rollout-Pfad nennen

---

## 8. Querverweise

| Thema | Dokument |
|------|----------|
| Aktive Statusmatrix | [`../../references/status.md`](../../references/status.md) |
| Quellenauswahl / Tiering | [`source_selection_delta.md`](./source_selection_delta.md) |
| Persistenz / Snapshot Policy | [`source_persistence_snapshot_delta.md`](./source_persistence_snapshot_delta.md) |
| Provider-Rollout / Verify | [`infra_provider_delta.md`](./infra_provider_delta.md) |
| Gesamtroadmap | [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) |
| Doku-Struktur | [`../DOCUMENTATION_ARCHITECTURE.md`](../DOCUMENTATION_ARCHITECTURE.md) |

---

## 9. Evidence Requirements

Bei jedem neuen auth-pflichtigen Onboarding:

- Quelle + Owner + Zielstatus (`Scaffold`/`Implementiert`)
- Env-Diff-Liste (welche `.env.*`-Vorlagen angepasst wurden)
- Verify-Block-Verweis (`MC*`, `PV.*` oder neuer Rollout-Block)
- aktualisierte Referenzstellen (`sources/*.md`, `references/status.md`)

---

## 10. Exit Criteria

- keine neue auth-pflichtige Quelle ohne vollstaendige Env-/Doku-Kette
- `references/status.md` und `infra_provider_delta.md` zeigen denselben Rollout-Zustand
- API-/Boundary-Aenderungen sind in Specs gespiegelt
