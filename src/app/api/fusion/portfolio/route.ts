import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { buildPortfolioSnapshotForProfile } from "@/lib/orders/snapshot-service";
import { savePortfolioSnapshot } from "@/lib/server/portfolio-history-store";
import { getErrorMessage } from "@/lib/utils";

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const profileKey = request.nextUrl.searchParams.get("profileKey");
		if (!profileKey) {
			return withRequestIdHeader(
				NextResponse.json({ error: "profileKey is required" }, { status: 400 }),
				requestId,
			);
		}

		const { snapshot, prices } = await buildPortfolioSnapshotForProfile(profileKey, { requestId });
		const persistFlag = request.nextUrl.searchParams.get("persist");
		const shouldPersist = persistFlag === "1" || persistFlag === "true";

		if (!shouldPersist) {
			return withRequestIdHeader(NextResponse.json({ success: true, snapshot, prices }), requestId);
		}

		const stored = await savePortfolioSnapshot(profileKey, snapshot);
		return withRequestIdHeader(
			NextResponse.json({ success: true, snapshot, prices, stored }),
			requestId,
		);
	} catch (error) {
		return withRequestIdHeader(
			NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }),
			requestId,
		);
	}
}
