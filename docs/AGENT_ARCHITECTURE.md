# Agent Architecture -- Strukturierte KI-Workflows fuer TradeView Fusion

> **Stand:** 22. Februar 2026
> **Zweck:** Definiert die Agent-Rollen, deterministische Guards, Orchestration-Layer, heterogene LLM-Architektur und Workflow-Patterns fuer alle KI-gestuetzten Analysen im Projekt. Gilt fuer Soft-Signal-Pipeline, Behavioral Text Analysis, Speech Analysis, Multi-Agent-Orchestration und zukuenftige multimodale Erweiterungen.
> **Status:** Architektur-Leitlinie. Erste Anwendung in der Soft-Signal-Pipeline (GeoMap), vollstaendig erst mit UIL Phase 7+. Sek. 12-17 (Orchestration, heterogene LLMs, Agent Registry) sind Design-Leitlinien fuer Phase 7b+.
> **Buch-Referenzen:**
> - "The Behavior Ops Manual" (Chase Hughes, 2022) -- BTE (Behavioral Table of Elements), DRS (Deception Rating Scale), Needs Map, Decision Map, Linguistic Harvesting
> - "Emotion and Facial Recognition in AI" (Slimani et al., Springer 2026) -- Multimodal Fusion, XAI, Adversarial Robustness, Human-in-the-Loop
> **Forschungs-Referenzen (Multi-Agent-Systeme, 2025-2026):**
> - X-MAS: Towards Building Multi-Agent Systems with Heterogeneous LLMs ([arXiv:2505.16997](https://arxiv.org/abs/2505.16997)) -- Heterogene Modellmischung erhoet MAS-Leistung
> - CooperBench: Why Coding Agents Cannot be Your Teammates Yet ([arXiv:2601.13295](https://arxiv.org/abs/2601.13295)) -- Koordinationsfehler in MAS, "Curse of Coordination"
> - Multi-Agent Teams Hold Experts Back ([arXiv:2602.01011](https://arxiv.org/html/2602.01011v1)) -- Expertise-Underutilization, Integrative Compromise
> - Guided Collaboration in Heterogeneous LLM-Based MAS ([arXiv:2602.13639](https://arxiv.org/abs/2602.13639)) -- Negative Synergy Effect, adaptive Fuehrung + RAG-Erfahrungsspeicher
> - Anthropic: Building Effective Agents (2024/2026) -- Router, Orchestrator-Workers, Evaluator-Optimizer, Prompt Chaining
> - AdaptOrch (2026, [arXiv:2602.16873](https://arxiv.org/pdf/2602.16873)) -- Topologie-bewusste Orchestration: 12-23% Verbesserung gegenueber statischen Baselines
> **Primaer betroffen:** Python-Backend (LLM-Pipeline, Sentiment, Speech, Agent Registry), Go-Backend (Fetching, SSE-Router), Frontend (Dashboard, Agent Builder UI)

---

## Inhaltsverzeichnis

**Teil I: Pipeline-Agenten (Sek. 1-11)**

1. [Warum Agent-Architektur statt Single-LLM](#1-warum-agent-architektur-statt-single-llm)
2. [Die vier Agent-Rollen](#2-die-vier-agent-rollen)
3. [Deterministische Guards -- Regel-Engines](#3-deterministische-guards--regel-engines)
4. [Behavioral Text Analysis (BTE/DRS)](#4-behavioral-text-analysis-btedrs) (inkl. 4.4 Behavioral State Machine -- Markov Chain)
5. [Speech und Audio Analysis (Stimmanalyse)](#5-speech-und-audio-analysis-stimmanalyse)
6. [Multimodales Analyse-Dashboard](#6-multimodales-analyse-dashboard)
7. [Anwendungsfall: Earnings Calls und Zentralbank-Reden](#7-anwendungsfall-earnings-calls-und-zentralbank-reden)
8. [Profiling: Needs Map und Decision Map](#8-profiling-needs-map-und-decision-map)
9. [Datenquellen fuer die Behavioral Analysis Pipeline](#9-datenquellen-fuer-die-behavioral-analysis-pipeline)
10. [Live Multimodal Dashboard -- Full-Stack-Architektur](#10-live-multimodal-dashboard--full-stack-architektur)
11. [Verbindung zu bestehender Architektur (Teil I)](#11-verbindung-zu-bestehender-architektur)

**Teil II: Orchestration und Multi-Agent-System (Sek. 12-17)**

12. [Orchestration Layer -- Router, Planner, Orchestrator](#12-orchestration-layer--router-planner-orchestrator)
13. [Erweiterte Agent-Rollen -- Research, Synthesizer+, Evaluator, Monitor](#13-erweiterte-agent-rollen--research-synthesizer-evaluator-monitor)
14. [Heterogene LLM-Architektur -- Modell-Auswahl pro Rolle](#14-heterogene-llm-architektur--modell-auswahl-pro-rolle)
15. [Agent Registry und Tool System](#15-agent-registry-und-tool-system)
16. [User-Defined Agents -- Frontend und Backend](#16-user-defined-agents--frontend-und-backend)
17. [Verbindung zu bestehender Architektur (Teil II)](#17-verbindung-zu-bestehender-architektur-teil-ii)

---

## 1. Warum Agent-Architektur statt Single-LLM

> **Problem:** Ein einzelnes LLM ist fuer High-Stakes-Analysen (Trading-Signale, Deception Detection, Sentiment Scoring) unzuverlaessig:
> - **Halluzinationen:** LLMs erfinden Marker die nicht im Text stehen
> - **Mathematische Schwaeche:** LLMs koennen nicht zuverlaessig Punkte summieren oder Schwellwerte pruefen
> - **Black Box:** Keine Erklaerung warum ein Score so ausgefallen ist
> - **Keine Reproduzierbarkeit:** Gleicher Input → unterschiedlicher Output bei jedem Run

> **Loesung:** Strukturierter Multi-Agent-Workflow mit klarer Rollentrennung. Das LLM macht was es gut kann (Sprachmuster erkennen), deterministische Code-Module machen was sie gut koennen (zaehlen, summieren, Schwellwerte pruefen).

> **Buch-Referenz (Emotion AI):** "Deep-Learning-Modelle agieren oft als Black Box [...] fuer Entscheidungen mit hoher Tragweite muessen sie durch erklärbare und regelbasierte Systeme (Explainable AI - XAI) ergaenzt werden." Hybrid-Systeme (gelernte KI + handgemachte Regeln) liefern "eine wesentlich vollstaendigere und genauere Repraesentation".

---

## 2. Die vier Agent-Rollen

Jeder KI-Workflow im Projekt folgt demselben Vier-Rollen-Pattern:

```
Input (Text / Audio / Transcript)
    │
    ▼
┌─────────────────────────────────────┐
│  1. EXTRACTOR AGENT (LLM-basiert)   │  "Was steht im Text?"
│     Erkennt Muster, extrahiert      │
│     Marker, klassifiziert Segmente  │
└──────────────┬──────────────────────┘
               │ Strukturierter Output (JSON)
               ▼
┌─────────────────────────────────────┐
│  2. VERIFIER AGENT (LLM + Regeln)   │  "Stimmt das wirklich?"
│     Prueft Extraktionen gegen       │
│     Kontext, eliminiert False       │
│     Positives, fordert Erklaerung   │
└──────────────┬──────────────────────┘
               │ Verifizierte Marker (JSON)
               ▼
┌─────────────────────────────────────┐
│  3. DETERMINISTIC GUARD (Code-only) │  "Was sagen die Regeln?"
│     Kein LLM. Reine Regel-Engine.   │
│     Summiert Scores, prueft         │
│     Schwellwerte, berechnet         │
│     Konfidenz deterministisch       │
└──────────────┬──────────────────────┘
               │ Scores + Flags (JSON)
               ▼
┌─────────────────────────────────────┐
│  4. SYNTHESIZER AGENT (LLM-basiert) │  "Was bedeutet das fuer den User?"
│     Uebersetzt Scores in lesbare    │
│     Erklaerungen, priorisiert       │
│     Findings, generiert Alerts      │
└──────────────┬──────────────────────┘
               │
               ▼
Output: Score + Explanation + Evidence + Confidence
```

### Rollen-Spezifikation

| Rolle | Technologie | Darf LLM nutzen? | Darf Scoring aendern? | Fehler-Modus |
|---|---|---|---|---|
| **Extractor** | LLM (Ollama/FinGPT/GPT-4o-mini) | Ja | Nein (nur Marker extrahieren) | False Positives werden vom Verifier gefangen |
| **Verifier** | LLM + regelbasierte Pruefungen | Ja (fuer Kontext-Check) | Nein (nur accept/reject pro Marker) | Conservative: im Zweifel reject |
| **Deterministic Guard** | Python / Rust (kein LLM) | **Nein** | **Ja** (einzige Instanz die Scores berechnet) | Deterministisch, reproduzierbar, testbar |
| **Synthesizer** | LLM | Ja | Nein (nur den Guard-Output in Sprache uebersetzen) | Halluzination im Text, aber Score bleibt korrekt |

### Warum der Guard kein LLM nutzen darf

Der Deterministic Guard ist das Herzstueck der Architektur. Er ist:
- **Unit-testbar:** Gleicher Input → garantiert gleicher Output
- **Auditierbar:** Jede Score-Berechnung kann nachvollzogen werden
- **Nicht manipulierbar:** Kein Prompt Injection kann den Score aendern
- **Schnell:** Mikrosekunden statt Sekunden

```python
class DeterministicGuard(Protocol):
    def calculate_score(self, verified_markers: list[VerifiedMarker]) -> GuardResult: ...

@dataclass
class GuardResult:
    total_score: float
    threshold_exceeded: bool
    breakdown: dict[str, float]    # Marker-ID → Punkte
    confidence: float              # 0.0 - 1.0
    flags: list[str]               # z.B. ["DECEPTION_LIKELY", "CROSS_MODAL_INCONSISTENCY"]
```

---

## 3. Deterministische Guards -- Regel-Engines

Guards sind austauschbare Module. Jeder Analyse-Typ hat seinen eigenen Guard:

| Guard | Input | Regelwerk | Schwellwert | Output |
|---|---|---|---|---|
| **DRS Guard** (Deception) | BTE-Marker aus Text | DRS-Punktesystem (Chase Hughes) | >= 11 DRS-Punkte pro Behavioral Group | `DECEPTION_LIKELY` / `STRESS_INDICATED` / `CLEAN` |
| **Sentiment Guard** | Sentiment-Scores von N Modellen | Ensemble-Konsistenz | Wenn >50% der Modelle disagreeen → Flag | `CONSISTENT` / `DIVERGENT` / `INSUFFICIENT_DATA` |
| **Cross-Modal Guard** | Text-Score + Audio-Score (+ opt. Video) | Modalitaets-Uebereinstimmung | Wenn Text "positiv" aber Audio "stressed" → Flag | `CONSISTENT` / `INCONSISTENT` + Erklaerung |
| **Bias Guard** | Source-Metadaten | Source-Bias-Profile (GeoMap Sek. 11.4) | Same-Bias-Klasse zaehlt nur 1x | Adjustierter Confidence-Score |
| **Threshold Guard** | Beliebiger Candidate | Double-Threshold (UIL Sek. 5) | High → Auto-Route, Mid → Human Review, Low → Reject | Routing-Entscheidung |

### Guard-Komposition

Guards koennen sequentiell oder parallel geschaltet werden:

```
Extractor Output
    │
    ├──→ DRS Guard ──────────→ Deception Score
    │
    ├──→ Sentiment Guard ────→ Sentiment Score
    │
    ├──→ Bias Guard ─────────→ Adjusted Confidence
    │
    └──→ Cross-Modal Guard ──→ Consistency Check
              │
              ▼
         Meta-Guard: Aggregiert alle Guard-Outputs
              │
              ▼
         Final Score + Routing Decision
```

---

## 4. Behavioral Text Analysis (BTE/DRS)

> **Buch-Referenz:** "The Behavior Ops Manual" (Chase Hughes), Section 04: "The Behavioral Table of Elements (BTE)". Das BTE ist ein quantitatives System das menschliches Verhalten in messbare, universal verstaendliche Marker zerlegt. Die Deception Rating Scale (DRS) weist jedem Marker exakte Punktwerte zu. Taeuschung oder extremer Stress gelten als wahrscheinlich ab **11+ DRS-Punkten** in einer Behavioral Group.

### 4.1 Linguistische Marker (Text-extrahierbar)

| BTE Code | Marker | DRS Punkte | Beschreibung | LLM-Extraktion |
|---|---|---|---|---|
| **113 Prn** | Pronoun Absence | 4.0 | Fehlende Subjekt-Pronomen ("went to the meeting" statt "I went to the meeting"). Kognitive Last bei Taeuschung fuehrt zum Weglassen | Pattern Matching + LLM-Kontext |
| **114 Res** | Resume Statement | 4.0 | Eigenlob statt Antwort auf die Frage ("I have 20 years of experience in this industry" als Antwort auf eine Konkretisierungsfrage) | LLM prueft ob Antwort die Frage beantwortet |
| **115 Ne** | Non-Contracting | 4.0 | "did not" statt "didn't", "could not" statt "couldn't" -- bewusste Betonung der Verneinung | **Deterministisch** pruefbar: Regex auf Langformen |
| **116 Qr** | Question Reversal | 4.0 | Gegenfrage statt Antwort ("Why would you even ask that?") -- Ablenkung/Angriff | LLM-Satztyp-Erkennung |
| **117 Am** | Ambiguity Statement | 4.0 | Vage Antwort die nichts Konkretes sagt ("We're exploring various strategic options") | LLM + Kontext der Frage |
| **118 Pol** | Politeness Shift | 2.0-4.0 | Ploetzlicher Wechsel von casual zu formal oder umgekehrt im selben Gespraech | LLM-Stilwechsel-Detection |
| **119** | Over-Apologizing | 2.0-3.0 | Uebermaessiges Entschuldigen ohne klaren Grund | LLM-Frequenz-Analyse |
| **Chronology** | Chronology Statement | 4.0 | Perfekt chronologische Wiedergabe von Ereignissen (einstudiert wirkend) | LLM-Struktur-Analyse |

### 4.2 DRS Guard Implementation

```python
from dataclasses import dataclass
from enum import Enum

class DeceptionLevel(Enum):
    CLEAN = "clean"                    # DRS < 8
    ELEVATED = "elevated"              # DRS 8-10
    DECEPTION_LIKELY = "deception_likely"  # DRS >= 11

@dataclass
class BTEMarker:
    code: str          # "113_Prn", "115_Ne", etc.
    drs_points: float  # 4.0, 2.0, etc.
    evidence: str      # Exaktes Zitat aus dem Text
    position: int      # Zeichenposition im Transcript
    verified: bool     # Vom Verifier bestaetigt?

class DRSGuard:
    THRESHOLD_ELEVATED = 8.0
    THRESHOLD_DECEPTION = 11.0

    # Hughes: Bei konfrontativer Interview-Situation Punkte reduzieren
    INTERVIEWER_CONFRONTATION_PENALTY_4 = 2.0  # Abzug fuer 4.0-Marker
    INTERVIEWER_CONFRONTATION_PENALTY_3 = 1.0  # Abzug fuer 3.0-3.5-Marker

    def calculate(self, markers: list[BTEMarker],
                  confrontational_context: bool = False) -> GuardResult:
        verified = [m for m in markers if m.verified]
        total = 0.0
        breakdown = {}

        for m in verified:
            points = m.drs_points
            if confrontational_context:
                if points >= 4.0:
                    points -= self.INTERVIEWER_CONFRONTATION_PENALTY_4
                elif points >= 3.0:
                    points -= self.INTERVIEWER_CONFRONTATION_PENALTY_3
            breakdown[m.code] = points
            total += max(points, 0)

        if total >= self.THRESHOLD_DECEPTION:
            level = DeceptionLevel.DECEPTION_LIKELY
        elif total >= self.THRESHOLD_ELEVATED:
            level = DeceptionLevel.ELEVATED
        else:
            level = DeceptionLevel.CLEAN

        return GuardResult(
            total_score=total,
            threshold_exceeded=(total >= self.THRESHOLD_DECEPTION),
            breakdown=breakdown,
            confidence=min(total / 20.0, 1.0),
            flags=[level.value]
        )
```

> **Wichtig (aus dem Buch):** Der DRS-Score muss im Kontext interpretiert werden. Wenn der Interviewer/Analyst konfrontativ war, muessen die Punkte reduziert werden (4.0-Marker: -2, 3.x-Marker: -1). Ausserdem: "Even people who tend to use many of these 'deception indicators' in their normal speech won't score above 11" -- die Schwelle ist bewusst so gewaehlt dass normaler Sprachgebrauch nicht drueber kommt.

### 4.3 Non-Contracting Marker: Deterministisch ohne LLM

Marker 115 (Non-Contracting) ist ein Beispiel fuer einen Marker der komplett ohne LLM geprueft werden kann:

```python
import re

NON_CONTRACTING_PATTERNS = [
    (r'\bdid not\b', "didn't"),
    (r'\bcould not\b', "couldn't"),
    (r'\bwould not\b', "wouldn't"),
    (r'\bshould not\b', "shouldn't"),
    (r'\bwas not\b', "wasn't"),
    (r'\bwere not\b', "weren't"),
    (r'\bhave not\b', "haven't"),
    (r'\bhas not\b', "hasn't"),
    (r'\bdo not\b', "don't"),
    (r'\bis not\b', "isn't"),
    (r'\bcannot\b', "can't"),
    (r'\bwill not\b', "won't"),
]

def detect_non_contracting(text: str) -> list[BTEMarker]:
    markers = []
    for pattern, contraction in NON_CONTRACTING_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            markers.append(BTEMarker(
                code="115_Ne",
                drs_points=4.0,
                evidence=text[max(0,match.start()-30):match.end()+30],
                position=match.start(),
                verified=True,  # deterministisch = automatisch verifiziert
            ))
    return markers
```

### 4.4 Behavioral State Machine -- Markov Chain auf Earnings Calls

> **Konzept:** Waehrend eines Earnings Calls oder einer Pressekonferenz durchlaeuft ein Speaker verschiedene Verhaltenszustaende. Diese Uebergaenge koennen als Markov Chain modelliert werden. Statt nur am Ende einen DRS-Gesamtscore zu haben, tracken wir den **Verlauf** der Zustandsuebergaenge ueber den Call hinweg.
> **Querverweise:** [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 5q (Markov Chain Patterns allgemein), [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 35.3a (Event Escalation Chain)

**Behavioral States:**

```
S = { Transparent, Guarded, Defensive, Evasive, Aggressive }
```

| State | DRS-Bereich | Beschreibung | Typische Marker |
|---|---|---|---|
| **Transparent** | 0-3 | Offene, direkte Antworten. Nutzt "I/we", konkrete Zahlen, Contractions | Keine BTE-Marker |
| **Guarded** | 4-7 | Vorsichtiger, weniger spezifisch. Erste Ambiguitaet | 117_Am (Ambiguity), 118_Pol (Politeness Shift) |
| **Defensive** | 8-10 | Aktiv ausweichend. Non-Contracting, Pronoun-Shifts | 115_Ne, 113_Prn, 114_Res (Resume) |
| **Evasive** | 11-15 | DRS-Schwelle ueberschritten. Gegenfragen, starke Ambiguitaet | 116_Qr (Question Reversal), multiple 117_Am |
| **Aggressive** | 8+ (speziell) | Angriff auf den Fragesteller, Frame-Challenges | 116_Qr + 118_Pol (Shift zu informal) |

**Transition-Matrix (gelernt aus historischen Earnings Calls):**

```
             To:  Trans  Guard  Defen  Evas   Aggr
From:
Transparent  [  0.70   0.22   0.05   0.02   0.01  ]
Guarded      [  0.25   0.45   0.20   0.08   0.02  ]
Defensive    [  0.05   0.15   0.50   0.25   0.05  ]
Evasive      [  0.02   0.08   0.20   0.60   0.10  ]
Aggressive   [  0.05   0.10   0.30   0.15   0.40  ]
```

*Beispiel-Werte. Echte Werte werden aus annotierten Earnings Call Transcripts gelernt.*

**Was das dem Trader sagt:**

| Signal | Berechnung | Bedeutung |
|---|---|---|
| **State-Transition-Anomalie** | Sprung Transparent → Evasive (skip Guarded/Defensive) | Ploetzliches Ausweichen bei einer bestimmten Frage -- diese Frage ist der Trigger |
| **Non-Return** | P(Defensive → Transparent) < 0.05 | Speaker kehrt nach defensivem Verhalten nicht zu Transparenz zurueck -- das Thema ist problematisch |
| **Escalation Pattern** | Sequenz Trans → Guard → Defen → Evas in < 5 Segmenten | Schnelle Eskalation -- der gesamte Themenbereich ist toxisch |
| **Recovery Pattern** | Evas → Guard → Trans | Speaker fand zu Transparenz zurueck -- vorige Defensive war situativ, nicht grundsaetzlich |
| **Aggressive Spike** | Aggressive State bei einer spezifischen Analyst-Frage | Analyst hat einen wunden Punkt getroffen |

**Implementierung (deterministisch -- kein LLM fuer State-Zuweisung):**

```python
class BehavioralStateChain:
    STATES = ["transparent", "guarded", "defensive", "evasive", "aggressive"]

    @staticmethod
    def classify_segment(drs_score: float, markers: list[BTEMarker]) -> str:
        has_qr = any(m.code == "116_Qr" for m in markers)
        has_pol_shift = any(m.code == "118_Pol" for m in markers)

        if has_qr and has_pol_shift and drs_score >= 8:
            return "aggressive"
        if drs_score >= 11:
            return "evasive"
        if drs_score >= 8:
            return "defensive"
        if drs_score >= 4:
            return "guarded"
        return "transparent"

    def track_call(self, segments: list[tuple[float, list[BTEMarker]]]) -> list[str]:
        """Trackt State-Verlauf ueber alle Segmente eines Calls."""
        return [self.classify_segment(drs, markers) for drs, markers in segments]

    def detect_anomalies(self, state_sequence: list[str]) -> list[dict]:
        anomalies = []
        for i in range(1, len(state_sequence)):
            prev_idx = self.STATES.index(state_sequence[i-1])
            curr_idx = self.STATES.index(state_sequence[i])
            jump = curr_idx - prev_idx
            if jump >= 2:  # Skip-Escalation
                anomalies.append({
                    "type": "skip_escalation",
                    "segment": i,
                    "from": state_sequence[i-1],
                    "to": state_sequence[i],
                    "severity": "high" if jump >= 3 else "medium"
                })
        return anomalies
```

**Dashboard-Integration (Sek. 6):** Die Behavioral State Chain wird als farbkodierte Linie im MarkerTimeline Panel dargestellt. Gruen (Transparent) → Gelb (Guarded) → Orange (Defensive) → Rot (Evasive) → Violett (Aggressive). Anomalien (Skip-Escalations) werden als blinkende Marker hervorgehoben.

---

## 5. Speech und Audio Analysis (Stimmanalyse)

> **Status:** Geplant (v3+). Setzt funktionierenden Text-Pfad (Sek. 4) voraus.
> **Buch-Referenz (Emotion AI):** "Recurrent neural networks (RNNs) and long short-term memory (LSTM) networks process sequential audio features, capturing temporal dynamics." CNN + LSTM Hybrid erreicht 90.6% Accuracy auf RAVDESS (Speech Emotion Recognition). Multimodale Fusion von Text + Audio ergibt signifikant hoehere Accuracy als jede Modalitaet allein.
> **Buch-Referenz (Behavior Ops):** Rapid speech rate, vocal tremor, pitch changes und Pausenmuster sind Stress-Indikatoren im BTE-System.

### 5.1 Audio-Quellen

| Quelle | Format | Verfuegbarkeit | Prioritaet |
|---|---|---|---|
| Earnings Call Recordings | Audio (MP3/WAV) | Via Provider-APIs oder Investor-Relations-Seiten | Hoch |
| Fed/EZB Pressekonferenzen | Video+Audio (YouTube, offizielle Streams) | Oeffentlich | Hoch |
| CEO-Interviews (CNBC, Bloomberg TV) | Video+Audio | Schwierig (Copyright) | Mittel |
| Politiker-Reden | Video+Audio (C-SPAN, Parlaments-Streams) | Oeffentlich | Mittel |

### 5.2 Modell-Optionen (Open Source, Stand Feb 2026)

| Modell | Task | Accuracy | Sprachen | Lizenz | HuggingFace |
|---|---|---|---|---|---|
| **Wav2Vec2-large-xlsr** (ehcalabres) | 8-Emotion Classification | 82.2% | EN | Open | ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition |
| **SpeechBrain Wav2Vec2-IEMOCAP** | Emotion Recognition | 78.7% | EN | Apache 2.0 | speechbrain/emotion-recognition-wav2vec2-IEMOCAP |
| **Wav2Vec2-base SER** (AventIQ) | 8-Emotion, lightweight | ~65% | EN | Open | AventIQ-AI/wav2vec2-base_speech_emotion_recognition |
| **Voice Stress Recognition** (forwarder1121) | Binary: stressed/not-stressed | ~76% | EN | Open | forwarder1121/voice-based-stress-recognition |
| **Whisper** (OpenAI) | Speech-to-Text (Transcription) | SOTA | 99+ Sprachen | MIT | openai/whisper-large-v3 |

### 5.3 Audio-Pipeline Architektur

```
Audio/Video Input (Earnings Call Recording)
    │
    ├──→ Whisper (Speech-to-Text) ──→ Transcript ──→ Text-Pipeline (Sek. 4)
    │
    └──→ Audio Feature Extraction
              │
              ├── Wav2Vec2 Emotion Model ──→ Emotion per Segment
              │     (angry, fearful, neutral, sad, happy, ...)
              │
              ├── Stress Detection Model ──→ Stress Score per Segment
              │     (stressed / not-stressed, confidence)
              │
              └── Prosody Features (deterministisch)
                    ├── Speech Rate (Woerter/Minute pro Segment)
                    ├── Pause Duration (laengste Pause, mittlere Pause)
                    ├── Pitch Varianz (F0 Standardabweichung)
                    └── Volume Changes (dB-Schwankungen)
              │
              ▼
         Audio Guard (Deterministic)
              │
              ├── Stress-Score > Threshold? → AUDIO_STRESS_FLAG
              ├── Emotion Shift mid-answer? → AUDIO_EMOTION_SHIFT
              ├── Speech Rate Anomalie? → AUDIO_RATE_ANOMALY
              └── Prosody-Pattern matches BTE-Marker? → AUDIO_BTE_MATCH
              │
              ▼
         Cross-Modal Guard (Sek. 3)
              → Vergleicht Text-DRS-Score mit Audio-Stress-Score
```

### 5.4 Prosody Features ohne ML

Einige Audio-Marker brauchen kein ML-Modell sondern sind reine Signalverarbeitung:

| Feature | Berechnung | Library | BTE-Relevanz |
|---|---|---|---|
| Speech Rate | `word_count / segment_duration` | Python stdlib | Rapid Speech = Stress (BTE) |
| Pause Duration | Silence detection (Amplitude < Threshold) | `pydub` / `librosa` | Lange Pauses vor Antwort = Cognitive Load |
| F0 (Grundfrequenz) | Pitch Tracking | `librosa.pyin()` | Pitch-Anstieg = Stress/Unsicherheit |
| Jitter/Shimmer | Stimm-Irregularitaet | `parselmouth` (Praat) | Vocal Tremor = Anxiety |

---

## 6. Multimodales Analyse-Dashboard

> **Konzept:** Ein spezialisiertes UI-Panel das bei der Analyse von Earnings Calls, Zentralbank-Reden oder Politiker-Statements alle Analyse-Kanaele simultan darstellt. Nicht fuer jeden User sichtbar -- ein Analyst-Tool hinter Feature-Flag.

### 6.1 Dashboard-Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  MULTIMODAL ANALYSIS: AAPL Q4 2026 Earnings Call - Tim Cook     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │ COMBINED SCORE   │  │ TRANSCRIPT (scrollbar, timestamped)  │  │
│  │                  │  │                                      │  │
│  │  Confidence: 72% │  │ [02:14] Cook: "We did not experience │  │
│  │  DRS: 8/20    ▲  │  │ any material supply chain issues..." │  │
│  │  Sentiment: +0.6 │  │         ^^^^^ 115_Ne (4.0 DRS) ◄──  │  │
│  │  Audio Stress: ▼  │  │                                      │  │
│  │  Consistency: ⚠   │  │ [02:31] Cook: "Went through every   │  │
│  │                  │  │ single metric with the team..."       │  │
│  │ [ELEVATED]       │  │         ^^^^ 113_Prn (4.0 DRS) ◄──  │  │
│  └─────────────────┘  │                                      │  │
│                        │ [03:45] Analyst: "Can you quantify   │  │
│  ┌─────────────────┐  │ the China exposure?"                  │  │
│  │ AUDIO TIMELINE   │  │                                      │  │
│  │ ─────●──────── │  │ [03:52] Cook: "That's a great        │  │
│  │ Stress: ▁▂▃█▃▂▁ │  │ question. Let me tell you about our  │  │
│  │ Pitch:  ▂▂▃▅▃▂▂ │  │ commitment to the region..."         │  │
│  │ Rate:   ▃▃▃▅▆▃▃ │  │         ^^^^ 116_Qr + 114_Res ◄──  │  │
│  │         ↑         │  │                                      │  │
│  │    Spike at 03:52 │  └──────────────────────────────────────┘  │
│  └─────────────────┘                                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ BTE MARKER TIMELINE                                          ││
│  │ 00:00  01:00  02:00  03:00  04:00  05:00  06:00  07:00     ││
│  │   ·      ·    ■Ne     ·    ■Qr+Res  ·      ·      ·       ││
│  │   ·      ·      ·    ■Prn    ·      ·      ·    ■Am       ││
│  │                      DRS: ━━━━━━━━━━━━━━━━━━━━━━            ││
│  │                             8pts  ↑12pts (!)                 ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ EXPLANATION (Synthesizer Agent Output)                        ││
│  │                                                              ││
│  │ "Tim Cook's response at 03:52 showed elevated deception      ││
│  │  markers: Question Reversal (avoided direct answer about      ││
│  │  China exposure) + Resume Statement (pivoted to 'commitment  ││
│  │  to the region'). Combined DRS reached 12 points at this     ││
│  │  segment. Audio stress indicators spiked simultaneously.     ││
│  │  This suggests the China question triggered defensive         ││
│  │  behavior. Cross-modal: TEXT-AUDIO INCONSISTENCY detected."  ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Dashboard-Komponenten (Frontend, React)

| Komponente | Daten-Quelle | Interaktivitaet |
|---|---|---|
| **Combined Score Panel** | Meta-Guard Output | Echtzeit-Update bei Segment-Wechsel |
| **Transcript Viewer** | Whisper STT + BTE-Marker Overlay | Klick auf Marker → springt zu Timestamp. Hover → zeigt DRS-Punkte |
| **Audio Timeline** | Prosody Features + Stress Model | Scrubbar. Sync mit Transcript. Spikes hervorgehoben |
| **BTE Marker Timeline** | DRS Guard Output | Zeitstrahl mit farbkodierten Markern (gelb < 11, rot >= 11) |
| **Explanation Panel** | Synthesizer Agent | Wird nach Analyse generiert. Nicht-interaktiv |

### 6.3 Feature-Flag und Zugang

- Feature-Flag: `FEATURE_MULTIMODAL_ANALYSIS=true` (default: false)
- Nur fuer Rolle `analyst` sichtbar (RBAC, [`AUTH_SECURITY.md`](./specs/AUTH_SECURITY.md) Sek. 2.3)
- Eigener API-Endpoint: `POST /api/v1/analyze/multimodal` (async, Job-Queue)
- Verarbeitung ist rechenintensiv (LLM + Audio-Modelle) → async mit Status-Polling

---

## 7. Anwendungsfall: Earnings Calls und Zentralbank-Reden

### 7.1 Earnings Call Pipeline

```
1. FETCHING (Go)
   └── Earnings Call Transcript von Provider holen
       (Financial Modeling Prep, Seeking Alpha, oder direkt von IR-Seite)
       Optional: Audio-Recording herunterladen

2. PREPROCESSING (Python)
   ├── Transcript: Speaker-Separation (CEO, CFO, Analyst Q&A)
   ├── Audio (wenn vorhanden): Whisper STT als Backup/Verification
   └── Audio: Segmentierung nach Speaker + Timestamp-Alignment

3. TEXT ANALYSIS (Agent-Workflow Sek. 2)
   ├── Extractor: BTE-Marker pro Speaker-Segment
   ├── Verifier: Kontext-Check (war die Frage konfrontativ? → DRS-Anpassung)
   ├── DRS Guard: Score pro Segment + Gesamt-Score
   └── Sentiment Guard: Sentiment pro Segment (FinBERT/FinGPT/etc.)

4. AUDIO ANALYSIS (wenn Audio vorhanden)
   ├── Emotion Model: Wav2Vec2 pro Segment
   ├── Stress Model: Binary stressed/not-stressed
   ├── Prosody: Speech Rate, Pauses, Pitch
   └── Audio Guard: Flags

5. CROSS-MODAL FUSION
   └── Cross-Modal Guard: Text-DRS vs Audio-Stress Konsistenz

6. OUTPUT
   ├── Per-Segment Scores (DRS, Sentiment, Stress, Consistency)
   ├── Gesamt-Score pro Speaker
   ├── Highlighted Transcript mit Marker-Overlay
   └── Synthesizer: Menschenlesbare Zusammenfassung
```

### 7.2 Zentralbank-Reden (Fed, EZB, BoJ)

Besonderheit: Zentralbanker verwenden bewusst ambige Sprache ("data-dependent", "appropriate adjustments"). Diese Ambiguitaet ist hier **normal**, nicht taeuschend.

**Loesung:** Eigenes Baseline-Profil fuer Zentralbank-Sprache:
- Non-Contracting bei Zentralbankern ist Standard (formeller Kontext) → DRS-Punkte reduzieren
- Ambiguity Statements sind erwartbar → nur flaggen wenn signifikant staerker als Baseline
- **Eigentlich wertvoll:** Abweichungen von der Baseline. Wenn Powell ploetzlich *weniger* ambig spricht als sonst, ist DAS das Signal

```python
CENTRAL_BANK_BASELINE = {
    "115_Ne": 0.0,   # Non-Contracting ist normal → 0 DRS
    "117_Am": 1.0,   # Ambiguity reduziert (erwartet) → nur 1.0 statt 4.0
    "118_Pol": 0.0,   # Formelle Sprache ist Baseline → 0 DRS
}
```

### 7.3 Politiker-Reden und Medienpropaganda

> **Buch-Referenz (Behavior Ops):** "Linguistic Harvesting" -- Analyse der verwendeten Adjektive und Pronomen um auf psychologische Grundbeduerfnisse (Needs Map) und Entscheidungsstrukturen (Decision Map) zu schliessen.

Zusaetzlich zu BTE/DRS sind hier kognitive Manipulations-Techniken relevant:

| Technik | BTE-Marker | Beschreibung | Erkennung |
|---|---|---|---|
| **Bandwagon Effect** | -- | "Everybody knows...", "Most people agree..." | LLM: Quantifier + Konsens-Behauptung ohne Quelle |
| **Illusory Truth** | -- | Wiederholung derselben Behauptung ueber Zeit | Deterministisch: Frequency Count ueber Zeitfenster |
| **Appeal to Authority** | 114 Res | Verweis auf Autoritaet statt Argument | LLM: Authority-Reference ohne sachlichen Zusammenhang |
| **Framing** | -- | Selektive Wortwahl die Interpretation lenkt | LLM: Vergleich neutrale vs. geladene Formulierung |
| **Deflection** | 116 Qr | Themenwechsel bei unbequemen Fragen | LLM: Topic-Shift Detection zwischen Frage und Antwort |

---

## 8. Profiling: Needs Map und Decision Map

> **Buch-Referenz:** "The Behavior Ops Manual", Sek. 05: "Profiling Human Behavior". Die Needs Map identifiziert soziale Grundbeduerfnisse anhand von Sprachmustern. Die Decision Map deckt Entscheidungs-Stile auf.
> **Anwendung:** Langfristiges Profiling von Zentralbankern, CEOs und Politikern. Nicht fuer einzelne Statements, sondern fuer Verhaltensmuster ueber Zeit.

### 8.1 Needs Map (6 Needs)

| Primary Need | Interne Frage | Sprachliche Indikatoren | Trading-Relevanz |
|---|---|---|---|
| **Significance** | "Sehen andere mich als wichtig genug?" | Spricht ueber Accomplishments, Impact, Standing-Out | CEO mit Significance-Need: kommuniziert eher bullish, uebertreibt Erfolge |
| **Approval** | "Akzeptieren mich die anderen?" | Sucht Bestaetigung, entschuldigt sich oft, will gemocht werden | CEO mit Approval-Need: kommuniziert konservativer, will niemanden enttaeuschen |
| **Acceptance** | "Gehoere ich dazu?" | Betont Teamwork, Zugehoerigkeit, Familien-Metaphern | CEO mit Acceptance-Need: betont "wir" statt "ich", Konsens-orientiert |

| Secondary Need | Interne Frage | Sprachliche Indikatoren |
|---|---|---|
| **Strength** | "Sehen mich andere als stark?" | Wettbewerbs-Sprache, Dominanz, "schlagen die Konkurrenz" |
| **Pity** | "Kuemmern sich andere um mich?" | Betont Schwierigkeiten, Herausforderungen, Opfer-Narrative |
| **Control** | "Habe ich die Kontrolle?" | Detailversessenheit, Prozess-Sprache, Micromanagement-Signale |

### 8.2 Decision Map (6 Stile)

| Decision Style | Frage | Sprachliche Indikatoren | Trading-Relevanz |
|---|---|---|---|
| **Deviance** | "Hebt mich das ab?" | Disruptive Sprache, "anders als alle anderen" | CEO entscheidet unkonventionell → hoehere Volatilitaet |
| **Novelty** | "Ist das neu/aufregend?" | Begeisterung fuer Innovation, Early Adopter | CEO folgt Trends → FOMO-getriebene Entscheidungen |
| **Social** | "Was denken andere darueber?" | Verweise auf Peer-Unternehmen, "Branchenstandard" | CEO ist Follower → konservativ, geringe Alpha-Generation |
| **Conformity** | "Ist das normal/sicher?" | Risk-Aversion, "bewährte Methoden", Compliance | CEO ist ultra-konservativ → wenig Ueberraschungen |
| **Status** | "Erhoeht das meinen Status?" | Premium-Sprache, Exklusivitaet, "best-in-class" | CEO optimiert fuer Optik → moegliche Disconnect zu Fundamentals |
| **Autonomy** | "Kann ich das selbst entscheiden?" | Unabhaengigkeit, "wir machen unser eigenes Ding" | CEO ignoriert Markt-Signale → Risiko fuer Contrarian-Fehler |

### 8.3 Profiling-Pipeline

```
Historische Transcripts (letzte 4-8 Earnings Calls)
    │
    ▼
Extractor Agent: Pro Transcript → Needs-Indikatoren + Decision-Indikatoren
    │
    ▼
Deterministic Profiler: Haeufigkeitsanalyse ueber alle Transcripts
    → Primary Need = häufigstes Need-Cluster
    → Decision Style = häufigstes Decision-Cluster
    │
    ▼
Output: CEO-Profil
    {
        "person": "Tim Cook",
        "company": "AAPL",
        "primary_need": "acceptance",
        "secondary_need": "control",
        "decision_style": "conformity",
        "confidence": 0.72,
        "based_on": 6,  // Anzahl analysierter Transcripts
        "last_updated": "2026-02-21"
    }
```

**Wert fuer Trader:** Wenn du weisst dass ein CEO ein Conformity/Approval-Profil hat und ploetzlich Deviance-Sprache nutzt, ist das ein starkes Signal fuer eine Strategieaenderung der Firma.

---

## 9. Datenquellen fuer die Behavioral Analysis Pipeline

> **Vollstaendige Quellen-Dokumentation mit APIs, Preisen, Code-Beispielen und Integrations-Reihenfolge:** Siehe [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) **Sek. 12.4 A-G**.
> Hier nur die Zusammenfassung mit Fokus auf die Pipeline-Relevanz.

### 9.1 Quellen-Uebersicht nach Prioritaet

| Phase | Quelle | Typ | Kosten | BTE-Relevanz | Pipeline-Rolle |
|---|---|---|---|---|---|
| **v2.0** | SEC EDGAR (MD&A, S-1) via `edgartools` | Text | Kostenlos | **Sehr hoch** -- CEO/CFO Freitext unter regulatorischem Druck | Extractor → DRS Guard. Cross-Referenz mit Earnings Calls |
| **v2.0** | GDELT (erweitert: Tone, Persons, Orgs) | Sentiment-Aggregat | Kostenlos (BigQuery Free Tier) | Mittel -- kein Freitext, aber Baseline fuer Sentiment | Pre/Post-Earnings Tone-Baseline, Regional Perception Gap |
| **v2.0** | BIS Zentralbank-Reden | Text (Bulk) | Kostenlos | Hoch -- Freitext, alle Zentralbanken seit 1996 | Extractor → Ambiguity-Baseline Guard. Profiling |
| **v2.5** | EarningsCall.biz (Audio+Text) | Audio + Transcript | $129/mo | **Sehr hoch** -- Audio = Stimmanalyse + Text = BTE | Volle Pipeline: Text + Audio + Cross-Modal Guard |
| **v2.5** | Hansard + Congressional Record | Text | Kostenlos | Hoch -- Politiker unter Befragungsdruck | Extractor → DRS Guard (mit Confrontation-Penalty) |
| **v3.0** | Zentralbank-Webcasts (yt-dlp) | Audio | Kostenlos | Hoch -- Stimmanalyse von Powell, Lagarde, etc. | Audio-Pipeline: Stress + Prosody + Cross-Modal |
| **v3.0** | Knowledge Base (YouTube-Kanaele) | Referenz | Kostenlos | Indirekt -- Training fuer Extractor/Verifier | Prompt-Engineering, Ground Truth, Annotation |
| **v3+** | Quartr (Enterprise) | Audio + Live | Enterprise | Sehr hoch -- Live-Streaming | Echtzeit-Analyse waehrend des Calls |

### 9.2 Drei "Gold-Quellen" im Detail

**SEC EDGAR MD&A** (Details: GeoMap Sek. 12.4 B)
- Open Source: `pip install edgartools` (MIT Lizenz, 10-30x schneller als Alternativen)
- Item 7 (10-K) und Part I Item 2 (10-Q) sind der CEO/CFO-Freitext
- **S-1 Filings** (IPO) sind besonders BTE-reich: erstmaliges Narrativ + maximaler Druck
- DEF 14A (Proxy Statements): CEO Compensation Narratives → Needs Map Profiling
- **Cross-Source-Check:** MD&A vs. Earnings Call Transcript desselben Quartals

**GDELT erweiterte Nutzung** (Details: GeoMap Sek. 12.4 C)
- Bereits im Stack (go-backend), jetzt auch GKG-Tabellen nutzen
- `gdelt_gkg_persons_extracted` + `avg_tone`: Wie wird ueber Person X berichtet?
- Pre-Earnings Baseline: 30-Tage `avg_tone` VOR dem Call → Erwartungshaltung
- Regional Perception Gap: Gleiche Person, verschiedene Regionen → Bias-Detection
- Python: `pip install gdelt-client` oder BigQuery

**Zentralbank-Reden** (Details: GeoMap Sek. 12.4 D)
- BIS hat ALLE Zentralbanken seit 1996 als Bulk-Download
- Python `gingado` Library fuer BIS-Daten
- Audio via `yt-dlp` von offiziellen Webcasts → WhisperX → Text + Audio Pipeline

### 9.3 Knowledge Base Quellen

> Nicht als Trading-Signal sondern als Referenz fuer Extractor/Verifier Agents.

| Quelle | Fokus | Pipeline-Nutzen |
|---|---|---|
| **Chase Hughes -- The Behavioral Arts** (YouTube) | Deception Detection, Live-Demos | BTE-Marker-Beispiele fuer Prompts, Verifier Ground Truth |
| **The Behavior Panel** (YouTube) | 4-Experten Multi-Perspektive | Cross-Annotator-Konsistenz (Cohen's Kappa Analog) |
| **Derek Van Schaik** (YouTube) | CEO/Politiker Body Language | Financial-spezifische Beispiele |
| **Body Language Ghost** (YouTube) | FACS Action Unit Analyse | Ground Truth fuer zukuenftige Video-Analyse |
| **Observe** (YouTube) | Verhoer-Analysen | DRS-Validierung an realen Faellen |

Integration via UIL-Typ "YouTube-Transcript" (`yt-dlp --write-auto-sub`). Siehe [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 3.

---

## 10. Live Multimodal Dashboard -- Full-Stack-Architektur

> **Vision:** Ein Analyst-Tool das Earnings Calls, Zentralbank-PKs oder Politiker-Reden in Echtzeit oder Post-hoc analysiert. Alle Kanaele (Text, Audio, Prosody) simultan auf einem synchronisierten Zeitstrahl. Das Dashboard zeigt nicht nur WAS gesagt wurde, sondern WIE es gesagt wurde und WO das Verhalten von der Baseline abweicht.

### 10.1 System-Uebersicht

```
                        ┌────────────────────────────┐
                        │     DATENQUELLEN            │
                        │                            │
                        │  Earnings Call Audio/Text   │
                        │  Zentralbank Webcasts       │
                        │  Politiker-Reden            │
                        │  SEC Filings (MD&A)         │
                        └─────────┬──────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   GO GATEWAY / FETCHER     │
                    │                            │
                    │  • EarningsCall.biz SDK    │
                    │  • yt-dlp (Audio Extract)  │
                    │  • BIS/ECB/Fed Scraper     │
                    │  • SEC EDGAR Fetcher       │
                    │  • Scheduling (Cron/Queue) │
                    └─────────────┬──────────────┘
                                  │ Audio (WAV/MP3) + Text (JSON)
                                  │
        ┌─────────────────────────▼─────────────────────────┐
        │             PYTHON BACKEND (FastAPI)                │
        │                                                     │
        │  ┌─────────────────────────────────────────────┐   │
        │  │  PREPROCESSING                               │   │
        │  │                                              │   │
        │  │  Audio:                                      │   │
        │  │   • WhisperX (STT + Speaker Diarization)     │   │
        │  │   • Segment-Alignment (Timestamp ↔ Speaker)  │   │
        │  │   • Audio Feature Extraction (librosa)       │   │
        │  │                                              │   │
        │  │  Text:                                       │   │
        │  │   • Speaker-Separation (CEO/CFO/Analyst)     │   │
        │  │   • Segment-Tokenization                     │   │
        │  └──────────────────┬──────────────────────────┘   │
        │                     │                               │
        │  ┌──────────────────▼──────────────────────────┐   │
        │  │  AGENT PIPELINE (parallel)                    │   │
        │  │                                              │   │
        │  │  Text-Pfad:                Audio-Pfad:       │   │
        │  │   Extractor ─┐              Wav2Vec2 ──┐     │   │
        │  │   Verifier  ─┤              Stress Det ─┤    │   │
        │  │   DRS Guard ─┤              Prosody ────┤    │   │
        │  │   Sentiment ─┘              Audio Guard ┘    │   │
        │  │              │                    │          │   │
        │  │              └──────┬─────────────┘          │   │
        │  │                     │                         │   │
        │  │              Cross-Modal Guard                │   │
        │  │                     │                         │   │
        │  │              Meta-Guard                       │   │
        │  │                     │                         │   │
        │  │              Synthesizer Agent                │   │
        │  └──────────────────┬──────────────────────────┘   │
        │                     │                               │
        │  ┌──────────────────▼──────────────────────────┐   │
        │  │  JOB MANAGEMENT                               │   │
        │  │                                              │   │
        │  │  • Celery + Redis (Task Queue)               │   │
        │  │  • Job Status: PENDING → PROCESSING →        │   │
        │  │    PARTIAL → COMPLETE                        │   │
        │  │  • Partial Results (Text fertig, Audio laeuft)│   │
        │  │  • WebSocket fuer Progress-Updates            │   │
        │  └──────────────────┬──────────────────────────┘   │
        │                     │                               │
        └─────────────────────┼───────────────────────────────┘
                              │ SSE / WebSocket
                              │
        ┌─────────────────────▼──────────────────────────────┐
        │            GO GATEWAY (SSE Router)                   │
        │                                                      │
        │  • Bestehender SSE-Hub                              │
        │  • Neuer Channel: /api/v1/analysis/stream/{job_id}  │
        │  • Auth + RBAC (analyst role)                       │
        │  • Rate Limiting (rechenintensiv)                   │
        └─────────────────────┬──────────────────────────────┘
                              │ SSE Events
                              │
        ┌─────────────────────▼──────────────────────────────┐
        │            FRONTEND (Next.js / React)                │
        │                                                      │
        │  ┌──────────────────────────────────────────────┐   │
        │  │  MultimodalAnalysisDashboard                  │   │
        │  │                                              │   │
        │  │  ├── ScorePanel (DRS, Sentiment, Stress,     │   │
        │  │  │   Consistency)                            │   │
        │  │  │                                           │   │
        │  │  ├── TranscriptViewer                        │   │
        │  │  │   ├── SpeakerSegments (farbkodiert)       │   │
        │  │  │   ├── BTEMarkerOverlay (klickbar)         │   │
        │  │  │   └── SentimentHeatmap (Hintergrund)      │   │
        │  │  │                                           │   │
        │  │  ├── AudioTimeline                           │   │
        │  │  │   ├── WaveformDisplay                     │   │
        │  │  │   ├── StressGraph (Sparkline)             │   │
        │  │  │   ├── PitchGraph (Sparkline)              │   │
        │  │  │   └── SpeechRateGraph (Sparkline)         │   │
        │  │  │                                           │   │
        │  │  ├── MarkerTimeline                          │   │
        │  │  │   ├── BTEMarkerIcons (auf Zeitstrahl)     │   │
        │  │  │   ├── DRSCumulativeLine                   │   │
        │  │  │   └── ThresholdLine (11-Punkte-Linie)     │   │
        │  │  │                                           │   │
        │  │  ├── ExplanationPanel (Synthesizer Output)   │   │
        │  │  │                                           │   │
        │  │  └── ProfileSidebar (Needs Map, Decision Map)│   │
        │  └──────────────────────────────────────────────┘   │
        └──────────────────────────────────────────────────────┘
```

### 10.2 Frontend-Architektur (Next.js / React)

**Neue Packages:**

| Package | Zweck | Groesse |
|---|---|---|
| `wavesurfer.js` | Audio Waveform Rendering + Playback | ~80KB |
| `@tanstack/react-virtual` | Virtualized Transcript (kann lang sein) | ~5KB |
| `recharts` oder `visx` | Sparklines (Stress, Pitch, Rate) | Bereits im Projekt (recharts) |
| `date-fns` | Timestamp-Formatierung | Bereits im Projekt |

**Komponenten-Hierarchie:**

```typescript
// Seite: /analysis/[jobId]
// Feature-Flag: FEATURE_MULTIMODAL_ANALYSIS
// RBAC: analyst role required

interface MultimodalJob {
  id: string;
  status: 'pending' | 'processing' | 'partial' | 'complete' | 'failed';
  source: {
    type: 'earnings_call' | 'central_bank' | 'political' | 'custom';
    title: string;      // "AAPL Q4 2026 Earnings Call"
    date: string;
    speakers: Speaker[];
  };
  results?: {
    transcript: TranscriptSegment[];
    bteMarkers: BTEMarker[];
    audioFeatures?: AudioFeatures;
    scores: {
      drs: DRSResult;
      sentiment: SentimentResult;
      audioStress?: AudioStressResult;
      crossModal?: CrossModalResult;
      combined: CombinedScore;
    };
    explanation: string;
    profile?: SpeakerProfile;
  };
}

interface TranscriptSegment {
  id: string;
  speaker: string;
  role: 'ceo' | 'cfo' | 'analyst' | 'moderator' | 'other';
  startTime: number;   // Sekunden
  endTime: number;
  text: string;
  sentiment: number;   // -1.0 bis +1.0
  markers: string[];   // BTE-Marker IDs die in diesem Segment liegen
}

interface AudioFeatures {
  waveform: Float32Array;          // Fuer wavesurfer.js
  stressTimeline: TimeSeriesPoint[];
  pitchTimeline: TimeSeriesPoint[];
  speechRateTimeline: TimeSeriesPoint[];
  emotionSegments: EmotionSegment[];
}
```

**Synchronisation (das Herzstueck der UX):**

Alle Panels muessen synchron sein. Wenn der User auf einen BTE-Marker klickt:
1. Transcript scrollt zu dem Segment
2. Audio-Playback springt zum Timestamp
3. Audio-Timeline Cursor springt mit
4. Score-Panel zeigt Scores fuer dieses Segment

```typescript
// Shared state via Zustand store
interface AnalysisPlaybackStore {
  currentTime: number;            // Aktuelle Position in Sekunden
  selectedSegmentId: string | null;
  isPlaying: boolean;
  playbackRate: number;           // 0.5x, 1x, 1.5x, 2x

  setCurrentTime: (t: number) => void;
  seekToSegment: (segmentId: string) => void;
  seekToMarker: (markerId: string) => void;
}
```

### 10.3 Network-Layer

**API Endpoints (Go Gateway):**

| Methode | Endpoint | Beschreibung | Auth |
|---|---|---|---|
| `POST` | `/api/v1/analysis/jobs` | Neuen Analyse-Job erstellen | `analyst` role |
| `GET` | `/api/v1/analysis/jobs/{id}` | Job-Status + Ergebnisse | `analyst` role |
| `GET` | `/api/v1/analysis/jobs/{id}/stream` | SSE: Live Progress-Updates | `analyst` role |
| `GET` | `/api/v1/analysis/jobs/{id}/audio` | Audio-File streamen (fuer Playback) | `analyst` role |
| `GET` | `/api/v1/analysis/jobs/{id}/transcript` | Transcript mit Marker-Overlay | `analyst` role |
| `GET` | `/api/v1/analysis/profiles/{person}` | Historisches Profil (Needs/Decision Map) | `analyst` role |
| `POST` | `/api/v1/analysis/jobs/{id}/feedback` | Human Feedback auf Marker (Verifier-Training) | `analyst` role |
| `DELETE` | `/api/v1/analysis/jobs/{id}` | Job + Daten loeschen (Data Minimization) | `analyst` role |

**SSE Events (Progress):**

```typescript
// Event-Typen auf dem SSE-Channel
type AnalysisEvent =
  | { type: 'status_change'; status: JobStatus }
  | { type: 'transcript_ready'; segmentCount: number }
  | { type: 'text_analysis_progress'; percent: number; markersFound: number }
  | { type: 'audio_analysis_progress'; percent: number }
  | { type: 'scores_ready'; scores: PartialScores }
  | { type: 'explanation_ready'; explanation: string }
  | { type: 'complete'; summary: CompleteSummary }
  | { type: 'error'; message: string; retryable: boolean };
```

**Datenvolumen-Schaetzung:**

| Komponente | Groesse pro Analyse | Transfer |
|---|---|---|
| Transcript JSON | 50-200 KB | Einmalig |
| BTE Markers JSON | 5-50 KB | Einmalig |
| Audio Waveform Data | 500 KB - 2 MB (downsampled) | Einmalig |
| Audio File (Playback) | 20-100 MB (60 Min Call) | Streaming (Range Requests) |
| Sparkline Data (Stress/Pitch/Rate) | 20-100 KB je | Einmalig |
| SSE Events (Progress) | <1 KB je | Streaming |

### 10.4 Backend-Architektur (Python FastAPI)

**Neue Services/Module:**

```
python-backend/
├── services/
│   ├── multimodal-analysis/          # NEUER Service
│   │   ├── main.py                   # FastAPI App (Port 8093)
│   │   ├── api/
│   │   │   ├── routes.py             # Job CRUD + SSE
│   │   │   └── schemas.py            # Pydantic Models
│   │   ├── pipeline/
│   │   │   ├── orchestrator.py       # Celery Task Orchestrator
│   │   │   ├── preprocessing.py      # WhisperX + Speaker Diarization
│   │   │   ├── text_analysis.py      # Extractor + Verifier (LLM)
│   │   │   ├── audio_analysis.py     # Wav2Vec2 + Prosody
│   │   │   └── synthesis.py          # Synthesizer Agent
│   │   ├── guards/
│   │   │   ├── drs_guard.py          # DRS Punktesystem
│   │   │   ├── sentiment_guard.py    # Ensemble-Konsistenz
│   │   │   ├── audio_guard.py        # Audio Stress/Anomalie
│   │   │   ├── crossmodal_guard.py   # Text ↔ Audio Consistency
│   │   │   ├── bias_guard.py         # Source Bias Adjustment
│   │   │   └── meta_guard.py         # Aggregiert alle Guards
│   │   ├── models/
│   │   │   ├── whisperx_wrapper.py   # WhisperX Integration
│   │   │   ├── emotion_model.py      # Wav2Vec2 Emotion
│   │   │   ├── stress_model.py       # Binary Stress Detection
│   │   │   └── prosody.py            # librosa/parselmouth Features
│   │   ├── profiling/
│   │   │   ├── needs_map.py          # Needs Map Extraction
│   │   │   └── decision_map.py       # Decision Style Detection
│   │   └── storage/
│   │       ├── job_store.py          # Job Metadata (PostgreSQL)
│   │       └── audio_store.py        # Audio Files (S3/MinIO/local)
│   └── geopolitical-soft-signals/    # Bestehend (Port 8091)
```

**Abhaengigkeiten (neue Python Packages):**

| Package | Zweck | GPU noetig? |
|---|---|---|
| `whisperx` | STT + Speaker Diarization | Ja (CUDA empfohlen) |
| `transformers` | Wav2Vec2 Emotion/Stress Models | Ja (Inference) |
| `librosa` | Audio Feature Extraction (Prosody) | Nein |
| `parselmouth` | Praat-basierte Stimmanalyse (Jitter/Shimmer) | Nein |
| `pydub` | Audio Format Conversion | Nein |
| `celery[redis]` | Task Queue fuer async Jobs | Nein |
| `yt-dlp` | Audio-Extraktion von YouTube/Webcasts | Nein |

**Hardware-Anforderungen:**

| Komponente | Minimum | Empfohlen |
|---|---|---|
| WhisperX (large-v3) | 8 GB VRAM | 12+ GB VRAM |
| Wav2Vec2 Emotion | 4 GB VRAM (shared) | 8 GB VRAM |
| Prosody (librosa) | CPU only | CPU only |
| LLM (Extractor/Verifier) | Ollama local oder API | API (GPT-4o-mini / Claude Haiku) fuer Geschwindigkeit |
| Gesamt | 1x GPU 12 GB (sequentiell) | 1x GPU 24 GB oder 2x 12 GB |

### 10.5 Infrastruktur

```
┌─────────────────────────────────────────────────────────┐
│  Docker Compose (Development)                            │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │
│  │ Redis     │  │ Postgres │  │ MinIO (S3-compat)  │    │
│  │ (Queue +  │  │ (Jobs +  │  │ (Audio Storage)    │    │
│  │  Cache)   │  │  Profiles)│  │                    │    │
│  └──────────┘  └──────────┘  └────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  multimodal-analysis (FastAPI, Port 8093)        │    │
│  │  + Celery Worker (GPU-attached)                  │    │
│  │  + Whisper/Wav2Vec2 Models (volume-mounted)      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────┐  ┌────────────┐  ┌────────────────┐      │
│  │ Go GW    │  │ Python     │  │ Frontend       │      │
│  │ (8080)   │  │ Indicators │  │ (3000)         │      │
│  │          │  │ (8091)     │  │                │      │
│  └──────────┘  └────────────┘  └────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

**Neue Docker Services:**

| Service | Image Basis | Besonderheit |
|---|---|---|
| `multimodal-analysis` | `python:3.11-slim` + CUDA | GPU Runtime, grosse Models (~6 GB Image) |
| `celery-worker` | Gleiche Image wie oben | `deploy.resources.reservations.devices` fuer GPU |
| `minio` | `minio/minio` | Audio-File Storage, S3-kompatibel |

### 10.6 Processing-Zeiten (Schaetzung)

| Schritt | 30-Min Call | 60-Min Call | Parallelisierbar? |
|---|---|---|---|
| Audio-Download | 5-30s | 5-30s | -- |
| WhisperX STT + Diarization | 2-4 Min | 4-8 Min | Nein (GPU-bound) |
| Text: Extractor Agent | 30-60s | 1-2 Min | Ja (pro Segment) |
| Text: Verifier Agent | 20-40s | 40-80s | Ja (pro Marker) |
| Text: DRS Guard | <1s | <1s | -- |
| Text: Sentiment (Ensemble) | 10-30s | 20-60s | Ja (pro Modell) |
| Audio: Wav2Vec2 Emotion | 1-2 Min | 2-4 Min | Ja (pro Segment) |
| Audio: Prosody Features | 10-20s | 20-40s | Ja |
| Cross-Modal + Meta Guard | <1s | <1s | -- |
| Synthesizer Agent | 10-20s | 15-30s | -- |
| **Gesamt (sequentiell)** | **~6-10 Min** | **~10-18 Min** | |
| **Gesamt (parallelisiert)** | **~4-6 Min** | **~7-12 Min** | |

Das ist akzeptabel fuer Post-hoc-Analyse. Fuer "Live" waehrend eines Calls wuerde man Text-Only laufen lassen (unter 2 Min) und Audio nachreichen.

### 10.7 Datenschutz und Retention

| Datentyp | Retention | Loeschung | Verschluesselung |
|---|---|---|---|
| Audio-Files | 30 Tage (konfigurierbar) | Auto-Delete via Cron | AES-256 at rest (MinIO) |
| Transcripts | 90 Tage | Auf Anfrage (Data Minimization) | DB-Encryption |
| BTE-Marker + Scores | 1 Jahr (fuer Profiling) | Anonymisiert nach 1 Jahr | DB-Encryption |
| Profile (Needs/Decision Map) | Unbegrenzt (aggregiert, kein PII) | Opt-out moeglich | DB-Encryption |
| Human Feedback | Unbegrenzt (Training Data) | Anonymisiert | DB-Encryption |

> Verbindung zu [`AUTH_SECURITY.md`](./specs/AUTH_SECURITY.md) Sek. 10: Audio-Aufnahmen sind hochsensibel. Granular Consent gilt fuer die Analyse, nicht fuer die Aufnahme (die ist oeffentlich). Aber: Profiling-Ergebnisse unterliegen DSGVO Art. 22 (automatisierte Entscheidungsfindung). Human-in-the-Loop ist Pflicht bei Profiling.

---

## 11. Verbindung zu bestehender Architektur

| Dieses Dokument | Bestehendes Dokument | Verbindung |
|---|---|---|
| Sek. 2 (Agent-Rollen) | [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.2-4.7 | Training Pipeline nutzt dasselbe Guard-Pattern |
| Sek. 2 (Agent-Rollen) | [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 4-5 | UIL LLM-Pipeline + Double-Threshold = Extractor + Threshold Guard |
| Sek. 3 (Cross-Modal Guard) | [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 1.4 | Cross-Modal Consistency Check (Emotion-AI-Buch) |
| Sek. 4 (BTE/DRS) | [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.8 | Adversarial Robustness -- DRS Guard ist nicht prompt-injectable |
| **Sek. 4 + 8 (BTE/DRS + Profiling)** | **[`MEMORY_ARCHITECTURE.md`](./MEMORY_ARCHITECTURE.md) Sek. 5.2 + 6** | **BTE-Marker, Behavioral States, Needs Map, Decision Map werden als Knowledge Graph Nodes modelliert. KG statt Vector DB fuer strukturiertes Wissen mit exakten Relationen (DRS-Punkte, State-Uebergaenge). Agenten querien den KG deterministisch statt via Freitext-Prompt.** |
| **Sek. 4 + 8 (BTE/DRS)** | **[`GAME_THEORY.md`](./GAME_THEORY.md) Sek. 8** | **Strategeme + BTE-Marker teilen sich denselben Knowledge Graph. Zwei Domains, ein Graph: Krisenlogik (Rieck) + Behavioral Analysis (Hughes) als komplementaere Wissensbasen.** |
| Sek. 5 (Speech Analysis) | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 18.2 | Sentiment-Modell-Optionen (Ensemble-Strategie) |
| Sek. 6 + 10 (Dashboard) | [`INDICATOR_ARCHITECTURE.md`](./INDICATOR_ARCHITECTURE.md) Sek. 3.5 | Multimodale Fusion = Hybrid Fusion Pattern |
| Sek. 7 + 9 (Earnings Calls) | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 18.1 | Soft-Signal-Adapter (neue Quelle: Earnings Call Transcripts) |
| Sek. 8 (Profiling) | [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 4.5 | Bias-Awareness -- Profiling-Output ist bias-anfaellig und braucht Human Review |
| Sek. 9.5 (YouTube KB) | [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 3 | UIL unterstuetzt YouTube-Transcripts als Quell-Typ |
| Sek. 10 (Full-Stack Dashboard) | [`AUTH_SECURITY.md`](./specs/AUTH_SECURITY.md) Sek. 2.3, 10 | RBAC: analyst role. Audio-Daten → Granular Consent + Data Minimization |
| Sek. 10.4 (Backend) | [`RUST_LANGUAGE_IMPLEMENTATION.md`](./RUST_LANGUAGE_IMPLEMENTATION.md) | Prosody Features koennten langfristig nach Rust (FFI) migriert werden |
| Sek. 3 (Guards allgemein) | [`AUTH_SECURITY.md`](./specs/AUTH_SECURITY.md) Sek. 10 | Privacy: Profiling-Daten sind hochsensibel → Data Minimization + Consent |

---

# Teil II: Orchestration und Multi-Agent-System

> **Kontext:** Teil I (Sek. 1-11) definiert die Pipeline-Agenten (Extractor, Verifier, Guard, Synthesizer) und deren Anwendung auf BTE/DRS, Speech und Multimodale Analyse. Teil II erweitert das System um eine Orchestration-Schicht, erweiterte Agent-Rollen, heterogene LLM-Nutzung und ein Agent Registry System das User-definierte Agenten ermoeglicht.
>
> **Forschungsgrundlage:** Die Architektur in Teil II basiert auf den im Header genannten Papers (X-MAS, CooperBench, "Hold Experts Back", Guided Collaboration, AdaptOrch) sowie Anthropics "Building Effective Agents" Patterns. Kernerkenntnisse:
> - Heterogene Modelle (verschiedene LLMs pro Rolle) verbessern MAS-Leistung *wenn* die Kommunikation schema-basiert ist (X-MAS)
> - Unstrukturierte NL-Kommunikation zwischen Agenten fuehrt zu Koordinationsverlusten (CooperBench) und "Integrative Compromise" (Hold Experts Back)
> - **Unser Deterministic Guard ist bereits der "homogene Kommunikationskern"** -- alle Agenten produzieren strukturierten JSON-Output, Guards validieren deterministisch. Das loest das Koordinationsproblem *by design*.

---

## 12. Orchestration Layer -- Router, Planner, Orchestrator

> **Referenz:** [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 2 (M/A/O/E Mapping). Das dort als "nur Referenz, nicht geplant" markierte Pattern wird hier zum Kern-Design befoerdert.
> **Anthropic-Pattern:** Router + Orchestrator-Workers (aus "Building Effective Agents")

### 12.1 Warum eine Orchestration-Schicht noetig ist

Teil I definiert **was** analysiert wird (Pipelines: BTE, Sentiment, Audio, Cross-Modal). Teil II definiert **wer entscheidet** welche Pipeline laufen soll und **wer koordiniert** wenn mehrere Pipelines parallel laufen.

Ohne Orchestration-Layer:
- Jede Analyse ist statisch verdrahtet (Earnings Call → immer volle BTE+Audio Pipeline)
- Keine dynamische Task-Dekomposition (ein Analyst will "vergleiche die letzten 4 Powell-Reden" -- das ist 4x dieselbe Pipeline, aber wer parallelisiert das?)
- Keine Fehlerbehandlung auf Workflow-Ebene (Audio-Pipeline schlaegt fehl → Text-Pipeline soll trotzdem laufen)
- Keine Kostensteuerung (einfache Sentiment-Abfrage sollte nicht die volle Multi-Modal-Pipeline triggern)

### 12.2 Die drei Orchestration-Rollen

```
User/System Request
    │
    ▼
┌─────────────────────────────────────┐
│  ROUTER AGENT                       │  "Welche Pipeline braucht dieser Task?"
│  (Leichtgewichtig, SLM oder Regeln) │
│                                     │
│  Klassifiziert Input nach:          │
│  - Komplexitaet (simple/complex)    │
│  - Domaene (BTE/Sentiment/Geo/Multi)│
│  - Dringlichkeit (live/batch)       │
│  - Budget (billig/teuer erlaubt)    │
└──────────────┬──────────────────────┘
               │ Routing-Decision (JSON)
               ▼
┌─────────────────────────────────────┐
│  PLANNER AGENT (nur bei complex)    │  "Wie zerlege ich den Task in Sub-Tasks?"
│  (Starkes Reasoning-Modell)         │
│                                     │
│  Erstellt Ausfuehrungsplan:         │
│  - Sub-Tasks mit Abhaengigkeiten    │
│  - Parallelisierungs-Entscheidung   │
│  - Modell-Auswahl pro Sub-Task      │
│  - Timeout- und Fallback-Regeln     │
└──────────────┬──────────────────────┘
               │ ExecutionPlan (JSON DAG)
               ▼
┌─────────────────────────────────────┐
│  ORCHESTRATOR                       │  "Ausfuehren, ueberwachen, aggregieren"
│  (Code + leichtgewichtiges LLM)     │
│                                     │
│  - Startet Sub-Tasks (parallel/seq) │
│  - Streamt Partial Results via SSE  │
│  - Handled Timeouts und Fehler      │
│  - Aggregiert Ergebnisse            │
│  - Entscheidet ueber Re-Runs        │
└──────────────┬──────────────────────┘
               │
               ▼
          Pipeline-Agenten (Teil I)
          Extractor → Verifier → Guard → Synthesizer
```

### 12.3 Router Agent

Der Router ist der Eingangspunkt fuer alle Analyse-Anfragen. Er ist bewusst leichtgewichtig -- entweder regelbasiert oder ein SLM.

**Input:** Unstrukturierte oder semi-strukturierte Anfrage (z.B. "Analysiere den AAPL Earnings Call", "Wie ist die Stimmung zu Iran-Sanktionen?", oder ein automatischer Trigger vom UIL)

**Output:**

```python
@dataclass
class RoutingDecision:
    task_type: str          # "bte_analysis", "sentiment", "geo_impact", "multimodal", "profiling", "comparison"
    complexity: str         # "simple" (direkte Pipeline) | "complex" (braucht Planner)
    pipelines: list[str]    # ["bte", "sentiment", "audio", "cross_modal"]
    priority: str           # "realtime" | "standard" | "batch"
    model_tier: str         # "small" | "medium" | "large"
    estimated_cost: float
    requires_planner: bool
```

**Routing-Regeln (deterministisch, kein LLM noetig fuer 80% der Faelle):**

| Input-Signal | Route | Begruendung |
|---|---|---|
| UIL Auto-Candidate (Geo-Event) | `geo_impact`, simple, `["sentiment"]`, standard | Standardfall, kosteneffizient |
| User klickt "Analyse" auf Earnings Call | `bte_analysis`, complex, `["bte","sentiment"]`, standard | Immer Planner (BTE + optional Audio) |
| Live Zentralbank-PK gestartet | `multimodal`, complex, alle Pipelines, realtime | Volle Pipeline, Echtzeit |
| API: "Vergleiche 4 Reden von Powell" | `comparison`, complex, Planner entscheidet | Multi-Instance, braucht Parallelisierung |
| Sentiment-Widget Refresh | `sentiment`, simple, `["sentiment"]`, realtime | Direkt, kein Planner |

**Fallback:** Wenn der Router unsicher ist (kein Pattern matched), leitet er an den Planner weiter mit `complexity: "complex"`.

### 12.4 Planner Agent

Der Planner wird nur bei `complexity: "complex"` aktiviert. Er braucht starkes Reasoning (grosses Modell) weil er Trade-offs abwaegen muss.

**Input:** RoutingDecision + Original-Anfrage + Verfuegbare Ressourcen (welche Models geladen, GPU-Auslastung, Budget-Limit)

**Output:**

```python
@dataclass
class ExecutionPlan:
    steps: list[PlanStep]
    total_estimated_time: int      # Sekunden
    total_estimated_cost: float
    parallelizable_groups: list[list[str]]

@dataclass
class PlanStep:
    id: str
    agent_type: str            # "extractor", "verifier", "guard", "synthesizer", "research", "evaluator"
    pipeline: str              # "bte", "sentiment", "audio", "profiling"
    model_config: str          # "small", "medium", "large"
    input_from: list[str]      # Step-IDs deren Output als Input dient (DAG-Kanten)
    timeout_seconds: int
    fallback: str | None       # Alternative Step-ID bei Timeout/Fehler
    is_optional: bool          # True = Workflow laeuft weiter wenn Step fehlschlaegt
```

**Beispiel: "Analysiere AAPL Q4 2026 Earnings Call mit Audio"**

```yaml
steps:
  - { id: preprocess, agent_type: preprocessor, pipeline: audio, model_config: whisperx, input_from: [], timeout_seconds: 480, is_optional: false }
  - { id: text_extract, agent_type: extractor, pipeline: bte, model_config: medium, input_from: [preprocess], timeout_seconds: 120, is_optional: false }
  - { id: text_verify, agent_type: verifier, pipeline: bte, model_config: medium, input_from: [text_extract], timeout_seconds: 60, is_optional: false }
  - { id: audio_emotion, agent_type: audio_analyzer, pipeline: audio, model_config: wav2vec2, input_from: [preprocess], timeout_seconds: 240, is_optional: true }
  - { id: drs_guard, agent_type: deterministic_guard, pipeline: bte, input_from: [text_verify], timeout_seconds: 1, is_optional: false }
  - { id: cross_modal_guard, agent_type: deterministic_guard, pipeline: cross_modal, input_from: [drs_guard, audio_emotion], timeout_seconds: 1, is_optional: true }
  - { id: synthesize, agent_type: knowledge_synthesizer, pipeline: multimodal, model_config: large, input_from: [drs_guard, cross_modal_guard], timeout_seconds: 30, is_optional: false }
  - { id: evaluate, agent_type: evaluator, pipeline: quality, model_config: medium, input_from: [synthesize], timeout_seconds: 15, is_optional: true }

parallelizable_groups:
  - [text_extract, audio_emotion]    # Parallel nach preprocess
```

### 12.5 Orchestrator

Der Orchestrator fuehrt den ExecutionPlan aus. Er ist primaer Code (nicht LLM), nutzt aber ein leichtgewichtiges LLM fuer Fehler-Entscheidungen.

```python
class AgentOrchestrator:
    async def execute_plan(self, plan: ExecutionPlan, job_id: str) -> WorkflowResult:
        results: dict[str, StepResult] = {}

        for group in plan.topological_groups():
            tasks = []
            for step in group:
                input_data = self._gather_inputs(step, results)
                tasks.append(self._execute_step(step, input_data, job_id))

            group_results = await asyncio.gather(*tasks, return_exceptions=True)

            for step, result in zip(group, group_results):
                if isinstance(result, Exception):
                    if step.fallback:
                        result = await self._execute_step(
                            plan.get_step(step.fallback), input_data, job_id
                        )
                    elif not step.is_optional:
                        return WorkflowResult(
                            status="failed", error=str(result), partial_results=results
                        )
                    else:
                        await self.sse_hub.emit(job_id, {
                            "type": "step_skipped", "step": step.id, "reason": str(result)
                        })
                        continue

                results[step.id] = result
                await self.sse_hub.emit(job_id, {
                    "type": "step_complete", "step": step.id, "summary": result.summary
                })

        return WorkflowResult(status="complete", results=results)
```

**Verbindung zu Sek. 10.3:** Der Orchestrator nutzt das bestehende Celery+Redis Job-Management. Jeder PlanStep wird ein Celery-Task. Der Orchestrator ist der Celery Chord/Chain Coordinator.

---

## 13. Erweiterte Agent-Rollen -- Research, Synthesizer+, Evaluator, Monitor

> Die vier Rollen aus Sek. 2 (Extractor, Verifier, Guard, Synthesizer) bleiben unveraendert. Diese Sektion fuegt vier weitere hinzu.

### 13.1 Research Agent

**Rolle:** Aktives Suchen nach Informationen. Der Extractor (Sek. 2) arbeitet *passiv* auf gegebenem Text. Der Research Agent *sucht* aktiv.

| Use Case | Was der Research Agent tut | Tools |
|---|---|---|
| "Aehnliche historische Events?" | Durchsucht M3 (Episodic) + M4 (Vector) | `episodic_query`, `vector_search`, `market_data_fetch` |
| "Andere Quellen zu diesem Statement?" | Durchsucht News APIs, SEC EDGAR | `news_search`, `sec_filing_fetch`, `web_search` |
| "Zentralbank-Reden zu Inflation?" | Durchsucht BIS-Archiv | `bis_search`, `transcript_fetch` |

**Output:**

```python
@dataclass
class ResearchResult:
    query: str
    sources_consulted: list[str]
    findings: list[ResearchFinding]
    confidence: float
    gaps: list[str]                  # Was konnte nicht gefunden werden

@dataclass
class ResearchFinding:
    source: str
    content: str
    relevance_score: float
    timestamp: datetime
    url: str | None
```

**Memory-Zugriff:** Voller Zugriff auf M1-M4. Schreibt Ergebnisse zurueck in M3 (Episodic).

### 13.2 Knowledge Synthesizer (Erweiterung des Synthesizers)

**Rolle:** Upgrade des Synthesizers aus Sek. 2. Verbindet **mehrere Domaenen** zu einer kohaerenten Gesamtbewertung.

| Alter Synthesizer (Sek. 2) | Knowledge Synthesizer |
|---|---|
| Input: Guard-Output | Input: Guard-Output + Research + Episodic + KG-Kausalketten |
| Output: Natuerlichsprachliche Erklaerung | Output: Strukturierte Synthese mit Kausalketten, Parallelen, Empfehlung |
| Innerhalb einer Pipeline | **Ueber Pipelines hinweg** (BTE + Sentiment + Geo + Audio) |

```python
@dataclass
class SynthesisResult:
    summary: str
    confidence: float
    causal_chains: list[CausalChain]
    historical_parallels: list[Parallel]
    cross_domain_insights: list[str]
    contradictions: list[Contradiction]   # Text sagt X, Audio sagt Y
    action_signals: list[ActionSignal]
    evidence_bundle: list[Evidence]
```

### 13.3 Evaluator Agent

**Rolle:** Bewertet Synthese-Qualitaet *bevor* sie dem User praesentiert wird. Optional bei Standard-Analysen, verpflichtend bei High-Stakes.

| Check | Methode | Aktion bei Fehler |
|---|---|---|
| **Evidence Coverage** | Jede Claim braucht Evidence-Referenz | Fehlende Claims → `[UNVERIFIED]` Tag |
| **Score-Konsistenz** | Synthesizer-Text darf Guard-Scores nicht widersprechen | Re-Run Synthesizer |
| **Halluzinations-Check** | Genannte Fakten muessen im Input vorkommen | Erfundene Fakten entfernen, Confidence reduzieren |
| **Causal-Chain-Validierung** | Kausalketten muessen im KG (M2a) existieren | Nicht-existierende Ketten → "hypothetisch" |
| **Cross-Modal-Konsistenz** | Synthese muss Inkonsistenzen erwaehnen | Fehlende → ergaenzen |

**Verbindung zu HITL:** Bei `recommendation == "flag_for_human"` wird Output mit Warnung angezeigt.

### 13.4 Monitor / Sentinel Agent

**Rolle:** Dauerhaft aktiver Hintergrundprozess (Celery-Beat, alle 15 Min). Ueberwacht Systemgesundheit.

| Dimension | Metrik | Schwellwert | Aktion |
|---|---|---|---|
| **Entropy Monitoring** | H_info der Agent-Outputs | Fallend unter 2.0 Bits / 7d | Alert: "System konvergiert" |
| **Override-Rate Drift** | % Overrides / Woche | Steigend > 40% / 2 Wochen | Alert: "Qualitaet sinkt" |
| **Guard Rejection Rate** | % Verifier-Rejections | > 70% / 3 Tage | Alert: "Extractor: zu viele False Positives" |
| **Latenz-Anomalie** | P95 pro Pipeline | > 2x Baseline | Alert: "Pipeline X langsam" |
| **Kosten-Budget** | Kumulative LLM-Kosten | > 80% Monatsbudget | Alert: "Budget-Warnung" |
| **Concept Drift** | Accuracy-Trend (M3) | Fallend > 10pp / 30d | Alert: "Retraining noetig" |

**Verbindung:** Fuehrt ENTROPY_NOVELTY.md Sek. 5-6 (Dual-Entropy-Metrik) und Advanced-architecture Sek. 4.7.1 (Concept Drift) operativ aus.

---

## 14. Heterogene LLM-Architektur -- Modell-Auswahl pro Rolle

> **Kernprinzip:** Heterogene Modelle fuer Kompetenz, homogene Schemas fuer Kommunikation.

### 14.1 Modell-Zuordnung

| Agent-Rolle | Anforderung | Modell-Tier | Vorschlag (Stand Feb 2026) | Begruendung |
|---|---|---|---|---|
| **Router** | Schnell, strukturiert | SLM / Regeln | Regelbasiert + Phi-3 Fallback | < 100ms, billig |
| **Planner** | Starkes Reasoning | Large | Claude 4 Opus / o3 | Task-Dekomposition, Trade-offs |
| **Orchestrator** | Code-primaer | Code + SLM | asyncio + Haiku fuer Fehler | Primaer deterministisch |
| **Extractor (BTE)** | Sprachmuster | Medium | Claude 3.5 Sonnet / GPT-4o-mini | Subtile Marker finden |
| **Verifier** | Praezision | Medium-Large | Claude 4 Sonnet | Kritisch, False-Positive-Eliminierung |
| **Deterministic Guard** | **KEIN LLM** | Code-only | Python/Rust | Deterministisch, testbar, nicht manipulierbar |
| **Research Agent** | Browsing, grosse CW | Medium-Large | Gemini 2.0 Flash (1M) / Claude 4 Sonnet | Viele Quellen lesen |
| **Knowledge Synthesizer** | Cross-Domain | Large | Claude 4 Opus / o3 | Schwerste kognitive Aufgabe |
| **Evaluator** | Praezision | Medium | Claude 4 Sonnet | Qualitaet bewerten |
| **Monitor** | Leichtgewichtig | SLM | SQL + Haiku fuer Alert-Text | Dauerhaft, billig |

### 14.2 SLM-Rollen

| SLM-Rolle | Use Case | Kandidaten |
|---|---|---|
| **Router / Classifier** | Task-Typ klassifizieren | Phi-3-mini, Gemma-2-2b |
| **Schema Normalizer** | UIL-Quellen normalisieren | Phi-3-mini + Few-Shot |
| **Entity Linker** | Personen/Firmen → KG (M2a) | SpaCy NER + SLM |
| **Guardrail Checker** | Schneller Plausibilitaets-Pre-Check | Phi-3-mini Classifier |
| **Tool-Result Compressor** | Lange API-Ergebnisse verdichten | LLMLingua-2 (CE Sek. 5.3) |
| **Memory Chunk Scorer** | RAG-Relevanz bewerten | bge-reranker-base |

### 14.3 Kommunikationsprotokoll

Agenten kommunizieren NICHT in natuerlicher Sprache miteinander. Strukturierter JSON-Output nach definiertem Schema, Guard validiert deterministisch.

```
Agent A (Claude) → JSON {markers: [...]} → Schema-Validierung (Pydantic)
    → Agent B (GPT-4) → JSON {verified: [...]} → Guard (Python, kein LLM)
    → JSON {score: 12.0, flags: [...]} → Agent C (Gemini) → Synthese
```

Das loest die "negative Synergie" aus CooperBench/Hold-Experts-Back: kein Stil-Clash, kein Integrative Compromise, Guards validieren unabhaengig vom Quell-Modell.

---

## 15. Agent Registry und Tool System

> Terminologie-Mapping: **Agent Templates** ≈ Skills, **Tool Connectors** ≈ MCP, **Guardrail Policies** ≈ Rules

### 15.1 Agent Registry

```python
@dataclass
class AgentType:
    id: str                            # "bte_extractor", "custom_earnings_analyzer"
    name: str
    description: str
    category: str                      # "pipeline" | "orchestration" | "research" | "evaluation" | "monitoring" | "custom"
    model_config: ModelConfig
    tools: list[str]                   # Tool-IDs
    system_prompt: str
    input_schema: dict                 # JSON Schema
    output_schema: dict                # Guards validieren hiergegen
    guardrail_policies: list[str]
    memory_access: MemoryAccessPolicy
    max_tokens_output: int
    timeout_seconds: int
    cost_budget_per_call: float | None
    is_builtin: bool
    created_by: str | None
    version: int

@dataclass
class MemoryAccessPolicy:
    can_read_m1_cache: bool
    can_read_m2a_kg: bool
    can_read_m2b_user_kg: bool         # Nur mit expliziter Erlaubnis
    can_read_m3_episodic: bool
    can_read_m4_vector: bool
    can_write_m3_episodic: bool        # Nur bestimmte Agents
```

### 15.2 Tool Registry

| Tool-ID | Beschreibung | Destruktiv? | RBAC |
|---|---|---|---|
| `kg_query` | Cypher-Query auf Backend-KG (M2a) | Nein | viewer |
| `episodic_query` | Suche in Episodic Store (M3) | Nein | viewer |
| `vector_search` | Semantische Suche (M4) | Nein | viewer |
| `market_data_fetch` | OHLCV/Quote via Go Gateway | Nein | viewer |
| `indicator_calculate` | Indikator-Service | Nein | viewer |
| `news_search` | News-API Suche | Nein | viewer |
| `sentiment_analyze` | Sentiment-Modell | Nein | viewer |
| `bte_extract` | BTE-Marker extrahieren | Nein | analyst |
| `sec_filing_fetch` | SEC EDGAR | Nein | viewer |
| `bis_search` | BIS Zentralbank-Reden | Nein | viewer |
| `web_search` | Internet-Suche | Nein | analyst |
| `transcript_fetch` | Earnings Call Transcripts | Nein | analyst |
| `code_execute` | Sandboxed Python (Quant) | Nein* | analyst |

**Harte Regel (FRONTEND_DESIGN_TOOLING.md Sek. 3.3):** Kein Tool mit `is_destructive: true` darf von Agenten aufgerufen werden. Order-Placement bleibt in deterministischen UI-Komponenten.

### 15.3 Agent Templates (≈ Skills)

| Template | Beschreibung | Agents | Tools |
|---|---|---|---|
| **Earnings Call Analyzer** | BTE+Sentiment Analyse | extractor, verifier, sentiment, synthesizer | kg_query, episodic_query, transcript_fetch |
| **Geopolitical Risk Scorer** | Event Impact-Scoring | sentiment, research, synthesizer | kg_query, news_search, market_data_fetch |
| **Central Bank Analyzer** | Rede mit Baseline-Vergleich | extractor, verifier, synthesizer | kg_query, bis_search, episodic_query |
| **CEO Profiler** | Needs Map + Decision Map | extractor, verifier, research, synthesizer | kg_query, episodic_query, transcript_fetch, sec_filing_fetch |
| **Technical Pattern Scanner** | Indikator-Mustersuche | -- (deterministisch) | market_data_fetch, indicator_calculate |

Templates als JSON in PostgreSQL. User koennen klonen und anpassen.

### 15.4 Tool Connectors (≈ MCP)

Plugin-System fuer externe Datenquellen. Entspricht dem UIL-Adapter-Konzept (UNIFIED_INGESTION_LAYER.md Sek. 3).

| Connector | Tools bereitgestellt | Status |
|---|---|---|
| Go Gateway | `market_data_fetch`, `indicator_calculate` | Existiert (Phase 0) |
| ACLED API | `geo_event_search` | Existiert |
| GDELT | `news_tone_search` | Existiert |
| SEC EDGAR | `sec_filing_fetch` | Geplant (Phase 7) |
| BIS | `bis_search` | Geplant (Phase 7) |
| EarningsCall.biz | `transcript_fetch`, `audio_fetch` | Geplant (v2.5) |

### 15.5 Guardrail Policies (≈ Rules)

| Policy-ID | Regel | Enforcement |
|---|---|---|
| `no_trading_actions` | Agenten: keine schreibenden Trading-Endpoints | Hard Block |
| `no_pii_in_output` | Keine persoenlichen Daten in Agent-Outputs | Output-Filter |
| `max_cost_per_analysis` | Budget-Limit pro Analyse | Orchestrator-Abort |
| `audio_retention_30d` | Audio-Loeschung nach 30 Tagen | Cron |
| `profiling_hitl` | Profiling braucht Human-in-the-Loop | UI-Gate |
| `entropy_floor` | Diversity Floor im Context Assembly | CE Sek. 4.3 |
| `model_fallback` | Bei Model-Ausfall: Fallback oder Abbruch, nie stille Degradation | Orchestrator |

---

## 16. User-Defined Agents -- Frontend und Backend

> **Phase:** 7b+ (nach UIL). RBAC: nur `analyst` und `admin`.

### 16.1 Backend

| Methode | Endpoint | Beschreibung | RBAC |
|---|---|---|---|
| `GET` | `/api/v1/agents/types` | Alle Agent-Typen | viewer |
| `POST` | `/api/v1/agents/types` | Neuen Agent-Typ erstellen | analyst |
| `PUT` | `/api/v1/agents/types/{id}` | Agent-Typ bearbeiten | analyst (eigene) |
| `DELETE` | `/api/v1/agents/types/{id}` | Agent-Typ loeschen | analyst (eigene) |
| `GET` | `/api/v1/agents/templates` | Verfuegbare Templates | viewer |
| `POST` | `/api/v1/agents/templates/{id}/clone` | Template klonen | analyst |
| `GET` | `/api/v1/agents/tools` | Verfuegbare Tools | viewer |
| `POST` | `/api/v1/agents/execute` | Agent ausfuehren | analyst |
| `POST` | `/api/v1/agents/workflows` | Workflow ausfuehren | analyst |
| `GET` | `/api/v1/agents/workflows/{id}/stream` | SSE Live-Progress | analyst |

### 16.2 Frontend

| Komponente | Technologie | Phase |
|---|---|---|
| **Agent Type Editor** | React Form + Zustand | 7b |
| **Workflow Builder** | `@xyflow/react` (ReactFlow) -- DAG-Editor | 8+ |
| **Agent Playground** | React + SSE (Tambo-Kandidat fuer dynamische Output-Darstellung) | 7b |
| **Execution Monitor** | React + SSE + Recharts | 7b |
| **Template Gallery** | React Cards | 7b |

---

## 17. Verbindung zu bestehender Architektur (Teil II)

| Dieses Dokument (Teil II) | Bestehendes Dokument | Verbindung |
|---|---|---|
| **Sek. 12 (Orchestration)** | [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 2 | M/A/O/E Pattern: vom Referenz-Status zum Design befoerdert |
| **Sek. 12.5 (Orchestrator)** | Sek. 10.3 (Celery+Redis) | Orchestrator nutzt bestehendes Job-Management |
| **Sek. 13.1 (Research Agent)** | [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 3 | Research Agent nutzt UIL-Adapter als Tool Connectors |
| **Sek. 13.2 (K. Synthesizer)** | [`CONTEXT_ENGINEERING.md`](./CONTEXT_ENGINEERING.md) Sek. 8 | Erweiterung der Role-Context Matrix |
| **Sek. 13.3 (Evaluator)** | [`GEOPOLITICAL_MAP_MASTERPLAN.md`](./GEOPOLITICAL_MAP_MASTERPLAN.md) Sek. 5.4 | Automatische Vorstufe des Human-in-the-Loop |
| **Sek. 13.4 (Monitor)** | [`ENTROPY_NOVELTY.md`](./ENTROPY_NOVELTY.md) Sek. 5-6 | Fuehrt Dual-Entropy-Metrik operativ aus |
| **Sek. 13.4 (Monitor)** | [`Advanced-architecture-for-the-future.md`](./Advanced-architecture-for-the-future.md) Sek. 4.7.1 | Concept Drift Detection |
| **Sek. 14 (Heterogene LLMs)** | [`CONTEXT_ENGINEERING.md`](./CONTEXT_ENGINEERING.md) Sek. 5.1 | Token-Budgets variieren je nach Modell-Klasse |
| **Sek. 14.3 (Protokoll)** | Sek. 2 (Deterministic Guard) | Guard als Validierungs-Layer zwischen heterogenen LLMs |
| **Sek. 15.1 (Agent Registry)** | [`MEMORY_ARCHITECTURE.md`](./MEMORY_ARCHITECTURE.md) Sek. 5.3 | Episodic Store loggt pro Agent-Typ |
| **Sek. 15.2 (Tool Registry)** | [`UNIFIED_INGESTION_LAYER.md`](./UNIFIED_INGESTION_LAYER.md) Sek. 3 | UIL-Adapter als Tool Connectors |
| **Sek. 15.4 (Connectors)** | [`GO_GATEWAY.md`](./GO_GATEWAY.md) | Go Gateway = primaerer Connector fuer Market Data |
| **Sek. 15.5 (Policies)** | [`FRONTEND_DESIGN_TOOLING.md`](./FRONTEND_DESIGN_TOOLING.md) Sek. 3.3 | `no_trading_actions` kodifiziert Tambo-Sicherheitsregel |
| **Sek. 15.5 (Policies)** | [`AUTH_SECURITY.md`](./specs/AUTH_SECURITY.md) Sek. 10 | PII-Schutz, DSGVO Art. 22 |
| **Sek. 16 (User Agents)** | [`specs/EXECUTION_PLAN.md`](./specs/EXECUTION_PLAN.md) | Einordnung als Phase 7b+ |
| **Sek. 16.2 (Frontend)** | [`FRONTEND_DESIGN_TOOLING.md`](./FRONTEND_DESIGN_TOOLING.md) Sek. 3 | Tambo fuer Playground + Monitor (read-only) |
