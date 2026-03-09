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
| `EquiCharts` | GitHub-Projekt | Custom-Chart-Erweiterung jenseits LWC | Reicht LWC + Plugins? | `../../FRONTEND_COMPONENTS.md` |
| `@lab49/react-order-book` | Library / Repo | Orderbook-UI bei tieferem GCT-Depth-Ausbau | Brauchen wir echte Orderbook-Surface? | `../../FRONTEND_COMPONENTS.md` |
| `Order Vantage` | GitHub-Projekt | Moderne React-Trading-UI-Performance-Patterns | Echter Mehrwert vs. eigener UI-Stack | `../../FRONTEND_COMPONENTS.md` |
| `goexchange` | GitHub-Projekt | weitere Exchange-Adapter im Go-Layer | Bedarf fuer neue Exchange-Familien? | `../../GO_GATEWAY.md` |
| `finnhub-go` | GitHub-Projekt | API-Coverage-/Client-Muster | Mehrwert vs. eigener Connector | `../../GO_GATEWAY.md` |
| `pandas-ta` | Library | Algorithmen-Referenz / Korrektheit | nur Referenz oder noch praktisch? | `../../INDICATOR_ARCHITECTURE.md` |
| `TA-Lib` | Library | Benchmark / Korrektheitsvergleich | lohnt weitere Pflege? | `../../INDICATOR_ARCHITECTURE.md` |
| `Kand` | Library / Projekt | Rust-Core-Kandidat | Reicht Funktionstiefe / Bindings? | `../../RUST_LANGUAGE_IMPLEMENTATION.md` |
| `GraphMERT` | Projekt / Research | KG-Slow-Lane-Refinement | echter ROI fuer Memory/KG? | `../../MEMORY_ARCHITECTURE.md` |

---

## Nicht hier, sondern anderswo

- **Sentiment-Modelle** wie FinBERT / FinGPT: Bewertung in `../../specs/geo/GEOMAP_DATA_CONTRACTS_AND_FEEDBACK.md`
- **Rust-Systementscheidungen**: `../../RUST_LANGUAGE_IMPLEMENTATION.md`
- **Lizenz-/Fernradar-Kandidaten ohne aktive Entscheidung**: `to-watch.md`
