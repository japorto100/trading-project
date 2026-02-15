import { type NextRequest, NextResponse } from "next/server";
import { runHardSignalAdapters } from "@/lib/geopolitical/adapters/hard-signals";
import { shouldPromoteCandidate } from "@/lib/geopolitical/anti-noise";
import { parseCreateGeoCandidateInput } from "@/lib/geopolitical/candidate-validation";
import {
	GeopoliticalIngestionBudget,
	getGeopoliticalIngestionBudgetConfig,
} from "@/lib/geopolitical/ingestion-budget";
import type { GeoCandidate } from "@/lib/geopolitical/types";
import { createGeoCandidate, listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const state = request.nextUrl.searchParams.get("state") as
		| "open"
		| "accepted"
		| "rejected"
		| "snoozed"
		| "expired"
		| null;
	const regionHint = request.nextUrl.searchParams.get("regionHint") ?? undefined;
	const minConfidenceRaw = request.nextUrl.searchParams.get("minConfidence");
	const minConfidence = minConfidenceRaw ? Number(minConfidenceRaw) : undefined;
	const q = request.nextUrl.searchParams.get("q") ?? undefined;

	const candidates = await listGeoCandidates({
		state: state ?? undefined,
		regionHint,
		minConfidence: Number.isFinite(minConfidence) ? minConfidence : undefined,
		q,
	});

	return NextResponse.json({ success: true, candidates });
}

export async function POST(request: NextRequest) {
	const mode = request.nextUrl.searchParams.get("mode");

	if (mode === "hard") {
		const budget = new GeopoliticalIngestionBudget(getGeopoliticalIngestionBudgetConfig());
		const adapterResults = await runHardSignalAdapters(budget);
		const created: Array<{ candidate: GeoCandidate; deduped: boolean }> = [];
		for (const result of adapterResults) {
			for (const candidate of result.candidates) {
				if (!shouldPromoteCandidate(candidate)) {
					continue;
				}
				const upserted = await createGeoCandidate(candidate);
				created.push(upserted);
			}
		}
		return NextResponse.json({
			success: true,
			mode: "hard",
			adapters: adapterResults.map((result) => ({
				provider: result.provider,
				ok: result.ok,
				message: result.message,
				count: result.candidates.length,
			})),
			created: created.map((entry) => entry.candidate),
			budget: budget.snapshot(),
		});
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = parseCreateGeoCandidateInput(payload);
	if (!parsed.ok) {
		return NextResponse.json({ error: parsed.error }, { status: 400 });
	}

	const result = await createGeoCandidate(parsed.value);
	if (!result.deduped) {
		await appendGeoTimelineEntry({
			eventId: result.candidate.id,
			action: "created",
			actor: "candidate-engine",
			diffSummary: `New candidate: ${result.candidate.headline}`,
		});
	}

	return NextResponse.json(
		{
			success: true,
			candidate: result.candidate,
			deduped: result.deduped,
		},
		{ status: result.deduped ? 200 : 201 },
	);
}
