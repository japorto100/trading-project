# WorldMonitor Reference Review

> **Stand:** 19. Maerz 2026  
> **Zweck:** Detailliertes Referenzreview von `worldmonitor` fuer GeoMap-, Flat-Mode-, Panel- und Shell-Weiterentwicklung in TradeView Fusion.  
> **Quelle (Clone):** `D:\tradingview-clones\tradeview-fusion\_tmp_ref_review\geo\worldmonitor`  
> **Kuratiertes Extrakt:** `D:\tradingview-clones\tradeview-fusion\_tmp_ref_review\extraction_candidates\worldmonitor`  
> **Scope:** Karten-Engine, Marker-/Layer-Strategie, Panel-System, Shell-Orchestrierung, Datenquellen und uebertragbare UI-/Runtime-Patterns.  
> **Nicht-Scope:** 1:1 Codeimport in Produktcode.

---

## 1. Warum dieses Dokument existiert

`worldmonitor` ist fuer uns keine generische Inspiration, sondern ein konkreter Referenzfall fuer drei offene TradeView-Fusion-Probleme:

- Wie trennen wir Globe- und Flat-Renderer sauber?
- Wie bauen wir aus der GeoMap eine kohärente Analysten-Surface statt einer Shell mit zu viel Inline-Logik?
- Wie organisieren wir Panels, Status, Feed-/Source-Breiten und rechte Rail so, dass das Produkt nicht chaotisch wirkt?

Der Clone wurde deshalb lokal als Referenzbasis verankert und ein gezielter Extrakt erstellt, damit spaetere Agenten nicht wieder nur Screenshots vergleichen, sondern belastbar auf die Runtime-/UI-Struktur schauen.

---

## 2. Pfade und Arbeitsregel

### 2.1 Vollstaendige Referenzbasis

- Clone: `D:\tradingview-clones\tradeview-fusion\_tmp_ref_review\geo\worldmonitor`

Nutzen:

- komplette Kontextpruefung bei Rueckfragen
- echte Dateibeziehungen zwischen Karte, Panels, Data Loader, Search und Styles
- Nachweis, welche Teile wirklich produktpraegend sind statt nur visuell auffaellig

### 2.2 Kuratiertes Arbeits-Extrakt

- Extrakt: `D:\tradingview-clones\tradeview-fusion\_tmp_ref_review\extraction_candidates\worldmonitor`
- Manifest: `D:\tradingview-clones\tradeview-fusion\_tmp_ref_review\extraction_candidates\worldmonitor\extraction_manifest.txt`

Aktueller selektierter Stand:

- `selected_count=19`
- Fokus auf `Map.ts`, `DeckGLMap.ts`, `MapContainer.ts`, `Panel.ts`, `App.ts`, `panel-layout.ts`, `data-loader.ts`, `feeds.ts`, `panels.ts`, `panels.css`

### 2.3 Arbeitsregel

- Erst im Extrakt evaluieren und TradeView-Fit pruefen.
- Nur bei Unklarheiten in den Clone zurueckspringen.
- Keine Uebernahme "ganzer Komponentenfamilien", sondern Transfer von Architektur- und UX-Patterns.

---

## 3. Kurzfazit

`worldmonitor` gewinnt nicht deshalb, weil es "kein D3" benutzt. Es gewinnt, weil es drei Dinge sauberer zusammenzieht als wir:

- ein explizites **Dual-Engine-Map-Modell**
- ein echtes **Panel-/Shell-System**
- eine sichtbare **produktive Orchestrierung** von Quellen, Status und Interaktion

Die Karte ist nur ein Teil davon. Der staerkste Uebertrag fuer TradeView Fusion ist aktuell nicht "neue Marker" oder "anderer Renderer", sondern die Kombination aus:

- Map-Surface
- rechte/sekundaere Informationsschicht
- persistente Panel- und Layout-Logik
- klare Layer-/Source-/Status-Kommunikation

---

## 4. Belastbare Architektur-Facts aus dem Clone

### 4.1 `worldmonitor` ist nicht "MapLibre-only"

