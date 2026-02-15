# Services Overview

This folder contains all Python HTTP services used by the Next.js app.

## Available Services

- `finance-bridge/`
  - FastAPI sidecar for yfinance-backed quote/OHLCV/search endpoints.
  - Default local URL: `http://127.0.0.1:8081`
  - Used by Node provider via `YFINANCE_BRIDGE_URL`.

- `geopolitical-soft-signals/`
  - FastAPI sidecar for soft-signal candidate generation (`news_cluster`, `social_surge`, `narrative_shift`) and GameTheory-style impact scoring (`game-theory/impact`).
  - Default local URL: `http://127.0.0.1:8091`
  - Used by geopolitical adapter via `GEOPOLITICAL_SOFT_SIGNAL_URL`.

- `indicator-service/`
  - FastAPI sidecar for indicator/pattern/composite-signal contracts from `docs/project_audit2.md`.
  - Default local URL: `http://127.0.0.1:8092`.

- `_shared/`
  - Shared service utilities (for example app factory helpers).

## Start from monorepo root

```powershell
cd python-backend
uv venv .venv
uv sync --python .\.venv\Scripts\python.exe
uv sync --python .\.venv\Scripts\python.exe --extra ml # optional
```

Then run either service with the shared venv:

```powershell
cd services/finance-bridge
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8081
```

```powershell
cd services/geopolitical-soft-signals
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8091
```

```powershell
cd services/indicator-service
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8092
```
