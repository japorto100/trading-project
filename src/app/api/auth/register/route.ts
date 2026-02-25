import { NextResponse } from "next/server";
import { isAuthEnabled, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";
import { hashPassword, validateNewPassword } from "@/lib/server/auth-password";
import { getPrismaClient } from "@/lib/server/prisma";

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

	const prisma = getPrismaClient();
	if (!prisma) {
		return noStoreJson({ error: "database unavailable" } satisfies JsonError, { status: 503 });
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
	const name = normalizeName(payload.name ?? payload.displayName);
	const password = typeof payload.password === "string" ? payload.password : "";

	if (!email) {
		return noStoreJson({ error: "email is required" } satisfies JsonError, { status: 400 });
	}
	const passwordValidation = validateNewPassword(password);
	if (!passwordValidation.ok) {
		return noStoreJson({ error: passwordValidation.error } satisfies JsonError, { status: 400 });
	}

	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		return noStoreJson({ error: "email already registered" } satisfies JsonError, { status: 409 });
	}

	const user = await prisma.user.create({
		data: {
			email,
			name: name ?? email.split("@")[0] ?? "user",
			role: (process.env.AUTH_DEFAULT_ROLE ?? "viewer").trim() || "viewer",
			passwordHash: hashPassword(password),
		},
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			createdAt: true,
		},
	});

	return noStoreJson(
		{
			created: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				createdAt: user.createdAt.toISOString(),
			},
			nextStep: "sign-in",
		},
		{ status: 201 },
	);
}
