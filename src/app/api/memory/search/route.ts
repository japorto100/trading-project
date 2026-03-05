import type { NextRequest } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export async function POST(request: NextRequest) {
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/memory/search", { method: "POST" });
}
