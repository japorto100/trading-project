import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { fetchGeopoliticalContextViaGateway } from "@/lib/server/geopolitical-context-bridge";

export const runtime = "nodejs";

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	try {
		const result = await fetchGeopoliticalContextViaGateway({
			source: (request.nextUrl.searchParams.get("source") ?? undefined) as
				| "all"
				| "cfr"
				| "crisiswatch"
				| undefined,
			q: request.nextUrl.searchParams.get("q") ?? undefined,
			region: request.nextUrl.searchParams.get("region") ?? undefined,
			limit: Number(request.nextUrl.searchParams.get("limit") ?? "12"),
			requestId,
			userRole,
		});
		return withRequestIdHeader(
			NextResponse.json({
				success: true,
				source: result.source,
				filters: result.filters,
				items: result.items,
			}),
			requestId,
		);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "geopolitical context fetch failed";
		return withRequestIdHeader(
			NextResponse.json({ success: false, error: message }, { status: 502 }),
			requestId,
		);
	}
}
