import type { MutableRefObject } from "react";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import type { ChartSeriesHandle, TradingChartCandle } from "@/components/trading-chart/types";
import {
	calculateBollingerBands,
	calculateEMA,
	calculateHMA,
	calculateIchimoku,
	calculateKeltnerChannels,
	calculateParabolicSAR,
	calculateRSI,
	calculateSMA,
	calculateSMAATRChannel,
	calculateVolumeProfile,
	calculateVWAP,
	calculateVWMA,
	findSupportResistance,
} from "@/lib/indicators";

export interface IndicatorSeriesRefs {
	smaSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	emaSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	bbUpperSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	bbMiddleSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	bbLowerSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	vwapSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	vwmaSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	atrChannelUpperSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	atrChannelMiddleSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	atrChannelLowerSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	rsiSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	hmaSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	ichimokuTenkanSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	ichimokuKijunSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	ichimokuSenkouASeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	ichimokuSenkouBSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	parabolicSarSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	keltnerUpperSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	keltnerMiddleSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	keltnerLowerSeriesRef: MutableRefObject<ChartSeriesHandle | null>;
	volumeProfileSeriesRefs: MutableRefObject<ChartSeriesHandle[]>;
	supportResistanceSeriesRefs: MutableRefObject<ChartSeriesHandle[]>;
}

interface IndicatorSeriesHelpers {
	ensureLineSeries: (
		ref: MutableRefObject<ChartSeriesHandle | null>,
		enabled: boolean,
		options: Record<string, unknown>,
	) => ChartSeriesHandle | null;
	addLineSeries: (options: Record<string, unknown>) => ChartSeriesHandle | null;
	removeSeries: (series: ChartSeriesHandle) => void;
}

interface LineSeriesSpec {
	options: Record<string, unknown>;
	data: Array<{ time: number; value: number }>;
}

function syncSeriesGroup(
	ref: MutableRefObject<ChartSeriesHandle[]>,
	specs: LineSeriesSpec[],
	enabled: boolean,
	helpers: IndicatorSeriesHelpers,
) {
	if (!enabled) {
		for (const series of ref.current) {
			helpers.removeSeries(series);
		}
		ref.current = [];
		return;
	}

	while (ref.current.length > specs.length) {
		const series = ref.current.pop();
		if (series) {
			helpers.removeSeries(series);
		}
	}

	for (let i = 0; i < specs.length; i++) {
		if (!ref.current[i]) {
			const created = helpers.addLineSeries(specs[i].options);
			if (!created) continue;
			ref.current[i] = created;
		}

		ref.current[i]?.setData(specs[i].data);
	}
}

export function resetSeriesRefs(refs: IndicatorSeriesRefs) {
	refs.smaSeriesRef.current = null;
	refs.emaSeriesRef.current = null;
	refs.bbUpperSeriesRef.current = null;
	refs.bbMiddleSeriesRef.current = null;
	refs.bbLowerSeriesRef.current = null;
	refs.vwapSeriesRef.current = null;
	refs.vwmaSeriesRef.current = null;
	refs.atrChannelUpperSeriesRef.current = null;
	refs.atrChannelMiddleSeriesRef.current = null;
	refs.atrChannelLowerSeriesRef.current = null;
	refs.rsiSeriesRef.current = null;
	refs.hmaSeriesRef.current = null;
	refs.ichimokuTenkanSeriesRef.current = null;
	refs.ichimokuKijunSeriesRef.current = null;
	refs.ichimokuSenkouASeriesRef.current = null;
	refs.ichimokuSenkouBSeriesRef.current = null;
	refs.parabolicSarSeriesRef.current = null;
	refs.keltnerUpperSeriesRef.current = null;
	refs.keltnerMiddleSeriesRef.current = null;
	refs.keltnerLowerSeriesRef.current = null;
	refs.volumeProfileSeriesRefs.current = [];
	refs.supportResistanceSeriesRefs.current = [];
}

