// Chart Layers for rendering different chart components

import type { CoordinateSystem } from "./CoordinateSystem";
import type {
	Candle,
	ChartConfig,
	ChartState,
	Drawing,
	IndicatorConfig,
	IndicatorResult,
	Layer,
	Viewport,
} from "./types";

// Background Layer
export class BackgroundLayer implements Layer {
	name = "background";
	zIndex = 0;
	visible = true;

	private config: ChartConfig;

	constructor(config: ChartConfig) {
		this.config = config;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		ctx.fillStyle = this.config.backgroundColor;
		ctx.fillRect(0, 0, state.width, state.height);
	}
}

// Grid Layer
export class GridLayer implements Layer {
	name = "grid";
	zIndex = 1;
	visible = true;

	private config: ChartConfig;
	private coordSystem: CoordinateSystem;

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const { candles, viewport, width, height } = state;

		ctx.strokeStyle = this.config.gridColor;
		ctx.lineWidth = this.config.gridLineWidth;

		// Get chart bounds
		const mainBounds = this.coordSystem.getMainChartBounds(width, height);
		const volumeBounds = this.coordSystem.getVolumeChartBounds(width, height);

		// Draw horizontal grid lines (price levels)
		const priceSteps = this.calculatePriceSteps(viewport.yMin, viewport.yMax);

		for (const price of priceSteps) {
			const y = this.coordSystem.priceToY(price, viewport, height, state.scaleType);

			if (y >= mainBounds.top && y <= mainBounds.bottom) {
				ctx.beginPath();
				ctx.moveTo(mainBounds.left, y);
				ctx.lineTo(mainBounds.right, y);
				ctx.stroke();
			}
		}

		// Draw vertical grid lines (time intervals)
		const timeSteps = this.calculateTimeSteps(candles, viewport, width);

		for (let i = 0; i < timeSteps.length; i++) {
			const candle = candles[timeSteps[i]];
			if (!candle) continue;

			const x = this.coordSystem.timeToX(candle.time, candles, viewport, width);

			if (x >= mainBounds.left && x <= mainBounds.right) {
				ctx.beginPath();
				ctx.moveTo(x, mainBounds.top);
				ctx.lineTo(x, volumeBounds.bottom);
				ctx.stroke();
			}
		}
	}

	private calculatePriceSteps(yMin: number, yMax: number): number[] {
		const range = yMax - yMin;
		const targetSteps = 8;
		const rawStep = range / targetSteps;

		// Round to nice numbers
		const magnitude = 10 ** Math.floor(Math.log10(rawStep));
		const normalized = rawStep / magnitude;

		let step: number;
		if (normalized <= 1) step = magnitude;
		else if (normalized <= 2) step = 2 * magnitude;
		else if (normalized <= 5) step = 5 * magnitude;
		else step = 10 * magnitude;

		const steps: number[] = [];
		const start = Math.ceil(yMin / step) * step;

		for (let price = start; price <= yMax; price += step) {
			steps.push(price);
		}

		return steps;
	}

	private calculateTimeSteps(_candles: Candle[], viewport: Viewport, _width: number): number[] {
		const { viewStartIndex, viewEndIndex } = viewport;
		const _totalCandleWidth = this.config.candleWidth + this.config.candleSpacing;
		const visibleCount = viewEndIndex - viewStartIndex;

		// Determine step based on visible candles
		let step = 1;
		if (visibleCount > 200) step = 30;
		else if (visibleCount > 100) step = 20;
		else if (visibleCount > 50) step = 10;
		else if (visibleCount > 20) step = 5;
		else step = Math.ceil(visibleCount / 6);

		const steps: number[] = [];
		const startIndex = Math.floor(viewStartIndex);
		const endIndex = Math.floor(viewEndIndex);

		for (let i = startIndex; i <= endIndex; i += step) {
			steps.push(i);
		}

		return steps;
	}
}

// Candle Layer
export class CandleLayer implements Layer {
	name = "candles";
	zIndex = 2;
	visible = true;

	private config: ChartConfig;
	private coordSystem: CoordinateSystem;

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const { candles, viewport, width, height } = state;

