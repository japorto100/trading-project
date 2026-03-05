import { type NextRequest, NextResponse } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

function useGoOwnedHardIngest(): boolean {
	return (
		(process.env.GEOPOLITICAL_INGEST_HARD_MODE ?? "next-proxy").trim() === "go-owned-gateway-v1"
	);
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim();
	if (!useGoOwnedHardIngest()) {
		return NextResponse.json(
			{
				success: false,
				error:
					"GeoMap hard-ingest Next alias is post-cutover thin-proxy only. Set GEOPOLITICAL_INGEST_HARD_MODE=go-owned-gateway-v1 in the Go gateway.",
				requestId,
				degraded: true,
				degraded_reasons: ["GO_OWNERSHIP_REQUIRED", "NEXT_ALIAS_DISABLED"],
			},
			{ status: 503, headers: requestId ? { "X-Request-ID": requestId } : undefined },
		);
	}
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/ingest/hard", {
		method: "POST",
		copyQuery: false,
	});
}
