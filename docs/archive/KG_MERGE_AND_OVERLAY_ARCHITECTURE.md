# KG Merge & Overlay Architecture

> **ARCHIVIERT:** 09. Maerz 2026  
> **Inhalt verteilt in:** `docs/specs/ARCHITECTURE.md`, `docs/MEMORY_ARCHITECTURE.md`, `docs/CONTEXT_ENGINEERING.md`, `docs/AGENT_ARCHITECTURE.md`, `docs/AGENT_TOOLS.md`, `docs/specs/API_CONTRACTS.md`, `docs/specs/AUTH_SECURITY.md`, `docs/CLAIM_VERIFICATION_ARCHITECTURE.md`, `docs/UNIFIED_INGESTION_LAYER.md`  
> Dieses Dokument dient nur noch als Referenz fuer die Konsolidierungsherkunft.

> **Stand:** 06. März 2026  
> **Status:** Neue verbindliche Spezifikation (Draft v1)  
> **Zweck:** Definiert die **präzise Vertragsarchitektur** zwischen globalem Backend-KG und lokalem User-Overlay-KG inkl. IDs, Namespaces, Merge-Regeln, Claim/Evidence/Stance-Modell, Query-Flows, Konfliktklassen, Simulation-Branches, Agent-Zugriffsregeln und Verteilplan in bestehende Dokumente.  
> **Primär betroffen:** `MEMORY_ARCHITECTURE.md`, `KG_ONTOLOGY.md`, `CONTEXT_ENGINEERING.md`, `AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md`, `FRONTEND_ARCHITECTURE.md`, `AUTH_SECURITY.md`, `SYSTEM_STATE.md`, `API_CONTRACTS.md`, `EXECUTION_PLAN.md`

---

## 0. Executive Summary

Das System verwendet **keinen einheitlichen KG**, sondern ein **mehrschichtiges Wissensmodell**:

1. **Global Canonical Graph (Backend)**  
   Source of Truth für Domain-Fakten, Ontologie, kanonische Entitäten, Event-Ketten, Strategeme, Behavioral-Wissen und historische Struktur.

2. **Fast Event Graph (Backend)**  
   Zeitkritische, probabilistische Live-Schicht mit TTL/Decay für Events, Akteure, Commodities, Transmission Paths und Krisen-Dynamiken.

3. **User Overlay Graph (Frontend, lokal)**  
   Persönliche, private, latenzkritische und offline-fähige Wissensschicht des Users. Kein zweiter Wahrheitsgraph, sondern Overlay über kanonische Entitäten.

4. **Personal Semantic Memory (Frontend lokal, optional hybrid)**  
   Semantischer Recall-Layer für Notizen, Journals, Snippets, Thesis-Drafts und Research-Pfade. Kein Ersatz für KG-Struktur.

**Kernentscheidung:**  
Das Problem wird **nicht** durch physisches Zusammenführen von Frontend- und Backend-KG gelöst, sondern durch **Overlay + deterministische Merge-Contracts auf Query-Ebene**.

---

## 1. Problemstellung

Die bisherige Architektur hat die richtige Grundidee:

- Shared Backend-KG + per-User Frontend-KG
- Merge-Layer im Frontend
- Backend bleibt Source of Truth
- User-KG bleibt privat, schnell, offline-fähig

Was bisher **nicht formal genug** definiert ist:

- Wie IDs und Namespaces zwischen global und personal getrennt werden
- Wie subjektive User-Thesen modelliert werden
- Wie Claims, Evidence, Stance und Confidence gespeichert werden
- Wie Konflikte klassifiziert werden
- Wie Merge tatsächlich abläuft
- Wie Simulationen vom kanonischen Wissen getrennt werden
- Wie Agenten diese Schichten lesen/schreiben dürfen

Diese Spezifikation schließt genau diese Lücke.

---

## 2. Designziele

### 2.1 Ziele

