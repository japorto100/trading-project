import type { NextRequest, NextResponse } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export async function POST(request: NextRequest): Promise<NextResponse> {
	return proxyGeopoliticalGatewayRequest(request, "/api/v1/auth/revocations/jti", {
		method: "POST",
	});
}
