# GeoMap Closeout & Offene Punkte

> **Stand:** 13. Maerz 2026
> **Zweck:** Arbeits-Checkliste und Verify-Gates fuer GeoMap Phase-4-Closeout und
> alle offenen Punkte aus den gesplitteten GeoMap-Specs unter `docs/geo/`.
> **Master-Spec:** [`../../geo/GEOMAP_OVERVIEW.md`](../../geo/GEOMAP_OVERVIEW.md)

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
- `docs/MEMORY_ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`

### Arbeitsprinzip

- GeoMap-Arbeit wird nur als "geschlossen" markiert, wenn Verify + Produkt-/Policy-Owner konsistent sind.
- Root- und Geo-Owner-Dokumente sind Pflicht-Lektuere, nicht optionales Beiwerk.

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

### 0.5 GEOMAP_PRODUCT_AND_POLICY + ROADMAP

- [ ] **M.1** — UX offen (Sek. 5): Keyboard Shortcuts 9.3, Accessibility 9.4, Multi-Select 9.2
- [ ] **M.2** — Milestone C (sources): soft-signal adapter scaffolds, perf + a11y pass
- [ ] **M.3** — Milestone D: anti-noise alerting UI, perf + a11y pass
- [ ] **M.4** — Milestone E: geospatial stack upgrade, advanced filters/search
- [ ] **M.5** — Milestone F: Shell-Refactoring, Keyboard Shortcuts, Export, Timeline Playback, Multi-Select, Asset-Link-UI, Seed-Datensatz, ReliefWeb, Reddit
- [ ] **M.6** — Proposed defaults (Sek. 29): sort, asset edits owner-only, export, timeline
- [ ] **M.7** — Feedback-Driven Review (Sek. 3): System-Klassifikation, Analysten-Entscheidungen, Collaborative Review — OFFEN
- [ ] **M.8** — SOTA-Backlog (Sek. 35): Policy-as-Code, Evaluation Harness, Explain-Why, OffscreenCanvas/supercluster Worker
- [ ] **M.9** — Externe Referenzreview-Dokumente gepflegt (aktuell: `PHAROS_AI_REVIEW.md`) und gegen GeoMap-Roadmap gespiegelt
- [~] **M.10** — `pharos-ai` Monitoring (`2026-03-12` bis `2026-03-13`) verfolgt: oeffentlicher `agent/`-Ordner plus relevante Agent-Commits (`b65d678`, `a5aa8b2`, `a1d613b`) sind sichtbar; vollstaendiger ingest-/datafetch-/agent-runtime layer bleibt weiter Beobachtungspunkt, Folgeentscheid fuer Flat/Conflict-Vorbau dokumentiert

### 0.6 GEOMAP_MODULE_CATALOG

