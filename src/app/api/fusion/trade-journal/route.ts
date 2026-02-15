import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import { createTradeJournalEntry, listTradeJournalEntries } from "@/lib/server/trade-journal-store";
import { getErrorMessage } from "@/lib/utils";

const createJournalSchema = z.object({
	profileKey: z.string().min(1),
	symbol: z.string().min(1),
	orderId: z.string().min(1).optional(),
	note: z.string().min(1),
	tags: z.array(z.string().min(1)).max(20).optional(),
	context: z.record(z.string(), z.unknown()).optional(),
	screenshotUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
	try {
		const profileKey = request.nextUrl.searchParams.get("profileKey");
		if (!profileKey) {
			return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
		}
		const symbolParam = request.nextUrl.searchParams.get("symbol");
		const symbol = symbolParam ? canonicalizeFusionSymbol(symbolParam) : undefined;
		const limitParam = Number(request.nextUrl.searchParams.get("limit"));
		const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 100;

		const entries = await listTradeJournalEntries(profileKey, symbol, limit);
		return NextResponse.json({ success: true, entries });
	} catch (error: unknown) {
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = createJournalSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid journal payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	try {
		const entry = await createTradeJournalEntry({
			profileKey: parsed.data.profileKey,
			symbol: canonicalizeFusionSymbol(parsed.data.symbol),
			orderId: parsed.data.orderId,
			note: parsed.data.note,
			tags: parsed.data.tags,
			context: parsed.data.context,
			screenshotUrl: parsed.data.screenshotUrl,
		});
		return NextResponse.json({ success: true, entry }, { status: 201 });
	} catch (error: unknown) {
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}
