import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthBypassRole, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";

interface JsonError {
	error: string;
	details?: string;
}

function noStoreJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
	const response = NextResponse.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
}

async function resolveCurrentUser() {
	if (isAuthStackBypassEnabled()) {
		return {
			bypass: true as const,
			user: {
				id: "auth-bypass-test-user",
				email: "auth-bypass-test-user@local",
				role: getAuthBypassRole(),
			},
		};
	}

	const session = await auth();
	if (!session?.user) {
		return {
			errorResponse: noStoreJson({ error: "unauthorized" } satisfies JsonError, { status: 401 }),
		};
	}

	const userId = typeof session.user.id === "string" ? session.user.id.trim() : "";
	const email =
		typeof session.user.email === "string" ? session.user.email.trim().toLowerCase() : "";
	if (!userId && !email) {
		return {
			errorResponse: noStoreJson({ error: "session missing user identity" } satisfies JsonError, {
				status: 401,
			}),
		};
	}
	return { user: { id: userId, email, role: session.user.role ?? null } };
}

function getGoGatewayUrl(): string {
	return process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
}

async function proxyGoPasskeyDevices(
	method: "GET" | "DELETE",
	user: { id: string; email: string; role: string | null | undefined },
	body?: Record<string, unknown>,
) {
	const response = await fetch(`${getGoGatewayUrl()}/api/v1/auth/passkeys/devices`, {
		method,
		headers: {
			"Content-Type": "application/json",
			"X-Auth-User-Id": user.id,
			"X-Auth-User-Email": user.email,
			"X-Auth-User-Role": typeof user.role === "string" ? user.role : "",
		},
		body: body ? JSON.stringify(body) : undefined,
		cache: "no-store",
	});
	const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
	return noStoreJson(payload, { status: response.status });
}

export async function GET() {
	const resolved = await resolveCurrentUser();
	if ("errorResponse" in resolved) return resolved.errorResponse;
	if ("bypass" in resolved) {
		return noStoreJson({
			user: resolved.user,
			items: [],
			total: 0,
			bypass: true,
		});
	}

	return proxyGoPasskeyDevices("GET", resolved.user);
}

export async function DELETE(request: Request) {
	const resolved = await resolveCurrentUser();
	if ("errorResponse" in resolved) return resolved.errorResponse;
	if ("bypass" in resolved) {
		return noStoreJson(
			{
				error: "passkey device deletion disabled in auth bypass mode",
				details: "Disable AUTH_STACK_BYPASS/NEXT_PUBLIC_AUTH_STACK_BYPASS to mutate devices.",
				bypass: true,
			},
			{ status: 409 },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return noStoreJson({ error: "invalid json body" } satisfies JsonError, { status: 400 });
	}
	if (!body || typeof body !== "object") {
		return noStoreJson({ error: "invalid body" } satisfies JsonError, { status: 400 });
	}
	const candidate = body as Record<string, unknown>;
	const rawAuthenticatorId = candidate.authenticatorId;
	const authenticatorId = typeof rawAuthenticatorId === "string" ? rawAuthenticatorId.trim() : "";
	if (!authenticatorId) {
		return noStoreJson({ error: "authenticatorId is required" } satisfies JsonError, {
			status: 400,
		});
	}

	return proxyGoPasskeyDevices("DELETE", resolved.user, { authenticatorId });
}
