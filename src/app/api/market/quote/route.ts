import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import type { QuoteData } from "@/lib/providers/types";
import { fetchQuoteViaGateway } from "@/lib/server/market-gateway-quotes";
import {
	evaluateTriggeredOrdersForSymbol,
	evaluateTriggeredOrdersForSymbols,
} from "@/lib/server/orders-store";
import { getErrorMessage } from "@/lib/utils";

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	try {
		const searchParams = request.nextUrl.searchParams;
		const symbol = searchParams.get("symbol");
		const symbols = searchParams.get("symbols");

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
					const gatewayQuote = await fetchQuoteViaGateway(sym, requestId, userRole);
					if (!gatewayQuote) {
						return;
					}
					results[sym] = gatewayQuote.data;
					const price = Number(gatewayQuote.data.price);
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
		const gatewayQuote = await fetchQuoteViaGateway(canonicalSymbol, requestId, userRole);
		if (!gatewayQuote) {
			return withRequestIdHeader(
				NextResponse.json({ error: "Gateway quote request failed" }, { status: 502 }),
				requestId,
			);
		}
		const { data, provider } = gatewayQuote;
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