		const mainBounds = this.coordSystem.getMainChartBounds(width, height);
		const startIndex = Math.max(0, Math.floor(viewport.viewStartIndex));
		const endIndex = Math.min(candles.length, Math.ceil(viewport.viewEndIndex));

		for (let i = startIndex; i < endIndex; i++) {
			const candle = candles[i];
			const x = this.coordSystem.timeToX(candle.time, candles, viewport, width);

			// Skip if outside visible area
			if (x < mainBounds.left - 20 || x > mainBounds.right + 20) continue;

			const isUp = candle.close >= candle.open;
			const color = isUp ? this.config.upColor : this.config.downColor;

			const yHigh = this.coordSystem.priceToY(candle.high, viewport, height, state.scaleType);
			const yLow = this.coordSystem.priceToY(candle.low, viewport, height, state.scaleType);
			const yOpen = this.coordSystem.priceToY(candle.open, viewport, height, state.scaleType);
			const yClose = this.coordSystem.priceToY(candle.close, viewport, height, state.scaleType);

			const candleWidth = this.config.candleWidth * (viewport.pxPerCandle / 10);
			const halfWidth = candleWidth / 2;

			// Draw wick
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(x, yHigh);
			ctx.lineTo(x, yLow);
			ctx.stroke();

			// Draw body
			const bodyTop = Math.min(yOpen, yClose);
			const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));

			ctx.fillStyle = color;
			ctx.fillRect(x - halfWidth, bodyTop, candleWidth, bodyHeight);

			// Add border for better visibility
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.strokeRect(x - halfWidth, bodyTop, candleWidth, bodyHeight);
		}
	}
}

// Volume Layer
export class VolumeLayer implements Layer {
	name = "volume";
	zIndex = 3;
	visible = true;

	private config: ChartConfig;
	private coordSystem: CoordinateSystem;

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const { candles, viewport, width, height } = state;

		const maxVolume = this.coordSystem.calculateMaxVolume(candles, viewport);
		const volumeBounds = this.coordSystem.getVolumeChartBounds(width, height);
		const startIndex = Math.max(0, Math.floor(viewport.viewStartIndex));
		const endIndex = Math.min(candles.length, Math.ceil(viewport.viewEndIndex));

		for (let i = startIndex; i < endIndex; i++) {
			const candle = candles[i];
			const x = this.coordSystem.timeToX(candle.time, candles, viewport, width);

			// Skip if outside visible area
			if (x < volumeBounds.left - 20 || x > volumeBounds.right + 20) continue;

			const isUp = candle.close >= candle.open;
			const color = isUp ? this.config.volumeUpColor : this.config.volumeDownColor;

			const barHeight = this.coordSystem.getVolumeBarHeight(candle.volume, maxVolume, height);
			const barWidth = this.config.candleWidth * (viewport.pxPerCandle / 10);

			ctx.fillStyle = color;
			ctx.fillRect(x - barWidth / 2, volumeBounds.bottom - barHeight, barWidth, barHeight);
		}
	}
}

// Indicator Layer
export class IndicatorLayer implements Layer {
	name = "indicators";
	zIndex = 4;
	visible = true;
	private config: ChartConfig;
	private coordSystem: CoordinateSystem;
	private indicators: IndicatorConfig[] = [];
	private indicatorData: Map<string, IndicatorResult[]> = new Map();

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	setIndicators(indicators: IndicatorConfig[]) {
		this.indicators = indicators;
	}

	setIndicatorData(id: string, data: IndicatorResult[]) {
		this.indicatorData.set(id, data);
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const { candles, viewport, width, height } = state;

		for (const indicator of this.indicators) {
			if (!indicator.enabled || !indicator.visible) continue;

			const data = this.indicatorData.get(indicator.id);
			if (!data || data.length === 0) continue;

			// Render each line in the indicator
			const valueKeys = Object.keys(data[0].values);

			for (const key of valueKeys) {
				const color = indicator.colors[key] || "#3b82f6";

				ctx.strokeStyle = color;
				ctx.lineWidth = indicator.lineWidth;
				ctx.beginPath();

				let isStarted = false;

				for (let i = 0; i < data.length; i++) {
					const point = data[i];
					const value = point.values[key];

					if (value === undefined || Number.isNaN(value)) continue;

					const candleIndex = candles.findIndex((c) => c.time === point.time);
					if (candleIndex === -1) continue;

					const x = this.coordSystem.timeToX(point.time, candles, viewport, width);
					const y = this.coordSystem.priceToY(value, viewport, height, state.scaleType);

					if (!isStarted) {
						ctx.moveTo(x, y);
						isStarted = true;
					} else {
						ctx.lineTo(x, y);
					}
				}

				ctx.stroke();
			}
		}
	}
}

