"use client";

import { useMemo } from "react";
import type { IndicatorSettings } from "@/components/IndicatorPanel";
import {
	analyzeHeartbeatPattern,
	calculateATR,
	calculateCMF,
	calculateOBV,
	calculateRVOL,
	calculateSMA,
	detectSMACrossEvents,
} from "@/lib/indicators";
import type { OHLCVData } from "@/lib/providers/types";
import type { SignalSnapshot } from "../types";

const EMPTY_SNAPSHOT: SignalSnapshot = {
	lineState: "neutral",
	sma50: null,
	lastCrossLabel: "n/a",
	rvol: null,
	cmf: null,
	obv: null,
	heartbeatScore: 0,
	heartbeatCycleBars: null,
	atr: null,
};

export function useSignalSnapshot(
	viewCandleData: OHLCVData[],
	dailySignalData: OHLCVData[],
	indicators: IndicatorSettings,
): SignalSnapshot {
	return useMemo(() => {
		if (viewCandleData.length < 2) return EMPTY_SNAPSHOT;

		const lineData = dailySignalData.length >= 2 ? dailySignalData : viewCandleData;
		const sma50Series = calculateSMA(lineData, 50);
		const latestSma50 = sma50Series[sma50Series.length - 1]?.value ?? null;
		const lastCandle = lineData[lineData.length - 1];
		if (!lastCandle) return EMPTY_SNAPSHOT;
		const lastClose = lastCandle.close;
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
}
