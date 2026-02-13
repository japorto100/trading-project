// Data Pipeline for market data management

import { Candle, TimeframeValue } from '../../chart/engine/types';

export interface SymbolInfo {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock' | 'fx' | 'commodity';
  basePrice: number;
  volatility: number;
}

export interface ChartSessionConfig {
  symbol: string;
  timeframe: TimeframeValue;
  onData?: (candles: Candle[]) => void;
  onTick?: (candle: Candle) => void;
  onError?: (error: Error) => void;
}

// Symbol definitions
export const SYMBOLS: SymbolInfo[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', type: 'crypto', basePrice: 67500, volatility: 0.03 },
  { symbol: 'ETH/USD', name: 'Ethereum', type: 'crypto', basePrice: 3450, volatility: 0.035 },
  { symbol: 'SOL/USD', name: 'Solana', type: 'crypto', basePrice: 178, volatility: 0.045 },
  { symbol: 'XRP/USD', name: 'Ripple', type: 'crypto', basePrice: 0.52, volatility: 0.04 },
  { symbol: 'BNB/USD', name: 'Binance Coin', type: 'crypto', basePrice: 580, volatility: 0.032 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', basePrice: 189, volatility: 0.015 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', basePrice: 175, volatility: 0.018 },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', basePrice: 420, volatility: 0.014 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', basePrice: 248, volatility: 0.028 },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', basePrice: 880, volatility: 0.025 },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', basePrice: 185, volatility: 0.016 },
  { symbol: 'META', name: 'Meta', type: 'stock', basePrice: 505, volatility: 0.022 },
  { symbol: 'EUR/USD', name: 'Euro/USD', type: 'fx', basePrice: 1.085, volatility: 0.005 },
  { symbol: 'GBP/USD', name: 'Pound/USD', type: 'fx', basePrice: 1.27, volatility: 0.006 },
  { symbol: 'USD/JPY', name: 'USD/Yen', type: 'fx', basePrice: 149, volatility: 0.005 },
  { symbol: 'XAU/USD', name: 'Gold', type: 'commodity', basePrice: 2350, volatility: 0.01 },
  { symbol: 'XAG/USD', name: 'Silver', type: 'commodity', basePrice: 28, volatility: 0.015 },
  { symbol: 'WTI', name: 'Crude Oil', type: 'commodity', basePrice: 78, volatility: 0.02 },
];

// Timeframe definitions
export const TIMEFRAMES: { value: TimeframeValue; label: string; ms: number }[] = [
  { value: '1m', label: '1m', ms: 60 * 1000 },
  { value: '5m', label: '5m', ms: 5 * 60 * 1000 },
  { value: '15m', label: '15m', ms: 15 * 60 * 1000 },
  { value: '30m', label: '30m', ms: 30 * 60 * 1000 },
  { value: '1H', label: '1H', ms: 60 * 60 * 1000 },
  { value: '4H', label: '4H', ms: 4 * 60 * 60 * 1000 },
  { value: '1D', label: '1D', ms: 24 * 60 * 60 * 1000 },
  { value: '1W', label: '1W', ms: 7 * 24 * 60 * 60 * 1000 },
];

// Data cache
interface CacheEntry {
  candles: Candle[];
  lastUpdate: number;
  timeframe: TimeframeValue;
}

const dataCache = new Map<string, CacheEntry>();

function getCacheKey(symbol: string, timeframe: TimeframeValue): string {
  return `${symbol}:${timeframe}`;
}

// Seeded random for reproducible data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Generate realistic OHLCV candlestick data
 */
