import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { buildPortfolioSnapshotForProfile } from "@/lib/orders/snapshot-service";
import { savePortfolioSnapshot } from "@/lib/server/portfolio-history-store";
import { getErrorMessage } from "@/lib/utils";

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function buildErrorResponse(requestId: string, error: unknown): NextResponse {
	const message = getErrorMessage(error);
	const persistenceError =
		message.includes("fallback is disabled") ||
		message.toLowerCase().includes("db client unavailable");
	return withRequestIdHeader(
		NextResponse.json(
			{
				success: false,
				error: message,
				requestId,
				degraded: true,
				degraded_reasons: [persistenceError ? "PERSISTENCE_UNAVAILABLE" : "INTERNAL_ERROR"],
			},
			{ status: persistenceError ? 503 : 500 },
		),
		requestId,
	);
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const profileKey = request.nextUrl.searchParams.get("profileKey");
		if (!profileKey) {
			return withRequestIdHeader(
				NextResponse.json(
					{
						success: false,
						error: "profileKey is required",
						requestId,
						degraded: false,
						degraded_reasons: [],
					},
					{ status: 400 },
				),
				requestId,
			);
		}

		const { snapshot, prices } = await buildPortfolioSnapshotForProfile(profileKey, { requestId });
		const persistFlag = request.nextUrl.searchParams.get("persist");
		const shouldPersist = persistFlag === "1" || persistFlag === "true";

		if (!shouldPersist) {
			return withRequestIdHeader(
				NextResponse.json({
					success: true,
					snapshot,
					prices,
					requestId,
					degraded: false,
					degraded_reasons: [],
				}),
				requestId,
			);
		}

		const stored = await savePortfolioSnapshot(profileKey, snapshot);
		return withRequestIdHeader(
			NextResponse.json({
				success: true,
				snapshot,
				prices,
				stored,
				requestId,
				degraded: false,
				degraded_reasons: [],
			}),
			requestId,
		);
	} catch (error) {
		return buildErrorResponse(requestId, error);
	}
}
