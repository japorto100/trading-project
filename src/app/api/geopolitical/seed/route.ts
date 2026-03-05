import { type NextRequest, NextResponse } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

function useGoOwnedAdminSeed(): boolean {
	return (
		(process.env.GEOPOLITICAL_ADMIN_SEED_MODE ?? "next-proxy+go-sync").trim() ===
		"go-owned-gateway-v1"
	);
}

function allowDevSeedAlias(): boolean {
	const optOut = (process.env.GEOPOLITICAL_ALLOW_NEXT_SEED_ALIAS_DEV ?? "true")
		.trim()
		.toLowerCase();
	return process.env.NODE_ENV !== "production" && optOut !== "false";
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim();
	if (!useGoOwnedAdminSeed() && !allowDevSeedAlias()) {
		return NextResponse.json(
			{
				success: false,
				error:
					"GeoMap seed Next alias is post-cutover thin-proxy only. Set GEOPOLITICAL_ADMIN_SEED_MODE=go-owned-gateway-v1 in the Go gateway.",
				requestId,
				degraded: true,
				degraded_reasons: ["GO_OWNERSHIP_REQUIRED", "NEXT_ALIAS_DISABLED"],
			},
			{ status: 503, headers: requestId ? { "X-Request-ID": requestId } : undefined },
		);
	}
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/admin/seed", {
		method: "POST",
		copyQuery: false,
	});
}
