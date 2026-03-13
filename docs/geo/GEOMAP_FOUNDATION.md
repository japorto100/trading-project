# GeoMap Foundation

**Stand:** 13. Maerz 2026
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

### 3.1 Dynamic Tile Runtime Boundary (derived from geov2plus)

Operationale Event-/Filter-Workloads sollen nicht ueber statisch vorgerenderte Tiles
modelliert werden. Fuer dynamische Geo-Last gilt:

- statische Basemap/Orientierung: PMTiles/OpenMapTiles (gate-gesteuert),
- dynamische Overlays (Events/Candidates/Conflict): API/Stream oder dynamische MVT-Pfade,
- optionaler Dynamic-Tile-Server (z. B. Martin oder pg_tileserv) nur fuer klar belegte
  Query-/Filterfaelle mit messbarem Nutzen.

Nicht-Ziel:

- kein ungepruefter Wechsel auf vollstaendige Tile-Only-Architektur fuer alle Layer.

### 3.2 Geometry/CRS/H3 guardrails

Fuer GeoMap-Contracts bleibt verbindlich:

- Persistenz-/Eingabe-CRS: WGS84 (`EPSG:4326`),
- Rendering-Projektion ist view-abhaengig (Globe/Flat), ohne aenderung der Domain-Daten,
- H3 ist fuer Aggregation/Indexierung erlaubt, aber keine automatische semantische
  Gleichsetzung mit exakten Geoshapes ohne explizite Umwandlung.

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

### Renderer- und Body-Leitplanken (Normativ)

- `d3-geo` ist **nicht** als Fehlentscheidung zu behandeln. Es bleibt der normative Globe-Core fuer GeoMap v1/v2.
- `deck.gl` / `MapLibre` sind als **zusaetzlicher Renderer** fuer den spaeteren Flat/Regional-/Conflict-Mode zu behandeln, nicht als Rewrite des Globe-Cores.
- Renderer duerfen wechseln, das Fachmodell jedoch nicht: Filter-, Story-, Selection- und Layer-Contracts bleiben view-agnostisch.
- `Earth` bleibt der primaere geopolitische Arbeitskoerper.
- `Moon` ist aktuell ein spezialisierter Body-/Focus-Mode, **kein** zweiter gleichrangiger Analysten-Workspace fuer v2.
- Ein gleichzeitiger `Earth + Moon`-Co-View oder echter Multi-Body-Szene-Modus ist **nicht** Teil von v2. Wenn spaeter ein physisch plausibler Multi-Body-/Orbit-Modus gewuenscht ist, ist das als eigener Scene-Renderer (`CesiumJS`/`Three.js`-Klasse) zu bewerten, nicht als erzwungene Ausdehnung des `d3-geo`-Globe.

### View-Handoff-Regel (Normativ)

Der spaetere Wechsel von Globe zu Flat/Regional darf **nicht** nur als statischer Toggle gedacht werden.
Der bevorzugte Produktpfad ist ein **kontextueller Handoff**:

- Region-Klick oder Event-/Cluster-Selektion kann einen regionalen Analystenmodus oeffnen
- Story-/Timeline-Fokus kann Kamera, Zeitfenster und anschliessend auch den Flat-Viewport setzen
- Draw-/Lasso-/Area-Selektion darf als expliziter `inspect in flat view`-Pfad dienen
- ein manueller Toggle bleibt als Expertenfunktion erlaubt, ist aber nicht das alleinige UX-Modell

Der Handoff muss mindestens mitgeben:

- Viewport / Bounds
- aktives Zeitfenster
- aktive Filter
- aktuelles Focus-/Selection-Objekt

### Layer- und Signaltaxonomie (Normativ)

GeoMap darf nicht jeden raumbezogenen oder halb-raeumlichen Input direkt auf den Globe legen.
Es gilt eine Layer-Trennung:

- **Geo Core:** harte geolokalisierbare und strategisch relevante Events/Signals
- **Conflict Layer:** strikes, incidents, fronts, assets, targets, threat zones, replay
- **Macro/State Layer:** regime state, sanctions, capital controls, elections, unrest intensity
- **Context Layer:** News, reports, analyst context, soft signals
- **Panel-first / hidden:** schwache, unscharfe oder nur textuelle Signale ohne klaren Kartenmehrwert

