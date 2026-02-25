import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { NEWS_SOURCES } from "@/lib/news/sources";
import type { MarketNewsResponse } from "@/lib/news/types";

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
		symbol?: string;
		items?: GatewayHeadline[];
	};
	error?: string;
}

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

async function fetchNewsViaGateway(
	symbol: string | undefined,
	q: string | undefined,
	lang: string | undefined,
	limit: number | undefined,
	requestId: string,
	userRole?: string,
): Promise<MarketNewsResponse | null> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const endpoint = new URL("/api/v1/news/headlines", gatewayBaseURL);
	if (symbol) endpoint.searchParams.set("symbol", symbol);
	if (q) endpoint.searchParams.set("q", q);
	if (lang) endpoint.searchParams.set("lang", lang);
	if (Number.isFinite(limit)) endpoint.searchParams.set("limit", String(limit));

	const headers: Record<string, string> = {
		Accept: "application/json",
		"X-Request-ID": requestId,
	};
	if (userRole) {
		headers["X-User-Role"] = userRole;
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
		id: `go-news-${index}-${item.url}`,
		// Runtime payload is UI-only; provider ids will be normalized in a later Phase 21 Zod cleanup.
		provider: "gnews" as const,
		source: item.source || "go-gateway",
		title: item.title,
		url: item.url,
		publishedAt: item.publishedAt || new Date().toISOString(),
		summary: item.summary,
	}));

	return {
		success: true,
		query: symbol || "market news",
		symbol,
		fetchedAt: new Date().toISOString(),
		total: articles.length,
		providers: [{ provider: "gnews", ok: true, count: articles.length }],
		articles,
	};
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	try {
		const url = request.nextUrl;
		const symbol = url.searchParams.get("symbol") || undefined;
		const q = url.searchParams.get("q") || undefined;
		const lang = url.searchParams.get("lang") || undefined;
		const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
		// `refresh=1` remains accepted for backward compatibility, but fetching is Go-only now.
		void url.searchParams.get("refresh");

		const news = await fetchNewsViaGateway(symbol, q, lang, limit, requestId, userRole);
		if (!news) {
			return withRequestIdHeader(
				NextResponse.json(
					{
						success: false,
						error: "Gateway news request failed",
						sources: NEWS_SOURCES,
					},
					{ status: 502 },
				),
				requestId,
			);
		}

		return withRequestIdHeader(
			NextResponse.json({
				...news,
				sources: NEWS_SOURCES,
			}),
			requestId,
		);
	} catch (error) {
		return withRequestIdHeader(
			NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Failed to fetch news",
					sources: NEWS_SOURCES,
				},
				{ status: 500 },
			),
			requestId,
		);
	}
}
