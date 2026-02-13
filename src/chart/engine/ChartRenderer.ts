// Chart Renderer - Canvas based rendering engine
import { Candle, ChartConfig, Viewport, Indicator, Drawing, CrosshairState, THEMES } from '../types';
import { CoordinateSystem } from './CoordinateSystem';

export interface RendererConfig {
  canvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  config: ChartConfig;
  candles: Candle[];
  indicators: Indicator[];
  drawings: Drawing[];
  crosshair: CrosshairState | null;
  symbol: string;
}

export class ChartRenderer {
  private canvas: HTMLCanvasElement;
  private overlayCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private overlayCtx: CanvasRenderingContext2D;
  private config: ChartConfig;
  private coord: CoordinateSystem | null = null;
  private dpr: number;
  
  // Dirty flags for optimized rendering
  private needsFullRedraw = true;
  private needsOverlayRedraw = true;

  constructor() {
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }

  initialize(config: RendererConfig) {
    this.canvas = config.canvas;
    this.overlayCanvas = config.overlayCanvas;
    this.ctx = this.canvas.getContext('2d', { alpha: false })!;
    this.overlayCtx = this.overlayCanvas.getContext('2d')!;
    this.config = config.config;
    this.setupCanvas();
  }

  private setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width * this.dpr;
    const height = rect.height * this.dpr;

    this.canvas.width = width;
    this.canvas.height = height;
    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;

