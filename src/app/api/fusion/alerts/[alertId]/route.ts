import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type AlertDetailRouteReason =
	| "MISSING_ALERT_ID"
	| "MISSING_PROFILE_KEY"
	| "INVALID_JSON_BODY"
	| "INVALID_UPDATE_PAYLOAD"
	| "ALERT_NOT_FOUND"
	| "PERSISTENCE_UNAVAILABLE"
	| "INTERNAL_ERROR";

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

function inferServerReason(
	message: string,
): Extract<AlertDetailRouteReason, "PERSISTENCE_UNAVAILABLE" | "INTERNAL_ERROR"> {
	return message.includes("fallback is disabled") ||
		message.toLowerCase().includes("db client unavailable")
		? "PERSISTENCE_UNAVAILABLE"
		: "INTERNAL_ERROR";
}

function errorResponse(requestId: string, error: unknown): NextResponse {
	const message = error instanceof Error ? error.message : "alert mutation failed";
	const reason = inferServerReason(message);
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
					reason: "MISSING_ALERT_ID",
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

	const parsed = updateAlertSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid update payload",
					reason: "INVALID_UPDATE_PAYLOAD",
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
			`${getGoGatewayUrl()}/api/v1/fusion/alerts/${encodeURIComponent(alertId)}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"X-Request-ID": requestId,
				},
				body: JSON.stringify({
					profileKey: parsed.data.profileKey,
					enabled: parsed.data.enabled,
					triggered: parsed.data.triggered,
					triggeredAt:
						parsed.data.triggeredAt === null ? undefined : (parsed.data.triggeredAt ?? undefined),
					message:
						parsed.data.message === null ? undefined : parsed.data.message?.trim() || undefined,
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
					reason: "MISSING_ALERT_ID",
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
	try {
		const response = await fetch(
			`${getGoGatewayUrl()}/api/v1/fusion/alerts/${encodeURIComponent(alertId)}?profileKey=${encodeURIComponent(profileKey)}`,
			{
				method: "DELETE",
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
		return errorResponse(requestId, error);
	}
}
