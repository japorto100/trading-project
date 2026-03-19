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
- `geopolitical-events-store.ts` bleibt als naechster separate Medium-Risk-
  Ownership-Schnitt vorgemerkt, statt ihn implizit in kleine CRUD-Batches zu
  verstecken
- Weiteres empfohlenes Muster bleibt identisch:
  `Go store + Go handler -> Gateway route -> Next route/store als Thin Proxy -> verify -> Slice update`
- Warum dieses Muster hier ebenfalls gilt:
  relationale Owner-Schnitte sollen die API-/Error-Huelle stabil halten und
  keine halb migrierten Hybrid-Pfade hinterlassen

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
