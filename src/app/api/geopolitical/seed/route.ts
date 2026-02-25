import { type NextRequest, NextResponse } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export const runtime = "nodejs";

function useGoOwnedAdminSeed(): boolean {
	return (
		(process.env.GEOPOLITICAL_ADMIN_SEED_MODE ?? "next-proxy+go-sync").trim() ===
		"go-owned-gateway-v1"
	);
}

export async function POST(request: NextRequest) {
	if (!useGoOwnedAdminSeed()) {
		return NextResponse.json(
			{
				success: false,
				error:
					"GeoMap seed Next alias is post-cutover thin-proxy only. Set GEOPOLITICAL_ADMIN_SEED_MODE=go-owned-gateway-v1 in the Go gateway.",
			},
			{ status: 503 },
		);
	}
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/admin/seed", {
		method: "POST",
		copyQuery: false,
	});
}
