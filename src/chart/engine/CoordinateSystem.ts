// Chart Coordinate System
// Handles conversion between data space and screen space

import type { Candle, ChartConfig, ScaleType, Viewport } from "./types";

export interface CoordinateSystemConfig {
	viewport: Viewport;
	scaleType: ScaleType;
	candles: Candle[];
	dpr: number;
}

interface ViewportResolved {
	startIndex: number;
	endIndex: number;
	candleWidth: number;
	candleSpacing: number;
	offsetX: number;
	width: number;
	height: number;
	yMin: number;
	yMax: number;
}

interface ChartBounds {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

export class CoordinateSystem {
	private viewport: Viewport;
	private scaleType: ScaleType;
	private candles: Candle[];
	private dpr: number;
	private config: ChartConfig | null = null;

	constructor(config: CoordinateSystemConfig) {
		this.viewport = config.viewport;
		this.scaleType = config.scaleType;
		this.candles = config.candles;
		this.dpr = config.dpr;
	}

	update(config: Partial<CoordinateSystemConfig>) {
		if (config.viewport) this.viewport = config.viewport;
		if (config.scaleType) this.scaleType = config.scaleType;
		if (config.candles) this.candles = config.candles;
		if (config.dpr) this.dpr = config.dpr;
	}

	setConfig(config: ChartConfig): void {
		this.config = config;
	}

	private resolveViewport(viewport?: Viewport): ViewportResolved {
		const source = viewport ?? this.viewport;
		const pxPerCandle = Number.isFinite(source.pxPerCandle) ? source.pxPerCandle : 10;
		const baseCandleWidth = source.candleWidth ?? this.config?.candleWidth ?? 8;
		const candleWidth = Math.max(1, baseCandleWidth * (pxPerCandle / 10));
		const candleSpacing = source.candleSpacing ?? this.config?.candleSpacing ?? 2;
		const width = source.width ?? 1200;
		const height = source.height ?? 700;
		const startIndex = source.startIndex ?? source.viewStartIndex;
		const endIndex = source.endIndex ?? source.viewEndIndex;
		const offsetX = source.offsetX ?? this.config?.padding.left ?? 0;
		return {
			startIndex,
			endIndex,
			candleWidth,
			candleSpacing,
			offsetX,
			width,
			height,
			yMin: source.yMin,
			yMax: source.yMax,
		};
	}

	private resolveCandles(candles?: Candle[]): Candle[] {
		return candles ?? this.candles;
	}

	private resolveScaleType(scaleType?: ScaleType): ScaleType {
		return scaleType ?? this.scaleType;
	}

	getVisibleCandles(candles?: Candle[], viewport?: Viewport): Candle[] {
		const resolvedCandles = this.resolveCandles(candles);
		const vp = this.resolveViewport(viewport);
		const clampedStart = Math.max(0, Math.floor(vp.startIndex));
		const clampedEnd = Math.min(resolvedCandles.length, Math.ceil(vp.endIndex));
		return resolvedCandles.slice(clampedStart, clampedEnd);
	}

	getVisiblePriceRange(candles?: Candle[], viewport?: Viewport): { min: number; max: number } {
		const resolvedCandles = this.getVisibleCandles(candles, viewport);
		if (resolvedCandles.length === 0) {
			return { min: 0, max: 100 };
		}

		let min = Number.POSITIVE_INFINITY;
		let max = Number.NEGATIVE_INFINITY;
		for (const candle of resolvedCandles) {
			if (candle.low < min) min = candle.low;
			if (candle.high > max) max = candle.high;
		}

		const range = Math.max(1e-8, max - min);
		const padding = range * 0.05;
		return { min: min - padding, max: max + padding };
	}

	calculateAutoRange(
		candles: Candle[],
		viewport: Viewport,
		_height: number,
	): { yMin: number; yMax: number } {
		const range = this.getVisiblePriceRange(candles, viewport);
		return { yMin: range.min, yMax: range.max };
	}

	timeToX(time: number, candles?: Candle[], viewport?: Viewport, _width?: number): number {
		const resolvedCandles = this.resolveCandles(candles);
		const index = resolvedCandles.findIndex((entry) => entry.time === time);
		if (index < 0) return -1;
		return this.indexToX(index, viewport);
	}

	indexToX(index: number, viewport?: Viewport): number {
		const vp = this.resolveViewport(viewport);
		return (
			(index - vp.startIndex) * (vp.candleWidth + vp.candleSpacing) +
			vp.offsetX +
			vp.candleWidth / 2
		);
	}

	xToIndex(x: number, viewport?: Viewport): number {
		const vp = this.resolveViewport(viewport);
		return vp.startIndex + (x - vp.offsetX) / (vp.candleWidth + vp.candleSpacing);
	}

	xToTime(x: number, candles?: Candle[], viewport?: Viewport): number | null {
		const resolvedCandles = this.resolveCandles(candles);
		const vp = this.resolveViewport(viewport);
		const index = Math.round(this.xToIndex(x, viewport));
		if (index < 0 || index >= resolvedCandles.length) return null;
		if (index < Math.floor(vp.startIndex) || index > Math.ceil(vp.endIndex)) return null;
		return resolvedCandles[index].time;
	}

