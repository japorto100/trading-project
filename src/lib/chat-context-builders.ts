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
 * FC3: Build context string for /geopolitical-map page.
 * Format: "Context: GeoMap · global · 12 active events · Focus: Syria crisis"
 */
export function buildGeoContext(
	region = "global",
	activeEventCount?: number,
	focusEventTitle?: string,
): string {
	const parts: (string | null | undefined)[] = [
		"Context: GeoMap",
		region,
		activeEventCount != null ? `${activeEventCount} active events` : null,
		focusEventTitle ? `Focus: ${focusEventTitle}` : null,
	];
	return parts.filter(Boolean).join(" · ");
}

/**
 * FC4: Build context string for /research page.
 * Format: "Context: Research · Bull · 78% confidence"
 */
export function buildResearchContext(
	regime?: string,
	confidence?: number,
	degraded?: boolean,
): string {
	const parts: (string | null | undefined)[] = [
		"Context: Research",
		regime ?? null,
		confidence != null ? `${confidence.toFixed(0)}% confidence` : null,
		degraded ? "degraded" : null,
	];
	return parts.filter(Boolean).join(" · ");
}

/**
 * FC5: Build context string for /calendar page.
 * Format: "Context: Calendar · 24 events · impact:high"
 */
export function buildCalendarContext(
	totalEvents?: number,
	activeFilter?: string,
	focusEventTitle?: string,
): string {
	const parts: (string | null | undefined)[] = [
		"Context: Calendar",
		totalEvents != null ? `${totalEvents} events` : null,
		activeFilter && activeFilter !== "all" ? `impact:${activeFilter}` : null,
		focusEventTitle ? `Focus: ${focusEventTitle}` : null,
	];
	return parts.filter(Boolean).join(" · ");
}

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
