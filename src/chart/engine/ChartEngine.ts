// Chart Engine - Main rendering engine for candlestick charts

import { CoordinateSystem } from "./CoordinateSystem";
import {
	BackgroundLayer,
	CandleLayer,
	CrosshairLayer,
	DrawingLayer,
	GridLayer,
	IndicatorLayer,
	PriceScaleLayer,
	TimeScaleLayer,
	VolumeLayer,
} from "./Layers";
import {
	type Candle,
	type ChartConfig,
	type ChartState,
	DEFAULT_CHART_CONFIG,
	type Drawing,
	type DrawingPoint,
	type DrawingType,
	type IndicatorConfig,
	type Layer,
	LIGHT_CHART_CONFIG,
	type Viewport,
} from "./types";

export interface ChartEngineOptions {
	container: HTMLCanvasElement;
	candles: Candle[];
	isDarkMode?: boolean;
	scaleType?: "linear" | "log";
	onCrosshairMove?: (
		data: {
			price: number;
			time: number | null;
			candle: Candle | null;
			x: number;
			y: number;
		} | null,
	) => void;
	onViewportChange?: (viewport: Viewport) => void;
	onDrawingCreate?: (drawing: Drawing) => void;
	onDrawingUpdate?: (drawing: Drawing) => void;
}

export class ChartEngine {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private dpr: number;

	private candles: Candle[] = [];
	private viewport: Viewport;
	private config: ChartConfig;
	private coordSystem: CoordinateSystem;

	private layers: Layer[] = [];
	private backgroundLayer: BackgroundLayer;
	private gridLayer: GridLayer;
	private candleLayer: CandleLayer;
	private volumeLayer: VolumeLayer;
	private indicatorLayer: IndicatorLayer;
	private crosshairLayer: CrosshairLayer;
	private drawingLayer: DrawingLayer;
	private priceScaleLayer: PriceScaleLayer;
	private timeScaleLayer: TimeScaleLayer;

	private mouseX: number | null = null;
	private mouseY: number | null = null;
	private isDragging = false;
	private lastDragX = 0;
	private isDarkMode = true;
	private scaleType: "linear" | "log" = "linear";

	private currentDrawing: Drawing | null = null;
	private activeDrawingTool: DrawingType | null = null;
	private tempDrawingPoints: DrawingPoint[] = [];

	private animationFrameId: number | null = null;
	private needsRender = true;

	private onCrosshairMove?: ChartEngineOptions["onCrosshairMove"];
	private onViewportChange?: ChartEngineOptions["onViewportChange"];
	private onDrawingCreate?: ChartEngineOptions["onDrawingCreate"];

	constructor(options: ChartEngineOptions) {
		this.canvas = options.container;
		const ctx = this.canvas.getContext("2d");
		if (!ctx) throw new Error("Failed to get 2D context");
		this.ctx = ctx;

		this.dpr = window.devicePixelRatio || 1;
		this.candles = options.candles;
		this.isDarkMode = options.isDarkMode ?? true;
		this.scaleType = options.scaleType ?? "linear";
		this.onCrosshairMove = options.onCrosshairMove;
		this.onViewportChange = options.onViewportChange;
		this.onDrawingCreate = options.onDrawingCreate;

		this.config = this.isDarkMode ? DEFAULT_CHART_CONFIG : LIGHT_CHART_CONFIG;
		// Initialize viewport
		this.viewport = {
			viewStartIndex: 0,
			viewEndIndex: Math.min(this.candles.length, 100),
			pxPerCandle: 10,
			yMin: 0,
			yMax: 100,
			offsetY: 0,
		};
		this.coordSystem = new CoordinateSystem({
			viewport: this.viewport,
			scaleType: this.scaleType,
			candles: this.candles,
			dpr: this.dpr,
		});
		this.coordSystem.setConfig(this.config);

		// Initialize layers
		this.backgroundLayer = new BackgroundLayer(this.config);
		this.gridLayer = new GridLayer(this.config, this.coordSystem);
		this.candleLayer = new CandleLayer(this.config, this.coordSystem);
		this.volumeLayer = new VolumeLayer(this.config, this.coordSystem);
		this.indicatorLayer = new IndicatorLayer(this.config, this.coordSystem);
		this.crosshairLayer = new CrosshairLayer(this.config, this.coordSystem);
		this.drawingLayer = new DrawingLayer(this.config, this.coordSystem);
		this.priceScaleLayer = new PriceScaleLayer(this.config, this.coordSystem);
		this.timeScaleLayer = new TimeScaleLayer(this.config, this.coordSystem);

		this.layers = [
			this.backgroundLayer,
			this.gridLayer,
			this.candleLayer,
			this.volumeLayer,
			this.indicatorLayer,
			this.crosshairLayer,
			this.drawingLayer,
			this.priceScaleLayer,
			this.timeScaleLayer,
		];

		this.setupCanvas();
		this.setupEventListeners();
		this.calculateInitialViewport();

		this.startRenderLoop();
	}