// Crosshair Layer
export class CrosshairLayer implements Layer {
	name = "crosshair";
	zIndex = 5;
	visible = true;

	private config: ChartConfig;
	private coordSystem: CoordinateSystem;

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const { mouseX, mouseY, candles, viewport, width, height } = state;

		if (mouseX === null || mouseY === null) return;

		const mainBounds = this.coordSystem.getMainChartBounds(width, height);
		const priceScaleBounds = this.coordSystem.getPriceScaleBounds(width, height);
		const timeScaleBounds = this.coordSystem.getTimeScaleBounds(width, height);

		// Draw vertical line
		ctx.strokeStyle = this.config.crosshairColor;
		ctx.lineWidth = 1;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(mouseX, mainBounds.top);
		ctx.lineTo(mouseX, timeScaleBounds.top);
		ctx.stroke();

		// Draw horizontal line
		ctx.beginPath();
		ctx.moveTo(mainBounds.left, mouseY);
		ctx.lineTo(width - this.config.padding.right, mouseY);
		ctx.stroke();
		ctx.setLineDash([]);

		// Draw price label
		const price = this.coordSystem.yToPrice(mouseY, viewport, height, state.scaleType);
		const priceLabel = this.coordSystem.formatPrice(price);

		ctx.fillStyle = this.config.crosshairLabelBg;
		ctx.fillRect(
			priceScaleBounds.left,
			mouseY - 12,
			priceScaleBounds.right - priceScaleBounds.left,
			24,
		);

		ctx.fillStyle = "#ffffff";
		ctx.font = "12px monospace";
		ctx.textAlign = "center";
		ctx.fillText(priceLabel, (priceScaleBounds.left + priceScaleBounds.right) / 2, mouseY + 4);

		// Draw time label
		const time = this.coordSystem.xToTime(mouseX, candles, viewport);
		if (time !== null) {
			const timeframeMs =
				viewport.pxPerCandle > 50 ? 60000 : viewport.pxPerCandle > 20 ? 3600000 : 86400000;
			const timeLabel = this.coordSystem.formatTime(time, timeframeMs);

			ctx.fillStyle = this.config.crosshairLabelBg;
			ctx.fillRect(
				mouseX - 40,
				timeScaleBounds.top,
				80,
				timeScaleBounds.bottom - timeScaleBounds.top,
			);

			ctx.fillStyle = "#ffffff";
			ctx.textAlign = "center";
			ctx.fillText(timeLabel, mouseX, timeScaleBounds.top + 18);
		}
	}
}

// Drawing Layer
export class DrawingLayer implements Layer {
	name = "drawing";
	zIndex = 6;
	visible = true;
	private config: ChartConfig;
	private coordSystem: CoordinateSystem;
	private drawings: Drawing[] = [];
	private activeDrawing: Drawing | null = null;

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	setDrawings(drawings: Drawing[]) {
		this.drawings = drawings;
	}

	setActiveDrawing(drawing: Drawing | null) {
		this.activeDrawing = drawing;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const allDrawings = [...this.drawings];
		if (this.activeDrawing) {
			allDrawings.push(this.activeDrawing);
		}

		for (const drawing of allDrawings) {
			if (!drawing.visible) continue;

			switch (drawing.type) {
				case "trendline":
					this.renderTrendline(ctx, drawing, state);
					break;
				case "horizontal_line":
					this.renderHorizontalLine(ctx, drawing, state);
					break;
				case "vertical_line":
					this.renderVerticalLine(ctx, drawing, state);
					break;
				case "rectangle":
					this.renderRectangle(ctx, drawing, state);
					break;
				case "fibonacci_retracement":
					this.renderFibonacciRetracement(ctx, drawing, state);
					break;
				case "measure":
					this.renderMeasure(ctx, drawing, state);
					break;
			}
		}
	}

