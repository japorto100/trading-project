# Pharos AI Reference Review

> **Stand:** 10. Maerz 2026
> **Zweck:** Referenzreview des Open-Source-Projekts `pharos-ai` fuer GeoMap-/Conflict-Layer-Entscheidungen.
> **Quelle:** https://github.com/Juliusolsson05/pharos-ai
> **Scope:** UI-/Layer-/View-Architektur, nicht direkter Codeimport.

---

## 1. Warum dieses Dokument existiert

`pharos-ai` ist ein starkes Referenzprojekt fuer einen operativen Conflict-Map-Workspace.
Es ist fuer TradeView Fusion relevant, weil es drei Dinge frueh zeigt:

- ein klar analyst-zentriertes Flat-Map-UI
- eine brauchbare Layer-Taxonomie fuer Konfliktkarten
- einen oeffentlichen Hinweis, dass der **Agent Layer around 2026-03-12** separat veroeffentlicht werden soll

Wichtig:

- Dieses Review ist **kein** Architekturwechsel-Befehl.
- Es ist **kein** Freifahrtschein fuer direkten Codeimport.
- Es ist ein Entscheidungsdokument fuer unsere eigene GeoMap-Roadmap.

---

## 2. Repository- und Lizenzlage

### 2.1 Review-Basis

- Lokal geklonter Stand: `2026-03-09`
- Review-Pfad: `D:/tradingview-clones/_tmp_ref_review/pharos-ai`

### 2.2 Lizenz

`pharos-ai` ist laut `package.json` unter **AGPL-3.0-only** veroeffentlicht.

Konsequenz fuer uns:

- **Design-, UX- und Architekturideen:** ja
- **Feature-/Layer-Analyse als Referenz:** ja
- **Direkter Copy/Paste von Code:** nur mit bewusster Lizenzentscheidung und anschliessender starker Anpassung
- **Direkter Paket-/Modul-Import aus dem Projekt:** nein

Arbeitsregel fuer TradeView Fusion:

- wir uebernehmen **keine pharos-eigenen Packages oder app-internen Module**
- wir duerfen visuelle und architektonische Muster als Referenz verwenden
- jede konkrete Umsetzung bleibt in unserem eigenen Stack und unseren eigenen Verträgen

---

## 3. Was Pharos aktuell offenlegt

Laut `README.md` umfasst der aktuell offene Scope die **Application Layer**:

- Dashboard
- Conflict Map
- UI-/App-Code

Ebenfalls wichtig:

- der **interne Agent Layer** ist noch nicht enthalten
- das README nennt als Ziel fuer die Oeffnung des Agent Layers **around March 12th, 2026**

### Monitoring-Relevanz fuer uns

Dieses Datum ist fuer TradeView Fusion wichtig, weil dort sehr wahrscheinlich spaetere
Quellenintegration, Verifikation, Agentic Collection und Data-Prep sichtbar werden.

Wir behandeln deshalb:

- **2026-03-12** als Monitoring-Datum
- `pharos-ai` als **stueckweise publizierte Referenz**
- den Agent-Layer als moeglich wichtigen spaeteren Vergleichspunkt fuer:
  - conflict ingestion
  - source verification
  - X/Twitter-Ersatzpfade
  - agentic collection / scraping orchestration

---

## 4. Technische Kurzbewertung

### 4.1 Stack

`pharos-ai` setzt fuer die Conflict-Map auf:

- `DeckGL`
- `MapLibre`
- Flat basemap / dark or satellite styles
- typed layer arrays fuer map data

### 4.2 Hauptstaerken

- klare Flat-Map-Interaktion
- konfliktnahe Layer-Struktur
- analyst-zentrierte Filter-, Story- und Timeline-Idee
- saubere Trennung zwischen kompakter Dashboard-Karte und voller Arbeitskarte
- sehr gute Eignung fuer dichte regionale Konfliktansichten

### 4.3 Hauptschwaechen fuer unseren Kontext

- klar **flat-first**, kein Globe-Core
- konfliktspezifische Layerform, weniger generische geopolitische Plattformbasis
- eng auf aktuellen Use Case zugeschnitten
- fuer unsere globale Makro-/Geo-/Chokepoint-Strategie als alleinige Kartengrundlage zu eng

---

## 5. Karten- und Layer-Architektur

