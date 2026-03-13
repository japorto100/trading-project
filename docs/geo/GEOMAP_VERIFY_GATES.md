# GeoMap Phase 4 — Verifikation und Abnahme

> Stand: 13. Maerz 2026  
> Zweck: Draw-Workflow, E2E-Abnahme, Save-Fehlerpfad, Performance-Baseline und Ontologie/Graph/Track/Writeback-Abnahme. Referenz: `GEOMAP_OVERVIEW.md`, `GEOMAP_FOUNDATION.md`, `GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md`

---

## 1. Draw-Workflow (manuell)

### 1.1 Tools und Shortcuts

| Tool | Shortcut | Aktion |
|:-----|:---------|:-------|
| Marker | `M` | Punkt auf Globe platzieren |
| Line | `L` | Linie zeichnen (2+ Punkte) |
| Polygon | `P` | Polygon zeichnen (3+ Punkte) |
| Text | `T` | Text-Annotation |
| Delete | `Delete` | Ausgewaehltes entfernen |
| Undo | `Ctrl+Z` | Letzte Aktion rueckgaengig |
| Redo | `Ctrl+Shift+Z` | Undo rueckgaengig |
| Candidate Queue | `C` | Candidate-Panel ein-/ausblenden |
| Region Layer | `R` | Region-Overlay toggeln |
| Heatmap | `H` | Heatmap toggeln |
| Soft Signals | `S` | Soft-Signal-Overlay toggeln |

### 1.2 Ablauf

1. `/geopolitical-map` oeffnen
2. Drawing-Toolbar: Tool waehlen (Marker/Line/Polygon/Text)
   Shortcut-Legende im Draw-/Marker-UI sichtbar pruefen
3. Auf Globe klicken: Punkte setzen (Polygon/Line: mehrfach klicken, Doppelklick oder Enter zum Abschliessen)
4. Auswahl: Klick auf Drawing → Delete zum Loeschen
5. Undo/Redo pruefen

---

## 2. Save-Fehlerpfad

- **Erwartung:** Zeichnungen werden in Store/API persistiert. Bei Fehler (Netzwerk, 5xx): Fehlermeldung anzeigen, lokaler State bleibt erhalten.
- **Pruefung:** API absichtlich nicht erreichbar machen (z. B. Go Gateway stoppen) → Zeichnung speichern → Fehlermeldung sichtbar, keine stille Datenverlust.

---

## 3. E2E-Abnahme (Checkliste)

1. `POST /api/geopolitical/seed` (Earth-Zielgroesse)
2. `/geopolitical-map` oeffnen
3. Earth ↔ Moon Toggle pruefen
4. Choropleth Severity/Regime Layer-Toggles
5. Body-Layer-Toggles + Reset
6. Cluster-Zoom (Zoom-Out → Cluster-Badges, Zoom-In → Einzelmarker)
7. Draw-Workflow (Marker, Line, Polygon, Text, Undo, Redo, Delete)
8. Save-Fehlerpfad (bei API-Ausfall)
9. Export pruefen: JSON, CSV, PNG und PDF erzeugen; sichtbarer Kartenausschnitt und Legende im Snapshot verifizieren

---

## 4. Performance-Baseline (GeoMap)

**Scope:** FPS-Targets und Messverfahren für GeoMap v2 (d3-geo, Canvas/SVG)

### Messmethodik

- **Tool:** Chrome DevTools → Performance Tab (Record 10 Sekunden, Interaktion: Globe-Rotation)
- **Build:** `bun run build` Production Bundle (`next build`, NODE_ENV=production)
- **Hardware:** Intel Core i7-10th Gen, 16 GB RAM, NVIDIA GTX 1660 (oder besser)
- **Browser:** Chrome 121+ (kein throttling, kein DevTools-Overhead während Messung)
- **Isolation:** Keine anderen JS-intensiven Tabs

### FPS-Targets

| Szenario | Events | Erwarteter FPS | Gate-Trigger |
|:---------|:-------|:---------------|:-------------|
| **A** — Leicht | 50 gleichzeitige GeoEvents auf Globe | ≥ 60 FPS | — |
| **B** — Mittel | 200 gleichzeitige GeoEvents + Heatmap-Layer | ≥ 45 FPS | Gate A: < 45 FPS → deck.gl |
| **C** — Schwer | 1000 GeoEvents + Heatmap + 10 Transmission Channels | ≥ 30 FPS | — |

