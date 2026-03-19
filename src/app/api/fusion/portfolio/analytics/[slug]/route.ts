import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getGatewayBaseURL } from "@/lib/server/gateway";
import { getErrorMessage } from "@/lib/utils";

const ALLOWED_SLUGS = new Set([
	"correlations",
	"rolling-metrics",
	"drawdown-analysis",
	"optimize",
	// Phase 13
	"kelly-allocation",
	"regime-sizing",
	"monte-carlo-var",
	"risk-warning",
]);

const EXPERIMENTAL_SLUGS = new Set([
	"optimize",
	"kelly-allocation",
	"regime-sizing",
	"monte-carlo-var",
	"risk-warning",
]);

function resolveBackendSlug(slug: string): string {
	return slug;
}

function slugScope(slug: string): "production" | "experimental" {
	if (EXPERIMENTAL_SLUGS.has(slug)) return "experimental";
	return "production";
}

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
		const url = `${getGatewayBaseURL()}/api/v1/portfolio/${resolveBackendSlug(slug)}`;

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
				{
					success: false,
					error: `Analytics backend error (${response.status})`,
					detail: text,
					requestId,
					degraded: true,
					degraded_reasons: ["ANALYTICS_BACKEND_ERROR"],
					schema_version: "1.0",
					feature_scope: slugScope(slug),
				},
				{ status: response.status, headers: { "X-Request-ID": requestId } },
			);
		}

		const payload = (await response.json()) as unknown;
		const enhancedPayload =
			payload && typeof payload === "object" && !Array.isArray(payload)
				? {
						...payload,
						requestId,
						degraded: false,
						degraded_reasons: [],
						schema_version: "1.0",
						feature_scope: slugScope(slug),
					}
				: {
						success: true,
						data: payload,
						requestId,
						degraded: false,
						degraded_reasons: [],
						schema_version: "1.0",
						feature_scope: slugScope(slug),
					};
		return NextResponse.json(enhancedPayload, {
			headers: { "X-Request-ID": requestId },
		});
	} catch (err: unknown) {
		return NextResponse.json(
			{
				success: false,
				error: getErrorMessage(err),
				requestId,
				degraded: true,
				degraded_reasons: ["ANALYTICS_PROXY_ERROR"],
				schema_version: "1.0",
				feature_scope: slugScope(slug),
			},
			{ status: 502, headers: { "X-Request-ID": requestId } },
		);
	}
}
