// Agent Chat UI — type definitions (Phase 22a)
// Streaming chat interface to the Go Gateway → Python/Anthropic agent layer.

export type ChatRole = "user" | "assistant" | "system";

export type BlockType = "text" | "tool_call" | "tool_result" | "warning" | "error";

export interface ChatBlock {
	id: string;
	type: BlockType;
	/** Accumulated text content (streamed chunk-by-chunk) */
	content: string;
	/** Tool name — only for tool_call / tool_result blocks */
	toolName?: string;
	/** Tool input payload — only for tool_call blocks */
	toolInput?: unknown;
	/** Tool result payload — only for tool_result blocks */
	toolResult?: unknown;
	/** Duration in ms — only for tool_result blocks */
	durationMs?: number;
	isCollapsed?: boolean;
}

export interface ChatMessage {
	id: string;
	role: ChatRole;
	/** Rendered blocks; assistant messages may have multiple */
	blocks: ChatBlock[];
	/** Convenience accessor: first text block content */
	content: string;
	/** Unix timestamp (ms) */
	createdAt: number;
	/** True while SSE stream is still assembling this message */
	isStreaming?: boolean;
	/** present if streaming ended with an error */
	errorText?: string;
}

export interface ChatThread {
	id: string;
	messages: ChatMessage[];
	title?: string;
	createdAt: number;
	updatedAt: number;
}

export interface AgentChatConfig {
	/** Go Gateway SSE endpoint for streaming agent responses */
	streamEndpoint: string;
	/** Agent identifier — maps to Python memory-service session */
	agentId?: string;
	/** Show tool-call events in the thread */
	showToolCalls?: boolean;
}

// ---- SSE event shapes (from /api/agent/chat) ----

export interface SseChunkEvent {
	delta: string;
}

export interface SseDoneEvent {
	threadId: string;
	messageId: string;
}

export interface SseToolEvent {
	name: string;
	input: unknown;
	result: unknown;
	durationMs?: number;
}

export interface SseErrorEvent {
	message: string;
}

// ---- Session-isolated in-flight state ----

export interface ChatSessionState {
	/** Locally assembled in-flight message (assistant, streaming) */
	inFlightMessage: ChatMessage | null;
	abortController: AbortController | null;
	error: string | null;
}
