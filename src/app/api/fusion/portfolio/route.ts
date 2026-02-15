import { type NextRequest, NextResponse } from "next/server";
import { buildPortfolioSnapshotForProfile } from "@/lib/orders/snapshot-service";
import { savePortfolioSnapshot } from "@/lib/server/portfolio-history-store";
import { getErrorMessage } from "@/lib/utils";

export async function GET(request: NextRequest) {
	try {
		const profileKey = request.nextUrl.searchParams.get("profileKey");
		if (!profileKey) {
			return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
		}

		const { snapshot, prices } = await buildPortfolioSnapshotForProfile(profileKey);
		const persistFlag = request.nextUrl.searchParams.get("persist");
		const shouldPersist = persistFlag === "1" || persistFlag === "true";

		if (!shouldPersist) {
			return NextResponse.json({ success: true, snapshot, prices });
		}

		const stored = await savePortfolioSnapshot(profileKey, snapshot);
		return NextResponse.json({ success: true, snapshot, prices, stored });
	} catch (error) {
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}
