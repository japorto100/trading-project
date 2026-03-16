# Graph Execution Delta

> **Stand:** 16. Maerz 2026  
> **Zweck:** Dedizierter Execution-Owner fuer Graph-spezifische Arbeit (Contracts, Runtime, UI-Interaktion, Verify), getrennt von GeoMap-Backend- und non-graph Runtime-Themen.  
> **Referenzbasis:** `docs/geo/OGI_AI_REVIEW.md`, `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md` + OGI-/conflict-globe.gl-Extraktionen

---

## 0. Execution Contract

### Scope In

- Graph-Domain-Contract (Nodes/Edges/Traversal/Search-Around-Ergebnisse)
- Graph-UI-Interaktion (Selection, Focus, Context Actions, Filter, Timeline-Kopplung)
- Graph-Runtime-Boundaries (State, Reducer, Event-Sync, Graph-Layouts)
- Graph-spezifische Verify-Gates und Testpflichten

### Scope Out

- GeoMap-Provider-/Source-Policy und geocoder-/outage-spezifische Regeln
- allgemeine Agent-/Control-Runtime-Hardening-Slices ohne Graph-Bezug
- produktionsnahe Backend-Persistenzentscheidungen ausserhalb Graph-Contracts

### Mandatory Upstream Sources

- `docs/geo/OGI_AI_REVIEW.md`
- `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md`
- `docs/geo/GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `docs/specs/execution/geomap_closeout.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/ARCHITECTURE.md`

### Referenzpfade (extern)

- OGI Clone: `D:/tradingview-clones/_tmp_ref_review/geo/ogi`
- OGI Graph-UI Bundle: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/graph/ogi/graph-ui`
- OGI Graph-Backend Bundle: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/graph/ogi/graph-backend`
- conflict-globe.gl Clone: `D:/tradingview-clones/_tmp_ref_review/geo/conflict-globe.gl`
- conflict-globe.gl Extraction: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/conflict_globe_gl`
- conflict-globe.gl Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/conflict_globe_gl/extraction_manifest.txt`

---

## 1. Offene Deltas

- [ ] **GX.1** — Graph-Canonical-Contract festziehen (`node`, `edge`, `relation_type`, `confidence`, `time_window`, `provenance`)
- [ ] **GX.2** — Search-Around-Result-Shape normativ fixieren (`nodes`, `edges`, `time_window`, optionale `metrics`) fuer UI/BFF/Gateway-Konsistenz
- [ ] **GX.3** — Graph-Selection-Vertrag vereinheitlichen (single, multi, box/lasso, inspector-focus, timeline-focus)
- [ ] **GX.4** — Graph-Context-Actions normativ festziehen (allowed actions, audit hooks, guardrails, role-boundaries)
- [ ] **GX.5** — Graph-Layout-Strategie vertraglich definieren (default, pinning, stability, deterministic fallback)
- [ ] **GX.6** — Graph↔Timeline-Kopplung vertraglich fixieren (selection sync, reset semantics, replay window impact)
- [ ] **GX.7** — Graph-Filter-Contract finalisieren (query, type, source, severity, temporal filter) inkl. chip/summary-state
- [ ] **GX.8** — Graph-Performance-Baseline definieren (node/edge targets, frame budget, interaction latency)
- [ ] **GX.9** — Graph-Error-/Degradation-Modell fuer UI und BFF angleichen (no silent failure, clear fallback)
- [ ] **GX.10** — OGI-Pattern-Mapping dokumentieren (`adopt-as-is`/`adapt-mit-wrapper`/`reference-only`) nur fuer graph-relevante Bausteine
- [ ] **GX.11 (Evaluate)** — conflict-globe.gl als Visual-Graph-Referenz evaluieren: `arcs`/`paths`/`rings`/`hexbin`/`heatmap` in GeoMap-Layer-Taxonomie mappen (inkl. Performance- und Explainability-Bewertung)
- [ ] **GX.12 (Evaluate)** — conflict-globe.gl-Graph-Befund normativ festhalten: kein KG-Backend-Stack (kein Neo4j/RDF/SPARQL) und Entscheidung als `visual-graph-only` oder `augment-with-kg-backend` dokumentieren
- [ ] **GX.13 (Evaluate)** — conflict-globe.gl-Timeline/Search/Selection-Kopplung gegen GeoMap-Graph-Interaction-Contract evaluieren (Reset-Semantik, State-Kopplung, Regression-Risiko)

---

## 2. Verify-Gates

### Code-complete

- [ ] **GX.V1** — Graph-Contract-Typen zentral vorhanden und in allen graph-relevanten UI-Pfaden genutzt
- [ ] **GX.V2** — Selection-/Focus-Verhalten deterministisch fuer click, multi-select, box/lasso, reset
- [ ] **GX.V3** — Filter-/Timeline-/Selection-Sync ohne stale state oder implizite Seiteneffekte
- [ ] **GX.V4** — Context-Actions folgen Guardrails und liefern konsistente Fehler-/disabled-Zustaende
- [ ] **GX.V5** — Graph-Layouts sind reproduzierbar (inkl. pinned nodes und fallback behavior)
- [ ] **GX.V10 (optional)** — Visual-Graph-Overlays aus conflict-globe.gl rendern reproduzierbar und vertragskonform (Arc/Path/Ring/HexBin/Heatmap) ohne stille Inkonsistenzen zu Timeline/Inspector

### Live-Verify

- [ ] **GX.V6-LV** — Graph-Interaktion bleibt bei hoher Dichte bedienbar (Pan/Zoom/Select/Context)
- [ ] **GX.V7-LV** — Timeline-Handoff in Graph funktioniert reproduzierbar vorwaerts/rueckwaerts
- [ ] **GX.V8-LV** — Degradation bei fehlenden Daten/Teil-Ausfall klar sichtbar und ohne crash
- [ ] **GX.V9-LV** — End-to-end Search-Around Ergebnis stimmt mit sichtbarer Graph-Darstellung ueberein

---

## 3. Testpflichten

- [ ] **GX.T1** — Unit: Graph-Contract-Validatoren und Mapper
- [ ] **GX.T2** — Unit: Selection-/Reducer-/Filter-Logik
- [ ] **GX.T3** — Unit: Layout-Determinismus (inkl. pinning/fallback)
- [ ] **GX.T4** — Integration: Graph + Timeline + Inspector synchronization
- [ ] **GX.T5** — E2E: zentrale Interaktionspfade (select, filter, context action, reset)
- [ ] **GX.T6 (optional)** — Contract-Comparison-Tests fuer conflict-globe.gl Visual-Graph-Muster gegen GeoMap-Graph-Contract (`nodes/edges/relations`, overlay payload, selection coupling)

---

## 4. Evidence Requirements

Fuer jeden geschlossenen Punkt mindestens:

- ID (`GX.*`, `GX.V*`, `GX.T*`)
- reproduzierbarer Ablauf
- erwartetes vs. beobachtetes Ergebnis
- Referenz auf Owner-Dokument(e)
- bei Live-Gates: Screenshot/Recording + kurze Messwerte

---

## 5. Propagation Targets

- `docs/specs/execution/geomap_closeout.md`
- `docs/specs/FRONTEND_ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/geo/GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md`
- `docs/geo/OGI_AI_REVIEW.md`
- `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md`

---

## 6. Exit Criteria

- alle `GX.1-GX.7` abgeschlossen oder sauber deferred mit Owner/Datum
- mindestens `GX.V1-GX.V5` code-complete nachgewiesen
- mindestens `GX.T1-GX.T4` vorhanden
- offene Live-Gates sind explizit im Folgeplan verankert

