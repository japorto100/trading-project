# Geopolitical Map Blueprint 2026

Version: 1.1-beta  
Status: Phase 4 baseline implemented, closeout + Folgegates aktiv  
Last updated: 2026-03-09

**Arbeits-Checkliste:** [`specs/execution/geomap_closeout.md`](./specs/execution/geomap_closeout.md)  
**Erledigte Sections (Library, Requirements, Scope v1, Event taxonomy, Regions, Reuse, Storage, Hard-signal, File structure):** [`archive/GEOPOLITICAL_MAP_MASTERPLAN.md`](./archive/GEOPOLITICAL_MAP_MASTERPLAN.md)

---

## 0. Purpose

Master blueprint fuer GeoMap: product spec, engineering spec, roadmap v1→v3.  
Kernprinzip: system proposes, human confirms, map persists only confirmed intelligence.

---

## 1. Red-thread guiding questions

1. Main goal: visualization only, or direct trading signal control?
2. Static/manual or live/API-driven?
3. Granularity: countries only, or regions/hotspots?
4. Which categories must be represented?
5. Which timeline behavior is needed?
6. Which UI interactions are mandatory?
7. Standalone fullscreen or embedded mode?
8. Which sources are mandatory first?
9. How to suppress noise and keep only signal?
10. How to map geopolitical events to concrete assets?

---

## 2. Scope (v2/v3 noch offen)

- **v2:** better projection/geometry, anti-noise alerting controls
- **v3:** ML-assisted ranking, scenario/regime-state, probabilistic impact hints
- **Out-of-scope v1:** autonomous execution, zero-touch persistence, model-only approval

---

## 3. Feedback-Driven Review (SOTA 2026) — OFFEN

