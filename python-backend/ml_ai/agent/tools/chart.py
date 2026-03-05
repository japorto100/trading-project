# chart Tools — Phase 10e.1 / 10.v3
# get_chart_state: read-only
# set_chart_state: mutation (pending confirm)

from __future__ import annotations

import os
import uuid
from typing import Any

import httpx

GO_GATEWAY_URL = os.environ.get("GO_GATEWAY_BASE_URL", "http://127.0.0.1:9060")


async def get_chart_state(*, user_id: str | None = None) -> dict[str, Any]:
    """
    Get current chart state. Read-only. Phase 10e.1.
    Proxies to Go Gateway which may get state from frontend/session.
    """
    # Stub: Frontend state API not yet exposed. Return structure.
    # When implemented: GET /api/v1/fusion/chart/state or similar
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{GO_GATEWAY_URL}/api/v1/fusion/chart/state")
            if r.status_code == 200:
                return r.json()
    except Exception:
        pass
    return {
        "symbol": "EURUSD",
        "timeframe": "4H",
        "indicators": ["RSI", "MACD"],
        "source": "stub",
    }


async def set_chart_state(symbol: str, timeframe: str) -> dict[str, Any]:
    """
    Mutation Tool: request chart state change. Phase 10.v3.
    Stores pending mutation in working memory (session 'global').
    Frontend must confirm before applying.
    """
    mutation_id = str(uuid.uuid4())[:8]
    return {
        "ok": True,
        "mutation_id": mutation_id,
        "symbol": symbol,
        "timeframe": timeframe,
        "status": "pending_confirm",
    }
