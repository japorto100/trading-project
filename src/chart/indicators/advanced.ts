// Advanced Technical Indicators
// Including Elliott Wave, Ichimoku, and more

import { OHLCV, IndicatorData } from './types';

// ============================================
// ELLIOTT WAVE DETECTION
// ============================================

export interface ElliottWave {
  degree: 'minor' | 'intermediate' | 'primary' | 'cycle';
  waveNumber: number; // 1-5 for impulse, A-C for correction
  direction: 'up' | 'down';
  startPoint: { time: number; price: number };
  endPoint: { time: number; price: number };
  retracement?: number;
}

export interface ElliottWaveResult {
  waves: ElliottWave[];
  currentWave: number;
  trend: 'bullish' | 'bearish' | 'corrective';
  fibLevels: { level: number; price: number }[];
}

// Detect Elliott Wave patterns
export function detectElliottWaves(
  data: OHLCV[],
  lookback: number = 100
): ElliottWaveResult {
  if (data.length < lookback) {
    return { waves: [], currentWave: 0, trend: 'corrective', fibLevels: [] };
  }

  const waves: ElliottWave[] = [];
  const swings = findSwingPoints(data, 5);
  
  // Identify wave structure
  for (let i = 0; i < swings.length - 1; i++) {
    const swing = swings[i];
    const nextSwing = swings[i + 1];
    
    const waveNumber = (i % 5) + 1;
    const direction = swing.type === 'high' ? 'down' : 'up';
    
    waves.push({
      degree: 'minor',
      waveNumber,
      direction,
      startPoint: { time: swing.time, price: swing.price },
      endPoint: { time: nextSwing.time, price: nextSwing.price },
    });
  }

  // Calculate Fibonacci levels
  const lastSwing = swings[swings.length - 2];
  const currentSwing = swings[swings.length - 1];
  
  const priceRange = Math.abs(currentSwing.price - lastSwing.price);
  const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map(level => ({
    level,
    price: currentSwing.price + (priceRange * level * (lastSwing.price > currentSwing.price ? -1 : 1)),
  }));

  // Determine current wave and trend
  const currentWave = (swings.length % 5) || 5;
  const trend = currentWave <= 3 ? 'bullish' : currentWave === 4 ? 'corrective' : 'bearish';

  return { waves, currentWave, trend, fibLevels };
}

// Find swing highs and lows
function findSwingPoints(
  data: OHLCV[],
  swingSize: number
): Array<{ time: number; price: number; type: 'high' | 'low' }> {
  const swings: Array<{ time: number; price: number; type: 'high' | 'low' }> = [];
  
  for (let i = swingSize; i < data.length - swingSize; i++) {
    const leftSlice = data.slice(i - swingSize, i);
    const rightSlice = data.slice(i + 1, i + swingSize + 1);
    const current = data[i];
    
    // Check for swing high
    const isHigh = leftSlice.every(d => d.high <= current.high) &&
                   rightSlice.every(d => d.high <= current.high);
    
    if (isHigh) {
      swings.push({ time: current.time, price: current.high, type: 'high' });
      continue;
    }
    
    // Check for swing low
    const isLow = leftSlice.every(d => d.low >= current.low) &&
                  rightSlice.every(d => d.low >= current.low);
    
    if (isLow) {
      swings.push({ time: current.time, price: current.low, type: 'low' });
    }
  }
  
  return swings;
}

// ============================================
// ICHIMOKU CLOUD
// ============================================

export interface IchimokuData {
  tenkan: IndicatorData[];
  kijun: IndicatorData[];
  senkouA: IndicatorData[];
  senkouB: IndicatorData[];
  chikou: IndicatorData[];
  cloudTop: number[];
  cloudBottom: number[];
}

