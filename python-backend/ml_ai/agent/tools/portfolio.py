# get_portfolio_summary Tool — Phase 10e.2
# Returns portfolio: positions, exposure

from __future__ import annotations

import os
from typing import Any

import httpx

GO_GATEWAY_URL = os.environ.get("GO_GATEWAY_BASE_URL", "http://127.0.0.1:9060")


async def get_portfolio_summary(*, user_id: str | None = None) -> dict[str, Any]:
    """
    Get portfolio summary. Read-only. Phase 10e.2.
    Proxies to Go Gateway GCT portfolio API.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(f"{GO_GATEWAY_URL}/api/v1/gct/portfolio/summary")
            if r.status_code == 200:
                data = r.json()
                return {
                    "positions": data.get("balances", []),
                    "total_exposure": data.get("total", 0),
                    "source": "gct",
                }
    except Exception:
        pass
    return {"positions": [], "total_exposure": 0, "source": "stub"}
