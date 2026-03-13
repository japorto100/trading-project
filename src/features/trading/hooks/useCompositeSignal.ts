"use client";

import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import type { OHLCVData } from "@/lib/providers/types";
import type { CompositeSignalInsights, CompositeSignalRouteResponse } from "../types";
import { componentScore } from "../utils";

type OhlcvPoint = Pick<OHLCVData, "time" | "open" | "high" | "low" | "close" | "volume">;

async function fetchCompositeSignal(ohlcv: OhlcvPoint[]): Promise<CompositeSignalInsights> {
	const response = await fetch("/api/fusion/strategy/composite", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ohlcv }),
	});
	const body = (await response.json()) as CompositeSignalRouteResponse;
	if (!response.ok || body.success !== true || !body.data) {
		throw new Error(body.error ?? `Composite request failed (${response.status})`);
	}
	const { data } = body;
	if (
		(data.signal !== "buy" && data.signal !== "sell" && data.signal !== "neutral") ||
		typeof data.confidence !== "number" ||
		typeof data.timestamp !== "number"
	) {
		throw new Error("Composite response shape invalid");
	}
	const smaDetails = data.components?.sma50_slope?.details;
	return {
		signal: data.signal,
		confidence: Math.max(0, Math.min(1, data.confidence)),
		heartbeatScore: componentScore(data.components, "heartbeat"),
		sma50SlopeScore: componentScore(data.components, "sma50_slope"),
		sma50SlopeEngine:
			smaDetails && typeof smaDetails.engine === "string" ? smaDetails.engine : null,
		volumePowerScore: componentScore(data.components, "volume_power"),
		timestamp: data.timestamp,
	};
}

export function useCompositeSignal(candleData: OHLCVData[]): CompositeSignalInsights | null {
	// Fingerprint: last timestamp + length — avoids deep comparison on every render
	const rawFingerprint =
		candleData.length >= 20
			? `${candleData.length}:${candleData[candleData.length - 1]?.time ?? 0}`
			: null;

	// Debounce to avoid firing on every streaming candle update
	const [fingerprint] = useDebouncedValue(rawFingerprint, { wait: 300 });

	const ohlcv: OhlcvPoint[] = candleData
		.slice(-Math.min(240, candleData.length))
		.map(({ time, open, high, low, close, volume }) => ({ time, open, high, low, close, volume }));

	const query = useQuery({
		queryKey: ["market", "composite-signal", fingerprint],
		queryFn: () => fetchCompositeSignal(ohlcv),
		enabled: fingerprint !== null,
		staleTime: 30_000,
		gcTime: 2 * 60_000,
	});

	return query.data ?? null;
}
