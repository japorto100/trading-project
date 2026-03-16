# Backend GeoMap Delta

> **Stand:** 16. Maerz 2026  
> **Zweck:** Dedizierter Execution-Owner fuer GeoMap-Backend-Arbeit (API, Store, Policy, Audit, Degradation, Persistence), getrennt von Graph-UI- und Agent-Core-Slices.  
> **Referenzbasis:** `docs/geo/OGI_AI_REVIEW.md` (non-graph Runtime-Muster), `docs/geo/WORLDWIDEVIEW_AI_REVIEW.md`, `docs/geo/SHADOWBROKER_AI_REVIEW.md`, `docs/geo/SOVEREIGN_WATCH_AI_REVIEW.md`, `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md` + GeoMap-Owner-Dokumente  
> **Companion-Slice:** `execution/agent_geomap_bridge_delta.md` (Agent<->GeoMap Bridge, bewusst klein und integriert)

---

## 0. Execution Contract

### Scope In

- GeoMap-Backend-API-Vertraege (BFF/Gateway/downstream kompatibel)
- Source-/Provider-/Policy-konforme Backend-Pfade
- GeoMap-Store-/Persistence-/Projection-Pfade (events, timeline, map payloads)
- Writeback-Audit-/Evidence-Vertrag fuer Geo-Mutationen
- Backend-Degradation-/Outage-/Rate-Budget-Verhalten

### Scope Out

- Graph-UI-Interaktionsdesign (eigener Slice `graph_execution_delta.md`)
- generische Agent-Harness-Themen ohne GeoMap-Backend-Bezug
- tiefe Agent-Core-Orchestrierung ohne direkten GeoMap-Bridge-Bezug (siehe `agent_geomap_bridge_delta.md` und bestehende Agent-Slices)
- neue Produktphasen ausserhalb GeoMap-Owner-Roadmap

### Mandatory Upstream Sources

