# GeoMap Roadmap and Milestones

> **Stand:** 13. Maerz 2026
> **Zweck:** Milestones, Ist-Audit, offene Checklisten und priorisierte Execution-Reihenfolge.
> **Source-of-Truth-Rolle:** Owner fuer GeoMap-Roadmap, Delivery-Reihenfolge und Changelog-Kontext.
> **Quelle:** migriert aus `docs/GEOMAP_OVERVIEW.md` (Pre-Split-Archiv in `docs/archive/`).

---

## Scope und Abgrenzung

- Normative GeoMap-Spec unter `docs/specs/geo/`
- Root-GeoMap-Dateien sind nach Split archiviert und aus aktivem Root entfernt

---

## 25. Implementation milestones

> **Legende:** [x] erledigt, [~] teilweise/scaffold, [ ] offen
> **Audit-Datum:** 2026-02-18 (Code-Review gegen tatsaechliche Implementierung)
> **Arbeits-Checkliste:** Detaillierte Verify-Gates und Abhak-Liste in [`specs/execution/geomap_closeout.md`](./specs/execution/geomap_closeout.md)

*(Milestone A/B und erledigte Teile von C: siehe Archiv Sek. 25.)*

### Milestone C (sources) â€” offen

- [x] hard-signal adapters (OFAC, UK, UN, Central Bank), source health
- [~] soft-signal adapter scaffolds (RSS + Chronicle PoC vorhanden, aber keine echte NLP-Pipeline -- nur Headline-Forwarding)
- [x] source health endpoint/panel (SourceHealthPanel.tsx + API Route, API-Key-Checks)

### Milestone D (quality) -- TEILWEISE

- [x] confidence + dedup engine (confidence.ts 52 LoC, dedup.ts 108 LoC -- funktional)
- [~] anti-noise alerting (Policy-UI + Preview + Save-Route existieren; Delivery, Mute-Profile-Wirkung und E2E fehlen weiter)
- [~] perf + a11y pass (erste aria-Labels/Panel-Steuerung und Shortcut-Set vorhanden, systematischer Audit + Messprotokoll offen)

### Milestone E (v2) -- CORE GESCHLOSSEN, LIVE-VERIFY OFFEN

- [x] Prisma persistence (Schema + Dual-Write in allen Stores implementiert)
- [~] geospatial stack upgrade (Globe-Core steht; `deck.gl`, `maplibre-gl` und `pmtiles` sind installiert, typisierte Flat-/Regional-Runtime-Contracts existieren, ein erster sichtbarer MapLibre-Viewport mit Bounds-Fit und eine separate deck.gl-Overlay-Boundary fuer Bounds plus erste Event-Punkte sind vorhanden. Conflict-Layer, reichhaltige PMTiles-Basemap und Browser-Verify bleiben offen)
- [x] advanced filters/search fuer v2-Core (Toolbar + Source-/Region-/ACLED-Filter sind real; sichtbarer Workspace filtert Events, Timeline, Candidates, Region-News, Context und Game-Theory ueber denselben Globe-/Workspace-Vertrag. Eine noch breitere view-agnostische Engine fuer spaetere Flat-/Conflict-Spezialobjekte bleibt Folgearbeit)

### Milestone F (noch nicht im Plan) -- CORE TEILWEISE GESCHLOSSEN

