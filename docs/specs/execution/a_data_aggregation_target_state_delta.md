# Data Aggregation Target State Delta

> **Stand:** 18. Maerz 2026
> **Aenderungshistorie:**
> - Rev. 2 (18.03.2026): Phase-22g-Checkpoint — python-compute Split dokumentiert
> - Rev. 3 (18.03.2026): Phase-22g Quality Pass — ml_ai Merge in python-agent dokumentiert; Rust Agent Hotpaths als Datenpfad-Beschleuniger eingetragen; python-agent Datenrolle im Slice verankert
> **Zweck:** Aktiver Delta-Plan fuer die Operationalisierung des Zielbilds aus
> `docs/DATA_AGGREGATION_Master.md`. Fokus: Datenzonen, tabellarische Data
> Plane, Snapshot-/Artifact-Strategie, Retrieval-Schichten und spaetere
> Search-/Governance-Erweiterungen.

---

## 0. Execution Contract

### Scope In

- `raw -> normalized -> derived -> semantic` Zielzustand der Datenebene
- `DuckDB`, `Polars`, `Arrow`, `PyArrow`, `Parquet`, `Arrow Flight`
- `Postgres`, `SeaweedFS`, `Valkey`, `redb`
- `pgvector` versus `FalkorDB`
- optionale Data-Plane-Erweiterungen wie `Iceberg`, `OpenSearch`,
  `Meilisearch`, `Trino`, `GeoServer`, `OpenLineage`, `DataHub`

### Scope Out

- konkrete Fachlogik einzelner Datenquellen
- UI-/Frontend-Darstellung
- reine Agent-Orchestrierungsfragen ohne Data-Plane-Bezug
- produktive Live-Verify einzelner Providerpfade im Detail

### Mandatory Upstream Sources

- `docs/DATA_AGGREGATION_Master.md`
- `docs/ARCHITECTURE_NEW_EXTENSION.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/data/DATA_ARCHITECTURE.md`
- `docs/specs/data/STORAGE_AND_PERSISTENCE.md`
- `docs/specs/data/AGGREGATION_IST_AND_GAPS.md`
- `docs/specs/execution/source_persistence_snapshot_delta.md`
- `docs/specs/execution/vector_ingestion_delta.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/go-research-financial-data-aggregation-2025-2026.md`

### Arbeitsprinzip

1. Datenpfade werden von Quelle bis Retrieval in klaren Zonen gedacht, nicht als
   Sammlung isolierter Einzeltools.
2. Dateiformat, Compute-Format und Retrieval-Store muessen je Datenklasse
   explizit zugeordnet sein.
3. `Prepare`-Bausteine bleiben sichtbar, werden aber nur ueber konkrete Trigger
   und Verify-Gates aktiviert.

---

## 1. Leitregeln

1. **Go owns ingestion, routing und source-class decisions.**
2. **Object-first fuer snapshots und grosse Artefakte.**
3. **Postgres fuehrt Metadaten und relationale Betriebsdaten.**
4. **DuckDB / Polars / Arrow / Parquet bilden die tabellarische Standardlinie.**
5. **`redb` bleibt lokaler OHLCV-/compute-cache, kein allgemeiner Store.**
6. **`pgvector` und `FalkorDB` werden nach Datenklasse getrennt eingesetzt.**
7. **`OpenSearch`, `Iceberg`, `DataHub`, `OpenLineage` sind Ausbaupfade, nicht Baseline.**

---

## 2. Zielbild-Bloecke

| Block | Zielzustand | Offener Delta-Punkt |
|:------|:------------|:--------------------|
| Datenzonen | raw / normalized / derived / semantic / episodic | objektive Zuordnung je Pfad festziehen |
| Tabellarische Compute-Schicht | DuckDB + Polars + Arrow + Parquet | Standardisierung gegen JSON-/dict-Altpfade |
| Storage-Rollen | Postgres + SeaweedFS + Valkey + redb | Rollen in Runtime- und Infra-Pfaden schliessen |
| Semantic Retrieval | pgvector + FalkorDB getrennt | klare Befuellungsregeln und Nicht-Duplizierung |
| Spaetere Erweiterungen | Iceberg, OpenSearch, Meilisearch, Trino, GeoServer, DataHub, OpenLineage | Trigger und Nicht-Ziele explizit machen |

---

## 2b. Priorisierte Abarbeitungsreihenfolge

### Block 1: Data-Plane-Baseline

- `DAT1` Datenzonen
- `DAT3` Postgres-Metadata-Zielbild
- `DAT4` `DuckDB + Polars + Arrow + Parquet`
- `DAT8` `redb`
- `DAT9` `Valkey`

### Block 2: Retrieval-Rollen

- `DAT10` `pgvector`
- `DAT11` `FalkorDB`
- `DAT12` Nicht-Duplizierungsregel

### Block 3: spaetere Ausbaupfade

- `DAT13` OpenSearch
- `DAT14` Meilisearch
- `DAT15` `DuckDB -> MotherDuck -> Druid`
- `DAT16` Trino
- `DAT17` GeoServer
- `DAT18` OpenLineage / DataHub / Great Expectations

Arbeitsregel:

- Erst Block 1 als Baseline hartziehen.
- Retrieval- und Ausbaupfade erst danach finalisieren.

---

## 2c. Default-Entscheide bis gegenteilige Evidence vorliegt

| Thema | Default |
|:------|:--------|
| Zone-Schnitt | `raw -> normalized -> derived -> semantic -> episodic` |
| Metadaten / Betriebsdaten | `Postgres` |
| Artefakte / Snapshots | `SeaweedFS` |
| Hot cache / coordination | `Valkey` |
| lokaler compute-cache | `redb` |
| tabellarische Standardlinie | `DuckDB + Polars + Arrow + PyArrow + Parquet` |
| document-centric retrieval | `pgvector` |
| entity-/graph-centric retrieval | `FalkorDB` |
| Search spaeter | `OpenSearch` |
| leichte Produkt-Search optional | `Meilisearch` |
| Lakehouse-Tabellen spaeter | `Iceberg` |
| SQL-Federation spaeter | `Trino` |
| OGC-/GIS-Interop spaeter | `GeoServer` |
| Governance spaeter | `OpenLineage`, `DataHub`, `Great Expectations` |

