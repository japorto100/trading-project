import { type NextRequest, NextResponse } from "next/server";
import { parseCreateGeoEventInput } from "@/lib/geopolitical/validation";
import { createGeoEvent, listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const status = request.nextUrl.searchParams.get("status") as
		| "candidate"
		| "confirmed"
		| "persistent"
		| "archived"
		| null;
	const category = request.nextUrl.searchParams.get("category") ?? undefined;
	const regionId = request.nextUrl.searchParams.get("regionId") ?? undefined;
	const minSeverityRaw = request.nextUrl.searchParams.get("minSeverity");
	const minSeverity = minSeverityRaw ? Number(minSeverityRaw) : undefined;
	const q = request.nextUrl.searchParams.get("q") ?? undefined;

	const events = await listGeoEvents({
		status: status ?? undefined,
		category,
		regionId,
		minSeverity: Number.isFinite(minSeverity) ? minSeverity : undefined,
		q,
	});
	return NextResponse.json({ success: true, events });
}

export async function POST(request: NextRequest) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = parseCreateGeoEventInput(payload);
	if (!parsed.ok) {
		return NextResponse.json({ error: parsed.error }, { status: 400 });
	}

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";

	const event = await createGeoEvent(parsed.value, actor);
	await appendGeoTimelineEntry({
		eventId: event.id,
		action: "created",
		actor,
		diffSummary: `Created event "${event.title}"`,
	});

	return NextResponse.json({ success: true, event }, { status: 201 });
}
