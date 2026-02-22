export type SidebarPanel = "watchlist" | "indicators" | "news" | "orders" | "portfolio";
export type WatchlistTab =
	| "all"
	| "favorites"
	| "crypto"
	| "stocks"
	| "forex"
	| "commodities"
	| "indices";
export type DataMode = "api" | "fallback";
export type LayoutMode = "single" | "2h" | "2v" | "4";

export interface SignalSnapshot {
	lineState: "above" | "below" | "neutral";
	sma50: number | null;
	lastCrossLabel: string;
	rvol: number | null;
	cmf: number | null;
	obv: number | null;
	heartbeatScore: number;
	heartbeatCycleBars: number | null;
	atr: number | null;
}
