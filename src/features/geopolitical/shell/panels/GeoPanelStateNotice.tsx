"use client";

import { cn } from "@/lib/utils";

type GeoPanelStateTone = "error" | "warning" | "neutral";

interface GeoPanelStateNoticeProps {
	message: string;
	tone?: GeoPanelStateTone;
	onRetry?: () => void;
	retryLabel?: string;
}

const TONE_STYLES: Record<GeoPanelStateTone, string> = {
	error: "border-rose-500/40 bg-rose-500/10 text-rose-200",
	warning: "border-amber-500/40 bg-amber-500/10 text-amber-200",
	neutral: "border-border bg-background text-muted-foreground",
};

export function GeoPanelStateNotice({
	message,
	tone = "neutral",
	onRetry,
	retryLabel = "Retry",
}: GeoPanelStateNoticeProps) {
	return (
		<div className={cn("rounded-md border px-3 py-2 text-xs", TONE_STYLES[tone])}>
			<div className="flex items-center justify-between gap-3">
				<p>{message}</p>
				{onRetry ? (
					<button
						type="button"
						className="shrink-0 rounded border border-current/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
						onClick={onRetry}
					>
						{retryLabel}
					</button>
				) : null}
			</div>
		</div>
	);
}