- [x] Shell-Refactoring fuer v2-Core: Zustand Store + mehrere Shell-/Mutation-/Interaction-Hooks existieren; sichtbare Workspace-Datasets und Selection-/Preset-Cleanup laufen ueber einen eigenen Hook statt inline in der Shell. Weitere Entkopplung fuer Flat/Conflict oder Collaboration bleibt Folgearbeit
- [~] Keyboard Shortcuts (Esc fuer Cursor-Modus sowie M, L, P, T, Delete, Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y, C/R/H/S vorhanden; sichtbare Shortcut-Legende vorhanden, Discoverability/A11y/Test-Gates weiter offen)
- [x] Export-Funktion (JSON/CSV serverseitig, PNG/PDF als Browser-Snapshot vorhanden; Briefing bleibt offen)
- [x] Timeline Playback fuer v2-Core (TimelineStrip hat Brush/Playback/Decay-Preview, explizite View-vs-Filter-Window-Logik und einen Shared-Replay-Pfad fuer Map-Events, Timeline, Candidates, Region-News, Context und Game-Theory; wiederverwendbare Story-Presets mit Active-Preset-State und Timeline-Selection-Restore sind vorhanden. Browser-/Live-Verify bleibt offen)
- [~] Overlay-Chrome-Trennung (eigene Store-/Shell-Flags fuer Filters, Legend und Timeline-Workspace vorhanden; manueller Verify-Gate bleibt offen)
- [x] Selection-/Detail-Contract fuer v2-Core (gemeinsamer Summary-Helper fuer Event Inspector, Marker-Liste, Timeline-Detail, Candidate Queue, Region-News und Context-Feed. Timeline-/Selection-Fokus traegt einen Region-Hinweis fuer plausiblen Region-Fokus, Timeline-Selektion lebt ueber `selectedTimelineId` im gemeinsamen Workspace-State und Story-Presets koennen diese Selektion wiederherstellen. Conflict-Spezialobjekte bleiben Folgearbeit fuer den Flat-Mode)
- [~] Marker-/Drawing-UX (Cursor-Modus, Workflow-Hinweise und manuelle Koordinatenvalidierung vorhanden; Preview/Snapping/Edit-Mode weiter offen)
- [ ] Multi-Select + Bulk-Updates
- [ ] Asset-Link-UI vervollstaendigen (assetClass/relation Dropdowns statt hardcoded)
- [ ] Seed-Datensatz / Demo-Szenario (alle JSON-Files sind leer)
- [ ] ReliefWeb-Integration (nur ENV-Platzhalter, kein Code)
- [ ] Reddit-Integration (verschoben auf v2, kein Code)

---


## 25a. Ist-Zustand Audit (2026-02-18)

> Ergebnis der Code-Analyse gegen den Plan. Ehrliche Versions-Einschaetzung.

### Echte Version: **v2-core / live-verify-pending**

| Aspekt | Status | Detail |
|---|---|---|
| **Gesamtbewertung** | v2-core / live-verify-pending | Der Globe-/Workspace-Pfad traegt jetzt den v2-Core fuer Filter, Temporal Contract, Story/Reset und Selection/Detail; Browser-/Live-Verify und der spaetere Flat/Conflict-Mode bleiben offen |
| **v1 Abdeckung** | ~95% | Luecken: systematischer a11y-/perf-pass, Seed-Daten, Tests, Review-Contract |
| **v2 Abdeckung** | ~70% | v2-Core auf dem Globe-/Workspace-Pfad ist geschlossen; Flat/Regional-Mode, Multi-Select und spaetere Conflict-Spezialobjekte fehlen noch |
| **v3 Abdeckung** | 0% | ML-Pipeline, Scenario-Support, Probabilistic Impact fehlen komplett |

### Frontend Ist-Zustand

| Kategorie | Dateien | LoC | Bewertung |
|---|---|---|---|
| Shell (Haupt-Container) | 1 | ~846 | Deutlich verkleinert. Weiterhin zentrale Orchestrierung, aber nicht mehr der alte useState-Monolith |
| Map-Rendering | 1 | 599 | Solide. d3-geo Orthographic, SVG, funktioniert |
| Workflow-Panels | 6+ | >646 | Funktional: Candidate Queue, Timeline, Event Inspector, Game Theory, Context, Insights plus Phase12-Advanced-Panel |
| Shell-Sub-Panels | 6+ | >626 | Funktional: Header, Create/Edit Marker, Draw Mode, Marker List, Region News plus Viewport/Filter/Panels |
| Types | 2 | 333 | Vollstaendig: Domain + API-Response Types |
| Shared Primitives | 1 | 41 | Drawing-Validation |
| **Gesamt** | **17** | **~3695** | -- |

