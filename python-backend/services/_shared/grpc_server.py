"""Start gRPC server in a background thread for PythonIPC (ForwardRequest).

GRPC_BACKEND env selects the implementation:
  - "grpcio"  (default, 3.12): ThreadPoolExecutor-based, C-extension
  - "grpclib" (3.13t): pure-Python asyncio gRPC, GIL-disabled-compatible
"""

from __future__ import annotations

import asyncio
import logging
import os
import threading
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger("tradeviewfusion.grpc")

_GRPC_BACKEND = os.getenv("GRPC_BACKEND", "grpcio").lower()


def _default_grpc_port(http_port: int) -> int:
    """gRPC port = HTTP port + 1000 (e.g. 8092 -> 9092)."""
    return http_port + 1000


def _noop_thread(name: str = "grpc-ipc-noop") -> threading.Thread:
    t = threading.Thread(target=lambda: None, daemon=True, name=name)
    t.start()
    return t


# ---------------------------------------------------------------------------
# grpcio backend (default, Python 3.12 / GIL)
# ---------------------------------------------------------------------------

def _start_grpcio(asgi_app: object, host: str, port: int) -> threading.Thread:
    try:
        import grpc  # noqa: PLC0415
        from services._shared.ipc_servicer import add_ipc_to_server  # noqa: PLC0415
    except ImportError as exc:
        logger.warning("grpcio not available — skipping gRPC IPC (%s)", exc)
        return _noop_thread()

    server = grpc.server(ThreadPoolExecutor(max_workers=4), maximum_concurrent_rpcs=100)
    add_ipc_to_server(server, asgi_app)
    bound = server.add_insecure_port(f"{host}:{port}")
    if bound == 0:
        logger.warning(
            "gRPC IPC server could not bind to %s:%d — port in use or permission denied (skipping gRPC)",
            host, port,
        )
        return _noop_thread()
    try:
        server.start()
    except RuntimeError as exc:
        logger.warning("gRPC IPC server failed to start on %s:%d — %s (skipping gRPC)", host, port, exc)
        return _noop_thread()

    logger.info("gRPC IPC server listening on %s:%d (grpcio)", host, port)

    def run() -> None:
        try:
            server.wait_for_termination()
        except Exception as e:
            logger.exception("gRPC server error: %s", e)

    thread = threading.Thread(target=run, daemon=True, name="grpc-ipc")
    thread.start()
    return thread


# ---------------------------------------------------------------------------
# grpclib backend (Python 3.13t / nogil — pure-Python asyncio gRPC)
# ---------------------------------------------------------------------------

def _start_grpclib(asgi_app: object, host: str, port: int) -> threading.Thread:
    """asyncio-based gRPC server via grpclib (no C-extension, 3.13t-compatible).

    grpclib uses asyncio handlers — servicer methods must be async.
    ipc_servicer_async.py provides the async variant of ForwardRequestServicer.
    """
    try:
        from grpclib.server import Server  # noqa: PLC0415
        from services._shared.ipc_servicer_async import make_grpclib_servicers  # noqa: PLC0415
    except ImportError as exc:
        logger.warning("grpclib not available — skipping gRPC IPC (%s)", exc)
        return _noop_thread()

    async def _serve() -> None:
        servicers = make_grpclib_servicers(asgi_app)
        server = Server(servicers)
        try:
            await server.start(host, port)
            logger.info("gRPC IPC server listening on %s:%d (grpclib/asyncio)", host, port)
            await server.wait_closed()
        except OSError as exc:
            logger.warning(
                "gRPC IPC server could not bind to %s:%d — %s (skipping gRPC)",
                host, port, exc,
            )

    def run() -> None:
        asyncio.run(_serve())

    thread = threading.Thread(target=run, daemon=True, name="grpc-ipc")
    thread.start()
    return thread


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def start_grpc_server(
    asgi_app: object,
    *,
    host: str = "127.0.0.1",
    port: int | None = None,
    http_port: int | None = None,
) -> threading.Thread:
    """
    Start gRPC server in a background thread.
    If port is not given, derives from http_port (http_port + 1000) or env GRPC_PORT.
    Backend selected via GRPC_BACKEND env: "grpcio" (default) | "grpclib" (3.13t).
    """
    if port is None:
        if http_port is not None:
            port = _default_grpc_port(http_port)
        else:
            port = int(os.getenv("GRPC_PORT", "9092"))

    if _GRPC_BACKEND == "grpclib":
        return _start_grpclib(asgi_app, host, port)
    return _start_grpcio(asgi_app, host, port)
