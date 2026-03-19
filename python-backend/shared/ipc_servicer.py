"""PythonIPC gRPC servicer: ForwardRequest forwards to the service's ASGI app."""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure proto package is importable (generated stubs use "from ipc import ipc_pb2")
_PROTO_PARENT = Path(__file__).resolve().parents[2] / "proto"
if str(_PROTO_PARENT) not in sys.path:
    sys.path.insert(0, str(_PROTO_PARENT))

import grpc  # noqa: E402
from starlette.testclient import TestClient  # noqa: E402
from starlette.types import ASGIApp  # noqa: E402

from ipc import ipc_pb2  # noqa: E402
from ipc.ipc_pb2_grpc import PythonIPCServicer, add_PythonIPCServicer_to_server  # noqa: E402


class ForwardRequestServicer(PythonIPCServicer):
    """Implements ForwardRequest by forwarding to the service's internal ASGI app."""

    def __init__(self, asgi_app: ASGIApp) -> None:
        self._app = asgi_app

    def ForwardRequest(self, request: ipc_pb2.ProxyRequest, context: grpc.ServicerContext) -> ipc_pb2.ProxyResponse:
        """Forward HTTP-style request to the service's internal handlers."""
        try:
            method = request.method or "GET"
            path = request.path or "/"
            if not path.startswith("/"):
                path = "/" + path
            headers = dict(request.headers) if request.headers else {}
            body = bytes(request.body) if request.body else None

            with TestClient(self._app, base_url="http://ipc") as client:
                resp = client.request(method, path, content=body, headers=headers)
            return ipc_pb2.ProxyResponse(
                status_code=resp.status_code,
                body=resp.content,
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return ipc_pb2.ProxyResponse(status_code=500, body=str(e).encode())

    def StreamMarketData(self, request_iterator, context):
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details("Method not implemented!")
        raise NotImplementedError("Method not implemented!")

    def AnalyzeSoftSignal(self, request, context):
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details("Method not implemented!")
        raise NotImplementedError("Method not implemented!")

    def PerformInference(self, request, context):
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details("Method not implemented!")
        raise NotImplementedError("Method not implemented!")


def add_ipc_to_server(server: grpc.Server, asgi_app: ASGIApp) -> None:
    """Register the ForwardRequest servicer on the gRPC server."""
    servicer = ForwardRequestServicer(asgi_app)
    add_PythonIPCServicer_to_server(servicer, server)
