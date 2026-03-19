import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isAuthEnabled, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";

type AppRole = "viewer" | "analyst" | "trader" | "admin";

const ALLOWED_ROLES: AppRole[] = ["viewer", "analyst", "trader", "admin"];

function noStoreJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
	const response = NextResponse.json(body, init);
	response.headers.set("Cache-Control", "no-store");
	return response;
}

function normalizeRole(value: unknown): AppRole | null {
	if (typeof value !== "string") return null;
	const normalized = value.trim().toLowerCase();
	return ALLOWED_ROLES.includes(normalized as AppRole) ? (normalized as AppRole) : null;
}

async function requireAdminSession() {
	if (!isAuthEnabled()) {
		return { ok: false as const, status: 409, error: "auth disabled" };
	}
	if (isAuthStackBypassEnabled()) {
		return {
			ok: false as const,
			status: 409,
			error: "admin role management disabled while auth bypass is enabled",
		};
	}
	const session = await auth();
	if (!session?.user?.id) {
		return { ok: false as const, status: 401, error: "unauthorized" };
	}
	if (normalizeRole(session.user.role) !== "admin") {
		return { ok: false as const, status: 403, error: "forbidden" };
	}
	return { ok: true as const, session };
}

function gatewayBaseUrl() {
	return process.env.GO_GATEWAY_BASE_URL?.trim() || null;
}

export async function GET(request: Request) {
	const gate = await requireAdminSession();
	if (!gate.ok) return noStoreJson({ error: gate.error }, { status: gate.status });

	const gatewayUrl = gatewayBaseUrl();
	if (!gatewayUrl) {
		return noStoreJson({ error: "gateway unavailable" }, { status: 503 });
	}

	const url = new URL(request.url);
	const q = (url.searchParams.get("q") ?? "").trim();
	const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
	const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 100;

	const response = await fetch(
		`${gatewayUrl}/api/v1/admin/users?q=${encodeURIComponent(q)}&limit=${limit}`,
		{
			cache: "no-store",
			headers: {
				"x-auth-user-id": gate.session.user.id ?? "",
				"x-auth-user-email": gate.session.user.email ?? "",
				"x-auth-user-role": normalizeRole(gate.session.user.role) ?? "viewer",
			},
		},
	);
	const payload = await response.json();
	return noStoreJson(payload, { status: response.status });
}

export async function PATCH(request: Request) {
	const gate = await requireAdminSession();
	if (!gate.ok) return noStoreJson({ error: gate.error }, { status: gate.status });

	const gatewayUrl = gatewayBaseUrl();
	if (!gatewayUrl) {
		return noStoreJson({ error: "gateway unavailable" }, { status: 503 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return noStoreJson({ error: "invalid json body" }, { status: 400 });
	}
	if (!body || typeof body !== "object") {
		return noStoreJson({ error: "invalid body" }, { status: 400 });
	}
	const payload = body as Record<string, unknown>;
	const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
	const role = normalizeRole(payload.role);
	if (!userId) return noStoreJson({ error: "userId is required" }, { status: 400 });
	if (!role) {
		return noStoreJson(
			{ error: "role must be one of viewer|analyst|trader|admin" },
			{ status: 400 },
		);
	}

	const response = await fetch(`${gatewayUrl}/api/v1/admin/users`, {
		method: "PATCH",
		cache: "no-store",
		headers: {
			"content-type": "application/json",
			"x-auth-user-id": gate.session.user.id ?? "",
			"x-auth-user-email": gate.session.user.email ?? "",
			"x-auth-user-role": normalizeRole(gate.session.user.role) ?? "viewer",
		},
		body: JSON.stringify({ userId, role }),
	});
	const responsePayload = await response.json();
	return noStoreJson(responsePayload, { status: response.status });
}
