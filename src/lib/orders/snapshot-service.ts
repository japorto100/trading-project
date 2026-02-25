import { randomUUID } from "node:crypto";
import { buildPortfolioSnapshot, type PortfolioSnapshot } from "@/lib/orders/portfolio";
import { fetchQuoteViaGateway } from "@/lib/server/market-gateway-quotes";
import { listPaperOrders } from "@/lib/server/orders-store";

export interface PortfolioSnapshotBuildResult {
	snapshot: PortfolioSnapshot;
	prices: Record<string, number>;
}

export async function buildPortfolioSnapshotForProfile(
	profileKey: string,
	options?: { requestId?: string },
): Promise<PortfolioSnapshotBuildResult> {
	const orders = await listPaperOrders(profileKey);
	const filledSymbols = Array.from(
		new Set(orders.filter((order) => order.status === "filled").map((order) => order.symbol)),
	);

	const prices: Record<string, number> = {};
	if (filledSymbols.length > 0) {
		try {
			const requestId = options?.requestId?.trim() || randomUUID();
			const gatewayResults = await Promise.all(
				filledSymbols.map(async (symbol) => ({
					symbol,
					result: await fetchQuoteViaGateway(symbol, requestId),
				})),
			);

			for (const entry of gatewayResults) {
				const quote = entry.result?.data;
				if (!quote) {
					continue;
				}
				const price = Number(quote.price);
				if (Number.isFinite(price) && price > 0) {
					prices[entry.symbol] = price;
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
