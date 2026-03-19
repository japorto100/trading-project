# Architecture Target State Delta

> **Stand:** 18. Maerz 2026
> **Aenderungshistorie:**
> - Rev. 2 (18.03.2026): Phase-22g-Checkpoint — python-agent Loop-Neubau + python-compute Split dokumentiert
> - Rev. 3 (18.03.2026): Phase-22g Quality Pass — ATS1 auf code-complete gesetzt (beide Module eigenstaendig mit pyproject.toml); Rust Agent Hotpaths, anyio-Primitiv und ml_ai-Merge-Ergebnis in Evidence ergaenzt
> **Zweck:** Aktiver Delta-Plan fuer die Konsolidierung und schrittweise
> Operationalisierung des Zielbilds aus `docs/ARCHITECTURE_NEW_EXTENSION.md`.
> Fokus: Planes, Ownership, Storage-Rollen, Orchestrierungsstufen und
> Entscheidungsgates fuer vorbereitete versus aktive Architekturbausteine.

---

## 0. Execution Contract

### Scope In

- Zielbild fuer `Go`, `Python Compute`, `Python Agent`, `Python Indexing` und `Rust`
- Store-Rollen fuer `Postgres`, `SeaweedFS`, `Valkey`, `pgvector`, `FalkorDB`, `redb`
- Orchestrierungsgrenzen zwischen `NATS/JetStream`, leichten Jobsystemen und `Temporal`
- Architekturweite Entscheidungsgates fuer `OpenSearch`, `Meilisearch`, `Trino`,
  `GeoServer`, `Iceberg`, `Druid`, `MotherDuck` und angrenzende Ausbaupfade

### Scope Out

- konkrete Provider- oder Quellen-Rollouts
- detaillierte Snapshot-/Cadence-/Parser-Policies
- konkrete UI-/Frontend-Implementierungen
- tiefe Retrieval-/Chunking-/Embedding-Mechanik im Detail

### Mandatory Upstream Sources

- `docs/ARCHITECTURE_NEW_EXTENSION.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/architecture/GO_GATEWAY_BOUNDARY.md`
- `docs/specs/architecture/ORCHESTRATION_AND_MESSAGING.md`
- `docs/specs/architecture/MEMORY_AND_STORAGE_BOUNDARIES.md`
- `docs/DATA_AGGREGATION_Master.md`

### Arbeitsprinzip

1. Root-SOLL ist hier nur dann geschlossen, wenn daraus konkrete
   Entscheidungs- und Migrationsregeln ableitbar sind.
2. `Prepare`-Bausteine werden nicht stillschweigend zu `Set`, sondern nur ueber
   dokumentierte Trigger, Evidence und Owner.
3. Architekturarbeit darf keine neuen konkurrierenden Root-Wahrheiten erzeugen;
   Folgeaenderungen gehen immer in Specs und State-Dokumente zurueck.

---

## 1. Leitregeln

1. **Go bleibt einzige Public Control Plane.**
2. **Python wird logisch in Compute, Agent und Indexing getrennt.**
3. **Rust bleibt gezielter Hot-Path-Layer, kein zweites Plattform-Backend.**
4. **Postgres bleibt System of Record, nicht FalkorDB, nicht Valkey.**
5. **SeaweedFS ist Object-/Artifact-Layer, nicht Query- oder Cache-Ersatz.**
6. **Valkey ist ephemeres Nervensystem, nicht Durable Execution.**
7. **`pgvector` und `FalkorDB` sind komplementaer, nicht blind redundant.**
8. **`DuckDB`, `MotherDuck` und `Druid` sind drei verschiedene Stufen, keine Synonyme.**

---

## 2. Zielarchitektur-Bloecke

| Block | Zielzustand | Offener Delta-Punkt |
|:------|:------------|:--------------------|
| Public Entry | Go Gateway only | BFF-/Route-/Policy-Drifts gegen Zielbild spiegeln |
| Python Domains | Compute / Agent / Indexing getrennt | logische Module jetzt festziehen, physischer Split schrittweise |
| Storage Roles | Postgres / SeaweedFS / Valkey / pgvector / FalkorDB / redb sauber verteilt | operative Rollentrennung in Specs und Infra festziehen |
| Orchestration | NATS/JetStream + leichte Jobsysteme zuerst, Temporal spaeter | Trigger-/Adoptionsregeln verbindlich machen |
| Search/Geo Options | OpenSearch, Meilisearch, Trino, GeoServer optional | nur bei echten Produkt-/Interop-Bedarfen ziehen |

---

