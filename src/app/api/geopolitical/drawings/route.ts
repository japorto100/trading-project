import { type NextRequest, NextResponse } from "next/server";
import { createGeoDrawing, listGeoDrawings } from "@/lib/server/geopolitical-drawings-store";

function parsePoint(value: unknown): { lat: number; lng: number } | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const record = value as Record<string, unknown>;
	const lat = Number(record.lat);
	const lng = Number(record.lng);
	if (!Number.isFinite(lat) || lat < -90 || lat > 90) return null;
	if (!Number.isFinite(lng) || lng < -180 || lng > 180) return null;
	return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

export async function GET() {
	const drawings = await listGeoDrawings();
	return NextResponse.json({ success: true, drawings });
}

export async function POST(request: NextRequest) {
	let payload: Record<string, unknown>;
	try {
		payload = (await request.json()) as Record<string, unknown>;
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const typeRaw = typeof payload.type === "string" ? payload.type : "";
	const type = typeRaw === "line" || typeRaw === "polygon" || typeRaw === "text" ? typeRaw : null;
	if (!type) {
		return NextResponse.json({ error: "type must be line, polygon, or text" }, { status: 400 });
	}

	const points = Array.isArray(payload.points)
		? payload.points
				.map(parsePoint)
				.filter((point): point is { lat: number; lng: number } => Boolean(point))
		: [];
	if (points.length === 0) {
		return NextResponse.json({ error: "at least one valid point is required" }, { status: 400 });
	}
	if (type === "line" && points.length < 2) {
		return NextResponse.json({ error: "line drawings require at least 2 points" }, { status: 400 });
	}
	if (type === "polygon" && points.length < 3) {
		return NextResponse.json(
			{ error: "polygon drawings require at least 3 points" },
			{ status: 400 },
		);
	}

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";

	const drawing = await createGeoDrawing({
		type,
		points,
		label: typeof payload.label === "string" ? payload.label.trim().slice(0, 120) : undefined,
		color: typeof payload.color === "string" ? payload.color.trim().slice(0, 32) : undefined,
		eventId: typeof payload.eventId === "string" ? payload.eventId.trim().slice(0, 100) : undefined,
		createdBy: actor,
		updatedBy: actor,
	});

	return NextResponse.json({ success: true, drawing }, { status: 201 });
}