**Wichtig:** FPS gemessen als Median über 10 Sekunden Rotation. Einzelne Frames < Target sind
akzeptabel; der Median muss das Ziel erreichen.

### Messprotokoll

```
1. bun run build
2. next start (Port 3000)
3. Chrome öffnen: localhost:3000/geopolitical-map
4. DevTools Performance öffnen (Shortcut: F12 → Performance)
5. Test-Dataset laden:
   Szenario A: POST /api/geopolitical/seed mit 50 Events
   Szenario B: POST /api/geopolitical/seed mit 200 Events
   Szenario C: POST /api/geopolitical/seed mit 1000 Events
6. Record 10 Sekunden starten
7. Globe per Maus rotieren (konstante Bewegung)
8. Record stoppen → FPS aus "Frames" Chart ablesen
9. Median-FPS notieren
```

### Aktuelle Baseline (Phase 4 Closeout)

| Szenario | Gemessener FPS | Status | Gemessen am |
|:---------|:---------------|:-------|:------------|
| A (50 Events) | Ausstehend | ◎ Target: ≥ 60 | — |
| B (200 Events) | Ausstehend | ◎ Target: ≥ 45 | — |
| C (1000 Events) | Ausstehend | ◎ Target: ≥ 30 | — |

*Messung erfolgt bei erstem vollständigen Phase-4-Stack-Start (Phase 4 E2E-Verifikation).*

### Optimierungsmaßnahmen (falls unter Target)

**Szenario A < 60 FPS**
- Canvas-Rendering prüfen: Events als Canvas-Punkte statt SVG-Kreise
- `requestAnimationFrame` Throttling auf 60 FPS cap

**Szenario B < 45 FPS → Gate A ausgelöst**
- Migration auf `deck.gl` ScatterplotLayer (GEOMAP_FOUNDATION Sek. 4)
- **OffscreenCanvas:** Globe-Rendering in Web Worker auslagern (`canvas.transferControlToOffscreen()` → Worker). Main-Thread bleibt frei für UI. Siehe [`GEOMAP_OVERVIEW.md`](./GEOMAP_OVERVIEW.md) Sek. 35.4.

**Szenario C < 30 FPS**
- Event-Clustering bei Zoom-Ebene < 3 (D3 force-cluster)
- Level-of-Detail: Bei C nur Top-100 nach severity anzeigen, Rest aggregiert
- **supercluster Worker (optional, v3+):** Bei 5.000+ Events: supercluster-Berechnung in Web Worker auslagern. Siehe [`GEOMAP_MODULE_CATALOG.md`](./GEOMAP_MODULE_CATALOG.md) Sek. 7.3.

### Bundle-Größen-Tracking

| Modul | Phase 4 | Phase 6 | Phase 12 |
|:------|:--------|:--------|:---------|
| `d3-geo` + `world-atlas` | ~120 KB gz | ~120 KB gz | ~120 KB gz |
| Total GeoMap chunk | Ausstehend | — | — |
| Memory KG WASM | — | ~6 MB gz (lazy) | ~6 MB gz (lazy) |

---

## 5. Referenzen

- [`GEOMAP_FOUNDATION.md`](./specs/geo/GEOMAP_FOUNDATION.md) — Basemap, Geocoding, PMTiles, Rendering (inkl. Gates A/B/C)
- [`adr/ADR-002-GeoMap-Rendering-Foundation.md`](./archive/ADR-002-GeoMap-Rendering-Foundation.md) — Archiv (Inhalt in GEOMAP_FOUNDATION Sek. 4)

---

## 6. Basemap Sichtbarkeits-Gate (Staedte/Seen/Fluesse)

**Ziel:** Nachweis, dass GeoMap-Basemap die Mindestorientierung liefert (kein Routing-/Google-Feature-Gate).

**Technikbezug fuer dieses Gate:** OSM-basierte Vector-Tiles (z. B. PMTiles/Protomaps, OpenMapTiles-Schema), optional gerendert in MapLibre Flat-Mode; Globe-Core bleibt d3-geo-basiert.

### 6.1 Gate-Kriterien (Pass/Fail)