## 2b. Priorisierte Abarbeitungsreihenfolge

Die Architektur-SOLL-Arbeit wird bewusst in drei Bloecke gezogen:

### Block 1: harte Zielbild-Entscheide zuerst

- `ATS1` Python-Domains
- `ATS4` Postgres als SoR
- `ATS5` Valkey-Rolle
- `ATS6` `pgvector` vs. `FalkorDB`
- `ATS14` `DuckDB -> MotherDuck -> Druid`

### Block 2: Orchestrierungs- und Ausbaupfade

- `ATS8` leichte Jobsysteme
- `ATS9` Temporal-Trigger
- `ATS10` NATS/JetStream-Grenze
- `ATS11` OpenSearch
- `ATS12` Meilisearch

### Block 3: optionale Architekturpfade

- `ATS13` Trino / GeoServer
- Folgeupdates in Runtime-/Plan-Dokumente

Arbeitsregel:

- Erst Block 1 soweit schliessen, dass keine Grundsatzunsicherheit mehr fuer
  den Data-Slice bleibt.
- Erst danach Block 2/3 hart weiterziehen.

---

## 2c. Default-Entscheide bis gegenteilige Evidence vorliegt

Diese Punkte gelten fuer die laufende Arbeit als Arbeitsdefault:

| Thema | Default |
|:------|:--------|
| Public Entry | `Go Gateway` only |
| Python Domains | `compute`, `agent`, `indexing-workers` logisch getrennt, gemeinsamer venv vorerst |
| Relationale Kernschicht | `Postgres` |
| Object-/Artifact-Layer | `SeaweedFS` |
| Cache/Locks/light streams | `Valkey` |
| Graph/entity retrieval | `FalkorDB` |
| Document-centric semantic retrieval | `pgvector` |
| Lokaler Spezialcache | `redb` |
| Tabellarische Analytics | `DuckDB + Polars + Arrow + Parquet` |
| Event Backbone | `NATS/JetStream` |
| leichte Orchestrierung | `Asynq`, `River`, `ARQ`, `Hatchet` Auswahlraster |
| Durable Execution spaeter | `Temporal` nur mit Trigger |
| Search gesamtspaeter | `OpenSearch` |
| leichte Produkt-Search | `Meilisearch` optional |
| SQL-Federation | `Trino` nur spaeter |
| OGC-/GIS-Interop | `GeoServer` nur spaeter |

---

## 3. Offene Deltas

### A. Plane- und Ownership-Klarheit

- [x] **ATS1** Python-Zielbild als drei logische Domains verbindlich machen —
  **code-complete (18.03.2026)**
  - `python-backend/python-agent/` — eigenstaendiges Modul mit eigener `pyproject.toml` + `uv`-venv
    - enthaelt: `agent/loop.py`, `agent/tools/` (6 Tools), `agent/context.py`, `agent/context_assembler.py`,
      `agent/memory_client.py`, `agent/working_memory.py`, `agent/roles.py`, `agent/streaming.py`, `agent/guards.py`,
      `agent/validators/`, `agent/extensions.py`
    - startet als `agent-service` auf Port 8094, hat eigenes `uv sync` im `dev-stack.ps1`
    - Herkunft: Merge aus `python-backend/ml_ai/agent/` + `ml_ai/context/` (Phase 22g); Originale in `archive/` archiviert
  - `python-backend/python-compute/` — eigenstaendiges Modul mit eigener `pyproject.toml`
    - enthaelt: indicator-service, finance-bridge, geopolitical-soft-signals, volatility-suite, regime-detection,
      portfolio-analytics
    - teilt vorerst `python-backend/.venv` wegen shared Rust-Extension-Build
    - Herkunft: Merge aus `python-backend/ml_ai/indicator_engine/`, `ml_ai/geopolitical_soft_signals/`,
      `ml_ai/memory_engine/`; Originale in `archive/` archiviert
  - `python-backend/python-ingest-workers/` — Strukturanker vorhanden, Implementierung deferred
  - `python-backend/shared/` — gemeinsames `app_factory`, `grpc_server`, `cache_adapter`; von allen 3 Domains importiert
  - Alle `python-backend/ml_ai/`-Originale in `python-backend/archive/` per `git mv` archiviert (kein Hard-Delete)
- [ ] **ATS2** Abgrenzung `Go orchestration` vs. `Python ownership` fuer
  index-/retrieval-/agent-nahe Workflows festziehen
