import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { OrderStatus } from "@/lib/orders/types";
import { updatePaperOrderStatus } from "@/lib/server/orders-store";

interface ParamsShape {
	params: Promise<{
		orderId: string;
	}>;
}

const updateOrderStatusSchema = z.object({
	profileKey: z.string().min(1),
	status: z.enum(["open", "filled", "cancelled"]),
});

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function errorResponse(requestId: string, error: unknown): NextResponse {
	const message = error instanceof Error ? error.message : "order update failed";
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

	if (!profileKey || !orderId) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "profileKey and orderId are required",
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
		const updated = await updatePaperOrderStatus(profileKey, orderId, status);
		if (!updated) {
			return withRequestId(
				NextResponse.json(
					{
						success: false,
						error: "order not found",
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
				order: updated,
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