- `place` Labels sichtbar (mind. capital/city/town) in mehreren Zoomstufen.
- `water` Flaechen (Seen) sichtbar und vom Land klar unterscheidbar.
- `waterway` Linien (Fluesse) sichtbar, bei Zoom-In differenzierter.
- Sprach-Fallback funktioniert: `name:de` -> `name:en` -> `name`.
- Attribution im UI sichtbar.

### 6.2 Reproduzierbare Testliste (3 Regionen)

1. **DACH:** Berlin, Zurich, Lake Constance, Rhine
2. **Nordamerika:** New York, Toronto, Lake Superior, Mississippi
3. **Asien:** Tokyo, Seoul, Lake Biwa, Yangtze

### 6.3 Abnahmeprotokoll

- Build/Run in Production-Config.
- Jede Region in mindestens 3 Zoomstufen pruefen (weit/mittel/nah).
- Screenshots mit sichtbaren Labeln und Wasser-Features dokumentieren.
- Pass nur, wenn alle 3 Regionen komplett gruen sind.

---

## 7. Replay-, Story- und Overlay-Gates

**Ziel:** Nachweis, dass GeoMap nicht nur statische Layer zeigt, sondern einen analystentauglichen
Replay-/Story-Workflow traegt.

### 7.1 Replay-/Timeline-Gate

- Zeitfenster kann aktiv gesetzt und wieder auf gesamten Zeitraum zurueckgesetzt werden.
- Timeline-Scrub/Brush aendert sichtbare Events, Marker und Story-Hervorhebungen konsistent.
- Zeit-Presets (z. B. `24H`, `7D`, `1M`, `ALL`) schalten ohne Inkonsistenzen.
- Sichtfenster (`view extent`) und aktives Filterfenster (`time filter window`) lassen sich getrennt denken und verursachen keine verdeckten Seiteneffekte.
- Story-/Selection-Aktivierung darf Kamera und Zeitfenster setzen, ohne den globalen Timeline-Zustand unkontrolliert zu zerlegen.
- Timeline ist kein reines Anzeigeelement, sondern beeinflusst den sichtbaren Datensatz.

**Ist-Stand 2026-03-10:** `TimelineStrip.tsx` enthaelt Brush-/Playback-/Decay-Preview-Steuerung und publiziert jetzt ein effektives Replay-Fenster in den Workspace-Store. Karte, Timeline, Region-News, Context-Feed und Game-Theory reagieren bereits darauf. Timeline-Auswahl kann inzwischen auch den verknuepften Event im Workspace selektieren, sichtbare Timeline-Eintraege werden bereits am aktiven Event-Filter-Contract ausgerichtet, das Game-Theory-Panel folgt nicht mehr nur dem Replay-Fenster, sondern dem aktuell sichtbaren Event-Satz, region-getaggte Context-Items koennen bei vorhandener Region-Metadatenlage bereits dem aktiven Regionsfilter folgen, und offene Candidates plus Region-News haengen im sichtbaren Workspace jetzt ebenfalls am gemeinsamen Such-/Regionsvertrag statt nur an replay-gefilterten Arrays. Code-seitige Zeit-Presets `24H/7D/1M/ALL` sind vorhanden, und `Reset` bringt Playback/Brush/Cursor bereits deterministisch in einen neutralen Timeline-Zustand und loest den selektierten Workspace-Fokus. Neu ist ausserdem ein separater `timelineViewRangeMs`-Pfad fuer das sichtbare Timeline-Fenster sowie `timelineSelectedTimeMs` fuer den Cursor-/Selected-Time-Begriff, sodass Presets nicht mehr nur das aktive Replay-Fenster verkleidet verschieben. `selected time` bleibt ausserhalb aktiven Playbacks jetzt eigenstaendig, Domain-Wechsel clampen sichtbares Zeitfenster sowie Selected-Time wieder auf gueltige Timeline-Grenzen, und das Timeline-UI macht die Beziehung zwischen sichtbarem Fenster und aktivem Filterfenster jetzt explizit sichtbar (`neutral/view_only/filter_only/linked/independent`) statt nur implizit im Store. Zusaetzlich gibt es jetzt einen ersten expliziten Story-Autofit-Pfad (`Apply story window`), der Fokus-Event, sichtbares Zeitfenster und aktives Filterfenster gemeinsam auf den selektierten Timeline-Eintrag setzt. Wiederverwendbare Story-Presets leben nun im gemeinsamen Workspace-State, inklusive explizitem `activeStoryFocusPresetId`, Anwendungs- und Remove-Pfad im Timeline-Workspace; beim Anwenden wird ausserdem die Timeline-Selektion wiederhergestellt. Der non-live v2-Vertrag fuer Timeline/Temporal/Story gilt damit als geschlossen; offen bleibt der vollstaendige Browser-Nachweis fuer das Zusammenspiel von Story, Kamera, Sichtfenster und Filterfenster.

