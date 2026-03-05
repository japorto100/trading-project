# Claim Verification Architecture -- Decomposer, Verifier, Belief-State

> **Stand:** 5. März 2026
> **Zweck:** Definiert die Claim→Subclaim-Pipeline fuer geopolitische Narrative, News und Analystenberichte. Basiert auf Decomposition-Alignment-Prinzipien: Reasoning so strukturieren, dass der Verifier optimal arbeiten kann.
> **Referenz-Dokumente:** [`AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) (Extractor, Verifier, Guard, Synthesizer), [`MEMORY_ARCHITECTURE.md`](./MEMORY_ARCHITECTURE.md) (KG, Episodic, Vector), [`CONTEXT_ENGINEERING.md`](./CONTEXT_ENGINEERING.md) (Retrieval-Policies)
> **Primaer betroffen:** Python-Backend (Agent-Pipeline), Go-Backend (Fetching), Frontend (GeoMap Belief Overlays)

---

## Forschungsgrundlage (Paper-URLs)

| Paper | URL | Relevanz |
|-------|-----|----------|
| **Distill and Align Decomposition for Enhanced Claim Verification** | [arXiv:2602.21857](https://arxiv.org/abs/2602.21857) | Kern-Prinzip: Joint Optimization Decomposer+Verifier, 8B SOTA durch Alignment, GRPO |
| **ImpRIF: Stronger Implicit Reasoning Leads to Better Complex Instruction Following** | [arXiv:2602.21228](https://arxiv.org/html/2602.21228v1) | ERG (Verifiable Reasoning Graphs), implizites Reasoning für komplexe Constraints; relevant für Decomposer-Prompt-Design und strukturierte Subclaim-Analyse. **Code noch nicht released – monitoren ob Code erscheint.** |
| **The Alignment Bottleneck in Decomposition-Based Claim Verification** | [arXiv:2602.10380](https://arxiv.org/abs/2602.10380) | Evidenz muss granular und subclaim-aligned sein; Claim-Level-Evidenz verschlechtert oft Performance |
| **Optimizing Decomposition for Optimal Claim Verification** (ACL 2025) | [ACL Anthology](https://aclanthology.org/2025.acl-long.254/) | Dynamic Decomposition: nur zerlegen wenn Verifier-Konfidenz niedrig; 63.8% weniger Compute, 9.7% bessere Accuracy |
| **Thucy: Multi-Agent Claim Verification across Relational Databases** | [arXiv:2512.03278](https://arxiv.org/abs/2512.03278) | 94.3% auf TabFact; relevant fuer strukturierte DB-Quellen (Marktdaten, Kalender) |

---

## 1. Kernprinzip

> **Reasoning ist ein Interface-Design-Problem.** Nicht mehr Daten oder groessere Modelle, sondern: *Wie muss Denken strukturiert sein, damit andere Systeme damit arbeiten koennen?*

Der Decomposer produziert Subclaims so, dass der Verifier sie optimal pruefen kann. Das Paper [2602.21857](https://arxiv.org/abs/2602.21857) zeigt: Struktur > Modellgroesse.

---

## 2. Pipeline-Ueberblick

```
Claim (News / Analyst / Gov Statement)
    │
    ▼
┌─────────────────────────────────────┐
│  DECOMPOSER                         │  Makroclaim → atomare Subclaims
│  LLM + striktes JSON-Schema        │  Subclaim-Taxonomie (Event, Intent, ...)
└──────────────┬──────────────────────┘
               │ Subclaims (atomar, prüfbar)
               ▼
┌─────────────────────────────────────┐
│  RETRIEVAL (multi-channel)          │  News, KG, Market, Prediction Markets
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  VERIFIER                           │  Stance (supported/contradicted/insufficient)
│  LLM Judge + NLI + Rules            │  Evidenz-Qualitaet, Temporalitaet
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  GUARD (Bayesian Aggregation)        │  p_true, Belief-State-Zeitreihe
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  MARKET IMPACT LAYER                │  Asset-Exposure, Szenarien
└─────────────────────────────────────┘
```

---

## 3. Subclaim-Taxonomie (Geo/Markets)

| Typ | Beschreibung | Beispiel |
|-----|--------------|----------|
| **Event** | Etwas ist passiert | "Explosion in X", "Sanctions announced" |
| **Capability/Capacity** | Faehigkeit/Bestand | "Country X has deployed Y units" |
| **Intent** | Absicht/Plan (immer heikel) | "X intends to invade" → meist *insufficient* |
| **Policy/Decision** | Offizieller Entscheid | "Rate hike announced", "Export controls" |
| **Movement/Logistics** | Truppen, Schiffe, Shipping | Bewegungen, Verlegungen |
| **Economic/Financial** | CPI, PMI, Auctions | Makro-Daten |
| **Market Observation** | Preis, Vol, Skew, Flows | Beobachtbare Marktdaten |
| **Narrative/Sentiment** | Diskursverschiebung | Sentiment-Shift |
| **Forecast/Probability** | Prediction Markets | Implied probs |
| **Attribution** | Wer war's? (immer unsicher) | Zuschreibung |

**Wichtig:** Intent/Attribution nie wie Event behandeln. Verhindert "LLM halluziniert certainty"-Fehler.

---

### 3a. ImpRIF-Prompt-Patterns für Decomposer (konzeptionell)

ImpRIF ([arXiv:2602.21228](https://arxiv.org/html/2602.21228v1)) formalisiert Instruktionen als Verifiable Reasoning Graphs (ERG). Ohne Code nutzbar als Prompt-Vorbild:

**ERG-Node-Typen → Mapping auf Subclaim-Taxonomie:**

| ImpRIF-Node | Unser Typ | Beispiel |
|-------------|-----------|----------|
| *conditional* | Intent, Attribution | Boolean-Checks, Branching |
| *mathematical* | Economic/Financial, Market Observation | Arithmetik, numerische Vergleiche |
| *knowledge* | Event, Capability, Policy | Fakten, Konzept-Disambiguierung |

**Konkrete Prompt-Phrasen für Decomposer:**
- „Analysiere zuerst alle versteckten Bedingungen dieser Claim-Struktur, bevor du zerlegst.“
- „Traverse Abhängigkeiten von root zu leaf – jeder Subclaim baut auf seinem Parent auf.“
- „Prüfe vor der Ausgabe: Sind alle Constraints koordiniert? Kein Subset vergessen.“

> **Hinweis:** ImpRIF-Code noch nicht released – monitoren ob Code erscheint. Nutzung rein konzeptionell für Prompt-Design.

---

## 4. Anschluss an bestehende Architektur

- **Verifier (AGENT_ARCHITECTURE Sek. 2):** BTE-Verifier prueft Extraktionen. Claim-Verifier prueft Subclaims. Beide nutzen denselben Guard-Pattern.
- **KG (MEMORY_ARCHITECTURE):** Subclaims, Evidence, Belief-States als KG-Nodes oder Episodic-Eintraege.
- **UIL:** News, Gov, Research als Ingestion-Quellen fuer Claim-Detection.

---

## 5. MVP vs. SOTA

| Phase | Ansatz | Aufwand |
|-------|--------|---------|
| **MVP** | Prompt-guided Decomposition, Verifier-Feedback-Loop, Best-of-N | Wochen |
| **SOTA** | RL/GRPO-trainierter Decomposer (Paper 2602.21857) | Monate, wenn Modell released |

**Stand:** Das 8B-Modell aus dem Paper ist (Stand Maerz 2026) nicht auf Hugging Face verfuegbar. Prompt-basierte Loesung ist ausreichend fuer den Start.

---

## 6. Offene Fragen

- JSON-Schema fuer Claim/Subclaim/Evidence/Belief (Detail-Spec)
- Integration in PlanStep (pipeline: `claim_verification`)
- Dynamic Decomposition: wann zerlegen, wann direkt verifizieren?