---

## 3. Offene Deltas

### A. Datenzonen und Artefakte

- [ ] **DAT1** alle relevanten Pfade auf `raw`, `normalized`, `derived`,
  `semantic`, `episodic` abbilden
- [ ] **DAT2** object-first Grenze fuer artefakt- und replay-relevante Daten
  gegen in-memory/cache-first Pfade haerten
- [~] **DAT3** relationale Metadata- und Statusfuehrung fuer Data-Plane-Artefakte
  als `Postgres`-Zielbild konkretisieren; erster Go-Artifact-Metadata-Pfad
  fuer `sqlite|postgres` ist vorbereitet

### B. Tabellarische Standardlinie

- [ ] **DAT4** `DuckDB + Polars + Arrow + Parquet` als Standardpfad fuer neue
  tabellarische Compute- und Replay-Arbeit festziehen
- [ ] **DAT5** `PyArrow`- und Arrow-Interop als Compute-/Transportthema gegen
  generische Agent-Memory-Ideen abgrenzen
- [ ] **DAT6** `Arrow Flight` nur fuer echte grosse tabellarische Transfers als
  spaeteren Trigger pflegen
- [ ] **DAT7** `Parquet` versus `Iceberg` sauber als Datei versus Tabellenformat
  in allen betroffenen Owner-Dokumenten spiegeln

### C. Spezialcaches und Persistenzrollen

- [ ] **DAT8** `redb`-Rolle als lokaler compute-naher Cache gegen allgemeine
  Persistenz abgrenzen
- [~] **DAT9** `Valkey`-Rolle fuer hot cache / dedupe / coordination gegen
  Snapshot-/Metadata-Layer sauber halten; lokaler Windows-Pfad nutzt vorerst
  `tools/redis/`, waehrend `Valkey` als spaeterer Docker-/Production-Pfad offen bleibt

### D. Retrieval- und Search-Schichten

- [~] **DAT10** `pgvector` = document-centric retrieval verbindlich machen;
  DSN-/Compose-Vorbereitung angelegt, Python-Provider-Switch vorbereitet
- [~] **DAT11** `FalkorDB` = entity-/claim-/evidence-/graph-centric retrieval
  verbindlich machen; Python-KG-Provider-Switch vorbereitet
- [ ] **DAT12** Nicht-Duplizierungsregel fuer Embeddings operationalisieren
- [ ] **DAT13** `OpenSearch` als spaetere Search-/Analytics-Schicht mit Triggern
  versehen
- [ ] **DAT14** `Meilisearch` klar als leichtere Produkt-Search einordnen,
  nicht als Search-Gesamtsystem

### E. Spaetere Data-Plane-Erweiterungen

- [~] **DAT15** `DuckDB -> MotherDuck -> Druid` als Dreistufenregel in der
  Datenebene festziehen
- [ ] **DAT16** `Trino` nur als spaetere SQL-Federation dokumentieren
- [ ] **DAT17** `GeoServer` nur als absolut optionale OGC-/GIS-Interop-Schicht
  dokumentieren
- [ ] **DAT18** `OpenLineage`, `DataHub`, `Great Expectations` als Governance-
  Erweiterungen mit Eintrittskriterien versehen

---

## 3b. Entscheidungsraster fuer spaetere Data-Plane-Bausteine

### `Arrow Flight`

- nur ziehen, wenn grosse tabellarische Transfers ueber Service-Grenzen zum
  echten Bottleneck werden
- nicht als Default, solange `Parquet`-Artefakte oder normale RPC-Pfade reichen

### `Iceberg`

- nur ziehen, wenn Parquet-Dateien als versionierte Tabellen mit Snapshot- und
  Schema-Evolution gebraucht werden

### `OpenSearch`

- ziehen, wenn zentrale Suche, Filter, Aggregationen oder Search/Analytics/
  Observability zusammenlaufen sollen

### `Meilisearch`

- ziehen, wenn leichte Produkt-Search gebraucht wird, aber kein Search-
  Gesamtbackend

### `Trino`

- ziehen, wenn SQL ueber mehrere Datensysteme ein echter Arbeitsmodus wird

### `GeoServer`

- ziehen, wenn OGC-/GIS-Standards und externe GIS-Clients wirklich integriert
  werden muessen

### `OpenLineage` / `DataHub` / `Great Expectations`

- ziehen, wenn die Data Plane teamfaehiger, breiter und governance-lastiger
  wird

---

## 4. Verify-Gates

- [ ] **DAT.V1** jede Datenklasse hat eine klare Zone und primäre Store-Rolle
- [ ] **DAT.V2** neue tabellarische Zielpfade nennen `DuckDB`, `Polars`,
  `Arrow/PyArrow` und `Parquet` konsistent
- [ ] **DAT.V3** `redb` erscheint nirgends als allgemeiner Domain-Store
- [ ] **DAT.V4** `pgvector`-/`FalkorDB`-Rollen sind nicht mehr vermischt
- [ ] **DAT.V5** `OpenSearch`, `Meilisearch`, `Trino`, `GeoServer` sind als
  optionale Erweiterungen sichtbar, aber nicht implizite Baseline
- [ ] **DAT.V6** `DuckDB`, `MotherDuck` und `Druid` sind klar als drei Stufen
  dokumentiert
- [ ] **DAT.V7** `OpenLineage`, `DataHub` und `Great Expectations` sind als
  spaetere Governance-Schicht benannt, nicht als sofortige Pflichtbaseline

---

## 5. Naechster Todo-Batch

### A. Root -> Spec Propagation

