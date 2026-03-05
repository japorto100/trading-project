import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAuthEnabled, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";
import { getPrismaClient } from "@/lib/server/prisma";

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

export async function GET(request: Request) {
	const gate = await requireAdminSession();
	if (!gate.ok) return noStoreJson({ error: gate.error }, { status: gate.status });

	const prisma = getPrismaClient();
	if (!prisma) {
		return noStoreJson({ error: "database unavailable" }, { status: 503 });
	}

	const url = new URL(request.url);
	const q = (url.searchParams.get("q") ?? "").trim();
	const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
	const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 100;

	const users = await prisma.user.findMany({
		where: q
			? {
					OR: [{ email: { contains: q } }, { name: { contains: q } }],
				}
			: undefined,
		orderBy: [{ createdAt: "desc" }],
		take: limit,
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	return noStoreJson({
		actor: {
			id: gate.session.user.id,
			email: gate.session.user.email ?? null,
			role: normalizeRole(gate.session.user.role) ?? "viewer",
		},
		total: users.length,
		items: users.map((user) => ({
			id: user.id,
			email: user.email,
			name: user.name,
			role: normalizeRole(user.role) ?? "viewer",
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		})),
	});
}

export async function PATCH(request: Request) {
	const gate = await requireAdminSession();
	if (!gate.ok) return noStoreJson({ error: gate.error }, { status: gate.status });

	const prisma = getPrismaClient();
	if (!prisma) {
		return noStoreJson({ error: "database unavailable" }, { status: 503 });
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
	if (!role)
		return noStoreJson(
			{ error: "role must be one of viewer|analyst|trader|admin" },
			{ status: 400 },
		);

	const target = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, email: true, name: true, role: true },
	});
	if (!target) return noStoreJson({ error: "user not found" }, { status: 404 });

	const currentTargetRole = normalizeRole(target.role) ?? "viewer";
	if (target.id === gate.session.user.id && currentTargetRole === "admin" && role !== "admin") {
		const otherAdmins = await prisma.user.count({
			where: {
				role: "admin",
				id: { not: target.id },
			},
		});
		if (otherAdmins < 1) {
			return noStoreJson(
				{ error: "cannot remove the last admin role from your own account" },
				{ status: 409 },
			);
		}
	}

	const updated = await prisma.user.update({
		where: { id: target.id },
		data: { role },
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			updatedAt: true,
		},
	});

	console.info("[auth-admin] role-updated", {
		actorUserId: gate.session.user.id,
		targetUserId: updated.id,
		targetEmail: updated.email,
		previousRole: currentTargetRole,
		newRole: role,
	});

	return noStoreJson({
		updated: {
			id: updated.id,
			email: updated.email,
			name: updated.name,
			role: normalizeRole(updated.role) ?? "viewer",
			updatedAt: updated.updatedAt.toISOString(),
		},
	});
}