export function calculateIchimoku(
  data: OHLCV[],
  tenkanPeriod: number = 9,
  kijunPeriod: number = 26,
  senkouBPeriod: number = 52,
  displacement: number = 26
): IchimokuData {
  const tenkan: IndicatorData[] = [];
  const kijun: IndicatorData[] = [];
  const senkouA: IndicatorData[] = [];
  const senkouB: IndicatorData[] = [];
  const chikou: IndicatorData[] = [];

  // Calculate Tenkan-sen (Conversion Line)
  for (let i = tenkanPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - tenkanPeriod + 1, i + 1);
    const high = Math.max(...slice.map(d => d.high));
    const low = Math.min(...slice.map(d => d.low));
    tenkan.push({
      time: data[i].time,
      value: (high + low) / 2,
    });
  }

  // Calculate Kijun-sen (Base Line)
  for (let i = kijunPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - kijunPeriod + 1, i + 1);
    const high = Math.max(...slice.map(d => d.high));
    const low = Math.min(...slice.map(d => d.low));
    kijun.push({
      time: data[i].time,
      value: (high + low) / 2,
    });
  }

  // Calculate Senkou Span A (Leading Span A)
  const minLen = Math.min(tenkan.length, kijun.length);
  for (let i = 0; i < minLen; i++) {
    senkouA.push({
      time: data[i + kijunPeriod - 1 + displacement]?.time || 0,
      value: (tenkan[i].value + kijun[i].value) / 2,
    });
  }

  // Calculate Senkou Span B (Leading Span B)
  for (let i = senkouBPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - senkouBPeriod + 1, i + 1);
    const high = Math.max(...slice.map(d => d.high));
    const low = Math.min(...slice.map(d => d.low));
    senkouB.push({
      time: data[i + displacement]?.time || 0,
      value: (high + low) / 2,
    });
  }

  // Calculate Chikou Span (Lagging Span)
  for (let i = 0; i < data.length - displacement; i++) {
    chikou.push({
      time: data[i].time,
      value: data[i + displacement].close,
    });
  }

  // Calculate cloud boundaries
  const cloudTop: number[] = [];
  const cloudBottom: number[] = [];
  
  for (let i = 0; i < Math.min(senkouA.length, senkouB.length); i++) {
    cloudTop.push(Math.max(senkouA[i].value, senkouB[i].value));
    cloudBottom.push(Math.min(senkouA[i].value, senkouB[i].value));
  }

  return { tenkan, kijun, senkouA, senkouB, chikou, cloudTop, cloudBottom };
}

// ============================================
// HULL MOVING AVERAGE
// ============================================

export function calculateHMA(data: OHLCV[], period: number = 20): IndicatorData[] {
  const halfPeriod = Math.floor(period / 2);
  const sqrtPeriod = Math.floor(Math.sqrt(period));
  
  // Calculate WMA with half period
  const wmaHalf = calculateWMA(data, halfPeriod);
  // Calculate WMA with full period
  const wmaFull = calculateWMA(data, period);
  
  if (wmaHalf.length === 0 || wmaFull.length === 0) return [];
  
  // Calculate 2 * WMA(half) - WMA(full)
  const offset = wmaFull.length - wmaHalf.length;
  const rawHMA: { time: number; value: number }[] = [];
  
  for (let i = 0; i < wmaHalf.length; i++) {
    rawHMA.push({
      time: wmaHalf[i].time,
      value: 2 * wmaHalf[i].value - wmaFull[i + offset].value,
    });
  }
  
  // Calculate WMA of raw HMA with sqrt(period)
  return calculateWMAFromValues(rawHMA, sqrtPeriod);
}

// Helper: WMA from values
function calculateWMAFromValues(
  data: Array<{ time: number; value: number }>,
  period: number
): IndicatorData[] {
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
      wma += data[i - period + 1 + j].value * weights[j];
    }
    result.push({
      time: data[i].time,
      value: wma / weightSum,
    });
  }
  
  return result;
}

// ============================================
// ADX (AVERAGE DIRECTIONAL INDEX)
// ============================================

export interface ADXData {
  adx: IndicatorData[];
  plusDI: IndicatorData[];
  minusDI: IndicatorData[];
}