- **Keine Vermischung von Fakt und Meinung**
- **Keine direkte Mutation globaler Wahrheiten aus dem Frontend**
- **Latenzarme User-zentrische Queries**
- **Privacy-first für User-spezifische Beziehungsdaten**
- **Offline-/local-first für persönlichen Research-Kontext**
- **Deterministische Merge-Semantik**
- **Agentensichere Read/Write-Grenzen**
- **Simulation ohne Wahrheitskorruption**
- **Saubere Erweiterbarkeit für spätere Sync-/Multi-Device-/Collab-Szenarien**

### 2.2 Nicht-Ziele

- Kein vollständiger globaler Markt-KG im Browser
- Kein physisches “Mergen” subjektiver User-Kanten in den kanonischen KG
- Kein Vector-Store als Ersatz für kontrastive oder kausale Queries
- Keine direkte Backend-Truth-Mutation über Next.js Local Stores
- Keine Simulationsresultate als normale Fact-Edges

---

## 3. Architekturprinzipien

1. **Overlay, nicht Kopie**  
   Der User-KG enthält private Relationen, Objekte und Referenzen auf globale IDs, besitzt aber nicht die globale Ontologie.

2. **Canonical IDs als einzige Brücke**  
   Jede globale Entität hat eine stabile kanonische ID. User-Daten referenzieren diese IDs, überschreiben sie aber nicht.

3. **Merge auf Query-Ebene, nicht auf Storage-Ebene**  
   Der Browser fusioniert lokale User-Kontexte mit Backend-Resultaten. Die Datenbanken bleiben logisch getrennt.

4. **Claim-first statt belief-as-edge**  
   Persönliche Überzeugungen, Bewertungsmodelle, Gegenthesen und Narrative werden als Claim-/Evidence-/Stance-Objekte modelliert, nicht als rohe “belief”-Edges.

5. **Simulation als Branch**  
   Simulationsläufe erzeugen Szenario-Branches / Snapshots / Outputs, aber mutieren nie den kanonischen KG.

6. **Agenten erhalten schichtenspezifische Zugriffsrechte**  
   Read-only, bounded-write und approval-write gelten auch für Memory-Schichten.

7. **Graph für Struktur, Vector für semantischen Recall**  
   Harte Relationen, Multi-Hop- und Contradiction-Queries liegen im Graph. Ähnlichkeitssuche, Note-Recall und narrative Parallelen liegen im Vector-/Document-Layer.

---

## 4. Wissensschichten (verbindlich)

## 4.1 Global Canonical Graph

**Rolle:** Domain-Wahrheit  
**Ort:** Backend  
**Engine (geplant):** FalkorDB  

**Aladdin-Gap (Graph DB):** Canonical Graph, Fast Event Graph. OSS-Optionen: FalkorDB (Redis-kompatibel) oder Kuzu (bereits in pyproject.toml). Priorität: Mittel. Aladdin-Benchmark: Enterprise nutzt Neo4j; wir bleiben bei OSS.

**Inhalt:**

- Company
- Instrument / Symbol
- Country / Region
- Organization
- Person / Actor
- Commodity
- Event Category / Geo Event
- Strategem / Crisis Phase / Signal Type
- BTE Marker / Behavioral State / Needs / Decision Style
- Canonical relation types
- Provenance
- Confidence
- Validity windows

**Regel:** Nur backend-owned.

---

## 4.2 Fast Event Graph

**Rolle:** Live-/Probabilistik-Schicht  
**Ort:** Backend  
**Eigenschaften:**

- TTL
- Temporal Weight Decay
- Event freshness
- derived edges
- uncertain / probabilistic links
- routeTarget / contradiction candidates
- fast ingest outputs

**Regel:** Kein semantischer Langzeitspeicher. Nicht Source of Truth für stabile Domain-Ontologie.

---

## 4.3 User Overlay Graph

**Rolle:** Persönlicher, privater, lokaler Struktur-Layer  
**Ort:** Frontend lokal  
**Engine (empfohlen):** Kuzu WASM oder funktional äquivalenter lokaler Graph-Store  
**Inhalt:**

