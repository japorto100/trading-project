import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callIndicatorService } from "@/lib/strategy/indicator-service";

const tradeSchema = z.object({
	entry: z.number().positive(),
	exit: z.number().positive(),
	quantity: z.number().positive().default(1),
	side: z.enum(["long", "short"]).default("long"),
	fee: z.number().nonnegative().default(0),
});

const evaluateRequestSchema = z.object({
	trades: z.array(tradeSchema).min(1),
	riskFreeRate: z.number().optional(),
});

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return withRequestIdHeader(
			NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 }),
			requestId,
		);
	}

	const parsed = evaluateRequestSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestIdHeader(
			NextResponse.json(
				{ success: false, error: "invalid payload", details: parsed.error.flatten() },
				{ status: 400 },
			),
			requestId,
		);
	}

	const result = await callIndicatorService<unknown>("/api/v1/evaluate/strategy", parsed.data, {
		requestId,
		userRole,
	});
	if (!result.ok) {
		return withRequestIdHeader(
			NextResponse.json(
				{ success: false, error: result.error ?? "indicator service request failed" },
				{ status: result.status || 502 },
			),
			requestId,
		);
	}

	return withRequestIdHeader(NextResponse.json({ success: true, data: result.data }), requestId);
}
