# MASTER ARCHITECTURE SYNTHESIS 2026

> **ARCHIVIERT:** 09. Maerz 2026
> **Inhalt verteilt in:** `docs/specs/ARCHITECTURE.md`, `docs/specs/EXECUTION_PLAN.md`, `docs/MEMORY_ARCHITECTURE.md`, `docs/CONTEXT_ENGINEERING.md`, `docs/AGENT_ARCHITECTURE.md`, `docs/AGENT_TOOLS.md`
> Dieses Dokument bleibt als historischer Rationale-Snapshot erhalten.

> Stand: 06. März 2026  
> Zweck: Konsolidiertes Master-Dokument über Zielbild, Lücken, Architekturentscheidungen und Verteilplan für `tradeview-fusion`. Dieses Dokument zieht das bisherige Gespräch, die bestehenden internen Specs und aktuelle externe 2025/2026-Quellen zusammen.  
> Arbeitsmodus: **zu viel Kontext statt zu wenig**. Dieses Dokument ist absichtlich redundanter als die übrigen Specs und dient als Brückendokument für spätere Verteilung in spezialisierte MDs.

---

## 0. Executive Summary

`tradeview-fusion` ist **keine normale Trading-App** und sollte auch architektonisch nicht so behandelt werden. Das Zielsystem ist näher an einem **personal research operating system** als an einem klassischen Broker-Frontend. Der Kern besteht aus:

1. **Globaler Canonical Knowledge Graph (Backend)** für strukturierte Markt-, Geo-, Makro-, Behavioral- und Ontologie-Fakten.
2. **Schnelle Event-/Signal-Schicht** für probabilistische Live-Ereignisse, Kandidaten, Narrative, Widersprüche und laufende Relevanz.
3. **Per-User Overlay Graph (Frontend/local-first oder hybrid)** für Positionen, Watchlists, Journals, Alerts, Drawings, persönliche Relevanzgewichte, private Hypothesen und Overrides.
4. **Per-User Semantic Memory (lokal)** für Notizen, Snippets, Thesis-Entwürfe, ähnliche Situationen, semantisches Wiederfinden.
5. **Agent-Layer** mit deterministischen Guards, Retrieval-Policies, Capability-Tiers und striktem Tool-Scope.
6. **Go als Frontdoor / Control Plane**, **Python als Compute-/LLM-Schicht**, **Rust als Performance-Layer**, **Frontend als UI + local-first User Intelligence Workspace**.

Die wichtigste offene Frage ist **nicht** „KG oder Vector?“, sondern:

> **Wie werden globaler KG, lokaler User-Overlay, Claims/Beliefs und Agent-Kontext sauber zusammengeführt, ohne semantischen Schlamm zu erzeugen?**

Die Antwort dieses Dokuments lautet:

- **Overlay-first statt Daten-Merge-by-copy**
- **Claim/Evidence/Stance als eigener Modellbereich**
- **Graph für Struktur / Kausalität / Provenance**
- **Vector für Recall / Similarity / Retrieval**
- **Simulation als Branch/Snapshot, nie als Wahrheitsschicht**
- **Go bleibt Policy-Owner für Domain-Writes und Merge-Orchestrierung**

---

## 1. Konsolidiertes Zielbild

### 1.1 Produktverständnis

Das Produkt ist langfristig ein System für:

- Markt-Research
- Geo-/Makro-Analyse
- persönliche Thesenbildung
- Behavioral Analysis
- Agenten-gestützte Exploration
- visuelle Exploration über GeoMap / Graph / Timeline / Journal
- später Simulation (Game Theory / Control Theory / Szenario-Bäume)

Wichtig: Dies ist **kein** reines Broker-Frontend. Trading/Orders sind eine Capability unter mehreren, nicht der alleinige Kern.

### 1.2 Primäre Architekturformel

```text
Browser / Next.js
  -> Go Gateway / Control Plane
    -> Python Services / Agent Runtime / ML
      -> Rust Core / Heavy Compute

Parallel:
  local user overlay graph + local semantic memory
  <-> merge requests -> backend context assembly -> enriched response
```

### 1.3 Leitprinzipien

