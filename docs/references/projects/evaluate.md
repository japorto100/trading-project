# Projects and Libraries to Evaluate

> **Zweck:** Kandidaten mit echtem kurzfristigem oder mittelfristigem
> Evaluationswert. Im Unterschied zu `to-watch.md` geht es hier nicht um blosses
> Beobachten, sondern um bewusst vorbereitete Entscheidungsarbeit.

---

## Bewertungsregel

Ein Kandidat gehoert hierhin, wenn mindestens eine dieser Bedingungen gilt:

- realistischer Integrationspfad innerhalb der naechsten Phasen
- klarer moeglicher Produkt- oder Performance-Hebel
- offene, aber konkrete Gate-Frage (Lizenz, Runtime, UX-Fit, Compute-Fit)

Reine Fernradar-Themen bleiben in `to-watch.md`.

---

## Aktive Evaluationskandidaten

| Referenz | Typ | Wofuer evaluieren? | Primaeres Gate | Owner-Doc |
|----------|-----|--------------------|---------------|-----------|
| `@lab49/react-order-book` | Library / Repo | Orderbook-UI bei tieferem GCT-Depth-Ausbau | Brauchen wir echte Orderbook-Surface? | `../../FRONTEND_COMPONENTS.md` |
| `paperless-ngx` | Plattform / Repo | DMS-/OCR-/Dokumenten-UI-Patterns fuer ingestion-nahe Flows | Passt der Betriebs-/Komplexitaetsfaktor zu unserem Scope? | `../../FRONTEND_COMPONENTS.md`, `../../UNIFIED_INGESTION_LAYER.md` |
| `CodeGraphContext` | Tooling / Repo | Vergleich gegen bestehende KG-/Code-Context-Entwicklung (Frontend+Backend) | Bringt es messbaren Beschleunigungshebel gegen bestehenden Stack? | `../../MEMORY_ARCHITECTURE.md`, `../../AGENT_ARCHITECTURE.md` |
| `agency-agents` | Agent Framework / Repo | Rollen-/Capability-Pattern als Vergleichsfolie fuer Agent-Orchestrierung | Pattern-Mehrwert ohne Shell-zentrierte Runtime-Uebernahme? | `../../AGENT_ARCHITECTURE.md`, `../../AGENT_SECURITY.md` |

---

## Nicht hier, sondern anderswo

- **Sentiment-Modelle** wie FinBERT / FinGPT: Bewertung in `../../specs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- **Go-Connector-Kandidaten** wie `finnhub-go`: Bewertung in `../../GO_GATEWAY.md`, `../../references/projects/go-clients-and-adapters.md` und passenden Go-/Infra-Slices
- **Indicator-/Benchmark-Referenzen** wie `pandas-ta` und `TA-Lib`: Bewertung in `../../INDICATOR_ARCHITECTURE.md`
- **Rust-Systementscheidungen** wie `Kand`: Bewertung in `../../RUST_LANGUAGE_IMPLEMENTATION.md` und `../../specs/execution/rust_kand_evaluation_delta.md`
- **Memory-/KG-Refinement** wie `GraphMERT`: Bewertung in `../../MEMORY_ARCHITECTURE.md`
- **Agentic-Storage-Pattern** wie `clawvault`: Bewertung in `../../MEMORY_ARCHITECTURE.md` und `../../CONTEXT_ENGINEERING.md`
- **Lizenz-/Fernradar-Kandidaten ohne aktive Entscheidung**: `to-watch.md`
- **Bewusst ausgeschlossene oder unklare Kandidaten**: `will-not-use.md`
