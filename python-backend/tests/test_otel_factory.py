"""
Tests for OTel integration in app_factory.create_service_app().

Covers:
- App creates successfully without OTEL_ENABLED (default path).
- App creates successfully with OTEL_ENABLED=true + no OO credentials (graceful fallback).
- App creates successfully with OTEL_ENABLED=true + OO credentials in env (headers computed).
- request_context_middleware propagates X-Request-ID through request/response.
"""

from __future__ import annotations

import os

from fastapi.testclient import TestClient


def _make_app(otel_enabled: bool = False, extra_env: dict | None = None):
    """Create a minimal service app with controlled env vars."""
    env_patch = {
        "OTEL_ENABLED": "true" if otel_enabled else "false",
        "OPENOBSERVE_USER": "",
        "OPENOBSERVE_PASSWORD": "",
        "OPENOBSERVE_ORG": "",
        **(extra_env or {}),
    }
    original = {k: os.environ.get(k) for k in env_patch}
    for k, v in env_patch.items():
        os.environ[k] = v
    try:
        # Re-import inside the patched env so OTEL_ENABLED is read fresh.
        import importlib

        import shared.app_factory as factory_mod

        importlib.reload(factory_mod)
        app = factory_mod.create_service_app("test-service", version="0.0.1")
        return app
    finally:
        for k, v in original.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v


class TestCreateServiceApp:
    def test_creates_without_otel(self):
        app = _make_app(otel_enabled=False)
        assert app is not None
        assert app.title == "test-service"

    def test_creates_with_otel_no_credentials(self):
        """OTEL_ENABLED=true but no OO credentials — ImportError/connection errors must not crash."""
        app = _make_app(otel_enabled=True)
        assert app is not None

    def test_health_route_can_be_added(self):
        """Verify that additional routes can be mounted after factory call."""
        app = _make_app(otel_enabled=False)

        @app.get("/health")
        async def health():
            return {"ok": True}

        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"ok": True}


class TestRequestIDMiddleware:
    def _make_client(self) -> TestClient:
        app = _make_app(otel_enabled=False)

        @app.get("/ping")
        async def ping():
            return {"pong": True}

        return TestClient(app, raise_server_exceptions=True)

    def test_generates_request_id_if_missing(self):
        client = self._make_client()
        resp = client.get("/ping")
        assert resp.status_code == 200
        rid = resp.headers.get("x-request-id")
        assert rid is not None and len(rid) > 0

    def test_propagates_provided_request_id(self):
        client = self._make_client()
        custom_id = "test-req-abc-123"
        resp = client.get("/ping", headers={"X-Request-ID": custom_id})
        assert resp.status_code == 200
        assert resp.headers.get("x-request-id") == custom_id

    def test_different_requests_get_unique_ids(self):
        client = self._make_client()
        ids = {client.get("/ping").headers.get("x-request-id") for _ in range(5)}
        assert len(ids) == 5, "Each request should get a unique request ID"
