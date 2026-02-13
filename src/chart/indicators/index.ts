// Technical Indicators Library
// All indicators are implemented from scratch without external dependencies

import { Candle } from '../engine/types';

export interface IndicatorPoint {
  time: number;
  values: Record<string, number>;
}

// ============ MOVING AVERAGES ============

/**
 * Simple Moving Average (SMA)
 */
export function calculateSMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push({
      time: candles[i].time,
      values: { sma: sum / period },
    });
  }
  
  return result;
}

/**
 * Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += candles[i].close;
  }
  ema /= period;
  
  result.push({
    time: candles[period - 1].time,
    values: { ema },
  });
  
  // Calculate subsequent EMAs
  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    result.push({
      time: candles[i].time,
      values: { ema },
    });
  }
  
  return result;
}

/**
 * Weighted Moving Average (WMA)
 */
export function calculateWMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  const weights = [];
  let weightSum = 0;
  
  for (let i = 1; i <= period; i++) {
    weights.push(i);
    weightSum += i;
  }
  
  for (let i = period - 1; i < candles.length; i++) {
    let wma = 0;
    for (let j = 0; j < period; j++) {
      wma += candles[i - j].close * weights[period - 1 - j];
    }
    result.push({
      time: candles[i].time,
      values: { wma: wma / weightSum },
    });
  }
  
  return result;
}

/**
 * Volume Weighted Moving Average (VWMA)
 */
export function calculateVWMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  for (let i = period - 1; i < candles.length; i++) {
    let sumPV = 0;
    let sumV = 0;
    
    for (let j = 0; j < period; j++) {
      sumPV += candles[i - j].close * candles[i - j].volume;
      sumV += candles[i - j].volume;
    }
    
    result.push({
      time: candles[i].time,
      values: { vwma: sumV > 0 ? sumPV / sumV : 0 },
    });
  }
  
  return result;
}

/**
 * Hull Moving Average (HMA)
 */
export function calculateHMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  const halfPeriod = Math.floor(period / 2);
  const sqrtPeriod = Math.floor(Math.sqrt(period));
  
  // Calculate WMA for half period
  const wmaHalf = calculateWMAArray(candles.map(c => c.close), halfPeriod);
  // Calculate WMA for full period
  const wmaFull = calculateWMAArray(candles.map(c => c.close), period);
  
  // Calculate raw HMA values
  const rawHMA: number[] = [];
  for (let i = 0; i < wmaHalf.length; i++) {
    const idx = i + (period - 1);
    if (idx < wmaFull.length + halfPeriod - 1) {
      rawHMA.push(2 * wmaHalf[i] - (wmaFull[i] || wmaHalf[i]));
    }
  }
  
  // Calculate final HMA using WMA of sqrt(period)
  const hmaValues = calculateWMAArray(rawHMA, sqrtPeriod);
  
  for (let i = 0; i < hmaValues.length; i++) {
    const idx = i + (period - 1) + sqrtPeriod - 1;
    if (idx < candles.length) {
      result.push({
        time: candles[idx].time,
        values: { hma: hmaValues[i] },
      });
    }
  }
  
  return result;
}

function calculateWMAArray(data: number[], period: number): number[] {
  const result: number[] = [];
  const weights: number[] = [];
  let weightSum = 0;
  
  for (let i = 1; i <= period; i++) {
    weights.push(i);
    weightSum += i;
  }
  
  for (let i = period - 1; i < data.length; i++) {
    let wma = 0;
    for (let j = 0; j < period; j++) {
      wma += data[i - j] * weights[period - 1 - j];
    }
    result.push(wma / weightSum);
  }
  
  return result;
}

// ============ TREND INDICATORS ============

