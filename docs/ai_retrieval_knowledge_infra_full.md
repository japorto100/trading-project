# 0. Exa AI: Was das Startup konkret macht und warum es relevant ist

Exa AI baut keine klassische Suchmaschine für Menschen, sondern eine **AI-native Search-Infrastruktur** für LLMs, Agenten und automatisierte Research-Systeme.

## Kernidee

Klassische Suchmaschinen sind historisch optimiert für:

- Klickrate
- Werbung
- SEO-Signale
- menschliche Navigation

AI-Systeme brauchen stattdessen:

- semantische Suche
- strukturierte, maschinenlesbare Resultate
- stabile APIs
- geringe Latenz
- Dokumente ohne HTML-/Layout-Ballast

Exa versucht genau dafür eine eigene Retrieval-Schicht bereitzustellen.

## Vereinfachtes Architekturmodell

```text
Web Crawler
  ↓
Content Extraction / Cleaning
  ↓
Document Normalization
  ↓
Embedding + Ranking Layer
  ↓
Search / Research API
  ↓
AI Agent / LLM
```

## Typische API-Ausgabe

```json
{
  "title": "...",
  "url": "...",
  "text": "...",
  "metadata": {...},
  "entities": [...]
}
```

## Strategische Relevanz

Die eigentliche Wette von Exa lautet:

> In Zukunft werden nicht Menschen, sondern AI-Agenten einer der wichtigsten „Nutzer“ von Suchinfrastruktur sein.

Das ist wichtig, weil Agenten anders suchen als Menschen:

- viel häufiger
- iterativer
- programmatisch
- mit Query-Expansion
- mit nachgelagertem Reasoning

Exa ist damit weniger „noch eine Suchmaschine“ als vielmehr eine **Search Infrastructure API für Agentensysteme**.

## Was daran wirklich schwierig ist

Viele reden bei AI-Search nur über:

- Embeddings
- Reranker
- Vektorsuche
- Retrieval

Der härtere Teil liegt aber tiefer:

- Crawling
- Text-Extraktion
- Dubletten-Erkennung
- Spam-Erkennung
- Freshness
- Dokumentsegmentierung
- Ranking für Agenten statt für Klicks

Der wertvollste Asset ist daher meist **nicht das LLM**, sondern der **Index + die Datenpipeline**.

---

# 1. Das Grundproblem: Warum LLMs ohne Retrieval begrenzt bleiben

LLMs haben kein echtes Weltmodell und kein laufend aktualisiertes, verifiziertes Gedächtnis.

## Zwei strukturelle Grenzen

1. **Training Cutoff**  
   Das Modell kennt neue Ereignisse nur, wenn externe Quellen eingebunden werden.

2. **Unstrukturierte Wissensrepräsentation**  
   Das Modell kann sprachlich viel rekonstruieren, besitzt aber keine saubere, explizite Wissensbasis.

## Deshalb entsteht diese Architektur

```text
LLM
+
Retrieval Layer
+
External Knowledge
+
Reasoning
```

Das ist die Grundform von **RAG**.

## Warum das für dein Projekt besonders wichtig ist

Dein geplanter Stack betrifft:

- Makro
- Geopolitik
- Trading
- Simulation
- Karten-/Geo-Kontext
- Agenten

All diese Bereiche hängen stark von **aktuellen externen Informationen** ab.  
Ein Agent ohne Retrieval bleibt dort schnell in einem geschlossenen Informationsraum.

---

# 2. Warum Retrieval wichtig bleibt, auch wenn Tokens massiv günstiger werden

Ein häufiger Einwand ist: Wenn Tokenpreise jedes Jahr stark fallen, warum braucht man dann überhaupt noch Retrieval?

## Die Antwort

Weil Retrieval nicht nur ein **Kostenproblem**, sondern vor allem ein **Signalproblem** löst.

## Ohne Retrieval

```text
Gigantischer Informationsraum
  ↓
LLM soll Relevantes finden
  ↓
viel Rauschen, schwache Priorisierung
```

## Mit Retrieval

```text
Großer Informationsraum
  ↓
Filter / Ranking / Retrieval
  ↓
kleines relevantes Dokumentset
  ↓
LLM reasoning
```

## Was billige Tokens wirklich ändern

