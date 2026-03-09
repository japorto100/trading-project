# MASTER-MASTER ARCHITECTURE 2026

> Stand: 06. März 2026  
> Status: Konsolidierte Master-Synthese (Draft v1)  
> Zweck: Normatives Hauptdokument für Zielarchitektur, Verantwortungsgrenzen, Wissensmodell, Agentik, Retrieval, GeoMap, Simulation, Runtime und Evolutionspfad.  
> Basis: interne Fach-MDs + die expliziten Architekturentscheidungen aus unserem Gespräch vom 06. März 2026.  
> Arbeitsmodus: bewusst reich an Kontext. Nicht nur zusammenfassen, sondern widerspruchsfrei verdichten.

---

## 0. Leseanweisung und Status

Dieses Dokument ist **kein bloßer Überblick**. Es ist der Versuch, aus einer großen Menge von Fachdokumenten und aus der Diskussion in diesem Chat eine **einzige belastbare Architekturformel** zu machen.

Es ersetzt **nicht** jede Spezifikation. Stattdessen übernimmt es vier Rollen gleichzeitig:

1. **Normativer Kern**: Was gilt systemweit als Zielbild?
2. **Schnittstellendokument**: Welche Grenzen zwischen Go, Python, Rust, Frontend, KG, Retrieval und Simulation sind verbindlich?
3. **Entscheidungsdokument**: Welche Punkte wurden im Gespräch als zusätzliche Architekturentscheidungen herausgearbeitet?
4. **Quellenlandkarte**: Welche internen MDs und welche externen Primärquellen speisen welche Teile der Architektur?

Wichtig: Dieses Dokument behandelt nicht nur die hochgeladenen Specs. Es nimmt auch die goldwerten Punkte aus dem Gespräch bewusst auf, insbesondere:

- explizite Search-Layer für Agenten (`BFS`, `Tree of Thoughts`, `Beam Search`, `MCTS`)
- OpenSandbox als Ausführungs- und Isolationsschicht
- GeoMap und Simulation als **gekoppelten Dual-Modus**
- Trennung zwischen **kanonischem Wissen**, **Belief-State**, **Claim/Evidence**, **User Overlay** und **Scenario Branching**
- differenzierte Rolle von Websearch im Vergleich zu kuratierten und strukturierten Quellen
- praktische Sprachgrenzen zwischen **Go**, **Python**, **Rust** und **Frontend/TypeScript**
- Tool Search, Planner/Executor/Replanner, Capability Tiers und Agenten-Vertragsdenken

Damit ist dieses Dokument **mehr** als eine Dateisynthese: Es ist die systematische Fassung der Architektur, die wir im Dialog herausgearbeitet haben.

**Primärquellen:** `ARCHITECTURE.md`, `EXECUTION_PLAN.md`, `API_CONTRACTS.md`, `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `MEMORY_ARCHITECTURE.md`, `AGENT_ARCHITECTURE.md`, `GAME_THEORY.md`, `GEOPOLITICAL_MAP_MASTERPLAN.md`.

## 1. Executive Summary

Das Zielsystem ist **keine gewöhnliche Trading-App** und auch **keine gewöhnliche Research-App**. Es ist näher an einem **personal intelligence and scenario operating system** mit drei miteinander verschränkten Modi:

- **Beobachten**: strukturierte und unstrukturierte Quellen, GeoMap, Märkte, Makro, Narrative, Widersprüche
- **Verstehen**: KG, Retrieval, Belief-State, Verifikation, Agenten, Kontext, Domainwissen
- **Erkunden**: Szenarien, Simulation, Spieltheorie, Control Theory, Gegenfakten, Pfade, GeoMap-Overlays

Die zentrale Architekturformel lautet:

```text
Frontend / Local User Intelligence Workspace
        ↓
Go = Frontdoor, Policy, Contracts, Audit, Orchestration, Source Routing
        ↓
Python = LLM, Retrieval Orchestration, Verification, Simulation Logic, ML/Compute
        ↓
Rust = Hot Paths, graph/spatial kernels, numerical acceleration, MC/ODE backends
```

Parallel dazu existiert eine **geschichtete Wissensarchitektur**:

```text
Canonical Domain Graph (backend truth)
+ Fast Event Graph / probabilistic live layer
+ Claim / Evidence / Stance layer
+ User Overlay Graph (private, local-first)
+ Personal Semantic Memory / episodic memory
+ Scenario / Simulation Branches (ephemeral by default)
```

Die wichtigste normative Aussage dieses Dokuments ist:

> **Nicht** Fakten, Hypothesen, persönliche Overlays und Simulationspfade in einen Brei zusammenführen, sondern sie über **deterministische Contracts** sauber entkoppeln und erst auf Query-, Belief- und View-Ebene zusammensetzen.

Daraus folgen die wichtigsten Entscheidungen:

- **Go bleibt Control Plane** und Policy-Owner.
- **Python bleibt Modellierungs- und Agentik-Zentrum**.
- **Rust wird gezielt für Hot Paths eingesetzt**, nicht als vorzeitige Gesamtersatzsprache.
- **Simulation ist eine eigene Engine**, nicht bloß ein Kartenwidget.
- **GeoMap ist die räumliche Oberfläche** für bestätigte Lage, Unsicherheit und Szenarien.
- **Websearch ist Discovery- und Gap-Fill-Layer**, nicht die Wahrheitsschicht.
- **Search über Reasoning-Pfade** wird, wo nötig, explizit gebaut (Beam/MCTS etc.) statt implizit dem LLM überlassen.

**Primärquellen:** `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `ARCHITECTURE.md`, `EXECUTION_PLAN.md`, `UNIFIED_INGESTION_LAYER.md`.

## 2. Was das System ist – und was es ausdrücklich nicht ist

### 2.1 Produktverständnis
Das System ist langfristig ein zusammengesetztes Werkzeug für:

- Markt- und Portfolio-Intelligence
- geopolitische und makroökonomische Lagebilder
- Claim Verification und Widerspruchsauflösung
- Wissensakkumulation über Zeit
- personalisierte Hypothesenbildung
- Szenario- und Simulationsarbeit

Damit ist es weder nur:

- ein Broker-Frontend
- ein Dashboard
- ein RAG-Chat
- noch ein LLM-Agent mit zufälligen Tool Calls

Es ist näher an einer Verbindung aus:

- Research Operating System
- Analyst Workbench
- Geo-spatial Intelligence Surface
- Scenario Laboratory
- Personal Memory + Overlay Layer

### 2.2 Was ausdrücklich vermieden werden soll
Das System soll **nicht** in diese Fehlformen kippen:

1. **KG als alles fressender Monolith**
2. **Vector DB als Ersatz für Struktur, Kausalität und Provenance**
3. **Websearch als pseudo-kanonische Wahrheit**
4. **Agenten, die ohne Capability-, Write- und Trust-Verträge arbeiten**
5. **Simulation, die faktisches Wissen überschreibt**
6. **GeoMap, die alles gleichzeitig sein will und dadurch unklar wird**
7. **vorzeitige Full-Rewrites in Rust oder zusätzliche Spracheinführungen ohne Not**

### 2.3 Gesprächsbasierter Zusatz
Im Gespräch wurde klarer als in vielen einzelnen Specs, dass das System eine **dreifache epistemische Trennung** braucht:

- `truth`: was kanonisch oder hochverifiziert ist
- `belief`: was aktuell plausibel, aber nicht abschließend ist
- `scenario`: was wir hypothetisch simulieren

Diese Dreiteilung muss in **Datenmodell, UI, Agentenverhalten und API-Verträgen** sichtbar werden.

**Primärquellen:** `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`, `GEOPOLITICAL_MAP_MASTERPLAN.md`, `GAME_THEORY.md`, `MEMORY_ARCHITECTURE.md`.

### 2.4 Externer Produktbenchmark: `MRKTEDGE.AI` als Referenz, nicht als Blaupause
Die ausgewerteten `MRKTEDGE.AI`-Research-Dokumente sind für dieses System **nicht** deshalb relevant, weil deren exakter Stack kopiert werden sollte, sondern weil sie mehrere produktnahe Muster sichtbar machen, die zu unserer Zielarchitektur passen.

Normativ wichtig sind aus dem MRKTEDGE-Vergleich **nicht nur fünf Schlagworte**, sondern ein zusammenhängender Produktableitungsblock:

1. **Research Home vor dem Deep Workspace**  
   Die primäre Einstiegsfläche sollte eine entscheidungsorientierte Research-/Decision-Surface sein und nicht sofort die tiefste Candle-/Trading-Ansicht. Der Trading-Workspace bleibt wichtig, ist aber nicht die einzige oder erste Ausdrucksform des Produkts.

2. **Economic Calendar als Event-Intelligence-Layer**  
   Ein Makro-Kalender ist nur dann architektonisch interessant, wenn er nicht bloß Termine und Forecasts zeigt, sondern Event-Kontext, Überraschungszonen, betroffene Assets, historische Reaktionsmuster und vorbereitete Drilldowns in Chart, News, GeoMap und Portfolio verbindet.

3. **Volatility Tracker generisch statt als Einzelfeature**  
   Der interessante Teil eines "Trump Trackers" ist nicht die Person selbst, sondern das Muster: actor-/narrative-/event-getriebene Volatilität als wiederverwendbares Modul mit Schedule, Headlines, Asset-Auswirkung, Szenarien und Playbook-Logik.

4. **PWA-first bleibt für die frühe Produktphase plausibel**  
   Für ein browser-first System mit Research, Alerts, Realtime und schneller Iteration ist PWA-first eine sinnvolle Default-Entscheidung. Native Apps werden erst dann zwingend, wenn mobile OS-Integrationen, Push-Zuverlässigkeit oder Background-Jobs den Browser spürbar überfordern.

5. **MarTech-/Content-/Video-Stacks sind Randarchitektur, nicht Kernsystem**  
   CMS, Produkt-Analytics, Session Replay, Video-Delivery oder Payments können wichtig werden, gehören aber nicht in den epistemischen oder operativen Kern. Sie müssen als austauschbare Peripherie behandelt werden und dürfen weder Truth-, Belief- noch Scenario-Layer strukturieren.

6. **AI-Governance muss operativer werden als im Benchmark**  
   Für unser System ist nicht nur relevant, *dass* PII, Logging, Retention und Explainability wichtig sind, sondern dass dafür explizite Policies, Retentions, Redaction-Regeln, Provenance-Verträge und Replay-/Telemetry-Grenzen bestehen.

7. **Hosting- und Vendor-Entscheidungen bleiben Deployment-Fragen**  
   Vercel, DigitalOcean, Cloudflare, Sanity, PostHog, Stripe-Alternativen oder Cloudflare Stream dürfen nicht als Architekturzentrum fehlgedeutet werden. Sie bleiben austauschbare Betriebs- oder Produktperipherie mit klarer Policy-, Privacy- und Boundary-Steuerung.

### 2.5 Konkrete Ableitungen, die beim späteren Verteilen **nicht vergessen** werden dürfen
Aus dem Vergleich mit `MRKTEDGE.AI` sollen mindestens die folgenden fachlichen und architektonischen Punkte in die Ziel-Dokumente zurückfließen:

- **Macro Event Intelligence statt bloßem Kalender**
  - `Event` als produktisiertes Kernobjekt
  - Erwartungsband / Surprise-Zonen
  - betroffene Assets
  - historische Reaktionsmuster
  - vorbereitete Szenarien / Playbooks
  - Live-Headline-, Geo- und Portfolio-Kontext
  - "`What matters now?`"-Scoring

- **Research-/Decision-Home als Primärsurface**
  - `/` als Research Home / Decision Dashboard
  - `/trade` oder `/workspace` als tiefer Power-User-Workspace
  - reibungsfreie Drilldowns:
    - Asset -> Chart
    - Event -> Event Detail / Playbook / betroffene Assets
    - Headline -> Candle Attribution / Geo / affected symbols

- **PWA als frühes Delivery-Modell**
  - installable browser-first surface
  - Notification-/Alert-Pfad
  - klare Offline-/Cache-Grenzen
  - kein vorschneller nativer Split

- **Analytics / Feature Flags / Session Replay nur kontrolliert**
  - privacy-first analytics bevorzugen
  - Session Replay nur mit Redaction, Consent und sensiblen UI-Grenzen
  - Feature Flags als separater Capability- und Rollout-Baustein

- **CMS / Content / Video nur als Peripherie**
  - CMS nur für Blog, Research, Release Notes, Education, Marketing
  - Video nur für Demos, Onboarding, Academy, nicht für Kernlogik
  - Payment nur dann früh gewichten, wenn Subscription/Billing real nahe ist

