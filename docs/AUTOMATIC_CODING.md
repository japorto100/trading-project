# AUTOMATIC CODING (v1)

## Ziel

Eine robuste Pipeline bauen, die reinen User-Intent (Natural Language, auch von Nicht-Entwicklern) in isolierte, reviewbare Code-Artefakte umwandelt, ohne die Hauptcodebasis zu destabilisieren.

Kernidee:

- Intent zuerst, Code danach.
- Isolierter Code bleibt isoliert, bis ein Mensch freigibt.
- Duplikate werden uber Intent-Erkennung verhindert (nicht uber blindes Blocken).
- Graph + Index werden aktiv genutzt, um Kontext, Blast Radius und Wiederverwendung zu steuern.

## Abgleich mit dem Originalziel aus `Automatic_coding.txt`

Diese Spezifikation deckt deine Kernziele explizit ab:

- Reiner Text-Intent als Startpunkt fur Feature-Pipelines.
- Agent nutzt bestehende Codebasis mit Index + Code-Graph (GitNexus-orientiert).
- Neue Losungen entstehen zuerst isoliert, mit Erklarung von Intent, betroffenen Dateien und Zweck.
- Entwickler entscheidet final uber Einbau (`approve/reject/request_changes`).
- Duplikatvermeidung uber hoch gewichteten `Pending_Intent` statt uber ungepruften Pending-Code.
- Optionaler Paperwatcher als SOTA-Verstarker, aber nur bei hoher Neuheit/Komplexitat.
- Notwendige Erweiterungen an GitNexus (z. B. `Pending_Intent`-Knoten, Linktypen und Statuspflege) sind als Teil der v1-Roadmap eingeplant.

## Nicht-Ziele (v1)

- Kein vollautonomes Mergen in `main`.
- Kein Always-on Research-Schritt fur jede triviale Aufgabe.
- Kein Vertrauen auf ungepruften Pending-Code als Architekturgrundlage.

## Prinzipien

1. **IntentGraph getrennt vom CodeGraph**
   - Intent darf routing- und dedupe-relevant sein.
   - Pending-Code darf keine neuen harten Downstream-Abhangigkeiten erzwingen.

2. **State Machine statt ad-hoc Entscheidungen**
   - Jeder Request lauft durch klar definierte Status.

3. **Deterministische Gates zwischen Agent-Schritten**
   - Build, Tests, Lint, Policy Checks vor Review.

4. **Human-in-the-loop als Sicherheitsgrenze**
   - Nur freigegebene Ergebnisse werden architekturwirksam.

5. **Kosteneffizienz uber Routing**
   - Paperwatcher nur bei hoher Neuheit/Unsicherheit.

6. **Intent-Gedachtnis statt Chat-Rohdaten**
   - Rohdialoge werden nicht ungefiltert als Kontext genutzt.
   - Gespeichert wird eine strukturierte, kurze `intent_summary` mit Nachvollziehbarkeit.

## Statusmodell

`pending -> in_progress -> review_ready -> approved -> merged`

Abzweige:

- `review_ready -> rejected`
- `pending|in_progress|review_ready -> superseded` (durch neueren, besseren Intent)
- `pending -> duplicate_of(<intent_id>)`

## Pipeline (End-to-End)

## 0) Intake

Input:

- User Prompt
- Optional: Chat-Kontext
- Optional: Scope-Hinweise (Module, betroffene Features)

Output:

- `IntentRecord` mit eindeutiger `intent_id`

## 1) Intent-Normalisierung

Der freie Text wird in eine strukturierte Form uberfuhrt:

- Problem
- Zielverhalten
- Constraints
- Akzeptanzkriterien
- Risiko-/Impact-Klasse

Zusatzlich:

- `intent_embedding`
- `intent_keywords`

## 2) Dedupe & Similarity-Gate

Vor jeder Generierung:

- Vergleich gegen `pending`, `review_ready`, `approved`, `merged`.
- Zweistufiger Score:
  - semantische Intent-Ahnlichkeit
  - betroffener Subgraph/File-Overlap

Entscheidung:

- **hoch ahnlich + gleiches Ziel** -> `duplicate_of`
- **ahnlich aber erweiternd** -> `supersedes` oder `linked_to`
- **neu** -> weiter

Wichtig: Nur Intent-Metadaten steuern hier. Nicht freigegebener Code bleibt unsichtbar als harte Abhangigkeit.

## 3) Kontextaufbau uber GitNexus

Fur den neuen Intent:

- `query()` fur semantische Kandidaten
- `context(name)` fur 360-Grad Symbolsicht
- `impact(target, direction)` fur Blast-Radius-Prufung
- optional `cypher(query)` fur strukturelle Beziehungen (Caller/Callees, Communities)

