# DATA AGGREGATION MASTER

> **Stand:** 18. Maerz 2026
> **Status:** Root-Strategiedokument fuer den **SOLL-Zustand** der Datenebene.
> **Aenderungshistorie:**
> - Rev. 1 (17.03.2026): Erstanlage
> - Rev. 2 (18.03.2026): python-agent und python-compute als eigenstaendige Module vermerkt (Phase 22g); Rust Agent Hotpaths ergaenzt; ml_ai-Merge-Ergebnis als Datenpfad-Implikation aufgenommen
> **Rolle:** Verdichtetes Zielbild fuer Datenfluss, Zonen, Formate, Retrieval-
> Rollen, Snapshot-/Artefakt-Strategie und tabellarische Data Plane.
> **Ableitung:** Dieses Dokument ist die Data-Plane-Auspraegung von
> `ARCHITECTURE_NEW_EXTENSION.md`.
> **Normative Detail-Owner:** `docs/specs/data/DATA_ARCHITECTURE.md`,
> `docs/specs/data/STORAGE_AND_PERSISTENCE.md`, `docs/specs/SYSTEM_STATE.md`

---

## 1. Zweck dieses Dokuments

Dieses Dokument beschreibt nicht primär den heute laufenden Codepfad, sondern
den gewuenschten Endzustand der Datenaggregation:

- wie Daten in das System kommen
- wie sie gespeichert und normalisiert werden
- welche Formate und Compute-Werkzeuge Standard werden
- welche Retrieval-Schicht fuer welche Datenklasse gedacht ist

Kurzregel:

- **Architecture Root** sagt, welche Planes und Systeme das Gesamtbild tragen
- **dieses Dokument** sagt, wie die Datenebene konkret auf diesen Planes laufen soll

---

## 2. Zielbild in einem Satz

TradeView Fusion soll eine Go-owned Aggregations- und Routing-Schicht mit
object-first Snapshots, relationaler Metadata-Fuehrung, Arrow-/Polars-/DuckDB-
basierter tabellarischer Verarbeitung und klar getrennter semantic retrieval
Schichtung aus `pgvector` und `FalkorDB` erhalten.

---

## 3. Gewuenschter End-to-End Datenfluss

```text
source/provider/feed/file
  -> Go connector/router
  -> hot cache and/or raw snapshot
  -> normalize / validate / enrich
  -> relational metadata + object artifacts
  -> derived serving products / feature products
  -> document retrieval and/or graph retrieval
  -> Go API/SSE/BFF consumption
```

Erweiterter Batch-/Indexing-Pfad:

```text
source
  -> ingest worker
  -> parse / chunk / extract / embed
  -> Parquet/Arrow artifacts in SeaweedFS
  -> metadata in Postgres
  -> vectors in pgvector
  -> entities/claims/evidence in FalkorDB
```

---

## 4. Verbindliche Datenzonen (SOLL)

### 4.1 `raw`

- ungefilterte Quelle oder Rohsnapshot
- append-only
- object-first
- nicht direktes Retrieval-Futter

### 4.2 `normalized`

- kanonisch aufbereitete Daten
- schema- und provenance-markiert
- Grundlage fuer Serving, Embeddings, Graph-Writes und spaetere Backfills

### 4.3 `derived / serving`

- Features
- Signals
- Views
- materialisierte Serving-Produkte
- Query-/API-/SSE-nahe Ableitungen

### 4.4 `semantic / retrieval`

- documents/chunks/images fuer semantische Suche
- entities/claims/evidence fuer graph-native Retrieval

### 4.5 `episodic / operational`

- Job-Status
- pipeline metadata
- audit / ownership / review / promotion

---

## 5. Storage- und Format-Strategie

### 5.1 Relationale Kern- und Metadata-Schicht

- **Set:** `Postgres`

Rolle:

- snapshot metadata
- parser status
- ownership
- operational metadata
- review/promotion metadata
- episodic / audit-nahe Data-Plane-Begleitdaten

### 5.2 Object-/Artifact-Layer

- **Set:** `SeaweedFS`

Rolle:

- raw snapshots
- normalized exports
- Parquet-/Arrow-Artefakte
- Backtest-Outputs
- ingest-/indexing-Artefakte

### 5.3 Ephemere Data-Plane-Layer