- **Political / Narrative / Event Volatility Tracker als generisches Modul**
  - nicht als einmalige "`Trump Tracker`"-Sonderlösung
  - wiederverwendbar für politische Akteure, Zentralbanken, OPEC, Sanktionen, Wahlen und narrative Schocks

- **AI-Governance explizit und technisch**
  - Prompt-Logging-Policy
  - Prompt-/Output-Redaction
  - Output-Retention
  - Provenance-/Citation-Contract
  - Explainability-Mechanik
  - Replay-/Telemetry-Privacy

### 2.6 Empfohlene Ziel-Dokumente für die spätere Verteilung
Die MRKTEDGE-Ableitungen sollten später **nicht** in einem einzigen Benchmark-Dokument verbleiben, sondern in bestehende Fach- und Arbeitsdokumente eingehen:

- `docs/specs/FRONTEND_ARCHITECTURE.md`
  - Research Home vs. Trading Workspace
  - Navigations- und Drilldown-Logik
  - Event-Detail-Surface
  - PWA-Surface, Installability, Notification UX

- `docs/specs/EXECUTION_PLAN.md`
  - Priorisierung von Research Home, Event Intelligence, Volatility Tracker, PWA
  - Phase-Zuordnung
  - explizit: was jetzt, was später, was erst bei echter Produktreife

- `docs/specs/ARCHITECTURE.md`
  - kurze normative Produktformel:
    - Research Operating System mit Trading als Capability
    - Event Intelligence als First-Class Surface
    - PWA-first

- `docs/UNIFIED_INGESTION_LAYER.md`
  - Event-Ingestion
  - Macro-/Central-Bank-/Political-Event-Pfade
  - Linking von Headlines, Kalendern, Assets, Geo und Alerts
  - Candidate-/Promotion-Grenzen für Event-bezogene Daten

- `docs/specs/API_CONTRACTS.md`
  - `Event`, `EventImpact`, `Playbook`, `ActorTracker`, `VolatilitySignal`
  - Drilldown- und scoring-relevante Response-Formen

- `docs/specs/UIL_ROUTE_MATRIX.md`
  - Request-/Flow-Wege für Event Intelligence, Alerts, Research Home und Drilldowns
  - keine unkontrollierten Browser-zu-Python-Abkürzungen

- `docs/GO_GATEWAY.md`
  - Gateway-Rolle für Event Routing, scoring orchestration, alert fan-out, SSE/WebSocket-Anbindung

- `docs/specs/AUTH_SECURITY.md`
  - privacy-first analytics
  - Session Replay nur mit Consent/Redaction
  - Prompt-/Output-Logging-Regeln
  - AI-output retention
  - provenance / explainability / telemetry privacy

- `docs/AGENT_ARCHITECTURE.md`
  - agentische Nutzung von Event Intelligence
  - Playbook-/Context-Assembly für Macro Events
  - explainability / provenance / confidence output behavior

- `docs/AGENT_TOOLS.md`
  - keine stillschweigende PII-Leckage in prompts oder tool outputs
  - logging/redaction/replay boundaries
  - Tool-Zugriffe auf Event-, News- und Volatility-Module

- `docs/CLAIM_VERIFICATION_ARCHITECTURE.md`
  - Verifikation von event- und actor-getriebenen Behauptungen
  - Confidence-/Belief-Logik für narrative shocks und politische Aussagen

- `docs/GEOPOLITICAL_MAP_MASTERPLAN.md`
  - Geo-Rückprojektion von Event- und Actor-Volatilität
  - Verknüpfung von Headlines, Regionen, Sanktionen, Konflikten, Märkten

- `docs/GAME_THEORY.md`
  - Szenario- und Gegenreaktionslogik für Actor-/Narrative-/Policy-Schocks

- `docs/specs/CAPABILITY_REGISTRY.md`
  - Event Intelligence, Volatility Tracker, Analytics, Feature Flags, Replay als getrennte Capabilities und Risk Tiers

- `docs/specs/ROLLOUT_GATES.md`
  - Rollout-Gates für Analytics, Replay, Alerts, PWA-Notifications, Volatility-Signale

- `docs/specs/PAYMENT_ADAPTER.md`
  - nur falls Billing real wird:
    - EU-/CH-Optionen
    - Stripe vs. Payrexx / Datatrans / Mollie / Adyen
  - keine vorzeitige Multi-PSP-Orchestration

- `docs/README.md`
  - später kurzer Verweis auf Event Intelligence / Research Home / Governance-Dokumente

Für `tradeview-fusion` folgt daraus: `MRKTEDGE.AI` ist vor allem ein **Produkt-, UX- und Packaging-Benchmark**. Die eigentliche Differenzierung dieses Systems bleibt stärker: gekoppelte Wissensräume, Geo-/Scenario-Integration, Claim/Evidence/Belief, Overlay, Agenten mit Capability-Grenzen und eine explizite Trennung von Wahrheit, Plausibilität und Simulation.

Diese Ableitungen sind zunächst bewusst im Master-Master gesammelt. Später werden sie in die operativen Arbeitsdokumente zurückverteilt, wobei die obige Ziel-Liste als Mindest-Checkliste gilt.

**Primärquellen:** `MRKTEDGE.AI-deep research chatgpt.md`, `MRKTEDGE.AI-deep research chatgptp2.md`, `FRONTEND_ARCHITECTURE.md`, `EXECUTION_PLAN.md`, `AUTH_SECURITY.md`, `UNIFIED_INGESTION_LAYER.md`, `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`.

## 3. Architekturformel des Gesamtsystems

### 3.1 Das grobe Schichtenmodell
Die Zielarchitektur besteht aus neun Schichten:

1. **User Interface / Workspace Layer**
2. **Go Gateway / Control Plane**
3. **Async Source & Ingestion Plane**
4. **Knowledge & Memory Plane**
5. **Retrieval & Discovery Plane**
6. **Agent & Search Plane**
7. **Simulation & Scenario Plane**
8. **Compute Acceleration Plane**
9. **Observability / Security / Operational Plane**

### 3.2 Normative Verteilung
#### Frontend / TypeScript
- UI, View State, local-first User Intelligence, personal overlays, review flows, rich interactions
- **kein** direkter externer Truth Fetch in produktiven Pfaden
- **kein** beliebiger Fach- oder Merge-Owner

#### Go
- API Frontdoor
- Contract Enforcement
- Authentication / Authorization boundary
- Rate limits, quotas, retries, connector routing
- orchestration and durable job control
- streaming / event bridge
- policy owner for domain writes and promotion gates

#### Python
- LLM orchestration
- extraction, classification, verification
- agent execution and planning
- simulation logic, probabilistic reasoning, control/game models
- heavy semantic and model-centric computation

#### Rust
- hot paths only
- graph kernels, spatial kernels, ODEs, Monte Carlo, acceleration
- optionally standalone services where latency or throughput justify it

### 3.3 Why this split remains correct
Der Split ist nicht dogmatisch, sondern folgt dem realen Arbeitsprofil:

- **Go** ist stark in Stabilität, IO, Contracts, Streaming, concurrency und service composition
- **Python** ist stark in wissenschaftlicher Modellierung, LLM/ML-Ökosystem, agentischer Orchestrierung und schneller Iteration
- **Rust** ist stark in deterministischer Performance, Memory Safety und compute-heavy kernels
- **TypeScript/React** ist stark in UX, overlays, reactive views und user-owned local intelligence

### 3.4 Gesprächsbasierter Zusatz
Im Chat wurde die Formel zugespitzt:

> **Go transportiert, schützt und koordiniert. Python denkt und modelliert. Rust beschleunigt. Das Frontend zeigt und personalisiert.**

Diese Formulierung ist nützlich, weil sie die Architektur nicht als Bibliotheksliste, sondern als **Betriebslogik** beschreibt.

**Primärquellen:** `ARCHITECTURE.md`, `API_CONTRACTS.md`, `UNIFIED_INGESTION_LAYER.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`, `execution_mini_plan_3.md`.

## 4. Verbindliche Grundprinzipien

- **Contract-first:** Grenzen zwischen Schichten werden als Contracts verstanden: APIs, typed responses, capability tiers, merge contracts, source confidence, agent write rules.
- **Overlay-first statt Datenkopie:** Personalisierung, private Thesen und lokale Relevanz werden als Overlay modelliert, nicht durch physisches Vermischen mit globalem Domainwissen.
- **Truth / Belief / Scenario sauber trennen:** Kanonische Fakten, unsichere Hypothesen und Simulationspfade haben unterschiedlichen epistemischen Status und dürfen nicht im selben Typ untergehen.
- **Deterministische Promotion Gates:** Nichts wird allein dadurch wahr, dass es gefunden, generiert oder simuliert wurde. Jede Promotion braucht Regeln, Review oder ausreichend starke Evidenz.
- **Read-mostly agents:** Agenten lesen standardmäßig viel mehr, als sie schreiben dürfen. Schreibrechte sind abgestuft und stark eingeschränkt.
- **Human-in-the-loop an neuralgischen Stellen:** Review, contradiction resolution, high-impact promotions und kritische Simulationseinträge sollen prüfbar bleiben.
- **Asynchronität bewusst einsetzen:** Nicht jeder kluge Prozess muss synchron im UI passieren. Lange Läufe, Simulationen, Retrieval-Jobs und Reprocessing gehören in einen asynchronen Pfad.
- **Local-first, aber nicht epistemisch anarchisch:** Lokale Overlays sind gewollt, aber nicht frei von Vertragslogik. Private Daten sind privat, aber die Merge-Regeln bleiben systemisch bestimmt.

### 4.1 Dinge, die aus dem Gespräch zusätzlich normativ werden
- Search-Strategien (`Beam`, `MCTS`, ggf. `BFS`) sind **eigene Architekturbausteine**, keine bloße Prompting-Spielerei.
- OpenSandbox oder äquivalente isolierte Laufzeit ist **Teil der Agentenarchitektur**, nicht nur DevTooling.
- GeoMap und Simulation werden **konzeptionell gekoppelt, aber technisch getrennt**.
- Retrieval wird als **eigene Säule** geführt und darf nicht heimlich die ganze Architektur dominieren.

**Primärquellen:** `ARCHITECTURE.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`, `ERRORS.md`.

## 5. Wissensraum: Canonical Graph, Event Graph, Claim/Evidence, Overlay und Memory

### 5.1 Der mehrschichtige Wissensraum
Das System hat **nicht einen KG**, sondern einen geschichteten Wissensraum:

1. **Global Canonical Graph (Backend)** – stabile Entitäten, Beziehungen, Ontologie, historische Struktur
2. **Fast Event Graph (Backend)** – zeitkritische, probabilistische, TTL- und decay-sensitive Live-Schicht
3. **Claim / Evidence / Stance Layer** – Aussagen, Gegenbelege, Quellen, Confidence, Widersprüche
4. **User Overlay Graph (Frontend lokal / hybrid)** – private Notizen, Gewichtungen, Watchlists, Hypothesen, persönliche Relevanz
5. **Personal Semantic Memory** – Retrieval-fähiger Recall-Layer für user-owned Research-Artefakte
6. **Episodic Memory** – vergangene Agentenläufe, Simulationen, Bewertungen, Outcomes
7. **Scenario Branch Layer** – ephemere, hypothetische Simulationen und Counterfactuals

### 5.2 Warum ein einziger KG nicht genügt
Ein einheitlicher Graph würde die folgenden Dinge schlecht auseinanderhalten:

- historisch stabile Struktur vs. frische Live-Hypothesen
- persönliche These vs. öffentliche Evidenz
- bestätigter Fakt vs. laufende Widerspruchslage
- echte Welt vs. simulierte Branches

### 5.3 Merge auf Query-Ebene, nicht als Storage-Fusion
Das System soll **nicht** globalen KG und User-KG physisch fusionieren. Stattdessen:

- bleibt der Backend-KG kanonisch
- bleibt der User Overlay privat und lokal-first
- erfolgt die Zusammenführung bei Leseanfragen durch deterministische Merge-Regeln
- sind IDs und Namespaces die Brücken, nicht freie Textähnlichkeiten

### 5.4 Claim / Evidence / Stance ist kein Nebenthema
Eine der wichtigsten Korrekturen aus `MASTER_ARCHITECTURE_SYNTHESIS_2026.md` und `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` ist, dass **Glauben und Evidenz nicht als lose Edge-Eigenschaften verschwinden dürfen**. Stattdessen braucht das System explizite Typen für:

- Claim
- Evidence
- Source
- Stance
- Confidence / uncertainty
- contradiction class
- resolution / review state

### 5.5 Memory-Schichten
In der Memory-Architektur sind mindestens fünf Ebenen wichtig:

- **M1 Working / shared cache**
- **M2 Semantic memory / KG**
- **M3 Episodic memory**
- **M4 Vector / semantic retrieval memory**
- **M5 Working context assembly**