Billige Tokens machen größere Kontexte günstiger.  
Sie lösen aber nicht automatisch:

- Dokumentrelevanz
- Dubletten
- Spam
- Aktualität
- Quellenqualität
- zeitliche Priorisierung
- Multi-Hop-Suche

Darum bleibt Retrieval fundamental.

---

# 3. Neural Retrieval: Was damit gemeint ist

Frühe Suchsysteme arbeiteten primär lexikalisch, also über Wortübereinstimmung.

## Beispiel klassischer Keyword-Suche

Query:

```text
central bank inflation policy
```

Dokument:

```text
monetary tightening by the federal reserve
```

Lexikalisch ist die Überlappung schwach, semantisch ist es aber sehr nah.

## Dense / Neural Retrieval

Hier werden Query und Dokumente in Vektoren abgebildet.

```text
Query → Embedding
Document → Embedding
Similarity(Query, Document)
```

Typische Maße:

- cosine similarity
- dot product

## Ziel

Nicht „gleiche Wörter“ zu finden, sondern **gleiche Bedeutung**.

## Typische Modellfamilien

- DPR
- E5
- BGE
- Contriever

## Was in der Praxis meist passiert

Reine Vektorsuche allein reicht selten.  
Produktionssysteme kombinieren meist:

- Keyword-Retrieval
- Dense Retrieval
- Reranking

Dazu später mehr.

---

# 4. Hybrid Retrieval: Die realistischere Produktionsarchitektur

In echten Systemen ist „nur Vektorsuche“ oft zu simpel.

## Typische Pipeline

```text
Query
  ↓
BM25 / Keyword Candidate Retrieval
  ↓
Dense Retrieval / Embedding Similarity
  ↓
Cross-Encoder Reranker
  ↓
Top-k Resultate
```

## Warum Hybrid sinnvoll ist

Keyword-Komponenten sind oft stark bei:

- Eigennamen
- exakten Begriffen
- Tickern
- Gesetzesnummern
- technischen Bezeichnern

Dense Retrieval ist stark bei:

- semantischer Nähe
- paraphrasierten Inhalten
- thematischer Ähnlichkeit

Reranker verbessern:

- Präzision
- endgültige Reihenfolge
- Query-Document Match

## Konsequenz

Wenn du ein wirklich gutes Retrieval-System willst, solltest du **hybrid** denken, nicht dogmatisch „nur vector“.

---

# 5. Entities, NER und der Übergang zu strukturiertem Wissen

Dokumente enthalten nicht nur Fließtext, sondern explizite Wissensobjekte.

## Typische Entities

- Länder
- Firmen
- Personen
- Rohstoffe
- Institutionen
- Orte
- Ereignisse
- Organisationen

## Named Entity Recognition (NER)

Beispieltext:

```text
Apple acquired an AI startup in Zurich.
```

Extraktion:

```text
Apple  → organization
Zurich → location
```

## Entity Linking

Der nächste Schritt ist nicht nur Erkennung, sondern Identifikation:

```text
Apple → Apple Inc. (globale ID)
```

## Warum das wichtig ist

Damit kannst du später aufbauen:

- Knowledge Graphs
- Event Graphs
- Relation Extraction
- Causal Graphs
- Entity-Centric Search

Für dein System ist das extrem relevant, weil viele Fragen nicht nur Dokumentfragen sind, sondern **Beziehungsfragen**.

---

# 6. Knowledge Graphs: Wo sie helfen und wo nicht

Knowledge Graphs sind strukturierte Beziehungsnetze.

## Beispiel

```text
Russia
  ├─ exports → oil
  ├─ sanctioned_by → EU
  ├─ ships_via → Black Sea
  └─ affects → energy markets
```

## Vorteile

Knowledge Graphs sind stark bei:

- expliziten Beziehungen
- Pfadfragen
- Abhängigkeiten
- Multi-Hop-Reasoning
- Entity-Centric Navigation

## Grenzen

Sie sind teuer in:

- Pflege
- Schema-Design
- Normalisierung
- Entity Resolution
- Änderungsmanagement

## Realistische Empfehlung

Für dein System wäre ein **Hybrid** sinnvoll:

- Dokument-Retrieval für offenes Wissen
- Graph-Layer für Beziehungen
- Zeitreihen-Layer für numerische Dynamik
- Event-Layer für zeitliche Entwicklung

