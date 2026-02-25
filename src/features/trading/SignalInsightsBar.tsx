"use client";

import { Badge } from "@/components/ui/badge";
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
	if (value > 0) return "text-emerald-500 border-emerald-500/40";
	if (value < 0) return "text-red-500 border-red-500/40";
	return "text-muted-foreground border-border";
}

export function SignalInsightsBar({
	lineState,
	sma50,
	lastCrossLabel,
	rvol,
	cmf,
	obv,
	heartbeatScore,
	heartbeatCycleBars,
	atr,
	compositeSignal,
}: SignalInsightsBarProps) {
	return (
		<div className="mx-3 mt-2 rounded-md border border-border bg-card/30 px-3 py-2">
			<div className="mb-2 flex items-center justify-between gap-2">
				<div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
					Market Context
				</div>
				<div className="text-[10px] text-muted-foreground">Signal + regime snapshots</div>
			</div>
			<div className="flex flex-wrap items-center gap-1.5 text-xs">
				<Badge
					variant="outline"
					className={
						lineState === "above"
							? "text-emerald-500 border-emerald-500/40"
							: lineState === "below"
								? "text-red-500 border-red-500/40"
								: "text-muted-foreground border-border"
					}
				>
					Line (Daily SMA50): {lineState}
				</Badge>
				<Badge variant="outline" className="border-border text-muted-foreground">
					SMA50: {sma50 === null ? "n/a" : sma50.toFixed(2)}
				</Badge>
				<Badge variant="outline" className="border-border text-muted-foreground">
					Last Cross: {lastCrossLabel}
				</Badge>
				<Badge
					variant="outline"
					className={
						rvol === null ? "border-border text-muted-foreground" : metricBadgeTone(rvol - 1)
					}
				>
					RVOL: {rvol === null ? "n/a" : rvol.toFixed(2)}x
				</Badge>
				<Badge
					variant="outline"
					className={cmf === null ? "border-border text-muted-foreground" : metricBadgeTone(cmf)}
				>
					CMF: {cmf === null ? "n/a" : cmf.toFixed(3)}
				</Badge>
				<Badge
					variant="outline"
					className={obv === null ? "border-border text-muted-foreground" : metricBadgeTone(obv)}
				>
					OBV: {obv === null ? "n/a" : Math.round(obv).toLocaleString()}
				</Badge>
				<Badge
					variant="outline"
					className={
						heartbeatScore >= 0.7
							? "text-emerald-500 border-emerald-500/40"
							: heartbeatScore >= 0.4
								? "text-amber-500 border-amber-500/40"
								: "text-muted-foreground border-border"
					}
				>
					Rhythm: {(heartbeatScore * 100).toFixed(0)}%
					{heartbeatCycleBars ? ` (~${heartbeatCycleBars.toFixed(1)} bars)` : ""}
				</Badge>
				<Badge
					variant="outline"
					className={
						atr === null
							? "border-border text-muted-foreground"
							: "border-orange-500/40 text-orange-500"
					}
				>
					ATR: {atr === null ? "n/a" : atr.toFixed(3)}
				</Badge>
				{compositeSignal ? (
					<>
						<Badge
							variant="outline"
							className={
								compositeSignal.signal === "buy"
									? "text-emerald-500 border-emerald-500/40"
									: compositeSignal.signal === "sell"
										? "text-red-500 border-red-500/40"
										: "text-muted-foreground border-border"
							}
							title="Go -> Python -> Rust composite signal (Phase 2 slice)"
						>
							Composite: {compositeSignal.signal} ({(compositeSignal.confidence * 100).toFixed(0)}%)
						</Badge>
						<Badge
							variant="outline"
							className={
								compositeSignal.sma50SlopeScore === null
									? "border-border text-muted-foreground"
									: metricBadgeTone(compositeSignal.sma50SlopeScore - 0.5)
							}
							title="Composite SMA50 slope subscore"
						>
							SMA50 Slope*:{" "}
							{compositeSignal.sma50SlopeScore === null
								? "n/a"
								: `${(compositeSignal.sma50SlopeScore * 100).toFixed(0)}%`}
							{compositeSignal.sma50SlopeEngine ? ` (${compositeSignal.sma50SlopeEngine})` : ""}
						</Badge>
						<Badge
							variant="outline"
							className={
								compositeSignal.heartbeatScore === null
									? "border-border text-muted-foreground"
									: metricBadgeTone(compositeSignal.heartbeatScore - 0.5)
							}
							title="Composite heartbeat subscore"
						>
							Heartbeat*:{" "}
							{compositeSignal.heartbeatScore === null
								? "n/a"
								: `${(compositeSignal.heartbeatScore * 100).toFixed(0)}%`}
						</Badge>
						<Badge
							variant="outline"
							className={
								compositeSignal.volumePowerScore === null
									? "border-border text-muted-foreground"
									: metricBadgeTone(compositeSignal.volumePowerScore - 0.5)
							}
							title="Composite smart-money / volume power subscore"
						>
							Smart Money*:{" "}
							{compositeSignal.volumePowerScore === null
								? "n/a"
								: `${(compositeSignal.volumePowerScore * 100).toFixed(0)}%`}
						</Badge>
					</>
				) : null}
			</div>
		</div>
	);
}

export default SignalInsightsBar;
