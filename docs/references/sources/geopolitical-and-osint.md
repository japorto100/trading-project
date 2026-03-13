# Geopolitical and OSINT Sources

> **Scope:** Konflikt-, Krisen-, Sanktions-, Dossier- und Feed-Quellen fuer
> GeoMap, hard/soft signals, context panels und event-nahe Open-Source-Intel.

---

## Expliziter Quellenkatalog

### Structured Conflict / Event Feeds

| Quelle | Rolle | URL |
|--------|-------|-----|
| `ACLED API` | Kanonische Konflikt-/political-violence Event-Quelle | https://acleddata.com/acled-api-documentation |
| `GDELT` | Globale Event-, media- und tone-Datenbank | https://www.gdeltproject.org/ |
| `UCDP GED API` | Strukturierte Armed-Conflict-Events (Uppsala) als zusaetzlicher Konflikt-Layer | https://ucdpapi.pcr.uu.se/api/docs/ |
| `ReliefWeb API` | Humanitarian-/Conflict-Report-Layer (UN OCHA) fuer Event- und Context-Anreicherung | https://apidoc.reliefweb.int/ |
| `GeoMap Source Pack` | Interne Sammelkategorie fuer Geo-spezifische ingest sources | `internal` |

### Operational Telemetry / Geo-Adjacent Feeds (Evaluation)

| Quelle | Rolle | URL |
|--------|-------|-----|
| `OpenSky Network API` | ADS-B Luftverkehrslayer fuer konfliktnahe Regionen | https://openskynetwork.github.io/opensky-api/ |
| `CelesTrak` | Satelliten-/Orbital-Kontext fuer Space-Domain-Layer | https://celestrak.org/ |
| `Windy Webcams API` | Optionaler Kamera-/Visual-Context-Layer fuer situative Verifikation | https://api.windy.com/webcams |

### Analyst Context / Dossiers / Update Feeds

| Quelle | Rolle | URL |
|--------|-------|-----|
| `CFR Global Conflict Tracker` | Konflikt-Dossiers / analyst context | https://www.cfr.org/global-conflict-tracker |
| `CrisisWatch RSS` | Regelmaessige Konflikt-Updates / feed polling | https://www.crisisgroup.org/crisiswatch |
| `ACLED Conflict Index / Country Monitors` | Zusatzprodukte / overlay candidates | https://acleddata.com/conflict-index/ |

### Soft-Signal-adjacent Open Sources

| Quelle | Rolle | URL |
|--------|-------|-----|
| `RSS conflict / geopolitical feeds` | Lightweight feed polling fuer context expansion | z. B. https://apnews.com/hub/ap-top-news?rss=1 |
| `public government / IO statements` | OSINT-adjacent primary-source layer | z. B. https://www.un.org/press/en |

---

## Machine-readable Endpoints (extracted from `conflict-globe.gl`)

> **Hinweis:** Diese Liste fuehrt konkrete API-/Feed-Endpunkte, die im Referenzprojekt
> tatsaechlich adressiert werden. Das ist keine automatische Produktiv-Freigabe.

| Quelle | Typ | URL | Public/Free-Notiz |
|--------|-----|-----|-------------------|
| `ACLED API` | Conflict events | https://api.acleddata.com/acled/read | API-Key + registrierte E-Mail erforderlich |
| `GDELT DOC API` | Conflict/news events | https://api.gdeltproject.org/api/v2/doc/doc | oeffentlich nutzbar |
| `UCDP GED API` | Armed conflict events | https://ucdpapi.pcr.uu.se/api/gedevents/{year} | oeffentlich nutzbar |
| `ReliefWeb API reports` | Humanitarian reports | https://api.reliefweb.int/v1/reports | oeffentlich nutzbar |
| `ReliefWeb API disasters` | Disaster events | https://api.reliefweb.int/v1/disasters | oeffentlich nutzbar |
| `OpenSky states` | ADS-B air traffic | https://opensky-network.org/api/states/all | oeffentlich; Limits/Auth je nach Nutzung |
| `OpenSky OAuth token` | Auth endpoint | https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token | fuer Client-Credentials-Flow |
| `CelesTrak SATCAT` | Satellite catalog | https://celestrak.org/SATCAT/search.php | oeffentlich nutzbar |
| `CelesTrak SOCRATES` | Orbital conjunction data | https://celestrak.org/SOCRATES/query.php | teilw. eingeschraenkt/abh. vom Endpoint |
| `Windy Webcams API` | Camera metadata | https://api.windy.com/api/webcams/v2/list/nearby=... | Free-/Key-Modell |
| `USGS Earthquake API` | Seismic events | https://earthquake.usgs.gov/fdsnws/event/1/query | oeffentlich nutzbar |
| `EMSC Seismic API` | Seismic events | https://www.seismicportal.eu/fdsnws/event/1/query | oeffentlich nutzbar |
| `NOAA Weather Alerts API` | Severe weather alerts | https://api.weather.gov/alerts/active | oeffentlich nutzbar |
| `NASA EONET API` | Natural events | https://eonet.gsfc.nasa.gov/api/v3/events | oeffentlich nutzbar |
| `NVD CVE API` | Vulnerabilities | https://services.nvd.nist.gov/rest/json/cves/2.0 | oeffentlich nutzbar |
| `CISA KEV feed` | Exploited vulnerabilities | https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json | oeffentlich nutzbar |
| `AlienVault OTX` | Threat intel pulses | https://otx.alienvault.com/api/v1/pulses/subscribed | oeffentlich/Key-basiert je nach Scope |
| `HackerNews API` | Story stream | https://hacker-news.firebaseio.com/v0/topstories.json | oeffentlich nutzbar |
| `Reddit JSON` | Social posts | https://www.reddit.com/r/{sub}/hot.json | oeffentlich mit Policy-/Rate-Grenzen |
| `Mastodon public timeline` | Social stream | https://mastodon.social/api/v1/timelines/public | oeffentlich nutzbar |
| `Open-Notify ISS` | ISS position | http://api.open-notify.org/iss-now.json | oeffentlich nutzbar |
| `Launch Library 2` | Rocket launches | https://ll.thespacedevs.com/2.2.0/launch/upcoming/ | oeffentlich nutzbar |

### RSS endpoints used in the reference project

