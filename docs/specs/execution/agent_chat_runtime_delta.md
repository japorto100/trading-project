# Agent Chat Runtime Delta

> **Stand:** 18. März 2026 (Rev. 7)
> **Phase:** 22d/22f Backend — Agent Chat Runtime (Go + Python)
> **Zweck:** Execution-Owner für die Backend-Implementierung des Agent Chat (AC6/AC7 aus agent_chat_ui_delta.md).
> **Aenderungshistorie:**
> - Rev. 1 (17.03.2026): Initial — Python Domain Migration, Anthropic Streaming, Go SSE Proxy, Vercel AI Protocol
> - Rev. 2 (17.03.2026): Model-agnostic Provider Routing — `openai>=1.50.0` hinzugefügt; `_stream_anthropic` + `_stream_openai` als separate Generatoren; `AGENT_PROVIDER` env var (anthropic|openai|openai-compatible); `AGENT_MODEL` ersetzt `ANTHROPIC_MODEL`; `python-agent/pyproject.toml` als Modul-Deklaration angelegt; `uv sync` → openai==2.28.0 installiert
> - Rev. 3 (17.03.2026): Phase 22d Frontend-Migration — `ai@6.0.116` + `@ai-sdk/react@3.0.118` installiert; BFF auf UIMessage-Stream-Protokoll umgestellt (SSE-Proxy + error→errorText Rewrite + `x-vercel-ai-ui-message-stream: v1`); `useChatSession.ts` auf `useChat` + `DefaultChatTransport` + `prepareSendMessagesRequest` umgebaut; `AgentChatMessage.tsx` auf `UIMessage`-Parts (text/reasoning/dynamic-tool); `AgentChatToolBlock.tsx` auf `DynamicToolUIPart` (7 States); `AgentChatThread.tsx` + `AgentChatPanel.tsx` aktualisiert; `types.ts` bereinigt (ChatBlock/SseEvent entfernt); Biome 0 Fehler; tsc 0 Fehler in agent-chat Files
> - Rev. 6 (17.03.2026): Fehlende Backend-Contracts dokumentiert (ACR-G5 messageMetadata, ACR-G6 approve-Endpoint, ACR-G7 threadId-Return); Verify-Gates ACR.V10-V13 ergaenzt; CHECKPOINT als RESOLVED markiert
> - Rev. 7 (18.03.2026): Phase 22g — LLM-agnostischer Loop-Neubau (ABP.1-ABP.3 code-complete); python-agent standalone venv; AC-P1b Update; neue Verify-Gates ACR.V14-V17
> - Rev. 5 (17.03.2026): Phase 22f Multimodal + ReasoningEffort (AC56/AC108 Backend) — `ImageAttachment` Pydantic model; `_build_user_content()` (Anthropic image-blocks + OpenAI `image_url` data-URI); `_REASONING_BUDGET` map + `thinking` param in `_stream_anthropic`; Go `agentAttachment` struct + `Attachments`/`ReasoningEffort` in `agentChatRequestBody`; BFF Zod `attachmentSchema` + `reasoningEffort` enum; `go build ./...` 0 Fehler, Biome 0 Fehler
> - Rev. 4 (17.03.2026): Phase 22f Audio-Backend (ACR-A1/A2/A5/A6) + AC107 Model-Override — `model` Feld in `agentChatRequestBody` (Go) + `AgentChatRequest` (Python); `_stream_anthropic`/`_stream_openai` nutzen `req.model or AGENT_MODEL`; `POST /api/v1/audio/transcribe` + `POST /api/v1/audio/synthesize` in `python-agent/agent/app.py` (base64-audio→Whisper, text→TTS, OpenAI-SDK-kompatibel, Provider via `AGENT_STT_PROVIDER`/`AGENT_TTS_PROVIDER`); `go-backend/internal/handlers/http/agent_audio_handler.go` NEU (`AgentAudioTranscribeHandler`/`AgentAudioSynthesizeHandler` via `agentAudioProxyHandler`, 25MB Limit, JSON-Validation); `wiring.go` +2 Routen; `.env.example`+`.env.development` erweitert; `go build ./...` 0 Fehler, Biome 0 Fehler

---

## 0. Execution Contract

### Scope In
- Python agent-service: Anthropic SSE streaming endpoint (AC7)
- Go Gateway: /api/v1/agent/chat SSE proxy + Vercel AI Data Stream Protocol (AC6, AC79)
- Python domain migration: memory-service + agent-service → python-agent/
- Go memory endpoints: URL repoint nach python-agent
- dev-stack.ps1: Startpfade aktualisieren