	priceToY(price: number, viewport?: Viewport, _height?: number, scaleType?: ScaleType): number {
		const vp = this.resolveViewport(viewport);
		let min = vp.yMin;
		let max = vp.yMax;
		if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
			const range = this.getVisiblePriceRange();
			min = range.min;
			max = range.max;
		}

		const activeScale = this.resolveScaleType(scaleType);
		if (activeScale === "log") {
			const safePrice = Math.max(price, 1e-8);
			const safeMin = Math.max(min, 1e-8);
			const safeMax = Math.max(max, safeMin + 1e-8);
			const logMin = Math.log10(safeMin);
			const logMax = Math.log10(safeMax);
			const ratio = (Math.log10(safePrice) - logMin) / Math.max(1e-8, logMax - logMin);
			return vp.height * (1 - ratio);
		}

		const ratio = (price - min) / Math.max(1e-8, max - min);
		return vp.height * (1 - ratio);
	}

	yToPrice(y: number, viewport?: Viewport, _height?: number, scaleType?: ScaleType): number {
		const vp = this.resolveViewport(viewport);
		let min = vp.yMin;
		let max = vp.yMax;
		if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
			const range = this.getVisiblePriceRange();
			min = range.min;
			max = range.max;
		}

		const activeScale = this.resolveScaleType(scaleType);
		if (activeScale === "log") {
			const safeMin = Math.max(min, 1e-8);
			const safeMax = Math.max(max, safeMin + 1e-8);
			const logMin = Math.log10(safeMin);
			const logMax = Math.log10(safeMax);
			const ratio = 1 - y / Math.max(1, vp.height);
			return 10 ** (logMin + ratio * (logMax - logMin));
		}

		const ratio = 1 - y / Math.max(1, vp.height);
		return min + ratio * (max - min);
	}

	getMainChartBounds(width: number, height: number): ChartBounds {
		const padding = this.config?.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
		const priceScaleWidth = this.config?.priceScaleWidth ?? 0;
		const timeScaleHeight = this.config?.timeScaleHeight ?? 0;
		const volumeHeight = Math.max(0, (this.config?.volumeHeightRatio ?? 0.2) * height);
		const right = Math.max(padding.left, width - padding.right - priceScaleWidth);
		const bottom = Math.max(padding.top, height - padding.bottom - timeScaleHeight - volumeHeight);
		return { top: padding.top, right, bottom, left: padding.left };
	}

	getVolumeChartBounds(width: number, height: number): ChartBounds {
		const padding = this.config?.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
		const priceScaleWidth = this.config?.priceScaleWidth ?? 0;
		const timeScaleHeight = this.config?.timeScaleHeight ?? 0;
		const volumeHeight = Math.max(0, (this.config?.volumeHeightRatio ?? 0.2) * height);
		const right = Math.max(padding.left, width - padding.right - priceScaleWidth);
		const bottom = Math.max(padding.top, height - padding.bottom - timeScaleHeight);
		const top = Math.max(padding.top, bottom - volumeHeight);
		return { top, right, bottom, left: padding.left };
	}

	getPriceScaleBounds(width: number, height: number): ChartBounds {
		const padding = this.config?.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
		const priceScaleWidth = this.config?.priceScaleWidth ?? 0;
		const timeScaleHeight = this.config?.timeScaleHeight ?? 0;
		const volumeHeight = Math.max(0, (this.config?.volumeHeightRatio ?? 0.2) * height);
		const right = Math.max(0, width - padding.right);
		const left = Math.max(0, right - priceScaleWidth);
		const bottom = Math.max(padding.top, height - padding.bottom - timeScaleHeight - volumeHeight);
		return { top: padding.top, right, bottom, left };
	}

	getTimeScaleBounds(width: number, height: number): ChartBounds {
		const padding = this.config?.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
		const timeScaleHeight = this.config?.timeScaleHeight ?? 0;
		const top = Math.max(0, height - timeScaleHeight);
		return { top, right: width - padding.right, bottom: height, left: padding.left };
	}

	calculateMaxVolume(candles: Candle[], viewport: Viewport): number {
		const visible = this.getVisibleCandles(candles, viewport);
		if (visible.length === 0) return 1;
		return Math.max(...visible.map((entry) => entry.volume), 1);
	}

	getVolumeBarHeight(volume: number, maxVolume: number, height: number): number {
		const bounds = this.getVolumeChartBounds(this.resolveViewport().width, height);
		const available = Math.max(1, bounds.bottom - bounds.top);
		return (Math.max(0, volume) / Math.max(1, maxVolume)) * available;
	}

	formatPrice(price: number): string {
		if (Math.abs(price) >= 1000) return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
		if (Math.abs(price) >= 1) return price.toFixed(2);
		if (Math.abs(price) >= 0.01) return price.toFixed(4);
		return price.toFixed(6);
	}

	formatTime(timestamp: number, timeframeMs?: number): string {
		const date = new Date(timestamp * 1000);
		const format: Intl.DateTimeFormatOptions =
			timeframeMs && timeframeMs <= 60 * 60 * 1000
				? { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
				: { month: "short", day: "numeric" };
		return date.toLocaleString("en-US", format);
	}

	getScaledValue(value: number): number {
		return value * this.dpr;
	}

	getVisibleTimeRange(): { start: number; end: number } | null {
		const visible = this.getVisibleCandles();
		if (visible.length === 0) return null;
		return {
			start: visible[0].time,
			end: visible[visible.length - 1].time,
		};
	}
}

export default CoordinateSystem;
