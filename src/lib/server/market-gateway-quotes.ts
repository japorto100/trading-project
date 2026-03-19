import { resolveFusionSymbol } from "@/lib/fusion-symbols";
import type { QuoteData } from "@/lib/providers/types";
import { getGatewayBaseURL } from "@/lib/server/gateway";

interface GatewayQuoteContract {
	success: boolean;
	error?: string;
	data?: {
		symbol: string;
		exchange: string;
		assetType: string;
		last: number;
		bid: number;
		ask: number;
		high: number;
		low: number;
		volume: number;
		timestamp: number;
		source: string;
	};
}

export type GatewayQuoteFailureReason =
	| "UNRESOLVED_SYMBOL"
	| "DOWNSTREAM_UNAVAILABLE"
	| "GATEWAY_REJECTED";

export type GatewayQuoteResult =
	| {
			ok: true;
			provider: string;
			data: QuoteData;
	  }
	| {
			ok: false;
			reason: GatewayQuoteFailureReason;
			message: string;
	  };

function inferGoQuoteRoute(
	symbol: string,
): { symbol: string; exchange: string; assetType: string } | null {
	const resolved = resolveFusionSymbol(symbol);
	if (!resolved) return null;

	switch (resolved.type) {
		case "stock":
			return { symbol: resolved.symbol, exchange: "auto", assetType: "equity" };
		case "fx":
			return { symbol: resolved.symbol, exchange: "auto", assetType: "forex" };
		case "crypto": {
			// Keep UI symbol stable; only translate the upstream quote pair.
			const upstreamSymbol = resolved.symbol.endsWith("/USD")
				? `${resolved.symbol.slice(0, -4)}/USDT`
				: resolved.symbol;
			return { symbol: upstreamSymbol, exchange: "auto", assetType: "spot" };
		}
		default:
			return null;
	}
}

function inferFinanceBridgeFallback(symbol: string): { symbol: string; assetType: string } | null {
	const resolved = resolveFusionSymbol(symbol);
	if (!resolved) {
		const trimmed = symbol.trim();
		if (!trimmed) return null;
		return { symbol: trimmed, assetType: "unknown" };
	}

	switch (resolved.type) {
		case "index":
		case "commodity":
			return { symbol: resolved.symbol, assetType: resolved.type };
		default:
			return { symbol: resolved.symbol, assetType: resolved.type };
	}
}

async function fetchQuoteFromEndpoint(
	endpoint: URL,
	symbol: string,
	requestId: string,
	userRole?: string,
	providerCredentialsHeader?: string,
): Promise<GatewayQuoteResult> {
	const headers: Record<string, string> = {
		Accept: "application/json",
		"X-Request-ID": requestId,
	};
	if (userRole) {
		headers["X-User-Role"] = userRole;
	}
	if (providerCredentialsHeader) {
		headers["X-Tradeview-Provider-Credentials"] = providerCredentialsHeader;
	}

	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers,
		cache: "no-store",
	});
	if (!response.ok) {
		return {
			ok: false,
			reason: "DOWNSTREAM_UNAVAILABLE",
			message:
				response.status >= 500
					? "Gateway quote endpoint is unavailable"
					: `Gateway quote endpoint rejected with status ${response.status}`,
		};
	}

	const payload = (await response.json()) as GatewayQuoteContract;
	if (!payload.success || !payload.data) {
		return {
			ok: false,
			reason: "GATEWAY_REJECTED",
			message: payload.error?.trim() || "Gateway rejected quote request",
		};
	}

	const quote: QuoteData = {
		symbol,
		price: Number(payload.data.last) || 0,
		change: 0,
		changePercent: 0,
		high: Number(payload.data.high) || Number(payload.data.last) || 0,
		low: Number(payload.data.low) || Number(payload.data.last) || 0,
		open: Number(payload.data.last) || 0,
		volume: Number(payload.data.volume) || 0,
		timestamp: Number(payload.data.timestamp) || Math.floor(Date.now() / 1000),
	};

	return {
		ok: true,
		provider: payload.data.source || payload.data.exchange || "go-gateway",
		data: quote,
	};
}

export async function fetchQuoteViaGateway(
	symbol: string,
	requestId: string,
	userRole?: string,
	providerCredentialsHeader?: string,
): Promise<GatewayQuoteResult> {
	const gatewayBaseURL = getGatewayBaseURL();
	const route = inferGoQuoteRoute(symbol);
	if (route) {
		const endpoint = new URL("/api/v1/quote", gatewayBaseURL);
		endpoint.searchParams.set("symbol", route.symbol);
		endpoint.searchParams.set("exchange", route.exchange);
		endpoint.searchParams.set("assetType", route.assetType);
		return fetchQuoteFromEndpoint(endpoint, symbol, requestId, userRole, providerCredentialsHeader);
	}

	const fallback = inferFinanceBridgeFallback(symbol);
	if (!fallback) {
		return {
			ok: false,
			reason: "UNRESOLVED_SYMBOL",
			message: `No gateway route for symbol '${symbol}'`,
		};
	}

	const endpoint = new URL("/api/v1/quote/fallback", gatewayBaseURL);
	endpoint.searchParams.set("symbol", fallback.symbol);
	endpoint.searchParams.set("assetType", fallback.assetType);
	return fetchQuoteFromEndpoint(endpoint, symbol, requestId, userRole, providerCredentialsHeader);
}
