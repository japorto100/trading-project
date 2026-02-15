import { NextResponse } from "next/server";
import { listGeoRegions } from "@/lib/server/geopolitical-regions-store";

export async function GET() {
	const regions = await listGeoRegions();
	return NextResponse.json({ success: true, regions });
}