Das ist wichtig, weil Simulation, Agenten und GeoMap jeweils auf **andere Kombinationen** dieser Ebenen zugreifen.

### 5.6 Gesprächsbasierte Schärfung
Im Gespräch wurde eine sehr wichtige Regel klar formuliert:

> **Weltwissen persistent. Simulation spekulativ.**

Daraus folgt:

- keine globale KG-Mutation direkt aus Websearch
- keine globale KG-Mutation direkt aus Simulation
- Promotion in M2/CG nur über Evidenz, Review oder starke strukturierte Regeln

**Primärquellen:** `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`, `MEMORY_ARCHITECTURE.md`, `KG_ONTOLOGY.md`, `CLAIM_VERIFICATION_ARCHITECTURE.md`.

## 6. Truth, Belief, Confidence und Promotion Gates

### 6.1 Drei epistemische Ebenen
Jede relevante Aussage im System sollte – explizit oder implizit – einer dieser Ebenen zugeordnet werden:

- **Truth**: hochverifizierte oder definitorisch kanonische Information
- **Belief**: aktuelle Einschätzung mit Unsicherheit, ggf. konkurrierenden Deutungen
- **Scenario**: hypothetische Weltentwicklung unter Annahmen

### 6.2 Confidence ist nicht gleich Wahrheit
Ein hoher Confidence-Score macht etwas **nicht automatisch kanonisch**. Confidence ist nur ein Maß für die gegenwärtige Sicherheit unter den aktuellen Inputs. Truth erfordert zusätzlich:

- geeignete Quellengüte
- Widerspruchsprüfung
- konsistente ID- und Domain-Einordnung
- eventuell menschliche Bestätigung

### 6.3 Promotion Gates
Promotion Gates sind Regeln, die entscheiden, ob ein Objekt:

- nur Kandidat bleibt
- in eine Review Queue geht
- in den Belief-State einfließt
- in die Event-/Signal-Schicht gelangt
- in den Canonical Graph promoted wird

### 6.4 Warum diese Gates systemisch wichtig sind
Ohne Promotion Gates passiert fast zwangsläufig eines von zwei Problemen:

1. **zu aggressives Schreiben**: der KG wird mit halbgarer Information verschmutzt
2. **zu defensives Schreiben**: das System lernt nie und bleibt blind für neue Zusammenhänge

Die Gates sind deshalb die Mitte zwischen völliger Beliebigkeit und völliger Starre.

### 6.5 Gesprächsbasierte Klarstellung
Websearch, Agenten und Simulation sind **Input- und Verarbeitungsschichten**, nicht selbst die letzte Wahrheitsinstanz. Diese Einsicht war ein zentraler Punkt des Gesprächs und gehört als Grundsatz in jede spätere Implementation.