/**
 * MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  const fastEMA = calculateEMAValues(candles.map(c => c.close), fastPeriod);
  const slowEMA = calculateEMAValues(candles.map(c => c.close), slowPeriod);
  
  // Calculate MACD line
  const macdLine: number[] = [];
  const offset = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i]);
  }
  
  // Calculate signal line
  const signalLine = calculateEMAFromArray(macdLine, signalPeriod);
  
  // Calculate histogram
  for (let i = signalPeriod - 1; i < macdLine.length; i++) {
    const signalIdx = i - (signalPeriod - 1);
    const macd = macdLine[i];
    const signal = signalLine[signalIdx];
    
    result.push({
      time: candles[i + slowPeriod - 1].time,
      values: {
        macd,
        signal,
        histogram: macd - signal,
      },
    });
  }
  
  return result;
}

/**
 * ADX (Average Directional Index)
 */
export function calculateADX(candles: Candle[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevHigh = candles[i - 1].high;
    const prevLow = candles[i - 1].low;
    const prevClose = candles[i - 1].close;
    
    // True Range
    tr.push(Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    ));
    
    // +DM and -DM
    const upMove = high - prevHigh;
    const downMove = prevLow - low;
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  
  // Smooth TR, +DM, -DM
  const smoothedTR = smoothArray(tr, period);
  const smoothedPlusDM = smoothArray(plusDM, period);
  const smoothedMinusDM = smoothArray(minusDM, period);
  
  // Calculate +DI and -DI
  for (let i = period - 1; i < smoothedTR.length; i++) {
    const plusDI = smoothedTR[i] > 0 ? (smoothedPlusDM[i] / smoothedTR[i]) * 100 : 0;
    const minusDI = smoothedTR[i] > 0 ? (smoothedMinusDM[i] / smoothedTR[i]) * 100 : 0;
    
    const dx = (plusDI + minusDI) > 0 ? (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100 : 0;
    
    result.push({
      time: candles[i + 1].time,
      values: {
        adx: dx, // Simplified, actual ADX is smoothed
        plusDI,
        minusDI,
      },
    });
  }
  
  // Smooth ADX
  const adxValues = result.map(r => r.values.adx);
  const smoothedADX = smoothArray(adxValues, period);
  
  for (let i = 0; i < smoothedADX.length; i++) {
    result[i + period - 1].values.adx = smoothedADX[i];
  }
  
  return result.slice(period - 1);
}

/**
 * Ichimoku Cloud
 */
export function calculateIchimoku(
  candles: Candle[],
  tenkanPeriod: number = 9,
  kijunPeriod: number = 26,
  senkouBPeriod: number = 52,
  displacement: number = 26
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  for (let i = senkouBPeriod - 1; i < candles.length; i++) {
    // Tenkan-sen (Conversion Line)
    const tenkanHigh = Math.max(...candles.slice(i - tenkanPeriod + 1, i + 1).map(c => c.high));
    const tenkanLow = Math.min(...candles.slice(i - tenkanPeriod + 1, i + 1).map(c => c.low));
    const tenkan = (tenkanHigh + tenkanLow) / 2;
    
    // Kijun-sen (Base Line)
    const kijunHigh = Math.max(...candles.slice(i - kijunPeriod + 1, i + 1).map(c => c.high));
    const kijunLow = Math.min(...candles.slice(i - kijunPeriod + 1, i + 1).map(c => c.low));
    const kijun = (kijunHigh + kijunLow) / 2;
    
    // Senkou Span A (Leading Span A)
    const senkouA = (tenkan + kijun) / 2;
    
    // Senkou Span B (Leading Span B)
    const senkouBHigh = Math.max(...candles.slice(i - senkouBPeriod + 1, i + 1).map(c => c.high));
    const senkouBLow = Math.min(...candles.slice(i - senkouBPeriod + 1, i + 1).map(c => c.low));
    const senkouB = (senkouBHigh + senkouBLow) / 2;
    
    // Chikou Span (Lagging Span) - current close shifted back
    const chikou = candles[i].close;
    
    result.push({
      time: candles[i].time,
      values: {
        tenkan,
        kijun,
        senkouA,
        senkouB,
        chikou,
      },
    });
  }
  
  return result;
}

/**
 * Parabolic SAR
 */
export function calculateParabolicSAR(
  candles: Candle[],
  step: number = 0.02,
  maxAF: number = 0.2
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  if (candles.length < 2) return result;
  
  let isUptrend = candles[1].close > candles[0].close;
  let af = step;
  let ep = isUptrend ? candles[1].high : candles[1].low;
  let sar = isUptrend ? candles[0].low : candles[0].high;
  
  for (let i = 1; i < candles.length; i++) {
    const prevSar = sar;
    
    // Calculate new SAR
    sar = prevSar + af * (ep - prevSar);
    
    // Check for trend reversal
    if (isUptrend) {
      if (candles[i].low < sar) {
        isUptrend = false;
        sar = ep;
        af = step;
        ep = candles[i].low;
      } else {
        if (candles[i].high > ep) {
          ep = candles[i].high;
          af = Math.min(af + step, maxAF);
        }
        sar = Math.min(sar, candles[i - 1].low, candles[i].low);
      }
    } else {
      if (candles[i].high > sar) {
        isUptrend = true;
        sar = ep;
        af = step;
        ep = candles[i].high;
      } else {
        if (candles[i].low < ep) {
          ep = candles[i].low;
          af = Math.min(af + step, maxAF);
        }
        sar = Math.max(sar, candles[i - 1].high, candles[i].high);
      }
    }
    
    result.push({
      time: candles[i].time,
      values: { sar },
    });
  }
  
  return result;
}

// ============ VOLATILITY INDICATORS ============

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1).map(c => c.close);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    
    // Calculate standard deviation
    const squaredDiffs = slice.map(v => Math.pow(v - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(variance);
    
    result.push({
      time: candles[i].time,
      values: {
        middle: sma,
        upper: sma + stdDev * std,
        lower: sma - stdDev * std,
      },
    });
  }
  
  return result;
}

