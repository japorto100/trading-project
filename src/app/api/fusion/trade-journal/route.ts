import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { getErrorMessage } from "@/lib/utils";

type TradeJournalRouteReason =
	| "MISSING_PROFILE_KEY"
	| "INVALID_JSON_BODY"
	| "INVALID_JOURNAL_PAYLOAD"
	| "PERSISTENCE_UNAVAILABLE"
	| "INTERNAL_ERROR";

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function errorResponse(
	requestId: string,
	error: unknown,
	reason: Extract<TradeJournalRouteReason, "PERSISTENCE_UNAVAILABLE" | "INTERNAL_ERROR">,
): NextResponse {
	const message = getErrorMessage(error);
	return withRequestId(
		NextResponse.json(
			{
				success: false,
				error: message,
				reason,
				requestId,
				degraded: true,
				degraded_reasons: [reason],
			},
			{ status: reason === "PERSISTENCE_UNAVAILABLE" ? 503 : 500 },
		),
		requestId,
	);
}

function inferServerReason(
	error: unknown,
): Extract<TradeJournalRouteReason, "PERSISTENCE_UNAVAILABLE" | "INTERNAL_ERROR"> {
	const message = getErrorMessage(error);
	return message.includes("fallback is disabled") ||
		message.toLowerCase().includes("db client unavailable")
		? "PERSISTENCE_UNAVAILABLE"
		: "INTERNAL_ERROR";
}

function getGoGatewayUrl(): string {
	return process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
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
						reason: "MISSING_PROFILE_KEY",
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

		const params = new URLSearchParams({ profileKey, limit: String(limit) });
		if (symbol) params.set("symbol", symbol);
		const response = await fetch(
			`${getGoGatewayUrl()}/api/v1/fusion/trade-journal?${params.toString()}`,
			{
				method: "GET",
				headers: { "X-Request-ID": requestId },
				cache: "no-store",
			},
		);
		const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
		return withRequestId(
			NextResponse.json({ ...payload, requestId }, { status: response.status }),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error, inferServerReason(error));
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
					reason: "INVALID_JSON_BODY",
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
					reason: "INVALID_JOURNAL_PAYLOAD",
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
		const response = await fetch(`${getGoGatewayUrl()}/api/v1/fusion/trade-journal`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Request-ID": requestId,
			},
			body: JSON.stringify({
				profileKey: parsed.data.profileKey,
				symbol: canonicalizeFusionSymbol(parsed.data.symbol),
				orderId: parsed.data.orderId,
				note: parsed.data.note,
				tags: parsed.data.tags,
				context: parsed.data.context,
				screenshotUrl: parsed.data.screenshotUrl,
			}),
			cache: "no-store",
		});
		const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
		return withRequestId(
			NextResponse.json({ ...payload, requestId }, { status: response.status }),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error, inferServerReason(error));
	}
}
