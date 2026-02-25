"use client";

import { BarChart3, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { ChartType, DrawingType } from "@/chart/types";
import { DrawingToolbar } from "@/components/DrawingToolbar";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import { SignalInsightsBar } from "@/features/trading/SignalInsightsBar";
import type { CompositeSignalInsights, LayoutMode, SignalSnapshot } from "@/features/trading/types";
import type { HistoryRangePreset } from "@/lib/history-range";
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
	compositeSignalInsights: CompositeSignalInsights | null;
	loading: boolean;
	candleData: OHLCVData[];
	indicators: IndicatorSettings;
	isDarkMode: boolean;
	chartType: ChartType;
	layout: LayoutMode;
	historyRangePreset: HistoryRangePreset;
	customStartYear: number;
	minimumStartYear: number;
	effectiveStartYear: number;
	onHistoryRangeChange: (preset: HistoryRangePreset) => void;
	onCustomStartYearChange: (year: number) => void;
}

type DrawingCommand = {
	kind: "undo" | "redo" | "clear";
	nonce: number;
};

export function TradingWorkspace({
	showDrawingToolbar,
	dataStatusMessage,
	signalSnapshot,
	compositeSignalInsights,
	loading,
	candleData,
	indicators,
	isDarkMode,
	chartType,
	layout,
	historyRangePreset,
	customStartYear,
	minimumStartYear,
	effectiveStartYear,
	onHistoryRangeChange,
	onCustomStartYearChange,
}: TradingWorkspaceProps) {
	const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingType | null>(null);
	const [drawingsLocked, setDrawingsLocked] = useState(false);
	const [drawingsVisible, setDrawingsVisible] = useState(true);
	const [magnetMode, setMagnetMode] = useState<"normal" | "weak" | "strong">("normal");
	const [drawingCommand, setDrawingCommand] = useState<DrawingCommand | null>(null);
	const [canUndoDrawings, setCanUndoDrawings] = useState(false);
	const [canRedoDrawings, setCanRedoDrawings] = useState(false);

	return (
		<main className="flex-1 flex flex-col overflow-hidden bg-background" data-layout={layout}>
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
				compositeSignal={compositeSignalInsights}
			/>
			{layout !== "single" ? (
				<div className="mx-3 mt-2 rounded-md border border-dashed border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
					Multi-chart layouts ({layout}) are not implemented yet. The workspace currently renders a
					single chart.
				</div>
			) : null}

			<div className="flex-1 flex min-h-0 relative">
				{showDrawingToolbar && (
					<DrawingToolbar
						activeTool={activeDrawingTool ?? undefined}
						onToolChange={setActiveDrawingTool}
						locked={drawingsLocked}
						onLockChange={setDrawingsLocked}
						visible={drawingsVisible}
						onVisibleChange={setDrawingsVisible}
						magnetMode={magnetMode}
						onMagnetModeChange={setMagnetMode}
						canUndo={canUndoDrawings}
						canRedo={canRedoDrawings}
						onUndo={() => setDrawingCommand({ kind: "undo", nonce: Date.now() })}
						onRedo={() => setDrawingCommand({ kind: "redo", nonce: Date.now() })}
						onDeleteAll={() => setDrawingCommand({ kind: "clear", nonce: Date.now() })}
					/>
				)}

				<div className="flex-1 min-h-0 relative">
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
							activeDrawingTool={activeDrawingTool}
							drawingsLocked={drawingsLocked}
							drawingsVisible={drawingsVisible}
							magnetMode={magnetMode}
							drawingCommand={drawingCommand}
							onDrawingHistoryChange={(state) => {
								setCanUndoDrawings(state.canUndo);
								setCanRedoDrawings(state.canRedo);
							}}
							historyRangePreset={historyRangePreset}
							customStartYear={customStartYear}
							minimumStartYear={minimumStartYear}
							effectiveStartYear={effectiveStartYear}
							onHistoryRangeChange={onHistoryRangeChange}
							onCustomStartYearChange={onCustomStartYearChange}
						/>
					) : (
						<div className="flex items-center justify-center h-full">
							<p className="text-muted-foreground">No data available</p>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}

export default TradingWorkspace;
