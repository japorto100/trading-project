import { buildPortfolioSnapshot, type PortfolioSnapshot } from "@/lib/orders/portfolio";
import { getProviderManager } from "@/lib/providers";
import { listPaperOrders } from "@/lib/server/orders-store";

export interface PortfolioSnapshotBuildResult {
	snapshot: PortfolioSnapshot;
	prices: Record<string, number>;
}

export async function buildPortfolioSnapshotForProfile(
	profileKey: string,
): Promise<PortfolioSnapshotBuildResult> {
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
			// Realized PnL still valid without live prices.
		}
	}

	return {
		snapshot: buildPortfolioSnapshot(orders, prices),
		prices,
	};
}
