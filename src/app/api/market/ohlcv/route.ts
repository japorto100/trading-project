import { type NextRequest, NextResponse } from "next/server";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { getProviderManager } from "@/lib/providers";
import type { OHLCVData, TimeframeValue } from "@/lib/providers/types";

function toInt(input: string | null): number | null {
	if (!input) return null;
	const parsed = Number.parseInt(input, 10);
	return Number.isFinite(parsed) ? parsed : null;
}

function filterByRange(data: OHLCVData[], start: number | null, end: number | null): OHLCVData[] {
	if (!start && !end) return data;
	return data.filter((row) => {
		if (start !== null && row.time < start) return false;
		if (end !== null && row.time > end) return false;
		return true;
	});
}

async function fetchWithHistoricalPriority(
	symbol: string,
	timeframe: TimeframeValue,
	limit: number,
	start: number | null,
	end: number | null,
): Promise<{ data: OHLCVData[]; provider: string }> {
	const manager = getProviderManager();
	const preferredProviders = ["yahoo", "yfinance", "fmp", "eodhd", "demo"];

	for (const providerName of preferredProviders) {
		const provider = manager.getProvider(providerName);
		if (!provider) continue;
		try {
			const rows = await provider.fetchOHLCV(symbol, timeframe, limit, {
				start: start ?? undefined,
				end: end ?? undefined,
			});
			const filtered = filterByRange(rows, start, end);
			if (filtered.length > 0) {
				return { data: filtered, provider: providerName };
			}
		} catch {
			// ignore and continue with next provider
		}
	}

	const fallback = await manager.fetchOHLCV(symbol, timeframe, limit, {
		start: start ?? undefined,
		end: end ?? undefined,
	});
	return {
		data: filterByRange(fallback.data, start, end),
		provider: fallback.provider,
	};
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const rawSymbol = searchParams.get("symbol");
		const timeframe = (searchParams.get("timeframe") || "1H") as TimeframeValue;
		const rawLimit = toInt(searchParams.get("limit"));
		const limit = Math.max(10, Math.min(rawLimit ?? 300, 100000));
		const start = toInt(searchParams.get("start"));
		const end = toInt(searchParams.get("end"));

		if (!rawSymbol) {
			return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 });
		}
		if (start !== null && end !== null && start >= end) {
			return NextResponse.json(
				{ error: "Invalid time range: start must be less than end" },
				{ status: 400 },
			);
		}
		const symbol = canonicalizeFusionSymbol(rawSymbol);

		const hasExplicitRange = Boolean(start || end);
		const prefersLongHistory =
			hasExplicitRange && (timeframe === "1D" || timeframe === "1W" || timeframe === "1M");
		const manager = getProviderManager();
		const result = prefersLongHistory
			? await fetchWithHistoricalPriority(symbol, timeframe, limit, start, end)
			: await manager.fetchOHLCV(symbol, timeframe, limit, {
					start: start ?? undefined,
					end: end ?? undefined,
				});
		const data = prefersLongHistory ? result.data : filterByRange(result.data, start, end);
		const provider = result.provider;

		return NextResponse.json({
			success: true,
			symbol,
			timeframe,
			provider,
			limit,
			start,
			end,
			count: data.length,
			data,
		});
	} catch (error: unknown) {
		console.error("OHLCV API Error:", error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Failed to fetch OHLCV data" },
			{ status: 500 },
		);
	}
}
