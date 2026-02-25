import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/utils";

const GO_GATEWAY_BASE = process.env.GO_GATEWAY_BASE_URL ?? "http://127.0.0.1:9060";

const ALLOWED_SLUGS = new Set(["correlations", "rolling-metrics", "drawdown-analysis"]);

/**
 * POST /api/fusion/portfolio/analytics/[slug]
 *
 * Phase 5b: Proxies to Go → Python indicator-service:
 *   correlations      → /api/v1/portfolio/correlations
 *   rolling-metrics   → /api/v1/portfolio/rolling-metrics
 *   drawdown-analysis → /api/v1/portfolio/drawdown-analysis
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();

	if (!ALLOWED_SLUGS.has(slug)) {
		return NextResponse.json(
			{ error: `Unknown analytics endpoint: ${slug}` },
			{ status: 404, headers: { "X-Request-ID": requestId } },
		);
	}

	try {
		const body = await request.text();
		const url = `${GO_GATEWAY_BASE}/api/v1/portfolio/${slug}`;

		const headers: HeadersInit = {
			"Content-Type": "application/json",
			Accept: "application/json",
			"X-Request-ID": requestId,
		};

		const userRole = request.headers.get("x-user-role");
		if (userRole) headers["X-User-Role"] = userRole;

		const response = await fetch(url, {
			method: "POST",
			headers,
			body,
			cache: "no-store",
			signal: AbortSignal.timeout(30_000),
		});

		if (!response.ok) {
			const text = await response.text().catch(() => "");
			return NextResponse.json(
				{ error: `Analytics backend error (${response.status})`, detail: text },
				{ status: response.status, headers: { "X-Request-ID": requestId } },
			);
		}

		const payload = (await response.json()) as unknown;
		return NextResponse.json(payload, {
			headers: { "X-Request-ID": requestId },
		});
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: getErrorMessage(err) },
			{ status: 502, headers: { "X-Request-ID": requestId } },
		);
	}
}
