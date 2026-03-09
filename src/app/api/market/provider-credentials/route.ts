import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import {
	PROVIDER_CREDENTIALS_COOKIE,
	parseProviderCredentialsCookie,
	serializeProviderCredentialsCookie,
} from "@/lib/server/provider-credentials";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	return response;
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const body = (await request.json()) as Record<string, unknown>;
		const serialized = serializeProviderCredentialsCookie(body);
		const normalized = parseProviderCredentialsCookie(serialized);
		const response = withRequestIdHeader(
			NextResponse.json({
				success: true,
				storedProviders: Object.keys(normalized),
			}),
			requestId,
		);

		if (Object.keys(normalized).length === 0) {
			response.cookies.set(PROVIDER_CREDENTIALS_COOKIE, "", {
				httpOnly: true,
				sameSite: "lax",
				secure: process.env.NODE_ENV === "production",
				path: "/api/market",
				maxAge: 0,
			});
			return response;
		}

		response.cookies.set(PROVIDER_CREDENTIALS_COOKIE, serialized, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/api/market",
			maxAge: COOKIE_MAX_AGE_SECONDS,
		});
		return response;
	} catch (error: unknown) {
		return withRequestIdHeader(
			NextResponse.json(
				{
					error: error instanceof Error ? error.message : "Failed to store provider credentials",
				},
				{ status: 400 },
			),
			requestId,
		);
	}
}
