import { type NextRequest, NextResponse } from "next/server";
import { fetchGeopoliticalGameTheoryViaGateway } from "@/lib/server/geopolitical-game-theory-bridge";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	try {
		const result = await fetchGeopoliticalGameTheoryViaGateway({
			country: request.nextUrl.searchParams.get("country") ?? undefined,
			region: request.nextUrl.searchParams.get("region") ?? undefined,
			eventType: request.nextUrl.searchParams.get("eventType") ?? undefined,
			subEventType: request.nextUrl.searchParams.get("subEventType") ?? undefined,
			from: request.nextUrl.searchParams.get("from") ?? undefined,
			to: request.nextUrl.searchParams.get("to") ?? undefined,
			limit: Number(request.nextUrl.searchParams.get("limit") ?? "50"),
		});

		return NextResponse.json({
			success: true,
			source: result.source,
			filters: result.filters,
			summary: result.summary,
			items: result.items,
		});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "game-theory impact fetch failed";
		return NextResponse.json({ success: false, error: message }, { status: 502 });
	}
}