- **Set:** `Valkey`

Rolle:

- hot cache
- dedupe hints
- lock/state coordination
- kurze stream-/task-nahe Hilfsdaten

### 5.4 Lokaler Compute-Spezialcache

- **Set:** `redb`

Rolle:

- OHLCV/read-through cache
- Python/Rust-naher Spezialpfad
- kein allgemeiner SoR

---

## 6. Tabellarische Data Plane

### 6.1 Kernstapel

- **Set:** `DuckDB`
- **Set:** `Polars`
- **Set:** `Apache Arrow`
- **Set:** `PyArrow`
- **Set:** `Parquet`

### 6.2 Arbeitsregel je Baustein

- `DuckDB`
  - Worker-/Analyse-SQL auf Parquet und lokalen Daten
  - Backfills
  - Research-/Replay-/Batch-Auswertungen
  - kein transaktionaler Haupt-SoR

- `Polars`
  - Standard-DataFrame fuer neue Python-Compute-Pfade
  - Arrow-backed
  - Multi-Core / SIMD
  - Rust-nah und fuer OHLCV-/Feature-Batches ideal

- `Apache Arrow` / `PyArrow`
  - Zero-copy / fast interchange
  - Data-plane-Thema, nicht primaer Agent-Memory-Thema

- `Parquet`
  - persistente tabellarische Artefakte
  - Standardformat fuer groeßere Batch-/Snapshot-/Export-Pfade

### 6.3 Optional spaeter

- **Prepare:** `Arrow Flight`
  - nur wenn grosse tabellarische Transfers zwischen Services wirklich dominant werden
- **Prepare:** `Apache Iceberg`
  - wenn aus Parquet-Dateien echte versionierte Tabellen mit time travel und
    schema evolution werden muessen
- **Prepare:** `Dremio`
  - wenn spaeter SQL-Federation oder Lakehouse Query Serving relevant wird
- **Prepare:** `MotherDuck`
  - nur bei spaeterem Concurrency-/Cloud-Bedarf
- **Defer / only with evidence:** `Druid`
  - nur fuer spaetere verteilte Realtime-Analytics auf Event-/Zeitreihenebene

### 6.4 Parquet vs. Iceberg

- `Parquet` = Dateiformat
- `Iceberg` = Tabellen-/Metadaten-/Snapshot-Layer ueber Dateien wie Parquet

Arbeitsregel:

- zuerst `Parquet`
- `Iceberg` erst dann, wenn versionierte Tabellen wirklich gebraucht werden

### 6.5 DuckDB / MotherDuck / Druid als drei Stufen

- `DuckDB`
  - Standard fuer lokale oder serverseitige in-process Analytics
  - ideal fuer Worker, Backfills, Research-SQL, Replay und Parquet-Scans
  - kann in Docker auf dem Server laufen
  - hat aber Grenzen bei sehr vielen gleichzeitigen interaktiven Nutzern

- `MotherDuck`
  - spaetere Mehrbenutzer-/Cloud-Erweiterung der `DuckDB`-Welt
  - sinnvoll bei echter Concurrency- und Kollaborationsproblematik

- `Druid`
  - eigene verteilte Analytics-Klasse fuer grosse Realtime-Event- und
    Zeitreihen-Last
  - eher fuer massive ingestierte Event-Daten und viele schnelle
    Dashboard-Abfragen gleichzeitig

Arbeitsregel:

- `DuckDB` zuerst
- `MotherDuck` nur bei echter DuckDB-Concurrency-/Cloud-Stufe
- `Druid` nur bei nachgewiesenem Plattformbedarf fuer verteilte Realtime-Analytics

---

## 7. Ingestion- und Aggregationsmodule

### 7.1 Go-owned ingestion/router

- Provider-/Connector-Routing
- capability-/quota-/retry-/fallback-Logik
- source-class Entscheidung:
  - `api-hot`
  - `api-snapshot`
  - `file-snapshot`
  - `stream-only`

### 7.2 Python Compute aggregation

