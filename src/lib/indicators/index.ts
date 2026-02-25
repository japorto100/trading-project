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

/**
 * @deprecated Python is the authoritative implementation. Use the indicator-service API
 * via `callIndicatorService('/api/v1/indicators/exotic-ma', { maType: 'sma', ... })`.
 * This function will be removed in Phase 8 cleanup.
 */
export function calculateSMA(data: OHLCV[], period: number): IndicatorData[] {
	if (period <= 0 || data.length < period) return [];
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

/**
 * @deprecated Python is the authoritative implementation. Use the indicator-service API
 * via `callIndicatorService('/api/v1/indicators/exotic-ma', { maType: 'ema', ... })`.
 * This function will be removed in Phase 8 cleanup.
 */
export function calculateEMA(data: OHLCV[], period: number): IndicatorData[] {
	if (period <= 0 || data.length < period) return [];
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
	if (period <= 0 || data.length < period) return [];
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

/**
 * @deprecated Python is the authoritative implementation. Use the indicator-service API
 * via `callIndicatorService('/api/v1/indicators/rsi/atr-adjusted', ...)` or the composite
 * signal endpoint. This function will be removed in Phase 8 cleanup.
 */
export function calculateRSI(data: OHLCV[], period: number = 14): IndicatorData[] {
	if (period <= 0 || data.length <= period) return [];
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
		value: 100 - 100 / (1 + rs),
	});

	// Calculate subsequent RSIs using smoothed method
	for (let i = period; i < gains.length; i++) {
		avgGain = (avgGain * (period - 1) + gains[i]) / period;
		avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

		const rs = avgLoss !== 0 ? avgGain / avgLoss : 0;
		result.push({
			time: data[i + 1].time,
			value: 100 - 100 / (1 + rs),
		});
	}

	return result;
}