- Position
- WatchItem
- Alert
- JournalEntry (strukturiert referenzierbar)
- Drawing / Annotation
- UserScenario
- UserRule
- Override
- Bookmark
- Ignore / Snooze / Focus
- persönliche Relationen zwischen eigenen Objekten
- Referenzen auf globale Canonical IDs
- selektive gecachte Domain-Subsets (nur Query-Helfer)

**Regel:** Kein zweiter Wahrheits-KG.

---

## 4.4 Personal Semantic Memory

**Rolle:** Persönlicher semantischer Recall-Layer  
**Ort:** Frontend lokal, optional hybrid  
**Engine (empfohlen):** PGlite + pgvector oder funktional äquivalente Lösung  
**Inhalt:**

- Note chunks
- Research snippets
- thesis drafts
- conversation excerpts
- summaries
- journaling text
- research session trails
- semantische Snapshots

**Regel:** Semantischer Recall, kein Faktenspeicher.

---

## 4.5 Episodic Memory

**Rolle:** Agent- und User-Erfahrung  
**Ort:** Primär Backend (SoR), selektiv lokal spiegelbar  
**Inhalt:**

- Agent outputs
- override logs
- evaluation logs
- workflow logs
- research logs
- accept/reject/reclassify actions
- simulation runs
- historical impact decisions
- accuracy / calibration artifacts

---

## 5. Storage-Entscheidungen

| Schicht | Empfohlene Engine | Grund |
|---|---|---|
| Global Canonical Graph | FalkorDB | Graph + moderate Vector-Nähe, guter Fit für Domain-KG |
| Fast Event Graph | FalkorDB oder Go-owned derived graph layer | gleiche Query-Semantik, eventnahe Traversals |
| User Overlay Graph | Kuzu WASM | embedded, graphisch, local-first |
| Personal Semantic Memory | PGlite + pgvector | Browser, IndexedDB, SQL + semantischer Recall |
| Episodic Memory | Postgres | Audit, Ereignisse, Versionen, Logs |
| Working/Cache | Redis / TanStack Query / Browser Cache | Latenz- und TTL-Schicht |

**Wichtige Architekturregel:**  
FalkorDB darf mittelfristig auch Vector Workloads abdecken. Für große reine Dokumentkorpora bleibt eine getrennte Vector-/Doc-Schicht ausdrücklich erlaubt.

---

## 6. Namespace- und ID-Modell

## 6.1 Grundregel

IDs sind **nie** frei im gesamten System global zufällig verteilt, sondern haben **Namespace + Typ + Stabilitätssemantik**.

## 6.2 Namespace-Klassen

| Namespace | Bedeutung | Beispiel |
|---|---|---|
| `g:` | global canonical | `g:company:lei:529900...` |
| `e:` | event/fast-lane/global event | `e:geo:evt_iran_sanc_2026_02_01` |
| `u:` | user-local object | `u:watchitem:uuid` |
| `c:` | claim object | `c:claim:uuid` |
| `x:` | evidence object | `x:evidence:uuid` |
| `s:` | simulation branch/object | `s:branch:uuid` |
| `m:` | semantic memory document/chunk | `m:chunk:uuid` |

## 6.3 Canonical ID Priorität

Globale Entitäten erhalten IDs in bevorzugter Reihenfolge aus formalen Quellen:

1. LEI / FIGI / ISIN / Wikidata QID / interner stabiler Canonical Key
2. falls nicht vorhanden: deterministischer interner ID-Generator mit Typpräfix
3. keine User-generierten Zufalls-IDs für globale Fakten

## 6.4 User-IDs

Alle lokalen User-Objekte sind:

- originär lokal erzeugt
- user-gebunden
- nicht als globale Fakten interpretierbar
- serverseitig nur als verschlüsselte/synchronisierte User-Artefakte erlaubt

---

## 7. Objektmodell (verbindlich)

## 7.1 Canonical Domain Nodes

Beispiele:

