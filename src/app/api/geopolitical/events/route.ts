import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { parseCreateGeoEventInput } from "@/lib/geopolitical/validation";
import { fetchExternalEventsViaGateway } from "@/lib/server/geopolitical-acled-bridge";
import { createGeoEvent, listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

export const runtime = "nodejs";

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const source = request.nextUrl.searchParams.get("source")?.trim().toLowerCase() ?? "local";
	if (source !== "local" && source !== "acled" && source !== "gdelt") {
		return withRequestIdHeader(
			NextResponse.json({ success: false, error: "invalid source" }, { status: 400 }),
			requestId,
		);
	}
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
	if (source === "acled" || source === "gdelt") {
		try {
			const externalResult = await fetchExternalEventsViaGateway({
				source,
				country: request.nextUrl.searchParams.get("country") ?? undefined,
				region: request.nextUrl.searchParams.get("region") ?? undefined,
				eventType: request.nextUrl.searchParams.get("eventType") ?? undefined,
				subEventType: request.nextUrl.searchParams.get("subEventType") ?? undefined,
				from: request.nextUrl.searchParams.get("from") ?? undefined,
				to: request.nextUrl.searchParams.get("to") ?? undefined,
				page: Number(request.nextUrl.searchParams.get("page") ?? "1"),
				pageSize: Number(request.nextUrl.searchParams.get("pageSize") ?? "50"),
				requestId,
			});

			const normalizedQuery = q?.trim().toLowerCase();
			let events = externalResult.events;
			if (Number.isFinite(minSeverity)) {
				events = events.filter((event) => event.severity >= Number(minSeverity));
			}
			if (regionId) {
				events = events.filter((event) => event.regionIds.includes(regionId));
			}
			if (normalizedQuery) {
				events = events.filter(
					(event) =>
						event.title.toLowerCase().includes(normalizedQuery) ||
						event.summary?.toLowerCase().includes(normalizedQuery) ||
						event.category.toLowerCase().includes(normalizedQuery),
				);
			}

			return withRequestIdHeader(
				NextResponse.json({
					success: true,
					source: externalResult.meta.source,
					events,
					meta: externalResult.meta,
				}),
				requestId,
			);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "External geopolitical fetch failed";
			return withRequestIdHeader(
				NextResponse.json({ success: false, error: message }, { status: 502 }),
				requestId,
			);
		}
	}

	const events = await listGeoEvents({
		status: status ?? undefined,
		category,
		regionId,
		minSeverity: Number.isFinite(minSeverity) ? minSeverity : undefined,
		q,
	});
	return withRequestIdHeader(
		NextResponse.json({ success: true, source: "local", events }),
		requestId,
	);
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return withRequestIdHeader(
			NextResponse.json({ error: "invalid JSON body" }, { status: 400 }),
			requestId,
		);
	}

	const parsed = parseCreateGeoEventInput(payload);
	if (!parsed.ok) {
		return withRequestIdHeader(
			NextResponse.json({ error: parsed.error }, { status: 400 }),
			requestId,
		);
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

	return withRequestIdHeader(
		NextResponse.json({ success: true, event }, { status: 201 }),
		requestId,
	);
}
