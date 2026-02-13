// Chart Coordinate System
// Handles conversion between data space and screen space

import { Viewport, ScaleType, Candle } from './types';

export interface CoordinateSystemConfig {
  viewport: Viewport;
  scaleType: ScaleType;
  candles: Candle[];
  dpr: number; // Device pixel ratio
}

export class CoordinateSystem {
  private viewport: Viewport;
  private scaleType: ScaleType;
  private candles: Candle[];
  private dpr: number;

  // Cached values
  private _priceRange: { min: number; max: number } | null = null;
  private _timeRange: { min: number; max: number } | null = null;

  constructor(config: CoordinateSystemConfig) {
    this.viewport = config.viewport;
    this.scaleType = config.scaleType;
    this.candles = config.candles;
    this.dpr = config.dpr;
  }

  // Update configuration
  update(config: Partial<CoordinateSystemConfig>) {
    if (config.viewport) this.viewport = config.viewport;
    if (config.scaleType) this.scaleType = config.scaleType;
    if (config.candles) {
      this.candles = config.candles;
      this._priceRange = null;
      this._timeRange = null;
    }
    if (config.dpr) this.dpr = config.dpr;
  }

  // Get price range for visible candles
  getVisiblePriceRange(): { min: number; max: number } {
    if (this._priceRange) return this._priceRange;

    const visibleCandles = this.getVisibleCandles();
    if (visibleCandles.length === 0) {
      return { min: 0, max: 100 };
    }

    let min = Infinity;
    let max = -Infinity;

    for (const candle of visibleCandles) {
      if (candle.low < min) min = candle.low;
      if (candle.high > max) max = candle.high;
    }

    // Add padding (5%)
    const padding = (max - min) * 0.05;
    min -= padding;
    max += padding;

    this._priceRange = { min, max };
    return { min, max };
  }

  // Get visible candles
  getVisibleCandles(): Candle[] {
    const { startIndex, endIndex } = this.viewport;
    const clampedStart = Math.max(0, Math.floor(startIndex));
    const clampedEnd = Math.min(this.candles.length, Math.ceil(endIndex));
    return this.candles.slice(clampedStart, clampedEnd);
  }

  // Convert time to x coordinate
  timeToX(time: number): number {
    const index = this.candles.findIndex(c => c.time === time);
    if (index === -1) return -1;
    return this.indexToX(index);
  }

  // Convert index to x coordinate
  indexToX(index: number): number {
    const { candleWidth, candleSpacing, startIndex, offsetX } = this.viewport;
    return ((index - startIndex) * (candleWidth + candleSpacing)) + offsetX + candleWidth / 2;
  }

  // Convert x coordinate to index
  xToIndex(x: number): number {
    const { candleWidth, candleSpacing, startIndex, offsetX } = this.viewport;
    return startIndex + ((x - offsetX) / (candleWidth + candleSpacing));
  }

  // Convert x coordinate to time
  xToTime(x: number): number | null {
    const index = Math.round(this.xToIndex(x));
    if (index < 0 || index >= this.candles.length) return null;
    return this.candles[index].time;
  }

  // Convert price to y coordinate
  priceToY(price: number): number {
    const range = this.getVisiblePriceRange();
    
    if (this.scaleType === 'logarithmic') {
      const logMin = Math.log10(range.min);
      const logMax = Math.log10(range.max);
      const logPrice = Math.log10(Math.max(price, 0.0000001));
      const ratio = (logPrice - logMin) / (logMax - logMin);
      return this.viewport.height * (1 - ratio);
    }
    
    // Linear scale
    const ratio = (price - range.min) / (range.max - range.min);
    return this.viewport.height * (1 - ratio);
  }

  // Convert y coordinate to price
  yToPrice(y: number): number {
    const range = this.getVisiblePriceRange();
    
    if (this.scaleType === 'logarithmic') {
      const logMin = Math.log10(range.min);
      const logMax = Math.log10(range.max);
      const ratio = 1 - (y / this.viewport.height);
      const logPrice = logMin + (ratio * (logMax - logMin));
      return Math.pow(10, logPrice);
    }
    
    // Linear scale
    const ratio = 1 - (y / this.viewport.height);
    return range.min + (ratio * (range.max - range.min));
  }

  // Get candle at x coordinate
  getCandleAtX(x: number): Candle | null {
    const index = Math.round(this.xToIndex(x));
    if (index < 0 || index >= this.candles.length) return null;
    return this.candles[index];
  }

  // Get candle rect for hit testing
  getCandleRect(candle: Candle, index: number): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const { candleWidth, candleSpacing } = this.viewport;
    const x = this.indexToX(index) - candleWidth / 2;
    const bodyTop = this.priceToY(candle.isUp ? candle.close : candle.open);
    const bodyBottom = this.priceToY(candle.isUp ? candle.open : candle.close);
    
    return {
      x,
      y: Math.min(bodyTop, bodyBottom),
      width: candleWidth,
      height: Math.max(1, Math.abs(bodyBottom - bodyTop)),
    };
  }

  // Check if point is inside chart area
  isInsideChart(x: number, y: number): boolean {
    return x >= 0 && x <= this.viewport.width && y >= 0 && y <= this.viewport.height;
  }

  // Get device pixel ratio scaled values
  getScaledValue(value: number): number {
    return value * this.dpr;
  }

  // Get visible time range
  getVisibleTimeRange(): { start: number; end: number } | null {
    const visibleCandles = this.getVisibleCandles();
    if (visibleCandles.length === 0) return null;
    
    return {
      start: visibleCandles[0].time,
      end: visibleCandles[visibleCandles.length - 1].time,
    };
  }

  // Calculate how many candles fit in view
  getCandlesInView(): number {
    const { candleWidth, candleSpacing, width } = this.viewport;
    return Math.ceil(width / (candleWidth + candleSpacing));
  }

  // Calculate candle width for a specific zoom level
  calculateCandleWidth(zoom: number): number {
    const min = 2;
    const max = 50;
    return Math.max(min, Math.min(max, 8 * zoom));
  }

  // Pan by delta x
  pan(deltaX: number): void {
    const { candleWidth, candleSpacing } = this.viewport;
    const candleDelta = deltaX / (candleWidth + candleSpacing);
    this.viewport.startIndex -= candleDelta;
    this.viewport.endIndex -= candleDelta;
    this._priceRange = null;
  }

  // Zoom at a specific x position
  zoom(factor: number, pivotX: number): void {
    const { startIndex, endIndex, candleWidth, candleSpacing } = this.viewport;
    
    // Calculate new candle width
    const newWidth = Math.max(2, Math.min(50, candleWidth * factor));
    const ratio = newWidth / candleWidth;
    
    // Adjust viewport to zoom at pivot point
    const pivotIndex = this.xToIndex(pivotX);
    const viewWidth = endIndex - startIndex;
    const newViewWidth = viewWidth / ratio;
    
    this.viewport.candleWidth = newWidth;
    this.viewport.startIndex = pivotIndex - (pivotIndex - startIndex) / ratio;
    this.viewport.endIndex = this.viewport.startIndex + newViewWidth;
    
    this._priceRange = null;
  }
}

export default CoordinateSystem;
