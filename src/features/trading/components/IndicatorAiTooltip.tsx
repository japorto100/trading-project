"use client";

// AC95: Single-shot AI explanation on hover over indicator badges (RSI/BB/RVOL/CMF/ATR/Rhythm).
// Uses useCompletion — no thread state, fires once per hover, cancels on mouse-leave.

import { useCompletion } from "@ai-sdk/react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useCallback, useRef } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface IndicatorAiTooltipProps {
	/** Short label shown in the badge, e.g. "RVOL" */
	label: string;
	/** Formatted value shown in the badge, e.g. "1.43x" */
	value: string;
	/** Natural-language prompt fed to the AI, e.g. "RVOL=1.43 (relative volume)" */
	prompt: string;
	children: React.ReactNode;
}

export function IndicatorAiTooltip({ prompt, children }: IndicatorAiTooltipProps) {
	const firedRef = useRef(false);

	const { complete, completion, isLoading, error } = useCompletion({
		api: "/api/agent/completion",
	});

	const handleOpen = useCallback(
		(open: boolean) => {
			if (open && !firedRef.current && !completion) {
				firedRef.current = true;
				void complete(prompt);
			}
			if (!open) {
				firedRef.current = false;
			}
		},
		[complete, completion, prompt],
	);

	return (
		<HoverCard openDelay={600} closeDelay={100} onOpenChange={handleOpen}>
			<HoverCardTrigger asChild>{children}</HoverCardTrigger>
			<HoverCardContent
				side="top"
				className="w-[280px] p-3 text-[11px] leading-relaxed text-muted-foreground"
			>
				{isLoading && !completion ? (
					<span className="flex items-center gap-1.5 text-muted-foreground/60">
						<Loader2 className="h-3 w-3 animate-spin" />
						Analysiere…
					</span>
				) : error ? (
					<span className="text-error/70">AI nicht verfügbar</span>
				) : completion ? (
					<>
						<div className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary/70">
							<BrainCircuit className="h-3 w-3" />
							AI Insight
						</div>
						<p>{completion}</p>
					</>
				) : null}
			</HoverCardContent>
		</HoverCard>
	);
}
