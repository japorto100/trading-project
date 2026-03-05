"""Start gRPC server in a background thread for PythonIPC (ForwardRequest)."""

from __future__ import annotations

import logging
import os
import threading
from concurrent.futures import ThreadPoolExecutor

import grpc

from services._shared.ipc_servicer import add_ipc_to_server

logger = logging.getLogger("tradeviewfusion.grpc")


def _default_grpc_port(http_port: int) -> int:
    """gRPC port = HTTP port + 1000 (e.g. 8092 -> 9092)."""
    return http_port + 1000


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
    """
    if port is None:
        if http_port is not None:
            port = _default_grpc_port(http_port)
        else:
            port = int(os.getenv("GRPC_PORT", "9092"))
    server = grpc.server(ThreadPoolExecutor(max_workers=4), maximum_concurrent_rpcs=100)
    add_ipc_to_server(server, asgi_app)
    server.add_insecure_port(f"{host}:{port}")
    server.start()
    logger.info("gRPC IPC server listening on %s:%d", host, port)

    def run() -> None:
        try:
            server.wait_for_termination()
        except Exception as e:
            logger.exception("gRPC server error: %s", e)

    thread = threading.Thread(target=run, daemon=True, name="grpc-ipc")
    thread.start()
    return thread