---

# 7. Warum Web Search für Agenten etwas anderes ist als normale Websuche

Ein Mensch sucht typischerweise:

- wenige Queries
- klickt Ergebnisse an
- liest selektiv
- stoppt früh

Ein Agent sucht oft:

- viele Queries
- automatisiert
- iterativ
- mit Query-Rewrites
- mit Vergleich mehrerer Quellen
- mit anschließender Synthese

## Agentischer Suchablauf

```text
Fragestellung
  ↓
Subfragen generieren
  ↓
mehrere Suchanfragen
  ↓
Dokumente sammeln
  ↓
Quellen bewerten
  ↓
Wissenslücken erkennen
  ↓
erneut suchen
  ↓
Synthese
```

## Konsequenz

Search-Infrastruktur für Agenten muss optimiert sein für:

- viele API-Calls
- stabile Strukturen
- gute Metadaten
- maschinenlesbare Resultate
- programmatisches Paging / Filtering
- Freshness

---

# 8. Der eigentliche Kern: der Web-Index ist das Asset

Viele Diskussionen überschätzen die Neuheit von Embeddings und unterschätzen die Härte der Index-Schicht.

## Ein brauchbarer Web-Index braucht

- Crawler
- Fetch Scheduling
- politeness / rate controls
- HTML parsing
- Boilerplate removal
- text extraction
- deduplication
- near-duplicate clustering
- language detection
- spam detection
- recrawl policies
- metadata extraction
- storage
- ranking signals
- freshness handling

## Darum ist der Index so wertvoll

Weil er das verdichtete Ergebnis all dieser Arbeit ist.

Ein Agent sucht in der Anfragezeit idealerweise **nicht das Web direkt**, sondern einen bereits aufbereiteten und priorisierten Index.

## Wichtige Einsicht

Das bedeutet auch:  
Viele „AI Search“-Produkte unterscheiden sich weniger durch Zaubermodelle als durch:

- Datenqualität
- Crawl-Abdeckung
- Aktualität
- Dokumentaufbereitung
- Ranking

---

# 9. Common Crawl: Was es ist und was es nicht ist

Common Crawl ist ein offener, großskaliger Web-Datensatz.

## Was du bekommst

Typischerweise:

- rohe Webdaten
- Metadaten
- extrahierten Text

Bekannte Formate:

- WARC
- WET
- WAT

## Warum das nützlich ist

Weil dir damit ein Teil der Crawl-Kosten und der Grundbeschaffung abgenommen wird.

## Aber: Was es nicht löst

Common Crawl ersetzt nicht automatisch:

- Qualitätsfilterung
- Dublettenreduktion
- gutes Ranking
- thematische Priorisierung
- Freshness für sehr aktuelle Themen
- Domain-Scoring
- agentenoptimierte Segmentierung

## Wichtige Antwort auf deine Frage

> „Mit Crawl bereits gegeben ist Indexing ja weniger Arbeit, oder?“

**Ja, deutlich weniger als alles selbst zu crawlen.**  
Aber nur auf einer Ebene.

### Was einfacher wird

- Rohdatenbeschaffung
- initiale Webabdeckung
- Teil der Textgewinnung

### Was weiterhin hart bleibt

- Spam filtern
- Dokumente sinnvoll chunking
- Themenpriorisierung
- Recency / Freshness
- Ranking
- Entity-Normalisierung
- Agentenfreundliche Ergebnisform

Common Crawl spart also Arbeit, aber macht aus dem Problem noch lange kein triviales Problem.

---

# 10. Domain-Focused Crawling statt globalem Webanspruch

Für viele spezialisierte Agentensysteme ist ein globaler Vollindex gar nicht nötig.

## Sinnvoller Ansatz

Ein fokussierter Crawl auf hochwertige Domains.

Beispiele für dein Umfeld:

- Zentralbanken
- Statistikämter
- Regierungsseiten
- Regulatoren
- Energieagenturen
- Rohstoff-/Shipping-Quellen
- Think Tanks
- Forschungsinstitutionen
- hochwertige Finanzmedien
- Sanktionsregister

## Vorteil

Du reduzierst massiv:

- Rauschen
- Storage
- Spam
- irrelevante Dokumente
- irrelevante Recrawls

