# Agent Model and Token Tuning

> **Stand:** 16. Maerz 2026
> **Zweck:** Tiefgehender Leitfaden fuer Modell- und Token-Tuning in TradeView Fusion
> ueber drei Horizonte: sofort umsetzbar, mittelfristig skalierbar, langfristig
> architekturseitig. Fokus auf reproduzierbare Runtime-Verbesserung mit
> Security-/Policy-Gates.
> **Owner:** Agent Runtime / Harness / Security (gemeinsame Verantwortung)
> **Abgrenzung:** Dieses Dokument ersetzt keine Security- oder Harness-Policies,
> sondern operationalisiert sie fuer LLM-Kontext, KV-Cache und Inference-Pfade.

---

## 1. Warum dieses Dokument?

In der Praxis werden "Kontextprobleme" haeufig mit groesseren Fenstern beantwortet.
Das ist unvollstaendig. Der robuste Pfad ist:

1. Kontextqualitaet (Context Engineering, Retrieval-Policy)
2. Kontextkosten (Token-/Prefix-/KV-Optimierung)
3. Kontextsicherheit (Tenant-Isolation, taint, policy mediation)
4. Modellpfad (Transformer vs. Hybrid/linear-recurrent) erst danach

Dieses Dokument definiert dafuer ein umsetzbares Operating Model.

---

## 2. Ziele und Nicht-Ziele

### Ziele

- Hoehere Effizienz pro Antwort (`token_saved`, `latency_p95`, `cost_per_success`)
- Stabilere Qualitaet bei langen Kontexten ohne "context rot"
- Keine Security-Regression durch aggressive Cache-/Quantisierungspfade
- Klare Go/No-Go-Gates fuer neue Modell-/Backend-Techniken

### Nicht-Ziele

- "Magische" Kontextfenster ohne Retrieval-/Policy-Disziplin
- Blindes Aktivieren experimenteller Features ohne Benchmarks
- Vermischen von Research-Hypothese und Produktionsstandard

---

## 3. Tuning-Horizonte

### H1: Sofort umsetzbar (0-4 Wochen)

1. Prefix-/Prompt-Caching (evaluate-first, dann default bei positivem Nachweis)
2. Flash-Attention aktivieren wo backendseitig stabil
3. KV-Cache-Quantisierung konservativ starten (z. B. q8_0 / fp8_e5m2)
4. Cache-Key- und Invalidation-Policy vereinheitlichen
5. Basis-Observability (Hit-Rate, token_saved, miss_reason, policy_bypass_count)

### H2: Mittelfristig (1-3 Monate)

1. Hybrid KV Cache Manager / paged KV Verwaltung im Serving-Stack
2. Kontext-Routing nach Task-Typ (`short`, `analysis`, `agentic`)
3. Quantisierungsprofile je Pfadklasse (kritisch vs. unkritisch)
4. Automatisierte Drift- und Regressionstests (Qualitaet + Security)

### H3: Langfristig (3-12 Monate)

1. Modellpfad-Strategie: Transformer-only vs. Hybrid-Modelle
2. Long-context adaptation (YaRN/DRoPE) mit eval-getriebener Freigabe
3. Multi-GPU-Strategien (z. B. Ring Attention) nur bei realem Infrastrukturbedarf
4. Architektur-Evaluation "state tracking vs. exact recall" fuer Kern-Use-Cases

---

## 4. Architektur-Wirklichkeit: Was ist Toggle, was ist Model-Entscheid?

### Toggle-/Runtime-Themen (kurzfristig realistisch)

- Prefix caching
- Flash attention
- KV cache quantization
- Paging/hybrid KV management
- Prompt- und context assembly optimization

### Modell-/Trainings-Themen (nicht einfach togglebar)

- Linear attention / pure recurrent Ersatz fuer Transformer
- Hybrid-Architektur als Grundmodell
- Vollwertige Langkontextfaehigkeit ohne geeignetes Modelltraining

Merksatz:
"Runtime-Optimierung" und "Modellarchitektur" sind zwei getrennte
Entscheidungsebenen.

---

## 5. Sofortprofil (empfohlen)

### 5.1 Default-Profil fuer produktionsnahe Tests

- Kontextbudget strikt je Task-Typ (nicht global maximal)
- Prefix caching: aktiviert
- Flash attention: aktiviert (falls stabil/unterstuetzt)
- KV-cache quantization: konservativ (z. B. q8_0 / fp8_e5m2)
- Vollstaendige Cache- und Policy-Telemetrie aktiv

### 5.2 Sicherheitsregeln (nicht verhandelbar)

- Kein cache reuse ueber unterschiedliche security context IDs
- Keine sensiblen Segmente als sharebarer Prefix
- Kein bypass vom cache-path an policy-path vorbei
- Bei Genauigkeitsabfall in kritischen Flows: automatisch auf konservativeres Profil

---

## 6. Backend-Matrix (Praxis)

| Stack | Starke Seite | Risiken | Empfehlung |
|---|---|---|---|
| `vLLM` | Prefix caching, paged attention, hoher Durchsatz | Hash-/Tenant-/Invalidation-Fehler moeglich | Primaerer Serving-Kandidat fuer Prefix/Paging |
| `llama.cpp` | Lokale Kontrolle, KV-Typen, Flash-Flags | Feature-Drift je Build/Backend | Gut fuer lokale Benchmarks und reproduzierbare Mikrotests |
| `SGLang` | Quantized KV cache dokumentiert | Backend-Kompatibilitaet fuer fused kernels pruefen | Sehr gut fuer KV-Experimente |
| `Ollama` | Einfacher Betrieb | einzelne Advanced-Flags variieren je Version | Gut fuer dev/prototyping, bei Advanced-Flags verifizieren |

