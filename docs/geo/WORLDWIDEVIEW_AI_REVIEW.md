# WorldWideView Reference Review

> **Stand:** 16. Maerz 2026  
> **Zweck:** Detailliertes Referenzreview von `worldwideview` fuer GeoMap-Weiterentwicklung in TradeView Fusion.  
> **Quelle (Clone):** `D:/tradingview-clones/_tmp_ref_review/geo/worldwideview`  
> **Kuratiertes Extrakt:** `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/worldwideview`  
> **Scope:** Architektur-, Contract-, Adapter- und UI-Patterns fuer uebertragbare Umsetzung.  
> **Nicht-Scope:** 1:1 Codeimport in Produktcode.

---

## 1. Warum dieses Dokument existiert

`worldwideview` war in der Referenz-Rangliste ein starker Kandidat fuer GeoMap-nahe Patterns.  
Der Mehrwert liegt weniger in "AI-Features", sondern in einer robusten Kombination aus:

- Plugin-Architektur fuer Datenquellen
- resilienten Datenadaptern (Polling, Cache, Fallback)
- UI-Kopplung aus Timeline, Selection, Search und Live-Video
- klarer Cesium/Globe-orientierter Runtime-Orchestrierung

Dieses Dokument ist der belastbare Umsetzungsanker, damit spaetere CLI-Agenten klar sehen:

- **was** relevant ist,
- **wo** die Referenz liegt (Clone vs Extraction),
- **warum** es aufgenommen wurde,
- und **wie** es in A/B/C priorisiert zu behandeln ist.

---

## 2. Pfade und Arbeitsregel (wichtig)

## 2.1 Source of truth fuer Analyse

- Vollstaendige Referenzbasis: `D:/tradingview-clones/_tmp_ref_review/geo/worldwideview`

Nutzen:

- komplette Kontextpruefung bei Rueckfragen
- Nachlesen von Imports, Seiteneffekten, Abhaengigkeiten
- Validierung, ob ein Pattern wirklich generisch ist

## 2.2 Source of truth fuer Extraction