| Feed | URL |
|------|-----|
| `BBC World` | https://feeds.bbci.co.uk/news/world/rss.xml |
| `BBC Middle East` | https://feeds.bbci.co.uk/news/world/middle_east/rss.xml |
| `BBC Europe` | https://feeds.bbci.co.uk/news/world/europe/rss.xml |
| `Deutsche Welle` | https://rss.dw.com/rdf/rss-en-world |
| `RFI World` | https://en.rfi.fr/rss/en/world-news.xml |
| `Al Jazeera English` | https://feeds.aljazeera.net/aljazeera/English/rss.xml |
| `Defense News` | https://www.defensenews.com/arc/outboundfeeds/rss/ |
| `Defense Aerospace` | https://feeds.feedburner.com/defense-aerospace |
| `Janes Defense` | https://www.janes.com/feeds/news |
| `Breaking Defense` | https://breakingdefense.com/feed/ |
| `Military Times` | https://www.militarytimes.com/arc/outboundfeeds/rss/ |
| `Kyiv Independent` | https://kyivindependent.com/feed/ |
| `Ukrinform` | https://www.ukrinform.net/rss/block-lastnews |
| `Times of Israel` | https://www.timesofisrael.com/feed/ |

### Official public/free sources (priority candidates)

| Quelle | Rolle | URL |
|--------|-------|-----|
| `OFAC Sanctions List Service` | Official sanctions updates (US) | https://ofac.treasury.gov/sanctions-list-service |
| `UK Sanctions List` | Official sanctions updates (UK) | https://www.gov.uk/government/publications/the-uk-sanctions-list |
| `UN Consolidated Sanctions List` | Official UN sanctions source | https://scsanctions.un.org/consolidated/ |
| `CISA KEV` | Official exploited-vuln list (US CISA) | https://www.cisa.gov/known-exploited-vulnerabilities-catalog |

> `NVD`, `USGS`, `NOAA`, `NASA EONET` sind bereits im Block
> `Machine-readable Endpoints` enthalten und werden hier nicht doppelt gelistet.

### Saubere Ersatzquellen fuer bisher unsaubere Referenzpfade

| Quelle | Bereich | URL | Einordnung |
|--------|---------|-----|------------|
| `AISHub API` | Maritime/AIS | https://www.aishub.net/api | strukturierter AIS API-Pfad (community) |
| `MarineTraffic AIS API Services` | Maritime/AIS | https://www.marinetraffic.com/en/ais-api-services | kommerzieller, robuster AIS Provider |
| `VesselFinder API` | Maritime/AIS | https://www.vesselfinder.com/api | kommerzieller AIS/API-Pfad |
| `NOAA/BOEM MarineCadastre AIS` | Maritime/AIS | https://marinecadastre.gov/AIS/ | offizieller US AIS Datenzugang |
| `NOAA AIS Bulk Handler` | Maritime/AIS | https://coast.noaa.gov/htdata/CMSP/AISDataHandler/ | offizieller Bulk-Download-Pfad |
| `Space-Track API Docs` | Space/Satellites | https://www.space-track.org/documentation | offizieller NORAD/Space-Track API-Zugang |
| `USGS Volcano API` | Volcano | https://volcanoes.usgs.gov/vsc/api/ | maschinenlesbarer Volcano-API-Pfad |
| `IAEA PRIS` | Nuclear | https://pris.iaea.org/ | offizieller Nuclear-Referenzkatalog (API-Reife separat pruefen) |

---

## GeoSentinel Source Extraction (vollstaendig, fuer Fullstack-Einsatz)

> **Ziel:** Alle in `GeoSentinel` gefundenen Quellen, kategorisiert fuer Anwendung in unserer Fullstack-App.
> **Legende Empfehlung:** `CORE` = direkt fuer Ingestion priorisieren, `OPTIONAL` = nuetzlich mit Guardrails,
> `CONTEXT` = nur UI/Lookup/Research, `MEIDEN` = fragil/rechtlich/operativ heikel.

### A) Backend APIs / Feeds / Streams

- `https://api.adsb.one/v2/point/40/-100/4000` - `CORE` (Flight-Ingestion)
- `https://api.adsb.one/v2/point/50/10/3000` - `CORE`
- `https://api.adsb.one/v2/point/25/80/3000` - `CORE`
- `https://api.adsb.one/v2/point/35/135/2500` - `CORE`
- `https://api.adsb.one/v2/point/-25/135/2000` - `CORE`
- `https://api.adsb.one/v2/point/60/90/4000` - `CORE`
- `https://api.adsb.one/v2/point/35/105/2500` - `CORE`
- `https://api.adsb.one/v2/point/-15/-60/3000` - `CORE`
- `https://api.adsb.one/v2/point/5/20/3500` - `CORE`
- `wss://stream.aisstream.io/v0/stream` - `CORE` (Vessel-Streaming)
- `https://opensky-network.org/api/routes` - `OPTIONAL` (Flight-Meta/Route)
- `http://opencellid.org/cell/getInArea` - `OPTIONAL` (Cell Tower; Qualitaet/Rate-Limit pruefen)
- `https://www.opencellid.org/ajax/getCells.php` - `MEIDEN` (undokumentiert/frail endpoint)
- `https://api.wigle.net/api/v2/network/search` - `OPTIONAL` (WiFi intel, key + compliance)
- `https://api.wigle.net/api/v2/bluetooth/search` - `OPTIONAL`
- `https://us1.unwiredlabs.com/v2/process.php` - `OPTIONAL`
- `https://api.shodan.io/shodan/host/search` - `OPTIONAL` (security intel, key + terms)
- `https://data.police.uk/api/crimes-street/all-crime` - `OPTIONAL` (UK-only, sauber)
- `https://ws-public.interpol.int/notices/v1/red` - `OPTIONAL` (watchlist context)
- `https://api.opensanctions.org/search/default` - `CORE` (sanctions/entity)
- `https://newsapi.org/v2/everything` - `OPTIONAL` (News layer, kosten-/rate-abhaengig)
- `https://api.twitter.com/2/tweets/search/recent` - `OPTIONAL` (kosten/policy-sensitiv)
- `https://api.coingecko.org/api/v3/simple/price` - `OPTIONAL` (market context)
- `https://api.mymemory.translated.net/get` - `CONTEXT` (translation helper)
- `https://nominatim.openstreetmap.org/reverse` - `OPTIONAL` (geocoding; unbedingt cachen/rate-limit)
- `https://openrouter.ai/api/v1/chat/completions` - `CONTEXT` (LLM, nicht Datenquelle)
- `https://router.huggingface.co/v1/chat/completions` - `CONTEXT`
- `http://127.0.0.1:11434` - `CONTEXT` (lokales LLM, kein externer Datenfeed)

