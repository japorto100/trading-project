import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

type ProviderCredentialsRouteErrorReason = "INVALID_JSON_BODY" | "INVALID_MUTATION_PAYLOAD";

class ProviderCredentialsRouteError extends Error {
	constructor(
		message: string,
		readonly reason: ProviderCredentialsRouteErrorReason,
	) {
		super(message);
		this.name = "ProviderCredentialsRouteError";
	}
}

const providerCredentialMutationSchema = z
	.object({
		credentials: z.record(z.string(), z.unknown()).optional(),
		removeProviders: z.array(z.string()).optional(),
		replaceAll: z.boolean().optional(),
	})
	.passthrough();

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
		throw new ProviderCredentialsRouteError(
			"Provider credential payload must be an object",
			"INVALID_MUTATION_PAYLOAD",
		);
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

	const parsedBody = providerCredentialMutationSchema.safeParse(rawBody);
	if (!parsedBody.success) {
		throw new ProviderCredentialsRouteError(
			"Provider credential payload has invalid structured fields",
			"INVALID_MUTATION_PAYLOAD",
		);
	}

	const credentials = parsedBody.data.credentials
		? normalizeProviderCredentialsInput(parsedBody.data.credentials)
		: {};

	const removeProviders = parsedBody.data.removeProviders
		? parsedBody.data.removeProviders
				.map((provider) => provider.trim().toLowerCase())
				.filter(Boolean)
		: [];

	return {
		credentials,
		removeProviders: [...new Set(removeProviders)],
		replaceAll: parsedBody.data.replaceAll === true,
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
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return withRequestIdHeader(
			NextResponse.json(
				{
					error: "Request body must be valid JSON",
					reason: "INVALID_JSON_BODY",
				},
				{ status: 400 },
			),
			requestId,
		);
	}

	try {
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
		if (error instanceof ProviderCredentialsRouteError) {
			return withRequestIdHeader(
				NextResponse.json(
					{
						error: error.message,
						reason: error.reason,
					},
					{ status: 400 },
				),
				requestId,
			);
		}

		return withRequestIdHeader(
			NextResponse.json(
				{
					error: error instanceof Error ? error.message : "Failed to store provider credentials",
					reason: "INVALID_MUTATION_PAYLOAD",
				},
				{ status: 400 },
			),
			requestId,
		);
	}
}
