// Agent Chat UI — type scaffold (Phase 22a)
// Streaming chat interface to the Go Gateway → Python/Anthropic agent layer.
// TanStack AI is the candidate UI library for rendering streamed responses.
//
// Implementation: docs/specs/execution/agent_chat_ui_delta.md

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
	id: string;
	role: ChatRole;
	content: string;
	/** Unix timestamp (ms) */
	createdAt: number;
	/** Whether streaming is still in progress */
	isStreaming?: boolean;
	/** Tool call result if this message is a tool response */
	toolCallId?: string;
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
