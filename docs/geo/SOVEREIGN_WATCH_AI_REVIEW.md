# SOVEREIGN_WATCH Reference Review

> **Stand:** 16. Maerz 2026  
> **Zweck:** Detailliertes Referenzreview von `Sovereign_Watch` fuer GeoMap-Weiterentwicklung in TradeView Fusion.  
> **Quelle (Clone):** `D:/tradingview-clones/_tmp_ref_review/geo/Sovereign_Watch`  
> **Kuratiertes Extrakt (Extraction):** `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/sovereign_watch`  
> **Manifest:** `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/sovereign_watch/extraction_manifest.txt`  
> **Upstream-Referenz:** https://github.com/d3mocide/Sovereign_Watch  
> **Scope:** Backend-Resilience, Ingestion-Orchestrierung, replay/history Contracts, map-runtime patterns, operator UI patterns.  
> **Nicht-Scope:** 1:1 Produktimport, tactical branding als Ziel-UI, unkontrollierte Infra-Uebernahme.

---

## 1. Warum dieses Dokument existiert

`Sovereign_Watch` ist im Vergleich zu vielen Geo-Repos kein "nur-Frontend-Showcase", sondern ein relativ kompletter Referenzkandidat fuer:

- Multi-INT Ingestion (Aviation, Maritime, Orbital, RF, Infra),
- API-/Realtime-Verteilung (REST + WebSocket + Kafka/Redis-Flows),
- persistente Historisierung und Replay,
- map-zentrierte Operator-Oberflaechen mit Layer-/Widget-Kopplung.

Dieses Dokument ist als belastbarer Arbeitsanker fuer Folgeagenten gedacht:

- **was** konkret uebernommen werden sollte (A/B/C),
- **wo** der Kontext liegt (Clone vs Extraction),
- **wie** Transfer ohne Scope-Drift auf eure Flat-Mode-GeoMap erfolgt.

---

## 2. Pfade, Arbeitsregel, aktueller Extraction-Stand

## 2.1 Source of truth fuer Analyse

- `D:/tradingview-clones/_tmp_ref_review/geo/Sovereign_Watch`

Nutzen:

- Vollkontext bei Imports, seiteneffekten und Laufzeitannahmen,
- Rueckverfolgung von Architekturentscheidungen ueber API, Ingestion, Frontend.

## 2.2 Source of truth fuer Transfer

- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/sovereign_watch`
- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/sovereign_watch/extraction_manifest.txt`

Aktueller Stand aus dem Manifest:

- `selected_count=122`
- `stage_a_count=68`
- `stage_b_count=20`
- `stage_c_count=9`
- `gap_patch_count=25`
- `missing_count=0`

## 2.3 Arbeitsregel

- Erst im Extraction-Ordner evaluieren.
- Nur bei Kontextluecken in den Clone springen.
- Keine Vollrepo-Uebernahme, nur pattern-basiertes Adaptieren auf bestehende GeoMap-Contracts.

---

## 3. Technische Kurzbewertung von Sovereign_Watch

## 3.1 Staerken

- **Backend-Architektur ist reif fuer Referenzzwecke**:
  - klare Trennung API / Ingestion / DB / Messaging.
- **Realtime + History zusammen gedacht**:
  - live streams plus Replay-/History-Endpunkte.
- **Resilience in Pollern sichtbar**:
  - rate limiting, cooldown/backoff, source arbitration.
- **Frontend map-runtime ist tief**:
  - Worker-gestuetzte Entitaetsverarbeitung,
  - Layer-Builders fuer unterschiedliche Domain-Layer.

## 3.2 Schwaechen / Vorsicht

- Infra footprint ist schwerer als bei leaneren Repos.
- Teile sind stark tactical-orientiert in UI/Terminologie.
- Einzelne Fluessse sind domain-spezifisch (JS8/RF) und muessen klar eingegrenzt werden.
- AI-Teil ist vorhanden, aber fuer eure Kernroadmap eher sekundar gegenueber Runtime-/Backend-Wert.

---

## 4. Detaillierte Einordnung nach Architektur-Layern

## 4.1 Backend API Layer

