"use client";

// AC70: Stream status rail — live/degraded/reconnecting badge + latency + provider label
// No backend required for status badge; provider label from SSE metadata when available.

import { Activity } from "lucide-react";

export type RailStatus = "idle" | "live" | "degraded" | "reconnecting";

interface AgentChatEventRailProps {
	status: RailStatus;
	/** ms since last chunk — shown during active streaming */
	lastChunkMs?: number;
	/** Provider label from SSE metadata */
	provider?: string;
	isStreaming: boolean;
}

const STATUS_CONFIG: Record<RailStatus, { label: string; dot: string }> = {
	idle: { label: "idle", dot: "bg-muted-foreground/40" },
	live: { label: "live", dot: "bg-emerald-500 animate-pulse" },
	degraded: { label: "degraded", dot: "bg-orange-500" },
	reconnecting: { label: "reconnecting", dot: "bg-amber-500 animate-pulse" },
};

export function AgentChatEventRail({
	status,
	lastChunkMs,
	provider,
	isStreaming,
}: AgentChatEventRailProps) {
	const { label, dot } = STATUS_CONFIG[status];
	const showLatency = isStreaming && lastChunkMs !== undefined && lastChunkMs < 30_000;

	return (
		<div className="flex items-center gap-2 px-3 py-0.5 border-b border-border/30 bg-muted/20 shrink-0">
			<Activity className="h-2.5 w-2.5 text-muted-foreground/40" />
			<div className={`h-1.5 w-1.5 rounded-full ${dot}`} />
			<span className="text-[9px] text-muted-foreground/60 font-mono">{label}</span>
			{showLatency && (
				<span className="text-[9px] text-muted-foreground/40 font-mono">+{lastChunkMs}ms</span>
			)}
			{provider && (
				<span className="ml-auto text-[9px] text-muted-foreground/40 font-mono truncate">
					{provider}
				</span>
			)}
		</div>
	);
}
