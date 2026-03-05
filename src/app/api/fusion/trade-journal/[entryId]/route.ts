import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteTradeJournalEntry, updateTradeJournalEntry } from "@/lib/server/trade-journal-store";
import { getErrorMessage } from "@/lib/utils";

interface ParamsShape {
	params: Promise<{
		entryId: string;
	}>;
}

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
		const updated = await updateTradeJournalEntry(parsed.data.profileKey, entryId, {
			note: parsed.data.note,
			tags: parsed.data.tags,
			context: parsed.data.context,
			screenshotUrl: parsed.data.screenshotUrl,
		});
		if (!updated) {
			return withRequestId(
				NextResponse.json(
					{
						success: false,
						error: "entry not found",
						requestId,
						degraded: false,
						degraded_reasons: [],
					},
					{ status: 404 },
				),
				requestId,
			);
		}
		return withRequestId(
			NextResponse.json({
				success: true,
				entry: updated,
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
		const deleted = await deleteTradeJournalEntry(parsed.data.profileKey, entryId);
		if (!deleted) {
			return withRequestId(
				NextResponse.json(
					{
						success: false,
						error: "entry not found",
						requestId,
						degraded: false,
						degraded_reasons: [],
					},
					{ status: 404 },
				),
				requestId,
			);
		}
		return withRequestId(
			NextResponse.json({ success: true, requestId, degraded: false, degraded_reasons: [] }),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error);
	}
}