Hochrelevante Referenzen:

- `backend/api/main.py`
- `backend/api/routers/tracks.py`
- `backend/api/routers/analysis.py`
- `backend/api/routers/orbital.py`
- `backend/api/routers/infra.py`
- `backend/api/routers/rf.py`
- `backend/api/services/broadcast.py`
- `backend/api/services/historian.py`
- `backend/api/services/tak.py`

Nutzen fuer TradeView Fusion:

- saubere Lebenszyklussteuerung und service wiring,
- abgesicherte Parameter-/Fensterpruefungen in replay/history,
- klare Trennung zwischen ingest persist und websocket fanout.

## 4.2 Ingestion Layer

Hochrelevante Referenzen:

- `backend/ingestion/aviation_poller/multi_source_poller.py`
- `backend/ingestion/aviation_poller/service.py`
- `backend/ingestion/aviation_poller/arbitration.py`
- `backend/ingestion/aviation_poller/h3_sharding.py`
- `backend/ingestion/maritime_poller/service.py`
- `backend/ingestion/orbital_pulse/service.py`
- `backend/ingestion/rf_pulse/service.py`
- `backend/ingestion/infra_poller/main.py`

Nutzen:

- robustes source failover und cooldown-Verhalten,
- Priorisierung dichter Bereiche (H3) fuer effiziente Polling-Cadence,
- pattern fuer multi-domain poller mit gemeinsamen Vertragsgrenzen.

## 4.3 Data/DB Layer

Relevante Referenzen:

- `backend/db/init.sql`
- `backend/db/migrate_rf_plus.sql`
- `backend/db/migrate_tracks_72h_retention.sql`
- `backend/db/migrate_orbital_tracks_cd.sql`
- `backend/database/retention_policy.sql`

Nutzen:

- klare Historisierungsstrategie fuer Trackdaten,
- DB-policy pattern fuer retention und query-kontrollierbarkeit.

## 4.4 Frontend Runtime Layer

Hochrelevante Referenzen:

- `frontend/src/App.tsx`
- `frontend/src/workers/tak.worker.ts`
- `frontend/src/hooks/useEntityWorker.ts`
- `frontend/src/components/map/TacticalMap.tsx`
- `frontend/src/components/map/OrbitalMap.tsx`
- `frontend/src/layers/buildEntityLayers.ts`
- `frontend/src/layers/buildTrailLayers.ts`
- `frontend/src/layers/buildInfraLayers.ts`
- `frontend/src/utils/replayUtils.ts`
- `frontend/src/types.ts`

Nutzen:

- worker-first parsing/decoding pattern,
- stabile map runtime orchestration mit klaren layer-builders,
- nachvollziehbarer replay contract im UI.

---

## 5. AI-/Agent-Relevanz realistisch bewertet

## 5.1 Was vorhanden ist

- AI endpoint / analysis flow ist vorhanden (`backend/api/routers/analysis.py`),
- Modellrouting-Konfigurationsansatz ist vorhanden (`backend/ai/litellm_config.yaml`).

## 5.2 Was das fuer TradeView Fusion bedeutet

- **Wertvoll als Integrationspattern**, nicht als "fertige AI-Loesung".
- Relevanz liegt vor allem in:
  - streamender API-Antwortlogik,
  - model-selection/fallback-konfiguration,
  - Verknuepfung von Telemetrie + Kontext als Prompt-Vorstufe.

Fazit:

- AI ist **B-Prioritaet** gegenueber den deutlich staerkeren Backend-/Runtime-Mustern.

---

## 6. A/B/C-Priorisierung fuer Adoption

Definition:

- **A** = kurzfristig hoher Nutzen, geringes Integrationsrisiko
- **B** = nuetzlich mit erkennbarer Adapter-/Governance-Last
- **C** = nur Referenz oder bewusst nicht uebernehmen

## 6.1 A - Sofort nutzbare Muster

Cluster:

- API replay/history/search contracts (`backend/api/routers/tracks.py`)
- websocket broadcast queueing/backpressure (`backend/api/services/broadcast.py`)
- historian batch + flush semantics (`backend/api/services/historian.py`)
- multi-source aviation polling resilience (`backend/ingestion/aviation_poller/*`)
- tactical map runtime + worker + layer builders (`frontend/src/components/map/*`, `frontend/src/layers/*`, `frontend/src/workers/tak.worker.ts`)
- typing/contract grounding (`frontend/src/types.ts`)

Warum A:

- direkte Uebertragbarkeit auf eure aktuelle GeoMap-Baustelle (Flat-Mode + robustes Datenverhalten),
- klarer Mehrwert bei Stabilitaet, Beobachtbarkeit und Performance.

## 6.2 B - Selektiv mit Adapter-Schicht

Cluster:

- AI analysis path + litellm routing (`backend/api/routers/analysis.py`, `backend/ai/litellm_config.yaml`)
- JS8/RF-spezifische UI-/Hook-Pfade
- tiefe tactical UI widgets, falls sie nicht auf eure Produkt-UX gemappt sind

Warum B:

- hoher Nutzen in Teilen, aber mehr domain-/produkt-spezifische Anpassung noetig.

## 6.3 C - Referenz only / nicht direkt uebernehmen

- 1:1 tactical skin/terminologie als Produktstandard,
- infra-spezifische Defaults ohne euer eigenes policy/gateway/ops Modell,
- unkritisch wirkende, aber stark gekoppelte One-off-Flows ohne klaren Contract-Fit.

---

## 7. Was im aktuellen Extraction-Stand jetzt wirklich abgedeckt ist

Der Extraction-Stand ist nach Gap-Patch deutlich robuster:

- Core backend/api patterns,
- ingestion resilience patterns ueber mehrere Domains,
- map runtime + worker + contracts,
- operationale Dateien fuer startup/requirements/retention,
- js8/rf-nahe Vertragsdateien fuer bessere Nachvollziehbarkeit.

Damit ist das Paket nicht nur "Code-Sampling", sondern ein verwendbarer Referenzsatz fuer:

- API contract hardening,
- ingestion hardening,
- map runtime hardening.

---

## 8. Empfohlenes Vorgehen fuer TradeView Fusion

## Phase 1 (A-Paket zuerst)

- replay/history/freshness contracts aus `tracks.py` auf eigenen BFF/Gateway-Schnitt adaptieren,
- broadcast/historian Muster fuer live + persist kombinieren,
- poller resilience pattern (cooldown, failover, arbitration) auf eigene provider layer mappen,
- map worker + layer build patterns in eure bestehende map runtime integrieren.

## Phase 2 (B-Paket kontrolliert)

- AI-routing/analysis patterns als optionale Erweiterung evaluieren,
- js8/rf-lastige patterns nur ueber klaren product-fit und policy-fit aufnehmen.

## Phase 3 (Hardening)

- contract tests fuer replay/time windows/degraded behavior,
- load tests fuer websocket fanout + map layer updates,
- security/policy review fuer alle externen source adapters.

---

## 9. Do/Don't fuer Folgeagenten

## Do

- zuerst `extraction_manifest.txt` lesen,
- A-Patterns zuerst integrieren,
- clone nur bei Kontextluecken nutzen,
- source-spezifische Konstanten konsequent in eigene Config/Policy auslagern.

## Don't

- keine 1:1 tactical UI Uebernahme,
- keine ungepruefte infra-/message-bus Annahmen in Produktpfade kopieren,
- keine AI-Ueberhoehung: runtime/backend Nutzen ist prior.

---

## 10. Entscheidungsstatement

`Sovereign_Watch` ist fuer TradeView Fusion vor allem als **Backend- und Runtime-Referenz** sehr wertvoll.  
Der groesste Hebel liegt in Ingestion-Resilience, replay/history contracts und map-worker/layer orchestration.  
Mit dem aktuellen `selected_count=122` Extraction-Stand ist die Referenzbasis jetzt ausreichend breit, um in konkrete A-Paket-Integration zu gehen.

Empfehlung:

- kurzfristig A-Paket umsetzen,
- B-Paket strikt adapterbasiert,
- C-Paket bewusst referenz-only halten.