- Kuratierter Arbeitsstand: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/worldwideview`
- Manifest: `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/worldwideview/extraction_manifest.txt`

Aktueller selektierter Stand:

- `selected_count=76`
- Stage 1 + 2 + 2.5 + 3 + 4 + 4.5

## 2.3 Arbeitsregel

- Erst im **Extraction-Ordner** evaluieren und auf TradeView-Fit pruefen.
- Nur bei Unklarheiten in den **Clone** zurueckspringen.
- Keine Massenuenahme "alles aus Clone"; nur Pattern-Transfer mit Anpassung auf unsere Contracts.

---

## 3. Kurzfazit zu `worldwideview`

## 3.1 Staerken

- Sehr brauchbare Plugin-/DataBus-/Polling-Grundstruktur.
- Gute Adapter-Robustheit (Backoff, Retry, Credential Rotation, Fallback-Ladder).
- Saubere Separation zwischen API-Routen und Frontend-Verbrauch.
- UI-Patterns fuer Analystenbetrieb: Search, Hover/Selection, Timeline, Floating Streams.

## 3.2 Schwaechen / Vorsicht

- Kein direkter LLM-/RAG-/Agentlayer-Mehrwert.
- Einzelne Teile sind stark quellenspezifisch (Provider-URLs, Grenzwerte, Kategorienamen).
- `camera/proxy`-Pattern ist sicherheitskritisch (SSRF-Risiko) und nicht direkt uebernehmbar.
- Timeline-Contract ist schwacher als unser Zielmodell (`view/filter/selected-time` sauber getrennt).

---

## 4. AI-/Backend-Relevanz realistisch eingeordnet

## 4.1 AI-Lage

- Kein echter LLM/Agent-Stack als Blaupause im Projektkern.
- Der Nutzen fuer uns ist daher **indirekt**:
  - robuste Datenbereitstellung,
  - Historie/Availability fuer Playback,
  - Diagnostics/API-Key-Flows,
  - Orchestrierung von Streams/Pollern.

## 4.2 Backend-Mehrwert (hoch)

Besonders relevant:

- `app/api/aviation/history/route.ts` (nearest timestamp replay)
- `app/api/aviation/availability/route.ts` (timeline availability)
- `lib/aviation/rate-limit.ts` (header-driven backoff)
- `app/api/keys/verify/route.ts` (provider diagnostics)
- `instrumentation.ts` (runtime startup orchestration)

---

## 5. A/B/C-Empfehlung (klar priorisiert)

Definition:

- **A = sofortiger Hebel** (kurzfristig in GeoMap nutzbar, hoher Nutzen, geringes Risiko)
- **B = gezielt spaeter** (nuetzlich, aber mit mehr Integrations-/Anpassungsaufwand)
- **C = bewusst nicht uebernehmen** (Risiko, zu spezifisch, oder schlechter als unser Zielcontract)

## 5.1 A - Sofort uebernehmen (Patterns zuerst)

### Engine / Data Contracts

- `src/core/plugins/PluginTypes.ts`
- `src/core/plugins/PluginManager.ts`
- `src/core/data/DataBus.ts`
- `src/core/data/PollingManager.ts`
- `src/core/data/CacheLayer.ts`
- `src/core/filters/filterEngine.ts`

### Backend Reliability

- `src/app/api/aviation/history/route.ts`
- `src/app/api/aviation/availability/route.ts`
- `src/lib/aviation/rate-limit.ts`
- `src/lib/aviation/state.ts`
- `src/app/api/keys/verify/route.ts`

### UI Coupling (contracts first)

- `src/core/globe/InteractionHandler.ts`
- `src/core/globe/SelectionHandler.ts`
- `src/core/globe/TimelineSync.ts`
- `src/core/state/uiSlice.ts`
- `src/components/timeline/Timeline.tsx`
- `src/components/layout/useSearch.tsx`
- `src/components/layout/SearchBar.tsx`

### Warum A

- Starker Hebel auf Stabilitaet + Bedienbarkeit.
- Direkt kompatibel mit geplanter GeoMap-Richtung.
- Gute Trennung von "Contract-Idee" und "anbieter-spezifischer Implementierung".

## 5.2 B - Spaeter uebernehmen (mit Adapter-Schicht)

### Source-/Provider-spezifische Adapter

- `src/lib/aviation/supabase.ts`
- `src/lib/aviation/auth.ts`
- `src/lib/aviation/credentials.ts`
- `src/lib/aviation/polling.ts`
- `src/lib/ais-stream.ts`
- `src/lib/military/polling.ts`
- `src/app/api/wildfire/route.ts`
- `src/app/api/camera/tfl/tflFetcher.ts`
- `src/app/api/camera/caltrans/caltransFetcher.ts`

### UI Shell / Panels (groesserer Integrationsaufwand)

- `src/components/layout/Header.tsx`
- `src/components/panels/LayerPanel.tsx`
- `src/components/panels/FilterPanel.tsx`
- `src/components/panels/DataConfig/*`
- `src/components/video/*`
- `src/components/common/FloatingWindow.tsx`

### Warum B

- Hoher Wert, aber source-/UI-spezifische Details muessen in unsere Contracts gemappt werden.
- Gefahr von versteckten Seiteneffekten, wenn ohne Facade-Schicht eingebaut.

## 5.3 C - Nicht uebernehmen (oder nur als Warnbeispiel)

- `src/app/api/camera/proxy/route.ts`  
  (open proxy shape, SSRF-Risiko ohne harte Allowlist/Policy)
- Direkte Uebernahme providerfixer Schwellenwerte/Labels/URLs  
  (nur Pattern, nicht rohe Konstanten)
- Timeline-Vereinfachung auf reinen Preset-/Single-Window-Ansatz  
  (Regression gegen unser Zielmodell)

---

## 6. Was im Extraction-Ordner jetzt abgedeckt ist

Im aktuellen Extraction-Stand sind bereits folgende Cluster sauber vorhanden:

- Stage 1: Core Rendering + Plugin/Data Contracts
- Stage 2: Data Adapters
- Stage 2.5: Backend Benefits (history/availability/keys/instrumentation/geocoding)
- Stage 3: Timeline/Selection/UI Contracts
- Stage 4: Search/Video/Store-Support/Converter
- Stage 4.5: AppShell-nahe UI-Orchestrierung + Panel-System

Siehe:

- `D:/tradingview-clones/_tmp_ref_review/extraction_candidates/worldwideview/extraction_manifest.txt`

---

## 7. Empfohlenes Vorgehen fuer TradeView Fusion (konkret)

## Phase 1 (A-Paket)

- Plugin-/DataBus-/Polling-Contract in unserer GeoMap-Sprache stabilisieren.
- `history` + `availability` + `key verify` als API-Grundbausteine einziehen.
- Search-/Selection-/Timeline-Kopplung auf unseren Temporal-Contract mappen.

## Phase 2 (B-Paket)

- Provider-Adapter via eigene Facade normalisieren (kein raw copy).
- Video/Floating-Pattern uebernehmen, aber mit eigener Security/Policy.
- Panel-Architektur modularisieren (rechte/links rails nicht monolithisch spiegeln).

## Phase 3 (Hardening)

- Security Review fuer alle Proxy-/Key-Pfade.
- Last-/Stabilitaetstests fuer Polling und WS-Reconnect.
- Contract-Tests fuer Timeline (`view`, `filter`, `selected-time`) gegen Regression.

---

## 8. Do/Don't fuer Folgeagenten

## Do

- immer zuerst `extraction_manifest.txt` lesen
- Clone nur fuer fehlenden Kontext oeffnen
- A vor B priorisieren
- source-spezifische Werte durch unsere Config ersetzen

## Don't

- keine 1:1 Uebernahme kompletter UI-Flaechen
- keine offene Proxy-Route uebernehmen
- keine Absenkung unseres Temporal-Contracts

---

## 9. Entscheidungsstatement

`worldwideview` ist als Referenz **wertvoll fuer Architektur und Operations-Patterns**, nicht fuer "AI-Features".  
Die aktuelle Extraction ist jetzt breit genug, um nicht nur "mageres Component-Sampling" zu haben, sondern einen echten End-to-End-Blueprint von Backend-Resilience bis UI-Orchestrierung.

Empfehlung:  
ab jetzt mit **A-Paket** in TradeView Fusion starten, B-Paket nur adapterbasiert, C bewusst vermeiden.

