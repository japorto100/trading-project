import { type NextRequest, NextResponse } from "next/server";
import { fetchMarketNews } from "@/lib/news/aggregator";
import { listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import { listGeoRegions } from "@/lib/server/geopolitical-regions-store";

export async function GET(request: NextRequest) {
	try {
		const region = request.nextUrl.searchParams.get("region") ?? "";
		const q = request.nextUrl.searchParams.get("q") ?? undefined;
		const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "20");
		const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(60, limitRaw)) : 20;

		const regions = await listGeoRegions();
		const matchedRegion = regions.find((entry) => entry.id === region);
		const query =
			q ??
			(matchedRegion
				? `${matchedRegion.label} geopolitics sanctions rates conflict`
				: "global geopolitics sanctions central bank conflict");

		const news = await fetchMarketNews({
			q: query,
			limit,
			forceRefresh: request.nextUrl.searchParams.get("refresh") === "1",
		});

		const openCandidates = await listGeoCandidates({
			state: "open",
			regionHint: region || undefined,
		});

		return NextResponse.json({
			success: true,
			region: matchedRegion ?? null,
			query: news.query,
			providers: news.providers,
			total: news.total,
			articles: news.articles,
			candidateCount: openCandidates.length,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to fetch geopolitical news",
			},
			{ status: 500 },
		);
	}
}
