// Core types for the Chart Engine

export interface Candle {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	isUp?: boolean;
}

export interface Viewport {
	viewStartIndex: number;
	viewEndIndex: number;
	pxPerCandle: number;
	yMin: number;
	yMax: number;
	offsetY: number;
	width?: number;
	height?: number;
	offsetX?: number;
	startIndex?: number;
	endIndex?: number;
	candleWidth?: number;
	candleSpacing?: number;
}

export type ScaleType = "linear" | "log";
export type TimeframeValue = "1m" | "5m" | "15m" | "30m" | "1H" | "4H" | "1D" | "1W" | "1M";

export interface ChartConfig {
	backgroundColor: string;
	gridColor: string;
	textColor: string;
	upColor: string;
	downColor: string;
	volumeUpColor: string;
	volumeDownColor: string;
	crosshairColor: string;
	crosshairLabelBg: string;
	gridLineWidth: number;
	candleWidth: number;
	candleSpacing: number;
	volumeHeightRatio: number;
	priceScaleWidth: number;
	timeScaleHeight: number;
	padding: {
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
}

export interface Layer {
	name: string;
	zIndex: number;
	visible: boolean;
	render(ctx: CanvasRenderingContext2D, state: ChartState): void;
	destroy?(): void;
}

export interface ChartState {
	candles: Candle[];
	viewport: Viewport;
	config: ChartConfig;
	width: number;
	height: number;
	mouseX: number | null;
	mouseY: number | null;
	isDragging: boolean;
	isDarkMode: boolean;
	scaleType: "linear" | "log";
}

export interface Drawing {
	id: string;
	type: DrawingType;
	points: DrawingPoint[];
	color: string;
	lineWidth: number;
	lineStyle: "solid" | "dashed" | "dotted";
	locked: boolean;
	visible: boolean;
}

export type DrawingType =
	| "trendline"
	| "horizontal_line"
	| "vertical_line"
	| "rectangle"
	| "fibonacci_retracement"
	| "fibonacci_extension"
	| "pitchfork"
	| "text"
	| "measure";

export interface DrawingPoint {
	time: number;
	price: number;
}

export interface DrawingTool {
	type: DrawingType;
	cursor: string;
	points: number;
	onCreate?: (points: DrawingPoint[]) => Partial<Drawing>;
}

export interface IndicatorConfig {
	id: string;
	name: string;
	type: IndicatorType;
	enabled: boolean;
	params: Record<string, number | string>;
	colors: Record<string, string>;
	lineWidth: number;
	visible: boolean;
	overlay: boolean;
}

export type IndicatorType =
	| "sma"
	| "ema"
	| "wma"
	| "vwma"
	| "hma"
	| "macd"
	| "rsi"
	| "bollinger"
	| "keltner"
	| "atr"
	| "adx"
	| "stochastic"
	| "cci"
	| "williams_r"
	| "mfi"
	| "obv"
	| "vwap"
	| "ichimoku"
	| "parabolic_sar"
	| "volume_profile";

export interface IndicatorResult {
	time: number;
	values: Record<string, number>;
}

export interface ChartTheme {
	dark: ChartConfig;
	light: ChartConfig;
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
	backgroundColor: "#0f172a",
	gridColor: "#1e293b",
	textColor: "#94a3b8",
	upColor: "#22c55e",
	downColor: "#ef4444",
	volumeUpColor: "rgba(34, 197, 94, 0.5)",
	volumeDownColor: "rgba(239, 68, 68, 0.5)",
	crosshairColor: "#3b82f6",
	crosshairLabelBg: "#3b82f6",
	gridLineWidth: 1,
	candleWidth: 8,
	candleSpacing: 2,
	volumeHeightRatio: 0.2,
	priceScaleWidth: 70,
	timeScaleHeight: 30,
	padding: {
		top: 20,
		right: 10,
		bottom: 10,
		left: 10,
	},
};

export const LIGHT_CHART_CONFIG: ChartConfig = {
	backgroundColor: "#ffffff",
	gridColor: "#e2e8f0",
	textColor: "#475569",
	upColor: "#22c55e",
	downColor: "#ef4444",
	volumeUpColor: "rgba(34, 197, 94, 0.5)",
	volumeDownColor: "rgba(239, 68, 68, 0.5)",
	crosshairColor: "#2563eb",
	crosshairLabelBg: "#2563eb",
	gridLineWidth: 1,
	candleWidth: 8,
	candleSpacing: 2,
	volumeHeightRatio: 0.2,
	priceScaleWidth: 70,
	timeScaleHeight: 30,
	padding: {
		top: 20,
		right: 10,
		bottom: 10,
		left: 10,
	},
};