- [ ] `DATA_AGGREGATION_Master.md` gegen `DATA_ARCHITECTURE.md` und
  `STORAGE_AND_PERSISTENCE.md` spiegeln
- [ ] `source_persistence_snapshot_delta.md` und `vector_ingestion_delta.md`
  gegen neue Root-SOLL-Zustaende abgleichen

### B. Data-Plane Decision Pack

- [ ] Kurzentscheid fuer `DuckDB + Polars + Arrow + Parquet` als Baseline
  formulieren
- [ ] Trigger fuer `Iceberg`, `OpenSearch`, `MotherDuck`, `Druid` definieren
- [ ] `pgvector` / `FalkorDB` Befuellungsregel als kleines Entscheidungsraster
  ausformulieren

### C. Infra-/Ops-Readiness

- [ ] Compose-/Tool-Readiness fuer `Postgres`, `pgvector`, `FalkorDB`,
  `Valkey`, `SeaweedFS` gegen Datenebenen-Zielbild pruefen
- [ ] Governance-Readiness fuer `OpenLineage`, `DataHub`,
  `Great Expectations` nur vorbereitend dokumentieren
- [x] lokale Prepare-Pfade fuer `Valkey`, `Postgres/pgvector`, `FalkorDB`
  im Repo angelegt
- [x] vorbereitende Env-Information fuer `Next`, `Go` und `Python` liegt an,
  ohne `Postgres`/`FalkorDB` automatisch in den Dev-Stack zu ziehen; lokale
  Cache-Defaults zeigen auf den Redis-Windows-Shim
- [x] spaeterer Next-Shared-Runtime-Cache via Redis/Valkey vorgemerkt, ohne
  das interne Next-Caching zu ersetzen

### D. Abhaengigkeit aus dem Architektur-Slice

- [ ] `ATS1-ATS14` geschlossene Defaults direkt in alle data-nahen Owner-Dokumente
  spiegeln
- [ ] keine data-spezifische Zielentscheidung treffen, die dem Architektur-Slice
  widerspricht

### E. Python-Domain-Abgrenzung fuer die Data Plane

- [x] `indicator-service`, `finance-bridge` und compute-lastige Datenpfade
  bleiben dem logischen `python-compute`-Modul zugeordnet
- [x] `memory-service` und `agent-service` bleiben dem logischen
  `python-agent`-Modul zugeordnet
- [x] spaetere chunk/embed/index/fetch-Pfade werden als
  `python-ingest-workers` vorbereitet, nicht im Compute-Layer versteckt
- [x] vorerst bleibt ein gemeinsamer `python-backend`-venv bestehen; kein
  harter venv-Split ohne echten Betriebsbedarf
- [x] `python-agent/` hat eigenstaendiges `pyproject.toml` + eigenes `uv`-venv (Phase 22g code-complete)
- [x] `python-compute/` hat eigenstaendiges `pyproject.toml`; teilt vorerst `python-backend/.venv` wegen Rust-Extension
- [x] `python-backend/shared/` bleibt gemeinsames Utility-Modul fuer beide Planes (`app_factory`, `grpc_server`, `cache_adapter`)

---

## 6. Evidence Requirements

Fuer jeden geschlossenen Punkt (`DAT1-DAT18`) mindestens:

- Delta-ID
- betroffener Datenpfad oder Datenklassentyp
- Zielentscheidung mit kurzer Begruendung
- Trigger oder Nicht-Ziel
- Folgeupdate in den betroffenen Root-/Spec-Dokumenten

### Aktuelle Evidence (17.03.2026)

- `docker-compose.data.yml` stellt lokale Infra-Pfade fuer `postgres-pgvector`
  und `falkordb` bereit; `valkey` ist dort nur sekundärer Compose-Fallback
- `tools/redis/README.md` haelt fest, dass lokaler Windows-Cache derzeit ueber
  Redis laeuft, waehrend `Valkey` fuer spaetere Docker-/Production-Nutzung
  vorbereitet bleibt
- `tools/redis/redis-server.exe` wurde lokal installiert und startet ueber den
  abgespeckten `dev-stack` erfolgreich auf `6379`
- `tools/postgres-pgvector/init/001_extensions.sql` aktiviert `vector` direkt
  im lokalen Postgres-Container
- Root-, Go- und Python-Env-Dateien enthalten vorbereitende DSN-/Provider-
  Variablen fuer `Postgres`, `pgvector`, `FalkorDB` und `Valkey`
- Python-Cache-Adapter akzeptiert jetzt `MEMORY_CACHE_PROVIDER=valkey|redis|local`
  und `MEMORY_VALKEY_URL`
- Python-Zielstruktur ist als `python-compute`, `python-agent` und
  `python-ingest-workers` vorgemerkt, ohne bestehende Servicepfade sofort zu
  brechen
- `python-backend/ml_ai/memory_engine/vector_store.py` schaltet jetzt zwischen
  `chroma` und einem vorbereiteten `pgvector`-Pfad um
- `python-backend/scripts/smoke_pgvector.py` degradiert ohne DSN sauber und
  dient als spaeterer Live-Smoke-Einstieg fuer `Postgres/pgvector`
- `python-backend/ml_ai/memory_engine/kg_store.py` schaltet jetzt zwischen
  `kuzu`/`sqlite` und einem vorbereiteten `falkor`-Pfad um
- `python-backend/scripts/smoke_falkordb.py` degradiert ohne laufenden Store
  sauber und dient als spaeterer Live-Smoke-Einstieg fuer `FalkorDB`
- `go-backend/internal/storage/metadata_store_factory.go` und
  `metadata_store_postgres.go` bereiten den relationalen Artifact-Metadata-Pfad
  auf `sqlite|postgres` vor
- `src/lib/server/prisma.ts` kann die relationale App-DB jetzt temporaer als
  `frontend-sqlite`, `backend-sqlite` oder `backend-postgres` aufloesen, ohne
  den Default sofort umzuschalten
