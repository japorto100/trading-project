# get_geomap_focus Tool — Phase 10e.3
# Returns current GeoMap region, marker focus

from __future__ import annotations

import os
from typing import Any

import httpx

GO_GATEWAY_URL = os.environ.get("GO_GATEWAY_BASE_URL", "http://127.0.0.1:9060")


async def get_geomap_focus(*, user_id: str | None = None) -> dict[str, Any]:
    """
    Get GeoMap focus (region, markers). Read-only. Phase 10e.3.
    Proxies to Go Gateway geopolitical API.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(f"{GO_GATEWAY_URL}/api/v1/geopolitical/events")
            if r.status_code == 200:
                data = r.json()
                return {
                    "region": "global",
                    "markers": data.get("events", [])[:10],
                    "body": "Earth",
                    "source": "api",
                }
    except Exception:
        pass
    return {"region": "global", "markers": [], "body": "Earth", "source": "stub"}
