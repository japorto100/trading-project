# SHADOWBROKER Reference Review

> **Stand:** 16. Maerz 2026  
> **Zweck:** Detailliertes Referenzreview von `Shadowbroker` fuer GeoMap-Weiterentwicklung in TradeView Fusion.  
> **Quelle (Clone):** `D:/tradingview-clones/_tmp_ref_review/geo/Shadowbroker`  
> **Kuratiertes Extrakt (Extraction):** `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker`  
> **Upstream-Referenz:** https://github.com/BigBodyCobain/Shadowbroker  
> **Scope:** Backend-Resilience, API-/Polling-Contracts, Map-Orchestrierung, UI-Interaktionsmuster.  
> **Nicht-Scope:** 1:1 Produkt-Import, Tactical-Branding, source-spezifische Hardcodings.

---

## 1. Warum dieses Dokument existiert

`Shadowbroker` ist fuer eure GeoMap-Richtung ein starker Referenzkandidat, weil es mehrere Dinge kombiniert, die in Produktprojekten oft getrennt auftauchen:

- multi-source Datenerfassung (Flug, Schiff, News, Sensorik, Satellit, Geo-Events),
- robuste Backend-Laufzeit mit Scheduler, Caches, Fallbacks und Health/Freshness,
- performante Frontend-Map-Orchestrierung fuer grosse Live-Datensaetze.

Das Dokument dient als belastbarer Anker fuer Folgeagenten:

- **was** uebernommen werden sollte (A/B/C),
- **wo** der Kontext liegt (Clone vs Extraction),
- **wie** Transfer ohne Scope-Drift auf eure Contracts erfolgt.

---

## 2. Pfade und Arbeitsregel

## 2.1 Source of truth fuer Analyse

- `D:/tradingview-clones/_tmp_ref_review/geo/Shadowbroker`

Nutzen:

- kompletter Codekontext inkl. Seiteneffekten und Abhaengigkeiten,
- Verifikation von Imports, Laufzeitpfaden, Datenfluss.

## 2.2 Source of truth fuer Transferarbeit

- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker`
- Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker/extraction_manifest.txt`
- Deep-Dive-Notiz: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/shadowbroker/SHADOWBROKER_DEEPDIVE.md`

Aktueller Stand:

- `selected_count=40`
- Stage 1 (Backend Core) + Stage 2 (Frontend Orchestration) + Stage 3 (UI Support/Utils)

## 2.3 Arbeitsregel

- Erst im Extraction-Ordner evaluieren.
- Nur bei Kontextluecken in den Clone zurueckspringen.
- Kein Vollimport; nur Pattern-Transfer auf eure bestehenden GeoMap-Contracts.

---

## 3. Kurzfazit zu Shadowbroker

## 3.1 Staerken

- Sehr starke Backend-Resilience-Muster:
  - Fast/Slow Datenpfade,
  - source freshness tracking,
  - HTTP retry/fallback/circuit-breaker.
- Solider Runtime-Proxy-Ansatz via Next Catch-All Route (serverseitig, runtime-resolved URL).
- Relevante Map-Performance-Techniken:
  - imperative Source-Updates,
  - viewport culling,
  - Cluster-/Layer-Segmentierung fuer dichte Daten.
- Gute Operator-UI-Muster:
  - Suche/Fly-to,
  - Filterdialoge,
  - Settings-/Feed-Konfiguration,
  - Situationspanel fuer Entity-Details.

## 3.2 Schwaechen / Vorsicht

- Kein echter LLM-/Agent-/RAG-Stack (AI-Wert ist indirekt, nicht core).
- Mehrere Heuristiken sind source- und domain-spezifisch (nicht blind uebernehmen).
- Teile sind stark style-/branding-lastig (tactical skin) und nicht produktneutral.
- Einzelne Datenquellen/Flows sind fragil bzw. anti-bot-getrieben und brauchen Governance.

---

## 4. AI-/Backend-Relevanz realistisch eingeordnet

## 4.1 AI-Lage

- Kein produktionsnahes LLM-Subsystem identifiziert.
- Vorhanden ist nur AI-aehnliche Heuristik (`machine_assessment`) in der News-Pipeline.
- Nutzen fuer TradeView Fusion:
  - als Placeholder-Pattern fuer rule-based Vorbewertung,
  - nicht als Blaupause fuer echte AI-Architektur.

## 4.2 Backend-Mehrwert (hoch)

Besonders transferstark:

- `backend/main.py` (Lifecycle, CORS-Policy-Building, ETag Endpoints, Service Wiring),
- `backend/services/data_fetcher.py` (mehrstufige Datenorchestrierung, Caching, Freshness),
- `backend/services/network_utils.py` (retry + curl fallback + circuit breaker),
- `backend/services/ais_stream.py` (WS-Stream mit Persistenz und Reconnect-Backoff),
- `backend/services/region_dossier.py` (parallelisierte Aggregation mehrerer Wissensquellen),
- `backend/services/news_feed_config.py` und `backend/services/api_settings.py` (Runtime-Konfiguration).

---

## 5. A/B/C-Empfehlung (klar priorisiert)

Definition:

- **A** = kurzfristig hohes Nutzensignal, geringes Integrationsrisiko
- **B** = nuetzlich mit spuerbarem Adapter-/Governance-Aufwand
- **C** = nur Referenz oder bewusst nicht uebernehmen

## 5.1 A - Sofort nutzbare Muster

### Backend Contracts und Runtime

- `backend/main.py`
- `backend/services/data_fetcher.py`
- `backend/services/network_utils.py`
- `backend/services/ais_stream.py`
- `backend/services/region_dossier.py`
- `backend/services/sentinel_search.py`
- `backend/services/news_feed_config.py`
- `backend/services/api_settings.py`

### Frontend Runtime-/API-Kopplung

- `frontend/src/app/api/[...path]/route.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/app/page.tsx`
- `frontend/src/components/MaplibreViewer.tsx`
- `frontend/src/components/FindLocateBar.tsx`
- `frontend/src/components/FilterPanel.tsx`
- `frontend/src/components/AdvancedFilterModal.tsx`

### Warum A

- Direkt mit eurer Flat-Mode-GeoMap kompatibel (Contract-Ideen statt Source-Bindung).
- Hoher Stabilitaetsgewinn bei Polling, Backend Reachability und Datenaktualitaet.
- Gute Uebertragbarkeit in bestehende Next/BFF/MapLibre-nahe Architektur.

## 5.2 B - Selektiv mit Adapter-Schicht

- `backend/services/carrier_tracker.py` (OSINT-Region-Heuristik brauchbar, Datenannahmen stark spezifisch)
- `backend/services/geopolitics.py` (GDELT/Frontline-Pipeline als Muster, nicht als raw logic)
- `backend/services/cctv_pipeline.py` (Ingestor-Struktur gut, Providerdetails austauschpflichtig)
- `backend/services/radio_intercept.py` (nearest-system Pattern nuetzlich, Scrape-Details fragil)
- `backend/services/liveuamap_scraper.py` (stealth-scraping als Sonderfall, Governance erforderlich)
- `frontend/src/components/NewsFeed.tsx` (Entity-context rendering Pattern gut, Inhalte/UI anpassen)
- `frontend/src/components/SettingsPanel.tsx` (Settings-UX und Config-Flow gut uebertragbar)
- `frontend/src/components/RadioInterceptPanel.tsx` (Scan-/Tune-Pattern nutzbar, source-spezifisch entkoppeln)
- `frontend/src/components/CesiumViewer.tsx` (nur als optionaler 3D-sidecar Referenzpfad)
- `frontend/src/components/WorldviewLeftPanel.tsx`
- `frontend/src/components/WorldviewRightPanel.tsx`

### Warum B

- hoher Nutzwert, aber viele Teile sind source- oder domain-spezifisch,
- ohne klare Adapter/Policy droht schneller Scope-Drift.

## 5.3 C - Nur Referenz / nicht uebernehmen

- tactical Branding-/Theme-Layer als Produktstandard,
- pseudo-analytische Textgeneratorik ohne nachvollziehbares Modell,
- one-off Hilfsskripte ohne Produktlaufzeitwert:
  - `backend/check_regions.py`
  - `backend/clean_osm_cctvs.py`
  - `backend/extract_ovens.py`
  - `backend/geocode_datacenters.py`
  - `backend/services/__init__.py`
  - `frontend/src/types.d.ts`

---

## 6. Was die aktuelle Extraction abdeckt

Im Extraction-Stand sind jetzt sowohl Core- als auch Zusatzmuster enthalten:

- Backend Core Runtime + Adaptermuster,
- Frontend API/Map-Orchestrierung,
- UI-Interaktionsmuster fuer Search, Filter, Settings, Panels,
- optionaler 3D-Referenzpfad (Cesium),
- Support-Utilities (Theme, tracked data mappings, solar terminator).

Damit ist die Extraction nicht nur "Component-Sampling", sondern ein belastbarer End-to-End-Referenzsatz fuer Flat-Mode-nahe Weiterentwicklung.

---

## 7. Empfohlenes Vorgehen fuer TradeView Fusion

## Phase 1 (A-Paket)

- Fast/Slow Payload Contract + Freshness + ETag in euren Geo-Endpoints stabilisieren.
- resiliente Fetch-Schicht (retry/fallback/circuit-breaker) ueber eigene Utility/Facade einfuehren.
- Map-Orchestrierungsmuster (`setData`, culling, layer segmentation) gezielt uebernehmen.

## Phase 2 (B-Paket)

- source-spezifische Adapter auf eigene Provider-Registry mappen.
- Settings-/Filter-/Entity-Panel-Muster an bestehende Produkt-UX anpassen.
- optionalen 3D-Sidecar nur hinter sauberer Runtime-Trennung evaluieren.

## Phase 3 (Hardening)

- Security-/Policy-Review fuer Scraper und externe Quellen,
- Contract-Tests fuer data freshness, polling cadence, fallback behavior,
- Lasttests fuer high-volume Layer Updates und UI-Reaktionszeiten.

---

## 8. Do/Don't fuer Folgeagenten

## Do

- immer zuerst `extraction_manifest.txt` lesen,
- Clone nur fuer Kontextvertiefung nutzen,
- A vor B priorisieren,
- source-gebundene Konstanten konsequent in eigene Config/Policy auslagern.

## Don't

- keine 1:1 Uebernahme des tactical UIs,
- keine direkte Uebernahme von heuristischen Risiko-Texten als "AI-Funktion",
- keine stillen Scope-Erweiterungen in Globe/3D, solange Flat-Mode priorisiert ist.

---

## 9. Entscheidungsstatement

`Shadowbroker` liefert fuer TradeView Fusion vor allem **starke Runtime- und Resilience-Patterns** und nur **indirekten AI-Nutzen**.  
Die aktuelle Extraction ist fuer den naechsten Umsetzungsschritt ausreichend breit und deckt die technisch wertvollen Bereiche ab.

Empfehlung:

- kurzfristig A-Paket integrieren,
- B-Paket nur adapterbasiert und governance-sicher,
- C bewusst referenz-only halten.