### 7.2 Story-/Kamera-Gate

- Auswahl einer Story setzt Kartenfokus oder Kamera nachvollziehbar auf den relevanten Raum.
- Story kann das aktive Zeitfenster mitsetzen oder eingrenzen.
- Story-Hervorhebungen bleiben mit Timeline und Detailansicht konsistent.
- Reset loest Story-Zustand, Zeitfenster und Fokus kontrolliert auf.

**Ist-Stand 2026-03-10:** Einzelne Event-Selektion kann den Globe bereits ueber einen kleinen
`viewport-focus`-Contract auf die Marker-Koordinate animieren. Timeline-Reset ist mittlerweile
bis in Workspace-Selektion, Selected-Time, aktives Story-Preset und neutralen Viewport-Reset hinein
verdrahtet, und der Selection-/Timeline-Fokus laeuft inzwischen ueber einen kleinen
`geo-story-focus`-Contract statt nur implizit ueber Shell-Effekte. Er traegt einen `regionId`-Hinweis
mit, der bei leerem Regionsfilter einen plausiblen Region-Fokus uebernehmen kann und fuer verknuepfte
Events jetzt belastbarer aus dem Event-Datensatz in Story-Presets uebernommen wird. Timeline-Details
koennen ausserdem ueber `Apply story window` bereits Zeitfenster und aktives Filterfenster gemeinsam
auf den fokussierten Eintrag setzen; wiederverwendbare Story-Presets lassen sich im Workspace speichern,
aktivieren und wieder entfernen. Beim Anwenden wird die Timeline-Selektion ebenfalls wiederhergestellt.
Candidate Queue, Region-News und Context-Feed nutzen inzwischen denselben Detail-Grundvertrag fuer
Titel/Summary/Meta wie Event-/Timeline-Details, statt drei eigene Mini-Formate zu pflegen. Dieses Gate
gilt non-live fuer v2-Core als geschlossen und bleibt als Verify-Gate offen, bis Timeline-/Story-Auswahl denselben Fokuspfad im Browser benutzt, Region-Fokus sauber
nachvollzogen ist und der Reset-Vertrag manuell nachgewiesen ist.

### 7.3 Overlay-Chrome-Gate

- `timeline`, `filters`, `legend` und vergleichbare UI-Chrome-Elemente sind separat schaltbar.
- Das Ausblenden von UI-Chrome veraendert keine Daten-Layer.
- Das Ausblenden von Daten-Layern veraendert keine UI-Chrome-Sichtbarkeit.
- Analysten koennen eine reduzierte Arbeitsansicht herstellen, ohne Datenzustand zu verlieren.

**Ist-Stand 2026-03-10:** Store-seitige Flags und Shell-Controls fuer `showFiltersToolbar`, `showBodyLayerLegend` und `showTimelinePanel` sind vorhanden. Offen bleibt der manuelle Gate-Nachweis, dass diese Toggles im Browser keine Seiteneffekte auf Candidate-/Region-/Heat-/Soft-Signal-Layer haben.

### 7.4 Abnahmeprotokoll

1. GeoMap mit Seed-Datensatz starten
2. Zeitfenster auf Teilintervall eingrenzen
3. Verifizieren, dass Marker, Timeline und Detailansicht denselben Ausschnitt zeigen
4. Story aktivieren und Kamerafokus + Zeitfenster dokumentieren
5. `timeline`, `filters`, `legend` einzeln aus-/einblenden
6. Daten-Layer separat toggeln und auf Seiteneffekte pruefen
7. Reset-Workflow dokumentieren

### 7.5 Keyboard-/Focus-Gate