- [~] **ATS3** Rust-Rolle auf Hot Paths, Caches und spaetere shared kernels
  begrenzen; keine diffuse Plattformrolle
  - `rust_core/` (Phase 22g+): Indicator-Kerne + OHLCV-Cache (redb) + Agent-Hotpaths (entity extraction, context dedup, tool scoring)
  - alle neuen Funktionen GIL-frei via `py.detach()` (PyO3 0.22+); Pattern korrekt
  - spaetere Backtester-/Risk-Engine-Pfade noch offen

### B. Store-Rollen und Nicht-Ziele

- [~] **ATS4** `Postgres` als SoR in Root-/Spec-/Execution-Pfaden durchziehen;
  lokale DSN-/Compose-Vorbereitung angelegt, erster Go-Metadata-Store-
  Umschaltpfad fuer `sqlite|postgres` ist verdrahtet, breite Runtime-
  Umschaltung noch offen
- [~] **ATS5** `Valkey` explizit als Cache/Locks/light streams verankern und
  "nicht Durable Execution" ueberall spiegeln; lokaler Windows-Pfad laeuft
  aktuell ueber `tools/redis/`, waehrend `Valkey` als Docker-/Production-Zielbild
  vorbereitet bleibt
- [~] **ATS6** `pgvector` versus `FalkorDB` als Rollentrennung standardisieren:
  document-centric vs. graph/entity-centric; Env-/Compose-Vorbereitung angelegt,
  `pgvector`- und `FalkorDB`-Provider-Switches im Python-Memory-Layer
  vorbereitet, echter Live-Store-Betrieb noch offen
- [ ] **ATS7** `redb` als Spezialcache explizit gegen allgemeine Persistenz
  abgrenzen

### C. Orchestrierungsstufen

- [ ] **ATS8** First-choice-Familie fuer leichte Orchestrierung priorisieren:
  `Asynq`, `River`, `ARQ`, `Hatchet`
- [ ] **ATS9** `Temporal`-Trigger definieren:
  resume-kritisch, langlebig, stateful, approval- oder compensation-lastig
- [ ] **ATS10** `NATS/JetStream`-Rolle gegen Queue/Workflow/Replay sauber
  dokumentieren

### D. Optionale Ausbaupfade

- [ ] **ATS11** `OpenSearch` als spaetere Search-/Analytics-/Observability-
  Schicht mit Triggern versehen
- [ ] **ATS12** `Meilisearch` klar als leichte Produkt-Search-Option einordnen,
  nicht als Search-Gesamtplattform
- [ ] **ATS13** `Trino` und `GeoServer` als "absolut optional" mit
  Einsatzkriterien verankern
- [~] **ATS14** `DuckDB -> MotherDuck -> Druid` als Dreistufenregel in allen
  betroffenen Owner-Dokumenten spiegeln

---

## 3b. Entscheidungsraster fuer strittige Bausteine

### `pgvector` vs. `FalkorDB`

- `pgvector`, wenn:
  - Dokumente/Chunks/Bilder im Vordergrund stehen
  - relationale Metadaten eng mit Retrieval verbunden bleiben
  - ACID/PITR/Joins produktiv wichtig sind
- `FalkorDB`, wenn:
  - Entities, Claims, Evidence und Beziehungen im Vordergrund stehen
  - Multi-hop- oder graph-native Retrieval gebraucht wird
  - Agent-Memory / GraphRAG-Faelle klar sind

### `DuckDB` vs. `MotherDuck` vs. `Druid`

- `DuckDB`, wenn:
  - Worker-/Batch-/Research-/Replay-SQL lokal oder serverseitig ausreicht
- `MotherDuck`, wenn:
  - dieselbe DuckDB-Welt cloud-/mehrbenutzerfaehig werden muss
- `Druid`, wenn:
  - grosse verteilte Realtime-Analytics mit hoher Event- und Dashboard-Last
    gebraucht werden

### `Hatchet` / `River` / `Asynq` / `ARQ` vs. `Temporal`

- leichte Familie zuerst, wenn:
  - Tasks neu gestartet werden duerfen
  - Queue-/Retry-/Scheduling-Semantik reicht
  - keine lange Event-History / Resume-Semantik noetig ist
- `Temporal`, wenn:
  - Workflows ueber Crash/Deploy weiterlaufen muessen
  - State-Machines, Approvals oder langfristige Retries zentral werden

---

## 4. Verify-Gates

- [ ] **ATS.V1** Kein Root-/Spec-Widerspruch mehr bei den Python-Domains
- [ ] **ATS.V2** Kein Dokument beschreibt `Valkey` als langlebige Workflow-
  oder SoR-Schicht
