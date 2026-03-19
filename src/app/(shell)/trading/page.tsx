"use client";

import { useSearchParams } from "next/navigation";
import {
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ChartType } from "@/chart/types";
import { CommandPalette } from "@/components/CommandPalette";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";
import { BottomStats } from "@/features/trading/BottomStats";
import { DEFAULT_INDICATORS } from "@/features/trading/constants";
import { useChartData } from "@/features/trading/hooks/useChartData";
import { useCompositeSignal } from "@/features/trading/hooks/useCompositeSignal";
import { useDailySignalData } from "@/features/trading/hooks/useDailySignalData";
import { useMarketStream } from "@/features/trading/hooks/useMarketStream";
import { usePreferencesSync } from "@/features/trading/hooks/usePreferencesSync";
import { useReplayMode } from "@/features/trading/hooks/useReplayMode";
import { useSignalSnapshot } from "@/features/trading/hooks/useSignalSnapshot";
import { useStreamClock } from "@/features/trading/hooks/useStreamClock";
import { useWatchlist } from "@/features/trading/hooks/useWatchlist";
import { useWorkspaceLayout } from "@/features/trading/hooks/useWorkspaceLayout";
import { RightDetailsSidebar } from "@/features/trading/RightDetailsSidebar";
import { SidebarToggles } from "@/features/trading/SidebarToggles";
import { StatusBar } from "@/features/trading/StatusBar";
import { useTradingWorkspaceStore } from "@/features/trading/store/tradingWorkspaceStore";
import { TradingHeader } from "@/features/trading/TradingHeader";
import { TradingPageSkeleton } from "@/features/trading/TradingPageSkeleton";
import { TradingWorkspace } from "@/features/trading/TradingWorkspace";
import { WatchlistSidebar } from "@/features/trading/WatchlistSidebar";
import { buildTradingContext } from "@/lib/chat-context-builders";
import { getDefaultStartYear } from "@/lib/fusion-symbols";
import type { HistoryRangePreset } from "@/lib/history-range";
import { clampStartYearForSymbol } from "@/lib/history-range";
import type { TimeframeValue } from "@/lib/providers/types";
import { parseTradingWorkspaceFocus } from "@/lib/trading-entry";