**Primärquellen:** `CLAIM_VERIFICATION_ARCHITECTURE.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `API_CONTRACTS.md`, `UNIFIED_INGESTION_LAYER.md`, `REFERENCE_SOURCE_STATUS.md`.

## 7. Sprachgrenzen und Verantwortlichkeiten: Go, Python, Rust, Frontend

### 7.1 Go
Go ist die **stabile Frontdoor** des Systems. Seine Verantwortung ist nicht primär mathematische Raffinesse, sondern systemische Ordnung:

- Gateway und Contract-Grenze
- Quotas, retries, backpressure, connector routing
- AuthN/AuthZ und policy enforcement
- request correlation, audit trails, rate limiting
- orchestration of sync/async flows
- streaming, event fan-out, job control
- canonical write policy

### 7.2 Python
Python ist die **intelligente mittlere Schicht**:

- extraction and classification
- retrieval orchestration
- agent execution
- game theory / control theory modelling
- ML, regime detection, semantic work
- simulation logic, planners, probabilistic loops

### 7.3 Rust
Rust ist kein Ersatz für das gesamte System, sondern der **gezielte Performance-Layer**. Rust sollte dort eingesetzt werden, wo klare Vorteile entstehen:

- ODEs / differential dynamics
- Monte Carlo / rollout acceleration
- graph kernels
- spatial kernels and H3-style aggregation
- compute-heavy portfolio or indicator components

### 7.4 Frontend / TypeScript
Das Frontend ist mehr als Darstellung, aber weniger als Wahrheitsschicht. Es besitzt:

- rich interaction and UI state
- review flows
- local-first overlays
- editing surfaces
- per-user semantic and contextual affordances

Es besitzt **nicht**:

- endgültige Provider-Truth
- freie Domain-Mutation
- ungesteuerte exogene Fetch-Logik im Produktionspfad

### 7.5 Gesprächsbasierte Schärfung
Der Chat hat diese Arbeitsteilung praktisch zuspitzend beschrieben:

- **Go transportiert, schützt, ordnet.**
- **Python modelliert, plant, verifiziert, simuliert.**
- **Rust beschleunigt punktuell.**
- **Das Frontend personalisiert und zeigt.**

Diese Formel ist im Master-Master bewusst übernommen.

**Primärquellen:** `ARCHITECTURE.md`, `API_CONTRACTS.md`, `UNIFIED_INGESTION_LAYER.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`, `execution_mini_plan_3.md`, `FRONTEND_ARCHITECTURE.md`.

## 8. Sync Path, Async Path und Ereignisfluss

### 8.1 Sync Path
Der sync path ist der direkte, user-facing Pfad:

Frontend → Go Gateway → ggf. Python/Rust Services → Response/Stream

Er ist geeignet für:

- Abfragen mit engem Latenzbudget
- UI-nahe Mutationen mit klarer Vertragslogik
- kurze Simulation- oder Search-Starts
- read models und projections

### 8.2 Async Path
Der async path dient für:

- Ingestion
- Reprocessing
- Background verification
- Source crawling / expansion
- heavy simulation jobs
- long-running agent runs
- Monte Carlo, scenario sweeps, backtests

### 8.3 Was nicht verwechselt werden darf
Es ist ein häufiger Architekturfehler, kluge Dinge in den sync path zu zwingen, nur weil sie dem Nutzer nahe erscheinen. Der Chat hat gerade bei Simulation und agentischer Recherche deutlich gemacht, dass:

- der **Start** eines Prozesses synchron sein kann
- der **Lauf** aber oft asynchron sein sollte
- der **Output** dann wieder synchron oder streamend in die UI zurückgespielt wird

### 8.4 Streaming
Streaming ist wichtig für:

- geopol. event feeds
- market/quote updates
- agent state observation
- simulation progress
- review/contradiction updates

### 8.5 JetStream / event backbone
Wenn eine belastbare interne Ereignis- und Job-Backbone gebraucht wird, ist NATS JetStream plausibel, weil es Persistenz, Replay und lockere zeitliche Kopplung ermöglicht. Das macht es besonders passend für Ingestion, background processing und reproduzierbare jobartige Abläufe.

**Primärquellen:** `ARCHITECTURE.md`, `EXECUTION_PLAN.md`, `API_CONTRACTS.md`, `execution_mini_plan_3.md`.  
**Externe Validierung:** [WEB-14], [WEB-15].

## 9. Source Fabric: Provider, Quellengüte, Websearch und Confidence

### 9.1 Es gibt nicht 'die Quelle', sondern ein Source Fabric
Das System lebt von einem Quellennetz aus:

- strukturierten APIs
- offiziellen Gov-/Regulator-/Exchange-Quellen
- kuratierten News-/Research-Feeds
- user-supplied documents
- offenen Webquellen
- historischen internen Artefakten

### 9.2 Normative Vertrauenshierarchie
Als Grundregel gilt:

1. **offizielle strukturierte Quellen / eigene stabile Connectoren**
2. **vertrauenswürdige kuratierte Publikationen / große Primärdomänen**
3. **spezialisierte Fachquellen / Think Tanks / Research**
4. **Websearch-discovered sources**
5. **soziale / rumor-nahe Rohquellen**

### 9.3 Die Rolle von Websearch
Im Gespräch wurde die Rolle von Websearch bewusst **niedriger, aber nicht klein** positioniert.

Websearch dient als:

- **Discovery Layer**
- **Gap Filler**
- **Freshness Probe**
- **Coverage Expander**
- **Candidate Evidence Generator**

Websearch ist **nicht**:

- direkter KG-Mutator
- automatisch gleichwertig mit kuratierten Quellen
- Ersatz für spezialisierte Provider
- Wahrheitsschicht

### 9.4 Warum Websearch trotzdem zentral bleibt
Gerade in geopolitischen, makroökonomischen und emergenten Lagen sind feste Quellenlisten selten vollständig. Websearch erweitert den Suchraum und hilft, lokale, neue oder anders gerahmte Quellen zu entdecken.

### 9.5 Federated Retrieval statt Monokultur
Retrieval soll nicht an einen einzigen Suchanbieter oder einen einzigen Store gekoppelt werden. Stattdessen:

- Provider abstrahieren
- Domain- oder use-case-spezifische Retrieval-Routen definieren
- Open Web, curated indices und interne Stores kombinieren
- Confidence und provenance nicht verlieren

### 9.6 Gesprächsbasierter Zusatz
Der Chat hat klargestellt, dass Websearch im Simulationskontext besonders vorsichtig zu behandeln ist: Es erweitert den Denkraum, senkt aber anfangs eher die Gewissheit, statt sie automatisch zu erhöhen.

**Primärquellen:** `UNIFIED_INGESTION_LAYER.md`, `REFERENCE_SOURCE_STATUS.md`, `PROVIDER_LIMITS.md`, `ai_retrieval_knowledge_infra_full.md`, `CLAIM_VERIFICATION_ARCHITECTURE.md`.  
**Externe Validierung:** [WEB-05].

## 10. Retrieval- und Discovery-Architektur

### 10.1 Retrieval ist eine eigene Architektur-Säule
Die Retrieval-Schicht darf nicht als bloßes 'RAG-Addon' missverstanden werden. Sie ist eigene Infrastruktur für:

- Auffinden von Informationen
- Zusammenstellen von Evidenzpaketen
- Abdecken thematischer Lücken
- ähnliche Fälle / analoge Situationen
- laufende Beobachtung offener Themen

### 10.2 Welche Retrieval-Arten das System braucht
- **structured retrieval**: APIs, relational/time-series stores, typed endpoints
- **graph retrieval**: Kausalität, Ontologie, provenanznahe Relation
- **vector retrieval**: Recall, Similarität, semantische Nähe
- **document retrieval**: PDFs, Reports, long-form content
- **open-web retrieval**: Discovery und Freshness
- **event retrieval**: schnelle candidate/event layer queries

### 10.3 Warum Vector nicht genug ist
Vector Search ist nützlich für Recall und Analogien, aber unzureichend für:

- exakte Relationen
- Gegensatzpaare
- Claim/Evidence/Stance
- kausale Ketten
- Simulation-Branching
- ontologische Präzision

### 10.4 Warum KG nicht genug ist
Ein KG allein ist ebenfalls unzureichend für:

- freiformige semantische Wiederfindung
- unstrukturierte Langtexte
- fuzzy similarity
- schnelle offene Exploration

### 10.5 Normative Schlussfolgerung
Das System braucht **federated retrieval** mit einer kontrollierten Mischung aus:

- KG
- vector search
- structured APIs
- source packs / curated stores
- open-web discovery

### 10.6 Kritische Einordnung des Retrieval-Fachdokuments
`ai_retrieval_knowledge_infra_full.md` ist wertvoll, solange Retrieval **nicht** zum heimlichen Zentrum des gesamten Systems wird. Retrieval ist Grundversorgung und Discovery-Infrastruktur, aber nicht die Verfassung des Systems.

**Primärquellen:** `ai_retrieval_knowledge_infra_full.md`, `MEMORY_ARCHITECTURE.md`, `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`, `CONTEXT_ENGINEERING.md`, `AGENT_ARCHITECTURE.md`.  
**Externe Validierung:** [WEB-05].

## 11. Agentenarchitektur, Capability Tiers und Schreibrechte

### 11.1 Agenten sind Teil des Systems, nicht ein Chat-Addon
Die Agentenarchitektur muss in die Kernarchitektur integriert sein. Agenten greifen auf Quellen, Memory, Retrieval, Kontext und Tools zu und werden damit zu einem eigenen Betriebssystemteil.

### 11.2 Capability Tiers
Agenten sollen nicht 'alles' können. Stattdessen braucht das System Capability Tiers, z. B.:

- **T0 read-only**: Recherche, Synthese, Labeling
- **T1 bounded writes**: Entwürfe, candidate creation, temporary overlays
- **T2 reviewed writes**: Vorschläge an Review-Queues
- **T3 narrow autonomous actions**: klar begrenzte, niedrig riskante Updates
- **T4 forbidden without explicit human approval**: high-impact writes, promotions, irreversible mutations

### 11.3 Default-Haltung
Agents are read-mostly. Das System gewinnt an Stabilität, wenn Agenten viel lesen, wenig schreiben und Promotion-Gates respektieren.

### 11.4 Registry, tools, state observation
Die Specs deuten bereits auf Agent Registry, Agent Execution und Agent State Observation Endpoints hin. Das ist gut, weil damit Agenten beobachtbar und auditiert werden können.

### 11.5 Planner, Executor, Replanner
Aus dem Gespräch und aus `plan-modus-agent.txt` ergibt sich ein starkes Muster:

- **Planner** entwirft Schritte
- **Executor** führt konkrete Aufgaben aus
- **Replanner** reagiert auf neue Evidenz, Fehler, Abweichungen

Dieses Muster ist besonders nützlich für:

- Retrieval- und Research-Agenten
- Simulation und Szenarioerkundung
- Code- und Sandbox-Agenten
- längere multi-step work

### 11.6 Aber: kein Markdown als alleinige Wahrheit
`plan-modus-agent.txt` ist als Pattern gut, aber der persistente Systemstate sollte **strukturiert** sein; menschenlesbare Pläne sind Projektionen, nicht alleiniger SoR.

**Primärquellen:** `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`, `plan-modus-agent.txt`, `API_CONTRACTS.md`, `CONTEXT_ENGINEERING.md`.

## 12. Deliberate Reasoning: BFS, Tree of Thoughts, Beam Search, MCTS

### 12.1 Warum dieser Abschnitt überhaupt existiert
Ein besonderer Mehrwert des Gesprächs war, dass die Agentik nicht nur als Tool-Aufruf oder RAG beschrieben wurde, sondern als **explizite Search- und Deliberation-Frage**.

### 12.2 Was ein nacktes LLM leistet – und was nicht
Ein reines LLM kann intern mehrere Hypothesen erwägen, Pfade implizit priorisieren und sprachlich glätten. Es garantiert aber **keine formale Suchstrategie** mit reproduzierbarem Frontier-Management.

### 12.3 Explizite Search wird nötig, wenn …
- mehrere konkurrierende Hypothesen systematisch gegeneinander gehalten werden sollen
- counterfactual branches wertvoll sind
- tool use und evidenzbasiertes Verzweigen nötig werden
- Auditierbarkeit und Reproduzierbarkeit wichtig sind
- der Suchraum zu groß oder zu teuer für bloßes lineares Weiterdenken ist

### 12.4 BFS
BFS ist nützlich, wenn man mehrere frühe Richtungen fair und vollständig explorieren will. Es ist aber bei hohem branching factor schnell teuer.

### 12.5 Beam Search
Beam Search ist für dein System oft der beste erste Produktionskompromiss:

- einfacher als volles MCTS
- besser kontrollierbar als freies ToT
- behält nur Top-k Kandidaten pro Tiefe
- gut für Szenario- und Hypothesenexploration

### 12.6 MCTS
MCTS wird relevant, wenn Szenariobäume groß, mehrstufig, unsicher und adaptiv werden. Dann braucht das System selektive Suche mit Exploration/Exploitation-Balance.

### 12.7 Tree of Thoughts
Tree of Thoughts ist als Designidee nützlich, aber für Produktionsarchitektur zu unscharf, wenn man damit nur 'bitte denke in mehreren Pfaden' meint. Der wichtige Schritt ist, die Suchstruktur explizit zu machen.

### 12.8 Normative Position
Für dieses System gilt:

- **nicht** auf implizites LLM-Reasoning allein vertrauen
- Search als **eigene Subsystem-Schicht** betrachten
- zuerst **Beam Search / best-first** praktisch einsetzen
- MCTS dort ergänzen, wo Simulation und policy search es wirklich brauchen

### 12.9 Konsequenz für Datenmodelle
Sobald Search formal wird, braucht jeder Knoten mindestens:

- node/state id
- parent
- depth
- assumptions
- evidence summary
- score/confidence
- status/pruned/expanded
- tool outputs / traces
- world_state_version / belief_snapshot_id bei Simulationskontext

**Gesprächsquelle:** unser Chat vom 06. März 2026.  
**Ergänzende Primärquellen:** `AGENT_ARCHITECTURE.md`, `GAME_THEORY.md`, `EXECUTION_PLAN.md`.

## 13. Tooling-Modell, Tool Search und Capability Discovery

### 13.1 Tooling ist ein Architekturproblem
Werkzeuge sind nicht nur API-Endpunkte. Sie sind die operative Oberfläche, durch die Agenten reale Handlungen, Abfragen und Berechnungen ausführen.

### 13.2 Zwei Extreme, die vermieden werden sollten
1. **zu viele feingranulare Tools direkt ins Modell kippen**
2. **zu wenige überabstrakte Tools bereitstellen, die intern semantisch unklar sind**

### 13.3 Tool Search als Laufzeitoptimierung
Bei großen Toolkatalogen ist lazy loading / tool search nützlich, weil nicht jede Tooldefinition von Beginn an in den Modellkontext geladen werden muss.

### 13.4 Aber Tool Search löst nicht das Grundproblem
Tool Search ersetzt nicht:

- gutes Tool Design
- Capability-Tiers
- klare Permissioning-Grenzen
- gutes Result- und Error-Design

### 13.5 Hot vs. long-tail tools
Praktisch sollte unterschieden werden zwischen:

- **hot tools**: häufig gebraucht, immer schnell verfügbar
- **long-tail tools**: per discovery/lazy load

### 13.6 Verbindung zum Capability Registry
Ein sauberer Toolkatalog sollte sich an einer formalen Capability Registry orientieren, nicht bloß an zufällig benannten Funktionen.

### 13.7 Gesprächsbasierte Konsequenz
Da dein System am Ende viele Fachwerkzeuge haben wird – Retrieval, KG, Geo, Simulation, Portfolio, Sandbox, Verification, Partner/Broker – ist Tool Search sinnvoll, aber als **Subkapitel der Agent Runtime**, nicht als Verfassung des Gesamtsystems.

**Primärquellen:** `TOOL_SEARCH.md`, `AGENT_TOOLS.md`, `CAPABILITY_REGISTRY.md`, `AGENT_ARCHITECTURE.md`.  
**Externe Validierung:** [WEB-02], [WEB-03].

## 14. Sandbox und Code Execution: OpenSandbox und Runtime-Isolation

### 14.1 Warum eine Sandbox Pflicht ist
Sobald Agenten Code ausführen, Dateien bearbeiten oder externe Artefakte erzeugen, braucht das System eine **isolierte Ausführungsumgebung**. Das ist keine Kür, sondern Sicherheits- und Reproduzierbarkeitsgrundlage.

### 14.2 Zielbild
Die Sandbox-Schicht sollte mindestens leisten:

- Prozessisolation
- Dateisystemgrenzen
- Ressourcenlimits
- paketierbare Base Images
- kontrollierte Runtime-Installation
- Artefakt-Export
- Audit / logs / traces

### 14.3 Warum OpenSandbox hier gut passt
OpenSandbox passt konzeptionell gut, weil es nicht nur 'Python irgendwo ausführen' meint, sondern eine allgemeine Sandbox-Plattform mit SDKs und Code-Interpreter-Workflow. Das Modell mit Basis-Images und abgeleiteten Images passt gut zu deinem Bedarf.

### 14.4 Was vorinstalliert sein sollte
Die Sandbox sollte **nicht** alles enthalten. Empfohlen ist:

- kleines, kuratiertes Base Image
- domänenspezifische derived images
- kontrollierte Runtime-Installation für seltene Spezialpakete

### 14.5 Für dein System besonders relevant
Eine Sandbox wird gebraucht für:

- data and code experiments
- agentische Datenverarbeitung
- scenario calculations
- evidenznahe Skriptläufe
- Simulation-Hilfsrechnungen
- user-triggered deep analysis jobs

### 14.6 Gesprächsbasierte Klarstellung
Im Gespräch wurde die Sandbox ausdrücklich in die **Agenten- und Simulationsarchitektur** hineingezogen. Das wird hier übernommen: OpenSandbox ist nicht nur DevTool, sondern Bestandteil der Runtime-Schicht.

**Primärquellen:** `AGENT_TOOLS.md`, `AGENT_ARCHITECTURE.md`, `ERRORS.md`, Gespräch.  
**Externe Validierung:** [WEB-01].

## 15. GeoMap als räumliche Intelligence Surface

### 15.1 GeoMap ist nicht bloß Visualisierung
Die GeoMap ist eine operative Oberfläche für:

- bestätigte Events
- candidate review
- contradictions and resolution flows
- timelines
- overlays
- user annotations
- transmission paths
- regional and actor-centric context

### 15.2 Was die GeoMap nicht sein sollte
Die GeoMap sollte nicht gleichzeitig:

- die ganze Simulation selbst lösen
- der einzige Merge- oder Truth-Ort sein
- jede agentische Logik intern verstecken

### 15.3 Drei Modi der GeoMap
Die Map sollte mindestens drei konzeptuelle Nutzungsmodi kennen:

1. **Evidence / Review Mode**
2. **Operational / Context Mode**
3. **Simulation / Scenario Mode**

### 15.4 Local-first und Collaboration
Die GeoMap profitiert von local-first user affordances, aber braucht gleichzeitig saubere serverseitige Truth- und Reviewpfade. Deshalb muss sie doppelt denken:

- private overlays lokal
- shared reviewed state über kontrollierte serverseitige Wege

### 15.5 Warum sie architektonisch zentral bleibt
Die Map ist die natürlichste räumliche Projektionsfläche für Kausalität, Ausbreitung, Spannungen, Signalpfade und Szenarien. Gerade deshalb muss sie als **Surface** ernst genommen werden.

**Primärquellen:** `GEOPOLITICAL_MAP_MASTERPLAN.md`, `GEOMAP_VERIFY.md`, `GEOPOLITICAL_OPTIONS.md`, `API_CONTRACTS.md`, `EXECUTION_PLAN.md`.

## 16. Simulation Engine: Game Theory, Control Theory, Monte Carlo und Scenario Modeling

### 16.1 Warum Simulation eine eigene Engine sein muss
Eine der wichtigsten Chat-Erkenntnisse war, dass GeoMap und Simulation **gekoppelt**, aber **nicht identisch** sind. Die eigentliche Simulation braucht andere Zustände, andere Latenzprofile und andere Datenmodelle als die normale Kartenbedienung.

### 16.2 Simulation ist nicht nur 'Game Theory'
Die Specs und das Gespräch zeigen, dass du drei Denkfamilien zusammendenken willst:

- **klassische / strategische Spieltheorie**
- **dynamische / evolutorische / differential game theory**
- **Control Theory / Regelung / Optimierung über Zeit**

### 16.3 Drei Modellwelten
Aus `GAME_THEORY.md` ergibt sich eine fruchtbare Trias:

- strategische Ordnung und Interdependenz
- endogene Instabilität / Minsky-Keen-artige Dynamik
- Bellman-/Control-artige Optimierung über Zeit

### 16.4 Schichten der Simulationsengine
Eine brauchbare Simulationsarchitektur sollte mindestens diese Schichten haben:

1. **State Model**
2. **Actor Model**
3. **Action / policy model**
4. **Transition model**
5. **Utility / loss / objective layer**
6. **Belief / uncertainty layer**
7. **Search / scenario branching layer**
8. **Output projection layer**

### 16.5 Welche mathematischen Familien hineinpassen
- normal-form and extensive-form games
- repeated games
- Bayesian games / incomplete information
- evolutionary dynamics / replicator dynamics
- differential games
- mean field or population approximations
- model predictive control / receding horizon reasoning
- Monte Carlo and scenario sweeps

### 16.6 Was zuerst produktiv gebaut werden sollte
Nicht der maximal akademische Overkill. Sondern:

1. **Impact core path**
2. **structured scenario state**
3. **few-player / few-policy simulation kernels**
4. **Beam-search-style scenario exploration**
5. **timeline + map projection**

### 16.7 Warum Beam vor MCTS oft besser startet
Das Gespräch hat hier eine praktische Entscheidung hervorgebracht: für den frühen produktiven Simulationspfad ist Beam Search häufig der bessere Start, weil MCTS zwar mächtig, aber deutlich komplexer und empfindlicher ist.

### 16.8 Control Theory ist kein Exot
Control Theory ist relevant, weil viele reale Systeme – Zentralbanken, Sanktionsdynamik, policy feedbacks, Lieferkettenreaktionen, Preisreaktionen – eher Regelkreisen als einmaligen Zügen ähneln.

### 16.9 Monte Carlo bleibt wichtig
Monte Carlo ist nützlich für:

- Unsicherheitsbänder
- policy sensitivity
- path dispersion
- regime-dependent outcome ranges
- risk clustering

### 16.10 Simulation braucht Evidence, nicht nur Erfindung
Die Engine darf nicht frei halluciniert arbeiten. Sie braucht:

- belief snapshot
- source set
- current contradiction state
- actor priors
- scenario assumptions

### 16.11 Epistemische Regel
Simulation erzeugt **keine Wahrheit**, sondern **geordnete Hypothesenräume**.

**Primärquellen:** `GAME_THEORY.md`, `EXECUTION_PLAN.md` (Phase 17), `GEOPOLITICAL_MAP_MASTERPLAN.md`, `INDICATOR_ARCHITECTURE.md`, `POLITICAL_ECONOMY_KNOWLEDGE.md`, Gespräch.

## 17. GeoMap ↔ Simulation: der gekoppelte Dual-Modus

### 17.1 Die richtige Form
Der im Gespräch entwickelte Begriff `focused/simulation mode` ist architektonisch richtig. Die sauberste Form ist ein **gekoppelter Dual-Modus**:

- gleiche Domäne / gleicher Kontext
- gemeinsame Entitäten, IDs, Zeitachsen
- aber getrennte Engine- und UI-Modi

### 17.2 Was auf der Map sichtbar wird
Die Simulationsengine sollte Ergebnisse zurück auf die GeoMap projizieren können, etwa:

- expected transmission paths
- actor pressure overlays
- stability / instability overlays
- policy-effect ranges
- branch-specific markers
- uncertainty fields
- time-projected scenario animation

### 17.3 Was die Map nicht tragen muss
Die Map muss nicht selbst halten:

- vollen search tree
- interne planner states
- raw rollout logs
- optimizer internals

Das gehört in die Simulations-Workbench.

### 17.4 UI-Struktur
Sinnvoll ist eine Struktur wie:

- GeoMap shell
- left/right context panels
- simulation controls
- scenario tree / graph pane
- timeline pane
- evidence/belief sidecar

### 17.5 Warum dieser Schnitt stark ist
Er erhält die GeoMap als klar lesbare Intelligence Surface und erlaubt dennoch tiefes Szenarioarbeiten. Genau diese Balance war einer der wichtigsten Gesprächsergebnisse.

**Primärquellen:** `GEOPOLITICAL_MAP_MASTERPLAN.md`, `EXECUTION_PLAN.md`, `GEOPOLITICAL_OPTIONS.md`, `AGENT_TOOLS.md`, Gespräch.

## 18. Libraries, Frameworks und technische Bausteine für Simulation und Visualisierung

### 18.1 Frontend / Visualization
Für die UI- und Visualisierungsschicht sind diese Familien sinnvoll:

- **D3 / visx** für Charts, timeline, distributions, domain visualizations
- **React Flow / xyflow** für scenario trees, policy graphs, causal graphs
- **deck.gl** für performante geospatial overlays, flows, trips, dense layers
- optional **MapLibre** oder andere tile-first map stacks, wenn sich der Schwerpunkt vom Globe stärker in vektor-tile-basierte Karten verschiebt

### 18.2 Python / Simulation
Für den Modellkern sind diese Bibliotheksfamilien plausibel:

- **PyGambit / Gambit** für finite normal/extensive-form games
- **Mesa** für agent-based modeling und heterogene Populationen
- **python-control** für lineare und nichtlineare Regelkreise
- **do-mpc** für MPC/MHE-orientierte loops
- **CasADi** für Optimierung und algorithmic differentiation
- **OpenSpiel** eher als Forschungs- und Referenz-Toolkit als als direkte Produktbasis

### 18.3 Rust / acceleration
Für Rust drängen sich auf:

- **petgraph** für graph data structures and algorithms
- **h3o** für H3-based spatial indexing
- lineare Algebra / ODE crates für differential dynamics
- parallele Laufzeitbibliotheken für rollouts und sweeps

### 18.4 Kritischer Blick
Bibliotheken sollen **Bausteine**, nicht **Architektur-Ersatz** sein. Das ist besonders wichtig bei Simulation: eine gute Library löst noch nicht die epistemische und vertragsseitige Struktur des Problems.

### 18.5 Gesprächsbasierte Priorisierung
Der Chat hat hier einen sinnvollen Vorrang gesetzt:

- Python first for modelling
- Rust later for hot paths
- GeoMap/Simulation coupling first as concept
- Libraries chosen to match that architecture, not to dictate it

**Primärquellen:** `GAME_THEORY.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`, `EXECUTION_PLAN.md`, `FRONTEND_ARCHITECTURE.md`, `FRONTEND_DESIGN_TOOLING.md`.  
**Externe Validierung:** [WEB-06], [WEB-07], [WEB-08], [WEB-09], [WEB-10], [WEB-11], [WEB-12], [WEB-13], [WEB-16], [WEB-17].

## 19. Indicators, Portfolio, Macro und ihr Verhältnis zur Geo-/Simulationswelt

### 19.1 Warum dieser Block in den Master-Master gehört
Simulation, GeoMap und political economy stehen nicht losgelöst neben dem Marktteil. Das System gewinnt gerade dadurch, dass Indikatoren, Regime, Transmission und politische Ökonomie ineinandergreifen.

### 19.2 Wichtige Verbindungen
- market regime detection beeinflusst scenario priors
- macro indicators speisen belief updates
- geopolitical events und transmission channels wirken auf assets und sectors
- portfolio overlays verändern user relevance and simulation framing

### 19.3 Nicht alles muss in die erste Simulationsversion
Portfolio und indicator world sollten früh **integrierbar**, aber nicht schon vollständig in die erste Simulation hineingepresst werden.

### 19.4 Besserer Schnitt
Frühe Simulation sollte vor allem diese Verbindungen sauber abbilden:

- actor/event → transmission path
- transmission path → market impact hypotheses
- market regime / entropy / novelty → scenario weighting
- portfolio exposure → user-specific risk lens

### 19.5 Warum das wichtig ist
Sonst baut man entweder:

- eine simulierte geopolitische Welt ohne Marktausgang
- oder eine Marktanalyse ohne geopolitisch-kausale Tiefenstruktur

**Primärquellen:** `INDICATOR_ARCHITECTURE.md`, `Portfolio-architecture.md`, `ENTROPY_NOVELTY.md`, `POLITICAL_ECONOMY_KNOWLEDGE.md`, `GAME_THEORY.md`.

## 20. Runtime, Jobs, Reproduzierbarkeit und Snapshots

### 20.1 Warum Reproduzierbarkeit zentral ist
Sobald Agenten, Retrieval, Simulation und User Overlays zusammenkommen, wird es unmöglich, ohne Snapshots und reproduzierbaren Kontext belastbare Ergebnisse zu auditieren.

### 20.2 ScenarioSnapshot als First-Class Objekt
Ein Simulation- oder größerer Analyse-Run sollte idealerweise ein strukturiertes Snapshot-Objekt haben mit Feldern wie:

- `scenario_id`
- `world_state_version`
- `belief_snapshot_id`
- `kg_snapshot_id`
- `source_set_id`
- `portfolio_snapshot_id`
- `assumption_set`
- `time_horizon`
- `model_version`
- `config_hash`

### 20.3 Warum das nicht nur für Simulation gilt
Ähnliche Snapshot-Prinzipien sind auch für:

- long-running retrieval jobs
- agent planning runs
- verification pipelines
- sandbox executions
- backtests

wichtig.

### 20.4 Sync start, async body, stream back
Ein wiederkehrendes Muster aus dem Gespräch lautet:

- synchroner Start
- asynchroner Lauf
- streamendes oder checkpoint-basiertes Zurückmelden

Dieses Muster sollte auf Simulation, Ingestion, Agent Runs und heavy compute breit angewendet werden.

### 20.5 Why this matters for trust
Ohne Reproduzierbarkeit verliert das System genau den Vorteil, den es verspricht: nachvollziehbare, überprüfbare, iterative Intelligence statt bloßer Chat-Eindrücke.

**Primärquellen:** `API_CONTRACTS.md`, `EXECUTION_PLAN.md`, `MEMORY_ARCHITECTURE.md`, `AGENT_ARCHITECTURE.md`, Gespräch.

## 21. Error Handling, Observability, Security und Betriebsnormen

### 21.1 ERRORS.md ist Querschnitt, nicht Randnotiz
`ERRORS.md` wurde im Gespräch zu Recht als Querstandard hervorgehoben. Es tangiert Frontend, Go, Python, Streams, Error Boundaries und Observability.

### 21.2 Error Taxonomy
Das System sollte konsistent zwischen unterscheiden:

- expected domain errors
- unexpected crashes
- upstream/provider failures
- policy/permission failures
- transient async/job failures
- contradiction / epistemic uncertainty (kein klassischer Fehler, aber häufig wie einer behandelt)

### 21.3 Structured responses and contracts
Erwartete Fehler sollten möglichst als strukturierte Rückgaben und standardisierte Fehlercodes modelliert werden. Das passt zu einem contract-first System viel besser als überall geworfene Ad-hoc-Exceptions.

### 21.4 Error boundaries im Frontend
Gerade GeoMap, D3/WebGL und komplexe UI-Bereiche brauchen granulare Error Boundaries, damit ein Teilcrash nicht die gesamte Oberfläche unbenutzbar macht.

### 21.5 Correlation IDs, traces, logs
Cross-service tracing ist Pflicht, nicht Luxus. Sonst werden Simulation, Retrieval, Review und Promotionpfade spätestens im Fehlerfall unverständlich.

### 21.6 Security und policy
Security ist hier nicht nur klassische Auth. Sie umfasst auch:

- capability scoping
- sandbox boundaries
- partner boundaries
- overlay privacy
- review permissions
- mutation restrictions

### 21.7 Gesprächsbasierte Ergänzung
Im Chat wurde deutlich, dass diese Betriebsnormen nicht erst 'später' kommen dürfen. Sie sind besonders für Agenten und Simulationen früh wichtig, weil sonst das System zwar clever, aber nicht vertrauenswürdig wäre.

### 21.8 `ERRORS.md` muss zu einem echten Spec-Dokument verschlankt werden
`ERRORS.md` ist wertvoll, aber in seiner aktuellen Form noch eine Mischung aus:

- Betriebsnorm
- Tool-/Library-Radar
- Frontend-Referenzsammlung
- AI-/Agent-Research
- Performance-/Deep-Tech-Ausblick

Für die Zielarchitektur sollte `ERRORS.md` **primär** das Spec-Dokument für Fehler-, Observability- und Resilience-Normen werden. Dort sollten vor allem verbleiben:

- Error Taxonomy
- structured error responses
- route bubble / error boundaries
- correlation IDs / traces / logs
- retry / timeout / fallback / degraded mode
- observability minimum standard
- rollout / kill-switch / replay nur soweit sie zur Betriebsstabilität gehören

Wichtig ist aber ebenso: **Tool- und Library-Namen dürfen nicht verloren gehen.** Sie bleiben als Optionen, Referenzen und Evaluationspfade erhalten, sollen aber nicht den normativen Kern des Dokuments überladen.

### 21.9 Frontend-nahe Teile aus `ERRORS.md` gehören in ein eigenes Komponenten-Dokument
Die Sektion zu Agent UI/UX und Scaffolding ist primär **Frontend-/Workbench-Material** und sollte nicht dauerhaft im Error-/Observability-Spec wohnen.

Empfohlen ist deshalb ein eigenes Fachdokument wie `FRONTEND_COMPONENTS.md`. Dort sollten mit Namensnennung als **Optionen / Referenzen** gesammelt werden:

- `Agent Zero`
- `Perplexica`
- `Mission Control`
- `GitNexus Web`
- `Paperless-ngx`
- `Tambo`
- `Vercel AI SDK`

Dieses neue Dokument sollte **nicht** die Frontend-Architektur selbst ersetzen. Der Schnitt wäre:

- `FRONTEND_ARCHITECTURE.md` = Shell, Routing, State, Datenfluss, Surface-Grenzen
- `FRONTEND_COMPONENTS.md` = konkrete UI-Surfaces, Component-Familien, Workbench-/Dashboard-Referenzen, externe UI-Inspiration
- `FRONTEND_DESIGN_TOOLING.md` = Design-to-code und gestalterische Tooling-Fragen
- `AGENT_ARCHITECTURE.md` / `MEMORY_ARCHITECTURE.md` = semantische und agentische Bedeutung dieser Surfaces

### 21.10 Technologieoptionen aus `ERRORS.md` müssen in die richtigen Dokumente verteilt werden
Nicht jede Technologieoption aus `ERRORS.md` gehört in dieselbe Ablage. Für die Zielarchitektur gilt:

- **`deck.gl` / WebGPU** bleiben mit expliziter Namensnennung erhalten, gehören aber in erster Linie zur GeoMap- und Performance-Entscheidung:
  - `GEOPOLITICAL_MAP_MASTERPLAN.md`
  - `PERFORMANCE_BASELINE.md`
  - `EXECUTION_PLAN.md`
  - `adr/ADR-002-GeoMap-Rendering-Foundation.md`

- **`Connect RPC`** bleibt mit Namensnennung erhalten, ist aber keine pauschale Browser-Standardentscheidung. Es gehört vor allem zu:
  - `execution_mini_plan_3.md`
  - `GO_GATEWAY.md`
  - `ARCHITECTURE.md`
  - `EXECUTION_PLAN.md`

- **`OpenSandbox`** ist keine bloße Future-Notiz, sondern bleibt Teil der Agent-Runtime-Architektur:
  - `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md` (später)
  - `AGENT_ARCHITECTURE.md`
  - `AGENT_TOOLS.md`

- **`A2A`, `DSPy`, `WebTransport`, `eBPF`, `Durable Execution`, `Sequencer-Centric Messaging`, `Pkl`, `KCL`, `Crossplane`, `Nix`, `Confidential Computing`** bleiben als benannte Optionen wichtig, sind aber überwiegend **späterer Radar**. Sie sollten mit Tool-/Library-Namen dokumentiert, aber nicht als frühe Kernverfassung missverstanden werden.

### 21.11 Später-Radar aus `ERRORS.md`
Folgende Themen sind wichtig genug, um mit Namensnennung erhalten zu bleiben, aber in der Regel **nicht** Teil der unmittelbaren Kernarchitektur:

- `WebTransport`, `quic-go`
- `Tetragon`, `Grafana Beyla`, `OpenTelemetry eBPF Instrumentation`
- `Temporal`, `Restate`
- `Redpanda`, `Aeron`, `Point72/csp`
- `Pkl`, `KCL`, `OpenTofu`, `Crossplane`
- `Nix`, `Nix Flakes`
- `Confidential Containers`, `Intel TDX`, `AMD SEV-SNP`
- `Servo`

Diese Themen gehören entweder:

- als spätere Option in passende Arbeitsdokumente, **oder**
- in `Advanced-architecture-for-the-future.md`, wenn sie klar `later later` sind.

`Point72/csp` soll dabei ausdrücklich als **Evaluationsbibliothek für high-performance reactive stream processing** erhalten bleiben.  
Es ist kein automatischer Architekturentscheid für `tradeview-fusion`, aber ein relevanter Referenzkandidat, wenn später event-getriebene Signalverarbeitung, Streaming-Graphen oder sehr schnelle zeitserielle Reaktivität stärker in den Vordergrund rücken.

### 21.12 Dinge aus `ERRORS.md`, die **nicht** in `ERRORS.md`, `FRONTEND_COMPONENTS.md` oder `Advanced-architecture-for-the-future.md` wohnen sollten
Einige Blöcke aus `ERRORS.md` sind wichtig, aber gehören logisch weder in das reine Error-/Observability-Spec noch in das Frontend-Referenzdokument noch in den Langfrist-Radar. Diese Punkte sollten deshalb als **kontextgebende Architekturentscheidung** im Master-Master sichtbar sein, mit klarer späterer Verteilung auf Arbeitsdokumente.

#### a) Contract-driven Development und Codegen-Pfad
Das ist kein bloßes DX-Gimmick, sondern betrifft die Systemkohärenz direkt.

Namensnennungen, die als Optionen erhalten bleiben sollen:

- `OpenAPI 3.1`
- `Protobuf` / `gRPC`
- `Orval`
- `Kiota`
- `oapi-codegen`
- `datamodel-code-generator`

Empfohlene Ziel-Dokumente:

- `docs/specs/API_CONTRACTS.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`

#### b) Shift-left Quality und Supply-Chain-Härtung
Diese Themen sind wichtig, aber nicht Teil der Systemverfassung im engeren Sinn. Sie sollten als operative Delivery- und Sicherheitsoptionen festgehalten werden.

Namensnennungen, die als Optionen erhalten bleiben sollen:

- `Lefthook`
- `Husky`
- `Renovate`
- `Dependabot`
- `Trivy`
- `Semgrep`

Empfohlene Ziel-Dokumente:

- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/AUTH_SECURITY.md`

