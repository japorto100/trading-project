# Frontend Chat UI Blueprint
#
# TradeView Fusion - Full Agent Chat UI Blueprint
# (Perplexica + AgentZero + Tambo informed)
#
# Stand: 13 Mar 2026 (Mission Control + Onyx + Deepdive-Hardening eingearbeitet)

## 1) Purpose

Dieses Dokument definiert die konkrete Frontend-UI-Architektur fuer den Agent Chat in `tradeview-fusion` auf Basis von:

- lokal geklonten Referenzprojekten in `_tmp_ref_review`
- existierendem Project-Scaffold in `src/features/agent-chat`
- bestehendem Next.js SSE/BFF Muster und Go-Streaming-Backend
- Python memory-service als Agent-Laufzeit

Ziel: kein Minimal-Chat, sondern ein vollwertiger Chat-Workspace mit Streaming, Tool-Events, Thread-Persistenz, Reconnect und strukturierten UI-Bloecken.

---

## 2) Source Inputs (lokal)

### 2.1 Unser Projekt

- Chat-Scaffold: `src/features/agent-chat/AgentChatPanel.tsx`, `src/features/agent-chat/types.ts`
- Chat-Slice: `docs/specs/execution/agent_chat_ui_delta.md`
- SSE/BFF Muster: `src/app/api/market/stream/route.ts`
- Episodic Persistenz: `src/lib/server/memory-episodic-store.ts`
- Frontend Referenzen: `docs/FRONTEND_COMPONENTS.md`
- Error/Observability Normen: `docs/specs/ERRORS.md`
- Architektur-/Security-Leitplanken (Root-MDs):
  - `docs/FRONTEND_ENHANCEMENT.md`
  - `docs/AGENT_SECURITY.md`
  - `docs/AGENT_HARNESS.md`
  - `docs/AGENT_ARCHITECTURE.md`
  - `docs/AGENT_TOOLS.md`
  - `docs/GO_GATEWAY.md`
  - `docs/MEMORY_ARCHITECTURE.md`
  - `docs/CONTEXT_ENGINEERING.md`
  - `docs/AGENTS_BACKEND.md` (plattformweites Agent-Backend-Programm; relevant fuer Backend-Einordnung externer Referenzen)

### 2.2 Referenz-Repos (in `_tmp_ref_review`)

- `agentzero-complete`
- `perplexica`
- `tambo`
- `onyx`

### 2.3 Wichtige Root-MD Constraints (zusammengezogen)

- `GO_GATEWAY.md`: Browser-Default bleibt `REST + SSE` (stream-first, REST-fallback), Gateway ist Single Entry Point.
- `AGENT_SECURITY.md`: keine direkten mutierenden Agent-UI-Pfade; Tool-/Storage-Writes nur policy-gated ueber Backend.
- `FRONTEND_ENHANCEMENT.md`: event-starke UIs brauchen explizite Execution-Policies (Debounce/Throttle/Batch-Queue/Abort-Retry).
- `AGENT_HARNESS.md`: Agenten bleiben untrusted orchestrators; Runtime-Governance und Audit sind Pflicht.
- `AGENT_ARCHITECTURE.md`: Agent Playground / Monitor sind read-only/bounded; `no_trading_actions` bleibt harte Regel.
- `AGENT_TOOLS.md`: Agentische UI-Surfaces bleiben assistiv/read-only oder bounded-write; keine stillen Side Effects.
- `MEMORY_ARCHITECTURE.md` + `CONTEXT_ENGINEERING.md`: Context Assembly nur aus normalisierten Artefakten, klare Degradation-Flags bei fehlenden Schichten.

---

## 3) Was wir aus welchem Blueprint uebernehmen

### 3.1 Perplexica (Primary UI Flow Blueprint)

Uebernehmen:

1. strukturierter Stream statt nur plain text
2. block-orientierte Antwortdarstellung (`block` + `updateBlock`)
3. reconnect/continue-Pfade fuer unterbrochene Antworten
4. message/block state machine in Hook

Nicht uebernehmen:

- provider-/search-spezifische Vane/Perplexica business logic
- deren gesamtes settings/provider management

Warum: passt direkt auf euren geplanten `AgentChatPanel` mit Tool-Events und SSE.

### 3.2 AgentZero (Secondary Runtime UX/Resilience Blueprint)

Uebernehmen:

1. queueing/busy-zustand pattern fuer input
2. connectivity + fallback sync Ideen
3. tool-/message-orientierte UI stores als inspiration fuer modulare panels

Nicht uebernehmen:

- komplette AgentZero WebUI Architektur 1:1
- legacy/global script patterns

Warum: gute Robustheitspatterns, aber stark projektspezifische UI-Historie.

### 3.3 Tambo (Optional Rich Generative UI Layer)

Uebernehmen (optional, Phase 2):

1. component registry + schema-driven rendering fuer tool outputs
2. interaktive/persistente komponenten fuer agent result cards
3. hooks fuer thread/stream/component-state nur falls eigener Ansatz zu teuer wird

Nicht uebernehmen:

- kompletter Backend-Betrieb von Tambo als Pflicht
- full migration eures Transportlayers auf Tambo

Warum: stark fuer "agent speaks UI". Sollte auf euren bestehenden Transport/Policy-Rails aufsetzen, nicht umgekehrt.

Backend-Relevanz-Hinweis:

- Falls Tambo-Muster backendseitig genutzt werden (component/event contracts, thread protocol framing), erfolgt die Einordnung ueber `docs/AGENTS_BACKEND.md` und die dort zugeordneten Execution-Slices; kein impliziter Wechsel des Transport- oder Orchestrator-Owners.

### 3.4 Weitere Referenzen aus FRONTEND_COMPONENTS.md (adjazent)

Die folgenden Referenzen bleiben wichtig, aber **nicht** primaer fuer den Chat-Core:

- `Mission Control`: Operations-/Control-Room-Patterns fuer Agent-Monitoring.
- `GitNexus Web`: Graph-Exploration-Patterns fuer KG-/Memory-Surfaces.
- `Paperless-ngx`: Document-/Source-Review-Patterns fuer Research-Sidepanels.

Diese drei beeinflussen eher Right-Panels und Analyst-Surfaces als den zentralen
Message-Stream.