1. **Single Entry Policy Layer:** Browser spricht nur Next/Go, nicht Python direkt.
2. **Go owns domain writes:** Mutationen, Routing, Audit, Rate Limits, Idempotency.
3. **Python computes, Go governs:** Python rechnet, Go kontrolliert.
4. **Local-first nur für User-spezifische Daten:** nicht für globale Wahrheit.
5. **Graph != Vector:** unterschiedliche Aufgaben, unterschiedliche Schichten.
6. **Agenten bekommen least-privilege tools:** read-only standardmäßig, write nur über Tiers.
7. **Merge passiert logisch auf Query-Ebene:** nicht als chaotisches Datenbank-Verschmelzen.
8. **Simulation läuft auf Branches/Snapshots:** nie direkt auf SoR.

**Aladdin-Prinzipien (OSS-Übertrag):**

| Prinzip | Aladdin-Erkenntnis | Übertrag |
|---------|--------------------|----------|
| **Common Data Language** | Einheitliche Datenmodellierung über Front-, Middle-, Back-Office | Symbol-Normalisierung vorhanden; erweitern auf Asset-Klassen |
| **Single Source of Truth** | Doppelte Buchführung als Basis | Einheitliches Orders-/Positions-Modell; GCT + Paper aggregieren |
| **IBOR/ABOR** | IBOR = Echtzeit, ABOR = historisches Hauptbuch | Zurückgestellt (erst bei Live-Trading). Paper: Snapshot IBOR-ähnlich |
| **Event-Sourcing** | Kafka als Event-Bus | NATS JetStream / Postgres (kein Kafka) |

---

## 2. Was die bestehenden Dokumente bereits stark machen

### 2.1 Gute Dinge, die erhalten bleiben müssen

**A. Sprach- und Verantwortungsgrenzen**
- Next/Frontend als BFF/Thin Proxy
- Go als Single Point of Entry
- Python als interne Compute-Schicht
- Rust als Performance-Layer hinter Python

**B. Memory ist bereits mehrschichtig gedacht**
- M1 Working / Cache
- M2 KG
- M3 Episodic
- M4 Vector
- M5 Context Assembly

**C. Kontext und Speicher sind getrennt**
- `MEMORY_ARCHITECTURE.md` beschreibt *was wo gespeichert wird*
- `CONTEXT_ENGINEERING.md` beschreibt *wer wann was bekommt*

**D. Ontologie ist ernsthaft ontologisch gedacht**
- Canonical IDs
- Competency Questions
- FIBO / Wikidata / GLEIF / OpenFIGI / OpenSanctions als Quellen für Form und Identität

**E. Agenten sind nicht als monolithisches LLM gedacht**
- Rollen
- Guards
- Verifier
- Orchestrator
- Capability Tiers

**F. Governance existiert früh**
- Capability Registry
- Risk tiers
- Partner boundaries
- Rollout gates
- Plugin pilot

### 2.2 Was daran strategisch richtig ist

Die Architektur ist bereits deutlich näher an einer **plattformfähigen Research Engine** als an einem simplen App-Stack. Das ist gut. Ein späterer Rückbau auf „nur einfache CRUD + Charts“ wäre einfacher als der umgekehrte Weg.

---

## 3. Zielschichten für Wissen und Memory

### 3.1 Schicht A – Global Canonical Graph

**Ort:** Backend  
**Zweck:** strukturierte, nachvollziehbare, versionierte Domain-Wahrheit

**Inhalt:**
- Company
- Instrument
- Person
- Organization
- Country / Region
- Event
- Commodity
- Policy / Paradigm / Strategem / BTE Marker
- normierte Relationen
- Canonical IDs
- Provenance
- Gültigkeitsfenster / timestamps
- Confidence / source metadata

**Nicht hinein:**
- private User-Bewertungen
- spontane Journaleinträge
- UI-spezifische temporäre Exploration
- unmodellierte Text-Snippets als Primärform

### 3.2 Schicht B – Fast Event / Live Signal Layer

**Ort:** Backend  
**Zweck:** Live-Ereignisse, schnelle Kandidaten, Narrative, temporale Relevanz, Widersprüche

**Inhalt:**
- frische Geo-/Makro-/News-Candidates
- laufende Narrative-Cluster
- Contradictions / Merge-Links
- temporäre Event-Ketten
- Decay / TTL / Relevance / recency

**Merkmal:** probabilistischer und schneller als die Canonical-Schicht.

### 3.3 Schicht C – User Overlay Graph

**Ort:** Frontend local-first oder hybrid  
**Zweck:** persönliche explizite Struktur

**Inhalt:**
- Positionen
- Watchlists
- Alerts
- Drawings / Geo-Annotationen
- Journals (strukturierter Teil)
- Thesen als Objekte
- Szenarien
- private Edges
- persönliche Relevanzgewichte
- persönliche Override-Muster
- Prioritäten / Ignore / Pin / Focus