**Architektur-Schulden:**
- `GeopoliticalMapShell.tsx` braucht weitere Entkopplung fuer den spaeteren Flat-/Conflict-Renderer und Collaboration-Workflows
- Live-/Browser-Verify fuer Temporal/Story/Selection/Overlay-Chrome fehlt trotz geschlossenem v2-Core weiter
- Dual-View-Boundary und Flat-Handoff existieren bereits typisiert; ein erster sichtbarer Flat-Renderer ist vorhanden und zeigt Bounds plus erste sichtbare Event-Punkte aus dem gemeinsamen Workspace-Vertrag. Offen bleiben reichhaltigere Flat-Layer, weitere kontextuelle Einstiege, Conflict-Overlays, PMTiles-Basemap und der strategisch-stabile Rueckweg-Verify

### Backend Ist-Zustand

| Kategorie | Dateien | Bewertung |
|---|---|---|
| API Routes | 22 | Alle implementiert, kein Stub |
| Server-Module (Stores + Bridges) | 8 | Voll funktional, Dual-Write (Prisma + JSON) |
| SSE Streaming | 1 | Funktional (5s Poll, 6 Event-Types) |
| Hard-Signal Adapter | 1 (306 LoC) | OFAC, UK, UN Sanctions + Central Bank Calendar -- real |
| Confidence/Dedup | 2 (160 LoC) | Implementiert und in Use |
| Ingestion Budget | 1 | Implementiert |
| Source Health | 1 | API-Key-Checks |

**Go-Backend Geo-Services:**

| Service | Status |
|---|---|
| ACLED Connector | Implementiert + Tests |
| GDELT Connector | Implementiert + Tests |
| Context (CFR/CrisisWatch) | Implementiert |
| Game-Theory Impact | Implementiert |
| ReliefWeb | Nicht implementiert (nur ENV) |

### Daten Ist-Zustand

| Datei | Inhalt |
|---|---|
| `events.json` | Leer (`{"events":[]}`) |
| `candidates.json` | Leer (`{"candidates":[]}`) |
| `timeline.json` | Leer (`{"timeline":[]}`) |
| `drawings.json` | Leer (`{"drawings":[]}`) |
| `regions.json` | 11 Regionen mit Country-Codes (real) |
| `symbol-catalog.json` | 9 Symbole (real) |

### Was der Plan beschreibt aber nicht existiert

| Plan-Sektion | Beschreibung | Code-Realitaet |
|---|---|---|
| Sek. 9.3 Keyboard Shortcuts | M, L, P, T, Delete, Ctrl+Z, Ctrl+Shift+Z, C, R | Grossteile implementiert; sichtbare Shortcut-Legende jetzt vorhanden, Verify/UX-Dokumentation und restliche Gates offen |
| Sek. 9.2 Multi-Select | multi-select markers â†’ bulk updates | Nicht implementiert |
| Sek. 18 NLP/ML Pipeline | 8-Schritt-Pipeline (entity extraction, severity tagging, ...) | Nur Headline-Forwarding, keine NLP (Ausbaustufen in 18.1) |
| Sek. 19 Asset Mapping | relation types (beneficiary/exposed/hedge/uncertain) + weight | UI hat hardcoded assetClass/relation |
| Sek. 20 Alerting | cooldown, duplicate suppression, user mute profiles | Policy-UI + Preview + Save da; Delivery-/Mute-/Verify-Gates offen |
| Sek. 29 Exports | JSON in v1, visual in v2 | JSON/CSV vorhanden; PNG/PDF Snapshot jetzt clientseitig, Briefing-/storage-backed Export fehlt |
| Sek. 29 Timeline Playback | v2 | Begonnen: TimelineStrip mit Brush/Playback/Decay-Preview, explizitem View-vs-Filter-Window-State und Shared-Replay-Fenster in den Workspace-Store; Story-/Detail-Kopplung fehlt |
| Sek. 29 Overlay Chrome | v2 | Store-/Shell-Toggles fuer Filters, Legend und Timeline vorhanden; Verify-Gate noch offen |
| Sek. 29 Reddit | v2 | Reddit-Migration zu Go geplant (UIL Sek. 2.1) |
| Sek. 24 Tests | Unit + Integration + E2E definiert | Kein Test-Code fuer Geo sichtbar |

### Bekannte Infrastruktur-Luecken (aus project_audit2 Sek. 8.5 uebernommen)

