# GeoMap Closeout & Offene Punkte

> **Stand:** 09. Maerz 2026
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
- `docs/geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md`
- `docs/geo/GEOMAP_FOUNDATION.md`
- `docs/geo/GEOMAP_MODULE_CATALOG.md`
- `docs/geo/GEOMAP_VERIFY_GATES.md`
- `docs/geo/GEOMAP_ROADMAP_AND_MILESTONES.md`
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

### 0.2 GEOMAP_DATA_CONTRACTS_AND_FEEDBACK

- [ ] **DC.1** — Feedback-Driven Review (Sek. 3) normativ gespiegelt: `signal/noise/uncertain`, Override-Reasons, Multi-Analyst-Flow
- [ ] **DC.2** — Canonical Contracts fuer `GeoEvent`, `GeoCandidate`, `GeoTimelineEntry` gegen Runtime-Istzustand geprueft
- [ ] **DC.3** — Review-/Feedback-API-Restpunkte (`/review`, `/feedback/metrics`, `/feedback/disagreements`) gegen Contract owner-geprueft
- [ ] **DC.4** — Evaluation-Harness-/Explain-Why-/Contradiction-Backlog aus Data-Contracts in SOTA-/Test-IDs gespiegelt
- [ ] **DC.5** — Timeline-Contract deckt Replay-/Story-Anforderungen fuer v2 ausreichend oder ist explizit als Delta markiert

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
- [ ] **M.10** — `pharos-ai` Monitoring-Datum `2026-03-12` fuer Agent-Layer-Open-Sourcing verfolgt und Folgeentscheid dokumentiert

### 0.6 GEOMAP_MODULE_CATALOG

- [ ] **O.1** — d3-Module v1.1: d3-scale, d3-scale-chromatic, d3-interpolate, d3-transition, d3-timer, d3-ease (falls noch nicht installiert)
- [ ] **O.2** — Severity Heatmap: hardcoded → scaleSequential + interpolateYlOrRd (`GEOMAP_MODULE_CATALOG.md` Sek. 2.1)
- [ ] **O.3** — Animation: setInterval → d3.timer (Frame-synchron, `GEOMAP_MODULE_CATALOG.md`)
- [ ] **O.4** — d3-Module v1.5 (Game Theory + Timeline): d3-hierarchy, d3-shape, d3-brush, d3-axis, d3-legend, d3-annotation
- [ ] **O.5** — Feature→Module-Matrix (Sek. 10): Regime-State Layer, CBDC Status, Financial Openness, etc. prüfen
- [ ] **O.6** — Flat/Regional-Analystenmodus im Modul-Katalog normativ gespiegelt (deck.gl / MapLibre / PMTiles als Second-Mode, nicht Globe-Replacement)
- [ ] **O.7** — Externe Referenz-Reviews in Modulentscheidungen gespiegelt (aktuell: `PHAROS_AI_REVIEW.md`)
- [ ] **O.8** — Replay-/Timeline-Module normativ gespiegelt: `d3-brush`, `d3-axis`, `d3-array`, `d3-shape` fuer Conflict-Replay und Story-Zeitfenster

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

- [~] **E.1** — geospatial stack upgrade (deck.gl fuer High-Density wenn Lastgrenzen gerissen)
- [~] **E.2** — advanced filters/search: dediziertes Filter-UI-Panel, facettierte Suche
- [ ] **E.3** — Flat/Regional Analyst View als eigener Render-Modus gescoped (ohne Globe-Core zu ersetzen)
- [ ] **E.4** — deck.gl + MapLibre als optionaler Zweitmodus spezifiziert, inklusive Daten-/Layer-Boundary
- [ ] **E.5** — PMTiles-Einsatz fuer Flat/Regional-Mode gegen Basemap-/Attribution-/Hosting-Contract bewertet
- [ ] **E.6** — zentrale MapFilterEngine fuer Conflict/Macro/Context/Soft-Signals gescoped (dataset-zentriert, facettiert, view-agnostisch)
- [ ] **E.7** — Overlay-Chrome-Contract gescoped (`timeline`, `filters`, `legend`, Panels getrennt von Daten-Layer-Toggles)

---

## 4. Milestone F

- [ ] **F.0** — Shell-Refactoring: GeopoliticalMapShell 1450-LoC-Monolith aufbrechen (Store, Context, Custom Hooks)
- [ ] **F.1** — Keyboard Shortcuts: M, L, P, T, Delete, Ctrl+Z, Ctrl+Shift+Z, R (nur `c` existiert)
- [ ] **F.2** — Export-Funktion (JSON/PNG/PDF)
- [ ] **F.3** — Timeline Playback (Scrubber, Animation)
- [ ] **F.4** — Multi-Select + Bulk-Updates
- [ ] **F.5** — Asset-Link-UI: assetClass/relation Dropdowns, Weight-Slider
- [ ] **F.6** — Seed-Datensatz / Demo-Szenario (JSON-Files befuellen)
- [ ] **F.7** — ReliefWeb-Integration (Code, nicht nur ENV)
- [ ] **F.8** — Reddit-Integration (v2 geplant)
- [ ] **F.9** — Shared Layer Contract fuer Globe + Flat definiert (Story, Filter, Timeline, Selection, Layer IDs)
- [ ] **F.10** — Shared Map Payload Contract fuer Globe + Flat definiert (view-agnostisch, renderer-driven)
- [ ] **F.11** — Replay-/Timeline-Controller umgesetzt: Zeitfenster, Zoom-Presets, Scrub/Brush, Reset
- [ ] **F.12** — Story-driven camera + timeline activation umgesetzt
- [ ] **F.13** — Overlay-Chrome-Visibility von Daten-Layer-Visibility sauber getrennt
- [ ] **F.14** — generischer Selection-/Detail-Contract fuer Conflict-Objekte eingefuehrt
- [ ] **F.15** — Responsive Analyst-Layouts fuer Desktop/Mobile/Landscape konsolidiert