export function calculateADX(data: OHLCV[], period: number = 14): ADXData {
  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevHigh = data[i - 1].high;
    const prevLow = data[i - 1].low;
    const prevClose = data[i - 1].close;
    
    // True Range
    tr.push(Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    ));
    
    // Directional Movement
    const upMove = high - prevHigh;
    const downMove = prevLow - low;
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  
  // Smooth TR, +DM, -DM
  const smoothedTR = smoothArray(tr, period);
  const smoothedPlusDM = smoothArray(plusDM, period);
  const smoothedMinusDM = smoothArray(minusDM, period);
  
  // Calculate DI
  const plusDI: IndicatorData[] = [];
  const minusDI: IndicatorData[] = [];
  const dx: number[] = [];
  
  for (let i = 0; i < smoothedTR.length; i++) {
    const pdi = smoothedTR[i] > 0 ? (smoothedPlusDM[i] / smoothedTR[i]) * 100 : 0;
    const mdi = smoothedTR[i] > 0 ? (smoothedMinusDM[i] / smoothedTR[i]) * 100 : 0;
    
    plusDI.push({ time: data[i + period].time, value: pdi });
    minusDI.push({ time: data[i + period].time, value: mdi });
    
    const diSum = pdi + mdi;
    dx.push(diSum > 0 ? (Math.abs(pdi - mdi) / diSum) * 100 : 0);
  }
  
  // Smooth DX to get ADX
  const adxValues = smoothArray(dx, period);
  const adx: IndicatorData[] = adxValues.map((value, i) => ({
    time: plusDI[i + period - 1]?.time || data[i + period * 2].time,
    value,
  }));
  
  return { adx, plusDI, minusDI };
}

// Helper: Smooth array using Wilder's smoothing
function smoothArray(arr: number[], period: number): number[] {
  const result: number[] = [];
  let sum = 0;
  
  for (let i = 0; i < arr.length; i++) {
    if (i < period) {
      sum += arr[i];
      if (i === period - 1) result.push(sum / period);
    } else {
      const prev = result[result.length - 1];
      result.push((prev * (period - 1) + arr[i]) / period);
    }
  }
  
  return result;
}

// ============================================
// PARABOLIC SAR
// ============================================

export interface ParabolicSARData {
  sar: IndicatorData[];
  trend: ('up' | 'down')[];
}

export function calculateParabolicSAR(
  data: OHLCV[],
  af: number = 0.02,
  maxAF: number = 0.2
): ParabolicSARData {
  const sar: IndicatorData[] = [];
  const trend: ('up' | 'down')[] = [];
  
  if (data.length < 5) return { sar: [], trend: [] };
  
  let currentTrend: 'up' | 'down' = data[1].close > data[0].close ? 'up' : 'down';
  let ep = currentTrend === 'up' ? data[0].high : data[0].low;
  let currentSAR = currentTrend === 'up' ? data[0].low : data[0].high;
  let currentAF = af;
  
  for (let i = 1; i < data.length; i++) {
    const candle = data[i];
    const prevCandle = data[i - 1];
    
    // Update SAR
    currentSAR = currentSAR + currentAF * (ep - currentSAR);
    
    // Ensure SAR is within previous candle range
    if (currentTrend === 'up') {
      currentSAR = Math.min(currentSAR, prevCandle.low, data[Math.max(0, i - 2)]?.low || currentSAR);
    } else {
      currentSAR = Math.max(currentSAR, prevCandle.high, data[Math.max(0, i - 2)]?.high || currentSAR);
    }
    
    // Check for trend reversal
    let reversed = false;
    if (currentTrend === 'up' && candle.low < currentSAR) {
      currentTrend = 'down';
      currentSAR = ep;
      ep = candle.low;
      currentAF = af;
      reversed = true;
    } else if (currentTrend === 'down' && candle.high > currentSAR) {
      currentTrend = 'up';
      currentSAR = ep;
      ep = candle.high;
      currentAF = af;
      reversed = true;
    }
    
    // Update EP and AF
    if (!reversed) {
      if (currentTrend === 'up' && candle.high > ep) {
        ep = candle.high;
        currentAF = Math.min(currentAF + af, maxAF);
      } else if (currentTrend === 'down' && candle.low < ep) {
        ep = candle.low;
        currentAF = Math.min(currentAF + af, maxAF);
      }
    }
    
    sar.push({ time: candle.time, value: currentSAR });
    trend.push(currentTrend);
  }
  
  return { sar, trend };
}