/**
 * Keltner Channels
 */
export function calculateKeltnerChannels(
  candles: Candle[],
  emaPeriod: number = 20,
  atrPeriod: number = 10,
  multiplier: number = 2
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  const emaValues = calculateEMAValues(candles.map(c => c.close), emaPeriod);
  const atrValues = calculateATRValues(candles, atrPeriod);
  
  const offset = Math.max(emaPeriod, atrPeriod) - 1;
  
  for (let i = 0; i < Math.min(emaValues.length, atrValues.length); i++) {
    const idx = i + offset;
    if (idx < candles.length) {
      result.push({
        time: candles[idx].time,
        values: {
          middle: emaValues[i],
          upper: emaValues[i] + multiplier * atrValues[i],
          lower: emaValues[i] - multiplier * atrValues[i],
        },
      });
    }
  }
  
  return result;
}

/**
 * ATR (Average True Range)
 */
export function calculateATR(candles: Candle[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  const atrValues = calculateATRValues(candles, period);
  
  for (let i = period; i < candles.length; i++) {
    result.push({
      time: candles[i].time,
      values: { atr: atrValues[i - period] },
    });
  }
  
  return result;
}

function calculateATRValues(candles: Candle[], period: number): number[] {
  const tr: number[] = [];
  
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    
    tr.push(Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    ));
  }
  
  return smoothArray(tr, period);
}

/**
 * Standard Deviation Channels
 */
export function calculateStdDevChannels(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2
): IndicatorPoint[] {
  return calculateBollingerBands(candles, period, stdDev);
}

// ============ MOMENTUM/OSCILLATORS ============

/**
 * RSI (Relative Strength Index)
 */
export function calculateRSI(candles: Candle[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // Calculate initial averages
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // First RSI
  if (avgLoss !== 0) {
    const rs = avgGain / avgLoss;
    result.push({
      time: candles[period].time,
      values: { rsi: 100 - (100 / (1 + rs)) },
    });
  } else {
    result.push({
      time: candles[period].time,
      values: { rsi: 100 },
    });
  }
  
  // Calculate subsequent RSIs
  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    if (avgLoss !== 0) {
      const rs = avgGain / avgLoss;
      result.push({
        time: candles[i].time,
        values: { rsi: 100 - (100 / (1 + rs)) },
      });
    } else {
      result.push({
        time: candles[i].time,
        values: { rsi: 100 },
      });
    }
  }
  
  return result;
}

