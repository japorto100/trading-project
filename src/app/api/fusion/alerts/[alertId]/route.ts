import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deletePriceAlert, updatePriceAlert } from "@/lib/server/price-alerts-store";

const updateAlertSchema = z.object({
	profileKey: z.string().min(1),
	enabled: z.boolean().optional(),
	triggered: z.boolean().optional(),
	triggeredAt: z.number().int().positive().nullable().optional(),
	message: z.string().max(200).nullable().optional(),
});

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function errorResponse(requestId: string, error: unknown): NextResponse {
	const message = error instanceof Error ? error.message : "alert mutation failed";
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

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ alertId: string }> },
) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const { alertId } = await context.params;
	if (!alertId) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "alertId is required",
					requestId,
					degraded: false,
					degraded_reasons: [],
				},
				{ status: 400 },
			),
			requestId,
		);
	}

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

	const parsed = updateAlertSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid update payload",
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
		const updated = await updatePriceAlert(parsed.data.profileKey, alertId, {
			enabled: parsed.data.enabled,
			triggered: parsed.data.triggered,
			triggeredAt:
				parsed.data.triggeredAt === null ? undefined : (parsed.data.triggeredAt ?? undefined),
			message: parsed.data.message === null ? undefined : parsed.data.message?.trim() || undefined,
		});
		if (!updated) {
			return withRequestId(
				NextResponse.json(
					{
						success: false,
						error: "alert not found",
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
				alert: updated,
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

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ alertId: string }> },
) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const { alertId } = await context.params;
	if (!alertId) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "alertId is required",
					requestId,
					degraded: false,
					degraded_reasons: [],
				},
				{ status: 400 },
			),
			requestId,
		);
	}
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
	try {
		const deleted = await deletePriceAlert(profileKey, alertId);
		if (!deleted) {
			return withRequestId(
				NextResponse.json(
					{
						success: false,
						error: "alert not found",
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
