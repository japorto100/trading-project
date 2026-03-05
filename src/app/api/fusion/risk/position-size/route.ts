import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculatePositionSize } from "@/lib/orders/risk";

const positionSizeSchema = z.object({
	balance: z.coerce.number().positive(),
	riskPercent: z.coerce.number().positive().max(100),
	entryPrice: z.coerce.number().positive(),
	stopPrice: z.coerce.number().positive(),
	feePercent: z.coerce.number().min(0).max(100).optional(),
	slippagePercent: z.coerce.number().min(0).max(100).optional(),
	atr: z.coerce.number().positive().optional(),
	atrMultiplier: z.coerce.number().positive().optional(),
});

export async function POST(request: Request) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json(
			{
				success: false,
				error: "invalid JSON body",
				requestId,
				degraded: false,
				degraded_reasons: [],
				schema_version: "1.0",
				feature_scope: "production",
			},
			{ status: 400 },
		);
	}

	const parsed = positionSizeSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				success: false,
				error: "invalid risk payload",
				details: parsed.error.flatten(),
				requestId,
				degraded: false,
				degraded_reasons: [],
				schema_version: "1.0",
				feature_scope: "production",
			},
			{ status: 400 },
		);
	}

	const sizing = calculatePositionSize(parsed.data);
	return NextResponse.json({
		success: true,
		sizing,
		requestId,
		degraded: false,
		degraded_reasons: [],
		schema_version: "1.0",
		feature_scope: "production",
	});
}
