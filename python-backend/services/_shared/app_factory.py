from __future__ import annotations

import json
import logging
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, Request
from dotenv import load_dotenv

# Load environment variables from .env.development or .env
PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
env_dev = PYTHON_BACKEND_ROOT / ".env.development"
env_prod = PYTHON_BACKEND_ROOT / ".env"

if env_dev.exists():
    load_dotenv(dotenv_path=env_dev)
elif env_prod.exists():
    load_dotenv(dotenv_path=env_prod)


REQUEST_ID_HEADER = "X-Request-ID"


def _service_logger(title: str) -> logging.Logger:
    logger = logging.getLogger(f"tradeviewfusion.{title}")
    if logger.handlers:
        return logger

    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


def create_service_app(title: str, version: str = "0.1.0") -> FastAPI:
    app = FastAPI(title=title, version=version)
    logger = _service_logger(title)

    @app.middleware("http")
    async def request_context_middleware(request: Request, call_next):
        request_id = request.headers.get(REQUEST_ID_HEADER, "").strip() or str(uuid.uuid4())
        request.state.request_id = request_id
        started = time.perf_counter()

        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id

        logger.info(
            json.dumps(
                {
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "level": "info",
                    "service": title,
                    "requestId": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                }
            )
        )
        return response

    return app
