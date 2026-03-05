"""
gRPC IPC tests: ForwardRequest against minimal FastAPI app.

Verifies that the Python IPC gRPC servicer correctly forwards requests
to the underlying ASGI app and returns the response.
"""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

# Ensure proto package is importable
_PROTO_PARENT = Path(__file__).resolve().parents[1] / "proto"
if str(_PROTO_PARENT) not in sys.path:
    sys.path.insert(0, str(_PROTO_PARENT))

import grpc
from fastapi import FastAPI
from ipc import ipc_pb2
from ipc.ipc_pb2_grpc import PythonIPCStub

from services._shared.grpc_server import start_grpc_server


def _minimal_app() -> FastAPI:
    """Minimal FastAPI app with /health for testing."""
    app = FastAPI(title="test-ipc")

    @app.get("/health")
    def health():
        return {"ok": True}

    return app


class TestIpcGrpc(unittest.TestCase):
    """Test gRPC ForwardRequest against minimal FastAPI app."""

    def test_forward_request_health(self) -> None:
        """ForwardRequest with GET /health returns 200 and JSON body."""
        app = _minimal_app()
        grpc_port = 19992  # High port to avoid conflicts
        start_grpc_server(app, host="127.0.0.1", port=grpc_port)

        channel = grpc.insecure_channel(f"127.0.0.1:{grpc_port}")
        stub = PythonIPCStub(channel)

        req = ipc_pb2.ProxyRequest(
            method="GET",
            path="/health",
            body=b"",
            headers={},
        )
        resp = stub.ForwardRequest(req)

        self.assertEqual(resp.status_code, 200)
        self.assertIn(b"ok", resp.body)
        self.assertIn(b"true", resp.body)

        channel.close()


if __name__ == "__main__":
    unittest.main()
