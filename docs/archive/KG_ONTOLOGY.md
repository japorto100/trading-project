# Knowledge Graph Ontologie -- Schema & Quellen

> **ARCHIVIERT:** 09. Maerz 2026  
> **Inhalt verteilt in:** `docs/specs/ARCHITECTURE.md`, `docs/MEMORY_ARCHITECTURE.md`, `docs/specs/API_CONTRACTS.md`  
> Dieses Dokument dient nur noch als Referenz fuer Ontologie-Herkunft und fruehere Detailfassung.

> **Stand:** 5. März 2026
> **Zweck:** Definiert die formale Ontologie (Klassen, Relationen, IDs) fuer den TradeView Knowledge Graph. Trennt Schema-Quellen von Domain-Semantik.
> **Referenz-Dokumente:** [`MEMORY_ARCHITECTURE.md`](./MEMORY_ARCHITECTURE.md) (Sek. 5.2, 6: Zwei-Schichten-KG, Node/Edge-Schema), [`docs/references/projects/knowledge-and-ml.md`](./references/projects/knowledge-and-ml.md) (GraphMERT / ML-Referenzen)
> **Primaer betroffen:** KG-Seed-Pipeline, Entity-Linking, Relation-Extraction, GraphMERT-Integration

---

## Inhaltsverzeichnis

1. [Ontologie-Quellen (primär)](#1-ontologie-quellen-primär)
2. [Domain-Semantik (sekundär)](#2-domain-semantik-sekundär)
3. [Competency Questions](#3-competency-questions)
4. [Canonical IDs](#4-canonical-ids)
5. [Relation Map (Auszug)](#5-relation-map-auszug)

---

## 1. Ontologie-Quellen (primär)

Formales Schema (Klassen, Relationen, Identifier) kommt aus diesen Quellen:

| Quelle | Typ | Verwendung |
|--------|-----|------------|
| **FIBO** | Finance-Ontologie | Klassen, Relationen fuer Company, Instrument, Exchange, Ownership |
| **Wikidata** | Allgemeine Entitäten | QIDs, Properties fuer Person, Country, Organization, allgemeine Fakten |
| **GLEIF LEI** | Firmen-IDs | Canonical IDs fuer Company-Nodes (Legal Entity Identifier) |
| **OpenFIGI** | Instrument-IDs | FIGI, ISIN fuer Symbol/Instrument-Mapping |
| **OpenSanctions** | Sanktionen, PEPs | Entity-IDs, Relationen fuer `sanctioned_by`, `exposed_to`, PEP-Listen |

**Go-Integration:** OpenSanctions-API, OpenFIGI, GLEIF-Lookups dienen als Datenquellen fuer Entity-Resolution. Die Schema-Definitionen und erlaubten Relationstypen bleiben in diesem Dokument.

**Links:**
- FIBO: [edmcouncil.org/fibo](https://www.edmcouncil.org/fibo)
- Wikidata: [wikidata.org](https://www.wikidata.org/)
- GLEIF: [gleif.org](https://www.gleif.org/)
- OpenFIGI: [openfigi.com](https://www.openfigi.com/)
- OpenSanctions: [opensanctions.org](https://www.opensanctions.org/)

---

## 2. Domain-Semantik (sekundär)

Diese Dokumente liefern **Begriffe und Bedeutung**, nicht das formale Schema. Sie definieren, was Strategeme, BTE-Marker, Paradigmen etc. bedeuten; die Ontologie-Struktur (Klassen, erlaubte Kanten) kommt aus Sek. 1.

| Dokument | Inhalt |
|----------|--------|
| [`GAME_THEORY.md`](./GAME_THEORY.md) | Strategeme, Krisenphasen, Event-Kategorien, Spieltheoretische Konzepte |
| [`POLITICAL_ECONOMY_KNOWLEDGE.md`](./POLITICAL_ECONOMY_KNOWLEDGE.md) | Oekonomische Paradigmen, Zentralbanken, Transmissionskanäle, Institutionen |
| [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) | BTE-Marker, DRS, Needs-Typen, Decision Styles, Influence Tactics |

**Quell-Buecher (fuer Seed-Extraktion):**
- `docs/books/new/Die 36 Srategeme-ProfRick.md` -- Strategeme, Krisenlogik
- `docs/books/new/The_Behavior_Ops_Manual_-_Chase_Hughes.md` -- BTE, DRS, Needs Map

---

## 3. Competency Questions

Fragen, die der KG zuverlaessig beantworten koennen muss. Daraus leiten sich erlaubte Relationstypen und Klassen ab:

- Welche Firmen sind indirekt von Sanktionen betroffen?
- Welche Strategeme passen zu Sanctions-Events?
- Welche BTE-Marker indizieren DRS > 7?
- Welche Regionen sind einem Geo_Event zugeordnet?
- Welche Commodities werden von einem Event beeinflusst?
- Welche Akteure sind an einem Event beteiligt?
- Welche Symbole sind einer Region/Commodity zugeordnet?
- Welche Paradigmen praegen eine Zentralbank?

---

## 4. Canonical IDs

| Entity-Typ | Primär | Fallback |
|------------|--------|----------|
| Company | LEI (GLEIF) | Wikidata QID, interner UUID |
| Instrument | FIGI/ISIN (OpenFIGI) | Interner UUID |
| Person | Wikidata QID | OpenSanctions ID (bei PEP/Sanktionen) |
| Country/Region | ISO 3166 + Wikidata QID | Interne Region-ID |
| Organization | Wikidata QID, OpenSanctions ID | Interner UUID |

**Constraint:** Jeder Node soll mindestens einen canonical ID haben, wo verfuegbar. Doppelte Nodes (z.B. mehrere "Apple"-Knoten) vermeiden durch Entity-Resolution vor dem KG-Insert.

---

## 5. Relation Map (Auszug)

Vollstaendiges Edge-Schema: [`MEMORY_ARCHITECTURE.md`](./MEMORY_ARCHITECTURE.md) Sek. 6.2.

Erweiterung um externe ID-Mappings:

| Edge | From | To | Properties | Quelle |
|------|------|-----|------------|--------|
| `company_lei` | Company | (LEI-String) | - | GLEIF |
| `instrument_figi` | Symbol | (FIGI-String) | - | OpenFIGI |
| `sanctioned_by` | Person/Company | Organization/Country | source, date | OpenSanctions |
| `exposed_to` | Position/Company | Region/Event | kanal, confidence | Abgeleitet |

---

## Querverweise

| Von | Nach |
|-----|------|
| MEMORY_ARCHITECTURE Sek. 6.3 | Dieses Dokument (Ontologie-Details) |
| CONTEXT_ENGINEERING | MEMORY_ARCHITECTURE (KG-Schema) |
| GraphMERT-Pipeline | Dieses Dokument (Seed-Ontologie, Relation Map) |