	private renderTrendline(
		ctx: CanvasRenderingContext2D,
		drawing: Drawing,
		state: ChartState,
	): void {
		if (drawing.points.length < 2) return;

		const { candles, viewport, width, height } = state;
		const [p1, p2] = drawing.points;

		const x1 = this.coordSystem.timeToX(p1.time, candles, viewport, width);
		const y1 = this.coordSystem.priceToY(p1.price, viewport, height, state.scaleType);
		const x2 = this.coordSystem.timeToX(p2.time, candles, viewport, width);
		const y2 = this.coordSystem.priceToY(p2.price, viewport, height, state.scaleType);

		ctx.strokeStyle = drawing.color;
		ctx.lineWidth = drawing.lineWidth;

		if (drawing.lineStyle === "dashed") {
			ctx.setLineDash([10, 5]);
		} else if (drawing.lineStyle === "dotted") {
			ctx.setLineDash([3, 3]);
		} else {
			ctx.setLineDash([]);
		}

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.setLineDash([]);

		// Draw endpoints
		ctx.fillStyle = drawing.color;
		ctx.beginPath();
		ctx.arc(x1, y1, 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(x2, y2, 4, 0, Math.PI * 2);
		ctx.fill();
	}

	private renderHorizontalLine(
		ctx: CanvasRenderingContext2D,
		drawing: Drawing,
		state: ChartState,
	): void {
		if (drawing.points.length < 1) return;

		const { viewport, width, height } = state;
		const mainBounds = this.coordSystem.getMainChartBounds(width, height);
		const [p1] = drawing.points;

		const y = this.coordSystem.priceToY(p1.price, viewport, height, state.scaleType);

		ctx.strokeStyle = drawing.color;
		ctx.lineWidth = drawing.lineWidth;

		if (drawing.lineStyle === "dashed") {
			ctx.setLineDash([10, 5]);
		} else if (drawing.lineStyle === "dotted") {
			ctx.setLineDash([3, 3]);
		} else {
			ctx.setLineDash([]);
		}

		ctx.beginPath();
		ctx.moveTo(mainBounds.left, y);
		ctx.lineTo(mainBounds.right, y);
		ctx.stroke();
		ctx.setLineDash([]);

		// Draw price label
		ctx.fillStyle = drawing.color;
		ctx.font = "12px monospace";
		ctx.textAlign = "right";
		ctx.fillText(this.coordSystem.formatPrice(p1.price), mainBounds.right - 5, y - 5);
	}

	private renderVerticalLine(
		ctx: CanvasRenderingContext2D,
		drawing: Drawing,
		state: ChartState,
	): void {
		if (drawing.points.length < 1) return;

		const { candles, viewport, width, height } = state;
		const mainBounds = this.coordSystem.getMainChartBounds(width, height);
		const volumeBounds = this.coordSystem.getVolumeChartBounds(width, height);
		const [p1] = drawing.points;

		const x = this.coordSystem.timeToX(p1.time, candles, viewport, width);

		ctx.strokeStyle = drawing.color;
		ctx.lineWidth = drawing.lineWidth;

		if (drawing.lineStyle === "dashed") {
			ctx.setLineDash([10, 5]);
		} else if (drawing.lineStyle === "dotted") {
			ctx.setLineDash([3, 3]);
		} else {
			ctx.setLineDash([]);
		}

		ctx.beginPath();
		ctx.moveTo(x, mainBounds.top);
		ctx.lineTo(x, volumeBounds.bottom);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	private renderRectangle(
		ctx: CanvasRenderingContext2D,
		drawing: Drawing,
		state: ChartState,
	): void {
		if (drawing.points.length < 2) return;

		const { candles, viewport, width, height } = state;
		const [p1, p2] = drawing.points;

		const x1 = this.coordSystem.timeToX(p1.time, candles, viewport, width);
		const y1 = this.coordSystem.priceToY(p1.price, viewport, height, state.scaleType);
		const x2 = this.coordSystem.timeToX(p2.time, candles, viewport, width);
		const y2 = this.coordSystem.priceToY(p2.price, viewport, height, state.scaleType);

		const rectX = Math.min(x1, x2);
		const rectY = Math.min(y1, y2);
		const rectW = Math.abs(x2 - x1);
		const rectH = Math.abs(y2 - y1);

		// Fill
		ctx.fillStyle = `${drawing.color}20`;
		ctx.fillRect(rectX, rectY, rectW, rectH);

		// Stroke
		ctx.strokeStyle = drawing.color;
		ctx.lineWidth = drawing.lineWidth;
		ctx.strokeRect(rectX, rectY, rectW, rectH);
	}

	private renderFibonacciRetracement(
		ctx: CanvasRenderingContext2D,
		drawing: Drawing,
		state: ChartState,
	): void {
		if (drawing.points.length < 2) return;

		const { candles, viewport, width, height } = state;
		const mainBounds = this.coordSystem.getMainChartBounds(width, height);
		const [p1, p2] = drawing.points;

		const x1 = this.coordSystem.timeToX(p1.time, candles, viewport, width);
		const y1 = this.coordSystem.priceToY(p1.price, viewport, height, state.scaleType);
		const x2 = this.coordSystem.timeToX(p2.time, candles, viewport, width);
		const y2 = this.coordSystem.priceToY(p2.price, viewport, height, state.scaleType);

		const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
		const priceRange = p2.price - p1.price;

		// Draw base line
		ctx.strokeStyle = drawing.color;
		ctx.lineWidth = drawing.lineWidth;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();

		// Draw fib levels
		for (const level of fibLevels) {
			const price = p1.price + priceRange * level;
			const y = this.coordSystem.priceToY(price, viewport, height, state.scaleType);

			ctx.strokeStyle = `${drawing.color}60`;
			ctx.lineWidth = 1;
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(mainBounds.left, y);
			ctx.lineTo(mainBounds.right, y);
			ctx.stroke();
			ctx.setLineDash([]);

			// Label
			ctx.fillStyle = drawing.color;
			ctx.font = "11px monospace";
			ctx.textAlign = "right";
			ctx.fillText(
				`${(level * 100).toFixed(1)}% - ${this.coordSystem.formatPrice(price)}`,
				mainBounds.right - 5,
				y - 3,
			);
		}
	}

	private renderMeasure(ctx: CanvasRenderingContext2D, drawing: Drawing, state: ChartState): void {
		if (drawing.points.length < 2) return;

		const { candles, viewport, width, height } = state;
		const [p1, p2] = drawing.points;

		const x1 = this.coordSystem.timeToX(p1.time, candles, viewport, width);
		const y1 = this.coordSystem.priceToY(p1.price, viewport, height, state.scaleType);
		const x2 = this.coordSystem.timeToX(p2.time, candles, viewport, width);
		const y2 = this.coordSystem.priceToY(p2.price, viewport, height, state.scaleType);

		// Draw line
		ctx.strokeStyle = drawing.color;
		ctx.lineWidth = drawing.lineWidth;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.setLineDash([]);

		// Calculate measurements
		const priceDiff = p2.price - p1.price;
		const pricePercent = (priceDiff / p1.price) * 100;
		const bars = Math.abs(
			candles.findIndex((c) => c.time === p2.time) - candles.findIndex((c) => c.time === p1.time),
		);

		// Draw label
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;

		ctx.fillStyle = `${drawing.color}CC`;
		ctx.fillRect(midX - 60, midY - 25, 120, 50);

		ctx.fillStyle = "#ffffff";
		ctx.font = "11px monospace";
		ctx.textAlign = "center";
		ctx.fillText(
			`${priceDiff >= 0 ? "+" : ""}${this.coordSystem.formatPrice(priceDiff)}`,
			midX,
			midY - 8,
		);
		ctx.fillText(`${pricePercent >= 0 ? "+" : ""}${pricePercent.toFixed(2)}%`, midX, midY + 6);
		ctx.fillText(`${bars} bars`, midX, midY + 20);
	}
}

// Price Scale Layer
export class PriceScaleLayer implements Layer {
	name = "price_scale";
	zIndex = 7;
	visible = true;

	private config: ChartConfig;
	private coordSystem: CoordinateSystem;

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const { viewport, width, height } = state;
		const mainBounds = this.coordSystem.getMainChartBounds(width, height);
		const priceScaleBounds = this.coordSystem.getPriceScaleBounds(width, height);

		// Background
		ctx.fillStyle = this.config.backgroundColor;
		ctx.fillRect(
			priceScaleBounds.left,
			priceScaleBounds.top,
			priceScaleBounds.right - priceScaleBounds.left,
			priceScaleBounds.bottom - priceScaleBounds.top,
		);

		// Draw price levels
		const priceSteps = this.calculatePriceSteps(viewport.yMin, viewport.yMax);

		ctx.fillStyle = this.config.textColor;
		ctx.font = "11px monospace";
		ctx.textAlign = "right";

		for (const price of priceSteps) {
			const y = this.coordSystem.priceToY(price, viewport, height, state.scaleType);

			if (y >= mainBounds.top && y <= mainBounds.bottom) {
				ctx.fillText(this.coordSystem.formatPrice(price), priceScaleBounds.right - 5, y + 4);
			}
		}
	}

	private calculatePriceSteps(yMin: number, yMax: number): number[] {
		const range = yMax - yMin;
		const targetSteps = 8;
		const rawStep = range / targetSteps;

		const magnitude = 10 ** Math.floor(Math.log10(rawStep));
		const normalized = rawStep / magnitude;

		let step: number;
		if (normalized <= 1) step = magnitude;
		else if (normalized <= 2) step = 2 * magnitude;
		else if (normalized <= 5) step = 5 * magnitude;
		else step = 10 * magnitude;

		const steps: number[] = [];
		const start = Math.ceil(yMin / step) * step;

		for (let price = start; price <= yMax; price += step) {
			steps.push(price);
		}

		return steps;
	}
}

// Time Scale Layer
export class TimeScaleLayer implements Layer {
	name = "time_scale";
	zIndex = 8;
	visible = true;