export function updateIndicatorSeries(
	indicators: IndicatorSettings,
	ohlcvData: TradingChartCandle[],
	refs: IndicatorSeriesRefs,
	helpers: IndicatorSeriesHelpers,
) {
	const smaSeries = helpers.ensureLineSeries(refs.smaSeriesRef, indicators.sma.enabled, {
		color: "#3b82f6",
		lineWidth: 2,
		title: `SMA ${indicators.sma.period}`,
	});
	if (smaSeries) {
		const smaData = calculateSMA(ohlcvData, indicators.sma.period);
		smaSeries.setData(smaData.map((d) => ({ time: d.time, value: d.value })));
	}

	const emaSeries = helpers.ensureLineSeries(refs.emaSeriesRef, indicators.ema.enabled, {
		color: "#f59e0b",
		lineWidth: 2,
		title: `EMA ${indicators.ema.period}`,
	});
	if (emaSeries) {
		const emaData = calculateEMA(ohlcvData, indicators.ema.period);
		emaSeries.setData(emaData.map((d) => ({ time: d.time, value: d.value })));
	}

	const bollingerEnabled = Boolean(indicators.bollinger?.enabled);
	const bbUpperSeries = helpers.ensureLineSeries(refs.bbUpperSeriesRef, bollingerEnabled, {
		color: "#8b5cf6",
		lineWidth: 1,
		title: "BB Upper",
	});
	const bbMiddleSeries = helpers.ensureLineSeries(refs.bbMiddleSeriesRef, bollingerEnabled, {
		color: "#8b5cf6",
		lineWidth: 1,
		lineStyle: 2,
	});
	const bbLowerSeries = helpers.ensureLineSeries(refs.bbLowerSeriesRef, bollingerEnabled, {
		color: "#8b5cf6",
		lineWidth: 1,
	});
	if (bollingerEnabled && bbUpperSeries && bbMiddleSeries && bbLowerSeries) {
		const bb = calculateBollingerBands(
			ohlcvData,
			indicators.bollinger?.period || 20,
			indicators.bollinger?.stdDev || 2,
		);
		bbUpperSeries.setData(bb.map((d) => ({ time: d.time, value: d.upper })));
		bbMiddleSeries.setData(bb.map((d) => ({ time: d.time, value: d.middle })));
		bbLowerSeries.setData(bb.map((d) => ({ time: d.time, value: d.lower })));
	}

	const vwapSeries = helpers.ensureLineSeries(
		refs.vwapSeriesRef,
		Boolean(indicators.vwap?.enabled),
		{
			color: "#10b981",
			lineWidth: 2,
			title: "VWAP",
		},
	);
	if (vwapSeries) {
		const vwapData = calculateVWAP(ohlcvData);
		vwapSeries.setData(vwapData.map((d) => ({ time: d.time, value: d.value })));
	}

	const vwmaSeries = helpers.ensureLineSeries(
		refs.vwmaSeriesRef,
		Boolean(indicators.vwma?.enabled),
		{
			color: "#84cc16",
			lineWidth: 2,
			title: `VWMA ${indicators.vwma?.period || 20}`,
		},
	);
	if (vwmaSeries) {
		const vwmaData = calculateVWMA(ohlcvData, indicators.vwma?.period || 20);
		vwmaSeries.setData(vwmaData.map((d) => ({ time: d.time, value: d.value })));
	}

	const atrChannelEnabled = Boolean(indicators.atrChannel?.enabled);
	const atrChannelUpper = helpers.ensureLineSeries(
		refs.atrChannelUpperSeriesRef,
		atrChannelEnabled,
		{
			color: "#0ea5e9",
			lineWidth: 1,
			title: "SMA+ATR",
		},
	);
	const atrChannelMiddle = helpers.ensureLineSeries(
		refs.atrChannelMiddleSeriesRef,
		atrChannelEnabled,
		{
			color: "#38bdf8",
			lineWidth: 1,
			lineStyle: 2,
			title: "SMA Mid",
		},
	);
	const atrChannelLower = helpers.ensureLineSeries(
		refs.atrChannelLowerSeriesRef,
		atrChannelEnabled,
		{
			color: "#0ea5e9",
			lineWidth: 1,
			title: "SMA-ATR",
		},
	);
	if (atrChannelEnabled && atrChannelUpper && atrChannelMiddle && atrChannelLower) {
		const channel = calculateSMAATRChannel(
			ohlcvData,
			indicators.atrChannel?.smaPeriod || 50,
			indicators.atrChannel?.atrPeriod || 14,
			indicators.atrChannel?.multiplier || 1.5,
		);
		atrChannelUpper.setData(channel.map((d) => ({ time: d.time, value: d.upper })));
		atrChannelMiddle.setData(channel.map((d) => ({ time: d.time, value: d.middle })));
		atrChannelLower.setData(channel.map((d) => ({ time: d.time, value: d.lower })));
	}

	const hmaSeries = helpers.ensureLineSeries(refs.hmaSeriesRef, Boolean(indicators.hma?.enabled), {
		color: "#14b8a6",
		lineWidth: 2,
		title: `HMA ${indicators.hma?.period || 20}`,
	});
	if (hmaSeries) {
		const hmaData = calculateHMA(ohlcvData, indicators.hma?.period || 20);
		hmaSeries.setData(hmaData.map((d) => ({ time: d.time, value: d.value })));
	}

	const ichimokuEnabled = Boolean(indicators.ichimoku?.enabled);
	const ichimokuTenkan = helpers.ensureLineSeries(refs.ichimokuTenkanSeriesRef, ichimokuEnabled, {
		color: "#6366f1",
		lineWidth: 1,
		title: "Tenkan",
	});
	const ichimokuKijun = helpers.ensureLineSeries(refs.ichimokuKijunSeriesRef, ichimokuEnabled, {
		color: "#4f46e5",
		lineWidth: 1,
		title: "Kijun",
	});
	const ichimokuSenkouA = helpers.ensureLineSeries(refs.ichimokuSenkouASeriesRef, ichimokuEnabled, {
		color: "#22c55e",
		lineWidth: 1,
		lineStyle: 2,
		title: "Senkou A",
	});
	const ichimokuSenkouB = helpers.ensureLineSeries(refs.ichimokuSenkouBSeriesRef, ichimokuEnabled, {
		color: "#ef4444",
		lineWidth: 1,
		lineStyle: 2,
		title: "Senkou B",
	});
	if (ichimokuEnabled && ichimokuTenkan && ichimokuKijun && ichimokuSenkouA && ichimokuSenkouB) {
		const ichimoku = calculateIchimoku(
			ohlcvData,
			indicators.ichimoku?.tenkanPeriod || 9,
			indicators.ichimoku?.kijunPeriod || 26,
			indicators.ichimoku?.senkouBPeriod || 52,
			indicators.ichimoku?.displacement || 26,
		);
		ichimokuTenkan.setData(ichimoku.tenkan.map((d) => ({ time: d.time, value: d.value })));
		ichimokuKijun.setData(ichimoku.kijun.map((d) => ({ time: d.time, value: d.value })));
		ichimokuSenkouA.setData(ichimoku.senkouA.map((d) => ({ time: d.time, value: d.value })));
		ichimokuSenkouB.setData(ichimoku.senkouB.map((d) => ({ time: d.time, value: d.value })));
	}

	const sarSeries = helpers.ensureLineSeries(
		refs.parabolicSarSeriesRef,
		Boolean(indicators.parabolicSar?.enabled),
		{
			color: "#ec4899",
			lineWidth: 1,
			lineStyle: 1,
			title: "Parabolic SAR",
		},
	);
	if (sarSeries) {
		const sarData = calculateParabolicSAR(
			ohlcvData,
			indicators.parabolicSar?.step || 0.02,
			indicators.parabolicSar?.maxAF || 0.2,
		);
		sarSeries.setData(sarData.sar.map((d) => ({ time: d.time, value: d.value })));
	}

	const keltnerEnabled = Boolean(indicators.keltner?.enabled);
	const keltnerUpper = helpers.ensureLineSeries(refs.keltnerUpperSeriesRef, keltnerEnabled, {
		color: "#d946ef",
		lineWidth: 1,
		title: "Keltner Upper",
	});
	const keltnerMiddle = helpers.ensureLineSeries(refs.keltnerMiddleSeriesRef, keltnerEnabled, {
		color: "#a21caf",
		lineWidth: 1,
		lineStyle: 2,
		title: "Keltner Mid",
	});
	const keltnerLower = helpers.ensureLineSeries(refs.keltnerLowerSeriesRef, keltnerEnabled, {
		color: "#d946ef",
		lineWidth: 1,
		title: "Keltner Lower",
	});
	if (keltnerEnabled && keltnerUpper && keltnerMiddle && keltnerLower) {
		const keltner = calculateKeltnerChannels(
			ohlcvData,
			indicators.keltner?.emaPeriod || 20,
			indicators.keltner?.atrPeriod || 10,
			indicators.keltner?.multiplier || 2,
		);
		keltnerUpper.setData(keltner.upper.map((d) => ({ time: d.time, value: d.value })));
		keltnerMiddle.setData(keltner.middle.map((d) => ({ time: d.time, value: d.value })));
		keltnerLower.setData(keltner.lower.map((d) => ({ time: d.time, value: d.value })));
	}

	const volumeProfileEnabled = Boolean(indicators.volumeProfile?.enabled);
	const volumeSpecs: LineSeriesSpec[] = volumeProfileEnabled
		? calculateVolumeProfile(ohlcvData, indicators.volumeProfile?.levels || 20)
				.sort((a, b) => b.volume - a.volume)
				.slice(0, indicators.volumeProfile?.topN || 6)
				.map((level) => ({
					options: {
						color: level.buyVolume >= level.sellVolume ? "#34d399" : "#f87171",
						lineWidth: 1,
						lineStyle: 1,
						title: `VP ${level.price.toFixed(2)}`,
					},
					data: ohlcvData.map((candle) => ({ time: candle.time, value: level.price })),
				}))
		: [];
	syncSeriesGroup(refs.volumeProfileSeriesRefs, volumeSpecs, volumeProfileEnabled, helpers);

	const supportResistanceEnabled = Boolean(indicators.supportResistance?.enabled);
	const supportResistanceSpecs: LineSeriesSpec[] = supportResistanceEnabled
		? findSupportResistance(
				ohlcvData,
				indicators.supportResistance?.lookback || 20,
				indicators.supportResistance?.threshold || 0.02,
			)
				.slice(0, indicators.supportResistance?.topN || 6)
				.map((level) => ({
					options: {
						color: level.type === "support" ? "#22c55e" : "#ef4444",
						lineWidth: Math.min(3, Math.max(1, level.strength)),
						lineStyle: 2,
						title: `${level.type === "support" ? "S" : "R"} ${level.price.toFixed(2)}`,
					},
					data: ohlcvData.map((candle) => ({ time: candle.time, value: level.price })),
				}))
		: [];
	syncSeriesGroup(
		refs.supportResistanceSeriesRefs,
		supportResistanceSpecs,
		supportResistanceEnabled,
		helpers,
	);

	if (indicators.rsi.enabled && refs.rsiSeriesRef.current) {
		const rsiData = calculateRSI(ohlcvData, indicators.rsi.period);
		refs.rsiSeriesRef.current.setData(rsiData.map((d) => ({ time: d.time, value: d.value })));
	}
}

export function initializeIndicatorSeries(
	indicators: IndicatorSettings,
	ohlcvData: TradingChartCandle[],
	refs: IndicatorSeriesRefs,
	helpers: IndicatorSeriesHelpers,
) {
	updateIndicatorSeries(indicators, ohlcvData, refs, helpers);
}