### 5.1 Flat-View als Arbeitsmodus

Die Kernkarte in `pharos-ai` ist eine operative Flat-Map. Das ist sehr sinnvoll fuer:

- regionale Konfliktlagen
- Asset-/Target-Lagen
- Missile-/Strike-Arcs
- Threat-Zones
- Heatmaps
- Analysten-Zoom und Story-Navigation

### 5.2 Explizite Layer-Typen

Die sichtbare Layer-Taxonomie ist klar und direkt operationalisierbar:

- `strikes`
- `missiles`
- `targets`
- `assets`
- `zones`
- `heat`

Dazu kommen:

- Labels
- Tooltip-Model
- Story-/Timeline-Kopplung
- Visibility-Toggles

### 5.3 Datenroute

Die Konflikt-Map bekommt typisierte Arrays aus einer einzigen Datenroute.
Das ist architektonisch sauber:

- Map-Features im Backend gruppieren
- im Frontend als typed layer payload anliefern
- Renderer bleibt layer-driven statt datenquellengetrieben

Das ist ein gutes Muster fuer unseren spaeteren Flat/Conflict-Mode.

### 5.4 Replay- und Timeline-Modell

`pharos-ai` hat nicht nur eine einfache Event-Liste, sondern einen echten Replay-/Zeitfenster-Mechanismus.

Konkret sichtbar im Review-Stand:

- Histogramm-/Bucket-basierte Timeline fuer konfliktnahe Datensaetze
- Zeitfenster-Selektion (`timeRange`) statt nur eines einzelnen aktiven Datums
- Zoom-Presets fuer Zeitraeume (`24H`, `3D`, `7D`, `2W`, `1M`, `ALL`)
- Drag-/Brush-aehnliche Interaktion fuer den sichtbaren Zeitraum
- enge Kopplung zwischen Timeline und Layer-Sichtbarkeit

Das ist fuer uns relevant, weil ein spaeterer Conflict-Layer kein statisches Kartenbild bleiben darf.
Er braucht einen reproduzierbaren Arbeitsmodus fuer:

- Eskalationssequenzen
- Schlag-/Gegenschlag-Folgen
- Chokepoint-Stoerungen ueber Zeit
- Story- und Debriefing-Ansichten

### 5.5 Story-Modell und kameragesteuerte Narration

`pharos-ai` benutzt ein eigenes Story-Modell, das mehr macht als "zeige Text neben der Karte".

Das Muster ist:

- Story selektiert hervorgehobene Map-Objekte
- Story setzt oder interpoliert den Karten-Fokus (`viewState`)
- Story schiebt das Zeitfenster auf den relevanten Abschnitt
- Story aktiviert damit eine analystentaugliche Sequenz aus Karte + Zeit + Details

Das ist fuer TradeView Fusion unmittelbar relevant. Unser GeoMap-Workspace hat bereits Timeline,
Kontext, Game-Theory und Event-Inspector, aber noch keinen sauberen story-driven camera/timeline contract.

### 5.6 Filter-Engine statt lose Einzel-Filter

Ein wichtiger Staerkepunkt von `pharos-ai` ist die zentrale Filter-Engine.

Beobachtetes Muster:

- ein gemeinsamer, typisierter Datensatz fuer mehrere Layer
- initiale Filter-State-Ableitung aus den vorhandenen Daten
- facettierte Drilldowns pro Dataset/Actor/Status/Priority/Zeit
- separater Ableitungsschritt fuer sichtbare Datenarrays und Facets

Das ist staerker als ein UI mit nur losem `search + severity + source`-State.

Fachliche Ableitung fuer uns:

- GeoMap braucht mittelfristig eine explizite `MapFilterEngine`
- Conflict-, Macro-, Context- und Soft-Signal-Layer sollten auf demselben Filtervertrag arbeiten
- Globe und Flat duerfen keine divergierenden Filtermodelle bekommen

### 5.7 Overlay-Chrome getrennt von Daten-Layern

`pharos-ai` trennt sichtbar zwischen:

- UI-Chrome-Sichtbarkeit (`timeline`, `filters`, `legend`)
- Daten-/Layer-Sichtbarkeit (`strikes`, `missiles`, `targets`, `assets`, `zones`, `heat`)