### B) Search/Scraping Endpoints (OSINT Tooling)

- `https://www.google.com/search` - `MEIDEN` als Primär-Ingestion (Scraping-fragil/TOS)
- `https://www.bing.com/search` - `MEIDEN` als Primär-Ingestion
- `https://html.duckduckgo.com/html/` - `CONTEXT` (on-demand Recherche)
- `https://ahmia.fi/search/` - `CONTEXT` (darkweb discovery, nicht Primary)
- `http://check.torproject.org` - `CONTEXT` (Tor healthcheck)
- `https://www.google.com/searchbyimage/upload` - `CONTEXT`
- `https://yandex.com/images/search` - `CONTEXT`
- `https://yandex.com/images-apphost/image-download` - `CONTEXT`
- `https://www.bing.com/images/search?view=detailv2&iss=sbiupload&FORM=SBIIDP` - `CONTEXT`
- `https://www.bing.com/images/search?q=imgurl:&view=detailv2&iss=sbiupload&FORM=IRSBIQ` - `CONTEXT`

### C) Darkweb Onion Suchmaschinen (nur Research-Kontext)

- `http://juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion/search/?q={query}` - `CONTEXT`
- `http://3bbad7fauom4d6sgppalyqddsqbf5u5p56b5k5uk2zxsy3d6ey2jobad.onion/search?q={query}` - `CONTEXT`
- `http://iy3544gmoeclh5de6gez2256v6pjh4omhpqdh2wpeeppjtvqmjhkfwad.onion/torgle/?query={query}` - `CONTEXT`
- `http://amnesia7u5odx5xbwtpnqk3edybgud5bmiagu75bnqx2crntw5kry7ad.onion/search?query={query}` - `CONTEXT`
- `http://kaizerwfvp5gxu6cppibp7jhcqptavq3iqef66wbxenh6a2fklibdvid.onion/search?q={query}` - `CONTEXT`
- `http://anima4ffe27xmakwnseih3ic2y7y3l6e7fucwk4oerdn4odf7k74tbid.onion/search?q={query}` - `CONTEXT`
- `http://tornadoxn3viscgz647shlysdy7ea5zqzwda7hierekeuokh5eh5b3qd.onion/search?q={query}` - `CONTEXT`
- `http://tornetupfu7gcgidt33ftnungxzyfq2pygui5qdoyss34xbgx2qruzid.onion/search?q={query}` - `CONTEXT`
- `http://torlbmqwtudkorme6prgfpmsnile7ug2zm4u3ejpcncxuhpu4k2j4kyd.onion/index.php?a=search&q={query}` - `CONTEXT`
- `http://findtorroveq5wdnipkaojfpqulxnkhblymc7aramjzajcvpptd4rjqd.onion/search?q={query}` - `CONTEXT`
- `http://2fd6cemt4gmccflhm6imvdfvli3nf7zn6rfrwpsy7uhxrgbypvwf5fad.onion/search?query={query}` - `CONTEXT`
- `http://oniwayzz74cv2puhsgx4dpjwieww4wdphsydqvf5q7eyz4myjvyw26ad.onion/search.php?s={query}` - `CONTEXT`
- `http://tor66sewebgixwhcqfnp5inzp5x5uohhdy3kvtnyfxc2e5mxiuh34iid.onion/search?q={query}` - `CONTEXT`
- `http://3fzh7yuupdfyjhwt3ugzqqof6ulbcl27ecev33knxe3u7goi3vfn2qqd.onion/oss/index.php?search={query}` - `CONTEXT`
- `http://torgolnpeouim56dykfob6jh5r2ps2j73enc42s2um4ufob3ny4fcdyd.onion/?q={query}` - `CONTEXT`
- `http://searchgf7gdtauh7bhnbyed4ivxqmuoat3nm6zfrg3ymkq6mtnpye3ad.onion/search?q={query}` - `CONTEXT`

### D) Frontend Runtime Data Sources

- `https://api.tomtom.com/traffic/map/4/tile/flow/absolute/{z}/{x}/{y}.png` - `OPTIONAL` (traffic tiles)
- `https://api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png` - `OPTIONAL`
- `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json` - `OPTIONAL`
- `https://api.openweathermap.org/data/2.5/weather` - `OPTIONAL`
- `https://nominatim.openstreetmap.org/search` - `OPTIONAL` (nur mit cache/throttle)
- `https://overpass-api.de/api/interpreter` - `OPTIONAL` (heavy queries throttlen)
- `https://services.arcgis.com/8lRhdTsQyJpO52F1/ArcGIS/rest/services/Traffic_Cameras_View/FeatureServer/0/query` - `OPTIONAL`
- `https://data.austintexas.gov/resource/b4k4-adkb.json` - `OPTIONAL` (lokal begrenzt)
- `http://cwwp2.dot.ca.gov/vm/streamlist.htm` - `CONTEXT` (linkout, kein API-contract)
- `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` - `CORE` (basemap tiles)
- `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` - `OPTIONAL`

### E) CelesTrak TLE Feeds (Frontend Satellitenmodul)

- `https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=glo-ops&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=galileo&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=beidou&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=amateur&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=military&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=geo&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=intelsat&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=ses&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=globestar&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=orbcomm&FORMAT=tle` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=inmarsat&FORMAT=tle` - `OPTIONAL`

### F) RSS Pools aus `news_config.py` (vollstaendig)

#### INTERNATIONAL RSS
- `https://www.reuters.com/rssFeed/worldNews`
- `https://apnews.com/hub/ap-top-news?rss=1`
- `https://www.aljazeera.com/xml/rss/all.xml`
- `https://www.dw.com/en/top-stories/rss`
- `https://www.france24.com/en/rss`
- `https://news.un.org/feed/subscribe/en/news/all/rss.xml`
- `https://globalvoices.org/feed/`
- `https://world.einnews.com/rss`

#### INTERNATIONAL APIs
- `https://newsapi.org/v2/top-headlines`
- `https://api.worldnewsapi.com/search-news`
- `https://newsdata.io/api/1/news`

