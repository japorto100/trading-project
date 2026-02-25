"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ChartType } from "@/chart/types";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomStats } from "@/features/trading/BottomStats";
import { RightDetailsSidebar } from "@/features/trading/RightDetailsSidebar";
import { TradingHeader } from "@/features/trading/TradingHeader";
import { TradingPageSkeleton } from "@/features/trading/TradingPageSkeleton";
import { TradingWorkspace } from "@/features/trading/TradingWorkspace";
import type {
	CompositeSignalInsights,
	DataMode,
	LayoutMode,
	SidebarPanel,
	SignalSnapshot,
	WatchlistTab,
} from "@/features/trading/types";
import { useIndicatorActions } from "@/features/trading/useIndicatorActions";
import { WatchlistSidebar } from "@/features/trading/WatchlistSidebar";
import { createNotification } from "@/lib/alerts";
import { generateDemoCandles } from "@/lib/demoData";
import {
	ALL_FUSION_SYMBOLS,
	type FusionSymbol,
	getDefaultStartYear,
	searchFusionSymbols,
	WATCHLIST_CATEGORIES,
} from "@/lib/fusion-symbols";
import {
	buildHistoryWindow,
	clampStartYearForSymbol,
	type HistoryRangePreset,
} from "@/lib/history-range";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import {
	analyzeHeartbeatPattern,
	calculateATR,
	calculateCMF,
	calculateOBV,
	calculateRVOL,
	calculateSMA,
	detectSMACrossEvents,
} from "@/lib/indicators";
import type { OHLCVData, TimeframeValue } from "@/lib/providers/types";
import { readFusionPreferences, writeFusionPreferences } from "@/lib/storage/preferences";
import {
	fetchRemoteFusionPreferences,
	pushRemoteFusionPreferences,
} from "@/lib/storage/preferences-remote";
import { getClientProfileKey } from "@/lib/storage/profile-key";

const DEFAULT_INDICATORS: IndicatorSettings = {
	sma: { enabled: false, period: 20 },
	ema: { enabled: false, period: 20 },
	rsi: { enabled: false, period: 14 },
	macd: { enabled: false },
	bollinger: { enabled: false, period: 20, stdDev: 2 },
	vwap: { enabled: false },
	vwma: { enabled: false, period: 20 },
	atr: { enabled: false, period: 14 },
	atrChannel: { enabled: false, smaPeriod: 50, atrPeriod: 14, multiplier: 1.5 },
	hma: { enabled: false, period: 20 },
	adx: { enabled: false, period: 14 },
	ichimoku: {
		enabled: false,
		tenkanPeriod: 9,
		kijunPeriod: 26,
		senkouBPeriod: 52,
		displacement: 26,
	},
	parabolicSar: { enabled: false, step: 0.02, maxAF: 0.2 },
	keltner: { enabled: false, emaPeriod: 20, atrPeriod: 10, multiplier: 2 },
	volumeProfile: { enabled: false, levels: 20, topN: 6 },
	supportResistance: { enabled: false, lookback: 20, threshold: 0.02, topN: 6 },
};

interface CompositeSignalRouteComponent {
	score?: number;
	details?: Record<string, unknown>;
}

interface CompositeSignalRouteData {
	signal?: "buy" | "sell" | "neutral";
	confidence?: number;
	components?: Record<string, CompositeSignalRouteComponent>;
	timestamp?: number;
}

interface CompositeSignalRouteResponse {
	success?: boolean;
	data?: CompositeSignalRouteData;
	error?: string;
}

function componentScore(
	components: Record<string, CompositeSignalRouteComponent> | undefined,
	key: string,
): number | null {
	const score = components?.[key]?.score;
	return typeof score === "number" && Number.isFinite(score) ? score : null;
}

