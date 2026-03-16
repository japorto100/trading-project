"use client";

// AC61: Empty-Chat-Screen with suggestion chips
// AC62: Loading skeleton while connecting

import { Bot, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { AgentChatMessage } from "./AgentChatMessage";

const SUGGESTION_CHIPS = [
	"Analyse current BTC/USD trend",
	"Geopolitical risks affecting markets today",
	"Explain the Kelly Criterion for position sizing",
	"What are the key support levels for this asset?",
];

interface AgentChatThreadProps {
	messages: ChatMessage[];
	isConnecting: boolean;
	isStreaming: boolean;
	onToggleBlock: (blockId: string) => void;
	onSuggestion?: (text: string) => void;
}

function EmptyChat({ onSuggestion }: { onSuggestion?: (text: string) => void }) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
				<Bot className="h-5 w-5 text-muted-foreground" />
			</div>
			<div className="space-y-1">
				<p className="text-sm font-medium text-foreground">Agent ready</p>
				<p className="text-xs text-muted-foreground">
					Streaming via Go Gateway → Python / Anthropic
				</p>
			</div>
			{onSuggestion && (
				<div className="flex flex-wrap justify-center gap-2 max-w-xs">
					{SUGGESTION_CHIPS.map((chip) => (
						<button
							key={chip}
							type="button"
							onClick={() => onSuggestion(chip)}
							className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
						>
							{chip}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function MessageSkeleton() {
	return (
		<div className="flex justify-start">
			<div className="max-w-[75%] rounded-lg bg-muted px-3 py-2 space-y-2">
				<div className="h-2.5 w-48 rounded bg-muted-foreground/20 animate-pulse" />
				<div className="h-2.5 w-32 rounded bg-muted-foreground/15 animate-pulse" />
			</div>
		</div>
	);
}

export function AgentChatThread({
	messages,
	isConnecting,
	isStreaming,
	onToggleBlock,
	onSuggestion,
}: AgentChatThreadProps) {
	const bottomRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const isAtBottomRef = useRef(true);
	// AC49: track which message is currently speaking (for TTS exclusivity)
	const [speakingId, setSpeakingId] = useState<string | null>(null);

	const handleScroll = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
	}, []);

	useEffect(() => {
		if (isAtBottomRef.current) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	});

	if (messages.length === 0 && !isConnecting) {
		return <EmptyChat onSuggestion={onSuggestion} />;
	}

	return (
		<div
			ref={containerRef}
			className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
			onScroll={handleScroll}
		>
			{messages.map((msg, i) => (
				<AgentChatMessage
					key={msg.id}
					message={msg}
					index={i}
					onToggleBlock={onToggleBlock}
					speakingId={speakingId}
					onSpeakStart={setSpeakingId}
				/>
			))}

			{isConnecting && !isStreaming && (
				<div className="flex justify-start">
					<div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
						<Loader2 className="h-3 w-3 animate-spin" />
						Connecting…
					</div>
				</div>
			)}

			{/* AC62: skeleton while first response loads */}
			{isConnecting && messages.length === 0 && <MessageSkeleton />}

			<div ref={bottomRef} />
		</div>
	);
}