	private setupCanvas(): void {
		const rect = this.canvas.parentElement?.getBoundingClientRect();
		if (!rect) return;

		const width = rect.width;
		const height = rect.height;

		// Set canvas size with DPI scaling
		this.canvas.width = width * this.dpr;
		this.canvas.height = height * this.dpr;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;

		// Scale context for DPI
		this.ctx.scale(this.dpr, this.dpr);
	}

	private setupEventListeners(): void {
		// Mouse move
		this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));

		// Mouse leave
		this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));

		// Mouse down
		this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));

		// Mouse up
		this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));

		// Wheel
		this.canvas.addEventListener("wheel", this.handleWheel.bind(this), { passive: false });

		// Double click
		this.canvas.addEventListener("dblclick", this.handleDoubleClick.bind(this));

		// Resize observer
		const resizeObserver = new ResizeObserver(this.handleResize.bind(this));
		resizeObserver.observe(this.canvas.parentElement!);
	}

	private handleMouseMove(e: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		this.mouseX = e.clientX - rect.left;
		this.mouseY = e.clientY - rect.top;

		if (this.isDragging) {
			const deltaX = this.mouseX - this.lastDragX;

			// Pan
			const candleDelta = -deltaX / this.viewport.pxPerCandle;
			const newStartIndex = this.viewport.viewStartIndex + candleDelta;
			const newEndIndex = this.viewport.viewEndIndex + candleDelta;

			if (newStartIndex >= 0 && newEndIndex <= this.candles.length) {
				this.viewport.viewStartIndex = newStartIndex;
				this.viewport.viewEndIndex = newEndIndex;
				this.updateYRange();
				this.onViewportChange?.(this.viewport);
			}

			this.lastDragX = this.mouseX;
		}

		// Handle drawing
		if (this.activeDrawingTool && this.tempDrawingPoints.length > 0) {
			const time = this.coordSystem.xToTime(this.mouseX, this.candles, this.viewport);
			const price = this.coordSystem.yToPrice(
				this.mouseY,
				this.viewport,
				this.canvas.height / this.dpr,
				this.scaleType,
			);

			if (time !== null && price !== null) {
				this.currentDrawing = {
					id: "temp",
					type: this.activeDrawingTool,
					points: [...this.tempDrawingPoints.slice(0, -1), { time, price }],
					color: "#3b82f6",
					lineWidth: 2,
					lineStyle: "solid",
					locked: false,
					visible: true,
				};
				this.drawingLayer.setActiveDrawing(this.currentDrawing);
			}
		}

		// Fire crosshair callback
		if (this.mouseX !== null && this.mouseY !== null) {
			const time = this.coordSystem.xToTime(this.mouseX, this.candles, this.viewport);
			const price = this.coordSystem.yToPrice(
				this.mouseY,
				this.viewport,
				this.canvas.height / this.dpr,
				this.scaleType,
			);
			const candleIndex = Math.floor(
				this.viewport.viewStartIndex +
					(this.mouseX - this.config.padding.left) / this.viewport.pxPerCandle,
			);
			const candle = this.candles[candleIndex] || null;

			this.onCrosshairMove?.({
				price,
				time,
				candle,
				x: this.mouseX,
				y: this.mouseY,
			});
		}

		this.needsRender = true;
	}

	private handleMouseLeave(): void {
		this.mouseX = null;
		this.mouseY = null;
		this.onCrosshairMove?.(null);
		this.needsRender = true;
	}

	private handleMouseDown(e: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		if (this.activeDrawingTool) {
			const time = this.coordSystem.xToTime(x, this.candles, this.viewport);
			const price = this.coordSystem.yToPrice(
				y,
				this.viewport,
				this.canvas.height / this.dpr,
				this.scaleType,
			);

			if (time !== null && price !== null) {
				this.tempDrawingPoints.push({ time, price });

				const pointsRequired = this.getPointsRequired(this.activeDrawingTool);

				if (this.tempDrawingPoints.length >= pointsRequired) {
					// Create final drawing
					const drawing: Drawing = {
						id: `drawing-${Date.now()}`,
						type: this.activeDrawingTool,
						points: this.tempDrawingPoints.slice(0, pointsRequired),
						color: "#3b82f6",
						lineWidth: 2,
						lineStyle: "solid",
						locked: false,
						visible: true,
					};

					this.onDrawingCreate?.(drawing);
					this.tempDrawingPoints = [];
					this.currentDrawing = null;
					this.drawingLayer.setActiveDrawing(null);
				}
			}
		} else {
			this.isDragging = true;
			this.lastDragX = x;
		}

		this.needsRender = true;
	}

	private handleMouseUp(): void {
		this.isDragging = false;
	}

	private handleWheel(e: WheelEvent): void {
		e.preventDefault();

		const rect = this.canvas.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;

		// Calculate zoom center
		const centerIndex =
			this.viewport.viewStartIndex +
			(mouseX - this.config.padding.left) / this.viewport.pxPerCandle;

		// Zoom
		const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
		const newPxPerCandle = Math.max(3, Math.min(50, this.viewport.pxPerCandle * zoomFactor));

		// Calculate visible count
		const chartWidth =
			this.canvas.width / this.dpr -
			this.config.padding.left -
			this.config.padding.right -
			this.config.priceScaleWidth;
		const visibleCount = chartWidth / newPxPerCandle;

		const newStartIndex = centerIndex - (mouseX - this.config.padding.left) / newPxPerCandle;
		const newEndIndex = newStartIndex + visibleCount;

		if (newStartIndex >= 0 && newEndIndex <= this.candles.length) {
			this.viewport.pxPerCandle = newPxPerCandle;
			this.viewport.viewStartIndex = newStartIndex;
			this.viewport.viewEndIndex = newEndIndex;
			this.updateYRange();
			this.onViewportChange?.(this.viewport);
		}

		this.needsRender = true;
	}

	private handleDoubleClick(): void {
		// Reset view
		this.fitContent();
	}

	private handleResize(): void {
		this.setupCanvas();
		this.needsRender = true;
	}

	private getPointsRequired(type: DrawingType): number {
		switch (type) {
			case "horizontal_line":
			case "vertical_line":
			case "text":
				return 1;
			case "trendline":
			case "rectangle":
			case "fibonacci_retracement":
			case "fibonacci_extension":
			case "measure":
				return 2;
			case "pitchfork":
				return 3;
			default:
				return 2;
		}
	}

	private calculateInitialViewport(): void {
		const width = this.canvas.width / this.dpr;
		const chartWidth =
			width - this.config.padding.left - this.config.padding.right - this.config.priceScaleWidth;

		// Calculate visible count based on default px per candle
		const visibleCount = Math.floor(chartWidth / this.viewport.pxPerCandle);

		this.viewport.viewStartIndex = Math.max(0, this.candles.length - visibleCount);
		this.viewport.viewEndIndex = this.candles.length;

		this.updateYRange();
	}

	private updateYRange(): void {
		this.coordSystem.update({ viewport: this.viewport });
		const range = this.coordSystem.calculateAutoRange(
			this.candles,
			this.viewport,
			this.canvas.height / this.dpr,
		);

		this.viewport.yMin = range.yMin;
		this.viewport.yMax = range.yMax;
	}

	private startRenderLoop(): void {
		const render = () => {
			if (this.needsRender) {
				this.render();
				this.needsRender = false;
			}
			this.animationFrameId = requestAnimationFrame(render);
		};

		render();
	}

	private render(): void {
		const width = this.canvas.width / this.dpr;
		const height = this.canvas.height / this.dpr;
		this.coordSystem.update({
			viewport: { ...this.viewport, width, height },
			candles: this.candles,
			scaleType: this.scaleType,
		});

		// Clear canvas
		this.ctx.clearRect(0, 0, width, height);

		// Build chart state
		const state: ChartState = {
			candles: this.candles,
			viewport: this.viewport,
			config: this.config,
			width,
			height,
			mouseX: this.mouseX,
			mouseY: this.mouseY,
			isDragging: this.isDragging,
			isDarkMode: this.isDarkMode,
			scaleType: this.scaleType,
		};

		// Render layers in order
		const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

		for (const layer of sortedLayers) {
			if (layer.visible) {
				layer.render(this.ctx, state);
			}
		}
	}

	// Public API

	setCandles(candles: Candle[]): void {
		this.candles = candles;
		this.coordSystem.update({ candles });
		this.calculateInitialViewport();
		this.needsRender = true;
	}

	setDarkMode(isDarkMode: boolean): void {
		this.isDarkMode = isDarkMode;
		this.config = isDarkMode ? DEFAULT_CHART_CONFIG : LIGHT_CHART_CONFIG;

		// Update all layers
		this.backgroundLayer.setConfig(this.config);
		this.gridLayer.setConfig(this.config);
		this.candleLayer.setConfig(this.config);
		this.volumeLayer.setConfig(this.config);
		this.indicatorLayer.setConfig(this.config);
		this.crosshairLayer.setConfig(this.config);
		this.drawingLayer.setConfig(this.config);
		this.priceScaleLayer.setConfig(this.config);
		this.timeScaleLayer.setConfig(this.config);
		this.coordSystem.setConfig(this.config);

		this.needsRender = true;
	}

	setScaleType(scaleType: "linear" | "log"): void {
		this.scaleType = scaleType;
		this.coordSystem.update({ scaleType });
		this.needsRender = true;
	}

	setIndicators(indicators: IndicatorConfig[]): void {
		this.indicatorLayer.setIndicators(indicators);
		this.needsRender = true;
	}

	setIndicatorData(id: string, data: { time: number; values: Record<string, number> }[]): void {
		this.indicatorLayer.setIndicatorData(id, data);
		this.needsRender = true;
	}

	setDrawings(drawings: Drawing[]): void {
		this.drawingLayer.setDrawings(drawings);
		this.needsRender = true;
	}

	setActiveDrawingTool(tool: DrawingType | null): void {
		this.activeDrawingTool = tool;
		this.tempDrawingPoints = [];
		this.currentDrawing = null;
		this.drawingLayer.setActiveDrawing(null);

		// Set cursor
		this.canvas.style.cursor = tool ? "crosshair" : "default";
	}

	fitContent(): void {
		const width = this.canvas.width / this.dpr;
		const chartWidth =
			width - this.config.padding.left - this.config.padding.right - this.config.priceScaleWidth;

		this.viewport.pxPerCandle = 10;
		const visibleCount = Math.floor(chartWidth / this.viewport.pxPerCandle);

		this.viewport.viewStartIndex = Math.max(0, this.candles.length - visibleCount);
		this.viewport.viewEndIndex = this.candles.length;

		this.updateYRange();
		this.onViewportChange?.(this.viewport);
		this.needsRender = true;
	}

	goTo(time: number): void {
		const index = this.candles.findIndex((c) => c.time === time);
		if (index === -1) return;

		const width = this.canvas.width / this.dpr;
		const chartWidth =
			width - this.config.padding.left - this.config.padding.right - this.config.priceScaleWidth;
		const visibleCount = Math.floor(chartWidth / this.viewport.pxPerCandle);

		this.viewport.viewStartIndex = Math.max(0, index - visibleCount / 2);
		this.viewport.viewEndIndex = Math.min(
			this.candles.length,
			this.viewport.viewStartIndex + visibleCount,
		);

		this.updateYRange();
		this.onViewportChange?.(this.viewport);
		this.needsRender = true;
	}

	getViewport(): Viewport {
		this.coordSystem.update({ viewport: this.viewport });
		return { ...this.viewport };
	}

	getVisibleCandles(): Candle[] {
		return this.candles.slice(
			Math.max(0, Math.floor(this.viewport.viewStartIndex)),
			Math.min(this.candles.length, Math.ceil(this.viewport.viewEndIndex)),
		);
	}

	exportImage(): string {
		return this.canvas.toDataURL("image/png");
	}

	destroy(): void {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}
	}
}

export default ChartEngine;