#### c) Feature Flags als eigener Betriebs- und Risikobaustein
Feature Flags sind nicht bloß ein Frontend-Detail. Sie sind Rollout-, Kill-Switch- und Capability-Governance.

Namensnennungen, die als Optionen erhalten bleiben sollen:

- `Unleash`
- `Flagsmith`

Empfohlene Ziel-Dokumente:

- `docs/specs/CAPABILITY_REGISTRY.md`
- `docs/specs/ROLLOUT_GATES.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/EXECUTION_PLAN.md`

#### d) Data-Layer-Evolution und analytischer Compute-Pfad
`Drizzle vs. Prisma`, `DuckDB`, `Polars`, `Apache Arrow`, `Dremio` oder `MotherDuck` sind keine Error-Spezifikation. Sie gehören in die Daten-, Compute- und Skalierungsarchitektur.

Namensnennungen, die als Optionen erhalten bleiben sollen:

- `Drizzle`
- `Prisma`
- `Turso`
- `LiteFS`
- `DuckDB`
- `Polars`
- `Apache Arrow`
- `Dremio`
- `MotherDuck`

Empfohlene Ziel-Dokumente:

- `docs/specs/ARCHITECTURE.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/INDICATOR_ARCHITECTURE.md`
- `docs/RUST_LANGUAGE_IMPLEMENTATION.md`
- `docs/UNIFIED_INGESTION_LAYER.md`