export default function Home() {
	// State
	const [isDarkMode, setIsDarkMode] = useState(true);
	const [currentSymbol, setCurrentSymbol] = useState<FusionSymbol>(WATCHLIST_CATEGORIES.crypto[0]);
	const [currentTimeframe, setCurrentTimeframe] = useState<TimeframeValue>("1H");
	const [historyRangePreset, setHistoryRangePreset] = useState<HistoryRangePreset>("1Y");
	const [customStartYear, setCustomStartYear] = useState<number>(() =>
		getDefaultStartYear(WATCHLIST_CATEGORIES.crypto[0]),
	);
	const [chartType, setChartType] = useState<ChartType>("candlestick");
	const [indicators, setIndicators] = useState<IndicatorSettings>(DEFAULT_INDICATORS);
	const [candleData, setCandleData] = useState<OHLCVData[]>([]);
	const [dailySignalData, setDailySignalData] = useState<OHLCVData[]>([]);
	const [loading, setLoading] = useState(true);
	const [dataMode, setDataMode] = useState<DataMode>("api");
	const [dataProvider, setDataProvider] = useState("demo");
	const [dataStatusMessage, setDataStatusMessage] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [layout, setLayout] = useState<LayoutMode>(() => readFusionPreferences().layout);
	const [favorites, setFavorites] = useState<string[]>(() => readFusionPreferences().favorites);
	const [activeTab, setActiveTab] = useState<WatchlistTab>("all");
	const [activeSidebarPanel, setActiveSidebarPanel] = useState<SidebarPanel>("indicators");
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
	const [showDrawingToolbar] = useState(true);
	const [compareSymbol, setCompareSymbol] = useState<string | null>(null);
	const [replayMode, setReplayMode] = useState(false);
	const [replayPlaying, setReplayPlaying] = useState(false);
	const [replayIndex, setReplayIndex] = useState(1);
	const [remoteHydrated, setRemoteHydrated] = useState(false);
	const requestSequenceRef = useRef(0);
	const dailySignalRequestRef = useRef(0);
	const lastQuoteBySymbolRef = useRef<Record<string, number>>({});
	const streamDegradedRef = useRef(false);
	const [streamState, setStreamState] = useState<
		"connecting" | "live" | "degraded" | "reconnecting"
	>("connecting");
	const [streamReconnects, setStreamReconnects] = useState(0);
	const [streamLastTickAt, setStreamLastTickAt] = useState<number | null>(null);
	const [streamClockMs, setStreamClockMs] = useState<number>(Date.now());
	const [compositeSignalInsights, setCompositeSignalInsights] =
		useState<CompositeSignalInsights | null>(null);

	// Client-side only check
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
	const debouncedSearchQuery = useDebouncedValue(searchQuery, 180);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle("dark", isDarkMode);
		root.style.colorScheme = isDarkMode ? "dark" : "light";
	}, [isDarkMode]);

	useEffect(() => {
		if (!mounted) {
			return;
		}
		const timer = setInterval(() => {
			setStreamClockMs(Date.now());
		}, 1000);
		return () => clearInterval(timer);
	}, [mounted]);

	const symbolMinimumStartYear = useMemo(() => getDefaultStartYear(currentSymbol), [currentSymbol]);

	const historyWindow = useMemo(
		() =>
			buildHistoryWindow({
				preset: historyRangePreset,
				timeframe: currentTimeframe,
				symbol: currentSymbol,
				customStartYear,
			}),
		[customStartYear, currentSymbol, currentTimeframe, historyRangePreset],
	);

	useEffect(() => {
		setCustomStartYear((prev) => clampStartYearForSymbol(prev, currentSymbol));
	}, [currentSymbol]);

	// Load chart data: API first, demo fallback.
	const loadChartData = useCallback(async () => {
		if (!mounted) {
			return;
		}

		const requestId = ++requestSequenceRef.current;

		setLoading(true);
		setDataStatusMessage(null);

		try {
			const requestEndEpoch = Math.floor(Date.now() / 1000);
			const params = new URLSearchParams({
				symbol: currentSymbol.symbol,
				timeframe: currentTimeframe,
				limit: String(historyWindow.requestLimit),
				start: String(historyWindow.startEpoch),
				end: String(requestEndEpoch),
			});

			const response = await fetch(`/api/market/ohlcv?${params.toString()}`, {
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error(`OHLCV request failed (${response.status})`);
			}

			const payload = (await response.json()) as {
				data?: OHLCVData[];
				provider?: string;
			};
			const rows = Array.isArray(payload.data) ? payload.data : [];

			if (rows.length === 0) {
				throw new Error("OHLCV API returned empty data");
			}

			if (requestId !== requestSequenceRef.current) {
				return;
			}

			const sorted = [...rows].sort((a, b) => a.time - b.time);
			setCandleData(sorted);
			setDataMode("api");
			setDataProvider((payload.provider || "api").toString());
			setDataStatusMessage(
				historyWindow.isCapped
					? `Requested range exceeded bar cap for ${currentTimeframe}; showing latest ${historyWindow.requestLimit} bars.`
					: null,
			);
		} catch (error) {
			if (requestId !== requestSequenceRef.current) {
				return;
			}

			const fallbackCount = Math.min(historyWindow.requestLimit, 4000);
			const fallback = generateDemoCandles(
				currentSymbol,
				currentTimeframe,
				fallbackCount,
			) as OHLCVData[];
			setCandleData(fallback);
			setDataMode("fallback");
			setDataProvider("demo");
			setDataStatusMessage(
				`API failed, switched to demo fallback (${error instanceof Error ? error.message : "unknown error"})`,
			);
		} finally {
			if (requestId === requestSequenceRef.current) {
				setLoading(false);
			}
		}
	}, [
		currentSymbol,
		currentTimeframe,
		historyWindow.isCapped,
		historyWindow.requestLimit,
		historyWindow.startEpoch,
		mounted,
	]);

	// Initial + reactive data load.
	useEffect(() => {
		if (!mounted) {
			return;
		}
		void loadChartData();
	}, [mounted, loadChartData]);

	useEffect(() => {
		if (!mounted || replayMode) {
			return;
		}

		if (typeof window === "undefined" || typeof window.EventSource === "undefined") {
			return;
		}

		const params = new URLSearchParams({
			symbol: currentSymbol.symbol,
			timeframe: currentTimeframe,
			profileKey: getClientProfileKey(),
		});
		setStreamState("connecting");
		setStreamLastTickAt(null);
		const source = new window.EventSource(`/api/market/stream?${params.toString()}`);

		const onReady = () => {
			streamDegradedRef.current = false;
			setStreamState("live");
		};

		const onCandle = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					provider?: string;
					candle?: OHLCVData;
					executionsCount?: number;
				};
				const candle = payload.candle;
				if (
					!candle ||
					!Number.isFinite(candle.time) ||
					!Number.isFinite(candle.open) ||
					!Number.isFinite(candle.high) ||
					!Number.isFinite(candle.low) ||
					!Number.isFinite(candle.close)
				) {
					return;
				}

				setCandleData((prev) => {
					if (prev.length === 0) {
						return prev;
					}

					const next = [...prev];
					const existingIndex = next.findIndex((row) => row.time === candle.time);

					if (existingIndex >= 0) {
						next[existingIndex] = candle;
					} else {
						const last = next[next.length - 1];
						if (!last || candle.time < last.time) {
							return prev;
						}
						next.push(candle);
					}

					const trimmed =
						next.length > historyWindow.requestLimit
							? next.slice(next.length - historyWindow.requestLimit)
							: next;

					return trimmed;
				});

				if (payload.provider) {
					setDataProvider(payload.provider);
				}
				setDataMode("api");

				if (typeof payload.executionsCount === "number" && payload.executionsCount > 0) {
					setDataStatusMessage(
						`${payload.executionsCount} paper order${payload.executionsCount > 1 ? "s" : ""} auto-filled at live price.`,
					);
				}

				if (streamDegradedRef.current) {
					streamDegradedRef.current = false;
					setStreamState("live");
					setDataStatusMessage("Realtime stream reconnected.");
				}
				setStreamLastTickAt(Date.now());
			} catch {
				// ignore malformed stream payloads
			}
		};

		const onSnapshot = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					quote?: { last?: number; timestamp?: number };
					candles?: OHLCVData[];
					candle?: OHLCVData;
				};
				if (Array.isArray(payload.candles) && payload.candles.length > 0) {
					const sorted = [...payload.candles]
						.filter(
							(row) =>
								Number.isFinite(row.time) &&
								Number.isFinite(row.open) &&
								Number.isFinite(row.high) &&
								Number.isFinite(row.low) &&
								Number.isFinite(row.close),
						)
						.sort((a, b) => a.time - b.time);
					if (sorted.length > 0) {
						setCandleData((prev) =>
							prev.length > 0 ? prev : sorted.slice(-historyWindow.requestLimit),
						);
					}
				} else if (payload.candle) {
					const candle = payload.candle;
					setCandleData((prev) => {
						if (prev.length > 0) return prev;
						return [candle];
					});
				}
				if (typeof payload.quote?.last === "number") {
					lastQuoteBySymbolRef.current[currentSymbol.symbol] = payload.quote.last;
					setStreamLastTickAt(Date.now());
				}
			} catch {
				// ignore malformed snapshot payloads
			}
		};

		const onQuote = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as { last?: number; timestamp?: number };
				if (typeof payload.last === "number") {
					lastQuoteBySymbolRef.current[currentSymbol.symbol] = payload.last;
					setStreamLastTickAt(Date.now());
				}
			} catch {
				// ignore malformed quote payloads
			}
		};

		const onAlert = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					ruleId?: string;
					symbol?: string;
					message?: string;
					condition?: string;
					target?: number;
					price?: number;
				};
				const alertSymbol =
					typeof payload.symbol === "string" ? payload.symbol : currentSymbol.symbol;
				const message =
					typeof payload.message === "string" && payload.message.trim().length > 0
						? payload.message
						: `${alertSymbol} alert triggered`;
				if (typeof payload.ruleId === "string" && payload.ruleId.trim().length > 0) {
					createNotification(payload.ruleId, alertSymbol, message);
				}
				setDataStatusMessage(message);
			} catch {
				// ignore malformed alert payloads
			}
		};

		const onError = () => {
			if (!streamDegradedRef.current) {
				streamDegradedRef.current = true;
				setStreamState("degraded");
				setDataStatusMessage("Realtime stream interrupted, retrying...");
			} else {
				setStreamState("reconnecting");
			}
			setStreamReconnects((prev) => prev + 1);
		};

		const onStreamStatus = (event: MessageEvent<string>) => {
			try {
				const payload = JSON.parse(event.data) as {
					state?: string;
					reconnectAttempts?: number;
					lastQuoteAt?: string;
				};
				if (
					typeof payload.reconnectAttempts === "number" &&
					Number.isFinite(payload.reconnectAttempts)
				) {
					setStreamReconnects(payload.reconnectAttempts);
				}
				if (typeof payload.lastQuoteAt === "string" && payload.lastQuoteAt.trim().length > 0) {
					const parsed = Date.parse(payload.lastQuoteAt);
					if (Number.isFinite(parsed)) {
						setStreamLastTickAt(parsed);
					}
				}
				switch (payload.state) {
					case "live":
						setStreamState("live");
						break;
					case "polling_fallback":
						setStreamState("degraded");
						break;
					case "reconnecting":
						setStreamState("reconnecting");
						break;
					default:
						break;
				}
			} catch {
				// ignore malformed stream status payloads
			}
		};

		source.addEventListener("ready", onReady as EventListener);
		source.addEventListener("snapshot", onSnapshot as EventListener);
		source.addEventListener("quote", onQuote as EventListener);
		source.addEventListener("candle", onCandle as EventListener);
		source.addEventListener("alert", onAlert as EventListener);
		source.addEventListener("stream_status", onStreamStatus as EventListener);
		source.addEventListener("error", onError as EventListener);
		source.onerror = onError;

		return () => {
			source.removeEventListener("ready", onReady as EventListener);
			source.removeEventListener("snapshot", onSnapshot as EventListener);
			source.removeEventListener("quote", onQuote as EventListener);
			source.removeEventListener("candle", onCandle as EventListener);
			source.removeEventListener("alert", onAlert as EventListener);
			source.removeEventListener("stream_status", onStreamStatus as EventListener);
			source.removeEventListener("error", onError as EventListener);
			source.close();
		};
	}, [currentSymbol.symbol, currentTimeframe, historyWindow.requestLimit, mounted, replayMode]);

	const streamLastTickAgeSec = useMemo(() => {
		if (!streamLastTickAt) {
			return null;
		}
		return Math.max(0, Math.floor((streamClockMs - streamLastTickAt) / 1000));
	}, [streamClockMs, streamLastTickAt]);

	const loadDailySignalData = useCallback(async () => {
		if (!mounted) {
			return;
		}

		const requestId = ++dailySignalRequestRef.current;

		try {
			const params = new URLSearchParams({
				symbol: currentSymbol.symbol,
				timeframe: "1D",
				limit: "240",
			});

			const response = await fetch(`/api/market/ohlcv?${params.toString()}`, {
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error(`Daily OHLCV request failed (${response.status})`);
			}

			const payload = (await response.json()) as { data?: OHLCVData[] };
			const rows = Array.isArray(payload.data) ? payload.data : [];
			if (rows.length === 0) {
				throw new Error("Daily OHLCV returned empty data");
			}

			if (requestId !== dailySignalRequestRef.current) {
				return;
			}

			setDailySignalData([...rows].sort((a, b) => a.time - b.time));
		} catch {
			if (requestId !== dailySignalRequestRef.current) {
				return;
			}
			setDailySignalData(generateDemoCandles(currentSymbol, "1D", 240) as OHLCVData[]);
		}
	}, [currentSymbol, mounted]);

	useEffect(() => {
		if (!mounted) {
			return;
		}
		void loadDailySignalData();
	}, [mounted, loadDailySignalData]);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		let active = true;
		const hydrateRemotePreferences = async () => {
			try {
				const profileKey = getClientProfileKey();
				const remote = await fetchRemoteFusionPreferences(profileKey);
				if (!active || !remote) {
					return;
				}

				if (Array.isArray(remote.favorites)) {
					setFavorites(remote.favorites);
					writeFusionPreferences({ favorites: remote.favorites });
				}
				if (remote.layout) {
					setLayout(remote.layout);
					writeFusionPreferences({ layout: remote.layout });
				}
			} finally {
				if (active) {
					setRemoteHydrated(true);
				}
			}
		};

		void hydrateRemotePreferences();
		return () => {
			active = false;
		};
	}, [mounted]);

	useEffect(() => {
		if (!mounted || !remoteHydrated) {
			return;
		}

		const profileKey = getClientProfileKey();
		void pushRemoteFusionPreferences({
			profileKey,
			favorites,
			layout,
			sidebarOpen,
			showDrawingTool: showDrawingToolbar,
			darkMode: isDarkMode,
		});
	}, [favorites, isDarkMode, layout, mounted, remoteHydrated, sidebarOpen, showDrawingToolbar]);

	// Refresh data
	const handleRefresh = useCallback(() => {
		void loadChartData();
	}, [loadChartData]);

	// Theme toggle
	const handleThemeToggle = useCallback(() => {
		setIsDarkMode((prev) => !prev);
	}, []);

	const {
		setCoreIndicatorEnabled,
		setCoreIndicatorPeriod,
		setMacdEnabled,
		setBollingerEnabled,
		setBollingerPeriod,
		setBollingerStdDev,
		setVwapEnabled,
		setVwmaEnabled,
		setVwmaPeriod,
		setAtrEnabled,
		setAtrPeriod,
		setAtrChannelEnabled,
		setAtrChannelSmaPeriod,
		setAtrChannelAtrPeriod,
		setAtrChannelMultiplier,
		setHmaEnabled,
		setHmaPeriod,
		setAdxEnabled,
		setAdxPeriod,
		setIchimokuEnabled,
		setParabolicSarEnabled,
		setKeltnerEnabled,
		setVolumeProfileEnabled,
		setSupportResistanceEnabled,
	} = useIndicatorActions({ setIndicators });

	// Symbol change
	const handleSymbolChange = useCallback((symbol: FusionSymbol) => {
		setCurrentSymbol(symbol);
		setCustomStartYear((prev) => clampStartYearForSymbol(prev, symbol));
		setSearchQuery("");
		setShowSearch(false);
	}, []);

	// Timeframe change
	const handleTimeframeChange = useCallback((timeframe: TimeframeValue) => {
		setCurrentTimeframe(timeframe);
	}, []);

	const handleHistoryRangeChange = useCallback((preset: HistoryRangePreset) => {
		setHistoryRangePreset(preset);
	}, []);

	const handleCustomStartYearChange = useCallback(
		(year: number) => {
			setCustomStartYear(clampStartYearForSymbol(year, currentSymbol));
		},
		[currentSymbol],
	);

	// Toggle favorite
	const toggleFavorite = useCallback((symbol: string) => {
		setFavorites((prev) => {
			const newFavorites = prev.includes(symbol)
				? prev.filter((s) => s !== symbol)
				: [...prev, symbol];
			writeFusionPreferences({ favorites: newFavorites });
			return newFavorites;
		});
	}, []);

	const handleLayoutChange = useCallback((nextLayout: LayoutMode) => {
		setLayout(nextLayout);
		writeFusionPreferences({ layout: nextLayout });
	}, []);

	const toggleReplayMode = useCallback(() => {
		setReplayMode((prev) => !prev);
	}, []);

	const toggleReplayPlaying = useCallback(() => {
		setReplayPlaying((prev) => !prev);
	}, []);

	const resetReplay = useCallback(() => {
		setReplayPlaying(false);
		setReplayIndex(1);
	}, []);

	const seekReplay = useCallback((index: number) => {
		setReplayIndex(Math.max(1, index));
	}, []);

	useEffect(() => {
		if (!replayMode) {
			setReplayPlaying(false);
			return;
		}
		const maxIndex = Math.max(candleData.length, 1);
		setReplayIndex((prev) => Math.min(Math.max(prev, 1), maxIndex));
	}, [replayMode, candleData.length]);

	useEffect(() => {
		if (!replayMode || !replayPlaying) {
			return;
		}
		if (replayIndex >= candleData.length) {
			setReplayPlaying(false);
			return;
		}

		const timer = window.setInterval(() => {
			setReplayIndex((prev) => {
				const next = prev + 1;
				return next > candleData.length ? candleData.length : next;
			});
		}, 450);

		return () => {
			clearInterval(timer);
		};
	}, [replayMode, replayPlaying, replayIndex, candleData.length]);

	const viewCandleData = useMemo(() => {
		if (!replayMode) return candleData;
		if (candleData.length === 0) return candleData;
		const clampedIndex = Math.min(Math.max(replayIndex, 1), candleData.length);
		return candleData.slice(0, clampedIndex);
	}, [replayMode, replayIndex, candleData]);

	// Export chart
	const handleExport = useCallback(() => {
		// Find canvas and export
		const canvas = document.querySelector("canvas");
		if (canvas) {
			const link = document.createElement("a");
			link.download = `${currentSymbol.symbol}_${new Date().toISOString().split("T")[0]}.png`;
			link.href = canvas.toDataURL("image/png");
			link.click();
		}
	}, [currentSymbol]);

	// Fullscreen toggle
	const handleFullscreen = useCallback(() => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
	}, []);

	// Calculate stats
	const stats = useMemo(() => {
		if (viewCandleData.length === 0) {
			return { change: 0, percent: 0, high24h: 0, low24h: 0, volume24h: 0, lastPrice: 0 };
		}

		const lastCandle = viewCandleData[viewCandleData.length - 1];
		const prevCandle = viewCandleData[viewCandleData.length - 2] || lastCandle;
		const change = lastCandle.close - prevCandle.close;
		const percent = prevCandle.close > 0 ? (change / prevCandle.close) * 100 : 0;

		const sliceCount = Math.min(24, viewCandleData.length);
		const recentData = viewCandleData.slice(-sliceCount);

		return {
			change,
			percent,
			high24h: Math.max(...recentData.map((c) => c.high)),
			low24h: Math.min(...recentData.map((c) => c.low)),
			volume24h: recentData.reduce((sum: number, c) => sum + c.volume, 0),
			lastPrice: lastCandle.close,
		};
	}, [viewCandleData]);

	const signalSnapshot = useMemo<SignalSnapshot>(() => {
		if (viewCandleData.length < 2) {
			return {
				lineState: "neutral" as const,
				sma50: null as number | null,
				lastCrossLabel: "n/a",
				rvol: null as number | null,
				cmf: null as number | null,
				obv: null as number | null,
				heartbeatScore: 0,
				heartbeatCycleBars: null as number | null,
				atr: null as number | null,
			};
		}

		const lineData = dailySignalData.length >= 2 ? dailySignalData : viewCandleData;
		const sma50Series = calculateSMA(lineData, 50);
		const latestSma50 = sma50Series[sma50Series.length - 1]?.value ?? null;
		const lastClose = lineData[lineData.length - 1].close;
		const lineState =
			latestSma50 === null ? "neutral" : lastClose >= latestSma50 ? "above" : "below";

		const crossEvents = detectSMACrossEvents(lineData, 50);
		const lastCross = crossEvents[crossEvents.length - 1];
		const lastCrossLabel = lastCross
			? `${lastCross.type === "cross_up" ? "up" : "down"} @ ${new Date(lastCross.time * 1000).toLocaleDateString()}`
			: "none";

		const rvolSeries = calculateRVOL(viewCandleData, 20);
		const cmfSeries = calculateCMF(viewCandleData, 20);
		const obvSeries = calculateOBV(viewCandleData);
		const heartbeat = analyzeHeartbeatPattern(viewCandleData, 0.02);
		const atrPeriod = indicators.atr?.period ?? 14;
		const atrSeries = calculateATR(viewCandleData, atrPeriod);

		return {
			lineState,
			sma50: latestSma50,
			lastCrossLabel,
			rvol: rvolSeries[rvolSeries.length - 1]?.value ?? null,
			cmf: cmfSeries[cmfSeries.length - 1]?.value ?? null,
			obv: obvSeries[obvSeries.length - 1]?.value ?? null,
			heartbeatScore: heartbeat.score,
			heartbeatCycleBars: heartbeat.cycleBars,
			atr: indicators.atr?.enabled ? (atrSeries[atrSeries.length - 1]?.value ?? null) : null,
		};
	}, [dailySignalData, indicators.atr, viewCandleData]);

	const compositeSignalOhlcv = useMemo(
		() =>
			viewCandleData.slice(-Math.min(240, viewCandleData.length)).map((point) => ({
				time: point.time,
				open: point.open,
				high: point.high,
				low: point.low,
				close: point.close,
				volume: point.volume,
			})),
		[viewCandleData],
	);

	useEffect(() => {
		if (compositeSignalOhlcv.length < 20) {
			setCompositeSignalInsights(null);
			return;
		}

		const controller = new AbortController();
		const timer = window.setTimeout(async () => {
			try {
				const response = await fetch("/api/fusion/strategy/composite", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ohlcv: compositeSignalOhlcv }),
					signal: controller.signal,
				});
				const body = (await response.json()) as CompositeSignalRouteResponse;
				if (!response.ok || body.success !== true || !body.data) {
					throw new Error(body.error || `Composite request failed (${response.status})`);
				}

				const data = body.data;
				if (
					(data.signal !== "buy" && data.signal !== "sell" && data.signal !== "neutral") ||
					typeof data.confidence !== "number" ||
					typeof data.timestamp !== "number"
				) {
					throw new Error("Composite response shape invalid");
				}

				const components = data.components;
				const smaDetails = components?.sma50_slope?.details;
				const smaEngine =
					smaDetails && typeof smaDetails.engine === "string" ? smaDetails.engine : null;

				setCompositeSignalInsights({
					signal: data.signal,
					confidence: Math.max(0, Math.min(1, data.confidence)),
					heartbeatScore: componentScore(components, "heartbeat"),
					sma50SlopeScore: componentScore(components, "sma50_slope"),
					sma50SlopeEngine: smaEngine,
					volumePowerScore: componentScore(components, "volume_power"),
					timestamp: data.timestamp,
				});
			} catch (error: unknown) {
				if (!controller.signal.aborted) {
					setCompositeSignalInsights(null);
				}
				void error;
			}
		}, 250);

		return () => {
			controller.abort();
			window.clearTimeout(timer);
		};
	}, [compositeSignalOhlcv]);

	// Format helpers
	const formatPrice = (price: number) => {
		if (price < 0.01) return price.toFixed(6);
		if (price < 1) return price.toFixed(4);
		if (price < 100) return price.toFixed(2);
		return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	};

	const formatVolume = (volume: number) => {
		if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
		if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
		if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
		return volume.toString();
	};

	// Get all symbols for search
	const allSymbols = useMemo(() => {
		return ALL_FUSION_SYMBOLS;
	}, []);

	// Filter symbols by search
	const filteredSymbols = useMemo(() => {
		return searchFusionSymbols(debouncedSearchQuery, 10);
	}, [debouncedSearchQuery]);

	const searchPending = searchQuery.trim() !== debouncedSearchQuery.trim();

	const popularSymbols = useMemo(() => {
		const preferred = ["AAPL", "BTC/USD", "EUR/USD", "NVDA"];
		return preferred
			.map((symbol) => allSymbols.find((item) => item.symbol === symbol))
			.filter((item): item is FusionSymbol => Boolean(item));
	}, [allSymbols]);

	// Get watchlist by tab
	const watchlistSymbols = useMemo(() => {
		if (activeTab === "favorites") {
			return allSymbols.filter((s) => favorites.includes(s.symbol));
		}
		if (activeTab === "all") {
			return allSymbols;
		}
		return WATCHLIST_CATEGORIES[activeTab as keyof typeof WATCHLIST_CATEGORIES] || [];
	}, [activeTab, favorites, allSymbols]);

	if (!mounted) {
		return <TradingPageSkeleton />;
	}

	const streamAgeLabel =
		streamLastTickAgeSec === null ? "No tick yet" : `${streamLastTickAgeSec}s since tick`;

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
			<TradingHeader
				currentSymbol={currentSymbol}
				favorites={favorites}
				searchQuery={searchQuery}
				searchPending={searchPending}
				showSearch={showSearch}
				filteredSymbols={filteredSymbols}
				popularSymbols={popularSymbols}
				currentTimeframe={currentTimeframe}
				chartType={chartType}
				compareSymbol={compareSymbol}
				indicators={indicators}
				loading={loading}
				isDarkMode={isDarkMode}
				supportedLayouts={["single"]}
				onQueryChange={setSearchQuery}
				onOpenSearchChange={setShowSearch}
				onSelectSymbol={handleSymbolChange}
				onToggleFavorite={toggleFavorite}
				onTimeframeChange={handleTimeframeChange}
				onChartTypeChange={setChartType}
				onCompare={setCompareSymbol}
				onLayoutChange={handleLayoutChange}
				onIndicatorsChange={setIndicators}
				onRefresh={handleRefresh}
				onExport={handleExport}
				onFullscreen={handleFullscreen}
				onThemeToggle={handleThemeToggle}
				replayMode={replayMode}
				replayPlaying={replayPlaying}
				replayIndex={replayIndex}
				replayMax={candleData.length}
				onToggleReplayMode={toggleReplayMode}
				onToggleReplayPlaying={toggleReplayPlaying}
				onResetReplay={resetReplay}
				onSeekReplay={seekReplay}
			/>

			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-3 py-2 text-xs">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline">{loading ? "Loading market data" : "Market ready"}</Badge>
					<Badge variant="outline">Mode: {dataMode}</Badge>
					<Badge variant="outline">Provider: {dataProvider}</Badge>
					<Badge
						variant="outline"
						className={
							streamState === "live"
								? "text-emerald-600"
								: streamState === "degraded"
									? "text-amber-600"
									: "text-muted-foreground"
						}
					>
						Stream: {streamState}
					</Badge>
					<Badge variant="outline">{streamAgeLabel}</Badge>
					<Badge variant="outline">Reconnects: {streamReconnects}</Badge>
					{replayMode ? (
						<Badge variant="outline" className="text-indigo-600">
							Replay {replayPlaying ? "playing" : "paused"}
						</Badge>
					) : null}
				</div>
				<div className="flex flex-wrap items-center gap-2 text-muted-foreground">
					<span>L: {sidebarOpen ? "open" : "closed"}</span>
					<span>R: {rightSidebarOpen ? "open" : "closed"}</span>
					<span>Layout: {layout}</span>
					<span>Panel: {activeSidebarPanel}</span>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden relative">
				<PanelGroup direction="horizontal" className="flex-1">
					{/* Left Sidebar: Watchlist */}
					{sidebarOpen && (
						<>
							<Panel defaultSize={20} minSize={15} maxSize={30}>
								<WatchlistSidebar
									activeTab={activeTab}
									watchlistSymbols={watchlistSymbols}
									currentSymbol={currentSymbol.symbol}
									favorites={favorites}
									onSetActiveTab={setActiveTab}
									onSelectSymbol={handleSymbolChange}
									onToggleFavorite={toggleFavorite}
								/>
							</Panel>
							<PanelResizeHandle className="w-1 bg-border/50 hover:bg-emerald-500/50 transition-colors" />
						</>
					)}

					{/* Main Workspace: Chart */}
					<Panel minSize={40}>
						<div className="flex-1 flex flex-col h-full overflow-hidden">
							<TradingWorkspace
								showDrawingToolbar={showDrawingToolbar}
								dataStatusMessage={dataStatusMessage}
								signalSnapshot={signalSnapshot}
								compositeSignalInsights={compositeSignalInsights}
								loading={loading}
								candleData={viewCandleData}
								indicators={indicators}
								isDarkMode={isDarkMode}
								chartType={chartType}
								layout={layout}
								historyRangePreset={historyRangePreset}
								customStartYear={customStartYear}
								minimumStartYear={symbolMinimumStartYear}
								effectiveStartYear={historyWindow.effectiveStartYear}
								onHistoryRangeChange={handleHistoryRangeChange}
								onCustomStartYearChange={handleCustomStartYearChange}
							/>

							<BottomStats stats={stats} formatPrice={formatPrice} formatVolume={formatVolume} />
						</div>
					</Panel>

					{/* Right Sidebar: Details */}
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
									onClose={() => setRightSidebarOpen(false)}
									onSetCoreIndicatorEnabled={setCoreIndicatorEnabled}
									onSetCoreIndicatorPeriod={setCoreIndicatorPeriod}
									onSetMacdEnabled={setMacdEnabled}
									onSetBollingerEnabled={setBollingerEnabled}
									onSetBollingerPeriod={setBollingerPeriod}
									onSetBollingerStdDev={setBollingerStdDev}
									onSetVwapEnabled={setVwapEnabled}
									onSetVwmaEnabled={setVwmaEnabled}
									onSetVwmaPeriod={setVwmaPeriod}
									onSetAtrEnabled={setAtrEnabled}
									onSetAtrPeriod={setAtrPeriod}
									onSetAtrChannelEnabled={setAtrChannelEnabled}
									onSetAtrChannelSmaPeriod={setAtrChannelSmaPeriod}
									onSetAtrChannelAtrPeriod={setAtrChannelAtrPeriod}
									onSetAtrChannelMultiplier={setAtrChannelMultiplier}
									onSetHmaEnabled={setHmaEnabled}
									onSetHmaPeriod={setHmaPeriod}
									onSetAdxEnabled={setAdxEnabled}
									onSetAdxPeriod={setAdxPeriod}
									onSetIchimokuEnabled={setIchimokuEnabled}
									onSetParabolicSarEnabled={setParabolicSarEnabled}
									onSetKeltnerEnabled={setKeltnerEnabled}
									onSetVolumeProfileEnabled={setVolumeProfileEnabled}
									onSetSupportResistanceEnabled={setSupportResistanceEnabled}
								/>
							</Panel>
						</>
					)}
				</PanelGroup>

				{/* Sidebar Toggles */}
				<Button
					variant="ghost"
					size="icon"
					className={`absolute left-2 top-4 z-40 h-8 w-8 border border-border bg-card/90 shadow-sm transition-transform ${!sidebarOpen ? "translate-x-[-100%]" : ""}`}
					onClick={() => setSidebarOpen(!sidebarOpen)}
				>
					{sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
				</Button>

				{!sidebarOpen && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute left-0 top-4 z-40 h-8 w-6 border-y border-r border-border bg-card/90 shadow-sm rounded-l-none"
						onClick={() => setSidebarOpen(true)}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				)}

				{!rightSidebarOpen && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-0 top-4 z-40 h-8 w-6 border-y border-l border-border bg-card/90 shadow-sm rounded-r-none"
						onClick={() => setRightSidebarOpen(true)}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
