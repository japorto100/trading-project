import { type NextRequest, NextResponse } from "next/server";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { getProviderManager } from "@/lib/providers";
import type { QuoteData } from "@/lib/providers/types";
import {
	evaluateTriggeredOrdersForSymbol,
	evaluateTriggeredOrdersForSymbols,
} from "@/lib/server/orders-store";
import { getErrorMessage } from "@/lib/utils";

export async function GET(request: NextRequest) {
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
			const quotes = await manager.getQuotes(symbolList);

			const results: Record<string, QuoteData> = {};
			const symbolPrices: Record<string, number> = {};
			quotes.forEach((quote, sym) => {
				results[sym] = quote;
				const price = Number(quote.price);
				if (Number.isFinite(price) && price > 0) {
					symbolPrices[sym] = price;
				}
			});

			const executionBatches = await evaluateTriggeredOrdersForSymbols(symbolPrices);
			const executionSummary: Record<string, number> = {};
			for (const [sym, executed] of Object.entries(executionBatches)) {
				if (executed.length > 0) {
					executionSummary[sym] = executed.length;
				}
			}

			return NextResponse.json({
				success: true,
				count: quotes.size,
				quotes: results,
				executions: executionSummary,
			});
		}

		// Single quote
		if (!symbol) {
			return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 });
		}

		const canonicalSymbol = canonicalizeFusionSymbol(symbol);
		const { data, provider } = await manager.getQuote(canonicalSymbol);
		const executed = await evaluateTriggeredOrdersForSymbol(canonicalSymbol, data.price);

		return NextResponse.json({
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
		});
	} catch (error: unknown) {
		console.error("Quote API Error:", error);
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}
