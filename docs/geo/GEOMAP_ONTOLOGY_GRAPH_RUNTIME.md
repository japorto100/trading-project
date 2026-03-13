# GeoMap Ontology, Graph and Runtime

> **Stand:** 13. Maerz 2026  
> **Zweck:** Fuehrendes GeoMap-Owner-Dokument fuer Ontologie-, Graph- und
> geotemporale Runtime-Vertraege (Search-Around, Writeback, Track-Modelle).
> **Abgrenzung:** Kein reines Renderer-/UI-Dokument. Renderer-Themen bleiben in
> `GEOMAP_FOUNDATION.md` und `GEOMAP_MODULE_CATALOG.md`.

---

## Scope und Abgrenzung

### Scope In

- semantisches GeoMap-Domaenmodell (Objekte, Relationen, Events, Tracks)
- Search-Around-/Graph-Traversal-Contract (inkl. Link-Merge-Pfade)
- geotemporale Track-/Interpolation-Regeln
- Writeback-/Action-Contract von Karte in persistente Daten
- Runtime-Stack-Einordnung (Graph + Spatial + Tile + Provenance)

### Scope Out

- konkrete UI-Komponenten, Styling und Interaktionsdetails
- detaillierte Renderer-Tuning-Fragen fuer Globe/Flat
- allgemeine Agent-Memory-Architektur ausser Geo-spezifischer Bruecken

---

## 1. Warum eigenes Ontologie-/Graph-Dokument?

`GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` beschreibt Event-/Candidate-/Timeline-
Vertraege sehr gut, aber die geo-semantische Schicht bleibt verteilt.

Dieses Dokument schliesst genau diese Luecke:

- **Was** ist ein Geo-Objekt im semantischen Sinn?
- **Wie** wird Search-Around formal abgebildet?
- **Wie** werden Zeit und Bewegung (Tracks) modelliert?
- **Wie** laufen kontrollierte Writebacks ueber Kartenaktionen?

---

## 2. Bestehende Basis (nicht neu erfinden)

### 2.1 Bereits vorhanden in Geo-Dokumenten

