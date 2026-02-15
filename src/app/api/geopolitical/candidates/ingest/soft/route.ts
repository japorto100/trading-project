import { NextResponse } from "next/server";
import { SOFT_SIGNAL_ADAPTERS } from "@/lib/geopolitical/adapters/soft-signals";
import { shouldPromoteCandidate } from "@/lib/geopolitical/anti-noise";
import {
	GeopoliticalIngestionBudget,
	getGeopoliticalIngestionBudgetConfig,
} from "@/lib/geopolitical/ingestion-budget";
import type { GeoCandidate } from "@/lib/geopolitical/types";
import { createGeoCandidate } from "@/lib/server/geopolitical-candidates-store";

export const runtime = "nodejs";

export async function POST() {
	const budget = new GeopoliticalIngestionBudget(getGeopoliticalIngestionBudgetConfig());
	const created: GeoCandidate[] = [];

	const adapterResults = await Promise.all(
		SOFT_SIGNAL_ADAPTERS.map(async (adapter) => {
			if (!budget.reserveProviderCall(adapter.id)) {
				return {
					id: adapter.id,
					ok: false,
					message: "provider-call budget exhausted",
					produced: 0,
					promoted: 0,
					created: 0,
				};
			}

			try {
				const candidates = await adapter.run();
				const promoted = candidates.filter((candidate) => shouldPromoteCandidate(candidate));
				const allowedCount = budget.reserveCandidates(promoted.length);
				const allowed = promoted.slice(0, allowedCount);

				let createdCount = 0;
				for (const candidate of allowed) {
					const upserted = await createGeoCandidate(candidate);
					if (!upserted.deduped) {
						createdCount += 1;
					}
					created.push(upserted.candidate);
				}

				return {
					id: adapter.id,
					ok: true,
					produced: candidates.length,
					promoted: promoted.length,
					created: createdCount,
					message: allowedCount < promoted.length ? "candidate budget exhausted" : undefined,
				};
			} catch (error) {
				return {
					id: adapter.id,
					ok: false,
					message: error instanceof Error ? error.message : "adapter execution failed",
					produced: 0,
					promoted: 0,
					created: 0,
				};
			}
		}),
	);

	return NextResponse.json({
		success: true,
		adapters: adapterResults,
		createdCount: created.length,
		candidates: created,
		budget: budget.snapshot(),
	});
}
