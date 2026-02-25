import { type NextRequest, NextResponse } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export const runtime = "nodejs";

function useGoOwnedSoftIngest(): boolean {
	return (
		(process.env.GEOPOLITICAL_INGEST_SOFT_MODE ?? "next-proxy").trim() === "go-owned-gateway-v1"
	);
}

export async function POST(request: NextRequest) {
	if (!useGoOwnedSoftIngest()) {
		return NextResponse.json(
			{
				success: false,
				error:
					"GeoMap soft-ingest Next alias is post-cutover thin-proxy only. Set GEOPOLITICAL_INGEST_SOFT_MODE=go-owned-gateway-v1 in the Go gateway.",
			},
			{ status: 503 },
		);
	}
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/ingest/soft", {
		method: "POST",
		copyQuery: false,
	});
}