    this.ctx.scale(this.dpr, this.dpr);
    this.overlayCtx.scale(this.dpr, this.dpr);
  }

  setCoordinateSystem(coord: CoordinateSystem) {
    this.coord = coord;
  }

  setConfig(config: Partial<ChartConfig>) {
    this.config = { ...this.config, ...config };
    this.needsFullRedraw = true;
  }

  // Main render method
  render(viewport: Viewport, candles: Candle[], indicators: Indicator[], drawings: Drawing[]) {
    if (!this.ctx || !this.coord) return;

    if (this.needsFullRedraw) {
      this.renderBackground(viewport);
      this.renderGrid(viewport);
      this.renderCandles(viewport, candles);
      this.renderVolume(viewport, candles);
      this.renderIndicators(viewport, indicators);
      this.renderDrawings(viewport, drawings);
      this.renderWatermark(viewport);
      this.needsFullRedraw = false;
    }
  }

  // Render crosshair on overlay canvas
  renderCrosshair(crosshair: CrosshairState | null, viewport: Viewport) {
    if (!this.overlayCtx) return;

    // Clear overlay
    this.overlayCtx.clearRect(0, 0, viewport.width, viewport.height);

    if (!crosshair || !crosshair.visible) return;

    const ctx = this.overlayCtx;
    ctx.strokeStyle = this.config.crosshairColor;
    ctx.lineWidth = 1;
    ctx.setLineDash(this.config.crosshairStyle === 'dashed' ? [5, 5] : []);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(crosshair.x, 0);
    ctx.lineTo(crosshair.x, viewport.height);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, crosshair.y);
    ctx.lineTo(viewport.width, crosshair.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Price label on right
    const priceText = crosshair.price.toFixed(2);
    const priceLabelWidth = 70;
    const priceLabelHeight = 20;

    ctx.fillStyle = this.config.crosshairColor;
    ctx.fillRect(viewport.width - priceLabelWidth, crosshair.y - priceLabelHeight / 2, priceLabelWidth, priceLabelHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(priceText, viewport.width - priceLabelWidth / 2, crosshair.y + 4);

    // Time label on bottom
    const timeText = this.formatTime(crosshair.time);
    const timeLabelWidth = 80;
    const timeLabelHeight = 20;

    ctx.fillStyle = this.config.crosshairColor;
    ctx.fillRect(crosshair.x - timeLabelWidth / 2, viewport.height - timeLabelHeight, timeLabelWidth, timeLabelHeight);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeText, crosshair.x, viewport.height - 6);
  }

  private renderBackground(viewport: Viewport) {
    const ctx = this.ctx;
    ctx.fillStyle = this.config.backgroundColor;
    ctx.fillRect(0, 0, viewport.width, viewport.height);
  }

  private renderGrid(viewport: Viewport) {
    if (!this.config.showGrid || !this.coord) return;

    const ctx = this.ctx;
    ctx.strokeStyle = this.config.gridColor;
    ctx.lineWidth = 0.5;

    // Vertical grid lines (time)
    const timeInterval = this.calculateTimeGridInterval(viewport);
    const visibleTimeRange = this.coord.getVisibleTimeRange();
    
    if (visibleTimeRange) {
      const startTime = Math.floor(visibleTimeRange.start / timeInterval) * timeInterval;
      
      for (let time = startTime; time <= visibleTimeRange.end; time += timeInterval) {
        const x = this.coord.timeToX(time);
        if (x >= 0 && x <= viewport.width) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, viewport.height);
          ctx.stroke();
        }
      }
    }

    // Horizontal grid lines (price)
    const priceInterval = this.calculatePriceGridInterval(viewport);
    const priceRange = this.coord.getVisiblePriceRange();

    for (let price = Math.floor(priceRange.min / priceInterval) * priceInterval; 
         price <= priceRange.max; 
         price += priceInterval) {
      const y = this.coord.priceToY(price);
      if (y >= 0 && y <= viewport.height) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(viewport.width, y);
        ctx.stroke();

        // Price label
        ctx.fillStyle = this.config.textColor;
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(price.toFixed(2), viewport.width - 5, y + 3);
      }
    }
  }

  private renderCandles(viewport: Viewport, candles: Candle[]) {
    if (!this.coord) return;

    const ctx = this.ctx;
    const { candleWidth, startIndex } = viewport;

    const visibleCandles = this.coord.getVisibleCandles();
    const startIndexOffset = Math.max(0, Math.floor(startIndex));

    visibleCandles.forEach((candle, i) => {
      const index = startIndexOffset + i;
      const x = this.coord!.indexToX(index);
      
      if (x < -candleWidth || x > viewport.width + candleWidth) return;

      const isUp = candle.close >= candle.open;
      const color = isUp ? this.config.upColor : this.config.downColor;

      // Wick
      const wickTop = this.coord!.priceToY(candle.high);
      const wickBottom = this.coord!.priceToY(candle.low);
      const bodyTop = this.coord!.priceToY(isUp ? candle.close : candle.open);
      const bodyBottom = this.coord!.priceToY(isUp ? candle.open : candle.close);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x, wickTop);
      ctx.lineTo(x, wickBottom);
      ctx.stroke();

      // Draw body
      const bodyHeight = Math.max(1, Math.abs(bodyBottom - bodyTop));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });
  }

  private renderVolume(viewport: Viewport, candles: Candle[]) {
    if (!this.config.showVolume || !this.coord) return;

    const ctx = this.ctx;
    const { candleWidth, startIndex, height } = viewport;
    
    // Volume height is 15% of chart height
    const volumeHeight = height * 0.15;
    const volumeBottom = height;

    // Find max volume for scaling
    const visibleCandles = this.coord.getVisibleCandles();
    const maxVolume = Math.max(...visibleCandles.map(c => c.volume), 1);

    const startIndexOffset = Math.max(0, Math.floor(startIndex));

    visibleCandles.forEach((candle, i) => {
      const index = startIndexOffset + i;
      const x = this.coord!.indexToX(index);
      
      if (x < -candleWidth || x > viewport.width + candleWidth) return;

      const isUp = candle.close >= candle.open;
      const barHeight = (candle.volume / maxVolume) * volumeHeight;
      
      ctx.fillStyle = isUp ? this.config.volumeUpColor : this.config.volumeDownColor;
      ctx.fillRect(x - candleWidth / 2, volumeBottom - barHeight, candleWidth, barHeight);
    });
  }

  private renderIndicators(viewport: Viewport, indicators: Indicator[]) {
    if (!this.coord) return;

    const ctx = this.ctx;
    
    indicators.forEach(indicator => {
      if (!indicator.enabled || !indicator.visible || indicator.data.length === 0) return;

      ctx.strokeStyle = indicator.color;
      ctx.lineWidth = indicator.lineWidth;
      
      if (indicator.lineStyle === 'dashed') {
        ctx.setLineDash([5, 5]);
      } else if (indicator.lineStyle === 'dotted') {
        ctx.setLineDash([2, 2]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      let started = false;

      indicator.data.forEach((point) => {
        const x = this.coord!.timeToX(point.time);
        const y = this.coord!.priceToY(point.value);

        if (x < -10 || x > viewport.width + 10) return;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  private renderDrawings(viewport: Viewport, drawings: Drawing[]) {
    if (!this.coord) return;

    const ctx = this.ctx;

    drawings.forEach(drawing => {
      if (!drawing.visible || drawing.points.length === 0) return;

      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = drawing.lineWidth;
      ctx.setLineDash(drawing.lineStyle === 'dashed' ? [5, 5] : drawing.lineStyle === 'dotted' ? [2, 2] : []);

      switch (drawing.type) {
        case 'trendline':
          this.renderTrendline(ctx, drawing);
          break;
        case 'horizontalline':
          this.renderHorizontalLine(ctx, drawing, viewport);
          break;
        case 'rectangle':
          this.renderRectangle(ctx, drawing);
          break;
        case 'fibonacci':
          this.renderFibonacci(ctx, drawing, viewport);
          break;
      }

      ctx.setLineDash([]);
    });
  }

  private renderTrendline(ctx: CanvasRenderingContext2D, drawing: Drawing) {
    if (drawing.points.length < 2) return;

    const p1 = drawing.points[0];
    const p2 = drawing.points[1];
    const x1 = this.coord!.timeToX(p1.time);
    const y1 = this.coord!.priceToY(p1.price);
    const x2 = this.coord!.timeToX(p2.time);
    const y2 = this.coord!.priceToY(p2.price);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private renderHorizontalLine(ctx: CanvasRenderingContext2D, drawing: Drawing, viewport: Viewport) {
    if (drawing.points.length < 1) return;

    const y = this.coord!.priceToY(drawing.points[0].price);
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewport.width, y);
    ctx.stroke();

    // Price label
    ctx.fillStyle = drawing.color;
    ctx.fillRect(viewport.width - 70, y - 10, 70, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(drawing.points[0].price.toFixed(2), viewport.width - 35, y + 4);
  }

  private renderRectangle(ctx: CanvasRenderingContext2D, drawing: Drawing) {
    if (drawing.points.length < 2) return;

    const p1 = drawing.points[0];
    const p2 = drawing.points[1];
    const x1 = this.coord!.timeToX(p1.time);
    const y1 = this.coord!.priceToY(p1.price);
    const x2 = this.coord!.timeToX(p2.time);
    const y2 = this.coord!.priceToY(p2.price);

    ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
    ctx.fillStyle = drawing.color + '20';
    ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
  }

  private renderFibonacci(ctx: CanvasRenderingContext2D, drawing: Drawing, viewport: Viewport) {
    if (drawing.points.length < 2) return;

    const p1 = drawing.points[0];
    const p2 = drawing.points[1];
    const x1 = this.coord!.timeToX(p1.time);
    const x2 = this.coord!.timeToX(p2.time);
    const y1 = this.coord!.priceToY(p1.price);
    const y2 = this.coord!.priceToY(p2.price);

    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const height = y2 - y1;

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    levels.forEach(level => {
      const y = y1 + height * level;
      
      ctx.strokeStyle = drawing.color + '80';
      ctx.beginPath();
      ctx.moveTo(Math.min(x1, x2), y);
      ctx.lineTo(viewport.width, y);
      ctx.stroke();

      ctx.fillStyle = drawing.color;
      ctx.fillText(`${(level * 100).toFixed(1)}% - ${this.coord!.yToPrice(y).toFixed(2)}`, Math.min(x1, x2) + 5, y - 3);
    });
  }

  private renderWatermark(viewport: Viewport) {
    if (!this.config.showWatermark) return;

    const ctx = this.ctx;
    ctx.fillStyle = this.config.textColor + '15';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.config.toString(), viewport.width / 2, viewport.height / 2);
  }

  private calculateTimeGridInterval(viewport: Viewport): number {
    // Return interval in seconds based on zoom level
    const candlesInView = viewport.endIndex - viewport.startIndex;
    
    if (candlesInView < 50) return 60 * 15; // 15 min
    if (candlesInView < 200) return 60 * 60; // 1 hour
    if (candlesInView < 500) return 60 * 60 * 4; // 4 hours
    if (candlesInView < 1000) return 60 * 60 * 24; // 1 day
    return 60 * 60 * 24 * 7; // 1 week
  }

  private calculatePriceGridInterval(viewport: Viewport): number {
    const range = this.coord?.getVisiblePriceRange();
    if (!range) return 10;

    const priceRange = range.max - range.min;
    
    if (priceRange < 0.01) return 0.001;
    if (priceRange < 0.1) return 0.01;
    if (priceRange < 1) return 0.1;
    if (priceRange < 10) return 1;
    if (priceRange < 100) return 5;
    if (priceRange < 500) return 25;
    if (priceRange < 1000) return 50;
    if (priceRange < 5000) return 250;
    return 1000;
  }

  private formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Mark renderer as needing redraw
  invalidate(fullRedraw = true) {
    if (fullRedraw) {
      this.needsFullRedraw = true;
    }
    this.needsOverlayRedraw = true;
  }

  // Export chart as image
  exportImage(): string {
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d')!;
    
    exportCanvas.width = this.canvas.width;
    exportCanvas.height = this.canvas.height;
    
    // Draw main canvas
    exportCtx.drawImage(this.canvas, 0, 0);
    // Draw overlay
    exportCtx.drawImage(this.overlayCanvas, 0, 0);
    
    return exportCanvas.toDataURL('image/png');
  }
}

export default ChartRenderer;