- `Company`
- `Instrument`
- `Symbol`
- `Country`
- `Region`
- `Actor`
- `Organization`
- `Commodity`
- `GeoEvent`
- `Strategem`
- `CrisisPhase`
- `BTE_Marker`
- `BehavioralState`
- `NeedType`
- `DecisionStyle`

Diese Nodes leben im globalen KG.

---

## 7.2 User Overlay Nodes

Beispiele:

- `Position`
- `WatchItem`
- `Alert`
- `Journal`
- `Annotation`
- `Override`
- `UserScenario`
- `UserRule`
- `SavedView`
- `ResearchFocus`

Diese Nodes leben im User Overlay Graph.

---

## 7.3 Claim / Evidence / Stance Modell

### Warum eigener Modellbereich?

Persönliches Trading-Wissen ist selten reiner Fakt. Es ist meist:

- zeitlich begrenzt
- probabilistisch
- evidenzgestützt
- widersprüchlich
- revisionsfähig
- regimeabhängig

Deshalb werden subjektive Inhalte **nicht** als einfache Edge gespeichert.

### Claim

Beispielstruktur:

```yaml
Claim:
  id: c:claim:<uuid>
  scope: user | agent | shared-proposal
  type: macro_thesis | event_interpretation | asset_view | contradiction | scenario_assumption
  text: "Iran escalation is already priced into oil equities."
  polarity: positive | negative | mixed | neutral
  confidence: 0.0 - 1.0
  status: active | challenged | archived | invalidated
  created_at:
  valid_from:
  valid_until:
  regime_tags: [risk_off, inflationary]
  references_global_entities: [g:country:irn, g:commodity:crude_oil]
  author_kind: user | agent
```

### Evidence

```yaml
Evidence:
  id: x:evidence:<uuid>
  type: source | note | metric | event_link | backtest | transcript | chart_pattern
  provenance:
  summary:
  confidence:
  created_at:
  points_to:
    - g:...
    - e:...
    - m:...
```

### Stance

Stance ist die relationale Bewertung eines Claims gegenüber einer Entität, These oder anderen Claims.

```yaml
Stance:
  id: c:stance:<uuid>
  relation: supports | opposes | refines | hedges | supersedes | conditions
  weight: 0.0 - 1.0
  applies_to_claim: c:claim:...
  target: g:... | c:claim:...
```

**Regel:**  
User-Meinung = Claim/Stance.  
Nicht = direkte Mutation globaler Faktkanten.

---

## 8. Relationen: was wo erlaubt ist

## 8.1 Globaler KG

Erlaubt:

- `influences`
- `exposed_to`
- `located_in`
- `owns`
- `supplies`
- `contradicts`
- `typical_strategem`
- `reacts_to`
- `affects_symbol`
- `belongs_to_sector`
- `is_part_of_supply_chain`
- `has_signal_type`

Nicht erlaubt:

- private watchlist-Kanten
- user override patterns
- user sentiment objects
- persönliche investment theses

## 8.2 User Overlay

Erlaubt:

- `watches`
- `holds`
- `alerts_on`
- `annotates`
- `overrides`
- `bookmarks`
- `ignores`
- `links_to_claim`
- `follows_scenario`
- `focuses_on`

Nicht erlaubt:

- kanonische Entitätsdefinitionen überschreiben
- globale Faktenkanten ersetzen

---

## 9. Merge Contract (Kernteil)

## 9.1 Grundidee

Merge bedeutet **nicht**:

- Datenbank A + Datenbank B physisch vereinigen

Merge bedeutet:

- lokale User-Kontexte und globale Domain-Antworten **zur Laufzeit** fusionieren

## 9.2 Merge-Richtlinien

1. **Global facts win on ontology**  
   Node-Klassen, Canonical IDs, kanonische Eigenschaften und Domain-Fakten kommen aus dem Backend.

2. **User overlay wins on personalization**  
   Watchlist, Positionen, Annotationen, Fokus, persönliche Priorisierung, lokale Overrides und persönliche Claims kommen aus dem Frontend.

