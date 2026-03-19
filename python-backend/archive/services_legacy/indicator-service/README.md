# Indicator Service

FastAPI sidecar for the Python indicator/pattern/composite-signal slice referenced in `docs/project_audit2.md`.

## Endpoints

- `POST /api/v1/indicators/exotic-ma`
- `POST /api/v1/indicators/ks-collection`
- `POST /api/v1/patterns/candlestick`
- `POST /api/v1/patterns/harmonic`
- `POST /api/v1/patterns/timing`
- `POST /api/v1/patterns/price`
- `POST /api/v1/patterns/elliott-wave`
- `POST /api/v1/signals/composite`
- `POST /api/v1/fibonacci/levels`
- `POST /api/v1/charting/transform`
- `POST /api/v1/evaluate/strategy`

## Local Run

```powershell
cd python-backend
uv venv .venv
uv sync --python .\.venv\Scripts\python.exe
uv sync --python .\.venv\Scripts\python.exe --extra ml

cd services/indicator-service
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8092
```