Ergebnis:

- begrenztes, priorisiertes Context-Paket
- Liste relevanter Dateien/Symbole

## 4) Research-Router (Paperwatcher optional)

Kein Always-on.

Aktivierung nur wenn z. B.:

- hohe algorithmische Neuheit
- unscharfe Spezifikation
- hoher Sicherheits-/Performance-Impact

Bei Aktivierung:

- kurze Evidence-Zusammenfassung
- konkrete Implementationsimplikationen
- harte Begrenzung von Token/Budget
- Quellenlinks und Relevanzscore pro Quelle

## 5) Isolierte Generierung

Der Agent arbeitet in Isolation:

- separater Branch/Worktree/Sandbox
- keine direkten Anderungen in Hauptbranch

Artefakte:

- Code-Diff
- `WHY`-Dokumentation:
  - User Intent
  - relevante Bestandsdateien
  - gelostes Problem
  - offene Risiken

## 6) Iterative Verifikationsschleife

Loop:

1. Build/Typecheck/Lint
2. Tests (mindestens betroffene Bereiche)
3. Policy/Security Checks
4. Auto-Repair bei Fehlerschlagen
5. optional: zweite Gegenprufung durch Verifier-Agent

Abbruchbedingungen:

- Erfolg aller Pflichtgates -> `review_ready`
- Budget erschopft/instabil -> `blocked` + Diagnostik

## 7) Review-Gate (Mensch)

Der Entwickler sieht:

- kompakte Intent-Zusammenfassung
- Diff + Testnachweise
- Impact-Prognose
- Duplikat-/Overlap-Bewertung

Entscheidung:

- **approve**
- **reject** (mit Grundcode)
- **request_changes**

## 8) Merge & Wissensaktualisierung

Nach `approved`:

- Merge in Hauptcodebasis nach Standardregeln
- Re-Indexing
- CodeGraph-Update
- IntentStatus auf `merged`
- Verknupfung `intent -> commit/pr/files`

## Datenmodell (minimal)

## `IntentRecord`

- `intent_id`
- `raw_text`
- `intent_summary`
- `normalized_intent`
- `status`
- `created_by`
- `created_at`
- `embedding`
- `related_intents[]`
- `related_symbols[]`
- `related_files[]`
- `decision_log[]`
- `source_evidence[]` (nur wenn Research-Router aktiv)

## `IsolatedArtifact`

- `artifact_id`
- `intent_id`
- `branch_or_workspace`
- `diff_summary`
- `verification_report`
- `risk_report`
- `review_notes`

## Entscheidungsheuristik (v1)

`priority_score = (business_value * 0.35) + (intent_novelty * 0.25) + (impact_confidence * 0.20) - (risk_penalty * 0.20)`

`dedupe_score = (semantic_similarity * 0.60) + (subgraph_overlap * 0.40)`

`research_trigger_score = (novelty * 0.40) + (risk * 0.35) + (spec_ambiguity * 0.25)`

Empfohlene Schwellen (Startwerte):

- `dedupe_score >= 0.85` -> candidate duplicate
- `0.70-0.85` -> manual tie-break / link-vorschlag
- `< 0.70` -> neu
- `research_trigger_score >= 0.70` -> Paperwatcher aktivieren
- `research_trigger_score < 0.70` -> ohne Research weiter

## Anti-Patterns (explizit vermeiden)

- Pending-Code als harte Abhangigkeit fur neue Features verwenden.
- Immer erst Research fahren, auch bei trivialen Aufgaben.
- Vollstandige Chatlogs unstrukturiert in den Kontext kippen.
- One-shot Codegen ohne Verifikationsloop.

## MVP-Umsetzung in 3 Schritten

## Phase 1: Control Plane

- `IntentRecord` + Statusmaschine
- Dedupe gegen offene Intents
- einfacher Review-Desk

## Phase 2: Isolated Build Loop

- isolierter Runner
- deterministische Gates (lint/test/build)
- Auto-Repair-Runden mit Limits

## Phase 3: Graph-Integration

- GitNexus-gestutzte Kontextauswahl
- Impact-Checks vor Merge
- Linking `intent <-> code graph`

## Akzeptanzkriterien (v1)

- Keine ungepruften Artefakte beeinflussen Merge-Entscheidungen anderer Tasks als harte Abhangigkeit.
- Doppelte Feature-Anfragen werden in >=80% der Falle als `duplicate` oder `linked` markiert.
- Jede `review_ready` Anderung hat reproduzierbaren Verification-Report.
- Jede `merged` Anderung ist mit `intent_id` und Kontextbegrundung nachvollziehbar.
- Optionale Research-Schritte sind reproduzierbar (Quelle + Relevanz + ubernommene Designentscheidung).

