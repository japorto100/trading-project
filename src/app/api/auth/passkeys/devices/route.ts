import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAuthBypassRole, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";
import { getPrismaClient } from "@/lib/server/prisma";

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
	const prisma = getPrismaClient();
	if (!prisma) {
		return {
			errorResponse: noStoreJson({ error: "database unavailable" } satisfies JsonError, {
				status: 503,
			}),
		};
	}
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

	const user = userId
		? await prisma.user.findUnique({ where: { id: userId } })
		: await prisma.user.findUnique({ where: { email } });

	if (!user) {
		return {
			errorResponse: noStoreJson({ error: "user not found" } satisfies JsonError, { status: 404 }),
		};
	}

	return { prisma, user };
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

	const authenticators = await resolved.prisma.authenticator.findMany({
		where: { userId: resolved.user.id },
		orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
	});

	return noStoreJson({
		user: {
			id: resolved.user.id,
			email: resolved.user.email,
			role: resolved.user.role,
		},
		items: authenticators.map((authenticator) => ({
			id: authenticator.id,
			name: authenticator.name,
			credentialId: authenticator.credentialID,
			deviceType: authenticator.credentialDeviceType,
			backedUp: authenticator.credentialBackedUp,
			counter: authenticator.counter,
			transports: authenticator.transports
				? authenticator.transports.split(",").filter(Boolean)
				: [],
			createdAt: authenticator.createdAt.toISOString(),
			lastUsedAt: authenticator.lastUsedAt?.toISOString() ?? null,
		})),
		total: authenticators.length,
	});
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

	const target = await resolved.prisma.authenticator.findFirst({
		where: {
			id: authenticatorId,
			userId: resolved.user.id,
		},
	});
	if (!target) {
		return noStoreJson({ error: "authenticator not found" } satisfies JsonError, { status: 404 });
	}

	const count = await resolved.prisma.authenticator.count({
		where: { userId: resolved.user.id },
	});
	if (count <= 1) {
		return noStoreJson(
			{
				error: "cannot remove last passkey",
				details: "Register another passkey before removing the final device.",
			} satisfies JsonError,
			{ status: 409 },
		);
	}

	await resolved.prisma.authenticator.delete({
		where: { id: target.id },
	});

	return noStoreJson({
		deleted: true,
		authenticatorId: target.id,
		remaining: count - 1,
	});
}
