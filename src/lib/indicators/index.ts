// Technical Indicators Library
// Based on TradingView/TA-Lib calculations

export interface IndicatorData {
  time: number;
  value: number;
}

export interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ============================================
// Moving Averages
// ============================================

export function calculateSMA(data: OHLCV[], period: number): IndicatorData[] {
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

export function calculateEMA(data: OHLCV[], period: number): IndicatorData[] {
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

export function calculateWMA(data: OHLCV[], period: number): IndicatorData[] {
  const result: IndicatorData[] = [];
  const weights: number[] = [];
  let weightSum = 0;
  
  for (let i = 1; i <= period; i++) {
    weights.push(i);
    weightSum += i;
  }
  
  for (let i = period - 1; i < data.length; i++) {
    let wma = 0;
    for (let j = 0; j < period; j++) {
      wma += data[i - period + 1 + j].close * weights[j];
    }
    result.push({
      time: data[i].time,
      value: wma / weightSum,
    });
  }
  
  return result;
}

// ============================================
// Oscillators
// ============================================

export function calculateRSI(data: OHLCV[], period: number = 14): IndicatorData[] {
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
  
  // First RSI
  const rs = avgLoss !== 0 ? avgGain / avgLoss : 0;
  result.push({
    time: data[period].time,
    value: 100 - (100 / (1 + rs)),
  });
  
  // Calculate subsequent RSIs using smoothed method
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    const rs = avgLoss !== 0 ? avgGain / avgLoss : 0;
    result.push({
      time: data[i + 1].time,
      value: 100 - (100 / (1 + rs)),
    });
  }
  
  return result;
}

export function calculateStochastic(
  data: OHLCV[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: IndicatorData[]; d: IndicatorData[] } {
  const kValues: IndicatorData[] = [];
  
  for (let i = kPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - kPeriod + 1, i + 1);
    const high = Math.max(...slice.map(d => d.high));
    const low = Math.min(...slice.map(d => d.low));
    const close = data[i].close;
    
    const k = high !== low ? ((close - low) / (high - low)) * 100 : 50;
    kValues.push({
      time: data[i].time,
      value: k,
    });
  }
  
  // D is SMA of K
  const dValues: IndicatorData[] = [];
  for (let i = dPeriod - 1; i < kValues.length; i++) {
    let sum = 0;
    for (let j = 0; j < dPeriod; j++) {
      sum += kValues[i - j].value;
    }
    dValues.push({
      time: kValues[i].time,
      value: sum / dPeriod,
    });
  }
  
  return { k: kValues, d: dValues };
}

// ============================================
// MACD
// ============================================

export interface MACDData {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

export function calculateMACD(
  data: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDData[] {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // MACD Line = Fast EMA - Slow EMA
  const macdLine: IndicatorData[] = [];
  const slowOffset = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push({
      time: slowEMA[i].time,
      value: fastEMA[i + slowOffset].value - slowEMA[i].value,
    });
  }
  
  // Signal Line = EMA of MACD Line
  const signalLine: IndicatorData[] = [];
  const multiplier = 2 / (signalPeriod + 1);
  
  // First signal is SMA
  let signal = 0;
  for (let i = 0; i < signalPeriod; i++) {
    signal += macdLine[i].value;
  }
  signal /= signalPeriod;
  
  signalLine.push({
    time: macdLine[signalPeriod - 1].time,
    value: signal,
  });
  
  // Calculate EMA
  for (let i = signalPeriod; i < macdLine.length; i++) {
    signal = (macdLine[i].value - signal) * multiplier + signal;
    signalLine.push({
      time: macdLine[i].time,
      value: signal,
    });
  }
  
  // Combine results
  const result: MACDData[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macd = macdLine[i + signalPeriod - 1].value;
    const sig = signalLine[i].value;
    result.push({
      time: signalLine[i].time,
      macd,
      signal: sig,
      histogram: macd - sig,
    });
  }
  
  return result;
}

// ============================================
// Bollinger Bands
// ============================================

export interface BollingerBandsData {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export function calculateBollingerBands(
  data: OHLCV[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsData[] {
  const result: BollingerBandsData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const sma = sum / period;
    
    // Calculate Standard Deviation
    let sqSum = 0;
    for (let j = 0; j < period; j++) {
      sqSum += Math.pow(data[i - j].close - sma, 2);
    }
    const std = Math.sqrt(sqSum / period);
    
    result.push({
      time: data[i].time,
      upper: sma + stdDev * std,
      middle: sma,
      lower: sma - stdDev * std,
    });
  }
  
  return result;
}

// ============================================
// ATR (Average True Range)
// ============================================

export function calculateATR(data: OHLCV[], period: number = 14): IndicatorData[] {
  const trueRanges: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  // First ATR is SMA of True Range
  const result: IndicatorData[] = [];
  let atr = 0;
  
  for (let i = 0; i < period; i++) {
    atr += trueRanges[i];
  }
  atr /= period;
  
  result.push({
    time: data[period].time,
    value: atr,
  });
  
  // Subsequent ATRs use smoothing
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push({
      time: data[i + 1].time,
      value: atr,
    });
  }
  
  return result;
}

// ============================================
// Volume Profile
// ============================================

export interface VolumeProfileLevel {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
}

export function calculateVolumeProfile(
  data: OHLCV[],
  levels: number = 20
): VolumeProfileLevel[] {
  if (data.length === 0) return [];
  
  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const priceStep = (maxPrice - minPrice) / levels;
  
  const profile: VolumeProfileLevel[] = [];
  
  for (let i = 0; i < levels; i++) {
    const levelLow = minPrice + i * priceStep;
    const levelHigh = levelLow + priceStep;
    const levelPrice = (levelLow + levelHigh) / 2;
    
    let volume = 0;
    let buyVolume = 0;
    let sellVolume = 0;
    
    for (const candle of data) {
      if (candle.high >= levelLow && candle.low <= levelHigh) {
        const overlap = Math.min(candle.high, levelHigh) - Math.max(candle.low, levelLow);
        const candleRange = candle.high - candle.low;
        const volumePortion = candleRange > 0 ? (overlap / candleRange) * candle.volume : 0;
        
        volume += volumePortion;
        if (candle.close >= candle.open) {
          buyVolume += volumePortion;
        } else {
          sellVolume += volumePortion;
        }
      }
    }
    
    profile.push({
      price: levelPrice,
      volume,
      buyVolume,
      sellVolume,
    });
  }
  
  return profile;
}

// ============================================
// VWAP (Volume Weighted Average Price)
// ============================================

export function calculateVWAP(data: OHLCV[]): IndicatorData[] {
  const result: IndicatorData[] = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  
  for (const candle of data) {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativeTPV += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
    
    result.push({
      time: candle.time,
      value: cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice,
    });
  }
  
  return result;
}

// ============================================
// Support/Resistance Levels
// ============================================

export interface SupportResistanceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: number;
  touches: number;
}

export function findSupportResistance(
  data: OHLCV[],
  lookback: number = 20,
  threshold: number = 0.02
): SupportResistanceLevel[] {
  const levels: SupportResistanceLevel[] = [];
  
  for (let i = lookback; i < data.length - lookback; i++) {
    const slice = data.slice(i - lookback, i + lookback + 1);
    const high = data[i].high;
    const low = data[i].low;
    
    // Check for resistance (local high)
    const isResistance = slice.every(d => d.high <= high * (1 + threshold));
    if (isResistance) {
      const existing = levels.find(l => Math.abs(l.price - high) / high < threshold);
      if (existing) {
        existing.touches++;
        existing.strength++;
      } else {
        levels.push({
          price: high,
          type: 'resistance',
          strength: 1,
          touches: 1,
        });
      }
    }
    
    // Check for support (local low)
    const isSupport = slice.every(d => d.low >= low * (1 - threshold));
    if (isSupport) {
      const existing = levels.find(l => Math.abs(l.price - low) / low < threshold);
      if (existing) {
        existing.touches++;
        existing.strength++;
      } else {
        levels.push({
          price: low,
          type: 'support',
          strength: 1,
          touches: 1,
        });
      }
    }
  }
  
  // Sort by strength
  return levels.sort((a, b) => b.strength - a.strength);
}

// Export all
export default {
  calculateSMA,
  calculateEMA,
  calculateWMA,
  calculateRSI,
  calculateStochastic,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateVolumeProfile,
  calculateVWAP,
  findSupportResistance,
};
