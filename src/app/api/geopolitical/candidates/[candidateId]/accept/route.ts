import type { NextRequest } from "next/server";
import { proxyGeopoliticalGatewayRequest } from "@/lib/server/geopolitical-gateway-proxy";

export const runtime = "nodejs";

interface ParamsShape {
	params: Promise<{ candidateId: string }>;
}

export async function POST(request: NextRequest, context: ParamsShape) {
	const { candidateId } = await context.params;
	return proxyGeopoliticalGatewayRequest(
		request,
		`/api/v1/geopolitical/candidates/${candidateId}/accept`,
		{ method: "POST", copyQuery: false },
	);
}