### 3.5 Mission Control (Add-on, nicht Chat-Core)

Wichtig: `mission-control` ist **kein Ersatz** fuer Perplexica/AgentZero als Chat-Core-Blueprint.
Der Mehrwert liegt in Ops-/Runtime-nahen Erweiterungen.

Uebernehmen (additiv):

1. session-zentrierte Conversation-Modelle (`session:*`) fuer lokale + gateway Runtimes
2. hybrider Realtime-Betrieb (`SSE first`, polling als fallback/pause when connected)
3. robustes optimistic message lifecycle (temp ids, replace/update/remove, failed+retry)
4. inline Runtime-Signale im Chat (z. B. compaction/fallback toasts)
5. collapsible tool-call rows mit status/args/output/duration fuer Operator-Workflows

Nicht uebernehmen:

- Mission-Control-spezifische Dashboard-/Ops-Oberflaechen als Chat-Pflicht
- Session-/Provider-Sonderfaelle, die nicht zum TradeView Chat-Produkt passen

### 3.6 Onyx (Add-on, Chat-Robustheit + Session-Disziplin)

Wichtig: `onyx` wird als Chat-Engineering-Referenz genutzt, nicht als Plattform-
Blueprint fuer Connector-/Enterprise-Features.

Uebernehmen (additiv):

1. packet-typisiertes Streaming-Modell mit klarer Ereignisklassifikation
2. placement-orientierte Event-Reihenfolge (`turn_index`, optional `tab_index`) fuer stabile Tool-/Parallel-Darstellung
3. message-tree + branch/switch pattern fuer regenerate/fork flows
4. session-isolierter Store-Ansatz (pro Session ChatState/Error/Abort-Controller)
5. stabiler Scroll-Container mit auto-follow nur bei "at bottom"
6. toolbar action contract (copy/feedback/regenerate/sources) zustandsabhaengig

Nicht uebernehmen:

- Onyx-spezifische Plattformbereiche (Connectors, Deep-Research, umfangreiche Admin-Flows)
- komplette Packet-Taxonomie 1:1 (fuer TradeView nur noetige Teilmenge)

---

## 4) Zielarchitektur (Next <-> Go <-> Python)

User
-> Next `AgentChatPanel` (Client)
-> Next BFF `/api/agent/chat` (SSE proxy/adapter)
-> Go Gateway `/agent/chat` (orchestrator + provider routing + auth context)
-> Python memory-service (agent loop, memory, tools)
-> LLM Provider (Anthropic/Ollama/vLLM)

Rueckweg:
LLM/tool events -> Python -> Go -> Next BFF (SSE) -> React Chat State

### Verantwortlichkeiten

- Next UI/BFF
  - UI rendering, local UX state, reconnect triggers
  - normalized SSE event contract fuer Frontend
- Go
  - correlation id, auth headers, provider routing, gateway policy
  - canonical stream orchestration
- Python
  - agent behavior, tool execution, memory integration
  - structured tool events + final assistant outputs

---

## 5) Event Contract (UI-nah, stabil)

Baseline aus Slice behalten:

- `chunk`
- `done`
- `tool`
- `error`

Erweiterung (empfohlen fuer Full UI):

- `block` (new render block)
- `updateBlock` (partial update)
- `stream_status` (live/degraded/recovered)
- `heartbeat` (optional)

### Block Types (empfohlen)

- `text`
- `tool_call`
- `tool_result`
- `citation_list`
- `warning`
- `suggestion`
- `widget` (phase 2, tambo-inspired)

---

## 6) Full Chat UI Surface (nicht minimal)

### 6.1 Hauptkomponenten

- `AgentChatPanel` (container + layout)
- `AgentChatThread` (message groups)
- `AgentChatComposer` (input, attach, send, queue)
- `AgentChatToolbar` (model/profile/context controls)
- `AgentChatEventRail` (stream status, latency, provider badge)
- `AgentChatToolEvents` (collapsible tool timeline)
- `AgentChatRightPanel` (thread list / context / debug tabs)
- `AgentChatReconnectBanner` (transport state + retry)

### 6.2 Message/Block Rendering

Pro assistant message:

- header (agent/model/time)
- progressive block render
- citations/actions footer
- tool blocks collapsible by default (expand on demand)

### 6.3 Thread Management

- thread list in sidebar
- restore on reload via `AgentEpisode`
- manual retry / fork thread / regenerate last answer

### 6.4 Error UX

- hard errors -> message bubble + retry action
- degraded stream -> top banner + automatic backoff
- kein full-page crash fuer stream errors

---

## 7) Data/State Strategy

### 7.1 React Query + local reducer hybrid

- React Query fuer server state caches (thread list, persisted messages)
- local reducer/store fuer in-flight stream assembly
- optimistic append fuer outgoing user messages

### 7.2 Streaming assembly rules

- append `chunk` to active text block
- `block` adds new typed block
- `updateBlock` patches block by id
- `done` seals message + persists summary state

### 7.3 Reconnect rules

- harte Modus-Wahl pro Deployment:
  - **Stop-Mode:** `stop/abort` aktiv, `resume` deaktiviert
  - **Resume-Mode:** `resume` aktiv, `stop/abort` deaktiviert
- nur im **Resume-Mode**:
  - if stream interrupted and backend has `backendId`/message id:
    - call reconnect endpoint
    - resume unfinished message
  - else mark message error + allow manual retry
- im **Stop-Mode**:
  - `stop()` beendet den Lauf terminal
  - kein Resume derselben Generation; nur Retry/Regenerate startet neuen Lauf

---

## 8) Package Strategy (project-specific)

### 8.1 Bereits vorhanden (gut)

- `next`, `react`, `@tanstack/react-query`, `zod`, `sonner`, `next-themes`, `zustand`
- starke SSE/BFF basis schon im Projekt

### 8.2 Must-have now (empfohlen)

1. Kein neues SDK zwingend fuer Phase 1
   - zuerst eigener stabiler Chat-Transport auf bestehendem SSE-Muster
2. Optional fuer block patches:
   - `rfc6902` (wenn `updateBlock` patching genutzt wird)

### 8.3 Evaluate track (Phase 2)

