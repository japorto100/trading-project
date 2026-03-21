import { afterEach, describe, expect, it, mock } from "bun:test";
import type { PortfolioSnapshot } from "@/lib/orders/portfolio";
import { listPortfolioSnapshots, savePortfolioSnapshot } from "./portfolio-history-store";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restore();
});

const snapshot: PortfolioSnapshot = {
	generatedAt: "2026-03-19T12:00:00.000Z",
	positions: [],
	metrics: {
		initialBalance: 100000,
		filledOrders: 0,
		openPositions: 0,
		realizedPnl: 0,
		unrealizedPnl: 0,
		totalPnl: 0,
		openExposure: 0,
		winRate: null,
		maxDrawdown: 0,
	},
	equityCurve: [],
};

describe("portfolio-history-store", () => {
	it("lists portfolio history through the go-owned endpoint", async () => {
		globalThis.fetch = mock(async (input) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/fusion/portfolio/history");
			expect(url).toContain("profileKey=paper-default");
			return new Response(
				JSON.stringify({
					success: true,
					entries: [
						{
							id: "ps_1",
							profileKey: "paper-default",
							generatedAt: snapshot.generatedAt,
							snapshot,
							createdAt: snapshot.generatedAt,
						},
					],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}) as typeof fetch;

		const entries = await listPortfolioSnapshots("paper-default", 5);
		expect(entries).toHaveLength(1);
		expect(entries[0]?.id).toBe("ps_1");
	});

	it("saves portfolio history through the go-owned endpoint", async () => {
		globalThis.fetch = mock(async (_input, init) => {
			expect(init?.method).toBe("POST");
			const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
			expect(body.profileKey).toBe("paper-default");
			return new Response(
				JSON.stringify({
					success: true,
					entry: {
						id: "ps_2",
						profileKey: "paper-default",
						generatedAt: snapshot.generatedAt,
						snapshot,
						createdAt: snapshot.generatedAt,
					},
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } },
			);
		}) as typeof fetch;

		const entry = await savePortfolioSnapshot("paper-default", snapshot);
		expect(entry.id).toBe("ps_2");
	});
});
