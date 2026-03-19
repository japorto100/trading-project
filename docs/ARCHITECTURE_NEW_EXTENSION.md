# ARCHITECTURE NEW EXTENSION

> **Stand:** 18. Maerz 2026
> **Status:** Root-Strategiedokument fuer den **SOLL-Zustand**.
> **Rolle:** Verdichtetes Zielbild fuer System-Planes, Storage-Klassen, Sprachgrenzen,
> Orchestrierung und empfohlene Infrastruktur. Die bindenden Runtime-/IST-Details
> bleiben in `docs/specs/*`.
> **Normative Detail-Owner:** `docs/specs/ARCHITECTURE.md`,
> `docs/specs/data/DATA_ARCHITECTURE.md`, `docs/specs/SYSTEM_STATE.md`
> **Aenderungshistorie:**
> - Rev. 1 (17.03.2026): Erstanlage
> - Rev. 2 (18.03.2026): Python Agent Plane um `anyio`-Primitive + 2-Modul-Struktur ergaenzt; Rust Hot-Path Plane um Agent-Hotpaths erweitert; `anyio` in Set-Liste; ml_ai-Merge-Ergebnis dokumentiert

---

## 1. Zweck dieses Dokuments

Dieses Dokument beschreibt bewusst **nicht** den aktuellen Runtime-Zustand,
sondern die gewuenschte Zielarchitektur, die bei Backend-Ausbau, Storage-Aufbau,
Agentik, Retrieval und Data Aggregation als gemeinsames Bild dienen soll.

Kurzregel:

- **Specs** = laufende Truth fuer IST, Drifts, Contracts und Verify-Gates
- **dieses Dokument** = konsolidierter Zielzustand, damit die Richtung nicht
  fragmentiert in Archiv-MDs und Einzel-Research verloren geht

---

## 2. Zielbild in einem Satz

TradeView Fusion soll zu einer klar getrennten Multi-Plane-Plattform ausgebaut
werden:

`Browser -> Next.js BFF -> Go Control Plane -> Python Compute / Python Agent / Python Indexing -> Rust Hot Paths -> spezialisierte Stores`

mit

- `Postgres` als relationalem Rueckgrat,
- `SeaweedFS` als Object-/Artifact-/Snapshot-Layer,
- `Valkey` als ephemerem Nervensystem,
- `DuckDB + Polars + Arrow + Parquet` als tabellarischer Data Plane,
- `pgvector` und `FalkorDB` als komplementaeren semantischen Schichten,
- leichter Orchestrierung zuerst und `Temporal` nur bei echtem Durable-Execution-Bedarf.

---

## 3. Verbindliche System-Planes (SOLL)

### 3.1 Frontend / BFF Plane

- `Next.js` bleibt UI- und BFF-Schicht.
- Browser spricht nur mit kontrollierten BFF-/Gateway-Pfaden.
- Keine direkte Browser-Kommunikation mit Python, Rust, FalkorDB, Valkey,
  pgvector oder Object Storage.

### 3.2 Go Control Plane

- `Go Gateway` bleibt der einzige oeffentliche Entry Point fuer Kernpfade.
- Verantwortlich fuer:
  - AuthN/AuthZ
  - Policy / Capability Enforcement
  - Routing / Connector Dispatch
  - Streaming / SSE / WebSocket-Boundaries
  - Audit / Correlation / Request-IDs
  - signed access zu Artefakten

### 3.3 Python Compute Plane

- eigener fachlicher Bereich fuer:
  - Indicators
  - Aggregation
  - Feature Engineering
  - Backtesting-nahe Analytics
  - Forschungs- und Modellierungslogik
- Standardziel fuer tabellarische Datenpfade: `Polars`
- Rust wird von hier aus als Beschleuniger konsumiert
- **Modul:** `python-backend/python-compute/` — eigenstaendiges Python-Paket mit eigener `pyproject.toml` und eigenem `uv`-venv
  - beinhaltet indicator-service, pattern-engine, volatility-suite, regime-detection, portfolio-analytics
  - importiert aus `python-backend/shared/`
  - `python-backend/ml_ai/indicator_engine/`, `ml_ai/geopolitical_soft_signals/`, `ml_ai/memory_engine/` wurden in `python-compute/` zusammengefuehrt (Phase 22g, 18.03.2026); Originale in `python-backend/archive/` archiviert

