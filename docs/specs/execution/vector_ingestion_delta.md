# Vector Ingestion Delta

> **Stand:** 12. Maerz 2026
> **Zweck:** Aktiver Arbeitsvertrag fuer Chunking, Embedding und Retrieval-
> faehige Ableitungen aus normalisierten Quellen- und Wissensartefakten.

---

## 0. Execution Contract

### Scope In

- Welche Artefakte ueberhaupt embeddet werden duerfen
- Chunking-, provenance- und freshness-Regeln fuer Vector-Dokumente
- Trennung Chroma-Prototyp vs. spaeterer Graph-/Memory-Zielpfad

### Scope Out

- Source Selection, Env-Onboarding und Rohsnapshot-Persistenz
- allgemeine KG-/Ontologie-Arbeit ohne Vector-Bezug
- Live-Provider-Rollout

### Mandatory Upstream Sources

- `docs/MEMORY_ARCHITECTURE.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/storage_layer.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/source_persistence_snapshot_delta.md`
- `docs/specs/execution/agent_memory_context_delta.md`

---

## 1. Leitregeln

1. **No raw-first embeddings:** keine Embeddings direkt aus ungeprueften
   Rohdownloads.
2. **Normalize before embed:** erst Parser/Normalizer, dann Chunking/Embedding.
3. **Provenance ist Pflicht:** jeder Vektor verweist auf Quelle, Snapshot,
   Parser-Version und Zeitstempel.
4. **Vector ist Downstream, nicht Truth:** Vektoren unterstuetzen Retrieval, sie
   ersetzen weder KG noch Episodic Store.
5. **Chroma ist Prototyp, nicht Zielzustand:** langfristiger Zielpfad bleibt
   graph-/memory-integriert.

---

## 2. Zulaessige Input-Klassen

Embeddable, wenn bewusst freigegeben:

- normalisierte Textreports
- bereinigte News-/Dossier-Texte
- parser-validierte PDF-/HTML-/XML-Extrakte
- claim-/evidence-nahe Textobjekte

Nicht direkt embeddable:

- rohe ZIP-/CSV-/XML-Batches ohne Parserstufe
- ungefilterte API-JSON-Dumps
- vertrauliche Secrets-/Credential-nahe Payloads
- stream raw event firehoses ohne Verdichtung

---

## 3. Mindest-Metadaten pro Vector-Dokument

- `vector_doc_id`
- `source_id`
- `snapshot_id` oder `origin_record_id`
- `chunk_id`
- `embedding_model`
- `parser_version`
- `created_at`
- `freshness_class`
- `retention_class`
- `provenance_path`
- `truth_state` (`truth`, `belief`, `scenario`)

---

## 4. Offene Deltas

- [ ] **VI1** embeddable Dokumentklassen verbindlich festlegen
- [ ] **VI2** Chunking-Regeln fuer Reports, News, Claims und Dossiers dokumentieren
- [ ] **VI3** Provenance- und freshness-Metadaten fuer Vector-Dokumente verbindlich machen
- [ ] **VI4** Chroma-Prototyp sauber als temporaren Adapter markieren
- [ ] **VI5** Zielpfad zu Memory/KG/Falkor-kompatibler Retrieval-Schicht dokumentieren
- [ ] **VI6** truth/belief/scenario Kennzeichnung in Vector-Ingestion verankern
- [ ] **VI7** Context-Assembler darf nur freigegebene Vector-Klassen anfragen

---

## 5. Verify-Gates

- [ ] **VI.V1** jeder Vector-Eintrag hat nachvollziehbare Herkunft
- [ ] **VI.V2** keine Embeddings aus unnormalisierten Raw-Snapshots
- [ ] **VI.V3** Chroma- oder anderer Prototype-Store ist klar als temporar markiert
- [ ] **VI.V4** Context- und Memory-Owner-Dokumente benutzen dieselbe
  provenance-/truth-state-Logik

---

## 6. Propagation Targets

- `docs/MEMORY_ARCHITECTURE.md`
- `docs/CONTEXT_ENGINEERING.md`
- `docs/specs/ARCHITECTURE.md`
- `docs/specs/SYSTEM_STATE.md`
- `docs/specs/EXECUTION_PLAN.md`
- `docs/specs/execution/agent_memory_context_delta.md`
- `docs/specs/execution/source_persistence_snapshot_delta.md`

---

## 7. Exit Criteria

- `VI1-VI7` sind entschieden oder mit Owner/Datum deferred
- Vector-Ingestion ist sauber von Source-Onboarding und Raw-Persistenz getrennt
- Prototype- und Zielpfad sind explizit dokumentiert
