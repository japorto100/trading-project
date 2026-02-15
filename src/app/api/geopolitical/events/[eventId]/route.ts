import { type NextRequest, NextResponse } from "next/server";
import { parseUpdateGeoEventInput } from "@/lib/geopolitical/validation";
import {
	deleteGeoEvent,
	getGeoEvent,
	updateGeoEvent,
} from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

export const runtime = "nodejs";

interface ParamsShape {
	params: Promise<{
		eventId: string;
	}>;
}

export async function PATCH(request: NextRequest, context: ParamsShape) {
	const { eventId } = await context.params;
	if (!eventId) {
		return NextResponse.json({ error: "eventId is required" }, { status: 400 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = parseUpdateGeoEventInput(payload);
	if (!parsed.ok) {
		return NextResponse.json({ error: parsed.error }, { status: 400 });
	}

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";

	const before = await getGeoEvent(eventId);
	const updated = await updateGeoEvent(eventId, parsed.value, actor);
	if (!updated) {
		return NextResponse.json({ error: "event not found" }, { status: 404 });
	}

	if (before) {
		if (before.status !== updated.status) {
			await appendGeoTimelineEntry({
				eventId: updated.id,
				action: "status_changed",
				actor,
				diffSummary: `${before.status} -> ${updated.status}`,
			});
		}
		if (before.severity !== updated.severity) {
			await appendGeoTimelineEntry({
				eventId: updated.id,
				action: "severity_changed",
				actor,
				diffSummary: `S${before.severity} -> S${updated.severity}`,
			});
		}
		if (before.confidence !== updated.confidence) {
			await appendGeoTimelineEntry({
				eventId: updated.id,
				action: "confidence_changed",
				actor,
				diffSummary: `C${before.confidence} -> C${updated.confidence}`,
			});
		}
		if (before.summary !== updated.summary || before.analystNote !== updated.analystNote) {
			await appendGeoTimelineEntry({
				eventId: updated.id,
				action: "note_updated",
				actor,
				diffSummary: "Summary/notes updated",
			});
		}
	}

	return NextResponse.json({ success: true, event: updated });
}

export async function DELETE(_request: NextRequest, context: ParamsShape) {
	const { eventId } = await context.params;
	if (!eventId) {
		return NextResponse.json({ error: "eventId is required" }, { status: 400 });
	}

	const before = await getGeoEvent(eventId);
	const removed = await deleteGeoEvent(eventId);
	if (!removed) {
		return NextResponse.json({ error: "event not found" }, { status: 404 });
	}

	if (before) {
		await appendGeoTimelineEntry({
			eventId: before.id,
			action: "archived",
			actor: "local-analyst",
			diffSummary: `Event deleted from v1 JSON store: "${before.title}"`,
		});
	}

	return NextResponse.json({ success: true });
}