Wichtiger Kontext, damit diese Begriffe nicht falsch gelesen werden:

- `DuckDB` / `Polars` / `Apache Arrow` sind für dieses System **primär analytische und batch-/research-nahe Datenpfade**
- sie dienen Historie, Backtesting, Feature-Engineering, Vektor-/Tabellen-Compute und sprachübergreifender Datenbewegung
- sie sind **nicht** die normative Begründung für die härteste Live-Execution- oder HFT-Schicht
- der harte low-latency / execution-nahe Pfad bleibt eher:
  - Go für Gateway / Netzwerk / Policy / Order-nahe Logik
  - Rust für Hot Paths / numerische Kerne / Beschleunigung
- `Apache Arrow` ist hier vor allem wichtig als **Zero-Copy- bzw. Low-Serialization-Brücke** zwischen Go, Python, Rust und analytischen Pipelines, nicht als magische HFT-Datenbank
- `MotherDuck` oder `Dremio` sind nur spätere Skalierungs- oder Komfortoptionen, nicht frühe Architekturpflicht

Das muss später in den Arbeitsdokumenten mit diesem Kontext erhalten bleiben, damit `Arrow` oder `DuckDB` nicht versehentlich als generelle Antwort auf jede Latenzfrage missverstanden werden.

#### e) AI Routing und Agent-Sicherheitsbausteine
Diese Punkte sind weder bloße Future-Spielerei noch reines Error-Handling. Sie betreffen Agent-Runtime, Governance und Modellgrenzen.

Namensnennungen, die als Optionen erhalten bleiben sollen:

- `LiteLLM`
- `RouteLLM`
- `PydanticAI`
- `Guardrails AI`
- `Scallop`
- `Z3`

Empfohlene Ziel-Dokumente:

- `docs/AGENT_ARCHITECTURE.md`
- `docs/AGENT_TOOLS.md`
- `docs/specs/AUTH_SECURITY.md`
- `docs/specs/EXECUTION_PLAN.md`
- spaeter `AGENT_RUNTIME_AND_EXECUTION_ARCHITECTURE.md`

### 21.13 Legacy-Sektionen aus dem ursprünglichen `ERRORS.md`
Das ursprüngliche `ERRORS.md` war faktisch ein Sammeldokument mit 31 Themenblöcken. Diese dürfen bei der Bereinigung nicht als "gelöscht" verstanden werden. Der richtige Zustand ist:

- der normative Error-/Observability-Kern bleibt in `ERRORS.md`
- frontendnahe Referenzen wurden nach `FRONTEND_COMPONENTS.md` verschoben
- klarer Future-Radar wurde in `Advanced-architecture-for-the-future.md` gespiegelt
- alle übrigen Blöcke müssen über die Master-Master-Dokumente und die Merge-Matrix in die richtigen Arbeitsdokumente eingeordnet werden

Die vollständige Abschnittszuordnung der alten 31 Sektionen wird deshalb bewusst in `Master_master_diff_merge_matrix.md` festgehalten, damit der Umbau auditierbar bleibt.

**Primärquellen:** `ERRORS.md`, `ERRORS2.md`, `AUTH_SECURITY.md`, `ARCHITECTURE.md`, `API_CONTRACTS.md`, `ROLLOUT_GATES.md`.

## 22. Evolutionspfad und Migrationslogik

### 22.1 Gegenwart und Zielbild trennen
Das System hat bereits viele starke Spezifikationen, ist aber noch nicht an jedem Punkt im Zielbild. Der Evolutionspfad muss deshalb zwei Dinge gleichzeitig leisten:

- ehrliche Ist-Beschreibung
- klare Soll-Richtung

### 22.2 Wichtige kurzfristige Richtungen
- Go data plane and contract path festigen
- Observability und error standards früh setzen
- GeoMap shell und review flows stabilisieren
- Memory/KG-Struktur präzisieren
- Agent/context foundations legen

### 22.3 Mittelfristige Richtungen
- Retrieval and source fabric ausbauen
- simulation mode einführen
- richer event graph and contradiction handling
- portfolio / macro / transmission tiefer koppeln
- Rust selective acceleration

### 22.4 Gemini-/mini-plan-3-Einfluss
`execution_mini_plan_3.md` schärft den Infrastrukturpfad sinnvoll nach:

- Go→Rust direkter für bestimmte compute paths
- Python stärker auf AI/ML/semantic orchestration fokussieren
- NATS JetStream als event backbone erwägen
- Connect/gRPC als saubere Transportgrenze ausbauen

Das ist inhaltlich kompatibel mit dem System, solange es **nicht** die epistemische Architektur verdrängt.

### 22.5 Was bewusst nicht jetzt getan wird
- kein Full Rewrite
- keine zusätzliche Sprache wie Julia als Default
- keine völlige Retrieval-Vendorisierung
- keine spontane Verschmelzung von Truth, Belief und Scenario

**Primärquellen:** `EXECUTION_PLAN.md`, `execution_mini_plan.md`, `execution_mini_plan_3.md`, `execution_mini_2.md`, `ARCHITECTURE.md`, `RUST_LANGUAGE_IMPLEMENTATION.md`.

## 23. Kritische Bewertung neuerer Fachdokumente im Gesamtkontext

### 23.1 `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`
Dieses Dokument ist **master-materiell**. Es schließt eine echte Lücke, weil es aus vagen Overlay-Ideen einen Vertragsraum macht. Es sollte normativ in den Master-Master eingehen. Vorsicht ist nur bei zu früher Engine-Fixierung geboten.

### 23.2 `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`
Dieses Dokument ist als abstraktes Fach-MD für Wissensraum, Merge, Overlay und Scenario Layer sehr wertvoll. Es sollte als Begründungs- und Verdichtungsquelle erhalten bleiben, aber nicht als konkurrierendes zweites Hauptdokument.

### 23.3 `ai_retrieval_knowledge_infra_full.md`
Stark für Retrieval und Discovery, aber retrieval-zentrierter als das Gesamtsystem. Deshalb als Fachsäule aufnehmen, nicht als Gesamtverfassung.

### 23.4 `TOOL_SEARCH.md`
Wertvoll als Agent Runtime Optimierung, aber eine Ebene unter der Gesamtarchitektur.

### 23.5 `plan-modus-agent.txt`
Stark als Pattern für Planner/Executor/Replanner und human-editable projection; zu weich, wenn Markdown alleiniger State wäre.

### 23.6 `ERRORS.md`
Muss als Querschnittsdokument ernst genommen werden. Nicht alles in den Master-Master ziehen, aber die Grundnormen schon.

### 23.7 Gesprächsbeitrag
Der Dialog hat die Spezifikationen nicht ersetzt, sondern an mehreren Stellen normativ verschärft – besonders bei Search, Simulation, Sandbox und Websearch-Rolle. Diese Schärfung ist bewusst in dieses Dokument eingegangen.

## 24. Offene Entscheidungen und bewusst deferred Punkte

