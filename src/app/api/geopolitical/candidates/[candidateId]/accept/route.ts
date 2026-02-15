import { type NextRequest, NextResponse } from "next/server";
import { confidenceToLadder } from "@/lib/geopolitical/confidence";
import {
	getGeoCandidate,
	updateGeoCandidateState,
} from "@/lib/server/geopolitical-candidates-store";
import { addGeoEventSource, createGeoEvent } from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

interface ParamsShape {
	params: Promise<{ candidateId: string }>;
}

function defaultCoordinate(regionHint?: string): { lat: number; lng: number } {
	const normalized = regionHint?.toLowerCase();
	if (normalized?.includes("europe")) return { lat: 50.5, lng: 10.4 };
	if (normalized?.includes("mena")) return { lat: 28.5, lng: 37.8 };
	if (normalized?.includes("east-asia") || normalized?.includes("east asia"))
		return { lat: 34.4, lng: 121.2 };
	if (normalized?.includes("south-america") || normalized?.includes("south america"))
		return { lat: -15.3, lng: -58.1 };
	if (normalized?.includes("north-america") || normalized?.includes("north america"))
		return { lat: 39.8, lng: -98.5 };
	return { lat: 20.0, lng: 0.0 };
}

export async function POST(request: NextRequest, context: ParamsShape) {
	const { candidateId } = await context.params;
	if (!candidateId) {
		return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
	}

	const candidate = await getGeoCandidate(candidateId);
	if (!candidate) {
		return NextResponse.json({ error: "candidate not found" }, { status: 404 });
	}
	if (candidate.state !== "open") {
		return NextResponse.json(
			{ error: `candidate is ${candidate.state} and cannot be accepted` },
			{ status: 409 },
		);
	}

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";
	const anchor = defaultCoordinate(candidate.regionHint);

	const event = await createGeoEvent(
		{
			title: candidate.headline,
			symbol: candidate.symbol ?? "gavel",
			category: candidate.category ?? "sanctions_export_controls",
			status: "confirmed",
			severity: candidate.severityHint,
			confidence: confidenceToLadder(candidate.confidence),
			lat: anchor.lat,
			lng: anchor.lng,
			summary: candidate.reviewNote,
			analystNote: `Accepted candidate ${candidate.id}`,
			countryCodes: candidate.countryHints ?? [],
			regionIds: candidate.regionHint ? [candidate.regionHint] : [],
		},
		actor,
	);

	for (const source of candidate.sourceRefs) {
		await addGeoEventSource(event.id, source, actor);
	}

	const accepted = await updateGeoCandidateState(candidateId, "accepted", {
		mergedIntoEventId: event.id,
	});

	await appendGeoTimelineEntry({
		eventId: event.id,
		action: "candidate_accepted",
		actor,
		diffSummary: `Candidate ${candidate.id} accepted into event ${event.id}`,
	});

	return NextResponse.json({
		success: true,
		candidate: accepted,
		event,
	});
}
