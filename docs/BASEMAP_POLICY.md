# Basemap Policy

**Stand:** 26. Feb 2026
**Scope:** GeoMap-Komponente — Datenquellen, Attribution, Geocoding-Strategie

---

## Basemap-Datenquellen

### Primäre Quelle: world-atlas (public domain)

| Eigenschaft | Wert |
|:------------|:-----|
| Paket | `world-atlas` (npm) |
| Format | TopoJSON |
| Auflösung | 110m (overview), 50m (detail) |
| Lizenz | Public Domain (keine Attribution nötig) |
| Bundle-Impact | ~380 KB raw, ~45 KB gzip (110m) |

**Attribution-Pflicht:** Keine. `world-atlas` verwendet Natural Earth-Daten (public domain).

### Verbotene Datenquellen (Phase 4)

- Leaflet-Tiles (OSM): Attribution-Pflicht + Tile-Server-Abhängigkeit — VERBOTEN (CLAUDE.md)
- MapLibre-Tiles: Gate B in ADR-002 erforderlich
- Google Maps / Mapbox: Lizenz + API-Key — VERBOTEN

---

## Geocoding-Tier-Strategie

### Tier 1: Client-Side (Browser)

Für einfache Koordinaten-zu-Land-Lookups (Punkt-in-Polygon):

- **Methode:** `d3-geo` `geoContains()` gegen world-atlas Polygone
- **Latenz:** < 1 ms (synchron im Main-Thread)
- **Cache:** Nicht nötig (deterministisch)

### Tier 2: Server-Side (Next.js API Route)

Für Adress-zu-Koordinaten-Lookups (benannt):

- **Provider (primär):** Nominatim OSS (eigene Instanz oder nominatim.openstreetmap.org)
  - Rate Limit: 1 req/s (öffentliche Instanz), unbegrenzt (eigene Instanz)
  - Attribution: OpenStreetMap Contributors (CC-BY-SA)
- **Provider (Fallback):** Positionstack API (freier Tier: 25.000 req/Monat)
- **Cache:** IndexedDB, TTL 30 Tage (Key: `geocode:{query}:{lang}`)

### Tier 3: Batch (Go-Backend)

Für Bulk-Geocoding (Geopolitische Kandidaten-Ingest):

- **Methode:** ISO-3166 Alpha-2/Alpha-3 Code-Lookup gegen statische JSON-Tabelle
  (`go-backend/data/iso3166.json`)
- **Latenz:** < 0.1 ms (In-Memory Map)
- **Fallback:** Tier 2 wenn kein Country-Code vorhanden

---

## IndexedDB Cache Contract

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

## Änderungshistorie

| Datum | Änderung |
|:------|:---------|
| 26. Feb 2026 | Initial — Phase 4 Closeout |
