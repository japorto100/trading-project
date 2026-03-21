# GeoMap Checkpoint — 20.03.2026

> Arbeitsdokument unter `docs/geo`, kein normatives Spec-Dokument.  
> Zweck: aktueller GeoMap-Stand, Vergleich gegen `worldmonitor`, klares Sollbild fuer Panel-/Shell-Architektur und naechste Prioritaeten.

---

## 1. Kurzfazit

Die GeoMap ist strukturell deutlich besser als noch vor kurzem:

- Geo-Subsysteme sind sauberer getrennt
- Marker-/Timeline-/Drawing-/Flat-Pfade sind belastbarer
- Panel-Status-Chrome und Dock-/Persistenzpfad sind jetzt real vorhanden
- `lint` und `typecheck` sind gruen

Aber:

- die eigentliche **Panel-Komposition** ist noch nicht auf `worldmonitor`-Niveau
- wir haben jetzt eine bessere Basis, aber noch nicht die endgueltige analyst-grade Surface
- der groesste verbleibende UX-Hebel liegt weiter in **Panel-Hierarchie, Docking, Persistenz, Timeline-Kopplung und funktionaler Haertung**

---

## 2. Was bis jetzt wirklich geschafft wurde

### 2.1 Feature-Struktur

Unter [`src/features/geopolitical`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical) gibt es jetzt echte Subsysteme statt immer mehr Root-Dateien:

- `operations/`
- `flat-view/`
- `contradictions/`
- `drawing/`
- `timeline/`
- `markers/`
- `shell/`
- `rendering/`

Das alte `phase12`-Naming ist aus dem aktiven Produktpfad entfernt.

### 2.2 Shell / Workspace

[`GeopoliticalMapShell.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\GeopoliticalMapShell.tsx) ist entlastet worden durch:

- [`useGeopoliticalShellController.ts`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\hooks\useGeopoliticalShellController.ts)
- [`useGeopoliticalShellOrchestration.ts`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\hooks\useGeopoliticalShellOrchestration.ts)
- [`GeoWorkspaceStage.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\layout\GeoWorkspaceStage.tsx)

### 2.3 Panel- und Status-Chrome

Gemeinsame Panel-Bausteine:

- [`GeoPanelFrame.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\panels\GeoPanelFrame.tsx)
- [`GeoPanelStatusBadge.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\panels\GeoPanelStatusBadge.tsx)
- [`GeoPanelStateNotice.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\panels\GeoPanelStateNotice.tsx)
- [`GeoPanelRuntimeMeta.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\panels\GeoPanelRuntimeMeta.tsx)

Damit haben wir jetzt sichtbar:

- `live/cached/degraded/unavailable`
- Retry-/Reload-Flows
- Runtime-Meta wie `snapshot`, `feed`, `health`

### 2.4 Dock / Persistenz

Expliziter Layout-Contract:

- [`geo-workspace-layout-contract.ts`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\layout\geo-workspace-layout-contract.ts)

Persistenzpfad:

- [`useGeopoliticalShellPersistence.ts`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\hooks\useGeopoliticalShellPersistence.ts)

Persistiert werden aktuell:

- linke/rechte Panelbreite
- collapse state
- `Candidate Queue`
- `Filters Toolbar`
- `Body Legend`
- `Timeline`
- `Inspector/Timeline` Workspace-Tab

### 2.5 Marker-System

Die Markerlogik ist nicht mehr lose verteilt:

- [`marker-view-model.ts`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\markers\marker-view-model.ts)
- [`marker-priority.ts`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\markers\marker-priority.ts)
- [`MapCanvasMarkerLayer.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\rendering\MapCanvasMarkerLayer.tsx)
- [`FlatViewOverlay.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\flat-view\FlatViewOverlay.tsx)

Aktueller Zustand:

- gemeinsame Prioritaetslogik fuer Globe und Flat
- Halos / selektive Labels / Badge-Kuerzel
- Cluster mit Severity-Hinweisen statt nur Count-Bubbles
- aktiver Flat-Timeline-Bucket beeinflusst Marker sichtbar

### 2.6 Timeline / Flat-Bridge

Timeline ist als eigener Bereich gebuendelt:

