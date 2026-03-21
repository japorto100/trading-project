# GeoMap Closeout & Offene Punkte

> **Stand:** 20. Maerz 2026
> **Zweck:** Arbeits-Checkliste und Verify-Gates fuer GeoMap Phase-4-Closeout und
> alle offenen Punkte aus den gesplitteten GeoMap-Specs unter `docs/geo/`.
> **Master-Spec:** [`../../geo/GEOMAP_OVERVIEW.md`](../../geo/GEOMAP_OVERVIEW.md)

## Aenderungshistorie

- **19.03.2026** - `worldmonitor` als Geo-Referenz mit Clone-/Extraction-/Review-Trace aufgenommen; neue Shell-/Panel-/Marker- und Live-Verify-Checkboxen fuer GeoMap-Workspace ergaenzt.
- **20.03.2026** - Geo-Panel-Primitive (`GeoPanelFrame`) und naechster Shell-Split (`GeoWorkspaceStage`) im Produktcode eingefuehrt; Execution-Slice auf den laufenden Panel-/Naming-Refactor gespiegelt.

---

## 0. Execution Contract (verbindlich fuer CLI-Agents)

### Scope In

- GeoMap-Phase-4-Closeout inklusive Verify-Gates
- offene Milestones D/E/F mit umsetzbaren Checkpunkten
- API-, Test- und SOTA-Restpunkte mit klaren IDs

### Scope Out

- generische Kartenstrategien ohne Bezug zu GeoMap-Owner-Dokumenten
- neue Roadmap-Phasen ausserhalb bestehender GeoMap-Milestones

### Mandatory Upstream Sources (vor Abarbeitung lesen)

