import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildPortfolioSnapshotForProfile } from "@/lib/orders/snapshot-service";
import {
	listPortfolioSnapshots,
	savePortfolioSnapshot,
} from "@/lib/server/portfolio-history-store";
import { getErrorMessage } from "@/lib/utils";

const createHistorySchema = z.object({
	profileKey: z.string().min(1),
});

export async function GET(request: NextRequest) {
	try {
		const profileKey = request.nextUrl.searchParams.get("profileKey");
		if (!profileKey) {
			return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
		}
		const limitParam = Number(request.nextUrl.searchParams.get("limit"));
		const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 50;
		const entries = await listPortfolioSnapshots(profileKey, limit);
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

	const parsed = createHistorySchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	try {
		const { snapshot, prices } = await buildPortfolioSnapshotForProfile(parsed.data.profileKey);
		const stored = await savePortfolioSnapshot(parsed.data.profileKey, snapshot);
		return NextResponse.json(
			{
				success: true,
				stored,
				snapshot,
				prices,
			},
			{ status: 201 },
		);
	} catch (error: unknown) {
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}
