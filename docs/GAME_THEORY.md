# Game Theory -- Ist-Zustand & Soll-Zustand

> **Stand:** 22. Februar 2026
> **Kontext:** Geopolitical Soft-Signal Pipeline, Composite Signal Integration, Indikator-Architektur
> **Referenz-Dokumente:** `INDICATOR_ARCHITECTURE.md` (Sek. 3, 5f), `GEOPOLITICAL_MAP_MASTERPLAN.md`, `Advanced-architecture-for-the-future.md` (Sek. 3.2, 6.1), [`POLITICAL_ECONOMY_KNOWLEDGE.md`](./POLITICAL_ECONOMY_KNOWLEDGE.md) (Sek. 3.3: Keen/Minsky-Paradigma mit Quellen, Sek. 5.1: Zentralbanken nach Paradigma, Sek. 8: TransmissionChannel KG-Edges)
> **Referenz-Buecher:**
> - `docs/books/new/Dynamic Noncooperative Game Theory (Tamer Basar, Geert Jan Olsder).md` -- Nash-Gleichgewichte, Differentialspiele, Pontryagin
> - `docs/books/new/Network games learning and dynamics.md` -- Bayesian/Adaptive Learning, Congestion Games
> - `docs/books/new/Optimal_Control_-_Stewart_Johnson.md` -- Kap. 12: Differential Games, Bellman, Regelungstheorie
> - `docs/books/new/Die 36 Srategeme-ProfRick.md` -- Strategeme, Kipppunkte, Krisenlogik, Cheap Talk vs. Costly Signals
> - `docs/books/new/Differential_and_Algorithmic_Game_Theory_-_Edgard_A_Pimentel.md` -- Evolutionary GT, Mean Field Games, Replicator Dynamics, Hopf-Bifurkationen
> - `docs/books/advanced-in-financial-markets-ml.md` -- AFML: Meta-Labeling, Regime Detection, Feature Importance

---

## Inhaltsverzeichnis

