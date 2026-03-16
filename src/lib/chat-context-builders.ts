// FC13: Chat context string builders — pure functions, no hooks, no state
// Used by pages to build context strings for openChat(ctx) / setChatContext(ctx)

import type { FusionSymbol } from "@/lib/fusion-symbols";
import type { TimeframeValue } from "@/lib/providers/types";

interface TradingStats {
	lastPrice: number;
	percent: number;
}

type LineState = "above" | "below" | "neutral";

/**
 * FC2: Build context string for /trading page.
 * Format: "Context: BTC/USD · 1H · $95,420 · +2.3% · Trend: above SMA50"
 */
export function buildTradingContext(
	symbol: FusionSymbol,
	timeframe: TimeframeValue,
	stats: TradingStats,
	lineState?: LineState,
): string {
	const price =
		stats.lastPrice > 0
			? `$${stats.lastPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
			: null;
	const pct = `${stats.percent >= 0 ? "+" : ""}${stats.percent.toFixed(2)}%`;
	const trend = lineState
		? `Trend: ${lineState === "above" ? "above" : lineState === "below" ? "below" : "at"} SMA50`
		: null;

	return [`Context: ${symbol.symbol}`, timeframe, price, pct, trend].filter(Boolean).join(" · ");
}
