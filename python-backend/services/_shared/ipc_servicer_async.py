"""Async gRPC servicer for grpclib backend (Python 3.13t / nogil).

grpclib uses asyncio handlers — all servicer methods must be async.
Implements ForwardRequest by forwarding to the service's ASGI app via
httpx.ASGITransport (no sync TestClient, compatible with asyncio event loop).

Only ForwardRequest is implemented — the active Go→Python IPC method.
StreamMarketData / AnalyzeSoftSignal / PerformInference remain UNIMPLEMENTED
(same as ipc_servicer.py for grpcio).
"""

from __future__ import annotations

import sys
from pathlib import Path

_PROTO_PARENT = Path(__file__).resolve().parents[2] / "proto"
if str(_PROTO_PARENT) not in sys.path:
    sys.path.insert(0, str(_PROTO_PARENT))

import grpclib.const  # noqa: E402
import grpclib.server  # noqa: E402
import httpx  # noqa: E402

from ipc import ipc_pb2  # noqa: E402


class ForwardRequestServicerAsync:
    """Async grpclib servicer — implements ForwardRequest via httpx.ASGITransport."""

    def __init__(self, asgi_app: object) -> None:
        self._app = asgi_app

    async def ForwardRequest(self, stream: grpclib.server.Stream) -> None:
        request: ipc_pb2.ProxyRequest = await stream.recv_message()
        try:
            method = request.method or "GET"
            path = request.path or "/"
            if not path.startswith("/"):
                path = "/" + path
            headers = dict(request.headers) if request.headers else {}
            body = bytes(request.body) if request.body else None

            transport = httpx.ASGITransport(app=self._app)
            async with httpx.AsyncClient(transport=transport, base_url="http://ipc") as client:
                resp = await client.request(method, path, content=body, headers=headers)

            await stream.send_message(
                ipc_pb2.ProxyResponse(status_code=resp.status_code, body=resp.content)
            )
        except Exception as exc:
            await stream.send_message(
                ipc_pb2.ProxyResponse(status_code=500, body=str(exc).encode())
            )

    async def StreamMarketData(self, stream: grpclib.server.Stream) -> None:
        raise grpclib.GRPCError(grpclib.const.Status.UNIMPLEMENTED, "StreamMarketData not implemented")

    async def AnalyzeSoftSignal(self, stream: grpclib.server.Stream) -> None:
        raise grpclib.GRPCError(grpclib.const.Status.UNIMPLEMENTED, "AnalyzeSoftSignal not implemented")

    async def PerformInference(self, stream: grpclib.server.Stream) -> None:
        raise grpclib.GRPCError(grpclib.const.Status.UNIMPLEMENTED, "PerformInference not implemented")

    def __mapping__(self) -> dict:
        return {
            "/ipc.PythonIPC/ForwardRequest": grpclib.server.Handler(
                self.ForwardRequest,
                grpclib.const.Cardinality.UNARY_UNARY,
                ipc_pb2.ProxyRequest,
                ipc_pb2.ProxyResponse,
            ),
            "/ipc.PythonIPC/StreamMarketData": grpclib.server.Handler(
                self.StreamMarketData,
                grpclib.const.Cardinality.UNARY_STREAM,
                ipc_pb2.ProxyRequest,
                ipc_pb2.ProxyResponse,
            ),
            "/ipc.PythonIPC/AnalyzeSoftSignal": grpclib.server.Handler(
                self.AnalyzeSoftSignal,
                grpclib.const.Cardinality.UNARY_UNARY,
                ipc_pb2.ProxyRequest,
                ipc_pb2.ProxyResponse,
            ),
            "/ipc.PythonIPC/PerformInference": grpclib.server.Handler(
                self.PerformInference,
                grpclib.const.Cardinality.UNARY_UNARY,
                ipc_pb2.ProxyRequest,
                ipc_pb2.ProxyResponse,
            ),
        }


def make_grpclib_servicers(asgi_app: object) -> list:
    """Return list of grpclib servicers for Server([...])."""
    return [ForwardRequestServicerAsync(asgi_app)]
