import { resolveFusionSymbol } from "@/lib/fusion-symbols";
import type { QuoteData } from "@/lib/providers/types";

const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

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
): Promise<{ provider: string; data: QuoteData } | null> {
	const headers: Record<string, string> = {
		Accept: "application/json",
		"X-Request-ID": requestId,
	};
	if (userRole) {
		headers["X-User-Role"] = userRole;
	}

	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers,
		cache: "no-store",
	});
	if (!response.ok) return null;

	const payload = (await response.json()) as GatewayQuoteContract;
	if (!payload.success || !payload.data) return null;

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
		provider: payload.data.source || payload.data.exchange || "go-gateway",
		data: quote,
	};
}

export async function fetchQuoteViaGateway(
	symbol: string,
	requestId: string,
	userRole?: string,
): Promise<{ provider: string; data: QuoteData } | null> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const route = inferGoQuoteRoute(symbol);
	if (route) {
		const endpoint = new URL("/api/v1/quote", gatewayBaseURL);
		endpoint.searchParams.set("symbol", route.symbol);
		endpoint.searchParams.set("exchange", route.exchange);
		endpoint.searchParams.set("assetType", route.assetType);
		return fetchQuoteFromEndpoint(endpoint, symbol, requestId, userRole);
	}

	const fallback = inferFinanceBridgeFallback(symbol);
	if (!fallback) return null;

	const endpoint = new URL("/api/v1/quote/fallback", gatewayBaseURL);
	endpoint.searchParams.set("symbol", fallback.symbol);
	endpoint.searchParams.set("assetType", fallback.assetType);
	return fetchQuoteFromEndpoint(endpoint, symbol, requestId, userRole);
}
