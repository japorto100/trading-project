import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

interface GatewaySearchResponse {
	success?: boolean;
	query?: string;
	count?: number;
	results?: unknown[];
	error?: string;
}

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

async function searchViaGateway(
	query: string,
	requestId: string,
	userRole?: string,
): Promise<{ query: string; count: number; results: unknown[] } | null> {
	const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
	const endpoint = new URL("/api/v1/search", gatewayBaseURL);
	endpoint.searchParams.set("q", query);

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

	const payload = (await response.json()) as GatewaySearchResponse;
	if (!payload.success || !Array.isArray(payload.results)) {
		return null;
	}
	return {
		query: payload.query || query,
		count: typeof payload.count === "number" ? payload.count : payload.results.length,
		results: payload.results,
	};
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get("q");

		if (!query || query.length < 1) {
			return withRequestIdHeader(
				NextResponse.json(
					{ error: 'Query parameter "q" is required (min 1 character)' },
					{ status: 400 },
				),
				requestId,
			);
		}

		const gatewayResult = await searchViaGateway(query, requestId, userRole);
		if (!gatewayResult) {
			return withRequestIdHeader(
				NextResponse.json({ error: "Gateway search request failed" }, { status: 502 }),
				requestId,
			);
		}

		return withRequestIdHeader(
			NextResponse.json({
				success: true,
				query: gatewayResult.query,
				count: gatewayResult.count,
				results: gatewayResult.results,
			}),
			requestId,
		);
	} catch (error: unknown) {
		console.error("Search API Error:", error);
		return withRequestIdHeader(
			NextResponse.json(
				{ error: error instanceof Error ? error.message : "Failed to search symbols" },
				{ status: 500 },
			),
			requestId,
		);
	}
}
