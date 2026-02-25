import { NextResponse } from "next/server";
import type { GeoEvaluationSummary } from "@/lib/geopolitical/phase12-types";
import { listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import { listGeoContradictions } from "@/lib/server/geopolitical-contradictions-store";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { listGeoTimeline } from "@/lib/server/geopolitical-timeline-store";

export async function GET() {
	const [events, candidates, contradictions, timeline] = await Promise.all([
		listGeoEvents(),
		listGeoCandidates(),
		listGeoContradictions(),
		listGeoTimeline(undefined, 500),
	]);

	let accepted = 0;
	let rejected = 0;
	let snoozed = 0;
	let contradictionCreated = 0;
	let contradictionResolved = 0;
	for (const entry of timeline) {
		if (entry.action === "candidate_accepted") accepted += 1;
		if (entry.action === "candidate_rejected") rejected += 1;
		if (entry.action === "candidate_snoozed") snoozed += 1;
		if (entry.action === "contradiction_created") contradictionCreated += 1;
		if (entry.action === "contradiction_resolved") contradictionResolved += 1;
	}
	const reviewTotal = accepted + rejected + snoozed;
	const openCandidates = candidates.filter((candidate) => candidate.state === "open").length;
	const openContradictions = contradictions.filter((item) => item.state === "open").length;
	const summary: GeoEvaluationSummary = {
		generatedAt: new Date().toISOString(),
		counts: {
			events: events.length,
			candidates: candidates.length,
			openCandidates,
			contradictions: contradictions.length,
			openContradictions,
			timeline: timeline.length,
		},
		review: {
			accepted,
			rejected,
			snoozed,
			reviewTotal,
			acceptRate: reviewTotal > 0 ? accepted / reviewTotal : 0,
			rejectRate: reviewTotal > 0 ? rejected / reviewTotal : 0,
			snoozeRate: reviewTotal > 0 ? snoozed / reviewTotal : 0,
		},
		contradictions: {
			created: contradictionCreated,
			resolved: contradictionResolved,
			resolutionRate: contradictionCreated > 0 ? contradictionResolved / contradictionCreated : 0,
		},
	};

	return NextResponse.json({ success: true, summary });
}
