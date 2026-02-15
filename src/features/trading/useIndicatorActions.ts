import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import type { IndicatorSettings } from "@/components/IndicatorPanel";

interface UseIndicatorActionsArgs {
	setIndicators: Dispatch<SetStateAction<IndicatorSettings>>;
}

export function useIndicatorActions({ setIndicators }: UseIndicatorActionsArgs) {
	const setCoreIndicatorEnabled = useCallback(
		(key: "sma" | "ema" | "rsi", enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				[key]: {
					...prev[key],
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setCoreIndicatorPeriod = useCallback(
		(key: "sma" | "ema" | "rsi", period: number) => {
			setIndicators((prev) => ({
				...prev,
				[key]: {
					...prev[key],
					period,
				},
			}));
		},
		[setIndicators],
	);

	const setMacdEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				macd: {
					...(prev.macd ?? { enabled: false }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setBollingerEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				bollinger: {
					...(prev.bollinger ?? { enabled: false, period: 20, stdDev: 2 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setBollingerPeriod = useCallback(
		(period: number) => {
			setIndicators((prev) => ({
				...prev,
				bollinger: {
					...(prev.bollinger ?? { enabled: false, period: 20, stdDev: 2 }),
					period,
				},
			}));
		},
		[setIndicators],
	);

	const setBollingerStdDev = useCallback(
		(stdDev: number) => {
			setIndicators((prev) => ({
				...prev,
				bollinger: {
					...(prev.bollinger ?? { enabled: false, period: 20, stdDev: 2 }),
					stdDev,
				},
			}));
		},
		[setIndicators],
	);

	const setVwapEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				vwap: {
					...(prev.vwap ?? { enabled: false }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setVwmaEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				vwma: {
					...(prev.vwma ?? { enabled: false, period: 20 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setVwmaPeriod = useCallback(
		(period: number) => {
			setIndicators((prev) => ({
				...prev,
				vwma: {
					...(prev.vwma ?? { enabled: false, period: 20 }),
					period,
				},
			}));
		},
		[setIndicators],
	);

	const setAtrEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				atr: {
					...(prev.atr ?? { enabled: false, period: 14 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setAtrPeriod = useCallback(
		(period: number) => {
			setIndicators((prev) => ({
				...prev,
				atr: {
					...(prev.atr ?? { enabled: false, period: 14 }),
					period,
				},
			}));
		},
		[setIndicators],
	);

	const setAtrChannelEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				atrChannel: {
					...(prev.atrChannel ?? {
						enabled: false,
						smaPeriod: 50,
						atrPeriod: 14,
						multiplier: 1.5,
					}),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setAtrChannelSmaPeriod = useCallback(
		(smaPeriod: number) => {
			setIndicators((prev) => ({
				...prev,
				atrChannel: {
					...(prev.atrChannel ?? {
						enabled: false,
						smaPeriod: 50,
						atrPeriod: 14,
						multiplier: 1.5,
					}),
					smaPeriod,
				},
			}));
		},
		[setIndicators],
	);

	const setAtrChannelAtrPeriod = useCallback(
		(atrPeriod: number) => {
			setIndicators((prev) => ({
				...prev,
				atrChannel: {
					...(prev.atrChannel ?? {
						enabled: false,
						smaPeriod: 50,
						atrPeriod: 14,
						multiplier: 1.5,
					}),
					atrPeriod,
				},
			}));
		},
		[setIndicators],
	);

	const setAtrChannelMultiplier = useCallback(
		(multiplier: number) => {
			setIndicators((prev) => ({
				...prev,
				atrChannel: {
					...(prev.atrChannel ?? {
						enabled: false,
						smaPeriod: 50,
						atrPeriod: 14,
						multiplier: 1.5,
					}),
					multiplier,
				},
			}));
		},
		[setIndicators],
	);

	const setHmaEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				hma: {
					...(prev.hma ?? { enabled: false, period: 20 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setHmaPeriod = useCallback(
		(period: number) => {
			setIndicators((prev) => ({
				...prev,
				hma: {
					...(prev.hma ?? { enabled: false, period: 20 }),
					period,
				},
			}));
		},
		[setIndicators],
	);

	const setAdxEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				adx: {
					...(prev.adx ?? { enabled: false, period: 14 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setAdxPeriod = useCallback(
		(period: number) => {
			setIndicators((prev) => ({
				...prev,
				adx: {
					...(prev.adx ?? { enabled: false, period: 14 }),
					period,
				},
			}));
		},
		[setIndicators],
	);

	const setIchimokuEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				ichimoku: {
					...(prev.ichimoku ?? {
						enabled: false,
						tenkanPeriod: 9,
						kijunPeriod: 26,
						senkouBPeriod: 52,
						displacement: 26,
					}),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setParabolicSarEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				parabolicSar: {
					...(prev.parabolicSar ?? { enabled: false, step: 0.02, maxAF: 0.2 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setKeltnerEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				keltner: {
					...(prev.keltner ?? { enabled: false, emaPeriod: 20, atrPeriod: 10, multiplier: 2 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setVolumeProfileEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				volumeProfile: {
					...(prev.volumeProfile ?? { enabled: false, levels: 20, topN: 6 }),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	const setSupportResistanceEnabled = useCallback(
		(enabled: boolean) => {
			setIndicators((prev) => ({
				...prev,
				supportResistance: {
					...(prev.supportResistance ?? {
						enabled: false,
						lookback: 20,
						threshold: 0.02,
						topN: 6,
					}),
					enabled,
				},
			}));
		},
		[setIndicators],
	);

	return {
		setCoreIndicatorEnabled,
		setCoreIndicatorPeriod,
		setMacdEnabled,
		setBollingerEnabled,
		setBollingerPeriod,
		setBollingerStdDev,
		setVwapEnabled,
		setVwmaEnabled,
		setVwmaPeriod,
		setAtrEnabled,
		setAtrPeriod,
		setAtrChannelEnabled,
		setAtrChannelSmaPeriod,
		setAtrChannelAtrPeriod,
		setAtrChannelMultiplier,
		setHmaEnabled,
		setHmaPeriod,
		setAdxEnabled,
		setAdxPeriod,
		setIchimokuEnabled,
		setParabolicSarEnabled,
		setKeltnerEnabled,
		setVolumeProfileEnabled,
		setSupportResistanceEnabled,
	};
}
