import { cacheLife, cacheTag } from "next/cache";
import { NextResponse } from "next/server";
import { getGeopoliticalSourceHealth } from "@/lib/geopolitical/source-health";

async function getSourceHealth() {
	"use cache";
	cacheTag("geo-source-health");
	cacheLife("minutes");
	return getGeopoliticalSourceHealth();
}

export async function GET() {
	const checkedAt = new Date().toISOString();
	const entries = await getSourceHealth();
	return NextResponse.json({
		success: true,
		checkedAt,
		entries,
	});
}