---

## 7. Messrahmen (Metriken)

### 7.1 Leistungsmetriken

- `ttft_ms` (time to first token)
- `latency_p50/p95/p99`
- `tokens_in`, `tokens_out`, `token_saved`
- `cache_hit_rate`, `cache_miss_rate`, `cache_miss_reason`
- `gpu_mem_peak_mb`

### 7.2 Qualitaetsmetriken

- task success rate
- claim accuracy / citation coverage
- error class distribution
- degradation frequency unter langen Kontexten

### 7.3 Sicherheitsmetriken

- cross-tenant cache hit (muss 0 sein)
- policy bypass attempts blocked
- sensitive sink violations blocked
- approval escalations triggered

---

## 8. Experimentdesign (A/B)

Jeder neue Tuning-Schritt laeuft ueber Baseline-Vergleich:

- **A:** bisheriger Produktionspfad
- **B:** genau eine Veraenderung (z. B. KV q8_0)

Freigabe erst wenn:

1. keine Sicherheitsregression
2. Qualitaet innerhalb definierter Toleranz
3. messbarer Nutzen bei Latenz/Token/Kosten

---

## 9. Mapping zu bestehenden Agent-Deltas

- `AHR13/AHR14/AHR16` (Harness): Cache, Prompt-Stabilitaet, Code-Mode-Eval
- `ASR9/ASR10/ASR11` (Security): contextual security, vault path, IFC/taint
- `AMC17/AMC18` (Memory/Context): taint label propagation, high-volume compacting
- `ABP.11/ABP.12` (Backend Program): delegation contract, secret-handling contract

Damit ist dieses Dokument kein isolierter Plan, sondern Ausfuehrungs-Backbone.

---

## 10. Langfristige Modellstrategie (entscheidungsorientiert)

### 10.1 Hybrid-Modelle

Relevanz:

- bessere Kombination aus state tracking und recall moeglich
- potenziell bessere Token-Effizienz bei gleichem Zielniveau

Operationaler Schluss:

- als Modellspur evaluieren, nicht als kurzfristiger Runtime-Hotfix
- nur mit klaren Benchmark-Zielen (math/science/coding/long-context getrennt)

### 10.2 Long-context Erweiterung (YaRN/DRoPE)

Relevanz:

- verlaengert nutzbares Kontextfenster
- kann bei unpassendem Task-Design trotzdem ineffizient bleiben

Operationaler Schluss:

- nur zusammen mit Retrieval-/Budget-Disziplin
- getrennte Benchmark-Klassen fuer short/medium/long context

### 10.3 Ring Attention / Multi-GPU

Relevanz:

- fuer sehr grosse Kontexte und verteilte Inferenz

Operationaler Schluss:

- nicht fuer Single-GPU als Standard einplanen
- nur bei belastbarem Multi-GPU-Kapazitaetsfall aktivieren

---

## 11. Runbook (Kurzfassung)

1. Baseline messen (`A`)
2. Eine Optimierung aktivieren (`B`)
3. Security-Gates pruefen
4. Qualitaets-Gates pruefen
5. Performance/Cost evaluieren
6. Go/No-Go dokumentieren
7. Bei Go: Slice-Status + Root-MDs aktualisieren

---

## 12. Quellen (primaer)

- AI2 OLMo Hybrid:
  [https://allenai.org/blog/olmohybrid](https://allenai.org/blog/olmohybrid)
- vLLM Prefix Caching:
  [https://docs.vllm.ai/en/stable/design/prefix_caching.html](https://docs.vllm.ai/en/stable/design/prefix_caching.html)
- vLLM Automatic Prefix Caching (Design):
  [https://docs.vllm.ai/en/v0.8.5/design/automatic_prefix_caching.html](https://docs.vllm.ai/en/v0.8.5/design/automatic_prefix_caching.html)
- vLLM Paged Attention:
  [https://docs.vllm.ai/en/v0.11.2/design/paged_attention/](https://docs.vllm.ai/en/v0.11.2/design/paged_attention/)
- vLLM Hybrid KV Cache Manager:
  [https://docs.vllm.ai/en/stable/design/hybrid_kv_cache_manager/](https://docs.vllm.ai/en/stable/design/hybrid_kv_cache_manager/)
- SGLang Quantized KV Cache:
  [https://docs.sglang.io/advanced_features/quantized_kv_cache.html](https://docs.sglang.io/advanced_features/quantized_kv_cache.html)
- FlashAttention-3 (PyTorch):
  [https://pytorch.org/blog/flashattention-3/](https://pytorch.org/blog/flashattention-3/)
- FlashAttention-3 (Tri Dao):
  [https://tridao.me/blog/2024/flash3/](https://tridao.me/blog/2024/flash3/)
- llama.cpp FlashAttention:
  [https://github.com/ggerganov/llama.cpp/pull/5021](https://github.com/ggerganov/llama.cpp/pull/5021)
- llama.cpp KV cache quantization:
  [https://github.com/ggerganov/llama.cpp/issues/6863](https://github.com/ggerganov/llama.cpp/issues/6863)
- YaRN (OpenReview):
  [https://openreview.net/forum?id=wHBfxhZu1u](https://openreview.net/forum?id=wHBfxhZu1u)

## 13. Quellen (sekundaer, praxisnah)

- Local settings overview:
  [https://www.xda-developers.com/local-llm-settings-most-people-never-touch/](https://www.xda-developers.com/local-llm-settings-most-people-never-touch/)