- [ ] **O.1** — d3-Module v1.1: d3-scale, d3-scale-chromatic, d3-interpolate, d3-transition, d3-timer, d3-ease (falls noch nicht installiert)
- [ ] **O.2** — Severity Heatmap: hardcoded → scaleSequential + interpolateYlOrRd (`GEOMAP_MODULE_CATALOG.md` Sek. 2.1)
- [ ] **O.3** — Animation: setInterval → d3.timer (Frame-synchron, `GEOMAP_MODULE_CATALOG.md`)
- [ ] **O.4** — d3-Module v1.5 (Game Theory + Timeline): d3-hierarchy, d3-shape, d3-brush, d3-axis, d3-legend, d3-annotation
- [ ] **O.5** — Feature→Module-Matrix (Sek. 10): Regime-State Layer, CBDC Status, Financial Openness, etc. prüfen
- [x] **O.6** — Flat/Regional-Analystenmodus im Modul-Katalog normativ gespiegelt (deck.gl / MapLibre / PMTiles als Second-Mode, nicht Globe-Replacement)
- [ ] **O.7** — Externe Referenz-Reviews in Modulentscheidungen gespiegelt (aktuell: `PHAROS_AI_REVIEW.md`)
- [ ] **O.8** — Replay-/Timeline-Module normativ gespiegelt: `d3-brush`, `d3-axis`, `d3-array`, `d3-shape` fuer Conflict-Replay und Story-Zeitfenster
- [x] **O.9** — View-Handoff-Matrix im Modul-Katalog gespiegelt: Region-/Story-/Draw-Area-Handoffs mit shared Payload statt Toggle-only
- [x] **O.10** — Layer-Taxonomie im Modul-Katalog gespiegelt: Geo Core / Conflict / Macro-State / Context / panel-first Signale fuer Globe vs. Flat

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
- [~] **E.3** — Flat/Regional Analyst View als eigener Render-Modus begonnen: `flat-view-state.ts` definiert einen expliziten `viewMode="flat"`-Scaffold mit Bounds, Focus, Filter-Snapshot, Temporal-State, Layer-Familien und Basemap-Policy. Der gemeinsame Geo-Workspace-Store traegt `mapViewMode = globe|flat`, `flatViewState` und einen `applyPendingFlatViewHandoff()`-Pfad. Ein erster sichtbarer Flat-Scaffold mit MapLibre-Viewport, Bounds-Fit, ersten Event-Punkten aus dem sichtbaren Workspace-Vertrag und Rueckweg zum Globe ist vorhanden; richer tiles, echte Conflict-Layer und Browser-Verify bleiben offen.
- [~] **E.4** — deck.gl + MapLibre als optionaler Zweitmodus begonnen: der Flat-Scaffold traegt `renderer="deckgl-maplibre"` als explizite Boundary; zusammen mit `flat-view-handoff.ts`, `layer-taxonomy.ts`, `basemap-richness.ts` und dem Store-Apply-Pfad ist die Daten-/Layer-/Basemap-Grenze fuer den Second-Mode typisiert. Ein erster sichtbarer MapLibre-Viewport sowie eine separate deck.gl-Overlay-Boundary fuer Bounds-Hervorhebung und gefilterte Event-Punkte sind vorhanden. Reale Conflict-Layer, PMTiles-Hintergrund und Browser-Verify bleiben offen.
- [~] **E.5** — PMTiles-Einsatz fuer Flat/Regional-Mode begonnen: `pmtiles` ist im Frontend installiert und in `basemap-richness.ts` als bevorzugter Tile-Pfad fuer den spaeteren Earth-Flat-Mode gespiegelt. Reale Attribution-/Hosting-/Browser-Verify gegen `PMTILES_CONTRACT.md` bleibt offen.
- [x] **E.6** — zentrale MapFilterEngine fuer v2-Core geschlossen: der shared `geo-filter-contract` kapselt Filter-Snapshot, aktive Filter-Chips, sichtbare Event-Selektion und davon abgeleitete Timeline-Visibility fuer den aktuellen Globe-/Workspace-Pfad. Game-Theory, region-getaggte Context-Items, offene Candidates und Region-News folgen jetzt demselben sichtbaren Such-/Regions-/Severity-Arbeitszustand. Eine noch breitere view-agnostische Engine ueber spaetere Conflict-/Flat-/Macro-Spezialobjekte ist Folgearbeit nach v2 und kein Blocker mehr fuer den v2-Abschluss.
- [ ] **E.7** — Overlay-Chrome-Contract gescoped (`timeline`, `filters`, `legend`, Panels getrennt von Daten-Layer-Toggles)
- [ ] **E.8** — Advanced Drawing UX fuer Globe gescoped: Vertex-/Handle-Editing, Snapping, Hover/Selection-States, Box/Lasso/Multi-Select, sichtbarer Command-Stack
- [ ] **E.9** — Drawing-/Selection-Boundary fuer spaeteren Flat/Regional-Mode definiert (welche Edit-Patterns nur dort gelten, welche shared bleiben)
- [x] **E.10** — Temporal Contract fuer v2-Core geschlossen: `timelineViewRangeMs` trennt das sichtbare Timeline-Fenster sauber vom aktiven Replay-/Filterfenster (`activeReplayRangeMs`), `timelineSelectedTimeMs` fuehrt den optionalen Cursor-/Selected-Time-Begriff im Workspace-State, Domain-Wechsel clampen sichtbares Zeitfenster sowie Selected-Time wieder auf gueltige Werte, und das Timeline-UI macht die Beziehung zwischen sichtbarem Fenster und aktivem Filterfenster explizit (`neutral/view_only/filter_only/linked/independent`). Playback treibt Selected-Time nur noch im aktiven Playback-Pfad. Weitergehende Story-/Conflict-Spezialfaelle bauen auf diesem Vertrag auf, blockieren den v2-Abschluss aber nicht mehr.
- [ ] **E.11** — Multi-Renderer-Contract fuer v2/v2.5 definiert: Globe (`d3-geo`) und spaeterer Flat-Mode (`deck.gl/MapLibre`) teilen dieselben Domain-/Layer-/Story-/Filter-Contracts
- [~] **E.12** — View-Handoff-Contract fuer Flat/Regional begonnen: ein renderer-neutraler `flat-view-handoff`-Vertrag definiert jetzt Bounds, aktives Zeitfenster, Filter-Snapshot, Focus-Objekt und Layer-Hints fuer Event-, Story-, Region-, Cluster-, Draw-Area- und explizite Bounds-Handoffs. Der gemeinsame Store kann diese Handoffs jetzt in einen expliziten `flatViewState` uebernehmen; Event Inspector, Timeline-/Story-Detail, Region-News, ausgewaehlte Drawings, Cluster-Drilldowns und ein Header-Fallback koennen den Flat-Workspace bereits ansteuern. Reale Renderer-Integration und Browser-Verify bleiben offen.
- [x] **E.13** — Layer-Taxonomie fuer Globe vs. Flat definiert: `layer-taxonomy.ts` fuehrt jetzt einen typisierten Katalog fuer `geo-core`, `conflict`, `macro-state`, `context` und `panel-first` ein, inklusive Placement (`shared`, `globe-first`, `flat-first`, `panel-first`), View-Support und default-/handoff-orientierter Layer-Hints. `flat-view-handoff.ts` nutzt diese Hints bereits als gemeinsamen Flat-Vorbau.
- [x] **E.14** — Basemap-Richness-Policy fuer Globe vs. Flat definiert: `basemap-richness.ts` kapselt den normativen Unterschied zwischen reduziertem Earth-Globe (`countries/graticule/place/water/waterway`, keine PMTiles/MapLibre) und spaeter reichhaltigerem Earth-Flat-Mode (`terrain/roads/admin-detail/poi` optional, PMTiles/MapLibre erlaubt). Moon bleibt fuer v2 in beiden Richtungen explizit deferred.
- [~] **E.15** — sichtbare Flat-Renderer-Boundary begonnen: erster MapLibre-Viewport plus separate deck.gl-Overlay-Boundary fuer Bounds und erste Event-Punkte vorhanden; echter layer-driven Payload-Pfad fuer weitere Flat-Layer bleibt offen
- [ ] **E.16** — reale PMTiles-/Basemap-Integration fuer Flat definieren und anbinden: Style, Attribution, Hosting, Basemap-Minimum und Browser-Verify gegen `PMTILES_CONTRACT.md`

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
- [ ] **F.9** — Shared Layer Contract fuer Globe + Flat definiert (Story, Filter, Timeline, Selection, Layer IDs)
- [ ] **F.10** — Shared Map Payload Contract fuer Globe + Flat definiert (view-agnostisch, renderer-driven)
- [~] **F.19** — Flat-Handoff-UX begonnen: Event-Inspector, Timeline-/Story-Detail, Region-News, Cluster-Drilldowns und ausgewaehlte Drawings besitzen jetzt kontextuelle `Open in flat view`-Einstiege; ein Header-Button bleibt nur als Experten-/Fallback-Pfad. Echter Browser-Verify bleibt offen.
- [ ] **F.20** — Globe-Layer-Curation fuer v2.5 vorbereitet: strategischer Default-Datensatz definiert, damit der Globe nicht mit spaeteren Conflict-Layern ueberladen wird
- [ ] **F.21** — Flat-Selection-/Detail-Contract fuer operative Objekte definieren: `strike`/`target`/`asset`/`zone`/spaetere Conflict-Objekte bekommen eigenen, aber shared-faehigen Detailvertrag
- [ ] **F.22** — Flat-Layer-Chrome ausbauen: dedizierte Flat-Layer-Toggles, Legend/Filter/Timeline im Analystenmodus getrennt von Globe-spezifischem Chrome
- [ ] **F.23** — Flat-Replay-/Timeline-UX auf Histogramm-/Bucket-Modell heben: Brush/Story/Playback fuer dichte regionale Datensaetze, nicht nur Globe-Timeline weiterverwenden
- [ ] **F.24** — Flat-Conflict-Layer einfuehren: mindestens `strikes`, `targets`, `assets`, `zones`, `heat`; `missiles`/Arcs optional im Folgeblock
- [x] **F.11** — Replay-/Timeline-Controller fuer v2-Core geschlossen: `TimelineStrip` publiziert ein effektives Replay-Fenster in den Workspace-Store; Karte, Timeline, Region-News, Context-Feed, Candidate Queue und Game-Theory folgen demselben sichtbaren Arbeitszustand. Timeline-Auswahl kann den verknuepften Event im Workspace selektieren, und sichtbare Timeline-Eintraege sind am aktiven Filtervertrag ausgerichtet. Manueller Browser-Verify bleibt separat offen.
- [x] **F.12** — Story-/Camera-Aktivierung fuer v2-Core geschlossen: Event-Selektion kann den Globe ueber den `viewport-focus`-Contract auf den relevanten Ort animieren. Timeline-Details koennen den verknuepften Event-Fokus ebenfalls ausloesen, Timeline-/Workspace-Reset stoesst einen neutralen Viewport-Reset an, und der Timeline-/Selection-Fokus laeuft ueber `geo-story-focus` statt nur implizit ueber Shell-Effekte. `Apply story window` setzt Fokus-Event, sichtbares Zeitfenster und aktives Filterfenster gemeinsam; wiederverwendbare Story-Presets leben im gemeinsamen Workspace-State, besitzen einen expliziten Active-Preset-Pfad, koennen beim Anwenden die Timeline-Selektion wiederherstellen und uebernehmen den Regionskontext fuer verknuepfte Events belastbar aus dem Event-Datensatz. Browser-Verify bleibt separat offen.
- [x] **F.18** — Story-/Timeline-Reset-Vertrag fuer v2-Core geschlossen: `TimelineStrip` hat einen neutralen Reset fuer Playback, Brush und Cursor ueber einen Shared Helper, loest Timeline-/Event-Fokus im Workspace, leert die Timeline-Selektion, setzt ein aktives Story-Preset bewusst auf `null` und setzt den Globe ueber `viewportResetNonce` wieder in den neutralen Viewport. Der Arbeitszustand zwischen sichtbarem Zeitfenster und aktivem Filterfenster ist explizit im UI modelliert. Browser-/Live-Nachweis bleibt separat offen.
- [x] **F.13** — Overlay-Chrome-Visibility von Daten-Layer-Visibility sauber getrennt (`showFiltersToolbar`, `showBodyLayerLegend`, `showTimelinePanel` im Store; eigene Toggles im linken Panel; Filterbar, Legend-Overlay und Timeline-Workspace separat schaltbar)
- [x] **F.14** — generischer Selection-/Detail-Contract fuer v2-Core geschlossen: ein gemeinsamer Selection-Summary-Helper traegt Event Inspector, Marker-Liste, Timeline-Detail, Candidate Queue, Conflict Context und Region-News. Timeline-Details tragen explizit `linkedEventId`, koennen den Workspace-Fokus auf den verknuepften Event ziehen, leben ueber `selectedTimelineId` im gemeinsamen Workspace-State, und Story-Presets koennen diese Timeline-Selektion wiederherstellen. Unsichtbar gewordene Timeline-Selektion wird bereinigt, statt stale im Workspace zu bleiben. Zusaetzliche Conflict-Spezialobjekte fuer den spaeteren Flat-Mode sind Folgearbeit und kein Blocker mehr fuer v2-Core.
- [~] **F.15** — Responsive Analyst-Layouts begonnen: Mobile-Einstieg kollabiert beide Sidebars standardmaessig, vermeidet parallele linke/rechte Panel-Offen-Zustaende auf kleinen Viewports, hebt Floating-Panel-Offsets ueber den Footer und deaktiviert Resize-Griffe auf Mobile. Landscape-/Tablet-Finetuning, Timeline-/Modal-Layout und Browser-Verify bleiben offen.
- [~] **F.16** — Marker-Placement-/Edit-UX begonnen: neutraler Cursor-Modus als Default, klare Schritt-Hinweise, Viewport-Status-Chrome und robuste manuelle Koordinatenvalidierung vorhanden; Preview/Snapping/Selection-Hardening bleiben offen
- [~] **F.17** — Drawing-Werkzeuge begonnen: Cursor-Modus, kontextabhaengige Workflow-Hinweise, Viewport-Status-Overlay und besserer Neutralzustand vorhanden; Vertex-Handles, Edit-Mode, Geometry-Feedback und sichtbare Undo/Redo-Historie bleiben offen