3. **Claims coexist with facts**  
   Ein User-Claim widerspricht einem globalen Fakt nicht auf Storage-Ebene. Der Widerspruch wird explizit modelliert.

4. **No silent overwrite**  
   Kein lokales Objekt überschreibt still eine globale Property.

5. **Merge returns typed composite output**  
   Ergebnis ist ein komponiertes Antwortobjekt, kein undifferenzierter Mischgraph.

## 9.3 Composite Merge Response (Beispiel)

```json
{
  "query_type": "event_impact_for_user",
  "global_context": {
    "event_id": "e:geo:evt_iran_sanc_2026_02_01",
    "affected_symbols": ["g:symbol:CL", "g:symbol:GLD"],
    "strategem_match": "g:strategem:28"
  },
  "user_context": {
    "matched_positions": ["u:position:1", "u:position:7"],
    "matched_watchitems": ["u:watchitem:3"],
    "relevant_claims": ["c:claim:abc"]
  },
  "fusion": {
    "impact_on_user": [
      {
        "symbol_id": "g:symbol:GLD",
        "position_id": "u:position:7",
        "reason_chain": [
          "event->commodity->symbol",
          "user holds symbol"
        ]
      }
    ]
  }
}
```

---

## 10. Query-Flows (verbindlich)

## 10.1 User-zentrierte Impact Query

**Beispiel:** “Welche meiner Positionen sind vom Event X betroffen?”

### Ablauf

1. Frontend fragt lokalen Overlay Graph:
   - Welche Positionen / WatchItems / Alerts / Claims referenzieren relevante Canonical IDs?

2. Frontend ruft Go Merge Endpoint:
   - übergibt nur minimale IDs / Query Intent / Context Handles

3. Go fragt Backend-KG + Episodic + optional Vector-Layer

4. Go liefert strukturierte Domain-Antwort

5. Frontend fusioniert Domain-Antwort mit lokalem Overlay

### Regel

Die finale Personalisierung passiert im Frontend oder in einer klaren Merge-Schicht, nicht durch Persistieren gemischter Ergebnisse als neue Wahrheit.

---

## 10.2 Claim Evaluation Query

**Beispiel:** “Was spricht für/gegen meine These?”

### Ablauf

1. Frontend liefert Claim-ID oder Claim-Text
2. Backend sucht:
   - referenzierte globale Entitäten
   - widersprechende Events
   - historische Episoden
   - semantisch ähnliche Fälle
3. Antwort kommt zurück als:
   - evidence_for
   - evidence_against
   - unresolved
   - stale_evidence
4. Frontend zeigt das als Research-Panel, aber speichert nicht automatisch als Fakt

---

## 10.3 Historical Similarity Query

**Beispiel:** “Gab es ähnliche Situationen?”

### Ablauf

- Startpunkt kann Event, Claim oder Note sein
- Backend nutzt Episodic + Vector + KG Context
- Output bleibt **retrieval result**, nicht canonical fact

---

## 10.4 Simulation Query

**Beispiel:** “Simuliere Eskalationspfade”

### Ablauf

1. Startpunkt: Event / Branch / UserScenario
2. Backend erzeugt `s:branch:*`
3. Simulation läuft auf Snapshot/Branch
4. Output in:
   - simulation tree
   - payoff matrix
   - scenario probabilities
   - affected entities
5. Nur explizit bestätigte Erkenntnisse dürfen später als Claim/Evidence extrahiert werden

### Harte Regel

Simulationsresultate mutieren **nie** den Canonical Graph direkt.

---

## 11. Konfliktklassen

## 11.1 Typ A – Fakt vs. Meinung

Beispiel:
- Global: “Entity X gehört zu Region Y”
- User: “Ich glaube Markt interpretiert X eher wie Region Z”

**Lösung:** Kein Konflikt im Storage. User-Aussage ist Claim.

## 11.2 Typ B – Alte vs. neue Evidenz

Beispiel:
- alter Claim aktiv
- neue Event-Evidenz widerspricht

**Lösung:** Claim `status=challenged`, neue Evidence verlinken, kein stilles Löschen