#### USA RSS
- `https://rss.cnn.com/rss/edition.rss`
- `https://feeds.nbcnews.com/nbcnews/public/news`
- `https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml`
- `https://feeds.foxnews.com/foxnews/latest`
- `https://feeds.washingtonpost.com/rss/world`
- `https://abcnews.go.com/abcnews/topstories`
- `https://www.cbsnews.com/latest/rss/main`
- `https://www.usatoday.com/rss/news/`
- `https://apnews.com/apf-topnews?rss=1`

#### USA APIs
- `https://newsapi.org/v2/top-headlines?country=us`

#### INDIA RSS
- `https://timesofindia.indiatimes.com/rssfeedstopstories.cms`
- `https://www.thehindu.com/news/national/feeder/default.rss`
- `https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml`
- `https://indianexpress.com/feed/`
- `https://feeds.ndtv.com/ndtvnews-top-stories`
- `https://scroll.in/feed`
- `https://theprint.in/feed/`
- `https://economictimes.indiatimes.com/rssfeedstopstories.cms`
- `https://www.deccanherald.com/rss.xml`

#### INDIA APIs
- `https://newsapi.org/v2/top-headlines?country=in`
- `https://newsdata.io/api/1/news?country=in`

#### EUROPE RSS
- `https://feeds.bbci.co.uk/news/world/europe/rss.xml`
- `https://www.euronews.com/rss`
- `https://www.theguardian.com/world/rss`
- `https://www.spiegel.de/international/index.rss`
- `https://www.lemonde.fr/rss/une.xml`
- `https://elpais.com/rss/feed.html`
- `https://www.repubblica.it/rss/homepage/rss2.0.xml`
- `https://www.ft.com/rss/home`
- `https://www.politico.eu/rss`
- `https://rss.dw.com/xml/rss-en-eu`

#### AFRICA RSS
- `https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf`
- `https://www.news24.com/rss`
- `https://nation.africa/kenya/rss`
- `https://mg.co.za/feed/`
- `https://www.theafricareport.com/feed/`
- `https://www.premiumtimesng.com/feed`
- `https://www.sabcnews.com/sabcnews/feed/`
- `https://www.egyptindependent.com/feed/`
- `https://www.newtimes.co.rw/rss`

#### UAE RSS
- `https://gulfnews.com/rss`
- `https://www.khaleejtimes.com/rss`
- `https://www.thenationalnews.com/rss`
- `https://www.arabianbusiness.com/rss`
- `https://www.emirates247.com/rss`
- `https://www.albayan.ae/rss`
- `https://www.itihad.ae/rss`
- `https://www.zawya.com/rss`

#### UAE APIs
- `https://newsapi.org/v2/top-headlines?country=ae`

#### IRAN RSS
- `https://www.presstv.ir/rss`
- `https://www.tehrantimes.com/rss`
- `https://www.irna.ir/rss`
- `https://en.mehrnews.com/rss`
- `https://www.tasnimnews.com/en/rss`
- `https://farsnews.ir/rss`
- `https://www.radiofarda.com/rss`
- `https://www.isna.ir/rss`

#### CHINA RSS
- `http://www.xinhuanet.com/english/rss/worldrss.xml`
- `https://www.chinadaily.com.cn/rss/world_rss.xml`
- `https://www.globaltimes.cn/rss/world.xml`
- `https://www.scmp.com/rss/91/feed`
- `https://news.cgtn.com/rss`
- `https://english.people.com.cn/rss/World.xml`
- `https://www.shine.cn/rss/`
- `https://www.beijingreview.com.cn/rss/`

#### RUSSIA RSS
- `https://tass.com/rss/v2.xml`
- `https://ria.ru/export/rss2/archive/index.xml`
- `https://www.interfax.ru/rss.asp`
- `https://www.themoscowtimes.com/rss`
- `https://www.rt.com/rss/news/`
- `https://www.kommersant.ru/RSS/news.xml`
- `https://novayagazeta.eu/rss`
- `https://www.vedomosti.ru/rss/news`

#### JAPAN RSS
- `https://www3.nhk.or.jp/rss/news/cat0.xml`
- `https://www.japantimes.co.jp/feed/`
- `https://www.asahi.com/rss/asahi/newsheadlines.rdf`
- `https://www.yomiuri.co.jp/rss/world.xml`
- `https://mainichi.jp/rss/etc/mainichi-flash.rss`
- `https://english.kyodonews.net/rss/news.xml`
- `https://asia.nikkei.com/rss/feed/nar`
- `https://japantoday.com/feed`

#### AUSTRALIA RSS
- `https://www.abc.net.au/news/feed/51120/rss.xml`
- `https://www.theaustralian.com.au/rss`
- `https://www.smh.com.au/rss/feed.xml`
- `https://www.theguardian.com/au/rss`
- `https://www.news.com.au/rss`
- `https://www.theage.com.au/rss/feed.xml`
- `https://www.afr.com/rss`
- `https://www.sbs.com.au/news/feed`

#### TAIWAN RSS
- `https://www.taipeitimes.com/xml/rss`
- `https://focustaiwan.tw/rss`
- `https://www.chinapost.com.tw/rss`
- `https://news.ltn.com.tw/rss`
- `https://udn.com/rssfeed/news/2/6638`
- `https://www.ettoday.net/news/rss_all.xml`
- `https://news.tvbs.com.tw/rss`
- `https://www.storm.mg/feeds`

#### SOUTH_KOREA RSS
- `https://en.yna.co.kr/rss/news.xml`
- `https://www.koreaherald.com/rss`
- `https://www.koreatimes.co.kr/www/rss/rss.xml`
- `https://www.arirang.com/rss/news.xml`
- `https://world.kbs.co.kr/rss/rss_news.htm`
- `https://koreajoongangdaily.joins.com/rss`
- `https://www.chosun.com/arc/outboundfeeds/rss/`
- `https://www.hani.co.kr/rss/`

#### ISRAEL RSS
- `https://www.haaretz.com/rss`
- `https://www.jpost.com/rss/rssfeedsfrontpage.aspx`
- `https://www.timesofisrael.com/feed/`
- `https://www.ynetnews.com/category/3082`
- `https://www.themarker.com/cmlink/1.144`
- `https://www.israelhayom.com/feed/`
- `https://www.inn.co.il/Rss.aspx`
- `https://www.globes.co.il/webservice/rss/rssfeeder.asmx/FeederNode`
- `https://www.i24news.tv/en/rss`