| Luecke | Beschreibung | Prioritaet |
|--------|-------------|------------|
| **Daten-Density** | ACLED/GDELT liefern wenig Daten ohne validierte Credentials (`ACLED_EMAIL`, `ACLED_ACCESS_KEY`). GDELT braucht hochpraezise Queries | MITTEL -- Credentials klaeren |
| **LLM-Summary-Gap** | `summary`-Feld in Events vorbereitet aber nur Roh-Content. Echte Zusammenfassung wartet auf NLP-Pipeline (Sek. 18.1) | MITTEL -- kommt mit v2 NLP |
| **Persistence (localStorage)** | Zeichnungen und manuelle Marker-Korrekturen laufen ueber `localStorage`, nicht Prisma/SQLite | MITTEL -- Migration in Phase 3 |
| **Zombie-Processes (Windows Dev)** | Go-Gateway beendet sich bei harten Abbruechen manchmal nicht sauber. `netstat -ano | findstr :9060` + `taskkill` noetig | NIEDRIG -- Dev-only Problem |

---

*(Planned file structure: erledigt â€” siehe Archiv Sek. 26.)*

---


## 30. Execution checklist â€” offene Items

> **Arbeits-Checkliste:** [`specs/execution/geomap_closeout.md`](./specs/execution/geomap_closeout.md)  
> *(Erledigte Items: siehe Archiv Sek. 30.)*

**Product:** [~] asset links [~] no-noise policy  
**Engineering:** [ ] tests [ ] Keyboard Shortcuts [ ] Exports [ ] a11y Pass  
**Ops:** [~] alert routing test

---


## 36. Priorisierte Execution-Reihenfolge

> Alle SOTA-Erweiterungen (Sek. 35) + offene Milestones (Sek. 25 Milestone F) zusammengefasst.

### Sprint 1: Foundation Fix (v1.1-alpha)

> **Transition-Hinweis (nach Phase-4-Implementierung, Feb 2026):** Der GeoMap-Frontend-/Rendering- und UX-Stack kann fuer v2.0 bereits ausgeliefert/tested werden, aber Teile der Domainlogik (Candidates/Contradictions/Seed/Review APIs) laufen vorerst noch ueber Next.js-Serverrouten + lokale Stores als **transitional path**. Die Backend-Konsolidierung auf **Frontend -> Go -> Python/Rust** ist als Folgearbeit in `EXECUTION_PLAN.md` bei **Phase 9 (UIL Workflow/Review)** und **Phase 14 (offizielle Quellen/DiffWatcher im Go-Layer)** eingeplant.
> **Update (23. Feb 2026, Phase 9e-Cutover):** Der Candidate/Review/Ingest/Contradictions/Timeline-Truth-Path laeuft inzwischen ueber Go-Frontdoor/Go-owned Stores (Cutover via Next Thin-Proxies). Verbleibende lokale Next-GeoMap-Routen (`events/*`, `drawings/*`, `alerts`, `regions`, `news`, `context`, `graph`, `game-theory/impact`, `stream`, `sources/health`) sind **separater GeoMap-CRUD/Analytics/Streaming-Backlog** und nicht Teil des UIL-Candidate-Cutovers.

| # | Task | Aufwand | Abhaengigkeit |
|---|---|---|---|
| 1 | Shell-Refactor: Zustand Store + Domain-Slices | 3-5 Tage | Keine (Blocker fuer alles andere) |
| 2 | Seed-Dataset: 30-50 Events, 200 Candidates, 10 Contradictions | 2-3 Tage | Nach #1 (braucht funktionierenden Flow) |
| 3 | Keyboard Shortcuts (M, L, P, T, Delete, Ctrl+Z/Shift+Z, R) | 2 Tage | Nach #1 (braucht Command-Stack im Store) |
| 4 | Explain-Why `reason` String pro Candidate | 0.5 Tage | Keine |
| 5 | Contradiction Tracking (explizit, Sek. 35.2) | 2-3 Tage | Nach #2 (braucht Test-Daten) |

### Sprint 2: Operability + UX (v1.1-beta)

