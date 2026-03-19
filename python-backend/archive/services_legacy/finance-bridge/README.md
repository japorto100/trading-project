# yfinance Bridge (Optional)

This is an optional Python microservice that exposes `yfinance` data through a tiny HTTP API.
It allows the Next.js provider layer to use `yfinance` as another fallback source.

## Endpoints

- `GET /health`
- `GET /quote?symbol=AAPL`
- `GET /ohlcv?symbol=AAPL&timeframe=1D&limit=300`
- `GET /search?q=apple`

## Quick Start

```bash
cd python-backend
uv venv .venv
uv sync --python .\.venv\Scripts\python.exe
cd services/finance-bridge
..\..\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8081
```

Then set in the main app `.env`:

```env
YFINANCE_BRIDGE_URL=http://localhost:8081
```

## Notes

- This wrapper is unofficial and depends on Yahoo-backed `yfinance` data.
- Use as fallback source; do not rely on it as the sole production-grade feed.

