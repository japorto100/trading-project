import { type NextRequest, NextResponse } from "next/server";
import {
	getGeoCandidate,
	updateGeoCandidateState,
} from "@/lib/server/geopolitical-candidates-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

interface ParamsShape {
	params: Promise<{ candidateId: string }>;
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
			{ error: `candidate is ${candidate.state} and cannot be snoozed` },
			{ status: 409 },
		);
	}

	let reviewNote: string | undefined;
	try {
		const body = (await request.json()) as { reviewNote?: string };
		if (typeof body.reviewNote === "string") {
			reviewNote = body.reviewNote.trim().slice(0, 500);
		}
	} catch {
		// optional body
	}

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";

	const updated = await updateGeoCandidateState(candidateId, "snoozed", {
		reviewNote,
	});

	await appendGeoTimelineEntry({
		eventId: candidateId,
		action: "candidate_snoozed",
		actor,
		diffSummary: `Candidate ${candidateId} snoozed`,
	});

	return NextResponse.json({ success: true, candidate: updated });
}
