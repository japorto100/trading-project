# Geocoding Strategy

**Stand:** 26. Feb 2026
**Scope:** Geocoding-Abstraction für GeoMap und Geopolitical-Kandidaten-Ingest

---

## Provider-Abstraction Interface

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

---

## Provider-Kette (Chain of Responsibility)

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

---

## Cache-Schema (IndexedDB)

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

---

## ISO 3166 Country-Code Lookup

Statische Tabelle: `go-backend/data/iso3166.json`

```json
{
  "AF": {"name": "Afghanistan", "alpha3": "AFG", "lat": 33.93911, "lon": 67.709953},
  "AL": {"name": "Albania", ...},
  ...
}
```

Used by: Go-Backend Bulk-Geocoding, Next.js `/api/geopolitical/candidates/ingest/*`

---

## Implementierungs-Plan (Phase 12)

| Schritt | Datei | Scope |
|:--------|:------|:------|
| 1 | `src/lib/geocoding/provider.ts` | Interface-Definition |
| 2 | `src/lib/geocoding/nominatim.ts` | Nominatim-Impl |
| 3 | `src/lib/geocoding/cache.ts` | IndexedDB Cache |
| 4 | `src/lib/geocoding/chain.ts` | Chain-of-Responsibility |
| 5 | `src/lib/geocoding/index.ts` | Public API |

---

## Änderungshistorie

| Datum | Änderung |
|:------|:---------|
| 26. Feb 2026 | Initial — Phase 4 Closeout |
