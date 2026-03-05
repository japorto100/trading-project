import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { createTradeJournalEntry, listTradeJournalEntries } from "@/lib/server/trade-journal-store";
import { getErrorMessage } from "@/lib/utils";

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function errorResponse(requestId: string, error: unknown): NextResponse {
	const message = getErrorMessage(error);
	const persistenceError =
		message.includes("fallback is disabled") ||
		message.toLowerCase().includes("db client unavailable");
	return withRequestId(
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

const createJournalSchema = z.object({
	profileKey: z.string().min(1),
	symbol: z.string().min(1),
	orderId: z.string().min(1).optional(),
	note: z.string().min(1),
	tags: z.array(z.string().min(1)).max(20).optional(),
	context: z.record(z.string(), z.unknown()).optional(),
	screenshotUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const profileKey = request.nextUrl.searchParams.get("profileKey");
		if (!profileKey) {
			return withRequestId(
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
		const symbolParam = request.nextUrl.searchParams.get("symbol");
		const symbol = symbolParam ? canonicalizeFusionSymbol(symbolParam) : undefined;
		const limitParam = Number(request.nextUrl.searchParams.get("limit"));
		const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 100;

		const entries = await listTradeJournalEntries(profileKey, symbol, limit);
		return withRequestId(
			NextResponse.json({
				success: true,
				entries,
				requestId,
				degraded: false,
				degraded_reasons: [],
			}),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error);
	}
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid JSON body",
					requestId,
					degraded: false,
					degraded_reasons: [],
				},
				{ status: 400 },
			),
			requestId,
		);
	}

	const parsed = createJournalSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid journal payload",
					details: parsed.error.flatten(),
					requestId,
					degraded: false,
					degraded_reasons: [],
				},
				{ status: 400 },
			),
			requestId,
		);
	}

	try {
		const entry = await createTradeJournalEntry({
			profileKey: parsed.data.profileKey,
			symbol: canonicalizeFusionSymbol(parsed.data.symbol),
			orderId: parsed.data.orderId,
			note: parsed.data.note,
			tags: parsed.data.tags,
			context: parsed.data.context,
			screenshotUrl: parsed.data.screenshotUrl,
		});
		return withRequestId(
			NextResponse.json(
				{ success: true, entry, requestId, degraded: false, degraded_reasons: [] },
				{ status: 201 },
			),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error);
	}
}
