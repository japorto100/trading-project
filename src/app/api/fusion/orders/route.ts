import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import type { OrderSide, OrderType } from "@/lib/orders/types";
import { createPaperOrder, listPaperOrders } from "@/lib/server/orders-store";

function asNumber(value: unknown): number {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
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
	const profileKey = request.nextUrl.searchParams.get("profileKey");
	if (!profileKey) {
		return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
	}

	const symbolParam = request.nextUrl.searchParams.get("symbol");
	const symbol = symbolParam ? canonicalizeFusionSymbol(symbolParam) : undefined;
	const orders = await listPaperOrders(profileKey, symbol);
	return NextResponse.json({ success: true, orders });
}

export async function POST(request: NextRequest) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = createOrderSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid order payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
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

	return NextResponse.json({ success: true, order }, { status: 201 });
}
