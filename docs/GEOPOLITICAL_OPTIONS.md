# Geopolitical Visualization Options -- D3 Module Roadmap & Geo-Extensions

> **Stand:** 22. Februar 2026
> **Zweck:** Vollstaendiger Katalog aller D3-Module, d3-geo-Erweiterungen, und Drittanbieter-Visualization-Libraries die fuer das Projekt relevant sind. Jedes Modul ist gegen konkrete geplante Features aus den Docs gemappt. Single Source of Truth fuer Frontend-Visualization-Entscheidungen.
> **Abgrenzung:** [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.4 definiert die Rendering-Architektur (SVG → Canvas → deck.gl). Dieses Dokument definiert die **Module** die in jeder Stufe gebraucht werden.
> **Abgrenzung:** [`AGENT_TOOLS.md`](./AGENT_TOOLS.md) Sek. 10 definiert den Game Theory Simulation Mode auf der GeoMap. Dieses Dokument definiert welche d3-Module diese Visualisierungen brauchen.
> **Abgrenzung:** [`FRONTEND_DESIGN_TOOLING.md`](./FRONTEND_DESIGN_TOOLING.md) behandelt Design-to-Code-Tools (Figma, Pencil). Dieses Dokument behandelt programmatische Visualization-Libraries.
> **Quellen:**
> - [D3.js API Reference](https://d3js.org/api) -- Offizielle D3 Dokumentation
> - [D3 Graph Gallery](https://d3-graph-gallery.com/) -- Chart-Typen mit Beispielcode
> - [Observable D3 Gallery](https://observablehq.com/@d3/gallery) -- Interaktive Beispiele
> - [Awesome D3](https://project-awesome.org/wbkd/awesome-d3) -- Kuratierte Liste von D3-Extensions
> - [WebMCP W3C Draft](https://webmachinelearning.github.io/webmcp/) -- Agent-to-Frontend Bridge
> **Primaer betroffen:** `src/features/geopolitical/MapCanvas.tsx`, kuenftige Visualization-Components

---

## Inhaltsverzeichnis

1. [IST-Zustand: Installierte Packages](#1-ist-zustand-installierte-packages)
2. [D3 Core-Module -- Visualization](#2-d3-core-module----visualization)
3. [D3 Core-Module -- Animation](#3-d3-core-module----animation)
4. [D3 Core-Module -- Interaction](#4-d3-core-module----interaction)
5. [D3 Core-Module -- Data Utilities](#5-d3-core-module----data-utilities)
6. [D3-Geo Erweiterungen (Spherical/Globe)](#6-d3-geo-erweiterungen-sphericalglobe)
7. [Drittanbieter Visualization Libraries](#7-drittanbieter-visualization-libraries)
8. [Drittanbieter Map Libraries](#8-drittanbieter-map-libraries)
9. [Awesome-D3: Evaluierte Extensions](#9-awesome-d3-evaluierte-extensions)
10. [Feature → Module Matrix](#10-feature--module-matrix)
11. [Stufenplan: Was wann installieren](#11-stufenplan-was-wann-installieren)
12. [Bundle-Size-Budget](#12-bundle-size-budget)
13. [Explizit NICHT eingeplant (mit Begruendung)](#13-explizit-nicht-eingeplant-mit-begruendung)
14. [Querverweise](#14-querverweise)

---

## 1. IST-Zustand: Installierte Packages

> Quelle: `package.json`, `MapCanvas.tsx`

### D3 Packages (4)

| Package | Version | Importierte Funktionen | Genutzt in |
|---|---|---|---|
| `d3-geo` | ^3.1.1 | `geoOrthographic`, `geoPath`, `geoGraticule10` | `MapCanvas.tsx` -- Projektion, Pfad-Generierung, Gitternetz |
| `d3-drag` | ^3.0.0 | `drag` | `MapCanvas.tsx` -- Globus per Maus drehen |
| `d3-selection` | ^3.0.0 | `select` | `MapCanvas.tsx` -- SVG-Element selektieren fuer Drag/Zoom-Binding |
| `d3-zoom` | ^3.0.0 | `zoom`, `zoomIdentity`, `zoomTransform` | `MapCanvas.tsx` -- Zoom-Verhalten, Reset |

### Geo-Daten Packages (3)

| Package | Version | Genutzt fuer |
|---|---|---|
| `topojson-client` | ^3.1.0 | `feature()` -- konvertiert TopoJSON → GeoJSON FeatureCollection |
| `world-atlas` | ^2.0.2 | `countries-110m.json` -- Laendergrenzen (110m Aufloesung, ~177 Features) |
| `geojson` (Types) | -- | TypeScript-Typen: `FeatureCollection`, `Geometry`, `GeoJsonProperties` |

### Was aktuell FEHLT

| Bereich | Problem | Auswirkung |
|---|---|---|
| **Farblogik** | Severity-Heatmap ist 4 hardcoded `if`-Statements | Skaliert nicht fuer 6+ geplante Choropleth-Layer |
| **Animation** | Auto-Rotation via `setInterval(50ms)` statt Frame-synchron | Jank bei Last, nicht synchron mit Browser-Repaint |
| **Globe-UX** | Kein Inertia-Effekt beim Drehen | Globus stoppt abrupt -- fuehlt sich nicht physikalisch an |
| **Spatial Query** | Kein Nearest-Event-Lookup | Map-Click muss alle Marker durchiterieren |
| **Charts** | Keine Achsen, Scales, Shape-Generators | Kein Spielbaum, keine Histogramme, keine Timelines moeglich |

---

## 2. D3 Core-Module -- Visualization

> Ref: [d3js.org/api](https://d3js.org/api) Visualization-Kategorie

### 2.1 `d3-scale` -- Universelle Skalierungsfunktionen

> [https://d3js.org/d3-scale](https://d3js.org/d3-scale)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [linear](https://d3js.org/d3-scale/linear) | `scaleLinear()` | Severity → Color, Impact → Line-Width, DRS Score → Y-Position |
| [time](https://d3js.org/d3-scale/time) | `scaleTime()` | Timeline-Achse, Event-Datum-Skalierung |
| [ordinal](https://d3js.org/d3-scale/ordinal) | `scaleOrdinal()` | Regime-State → Color, CBDC Status → Color, Category → Symbol |
| [sequential](https://d3js.org/d3-scale/sequential) | `scaleSequential()` | Heatmap-Faerbung (z.B. Severity 0-5 → Farbgradient) |
| [diverging](https://d3js.org/d3-scale/diverging) | `scaleDiverging()` | Attractiveness-Index (rot←neutral→gruen), Correlation Matrix (-1 bis +1) |
| [quantize](https://d3js.org/d3-scale/quantize) | `scaleQuantize()` | Diskrete Farbstufen fuer Choropleths (z.B. 5-stufige Severity) |
| [threshold](https://d3js.org/d3-scale/threshold) | `scaleThreshold()` | Traffic-Light-Systeme (Basel Regime: rot/gelb/gruen) |
| [band](https://d3js.org/d3-scale/band) | `scaleBand()` | Monte Carlo Histogram X-Achse (Bins) |
| [pow](https://d3js.org/d3-scale/pow) | `scalePow()` | Nicht-lineare Marker-Groessen (Log-Skalierung fuer grosse Spreads) |

**Geplante Features die d3-scale brauchen:**

| Feature | Doc-Referenz | Scale-Typ |
|---|---|---|
| Severity Heatmap (aktuell hardcoded) | MapCanvas.tsx Z. 95-100, 416-427 | `scaleSequential` |
| Regime-State Layer | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.3a | `scaleOrdinal` |
| Country Attractiveness Heatmap | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.13d | `scaleDiverging` |
| CBDC Status Choropleth | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.13b | `scaleOrdinal` |
| Financial Openness (Chinn-Ito) | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.13b | `scaleSequential` |
| Currency Spread Heatmap | REFERENCE_PROJECTS Z. 786 | `scaleSequential` |
| Basel Regime Traffic-Light | REFERENCE_PROJECTS Z. 857, 948 | `scaleThreshold` |
| Monte Carlo Histogram | AGENT_TOOLS Sek. 10.3, GAME_THEORY Sek. 7 | `scaleBand` + `scaleLinear` |
| DRS Cumulative Timeline | AGENT_ARCHITECTURE Sek. 10.1 | `scaleLinear` + `scaleTime` |
| Correlation Matrix (Portfolio) | INDICATOR_ARCHITECTURE Sek. 5.P.1 | `scaleDiverging` |
| Scenario Tree Probability → Color | AGENT_TOOLS Sek. 10.1-10.3 | `scaleSequential` |
| Transmission Path Impact → Width | AGENT_TOOLS Sek. 10.2 | `scaleLinear` |
| Trade Corridor Volume → Width | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.13c | `scaleLinear` |
| Sentinel Heatmap (Transcript) | AGENT_ARCHITECTURE Sek. 10.1 | `scaleDiverging` |

### 2.2 `d3-scale-chromatic` -- Professionelle Farbschemata

> [https://d3js.org/d3-scale-chromatic](https://d3js.org/d3-scale-chromatic)

| Sub-Modul | Schemata | Unser Use Case |
|---|---|---|
| [sequential](https://d3js.org/d3-scale-chromatic/sequential) | `interpolateYlOrRd`, `interpolateInferno`, `interpolateViridis` | Severity Heatmap, Event Density, Financial Openness |
| [diverging](https://d3js.org/d3-scale-chromatic/diverging) | `interpolateRdYlGn`, `interpolateRdBu`, `interpolatePiYG` | Attractiveness (rot→gruen), Correlation (-1→+1), Sentiment |
| [categorical](https://d3js.org/d3-scale-chromatic/categorical) | `schemeTableau10`, `schemeSet2` | Regime-States (6 Zustaende), Trade Commodity Types, Event Categories |
| [cyclical](https://d3js.org/d3-scale-chromatic/cyclical) | `interpolateRainbow`, `interpolateSinebow` | Zeitliche Zyklen (optional, z.B. Monats-Heatmap) |

**Konkrete Zuordnung:**

| Feature | Empfohlenes Schema | Begruendung |
|---|---|---|
| Severity (0-5) | `interpolateYlOrRd` | Gelb (niedrig) → Orange → Rot (hoch). Intuitiv. |
| Attractiveness Index | `interpolateRdYlGn` | Rot (schlecht) → Gelb (neutral) → Gruen (gut). Divergierend. |
| Correlation Matrix | `interpolateRdBu` | Rot (negativ) → Weiss (0) → Blau (positiv). Standard fuer Korrelationen. |
| Regime-States | `schemeTableau10` (custom) | 6 spezifische Farben: Dormant=grau, Tension=gelb, Escalation=orange, Conflict=rot, De-escalation=hellgruen, Frozen=blaugrau |
| Sentiment Heatmap | `interpolateRdYlGn` | Rot (negativ) → Gruen (positiv). |
| Financial Openness | `interpolateBlues` | Dunkel=geschlossen, Hell=offen (sequentiell). |
| Trade Corridors | Custom 4-Color | Energy=rot, Tech=blau, Agrar=gruen, Finance=gold (kategorisch). |
| Monte Carlo Probability | `interpolateViridis` | Perceptually uniform, colorblind-safe. |

### 2.3 `d3-interpolate` -- Interpolation (Farbe, Position, Pfade)

> [https://d3js.org/d3-interpolate](https://d3js.org/d3-interpolate)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [color](https://d3js.org/d3-interpolate/color) | `interpolateRgb`, `interpolateHcl` | Smooth Farbuebergaenge zwischen Heatmap-Stufen |
| [value](https://d3js.org/d3-interpolate/value) | `interpolateNumber` | Animierte Zahlenwerte (z.B. Score-Counter) |
| [zoom](https://d3js.org/d3-interpolate/zoom) | `interpolateZoom` | Smooth Zoom-Transitions auf dem Globus |
| [transform](https://d3js.org/d3-interpolate/transform) | `interpolateTransformSvg` | SVG-Element Transitions |

**Spezial: `d3.geoInterpolate()` (in `d3-geo` enthalten)**

Bereits installiert aber NICHT genutzt. Generiert Punkte entlang eines Great-Circle-Pfads zwischen zwei Koordinaten auf der Sphaere. **Essentiell fuer:**
- Animierte Transmission Paths (Iran → Hormuz → Oil Price)
- Trade Corridors (Laender-Zentroid → Laender-Zentroid)
- Sanction-Flow-Visualisierung

```
d3.geoInterpolate([lng1, lat1], [lng2, lat2])(t)  // t = 0..1 → Position auf dem Great Circle
```

### 2.4 `d3-hierarchy` -- Baumstrukturen und Hierarchien

> [https://d3js.org/d3-hierarchy](https://d3js.org/d3-hierarchy)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [hierarchy](https://d3js.org/d3-hierarchy/hierarchy) | `hierarchy()` | Scenario-Tree Datenstruktur aufbauen |
| [tree](https://d3js.org/d3-hierarchy/tree) | `tree()` | **Spielbaum-Layout** -- Hauptfeature fuer Game Theory Mode |
| [cluster](https://d3js.org/d3-hierarchy/cluster) | `cluster()` | Alternative: Blatt-Knoten auf gleicher Hoehe |
| [treemap](https://d3js.org/d3-hierarchy/treemap) | `treemap()` | Portfolio-Zusammensetzung als Treemap (optional) |
| [pack](https://d3js.org/d3-hierarchy/pack) | `pack()` | Bubble-Chart fuer Event-Cluster (optional) |
| [partition](https://d3js.org/d3-hierarchy/partition) | `partition()` | Sunburst/Icicle fuer hierarchische Event-Kategorien (optional) |

**Primaer-Feature: Spielbaum / Scenario Tree**

> Doc-Ref: AGENT_TOOLS.md Sek. 10.1-10.3 (explizit "Spielbaum (D3.js)")

```
d3.tree()
  .size([width, height])
  .separation((a, b) => a.parent === b.parent ? 1 : 2)
  (d3.hierarchy(scenarioData))
```

Erzeugt `.x` und `.y` Koordinaten fuer jeden Knoten. Kombiniert mit `d3-shape` `.linkVertical()` fuer die Verbindungslinien.

### 2.5 `d3-shape` -- Geometrische Primitiven

> [https://d3js.org/d3-shape](https://d3js.org/d3-shape)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [line](https://d3js.org/d3-shape/line) | `line()` | DRS Cumulative Line, Replicator Dynamics Kurve |
| [area](https://d3js.org/d3-shape/area) | `area()` | Stacked Area fuer Population Proportions (EGT) |
| [arc](https://d3js.org/d3-shape/arc) | `arc()` | Donut-Charts (z.B. Risk_On/Risk_Off/Neutral Anteile) |
| [pie](https://d3js.org/d3-shape/pie) | `pie()` | Daten-Layout fuer Donut/Pie |
| [link](https://d3js.org/d3-shape/link) | `linkVertical()`, `linkHorizontal()` | **Spielbaum-Verbindungslinien** |
| [curve](https://d3js.org/d3-shape/curve) | `curveBasis`, `curveMonotoneX` | Gesmoothte Linien-Charts |
| [stack](https://d3js.org/d3-shape/stack) | `stack()` | Stacked Bar/Area fuer Multi-Category-Daten |
| [symbol](https://d3js.org/d3-shape/symbol) | `symbol()` | Custom Marker-Symbole auf der Karte |
| [radial-line](https://d3js.org/d3-shape/radial-line) | `lineRadial()` | Spider/Radar Chart (z.B. Country Profile) |
| [radial-link](https://d3js.org/d3-shape/radial-link) | `linkRadial()` | Radiale Spielbaum-Variante |

### 2.6 `d3-force` -- Force-Directed Graphs

> [https://d3js.org/d3-force](https://d3js.org/d3-force)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [simulation](https://d3js.org/d3-force/simulation) | `forceSimulation()` | Entity Graph Layout Engine |
| [center](https://d3js.org/d3-force/center) | `forceCenter()` | Graph zentrieren |
| [collide](https://d3js.org/d3-force/collide) | `forceCollide()` | Nodes ueberlappen nicht |
| [link](https://d3js.org/d3-force/link) | `forceLink()` | Kanten zwischen Nodes (sanctions, exposed_to, supplies) |
| [many-body](https://d3js.org/d3-force/many-body) | `forceManyBody()` | Abstossung/Anziehung zwischen Nodes |
| [position](https://d3js.org/d3-force/position) | `forceX()`, `forceY()` | Nodes nach Typ gruppieren (Actors links, Assets rechts) |

**Feature: Entity Graph (GraphRAG light)**

> Doc-Ref: GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.8, MEMORY_ARCHITECTURE Sek. 6.1 Domain C

Node-Typen: Actor, Event, Asset, Chokepoint, Corridor
Edge-Typen: sanctions, exposed_to, supplies, controls, transits_through

### 2.7 `d3-contour` -- Dichte-Konturen

> [https://d3js.org/d3-contour](https://d3js.org/d3-contour)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [contour](https://d3js.org/d3-contour/contour) | `contours()` | Isoline-Visualisierung fuer Liquidation Density |
| [density](https://d3js.org/d3-contour/density) | `contourDensity()` | Event-Density-Overlay auf dem Globus (Alternative zu Heatmap-Fill) |

**Feature:** CoinGlass-Style Liquidation Heatmap (REFERENCE_PROJECTS Z. 1286). Event-Density-Visualisierung als Alternative zur Country-Fill-Methode.

### 2.8 `d3-chord` -- Fluss-Diagramme

> [https://d3js.org/d3-chord](https://d3js.org/d3-chord)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [chord](https://d3js.org/d3-chord/chord) | `chord()` | Trade Flow Matrix zwischen Regionen |
| [ribbon](https://d3js.org/d3-chord/ribbon) | `ribbon()` | Visuelle Verbindungsbaender |

**Feature:** Alternatives Trade Flow Visualization (statt oder ergaenzend zu PathLayer). Zeigt bidirektionale Handelsvolumen zwischen Regionen als Chord Diagram. Ref: [d3-graph-gallery.com Chord](https://d3-graph-gallery.com/).

### 2.9 `d3-color` -- Farbmanipulation

> [https://d3js.org/d3-color](https://d3js.org/d3-color)

Farbkonvertierung (RGB ↔ HSL ↔ HCL ↔ Lab). Noetig fuer:
- Custom Farbmischung bei Heatmap-Overlays (z.B. Severity + Regime ueberlagert)
- Perceptually uniform Farbskalen in HCL-Space
- Accessibility: Colorblind-sichere Paletten berechnen

### 2.10 `d3-path` -- Custom Path-Generierung

> [https://d3js.org/d3-path](https://d3js.org/d3-path)

Canvas 2D Path-Generierung. Wird implizit von `d3-shape` und `d3-geo` genutzt. Fuer Canvas Hybrid Migration (Stufe 1) direkt relevant: `geoPath().context(canvasContext)` braucht `d3-path` intern.

### 2.11 `d3-polygon` -- Polygon-Berechnungen

> [https://d3js.org/d3-polygon](https://d3js.org/d3-polygon)

`polygonContains()`, `polygonArea()`, `polygonHull()`. Noetig fuer:
- Hit-Testing: "Ist dieser Klick innerhalb eines Drawing-Polygons?"
- Convex Hull fuer Event-Cluster
- Polygon-Area fuer Flaechen-basierte Metriken

### 2.12 `d3-quadtree` -- Spatial Indexing (2D)

> [https://d3js.org/d3-quadtree](https://d3js.org/d3-quadtree)

Schnelle Nearest-Neighbor-Suche in 2D. Wird intern von `d3-force` genutzt. Auch nuetzlich fuer:
- Schnelles Marker-Picking auf der projizierten 2D-Ebene
- Viewport-Culling: nur Marker im sichtbaren Bereich berechnen

### 2.13 `d3-delaunay` -- Voronoi & Delaunay (2D, Flat)

> [https://d3js.org/d3-delaunay](https://d3js.org/d3-delaunay)

Voronoi-Diagramme und Delaunay-Triangulation auf der **flachen** 2D-Ebene. Fuer den Globus brauchen wir `d3-geo-voronoi` (Sek. 6). Aber fuer flache Charts (Scatter Plots, Tooltip-Proximity) ist `d3-delaunay` relevant.

---

## 3. D3 Core-Module -- Animation

> Ref: [d3js.org/api](https://d3js.org/api) Animation-Kategorie

### 3.1 `d3-transition` -- Animierte Uebergaenge

> [https://d3js.org/d3-transition](https://d3js.org/d3-transition)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [selecting](https://d3js.org/d3-transition/selecting) | `.transition()` auf Selections | Smooth Country-Fill-Aenderungen bei Layer-Wechsel |
| [modifying](https://d3js.org/d3-transition/modifying) | `.attr()`, `.style()` auf Transitions | Animierte Farbwechsel, Position, Opacity |
| [timing](https://d3js.org/d3-transition/timing) | `.duration()`, `.delay()` | Gestaffelte Animationen (Markers nacheinander einblenden) |
| [control-flow](https://d3js.org/d3-transition/control-flow) | `.on("end")`, Chaining | Sequentielle Animationen (Path zeichnen → Marker einblenden → Label zeigen) |

**Geplante Features:**

| Feature | Animation | Doc-Ref |
|---|---|---|
| Transmission Paths | Stroke-Dashoffset Animation entlang Great Circle | AGENT_TOOLS Sek. 10.2 |
| Scenario Tree Expansion | Neue Aeste "wachsen" animiert | AGENT_TOOLS Sek. 10.1 |
| Regime-State Wechsel | Smooth Farbuebergang zwischen States | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.3a |
| Canvas Marker Pulse | Programmatische Pulse-Animation (ersetzt SVG `<animate>`) | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.4 Stufe 1 |
| Layer-Wechsel | Cross-Fade zwischen Choropleth-Layern | Alle Heatmap-Layer |
| Entity Graph Updates | Nodes/Edges smooth repositionieren bei Daten-Aenderungen | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.8 |

### 3.2 `d3-timer` -- Frame-synchrone Animation Loops

> [https://d3js.org/d3-timer](https://d3js.org/d3-timer)

| Funktion | Unser Use Case |
|---|---|
| `timer(callback)` | Kontinuierliche Canvas-Animation (Pulse, Rotation). Ersetzt `setInterval`. |
| `interval(callback, delay)` | Periodische Updates (z.B. Auto-Rotation alle 16ms statt 50ms). |
| `timeout(callback, delay)` | Einmalige verzoegerte Ausfuehrung (z.B. Tooltip nach Hover-Delay). |

**Sofort-Fix:** `MapCanvas.tsx` Z. 196-198 nutzt `setInterval(50ms)` fuer Auto-Rotation. `d3.timer()` ist Frame-synchron (requestAnimationFrame), verhindert Jank und laeuft automatisch bei Tab-Inaktivitaet nicht.

### 3.3 `d3-ease` -- Easing-Funktionen

> [https://d3js.org/d3-ease](https://d3js.org/d3-ease)

| Funktion | Unser Use Case |
|---|---|
| `easeLinear` | Konstante Geschwindigkeit (z.B. Path-Animation) |
| `easeCubicInOut` | Natuerliches Beschleunigen/Abbremsen (Default fuer Transitions) |
| `easeElasticOut` | "Federnder" Effekt (z.B. Marker bei Erscheinen) |
| `easeBounceOut` | "Aufprall" Effekt (z.B. Marker bei Severity-Aenderung) |
| `easeCircleInOut` | Kreisfoermige Beschleunigung (z.B. Globe-Rotation Stopp) |

---

## 4. D3 Core-Module -- Interaction

> Ref: [d3js.org/api](https://d3js.org/api) Interaction-Kategorie

### 4.1 `d3-brush` -- Bereichsauswahl

> [https://d3js.org/d3-brush](https://d3js.org/d3-brush)

| Funktion | Unser Use Case |
|---|---|
| `brushX()` | **Timeline-Slider** -- horizontale Bereichsauswahl fuer Zeitreise-Modus |
| `brushY()` | Vertikale Selektion (z.B. Preis-Range in Charts) |
| `brush()` | 2D-Selektion (z.B. Events auf Scatter Plot auswaehlen) |

**Feature:** "Zeitreise-Modus" -- Slider am unteren Kartenrand, scrubben durch die letzten 30 Tage. Karte zeigt Events + Szenarien + Marktreaktionen zum gewaehlten Zeitpunkt.

> Doc-Ref: AGENT_TOOLS Sek. 10.2 "Timeline-Slider", GEOPOLITICAL_MAP_MASTERPLAN Sek. 29 "Timeline Playback"

### 4.2 `d3-dispatch` -- Custom Events

> [https://d3js.org/d3-dispatch](https://d3js.org/d3-dispatch)

Event-System fuer lose gekoppelte Komponenten. Noetig wenn mehrere Visualisierungen synchron reagieren muessen (z.B. Hover auf GeoMap highlighted auch den Timeline-Eintrag und das Entity-Graph-Node).

---

## 5. D3 Core-Module -- Data Utilities

> Ref: [d3js.org/api](https://d3js.org/api) Data-Kategorie

### 5.1 `d3-array` -- Array-Operationen

> [https://d3js.org/d3-array](https://d3js.org/d3-array)

| Sub-Modul | Funktion | Unser Use Case |
|---|---|---|
| [bin](https://d3js.org/d3-array/bin) | `bin()` | Monte Carlo Histogram Bins |
| [group](https://d3js.org/d3-array/group) | `group()`, `rollup()` | Events nach Region/Category gruppieren |
| [summarize](https://d3js.org/d3-array/summarize) | `extent()`, `mean()`, `median()`, `deviation()` | Min/Max fuer Scale-Domains, Statistiken |
| [sort](https://d3js.org/d3-array/sort) | `sort()`, `ascending()` | Sortierte Marker-Listen |
| [bisect](https://d3js.org/d3-array/bisect) | `bisect()` | Binaere Suche in sortierten Arrays (Timeline-Lookup) |
| [ticks](https://d3js.org/d3-array/ticks) | `ticks()` | Achsen-Tick-Positionen berechnen |

### 5.2 `d3-time` + `d3-time-format` -- Temporale Operationen

> [https://d3js.org/d3-time](https://d3js.org/d3-time) / [https://d3js.org/d3-time-format](https://d3js.org/d3-time-format)

| Funktion | Unser Use Case |
|---|---|
| `timeDay`, `timeWeek`, `timeMonth` | Timeline-Achse: Ticks pro Tag/Woche/Monat |
| `timeFormat("%d. %b %Y")` | Datum-Formatierung auf Achsen und Tooltips |
| `timeParse("%Y-%m-%d")` | Event-Datum parsen fuer Timeline |

### 5.3 `d3-format` -- Zahlenformatierung

> [https://d3js.org/d3-format](https://d3js.org/d3-format)

| Format | Beispiel | Unser Use Case |
|---|---|---|
| `format(".1%")` | "45.2%" | Probability-Labels im Spielbaum |
| `format(",.0f")` | "1,234" | Handelsvolumen in Trade Corridors |
| `format(".2s")` | "1.2M" | SI-Prefix fuer grosse Zahlen (GDP, Volumen) |
| `format("+.1f")` | "+3.2" / "-1.5" | Impact Scores mit Vorzeichen |

### 5.4 `d3-dsv` -- CSV/TSV Parsing

> [https://d3js.org/d3-dsv](https://d3js.org/d3-dsv)

`csvParse()`, `tsvParse()`. Fuer direktes Laden von CSV-Daten (z.B. UN Comtrade Export, BIS RCAP Data). Normalerweise im Backend, aber fuer schnelles Prototyping im Frontend nuetzlich.

### 5.5 `d3-fetch` -- Daten laden

> [https://d3js.org/d3-fetch](https://d3js.org/d3-fetch)

`json()`, `csv()`, `text()`. Convenience-Wrapper um `fetch()`. Wir nutzen TanStack Query -- `d3-fetch` nur fuer standalone Prototypen relevant.

### 5.6 `d3-random` -- Zufallsgeneratoren

> [https://d3js.org/d3-random](https://d3js.org/d3-random)

`randomNormal()`, `randomUniform()`, `randomLogNormal()`. Fuer Monte Carlo Simulation im Frontend (GAME_THEORY Sek. 7). Normal-verteilte Zufallszahlen fuer Szenario-Generierung.

---

## 6. D3-Geo Erweiterungen (Spherical/Globe)

> Quelle: [awesome-d3 Maps](https://project-awesome.org/wbkd/awesome-d3#maps), d3-geo Projects Research

### 6.1 `d3-geo-voronoi` -- Sphaerische Voronoi-Diagramme

> [GitHub: Fil/d3-geo-voronoi](https://github.com/Fil/d3-geo-voronoi)

**Was:** Voronoi-Diagramme und Delaunay-Triangulation direkt auf der Sphaere (nicht auf der flachen Projektion).

**Warum wir es brauchen:**

| Use Case | Aktuell | Mit d3-geo-voronoi |
|---|---|---|
| "Naechstes Event zum Klick-Punkt" | Alle Marker durchiterieren, Distanz berechnen | `geoVoronoi(points).find(lng, lat)` -- O(log n) |
| "Einflussradius pro Event" | Nicht moeglich | Jeder Punkt auf dem Globus gehoert zum naechsten Event. Voronoi-Zellen zeigen Einflussbereiche |
| "Event-Cluster erkennen" | Kein Spatial Lookup | Delaunay-Triangulation zeigt Nachbarschaften |
| Hit-Testing fuer Tooltips | Maus-Position gegen alle Marker pruefen | Voronoi-Partition: sofortiger Lookup welches Event der Maus am naechsten ist |

**Prioritaet:** HOCH (v1.1). Sofortiger UX-Gewinn und Performance-Verbesserung.

### 6.2 `d3-inertia` -- Traegheits-Effekt fuer Globus-Rotation

> [GitHub: Fil/d3-inertia](https://github.com/Fil/d3-inertia)

**Was:** Extension zu `d3-drag`. Wenn der User den Globus dreht und loslaesst, "gleitet" er mit Traegheit weiter (wie ein physischer Globus).

**Aktuell:** Globus stoppt abrupt beim Loslassen (`drag.on("drag")` setzt Rotation, kein Momentum).

**Integration:** ~15 Zeilen Aenderung in `MapCanvas.tsx`:

```typescript
import { geoInertiaDrag } from "d3-inertia";

// Ersetzt den aktuellen drag-Handler
geoInertiaDrag(svg, (rotation) => {
  setRotation(rotation);
  setIsAutoRotating(false);
}, mapModel.projection);
```

**Prioritaet:** HOCH (v1.1). Minimaler Aufwand, maximaler UX-Gewinn.

### 6.3 `d3-geo-polygon` -- Sphaerische Polygon-Operationen

> [GitHub: d3/d3-geo-polygon](https://github.com/d3/d3-geo-polygon)

**Was:** Clipping und geometrische Operationen auf sphaerischen Polygonen. Erweitert `d3-geo` um:
- Polygon-Clipping an beliebigen Kreisen (nicht nur am Horizon)
- Polygon-Intersection und -Union auf der Sphaere
- Korrekte Darstellung von Polygonen die den Anti-Meridian kreuzen

**Warum wir es brauchen:**

| Use Case | Doc-Ref |
|---|---|
| Trade Corridors korrekt am Globus-Rand clippen | GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.13c |
| Sanction Zones als sphaerische Polygone | GAME_THEORY Sek. 8 (Krisenlogik) |
| "Exclusion Zones" auf der Karte (z.B. Strait of Hormuz Sperrgebiet) | AGENT_TOOLS Sek. 10.2 |
| Korrekte Polygon-Darstellung bei Datum-Line-Crossing | Allgemein (z.B. Russland) |

**Prioritaet:** MITTEL (v2). Noetig wenn Trade Corridors und Sanction Zones implementiert werden.

### 6.4 `d3-geo-projection` -- Erweiterte Projektionen

> [GitHub: d3/d3-geo-projection](https://github.com/d3/d3-geo-projection)

**Was:** ~100 zusaetzliche Projektionen jenseits der 10 Standard-Projektionen in `d3-geo`.

**Relevante Projektionen fuer uns:**

| Projektion | Use Case | Prioritaet |
|---|---|---|
| `geoSatellite()` | "Zoom auf Region" Ansicht (z.B. Middle East Focus von oben) | MITTEL |
| `geoInterruptedMollweideHemispheres()` | Flat-Map-Export fuer Reports/PDFs | NIEDRIG |
| `geoGilbert()` | Alternativer Globe-Stil (konforme Projektion) | NIEDRIG |
| `geoBertin1953()` | Aesthetisch ansprechende Flat-Map | NIEDRIG |

**Aktuell:** Wir nutzen `geoOrthographic` als einzige Projektion. Der Orthographic Globe ist unser UX-Differentiator und bleibt Default. Aber fuer Region-Zoom-Ansichten oder Export-Funktionen koennten alternative Projektionen sinnvoll sein.

**Prioritaet:** NIEDRIG (v3). Der Globe reicht fuer v1 und v2.

### 6.5 `d3-topogram` -- Continuous Area Cartograms

> [GitHub: shawnbot/topogram](https://github.com/shawnbot/topogram)

**Was:** Verzerrt Laendergrenzen basierend auf einem statistischen Wert (z.B. GDP, Military Spending, Population) bei Beibehaltung der relativen Topologie.

**Use Case:** "GDP-Cartogram" oder "Military Spending Cartogram" als alternativer Layer. Visuell beeindruckend -- Laender mit hohem GDP werden groesser dargestellt, Laender mit niedrigem GDP schrumpfen.

**Prioritaet:** NIEDRIG (optional, v3). Nische-Feature aber visuell beeindruckend fuer Praesentationen.

### 6.6 `d3-geo-scale-bar` -- Automatische Massstabsleiste

> [GitHub: HarryStevens/d3-geo-scale-bar](https://github.com/HarryStevens/d3-geo-scale-bar)

**Was:** Zeigt automatisch die korrekte Massstabsleiste fuer die aktuelle Projektion und Zoom-Stufe.

**Prioritaet:** NIEDRIG (nice-to-have). Trivial zu integrieren, erhoht Professionalitaet.

### 6.7 `d3-composite-projections` -- Zusammengesetzte Projektionen

> [GitHub: rveciana/d3-composite-projections](https://github.com/rveciana/d3-composite-projections)

**Was:** Zeigt entfernte Gebiete zusammen (z.B. Alaska + Hawaii + Continental US auf einer Karte).

**Prioritaet:** NEIN. Nicht relevant fuer unseren Global-Globe.

### 6.8 `d3-geo-voronoi` vs. `d3-delaunay` -- Wann was?

| | `d3-delaunay` | `d3-geo-voronoi` |
|---|---|---|
| **Raum** | 2D (flat, projected) | Sphaerisch (3D Globe) |
| **Wann nutzen** | Flat Charts (Scatter, etc.) | Globus-Interaktion |
| **Nearest-Neighbor** | `.find(x, y)` auf projizierten Pixeln | `.find(lng, lat)` auf Koordinaten |
| **Fuer uns** | Portfolio Scatter Plots, Analytics | **GeoMap Marker-Lookup** |

---

## 7. Drittanbieter Visualization Libraries

### 7.1 `deck.gl` v9.2 -- WebGL2 High-Density Overlays

> Ref: GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.4 Stufe 2

| Aspekt | Details |
|---|---|
| **Wann** | v2, wenn >500 Events + 2000 Candidates |
| **Layers** | `GeoJsonLayer`, `ScatterplotLayer`, `HeatmapLayer`, `PathLayer`, `ArcLayer` |
| **Performance** | 60 FPS bis ~1M Datenpunkte (WebGL2-beschleunigt) |
| **Einschraenkung** | Bricht mit `geoOrthographic` Globe -- muesste als Flat-Map oder mit deck.gl Globe-Mode geloest werden |
| **Aufwand** | ~1-2 Wochen |

**Konkrete Use Cases:**
- Trade Corridors als `PathLayer` (GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.13c)
- Event-Density als `HeatmapLayer` (nicht Country-Fill, sondern Punkt-basiert)
- Marker-Clustering als `IconLayer` mit Aggregation

### 7.2 `@xyflow/react` (ReactFlow) -- Workflow/Pipeline Editor

> Ref: AGENT_ARCHITECTURE.md

| Aspekt | Details |
|---|---|
| **Wann** | v2 |
| **Use Case** | Agent Pipeline Editor, Workflow Builder |
| **Nicht fuer** | GeoMap Szenarien (dafuer `d3-hierarchy`) |

### 7.3 `supercluster` -- Marker-Clustering

> [GitHub: mapbox/supercluster](https://github.com/mapbox/supercluster) (7.6k Stars)

| Aspekt | Details |
|---|---|
| **Wann** | v1.1 (mit Canvas Hybrid Migration) |
| **Use Case** | Zoom-abhaengiges Marker-Clustering (50 Events in Europa → 1 Cluster-Circle bei niedrigem Zoom) |
| **Integration** | Cluster-Berechnung bei jedem Zoom-Aenderung, Cluster-Marker rendern statt Einzel-Marker |

### 7.4 Nicht-d3 Chart Libraries (Abgrenzung)

| Library | Status | Begruendung |
|---|---|---|
| `recharts` | Bereits installiert | Standard-Charts (nicht geo-related) |
| `lightweight-charts` | Bereits installiert | Trading OHLCV Charts |
| `nivo` | Nicht noetig | Wuerde mit d3-Direktnutzung kollidieren |
| `plotly.js` | Nicht noetig | Zu gross (3MB+), wir haben d3 |
| `vega-lite` | Evaluieren fuer v3 | Deklarative Grammar-of-Graphics, gut fuer Agent-generierte Charts |

---

## 8. Drittanbieter Map Libraries

> Vollstaendige Evaluierung: GEOPOLITICAL_MAP_MASTERPLAN Sek. 35.4

| Library | Empfehlung | Begruendung |
|---|---|---|
| **deck.gl v9.2** | JA (v2) | WebGL2, React-Integration, production-ready |
| **MapLibre GL JS** | NEIN (vorerst) | Architektur-Wechsel weg von d3-geo Globe |
| **maplibre-rs** | NEIN | Zu unreif (Stand 02/2026), fehlende Features |
| **Hypersphere** | NEIN | Nischen-Projekt |
| **h3o (Rust)** | JA (v3, Backend) | Spatial Indexing, 26x schneller als JS |
| **Leaflet** | NEIN | Wir nutzen d3-geo, nicht Leaflet |
| **react-simple-maps** | NEIN | Basiert auf d3-geo aber wir haben eigene MapCanvas |
| **datamaps** | NEIN | Eigene Map-Library, kollidiert mit unserer Architektur |

---

## 9. Awesome-D3: Evaluierte Extensions

> Quelle: [project-awesome.org/wbkd/awesome-d3](https://project-awesome.org/wbkd/awesome-d3)

### Charts (relevant)

| Extension | Was | Fuer uns? | Begruendung |
|---|---|---|---|
| **`d3-flame-graph`** | Flame Graphs aus hierarchischen Daten | EVALUIEREN (v2) | Performance Profiling von Agent-Pipeline-Ausfuehrungen |
| **`d3-dag`** | Layout fuer gerichtete azyklische Graphen (DAG) | EVALUIEREN (v2) | Agent-Workflow-Visualisierung (Alternative zu ReactFlow) |
| **`d3fc`** | Interactive Chart Components (Candlestick, OHLC) | NEIN | Wir haben `lightweight-charts` |
| **`d3plus`** | Extension-Library (Network, Bubble) | NEIN | Zu gross, wir nutzen d3 direkt |
| **`neo4jd3`** | Neo4j Graph Visualization | EVALUIEREN (v2) | Wenn KG in Neo4j migriert (MEMORY_ARCHITECTURE Sek. 5.2 M2) |
| **`EventDrops`** | Zeitbasierte Event-Visualisierung | EVALUIEREN (v1.5) | Timeline-Strip fuer Events (Alternative zu eigenem Build) |

### Maps (relevant)

| Extension | Was | Fuer uns? | Begruendung |
|---|---|---|---|
| **`d3-geo-voronoi`** | Sphaerische Voronoi (Sek. 6.1) | JA (v1.1) | Nearest-Event Lookup |
| **`d3-inertia`** | Traegheit beim Globus-Drehen (Sek. 6.2) | JA (v1.1) | UX Quick Win |
| **`d3-geo-polygon`** | Sphaerische Polygon-Ops (Sek. 6.3) | JA (v2) | Trade Corridors, Sanction Zones |
| **`d3-geo-projection`** | Erweiterte Projektionen (Sek. 6.4) | OPTIONAL (v3) | Region-Zoom, Export |
| **`d3-topogram`** | Area Cartograms (Sek. 6.5) | OPTIONAL (v3) | GDP/Military Distortion |
| **`d3-geo-scale-bar`** | Massstabsleiste (Sek. 6.6) | OPTIONAL (v1.5) | Professionalitaet |
| **`d3-exploder`** | Geographic Features bewegen/resizen | NEIN | Nicht fuer Globe geeignet |
| **`d3.geo2rect`** | GeoJSON → Rechtecke morphen | NEIN | Nische, nicht fuer unseren Use Case |
| **`mapmap.js`** | Data-driven thematische Karten | NEIN | Eigene Architektur |
| **`simple-map-d3`** | Einfache Choropleths | NEIN | Wir bauen das selber |

### Utils (relevant)

| Extension | Was | Fuer uns? | Begruendung |
|---|---|---|---|
| **`d3-annotation`** | Annotation Helper | JA (v1.5) | Chart-Annotationen (z.B. "Fed Rate Hike hier"), GeoMap-Labels |
| **`d3-legend`** | Legenden-Generator | JA (v1.1) | Heatmap-Legenden, Layer-Legenden |
| **`d3-tooltip`** | Pfeil-Tooltips mit Shadow | EVALUIEREN | Alternative zu unseren Custom-Popups |
| **`d3-lasso`** | Freihand-Selektion von Elementen | EVALUIEREN (v2) | "Kreise Events ein um sie zu gruppieren" auf der GeoMap |
| **`textures`** | SVG-Pattern fuer Daten-Visualisierung | EVALUIEREN | Alternative zu Farben fuer Accessibility (z.B. Streifen statt Farbe) |
| **`swoopyarrows`** | Annotation-Pfeile | EVALUIEREN | Spielbaum-Annotationen, Story-Telling |
| **`d3-interpolate-path`** | Pfade mit unterschiedlicher Punkt-Anzahl interpolieren | JA (v2) | Smooth Morph zwischen Laendergrenzen bei Cartogram-Transition |
| **`d3-cloud`** | Word Clouds | EVALUIEREN | Keyword-Visualisierung aus News-Analyse |
| **`crossfilter`** | Multivariater Datenexplorer | EVALUIEREN (v2) | Schnelles Filtern grosser Datensaetze (Events × Categories × Regions × Time) |

---

## 10. Feature → Module Matrix

> Jede Zeile = ein geplantes Feature. Jede Spalte = ein d3-Modul. ● = zwingend noetig, ○ = optional/hilfreich.

| Feature | Doc-Ref | scale | chromatic | interpolate | transition | timer | ease | hierarchy | shape | force | brush | axis | array | geo-voronoi | inertia | geo-polygon |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Severity Heatmap (refactor) | MapCanvas.tsx | ● | ● | ● | ○ | | | | | | | | | | | |
| Regime-State Layer | MASTERPLAN 35.3a | ● | ● | ● | ● | ● | ● | | | | | | | | | |
| Country Attractiveness | MASTERPLAN 35.13d | ● | ● | ● | ○ | | | | | | | | | | | |
| CBDC Status Choropleth | MASTERPLAN 35.13b | ● | ○ | | | | | | | | | | | | | |
| Financial Openness | MASTERPLAN 35.13b | ● | ● | ● | | | | | | | | | | | | |
| Currency Spread | REFERENCE Z.786 | ● | ● | ● | | | | | | | | | | | | |
| Basel Regime Traffic-Light | REFERENCE Z.857 | ● | | | | | | | | | | | | | | |
| Transmission Paths (animated) | AGENT_TOOLS 10.2 | ● | | ● | ● | ● | ● | | | | | | | | | ○ |
| Scenario Tree / Spielbaum | AGENT_TOOLS 10.1 | ● | ● | | ● | | ● | ● | ● | | | | | | | |
| Monte Carlo Histogram | AGENT_TOOLS 10.3 | ● | ● | | | | | | ● | | | ● | ● | | | |
| Timeline Slider (Zeitreise) | AGENT_TOOLS 10.2 | ● | | | ● | | | | | | ● | ● | | | | |
| DRS Cumulative Line | AGENT_ARCH 10.1 | ● | | | ○ | | | | ● | | | ● | | | | |
| Replicator Dynamics | GAME_THEORY 5.4 | ● | | | ● | | | | ● | | | ● | ● | | | |
| Sentiment Heatmap | AGENT_ARCH 10.1 | ● | ● | ● | | | | | | | | | | | | |
| Correlation Matrix | INDICATOR 5.P.1 | ● | ● | ● | | | | | | | | ● | | | | |
| Entity Graph | MASTERPLAN 35.8 | ● | | | ● | ● | | | ● | ● | | | | | | |
| Trade Corridors | MASTERPLAN 35.13c | ● | | ● | ● | ● | | | ● | | | | | | | ● |
| Liquidation Density | REFERENCE Z.1286 | ● | ● | ● | | | | | | | | | | | | |
| Globe Inertia | MapCanvas.tsx | | | | | | | | | | | | | | ● | |
| Nearest-Event Lookup | MapCanvas.tsx | | | | | | | | | | | | | ● | | |
| Canvas Hybrid Migration | MASTERPLAN 35.4 | | | ● | ● | ● | | | | | | | | | | |
| Auto-Rotation Fix | MapCanvas.tsx Z.196 | | | | | ● | | | | | | | | | | |

---

## 11. Stufenplan: Was wann installieren

### v1.1 -- Sofort (mit Canvas Hybrid Migration)

```
npm install d3-scale d3-scale-chromatic d3-interpolate    # Farblogik
npm install d3-transition d3-timer d3-ease                # Animation
npm install d3-inertia                                    # Globe UX
npm install d3-geo-voronoi                                # Spatial Lookup
```

**8 neue Packages.** Sofortiger Impact:
- Severity Heatmap refactored auf `scaleSequential` + `interpolateYlOrRd`
- Auto-Rotation auf `d3.timer()` (Frame-synchron)
- Globe-Inertia (physikalisches Drehen)
- Nearest-Event via Voronoi (kein Brute-Force)
- Canvas Hybrid Migration mit `d3-transition` fuer smooth Layer-Wechsel

### v1.5 -- Game Theory Mode + Timeline

```
npm install d3-hierarchy d3-shape                          # Spielbaum
npm install d3-brush d3-axis                               # Timeline Slider
npm install d3-array d3-time d3-time-format d3-format      # Data Utilities
npm install d3-legend                                      # Heatmap-Legenden
npm install d3-annotation                                  # Chart-Annotationen
```

**10 weitere Packages.** Ermoeglicht:
- Scenario Tree auf GeoMap + `/simulation` Page
- Timeline-Slider (Zeitreise-Modus)
- Monte Carlo Histogram
- DRS Cumulative Line
- Alle Achsen und Legenden

### v2 -- Entity Graph + Trade Corridors + Advanced

```
npm install d3-force                                       # Entity Graph
npm install d3-geo-polygon                                 # Spherical Clipping
npm install d3-contour                                     # Density Overlays
npm install d3-chord                                       # Trade Flow Chord (optional)
npm install d3-color                                       # Farbmanipulation
npm install d3-polygon                                     # Polygon-Berechnungen
npm install d3-quadtree                                    # 2D Spatial Index
npm install d3-delaunay                                    # 2D Voronoi (flat Charts)
npm install d3-dispatch                                    # Cross-Component Events
npm install d3-random                                      # Monte Carlo Frontend
npm install @deck.gl/core @deck.gl/react @deck.gl/layers   # WebGL Overlays
npm install supercluster                                   # Marker Clustering
```

**12+ weitere Packages.** Ermoeglicht:
- Entity Graph Visualization
- Trade Corridor PathLayer
- Liquidation Density Contours
- deck.gl High-Density Overlays
- Marker Clustering

### v3 -- Spezialisierungen

```
npm install d3-geo-projection                              # Extended Projections
npm install d3-topogram                                    # Area Cartograms (optional)
npm install d3-geo-scale-bar                               # Massstabsleiste
npm install d3-lasso                                       # Freihand-Selektion (optional)
npm install d3-interpolate-path                            # Path Morphing (optional)
```

**Nur was tatsaechlich gebraucht wird.** Evaluieren, nicht blind installieren.

---

## 12. Bundle-Size-Budget

> Alle Groessen: minified + gzipped (tree-shaken)

### v1.1 Additions

| Package | Size (gzip) | Anmerkung |
|---|---|---|
| `d3-scale` | ~8 KB | |
| `d3-scale-chromatic` | ~5 KB | |
| `d3-interpolate` | ~4 KB | |
| `d3-transition` | ~5 KB | |
| `d3-timer` | ~1 KB | |
| `d3-ease` | ~2 KB | |
| `d3-inertia` | ~1 KB | |
| `d3-geo-voronoi` | ~7 KB | |
| **Total v1.1** | **~33 KB** | Weniger als ein mittelgrosses Bild |

### v1.5 Additions

| Package | Size (gzip) |
|---|---|
| `d3-hierarchy` | ~4 KB |
| `d3-shape` | ~7 KB |
| `d3-brush` | ~5 KB |
| `d3-axis` | ~3 KB |
| `d3-array` | ~6 KB |
| `d3-time` + `d3-time-format` | ~5 KB |
| `d3-format` | ~3 KB |
| `d3-legend` | ~3 KB |
| `d3-annotation` | ~5 KB |
| **Total v1.5** | **~41 KB** |

### v2 Additions (groesster Sprung)

| Package | Size (gzip) |
|---|---|
| `d3-force` | ~6 KB |
| `d3-geo-polygon` | ~3 KB |
| `d3-contour` | ~4 KB |
| `d3-chord` | ~2 KB |
| Sonstige d3-Module | ~10 KB |
| `deck.gl` (Core + React + Layers) | **~150 KB** |
| `supercluster` | ~3 KB |
| **Total v2** | **~178 KB** |

**Gesamtbudget ueber alle Stufen:** ~252 KB gzipped fuer ALLE Visualization-Packages. Das ist weniger als `recharts` allein (~50 KB) plus ein paar Bilder.

---

## 13. Explizit NICHT eingeplant (mit Begruendung)

| Package/Library | Begruendung |
|---|---|
| **Leaflet** | Wir nutzen d3-geo, nicht Leaflet. Andere Architektur. |
| **react-simple-maps** | Basiert auf d3-geo, aber wir haben eigene MapCanvas. Wuerde kollidieren. |
| **datamaps** | Eigene Map-Library, nicht kompatibel mit unserem Globe. |
| **simple-map-d3** | Zu simpel, keine Globus-Unterstuetzung. |
| **MapLibre GL JS** | Erfordert Architektur-Wechsel weg von d3-geo Globe (MASTERPLAN Sek. 35.4). |
| **maplibre-rs** | Zu unreif (Stand 02/2026). Fehlende Features. WebGPU nicht ueberall. |
| **Hypersphere** | Nischen-Projekt, zu spezialisiert (LEO Satellites). |
| **plotly.js** | 3MB+ Bundle, wir haben d3 direkt. |
| **nivo** | React-Wrapper um d3, wuerden wir doppelt laden. |
| **d3plus** | Zu gross, wir nutzen d3-Module direkt. |
| **vega / vega-lite** | Evaluieren fuer v3 (Agent-generierte Charts), aber nicht jetzt. |
| **d3fc** | Candlestick/OHLC -- wir haben `lightweight-charts`. |
| **d3-composite-projections** | Nicht relevant fuer Global-Globe. |
| **d3-exploder** | Nicht fuer Globe geeignet. |
| **d3.geo2rect** | Nische, nicht fuer unseren Use Case. |
| **d3-fetch** | Wir nutzen TanStack Query. |
| **d3-dsv** | Parsing gehoert ins Backend (Go/Python), nicht Frontend. |

---

## 14. Querverweise

| Dokument | Relevante Sektion |
|---|---|
| [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) | Sek. 35.4 (Rendering-Architektur), Sek. 35.3a (Regime-States), Sek. 35.8 (Entity Graph), Sek. 35.13b-d (Layer-Definitionen) |
| [`AGENT_TOOLS.md`](./AGENT_TOOLS.md) | Sek. 10 (GeoMap Game Theory Simulation Mode -- Spielbaum, Transmission Paths, Timeline) |
| [`GAME_THEORY.md`](./GAME_THEORY.md) | Sek. 5.4 (Replicator Dynamics), Sek. 7 (Monte Carlo) |
| [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) | Sek. 10.1 (Multimodal Dashboard -- DRS Line, Sentiment Heatmap, MarkerTimeline) |
| [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) | Sek. 5.P.1 (Correlation Matrix, Portfolio Analytics) |
| [`MEMORY_ARCHITECTURE.md`](./MEMORY_ARCHITECTURE.md) | Sek. 5.2 M2 (Knowledge Graph -- Visualization mit d3-force) |
| [`FRONTEND_DESIGN_TOOLING.md`](./FRONTEND_DESIGN_TOOLING.md) | Design-to-Code Tools (programmatische Viz separat) |
| [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) | Sek. 13 (h3o Backend Spatial Queries ab v3) |
| [`ENTROPY_NOVELTY.md`](./ENTROPY_NOVELTY.md) | Trade Corridors (Sek. 6), Country Attractiveness |
| [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) | CoinGlass Liquidation Heatmap, Basel Regime, Currency Spread |
| [D3.js API](https://d3js.org/api) | Offizielle Dokumentation |
| [D3 Graph Gallery](https://d3-graph-gallery.com/) | Chart-Typen mit Beispielcode |
| [Observable D3 Gallery](https://observablehq.com/@d3/gallery) | Interaktive Beispiele |
| [Awesome D3](https://project-awesome.org/wbkd/awesome-d3) | Kuratierte Extensions |