Zentrale Dateien:

- `src/components/Map.ts`
- `src/components/DeckGLMap.ts`
- `src/components/MapContainer.ts`

Fakten:

- `Map.ts` nutzt `d3`, `topojson`, SVG, DOM-Overlays und Canvas-nahe Hilfsschichten.
- `DeckGLMap.ts` nutzt `deck.gl + MapLibre` fuer den Desktop-/Heavy-Path.
- `MapContainer.ts` waehlt zwischen beiden Implementierungen anhand von Device/WebGL-Faehigkeit.

Bewertung:

- `worldmonitor` ist bereits ein **2-Engine-System**.
- Der "moderne Eindruck" kommt nicht von D3-Verzicht, sondern von sauberem Renderer-Switching und einem besseren Shell-/Panel-Produkt.

### 4.2 Marker sind moderner, aber nicht magisch

Zentrale Datei:

- `src/components/DeckGLMap.ts`

Fakten:

- WebGL-Pfad nutzt `IconLayer`, `ScatterplotLayer`, `TextLayer`, `PathLayer`, `GeoJsonLayer`, `HeatmapLayer`, `ArcLayer`.
- Marker-Icons werden teils als SVG-Data-URLs definiert, aber als WebGL-Texturen gerendert.
- D3-Fallback arbeitet weiterhin mit SVG-/DOM-/HTML-Overlays.

Bewertung:

- Die Marker-Qualitaet entsteht aus Renderer + Semantik + Zoom-/Selection-Regeln.
- Nicht aus einem simplen Wechsel "SVG raus".

### 4.3 Das staerkste Muster ist das Panel-System

Zentrale Dateien:

- `src/components/Panel.ts`
- `src/app/panel-layout.ts`
- `src/config/panels.ts`
- `src/styles/panels.css`

Fakten:

- `Panel.ts` liefert die primitive fuer Header, Count, Status-Badge, New-Badge, Resize-Handle, Persistenz, Fehler- und Retry-Zustaende.
- `panel-layout.ts` trennt Header, Map-Section und Panels-Grid sichtbar.
- `panels.ts` definiert pro Variante (`full`, `tech`, `finance`) Panel-Sets und Default-Layer.
- `panels.css` entkoppelt Panel-Styles von inline-CSS und stabilisiert damit Performance und Wartbarkeit.

Bewertung:

- Genau hier liegt aktuell unser groesster sichtbarer Rueckstand.
- TradeView Fusion hat Geo-Vertraege und Flat-Handoffs, aber kein equally-stronges Geo-Panel- und Shell-System.

### 4.4 Die App-Orchestrierung ist in Module zerlegt

Zentrale Dateien:

- `src/App.ts`
- `src/app/panel-layout.ts`
- `src/app/data-loader.ts`
- `src/app/event-handlers.ts`
- `src/app/search-manager.ts`
- `src/app/country-intel.ts`

Fakten:

- `App.ts` ist zwar gross, delegiert aber an mehrere spezialisierte Manager.
- Layout, Data Loading, Event Wiring, Search und Country Detail sind klarer separiert.
- Diese Struktur ist naeher an einem Dashboard-Produkt als an einer Feature-Shell mit stetig wachsender Inline-Verkettung.

Bewertung:

- Unser aktueller Geo-Shell-Pfad ist funktional, aber strukturell zu stark in [`GeopoliticalMapShell.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\GeopoliticalMapShell.tsx) konzentriert.

---

## 5. Quellen und Datenlage

### 5.1 Sichtbare Source-Breite bei `worldmonitor`

Belastbare Referenzen:

- `.env.example`
- `src/config/feeds.ts`
- `src/app/data-loader.ts`

Quellencluster:

- RSS/Google-News-Proxies fuer Nachrichtenbreite
- ACLED
- UCDP und UCDP Event-Level
- UNHCR
- WorldPop
- OpenSky
- AISStream
- Cloudflare Radar / NetBlocks-artige Outage-Signale
- FRED
- EIA
- Finnhub
- NASA FIRMS
- Polymarket

### 5.2 Ueberlappung mit unserem Bestand

Die Ueberlappung ist real und relevant:

- `ACLED`
- `UCDP`
- `UNHCR`
- `WorldPop`
- `OpenSky`
- `FRED`
- `Finnhub`
- `NASA FIRMS`

### 5.3 Wichtiger Unterschied zu uns

`worldmonitor` ist feed- und proxy-lastiger.  
TradeView Fusion ist governance-, contract- und gateway-orientierter.

Das bedeutet:

- Wir koennen deren Source-Breite als Vergleichsfolie nutzen.
- Wir sollten deren Proxy-/RSS-/Google-News-Heavy-Ansatz aber nicht blind spiegeln.
- Fuer uns ist wichtiger: Wo fehlen uns sinnvolle Geo-Quellen, wo fehlt nur UI-Exposition bereits vorhandener Quellen?

---

## 6. Was fuer TradeView Fusion direkt uebertragbar ist

## 6.1 A - Sofort uebertragbar

### Dual-Engine-Grenze explizit machen

`worldmonitor` zeigt eine klare Regel:

- Heavy/desktop -> `deck.gl + MapLibre`
- fallback/mobile -> D3/SVG

TradeView-Fit:

- Globe-Core weiter `d3-geo`
- Flat-Mode offensiv auf `deck.gl + MapLibre`
- keine weitere Unschärfe, welcher Renderer wofuer zustaendig ist

### Panel-Basisprimitive einfuehren

Wir brauchen fuer GeoMap eine eigene, harte Panel-Basis mit:

- Header / Title / Count / Status / New-Badge
- Resize / Persistenz
- Fehler / Retry / Loading
- klare Slots fuer Listen, Inspector, Signals, Timeline, Details

### Shell aufspalten

`worldmonitor` beweist, dass das Produktgefuehl nicht aus einem "besseren Map-File" kommt, sondern aus klar getrennten App-Schichten.

TradeView-Fit:

- Geo AppShell
- Map viewport shell
- right rail / inspector shell
- filter / timeline / overlay chrome
- data loading / search / selection orchestration

### Source-/Status-Disziplin

Das Status-/Freshness-Denken in `data-loader.ts` ist uebertragbar:

- LayerReady
- Feed/API Status
- degradierte Modi sichtbar machen

Das ist fuer unsere GeoMap wichtig, weil Live-Verifier und Source-Health aktuell noch nicht konsequent produktisiert sind.

## 6.2 B - Gezielte Folgearbeit

### Marker-System fuer Flat

TradeView-Fit:

- `deck.gl`-basiertes Icon-/Scatter-/Text-System fuer Flat
- striktere Zoom-Semantik
- bessere Cluster-/Detail-Hierarchie

Nicht 1:1 uebernehmen:

- konkrete SVG-Iconformen
- konkrete Layer-Farbcodes

### Virtualized / operational lists

`VirtualList.ts` und die Panel-Kopplung sind wertvoll fuer:

- Active list
- right rail item lists
- News-/context-heavy Seitenschichten

### Country detail / popup orchestration

`country-intel.ts` und `MapPopup.ts` sind kein direkter Blueprint, aber hilfreich fuer:

- klare Map->detail entrypoints
- operativen rechten Detailbereich

## 6.3 C - Nicht blind uebernehmen

- Vercel-/Tauri-spezifische Runtime- und Proxy-Annahmen
- RSS-/Google-News-Fallbacks als primäre Wahrheit
- D3-Fallback-Implementierungsdetails aus `Map.ts`
- monolithische Feed-Breiten ohne Governance-Filter

---

## 7. Ehrliche Bewertung gegen unseren aktuellen Stand

### 7.1 Wo `worldmonitor` heute staerker ist

- Panel-/Shell-Komposition
- rechte Rail / Dashboard-Rhythmus
- sichtbare Produktreife
- Map + Detail + Feed + Status wirken wie ein einziges System
- Flat-/desktop Rendering ist operativ weiter auspoliert

### 7.2 Wo wir staerker werden koennen als `worldmonitor`

- Globe/Flat-Contract-Klarheit
- Story-/Replay-/Handoff-Modell
- Governance, Policy und Gateway-getriebene Runtime
- spaeterer Analystenmodus mit saubererem Domain-Contract

### 7.3 Harte Wahrheit

Unser aktuelles Problem ist nicht primaer:

- fehlende dritte Engine
- fehlende exotische Markerform

Unser Hauptproblem ist:

- **GeoMap-Shell und Panel-Architektur sind zu chaotisch**

Der Renderer ist wichtig, aber nicht der groesste Hebel.

---

## 8. Konkrete Empfehlung fuer die naechsten Schritte

### 8.1 Richtige Renderer-Entscheidung

Empfehlung:

- Globe-Core bleibt `d3-geo`
- Flat-Mode wird `deck.gl + MapLibre`
- `CesiumJS` bleibt ein spaeterer Evaluations-Track fuer echte Scene-/Terrain-/3D-Tiles-Bedarfe

Nicht empfohlen:

- D3 pauschal rauswerfen
- Cesium jetzt als neuen Default-Core einfuehren

### 8.2 Sofortiger Produkt-Hebel

Prioritaet 1:

- Geo Shell / Panel System refactoren

Prioritaet 2:

- Flat-Mode visuell und strukturell hochziehen

Prioritaet 3:

- Marker-/Layer-Semantik im Flat-Mode modernisieren

Prioritaet 4:

- Source-/Status-/Verifier-Pfade sichtbar machen

### 8.3 TradeView-Fusion-spezifische Architektur-Folgerung

`docs/geo` sind aktuell wertvolle Arbeitsdokumente, aber keine echte normative Spec-Schicht.

Empfehlung:

- operative Referenzreviews und Arbeitsnotizen weiter unter `docs/geo`
- normative Geo-Specs und Regeln klar unter `docs/specs/geo`
- Execution-Slices nur mit klaren, kleinen Checkpoints fuettern statt losem Sammel-Backlog

---

## 9. Vorgeschlagene Execution-Slice-Ergaenzungen

Diese Punkte sollten nach Review in den Geo-Execution-Slice uebernommen werden:

- `WM.1` Referenzreview + lokaler Clone + kuratierter Extrakt abgeschlossen
- `WM.2` Dual-Engine-Entscheidung explizit gespiegelt: Globe `d3-geo`, Flat `deck.gl/MapLibre`
- `WM.3` Geo Panel Base Primitive definieren
- `WM.4` Geo Shell in AppShell / Viewport / RightRail / Timeline / FilterChrome zerlegen
- `WM.5` Flat-Marker-System als eigener Workblock definieren
- `WM.6` Source-/Status-/Live-Verify sichtbar an Panels und Layer-Runtime koppeln
- `WM.7` Source-Overlap-Matrix gegen unsere `docs/references` und Geo-Sources prufen

---

## 10. Extrakt-Referenz

Siehe:

- `D:\tradingview-clones\tradeview-fusion\_tmp_ref_review\extraction_candidates\worldmonitor\extraction_manifest.txt`

Der Extrakt deckt gezielt ab:

- Dual-Engine-Map
- Panel-/Shell-System
- Data-Loading / Source-Freshness
- Search / Country detail / large-list support

---

## 11. Schlussurteil

`worldmonitor` ist fuer uns kein Renderer-Vorbild, sondern ein **Surface-Vorbild**.

Die wichtigste Lehre lautet:

- nicht "D3 vs MapLibre"
- sondern "klare Engine-Grenzen + starke Shell + starke Panel-Primitives"

Wenn wir nur Marker oder Flat-Layer nachbauen, aber die Geo-Shell nicht ordnen, bleibt das Ergebnis inkonsistent.

Wenn wir dagegen die Shell ordnen und den Flat-Mode sauber auf `deck.gl + MapLibre` hochziehen, koennen wir `worldmonitor` in der naechsten Ausbaustufe produktseitig ueberholen, ohne unseren Globe- und Contract-Vorteil wegzuwerfen.
