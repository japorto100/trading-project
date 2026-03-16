# CONFLICT_GLOBE_GL Reference Review

> **Stand:** 16. Maerz 2026  
> **Zweck:** Detailliertes Referenzreview von `conflict-globe.gl` fuer TradeView Fusion GeoMap, mit Fokus auf Graph-/Relation-Visualisierung und leichtgewichtige OSINT-Aggregation.  
> **Quelle (Clone):** `D:/tradingview-clones/_tmp_ref_review/geo/conflict-globe.gl`  
> **Kuratiertes Extrakt (Extraction):** `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/conflict_globe_gl`  
> **Manifest:** `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/conflict_globe_gl/extraction_manifest.txt`  
> **Upstream-Referenz:** https://github.com/r13xr13/conflict-globe.gl  
> **Scope:** Graph-/Arc-/Entity-Patterns im Frontend, Backend-Event-Aggregation, WebSocket-Streaming, Timeline-/Search-/Export-Patterns.  
> **Nicht-Scope:** 1:1 Produktimport, direkte Tactical-UI-Uebernahme, unkritische Volluebernahme aller Source-spezifischen Fetcher.

---

## 1. Warum dieses Dokument existiert

`conflict-globe.gl` ist kein so tiefes End-to-End-Infra-Projekt wie `Sovereign_Watch` oder `Shadowbroker`, aber es liefert eine klar erkennbare Staerke:

- relationale Visualisierung auf Globe-Ebene (Arcs, Paths, Rings, HexBins),
- kombiniert mit einer pragmatischen, multi-source Event-Aggregation,
- plus kollaborative Session-Muster (rooms/cursors/draw/focus/annotations).

Der Hauptwert fuer TradeView Fusion liegt daher in:

- **Graph-/Relationship-Darstellung im Analysten-UI** (visuell),
- **leichtgewichtigen Aggregationsmustern** im Backend,
- **konsistenter Kopplung von Timeline + Search + Export + Selection**.

---

## 2. Pfade, Arbeitsregel, Extraction-Stand

## 2.1 Source of truth fuer Analyse

- `D:/tradingview-clones/_tmp_ref_review/geo/conflict-globe.gl`

## 2.2 Source of truth fuer Transfer

- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/conflict_globe_gl`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/conflict_globe_gl/extraction_manifest.txt`

Aktueller Extraction-Stand:

- `selected_count=44`
- `stage1_count=20` (Backend Aggregation + Stream)
- `stage2_count=8` (Graph Frontend Runtime)
- `stage3_count=10` (Legacy UI + Timeline)
- `stage4_count=6` (Infra + Docs)
- `missing_count=0`

## 2.3 Arbeitsregel

- Zuerst Extraction-Material evaluieren.
- Clone nur bei Kontextluecken/Verifikationsbedarf.
- Patterns in eigene Contracts mappen; keine direkte Uebernahme source-gebundener Details.

---

## 3. Technische Kurzbewertung

## 3.1 Staerken

- Sehr gute **graphische Beziehungsdarstellung** im Globe:
  - `arcs`, `paths`, `rings`, `hexBin`, `heatmap`.
- Starker **Operator-UX Mix**:
  - search, timeline, filters, exports, workspace snapshots.
- Solides **Realtime-Pattern**:
  - Express + Socket.io push updates.
- Interessante **Collaboration-Bausteine**:
  - room join/leave, cursor sync, draw sync, focus sync, annotation sync.

## 3.2 Schwaechen / Vorsicht

- Vieles ist in grossen Komponenten konsolidiert (hohe Kopplung, v. a. `client-3d/src/App.tsx`).
- Backend-Fetcher sind breit, aber nicht immer production-hardened wie bei schwereren Referenzprojekten.
- Teilweise UI-/Feature-Breite ueber dem strukturellen Reifegrad.
- Graph ist primar visuell (kein eigener Knowledge-Graph-Backend-Stack).

---

## 4. Graph-Fokus: Was ist wirklich nutzbar?

## 4.1 Graph im Sinne von Visual Relations (ja, hoch nutzbar)

Nutzbare Muster:

- Event-zu-Event-Beziehungen als Arc-Layer,
- implizite Verknuepfung ueber Kategorie/Schweregrad/Distanz,
- Entity-orientierte Panels fuer relationale Exploration.

Konkrete Referenzdateien:

- `client-3d/src/App.tsx` (Arc-/Path-/Entity-Graph UI)
- `client-3d/src/App.css` (UI-Shell fuer Graph/Timeline/Entity-Panels)

## 4.2 Graph im Sinne von KG/Neo4j/RDF (nein)

- Kein eindeutiger Knowledge-Graph Persistenz-/Query-Stack gefunden.
- Kein Neo4j/RDF/Sparql/Gremlin Runtime-Pfad als primaerer Kern.
- Fuer TradeView Fusion bedeutet das:
  - als **Visual-Graph-Muster sehr brauchbar**,
  - als **Backend-KG-Vorlage nicht primaer geeignet**.

---

## 5. A/B/C-Empfehlung

Definition:

- **A** = hoher Nutzen, kurzfristig uebertragbar
- **B** = nuetzlich, aber mit Adapter-/Hardening-Bedarf
- **C** = Referenz-only oder bewusst nicht direkt uebernehmen

