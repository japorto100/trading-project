# Geopolitical Soft-Signals Service (Optional)

Optional Python FastAPI microservice for AI/ML-style soft-signal candidate generation.
It powers the three adapters in `src/lib/geopolitical/adapters/soft-signals.ts`:

- `news_cluster`
- `social_surge`
- `narrative_shift`

## Endpoints

- `GET /health`
- `POST /api/v1/cluster-headlines`
- `POST /api/v1/social-surge`
- `POST /api/v1/narrative-shift`

## Quick Start

```bash
cd python-backend
uv venv .venv
uv sync --python .\.venv\Scripts\python.exe
cd services/geopolitical-soft-signals
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8091
```

Set in the main app `.env`:

```env
GEOPOLITICAL_SOFT_SIGNAL_ENABLED=true
GEOPOLITICAL_SOFT_SIGNAL_URL=http://127.0.0.1:8091
GEOPOLITICAL_SOFT_SIGNAL_TIMEOUT_MS=8000
GEOPOLITICAL_SOFT_SIGNAL_MAX_CANDIDATES=6
```

Optional NLP/ML upgrade:

```bash
cd python-backend
uv sync --python .\.venv\Scripts\python.exe --extra ml
```

With the `ml` extra, `news_cluster` switches to TF-IDF + MiniBatchKMeans clustering.

## Ingestion Trigger

With both services running:

```bash
curl -X POST http://localhost:3000/api/geopolitical/candidates/ingest/soft
```

The route executes all soft-signal adapters, applies anti-noise filtering and ingestion budget limits,
and upserts produced candidates into the geopolitical candidate store.