### G) UI Linkouts / Intel Jump Links (nicht als Ingestion nutzen)

- `https://www.flightradar24.com/...` - `CONTEXT`
- `https://globe.adsbexchange.com/?icao=...` - `CONTEXT`
- `https://www.marinetraffic.com/en/ais/details/ships/mmsi:...` - `CONTEXT`
- `https://www.vesselfinder.com/vessels/details/...` - `CONTEXT`
- `https://www.fleetmon.com/vessels/?s=...` - `CONTEXT`
- `https://wigle.net/search?netid=...` - `CONTEXT`
- `https://nssdc.gsfc.nasa.gov/nmc/SpacecraftQuery.do?norad=...` - `CONTEXT`
- `https://www.n2yo.com/satellite/?s=...` - `CONTEXT`
- `https://www.google.com/maps?q=...` - `CONTEXT`
- `https://earth.google.com/web/search/...` - `CONTEXT`
- `https://www.openstreetmap.org/?mlat=...&mlon=...` - `CONTEXT`

---

## Pharos AI Source Intake (dedupliziert, Middle-East Fokus)

> Quelle: `_tmp_ref_review/geo/pharos-ai`.
> In diesem Block werden nur neue, noch nicht gelistete URLs aufgenommen.
> Bereits vorhandene Feeds werden unten als Overlap vermerkt, aber nicht doppelt eingetragen.

### A) APIs / Endpoints (neu aufgenommen)

- `https://api.x.ai/v1/responses` - `CONTEXT` (Agent-Tooling fuer Verifikation/Discovery; **kostenpflichtig**, API-Key `XAI_API_KEY`)
- `https://query1.finance.yahoo.com/v8/finance/chart/{ticker}` - `OPTIONAL` (Market chart context; public endpoint, ToS/Rate-Limits pruefen)
- `https://api.worldbank.org/v2/country/{iso3}/indicator/{indicator}` - `CORE` (makrooekonomische + military indicators; oeffentlich nutzbar)
- `https://gamma-api.polymarket.com/public-search` - `OPTIONAL` (Prediction market discovery; public)
- `https://clob.polymarket.com/prices-history` - `OPTIONAL` (Prediction market time series; public)

### B) RSS / Feed-URLs (neu aufgenommen, inkl. regionaler Perspektiven)

- `https://news.google.com/rss/search?q=site:reuters.com+when:1d&hl=en-US&gl=US&ceid=US:en` - `OPTIONAL` (Reuters discovery feed via Google News)
- `https://feedx.net/rss/ap.xml` - `OPTIONAL` (AP via aggregator endpoint)
- `https://rss.nytimes.com/services/xml/rss/nyt/World.xml` - `OPTIONAL` (NYT World)
- `https://moxie.foxnews.com/google-publisher/world.xml` - `CONTEXT` (Fox world publisher feed)
- `https://www.ft.com/world?format=rss` - `OPTIONAL` (FT world feed)
- `https://rss.dw.com/xml/rss-en-world` - `OPTIONAL` (DW world feed)
- `https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945&max=10` - `CORE` (US DoD official feed)
- `https://news.google.com/rss/search?q=CENTCOM+when:1d&hl=en-US&gl=US&ceid=US:en` - `OPTIONAL` (CENTCOM discovery feed)
- `https://www.haaretz.com/srv/haaretz-latest-headlines` - `OPTIONAL` (Haaretz headlines endpoint)
- `https://news.google.com/rss/search?q=site:i24news.tv+when:1d&hl=en-US&gl=US&ceid=US:en` - `OPTIONAL` (i24 discovery feed)
- `https://www.presstv.ir/rss.xml` - `OPTIONAL` (Iranian state-aligned feed)
- `https://news.google.com/rss/search?q=site:en.irna.ir+when:1d&hl=en-US&gl=US&ceid=US:en` - `OPTIONAL` (IRNA discovery feed)
- `https://news.google.com/rss/search?q=site:tehrantimes.com+when:1d&hl=en-US&gl=US&ceid=US:en` - `OPTIONAL` (Tehran Times discovery feed)
- `https://news.google.com/rss/search?q=site:tasnimnews.com+when:1d&hl=en-US&gl=US&ceid=US:en` - `OPTIONAL` (Tasnim discovery feed)
- `https://news.google.com/rss/search?q=site:english.alarabiya.net+when:1d&hl=en-US&gl=US&ceid=US:en` - `OPTIONAL` (Al Arabiya discovery feed)
- `https://www.middleeasteye.net/rss` - `OPTIONAL` (MEE regional feed)
- `https://www.xinhuanet.com/english/rss/worldrss.xml` - `OPTIONAL` (Xinhua world feed, HTTPS variant)
- `https://theintercept.com/feed/?rss` - `OPTIONAL` (independent investigative)
- `https://foreignpolicy.com/feed/` - `OPTIONAL` (geopolitical analysis)
- `https://www.twz.com/feed` - `OPTIONAL` (defense/military analysis)

### C) Overlap mit bereits vorhandenen Eintraegen (nicht erneut als URL gelistet)

- Bereits abgedeckt in dieser Datei: `BBC World`, `Washington Post`, `The Guardian`, `CNN World`, `Times of Israel`, `Jerusalem Post`, `Al Jazeera`, `RT`, `TASS`, `SCMP`.
- Diese wurden fuer `pharos-ai` erneut gefunden, aber bewusst nicht dupliziert.

---

## Shadowbroker Source Intake (dedupliziert, vollstaendig aus Repo)

> Quelle: `_tmp_ref_review/geo/Shadowbroker`.
> In diesem Block werden nur neue URLs aufgenommen. Bereits vorhandene Quellen
> (z. B. `OpenSky`, `AISStream`, `CelesTrak`, `USGS`, `Nominatim`, `Overpass`)
> werden nicht doppelt eingetragen.

### A) Backend APIs / Feeds / Streams (neu aufgenommen)