## 5.1 A - Sofort nutzbare Muster

### Graph-/Timeline-/Search-/Export-Frontend

- `client-3d/src/App.tsx`
- `client-3d/src/App.css`
- `client-3d/src/main.tsx`

Warum A:

- direkte Patternquelle fuer relationale Layerdarstellung (Arcs/Paths/Rings/HexBin/Heatmap),
- gute Kopplung zwischen Selection, Timeline und Search.

### Backend Aggregation + Stream Grundmuster

- `server/src/index.ts`
- `server/src/routes/conflicts.ts`
- `server/src/services/conflict.ts`
- `server/src/services/acled.ts`
- `server/src/services/maritime.ts`
- `server/src/services/air.ts`
- `server/src/services/adsb.ts`
- `server/src/services/space.ts`
- `server/src/services/satellites.ts`
- `server/src/services/cyber.ts`
- `server/src/services/geo.ts`
- `server/src/services/social.ts`
- `server/src/services/radio.ts`
- `server/src/services/land.ts`
- `server/src/services/osint.ts`
- `server/src/services/rss.ts`
- `server/src/services/scraper.ts`
- `server/src/services/cameras.ts`

Warum A:

- brauchbare Blaupause fuer category-based Aggregation mit TTL/stale fallback,
- WebSocket push pattern fuer UI-Live-Layer.

## 5.2 B - Selektiv mit Adapter/Hardening

- `client/src/components/Globe.tsx`
- `client/src/components/ConflictTimeline.tsx`
- `client/src/services/api.ts`
- `client/src/App.tsx`
- `client/src/main.tsx`

Warum B:

- gute Vergleichs-/Fallback-Referenz (2D/legacy),
- aber nicht primaere Zielarchitektur fuer euren aktuellen Flat/Globe-Roadmappfad.

## 5.3 C - Referenz-only / nicht direkt uebernehmen

- Vollstaendige tactical UI-Struktur als Produktstandard.
- Rohes Correlation-Heuristikverhalten ohne eigene Contract-/Policy-Sicherung.
- Unkritische Direktuebernahme von source-spezifischen API-Annahmen ohne Provider-Governance.

---

## 6. Was die aktuelle Extraction konkret abdeckt

Die `selected_count=44` Extraction deckt fuer diese Referenz den entscheidenden Kern ab:

- Stage 1: Backend Aggregation + Stream + Service-Faecherung,
- Stage 2: Graphische Haupt-UI (3D runtime),
- Stage 3: Legacy/Timeline-Vergleichspfad,
- Stage 4: Infra/Build/Dokumentationskontext.

Damit kann ein Folgeagent:

- Graph-Layer-Patterns schnell isolieren,
- Backend-Aggregationskontrakte nachvollziehen,
- und UI-Interaktionslogik ueber Timeline/Entities/Search/Export gezielt uebertragen.

---

## 7. Empfohlenes Integrationsvorgehen fuer TradeView Fusion

## Phase 1 (A-Paket)

- Arc/Path/Ring/HexBin/Heatmap-Pattern in euren Flat-/Globe-Layer-Contract mappen.
- Event-Relation-Sicht als optionales Analysten-Overlay modellieren (nicht als Pflicht-default).
- Search + Timeline + Selection Kopplung gegen euren bestehenden Temporal-Contract testen.

## Phase 2 (B-Paket)

- Legacy-2D-Pfade nur als Vergleich/Backup evaluieren.
- Collaboration-Muster (room/cursor/draw/focus/annotation) als spaetere Option aufnehmen.

## Phase 3 (Hardening)

- Correlation-/relationale Heuristiken contract-testbar machen (Explainability + deterministische Inputs).
- Provider-/source-policy gegen eigene Regeln absichern.
- Performance-/UX-Verifikation fuer dichte Arc/Path-Layer unter realen Lastfaellen.

---

## 8. Do/Don't fuer Folgeagenten

## Do

- zuerst das Extraction-Manifest lesen,
- A-Muster priorisiert auf eigene Layer-/Temporal-Contracts mappen,
- Graph-Visualisierung als optionale analyst capability behandeln,
- alle source-bezogenen Annahmen in eigene Config/Policy ziehen.

## Don't

- keine 1:1 Uebernahme der grossen `App.tsx`-Monolith-Logik,
- keine ungeprueften Correlation-Heuristiken als harte Wahrheitsquelle verwenden,
- keinen impliziten Wechsel auf "Graph-Backend" behaupten, wenn nur visual graph patterns vorliegen.

---

## 9. Entscheidungsstatement

`conflict-globe.gl` ist fuer TradeView Fusion **vor allem als Graph-Visualisierungsreferenz** wertvoll.  
Der staerkste Transfernutzen liegt in Arc-/Path-/Entity-orientierter Analysten-UX plus leichtgewichtiger Realtime-Aggregation.

Empfehlung:

- A-Paket fuer visuelle Relationship-Layer und Timeline-/Search-Kopplung zeitnah evaluieren,
- B-Paket nur selektiv adapterbasiert aufnehmen,
- C bewusst referenz-only halten.