| # | Task | Aufwand | Abhaengigkeit |
|---|---|---|---|
| 6 | Export: JSON + PNG/PDF Snapshot | 2 Tage | Keine |
| 7 | Canvas Hybrid Rendering (Stufe 1, Sek. 35.4) | 2-3 Tage | Keine (parallel moeglich) |
| 8 | Alerting UI: Thresholds, Cooldowns, Explain-Why | 3 Tage | Nach #4 |
| 9 | Asset-Link UI: Relation Dropdown, Weight Slider, Impact Horizon | 2 Tage | Keine |
| 10 | Confidence Decay + regelbasierte Status-Transitions | 1-2 Tage | Nach #2 |

### Sprint 3: Quality + Collaboration Prep (v1.1)

| # | Task | Aufwand | Abhaengigkeit |
|---|---|---|---|
| 11 | E2E Tests: Create Marker â†’ Sources â†’ Accept Candidate â†’ Timeline â†’ Archive | 3-4 Tage | Nach #2 |
| 12 | Evaluation Harness: Accept/Reject Rate, Dedup Rate, Time-to-Confirm | 2 Tage | Nach #11 |
| 13 | Evidence Bundle: SHA256 Hash + Terms-Aware Storage | 1-2 Tage | Keine |
| 14 | a11y Pass: aria-Labels, Focus Management, Screen Reader | 2 Tage | Nach #1 |
| 15 | CRDT Vorbereitung: Yjs Y.Map Integration auf Zustand Store | 3-4 Tage | Nach #1 (Shell-Refactor Pflicht) |

### Danach (v2):

- erste reale `deck.gl`-/MapLibre-Renderer-Integration auf Basis des vorhandenen `flat-view-state`-Scaffolds weiter verdichten (sichtbarer MapLibre-Viewport plus erste deck.gl-Overlay-Boundary stehen, echte Event-/Conflict-Layer folgen)
- globaler Flat/Regional Analyst View als operativer Second-Mode (nicht Middle-East-spezifisch)
- weitere kontextuelle View-Handoffs Globe -> Flat (Region / Cluster / Draw-Area); Header-Button bleibt nur Fallback
- Search-Around Runtime-Contract produktiv ziehen (typisierte `nodes/edges/time_window/metrics` Ergebnisse fuer Globe/Flat/Panel)
- GeoTrack-Contract produktiv ziehen (Series + explizite Interpolation `LINEAR|NEAREST|PREVIOUS|NEXT|NONE`)
- Writeback-Action-Pfad produktiv ziehen (`validated intent -> mutation -> audit append`) inkl. Pflichtfeldern
- Dynamic-Tile-Server-Evaluierung (Martin/pg_tileserv) nur gate-gesteuert fuer echte dynamische Overlay-/Filter-Lastfaelle
- generischer Selection-/Detail-Contract fuer Conflict- und spaetere Flat-Spezialobjekte
- Globe-/Flat-View-Consistency- und Flat-Handoff-Live-Gates schliessen
- PMTiles-/Basemap-Hosting, Attribution und Browser-Verify fuer den Flat-Mode fertigziehen
- Multi-Select + Bulk-Updates
- Advanced Marker-/Drawing-UX auf Analysten-Niveau
- Entity Graph (in-memory, TypeScript)
- JSON Rules Engine (Policy-as-Code)
- Briefing Mode Export
- User Mute Profiles + Delivery Channels
- Access Control (Rollen)
- CRDT Live-Collaboration (y-websocket Server)

### Danach (v3 / Rust-Phase):

- h3o Spatial Indexing (Rust, Backend)
- LSTM Regime Detection pro Region (Rust, tch-rs)
- Transformer Severity-Klassifikation (Rust, tch-rs)
- Calibrated Confidence + Active Learning
- petgraph Entity Graph (Rust, >10k Nodes)
- Optional: Automerge-rs fuer Backend-State

---


## 37. Document changelog

