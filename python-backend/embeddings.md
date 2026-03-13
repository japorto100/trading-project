# Embeddings Evaluation (Python Backend)

> **Stand:** 13. Maerz 2026
> **Zweck:** Kleiner, fokussierter Evaluate-Track fuer Text-/Image-Embeddings im
> Python-Backend. Kein sofortiger Produktionsswitch ohne Benchmark-Evidence.

---

## 0. Scope

### In

- Vergleich von Embedding-Modellen fuer Retrieval und multimodale Aehnlichkeit
- Benchmark-Setup fuer Qualität, Latenz, Kosten und Betriebsfit
- Go/No-Go-Regeln fuer spaetere Adoption

### Out

- sofortige Migration bestehender produktiver Retrieval-Pfade
- framework-lastige Agent-Orchestrierung

---

## 1. Kandidaten

- BridgeTower (vision+text)
- Nomic Embed (text und multimodal zu pruefen)
- Jina CLIP v1/v2
- Gemini Embedding 2
- ZeroEntropy Embedder

---

## 2. Kernmetriken

- Retrieval-Qualitaet: Recall@k, nDCG@k, MRR@k
- Latenz: p50/p95 pro Anfrage und pro Batch
- Kosten: API-/GPU-Kosten je 1k/1M Items
- Betriebsfit: self-hosted faehig, Lizenz, Stabilitaet, Tooling
- Robustheit: sprachmix, noisy OCR/text, text-image mismatch

---

## 3. Benchmark-Profil

- Dataset A: text-only (News/Research-Chunks)
- Dataset B: image-only (Chart/Screenshot-Embeddings)
- Dataset C: text-image (caption/query gegen Bild)
- Split: dev/holdout, reproduzierbare seeds

---

## 4. Checkliste

- [ ] E1 Benchmark-Datensaetze und Ground-Truth festgezogen
- [ ] E2 Runner fuer alle Kandidaten mit identischen Inputs
- [ ] E3 Qualitaetsmetriken je Kandidat dokumentiert
- [ ] E4 Latenz-/Kostenprofil je Kandidat dokumentiert
- [ ] E5 Security/Privacy/Lizenz-Risiken bewertet
- [ ] E6 Empfehlung mit Go/No-Go und Migrationshinweis

---

## 5. Quellen (Startpunkt)

- https://huggingface.co/BridgeTower
- https://www.nomic.ai/
- https://jina.ai/embeddings/
- https://deepmind.google/technologies/gemini/