## 11.3 Typ C – Agent vs. User

Beispiel:
- Agent generiert These
- User überschreibt Interpretation

**Lösung:** User-Stance hat Vorrang im UI, Agent-Ausgabe bleibt als provenance-markiertes Objekt erhalten

## 11.4 Typ D – Local vs. synced remote user data

Beispiel:
- Multi-device Konflikt bei Journal/Annotation

**Lösung:** Objektklasse-spezifische Sync-Regel:
- append-only logs → merge append
- mutable notes → last-write-wins + version history
- structured overlays → field-aware merge oder explicit conflict state

## 11.5 Typ E – Simulation vs. Realität

Beispiel:
- Simulationspfad sagt Eskalation
- reales Event de-eskaliert

**Lösung:** Simulation bleibt Branch-Artefakt. Kein Konflikt mit Canonical Graph.

---

## 12. Sync Contract

## 12.1 Was synchronisiert werden darf

- User overlay objects
- user claims
- user evidence references
- journals / notes (verschlüsselt)
- UI views / saved scenarios
- settings / preferences

## 12.2 Was nicht direkt synchronisiert wird

- globale Fakten als user-owned Objekte
- backend-owned event truth
- derived canonical IDs
- mutierende domain writes außerhalb Go-owned APIs

## 12.3 Sync Modi

| Modus | Beschreibung |
|---|---|
| local-only | nur Gerät |
| encrypted-backup | verschlüsselte Server-Sicherung |
| multi-device-sync | versionierte, konfliktfähige Sync-Schicht |
| collaborative | spätere explizite Mehrbenutzer-Schicht |

---

## 13. Security & Encryption

## 13.1 Grundsatz

Persönlicher KG und persönlicher semantischer Speicher sind **User-Daten**, keine reine UI-Caches.

## 13.2 Mindestanforderungen

- Client-side encryption für persistierte lokale/synchronisierte User-Daten
- WebAuthn/Passkey-basierte Schlüssableitung oder gleichwertiger sicherer Mechanismus
- Server darf persönliche lokale Wissensobjekte idealerweise nur verschlüsselt sehen
- Go bleibt Policy-Layer für alle Domain-Mutationen
- Capability-/Risk-Tiers gelten auch für Agenten

## 13.3 Trennung

- **Auth Identity Layer:** Wer ist der User?
- **Local Data Key Layer:** Wie wird User-Knowledge verschlüsselt?
- **Capability Layer:** Was darf User/Agent/Plugin tun?

Diese drei Ebenen dürfen nicht vermischt werden.

---

## 14. Agent-Zugriffsregeln

## 14.1 Default

Alle Agenten starten mit:

- `read-only` auf global KG
- `read-only` auf User Overlay (nur wenn freigegeben)
- `read-only` auf semantic memory
- `read-only` auf episodic memory

## 14.2 bounded-write

Nur für:

- neue Claims vorschlagen
- Evidence-Links erzeugen
- Journals zusammenfassen
- Simulation Branches erzeugen
- Entwürfe/Annotationsvorschläge

Nur mit:

- provenance
- idempotency
- audit
- reversibility

## 14.3 approval-write

Pflicht für:

- Änderungen an produktiv relevanten User-Rules
- Alerts, die automatisch handeln würden
- alles mit realem Order-/Broker-/Partner-Bezug
- alles, was globale Domain-Daten mutieren würde

---

## 15. Simulation-Branch-Vertrag

## 15.1 Motivation

Game-Theory-/Control-Theory-/Geo-Simulationen sind zentrale Produktidee, dürfen aber die Wahrheitslayer nicht verunreinigen.

## 15.2 Modell

```yaml
SimulationBranch:
  id: s:branch:<uuid>
  based_on:
    - e:...
    - g:...
    - c:claim:...
  assumptions:
    - c:claim:...
  engine:
    - game_theory
    - control_theory
    - monte_carlo
  created_at:
  expires_at:
  persisted: false | true
```

## 15.3 Outputs

