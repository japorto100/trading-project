import { NextResponse } from "next/server";
import { runHardSignalAdapters } from "@/lib/geopolitical/adapters/hard-signals";
import { shouldPromoteCandidate } from "@/lib/geopolitical/anti-noise";
import {
	GeopoliticalIngestionBudget,
	getGeopoliticalIngestionBudgetConfig,
} from "@/lib/geopolitical/ingestion-budget";
import type { GeoCandidate } from "@/lib/geopolitical/types";
import { createGeoCandidate } from "@/lib/server/geopolitical-candidates-store";

export async function POST() {
	const budget = new GeopoliticalIngestionBudget(getGeopoliticalIngestionBudgetConfig());
	const adapterResults = await runHardSignalAdapters(budget);
	const created: GeoCandidate[] = [];
	for (const result of adapterResults) {
		for (const candidate of result.candidates) {
			if (!shouldPromoteCandidate(candidate)) continue;
			const upserted = await createGeoCandidate(candidate);
			created.push(upserted.candidate);
		}
	}

	return NextResponse.json({
		success: true,
		adapters: adapterResults.map((result) => ({
			provider: result.provider,
			ok: result.ok,
			message: result.message,
			produced: result.candidates.length,
		})),
		createdCount: created.length,
		candidates: created,
		budget: budget.snapshot(),
	});
}