### Scope Out
- Frontend useChat Migration (→ agent_chat_ui_delta.md Sektion R)
- Agent Loop Orchestrierung / Pause-Resume (→ agent_backend_program_delta.md)
- Tool Policy / Approval Flow (→ agent_backend_program_delta.md ABP.2/ABP.3)
- Thread Persistenz via AgentEpisode (AC-T1 — deferred bis 22d Frontend-Backend Integration)

### Cross-References
- AC6/AC7 aus `agent_chat_ui_delta.md` sind hier impl-owned
- AC79 (Go Protocol Header) ebenfalls hier
- ABP.1–ABP.5 (Governance Contracts) sind Design-Constraints fuer diesen Slice

---

## 1. Python Domain Migration

- [x] **AC-M1** `python-backend/python-agent/memory/app.py` — memory-service migriert; Port 8093; KG + Vector + Episodic; `parents[3]` statt `parents[2]` fuer PYTHON_BACKEND_ROOT
- [x] **AC-M2** `python-backend/python-agent/agent/app.py` — agent-service migriert; Port 8094; Context assembly + Tools + NEU: /api/v1/agent/chat
- [x] **AC-M3** `scripts/dev-stack.ps1` — WorkingDir von `services\memory-service` → `python-agent\memory` und `services\agent-service` → `python-agent\agent`
- [ ] **AC-M4** Ursprüngliche Services in `services/` bleiben als Fallback bis Migration verifiziert

---

## 2. Python Agent Chat Endpoint (AC7)

- [x] **AC-P1** LLM SDKs in `python-backend/pyproject.toml` — `anthropic>=0.40.0` + `openai>=1.50.0`; `uv sync` → openai==2.28.0 installiert
  - **Update (18.03.2026):** anthropic + openai + kuzu + chromadb + sentence-transformers + psycopg + OTel-anthropic aus python-backend ENTFERNT → in python-agent/pyproject.toml verschoben
- [x] **AC-P1b** `python-backend/python-agent/pyproject.toml` — **Standalone-venv (18.03.2026)**
  - Alle agent-/memory-service Dependencies direkt deklariert (anthropic, openai, kuzu, chromadb, sentence-transformers, psycopg, OTel)
  - Eigenes `.venv`: `cd python-backend/python-agent && uv sync`
  - Shared code (ml_ai/, services/_shared) via `sys.path.insert` aus python-backend/ geladen — kein pip-Install noetig
- [x] **AC-P2** `POST /api/v1/agent/chat` SSE Endpoint in `python-agent/agent/app.py`
  - Request: `{message, threadId?, agentId?, context?, model?, attachments?, reasoningEffort?}`
  - AC56: `ImageAttachment` model; `_build_user_content()` baut Anthropic image-blocks + OpenAI `image_url` data-URI
  - AC108: `_REASONING_BUDGET` map; `thinking: {type:"enabled", budget_tokens:N}` an Anthropic stream_kwargs wenn `reasoningEffort` gesetzt
  - System prompt: Rolle + `no_trading_actions` Policy + context-Injection (`_build_system_prompt`)
  - **Model-agnostisch**: `AGENT_PROVIDER=anthropic|openai|openai-compatible` (default: `anthropic`)
  - `AGENT_MODEL` env var (default: `claude-sonnet-4-6` für Anthropic, `gpt-4o` für OpenAI)
  - `OPENAI_BASE_URL` override für Ollama/vLLM/OpenRouter/Azure
  - `_stream_anthropic()` / `_stream_openai()` als separate async Generatoren
  - Response: `StreamingResponse(text/event-stream)`
- [x] **AC-P3** Vercel AI Data Stream Protocol Events (Python emittiert):
  - `{"type":"text-start","id":"t1"}` bei Start
  - `{"type":"text-delta","id":"t1","delta":"..."}` pro Chunk
  - `{"type":"text-end","id":"t1"}` bei Abschluss Text
  - `{"type":"finish","finishReason":"stop","usage":{...}}`
  - `{"type":"error","error":"..."}` bei Fehler
- [x] **AC-P4** Context-Injection: `context` String als letztes System-Prompt Segment wenn vorhanden
- [x] **AC-P5** Error Handling: `anthropic.APIError` + allgemeine Exceptions → Error-Event
- [x] **AC-P6** `ANTHROPIC_API_KEY` aus Environment; KeyError → sofortiger Error-Event