0. [Theoretischer Rahmen: Drei Weltbilder](#0-theoretischer-rahmen-drei-weltbilder)
   - 0.1 [Rieck / Klassische Spieltheorie: Ordnung durch Strategie](#01-rieck--klassische-spieltheorie-ordnung-durch-strategie)
   - 0.2 [Keen / Minsky: Endogene Instabilitaet](#02-keen--minsky-endogene-instabilitaet)
   - 0.3 [Bellman / Control Theory: Optimierung ueber Zeit](#03-bellman--control-theory-optimierung-ueber-zeit)
   - 0.4 [Warum man alle drei braucht](#04-warum-man-alle-drei-braucht)
1. [Control Theory als Bruecke](#1-control-theory-als-bruecke)
   - 1.1 [Was Control Theory ist](#11-was-control-theory-ist)
   - 1.2 [Maerkte als Regelkreise](#12-maerkte-als-regelkreise)
   - 1.3 [Warum AI-Agenten Instabilitaet verstaerken](#13-warum-ai-agenten-instabilitaet-verstaerken)
   - 1.4 [Design-Prinzipien fuer stabile Systeme](#14-design-prinzipien-fuer-stabile-systeme)
2. [Warum Game Theory in einer Trading-Plattform?](#2-warum-game-theory-in-einer-trading-plattform)
3. [Ist-Zustand: Was existiert](#3-ist-zustand-was-existiert)
   - 3.1 [Architektur-Ueberblick](#31-architektur-ueberblick)
   - 3.2 [Python Scoring Engine (v1)](#32-python-scoring-engine-v1)
   - 3.3 [Go Orchestrierung](#33-go-orchestrierung)
   - 3.4 [Next.js Bridge + API Route](#34-nextjs-bridge--api-route)
   - 3.5 [React Frontend Panel](#35-react-frontend-panel)
   - 3.6 [Tests](#36-tests)
   - 3.7 [Integration ins Composite Signal](#37-integration-ins-composite-signal)
4. [Ehrliche Bewertung: Was davon ist echte Game Theory?](#4-ehrliche-bewertung-was-davon-ist-echte-game-theory)
5. [Soll-Zustand: Stufenplan v1 → v7](#5-soll-zustand-stufenplan-v1--v7)
   - 5.1 [Stufe v2: Historisches Backtesting](#51-stufe-v2-historisches-backtesting)
   - 5.2 [Stufe v3: Spieler-Modellierung (Normal Form)](#52-stufe-v3-spieler-modellierung-normal-form)
   - 5.3 [Stufe v4: Sequentielle / Dynamische Games (Extensive Form)](#53-stufe-v4-sequentielle--dynamische-games-extensive-form)
   - 5.4 [Stufe v5: Evolutionary Game Theory + Replicator Dynamics](#54-stufe-v5-evolutionary-game-theory--replicator-dynamics)
   - 5.5 [Stufe v6: Bayesian Adaptive + Mean Field Games](#55-stufe-v6-bayesian-adaptive--mean-field-games)
   - 5.6 [Stufe v7: Control-Theoretic Stability Layer](#56-stufe-v7-control-theoretic-stability-layer)
6. [Buch-Referenz-Index (6 Buecher)](#6-buch-referenz-index-6-buecher)
7. [Mapping auf unsere drei Signal-Ebenen](#7-mapping-auf-unsere-drei-signal-ebenen)
8. [Die 36 Strategeme als Krisenlogik-Framework](#8-die-36-strategeme-als-krisenlogik-framework)
   - 8.1 [Knowledge Graph statt Vector DB fuer Strategeme + Behavioral Ops](#knowledge-graph-statt-vector-db-fuer-strategeme--behavioral-ops)
9. [Offene Fragen und Design-Entscheidungen](#9-offene-fragen-und-design-entscheidungen)

---

## 0. Theoretischer Rahmen: Drei Weltbilder

Bevor wir Code schreiben, muessen wir verstehen welche Denkmodelle hier aufeinandertreffen und warum keins allein reicht.

### 0.1 Rieck / Klassische Spieltheorie: Ordnung durch Strategie

**Grundannahmen:**
1. Akteure sind rational
2. Sie antizipieren Strategien anderer
3. Systeme tendieren zu **Gleichgewichten**

**Nash-Gleichgewicht:** Ein Zustand in dem niemand seine Strategie verbessern kann, solange alle anderen ihre Strategie beibehalten.

#### Wie Nash konkret funktioniert

**Schritt 1 -- Spiel definieren:**
- Spieler identifizieren: z.B. {Retail-Trader, Institutionelle, Zentralbank}
- Strategien pro Spieler: z.B. {buy_risk, sell_risk, hold}
- Payoff-Funktion: Was bekommt jeder Spieler fuer jede Strategie-Kombination?

**Schritt 2 -- Payoff-Matrix aufstellen:**

Vereinfachtes 2-Spieler-Beispiel (Retail vs. Institutionelle) nach geopolitischem Schock:

|  | Institutionelle: Buy | Institutionelle: Sell | Institutionelle: Hold |
|---|---|---|---|
| **Retail: Buy** | (-2, -1) | (-4, +3) | (-1, 0) |
| **Retail: Sell** | (+3, -2) | (+1, +1) | (+2, 0) |
| **Retail: Hold** | (0, -1) | (0, +1) | (0, 0) |

Jede Zelle = (Payoff Retail, Payoff Institutionelle). Die Werte spiegeln: Wer kauft allein gegen den Trend verliert. Wer mit dem Trend verkauft gewinnt. Hold ist neutral.

**Schritt 3 -- Nash-Gleichgewicht finden:**

Fuer jeden Spieler pruefen: "Kann ich mich verbessern wenn ich allein meine Strategie aendere?"

- Wenn Institutionelle "Sell" spielen → Retail's bester Zug ist "Sell" (+1 > -4 > 0)
- Wenn Retail "Sell" spielt → Institutionelle's bester Zug ist "Sell" (+1 > -2 > 0)
- **(Sell, Sell) ist Nash-Gleichgewicht:** Keiner kann allein abweichen und sich verbessern

→ **Market Bias Ableitung:** Nash = (Sell, Sell) → **risk_off**

**Schritt 4 -- Was Nash NICHT sagt:**

Nash sagt: "Das ist ein stabiler Zustand." Nash sagt NICHT:
- **Ob das Gleichgewicht erreichbar ist** (wie kommen die Spieler dahin?)
- **Ob es einzigartig ist** (es kann mehrere Nash-GG geben)
- **Ob es effizient ist** (Gefangenendilemma: Nash ist suboptimal fuer alle)
- **Ob es stabil bleibt** (kleine Stoerung kann es zerstoeren)
- **Was passiert auf dem Weg dorthin** (Uebergangsdynamik)

#### Die Progression ab Nash -- was danach kommt

```
Nash (statisch)
  │
  ├─→ Mixed Strategy Nash
  │     Wenn kein reines GG existiert: Spieler randomisieren.
  │     z.B. "mit 60% Wahrscheinlichkeit sell, 40% hold"
  │     → Gibt uns Bias-VERTEILUNGEN statt Binary
  │
  ├─→ Correlated Equilibrium
  │     Ein externer Mediator (z.B. ein Signal/Indikator) koordiniert.
  │     "Wenn Signal X kommt, spiele Y." Lockerer als Nash.
  │     → Relevanz: Unser Composite Signal IST ein Mediator
  │
  ├─→ Extensive Form / Subgame Perfect (v4)
  │     Spiel ueber mehrere Zuege. Backward Induction.
  │     "Wenn ich jetzt sanktioniere, was macht der andere danach?"
  │     → Eskalationsketten, Spielbaeume
  │
  ├─→ Bayesian Nash (v6)
  │     Spieler kennen die Payoffs anderer nicht genau.
  │     Jeder hat Beliefs (Wahrscheinlichkeitsverteilung) ueber andere.
  │     → Informationsasymmetrie, Insider vs. Outsider
  │
  ├─→ Evolutionary Stable Strategy / Replicator Dynamics (v5)
  │     Kein "rationales Waehlen" mehr. Strategien die performen
  │     breiten sich aus, andere sterben. Population statt Individuum.
  │     → Keen-kompatibel: kein Gleichgewichts-ZWANG
  │
  ├─→ Markov Perfect Equilibrium (v5/v6)
  │     Nash + Bellman: Optimale Strategie haengt vom Systemzustand ab.
  │     Strategie-Wechsel je Regime (Bull/Bear/Sideways).
  │     → Dynamische Spieltheorie + Control Theory
  │
  └─→ Mean Field Equilibrium (v6)
        Tausende Spieler. Jeder optimiert gegen das "Feld" (Verteilung
        aller anderen). Loest das Skalierungsproblem.
        → Hamilton-Jacobi-Bellman + Fokker-Planck
```

**Die Pointe der Progression:** Nash ist der Anfangspunkt -- statisch, vollstaendige Information, endlich viele Spieler, ein Zug. Jede Erweiterung lockert eine dieser Annahmen. Unsere Plattform muss entscheiden, welche Annahmen wir lockern muessen und in welcher Reihenfolge.

**Intuition (Rieck-Stil):** Gesellschaft und Maerkte sind strategische Schachspiele. Menschen passen sich gegenseitig an → stabile Muster entstehen. Preisbildung, Kooperation vs. Betrug, politische Strategien -- alles durch strategische Anpassung erklaerbar.

**Weltbild:** Maerkte sind strategische Gleichgewichtssysteme.

**Was Rieck zusaetzlich liefert (36 Strategeme):** Nicht nur formale Spieltheorie, sondern **Krisenlogik** -- wie Krisen ablaufen, wie Kipppunkte funktionieren, wie man Signale liest. "Cheap Talk" vs. "Costly Signals" (Strategem 6 vs. 8), Punkte ohne Widerkehr, Dammbruch-Dynamik. Das ist direkt relevant fuer unsere Event-Bewertung.

### 0.2 Keen / Minsky: Endogene Instabilitaet

**Fundamentale Kritik:** Die Wirtschaft ist kein Gleichgewichtssystem, sondern ein **dynamisches Nichtgleichgewichtssystem**.

**Keens Hauptargumente:**

1. **Nash ignoriert Zeit und Schulden.** Spieltheorie betrachtet statische oder wiederholte Spiele mit stabilen Regeln. Reale Oekonomien haben Kreditexpansion, Zinseszins, Bilanzdynamik. Nicht nur Strategien aendern sich -- **die Regeln evolvieren.**

2. **Maerkte erreichen Gleichgewichte nicht schnell genug.** Ein Nash-Gleichgewicht setzt voraus, dass das Spiel stabil genug ist um ein Gleichgewicht ueberhaupt zu erreichen. Kapitalistische Oekonomien veraendern sich schneller als Gleichgewichte entstehen koennen.

3. **Rationales Verhalten erzeugt kollektiv irrationale Systeme (Minsky-Paradox).** Wenn jeder rational hebelt weil es individuell optimal ist, waechst das Systemrisiko bis zum Crash. Stabilitaet erzeugt Instabilitaet.

**Vereinfachtes Keen-System (Differentialgleichungen):**

```
d(Debt)/dt     = Investment - Profits
d(Wages)/dt    = f(Employment)
d(Employment)/dt = g(Investment)
```

Das System entwickelt sich kontinuierlich ueber Zeit. Es gibt oft **keinen stabilen Fixpunkt** -- stattdessen Zyklen, Instabilitaeten, Crashs, chaotische Dynamik.

**Weltbild:** Instabilitaet entsteht endogen aus Finanzdynamik, nicht durch externe Schocks.

**Physikalische Analogie:**
- Spieltheorie = **Statik** (Kraefte gleichen sich aus, Ball in einer Schuessel)
- Keen = **Nichtlineare Dynamik / Turbulenz** (die Schuessel bewegt sich, wird tiefer durch Schulden, kippt irgendwann um)

**Exergie-Erweiterung (ENTROPY_NOVELTY.md Sek. 1.2-1.3, Keen/Ayres/Standish 2018):**

Keens Instabilitaets-These hat eine physikalische Grundlage die ueber Finanz-Dynamik hinausgeht: Standard-Oekonomie unterschaetzt den Energie-Anteil an der Produktion systematisch. Keen et al. zeigen: Der Solow-Residual (das "unerklarte Produktivitaetswachstum" A in Q = A*K^α*L^β) ist in Wahrheit der Exergie-Effizienz-Beitrag der Maschinen. Das bedeutet:

| Standard-Modell | Keen-Modell | Konsequenz |
|---|---|---|
| Energie-Anteil χ ≈ 0.007 | Exergie-Anteil α ≈ 2/3 | 99% Energie-Einbruch → Standard: 28% Output-Verlust. Keen: ~90% |
| Solow-Residual = "Technologie" | Solow-Residual = Exergie-Effizienz | "Wachstum" ist hauptsaechlich Energieumwandlung, nicht abstrakte Innovation |
| GDP = monetaere Transaktionen | Exergie-GDP = nuetzliche Arbeit | Stau, Unfallkosten, Verschwendung erhoehen Standard-GDP aber senken Exergie-GDP |

Fuer unser System: Der `keen_multiplier` (MEMORY_ARCHITECTURE.md Sek. 6.2, `exergy_shock` Edge) ist ein Contrarian-Meta-Signal: "Um wie viel unterschaetzt der Markt diesen physischen Impact?" Typisch 2-6x bei Energie-Schocks.

### 0.3 Bellman / Control Theory: Optimierung ueber Zeit

**Bellman-Gleichung (Dynamic Programming):**

```
V(s) = max_a [ R(s,a) + γ V(s') ]
```

Der optimale heutige Entscheid haengt vom erwarteten zukuenftigen Wert ab. Grundlage fuer Reinforcement Learning, dynamische Makrooekonomie, optimale Kontrolle.

**Verbindung zur Spieltheorie:** Wenn mehrere Akteure Bellman-Probleme loesen entsteht ein **dynamisches Spiel** → Markov Perfect Equilibrium (zeitabhaengige Version von Nash).

**Keens Einwand auch hier:** Bellman optimiert innerhalb eines Systems. Keen untersucht Systeme die sich selbst veraendern. Das ist ein kategorialer Unterschied.

Bellman setzt (implizit) voraus: Uebergangsdynamik ist stabil genug um Werte zu lernen. In Multi-Agent-Oekonomien haengt die "Transition" von anderen Policies ab die sich staendig aendern. **Du optimierst ein Ziel in einem System das durch Optimierung selbst umgeformt wird.**

### 0.4 Warum man alle drei braucht

> **Zentrale Einsicht:** Keen/Minsky haben Recht -- man kann statistisch/statisch so grosse und komplexe Systeme nicht angehen, indem man es sich einfacher macht und die Wirklichkeit an die Theorie anpasst statt umgekehrt.

Aber das heisst nicht, dass Spieltheorie nutzlos ist. Es heisst, dass wir **drei Ebenen** trennen muessen:

| Ebene | Werkzeug | Frage |
|---|---|---|
| **Strategische Interaktion** | Spieltheorie (Rieck, Nash, Basar) | Wer reagiert wie auf wen? Was sind die Anreize? |
| **Systemdynamik** | Differentialgleichungen, ABMs (Keen, Minsky) | Wie entwickeln sich Schulden, Liquiditaet, Preise, Volatilitaet ueber Zeit? |
| **Kontrolle / Stabilitaet** | Control Theory, Bellman | Welche Policies stabilisieren den Regelkreis? Wie verhindert man Explosion? |

Nash ist dann ein **Spezialfall**: ein lokaler Ruhepunkt in einem dynamischen System, der stabil oder instabil sein kann. Und Bellman ist das Werkzeug um Policies zu bauen -- aber man braucht zusaetzlich **Stabilitaetskriterien**, sonst optimiert man sich in den Crash.

Die zukuenftige Synthese: **Agent-Based Models + Reinforcement Learning**, wo Gleichgewicht Ergebnis ist, nicht Voraussetzung.

---

## 1. Control Theory als Bruecke

### 1.1 Was Control Theory ist

Control Theory (Regelungstheorie) beantwortet eine einzige Frage:

> **Wie steuert man ein dynamisches System so, dass es stabil bleibt, obwohl sich alles staendig veraendert?**

Nicht: "Was ist optimal?" Sondern: "Wie verhindert man, dass das System explodiert?"

**Regelkreis-Schema:**

```
Ziel (Setpoint) → Controller → System (Plant) → Messung (Feedback) → zurueck zum Controller
```

| Control-Element | Trading-Plattform |
|---|---|
| Sensoren | OHLCV-Feeds, ACLED-Events, Sentiment-Scores, Order Flow |
| Controller | Scoring-Algorithmen, Signal-Gewichtung, Position-Sizing |
| Aktoren | Trade-Signale, Bias-Indikatoren, Risk-Adjustments |
| Plant (System) | Der reale Markt (reagiert auf alle Teilnehmer gleichzeitig) |
| Feedback | P&L, Drawdown, Signal-Accuracy, Regime-Shifts |

### 1.2 Maerkte als Regelkreise

Maerkte SIND Regelkreise -- nicht metaphorisch, strukturell:

```
Nachrichten/Events → Marktteilnehmer (Controller) → Orders (Aktoren) → Preisbewegung (Plant)
       ↑                                                                          │
       └────────────── Preise als Feedback ────────────────────────────────────────┘
```

Social Media = ultraschneller Feedbackkanal. AI-Agenten = neue Controller. Das Problem: Wenn Controller schneller und aggressiver werden ohne Stabilitaetsdesign → Overshoot, Oszillationen, Divergenz (Crash).

### 1.3 Warum AI-Agenten Instabilitaet verstaerken

Drei Mechanismen die direkt fuer unsere Plattform relevant sind:

**A) Geschwindigkeit + Homogenitaet → Synchronisation**

Wenn viele Agenten aehnliche Modelle nutzen, sehen alle denselben Trend, reagieren aehnlich, reagieren schneller als Menschen. Das erzeugt **Crowding**: alle auf derselben Seite. Kleine Schocks werden grosse Moves.

> Physik-Sprache: Erhoehte Kopplung zwischen Teilchen → Phasenuebergaenge werden wahrscheinlicher.

**B) Optimierung drueckt Puffer weg → fragilere Systeme**

Agenten optimieren kurzfristig: weniger Cash-Puffer, aggressiveres Risk-Budget, engere Stops. Das erhoeht Effizienz UND senkt Robustheit. Stabilitaet ist oft ein Nebenprodukt von Ineffizienz (Puffer, Friktionen). AI raeumt Friktionen weg → System wird bruchanfaellig.

**C) Leverage-Feedback → Minsky-Dynamik in Software**

Erfolg → mehr Risiko erlaubt → mehr Leverage → noch mehr Erfolg ... bis ein Schock kommt → Deleveraging → Fire Sales → Crash. Die klassische Minsky-Schleife, nur automatisiert.

### 1.4 Design-Prinzipien fuer stabile Systeme

> "Keen-Engineering" -- Stabilitaet vor Optimalitaet

| Prinzip | Bedeutung | Umsetzung bei uns |
|---|---|---|
| **Diversitaet erzwingen** | Nicht alle dieselbe Policy | Composite Signal aus dekorrelierten Dimensionen (Sek. 3.7) |
| **Puffer einbauen** | Rate Limits, Cash Buffer, Risk Budget | Position Sizing mit ATR-Floors, kein All-in |
| **Hysterese** | Nicht bei jeder Miniaenderung umschalten | Signal-Schwellen mit Dead-Zones (Score muss sich um >X aendern) |
| **Stabilitaet > Optimalitaet** | Control-Mindset statt Gewinn-Maximierung | Regime-abhaengige Gewichtung, Drawdown-Limits |
| **Stress-Tests auf Feedback** | Was passiert wenn alle gleichzeitig dasselbe tun? | Crowding-Detektor (VPIN, Correlation-Spike) |
| **Time-Delay Awareness** | Verzoegerte Reaktionen koennen Instabilitaet erzeugen | Hopf-Bifurkation als Warnsignal (Pimentel, Kap. 8) |

---

## 2. Warum Game Theory in einer Trading-Plattform?

Klassische Technische Analyse behandelt den Markt wie ein Naturphaenomen: "Wenn RSI > 70, dann ueberkauft." Das ignoriert zwei Dinge:

1. **Maerkte sind strategische Interaktionen** zwischen Akteuren mit unterschiedlichen Informationen, Zeithorizonten und Zielen (→ Spieltheorie noetig)
2. **Maerkte sind dynamische Systeme** mit endogener Instabilitaet, Feedback-Schleifen und Regime-Wechseln (→ Control Theory + Keen noetig)

| Problem | Klassisch (Indikatoren) | Game-Theory + Control-Ansatz |
|---|---|---|
| Geopolitische Events beeinflussen Kurse | Ignoriert oder manuell | Systematisches Scoring: Event → Impact → Bias → Symbols |
| Verschiedene Akteure handeln gegeneinander | Alle gleich behandelt | Spieler-Modellierung: Retail vs. Institutional vs. Zentralbanken |
| Regime-Wechsel entwerten Indikatoren | Statische Gewichtung | Dynamische Anpassung + Stabilitaets-Monitoring |
| Informationsasymmetrie | Nur Preis/Volumen | Soft-Signals als zusaetzliche Dimension |
| Eskalation/Deeskalation | Kein Konzept | Sequentielle Spiele + Spielbaeume + Strategeme |
| Systemische Instabilitaet | Nicht modelliert | Feedback-Loop-Detection, Minsky-Indikatoren, Crowding-Warnung |

**Zentrale These:** Der Game-Theory Impact Score bringt eine **dekorrelierte Dimension** ins Composite Signal -- Information die rein technische Indikatoren nicht enthalten. Aber: Diese Dimension muss systemisch gedacht werden (Keen), nicht nur strategisch (Nash).

---

## 3. Ist-Zustand: Was existiert

### 3.1 Architektur-Ueberblick

```
                                        ┌──────────────────────────┐
                                        │     React Frontend       │
                                        │  GeopoliticalGameTheory  │
                                        │       Panel.tsx          │
                                        └──────────┬───────────────┘
                                                   │ GET /api/geopolitical/game-theory/impact
                                        ┌──────────▼───────────────┐
                                        │   Next.js API Route      │
                                        │   route.ts (Proxy)       │
                                        └──────────┬───────────────┘
                                                   │ GET (via Bridge mit Cache)
                                        ┌──────────▼───────────────┐
                                        │     Go Gateway :9060     │
                                        │  GameTheoryImpactHandler │
                                        │         ↓                │
                                        │  GameTheoryService       │
                                        │    ├─ ACLED Connector    │
                                        │    └─ GameTheory Client  │
                                        └──────────┬───────────────┘
                                                   │ POST /api/v1/game-theory/impact
                                        ┌──────────▼───────────────┐
                                        │  Python Service :8091    │
                                        │  geopolitical-soft-      │
                                        │  signals/game_theory.py  │
                                        │  build_game_theory_      │
                                        │  impact()                │
                                        └──────────────────────────┘
```

**Dateien-Inventar:**

| Layer | Datei | LoC | Funktion |
|---|---|---|---|
| **Python** | `python-backend/ml_ai/geopolitical_soft_signals/game_theory.py` | 263 | Scoring-Engine: Event → Impact Score + Bias |
| **Python** | `python-backend/services/geopolitical-soft-signals/app.py` | ~51 | FastAPI Endpoint `/api/v1/game-theory/impact` |
| **Go** | `go-backend/internal/connectors/gametheory/client.go` | 175 | HTTP Client → Python Scorer |
| **Go** | `go-backend/internal/services/geopolitical/game_theory_service.go` | 135 | Orchestrierung: ACLED Events holen + Scoring aufrufen |
| **Go** | `go-backend/internal/handlers/http/geopolitical_game_theory_handler.go` | 113 | HTTP Handler (GET, Query-Params, Validation) |
| **Go** | `go-backend/internal/contracts/geopolitical.go` | 99 | API-Response-Typen |
| **Go** | `go-backend/internal/app/wiring.go` | (Auszug) | Dependency Injection + Route Registration |
| **TS** | `src/lib/server/geopolitical-game-theory-bridge.ts` | 243 | Server-Side Bridge: Go Gateway Call + In-Memory Cache (120s TTL) |
| **TS** | `src/app/api/geopolitical/game-theory/impact/route.ts` | 30 | Next.js API Route (Proxy zum Bridge) |
| **TSX** | `src/features/geopolitical/GeopoliticalGameTheoryPanel.tsx` | 109 | UI Panel: Summary + Item Cards |
| **TS** | `src/features/geopolitical/shell/types.ts` | (Auszug) | TypeScript Interfaces |
| **Go Tests** | 3 Test-Dateien | 378 | 9 Tests: Contract, Validation, Error Propagation |

### 3.2 Python Scoring Engine (v1)

**Algorithmus:** Regelbasiertes Keyword-Matching mit festen Score-Aufschlaegen.

```
Basis-Score: 0.28
  + fatalities >= 50     → +0.38 ("fatalities_extreme")
  + fatalities >= 10     → +0.25 ("fatalities_high")
  + fatalities >= 1      → +0.12 ("fatalities_nonzero")
  + RISK_OFF_TOKEN match → +0.22 ("kinetic_or_sanctions_escalation")
  + protest/riot/unrest  → +0.08 ("civil_unrest")
  + election             → +0.06 ("election_volatility")
  + central bank/rate    → +0.05 ("policy_rate_channel")
  - RISK_ON_TOKEN match  → -0.14 ("deescalation_signal")
  = clamp(0.05, 0.98) → impactScore
```

**RISK_OFF_TOKENS:** battle, armed clash, air strike, missile, drone, attack, explosion, violence, sanction, embargo, export control, retaliation

**RISK_ON_TOKENS:** ceasefire, de-escalation, truce, talks, agreement, negotiation

**Bias-Ableitung:**
- `risk_on` wenn Deeskalations-Token UND Score < 0.55
- `risk_off` wenn Score >= 0.6
- `neutral` sonst

**Confidence:** Basis 0.44 + 0.06 pro Driver (max 0.3) + 0.06 wenn Source vorhanden. Clamp [0.2, 0.96].

**Region-zu-Symbol Mapping (statisch):**

| Region | Symbols |
|---|---|
| Europe | DAX, SX5E, EURUSD |
| Middle East | BRENT, XAUUSD, USDILS |
| Asia | NIKKEI, HSI, USDJPY |
| Americas | SPY, VIX, US10Y |
| Africa | XAUUSD, WTI, DXY |
| Global (Fallback) | SPY, DXY, XAUUSD |

**Country-zu-Region Mapping:** 18 Laender → 5 Regionen.

### 3.3 Go Orchestrierung

`GameTheoryService.AnalyzeImpact()` orchestriert:
1. Events von ACLED holen (`eventsClient.FetchEvents`)
2. Events filtern (leere ID oder EventType verwerfen)
3. An Python Scorer weiterleiten (`scorer.ScoreImpact`)
4. Ergebnis 1:1 mappen + Source-Fallback

Wiring in `go-backend/internal/app/wiring.go`:
```
gameTheoryClient → Python :8091
geopoliticalGameTheoryService := NewGameTheoryService(acledClient, gameTheoryClient)
mux.HandleFunc("/api/v1/geopolitical/game-theory/impact", handler)
```

### 3.4 Next.js Bridge + API Route

**Bridge** (`geopolitical-game-theory-bridge.ts`): Go Gateway Call + In-Memory Cache (120s TTL, konfigurierbar). Normalisiert alle Felder.

**API Route** (`route.ts`): Reiner Proxy -- Query-Params → Bridge → JSON.

### 3.5 React Frontend Panel

`GeopoliticalGameTheoryPanel.tsx` zeigt:
- **Summary Grid** (2x2): Analyzed Events, Avg Impact, Risk Off Count, Top Region
- **Item Cards** (max 6): MarketBias Badge, Impact %, Confidence %, Datum, Event Title, Region, Symbols

### 3.6 Tests

| Test-Datei | Tests | Coverage |
|---|---|---|
| `game_theory_service_test.go` | 3 | Event-Mapping, Fetcher-Error, Scorer-Error |
| `geopolitical_game_theory_handler_test.go` | 3 | Stable Contract, Date Validation, Service Error → 502 |
| `client_test.go` | 3 | HTTP Roundtrip, Upstream Status, Empty Events |

**Fehlend:** Python-Unit-Tests, Frontend-Tests, E2E-Pipeline-Test.

### 3.7 Integration ins Composite Signal

Der Game-Theory Impact Score fliesst als Feature in den Composite Signal Feature-Vektor (`INDICATOR_ARCHITECTURE.md` Sek. 3):

```python
feature_vector = {
    "sma50_slope": compute_sma50_slope(ohlcv),       # Preis-Trend
    "heartbeat_score": compute_heartbeat(ohlcv),       # Rhythmus
    "swv": compute_spike_weighted_vol(ohlcv),          # Volumen
    "geopolitical_risk": game_theory_impact_score,     # ← Game Theory
    "news_sentiment": sentiment_model_score,           # ← Soft-Signal
}
```

**Status:** Geplant, nicht implementiert. Konzept existiert in der Architektur-Doku.

---

## 4. Ehrliche Bewertung: Was davon ist echte Game Theory?

**Kurze Antwort: Nichts davon ist formale Game Theory.** Und im Licht der Keen/Minsky-Kritik ist das nicht nur ein Label-Problem -- es fehlt das gesamte dynamische Fundament.

| Formales Konzept | Vorhanden? | Details |
|---|---|---|
| **Spieler (Players)** | Nein | Keine Akteure. Kein "wer handelt gegen wen" |
| **Strategien (Actions)** | Nein | Events werden passiv gelesen, nicht als Zuege modelliert |
| **Payoff-Funktionen** | Nein | Feste Score-Aufschlaege statt spielerhaengiger Auszahlungen |
| **Nash-Gleichgewicht** | Nein | Kein Equilibrium-Konzept |
| **Dominante Strategien** | Nein | Keine Dominanz-Analyse |
| **Information Sets** | Nein | Keine Unterscheidung wer was wann weiss |
| **Sequentielle Zuege** | Nein | Jedes Event isoliert, keine Aktion-Reaktion-Ketten |
| **Bayesian Updating** | Nein | Kein Lernen aus Vergangenheit |
| **Feedback-Schleifen** | Nein | Kein Konzept von Rueckkopplung |
| **Endogene Instabilitaet** | Nein | Kein Minsky-/Keen-Konzept |
| **Replicator Dynamics** | Nein | Keine evolutionaere Strategie-Selektion |
| **Mean Field** | Nein | Keine Aggregation vieler Agenten |

**Was v1 tatsaechlich ist:**
- Ein **Sentiment-Classifier** (risk_on / risk_off / neutral)
- Ein **Region-zu-Symbol Mapper** (statisches Lookup)
- Ein **Severity-Scorer** (Fatalities + Keywords → Impact Score)

Die Infrastruktur (ACLED → Go → Python → Frontend) ist solide. Aber **v1 ist eine Heuristik, kein strategisches oder dynamisches Modell.**

---

## 5. Soll-Zustand: Stufenplan v1 → v7

> **Leitprinzip:** Die Wirklichkeit an die Theorie anzupassen ist falsch. Die Theorie muss die Wirklichkeit abbilden -- auch wenn das komplexer ist. Jede Stufe baut auf der vorherigen auf und erweitert die Modellierung um eine neue Dimension.

### 5.1 Stufe v2: Historisches Backtesting (Event → Marktreaktion)

> **Frage:** "Stimmen unsere heuristischen Scores mit der Realitaet ueberein?"

**Was gebaut wird:**
- ACLED-Events (2020-2026) gegen tatsaechliche Marktbewegungen testen
- Pro Event: Score berechnen → Marktreaktion in gemappten Symbolen messen (1h, 4h, 24h, 1w)
- Korrelationsanalyse: Wie gut sagt `impactScore` die reale Volatilitaet/Richtung vorher?
- Confusion Matrix: risk_off gesagt → Markt tatsaechlich gefallen?
- Score-Gewichte kalibrieren basierend auf Evidenz

**Ergebnis:** Kalibrierte Gewichte statt handgecodete `+0.38`. Aber immer noch kein strategisches Modell.

**Aufwand:** Mittel. **Wo:** `python-backend/ml_ai/geopolitical_soft_signals/`

### 5.2 Stufe v3: Spieler-Modellierung (Normal Form Game)

> **Frage:** "Wenn Event X passiert -- was tun die verschiedenen Marktteilnehmer rational?"

**Formalisierung:**
```
Spieler:    P = {Retail, Institutional, Zentralbanken, Staaten}
Aktionen:   A = {buy_risk, sell_risk, hedge, hold}
Payoff:     U(p, a, event) = f(position, marktbewegung, kosten)
```

**Bias-Ableitung aus Nash-Gleichgewicht statt aus Keywords.**

**Keen-Warnung fuer v3:** Nash-Gleichgewicht sagt "stabil" -- aber ein Nash-Gleichgewicht kann instabil sein (kleine Abweichung waechst), ineffizient (Gefangenendilemma: alle ueberhebeln weil es individuell rational ist), oder katastrophal. v3 muss deshalb immer mit Stabilitaets-Check kombiniert werden.

**Buch-Referenz:** Basar & Olsder Kap. 1-3, Ozdaglar Strategic Form Games

**Aufwand:** Hoch.

### 5.3 Stufe v4: Sequentielle / Dynamische Games (Extensive Form)

> **Frage:** "Wie entwickelt sich eine Eskalationskette und was ist das wahrscheinlichste Endresultat?"

```
Spielbaum:
  Staat A: Sanktion
    → Staat B: Vergeltung
        → Markt: Panik-Verkauf (risk_off)    ← Strategem 5: "Bei einem Feuer einen Raub begehen"
        → Markt: Einpreisen (neutral)
    → Staat B: Deeskalation
        → Markt: Relief Rally (risk_on)

Loesung: Backward Induction → Subgame Perfect Equilibrium
```

**Strategeme-Mapping (Rieck):** Eskalationsketten folgen oft denselben Mustern die die 36 Strategeme beschreiben. Kipppunkte (Strategem 1), Point of no Return, Dammbruch-Dynamik, Cheap Talk vs. Costly Signals -- das sind formalisierbare Krisenlogik-Patterns.

**Buch-Referenz:** Basar & Olsder Kap. 5-6, Optimal Control Kap. 12, Rieck (Strategeme 1-6)

**Aufwand:** Sehr hoch. **Voraussetzung:** v3.

### 5.4 Stufe v5: Evolutionary Game Theory + Replicator Dynamics

> **Frage:** "Welche Trading-Strategien setzen sich durch und welche sterben aus?"

**Warum EGT:** In klassischer GT waehlen Spieler Strategien rational. In EGT werden Strategien **selektiert** -- erfolgreiche breiten sich aus, erfolglose verschwinden. Das beschreibt wie Markt-Populationen sich ueber Zeit veraendern.

**Replicator Dynamics (aus Pimentel Kap. 2):**
```
dpi/dt = pi * (fi(p) - f_avg(p))
```

Die Rate mit der Strategie i in der Population waechst, haengt davon ab ob sie ueberdurchschnittlich performed. Das ist ein Differentialgleichungs-System -- direkt kompatibel mit Keen.

**Kritischer Beitrag aus Pimentel Kap. 8 (Wettergren): Time-Delay-Induced Hopf Bifurcations.** Wenn die Verzoegerung zwischen Beobachtung und Anpassung gross genug wird, entsteht Instabilitaet -- das System oszilliert statt zu konvergieren. Das ist mathematisch exakt der Mechanismus den Keen beschreibt:

> Agenten reagieren auf veraltete Informationen → System wird instabil → Limit Cycles statt Gleichgewicht.

**Was gebaut wird:**
- Strategie-Populationen tracken: Wie viele Akteure sind bullish/bearish/neutral?
- Replicator Dynamics simulieren: Welche Strategie breitet sich aus nach Event X?
- Hopf-Bifurkation als Warnsignal: Wenn Delay zu gross → Instabilitaet wahrscheinlich

**Buch-Referenz:** Pimentel Kap. 2 (EGT Grundlagen, Replicator), Kap. 8 (Time-Delay, Hopf Bifurcation)

**Verbindung zu Entropy Collapse (ENTROPY_NOVELTY.md Sek. 1.1, Truong & Truong 2025):**

Replicator Dynamics sind einer der Update-Mechanismen fuer die Truong & Truong Universalitaet beweisen: Wenn Feedback-Amplifikation (erfolgreiche Strategien breiten sich aus) die Novelty-Regeneration (neue Strategien entstehen) dauerhaft uebersteigt, kollabiert die Strategie-Diversitaet irreversibel. Das ist exakt das Endstadium der Replicator Dynamics wenn eine Strategie die Population dominiert:

```
Replicator → Dominant Strategy → Population Monokultur → Entropy Collapse
dpi/dt = pi * (fi(p) - f_avg(p))  →  wenn fi >> f_avg: pi → 1, alle anderen → 0
```

Fuer unsere Implementation: Die Hopf-Bifurkation (Instabilitaet durch Delay) ist das *optimistische* Szenario -- das System oszilliert, kollabiert aber nicht. Das *pessimistische* Szenario ist Entropy Collapse: Eine Strategie dominiert so stark, dass keine Oszillation mehr moeglich ist -- stille Monokultur. Der Entropy Health Monitor (INDICATOR_ARCHITECTURE.md Sek. 5t) ueberwacht genau dieses Risiko.

**Aufwand:** Hoch. **Wo:** `python-backend/ml_ai/geopolitical_soft_signals/evolutionary.py`

### 5.5 Stufe v6: Bayesian Adaptive + Mean Field Games

> **Frage:** "Wie veraendern sich Marktreaktionen ueber Zeit und wie modelliert man tausende Agenten effizient?"

**Bayesian Updating:**
```
Prior:      P(risk_off | sanctions) = 0.7   (historisch)
Evidence:   Letzte 5 Sanctions-Events → nur 2x risk_off
Posterior:  P(risk_off | sanctions) = 0.45  (Markt adaptiert)
```

**Mean Field Games (aus Pimentel Kap. 5-6):** Wenn es tausende Agenten gibt, modelliert man nicht jeden einzeln, sondern das **Feld** (Verteilung) aller Agenten. Jeder Agent optimiert gegen das Feld, und das Feld ergibt sich aus allen Agenten. Fuehrt zu **Hamilton-Jacobi-Bellman + Fokker-Planck** Gleichungssystemen.

Relevanz: Statt "4 Spieler-Typen" (v3) modellieren wir die **Verteilung aller Marktteilnehmer** und deren kollektive Dynamik.

**Buch-Referenz:** Ozdaglar Bayesian Learning, Pimentel Kap. 5-6 (MFG), Basar & Olsder Kap. 9

**Aufwand:** Sehr hoch. **Voraussetzung:** v2 + v5.

### 5.6 Stufe v7: Control-Theoretic Stability Layer

> **Frage:** "Ist das System gerade stabil oder am Kippen? Wie verhindern wir, dass unsere eigenen Signale zur Instabilitaet beitragen?"

Das ist der **Keen-Layer** -- nicht Game Theory im engeren Sinn, aber die notwendige Ergaenzung die verhindert, dass optimale Strategien kollektiv zum Crash fuehren.

**Was gebaut wird:**
- **Stabilitaets-Monitor:** Lyapunov-Analyse oder empirische Proxies (VIX-Regime, Korrelations-Spike, VPIN-Extreme)
- **Crowding-Detektor:** Wenn zu viele Akteure denselben Trade machen → Signal abschwaechen
- **Hysterese-Filter:** Signale aendern sich nur wenn Schwelle ueberschritten (vermeidet Oszillation)
- **Minsky-Indikator:** Leverage-Zyklus tracken (Debt/GDP, Margin Debt, Credit Spreads)
- **Feedback-Loop-Warning:** Wenn eigene Signale → Marktbewegung → Signalverstaerkung → Explosion

**Buch-Referenz:** Optimal Control (Johnson) Kap. 1-8 (Stabilitaet, Regelkreise), Keen (Minsky-Modelle)

**Aufwand:** Mittel-Hoch (empirische Proxies zuerst, formale Analyse spaeter).

---

## 6. Buch-Referenz-Index (6 Buecher)

### Dynamic Noncooperative Game Theory (Basar & Olsder)

| Bereich | Relevanz | Stufe |
|---|---|---|
| Normal Form Games, Nash Equilibria | Payoff-Matrizen, Equilibrium-basierte Bias-Ableitung | v3 |
| Mixed Strategies | Probabilistische Bias-Verteilung wenn kein reines Nash existiert | v3 |
| Extensive Form, Subgame Perfection | Event-Ketten als Spielbaeume | v4 |
| Stochastic Games | Unsicherheit ueber Event-Auswirkung | v6 |
| Incomplete Information Games | Informationsasymmetrie | v6 |

### Network Games: Learning and Dynamics (Ozdaglar)

| Bereich | Relevanz | Stufe |
|---|---|---|
| Strategic Form Games + Nash | Formale Grundlage Spieler-Modell | v3 |
| Fictitious Play | Gegen empirische Verteilung vergangener Zuege spielen | v6 |
| Bayesian Learning | Belief-Updates basierend auf neuen Events | v6 |
| Congestion Games | Wenn zu viele denselben Trade machen → Signal stirbt | v5/v7 |
| Information Aggregation in Social Networks | Herdverhalten, Narrative-Spread | v5 |

### Optimal Control (Stewart Johnson)

| Kapitel | Relevanz | Stufe |
|---|---|---|
| Kap. 1-8: Regelungstheorie Grundlagen | Stabilitaet, Feedback, Regelkreise | v7 |
| Kap. 12: Differential Games | Multi-Agent-Optimierung mit kontinuierlicher Zeit | v4 |
| Nash in dynamischen Systemen (S. 190+) | Jeder Spieler co-optimiert Hamiltonian | v4 |
| Bang-Bang Controls | Extremreaktionen als optimale Strategie | v3 |
| Bellman Principle of Optimality | Dynamic Programming → RL-Grundlage | v5/v6 |

### Die 36 Strategeme der Krise (Prof. Rieck)

| Strategem / Konzept | Relevanz | Stufe |
|---|---|---|
| **Kipppunkte / Tipping Points** (Sek. 1, S. 370+) | Zustaende die Gleichgewichte trennen. Kleine Aenderungen → grosse Auswirkungen. Markt-Regime-Wechsel | v4/v7 |
| **Point of no Return** (Sek. 1, S. 303+) | Irreversible Zustandsaenderung. Dammbruch-Dynamik | v4 |
| **Cheap Talk vs. Costly Signals** (Strategem 6 vs. 8, S. 1094+) | Strategem 6 "Im Osten laermen" = Cheap Talk (kostenlos, unglaubwuerdig). Strategem 8 = hohe Kosten aufwenden um Signal glaubwuerdig zu machen. **Direkt relevant fuer Event-Scoring:** Eine Militaeruebung (costly) hat mehr Signalwert als eine diplomatische Erklaerung (cheap) | v3/v4 |
| **Verruerktheit vortaeuschen aber Gleichgewicht behalten** (Strategem 27) | Madman Theory in Verhandlungen. Relevant fuer geopolitische Akteure (Nordkorea-Pattern) | v4 |
| **Dammbruch / Kettenreaktion** (S. 419+) | Exponentielles Wachstum nach Schwellenwert-Ueberschreitung. Sell-Off-Kaskaden | v7 |
| **Krisen-Stabilitaets-Paradox** | Normalzeit = stabil = kooperativ. Krise = instabil = unkooperativ. In der Krise gelten andere Regeln | v5/v7 |
| **Ueberrumpelungseffekt** (S. 383+) | Unerwarteter Zug nahe Kipppunkt → ueberrollt Gegner. Flash-Crash-Muster | v7 |

### Differential and Algorithmic Intelligent Game Theory (Pimentel & Toni, 2026)

| Kapitel | Relevanz | Stufe |
|---|---|---|
| Kap. 1: EGT Grundlagen, Replicator Dynamics | Strategie-Selektion in Populationen, Folk Theorem (Nash = Ruhepunkt der Replicator Dynamics) | v5 |
| Kap. 2: Evolutionary Stable Strategies | Welche Strategien ueberleben Schocks? Permanence-Analyse | v5 |
| **Kap. 8: Time-Delay Hopf Bifurcations (Wettergren)** | **Kernbeitrag:** Wenn Feedback-Delay gross genug → Instabilitaet, Oszillation statt Konvergenz. Mathematisch exakter Keen/Minsky-Mechanismus | v5/v7 |
| Kap. 5-6: Mean Field Games | Hamilton-Jacobi-Bellman + Fokker-Planck fuer grosse Populationen | v6 |
| AI-assisted Behavioral GT | Multi-Agent AI, Imitation Learning, RL in strategischen Situationen | v5/v6 |
| Feedback-Evolving Games | Payoffs aendern sich durch vergangene Spiel-Ergebnisse → endogene Dynamik | v5/v7 |

### Advances in Financial Machine Learning (De Prado, AFML)

| Bereich | Relevanz | Stufe |
|---|---|---|
| Meta-Labeling (Kap. 3) | Nicht "Buy/Sell" vorhersagen, sondern "Wie sicher ist das Signal?" → Confidence-Kalibrierung | v2 |
| Feature Importance (Kap. 8) | Welche Game-Theory-Features tragen tatsaechlich zum Signal bei? MDA/MDI-Analyse | v2/v3 |
| Cross-Validation fuer Finanzdaten (Kap. 7) | Purged K-Fold → Game-Theory-Scores richtig validieren (keine Zukunftsinformation leaken) | v2 |
| Structural Breaks (Kap. 17) | CUSUM-Test → Regime-Wechsel erkennen → Keen-Layer-Input | v7 |
| Entropy Features (Kap. 18) | Marktordnung/Unordnung messen → Instabilitaets-Proxy | v7 |

---

## 7. Mapping auf unsere drei Signal-Ebenen

Wir haben drei Verarbeitungsebenen fuer Signale. Game Theory muss in **allen drei** funktionieren:

### Ebene 1: Deterministisch (Rule-Based, TS/Python)

| Was | Game-Theory-Beitrag | Stufe |
|---|---|---|
| Technische Indikatoren (RSI, MACD, SMA) | Kein direkter GT-Beitrag. Aber: Regime Detection als Kontextgeber (Keen: "In welcher Phase des Minsky-Zyklus sind wir?") | v7 |
| Composite Signal Gewichtung | GT Impact Score als dekorrelierte Dimension | v1-v2 |
| Position Sizing | Nash-basierte Risk-Adjustierung: Wenn alle Long sind → Crowding → Position verkleinern | v3/v7 |

### Ebene 2: Probabilistisch (ML/Statistical, Python)

| Was | Game-Theory-Beitrag | Stufe |
|---|---|---|
| Regime Detection (HMM) | Markov-Regimes als "Spielzustand" -- In welchem Regime befinden wir uns? Welche Strategien sind dominant? | v3/v5 |
| Backtest / Walk-Forward | GT-Score als Feature im ML-Modell + Kalibrierung via historischem Backtesting | v2 |
| Monte Carlo Simulation | GT-Szenarien (Eskalation/Deeskalation) als Pfade in der Simulation | v4 |
| Feature Engineering | Replicator-Dynamics-Features: Wie schnell breitet sich eine Strategie aus? Wie nahe am Kipppunkt? | v5 |

### Ebene 3: Semantisch/Narrativ (LLM-basiert)

| Was | Game-Theory-Beitrag | Stufe |
|---|---|---|
| Sentiment Analysis (FinBERT/XLM-R) | Sentiment als Proxy fuer "Crowd-Strategie" → Input fuer Replicator Dynamics | v5 |
| Narrative Analysis | Strategeme erkennen: Ist das Cheap Talk oder ein Costly Signal? Ist das ein Kipppunkt? | v4 |
| Conflict Resolution (LLM als Mediator) | Wenn GT sagt "risk_off" aber RSI sagt "oversold" → LLM erklaert und gewichtet kontextabhaengig | v4+ |
| Scenario Generation | LLM generiert Spielbaeume: "Was sind die 3 wahrscheinlichsten Eskalationsszenarien fuer Taiwan-Krise?" | v4 |

---

## 8. Die 36 Strategeme als Krisenlogik-Framework

Rieck liefert nicht formale Spieltheorie, sondern **Pattern-Recognition fuer Krisen**. Das ist direkt operationalisierbar fuer Event-Scoring.

### Mapping: Strategeme → Event-Bewertungs-Heuristiken

| Strategem | Krisenlogik | Event-Scoring-Implikation |
|---|---|---|
| **1. Den Kaiser hintergehen (Verstecke dich im hellen Licht)** | Gefahr kommt getarnt als Normalitaet | Events die "normal" aussehen aber in ungewoehnlichem Kontext stattfinden → Score erhoehen |
| **5. Bei einem Feuer einen Raub begehen** | Krise wird ausgenutzt fuer eigene Ziele | Wenn Krise A laeuft und Akteur B nutzt das fuer Aktion C → Compound Risk |
| **6. Im Osten laermen, im Westen angreifen** | Ablenkung. Cheap Talk | Diplomatische Erklaerungen (verbal) → niedriger Score. Handlungen → hoeher |
| **8. Oeffentlich den Weg ausbauen, heimlich nach Chencang marschieren** | Costly Signal als Taeuschung | Militaeruebungen ≠ Angriff. Aber: grosse Mobilisierung = teures Signal = ernst nehmen |
| **Kipppunkte (Sek. 1)** | Mehrere Gleichgewichte. Kleine Aenderung → grosser Effekt | Events nahe eines Kipppunkts → Score UND Confidence erhoehen |
| **Dammbruch** | Irreversibel. Kettenreaktion | Wenn Score-Schwelle ueberschritten + positive Feedback-Signale → Cascade Warning |
| **12. Mit leichter Hand ein Schaf wegfuehren** | Gelegenheit ausnutzen ohne grossen Aufwand | Opportunistisches Handeln in Krisen → Risk erhoehen auch wenn Event "klein" wirkt |
| **27. Verruerktheit vortaeuschen** | Madman Theory. Irrational wirken um Verhandlungsposition zu staerken | Nordkorea/Iran-Pattern: Drohgebaerden ≠ tatsaechliche Eskalation. Confidence senken |

### Operationalisierung (v4+)

```python
def detect_strategem_patterns(event_sequence: list[Event]) -> list[str]:
    """Erkennt Strategem-Muster in Event-Sequenzen."""
    patterns = []

    if has_cheap_talk_followed_by_action(event_sequence):
        patterns.append("strategem_6_east_west")

    if is_near_tipping_point(event_sequence):
        patterns.append("tipping_point_proximity")

    if has_costly_signal_mismatch(event_sequence):
        patterns.append("strategem_8_costly_deception")

    if has_compound_crisis_exploitation(event_sequence):
        patterns.append("strategem_5_fire_robbery")

    return patterns
```

### Knowledge Graph statt Vector DB fuer Strategeme + Behavioral Ops

> **Kernentscheidung:** Die 36 Strategeme und das BTE/DRS-System (Chase Hughes, `AGENT_ARCHITECTURE.md` Sek. 4) sind **strukturiertes Wissen mit Relationen** -- keine Freitext-Dokumente. Ein Vector-Store (Embeddings + Similarity Search) genuegt hier NICHT. Was wir brauchen ist ein **Knowledge Graph (KG)**.

**Warum Vector DB nicht reicht:**
- Vector DB findet "aehnliche Texte". Aber Strategem 6 (Cheap Talk) und Strategem 8 (Costly Signal) sind **kontrastive Konzepte** -- semantisch aehnlich, strategisch gegensaetzlich. Similarity Search wuerde sie vermischen.
- BTE-Marker haben exakte DRS-Punktwerte, Schwellwerte, Beziehungen zu Behavioral States. Das sind Fakten, keine Assoziationen.
- Strategeme haben kausale Ketten: "Kipppunkt" → "Dammbruch" → "Kettenreaktion". Ein KG modelliert `Kipppunkt --[fuehrt_zu]--> Dammbruch`. Vector DB kann das nicht.

**Was der KG enthaelt:**

```
Nodes:
  - Strategem (36 Stueck, mit Properties: Name, Typ, Kosten, Reversibilitaet)
  - Krisenphase (Vor-Krise, Akut, Eskalation, Deeskalation, Post-Krise)
  - BTE_Marker (113_Prn, 114_Res, 115_Ne, ..., mit DRS-Punkten)
  - Behavioral_State (Transparent, Guarded, Defensive, Evasive, Aggressive)
  - Event_Kategorie (Sanctions, Battles, Elections, Ceasefire, ...)
  - Akteur_Typ (Retail, Institutional, Zentralbank, Staat)

Edges:
  - Strategem --[anwendbar_in]--> Krisenphase
  - Strategem --[cheap_talk | costly_signal]--> Signal_Typ
  - Strategem --[fuehrt_zu]--> Strategem (Verkettung: Strategem 35)
  - Strategem --[kontra]--> Strategem (Gegenmassnahme)
  - BTE_Marker --[indiziert]--> Behavioral_State
  - BTE_Marker --[hat_drs_score]--> Float
  - Event_Kategorie --[typisches_strategem]--> Strategem
  - Akteur_Typ --[typische_strategie_bei]--> Event_Kategorie
```

**Technologie:** Neo4j oder TypeDB (beide unterstuetzen Property Graphs). Alternativ Lightweight: NetworkX (Python in-memory) fuer Prototyp, Migration zu Graph-DB spaeter.

**Agent-Nutzung:** Extractor/Verifier Agents (`AGENT_ARCHITECTURE.md` Sek. 2) querien den KG statt Freitext-Prompts:
- "Welche Strategeme passen zu einem Sanctions-Event in der Akut-Phase?" → KG-Query statt LLM-Halluzination
- "Welche BTE-Marker sind mit Evasive-State assoziiert und haben DRS > 3.0?" → Exakt, deterministisch

**Verbindung zu `MEMORY_ARCHITECTURE.md`:** Der KG ist Teil des **Semantic Memory** (Langzeit-Faktenwissen). Siehe `MEMORY_ARCHITECTURE.md` fuer die Gesamtarchitektur.

---

## 9. Offene Fragen und Design-Entscheidungen

### 9.1 Naming: Umbenennen oder beibehalten?

Das Label "Game Theory" fuer v1 ist technisch falsch. Optionen:
- **Beibehalten (aspirativ):** Versionierung macht Reifegrad klar (`heuristic_v1` → `evolutionary_v5`)
- **Umbenennen:** `geopolitical_impact_scorer_v1`, "Game Theory" erst ab v3

**Entscheidung:** Offen.

### 9.2 Reihenfolge: v2 vor v3

v2 (Backtesting) ist unabhaengig von formaler Game Theory und liefert sofort Wert. Sollte vor v3 gebaut werden.

### 9.3 Spieler-Identifikation (v3)

Optionen:
- **Volumen-Proxy:** VPIN, Order Flow Imbalance (`INDICATOR_ARCHITECTURE.md` Sek. 5)
- **COT-Daten:** Commitment of Traders (wochentlich, verzoegert, aber echte Positionsdaten)
- **Template-basiert:** Spieler-Typen definieren statt live identifizieren

### 9.4 Skalierung: Spielbaeume werden exponentiell (v4)

N Spieler × M Aktionen × T Runden = O(M^(N×T)). Pruning noetig:
- Alpha-Beta (Schach-Analogie)
- Dominierende Strategien eliminieren
- Top-3 Pfade verfolgen
- Mean Field Approximation ab v6

### 9.5 Wie fliesst GT v3+ ins Composite Signal?

v1: Ein `impactScore` Float. Ab v3: Reicherer Output:
- Nash-Bias-Verteilung: `{risk_on: 0.15, risk_off: 0.65, neutral: 0.20}`
- Konfidenz je Szenario
- Dominant Player Type
- Stability Indicator (wie nah am Kipppunkt?)

### 9.6 Keen-Layer: Ab wann noetig?

v7 klingt weit weg, aber empirische Proxies (VIX-Regime, VPIN-Extreme, Korrelations-Spikes) sind **sofort** implementierbar und gehoeren eigentlich schon in v2. Die Frage ist ob der Stabilitaets-Layer als eigene Stufe laeuft oder als Querschnittsthema in jede Stufe eingebaut wird.

**Empfehlung:** Querschnittsthema. Jede Stufe muss sich fragen: "Kann dieses Signal zur Instabilitaet beitragen?"

### 9.7 Gesellschaft vs. Wirtschaft: Trennbar?

Aus der Diskussion: "Mir gehts mehr um das Gesellschaftliche, nicht unbedingt Wirtschaftstheorie."

**Antwort: Kausal zusammenhaengend und untrennbar.** Maerkte sind gesellschaftliche Systeme. Geopolitische Events (Gesellschaft) → Marktreaktionen (Wirtschaft) → Kapitalfluesse (zurueck in Gesellschaft). Das ist genau warum wir Game Theory brauchen: Sie modelliert die Schnittstelle zwischen strategischem gesellschaftlichem Verhalten und oekonomischen Outcomes.

Rieck's Strategeme kommen aus Militaergeschichte/Gesellschaft und sind trotzdem direkt auf Maerkte anwendbar. Keen argumentiert umgekehrt: Finanzsystem-Instabilitaet erzeugt gesellschaftliche Krisen. Es ist derselbe Regelkreis.

### 9.8 Kernaussage: Warum statische Modelle fuer komplexe Systeme scheitern

> **Explizit festgehalten:** Keen und Minsky haben im Kern Recht. Man kann statistisch/statisch so grosse und komplexe Systeme nicht angehen, indem man es sich einfacher macht und die Wirklichkeit an die Theorie anpasst statt umgekehrt.

Das hat konkrete Konsequenzen fuer jede Stufe unseres Systems:

| Konsequenz | Bedeutung fuer uns |
|---|---|
| **Kein Modell ist "fertig"** | Jedes Modell (v1-v7) hat ein Verfallsdatum. Es muss sich selbst hinterfragen koennen. |
| **Gleichgewicht ist Spezialfall, nicht Normalfall** | Nash-Gleichgewichte sind nuetzlich fuer lokale Analyse, aber das System als Ganzes ist nicht im Gleichgewicht. |
| **Feedback-Schleifen sind der Normalfall** | Unsere Signale beeinflussen (indirekt) den Markt. Das System muss wissen, dass es Teil des Systems ist, das es analysiert. |
| **Stabilitaet ist nicht gratis** | Stabilitaet erfordert Puffer, Diversitaet, Hysterese -- Dinge die "ineffizient" aussehen aber das System am Leben halten. |
| **Die Theorie muss zur Wirklichkeit passen, nicht umgekehrt** | Wenn die Realitaet nicht ins Modell passt, ist das Modell falsch -- nicht die Realitaet. |

Das ist kein abstraktes Philosophieren. Es bestimmt konkrete Design-Entscheidungen: Warum wir Regime Detection brauchen (v7), warum wir Crowding-Detektoren brauchen (v7), warum wir Time-Delay-Awareness brauchen (v5, Pimentel Kap. 8), warum wir Bayesian Updating brauchen (v6) statt fester Gewichte.

---

## Zusammenfassung: Reifegradstufen

| Version | Name | Paradigma | Formale GT? | Keen-kompatibel? | Status |
|---|---|---|---|---|---|
| **v1** | Heuristic Scorer | Keyword-Matching | Nein | Nein | **Implementiert** |
| **v2** | Calibrated Scorer | Empirische Kalibrierung | Nein | Teilweise (AFML-Methodik) | Geplant |
| **v3** | Normal Form Game | Statische Spieltheorie | **Ja** | Nein (Gleichgewichts-Annahme) | Konzept |
| **v4** | Extensive Form + Strategeme | Sequentielle GT + Krisenlogik | **Ja** | Teilweise (Kipppunkte) | Konzept |
| **v5** | Evolutionary GT | Replicator Dynamics + Hopf | **Ja** | **Ja** (dynamisch, kein Gleichgewichts-Zwang) | Konzept |
| **v6** | MFG + Bayesian | Mean Field + Adaptive Learning | **Ja** | **Ja** (grosse Populationen, Belief-Updates) | Konzept |
| **v7** | Stability Layer | Control Theory + Minsky-Indikatoren | Ergaenzung | **Ja** (Kern) | Konzept |

**Die Pointe:** v1-v3 sind "Rieck-Land" (strategisch, gleichgewichtsorientiert). Ab v5 betreten wir "Keen-Land" (dynamisch, instabilitaetsbewusst). v7 schliesst den Kreis: Control Theory als Stabilitaetsgarant fuer ein System das aus strategischen UND dynamischen Komponenten besteht.
