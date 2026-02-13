// Chart data utilities for generating realistic OHLCV data

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  time: number;
  value: number;
}

export type TimeframeValue = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W';

export interface SymbolInfo {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  basePrice: number;
  volatility: number;
}

export const SYMBOLS: SymbolInfo[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', type: 'crypto', basePrice: 67500, volatility: 0.03 },
  { symbol: 'ETH/USD', name: 'Ethereum', type: 'crypto', basePrice: 3450, volatility: 0.035 },
  { symbol: 'SOL/USD', name: 'Solana', type: 'crypto', basePrice: 178, volatility: 0.045 },
  { symbol: 'XRP/USD', name: 'Ripple', type: 'crypto', basePrice: 0.52, volatility: 0.04 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', basePrice: 189, volatility: 0.015 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', basePrice: 175, volatility: 0.018 },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', basePrice: 420, volatility: 0.014 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', basePrice: 248, volatility: 0.028 },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', basePrice: 880, volatility: 0.025 },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', basePrice: 185, volatility: 0.016 },
];

export const TIMEFRAMES: { value: TimeframeValue; label: string; ms: number }[] = [
  { value: '1m', label: '1m', ms: 60 * 1000 },
  { value: '5m', label: '5m', ms: 5 * 60 * 1000 },
  { value: '15m', label: '15m', ms: 15 * 60 * 1000 },
  { value: '1H', label: '1H', ms: 60 * 60 * 1000 },
  { value: '4H', label: '4H', ms: 4 * 60 * 60 * 1000 },
  { value: '1D', label: '1D', ms: 24 * 60 * 60 * 1000 },
  { value: '1W', label: '1W', ms: 7 * 24 * 60 * 60 * 1000 },
];

// Seeded random number generator for reproducible data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate realistic OHLCV candlestick data
export function generateCandleData(
  symbol: SymbolInfo,
  timeframe: TimeframeValue,
  numCandles: number = 200
): CandleData[] {
  const candles: CandleData[] = [];
  const timeframeMs = TIMEFRAMES.find(t => t.value === timeframe)?.ms || 60000;
  
  // Create a seed based on symbol and timeframe for reproducibility
  const seedString = symbol.symbol + timeframe;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed += seedString.charCodeAt(i);
  }
  const random = seededRandom(seed);
  
  // Generate data
  let currentPrice = symbol.basePrice;
  let trend = 0;
  const now = Date.now();
  
  // Start from past
  let currentTime = now - (numCandles * timeframeMs);
  
  for (let i = 0; i < numCandles; i++) {
    // Random trend change
    if (random() < 0.1) {
      trend = (random() - 0.5) * 0.002;
    }
    
    // Price movement based on volatility and trend
    const change = (random() - 0.5 + trend) * symbol.volatility * currentPrice;
    const open = currentPrice;
    const close = currentPrice + change;
    
    // High and low with some randomness
    const range = Math.abs(change) + currentPrice * symbol.volatility * random() * 0.5;
    const high = Math.max(open, close) + range * random() * 0.5;
    const low = Math.min(open, close) - range * random() * 0.5;
    
    // Volume (higher on bigger moves)
    const baseVolume = symbol.type === 'crypto' ? 1000000 : 5000000;
    const volume = baseVolume * (0.5 + random()) * (1 + Math.abs(change / currentPrice) * 10);
    
    candles.push({
      time: Math.floor(currentTime / 1000), // lightweight-charts expects Unix timestamp in seconds
      open: parseFloat(open.toFixed(symbol.basePrice < 1 ? 4 : 2)),
      high: parseFloat(high.toFixed(symbol.basePrice < 1 ? 4 : 2)),
      low: parseFloat(low.toFixed(symbol.basePrice < 1 ? 4 : 2)),
      close: parseFloat(close.toFixed(symbol.basePrice < 1 ? 4 : 2)),
      volume: Math.floor(volume),
    });
    
    currentPrice = close;
    currentTime += timeframeMs;
  }
  
  return candles;
}

// Calculate Simple Moving Average
export function calculateSMA(data: CandleData[], period: number): IndicatorData[] {
  const result: IndicatorData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  
  return result;
}

// Calculate Exponential Moving Average
export function calculateEMA(data: CandleData[], period: number): IndicatorData[] {
  const result: IndicatorData[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += data[i].close;
  }
  ema /= period;
  
  result.push({
    time: data[period - 1].time,
    value: ema,
  });
  
  // Calculate subsequent EMAs
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({
      time: data[i].time,
      value: ema,
    });
  }
  
  return result;
}

// Calculate RSI
export function calculateRSI(data: CandleData[], period: number = 14): IndicatorData[] {
  const result: IndicatorData[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate initial average gain/loss
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;
  
  // Calculate RSI
  if (avgLoss !== 0) {
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    result.push({
      time: data[period].time,
      value: rsi,
    });
  } else {
    result.push({
      time: data[period].time,
      value: 100,
    });
  }
  
  // Calculate subsequent RSIs
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    if (avgLoss !== 0) {
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push({
        time: data[i + 1].time,
        value: rsi,
      });
    } else {
      result.push({
        time: data[i + 1].time,
        value: 100,
      });
    }
  }
  
  return result;
}

// Format price with appropriate decimal places
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

// Format volume with K, M, B suffixes
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

// Format percent with sign
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Calculate price change percentage over a period
export function calculatePriceChange(data: CandleData[], periods: number = 24): { change: number; percent: string } {
  if (data.length < periods + 1) {
    const change = data[data.length - 1].close - data[0].open;
    const percent = ((change / data[0].open) * 100).toFixed(2);
    return { change, percent };
  }
  
  const lastIndex = data.length - 1;
  const firstIndex = lastIndex - periods;
  const change = data[lastIndex].close - data[firstIndex].open;
  const percent = ((change / data[firstIndex].open) * 100).toFixed(2);
  
  return { change, percent };
}