**Wichtig:** Der User-Graph ist **Overlay**, nicht zweiter Wahrheits-KG.

### 3.4 Schicht D – User Semantic Memory

**Ort:** Frontend lokal  
**Zweck:** semantisches Wiederfinden, ähnliche Situationen, Research Recall

**Inhalt:**
- Notizen
- Snippets
- Thesis drafts
- Journaltext
- Clip/Quote-Sammlungen
- vergangene Research-Pfade
- semantisch ähnliche Events / Calls / Artikel

### 3.5 Schicht E – Episodic Memory

**Ort:** Backend  
**Zweck:** Erfahrungswissen des Systems / der Agenten

**Inhalt:**
- vergangene Analysen
- historische Outcomes
- Override-Historie
- Accuracy / drift / feedback
- Analyse-Verläufe
- Performance vergangener Einschätzungen

### 3.6 Schicht F – Context Assembly

**Ort:** Backend primär, lokal ergänzend  
**Zweck:** dynamische Auswahl der relevanten Ausschnitte für UI oder Agent

**Regel:** Nie „alles laden“, immer task-/query-spezifische Auswahl mit Budget.

---

## 4. Endgültige KG-vs-Vector-Trennlinie

### 4.1 KG ist zuständig für

- Kausalität
- Ontologie
- mehrstufige Relationen
- Exposure-Ketten
- Provenance
- Conflict/Contradiction-Modellierung
- agentisches Traversieren
- Determinismus / Explainability
- path-based reasoning

**Beispiele:**
- Welche Firmen sind indirekt von Sanktionen betroffen?
- Welche Commodities hängen an Event X?
- Welche Positionen haben über Region → Commodity → Sector indirektes Exposure?
- Welche Widersprüche liegen zwischen Quelle A und B vor?

### 4.2 Vector ist zuständig für

- ähnliche Notizen finden
- ähnliche Events finden
- ähnliche Earnings Calls / Reden / Narrativ-Cluster finden
- semantische Recall-Funktion für unstrukturierte persönliche Daten
- ähnliche frühere Situationen / Journals / Research-Spuren

**Beispiele:**
- Zeig ähnliche Notizen zur aktuellen These.
- Welche früheren Journal-Einträge klingen so ähnlich?
- Welche drei alten Ereignisse sind semantisch dem aktuellen Setup ähnlich?

### 4.3 Konsequenz

**Nicht** in den Vector-Layer:
- harte globale Entitäten als Primärwahrheit
- Compliance-/Audit-kritische Beziehungen
- exakte Positionswahrheit
- regulierungs- oder order-relevante Domain-Fakten

**Nicht** in den KG erzwingen:
- jeder freie Textsplitter
- jede spontane semantische Ähnlichkeit
- Journaleinträge nur deshalb, weil „alles Graph“ modern klingt

---

## 5. Die eigentliche Kernfrage: Merge von globalem KG und User-Overlay

### 5.1 Das Problem

Der globale KG enthält strukturierte, kanonische Domain-Fakten. Der User-Overlay enthält persönliche Struktur, Prioritäten, Claims, Drawings, Journals, private Relevanz und Positionen. Wenn man beides unkontrolliert „merged“, entstehen:

- Identitätskonflikte
- semantische Unklarheit
- Leaks von privaten in globale Fakten
- unklare Ownership
- schwierig reproduzierbare Agent-Antworten
- unverständliche UI-Ergebnisse

### 5.2 Die Grundregel

> **Nicht Datenbanken zusammenkleben.**  
> **Stattdessen Query-Level Merge mit Overlay-Semantik.**

### 5.3 Technisches Merge-Muster

1. **Frontend queryt lokal den User-Overlay.**
2. Ergebnis ist ein kleines Set aus IDs / entity refs / local objects.
3. Frontend schickt nur notwendige Identifikatoren an Backend.
4. Backend assembled Kontext aus canonical KG + episodic + optional vector.
5. Backend antwortet mit angereichertem Ergebnis.
6. Frontend fused dieses Ergebnis wieder mit lokalem Overlay.

### 5.4 Merge-Typen

#### Intersection
Für Impact-Analysen.

```text
Backend sagt: Oil / Energy / XOM betroffen
User hat: XOM, CVX, GLD
=> Schnittmenge: XOM, CVX
```

#### Union
Für Exploration.