---

## 3. Go Gateway Chat Endpoint (AC6 + AC79)

- [x] **AC-G1** `go-backend/internal/handlers/http/agent_chat_handler.go` — neuer Handler
  - `POST /api/v1/agent/chat` empfangen
  - Auth-Header aus Context forwarden (`x-auth-user-id`, `x-auth-user-role`, etc.)
  - Request an Python agent-service `/api/v1/agent/chat` proxyen
  - SSE Response direkt streamen (kein Buffering)
  - AC56: `agentAttachment` struct + `Attachments []agentAttachment` in `agentChatRequestBody`
  - AC108: `ReasoningEffort *string` in `agentChatRequestBody`
- [x] **AC-G2** Vercel AI Data Stream Protocol Header:
  - `x-vercel-ai-ui-message-stream: v1`
  - `Content-Type: text/event-stream`
  - `Cache-Control: no-cache`
  - `Connection: keep-alive`
  - `X-Accel-Buffering: no` (Nginx/Proxy Anti-Buffering)
- [x] **AC-G3** Go wiring.go: Route `POST /api/v1/agent/chat` registriert
- [x] **AC-G4** Fehler wenn Python agent-service nicht erreichbar: HTTP 502 + JSON error body (kein panic)

---

## 4. Verify-Gates

### Code-Complete (ohne Stack)
- [x] **ACR.V1** `go build ./...` in go-backend: 0 Fehler
- [ ] **ACR.V2** Python: `python -c "import python-agent/agent/app"` importiert fehlerfrei (mit korrektem PYTHONPATH)
- [x] **ACR.V3** `x-vercel-ai-ui-message-stream: v1` Header korrekt in BFF Response gesetzt
- [x] **ACR.V4** Error-Pfad in Python → BFF rewritet `error` → `errorText` für ai v6 DefaultChatTransport
- [x] **ACR.V5f** `bun run lint` 0 Fehler (agent-chat Files sauber)
- [x] **ACR.V6f** `bunx tsc --noEmit` 0 Fehler in agent-chat Files; pre-existing Fehler in `admin/users/route.ts`, `passkeys.ts`, `merge-sqlite.ts` → **CHECKPOINT RESOLVED** (17.03.2026)

> **✅ CHECKPOINT RESOLVED (17.03.2026) — Alle 3 pre-existing tsc Fehler behoben:**
> - `src/app/api/admin/users/route.ts:65,108` — `?? ""` Fallback ergaenzt (HeadersInit string | undefined → string). ✓
> - `src/lib/server/passkeys.ts:576,577` — `?? null` / `?? "viewer"` Fallback ergaenzt. ✓
> - `scripts/merge-frontend-sqlite-into-backend-sqlite.ts` — `"scripts"` zu `exclude` in `tsconfig.json` hinzugefuegt (bun:sqlite ist kein tsc-Modul). ✓
> - Zusaetzlich: `tsconfig.json` auf Next.js-16-SOTA aktualisiert (ES2022, tsBuildInfoFile, redundantes noImplicitAny entfernt). ✓
> - `src/features/trading/components/IndicatorAiTooltip.tsx` — Import `"ai/react"` → `"@ai-sdk/react"` behoben. ✓
> **Ergebnis: `bunx tsc --noEmit` 0 Fehler gesamt.**

### Live-Verify (Stack nötig)
- [ ] **ACR.V5** POST /api/v1/agent/chat über Go Gateway → chunks sichtbar in curl SSE output
- [ ] **ACR.V6** ANTHROPIC_API_KEY missing → sofortige Error-Event Response (kein 500 crash)
- [ ] **ACR.V7** Langer Stream (>10 chunks) kommt vollständig durch ohne Truncation
- [ ] **ACR.V8** Memory-service auf port 8093 erreichbar nach python-agent Migration
- [ ] **ACR.V9** Agent-service auf port 8094 erreichbar nach python-agent Migration

