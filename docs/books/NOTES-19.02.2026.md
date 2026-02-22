# Notizen 19.02.2026 (bereinigt)

> **Stand:** 19. Februar 2026
> **Bereinigt:** Alles was in Projekt-Dokumentation extrahiert wurde, ist entfernt. Verbleibende Eintraege sind entweder fuer andere Projekte oder noch nicht bearbeitet.
>
> **Was wurde wohin extrahiert?**
> - Zentralbanken-Filter (GeoMap) → [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.13
> - Events UI Modals → [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.14
> - News Copy/Paste Workflow → [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.15 → jetzt Top-Level in [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 6
> - YouTube-Content-Quellen (F) → [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 2.1 + [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) Unkonventionelle Quellen
> - Zentralbank-Bilanzen + APIs (C+D komplett) → [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md)
> - HKCM / Elliott / Fibonacci (E komplett) → [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 4.3-4.4
> - Arkham Intelligence + Risiken (G1+G2) → [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md)
> - investing.com, Symbole, DEX vs CEX (H1+H2+H5) → [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) + [`go-research`](./go-research-financial-data-aggregation-2025-2026.md)
> - Backtesting Go vs Python (H3) → [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) Sek. 5
> - Go↔Python↔Webapp Architektur (K) → beantwortet in Konversation (gRPC empfohlen)
> - d3-geo / Leaflet (B2) → bereits in [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Rendering-Sektionen

---

## A) Paperwatcher / Rust / Research-Stack (ANDERES PROJEKT)

+ Sind eig chunks.py die wir in layout modul haben und sosnt auch bei content.md eig embeddiings oder etwas anderes?
=> paperwatcher


### A1) Rust / Paperwatcher

* Rust -> paperwatcher evt einplanen einbauen buch deeplearning with rust copy paste aus tradingview clone

### A2) Research-/Study-Tools & Repos (Paperwatcher / Math)

* [https://github.com/assafelovic/gpt-researcher](https://github.com/assafelovic/gpt-researcher)
* [https://github.com/HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) => beides miteinbeziehen in paperwatcher math study evt?
* bayesanrag genauer anschauen paperwatcher drinnen
* promptengineering youtubevideo bezüglich google deepthink erwähnt etwas über sota synthesisis => genauer anschauen WICHTIG
* [https://github.com/PromtEngineer/agentic-file-search](https://github.com/PromtEngineer/agentic-file-search) => anschauen
* [https://www.youtube.com/watch?v=QxBJ9ORecMY](https://www.youtube.com/watch?v=QxBJ9ORecMY) => anschauen

### A3) "Daytrading Buch" / NotebookLLM / Cursor

* daytrading buch noch mit notebookllm und/oder tradingapp cursor anschauen
* indicator architecture md an notebookllm geben für python master buch damits schaut zum ergänzen
  und wichtige weitere dinge hinzufügt

### A4) Saved Papers als Context (RAG/GraphRAG)

* context7 mcp tool eig ins rag miteinbeziehen?
* bei paperwatcher fokusieren wir uns zentral auf papers arxiv usw. haben einen synthesizer. aber open-notebook-fork beschäftigt sich ja auch mit normalen websearches. brauchen wir einen haupt synthesizer oder so etwas?
* gespeicherte paper als contextinput benutzen können (evt nur zusammenfassung kommt rein mit agentic file search extension für das llm falls nötig mehr kontext, oder einfach read option aber des mds nicht pdfs ist ja leichter, hängt davon ab ob llm oder multimodales model)

### A5) "Algorithmen Datenbank"

* gibt es eig eine algorithmen daten bank python oder so alles beinhaltet für agent tools oder generell einfach das ich es habe?
* und überlegen ob wir irgendwo iwie auch math study mathe formel fix und fertige finden anstatt diese mühsam zu erstellen

---

## F) Trading-/Macro-Content Quellen (YouTube, Scraping, Bewertung) -- EXTRAHIERT

> **Extrahiert nach:** [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 2.1 (YouTube Transcripts, Kanal-Liste, Go-Libraries) + [`REFERENCE_PROJECTS.md`](./REFERENCE_PROJECTS.md) Sektion "Unkonventionelle Quellen".
> YouTube-Kanaele (Euro Dollar University, Marc Friedrich, Blocktrainer) sind dort mit Bewertung und Go-Fetching-Architektur dokumentiert.

---

## G3) KYC / Scan-Technologie (Arkham / allgemein) -- ANDERES THEMA

**KYC/Scan-Technologie allgemein** => von arkham angeschaut, automatische ausweis scann wenn korrekte entfernung (wahrscheinlich auch kontrast usw anpassung an licht usw) und auch gesichtscann sehr schnell und effizient

### Grundkomponenten

* **OCR** (Optical Character Recognition): Liest Text z.B. Namen, Geburtsdatum, ID-Nummern aus Pass/ID-Scan. Open-Source: Tesseract, easy-ocr
* **Gesichtserkennung + Vergleich**: System vergleicht Selfie-Foto und Dokumentenfoto. Open-Source: FaceNet, DeepFace (TF/PyTorch)
* **Liveness-Detection**: Stellt sicher dass du eine echte Person bist (nicht Foto/Video)

### SOTA Open-Source Gesichtserkennung

| Technologie | Zweck | Open-Source |
|---|---|---|
| **FaceNet** | Embeddings fuer Gesichtserkennung | Ja |
| **DeepFace** | Wrapper fuer mehrere Modelle | Ja |
| **Dlib + ResNet** | Klassiker fuer Gesichtserkennung | Ja |
| **MTCNN** | Gesichtserkennung/Detection | Ja |
| **InsightFace** | Sehr hohe Praezision | Ja |

---

## H4) Eigene Chatverlaeufe als Kontext in Tradeview -- OFFEN

* eigene chatgpt, gemini usw chats einfuegen koennen als wichtigen kontext in tradeview
* aber mit fragen gestellt bekommen aehnlich wie im plan modus => noch genauer ueberlegen wie wo was

---

## I) "Schematron-3B" Notizblock (ANDERES PROJEKT)

* Long-context extraction model: noisy HTML → sauberes, typisiertes JSON nach Schema
* Use-Cases: Web-Scraping ohne CSS-Selectors, Data Ingestion (HTML/PDF→records), Agent-Tool
* Anders als "LLM + JSON mode" weil trainiert fuer langen, dreckigen Input: relevante Felder finden, JSON stabil halten, nicht "kreativ" werden

---

## J) Agenten / Tooling / 2026 (ANDERES PROJEKT)

### J1) Strategische Implikation fuer Entwickler

Gefaehrdet: CRUD-App-Entwickler, Low-Complexity-Tooling, Repetitive Enterprise Apps
Wertvoll: Systemarchitekten, Agent-Orchestrierer, Workflow-Designer, Tooling-Integrator, Compliance-aware Engineers

### J2) AI-Coding-Agenten / Orchestrierung / Terminal

1. **AI-Coding-Agenten:** OpenHands, Aider, Cline
2. **Multi-Agenten-Orchestrierung:** CrewAI, Microsoft AutoGen, LangGraph
3. **KI-Terminal & Shell:** Ghostty (GPU-beschleunigt), Alacritty (Rust-basiert)

### J3) Claude Resume / open3.md / open4.md

* claude --resume 3c67f81c-ff9c-4d90-8334-948322d279fc => open3.md
* was hatte gemini bei open4.md bezueglich token caching usw geschrieben? WICHTIG!

---

## L) Zusaetzliche Repos / Komponenten / UI / Memory / Graph (ANDERES PROJEKT)

### L1) AgentZero / UI Extraction

* von agentzero dockerfile chatui usw extahieren habe ja agno ui in haweko aber denke

### L2) Weitere Repos

* [https://github.com/google/langextract](https://github.com/google/langextract)
* [https://github.com/iOfficeAI/AionUi](https://github.com/iOfficeAI/AionUi) vs openclaw?
* [https://github.com/rowboatlabs/rowboat](https://github.com/rowboatlabs/rowboat) => kg evt etwas uebernehmen obwohl wir brauchen nur graphiti etc
* [https://github.com/cinnyapp/cinny](https://github.com/cinnyapp/cinny) => fuer matrix in haweko

### L3) Personal AI Infrastructure (PAI) als Rahmen

* [https://github.com/danielmiessler/Personal_AI_Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure) => organisation meines ai agenten vs openclaw
  PAI als Architekturrahmen, OpenClaw als Agent-Executor, SurrealDB/Postgres als Memory-Layer, RAG/GraphRAG als Wissensschicht

---

## M) Tambo (React Generative UI) -- EVT. RELEVANT FUER TRADEVIEW

### M1) Repo/Link

* [https://github.com/tambo-ai/tambo](https://github.com/tambo-ai/tambo)

### M2) Was ist Tambo

Tambo ist ein **React-SDK fuer generative UI**: AI entscheidet welche Komponenten gerendert werden und welche Props sie bekommen.

```
User → AI → AI entscheidet → rendert React-Komponente
                         → ruft Tools
                         → manipuliert UI-State
```

AI antwortet nicht nur mit Text, sondern kann: Buttons generieren, Formulare triggern, React-Komponenten dynamisch rendern, UI-State veraendern, Tool Calls ausloesen.

### M3) Tambo vs OpenClaw

|              | Tambo           | OpenClaw        |
|---|---|---|
| Fokus        | UI + AI         | Agent Execution |
| Ort          | Frontend-lastig | Backend/Runtime |
| Autonomie    | gering          | hoch            |
| Tool-Calling | UI-gebunden     | System-gebunden |
| Memory       | optional        | zentral         |

### M4) Tambo ist framework-agnostic

Funktioniert mit Next.js UND Vite. Braucht kein SSR. Ist ein React-SDK/Library, kein App-Framework.

### M5) Fuer wen relevant

Wenn du: AI direkt in React-Webapp einbauen willst, AI als UI-Koordinator verwenden willst, Tool-calling aus dem Interface heraus willst, Streaming + interaktive Komponenten brauchst → dann interessant.

Strategisch gedacht:
```
React UI  →  Tambo (AI-UI-Layer)
Backend    →  eigener Agent Runtime
Memory     →  Postgres / Surreal / Graph
LLM        →  API oder lokal
```

---

## N) Next.js vs Vite (Entscheidungsblock) -- EVT. RELEVANT FUER TRADEVIEW

### Kernfrage

Wenn die App eine **authentifizierte Web-App** ist (Dashboard, Tool, Plattform), bringt SSR meistens wenig weil:
* User ist sowieso eingeloggt
* Daten kommen nach Login
* SEO ist irrelevant
* Inhalte sind dynamisch

### Entscheidungskriterien

| Feature | Next.js | Vite |
|---|---|---|
| Partial Pre-Rendering / ISR | Ja | Nein |
| Server-Side Rendering | Ja | Nein |
| Static Asset Hosting | Ja | Ja |
| Generative UI with Tambo | Ja | Ja |
| Standalone SPA | Nein (over-engineered) | Ja |
| API Routes | Ja | Nein |

### Wann Next.js

* SSR brauchst, SEO fuer Marketing, Content-Heavy-Seiten, Server Components, Edge Rendering

### Wann Vite

* Backend (Django/Go/Python) ist Herzstueck, Auth serverseitig, Agenten komplex, langfristige Wartbarkeit, klare Systemgrenzen

### Wichtig fuer TradeView Fusion

TradeView Fusion nutzt **Next.js 16 + React 19** mit API Routes die als Proxy zum Go Gateway und Python Services dienen. Die Entscheidung Next vs Vite betrifft primaer Haweko. Fuer TradeView ist Next.js die richtige Wahl weil:
* API Routes als Proxy genutzt werden (Go Gateway, Python Services)
* Server Components fuer initiale Chart-Daten nuetzlich
* Ecosystem (shadcn, TanStack Query) darauf optimiert
* Kein Migrationsbedarf

---

## O) Misc / Offene Punkte

* watson.ch Nachrichten copypastable erlauben (bereits in GeoMap Sek. 35.15 als "Copy/Paste News Import" erfasst)
