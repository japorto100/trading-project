# PMTiles Contract

**Stand:** 26. Feb 2026
**Scope:** Tile-Layer-Strategie für GeoMap — Gate-B-Bedingung (ADR-002)

---

## Grundsatz

PMTiles werden **nicht** im Standard-Stack eingesetzt. Die Einführung ist an **Gate B** aus
ADR-002 gebunden: ≥ 3 dokumentierte Analyst-Feature-Requests für Tile-basierte Hintergrundkarte.

Bis Gate B: d3-geo mit world-atlas (public domain). Keine Tile-Server-Abhängigkeit.

---

## Static vs. Live Layers

| Layer-Typ | Aktualisierungsfrequenz | Hosting | Gate |
|:----------|:------------------------|:--------|:-----|
| **Static Basemap** | Einmalig (bei Release) | CDN / Self-hosted | Gate B |
| **Political Boundaries** | Quartalsweise | S3/R2 + CloudFront | Gate B |
| **Live Event Heatmap** | Echtzeit (SSE Push) | D3 Canvas direkt | Kein Gate |
| **Transmission Channels** | Täglich | D3 SVG direkt | Kein Gate |
| **H3 Hexbin Aggregation** | On-demand | Browser (h3-lite WASM) | Gate C |

---

## PMTiles-Spec (für Gate-B-Implementierung)

### Dateiformat

- Format: PMTiles v3 (single-file, HTTP Range Requests)
- Projektion: EPSG:4326 (WGS84) für d3-geo-Kompatibilität
- Min/Max Zoom: 0–8 (geopolitischer Use Case)
- Encoder: `tippecanoe` für Vector Tiles

### Hosting-Anforderungen

```
Static PMTiles (Gate B):
  - CDN: Cloudflare R2 / AWS S3 + CloudFront
  - Cache-Control: max-age=2592000 (30 Tage)
  - CORS: Origin: https://tradeview-fusion.example.com

Fallback (keine CDN):
  - Next.js API Route: GET /api/tiles/[...path]
  - Streaming via HTTP Range Requests
```

### Attribution-Pflicht bei Gate B

Wenn PMTiles auf OpenStreetMap-Daten basieren:

```html
<!-- Pflicht im Map-Footer -->
<span>© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors</span>
```

world-atlas-Daten (Natural Earth) = public domain, keine Attribution nötig.

---

## Bandwidth-Trigger (Gate B Quantifizierung)

Gate B "Tile-Bandwidth-Trigger" gilt als ausgelöst, wenn:

1. Tile-Requests > 10 MB/Session (Median über 100 User-Sessions)
2. UND die Ursache in ineffizientem world-atlas Rendering liegt (nicht in Event-Data)
3. UND PMTiles-Lösung einen messbaren FPS-Gewinn ≥ 15% zeigt (A/B-Test, n ≥ 50)

---

## Änderungshistorie

| Datum | Änderung |
|:------|:---------|
| 26. Feb 2026 | Initial — Phase 4 Closeout |
