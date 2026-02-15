import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { addGeoEventAsset } from "@/lib/server/geopolitical-events-store";
import { appendGeoTimelineEntry } from "@/lib/server/geopolitical-timeline-store";

interface ParamsShape {
	params: Promise<{ eventId: string }>;
}

function sanitizeString(value: unknown, maxLength = 256): string | undefined {
	if (typeof value !== "string") return undefined;
	const cleaned = value.trim();
	if (!cleaned) return undefined;
	return cleaned.slice(0, maxLength);
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

	const symbol = sanitizeString(payload.symbol, 64);
	if (!symbol) {
		return NextResponse.json({ error: "symbol is required" }, { status: 400 });
	}

	const assetClassRaw = sanitizeString(payload.assetClass, 32);
	const relationRaw = sanitizeString(payload.relation, 32);

	type AssetClass = "equity" | "etf" | "fx" | "commodity" | "crypto" | "index";
	type Relation = "beneficiary" | "exposed" | "hedge" | "uncertain";

	const validAssetClasses = new Set<string>([
		"equity",
		"etf",
		"fx",
		"commodity",
		"crypto",
		"index",
	]);
	const validRelations = new Set<string>(["beneficiary", "exposed", "hedge", "uncertain"]);

	const assetClass: AssetClass = validAssetClasses.has(assetClassRaw ?? "")
		? (assetClassRaw as AssetClass)
		: "equity";
	const relation: Relation = validRelations.has(relationRaw ?? "")
		? (relationRaw as Relation)
		: "uncertain";
	const weightRaw = Number(payload.weight);
	const weight = Number.isFinite(weightRaw) ? Math.min(1, Math.max(0, weightRaw)) : undefined;

	const actorHeader = request.headers.get("x-geo-actor");
	const actor =
		actorHeader && actorHeader.trim().length > 0
			? actorHeader.trim().slice(0, 64)
			: "local-analyst";

	const updated = await addGeoEventAsset(
		eventId,
		{
			id: `ga_${randomUUID()}`,
			symbol,
			assetClass,
			relation,
			weight,
			rationale: sanitizeString(payload.rationale, 500),
		},
		actor,
	);

	if (!updated) {
		return NextResponse.json({ error: "event not found" }, { status: 404 });
	}

	await appendGeoTimelineEntry({
		eventId,
		action: "assets_updated",
		actor,
		diffSummary: `Added asset link (${symbol})`,
	});

	return NextResponse.json({ success: true, event: updated });
}