- [ ] **ATS.V3** `pgvector`-/`FalkorDB`-Rollentrennung ist in Root + Specs +
  Data-Execution konsistent
- [ ] **ATS.V4** `DuckDB`, `MotherDuck` und `Druid` sind nirgends mehr
  gleichgesetzt oder unklar vermischt
- [ ] **ATS.V5** `OpenSearch`, `Meilisearch`, `Trino`, `GeoServer` sind
  dokumentiert, aber explizit optional
- [ ] **ATS.V6** `Temporal` erscheint nur noch als evidenzbasierte
  spaetere Stufe, nicht als impliziter Default

---

## 5. Naechster Todo-Batch

### A. Root -> Spec Propagation

- [ ] `ARCHITECTURE_NEW_EXTENSION.md` gegen `ARCHITECTURE_BASELINE.md`,
  `ORCHESTRATION_AND_MESSAGING.md` und `MEMORY_AND_STORAGE_BOUNDARIES.md`
  spiegeln
- [ ] `SYSTEM_STATE.md` nur dort anpassen, wo der Zielzustand bereits als
  klare Richtung genannt werden muss

### A1. Python Domain Layout

- [x] logische Python-Domains auf `compute`, `agent`, `indexing-workers`
  festgezogen
- [x] festgehalten, dass `memory-service` und `agent-service` nicht in den
  Compute-Layer gehoeren
- [x] festgehalten, dass vorerst ein gemeinsamer `python-backend`-venv bleibt
- [ ] bestehende Services spaeter kontrolliert auf die Zielordner abbilden,
  ohne Import-/Startpfade vorschnell zu brechen

### A2. Transitional App DB Ownership

- [x] Ownership-Modell explizit gehaertet:
  Go ist Ziel-Owner fuer Domain-Truth, Policy, Audit, idempotente Mutationen
  und spaetere Workflow-/Broker-/Memory-nahe Writes; Next/Prisma darf
  vorerst bewusst fuer UI-/auth.js-/session-nahe Hilfsmodelle und als
  Dev-/Schema-Booster bestehen bleiben
- [x] temporaerer `APP_DB_MODE`-Bridge-Pfad in Next/Prisma vorbereitet:
  `frontend-sqlite | backend-sqlite | backend-postgres`
- [x] festgehalten, dass dies nur ein Uebergangspfad ist und das Endziel
  weiterhin `Next -> Go -> backend-owned DB` bleibt
- [x] Prisma bleibt vorerst als schnelle Dev-/Schema-Hilfe zulaessig, ist aber
  nicht mehr die langfristige Backend-Authority
- [~] physischer SQLite-Ownership-Schritt in Dev vollzogen:
  Frontend-SQLite nach `go-backend/data/backend.db` gemerged und Dev auf
  `backend-sqlite` gestellt
- [~] erster API-/CRUD-Ownership-Schnitt umgesetzt:
  `fusion/preferences` und `admin/users` laufen relational ueber Go, waehrend
  Next dort nur noch Session-Gate/Proxy ist
- [~] zweiter Ownership-Schnitt umgesetzt:
  `auth-user` und `consent` laufen relational ueber Go, waehrend Next dort nur
  noch Session-Aufloesung und Gateway-Weitergabe haelt
- [~] dritter Ownership-Schnitt umgesetzt:
  `auth-actions` (`totp-enable`, `password-change`, `password-recovery-*`)
  laufen relational ueber Go; Next behaelt dort nur noch Session, Passwort-
  Validierung und Gateway-Aufruf
- [~] vierter Ownership-Schnitt umgesetzt:
  Passkey-Scaffold-State (`passkeys.ts`, passkey device management) liest und
  schreibt jetzt ueber Go; `src/lib/auth.ts` bleibt als verbleibender
  NextAuth-/Passkey-Adapter-Restpunkt noch Prisma-gebunden
- [~] fuenfter Ownership-Schnitt umgesetzt:
  `src/lib/auth.ts` nutzt fuer Credentials-Authorize und JWT-MFA-Enrichment
  jetzt den Go-owned Auth-Owner-Pfad; als verbleibender Prisma-Rest bleibt dort
  primaer noch der `PrismaAdapter` fuer Auth.js/NextAuth
- [~] sechster Ownership-Schnitt umgesetzt:
  `orders` und `alerts` laufen jetzt relational ueber den Go-owned App-State-
  Store; die Fusion-Routen in Next validieren weiter lokal und proxien danach
  nur noch zum Gateway
