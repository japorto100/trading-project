"use client";

import {
	Activity,
	BrainCircuit,
	Minus,
	TrendingDown,
	TrendingUp,
	Volume2,
	Waves,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MemoryStatusBadge } from "@/features/memory/MemoryStatusBadge";
import type { CompositeSignalInsights } from "@/features/trading/types";

interface SignalInsightsBarProps {
	lineState: "above" | "below" | "neutral";
	sma50: number | null;
	lastCrossLabel: string;
	rvol: number | null;
	cmf: number | null;
	obv: number | null;
	heartbeatScore: number;
	heartbeatCycleBars: number | null;
	atr: number | null;
	compositeSignal: CompositeSignalInsights | null;
}

function metricBadgeTone(value: number): string {
	if (value > 0) return "text-success bg-success/10 border-success/20";
	if (value < 0) return "text-error bg-error/10 border-error/20";
	return "text-muted-foreground bg-muted/20 border-border/50";
}

export function SignalInsightsBar({
	lineState,
	sma50: _sma50,
	lastCrossLabel,
	rvol,
	cmf,
	obv: _obv,
	heartbeatScore,
	heartbeatCycleBars: _heartbeatCycleBars,
	atr,
	compositeSignal,
}: SignalInsightsBarProps) {
	return (
		<div className="mx-3 mt-2 rounded-xl border border-border/50 bg-background/40 backdrop-blur-md px-4 py-3 flex flex-wrap gap-6 items-center shadow-sm">
			{/* Trend Regime */}
			<div className="flex flex-col gap-1.5 min-w-[200px]">
				<div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
					<Activity className="h-3 w-3" /> Trend Regime
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className={`h-6 px-2 gap-1 rounded-md border ${
							lineState === "above"
								? "bg-success/10 text-success border-success/20 shadow-[0_0_10px_oklch(0.696_0.17_162.48/0.2)]"
								: lineState === "below"
									? "bg-error/10 text-error border-error/20"
									: "bg-muted/20 text-muted-foreground border-border/50"
						}`}
					>
						{lineState === "above" ? (
							<TrendingUp className="h-3 w-3" />
						) : lineState === "below" ? (
							<TrendingDown className="h-3 w-3" />
						) : (
							<Minus className="h-3 w-3" />
						)}
						SMA50 {lineState}
					</Badge>
					<span className="text-[11px] text-muted-foreground font-mono">
						Cross: {lastCrossLabel.split(" ")[0]}
					</span>
				</div>
			</div>

			<div className="w-[1px] h-8 bg-border/40 hidden md:block" />

			{/* Momentum & Volume */}
			<div className="flex flex-col gap-1.5 min-w-[200px]">
				<div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
					<Volume2 className="h-3 w-3" /> Volume Flow
				</div>
				<div className="flex items-center gap-2 text-[11px]">
					<div
						className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${rvol === null ? "bg-muted/20 border-border/50 text-muted-foreground" : metricBadgeTone(rvol - 1)}`}
					>
						<span className="opacity-70">RVOL</span>
						<span className="font-mono font-bold">{rvol === null ? "n/a" : rvol.toFixed(2)}x</span>
					</div>
					<div
						className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${cmf === null ? "bg-muted/20 border-border/50 text-muted-foreground" : metricBadgeTone(cmf)}`}
					>
						<span className="opacity-70">CMF</span>
						<span className="font-mono font-bold">{cmf === null ? "n/a" : cmf.toFixed(2)}</span>
					</div>
					<div className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-muted/20 border-border/50 text-muted-foreground">
						<span className="opacity-70">ATR</span>
						<span className="font-mono">{atr === null ? "n/a" : atr.toFixed(2)}</span>
					</div>
				</div>
			</div>

			<div className="w-[1px] h-8 bg-border/40 hidden lg:block" />

			{/* Market Rhythm / AI */}
			<div className="flex flex-col gap-1.5 flex-1">
				<div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
					<BrainCircuit className="h-3 w-3" /> AI & Rhythm
				</div>
				<div className="flex items-center gap-2 text-[11px]">
					<div
						className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${
							heartbeatScore >= 0.7
								? "bg-success/10 text-success border-success/20"
								: heartbeatScore >= 0.4
									? "bg-amber-500/10 text-amber-500 border-amber-500/20"
									: "bg-muted/20 text-muted-foreground border-border/50"
						}`}
					>
						<Waves className="h-3 w-3" />
						<span>Rhythm: {(heartbeatScore * 100).toFixed(0)}%</span>
					</div>

					{compositeSignal && (
						<div
							className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${
								compositeSignal.signal === "buy"
									? "bg-success/10 text-success border-success/30 shadow-[0_0_15px_oklch(0.696_0.17_162.48/0.3)]"
									: compositeSignal.signal === "sell"
										? "bg-error/10 text-error border-error/30"
										: "bg-muted/20 text-muted-foreground border-border/50"
							}`}
						>
							{compositeSignal.signal} {(compositeSignal.confidence * 100).toFixed(0)}%
						</div>
					)}

					<MemoryStatusBadge />
				</div>
			</div>
		</div>
	);
}

export default SignalInsightsBar;
