import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getGatewayBaseURL } from "@/lib/server/gateway";

type ProxyOptions = {
	method?: string;
	copyQuery?: boolean;
};

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
	const gatewayURL = new URL(upstreamPath, getGatewayBaseURL());
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
		const contentType = upstream.headers.get("content-type") || "application/json";
		if (contentType.includes("application/json")) {
			try {
				const rawText = new TextDecoder().decode(payload);
				const parsed = JSON.parse(rawText) as unknown;
				if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
					const enriched = {
						...parsed,
						requestId:
							(parsed as { requestId?: unknown }).requestId &&
							typeof (parsed as { requestId?: unknown }).requestId === "string"
								? (parsed as { requestId: string }).requestId
								: requestId,
						degraded:
							typeof (parsed as { degraded?: unknown }).degraded === "boolean"
								? (parsed as { degraded: boolean }).degraded
								: false,
						degraded_reasons: Array.isArray(
							(parsed as { degraded_reasons?: unknown }).degraded_reasons,
						)
							? (parsed as { degraded_reasons: string[] }).degraded_reasons
							: [],
					};
					return withRequestIdHeader(
						NextResponse.json(enriched, {
							status: upstream.status,
							headers: { "Content-Type": contentType },
						}),
						requestId,
					);
				}
			} catch {
				// Fall back to pass-through below when payload is not valid JSON.
			}
		}
		const response = new NextResponse(payload, {
			status: upstream.status,
			headers: { "Content-Type": contentType },
		});
		return withRequestIdHeader(response, requestId);
	} catch (error) {
		return withRequestIdHeader(
			NextResponse.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "gateway proxy failed",
					requestId,
					degraded: true,
					degraded_reasons: ["GO_GATEWAY_UNAVAILABLE"],
				},
				{ status: 502 },
			),
			requestId,
		);
	}
}
