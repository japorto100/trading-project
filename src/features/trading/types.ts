export type SidebarPanel =
	| "watchlist"
	| "indicators"
	| "news"
	| "orders"
	| "portfolio"
	| "strategy";
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

export interface CompositeSignalInsights {
	signal: "buy" | "sell" | "neutral";
	confidence: number;
	heartbeatScore: number | null;
	sma50SlopeScore: number | null;
	sma50SlopeEngine: string | null;
	volumePowerScore: number | null;
	timestamp: number;
}

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
