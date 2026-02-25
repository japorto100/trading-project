import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { PROVIDER_REGISTRY } from "@/lib/providers";
import type { ProviderInfo } from "@/lib/providers/types";

const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

async function isGatewayReachable(requestId: string, userRole?: string): Promise<boolean> {
	try {
		const gatewayBaseURL = (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
		const headers: Record<string, string> = {
			Accept: "application/json",
			"X-Request-ID": requestId,
		};
		if (userRole) {
			headers["X-User-Role"] = userRole;
		}
		const response = await fetch(new URL("/health", gatewayBaseURL), {
			method: "GET",
			headers,
			cache: "no-store",
		});
		return response.ok;
	} catch {
		return false;
	}
}

function isProviderAvailableViaGateway(name: string, gatewayReachable: boolean): boolean {
	if (!gatewayReachable) return false;
	switch (name) {
		case "finnhub":
		case "ecb":
		case "fred":
		case "yfinance":
		case "demo":
			return true;
		default:
			return false;
	}
}

export async function GET(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const userRole = request.headers.get("x-user-role")?.trim() || undefined;
	try {
		const gatewayReachable = await isGatewayReachable(requestId, userRole);
		const providerStatus = Object.entries(PROVIDER_REGISTRY).map(([name, providerInfo]) => {
			const info = providerInfo as ProviderInfo;

			return {
				name,
				displayName: info.displayName,
				available: isProviderAvailableViaGateway(name, gatewayReachable),
				requiresAuth: info.requiresAuth,
				supportedAssets: info.supportedAssets,
				rateLimit: info.rateLimit,
				freePlan: info.freePlan,
				documentation: info.documentation,
			};
		});
		return withRequestIdHeader(
			NextResponse.json({
				success: true,
				providers: providerStatus,
				registry: PROVIDER_REGISTRY,
				meta: {
					gatewayReachable,
					availabilityMode: "gateway-health-heuristic",
				},
			}),
			requestId,
		);
	} catch (error: unknown) {
		console.error("Providers API Error:", error);
		return withRequestIdHeader(
			NextResponse.json(
				{ error: error instanceof Error ? error.message : "Failed to get provider status" },
				{ status: 500 },
			),
			requestId,
		);
	}
}
