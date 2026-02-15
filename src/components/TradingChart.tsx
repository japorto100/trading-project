"use client";

import { BarChart3, RefreshCw } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChartType } from "@/chart/types";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import {
	type IndicatorSeriesRefs,
	initializeIndicatorSeries,
	resetSeriesRefs,
	updateIndicatorSeries,
} from "@/components/trading-chart/indicatorSeries";
import { TradingChartHeader } from "@/components/trading-chart/TradingChartHeader";
import type {
	ChartHandle,
	ChartSeriesHandle,
	CrosshairMovePayload,
	HoveredPrice,
	LightweightChartsModule,
	TradingChartCandle,
} from "@/components/trading-chart/types";
import {
	formatTime,
	getMainSeriesData,
	getVolumeSeriesData,
	toOhlcvData,
} from "@/components/trading-chart/utils";
import { Badge } from "@/components/ui/badge";
import { calculateADX, calculateATR, calculateRSI } from "@/lib/indicators";
import { getErrorMessage } from "@/lib/utils";

interface TradingChartProps {
	candleData: TradingChartCandle[];
	indicators: IndicatorSettings;
	isDarkMode: boolean;
	chartType?: ChartType;
}

export function TradingChart({
	candleData,
	indicators,
	isDarkMode,
	chartType = "candlestick",
}: TradingChartProps) {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const rsiChartContainerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ChartHandle | null>(null);
	const rsiChartRef = useRef<ChartHandle | null>(null);
	const mainSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const volumeSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const rsiSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const adxPaneSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const smaSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const emaSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const bbUpperSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const bbMiddleSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const bbLowerSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const vwapSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const vwmaSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const atrChannelUpperSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const atrChannelMiddleSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const atrChannelLowerSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const hmaSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const ichimokuTenkanSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const ichimokuKijunSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const ichimokuSenkouASeriesRef = useRef<ChartSeriesHandle | null>(null);
	const ichimokuSenkouBSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const parabolicSarSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const keltnerUpperSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const keltnerMiddleSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const keltnerLowerSeriesRef = useRef<ChartSeriesHandle | null>(null);
	const volumeProfileSeriesRefs = useRef<ChartSeriesHandle[]>([]);
	const supportResistanceSeriesRefs = useRef<ChartSeriesHandle[]>([]);
	const chartSignatureRef = useRef<string | null>(null);
	const lightweightChartsRef = useRef<LightweightChartsModule | null>(null);

	const [chartLoaded, setChartLoaded] = useState(false);
	const [chartError, setChartError] = useState<string | null>(null);
	const [hoveredPrice, setHoveredPrice] = useState<HoveredPrice | null>(null);

	const indicatorSeriesRefs = useMemo<IndicatorSeriesRefs>(
		() => ({
			smaSeriesRef,
			emaSeriesRef,
			bbUpperSeriesRef,
			bbMiddleSeriesRef,
			bbLowerSeriesRef,
			vwapSeriesRef,
			vwmaSeriesRef,
			atrChannelUpperSeriesRef,
			atrChannelMiddleSeriesRef,
			atrChannelLowerSeriesRef,
			rsiSeriesRef,
			hmaSeriesRef,
			ichimokuTenkanSeriesRef,
			ichimokuKijunSeriesRef,
			ichimokuSenkouASeriesRef,
			ichimokuSenkouBSeriesRef,
			parabolicSarSeriesRef,
			keltnerUpperSeriesRef,
			keltnerMiddleSeriesRef,
			keltnerLowerSeriesRef,
			volumeProfileSeriesRefs,
			supportResistanceSeriesRefs,
		}),
		[],
	);

	const lastCandle = candleData[candleData.length - 1];
	const prevCandle = candleData[candleData.length - 2];
	const priceChange = lastCandle ? lastCandle.close - (prevCandle?.close || lastCandle.open) : 0;
	const priceChangePercent = prevCandle
		? ((priceChange / prevCandle.close) * 100).toFixed(2)
		: "0.00";
	const isPositive = priceChange >= 0;

	const ohlcvData = useMemo(() => toOhlcvData(candleData), [candleData]);
	const latestRsi = useMemo(() => {
		if (!indicators.rsi.enabled) return null;
		const rsiData = calculateRSI(ohlcvData, indicators.rsi.period);
		return rsiData[rsiData.length - 1]?.value;
	}, [ohlcvData, indicators.rsi.enabled, indicators.rsi.period]);
	const latestAtr = useMemo(() => {
		if (!indicators.atr?.enabled) return null;
		const atrData = calculateATR(ohlcvData, indicators.atr.period || 14);
		return atrData[atrData.length - 1]?.value;
	}, [ohlcvData, indicators.atr?.enabled, indicators.atr?.period]);
	const latestAdx = useMemo(() => {
		if (!indicators.adx?.enabled) return null;
		const adxData = calculateADX(ohlcvData, indicators.adx.period || 14);
		return adxData.adx[adxData.adx.length - 1]?.value;
	}, [ohlcvData, indicators.adx?.enabled, indicators.adx?.period]);
	const oscillatorEnabled = indicators.rsi.enabled || Boolean(indicators.adx?.enabled);

	const getMainSeriesDataForType = useCallback(
		(type: ChartType) => getMainSeriesData(candleData, type),
		[candleData],
	);
	const getVolumeData = useCallback(() => getVolumeSeriesData(candleData), [candleData]);

	useEffect(() => {
		if (!chartContainerRef.current || candleData.length === 0) return;

		let isMounted = true;
		const signature = JSON.stringify({
			chartType,
			isDarkMode,
			rsiEnabled: indicators.rsi.enabled,
			adxEnabled: indicators.adx?.enabled ?? false,
		});

		if (
			chartRef.current &&
			chartSignatureRef.current === signature &&
			mainSeriesRef.current &&
			volumeSeriesRef.current
		) {
			const chart = chartRef.current;
			const addLineSeriesCompat = (options: Record<string, unknown>) => {
				if (typeof chart.addLineSeries === "function") {
					return chart.addLineSeries(options);
				}
				if (lightweightChartsRef.current && typeof chart.addSeries === "function") {
					return chart.addSeries(lightweightChartsRef.current.LineSeries, options);
				}
				return null;
			};
			const ensureLineSeries = (
				ref: { current: ChartSeriesHandle | null },
				enabled: boolean,
				options: Record<string, unknown>,
			) => {
				if (!enabled) {
					if (ref.current && typeof chart.removeSeries === "function") {
						chart.removeSeries(ref.current);
					}
					ref.current = null;
					return null;
				}
				if (!ref.current) {
					ref.current = addLineSeriesCompat(options);
				}
				return ref.current;
			};

			mainSeriesRef.current.setData(getMainSeriesDataForType(chartType));
			volumeSeriesRef.current.setData(getVolumeData());
			updateIndicatorSeries(indicators, ohlcvData, indicatorSeriesRefs, {
				ensureLineSeries,
				addLineSeries: addLineSeriesCompat,
				removeSeries: (series) => {
					if (typeof chart.removeSeries === "function") {
						chart.removeSeries(series);
					}
				},
			});
			if (indicators.adx?.enabled && adxPaneSeriesRef.current) {
				const adxData = calculateADX(ohlcvData, indicators.adx.period || 14);
				adxPaneSeriesRef.current.setData(
					adxData.adx.map((point) => ({ time: point.time, value: point.value })),
				);
			}
			setChartLoaded(true);
			setChartError(null);
			return;
		}

		const initChart = async () => {
			try {
				const lightweightCharts = (await import(
					"lightweight-charts"
				)) as unknown as LightweightChartsModule;
				const { createChart, CrosshairMode, ColorType } = lightweightCharts;
				lightweightChartsRef.current = lightweightCharts;

				if (!isMounted) return;
				const chartContainer = chartContainerRef.current;
				if (!chartContainer) return;

				if (chartRef.current) {
					chartRef.current.remove();
					chartRef.current = null;
				}
				if (rsiChartRef.current) {
					rsiChartRef.current.remove();
					rsiChartRef.current = null;
				}
				adxPaneSeriesRef.current = null;
				mainSeriesRef.current = null;
				volumeSeriesRef.current = null;
				resetSeriesRefs(indicatorSeriesRefs);

				const backgroundColor = isDarkMode ? "#0f172a" : "#ffffff";
				const textColor = isDarkMode ? "#94a3b8" : "#475569";
				const gridColor = isDarkMode ? "#1e293b" : "#e2e8f0";

				const chart = createChart(chartContainer, {
					layout: {
						background: { type: ColorType.Solid, color: backgroundColor },
						textColor,
					},
					grid: {
						vertLines: { color: gridColor },
						horzLines: { color: gridColor },
					},
					width: chartContainer.clientWidth,
					height: oscillatorEnabled ? 320 : 400,
					crosshair: {
						mode: CrosshairMode.Normal,
						vertLine: {
							color: isDarkMode ? "#3b82f6" : "#2563eb",
							width: 1,
							style: 2,
							labelBackgroundColor: isDarkMode ? "#3b82f6" : "#2563eb",
						},
						horzLine: {
							color: isDarkMode ? "#3b82f6" : "#2563eb",
							width: 1,
							style: 2,
							labelBackgroundColor: isDarkMode ? "#3b82f6" : "#2563eb",
						},
					},
					rightPriceScale: {
						borderColor: gridColor,
						scaleMargins: { top: 0.1, bottom: 0.15 },
					},
					timeScale: {
						borderColor: gridColor,
						timeVisible: true,
						secondsVisible: false,
					},
				});

				chartRef.current = chart;
				const requireSeries = (
					series: ChartSeriesHandle | undefined,
					kind: string,
				): ChartSeriesHandle => {
					if (!series) {
						throw new Error(`Unable to create ${kind} series`);
					}
					return series;
				};
				const addCandlestickSeriesCompat = (options: Record<string, unknown>) => {
					if (typeof chart.addCandlestickSeries === "function") {
						return chart.addCandlestickSeries(options);
					}
					return requireSeries(
						typeof chart.addSeries === "function"
							? chart.addSeries(lightweightCharts.CandlestickSeries, options)
							: undefined,
						"candlestick",
					);
				};
				const addAreaSeriesCompat = (options: Record<string, unknown>) => {
					if (typeof chart.addAreaSeries === "function") {
						return chart.addAreaSeries(options);
					}
					return requireSeries(
						typeof chart.addSeries === "function"
							? chart.addSeries(lightweightCharts.AreaSeries, options)
							: undefined,
						"area",
					);
				};
				const addHistogramSeriesCompat = (options: Record<string, unknown>) => {
					if (typeof chart.addHistogramSeries === "function") {
						return chart.addHistogramSeries(options);
					}
					return requireSeries(
						typeof chart.addSeries === "function"
							? chart.addSeries(lightweightCharts.HistogramSeries, options)
							: undefined,
						"histogram",
					);
				};
				const addLineSeriesCompat = (options: Record<string, unknown>) => {
					if (typeof chart.addLineSeries === "function") {
						return chart.addLineSeries(options);
					}
					return requireSeries(
						typeof chart.addSeries === "function"
							? chart.addSeries(lightweightCharts.LineSeries, options)
							: undefined,
						"line",
					);
				};

				let mainSeries: ChartSeriesHandle;
				if (chartType === "line" || chartType === "area") {
					mainSeries = addAreaSeriesCompat({
						topColor: chartType === "area" ? "rgba(34, 197, 94, 0.4)" : "transparent",
						bottomColor: chartType === "area" ? "rgba(34, 197, 94, 0)" : "transparent",
						lineColor: "#22c55e",
						lineWidth: 2,
					});
				} else {
					mainSeries = addCandlestickSeriesCompat({
						upColor: "#22c55e",
						downColor: "#ef4444",
						borderDownColor: "#ef4444",
						borderUpColor: "#22c55e",
						wickDownColor: "#ef4444",
						wickUpColor: "#22c55e",
					});
				}
				mainSeries.setData(getMainSeriesDataForType(chartType));
				mainSeriesRef.current = mainSeries;

				const volumeSeries = addHistogramSeriesCompat({
					color: "#3b82f6",
					priceFormat: { type: "volume" },
					priceScaleId: "",
				});
				volumeSeries.priceScale?.().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
				volumeSeries.setData(getVolumeData());
				volumeSeriesRef.current = volumeSeries;

				initializeIndicatorSeries(indicators, ohlcvData, indicatorSeriesRefs, {
					ensureLineSeries: (ref, enabled, options) => {
						if (!enabled) {
							if (ref.current && typeof chart.removeSeries === "function") {
								chart.removeSeries(ref.current);
							}
							ref.current = null;
							return null;
						}
						if (!ref.current) {
							ref.current = addLineSeriesCompat(options);
						}
						return ref.current;
					},
					addLineSeries: addLineSeriesCompat,
					removeSeries: (series) => {
						if (typeof chart.removeSeries === "function") {
							chart.removeSeries(series);
						}
					},
				});

				if (oscillatorEnabled && rsiChartContainerRef.current) {
					const rsiChart = createChart(rsiChartContainerRef.current, {
						layout: {
							background: { type: ColorType.Solid, color: backgroundColor },
							textColor,
						},
						grid: {
							vertLines: { color: gridColor },
							horzLines: { color: gridColor },
						},
						width: rsiChartContainerRef.current.clientWidth,
						height: 120,
						rightPriceScale: {
							borderColor: gridColor,
							scaleMargins: { top: 0.1, bottom: 0.1 },
						},
						timeScale: {
							borderColor: gridColor,
							visible: false,
						},
					});

					rsiChartRef.current = rsiChart;
					const addRsiLineSeriesCompat = (options: Record<string, unknown>) => {
						if (typeof rsiChart.addLineSeries === "function") {
							return rsiChart.addLineSeries(options);
						}
						return requireSeries(
							typeof rsiChart.addSeries === "function"
								? rsiChart.addSeries(lightweightCharts.LineSeries, options)
								: undefined,
							"rsi-line",
						);
					};

					const rsiData = calculateRSI(ohlcvData, indicators.rsi.period);
					if (indicators.rsi.enabled && rsiData.length > 0) {
						const rsiSeries = addRsiLineSeriesCompat({
							color: "#a855f7",
							lineWidth: 2,
						});
						rsiSeries.setData(rsiData.map((d) => ({ time: d.time, value: d.value })));
						rsiSeriesRef.current = rsiSeries;
					}
					if (indicators.adx?.enabled) {
						const adxData = calculateADX(ohlcvData, indicators.adx.period || 14);
						if (adxData.adx.length > 0) {
							const adxSeries = addRsiLineSeriesCompat({
								color: "#8b5cf6",
								lineWidth: 2,
							});
							adxSeries.setData(
								adxData.adx.map((point) => ({ time: point.time, value: point.value })),
							);
							adxPaneSeriesRef.current = adxSeries;
						}
					}

					chart.timeScale().subscribeVisibleTimeRangeChange(() => {
						const range = chart.timeScale().getVisibleRange();
						if (range && rsiChartRef.current) {
							rsiChartRef.current.timeScale().setVisibleRange(range);
						}
					});
				}

				chart.subscribeCrosshairMove((param: CrosshairMovePayload) => {
					if (!param.time || !param.seriesData) {
						setHoveredPrice(null);
						return;
					}

					const candlePoint = param.seriesData.get(mainSeries);
					const volumePoint = param.seriesData.get(volumeSeries);

					if (candlePoint && "open" in candlePoint) {
						setHoveredPrice({
							open: candlePoint.open as number,
							high: candlePoint.high as number,
							low: candlePoint.low as number,
							close: candlePoint.close as number,
							volume: volumePoint && "value" in volumePoint ? (volumePoint.value as number) : 0,
							time: formatTime(param.time as number),
						});
					}
				});

				chart.timeScale().fitContent();
				chartSignatureRef.current = signature;
				setChartLoaded(true);
				setChartError(null);
			} catch (error: unknown) {
				console.error("Chart init error:", error);
				setChartError(getErrorMessage(error) || "Failed to load chart");
			}
		};

		initChart();
		return () => {
			isMounted = false;
		};
	}, [
		candleData,
		isDarkMode,
		indicators,
		chartType,
		getMainSeriesDataForType,
		getVolumeData,
		oscillatorEnabled,
		ohlcvData,
		indicatorSeriesRefs,
	]);

	useEffect(() => {
		return () => {
			if (chartRef.current) {
				chartRef.current.remove();
				chartRef.current = null;
			}
			if (rsiChartRef.current) {
				rsiChartRef.current.remove();
				rsiChartRef.current = null;
			}
			adxPaneSeriesRef.current = null;
			mainSeriesRef.current = null;
			volumeSeriesRef.current = null;
			resetSeriesRefs(indicatorSeriesRefs);
			chartSignatureRef.current = null;
			lightweightChartsRef.current = null;
		};
	}, [indicatorSeriesRefs]);

	useEffect(() => {
		const handleResize = () => {
			if (chartContainerRef.current && chartRef.current) {
				chartRef.current.applyOptions({
					width: chartContainerRef.current.clientWidth,
				});
			}
			if (rsiChartContainerRef.current && rsiChartRef.current) {
				rsiChartRef.current.applyOptions({
					width: rsiChartContainerRef.current.clientWidth,
				});
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (chartError) {
		return (
			<div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg">
				<div className="text-center p-8">
					<BarChart3 className="h-12 w-12 mx-auto mb-4 text-red-500" />
					<p className="text-red-400 mb-2">Chart Error</p>
					<p className="text-slate-400 text-sm">{chartError}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<TradingChartHeader
				hoveredPrice={hoveredPrice}
				lastCandle={lastCandle}
				isPositive={isPositive}
				priceChangePercent={priceChangePercent}
			/>

			<div className="flex-1 relative min-h-0">
				{!chartLoaded && (
					<div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
						<div className="text-center">
							<RefreshCw className="h-8 w-8 mx-auto mb-2 text-blue-500 animate-spin" />
							<p className="text-slate-400 text-sm">Loading chart...</p>
						</div>
					</div>
				)}
				<div ref={chartContainerRef} className="w-full h-full" />
			</div>

			{oscillatorEnabled && (
				<div className="h-[120px] border-t border-border">
					<div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
						{indicators.rsi.enabled && (
							<>
								<Badge variant="outline" className="text-purple-500 border-purple-500/50">
									RSI({indicators.rsi.period})
								</Badge>
								<span className="font-mono">{latestRsi ? latestRsi.toFixed(2) : "N/A"}</span>
								<span className="text-xs">(70 overbought, 30 oversold)</span>
							</>
						)}
						{indicators.adx?.enabled && (
							<>
								<Badge variant="outline" className="text-violet-500 border-violet-500/50">
									ADX({indicators.adx.period || 14})
								</Badge>
								<span className="font-mono">{latestAdx ? latestAdx.toFixed(2) : "N/A"}</span>
							</>
						)}
					</div>
					<div ref={rsiChartContainerRef} className="w-full h-[90px]" />
				</div>
			)}

			{indicators.atr?.enabled && (
				<div className="px-3 py-1 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
					<Badge variant="outline" className="text-orange-500 border-orange-500/50">
						ATR({indicators.atr.period || 14})
					</Badge>
					<span className="font-mono">{latestAtr ? latestAtr.toFixed(3) : "N/A"}</span>
				</div>
			)}
		</div>
	);
}

export const MemoizedTradingChart = memo(TradingChart);

export default TradingChart;