```text
User fragt: Was passiert in MENA?
=> lokale Watchlist/Alerts + backend events + narrative clusters
```

#### Enrichment
Für Detail-Ansichten.

```text
User klickt XOM
=> Frontend liefert XOM-ID
=> Backend liefert Kausalketten, Strategeme, Historie, aehnliche Events
```

### 5.5 Wichtigste Regel überhaupt

**Persönliche Daten werden nicht zu globalen Fakten.**  
Sie bleiben Overlay-Objekte oder Claim-Objekte.

---

## 6. Neues zentrales Modell: Claim / Evidence / Stance

Dies ist die wichtigste Ergänzung gegenüber den bisherigen Docs.

### 6.1 Warum dieses Modell nötig ist

Trading-/Research-Wissen ist oft nicht binär „wahr/falsch“. Es ist:

- zeitgebunden
- regimespezifisch
- evidenzbasiert
- persönlich gewichtet
- widerrufbar
- manchmal im Konflikt mit anderen Quellen

Ein einfaches Edge wie:

```text
User --[believes]--> China slowdown
```

ist zu grob.

### 6.2 Vorschlag: Claim als First-Class Object

```text
Claim
- claim_id
- subject_ref
- predicate
- object_ref or value
- owner_type (user|agent|system|source)
- confidence
- stance (support|oppose|uncertain|watch)
- time_scope
- regime_scope
- created_at
- updated_at
- expires_at
- provenance_refs[]
- evidence_refs[]
- contradicted_by[]
- supersedes[]
- status (active|stale|withdrawn|resolved)
```

### 6.3 Evidence als separater Typ

```text
Evidence
- evidence_id
- source_type (doc|event|price_action|manual_note|agent_extract)
- source_ref
- snippet / relation / metric
- confidence
- timestamp
- extractor
```

### 6.4 Stance als explizite Nutzersicht

```text
Stance
- stance_id
- claim_id
- actor (user or agent)
- stance_value (agree|disagree|monitor|hedge)
- weight
- reasoning_ref
```

### 6.5 Vorteile

- globale Fakten und persönliche Bewertungen bleiben getrennt
- Agent-Antworten werden besser auditierbar
- Konflikte sind modellierbar statt „kaputt“
- Zeit- und Regimeabhängigkeit wird ausdrückbar
- spätere Simulation/Backtesting kann Claims gegen Outcomes prüfen

### 6.6 Harte Regel

> **Beliefs nicht primär als lose Kanten modellieren.**  
> **Claims/Evidence/Stance als eigenständiger Modellbereich.**

---

## 7. Frontend-local-first: was lokal sein sollte und was nicht

### 7.1 Lokal sinnvoll

- User overlay graph
- persönliche Thesen
- Alerts / Drawings / Journals
- persönliche Tags / Scores / Weights
- lokales Vector Memory über private Texte
- explorative UI-Zustände
- latenzkritische private Workflows

### 7.2 Nicht lokal als Primärwahrheit

- globale kanonische Entity-Resolution
- vollständiger Markttruth
- zentrale Providerdaten
- Compliance-/Audit-Truth
- globale Conflict-Resolution
- finale Order-/Execution-Wahrheit

### 7.3 Sicherheitskonsequenz

Wenn lokaler User-KG persistiert wird, dann **verschlüsselt**.

Das vorhandene PRF-Konzept mit WebAuthn Level 3 ist gut und sollte beibehalten werden:
- PRF primary
- server-derived fallback
- key nur im memory
- IndexedDB nur verschlüsselte blobs

### 7.4 Zusätzliche Konsequenz

Local-first ist hier kein dogmatisches Ziel.  
Es ist ein Werkzeug für **private, latenzkritische, user-eigene Daten**.

---

## 8. Konkrete Datenbank-/Store-Empfehlung

### 8.1 Backend

#### Global Canonical Graph
**Favorit:** FalkorDB  
**Warum:** Cypher, Graph + Vector möglich, gute Passung für GraphRAG-/RAG-nahe Workloads und interaktive Graphdaten.

**Aber:** Nicht als unumstößliches Dogma verstehen. Für sehr große reine Dokument-Chunks oder stark filterlastige Vectorsuche kann eine separate Dokument-/Vector-Schicht später sinnvoll sein.

#### Episodic / relational / audit / policy
**Favorit:** Postgres (prod), SQLite für lokale Dev okay.

#### Cache / hot path
**Redis** bleibt sinnvoll.