### Verify-Gates — Fehlende Backend Contracts (Rev. 6)
- [ ] **ACR.V10** messageMetadata-Event: Python emittiert `{"type":"message-metadata","metadata":{"promptTokens":N,"completionTokens":N,"threadId":"..."}}` vor `finish`; Go leitet transparent durch; Frontend liest in `onFinish` via `message.metadata` — Code-Complete, Live-Verify offen
- [ ] **ACR.V11** POST `/api/v1/agent/approve`: Go-Endpoint nimmt `{ toolCallId, decision: "approve"|"deny", threadId }` entgegen; validiert Felder; liefert HTTP 200 + `{"ok":true}` — Code-Complete, Live-Verify offen
- [ ] **ACR.V12** threadId-Return: Python emittiert `{"type":"thread-id","threadId":"..."}` als erstes SSE-Event + in message-metadata; Frontend `onFinish` setzt `threadIdRef.current` — Code-Complete, Live-Verify offen
- [ ] **ACR.V13** Token-Badge im Frontend zeigt echte Werte (nicht 0/0) — Live-Verify ausstehend (Stack nötig)

---

## 5. Propagation Targets

- `docs/specs/execution/agent_chat_ui_delta.md` (AC6/AC7/AC79 als "impl in agent_chat_runtime_delta.md" vermerken)
- `docs/specs/execution/agent_backend_program_delta.md` (ABP.1-ABP.5 als Constraints hier referenced)
- `scripts/dev-stack.ps1`

---

## 6. Audio Backend — STT / TTS / Voice Pipeline

> **Frontend-Ref:** `agent_chat_ui_delta.md` Sektion U (AC47b–AC49c)
> **Architektur-Ref:** `docs/frontend_chat_ui.md` Sektion 19

### 6.1 Architektur-Entscheid: Sandwich via AI SDK

Python agent-service bleibt LLM-Orchestrator. Audio-Handling:
- STT: `transcribe()` via AI SDK Core (Frontend → BFF → STT-Provider ODER self-hosted)
- TTS: `generateSpeech()` via AI SDK Core (LLM-Antwort → TTS-Provider ODER self-hosted)
- Provider-Routing: `AGENT_STT_PROVIDER` + `AGENT_TTS_PROVIDER` in `.env`

### 6.2 STT — Paid Provider Optionen

| Provider | Package | Feature | Preis |
|---|---|---|---|
| OpenAI Whisper API | `@ai-sdk/openai` | Batch + near-realtime, 99 Sprachen | $0.006/min |
| Deepgram Nova-3 | `@ai-sdk/deepgram` | Streaming + Speaker Diarization | $0.0043/min |
| AssemblyAI | `@ai-sdk/assemblyai` | Streaming + Diarization (Earnings-Calls) | $0.012/min |
| ElevenLabs | `@ai-sdk/elevenlabs` | Auch TTS, hohe Qualitaet | variabel |

### 6.3 STT — Self-Hosted / Open-Source (kein Vendor-Lock)

**WhisperLiveKit** — SOTA fuer self-hosted Streaming STT (Stand 2026):
- `github.com/QuentinFuxa/WhisperLiveKit` v0.1.13 (unstable — monitor)
- SimulStreaming + AlignAtt Policy (schneller + besser als aelteres WhisperStreaming)
- Backend-Auto-Selection: MLX (macOS) → Faster-Whisper → vanilla Whisper
- **Silero VAD v6** integriert (CPU-only, verhindert Inference auf Stille)
- Exposes: OpenAI-kompatibles REST + Deepgram WebSocket + native WebSocket
- Speaker Diarization unterstuetzt

**Integration in python-agent:**
- WhisperLiveKit laeuft als separater Service (Port 8095)
- `python-agent/agent/app.py` erhaelt neuen STT-Proxy-Endpoint: `POST /api/v1/audio/transcribe`
- Frontend ruft via BFF → Go Gateway → python-agent (gleicher Auth-Pfad)
- Fallback: OpenAI Whisper API wenn self-hosted nicht erreichbar

**STT-Modelle (self-hosted):**
| Modell | Params | Streaming | RTFx | Sprachen |
|---|---|---|---|---|
| Whisper Large v3 (via Faster-Whisper) | 1.55B | Via SimulStreaming | 4x schneller | 99+ |
| NVIDIA Parakeet TDT 1.1B | 1.1B | Nativ (RNN-T) | ~2000x | EN only |
| NVIDIA Canary Qwen 2.5B | 2.5B | Near-realtime | Fast | Multilingual |

### 6.4 TTS — Paid Provider Optionen