Das ist ein kleiner, aber wichtiger Produktpunkt.
Ohne diese Trennung wachsen Analysten-Workspaces schnell chaotisch, weil "ich will die Timeline ausblenden"
nicht dasselbe ist wie "ich will keine Missile-Layer sehen".

Fuer TradeView Fusion ist das ein klarer Verbesserungspunkt fuer die bestehende GeoMap-Shell.

### 5.8 Selektions- und Detail-Contract

`pharos-ai` nutzt einen einfachen, aber starken Selektionsvertrag fuer Detailansichten:

- ein aktives selektiertes Item
- getaggter Typ (`strike`, `missile`, `target`, `asset`, `zone`)
- darauf aufbauend ein konsistenter Detail-/Sidebar-Pfad

Das ist fuer uns wichtig, weil unser GeoMap-Workspace zwar Event/Drawing-Selektion hat,
aber noch keinen generalisierten selection contract fuer einen spaeteren Flat/Conflict-Layer.

### 5.9 Responsive Analysten-Layouts

`pharos-ai` hat erkennbar unterschiedliche Layout-Strategien fuer:

- Dashboard-Karte
- volle Analystenkarte
- Mobile-/Landscape-Varianten

Das ist nicht nur Styling, sondern ein echtes Produktmuster.
Ein spaeterer Conflict-Layer wird auf kleinen Viewports andere Prioritaeten haben als auf einem breiten Analysten-Workspace.

---

## 6. Was fuer TradeView Fusion unmittelbar relevant ist

### 6.1 Was wir uebernehmen sollten

- die Idee eines **Flat/Regional Analyst View** fuer operative Konfliktlagen
- eine **layer-driven payload** fuer Conflict-Rendering
- klare Sichtbarkeits-Toggles pro Layer
- Story-/Timeline-Kopplung an die Karte
- Replay-/Zeitfenster-Mechanik statt nur statischer Timeline-Liste
- Story-driven camera + time-window activation
- zentrale Filter-Engine statt verteilte Einzel-Filter
- Trennung von Overlay-Chrome-Sichtbarkeit und Daten-Layer-Sichtbarkeit
- generalisierten Selection-/Detail-Contract fuer Conflict-Objekte
- Trennung zwischen:
  - kompakter Dashboard-Karte
  - voller Analysten-/Workspace-Karte

### 6.2 Was wir nicht uebernehmen sollten

- einen kompletten Wechsel weg vom Globe-Core
- direkte Uebernahme ihrer app-internen Packages
- ungeprueften Copy/Paste von AGPL-Code in unseren Core

### 6.3 Was wir stattdessen tun sollten

TradeView Fusion sollte auf **Dual-View** setzen:

- **Globe = strategische Primäransicht**
- **Flat/Regional = operativer Conflict-/Analystenmodus**

Das passt besser zu unserer bestehenden Architektur und unserem Zielsystem.

### 6.4 Was wir schon haben vs. was uns noch fehlt

Bereits vorhanden im aktuellen GeoMap-Istzustand:

- Globe-Core mit `d3-geo`
- Earth/Moon-Umschaltung
- Choropleth-Layer (`severity`, `regime`, `macro`)
- Events, Regionen, News, Context, Game-Theory und Drawings im Workspace-Store
- Candidate-/Inspector-/Sidebar-Shell
- grundlegende Timeline im Workspace

Teilweise vorhanden, aber noch nicht reif genug:

- Filter-/Toolbar-Logik
- Selection fuer Events und Drawings
- responsive Shell-Struktur
- Timeline als Informationspfad, aber nicht als echter Replay-Controller

Klar fehlend im Sinne eines `pharos-ai`-aehnlichen Conflict-Modus:

- story-driven camera activation
- aktives Zeitfenster-/Replay-Modell
- dataset-zentrierte Filter-Engine mit Facets
- getrennte Overlay-Chrome-Sichtbarkeit
- view-agnostischer Selection-/Detail-Contract fuer Conflict-Objekte
- dedizierter Flat/Regional Analyst View

---

## 7. Bewertung fuer unsere GeoMap

### 7.1 Klare Schlussfolgerung

`pharos-ai` ist **kein Ersatz** fuer unsere GeoMap-Strategie.
Es ist aber eine sehr starke **Bestaetigung**, dass ein zusaetzlicher Flat-Conflict-Mode fachlich und UX-seitig sinnvoll ist.

### 7.2 Best-Practice-Ableitung