## Forschungsgestutzte Verfeinerungen (aus den Papern)

1. **Graph-gestutzte Retrieval-Strategie**
   - Nicht nur semantisches RAG, sondern Requirement/Code-Struktur gemeinsam nutzen.
   - Begrundung: repo-level Aufgaben leiden ohne Struktur stark.

2. **Getrennte Rollen fur Lokalisierung und Losung**
   - `localizer` findet relevante Stellen, `resolver` erzeugt und repariert Patches.
   - Reduziert Kontextmuell und verbessert Trefferquote.

3. **Verifier-Loop vor menschlicher Review**
   - Ein expliziter Verifier fur Build/Test/Behavior-Checks vor `review_ready`.
   - Verringert false-positive PRs und spart Reviewzeit.

4. **Leakage-bewusste Evaluation**
   - Keine Metriken verwenden, die durch "future context leakage" geschont sind.
   - Interne Evaluation auf reproduzierbaren, verifizierbaren Tasks basieren.

5. **SLM-Delegation fur Reparaturrunden**
   - Schnelle kleinere Modelle konnen in engen Repair-Loops kosteneffizient sein.
   - Nur mit harten Verifikationsgates einsetzen.

## Rollenmodell (empfohlen fur v1.1)

- `intent_router`: normalisiert Intent, triggert Dedupe/Research.
- `context_builder`: GitNexus-Abfragen, Kontextpaket, Blast-Radius.
- `planner`: Patch-Plan + Akzeptanzkriterien.
- `builder`: isolierte Implementierung.
- `verifier`: deterministische + optional agentische Prufung.
- `review_assistant`: kompakte Review-Unterlagen fur den Entwickler.

## Messgroessen (KPI-Set)

- `dedupe_precision`: Anteil korrekter `duplicate_of` Entscheidungen.
- `review_reject_rate`: Anteil `review_ready` Artefakte, die abgelehnt werden.
- `time_to_review_ready`: Median-Zeit von `pending` zu `review_ready`.
- `post_merge_regression_rate`: Regressionen pro gemergtem Intent.
- `research_roi`: Nutzen von Research-Runs relativ zu Kosten/Latenz.

## Anforderungen aus `Automatic_coding.txt` (Traceability-Matrix)

Diese Matrix prueft explizit, ob die in der Ursprungsidee genannten Anforderungen uebernommen wurden.

1) **User-Intent als reiner Text fuer Fullstack-Features**
- Quelle: `Automatic_coding.txt` (Beschreibung der Zielpipeline).
- Abdeckung: **Ja**
- Umsetzung: Intake + Intent-Normalisierung + strukturierter `IntentRecord`.

2) **Agent nutzt Codebasis mit Index + Code-Graph (GitNexus-Idee)**
- Quelle: `Automatic_coding.txt` (GitNexus als Grundlage).
- Abdeckung: **Ja**
- Umsetzung: dedizierter GitNexus-Kontextschritt mit `query/context/impact/cypher`.

3) **Neue Loesung zuerst isoliert erzeugen**
- Quelle: `Automatic_coding.txt` (isolierte Erstellung vor Einbau).
- Abdeckung: **Ja**
- Umsetzung: isolierter Branch/Worktree/Sandbox, keine direkte Hauptbranch-Aenderung.

4) **WHY/Intent/Prompt/Chat-Bezug dokumentieren**
- Quelle: `Automatic_coding.txt` (Zweck, Kontext, Problem, Bewertung festhalten).
- Abdeckung: **Ja (mit Guardrail)**
- Umsetzung: `WHY`-Dokumentation + `intent_summary`; Rohchat nur optional und komprimiert, nicht unstrukturiert.

5) **Verhinderung von Ueberschneidungen/Duplikaten bei neuen Intents**
- Quelle: `Automatic_coding.txt` (Duplikatpraevention als Kernnutzen).
- Abdeckung: **Ja**
- Umsetzung: Dedupe-Scoring + Status `duplicate_of/superseded/linked_to`.

6) **Menschliche Freigabe vor Integration**
- Quelle: `Automatic_coding.txt` (du als Entwickler gibst frei).
- Abdeckung: **Ja**
- Umsetzung: Review-Gate mit `approve/reject/request_changes`.

7) **Hochgewichtung isolierter Ergebnisse fuer Folgeanfragen**
- Quelle: `Automatic_coding.txt` (urspruengliche Ueberlegung zur Hochgewichtung).
- Abdeckung: **Ja, aber sicherheitskorrigiert**
- Umsetzung: Hochgewichtung auf **`Pending_Intent`**, nicht auf ungeprueften Pending-Code.

