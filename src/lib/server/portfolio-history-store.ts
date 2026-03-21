import type { PortfolioSnapshot } from "@/lib/orders/portfolio";
import { getGatewayBaseURL } from "@/lib/server/gateway";

export interface PortfolioSnapshotEntry {
	id: string;
	profileKey: string;
	generatedAt: string;
	snapshot: PortfolioSnapshot;
	createdAt: string;
}

interface PortfolioHistoryPayload {
	success?: boolean;
	entry?: PortfolioSnapshotEntry;
	entries?: PortfolioSnapshotEntry[];
	error?: string;
}

function portfolioHistoryURL(): string {
	return new URL("/api/v1/fusion/portfolio/history", getGatewayBaseURL()).toString();
}

async function readPayload(response: Response): Promise<PortfolioHistoryPayload> {
	return (await response.json().catch(() => ({}))) as PortfolioHistoryPayload;
}

export async function listPortfolioSnapshots(
	profileKey: string,
	limit = 100,
): Promise<PortfolioSnapshotEntry[]> {
	const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 500) : 100;
	const url = new URL(portfolioHistoryURL());
	url.searchParams.set("profileKey", profileKey);
	url.searchParams.set("limit", String(safeLimit));
	const response = await fetch(url.toString(), {
		method: "GET",
		cache: "no-store",
		headers: { Accept: "application/json" },
	});
	const payload = await readPayload(response);
	if (!response.ok) {
		throw new Error(payload.error || "portfolio history list failed");
	}
	return Array.isArray(payload.entries) ? payload.entries : [];
}

export async function savePortfolioSnapshot(
	profileKey: string,
	snapshot: PortfolioSnapshot,
): Promise<PortfolioSnapshotEntry> {
	const response = await fetch(portfolioHistoryURL(), {
		method: "POST",
		cache: "no-store",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			profileKey,
			generatedAt: snapshot.generatedAt,
			snapshot,
		}),
	});
	const payload = await readPayload(response);
	if (!response.ok || !payload.entry) {
		throw new Error(payload.error || "portfolio history save failed");
	}
	return payload.entry;
}
