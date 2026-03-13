"use client";

import { useQuery } from "@tanstack/react-query";
import { generateDemoCandles } from "@/lib/demoData";
import type { FusionSymbol } from "@/lib/fusion-symbols";
import type { OHLCVData } from "@/lib/providers/types";

async function fetchDailyOhlcv(symbol: FusionSymbol): Promise<OHLCVData[]> {
	const params = new URLSearchParams({ symbol: symbol.symbol, timeframe: "1D", limit: "240" });
	const response = await fetch(`/api/market/ohlcv?${params.toString()}`, { cache: "no-store" });
	if (!response.ok) throw new Error(`Daily OHLCV request failed (${response.status})`);
	const payload = (await response.json()) as { data?: OHLCVData[] };
	const rows = Array.isArray(payload.data) ? payload.data : [];
	if (rows.length === 0) throw new Error("Daily OHLCV returned empty data");
	return [...rows].sort((a, b) => a.time - b.time);
}

export function useDailySignalData(symbol: FusionSymbol): OHLCVData[] {
	const query = useQuery({
		queryKey: ["market", "ohlcv-daily", symbol.symbol],
		queryFn: () => fetchDailyOhlcv(symbol),
		retry: false,
		staleTime: 5 * 60_000,
		gcTime: 15 * 60_000,
	});

	if (query.isError || !query.data) {
		return generateDemoCandles(symbol, "1D", 240) as OHLCVData[];
	}
	return query.data;
}