8) **Paperwatcher als SOTA-Input vor Generierung**
- Quelle: `Automatic_coding.txt` (arXiv/Paperwatcher integrieren).
- Abdeckung: **Ja, bedingt**
- Umsetzung: Research-Router mit Trigger-Score; kein Always-on.

9) **Iterative Schleifen als Standardmuster**
- Quelle: `Automatic_coding.txt` (iterative Loops, self-correction, kleine Modelle).
- Abdeckung: **Ja**
- Umsetzung: Verifikations- und Repair-Loop, optionaler Verifier-Agent.

10) **Kritisches Hinterfragen statt blindes "Ja"**
- Quelle: `Automatic_coding.txt` (expliziter Wunsch nach kritischer Pruefung).
- Abdeckung: **Ja**
- Umsetzung: Anti-Patterns, Failure-Modes, Guardrails und harte Merge-Gates.

Status: **Alle Kernziele uebernommen**. Die einzige bewusste Korrektur ist die Trennung zwischen `Pending_Intent` (sichtbar) und ungeprueftem Pending-Code (isoliert).

## Detaillierte Architektur (v1.1)

## Komponenten

1. **Intent API**
- nimmt User-Intent entgegen
- erzeugt `IntentRecord`
- startet Orchestrierung

2. **Intent Normalizer**
- extrahiert Problem, Ziel, Constraints, Akzeptanzkriterien
- erzeugt `intent_summary`, Keywords und Embedding

3. **Dedupe Engine**
- berechnet `dedupe_score`
- klassifiziert als `new`, `duplicate_of`, `linked_to`, `superseded`

4. **Context Builder (GitNexus-backed)**
- erstellt Kontextpaket aus relevanten Symbolen/Dateien/Flows
- fuehrt Impact-Vorpruefung aus

5. **Research Router**
- entscheidet, ob Paperwatcher aktiviert wird
- liefert evidenzbasierte Empfehlungen mit Relevanzscore

6. **Isolated Builder**
- fuehrt Patch-Plan in Isolation aus
- erzeugt Diff + WHY-Artefakte

7. **Verifier Pipeline**
- Build/Lint/Test/Policy/Security
- optionaler zweiter Agent-Check

8. **Review Desk**
- praesentiert Review-Bundle fuer Entwickler
- verwaltet Entscheidungen und Begruendung

9. **Merge Integrator**
- aktualisiert Index/Graph nach Approval
- verknuepft Intent mit Commit/PR/Dateien

## Laufzeitfluss (Sequenz)

1. `POST /intent` -> `pending`
2. Normalisierung + Embedding
3. Dedupe gegen offene/vergangene Intents
4. GitNexus-Kontextaufbau + Impact-Scan
5. optional Research-Router
6. Isolierte Implementierung (`in_progress`)
7. Verifier-Loop bis `review_ready` oder `blocked`
8. Human Review -> `approved/rejected/request_changes`
9. Bei `approved`: Merge + Reindex + Graph-Update (`merged`)

## API-/Datenvertraege (Beispiel)

`IntentRecord` (erweitert):

```json
{
  "intent_id": "int_20260316_001",
  "status": "pending",
  "raw_text": "...",
  "intent_summary": "...",
  "normalized_intent": {
    "problem": "...",
    "target_behavior": "...",
    "constraints": ["..."],
    "acceptance_criteria": ["..."]
  },
  "scores": {
    "priority_score": 0.74,
    "dedupe_score": 0.81,
    "research_trigger_score": 0.62
  },
  "links": {
    "related_intents": ["int_20260312_007"],
    "related_symbols": ["pkg.module.fn"],
    "related_files": ["src/..."]
  }
}
```

`ReviewBundle`:

```json
{
  "intent_id": "int_20260316_001",
  "artifact_id": "iso_20260316_001",
  "why_summary": "...",
  "diff_summary": "...",
  "verification_report": {
    "build": "pass",
    "lint": "pass",
    "tests": {"pass": 112, "fail": 0},
    "security": "pass"
  },
  "risk_report": {
    "impact_class": "medium",
    "blast_radius": ["serviceA", "moduleB"]
  }
}
```

## State-Machine-Regeln (formal)

Erlaubte Transitionen:

- `pending -> in_progress`
- `pending -> duplicate_of`
- `pending -> superseded`
- `in_progress -> review_ready`
- `in_progress -> blocked`
- `review_ready -> approved`
- `review_ready -> rejected`
- `review_ready -> request_changes`
- `request_changes -> in_progress`
- `approved -> merged`

Nicht erlaubt:

- `pending -> merged`
- `in_progress -> merged`
- `review_ready -> merged` (ohne `approved`)

## Dedupe-Entscheidungslogik (praezise)

Input:

- `semantic_similarity` (0..1)
- `subgraph_overlap` (0..1)
- `status_weight` (offene Intents hoeher gewichten als historische)

