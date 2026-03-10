# Infra, Provider Rollout & Runtime Deltas

> **Stand:** 09. Maerz 2026
> **Zweck:** Aktiver Delta-Plan fuer Provider-Rollout, Credential-Transport,
> Messaging/Infra-Follow-ups und weitere Go-/Gateway-nahe Architekturarbeit.
> Dieses Dokument traegt nur noch offene oder noch lebendige Deltas.

---

## 0. Execution Contract (verbindlich fuer CLI-Agents)

### Scope In

- Credential-Flows (ENV + request-scoped)
- Provider-Rollout und Verify-Contract pro Batch
- Runtime-nahe Infra-Deltas (Messaging, Lock-Contention, Stream-hardening)

### Scope Out

- tiefe Compute-Portierungsfragen (Owner: `compute_delta.md`)
- GeoMap-Produkt-/UX-Detailarbeit (Owner: `geomap_closeout.md`)
- rein katalogische Quellenpflege ohne Rolloutbezug

### Mandatory Upstream Sources (vor Abarbeitung lesen)

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/GO_GATEWAY.md`
- `docs/go-gct-gateway-connections.md`
- `docs/references/status.md`
- `docs/references/sources/README.md`
- `docs/specs/execution/source_onboarding_and_keys.md`

### Arbeitsprinzip

- Provider-Rollout wird batchweise geschlossen, nicht als unverbundene Einzelaufgaben.
- Jede Batch-Schliessung braucht Verify-Evidence und Doku-Propagation in `references/*`.

---

## 1. Market Credential Flow Verify

**Voraussetzung:** Next.js + Go Gateway laufen.

- [x] **MC1** — In `Settings` Finnhub-Key speichern; kein Secret-`localStorage`,
      sondern serverlesbarer, verschluesselter Cookie `tradeview_provider_credentials`
- [ ] **MC2** — `GET /api/market/providers` zeigt `requiresAuth=true` und
      `configured=true` fuer `finnhub`
- [ ] **MC3** — Quote-E2E ohne ENV-Zwang:
  - Gateway-ENV-Key leer
  - Browser-/Cookie-Pfad vorhanden
  - `GET /api/market/quote?symbol=AAPL` erfolgreich
- [ ] **MC4** — SSE-E2E:
  - `AAPL` Stream / Watchlist funktioniert ueber denselben Credential-Pfad
- [ ] **MC5** — Negativfall:
  - Cookie loeschen / leerer Key
  - sauberer Fehlerpfad statt stiller Frontend-Fallback

### Market Credential Flow Evidence (2026-03-09)

- `finnhub`:
  - Next-Route-Tests belegen `MC1-MC3` auf Transportebene:
    - `POST /api/market/provider-credentials` setzt jetzt einen normalisierten,
      serverlesbaren, verschluesselten `HttpOnly`-Cookie
      `tradeview_provider_credentials`
    - der Cookie ist auf `/api/market` scoped, `SameSite=Strict` und
      `Cache-Control: no-store` ist fuer die BFF-Mutation gesetzt
    - das Settings-Panel persistiert Browser-Secrets nicht mehr in `localStorage`;
      nur provider priority bleibt lokal
    - der BFF-Pfad unterstuetzt jetzt `merge/remove` fuer einzelne Provider statt
      nur blindem Voll-Replace
    - `GET /api/market/providers` zeigt `finnhub` mit `requiresAuth=true` und `configured=true`, wenn der Cookie vorhanden ist
    - `GET /api/market/quote?symbol=AAPL` rekonstruiert den `X-Tradeview-Provider-Credentials`-Header aus dem Cookie und liefert den Quote-Pfad ohne ENV-Zwang
  - Stream-/SSE-Route ist jetzt ebenfalls auf Transportebene verifiziert:
    - `GET /api/market/stream?symbol=AAPL` rekonstruiert denselben `X-Tradeview-Provider-Credentials`-Header aus dem Cookie fuer den Go-SSE-Pfad
    - wenn der Go-Stream fehlschlaegt und `MARKET_STREAM_LEGACY_FALLBACK_ENABLED=false` gesetzt ist, liefert die Route einen expliziten `502`-Fehler mit `X-Stream-Backend=unavailable` statt still auf Legacy-Polling zu fallen
    - `GET /api/market/stream/quotes?symbols=AAPL,MSFT` rekonstruiert denselben Header fuer den Go-Multiplex-/Watchlist-Pfad
    - dabei wurde ein echter Close-/Cancel-Bug im Multiplex-Stream behoben: `cancel()` toleriert jetzt bereits geschlossene Controller statt mit `ERR_INVALID_STATE` zu brechen
  - Negativpfad ist auf Route-Ebene verifiziert: Upstream-Fehler liefern `502 Gateway quote request failed` statt stillen Frontend-Fallback
  - Go-Gateway-Hardening:
    - `X-Tradeview-Provider-Credentials` wird jetzt vor dem Decode auf
      Groessenlimit geprueft
    - Anzahl Provider und einzelne Credential-Felder sind ebenfalls begrenzt
- `fred`:
  - Connector nutzt jetzt denselben request-scoped Credential-Pfad wie `finnhub`
  - Go-Test belegt, dass `requestctx.ProviderCredentials` den FRED-`api_key` uebersteuert
- `banxico` und `bok`:
  - Connectoren akzeptieren jetzt denselben request-scoped Credential-Pfad auf Go-Seite
  - Go-Tests belegen:
    - `banxico`: `Bmx-Token` wird aus request-scoped Credentials gesetzt
    - `bok`: ECOS-Pfad wird mit request-scoped API-Key aufgebaut
  - UI-/BFF-Seite besitzt jetzt Settings-Felder fuer `FRED`, `Banxico` und `BoK`, ohne neue Route-Familien einzufuehren
- Offizielle API-Contracts wurden gegen Primaerquellen geprueft:
  - Finnhub Quote-/WebSocket-Doku unter `https://finnhub.io/docs/api/*`
  - FRED `series/observations` V1 unter `https://fred.stlouisfed.org/docs/api/fred/series_observations.html`
  - Banxico SIE REST unter `https://www.banxico.org.mx/SieAPIRest/service/v1/`
  - BoK ECOS Open API unter `https://ecos.bok.or.kr/api/`
- Noch offen bleiben echte Browser-/Live-E2E-Gates fuer `MC4` (Watchlist/echter Streamlauf) und ein vollstaendiger UI-manualer `MC5`-Durchlauf

- [x] **BC1** — Benchmark-Baseline in `go-gct-gateway-connections.md` dokumentiert;
      `go test -bench=. -benchmem` im Paket `market/streaming` reproduzierbar

---

## 2. Provider Rollout Matrix

### Gemeinsamer Verify-Contract

Fuer jeden Provider gilt mindestens:

- [ ] `PV.1` Reachability / Health
- [ ] `PV.2` ein representativer Happy Path
- [ ] `PV.3` ein sauberer Error Path
- [ ] `PV.4` stabiles Gateway-Response-Shape
- [ ] `PV.5` nachvollziehbare Observability (`requestId`, logs, error class)

Fuer auth-pflichtige Provider zusaetzlich:

- [ ] `PV.A1` ENV-only funktioniert
- [ ] `PV.A2` request-scoped Override funktioniert
- [ ] `PV.A3` fehlende Credentials liefern keinen stillen Fallback

### Batch 1 — User-Key / request-scoped credential provider

| Provider | Status | Naechster Schritt |
|:---------|:-------|:------------------|
| `finnhub` | transportseitig weitgehend verifiziert | `MC4-MC5` live/browserseitig schliessen |
| `fred` | request-scoped transport verifiziert | live Quote-/Error-Path gegen denselben Credential-Transport nachziehen |
| `banxico` | request-scoped transport verifiziert | Live Quote-/UI-E2E auf denselben Pfad heben |
| `bok` | request-scoped transport verifiziert | Live Quote-/UI-E2E auf denselben Pfad heben |

### Batch 2 — Public / no-auth macro provider

| Providergruppe | Restarbeit |
|:---------------|:-----------|
| `ecb`, `bcb`, `bcra`, `tcmb`, `rbi`, `imf`, `oecd`, `worldbank`, `un`, `adb`, `ofr`, `nyfed` | je ein Success- und ein Invalid-/No-Data-Pfad statt Einzelueberengineering |

### Batch 2 Evidence (2026-03-10)

- `oecd`:
  - Go-Connector-Tests decken jetzt einen repräsentativen Happy Path und einen Bad-Request-Path ab
  - Happy Path: `OECD_USA_GDP_IDX_Q` wird erfolgreich geparst und als latest-first Series geliefert
  - Error Path: unvollstaendiges Symbol liefert sauber `400` statt generischem Fehler
- `worldbank`:
  - Go-Connector-Tests decken jetzt einen repräsentativen Happy Path und einen Bad-Request-Path ab
  - Dabei wurde ein echter Connector-Fehler behoben:
    - die WDI-Symbol-Parserlogik zerlegte `FREQ_SERIES_REF_AREA` bisher falsch, sobald der `SERIES`-Teil selbst Unterstriche enthaelt
    - `WB_WDI_A.SP_POP_TOTL.USA` wird jetzt korrekt als `FREQ=A`, `SERIES=SP_POP_TOTL`, `REF_AREA=USA` normalisiert
  - Error Path: unvollstaendiges Symbol liefert sauber `400`
- `un`:
  - Go-Connector-Tests decken jetzt einen repräsentativen Happy Path und einen Bad-Request-Path ab
  - Dabei wurde ein echter Contract-Fehler behoben:
    - der erste Scaffold/Patch ging noch von einem falschen Basis-URL-/Pfadmuster `.../ws/rest/sdmx/data/UN/...` aus
    - die offizielle UNdata-REST-Doku legt stattdessen `.../ws/rest/data/{dataflow}/{key}` fest; JSON-Datenabruf erfolgt mit `Accept: text/json`
    - der Connector verwendet deshalb jetzt einen expliziten Symbolvertrag `UN_<DATAFLOW>__<KEY>`; `__` trennt Dataflow und Key eindeutig, waehrend Unterstriche innerhalb der Dimension-Codes erhalten bleiben
    - Gateway-seitig wird das kanonische Symbol ueber `currency.Code` uppercased; der Connector und die Tests behandeln diese Form als normal
  - Error Path: unvollstaendiges Symbol liefert sauber `400`
- `nyfed`:
  - Go-Connector-Tests decken jetzt einen repräsentativen Happy Path und einen Bad-Request-Path ab
  - Implementiert wurde bewusst der klar dokumentierte Reference-Rates-Pfad der offiziellen Markets API:
    - `/api/rates/secured/{rate}/search.json`
    - `/api/rates/unsecured/{rate}/search.json`
  - Aktuell sind die offiziellen Rate-Typen `SOFR`, `TGCR`, `BGCR`, `EFFR` und `OBFR` als stabile Makro-Symbole eingebunden
  - Der Connector rechnet fuer historische Suche automatisch ein begrenztes Datumsfenster vor, parst `refRates[].effectiveDate` plus `refRates[].percentRate` und liefert latest-first
  - Error Path: unbekanntes Symbol liefert sauber `400`
- `ofr`:
  - Go-Connector-Tests decken jetzt einen repräsentativen Happy Path und einen Bad-Request-Path ab
  - Implementiert wurde bewusst der offiziell dokumentierte STFM-Pfad `https://data.financialresearch.gov/v1/series/full?mnemonic=...`
  - Der Connector akzeptiert jetzt `OFR_<DATASET>-<SERIES_IDENTIFIER>` als Gateway-Symbolvertrag, setzt `mnemonic`, `start_date`, `end_date` und `remove_nulls=true` und parst `timeseries.aggregation` als `[date, value]`
  - Die Symbolvalidierung ist absichtlich enger als beim Scaffold: laut OFR-Doku muessen Mnemonics dem Muster `[DATASET]-[SERIES_IDENTIFIER]` folgen; beliebige `OFR_*`-Strings werden daher als `400` abgewiesen
- Regressions-/Suite-Nachweis:
  - `go test ./internal/connectors/worldbank ./internal/connectors/oecd ./internal/connectors/un ./internal/connectors/nyfed ./internal/connectors/ofr`
  - `go test ./internal/connectors/imf ./internal/connectors/ecb ./internal/connectors/bcb ./internal/connectors/bcra ./internal/connectors/tcmb ./internal/connectors/rbi ./internal/connectors/oecd ./internal/connectors/worldbank ./internal/connectors/un ./internal/connectors/nyfed ./internal/connectors/ofr`

### Batch 3 — GCT read-only exchange layer

| Exchangegruppe | Restarbeit |
|:---------------|:-----------|
| `binance`, `kraken`, `coinbase`, `okx`, `bybit`, `auto` router | gemeinsame Quote-/Orderbook-/Stream-Live-Gates mit laufendem GCT |

### Bulk / Diff Evidence (2026-03-10)

- `cftc`:
  - Der Bulk-Fetcher wurde auf den offiziell dokumentierten Historical-Compressed-Pfad der CFTC gehoben
  - Statt eines fragilen punktuellen CSV-Links nutzt der Default jetzt einen offiziellen ZIP-Download fuer den Financial-Futures-History-Slice
  - Dafuer wurde der generische `base.BulkFetcher` um ZIP-Support erweitert, statt CFTC-spezifische Sonderlogik einzubauen
  - Tests decken jetzt den ZIP-Entpackungspfad im Base-Fetcher sowie den COT-CSV-Parser ab
- `finra`:
  - bleibt vorerst offen; die Primärdoku verweist klar auf Developer-/File-Download-Spezifikationen, aber in der aktuellen Session lag noch kein belastbar auslesbarer offizieller Endpoint-/Payload-Contract fuer den produktiven Fetcher vor

### Batch 4 — Internal / bridge / service provider

| Gruppe | Restarbeit |
|:-------|:-----------|
| `financebridge`, `indicatorservice`, `softsignals`, `memory`, `agentservice`, `acled`, `gdelt`, `cfr`, `crisiswatch`, `gametheory` | representative smoke endpoints + error classification |

### Batch 4 Evidence (2026-03-10)

- `financebridge`:
  - Go-Tests decken jetzt einen reprÃ¤sentativen Happy Path fuer `quote`, `ohlcv` und `search` ab
  - `requestId`-Propagation in den Bridge-Transport ist fuer den Quote-Pfad belegt
  - `OHLCV`-Failover ueber mehrere Base-URLs ist belegt
  - Error-Klassifikation ist jetzt explizit belegt:
    - `search` mappt Upstream-Status sauber auf `financebridge search upstream status <code>`
- `indicatorservice`:
  - Go-Tests belegen den JSON-/IPC-POST-Pfad inklusive `Content-Type`, `Accept` und `X-Request-ID`
  - Der Transport-Fehlerpfad ist jetzt explizit belegt:
    - fehlende Reachability wird als `indicatorservice request failed: ...` klassifiziert statt still zu verschwinden
- `softsignals`:
  - Go-Tests belegen denselben JSON-/IPC-POST-Pfad inklusive `X-Request-ID`
  - Der Transport-Fehlerpfad ist jetzt explizit belegt:
    - fehlende Reachability wird als `softsignals request failed: ...` klassifiziert
- `memory`:
  - Es existieren jetzt echte Go-Client-Tests fuer den Python-Memory-Service
  - Happy Path:
    - `POST /api/v1/memory/kg/query` propagiert `X-Request-ID`, sendet JSON korrekt und normalisiert `rows` auf eine nicht-nil leere Liste
  - Error Path:
    - `GET /health` mappt einen Upstream-`503` sauber auf `memory client upstream GET status 503 for /health`
- `agentservice`:
  - Es existieren jetzt echte Go-Client-Tests fuer den Python-Agent-Service
  - Happy Path:
    - `POST /api/v1/agents/run` propagiert `X-Request-ID`, sendet JSON korrekt und gibt Status/Body unveraendert zurueck
  - Error-/Status-Klassifikation:
    - `GET /health` laesst Upstream-Status/Body bewusst durch; ein `502` bleibt fuer den aufrufenden Handler sichtbar statt verdeckt zu werden
- `acled`:
  - Happy Path, Bearer-/Legacy-Credential-Shape, Mock-Modus und Upstream-Status-Mapping sind bereits durch Go-Tests belegt
- `gdelt`:
  - Happy Path und Default-Query-/Limit-Clamp waren bereits belegt
  - zusaetzlich ist der Error Path jetzt explizit belegt:
    - Upstream-`502` mappt sauber auf `gdelt request failed with status 502`
- `cfr`:
  - bleibt im aktuellen Slice bewusst ein kuratierter statischer Kontext-Katalog und kein aktiver Live-Fetcher
  - non-live verifiziert sind Filter-/Limit-Verhalten des statischen Katalogs
  - eine echte Netzwerk-/Upstream-Fehlerklasse ist hier im aktuellen Contract nicht anwendbar, solange der Provider als kuratierte In-Repo-Quelle gefuehrt wird
- `crisiswatch`:
  - RSS-Happy Path, Filter, Upstream-Status-Mapping, TTL-Cache und Persist-Cache sind bereits durch Go-Tests belegt
- `gametheory`:
  - Happy Path, leerer-Input-Kurzschluss und Upstream-Status-Mapping sind bereits durch Go-Tests belegt
- Regressions-/Suite-Nachweis:
  - `go test ./internal/connectors/financebridge ./internal/connectors/indicatorservice ./internal/connectors/softsignals ./internal/connectors/memory ./internal/connectors/agentservice ./internal/connectors/acled ./internal/connectors/gdelt ./internal/connectors/cfr ./internal/connectors/crisiswatch ./internal/connectors/gametheory`

### Sanctions / GeoMap Evidence (2026-03-10)

- Der sanctions-/diff-Pfad ist im aktuellen Go-Stack bereits ueber Watcher plus GeoMap-Integration belegt:
  - `ofac.NewSDNWatcher(...)`
  - `un.NewSanctionsWatcher(...)`
  - `seco.NewSanctionsWatcher(...)`
  - `eu.NewSanctionsWatcher(...)`
  - `geomapsources.NewGeoMapSourcePack(...)`
  - `POST /api/v1/geopolitical/admin/sanctions-fetch`
- Verifiziert wurden:
  - XML-/JSON-Parser-Tests fuer `OFAC`, `UN`, `SECO`, `EU`
  - integrierter GeoMap sanctions pack mit Added->Candidate-Mapping
  - Admin-Handler fuer sanctions fetch inkl. leeren Erfolgsfalls und Error-/Unavailable-Pfaden
- Quellenwahrheit im aktuellen Runtime-Slice:
  - `OFAC` laeuft ueber offiziellen XML-Feed
  - `UN` laeuft ueber offiziellen consolidated XML-Feed
  - `SECO` ist offiziell als XML verfuegbar, laeuft aktuell aber ueber einen normalisierten JSON-Feed
  - `EU` laeuft aktuell ueber einen normalisierten JSON-Feed; ein primaerer offizieller Machine-Readable-Fetch ist im Runtime-Slice noch nicht belegt
- Regressions-/Suite-Nachweis:
  - `go test ./internal/connectors/un ./internal/connectors/eu ./internal/connectors/seco ./internal/connectors/geomapsources ./internal/handlers/http -run "Sanctions|GeoMapSourcePack|ParseUNSanctionsXML|ParseEUSanctionsJSON|ParseSECOSanctionsJSON"`

---

## 3. Offene Runtime- und Infra-Deltas

| Thema | Status | Restlage |
|:------|:-------|:---------|
| sqlc + pgxpool evaluation | teilweise | produktive DB-Grenze noch nicht gezogen |
| CandleBuilder Lock-Contention | offen | Shard-Lock/sync.Map Phase 19; Baseline in go-gct-gateway-connections |
| NATS JetStream | teilweise | Folgephasen fuer echte Async-Workloads offen |
| Object Storage Provider Rollout | teilweise | SeaweedFS host-nativ als Dev-Default verifiziert (Go-signed upload/download gegen S3-Endpunkt); produktnahe Dateitypen, Timeout-/Duplicate-/Interrupted-Error-Paths und Audit-Logs sind in Go verifiziert; Garage-Tooling ist angelegt, der host-native Windows-Build ist upstream durch Unix-only Code blockiert; CLI-S3-Smoke und HA-Follow-up bleiben offen |
| Connect-/Go-native sync boundary | offen | bei neuen Go↔Go bzw. Go↔Rust service-grenzen bevorzugt bewerten |
| SIMD / archsimd | offen | nur mit Profiling / Benchmarks entscheiden |
| weitere request-scoped credential consumers | offen | nach `finnhub` gezielt ausrollen |
| stream-first hardening | offen | Replay/Dedupe/Checkpoint-Regeln fuer SSE- und Live-Marktpfade konsolidieren |

---

## 4. Sofort sinnvolle Slices

1. `finnhub` live verifizieren und denselben Transport auf `fred` pruefen
2. weitere read-only Connectoren auf `RetryDecision(...)` und `CredentialStore`
   heben
3. GCT read-only slices weiter ueber `MarketTarget`-/shared-resolver-Grenzen
   konsolidieren
4. Capability-/router-Metadaten enger an echte Runtime-Adapter koppeln
5. SSE-/Stream-Hardening fuer Reconnect, Replay und kontrollierten REST-Fallback
   explizit verifizieren
6. SeaweedFS-Gateway-Slice um CLI-S3-Smoke und eine belastbare Garage-Gegenprobe (Windows-Fork oder Containerpfad) ergaenzen

### Object Storage HA / Replication Follow-up

- **OS.HA1** Dev bleibt Single-Node (`SeaweedFS` lokal, Garage nur als Gegenprobe), aber Staging darf nicht mit derselben Ausfallannahme bewertet werden
- **OS.HA2** Vor produktnahem Rollout muss der gewaehlte Kandidat einen expliziten Replica-/Failure-Domain-Nachweis liefern:
  - mindestens 2 unterschiedliche Storage-Failure-Domains
  - dokumentierte Verhaltenserwartung bei Node-Ausfall / Read-after-Write / Bucket-Recovery
- **OS.HA3** Gateway-seitig bleiben Artefakte immutable-by-default; Wiederholungen duerfen nur idempotent ueber Objekt-Key + Metadatenstatus laufen
- **OS.HA4** Fuer den finalen Kandidaten ist ein Verify-Satz noetig:
  - Upload waehrend partieller Storage-Stoerung
  - Download nach Restart / Rejoin
  - Checksums und Metadatenkonsistenz nach Recovery
  - klare Error-Class statt generischem `500`
- **OS.HA5** SeaweedFS- oder Garage-Entscheidung fuer Staging/Prod wird erst nach diesem Verify-Satz gehoben, nicht allein nach lokalem Dev-Erfolg

---

## 5. Compute-Abgrenzung

Die normative Compute-Schnittentscheidung lebt jetzt in
[`compute_delta.md`](./compute_delta.md).

Dieses Dokument behaelt davon nur die Infra-Folgen:

- Messaging / NATS
- provider / rollout / routing
- service-grenzen fuer spaetere Connect-/Go-/Rust-Pfade
- verify-vertraege fuer credential- und provider-lastige Slices

---

## 6. Keine neuen Infra-Minis

Auch im Infra-Bereich werden aktuell keine zusaetzlichen `mini4/5/6/7`
abgespalten.

Grund:

- Provider-Rollout, credential transport und infra follow-ups sind hier bereits
  thematisch sauber gebuendelt
- weitere Splits wuerden eher Agent-/CLI-Kontext zerstreuen als helfen

---

## 7. Querverweise

| Frage | Dokument |
|:------|:---------|
| Gesamtroadmap | [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) |
| Runtime-/Port-Wahrheit | [`../SYSTEM_STATE.md`](../SYSTEM_STATE.md) |
| Compute-Split Go/Python/Rust | [`compute_delta.md`](./compute_delta.md) |
| GeoMap Source-/Provider-Policy | [`../../geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`](../../geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md) |
| Quellen-/Key-Onboarding | [`source_onboarding_and_keys.md`](./source_onboarding_and_keys.md) |
| Gateway-/GCT-Arbeitsreferenz | [`../../go-gct-gateway-connections.md`](../../go-gct-gateway-connections.md) |

---

## 8. Evidence Requirements

Fuer jede geschlossene Provider- oder MC-Aufgabe:

- Provider/Batch-ID + Gate-ID (`MC*`, `PV.*`, Batch 1-4)
- Happy-Path + Error-Path Nachweis
- Request-ID-/Observability-Nachweis
- dokumentierter Credential-Pfad (ENV, request-scoped oder beides)
- Referenzstatus synchronisiert (`docs/references/status.md`)

---

## 9. Propagation Targets

- `docs/references/status.md`
- `docs/references/sources/*.md` (bei neuen/veraenderten Quellen)
- `docs/specs/execution/source_onboarding_and_keys.md` (bei neuen Keys)
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md` (wenn Runtime-/Boundary-Realitaet betroffen)

---

## 10. Exit Criteria

- `MC1-MC5` entschieden/geschlossen
- Batch 1-4 jeweils mit mindestens einem verifizierten Success+Error Muster
- keine auth-pflichtige Quelle ohne dokumentierten Key-/Onboarding-Pfad