- `https://api.adsb.lol/v2/mil` - `OPTIONAL` (military flight stream; public/community endpoint)
- `https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{dist}` - `OPTIONAL` (regional flight states)
- `https://api.adsb.lol/api/0/routeset` - `OPTIONAL` (route enrichment fuer callsigns/icao)
- `https://api.airplanes.live/v2/point/{lat}/{lon}/{radius}` - `OPTIONAL` (flight aggregation; public endpoint)
- `https://opendata.adsb.fi/api/v3/lat/{lat}/lon/{lon}/dist/{dist}` - `OPTIONAL` (flight aggregation; public endpoint)
- `https://api.rainviewer.com/public/weather-maps.json` - `OPTIONAL` (weather-radar metadata)
- `https://tilecache.rainviewer.com` - `OPTIONAL` (RainViewer tile host)
- `https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv` - `OPTIONAL` (NASA FIRMS VIIRS fire hotspots)
- `https://services.swpc.noaa.gov/json/planetary_k_index_1m.json` - `OPTIONAL` (NOAA space weather Kp index)
- `https://services.swpc.noaa.gov/json/edited_events.json` - `OPTIONAL` (NOAA space weather events)
- `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts` - `OPTIONAL` (internet outage alerts)
- `https://gbfs.citibikenyc.com/gbfs/en/station_information.json` - `CONTEXT` (urban mobility proxy layer)
- `https://gbfs.citibikenyc.com/gbfs/en/station_status.json` - `CONTEXT` (urban mobility status)
- `http://data.gdeltproject.org/gdeltv2/lastupdate.txt` - `OPTIONAL` (GDELT export index)
- `http://data.gdeltproject.org/gdeltv2/{timestamp}.export.CSV.zip` - `OPTIONAL` (GDELT export bulk files)

### B) CCTV / Geo-Imagery / Sentinel Runtime (neu aufgenommen)

- `https://api.tfl.gov.uk/Place/Type/JamCam` - `OPTIONAL` (London CCTV API)
- `https://api.data.gov.sg/v1/transport/traffic-images` - `OPTIONAL` (Singapore traffic images)
- `https://webcams.nyctmc.org/api/cameras` - `OPTIONAL` (NYC camera index)
- `https://webcams.nyctmc.org/api/cameras/{id}/image` - `OPTIONAL` (NYC camera image endpoint)
- `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/{lon},{lat},18,{bearing},60/600x400?access_token={token}` - `OPTIONAL` (token-basiertes static imagery fallback)
- `https://planetarycomputer.microsoft.com/api/stac/v1` - `OPTIONAL` (Sentinel-2 STAC metadata search)
- `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg` - `OPTIONAL` (NASA GIBS raster tiles)
- `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png` - `CONTEXT` (basemap tile CDN)
- `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png` - `CONTEXT`
- `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png` - `CONTEXT`
- `https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png` - `CONTEXT`
- `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}` - `OPTIONAL` (boundary/place labels tiles)

### C) Dossier / Entity Context APIs (neu aufgenommen)

- `https://restcountries.com/v3.1/alpha/{country_code}` - `OPTIONAL` (country profile enrichment)
- `https://query.wikidata.org/sparql` - `OPTIONAL` (leader/government enrichment via SPARQL)
- `https://en.wikipedia.org/api/rest_v1/page/summary/{title}` - `OPTIONAL` (summary + thumbnail enrichment)

### D) Scraping-/Discovery-Pfade (kein sauberer Primaerfeed)

- `https://api.github.com/repos/cyterat/deepstate-map-data/git/trees/main?recursive=1` - `CONTEXT` (GitHub index fuer DeepState mirror)
- `https://raw.githubusercontent.com/cyterat/deepstate-map-data/main/{path}` - `CONTEXT` (mirror file pull)
- `https://www.broadcastify.com/listen/top` - `CONTEXT` (HTML scraping)
- `https://broadcastify.cdnstream1.com/{feed_id}` - `CONTEXT` (derived stream URL)
- `https://api.openmhz.com/systems` - `CONTEXT` (radio system discovery)
- `https://api.openmhz.com/{system}/calls` - `CONTEXT` (radio call discovery)
- `http://kiwisdr.com/.public/` - `CONTEXT` (HTML scraping / node discovery)
- `https://liveuamap.com` - `MEIDEN` als Primaer-Ingestion (web scraping fragil/TOS-abh.)
- `https://mideast.liveuamap.com` - `MEIDEN` als Primaer-Ingestion
- `https://israelpalestine.liveuamap.com` - `MEIDEN` als Primaer-Ingestion
- `https://syria.liveuamap.com` - `MEIDEN` als Primaer-Ingestion

### E) Overlap mit bereits vorhandenen Eintraegen (nicht erneut gelistet)

- Bereits in dieser Datei vorhanden und in `Shadowbroker` ebenfalls genutzt:
  `OpenSky`, `AISStream`, `CelesTrak`, `USGS Earthquake`, `GDELT DOC API`,
  `Nominatim`, `Overpass`, `data.austintexas.gov`.

---

## Sovereign Watch Source Intake (dedupliziert, geordnet)

> Quelle: `_tmp_ref_review/geo/Sovereign_Watch`.
> Fokus: Multi-INT Poller-Architektur (ADSB/AIS/Orbital/Infra/RF) mit
> Rate-Limits, Backoff, Arbitration und klarer API-Schicht.

### A) Neue APIs / Feeds / Endpoints (noch nicht in dieser Datei gelistet)

- `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/summary` - `OPTIONAL` (infra outage summary; stabiler als alert-only fuer Lagenbild)
- `https://www.submarinecablemap.com/api/v3/cable/cable-geo.json` - `OPTIONAL` (subsea cable geometry)
- `https://www.submarinecablemap.com/api/v3/landing-point/landing-point-geo.json` - `OPTIONAL` (landing stations)
- `https://www.repeaterbook.com/api/export.php` - `OPTIONAL` (RF repeater directory; token-basiert)
- `https://api.radioreference.com/soap2/?wsdl` - `OPTIONAL` (public safety RF metadata via SOAP; credentials required)
- `https://www.weather.gov/source/nwr/JS/CCL.js` - `OPTIONAL` (NOAA weather radio station list, JS dataset)
- `https://raw.githubusercontent.com/Amateur-Repeater-Directory/ARD-RepeaterList/refs/heads/main/MasterList/MasterRepeater.json` - `OPTIONAL` (ARD repeater list)
- `http://rx.linkfanel.net/kiwisdr_com.js` - `CONTEXT` (KiwiSDR directory mirror, scraping/discovery)
- `https://rx.skywavelinux.com/kiwisdr_com.js` - `CONTEXT` (KiwiSDR fallback mirror)