- Exakte Engine-Wahl für Canonical/Fast/Event/Overlay/Vector Stores
- Wie stark Frontend-Merge lokal gerechnet wird vs. serverseitig vorgeformt kommt
- Wann Rust als eigener Service statt nur als Python-gebundener Kernel eingesetzt wird
- Ob die erste Simulationsversion eher impact-first oder policy-tree-first startet
- Wie aggressiv Open Web in near-realtime flows einbezogen wird
- Welches Snapshot-/versioning-Schema für Simulation und Agent Runs endgültig standardisiert wird
- Welche Capability-Tier-Grenzen sofort technisch erzwungen werden und welche erst organisatorisch

Diese Punkte sind bewusst offen, aber sie dürfen **nicht** dazu verleiten, die Grundprinzipien zu verwässern. Offen ist die konkrete Ausführung – nicht die epistemische und architektonische Richtung.

## 25. Service- und Modul-Blueprint

Dieser Abschnitt verdichtet die Architektur auf konkrete Service- und Modulgrenzen. Er ist bewusst technischer als die oberen Kapitel.

### 25.1 Browser / Frontend Surface
- `app-shell` – Navigation, layout, auth-aware shell, global error boundaries
- `geomap-surface` – globe/map canvas, overlays, interaction layer, local view state
- `review-studio` – candidate queue, contradiction resolution, evidence inspection
- `simulation-workbench` – scenario controls, actor policies, branch tree, timeline, charts
- `portfolio-workspace` – exposures, watchlists, user relevance, thesis overlays
- `notes-journal` – personal research artifacts and semantic snippets

### 25.2 Go Control Plane
- `gateway` – public API, authn/authz, rate limits, correlation IDs, response contracts
- `connector-router` – provider dispatch, fallback policy, retries, quotas
- `stream-hub` – SSE/WebSocket/stream multiplexing
- `job-controller` – async job submission, status, cancellation, checkpointing
- `promotion-gate` – domain write policy, review gates, mutation restrictions
- `audit-timeline` – append-only audit model / review and mutation ledger

### 25.3 Python Intelligence Plane
- `retrieval-orchestrator` – federated retrieval over APIs, graph, vector, open web
- `verifier` – claim decomposition, evidence collection, stance/confidence computation
- `agent-runtime` – planner/executor/replanner, tool invocation, state transitions
- `simulation-core` – game/control dynamics, rollouts, branch generation, scoring
- `context-assembler` – M1–M5 assembly, budgets, source filtering, persona/scenario context
- `labeling-pipeline` – extraction, classification, dedup, route assignment for UIL

### 25.4 Rust acceleration plane
- `graph-kernels` – scenario graph traversal, path search, graph scoring
- `spatial-kernels` – H3/grid aggregations, vector-tile preparation, heavy geospatial transforms
- `ode-kernels` – differential systems, replicator dynamics, control-oriented ODE solves
- `mc-kernels` – Monte Carlo rollouts, parallel scenario sweeps
- `indicator-kernels` – compute-heavy indicator and pattern functions

### 25.5 Knowledge and storage plane
- `canonical-graph-store`
- `fast-event-store`
- `claim-evidence-store`
- `overlay-store`
- `episodic-store`
- `vector-store`
- `time-series / relational stores`

### 25.6 Why this matters
Ohne ein solches Modulbild bleiben viele spätere Diskussionen zu abstrakt. Mit diesem Blaupausen-Schnitt wird klar, dass Simulation, Retrieval, GeoMap und KG nicht um denselben Zuständigkeitsraum kämpfen sollten.

## 26. Datenverträge und Kernobjekte

### 26.1 Canonical Entity
Pflichtfelder:
- `entity_id`
- `entity_type`
- `canonical_name`
- `aliases[]`
- `provenance[]`
- `valid_time` / `system_time` falls sinnvoll
- `status`

### 26.2 Claim
- `claim_id`
- `about_entity_ids[]`
- `claim_text` / normalized form
- `claim_type`
- `time_scope`
- `origin_source_id`
- `current_confidence`
- `review_state`

### 26.3 Evidence
- `evidence_id`
- `source_id`
- `supports_or_contradicts_claim_id`
- `stance`
- `excerpt / normalized payload`
- `retrieval_path`
- `timestamp_observed`
- `quality_score`

### 26.4 User Overlay Node
- `overlay_id`
- `owner_user_id`
- `references_entity_ids[]`
- `overlay_type`
- `private_weight`
- `visibility`
- `device_scope` or `sync_scope`

### 26.5 Scenario Snapshot
- `scenario_id`
- `parent_scenario_id`
- `world_state_version`
- `belief_snapshot_id`
- `kg_snapshot_id`
- `source_set_id`
- `assumption_set`
- `model_version`
- `time_horizon`
- `status`

### 26.6 Search Node
- `search_node_id`
- `scenario_id` or `analysis_run_id`
- `parent_node_id`
- `depth`
- `action_taken`
- `score`
- `uncertainty`
- `expanded` / `pruned` / `terminal`
- `tool_trace_ids[]`

### 26.7 Promotion Record
- `promotion_id`
- `object_type`
- `object_id`
- `from_state`
- `to_state`
- `policy_basis`
- `reviewer_or_agent_id`
- `timestamp`

### 26.8 Why explicit contracts matter
Diese Objektfamilien schaffen die Voraussetzung dafür, dass Knowledge, Review, Agentik und Simulation auf denselben Grundbegriffen operieren.

## 27. Simulation Deep Dive

### 27.1 Ziel des Deep Dive
Der Simulationsteil wurde im Gespräch besonders intensiv behandelt. Daher wird hier detaillierter festgehalten, wie die Engine logisch zusammengesetzt werden sollte.

### 27.2 Minimaler Simulations-Stack
Eine frühe belastbare Version braucht nicht alle akademischen Varianten, aber sie braucht eine klare Sequenz:

1. `belief_snapshot` laden
2. relevante Akteure und Regionen bestimmen
3. actor utilities / constraints initialisieren
4. policy/action set generieren
5. transition model anwenden
6. outcomes scoren
7. branch results auf Map, Timeline und Tree projizieren

### 27.3 Actor Schema
- actor type (state, firm, bloc, proxy, institution, market actor, population cluster)
- objectives
- constraints
- resources
- information state
- commitment / flexibility
- historical style / strategeme priors

### 27.4 State Schema
- geopolitical state
- macro-financial state
- market regime state
- narrative / legitimacy state
- supply-chain / trade state
- crisis escalation phase

### 27.5 Action Schema
- diplomatic action
- sanction / economic action
- military signaling / proxy escalation
- trade / logistics shift
- domestic policy
- information / narrative move

### 27.6 Transition Families
Verschiedene Situationen brauchen verschiedene Transition Families:

- deterministic rule transitions
- probabilistic transitions
- learned or heuristic scoring transitions
- control-theoretic state updates
- evolutionary population updates

### 27.7 Utility / objective families
Nicht jeder Akteur maximiert denselben skalaren Gewinn. Nützlich ist eine strukturierte Objective-Familie:

- security
- growth / welfare
- regime stability
- market access
- prestige / deterrence
- legitimacy / narrative coherence

### 27.8 Information structures
Simulationen müssen unterscheiden zwischen:

- perfect information
- incomplete information
- asymmetric information
- delayed / noisy observation

Gerade hier wird die Brücke zu Belief-States und Claim/Evidence wichtig.

### 27.9 Policy search
Der eigentliche policy search layer kann stufenweise wachsen:

- heuristisch / rule-based
- Beam Search
- best-first
- MCTS
- später ggf. learned policies

### 27.10 Why MCTS is not step one
MCTS lohnt sich dort, wo längere Aktionssequenzen und Exploration/Exploitation relevant werden. Für frühe produktive Systeme ist es oft sinnvoller, erst gut definierte state/action/reward contracts und eine Beam/best-first search zu bauen.

### 27.11 Control Theory integration
Control Theory passt in die Engine nicht als exotischer Zusatz, sondern in drei Rollen:

- **state stabilization analysis**
- **receding-horizon policy reasoning**
- **feedback interpretation**

Gerade politisch-ökonomische Systeme sind oft weniger 'ein Spieler macht einen Zug' als 'mehrere Rückkopplungsschleifen beeinflussen sich gegenseitig'.

### 27.12 Evolutionary / population dynamics
Für narrative Diffusion, behavioral spread oder Markt-/Bevölkerungsreaktionen können evolutorische oder populationsnahe Modelle sinnvoller sein als klassische two-player game formulations.

### 27.13 Monte Carlo layer
Monte Carlo eignet sich hier nicht nur für Endverteilungen, sondern auch für:

- uncertainty propagation
- sensitivity ranking
- shock robustness
- plausible path families

### 27.14 Scoring
Ein brauchbares Scoring der Szenarien sollte mehrdimensional sein:

- plausibility
- impact magnitude
- regime sensitivity
- confidence / evidential support
- novelty
- user relevance

### 27.15 Projection back to GeoMap
Die Engine sollte Outputs in map-friendly projections transformieren:

- per-region risk scores
- transmission edges
- actor tension overlays
- expected corridor disruptions
- branch-specific annotations
- confidence/uncertainty shading

### 27.16 Versioning
Jeder Simulationslauf sollte an Daten- und Modellversionen hängen. Sonst ist spätere Analyse oder Vergleich über Iterationen hinweg unzuverlässig.

### 27.17 Why this deep dive matters
Der Simulationsteil ist einer der größten Werttreiber des Systems, aber auch einer der größten Orte für semantische Verwirrung. Genau deshalb wird er hier länger behandelt.

## 28. Retrieval Deep Dive

### 28.1 Retrieval as process, not lookup
Retrieval im System ist kein einzelner 'search()'-Call, sondern ein Prozess:

1. intent bestimmen
2. domain scopen
3. passende retrieval families auswählen
4. candidate sources holen
5. normalize / dedup / cluster
6. evidence quality and provenance bewerten
7. ggf. in verifier oder simulation weitergeben

### 28.2 Retrieval intents
Nützliche Intent-Klassen:

- factual lookup
- source discovery
- contradiction hunt
- timeline reconstruction
- analogous case retrieval
- scenario prior building
- monitoring / watch mode

### 28.3 Retrieval routing
Nicht jeder Intent sollte dieselbe Route wählen.

- factual lookup → structured + graph first
- contradiction hunt → graph + claim/evidence + open web
- analogous case → vector + graph + episodic
- scenario prior building → graph + vector + domain docs + open web

### 28.4 Domain packs
Für geopolitische oder fachlich enge Domänen sind Domain Packs sinnvoll:

- curated sources
- extraction rules
- named entities / aliases
- quality weighting
- known contradiction patterns

### 28.5 Websearch governance
Websearch sollte abhängig vom Modus unterschiedlich aggressiv sein:

- monitoring mode → breiter
- verification mode → enger und qualitätsgewichteter
- simulation mode → discovery-oriented, aber epistemisch defensiv

### 28.6 Retrieval output contracts
Ein Retrieval-Aufruf sollte idealerweise nicht nur Text liefern, sondern strukturierte Metadaten:

- source id
- url / origin
- retrieval family
- confidence / quality
- extracted entities
- relevance score
- time scope
- claim candidates

### 28.7 Why this matters for agents
Wenn Retrieval nur unstrukturierte Textbrocken zurückgibt, wird die Agentik unsauber. Gute Retrieval Contracts sind deshalb direkt Agent Quality.

### 28.8 Kritischer Schluss
Retrieval soll das System **weiter sehen** lassen, aber nicht seine epistemischen Regeln unterlaufen.

## 29. Soll-Dokumentenschnitt nach dieser Synthese

Der spätere Dokumentenschnitt sollte nicht chaotisch viele konkurrierende 'Master'-Dokumente erzeugen. Sinnvoll ist:

1. **dieses Master-Master** als normatives Hauptdokument
2. `MASTER_ARCHITECTURE_SYNTHESIS_2026.md` als verdichtetes Brückendokument / rationale
3. `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` als fokussierte Detail-Verfassung für den Wissensraum
4. spezialisierte Fachdocs für Retrieval, Agenten, GeoMap, Simulation, Errors, Providers

Wichtig ist: Die Fachdocs bleiben wertvoll. Aber die Systemformel selbst sollte nicht über fünf konkurrierende Dokumente verteilt bleiben.

## 30. Interne Quellen mit Kurzrolle

