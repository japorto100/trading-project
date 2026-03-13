"use client";

import { useQuery } from "@tanstack/react-query";
import { generateDemoCandles } from "@/lib/demoData";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import {
	buildHistoryWindow,
	clampStartYearForSymbol,
	type HistoryRangePreset,
} from "@/lib/history-range";
import type { OHLCVData, TimeframeValue } from "@/lib/providers/types";
import type { DataMode } from "../types";

interface ChartDataResult {
	candleData: OHLCVData[];
	dataMode: DataMode;
	dataProvider: string;
	dataStatusMessage: string | null;
	isLoading: boolean;
	refetch: () => void;
	historyWindow: ReturnType<typeof buildHistoryWindow>;
	symbolMinimumStartYear: number;
}

async function fetchOhlcv(
	symbol: FusionSymbol,
	timeframe: TimeframeValue,
	historyWindow: ReturnType<typeof buildHistoryWindow>,
): Promise<{ rows: OHLCVData[]; provider: string; isCapped: boolean }> {
	const params = new URLSearchParams({
		symbol: symbol.symbol,
		timeframe,
		limit: String(historyWindow.requestLimit),
		start: String(historyWindow.startEpoch),
		end: String(Math.floor(Date.now() / 1000)),
	});

	const response = await fetch(`/api/market/ohlcv?${params.toString()}`, { cache: "no-store" });
	if (!response.ok) throw new Error(`OHLCV request failed (${response.status})`);

	const payload = (await response.json()) as { data?: OHLCVData[]; provider?: string };
	const rows = Array.isArray(payload.data) ? payload.data : [];
	if (rows.length === 0) throw new Error("OHLCV API returned empty data");

	return {
		rows: [...rows].sort((a, b) => a.time - b.time),
		provider: (payload.provider ?? "api").toString(),
		isCapped: historyWindow.isCapped,
	};
}

export function useChartData(
	symbol: FusionSymbol,
	timeframe: TimeframeValue,
	historyRangePreset: HistoryRangePreset,
	customStartYear: number,
): ChartDataResult {
	const symbolMinimumStartYear = clampStartYearForSymbol(customStartYear, symbol);

	const historyWindow = buildHistoryWindow({
		preset: historyRangePreset,
		timeframe,
		symbol,
		customStartYear: symbolMinimumStartYear,
	});

	const query = useQuery({
		queryKey: [
			"market",
			"ohlcv",
			symbol.symbol,
			timeframe,
			historyWindow.startEpoch,
			historyWindow.requestLimit,
		],
		queryFn: () => fetchOhlcv(symbol, timeframe, historyWindow),
		// On error: produce demo fallback so chart always shows something
		// No retry — demo fallback covers the error case immediately
		retry: false,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
	});

	const isDemoFallback = query.isError || (query.isSuccess && query.data.rows.length === 0);

	const candleData: OHLCVData[] = isDemoFallback
		? (generateDemoCandles(
				symbol,
				timeframe,
				Math.min(historyWindow.requestLimit, 4000),
			) as OHLCVData[])
		: (query.data?.rows ?? []);

	const dataMode: DataMode = isDemoFallback ? "fallback" : "api";
	const dataProvider = isDemoFallback ? "demo" : (query.data?.provider ?? "api");

	let dataStatusMessage: string | null = null;
	if (isDemoFallback && query.error) {
		dataStatusMessage = `API failed, switched to demo fallback (${query.error instanceof Error ? query.error.message : "unknown error"})`;
	} else if (query.data?.isCapped) {
		dataStatusMessage = `Requested range exceeded bar cap for ${timeframe}; showing latest ${historyWindow.requestLimit} bars.`;
	}

	return {
		candleData,
		dataMode,
		dataProvider,
		dataStatusMessage,
		isLoading: query.isLoading,
		refetch: query.refetch,
		historyWindow,
		symbolMinimumStartYear,
	};
}