### 3.4 Python Agent Plane

- eigener fachlicher Bereich fuer:
  - Agent Runtime
  - Tools
  - Context Assembly
  - Retrieval
  - Claim / Evidence / Verification
  - Memory Access
  - Simulation-nahe Orchestration
- **Modul:** `python-backend/python-agent/` — eigenstaendiges Python-Paket mit eigener `pyproject.toml` und eigenem `uv`-venv
  - startet als `agent-service` auf Port 8094
  - importiert aus `python-backend/shared/` (app_factory, grpc_server, etc.)
  - beinhaltet: `agent/loop.py` (LLM-agnostischer Run-Loop), `agent/tools/` (6 Tools), `agent/context.py`, `agent/context_assembler.py`, `agent/memory_client.py`, `agent/working_memory.py`, `agent/roles.py`, `agent/streaming.py`, `agent/guards.py`, `agent/validators/`, `agent/extensions.py`
  - Herkunft: Merge aus `python-backend/ml_ai/agent/` + `ml_ai/context/` (Phase 22g, 18.03.2026); Originale in `python-backend/archive/` archiviert
- **Async-Primitiv:** `anyio` (via FastAPI/Starlette) als Standard fuer parallele Tool-Calls mit Timeout/Cancellation
  - `anyio.move_on_after(AGENT_TOOL_TIMEOUT_SEC)` in `loop._run_tool()` — verhindert blockierende Einzel-Calls
  - `asyncio.gather()` fuer parallele Tool-Ausfuehrung in `_gather_tool_results()`
- **HTTP-Konventionen:** `agent/http_client.py` — singleton `httpx.AsyncClient` (ABP.2c); kein `async with AsyncClient()` pro Call
- **Rust-Integration:** `tradeviewfusion_rust_core` (PyO3-Wheel) fuer agent-spezifische Hot Paths:
  - `extract_entities_from_text()` — Entitaets-Extraktion aus freiem Text
  - `dedup_context_fragments()` — Hash-basiertes Dedup von Context-Fragmenten
  - `score_tools_for_query()` — Token-Overlap + Name-Boost Tool-Scoring

### 3.5 Python Indexing / Ingest Plane

- eigener asynchroner Bereich fuer:
  - Research-/Paper-/RAG-Ingestion
  - Parse / Normalize / Chunk
  - Embeddings
  - Graph Extraction
  - Community Summaries
  - Reindex / Backfill / Reprocessing

Wichtig:

- Diese Plane muss **nicht** sofort ein weiterer permanenter Public Service sein.
- Sie kann zuerst als Worker-/Pipeline-Domain betrieben werden.

### 3.6 Rust Hot-Path Plane

- `Rust` bleibt gezielter Beschleuniger fuer:
  - numerische Hot Paths
  - Indicator-Kerne
  - OHLCV-/Batch-Operationen
  - spaetere Backtester-/Risk-Engines
  - **Agent-spezifische Hotpaths** (Phase 22g+):
    - `extract_entities_from_text()` — Entitaets-Extraktion (Ticker, Laender, Metriken, Asset-Klassen)
    - `dedup_context_fragments()` — Hash-basiertes Dedup von Context-Fragmenten, sortiert nach Relevanz
    - `score_tools_for_query()` — Token-Overlap-basiertes Tool-Scoring mit Name-Boost
- keine Policy-, BFF- oder generische Domain-Truth-Schicht
- **Modul:** `python-backend/rust_core/` (PyO3-cdylib, maturin); wird von `python-agent` und `python-compute` als Wheel konsumiert
- **GIL-Policy:** alle neuen Funktionen nutzen `py.detach()` fuer GIL-freie Ausfuehrung (PyO3 0.22+)

---

## 4. Polyglot-Persistence-Zielbild

### 4.1 Relationales Rueckgrat

- **Set:** `Postgres`
- Rolle:
  - System of Record
  - User-, Portfolio-, Order-, Audit-, Config-, Metadata- und Episodic-Daten
  - relationale Kernobjekte fuer produktive Betriebsdaten