## Das Ergebnis

Statt „das ganze Web“ zu indexieren, baust du einen **relevanten Wissensraum**.

---

# 11. Continuous Crawlers und Monitoring statt reaktiver Suche

Nicht jede neue Information sollte erst entdeckt werden, nachdem ein Agent aktiv gesucht hat.

## Besser für viele Domänen

```text
wichtige Quellen überwachen
  ↓
neue Dokumente erkennen
  ↓
Index aktualisieren
  ↓
Agent greift bei Bedarf darauf zu
```

## Beispiele

- Notenbankmitteilungen
- Regulierungsänderungen
- Sanktionslisten
- Unternehmensmeldungen
- Forschungspublikationen
- Policy-Dokumente

## Nutzen

Damit verschiebt sich dein System von:

- „blind suchen, wenn Frage kommt“

zu:

- „wichtige Wissensquellen proaktiv aktualisieren“

Gerade für Makro-/Geo-/Trading-Agenten ist das enorm wertvoll.

---

# 12. Dezentrale Indizes: Gibt es sie wirklich?

Ja, aber meist experimentell, begrenzt oder spezialisiert.

## Typische Formen

### 1. Peer-to-Peer Search

Beispielhaft: YaCy  
Jeder Knoten crawlt Teilmengen und teilt Indexanteile.

### 2. Web3 / IPFS-Indexierung

Hier geht es eher um:

- dezentrale Inhalte
- verteilten Storage
- Metadaten über Web3-Objekte

### 3. Föderierte Micro-Indizes

Viele kleinere thematische Indizes, die per Router zusammengeführt werden.

## Was praktisch noch fehlt

Ein wirklich starkes, dezentrales, web-weites Suchsystem mit:

- hoher Abdeckung
- starkem Ranking
- guter Spamabwehr
- hoher Freshness

ist weiterhin schwer.

## Warum

Weil Websuche ein brutal schwieriges Infrastrukturproblem ist.

---

# 13. Föderierte und thematische Indizes: Das Missverständnis geklärt

Du hast einen wichtigen Punkt angesprochen:

> Mit Indices meintest du thematisch gruppierte Seiten-Indices und nicht zwingend einen globalen Google-ähnlichen Vollindex?

**Ja, genau.**

## Gemeint sind oft eher solche Strukturen

- Macro Index
- Energy Index
- Geopolitics Index
- Research Index
- Policy / Regulation Index
- News Index
- Company / Filing Index

## Architekturidee

```text
Query
  ↓
Router
  ↓
wähle passende Domänen / Indizes
  ↓
hole Resultate
  ↓
merge + rerank
```

## Das ist oft realistischer als ein globaler Index

Für dein Projekt brauchst du wahrscheinlich nicht „Google nachbauen“, sondern eine **föderierte Wissensarchitektur**.

---

# 14. Darknet / Tor Crawlers: technisch machbar, praktisch speziell

Tor-Crawling ist technisch möglich.

## Grundaufbau

```text
Crawler
  ↓
Tor Client
  ↓
SOCKS5 Proxy
  ↓
.onion Services
```

## Typische Probleme

- Onion-Adressen ändern sich
- Services sind oft instabil
- wenig Linkstruktur
- hoher Scam-/Spam-Anteil
- Login-/Invite-Barrieren
- juristische und operative Risiken

## Wichtig für deine Frage

Darknet-Crawling ist **nicht identisch** mit Web3/Deep-Web-Indexierung.

Unterscheidung:

- **Surface Web**: normal indexierbar
- **Deep Web**: hinter Formularen/APIs/DBs, aber nicht zwingend illegal
- **Darknet**: Tor/I2P/ähnliche Netze

## Fazit

Anwendbare Tor-Crawler gibt es, aber für dein Kernsystem wären sie eher ein Spezialmodul, nicht die Standardbasis.

---

# 15. Was dein Agentensystem konkret braucht: drei Wissensschichten

Für dein Vorhaben ist folgende Dreiteilung sehr sinnvoll.

## Schicht 1: strukturierte Daten

Beispiele:

- Zeitreihen
- Marktpreise
- Makroindikatoren
- Sanktionslisten
- Handelsdaten
- Shipping-Daten
- Geodaten

## Schicht 2: kuratierte Dokumentindizes

