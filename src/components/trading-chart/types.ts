export interface TradingChartCandle {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface HoveredPrice {
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	time: string;
}

export interface ChartSeriesHandle {
	setData: (data: Array<unknown>) => void;
	priceToCoordinate?: (price: number) => number | null;
	coordinateToPrice?: (coordinate: number) => number | null;
	priceScale?: () => {
		applyOptions: (options: Record<string, unknown>) => void;
	};
}

export interface ChartTimeScaleHandle {
	subscribeVisibleTimeRangeChange: (handler: () => void) => void;
	getVisibleRange: () => unknown;
	setVisibleRange: (range: unknown) => void;
	fitContent: () => void;
	timeToCoordinate?: (time: number) => number | null;
	coordinateToTime?: (coordinate: number) => unknown;
}

export interface CrosshairSeriesDataPoint {
	open?: number;
	high?: number;
	low?: number;
	close?: number;
	value?: number;
}

export interface CrosshairMovePayload {
	time?: number;
	seriesData?: Map<unknown, CrosshairSeriesDataPoint>;
	point?: { x: number; y: number };
}

export interface ChartHandle {
	remove: () => void;
	removeSeries?: (series: ChartSeriesHandle) => void;
	addSeries?: (seriesType: unknown, options: Record<string, unknown>) => ChartSeriesHandle;
	addLineSeries?: (options: Record<string, unknown>) => ChartSeriesHandle;
	addAreaSeries?: (options: Record<string, unknown>) => ChartSeriesHandle;
	addHistogramSeries?: (options: Record<string, unknown>) => ChartSeriesHandle;
	addCandlestickSeries?: (options: Record<string, unknown>) => ChartSeriesHandle;
	timeScale: () => ChartTimeScaleHandle;
	applyOptions: (options: Record<string, unknown>) => void;
	subscribeCrosshairMove: (handler: (param: CrosshairMovePayload) => void) => void;
	subscribeClick?: (handler: (param: CrosshairMovePayload) => void) => void;
	unsubscribeClick?: (handler: (param: CrosshairMovePayload) => void) => void;
}

export interface LightweightChartsModule {
	createChart: (container: HTMLDivElement, options: Record<string, unknown>) => ChartHandle;
	CrosshairMode: { Normal: number };
	ColorType: { Solid: string | number };
	CandlestickSeries: unknown;
	AreaSeries: unknown;
	HistogramSeries: unknown;
	LineSeries: unknown;
}
