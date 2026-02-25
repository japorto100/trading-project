import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import { listGeoRegions } from "@/lib/server/geopolitical-regions-store";

const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

interface GatewayHeadline {
	title: string;
	url: string;
	source: string;
	publishedAt: string;
	summary?: string;
}

interface GatewayNewsResponse {
	success?: boolean;
	data?: {
		query?: string;
		lang?: string;
		items?: GatewayHeadline[];
	};
	error?: string;
}

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

async function fetchGeoNewsViaGateway(input: {
	q: string;
	limit: number;
	lang?: string;
	requestId: string;
	userRole?: string;
}): Promise<{
	query: string;
	total: number;
	providers: Array<{ provider: "gnews"; ok: true; count: number }>;
	articles: Array<{
		id: string;
		provider: "gnews";
		source: string;
		title: string;
		url: string;
		publishedAt: string;
		summary?: string;
	}>;
} | null> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const endpoint = new URL("/api/v1/news/headlines", gatewayBaseURL);
	endpoint.searchParams.set("q", input.q);
	endpoint.searchParams.set("limit", String(input.limit));
	if (input.lang) endpoint.searchParams.set("lang", input.lang);

	const headers: Record<string, string> = {
		Accept: "application/json",
		"X-Request-ID": input.requestId,
	};
	if (input.userRole) {
		headers["X-User-Role"] = input.userRole;
	}

	const response = await fetch(endpoint.toString(), {
		method: "GET",
		headers,
		cache: "no-store",
	});
	if (!response.ok) return null;

	const payload = (await response.json()) as GatewayNewsResponse;
	if (!payload.success || !payload.data || !Array.isArray(payload.data.items)) {
		return null;
	}

	const articles = payload.data.items.map((item, index) => ({
		id: `go-geo-news-${index}-${item.url}`,
		provider: "gnews" as const,
		source: item.source || "go-gateway",
		title: item.title,
		url: item.url,
		publishedAt: item.publishedAt || new Date().toISOString(),
		summary: item.summary,
	}));

	return {
		query: payload.data.query || input.q,
		total: articles.length,
		providers: [{ provider: "gnews", ok: true, count: articles.length }],
		articles,
	};
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	try {
		const region = request.nextUrl.searchParams.get("region") ?? "";
		const q = request.nextUrl.searchParams.get("q") ?? undefined;
		const lang = request.nextUrl.searchParams.get("lang") ?? undefined;
		const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? "20");
		const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(60, limitRaw)) : 20;

		const regions = await listGeoRegions();
		const matchedRegion = regions.find((entry) => entry.id === region);
		const query =
			q ??
			(matchedRegion
				? `${matchedRegion.label} geopolitics sanctions rates conflict`
				: "global geopolitics sanctions central bank conflict");

		// `refresh=1` remains accepted for backward compatibility; source fetching is Go-only.
		void request.nextUrl.searchParams.get("refresh");

		const news = await fetchGeoNewsViaGateway({
			q: query,
			limit,
			lang,
			requestId,
			userRole,
		});
		if (!news) {
			return withRequestIdHeader(
				NextResponse.json(
					{
						success: false,
						error: "Gateway news request failed",
					},
					{ status: 502 },
				),
				requestId,
			);
		}

		const openCandidates = await listGeoCandidates({
			state: "open",
			regionHint: region || undefined,
		});

		return withRequestIdHeader(
			NextResponse.json({
				success: true,
				region: matchedRegion ?? null,
				query: news.query,
				providers: news.providers,
				total: news.total,
				articles: news.articles,
				candidateCount: openCandidates.length,
			}),
			requestId,
		);
	} catch (error) {
		return withRequestIdHeader(
			NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Failed to fetch geopolitical news",
				},
				{ status: 500 },
			),
			requestId,
		);
	}
}