Beispiele:

- Research Papers
- Think-Tank-Berichte
- Regierungsberichte
- Firmenmeldungen
- hochwertige Newsquellen

## Schicht 3: Open Web Retrieval

Dafür ist Websearch wichtig:

- Scope erweitern
- neue Hypothesen finden
- neue Quellen entdecken
- unbekannte Entwicklungen erfassen

## Wichtig

Damit ist Websuche **kein Ersatz** für deine kuratierten Indizes, sondern eine **Explorations- und Discovery-Schicht**.

---

# 16. Warum Websearch für deinen Agenten trotzdem unverzichtbar bleibt

Du hast selbst den zentralen Punkt formuliert:

> Websearch braucht der Agent, um den Scope zu erweitern und neuere Erkenntnisse zu gewinnen.

Genau.

## Ohne Open-Web-Komponente

Der Agent bleibt beschränkt auf:

- bekannte Datenquellen
- bekannte Dokumenträume
- bekannte Beziehungen

## Mit Open-Web-Komponente

Er kann:

- neue Quellen entdecken
- neue Narrative identifizieren
- bisher unbekannte Beziehungen vermuten
- Signale aufsammeln, die noch nicht strukturiert vorliegen

## Typischer Flow

```text
interne Wissensbasis
  ↓
Frage / Hypothese
  ↓
Wissenslücke erkannt
  ↓
Open Web Search
  ↓
neue Dokumente / neue Quellen
  ↓
Validierung
  ↓
ggf. Übernahme in kuratierten Index
```

Das ist eine sehr starke Architektur.

---

# 17. Query Expansion und agentische Recherche

Menschen formulieren oft wenige Queries.  
Agenten können und sollten Queries expandieren.

## Beispiel

Aus einer Ausgangsfrage wie:

```text
Welche Folgen haben neue Sanktionen auf russische Energieexporte?
```

werden Subfragen:

- Welche Sanktionen genau?
- Gegen welche Firmen / Sektoren?
- Welcher Zeithorizont?
- Welche Schiffsrouten betroffen?
- Welche Sekundäreffekte für Öl / Gas / Versicherungen?
- Welche Gegenmaßnahmen?
- Welche Marktreaktionen?

## Pipeline

```text
User Question
  ↓
Question Decomposition
  ↓
Subquery Generation
  ↓
Multi-source Retrieval
  ↓
Evidence Collection
  ↓
Synthesis
```

## Das bedeutet praktisch

Search-Infrastruktur für Agenten muss mit hohen Query-Zahlen leben können.

---

# 18. Go als Retrieval Gateway: was das konkret für dich bedeutet

Ja: Go kann und sollte in deinem Stack sehr gut eine zentrale Rolle spielen.

## Nicht als Wissensspeicher, sondern als Orchestrationsschicht

Go eignet sich sehr gut für:

- Netzwerklogik
- Routing
- API-Komposition
- Parallelisierung
- Caching
- I/O-intensive Services

## Mögliche Rolle

```text
Agent
  ↓
Go Retrieval Gateway
  ↓
-----------------------------------------
Vector DB
Knowledge Graph
Time-Series Store
Document Store
Open Web Search
External APIs
-----------------------------------------
```

## Konkret heißt das für dich

Go kann:

- Anfragen an verschiedene Indizes parallel schicken
- Ergebnisse normalisieren
- Source Scoring anwenden
- Freshness berücksichtigen
- Merge + Rerank durchführen
- Caching und Rate Limits steuern

## Deine Formulierung „Indices auch als Go Quellen“

Ja — allerdings eher so:

- Go **integriert** diese Quellen
- Go **orchestriert** den Zugriff
- Go **ist nicht selbst** der Index

Es ist das Gateway / der Router / Aggregator.

---

# 19. Vector DB, Graph DB, Time-Series: unterschiedliche Rollen

Ein häufiger Fehler ist, alles in eine Datenbank pressen zu wollen.

## Sinnvollere Aufteilung

### Vector DB

Für:

- semantische Dokumentähnlichkeit
- ähnliche Textpassagen
- chunk-level retrieval

### Graph DB

Für:

- Beziehungen
- Multi-Hop-Navigation
- Entity-Relation Queries

### Time-Series / analytischer Layer

Für:

- Preise
- Indikatoren
- Volumina
- historische Signale

### Dokumentstore / blob layer

Für:

- Originaltexte
- PDFs
- HTML snapshots
- Reports

## Konsequenz

Dein System ist eher ein **Polyglot Retrieval Stack** als eine Ein-Datenbank-Lösung.

---

# 20. Open Source Bausteine, die gut in diese Architektur passen

Das sind keine absoluten Wahrheiten, aber solide Bausteine.

## Crawling / Parsing

- Scrapy
- Crawl4AI
- Playwright (für schwierige Seiten)
- trafilatura / readability-artige Extraktion
- newspaper3k (einfach, aber begrenzt)

## Search / Indexing

- OpenSearch
- Vespa
- Meilisearch (einfacher, aber begrenzter)
- Tantivy-basierte Komponenten
- Elasticsearch (wenn bereits im Ökosystem)

## Vector Layer

- Qdrant
- Weaviate
- Milvus

## Graph Layer

- Neo4j
- Memgraph
- Dgraph

## Zeitreihen / Analytics

- DuckDB
- Parquet
- TimescaleDB
- ClickHouse

## Orchestration / API

- Go
- gRPC
- Kafka / NATS (wenn Event-getrieben)
- Redis für Cache / Queues

## ML / NLP

- Python für Embeddings / NER / Reranker
- ggf. Rust/Go für Performance-nahe Komponenten

---

# 21. Search API Economics vs Token Economics

Auf den ersten Blick wirken Search-API-Kosten oft moderat.

Beispielhaft:

- ein paar Dollar pro 1000 Queries

## Aber dein Einwand ist richtig

Bei agentischer Nutzung akkumuliert das schnell.

Wenn ein Agent pro komplexem Task viele Queries erzeugt, dann steigen Search-Kosten.

## Gleichzeitig

LLM-Tokens werden tendenziell billiger.

## Heißt das, Retrieval wird unwichtig?

Nein.

### Warum nicht?

Weil Retrieval dir auch spart:

- irrelevanten Kontext
- unnötiges Reasoning über Rauschen
- falsche oder redundante Dokumente
- schlecht priorisierte Quellen

## Realistische ökonomische Sicht

Die Frage ist nicht nur:

- „Sind Tokens billiger als Search?“

Sondern:

- „Welche Kombination aus Search, Indices und Reasoning minimiert Gesamtkosten bei maximaler Qualität?“

---

# 22. Ist die Tokenersparnis durch Retrieval bemerkbar?

Ja, oft deutlich.

## Ohne Retrieval

Der Agent müsste sehr große Mengen Rohtext oder unsauber gefilterte Dokumente lesen.

## Mit Retrieval

Er liest bevorzugt:

- wenige relevante Passagen
- besser priorisierte Dokumente
- strukturierte Trefferlisten

## Typischer Effekt

Statt:

- 100k+ Kontext
- oder viele unnötige Seiten

hast du:

- 3–20 gute Dokumente
- wenige relevante Chunks
- weniger LLM-Arbeit

## Aber wichtig

Der größte Nutzen ist oft nicht nur Kostenreduktion, sondern **bessere Signalqualität**.

---

# 23. Knowledge Discovery Agents: der nächste logische Schritt

Nach deinem bisherigen Denken ist der nächste Schritt fast schon vorgezeichnet:

Nicht nur Fragen beantworten, sondern **den Wissensraum selbst aktiv erweitern**.

## Das bedeutet

Ein Agent kann:

- neue Quellen suchen
- neue Domains bewerten
- unbekannte Dokumentcluster entdecken
- Lücken im Wissensgraphen erkennen
- neue Indizes vorschlagen

## Pipeline

```text
bestehende Wissensbasis
  ↓
Gap Detection
  ↓
Exploratory Search
  ↓
Source Evaluation
  ↓
Crawl / Ingestion
  ↓
Index Update
  ↓
bessere Wissensbasis
```

Das ist die Brücke von RAG zu **autonomem Knowledge Infrastructure Growth**.

---

# 24. Verbindung zu deinem eigentlichen System: Macro / Geo / Trading / Simulation

Hier wird es für dich wirklich relevant.

## Du planst nicht bloß einen Chatbot

Sondern implizit ein System aus:

- Wissensinfrastruktur
- Agenten
- Analyse
- Simulation
- Visualisierung
- Entscheidungsunterstützung

## Mögliche grobe Schichten

### A. Data Layer

- Time series
- events
- documents
- geodata
- company/entity data

### B. Retrieval Layer

- vector retrieval
- graph retrieval
- structured DB retrieval
- web search

### C. Reasoning Layer

- decomposition
- evidence synthesis
- scenario generation
- conflict/constraint detection

### D. Simulation Layer

- game theory
- control theory
- scenario simulation
- dynamic feedback systems

### E. Visual Layer

- map overlays
- event propagation
- route / network visualizations
- scenario timelines

## Das heißt praktisch

Retrieval ist für dich kein Nebenthema, sondern die **Grundversorgung** des gesamten Systems.

---

# 25. Eine sinnvolle Gesamtarchitektur für dich

## High-Level

```text
User / Analyst
  ↓
Agent Layer
  ↓
Task Planner / Decomposer
  ↓
Go Retrieval Gateway
  ↓
------------------------------------------------------------
Structured Data     Document Indices    Graph Layer
(Time series etc.)  (curated + web)     (entities/relations)
------------------------------------------------------------
  ↓
Evidence Aggregation
  ↓
Reasoning / Synthesis
  ↓
Simulation Layer
  ↓
Geo / Dashboard / Reports
```

## Warum das robust ist

Weil jede Schicht etwas anderes leistet:

- strukturierte Daten liefern Verlässlichkeit
- Dokumentindizes liefern Kontext
- Graphen liefern Beziehungen
- Open Web liefert Neuheit
- Simulation liefert Projektion

---

# 26. Konkrete Designprinzipien

## 1. Websuche nicht als Hauptspeicher benutzen

Open Web eher als:

- Exploration
- Discovery
- Freshness-Layer

## 2. Hochwertige Indizes priorisieren

Baue zuerst gute thematische Indizes.

## 3. Polyglot statt monolithisch

Nicht alles in dieselbe DB pressen.

## 4. Go für Orchestrierung, nicht für alles

Go ideal für Netzwerk-/Routing-Schicht.

## 5. Python dort, wo ML/NLP sitzt

Embeddings, NER, Reranker, Ingestion-Pipelines.

## 6. Wissen inkrementell veredeln

Neue Quellen nicht sofort blind übernehmen:

- scoren
- validieren
- klassifizieren
- dann indexieren

---

# 27. Offene Probleme und echte Härten

Damit das Dokument nicht zu glatt klingt: einige Probleme sind wirklich hart.

## Harte Probleme

- Source trust / Verlässlichkeit
- Halluzinationen trotz Retrieval
- Recency vs Qualität
- Entity resolution bei widersprüchlichen Quellen
- Duplicate narratives aus vielen Newsartikeln
- event extraction aus unsauberen Texten
- multilingual retrieval
- kostenkontrollierte agentische Suche
- adversarial / SEO / propaganda content

## Wichtig

Viele Systeme scheitern nicht an Modellen, sondern an genau diesen operativen Details.

---

# 28. Schlussfolgerung

Die Kernpunkte unseres Gesprächs lassen sich so verdichten:

1. **Exa** ist interessant, weil es Search-Infrastruktur für Agenten baut.
2. **Neural Retrieval** ist wichtig, aber nicht die ganze Geschichte.
3. Der eigentliche Wert liegt oft im **Index** und in der **Datenpipeline**.
4. **Common Crawl** spart Arbeit, ersetzt aber nicht Qualitätsarbeit.
5. **Dezentrale oder föderierte Indizes** sind spannend, aber schwer.
6. Für dein System sind **thematische Indizes + strukturierte Daten + Websearch** die richtige Richtung.
7. **Go** passt sehr gut als Retrieval-Gateway und Orchestrator.
8. **Websearch** bleibt wichtig, weil dein Agent den Scope erweitern und neue Erkenntnisse finden muss.
9. Langfristig baust du nicht nur einen Agenten, sondern eine **Knowledge Infrastructure**, auf der Analyse, Simulation und Visualisierung sitzen.

Kurz:

> Du brauchst vermutlich keine einzelne Suchmaschine, sondern eine mehrschichtige, föderierte Wissens- und Retrieval-Architektur.