- `docs/geo/GEOMAP_OVERVIEW.md`
- `docs/geo/GEOMAP_PRODUCT_AND_POLICY.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `docs/geo/GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md`
- `docs/geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`
- `docs/geo/GEOMAP_FOUNDATION.md`
- `docs/geo/GEOMAP_MODULE_CATALOG.md`
- `docs/geo/GEOMAP_VERIFY_GATES.md`
- `docs/geo/GEOMAP_ROADMAP_AND_MILESTONES.md`
- `docs/geo/CRUCIX_AI_REVIEW.md`
- `docs/geo/WORLDWIDEVIEW_AI_REVIEW.md`
- `docs/geo/WORLDMONITOR_AI_REVIEW.md`
- `docs/geo/OGI_AI_REVIEW.md`
- `docs/geo/SHADOWBROKER_AI_REVIEW.md`
- `docs/geo/SOVEREIGN_WATCH_AI_REVIEW.md`
- `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md`
- `docs/geo/External_GEOSENTINEL_FRONTEND_REVIEW.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`

### Arbeitsprinzip

- GeoMap-Arbeit wird nur als "geschlossen" markiert, wenn Verify + Produkt-/Policy-Owner konsistent sind.
- Root- und Geo-Owner-Dokumente sind Pflicht-Lektuere, nicht optionales Beiwerk.
- Vor Flat-Mode-Contract-Aenderungen ist `PHAROS_AI_REVIEW.md` gegen den aktuellen `pharos-ai` Upstream-Stand zu revalidieren; das ist ein Monitoring-Gate, kein Scope-Shift.
- Vor Panel-/Workspace-Informationsarchitektur-Aenderungen ist `CRUCIX_AI_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/Crucix` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- Vor Plugin-/Adapter-/Timeline-/Panel-Contract-Aenderungen ist `WORLDWIDEVIEW_AI_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/worldwideview` sowie den kuratierten Stand in `_tmp_ref_review/extraction_candidates/worldwideview/extraction_manifest.txt` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- Vor Dual-Engine-/Panel-Primitive-/Geo-Shell-/Flat-Marker-Contract-Aenderungen ist `WORLDMONITOR_AI_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/worldmonitor` sowie den kuratierten Stand in `_tmp_ref_review/extraction_candidates/worldmonitor/extraction_manifest.txt` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- Vor Agent-/Runtime-/Worker-/Audit-Contract-Aenderungen ist `OGI_AI_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/ogi` sowie den kuratierten Stand in `_tmp_ref_review/extraction_candidates/ogi/extraction_manifest.txt` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- Vor Backend-Resilience-/Map-Orchestrierungs-/Proxy-/Polling-Contract-Aenderungen ist `SHADOWBROKER_AI_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/Shadowbroker` sowie den kuratierten Stand in `_tmp_ref_review/extraction_candidates/shadowbroker/extraction_manifest.txt` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- Vor Ingestion-/Replay-/History-/Map-Worker-/Layer-Contract-Aenderungen ist `SOVEREIGN_WATCH_AI_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/Sovereign_Watch` sowie den kuratierten Stand in `_tmp_ref_review/extraction_candidates/sovereign_watch/extraction_manifest.txt` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- Vor Graph-Visualisierungs-/Arc-/Path-/Entity-Relation-/Timeline-Explorer-Contract-Aenderungen ist `CONFLICT_GLOBE_GL_AI_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/conflict-globe.gl` sowie den kuratierten Stand in `_tmp_ref_review/extraction_candidates/conflict_globe_gl/extraction_manifest.txt` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- Vor Frontend-Map-UX-/Search-/Filter-/Layer-Chrome-/Selection-Contract-Aenderungen ist `External_GEOSENTINEL_FRONTEND_REVIEW.md` gegen den lokalen Referenzstand in `_tmp_ref_review/geo/GeoSentinel` zu revalidieren; das ist ein Monitoring-Gate, kein Codeimport-Gate.
- OGI-Graph-Themen werden in diesem GeoMap-Schritt nicht direkt umgesetzt und laufen getrennt ueber die dedizierten Slices `graph_execution_delta.md` und `backend_geomap_delta.md`.

---

## 0. Doc-Abarbeitung (GeoMap-MDs)

Gesamtcheckliste fuer effektives Abarbeiten aller GeoMap-Dokumente.

### 0.0 GEOMAP_OVERVIEW

- [ ] **GO.1** — Read-Order, Owner-Matrix und Archivhinweis gelesen; keine Geo-Arbeit ausserhalb der Owner-Dokumente begruendet
- [ ] **GO.2** — `evaluate-compressed`-Uebernahme verstanden: Daten-/Provider-Minima in Sources/Verify verankert

### 0.1 GEOMAP_FOUNDATION

- [ ] **FD.1** — Policy-Check: world-atlas als primäre Quelle, keine verbotenen Tiles (Leaflet/MapLibre/Google), Geocoding-Tiers 1–3 verstanden
- [ ] **FD.2** — Geocoding Phase 12: `provider.ts`, `nominatim.ts`, `cache.ts`, `chain.ts`, `index.ts` (Implementierungs-Plan Sek. 2)
- [ ] **FD.3** — PMTiles-Contract: Gate B verstanden, Static vs. Live Layers, keine PMTiles vor Trigger
- [ ] **FD.4** — Rendering Foundation (Sek. 4): Gates A/B/C, d3-geo Core, deck.gl/MapLibre nur gate-gesteuert
- [ ] **FD.5** — Basemap-Library-Referenz fuer GeoMap dokumentiert: PMTiles (Protomaps), OpenMapTiles, Planetiler (alt: tilemaker), MapLibre nur optional fuer Flat/Regional-Mode
- [ ] **FD.6** — Renderer-Leitplanke normativ gespiegelt: `d3-geo` bleibt Globe-Core; `deck.gl/MapLibre` sind Second-Mode fuer Flat/Conflict; kein Globe-Rewrite fuer v2
- [ ] **FD.7** — Body-Leitplanke normativ gespiegelt: `Earth` bleibt primaerer Arbeitskoerper; `Moon` ist v2-spezifischer Body-Mode; simultaner `Earth + Moon`-Co-View ist kein v2-Pflichtziel
- [x] **FD.8** — View-Handoff-Regel normativ gespiegelt: Globe → Flat bevorzugt ueber Region-/Event-/Cluster-/Story-/Draw-Area-Handoff statt nur ueber statischen Toggle
- [x] **FD.9** — Basemap-Richness-Regel normativ gespiegelt: Globe bleibt reduziert-strategisch; detailreiche Tiles/PMTiles/Basemap-Features primaer fuer spaeteren Flat/Regional-Mode

### 0.2 GEOMAP_DATA_CONTRACTS_AND_FEEDBACK

- [ ] **DC.1** — Feedback-Driven Review (Sek. 3) normativ gespiegelt: `signal/noise/uncertain`, Override-Reasons, Multi-Analyst-Flow
- [ ] **DC.2** — Canonical Contracts fuer `GeoEvent`, `GeoCandidate`, `GeoTimelineEntry` gegen Runtime-Istzustand geprueft
- [ ] **DC.3** — Review-/Feedback-API-Restpunkte (`/review`, `/feedback/metrics`, `/feedback/disagreements`) gegen Contract owner-geprueft
- [ ] **DC.4** — Evaluation-Harness-/Explain-Why-/Contradiction-Backlog aus Data-Contracts in SOTA-/Test-IDs gespiegelt
- [ ] **DC.5** — Timeline-Contract deckt Replay-/Story-Anforderungen fuer v2 ausreichend oder ist explizit als Delta markiert

### 0.2b GEOMAP_ONTOLOGY_GRAPH_RUNTIME (eigener Nicht-UI-Block)

- [ ] **OG.1** — Ontologie-Kernobjekte (`GeoEntity`, `GeoEvent`, `GeoTrack`, `GeoRelation`, `GeoEvidence`) sind als GeoMap-Owner-Contract festgezogen
- [ ] **OG.2** — Search-Around-/Graph-Traversal-Result-Contract (nodes/edges/time_window/metrics) ist gegen API-/Store-Pfade gespiegelt
- [ ] **OG.3** — geotemporaler Track-/Interpolationsvertrag (`LINEAR|NEAREST|PREVIOUS|NEXT|NONE`) ist in Timeline-/Replay-Logik explizit verankert
- [ ] **OG.4** — Writeback-/Action-Contract (`validated intent -> domain mutation -> audit append`) ist als Pflichtpfad gegen Draw-/Edit-/Link-Aktionen gespiegelt
- [ ] **OG.5** — Geo-Ontologie wurde gegen `MEMORY_ARCHITECTURE.md` geprueft (nicht isoliert, sondern als spezialisierter Geo-Owner auf gemeinsamer KG-Basis)

### 0.3 GEOMAP_SOURCES_AND_PROVIDER_POLICY

- [ ] **SP.1** — Source-Tiers A/B/C, Hard-Signal-first und Soft-Signal-Candidate-Policy gelesen und gegen aktuellen Ingest gespiegelt
- [ ] **SP.2** — Basemap-Minimum (`place`/`water`/`waterway`) und Flat/Regional-Stack-Regel aus Provider-Policy in Verify/Foundation gespiegelt
- [ ] **SP.3** — Source-Bias-/Cross-Bias-Regeln gegen Candidate-Scoring/Review-Backlog gespiegelt
- [ ] **SP.4** — Source Appendix fuer v0-v2 relevante Provider und Geo-Sources auf Vollstaendigkeit geprueft
- [ ] **SP.5** — Metadata-first-/Legal-/Reliability-Regeln gegen aktuelle GeoMap-Routen und Stores gespiegelt

### 0.4 GEOMAP_VERIFY_GATES

- [ ] **V.1** — E2E-Abnahme durchgeführt (Checkliste Sek. 3: seed, Earth/Moon, Layer-Toggles, Draw, Save-Fehlerpfad)
- [ ] **V.2** — Draw-Workflow manuell verifiziert (Marker, Line, Polygon, Text, Undo, Redo, Delete)
- [ ] **V.3** — Save-Fehlerpfad getestet (API aus → Fehlermeldung, kein Datenverlust)
- [ ] **V.4** — Performance-Baseline Szenario A/B/C (`GEOMAP_VERIFY_GATES.md` Sek. 4): Messprotokoll durchgefuehrt, FPS notiert
- [ ] **V.5** — Basemap-Sichtbarkeits-Gate bestanden (`place`/`water`/`waterway`) inkl. 3-Regionen-Check
- [ ] **V.6** — Replay-/Timeline-Gate bestanden: Zeitfenster-Auswahl, Scrub/Brush, Zoom-Presets, Timeline-Reset
- [ ] **V.7** — Story-/Kamera-Gate bestanden: Story fokussiert Karte, Zeitfenster und Detailansicht konsistent
- [ ] **V.8** — Overlay-Chrome-Gate bestanden: `timeline`/`filters`/`legend` separat von Daten-Layern schaltbar
- [ ] **V.9** — Keyboard-Shortcut-Gate bestanden: `M/L/P/T`, `Delete`, Undo/Redo, `C/R/H/S` im Browser reproduzierbar und ohne Fokus-/Textinput-Konflikte
- [ ] **V.10** — Accessibility-Gate bestanden: keyboard-only Bedienung, Fokus-Reihenfolge, aria-Labels, non-color-only Severity-Encoding und Panel-Navigation manuell verifiziert
- [ ] **V.11** — Source-Health-/Provider-Outage-Gate bestanden: API-/Provider-Ausfall zeigt degradierten Zustand, Fehlermeldung und Health-Indikator ohne stillen Datenverlust
- [ ] **V.12** — Responsive-/Mobile-Gate bestanden: Sidebars, Floating Panels, Timeline-Workspace und Modals bleiben auf Mobile/Tablet bedienbar und kollisionsfrei
- [ ] **V.13** — Export-Gate bestanden: JSON/CSV und PNG/PDF liefern reproduzierbare, fachlich korrekte Artefakte fuer denselben sichtbaren Arbeitszustand
- [ ] **V.14** — Flat-Handoff-Gate bestanden: Event-Inspector-, Timeline-/Story- und Header-Fallback-Einstiege uebernehmen Bounds, Filter, Zeitfenster und Focus konsistent in den Flat-Workspace-State; Rueckweg in den Globe behaelt den strategischen Arbeitszustand stabil
- [ ] **V.15** — Flat-Renderer-Gate bestanden: sichtbarer Flat-Viewport zeigt Bounds, gefilterte Event-Punkte, Layer-Visibility und Selection konsistent; Rueckweg und erneuter Handoff bleiben stabil
- [ ] **V.16** — Flat-Conflict-Gate bestanden: konfliktnahe Layer (`strikes`/`targets`/`assets`/`zones`/`heat`) rendern reproduzierbar im Flat-Mode, inklusive Timeline-/Story-Kopplung und Layer-Toggles
- [ ] **V.17** — 3D-Tiles-Eval-Gate bestanden: Flat-Prototyp mit `deck.gl` + `@loaders.gl/3d-tiles` laeuft reproduzierbar (Load/Render/Pick), inkl. dokumentierter Degradation bei ausbleibenden Tiles/Services
- [ ] **V.18** — Cesium-Eval-Gate bestanden: trigger-basierte Bewertung fuer Scene-/Terrain-/3D-Tiles-/time-dynamic-Bedarf abgeschlossen; Entscheidung (`defer`/`adopt`) mit Evidence dokumentiert und ohne v2-Core-Rewrite fortgeschrieben
- [ ] **V.19** — Macro+Markets-Panel-Gate bestanden: Snapshot aus Macro-/Market-Routen rendert stabil inkl. `loading/error/degraded`, Timestamp und `LIVE/DELAYED`-Badge
- [ ] **V.20** — Sweep-Delta-Panel-Gate bestanden: `new/escalated/de-escalated` inkl. Richtung/Schweregrad reproduzierbar; Empty-State ist klar
- [ ] **V.21** — Panel-Degradation-Gate bestanden: Ausfall einzelner Macro-/Market-Quellen degradiert nur lokale Panels, nicht Sidebar/Shell
- [ ] **V.22** — Panel-Interaction-Gate bestanden: Panel-Aktionen koennen Region-/Filter-/Event-Fokus setzen, ohne Timeline/Inspector zu brechen
- [ ] **V.23** — Flat-Non-Conflict-Layer-Gate bestanden: `geo-core`, `macro-state`, `context` und `panel-first` verhalten sich im Flat-Workspace mit sichtbaren Layer-Toggles, korrekter Placement-/Visibility-/Selection-Logik und ohne Regression fuer Handoff/Timeline/Inspector
- [ ] **V.24** — Multi-Select-/Bulk-Gate bestanden: Shift-Box-Selection, Cluster-Multi-Selection, Bulk-Leiste, `Keep primary`, `Open in flat view` und `Clear` funktionieren im Browser reproduzierbar und brechen Single-Selection, Drawing oder Timeline nicht
- [ ] **V.25** — Geo-Shell-/Panel-Gate bestanden: rechter Inspector-/Panel-Bereich, Panel-Resize/-Persistenz, Header-/Workspace-Chrome und Sidebar-Zustandswechsel bleiben im Browser konsistent, ohne dass Timeline/Selection/Filter auseinanderlaufen
- [ ] **V.26** — Flat-Marker-Live-Gate bestanden: zoom-adaptive Marker-Semantik, Cluster/Picking, Selection-Halo, Label-/Declutter-Verhalten und Marker-/Detail-Kopplung sind im Flat-Mode browserbasiert verifiziert
- [ ] **V.27** — Source-/Status-Live-Gate bestanden: Panels und Layer zeigen `live/cached/degraded/unavailable` fuer relevante Geo-Snapshots und Source-Health konsistent; Teilfehler fuehren nicht zu stillen Leerdarstellungen
- [ ] **V.28** — Shell-Regression-Gate bestanden: neue Panel-/Shell-Refactors brechen `MapLeftSidebar`, `MapRightSidebar`, `MapFiltersToolbar`, `MapViewportPanel`, `FlatViewScaffold` und Timeline-/Inspector-Wechsel nicht in echten Browserablaeufen
- [ ] **V.29** — Experiment-vs-GeoMap-Gate bestanden: `/geomap/experiment` ist gegen die produktive GeoMap-Shell verglichen, bevorzugte Panel-/Dock-/Support-Module sind explizit ausgewaehlt, und nur diese Unterschiede werden als Promotionspfad in die Haupt-GeoMap uebernommen
- [ ] **V.30** — Experiment-Shell-Browser-Gate bestanden: die Varianten unter `/geomap/experiment` funktionieren browserseitig stabil, inklusive Resizable-Workspace, Variant-Switch, Coverage-Board und Backend-Option-Board ohne Layout-Bruch
- [ ] **V.31** — Cesium-/Flat-Experiment-Gate bestanden: optionale Scene-/Cesium- und Clone-abgeleitete Flat-Workspace-Varianten sind im Experiment gegeneinander bewertet; Ergebnis (`defer`/`sidecar`/`promote`) ist dokumentiert und gegen bestehende Globe-/Flat-Vertraege abgegrenzt

### 0.5 GEOMAP_PRODUCT_AND_POLICY + ROADMAP

- [ ] **M.1** — UX offen (Sek. 5): Keyboard Shortcuts 9.3, Accessibility 9.4, Multi-Select 9.2
- [ ] **M.2** — Milestone C (sources): soft-signal adapter scaffolds, perf + a11y pass
- [ ] **M.3** — Milestone D: anti-noise alerting UI, perf + a11y pass
- [ ] **M.4** — Milestone E: geospatial stack upgrade, advanced filters/search
- [ ] **M.5** — Milestone F: Shell-Refactoring, Keyboard Shortcuts, Export, Timeline Playback, Multi-Select, Asset-Link-UI, Seed-Datensatz, ReliefWeb, Reddit
- [ ] **M.6** — Proposed defaults (Sek. 29): sort, asset edits owner-only, export, timeline
- [ ] **M.7** — Feedback-Driven Review (Sek. 3): System-Klassifikation, Analysten-Entscheidungen, Collaborative Review — OFFEN
- [ ] **M.8** — SOTA-Backlog (Sek. 35): Policy-as-Code, Evaluation Harness, Explain-Why, OffscreenCanvas/supercluster Worker
- [ ] **M.9** — Externe Referenzreview-Dokumente gepflegt (aktuell: `PHAROS_AI_REVIEW.md`, `CRUCIX_AI_REVIEW.md`, `WORLDWIDEVIEW_AI_REVIEW.md`, `SHADOWBROKER_AI_REVIEW.md`, `SOVEREIGN_WATCH_AI_REVIEW.md`, `CONFLICT_GLOBE_GL_AI_REVIEW.md`, `External_GEOSENTINEL_FRONTEND_REVIEW.md`) und gegen GeoMap-Execution/Owner-MDs gespiegelt
- [~] **M.10** — Externes Referenz-Monitoring (konsolidiert): `PHAROS_AI_REVIEW.md`, `CRUCIX_AI_REVIEW.md`, `WORLDWIDEVIEW_AI_REVIEW.md`, `SHADOWBROKER_AI_REVIEW.md`, `SOVEREIGN_WATCH_AI_REVIEW.md`, `CONFLICT_GLOBE_GL_AI_REVIEW.md` und `External_GEOSENTINEL_FRONTEND_REVIEW.md` sind gegen die lokalen Referenzstaende gespiegelt; Statusformat bleibt einheitlich als `window`, `delta`, `impact_on_geomap`, `next_check`.
- [ ] **M.11** — Externes Referenzreview-Dokument `CRUCIX_AI_REVIEW.md` gepflegt und gegen GeoMap-Execution/Owner-MDs gespiegelt
- [ ] **M.12** — Panel-Informationsarchitektur normativ festgezogen (`Macro+Markets`, `Sweep Delta`, `Cross-Source Summary`) inklusive Owner-Entscheid und Verify-Hinweis
- [ ] **M.13** — Externes Referenzreview-Dokument `WORLDWIDEVIEW_AI_REVIEW.md` gepflegt und gegen GeoMap-Execution/Owner-MDs gespiegelt
- [ ] **M.14** — `worldwideview` Clone-zu-Extraction-Konsistenz geprueft (Manifest-Count/Stages und A/B/C-Priorisierung aktuell)
- [ ] **M.15** — Externes Referenzreview-Dokument `OGI_AI_REVIEW.md` gepflegt und gegen GeoMap-Execution/Owner-MDs gespiegelt (dieser Schritt non-graph scope)
- [ ] **M.16** — Externes Referenz-Monitoring `ogi` konsolidiert: `window`, `delta`, `impact_on_geomap`, `next_check` dokumentiert (Agent/Runtime/Infra)
- [ ] **M.17** — `ogi` Clone-zu-Extraction-Konsistenz geprueft (`extraction_manifest.txt` + `OGI_EXTRACTION_RECOMMENDATIONS.md`), Graph-Themen explizit getrennt in `graph_execution_delta.md` / `backend_geomap_delta.md`
- [ ] **M.18** — Externes Referenzreview-Dokument `SHADOWBROKER_AI_REVIEW.md` gepflegt und gegen GeoMap-Execution/Owner-MDs gespiegelt
- [ ] **M.19** — `shadowbroker` Clone-zu-Extraction-Konsistenz geprueft (Manifest-Count/Stages und A/B/C-Priorisierung aktuell)
- [ ] **M.20** — Externes Referenzreview-Dokument `SOVEREIGN_WATCH_AI_REVIEW.md` gepflegt und gegen GeoMap-Execution/Owner-MDs gespiegelt
- [ ] **M.21** — `sovereign_watch` Clone-zu-Extraction-Konsistenz geprueft (Manifest-Count/Stages inkl. Gap-Patch und A/B/C-Priorisierung aktuell)
- [ ] **M.22** — Externes Referenzreview-Dokument `CONFLICT_GLOBE_GL_AI_REVIEW.md` gepflegt und gegen GeoMap-Execution/Owner-MDs gespiegelt
- [ ] **M.23** — `conflict_globe_gl` Clone-zu-Extraction-Konsistenz geprueft (Manifest-Count/Stages und A/B/C-Priorisierung aktuell)
- [~] **M.24 (Evaluate)** — `conflict-globe.gl` Graph-Befund gegen GeoMap-Graph-Strategie evaluieren: visuelle Relationship-Overlays (`arcs`/`paths`/`rings`/`hexbin`/`heatmap`) bleiben als spaeterer global-view-/v3-Kandidat markiert; fuer den aktuellen Closeout wird explizit kein Globe-Rewrite und kein graph-heavy Overlay-Track gezogen. Fehlender KG-Backend-Stack (kein Neo4j/RDF/SPARQL) bleibt dokumentiert, die spaetere Entscheidung laeuft weiter ueber `visual-graph-only` vs. `augment-with-kg-backend`; wenn wir den Globe-/v3-Track wieder aufnehmen, werden `conflict_globe_gl` plus die bereits ausgewerteten `worldwideview`-, `GeoSentinel`-, `shadowbroker`- und `sovereign_watch`-Referenzen erneut als kombinierter Input fuer Global-View-, Runtime- und Selection-/Timeline-Orchestrierung einbezogen
- [ ] **M.25** — Externes Referenzreview-Dokument `External_GEOSENTINEL_FRONTEND_REVIEW.md` gepflegt und gegen GeoMap-Execution/Owner-MDs gespiegelt
- [~] **M.26 (Evaluate)** — `GeoSentinel` Frontend-Befund gegen GeoMap-UI-Strategie evaluieren: Search-/Filter-/Layer-Chrome-/Selection-/Tracking-Patterns sind fuer den Flat-/Regional-Workspace jetzt explizit priorisiert; Monolith-HTML-/Inline-Logik bleibt non-adopt. Die naechste Uebernahme bleibt modular und workspace-first statt Globe-Rewrite
- [x] **M.27 (Reference Trace)** — `pharos-ai`: Flat-Conflict-Layer-Taxonomie (`strikes`, `missiles`, `targets`, `assets`, `zones`, `heat`) sowie Story-/Timeline-/Visibility-Kopplung als Referenz fuer den operativen Flat-Workspace festgehalten. Fuer v2/non-live bereits uebernommen: `strikes`, `targets`, `assets`, `zones`, `heat`, Bucket-/Timeline-Diagnostik und layer-gated Overlay-Pfad. Offen bleiben `missiles`/Arc-Pfade, richer Story-Kamera-/Browser-Verify und tieferer Analyst-Edit-Mode
- [x] **M.28 (Reference Trace)** — `worldwideview`: Search-/Selection-/Timeline-/active-list-Orchestrierung sowie Plugin-/DataBus-/Availability-/History-Denken sind als Flat-Workspace-Referenz festgehalten. Fuer v2/non-live bereits uebernommen: search/list/selection coupling, handoff contracts, replay-/bucket-Vertrag. Offen bleiben provider-/history-/availability-Hardening und spaetere panel-/plugin-getriebene Layer
- [x] **M.29 (Reference Trace)** — `GeoSentinel`: operator-nahe Layer-Chrome-, category-filter-, active-list- und Search-Orchestrator-Patterns sind als Flat-Workspace-Referenz festgehalten. Fuer v2/non-live bereits uebernommen: modulare Flat-UX statt toggle-only, Search-/Filter-Chips, sichtbare active-list/selection Sync. Offen bleiben richer category toggles, zoom-adaptive marker semantics und Browser-Verify
- [x] **M.30 (Reference Trace)** — `Shadowbroker` und `Sovereign_Watch`: Runtime-/Freshness-/History-/Replay-/Worker-/Layer-Orchestrierungs-Patterns bleiben als naechster Flat-Hardening-Input markiert, nicht als primaerer UI-Blueprint. Fuer v2/non-live bereits gespiegelt: bucket-/replay-Denken und shared contract layering; offen bleiben fast/slow freshness, historian/history availability, worker-/high-volume layer hardening und source-health UX
- [x] **M.31 (Reference Trace)** — `conflict_globe_gl`: Arc-/Path-/Ring-/Hexbin-/Heatmap- und relationale Globe-/Flat-Overlays bleiben als spaeterer Layer-Folgeblock markiert. Fuer v2/non-live bereits gespiegelt: `heat` als einfacher Conflict-Payload-Typ. Offen bleiben relationale Visual-Layers, `missiles`/arc paths und spaetere graph-/globe-zentrierte Browser-Abnahme
- [x] **M.32 (Layer Option Matrix)** — Deduplizierte Flat-Layer-Optionsmatrix aufgenommen: `events`, `flights`, `vessels`, `surveillance`, `orbital`, `rf`, `infra`, `strikes`, `missiles`, `targets`, `assets`, `zones`, `heat`, `arcs`, `paths`, `rings`, `hexbin`, `regime`, `sanctions`, `macro-state`, `region-news`, `analyst-notes`, `panel-signals`. Der Code-Katalog lebt in `layer-taxonomy.ts`; doppelte Referenznennungen aus mehreren Projekten werden dort bewusst auf eine kanonische Option zusammengefuehrt statt mehrfach als pseudo-neue Layer zu erscheinen
- [ ] **M.33 (Reference Trace)** — `worldmonitor`: Dual-Engine-Map (`d3`/SVG-Fallback plus `deck.gl`/`MapLibre`), Panel-Primitive, App-/Shell-Orchestrierung und Source-/Status-Disziplin gegen lokalen Clone + Extraction-Manifest geprueft und in GeoMap-Execution gespiegelt
- [ ] **M.34 (Reference Trace)** — `worldmonitor` Clone-zu-Extraction-Konsistenz geprueft (`_tmp_ref_review/geo/worldmonitor` gegen `_tmp_ref_review/extraction_candidates/worldmonitor/extraction_manifest.txt`), inkl. kuratiertem Fokus auf `Map.ts`, `DeckGLMap.ts`, `MapContainer.ts`, `Panel.ts`, `App.ts`, `panel-layout.ts`, `data-loader.ts`, `feeds.ts`, `panels.ts`

### 0.6 GEOMAP_MODULE_CATALOG

- [ ] **O.1** — d3-Module v1.1: d3-scale, d3-scale-chromatic, d3-interpolate, d3-transition, d3-timer, d3-ease (falls noch nicht installiert)
- [ ] **O.2** — Severity Heatmap: hardcoded → scaleSequential + interpolateYlOrRd (`GEOMAP_MODULE_CATALOG.md` Sek. 2.1)
- [ ] **O.3** — Animation: setInterval → d3.timer (Frame-synchron, `GEOMAP_MODULE_CATALOG.md`)
- [ ] **O.4** — d3-Module v1.5 (Game Theory + Timeline): d3-hierarchy, d3-shape, d3-brush, d3-axis, d3-legend, d3-annotation
- [ ] **O.5** — Feature→Module-Matrix (Sek. 10): Regime-State Layer, CBDC Status, Financial Openness, etc. prüfen
- [x] **O.6** — Flat/Regional-Analystenmodus im Modul-Katalog normativ gespiegelt (deck.gl / MapLibre / PMTiles als Second-Mode, nicht Globe-Replacement)
- [ ] **O.7** — Externe Referenz-Reviews in Modulentscheidungen gespiegelt (aktuell: `PHAROS_AI_REVIEW.md`, `CRUCIX_AI_REVIEW.md`, `WORLDWIDEVIEW_AI_REVIEW.md`, `SHADOWBROKER_AI_REVIEW.md`, `SOVEREIGN_WATCH_AI_REVIEW.md`, `CONFLICT_GLOBE_GL_AI_REVIEW.md`, `External_GEOSENTINEL_FRONTEND_REVIEW.md`)
- [ ] **O.8** — Replay-/Timeline-Module normativ gespiegelt: `d3-brush`, `d3-axis`, `d3-array`, `d3-shape` fuer Conflict-Replay und Story-Zeitfenster
- [x] **O.9** — View-Handoff-Matrix im Modul-Katalog gespiegelt: Region-/Story-/Draw-Area-Handoffs mit shared Payload statt Toggle-only
- [x] **O.10** — Layer-Taxonomie im Modul-Katalog gespiegelt: Geo Core / Conflict / Macro-State / Context / panel-first Signale fuer Globe vs. Flat
- [ ] **O.11** — Crucix-abgeleitete panel-first Module im Modul-Katalog gespiegelt (`macro_markets`, `sweep_delta`, `cross_source_signal_summary`) inkl. Placement-/Verify-Notizen
- [~] **O.12** — `worldwideview`-abgeleitete Module/Patterns im Modul-Katalog gespiegelt (Plugin-Contracts, Adapter-Resilience, Search/Selection/Timeline/Panel-Orchestrierung) inkl. Placement-/Verify-Notizen; fuer den aktuellen Flat-Workspace sind Search-/Selection-/Timeline-/active-list-Kopplung als direkte v2-Naehe priorisiert, waehrend groessere Plugin-/Adapter-Themen weiter als Folgearbeit bleiben
- [ ] **O.13** — `worldmonitor`-abgeleitete Modul-/Shell-Patterns im Modul-Katalog gespiegelt: Dual-Engine-Boundary, Panel-Primitive, Flat-Marker-/Icon-Layer, Status-/Badge-Chrome und Workspace-/Panel-Grid-Entscheidungen inkl. Placement-/Verify-Notizen

---

## 1. Phase-4-Closeout (Gate A)

Pflicht vor neuer Geo-Engine-Arbeit (Sek. 35.4b):

- [ ] **4.G1** — finaler Browser-/E2E-Abnahmelauf fuer Earth/Moon, Layer-Toggles, Draw-Workflow, Cluster-Drilldown
- [ ] **4.G2** — reproduzierbare Performance-Baseline (`GEOMAP_VERIFY_GATES.md` Sek. 4: Szenario A/B/C, Messprotokoll, FPS-Targets)
- [ ] **4.G3** — offene Punkte aus Verify-Gate abgeschlossen oder bewusst deferred mit Owner/Datum
- [ ] **4.G4** — GEOMAP_FOUNDATION (Basemap, Geocoding, PMTiles, Rendering) gelesen/acknowledged

---

## 2. Milestone D (Quality)

- [ ] **D.1** — perf + a11y pass: aria-Labels, Performance-Optimierung, Keyboard-Shortcut-Set (Sek. 9.4)
- [~] **D.2** — anti-noise alerting: UI fuer Alert-Konfiguration, Cooldown-UI, User-Mute-Profile (Sek. 20)

---

## 3. Milestone E (v2)

- [~] **E.1** — geospatial stack upgrade (deck.gl/maplibre/pmtiles Pakete installiert; Globe-Core bleibt aktiv, erster sichtbarer Flat-Viewport mit MapLibre plus separater deck.gl-Overlay-Boundary existiert. PMTiles-/reichhaltige Basemap-/Browser-Verify bleiben offen)
- [~] **E.2** — advanced filters/search: dediziertes Filter-UI-Panel, facettierte Suche
- [~] **E.3** — Flat/Regional Analyst View als eigener Render-Modus begonnen: `flat-view-state.ts` definiert einen expliziten `viewMode="flat"`-Scaffold mit Bounds, Focus, Filter-Snapshot, Temporal-State, Layer-Familien und Basemap-Policy. Der gemeinsame Geo-Workspace-Store traegt `mapViewMode = globe|flat`, `flatViewState` und einen `applyPendingFlatViewHandoff()`-Pfad. Der sichtbare Flat-Workspace zeigt inzwischen MapLibre-Viewport, Bounds-Fit, aktive Layer-Familien, lokale Search, sichtbare Event-Liste, selektiertes Event-Detail, expliziten Handoff-Kontext, inherited filter chips, einen ersten Conflict-Timeline-Snapshot fuer Bucket-/Focus-Lage und Rueckweg zum Globe; Selektion kann sowohl aus der Liste als auch direkt ueber pickbare Flat-Event-Punkte kommen. Der Current-Context-Einstieg resolve't Story-, Event-, Draw-Area- und Region-Handoffs jetzt ueber eine gemeinsame, testbare Resolver-Entscheidung statt ueber implizite Hook-Verzweigungen. Das zieht vor allem `worldwideview`-/GeoSentinel-nahe Search-/Selection-/active-list-Kopplung in den Flat-Mode; richer tiles, echte Conflict-Layer und Browser-Verify bleiben offen.
- [~] **E.4** — deck.gl + MapLibre als optionaler Zweitmodus begonnen: der Flat-Scaffold traegt `renderer="deckgl-maplibre"` als explizite Boundary; zusammen mit `flat-view-handoff.ts`, `layer-taxonomy.ts`, `basemap-richness.ts` und dem Store-Apply-Pfad ist die Daten-/Layer-/Basemap-Grenze fuer den Second-Mode typisiert. Ein sichtbarer MapLibre-Viewport sowie eine separate deck.gl-Overlay-Boundary fuer Bounds-Hervorhebung, gefilterte Event-Punkte, Picking und Selection-Sync sind vorhanden. Reale Conflict-Layer, PMTiles-Hintergrund und Browser-Verify bleiben offen; globale Relationship-/Arc-/Path-Overlays aus `conflict_globe_gl` bleiben vorerst ein spaeterer Track statt Scope fuer diesen Closeout-Schritt.
- [~] **E.5** — PMTiles-Einsatz fuer Flat/Regional-Mode begonnen: `pmtiles` ist im Frontend installiert und in `basemap-richness.ts` als bevorzugter Tile-Pfad fuer den spaeteren Earth-Flat-Mode gespiegelt. Reale Attribution-/Hosting-/Browser-Verify gegen `PMTILES_CONTRACT.md` bleibt offen.
- [x] **E.6** — zentrale MapFilterEngine fuer v2-Core geschlossen: der shared `geo-filter-contract` kapselt Filter-Snapshot, aktive Filter-Chips, sichtbare Event-Selektion und davon abgeleitete Timeline-Visibility fuer den aktuellen Globe-/Workspace-Pfad. Game-Theory, region-getaggte Context-Items, offene Candidates und Region-News folgen jetzt demselben sichtbaren Such-/Regions-/Severity-Arbeitszustand. Eine noch breitere view-agnostische Engine ueber spaetere Conflict-/Flat-/Macro-Spezialobjekte ist Folgearbeit nach v2 und kein Blocker mehr fuer den v2-Abschluss.
- [ ] **E.7** — Overlay-Chrome-Contract gescoped (`timeline`, `filters`, `legend`, Panels getrennt von Daten-Layer-Toggles)
- [ ] **E.8** — Advanced Drawing UX fuer Globe gescoped: Vertex-/Handle-Editing, Snapping, Hover/Selection-States, Box/Lasso/Multi-Select, sichtbarer Command-Stack
- [ ] **E.9** — Drawing-/Selection-Boundary fuer spaeteren Flat/Regional-Mode definiert (welche Edit-Patterns nur dort gelten, welche shared bleiben)
- [x] **E.10** — Temporal Contract fuer v2-Core geschlossen: `timelineViewRangeMs` trennt das sichtbare Timeline-Fenster sauber vom aktiven Replay-/Filterfenster (`activeReplayRangeMs`), `timelineSelectedTimeMs` fuehrt den optionalen Cursor-/Selected-Time-Begriff im Workspace-State, Domain-Wechsel clampen sichtbares Zeitfenster sowie Selected-Time wieder auf gueltige Werte, und das Timeline-UI macht die Beziehung zwischen sichtbarem Fenster und aktivem Filterfenster explizit (`neutral/view_only/filter_only/linked/independent`). Playback treibt Selected-Time nur noch im aktiven Playback-Pfad. Weitergehende Story-/Conflict-Spezialfaelle bauen auf diesem Vertrag auf, blockieren den v2-Abschluss aber nicht mehr.
- [x] **E.11** — Multi-Renderer-Contract fuer v2/v2.5 geschlossen (non-live Scope): `flat-view-renderer-contract.ts` fasst fuer den aktuellen Flat-Pfad renderer-, bounds-, basemap-, focus-, overlay-chrome-, event-point-, timeline-Bucket- und stabile Layer-Definitions-Daten in einem gemeinsamen typed Contract zusammen. Viewport (`FlatViewViewport`) und Overlay (`FlatViewOverlay`) lesen diesen Vertrag jetzt statt eigene Teilmodelle aus dem Store abzuleiten, und der Contract wird aus dem echten Shell-Chrome (`showFiltersToolbar`, `showBodyLayerLegend`, `showTimelinePanel`) gespeist statt aus lokalen Heuristiken. Browser-/Renderer-Abnahme laeuft separat ueber `V.15`.
- [x] **E.12** — View-Handoff-Contract fuer Flat/Regional geschlossen (non-live Scope): ein renderer-neutraler `flat-view-handoff`-Vertrag definiert Bounds, aktives Zeitfenster, Filter-Snapshot, Focus-Objekt und Layer-Hints fuer Event-, Story-, Region-, Cluster-, Draw-Area- und explizite Bounds-Handoffs. Der gemeinsame Store kann diese Handoffs in einen expliziten `flatViewState` uebernehmen; Event Inspector, Timeline-/Story-Detail, Region-News, ausgewaehlte Drawings, Cluster-Drilldowns und ein Header-Fallback koennen den Flat-Workspace bereits ansteuern. Der Header-Fallback faellt dabei nicht mehr leer aus, wenn nur Region- oder Drawing-Kontext aktiv ist. Browser-/Interaction-Abnahme laeuft separat ueber `V.14`.
- [x] **E.13** — Layer-Taxonomie fuer Globe vs. Flat definiert: `layer-taxonomy.ts` fuehrt jetzt einen typisierten Katalog fuer `geo-core`, `conflict`, `macro-state`, `context` und `panel-first` ein, inklusive Placement (`shared`, `globe-first`, `flat-first`, `panel-first`), View-Support und default-/handoff-orientierter Layer-Hints. `flat-view-handoff.ts` nutzt diese Hints bereits als gemeinsamen Flat-Vorbau.
- [x] **E.14** — Basemap-Richness-Policy fuer Globe vs. Flat definiert: `basemap-richness.ts` kapselt den normativen Unterschied zwischen reduziertem Earth-Globe (`countries/graticule/place/water/waterway`, keine PMTiles/MapLibre) und spaeter reichhaltigerem Earth-Flat-Mode (`terrain/roads/admin-detail/poi` optional, PMTiles/MapLibre erlaubt). Moon bleibt fuer v2 in beiden Richtungen explizit deferred.
- [x] **E.15** — sichtbare Flat-Renderer-Boundary geschlossen (non-live Scope): erster MapLibre-Viewport plus separate deck.gl-Overlay-Boundary fuer Bounds und erste Event-Punkte sind vorhanden; beide laufen ueber denselben `flat-view-renderer-contract` statt ueber lose lokale Ableitungen. Weitere Conflict-Layer folgen ab `T.15`, Browser-/Renderer-Abnahme laeuft separat ueber `V.15`.
- [ ] **E.16** — reale PMTiles-/Basemap-Integration fuer Flat definieren und anbinden: Style, Attribution, Hosting, Basemap-Minimum und Browser-Verify gegen `PMTILES_CONTRACT.md`
- [ ] **E.17** — `deck.gl + @loaders.gl/3d-tiles` Evaluations-Track definiert: Scope, NFRs (FPS/Frame-Time/Memory/Tile-Pop-in/Picking), Datenquellen und Exit-Kriterien dokumentiert; kein impliziter Produkt-Commit
- [ ] **E.18** — Flat-3D-Tiles-Payload-Boundary spezifiziert: gemeinsamer Domain-/Layer-Contract wird renderer-tauglich fuer `Tile3DLayer` abgebildet (inkl. Degradation und Selection/Story-/Filter-Kopplung)
- [ ] **E.19** — CesiumJS-Evaluations-Track fuer Scene-/Multi-Body-/Terrain-Anforderungen definiert (trigger-basiert, kein v2-Core-Replacement): Decision-Matrix, Integrationskosten, Runtime-/Ops-/Policy-Risiken
- [ ] **E.20** — Renderer-Entscheidungsregel formalisiert: Geo-Mode bleibt `d3-geo` (strategischer Globe), Flat-Mode bleibt `deck.gl/MapLibre` (operativ); `CesiumJS` nur bei erfuellten Scene-Triggern
- [ ] **E.21** — `worldmonitor`-abgeleitete Flat-Marker-/Icon-Strategie als eigener Contract gescoped: `IconLayer`/`ScatterplotLayer`/`TextLayer`-Rollen, Cluster-/Declutter-/Selection-Regeln und Degradation fuer fallback/mobile explizit dokumentiert
- [ ] **E.22** — Source-Overlap-Matrix gegen `worldmonitor` geprueft: ueberschneidende Geo-Sources (`ACLED`, `UCDP`, `UNHCR`, `WorldPop`, `OpenSky`, `FRED`, `Finnhub`, `NASA FIRMS`) und fehlende/anders exponierte Quellen in `docs/references` bzw. Geo-Owner-Dokumenten gespiegelt

---

## 4. Milestone F

- [x] **F.0** — Shell-Refactoring fuer v2-Core geschlossen: Zustand-Store + Hook-Split tragen den Globe-/Workspace-Pfad, und sichtbare Replay-/Filter-Datasets inklusive Selection-/Preset-Cleanup laufen ueber einen eigenen `useVisibleGeoWorkspaceData`-Hook statt ueber weitere Inline-Shell-Logik in `GeopoliticalMapShell`. Weitere Entkopplung fuer Flat/Conflict oder Collaboration kann spaeter folgen, ist aber kein v2-Blocker mehr.
- [~] **F.1** — Keyboard Shortcuts: `Esc` fuer Cursor-Modus sowie `M/L/P/T`, `Delete`, `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y`, `C/R/H/S` vorhanden; sichtbare Discoverability im Draw-/Marker-UI und ein eigener Shortcut-Decision-Helper mit Unit-Tests fuer Editierfeld-/Delete-/Undo-Kontext vorhanden. Kompletter Browser-Verify-/A11y-Pass bleibt offen.
- [x] **F.2** — Export-Funktion: JSON/CSV serverseitig, PNG/PDF als Browser-Snapshot vorhanden; Briefing-/storage-backed Export bleibt Folgearbeit
- [x] **F.3** — Timeline Playback fuer v2-Core geschlossen: Brush/Playback/Decay-Preview in `TimelineStrip` vorhanden; Zeit-Presets `24H/7D/1M/ALL` steuern das sichtbare Timeline-Fenster statt still das aktive Replay-Fenster, `Reset` fuehrt Playback/Brush/Cursor in einen neutralen Timeline-Zustand zurueck, `selected time` bleibt ausserhalb aktiven Playbacks eigenstaendig, und das Timeline-UI macht die Trennung von sichtbarem Fenster vs. aktivem Filterfenster explizit. `Apply story window` setzt Selection, sichtbares Zeitfenster und aktives Filterfenster gemeinsam auf den fokussierten Timeline-Eintrag. Browser-/Live-Verify bleibt separat offen.
- [ ] **F.4** — Multi-Select + Bulk-Updates
- [ ] **F.5** — Asset-Link-UI: assetClass/relation Dropdowns, Weight-Slider
- [ ] **F.6** — Seed-Datensatz / Demo-Szenario (JSON-Files befuellen)
- [ ] **F.7** — ReliefWeb-Integration (Code, nicht nur ENV)
- [ ] **F.8** — Reddit-Integration (v2 geplant)
- [x] **F.9** — Shared Layer Contract fuer Globe + Flat geschlossen (non-live Scope): fuer den Flat-Pfad traegt der Renderer-Contract jetzt Layer-Familien, stabile Layer-Definitionen (`id`, `label`, `placement`, `supportedViews`), Focus und overlay-chrome explizit gemeinsam durch Viewport/Overlay/Scaffold; die Overlay-Chrome-Flags kommen aus dem gemeinsamen Shell-Zustand statt aus komponentenlokalen Annahmen. Die Browser-/Cross-view-Abnahme laeuft separat ueber `V.15` und spaetere Regressionstests.
- [x] **F.10** — Shared Map Payload Contract fuer Globe + Flat geschlossen (non-live Scope): Bounds-GeoJSON, Event-Point-Payload und Flat-Timeline-Modell werden im aktuellen Flat-Pfad ueber einen gemeinsamen renderer-driven Contract bereitgestellt statt ad hoc pro Komponente. Der Vertrag traegt renderer-nahe Daten fuer Viewport, Overlay und Flat-Chrome zusammen; Browser-/Cross-view-Abnahme laeuft separat ueber `V.15` und `T.22`.
- [x] **F.19** — Flat-Handoff-UX geschlossen (non-live Scope): Event-Inspector, Timeline-/Story-Detail, Region-News, Cluster-Drilldowns und ausgewaehlte Drawings besitzen kontextuelle `Open in flat view`-Einstiege; ein Header-Button bleibt nur als Experten-/Fallback-Pfad. Der Current-Context-Pfad unterscheidet non-live explizit zwischen `handoff`, `reuse_existing_flat_state` und `none`, statt den Fallback implizit ueber Hook-Verzweigung laufen zu lassen, und der Rueckweg in den Globe behaelt den zuletzt aufgebauten Flat-Workspace-State non-live stabil fuer spaeteren Wiedereinstieg. Browser-/Interaction-Abnahme laeuft separat ueber `V.14`.
- [ ] **F.20** — Globe-Layer-Curation fuer v2.5 vorbereitet: strategischer Default-Datensatz definiert, damit der Globe nicht mit spaeteren Conflict-Layern ueberladen wird
- [x] **F.21** — Flat-Selection-/Detail-Contract fuer operative Objekte geschlossen (non-live Scope): `selection-detail.ts` traegt jetzt eigene shared Detail-Builder fuer `strike`, `target`, `asset`, `zone` und `heat`, statt Conflict-Objekte still nur als normale Events zu behandeln; `selection-detail.test.ts` deckt diese non-live ab. `FlatViewScaffold.tsx` rendert die daraus gebauten Conflict-Objekt-Details inzwischen sichtbar im Flat-Workspace und respektiert dabei die aktiven Flat-Layer-Optionen. Browser-/Interaction-Abnahme bleibt separat ueber `V.16`.
- [x] **F.22** — Flat-Layer-Chrome ausgebaut (non-live Scope): `layer-taxonomy.ts` fuehrt einen deduplizierten Flat-Layer-Optionskatalog mit kanonischen IDs und `sourceRefs`, `flat-view-renderer-contract.ts` traegt diesen Katalog plus aktive Option-IDs als eigenen Renderer-Contract, `FlatViewScaffold.tsx` rendert gruppierte Flat-Layer-Toggles pro Familienblock, und `FlatViewOverlay.tsx` gate-t Events sowie Conflict-Layer (`strikes`/`targets`/`assets`/`zones`/`heat`) ueber diese Optionen statt nur ueber die grobe Familienflagge. `flat-view-renderer-contract.test.ts` und `layer-taxonomy.test.ts` decken den non-live Contract ab; Browser-/Toggle-Abnahme bleibt separat ueber `V.15/V.16`.
- [x] **F.23** — Flat-Replay-/Timeline-UX auf Histogramm-/Bucket-Modell gehoben (non-live Scope): der Flat-Pfad besitzt jetzt ein eigenes Bucket-Modell mit Conflict-Gate und zusaetzlicher Konflikt-Diagnostik (`strikeCount`, `targetCount`, `assetCount`, `heatIntensity`) statt nur roher Event-Zaehlung; der Flat-Workspace zeigt diese Werte fuer den selektierten Bucket als Contract-Preview, und der Shared-Contract bleibt ueber Globe-Filter- und Replay-Zustaende reproduzierbar. Browser-/Analyst-UX fuer Brush/Playback/Story laeuft separat ueber `V.16`.
- [x] **F.24** — Flat-Conflict-Layer eingefuehrt (non-live Scope): der Flat-Pfad besitzt gemeinsame Payloads fuer `strikes`, `targets`, `assets`, `zones` und `heat`, haengt diese im Renderer-Contract ein, zeigt sie im Workspace als Contract-Preview und verdrahtet sie im deck.gl-Overlay hinter die `conflict`-Layer-Familie. Reales Browser-Rendering dieser Conflict-Layer sowie `missiles`/Arcs laufen separat ueber `V.16` bzw. den Folgeblock.
- [x] **F.25** — Flat-Layer-Matrix fuer nicht-Conflict-Familien geschlossen (non-live Scope): `flat-view-layer-matrix.ts` definiert jetzt explizite Placement-/Visibility-/Selection-Regeln fuer `geo-core`, `macro-state`, `context` und `panel-first`, statt nur Familiennamen im Contract zu tragen. Der gemeinsame Flat-Renderer-Contract transportiert diese Matrix sichtbar bis in den Workspace, `flat-view-layer-matrix.test.ts` und `flat-view-renderer-contract.test.ts` decken den non-live Vertrag ab. Browser-/Live-Abnahme laeuft separat ueber `V.23`.
- [~] **F.26** — Flat-Macro-State-Layer begonnen: `regime`, `sanctions` und `macro-state` sind jetzt als deduplizierte Flat-Optionen plus `hybrid/toggle-only/hybrid-select`-Matrixeintraege im gemeinsamen Contract verankert. Eigene Payloads, sichtbare Flat-Objekte und Browser-Abnahme fehlen noch; Live-Gate dafuer ist `V.23`.
- [~] **F.27** — Flat-Context-Layer begonnen: `region-news` und `analyst-notes` haben jetzt explizite `hybrid/toggle-only/hybrid-select`-Regeln im gemeinsamen Flat-Contract statt nur implizitem Panel-Nebenlauf. Eigene Placement-/Interaction-Payloads und Browser-Abnahme fehlen noch; Live-Gate dafuer ist `V.23`.
- [~] **F.28** — Flat-Panel-First-Kopplung begonnen: `panel-signals` ist jetzt als kanonische `panel-first`-Option mit `panel/focus-driven/panel-select`-Regel im gemeinsamen Flat-Layer-Contract verankert. Echter Handoff aus Panel-Signalen in den Flat-Workspace bleibt Folgearbeit; Live-Gate dafuer ist `V.23`.
- [x] **F.29** — Flat-Missile-/Relation-Layer entschieden (non-live Scope): `flat-view-relation-layer-policy.ts` verankert `missiles` als expliziten Follow-up-Block und `arcs`/`paths`/`rings`/`hexbin` als `defer-v3`-Entscheidung statt diese still im aktuellen Conflict-Scope mitzuschwingen. `flat-view-relation-layer-policy.test.ts` deckt die Entscheidung non-live ab, und der Flat-Workspace zeigt die Policy jetzt sichtbar als Referenz. Live-/Browser-Abnahme ist hier nicht erforderlich; operative Umsetzung bleibt Folgearbeit.
- [x] **F.11** — Replay-/Timeline-Controller fuer v2-Core geschlossen: `TimelineStrip` publiziert ein effektives Replay-Fenster in den Workspace-Store; Karte, Timeline, Region-News, Context-Feed, Candidate Queue und Game-Theory folgen demselben sichtbaren Arbeitszustand. Timeline-Auswahl kann den verknuepften Event im Workspace selektieren, und sichtbare Timeline-Eintraege sind am aktiven Filtervertrag ausgerichtet. Manueller Browser-Verify bleibt separat offen.
- [x] **F.12** — Story-/Camera-Aktivierung fuer v2-Core geschlossen: Event-Selektion kann den Globe ueber den `viewport-focus`-Contract auf den relevanten Ort animieren. Timeline-Details koennen den verknuepften Event-Fokus ebenfalls ausloesen, Timeline-/Workspace-Reset stoesst einen neutralen Viewport-Reset an, und der Timeline-/Selection-Fokus laeuft ueber `geo-story-focus` statt nur implizit ueber Shell-Effekte. `Apply story window` setzt Fokus-Event, sichtbares Zeitfenster und aktives Filterfenster gemeinsam; wiederverwendbare Story-Presets leben im gemeinsamen Workspace-State, besitzen einen expliziten Active-Preset-Pfad, koennen beim Anwenden die Timeline-Selektion wiederherstellen und uebernehmen den Regionskontext fuer verknuepfte Events belastbar aus dem Event-Datensatz. Browser-Verify bleibt separat offen.
- [x] **F.18** — Story-/Timeline-Reset-Vertrag fuer v2-Core geschlossen: `TimelineStrip` hat einen neutralen Reset fuer Playback, Brush und Cursor ueber einen Shared Helper, loest Timeline-/Event-Fokus im Workspace, leert die Timeline-Selektion, setzt ein aktives Story-Preset bewusst auf `null` und setzt den Globe ueber `viewportResetNonce` wieder in den neutralen Viewport. Der Arbeitszustand zwischen sichtbarem Zeitfenster und aktivem Filterfenster ist explizit im UI modelliert. Der timeline-spezifische Codepfad ist zusaetzlich in einen eigenen `timeline/`-Bereich (`TimelineStrip`, `MapTimelinePanel`, `timeline-focus`, `timeline-presets`, `timeline-window-contract`) gebuendelt statt weiter zwischen Root und `shell/` verteilt zu liegen. Browser-/Live-Nachweis bleibt separat offen.
- [x] **F.13** — Overlay-Chrome-Visibility von Daten-Layer-Visibility sauber getrennt (`showFiltersToolbar`, `showBodyLayerLegend`, `showTimelinePanel` im Store; eigene Toggles im linken Panel; Filterbar, Legend-Overlay und Timeline-Workspace separat schaltbar)
- [x] **F.14** — generischer Selection-/Detail-Contract fuer v2-Core geschlossen: ein gemeinsamer Selection-Summary-Helper traegt Event Inspector, Marker-Liste, Timeline-Detail, Candidate Queue, Conflict Context und Region-News. Timeline-Details tragen explizit `linkedEventId`, koennen den Workspace-Fokus auf den verknuepften Event ziehen, leben ueber `selectedTimelineId` im gemeinsamen Workspace-State, und Story-Presets koennen diese Timeline-Selektion wiederherstellen. Unsichtbar gewordene Timeline-Selektion wird bereinigt, statt stale im Workspace zu bleiben. Zusaetzliche Conflict-Spezialobjekte fuer den spaeteren Flat-Mode sind Folgearbeit und kein Blocker mehr fuer v2-Core.
- [~] **F.15** — Responsive Analyst-Layouts begonnen: Mobile-Einstieg kollabiert beide Sidebars standardmaessig, vermeidet parallele linke/rechte Panel-Offen-Zustaende auf kleinen Viewports, hebt Floating-Panel-Offsets ueber den Footer und deaktiviert Resize-Griffe auf Mobile. Landscape-/Tablet-Finetuning, Timeline-/Modal-Layout und Browser-Verify bleiben offen.
- [~] **F.16** — Marker-Placement-/Edit-UX begonnen: neutraler Cursor-Modus als Default, klare Schritt-Hinweise, Viewport-Status-Chrome und robuste manuelle Koordinatenvalidierung vorhanden; Create-/Edit-Marker liegen jetzt nicht mehr lose unter `shell/`, sondern als klarer Authoring-Pfad unter `drawing/panels/`. Der Browse-/Inspect-Pfad fuer Marker ist zusaetzlich in einen eigenen `markers/`-Bereich (`MarkerListModal`, `MarkerListPanel`) ueberfuehrt worden, statt weiter mit allgemeiner Shell-Chrome vermischt zu sein. Preview/Snapping/Selection-Hardening bleiben offen
- [~] **F.17** — Drawing-Werkzeuge begonnen: Cursor-Modus, kontextabhaengige Workflow-Hinweise, Viewport-Status-Overlay und besserer Neutralzustand vorhanden; Draw-/Authoring-Logik lebt jetzt gebuendelt in `drawing/` (`types`, `drawing-workflow`, `MapInteractionStatusOverlay`, `hooks`, `panels`) statt verteilt ueber Root und `shell/`. Vertex-Handles, Edit-Mode, Geometry-Feedback und sichtbare Undo/Redo-Historie bleiben offen
- [~] **F.30** — Geo Panel Base Primitive begonnen: `GeoPanelFrame` existiert als gemeinsamer Geo-Panel-Rahmen und traegt bereits erste Right-Rail-Panels (`RegionNews`, `GeoPulseInsights`, `ConflictContext`, `GameTheory Impact`, `SourceHealth`) sowie die neuen Operations-Panels (`Alert Policy`, `Export Operations`, `Evaluation`, `Strategic Overlays`) mit gemeinsamer Header-/Description-/Badge-/Actions-Struktur. Offen bleiben Count/New-Badge, Retry/Loading-Standardisierung, Resize-/Persistenz-Verhalten und breitere Uebernahme in Left-/Timeline-/Flat-Chrome.
- [~] **F.31** — Geo Shell weiter zerlegen begonnen: `GeopoliticalMapShell.tsx` hat die Workspace-Buehne an `GeoWorkspaceStage` abgegeben; Viewport, Overlay-Chrome und Floating-Rails werden damit nicht mehr als eine einzige JSX-Wand verdrahtet. Der Flat-Pfad ist zusaetzlich in einen eigenen `flat-view/`-Bereich mit `scaffold/`-Unterbausteinen (`FlatViewViewportStage`, `FlatViewAnalystControls`, `FlatViewEventWorkspace`) ueberfuehrt worden, sodass `FlatViewScaffold.tsx` nur noch Orchestrierung und abgeleitete Zustandsbildung traegt. Fuer die Shell selbst lebt der lokale UI-/Resize-/Modal-/Collapse-State jetzt in `shell/hooks/useGeopoliticalShellController.ts`, und die datengetriebene Workspace-Glue-Logik (`filterSnapshot`, sichtbare Datasets, Overlay-Ableitungen, Story-/Timeline-/Chat-Sync) ist in `shell/hooks/useGeopoliticalShellOrchestration.ts` verlagert worden. Der Draw-/Authoring-Pfad wurde ebenfalls aus `shell/` herausgezogen und lebt nun gebuendelt unter `drawing/`. Offen bleiben weitere explizite Container fuer RightRail/PanelDock, Flat-/Globe-Entry-Surfaces und eine klarere Trennung zwischen Layout-, Data- und Selection-Orchestrierung.
- [~] **F.32** — Right-Rail-/Panel-Architektur ordnen begonnen: `MapRightSidebar` ist auf Inspector- und Timeline-Workspace-Bausteine (`GeoInspectorWorkspace`, `GeoTimelineWorkspace`) reduziert; Tabs und Shell bleiben lokal, die eigentlichen Rail-Inhalte leben nicht mehr als eine Inline-Komposition. Der Contradictions-Block ist zusaetzlich in einen eigenen `contradictions/`-Bereich mit Hook- und Card-Komponenten ueberfuehrt worden, statt Fetch-/Mutation-/Draft-State und Detail-Formular weiter in einer Root-Panel-Datei zu mischen. Offen bleiben feinere Section-Module innerhalb des Inspector-Stacks, eine explizitere Panel-Slot-/Dock-Struktur und spaetere Persistenz-/Reorder-Regeln
- [x] **F.33** — Panel-/Source-Status-Chrome geschlossen: `GeoPanelFrame` traegt jetzt einen gemeinsamen `live/cached/degraded/unavailable`-Statuspfad ueber `GeoPanelStatusBadge`, einen gemeinsamen Runtime-Meta-Pfad ueber `GeoPanelRuntimeMeta` sowie gemeinsame Error-/Empty-/Retry-Flaechen ueber `GeoPanelStateNotice`. `SourceHealthPanel`, `GeoPulseInsightsPanel`, `Conflict Context`, `GameTheory Impact`, `Region News` und der `Workspace Error`-Pfad nutzen diesen Standard bereits inklusive sichtbarer `snapshot/feed/health`-Hinweise und echter Refresh-Aktionen auf bestehende Workspace-/News-/Context-/GameTheory-Reloads. Browser-/Live-Abnahme fuer diesen Block laeuft ueber `V.27`.
- [~] **F.34** — Marker-System modernisieren begonnen: der Globe-Pfad hat jetzt eine eigene `rendering/MapCanvasMarkerLayer.tsx` fuer Marker-/Cluster-SVG-Rendering statt diese weiter inline in `MapCanvas.tsx` zu mischen, Marker-Browse lebt separat unter `markers/`, und gemeinsame Marker-View-Models fuer Browse-/Popup-/Interaction-State liegen in `markers/marker-view-model.ts` statt dieselben Ableitungen mehrfach in Liste, Popup und Globe-Layer zu duplizieren. Zusaetzlich ist ein expliziter Priority-/Declutter-Contract unter `markers/marker-priority.ts` eingefuehrt worden; der Flat-Payload traegt nun `priorityScore`, `priorityTier`, `declutterVisible`, `labelVisible`, `badgeVisible`, `haloRadiusMeters`, `haloColor`, `symbolShortCode` und `timelineFocused`, `FlatViewOverlay` blendet niedrig priorisierte Tail-Events nicht mehr einfach ungeordnet mit derselben Wichtigkeit ein, rendert selektive `TextLayer`-Labels fuer wichtige/selektierte Marker und legt fuer operative High-/Critical-Marker sichtbare Halos plus Symbol-Kurzcode-Badges auf die Flat-Surface. Der aktive Flat-Timeline-Bucket beeinflusst diese Marker jetzt sichtbar ueber denselben Renderer-Contract; Marker im selektierten Zeitbucket bleiben trotz Declutter sichtbar und bekommen eigenen Fokus-Halo. Der Globe-Pfad nutzt denselben Priority-Contract jetzt ebenfalls fuer Render-Reihenfolge, Halo-Staerke und selektive Prioritaets-Labels statt nur Hover-/Selection-Ringe; Priority-Labels werden dabei zoom-adaptiv erst ab naeherem Fokus oder aktiver Auswahl eingeblendet. Cluster transportieren zusaetzlich `maxSeverity`, `highPriorityCount` und ein repraesentatives Symbol-Kuerzel, damit der Globe nicht nur neutrale Count-Bubbles, sondern severity-getoente Cluster-Halos und schnelle inhaltliche Hinweise zeigt. Offen bleiben renderer-nahe Icon-/Label-Feinregeln, eine bewusstere Trennung von Browse/Selection vs. Globe-Selection-State und spaetere Declutter-/Priorisierungslogik ueber mehrere Zoomstufen
- [x] **F.35** — Panel-Grid-/Workspace-Komposition als expliziter Contract definiert: `shell/layout/geo-workspace-layout-contract.ts` legt jetzt explizit fest, welche Floating-Panels (`left-controls`, `right-intelligence`) resizebar sind, welche Persist-Keys sie tragen, welche Default-/Min-/Max-Breiten auf Desktop gelten, welche collapsed/mobile Width-Regeln greifen und wie Mobile/Desktop im Shell-Modus unterschieden werden. `useGeopoliticalShellController.ts` nutzt diesen Contract fuer Width-/Resize-/Bottom-Offset-Regeln, `GeoWorkspaceStage.tsx` / `GeoShellFloatingPanel.tsx` verdrahten daraus Titel, Panel-IDs, Persist-Keys und Resize-Verhalten statt diese weiter implizit in JSX und lokalen Konstanten zu streuen, und `useGeopoliticalShellPersistence.ts` persistiert jetzt Shell-Breiten, Collapse-State, Workspace-Tab sowie die zentralen Chrome-Toggles (`Candidate Queue`, `Filters Toolbar`, `Body Legend`, `Timeline`) ueber denselben Dock-Pfad. `MapRightSidebar.tsx` nutzt den Workspace-Tab nicht mehr nur lokal, sondern ueber den gemeinsamen Store-/Persistenzpfad. Browser-/Live-Abnahme dafuer bleibt ueber `V.25` und `V.28` abgedeckt.
- [~] **F.36** — Geo-Panel-Naming und Zielbild normieren begonnen: der alte `Phase12AdvancedPanel`-/`GeoOperationsPanel`-Pfad ist aus dem Produktcode entfernt; die Operations-Domaene lebt jetzt ueber `operations/GeoOperationsWorkspace.tsx`, fachliche `useGeo*`-Hooks, `Geo*Section`-Bausteine sowie den Shared-Domain-Contract `lib/geopolitical/operations-types.ts` und neue serverseitige Store-Pfade ohne `phase12` im Modulnamen. Offen bleiben weitere historisch/lieferungsgetriebene Namen, die Begrenzung auf ca. 5-6 fachliche Top-Level-Panels und die Zerlegung weiterer Mixed-Domain-Sammelpanels in klare Operations-/Insight-/Context-/Status-Panels oder kleine `Section`-Bausteine
- [~] **F.37** — MapCanvas-Strukturabbau begonnen: `MapCanvas.tsx` traegt weiterhin den Renderer-Core, hat aber die reine Overlay-/Chrome-Schicht (`Marker Legend`, Zoom-/Choropleth-Controls, Geo-Stats, Event-Popup) an `rendering/MapCanvasOverlays.tsx` abgegeben, statt diese weiter inline neben Projektions-, Selection- und Marker-Rendering zu mischen. Zusaetzlich leben Pointer-/Background-/Selection-Interaktionen nun in `rendering/useGeoMapCanvasInteractions.ts`, die SVG-Selection-/Preview-Layer liegen in `rendering/MapCanvasDrawingOverlays.tsx`, und Marker-/Cluster-SVGs sind in `rendering/MapCanvasMarkerLayer.tsx` ausgelagert. Offen bleiben weitere sichere Schnitte zwischen Renderer-Core, Projektion, Stage-Hooks und spaeterem Marker-System-Verhalten
- [x] **F.38** — Isolierter GeoMap-Experimentbereich aufgebaut: unter `src/features/geopolitical/geomap/experiment/` plus Route `/geomap/experiment` existiert jetzt ein separater Workspace fuer Shell-/Panel-/Dock-Entscheidungen mit mehreren Varianten (`worldmonitor-mission`, `fusion-analyst`, `signal-delta-desk`), eigenem Panel-Frame, Resizable-Workspace und explizitem Clone-Coverage-Board statt nur weiterer Arbeitsnotizen
- [x] **F.39** — Clone-Review-Coverage im Experiment materialisiert: die entscheidungsrelevanten UI-/Workflow-Rollen aus `WORLDMONITOR_AI_REVIEW`, `WORLDWIDEVIEW_AI_REVIEW`, `CRUCIX_AI_REVIEW`, `External_GEOSENTINEL_FRONTEND_REVIEW`, `SHADOWBROKER_AI_REVIEW`, `SOVEREIGN_WATCH_AI_REVIEW` und `CONFLICT_GLOBE_GL_AI_REVIEW` sind im Experiment als sichtbare Panel-/Support-Module oder Varianten hinterlegt; `REFERENCE_COVERAGE.md` dokumentiert bewusst, was als UI-/Shell-Idee materialisiert ist und was absichtlich nicht 1:1 extrahiert wurde
- [x] **F.40** — Backend-Optionen fuer das GeoMap-Experiment angelegt: unter `src/features/geopolitical/geomap/experiment/backend/` existieren jetzt stack-konforme Runtime-Optionen fuer Replay, Polling, Freshness und Graph-Runtime (`Gateway-first reliability`, `Balanced event runtime`, `Graph-heavy analyst runtime`) sowie ein eigenes Backend-Board im Experiment-Lab, damit Shell-/Panel-Entscheidungen nicht mehr ohne plausible Go-/Python-/Rust-Laufzeitoption getroffen werden
- [ ] **F.41** — Experiment-zu-Produkt-Promotionspfad offen: bevorzugte Panel-/Dock-/Support-Module aus `/geomap/experiment` gegen produktive GeoMap priorisieren und nur den ausgewaehlten Delta-Umfang in `GeopoliticalMapShell`, Right-Rail, Timeline und Flat-/Marker-Pfade ueberfuehren
- [x] **F.42** — Cesium-/Scene-Experiment als Sidecar im Experiment angelegt: unter `src/features/geopolitical/geomap/experiment/cesium/` existieren jetzt explizite `CesiumJS`-/Scene-Optionen (`scene-sidecar`, `hybrid-tiles-track`, `defer-cesium`) plus eigenes Board im Lab und eine echte Resium/Cesium-Scene-Preview mit asset-synchronisiertem `/public/cesium`-Pfad. Die produktive GeoMap bleibt unangetastet; die eigentliche Bewertungsentscheidung bleibt ueber `V.31` offen
- [x] **F.43** — Flat-Clone-Experimentvarianten ausgebaut: unter `src/features/geopolitical/geomap/experiment/flat/` existieren jetzt dedizierte Flat-Workspace-Optionen (`Mission flat workspace`, `Operator list-sync flat`, `Delta + macro flat desk`) aus `worldmonitor`, `worldwideview`, `GeoSentinel`, `Crucix` und `Shadowbroker`; die spaetere Promotion bleibt ueber `V.29/V.31` offen

---

## 5. API / Backend

- [ ] **API.1** — `POST /api/geopolitical/candidates/:id/review` (GeoAnalystFeedback Body)
- [ ] **API.2** — `GET /api/geopolitical/feedback/metrics`
- [ ] **API.3** — `GET /api/geopolitical/feedback/disagreements`
- [ ] **API.4** — Metadata-first-/legal-safe source persistence fuer GeoMap verifiziert (keine unzulaessige Volltext-Speicherung)
- [ ] **API.5** — Source-health / provider-outage / rate-budget-Verhalten fuer GeoMap-Routen owner-konsistent dokumentiert
- [ ] **API.6** — Search-Around-API-Vertrag liefert typisierte Graph-Ergebnisse (`nodes`, `edges`, `time_window`, optionale `metrics`) fuer Globe/Flat/Panels konsistent
- [ ] **API.7** — Writeback-Endpoints erzwingen Audit-/Evidence-Felder (`actor`, `reason`, `old/new`, `policy decision`, `timestamp`) fuer Geo-Mutationen
- [ ] **API.8** — `GET /api/geopolitical/market-snapshot` Vertrag liefert konsistente `success/error/requestId/degraded`-Antworten fuer GeoMap-Panel-Snapshots
- [ ] **API.9** — `GET /api/geopolitical/delta` Vertrag liefert typisiertes Delta (`summary`, `new`, `escalated`, `de-escalated`, `timestamp`) fuer GeoMap-Panels
- [ ] **API.10** — Snapshot-/Delta-Routen halten Metadata-first-/legal-safe Source-Policy aus `GEOMAP_SOURCES_AND_PROVIDER_POLICY.md` ein

---

## 6. Tests

- [ ] **T.1** — Unit: scoring logic, dedup logic, state transitions, schema validation
- [ ] **T.2** — Integration: ingestion → candidate → review → persistence, timeline append
- [ ] **T.3** — E2E: draw + marker workflow, candidate review lifecycle, region click → filtered feed, timeline interactions
- [ ] **T.4** — View-Consistency-Test: gleicher Datensatz wird in Globe und Flat konsistent gefiltert / selektiert / erzählt
- [~] **T.5** — Replay-/Timeline-Test: Zeitfenster-Filter beeinflusst Karte, Listen und Story-Highlights konsistent; Unit-Coverage fuer Replay-Window, Timeline-Presets und filter-contract-getriebene Sichtbarkeit fuer Events, Timeline, Candidates und Region-News ist vorhanden, Browser-/E2E-Gate bleibt offen
- [~] **T.11** — Temporal-Contract-Test begonnen: Unit-Coverage fuer Presets, neutralen Reset-Zustand sowie getrennten Timeline-View-, Selected-Time- und Replay-Range-State vorhanden; Domain-Clamping fuer sichtbares Zeitfenster und Selected-Time ist jetzt ebenfalls getestet, ein kleiner `timeline-window-contract` deckt die explizite Beziehung zwischen sichtbarem Zeitfenster und aktivem Filterfenster ab, und `buildGeoTimelineTimeFocus`/`geo-story-focus` sichern den ersten Story-Autofit-Pfad plus wiederverwendbare Story-Presets auf Helper-Ebene ab. Der Workspace-Store traegt jetzt ausserdem ein explizites `activeStoryFocusPresetId`, inklusive Reset- und Remove-Verhalten; Story-Presets stellen beim Anwenden auch die Timeline-Selektion wieder her. Browser-Verify fuer den Story-/Temporal-Contract bleibt offen
- [x] **T.6** — Overlay-Chrome-Test geschlossen (non-live Scope): `store.test.ts` deckt die getrennte Store-Fuehrung fuer `showFiltersToolbar`, `showBodyLayerLegend` und `showTimelinePanel` ab; `flat-view-renderer-contract.test.ts` prueft explizit, dass reine Overlay-Chrome-Umschaltungen Bounds-/Event-/Timeline-Payloads im Flat-Contract nicht veraendern. Browser-/UI-Verify laeuft separat ueber `V.8`.
- [~] **T.7** — Keyboard-/Focus-Test begonnen: reiner Shortcut-Decision-Test deckt Editierfeld-Schutz, Delete-Prioritaet und Undo/Redo-Kontext ab; echter Browser-/Fokus-Reihenfolge-Verify bleibt offen
- [~] **T.8** — Provider-Outage-/Source-Health-Test begonnen: `source-health-contract.ts` bildet rohe Source-Health-Entries jetzt auf einen expliziten `healthy/degraded/outage/empty`-Zustand mit Zaehlern und Summary-Text ab; `source-health-contract.test.ts` deckt Empty-, hard-signal-outage-, degraded- und healthy-Pfade non-live ab. `SourceHealthPanel.tsx` rendert diesen Zustand sichtbar statt nur rohe Entry-Liste. Browser-/Live-Gate fuer echte Provider-Ausfaelle bleibt offen.
- [~] **T.9** — Drawing-Interaction-Test begonnen: `drawing-workflow.ts` traegt jetzt neben Hint-/Status-Logik einen expliziten Action-State fuer `complete/clear/open/delete/undo/redo`, sodass `DrawModePanel.tsx` seine Button-Verfuegbarkeit nicht mehr ueber verstreute Ad-hoc-Bedingungen ableitet. `drawing-workflow.test.ts` deckt diesen Action-State non-live ab, und `store.test.ts` prueft, dass Drawing-Selektion Event-/Timeline-/Story-Fokus deterministisch uebersteuert. Browser-/Mehrschritt-Gate fuer echtes Marker/Line/Polygon/Text-Placement, Undo/Redo und Edit-Mode bleibt offen.
- [~] **T.10** — Multi-Select-/Bulk-Interaction-Test begonnen: `multi-selection-contract.ts` definiert jetzt einen expliziten Selection-Set-Contract fuer `replace/append/toggle/clear`, statt kuenftige Mehrfachselektion implizit an Single-Selection-Hooks zu haengen. `multi-selection-contract.test.ts` und `box-selection.test.ts` decken diese Pfade non-live ab, `useGeoMapMarkerClusters.ts` traegt Cluster-Member-IDs jetzt explizit im Cluster-Payload, `store.ts`/`store.test.ts` besitzen mit `selectedEventIds` plus `selectEvents(...)` die erste echte Multi-Selection-Runtime im gemeinsamen Workspace-State, `MapCanvas.tsx` unterstuetzt erste Shift-Box-Selection sowie Shift-Cluster-Selection, und `GeopoliticalMapShell.tsx` zeigt dafuer eine sichtbare Bulk-Leiste mit `Keep primary`, `Open in flat view` und `Clear`. Browser-/Lasso-/Bulk-Verify laeuft separat ueber `V.24`; fuer `T.8` und `T.9` existieren die Live-Gates bereits separat ueber `V.11` bzw. `V.2/V.9`.
- [ ] **T.12** — Export-Consistency-Test: JSON/CSV und PNG/PDF spiegeln denselben gefilterten/sichtbaren GeoMap-Zustand
- [x] **T.13** — View-Handoff-/Flat-Scaffold-Tests geschlossen (non-live Scope): Unit-Coverage prueft Event-, Story-, Region-, Cluster-, Draw-Area- und Bounds-Handoffs auf deterministische Bounds, Zeitfenster-, Filter- und Focus-Uebergabe; `flat-view-state.test.ts` deckt den renderer-neutralen Flat-Scaffold fuer `deckgl-maplibre` inklusive Reason-, Layer-Familien und Basemap-Policy ab, `store.test.ts` prueft den gemeinsamen Apply-Pfad von `pendingFlatViewHandoff` in den expliziten Flat-Workspace-State sowie die Focus-Synchronisierung bei Event-Selektion im Flat-Mode, `flat-view-renderer-contract.test.ts` deckt den gemeinsamen Renderer-Contract fuer Bounds/Basemap/Focus/Overlay-Chrome/Event-Point-/Timeline-Daten inklusive shell-getriebener Chrome-Flags und stabiler Layer-Definitionen ab. Browser-/Renderer-Abnahme laeuft separat ueber `V.15`.
- [x] **T.14** — Flat-Handoff-Interaction-Test geschlossen (non-live Scope): `useGeoFlatViewEntry.test.ts` deckt den gemeinsamen Resolver fuer Current-Context-Einstiege ab, inklusive Prioritaet `story -> event -> drawing -> region`, Story-Handoff trotz fehlendem linked event, explizitem `reuse_existing_flat_state`-Fallback bei bereits vorhandenem Flat-Workspace und Null-Pfad ohne Kontext. `store.test.ts` deckt ausserdem ab, dass der Rueckweg nach `mapViewMode=globe` den aufgebauten Flat-Workspace-State non-live stabil haelt. Der resultierende Flat-Zustand fliesst ueber einen gemeinsamen Renderer-Contract in Viewport und Overlay. Browser-/Interaction-Abnahme laeuft separat ueber `V.14` und `V.15`.
- [x] **T.15** — Flat-Layer-Payload-Test geschlossen (non-live Scope): `flat-view-overlay-payload.ts` extrahiert Bounds-GeoJSON plus renderer-taugliche Event-Payloads (Position, Selection, Radius, Severity-Farbe) aus gemeinsamen Domain-Daten; `flat-view-overlay-payload.test.ts` deckt Bounds-, Filter-, Selection- und Severity-Mapping ab. `flat-view-conflict-layers.ts` baut konfliktnahe Layer-Payloads fuer `strikes`, `targets`, `assets`, `zones` und `heat`; diese haengen im gemeinsamen Renderer-Contract und sind im Flat-Overlay bereits hinter der `conflict`-Layer-Familie verdrahtet. Browser-/Renderer-Abnahme laeuft separat ueber `V.16`.
- [x] **T.16** — Flat-Replay-/Bucket-Timeline-Test geschlossen (non-live Scope): `flat-view-timeline-model.ts` baut ein deterministisches Flat-Timeline-Modell aus sichtbaren Events plus Temporal-State, inklusive Bucket-Bildung, Filter-Overlap, Selected-Time-/Story-Fokus und Conflict-Layer-Gate. Die Buckets tragen conflict-nahe Diagnostik (`strikeCount`, `targetCount`, `assetCount`, `heatIntensity`) statt nur roher Event-Zaehlung; `flat-view-timeline-model.test.ts` deckt Range-, Bucket-, Layer-Visibility- und Conflict-Diagnostic-Pfade ab, und der Flat-Workspace zeigt diese Werte fuer den selektierten Bucket als non-live Contract-Preview. Browser-/Replay-Abnahme laeuft separat ueber `V.16`.
- [ ] **T.17** — Ontologie-/Graph-Contract-Test: Relationstypen, Traversal-Depth, Zeitfenster und Confidence-Verhalten bleiben in Search-Around reproduzierbar
- [ ] **T.18** — GeoTrack-/Interpolation-Test: `LINEAR|NEAREST|PREVIOUS|NEXT|NONE` verhalten sich in Replay/Story deterministisch und explizit
- [ ] **T.19** — Geo-Writeback-Audit-Test: Kartenmutationen erzeugen append-first Audit-/Timeline-Eintraege mit vollstaendigen Evidence-Metadaten
- [ ] **T.20** — Flat-3D-Tiles-Prototyp-Test: deterministische Tile-Load-/Unload-Events, stabile Kamera-Synchronisation und reproduzierbares Verhalten bei Netzwerk-Drosselung
- [ ] **T.21** — 3D-Tiles-Performance-Test: FPS/Frame-Time, GPU-/RAM-Budget und Main-Thread-Blockierung bleiben innerhalb definierter NFR-Grenzen; Context-Loss/Recovery wird explizit getestet
- [x] **T.22** — Renderer-Contract-Regressionstest geschlossen (non-live Scope): `flat-view-regression-contract.test.ts` prueft, dass derselbe Replay-/Filter-/Selection-Zustand aus dem Globe-Workspace im Flat-Contract auf denselben sichtbaren Event-Satz, dieselben Conflict-Layer-Objekte und dieselbe Bucket-Diagnostik hinauslaeuft. Live-/Browser-Abnahme bleibt separat ueber `V.15/V.16`.
- [ ] **T.23** — Cesium-Eval-Sicherheits-/Ops-Test: Token-/Credential-Handling, Attribution-/Lizenzpfad und Degradation bei fehlenden 3D-Services verhalten sich deterministisch
- [ ] **T.24** — Macro+Markets-Panel-Test: Render/Badge/Degraded-State bleiben bei Teilfehlern stabil
- [ ] **T.25** — Sweep-Delta-Panel-Test: Bucket-Logik (`new/escalated/de-escalated`) inkl. Empty-State ist reproduzierbar
- [ ] **T.26** — Snapshot-/Delta-Contract-Test: `market-snapshot` und `delta` halten Type-/Field-Vertrag stabil
- [ ] **T.27** — Panel-Regressionstest: neue Panels brechen Timeline-/Inspector-Wechsel, Sidebar-Scroll und Keyboard-Navigation nicht
- [ ] **T.28** — Geo-Panel-Primitive-Test: Header-/Badge-/Resize-/Persistenz-/Retry-Zustaende des kuenftigen Geo-Panel-Standards bleiben reproduzierbar und a11y-stabil
- [ ] **T.29** — Flat-Marker-System-Test: Marker-/Icon-/Label-/Cluster-Contracts verhalten sich ueber Zoomstufen, Selection und Degradation deterministisch
- [ ] **T.30** — Shell-Contract-Test: AppHeader, PanelDock, RightRail und Workspace-Grid bleiben bei Collapse/Resize/View-Switch konsistent und erzeugen keine versteckten Cross-State-Regressions

---

## 7. SOTA-Backlog (Sek. 35)

- [ ] **SOTA.1** — Feedback-Driven Review (System-Klassifikation, Analysten-Entscheidungen, Collaborative Review)
- [ ] **SOTA.2** — Evidence Bundle: SHA256 Source Hash, Snapshot Storage
- [ ] **SOTA.3** — Contradiction Tracking (explizit)
- [ ] **SOTA.4** — Confidence Decay + regelbasierte Status-Transitions
- [ ] **SOTA.5** — Explain-Why pro Candidate
- [ ] **SOTA.6** — Evaluation Harness (Precision/Recall, Override Rate, Kappa, Dashboard)
- [ ] **SOTA.7** — Policy-as-Code (v2)
- [ ] **SOTA.8** — OffscreenCanvas / supercluster Worker (Performance)
- [ ] **SOTA.9** — Dual-View Analyst UX: strategischer Globe + operativer Flat/Regional-Mode
- [~] **SOTA.10** — Story-driven Replay UX begonnen: Karte, Zeitfenster, Details und erste wiederverwendbare Story-Presets laufen bereits ueber denselben Grundcontract; ein expliziter Active-Preset-/Remove-Pfad im gemeinsamen Workspace-State ist vorhanden. Vollstaendige Narrative-/Browser-Abnahme bleibt offen
- [ ] **SOTA.11** — Advanced Analyst Editing UX: Globe-basierte Grundwerkzeuge + dichterer Flat/Conflict-Edit-Mode ueber gemeinsamen Domain-Contract
- [ ] **SOTA.12** — Timeline/Playback UX folgt analyst-grade Temporal-State-Modell statt Preset-only-Logik (`view extent` + `time filter window` + optional `selected time`)
- [ ] **SOTA.13** — Renderer-Strategie bleibt multi-view statt rewrite-first: Globe-Core strategisch, Flat-Mode operativ, Multi-Body-/Scene-Mode nur bei eigenem spaeteren Bedarf
- [~] **SOTA.14** — Contextual Handoff UX begonnen: Event-Inspector, Timeline-/Story-Detail, Region-News, Cluster-Drilldowns und ausgewaehlte Drawings tragen bereits kontextuelle Einstiege; der Current-Context-Handoff priorisiert Story-Presets jetzt deterministisch vor Event-/Drawing-/Region-Fallback und bleibt auch bei fehlendem linked event temporal/story-getrieben statt still zu no-openen. Browser-/Flat-Renderer-Abnahme bleibt der naechste Ziel-UX-Block vor dem Flat/Conflict-Mode
- [ ] **SOTA.15** — layer-driven Flat-Conflict-Workspace wie in starken Referenzen: typed payloads, zentrale Filter-Engine, Replay-/Story-Kopplung und operative Selection/Detail-Ansicht
- [ ] **SOTA.16** — Geo-Ontologie als eigener Runtime-Owner etabliert: Search-Around, geotemporale Tracks und Writeback-Audit sind dokumentiert und gate-gefuehrt
- [ ] **SOTA.17** — 3D-Tiles-Strategie 2026 verankert: `deck.gl` + `@loaders.gl/3d-tiles` als leichter Integrationspfad evaluiert; klare Grenze dokumentiert, ab wann CesiumJS technisch/produktseitig vorzuziehen ist. Relevante Referenzpfade fuer den spaeteren Cesium-/Scene-Track: `_tmp_ref_review/geo/Shadowbroker/frontend/src/components/CesiumViewer.tsx`, `_tmp_ref_review/geo/worldwideview/.agents/workflows/cesium.md`, `_tmp_ref_review/geo/worldwideview/public/cesium/*`. Relevante aktuelle Ersatz-/Integrationspfade im Repo: `src/features/geopolitical/MapCanvas.tsx`, `src/features/geopolitical/rendering/useGeoMapProjectionModel.ts`, `src/features/geopolitical/rendering/useGeoMapMarkerVoronoi.ts`, `src/features/geopolitical/rendering/useGeoMapMarkerClusters.ts`, `src/features/geopolitical/rendering/useGeoMapCanvasBasemapStage.ts`, `src/features/geopolitical/rendering/useGeoMapCanvasCountryStage.ts`, `src/features/geopolitical/rendering/useGeoMapCanvasBodyPointLayersStage.ts`, `src/features/geopolitical/shell/MapViewportPanel.tsx`
- [ ] **SOTA.18** — Cesium-vs-deck/maplibre Decision-Matrix als laufender Owner-Artefakt gepflegt (Capabilities, Integrationskosten, Runtime-Risiken, Produktfit, Team-/Ops-Aufwand). Die Matrix muss explizit zwischen `d3-geo`-Globe-Core, `deck.gl`/`MapLibre`-Second-Mode und spaeterem `CesiumJS`-Scene-/Multi-Body-Track unterscheiden und die oben genannten Referenz- und Ersatzpfade mitfuehren
- [ ] **SOTA.19** — Geo-Shell als analyst-grade Dashboard-Surface statt God-Component verankert: starke Panel-Primitive, klare Right-Rail-/Panel-Docks, sichtbares Status-/Health-Chrome und getrennte Renderer-/Workspace-Boundaries sind normativ festgezogen

---

## 8. Execution Checklist — offene Items

**Product:**
- [~] asset links (Backend fertig, UI fehlt Dropdown + Weight-Slider)
- [~] no-noise policy (Dedup + Confidence da, Alerting unvollständig)

**Engineering:**
- [ ] tests (Geo-spezifische Unit-/Integration-Abdeckung weiter duen, verify-led E2E bleibt Pflicht)
- [~] Keyboard Shortcuts (Core-Shortcuts plus UI-Discoverability und `Esc`-Cursor-Modus vorhanden, kompletter Verify-/UX-Pass offen)
- [x] Exports (JSON/CSV + PNG/PDF vorhanden; Briefing-/storage-backed Export bleibt offen)
- [~] a11y Pass (aria-Labels und Panel-Steuerung teils vorhanden, systematischer Audit offen)
- [~] source-health/provider-outage verify (Health-Panel/Route vorhanden, expliziter Browser-/Live-Gate offen)
- [x] replay/story controller (v2-Core-Vertrag fuer Timeline, Story-Fokus, Reset und Zeitfenster geschlossen; Browser-/Live-Verify separat offen)
- [x] selection/detail contract (v2-Core-Vertrag fuer Event/Timeline/Candidate/Context/News geschlossen; spaetere Conflict-Spezialobjekte folgen im Flat-Mode)
- [~] overlay chrome separation (Store-/Shell-Trennung fuer Filters/Legend/Timeline umgesetzt; manuelle Verify nach `V.8` noch offen)
- [~] flat handoff UX (typed handoff/store/scaffold vorhanden; Event-/Timeline-Einstiege vorhanden, manuelle Verify nach `V.14` und weitere kontextuelle Einstiege offen)
- [~] drawing UX (funktional, Cursor-Modus + Workflow-Hinweise + Viewport-Status-Chrome + manuelle Koordinatenvalidierung vorhanden, aber Marker-/Geometry-Placement, Selection und Edit-Mode noch nicht analyst-grade)
- [ ] worldmonitor-blueprint verify (A-Paket zuerst: Dual-Engine-Boundary + Panel-Primitive + Panel-Grid/Shell-Orchestrierung + Flat-Marker-/Status-Chrome) gegen `WORLDMONITOR_AI_REVIEW.md` abgeschlossen
- [ ] geo-shell decomposition verify (`GeopoliticalMapShell.tsx` Orchestrierung weiter reduziert; bestehende Shell-Komponenten ueber explizite Dock-/Rail-/Viewport-Contracts verkabelt) browser- und testseitig abgeschlossen
- [ ] Crucix-panel blueprint verify (Macro+Markets + Sweep Delta + Degradation + Panel-Interaction) gegen `CRUCIX_AI_REVIEW.md` abgeschlossen
- [ ] Worldwideview-blueprint verify (A-Paket zuerst: Plugin/DataBus/Polling + history/availability + key-verify + selection/timeline/search coupling) gegen `WORLDWIDEVIEW_AI_REVIEW.md` abgeschlossen
- [ ] Shadowbroker-blueprint verify (A-Paket zuerst: fast/slow polling + ETag/freshness + resilient fetch/fallback + Map-Orchestrierung) gegen `SHADOWBROKER_AI_REVIEW.md` abgeschlossen
- [ ] SovereignWatch-blueprint verify (A-Paket zuerst: replay/history/search contracts + broadcast/historian + multi-source poller resilience + worker/layer orchestration) gegen `SOVEREIGN_WATCH_AI_REVIEW.md` abgeschlossen
- [ ] ConflictGlobe-blueprint verify (A-Paket zuerst: arc/path/ring/hexbin/heatmap graph overlays + timeline/search/selection coupling + lightweight stream aggregation) gegen `CONFLICT_GLOBE_GL_AI_REVIEW.md` abgeschlossen
- [ ] GeoSentinel-frontend blueprint verify (A-Paket zuerst: search-orchestrator + category filter chips + layer-chrome separation + active-list/selection sync + zoom-adaptive marker rendering) gegen `External_GEOSENTINEL_FRONTEND_REVIEW.md` abgeschlossen

**Ops:**
- [~] alert routing test (Route vorhanden, kein UI, kein E2E-Test)

---

## 9. Infrastruktur-Lücken

- [ ] **INF.1** — Daten-Density: ACLED/GDELT Credentials klaeren
- [ ] **INF.2** — LLM-Summary-Gap: NLP-Pipeline fuer echte Zusammenfassung
- [ ] **INF.3** — Persistence: Zeichnungen/Marker von localStorage nach Prisma migrieren
- [ ] **INF.4** — Zombie-Processes (Windows Dev): Go-Gateway sauberes Shutdown
- [~] **INF.5** — Externes Referenz-Monitoring (Detailstand):  
  - `pharos-ai` — window: `2026-03-12..2026-03-16`; delta: Agent-Mirror + Snapshot/Chat/RAG/README; impact_on_geomap: Monitoring bleibt aktiv, kein Scope-Shift; next_check: vor Flat/Conflict-Contract-Delta  
  - `Crucix` — window: lokaler Clone-Stand `2026-03-16`; delta: panel-first / delta-thinking Blueprint stabil; impact_on_geomap: Macro+Markets/Sweep/Cross-Source als verify-pflichtige Referenz; next_check: vor Panel-/Workspace-Architektur-Delta  
  - `worldmonitor` — window: lokaler Clone + Extraction-Stand `2026-03-19`; delta: Dual-Engine-Map, Panel-Primitive, App-/Panel-Layout-Orchestrierung, Source-/Status-Disziplin und Flat-Marker-/Icon-Layer als neue A/B/C-Referenz aufgenommen (`selected_count=19` im Manifest); impact_on_geomap: Geo-Shell-/Panel-Refactor und Flat-Marker-/Status-Chrome priorisiert; next_check: vor Shell-/Panel-/Flat-Marker-Contract-Delta  
  - `worldwideview` — window: lokaler Clone + Extraction-Stand `2026-03-16`; delta: Plugin/Adapter/UI-Patterns auf A/B/C priorisiert (`selected_count=76` im Manifest); impact_on_geomap: A-Paket priorisiert, insbesondere Search-/Selection-/Timeline-/active-list-Orchestrierung fuer den Flat-Workspace, B adapterbasiert, C bewusst ausgeschlossen; next_check: bei Manifest-/A/B/C-Aenderung oder vor Contract-Delta  
  - `ogi` — window: lokaler Clone + Extraction-Stand `2026-03-16`; delta: Agent-/Runtime-/Worker-/Audit-Muster priorisiert, Graph-Themen in dedizierte Slices ausgelagert; impact_on_geomap: Runtime-Hardening nutzbar ohne Scope-Drift in Graph; next_check: bei Manifest-Aenderung oder vor Agent-/Runtime-Contract-Delta  
  - `shadowbroker` — window: lokaler Clone + Extraction-Stand `2026-03-16`; delta: Backend-Resilience-/Proxy-/Polling-/Map-Orchestrierungs-Patterns auf A/B/C priorisiert (`selected_count=40` im Manifest); impact_on_geomap: A-Paket fuer Flat-Mode-nahe Runtime-Hardening priorisiert, vor allem Freshness-/Polling-/Fallback-Pfade, B adapterbasiert, C bewusst ausgeschlossen; next_check: bei Manifest-/A/B/C-Aenderung oder vor Backend-/Map-Contract-Delta  
  - `sovereign_watch` — window: lokaler Clone + Extraction-Stand `2026-03-16`; delta: Ingestion-/Replay-/History-/Map-Worker-/Layer-Patterns auf A/B/C priorisiert (`selected_count=122`, `gap_patch_count=25` im Manifest); impact_on_geomap: A-Paket priorisiert fuer Backend-/Runtime-Hardening und Replay-/History-Pfade, B adapterbasiert, C referenz-only; next_check: bei Manifest-/A/B/C-Aenderung oder vor Ingestion-/Replay-/Map-Contract-Delta  
  - `conflict_globe_gl` — window: lokaler Clone + Extraction-Stand `2026-03-16`; delta: Graph-Visualisierungs-/Arc-/Path-/Timeline-/Entity-Patterns auf A/B/C priorisiert (`selected_count=44` im Manifest); impact_on_geomap: vorerst spaeterer global-view-/v3-Track fuer visuelle Relationship-Layer; aktuelle Closeout-Arbeit bleibt auf Flat-/Regional-Workspace statt graph-heavy Globe-Erweiterung fokussiert; next_check: bei Manifest-/A/B/C-Aenderung oder vor Graph-Overlay-/Timeline-Contract-Delta  
  - `geosentinel_frontend` — window: lokaler Clone-Stand `2026-03-16`; delta: Frontend-Map-UX-/Search-/Filter-/Layer-/Selection-/Tracking-Patterns in `External_GEOSENTINEL_FRONTEND_REVIEW.md` auf A/B/C priorisiert; impact_on_geomap: A-Paket fuer modulare UI-Runtime-Verbesserung im Flat-Workspace priorisiert, Monolith-HTML als non-adopt markiert; next_check: vor Frontend-Map-Contract-Delta oder bei Review-Aenderung
- [ ] **INF.6** — Source-Bias-/Cross-Bias-Operationalisierung fuer GeoMap-Candidates geplant (mindestens als Rules-/Review-Backlog)
- [ ] **INF.7** — Externes Referenz-Monitoring `worldwideview`: Clone-Stand und Extraction-Manifest synchron, neue High-Benefit-Patterns auf A/B/C bewertet
- [ ] **INF.8** — Externes Referenz-Monitoring `shadowbroker`: Clone-Stand und Extraction-Manifest synchron, neue High-Benefit-Patterns auf A/B/C bewertet
- [ ] **INF.9** — Externes Referenz-Monitoring `sovereign_watch`: Clone-Stand und Extraction-Manifest synchron, neue High-Benefit-Patterns auf A/B/C bewertet
- [ ] **INF.10** — Externes Referenz-Monitoring `conflict_globe_gl`: Clone-Stand und Extraction-Manifest synchron, neue High-Benefit-Patterns auf A/B/C bewertet
- [ ] **INF.11** — Externes Referenz-Monitoring `geosentinel_frontend`: Clone-Stand und Frontend-A/B/C-Review (`External_GEOSENTINEL_FRONTEND_REVIEW.md`) synchron, neue High-Benefit-Patterns auf A/B/C bewertet
- [ ] **INF.12** — Externes Referenz-Monitoring `worldmonitor`: Clone-Stand und Extraction-Manifest synchron, neue High-Benefit-Patterns fuer Shell-/Panel-/Renderer-/Source-Status auf A/B/C bewertet

---

## 10a. Runtime Reality Check (2026-03-10)

- [x] **RR.1** — `GeopoliticalMapShell.tsx` ist nicht mehr der alte ~1450-LoC-Zustandsmonolith; ein zentraler Zustand-Store (`store.ts`) plus Hook-Splits fuer Workspace, Drawing, Marker und Keyboard existieren, und sichtbare Replay-/Filter-Datasets inklusive Selection-/Preset-Cleanup sind inzwischen in einen eigenen `useVisibleGeoWorkspaceData`-Pfad ausgelagert
- [x] **RR.2** — `TimelineStrip.tsx` enthaelt bereits Brush-/Replay-/Playback-/Decay-Preview-Scaffolding; v2-Gates bleiben offen, sind aber kein Nullzustand mehr
- [x] **RR.3** — Phase12-UI ist real vorhanden: Alert-Policy, Export (JSON/CSV + PNG/PDF), Evaluation und Overlay-Config laufen ueber dedizierte Hooks und API-Routen
- [~] **RR.4** — Review-/Feedback-/Candidate-Contracts aus `GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` sind normativ weiter als die aktuelle Runtime (`GeoCandidate.state`, `/review`, `feedback/metrics`, `feedback/disagreements`)
- [x] **RR.5** — Overlay-Chrome hat jetzt eigene Runtime-Flags und Controls: Filterbar, Body-Legend und Timeline-Workspace sind separat von Candidate-/Region-/Heat-/Soft-Signal-Layern schaltbar
- [~] **RR.6** — Replay ist nicht mehr nur lokales Timeline-UI: das effektive Zeitfenster wird in den Store gespiegelt und filtert bereits Map-Events, Timeline, Region-News, Context und Game-Theory; ein neutraler Timeline-Reset fuer Playback/Brush/Cursor ist jetzt vorhanden. Sichtbares Timeline-Fenster und aktives Replay-Fenster sind im Store inzwischen getrennt, `selected time` wird nicht mehr permanent vom Playback-Cursor ueberschrieben, Domain-Wechsel clampen View-/Selected-Time-Zustaende wieder auf gueltige Bereiche, Game-Theory folgt nicht mehr nur dem Replay-Fenster, sondern dem sichtbaren Event-Satz, region-getaggte Context-Items koennen bei vorhandener Region-Metadatenlage bereits am aktiven Regionsfilter ausgerichtet werden, und das Timeline-UI macht die Beziehung zwischen sichtbarem Fenster und aktivem Filterfenster jetzt explizit statt implizit. Ein erster expliziter Story-Autofit-Pfad setzt Zeitfenster und aktives Filterfenster gemeinsam auf den selektierten Timeline-Eintrag; vollstaendiger Story-/Detail-Contract fehlt weiter
- [~] **RR.7** — Selection-/Detail-Rendering ist nicht mehr voll fragmentiert: ein gemeinsamer Helper speist Event Inspector, Marker-Liste und Timeline-Detail; Timeline-Selektion lebt inzwischen ueber `selectedTimelineId` im gemeinsamen Workspace-State statt nur lokal im Timeline-Widget, und stale Timeline-Selektion wird bereinigt, sobald sie aus dem sichtbaren Ausschnitt faellt. Candidate Queue, Region-News und Context-Feed rendern inzwischen ebenfalls ueber denselben Detail-Grundvertrag fuer Titel/Summary/Meta. Conflict-Objekttypen und vollstaendige story-driven Selection bleiben offen
- [~] **RR.8** — Kamera-/Reset-Vertrag ist nicht mehr nur manuell: Event-Auswahl fokussiert den Globe ueber `viewport-focus`, Timeline-/Workspace-Reset kann den Viewport wieder neutralisieren, und Selection-/Timeline-Fokus traegt inzwischen ueber einen kleinen `geo-story-focus`-Contract einen `regionId`-Hinweis fuer plausiblen Region-Fokus, ohne bestehende Filter hart zu ueberschreiben. Story-Presets laufen jetzt ueber den gemeinsamen Workspace-State inklusive `activeStoryFocusPresetId` und Remove-/Reset-Pfad; Browser-Gate bleibt offen
- [~] **RR.8** — Drawing ist nicht mehr nur werkzeug-getrieben: `cursor` als neutraler Default, `Esc` als Rueckkehrpfad und ein kleines Viewport-Status-Overlay fuer aktiven Marker-/Drawing-Zustand sind vorhanden; Marker-/Draw-UX bleibt trotzdem klar v2-unfertig
- [~] **RR.9** — Responsive Shell ist nicht mehr rein desktop-fixiert: `useIsMobile()` kollabiert Sidebars initial auf kleinen Viewports, oeffnet links/rechts nicht mehr gleichzeitig und schuetzt Floating-Panels vor Footer-Kollisionen; echter Mobile-/Landscape-Verify steht weiter aus
- [~] **RR.10** — Kamera-Fokus ist nicht mehr rein manuell: eine Event-Selektion kann den Globe ueber einen kleinen `viewport-focus`-Contract animiert auf Marker-Koordinaten ziehen; Timeline-Reset loest inzwischen wenigstens die Workspace-Selektion, aber Story-/Timeline-Aktivierung und konsistente Kamera-Reset-Pfade fehlen noch
- [~] **RR.11** — Shortcut-Verhalten ist nicht mehr nur implizite Hook-Logik: der Key-Entscheider ist in einen kleinen testbaren Helper extrahiert und deckt Editierfeld-Schutz, Delete-Prioritaet und Undo/Redo ohne Browser-Mount ab; Live-/Focus-Gate bleibt offen
- [~] **RR.12** — Timeline ist nicht mehr nur lokales Inspector-UI: Timeline-Karten und Detailansicht koennen den verknuepften Event im Workspace selektieren und damit den Globe-Fokus triggern; vollstaendige Story-/Kamera-Orchestrierung fehlt weiter
- [~] **RR.12a** — Timeline-Zeitfenster ist nicht mehr nur frei gebrushed: Presets `24H/7D/1M/ALL` existieren jetzt code-seitig fuer schnelle Analysten-Fokuswechsel und schreiben in einen eigenen `timelineViewRangeMs`-State statt direkt in das aktive Replay-Fenster; ein separater `timelineSelectedTimeMs`-Pfad ist ebenfalls vorhanden. Browser-/UX-Verify bleibt offen
- [~] **RR.13** — Filterzustand ist nicht mehr nur Toolbar-/Hook-Implizitwissen: ein kleiner `geo-filter-contract` traegt jetzt Filter-Snapshot, aktive Filter-Chips, sichtbare Event-Selektion und abgeleitete Timeline-Visibility mit Tests; offene Candidates und Region-News folgen im sichtbaren Workspace inzwischen ebenfalls demselben Such-/Regionsvertrag statt nur Replay-Fenstern. Die vollstaendige MapFilterEngine ueber alle Geo-Datasets fehlt trotzdem noch

---

## 10. Querverweise

| Frage | Dokument |
|:------|:---------|
| GeoMap Master-Spec | `docs/geo/GEOMAP_OVERVIEW.md` |
| GeoMap Product/Policy | `docs/geo/GEOMAP_PRODUCT_AND_POLICY.md` |
| GeoMap Data Contracts | `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` |
| GeoMap Ontologie / Graph Runtime | `docs/geo/GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md` |
| GeoMap Sources/Provider Policy | `docs/geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md` |
| GeoMap Foundation | `docs/geo/GEOMAP_FOUNDATION.md` (Basemap, Geocoding, PMTiles, Rendering) |
| GeoMap Verify | `docs/geo/GEOMAP_VERIFY_GATES.md` (E2E, Draw, Save-Fehlerpfad, Performance-Baseline) |
| GeoMap Options | `docs/geo/GEOMAP_MODULE_CATALOG.md` (d3-Module, Feature→Module-Matrix) |
| Memory-Gesamtarchitektur (KG-Basis) | `docs/MEMORY_ARCHITECTURE.md` |
| Externe Referenzreview (Pharos AI) | `docs/geo/PHAROS_AI_REVIEW.md` |
| Externe Referenzreview (Crucix) | `docs/geo/CRUCIX_AI_REVIEW.md` |
| Externe Referenzreview (WorldWideView) | `docs/geo/WORLDWIDEVIEW_AI_REVIEW.md` |
| Externe Referenzreview (WorldMonitor) | `docs/geo/WORLDMONITOR_AI_REVIEW.md` |
| Externe Referenzreview (OGI) | `docs/geo/OGI_AI_REVIEW.md` |
| Externe Referenzreview (Shadowbroker) | `docs/geo/SHADOWBROKER_AI_REVIEW.md` |
| Externe Referenzreview (Sovereign Watch) | `docs/geo/SOVEREIGN_WATCH_AI_REVIEW.md` |
| Externe Referenzreview (Conflict Globe GL) | `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md` |
| Externe Referenzreview (GeoSentinel Frontend) | `docs/geo/External_GEOSENTINEL_FRONTEND_REVIEW.md` |
| Gesamtroadmap | [`../EXECUTION_PLAN.md`](../EXECUTION_PLAN.md) |

---

## 11. Evidence Requirements

Fuer jeden geschlossenen GeoMap-Punkt mindestens:

- Item-ID (`FD.*`, `V.*`, `M.*`, `4.G*`, `D.*`, `E.*`, `F.*`, `API.*`, `T.*`, `SOTA.*`)
- reproduzierbarer Ablauf (UI/API/Test)
- erwartetes und beobachtetes Ergebnis
- Referenz auf betroffenes Owner-Dokument aus `docs/geo/*`

---

## 12. Propagation Targets

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md` (falls Runtime-/Boundary-Realitaet betroffen)
- `docs/geo/GEOMAP_VERIFY_GATES.md`
- `docs/geo/GEOMAP_ROADMAP_AND_MILESTONES.md`
- `docs/geo/GEOMAP_PRODUCT_AND_POLICY.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `docs/geo/GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md`
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/geo/OGI_AI_REVIEW.md`
- `docs/geo/WORLDMONITOR_AI_REVIEW.md`
- `docs/geo/SHADOWBROKER_AI_REVIEW.md`
- `docs/geo/SOVEREIGN_WATCH_AI_REVIEW.md`
- `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md`
- `docs/geo/External_GEOSENTINEL_FRONTEND_REVIEW.md`
- `docs/specs/execution/graph_execution_delta.md`
- `docs/specs/execution/backend_geomap_delta.md`

---

## 12a. Cross-Surface Findings (Research / Event / Geo)

- [ ] **XS.1** - GeoMap-Event- und Drilldown-Bausteine als vorhandene Cross-Surface-Assets dokumentieren: bestehende Geo-Event-BFFs (/api/geopolitical/events, /api/geopolitical/events/[eventId], Assets-/Sources-Unterpfade), EventInspector und Workspace-Selection koennen den Pfad Research -> Event -> Geo tragen und sollen vor neuer Parallel-UI wiederverwendet werden
- [ ] **XS.2** - GeoMap-Datenladepfad als Architekturhinweis festhalten: useGeopoliticalWorkspaceData.ts orchestriert derzeit mehrere manuelle fetch-Aufrufe mit no-store trotz globalem Query-Client/defaultOptions; fuer neue Frontend-Surfaces keine ungepruefte Copy-Paste-Uebernahme dieses Musters, sondern Query-/Contract-first mit explizitem Degradation- und Cache-Verhalten

---

## 13. Exit Criteria

- Gate-A (`4.G1-4.G4`) ist geschlossen oder bewusst deferred mit Owner/Datum
- Milestones D/E/F haben klaren Status pro Item
- API-/Test-Restpunkte sind in Evidence nachvollziehbar
