# GeoMap Foundation

**Stand:** 09. Mär 2026
**Scope:** Basemap, Geocoding, Tiles, Rendering — konsolidierte Policy und Architektur-Entscheidungen für GeoMap v2.

> **Herkunft:** Zusammengeführt aus `BASEMAP_POLICY.md`, `GEOCODING_STRATEGY.md`, `PMTILES_CONTRACT.md` und `adr/ADR-002-GeoMap-Rendering-Foundation.md`. Originale archiviert in `docs/archive/`.

---

## 1. Basemap Policy

### Basemap-Datenquellen

#### Primäre Quelle: world-atlas (public domain)

| Eigenschaft | Wert |
|:------------|:-----|
| Paket | `world-atlas` (npm) |
| Format | TopoJSON |
| Auflösung | 110m (overview), 50m (detail) |
| Lizenz | Public Domain (keine Attribution nötig) |
| Bundle-Impact | ~380 KB raw, ~45 KB gzip (110m) |

**Attribution-Pflicht:** Keine. `world-atlas` verwendet Natural Earth-Daten (public domain).

#### Verbotene Datenquellen (Phase 4)

- Leaflet-Tiles (OSM): Attribution-Pflicht + Tile-Server-Abhängigkeit — VERBOTEN (CLAUDE.md)
- MapLibre-Tiles: Gate B in Rendering Foundation (Sek. 4) erforderlich
- Google Maps / Mapbox: Lizenz + API-Key — VERBOTEN

### Geocoding-Tier-Strategie

#### Tier 1: Client-Side (Browser)

Für einfache Koordinaten-zu-Land-Lookups (Punkt-in-Polygon):

- **Methode:** `d3-geo` `geoContains()` gegen world-atlas Polygone
- **Latenz:** < 1 ms (synchron im Main-Thread)
- **Cache:** Nicht nötig (deterministisch)

#### Tier 2: Server-Side (Next.js API Route)

Für Adress-zu-Koordinaten-Lookups (benannt):

- **Provider (primär):** Nominatim OSS (eigene Instanz oder nominatim.openstreetmap.org)
  - Rate Limit: 1 req/s (öffentliche Instanz), unbegrenzt (eigene Instanz)
  - Attribution: OpenStreetMap Contributors (CC-BY-SA)
- **Provider (Fallback):** Positionstack API (freier Tier: 25.000 req/Monat)
- **Cache:** IndexedDB, TTL 30 Tage (Key: `geocode:{query}:{lang}`)

#### Tier 3: Batch (Go-Backend)

Für Bulk-Geocoding (Geopolitische Kandidaten-Ingest):

- **Methode:** ISO-3166 Alpha-2/Alpha-3 Code-Lookup gegen statische JSON-Tabelle
  (`go-backend/data/iso3166.json`)
- **Latenz:** < 0.1 ms (In-Memory Map)
- **Fallback:** Tier 2 wenn kein Country-Code vorhanden

### IndexedDB Cache Contract

```typescript
interface GeocodeCacheEntry {
  query: string;          // normalized (lowercase, trimmed)
  result: { lat: number; lon: number; displayName: string };
  cachedAt: number;       // Unix ms
  ttlMs: number;          // 30 * 24 * 60 * 60 * 1000
}
// Store name: "tradeview-geocode-cache"
// Key path: "query"
```

---

## 2. Geocoding Strategy

### Provider-Abstraction Interface

```typescript
// src/lib/geocoding/provider.ts (Phase 12 implementation)
export interface GeocodeProvider {
  name: string;
  geocode(query: string, options?: GeocodeOptions): Promise<GeocodeResult[]>;
  reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null>;
  isAvailable(): Promise<boolean>;
}

export interface GeocodeOptions {
  lang?: string;           // ISO 639-1 ("en", "de")
  countryCode?: string;    // ISO 3166-1 alpha-2 bias
  limit?: number;          // max results (default: 5)
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  countryCode?: string;   // ISO 3166-1 alpha-2
  type?: string;          // "country" | "city" | "region" | "address"
  confidence?: number;    // 0.0–1.0
}
```

### Provider-Kette (Chain of Responsibility)