Formel:

- `dedupe_score = 0.60 * semantic_similarity + 0.40 * subgraph_overlap`
- `effective_score = dedupe_score * status_weight`

Status-Gewichte (Startwerte):

- `pending/review_ready`: `1.15`
- `approved/merged`: `1.00`
- `rejected`: `0.60`

Entscheidungen:

- `effective_score >= 0.90` -> `duplicate_of`
- `0.78 <= effective_score < 0.90` -> `linked_to` + manueller Tie-Break
- `< 0.78` -> `new`

## Research-Router (praezise)

Input-Features:

- `novelty` (neuartiger Algorithmus/Domain)
- `risk` (security/performance/compliance)
- `spec_ambiguity` (unschaerfe in Anforderungen)
- `history_gap` (fehlende aehnliche historische Loesungen)

Formel:

- `research_trigger_score = 0.35*novelty + 0.30*risk + 0.20*spec_ambiguity + 0.15*history_gap`

Policy:

- `>= 0.70`: Research aktivieren
- `0.50-0.69`: nur 1 kurzer Research-Pass
- `< 0.50`: kein externer Research

Research-Budget (Startwerte):

- max 6 Quellen
- max 2 Iterationen
- max 15 Minuten
- harte Zusammenfassung in 10 Bullet Points

## Failure-Modes und Gegenmassnahmen

1. **Cascade from unapproved code**
- Risiko: Folgearbeit baut auf spaeter verworfenem Code auf.
- Mitigation: Pending-Code bleibt als Dependency unsichtbar; nur Pending-Intent dedupe-wirksam.

2. **Context bloat**
- Risiko: zu viele irrelevante Quellen/Dateien im Prompt.
- Mitigation: top-k Kontextpaket + harte Tokenlimits + Ranking.

3. **False duplicate**
- Risiko: berechtigte neue Funktion wird blockiert.
- Mitigation: `linked_to`-Zwischenstatus + menschlicher Tie-Break.

4. **Research overfitting**
- Risiko: triviale Aufgaben werden unnnoetig teuer/langsam.
- Mitigation: Trigger-Score + Budgetgrenzen.

5. **Verifier blind spots**
- Risiko: Tests gruen, Verhalten trotzdem falsch.
- Mitigation: optionale behavior checks, snapshots, targeted regression suite.

## Security und Governance

- Kein automatisches Merge in geschuetzte Branches.
- Pflicht-Protokoll fuer jede Entscheidung im `decision_log`.
- Secrets nie in Intent/WHY/Logs persistieren.
- Auditierbarkeit: `intent_id` muss in PR/Commit-Metadaten referenziert sein.

## Operational Policies (SRE)

Diese Regeln gelten fuer Orchestrierung, Worker und Integrationen:

- **Idempotency-Key**: jeder Intent-Run fuehrt `idempotency_key = intent_id + revision`.
- **Retry-Policy**: nur fuer transient errors (z. B. Netzwerk, 5xx, timeout), nicht fuer 4xx-Validierungsfehler.
- **Backoff**: exponentiell mit jitter, begrenzte Max-Retries.
- **Single Retry Layer**: Retries nur auf einer Schicht (Orchestrator), um Retry-Stuerme zu vermeiden.
- **Timeout Budget**: globales Deadline-Budget pro Run (z. B. 20 min), Substeps erhalten Restbudget.
- **Fail-fast**: wenn Restbudget unterschritten wird, Run auf `blocked` mit Grund.

Startwerte:

- `max_retries_per_step = 3`
- `backoff_base_ms = 200`
- `backoff_max_ms = 5000`
- `global_deadline_minutes = 20`
- `max_parallel_intents = 5` (pro Workspace/Team anpassbar)

## Environment Parity and Dependency Policy

Ziel: isolierte Runs sollen reproduzierbar sein und sich moeglichst wie die echte Fullstack-App verhalten.

Grundregeln:

- Basisumgebung pro Repo ist **lockfile/toolchain-parity first** (nicht ad-hoc).
- On-the-fly Installationen sind erlaubt, aber nur in einem ephemeren Layer und mit Review-Hinweis.
- Neue oder geaenderte Dependencies sind merge-relevant und brauchen explizite Freigabe.
- Dependency-Aenderungen muessen im `ReviewBundle` sichtbar sein (Version, Grund, Risiko).

Sprachspezifische Policy:

1. **Go**
- Primar `go.mod`/`go.sum` aus dem Ziel-Repo verwenden.
- `go env`/Go-Version an Projektstandard binden.
- `go get` waehrend Run nur im Ephemeral-Layer; Ergebnis muss als geplanter Diff markiert werden.

