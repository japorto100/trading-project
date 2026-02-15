import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = compositeRequestSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{ success: false, error: "invalid payload", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const result = await callIndicatorService<unknown>("/api/v1/signals/composite", parsed.data);
	if (!result.ok) {
		return NextResponse.json(
			{ success: false, error: result.error ?? "indicator service request failed" },
			{ status: result.status || 502 },
		);
	}

	return NextResponse.json({ success: true, data: result.data });
}