| Provider | Package | Qualitaet | Streaming | Preis |
|---|---|---|---|---|
| ElevenLabs | `@ai-sdk/elevenlabs` | Beste | Ja (PCM) | $0.30/1k chars |
| OpenAI TTS | `@ai-sdk/openai` | Sehr gut | Ja | $0.015/1k chars |
| Cartesia | `@ai-sdk/cartesia` | Gut, low-latency | Ja | $0.065/1k chars |
| Deepgram Aura | `@ai-sdk/deepgram` | Gut | Ja | $0.0135/1k chars |

### 6.5 TTS — Self-Hosted / Open-Source

**Kokoro** — SOTA OSS TTS (Stand 2026):
- 82M Parameter, Apache 2.0 Lizenz
- 96x realtime Speed (GPU), OpenAI-API-kompatibel
- Self-hosted via `github.com/eduardolat/kokoro-web`
- Drop-in fuer OpenAI TTS: nur Base-URL wechseln, kein Code-Change

| Modell | Qualitaet | Speed | Streaming | Lizenz |
|---|---|---|---|---|
| **Kokoro** | Near-commercial | 96x RT (GPU) | Ja (PCM chunks) | Apache 2.0 |
| F5-TTS | Hoch (Zero-shot Cloning) | 7x RT (33x Fast) | Ja | MIT |
| Piper | Gut | Sehr schnell (RPi4) | Ja | MIT |

### 6.6 Full Voice Pipeline — LiveKit Agents (vendor-agnostisch)

Fuer bidirektionale Voice-Sessions (z.B. Earnings-Call Live-Analyse):
- `github.com/livekit/agents` — Python SDK, fully vendor-agnostic
- Any STT + Any LLM + Any TTS kombinierbar
- Silero VAD als first-class Plugin (`livekit.plugins.silero`)
- Full local reference: `github.com/ShayneP/local-voice-ai`

**Integration-Plan:**
- LiveKit Agent als separater Python-Service (Port 8096)
- Go Gateway erhaelt neuen Route: `POST /api/v1/audio/session/start`
- WebSocket-Verbindung Browser ↔ LiveKit ↔ python-agent

### 6.7 Audio-Backend ACs

- [x] **ACR-A1** `python-agent/agent/app.py` — `POST /api/v1/audio/transcribe`; nimmt `audio_base64`+`mime_type`+`language?`; routet via `AGENT_STT_PROVIDER` (openai|whisper-local); temp-file + `client.audio.transcriptions.create(model="whisper-1")`; cleanup in finally
- [x] **ACR-A2** Go Gateway: `POST /api/v1/audio/transcribe` → `AgentAudioTranscribeHandler`; Auth-Forwarding + 25MB Limit + JSON-Validation; in `wiring.go` registriert
- [ ] **ACR-A3** WhisperLiveKit Service in `python-agent/` integrieren (Port 8095); `dev-stack.ps1` Eintrag
- [ ] **ACR-A4** Kokoro TTS Service als separater Docker-Container; Port 8097; OpenAI-kompatibles API
- [x] **ACR-A5** `python-agent/agent/app.py` — `POST /api/v1/audio/synthesize`; nimmt `text`+`voice`+`model?`; routet via `AGENT_TTS_PROVIDER` (openai|kokoro); `AGENT_TTS_BASE_URL` fuer Kokoro/self-hosted; gibt `audio/mpeg` bytes zurueck
- [x] **ACR-A6** Go Gateway: `POST /api/v1/audio/synthesize` → `AgentAudioSynthesizeHandler`; gleicher `agentAudioProxyHandler`; Content-Type+Content-Disposition Forwarding; in `wiring.go` registriert
- [ ] **ACR-A7** Fallback-Policy: self-hosted nicht erreichbar → paid Provider (OpenAI/Deepgram)
- [ ] **ACR-A8** LiveKit Agents Service (Port 8096) — Evaluation + Scaffold fuer bidirektionale Voice-Sessions

### 6.8 Audio-Backend Verify-Gates

- [ ] **ACR.VA1** `POST /api/v1/audio/transcribe` mit WAV-File → Transkript JSON Response
- [ ] **ACR.VA2** `AGENT_STT_PROVIDER=whisper-local` → WhisperLiveKit; `=openai` → OpenAI Whisper API
- [ ] **ACR.VA3** `POST /api/v1/audio/synthesize` mit Text → Audio-Buffer (mp3/pcm) Response
- [ ] **ACR.VA4** Kokoro TTS via OpenAI-kompatibles API erreichbar auf Port 8097
- [ ] **ACR.VA5** Fallback: WhisperLiveKit down → transparent fallback auf OpenAI Whisper (kein 500)

