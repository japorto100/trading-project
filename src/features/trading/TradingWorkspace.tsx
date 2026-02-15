"use client";

import { BarChart3, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import type { ChartType } from "@/chart/types";
import { DrawingToolbar } from "@/components/DrawingToolbar";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import { Button } from "@/components/ui/button";
import { SignalInsightsBar } from "@/features/trading/SignalInsightsBar";
import type { LayoutMode, SignalSnapshot } from "@/features/trading/types";
import type { OHLCVData } from "@/lib/providers/types";

const TradingChart = dynamic(
	() => import("@/components/TradingChart").then((mod) => mod.TradingChart),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg">
				<div className="text-center">
					<BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
					<p className="text-slate-400">Loading chart...</p>
				</div>
			</div>
		),
	},
);

interface TradingWorkspaceProps {
	showDrawingToolbar: boolean;
	dataStatusMessage: string | null;
	signalSnapshot: SignalSnapshot;
	loading: boolean;
	candleData: OHLCVData[];
	indicators: IndicatorSettings;
	isDarkMode: boolean;
	chartType: ChartType;
	layout: LayoutMode;
	replayMode: boolean;
	replayPlaying: boolean;
	replayIndex: number;
	replayMax: number;
	onToggleReplayMode: () => void;
	onToggleReplayPlaying: () => void;
	onResetReplay: () => void;
	onSeekReplay: (index: number) => void;
}

export function TradingWorkspace({
	showDrawingToolbar,
	dataStatusMessage,
	signalSnapshot,
	loading,
	candleData,
	indicators,
	isDarkMode,
	chartType,
	layout,
	replayMode,
	replayPlaying,
	replayIndex,
	replayMax,
	onToggleReplayMode,
	onToggleReplayPlaying,
	onResetReplay,
	onSeekReplay,
}: TradingWorkspaceProps) {
	return (
		<main className="flex-1 flex flex-col overflow-hidden bg-background" data-layout={layout}>
			{showDrawingToolbar && <DrawingToolbar />}

			<div className="mx-3 mt-2 rounded-md border border-border bg-card/30 px-3 py-2">
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant={replayMode ? "secondary" : "outline"}
						size="sm"
						onClick={onToggleReplayMode}
					>
						Replay {replayMode ? "On" : "Off"}
					</Button>
					{replayMode && (
						<>
							<Button variant="outline" size="sm" onClick={onToggleReplayPlaying}>
								{replayPlaying ? "Pause" : "Play"}
							</Button>
							<Button variant="outline" size="sm" onClick={onResetReplay}>
								Reset
							</Button>
							<div className="flex items-center gap-2 text-xs text-muted-foreground min-w-[220px]">
								<span>
									{replayIndex}/{Math.max(replayMax, 1)}
								</span>
								<input
									type="range"
									min={1}
									max={Math.max(replayMax, 1)}
									value={Math.max(1, replayIndex)}
									onChange={(event) => onSeekReplay(Number(event.target.value))}
									className="w-40"
								/>
							</div>
						</>
					)}
				</div>
			</div>

			{dataStatusMessage && (
				<div className="mx-3 mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
					{dataStatusMessage}
				</div>
			)}

			<SignalInsightsBar
				lineState={signalSnapshot.lineState}
				sma50={signalSnapshot.sma50}
				lastCrossLabel={signalSnapshot.lastCrossLabel}
				rvol={signalSnapshot.rvol}
				cmf={signalSnapshot.cmf}
				obv={signalSnapshot.obv}
				heartbeatScore={signalSnapshot.heartbeatScore}
				heartbeatCycleBars={signalSnapshot.heartbeatCycleBars}
				atr={signalSnapshot.atr}
			/>

			<div className="flex-1 min-h-0">
				{loading ? (
					<div className="flex items-center justify-center h-full">
						<RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
					</div>
				) : candleData.length > 0 ? (
					<TradingChart
						candleData={candleData}
						indicators={indicators}
						isDarkMode={isDarkMode}
						chartType={chartType}
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<p className="text-muted-foreground">No data available</p>
					</div>
				)}
			</div>
		</main>
	);
}

export default TradingWorkspace;
