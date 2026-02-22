import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { canonicalizeFusionSymbol, resolveFusionSymbol } from "@/lib/fusion-symbols";
import { getProviderManager } from "@/lib/providers";
import type { QuoteData } from "@/lib/providers/types";
import {
	evaluateTriggeredOrdersForSymbol,
	evaluateTriggeredOrdersForSymbols,
} from "@/lib/server/orders-store";
import { getErrorMessage } from "@/lib/utils";

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

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function inferGoQuoteRoute(
	symbol: string,
): { symbol: string; exchange: string; assetType: string } | null {
	const resolved = resolveFusionSymbol(symbol);
	if (!resolved) return null;

	switch (resolved.type) {
		case "stock":
			return { symbol: resolved.symbol, exchange: "finnhub", assetType: "equity" };
		case "fx":
			return { symbol: resolved.symbol, exchange: "ecb", assetType: "forex" };
		case "crypto": {
			// GCT/Binance typically quotes majors in USDT. Keep UI symbol stable, translate only upstream request.
			const upstreamSymbol = resolved.symbol.endsWith("/USD")
				? `${resolved.symbol.slice(0, -4)}/USDT`
				: resolved.symbol;
			return { symbol: upstreamSymbol, exchange: "binance", assetType: "spot" };
		}
		default:
			return null;
	}
}

async function fetchQuoteViaGateway(
	symbol: string,
	requestId: string,
): Promise<{ provider: string; data: QuoteData } | null> {
	const route = inferGoQuoteRoute(symbol);
	if (!route) return null;

	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const endpoint = new URL("/api/v1/quote", gatewayBaseURL);
	endpoint.searchParams.set("symbol", route.symbol);
	endpoint.searchParams.set("exchange", route.exchange);
	endpoint.searchParams.set("assetType", route.assetType);

	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers: {
			Accept: "application/json",
			"X-Request-ID": requestId,
		},
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

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const searchParams = request.nextUrl.searchParams;
		const symbol = searchParams.get("symbol");
		const symbols = searchParams.get("symbols");

		const manager = getProviderManager();

		// Multiple quotes
		if (symbols) {
			const symbolList = symbols
				.split(",")
				.map((s) => canonicalizeFusionSymbol(s.trim()))
				.filter(Boolean);
			const results: Record<string, QuoteData> = {};
			const symbolPrices: Record<string, number> = {};
			await Promise.all(
				symbolList.map(async (sym) => {
					const gatewayQuote = await fetchQuoteViaGateway(sym, requestId);
					const resolved = gatewayQuote ?? (await manager.getQuote(sym));
					results[sym] = resolved.data;
					const price = Number(resolved.data.price);
					if (Number.isFinite(price) && price > 0) {
						symbolPrices[sym] = price;
					}
				}),
			);

			const executionBatches = await evaluateTriggeredOrdersForSymbols(symbolPrices);
			const executionSummary: Record<string, number> = {};
			for (const [sym, executed] of Object.entries(executionBatches)) {
				if (executed.length > 0) {
					executionSummary[sym] = executed.length;
				}
			}

			return withRequestIdHeader(
				NextResponse.json({
					success: true,
					count: Object.keys(results).length,
					quotes: results,
					executions: executionSummary,
				}),
				requestId,
			);
		}

		// Single quote
		if (!symbol) {
			return withRequestIdHeader(
				NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 }),
				requestId,
			);
		}

		const canonicalSymbol = canonicalizeFusionSymbol(symbol);
		const gatewayQuote = await fetchQuoteViaGateway(canonicalSymbol, requestId);
		const { data, provider } = gatewayQuote ?? (await manager.getQuote(canonicalSymbol));
		const executed = await evaluateTriggeredOrdersForSymbol(canonicalSymbol, data.price);

		return withRequestIdHeader(
			NextResponse.json({
				success: true,
				symbol: canonicalSymbol,
				provider,
				quote: data,
				executionsCount: executed.length,
				executions: executed.map((order) => ({
					id: order.id,
					symbol: order.symbol,
					side: order.side,
					filledPrice: order.filledPrice,
				})),
			}),
			requestId,
		);
	} catch (error: unknown) {
		console.error("Quote API Error:", error);
		return withRequestIdHeader(
			NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }),
			requestId,
		);
	}
}