- `AGENT_ARCHITECTURE.md` — Agentenrollen, Guards, Memory- und Tool-Schnitt
- `AGENT_TOOLS.md` — Werkzeugschicht, GeoMap/Simulation-Tooling, capability-nahe Detailarchitektur
- `API_CONTRACTS.md` — konkrete Verträge zwischen Frontend, Go, Python, Rust, Memory und Agenten
- `ARCHITECTURE.md` — normativer Kern der Gesamtarchitektur und Sprachgrenzen
- `AUTH_SECURITY.md` — Auth-, Security- und Boundary-Regeln
- `CAPABILITY_REGISTRY.md` — Capability- und Werkzeug-Inventar
- `CLAIM_VERIFICATION_ARCHITECTURE.md` — Claim, Evidence, Contradiction und Review-Architektur
- `CONTEXT_ENGINEERING.md` — Context assembly, Budgets und Consumer-Typen
- `ENTROPY_NOVELTY.md` — Regime-/Neuheits- und Entropieperspektive
- `ERRORS.md` — Querschnittsstandard für Fehler, Observability und Betriebsnormen
- `ERRORS2.md` — ergänzende Error-/Ops-Vertiefung
- `EXECUTION_PLAN.md` — Phasen, Verify Gates, Reihenfolge und Phase-17-Simulationseinbettung
- `FRONTEND_ARCHITECTURE.md` — Frontend-Schnitt, State-Modelle, Proxy- und Query-Patterns
- `FRONTEND_DESIGN_TOOLING.md` — Frontend-Tooling und Gestaltungsdetails
- `GAME_THEORY.md` — spieltheoretischer und control-theoretischer Kernrahmen
- `GEOCODING_STRATEGY.md` — Geocoding-, Place-Resolution- und Mappingstrategie
- `GEOMAP_VERIFY.md` — GeoMap-spezifische Prüf- und Qualitätsfragen
- `GEOPOLITICAL_MAP_MASTERPLAN.md` — GeoMap-Zielbild und Scope
- `GEOPOLITICAL_OPTIONS.md` — GeoMap- und politische Optionen / Erweiterungen
- `INDICATOR_ARCHITECTURE.md` — Markt-, Indikator-, Regime- und Heavy-Compute-Architektur
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` — verbindlicher Wissensraum- und Merge-Vertrag
- `KG_ONTOLOGY.md` — Ontologie und formales Schema
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md` — abstraktes Fach-MD für Wissensraum, Merge, Overlay und Zielbild-Synthese
- `MEMORY_ARCHITECTURE.md` — M1–M5 Memory-Schichten und Agent-Memory-Rahmen
- `PARTNER_BOUNDARY.md` — Partner-/Boundary-Schnitt
- `PAYMENT_ADAPTER.md` — Zahlungs-/Adaptergrenzen
- `PLUGIN_PILOT.md` — Plugin-/Pilot-Rahmen
- `PMTILES_CONTRACT.md` — Tile-/PMTiles-Verträge
- `POLITICAL_ECONOMY_KNOWLEDGE.md` — Domainwissen / KG-Seed für politische Ökonomie und Transmission
- `PROVIDER_LIMITS.md` — Provider-Limits und operative Grenzen
- `Portfolio-architecture.md` — Portfolio- und Exposure-Perspektive
- `REFERENCE_SOURCE_STATUS.md` — Quellenstatus und Ausbaugrad
- `ROLLOUT_GATES.md` — Rollout-, Freigabe- und Gate-Logik
- `RUST_LANGUAGE_IMPLEMENTATION.md` — Rust-Strategie, Compute-Schnitt und Nicht-Rewrite-Logik
- `SYSTEM_STATE.md` — Ist-Zustand und systemischer Betriebsstatus
- `TOOL_SEARCH.md` — lazy tool loading und Tool-Discovery-Muster
- `UIL_ROUTE_MATRIX.md` — Routing- und Zuständigkeitsmatrix für UIL/Frontend-Pfade
- `UNIFIED_INGESTION_LAYER.md` — unstrukturierte Beschaffung, LLM-processing, routing und review
- `ai_retrieval_knowledge_infra_full.md` — Retrieval-/Discovery-Fachdokument
- `execution_mini_2.md` — ergänzender Mini-Plan / Zwischenzustand
- `execution_mini_plan.md` — zusätzliche Evolutions- und ToDo-Planung
- `execution_mini_plan_3.md` — Infrastruktur-Evolution, Gemini-Vorschlag, Go→Rust→Python Schwerpunkt
- `plan-modus-agent.txt` — Planner/Executor/Replanner-Muster und human-editable plan projection

## Anhang A – Kapitel-zu-Primärquellen-Mapping

### 0–4 Grundrahmen
- `ARCHITECTURE.md`
- `EXECUTION_PLAN.md`
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`

### 5–6 Wissensraum / Truth-Belief-Scenario
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`
- `MEMORY_ARCHITECTURE.md`
- `CLAIM_VERIFICATION_ARCHITECTURE.md`
- `KG_ONTOLOGY.md`

### 7–8 Sprachgrenzen / sync-async
- `ARCHITECTURE.md`
- `API_CONTRACTS.md`
- `UNIFIED_INGESTION_LAYER.md`
- `execution_mini_plan_3.md`

### 9–10 Source fabric / retrieval
- `UNIFIED_INGESTION_LAYER.md`
- `REFERENCE_SOURCE_STATUS.md`
- `PROVIDER_LIMITS.md`
- `ai_retrieval_knowledge_infra_full.md`
- `MEMORY_ARCHITECTURE.md`

### 11–14 Agenten / Search / Tooling / Sandbox
- `AGENT_ARCHITECTURE.md`
- `AGENT_TOOLS.md`
- `TOOL_SEARCH.md`
- `plan-modus-agent.txt`
- `ERRORS.md`

### 15–18 GeoMap / Simulation / libs
- `GEOPOLITICAL_MAP_MASTERPLAN.md`
- `GAME_THEORY.md`
- `GEOPOLITICAL_OPTIONS.md`
- `EXECUTION_PLAN.md`
- `RUST_LANGUAGE_IMPLEMENTATION.md`
- `FRONTEND_DESIGN_TOOLING.md`

### 19 Domainbrücken
- `INDICATOR_ARCHITECTURE.md`
- `Portfolio-architecture.md`
- `ENTROPY_NOVELTY.md`
- `POLITICAL_ECONOMY_KNOWLEDGE.md`

### 20–22 Runtime / ops / evolution
- `API_CONTRACTS.md`
- `ERRORS.md`
- `AUTH_SECURITY.md`
- `EXECUTION_PLAN.md`
- `execution_mini_plan_3.md`

### 23–24 kritische Bewertung / offene Punkte
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`
- `ai_retrieval_knowledge_infra_full.md`
- `TOOL_SEARCH.md`
- `plan-modus-agent.txt`

## Anhang B – Vollständige interne Quelleninventur

### Kernarchitektur und Verträge
- `ARCHITECTURE.md`
- `EXECUTION_PLAN.md`
- `API_CONTRACTS.md`
- `SYSTEM_STATE.md`
- `AUTH_SECURITY.md`
- `FRONTEND_ARCHITECTURE.md`
- `UIL_ROUTE_MATRIX.md`
- `CAPABILITY_REGISTRY.md`
- `ROLLOUT_GATES.md`
- `ERRORS.md`
- `ERRORS2.md`

### GeoMap, Geo-Infrastruktur und Verifikation
- `GEOPOLITICAL_MAP_MASTERPLAN.md`
- `GEOPOLITICAL_OPTIONS.md`
- `GEOMAP_VERIFY.md`
- `GEOCODING_STRATEGY.md`
- `PMTILES_CONTRACT.md`
- `CLAIM_VERIFICATION_ARCHITECTURE.md`

### Wissensraum, Memory, Retrieval und Agenten
- `MASTER_ARCHITECTURE_SYNTHESIS_2026.md`
- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`
- `KG_ONTOLOGY.md`
- `MEMORY_ARCHITECTURE.md`
- `CONTEXT_ENGINEERING.md`
- `AGENT_ARCHITECTURE.md`
- `AGENT_TOOLS.md`
- `ai_retrieval_knowledge_infra_full.md`
- `TOOL_SEARCH.md`
- `plan-modus-agent.txt`

### Simulation, Domänenmodelle und Compute
- `GAME_THEORY.md`
- `INDICATOR_ARCHITECTURE.md`
- `Portfolio-architecture.md`
- `RUST_LANGUAGE_IMPLEMENTATION.md`
- `ENTROPY_NOVELTY.md`
- `POLITICAL_ECONOMY_KNOWLEDGE.md`

### UIL, Provider und Arbeits-/Migrationsdocs
- `UNIFIED_INGESTION_LAYER.md`
- `REFERENCE_SOURCE_STATUS.md`
- `PROVIDER_LIMITS.md`
- `FRONTEND_DESIGN_TOOLING.md`
- `PARTNER_BOUNDARY.md`
- `PAYMENT_ADAPTER.md`
- `PLUGIN_PILOT.md`
- `execution_mini_plan.md`
- `execution_mini_plan_3.md`
- `execution_mini_2.md`

## Anhang C – Externe Validierungsquellen

- **WEB-01** – OpenSandbox Code Interpreter SDK / OpenSandbox repository: https://github.com/alibaba/OpenSandbox/blob/main/sdks/code-interpreter/python/README.md
- **WEB-02** – Anthropic: Introducing advanced tool use / Tool Search Tool: https://www.anthropic.com/engineering/advanced-tool-use
- **WEB-03** – Claude Tool Search Tool docs: https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-search-tool
- **WEB-04** – LangGraph overview: https://docs.langchain.com/oss/python/langgraph/overview
- **WEB-05** – Exa search API reference: https://exa.ai/docs/reference/search
- **WEB-06** – deck.gl docs: https://deck.gl/docs
- **WEB-07** – xyflow / React Flow docs: https://reactflow.dev/learn
- **WEB-08** – PyGambit / Gambit docs: https://gambitproject.readthedocs.io/en/stable/pygambit.html
- **WEB-09** – Mesa docs: https://mesa.readthedocs.io/
- **WEB-10** – python-control docs: https://python-control.readthedocs.io/
- **WEB-11** – do-mpc docs: https://www.do-mpc.com/en/latest/getting_started.html
- **WEB-12** – CasADi docs: https://web.casadi.org/docs/
- **WEB-13** – OpenSpiel docs: https://openspiel.readthedocs.io/en/latest/intro.html
- **WEB-14** – NATS JetStream docs: https://docs.nats.io/nats-concepts/jetstream
- **WEB-15** – Connect RPC docs: https://connectrpc.com/docs/introduction/
- **WEB-16** – petgraph docs: https://docs.rs/petgraph/
- **WEB-17** – h3o docs: https://docs.rs/h3o

## Anhang D – Gesprächsbasierte Architekturentscheidungen, die ausdrücklich in dieses Dokument eingeflossen sind

- Explizite Search-Layer für Agenten sind architektonisch relevant; implizites LLM-Denken reicht nicht aus.
- Beam Search ist der pragmatische Startpunkt vor vollem MCTS für den produktiven Szenariopfad.
- OpenSandbox ist Teil der Runtime-Architektur, nicht bloß ein Komforttool.
- GeoMap und Simulation werden als gekoppelter Dual-Modus modelliert.
- Simulation arbeitet auf Snapshots/Branches und darf den kanonischen Wissensraum nicht direkt überschreiben.
- Websearch erhält bewusst niedrigere Anfangs-Confidence und dient primär Discovery, Freshness und Coverage Expansion.
- Go bleibt als Network-/Control-Layer zentral und darf durch die Modellierungsdiskussion nicht ausgeblendet werden.
- Python first, Rust selective acceleration: keine verfrühte Rust-Totalisierung.
- KG, Vector, Claim/Evidence und Overlay werden nicht als konkurrierende Alternativen, sondern als geschichtete Komplementärsysteme verstanden.
- Planner/Executor/Replanner und Tool Search werden als Agentenruntime-Muster aufgenommen, aber nicht zur neuen Gesamtverfassung überhöht.

## Anhang E – Kurzform der Architektur in einem Diagramm

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ Frontend / Workspace / GeoMap / Review / User Overlay / Local Memory     │
└───────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ Go Control Plane                                                          │
│ - API Frontdoor  - Auth/Policy  - Contracts  - Audit  - Streaming         │
│ - Connector routing  - Job orchestration  - Promotion gates               │
└───────────────────────────────────────────────────────────────────────────┘
                 │                         │                        │
                 ▼                         ▼                        ▼
┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│ Knowledge & Memory Plane  │  │ Retrieval & Discovery     │  │ Agent & Simulation Plane  │
│ Canonical graph           │  │ Structured + graph +      │  │ Planner / Executor /      │
│ Fast event graph          │  │ vector + open-web         │  │ Replanner / Search /      │
│ Claim/Evidence/Stance     │  │                           │  │ Game & Control models     │
│ Overlay + episodic memory │  │                           │  │ Scenario branches         │
└───────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘
                 │                                              │
                 ▼                                              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ Python semantic/LLM/verification/simulation layer                         │
└───────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ Rust acceleration layer (graph/spatial/ODE/MC kernels)                    │
└───────────────────────────────────────────────────────────────────────────┘
```