Die Regel fuer v2/v2.5 lautet:

- Globe zeigt den strategischen, kuratierten Kern
- Flat/Regional traegt spaeter den dichteren operativen Conflict-/Asset-/Threat-Modus
- dieselben Domain-Contracts bleiben shared; nur die Sichtbarkeit und Renderdichte unterscheiden sich

### Basemap-Richness-Regel (Normativ)

Basemap-Details werden je View bewusst begrenzt:

- **Globe:** nur reduzierte Orientierungsfeatures mit hohem strategischem Nutzen
  - `place`
  - `water`
  - `waterway`
  - grosse Gebirge / Chokepoints nur wenn lesbar und analytisch begruendet
- **Flat/Regional:** reichere Basemap ist erlaubt und spaeter zu erwarten
  - Staedte
  - Gewaesser / Fluesse
  - Grenzen
  - optional Terrain / Relief / PMTiles-basierte Orientierung

PMTiles, detailreiche Tiles und staerkere Kartographie gehoeren primaer in den spaeteren Flat/Regional-Modus, nicht als v2-Zwang fuer den Globe-Core.

Aktueller Runtime-Contract:

- `src/features/geopolitical/basemap-richness.ts` spiegelt diese Regel als typisierte Policy fuer `earth/moon × globe/flat`.
- `earth + globe` bleibt minimal und tile-frei.
- `earth + flat` ist der erste erlaubte Pfad fuer reichere PMTiles-/MapLibre-Basemaps.
- `moon + flat` bleibt fuer v2 bewusst deferred.

### Externe Referenzbestaetigung (Pharos AI, Review 2026-03-10)

Das Referenzreview in [`PHAROS_AI_REVIEW.md`](./PHAROS_AI_REVIEW.md) bestaetigt die
fachliche Sinnhaftigkeit eines zweiten, operativen Flat-/Regional-Modus fuer dichte
Conflict-Layer.

Normative Konsequenz:

- Globe bleibt **Primary Strategic View**
- Flat/Regional bleibt **Optional Analyst View**
- `MapLibre`/`deck.gl`/`PMTiles` sind weiterhin **kein Core-Replacement**, sondern
  gate-gesteuerte Ergaenzungen fuer den Flat/Regional-Modus
- ein spaeterer Flat-Mode nutzt **dieselben fachlichen Layer-/Story-/Filter-Vertraege**
  wie der Globe-Mode

#### deck.gl / MapLibre / h3-lite = Gate-gesteuert

Alternativbibliotheken werden **nur** eingeführt, wenn ein oder mehrere der folgenden
Entry-Gate-Trigger ausgelöst werden:

| Gate | Trigger-Kriterium | Erwartetes Outcome |
|:-----|:------------------|:-------------------|
| **Trigger A** | FPS < 45 bei Szenario B (200 Events gleichzeitig) — gemessen via Chrome DevTools Performance Tab auf Referenz-Hardware | Migration auf WebGL-Layer via `deck.gl` ScatterplotLayer |
| **Trigger B** | Analyst-Demand: ≥ 3 dokumentierte Feature-Requests für Tile-basierte Hintergrundkarte mit Attribution | Evaluation MapLibre GL JS + PMTiles (siehe Sek. 3) |
| **Trigger C** | H3-Radius-Query-Latenz > 5 ms für 1000-Event-Datensatz in Browser (P95) | Einführung `h3-lite` WASM für hexagonale Binning-Queries |

Ohne Trigger-Auslösung: keine neuen Render-Bibliotheken.

### Erweiterte Trigger-Interpretation fuer Conflict-Layer

Zusätzlich zu Trigger A/B/C gilt:

- hohe regionale Konfliktdichte allein rechtfertigt **keinen** Globe-Rewrite
- sie kann aber einen **Flat/Regional Analyst View** rechtfertigen
- dieser Modus ist bevorzugt, wenn:
  - Threat-Zones, Strike-/Missile-Arcs, Target-/Asset-Lagen und Story-Playback in enger
    Region im Vordergrund stehen
  - die Analystenarbeit eher operativ/taktisch als global-strategisch ist

Siehe dazu [`PHAROS_AI_REVIEW.md`](./PHAROS_AI_REVIEW.md).

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