- Option A: `@tanstack/react-ai`
- Option B: `ai` (+ ggf. `@ai-sdk/*`)
- Option C: `@tambo-ai/react` nur fuer rich generative UI layer

Entscheidungskriterium:

- streaming correctness
- tool-event UX
- integration effort in existing Next<->Go<->Python
- security/policy control (must stay in backend boundaries)
- interruption semantics (`intentional_stop` vs `disconnect_resume`)
- typed message metadata (model, usage, finish reason, timestamps)
- persistent vs transient stream data handling (history-safe)

---

## 9) Security & Boundary Constraints

- keine unkontrollierten write-intents direkt aus Agent-UI
- tool actions nur ueber sichere backend boundaries
- clear allowlist fuer mutating operations
- audit-friendly event trail in message/thread metadata
- host execution niemals aus UI ableiten
- **Praezisierung "kein direkter UI-Tool-Pfad":**
  - erlaubt: reine Frontend-Interaktionen ohne kritische Side-Effects (UI state, filter, layout, local preview)
  - nicht erlaubt: browserseitige Direktaufrufe auf kritische Tool-Operationen unter Umgehung von Gateway/Policy/RBAC/Audit
  - verpflichtender Pfad fuer Tool-Aktionen mit Wirkung:
    `UI -> Next BFF/API -> Go Gateway (policy/capability/RBAC/audit) -> tool/runtime`
- Entscheidungsregel fuer dieses Projekt:
  - `read-only` und `bounded-write` sind erlaubt, wenn sie ueber den obigen Pfad laufen
  - kritische Mutationen (z. B. Orders, Wallet-/Account-Mutationen, Host-Execution) bleiben aus Agent-UI ausgeschlossen

---

## 10) Delivery Plan

### Phase A (Core)

- implement `AC1..AC3`, `AC5`, `AC6`
- SSE chat endpoint + full thread UI + tool events
- persist & reload with `AgentEpisode`
- verify `AC.V1..AC.V4`

### Phase B (Provider routing)

- implement `AC7..AC9`
- provider switch (Anthropic/Ollama/vLLM)
- latency/cost labels in UI event rail

### Phase C (SDK compare)

- compare TanStack AI vs Vercel AI SDK vs no-SDK baseline
- document `AC4`, `AC.V5`
- optional: pilot tambo-style generative component block

### Phase D (Hardening aus 3 Chat-Blueprints)

- umsetzen: `AC28..AC33` (Parser-Robustheit, End-Idempotenz, Thread-Migration, Merge-Policy, Queue/Composer Contracts)
- verifizieren: `AC.V14..AC.V19`
- referenzieren: Perplexica (`useChat`/reconnect), AgentZero (queue/attachments), Tambo (thread/event invariants)

### Phase E (Runtime Contracts fuer SDK/Streams)

- Interruption Contract fixieren (`stop` xor `resume`) und als Feature-Flag ausrollen
- Resume-Endpoints spezifizieren (`POST create stream`, `GET /stream` reconnect mit `204` wenn kein aktiver Stream)
- Active-Stream-Lifecycle absichern (vor neuem Run `activeStreamId` clearen; bei Finish/Abort clean finalisieren)
- Tool-Approval Auto-Continuation deterministisch festlegen (auto-send oder explizit manuell)
- Abort-safe Stream-Consumption und Idempotenz bei terminal events verifizieren

---

## 11) Was bleibt in FRONTEND_COMPONENTS.md

- visuelle/produktnahe Referenzdetails
- tool-specific UI inspirations (AgentZero/Perplexica/Tambo etc.)
- keine harten runtime execution contracts

Dieses Dokument (`docs/frontend_chat_ui.md`) bleibt die technische Implementierungsbruecke fuer Chat UI.

---

## 12) Evidence Snippets (Grounding)

### Existing scaffold and target contract

- `docs/specs/execution/agent_chat_ui_delta.md` -> scaffold in `src/features/agent-chat/` und API event contract (`chunk`, `done`, `tool`, `error`)

### Existing stub component

- `src/features/agent-chat/AgentChatPanel.tsx` -> aktuell stub, Zielpfad bereits kommentiert

### Existing Next SSE proxy style (reuse pattern)

- `src/app/api/market/stream/route.ts` -> robustes SSE proxying mit stream parsing, reconnect/degraded handling

### Perplexica streaming API pattern

- `_tmp_ref_review/perplexica/src/app/api/chat/route.ts` -> stream writer mit block/update/error/messageEnd frames
- `_tmp_ref_review/perplexica/src/lib/hooks/useChat.tsx` -> client stream assembly inkl. reconnect flow

### Tambo positioning (component-driven generative UI)

- `_tmp_ref_review/tambo/README.md` und `_tmp_ref_review/tambo/react-sdk/README.md` -> component registry + streaming props + `useTambo`/`useTamboThreadInput`

### Onyx chat robustness patterns

- `_tmp_ref_review/onyx/web/src/app/app/services/streamingModels.ts` -> typisierte Packet-Modelle + placement
- `_tmp_ref_review/onyx/web/src/app/app/services/messageTree.ts` -> branching/tree lifecycle + latest chain
- `_tmp_ref_review/onyx/web/src/app/app/stores/useChatSessionStore.ts` -> session-isolierter store + abort/error state
- `_tmp_ref_review/onyx/web/src/sections/input/AppInputBar.tsx` -> composer state machine (send/stop/upload/tools)
- `_tmp_ref_review/onyx/web/src/sections/chat/ChatScrollContainer.tsx` -> scroll/autofollow stabilitaet
- `_tmp_ref_review/onyx/web/src/app/app/message/messageComponents/MessageToolbar.tsx` -> action contract pro message status

---

## 13) Deep Component Map (mit konkreten Pfaden)

### 13.1 Perplexica (high-value fuer Full Chat UI)

- Thread-Orchestrierung / App-Entrypoint:
  - `_tmp_ref_review/perplexica/src/components/ChatWindow.tsx`
  - `_tmp_ref_review/perplexica/src/components/Chat.tsx`
  - `_tmp_ref_review/perplexica/src/components/ChatWindow.tsx`
- Streaming + State-Maschine + Reconnect:
  - `_tmp_ref_review/perplexica/src/lib/hooks/useChat.tsx`
