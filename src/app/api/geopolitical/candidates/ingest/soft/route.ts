import { type NextRequest, NextResponse } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

function useGoOwnedSoftIngest(): boolean {
	return (
		(process.env.GEOPOLITICAL_INGEST_SOFT_MODE ?? "next-proxy").trim() === "go-owned-gateway-v1"
	);
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim();
	if (!useGoOwnedSoftIngest()) {
		return NextResponse.json(
			{
				success: false,
				error:
					"GeoMap soft-ingest Next alias is post-cutover thin-proxy only. Set GEOPOLITICAL_INGEST_SOFT_MODE=go-owned-gateway-v1 in the Go gateway.",
				requestId,
				degraded: true,
				degraded_reasons: ["GO_OWNERSHIP_REQUIRED", "NEXT_ALIAS_DISABLED"],
			},
			{ status: 503, headers: requestId ? { "X-Request-ID": requestId } : undefined },
		);
	}
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/ingest/soft", {
		method: "POST",
		copyQuery: false,
	});
}
