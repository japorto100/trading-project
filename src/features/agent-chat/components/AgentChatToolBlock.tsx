"use client";

// AC67: React.memo — only re-render when collapse state or content changes

import { ChevronDown, ChevronRight, Wrench } from "lucide-react";
import { memo } from "react";
import type { ChatBlock } from "../types";

interface AgentChatToolBlockProps {
	block: ChatBlock;
	onToggle: (id: string) => void;
}

function AgentChatToolBlockInner({ block, onToggle }: AgentChatToolBlockProps) {
	const collapsed = block.isCollapsed !== false;

	return (
		<div className="mt-1 rounded border border-border/50 bg-muted/30 text-xs font-mono">
			<button
				type="button"
				className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-muted-foreground hover:text-foreground transition-colors"
				onClick={() => onToggle(block.id)}
			>
				{collapsed ? (
					<ChevronRight className="h-3 w-3 shrink-0" />
				) : (
					<ChevronDown className="h-3 w-3 shrink-0" />
				)}
				<Wrench className="h-3 w-3 shrink-0" />
				<span className="font-semibold truncate">{block.toolName ?? "tool"}</span>
				{block.type === "tool_result" && block.durationMs !== undefined && (
					<span className="ml-1 text-[10px] text-muted-foreground/60">{block.durationMs}ms</span>
				)}
				<span
					className={`ml-auto shrink-0 rounded px-1 text-[9px] font-bold uppercase tracking-wider ${
						block.type === "tool_call"
							? "bg-blue-500/20 text-blue-400"
							: "bg-emerald-500/20 text-emerald-400"
					}`}
				>
					{block.type === "tool_call" ? "call" : "result"}
				</span>
			</button>

			{!collapsed && (
				<div className="border-t border-border/40 px-2 py-1.5 text-[10px] text-muted-foreground">
					{block.type === "tool_call" && block.toolInput !== undefined && (
						<pre className="whitespace-pre-wrap break-all">
							{JSON.stringify(block.toolInput, null, 2)}
						</pre>
					)}
					{block.type === "tool_result" && block.toolResult !== undefined && (
						<pre className="whitespace-pre-wrap break-all">
							{JSON.stringify(block.toolResult, null, 2)}
						</pre>
					)}
				</div>
			)}
		</div>
	);
}

export const AgentChatToolBlock = memo(AgentChatToolBlockInner, (prev, next) => {
	if (prev.block.id !== next.block.id) return false;
	if (prev.block.isCollapsed !== next.block.isCollapsed) return false;
	if (prev.block.toolResult !== next.block.toolResult) return false;
	return true;
});