- `scripts/merge-frontend-sqlite-into-backend-sqlite.ts` erzeugt bzw. befuellt
  die backend-owned SQLite unter `go-backend/data/backend.db`
- der erste relationale App-State-Cut (`preferences`, `admin/users`) laeuft
  jetzt ueber Go gegen dieselbe backend-owned SQLite
- `auth-user` und `consent` lesen/schreiben ihre relationalen Daten jetzt
  ebenfalls ueber Go gegen dieselbe backend-owned SQLite
- `auth-actions` (`totp-enable`, `password-change`, `password-recovery-*`)
  nutzen jetzt dieselbe backend-owned SQLite ueber Go statt Prisma-Write-Pfade
- der Passkey-/WebAuthn-Scaffold-State (`Authenticator`, passkey device list,
  passkey registration/authentication persistence) laeuft jetzt ebenfalls ueber
  dieselbe backend-owned SQLite via Go
- Credentials-Authorize, Register und JWT-MFA-Enrichment fuer den Auth-Stack
  nutzen jetzt ebenfalls den Go-owned relationalen Pfad statt Prisma-Reads/
  Writes
- `orders` und `alerts` als klar domain-/policy-relevante App-DB-Pfade laufen
  jetzt ebenfalls ueber dieselbe backend-owned SQLite via Go
- `trade journal` als weiterer domain-naher App-DB-Pfad laeuft jetzt ebenfalls
  ueber dieselbe backend-owned SQLite via Go
- Relationale Ownership folgt hier bewusst einem Hybrid-Modell:
  Go zieht Domain-Truth-/Policy-/Audit-kritische Pfade in die backend-owned
  SQLite/Postgres-Richtung, waehrend Next/Prisma fuer UI-nahe und schnelle
  Dev-/Schema-Helfer vorerst bewusst bestehen darf
- Prisma bleibt vorerst als schnelle Dev-/Schema-Hilfe zulaessig, ist fuer den
  backend-owned relationalen Zielpfad aber nur noch Uebergangswerkzeug
- [ ] den Wortlaut hier mittelfristig weiter haerten:
  kein dauerhafter relationaler Dual-Owner `Next/Prisma + Go`; Prisma nur
  noch als Uebergang bzw. Auth.js-/BFF-Glue dort, wo es bewusst so bleibt
- `geopolitical-events-store.ts` ist jetzt als Medium-Risk-Ownership-Schnitt
  ueber den bestehenden Go-Geo-Store vollzogen:
  `list/get/create/update/delete/addSource/addAsset/archive` laufen ueber
  `/api/v1/geopolitical/local-events`, waehrend die TS-Fassade fuer Research,
  Intelligence Calendar, Graph, Stream, Export, Evaluation, Alerts und
  Earth-Seed stabil geblieben ist
- Warum dieser Daten-Schnitt so gemacht wurde:
  GitNexus zeigte fuer `listGeoEvents` einen kritischen Blast Radius; der
  sichere Move war daher ein zentraler Go-Owner-Proxy im Store statt mehrere
  fragmentierte Route-Umbauten
- Timeline-Appends fuer lokale Geo-Events bleiben vorerst in Next, damit kein
  doppelter Timeline-/Audit-Write entsteht, solange die Timeline noch nicht
  als eigener Go-Owner-Batch gezogen wurde
- Weiteres empfohlenes Muster bleibt identisch:
  `Go store + Go handler -> Gateway route -> Next route/store als Thin Proxy -> verify -> Slice update`
- Warum dieses Muster hier ebenfalls gilt:
  relationale Owner-Schnitte sollen die API-/Error-Huelle stabil halten und
  keine halb migrierten Hybrid-Pfade hinterlassen
- `memory-episodic-store.ts` ist jetzt auf den offiziellen Episodenpfad
  umgestellt:
  Episode-Reads/Writes laufen ueber `Next -> Go -> Python memory-service`;
  der lokale Next/Prisma/JSON-Episodenpfad wurde damit als Altlast entmachtet
- Wichtige Architekturpraezisierung:
  bei episodic memory liegt die fachliche Ownership im Python-Agent-/Memory-
  Modul, nicht in einer neuen Go-owned relationalen DB-Schicht
- Analysis snapshots bleiben vorerst explizit Legacy-/Compat-Helfer, bis ein
  echter backend-owned Snapshot-Vertrag existiert
- `portfolio-history-store`, `file-audit` und `control-audit` schreiben jetzt
  ebenfalls ueber Go-owned Endpunkte / Tabellen statt direkter Prisma-Writes
- **Naechster empfohlener relationaler Data-Batch:** weitere Geo-Unterstores
  nur dort, wo sie ueber UI-Helfer hinaus echte backend-owned Truth oder
  Cross-service-Nutzung bekommen
- [x] **Go SQLite Schema pruefen:** `TestSQLiteStoreMigratesAllCurrentGoOwnedTables`
  deckt die aktuell Go-owned relationalen Tabellen in einer frischen Backend-DB ab
- [ ] **Register/Login-Verify aufnehmen:** nachweisen, dass
  `register -> credentials login -> session/JWT` mit backend-owned SQLite
  funktioniert und nicht mehr von Frontend-SQLite-Ownership abhaengt
- **Derzeit verifiziert:** Register-Route schreibt ueber den Go-Owner-Pfad;
  Credential-Lookup und TOTP sind auf Store-Ebene abgesichert.
  `src/lib/auth.test.ts` prueft Credentials-Authorize plus
  `jwt`-/`session`-Enrichment gegen den Go-owned Auth-Owner-Pfad.
  Ein echter Live-Verify des verbleibenden Auth.js-/PrismaAdapter-Restpunkts
  und des Cookie-/Passkey-Browserflusses steht noch aus.
- [ ] **Prisma-Restfelder inventarisieren:** welche Tabellen/Felder in
  `prisma/schema.prisma` noch nur fuer Auth.js-/Glue-/Legacy-Zwecke bestehen
  und welche davon spaeter entfallen oder nach Go uebernommen werden
