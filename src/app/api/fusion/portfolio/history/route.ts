import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildPortfolioSnapshotForProfile } from "@/lib/orders/snapshot-service";
import {
	listPortfolioSnapshots,
	savePortfolioSnapshot,
} from "@/lib/server/portfolio-history-store";
import { getErrorMessage } from "@/lib/utils";

const createHistorySchema = z.object({
	profileKey: z.string().min(1),
});

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
		const limitParam = Number(request.nextUrl.searchParams.get("limit"));
		const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 50;
		const entries = await listPortfolioSnapshots(profileKey, limit);
		return withRequestIdHeader(NextResponse.json({ success: true, entries }), requestId);
	} catch (error: unknown) {
		return withRequestIdHeader(
			NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }),
			requestId,
		);
	}
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return withRequestIdHeader(
			NextResponse.json({ error: "invalid JSON body" }, { status: 400 }),
			requestId,
		);
	}

	const parsed = createHistorySchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestIdHeader(
			NextResponse.json(
				{
					error: "invalid payload",
					details: parsed.error.flatten(),
				},
				{ status: 400 },
			),
			requestId,
		);
	}

	try {
		const { snapshot, prices } = await buildPortfolioSnapshotForProfile(parsed.data.profileKey, {
			requestId,
		});
		const stored = await savePortfolioSnapshot(parsed.data.profileKey, snapshot);
		return withRequestIdHeader(
			NextResponse.json(
				{
					success: true,
					stored,
					snapshot,
					prices,
				},
				{ status: 201 },
			),
			requestId,
		);
	} catch (error: unknown) {
		return withRequestIdHeader(
			NextResponse.json({ error: getErrorMessage(error) }, { status: 500 }),
			requestId,
		);
	}
}
