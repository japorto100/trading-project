import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deletePriceAlert, updatePriceAlert } from "@/lib/server/price-alerts-store";

const updateAlertSchema = z.object({
	profileKey: z.string().min(1),
	enabled: z.boolean().optional(),
	triggered: z.boolean().optional(),
	triggeredAt: z.number().int().positive().nullable().optional(),
	message: z.string().max(200).nullable().optional(),
});

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ alertId: string }> },
) {
	const { alertId } = await context.params;
	if (!alertId) {
		return NextResponse.json({ error: "alertId is required" }, { status: 400 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = updateAlertSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "invalid update payload", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const updated = await updatePriceAlert(parsed.data.profileKey, alertId, {
		enabled: parsed.data.enabled,
		triggered: parsed.data.triggered,
		triggeredAt:
			parsed.data.triggeredAt === null ? undefined : (parsed.data.triggeredAt ?? undefined),
		message: parsed.data.message === null ? undefined : parsed.data.message?.trim() || undefined,
	});
	if (!updated) {
		return NextResponse.json({ error: "alert not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true, alert: updated });
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ alertId: string }> },
) {
	const { alertId } = await context.params;
	if (!alertId) {
		return NextResponse.json({ error: "alertId is required" }, { status: 400 });
	}
	const profileKey = request.nextUrl.searchParams.get("profileKey");
	if (!profileKey) {
		return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
	}

	const deleted = await deletePriceAlert(profileKey, alertId);
	if (!deleted) {
		return NextResponse.json({ error: "alert not found" }, { status: 404 });
	}
	return NextResponse.json({ success: true });
}
