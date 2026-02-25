import type { NextRequest } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/geopolitical/timeline", {
		method: "GET",
		copyQuery: true,
	});
}
