# GeoMap Phase 4 — Verifikation und Abnahme

> Stand: 09. Mär 2026  
> Zweck: Draw-Workflow, E2E-Abnahme, Save-Fehlerpfad, Performance-Baseline. Referenz: `GEOMAP_OVERVIEW.md`, `GEOMAP_FOUNDATION.md`

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

### 1.2 Ablauf

1. `/geopolitical-map` oeffnen
2. Drawing-Toolbar: Tool waehlen (Marker/Line/Polygon/Text)
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
- Timeline ist kein reines Anzeigeelement, sondern beeinflusst den sichtbaren Datensatz.

### 7.2 Story-/Kamera-Gate

- Auswahl einer Story setzt Kartenfokus oder Kamera nachvollziehbar auf den relevanten Raum.
- Story kann das aktive Zeitfenster mitsetzen oder eingrenzen.
- Story-Hervorhebungen bleiben mit Timeline und Detailansicht konsistent.
- Reset loest Story-Zustand, Zeitfenster und Fokus kontrolliert auf.

### 7.3 Overlay-Chrome-Gate

- `timeline`, `filters`, `legend` und vergleichbare UI-Chrome-Elemente sind separat schaltbar.
- Das Ausblenden von UI-Chrome veraendert keine Daten-Layer.
- Das Ausblenden von Daten-Layern veraendert keine UI-Chrome-Sichtbarkeit.
- Analysten koennen eine reduzierte Arbeitsansicht herstellen, ohne Datenzustand zu verlieren.

### 7.4 Abnahmeprotokoll

1. GeoMap mit Seed-Datensatz starten
2. Zeitfenster auf Teilintervall eingrenzen
3. Verifizieren, dass Marker, Timeline und Detailansicht denselben Ausschnitt zeigen
4. Story aktivieren und Kamerafokus + Zeitfenster dokumentieren
5. `timeline`, `filters`, `legend` einzeln aus-/einblenden
6. Daten-Layer separat toggeln und auf Seiteneffekte pruefen
7. Reset-Workflow dokumentieren
