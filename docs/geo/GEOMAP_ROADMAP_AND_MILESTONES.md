# GeoMap Roadmap and Milestones

> **Stand:** 09. Maerz 2026
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

### Milestone C (sources) — offen

- [x] hard-signal adapters (OFAC, UK, UN, Central Bank), source health
- [~] soft-signal adapter scaffolds (RSS + Chronicle PoC vorhanden, aber keine echte NLP-Pipeline -- nur Headline-Forwarding)
- [x] source health endpoint/panel (SourceHealthPanel.tsx + API Route, API-Key-Checks)

### Milestone D (quality) -- TEILWEISE

- [x] confidence + dedup engine (confidence.ts 52 LoC, dedup.ts 108 LoC -- funktional)
- [~] anti-noise alerting (alerts/route.ts existiert mit 23 LoC, aber kein UI fuer Alert-Konfiguration, keine Cooldown-UI, keine User-Mute-Profile)
- [ ] perf + a11y pass (keine aria-Labels im Code, keine Performance-Optimierung nachweisbar, kein Keyboard-Shortcut-Set ausser `c`)

### Milestone E (v2) -- FRUEH BEGONNEN

- [x] Prisma persistence (Schema + Dual-Write in allen Stores implementiert)
- [~] geospatial stack upgrade (d3-geo + topojson waren schon v1-Stack; kein Upgrade auf z.B. Canvas/WebGL-Hybrid sichtbar)
- [~] advanced filters/search (Shell hat `search`/`filters` State-Variablen, aber kein dediziertes Filter-UI-Panel, keine facettierte Suche)

### Milestone F (noch nicht im Plan) -- OFFEN

- [ ] Shell-Refactoring: 1450-LoC-Monolith aufbrechen (Zustand Store, Context, Custom Hooks)
- [ ] Keyboard Shortcuts (M, L, P, T, Delete, Ctrl+Z, Ctrl+Shift+Z, R -- nur `c` existiert)
- [ ] Export-Funktion (JSON/PNG/PDF)
- [ ] Timeline Playback (Scrubber, Animation)
- [ ] Multi-Select + Bulk-Updates
- [ ] Asset-Link-UI vervollstaendigen (assetClass/relation Dropdowns statt hardcoded)
- [ ] Seed-Datensatz / Demo-Szenario (alle JSON-Files sind leer)
- [ ] ReliefWeb-Integration (nur ENV-Platzhalter, kein Code)
- [ ] Reddit-Integration (verschoben auf v2, kein Code)

---


## 25a. Ist-Zustand Audit (2026-02-18)

> Ergebnis der Code-Analyse gegen den Plan. Ehrliche Versions-Einschaetzung.

### Echte Version: **v1.0-beta**

| Aspekt | Status | Detail |
|---|---|---|
| **Gesamtbewertung** | v1.0-beta | Core-Workflow funktioniert, aber nie mit echten Daten benutzt. Kein Production-Haertung |
| **v1 Abdeckung** | ~85% | Luecken: a11y, Keyboard Shortcuts, Exports, leere Datenbank |
| **v2 Abdeckung** | ~30% | Prisma-Schema existiert. Kein Timeline-Playback, keine Advanced Filters, kein geospatial Upgrade |
| **v3 Abdeckung** | 0% | ML-Pipeline, Scenario-Support, Probabilistic Impact fehlen komplett |

### Frontend Ist-Zustand

| Kategorie | Dateien | LoC | Bewertung |
|---|---|---|---|
| Shell (Haupt-Container) | 1 | 1450 | **Monolith-Problem:** ~40 useState, kein Store, kein Context. Jeder State-Zugriff von ausserhalb unmoeglich |
| Map-Rendering | 1 | 599 | Solide. d3-geo Orthographic, SVG, funktioniert |
| Workflow-Panels | 6 | 646 | Funktional: Candidate Queue, Timeline, Event Inspector, Game Theory, Context, Insights |
| Shell-Sub-Panels | 6 | 626 | Funktional: Header, Create/Edit Marker, Draw Mode, Marker List, Region News |
| Types | 2 | 333 | Vollstaendig: Domain + API-Response Types |
| Shared Primitives | 1 | 41 | Drawing-Validation |
| **Gesamt** | **17** | **~3695** | -- |

**Architektur-Schulden:**
- `GeopoliticalMapShell.tsx` muss refactored werden (Zustand Store oder React Context)
- Kein globaler State -- Geo-Daten sind von ausserhalb der Map-Page nicht erreichbar
- Keine Lazy-Loading-Strategie fuer Panels

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
| Sek. 9.3 Keyboard Shortcuts | M, L, P, T, Delete, Ctrl+Z, Ctrl+Shift+Z, C, R | Nur `c` implementiert |
| Sek. 9.2 Multi-Select | multi-select markers → bulk updates | Nicht implementiert |
| Sek. 18 NLP/ML Pipeline | 8-Schritt-Pipeline (entity extraction, severity tagging, ...) | Nur Headline-Forwarding, keine NLP (Ausbaustufen in 18.1) |
| Sek. 19 Asset Mapping | relation types (beneficiary/exposed/hedge/uncertain) + weight | UI hat hardcoded assetClass/relation |
| Sek. 20 Alerting | cooldown, duplicate suppression, user mute profiles | Nur 23-LoC Route ohne UI |
| Sek. 29 Exports | JSON in v1, visual in v2 | Keine Export-Funktion |
| Sek. 29 Timeline Playback | v2 | Nicht begonnen |
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

*(Planned file structure: erledigt — siehe Archiv Sek. 26.)*

---