- Shortcuts feuern nicht innerhalb von `input`, `textarea`, `select` oder `contenteditable`.
- `Delete` priorisiert selektierte Zeichnungen vor Marker-Loeschung.
- `Undo`/`Redo` reagieren konsistent auf `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y`.
- `Esc` fuehrt verlässlich in den Cursor-Modus zurueck.

**Ist-Stand 2026-03-10:** Der Shortcut-Entscheider ist in einen kleinen testbaren Helper
extrahiert; Unit-Tests decken Editierfeld-Schutz, Delete-Prioritaet und Undo/Redo-Kontext ab.
Das Gate bleibt offen, bis Fokus-Reihenfolge und Browser-Kontext manuell verifiziert sind.

### 7.6 Responsive-/Mobile-Gate

- Mobile startet mit kollabierten Sidebars, ohne dass linkes und rechtes Workspace-Panel gleichzeitig unkontrolliert offen bleiben.
- Floating-Panels, Footer-Status und Timeline-Workspace kollidieren nicht.
- Modals und Timeline-Detail bleiben auf Mobile/Tablet bedienbar.
- Resize-spezifische Desktop-Interaktionen werden auf Mobile nicht versehentlich angeboten.

**Ist-Stand 2026-03-10:** Die Shell kollabiert Sidebars auf kleinen Viewports bereits initial, verhindert paralleles Links-/Rechts-Offen auf Mobile, hebt Floating-Panels ueber den Footer und deaktiviert Resize-Griffe auf Mobile. Das Gate bleibt offen, bis ein echter Browser-/Viewport-Pass fuer Mobile und Tablet dokumentiert ist.

### 7.7 Export-Gate

- JSON/CSV und PNG/PDF koennen aus demselben sichtbaren GeoMap-Zustand erzeugt werden.
- Filter, sichtbares Zeitfenster und ausgewaehlter Fokus werden in den Exporten nachvollziehbar gespiegelt.
- Snapshot-Exporte schneiden keinen wesentlichen UI- oder Kartenkontext ab.

**Ist-Stand 2026-03-10:** JSON/CSV sind serverseitig vorhanden, PNG/PDF laufen als Browser-Snapshot. Das Gate bleibt offen, bis fuer einen identischen gefilterten Arbeitszustand ein manueller Export-Vergleich dokumentiert ist.

---

## 8. Ontologie-, Graph-, Track- und Writeback-Gates

Diese Gates pruefen die Nicht-UI-Runtime-Sicht aus
`GEOMAP_ONTOLOGY_GRAPH_RUNTIME.md` und werden im Execution-Slice unter
`OG.*`, `API.6/API.7` und `T.17-T.19` operationalisiert.

### 8.1 Search-Around Contract Gate

- API liefert deterministisch `nodes`, `edges`, optional `metrics`, `time_window`.
- Traversal-Parameter (Tiefe, Relationstypen, Zeitfenster) sind im Ergebnis nachvollziehbar.
- Ergebnis kann in Globe, Flat und Panel identisch interpretiert werden.

### 8.2 GeoTrack/Interpolation Gate

- Geotemporale Serien sind ueber `seriesId` eindeutig und reproduzierbar.
- Interpolationsmodus ist explizit (`LINEAR|NEAREST|PREVIOUS|NEXT|NONE`), kein stilles Defaulting.
- Story/Replay dokumentiert den aktiven Interpolationsmodus fuer Analysten sichtbar.

### 8.3 Writeback-Audit Gate

- Kartenmutationen laufen nur ueber validierte Actions, nicht ueber direkte Rohschreibpfade.
- Jede Mutation erzeugt append-first Auditdaten (`actor`, `reason`, `before/after`, `timestamp`).
- Timeline/Audit-Ansicht zeigt den Mutationstyp nachvollziehbar.

### 8.4 Abnahmeprotokoll

1. Search-Around mit festem Seed-Datensatz 2x ausfuehren -> identische Struktur validieren.
2. GeoTrack-Replay fuer alle Interpolationsmodi gegen Referenzpunkte pruefen.
3. Point/Shape/State-Writeback aus UI ausloesen und Audit-/Timeline-Eintraege kontrollieren.
4. Ergebnisse im `geomap_closeout` gegen `OG.*`, `API.6/API.7`, `T.17-T.19` abhaken.