- [x] **Prisma-Restfelder inventarisieren:** `User`, `Account`, `Session`,
  `VerificationToken`, `Authenticator`, `RefreshToken`,
  `GeoCandidateRecord`, `GeoTimelineRecord`, `GeoDrawingRecord`,
  `AnalysisSnapshot`, `MemorySyncCheckpoint`, `DocumentRecord`
- [~] **Prisma-Restfelder vorlaeufig klassifiziert:**
  `keep/bridge` = Auth.js-/Passkey-/Session-Glue (`Account`, `Session`,
  `VerificationToken`, `Authenticator`, temporaer auch `User` im
  `PrismaAdapter`-Kontext);
  `migrate next` = `RefreshToken`, `GeoTimelineRecord`, `GeoDrawingRecord`,
  bei echtem Backend-Truth-Bedarf `GeoCandidateRecord`;
  `defer/delete` = `AnalysisSnapshot`, `MemorySyncCheckpoint`, `DocumentRecord`
- [ ] **Postgres-Zielpfad explizit halten:** alle neuen Go-owned relationalen
  Tabellen muessen spaeter in einen einzigen `backend postgres`-Pfad
  ueberfuehrbar sein; keine neuen domainkritischen Tabellen mehr exklusiv in
  Next/Prisma anlegen
- [ ] **SQLite-Grenze klar halten:** fuer lokale/dev-nahe niedrige
  Concurrency akzeptabel; nicht als Multiuser-/Multitenant-Zielzustand
  dokumentieren
- [~] **Live-Auth-Verify-Plan vorgemerkt:** `Next + Go` reichen als Minimalstack;
  Verify-Reihenfolge spaeter `register -> credentials sign-in -> session/cookie -> sign-out`;
  optional danach Passkey-Device-/Scaffold-Check; kein Vollstack und keine
  Data-Plane-Zusatzdienste notwendig
- **Verify-Gates letzter Batch:**  
  `go test ./internal/appstate -run "Test(SQLiteStoreMigratesAllCurrentGoOwnedTables|PortfolioSnapshotsAndAuditLogs)" -count=1`  
  `go test ./internal/handlers/http ./internal/app -run TestDoesNotExist -count=1`  
  `bun test src/lib/server/portfolio-history-store.test.ts src/lib/server/audit-helpers.test.ts`
- **Verify-Gates Auth-Check:**  
  `bun test src/lib/auth.test.ts`
- **Verify-Gates Registry/Groups + Macro AUTO (20.03.2026):**  
  `go test ./internal/router/adaptive ./internal/services/market ./internal/handlers/http ./internal/app -run "TestRouter_|TestMacroService_|TestMacroHistoryHandler_|TestMacroIngestRunOnce_|NewServerFromEnv"`  
  `go build ./internal/router/adaptive ./internal/services/market ./internal/handlers/http ./internal/app`  
  `golangci-lint run ./internal/router/adaptive/... ./internal/services/market/... ./internal/handlers/http/... ./internal/app/...`
- **Verify-Gates Registry/Groups + Macro AUTO + Planner (20.03.2026):**  
  `GOTOOLCHAIN=local go test ./internal/connectors/orchestrator -run TestPlanner`  
  `GOTOOLCHAIN=local go test ./internal/services/market -run "TestQuoteClient_|TestMacroService_"`  
  `GOTOOLCHAIN=local go test ./internal/router/adaptive ./internal/handlers/http ./internal/app -run "TestRouter_|TestMacroHistoryHandler_|TestMacroIngestRunOnce_|NewServerFromEnv"`  
  `GOTOOLCHAIN=local go build ./internal/connectors/orchestrator ./internal/services/market ./internal/router/adaptive ./internal/handlers/http ./internal/app`  
  `GOTOOLCHAIN=local golangci-lint run ./internal/connectors/orchestrator/... ./internal/services/market/... ./internal/router/adaptive/... ./internal/handlers/http/... ./internal/app/...`
- **Verify-Gates PythonIPC Registry Bridge (20.03.2026):**  
  `GOTOOLCHAIN=local go test ./internal/connectors/ipc ./internal/connectors/indicatorservice ./internal/connectors/agentservice ./internal/connectors/memory ./internal/connectors/financebridge`  
  `GOTOOLCHAIN=local go test ./internal/app -run NewServerFromEnv`  
  `GOTOOLCHAIN=local go build ./internal/connectors/ipc ./internal/connectors/indicatorservice ./internal/connectors/agentservice ./internal/connectors/memory ./internal/connectors/financebridge ./internal/app`  
  `GOTOOLCHAIN=local golangci-lint run ./internal/connectors/ipc/... ./internal/connectors/indicatorservice/... ./internal/connectors/agentservice/... ./internal/connectors/memory/... ./internal/connectors/financebridge/... ./internal/app/...`
- **Verify-Gates Shared Orchestrator Execution Layer (20.03.2026):**  
  `go test ./internal/connectors/orchestrator ./internal/services/market -run "Test(Planner|Execute|QuoteClient_|NewsService_)"`  
  `go build ./internal/connectors/orchestrator ./internal/services/market ./internal/handlers/http ./internal/app`  
  `golangci-lint run ./internal/connectors/orchestrator/... ./internal/services/market/... ./internal/handlers/http/... ./internal/app/...`
- **Verify-Gates Stream/Depth Planner Path (20.03.2026):**  
  `go test ./internal/services/market -run "Test(StreamClient_|DepthClient_)"`  
  `go test ./internal/handlers/http -run "TestOrderbook|TestQuote"`  
  `go test ./internal/handlers/sse -run "Test(MarketStream|OrderbookStream)"`  
  `go test ./internal/app -run NewServerFromEnv`  
  `go build ./internal/services/market ./internal/handlers/http ./internal/handlers/sse ./internal/app`  
  `golangci-lint run ./internal/services/market/... ./internal/handlers/http/... ./internal/handlers/sse/... ./internal/app/...`
