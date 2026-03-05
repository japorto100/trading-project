# GeoMap Phase 4 — Verifikation und Abnahme

> Stand: 28 Feb 2026  
> Zweck: Draw-Workflow, E2E-Abnahme, Save-Fehlerpfad. Referenz: `GEOPOLITICAL_MAP_MASTERPLAN.md`, `PERFORMANCE_BASELINE.md`, `BASEMAP_POLICY.md`, `adr/ADR-002-GeoMap-Rendering-Foundation.md`

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

## 4. Referenzen

- [`PERFORMANCE_BASELINE.md`](./PERFORMANCE_BASELINE.md) — FPS-Targets, Messprotokoll
- [`BASEMAP_POLICY.md`](./BASEMAP_POLICY.md) — OSM-Attribution, Geocoding
- [`adr/ADR-002-GeoMap-Rendering-Foundation.md`](./adr/ADR-002-GeoMap-Rendering-Foundation.md) — Globe-Core, Flat/Regional optional