2. **Python**
- Primar aus `pyproject.toml` + lock (`poetry.lock`/`requirements*.txt`) installieren.
- venv je Run isolieren.
- ungeplante `pip install` nur ephemer und als Risiko im Report kennzeichnen.

3. **Rust**
- Primar `Cargo.lock` respektieren.
- Toolchain ueber `rust-toolchain` (falls vorhanden) fixieren.
- neue Crates/Features nur mit expliziter Review-Freigabe.

Paritaetsstufen:

- `L0 exact`: gleiche Runtime + gleiche Lockfiles (bevorzugt)
- `L1 compatible`: gleiche Major/Minor, minimale Abweichungen erlaubt
- `L2 exploratory`: bewusst abweichend fuer Prototyping, nie direkt mergebereit

## Artifact Preview and Iteration Workflow

Ziel: vom User-Intent erzeugte Artefakte (insb. Frontend/UI) kontrolliert iterierbar machen, ohne direkten Einfluss auf die Hauptcodebasis.

Workflow:

1. Isolated Builder erstellt Artefakt + Diff + WHY.
2. Preview-Instanz rendert das Artefakt (UI-Preview/Screenshots/Story-like output).
3. Entwickler gibt Iterationsfeedback (`request_changes`) direkt im Review-Desk.
4. Builder erzeugt neue Revision im selben `intent_id`-Kontext.
5. Erst bei `approved` geht es in Merge-Pipeline.

Sandbox-Modell (explizit getrennt):

- **Sandbox A: Build/Test Sandbox**
  - fuer Build, Lint, Tests, Security Checks, Tooling
- **Sandbox B: Artifact Preview Sandbox**
  - fuer visuelle/funktionale Vorschau
  - striktere Rechte, keine privilegierten Side-Effects

Hinweis zu Tambo:

- Preview/Chat-nahe Iteration kann perspektivisch ueber einen Tambo-Teil laufen.
- Bis zur eigenen Tambo-Spezifikation gilt: Tambo als geplanter Bestandteil markieren, aber hier nur Integrationspunkt definieren.

Persistente Ablage von isoliertem Code:

- Sandboxes sind temporaer; Artefakte muessen persistent gespeichert werden.
- Empfohlenes Schema:
  - `intent_id`
  - `artifact_revision`
  - patch/diff bundle
  - WHY + verification reports
  - preview assets (screenshots, optional recordings)
- Self-hosted (empfohlen fuer v1):
  - Root: `tradeview-fusion/.automatic-coding/artifacts/`
  - Pfadstruktur: `.automatic-coding/artifacts/<tenant>/<intent_id>/rev-<n>/`
  - Pflichtdateien pro Revision:
    - `patch.diff`
    - `why.md`
    - `verification_report.json`
    - `risk_report.json`
    - `meta.json`
    - optional: `preview/` (screenshots, recordings, UI snapshots)
  - `meta.json` Mindestfelder:
    - `creator_user_id`
    - `creator_display_name` (optional)
    - `tenant_id`
    - `intent_id`
    - `artifact_revision`
    - `dedupe_scope` (`workspace|tenant|global`)
    - `base_commit`
    - `sandbox_build_id`
    - `sandbox_preview_id`
    - `status`
    - `created_at` / `updated_at`
  - Hinweis:
    - Dedupe darf nie nur auf Creator-Ebene laufen; Standard ist `dedupe_scope = tenant`.
    - Ownership/Traceability ueber `creator_user_id`, nicht ueber instabile Klartext-Usernamen.

- Cloud-hosted (empfohlene Zielarchitektur):
  - Artefakte in Object Storage (z. B. S3/GCS/Azure Blob), Metadaten separat in DB.
  - Key-Schema:
    - `automatic-coding/artifacts/<tenant>/<intent_id>/rev-<n>/<file>`
  - Metadatenstore:
    - Tabelle `isolated_artifacts` mit Foreign Key auf `intents`.
  - Sicherheitsanforderungen:
    - server-side encryption
    - short-lived signed URLs fuer Preview-Assets
    - tenant- und user-scope access control
  - Betrieb:
    - lifecycle rules fuer TTL (`rejected/superseded` kuerzer)
    - immutable revision folders (`rev-n` wird nicht ueberschrieben)

- VCS-Policy:
  - `.automatic-coding/artifacts/` standardmaessig nicht im Hauptrepo versionieren.
  - nur reduzierte Metadaten/Referenzen (nicht schwere Preview-Assets) in PR/Commit aufnehmen.

- Dedupe-Policy (hybrid):
  - Primarschluessel fuer Aggregation: `tenant_id + intent_id`
  - Owner-Kontext: `creator_user_id` nur fuer Audit/Ownership
  - Default-Scoping:
    - `workspace` nur fuer lokale Experimente
    - `tenant` als produktiver Standard
    - `global` nur bei bewusstem Cross-Tenant-Wissensaustausch
