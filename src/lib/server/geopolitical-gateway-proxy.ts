import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

const DEFAULT_GATEWAY_BASE_URL = "http://127.0.0.1:9060";

type ProxyOptions = {
	method?: string;
	copyQuery?: boolean;
};

function buildGatewayBaseURL(): string {
	return (process.env.GO_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL).trim();
}

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	response.headers.set("X-GeoMap-Next-Route", "thin-proxy");
	return response;
}

export async function proxyGeopoliticalGatewayRequest(
	request: NextRequest,
	upstreamPath: string,
	options: ProxyOptions = {},
): Promise<NextResponse> {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	const gatewayURL = new URL(upstreamPath, buildGatewayBaseURL());
	if (options.copyQuery !== false) {
		for (const [key, value] of request.nextUrl.searchParams.entries()) {
			gatewayURL.searchParams.append(key, value);
		}
	}

	const method = options.method ?? request.method;
	const headers = new Headers();
	headers.set("Accept", "application/json");
	headers.set("X-Request-ID", requestId);

	const passthroughHeaderNames = [
		"x-user-role",
		"x-auth-user",
		"x-geo-actor",
		"authorization",
		"content-type",
	];
	for (const headerName of passthroughHeaderNames) {
		const value = request.headers.get(headerName);
		if (value?.trim()) {
			headers.set(headerName, value);
		}
	}

	let body: BodyInit | undefined;
	if (method !== "GET" && method !== "HEAD") {
		const raw = await request.arrayBuffer();
		body = raw.byteLength > 0 ? raw : undefined;
	}

	try {
		const upstream = await fetch(gatewayURL.toString(), {
			method,
			headers,
			body,
			cache: "no-store",
		});
		const payload = await upstream.arrayBuffer();
		const response = new NextResponse(payload, {
			status: upstream.status,
			headers: {
				"Content-Type": upstream.headers.get("content-type") || "application/json",
			},
		});
		return withRequestIdHeader(response, requestId);
	} catch (error) {
		return withRequestIdHeader(
			NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "gateway proxy failed",
				},
				{ status: 502 },
			),
			requestId,
		);
	}
}
