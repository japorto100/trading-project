# MEMORY AND STORAGE BOUNDARIES

> **Stand:** 17. Maerz 2026  
> **Zweck:** Owner-Spec fuer Memory-Schicht-Trennung, Storage-Ownership, KG-Tech-Entscheidungen
> und epistemische Trennprinzipien.
> **Source-of-Truth-Rolle:** Autoritativ fuer Memory-Layer-Ownership und Storage-Regeln;
> vollstaendiges Schema und Implementierungs-Stufenplan in `docs/MEMORY_ARCHITECTURE.md`.

---

## 1. Drei-Schichten-Modell

| Schicht | Lebensdauer | Zugriffsart | Technologie |
|:--------|:------------|:------------|:------------|
| Working Memory (M1) | Sekunden-Minuten | schnell, fluechtig | Valkey/Redis (shared); in-process Fallback nur Dev |
| Episodic Memory (M3) | Stunden-Monate | gezielt abrufbar | Postgres (Ziel); SQLite lokal Bootstrap |
| Semantic Memory (M2) | Permanent | strukturiert querybar | FalkorDB (Backend); KuzuDB WASM (Frontend) |
| Vector Index (document-centric) | | semantisch | pgvector (Baseline); FalkorDB selektiv fuer graphnahe Vektoren |

---

## 2. Epistemische Trennpflicht (verbindlich)

- **truth:** kanonische oder stark verifizierte Fakten
- **belief:** plausibler, aber unsicherer Arbeitsstand
- **scenario:** hypothetische Simulations-/Planungszweige

Diese Ebenen duerfen **nie still vermischt** werden in Memory, Agentik, GeoMap oder Simulation.

---

## 3. Verbindliche Storage-Ownership

| Speicher | Rolle | Nicht-Ziel |
|:---------|:------|:-----------|
| **Postgres** | System of Record: persistente Domaindaten + episodic memory | kein hot-cache Ersatz |
| **Valkey/Redis** | shared hot cache / working memory mit TTL | kein langfristiger SoR |
| **redb (Rust)** | spezialisierter OHLCV/read-through cache im Python-Rust Pfad | kein allgemeiner Domain-Store |
| **FalkorDB** | Backend Domain-KG + graphnahe/selektive Vektoren | kein persoenlicher User-Store und kein relationaler SoR |
| **pgvector** | baseline semantic retrieval fuer dokument-/chunk-nahe Embeddings | kein Graph-Ersatz |
| **KuzuDB WASM** | Frontend User-KG (per-User im Browser) | kein zentraler Fact-Owner |

### Cache Provider Strategie (verbindlich)

```
CACHE_PROVIDER=redis|valkey|local
```

- `redis`/`valkey`: Standard in staging/prod
- `local`: nur Dev/Test (explizit degradierter Modus)

---

## 4. Zwei-Schichten-KG-Architektur

```
Backend Domain-KG (FalkorDB)        Frontend User-KG (KuzuDB WASM)
  - Strategeme, BTE-Marker           - Portfolio, Watchlists, Alerts
  - Krisenphasen, Akteur-Typen       - Journal, Drawings, Overrides
  - Live Event-Entity Graph          - Subset aus Backend (read-only)
  - selektive graphnahe Embeddings
```

### KG-Technologieentscheidung

| Schicht | Prototyp | Produktion | Begruendung |
|:--------|:---------|:-----------|:------------|
| Backend Domain-KG | NetworkX | **FalkorDB** | Redis-kompatibel, Cypher, built-in Vector Index |
| Frontend User-KG | KuzuDB WASM | KuzuDB WASM | Browser-eingebettet, Cypher, IndexedDB-persistiert |

**FalkorDB-Migrations-Trigger:** >1000 Nodes ODER Bedarf an persistenten Queries ODER Vector-Search noetig.

---

## 5. Namespace- und ID-Regeln (verbindlich)

| Namespace | Bedeutung |
|:----------|:----------|
| `g:` | canonical |
| `e:` | event |
| `u:` | user overlay |
| `c:` | claim/stance |
| `x:` | evidence |
| `s:` | simulation branch |
| `m:` | semantic memory |

**Canonical-ID-Prioritaet:** offizielle IDs (LEI/FIGI/ISIN/Wikidata) > deterministische interne IDs > keine user-generierten Zufalls-IDs fuer globale Fakten.

---

## 6. Source Persistence und Memory (verbindlich)

Memory baut nicht direkt auf ungefilterten Quellen-Rohdaten auf:

`source selection -> onboarding -> fetch/cache/snapshot -> normalize -> memory/vector ingestion`

- Raw snapshots gehoeren in den Object Store + relationalen Snapshot-Index.
- API-hot caches sind Working-Memory-Layer, kein Source of Truth.
- Vector Ingestion ist downstream consumer normalisierter Artefakte.
- Semantic Memory konsumiert strukturierte, normalisierte Fakten oder provenance-markierte Textsegmente.
- Dokument-/Chunk-Embeddings landen baseline-first in `pgvector`; `FalkorDB`
  speichert nur graphnahe oder bewusst selektierte Vektoren.

---

## 7. Memory-Ownership-Matrix

| Datentyp | Read-Owner | Write-Owner | Source of Truth |
|:---------|:-----------|:------------|:----------------|
| Portfolio/Orders/Journal | Go + Next read models | Go mutating APIs | Postgres (prod) / SQLite (local dev) |
| Geo Candidate/Review | Go/UIL APIs | Go/UIL | Go-owned stores + DB |
| Market hot snapshots | Go/Python services | Go/Python cache writers | Valkey/Redis (ephemeral) |
| OHLCV cache artifacts | Python-Rust bridge | Python-Rust bridge | redb (cache only) |
| Agent episodes / workflow logs | Agent services | Agent services | Postgres |
| KG domain facts | Memory services | Memory services | FalkorDB (target) |
| document/chunk embeddings | Agent/Indexing services | Agent/Indexing services | pgvector (baseline target) |
| User KG local graph | Frontend (per user) | Frontend (per user) | IndexedDB (encrypted) |

---

## 8. Querverweise

- `docs/MEMORY_ARCHITECTURE.md` (vollstaendiges M1-M5 Stufenplan, KG-Schema, Confidence Dampening)
- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/data/STORAGE_AND_PERSISTENCE.md`
- `docs/specs/security/CLIENT_DATA_ENCRYPTION.md`
- `docs/RAG_GRAPHRAG_STRATEGY_2026.md`
