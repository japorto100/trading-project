# Python Backend Monorepo

Klar getrennte Python-Bausteine fuer Tradeview Fusion.

## Struktur

- `services/`
  - `finance-bridge/` (Market-Data Sidecar via yfinance)
  - `geopolitical-soft-signals/` (Soft-Signal Candidate Service + GameTheory Impact API)
  - `indicator-service/` (Indicators, patterns, composite signal, strategy evaluation)
- `ml_ai/`
  - `geopolitical_soft_signals/` (NLP/ML-Pipeline, von FastAPI importiert)
- `scripts/`
  - `dev-with-python-services.ps1` (Autostart Sidecars + Next.js)
  - `smoke-soft-signals.py` (Kandidaten-Smoketest)
  - `smoke-soft-signals.ps1` (uv-Setup + Smoke Runner)
- `.venv/` (gemeinsame venv fuer alle Python-Services)
- `pyproject.toml` (zentrale Dependencies + `ml` extra)

## Quick Start (uv)

```powershell
cd python-backend
uv venv .venv
uv sync --python .\.venv\Scripts\python.exe
uv sync --python .\.venv\Scripts\python.exe --extra ml # optional

cd services/finance-bridge
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8092

cd ../geopolitical-soft-signals
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8091

cd ../indicator-service
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8090
```

## Smoke-Test

```powershell
bun run smoke:soft-signals
bun run smoke:indicator-service
```

