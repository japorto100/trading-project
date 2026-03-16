"use client";

// Agent Chat Panel — Phase 22a
// Thin orchestrator: wires session hook + sub-components.
// Architecture: AgentChatPanel → /api/agent/chat (SSE BFF) → Go Gateway → Python/Anthropic

import { useRef } from "react";
import { AgentChatComposer, type AgentChatComposerRef } from "./components/AgentChatComposer";
import { AgentChatErrorBanner } from "./components/AgentChatErrorBanner";
import { AgentChatEventRail } from "./components/AgentChatEventRail";
import { AgentChatHeader } from "./components/AgentChatHeader";
import { AgentChatReconnectBanner } from "./components/AgentChatReconnectBanner";
import { AgentChatThread } from "./components/AgentChatThread";
import { AgentChatToolbar } from "./components/AgentChatToolbar";
import { useChatSession } from "./hooks/useChatSession";
import type { AgentChatConfig } from "./types";

interface AgentChatPanelProps {
	config?: Partial<AgentChatConfig>;
	/** AC68: called by parent (GlobalChatOverlay) after panel opens to focus composer */
	onMounted?: (focusFn: () => void) => void;
}

export function AgentChatPanel({ config: _config, onMounted }: AgentChatPanelProps) {
	const composerRef = useRef<AgentChatComposerRef>(null);

	// AC68: expose focus to parent on first render
	const handleComposerRef = (el: AgentChatComposerRef | null) => {
		(composerRef as React.MutableRefObject<AgentChatComposerRef | null>).current = el;
		if (el && onMounted) onMounted(() => el.focus());
	};
	const {
		messages,
		isStreaming,
		isConnecting,
		error,
		threadId,
		send,
		abort,
		retry,
		toggleBlockCollapse,
		clearError,
		lastUserContent,
	} = useChatSession();

	const railStatus = isConnecting ? "reconnecting" : isStreaming ? "live" : "idle";

	return (
		<div className="flex h-full flex-col bg-background overflow-hidden">
			<AgentChatHeader />

			{/* AC71: Model selector + thread controls */}
			<AgentChatToolbar />

			{/* AC70: Stream status rail */}
			<AgentChatEventRail status={railStatus} isStreaming={isStreaming} />

			<AgentChatThread
				messages={messages}
				isConnecting={isConnecting}
				isStreaming={isStreaming}
				onToggleBlock={toggleBlockCollapse}
				onSuggestion={(text) => void send(text)}
			/>

			{/* AC72: Reconnect/degraded banner (separate from error) */}
			<AgentChatReconnectBanner status={isConnecting ? "reconnecting" : "live"} />

			{error && <AgentChatErrorBanner message={error} onDismiss={clearError} />}

			<AgentChatComposer
				ref={handleComposerRef}
				isStreaming={isStreaming}
				threadId={threadId}
				onSend={send}
				onAbort={abort}
				onRetry={retry}
				hasError={!!error}
				savedInput={lastUserContent}
			/>
		</div>
	);
}
