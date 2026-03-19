import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getErrorMessage } from "@/lib/utils";

interface ParamsShape {
	params: Promise<{
		entryId: string;
	}>;
}

type TradeJournalEntryRouteReason =
	| "INVALID_JSON_BODY"
	| "INVALID_JOURNAL_UPDATE_PAYLOAD"
	| "INVALID_DELETE_PAYLOAD"
	| "ENTRY_NOT_FOUND"
	| "PERSISTENCE_UNAVAILABLE"
	| "INTERNAL_ERROR";

const updateJournalSchema = z.object({
	profileKey: z.string().min(1),
	note: z.string().min(1).optional(),
	tags: z.array(z.string().min(1)).max(20).optional(),
	context: z.record(z.string(), z.unknown()).optional(),
	screenshotUrl: z.string().url().optional(),
});

const deleteJournalSchema = z.object({
	profileKey: z.string().min(1),
});

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function inferServerReason(
	error: unknown,
): Extract<TradeJournalEntryRouteReason, "PERSISTENCE_UNAVAILABLE" | "INTERNAL_ERROR"> {
	const message = getErrorMessage(error);
	return message.includes("fallback is disabled") ||
		message.toLowerCase().includes("db client unavailable")
		? "PERSISTENCE_UNAVAILABLE"
		: "INTERNAL_ERROR";
}

function errorResponse(
	requestId: string,
	error: unknown,
	reason: Extract<TradeJournalEntryRouteReason, "PERSISTENCE_UNAVAILABLE" | "INTERNAL_ERROR">,
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

function getGoGatewayUrl(): string {
	return process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
}

export async function PATCH(request: NextRequest, context: ParamsShape) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const { entryId } = await context.params;

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

	const parsed = updateJournalSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid journal update payload",
					reason: "INVALID_JOURNAL_UPDATE_PAYLOAD",
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
		const response = await fetch(
			`${getGoGatewayUrl()}/api/v1/fusion/trade-journal/${encodeURIComponent(entryId)}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"X-Request-ID": requestId,
				},
				body: JSON.stringify({
					profileKey: parsed.data.profileKey,
					note: parsed.data.note,
					tags: parsed.data.tags,
					context: parsed.data.context,
					screenshotUrl: parsed.data.screenshotUrl,
				}),
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

export async function DELETE(request: NextRequest, context: ParamsShape) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const { entryId } = await context.params;

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

	const parsed = deleteJournalSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid delete payload",
					reason: "INVALID_DELETE_PAYLOAD",
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
		const response = await fetch(
			`${getGoGatewayUrl()}/api/v1/fusion/trade-journal/${encodeURIComponent(entryId)}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"X-Request-ID": requestId,
				},
				body: JSON.stringify({ profileKey: parsed.data.profileKey }),
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