| Datum | Version | Aenderungen |
|---|---|---|
| 2026-02-14 | 1.0-draft | Initial Blueprint erstellt. Alle Milestones als [x] markiert (Planungs-Perspektive) |
| 2026-02-18 | 1.0-beta | **Code-Audit durchgefuehrt:** Milestones korrigiert (ehrliche [x]/[~]/[ ] Markierungen basierend auf tatsaechlichem Code). Neue Sektion 25a (Ist-Zustand Audit) eingefuegt. Execution Checklist (Sek. 30) korrigiert. Open Questions (Sek. 28) und Proposed Defaults (Sek. 29) mit Implementierungsstatus annotiert. Milestone F (offene Punkte) hinzugefuegt. Version von 1.0 auf 1.0-beta geaendert |
| 2026-02-19 | 1.0-beta+ | **SOTA-Erweiterungen Backlog** (Sek. 35) mit 13 Sub-Sektionen. Rendering-Tiefenanalyse + CRDT-Evaluation + Rust h3o. **Feedback-Driven Review System** (Sek. 5.4) ersetzt binaeres Accept/Reject durch granulare Signal/Noise/Uncertain Taxonomie + strukturierte Override-Erklaerungen + Collaborative Voting (3-5 User). `GeoCandidate` Type (Sek. 13.2) erweitert um `systemClassification`, `systemReason`, `GeoAnalystFeedback[]`. API-Endpoints (Sek. 14.1) erweitert um `/review`, `/feedback/metrics`, `/feedback/disagreements`. Evaluation Harness (Sek. 35.6) auf neue Metriken umgestellt (System Precision/Recall, Override Rate, Cohen's Kappa). Training-Pipeline referenziert in Advanced-architecture-for-the-future.md Sek. 4.3-4.7 |
| 2026-02-19 | 1.0-beta++ | **Source Appendix massiv erweitert:** Sek. 31.5-31.9 ueberarbeitet. Neue Sektionen: 31.6 (Zentralbank Balance Sheets + APIs: Fed/ECB/BoE/BoJ/SNB/PBoC/RBI/BCB/BoR + BIS + TradingEconomics + Community Wrapper Rust/Python/R + US-Wirtschaftsdaten-APIs: NY Fed, BLS, BEA, Treasury, FDIC, SEC EDGAR), 31.7 (On-Chain/Crypto: Arkham Intelligence + inoffizielle API), 31.8 (investing.com inoffiziell). **3 neue SOTA-Sektionen:** 35.13 (Zentralbank-Layer als Filter: QE/QT, Rate Decisions, Reserve-Kaeufe, Balance Sheet Trend), 35.14 (Event Modal UX: Mini + Detail-Modal), 35.15 (Copy/Paste News Import fuer API-lose Quellen + Paperwatcher-Integration). Ehem. 35.13 Security â†’ 35.16. Sprint 2 um Tasks 10a/10b/10c ergaenzt. v2-Backlog erweitert um Zentralbank Balance Sheet Layer + Paperwatcher Extraction |

| 2026-02-19 | 1.0-beta+++ | **Sek. 35.15 (Copy/Paste)** migriert zu Top-Level Feature in neuer [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md). Copy/Paste ist nicht mehr GeoMap-spezifisch -- LLM bestimmt Routing (geo/macro/trading/research). Geo-gerouteter Content erscheint weiterhin als GeoCandidate |

| 2026-02-19 | 1.0-beta++++ | **project_audit2.md archiviert.** Offene Items extrahiert: Sek. 18.1 (Soft-Signal Ausbaustufen aus audit2 Kap. 7), 25a Infrastruktur-Luecken (aus audit2 Sek. 8.5: ACLED Credentials, LLM-Summary-Gap, localStorage Persistence, Zombie-Processes). Tabelle "Was der Plan beschreibt aber nicht existiert" um NLP/Reddit-Vermerke ergaenzt |

| 2026-02-21 | 1.1-beta | **Sek. 12.4 Behavioral Analysis Quellen (A-G):** Earnings Call Provider (EarningsCall.biz, Quartr, FMP, EarningsAPI, Seeking Alpha) mit Preisen/APIs/Bewertung. SEC EDGAR MD&A/S-1/DEF14A mit `edgartools` Code-Beispiel. GDELT erweiterte Nutzung (GKG Tone, Persons, Orgs, BigQuery) mit Python-Code. Zentralbank-Reden (BIS, FedBot, ECBSppechtag, Audio-Workflow). Parlamente (Hansard, Congressional Record, C-SPAN). IPO Roadshow. Knowledge Base YouTube-Kanaele (Chase Hughes, Behavior Panel, Derek Van Schaik, Body Language Ghost, Observe). Integrations-Reihenfolge v2.0â†’v3+. WhisperX Empfehlung fuer Speaker Diarization. Cross-Referenz zu [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) |
| 2026-03-13 | 1.1-beta+geo-ontology | `GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md` als eigener Geo-Owner aufgenommen und v2-Roadmap um Search-Around-, GeoTrack-/Interpolation-, Writeback-Audit- sowie Dynamic-Tile-Runtime-Gates erweitert |

### Naechste geplante Plan-Updates

- Nach Shell-Refactoring: Milestone F + Sek. 35.9 (CRDT-Readiness) aktualisieren
- Nach weiterem `pharos-ai`-Review: Replay-/Story-/Filter-Muster gegen GeoMap-Istzustand nachziehen
- Nach `2026-03-12`: Agent-Layer-Open-Sourcing von `pharos-ai` gegen unseren Conflict-/Source-Layer bewerten
- Nach erstem Seed-Datensatz: Daten-Ist-Zustand + Sek. 35.6 (Golden Set) aktualisieren
- Nach Canvas-Hybrid-Migration: Sek. 35.4 Stufe 1 als erledigt markieren
- Nach Test-Suite: Engineering Checklist aktualisieren
- Nach v2-Features (Timeline Playback, Exports, Advanced Filters): Milestone E aktualisieren
- Nach weiterem Drawing-UX-Schritt: Marker-/Drawing-Viewport-Status gegen Milestone F abgleichen
- Nach Responsive-Shell-Schritt: Mobile-/Landscape-Layout gegen Milestone F.15 und Verify-Gates spiegeln
- Nach Viewport-Focus-Schritt: Story-/Kamera-Gate gegen Selection-/Timeline-Vertrag fortschreiben
- Nach Workspace-Hook-Schritt: sichtbare Event-/Timeline-/Candidate-/News-Selektion und Cleanup-Pfade gegen Milestone F.0 / E.6 / F.11 spiegeln
- Nach Temporal-Domain-Clamp-Schritt: `timelineViewRangeMs` und `timelineSelectedTimeMs` gegen Domain-Wechsel und Playback-Drift absichern; Browser-Gate fuer echtes `view extent` vs. `time filter window` nachziehen
- Nach neutralem Timeline-Reset-Schritt: Playback/Brush/Cursor-Reset gegen F.18/T.11 spiegeln und naechsten Story-/Camera-Reset-Block schneiden
- Nach Timeline-View-Range-Schritt: sichtbares Timeline-Fenster vs. aktives Replay-Fenster gegen E.10/T.11/F.3 spiegeln und Story-/Camera-Autofit darauf aufsetzen
- Nach View-vs-Filter-Window-Schritt: explizite Sync-/Detach-Logik gegen E.10/T.11/F.3 spiegeln und Browser-Gate fuer den Temporal Contract vorbereiten
- Nach Selected-Time-Schritt: Cursor-/Selected-Time-Contract gegen E.10/T.11 spiegeln und Story-Autofit ueber `view extent` + `selected time` statt rein lokalen Playback-State schneiden
- Nach Temporal-Contract-Schritt: Timeline-Presets, Sichtfenster und Story-Reset gegen Milestone E.10 / F.18 spiegeln
- Nach Renderer-Klarstellung: d3-geo-Globe-Core vs. deck.gl/MapLibre-Second-Mode vs. spaeterer Multi-Body-/Scene-Track gegen Foundation/Execution spiegeln
- Nach sichtbarem Flat-Scaffold- und Handoff-Schritt: Milestone E / Execution-Slice gegen installierte Packages, typisierte Runtime-Contracts und kontextuelle Flat-Einstiege spiegeln
- Nach Rust h3o Integration: Sek. 35.4 Stufe 3 + RUST_LANGUAGE_IMPLEMENTATION.md Sek. 13 aktualisieren
- Nach 2026-03-12: `pharos-ai` Agent-Layer-Monitoring auswerten und in
  `PHAROS_AI_REVIEW.md` / `execution/geomap_closeout.md` fortschreiben


---

## Querverweise

- `GEOMAP_OVERVIEW.md`
- `GEOMAP_FOUNDATION.md`
- `GEOMAP_MODULE_CATALOG.md`
- `GEOMAP_VERIFY_GATES.md`
