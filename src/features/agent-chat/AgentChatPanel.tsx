"use client";

// Agent Chat UI — stub component (Phase 22a)
// Full implementation: docs/specs/execution/agent_chat_ui_delta.md
//
// Architecture:
//   User → AgentChatPanel → POST /api/agent/chat (SSE stream)
//   → Go Gateway → Python memory-service (Anthropic Claude)
//   ← SSE chunks → setQueryData / local state → rendered message thread
//
// TanStack AI candidate: https://tanstack.com/ai — streaming text rendering,
// message thread management, tool-call visualization.
// Adopt when Phase 22a implementation begins.

import type { AgentChatConfig } from "./types";

interface AgentChatPanelProps {
	config?: Partial<AgentChatConfig>;
}

export function AgentChatPanel({ config: _config }: AgentChatPanelProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
			<div className="text-sm font-semibold text-foreground">Agent Chat</div>
			<p className="text-xs text-muted-foreground max-w-xs">
				Streaming chat interface to the agent layer. Implementation planned for Phase 22a.
			</p>
			<p className="text-[10px] text-muted-foreground/60">
				See <code className="font-mono">docs/specs/execution/agent_chat_ui_delta.md</code>
			</p>
		</div>
	);
}