Fuer TradeView Fusion ist die beste Architektur:

- `d3-geo` Globe als Core View behalten
- Flat/Regional Analyst View als zweiten Modus ergaenzen
- Conflict-Layer bevorzugt im Flat-Mode ausbauen
- globale Makro-/Regime-/Transmission-/Chokepoint-Sichten im Globe-Modus lassen

### 7.3 Warum nicht nur Globe

Ein reiner Globe ist fuer diese Dinge schlechter:

- lokale Konfliktdichte
- regionale Threat-Zones
- Asset-/Target-Präzision
- Story-Arbeit auf enger Geometrie
- taktischer Analysten-Workflow

### 7.4 Warum nicht nur Flat

Ein reiner Flat-Mode waere fuer diese Dinge schlechter:

- globale Zusammenhaenge
- Chokepoints und Transmissionslogik
- strategische Makro-Layer
- visuelle Eigenstaendigkeit des Produkts

---

## 8. SOTA-Einordnung fuer 2026

### Strategischer Geo-Workspace

SOTA ist fuer einen geopolitischen Voll-Workspace nicht mehr:

- nur Globe
- nur Flat

Sondern:

- **multiple views with shared domain contracts**

Das heisst fuer uns:

- gleiche Event-/Layer-/Story-/Filter-Vertraege
- unterschiedliche Renderer je nach Arbeitsmodus
- keine divergierenden Fachmodelle pro View
- Replay-/Story-/Selection-Vertraege muessen view-agnostisch bleiben

### Conflict-Layer

SOTA fuer dichte Conflict-Layer ist:

- GPU-/tile-faehiger Flat-Mode
- story- und timeline-gekoppelte Overlays
- hohe Sichtbarkeit von:
  - arcs
  - zones
  - heat
  - targets
  - assets

Das spricht fuer:

- spaeteren `deck.gl`-Einsatz
- spaeteren optionalen `MapLibre`-Second-Mode
- `PMTiles` nur dort, wo Hintergrundkarte/Tile-Layer wirklich gebraucht werden
- eine analystische Replay-/Story-Oberflaeche, nicht nur weitere Marker-Layer

---

## 9. Monitoring-Notiz: 2026-03-12 Agent Layer

### Warum wir das beobachten muessen

Das oeffentliche README deutet an, dass der Agent Layer um den **12. Maerz 2026**
veroeffentlicht werden soll.

Das kann fuer uns spaeter relevant werden in Bezug auf:

- Data-fetch orchestration
- OSINT collection
- X/Twitter-Ersatzstrategien
- source verification workflows
- agentic browsing/scraping
- conflict summarization and prep

### Arbeitsregel

Das Monitoring ist **explizit** in GeoMap-/Execution-Dokumenten zu fuehren.
Wenn dort neue Open-Source-Slices erscheinen, werden sie geprueft gegen:

- unseren Frontend->Go-only Boundary
- unsere Quellen-/Policy-Regeln
- unsere Provider- und Verify-Anforderungen
- unsere Lizenz- und Security-Vorgaben

---

## 10. Entscheidung fuer jetzt

### Kurzentscheidung

- `pharos-ai` wird als **Reference Review** behalten
- kein direkter Codeimport
- kein direkter Package- oder Architekturwechsel
- aber: klare Aufnahme als Argument fuer einen spaeteren Flat/Regional Conflict View

### Praktische Folge fuer GeoMap

- GeoMap-Closeout bleibt zuerst auf unserem bestehenden Globe-Stack
- danach kann der Conflict-Layer als eigener Flat/Regional-Slice geplant werden
- `deck.gl`, `MapLibre` und `PMTiles` bleiben gate-gesteuert, aber mit deutlich staerkerer realer Begruendung

---

## 11. Querverweise

- [`GEOMAP_FOUNDATION.md`](./GEOMAP_FOUNDATION.md)
- [`GEOMAP_MODULE_CATALOG.md`](./GEOMAP_MODULE_CATALOG.md)
- [`GEOMAP_ROADMAP_AND_MILESTONES.md`](./GEOMAP_ROADMAP_AND_MILESTONES.md)
- [`../specs/execution/geomap_closeout.md`](../specs/execution/geomap_closeout.md)
- [`../specs/EXECUTION_PLAN.md`](../specs/EXECUTION_PLAN.md)
