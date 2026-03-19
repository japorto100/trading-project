import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { OrderStatus } from "@/lib/orders/types";

interface ParamsShape {
	params: Promise<{
		orderId: string;
	}>;
}

type OrderDetailRouteReason =
	| "INVALID_JSON_BODY"
	| "INVALID_ORDER_STATUS_PAYLOAD"
	| "MISSING_ORDER_ID"
	| "ORDER_NOT_FOUND"
	| "PERSISTENCE_UNAVAILABLE"
	| "INTERNAL_ERROR";

const updateOrderStatusSchema = z.object({
	profileKey: z.string().min(1),
	status: z.enum(["open", "filled", "cancelled"]),
});

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function inferServerReason(
	message: string,
): Extract<OrderDetailRouteReason, "PERSISTENCE_UNAVAILABLE" | "INTERNAL_ERROR"> {
	return message.includes("fallback is disabled") ||
		message.toLowerCase().includes("db client unavailable")
		? "PERSISTENCE_UNAVAILABLE"
		: "INTERNAL_ERROR";
}

function errorResponse(requestId: string, error: unknown): NextResponse {
	const message = error instanceof Error ? error.message : "order update failed";
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

export async function PATCH(request: NextRequest, context: ParamsShape) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const { orderId } = await context.params;
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
	const parsed = updateOrderStatusSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid order status payload",
					reason: "INVALID_ORDER_STATUS_PAYLOAD",
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

	const profileKey = parsed.data.profileKey;
	const status = parsed.data.status as OrderStatus;

	if (!orderId) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "orderId is required",
					reason: "MISSING_ORDER_ID",
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
			`${getGoGatewayUrl()}/api/v1/fusion/orders/${encodeURIComponent(orderId)}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"X-Request-ID": requestId,
				},
				body: JSON.stringify({ profileKey, status }),
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