- [~] siebter Ownership-Schnitt umgesetzt:
  `trade journal` laeuft jetzt ebenfalls relational ueber den Go-owned
  App-State-Store; die Fusion-Routen in Next validieren weiter lokal und
  proxien danach nur noch zum Gateway
- [ ] restliche API-/Auth-/Passkey-/Consent-Ownership-Migration von
  Next/Prisma nach Go bleibt separat offen
- [ ] verbleibende Next/Prisma-Reste nur dann nach Go ziehen, wenn sie
  Domain-Truth, Policy-/Audit-Bedeutung, Cross-service-Nutzung oder
  spaetere backendseitige Engine-Switches behindern
- [ ] naechster Medium-Risk-Batch im Geo-Bereich:
  `geopolitical-events-store.ts` und die daran haengenden Event-/Source-/Asset-
  Routen; wegen 11 direkter Importe bewusst als eigener Slice-Schritt statt als
  Nebenprodukt des Trade-Journal-Cuts

### A3. Empfohlene naechste Batches und Muster

- [x] **Muster festgezogen:** jeder weitere Ownership-Cut folgt demselben
  Ablauf:
  `Go store + Go handler -> Gateway route -> Next route/store als Thin Proxy -> Go/TS verify -> Slice update`
- [x] **Warum dieses Muster:** es minimiert Drift, haelt Request-/Error-
  Boundary stabil und vermeidet halb migrierte DB-Owner-Pfade
- [ ] **Naechster empfohlener Batch:** `geopolitical-events-store.ts` plus
  `events/[eventId]`, danach erst Source-/Asset-/Archive-Routen
  Grund: derselbe Store traegt bereits die Domain-Truth fuer mehrere Geo-
  Event-Routen; ein gemeinsamer Cut ist sicherer als fragmentierte Mini-
  Moves
- [ ] **Danach empfohlener Batch:** weitere Geo-Unterstores
  (`timeline`, `candidates`, `drawings`, `contradictions`) nur dort, wo echte
  relationale Owner-/Policy-Logik besteht
  Grund: nicht jeder Geo-Helferpfad muss sofort nach Go, solange er noch kein
  backend-owned Truth-/Policy-Zentrum ist
- [ ] **Danach empfohlener Batch:** `memory-episodic-store.ts`
  Grund: memory writes sind domain- und policy-kritisch, haengen aber an
  Agent-/Evidence-Grenzen und sollten deshalb bewusst nach den klareren CRUD-
  Stores gezogen werden
- [ ] **PrismaAdapter-Restpunkt in `auth.ts`** bleibt bewusst separat, bis
  geklaert ist, ob der Dev-/Auth.js-Nutzen den Umbau rechtfertigt
  Grund: das ist kein normaler CRUD-Schnitt, sondern Adapter-/Session-Layer

### B. Infra-/Service-Readiness

- [ ] Compose-/Tools-Readiness fuer `Postgres`, `pgvector`, `FalkorDB`,
  `Valkey`, `SeaweedFS` gegen Zielarchitektur pruefen
- [ ] leichte Jobsysteme (`Asynq`, `River`, `ARQ`, `Hatchet`) in einem
  Auswahlraster zusammenfassen
- [x] spaeteren Next-Shared-Runtime-Cache als Redis/Valkey-Betrachtungspunkt
  vorgemerkt; kein Ersatz fuer Next-internes Framework-Caching

### C. Decision Pack

- [ ] `OpenSearch` Trigger-Entscheid vorbereiten
- [ ] `Trino` / `GeoServer` nur als optionale Architecture-Note halten
- [ ] `Druid` explizit als verteilte Realtime-Analytics-Sonderklasse markieren
- [x] lokaler Windows-Cache-Pfad ueber `tools/redis/` und `dev-stack.ps1`
  vorbereitet; `Valkey` bleibt Compose-/Production-Pfad
- [x] vorbereitende Env-Pfade fuer `Next` (`NEXT_RUNTIME_CACHE_PROVIDER`,
  `NEXT_VALKEY_URL`) mit angelegt
- [x] `Postgres/pgvector` und `FalkorDB` als lokale Compose-/Tooling-Pfade unter
  `docker-compose.data.yml` und `tools/*` vorbereitet

### D. Abhaengigkeit fuer Data-Slice

- [ ] die in Block 1 geschlossenen Architekturdefaults direkt in
  `a_data_aggregation_target_state_delta.md` nachziehen
- [ ] nur Datenpfade offenlassen, die wirklich noch an ungeklaerten
  Architekturtriggern haengen

---

## 6. Evidence Requirements

Fuer jeden geschlossenen Punkt (`ATS1-ATS14`) mindestens:

- Delta-ID
- betroffene Root-/Spec-Dokumente
- kurzer Architekturentscheid mit Begruendung
- Trigger oder Nicht-Ziel
- Folgeupdate in `EXECUTION_PLAN.md` und bei Bedarf `SYSTEM_STATE.md`

### Aktuelle Evidence (17.03.2026)

- `docker-compose.data.yml` legt lokale Compose-Pfade fuer
  `postgres-pgvector`, `falkordb` und eine optionale `valkey`-Fallback-Variante an
- `tools/redis/` enthaelt den lokalen Windows-Kompatibilitaetspfad samt
  Download-Helper und ist an `scripts/dev-stack.ps1` angebunden
- `tools/redis/redis-server.exe` wurde lokal installiert und der abgespeckte
  `dev-stack`-Start auf `6379` erfolgreich verifiziert
- `tools/valkey/README.md` dokumentiert den manuellen Windows-Binary-Pfad
  sowie den spaeteren Docker-/Target-State-Pfad
- `scripts/dev-stack.ps1` besitzt jetzt `-SkipRedis` mit `-SkipValkey`-Alias,
  startet den lokalen Redis-Shim auf `6379` und setzt Prozess-Env fuer
  Go/Python/Next
- Root-/Go-/Python-Env-Dateien enthalten jetzt vorbereitende Variablen fuer
  `Valkey`, `Postgres/pgvector` und `FalkorDB`
- Go-Cache-Pfad nutzt jetzt `cache.NewAdapterFromEnv()` und kann
  Redis/Valkey-kompatibel sprechen
- `python-backend/python-compute/`, `python-backend/python-agent/` und
  `python-backend/python-ingest-workers/` dienen jetzt als parallele
  Strukturanker; bestehende Services bleiben vorerst im gemeinsamen
  `python-backend`
- `python-backend/ml_ai/memory_engine/vector_store.py` besitzt jetzt einen
  opt-in `pgvector`-Providerpfad neben `chroma`
- `python-backend/ml_ai/memory_engine/kg_store.py` besitzt jetzt einen opt-in
  `falkor`-Providerpfad neben `kuzu`/`sqlite`
- `python-backend/scripts/smoke_pgvector.py` und
  `python-backend/tests/test_memory_vector_store.py` decken den vorbereiteten
  `pgvector`-Pfad als Smoke-/Unit-Einstieg ab
- `python-backend/scripts/smoke_falkordb.py` und
  `python-backend/tests/test_memory_kg_store.py` decken den vorbereiteten
  `falkor`-Pfad als Smoke-/Unit-Einstieg ab
- `go-backend/internal/storage/metadata_store_factory.go` und
  `metadata_store_postgres.go` schalten den Artifact-Metadata-Store jetzt
  zwischen `sqlite` und `postgres`
- `go test ./internal/storage ./internal/app` laeuft nach der Verdrahtung
  erfolgreich
- `src/lib/server/prisma.ts` besitzt jetzt einen temporaeren
  `APP_DB_MODE`-Resolver fuer `frontend-sqlite | backend-sqlite |
  backend-postgres`
- `bun test src/lib/server/prisma.test.ts` bestaetigt die URL-Aufloesung fuer
  alle drei Modi
- `scripts/merge-frontend-sqlite-into-backend-sqlite.ts` merged die bisherige
  Frontend-SQLite in `go-backend/data/backend.db`
- `.env.development` nutzt jetzt `APP_DB_MODE=backend-sqlite` und
  `DATABASE_URL_BACKEND_SQLITE=file:.../go-backend/data/backend.db`
- `go-backend/internal/appstate/store.go` fuehrt einen ersten relationalen
  App-State-Store fuer `preferences`, `admin/users`, `current-user` und
  `consent`
- `src/app/api/fusion/preferences/route.ts` und
  `src/app/api/admin/users/route.ts` nutzen fuer diese Pfade kein Prisma mehr,
  sondern proxien nach Go
- `src/lib/server/auth-user.ts` und `src/lib/server/consent.ts` nutzen fuer
  diese Pfade kein Prisma mehr, sondern sprechen das Go-Gateway
- `src/lib/actions/auth-actions.ts` nutzt fuer `totp-enable`,
  `password-change` und die Password-Recovery-Pfade kein Prisma mehr, sondern
  das Go-Gateway
- `src/lib/server/passkeys.ts` und
  `src/app/api/auth/passkeys/devices/route.ts` nutzen fuer Passkey-Scaffold und
  Device-Management kein Prisma mehr, sondern das Go-Gateway