#### Optional separater Doc-Vector Store
Nur bei echten Skalierungsgründen.

### 8.2 Frontend

#### Personal Overlay Graph
**Empfehlung:** Kuzu WASM prüfen / beibehalten

Warum passend:
- embedded
- Cypher
- graph analytics
- keine Serverpflicht
- gute semantische Nähe zu deinem lokalen User-KG-Konzept

#### Personal Semantic Memory
**Empfehlung:** PGlite + pgvector sehr ernsthaft prüfen

Warum:
- Browser/Postgres in WASM
- IndexedDB persistence
- pgvector verfügbar
- SQL gut für notes/snippets/chunks/metadata
- gute Ergänzung zu Kuzu statt Ersatz

### 8.3 Wichtigste Schlussfolgerung

> **Frontend Graph und Frontend Vector müssen nicht dieselbe Engine sein.**

Das ist wahrscheinlich die wichtigste Spezifizierungsänderung gegenüber einem zu monolithischen „alles in Kuzu“ oder „alles in Falkor“ Denken.

---

## 9. GitNexus: was du übernehmen solltest und was nicht

### 9.1 Was wertvoll ist

GitNexus zeigt, dass **client-side knowledge graph + local processing + Graph-RAG-artige Exploration** produktiv möglich ist.

Übernehmen:
- zero-server UX-Idee
- schnelle lokale Exploration
- interaktiver Graph als Denkoberfläche
- lokaler semantischer Zusatzlayer

### 9.2 Was nicht 1:1 übertragbar ist

Code-Graphen sind semantisch viel sauberer als Markt-/Geo-/Makro-Welten.

In deiner Domäne gibt es zusätzlich:
- Entity Resolution Unsicherheit
- zeitliche Gültigkeit
- widersprüchliche Quellen
- regimeabhängige Interpretation
- persönliche These vs. globale Faktenschicht
- probabilistische Kausalität

**Fazit:** GitNexus ist ein UX-/Muster- und nicht primär ein Domänenmodell-Vorbild.

---

## 10. Agenten: was sie wirklich von KG, Vector und Episodic haben

### 10.1 KG liefert Agenten

- strukturierte Fakten
- Kausalpfade
- deterministische Traversals
- Explainability
- Provable context slices

### 10.2 Vector liefert Agenten

- ähnliche Situationen
- ähnliche Calls / ähnliche Snippets
- Recall über unstrukturierte Texte
- narrative Ähnlichkeiten

### 10.3 Episodic liefert Agenten

- Erfahrungswissen
- letzte Analysen ähnlicher Fälle
- Feedback / Override-Historie
- Accuracy und Fail-Patterns

### 10.4 Working Memory liefert Agenten

- aktuelle Session / aktuelle Task / aktuelle Input-Fragmente
- Schnellkontext

### 10.5 Harte Policy

Agenten dürfen **nicht** frei zwischen allem lesen/schreiben.  
Sie müssen über Capability Tiers und Tool-Scopes laufen:

- `read-only`
- `bounded-write`
- `approval-write`

Das existierende Capability-Modell ist hierfür der richtige Kern.

---

## 11. Simulation / Game Theory / Control Theory

### 11.1 Eigene Schicht, nicht still in Truth schreiben

Simulationen dürfen **nicht** direkt globale KG-Knoten oder user-overlay-truth überschreiben.

### 11.2 Simulation braucht eigene Objekte

```text
Scenario
- scenario_id
- base_snapshot_ref
- assumptions[]
- triggered_claims[]
- interventions[]
- simulation_type (game_theory|control|rule|monte_carlo)
- created_by
- visibility
```

```text
ScenarioRun
- run_id
- scenario_id
- params
- outputs
- result_graph_ref
- metrics
- timestamp
```

### 11.3 Visualisierung

Die GeoMap ist dafür eine starke Oberfläche, aber die Daten müssen branchartig modelliert sein:
- base snapshot
- branch
- compare
- discard or promote

### 11.4 Regel

> **Simulation ist hypothetisch.**  
> **Hypothetisches Wissen lebt in Szenarioobjekten, nicht in der Canonical-Wahrheit.**

---

## 12. Sync, Multi-Device und Konflikte

### 12.1 Was aktuell gut ist

- lokaler User-KG
- Encryption-Konzept
- Go als Policy-Layer

### 12.2 Was noch fehlt

Ein explizites Konfliktmodell für Multi-Device / Offline / Re-Sync.

### 12.3 Nötige Sync-Konzepte

