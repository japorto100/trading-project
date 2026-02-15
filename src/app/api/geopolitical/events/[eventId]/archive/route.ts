import { type NextRequest, NextResponse } from "next/server";
import { archiveGeoEvent } from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

interface ParamsShape {
	params: Promise<{ eventId: string }>;
}

export async function POST(request: NextRequest, context: ParamsShape) {
	const { eventId } = await context.params;
	if (!eventId) {
		return NextResponse.json({ error: "eventId is required" }, { status: 400 });
	}

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";
	const archived = await archiveGeoEvent(eventId, actor);
	if (!archived) {
		return NextResponse.json({ error: "event not found" }, { status: 404 });
	}

	await appendGeoTimelineEntry({
		eventId,
		action: "archived",
		actor,
		diffSummary: `Archived event "${archived.title}"`,
	});

	return NextResponse.json({ success: true, event: archived });
}
