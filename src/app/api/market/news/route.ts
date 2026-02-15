import { NextResponse } from "next/server";
import { fetchMarketNews } from "@/lib/news/aggregator";
import { NEWS_SOURCES } from "@/lib/news/sources";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const symbol = url.searchParams.get("symbol") || undefined;
		const q = url.searchParams.get("q") || undefined;
		const lang = url.searchParams.get("lang") || undefined;
		const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
		const forceRefresh = url.searchParams.get("refresh") === "1";

		const news = await fetchMarketNews({
			symbol,
			q,
			lang,
			limit,
			forceRefresh,
		});

		return NextResponse.json({
			...news,
			sources: NEWS_SOURCES,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to fetch news",
				sources: NEWS_SOURCES,
			},
			{ status: 500 },
		);
	}
}