- Message Rendering / Blocks:
  - `_tmp_ref_review/perplexica/src/components/MessageBox.tsx`
  - `_tmp_ref_review/perplexica/src/components/MessageRenderer/CodeBlock/index.tsx`
  - `_tmp_ref_review/perplexica/src/components/MessageRenderer/Citation.tsx`
  - `_tmp_ref_review/perplexica/src/components/AssistantSteps.tsx`
- Composer / Input-Actions:
  - `_tmp_ref_review/perplexica/src/components/MessageInput.tsx`
  - `_tmp_ref_review/perplexica/src/components/MessageInputActions/Attach.tsx`
  - `_tmp_ref_review/perplexica/src/components/MessageInputActions/AttachSmall.tsx`
  - `_tmp_ref_review/perplexica/src/components/MessageInputActions/ChatModelSelector.tsx`
- Sources/Widgets/Suggestions:
  - `_tmp_ref_review/perplexica/src/components/MessageSources.tsx`
  - `_tmp_ref_review/perplexica/src/components/Widgets/Renderer.tsx`
  - `_tmp_ref_review/perplexica/src/components/Widgets/Stock.tsx`
  - `_tmp_ref_review/perplexica/src/components/Widgets/Weather.tsx`

### 13.2 AgentZero (robuste Runtime/Process-UX Patterns)

