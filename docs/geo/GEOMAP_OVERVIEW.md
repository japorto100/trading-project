# GeoMap Overview

> **Stand:** 13. Maerz 2026
> **Zweck:** Umbrella-/Index-Spec fuer GeoMap nach dem Root->Spec-Split.
> **Source-of-Truth-Rolle:** Einstiegspunkt und Ownership-Matrix fuer GeoMap-Specs.

---

## Read Order

1. `GEOMAP_OVERVIEW.md`
2. `GEOMAP_PRODUCT_AND_POLICY.md`
3. `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
4. `GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md`
5. `GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`
6. `GEOMAP_FOUNDATION.md`
7. `GEOMAP_RENDERING_AND_STACK` Inhalte in `GEOMAP_MODULE_CATALOG.md` + `GEOMAP_FOUNDATION.md`
8. `GEOMAP_VERIFY_GATES.md`
9. `GEOMAP_ROADMAP_AND_MILESTONES.md`

---

## Owner Matrix

| Frage | Fuehrendes Dokument |
|:------|:--------------------|
| Produktziele, Governance, Policy | `GEOMAP_PRODUCT_AND_POLICY.md` |
| Event/Candidate/Timeline Contracts + Feedback | `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` |
| Ontologie, Search-Around, Geo-Graph, geotemporale Runtime | `GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md` |
| Quellen-/Provider-Grenzen | `GEOMAP_SOURCES_AND_PROVIDER_POLICY.md` |
| Basemap, Geocoding, PMTiles, Rendering-Gates | `GEOMAP_FOUNDATION.md` |
| D3-Modul-Katalog, Feature->Module-Matrix, Bundle-Budgets | `GEOMAP_MODULE_CATALOG.md` |
| Draw/E2E/Performance Verify | `GEOMAP_VERIFY_GATES.md` |
| Milestones/Execution-Reihenfolge | `GEOMAP_ROADMAP_AND_MILESTONES.md` |
| Externe Referenz-Reviews (z. B. Pharos AI) | `PHAROS_AI_REVIEW.md` |

---

## Archivhinweis

Die vorherigen Root-Dateien wurden fuer Traceability unter `docs/archive/` als
`*_2026-03-09_pre-split.md` gesichert.

## Evaluate-compressed Uebernahme (Status)

Die Uebernahme aus `evaluate-compressed.md` ist als Scope-Entscheidung in den
Geo-Specs verankert:

- Uebernahme-/Nicht-Uebernahme-Logik (1/2/3/4) in `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` (Sek. 35.4f),
- Provider- und Basemap-Mindestanforderungen in `GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`,
- Abnahmekriterien fuer Staedte/Seen/Fluesse in `GEOMAP_VERIFY_GATES.md` (Sek. 6).

---

## Renderer- und View-Kurzregel

- `d3-geo` bleibt der normative Globe-Core fuer GeoMap v1/v2.
- `deck.gl` / `MapLibre` sind fuer einen spaeteren Flat/Regional-/Conflict-Mode vorgesehen und ersetzen den Globe-Core nicht.
- GeoMap zielt langfristig auf **mehrere Views mit gemeinsamen Domain-Contracts**, nicht auf einen einzelnen Renderer fuer alles.
- `Earth` ist der primaere GeoMap-Arbeitskoerper; `Moon` bleibt fuer v2 ein spezialisierter Body-Mode.
- Ein gleichzeitiger `Earth + Moon`-Co-View ist fuer v2 nicht verpflichtend und nur bei echtem Multi-Body-/Scene-Bedarf spaeter gesondert zu bewerten.
- Der Wechsel von Globe zu Flat soll **nicht** nur ueber einen starren Toggle erfolgen, sondern vor allem ueber kontextuelle Handoffs: Region-/Event-/Cluster-/Story-Fokus, Draw-Area oder Analysten-Drilldown.
- Globe bleibt die strategische Landing- und Overview-Ansicht; Flat/Regional wird der spaetere operative Analystenmodus fuer dichte lokale Konflikt-/Asset-/Threat-Lagen.
