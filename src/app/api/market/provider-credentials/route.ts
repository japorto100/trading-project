import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import {
	normalizeProviderCredentialsInput,
	PROVIDER_CREDENTIALS_COOKIE,
	parseProviderCredentialsCookie,
	type StoredProviderCredentials,
	serializeProviderCredentialsCookie,
} from "@/lib/server/provider-credentials";

const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

interface ProviderCredentialMutation {
	credentials: StoredProviderCredentials;
	removeProviders: string[];
	replaceAll: boolean;
}

function resolveCookieMaxAgeSeconds(): number {
	const rawValue = Number(process.env.PROVIDER_CREDENTIALS_COOKIE_MAX_AGE_SECONDS ?? "");
	if (Number.isFinite(rawValue) && rawValue > 0) {
		return Math.floor(rawValue);
	}
	return DEFAULT_COOKIE_MAX_AGE_SECONDS;
}

function withRequestIdHeader(response: NextResponse, requestId: string): NextResponse {
	response.headers.set("X-Request-ID", requestId);
	response.headers.set("Cache-Control", "no-store");
	return response;
}

function parseMutationBody(body: unknown): ProviderCredentialMutation {
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		throw new Error("Provider credential payload must be an object");
	}

	const rawBody = body as Record<string, unknown>;
	const hasStructuredFields =
		"credentials" in rawBody || "removeProviders" in rawBody || "replaceAll" in rawBody;

	if (!hasStructuredFields) {
		return {
			credentials: normalizeProviderCredentialsInput(rawBody),
			removeProviders: [],
			replaceAll: true,
		};
	}

	const credentials =
		rawBody.credentials &&
		typeof rawBody.credentials === "object" &&
		!Array.isArray(rawBody.credentials)
			? normalizeProviderCredentialsInput(rawBody.credentials as Record<string, unknown>)
			: {};

	const removeProviders = Array.isArray(rawBody.removeProviders)
		? rawBody.removeProviders
				.filter((provider): provider is string => typeof provider === "string")
				.map((provider) => provider.trim().toLowerCase())
				.filter(Boolean)
		: [];

	return {
		credentials,
		removeProviders: [...new Set(removeProviders)],
		replaceAll: rawBody.replaceAll === true,
	};
}

function mergeProviderCredentials(
	existing: StoredProviderCredentials,
	mutation: ProviderCredentialMutation,
): StoredProviderCredentials {
	const next = mutation.replaceAll
		? { ...mutation.credentials }
		: { ...existing, ...mutation.credentials };
	for (const provider of mutation.removeProviders) {
		delete next[provider];
	}
	return next;
}

export async function POST(request: NextRequest) {
	const requestId = request.headers.get("x-request-id")?.trim() || randomUUID();
	try {
		const body = await request.json();
		const mutation = parseMutationBody(body);
		const existing = parseProviderCredentialsCookie(
			request.cookies.get(PROVIDER_CREDENTIALS_COOKIE)?.value,
		);
		const merged = mergeProviderCredentials(existing, mutation);
		const response = withRequestIdHeader(
			NextResponse.json({
				success: true,
				storedProviders: Object.keys(merged),
				removedProviders: mutation.removeProviders,
			}),
			requestId,
		);

		if (Object.keys(merged).length === 0) {
			response.cookies.set(PROVIDER_CREDENTIALS_COOKIE, "", {
				httpOnly: true,
				sameSite: "strict",
				secure: process.env.NODE_ENV === "production",
				path: "/api/market",
				maxAge: 0,
			});
			return response;
		}

		response.cookies.set(PROVIDER_CREDENTIALS_COOKIE, serializeProviderCredentialsCookie(merged), {
			httpOnly: true,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
			path: "/api/market",
			maxAge: resolveCookieMaxAgeSeconds(),
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