- Retention:
  - `approved/merged`: langfristig nachvollziehbar
  - `rejected/superseded`: kuerzere TTL gemaess Data-Retention-Policy

## Open Risks and Mitigations (v1.1)

1. **Dependency drift trotz Isolation**
- Risiko: Sandbox nutzt ungewollt andere Versionen als Produktivumgebung.
- Mitigation: Paritaetsstufen L0/L1 erzwingen, Drift im Report blockierend markieren.

2. **Preview != Realitaet**
- Risiko: UI-Preview in Sandbox weicht von echter Laufumgebung ab.
- Mitigation: minimale Production-like Preview-Konfiguration + visuelle Regressionstests.

3. **Artifact accumulation**
- Risiko: viele Revisionen ohne klare Aufraeumregeln.
- Mitigation: Retention/TTL + archivierte Metadaten + quotas pro Intent.

4. **Cross-sandbox leakage**
- Risiko: Daten/Secrets wechseln unkontrolliert zwischen Build- und Preview-Sandbox.
- Mitigation: getrennte Credentials, no-secret policy in preview assets, signed artifact handoff.

5. **Human review overload**
- Risiko: zu viele `review_ready` Artefakte bei parallelen Intents.
- Mitigation: Priorisierung ueber `priority_score`, WIP-Limits, Auto-Batching fuer low-risk.

6. **False confidence from benchmarks**
- Risiko: Metriken wirken gut, reale Qualitaet bleibt schwach.
- Mitigation: benchmark + produktionsnahe eval kombinieren; contamination-awareness bei SWE-Bench-Familie.

## Data Retention und Privacy

- `pending/review_ready`: 30 Tage Aufbewahrung, danach Archiv oder Loeschung.
- `rejected/superseded`: 14 Tage, nur Metadaten fuer Dedupe behalten.
- `merged`: dauerhaftes Metadata-Linking (`intent_id <-> commit/pr/files`).
- `raw_text` und optionale Chatkontexte werden PII-gefiltert gespeichert.
- Vollstaendige Rohdialoge nur opt-in und nur wenn notwendig fuer Audit.

## Prompt-Injection und Source-Trust Policy

Gilt fuer User-Input, externe Doku, Tickets, Commits, und Research-Quellen:

1. Externe Inhalte werden als **untrusted data** behandelt, nie als Instruktion.
2. Tool-Aufrufe unterliegen Allowlist + Parameter-Validierung.
3. Ausgaben laufen durch Leak-/Policy-Checks vor Review.
4. High-risk Requests (secrets, destructive actions, privilege changes) erfordern Human Approval.
5. Research-Quellen erhalten Trust-Tags (`official`, `peer_reviewed`, `community`, `unknown`).

Minimaler Trust-Score fuer Design-Entscheidungen:

- `peer_reviewed` oder `official` bevorzugt
- `community` nur als sekundare Evidenz
- `unknown` nur mit explizitem Warnhinweis

## Threshold Calibration Plan

Schwellen (`dedupe_score`, `research_trigger_score`) werden nicht statisch gelassen.

Vorgehen:

1. 100-200 historische/nahe reale Intents im Shadow-Mode bewerten.
2. False-duplicate und missed-duplicate manuell labeln.
3. Schwellen in kleinen Schritten anpassen.
4. Woechentliche Kalibrierung fuer die ersten 6 Wochen.
5. Danach monatlich oder bei klarer Drift.

Zielwerte:

- `false_duplicate_rate < 5%`
- `missed_duplicate_rate < 15%`
- stabile `review_reject_rate` ohne starke Anstiege

## Shadow Rollout (empfohlen)

Phase 0 (2-4 Wochen):

- Pipeline laeuft vollstaendig, aber ohne mergewirksame Automatik.
- Entscheidungen werden nur simuliert und gegen reale Dev-Entscheide verglichen.

Phase 1:

- Review-Desk produktiv, Merge weiter manuell.
- KPI-Monitoring + woechentliche Incident-Retros.

Phase 2:

- Selektive Aktivierung fuer low-risk Intent-Klassen.
- High-risk Klassen bleiben streng human-gated.

## Runbooks (Mindestset)

1. **Runbook: `blocked`**
- Ursache klassifizieren (infra/test/policy/context).
- 1x controlled re-run mit erhoehter Diagnostik.
- Danach Eskalation oder `request_changes`.

2. **Runbook: False Duplicate**
- Intent auf `linked_to` umstellen.
- tie-break durch Reviewer.
- Label fuer Kalibrierungsdatensatz erzeugen.