export function calculateStochastic(
	data: OHLCV[],
	kPeriod: number = 14,
	dPeriod: number = 3,
): { k: IndicatorData[]; d: IndicatorData[] } {
	const kValues: IndicatorData[] = [];

	for (let i = kPeriod - 1; i < data.length; i++) {
		const slice = data.slice(i - kPeriod + 1, i + 1);
		const high = Math.max(...slice.map((d) => d.high));
		const low = Math.min(...slice.map((d) => d.low));
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
	signalPeriod: number = 9,
): MACDData[] {
	if (data.length < slowPeriod + signalPeriod) return [];
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
	stdDev: number = 2,
): BollingerBandsData[] {
	if (period <= 0 || data.length < period) return [];
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
			sqSum += (data[i - j].close - sma) ** 2;
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
	if (period <= 0 || data.length <= period) return [];
	const trueRanges: number[] = [];

	for (let i = 1; i < data.length; i++) {
		const high = data[i].high;
		const low = data[i].low;
		const prevClose = data[i - 1].close;

		const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
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

export function calculateHMA(data: OHLCV[], period: number = 20): IndicatorData[] {
	if (period <= 1 || data.length < period) return [];
	const halfPeriod = Math.max(1, Math.floor(period / 2));
	const sqrtPeriod = Math.max(1, Math.floor(Math.sqrt(period)));

	const wmaHalf = calculateWMA(data, halfPeriod);
	const wmaFull = calculateWMA(data, period);
	if (wmaHalf.length === 0 || wmaFull.length === 0) return [];

	const fullByTime = new Map<number, number>(wmaFull.map((point) => [point.time, point.value]));
	const raw: IndicatorData[] = [];
	for (const point of wmaHalf) {
		const fullValue = fullByTime.get(point.time);
		if (fullValue === undefined) continue;
		raw.push({ time: point.time, value: 2 * point.value - fullValue });
	}
	if (raw.length < sqrtPeriod) return [];

	return calculateWMAFromValues(raw, sqrtPeriod);
}

function calculateWMAFromValues(data: IndicatorData[], period: number): IndicatorData[] {
	if (period <= 0 || data.length < period) return [];
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

export interface ADXData {
	adx: IndicatorData[];
	plusDI: IndicatorData[];
	minusDI: IndicatorData[];
}

export function calculateADX(data: OHLCV[], period: number = 14): ADXData {
	if (period <= 0 || data.length <= period * 2) {
		return { adx: [], plusDI: [], minusDI: [] };
	}

	const tr: number[] = [];
	const plusDM: number[] = [];
	const minusDM: number[] = [];

	for (let i = 1; i < data.length; i++) {
		const high = data[i].high;
		const low = data[i].low;
		const prevHigh = data[i - 1].high;
		const prevLow = data[i - 1].low;
		const prevClose = data[i - 1].close;

		tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));

		const upMove = high - prevHigh;
		const downMove = prevLow - low;

		plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
		minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
	}

	const smoothedTR = smoothArray(tr, period);
	const smoothedPlusDM = smoothArray(plusDM, period);
	const smoothedMinusDM = smoothArray(minusDM, period);

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

	const adxValues = smoothArray(dx, period);
	const adx: IndicatorData[] = adxValues.map((value, i) => ({
		time: plusDI[i + period - 1]?.time ?? data[i + period * 2].time,
		value,
	}));

	return { adx, plusDI, minusDI };
}

function smoothArray(arr: number[], period: number): number[] {
	const result: number[] = [];
	let sum = 0;

	for (let i = 0; i < arr.length; i++) {
		if (i < period) {
			sum += arr[i];
			if (i === period - 1) {
				result.push(sum / period);
			}
		} else {
			const prev = result[result.length - 1];
			result.push((prev * (period - 1) + arr[i]) / period);
		}
	}

	return result;
}

export interface IchimokuData {
	tenkan: IndicatorData[];
	kijun: IndicatorData[];
	senkouA: IndicatorData[];
	senkouB: IndicatorData[];
}

export function calculateIchimoku(
	data: OHLCV[],
	tenkanPeriod: number = 9,
	kijunPeriod: number = 26,
	senkouBPeriod: number = 52,
	displacement: number = 26,
): IchimokuData {
	const tenkan: IndicatorData[] = [];
	const kijun: IndicatorData[] = [];
	const senkouA: IndicatorData[] = [];
	const senkouB: IndicatorData[] = [];

	for (let i = tenkanPeriod - 1; i < data.length; i++) {
		const slice = data.slice(i - tenkanPeriod + 1, i + 1);
		const high = Math.max(...slice.map((entry) => entry.high));
		const low = Math.min(...slice.map((entry) => entry.low));
		tenkan.push({
			time: data[i].time,
			value: (high + low) / 2,
		});
	}

	for (let i = kijunPeriod - 1; i < data.length; i++) {
		const slice = data.slice(i - kijunPeriod + 1, i + 1);
		const high = Math.max(...slice.map((entry) => entry.high));
		const low = Math.min(...slice.map((entry) => entry.low));
		kijun.push({
			time: data[i].time,
			value: (high + low) / 2,
		});
	}

	const minLen = Math.min(tenkan.length, kijun.length);
	for (let i = 0; i < minLen; i++) {
		const nextTime = data[i + kijunPeriod - 1 + displacement]?.time;
		if (nextTime === undefined) continue;
		senkouA.push({
			time: nextTime,
			value: (tenkan[i].value + kijun[i].value) / 2,
		});
	}

	for (let i = senkouBPeriod - 1; i < data.length; i++) {
		const slice = data.slice(i - senkouBPeriod + 1, i + 1);
		const high = Math.max(...slice.map((entry) => entry.high));
		const low = Math.min(...slice.map((entry) => entry.low));
		const nextTime = data[i + displacement]?.time;
		if (nextTime === undefined) continue;
		senkouB.push({
			time: nextTime,
			value: (high + low) / 2,
		});
	}

	return { tenkan, kijun, senkouA, senkouB };
}

export interface ParabolicSARData {
	sar: IndicatorData[];
	trend: Array<"up" | "down">;
}

export function calculateParabolicSAR(
	data: OHLCV[],
	step: number = 0.02,
	maxAF: number = 0.2,
): ParabolicSARData {
	const sar: IndicatorData[] = [];
	const trend: Array<"up" | "down"> = [];
	if (data.length < 5) return { sar: [], trend: [] };

	let currentTrend: "up" | "down" = data[1].close > data[0].close ? "up" : "down";
	let ep = currentTrend === "up" ? data[0].high : data[0].low;
	let currentSAR = currentTrend === "up" ? data[0].low : data[0].high;
	let currentAF = step;

	for (let i = 1; i < data.length; i++) {
		const candle = data[i];
		const prevCandle = data[i - 1];

		currentSAR = currentSAR + currentAF * (ep - currentSAR);

		if (currentTrend === "up") {
			currentSAR = Math.min(
				currentSAR,
				prevCandle.low,
				data[Math.max(0, i - 2)]?.low ?? currentSAR,
			);
		} else {
			currentSAR = Math.max(
				currentSAR,
				prevCandle.high,
				data[Math.max(0, i - 2)]?.high ?? currentSAR,
			);
		}

		let reversed = false;
		if (currentTrend === "up" && candle.low < currentSAR) {
			currentTrend = "down";
			currentSAR = ep;
			ep = candle.low;
			currentAF = step;
			reversed = true;
		} else if (currentTrend === "down" && candle.high > currentSAR) {
			currentTrend = "up";
			currentSAR = ep;
			ep = candle.high;
			currentAF = step;
			reversed = true;
		}

		if (!reversed) {
			if (currentTrend === "up" && candle.high > ep) {
				ep = candle.high;
				currentAF = Math.min(currentAF + step, maxAF);
			} else if (currentTrend === "down" && candle.low < ep) {
				ep = candle.low;
				currentAF = Math.min(currentAF + step, maxAF);
			}
		}

		sar.push({ time: candle.time, value: currentSAR });
		trend.push(currentTrend);
	}

	return { sar, trend };
}

export interface KeltnerChannelData {
	upper: IndicatorData[];
	middle: IndicatorData[];
	lower: IndicatorData[];
}

export function calculateKeltnerChannels(
	data: OHLCV[],
	emaPeriod: number = 20,
	atrPeriod: number = 10,
	multiplier: number = 2,
): KeltnerChannelData {
	const ema = calculateEMA(data, emaPeriod);
	const atr = calculateATR(data, atrPeriod);
	if (ema.length === 0 || atr.length === 0) {
		return { upper: [], middle: [], lower: [] };
	}

	const emaByTime = new Map<number, number>(ema.map((point) => [point.time, point.value]));
	const upper: IndicatorData[] = [];
	const lower: IndicatorData[] = [];
	const middle: IndicatorData[] = [];

	for (const atrPoint of atr) {
		const mid = emaByTime.get(atrPoint.time);
		if (mid === undefined) continue;
		middle.push({ time: atrPoint.time, value: mid });
		upper.push({ time: atrPoint.time, value: mid + multiplier * atrPoint.value });
		lower.push({ time: atrPoint.time, value: mid - multiplier * atrPoint.value });
	}

	return { upper, middle, lower };
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

export function calculateVolumeProfile(data: OHLCV[], levels: number = 20): VolumeProfileLevel[] {
	if (data.length === 0) return [];

	const minPrice = Math.min(...data.map((d) => d.low));
	const maxPrice = Math.max(...data.map((d) => d.high));
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

export function calculateVWMA(data: OHLCV[], period: number = 20): IndicatorData[] {
	if (period <= 0 || data.length < period) return [];
	const result: IndicatorData[] = [];

	for (let i = period - 1; i < data.length; i++) {
		let weightedPriceSum = 0;
		let volumeSum = 0;
		for (let j = 0; j < period; j++) {
			const candle = data[i - j];
			weightedPriceSum += candle.close * candle.volume;
			volumeSum += candle.volume;
		}

		result.push({
			time: data[i].time,
			value: volumeSum > 0 ? weightedPriceSum / volumeSum : data[i].close,
		});
	}

	return result;
}

export interface SMAATRChannelData {
	time: number;
	middle: number;
	upper: number;
	lower: number;
}

export function calculateSMAATRChannel(
	data: OHLCV[],
	smaPeriod: number = 50,
	atrPeriod: number = 14,
	multiplier: number = 1.5,
): SMAATRChannelData[] {
	if (data.length === 0) return [];

	const smaSeries = calculateSMA(data, smaPeriod);
	const atrSeries = calculateATR(data, atrPeriod);
	if (smaSeries.length === 0 || atrSeries.length === 0) return [];

	const smaByTime = new Map<number, number>(smaSeries.map((point) => [point.time, point.value]));
	const atrByTime = new Map<number, number>(atrSeries.map((point) => [point.time, point.value]));
	const result: SMAATRChannelData[] = [];

	for (const candle of data) {
		const middle = smaByTime.get(candle.time);
		const atr = atrByTime.get(candle.time);
		if (middle === undefined || atr === undefined) continue;

		const width = atr * multiplier;
		result.push({
			time: candle.time,
			middle,
			upper: middle + width,
			lower: middle - width,
		});
	}

	return result;
}

// ============================================
// P1 Signals: Line / Power / Rhythm
// ============================================

export interface SMACrossEvent {
	time: number;
	type: "cross_up" | "cross_down";
	price: number;
	sma: number;
}

export interface SMACrossAlertTemplate {
	type: "cross_up" | "cross_down";
	title: string;
	message: string;
}

export function detectSMACrossEvents(data: OHLCV[], period: number = 50): SMACrossEvent[] {
	if (data.length < period + 1) return [];

	const sma = calculateSMA(data, period);
	const smaByTime = new Map<number, number>(sma.map((point) => [point.time, point.value]));
	const events: SMACrossEvent[] = [];

	for (let i = 1; i < data.length; i++) {
		const prev = data[i - 1];
		const curr = data[i];
		const prevSma = smaByTime.get(prev.time);
		const currSma = smaByTime.get(curr.time);
		if (prevSma === undefined || currSma === undefined) continue;

		const wasBelow = prev.close < prevSma;
		const wasAbove = prev.close > prevSma;
		const isNowAbove = curr.close >= currSma;
		const isNowBelow = curr.close <= currSma;

		if (wasBelow && isNowAbove) {
			events.push({
				time: curr.time,
				type: "cross_up",
				price: curr.close,
				sma: currSma,
			});
		} else if (wasAbove && isNowBelow) {
			events.push({
				time: curr.time,
				type: "cross_down",
				price: curr.close,
				sma: currSma,
			});
		}
	}

	return events;
}

export function getSMACrossAlertTemplates(
	symbol: string,
	period: number = 50,
): SMACrossAlertTemplate[] {
	return [
		{
			type: "cross_up",
			title: `${symbol} crossed above SMA${period}`,
			message: `Bullish cross: price moved above SMA${period}.`,
		},
		{
			type: "cross_down",
			title: `${symbol} crossed below SMA${period}`,
			message: `Bearish cross: price moved below SMA${period}.`,
		},
	];
}

export function calculateRVOL(data: OHLCV[], period: number = 20): IndicatorData[] {
	if (period <= 0 || data.length < period) return [];

	const result: IndicatorData[] = [];
	for (let i = period - 1; i < data.length; i++) {
		let avgVolume = 0;
		for (let j = 0; j < period; j++) {
			avgVolume += data[i - j].volume;
		}
		avgVolume /= period;

		result.push({
			time: data[i].time,
			value: avgVolume > 0 ? data[i].volume / avgVolume : 0,
		});
	}
	return result;
}

/**
 * @deprecated Python is the authoritative implementation. OBV is computed internally by
 * the composite-signal endpoint. This function will be removed in Phase 8 cleanup.
 */
export function calculateOBV(data: OHLCV[]): IndicatorData[] {
	if (data.length === 0) return [];

	const result: IndicatorData[] = [];
	let obv = 0;

	result.push({
		time: data[0].time,
		value: obv,
	});

	for (let i = 1; i < data.length; i++) {
		if (data[i].close > data[i - 1].close) {
			obv += data[i].volume;
		} else if (data[i].close < data[i - 1].close) {
			obv -= data[i].volume;
		}
		result.push({
			time: data[i].time,
			value: obv,
		});
	}

	return result;
}

/**
 * @deprecated Python is the authoritative implementation. CMF is computed internally by
 * the composite-signal endpoint. This function will be removed in Phase 8 cleanup.
 */
export function calculateCMF(data: OHLCV[], period: number = 20): IndicatorData[] {
	if (period <= 0 || data.length < period) return [];

	const mfv: number[] = data.map((candle) => {
		const range = candle.high - candle.low;
		if (range === 0) return 0;
		const mfm = (candle.close - candle.low - (candle.high - candle.close)) / range;
		return mfm * candle.volume;
	});

	const result: IndicatorData[] = [];
	for (let i = period - 1; i < data.length; i++) {
		let sumMfv = 0;
		let sumVol = 0;
		for (let j = 0; j < period; j++) {
			sumMfv += mfv[i - j];
			sumVol += data[i - j].volume;
		}

		result.push({
			time: data[i].time,
			value: sumVol > 0 ? sumMfv / sumVol : 0,
		});
	}

	return result;
}

export interface HeartbeatAnalysis {
	score: number;
	cycleBars: number | null;
	swings: number;
	amplitudeStability: number;
	periodStability: number;
}

function stdDev(values: number[]): number {
	if (values.length === 0) return 0;
	const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
	const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
	return Math.sqrt(variance);
}

export function analyzeHeartbeatPattern(
	data: OHLCV[],
	minMovePercent: number = 0.02,
): HeartbeatAnalysis {
	if (data.length < 10) {
		return {
			score: 0,
			cycleBars: null,
			swings: 0,
			amplitudeStability: 0,
			periodStability: 0,
		};
	}

	const pivots: Array<{ index: number; price: number }> = [{ index: 0, price: data[0].close }];
	let direction: "up" | "down" | null = null;
	let lastPivotPrice = data[0].close;

	for (let i = 1; i < data.length; i++) {
		const price = data[i].close;
		const move = (price - lastPivotPrice) / Math.max(Math.abs(lastPivotPrice), 1e-9);

		if (direction === null) {
			if (Math.abs(move) >= minMovePercent) {
				direction = move > 0 ? "up" : "down";
				pivots.push({ index: i, price });
				lastPivotPrice = price;
			}
			continue;
		}

		if (direction === "up") {
			if (price > lastPivotPrice) {
				pivots[pivots.length - 1] = { index: i, price };
				lastPivotPrice = price;
			} else if (
				(lastPivotPrice - price) / Math.max(Math.abs(lastPivotPrice), 1e-9) >=
				minMovePercent
			) {
				direction = "down";
				pivots.push({ index: i, price });
				lastPivotPrice = price;
			}
		} else {
			if (price < lastPivotPrice) {
				pivots[pivots.length - 1] = { index: i, price };
				lastPivotPrice = price;
			} else if (
				(price - lastPivotPrice) / Math.max(Math.abs(lastPivotPrice), 1e-9) >=
				minMovePercent
			) {
				direction = "up";
				pivots.push({ index: i, price });
				lastPivotPrice = price;
			}
		}
	}

	if (pivots.length < 4) {
		return {
			score: 0,
			cycleBars: null,
			swings: pivots.length,
			amplitudeStability: 0,
			periodStability: 0,
		};
	}

	const intervals: number[] = [];
	const amplitudes: number[] = [];
	for (let i = 1; i < pivots.length; i++) {
		intervals.push(pivots[i].index - pivots[i - 1].index);
		amplitudes.push(
			Math.abs(pivots[i].price - pivots[i - 1].price) /
				Math.max(Math.abs(pivots[i - 1].price), 1e-9),
		);
	}

	const meanInterval = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
	const meanAmplitude = amplitudes.reduce((sum, v) => sum + v, 0) / amplitudes.length;

	const intervalCv = meanInterval > 0 ? stdDev(intervals) / meanInterval : 1;
	const amplitudeCv = meanAmplitude > 0 ? stdDev(amplitudes) / meanAmplitude : 1;

	const periodStability = Math.max(0, 1 - intervalCv);
	const amplitudeStability = Math.max(0, 1 - amplitudeCv);
	const score = Math.max(0, Math.min(1, (periodStability + amplitudeStability) / 2));

	return {
		score,
		cycleBars: Number.isFinite(meanInterval) ? meanInterval : null,
		swings: pivots.length,
		amplitudeStability,
		periodStability,
	};
}

// ============================================
// Support/Resistance Levels
// ============================================

export interface SupportResistanceLevel {
	price: number;
	type: "support" | "resistance";
	strength: number;
	touches: number;
}

export function findSupportResistance(
	data: OHLCV[],
	lookback: number = 20,
	threshold: number = 0.02,
): SupportResistanceLevel[] {
	const levels: SupportResistanceLevel[] = [];

	for (let i = lookback; i < data.length - lookback; i++) {
		const slice = data.slice(i - lookback, i + lookback + 1);
		const high = data[i].high;
		const low = data[i].low;

		// Check for resistance (local high)
		const isResistance = slice.every((d) => d.high <= high * (1 + threshold));
		if (isResistance) {
			const existing = levels.find((l) => Math.abs(l.price - high) / high < threshold);
			if (existing) {
				existing.touches++;
				existing.strength++;
			} else {
				levels.push({
					price: high,
					type: "resistance",
					strength: 1,
					touches: 1,
				});
			}
		}

		// Check for support (local low)
		const isSupport = slice.every((d) => d.low >= low * (1 - threshold));
		if (isSupport) {
			const existing = levels.find((l) => Math.abs(l.price - low) / low < threshold);
			if (existing) {
				existing.touches++;
				existing.strength++;
			} else {
				levels.push({
					price: low,
					type: "support",
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
	calculateHMA,
	calculateADX,
	calculateIchimoku,
	calculateParabolicSAR,
	calculateKeltnerChannels,
	calculateVolumeProfile,
	calculateVWAP,
	calculateVWMA,
	calculateSMAATRChannel,
	findSupportResistance,
	detectSMACrossEvents,
	getSMACrossAlertTemplates,
	calculateRVOL,
	calculateOBV,
	calculateCMF,
	analyzeHeartbeatPattern,
};
