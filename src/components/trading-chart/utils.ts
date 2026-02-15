import type { ChartType } from "@/chart/types";
import type { TradingChartCandle } from "@/components/trading-chart/types";

export const formatPrice = (price: number): string => {
	if (price < 0.01) return price.toFixed(6);
	if (price < 1) return price.toFixed(4);
	if (price < 100) return price.toFixed(2);
	return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatVolume = (volume: number): string => {
	if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
	if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
	if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
	return volume.toString();
};

export const formatTime = (timestamp: number): string => {
	const date = new Date(timestamp * 1000);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const toOhlcvData = (candleData: TradingChartCandle[]): TradingChartCandle[] => {
	return candleData.map((d) => ({
		time: d.time,
		open: d.open,
		high: d.high,
		low: d.low,
		close: d.close,
		volume: d.volume,
	}));
};

export const calculateHeikinAshi = (data: TradingChartCandle[]): TradingChartCandle[] => {
	const result: TradingChartCandle[] = [];

	for (let i = 0; i < data.length; i++) {
		const d = data[i];

		if (i === 0) {
			result.push({
				time: d.time,
				open: d.open,
				high: d.high,
				low: d.low,
				close: (d.open + d.high + d.low + d.close) / 4,
				volume: d.volume,
			});
		} else {
			const prev = result[i - 1];
			const close = (d.open + d.high + d.low + d.close) / 4;
			const open = (prev.open + prev.close) / 2;

			result.push({
				time: d.time,
				open,
				high: Math.max(d.high, open, close),
				low: Math.min(d.low, open, close),
				close,
				volume: d.volume,
			});
		}
	}

	return result;
};

export const getMainSeriesData = (
	candleData: TradingChartCandle[],
	type: ChartType,
): TradingChartCandle[] | Array<{ time: number; value: number }> => {
	if (type === "line" || type === "area") {
		return candleData.map((d) => ({ time: d.time, value: d.close }));
	}
	if (type === "heikinashi") {
		return calculateHeikinAshi(candleData);
	}
	return candleData;
};

export const getVolumeSeriesData = (candleData: TradingChartCandle[]) => {
	return candleData.map((d) => ({
		time: d.time,
		value: d.volume,
		color: d.close >= d.open ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)",
	}));
};