### 4.2 Object / Artifact Layer

- **Set:** `SeaweedFS`
- Rolle:
  - raw snapshots
  - normalized artefacts
  - Parquet-/Arrow-Dateien
  - Backtest-Outputs
  - Dokumente / Audio / Exporte

### 4.3 Cache / Locks / leichte Streams

- **Set:** `Valkey`
- Rolle:
  - hot caches
  - short-lived coordination
  - rate limits
  - locks
  - leichte stream-/queue-artige Aufgaben

### 4.4 Graph / entity-centric retrieval

- **Set:** `FalkorDB`
- Rolle:
  - Knowledge Graph
  - entity-/claim-/evidence-zentrierte Beziehungen
  - multi-hop retrieval
  - agent memory
  - graph-native hybrid retrieval

### 4.5 Document-centric semantic retrieval

- **Set:** `pgvector`
- Rolle:
  - dokument-/chunk-/image-nahe Embeddings
  - semantische Suche dort, wo der relationale Kontext wichtig bleibt

### 4.6 Lokale Spezialcaches

- **Set:** `redb`
- Rolle:
  - lokaler Rust-/Python-naher OHLCV/read-through cache
  - kein allgemeiner Domain-Store

### 4.7 Dev-/Uebergangssysteme

- **Prepare / Transition only:** `SQLite`, `Kuzu`, `Chroma`
- Arbeitsregel:
  - fuer Dev, Bootstrap oder lokale Experimente ok
  - nicht als langfristige Produktionsverfassung betrachten

---

## 5. Tabellarische Data Plane (SOLL)

Die tabellarische Verarbeitung soll nicht mehr primär ueber JSON-/dict-Last
gedacht werden, sondern ueber eine datenbewusste Compute-Schicht.

### 5.1 Kernstapel

- **Set:** `DuckDB`
- **Set:** `Polars`
- **Set:** `Apache Arrow`
- **Set:** `Parquet`

### 5.2 Rollen

- `DuckDB`
  - lokale/worker-seitige analytische SQL-Engine
  - ad-hoc analytics
  - backfills
  - scans auf Parquet-/Datei-basierten Artefakten
- `Polars`
  - Standard-DataFrame-Layer fuer Python Compute
  - Arrow-backed
  - Rust-nah
  - Multi-Core / SIMD / Lazy Execution
- `Apache Arrow`
  - Zero-copy memory/interchange
  - spaltenorientierte In-Memory-Repräsentation
  - Bruecke zwischen Polars, DuckDB und Rust/PyO3
- `Parquet`
  - Standardformat fuer groessere tabellarische Artefakte
  - persistenter Output fuer Batch-, Snapshot- und Analytics-Pfade

### 5.3 Optional spaeter

- **Prepare:** `Arrow Flight`
  - wenn grosse tabellarische Transfers ueber Service-Grenzen wirklich zum
    Bottleneck werden
- **Prepare:** `Apache Iceberg`
  - wenn aus einzelnen Parquet-Artefakten echte versionierte Lakehouse-Tabellen
    werden sollen
- **Prepare:** `Dremio`
  - nur wenn SQL-Federation, groessere Concurrency oder ein echter Lakehouse-
    Query-Layer gebraucht wird
- **Prepare:** `MotherDuck`
  - nur fuer spaetere Cloud-/Concurrency-Skalierung, nicht fuer die jetzige
    lokale Kernarchitektur
- **Defer / only with evidence:** `Druid`
  - nur fuer spaetere verteilte Realtime-Analytics auf Plattformniveau
  - nicht als Ersatz fuer `DuckDB`, sondern andere Systemklasse

---

### 5.4 DuckDB / MotherDuck / Druid sauber trennen

- `DuckDB`
  - lokale oder serverseitige in-process Analytics-Engine
  - sehr stark fuer Worker, Batch-Jobs, Research-SQL, Backfills und Parquet-Scans
  - kann in Docker auf dem Server laufen
  - ist aber nicht die primaere Wahl fuer sehr viele gleichzeitige interaktive Nutzer

- `MotherDuck`
  - verwaltete / cloud-nahe Mehrbenutzer- und Concurrency-Erweiterung der
    `DuckDB`-Welt
  - sinnvoll erst dann, wenn `DuckDB`-Workloads kollaborativer oder cloud-
    skalierter werden muessen