### B) Neue CelesTrak TLE Gruppen (aus Sovereign-Orbital-Poller)

- `https://celestrak.org/NORAD/elements/gp.php?GROUP=glonass-ops&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=oneweb&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-NEXT&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=cubesat&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=radarsat&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=noaa&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=goes&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=sarsat&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=spire&FORMAT=TLE` - `OPTIONAL`
- `https://celestrak.org/NORAD/elements/gp.php?GROUP=planet&FORMAT=TLE` - `OPTIONAL`

### C) Merkmale (aus Architektur/Implementierung)

- Multi-source Aviation Polling mit `adsb.fi`/`adsb.lol`/`airplanes.live` inkl. Source-Rotation, Limiter, exponentiellem Cooldown.
- AIS als event-driven WebSocket-Ingestion (`AISStream`) mit statischem Vessel-Cache + mission-area Debounce.
- Orbital-Pipeline mit vektorisiertem SGP4, TLE-Caching und kuratierten Gruppen statt blindem Vollkatalog.
- Infra-Layer trennt Outages (`IODA`) und Cable Topology (`submarinecablemap`) sauber von Track-Ingestion.
- RF-Pulse integriert mehrere Source-Arten (REST/JSON, SOAP, JS/CSV-artig) in ein einheitliches Schema.

### D) Staerken / Attraktivitaet / Schwaechen

**Staerken:**
- Solide Ingestion-Engine (Rate-Limit-Strategie, Backoff, De-Dupe, H3/AOR-Logik).
- Gute Trennung von Domainen (aviation/maritime/orbital/infra/rf) und nachvollziehbare Datenpfade.
- Praktisch fuer Fullstack-Usecases, weil API und Poller bereits produktionsnah gedacht sind.

**Attraktiv fuer `tradeview-fusion`:**
- Direkter Mehrwert fuer `geo`-Layer durch `IODA summary` + `submarine cable` + RF-Infrastructure.
- CelesTrak-Gruppen-Set ist umfangreich und kuratiert (brauchbar als Satelliten-Kontextpaket).
- RF-Quellen koennen als eigenstaendiger `CONTEXT/OPTIONAL`-Block in Agent-Workflows dienen.

**Schwaechen / Risiken:**
- Teilweise credentials-heavy (`AISStream`, `RepeaterBook`, `RadioReference`) und damit onboarding-/ops-lastig.
- RF/Directory-Pfade teils scraping-/mirror-abh. (`kiwisdr_com.js`, NOAA JS), daher Fragilitaet moeglich.
- Heterogene Provider-Protokolle (REST + SOAP + scraping) erhoehen Wartungsaufwand und Failure-Modes.

### E) Overlap mit bereits vorhandenen Eintraegen (nicht erneut gelistet)

- Bereits in dieser Datei vorhanden und in `Sovereign_Watch` ebenfalls genutzt:
  `wss://stream.aisstream.io/v0/stream`, `https://opendata.adsb.fi/api/v3/lat/...`,
  `https://api.adsb.lol/v2/...`, `https://api.airplanes.live/v2/point/...`,
  `https://api.ioda.inetintel.cc.gatech.edu/v2/outages/alerts`,
  `https://nominatim.openstreetmap.org/search`,
  `https://celestrak.org/NORAD/elements/gp.php?...`.

---

## WorldWideView Source Intake (dedupliziert, geordnet)

> Quelle: `_tmp_ref_review/geo/worldwideview`.
> Fokus: Cesium-basierter Multi-Layer-Client mit Aviation/Maritime/Wildfire/Camera
> und serverseitigen Proxy-/Fallback-Pfaden.

### A) Neue APIs / Feeds / Endpoints (noch nicht in dieser Datei gelistet)

- `https://opendata.adsb.fi/api/v2/mil` - `OPTIONAL` (military aircraft endpoint; frei, aber mit Rate-Limit/ToS-Pruefung)
- `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{API_KEY}/VIIRS_SNPP_NRT/world/1` - `OPTIONAL` (FIRMS key-basierter CSV-feed)
- `https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv` - `OPTIONAL` (FIRMS no-key fallback CSV)
- `https://services1.arcgis.com/2iUE8l8JKrP2tygQ/arcgis/rest/services/GDOT_Live_Traffic_Cameras/FeatureServer/0/query` - `OPTIONAL` (GDOT traffic camera API via ArcGIS)
- `https://cwwp2.dot.ca.gov/data/d{N}/cctv/cctvStatusD{NN}.json` - `OPTIONAL` (Caltrans district CCTV status feed)
- `https://maps.googleapis.com/maps/api/place/autocomplete/json` - `CONTEXT` (Google Places autocomplete, paid/key-basiert)
- `https://maps.googleapis.com/maps/api/place/details/json` - `CONTEXT` (Google Places details, paid/key-basiert)
- `https://corsproxy.io/?{url}` - `CONTEXT` (public CORS proxy als technische Hilfsschicht, kein Primarfeed)

### B) Unsaubere / statische / scraping-nahe Pfade

- `public-cameras.json` (repo-intern) - `CONTEXT` (statischer Aggregatdump; keine stabile Primaer-API)
- `http://www.insecam.org/en/byrating/?page={n}` - `CONTEXT` (HTML scraping/discovery)
- `http://camlist.net/` - `CONTEXT` (externes Kamera-Verzeichnis, kein robuster API-contract)
- `https://api.codetabs.com/v1/proxy?quest=http://camlist.net/` - `CONTEXT` (Proxy-Hilfspfad fuer camlist Abruf)

### B.1) Public-Cameras Coverage (deduplizierter Befund)

- Datensatzgroesse: `2383` Kamera-Features in `public-cameras.json`.
- Country-Labels im Datensatz: `86` deduplizierte Raw-Labels; nach Normalisierung
  (z. B. `United States` + `United States of America`, `Russia` + `Russian Federation`)
  verbleiben `81` eindeutige Laenderwerte.
- Quellbezug des Befunds:
  `_tmp_ref_review/geo/worldwideview/public/public-cameras.json` (enthaelt die
  extrahierten Stream-/Preview-URLs je Feature).
