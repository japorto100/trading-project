# Evaluate (Compressed) - Archived

> Archiviert aus `docs/geo/evaluate-compressed.md` am 09.03.2026.
> Aktive Scope-Entscheidungen wurden in die Geo-Specs uebernommen.

## Key Insights (aus `evaluate.md`)

- 2026 ist eine "Google-Maps-nahe" Experience technisch machbar, aber die haertesten Teile sind Daten-Netzwerkeffekte (Live Traffic, POI-Qualitaet, Behavioral Signals) statt nur Software.
- Realistischer Zielstack: offene Basemap + moderne Vector Tiles + Such-/POI-Graph + Routing + optional Street Imagery + Traffic-Pipeline.
- PMTiles ist fuer CDN-/Object-Storage-first Hosting attraktiv (Range Requests, single-file, read-only, Rebuild-Workflow).
- Live Traffic bleibt der Engpass ohne eigene Probe-Datenbasis; OpenTraffic zeigt eine Referenz-Pipeline.
- POI-Qualitaet braucht Conflation, Entity Resolution und LTR-Ranking mit Nutzersignalen.
- Street-Level-Imaging in CH/EU benoetigt Privacy-by-Design (Blurring/Redaction, Prozesse fuer Loeschung/Korrektur).
- Praktischer Kompromiss in Enterprise: offene Basemap intern + ggf. Traffic/POI/Geocoding als Datenvertrag.

## Projekte/Libraries (vollstaendige Erwaehnung)

### Karten-Rendering / Tiles / Hosting

- MapLibre
- PMTiles
- OpenMapTiles
- Planetiler
- tilemaker
- MBTiles
- Mapbox Vector Tile Spec (MVT)
- Martin
- Tegola
- TileServer GL
- pg_tileserv
- Maputnik
- pygeoapi
- BBOX Server
- pg_featureserv

### Geocoding / Search / POI / Entity-Resolution

- Nominatim
- Pelias
- Photon
- Who's On First (WOF)
- OpenAddresses
- Wikidata
- Elasticsearch Learning to Rank (LTR)
- Splink
- Dedupe
- GeoNames
- OpenSearch (als Search-Index-Option im Architekturteil)

### Routing / Navigation / Transport

- Valhalla
- OSRM
- GraphHopper
- OpenTripPlanner (OTP)
- OpenRouteService
- BRouter
- pgRouting

### Traffic / Incidents / Mobility

- OpenTraffic (OTv2)
- OpenTraffic Reporter
- Waze for Cities
- Tile38

### Street-Level Imagery / 3D / Annotation

- Mapillary
- MapillaryJS
- mapillary_tools
- KartaView
- Cyclomedia
- OpenDroneMap
- COLMAP
- OGC 3D Tiles
- Project Sidewalk
- StreetComplete

### Simulation / Research / Visualization

- Eclipse SUMO
- MATSim
- Kepler.gl
- deck.gl
- OSMCha

### Grosse Daten-/Oekosystembausteine

- OpenStreetMap (OSM)
- Overture Maps Foundation

### Kommerzielle Referenzen (Vergleich/Optionen)

- Mapbox
- Azure Maps
- HERE
- TomTom

## URL-Sammlung (pro Projekt/Library)

- MapLibre: https://www.maplibre.org/
- PMTiles Docs: https://docs.protomaps.com/pmtiles/
- PMTiles CLI/Go: https://github.com/protomaps/go-pmtiles
- OpenMapTiles: https://openmaptiles.org/
- Planetiler: https://github.com/onthegomap/planetiler
- tilemaker: https://github.com/systemed/tilemaker
- MBTiles Spec: https://github.com/mapbox/mbtiles-spec
- MVT Spec: https://github.com/mapbox/vector-tile-spec
- Martin: https://github.com/maplibre/martin
- Tegola: https://github.com/go-spatial/tegola
- TileServer GL: https://github.com/maptiler/tileserver-gl
- pg_tileserv: https://github.com/CrunchyData/pg_tileserv
- Maputnik: https://maputnik.github.io/
- pygeoapi: https://pygeoapi.io/
- BBOX Server: https://bbox.earth/
- pg_featureserv: https://github.com/CrunchyData/pg_featureserv
- Nominatim: https://nominatim.org/
- Nominatim Docker: https://github.com/mediagis/nominatim-docker
- Pelias: https://pelias.io/
- Photon: https://github.com/komoot/photon
- Who's On First: https://www.whosonfirst.org/
- OpenAddresses: https://openaddresses.io/
- Wikidata: https://www.wikidata.org/
- Elasticsearch LTR: https://elasticsearch-learning-to-rank.readthedocs.io/
- Splink: https://moj-analytical-services.github.io/splink/
- Dedupe: https://github.com/dedupeio/dedupe
- GeoNames: https://www.geonames.org/
- OpenSearch: https://opensearch.org/
- Valhalla: https://github.com/valhalla/valhalla
- OSRM: https://project-osrm.org/
- OSRM Backend: https://github.com/Project-OSRM/osrm-backend
- GraphHopper: https://www.graphhopper.com/open-source/
- OpenTripPlanner: https://opentripplanner.org/
- OpenRouteService: https://openrouteservice.org/
- BRouter: https://brouter.de/brouter/
- pgRouting: https://pgrouting.org/
- OpenTraffic: https://github.com/opentraffic
- OpenTraffic Reporter: https://github.com/opentraffic/reporter
- Waze for Cities: https://www.waze.com/wazeforcities
- Tile38: https://tile38.com/
- Mapillary API: https://www.mapillary.com/developer/api-documentation
- MapillaryJS: https://mapillary.github.io/mapillary-js/
- mapillary_tools: https://github.com/mapillary/mapillary_tools
- KartaView Upload API: https://kartaview.org/doc/uploads
- Cyclomedia Developer: https://www.cyclomedia.com/en/developer
- OpenDroneMap: https://www.opendronemap.org/
- COLMAP: https://colmap.github.io/
- OGC 3D Tiles: https://www.ogc.org/standards/3dtiles/
- Project Sidewalk: https://sidewalk.cs.washington.edu/
- StreetComplete: https://streetcomplete.app/
- Eclipse SUMO: https://eclipse.dev/sumo/
- MATSim: https://www.matsim.org/
- Kepler.gl: https://kepler.gl/
- deck.gl: https://deck.gl/
- OSMCha: https://osmcha.org/
- OpenStreetMap: https://www.openstreetmap.org/
- Overture Maps Foundation: https://overturemaps.org/
- Mapbox: https://www.mapbox.com/
- Azure Maps: https://azure.microsoft.com/en-us/products/azure-maps
- HERE: https://www.here.com/
- TomTom: https://www.tomtom.com/
