# GeoMap Sources and Provider Policy

> **Stand:** 13. Maerz 2026
> **Zweck:** Source-Tiering, Provider-Matrix und Quellenqualitaetsregeln.
> **Source-of-Truth-Rolle:** Owner fuer Source-Auswahl, Hard-/Soft-Signal-Abgrenzung und Provider-Referenzlage.
> **Quelle:** migriert aus `docs/GEOMAP_OVERVIEW.md` (Pre-Split-Archiv in `docs/archive/`).

---

## Scope und Abgrenzung

- Normative GeoMap-Spec unter `docs/specs/geo/`
- Root-GeoMap-Dateien sind nach Split archiviert und aus aktivem Root entfernt

### Basemap Feature Minimum (aus evaluate-compressed abgeleitet)

Fuer den aktuellen GeoMap-Scope (kein Google-Maps-Ersatz) gilt als Mindestanforderung:

- `place` Layer fuer Staedte/Orte (mindestens capital/city/town),
- `water` Layer fuer Seen/Wasserflaechen,
- `waterway` Layer fuer Fluesse/Kanaele.

Technologie-/Projektbezug (verbindliche Referenz fuer GeoMap-Entscheide):

- **PMTiles (Protomaps)** als bevorzugtes statisches Tile-Artefakt,
- **OpenMapTiles** als gaengiges Layer-/Schema-Fundament,
- **Planetiler** (alternativ `tilemaker`) fuer Tile-Builds aus OSM-Extrakten,
- **MapLibre GL JS** nur fuer optionalen Flat/Regional-Mode (Globe-Core bleibt unveraendert).

Betriebsregel dazu:

- Basemap-Features kommen aus kontrollierten Tile-/Provider-Pfaden (nicht aus oeffentlichen Free-Endpoints als Produktions-Rueckgrat),
- Geocoding/Place-Resolution laufen ueber abstrahierten Provider-Layer mit Cache/Fallback,
- Attribution/Lizenzhinweise bleiben sichtbar im UI.

---

## 6. Source strategy: tiers and trust

### 11.1 Source tiers

Tier A (official/high trust):
- central banks,
- sanctions authorities,
- official legal/public notices.

Tier B (structured commercial APIs):
- market/news providers with stable contracts.

Tier C (open/community/unofficial):
- wrappers,
- social feeds,
- forum streams.

### 11.2 Hard-signal first adapters

- Fed/ECB/BoE/BoJ rate schedule and decision pages,
- OFAC sanctions service updates,
- UK sanctions list updates,
- UN sanctions list updates.

### 11.3 Soft-signal candidates

- News APIs,
- selected finance media feeds,
- optional Reddit streams.
- optionale Telemetrie-/Context-Feeds (z. B. OpenSky, CelesTrak, Webcams) nur als Kontextlayer.

Rule: soft signals can only produce candidates, never auto-persistent map events.

### 11.4 Source Bias Awareness

> **Buch-Referenz (Emotion AI):** "Emotion and Facial Recognition in AI" (Slimani et al., Springer 2026), Kapitel "Challenges, Opportunities, and the Road Ahead" -- Geographic Bias, Language Bias, Confirmation Bias in Trainings-Daten und Annotationen. Kapitel "Navigating the Future" -- Cross-Cultural Calibration, Display Rules (kulturell bedingte Ausdruecke die Erkennung verfaelschen).

**Problem:** Unsere Source-Tiers (Sek. 11.1-11.3) definieren Vertrauen, aber nicht **systematische Verzerrungen** der Quellen. Jede Quelle hat inhärente Biases die sich auf Candidate-Qualität auswirken:

