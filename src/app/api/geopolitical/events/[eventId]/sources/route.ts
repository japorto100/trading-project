import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { addGeoEventSource } from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

interface ParamsShape {
	params: Promise<{ eventId: string }>;
}

function sanitizeString(value: unknown, maxLength = 512): string | undefined {
	if (typeof value !== "string") return undefined;
	const cleaned = value.trim();
	if (!cleaned) return undefined;
	return cleaned.slice(0, maxLength);
}

function sanitizeUrl(value: unknown): string | null {
	const raw = sanitizeString(value, 2048);
	if (!raw) return null;
	try {
		const url = new URL(raw);
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return null;
		}
		return url.toString();
	} catch {
		return null;
	}
}

export async function POST(request: NextRequest, context: ParamsShape) {
	const { eventId } = await context.params;
	if (!eventId) {
		return NextResponse.json({ error: "eventId is required" }, { status: 400 });
	}

	let payload: Record<string, unknown>;
	try {
		payload = (await request.json()) as Record<string, unknown>;
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const provider = sanitizeString(payload.provider, 120);
	const url = sanitizeUrl(payload.url);
	if (!provider || !url) {
		return NextResponse.json({ error: "provider and valid url are required" }, { status: 400 });
	}

	const tierRaw = sanitizeString(payload.sourceTier, 1);
	const sourceTier = tierRaw === "A" || tierRaw === "B" || tierRaw === "C" ? tierRaw : "B";
	const reliabilityRaw = Number(payload.reliability);
	const reliability = Number.isFinite(reliabilityRaw)
		? Math.min(1, Math.max(0, reliabilityRaw))
		: sourceTier === "A"
			? 0.95
			: sourceTier === "B"
				? 0.75
				: 0.55;

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";

	const updated = await addGeoEventSource(
		eventId,
		{
			id: `gs_${randomUUID()}`,
			provider,
			url,
			title: sanitizeString(payload.title, 220),
			publishedAt: sanitizeString(payload.publishedAt, 40),
			fetchedAt: new Date().toISOString(),
			sourceTier,
			reliability,
		},
		actor,
	);

	if (!updated) {
		return NextResponse.json({ error: "event not found" }, { status: 404 });
	}

	await appendGeoTimelineEntry({
		eventId,
		action: "sources_updated",
		actor,
		diffSummary: `Added source (${provider})`,
	});

	return NextResponse.json({ success: true, event: updated });
}