3. **Runbook: Verifier Flakiness**
- flaky-test detector markieren.
- optional rerun unter sauberem Environment.
- nicht reproduzierbare Fehlschlaege separat tracken.

## Rollout-Plan (detail)

### Sprint A (Control Plane)
- `IntentRecord` persistenz + API
- Statusmaschine + Review-Desk
- dedupe v1 ohne subgraph overlap

### Sprint B (Graph Integration)
- GitNexus context/impact hooks
- subgraph overlap scoring
- blast-radius report im ReviewBundle

### Sprint C (Isolated Builder + Verifier)
- sandbox/worktree runner
- build/lint/test/security gates
- request_changes loop

### Sprint D (Research Router + KPIs)
- paperwatcher hook mit score
- dashboard fuer KPI-Set
- calibrationsession fuer thresholds

## Definition of Done (strenger)

Ein Intent gilt nur dann als "vollstaendig geliefert", wenn:

1. `intent_id` vorhanden und statuskonsistent
2. Dedupe-Entscheidung protokolliert
3. Kontextpaket dokumentiert (Dateien/Symbole)
4. Verifier-Report reproduzierbar
5. Human-Entscheid protokolliert
6. Bei Merge: Graph/Index aktualisiert und verlinkt

## Offene Fragen fur v2

- Wann lohnt sich Multi-Agent-Orchestrierung gegenüber Single-Agent-Loops?
- Welche Intent-Felder werden verpflichtend fur hohe Retrieval-Qualitat?
- Wie wird Drift zwischen IntentGraph und realer Architektur automatisch erkannt?

## Quellen (Papers)

Primar fur diese Spezifikation:

1. [AgenticTyper: Automated Typing of Legacy Software Projects Using Agentic AI (arXiv:2602.21251)](https://arxiv.org/abs/2602.21251)
2. [GraphCodeAgent: Dual Graph-Guided LLM Agent for Retrieval-Augmented Repo-Level Code Generation (arXiv:2504.10046)](https://arxiv.org/abs/2504.10046)
3. [SWE-Adept: An LLM-Based Agentic Framework for Deep Codebase Analysis and Structured Issue Resolution (arXiv:2603.01327)](https://arxiv.org/abs/2603.01327)
4. [SpecRover: Code Intent Extraction via LLMs (arXiv:2408.02232)](https://arxiv.org/abs/2408.02232)
5. [Configuring Agentic AI Coding Tools: An Exploratory Study (arXiv:2602.14690)](https://arxiv.org/abs/2602.14690)
6. [Agentic Much? Adoption of Coding Agents on GitHub (arXiv:2601.18341)](https://arxiv.org/abs/2601.18341)

Erweiternd fur Evaluation/Skalierung:

7. [SWE-Universe: Scale Real-World Verifiable Environments to Millions (arXiv:2602.02361)](https://arxiv.org/abs/2602.02361)
8. [Immersion in the GitHub Universe: Scaling Coding Agents to Mastery (arXiv:2602.09892)](https://arxiv.org/abs/2602.09892)
9. [SWE-PolyBench: A multi-language benchmark for repository level evaluation of coding agents (arXiv:2504.08703)](https://arxiv.org/abs/2504.08703)
10. [Training Software Engineering Agents and Verifiers with SWE-Gym (arXiv:2412.21139)](https://arxiv.org/abs/2412.21139)

Erweiternd fur iterative Small-Model-Loops:

11. [Self-Correcting Code Generation Using Small Language Models (CoCoS, arXiv:2505.23060)](https://arxiv.org/abs/2505.23060)
12. [Self-Taught Self-Correction for Small Language Models (STaSC, arXiv:2503.08681)](https://arxiv.org/abs/2503.08681)

Historisch wichtig fur repo-level Agent-Tooling:

13. [CodeAgent: Enhancing Code Generation with Tool-Integrated Agent Systems for Real-World Repo-level Coding Challenges (arXiv:2401.07339)](https://arxiv.org/abs/2401.07339)
14. [SpecAgent: A Speculative Retrieval and Forecasting Agent for Code Completion (arXiv:2510.17925)](https://arxiv.org/abs/2510.17925)

## Ergaenzende Praxisquellen (Ops/Security/Eval)

1. [OWASP: LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
2. [OWASP GenAI Top Risk LLM01: Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
3. [AWS Well-Architected REL05-BP03: Control and limit retry calls](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_mitigate_interaction_failure_limit_retries.html)
4. [AWS Builders' Library: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
5. [OpenAI: Why SWE-bench Verified no longer measures frontier coding capabilities](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)

## Archiv-Referenz

- Gespraechsgrundlage: `Automatic_coding.txt`
- Archivierter Ablageort: `d:\tradingview-clones\tradeview-fusion\docs\archive\Automatic_coding_2026-03-16.txt`