- **Verify-Gates SymbolCatalog + Yahoo Registry Path (20.03.2026):**  
  `go test ./internal/connectors/symbolcatalog -run "TestClient_"`  
  `go test ./internal/connectors/yahoo -run "TestClient"`  
  `go test ./internal/handlers/http -run "Test(SearchHandler|FinanceBridgeQuoteFallbackHandler|OHLCVHandler)"`  
  `go test ./internal/app -run NewServerFromEnv`  
  `go build ./internal/connectors/symbolcatalog ./internal/connectors/yahoo ./internal/handlers/http ./internal/app`  
  `golangci-lint run ./internal/connectors/symbolcatalog/... ./internal/connectors/yahoo/... ./internal/handlers/http/... ./internal/app/...`
- **Verify-Gates Timeseries Provider-Namespace Batch (20.03.2026):**  
  `go test ./internal/services/market -run "Test(RoutedMacroClient_|MacroService_|QuoteClient_)"`  
  `go test ./internal/app -run NewServerFromEnv`  
  `go build ./internal/services/market`  
  `go build ./internal/app`  
  `golangci-lint run ./internal/services/market/...`  
  `golangci-lint run ./internal/app/...`
- **Verify-Gates Timeseries OFR/NYFED Coverage Batch (21.03.2026):**  
  `go test ./internal/services/market -run "TestResolveMacroSeries_DefaultAliases" -count=1`  
  `go test ./internal/services/market -run "TestQuoteClient_(RoutesFredToMacroClient|RoutesNyfedToMacroClient|RoutesBojWithPolicyAlias|AutoFailoverForCrypto|AutoFailoverLatencyFirstRunsProvidersConcurrently|AutoFailoverLatencyFirstHonorsGroupConcurrencyBudget)" -count=1`  
  `go test ./internal/services/market -run "TestMacroService_(History_Fred|History_OfrSeriesPrefix|History_AutoMacroUsesAdaptiveCandidates|History_AutoMacroFallsBackAndRecordsFailure)" -count=1`  
  `go build ./internal/services/market ./internal/app`  
  `golangci-lint run ./internal/services/market/... ./internal/app/...`
- **Verify-Gates Python-Ingest IPC Scaffold (21.03.2026):**  
  `go test ./internal/connectors/ingestservice -run "TestClient_"`  
  `go build ./internal/connectors/ingestservice ./internal/connectors/registry`  
  `golangci-lint run ./internal/connectors/ingestservice/... ./internal/connectors/registry/...`
- [x] **Go-Gateway Quality Gates (20.03.2026):** `golangci-lint run ./...`,
  `go build ./...` und gruppierte `go test`-/`go test -race`-Laeufe fuer
  `internal/connectors`, `internal/handlers`, `internal/services`, restliches
  `internal`, `pkg` und `cmd` sind gruen
- [x] **Go-Toolchain-/Vuln-Gate geschlossen:** Toolchain auf `go1.26.1`
  angehoben; `govulncheck ./...` findet keine Vulnerabilities mehr

- [~] **Go-Fetching-Ist-Zustand eingeordnet:** strukturierte Quellen laufen
  bereits ueber einen aktiven Base-Layer (`http_client`, `retry`,
  `ratelimit`, `error_classification`, `capabilities`, `sdmx_client`,
  `timeseries`, `bulk_fetcher`, `rss_client`, `diff_watcher`, `translation`,
  `oracle_client`) und viele Provider-Pakete; die Aggregationsarbeit braucht
  daher Registry-/Gruppen-Konsolidierung statt eines kompletten Resets
- [~] **Provider-Gruppen fuer die Data Plane explizit ziehen:** `rest`, `ws`,
  `sdmx`, `timeseries`, `bulk`, `rss`, `diff`, `translation`, `oracle`,
  `pythonipc`; `config/provider-router.yaml` und `adaptive.Router` tragen jetzt
  bereits kanonische Gruppen statt nur der alten `g*`-Labels; die
  Gruppen-Normalisierung liegt jetzt explizit in `internal/connectors/groups`,
  inklusive erster Gruppen-Policies (`max_concurrency`, `retry_profile`)
- [~] **Provider-Descriptoren vorbereiten:** YAML-/JSON-Metadaten fuer
  Gruppe, Auth-Modus, Capabilities, Rate-/Retry-Klasse, Enablement,
  Fallback-Ketten und Coverage; Parser- und Normalisierungslogik bleibt Code;
  erster expliziter Descriptor-/Registry-Unterbau liegt jetzt in
  `internal/connectors/registry`, und der adaptive Router konsumiert diese
  Registry statt die Descriptor-Schicht nur implizit mitzutragen
- [~] **Neue Quellen nur noch group-/registry-aware:** `fred`, `worldbank`,
  `imf`, `oecd`, `banxico`, `bok`, `rbi`, `bcb`, `bcra`, `tcmb`, `ecb` bleiben
  als eigene Provider-Raender zulaessig, sollen aber nicht mehr als
  vollstaendige Copy-Paste-Ministapel entstehen; `news_service` laeuft mit
  `news_headlines` (`gdelt`, `rss`, `finviz`) jetzt bereits ueber denselben
  Registry-/Planner-Pfad statt ad-hoc Calllisten; `stream_client` und
  `depth_client` respektieren jetzt dieselbe Registry-/Planner-Schicht fuer
  `AUTO`-Auswahl vor dem GCT-Upstream
