# Agent Service — FastAPI + WebSocket scaffold
# Phase 10a: Runtime, Rollen, BTE/DRS Guards, Memory/Context-Verdrahtung (10a.4)
# Ref: AGENT_ARCHITECTURE.md, AGENT_TOOLS.md, CONTEXT_ENGINEERING.md

from __future__ import annotations

from pathlib import Path
import sys

PYTHON_BACKEND_ROOT = Path(__file__).resolve().parents[2]
if str(PYTHON_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(PYTHON_BACKEND_ROOT))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402
from pydantic import BaseModel  # noqa: E402
from services._shared import create_service_app  # noqa: E402
from ml_ai.agent.roles import AgentRole  # noqa: E402
from ml_ai.agent.context_assembler import assemble_context  # noqa: E402
from ml_ai.agent.working_memory import (  # noqa: E402
    working_memory_append,
    working_memory_get,
    working_memory_set,
)  # noqa: E402
from ml_ai.agent.tools import get_chart_state, get_geomap_focus, get_portfolio_summary  # noqa: E402
from ml_ai.agent.tools.chart import set_chart_state  # noqa: E402

app = create_service_app("agent-service")


class ContextRequest(BaseModel):
    query: str
    kg_node_type: str = "Stratagem"
    kg_limit: int = 10
    episodic_limit: int = 3
    vector_limit: int = 5


class WorkingMemorySetRequest(BaseModel):
    session_id: str
    entry_id: str
    content: dict | str


class WorkingMemoryAppendRequest(BaseModel):
    session_id: str
    role: str
    content: dict | str


class SetChartStateRequest(BaseModel):
    symbol: str
    timeframe: str


@app.get("/health")
async def health():
    return {"ok": True, "service": "agent-service", "roles": [r.value for r in AgentRole]}


@app.post("/api/v1/agent/context")
async def agent_context(req: ContextRequest):
    """Assemble context from Memory layers (KG, Episodic, Vector) for agent. Phase 10a.4."""
    try:
        fragments, flags = await assemble_context(
            req.query,
            kg_node_type=req.kg_node_type,
            kg_limit=req.kg_limit,
            episodic_limit=req.episodic_limit,
            vector_limit=req.vector_limit,
        )
        return {
            "ok": True,
            "fragments": [
                {
                    "source": f.source,
                    "relevance": f.relevance,
                    "content_preview": str(f.content)[:200] if isinstance(f.content, (str, dict)) else str(f.content)[:200],
                }
                for f in fragments
            ],
            "flags": flags,
            "total": len(fragments),
        }
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"ok": False, "error": str(e), "flags": ["CONTEXT_ASSEMBLY_FAILED"]},
        )


@app.get("/api/v1/agent/working-memory/{session_id}")
async def get_working_memory(session_id: str):
    """Get M5 scratchpad for session. Phase 10c."""
    data = await working_memory_get(session_id)
    return {"ok": True, "session_id": session_id, "entries": data}


@app.post("/api/v1/agent/working-memory")
async def set_working_memory(req: WorkingMemorySetRequest):
    """Set entry in M5 scratchpad. Phase 10c."""
    await working_memory_set(req.session_id, req.entry_id, req.content)
    return {"ok": True, "entry_id": req.entry_id}


@app.post("/api/v1/agent/working-memory/append")
async def append_working_memory(req: WorkingMemoryAppendRequest):
    """Append entry to M5 scratchpad. Phase 10c."""
    entry_id = await working_memory_append(req.session_id, req.role, req.content)
    return {"ok": True, "entry_id": entry_id}


@app.get("/api/v1/agent/tools/chart-state")
async def tool_chart_state():
    """WebMCP Tool: get_chart_state. Phase 10e.1."""
    return await get_chart_state()


@app.get("/api/v1/agent/tools/portfolio-summary")
async def tool_portfolio_summary():
    """WebMCP Tool: get_portfolio_summary. Phase 10e.2."""
    return await get_portfolio_summary()


@app.get("/api/v1/agent/tools/geomap-focus")
async def tool_geomap_focus():
    """WebMCP Tool: get_geomap_focus. Phase 10e.3."""
    return await get_geomap_focus()


@app.post("/api/v1/agent/tools/set_chart_state")
async def tool_set_chart_state(req: SetChartStateRequest):
    """WebMCP Mutation Tool: set_chart_state. Phase 10.v3.
    Stores pending mutation — frontend must confirm before applying."""
    try:
        result = await set_chart_state(req.symbol, req.timeframe)
        await working_memory_set("global", f"mutation:{result['mutation_id']}", {
            "type": "set_chart_state",
            "symbol": req.symbol,
            "timeframe": req.timeframe,
            "mutation_id": result["mutation_id"],
            "status": "pending_confirm",
        })
        return result
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"ok": False, "error": str(e)},
        )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket scaffold for agent runtime. Phase 10a."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Placeholder: echo back with role info
            await websocket.send_json(
                {"received": data, "roles": [r.value for r in AgentRole], "status": "scaffold"}
            )
    except WebSocketDisconnect:
        pass
