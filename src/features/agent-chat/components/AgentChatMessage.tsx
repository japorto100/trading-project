"use client";

// AC34-AC38: Markdown rendering + <think> collapsible
// AC41: Copy-button per assistant message
// AC46: Paced turn groups via framer-motion fade-in
// AC49: TTS-button per assistant message
// AC67: React.memo with custom arePropsEqual

import { motion } from "framer-motion";
import { AlertCircle, Check, Copy } from "lucide-react";
import { memo, useCallback, useState } from "react";
import type { ChatMessage } from "../types";
import { AgentChatMarkdown } from "./AgentChatMarkdown";
import { AgentChatToolBlock } from "./AgentChatToolBlock";
import { AgentChatTtsButton } from "./AgentChatTtsButton";

interface AgentChatMessageProps {
	message: ChatMessage;
	onToggleBlock: (blockId: string) => void;
	speakingId?: string | null;
	onSpeakStart?: (id: string) => void;
	/** Index within the thread — used for staggered entry delay (AC46) */
	index?: number;
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = useCallback(() => {
		void navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}, [text]);
	return (
		<button
			type="button"
			onClick={handleCopy}
			className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
			title="Copy message"
		>
			{copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
		</button>
	);
}

function AgentChatMessageInner({
	message,
	onToggleBlock,
	speakingId,
	onSpeakStart,
	index = 0,
}: AgentChatMessageProps) {
	const isUser = message.role === "user";
	const textContent = message.blocks.find((b) => b.type === "text")?.content ?? "";
	const isSealed = !message.isStreaming && !message.errorText;

	// AC46: stagger delay capped at 150ms so long threads don't feel sluggish
	const delay = Math.min(index * 0.04, 0.15);

	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.18, ease: "easeOut", delay }}
			className={`flex ${isUser ? "justify-end" : "justify-start"}`}
		>
			<div
				className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
					isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
				}`}
			>
				{message.blocks.map((block) => {
					if (block.type === "text") {
						return (
							<div key={block.id}>
								{isUser ? (
									<div className="whitespace-pre-wrap break-words leading-relaxed">
										{block.content}
									</div>
								) : (
									<>
										{block.content ? <AgentChatMarkdown content={block.content} /> : null}
										{message.isStreaming && !block.content && (
											<span className="inline-flex gap-0.5 ml-0.5 align-middle">
												<span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
												<span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
												<span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
											</span>
										)}
									</>
								)}
							</div>
						);
					}

					if (block.type === "tool_call" || block.type === "tool_result") {
						return <AgentChatToolBlock key={block.id} block={block} onToggle={onToggleBlock} />;
					}

					return null;
				})}

				{message.errorText && (
					<div className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
						<AlertCircle className="h-3 w-3 shrink-0" />
						<span>{message.errorText}</span>
					</div>
				)}

				<div
					className={`mt-1.5 flex items-center justify-between gap-2 ${
						isUser ? "text-primary-foreground/60" : "text-muted-foreground/60"
					}`}
				>
					<span className="text-[10px]">{new Date(message.createdAt).toLocaleTimeString()}</span>
					{!isUser && isSealed && textContent && (
						<div className="flex items-center gap-1.5">
							<AgentChatTtsButton
								text={textContent}
								shouldStop={speakingId !== null && speakingId !== message.id}
								onSpeakStart={() => onSpeakStart?.(message.id)}
							/>
							<CopyButton text={textContent} />
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}

// AC67: memo — only re-render if content, streaming state, or relevant speakingId changes
export const AgentChatMessage = memo(AgentChatMessageInner, (prev, next) => {
	if (prev.message.id !== next.message.id) return false;
	if (prev.message.content !== next.message.content) return false;
	if (prev.message.isStreaming !== next.message.isStreaming) return false;
	if (prev.message.errorText !== next.message.errorText) return false;
	if (prev.message.blocks.length !== next.message.blocks.length) return false;
	// only re-render for speakingId changes that affect this specific message
	const prevRelevant = prev.speakingId === prev.message.id || prev.speakingId === null;
	const nextRelevant = next.speakingId === next.message.id || next.speakingId === null;
	if (prevRelevant !== nextRelevant) return false;
	return true;
});
