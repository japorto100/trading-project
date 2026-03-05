# Memory API client for agent — calls Go Gateway (Phase 10a.4)
# Ref: MEMORY_ARCHITECTURE.md, API_CONTRACTS.md

from __future__ import annotations

import os
from typing import Any

import httpx

GO_GATEWAY_URL = os.environ.get("GO_GATEWAY_BASE_URL", "http://127.0.0.1:9060")
MEMORY_BASE = f"{GO_GATEWAY_URL}/api/v1/memory"


async def get_kg_nodes(node_type: str = "Stratagem", limit: int = 36) -> dict[str, Any]:
    """Fetch KG nodes via Go Gateway."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            f"{MEMORY_BASE}/kg/nodes",
            params={"nodeType": node_type, "limit": limit},
        )
        r.raise_for_status()
        return r.json()


async def post_kg_seed(force: bool = False) -> dict[str, Any]:
    """Trigger KG seed via Go Gateway."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(f"{MEMORY_BASE}/kg/seed", json={"force": force})
        r.raise_for_status()
        return r.json()


async def post_vector_search(query: str, n_results: int = 5) -> dict[str, Any]:
    """Vector search via Go Gateway."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            f"{MEMORY_BASE}/search",
            json={"query": query, "n_results": n_results},
        )
        r.raise_for_status()
        return r.json()


async def get_episodes(agent_role: str = "", limit: int = 10) -> dict[str, Any]:
    """List episodes via Go Gateway."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        params: dict[str, Any] = {"limit": limit}
        if agent_role:
            params["agentRole"] = agent_role
        r = await client.get(f"{MEMORY_BASE}/episodes", params=params)
        r.raise_for_status()
        return r.json()


async def get_memory_health() -> dict[str, Any]:
    """Memory health via Go Gateway."""
    async with httpx.AsyncClient(timeout=5.0) as client:
        r = await client.get(f"{MEMORY_BASE}/health")
        r.raise_for_status()
        return r.json()