export function generateCandleData(
  symbolInfo: SymbolInfo,
  timeframe: TimeframeValue,
  numCandles: number = 500
): Candle[] {
  const candles: Candle[] = [];
  const timeframeMs = TIMEFRAMES.find(t => t.value === timeframe)?.ms || 60000;
  
  // Create seed for reproducibility
  const seedString = symbolInfo.symbol + timeframe;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed += seedString.charCodeAt(i);
  }
  const random = seededRandom(seed);
  
  let currentPrice = symbolInfo.basePrice;
  let trend = 0;
  const now = Date.now();
  let currentTime = now - (numCandles * timeframeMs);
  
  // Generate realistic market patterns
  const trendDuration = Math.floor(numCandles * 0.1);
  let trendRemaining = 0;
  let trendDirection = 0;
  
  for (let i = 0; i < numCandles; i++) {
    // Random trend changes
    if (trendRemaining <= 0) {
      trendRemaining = Math.floor(random() * trendDuration) + 10;
      trendDirection = (random() - 0.5) * 0.003;
    }
    trendRemaining--;
    
    // Add some mean reversion
    const meanReversion = (symbolInfo.basePrice - currentPrice) / symbolInfo.basePrice * 0.001;
    
    // Price movement
    const volatilityFactor = symbolInfo.volatility * (1 + random() * 0.5);
    const change = (random() - 0.5 + trendDirection + meanReversion) * volatilityFactor * currentPrice;
    
    const open = currentPrice;
    const close = currentPrice + change;
    
    // High and low with intrabar movement
    const range = Math.abs(change) + currentPrice * volatilityFactor * random() * 0.5;
    const high = Math.max(open, close) + range * random() * 0.5;
    const low = Math.min(open, close) - range * random() * 0.5;
    
    // Volume (higher on bigger moves)
    const baseVolume = symbolInfo.type === 'crypto' ? 1000000 : 5000000;
    const volumeMultiplier = 0.5 + random() * 1.5;
    const volatilityMultiplier = 1 + Math.abs(change / currentPrice) * 20;
    const volume = Math.floor(baseVolume * volumeMultiplier * volatilityMultiplier);
    
    // Determine decimal places based on price
    const decimals = currentPrice < 1 ? 4 : currentPrice < 100 ? 2 : 2;
    
    candles.push({
      time: Math.floor(currentTime / 1000),
      open: parseFloat(open.toFixed(decimals)),
      high: parseFloat(high.toFixed(decimals)),
      low: parseFloat(low.toFixed(decimals)),
      close: parseFloat(close.toFixed(decimals)),
      volume,
    });
    
    currentPrice = close;
    currentTime += timeframeMs;
  }
  
  return candles;
}

/**
 * Aggregate lower timeframe data to higher timeframe
 */
