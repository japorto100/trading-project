# Python Agent

Agent service (port 8094) and memory service (port 8093).

Current intended ownership:

- `agent/` — agent loop, tools, roles, context assembler, working memory
- `memory/` — memory service app (episodic, KG, vector)
- `memory_engine/` — KG store, vector store, episodic store, models, seed data
- `context/` — context merge, relevance scoring, token budget
- agent-side retrieval, episodic memory, KG query, tool orchestration

Current repo rule:

- shared `.venv` remains the active default until a real deployment split is needed
- `services/_shared/app_factory.py` loads env from central `python-backend/.env.development`

## FinGPT / LLM-based Narrative Analysis (Phase 23+ target)

`python-compute/geopolitical_soft_signals/pipeline.py::build_narrative_shift()` currently
has a `SOFT_SIGNAL_FINGPT_POC_ENABLED` flag that enables FinBERT-enhanced sentiment scoring
(HTTP call to HuggingFace — **no LLM call yet**).

When real FinGPT / LLM-based narrative analysis is implemented it **belongs here**, not in
python-compute. Rationale: LLM orchestration, prompt construction, and model routing are
agent concerns.

### Migration target (Phase 23+)

```
POST /api/v1/agent/narrative-shift   (new endpoint in python-agent/agent/app.py)
  ← python-compute calls this via HTTP when SOFT_SIGNAL_FINGPT_POC_ENABLED=true
  ← uses agent.tools / anthropic / openai SDK internally
```

python-compute keeps the deterministic pipeline; the LLM-enhanced path is delegated to
python-agent via a single HTTP call. No shared state — clean service boundary.

## Memory Read/Write split

python-agent owns the **read path** (search, query, retrieve). The write path (add, seed,
ingest) will migrate to python-ingest-workers in Phase 23+. See
`python-ingest-workers/README.md` for the full dependency diagram.
