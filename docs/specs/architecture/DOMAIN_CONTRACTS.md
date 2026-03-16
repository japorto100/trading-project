# DOMAIN CONTRACTS

> **Stand:** 16. Maerz 2026  
> **Zweck:** Kanonische Kernobjekte, Vertragsfelder, Retrieval-Prozesskontrakte
> und Simulations-Minimal-Stack. Diese Objekte sind systemweit verbindlich,
> damit Retrieval, Claim-Review, Agentik und Simulation dieselbe Sprache nutzen.
> **Source-of-Truth-Rolle:** Autoritativ fuer Domain-Objektmodelle und
> Prozessvertraege. Implementierungsdetails in den jeweiligen Service-Specs.

---

## 1. Kanonische Kernobjekte

### 1.1 CanonicalEntity

```
entity_id         string   — global eindeutige ID
entity_type       string   — Typ (country, actor, event, instrument, ...)
canonical_name    string   — kanonischer Anzeigeame
aliases[]         string[] — alternative Bezeichnungen / Ticker
provenance[]      ref[]    — Quellen, aus denen dieser Eintrag gespeist wird
status            string   — active | deprecated | merged
```

### 1.2 Claim

```
claim_id             string — global eindeutige ID
about_entity_ids[]   ref[]  — betroffene Entities
claim_type           string — factual | opinion | forecast | counterfactual
time_scope           range  — Zeitbereich des Claims
current_confidence   float  — [0.0, 1.0]
review_state         string — active | challenged | archived | invalidated
```

### 1.3 Evidence

```
evidence_id                      string — global eindeutige ID
source_id                        ref    — Quelldokument oder Provider
supports_or_contradicts_claim_id ref    — Zuordnung zu Claim
stance                           string — supports | contradicts | neutral
retrieval_path                   string — wie Evidence gefunden wurde
quality_score                    float  — [0.0, 1.0]
```

### 1.4 UserOverlayNode

```
overlay_id           string — global eindeutige ID
owner_user_id        ref    — Besitzer
references_entity_ids[] ref[] — verknuepfte Entities
overlay_type         string — annotation | thesis | watchlist | ...
visibility           string — private | shared | public
sync_scope           string — local | cloud | federated
```

### 1.5 ScenarioSnapshot

```
scenario_id          string — global eindeutige ID
parent_scenario_id   ref    — Eltern-Branch (null = Root)
world_state_version  string — Versionierungs-Tag des Weltzustands
belief_snapshot_id   ref    — zugrundeliegender Belief-Snapshot
kg_snapshot_id       ref    — zugrundeliegender KG-Snapshot
model_version        string — verwendetes Modell/Parameter-Set
time_horizon         range  — Simulationszeitraum
status               string — draft | running | completed | archived
```

### 1.6 SearchNode

```
search_node_id       string  — global eindeutige ID
scenario_id          ref     — oder analysis_run_id
parent_node_id       ref     — Elternknoten im Suchbaum
depth                int     — Suchtiefe
action_taken         string  — ausgefuehrte Aktion
score                float   — Bewertung des Knotens
uncertainty          float   — Konfidenz-/Unsicherheitsschaetzung
tool_trace_ids[]     ref[]   — Verweise auf ausgefuehrte Tool Calls
```

### 1.7 PromotionRecord

```
promotion_id         string — global eindeutige ID
object_type          string — Claim | Evidence | Candidate | ...
object_id            ref    — ID des promovierten Objekts
from_state           string — Ausgangsstatus
to_state             string — Zielstatus
policy_basis         string — welche Policy/Regel die Promotion erlaubt
reviewer_or_agent_id ref    — menschlicher Reviewer oder Agent
timestamp            time   — Zeitpunkt der Promotion
```

---

## 2. Retrieval-Prozesskontrakt

Retrieval ist kein einzelner Lookup, sondern ein mehrstufiger Ablauf:

1. **intent bestimmen** — welche Klasse von Information wird gesucht?
2. **domain scope setzen** — Zeitraum, Geographie, Asset-Klasse, Akteure
3. **retrieval family waehlen** — factual / discovery / contradiction / timeline / ...
4. **candidate sources holen** — KG, vector store, API, web
5. **normalize / dedup / cluster** — Rohergebnisse bereinigen
6. **evidence quality / provenance bewerten** — confidence_score, source_tier
7. **an verifier / simulation / agent weitergeben** — kein Blind-Trust

### 2.1 Retrieval-Intents (Mindestset)

| Intent | Beschreibung |
|:-------|:-------------|
| `factual_lookup` | Direkter Faktenabruf zu einer Entity oder einem Claim |
| `source_discovery` | Neue Quellen zu einem Thema aufdecken |
| `contradiction_hunt` | Widersprueche zu bestehenden Claims finden |
| `timeline_reconstruction` | Ereignisfolge fuer eine Entity oder Region aufbauen |
| `analogous_case_retrieval` | Historische Parallelfaelle identifizieren |
| `scenario_prior_building` | Kontextdaten fuer einen Simulationszweig sammeln |
| `monitoring_watch_mode` | Laufende Ueberwachung auf Aenderungen eines Themas |

### 2.2 Retrieval-Regeln (verbindlich)

- Kein direktes Retrieval aus unnormalisierten Raw-Downloads.
- Embeddings und Vector-Lookup setzen normalisierte, provenance-markierte Inputs voraus.
- Source-Confidence wird explizit mitgefuehrt (nicht implizit aus Quelle erraten).
- Open-Web-Ergebnisse sind Discovery- und Gap-Fill-Layer, keine automatische Canonical-Truth-Quelle.

---

## 3. Simulations-Minimal-Stack

Fruehe produktive Simulation folgt mindestens:

1. `belief_snapshot` laden
2. Relevante Akteure/Regionen/Assets bestimmen
3. Objectives/Constraints initialisieren
4. Action set erzeugen
5. Transition model anwenden
6. Outcomes scoren
7. Branch results auf map/timeline/tree projizieren

**Arbeitsregel:** Zuerst stabile `state / action / reward` Contracts und
`best-first / beam search` implementieren. MCTS erst bei nachgewiesenem Mehrwert.

### 3.1 Simulations-Kontrakte

- Branch als `s:*`-Artefakt modellieren.
- Canonical fact mutation durch Simulation explizit verbieten.
- `extract-claims` aus Simulation schreibt in Claim/Evidence-Layer,
  nicht direkt in Canonical KG.
- Jeder Simulations-Branch ist isoliert; kein gegenseitiges Ueberschreiben.

---

## 4. Epistemische Schichten (verbindlich)

Diese Trennung ist fuer den Gesamtzustand bindend, auch wenn sie noch nicht
ueberall vollstaendig implementiert ist:

| Schicht | Bedeutung | Anwendung |
|:--------|:----------|:----------|
| `truth` | kanonische oder stark verifizierte Fakten | Canonical KG, verifizierte Claims |
| `belief` | plausibler, aber unsicherer Arbeitsstand | aktive Claims, working memory |
| `scenario` | hypothetische Simulations- und Planungszweige | ScenarioSnapshots, Forecasts |

**Regel:** Kein Layer soll diese Zustaende stillschweigend vermischen.
Memory, Agentik, Claim-Verifikation, GeoMap und Simulation muessen die Trennung sichtbar halten.

---

## 5. Querverweise

- `docs/specs/architecture/ARCHITECTURE_BASELINE.md`
- `docs/specs/architecture/AGENT_RUNTIME_ARCHITECTURE.md`
- `docs/specs/architecture/MEMORY_AND_STORAGE_BOUNDARIES.md`
- `docs/specs/data/DATA_ARCHITECTURE.md`
- `docs/specs/API_CONTRACTS.md`