## 30. Execution checklist — offene Items

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
| 11 | E2E Tests: Create Marker → Sources → Accept Candidate → Timeline → Archive | 3-4 Tage | Nach #2 |
| 12 | Evaluation Harness: Accept/Reject Rate, Dedup Rate, Time-to-Confirm | 2 Tage | Nach #11 |
| 13 | Evidence Bundle: SHA256 Hash + Terms-Aware Storage | 1-2 Tage | Keine |
| 14 | a11y Pass: aria-Labels, Focus Management, Screen Reader | 2 Tage | Nach #1 |
| 15 | CRDT Vorbereitung: Yjs Y.Map Integration auf Zustand Store | 3-4 Tage | Nach #1 (Shell-Refactor Pflicht) |

### Danach (v2):

- deck.gl Integration (Rendering Stufe 2)
- optionaler Flat/Regional Analyst View (MapLibre + deck.gl, gate-gesteuert)
- Replay-/Timeline-Controller mit Zeitfenster, Presets und Story-Kopplung
- zentrale MapFilterEngine fuer Conflict/Macro/Context/Soft-Signal-Layer
- Overlay-Chrome-Trennung (`timeline`/`filters`/`legend` getrennt von Daten-Layer-Toggles)
- generischer Selection-/Detail-Contract fuer Conflict-Objekte
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
| 2026-02-19 | 1.0-beta++ | **Source Appendix massiv erweitert:** Sek. 31.5-31.9 ueberarbeitet. Neue Sektionen: 31.6 (Zentralbank Balance Sheets + APIs: Fed/ECB/BoE/BoJ/SNB/PBoC/RBI/BCB/BoR + BIS + TradingEconomics + Community Wrapper Rust/Python/R + US-Wirtschaftsdaten-APIs: NY Fed, BLS, BEA, Treasury, FDIC, SEC EDGAR), 31.7 (On-Chain/Crypto: Arkham Intelligence + inoffizielle API), 31.8 (investing.com inoffiziell). **3 neue SOTA-Sektionen:** 35.13 (Zentralbank-Layer als Filter: QE/QT, Rate Decisions, Reserve-Kaeufe, Balance Sheet Trend), 35.14 (Event Modal UX: Mini + Detail-Modal), 35.15 (Copy/Paste News Import fuer API-lose Quellen + Paperwatcher-Integration). Ehem. 35.13 Security → 35.16. Sprint 2 um Tasks 10a/10b/10c ergaenzt. v2-Backlog erweitert um Zentralbank Balance Sheet Layer + Paperwatcher Extraction |

| 2026-02-19 | 1.0-beta+++ | **Sek. 35.15 (Copy/Paste)** migriert zu Top-Level Feature in neuer [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md). Copy/Paste ist nicht mehr GeoMap-spezifisch -- LLM bestimmt Routing (geo/macro/trading/research). Geo-gerouteter Content erscheint weiterhin als GeoCandidate |

| 2026-02-19 | 1.0-beta++++ | **project_audit2.md archiviert.** Offene Items extrahiert: Sek. 18.1 (Soft-Signal Ausbaustufen aus audit2 Kap. 7), 25a Infrastruktur-Luecken (aus audit2 Sek. 8.5: ACLED Credentials, LLM-Summary-Gap, localStorage Persistence, Zombie-Processes). Tabelle "Was der Plan beschreibt aber nicht existiert" um NLP/Reddit-Vermerke ergaenzt |

| 2026-02-21 | 1.1-beta | **Sek. 12.4 Behavioral Analysis Quellen (A-G):** Earnings Call Provider (EarningsCall.biz, Quartr, FMP, EarningsAPI, Seeking Alpha) mit Preisen/APIs/Bewertung. SEC EDGAR MD&A/S-1/DEF14A mit `edgartools` Code-Beispiel. GDELT erweiterte Nutzung (GKG Tone, Persons, Orgs, BigQuery) mit Python-Code. Zentralbank-Reden (BIS, FedBot, ECBSppechtag, Audio-Workflow). Parlamente (Hansard, Congressional Record, C-SPAN). IPO Roadshow. Knowledge Base YouTube-Kanaele (Chase Hughes, Behavior Panel, Derek Van Schaik, Body Language Ghost, Observe). Integrations-Reihenfolge v2.0→v3+. WhisperX Empfehlung fuer Speaker Diarization. Cross-Referenz zu [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) |

### Naechste geplante Plan-Updates

- Nach Shell-Refactoring: Milestone F + Sek. 35.9 (CRDT-Readiness) aktualisieren
- Nach weiterem `pharos-ai`-Review: Replay-/Story-/Filter-Muster gegen GeoMap-Istzustand nachziehen
- Nach `2026-03-12`: Agent-Layer-Open-Sourcing von `pharos-ai` gegen unseren Conflict-/Source-Layer bewerten
- Nach erstem Seed-Datensatz: Daten-Ist-Zustand + Sek. 35.6 (Golden Set) aktualisieren
- Nach Canvas-Hybrid-Migration: Sek. 35.4 Stufe 1 als erledigt markieren
- Nach Test-Suite: Engineering Checklist aktualisieren
- Nach v2-Features (Timeline Playback, Exports, Advanced Filters): Milestone E aktualisieren
- Nach Rust h3o Integration: Sek. 35.4 Stufe 3 + RUST_LANGUAGE_IMPLEMENTATION.md Sek. 13 aktualisieren
- Nach 2026-03-12: `pharos-ai` Agent-Layer-Monitoring auswerten und in
  `PHAROS_AI_REVIEW.md` / `execution/geomap_closeout.md` fortschreiben


---

## Querverweise

- `GEOMAP_OVERVIEW.md`
- `GEOMAP_FOUNDATION.md`
- `GEOMAP_MODULE_CATALOG.md`
- `GEOMAP_VERIFY_GATES.md`