- Event/Candidate/Timeline Core-Contracts und Feedback-Loop:
  `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- Basemap/Geocoding/Rendering-Gates:
  `GEOMAP_FOUNDATION.md`, `GEOMAP_VERIFY_GATES.md`
- Flat/Conflict-Second-Mode Leitplanken:
  `GEOMAP_FOUNDATION.md`, `PHAROS_AI_REVIEW.md`, `geomap_closeout.md`

### 2.2 Bereits vorhanden in Memory/KG

- Domain-KG-Struktur, User-KG-Overlay und Merge-Strategie:
  `../MEMORY_ARCHITECTURE.md`

**Arbeitsregel:** Geo-Ontologie wird als spezialisierter Geo-Owner aufgebaut,
nicht isoliert von der Memory-Gesamtarchitektur.

---

## 3. Geo-Ontologie Kernmodell (v2 Zielbild)

### 3.1 Objektfamilien

- `GeoEntity` (z. B. actor, asset, corridor, chokepoint, zone, region)
- `GeoEvent` (zeitgebundene Vorkommnisse mit Severity/Confidence)
- `GeoTrack` (bewegte Entitaet im Zeitverlauf)
- `GeoRelation` (gerichtete, typisierte Kanten)
- `GeoEvidence` (Provenance, Quelle, Hash, Snapshot-Referenz)

### 3.2 Mindestrelationen

- `located_in`, `affects`, `controls`, `transits_through`
- `exposed_to`, `beneficiary_of`, `linked_to_event`
- `escalates_to`, `contradicts`, `supports`

### 3.3 Pflichtmetadaten

- `valid_from`, `valid_to`, `observed_at`
- `confidence`, `source_tier`, `provenance_ref`
- `policy_scope`, `write_intent`, `review_state` (bei Mutationen)

---

## 4. Search-Around und Graph-Traversal Contract

### 4.1 Ziel

Search-Around ist nicht nur ein UI-Feature, sondern eine fachliche Query-Schicht:

- Startknoten (Event/Entity)
- Traversal-Regeln (Tiefe, Relationstypen, Zeitfenster)
- Ergebnis als lokalisierter Subgraph fuer Karte + Panel

### 4.2 Ergebnisvertrag (minimum)

- `nodes[]` (RID/ID + type + geometry ref)
- `edges[]` (source, target, relation, confidence)
- `metrics[]` (optional, z. B. impact score / count / distance)
- `time_window` (active vs view extent)

### 4.3 Betriebsregel

- Search-Around-Resultate bleiben evidence- und provenance-gebunden.
- Keine implizite "Truth-Erhoehung" nur durch Traversal-Funde.

---

## 5. Geotemporale Tracks und Interpolation

### 5.1 GeoTrack-Mindestmodell

- `series_id`, `entity_id`, `timestamp`, `position`
- optionale Zustandsfelder (`speed`, `heading`, `status`)

### 5.2 Interpolationsmodi (explizit)

- `LINEAR`, `NEAREST`, `PREVIOUS`, `NEXT`, `NONE`

### 5.3 Regel

- jeder Replay-/Story-Pfad muss den verwendeten Interpolationsmodus offenlegen;
- Audit/Compliance-Views nutzen `NONE` oder klar deklarierte Inferenz.

---

## 6. Writeback-/Action-Contract

### 6.1 Prinzip

Kartenaktionen sind kontrollierte Mutationen, keine direkten Roh-DB-Schreibungen.

### 6.2 Mindestpfad

`UI action -> validated intent -> domain mutation -> timeline/audit append`

### 6.3 Pflichtdaten pro Writeback

- actor/user/agent id
- action type (`point`, `shape`, `state_change`, `link_update`)
- old/new payload
- reason note + source/evidence refs
- timestamp + policy decision id

---

## 7. Runtime-Stack-Einordnung (entscheidungsoffen, gate-basiert)

Dieses Dokument legt keine sofortige Vollmigration fest, sondern den
Bewertungsrahmen:

- Spatial store/query: PostGIS/Mobility-Pfade fuer geotemporale Suche
- Graph traversal: in-memory graph oder Graph-DB je Lastprofil
- dynamic tile path: Martin/pg_tileserv fuer parameterisierte Vektorpfade
- renderer coupling: Globe/Flat teilen Domain-Contracts, nicht Datenmodelle

Alle konkreten Technologieentscheide gehen ueber `geomap_closeout`-Gates.

---

## 8. Priorisierte Einfuehrungsreihenfolge

1. Ontologie-Kernbegriffe + Relationstypen als verbindlichen Contract fixieren
2. Search-Around Result-Contract in Geo-APIs/Stores spiegeln
3. GeoTrack/Interpolation explizit in Replay-/Timeline-Vertrag heben
4. Writeback-Contract inkl. Audit-/Evidence-Felder verbindlich machen
5. Stack-Gates fuer Graph/Spatial/Tile-Laufzeit mit Evidence entscheiden

---

## 9. Querverweise

- `GEOMAP_OVERVIEW.md`
- `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `GEOMAP_FOUNDATION.md`
- `GEOMAP_VERIFY_GATES.md`
- `GEOMAP_ROADMAP_AND_MILESTONES.md`
- `PHAROS_AI_REVIEW.md`
- `../specs/execution/geomap_closeout.md`
- `../MEMORY_ARCHITECTURE.md`
- `../Important-geov2plus-Open-Source-Alternative zu Palantir Foundry Map-ontologie.md`

---

## 10. Kernquellen (wichtigste URLs)

- Palantir Map Overview: https://palantir.com/docs/foundry/map/overview/
- Palantir Map Ontology Objects: https://palantir.com/docs/foundry/map/integrate-objects/
- Palantir Geospatial/Geotemporal Types: https://palantir.com/docs/foundry/geospatial/types-of-geospatial-and-geotemporal-data/
- Palantir Time-Series Interpolation: https://palantir.com/docs/foundry/time-series/interpolation-overview/
- Palantir Map Actions (Writeback): https://palantir.com/docs/foundry/map/integrate-actions/
- Apache Sedona: https://sedona.apache.org/
- PostGIS: https://postgis.net/
- MobilityDB: https://docs.mobilitydb.com/
- Martin Tile Server: https://github.com/maplibre/martin
- pg_tileserv: https://github.com/CrunchyData/pg_tileserv
- deck.gl: https://deck.gl/
- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
- Uber H3: https://h3geo.org/