- Top-Abdeckung nach Kameraanzahl (raw labels):
  `United States` (`432`), `United States of America` (`269`), `Japan` (`161`),
  `Italy` (`126`), `Russia` (`121`), `Germany` (`109`), `Russian Federation` (`98`),
  `Turkey` (`84`), `France` (`68`), `Spain` (`59`), `Korea, Republic Of` (`58`).
- Beobachtete Upstream-Quellen im Datensatz (deduplizierte, haeufige Hosts):
  `http://insecam.org/static/thumb/{id}.jpg`,
  `http://www.insecam.org/en/byrating/?page={n}`,
  `https://cdn.webcamera24.com/...`,
  `https://www.youtube-nocookie.com/...`,
  `https://open.ivideon.com/...`,
  `https://play.player.im/...`,
  `https://rtsp.me/...`,
  `https://share.earthcam.net/...`.
- Zusatzpfade aus Repo-Tests/Discovery, die denselben Kamera-Intake stützen:
  `http://camlist.net/`,
  `https://api.codetabs.com/v1/proxy?quest=http://camlist.net/`.
- Regionale Breite vorhanden (Nordamerika, Europa, Asien plus Teile von LatAm/Afrika),
  aber Quellenqualitaet stark heterogen (viele direkte IP:Port-Streams, verschiedene
  Betreiber, uneinheitliche Verfuegbarkeit).
- Einordnung fuer `tradeview-fusion`: hoher Discovery-Wert fuer Agent/Research,
  jedoch nicht als primaerer, verifizierter Production-Feed behandeln.

### C) Spezialitaeten / Attraktivitaet (aus Implementierung)

- OpenSky credential-pool mit Rotation: mehrere `clientId:clientSecret` Paare,
  credit-tracking und Rotation unter Schwellwert; reduziert 429-/daily-credit-Ausfaelle.
- Adaptive Polling/Resilience: Backoff + jitter + Retry-After-Auswertung + Fallback
  auf gecachte Supabase-Historie bei OpenSky-Fehlern.
- AIS stream-stabilisierung: reconnect-loop, stale-connection cycling, in-memory vessel cache
  und kontrollierte Begrenzung der Cache-Groesse.
- Camera source-fusion: mehrere offizielle Camera-APIs (TfL/GDOT/Caltrans) in einen
  einheitlichen GeoJSON-Pfad zusammengefuehrt.

### D) Schwaechen / Risiken

- Camera-Layer mischt offizielle Feeds mit grossen statischen/heterogenen Streamlisten;
  starke Qualitaets- und Compliance-Varianz.
- Proxy-abh. Zugriffe (`corsproxy`, lokaler proxy-endpoint) sind operativ fragiler als
  direkte provider contracts.
- Google Places ist paid/key-basiert und eher UI-/Search-Context statt Primary OSINT feed.

### E) Overlap mit bereits vorhandenen Eintraegen (nicht erneut gelistet)

- Bereits in dieser Datei vorhanden und in `worldwideview` ebenfalls genutzt:
  `https://opensky-network.org/api/states/all`,
  `https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token`,
  `wss://stream.aisstream.io/v0/stream`,
  `https://api.tfl.gov.uk/Place/Type/JamCam`.

## Aktuelle Runtime-Notiz

- Aktiver Go-/Gateway-Block fuer Geo, OSINT und Kontext:
  - `acled` als kanonischer Event-Feed
  - `gdelt` als globaler Event-/Tone-Fetcher
  - `cfr` als statischer Kontext-Katalog
  - `crisiswatch` als RSS-/Cache-gestuetzter Update-Feed
  - `gametheory` als interner Soft-Signal-/Scenario-Pfad
  - `geopoliticalnext` als Go->Next Geo/BFF-Proxy
- Sanctions-spezifische Watcher (`OFAC`, `UN`, `SECO`, `EU`) bleiben Owner-seitig in den Legal-/Status-/Execution-Dokumenten sichtbar und sind nicht doppelt als OSINT-Kernpfad zu fuehren.
- Die aktiven Geo-/OSINT-Connectoren sind env-led und im Go-Wiring registriert; Delivery-Reife und offene Live-Gates bleiben in `../status.md` und `../../specs/execution/infra_provider_delta.md`.
- Fuer `ACLED` und `CrisisWatch` existiert jetzt bereits ein erster
  `api-snapshot`-Pfad im Go-Layer: Raw-Response plus
  `source_snapshot_metadata`; beide besitzen zusaetzlich bereits einen ersten
  normalized snapshot. Live-Object-Storage-Verify bleibt weiterhin deferred.
- Zusaetzliche externe Kandidaten aus `conflict-globe.gl` (noch nicht als
  produktive Go-Connectoren gefuehrt): `UCDP GED`, `ReliefWeb`,
  `OpenSky`, `CelesTrak`, `Windy Webcams`.

---

## Arbeitsregel

- Diese Datei fuehrt nur Informationsquellen.
- Modelle, Projekte und Pipelines bleiben in ihren Owner-Docs.
- Vor aktivem Onboarding gilt auch hier die Intake-Reihenfolge aus
  `../../specs/execution/source_selection_delta.md`:
  erst fachliche Auswahl und Tiering, dann Onboarding/Rollout.
- Persistenzstandard fuer diese Gruppe:
  - `ACLED`, `GDELT`, `CrisisWatch` sind eher `api-snapshot` als reine
    cache-only Quellen, weil reproduzierbare Event-/Headline-Windows spaeter
    wichtig sind
  - `ACLED` und `CrisisWatch` haben dafuer jetzt bereits einen ersten Raw- plus
    normalized-snapshot-Pfad,
    `GDELT News` wird im Markt-/News-Owner gefuehrt
  - `CFR` bleibt `api-hot`/katalogartig
  - vectorization ist nur fuer normalisierte Dossiers, Reports oder
    News-Segmente sinnvoll, nicht fuer rohe feed payloads
- Operativer Ausbaugrad bleibt in `../status.md` und den Execution-MDs.

---

## Querverweise

- `../status.md`
- `../../specs/execution/source_selection_delta.md`
- `../../specs/execution/source_persistence_snapshot_delta.md`
- `../../specs/execution/vector_ingestion_delta.md`
- `../../specs/geo/GEOMAP_OVERVIEW.md`
- `../../specs/execution/geomap_closeout.md`
- `../../UNIFIED_INGESTION_LAYER.md`