/**
 * Stochastic Oscillator
 */
export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  const kValues: number[] = [];
  
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1);
    const high = Math.max(...slice.map(c => c.high));
    const low = Math.min(...slice.map(c => c.low));
    const close = candles[i].close;
    
    const k = high !== low ? ((close - low) / (high - low)) * 100 : 50;
    kValues.push(k);
  }
  
  // Calculate %D (SMA of %K)
  for (let i = dPeriod - 1; i < kValues.length; i++) {
    let d = 0;
    for (let j = 0; j < dPeriod; j++) {
      d += kValues[i - j];
    }
    d /= dPeriod;
    
    result.push({
      time: candles[i + kPeriod - 1].time,
      values: {
        k: kValues[i],
        d,
      },
    });
  }
  
  return result;
}

/**
 * CCI (Commodity Channel Index)
 */
export function calculateCCI(candles: Candle[], period: number = 20): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    
    // Calculate TP (Typical Price)
    const tps = slice.map(c => (c.high + c.low + c.close) / 3);
    const sma = tps.reduce((a, b) => a + b, 0) / period;
    
    // Calculate Mean Deviation
    const meanDev = tps.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;
    
    // Calculate CCI
    const currentTP = (candles[i].high + candles[i].low + candles[i].close) / 3;
    const cci = meanDev !== 0 ? (currentTP - sma) / (0.015 * meanDev) : 0;
    
    result.push({
      time: candles[i].time,
      values: { cci },
    });
  }
  
  return result;
}

/**
 * Williams %R
 */
export function calculateWilliamsR(candles: Candle[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const high = Math.max(...slice.map(c => c.high));
    const low = Math.min(...slice.map(c => c.low));
    const close = candles[i].close;
    
    const williamsR = high !== low ? ((high - close) / (high - low)) * -100 : -50;
    
    result.push({
      time: candles[i].time,
      values: { williamsR },
    });
  }
  
  return result;
}

/**
 * MFI (Money Flow Index)
 */
export function calculateMFI(candles: Candle[], period: number = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  let positiveMF = 0;
  let negativeMF = 0;
  let prevTP = 0;
  
  for (let i = 0; i < candles.length; i++) {
    const tp = (candles[i].high + candles[i].low + candles[i].close) / 3;
    const mf = tp * candles[i].volume;
    
    if (i > 0) {
      if (tp > prevTP) {
        positiveMF += mf;
      } else {
        negativeMF += mf;
      }
    }
    
    if (i >= period) {
      const mfi = negativeMF !== 0 ? 100 - (100 / (1 + positiveMF / negativeMF)) : 100;
      
      result.push({
        time: candles[i].time,
        values: { mfi },
      });
      
      // Remove old values for rolling calculation
      const oldTP = (candles[i - period].high + candles[i - period].low + candles[i - period].close) / 3;
      const oldMF = oldTP * candles[i - period].volume;
      const prevOldTP = i - period > 0 ? (candles[i - period - 1].high + candles[i - period - 1].low + candles[i - period - 1].close) / 3 : oldTP;
      
      if (oldTP > prevOldTP) {
        positiveMF -= oldMF;
      } else {
        negativeMF -= oldMF;
      }
    }
    
    prevTP = tp;
  }
  
  return result;
}

// ============ VOLUME INDICATORS ============

/**
 * VWAP (Volume Weighted Average Price)
 */
export function calculateVWAP(candles: Candle[]): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  
  let cumulativeTPV = 0;
  let cumulativeV = 0;
  
  for (const candle of candles) {
    const tp = (candle.high + candle.low + candle.close) / 3;
    const tpv = tp * candle.volume;
    
    cumulativeTPV += tpv;
    cumulativeV += candle.volume;
    
    result.push({
      time: candle.time,
      values: { vwap: cumulativeV > 0 ? cumulativeTPV / cumulativeV : 0 },
    });
  }
  
  return result;
}