```
Query
  │
  ▼
[IndexedDB Cache] ──hit──▶ return cached
  │ miss
  ▼
[Tier 1: d3-geo Country Lookup] ──match──▶ cache + return
  │ no match
  ▼
[Tier 2: Nominatim] ──success──▶ cache + return
  │ rate-limited / error
  ▼
[Tier 3: Positionstack] ──success──▶ cache + return
  │ error
  ▼
[Fallback: null] ──▶ log warning, return null
```

### Cache-Schema (IndexedDB)

**DB Name:** `tradeview-geocode`
**Version:** 1
**Object Store:** `entries`

| Feld | Typ | Beschreibung |
|:-----|:----|:-------------|
| `key` | string | Norm. Query: `{provider}:{query}:{lang}` |
| `result` | GeocodeResult[] | Geocoding-Ergebnis |
| `cachedAt` | number | Unix-Timestamp ms |
| `ttlMs` | number | Standard: 30 Tage |

Cache-Expiry-Prüfung: Bei Lesezugriff, synchron. Abgelaufene Einträge werden lazy gelöscht.

**Max Cache-Einträge:** 10.000 (LRU-Eviction bei Überschreitung)

### ISO 3166 Country-Code Lookup

Statische Tabelle: `go-backend/data/iso3166.json`

```json
{
  "AF": {"name": "Afghanistan", "alpha3": "AFG", "lat": 33.93911, "lon": 67.709953},
  "AL": {"name": "Albania", ...},
  ...
}
```

Used by: Go-Backend Bulk-Geocoding, Next.js `/api/geopolitical/candidates/ingest/*`

### Implementierungs-Plan (Phase 12)

| Schritt | Datei | Scope |
|:--------|:------|:------|
| 1 | `src/lib/geocoding/provider.ts` | Interface-Definition |
| 2 | `src/lib/geocoding/nominatim.ts` | Nominatim-Impl |
| 3 | `src/lib/geocoding/cache.ts` | IndexedDB Cache |
| 4 | `src/lib/geocoding/chain.ts` | Chain-of-Responsibility |
| 5 | `src/lib/geocoding/index.ts` | Public API |

---

## 3. PMTiles Contract

### Grundsatz

PMTiles werden **nicht** im Standard-Stack eingesetzt. Die Einführung ist an **Gate B** aus
der Rendering Foundation (Sek. 4) gebunden: ≥ 3 dokumentierte Analyst-Feature-Requests für Tile-basierte Hintergrundkarte.

Bis Gate B: d3-geo mit world-atlas (public domain). Keine Tile-Server-Abhängigkeit.

### Static vs. Live Layers

| Layer-Typ | Aktualisierungsfrequenz | Hosting | Gate |
|:----------|:------------------------|:--------|:-----|
| **Static Basemap** | Einmalig (bei Release) | CDN / Self-hosted | Gate B |
| **Political Boundaries** | Quartalsweise | S3/R2 + CloudFront | Gate B |
| **Live Event Heatmap** | Echtzeit (SSE Push) | D3 Canvas direkt | Kein Gate |
| **Transmission Channels** | Täglich | D3 SVG direkt | Kein Gate |
| **H3 Hexbin Aggregation** | On-demand | Browser (h3-lite WASM) | Gate C |

### PMTiles-Spec (für Gate-B-Implementierung)

#### Dateiformat

- Format: PMTiles v3 (single-file, HTTP Range Requests)
- Projektion: EPSG:4326 (WGS84) für d3-geo-Kompatibilität
- Min/Max Zoom: 0–8 (geopolitischer Use Case)
- Encoder: `tippecanoe` für Vector Tiles

#### Hosting-Anforderungen

```
Static PMTiles (Gate B):
  - CDN: Cloudflare R2 / AWS S3 + CloudFront
  - Cache-Control: max-age=2592000 (30 Tage)
  - CORS: Origin: https://tradeview-fusion.example.com

Fallback (keine CDN):
  - Next.js API Route: GET /api/tiles/[...path]
  - Streaming via HTTP Range Requests
```

#### Attribution-Pflicht bei Gate B

Wenn PMTiles auf OpenStreetMap-Daten basieren:

```html
<!-- Pflicht im Map-Footer -->
<span>© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors</span>
```

world-atlas-Daten (Natural Earth) = public domain, keine Attribution nötig.

### Bandwidth-Trigger (Gate B Quantifizierung)

Gate B "Tile-Bandwidth-Trigger" gilt als ausgelöst, wenn:

1. Tile-Requests > 10 MB/Session (Median über 100 User-Sessions)
2. UND die Ursache in ineffizientem world-atlas Rendering liegt (nicht in Event-Data)
3. UND PMTiles-Lösung einen messbaren FPS-Gewinn ≥ 15% zeigt (A/B-Test, n ≥ 50)

---

## 4. Rendering Foundation (ADR-002)

**Status:** ACCEPTED
**Stand:** 26. Feb 2026

### Kontext

Die GeoMap-Komponente benötigt eine stabile Rendering-Grundlage für v1/v2/v3. Entscheidungen
über die Rendering-Engine haben langfristige Konsequenzen für Bundle-Größe, Performance und
Third-Party-Lock-in.

### Entscheidung

#### Globe = Core View (v1/v2/v3)

Die primäre Ansicht ist und bleibt die **Orthographic Globe-Projektion** via `d3-geo`.

- Engine: `d3-geo` (Orthographic-Projektion, `d3-zoom` für Interact)
- Daten: `world-atlas` TopoJSON (world/110m + world/50m, public domain)
- Rendering: `<canvas>` für Performance-kritische Schichten (Events, Heatmap), SVG für Labels

#### Flat/Regional = Optionaler Second Mode

Eine flache/regionale Ansicht (Mercator-Projektion, bspw. für Regionen-Zoom) ist als
**optionaler Second Mode** vorgesehen und auf Phase 4/v2.5+ verschoben. Sie teilt dieselbe
`d3-geo`-Grundlage.

#### deck.gl / MapLibre / h3-lite = Gate-gesteuert

Alternativbibliotheken werden **nur** eingeführt, wenn ein oder mehrere der folgenden
Entry-Gate-Trigger ausgelöst werden:

| Gate | Trigger-Kriterium | Erwartetes Outcome |
|:-----|:------------------|:-------------------|
| **Trigger A** | FPS < 45 bei Szenario B (200 Events gleichzeitig) — gemessen via Chrome DevTools Performance Tab auf Referenz-Hardware | Migration auf WebGL-Layer via `deck.gl` ScatterplotLayer |
| **Trigger B** | Analyst-Demand: ≥ 3 dokumentierte Feature-Requests für Tile-basierte Hintergrundkarte mit Attribution | Evaluation MapLibre GL JS + PMTiles (siehe Sek. 3) |
| **Trigger C** | H3-Radius-Query-Latenz > 5 ms für 1000-Event-Datensatz in Browser (P95) | Einführung `h3-lite` WASM für hexagonale Binning-Queries |

Ohne Trigger-Auslösung: keine neuen Render-Bibliotheken.

### Begründung

1. **Minimaler Stack**: `d3-geo` ist bereits in der Codebase, keine zusätzliche Abhängigkeit.
2. **Public Domain Daten**: `world-atlas` benötigt keine Attribution (public domain).
3. **Bundle-Größe**: deck.gl adds ~380 KB gzip; nicht rechtfertigbar ohne Performance-Problem.
4. **Lock-in**: MapLibre/Leaflet erfordern Tile-Provider-Entscheidung und Attribution-Policy.
5. **Testbarkeit**: D3-only ist in Node.js-Umgebung testbar; WebGL-Renderer nicht.

### Verworfene Alternativen

| Alternative | Grund für Ablehnung |
|:------------|:--------------------|
| Leaflet | Tile-basiert, schlechte Canvas-Integration, VERBOTEN (CLAUDE.md) |
| MapLibre GL JS | Tile-Provider-Abhängigkeit, Attribution-Pflicht, Gate B als Eingang |
| deck.gl direkt | Bundle 380 KB+, Gate A als Eingang |
| OpenLayers | Zu schwer, keine signifikante Mehrwert gegenüber d3-geo |

### Konsequenzen

- Performance-Baseline wird in `GEOMAP_VERIFY_GATES.md` dokumentiert
- Szenario-A/B/C FPS-Messungen sind Voraussetzung für Gate-A-Auslösung
- Neue Map-Bibliotheken erfordern ADR-Update (ADR-003+)

---

## Änderungshistorie

| Datum | Änderung |
|:------|:---------|
| 09. Mär 2026 | Konsolidierung: BASEMAP_POLICY, GEOCODING_STRATEGY, PMTILES_CONTRACT, ADR-002 zusammengeführt |
| 26. Feb 2026 | Ursprüngliche Inhalte (Phase 4 Closeout) |
