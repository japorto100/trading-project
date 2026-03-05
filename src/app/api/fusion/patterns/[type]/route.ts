import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callIndicatorService } from "@/lib/strategy/indicator-service";

const ALLOWED_TYPES = new Set(["candlestick", "harmonic", "price", "elliott-wave", "timing"]);

const ohlcvPointSchema = z.object({
	time: z.number().int(),
	open: z.number(),
	high: z.number(),
	low: z.number(),
	close: z.number(),
	volume: z.number().nonnegative(),
});

const patternRequestSchema = z.object({
	ohlcv: z.array(ohlcvPointSchema).min(20),
	lookback: z.number().int().min(20).max(5000).optional(),
	threshold: z.number().min(0.001).max(0.2).optional(),
	params: z.record(z.string(), z.unknown()).optional(),
});

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ type: string }> },
) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const { type } = await params;

	if (!ALLOWED_TYPES.has(type)) {
		return withRequestIdHeader(
			NextResponse.json(
				{ success: false, error: `unknown pattern type: ${type}` },
				{ status: 400 },
			),
			requestId,
		);
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return withRequestIdHeader(
			NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 }),
			requestId,
		);
	}

	const parsed = patternRequestSchema.safeParse(payload);
	if (!parsed.success) {
		return withRequestIdHeader(
			NextResponse.json(
				{ success: false, error: "invalid payload", details: parsed.error.flatten() },
				{ status: 400 },
			),
			requestId,
		);
	}

	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	const result = await callIndicatorService<unknown>(`/api/v1/patterns/${type}`, parsed.data, {
		requestId,
		userRole,
	});

	if (!result.ok) {
		return withRequestIdHeader(
			NextResponse.json(
				{ success: false, error: result.error ?? "pattern service request failed" },
				{ status: result.status || 502 },
			),
			requestId,
		);
	}

	return withRequestIdHeader(NextResponse.json({ success: true, data: result.data }), requestId);
}