- stable local ids
- tombstones
- version vectors / lamport-ish ordering oder zumindest last-write-policy je Objektklasse
- conflict classes
- merge hooks
- replay-safe sync
- encrypted blob sync vs structured sync unterscheiden

### 12.4 Wichtige Trennung

**Sync von User-Overlay** != **Merge von User-Overlay mit Global KG**

Das sind zwei verschiedene Probleme.

- Sync = mehrere Geräte desselben Users
- KG Merge = lokale private Sicht + globale Fakten zusammenbringen

Diese Trennung muss in den Docs deutlicher werden.

---

## 13. Governance, Security und Trust-Fabric

### 13.1 Beibehalten

- Capability Registry
- Partner boundaries
- plugin pilot
- rollout gates
- agent policy tiers

### 13.2 Ergänzen

#### A. Trust-Fabric sollte Claims und Agenten explizit einschließen
Nicht nur user/service identity, sondern auch:
- agent identity
- generated claim identity
- approval provenance
- human override lineage

#### B. Governance Events in alle write-/merge-/promotion-Pfade einziehen
Wichtig für:
- claim promotion
- contradiction resolution
- scenario publication
- plugin-driven or partner-driven side effects

#### C. Simulation-/Agent-Outputs brauchen Promotion Gates
Nicht jeder Agent-Output wird automatisch Teil des Semantics-Layers.

---

## 14. Frontend-SOTA 2026: was konkret relevant ist

### 14.1 Dinge, die zu deinem Stack passen

- Next.js 16 + React Compiler + Cache Components / `use cache`
- TanStack Query als Standard für Server State
- `useEffect` weiter reduzieren, nur für subscriptions / imperative browser APIs / timers
- TanStack DB höchstens für eng begrenzte Pilot-Flows

### 14.2 Nicht übertreiben

TanStack DB ist interessant für stark interaktive lokale Collections. Aber dein eigenes Frontend-Dokument hat recht: **Pilot, nicht globale Religion**.

### 14.3 Zusätzlicher Gedanke

Für dein Produkt ist **UI-State** nicht der Engpass.  
Der Engpass ist **Wissens- und Merge-Semantik**.  
Also nicht zu früh neue State-Layer aufblasen.

---

## 15. Neue harte Architekturentscheidungen (empfohlen)

### Entscheidung 1
**User-KG ist Overlay, nicht Spiegel des Backend-KG.**

### Entscheidung 2
**Claims/Evidence/Stance werden als eigener Modellbereich eingeführt.**

### Entscheidung 3
**Merge geschieht query-basiert über IDs/refs, nicht per rohem DB-Union.**

### Entscheidung 4
**Simulation bekommt Snapshot-/Branch-Modell.**

### Entscheidung 5
**Frontend Graph und Frontend Semantic Memory dürfen unterschiedliche Engines nutzen.**

### Entscheidung 6
**FalkorDB ist vorerst Favorit für globalen Graph, aber reine Dokument-Vector-Last bleibt optional separat.**

### Entscheidung 7
**Agent-Writes bleiben streng tiered; read-only default.**

### Entscheidung 8
**Trust-Fabric wird um claims, agents, overrides und promotions erweitert.**

---

## 16. Offene Lücken / ungelöste Punkte

### Kritisch
1. Formaler Merge-Contract fehlt noch.
2. Claim/Evidence/Stance noch nicht in bestehender Ontologie/Memory formal verankert.
3. Simulation/Scenario-Branching nicht als eigener Datenbereich beschrieben.
4. Multi-Device Sync-Semantik unklar.
5. Policy für Promotion von Agent-Output -> persistent semantic layer noch nicht konkret genug.

### Mittel
6. Entscheidung Kuzu-only vs Kuzu+PGlite im Frontend offen.
7. Langfristige Falkor-only vs optionaler dedizierter Doc-Vector-Store offen.
8. Eval-/Backtesting-Kopplung zu Claims und Overrides könnte expliziter sein.
9. Konfliktmodell für private vs globale Widersprüche noch zu grob.

### Niedriger
10. A2A ist interessant, aber später.
11. WebMCP/DevTools MCP sind wichtig, aber nicht Kern der Wissensarchitektur.

---

## 17. Konkreter Verteilplan auf bestehende MDs

### 17.1 Neues Dokument, das definitiv angelegt werden sollte

**Vorschlag:** `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`