- [~] **Fetching-Parallelitaet fuer 100+ Quellen haerten:** zusaetzlich zum
  bestehenden Base-Layer `errgroup`, `semaphore` und `x/time/rate` fuer
  gruppenweite Parallelitaets- und Quotensteuerung vorsehen; nicht nur
  einzelclient-nahe Warte-Logik; `x/time/rate` ist jetzt im Base-Layer aktiv,
  erster gruppenweiter Fanout ueber `errgroup`/`semaphore` laeuft im
  Market-Quote-Pfad fuer `latency_first` und respektiert jetzt Gruppen-Budgets
  aus Registry/YAML; `macro/history` nutzt denselben Registry-/Router-Pfad
  jetzt fuer `exchange=AUTO` und zieht Makro- gegenueber Forex-Zielpfaden
  ueber dieselbe Gruppen-/Provider-Schicht; die gemeinsame
  Candidate-/Strategie-/Concurrency-Planung liegt jetzt explizit in
  `internal/connectors/orchestrator/planner.go`; die wiederverwendbare
  First-success-/Collect-all-Ausfuehrung fuer fanout-faehige Providerpfade
  liegt jetzt zusaetzlich in `internal/connectors/orchestrator/executor.go`
  statt in separaten Service-Hilfsfunktionen
- [x] **Authority-Order fuer Daten-Fallbacks gehaertet:**
  bei gleichem Provider-Score bleibt die konfigurierte Reihenfolge in
  `asset_classes.providers` jetzt erhalten; das verhindert alphabetische
  Umbrueche in Makro-/Timeseries-Fallbacks und macht `authority_first`
  fuer Datenquellen deterministisch
- [~] **Python-IPC als Datenpfad vereinheitlichen:** `financebridge` ist
  Referenz fuer `gRPC/IPC-first + HTTP fallback`; `agentservice`, `memory`,
  `indicatorservice` und spaeter `python-ingest` sollen denselben Stil
  uebernehmen; `indicatorservice`, `agentservice` und `memory` nutzen das
  IPC-Muster jetzt bereits; fuer `python-ingest` liegt jetzt zumindest der
  Go-seitige registry-aware Connector-Scaffold `internal/connectors/ingestservice`
  vor, ohne schon einen Always-on-Runtimepfad zu behaupten; der gemeinsame
  `ipc.Client` ist jetzt registry-aware (`ipc.ConfigWithRegistry`)
  und setzt fuer interne Python-Bridge-Requests
  Provider-/Group-/Retry-/Bridge-Metadaten, waehrend `wiring.go` dieselbe
  Connector-Registry sowohl fuer den adaptiven Router als auch fuer
  `indicatorservice`, `memory` und `agentservice` verwendet
- [ ] **`python-agent -> python-ingest` als Daten-Write-Pfad festziehen:**
  Memory-/RAG-/GraphRAG-Ingestion soll spaeter direkt zwischen diesen beiden
  Python-Domains laufen koennen; Go bleibt dafuer nicht der Pflicht-Hop im
  internen Hot Path
- [ ] **`python-compute -> python-ingest` als optionaler Producer-Pfad
  modellieren:** Compute-/Feature-/Batch-Artefakte duerfen spaeter ueber
  denselben `pythonipc`-Stil in die Ingest-/Indexing-Plane fliessen, aber nur
  als klarer Producer-Use-Case statt als allgemeine neue Kopplung
- [ ] **Go nur fuer externe Ingest-Steuerung:** Browser/Admin/API-getriggerte
  Reindex-/Seed-/Backfill-Aufrufe laufen weiter ueber `Next -> Go ->
  python-ingest`, waehrend interne Python-Write-Pfade direkt bleiben duerfen
- [x] **`financebridge` als reinen Daten-Fetch-Sonderpfad fuer den
  Markt-Strang abgebaut (Option 2):** `market/search`, `quote/fallback` und
  `ohlcv` laufen jetzt nativ im Go-Gateway; `financebridge` ist fuer reines
  Quote-/OHLCV-/Search-Fetching kein Pflichtpfad mehr und nur noch optionaler
  Legacy-/Bootstrap-Kandidat
- [~] **Erster Option-2-Cut umgesetzt:** `market/search` laeuft im Gateway
  jetzt nativ ueber `symbolcatalog`; verbleibende Fetch-Restpfade in
  `financebridge` waren vor allem `quote/fallback` und `ohlcv`
- [~] **Zweiter Option-2-Cut umgesetzt:** `quote/fallback` laeuft jetzt nativ
  ueber einen Go-`yahoo`-Connector; als reiner Python-Fetch-Restpfad bleibt in
  diesem Strang aktuell vor allem `ohlcv`
- [x] **Dritter Option-2-Cut umgesetzt:** `ohlcv` laeuft jetzt ebenfalls nativ
  ueber den Go-`yahoo`-Connector; damit ist `financebridge` aus dem reinen
  Markt-Fetch-Strang entfernt und nur noch optionaler Legacy-/Bootstrap-
  Bridge-Kandidat
- [x] **Router-Authority vor Provider-Fallbacks durchgesetzt:** wenn eine
  Asset-Klasse im adaptiven Router explizit konfiguriert ist, erweitert die
  Allowlist diese Klasse nicht mehr implizit; verhindert stille Fremdprovider
  in `latency_first`-/Authority-Pfaden
- [ ] **Rust-Datenpfad bewusst unveraendert lassen:** `python-compute` und
  `python-agent` konsumieren `rust_core` weiter via PyO3; direkter Go↔Rust-
  Datenpfad bleibt spaeterer Hot-Path-Trigger, nicht heutige Baseline

### E2. Finish-Kriterien Go Fetching / Registry / Data Plane

- [x] **Go-Fetching-Basis sitzt:** Base-Layer, Gruppen, Registry, Router,
  Planner und Executor sind jetzt reale Bausteine statt lose Leitidee
- [x] **Primäre Marktpfade sitzen auf demselben Standard:** `quote`,
  `macro/history`, `news`, `stream`, `depth` nutzen Registry-/Planner-Logik
  statt weitere ad-hoc Fanout-/Fallback-Helfer zu tragen
- [x] **PythonIPC ist in die Data Plane eingehaengt:** `indicatorservice`,
  `agentservice`, `memory` und `financebridge` sind registry-aware am
  gemeinsamen IPC-Rand