/**
 * OBV (On Balance Volume)
 */
export function calculateOBV(candles: Candle[]): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  let obv = 0;
  
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      obv = candles[i].volume;
    } else {
      if (candles[i].close > candles[i - 1].close) {
        obv += candles[i].volume;
      } else if (candles[i].close < candles[i - 1].close) {
        obv -= candles[i].volume;
      }
    }
    
    result.push({
      time: candles[i].time,
      values: { obv },
    });
  }
  
  return result;
}

// ============ HELPER FUNCTIONS ============

function calculateEMAValues(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += data[i];
  }
  ema /= period;
  result.push(ema);
  
  // Calculate subsequent EMAs
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
}

function calculateEMAFromArray(data: number[], period: number): number[] {
  return calculateEMAValues(data, period);
}

function smoothArray(data: number[], period: number): number[] {
  const result: number[] = [];
  let sum = 0;
  
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    
    if (i >= period - 1) {
      result.push(sum / period);
      sum -= data[i - period + 1];
    }
  }
  
  return result;
}

// ============ INDICATOR REGISTRY ============

export type IndicatorCalculator = (candles: Candle[], params: Record<string, number>) => IndicatorPoint[];

export interface IndicatorDefinition {
  id: string;
  name: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume';
  overlay: boolean;
  defaultParams: Record<string, number>;
  defaultColors: Record<string, string>;
  calculator: IndicatorCalculator;
}

