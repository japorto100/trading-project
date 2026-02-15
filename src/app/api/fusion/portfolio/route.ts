import { type NextRequest, NextResponse } from "next/server";
import { buildPortfolioSnapshot } from "@/lib/orders/portfolio";
import { getProviderManager } from "@/lib/providers";
import { listPaperOrders } from "@/lib/server/orders-store";
import { getErrorMessage } from "@/lib/utils";

export async function GET(request: NextRequest) {
	try {
		const profileKey = request.nextUrl.searchParams.get("profileKey");
		if (!profileKey) {
			return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
		}

		const orders = await listPaperOrders(profileKey);
		const filledSymbols = Array.from(
			new Set(orders.filter((order) => order.status === "filled").map((order) => order.symbol)),
		);

		const prices: Record<string, number> = {};
		if (filledSymbols.length > 0) {
			try {
				const quotes = await getProviderManager().getQuotes(filledSymbols);
				for (const [symbol, quote] of quotes.entries()) {
					const price = Number(quote.price);
					if (Number.isFinite(price) && price > 0) {
						prices[symbol] = price;
					}
				}
			} catch {
				// Degrade gracefully: snapshot still useful with realized PnL only.
			}
		}

		const snapshot = buildPortfolioSnapshot(orders, prices);
		return NextResponse.json({ success: true, snapshot, prices });
	} catch (error) {
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}