- `src/lib/auth.ts` nutzt fuer Credentials-Authorize und `hasTOTP`-Enrichment
  jetzt den Go-owned Auth-Owner-Pfad statt direkter Prisma-Queries
- `src/app/api/auth/register/route.ts` registriert neue User jetzt ueber Go
  statt direkter Prisma-Create-Pfade
- `src/app/api/fusion/orders/route.ts`,
  `src/app/api/fusion/orders/[orderId]/route.ts`,
  `src/app/api/fusion/alerts/route.ts` und
  `src/app/api/fusion/alerts/[alertId]/route.ts` sprechen fuer CRUD jetzt das
  Go-Gateway statt der Prisma-nahen Server-Stores
- `src/app/api/fusion/trade-journal/route.ts` und
  `src/app/api/fusion/trade-journal/[entryId]/route.ts` sprechen fuer CRUD jetzt
  das Go-Gateway statt des Prisma-nahen Server-Stores
- `go-backend/internal/handlers/http/app_state_handler.go` verifiziert jetzt
  den bestehenden `scrypt`-Passworthash serverseitig fuer den Go-owned
  Password-Change-Pfad
- `go-backend/internal/appstate/store.go` haertet frische Backend-SQLite-
  Instanzen jetzt mit `passwordHash`, `username`, `VerificationToken`,
  `TotpDevice` und `RecoveryCode`
- `go-backend/internal/appstate/store.go` fuehrt jetzt auch den Go-owned
  `Authenticator`-Store fuer Passkeys/WebAuthn-Scaffold-State
- `go-backend/internal/appstate/store.go` fuehrt jetzt auch die Go-owned
  relationalen `PaperOrderRecord`- und `PriceAlertRecord`-Pfade
- `go-backend/internal/appstate/store.go` fuehrt jetzt auch den Go-owned
  relationalen `TradeJournalRecord`-Pfad
- `go-backend/internal/handlers/http/app_state_handler.go` stellt jetzt die
  Fusion-CRUD-Endpunkte fuer Orders und Alerts auf dem Go-App-State-Store bereit
- `go-backend/internal/handlers/http/app_state_handler.go` stellt jetzt auch die
  Fusion-CRUD-Endpunkte fuer das Trade Journal auf dem Go-App-State-Store bereit
- `go-backend/internal/handlers/http/app_state_handler.go` fuehrt jetzt den
  Go-owned Auth-Owner-Pfad fuer `authorize`, `register` und `user-security`
- `go test ./internal/appstate ./internal/app` sowie
  `bun test src/app/api/fusion/preferences/route.test.ts` laufen grün
- `bunx biome check src/lib/actions/auth-actions.ts` bestaetigt den neuen
  Next-Server-Action-Pfad syntaktisch
- `bunx biome check src/lib/server/passkeys.ts
  src/app/api/auth/passkeys/devices/route.ts` bestaetigt den Go-backed
  Passkey-Scaffold-Pfad syntaktisch
- `bunx biome check src/lib/auth.ts src/app/api/auth/register/route.ts`
  bestaetigt den Go-backed Credentials-/Register-Pfad syntaktisch
- `bunx biome check src/app/api/fusion/orders/route.ts
  src/app/api/fusion/orders/[orderId]/route.ts
  src/app/api/fusion/alerts/route.ts
  src/app/api/fusion/alerts/[alertId]/route.ts` bestaetigt den Go-backed
  Orders-/Alerts-Pfad syntaktisch
- `bun test src/app/api/fusion/orders/route.test.ts
  src/app/api/fusion/orders/[orderId]/route.test.ts
  src/app/api/fusion/alerts/route.test.ts
  src/app/api/fusion/alerts/[alertId]/route.test.ts` laeuft grün
- `bun test src/app/api/fusion/trade-journal/route.test.ts
  src/app/api/fusion/trade-journal/[entryId]/route.test.ts` laeuft grün

---

**Phase 22g Quality Pass — Pydantic Tools + Shared Client + anyio Timeout + Rust Agent Hotpaths (18.03.2026)**

- `python-agent/agent/tools/base.py`: `input_model: type[BaseModel] | None = None` Klassen-Attribut;
  Default-`validate()` nutzt Pydantic statt manueller dict-Pruefung (ABP.2b)
- `python-agent/agent/tools/memory_tool.py`: `SaveMemoryInput` + `LoadMemoryInput` Pydantic-Models;
  `definition()` via `model_json_schema()` — auto-JSON-Schema fuer Anthropic/OpenAI
