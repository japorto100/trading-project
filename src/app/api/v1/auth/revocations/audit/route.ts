import type { NextRequest, NextResponse } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export async function GET(request: NextRequest): Promise<NextResponse> {
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/auth/revocations/audit", {
		method: "GET",
	});
}