- Feature Engineering
- technical indicators
- portfolio-/correlation-/backtest-nahe Datenverarbeitung
- standardisiert auf `Polars`
- **Modul:** `python-backend/python-compute/` — eigenstaendiges Paket mit eigener `pyproject.toml`
  - indicator-service, finance-bridge, geopolitical-soft-signals, volatility-suite, regime-detection
  - Herkunft: `ml_ai/indicator_engine/` + `ml_ai/geopolitical_soft_signals/` + `ml_ai/memory_engine/`
    wurden hier konsolidiert (Phase 22g, 18.03.2026); Originale in `python-backend/archive/` archiviert

### 7.3 Python Indexing / Ingest Workers

- parse
- normalize
- chunk
- embed
- graph extract
- publish

Das ist die logische dritte Python-Domain:

- nicht primaer Online-API
- sondern ingest-/indexing-/reprocessing-/RAG-Pipeline

### 7.3b Python Agent als Datenkonsument

- `python-backend/python-agent/` — eigenstaendiges Modul mit eigener `pyproject.toml` + `uv`-venv
- Agent Runtime konsumiert Daten aus Go-Gateway, Memory-Service und Context-Assembly
- **Datenpfad im Agent:**
  - `context_assembler.py` aggregiert KG-Fragmente, Episodic-Eintraege und Vector-Treffer
  - `memory_client.py` spricht Go-Gateway → Memory-Service (KG, Vector, Episodes)
  - `working_memory.py` — M5-Scratchpad (in-memory, session-keyed, kein persistenter Store)
  - Rust-Wheel (`tradeviewfusion_rust_core`) fuer agent-spezifische Daten-Hotpaths:
    - `dedup_context_fragments()` — Hash-Dedup von Context-Fragmenten nach Relevanz
    - `extract_entities_from_text()` — strukturierte Entitaets-Extraktion aus freiem Text
    - `score_tools_for_query()` — Token-Overlap-Scoring fuer Tool-Selektion
- Herkunft: `ml_ai/agent/` + `ml_ai/context/` wurden in `python-agent/agent/` konsolidiert
  (Phase 22g, 18.03.2026); Originale in `python-backend/archive/` archiviert

### 7.4 Rust acceleration

- OHLCV processing
- indicator kernels
- redb cache
- **Agent-spezifische Hotpaths** (Phase 22g+): entity extraction, context dedup, tool scoring
  (via `tradeviewfusion_rust_core` PyO3-Wheel, GIL-frei via `py.detach()`)
- spaeter native backtester-/risk-nahe Pfade

---

## 8. Retrieval-Rollen: pgvector vs. FalkorDB

### 8.1 `pgvector`

- **Set**
- primaer fuer:
  - documents
  - chunks
  - image embeddings
  - generische semantische Suche mit relationalem Kontext

### 8.2 `FalkorDB`

- **Set**
- primaer fuer:
  - entities
  - claims
  - evidence
  - relationship-heavy retrieval
  - graph memory
  - multi-hop reasoning

### 8.3 Verbindliche Arbeitsregel

- `pgvector` und `FalkorDB` schliessen sich nicht aus
- sie duerfen aber nicht ohne klare Rollentrennung befuellt werden

Empfohlene Aufteilung:

- `pgvector` = document-centric semantic retrieval
- `FalkorDB` = entity-/graph-centric retrieval

Selektive Vektoren in FalkorDB sind sinnvoll, wenn sie graphnah sind.
Massive Dokument-Embeddings gehoeren nicht automatisch auch dort hinein.

---

## 9. Search- und Analytics-Erweiterungen

### 9.1 `OpenSearch`

- **Prepare**
- sinnvoll fuer:
  - zentrale Volltextsuche
  - Dokument-/Metadaten-Suche
  - Aggregationen
  - spaetere Search-/Analytics-/Observability-Konsolidierung

### 9.2 `Meilisearch`

- **Prepare**
- sinnvoll fuer:
  - einfachere produktnahe Server-Suche
  - schnelle App-Search ohne breiten Analytics-Anspruch

Arbeitsregel:

- `Meilisearch` ist keine vollstaendige strategische Entsprechung zu
  `OpenSearch`
- fuer euren spaeteren Search-/Analytics-Gesamtstack ist `OpenSearch`
  interessanter
- fuer reine App-Suche kann `Meilisearch` trotzdem attraktiv bleiben

---

## 10. Orchestrierung der Data Plane

### 10.1 Leichtgewicht zuerst

- **Prepare / first choice family:**
  - `Asynq`
  - `River`
  - `ARQ`
  - `Hatchet`