| Source-Klasse | Inhärenter Bias | Auswirkung auf GeoMap | Mitigation |
|---|---|---|---|
| **Tier A (Offiziell)** | Verzögerung (legale/politische Abstimmung) + politischer Framing-Bias | Events erscheinen spät, aber zuverlässig. Formulierungen folgen politischer Agenda, nicht Markt-Realität | Zeitstempel-Vergleich mit Tier-B/C. Offizielle Quellen als Bestätigung nutzen, nicht als Erstindikator |
| **Tier B (News APIs)** | Clickbait-Bias + Western Media Overrepresentation | Übertreibung von Severity. Afrikanische/asiatische Events unterrepräsentiert | Severity-Kalibrierung pro Source (Bloomberg schätzt anders als RT). Geographic Coverage Dashboard |
| **Tier C (Social/Reddit)** | Retail-Sentiment-Bias + Manipulation (Bots, Pump-Gruppen) | False Positives bei Crypto-Events. Echo-Chamber-Effekt | Nie als alleinige Quelle für auto-route. Mandatory Cross-Source für `signal`-Klassifikation |
| **Sentiment-Modell (FinBERT / Alternativen, Sek. 18.2)** | Language Bias (EN >> DE/FR/CN) + Training-Data Cutoff | Nicht-englische Events werden mit niedrigerer Confidence scored | Language-Tag als explizites Feld. Confidence-Abschlag für nicht-englischen Input (UIL Sek. 4.5.1). Langfristig: sprachspezifische Modelle (Sek. 18.2 Ensemble-Strategie) |

**Cross-Cultural Calibration (aus dem Emotion-AI-Buch übertragen):**

Das Buch beschreibt "Display Rules" -- kulturelle Normen die bestimmen wie Emotionen ausgedrückt werden (z.B. japanische Kultur unterdrückt negative Ausdrücke öffentlich). Analog haben Nachrichtenquellen kulturelle "Display Rules":

- **Westliche Medien:** Tendenz zur Dramatisierung, explizite Severity-Sprache ("crisis", "collapse")
- **Chinesische Staatsmedien:** Understatement bei eigenen Problemen, Overstatement bei westlichen
- **Golf-Staatsmedien:** OPEC-freundlicher Framing bei Öl-Themen

**Operationalisierung (v2):**
1. `source_bias_profile` als Metadaten-Feld pro Provider (manuell kuratiert)
2. Wenn 2+ Quellen aus derselben Bias-Klasse dasselbe Event reporten: **zählt als 1 Bestätigung**, nicht als 2
3. Cross-Bias-Bestätigung (Tier A + Tier C stimmen überein) erhöht Confidence stärker als Same-Tier-Bestätigung

