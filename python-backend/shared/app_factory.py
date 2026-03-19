from __future__ import annotations

import json
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request

# Load environment variables from .env.development or .env
PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
env_dev = PYTHON_BACKEND_ROOT / ".env.development"
env_prod = PYTHON_BACKEND_ROOT / ".env"

# override=False: shell environment takes precedence over .env.development.
# This allows GRPC_ENABLED=0 / OTEL_ENABLED=false to be set from the shell
# without being clobbered by the dev file (important for benchmarks and tests).
if env_dev.exists():
    load_dotenv(dotenv_path=env_dev, override=False)
elif env_prod.exists():
    load_dotenv(dotenv_path=env_prod, override=False)


REQUEST_ID_HEADER = "X-Request-ID"


def _service_logger(title: str) -> logging.Logger:
    logger = logging.getLogger(f"tradeviewfusion.{title}")
    if logger.handlers:
        return logger

    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)

    # Optional persistent request trace sink for end-to-end verification and audits.
    # Default stays in D:\DevCache to keep heavy logs off C: and avoid workspace bloat.
    file_path = os.getenv("PY_SERVICE_REQUEST_LOG_PATH", "").strip()
    if not file_path:
        file_path = str(Path("D:/DevCache/tradeview-fusion/python-request-trace.jsonl"))
    try:
        file_target = Path(file_path)
        file_target.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(file_target, encoding="utf-8")
        file_handler.setFormatter(logging.Formatter("%(message)s"))
        logger.addHandler(file_handler)
    except OSError:
        # Keep service startup resilient when file sink cannot be created.
        pass

    logger.setLevel(logging.INFO)
    logger.propagate = False
    return logger


def create_service_app(
    title: str,
    version: str = "0.1.0",
    *,
    http_port: int | None = None,
) -> FastAPI:
    """Create FastAPI app. If http_port is set and GRPC_ENABLED=1, starts gRPC server on http_port+1000."""

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if http_port is not None and os.getenv("GRPC_ENABLED", "").strip().lower() in ("1", "true", "yes"):
            from shared.grpc_server import start_grpc_server

            start_grpc_server(app, host="127.0.0.1", http_port=http_port)
        yield

    app = FastAPI(title=title, version=version, lifespan=lifespan)

    if os.getenv("OTEL_ENABLED", "").strip().lower() == "true":
        try:
            import base64

            from opentelemetry import trace  # type: ignore[import-untyped]
            from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter  # type: ignore[import-untyped]
            from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor  # type: ignore[import-untyped]
            from opentelemetry.sdk.resources import Resource  # type: ignore[import-untyped]
            from opentelemetry.sdk.trace import TracerProvider  # type: ignore[import-untyped]
            from opentelemetry.sdk.trace.export import BatchSpanProcessor  # type: ignore[import-untyped]

            exporter_kwargs: dict = {}
            oo_user = os.getenv("OPENOBSERVE_USER", "").strip()
            if oo_user:
                oo_pass = os.getenv("OPENOBSERVE_PASSWORD", "")
                token = base64.b64encode(f"{oo_user}:{oo_pass}".encode()).decode()
                oo_org = os.getenv("OPENOBSERVE_ORG", "default")
                exporter_kwargs["headers"] = {
                    "authorization": f"Basic {token}",  # gRPC metadata keys must be lowercase
                    "organization": oo_org,
                }

            provider = TracerProvider(resource=Resource.create({"service.name": title}))
            provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(**exporter_kwargs)))
            trace.set_tracer_provider(provider)
            FastAPIInstrumentor.instrument_app(app)

            # Provider-agnostic: traces any outbound httpx call (ACLED, FRED, Go Gateway, etc.)
            try:
                from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor  # type: ignore[import-untyped]
                HTTPXClientInstrumentor().instrument()
            except ImportError:
                pass

            # — Metrics —
            try:
                from opentelemetry import metrics as otel_metrics  # type: ignore[import-untyped]
                from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter  # type: ignore[import-untyped]
                from opentelemetry.sdk.metrics import MeterProvider  # type: ignore[import-untyped]
                from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader  # type: ignore[import-untyped]

                _mp = MeterProvider(
                    resource=Resource.create({"service.name": title}),
                    metric_readers=[PeriodicExportingMetricReader(OTLPMetricExporter(**exporter_kwargs))],
                )
                otel_metrics.set_meter_provider(_mp)
            except ImportError:
                pass  # metrics optional

            # — Logs bridge (Python logging → OTLP) —
            try:
                import logging as _stdlib_logging

                from opentelemetry._logs import set_logger_provider  # type: ignore[import-untyped]
                from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter  # type: ignore[import-untyped]
                from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler  # type: ignore[import-untyped]
                from opentelemetry.sdk._logs.export import BatchLogRecordProcessor  # type: ignore[import-untyped]

                _lp = LoggerProvider(resource=Resource.create({"service.name": title}))
                _lp.add_log_record_processor(BatchLogRecordProcessor(OTLPLogExporter(**exporter_kwargs)))
                set_logger_provider(_lp)
                _stdlib_logging.root.addHandler(LoggingHandler(logger_provider=_lp, level=_stdlib_logging.INFO))
            except ImportError:
                pass  # logs optional

        except ImportError:
            pass  # OTel packages optional — service starts without tracing

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
