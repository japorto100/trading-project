import { type FusionSymbol, getDefaultStartYear } from "@/lib/fusion-symbols";
import type { TimeframeValue } from "@/lib/providers/types";

export type HistoryRangePreset =
	| "1M"
	| "3M"
	| "6M"
	| "YTD"
	| "1Y"
	| "3Y"
	| "5Y"
	| "10Y"
	| "MAX"
	| "CUSTOM";

export interface HistoryRangeOption {
	value: HistoryRangePreset;
	label: string;
}

export const HISTORY_RANGE_OPTIONS: HistoryRangeOption[] = [
	{ value: "1M", label: "1M" },
	{ value: "3M", label: "3M" },
	{ value: "6M", label: "6M" },
	{ value: "YTD", label: "YTD" },
	{ value: "1Y", label: "1Y" },
	{ value: "3Y", label: "3Y" },
	{ value: "5Y", label: "5Y" },
	{ value: "10Y", label: "10Y" },
	{ value: "MAX", label: "MAX" },
	{ value: "CUSTOM", label: "Custom" },
];

interface HistoryWindowInput {
	preset: HistoryRangePreset;
	timeframe: TimeframeValue;
	symbol: FusionSymbol;
	customStartYear?: number;
	now?: Date;
}

export interface HistoryWindow {
	startEpoch: number;
	endEpoch: number;
	estimatedBars: number;
	requestLimit: number;
	effectiveStartYear: number;
	isCapped: boolean;
}

const TIMEFRAME_SECONDS: Record<TimeframeValue, number> = {
	"1m": 60,
	"3m": 180,
	"5m": 300,
	"15m": 900,
	"30m": 1800,
	"1H": 3600,
	"2H": 7200,
	"4H": 14400,
	"1D": 86400,
	"1W": 604800,
	"1M": 2592000,
};

function addMonths(date: Date, delta: number): Date {
	const copy = new Date(date.getTime());
	copy.setUTCMonth(copy.getUTCMonth() + delta);
	return copy;
}

function addYears(date: Date, delta: number): Date {
	const copy = new Date(date.getTime());
	copy.setUTCFullYear(copy.getUTCFullYear() + delta);
	return copy;
}

export function clampStartYearForSymbol(
	year: number,
	symbol: FusionSymbol,
	now: Date = new Date(),
): number {
	const minYear = getDefaultStartYear(symbol);
	const maxYear = now.getUTCFullYear();
	const clean = Math.floor(year);
	if (!Number.isFinite(clean)) return minYear;
	return Math.max(minYear, Math.min(clean, maxYear));
}

export function buildHistoryWindow({
	preset,
	timeframe,
	symbol,
	customStartYear,
	now = new Date(),
}: HistoryWindowInput): HistoryWindow {
	const startYearFloor = getDefaultStartYear(symbol);
	let start = new Date(now.getTime());

	switch (preset) {
		case "1M":
			start = addMonths(now, -1);
			break;
		case "3M":
			start = addMonths(now, -3);
			break;
		case "6M":
			start = addMonths(now, -6);
			break;
		case "YTD":
			start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
			break;
		case "1Y":
			start = addYears(now, -1);
			break;
		case "3Y":
			start = addYears(now, -3);
			break;
		case "5Y":
			start = addYears(now, -5);
			break;
		case "10Y":
			start = addYears(now, -10);
			break;
		case "CUSTOM": {
			const resolvedYear = clampStartYearForSymbol(customStartYear ?? startYearFloor, symbol, now);
			start = new Date(Date.UTC(resolvedYear, 0, 1, 0, 0, 0, 0));
			break;
		}
		default:
			start = new Date(Date.UTC(startYearFloor, 0, 1, 0, 0, 0, 0));
			break;
	}

	const minStart = new Date(Date.UTC(startYearFloor, 0, 1, 0, 0, 0, 0));
	if (start < minStart) {
		start = minStart;
	}

	const startEpoch = Math.floor(start.getTime() / 1000);
	const endEpoch = Math.floor(now.getTime() / 1000);
	const secondsPerBar = TIMEFRAME_SECONDS[timeframe];
	const estimatedBars = Math.max(1, Math.ceil((endEpoch - startEpoch) / secondsPerBar));

	const barCap = timeframe === "1D" || timeframe === "1W" || timeframe === "1M" ? 60000 : 5000;
	const requestLimit = Math.max(300, Math.min(estimatedBars + 32, barCap));
	const effectiveStartYear = start.getUTCFullYear();
	const isCapped = estimatedBars + 32 > barCap;

	return {
		startEpoch,
		endEpoch,
		estimatedBars,
		requestLimit,
		effectiveStartYear,
		isCapped,
	};
}
