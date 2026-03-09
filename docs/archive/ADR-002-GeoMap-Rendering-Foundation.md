# ADR-002: GeoMap Rendering Foundation

**Status:** ACCEPTED
**Stand:** 26. Feb 2026
**Autoren:** Architektur-Team
**Kontext:** Phase 4 — GeoMap v2, D3 hybrid rendering

---

## Kontext

Die GeoMap-Komponente benötigt eine stabile Rendering-Grundlage für v1/v2/v3. Entscheidungen
über die Rendering-Engine haben langfristige Konsequenzen für Bundle-Größe, Performance und
Third-Party-Lock-in.

---

## Entscheidung

### Globe = Core View (v1/v2/v3)

Die primäre Ansicht ist und bleibt die **Orthographic Globe-Projektion** via `d3-geo`.

- Engine: `d3-geo` (Orthographic-Projektion, `d3-zoom` für Interact)
- Daten: `world-atlas` TopoJSON (world/110m + world/50m, public domain)
- Rendering: `<canvas>` für Performance-kritische Schichten (Events, Heatmap), SVG für Labels

### Flat/Regional = Optionaler Second Mode

Eine flache/regionale Ansicht (Mercator-Projektion, bspw. für Regionen-Zoom) ist als
**optionaler Second Mode** vorgesehen und auf Phase 4/v2.5+ verschoben. Sie teilt dieselbe
`d3-geo`-Grundlage.

### deck.gl / MapLibre / h3-lite = Gate-gesteuert

Alternativbibliotheken werden **nur** eingeführt, wenn ein oder mehrere der folgenden
Entry-Gate-Trigger ausgelöst werden:

| Gate | Trigger-Kriterium | Erwartetes Outcome |
|:-----|:------------------|:-------------------|
| **Trigger A** | FPS < 45 bei Szenario B (200 Events gleichzeitig) — gemessen via Chrome DevTools Performance Tab auf Referenz-Hardware | Migration auf WebGL-Layer via `deck.gl` ScatterplotLayer |
| **Trigger B** | Analyst-Demand: ≥ 3 dokumentierte Feature-Requests für Tile-basierte Hintergrundkarte mit Attribution | Evaluation MapLibre GL JS + PMTiles (siehe `PMTILES_CONTRACT.md`) |
| **Trigger C** | H3-Radius-Query-Latenz > 5 ms für 1000-Event-Datensatz in Browser (P95) | Einführung `h3-lite` WASM für hexagonale Binning-Queries |

Ohne Trigger-Auslösung: keine neuen Render-Bibliotheken.

---

## Begründung

1. **Minimaler Stack**: `d3-geo` ist bereits in der Codebase, keine zusätzliche Abhängigkeit.
2. **Public Domain Daten**: `world-atlas` benötigt keine Attribution (public domain).
3. **Bundle-Größe**: deck.gl adds ~380 KB gzip; nicht rechtfertigbar ohne Performance-Problem.
4. **Lock-in**: MapLibre/Leaflet erfordern Tile-Provider-Entscheidung und Attribution-Policy.
5. **Testbarkeit**: D3-only ist in Node.js-Umgebung testbar; WebGL-Renderer nicht.

---

## Verworfene Alternativen

| Alternative | Grund für Ablehnung |
|:------------|:--------------------|
| Leaflet | Tile-basiert, schlechte Canvas-Integration, VERBOTEN (CLAUDE.md) |
| MapLibre GL JS | Tile-Provider-Abhängigkeit, Attribution-Pflicht, Gate B als Eingang |
| deck.gl direkt | Bundle 380 KB+, Gate A als Eingang |
| OpenLayers | Zu schwer, keine signifikante Mehrwert gegenüber d3-geo |

---

## Konsequenzen

- Performance-Baseline wird in `docs/PERFORMANCE_BASELINE.md` dokumentiert
- Szenario-A/B/C FPS-Messungen sind Voraussetzung für Gate-A-Auslösung
- Neue Map-Bibliotheken erfordern ADR-Update (ADR-003+)

---

## Änderungshistorie

| Datum | Änderung |
|:------|:---------|
| 26. Feb 2026 | Initial — Phase 4 Closeout |