- scenario tree
- probability distribution
- expected impact
- regime shift candidates
- recommended watchpoints

## 15.4 Persistenzregel

Persistiert werden:

- branch metadata
- outputs
- summaries
- backtest links
- optional extracted claims/evidence

Nicht persistiert werden als Canonical Facts:

- hypothetische Kanten
- hypothetische entity states
- hypothetische truths

---

## 16. API / Contract-Vorschlag

## 16.1 Merge API

`POST /api/v1/memory/merge/query`

### Request

```json
{
  "query_type": "event_impact_for_user",
  "global_entity_ids": ["e:geo:evt_iran_sanc_2026_02_01"],
  "user_context_handles": ["watchlist", "positions", "claims"],
  "include_historical_similarity": true,
  "include_claims": true
}
```

### Response

Typed composite response, nie roher gemischter Persistenzgraph.

---

## 16.2 Claim API

- `POST /api/v1/memory/claims`
- `PATCH /api/v1/memory/claims/{id}`
- `POST /api/v1/memory/claims/{id}/evidence`
- `POST /api/v1/memory/claims/{id}/challenge`

---

## 16.3 Simulation API

- `POST /api/v1/simulation/branch`
- `GET /api/v1/simulation/branch/{id}`
- `POST /api/v1/simulation/branch/{id}/run`
- `POST /api/v1/simulation/branch/{id}/extract-claims`

---

## 17. Frontend-Vertrag

## 17.1 Lokal erlaubt

- Overlay Queries
- Journaling / Notes
- Watchlist relations
- local semantic recall
- UI personalization
- rendering / graph exploration
- offline browsing personal context

## 17.2 Lokal nicht erlaubt

- globale Fakt-Edits
- direkte Domain-Writes
- unkontrollierte Mutationen an backend-owned truths
- dauerhafte Shadow-Truth-Stores

## 17.3 Merge Layer

Empfohlen als explizite Frontend-Schicht:

- `overlay-resolver.ts`
- `claim-evaluator.ts`
- `merge-contracts.ts`
- `simulation-branch-adapter.ts`

---

## 18. Beobachtbarkeit / Debugging

Jede Merge-Operation sollte nachvollziehbar sein.

### Pflichtfelder

- request_id
- user_id (oder pseudonymisiert)
- query_type
- input handles
- backend sources used
- merge policy version
- latency split (local/backend/fusion)
- contradiction count
- stale evidence count

### Ziel

Spätere Fragen wie:
- “Warum wurde dieses Asset als betroffen markiert?”
- “Warum wurde dieser Claim priorisiert?”
- “Warum zeigte der Agent diese These?”

müssen deterministisch beantwortbar sein.

---

## 19. Rollout-Reihenfolge

## Phase A – Vertragsdefinition

- dieses Dokument finalisieren
- IDs / Namespaces fixieren
- Claim/Evidence/Stance Schema fixieren
- Konfliktklassen fixieren

## Phase B – Minimal produktiver Merge-Pfad

- Event -> impacted symbols -> user positions
- lokaler overlay query
- backend domain query
- typed composite response
- keine automatische Schreiblogik

## Phase C – Claim Layer

- UI für persönliche Thesen
- evidence attach / challenge
- state transitions

## Phase D – Semantic Recall

- notes/snippets embeddings
- local semantic retrieval
- similar cases panel

## Phase E – Simulation Branches

- separate scenario objects
- no canonical mutation
- extract-claim flow

---

## 20. Verteilplan in bestehende Dokumente

## 20.1 `MEMORY_ARCHITECTURE.md`

Einfügen / anpassen:

- Overlay ≠ second truth KG
- Claim/Evidence/Stance als M2/M3 Brücke
- Personal Semantic Memory expliziter vom KG trennen
- Simulation Branches als Episodic/Scenario Layer ergänzen
- Merge Query Ablauf übernehmen

## 20.2 `KG_ONTOLOGY.md`

Einfügen:

- Namespace-/ID-Regeln
- Claim/Evidence/Stance Klassen
- erlaubte Relationstypen global vs user overlay
- Canonical-ID-Priorität