---

## 5. API / Backend

- [ ] **API.1** — `POST /api/geopolitical/candidates/:id/review` (GeoAnalystFeedback Body)
- [ ] **API.2** — `GET /api/geopolitical/feedback/metrics`
- [ ] **API.3** — `GET /api/geopolitical/feedback/disagreements`
- [ ] **API.4** — Metadata-first-/legal-safe source persistence fuer GeoMap verifiziert (keine unzulaessige Volltext-Speicherung)
- [ ] **API.5** — Source-health / provider-outage / rate-budget-Verhalten fuer GeoMap-Routen owner-konsistent dokumentiert

---

## 6. Tests

- [ ] **T.1** — Unit: scoring logic, dedup logic, state transitions, schema validation
- [ ] **T.2** — Integration: ingestion → candidate → review → persistence, timeline append
- [ ] **T.3** — E2E: draw + marker workflow, candidate review lifecycle, region click → filtered feed, timeline interactions
- [ ] **T.4** — View-Consistency-Test: gleicher Datensatz wird in Globe und Flat konsistent gefiltert / selektiert / erzählt
- [ ] **T.5** — Replay-/Timeline-Test: Zeitfenster-Filter beeinflusst Karte, Listen und Story-Highlights konsistent
- [ ] **T.6** — Overlay-Chrome-Test: Ausblenden von Timeline/Legend/Filters beeinflusst keine Daten-Layer und umgekehrt

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
- [ ] **SOTA.10** — Story-driven Replay UX: Karte, Zeitfenster, Details und Narrative laufen ueber denselben Contract

---

## 8. Execution Checklist — offene Items

**Product:**
- [~] asset links (Backend fertig, UI fehlt Dropdown + Weight-Slider)
- [~] no-noise policy (Dedup + Confidence da, Alerting unvollständig)

**Engineering:**
- [ ] tests (keine Test-Dateien fuer Geo sichtbar)
- [ ] Keyboard Shortcuts (1 von 9)
- [ ] Exports (JSON/PNG/PDF)
- [ ] a11y Pass (keine aria-Labels)
- [ ] replay/story controller (Zeitfenster + Kamera + Detailzustand fehlen als konsistenter Layer)
- [ ] overlay chrome separation (UI-Chrome und Daten-Layer-Toggles noch nicht sauber getrennt)

**Ops:**
- [~] alert routing test (Route vorhanden, kein UI, kein E2E-Test)

---

## 9. Infrastruktur-Lücken

- [ ] **INF.1** — Daten-Density: ACLED/GDELT Credentials klaeren
- [ ] **INF.2** — LLM-Summary-Gap: NLP-Pipeline fuer echte Zusammenfassung
- [ ] **INF.3** — Persistence: Zeichnungen/Marker von localStorage nach Prisma migrieren
- [ ] **INF.4** — Zombie-Processes (Windows Dev): Go-Gateway sauberes Shutdown
- [ ] **INF.5** — Externes Referenz-Monitoring: `pharos-ai` Agent-Layer-Open-Sourcing ab `2026-03-12` beobachten und Auswirkungen auf Conflict-/Source-Layer bewerten
- [ ] **INF.6** — Source-Bias-/Cross-Bias-Operationalisierung fuer GeoMap-Candidates geplant (mindestens als Rules-/Review-Backlog)

---

## 10. Querverweise

| Frage | Dokument |
|:------|:---------|
| GeoMap Master-Spec | `docs/geo/GEOMAP_OVERVIEW.md` |
| GeoMap Product/Policy | `docs/geo/GEOMAP_PRODUCT_AND_POLICY.md` |
| GeoMap Data Contracts | `docs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md` |
| GeoMap Sources/Provider Policy | `docs/geo/GEOMAP_SOURCES_AND_PROVIDER_POLICY.md` |
| GeoMap Foundation | `docs/geo/GEOMAP_FOUNDATION.md` (Basemap, Geocoding, PMTiles, Rendering) |
| GeoMap Verify | `docs/geo/GEOMAP_VERIFY_GATES.md` (E2E, Draw, Save-Fehlerpfad, Performance-Baseline) |
| GeoMap Options | `docs/geo/GEOMAP_MODULE_CATALOG.md` (d3-Module, Feature→Module-Matrix) |
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

---

## 13. Exit Criteria

- Gate-A (`4.G1-4.G4`) ist geschlossen oder bewusst deferred mit Owner/Datum
- Milestones D/E/F haben klaren Status pro Item
- API-/Test-Restpunkte sind in Evidence nachvollziehbar