Geeignet fuer:

- ingest tasks
- background enrichment
- snapshot processing
- embedding jobs
- leichte reprocessing flows

### 10.2 Schwergewicht spaeter

- **Defer / only with evidence:** `Temporal`

Geeignet erst bei:

- langen multi-step pipelines
- crash-/resume-kritischen Runs
- branch-/approval-/stateful workflows ueber Stunden/Tage

### 10.3 `NATS` / `JetStream`

- **Set**
- Rolle:
  - Event Backbone
  - durable consumers
  - replay
  - fanout

Wichtig:

- stark fuer Eventing / Replay / Stream-Semantik
- kein automatischer Vollersatz fuer eine echte workflow-code engine

---

## 11. Data Governance / Metadata / Quality

- **Prepare:** `OpenLineage`
- **Prepare:** `DataHub`
- **Prepare:** `Great Expectations`

Rollen:

- `OpenLineage`
  - wer hat welches Dataset gelesen/geschrieben
- `DataHub`
  - Katalog, Ownership, Discovery, Governance, Lineage-Sicht
- `Great Expectations`
  - strukturierte Data-Quality-Regeln

Diese Schicht wird relevant, sobald die ingest-/snapshot-/normalization-Pipeline
breiter und teamfaehiger wird.

---

## 12. Zusatzpunkte aus Root-/Research-Linie, die bewusst im Hinterkopf bleiben sollen

- `FlatGeobuf` fuer schnelle Geo-Streaming-Pfade
- `GeoPackage` fuer Offline-/Geo-Interop
- `GeoServer` fuer spaetere OGC-/GIS-Interop, falls standardisierte Layer-
  Publikation fuer externe GIS-Clients oder PostGIS-Backends gebraucht wird
- `STAC` fuer spaetere geospatial/EO Kataloge
- `H3` fuer Raster-/Zellenaggregation
- `PostGIS` fuer spaetere heavy spatial query use cases
- `GDAL` / `PROJ` fuer Geo-ETL und CRS-Hygiene
- `Trino` fuer spaetere SQL-Federation ueber mehrere Datenquellen

Diese gehoeren nicht in den ersten Ausbau-Sprint der Data Plane, aber sollten
im Zielbild sichtbar bleiben.

---

## 13. Klare Empfehlungen (Kurzfassung)

### Set

- `Postgres`
- `SeaweedFS`
- `Valkey`
- `DuckDB`
- `Polars`
- `Apache Arrow`
- `PyArrow`
- `Parquet`
- `redb`
- `pgvector`
- `FalkorDB`
- `NATS`
- `JetStream`

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
- `Dremio`
- `MotherDuck`
- `FlatGeobuf`
- `GeoPackage`
- `GeoServer`
- `STAC`
- `H3`
- `PostGIS`
- `GDAL`
- `PROJ`
- `Trino`

### Defer / only with evidence

- `Temporal`
- `Druid`
- weitere dedizierte Vector-Cluster, solange `pgvector` plus `FalkorDB`
  den Bedarf tragen

---

## 14. Abgrenzung zu ARCHITECTURE_NEW_EXTENSION

Dieses Dokument beantwortet:

- wie Daten konkret durch das System laufen
- welche Formate und Speicherrollen gesetzt werden
- wie Retrieval und Aggregation logisch getrennt werden

`ARCHITECTURE_NEW_EXTENSION` beantwortet:

- welche Planes existieren
- welche Systemgrenzen gelten
- welche Store-Klassen insgesamt zum Zielbild gehoeren

Kurz:

- `ARCHITECTURE` = Gesamtverfassung
- `DATA_AGGREGATION` = konkrete Data Plane dieser Verfassung

---

## 15. Querverweise

- `docs/ARCHITECTURE_NEW_EXTENSION.md`
- `docs/specs/data/DATA_ARCHITECTURE.md`
- `docs/specs/data/AGGREGATION_IST_AND_GAPS.md`
- `docs/specs/data/STORAGE_AND_PERSISTENCE.md`
- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/architecture/MEMORY_AND_STORAGE_BOUNDARIES.md`
- `docs/specs/architecture/ORCHESTRATION_AND_MESSAGING.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/go-research-financial-data-aggregation-2025-2026.md`
- `docs/archive/ERRORS.md`