export function aggregateCandles(
  candles: Candle[],
  fromTimeframe: TimeframeValue,
  toTimeframe: TimeframeValue
): Candle[] {
  const fromMs = TIMEFRAMES.find(t => t.value === fromTimeframe)?.ms || 60000;
  const toMs = TIMEFRAMES.find(t => t.value === toTimeframe)?.ms || 60000;
  
  if (fromMs >= toMs) {
    return candles;
  }
  
  const ratio = toMs / fromMs;
  const result: Candle[] = [];
  
  for (let i = 0; i < candles.length; i += ratio) {
    const chunk = candles.slice(i, i + ratio);
    if (chunk.length === 0) continue;
    
    result.push({
      time: chunk[0].time,
      open: chunk[0].open,
      high: Math.max(...chunk.map(c => c.high)),
      low: Math.min(...chunk.map(c => c.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((sum, c) => sum + c.volume, 0),
    });
  }
  
  return result;
}

/**
 * ChartSession class for managing a single chart's data
 */
export class ChartSession {
  private symbol: string;
  private timeframe: TimeframeValue;
  private candles: Candle[] = [];
  private sessionId: string;
  private tickInterval: NodeJS.Timeout | null = null;
  private onData?: (candles: Candle[]) => void;
  private onTick?: (candle: Candle) => void;
  private onError?: (error: Error) => void;
  private symbolInfo: SymbolInfo | undefined;
  
  constructor(config: ChartSessionConfig) {
    this.symbol = config.symbol;
    this.timeframe = config.timeframe;
    this.onData = config.onData;
    this.onTick = config.onTick;
    this.onError = config.onError;
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.symbolInfo = SYMBOLS.find(s => s.symbol === this.symbol);
  }
  
  /**
   * Initialize the session and load data
   */
  async initialize(): Promise<void> {
    try {
      // Check cache first
      const cacheKey = getCacheKey(this.symbol, this.timeframe);
      const cached = dataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.lastUpdate < 60000) {
        this.candles = cached.candles;
        this.onData?.(this.candles);
      } else {
        // Generate new data
        if (this.symbolInfo) {
          this.candles = generateCandleData(this.symbolInfo, this.timeframe, 500);
          
          // Update cache
          dataCache.set(cacheKey, {
            candles: this.candles,
            lastUpdate: Date.now(),
            timeframe: this.timeframe,
          });
          
          this.onData?.(this.candles);
        }
      }
      
      // Start live simulation
      this.startLiveSimulation();
    } catch (error) {
      this.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }
  
  /**
   * Start live tick simulation
   */
  private startLiveSimulation(): void {
    if (!this.symbolInfo) return;
    
    // Simulate ticks every 1-5 seconds
    const tickInterval = 1000 + Math.random() * 4000;
    
    this.tickInterval = setInterval(() => {
      this.simulateTick();
    }, tickInterval);
  }
  
  /**
   * Simulate a live price tick
   */
  private simulateTick(): void {
    if (this.candles.length === 0 || !this.symbolInfo) return;
    
    const lastCandle = this.candles[this.candles.length - 1];
    const random = Math.random();
    
    // Calculate price movement
    const change = (random - 0.5) * this.symbolInfo.volatility * lastCandle.close;
    const newClose = lastCandle.close + change;
    const newHigh = Math.max(lastCandle.high, newClose);
    const newLow = Math.min(lastCandle.low, newClose);
    
    // Update last candle (simulating live update)
    const updatedCandle: Candle = {
      ...lastCandle,
      close: newClose,
      high: newHigh,
      low: newLow,
      volume: lastCandle.volume + Math.floor(Math.random() * 10000),
    };
    
    this.candles[this.candles.length - 1] = updatedCandle;
    
    // Notify listeners
    this.onTick?.(updatedCandle);
    
    // Occasionally create new candle
    if (random > 0.95) {
      const timeframeMs = TIMEFRAMES.find(t => t.value === this.timeframe)?.ms || 60000;
      const newCandle: Candle = {
        time: lastCandle.time + Math.floor(timeframeMs / 1000),
        open: newClose,
        high: newClose,
        low: newClose,
        close: newClose,
        volume: Math.floor(Math.random() * 100000),
      };
      
      this.candles.push(newCandle);
      this.onData?.(this.candles);
    }
  }
  
  /**
   * Change symbol
   */
  async setSymbol(symbol: string): Promise<void> {
    this.symbol = symbol;
    this.symbolInfo = SYMBOLS.find(s => s.symbol === this.symbol);
    await this.initialize();
  }
  
  /**
   * Change timeframe
   */
  async setTimeframe(timeframe: TimeframeValue): Promise<void> {
    this.timeframe = timeframe;
    await this.initialize();
  }
  
  /**
   * Get current candles
   */
  getCandles(): Candle[] {
    return [...this.candles];
  }
  
  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}

/**
 * Get symbol info by symbol string
 */
export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
  return SYMBOLS.find(s => s.symbol === symbol);
}

/**
 * Search symbols by query
 */
export function searchSymbols(query: string): SymbolInfo[] {
  const lowerQuery = query.toLowerCase();
  return SYMBOLS.filter(
    s => s.symbol.toLowerCase().includes(lowerQuery) || 
         s.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number): string {
  if (price < 0.01) {
    return price.toFixed(6);
  } else if (price < 1) {
    return price.toFixed(4);
  } else if (price < 100) {
    return price.toFixed(2);
  } else {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

/**
 * Format volume with K, M, B suffixes
 */
export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B';
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M';
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K';
  }
  return volume.toString();
}

/**
 * Format percent with sign
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default ChartSession;