	private config: ChartConfig;
	private coordSystem: CoordinateSystem;

	constructor(config: ChartConfig, coordSystem: CoordinateSystem) {
		this.config = config;
		this.coordSystem = coordSystem;
	}

	setConfig(config: ChartConfig) {
		this.config = config;
	}

	render(ctx: CanvasRenderingContext2D, state: ChartState): void {
		const { candles, viewport, width, height } = state;
		const timeScaleBounds = this.coordSystem.getTimeScaleBounds(width, height);

		// Background
		ctx.fillStyle = this.config.backgroundColor;
		ctx.fillRect(
			timeScaleBounds.left,
			timeScaleBounds.top,
			timeScaleBounds.right - timeScaleBounds.left,
			timeScaleBounds.bottom - timeScaleBounds.top,
		);

		// Draw time labels
		const timeSteps = this.calculateTimeSteps(candles, viewport, width);

		ctx.fillStyle = this.config.textColor;
		ctx.font = "11px monospace";
		ctx.textAlign = "center";

		const timeframeMs = this.estimateTimeframe(candles, viewport);

		for (let i = 0; i < timeSteps.length; i++) {
			const candle = candles[timeSteps[i]];
			if (!candle) continue;

			const x = this.coordSystem.timeToX(candle.time, candles, viewport, width);

			if (x >= timeScaleBounds.left && x <= timeScaleBounds.right) {
				const timeLabel = this.coordSystem.formatTime(candle.time, timeframeMs);
				ctx.fillText(timeLabel, x, timeScaleBounds.top + 18);
			}
		}
	}

	private estimateTimeframe(candles: Candle[], _viewport: Viewport): number {
		if (candles.length < 2) return 60000;
		const timeDiff = candles[1].time - candles[0].time;
		return timeDiff * 1000;
	}

	private calculateTimeSteps(_candles: Candle[], viewport: Viewport, _width: number): number[] {
		const { viewStartIndex, viewEndIndex } = viewport;
		const visibleCount = viewEndIndex - viewStartIndex;

		let step = 1;
		if (visibleCount > 200) step = 30;
		else if (visibleCount > 100) step = 20;
		else if (visibleCount > 50) step = 10;
		else if (visibleCount > 20) step = 5;
		else step = Math.ceil(visibleCount / 6);

		const steps: number[] = [];
		const startIndex = Math.floor(viewStartIndex);
		const endIndex = Math.floor(viewEndIndex);

		for (let i = startIndex; i <= endIndex; i += step) {
			steps.push(i);
		}

		return steps;
	}
}
