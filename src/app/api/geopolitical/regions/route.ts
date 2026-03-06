import { cacheLife, cacheTag } from "next/cache";
import { NextResponse } from "next/server";
import { listGeoRegions } from "@/lib/server/geopolitical-regions-store";

async function getRegions() {
	"use cache";
	cacheTag("geo-regions");
	cacheLife("hours");
	return listGeoRegions();
}

export async function GET() {
	const regions = await getRegions();
	return NextResponse.json({ success: true, regions });
}
