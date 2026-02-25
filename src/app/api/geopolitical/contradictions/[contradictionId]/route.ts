import type { NextRequest } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export const runtime = "nodejs";

interface ParamsShape {
	params: Promise<{ contradictionId: string }>;
}

export async function GET(_request: NextRequest, context: ParamsShape) {
	const { contradictionId } = await context.params;
	return proxyGeopoliticalGatewayRequest(
		_request,
		`/api/v1/geopolitical/contradictions/${contradictionId}`,
		{ method: "GET", copyQuery: false },
	);
}

export async function PATCH(request: NextRequest, context: ParamsShape) {
	const { contradictionId } = await context.params;
	return proxyGeopoliticalGatewayRequest(
		request,
		`/api/v1/geopolitical/contradictions/${contradictionId}`,
		{ method: "PATCH", copyQuery: false },
	);
}