function TradingDashboard() {
	const searchParams = useSearchParams();
	// ─── Client-side guard ────────────────────────────────────────────────────
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	// ─── Domain workspace state (Zustand) ────────────────────────────────────
	const { currentSymbol, favorites, layout, setCurrentSymbol, setLayout, setFavorites } =
		useTradingWorkspaceStore();

	// ─── Chat context injection (AC87) ────────────────────────────────────────
	const { open: chatOpen, setChatContext } = useGlobalChat();
	const prevChatOpenRef = useRef(false);

	// ─── UI state ────────────────────────────────────────────────────────────
	const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeValue>("1H");
	const [historyRangePreset, setHistoryRangePreset] = useState<HistoryRangePreset>("1Y");
	const [customStartYear, setCustomStartYear] = useState<number>(() =>
		getDefaultStartYear(currentSymbol),
	);
	const [chartType, setChartType] = useState<ChartType>("candlestick");
	const [indicators, setIndicators] = useState<IndicatorSettings>(DEFAULT_INDICATORS);
	const [compareSymbol, setCompareSymbol] = useState<string | null>(null);
	const [dataStatusMessage, setDataStatusMessage] = useState<string | null>(null);

	// ─── Layout & workspace ───────────────────────────────────────────────────
	const {
		sidebarOpen,
		rightSidebarOpen,
		activeSidebarPanel,
		setActiveSidebarPanel,
		setRightSidebarOpen,
		toggleLeft,
		toggleRight,
	} = useWorkspaceLayout(currentSymbol.symbol);
	const focusPanel = parseTradingWorkspaceFocus(searchParams.get("focus"));

	useEffect(() => {
		if (!focusPanel) return;
		setActiveSidebarPanel(focusPanel);
		setRightSidebarOpen(true);
	}, [focusPanel, setActiveSidebarPanel, setRightSidebarOpen]);

	// ─── Chart data (TanStack Query) ──────────────────────────────────────────
	const {
		candleData,
		dataMode,
		dataProvider,
		dataStatusMessage: chartStatusMsg,
		isLoading,
		refetch,
		historyWindow,
	} = useChartData(currentSymbol, currentTimeframe, historyRangePreset, customStartYear);

	// ─── Streaming clock ──────────────────────────────────────────────────────
	const streamClockMs = useStreamClock();

	const ohlcvQueryKey = useMemo(
		() => [
			"ohlcv",
			currentSymbol.symbol,
			currentTimeframe,
			historyWindow.startEpoch,
			historyWindow.requestLimit,
		],
		[currentSymbol.symbol, currentTimeframe, historyWindow.startEpoch, historyWindow.requestLimit],
	);

	// ─── Replay (must precede useMarketStream to provide enabled flag) ────────
	const {
		replayMode,
		replayPlaying,
		replayIndex,
		viewCandleData,
		toggleReplayMode,
		toggleReplayPlaying,
		resetReplay,
		seekReplay,
	} = useReplayMode(candleData);

	// ─── Streaming ────────────────────────────────────────────────────────────
	const { streamState, streamReconnects, streamLastTickAt } = useMarketStream({
		symbol: currentSymbol.symbol,
		timeframe: currentTimeframe,
		requestLimit: historyWindow.requestLimit,
		enabled: mounted && !replayMode,
		onStatusMessage: setDataStatusMessage,
		onSetDataProvider: () => {},
		onSetDataMode: () => {},
		ohlcvQueryKey,
	});

	// ─── Signal data (TanStack Query) ─────────────────────────────────────────
	const dailySignalData = useDailySignalData(currentSymbol);
	const compositeSignalInsights = useCompositeSignal(viewCandleData);

	// ─── Computed signal snapshot ─────────────────────────────────────────────
	const signalSnapshot = useSignalSnapshot(viewCandleData, dailySignalData, indicators);

	// ─── Preferences sync ─────────────────────────────────────────────────────
	usePreferencesSync({
		mounted,
		favorites,
		layout,
		sidebarOpen,
		showDrawingToolbar: true,
		onHydrated: (hydratedFavorites, hydratedLayout) => {
			setFavorites(hydratedFavorites);
			setLayout(hydratedLayout);
		},
	});

	// ─── Watchlist ────────────────────────────────────────────────────────────
	const {
		searchQuery,
		showSearch,
		activeTab,
		searchPending,
		filteredSymbols,
		popularSymbols,
		watchlistSymbols,
		setSearchQuery,
		setShowSearch,
		setActiveTab,
		clearSearch,
	} = useWatchlist(favorites);

	// ─── Indicator patch handler ──────────────────────────────────────────────
	const handleIndicatorsChange = useCallback(
		(patch: Partial<IndicatorSettings>) => setIndicators((prev) => ({ ...prev, ...patch })),
		[],
	);

	// ─── Handlers ────────────────────────────────────────────────────────────
	const handleSymbolChange = useCallback(
		(symbol: typeof currentSymbol) => {
			setCurrentSymbol(symbol);
			setCustomStartYear((prev) => clampStartYearForSymbol(prev, symbol));
			clearSearch();
		},
		[setCurrentSymbol, clearSearch],
	);

	const handleCustomStartYearChange = useCallback(
		(year: number) => setCustomStartYear(clampStartYearForSymbol(year, currentSymbol)),
		[currentSymbol],
	);

	const handleExport = useCallback(() => {
		const canvas = document.querySelector("canvas");
		if (canvas) {
			const link = document.createElement("a");
			link.download = `${currentSymbol.symbol}_${new Date().toISOString().split("T")[0]}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
		}
	}, [currentSymbol]);

	const handleFullscreen = useCallback(() => {
		if (document.fullscreenElement) document.exitFullscreen();
		else document.documentElement.requestFullscreen();
	}, []);

	// ─── Derived display values ───────────────────────────────────────────────
	const stats = useMemo(() => {
		if (viewCandleData.length === 0)
			return { change: 0, percent: 0, high24h: 0, low24h: 0, volume24h: 0, lastPrice: 0 };
		const last = viewCandleData[viewCandleData.length - 1];
		const prev = viewCandleData[viewCandleData.length - 2] ?? last;
		const change = last.close - prev.close;
		const percent = prev.close > 0 ? (change / prev.close) * 100 : 0;
		const recent = viewCandleData.slice(-Math.min(24, viewCandleData.length));
		return {
			change,
			percent,
			high24h: Math.max(...recent.map((c) => c.high)),
			low24h: Math.min(...recent.map((c) => c.low)),
			volume24h: recent.reduce((sum, c) => sum + c.volume, 0),
			lastPrice: last.close,
		};
	}, [viewCandleData]);

	const streamLastTickAgeSec = useMemo(() => {
		if (!streamLastTickAt) return null;
		return Math.max(0, Math.floor((streamClockMs - streamLastTickAt) / 1000));
	}, [streamClockMs, streamLastTickAt]);

	const streamAgeLabel =
		streamLastTickAgeSec === null ? "No tick yet" : `${streamLastTickAgeSec}s since tick`;

	const effectiveStatusMessage = dataStatusMessage ?? chartStatusMsg;

	// AC87: inject trading context when chat opens (transition false→true only)
	useEffect(() => {
		if (chatOpen && !prevChatOpenRef.current) {
			setChatContext(
				buildTradingContext(currentSymbol, currentTimeframe, stats, signalSnapshot.lineState),
			);
		}
		prevChatOpenRef.current = chatOpen;
	}, [chatOpen, currentSymbol, currentTimeframe, stats, signalSnapshot.lineState, setChatContext]);

	if (!mounted) return <TradingPageSkeleton />;

	// ─── Render ───────────────────────────────────────────────────────────────
	return (
		<div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
			<TradingHeader
				searchQuery={searchQuery}
				searchPending={searchPending}
				showSearch={showSearch}
				filteredSymbols={filteredSymbols}
				popularSymbols={popularSymbols}
				currentTimeframe={currentTimeframe}
				chartType={chartType}
				compareSymbol={compareSymbol}
				indicators={indicators}
				loading={isLoading}
				supportedLayouts={["single"]}
				onQueryChange={setSearchQuery}
				onOpenSearchChange={setShowSearch}
				onSelectSymbol={handleSymbolChange}
				onTimeframeChange={setCurrentTimeframe}
				onChartTypeChange={setChartType}
				onCompare={setCompareSymbol}
				onIndicatorsChange={setIndicators}
				onRefresh={refetch}
				onExport={handleExport}
				onFullscreen={handleFullscreen}
				replayMode={replayMode}
				replayPlaying={replayPlaying}
				replayIndex={replayIndex}
				replayMax={candleData.length}
				onToggleReplayMode={toggleReplayMode}
				onToggleReplayPlaying={toggleReplayPlaying}
				onResetReplay={resetReplay}
				onSeekReplay={seekReplay}
			/>

			<StatusBar
				dataMode={dataMode}
				dataProvider={dataProvider}
				streamState={streamState}
				streamAgeLabel={streamAgeLabel}
				streamReconnects={streamReconnects}
				replayMode={replayMode}
				replayPlaying={replayPlaying}
			/>

			<div className="flex-1 flex overflow-hidden relative">
				<PanelGroup direction="horizontal" className="flex-1">
					{sidebarOpen && (
						<>
							<Panel defaultSize={20} minSize={15} maxSize={30}>
								<WatchlistSidebar
									activeTab={activeTab}
									watchlistSymbols={watchlistSymbols}
									onSetActiveTab={setActiveTab}
									onSelectSymbol={handleSymbolChange}
								/>
							</Panel>
							<PanelResizeHandle className="w-1 bg-border/50 hover:bg-emerald-500/50 transition-colors" />
						</>
					)}

					<Panel minSize={40}>
						<div className="flex-1 flex flex-col h-full overflow-hidden">
							<TradingWorkspace
								showDrawingToolbar
								dataStatusMessage={effectiveStatusMessage}
								signalSnapshot={signalSnapshot}
								compositeSignalInsights={compositeSignalInsights}
								loading={isLoading}
								candleData={viewCandleData}
								indicators={indicators}
								chartType={chartType}
								layout={layout}
								historyRangePreset={historyRangePreset}
								customStartYear={customStartYear}
								minimumStartYear={clampStartYearForSymbol(customStartYear, currentSymbol)}
								effectiveStartYear={historyWindow.effectiveStartYear}
								onHistoryRangeChange={setHistoryRangePreset}
								onCustomStartYearChange={handleCustomStartYearChange}
								symbol={currentSymbol.symbol}
								timeframe={currentTimeframe}
							/>
							<BottomStats stats={stats} />
						</div>
					</Panel>

					{rightSidebarOpen && (
						<>
							<PanelResizeHandle className="w-1 bg-border/50 hover:bg-emerald-500/50 transition-colors" />
							<Panel defaultSize={25} minSize={20} maxSize={40}>
								<RightDetailsSidebar
									activePanel={activeSidebarPanel}
									currentSymbol={currentSymbol.symbol}
									currentPrice={stats.lastPrice}
									candleData={viewCandleData}
									indicators={indicators}
									onSetActivePanel={setActiveSidebarPanel}
									onClose={() => toggleRight()}
									onIndicatorsChange={handleIndicatorsChange}
								/>
							</Panel>
						</>
					)}
				</PanelGroup>

				<SidebarToggles
					sidebarOpen={sidebarOpen}
					rightSidebarOpen={rightSidebarOpen}
					onToggleLeft={toggleLeft}
					onToggleRight={toggleRight}
				/>

				{/* Trading-spezifische CommandPalette-Erweiterung: Symbol + Timeframe */}
				<CommandPalette
					onSymbolChange={handleSymbolChange}
					onTimeframeChange={setCurrentTimeframe}
				/>
			</div>
		</div>
	);
}

export default function TradingPage() {
	return (
		<Suspense fallback={null}>
			<TradingDashboard />
		</Suspense>
	);
}
