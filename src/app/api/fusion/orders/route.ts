import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import type { OrderSide, OrderType } from "@/lib/orders/types";
import { createPaperOrder, listPaperOrders } from "@/lib/server/orders-store";

function asNumber(value: unknown): number {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
}

function withRequestId(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

function errorResponse(requestId: string, error: unknown): NextResponse {
	const message = error instanceof Error ? error.message : "orders request failed";
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

const createOrderSchema = z.object({
	profileKey: z.string().min(1),
	symbol: z.string().min(1),
	side: z.enum(["buy", "sell"]),
	type: z.enum(["market", "limit", "stop", "stop_limit"]),
	quantity: z.coerce.number().positive(),
	entryPrice: z.coerce.number().positive(),
	stopLoss: z.coerce.number().positive().optional(),
	takeProfit: z.coerce.number().positive().optional(),
});

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
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
	try {
		const orders = await listPaperOrders(profileKey, symbol);
		return withRequestId(
			NextResponse.json({
				success: true,
				orders,
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

	const parsed = createOrderSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestId(
			NextResponse.json(
				{
					success: false,
					error: "invalid order payload",
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
	const symbol = canonicalizeFusionSymbol(parsed.data.symbol);
	const side = parsed.data.side as OrderSide;
	const type = parsed.data.type as OrderType;
	const quantity = parsed.data.quantity;
	const entryPrice = parsed.data.entryPrice;
	const stopLoss = asNumber(parsed.data.stopLoss);
	const takeProfit = asNumber(parsed.data.takeProfit);

	try {
		const order = await createPaperOrder({
			profileKey,
			symbol,
			side,
			type,
			quantity,
			entryPrice,
			stopLoss: stopLoss > 0 ? stopLoss : undefined,
			takeProfit: takeProfit > 0 ? takeProfit : undefined,
		});
		return withRequestId(
			NextResponse.json(
				{ success: true, order, requestId, degraded: false, degraded_reasons: [] },
				{ status: 201 },
			),
			requestId,
		);
	} catch (error: unknown) {
		return errorResponse(requestId, error);
	}
}