- [`timeline/TimelineStrip.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\timeline\TimelineStrip.tsx)
- [`timeline/MapTimelinePanel.tsx`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\timeline\MapTimelinePanel.tsx)

Flat-/Timeline-Schnittstelle:

- aktiver Zeitbucket wird ueber den Renderer-Contract in den Flat-Marker-Payload gespiegelt
- Eventliste und Viewport kommunizieren den aktuellen Temporal-Fokus sichtbar

### 2.7 Funktionale Haertung

Mehrere Geo-Mutationen behandeln Laufzeitfehler jetzt sauber:

- hard ingest
- soft ingest
- candidate actions
- source add
- asset add

Siehe:

- [`useGeopoliticalMarkerMutations.ts`](D:\tradingview-clones\tradeview-fusion\src\features\geopolitical\shell\hooks\useGeopoliticalMarkerMutations.ts)

---

## 3. `worldmonitor` richtig eingeordnet

Siehe auch:

- [`WORLDMONITOR_AI_REVIEW.md`](D:\tradingview-clones\tradeview-fusion\docs\geo\WORLDMONITOR_AI_REVIEW.md)

Die wichtigste Einordnung:

`worldmonitor` ist fuer uns **kein Gesamtprodukt-Blueprint**, sondern ein **Shell-/Panel-Blueprint**.

### 3.1 Worin `worldmonitor` wirklich stark ist

- wenige dominante Panels
- starke rechte Arbeitsflaeche
- klares Dock-/Panel-Gefuehl
- gute Status-/Count-/Header-Komposition
- konsistente Produktdramaturgie: Map + Feed + Context + Ops wirken wie ein System

### 3.2 Worin `worldmonitor` nicht unser Endzustand ist

`worldmonitor` bleibt vom Scope her naeher an:

- OSINT / geopolitischer Monitor
- stark feed- und panel-zentrierte Geo-Surface

TradeView Fusion geht weiter:

- Geo
- Macro / Rates / Sanctions / State overlays
- Trading-/Asset-Exposure
- spaeter breitere Intelligence- und Trading-Kopplung

### 3.3 Richtige Folgerung

Wir sollten `worldmonitor` uebernehmen als:

- Shell-Disziplin
- Panel-Hierarchie
- Dock-/Persistenz-Vorbild
- Status-/Source-Chrome-Vorbild

Aber **nicht** als:

- vollstaendiges Funktionsmodell
- endgueltige Top-Level-Domaenstruktur des Gesamtprodukts

### 3.4 Cross-Clone Leitplanken

Der Checkpoint sollte nicht nur `worldmonitor` spiegeln. Fuer die GeoMap sind mehrere Referenzen gleichzeitig wichtig, aber mit klar getrennten Rollen:

- `worldmonitor`
  - Shell-/Panel-Blueprint
  - Right-Rail-Hierarchie
  - Dock-/Persistenz-Disziplin
  - Status-/Count-/Header-Chrome
  - primaer fuer: `Beide`, mit besonders starkem Hebel auf `Flat`-Workspace und Panel-Komposition
- `worldwideview`
  - Search-/Filter-/Timeline-Kopplung
  - DataBus-/Polling-/Availability-/History-Denken
  - Runtime- und Workflow-Referenz, nicht primaer UI-Blueprint
  - primaer fuer: `Beide`, mit Schwerpunkt auf Search/Timeline/Data-Orchestration statt Renderer-Look
- `Crucix`
  - `Macro + Markets` als first-class Geo-Panel
  - `Sweep Delta` / `was hat sich geaendert?`
  - Cross-source signal condensation
  - analystische Panel-Dichte statt blosser Feed-Liste
  - primaer fuer: `Beide`, besonders fuer Right-Rail, Macro-/Market-Kopplung und Delta-Panels
- `GeoSentinel`
  - operator-nahe Search-/Filter-/List-Sync-Muster
  - entity-first search
  - active list <-> map sync
  - zoom-adaptive marker policy
  - primaer fuer: `Beide`, mit staerkerem direktem Nutzen fuer Marker-/Selection-/Search-UX
- `Shadowbroker` und `Sovereign_Watch`
  - runtime resilience
  - history / replay / availability
  - freshness / degraded / health
  - poller failover / source arbitration
  - primaer fuer: `Beide`, aber eher als Backend-/Runtime-Unterbau als visuelles Vorbild
- `conflict-globe.gl`
  - spaetere relationale Overlays
  - arcs / paths / rings / hexbin
  - optionale Analysten-Visualisierung, nicht Kernshell
  - primaer fuer: `Globe`, spaeter optional auch `Flat` als relationale Overlay-Surface

Die korrekte Folgerung ist deshalb:

- `worldmonitor` bleibt Leitbild fuer Panel- und Shell-Ordnung
- andere Clones liefern gezielte Bausteine fuer Search, Delta, Runtime-Haerte, relationale Overlays und operatorische Marker-UX
- der Checkpoint sollte diese Referenzen als Rollenmodell festhalten, nicht als gleichwertige Blueprint-Sammlung

### 3.5 Was bewusst **nicht** in den Hauptcheckpoint gehoert

Nicht hilfreich im Hauptcheckpoint:

- lange Dateilisten aus allen Clone-Reviews
- source-spezifische Adapterdetails
- tiefe Infra-/Cesium-Diskussionen
- Branding-/Theme-Fragen einzelner Referenzen

Diese Details gehoeren weiter in die jeweiligen Einzelreviews unter `docs/geo`, nicht in die zentrale Arbeitszusammenfassung.

### 3.6 `MD -> Experiment` Mapping

Der isolierte Experiment-Bereich unter [`/geomap/experiment`](D:/tradingview-clones/tradeview-fusion/src/app/(shell)/geomap/experiment/page.tsx) ist jetzt der Ort, an dem die entscheidungsrelevanten Clone-Erkenntnisse in Code sichtbar gemacht werden.

Primaere Dateien:

- [`GeoMapExperimentLab.tsx`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/GeoMapExperimentLab.tsx)
- [`GeoMapExperimentWorkspace.tsx`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/components/GeoMapExperimentWorkspace.tsx)
- [`GeoMapExperimentCoverageBoard.tsx`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/components/GeoMapExperimentCoverageBoard.tsx)
- [`REFERENCE_COVERAGE.md`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/REFERENCE_COVERAGE.md)
- [`geo-backend-options.ts`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/backend/geo-backend-options.ts)
- [`GeoMapExperimentBackendBoard.tsx`](D:/tradingview-clones/tradeview-fusion/src/features/geopolitical/geomap/experiment/backend/components/GeoMapExperimentBackendBoard.tsx)

Aktueller Mapping-Stand:

- `worldmonitor`
  - im Experiment materialisiert als Shell-/Panel-Rhythmus, Right-Rail-Hierarchie, Panel-Frame und Dock-Struktur
- `worldwideview`
  - im Experiment materialisiert als Search-/Workflow-Bar, Timeline-Workspace, Replay-/Availability- und Processing-Lane
- `Crucix`
  - im Experiment materialisiert als `Macro + Markets`, `Sweep Delta`, `Cross-Source Signals` und `Delta + transmission engine`
- `GeoSentinel`
  - im Experiment materialisiert als operatorische Search-/List-/Quick-Action-Module
- `Shadowbroker` / `Sovereign_Watch`
  - im Experiment materialisiert als Runtime-Trust, Freshness-, Replay-, Situation- und Feed-Config-Lanes
- `conflict-globe.gl`
  - im Experiment materialisiert als Relation-Overlay- und Collaboration-/Annotation-Lanes

Wichtige Grenze:

- im Experiment muessen alle **entscheidungsrelevanten** Referenzideen sichtbar sein
- nicht jede Clone-Idee muss dort als echte Produktionsfunktion implementiert werden
- backendnahe Adapter-, Polling-, Replay- und Infra-Details bleiben weiterhin ausserhalb des Experiment-Scopes

Ergaenzung:

- fuer Replay, Polling und Graph-Runtime liegen jetzt auch explizite Backend-Optionen im Experiment vor, angepasst an unseren Stack `Go -> Python -> Rust`
- diese Optionen sind bewusst Architektur- und Runtime-Surfaces, keine produktiven Implementierungen

Die Regel fuer Folgearbeit ist damit:

1. wichtige Clone-Idee zuerst im Experiment materialisieren
2. dort gegen die anderen Varianten vergleichen
3. erst danach in die produktive GeoMap und in den Execution-Slice uebernehmen

---

## 4. Istzustand vs `worldmonitor`

### 4.1 Wo wir aufgeholt haben

- Unterordner-/Subsystem-Struktur ist inzwischen deutlich sauberer
- Marker-/Timeline-/Drawing-/Flat-Pfade sind technisch wesentlich belastbarer
- Panel-Status-Chrome ist jetzt real und nicht mehr ad hoc
- Dock-/Persistenz existiert jetzt als echter Pfad

### 4.2 Wo `worldmonitor` noch sichtbar vor uns ist

- klarere Top-Level-Panel-Komposition
- weniger Sammelwirkung in der rechten Rail
- bessere Informationsdramaturgie
- staerkeres Gefuehl von `mission control` statt `guter Feature-Sammlung`

### 4.3 Harte Wahrheit

Unser Problem ist heute nicht mehr primaer:

- falscher Renderer
- falsches Marker-Symbol
- fehlender Unterordner

Unser Problem ist jetzt eher:

- die **kompositorische Ordnung** der finalen Analysten-Surface ist noch nicht scharf genug

---

## 5. Sollzustand fuer TradeView Fusion

Nicht:

- `worldmonitor` 1:1 kopieren
- noch mehr Einzelpanels stapeln

Sondern:

- `worldmonitor`-Ordnung
- plus unsere groessere Domain-Breite
- als analyst-grade Intelligence Workspace

### 5.1 Prinzipien

1. Wenige starke Top-Level-Zonen
2. Panels mit klarer primaerer und sekundaerer Rolle
3. Geo bleibt Kernsurface
4. Macro/Trading/Operations haengen sauber ein, nicht als neue chaotische Rail-Schichten
5. Flat-Mode ist nicht nur zweiter Renderer, sondern operativer Arbeitsmodus

### 5.2 Wahrscheinliche Top-Level-Zonen

Als Arbeitsmodell:

1. `Viewport / Map Stage`
2. `Left Controls / Overlay & Authoring`
3. `Right Intelligence Workspace`
4. `Timeline Workspace`
5. `Operations / Status / Source Health`
6. `Context / News / Insights`

Wichtig:

- das sind **Zonen**
- nicht zwingend 6 komplett getrennte sichtbare Paneels gleichzeitig

### 5.3 Empfohlene Top-Level-Panels

Aktuell als gutes Zielbild:

1. `Candidate Queue`
2. `Region News`
3. `GeoPulse Insights`
4. `Conflict Context`
5. `GameTheory Impact`
6. `Source Health`
7. `Operations Workspace`

`Timeline` sollte eher **eigener Workspace-Mode/Tab** bleiben und nicht nur ein weiteres kleines Unterpanel sein.

---

## 6. Was als Naechstes wichtig ist

### 6.1 Kurzfristig

1. Funktionaler Pass auf:
   - Drawing
   - Marker create/edit/delete
   - Flat handoff
   - Retry-/error paths
2. Panelstruktur weiter in Richtung `worldmonitor`-Ordnung schieben
3. Right Rail / Docking UX weiter verfeinern

### 6.2 Danach

1. `worldmonitor`-Panelstruktur gezielt auf unseren Umfang mappen
2. nicht noch mehr Panels addieren, sondern:
   - Panels zusammenfassen
   - Sections klarer trennen
   - Rolle jedes Panels explizit machen

### 6.3 Wichtig fuer Folgearbeit

Ab hier sollte nicht mehr jeder Block primar ein Refactor sein.

Ab hier gilt:

- nur noch Refactor, wenn er direkte UX oder Verify-Wirkung hat
- sonst gezielte Produktverbesserung
- jeder Block sollte eine sichtbare GeoMap-Qualitaetssteigerung bringen oder einen Verify-Gate vorbereiten

---

## 7. Verify-Stand

Technischer Status aktuell:

- `bun run lint` gruen
- `bun run typecheck` gruen

Relevante Live-Gates im Slice:

- `V.25` Shell-/Panel-Gate
- `V.26` Flat-Marker-Live-Gate
- `V.27` Source-/Status-Live-Gate
- `V.28` Shell-Regression-Gate

Wichtige Folgerung:

Die Struktur- und Markerarbeit ist jetzt weit genug, dass die naechsten grossen Schritte browserbasiert verifiziert werden sollten, statt nur weiter non-live zu wachsen.

---

## 8. Entscheidungsstatement

Der aktuelle GeoMap-Stand ist **nicht fertig**, aber auch nicht mehr chaotische Baustelle.

Wir sind jetzt an diesem Punkt:

- Struktur deutlich besser
- Marker sichtbar besser
- Panel-/Status-Chrome deutlich besser
- Dock/Persistenz real vorhanden
- Flat-/Timeline-Bruecke real vorhanden

Der naechste grosse Qualitaetssprung kommt nicht mehr aus noch mehr Datei-Splits, sondern aus:

- funktionaler Haertung
- analyst-grade Panel-Komposition
- klarer Anpassung der `worldmonitor`-Shellmuster auf unseren groesseren Scope
