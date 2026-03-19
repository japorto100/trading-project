import { NextResponse } from "next/server";
import { isAuthEnabled, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";
import { hashPassword, validateNewPassword } from "@/lib/server/auth-password";

type JsonError = { error: string; details?: string; bypass?: boolean };

function noStoreJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
	const response = NextResponse.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
}

function normalizeEmail(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const email = value.trim().toLowerCase();
	if (!email || !email.includes("@")) return null;
	return email.slice(0, 320);
}

function normalizeName(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const name = value.trim();
	return name ? name.slice(0, 80) : null;
}

function normalizeUsername(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const username = value.trim().toLowerCase();
	if (!username) return null;
	// SOTA 2026: Strict username alphanumeric check
	return username.replace(/[^a-z0-9_-]/g, "").slice(0, 40);
}

function getGoGatewayUrl(): string {
	return process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
}

export async function POST(request: Request) {
	if (!isAuthEnabled()) {
		return noStoreJson(
			{
				error: isAuthStackBypassEnabled()
					? "registration disabled while auth bypass is enabled"
					: "registration disabled while auth is off",
				...(isAuthStackBypassEnabled() ? { bypass: true } : {}),
			} satisfies JsonError,
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

	const payload = body as Record<string, unknown>;
	const email = normalizeEmail(payload.email);
	const username = normalizeUsername(payload.username);
	const name = normalizeName(payload.name ?? payload.displayName);
	const password = typeof payload.password === "string" ? payload.password : "";

	if (!email) {
		return noStoreJson({ error: "email is required" } satisfies JsonError, { status: 400 });
	}
	if (!username) {
		return noStoreJson({ error: "username is required" } satisfies JsonError, { status: 400 });
	}
	const passwordValidation = validateNewPassword(password);
	if (!passwordValidation.ok) {
		return noStoreJson({ error: passwordValidation.error } satisfies JsonError, { status: 400 });
	}

	let recoveryCodes: string[] = [];

	try {
		recoveryCodes = Array.from({ length: 8 }, () =>
			crypto.randomUUID().split("-")[0].toUpperCase(),
		);
		const response = await fetch(`${getGoGatewayUrl()}/api/v1/auth/owner/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email,
				username,
				name: name ?? username,
				role: (process.env.AUTH_DEFAULT_ROLE ?? "viewer").trim() || "viewer",
				passwordHash: hashPassword(password),
				recoveryCodes,
			}),
			cache: "no-store",
		});
		const payload = (await response.json().catch(() => ({}))) as {
			error?: string;
			user?: {
				id: string;
				email: string | null;
				name: string | null;
				role: string;
				createdAt: string;
			};
		};
		if (!response.ok || !payload.user) {
			return noStoreJson(
				{ error: payload.error || `registration failed (${response.status})` } satisfies JsonError,
				{ status: response.status >= 400 ? response.status : 500 },
			);
		}
		return noStoreJson(
			{
				created: true,
				user: payload.user,
				recoveryCodes,
				nextStep: "sign-in",
			},
			{ status: 201 },
		);
	} catch (error: unknown) {
		const details = error instanceof Error ? error.message : "unknown registration error";
		return noStoreJson({ error: "registration failed", details } satisfies JsonError, {
			status: 500,
		});
	}
}