**Warum eigenes Doc?**
Weil dieses Thema mehrere bestehende Dokumente gleichzeitig berührt, aber nirgends vollständig und formal zusammenhängend beschrieben ist.

### 17.2 Was in dieses neue Doc gehört

- Begriffe: canonical graph / fast lane / user overlay / claim / evidence / stance / scenario
- Merge-Typen
- Merge-API
- ID-/Namespace-Regeln
- Konfliktklassen
- Privacy-Regeln für merge requests
- Simulation branch semantics
- Promotion / resolution / contradiction / supersession

### 17.3 Was danach in andere Docs verteilt werden sollte

#### `MEMORY_ARCHITECTURE.md`
Ergänzen:
- Claim/Evidence/Stance als neue Untersektion in Semantic/Episodic Übergang
- klare Trennung von user overlay vs semantic truth
- Frontend Graph + Frontend Semantic Memory als zwei getrennte Stores diskutieren

#### `CONTEXT_ENGINEERING.md`
Ergänzen:
- Merge policies um Claim-/Stance-aware Kontext
- Query-Typen für scenario compare / contradiction review / thesis validation
- Ranking-Inputs aus Claims + Evidence + override history

#### `KG_ONTOLOGY.md`
Ergänzen:
- Claim, Evidence, Stance, Scenario, ScenarioRun als Ontologieklassen
- Namespace-Regeln / owner_type / provenance semantics
- zusätzliche competency questions für user/global merge und contradiction reasoning

#### `AUTH_SECURITY.md`
Ergänzen:
- Security-Konsequenzen von Kuzu+PGlite oder dualem local store
- encryption boundary bei claim/evidence local sync
- threat model für semantische private notes

#### `AGENT_ARCHITECTURE.md`
Ergänzen:
- welche Rollen Claims erzeugen dürfen
- welche Rollen nur Evidence lesen dürfen
- Promotion gate von extractor/verifier/synthesizer output zu persistent claims

#### `AGENT_TOOLS.md`
Ergänzen:
- getrennte Tool-Scopes für `get_user_overlay`, `get_claims`, `get_evidence`, `run_scenario`, `propose_claim`

#### `ARCHITECTURE.md`
Ergänzen:
- neue Zielarchitektur-Grafik: global truth + user overlay + semantic memory + merge orchestrator

#### `SYSTEM_STATE.md`
Ergänzen:
- Ist vs Soll für Merge Layer, Claim Store, Scenario Layer, local vector choice

#### `FRONTEND_ARCHITECTURE.md`
Ergänzen:
- ob Kuzu allein bleibt oder PGlite dazukommt
- local data domains explizit trennen: overlay graph / semantic notes / query cache / UI state

#### `EXECUTION_PLAN.md`
Neue Phase oder Unterphase:
- Merge Contract
- Claim/Evidence/Stance model
- Scenario Branching
- local semantic memory decision
- multi-device sync semantics

---

## 18. Empfohlene Reihenfolge für die Umsetzung

### Phase A – Begriffliche Konsolidierung
1. Neues Merge/Overlay-Dokument erstellen.
2. Claim/Evidence/Stance formal festziehen.
3. Szenario-/Simulation-Modell definieren.

### Phase B – Architektur-Contracts
4. Merge API und Payload-Formate definieren.
5. Namespace-/ID-Regeln definieren.
6. Konfliktklassen und Promotion-Regeln definieren.

### Phase C – Store-Entscheidungen
7. Entscheiden: Kuzu-only oder Kuzu + PGlite lokal.
8. Entscheiden: Falkor-only vs optionaler Doc-Vector-Store.

### Phase D – Agent & Governance
9. Capability-Scopes für Claim-/Scenario-/Merge-Operationen definieren.
10. Governance events / audit / trust-fabric erweitern.

### Phase E – Verteilung
11. Inhalte aus diesem Master-Dokument gezielt in die Fachdocs zurückverteilen.
12. Master-Dokument danach als Snapshot / rationale / decision log behalten.

---

## 19. Meine harte Empfehlung für den nächsten konkreten Schritt

**Ja:** Ein eigenes MD ist hier der richtige Zug.  
**Ja:** Danach solltest du es in Cursor/IDE in die bestehenden Fachdokumente zurückverteilen.  
**Nein:** Du solltest die Inhalte nicht sofort überall direkt hineinkippen, ohne zuerst einen formalen Merge-/Claim-Kern zu stabilisieren.

Der beste Workflow ist:

1. **Dieses Master-Dokument als Überlaufbecken / Synthese-Dokument**
2. **Daraus ein fokussiertes `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md` destillieren**
3. **Dann abschnittsweise in die Spezialdokumente zurückverteilen**
4. **Im jeweiligen Absatz immer Verweise auf bestehende Docs setzen**

So bleibt die Architektur lesbar und du vermeidest doppelte, leicht divergierende Wahrheit.

---

## 20. Vorschlag für Dateinamen

Diese historische Namenssektion ist inzwischen durch den realen Repo-Schnitt
ueberholt. Heute gelten stattdessen als passende Ziel-/Fachdokumente:

- `KG_MERGE_AND_OVERLAY_ARCHITECTURE.md`
- `CLAIM_VERIFICATION_ARCHITECTURE.md`
- `MEMORY_ARCHITECTURE.md`
- `CONTEXT_ENGINEERING.md`

---

## 21. Interne Quellenbasis

Diese Dokumente waren für die Synthese besonders relevant:

- `KG_ONTOLOGY.md`
- `MEMORY_ARCHITECTURE.md`
- `CONTEXT_ENGINEERING.md`
- `AGENT_ARCHITECTURE.md`
- `AGENT_TOOLS.md`
- `FRONTEND_ARCHITECTURE.md`
- `AUTH_SECURITY.md`
- `ARCHITECTURE.md`
- `SYSTEM_STATE.md`
- `API_CONTRACTS.md`
- `EXECUTION_PLAN.md`
- `CAPABILITY_REGISTRY.md`
- `PARTNER_BOUNDARY.md`
- `PLUGIN_PILOT.md`
- `ROLLOUT_GATES.md`

---

## 22. Externe Quellenbasis (2025/2026)

> Nur die wirklich architektur-relevanten Quellen, nicht jede Randquelle.

### Frontend / App Architecture
- Next.js 16 Blog: https://nextjs.org/blog/next-16
- Next.js Cache Components / `use cache`: https://nextjs.org/docs/app/getting-started/cache-components
- `use cache` directive: https://nextjs.org/docs/app/api-reference/directives/use-cache
- TanStack Query Docs: https://tanstack.com/query/latest
- TanStack DB: https://tanstack.com/db

### Graph / Vector / Local-first
- FalkorDB Vector Index Docs: https://docs.falkordb.com/cypher/indexing/vector-index.html
- FalkorDB Procedures (`db.idx.vector.queryNodes` / relationships): https://docs.falkordb.com/cypher/procedures.html
- FalkorDB Overview: https://docs.falkordb.com/
- Kuzu repository / overview: https://github.com/kuzudb/kuzu
- Kuzu-WASM reference repo: https://github.com/unswdb/kuzu-wasm
- PGlite docs: https://pglite.dev/docs/
- PGlite filesystems / IndexedDB: https://pglite.dev/docs/filesystems
- PGlite about / pgvector support: https://pglite.dev/docs/about
- PGlite extensions: https://pglite.dev/extensions/

### Auth / Security / Local encryption
- WebAuthn Level 3: https://www.w3.org/TR/webauthn-3/
- FIDO CTAP 2.2: https://fidoalliance.org/specs/fido-v2.2-ps-20250714/fido-client-to-authenticator-protocol-v2.2-ps-20250714.html

### Agent interoperability / tools
- A2A Protocol docs: https://a2a-protocol.org/latest/
- A2A spec: https://a2a-protocol.org/latest/specification/
- A2A vs MCP: https://a2a-protocol.org/latest/topics/a2a-and-mcp/
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp

### Reference product / pattern inspiration
- GitNexus repository: https://github.com/abhigyanpatwari/GitNexus

---

## 23. Abschlussurteil

Die Richtung stimmt. Die Architektur ist bereits ungewöhnlich stark. Aber das System braucht jetzt eine **formale Sprache für den Übergang zwischen globaler Wahrheit, persönlicher Sicht, semantischem Recall und agentischer Ableitung**.

Solange dieser Übergang nicht sauber modelliert ist, bleibt das Projekt konzeptionell klüger als seine Verträge.  
Sobald dieser Übergang sauber modelliert ist, wird aus vielen guten Mosaiksteinen ein wirklich belastbares Gesamtsystem.

**Die drei wichtigsten nächsten Entscheidungen sind:**

1. Merge-Contract schreiben.
2. Claim/Evidence/Stance modellieren.
3. Frontend-Graph und Frontend-Semantic-Memory bewusst entkoppeln, falls es technisch sinnvoll bleibt.

