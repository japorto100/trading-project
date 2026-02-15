import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AlertCondition } from "@/lib/alerts";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { createPriceAlert, listPriceAlerts } from "@/lib/server/price-alerts-store";

const createAlertSchema = z.object({
	profileKey: z.string().min(1),
	symbol: z.string().min(1),
	condition: z.enum([
		"above",
		"below",
		"crosses_up",
		"crosses_down",
		"rsi_overbought",
		"rsi_oversold",
	]),
	targetValue: z.coerce.number().finite(),
	message: z.string().max(200).optional(),
	enabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
	const profileKey = request.nextUrl.searchParams.get("profileKey");
	if (!profileKey) {
		return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
	}
	const symbolParam = request.nextUrl.searchParams.get("symbol");
	const alerts = await listPriceAlerts(profileKey, symbolParam ?? undefined);
	return NextResponse.json({ success: true, alerts });
}

export async function POST(request: NextRequest) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = createAlertSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid alert payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const alert = await createPriceAlert({
		profileKey: parsed.data.profileKey,
		symbol: canonicalizeFusionSymbol(parsed.data.symbol),
		condition: parsed.data.condition as AlertCondition,
		targetValue: parsed.data.targetValue,
		message: parsed.data.message?.trim() || undefined,
		enabled: parsed.data.enabled,
	});

	return NextResponse.json({ success: true, alert }, { status: 201 });
}