- `Druid`
  - verteilte Realtime-Analytics-Datenbank fuer grosse Event-/Zeitreihenlast
  - eher fuer viele gleichzeitige Dashboard-/Analytics-Abfragen und hohe
    Ingest-Raten
  - nicht der "große Bruder" von `DuckDB`, sondern eine andere Analytics-Klasse

Arbeitsregel:

- zuerst `DuckDB`
- spaeter bei echter DuckDB-Concurrency-/Cloud-Problematik `MotherDuck`
- `Druid` nur bei nachgewiesenem Bedarf an verteilter Realtime-Analytics

---

## 6. Search-, Retrieval- und Knowledge-Zielbild

### 6.1 Suchschichten

- **Set:** `pgvector`
- **Set:** `FalkorDB`
- **Prepare:** `OpenSearch`
- **Prepare:** `Meilisearch`

### 6.2 Rollentrennung

- `pgvector`
  - baseline semantic retrieval fuer documents/chunks/images
  - relational nah
  - gut fuer ACID-/JOIN-nahe Retrieval-Pfade
- `FalkorDB`
  - entity-centric graph layer
  - claims / evidence / entities / communities / multi-hop reasoning
  - selektive vectors dort, wo Graph + Semantik zusammengehoeren
- `OpenSearch`
  - spaetere zentrale Search-/Analytics-/Observability-Schicht
  - Volltext, Filter, Aggregationen, Logsuche, evtl. Vektor-/Hybrid-Suche
- `Meilisearch`
  - einfache, schnelle app-nahe Volltextsuche
  - Alternative fuer leichtere Produkt-Search
  - nicht dieselbe strategische Rolle wie OpenSearch

### 6.3 Verbindliche Arbeitsregel

- Nicht dieselben Embeddings blind in `pgvector`, `FalkorDB` und weiteren
  Systemen duplizieren.
- Pro Datenklasse muss klar sein, welche Retrieval-Schicht primaer ist.

---

## 7. Orchestrierung und Durable Execution (SOLL)

### 7.1 Zuerst leichtgewichtig

- **Set / first choice family:**
  - `Asynq`
  - `River`
  - `ARQ`
  - `Hatchet`

### 7.2 Spaeter schwergewichtig

- **Prepare:** `Temporal`
- **Prepare:** `Restate`

### 7.3 Empfohlene Einordnung

- `Asynq`
  - Go-first background jobs auf Redis/Valkey-Basis
- `River`
  - Go-first jobs auf Postgres-Basis
- `ARQ`
  - async Python jobs auf Redis/Valkey-Basis
- `Hatchet`
  - leichte durable workflow-/task-Orchestrierung
  - sinnvoll, wenn mehr als reine Queue-Semantik gebraucht wird
- `Temporal`
  - nur bei echten langlebigen, resume-kritischen, zustandsbehafteten Flows
  - nicht als Default-Ersatz fuer einfache Queues

### 7.4 NATS / JetStream

- **Set:** `NATS`
- **Set:** `JetStream`

Rolle:

- Event Backbone
- Replay
- durable consumers
- fanout / stream semantics

Grenze:

- `JetStream` kann Queue-/Replay-/Event-Store-nahe Rollen abdecken
- `JetStream` ersetzt nicht automatisch die volle Durable-Execution-Klasse
  von `Temporal`

---

## 8. Governance-, Metadata- und Observability-Layer

### 8.1 Sofort relevant

- **Set:** `OpenTelemetry`
- **Set:** `OpenObserve`

### 8.2 Vorbereiten

- **Prepare:** `OpenLineage`
- **Prepare:** `DataHub`
- **Prepare:** `Great Expectations`

Rollen:

- `OpenLineage`
  - standardisierte Lineage-Events fuer Jobs / Runs / Datasets
- `DataHub`
  - Metadata Catalog, Ownership, Discovery, Governance, Lineage-Sicht
- `Great Expectations`
  - Data-Quality / Validation-Layer bei wachsender Pipeline-Komplexitaet

### 8.3 Security / Plattformoptionen

