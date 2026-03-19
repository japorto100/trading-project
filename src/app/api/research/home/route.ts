import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { buildResearchHomeFallbackResponse } from "@/features/research/mock-data";
import { researchHomeResponseSchema } from "@/features/research/schema";
import { buildLocalResearchHomeResponse } from "@/features/research/server-aggregation";
import type { ResearchDegradationReason } from "@/features/research/types";

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

function fallbackResponse(
	requestId: string,
	reasons: ResearchDegradationReason[],
	status: number = 200,
): Response {
	return jsonResponse(buildResearchHomeFallbackResponse(requestId, reasons), requestId, status);
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();

	try {
		const localPayload = await buildLocalResearchHomeResponse(requestId);
		const parsed = researchHomeResponseSchema.safeParse(localPayload);
		if (!parsed.success) {
			return fallbackResponse(requestId, ["INVALID_LOCAL_RESEARCH_SHAPE"]);
		}

		return jsonResponse(parsed.data, requestId);
	} catch (error) {
		if (error instanceof Error) {
			console.error("research-home local build failed", error);
		}
		return fallbackResponse(requestId, ["LOCAL_RESEARCH_BUILD_FAILED"]);
	}
}
