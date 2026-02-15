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

export async function PATCH(request: NextRequest, context: ParamsShape) {
	const { orderId } = await context.params;
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}
	const parsed = updateOrderStatusSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid order status payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const profileKey = parsed.data.profileKey;
	const status = parsed.data.status as OrderStatus;

	if (!profileKey || !orderId) {
		return NextResponse.json({ error: "profileKey and orderId are required" }, { status: 400 });
	}

	const updated = await updatePaperOrderStatus(profileKey, orderId, status);
	if (!updated) {
		return NextResponse.json({ error: "order not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true, order: updated });
}
