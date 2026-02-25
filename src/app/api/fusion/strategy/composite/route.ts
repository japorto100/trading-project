import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callIndicatorService } from "@/lib/strategy/indicator-service";

const ohlcvPointSchema = z.object({
	time: z.number().int(),
	open: z.number(),
	high: z.number(),
	low: z.number(),
	close: z.number(),
	volume: z.number().nonnegative(),
});

const compositeRequestSchema = z.object({
	ohlcv: z.array(ohlcvPointSchema).min(2),
	heartbeatThreshold: z.number().min(0).max(1).optional(),
	volumeSpikeThreshold: z.number().positive().optional(),
	params: z.record(z.string(), z.unknown()).optional(),
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

	const parsed = compositeRequestSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestIdHeader(
			NextResponse.json(
				{ success: false, error: "invalid payload", details: parsed.error.flatten() },
				{ status: 400 },
			),
			requestId,
		);
	}

	const result = await callIndicatorService<unknown>("/api/v1/signals/composite", parsed.data, {
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