## 20.3 `CONTEXT_ENGINEERING.md`

Einfügen:

- merge-aware retrieval policies
- query types für claim evaluation
- stale evidence / contradiction scoring
- simulation-context assembly

## 20.4 `AGENT_ARCHITECTURE.md`

Einfügen:

- Agent Write Policy je Memory-Schicht
- Claim suggestion vs fact mutation klar trennen
- simulation branch handling
- provenance / idempotency Pflichten

## 20.5 `AGENT_TOOLS.md`

Einfügen:

- explizite Tools:
  - get_overlay_context
  - evaluate_claim
  - create_simulation_branch
  - attach_evidence
- capability scoping je Tool

## 20.6 `FRONTEND_ARCHITECTURE.md`

Einfügen:

- lokaler overlay graph vs lokaler semantic memory
- merge layer modules
- keine dauerhaften shadow truth stores
- optional Kuzu + PGlite als getrennte lokale Bausteine

## 20.7 `AUTH_SECURITY.md`

Einfügen:

- Local Data Key Layer explizit
- verschlüsselter Sync für User-KG / notes
- Trennung Auth / Data Key / Capability

## 20.8 `SYSTEM_STATE.md`

Einfügen:

- Soll-Zustand des Merge-Contracts
- overlay-resolver existence
- simulation branch contract
- current gap tracking

## 20.9 `API_CONTRACTS.md`

Einfügen:

- `/api/v1/memory/merge/query`
- claim routes
- simulation routes
- response shapes
- correlation/audit requirements

## 20.10 `EXECUTION_PLAN.md`

Neue/verschobene Aufgaben:

- Merge Contract finalize
- Claim Layer
- Semantic Recall local
- Simulation Branch contract
- multi-device sync conflict policy

---

## 21. Offene Punkte

1. Exakte Engine-Entscheidung für lokalen semantic store
2. Multi-device conflict semantics je User-Objektklasse
3. Ob Claims nur lokal oder optional verschlüsselt serverseitig gehalten werden
4. Wie viel Domain-Subset in den Browser gespiegelt werden darf
5. Ob bestimmte high-value claims in shared proposal spaces enden dürfen
6. Ob Falkor-only für Document-Vector später reicht oder Doc-Layer separat bleibt

---

## 22. Harte Entscheidungen (verbindlich)

1. **Kein physisches Mergen von User-KG in den globalen KG**
2. **Claims/Evidence/Stance sind Pflichtmodell, kein “belief edge” Shortcut**
3. **Simulation ist Branch, nie Wahrheit**
4. **Canonical IDs sind einzige Brücke**
5. **Global ontology backend-owned, personalization frontend-owned**
6. **Graph für Struktur, Vector für Recall**
7. **Go bleibt Policy- und Domain-Write-Owner**
8. **Agenten dürfen standardmäßig nur lesen**

---

## 23. Externe Referenzen (2025/2026)

- Next.js 16 / Cache Components / `use cache` / React Compiler
- FalkorDB Vector Index Docs
- Kuzu Documentation
- PGlite / pgvector Browser Docs
- WebAuthn Level 3
- GitNexus (client-side graph pattern reference)
- TanStack DB (Beta; optional selective use, not global doctrine)

---

## 24. Kurzfazit

Die Kernfrage ist nicht mehr **ob** du globalen und persönlichen KG kombinieren solltest, sondern **wie streng die Grenze und die Brücke modelliert sind**.

Die Antwort dieser Spezifikation lautet:

- **Grenze streng**
- **Brücke explizit**
- **Merge query-basiert**
- **Meinung als Claim**
- **Simulation als Branch**
- **Agenten unter Capability-Policy**
- **Frontend lokal stark, aber nicht Wahrheitsbesitzer**

Das ist die saubere Basis für:
- personal research OS
- Trading-/Makro-/Geo-Analyse
- Agentic Workflows
- spätere Simulationen
- spätere Multi-Device-/Collab-Erweiterungen
