// Demo Data Generator
// Generates realistic market data without any API

import { TimeframeValue } from '@/lib/providers/types';

interface SymbolConfig {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  trend: number;
}

const SYMBOL_CONFIGS: Record<string, SymbolConfig> = {
  'BTC/USD': { symbol: 'BTC/USD', name: 'Bitcoin', basePrice: 67500, volatility: 0.03, trend: 0.001 },
  'ETH/USD': { symbol: 'ETH/USD', name: 'Ethereum', basePrice: 3450, volatility: 0.035, trend: 0.0008 },
  'SOL/USD': { symbol: 'SOL/USD', name: 'Solana', basePrice: 178, volatility: 0.045, trend: 0.0015 },
  'XRP/USD': { symbol: 'XRP/USD', name: 'Ripple', basePrice: 0.52, volatility: 0.04, trend: 0 },
  'BNB/USD': { symbol: 'BNB/USD', name: 'Binance Coin', basePrice: 580, volatility: 0.035, trend: 0.0005 },
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 189, volatility: 0.015, trend: 0.0003 },
  'GOOGL': { symbol: 'GOOGL', name: 'Alphabet', basePrice: 175, volatility: 0.018, trend: 0.0002 },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft', basePrice: 420, volatility: 0.014, trend: 0.0004 },
  'TSLA': { symbol: 'TSLA', name: 'Tesla', basePrice: 248, volatility: 0.028, trend: -0.0005 },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA', basePrice: 880, volatility: 0.025, trend: 0.001 },
  'AMZN': { symbol: 'AMZN', name: 'Amazon', basePrice: 185, volatility: 0.016, trend: 0.0003 },
  'META': { symbol: 'META', name: 'Meta', basePrice: 505, volatility: 0.02, trend: 0.0006 },
  'EUR/USD': { symbol: 'EUR/USD', name: 'Euro/Dollar', basePrice: 1.085, volatility: 0.003, trend: 0 },
  'GBP/USD': { symbol: 'GBP/USD', name: 'Pound/Dollar', basePrice: 1.27, volatility: 0.004, trend: 0 },
  'XAU/USD': { symbol: 'XAU/USD', name: 'Gold', basePrice: 2350, volatility: 0.012, trend: 0.0002 },
};

const TIMEFRAME_MS: Record<TimeframeValue, number> = {
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  '30m': 1800000,
  '1H': 3600000,
  '4H': 14400000,
  '1D': 86400000,
  '1W': 604800000,
};

// Seeded random for reproducibility
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function generateDemoCandles(
  symbolInfo: { symbol: string; basePrice?: number; type?: string },
  timeframe: TimeframeValue,
  count: number = 300
): any[] {
  const config = SYMBOL_CONFIGS[symbolInfo.symbol] || {
    symbol: symbolInfo.symbol,
    name: symbolInfo.symbol,
    basePrice: symbolInfo.basePrice || 100,
    volatility: 0.02,
    trend: 0,
  };

  const timeframeMs = TIMEFRAME_MS[timeframe] || 3600000;
  
  // Create seed
  let seed = 0;
  for (let i = 0; i < symbolInfo.symbol.length; i++) {
    seed += symbolInfo.symbol.charCodeAt(i);
  }
  seed += timeframe.charCodeAt(0);
  const random = seededRandom(seed);

  const candles: any[] = [];
  let currentPrice = config.basePrice;
  let trendAccumulator = 0;
  const now = Date.now();
  let currentTime = now - (count * timeframeMs);

  for (let i = 0; i < count; i++) {
    // Trend changes
    if (random() < 0.05) {
      trendAccumulator += (random() - 0.5) * 0.001;
    }
    trendAccumulator *= 0.99;

    // Price movement
    const trend = config.trend + trendAccumulator;
    const volatility = config.volatility * (1 + (random() - 0.5) * 0.5);
    const change = (random() - 0.5 + trend) * volatility * currentPrice;
    
    const open = currentPrice;
    const close = currentPrice + change;
    
    // High/Low
    const range = Math.abs(change) + currentPrice * volatility * random() * 0.5;
    const high = Math.max(open, close) + range * random() * 0.5;
    const low = Math.min(open, close) - range * random() * 0.5;
    
    // Volume
    const baseVolume = symbolInfo.type === 'crypto' ? 1000000 : 5000000;
    const volume = baseVolume * (0.5 + random()) * (1 + Math.abs(change / currentPrice) * 10);

    const decimals = config.basePrice < 1 ? 4 : 2;

    candles.push({
      time: Math.floor(currentTime / 1000),
      open: parseFloat(open.toFixed(decimals)),
      high: parseFloat(high.toFixed(decimals)),
      low: parseFloat(low.toFixed(decimals)),
      close: parseFloat(close.toFixed(decimals)),
      volume: Math.floor(volume),
    });

    currentPrice = close;
    currentTime += timeframeMs;
  }

  return candles;
}

// Generate simulated live tick
export function generateLiveTick(
  lastPrice: number,
  volatility: number = 0.001
): { price: number; size: number; time: number } {
  const change = (Math.random() - 0.5) * volatility * lastPrice;
  return {
    price: lastPrice + change,
    size: Math.floor(Math.random() * 10 + 1),
    time: Date.now(),
  };
}

// Get all available symbols
export function getAllSymbols(): Array<{ symbol: string; name: string; basePrice: number; type: string }> {
  return Object.values(SYMBOL_CONFIGS).map(config => ({
    symbol: config.symbol,
    name: config.name,
    basePrice: config.basePrice,
    type: config.symbol.includes('/') && !config.symbol.includes('XAU') && !config.symbol.includes('XAG')
      ? config.symbol.split('/')[1] === 'USD' && config.symbol.split('/')[0].length <= 3 
        ? 'fx' 
        : 'crypto'
      : config.symbol.startsWith('XAU') || config.symbol.startsWith('XAG') || config.symbol === 'CL'
        ? 'commodity'
        : 'stock',
  }));
}

export default {
  generateDemoCandles,
  generateLiveTick,
  getAllSymbols,
};