// ============================================
// WILLIAMS %R
// ============================================

export function calculateWilliamsR(data: OHLCV[], period: number = 14): IndicatorData[] {
  const result: IndicatorData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const high = Math.max(...slice.map(d => d.high));
    const low = Math.min(...slice.map(d => d.low));
    const close = data[i].close;
    
    const wr = high !== low ? ((high - close) / (high - low)) * -100 : -50;
    
    result.push({
      time: data[i].time,
      value: wr,
    });
  }
  
  return result;
}

// ============================================
// CCI (COMMODITY CHANNEL INDEX)
// ============================================

export function calculateCCI(data: OHLCV[], period: number = 20): IndicatorData[] {
  const result: IndicatorData[] = [];
  const tp: number[] = data.map(d => (d.high + d.low + d.close) / 3);
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = tp.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    
    let mad = 0;
    for (const val of slice) {
      mad += Math.abs(val - sma);
    }
    mad /= period;
    
    const cci = mad !== 0 ? (tp[i] - sma) / (0.015 * mad) : 0;
    
    result.push({
      time: data[i].time,
      value: cci,
    });
  }
  
  return result;
}

// ============================================
// MFI (MONEY FLOW INDEX)
// ============================================

export function calculateMFI(data: OHLCV[], period: number = 14): IndicatorData[] {
  const result: IndicatorData[] = [];
  const mf: number[] = [];
  const positiveMF: number[] = [];
  const negativeMF: number[] = [];
  
  // Calculate typical price and money flow
  for (let i = 0; i < data.length; i++) {
    const tp = (data[i].high + data[i].low + data[i].close) / 3;
    mf.push(tp * data[i].volume);
    
    if (i > 0) {
      const prevTP = (data[i - 1].high + data[i - 1].low + data[i - 1].close) / 3;
      positiveMF.push(tp > prevTP ? mf[i] : 0);
      negativeMF.push(tp < prevTP ? mf[i] : 0);
    }
  }
  
  // Calculate MFI
  for (let i = period; i < data.length; i++) {
    let posSum = 0;
    let negSum = 0;
    
    for (let j = 0; j < period; j++) {
      posSum += positiveMF[i - j];
      negSum += negativeMF[i - j];
    }
    
    const mfRatio = negSum !== 0 ? posSum / negSum : 0;
    const mfi = 100 - (100 / (1 + mfRatio));
    
    result.push({
      time: data[i].time,
      value: mfi,
    });
  }
  
  return result;
}

// ============================================
// KELTNER CHANNELS
// ============================================

export interface KeltnerChannelData {
  upper: IndicatorData[];
  middle: IndicatorData[];
  lower: IndicatorData[];
}

export function calculateKeltnerChannels(
  data: OHLCV[],
  emaPeriod: number = 20,
  atrPeriod: number = 10,
  multiplier: number = 2
): KeltnerChannelData {
  const ema = calculateEMA(data, emaPeriod);
  const atr = calculateATR(data, atrPeriod);
  
  const upper: IndicatorData[] = [];
  const lower: IndicatorData[] = [];
  
  const offset = ema.length - atr.length;
  
  for (let i = 0; i < atr.length; i++) {
    const mid = ema[i + offset].value;
    upper.push({
      time: atr[i].time,
      value: mid + multiplier * atr[i].value,
    });
    lower.push({
      time: atr[i].time,
      value: mid - multiplier * atr[i].value,
    });
  }
  
  return {
    upper,
    middle: ema.slice(offset),
    lower,
  };
}

// Re-export WMA from main indicators
function calculateWMA(data: OHLCV[], period: number): IndicatorData[] {
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

// Re-export needed functions
export { calculateATR, calculateEMA } from './index';
