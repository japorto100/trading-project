"""
Mock OpenAI-compatible streaming LLM server for local dev/verify.
Usage: python server.py
Endpoint: POST http://127.0.0.1:11500/v1/chat/completions

Set in .env.development:
  AGENT_PROVIDER=openai-compatible
  OPENAI_BASE_URL=http://127.0.0.1:11500/v1
  OPENAI_API_KEY=mock-key-not-checked

The server logs all incoming messages and returns a streaming response.
For tool testing: set MOCK_LLM_TOOL_CALL=get_chart_state to trigger a tool call.
"""
from __future__ import annotations

import json
import os
import sys
import time
import uuid
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import uvicorn

app = FastAPI(title="Mock LLM Server")

MOCK_TOOL = os.environ.get("MOCK_LLM_TOOL_CALL", "")  # e.g. "get_chart_state"


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def _stream_text(message: str, model: str = "mock-gpt-4o"):
    msg_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"
    # Start chunk
    yield _sse({
        "id": msg_id, "object": "chat.completion.chunk", "model": model,
        "choices": [{"index": 0, "delta": {"role": "assistant", "content": ""}, "finish_reason": None}]
    })
    # Stream text token by token
    for word in message.split():
        yield _sse({
            "id": msg_id, "object": "chat.completion.chunk", "model": model,
            "choices": [{"index": 0, "delta": {"content": word + " "}, "finish_reason": None}]
        })
        time.sleep(0.03)
    # Finish
    yield _sse({
        "id": msg_id, "object": "chat.completion.chunk", "model": model,
        "choices": [{"index": 0, "delta": {}, "finish_reason": "stop"}],
        "usage": {"prompt_tokens": 10, "completion_tokens": len(message.split()), "total_tokens": 10 + len(message.split())}
    })
    yield "data: [DONE]\n\n"


async def _stream_tool_call(tool_name: str, tool_input: dict, model: str = "mock-gpt-4o"):
    msg_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"
    call_id = f"call_{uuid.uuid4().hex[:8]}"
    yield _sse({
        "id": msg_id, "object": "chat.completion.chunk", "model": model,
        "choices": [{"index": 0, "delta": {"role": "assistant", "content": None,
            "tool_calls": [{"index": 0, "id": call_id, "type": "function",
                "function": {"name": tool_name, "arguments": ""}}]},
            "finish_reason": None}]
    })
    args_str = json.dumps(tool_input)
    yield _sse({
        "id": msg_id, "object": "chat.completion.chunk", "model": model,
        "choices": [{"index": 0, "delta": {"tool_calls": [{"index": 0,
            "function": {"arguments": args_str}}]}, "finish_reason": None}]
    })
    yield _sse({
        "id": msg_id, "object": "chat.completion.chunk", "model": model,
        "choices": [{"index": 0, "delta": {}, "finish_reason": "tool_calls"}]
    })
    yield "data: [DONE]\n\n"


@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    model = body.get("model", "mock-gpt-4o")
    messages = body.get("messages", [])
    tools = body.get("tools", [])

    # Log incoming request
    last_user_msg = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
    print(f"\n[mock-llm] Received: {last_user_msg[:200]}", flush=True)
    if tools:
        print(f"[mock-llm] Available tools: {[t['function']['name'] for t in tools]}", flush=True)

    # Check if env requests a tool call
    global MOCK_TOOL
    MOCK_TOOL = os.environ.get("MOCK_LLM_TOOL_CALL", MOCK_TOOL)

    if MOCK_TOOL and any(t.get("function", {}).get("name") == MOCK_TOOL for t in tools):
        print(f"[mock-llm] Triggering tool call: {MOCK_TOOL}", flush=True)
        tool_input: dict[str, Any] = {}
        if MOCK_TOOL == "get_chart_state":
            tool_input = {"symbol": "BTC/USDT"}
        elif MOCK_TOOL == "save_memory":
            tool_input = {"key": "test_key", "content": "mock memory content"}
        elif MOCK_TOOL == "get_portfolio_summary":
            tool_input = {}
        return StreamingResponse(
            _stream_tool_call(MOCK_TOOL, tool_input, model),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
        )

    # Default: echo the user message as text
    response_text = f"Mock LLM response. Your message: '{last_user_msg[:100]}'"
    return StreamingResponse(
        _stream_text(response_text, model),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@app.get("/v1/models")
async def list_models():
    return {"object": "list", "data": [{"id": "mock-gpt-4o", "object": "model"}]}


if __name__ == "__main__":
    port = int(os.environ.get("MOCK_LLM_PORT", "11500"))
    print(f"[mock-llm] Starting on http://127.0.0.1:{port}/v1", flush=True)
    print("[mock-llm] Set MOCK_LLM_TOOL_CALL=get_chart_state to trigger tool calls", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")
