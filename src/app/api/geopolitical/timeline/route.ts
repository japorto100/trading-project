import { type NextRequest, NextResponse } from "next/server";
import { listGeoTimeline } from "@/lib/server/geopolitical-timeline-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const eventId = request.nextUrl.searchParams.get("eventId") ?? undefined;
	const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "120");
	const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(500, limitRaw)) : 120;
	const timeline = await listGeoTimeline(eventId, limit);
	return NextResponse.json({ success: true, timeline });
}