- [x] **Option-2-Markt-Fetch durchgezogen:** `search`, `quote/fallback`,
  `ohlcv` sind aus dem reinen Python-Fetch-Strang entfernt
- [~] **`symbolcatalog` als aktiver Such-/Symbolpfad voll einordnen:** der
  Pfad ist jetzt nicht nur Go-nativ, sondern auch im Descriptor-/Group-Standard
  der Data Plane sichtbar; offen bleibt nur noch die spaetere Anbindung an
  denselben aktiven Asset-Class-/Planungsstandard wie fanout-faehige Providerpfade
- [~] **`yahoo`-Pfad voll in die Registry-Data-Plane einhaengen:** der
  native `quote/fallback`-/`ohlcv`-Pfad ist jetzt im Descriptor-/Group-Modell
  und in `provider-router.yaml` sichtbar; offen bleibt nur noch, ihn spaeter
  gleich tief wie die groesseren Providerfamilien an den Planungsstandard zu binden
- [~] **`timeseries`-/Authority-Familie weiter vereinheitlichen:** neue
  Makro-/Authority-Quellen wachsen jetzt bereits ueber provider-benannte
  Registrierungen im `RoutedMacroClient` und die aktiven Provider `ofr`/`nyfed`
  sind im `provider-router.yaml` sichtbar; offen bleibt die weitere Reduktion
  loserer Prefix-/Alias-Sonderfaelle zugunsten eines noch klareren
  provider-zentrierten Erweiterungspfads
- [~] **`python-ingest` an denselben IPC-/Registry-Standard anschliessen:**
  der Go-seitige registry-aware Connector-Scaffold `internal/connectors/ingestservice`
  plus Provider-Descriptor ist vorhanden, ohne schon einen Always-on-
  Runtimepfad zu behaupten; Zielbild bleibt: `python-agent -> python-ingest`
  direkt fuer Write/ingest, `python-compute -> python-ingest` optional als
  Producer, `Go -> python-ingest` fuer externe Trigger/Governance
- [ ] **Descriptor-Abdeckung fuer aktive Datenpfade vollstaendig machen:**
  produktiv genutzte News-, Market-, Macro-, Stream-, Depth- und PythonIPC-
  Provider muessen im `provider-router.yaml`/Registry-Modell sichtbar sein
- [ ] **Go-Data-Aggregation-Teil erst dann finished:** wenn `symbolcatalog`,
  `yahoo`, `timeseries`-Familie und `python-ingest` geschlossen sind und die
  jeweiligen granularen Verify-Gates pro Batch gruen bleiben

**Phase 22g Quality Pass — ml_ai Merge + Rust Agent Hotpaths (18.03.2026)**

- `python-backend/ml_ai/agent/` + `ml_ai/context/` per `git mv` in `python-agent/agent/` konsolidiert
  (context.py, context_assembler.py, guards.py, memory_client.py, roles.py, search.py, working_memory.py,
  tools/*, context/merge.py, context/relevance.py, context/token_budget.py)
- `python-backend/ml_ai/indicator_engine/`, `ml_ai/geopolitical_soft_signals/`, `ml_ai/memory_engine/`
  per `git mv` in `python-compute/` konsolidiert
- Alle `ml_ai/`-Originale in `python-backend/archive/` archiviert — kein Hard-Delete, Blame erhalten
- `python-agent/` hat jetzt eigenes `pyproject.toml` + eigenes `uv`-venv; `dev-stack.ps1` nutzt `$agentVenvPython`
- `python-agent/agent/http_client.py` NEU — Singleton `httpx.AsyncClient` fuer alle Tool-HTTP-Calls (ABP.2c)
- `python-agent/agent/loop.py` + `anyio.move_on_after(AGENT_TOOL_TIMEOUT_SEC)` — Tool-Timeout-Cancel-Scope (ABP.2d)
- Rust Agent Hotpaths in `rust_core/src/lib.rs` ergaenzt (Phase 22g+):
  - `extract_entities_from_text()` — Ticker/Laender/Metriken/Asset-Klassen aus freiem Text
  - `dedup_context_fragments()` — Hash-Dedup von KG/Vector/Episodic-Fragmenten nach Relevanz
  - `score_tools_for_query()` — Token-Overlap-Scoring fuer Tool-Selektion im Agent-Loop
  - `cargo test`: 40/40 gruen; `serde_json = "1"` als neue Cargo-Dep
- `typings/tradeviewfusion_rust_core.pyi`: 3 neue Stubs + fehlende `redb_cache_*` Stubs nachgetragen
- `python-backend/.env.example/development/production`: `AGENT_TOOL_TIMEOUT_SEC=30` ueberall eingefuegt

---

**Phase 22g — Python-Compute-Plane-Split (18.03.2026)**

- `python-backend/python-compute/` als Heimat der Compute-Plane-Services:
  `indicator-service/` (Port 8092), `finance-bridge/` (Port 8081),
  `geopolitical-soft-signals/` (Port 8091) hierhin verschoben
- `python-backend/python-compute/pyproject.toml` — eigene Deps (polars, pandas,
  numpy, scipy, hmmlearn, hdbscan, grpcio, tradeviewfusion-rust-core, OTel);
  teilt vorerst `python-backend/.venv` wegen Rust-Extension-Build (shared
  `tradeviewfusion-rust-core`); eigenstaendiges Venv ab Phase 19-20 geplant
- `scripts/dev-stack.ps1` startet Compute-Services jetzt aus `$computeRoot`
  (nicht mehr aus `services/`)
- `ml_ai/` bleibt in `python-backend/` — Compute-Services greifen via
  `sys.path.insert(0, PYTHON_BACKEND_ROOT)` darauf zu; kein Move noetig

---

## 7. Querverweise

- `./architecture_target_state_delta.md`
- `./source_persistence_snapshot_delta.md`
- `./storage_layer_delta.md`
- `./vector_ingestion_delta.md`
- `./source_selection_delta.md`
