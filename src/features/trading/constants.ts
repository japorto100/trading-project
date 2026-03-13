import type { IndicatorSettings } from "@/components/IndicatorPanel";

export const DEFAULT_INDICATORS: IndicatorSettings = {
	sma: { enabled: false, period: 20 },
	ema: { enabled: false, period: 20 },
	rsi: { enabled: false, period: 14 },
	macd: { enabled: false },
	bollinger: { enabled: false, period: 20, stdDev: 2 },
	vwap: { enabled: false },
	vwma: { enabled: false, period: 20 },
	atr: { enabled: false, period: 14 },
	atrChannel: { enabled: false, smaPeriod: 50, atrPeriod: 14, multiplier: 1.5 },
	hma: { enabled: false, period: 20 },
	adx: { enabled: false, period: 14 },
	ichimoku: {
		enabled: false,
		tenkanPeriod: 9,
		kijunPeriod: 26,
		senkouBPeriod: 52,
		displacement: 26,
	},
	parabolicSar: { enabled: false, step: 0.02, maxAF: 0.2 },
	keltner: { enabled: false, emaPeriod: 20, atrPeriod: 10, multiplier: 2 },
	volumeProfile: { enabled: false, levels: 20, topN: 6 },
	supportResistance: { enabled: false, lookback: 20, threshold: 0.02, topN: 6 },
};