---

## 8. Fehlende Backend Contracts (Rev. 6)

> **Status:** OFFEN — diese Contracts sind fuer vollstaendige Phase-22f/22g-Funktionalitaet erforderlich.
> **Prioritaet:** ACR-G5 (Token-Badge) + ACR-G6 (Tool-Approval) + ACR-G7 (threadId) sind Frontend-blockierend.

### ACR-G5 — messageMetadata Forwarding (Token Usage)

**Problem:** `onFinish` im Vercel AI SDK v6 liefert kein `usage`-Objekt mehr. Usage kommt aus `message.metadata`.
**Contract:** Go Gateway muss am Ende des Streams ein SSE-Event emittieren:
```
data: {"type":"message-metadata","metadata":{"promptTokens":1234,"completionTokens":567}}
```
Python agent-service muss `usage`-Daten aus Anthropic/OpenAI Response lesen und an Go weiterleiten.
**Frontend-Binding:** `useChatSession.ts` `onFinish` liest `message.metadata.promptTokens/completionTokens` (bereits implementiert — wartet auf Backend).
**Dateien:** `python-agent/agent/app.py` (`_stream_anthropic`/`_stream_openai`), `go-backend/internal/handlers/http/agent_chat_handler.go`
- [x] **ACR-G5** Python: `usage`-Objekt aus LLM-Response extrahieren + als letztes SSE-Event `{"type":"message-metadata","metadata":{...}}` senden — implementiert in `_stream_anthropic` + `_stream_openai`
- [x] **ACR-G5b** Go: `message-metadata`-Event transparent durchleiten (kein Strip) — Go streamt blind durch, kein Parsing nötig

### ACR-G6 — POST /api/v1/agent/approve Endpoint

**Problem:** Frontend sendet `POST /api/agent/approve` → BFF → Go `/api/v1/agent/approve`. Go-Endpoint fehlt.
**Contract:**
```
POST /api/v1/agent/approve
Body: { "toolCallId": "...", "decision": "approve"|"deny", "threadId": "..." }
Response 200: { "ok": true }
Response 404: { "error": "thread not found" }
```
**Dateien:** `go-backend/internal/handlers/http/agent_chat_handler.go`, `go-backend/internal/app/wiring.go`
**BFF:** `src/app/api/agent/approve/route.ts` (bereits implementiert als Proxy zu Go)
- [x] **ACR-G6** Go: `AgentApproveHandler` registriert auf `POST /api/v1/agent/approve`; nimmt `{toolCallId, decision, threadId}` entgegen; validiert Felder; gibt `{"ok":true}` zurück — Stub-Impl (Phase 22g: async channel dispatch)

### ACR-G7 — threadId Return Mechanism

**Problem:** Frontend initialisiert `threadIdRef.current` aus URL oder lokaler ID. Go/Python muessen dieselbe threadId bestaetigen oder eine neue zuweisen.
**Contract:** Go emittiert als erstes SSE-Event:
```
data: {"type":"thread-id","threadId":"<server-assigned-id>"}
```
Frontend überschreibt `threadIdRef.current` mit dem Server-Wert.
**Dateien:** `go-backend/internal/handlers/http/agent_chat_handler.go`
- [x] **ACR-G7** Python: `thread_id = req.threadId or uuid.uuid4()`; als erstes SSE-Event `{"type":"thread-id","threadId":"..."}` + in `message-metadata` wiederholt — Go leitet transparent durch
- [x] **ACR-G7b** Frontend: `useChatSession.ts` `onFinish` liest `meta?.threadId` aus `message.metadata` und setzt `threadIdRef.current` — Folge-Requests tragen dieselbe threadId

---

## 9. Phase 22g — LLM-agnostischer Agent Loop (18.03.2026)

> **Status:** CODE-COMPLETE — Live-Verify Gate offen (Sprint 3)
> **Ref:** `agent_backend_program_delta.md` ABP.1–ABP.3

### 9.1 Neue Dateien in `python-backend/python-agent/agent/`

