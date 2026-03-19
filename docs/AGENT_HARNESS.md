# Agent Harness -- Runtime Harness, Guardrails, Sandboxing

> **Stand:** 13. Maerz 2026
> **Zweck:** Arbeitsdokument fuer den Harness-Layer um Agenten herum:
> Constrain/Inform/Verify/Correct, Framework-Minimalismus, Guardrails in Runtime,
> physische Sandbox-Isolation und eval-getriebene Governance.
> **Abgrenzung:** `specs/*.md` bleiben die autoritative Spezifikation. Dieses
> Dokument ist die arbeitsnahe Bruecke zwischen Agent-Design und operativer
> Runtime-Haertung.

---

## Inhaltsverzeichnis

1. [Warum eigenes Agent-Harness-Doc?](#1-warum-eigenes-agent-harness-doc)
2. [Bereits abgedeckt in bestehenden Agent-Docs](#2-bereits-abgedeckt-in-bestehenden-agent-docs)
3. [Harness-Prinzipien (Constrain, Inform, Verify, Correct)](#3-harness-prinzipien-constrain-inform-verify-correct)
4. [LIMI und Minimalismus als Default](#4-limi-und-minimalismus-als-default)
5. [Orchestrierungs- und Framework-Positionierung](#5-orchestrierungs--und-framework-positionierung)
6. [Guardrails als Runtime-Layer](#6-guardrails-als-runtime-layer)
7. [Sandboxing-Strategie (OpenSandbox fix)](#7-sandboxing-strategie-opensandbox-fix)
8. [Complete Mediation und Kontextintegritaet](#8-complete-mediation-und-kontextintegritaet)
9. [Observability, Agentic Evals und Regression-Gates](#9-observability-agentic-evals-und-regression-gates)
10. [Priorisierte Einfuehrungsreihenfolge](#10-priorisierte-einfuehrungsreihenfolge)
11. [LLM Routing und FinOps (LiteLLM/RouteLLM)](#11-llm-routing-und-finops-litellmroutellm)
12. [Token-/Semantic-Caching](#12-token-semantic-caching)
13. [Querverweise](#13-querverweise)
14. [Kernquellen (wichtigste URLs)](#14-kernquellen-wichtigste-urls)
15. [Supervisor (Runtime-Hinweis)](#15-supervisor-kurzer-runtime-hinweis)

---

## 1. Warum eigenes Agent-Harness-Doc?

`AGENT_ARCHITECTURE.md`, `AGENT_TOOLS.md` und `AGENT_SECURITY.md` decken bereits
wichtige Teile ab, aber nicht als ein konsolidiertes Harness-Operating-Model.

Dieses Dokument buendelt explizit:

- wie Agenten zur Laufzeit begrenzt werden (Constrain)
- wie sie nur relevanten Kontext bekommen (Inform)
- wie Ergebnisse technisch verifiziert werden (Verify)
- wie Fehler automatisiert in sichere Korrekturschleifen gehen (Correct)

Damit wird die Luecke zwischen "Agent kann prinzipiell etwas" und
"Agent arbeitet reproduzierbar, sicher, auditierbar in Produktion" geschlossen.

---

## 2. Bereits abgedeckt in bestehenden Agent-Docs

### 2.1 Aus `AGENT_ARCHITECTURE.md`

Bereits vorhanden und weiterhin gueltig:

- Agenten als **untrusted orchestrators**, nicht als Truth-Owner
- Plan-Execute-Replan als Grundmuster
- kontrollierte Runtime-Grenzen statt impliziter Tool-Autonomie

### 2.2 Aus `AGENT_TOOLS.md`

Bereits vorhanden und weiterhin gueltig:

- MCP- und Tool-Taxonomie als Integrationsbasis
- Tooling entlang klarer Rollen und Scopes
- PDDL/ADL nur als optionales Constraint-Layer; JSON/OpenAPI bleiben primaer

### 2.3 Aus `AGENT_SECURITY.md`

Bereits vorhanden und weiterhin gueltig:

- Retrieval Broker als Pflichtpfad
- Tool Proxy + Capability Envelope
- Agentic Storage Write-Path (`draft -> review -> approved -> published`)
- Evidence-Completeness Gates
- Security-Evals als dauerhafte Gates

### 2.4 Was dieses Dokument zusaetzlich liefert

- konsolidierte Harness-Leitlinien ueber mehrere Agent-Root-MDs hinweg
- klare Entscheidung fuer **OpenSandbox** als physische Ausfuehrungsgrenze
- explizite Framework- und Runtime-Policy fuer minimalen Control-Flow-Bloat

---

## 3. Harness-Prinzipien (Constrain, Inform, Verify, Correct)

1. **Constrain**  
   Capability Envelope, Tool Proxy, Sandbox, Budget- und Scope-Grenzen.

2. **Inform**  
   Kontext kuratiert statt breit: Retrieval ueber Broker, provenance-markierte
   Inputs, klare Trennung von statischem Policy-Kontext und dynamischer Anfrage.

3. **Verify**  
   Runtime-Validatoren, strukturierte Output-Checks, negative Tests fuer
   Missbrauchspfade, Eval-Gates in CI-naher Umgebung.

4. **Correct**  
   Replan-/Retry-/Fallback-Pfade als deterministische State-Machine-Regeln,
   inklusive Abbruchkriterien und Human-Approval fuer High-Risk-Pfade.

---

## 4. LIMI und Minimalismus als Default

Leitregel: **Weniger, aber stabil und messbar.**

- kleines, klares Toolset pro Agent-Klasse
- keine "Tool-Flatrate" im Prompt
- keine ueberbreiten Subagent-Strukturen ohne harte Kontextisolation
- Artefakte in File-/Artifact-Store statt im Prompt-Kontextfenster
- Cache-stabile Prompt-Struktur (statisch und dynamisch strikt trennen)

Nicht-Ziel:

- Multi-Agent-Topologien als Selbstzweck
- Framework-Bloat ohne nachgewiesenen Mehrwert fuer Reliability/Evidence

---

## 5. Orchestrierungs- und Framework-Positionierung

Arbeitsposition fuer TradeView Fusion:

- **Control-Flow primaer custom und transparent** (State-Machine, Retry, Replan)
- **Open-Source-Bausteine gezielt nutzen** fuer Model-Interaktion, Typisierung,
  Validierung, Guardrails und Eval
- schwere Framework-Abstraktionen nur bei klar nachgewiesenem Bedarf fuer
  komplexe zyklische DAG-Workflows

Pragmatische Folge:

- "minimal first", dann gezielte Erweiterung
- kein Lock-in auf ein einzelnes Modell oder ein einzelnes Framework
- Agent-Framework-Kandidaten (z. B. `AgentFlow`) laufen als Evaluate-Track mit
  klaren Adoption-Gates, nicht als Default-Switch
- externe Agent-Referenzen (z. B. `pharos-ai` Agent-Ordner/Doctrine) nur als
  Workflow-Pattern evaluieren; kein Runtime-/Framework-Switch ohne Boundary-,
  Security- und Evidence-Nachweis

---

## 6. Guardrails als Runtime-Layer

Guardrails gehoeren in die Laufzeit zwischen Agent-Loop und Tool/Output, nicht in
Prompt-Hoffnungen.

Pflichtpunkte:

- Input-Validierung und Injection-Hygiene vor LLM/Tool
- Retrieval- und Execution-Rails fuer Kontext- und Tool-Pfade
- Output-Validierung (Schema, Policy, Leak-Schutz)
- Reject- und Repair-Verhalten mit klaren Fehlercodes

Implementationsrahmen:

- Security-Boundaries aus `AGENT_SECURITY.md` bleiben verbindlich
- Guardrail-Engine kann dediziert als Service betrieben werden, um
  Sicherheitslogik vom Agent-Core zu entkoppeln

---

## 7. Sandboxing-Strategie (OpenSandbox fix)

Feste Entscheidung:

- **OpenSandbox wird als Standard-Sandbox fuer agentische Code-/Tool-Execution
  eingesetzt.**

Arbeitsregeln:

- keine direkte Host-Ausfuehrung von agentisch generiertem Code
- jede ausfuehrbare Aktion ueber isolierte Runtime-Boundary
- Netz-/Filesystem-Rechte strikt envelope- und taskgebunden
- Session-Lifecycle, Audit-Trace und Kill-Switch sind Pflicht

OpenSandbox ist nicht "nice to have", sondern Sicherheits- und
Reproduzierbarkeits-Basis fuer Agent-Execution.

---

## 8. Complete Mediation und Kontextintegritaet

Der Harness erzwingt "complete mediation": jeder sicherheitsrelevante Zugriff
geht durch denselben Entscheidpfad.

Pflicht:

- kein direkter Shortcut von Agent zu Tool/Storage/Netz
- kein "trusted mode" ohne Policy-Pruefung
- jeder Tool-Call braucht envelope + context-integrity-check

Kontextintegritaet im Harness:

- Kontextquellen sind klassifiziert (`policy`, `intent`, `data`, `tool_result`)
- Prioritaetskette ist fix und nicht prompt-seitig ueberschreibbar
- bei Konflikt zwischen Kontextquellen wird blockiert oder auf Human-Approval gehoben

Damit verhindert der Harness riskante Kaskaden
(`untrusted input -> tool hijack -> unauthorized action`).

---

## 9. Observability, Agentic Evals und Regression-Gates

Harness-Qualitaet wird nicht ueber Einzelprompts bewertet, sondern ueber laufende
Gates:

- Injection-/Leakage-/Tool-Misuse-Regressionstests
- Eval-Suiten fuer Aufgabenkategorien und Failure-Replays
- evidenzgebundene Success-Kriterien je kritischem Pfad
- Traces fuer Entscheidungskette (`input -> retrieval -> tool -> output`)

Minimum fuer produktionsnahe Freigabe:

- stabile Negativtests fuer missbraeuchliche Inputs
- reproduzierbare Eval-Baseline in lokaler und CI-naher Umgebung
- dokumentierte Drift-Checks bei Modell-/Tool-/Prompt-Updates

---

## 10. Priorisierte Einfuehrungsreihenfolge

1. Harness-Execution-Contract und Boundary-Owner finalisieren
2. OpenSandbox als verpflichtende Execution-Boundary aktivieren
3. Guardrail-Runtime fuer Input/Retrieval/Execution/Output verdrahten
4. Complete-Mediation + Kontextintegritaets-Checks als Pflicht in kritischen Pfaden
5. Minimalistische Control-Flow-Standards fuer Agent-Loops durchsetzen
6. Agentic-Evals + Security-Regression-Gates fest in Delivery-Rhythmus heben

---

## 11. LLM Routing und FinOps (LiteLLM/RouteLLM)

Dieses Thema gehoert in den Harness-Layer, weil es Runtime-Entscheidungen ueber
Kosten, Moduswahl und Fallback-Pfade betrifft.

Arbeitsposition:

- `LiteLLM` ist ein pragmatischer Kandidat fuer Provider-Abstraktion, Budget-Gates
  und Fallback-Routing.
- `RouteLLM` ist ein Kandidat fuer learned routing policies, sobald ausreichend
  Evaluationsdaten und stabile Failure-Klassen vorliegen.
- A2FM-/Routing-Papers dienen als Forschungsleitplanke fuer
  `instant/reasoning/agentic`-Modusentscheidungen, aber erzwingen keinen
  direkten Framework-Switch.

Nicht-Ziel:

- blinder Wechsel auf einen Router-Stack ohne reproduzierbare Eval-Gates
- hidden model routing ohne Audit-/Budget-/Policy-Nachweis

---

## 12. Token-/Semantic-Caching

Caching gehoert in den Harness-Layer, weil es Laufzeit-Kosten und Kontext-Freshness betrifft.

Arbeitsposition:

- **Cache-stabile Prompt-Struktur** (statisch/dynamisch strikt trennen) ist Runtime-Standard (LIMI, Sek. 4).
- **Token-/Semantic-Caching** (Prefix-/Prompt-Cache vs. aehnliche-Anfragen-Cache) als evaluate-only Pfad mit klaren Adoption-Gates; Safety (Tenant-Isolation, keine Cross-User-Leaks), Invalidation/Freshness und FinOps-Metriken (Hit-Rate, Token-Saved) messbar machen.

Nicht-Ziel: Cache aktivieren ohne reproduzierbare Eval-Gates und ohne Nachweis gegen Qualitaets-/Policy-Regression.

### 12.1 Sofort umsetzbare Baseline (14 Tage)

1. **Prefix-Caching einschalten und messen**
   - Serverseitig Prefix-/Prompt-Caching aktivieren, Hit-Rate und Token-Saved messen.
   - Quelle: [vLLM Prefix Caching](https://docs.vllm.ai/en/stable/design/prefix_caching.html)

2. **Paged-Attention-/KV-Layout als Standardpfad**
   - Langen Kontext nur mit paged KV-Management freigeben; Fragmentierung und OOM-Risiko senken.
   - Quelle: [vLLM Paged Attention](https://docs.vllm.ai/en/v0.11.2/design/paged_attention/)

3. **Flash-Attention aktivieren (wo verfuegbar)**
   - Bei kompatibler GPU/Backend als Default im Runtime-Profil fuehren.
   - Quellen: [FlashAttention-3 (PyTorch)](https://pytorch.org/blog/flashattention-3/), [llama.cpp FlashAttention PR](https://github.com/ggerganov/llama.cpp/pull/5021)

4. **KV-Cache-Quantisierung als evaluate-first**
   - fuer lange Kontexte mit konservativem Startprofil (z. B. q8_0) testen, dann stufenweise.
   - Quellen: [SGLang Quantized KV Cache](https://docs.sglang.io/advanced_features/quantized_kv_cache.html), [llama.cpp KV cache quantization](https://github.com/ggerganov/llama.cpp/issues/6863)

5. **Hash-/Invalidation-Policy verbindlich machen**
   - Cache-Key-Hashing, Tenant-Isolation, Invalidation bei Tool-/Prompt-/Policy-Aenderungen.
   - Quelle: [vLLM Automatic Prefix Caching](https://docs.vllm.ai/en/v0.8.5/design/automatic_prefix_caching.html)

---

## 13. Querverweise

- `AGENT_ARCHITECTURE.md`
- `AGENT_TOOLS.md`
- `AGENT_SECURITY.md`
- `AGENT_MODEL_TOKEN_TUNING.md`
- `RAG_GRAPHRAG_STRATEGY_2026.md`
- `CONTEXT_ENGINEERING.md`
- `MEMORY_ARCHITECTURE.md`
- `specs/EXECUTION_PLAN.md`
- `specs/execution/agent_harness_runtime_delta.md`
- `specs/execution/agent_security_runtime_delta.md`

---

## 14. Kernquellen (wichtigste URLs)

- LIMI-Prinzip (Less Is More for Agency): [OpenReview](https://openreview.net/forum?id=Jee2Q7qK0s)
- MCP (Model Context Protocol) Spezifikation: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- OpenAI Agents SDK (minimalistische Agent-Primitives): [GitHub](https://github.com/openai/openai-agents-python)
- Pydantic AI (typisierte Agent- und Tool-Validierung): [GitHub](https://github.com/pydantic/pydantic-ai)
- AgentFlow (OpenDCAI, Evaluate-only bis Gate-Entscheid): [GitHub](https://github.com/OpenDCAI/AgentFlow)
- LiteLLM (Provider-Routing/Budget/Fallback): [GitHub](https://github.com/BerriAI/litellm)
- RouteLLM (learned model routing): [GitHub](https://github.com/lm-sys/RouteLLM)
- A2FM (Adaptive Agent Foundation Model, Route-then-Align): [arXiv](https://arxiv.org/abs/2510.12838), [GitHub](https://github.com/OPPO-PersonalAI/Agent_Foundation_Models)
- Pattern-Aware Tool-Integrated Reasoning: [arXiv](https://arxiv.org/abs/2509.23292)
- EvoRoute: [arXiv](https://arxiv.org/abs/2601.02695)
- Calibrate-Then-Act: [arXiv](https://arxiv.org/abs/2602.16699)
- Budget-Aware Agentic Routing: [arXiv](https://arxiv.org/abs/2602.21227)
- NVIDIA NeMo Guardrails (Runtime-Rails): [GitHub](https://github.com/NVIDIA/NeMo-Guardrails)
- Guardrails AI (Validator- und Policy-Layer): [GitHub](https://github.com/guardrails-ai/guardrails)
- OWASP Top 10 for LLM Applications: [OWASP GenAI Project](https://genai.owasp.org/)
- Agentic Security Survey (Design/Risk/Defense): [arXiv 2603.11088](https://arxiv.org/pdf/2603.11088)
- E2B (Firecracker-basierte Agent-Sandbox): [GitHub](https://github.com/e2b-dev/E2B)
- Northflank (isolierte Agent-Workloads, OCI-fokussiert): [Website](https://northflank.com/)
- Daytona (schnelle Sandbox/Workspace-Laufzeiten): [GitHub](https://github.com/daytonaio/daytona)
- Pharos AI (Agent-Mirror/Doctrine-Pattern, evaluate-only Referenz): [GitHub](https://github.com/Juliusolsson05/pharos-ai)

---

## 15. Supervisor (kurzer Runtime-Hinweis)

`supervisord` ist ein Prozess-Manager fuer Linux-Workloads (nicht neu), der mehrere
Dienste in einer Runtime startet und ueberwacht. In containerisierten Agent-Setups
ist das hilfreich, wenn mehr als ein Prozess stabil laufen soll (z. B. API + Worker
und optionale Sidecars).

Warum hier erwaehnen:

- klarer Trennpunkt zwischen Agent-Core und Runtime-Prozesssteuerung
- Restart-Policy und Logs sind explizit statt implizit
- reduziert "vergessene" Nebenprozesse in reproduzierbaren Dev/Prod-Szenarien

Beispielkonfiguration im Repo:

- `tools/supervisor/supervisord.example.conf`
