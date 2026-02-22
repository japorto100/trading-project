# Context Engineering 2.0 -- Research Capture & Relevanz-Bewertung

> **Stand:** 22. Februar 2026
> **Zweck:** Strukturierte Wissensbasis aus NotebookLLM Deep-Research zu Context Engineering 2.0, Papers, Tools und Architektur-Patterns. Sortiert nach Relevanz fuer TradeView Fusion. Dient als Entscheidungsgrundlage fuer Einbau in bestehende Docs.
> **Status:** Temporaer. Wird nach Auswertung entweder in bestehende Docs integriert oder archiviert.
> **Kein Ersatz fuer:** [`CONTEXT_ENGINEERING.md`](./CONTEXT_ENGINEERING.md), [`MEMORY_ARCHITECTURE.md`](./MEMORY_ARCHITECTURE.md), [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md)

---

## Inhaltsverzeichnis

1. [CE 2.0 Framework-Ueberblick](#1-ce-20-framework-ueberblick)
2. [Tier 1: Direkt relevant fuer bestehende Architektur](#2-tier-1-direkt-relevant)
3. [Tier 2: Architektur-relevant fuer zukuenftige Entscheidungen](#3-tier-2-architektur-relevant)
4. [Tier 3: Infrastruktur und Hardware (langfristig)](#4-tier-3-infrastruktur-und-hardware)
5. [Tier 4: PKM und Tooling (nice-to-know)](#5-tier-4-pkm-und-tooling)
6. [Relevanz-Matrix](#6-relevanz-matrix)
7. [Quellen-Verzeichnis](#7-quellen-verzeichnis)

---

## 1. CE 2.0 Framework-Ueberblick

### Was ist Context Engineering 2.0?

Das Paper "Context Engineering 2.0: The Context of Context Engineering" (arXiv:2510.26493) definiert CE 2.0 als den Uebergang von "Prompt Engineering" (Text optimieren) zu einer systematischen Disziplin mit drei Saeulen:

| Saeule | Was sie tut | Unser Aequivalent |
|---|---|---|
| **Collection** | Kontext sammeln: RAG, Tool-Calls, Sensor-Daten, User-Input | Memory Layer M1-M4 (`MEMORY_ARCHITECTURE.md`) |
| **Management** | Kontext verwalten: Komprimieren, Filtern, Priorisieren, Vergessen | Context Assembler (`CONTEXT_ENGINEERING.md` Sek. 3-5) |
| **Usage** | Kontext nutzen: An den richtigen Agent liefern, Token-Budget einhalten | Agent-Pipeline (`AGENT_ARCHITECTURE.md` Sek. 2) + Role-Context Matrix (`CONTEXT_ENGINEERING.md` Sek. 8) |

### CE 2.0 vs. CE 3.0

| Aspekt | Context 1.0 | Context 2.0 (aktuell) | Context 3.0 (Ausblick) |
|---|---|---|---|
| **Paradigma** | Prompt Engineering | Context Engineering (Systematic) | Autonomous Context |
| **Interaktion** | Mensch tippt Prompt | Human-Agent Interaction (HAI) | Agent-Agent Interaction |
| **Verstaendnis** | Input/Output | Situation + Absichten verstehen | Uebermenschliches Kontextverstaendnis |
| **Speicher** | Statisch (im Prompt) | Layered Memory (Working/Episodic/Semantic) | Self-Evolving Memory |
| **Standard** | Keiner | MCP (Model Context Protocol) | ? |

### Kern-Konzept: "Self-Baking"

CE 2.0 beschreibt "Self-Baking" als automatische Verdichtung: Roher Kontext (High-Entropy) wird in abstrakteres, kompakteres Wissen (Low-Entropy) transformiert. Das System "baeckt" seine eigenen Erinnerungen.

**Mapping auf unser Projekt:**
- Episodic Memory (M3) erzeugt Roh-Eintraege (`analysis_log` mit Score, Reasoning, Marktreaktion)
- Self-Baking = automatische Aggregation: "Bei MENA/Sanctions-Events bin ich systematisch zu konservativ" → wird zu einem KG-Edge in M2a
- Aktuell nicht implementiert. Wuerde zwischen M3 und M2a sitzen als periodischer "Baking Job"

---

## 2. Tier 1: Direkt relevant

### 2.1 Context Compression / Pruning

#### DyCP -- Dynamic Context Pruning (arXiv:2601.07994)

**Was es ist:** Algorithmus fuer dynamisches Pruning langer Dialoge. Nutzt "KadaneDial", eine Modifikation von Kadane's Maximum-Subarray-Algorithmus, um in Echtzeit die relevantesten Abschnitte eines Dialogs zu identifizieren.

**Kernidee:** Statt die gesamte Chat-Historie an das Modell zu senden, filtert DyCP in Echtzeit nur die Segmente heraus, die fuer die aktuelle Frage relevant sind. Der Rest wird ausgeblendet, ohne den logischen Faden zu zerreissen.

**Relevanz fuer uns (HOCH):**
- Direkt anwendbar auf `CONTEXT_ENGINEERING.md` Sek. 5 (Token-Budget-Management)
- Aktuell haben wir statische Kompressionsstrategien (Sek. 5.3: "Vector-Results auf Top-3 → Top-1 reduzieren")
- DyCP wuerde dynamische, inhaltsbasierte Kompression ermoeglichen
- Besonders relevant fuer Earnings-Call-Analyse (`AGENT_ARCHITECTURE.md` Sek. 7): Ein 60-Minuten-Transcript hat ~15.000 Tokens, aber nur 2-3 Segmente sind fuer eine spezifische Frage relevant

**Konkreter Einbau-Punkt:** `CONTEXT_ENGINEERING.md` Sek. 5.3 (Kompressionsstrategien) als neue Strategie "DyCP-basiertes Segment-Pruning" fuer Episodic Context und lange Inputs

#### LLMLingua-2 (Microsoft Research)

**Was es ist:** Data-Distillation-Methode fuer Prompt-Kompression. Entfernt mathematisch berechenbar irrelevante Tokens aus einem Prompt, bevor er an das Haupt-LLM gesendet wird. 2-5x Kompressionsraten bei minimalem Qualitaetsverlust.

**Kernidee:** Ein kleines, schnelles Modell (z.B. XLM-RoBERTa) entscheidet Token-fuer-Token, welche Tokens entfernt werden koennen, ohne die Bedeutung zu aendern. Das komprimierte Ergebnis geht dann an das teure Haupt-LLM.

**Relevanz fuer uns (HOCH):**
- Pre-Processing-Schritt VOR dem Context Assembler (`CONTEXT_ENGINEERING.md` Sek. 8.3)
- Besonders wertvoll fuer Vector/RAG-Ergebnisse (M4): Retrieved Documents enthalten oft Fuelltext
- Reduktion der Token-Kosten bei LLM-Agent-Calls um 50-80%

**Konkreter Einbau-Punkt:** Neuer Schritt im Context Assembly (`CONTEXT_ENGINEERING.md` Sek. 8.3): Nach Retrieval, vor Budget-Allokation

#### ContextEvolve (arXiv:2602.02597)

**Was es ist:** Multi-Agent Context Compression speziell fuer Code-Optimierung. Drei Agenten verdichten Kontext in drei Dimensionen: Zusammenfassung, Structural Extraction, Semantic Compression.

**Kernidee:** Ein "Summarizer-Agent" fasst alten Code in semantische Text-Zusammenfassungen zusammen. Aehnlich wie Gedaechtnis-Konsolidierung beim Reinforcement Learning.

**Relevanz fuer uns (NIEDRIG -- nicht uebertragbar):**
- Speziell fuer Code-Optimierung entwickelt, nicht auf Trading/Event-Analyse uebertragbar
- Das Multi-Agent-Compression-Pattern ist konzeptionell interessant, aber die drei Dimensionen (Code Summary + Structural Extraction + Semantic) passen nicht auf unser Domain
- Self-Baking (Episodic → Semantic) wird besser durch einen einfachen aggregierenden Baking-Job geloest als durch Multi-Agent-Compression

**Konkreter Einbau-Punkt:** Nur Referenz. Pattern-Inspiration fuer Self-Baking, aber kein direkter Einbau.

#### ComprExIT

**Was es ist:** Token-Kompression speziell fuer "In-Context Learning" (Few-Shot Prompts). Reduziert die Laenge von Beispielen im Prompt, ohne deren Lernwert zu zerstoeren.

**Relevanz fuer uns (NIEDRIG-MITTEL):**
- Relevant nur wenn wir Few-Shot-Prompting in Agent-Pipelines nutzen
- Aktuell nicht der Fall (unsere Agents bekommen KG-Slices + Regeln, keine Few-Shot-Beispiele)
- Koennte relevant werden wenn der Synthesizer-Agent historische Analysen als Beispiele bekommt

### 2.2 RAG vs. Long Context Debatte

#### Kern-Erkenntnis: RAG gewinnt (aber anders als frueher)

Die Industrie hat 2026 klar gezeigt: Einfach alles in ein 1M-Token-Fenster werfen ist:
- **1.250x teurer** als gezieltes RAG pro Query
- **30-60s Latenz** statt ~1s bei RAG
- **"Context Rot":** Modelle werden messbar schlechter ab ~32K Tokens
- **"Lost in the Middle":** Wichtige Fakten in der Mitte eines langen Kontexts werden ignoriert (U-Kurven-Effekt)

**Validierung unserer Architektur:**
- Unsere Token-Budget-Strategie (`CONTEXT_ENGINEERING.md` Sek. 5) ist korrekt: 6K-40K Tokens je nach Modell, nicht "so viel wie moeglich"
- Unsere Retrieval-Policies (`CONTEXT_ENGINEERING.md` Sek. 3) sind korrekt: Gezielte Schicht-Abfragen statt "alles laden"
- "Context Rot" bestaetigt den Priority-Stack (Sek. 5.4): System Prompt + Current Input sind unantastbar, Rest wird gekuerzt

#### Agentic RAG / State-Aware Retrieval

**Was es ist:** Die naechste Generation von RAG. Statt blind Top-K Chunks zu holen, erstellt das System einen "Retrieval-Plan": Welche Quellen, in welcher Reihenfolge, mit welchem Filter?

**Kernidee:** Der Agent analysiert die Query ZUERST, entscheidet dann welche Memory-Schichten er braucht, und fuehrt gezielte Queries aus. Nicht "suche aehnliche Dokumente", sondern "ich brauche die Kausalkette Iran→Oil→GLD aus dem KG, und die letzten 3 aehnlichen Events aus dem Vector Store".

**Relevanz fuer uns (MITTEL -- bereits tangiert):**
- Beschreibt exakt was unser Merge-Layer BEREITS tut (`CONTEXT_ENGINEERING.md` Sek. 6.2): Frontend queries User-KG → Symbol-IDs → Backend enrichment via KG + Vector + Episodic
- Bestaetigt die Query-Typ → Memory-Schicht Matrix (Sek. 3.1) als richtigen Ansatz
- Der "Dynamic Retrieval Planner" waere eine spaetere Verfeinerung: Statt statischer Matrix koennte ein leichtgewichtiger Agent den Plan erstellen -- aber erst wenn die Pipeline laeuft

**Konkreter Einbau-Punkt:** Kein sofortiger Einbau. Merge-Pipeline ist bereits konzipiert. "Dynamic Retrieval Planner" als Zukunftsnotiz in `CONTEXT_ENGINEERING.md` Sek. 3 (spaeter)

#### GraphRAG (Microsoft & Community)

**Was es ist:** RAG-Ansatz der Wissensgraphen statt (oder zusaetzlich zu) Vektoren nutzt. Beantwortet Fragen die ueber einfache Aehnlichkeitssuche hinausgehen: "Was haengt mit was zusammen?"

**Kernidee:** Ein Knowledge Graph speichert Entitaeten und ihre Beziehungen. Bei einer Query wird nicht nach aehnlichen Text-Chunks gesucht, sondern der Graph wird traversiert: "Iran → Sanctions → Oil → Energy Sector → welche Symbole?"

**Relevanz fuer uns (HOCH -- bereits eingeplant):**
- Ist exakt unsere FalkorDB-Architektur (`MEMORY_ARCHITECTURE.md` Sek. 5.2 M2a)
- FalkorDB = Graph + Vector in einer DB = GraphRAG out of the box
- CE 2.0 Research bestaetigt: Graph fuer Struktur, Vector fuer Semantik, Hybrid fuer das Beste aus beiden Welten

**Konkreter Einbau-Punkt:** Bereits eingeplant. Kein neuer Einbau noetig, aber die CE 2.0 Terminologie ("GraphRAG") koennte in unsere Docs aufgenommen werden als Referenz

### 2.3 MCP als Industriestandard

#### Model Context Protocol (MCP) -- Anthropic

**Was es ist:** Offener Standard fuer die Zwei-Wege-Kommunikation zwischen LLMs und externen Tools/Datenquellen. "USB-C fuer KI" -- ein einheitlicher Stecker statt N×M individuelle Integrationen.

**Kernidee:** Statt fuer jede Kombination aus LLM + Tool eigenen Code zu schreiben, definiert MCP ein Protokoll: Server exponieren Tools/Resources, Clients (LLMs) nutzen sie. Standardisierte Discovery, Auth, Error Handling.

**Relevanz fuer uns (MITTEL -- bereits teilweise vorhanden):**
- `AUTH_SECURITY.md` Sek. 8 definiert bereits MCP-Sicherheit fuer den Go Gateway
- `GO_GATEWAY.md` Sek. 2 beschreibt MCP Use Cases
- CE 2.0 bestaetigt: MCP ist 2026 der absolute Industriestandard
- Unser Go Gateway exponiert bereits Tools (get_quote, get_ohlcv etc.) -- MCP wuerde das standardisieren

**Konkreter Einbau-Punkt:** Kein sofortiger Einbau noetig. MCP-Haertung ist in Sprint 6.x nach Auth eingeplant. CE 2.0 Research bestaetigt die Richtigkeit dieses Plans.

### 2.4 CE 2.0 Luecken-Analyse: Was uns fehlt

Das NotebookLLM-Gespraech identifiziert drei Luecken fuer ein vollstaendiges CE 2.0 System:

| Luecke | CE 2.0 Bezeichnung | Unser Status | Handlungsbedarf |
|---|---|---|---|
| **Orchestrierung** (Memory Controller / "OS") | MemOS / Letta (veraltet, nicht SOTA) | Statische Policies: `CONTEXT_ENGINEERING.md` Sek. 7.1 (TTL), Sek. 5.3 (Kompression) | Niedrig: Statische Policies reichen fuer 1-5 User. Spaeter eigener Baking-Job |
| **Strukturierung** (Graph) | Knowledge Graph / GraphRAG | Geplant: FalkorDB (`MEMORY_ARCHITECTURE.md` M2a) | Erledigt: Bereits eingeplant |
| **Interoperabilitaet** (Protokoll) | MCP | Teilweise: `GO_GATEWAY.md` Sek. 2, `AUTH_SECURITY.md` Sek. 8 | Erledigt: In Sprint 6.x eingeplant |
| **Context Compression** (dynamisch) | DyCP, LLMLingua-2 | Fehlt: Nur statische Kompression (Sek. 5.3) | **HOCH: Einbauen in CONTEXT_ENGINEERING.md** |

**Groesste Luecke: Dynamische Context Compression**

CE 2.0 zeigt: Die groesste praktische Luecke in unserer Architektur ist nicht der Memory Controller (MemOS ist veraltet, unsere statischen Policies reichen), sondern das Fehlen dynamischer Kompression. Unsere Kompressionsstrategien (`CONTEXT_ENGINEERING.md` Sek. 5.3) sind rein regelbasiert ("reduziere Vector-Results auf Top-1"). CE 2.0 zeigt zwei konkrete Verbesserungen:

1. **DyCP** fuer Dialog-/Event-History: Dynamisch berechnen welche Segmente relevant sind (statt statisch "letztes Event")
2. **LLMLingua-2** als Pre-Processing: Mathematisch irrelevante Tokens entfernen bevor sie Budget belegen

**Bewertung:** Dies ist der einzige CE 2.0 Baustein der sofort in unsere Docs gehoert -- als neue Strategie in `CONTEXT_ENGINEERING.md` Sek. 5.3.

---

## 3. Tier 2: Architektur-relevant

### 3.1 Theoretical Limitations of Embedding-Based Retrieval (arXiv:2508.21038)

**Was es beweist:** Mathematischer Beweis dass Standard-Embeddings (Single-Vector pro Dokument/Chunk) bei komplexen Aufgaben fundamental versagen. Specifically:
- Reasoning-Aufgaben ("Wenn A dann B, und B dann C -- was folgt?") koennen von Single-Vector-Aehnlichkeitssuche nicht korrekt abgerufen werden
- Instruction-Following ("Finde das Gegenteil von X") wird durch Similarity-Search verfaelscht (Similarity findet aehnliches, nicht gegenteiliges)
- Multi-Hop-Queries ("Was beeinflusst was beeinflusst mein Portfolio?") erfordern Graph-Traversal, nicht Vektorsuche

**Relevanz fuer uns (HOCH -- validiert bestehende Entscheidung):**
- Bestaetigt mathematisch warum `GAME_THEORY.md` Sek. 8 einen KG statt Vector DB empfiehlt
- Strategem 6 (Cheap Talk) und Strategem 8 (Costly Signal) sind kontrastiv -- Similarity Search wuerde sie vermischen. Das Paper liefert den formalen Beweis dafuer.
- Unsere Zwei-Schichten-Architektur (FalkorDB Graph + Vector) ist die korrekte Antwort auf diese Limitation

**Konkreter Einbau-Punkt:** Referenz in `MEMORY_ARCHITECTURE.md` Sek. 5.2 ("Warum Knowledge Graph statt Vector DB") als zusaetzliche formale Begruendung

### 3.2 HGMem -- Hypergraph-based Memory

**Was es ist:** Langzeitgedaechtnis das Informationen nicht als flache Liste (wie eine Datenbank) oder als Graph (paarweise Kanten) speichert, sondern als Hypergraph. Ein Hypergraph erlaubt Kanten die mehrere Knoten gleichzeitig verbinden.

**Kernidee:** Ein Event wie "Iran-Sanctions am 22.02.2026 betreffen Oil, GLD, XOM und Region MENA gleichzeitig" ist eine Hyperedge die 4+ Knoten verbindet. In einem normalen Graph brauchst du 6+ einzelne Kanten dafuer.

**Relevanz fuer uns (NIEDRIG -- bereits geloest):**
- Unser Event-Entity Graph (Domain C in `MEMORY_ARCHITECTURE.md` Sek. 6.1) modelliert genau solche Multi-Node-Events
- Bereits geloest via Event-Node-Pattern: Ein Event-Knoten mit N Kanten (`event_beteiligt`, `event_in_region`, `event_beeinflusst`)
- FalkorDB/KuzuDB unterstuetzen keine nativen Hyperedges -- und brauchen es auch nicht

**Konkreter Einbau-Punkt:** Kein Einbau. Unser Event-Node-Pattern ist die korrekte Approximation.

### 3.3 Engram -- Parametric Memory (arXiv:2601.07372)

**Was es ist:** Methode um Langzeitgedaechtnis direkt in die Modellparameter zu integrieren ("Parametric Lookup"), statt es extern in einer Datenbank zu lagern und per RAG abzurufen.

**Kernidee:** Statt "Frage → Datenbank → Retrieved Context → LLM", wird das Wissen direkt ins Modell "eingebrannt" (aehnlich Fine-Tuning, aber gezielter via N-Gram-basierte Conditional Memory Lookup Tables).

**Relevanz fuer uns (NIEDRIG -- Zukunft):**
- Wir nutzen keine eigenen Fine-Tuned Models (aktuell: API-basierte LLMs oder Ollama-lokale Modelle)
- Wird relevant wenn wir eigene Domain-spezifische Modelle evaluieren (z.B. ein "TradeView-FinBERT" das BTE-Marker-Wissen parametrisch gespeichert hat)
- Konzeptionell interessant: Anstatt dem Synthesizer-Agent BTE-Marker-Definitionen per KG-Slice zu liefern (500-1000 Tokens), koennten die Definitionen im Modell selbst sein

**Konkreter Einbau-Punkt:** Nur als Referenz in `Advanced-architecture-for-the-future.md` (falls gewuenscht)

### 3.4 DeepSeek OCR / Optical Compression (arXiv:2510.18234)

**Was es ist:** Methode die "High-Entropy" Text (lange Dokumente) in komprimierte visuelle Token (Low-Entropy) umwandelt. Statt Text zusammenzufassen (was Details verliert), wird der Text als Bild-Token repraesentiert.

**Kernidee:** Ein langes SEC Filing (50 Seiten, ~100K Tokens) wird durch DeepSeek OCR in eine kompakte visuelle Repraesentation umgewandelt, die ein multimodales LLM (GPT-4o, Gemini) direkt als "Langzeitgedaechtnis" nutzen kann. Die visuelle Kompression behaelt mehr Details als Text-Zusammenfassungen.

**Relevanz fuer uns (NIEDRIG -- Voraussetzungen fehlen):**
- Setzt multimodales LLM voraus (GPT-4o, Gemini) -- aktuell nicht in unserer Pipeline
- Unsere lokalen Modelle (Ollama) unterstuetzen keine Visual Tokens
- LLMLingua-2 loest das gleiche Problem (Token-Reduktion) ohne multimodale Abhaengigkeit
- Koennte spaeter fuer SEC Filings relevant werden, aber erst nach M5-Implementation

**Konkreter Einbau-Punkt:** Nur Referenz. Erst relevant wenn multimodale Modelle in der Pipeline sind.

### 3.5 MemOS / Letta (ehemals MemGPT)

**Was es ist:** "Memory Operating System" -- ein Framework das den Transfer zwischen Kurzzeit- und Langzeitgedaechtnis fuer LLM-Agents regelt. Automatisiert das "Self-Baking" und die Retention-Policies.

**Kernidee:** Wie ein Betriebssystem-Kernel fuer Memory: Entscheidet autonom wann Daten zwischen Working Memory (Context Window), Archival Storage (Langzeit-DB) und Core Memory (Agent-Persoenlichkeit) verschoben werden. "Virtual Context Management" aehnlich wie Virtual Memory in einem OS.

**Status 2026:** MemGPT wurde zu "Letta" rebranded. **Explizit nicht mehr SOTA fuer 2026** -- NotebookLLM bezeichnet es als "Context 1.5 / Legacy-Tool". Die Ideen (Virtual Context Management) sind in andere Frameworks eingeflossen. CE 2.0 referenziert es als historisches Konzept, nicht als Empfehlung.

**Relevanz fuer uns (NIEDRIG -- veraltet, nur Konzept-Inspiration):**
- Das *Konzept* eines Memory Controllers ist langfristig relevant, die *Tools* nicht
- Fuer 1-5 User mit moderatem Datenvolumen reichen unsere statischen TTL-Policies (`CONTEXT_ENGINEERING.md` Sek. 7.1)
- Wenn Datenvolumen waechst (>10K Episodic Eintraege), waere ein selbst gebauter "Baking Job" sinnvoller als ein veraltetes Framework

**Konkreter Einbau-Punkt:** Nur Referenz. Kein Einbau.

---

## 4. Tier 3: Infrastruktur und Hardware

### 4.1 Mamba-3 / State Space Models (SSMs)

**Was es ist:** Alternative Architektur zu Transformern. SSMs (wie Mamba) benoetigen fuer Inferenz nur lineare Zeit O(n) statt quadratischer Zeit O(n^2) wie Transformer-Attention, und haben einen komprimierten State statt des gesamten KV-Cache.

**Kern-Trade-off 2026:** Reine Mamba-Modelle sind schnell, aber schwach bei praezisem Fakten-Retrieval. Daher: Hybride Architekturen (Mamba-Schichten fuer Geschwindigkeit + wenige Attention-Schichten fuer Praezision) sind SOTA.

**Relevanz fuer uns (KEINE -- wir trainieren nicht):**
- Wir konsumieren LLMs via API oder lokale Modelle (Ollama)
- Die Architektur des LLMs ist fuer uns transparent
- Wird relevant wenn wir bewusst Mamba-basierte Modelle waehlen (z.B. fuer sehr lange Earnings-Call-Transkripte)

### 4.2 Ring Attention / NVSHMEM

**Was es ist:** Distributed-Training-Technik die die quadratischen Speicherkosten von Transformer-Attention umgeht, indem die Berechnung "ringfoermig" ueber mehrere GPUs verteilt wird. Ermoeglicht Training von Modellen mit Millionen-Token-Kontextfenstern.

**Relevanz fuer uns (KEINE):**
- Training-Infrastruktur, nicht Inferenz
- Wir trainieren keine Modelle
- Rein akademisches Interesse

---

## 5. Tier 4: PKM und Tooling

### 5.1 Memos (usememos/memos)

Self-Hosted Notiz-Tool (Go + SQLite). Klassiker in der Community, v0.26.1 (Feb 2026). Schnell, datenschutzfreundlich, minimal. Keine native RAG, kein Self-Baking. Fuer unser Projekt irrelevant (wir bauen eine Trading-Plattform, kein PKM).

### 5.2 Blinko

Open-Source PKM mit "AI-first capture". Native RAG-Funktionen und lokale KI. Interessant als Pattern wie man RAG in ein Produkt integriert, aber nicht direkt relevant.

### 5.3 Anytype (MCP-Integration)

Objekt-basiertes Wissensnetzwerk mit MCP-Integration. Erlaubt externen KI-Agenten Zugriff auf den Workspace. Das MCP-Integrations-Pattern ist konzeptionell interessant fuer unseren Go Gateway MCP-Server.

### 5.4 Octarine

Datenschutzfokussiertes Markdown-PKM. Keine direkte Relevanz.

---

## 6. Relevanz-Matrix

### Legende

| Kategorie | Bedeutung |
|---|---|
| **EINBAUEN** | Konkret in bestehende Docs einarbeiten |
| **VALIDIERT** | Bestaetigt bestehende Entscheidung, als Referenz/Zitat aufnehmen |
| **REFERENZ** | Interessant, kein Handlungsbedarf, bleibt in diesem Research-File |
| **KEINE** | Irrelevant fuer unser Projekt |

### Matrix

| # | Konzept | Paper/Quelle | CE 2.0 Saeule | Kategorie | Betroffenes Doc | Einbau-Vorschlag |
|---|---|---|---|---|---|---|
| 1 | **DyCP** (Dynamic Context Pruning) | arXiv:2601.07994 | Management | **EINBAUEN** | `CONTEXT_ENGINEERING.md` Sek. 5.3 | Neue Kompressionsstrateige: Segment-Pruning via KadaneDial. Ersetzt statisches "Top-1 reduzieren" durch inhaltsbasiertes Pruning |
| 2 | **LLMLingua-2** (Prompt Compression) | Microsoft Research | Management | **EINBAUEN** | `CONTEXT_ENGINEERING.md` Sek. 5.3 / 8.3 | Pre-Processing-Schritt vor Context Assembly: Mathematische Token-Reduktion 50-80% via kleines Hilfsmodell |
| 3 | **Self-Baking** (Episodic→Semantic) | arXiv:2510.26493 | Management | **EINBAUEN** | `MEMORY_ARCHITECTURE.md` Sek. 9.6 | Beantwortet offene Frage "Wie fliesst M3 in M2a zurueck?". Periodischer Aggregations-Job: Episodic Patterns → KG-Edges |
| 4 | **RAG vs. Long Context** + "Context Rot" + "Lost in the Middle" | Byteiota, LightOn AI, Google Research | Usage | **VALIDIERT** | `CONTEXT_ENGINEERING.md` Sek. 5 | Formale Begruendung fuer Token-Budget-Strategie. "Context Rot ab 32K" + "U-Kurve" als Zitate aufnehmen. Priority-Stack ist bereits korrekt |
| 5 | **GraphRAG** | Microsoft Research | Collection | **VALIDIERT** | `MEMORY_ARCHITECTURE.md` M2a | Bestaetigt FalkorDB-Entscheidung. "GraphRAG" als CE 2.0 Terminologie in Docs aufnehmen |
| 6 | **Embedding Limitations** (Theoretical) | arXiv:2508.21038 | Usage | **VALIDIERT** | `MEMORY_ARCHITECTURE.md` Sek. 5.2 | Formaler Beweis: Single-Vector-Embeddings versagen bei kontrastivem Reasoning. Bestaetigt `GAME_THEORY.md` Sek. 8 (Strategem 6 vs. 8). Als Zitat aufnehmen |
| 7 | **MCP** (Model Context Protocol) | modelcontextprotocol.io | Framework | **VALIDIERT** | `AUTH_SECURITY.md` Sek. 8 | Bestaetigt Industriestandard 2026. Bereits in Sprint 6.x eingeplant. Kein Handlungsbedarf |
| 8 | **Agentic RAG** (State-Aware Retrieval) | Squirro, Google Dev Blog | Collection | **REFERENZ** | `CONTEXT_ENGINEERING.md` Sek. 3, 6.2 | Bereits tangiert: Unser Merge-Layer (Sek. 6.2) implementiert State-Aware Retrieval. "Dynamic Retrieval Planner" als Zukunftsnotiz |
| 9 | **CE 2.0 3-Saeulen-Modell** | arXiv:2510.26493 | Framework | **REFERENZ** | `CONTEXT_ENGINEERING.md` Sek. 1 | Nuetzliches Vokabular-Mapping (Collection=M1-M4, Management=CE.md, Usage=Agent-Pipeline). Kein Architektur-Aenderung |
| 10 | **MemOS / Letta** (Memory Controller) | CE 2.0 Paper | Management | **REFERENZ** | -- | **Nicht SOTA 2026** (NotebookLLM: "Context 1.5 / Legacy"). Konzept eines Memory Controllers ist langfristig relevant, Tools veraltet. Statische Policies reichen |
| 11 | **ContextEvolve** (Multi-Agent Compression) | arXiv:2602.02597 | Management | **REFERENZ** | -- | Fuer Code-Optimierung entwickelt, nicht auf Trading/Event-Analyse uebertragbar. Pattern-Inspiration fuer Self-Baking |
| 12 | **HGMem** (Hypergraph Memory) | CE 2.0 Paper | Collection | **REFERENZ** | -- | Unser Event-Node-Pattern ist die korrekte Approximation. FalkorDB/KuzuDB unterstuetzen keine Hyperedges |
| 13 | **DeepSeek OCR** (Optical Compression) | arXiv:2510.18234 | Management | **REFERENZ** | -- | Setzt multimodale Modelle voraus (nicht in Pipeline). LLMLingua-2 loest gleiches Problem ohne Abhaengigkeit |
| 14 | **ComprExIT** | CE 2.0 Paper | Management | **REFERENZ** | -- | Nur relevant bei Few-Shot-Prompting (aktuell nicht genutzt) |
| 15 | **Engram** (Parametric Memory) | arXiv:2601.07372 | Collection | **REFERENZ** | -- | Erst bei eigenen Fine-Tuned Models relevant |
| 16 | **agents.mmd Format** | CE 2.0 Diskussion | Framework | **REFERENZ** | -- | Neues Format fuer Agent-Kontext. Beobachten, nicht einbauen |
| 17 | **Mamba-3 / SSMs** | OpenReview | Hardware | **KEINE** | -- | Wir trainieren nicht |
| 18 | **Ring Attention** | NVIDIA, AKASA | Hardware | **KEINE** | -- | Training-Infrastruktur |
| 19 | **Memos** | GitHub usememos | Tooling | **KEINE** | -- | PKM-Tool |
| 20 | **Blinko** | GitHub blinkospace | Tooling | **KEINE** | -- | PKM-Tool |
| 21 | **Anytype** | community.anytype.io | Tooling | **KEINE** | -- | PKM-Tool (MCP-Pattern interessant) |
| 22 | **Octarine** | octarine.app | Tooling | **KEINE** | -- | PKM-Tool |

### Zusammenfassung (korrigiert)

| Kategorie | Anzahl | Items | Aktion |
|---|---|---|---|
| **EINBAUEN** | 3 | DyCP, LLMLingua-2, Self-Baking | Konkret in bestehende Docs einarbeiten |
| **VALIDIERT** | 4 | RAG-Debatte, GraphRAG, Embedding Limits, MCP | Als Zitat/Referenz in bestehende Docs |
| **REFERENZ** | 9 | Agentic RAG, CE 2.0 Modell, MemOS, ContextEvolve, HGMem, DeepSeek OCR, ComprExIT, Engram, agents.mmd | Bleibt in diesem Research-File |
| **KEINE** | 6 | Mamba-3, Ring Attention, Memos, Blinko, Anytype, Octarine | Ignorieren |

---

## 7. Quellen-Verzeichnis

### Forschungspapiere und Preprints

| Paper | URL | Kategorie |
|---|---|---|
| Context Engineering 2.0: The Context of Context Engineering | https://arxiv.org/abs/2510.26493 | EINBAUEN (Self-Baking) + REFERENZ (Framework) |
| On the Theoretical Limitations of Embedding-Based Retrieval | https://arxiv.org/abs/2508.21038 | VALIDIERT |
| DYCP: Dynamic Context Pruning for Long-Form Dialogue | https://arxiv.org/abs/2601.07994 | EINBAUEN |
| ContextEvolve: Multi-Agent Context Compression | https://arxiv.org/abs/2602.02597 | REFERENZ |
| DeepSeek-OCR: Contexts Optical Compression | https://arxiv.org/abs/2510.18234 | REFERENZ |
| Engram: Conditional Memory via Scalable Lookup | https://arxiv.org/abs/2601.07372 | REFERENZ |
| LLMLingua-2: Data Distillation for Prompt Compression | https://www.researchgate.net/publication/384217654 | EINBAUEN |
| Mamba-3: Improved Sequence Modeling | https://openreview.net/forum?id=HwCvaJOiCj | KEINE |

### Code-Repositories und Standards

| Tool | URL | Kategorie |
|---|---|---|
| Model Context Protocol (MCP) Specification | https://modelcontextprotocol.io/specification/2025-11-25 | VALIDIERT |
| DeepSeek-OCR GitHub | https://github.com/deepseek-ai/DeepSeek-OCR | REFERENZ |
| Context Engineering 2.0 Code (SII-CLI) | https://github.com/GAIR-NLP/SII-CLI | REFERENZ |
| Awesome Generative AI Guide (RAG Table) | https://github.com/aishwaryanr/awesome-generative-ai-guide/blob/main/research_updates/rag_research_table.md | REFERENZ |
| Microsoft Research LLMLingua | https://www.microsoft.com/en-us/research/project/llmlingua/ | EINBAUEN |
| LLMLingua-2 Project Page | https://llmlingua.com/llmlingua2.html | EINBAUEN |
| Memos (usememos) | https://github.com/usememos/memos | KEINE |
| Blinko | https://github.com/blinkospace/blinko | KEINE |
| Octarine | https://octarine.app/changelog | KEINE |
| Anytype Community | https://community.anytype.io/latest | KEINE |

### Technologie-Blogs und Fachartikel

| Artikel | URL | Thema |
|---|---|---|
| Anthropic: Effective Context Engineering for AI Agents | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | CE Best Practices |
| The New Stack: Context is AI Coding's Real Bottleneck in 2026 | https://thenewstack.io/context-is-ai-codings-real-bottleneck-in-2026/ | Context als Engpass |
| Firecrawl: Context Engineering | https://www.firecrawl.dev/blog/context-engineering | CE vs Prompt Engineering |
| Elastic: What is Context Engineering | https://www.elastic.co/what-is/context-engineering | CE Grundlagen |
| Google Developers: Architecting Efficient Multi-Agent Framework | https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/ | Multi-Agent CE |
| NVIDIA: Accelerating Long Context Model Training | https://developer.nvidia.com/blog/accelerating-long-context-model-training-in-jax-and-xla/ | Ring Attention |
| Red Hat: Building Effective AI Agents with MCP | https://developers.redhat.com/articles/2026/01/08/building-effective-ai-agents-mcp | MCP Praxis |
| Oracle: Model Context Protocol MCP | https://www.oracle.com/database/model-context-protocol-mcp/ | MCP Enterprise |
| Redis: Context Window Overflow | https://redis.io/blog/context-window-overflow/ | Context Overflow |
| Sombra: AI Context Engineering Guide | https://sombrainc.com/blog/ai-context-engineering-guide | CE Guide |
| IntuitionLabs: What is Context Engineering | https://intuitionlabs.ai/articles/what-is-context-engineering | CE Grundlagen |
| CodeConductor: Context Engineering | https://codeconductor.ai/blog/context-engineering/ | CE Praxis |
| CodiLime: Model Context Protocol Explained | https://codilime.com/blog/model-context-protocol-explained/ | MCP Erklaerung |
| Generect: What is MCP? The 2026 Guide | https://generect.com/blog/what-is-mcp/ | MCP Guide |
| OneUptime: Context Compression | https://oneuptime.com/blog/post/2026-01-30-context-compression/view | Kompression |
| LightOn AI: RAG is Dead, Long Live RAG | https://www.lighton.ai/lighton-blogs/rag-is-dead-long-live-rag-retrieval-in-the-age-of-agents | RAG 2026 |
| Byteiota: RAG vs Long Context 2026 | https://byteiota.com/rag-vs-long-context-2026-retrieval-debate/ | RAG Debatte |
| Goomba Lab: Tradeoffs | https://goombalab.github.io/blog/2025/tradeoffs/ | Context Tradeoffs |
| AKASA: Ring Attention | https://akasa.com/blog/ring-attention | Ring Attention |
| AIT Lab: Survey S4 | https://ait-lab.vercel.app/story/survey-s4 | SSM Survey |
| Medium (Bolcato): Recursive Language Models | https://medium.com/@pietrobolcato/recursive-language-models-infinite-context-that-works-174da45412ab | Infinite Context |
| Uplatz: Breaking the Context Barrier | https://uplatz.com/blog/breaking-the-context-barrier-an-architectural-deep-dive-into-ring-attention-and-the-era-of-million-token-transformers/ | Ring Attention |
| Squirro: State of RAG GenAI | https://squirro.com/squirro-blog/state-of-rag-genai | RAG 2026 |
| Buildin: Top 10 Obsidian Alternatives | https://buildin.ai/blog/top-10-obsidian-alternatives | PKM Tools |

### Industrie-Reports und Use Cases

| Report | URL | Thema |
|---|---|---|
| Deloitte: State of AI in the Enterprise | https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/content/state-of-ai-in-the-enterprise.html | Enterprise AI |
| Kore.ai: What is Agentic AI | https://www.kore.ai/blog/what-is-agentic-ai | Agentic AI |
| Kore.ai: AI Agents in Healthcare | https://www.kore.ai/blog/ai-agents-in-healthcare-12-real-world-use-cases-2026 | Healthcare AI |
| Lumenalta: LLM Enterprise Applications 2026 | https://lumenalta.com/insights/9-llm-enterprise-applications-advancements-in-2026-for-cios-and-ctos | Enterprise LLMs |
| Summize: Legal Tech Trends 2026 | https://www.summize.com/resources/2026-legal-tech-trends-ai-clm-and-smarter-workflows | Legal AI |
| WNS: Healthcare Trends 2026 | https://www.wns.com/perspectives/articles/healthcare-in-2026-5-trends-leaders-cant-ignore | Healthcare |
| Stevens Online: Hidden Economics of AI Agents | https://online.stevens.edu/blog/hidden-economics-ai-agents-token-costs-latency/ | Token-Kosten |

### Community-Diskussionen

| Thread | URL | Thema |
|---|---|---|
| RAG wins... but only if you stop doing top-k and praying | https://www.reddit.com/r/AI_Agents/comments/1pvhacy/ | Agentic RAG |
| The 3 Architectures Poised to Surpass Transformers | https://www.reddit.com/r/ArtificialInteligence/comments/1pdk87r/ | SSMs vs Transformer |