- [x] **ACR-22g-1** `errors.py` — `RepairableError / CriticalError / ToolValidationError / CapabilityViolation / MaxIterationsExceeded`
- [x] **ACR-22g-2** `context.py` — `AgentExecutionContext` (frozen dataclass) + `CapabilityEnvelope` + `ADVISORY_ENVELOPE`; `tool_definitions()` + `find_tool()` Helpers
- [x] **ACR-22g-3** `streaming.py` — Typsichere SSE-Packets: `ThreadIdPacket / TextStartPacket / TextDeltaPacket / TextEndPacket / ToolStartPacket / ToolResultPacket / ToolErrorPacket / ApprovalRequestPacket / MessageMetaPacket / FinishPacket / ErrorPacket`; `sse()` Helper
- [x] **ACR-22g-4** `extensions.py` — `ExtensionRegistry` Singleton: Hooks `on_stream_chunk / on_tool_before / on_tool_after / on_response_end`
- [x] **ACR-22g-5** `loop.py` — `run_agent_loop()` LLM-agnostisch:
  - `_loop_anthropic()`: raw Anthropic SDK, extended thinking (AC108), tool-call loop bis `end_turn` oder `MAX_ITERATIONS=10`
  - `_loop_openai()`: OpenAI SDK, Tool-Definitions als OpenAI-Functions; deckt OpenAI, OpenRouter, Ollama, vLLM, Azure
  - `_execute_tools_parallel()`: asyncio.gather — alle Tool-Calls gleichzeitig
  - `_anthropic_tools_to_openai()`: automatische Format-Konvertierung

### 9.2 Tool-Framework

- [x] **ACR-22g-6** `tools/base.py` — `TradingTool` ABC: `name / definition() / validate() / execute()`
- [x] **ACR-22g-7** `tools/registry.py` — `ToolRegistry.load()`: 6 Standard-Tools registriert
- [x] **ACR-22g-8** `tools/chart_state.py` — `GetChartStateTool` + `SetChartStateTool` (migrated + validate-Logik)
- [x] **ACR-22g-9** `tools/portfolio.py` — `GetPortfolioSummaryTool`
- [x] **ACR-22g-10** `tools/geomap.py` — `GetGeomapFocusTool`
- [x] **ACR-22g-11** `tools/memory_tool.py` — `SaveMemoryTool` + `LoadMemoryTool` (NEU)
- [x] **ACR-22g-12** `validators/trading.py` — `validate_tool_call()` + `needs_approval()`

### 9.3 app.py Refactoring

- [x] **ACR-22g-13** `/api/v1/agent/chat` → `_stream_agent_loop()` → `run_agent_loop()` fuer alle Provider
  - `AGENT_PROVIDER=anthropic` (default) | `openai` | `openai-compatible`
  - `OPENAI_BASE_URL` fuer Ollama (`http://localhost:11434/v1`) / OpenRouter / vLLM
  - Fallback default model: `claude-sonnet-4-6` (anthropic), `gpt-4o` (openai/openai-compatible)
  - Architektur-Note: Go Gateway ist Control-Backend; LiteLLM-Routing (future) laeuft durch Go, nicht direkt in Python

### 9.4 Verify-Gates (Phase 22g)

- [ ] **ACR.V14-LV** — `run_agent_loop` durchlaeuft Tool-Call-Zyklus: `get_portfolio_summary` aufgerufen → `ToolStartPacket` + `ToolResultPacket` sichtbar in curl SSE
- [ ] **ACR.V15-LV** — `save_memory` + `load_memory` Tool-Zyklus: Agent speichert Notiz → liest sie im naechsten Turn
- [ ] **ACR.V16-LV** — `AGENT_PROVIDER=openai-compatible` + Ollama (`http://localhost:11434/v1`) → Antwort streamt; Tool-Definitions als OpenAI-Functions korrekt
- [ ] **ACR.V17-LV** — `python-agent` standalone venv (`uv sync` in `python-backend/python-agent/`) startet Port 8094 ohne python-backend venv aktiv

---

## 7. Video Processing — Future Placeholder

> **Status:** Deferred — kein Frontend-Impl jetzt.
> **Frontend-Ref:** `agent_chat_ui_delta.md` Sektion V (Video-Note)

- Kein LLM-Provider unterstuetzt echten Video-Stream nativ (Stand Maerz 2026).
- Backend-Pfad wenn benoetigt: Frame-Extraction (ffmpeg) → Frames als Image-Array → Vision-Pipeline.
- Separates Modul geplant: `python-agent/agent/video_processor.py`.
- Estimation: 1 Frame/sec bei Earnings-Call-Video → ~60 Frames/min → Vision-Pipeline.
- **Kein AC jetzt — Slot reserviert fuer spaeteren Slice.**