- `docs/geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `docs/geo/GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md`
- `docs/geo/GEOMAP_VERIFY_GATES.md`
- `docs/geo/OGI_AI_REVIEW.md`
- `docs/geo/WORLDWIDEVIEW_AI_REVIEW.md`
- `docs/geo/SHADOWBROKER_AI_REVIEW.md`
- `docs/geo/SOVEREIGN_WATCH_AI_REVIEW.md`
- `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md`
- `docs/specs/execution/geomap_closeout.md`
- `docs/specs/execution/agent_geomap_bridge_delta.md`
- `docs/specs/API_CONTRACTS.md`

### Referenzpfade (extern)

- OGI Clone: `D:/tradingview-clones/_tmp_ref_review/geo/ogi`
- OGI Mirror: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/ogi_mirror`
- OGI Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/ogi/extraction_manifest.txt`
- WorldWideView Clone: `D:/tradingview-clones/_tmp_ref_review/geo/worldwideview`
- WorldWideView Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/worldwideview/extraction_manifest.txt`
- Shadowbroker Clone: `D:/tradingview-clones/_tmp_ref_review/geo/Shadowbroker`
- Shadowbroker Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker/extraction_manifest.txt`
- Sovereign_Watch Clone: `D:/tradingview-clones/_tmp_ref_review/geo/Sovereign_Watch`
- Sovereign_Watch Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/sovereign_watch/extraction_manifest.txt`
- conflict-globe.gl Clone: `D:/tradingview-clones/_tmp_ref_review/geo/conflict-globe.gl`
- conflict-globe.gl Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/conflict_globe_gl/extraction_manifest.txt`

---

## 1. Offene Deltas

- [ ] **BG.1** — GeoMap-API-Vertragsmatrix konsolidieren (BFF -> Gateway -> Backend) inklusive Fehler-/degraded-shapes
- [ ] **BG.2** — Source-Metadata-first Persistenzpfad verifizieren (keine unzulaessige Volltextspeicherung)
- [ ] **BG.3** — Provider-Outage-/Rate-Budget-Handling in GeoMap-Routen normativ festziehen
- [ ] **BG.4** — Review-/Feedback-Routen (`/review`, `/feedback/metrics`, `/feedback/disagreements`) gegen Owner-Contracts angleichen
- [ ] **BG.5** — Search-Around-/Traversal-Backend-Vertrag gegen Ontologie-Owner festziehen (nodes/edges/time_window/metrics)
- [ ] **BG.6** — Writeback-Audit-Vertrag fuer Geo-Mutationen technisch erzwingen (`actor`, `reason`, `old/new`, `policy`, `timestamp`)
- [ ] **BG.7** — Timeline-/Projection-Pfade fuer Replay/Story/Panel konsistent machen (append-first, deterministic reads)
- [ ] **BG.8** — Degradation-Modell vereinheitlichen (partial outage, provider down, stale cache, fallback provenance)
- [ ] **BG.9** — GeoMap-Persistence-Migration planen (lokaler Zustand -> backend-owned persistence)
- [ ] **BG.10** — OGI-Runtime-Muster nur adapterbasiert in GeoMap-Backend uebertragen (kein 1:1 Import)
- [ ] **BG.11** — Agent-GeoMap-Bridge-Contract aus `agent_geomap_bridge_delta.md` in GeoMap-Backend-Routen gespiegelt (keine direkte Agent-Core-Kopplung)
- [ ] **BG.12 (Evaluate)** — WorldWideView-Playback-Contracts (`history`/`availability`) gegen GeoMap-Replay-/Timeline-Backend-Vertrag evaluieren (Contract-Fit, API-Shape, Degradation-Verhalten; kein direkter Import)
- [ ] **BG.13 (Evaluate)** — WorldWideView-Adapter-Resilience (`rate-limit`, `retry/backoff`, `key-verify`, `startup instrumentation`) als Kandidat fuer GeoMap-Provider-Pfade evaluieren (adopt/adapt/reference-only Entscheidung mit Evidence)
- [ ] **BG.14 (Evaluate)** — Shadowbroker-Fast/Slow-Payload-Strategie inkl. `ETag`/`freshness` als Kandidat fuer GeoMap-Endpoint-Cadence evaluieren (Latenz, Datenfrische, API-Komplexitaet)
- [ ] **BG.15 (Evaluate)** — Shadowbroker-Fetch-Resilience (`requests retry`, `curl fallback`, `domain circuit breaker`) fuer GeoMap-Ingestion evaluieren (Ops-Risiko, Portabilitaet, Security/Policy-Fit)
- [ ] **BG.16 (Evaluate)** — Shadowbroker-Degradation-/Provenance-Muster (`provider down`, `stale cache`, `fallback source`) auf ein einheitliches GeoMap-Error-/Degraded-Envelope mappen und als Option bewerten
- [ ] **BG.17 (Evaluate)** — Sovereign_Watch-Replay-/History-/Search-Contracts (`tracks/history/search/replay`) gegen GeoMap-Timeline-/Story-/Inspector-Backendvertrag evaluieren (Window-Validation, Limits, Envelope-Konsistenz)
- [ ] **BG.18 (Evaluate)** — Sovereign_Watch-Realtime-Pipeline (`historian` + `broadcast`) fuer GeoMap-Live-Streams evaluieren (Backpressure, Queueing, flush semantics, persist/live-Konsistenz)
- [ ] **BG.19 (Evaluate)** — Sovereign_Watch-Ingestion-Resilience (`multi_source_poller`, cooldown/backoff, arbitration, H3-priority) fuer GeoMap-Providerpfade evaluieren (adopt/adapt/reference-only mit Evidence)
- [ ] **BG.20 (Evaluate)** — Sovereign_Watch-Map-Worker-/Layer-Orchestrierungs-Patterns (`tak.worker`, `useEntityWorker`, layer builders) auf GeoMap-Flat/Globe-shared Payload-Contract mappen und Integrationsrisiko bewerten
- [ ] **BG.21 (Evaluate)** — conflict-globe.gl-Graph-Overlay-Patterns (`arcs`, `paths`, `rings`, `hexbin`, `heatmap`) auf GeoMap-Layer-Taxonomie und shared payload contract evaluieren (visual fit, perf cost, explainability)
- [ ] **BG.22 (Evaluate)** — conflict-globe.gl-Timeline/Search/Selection-Kopplung gegen GeoMap-Temporal-/Inspector-Contract evaluieren (state coupling, reset semantics, regression risk)
- [ ] **BG.23 (Evaluate)** — conflict-globe.gl-lightweight stream aggregation (`routes/conflicts` + socket broadcast interval) gegen GeoMap-Live-API-Formate evaluieren (cadence, cache/stale behavior, degraded envelope)

---

## 2. Verify-Gates

### Code-complete

- [ ] **BG.V1** — Alle GeoMap-Backend-Routen liefern konsistente Error-/Degraded-Envelope
- [ ] **BG.V2** — Source-/Provider-Policy wird serverseitig fuer relevante Pfade erzwungen
- [ ] **BG.V3** — Writeback-Auditfelder sind fuer mutierende Geo-Operationen verpflichtend
- [ ] **BG.V4** — Replay-/Timeline-/Event-Projektionen sind vertraglich und technisch konsistent
- [ ] **BG.V5** — Search-Around-/Graph-Result-Contracts sind stabil und typed
- [ ] **BG.V10** — Agent-GeoMap-Bridge-Policy (allowed actions, audit fields, degradation path) serverseitig erzwingbar
- [ ] **BG.V11 (optional)** — Evaluierte WorldWideView-/Shadowbroker-Muster liefern im GeoMap-API-Shape konsistente `success/error/degraded/provenance`-Antworten
- [ ] **BG.V12 (optional)** — Evaluierte Sovereign_Watch-Muster liefern im GeoMap-API-Shape konsistente `success/error/degraded/provenance/freshness`-Antworten (inkl. replay/history/live)
- [ ] **BG.V13 (optional)** — Evaluierte conflict-globe.gl-Muster liefern im GeoMap-API-/Layer-Shape konsistente `success/error/degraded/provenance`-Antworten und reproduzierbare graph-overlay payloads

### Live-Verify

- [ ] **BG.V6-LV** — Provider-Ausfall fuehrt zu sauberem degrade statt silent failure
- [ ] **BG.V7-LV** — Review-/Feedback-Lifecycle laeuft end-to-end inklusive Metrics/Disagreements
- [ ] **BG.V8-LV** — Mutationen erzeugen nachvollziehbare Audit-/Timeline-Evidence
- [ ] **BG.V9-LV** — Persistenz-/Reload-Pfade halten Arbeitszustand reproduzierbar

---

## 3. Testpflichten

- [ ] **BG.T1** — Unit: Source-/Policy-Validatoren
- [ ] **BG.T2** — Unit: Contract Mapper fuer API-Antworten
- [ ] **BG.T3** — Integration: Ingestion -> Candidate -> Review -> Persistence -> Timeline
- [ ] **BG.T4** — Integration: Provider-outage / degraded behavior / fallback provenance
- [ ] **BG.T5** — E2E/API: Writeback + Audit + Replay-Konsistenz
- [ ] **BG.T6** — Integration: Agent-GeoMap-Bridge-Contract (allow/deny + audit + failure envelope) gegen Companion-Slice validiert
- [ ] **BG.T7 (optional)** — Contract-Comparison-Tests fuer evaluierte Muster (`history/availability`, `etag/freshness`, `fallback provenance`) gegen aktuellen GeoMap-Backend-Vertrag
- [ ] **BG.T8 (optional)** — Contract-Comparison-Tests fuer evaluierte Sovereign_Watch-Muster (`history/replay/search`, `broadcast/historian`, `multi-source backoff/arbitration`) gegen aktuellen GeoMap-Backend-Vertrag
- [ ] **BG.T9 (optional)** — Contract-Comparison-Tests fuer evaluierte conflict-globe.gl-Muster (`graph overlays`, `timeline/search coupling`, `socket broadcast cadence`) gegen aktuellen GeoMap-Backend-/Layer-Vertrag

---

## 4. Evidence Requirements

Fuer jeden geschlossenen Punkt mindestens:

- ID (`BG.*`, `BG.V*`, `BG.T*`)
- reproduzierbarer Ablauf (API/Test)
- erwartetes vs. beobachtetes Ergebnis
- Referenz auf Owner-Dokument(e)
- bei Live-Gates: Request/Response-Beispiele inkl. Degradation-Fall

---

## 5. Propagation Targets

- `docs/specs/execution/geomap_closeout.md`
- `docs/specs/API_CONTRACTS.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`
- `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- `docs/geo/OGI_AI_REVIEW.md`
- `docs/geo/WORLDWIDEVIEW_AI_REVIEW.md`
- `docs/geo/SHADOWBROKER_AI_REVIEW.md`
- `docs/geo/SOVEREIGN_WATCH_AI_REVIEW.md`
- `docs/geo/CONFLICT_GLOBE_GL_AI_REVIEW.md`
- `docs/specs/execution/agent_geomap_bridge_delta.md`

---

## 6. Exit Criteria

- `BG.1-BG.8` abgeschlossen oder sauber deferred mit Owner/Datum
- mindestens `BG.V1-BG.V5` code-complete nachgewiesen
- mindestens `BG.T1-BG.T4` vorhanden
- verbleibende Live-Gates sind explizit in den Folgeplan ueberfuehrt