> **Update 2026-02-19:** Das binaere Accept/Reject/Snooze-System (2023-2024 Pattern) wird durch ein granulares Feedback-System ersetzt. Jede Analysten-Entscheidung wird zur Trainingsgrundlage fuer das Gesamtsystem.
> **Training-Pipeline-Details:** Siehe [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.3-4.7

### 3.1 System-Klassifikation (automatisch, pro Candidate)

Jeder Candidate traegt eine System-Einschaetzung:

```ts
interface SystemClassification {
  classification: "signal" | "noise" | "uncertain";
  confidence: number;    // 0.0-1.0
  reason: string;        // menschenlesbar, z.B. "OFAC SDN List Update. Source tier: A. 2 sources. Title-match confidence: 0.89"
  features?: Record<string, number>;  // fuer spaetere XAI/SHAP (v3)
}
```

- `signal`: System glaubt der Candidate ist echte Intelligence (confidence >= Schwellwert)
- `noise`: System glaubt es ist irrelevant (falsche Kategorie, Duplikat, veraltet)
- `uncertain`: System ist sich nicht sicher -- **diese Cases sind fuer Active Learning am wertvollsten**

In v1.1 ist die System-Klassifikation regelbasiert (Source Tier + Confidence Score + Dedup Hit). Ab v3 ML-gestuetzt (DL-7 Transformer, siehe [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) Sek. 18, DL-7).

### 3.2 Analysten-Entscheidungen (manuell)

Statt binaer Accept/Reject:

| Entscheidung | Wann | Was passiert | Trainingswert |
|---|---|---|---|
| **Confirm Signal** | System sagt signal, Analyst stimmt zu | → Event erstellt. Agreement | Niedrig (System korrekt) |
| **Reclassify as Signal** | System sagt noise/uncertain, Analyst sieht Signal | → Event erstellt. **Override + Erklaerung** | **SEHR HOCH** (False Negative) |
| **Confirm Noise** | System sagt noise, Analyst stimmt zu | → Verworfen. Agreement | Niedrig (System korrekt) |
| **Reclassify as Noise** | System sagt signal, Analyst sieht Noise | → Verworfen. **Override + Erklaerung** | **HOCH** (False Positive) |
| **Mark Uncertain** | Analyst braucht mehr Info / zweite Meinung | → Bleibt in Queue, geflaggt | MITTEL (Grenzfall) |
| **Snooze** | Zeitlich noch nicht relevant | → Temporaer zurueckgestellt | Niedrig |
| **Split** | Candidate enthaelt mehrere Signale | → 2+ neue Candidates erzeugt | HOCH (Dedup-Feedback) |

### 3.3 Strukturierte Override-Erklaerung

Bei Reclassifications (Analyst widerspricht System) ist eine strukturierte Erklaerung **erforderlich**:

```ts
interface AnalystFeedback {
  decision: "confirm_signal" | "reclassify_signal" | "confirm_noise"
          | "reclassify_noise" | "uncertain" | "snooze" | "split";

  // Pflicht bei Reclassifications, optional bei Confirmations:
  overrideReason?:
    | "wrong_category"       // System hat Kategorie falsch erkannt
    | "wrong_severity"       // Severity zu hoch/niedrig
    | "duplicate_missed"     // Dedup hat versagt
    | "stale_event"          // War mal relevant, nicht mehr
    | "source_unreliable"    // Quelle nicht vertrauenswuerdig
    | "context_missing"      // System kennt den Kontext nicht
    | "actually_relevant"    // System hat Relevanz verpasst (noise→signal)
    | "emerging_pattern"     // Noch kein Event, aber Pattern erkennbar
    | "other";

  explanation?: string;        // Freitext, optional aber stark ermutigt
  correctedSeverity?: GeoSeverity;   // bei wrong_severity
  correctedCategory?: string;         // bei wrong_category

  // Meta:
  analystId: string;
  decidedAt: string;
  timeSpentMs?: number;        // wie lange hat der Analyst gebraucht (UX-Metrik)
}
```

**Warum strukturiert statt nur Freitext:** Die `overrideReason`-Tags erlauben sofortige Aggregation:
- "60% der Overrides in MENA sind `duplicate_missed`" → Dedup-Engine hat ein Regions-Problem
- "80% der `context_missing` Overrides kommen bei Kategorie `cyber`" → System braucht mehr Cyber-Kontext
- Freitext allein ist nicht aggregierbar ohne NLP -- die Tags liefern die Struktur, der Freitext den Kontext

### 3.4 Collaborative Review (3-5 User)

Bei mehreren Analysten entstehen wertvolle Signale aus Uebereinstimmung und Disagreement:

| Szenario | Bedeutung | System-Aktion |
|---|---|---|
| 3/3 Analysten: confirm_signal | Hohe Uebereinstimmung, sicheres Sample | Auto-Commit als Event, Gold-Label fuer Training |
| 2/3 signal, 1/3 noise | **Grenzfall** | Flaggen fuer Diskussion, Active-Learning-Prioritaet |
| Analyst A: reclassify_signal, Analyst B: confirm_noise | **Inter-Annotator Disagreement** | System flaggt: "Bitte Konsens finden" + beide Erklaerungen sichtbar |
| Nur 1 Analyst hat reviewed | Einfache Entscheidung | Standard-Flow |

**Inter-Annotator Agreement Metrik:** Cohen's Kappa ueber alle Reviews berechnen. Wenn Kappa < 0.6 fuer eine Kategorie → die Kategorie-Definition ist unklar oder das System-Labeling verwirrt die Analysten.

**Votingregeln (konfigurierbar):**
- Default: Einfache Mehrheit (2/3 reicht)
- High-Severity (S4+): Einstimmigkeit erforderlich
- Override gegen System-Signal: Mindestens 1 Erklaerung erforderlich

### 3.5 Was mit dem Feedback passiert (Kurzueberblick)

```
Analysten-Feedback (gesammelt in DB)
    |
    +-- v1.1: Dashboard → Accept Rate, Override Rate, Top Override Reasons
    |         Sofort sichtbar, keine ML noetig
    |
    +-- v2:   Golden Set → 200+ gelabelte Candidates als Regression-Tests
    |         Policy-Tuning → Thresholds anpassen basierend auf Override-Patterns
    |
    +-- v3:   Training Pipeline → Fine-Tuning Severity-Classifier (Rust DL-7)
              Active Learning → System fragt gezielt bei uncertain Cases
              Calibration → System-Confidence wird kalibriert auf Analyst-Feedback
              Concept Drift → Alert wenn Override-Rate fuer Kategorie/Region steigt
```

Vollstaendige Training-Pipeline-Architektur: [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.3-4.7

---

## 4. Signal vs noise policy

- Maximize precision, accept lower recall, enforce manual review gate.
- Confidence ladder: C0 (unverified) … C4 (official + market-impact). Nur C3/C4 → high-priority alerts.
- Policy: No direct persistence from unverified text; hard-signal adapters create priority candidates; source conflict lowers confidence.

---

## 5. UX — offene Punkte

### 9.3 Keyboard Shortcuts — [ ] offen

- `M` marker, `L` line, `P` polygon, `T` text
- `Delete` remove selected, `Ctrl+Z` undo, `Ctrl+Shift+Z` redo
- `C` open candidates, `R` toggle region layer  
**Ist:** Nur `c` implementiert.

### 9.4 Accessibility — [ ] offen

- keyboard reachable controls, strong dark-mode contrast, non-color-only severity encoding, **aria labels on all actions**  
**Ist:** Keine aria-Labels im Code.

### 9.2 Multi-Select — [ ] offen

- multi-select markers → bulk updates  
**Ist:** Nicht implementiert.

*(Event taxonomy, Regions, Reuse, Layout: erledigt — siehe Archiv.)*

---

## 6. Source strategy: tiers and trust

### 11.1 Source tiers

Tier A (official/high trust):
- central banks,
- sanctions authorities,
- official legal/public notices.

Tier B (structured commercial APIs):
- market/news providers with stable contracts.

Tier C (open/community/unofficial):
- wrappers,
- social feeds,
- forum streams.

### 11.2 Hard-signal first adapters

- Fed/ECB/BoE/BoJ rate schedule and decision pages,
- OFAC sanctions service updates,
- UK sanctions list updates,
- UN sanctions list updates.

### 11.3 Soft-signal candidates

- News APIs,
- selected finance media feeds,
- optional Reddit streams.

Rule: soft signals can only produce candidates, never auto-persistent map events.

### 11.4 Source Bias Awareness

> **Buch-Referenz (Emotion AI):** "Emotion and Facial Recognition in AI" (Slimani et al., Springer 2026), Kapitel "Challenges, Opportunities, and the Road Ahead" -- Geographic Bias, Language Bias, Confirmation Bias in Trainings-Daten und Annotationen. Kapitel "Navigating the Future" -- Cross-Cultural Calibration, Display Rules (kulturell bedingte Ausdruecke die Erkennung verfaelschen).

**Problem:** Unsere Source-Tiers (Sek. 11.1-11.3) definieren Vertrauen, aber nicht **systematische Verzerrungen** der Quellen. Jede Quelle hat inhärente Biases die sich auf Candidate-Qualität auswirken:

| Source-Klasse | Inhärenter Bias | Auswirkung auf GeoMap | Mitigation |
|---|---|---|---|
| **Tier A (Offiziell)** | Verzögerung (legale/politische Abstimmung) + politischer Framing-Bias | Events erscheinen spät, aber zuverlässig. Formulierungen folgen politischer Agenda, nicht Markt-Realität | Zeitstempel-Vergleich mit Tier-B/C. Offizielle Quellen als Bestätigung nutzen, nicht als Erstindikator |
| **Tier B (News APIs)** | Clickbait-Bias + Western Media Overrepresentation | Übertreibung von Severity. Afrikanische/asiatische Events unterrepräsentiert | Severity-Kalibrierung pro Source (Bloomberg schätzt anders als RT). Geographic Coverage Dashboard |
| **Tier C (Social/Reddit)** | Retail-Sentiment-Bias + Manipulation (Bots, Pump-Gruppen) | False Positives bei Crypto-Events. Echo-Chamber-Effekt | Nie als alleinige Quelle für auto-route. Mandatory Cross-Source für `signal`-Klassifikation |
| **Sentiment-Modell (FinBERT / Alternativen, Sek. 18.2)** | Language Bias (EN >> DE/FR/CN) + Training-Data Cutoff | Nicht-englische Events werden mit niedrigerer Confidence scored | Language-Tag als explizites Feld. Confidence-Abschlag für nicht-englischen Input (UIL Sek. 4.5.1). Langfristig: sprachspezifische Modelle (Sek. 18.2 Ensemble-Strategie) |

**Cross-Cultural Calibration (aus dem Emotion-AI-Buch übertragen):**

Das Buch beschreibt "Display Rules" -- kulturelle Normen die bestimmen wie Emotionen ausgedrückt werden (z.B. japanische Kultur unterdrückt negative Ausdrücke öffentlich). Analog haben Nachrichtenquellen kulturelle "Display Rules":

- **Westliche Medien:** Tendenz zur Dramatisierung, explizite Severity-Sprache ("crisis", "collapse")
- **Chinesische Staatsmedien:** Understatement bei eigenen Problemen, Overstatement bei westlichen
- **Golf-Staatsmedien:** OPEC-freundlicher Framing bei Öl-Themen

**Operationalisierung (v2):**
1. `source_bias_profile` als Metadaten-Feld pro Provider (manuell kuratiert)
2. Wenn 2+ Quellen aus derselben Bias-Klasse dasselbe Event reporten: **zählt als 1 Bestätigung**, nicht als 2
3. Cross-Bias-Bestätigung (Tier A + Tier C stimmen überein) erhöht Confidence stärker als Same-Tier-Bestätigung

**Verbindung:** [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 4.5 (Bias-Awareness generell), [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.8 (Adversarial Robustness), Sek. 8a (Privacy).

---

## 12. Provider matrix — Referenz

Market/News/Sanctions/Behavioral-Analysis-Quellen, Non-Western Sources, Integrations-Reihenfolge:  
**Vollständige Tabellen und Links:** [`archive/GEOPOLITICAL_MAP_MASTERPLAN.md`](./archive/GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 12.1–12.4.


---

## 13. Canonical data contracts

### 13.1 Event type

```ts
export type GeoEventStatus = \"candidate\" | \"confirmed\" | \"persistent\" | \"archived\";
export type GeoSeverity = 1 | 2 | 3 | 4 | 5;
export type GeoConfidence = 0 | 1 | 2 | 3 | 4;

export interface GeoSourceRef {
  id: string;
  provider: string;
  url: string;
  title?: string;
  publishedAt?: string;
  fetchedAt: string;
  sourceTier: \"A\" | \"B\" | \"C\";
  reliability: number; // 0..1
}

export interface GeoAssetLink {
  id: string;
  symbol: string;
  assetClass: \"equity\" | \"etf\" | \"fx\" | \"commodity\" | \"crypto\" | \"index\";
  relation: \"beneficiary\" | \"exposed\" | \"hedge\" | \"uncertain\";
  weight?: number; // 0..1
  rationale?: string;
}

export interface GeoEvent {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  status: GeoEventStatus;
  severity: GeoSeverity;
  confidence: GeoConfidence;
  countryCodes: string[]; // ISO alpha-2
  regionIds: string[];
  hotspotIds?: string[];
  coordinates?: { lat: number; lng: number }[];
  summary?: string;
  analystNote?: string;
  sources: GeoSourceRef[];
  assets: GeoAssetLink[];
  createdAt: string;
  updatedAt: string;
  validFrom?: string;
  validTo?: string;
  createdBy: string;
  updatedBy: string;
}
```

### 13.2 Candidate type

```ts
export interface GeoCandidate {
  id: string;
  generatedAt: string;
  triggerType: \"hard_signal\" | \"news_cluster\" | \"manual_import\";
  confidence: number; // 0..1
  severityHint: GeoSeverity;
  headline: string;
  regionHint?: string;
  countryHints?: string[];
  coordinates?: { lat: number; lng: number }[];
  sourceRefs: GeoSourceRef[];
  mergedIntoEventId?: string;
  state: \"open\" | \"accepted\" | \"rejected\" | \"snoozed\" | \"expired\" | \"split\" | \"uncertain\";
  reviewNote?: string;

  // System-Klassifikation (automatisch, Sek. 5.4.1)
  systemClassification: \"signal\" | \"noise\" | \"uncertain\";
  systemReason: string;  // menschenlesbar: warum das System so klassifiziert hat

  // Analysten-Feedback (manuell, Sek. 5.4.2-5.4.3)
  feedback?: GeoAnalystFeedback[];  // Array fuer Multi-User (3-5 Analysten)
}

export interface GeoAnalystFeedback {
  analystId: string;
  decidedAt: string;
  decision: \"confirm_signal\" | \"reclassify_signal\" | \"confirm_noise\"
          | \"reclassify_noise\" | \"uncertain\" | \"snooze\" | \"split\";
  overrideReason?: \"wrong_category\" | \"wrong_severity\" | \"duplicate_missed\"
                 | \"stale_event\" | \"source_unreliable\" | \"context_missing\"
                 | \"actually_relevant\" | \"emerging_pattern\" | \"other\";
  explanation?: string;
  correctedSeverity?: GeoSeverity;
  correctedCategory?: string;
  timeSpentMs?: number;
}
```

### 13.3 Timeline entry type

```ts
export interface GeoTimelineEntry {
  id: string;
  eventId: string;
  action:
    | \"created\"
    | \"status_changed\"
    | \"severity_changed\"
    | \"confidence_changed\"
    | \"geometry_changed\"
    | \"sources_updated\"
    | \"assets_updated\"
    | \"note_updated\"
    | \"archived\";
  actor: string;
  at: string;
  diffSummary: string;
}
```

---

## 14. Backend API design

### 14.1 REST endpoints

- `GET /api/geopolitical/events`
- `POST /api/geopolitical/events`
- `PATCH /api/geopolitical/events/:id`
- `POST /api/geopolitical/events/:id/archive`
- `GET /api/geopolitical/candidates`
- `POST /api/geopolitical/candidates/:id/accept` (legacy, wird zu `/review`)
- `POST /api/geopolitical/candidates/:id/reject` (legacy, wird zu `/review`)
- `POST /api/geopolitical/candidates/:id/snooze` (legacy, wird zu `/review`)
- **`POST /api/geopolitical/candidates/:id/review`** (NEU: nimmt `GeoAnalystFeedback` Body, ersetzt accept/reject/snooze)
- `GET /api/geopolitical/timeline`
- `GET /api/geopolitical/regions`
- `GET /api/geopolitical/news?region=...`
- `GET /api/geopolitical/sources/health`
- **`GET /api/geopolitical/feedback/metrics`** (NEU: Accept Rate, Override Rate, Kappa, Top Override Reasons)
- **`GET /api/geopolitical/feedback/disagreements`** (NEU: Faelle wo Analysten uneinig sind)

### 14.2 SSE endpoint

- `GET /api/geopolitical/stream`

Event types:
- `candidate.new`
- `candidate.updated`
- `event.updated`
- `timeline.appended`

---

*(Storage, Region news flow, Hard-signal design: erledigt — siehe Archiv Sek. 15–17.)*

---

## 15. Soft-signal NLP/ML (v2/v3) — OFFEN

> **Agent-Architektur:** Fuer den generellen Agent-Workflow (Extractor → Verifier → Guard → Synthesizer), die Behavioral Text Analysis (BTE/DRS) fuer Earnings Calls und Politiker-Reden, Speech Analysis (Stimmanalyse) und das Multimodale Analyse-Dashboard siehe [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md).

Pipeline:
1. ingest
2. language detection
3. dedup cluster
4. entity extraction
5. category classification
6. severity tagging
7. confidence scoring
8. candidate creation

Guardrails:
- no direct persistence from model output,
- explanation bundle required,
- conflict awareness required.

SOTA 2026 stance:
- use models for extraction, ranking, summarization,
- do not use models as sole legal/trading authority.

### 15.1 Ausbaustufen der Soft-Signal Adapter (aus project_audit2 uebernommen)

> **Ist-Zustand (15.02.2026):** TF-IDF + MiniBatchKMeans, Heuristik + optionaler FinBERT-Boost, FinBERT-Drift. Nur Headline-Forwarding, keine echte NLP-Pipeline. **Sentiment-Modell ist noch nicht committed** -- FinBERT ist aktuell installiert, aber Alternativen stehen zur Auswahl (siehe Sek. 18.2).

| Adapter | Ist-Zustand | Naechster Ausbau (v2) | Vollausbau (v3) |
|---------|-------------|----------------------|-----------------|
| `news_cluster` | TF-IDF + MiniBatchKMeans + Recency/Source-Weighting | Embeddings (Sentence-Transformers) + HDBSCAN | Cross-Source Fusion + Temporal Clustering |
| `social_surge` | Heuristik + Source/Recency + optionaler FinBERT-HF-Boost | Sentiment-Modell Fine-Tuning auf Domain-Daten (Modell-Auswahl: Sek. 18.2) | Domain-Sentiment mit Calibrated Confidence + Ensemble |
| `narrative_shift` | Sentiment-Drift-Heuristik + FinGPT-Tags | LLM-gestuetzte Narrative-Analyse (Ollama) | Multi-Day Trend Detection + Concept Drift |

**Verbindung zu UIL:** Die Soft-Signal Pipeline wird langfristig mit der UIL-LLM-Pipeline (siehe [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 4) mergen -- beide verarbeiten unstrukturierte Texte und produzieren Candidates.

**ACLED Conflict Index/Monitors:** Zurueckgestellt bis Lizenz-/Tier-Freigabe. Event-API bleibt produktiver Pfad.

### 15.2 Sentiment-Modell: FinBERT ist eine Option, kein Commitment

> **Stand:** 21. Februar 2026. FinBERT (ProsusAI/finbert, HuggingFace) ist in der Codebase als optionaler Boost implementiert, aber **nicht fest committed**. Die Landschaft hat sich seit 2019 (FinBERT-Paper) erheblich weiterentwickelt. Diese Sektion dokumentiert Alternativen fuer die endgueltige Modell-Entscheidung.

#### Kandidaten-Vergleich (Stand Feb 2026)

| Modell | Typ | Sprachen | Finanz-Domaene | Performance | Inference-Kosten | Open Source | Bewertung |
|---|---|---|---|---|---|---|---|
| **FinBERT** (ProsusAI) | BERT fine-tuned | Nur EN | Ja (Financial PhraseBank + Reuters) | Baseline. Gut auf EN Finance Headlines | Sehr niedrig (~50ms CPU) | Ja (HF) | Solide Baseline, aber nur EN. Kein Multilingual |
| **FinBERT2** (2025) | BERT pretrained | **CN-fokussiert** (32B Token CN Finance Corpus) | Ja (groesstes CN-Finance-Pretraining) | Schlaegt FinBERT um 0.4-3.3% auf diskriminativen Tasks, schlaegt LLMs um 9.7-12.3% | Niedrig | Ja (HF + GitHub) | **Beste Option fuer CN-Maerkte.** Nicht EN-kompatibel, braucht separaten EN-Pfad |
| **FinGPT** (AI4Finance) | LLM fine-tuned (Llama2/Llama3/ChatGLM2) | EN (+ MT-Variante multilingual) | Ja (data-centric, auto-curation) | Vergleichbar mit GPT-4 auf Sentiment. Staerke: auch Headline-Kategorisierung, nicht nur Sentiment | Mittel-Hoch (LLM-Inference) | **Ja -- MIT License.** GitHub 18.6k Stars, aktiv maintained (Feb 2026). Weights auf HF (fingpt-mt_llama3-8b_lora etc.) | **Vielseitigste Open-Source-Option.** Braucht aber GPU oder groessere CPU |
| **FinDPO** (2025) | LLM + DPO (Direct Preference Optimization) | EN | Ja | +11% ueber supervised fine-tuned Modelle. SOTA auf Sentiment-Benchmarks | Hoch (LLM) | **Nein** -- nur Paper (Imperial College London, arxiv 2507.18417). Kein oeffentl. Code/Weights (Stand Feb 2026) | Bestes Sentiment-Ergebnis laut Paper, aber nicht nutzbar bis Code released wird. Beobachten |
| **financial-roberta-large-sentiment** (soleimanian) | RoBERTa fine-tuned | Nur EN | Ja (10-K, Earnings Calls, CSR, News) | Gut, breiteres Training als FinBERT (mehr Texttypen) | Niedrig | Ja (HF) | **Gute FinBERT-Alternative** mit breiterem Trainings-Corpus |
| **XLM-R + Finance Fine-Tune** (DIY) | XLM-RoBERTa base (Meta AI) | **100+ Sprachen** | Nein (muesste fine-tuned werden) | XLM-R scored 0.96 SAS auf EN/ES Finance Tasks (ACL 2025). Aber kein fertiges Finance-Modell | Niedrig (nach Fine-Tuning) | **Ja -- MIT License.** Basis-Modell auf HF (FacebookAI/xlm-roberta-base, 783 Likes). Fine-Tuning: Eigenleistung | **Bester multilingualer Kandidat** -- braucht eigenes Fine-Tuning auf Financial PhraseBank. Trainiert auf 2.5TB CommonCrawl in 100 Sprachen |
| **FinBERT-Multilingual** (Tasfiya025) | FinBERT multilingual | EN, ES, FR, DE, PT | Ja (Customer Service Finance) | Unklar (neues Modell, wenig Benchmarks) | Niedrig | Ja (HF) | Nische (Customer Service statt Market Sentiment). Testen ob es fuer News-Headlines taugt |
| **GPT-4o / Claude (via API)** | Generalist-LLM | Alle | Nein (aber Prompting) | Competitive mit Fine-Tuned Modellen bei Few-Shot | **Sehr hoch** ($$$) | Nein | Fuer Prototyping gut, fuer Production zu teuer pro Headline |
| **Ollama + lokales LLM** (bereits geplant) | Lokaler LLM (Mistral, Llama3, etc.) | Multilingual (modellabhaengig) | Nein (aber Prompting) | Abhaengig vom Modell. Llama3-8B: brauchbar. 70B: gut | Mittel (lokale GPU) | Ja | Bereits in UIL Sek. 4.3 als LLM-Anbindung Option A geplant |

#### Empfohlene Strategie: Ensemble statt Single-Model

Statt ein Modell zu waehlen, setzen wir auf **modularen Austausch + optionales Ensemble**:

```
Headline / Text Input
    │
    ├─── [Sprache: EN] ──→ FinBERT ODER financial-roberta-large ──→ Sentiment Score A
    │                                                                        │
    ├─── [Sprache: CN] ──→ FinBERT2 ──→ Sentiment Score B                   │
    │                                                                        │
    ├─── [Sprache: andere] ──→ XLM-R (wenn fine-tuned) ODER                  │
    │                          Ollama/LLM + Prompt ──→ Sentiment Score C     │
    │                                                                        │
    └─── Meta-Sentiment: gewichteter Durchschnitt aller Scores              ─┘
         (Gewicht = Modell-Confidence × Language-Trust-Factor)
```

**Warum Ensemble:** Das Emotion-AI-Buch (Sek. zu Multimodal Fusion + Adversarial Robustness) zeigt: Ein einzelnes Modell ist angreifbar und hat blinde Flecken. Mehrere unabhaengige Modelle erhoehen Robustheit. Gleicher Ansatz wie beim Composite Signal (INDICATOR Sek. 3.5 Hybrid Fusion).

**Interface-Contract (Python Indicator Service):**

```python
class SentimentResult(BaseModel):
    score: float          # -1.0 (bearish) ... +1.0 (bullish)
    confidence: float     # 0.0 ... 1.0
    model_id: str         # "finbert", "finbert2-cn", "fingpt", "ollama-llama3", etc.
    language: str         # ISO 639-1
    input_length: int     # Token-Count des Inputs

class SentimentService(Protocol):
    async def analyze(self, text: str, lang: str) -> SentimentResult: ...
```

Jedes Modell implementiert dasselbe Interface. Austausch = Config-Aenderung, kein Code-Refactor.

**Priorisierung:**
1. **Jetzt:** FinBERT bleibt als Default fuer EN (bereits funktioniert)
2. **v2:** `financial-roberta-large-sentiment` als Alternative testen (gleiche Inference-Kosten, breiteres Training)
3. **v2:** Ollama + Llama3/Mistral fuer nicht-EN Input (bereits in UIL geplant)
4. **v3:** FinBERT2 fuer CN-spezifische Analyse wenn Asia-Coverage wichtig wird
5. **v3:** FinGPT als Upgrade wenn GPU verfuegbar

---

## 19. Asset mapping framework

### 19.1 Relation types

- beneficiary
- exposed
- hedge
- uncertain

### 19.2 Example

Strait escalation:
- exposed: shipping-dependent importers
- beneficiary: selected energy producers / freight proxies
- hedge: relevant commodity or volatility instruments

### 19.3 Rule

Asset link confidence is independent from event confidence.
High-impact asset links must include analyst rationale.

---

## 20. Alerting framework

Alert classes:
- candidate priority alert,
- severity escalation alert,
- status transition alert,
- asset exposure alert.

Anti-noise controls:
- cooldown by region/category,
- duplicate suppression windows,
- confidence thresholds per class,
- user mute profiles.

Defaults:
- high alert: C3+ and S4+
- medium alert: C2+ and S3+
- low alerts: off by default.

---

## 21. Governance and audit

Every change records:
- actor,
- old/new fields,
- timestamp,
- reason note.

Every candidate/event displays:
- why it exists,
- source set,
- confidence and severity explanation,
- latest change history.

Conflict policy:
- preserve conflict notes,
- reduce confidence until resolved.

---

## 22. Legal and usage constraints

- avoid storing full article bodies unless terms permit.
- store metadata-first: headline, snippet, URL, timestamps.
- unofficial wrappers (Yahoo/yfinance) are fallback only.
- market-data redistribution requires licensing review.

---

## 23. Security and reliability

Security:
- server-side secrets only,
- strict URL/input sanitization,
- output escaping in labels/tooltips.

Reliability:
- per-provider rate budget,
- circuit breaker,
- cache-first pulls for repeated region requests.

---

## 24. Test strategy

Unit:
- scoring logic,
- dedup logic,
- state transitions,
- schema validation.

Integration:
- ingestion -> candidate -> review -> persistence,
- timeline append on every mutation,
- provider outage fallback.

E2E:
- draw + marker workflow,
- candidate review lifecycle,
- region click -> filtered feed,
- timeline interactions.

---

## 25. Implementation milestones

> **Legende:** [x] erledigt, [~] teilweise/scaffold, [ ] offen
> **Audit-Datum:** 2026-02-18 (Code-Review gegen tatsaechliche Implementierung)
> **Arbeits-Checkliste:** Detaillierte Verify-Gates und Abhak-Liste in [`specs/execution/geomap_closeout.md`](./specs/execution/geomap_closeout.md)

*(Milestone A/B und erledigte Teile von C: siehe Archiv Sek. 25.)*

### Milestone C (sources) — offen

- [x] hard-signal adapters (OFAC, UK, UN, Central Bank), source health
- [~] soft-signal adapter scaffolds (RSS + Chronicle PoC vorhanden, aber keine echte NLP-Pipeline -- nur Headline-Forwarding)
- [x] source health endpoint/panel (SourceHealthPanel.tsx + API Route, API-Key-Checks)

### Milestone D (quality) -- TEILWEISE

- [x] confidence + dedup engine (confidence.ts 52 LoC, dedup.ts 108 LoC -- funktional)
- [~] anti-noise alerting (alerts/route.ts existiert mit 23 LoC, aber kein UI fuer Alert-Konfiguration, keine Cooldown-UI, keine User-Mute-Profile)
- [ ] perf + a11y pass (keine aria-Labels im Code, keine Performance-Optimierung nachweisbar, kein Keyboard-Shortcut-Set ausser `c`)

### Milestone E (v2) -- FRUEH BEGONNEN

- [x] Prisma persistence (Schema + Dual-Write in allen Stores implementiert)
- [~] geospatial stack upgrade (d3-geo + topojson waren schon v1-Stack; kein Upgrade auf z.B. Canvas/WebGL-Hybrid sichtbar)
- [~] advanced filters/search (Shell hat `search`/`filters` State-Variablen, aber kein dediziertes Filter-UI-Panel, keine facettierte Suche)

### Milestone F (noch nicht im Plan) -- OFFEN

- [ ] Shell-Refactoring: 1450-LoC-Monolith aufbrechen (Zustand Store, Context, Custom Hooks)
- [ ] Keyboard Shortcuts (M, L, P, T, Delete, Ctrl+Z, Ctrl+Shift+Z, R -- nur `c` existiert)
- [ ] Export-Funktion (JSON/PNG/PDF)
- [ ] Timeline Playback (Scrubber, Animation)
- [ ] Multi-Select + Bulk-Updates
- [ ] Asset-Link-UI vervollstaendigen (assetClass/relation Dropdowns statt hardcoded)
- [ ] Seed-Datensatz / Demo-Szenario (alle JSON-Files sind leer)
- [ ] ReliefWeb-Integration (nur ENV-Platzhalter, kein Code)
- [ ] Reddit-Integration (verschoben auf v2, kein Code)

---

## 25a. Ist-Zustand Audit (2026-02-18)

> Ergebnis der Code-Analyse gegen den Plan. Ehrliche Versions-Einschaetzung.

### Echte Version: **v1.0-beta**

| Aspekt | Status | Detail |
|---|---|---|
| **Gesamtbewertung** | v1.0-beta | Core-Workflow funktioniert, aber nie mit echten Daten benutzt. Kein Production-Haertung |
| **v1 Abdeckung** | ~85% | Luecken: a11y, Keyboard Shortcuts, Exports, leere Datenbank |
| **v2 Abdeckung** | ~30% | Prisma-Schema existiert. Kein Timeline-Playback, keine Advanced Filters, kein geospatial Upgrade |
| **v3 Abdeckung** | 0% | ML-Pipeline, Scenario-Support, Probabilistic Impact fehlen komplett |

### Frontend Ist-Zustand

| Kategorie | Dateien | LoC | Bewertung |
|---|---|---|---|
| Shell (Haupt-Container) | 1 | 1450 | **Monolith-Problem:** ~40 useState, kein Store, kein Context. Jeder State-Zugriff von ausserhalb unmoeglich |
| Map-Rendering | 1 | 599 | Solide. d3-geo Orthographic, SVG, funktioniert |
| Workflow-Panels | 6 | 646 | Funktional: Candidate Queue, Timeline, Event Inspector, Game Theory, Context, Insights |
| Shell-Sub-Panels | 6 | 626 | Funktional: Header, Create/Edit Marker, Draw Mode, Marker List, Region News |
| Types | 2 | 333 | Vollstaendig: Domain + API-Response Types |
| Shared Primitives | 1 | 41 | Drawing-Validation |
| **Gesamt** | **17** | **~3695** | -- |

**Architektur-Schulden:**
- `GeopoliticalMapShell.tsx` muss refactored werden (Zustand Store oder React Context)
- Kein globaler State -- Geo-Daten sind von ausserhalb der Map-Page nicht erreichbar
- Keine Lazy-Loading-Strategie fuer Panels

### Backend Ist-Zustand

| Kategorie | Dateien | Bewertung |
|---|---|---|
| API Routes | 22 | Alle implementiert, kein Stub |
| Server-Module (Stores + Bridges) | 8 | Voll funktional, Dual-Write (Prisma + JSON) |
| SSE Streaming | 1 | Funktional (5s Poll, 6 Event-Types) |
| Hard-Signal Adapter | 1 (306 LoC) | OFAC, UK, UN Sanctions + Central Bank Calendar -- real |
| Confidence/Dedup | 2 (160 LoC) | Implementiert und in Use |
| Ingestion Budget | 1 | Implementiert |
| Source Health | 1 | API-Key-Checks |

**Go-Backend Geo-Services:**

| Service | Status |
|---|---|
| ACLED Connector | Implementiert + Tests |
| GDELT Connector | Implementiert + Tests |
| Context (CFR/CrisisWatch) | Implementiert |
| Game-Theory Impact | Implementiert |
| ReliefWeb | Nicht implementiert (nur ENV) |

### Daten Ist-Zustand

| Datei | Inhalt |
|---|---|
| `events.json` | Leer (`{"events":[]}`) |
| `candidates.json` | Leer (`{"candidates":[]}`) |
| `timeline.json` | Leer (`{"timeline":[]}`) |
| `drawings.json` | Leer (`{"drawings":[]}`) |
| `regions.json` | 11 Regionen mit Country-Codes (real) |
| `symbol-catalog.json` | 9 Symbole (real) |

### Was der Plan beschreibt aber nicht existiert

| Plan-Sektion | Beschreibung | Code-Realitaet |
|---|---|---|
| Sek. 9.3 Keyboard Shortcuts | M, L, P, T, Delete, Ctrl+Z, Ctrl+Shift+Z, C, R | Nur `c` implementiert |
| Sek. 9.2 Multi-Select | multi-select markers → bulk updates | Nicht implementiert |
| Sek. 18 NLP/ML Pipeline | 8-Schritt-Pipeline (entity extraction, severity tagging, ...) | Nur Headline-Forwarding, keine NLP (Ausbaustufen in 18.1) |
| Sek. 19 Asset Mapping | relation types (beneficiary/exposed/hedge/uncertain) + weight | UI hat hardcoded assetClass/relation |
| Sek. 20 Alerting | cooldown, duplicate suppression, user mute profiles | Nur 23-LoC Route ohne UI |
| Sek. 29 Exports | JSON in v1, visual in v2 | Keine Export-Funktion |
| Sek. 29 Timeline Playback | v2 | Nicht begonnen |
| Sek. 29 Reddit | v2 | Reddit-Migration zu Go geplant (UIL Sek. 2.1) |
| Sek. 24 Tests | Unit + Integration + E2E definiert | Kein Test-Code fuer Geo sichtbar |

### Bekannte Infrastruktur-Luecken (aus project_audit2 Sek. 8.5 uebernommen)

| Luecke | Beschreibung | Prioritaet |
|--------|-------------|------------|
| **Daten-Density** | ACLED/GDELT liefern wenig Daten ohne validierte Credentials (`ACLED_EMAIL`, `ACLED_ACCESS_KEY`). GDELT braucht hochpraezise Queries | MITTEL -- Credentials klaeren |
| **LLM-Summary-Gap** | `summary`-Feld in Events vorbereitet aber nur Roh-Content. Echte Zusammenfassung wartet auf NLP-Pipeline (Sek. 18.1) | MITTEL -- kommt mit v2 NLP |
| **Persistence (localStorage)** | Zeichnungen und manuelle Marker-Korrekturen laufen ueber `localStorage`, nicht Prisma/SQLite | MITTEL -- Migration in Phase 3 |
| **Zombie-Processes (Windows Dev)** | Go-Gateway beendet sich bei harten Abbruechen manchmal nicht sauber. `netstat -ano | findstr :9060` + `taskkill` noetig | NIEDRIG -- Dev-only Problem |

---

*(Planned file structure: erledigt — siehe Archiv Sek. 26.)*

---

## 26. Suggested env extensions

```env
# Feature flags
NEXT_PUBLIC_ENABLE_GEOPOLITICAL_MAP=true
GEOPOLITICAL_CANDIDATE_MODE=true
GEOPOLITICAL_HARD_SIGNAL_MODE=true

# Polling and limits
GEOPOLITICAL_POLL_INTERVAL_MS=600000
GEOPOLITICAL_CANDIDATE_TTL_HOURS=72
GEOPOLITICAL_MAX_CANDIDATES_PER_RUN=100

# News providers
NEWSDATA_API_KEY=
NEWSAPIAI_API_KEY=
GNEWS_API_KEY=
WEBZ_API_KEY=
NEWSAPI_ORG_API_KEY=

# Optional geopolitics datasets
RELIEFWEB_APPNAME=
ACLED_API_KEY=

# Official source toggles
ENABLE_OFAC_INGEST=true
ENABLE_UK_SANCTIONS_INGEST=true
ENABLE_UN_SANCTIONS_INGEST=true
ENABLE_CENTRAL_BANK_CALENDAR_INGEST=true
```

---

## 28. Open questions (to finalize before implementation)

> **Status-Update 2026-02-18:** Fragen die durch den Code bereits beantwortet sind, markiert.

1. ~~single-user now vs multi-user from day one?~~ **Beantwortet:** Single-User implementiert (kein Auth-Layer fuer Geo)
2. ~~keep simple states only vs add approval states?~~ **Beantwortet:** Simple Lifecycle (active/archived/resolved + candidate confirm/reject/snooze)
3. ~~top 3 categories for first release?~~ **Beantwortet:** Symbol-Katalog hat 9 Kategorien (sanction, conflict, trade, energy, cyber, health, climate, political, financial)
4. ~~first default regions?~~ **Beantwortet:** regions.json hat 11 Regionen (Europe, MENA, East Asia, South Asia, Southeast Asia, Central Asia, Sub-Saharan Africa, North Africa, North America, South America, Oceania)
5. candidate sort order: confidence-first or severity-first? **Offen** (kein Sort-Code sichtbar, wird in der Shell per Array-Reihenfolge angezeigt)
6. asset link edit rights: owner-only or shared? **Offen** (kein Rights-System implementiert)
7. exports in v1 (JSON only) or PNG/PDF too? **Offen** (keine Export-Funktion implementiert)
8. timeline playback in v1 or v2? **Offen** (nicht implementiert)
9. include Reddit in v1 or postpone to v2? **Offen** (nicht implementiert)
10. ~~include macro event markers directly on timeline from day one?~~ **Beantwortet:** Timeline existiert mit Event-Types (created, updated, archived, statusChange, candidateAccepted, candidateRejected)

---

## 29. Proposed defaults if we proceed immediately

> **Status-Update 2026-02-18:** Was tatsaechlich implementiert wurde vs. was noch offen ist.

- ~~single-profile first~~ **Implementiert**
- ~~simple lifecycle states only~~ **Implementiert** (active/archived/resolved + candidate workflow)
- ~~first categories: sanctions, rates, conflict~~ **Erweitert:** 9 Kategorien implementiert (sanction, conflict, trade, energy, cyber, health, climate, political, financial)
- ~~first regions: Europe, MENA, East Asia, South America~~ **Erweitert:** 11 Regionen implementiert
- sort: confidence desc then severity desc -- **Noch offen** (kein Sort-Algorithmus in UI)
- asset edits: owner-only first -- **Noch offen** (kein Rights-System)
- export: JSON in v1, visual exports in v2 -- **Noch offen** (keine Exports)
- timeline playback: v2 -- **Noch offen**
- Reddit: v2 -- **Noch offen**
- ~~macro timeline markers: yes in v1~~ **Implementiert** (6 Event-Types im Timeline-System)

---

## 30. Execution checklist — offene Items

> **Arbeits-Checkliste:** [`specs/execution/geomap_closeout.md`](./specs/execution/geomap_closeout.md)  
> *(Erledigte Items: siehe Archiv Sek. 30.)*

**Product:** [~] asset links [~] no-noise policy  
**Engineering:** [ ] tests [ ] Keyboard Shortcuts [ ] Exports [ ] a11y Pass  
**Ops:** [~] alert routing test

---

## 31. Source appendix (internet-validated)

### 31.1 Map/geospatial stack

- https://github.com/VictorCazanave/react-svg-map
- https://github.com/yanivam/react-svg-worldmap
- https://github.com/StephanWagner/svgMap
- https://github.com/StephanWagner/worldMapSvg
- https://github.com/flekschas/simple-world-map
- https://github.com/benhodgson/markedup-svg-worldmap
- https://d3js.org/d3-geo
- https://github.com/topojson/world-atlas

### 31.2 Market providers and limits/pricing

- https://twelvedata.com/pricing
- https://www.alphavantage.co/support/
- https://www.alphavantage.co/premium/
- https://finnhub.io/docs/api
- https://site.financialmodelingprep.com/pricing-plans
- https://eodhd.com/welcome-special-30
- https://eodhd.com/financial-apis/api-limits
- https://marketstack.com/pricing
- https://marketstack.com/documentation
- https://polygon.io/knowledge-base/article/what-is-the-request-limit-for-polygons-restful-apis
- https://polygon.io/docs/rest/quickstart
- https://coinmarketcap.com/api/pricing/
- https://coinmarketcap.com/api/documentation/v4/
- https://finage.co.uk/product/stocks
- https://fred.stlouisfed.org/docs/api/fred/
- https://github.com/ranaroussi/yfinance
- https://insightsentry.com/

### 31.3 News providers

- https://newsapi.ai/plans
- https://gnews.io/pricing
- https://webz.io/products/news-api/
- https://newsdata.io/blog/pricing-plan-in-newsdata-io/
- https://newsdata.io/blog/newsdata-rate-limit/
- https://newsapi.org/pricing

### 31.4 Official geopolitics and sanctions

- https://ofac.treasury.gov/sanctions-list-service
- https://ofac.treasury.gov/recent-actions/20240506_33
- https://www.gov.uk/government/publications/the-uk-sanctions-list
- https://www.gov.uk/government/publications/uk-sanctions-list-change-in-format
- https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list
- https://scsanctions.un.org/consolidated/
- https://data.europa.eu/en/news-events/news/find-out-about-eu-restrictive-measures-across-globe-through-eu-sanctions-map

### 31.5 Central bank schedules (Kalender)

- https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
- https://www.ecb.europa.eu/press/accounts/html/index.en.html
- https://www.bankofengland.co.uk/monetary-policy/upcoming-mpc-dates
- https://www.boj.or.jp/en/mopo/mpmsche_minu/

### 31.6 Zentralbank Balance Sheets, On-Chain, Symbol-Universum, weitere Datenquellen

> **Vollstaendige Quellen-Referenz:** Alle Details (APIs, Portale, Wrapper, Frequenz, Formate) sind jetzt verteilt ueber:
> [`docs/references/sources/macro-and-central-banks.md`](./references/sources/macro-and-central-banks.md),
> [`docs/references/sources/market-data.md`](./references/sources/market-data.md)
> und den Web3-Owner unter [`docs/web3/README.md`](./web3/README.md)
>
> **Kurzuebersicht (fuer Geo-Map relevant):**
> - **Zentralbanken:** Fed (FRED/DDP), EZB, BoE (IADB), BoJ, SNB, BIS-Aggregat -- fuer Sek. 35.13 Zentralbank-Filter-Layer
> - **On-Chain:** Arkham Intelligence (Entity Labels, Wallet Flows) -- Kontext-Layer
> - **US-Macro-APIs:** NY Fed, BLS, BEA, Treasury, FDIC, SEC EDGAR
> - **Community-Wrapper:** Rust `iadb-api` (BoE), Python `bojpy` (BoJ), R `SNBdata`/`BOJ`/`pdfetch`

### 31.7 Optional datasets and policy references

- https://acleddata.com/acled-api-documentation
- https://apidoc.reliefweb.int/
- https://www.gdeltproject.org/
- https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- https://redditinc.com/policies/data-api-terms

---

## 32. Final recommendation

Build Geopolitical Map as:
- standalone fullscreen module,
- manual-first intelligence surface,
- candidate-based automation with strict review gate,
- phased geospatial stack,
- official-source-first hard signal ingestion,
- explicit asset mapping with analyst rationale.

This matches your requirement: strong control, low noise, scalable toward advanced automation.

---

## 33. Risk register and mitigations

### 33.1 Product risks

- Risk: over-automation introduces false confidence.
  - Mitigation: candidate-only automation, manual confirmation required.
- Risk: UI overload from too many controls.
  - Mitigation: progressive disclosure, simple default mode.
- Risk: inconsistent taxonomy across analysts.
  - Mitigation: strict symbol catalog and category governance.

### 33.2 Technical risks

- Risk: map performance degradation with large annotation volume.
  - Mitigation: clustering, virtualization, layered rendering strategy.
- Risk: source outages or rate-limit failures.
  - Mitigation: circuit breakers, fallback chain, health dashboard.
- Risk: schema drift in third-party APIs.
  - Mitigation: adapter contracts + payload validation + alerting.

### 33.3 Data quality risks

- Risk: duplicate events from multiple feeds.
  - Mitigation: URL/title/time-window dedup and event merge tooling.
- Risk: stale events remain active too long.
  - Mitigation: lifecycle TTL checks and archive reviews.
- Risk: conflicting sources confuse confidence.
  - Mitigation: conflict-aware scoring and explicit analyst notes.

### 33.4 Compliance risks

- Risk: non-compliant content storage from paid news sources.
  - Mitigation: metadata-first storage and provider-term reviews.
- Risk: redistribution constraints on market data.
  - Mitigation: internal analysis mode until licensing approval.
- Risk: public exposure of keys or sensitive configs.
  - Mitigation: server-only env usage + rotation policy.

---

## 34. Operability runbook notes

### 34.1 Daily checks

- Source health endpoint green status.
- Candidate queue volume within normal band.
- No unresolved high-priority candidate older than SLA.
- Timeline integrity check (no missing diffs).

### 34.2 Weekly checks

- Review reject ratio and top noise contributors.
- Tune thresholds for over/under-triggering categories.
- Validate provider quotas against real usage.
- Rotate and verify optional source keys where required.

### 34.3 Incident response quick flow

1. Detect provider or ingestion failure.
2. Disable affected adapter by feature flag.
3. Keep manual workflow active.
4. Backfill missed window after adapter recovery.
5. Record incident and threshold adjustments in changelog.

---

## 35. SOTA-Erweiterungen Backlog (2026-02-19)

> **Kontext:** Analyse was das System von "v1-beta gut geplant" zu "production-grade SOTA Intelligence Platform" bringt.
> **Quellen:** Eigene Code-Analyse, ChatGPT-Review (ohne Codebase-Zugang), Web-Research 2026-02-19, Querverweise zu [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) und [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md).

### 35.1 Evidence Bundle pro Event (Beweis-Paket)

**Ziel:** Jede Entscheidung ist spaeter forensisch nachvollziehbar. Der Unterschied zwischen "News-Notiz" und "Intelligence Record".

**Was schon da ist:**
- `GeoSourceRef` hat `id`, `provider`, `url`, `title`, `publishedAt`, `fetchedAt`, `sourceTier`, `reliability`
- Confidence Ladder (C0-C4) mit Quellen-Abgleich

**Was fehlt und eingebaut werden muss:**

| Feature | Beschreibung | Prioritaet |
|---|---|---|
| **SHA256 Source Hash** | `hash: sha256(url + title + publishedAt)` pro Source-Ref. Immutable Evidence-Anker | HOCH |
| **Snapshot Storage** | Optionaler HTML/PDF-Snapshot der Quell-Seite zum Zeitpunkt des Fetchens. Storage: `data/geopolitical/snapshots/{hash}.html` | MITTEL |
| **Contradiction Tracking (explizit)** | Siehe 35.2 -- eigenes Sub-System | HOCH |
| **Evidence Score** | Gewichteter Score: `(Anzahl Quellen * sourceTier-Gewicht) + hash-verified + snapshot-available` | MITTEL |

**Betrifft:** `GeoSourceRef` Type (Sek. 13.1), Dedup-Engine (`dedup.ts`), Stores
**Rust-Verbindung:** Bei hohem Throughput (>1000 Candidates/Tag) koennte Hashing + Dedup in Rust beschleunigt werden. Aktuell kein Bottleneck.

### 35.2 Contradiction Tracking (explizit, nicht implizit)

> **Entscheidung:** Explizit. Implizites Confidence-Senken (aktuell: Sek. 6.2 Rule 5) reicht NICHT.

**Warum explizit besser ist (kritische Analyse):**

Das aktuelle System senkt bei widerspruechlichen Quellen einfach die Confidence. Das Problem: der Analyst sieht nur "C1" und weiss nicht *warum*. War es ein Einzelquellen-Problem oder ein aktiver Widerspruch? Die Information geht verloren.

Explizites Tracking bedeutet:
1. **Sichtbarkeit:** Analyst sieht "Quelle A sagt X, Quelle B sagt Y" -- nicht nur eine niedrige Zahl
2. **Auditierbarkeit:** Bei Rueckblick erkennbar warum eine Entscheidung schwierig war
3. **ML-Training:** Widerspruchs-Faelle sind die wertvollsten Trainings-Samples fuer zukuenftige Modelle
4. **Entscheidungsqualitaet:** Erzwingt dass der Analyst den Widerspruch aktiv aufloest statt "niedrige Confidence" zu ignorieren

**Datenstruktur:**

```ts
interface GeoContradiction {
  id: string;
  eventId: string;
  field: "severity" | "category" | "status" | "impact" | "narrative";
  sourceA: { sourceRefId: string; claim: string; evidence?: string };
  sourceB: { sourceRefId: string; claim: string; evidence?: string };
  resolution?: "sourceA_wins" | "sourceB_wins" | "merged" | "unresolved";
  resolvedBy?: string;
  resolvedAt?: string;
  rationale?: string;
}
```

**Regeln:**
- Wenn Dedup-Engine 2+ Quellen mit unterschiedlicher Severity/Category zum selben Event findet → automatisch `GeoContradiction` erzeugen
- Unresolved Contradictions blockieren Confidence-Upgrade ueber C2
- Timeline-Entry bei Resolution: "Contradiction resolved: sourceA_wins, rationale: ..."
- Im Event Inspector: eigener "Contradictions"-Tab wenn vorhanden

**Prioritaet:** HOCH. Geringer Aufwand, hoher Intelligence-Wert.
**Betrifft:** Dedup-Engine, Event Inspector UI, Confidence-Engine, Timeline

### 35.3 Zeitlogik: Decay, Status-Transitions, Regime-States

**Was schon da ist:** `validFrom`/`validTo` in `GeoEvent`, TTL fuer Candidates (Sek. 6.2 Rule 4), Lifecycle-States

**Was fehlt:**

| Feature | Phase | Beschreibung |
|---|---|---|
| **Confidence Decay** | v1.1 | Ohne neue Bestaetigung: Confidence sinkt um 1 Stufe pro `decayIntervalDays` (konfigurierbar, Default 14 Tage). Analyst kann Decay manuell zuruecksetzen ("re-confirmed") |
| **Regelbasierte Status-Transitions** | v1.1 | `active` → `stabilizing` nach N Tagen ohne Updates. `stabilizing` → `archived` nach M Tagen. Konfigurierbar per Category |
| **Regime-State Layer** | v3 | Pro Region ein Zustand: `"escalation"` / `"stabilizing"` / `"dormant"`. Berechnet aus Event-Density + Severity-Trend der letzten 90 Tage |

**Rust-Verbindung (Regime-State):** Direkt verbunden mit DL-6 in [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) (LSTM fuer Regime Detection). Mini-LSTM in Rust (tch-rs, ~200 LoC) koennte pro Region ein Regime klassifizieren:

```
ACLED/GDELT Events (pro Region, 90 Tage)
    ↓
  Rust LSTM (trainiert in Python, geladen via tch-rs CModule)
    ↓
  regime: "escalation" | "stabilizing" | "dormant"
    ↓
  Region-Overlay Farb-Intensitaet auf Map
```

**Prioritaet:** Decay + Transitions = v1.1 (leicht). Regime-State = v3/Rust Phase 3+.

### 35.3a Geopolitical Escalation als Markov Chain

> **Konzept:** Jede Region durchlaeuft geopolitische Zustaende (dormant → tension → escalation → conflict → de-escalation). Diese Uebergaenge sind nicht zufaellig -- sie folgen historischen Mustern die als Markov Chain modelliert werden koennen. ACLED/GDELT liefern die historischen Daten fuer die Transition-Matrix.
> **Querverweise:** [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 5q (Markov Chain Patterns), [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) Sek. 4.4 (Behavioral State Chain)

**States pro Region:**

```
S = { Dormant, Tension, Escalation, Conflict, De-escalation, Frozen }
```

| State | Trigger (aus ACLED/GDELT) | Map-Darstellung |
|---|---|---|
| **Dormant** | < 2 Events/Woche, avg_severity < 3 | Grau / unsichtbar |
| **Tension** | 2-5 Events/Woche, avg_severity 3-5, Protest/Demonstration-Events | Gelb-Overlay |
| **Escalation** | > 5 Events/Woche, steigende Severity, Battles/Explosions | Orange-Overlay, pulsierend |
| **Conflict** | > 10 Events/Woche, avg_severity > 7, Fatalities-Reports | Rot-Overlay, stark pulsierend |
| **De-escalation** | Sinkende Event-Density ueber 2+ Wochen, Diplomatic-Events steigend | Gruen-zu-Grau Gradient |
| **Frozen** | Konstant 3-5 Events/Woche ueber Monate, keine Veraenderung | Blau-Overlay (kalter Konflikt) |

**Transition-Matrix (gelernt aus ACLED 2018-2025, pro Region-Cluster):**

```
              To:  Dorm   Tens   Escal  Confl  De-esc Frozen
From:
Dormant      [  0.92   0.06   0.01   0.00   0.00   0.01  ]
Tension      [  0.10   0.55   0.25   0.02   0.05   0.03  ]
Escalation   [  0.01   0.08   0.50   0.30   0.08   0.03  ]
Conflict     [  0.00   0.01   0.05   0.65   0.20   0.09  ]
De-escalation[  0.30   0.25   0.05   0.02   0.35   0.03  ]
Frozen       [  0.02   0.05   0.08   0.05   0.05   0.75  ]
```

*Beispiel-Werte. Echte Werte werden aus ACLED-Daten pro Region-Typ (Sub-Sahara, MENA, Central Asia, etc.) berechnet -- verschiedene Regionen haben verschiedene Transition-Patterns.*

**Was das liefert:**

| Output | Nutzen fuer Trader |
|---|---|
| **Escalation-Wahrscheinlichkeit** | "Taiwan-Strait: 25% Chance von Tension → Escalation in naechster Woche" → Semiconductor-Exposure reduzieren? |
| **Expected State Duration** | "Ukraine: Conflict-Regime dauert im Schnitt 14 Wochen" → Langfristige Commodity-Positionierung |
| **Frozen Conflict Detection** | "Israel-Libanon: Eingefroren seit 8 Monaten, P(Escalation) steigt langsam" → Early Warning |
| **De-escalation Confidence** | "Myanmar: De-escalation seit 3 Wochen, aber P(Re-escalation) = 40%" → Noch nicht All-Clear |
| **Regime-Shift Alert** | Push-Notification wenn P(State-Change) > historischer Durchschnitt + 2σ |

**Implementierung:**

```python
from dataclasses import dataclass

@dataclass
class RegionRegime:
    region_id: str        # "TWN", "UKR", "MMR", etc.
    current_state: str
    transition_probs: dict[str, float]  # naechster Zustand → Wahrscheinlichkeit
    expected_duration_weeks: float
    escalation_risk: float     # P(current → escalation | conflict)
    deescalation_chance: float # P(current → de-escalation | dormant)
    anomaly: bool              # State-Change ungewoehnlich schnell?

class GeoEscalationChain:
    STATES = ["dormant", "tension", "escalation", "conflict",
              "de_escalation", "frozen"]

    def __init__(self):
        self.region_matrices: dict[str, np.ndarray] = {}

    def fit_region(self, region_id: str,
                   historical_states: list[str]) -> None:
        """Lernt Transition-Matrix aus historischen ACLED-Wochen-Zustaenden."""
        n = len(self.STATES)
        counts = np.zeros((n, n))
        idx = {s: i for i, s in enumerate(self.STATES)}
        for curr, nxt in zip(historical_states[:-1], historical_states[1:]):
            counts[idx[curr]][idx[nxt]] += 1
        row_sums = counts.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1
        self.region_matrices[region_id] = counts / row_sums

    def predict(self, region_id: str,
                current_state: str) -> RegionRegime:
        P = self.region_matrices[region_id]
        i = self.STATES.index(current_state)
        probs = {s: float(P[i][j]) for j, s in enumerate(self.STATES)}
        p_stay = P[i][i]

        escalation_states = {"escalation", "conflict"}
        esc_risk = sum(probs.get(s, 0) for s in escalation_states
                       if s != current_state)

        deesc_states = {"de_escalation", "dormant"}
        deesc_chance = sum(probs.get(s, 0) for s in deesc_states
                          if s != current_state)

        return RegionRegime(
            region_id=region_id,
            current_state=current_state,
            transition_probs=probs,
            expected_duration_weeks=1.0 / (1.0 - p_stay) if p_stay < 1 else 999,
            escalation_risk=esc_risk,
            deescalation_chance=deesc_chance,
            anomaly=False,
        )
```

**Verbindung zum Regime-State Layer (oben):** Die einfache v1.1-Logik (regelbasierte Transitions) bleibt als Fallback. Markov Chain kommt in v3 als probabilistischer Layer darueber -- nutzt dieselben States aber liefert Uebergangswahrscheinlichkeiten statt harter Regeln.

**Verbindung zu Market Regime (INDICATOR_ARCHITECTURE Sek. 5q.1):** Ein Cross-Signal: "Geopolitische Escalation in MENA + Market Regime shift zu Bearish" → Verstaerktes Signal. Die Markov Chains beider Domaenen (Markt + GeoMap) koennen korreliert werden.

### 35.4 Rendering-Architektur: SVG → Hybrid → Rust/WASM Pfad

> **Wichtig:** Tiefenanalyse basierend auf Code-Review von `MapCanvas.tsx` (599 LoC) und Web-Research (19.02.2026).

#### Ist-Zustand Analyse

`MapCanvas.tsx` rendert alles als **reines SVG** via d3-geo `geoOrthographic`:
- ~177 Country-Paths (world-atlas countries-110m)
- Heatmap als Country-Fill-Farben (pro Event-Severity aggregiert)
- Marker als SVG `<circle>` + `<text>` (pro Event)
- Soft-Signal-Pulse als animierte SVG `<circle>` mit `<animate>`
- Drawings als SVG `<path>` (line/polygon) und `<text>`
- Graticule als einzelner SVG `<path>`
- Popup als HTML-Overlay

**Probleme die JETZT schon sichtbar sind:**
1. **Jede Rotation/Zoom recomputed ALLES:** `useMemo` haengt an `[drawings, events, candidates, rotation, scale]`. Bei 50ms Auto-Rotation-Interval wird der gesamte Map-Model alle 50ms neu berechnet -- jeder Country-Path, jeder Marker, jede Projektion
2. **SVG DOM-Explosion:** Bei 200 Events + 500 Candidates + 50 Drawings + 177 Countries = **~930 SVG-Elemente** die React reconciled. Bei 1000 Events waeren es ~1700+
3. **Keine Viewport-Culling:** Marker auf der Rueckseite des Globus werden zwar `visible: false` gesetzt aber trotzdem berechnet und als React-Elemente erzeugt (nur nicht gerendert)
4. **CSS-Transitions auf SVG:** `transition-all duration-500` auf Country-Paths ist teuer bei vielen Elementen
5. **Kein Clustering:** 50 Events in Europa werden als 50 einzelne Marker gerendert, auch wenn sie sich ueberlappen

#### SOTA Optionen 2026 (Web-Research 19.02.2026)

| Option | Technik | Performance | Maturity | Passt zu uns? |
|---|---|---|---|---|
| **d3-geo + Canvas 2D** | Canvas statt SVG fuer Countries + Heatmap. SVG nur fuer interaktive Marker | ~10x schneller als SVG bei >200 Elementen. 60 FPS bis ~5000 Elemente | Production-ready, triviale Migration | **JA -- bester naechster Schritt** |
| **deck.gl v9.2** | WebGL2-basierte Overlay-Library. React-Integration (`@deck.gl/react`). GeoJsonLayer, ScatterplotLayer, HeatmapLayer | 60 FPS bis ~1M Datenpunkte. GPU-beschleunigt | Production-ready, weit verbreitet | **JA -- fuer v2/v3 wenn Datenvolumen steigt** |
| **MapLibre GL JS** | WebGL Vector-Tile-Renderer. Marker + Overlays + Clustering nativ | 60 FPS auch bei dichten Daten. Vector Tiles = progressive Loading | Production-ready | Moeglich, aber erfordert Architektur-Wechsel weg von d3-geo Globe |
| **maplibre-rs (Rust/WASM)** | Rust Map-Renderer, WebGPU-first mit WebGL-Fallback. Compiles zu WASM | Theoretisch sehr schnell. Multi-threaded | **Proof-of-Concept** -- fehlen Labels, Symbols, 3D Terrain. WebGPU nicht in allen Browsern | **NEIN -- zu unreif fuer Production** |
| **Hypersphere (Rust/WebGPU)** | Spezialisiert auf Globus-Rendering (LEO Satellites). WebGL2 Fallback | Gut fuer Globus-Use-Case | Nischen-Projekt, wenig Community | Interessant aber zu spezialisiert |
| **h3o (Rust) + Backend Clustering** | Rust-native H3 Spatial Indexing. 26x schneller als JS-Alternative | Backend: Cluster-Berechnung <1ms fuer 10k Events | Production-ready (h3o v0.9.4, 837k Downloads) | **JA -- fuer Backend Spatial Queries in v2+** |

#### Empfehlung: 3-Stufen Rendering-Roadmap

**Stufe 1 (v1.1 -- JETZT, vor v2):** d3-geo SVG → **d3-geo Hybrid (Canvas + SVG)**

Grund: Die aktuellen Performance-Probleme (Rotation-Recompute, SVG-DOM-Explosion) werden mit wachsenden Daten zum echten Problem. Canvas-Migration ist minimal-invasiv:

```
Aktuell:    <svg> → Countries (SVG paths) + Markers (SVG circles) + Drawings (SVG paths)

Stufe 1:    <canvas> → Countries + Graticule + Heatmap (Canvas 2D, nicht im React DOM)
            <svg overlay> → Markers + Drawings + Popups (SVG, interaktiv, im React DOM)
```

- Canvas fuer statische/viele Elemente (Countries, Graticule, Heatmap-Fills)
- SVG nur fuer interaktive Elemente (Marker mit Click, Drawings mit Select)
- Viewport-Culling: nur Marker im sichtbaren Hemisphere berechnen
- Marker-Clustering: Supercluster.js (7.6k Stars, production-ready) fuer Zoom-abhaengiges Clustering

**Aufwand:** ~2-3 Tage. Kein neues Framework, gleiche d3-geo Projektion.

**Stufe 2 (v2):** deck.gl Integration fuer High-Density Overlays

Wenn Datenvolumen auf 500+ Events + 2000+ Candidates waechst:

```
<DeckGL viewState={viewState} layers={[
  new GeoJsonLayer({ data: countries }),
  new HeatmapLayer({ data: eventDensity }),
  new ScatterplotLayer({ data: markers }),
  new PathLayer({ data: drawings }),
]} />
```

- deck.gl v9.2 hat native React-Integration
- GeoJsonLayer fuer Countries, ScatterplotLayer fuer Marker, HeatmapLayer fuer Density
- 60 FPS bis ~1M Datenpunkte (WebGL2-beschleunigt)
- Clustering, Picking, Tooltips nativ unterstuetzt
- **Bricht** mit dem aktuellen d3-geo Orthographic Globe -- muesste als Flat-Map oder mit globe-Modus von deck.gl geloest werden

**Aufwand:** ~1-2 Wochen. Neues Framework, neue Interaktions-Logik.

**Stufe 3 (v3):** Rust Backend fuer Spatial Queries + Clustering

Wenn Event-Volumen auf 10k+ waechst und Backend-Queries "alle Events in 500km Radius" < 10ms brauchen:

- **h3o** (Rust, v0.9.4, production-ready): H3 Spatial Indexing. 26x schneller als JS, 7.8x schneller bei Polygon-to-Cell
- Jedes Event bekommt einen H3-Index bei Creation (`h3o::LatLng::new(lat, lng).to_cell(Resolution::Five)`)
- Radius-Queries: `h3o::CellIndex::grid_disk(k)` statt Brute-Force-Distance
- Cluster-Berechnung: H3-Zellen aggregieren, Count pro Zelle → Frontend zeigt Cluster-Circles
- **Deployment:** Rust Microservice oder PyO3-Modul im Python-Backend

**Aufwand:** ~1 Woche Rust-Service. Setzt h3o Crate + API Route voraus.

**Was NICHT empfohlen wird:**
- `maplibre-rs` (Rust/WASM Map Renderer): Proof-of-Concept Stand 02/2026, fehlende Features (Labels, Symbols, 3D Terrain). WebGPU-Support noch nicht in allen Browsern. Fruehestens 2027 production-ready evaluieren
- Kompletter Wechsel von d3-geo Globe zu Flat-Map: Der Orthographic Globe ist ein UX-Differentiator. Beibehalten

**Rust-Verbindung:** [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) Sek. 13 wird von "Kein Rust noetig" auf "Rust fuer Backend Spatial Queries (h3o) ab v3" aktualisiert. Frontend-Rendering bleibt JS/TS.

**D3-Module-Roadmap:** [`GEOPOLITICAL_OPTIONS.md`](./GEOPOLITICAL_OPTIONS.md) definiert welche d3-Packages in jeder Rendering-Stufe installiert werden (v1.1: 8 Packages fuer Scales/Animation/Globe-UX, v1.5: 10 fuer Spielbaum/Timeline, v2: 12+ fuer Entity Graph/deck.gl). Feature→Module Matrix in Sek. 10.

#### 35.4a Reality-Update (Stand 26.02.2026)

Phase 4 hat die zentrale Stufe-1-Entscheidung bereits umgesetzt:
- d3-geo Hybrid (Canvas fuer Basemap/Country/Heatmap + SVG fuer Interaktion),
- Multi-Body Foundation (`Earth | Moon`) mit Layer-Registry,
- Inertia, Voronoi-basiertes Nearest-Lookup, Zoom-Out Clustering (`supercluster`),
- Candidate/Contradiction-Basisflows in produktiver Nutzbarkeit (transitional Runtime teilweise noch Next-local/Proxy).

Damit gilt: Die Frage ist nicht mehr "ob Hybrid", sondern "wie sauber der Closeout + die Folgegates" ausfallen.

#### 35.4b Gate-basierte Folgeentscheidung (statt Library-Hopping)

**Gate A -- Phase-4-Closeout (Pflicht vor neuer Geo-Engine-Arbeit):**
- finaler Browser-/E2E-Abnahmelauf fuer Earth/Moon, Layer-Toggles, Draw-Workflow, Cluster-Drilldown,
- reproduzierbare Performance-Baseline (FPS, Frame-Time p50/p95, Marker/Candidate-Szenarien),
- offene Punkte aus Verify-Gate abgeschlossen oder bewusst deferred mit Owner/Datum.

**Gate B -- deck.gl Entry (nur wenn Lastgrenzen real gerissen werden):**
- bei realen Lastprofilen sinkt die Bedienbarkeit unter Zielwerte (z. B. <=45 FPS in Kernflows oder zu hohe Interaktionslatenz),
- mindestens ein konkreter Overlay-Use-Case mit GPU-Mehrwert (z. B. Path/Heat/Scatter in hoher Dichte) ist fachlich priorisiert,
- Flat/Regional-Mode ist als zweiter View akzeptiert (kein stiller Ersatz des Globe-Core).

**Gate C -- Rust Spatial Entry (Backend-only):**
- Radius-/Nachbarschaftsqueries sind im Go/TS-Stack nicht mehr in Ziel-Latenz,
- H3-basierte Voraggregation bringt messbaren Mehrwert fuer Candidate/Alert/Region-Analysen,
- Integration laeuft als Service/Module hinter stabilen Contracts (kein Frontend-Rust-Renderer).

#### 35.4c Basemap-/Tile-/Policy-Entscheidung

**Trennung der Rollen (verbindlich):**
- OSM = Daten-/Lizenzoekosystem (nicht gleichbedeutend mit kostenfreiem Produktiv-Tile-/Geocoding-Service),
- PMTiles/Vector Tiles = statische oder selten geaenderte Kartengrundlagen,
- Live-Events/Candidates/User-Layer = API-/Stream-Overlays mit Delta-Updates.

**Betriebsregeln:**
- OSM Attributions-/Lizenzpflichten muessen im UI sichtbar bleiben,
- oeffentliche OSM-Tile/Nominatim-Instanzen nur begrenzt (Dev/Low-Volume), nicht als skalierbares Produktions-Rueckgrat,
- Geocoding/Place-Resolution ueber abstrahierten Provider-Layer + Caching/Fallback planen.

#### 35.4d Globe vs Flat Analyst View

- **Globe bleibt Core-View** (strategischer Weltueberblick, narrative Zusammenhaenge, Differentiator).
- **Flat Analyst View ist optionaler Zweitmodus** (Labels, dichter Regionalkontext, ggf. spaeter MapLibre+deck.gl).
- Kein Big-Bang-Replace des Globe-Stacks; Erweiterung nur modular und gate-gesteuert.

#### 35.4e OffscreenCanvas und supercluster Worker (Performance-Optimierungen)

**OffscreenCanvas (GeoMap Canvas-Rendering):**  
Der GeoMap-Canvas zeichnet Basemap, Laender, Heatmap und Event-Punkte. Bei vielen Events (z. B. 200+) kann das den Main-Thread blockieren → UI ruckelt. **OffscreenCanvas** ermoeglicht: `canvas.transferControlToOffscreen()` erzeugt ein OffscreenCanvas, das an einen Web Worker uebergeben wird. Der Worker zeichnet Globe, Laender, Events; der Main-Thread bleibt frei fuer Drag, Zoom, Klicks, React-Updates. **Wann:** Wenn GEOMAP_VERIFY Szenario B (< 45 FPS) ausloest, vor dem deck.gl-Gate. Siehe [`GEOMAP_VERIFY.md`](./GEOMAP_VERIFY.md) Sek. 4.

**supercluster Worker (optional, v3+):**  
Bei 5.000+ Events kann die supercluster-Berechnung (Zoom-abhaengiges Clustering) den Main-Thread belasten. Auslagerung in Web Worker: Worker empfängt Punkte + Bounds + Zoom, postet Cluster-Ergebnis zurueck. Main-Thread rendert nur. Siehe [`GEOPOLITICAL_OPTIONS.md`](./GEOPOLITICAL_OPTIONS.md) Sek. 7.3, [`GEOMAP_VERIFY.md`](./GEOMAP_VERIFY.md) Sek. 4 Szenario C.

**EXECUTION_PLAN:** Phase 4 (Szenario B), Phase 12 (supercluster Worker bei High-Density).

### 35.5 Policy-as-Code fuer Noise-Kontrolle

**Ziel:** Regeln maschinenlesbar, debuggbar, tunable machen.

**Was schon da ist:** Confidence Ladder (Sek. 6), Alert-Defaults (Sek. 20), Source-Tiers (Sek. 11). Alles Prosa.

**Was eingebaut werden muss:**

| Feature | Prioritaet | Beschreibung |
|---|---|---|
| **Explain-Why pro Candidate** | HOCH (v1.1) | Jeder Candidate traegt ein `reason: string` -- menschenlesbarer Satz warum er erzeugt wurde. Z.B. "OFAC SDN List Update detected via hard-signal adapter. Source tier: A. Title-match confidence: 0.89" |
| **JSON Rules Engine** | MITTEL (v2) | Konfigurierbare Regeln als JSON. Z.B. `{ "if": { "sourceTier": "A", "category": "sanction", "confidence": ">=0.75" }, "then": "priorityCandidate" }` |
| **Per-Region Cooldown** | MITTEL (v2) | Cooldown-Intervall pro Region+Category Kombination. Verhindert Alert-Flooding bei z.B. Ukraine-Konfikt |
| **Per-Category Budgets** | MITTEL (v2) | Max Candidates/Tag pro Category. Verhindert dass eine laute Kategorie alles dominiert |

**Rust-Verbindung:** Keine. Rules-Engine ist lightweight, TypeScript reicht.
**Betrifft:** Candidate-Creation-Flow, Alert-Route, neues Admin-Panel

### 35.6 Evaluation Harness: Precision/Noise messbar machen

**Ziel:** Ohne Metriken driftet das System. Messbarkeit ist Pflicht fuer SOTA.

**Minimum-Metriken (v1.1) -- basierend auf neuem Feedback-System (Sek. 5.4):**

| Metrik | Formel | Quelle | Was sie zeigt |
|---|---|---|---|
| **System Precision** | `confirm_signal / (confirm_signal + reclassify_noise)` | AnalystFeedback | Wie oft hat das System richtig "signal" gesagt? |
| **System Recall** | `confirm_signal / (confirm_signal + reclassify_signal)` | AnalystFeedback | Wie viele echte Signals hat das System erkannt? |
| **Override Rate** | `(reclassify_signal + reclassify_noise) / total_reviews` pro Kategorie/Quelle | AnalystFeedback | Wo irrt sich das System systematisch? |
| **Top Override Reasons** | Aggregation von `overrideReason` Tags | AnalystFeedback | Z.B. "60% der Overrides sind duplicate_missed" → Dedup-Problem |
| **Inter-Annotator Agreement** | Cohen's Kappa ueber alle Multi-User Reviews | AnalystFeedback | Sind die Analysten sich einig? Kappa < 0.6 = Problem |
| **Time to Review** | Median `timeSpentMs` pro Kategorie | AnalystFeedback | Welche Kategorien brauchen am laengsten? |
| **Duplicate Rate** | `dedup_hits / total_ingested` pro Quelle | Dedup-Engine Logging | Dedup-Effektivitaet |
| **Uncertain Rate** | `uncertain_decisions / total_reviews` | AnalystFeedback | Zu viele = System-Klassifikation unklar |
| **Coverage** | Stichprobenartig: "High-severity Events die das System verpasst hat" | Manueller Review (woechentlich) | False-Negative-Monitoring |

**Dashboard (v1.1):** `/api/geopolitical/feedback/metrics` liefert alle Metriken als JSON. Frontend: eigenes Panel im Geo-Map-Feature oder separater Admin-View.

**Golden Set (v2):**

30-50 realistische Seed-Events + 200 Candidates mit bekanntem erwarteten Verhalten:
- "Diese 5 Candidates sollten als Duplicates erkannt werden"
- "Dieser Candidate sollte Confidence C3 bekommen (3 Quellen)"
- "Dieser Candidate sollte Contradiction zu Event X erzeugen"
- "Diese 10 Candidates sind System-noise, Analysten sollten reclassify_noise bestaetigen"
- "Diese 5 Candidates sind System-uncertain, davon sind 3 echte Signals"

Dient als Regression-Test UND als Calibration-Baseline fuer ML-Modelle.

**Prioritaet:** HOCH. Braucht Seed-Daten als Voraussetzung.
**Rust-Verbindung:** Golden Set ist der Integration-Test fuer den Dedup-Service, auch wenn dieser spaeter in Rust laeuft.
**Training-Pipeline-Verbindung:** Alle Feedback-Daten fliessen in die Training-Pipeline (Sek. 5.4.5, Details in [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.3-4.7).

### 35.7 ML-Assist: Structured Extraction + Calibrated Confidence

**Bereits geplant in:**
- Sek. 18 dieses Dokuments (Soft-Signal NLP/ML Pipeline, 8 Schritte)
- DL-7 in [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) (Transformer Severity-Klassifikation)
- Sek. 4 in [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) (Guardrails / RLHF)

**Ergaenzungen die noch fehlen:**

| Feature | Phase | Beschreibung |
|---|---|---|
| **Calibrated Confidence** | v3 | Modell-Output wird auf historischem Review-Feedback kalibriert (Platt Scaling / Isotonic Regression). Confidence 0.8 soll bedeuten "80% der Faelle mit dieser Confidence wurden akzeptiert" |
| **Active Learning** | v3 | Faelle wo Analysten oft widersprechen (Accept/Reject schwankt) werden gezielt fuer Re-Training gesammelt |
| **Explanation Bundle** | v3 | Jeder ML-Candidate traegt `explanationBundle: { featureImportance: Record<string, number>, topTokens: string[], modelVersion: string }` |

**Rust-Verbindung:** Inference in Rust via tch-rs (DL-7). Training bleibt Python. Calibration-Logik ist reine Mathematik, portierbar nach Rust.
**Prioritaet:** v3. Braucht zuerst manuelles Labeling (monate-lang).

### 35.8 Entity Graph (GraphRAG light)

**Was schon da ist:** `graph/route.ts` (API Route fuer Graph-Daten), `GeoAssetLink` mit `relation`

**Was fehlt: ein echtes Graph-Datenmodell**

**Graph-Nodes:**

| Node-Type | Beispiele |
|---|---|
| Actor | Land, Regierung, Firma, Miliz, Behoerde, Staatschef |
| Asset/Commodity | GLD, CL (Crude Oil), USDCNH, Halbleiter |
| Sanction Program | OFAC SDN, UK Sanctions, EU Restrictive Measures |
| Chokepoint/Corridor | Strait of Hormuz, Suez Canal, Taiwan Strait, Red Sea |
| Event | Unsere GeoEvents |

**Edges:**

| Edge-Type | Beispiel |
|---|---|
| `sanctions` | USA → Iran (OFAC SDN) |
| `exposed_to` | Taiwan Semiconductor → Taiwan Strait Escalation |
| `supplies` | Saudi Arabia → Crude Oil |
| `controls` | Houthi → Red Sea Corridor |
| `transits_through` | Global Shipping → Suez Canal |
| `beneficiary_of` | Gold ETF → Sanctions Escalation |
| `trades_with` | Switzerland → China (bilateraler Trade Corridor, Volumen-gewichtet) |
| `restricts_corridor` | USA → Russia (OFAC Sanctions auf Corridor) |
| `cbdc_interop` | China e-CNY ↔ Thailand Digital Baht (mBridge Pilot) |

**Queries die damit moeglich werden:**
- "Zeige alle Events die Halbleiter-Exportkontrollen + Taiwan Strait betreffen"
- "Welche Assets sind transitiv von Iran-Sanctions betroffen?" (Graph-Traversal: Iran → Sanctions → Oil → Exposed Assets)
- "Welche Chokepoints haben offene Events mit Severity >= S4?"

**Implementation:**
- v2: In-Memory Adjacency Graph in TypeScript (ausreichend fuer <5000 Nodes)
- v3: Falls >10k Nodes: Rust mit `petgraph` Crate (Graph-Traversal performance-kritisch)
- NICHT Neo4j/DGraph -- Overkill fuer unser Volumen

**Prioritaet:** MITTEL. Grundstruktur (Asset-Links) existiert. Graph-Modell ist v2.
**Rust-Verbindung:** `petgraph` (Rust) fuer performante Graph-Queries ab v3. [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) DL-7 (Transformer) koennte Entity Extraction fuer automatische Graph-Population liefern.

### 35.9 CRDT-basierte Multi-User Collaboration (3-5 User)

> **Kontext:** System wird mittelfristig von 3-5 Analysten gleichzeitig benutzt. Kein Massenprodukt, aber echte Collaboration ist Pflicht.

**SOTA Optionen (Web-Research 19.02.2026):**

| Library | Technik | Staerke | Schwaeche | Passt zu uns? |
|---|---|---|---|---|
| **Yjs** | CRDT, netzwerk-agnostisch, dezentral | Unbegrenzt skalierbar, 50+ Editor-Integrationen, React-freundlich, Offline-faehig | Braucht Sync-Provider (y-websocket, y-webrtc) | **JA -- beste Option** |
| **Automerge** | CRDT, offline-first | Gute Rust-Bindings (automerge-rs), IndexedDB-Support | Weniger Editor-Integrationen als Yjs, schwerere Bundles | Moeglich, Rust-Affinitaet |
| **Liveblocks** | Hosted CRDT-Service | Zero-Setup, React-Hooks | Vendor Lock-in, Kosten, kein Self-Host | Nein (wir wollen Self-Hosted) |
| **PartyKit** | Serverless Collab-Runtime | Einfaches Deployment | CloudFlare-Abhaengigkeit | Nein |

**Empfehlung: Yjs + y-websocket**

Gruende:
- Yjs `Y.Map` bildet unsere Geo-State-Slices direkt ab (events, candidates, drawings, timeline)
- Funktioniert peer-to-peer (y-webrtc) ODER via Server (y-websocket) -- flexibel
- 3-5 User ist trivial fuer Yjs (skaliert theoretisch unbegrenzt)
- Offline-Support: Analyst kann offline annotieren, Sync passiert automatisch bei Reconnect
- React-Bindings existieren (`@y-presence/react`, `yjs-react`)

**Alternative: Automerge-rs (wenn Rust-Integration gewuenscht)**

Automerge hat native Rust-Bindings (`automerge-rs`). Wenn der Backend-State spaeter in Rust verwaltet wird (z.B. Geo-Event-Store als Rust-Service), waere Automerge die natuerlichere Wahl. Aber fuer ein TypeScript/Next.js-Frontend ist Yjs pragmatischer.

**Architektur:**

```
Analyst A (Browser)          Analyst B (Browser)          Analyst C (Browser)
    |                            |                            |
    +--- Yjs Y.Map (local) -----+--- Yjs Y.Map (local) -----+--- Yjs Y.Map (local)
    |                            |                            |
    +------------- y-websocket Sync Provider -----------------+
                         |
                    WebSocket Server (Node.js, lightweight)
                         |
                    Persistence: y-leveldb oder Prisma Dual-Write
```

**Was CRDT-faehig gemacht werden muss:**

| State-Slice | Aktuell | CRDT-Migration |
|---|---|---|
| Events (CRUD) | Shell useState + API | `Y.Map<string, GeoEvent>` -- Concurrent Edits merge automatisch |
| Candidates | Shell useState + API | `Y.Map<string, GeoCandidate>` -- Accept/Reject von verschiedenen Usern conflict-free |
| Drawings | Shell useState + API | `Y.Map<string, GeoDrawing>` -- Gleichzeitig zeichnen ohne Conflicts |
| Timeline | Append-only | `Y.Array<GeoTimelineEntry>` -- Append-only ist trivial fuer CRDT |
| Cursor/Presence | Nicht vorhanden | `@y-presence` -- "Analyst B schaut gerade auf MENA-Region" |

**Voraussetzung:** Shell-Refactor (Milestone F) muss ZUERST passieren. CRDT-State ersetzt die ~40 useState. Reihenfolge: Shell-Refactor → Zustand Store → Yjs-Layer auf dem Store.

**Prioritaet:** v2. Nach Shell-Refactor. Vor v3-ML-Features.
**Rust-Verbindung:** Falls spaeter Automerge-rs fuer Backend-State evaluiert wird, dokumentiert in [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md).

### 35.10 Asset-Mapping Erweiterungen

**Was schon da ist:** `GeoAssetLink` mit `symbol`, `assetClass`, `relation`, `weight`, `rationale`

**Was fehlt:**

| Feature | Phase | Beschreibung |
|---|---|---|
| **Impact Horizon** | v1.1 | `impactHorizon: "1d" \| "1w" \| "1m" \| "3m"` pro Asset-Link. "Diese Sanctions-Escalation betrifft Oil in 1w, aber Halbleiter in 3m" |
| **Exposure Templates** | v2 | Vordefinierte Asset-Buckets pro Event-Typ. Z.B. "Red Sea Escalation" → automatisch vorgeschlagene Assets: Shipping ETFs, Oil, Container-Rates |
| **Asset-Link Confidence getrennt** | v1.1 | Besteht schon als `weight` (0..1). Klarstellen: `weight` ist NICHT Event-Confidence, sondern Link-Staerke |
| **Backtest Hooks** | v3 | Spaeter pruefen ob "exposed" Asset wirklich korrelierte. Nur als Feedback, nicht als alleinige Wahrheit |
| **UI: Relation/Weight editierbar** | v1.1 | Aktuell hardcoded. Dropdown fuer `relation`, Slider fuer `weight`, Textarea fuer `rationale` |

**Prioritaet:** Impact Horizon + UI = v1.1. Templates = v2. Backtest = v3.

### 35.11 Alerting-System vervollstaendigen

**Was schon da ist:** `alerts/route.ts` (23 LoC), Alert-Framework im Plan (Sek. 20)

**Was fehlt (alles):**

| Feature | Phase | Beschreibung |
|---|---|---|
| **Alert-Konfigurations-UI** | v1.1 | Thresholds (Severity, Confidence) pro Alert-Klasse einstellbar |
| **Cooldown-Engine** | v1.1 | Per Region+Category Cooldown. Z.B. "Max 1 Alert pro Stunde fuer Ukraine/Conflict" |
| **Duplicate Suppression** | v1.1 | Alert nicht feuern wenn identischer Alert in letzten N Minuten |
| **User Mute Profiles** | v2 | Pro User: welche Kategorien/Regionen gemuted sind |
| **Explain-Why** | v1.1 | Jeder Alert traegt Erklaerung: "Triggered because: Severity S4, Confidence C3, Category sanctions, Region MENA. Cooldown: none active" |
| **Delivery Channel** | v2 | In-App Notification (SSE) + optional Email/Webhook |

**Prioritaet:** HOCH. Alerting ohne UI/Cooldown ist nicht operabel.

### 35.12 Export als Produktfeature

**Was fehlt (komplett):**

| Export-Type | Phase | Beschreibung |
|---|---|---|
| **JSON Export** | v1.1 | Sofort: Events + Timeline + Sources als JSON download. Trivial |
| **PNG/PDF Snapshot** | v1.1 | Map-Screenshot mit Legende, Timestamp, Quellenliste. Client-seitig: `html2canvas` + `jsPDF` |
| **Briefing Mode** | v2 | Region auswaehlen → Auto-generierter Brief: nur confirmed Events + Citations + Asset-Impact-Summary. Markdown oder PDF |
| **CSV/Excel** | v2 | Events-Tabelle als CSV fuer externe Analyse |

**Prioritaet:** JSON + PNG = HOCH (v1.1, leicht). Briefing = MITTEL (v2).

### 35.13 Zentralbank-Layer als eigener Filter (NEU 2026-02-19) => wichtig gold usw sind nur beispiele alle daten fetchen und dann schauen was wirklich gebraucht wird

> Aus Notizen: Zentralbanken kaufen Gold, betreiben QE/QT -- diese Informationen gehoeren auf die Karte.

**Use-Cases:**

| Use-Case | Beschreibung | Daten-Quelle |
|---|---|---|
| **QE/QT Visualisierung** | Welche Zentralbank druckt/strafft gerade? Faerbt Regionen auf Karte | Fed DDP, ECB Weekly, BoE IADB, BoJ (Sek. 31.6) |
| **Gold-/Reserven-Kaeufe** | PBoC/RBI/Tuerkei kaufen Gold → Event auf Karte mit Asset-Link (GLD, XAUUSD) | BIS CBTA, TradingEconomics |
| **Rate Decision Overlay** | Naechstes FOMC/ECB Meeting → Countdown-Marker auf Karte bei Region-Zentroid | Central Bank Calendar (Sek. 31.5) |
| **Balance Sheet Trend** | Woechentliche Bilanzsummen-Aenderung als Heat-Layer (expansiv = warm, restriktiv = kalt) | FRED (Fed), ECB SDW, BoE IADB |

**Filter-Integration:**

```
Toolbar: [Conflict] [Sanctions] [Trade] [Energy] ... [Central Banks ▼]
                                                        ├─ Rate Decisions
                                                        ├─ QE/QT Status
                                                        ├─ Reserve Changes
                                                        └─ Balance Sheet Trend
```

**Implementation:**
- v1.1: Rate Decision Calendar als Hard-Signal (existiert bereits teilweise in `hard-signals.ts`)
- v2: Balance Sheet Trend als neuer Daten-Adapter (Go-Service, Quellen siehe Sek. 31.6)
- v2: QE/QT Status + Reserve-Kaeufe als manuell+halb-automatisch gepflegte Events

**Prioritaet:** MITTEL-HOCH. Rate Decisions sind v1.1 (Daten existieren). Balance Sheet Layer ist v2.

### 35.13b CBDC Parameter Comparison Sub-Layer (NEU 2026-02-22)

> **Kontext:** Das UDRP-Konzept (Kiyan Sasan) definiert "Sovereign Parameter Sets" -- maschinenlesbare CBDC-Konfigurationen pro Jurisdiktion. In der Realitaet existieren bereits trackbare Dimensionen (Capital Controls, Financial Openness, Tax Policy). Diese als Sub-Layer des Zentralbank-Layers.
> **Referenz:** [`ENTROPY_NOVELTY.md`](./ENTROPY_NOVELTY.md) Sek. 12 (UDRP Sovereign Parameters), [`docs/references/sources/sovereign-and-corridors.md`](./references/sources/sovereign-and-corridors.md).

**Neue Sub-Layers unter "Central Banks":**

| Sub-Layer | Was es zeigt | Datenquelle | Visualisierung |
|---|---|---|---|
| **CBDC Status** | Launched / Pilot / Development / Research / Inaktiv pro Land | Atlantic Council CBDC Tracker | Choropleth: Gruen=Launched, Gelb=Pilot, Orange=Dev, Rot=Research, Grau=Inaktiv |
| **Financial Openness** | Chinn-Ito KAOPEN Index pro Land (0=geschlossen, 1=offen) | Chinn-Ito Dataset | Heatmap: Dunkel=geschlossen, Hell=offen |
| **Capital Controls** | De-facto Kapitalverkehrskontrollen | IMF AREAER (jaehrlich) | Icons/Badges pro Land |
| **De-Dollarization Trend** | USD-Reserven-Anteil, CNY-Anteil, Gold-Kaeufe | IMF COFER + SWIFT RMB Tracker | Trend-Pfeile pro Land (steigend/fallend USD-Anteil) |

**Filter-Integration (erweitert):**

```
Toolbar: [Conflict] [Sanctions] [Trade] [Energy] ... [Central Banks ▼]
                                                        ├─ Rate Decisions
                                                        ├─ QE/QT Status
                                                        ├─ Reserve Changes
                                                        ├─ Balance Sheet Trend
                                                        ├─ CBDC Status (NEU)
                                                        ├─ Financial Openness (NEU)
                                                        └─ De-Dollarization Trend (NEU)
```

**Prioritaet:** MITTEL. CBDC Status + KAOPEN sind leicht implementierbar (strukturierte Daten, periodischer Bulk-Fetch). De-Dollarization ist Quartals-Daten.

### 35.13c Trade Corridor Visualization Layer (NEU 2026-02-22)

> **Kontext:** Das UWD-Konzept (Kiyan Sasan) beschreibt "Corridors as Diplomacy" -- Handelskorridore als parametrisierte Beziehungen zwischen Laendern. Unabhaengig vom Sasan-System: Bilaterale Handels-Daten (UN Comtrade) und WTO-Disputes sind direkt visualisierbar.
> **Referenz:** [`ENTROPY_NOVELTY.md`](./ENTROPY_NOVELTY.md) Sek. 13.2 (Corridors as Diplomacy), [`docs/references/sources/sovereign-and-corridors.md`](./references/sources/sovereign-and-corridors.md).

**Konzept:** Handelskorridore als PathLayer (deck.gl v2) auf der Karte. Linien zwischen Laender-Zentroiden, gewichtet nach Handelsvolumen.

| Attribut | Darstellung | Datenquelle |
|---|---|---|
| **Handelsvolumen** | Liniendicke (proportional zu bilateralem Trade Volume in USD) | UN Comtrade |
| **Warengruppe** | Linienfarbe (Energie=rot, Tech=blau, Agrar=gruen, Finanz=gold) | UN Comtrade HS-Codes |
| **Korridor-Status** | Strichart (durchgezogen=normal, gestrichelt=eingeschraenkt, rot-gestrichelt=sanctioned) | SECO/OFAC Sanctions + WTO Disputes |
| **Trend** | Animation (pulsierend=wachsend, fade=schrumpfend) | Jahr-ueber-Jahr Vergleich |

**Interaktion:**
- Hover auf Korridor-Linie → Tooltip: Top-5 Warengruppen, Volumen, YoY-Aenderung
- Click → Detail-Panel: Historischer Trade-Volume-Chart, aktive WTO-Disputes, Sanctions
- Events auf Korridor-Linien: WTO-Dispute-Filing, neue Tariffs, Sanctions-Aenderung als Punkte auf der Linie

**Implementation:**
- v2: deck.gl PathLayer fuer Top-100 bilaterale Korridore
- Daten: UN Comtrade API (jaehrlich + monatlich fuer Top-Korridore), Bulk-Import via Go-Adapter
- Events: WTO Disputes RSS als Korridor-Events

**Prioritaet:** MITTEL. Abhaengig von deck.gl Migration (Sek. 35.4 Rendering-Architektur). Datenquellen sind kostenlos und gut strukturiert.

### 35.13d Country Attractiveness Heatmap Layer (NEU 2026-02-22)

> **Kontext:** UWD beschreibt "Coercion to Attraction" -- Staaten die durch bessere Governance, Infrastruktur und Buergernutzen konkurrieren. Messbar durch bestehende Indices.
> **Referenz:** [`ENTROPY_NOVELTY.md`](./ENTROPY_NOVELTY.md) Sek. 13.4 (Passport Competition).

**Synthetischer Country Attractiveness Index:**

| Komponente | Gewicht | Quelle | Update-Frequenz |
|---|---|---|---|
| Heritage Economic Freedom Index | 25% | Heritage Foundation | Jaehrlich |
| WGI Regulatory Quality | 20% | World Bank | Jaehrlich |
| Henley Passport Index (normalisiert) | 15% | Henley & Partners | Quartal |
| HDI (normalisiert) | 15% | UN | Jaehrlich |
| Fragile States Index (invertiert) | 15% | Fund for Peace | Jaehrlich |
| CPI (normalisiert) | 10% | Transparency International | Jaehrlich |

**Visualisierung:** Choropleth-Heatmap (dunkelgruen=hohe Attraktivitaet, rot=niedrige). Als Toggle-Layer neben dem bestehenden Regime-State-Layer.

**Prioritaet:** NIEDRIG. Jaehrliche Daten, kein Echtzeit-Wert. Nuetzlich als Kontext-Layer fuer Laender-Analyse.

### 35.14 Event Modal UX: Mini + Detail (NEU 2026-02-19)

**Problem:** Aktuell zeigt der Event Inspector eine fixe Panelgroesse. Bei komplexen Events mit vielen Sources, Asset-Links und Timeline-Eintraegen reicht das nicht.

**Loesung: Zwei-Stufen-Modal**

| Stufe | Trigger | Inhalt |
|---|---|---|
| **Mini-Modal** (Overlay/Popover) | Hover oder Single-Click auf Marker | Title, Category, Severity Badge, Confidence, 1-2 Top-Sources (Snippet), Quick-Actions (Accept/Archive) |
| **Detail-Modal** (Fullscreen/Side-Panel) | Doppel-Click oder "Expand" Button | Alle Felder: Sources komplett (URLs, Snippets, Hashes), Asset-Links mit Weight/Relation, Timeline-History, Analyst-Notes, Feedback-History, Contradiction-Refs |

**Links zu Originalquellen:** Detail-Modal zeigt fuer jede Source einen direkten Link zur Originalquelle (URL klickbar). Kein Paywall-Content gespeichert, nur Metadaten + Hash (Terms-Aware, Sek. 35.13).

**Prioritaet:** MITTEL. Verbessert taegliche Arbeitseffizienz signifikant. Nach Shell-Refactor (v1.1).

### 35.15 Copy/Paste News Import (API-lose Quellen) (NEU 2026-02-19, UPDATE 2026-02-19)

> **Update 2026-02-19:** Copy/Paste ist jetzt ein **Top-Level Feature** in der Unified Ingestion Layer (UIL), nicht mehr GeoMap-spezifisch. Der LLM bestimmt das Routing (GeoMap, Macro, Trading, Research). Content der als `geo` geroutet wird erscheint weiterhin als GeoCandidate in der GeoMap.
>
> **Vollstaendige Dokumentation:** [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 6 (Copy/Paste als Top-Level Feature), Sek. 4 (LLM-Pipeline), Sek. 5 (Review-Workflow).

**Was sich aendert gegenueber dem urspruenglichen Plan:**

| Aspekt | Alt (nur GeoMap) | Neu (UIL Top-Level) |
|--------|------------------|---------------------|
| Scope | Nur GeoMap | Global (alle Subsysteme) |
| Klassifizierung | Manuell (User waehlt Category/Region/Severity) | LLM-automatisch + Human Review |
| Routing | Immer GeoMap → GeoCandidate | LLM bestimmt: geo/macro/trading/research |
| triggerType | `manual_import` | `manual_import` (bleibt gleich) |
| Evidence Bundle | SHA256 + Timestamp | SHA256 + Timestamp + URL (identisch) |

**Was bleibt gleich:** Evidence Bundle (SHA256, Sek. 35.1), `triggerType: "manual_import"`, Metadata-first Storage (Sek. 22).

**Spaetere Integration mit Paperwatcher:** Unveraendert -- Paperwatcher kann als LLM-Backend in der UIL-Pipeline dienen (v2/v3).

**Prioritaet:** MITTEL. Abhaengig von UIL-Kernarchitektur.

### 35.16 Security/Compliance Hardening (ehem. 35.13)

**Was schon da ist:** Server-only env usage (Sek. 27), metadata-first storage (Sek. 33.4)

**Was fehlt:**

| Feature | Phase | Beschreibung |
|---|---|---|
| **Access Control (per Action)** | v2 | Wer darf Events confirmen? Wer darf Asset-Links aendern? Rollenbasis: viewer / analyst / admin |
| **Key Rotation Checks** | v1.1 | Automatischer Check ob API Keys aelter als 90 Tage. Warning in Source Health Panel |
| **Audit-Log Tamper Protection** | v2 | Timeline-Hashes: jeder Entry hasht den vorherigen. Manipulation erkennbar |
| **Terms-Aware Storage** | v1.1 | Konsequent metadata-first. Kein Full-Text von bezahlten News-Quellen speichern. Nur: URL, Title, Snippet (<200 chars), Hash |

**Prioritaet:** Terms-Aware + Key Rotation = v1.1. Access Control + Tamper Protection = v2.

---

## 36. Priorisierte Execution-Reihenfolge

> Alle SOTA-Erweiterungen (Sek. 35) + offene Milestones (Sek. 25 Milestone F) zusammengefasst.

### Sprint 1: Foundation Fix (v1.1-alpha)

> **Transition-Hinweis (nach Phase-4-Implementierung, Feb 2026):** Der GeoMap-Frontend-/Rendering- und UX-Stack kann fuer v2.0 bereits ausgeliefert/tested werden, aber Teile der Domainlogik (Candidates/Contradictions/Seed/Review APIs) laufen vorerst noch ueber Next.js-Serverrouten + lokale Stores als **transitional path**. Die Backend-Konsolidierung auf **Frontend -> Go -> Python/Rust** ist als Folgearbeit in `EXECUTION_PLAN.md` bei **Phase 9 (UIL Workflow/Review)** und **Phase 14 (offizielle Quellen/DiffWatcher im Go-Layer)** eingeplant.
> **Update (23. Feb 2026, Phase 9e-Cutover):** Der Candidate/Review/Ingest/Contradictions/Timeline-Truth-Path laeuft inzwischen ueber Go-Frontdoor/Go-owned Stores (Cutover via Next Thin-Proxies). Verbleibende lokale Next-GeoMap-Routen (`events/*`, `drawings/*`, `alerts`, `regions`, `news`, `context`, `graph`, `game-theory/impact`, `stream`, `sources/health`) sind **separater GeoMap-CRUD/Analytics/Streaming-Backlog** und nicht Teil des UIL-Candidate-Cutovers.

| # | Task | Aufwand | Abhaengigkeit |
|---|---|---|---|
| 1 | Shell-Refactor: Zustand Store + Domain-Slices | 3-5 Tage | Keine (Blocker fuer alles andere) |
| 2 | Seed-Dataset: 30-50 Events, 200 Candidates, 10 Contradictions | 2-3 Tage | Nach #1 (braucht funktionierenden Flow) |
| 3 | Keyboard Shortcuts (M, L, P, T, Delete, Ctrl+Z/Shift+Z, R) | 2 Tage | Nach #1 (braucht Command-Stack im Store) |
| 4 | Explain-Why `reason` String pro Candidate | 0.5 Tage | Keine |
| 5 | Contradiction Tracking (explizit, Sek. 35.2) | 2-3 Tage | Nach #2 (braucht Test-Daten) |

### Sprint 2: Operability + UX (v1.1-beta)

| # | Task | Aufwand | Abhaengigkeit |
|---|---|---|---|
| 6 | Export: JSON + PNG/PDF Snapshot | 2 Tage | Keine |
| 7 | Canvas Hybrid Rendering (Stufe 1, Sek. 35.4) | 2-3 Tage | Keine (parallel moeglich) |
| 8 | Alerting UI: Thresholds, Cooldowns, Explain-Why | 3 Tage | Nach #4 |
| 9 | Asset-Link UI: Relation Dropdown, Weight Slider, Impact Horizon | 2 Tage | Keine |
| 10 | Confidence Decay + regelbasierte Status-Transitions | 1-2 Tage | Nach #2 |

### Sprint 3: Quality + Collaboration Prep (v1.1)

| # | Task | Aufwand | Abhaengigkeit |
|---|---|---|---|
| 11 | E2E Tests: Create Marker → Sources → Accept Candidate → Timeline → Archive | 3-4 Tage | Nach #2 |
| 12 | Evaluation Harness: Accept/Reject Rate, Dedup Rate, Time-to-Confirm | 2 Tage | Nach #11 |
| 13 | Evidence Bundle: SHA256 Hash + Terms-Aware Storage | 1-2 Tage | Keine |
| 14 | a11y Pass: aria-Labels, Focus Management, Screen Reader | 2 Tage | Nach #1 |
| 15 | CRDT Vorbereitung: Yjs Y.Map Integration auf Zustand Store | 3-4 Tage | Nach #1 (Shell-Refactor Pflicht) |

### Danach (v2):

- deck.gl Integration (Rendering Stufe 2)
- Entity Graph (in-memory, TypeScript)
- JSON Rules Engine (Policy-as-Code)
- Briefing Mode Export
- User Mute Profiles + Delivery Channels
- Access Control (Rollen)
- CRDT Live-Collaboration (y-websocket Server)

### Danach (v3 / Rust-Phase):

- h3o Spatial Indexing (Rust, Backend)
- LSTM Regime Detection pro Region (Rust, tch-rs)
- Transformer Severity-Klassifikation (Rust, tch-rs)
- Calibrated Confidence + Active Learning
- petgraph Entity Graph (Rust, >10k Nodes)
- Optional: Automerge-rs fuer Backend-State

---

## 37. Document changelog

| Datum | Version | Aenderungen |
|---|---|---|
| 2026-02-14 | 1.0-draft | Initial Blueprint erstellt. Alle Milestones als [x] markiert (Planungs-Perspektive) |
| 2026-02-18 | 1.0-beta | **Code-Audit durchgefuehrt:** Milestones korrigiert (ehrliche [x]/[~]/[ ] Markierungen basierend auf tatsaechlichem Code). Neue Sektion 25a (Ist-Zustand Audit) eingefuegt. Execution Checklist (Sek. 30) korrigiert. Open Questions (Sek. 28) und Proposed Defaults (Sek. 29) mit Implementierungsstatus annotiert. Milestone F (offene Punkte) hinzugefuegt. Version von 1.0 auf 1.0-beta geaendert |
| 2026-02-19 | 1.0-beta+ | **SOTA-Erweiterungen Backlog** (Sek. 35) mit 13 Sub-Sektionen. Rendering-Tiefenanalyse + CRDT-Evaluation + Rust h3o. **Feedback-Driven Review System** (Sek. 5.4) ersetzt binaeres Accept/Reject durch granulare Signal/Noise/Uncertain Taxonomie + strukturierte Override-Erklaerungen + Collaborative Voting (3-5 User). `GeoCandidate` Type (Sek. 13.2) erweitert um `systemClassification`, `systemReason`, `GeoAnalystFeedback[]`. API-Endpoints (Sek. 14.1) erweitert um `/review`, `/feedback/metrics`, `/feedback/disagreements`. Evaluation Harness (Sek. 35.6) auf neue Metriken umgestellt (System Precision/Recall, Override Rate, Cohen's Kappa). Training-Pipeline referenziert in Advanced-architecture-for-the-future.md Sek. 4.3-4.7 |
| 2026-02-19 | 1.0-beta++ | **Source Appendix massiv erweitert:** Sek. 31.5-31.9 ueberarbeitet. Neue Sektionen: 31.6 (Zentralbank Balance Sheets + APIs: Fed/ECB/BoE/BoJ/SNB/PBoC/RBI/BCB/BoR + BIS + TradingEconomics + Community Wrapper Rust/Python/R + US-Wirtschaftsdaten-APIs: NY Fed, BLS, BEA, Treasury, FDIC, SEC EDGAR), 31.7 (On-Chain/Crypto: Arkham Intelligence + inoffizielle API), 31.8 (investing.com inoffiziell). **3 neue SOTA-Sektionen:** 35.13 (Zentralbank-Layer als Filter: QE/QT, Rate Decisions, Reserve-Kaeufe, Balance Sheet Trend), 35.14 (Event Modal UX: Mini + Detail-Modal), 35.15 (Copy/Paste News Import fuer API-lose Quellen + Paperwatcher-Integration). Ehem. 35.13 Security → 35.16. Sprint 2 um Tasks 10a/10b/10c ergaenzt. v2-Backlog erweitert um Zentralbank Balance Sheet Layer + Paperwatcher Extraction |

| 2026-02-19 | 1.0-beta+++ | **Sek. 35.15 (Copy/Paste)** migriert zu Top-Level Feature in neuer [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md). Copy/Paste ist nicht mehr GeoMap-spezifisch -- LLM bestimmt Routing (geo/macro/trading/research). Geo-gerouteter Content erscheint weiterhin als GeoCandidate |

| 2026-02-19 | 1.0-beta++++ | **project_audit2.md archiviert.** Offene Items extrahiert: Sek. 18.1 (Soft-Signal Ausbaustufen aus audit2 Kap. 7), 25a Infrastruktur-Luecken (aus audit2 Sek. 8.5: ACLED Credentials, LLM-Summary-Gap, localStorage Persistence, Zombie-Processes). Tabelle "Was der Plan beschreibt aber nicht existiert" um NLP/Reddit-Vermerke ergaenzt |

| 2026-02-21 | 1.1-beta | **Sek. 12.4 Behavioral Analysis Quellen (A-G):** Earnings Call Provider (EarningsCall.biz, Quartr, FMP, EarningsAPI, Seeking Alpha) mit Preisen/APIs/Bewertung. SEC EDGAR MD&A/S-1/DEF14A mit `edgartools` Code-Beispiel. GDELT erweiterte Nutzung (GKG Tone, Persons, Orgs, BigQuery) mit Python-Code. Zentralbank-Reden (BIS, FedBot, ECBSppechtag, Audio-Workflow). Parlamente (Hansard, Congressional Record, C-SPAN). IPO Roadshow. Knowledge Base YouTube-Kanaele (Chase Hughes, Behavior Panel, Derek Van Schaik, Body Language Ghost, Observe). Integrations-Reihenfolge v2.0→v3+. WhisperX Empfehlung fuer Speaker Diarization. Cross-Referenz zu [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) |

### Naechste geplante Plan-Updates

- Nach Shell-Refactoring: Milestone F + Sek. 35.9 (CRDT-Readiness) aktualisieren
- Nach erstem Seed-Datensatz: Daten-Ist-Zustand + Sek. 35.6 (Golden Set) aktualisieren
- Nach Canvas-Hybrid-Migration: Sek. 35.4 Stufe 1 als erledigt markieren
- Nach Test-Suite: Engineering Checklist aktualisieren
- Nach v2-Features (Timeline Playback, Exports, Advanced Filters): Milestone E aktualisieren
- Nach Rust h3o Integration: Sek. 35.4 Stufe 3 + RUST_LANGUAGE_IMPLEMENTATION.md Sek. 13 aktualisieren
