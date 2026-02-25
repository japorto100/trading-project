import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { requireLLMConsentOrResponse } from "@/lib/server/consent-guard";
import { fetchGeopoliticalGameTheoryViaGateway } from "@/lib/server/geopolitical-game-theory-bridge";

export const runtime = "nodejs";

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	const consentError = await requireLLMConsentOrResponse();
	if (consentError) {
		return withRequestIdHeader(consentError, requestId);
	}
	try {
		const result = await fetchGeopoliticalGameTheoryViaGateway({
			country: request.nextUrl.searchParams.get("country") ?? undefined,
			region: request.nextUrl.searchParams.get("region") ?? undefined,
			eventType: request.nextUrl.searchParams.get("eventType") ?? undefined,
			subEventType: request.nextUrl.searchParams.get("subEventType") ?? undefined,
			from: request.nextUrl.searchParams.get("from") ?? undefined,
			to: request.nextUrl.searchParams.get("to") ?? undefined,
			limit: Number(request.nextUrl.searchParams.get("limit") ?? "50"),
			requestId,
			userRole,
		});

		return withRequestIdHeader(
			NextResponse.json({
				success: true,
				source: result.source,
				filters: result.filters,
				summary: result.summary,
				items: result.items,
			}),
			requestId,
		);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "game-theory impact fetch failed";
		return withRequestIdHeader(
			NextResponse.json({ success: false, error: message }, { status: 502 }),
			requestId,
		);
	}
}