export const INDICATORS: IndicatorDefinition[] = [
  {
    id: 'sma',
    name: 'Simple Moving Average',
    category: 'trend',
    overlay: true,
    defaultParams: { period: 20 },
    defaultColors: { sma: '#3b82f6' },
    calculator: (candles, params) => calculateSMA(candles, params.period || 20),
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average',
    category: 'trend',
    overlay: true,
    defaultParams: { period: 20 },
    defaultColors: { ema: '#f59e0b' },
    calculator: (candles, params) => calculateEMA(candles, params.period || 20),
  },
  {
    id: 'wma',
    name: 'Weighted Moving Average',
    category: 'trend',
    overlay: true,
    defaultParams: { period: 20 },
    defaultColors: { wma: '#8b5cf6' },
    calculator: (candles, params) => calculateWMA(candles, params.period || 20),
  },
  {
    id: 'vwma',
    name: 'Volume Weighted MA',
    category: 'trend',
    overlay: true,
    defaultParams: { period: 20 },
    defaultColors: { vwma: '#ec4899' },
    calculator: (candles, params) => calculateVWMA(candles, params.period || 20),
  },
  {
    id: 'hma',
    name: 'Hull Moving Average',
    category: 'trend',
    overlay: true,
    defaultParams: { period: 20 },
    defaultColors: { hma: '#06b6d4' },
    calculator: (candles, params) => calculateHMA(candles, params.period || 20),
  },
  {
    id: 'macd',
    name: 'MACD',
    category: 'trend',
    overlay: false,
    defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    defaultColors: { macd: '#3b82f6', signal: '#f59e0b', histogram: '#22c55e' },
    calculator: (candles, params) => calculateMACD(candles, params.fastPeriod, params.slowPeriod, params.signalPeriod),
  },
  {
    id: 'adx',
    name: 'Average Directional Index',
    category: 'trend',
    overlay: false,
    defaultParams: { period: 14 },
    defaultColors: { adx: '#3b82f6', plusDI: '#22c55e', minusDI: '#ef4444' },
    calculator: (candles, params) => calculateADX(candles, params.period || 14),
  },
  {
    id: 'ichimoku',
    name: 'Ichimoku Cloud',
    category: 'trend',
    overlay: true,
    defaultParams: { tenkanPeriod: 9, kijunPeriod: 26, senkouBPeriod: 52 },
    defaultColors: { tenkan: '#3b82f6', kijun: '#ef4444', senkouA: '#22c55e', senkouB: '#ef4444' },
    calculator: (candles, params) => calculateIchimoku(candles, params.tenkanPeriod, params.kijunPeriod, params.senkouBPeriod),
  },
  {
    id: 'parabolic_sar',
    name: 'Parabolic SAR',
    category: 'trend',
    overlay: true,
    defaultParams: { step: 0.02, maxAF: 0.2 },
    defaultColors: { sar: '#22c55e' },
    calculator: (candles, params) => calculateParabolicSAR(candles, params.step, params.maxAF),
  },
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    category: 'volatility',
    overlay: true,
    defaultParams: { period: 20, stdDev: 2 },
    defaultColors: { upper: '#ef4444', middle: '#3b82f6', lower: '#22c55e' },
    calculator: (candles, params) => calculateBollingerBands(candles, params.period || 20, params.stdDev || 2),
  },
  {
    id: 'keltner',
    name: 'Keltner Channels',
    category: 'volatility',
    overlay: true,
    defaultParams: { emaPeriod: 20, atrPeriod: 10, multiplier: 2 },
    defaultColors: { upper: '#ef4444', middle: '#3b82f6', lower: '#22c55e' },
    calculator: (candles, params) => calculateKeltnerChannels(candles, params.emaPeriod, params.atrPeriod, params.multiplier),
  },
  {
    id: 'atr',
    name: 'Average True Range',
    category: 'volatility',
    overlay: false,
    defaultParams: { period: 14 },
    defaultColors: { atr: '#3b82f6' },
    calculator: (candles, params) => calculateATR(candles, params.period || 14),
  },
  {
    id: 'rsi',
    name: 'Relative Strength Index',
    category: 'momentum',
    overlay: false,
    defaultParams: { period: 14 },
    defaultColors: { rsi: '#a855f7' },
    calculator: (candles, params) => calculateRSI(candles, params.period || 14),
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    category: 'momentum',
    overlay: false,
    defaultParams: { kPeriod: 14, dPeriod: 3 },
    defaultColors: { k: '#3b82f6', d: '#ef4444' },
    calculator: (candles, params) => calculateStochastic(candles, params.kPeriod, params.dPeriod),
  },
  {
    id: 'cci',
    name: 'Commodity Channel Index',
    category: 'momentum',
    overlay: false,
    defaultParams: { period: 20 },
    defaultColors: { cci: '#3b82f6' },
    calculator: (candles, params) => calculateCCI(candles, params.period || 20),
  },
  {
    id: 'williams_r',
    name: 'Williams %R',
    category: 'momentum',
    overlay: false,
    defaultParams: { period: 14 },
    defaultColors: { williamsR: '#a855f7' },
    calculator: (candles, params) => calculateWilliamsR(candles, params.period || 14),
  },
  {
    id: 'mfi',
    name: 'Money Flow Index',
    category: 'momentum',
    overlay: false,
    defaultParams: { period: 14 },
    defaultColors: { mfi: '#22c55e' },
    calculator: (candles, params) => calculateMFI(candles, params.period || 14),
  },
  {
    id: 'vwap',
    name: 'VWAP',
    category: 'volume',
    overlay: true,
    defaultParams: {},
    defaultColors: { vwap: '#f59e0b' },
    calculator: (candles) => calculateVWAP(candles),
  },
  {
    id: 'obv',
    name: 'On Balance Volume',
    category: 'volume',
    overlay: false,
    defaultParams: {},
    defaultColors: { obv: '#3b82f6' },
    calculator: (candles) => calculateOBV(candles),
  },
];

export function getIndicatorById(id: string): IndicatorDefinition | undefined {
  return INDICATORS.find(i => i.id === id);
}

export function calculateIndicator(
  id: string,
  candles: Candle[],
  params: Record<string, number> = {}
): IndicatorPoint[] {
  const definition = getIndicatorById(id);
  if (!definition) return [];
  
  return definition.calculator(candles, { ...definition.defaultParams, ...params });
}
