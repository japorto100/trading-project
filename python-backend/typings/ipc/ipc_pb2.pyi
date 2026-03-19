"""Type stubs for generated protobuf ipc_pb2 module.

Generated from ipc/ipc.proto — DO NOT EDIT manually.
Regenerate with: python -m grpc_tools.protoc ...
"""

from typing import Any, Mapping

class ProxyRequest:
    method: str
    path: str
    body: bytes
    headers: Mapping[str, str]

    def __init__(
        self,
        method: str = ...,
        path: str = ...,
        body: bytes = ...,
        headers: Mapping[str, str] = ...,
    ) -> None: ...

class ProxyResponse:
    status_code: int
    body: bytes

    def __init__(
        self,
        status_code: int = ...,
        body: bytes = ...,
    ) -> None: ...

class Empty:
    def __init__(self) -> None: ...

class MarketData:
    symbol: str
    exchange: str
    asset_type: str
    last_price: float
    bid: float
    ask: float
    volume: float
    timestamp: int

    def __init__(self, **kwargs: Any) -> None: ...

class SoftSignalRequest:
    source: str
    title: str
    content: str
    published_at: int

    def __init__(self, **kwargs: Any) -> None: ...

class SoftSignalResponse:
    sentiment_score: float
    entities: list[str]
    classification: str

    def __init__(self, **kwargs: Any) -> None: ...

class InferenceRequest:
    model_name: str
    features: Mapping[str, float]

    def __init__(self, **kwargs: Any) -> None: ...

class InferenceResponse:
    prediction: float
    confidence: float

    def __init__(self, **kwargs: Any) -> None: ...