- `python-agent/agent/tools/chart_state.py`: `SetChartStateInput` Pydantic-Model;
  `validate()` ruft `super()` zuerst, dann Capability-Guard
- `python-agent/agent/http_client.py` NEU: Singleton `httpx.AsyncClient`
  (`Timeout(10.0, connect=5.0)`, `Limits(max_connections=20, max_keepalive_connections=10)`)
- `app.add_event_handler("shutdown", _close_http_client)` in `agent/app.py` (ABP.2c)
- Alle Tool-Dateien + `memory_client.py` nutzen `get_client()` statt `async with AsyncClient()` pro Call
- `memory_client.post_kg_seed()`: `timeout=30.0` per-call Override (langsame Seed-Operation)
- `python-agent/agent/loop.py`: `import anyio` + `TOOL_TIMEOUT_SEC` + `anyio.move_on_after()` in `_run_tool()` (ABP.2d)
- `python-backend/.env.example/development/production`: `AGENT_TOOL_TIMEOUT_SEC=30` hinzugefuegt
- `rust_core/Cargo.toml`: `serde_json = "1"`; `rust_core/src/lib.rs`: 3 private Helpers + 3 Impl-Fns + 3 PyO3-Wrapper
  + 10 neue Tests (40/40 gruen) (ABP.2e)
- `typings/tradeviewfusion_rust_core.pyi`: 3 neue Agent-Hotpath-Stubs + fehlende `redb_cache_*` Stubs nachgetragen

---

**Phase 22g — ml_ai Merge in python-agent (18.03.2026)**

- `python-backend/ml_ai/agent/` → `python-agent/agent/` (context.py, context_assembler.py, guards.py,
  memory_client.py, roles.py, search.py, working_memory.py, tools/*)
- `python-backend/ml_ai/context/` → `python-agent/agent/context/` (merge.py, relevance.py, token_budget.py)
- `python-backend/ml_ai/indicator_engine/`, `geopolitical_soft_signals/`, `memory_engine/` → `python-compute/`
- Alle Originale in `python-backend/archive/` per `git mv` archiviert (Blame erhalten)
- `python-agent/` hat eigenes `pyproject.toml` + `uv sync` in `dev-stack.ps1`
- `python-compute/` hat eigenes `pyproject.toml`; teilt vorerst `python-backend/.venv` wegen Rust-Extension

---

**Phase 22g — Agent Loop-Neubau + Python-Compute-Split (18.03.2026)**

- `python-backend/python-agent/agent/app.py` + `memory/app.py`:
  kritischer `parents[3]` -> `parents[2]` Import-Bug gefixt
  (`parents[3]` war Repo-Root; `parents[2]` ist `python-backend/` wo `ml_ai/` liegt)
- `python-backend/python-agent/agent/` neuer Loop-Stack (Raw Anthropic SDK):
  `loop.py` / `context.py` / `errors.py` / `extensions.py` / `streaming.py`
- `python-backend/python-agent/agent/tools/`: `base.py` + `registry.py` +
  Standard-Tools (chart_state, portfolio, geomap, memory_tool)
- `python-backend/python-agent/agent/validators/trading.py`:
  `validate_tool_call()` + `CapabilityEnvelope.check()`
- `python-backend/python-agent/pyproject.toml` — standalone `.venv` (uv sync
  beim dev-stack-Start); `ml_ai/` bleibt in `python-backend/` und ist via
  `sys.path.insert(0, PYTHON_BACKEND_ROOT)` aus allen Subdomains erreichbar
- `python-backend/python-compute/` — Compute-Plane:
  `indicator-service/` + `finance-bridge/` + `geopolitical-soft-signals/`
  + eigenes `pyproject.toml`; teilt vorerst `python-backend/.venv`
  (Rust-Extension shared build; eigenstaendiges Venv ab Phase 19-20)
- `scripts/dev-stack.ps1`: `$agentRoot`/`$agentVenvPython`/`$computeRoot`,
  Compute-Services aus `python-compute/`, Agent-Services mit eigenem Venv,
  `-MockLlm` Flag (opt-in) fuer Mock-LLM auf `:11500`
- `tools/mock-llm/server.py` — OpenAI-kompatibler Stub auf `:11500`
- `go build ./...` OK | `bun run lint` 0 Errors OK

---

## 7. Querverweise

- `./a_data_aggregation_target_state_delta.md`
- `./storage_layer_delta.md`
- `./source_persistence_snapshot_delta.md`
- `./vector_ingestion_delta.md`
- `./agent_backend_program_delta.md`
