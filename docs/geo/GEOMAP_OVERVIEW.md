# GeoMap Overview

> **Stand:** 09. Maerz 2026
> **Zweck:** Umbrella-/Index-Spec fuer GeoMap nach dem Root->Spec-Split.
> **Source-of-Truth-Rolle:** Einstiegspunkt und Ownership-Matrix fuer GeoMap-Specs.

---

## Read Order

1. `GEOMAP_OVERVIEW.md`
2. `GEOMAP_PRODUCT_AND_POLICY.md`
3. `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
4. `GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`
5. `GEOMAP_FOUNDATION.md`
6. `GEOMAP_RENDERING_AND_STACK` Inhalte in `GEOMAP_MODULE_CATALOG.md` + `GEOMAP_FOUNDATION.md`
7. `GEOMAP_VERIFY_GATES.md`
8. `GEOMAP_ROADMAP_AND_MILESTONES.md`

---

## Owner Matrix

| Frage | Fuehrendes Dokument |
|:------|:--------------------|
| Produktziele, Governance, Policy | `GEOMAP_PRODUCT_AND_POLICY.md` |
| Event/Candidate/Timeline Contracts + Feedback | `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` |
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
