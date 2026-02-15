import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = evaluateRequestSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{ success: false, error: "invalid payload", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const result = await callIndicatorService<unknown>("/api/v1/evaluate/strategy", parsed.data);
	if (!result.ok) {
		return NextResponse.json(
			{ success: false, error: result.error ?? "indicator service request failed" },
			{ status: result.status || 502 },
		);
	}

	return NextResponse.json({ success: true, data: result.data });
}