- **Prepare:** `Keycloak`
- **Prepare:** `OpenBao`
- **Prepare:** `OPA`
- **Prepare:** `Kyverno`
- **Prepare:** `Harbor`
- **Prepare:** `Trivy`
- **Prepare:** `Sigstore`
- **Prepare:** `SPDX`
- **Prepare:** `CycloneDX`

Diese gehoeren ins Gesamtzielbild, aber nicht alle sofort in die aktive
Kernplattform.

---

## 9. Geo-/Interop-/Format-Erweiterungen

- **Prepare:** `FlatGeobuf`
- **Prepare:** `GeoPackage`
- **Prepare:** `GeoServer`
- **Prepare:** `STAC`
- **Prepare:** `H3`
- **Prepare:** `PostGIS`
- **Prepare:** `GDAL`
- **Prepare:** `PROJ`
- **Prepare:** `Trino`

Ziel:

- geo-nahe Streaming-/Export-/Interop-Pfade nicht spaeter neu erfinden,
  sondern frueh im Hinterkopf behalten

---

## 10. Klare Empfehlungen (Kurzfassung)

### Set

- `Go Gateway`
- `Python Compute` (Modul: `python-backend/python-compute/`)
- `Python Agent` (Modul: `python-backend/python-agent/`)
- `Python Indexing/Ingest Workers` (Modul: `python-backend/python-ingest-workers/`)
- `Rust Hot-Path Core` (Modul: `python-backend/rust_core/`)
- `Postgres`
- `SeaweedFS`
- `Valkey`
- `DuckDB`
- `Polars`
- `Apache Arrow`
- `Parquet`
- `redb`
- `pgvector`
- `FalkorDB`
- `NATS`
- `JetStream`
- `anyio` (Agent-Plane Async-Primitiv — Cancel Scopes, Timeouts, Parallelitaet; via FastAPI/Starlette bereits transitiv vorhanden)

### Prepare

- `OpenSearch`
- `Meilisearch`
- `Arrow Flight`
- `Apache Iceberg`
- `Hatchet`
- `River`
- `Asynq`
- `ARQ`
- `OpenLineage`
- `DataHub`
- `Great Expectations`
- `Keycloak`
- `OpenBao`
- `OPA`
- `Kyverno`
- `Harbor`
- `Trivy`
- `Sigstore`
- `SPDX`
- `CycloneDX`
- `FlatGeobuf`
- `GeoPackage`
- `GeoServer`
- `STAC`
- `H3`
- `PostGIS`
- `GDAL`
- `PROJ`
- `Trino`
- `Dremio`
- `MotherDuck`

### Defer / only with evidence

- `Temporal`
- `Restate`
- `Druid`
- dedizierte zusätzliche Vector-Cluster (`Qdrant`, `Milvus`) falls
  `pgvector` / `FalkorDB` die naechste Stufe nicht mehr tragen

---

## 11. Abgrenzung zu DATA_AGGREGATION_Master

Dieses Dokument beantwortet:

- welche Planes es gibt
- welche Systeme Kern, Option oder spaeteres Ausbauziel sind
- wie die Stores grob verteilt sind

`DATA_AGGREGATION_Master` leitet daraus ab:

- konkrete Datenzonen
- konkrete Datenpfade
- Formate und Artefakte
- Aggregations- und Retrieval-Logik

Kurz:

- `ARCHITECTURE` = Systemverfassung
- `DATA_AGGREGATION` = Data Plane Auspraegung dieser Verfassung

---

## 12. Querverweise

- `docs/specs/ARCHITECTURE.md`
- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/architecture/GO_GATEWAY_BOUNDARY.md`
- `docs/specs/architecture/AGENT_RUNTIME_ARCHITECTURE.md`
- `docs/specs/architecture/MEMORY_AND_STORAGE_BOUNDARIES.md`
- `docs/specs/architecture/ORCHESTRATION_AND_MESSAGING.md`
- `docs/specs/architecture/DOMAIN_CONTRACTS.md`
- `docs/specs/data/DATA_ARCHITECTURE.md`
- `docs/specs/data/STORAGE_AND_PERSISTENCE.md`
- `docs/go-research-financial-data-aggregation-2025-2026.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
