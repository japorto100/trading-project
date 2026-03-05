import type { NextRequest } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export async function GET(request: NextRequest) {
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/candidates", {
		method: "GET",
		copyQuery: true,
	});
}

export async function POST(request: NextRequest) {
	const mode = request.nextUrl.searchParams.get("mode");
	if (mode === "hard") {
		return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/ingest/hard", {
			method: "POST",
			copyQuery: false,
		});
	}
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/candidates", {
		method: "POST",
		copyQuery: false,
	});
}