---

## 5. API / Backend

- [ ] **API.1** — `POST /api/geopolitical/candidates/:id/review` (GeoAnalystFeedback Body)
- [ ] **API.2** — `GET /api/geopolitical/feedback/metrics`
- [ ] **API.3** — `GET /api/geopolitical/feedback/disagreements`
- [ ] **API.4** — Metadata-first-/legal-safe source persistence fuer GeoMap verifiziert (keine unzulaessige Volltext-Speicherung)
- [ ] **API.5** — Source-health / provider-outage / rate-budget-Verhalten fuer GeoMap-Routen owner-konsistent dokumentiert
- [ ] **API.6** — Search-Around-API-Vertrag liefert typisierte Graph-Ergebnisse (`nodes`, `edges`, `time_window`, optionale `metrics`) fuer Globe/Flat/Panels konsistent
- [ ] **API.7** — Writeback-Endpoints erzwingen Audit-/Evidence-Felder (`actor`, `reason`, `old/new`, `policy decision`, `timestamp`) fuer Geo-Mutationen

---

## 6. Tests

- [ ] **T.1** — Unit: scoring logic, dedup logic, state transitions, schema validation
- [ ] **T.2** — Integration: ingestion → candidate → review → persistence, timeline append
- [ ] **T.3** — E2E: draw + marker workflow, candidate review lifecycle, region click → filtered feed, timeline interactions
- [ ] **T.4** — View-Consistency-Test: gleicher Datensatz wird in Globe und Flat konsistent gefiltert / selektiert / erzählt
- [~] **T.5** — Replay-/Timeline-Test: Zeitfenster-Filter beeinflusst Karte, Listen und Story-Highlights konsistent; Unit-Coverage fuer Replay-Window, Timeline-Presets und filter-contract-getriebene Sichtbarkeit fuer Events, Timeline, Candidates und Region-News ist vorhanden, Browser-/E2E-Gate bleibt offen
- [~] **T.11** — Temporal-Contract-Test begonnen: Unit-Coverage fuer Presets, neutralen Reset-Zustand sowie getrennten Timeline-View-, Selected-Time- und Replay-Range-State vorhanden; Domain-Clamping fuer sichtbares Zeitfenster und Selected-Time ist jetzt ebenfalls getestet, ein kleiner `timeline-window-contract` deckt die explizite Beziehung zwischen sichtbarem Zeitfenster und aktivem Filterfenster ab, und `buildGeoTimelineTimeFocus`/`geo-story-focus` sichern den ersten Story-Autofit-Pfad plus wiederverwendbare Story-Presets auf Helper-Ebene ab. Der Workspace-Store traegt jetzt ausserdem ein explizites `activeStoryFocusPresetId`, inklusive Reset- und Remove-Verhalten; Story-Presets stellen beim Anwenden auch die Timeline-Selektion wieder her. Browser-Verify fuer den Story-/Temporal-Contract bleibt offen
- [ ] **T.6** — Overlay-Chrome-Test: Ausblenden von Timeline/Legend/Filters beeinflusst keine Daten-Layer und umgekehrt
- [~] **T.7** — Keyboard-/Focus-Test begonnen: reiner Shortcut-Decision-Test deckt Editierfeld-Schutz, Delete-Prioritaet und Undo/Redo-Kontext ab; echter Browser-/Fokus-Reihenfolge-Verify bleibt offen
- [ ] **T.8** — Provider-Outage-/Source-Health-Test: UI-State fuer Rate-Budget/Outage/Partial-Data bleibt deterministisch
- [ ] **T.9** — Drawing-Interaction-Test: Marker/Line/Polygon/Text plus Edit/Undo/Redo/Selection bleiben ueber mehrere Schritte konsistent
- [ ] **T.10** — Multi-Select-/Bulk-Interaction-Test: Box/Lasso/Mehrfachselektion und Bulk-Aktionen bleiben deterministisch
- [ ] **T.12** — Export-Consistency-Test: JSON/CSV und PNG/PDF spiegeln denselben gefilterten/sichtbaren GeoMap-Zustand
- [~] **T.13** — View-Handoff-/Flat-Scaffold-Tests begonnen: Unit-Coverage prueft Event-, Story-, Region-, Cluster-, Draw-Area- und Bounds-Handoffs auf deterministische Bounds, Zeitfenster-, Filter- und Focus-Uebergabe; `flat-view-state.test.ts` deckt den renderer-neutralen Flat-Scaffold fuer `deckgl-maplibre` inklusive Layer-Familien und Basemap-Policy ab, `store.test.ts` prueft den gemeinsamen Apply-Pfad von `pendingFlatViewHandoff` in den expliziten Flat-Workspace-State, und die UI besitzt jetzt einen sichtbaren MapLibre-Viewport samt separater deck.gl-Overlay-Boundary fuer Bounds und erste Event-Punkte. Browser-/Renderer-Integration bleibt offen
- [ ] **T.14** — Flat-Handoff-Interaction-Test: Event-Inspector-, Timeline-/Story-, Region-, Cluster- und Drawing-Einstiege setzen denselben Flat-Workspace-State deterministisch und halten den Rueckweg zum Globe konsistent
- [ ] **T.15** — Flat-Layer-Payload-Test: sichtbare Event-/Conflict-Layer im Flat-Mode werden aus gemeinsamen Domain-Daten deterministisch in renderer-taugliche Payloads transformiert
- [ ] **T.16** — Flat-Replay-/Bucket-Timeline-Test: regionale Konfliktdichte, Bucket-Bildung, Story-Fokus und Layer-Visibility bleiben im Flat-Mode konsistent
- [ ] **T.17** — Ontologie-/Graph-Contract-Test: Relationstypen, Traversal-Depth, Zeitfenster und Confidence-Verhalten bleiben in Search-Around reproduzierbar
- [ ] **T.18** — GeoTrack-/Interpolation-Test: `LINEAR|NEAREST|PREVIOUS|NEXT|NONE` verhalten sich in Replay/Story deterministisch und explizit
- [ ] **T.19** — Geo-Writeback-Audit-Test: Kartenmutationen erzeugen append-first Audit-/Timeline-Eintraege mit vollstaendigen Evidence-Metadaten

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
- [~] **SOTA.14** — Contextual Handoff UX begonnen: Event-Inspector, Timeline-/Story-Detail, Region-News, Cluster-Drilldowns und ausgewaehlte Drawings tragen bereits kontextuelle Einstiege; Browser-/Flat-Renderer-Abnahme bleibt der naechste Ziel-UX-Block vor dem Flat/Conflict-Mode
- [ ] **SOTA.15** — layer-driven Flat-Conflict-Workspace wie in starken Referenzen: typed payloads, zentrale Filter-Engine, Replay-/Story-Kopplung und operative Selection/Detail-Ansicht
- [ ] **SOTA.16** — Geo-Ontologie als eigener Runtime-Owner etabliert: Search-Around, geotemporale Tracks und Writeback-Audit sind dokumentiert und gate-gefuehrt

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

