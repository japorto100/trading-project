"use client";

import { cn } from "@/lib/utils";

export type GeoPanelRuntimeStatus = "live" | "cached" | "degraded" | "unavailable";

interface GeoPanelStatusBadgeProps {
	status: GeoPanelRuntimeStatus;
	label?: string;
}

const STATUS_STYLES: Record<GeoPanelRuntimeStatus, string> = {
	live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
	cached: "border-sky-500/30 bg-sky-500/10 text-sky-300",
	degraded: "border-amber-500/30 bg-amber-500/10 text-amber-300",
	unavailable: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export function GeoPanelStatusBadge({ status, label }: GeoPanelStatusBadgeProps) {
	return (
		<span
			className={cn(
				"rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
				STATUS_STYLES[status],
			)}
		>
			{label ?? status}
		</span>
	);
}