**Verbindung:** [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 4.5 (Bias-Awareness generell), [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.8 (Adversarial Robustness), Sek. 8a (Privacy).

---


## 12. Provider matrix — Referenz

Market/News/Sanctions/Behavioral-Analysis-Quellen, Non-Western Sources, Integrations-Reihenfolge:  
**Vollständige Tabellen und Links:** [`../../archive/GEOPOLITICAL_MAP_MASTERPLAN_2026-03-09_pre-split.md`](./archive/GEOMAP_OVERVIEW.md) Sek. 12.1–12.4.


---


## 31. Source appendix (internet-validated)

### 31.1 Map/geospatial stack

- https://github.com/VictorCazanave/react-svg-map
- https://github.com/yanivam/react-svg-worldmap
- https://github.com/StephanWagner/svgMap
- https://github.com/StephanWagner/worldMapSvg
- https://github.com/flekschas/simple-world-map
- https://github.com/benhodgson/markedup-svg-worldmap
- https://d3js.org/d3-geo
- https://github.com/topojson/world-atlas

### 31.1a Geov2plus runtime references (ontology/graph/tiles/tracks)

- https://sedona.apache.org/
- https://docs.mobilitydb.com/
- https://postgis.net/
- https://github.com/maplibre/martin
- https://github.com/CrunchyData/pg_tileserv
- https://deck.gl/
- https://maplibre.org/maplibre-gl-js/docs/
- https://h3geo.org/

### 31.2 Market providers and limits/pricing

- https://twelvedata.com/pricing
- https://www.alphavantage.co/support/
- https://www.alphavantage.co/premium/
- https://finnhub.io/docs/api
- https://site.financialmodelingprep.com/pricing-plans
- https://eodhd.com/welcome-special-30
- https://eodhd.com/financial-apis/api-limits
- https://marketstack.com/pricing
- https://marketstack.com/documentation
- https://polygon.io/knowledge-base/article/what-is-the-request-limit-for-polygons-restful-apis
- https://polygon.io/docs/rest/quickstart
- https://coinmarketcap.com/api/pricing/
- https://coinmarketcap.com/api/documentation/v4/
- https://finage.co.uk/product/stocks
- https://fred.stlouisfed.org/docs/api/fred/
- https://github.com/ranaroussi/yfinance
- https://insightsentry.com/

### 31.3 News providers

- https://newsapi.ai/plans
- https://gnews.io/pricing
- https://webz.io/products/news-api/
- https://newsdata.io/blog/pricing-plan-in-newsdata-io/
- https://newsdata.io/blog/newsdata-rate-limit/
- https://newsapi.org/pricing

### 31.4 Official geopolitics and sanctions

- https://ofac.treasury.gov/sanctions-list-service
- https://ofac.treasury.gov/recent-actions/20240506_33
- https://www.gov.uk/government/publications/the-uk-sanctions-list
- https://www.gov.uk/government/publications/uk-sanctions-list-change-in-format
- https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list
- https://scsanctions.un.org/consolidated/
- https://data.europa.eu/en/news-events/news/find-out-about-eu-restrictive-measures-across-globe-through-eu-sanctions-map

### 31.5 Central bank schedules (Kalender)

- https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
- https://www.ecb.europa.eu/press/accounts/html/index.en.html
- https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates
- https://www.boj.or.jp/en/mopo/mpmsche_minu/

### 31.6 Zentralbank Balance Sheets, On-Chain, Symbol-Universum, weitere Datenquellen

> **Vollstaendige Quellen-Referenz:** Alle Details (APIs, Portale, Wrapper, Frequenz, Formate) sind jetzt verteilt ueber:
> [`docs/references/sources/macro-and-central-banks.md`](./references/sources/macro-and-central-banks.md),
> [`docs/references/sources/market-data.md`](./references/sources/market-data.md)
> und den Web3-Owner unter [`docs/web3/README.md`](./web3/README.md)
>
> **Kurzuebersicht (fuer Geo-Map relevant):**
> - **Zentralbanken:** Fed (FRED/DDP), EZB, BoE (IADB), BoJ, SNB, BIS-Aggregat -- fuer Sek. 35.13 Zentralbank-Filter-Layer
> - **On-Chain:** Arkham Intelligence (Entity Labels, Wallet Flows) -- Kontext-Layer
> - **US-Macro-APIs:** NY Fed, BLS, BEA, Treasury, FDIC, SEC EDGAR
> - **Community-Wrapper:** Rust `iadb-api` (BoE), Python `bojpy` (BoJ), R `SNBdata`/`BOJ`/`pdfetch`

### 31.7 Optional datasets and policy references

- https://acleddata.com/acled-api-documentation
- https://apidoc.reliefweb.int/
- https://www.gdeltproject.org/
- https://ucdpapi.pcr.uu.se/api/docs/
- https://openskynetwork.github.io/opensky-api/
- https://celestrak.org/NORAD/documentation/gp-data-formats.php
- https://api.windy.com/webcams
- https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- https://redditinc.com/policies/data-api-terms

---

### 31.8 Machine-readable endpoints (extracted from `conflict-globe.gl`)

- https://api.acleddata.com/acled/read
- https://api.gdeltproject.org/api/v2/doc/doc
- https://ucdpapi.pcr.uu.se/api/gedevents/
- https://api.reliefweb.int/v1/reports
- https://api.reliefweb.int/v1/disasters
- https://opensky-network.org/api/states/all
- https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token
- https://celestrak.org/SATCAT/search.php
- https://celestrak.org/SOCRATES/query.php
- https://api.windy.com/api/webcams/v2/list/nearby=
- https://earthquake.usgs.gov/fdsnws/event/1/query
- https://www.seismicportal.eu/fdsnws/event/1/query
- https://api.weather.gov/alerts/active
- https://eonet.gsfc.nasa.gov/api/v3/events
- https://services.nvd.nist.gov/rest/json/cves/2.0
- https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
- https://otx.alienvault.com/api/v1/pulses/subscribed
- https://hacker-news.firebaseio.com/v0/topstories.json
- https://www.reddit.com/r/
- https://mastodon.social/api/v1/timelines/public
- http://api.open-notify.org/iss-now.json
- https://ll.thespacedevs.com/2.2.0/launch/upcoming/

### 31.9 Official public/free sources (priority)

- https://ofac.treasury.gov/sanctions-list-service
- https://www.gov.uk/government/publications/the-uk-sanctions-list
- https://scsanctions.un.org/consolidated/
- https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- https://services.nvd.nist.gov/rest/json/cves/2.0
- https://earthquake.usgs.gov/fdsnws/event/1/query
- https://api.weather.gov/alerts/active
- https://eonet.gsfc.nasa.gov/api/v3/events

### 31.10 Saubere Ersatzquellen fuer bisher unsaubere Referenzpfade

- https://www.aishub.net/api
- https://www.marinetraffic.com/en/ais-api-services
- https://www.vesselfinder.com/api
- https://marinecadastre.gov/AIS/
- https://coast.noaa.gov/htdata/CMSP/AISDataHandler/
- https://www.space-track.org/documentation
- https://volcanoes.usgs.gov/vsc/api/
- https://pris.iaea.org/

### 31.11 GeoSentinel Intake (Fullstack-relevante Auswahl)

> Vollstaendige GeoSentinel-Extraktion mit Kategorisierung steht in
> `../references/sources/geopolitical-and-osint.md` unter
> `GeoSentinel Source Extraction (vollstaendig, fuer Fullstack-Einsatz)`.
> Dieser Abschnitt fuehrt nur policy-relevante Prioritaeten.
>
> **Erstvermerk:** Diese GeoSentinel-Quellen sind zunaechst nur Intake-/Evaluationsstand
> fuer GeoMap-Source-Policy. Aktivierung in der produktiven Ingestion erfolgt erst nach
> Verify-Gates (Stabilitaet, ToS/Compliance, Rate-Limits, Fallback-Verhalten).

**CORE (bevorzugt fuer produktive Ingestion):**
- https://api.adsb.one/v2/point/
- wss://stream.aisstream.io/v0/stream
- https://api.opensanctions.org/search/default

**OPTIONAL (mit Guardrails/Quota/Compliance):**
- https://opensky-network.org/api/routes
- https://api.wigle.net/api/v2/network/search
- https://api.wigle.net/api/v2/bluetooth/search
- https://us1.unwiredlabs.com/v2/process.php
- https://api.shodan.io/shodan/host/search
- https://data.police.uk/api/crimes-street/all-crime
- https://ws-public.interpol.int/notices/v1/red
- https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json
- https://api.openweathermap.org/data/2.5/weather
- https://overpass-api.de/api/interpreter

**CONTEXT (Research/Lookup/UI-Linkouts, nicht Primary Feed):**
- https://html.duckduckgo.com/html/
- https://ahmia.fi/search/
- https://www.flightradar24.com/
- https://globe.adsbexchange.com/
- https://www.marinetraffic.com/en/ais/details/ships/
- https://www.vesselfinder.com/vessels/details/
- https://www.fleetmon.com/vessels/

**MEIDEN als Primaer-Ingestion (fragil/TOS/undokumentiert):**
- https://www.google.com/search
- https://www.bing.com/search
- https://www.opencellid.org/ajax/getCells.php

---

### 31.12 Pharos AI Intake (Policy-kurz, dedupliziert)

> Vollstaendige, URL-genaue Pharos-Aufnahme steht in
> `../references/sources/geopolitical-and-osint.md` unter
> `Pharos AI Source Intake (dedupliziert, Middle-East Fokus)`.
> Dieser Abschnitt fuehrt nur policy-relevante Prioritaeten und fuegt nur neue URLs hinzu.
>
> **Erstvermerk:** Pharos-Quellen sind zunaechst Intake-/Evaluationsstand.
> Produktive Aktivierung erst nach Verify-Gates (Stabilitaet, ToS/Compliance,
> Rate-Limits, Ausfallverhalten, Lizenz-/Nutzungsrechte).

**CORE (direkt nutzbar, mit Standard-Guardrails):**
- https://api.worldbank.org/v2/country/
- https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx

**OPTIONAL (wertvoll, aber mit Quota-/ToS-Pruefung):**
- https://query1.finance.yahoo.com/v8/finance/chart/
- https://gamma-api.polymarket.com/public-search
- https://clob.polymarket.com/prices-history
- https://news.google.com/rss/search
- https://feedx.net/rss/ap.xml
- https://www.haaretz.com/srv/haaretz-latest-headlines
- https://www.middleeasteye.net/rss
- https://www.xinhuanet.com/english/rss/worldrss.xml
- https://theintercept.com/feed/?rss
- https://foreignpolicy.com/feed/
- https://www.twz.com/feed

**CONTEXT / Agent-Tooling (nicht als primaerer Fakten-Feed):**
- https://api.x.ai/v1/responses

**Klarstellung zu xAI:**
- kostenpflichtig/key-basiert (`XAI_API_KEY`), geeignet fuer Verifikation/Discovery-Workflows
  im Agent-Layer; nicht als eigenstaendige Primaerquelle fuer Event-Ingestion behandeln.

---

### 31.13 Shadowbroker Intake (Policy-kurz, dedupliziert)

> Vollstaendige, URL-genaue Shadowbroker-Aufnahme steht in
> `../references/sources/geopolitical-and-osint.md` unter
> `Shadowbroker Source Intake (dedupliziert, vollstaendig aus Repo)`.
> Dieser Abschnitt fuehrt nur policy-relevante Prioritaeten mit neuen URLs.
>
> **Erstvermerk:** Shadowbroker-Quellen sind zunaechst Intake-/Evaluationsstand.
> Produktive Aktivierung erst nach Verify-Gates (Stabilitaet, ToS/Compliance,
> Rate-Limits, Ausfallverhalten, Lizenz-/Nutzungsrechte).

**CORE (bevorzugt fuer produktive Ingestion):**
- https://services.swpc.noaa.gov/json/planetary_k_index_1m.json
- https://services.swpc.noaa.gov/json/edited_events.json

**OPTIONAL (mit Guardrails/Quota/Compliance):**
- https://api.adsb.lol/v2/mil
- https://api.adsb.lol/v2/lat/
- https://api.adsb.lol/api/0/routeset
- https://api.airplanes.live/v2/point/
- https://opendata.adsb.fi/api/v3/lat/
- https://api.rainviewer.com/public/weather-maps.json
- https://tilecache.rainviewer.com
- https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv
- https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts
- https://api.tfl.gov.uk/Place/Type/JamCam
- https://api.data.gov.sg/v1/transport/traffic-images
- https://webcams.nyctmc.org/api/cameras
- https://planetarycomputer.microsoft.com/api/stac/v1
- https://restcountries.com/v3.1/alpha/
- https://query.wikidata.org/sparql

**CONTEXT (Research/Lookup/UI-Linkouts, nicht Primary Feed):**
- https://api.github.com/repos/cyterat/deepstate-map-data/git/trees/main?recursive=1
- https://raw.githubusercontent.com/cyterat/deepstate-map-data/main/
- https://www.broadcastify.com/listen/top
- https://broadcastify.cdnstream1.com/
- https://api.openmhz.com/systems
- https://api.openmhz.com/
- http://kiwisdr.com/.public/
- https://gbfs.citibikenyc.com/gbfs/en/station_information.json
- https://gbfs.citibikenyc.com/gbfs/en/station_status.json

**MEIDEN als Primaer-Ingestion (fragil/scraping-basiert):**
- https://liveuamap.com
- https://mideast.liveuamap.com
- https://israelpalestine.liveuamap.com
- https://syria.liveuamap.com

---

### 31.14 Sovereign Watch Intake (Policy-kurz, dedupliziert)

> Vollstaendige, URL-genaue Sovereign-Watch-Aufnahme steht in
> `../references/sources/geopolitical-and-osint.md` unter
> `Sovereign Watch Source Intake (dedupliziert, geordnet)`.
> Dieser Abschnitt fuehrt nur policy-relevante Prioritaeten mit neuen URLs.
>
> **Erstvermerk:** Sovereign-Watch-Quellen sind zunaechst Intake-/Evaluationsstand.
> Produktive Aktivierung erst nach Verify-Gates (Stabilitaet, ToS/Compliance,
> Rate-Limits, Ausfallverhalten, Lizenz-/Nutzungsrechte).

**CORE (bevorzugt fuer produktive Ingestion):**
- https://api.ioda.inetintel.cc.gatech.edu/v2/outages/summary
- https://www.submarinecablemap.com/api/v3/cable/cable-geo.json
- https://www.submarinecablemap.com/api/v3/landing-point/landing-point-geo.json

**OPTIONAL (mit Guardrails/Quota/Compliance):**
- https://www.repeaterbook.com/api/export.php
- https://api.radioreference.com/soap2/?wsdl
- https://www.weather.gov/source/nwr/JS/CCL.js
- https://raw.githubusercontent.com/Amateur-Repeater-Directory/ARD-RepeaterList/refs/heads/main/MasterList/MasterRepeater.json
- https://celestrak.org/NORAD/elements/gp.php?GROUP=glonass-ops&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=oneweb&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-NEXT&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=cubesat&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=radarsat&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=noaa&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=goes&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=sarsat&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=spire&FORMAT=TLE
- https://celestrak.org/NORAD/elements/gp.php?GROUP=planet&FORMAT=TLE

**CONTEXT (Research/Lookup, nicht Primary Feed):**
- http://rx.linkfanel.net/kiwisdr_com.js
- https://rx.skywavelinux.com/kiwisdr_com.js

**Staerken / Attraktivitaet (policy):**
- Sehr robuste Poller-Architektur (Backoff, Cooldown, Source-Rotation, dedizierte Domain-Pipelines).
- Attraktiv fuer GeoMap-Infra durch `IODA summary` + `submarine cable` Topology.
- RF-Layer erweitert Agent- und Kontextfaehigkeiten, aber nicht als alleiniger Hard-Signal-Kern.

**Schwaechen / Risiken (policy):**
- Credentials-Last (AIS/RF-Provider) und hoehere Ops-Komplexitaet.
- Teilweise scraping-/mirror-abhaengige RF/SDR-Pfade mit erhöhter Fragilitaet.
- Heterogene Protokolle (REST + SOAP + scraping) erfordern striktes Monitoring/Fallbacks.

---

### 31.15 WorldWideView Intake (Policy-kurz, dedupliziert)

> Vollstaendige, URL-genaue WorldWideView-Aufnahme steht in
> `../references/sources/geopolitical-and-osint.md` unter
> `WorldWideView Source Intake (dedupliziert, geordnet)`.
> Dieser Abschnitt fuehrt nur policy-relevante Prioritaeten mit neuen URLs.
>
> **Erstvermerk:** WorldWideView-Quellen sind zunaechst Intake-/Evaluationsstand.
> Produktive Aktivierung erst nach Verify-Gates (Stabilitaet, ToS/Compliance,
> Rate-Limits, Ausfallverhalten, Lizenz-/Nutzungsrechte).

**OPTIONAL (mit Guardrails/Quota/Compliance):**
- https://opendata.adsb.fi/api/v2/mil
- https://firms.modaps.eosdis.nasa.gov/api/area/csv/
- https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv
- https://services1.arcgis.com/2iUE8l8JKrP2tygQ/arcgis/rest/services/GDOT_Live_Traffic_Cameras/FeatureServer/0/query
- https://cwwp2.dot.ca.gov/data/d

**CONTEXT (Research/Lookup/UI-Enrichment, nicht Primary Feed):**
- https://maps.googleapis.com/maps/api/place/autocomplete/json
- https://maps.googleapis.com/maps/api/place/details/json
- https://corsproxy.io/
- https://cdn.webcamera24.com/
- https://www.youtube-nocookie.com/
- https://open.ivideon.com/
- https://play.player.im/
- https://rtsp.me/
- https://share.earthcam.net/

**MEIDEN als Primaer-Ingestion (fragil/scraping-/dump-basiert):**
- http://www.insecam.org/en/byrating/
- http://camlist.net/
- https://api.codetabs.com/v1/proxy?quest=http://camlist.net/
- `public/public-cameras.json` (statischer Aggregatdump, heterogene Stream-Qualitaet)

**Spezialitaet / Attraktivitaet (policy):**
- OpenSky Credential Rotation (Pool aus mehreren Credentials mit credit-aware rotation)
  ist als Resilience-Pattern sehr wertvoll fuer produktionsnahe Aviation-Ingestion
  (weniger 429-/Credit-Exhaustion-Ausfaelle).
- Ergaenzend stark: adaptive backoff+jitter, Retry-After-Auswertung, Supabase-Fallback,
  AIS reconnect/caching.

**Public-Cameras Befund (policy):**
- Datensatz mit hoher Breite (`2383` Features, `86` raw country labels / `81` normalisiert),
  aber als Discovery-/Agent-Kontext behandeln, nicht als kanonischen Event-Feed.

**Overlap (nicht erneut als neue Quelle fuehren):**
- `https://opensky-network.org/api/states/all`
- `https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token`
- `wss://stream.aisstream.io/v0/stream`
- `https://api.tfl.gov.uk/Place/Type/JamCam`

---
---

## Querverweise

- `GEOMAP_OVERVIEW.md`
- `GEOMAP_FOUNDATION.md`
- `GEOMAP_MODULE_CATALOG.md`
- `GEOMAP_VERIFY_GATES.md`
