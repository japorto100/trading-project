import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { buildIntelligenceCalendarFallbackResponse } from "@/features/intelligence_calendar/mock-data";
import { intelligenceCalendarResponseSchema } from "@/features/intelligence_calendar/schema";
import { buildLocalIntelligenceCalendarResponse } from "@/features/intelligence_calendar/server-aggregation";

function jsonResponse(payload: unknown, requestId: string, status: number = 200): Response {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-store",
			"X-Request-ID": requestId,
		},
	});
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();

	try {
		const localPayload = await buildLocalIntelligenceCalendarResponse(requestId);
		const parsed = intelligenceCalendarResponseSchema.safeParse(localPayload);
		if (!parsed.success) {
			return jsonResponse(
				buildIntelligenceCalendarFallbackResponse(requestId, ["INVALID_LOCAL_CALENDAR_SHAPE"]),
				requestId,
			);
		}
		return jsonResponse(parsed.data, requestId);
	} catch (error) {
		if (error instanceof Error) {
			console.error("intelligence-calendar local build failed", error);
		}
		return jsonResponse(
			buildIntelligenceCalendarFallbackResponse(requestId, ["LOCAL_CALENDAR_BUILD_FAILED"]),
			requestId,
		);
	}
}