**Ops:**
- [~] alert routing test (Route vorhanden, kein UI, kein E2E-Test)

---

## 9. Infrastruktur-Lücken

- [ ] **INF.1** — Daten-Density: ACLED/GDELT Credentials klaeren
- [ ] **INF.2** — LLM-Summary-Gap: NLP-Pipeline fuer echte Zusammenfassung
- [ ] **INF.3** — Persistence: Zeichnungen/Marker von localStorage nach Prisma migrieren
- [ ] **INF.4** — Zombie-Processes (Windows Dev): Go-Gateway sauberes Shutdown
- [~] **INF.5** — Externes Referenz-Monitoring: `pharos-ai` Agent-Artefakte (`2026-03-12` bis `2026-03-13`) geprueft; aktuell oeffentlich sind `agent/`-Mirrors plus Doctrine-/Admin-Workflow-Bausteine, aber noch kein vollstaendiger ingest-/datafetch-/agent-runtime layer. Weitere Auswirkungen auf Conflict-/Source-Layer bleiben zu beobachten
- [ ] **INF.6** — Source-Bias-/Cross-Bias-Operationalisierung fuer GeoMap-Candidates geplant (mindestens als Rules-/Review-Backlog)

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
| Externe Referenzreview | `docs/geo/PHAROS_AI_REVIEW.md` |
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

---

## 13. Exit Criteria

- Gate-A (`4.G1-4.G4`) ist geschlossen oder bewusst deferred mit Owner/Datum
- Milestones D/E/F haben klaren Status pro Item
- API-/Test-Restpunkte sind in Evidence nachvollziehbar
