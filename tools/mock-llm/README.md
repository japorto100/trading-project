# Mock LLM Server

OpenAI-compatible streaming mock for local verify/testing without API keys.

## Usage

```bash
cd tools/mock-llm
pip install fastapi uvicorn  # or: uv run python server.py
python server.py
```

## .env.development (root)

```
AGENT_PROVIDER=openai-compatible
OPENAI_BASE_URL=http://127.0.0.1:11500/v1
OPENAI_API_KEY=mock-key-not-checked
```

## Tool call simulation

```bash
# Trigger get_chart_state tool call:
set MOCK_LLM_TOOL_CALL=get_chart_state

# Trigger save_memory:
set MOCK_LLM_TOOL_CALL=save_memory
```
