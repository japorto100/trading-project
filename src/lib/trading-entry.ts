import type { SidebarPanel } from "@/features/trading/types";

interface TradingWorkspaceHrefOptions {
	focus?: SidebarPanel;
	origin?: "notification" | "calendar" | "research" | "direct";
}

export function buildTradingWorkspaceHref(options: TradingWorkspaceHrefOptions = {}): string {
	const params = new URLSearchParams();
	if (options.focus) {
		params.set("focus", options.focus);
	}
	if (options.origin) {
		params.set("origin", options.origin);
	}

	const query = params.toString();
	return query.length > 0 ? `/trading?${query}` : "/trading";
}

export function parseTradingWorkspaceFocus(value: string | null): SidebarPanel | null {
	switch (value) {
		case "watchlist":
		case "indicators":
		case "news":
		case "orders":
		case "portfolio":
		case "macro":
		case "strategy":
		case "orderbook":
			return value;
		default:
			return null;
	}
}
