import { NextResponse } from "next/server";
import { getGeopoliticalSourceHealth } from "@/lib/geopolitical/source-health";

export async function GET() {
	const entries = getGeopoliticalSourceHealth();
	return NextResponse.json({
		success: true,
		checkedAt: new Date().toISOString(),
		entries,
	});
}