- Input/Composer Shell:
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/input/chat-bar.html`
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/input/chat-bar-input.html`
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/input/input-store.js`
- Queueing vor Send (starkes Pattern):
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/message-queue/message-queue.html`
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/message-queue/message-queue-store.js`
- Attachments / DragDrop / Clipboard:
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/attachments/inputPreview.html`
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/attachments/dragDropOverlay.html`
  - `_tmp_ref_review/agentzero-complete/webui/components/chat/attachments/attachmentsStore.js`
- Process-Group + Tool-Step Visualisierung:
  - `_tmp_ref_review/agentzero-complete/webui/js/messages.js`
  - `_tmp_ref_review/agentzero-complete/webui/components/messages/process-group/process-group.css`
  - `_tmp_ref_review/agentzero-complete/webui/components/messages/process-group/process-group-dom.js`

### 13.3 Tambo (generative UI + thread primitives)

- Provider/Hooks API:
  - `_tmp_ref_review/tambo/react-sdk/src/v1/index.ts`
  - `_tmp_ref_review/tambo/react-sdk/src/v1/providers/tambo-v1-provider.tsx`
  - `_tmp_ref_review/tambo/react-sdk/src/v1/hooks/use-tambo-v1.ts`
  - `_tmp_ref_review/tambo/react-sdk/src/v1/providers/tambo-v1-thread-input-provider.tsx`
- Vollstaendige Thread UI Komposition:
  - `_tmp_ref_review/tambo/packages/ui-registry/src/components/message-thread-panel/message-thread-panel.tsx`
  - `_tmp_ref_review/tambo/packages/ui-registry/src/components/message-thread-full/message-thread-full.tsx`
  - `_tmp_ref_review/tambo/packages/ui-registry/src/components/message-thread-collapsible/message-thread-collapsible.tsx`
- Input / Suggestions / Thread-History:
  - `_tmp_ref_review/tambo/packages/ui-registry/src/components/message-input/message-input.tsx`
  - `_tmp_ref_review/tambo/packages/ui-registry/src/components/message-suggestions/message-suggestions.tsx`
  - `_tmp_ref_review/tambo/packages/ui-registry/src/components/thread-history/thread-history.tsx`
  - `_tmp_ref_review/tambo/packages/ui-registry/src/components/thread-content/thread-content.tsx`
- Generative Component Registration Beispiel:
  - `_tmp_ref_review/tambo/showcase/src/components/generative/FormChatInterface.tsx`
  - `_tmp_ref_review/tambo/showcase/src/components/generative/GraphChatInterface.tsx`
  - `_tmp_ref_review/tambo/showcase/src/components/generative/MapChatInterface.tsx`

### 13.4 Mission Control (Add-on Patterns fuer Ops/Runtime Chat)

- Chat-Orchestrierung + Session-View:
  - `_tmp_ref_review/mission-control/src/components/chat/chat-workspace.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/conversation-list.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/chat-panel.tsx`
- Message/Composer-Robustheit:
  - `_tmp_ref_review/mission-control/src/components/chat/message-list.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/message-bubble.tsx`
  - `_tmp_ref_review/mission-control/src/components/chat/chat-input.tsx`
- Realtime/Fallback:
  - `_tmp_ref_review/mission-control/src/lib/use-server-events.ts`
  - `_tmp_ref_review/mission-control/src/app/api/events/route.ts`
- Chat-API + Forward-/Policy-Pfad:
  - `_tmp_ref_review/mission-control/src/app/api/chat/messages/route.ts`
  - `_tmp_ref_review/mission-control/src/app/api/chat/conversations/route.ts`

### 13.5 Onyx (Add-on Patterns fuer Chat-Core Robustheit)

- Packet-/Event-Modell:
  - `_tmp_ref_review/onyx/web/src/app/app/services/streamingModels.ts`
- Message-Tree / Branching:
  - `_tmp_ref_review/onyx/web/src/app/app/services/messageTree.ts`
  - `_tmp_ref_review/onyx/web/src/app/app/message/MessageSwitcher.tsx`
- Session-isolierter Chat-Store:
  - `_tmp_ref_review/onyx/web/src/app/app/stores/useChatSessionStore.ts`
- Composer/Input-Bar:
  - `_tmp_ref_review/onyx/web/src/sections/input/AppInputBar.tsx`
- Scroll-/Autofollow-Container:
  - `_tmp_ref_review/onyx/web/src/sections/chat/ChatScrollContainer.tsx`
- Message-Toolbar Contract:
  - `_tmp_ref_review/onyx/web/src/app/app/message/messageComponents/MessageToolbar.tsx`

---

## 14) Coverage-Review (ist alles drin?)

### Bereits gut abgedeckt in diesem Blueprint

- Next -> Go -> Python Zielpfad und Verantwortlichkeiten
- Event-Contract-Basis (`chunk`/`done`/`tool`/`error`) + Erweiterung (`block`/`updateBlock`)
- Full-UI-Komponentenbild (Thread, Composer, Tool-Events, Reconnect)
- Evaluate-Track fuer TanStack AI / Vercel AI SDK / optional Tambo
- Security-Boundary Aussagen fuer Agent-UI

### Konkretisierung (im Slice als ACs verankert)

- Queueing-Flow im UI-Contract (`AC32`, inkl. pending-upload guard + send-all safety)
- Attachment-Lifecycle (`AC2` + `AC32`, staged/send/cancel/remove)
- Process-/Aggregation fuer Tool-Events (`AC14`)
- Message-Action-Contract (`AC15` + `AC27`)
- Thread-History-Contract (`AC12`, inkl. list/search/new/fork gestuft)
- session-zentriertes Conversation-Contract (`AC10`)
- hybrides Realtime-Contract: `SSE-first` + controlled polling fallback (`AC9`, `AC31`)
- Stream-Parser-Robustheit + Terminal-Idempotenz (`AC28`, `AC29`)
- Placeholder->Real-Thread-Migration + Merge-Invarianten (`AC30`, `AC31`)
- Composer optimistic clear + restore-on-failure (`AC33`)

---

## 15) Gap -> Referenzabdeckung + SDK-Einordnung

Die 5 offenen Punkte sind in den Referenzprojekten **klar vorhanden** (teils verteilt), daher koennen sie als konkrete Implementierungsquelle dienen.

### 15.1 Queueing-Flow

Referenzen:

- `_tmp_ref_review/agentzero-complete/webui/components/chat/message-queue/message-queue-store.js`
- `_tmp_ref_review/agentzero-complete/webui/components/chat/message-queue/message-queue.html`
- `_tmp_ref_review/agentzero-complete/webui/index.js`

Abgedeckte Patterns:

- enqueue statt direktem send
- pending uploads + send-all + send-item + remove-item
- queue-preview mit eigener UX

SDK-Fit:

- `ai` / `@ai-sdk/*` (Vercel): gut fuer message stream lifecycle, **Queueing selbst bleibt custom UI-State**
- `@tanstack/react-ai`: gut fuer thread/message state integration, **Queueing ebenfalls custom**

### 15.2 Attachment-Lifecycle

Referenzen:

- `_tmp_ref_review/agentzero-complete/webui/components/chat/attachments/attachmentsStore.js`
- `_tmp_ref_review/agentzero-complete/webui/components/chat/attachments/inputPreview.html`
- `_tmp_ref_review/agentzero-complete/webui/components/chat/attachments/dragDropOverlay.html`
- `_tmp_ref_review/perplexica/src/components/MessageInputActions/Attach.tsx`
- `_tmp_ref_review/perplexica/src/components/MessageInputActions/AttachSmall.tsx`
- `_tmp_ref_review/tambo/packages/ui-registry/src/components/message-input/message-input.tsx`

Abgedeckte Patterns:

- staged attachments (pre-send preview)
- drag/drop + clipboard image paste
- remove/retry + duplicate-checking
- file/image getrennte rendering/logik

SDK-Fit:

- Vercel AI SDK: Hilft bei message pipes; Attachment-Upload/UI bleibt in React-Komponenten
- TanStack AI: dito; guter Fit fuer State-Anbindung, Upload-Lifecycle weiterhin custom

### 15.3 Process-Group Aggregationsregeln

Referenzen:

- `_tmp_ref_review/agentzero-complete/webui/js/messages.js`
- `_tmp_ref_review/agentzero-complete/webui/components/messages/process-group/process-group.css`
- `_tmp_ref_review/agentzero-complete/webui/components/messages/process-group/process-group-dom.js`

Abgedeckte Patterns:

- gruppierte tool/agent steps pro Antwort
- status-badge progression (inkl. completion state)
- duration + step-counter + warning/info counters
- collapse modes (expanded/current/collapsed)

SDK-Fit:

- Vercel/TanStack liefern hier nicht direkt die Domänen-UX; diese Aggregation ist ein eigenes Rendering-Modell
- SDKs koennen nur den Event-/Message-Transport vereinfachen

### 15.4 Message-Action Contract

Referenzen:

- `_tmp_ref_review/perplexica/src/components/MessageActions/Copy.tsx`
- `_tmp_ref_review/perplexica/src/components/MessageActions/Rewrite.tsx`
- `_tmp_ref_review/perplexica/src/lib/hooks/useChat.tsx`
- `_tmp_ref_review/agentzero-complete/webui/js/messages.js`
- `_tmp_ref_review/agentzero-complete/webui/components/messages/action-buttons/simple-action-buttons.js`

Abgedeckte Patterns:

- copy/rewrite/speak/retry actions
- action availability pro message status
- action buttons in message footer / process-step context

SDK-Fit:

- Vercel AI SDK ist hier stark (regenerate/retry/stop flows im Chat-Lifecycle)
- TanStack AI kann message actions gut an thread/message state koppeln

### 15.5 Thread-History UX Contract

Referenzen:

- `_tmp_ref_review/tambo/packages/ui-registry/src/components/thread-history/thread-history.tsx`
- `_tmp_ref_review/tambo/packages/ui-registry/src/components/thread-content/thread-content.tsx`
- `_tmp_ref_review/tambo/packages/ui-registry/src/components/message-thread-panel/message-thread-panel.tsx`
- `_tmp_ref_review/perplexica/src/lib/hooks/useChat.tsx`

Abgedeckte Patterns:

- thread list + search + new-thread UX
- restore/reconnect bei reload
- gekoppelte thread-content + thread-history panels

SDK-Fit:

- Vercel AI SDK: sehr hilfreich bei messaging/thread updates; history/search UX trotzdem custom
- TanStack AI: hilfreich fuer stateful thread orchestration; history/search ebenfalls custom UI layer

### 15.6 Praktische Empfehlung fuer TradeView Fusion

- Phase 1: eigener Contract + eigener UI State (weil Next <-> Go <-> Python + Tool-Events + Security Boundaries zentral sind)
- Phase 2: Vercel AI SDK und TanStack AI parallel evaluieren nur als Messaging-Layer-Verstaerker
- hartes Kriterium: kein SDK darf die Gateway-/Policy-/Audit-Grenzen umgehen
- Mission-Control nur additiv einsetzen: Session-Threading, Realtime-Fallback und Operator-Tool-Event UX
- Onyx additiv einsetzen fuer Chat-Robustheit: Packet-Placement, Branching-Tree, Session-isolierter Store, stabiles Scroll-Verhalten

### 15.7 Deepdive-Ergaenzungen aus den 3 Kern-Referenzen

Perplexica:

- idempotente End-Event Behandlung und robustes chunk buffering
- reconnect via backend/session id ohne UI-reset

AgentZero:

- queue operations mit pending-state/abort/cancel und send-all safety
- attachment lifecycle inkl. dedupe, drag/drop, clipboard-paste

Tambo:

- placeholder->real thread migration invariants
- merge policies fuer reload/polling (dedupe/sort/skip-if-streaming)
- keyed throttling und optimistic input restore bei submit-failures

Diese Punkte sind als Execution-Owner im Slice unter `AC28..AC33` und
`AC.V14..AC.V19` verankert.

---

## 16) Root-MD Alignment Check (parallel build verhindern)

Damit Chat-UI nicht parallel an Projektregeln vorbei gebaut wird, gelten folgende
verbindliche Alignments:

- Gateway/Transport:
  - Chat bleibt auf `Next BFF -> Go Gateway -> Python`; Tool-Wirkpfade laufen nie browser-direkt.
  - `SSE-first` mit explizitem REST-Recovery/Fallback.
- Security/Policy:
  - Keine impliziten mutierenden Agent-Aktionen aus UI-Events.
  - `read-only` oder `bounded-write` strikt sichtbar und policy-validiert.
- Context/Memory:
  - Nur normalisierte Persistenz-/Retrieval-Artefakte fuer Agent-Context.
  - Degradation muss als UI-Status und Event-Flag sichtbar sein (`NO_KG_CONTEXT`, `NO_VECTOR_CONTEXT` etc.).
- Runtime/Observability:
  - Streaming-/Queue-/Retry-Verhalten als explizite Execution-Policy.
  - Audit-faehige Kette: user intent -> gateway decision -> tool/event -> UI output.

---

## 17) Must-have Ergaenzungen (Web-Review Maerz 2026)

Diese Punkte sollten zusaetzlich in den Chat-Plan aufgenommen werden, weil sie
bei AI-SDK-/Streaming-Setups regelmaessig produktionskritisch sind.

### 17.1 Unterbrechungs-Policy als harter Contract

- `stop/abort` und `resume` nicht als ein gemeinsames Feature behandeln.
- Pro Deployment-Modus klare Wahl treffen:
  - Modus A: `stop` erlaubt, `resume` aus
  - Modus B: `resume` erlaubt, `stop` aus
- Im UI sichtbar unterscheiden:
  - `stopped_by_user`
  - `interrupted_by_disconnect`
  - `resumed`

Warum: Der aktuelle AI-SDK-Stand dokumentiert eine Inkompatibilitaet zwischen
Abort und Resumption; ohne klare Policy entstehen widerspruechliche UX-Zustaende.

### 17.2 Message-Metadata verpflichtend einfuehren

Pro assistant message mindestens:

- `modelId`
- `createdAt` / `finishedAt`
- `finishReason`
- `usage.totalTokens` (optional input/output getrennt)
- `latencyMs` (TTFT + completion, wenn verfuegbar)

Warum: Cost-Transparenz, Audit, Debugging und spaetere Routing-Optimierung.

### 17.3 Transiente Stream-Daten von persistenten Daten trennen

- Persistente Daten (`message.parts`): alles, was in Thread-Historie bleiben soll.
- Transiente Daten (`onData`/ephemeral): Toasts, "tool running", kurzfristige
  Progress-Hinweise.
- "Transient" nie in History-Store schreiben.

Warum: verhindert History-Verschmutzung und reduziert Merge-/Restore-Fehler.

### 17.4 Tool-Execution-Approval als First-Class UI-State

- Tool-Status um `approval-requested` erweitern.
- Inline Approval Card mit Approve/Reject und begruendeter Deny-Option.
- Auto-Continuation nach Approval explizit (oder deterministisch manuell) festlegen.

Warum: passt zu euren Security-Boundaries und verhindert stille Side-Effects.

### 17.5 Multi-Step Tool-Runs sichtbar machen

- Step-Grenzen (`step-start`) im Thread rendern.
- Tool-Invocation-State vollstaendig anzeigen:
  - `input-streaming`
  - `input-available`
  - `output-available`
  - `output-error`
- Pro Step: Laufzeit/Fehlertext/Retry-Pfad.

Warum: reduziert "black box"-Gefuehl bei Agent-Loops und beschleunigt Incident-
Debugging.

### 17.6 Serverseitige Abort-/Finish-Cleanup-Pflichten

- Bei Abort: partial persist + abort event loggen.
- Bei normalem Finish: final persist + usage speichern.
- Explizite Idempotenzregel fuer doppelte terminal events.

Warum: ohne Cleanup drohen hängende active-stream marker und inkonsistente
Reload-Recovery.

### 17.7 Dynamic-Tool Fallback fuer unbekannte Tool-Schemas

- Wenn Tool zur Compile-Zeit unbekannt: generisches `dynamic-tool` Rendering.
- Immer rohe Inputs/Outputs + Fehlertext im Debug-Panel sichtbar machen.

Warum: wichtig fuer MCP-/runtime-geladene Tools und flexible Agent-Backends.

### 17.8 Error-/Warning-Telemetrie fuer Runtime-Qualitaet

- SDK-/Provider-Warnings erfassen (nicht nur Console) und in Observability
  pipeline aufnehmen.
- User-seitig weiter nur generische Fehlermeldung; Details nur intern.

Warum: verbessert Betriebssicherheit ohne Informationsleck im Frontend.

### 17.9 Empfohlene Priorisierung fuer naechste Iteration

1. Unterbrechungs-Policy + Statusmodell (17.1)
2. Metadata + Usage + Latency (17.2)
3. Persistente vs transiente Datenpfade (17.3)
4. Tool-Approval + Step-States (17.4, 17.5)
5. Cleanup/Idempotenz + Dynamic-Tool Fallback (17.6, 17.7)
6. Warning/Fehler-Telemetrie (17.8)

### 17.10 Quellen (offizielle/technische Referenzen)

- https://ai-sdk.dev/docs/troubleshooting/abort-breaks-resumable-streams
- https://sdk.vercel.ai/docs/advanced/stopping-streams
- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams
- https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata
- https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
- https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage
- https://ai-sdk.dev/docs/ai-sdk-ui/error-handling

### 17.11 Resume-Backend-Contract (verbindlich)

- Zwei Endpunkte:
  - `POST /chat` startet neuen Run und schreibt `activeStreamId`
  - `GET /chat/{id}/stream` resumiert aktiven Run
- Wenn kein aktiver Stream vorhanden:
  - `GET /chat/{id}/stream` liefert `204 No Content` (kein Fehlerzustand)
- Race-Condition-Guard:
  - vor neuem Run `activeStreamId = null` setzen
  - nur letzter aktiver Run darf resumiert werden
- AuthZ/AuthN fuer **beide** Endpunkte gleich streng wie Chat-POST.
- Stream-TTL/Expiry dokumentieren (Redis) inkl. Verhalten bei Ablauf.

### 17.12 Tool-Approval-Continuation (verbindlich)

- Nach `approval-requested` muss der Lauf deterministisch fortgesetzt werden:
  - entweder auto-continue when complete
  - oder expliziter Continue-Submit im UI (kein stiller Deadlock)
- Gleiches fuer client-side tool outputs: nach vollstaendigen Tool-Results
  muss der naechste Agent-Schritt klar triggerbar sein.

### 17.13 Abort-/Finish-Stream-Handling (verbindlich)

- Bei abort muss der Stream sauber konsumiert/geschlossen werden, damit keine
  haengenden Verbindungen oder Leaks bleiben.
- `onAbort` und `onFinish` getrennt behandeln:
  - abort: partial persist + abort log
  - finish: final persist + usage/final status
- Terminal events (`done`/`text-end`) idempotent behandeln (duplicate-safe).

### 17.14 Zusaetzliche Verify-Gates (Must-have)

- **VG.R1** Stop-Mode: `stop()` beendet Lauf; reconnect resumiert **nicht** dieselbe Generation.
- **VG.R2** Resume-Mode: Disconnect ohne stop -> Resume mit gleicher Run-Identitaet.
- **VG.R3** `GET /chat/{id}/stream` ohne aktiven Stream liefert `204`.
- **VG.R4** Approval/Tool-Output fuehrt deterministisch zur naechsten Iteration (kein Hanger).
- **VG.R5** Doppeltes terminal event erzeugt keine doppelte Persistenz/keine Doppel-UI.

---

## 18) Reasoning Effort / "Interruptible Reasoning" — Constraint-Vermerk

### Was es ist (Stand Maerz 2026)

"Interruptible Reasoning" ist **kein API-Feature** bei OpenAI oder Anthropic. Was gemeint ist:

1. **`reasoning.effort: low|medium|high|xhigh`** (OpenAI o3/o4-mini/GPT-5.x) — Pre-Request Budget-Knob, nicht in-flight steuerbar.
2. **Stream-Abort** (`AbortController.abort()`) — einzige echte Unterbrechung; State geht verloren, kein Resume.

### Provider-agnostische Umsetzung

| Provider | Reasoning-Kontrolle | Abort-Support |
|---|---|---|
| Anthropic Claude 4.x | `thinking: { type: 'adaptive' }` (Modell entscheidet) | `abortSignal` forwarding via AI SDK |
| OpenAI o3/o4/GPT-5.x | `reasoning.effort: low\|medium\|high\|xhigh` | `abortSignal` forwarding |
| Ollama/lokal | modellabhaengig | `abortSignal` forwarding |

### Bekannter Bug (GitHub #12427)

`streamObject` + Anthropic extended thinking buffert komplett statt inkrementell zu streamen.
**Workaround**: `streamText` + `experimental_output` benutzen.

### Fazit fuer TradeView

- Kein "pause + resume reasoning" in Production APIs verfuegbar (nur Research-Kontext, Stand 2026).
- Frontend-seitig: `stop()` via `useChat()` + `abortSignal` auf Server-Seite ist der korrekte Pfad.
- OpenAI Responses API erlaubt *reasoning items persistent* ueber Multi-Step-Calls — approximiert "session-level resume", nicht token-level.
- **Im Slice als Constraint vermerkt, nicht als Feature.**

---

## 19) Audio / Speech Modalitaet

### 19.1 Vercel AI SDK v6 — Built-in (provider-agnostisch)

- `transcribe(model, audio)` — unified STT: OpenAI Whisper, Deepgram, AssemblyAI, ElevenLabs u.a.
- `generateSpeech(model, text)` — unified TTS: gleiche Provider-Abstraktion.
- `<SpeechInput />` — AI Voice Elements (`elements.ai-sdk.dev`): Web Speech API (Chrome/Edge) + MediaRecorder Fallback (Firefox/Safari).
- `<MicSelector />` — Device-Selection UI mit Permissions-Handling.
- Provider-Switch: ein env var, kein Code-Change.

### 19.2 "Sandwich-Architektur" (empfohlen)

```
Mic (MediaRecorder)
  → transcribe(model, audio)          # STT — provider-agnostisch
  → useChat({ sendMessage })          # LLM — bestehender Pfad
  → generateSpeech(model, text)       # TTS — provider-agnostisch
  → AudioContext (Playback)
```

Env-Vars: `AGENT_STT_PROVIDER`, `AGENT_TTS_PROVIDER` → Provider-agnostisch ohne Code-Aenderung.

### 19.3 OpenAI Realtime API (bidirektionaler Audio-WebSocket)

- **Status:** nicht first-class in AI SDK (Issue #3176 offen, Stand Maerz 2026).
- Vercel Labs Demo: `github.com/vercel-labs/ai-sdk-openai-websocket` — WebSocket-Fetch fuer Responses API.
- Fuer volle bidirektionale Audio-Streams (WebRTC): LiveKit Agents (siehe 19.4).

### 19.4 Self-Hosted / Vendor-agnostisch — SOTA Stack

| Rolle | Empfehlung | Alternativ | Lizenz |
|---|---|---|---|
| STT Streaming | **WhisperLiveKit** (Faster-Whisper + Silero VAD) | NVIDIA Parakeet 1.1B (EN-only, schneller) | MIT/Apache |
| VAD | **Silero VAD v6** (CPU-only) | WebRTC VAD | MIT |
| TTS Streaming | **Kokoro** (82M, 96x realtime, OAI-API-kompatibel) | Piper (edge/leicht) | Apache 2.0 / MIT |
| Pipeline-Orchestrierung | **LiveKit Agents** (Python) — STT+LLM+TTS any combo | Direkt via python-agent | Apache 2.0 |

**Full local reference**: `github.com/ShayneP/local-voice-ai` (Nemotron STT + llama.cpp + Kokoro + LiveKit Agents).

WhisperLiveKit Details:
- SimulStreaming + AlignAtt (SOTA, schneller als altes WhisperStreaming)
- Backend-Auswahl: MLX (macOS) → Faster-Whisper → vanilla Whisper
- Exposes: OpenAI-kompatibles REST + Deepgram WebSocket + native WebSocket
- `github.com/QuentinFuxa/WhisperLiveKit` v0.1.13 (unstable, monitor)

### 19.5 Paid Provider Optionen (STT)

| Provider | SDK | Feature |
|---|---|---|
| OpenAI Whisper API | `@ai-sdk/openai` | Batch + near-realtime |
| Deepgram | `@ai-sdk/deepgram` | Streaming + Speaker Diarization |
| AssemblyAI | `@ai-sdk/assemblyai` | Streaming + Diarization (Earnings-Call Use Case) |
| ElevenLabs | `@ai-sdk/elevenlabs` | Auch TTS (beste Qualitaet paid) |

### 19.6 Paid Provider Optionen (TTS)

| Provider | Qualitaet | Streaming | Bemerkung |
|---|---|---|---|
| ElevenLabs | Beste | Ja | Teuerste Option |
| OpenAI TTS | Sehr gut | Ja | `tts-1` / `tts-1-hd` |
| Cartesia | Gut | Ja | Low-latency fokussiert |
| Deepgram Aura | Gut | Ja | Guenstigste paid Option |

---

## 20) Image / Vision Input

### 20.1 Vercel AI SDK v6 — `experimental_attachments`

```ts
// In useChat() — unveraendert seit v4, kein breaking change in v6
const { handleSubmit } = useChat();
handleSubmit(e, {
  experimental_attachments: fileList, // FileList von <input type="file">
});
```

- Files werden automatisch base64-encoded als multimodale Message-Parts gesendet.
- `@ai-sdk/anthropic`: konvertiert automatisch zu Anthropic `image` content blocks.
- `@ai-sdk/openai`: konvertiert zu OpenAI vision format.
- Akzeptiert: base64 data URL, HTTPS URL, `Uint8Array`.
- Referenz-Impl: `github.com/vercel-labs/ai-sdk-preview-attachments`.

### 20.2 Evaluation — Eigenbau vs experimental_attachments vs andere Lib

**→ Evaluation ausstehend vor Implementierung:**
- Option A: `experimental_attachments` direkt nutzen (minimal, aber `experimental_` prefix bleibt)
- Option B: Eigenbau mit `FormData` / base64-Encoding (volle Kontrolle, kein experimental)
- Option C: Andere Lib (z.B. `@assistant-ui/react` hat eigene Attachment-Primitives)

Entscheidungskriterium: Funktionsumfang (Preview, Drag/Drop, Clipboard-Paste, Multi-File), Bundle-Overhead, Stabilitat.

### 20.3 Unterstuetzte Formate (alle Vision-faehigen Modelle)

- Bilder: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- PDF: via provider (Anthropic Claude 3/4 unterstuetzt PDF nativ)
- Claude 3/4 alle Vision-faehig; GPT-4o/4.1/5; Gemini 1.5+

---

## 21) Video Input — Future / Backend-Processing

> **Status:** Deferred — kein Frontend-Impl jetzt.
> **Verweis:** Planung in `agent_chat_runtime_delta.md` (Video-Backend-Processing-Slot).

- Kein LLM-Provider unterstuetzt echten Video-Stream nativ (Stand Maerz 2026).
- Frontend-Pfad wenn benoetigt: Frame-Extraction client-seitig → Frames als Image-Array → Vision-Pipeline (Sektion 20).
- Backend-Processing (Transcription, Frame-Extraction, Chunking) → separater Backend-Slice.

---

## 22) Package-Strategie Update (Maerz 2026)

### 22.1 Neue Additions

| Package | Version | Zweck | Prioritaet |
|---|---|---|---|
| `@assistant-ui/react` | 0.12.17 | Chat UI Primitives: Message Branching, Tool Approval UI, Generative UI | **Installieren** |
| `@assistant-ui/react-ai-sdk` | latest | Adapter — wraps `useChat()` direkt | **Installieren** |
| `nuqs` | latest | Type-safe URL params Next.js → shareable Thread-URLs (threadId, model) | **Installieren** |
| `@ai-sdk/assemblyai` | latest | Streaming STT mit Diarization (Earnings-Call) | Evaluate Phase |

### 22.2 `@assistant-ui/react` — Was es ergaenzt (nicht ersetzt)

Ersetzt **nicht** `useChat()`. Wraps es mit production-grade UI-Layer:
- Message Branching (Edit → neuer Branch) — fehlt sonst komplett
- Tool-Call Approval UI inline im Thread
- Generative UI: Custom React Components aus Tool-Results rendern
- Auto-scroll mit lock, accessible keyboard shortcuts
- `@assistant-ui/react-ai-sdk` Adapter: minimale Integration ueber bestehenden `useChat()` Hook

### 22.3 Nicht hinzufuegen (evaluiert, abgelehnt)

- `ai-sdk-openai-websocket-fetch` (Vercel Labs) — experimental, nur relevant bei OpenAI Responses API Multi-Step Agents, kein akuter Bedarf
- `vaul` — als unmaintained erklaert; shadcn Sheet bleibt (bereits genutzt)
- `@tanstack/react-ai` — Alpha 0.3.x, nicht stabil (Stand Maerz 2026)

