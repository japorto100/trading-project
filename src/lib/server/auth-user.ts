import { auth } from "@/lib/auth";
import { getPrismaClient } from "@/lib/server/prisma";

export interface AuthSessionUser {
	id: string;
	email: string | null;
	role: string;
}

export type AuthUserResolution =
	| { ok: true; prisma: NonNullable<ReturnType<typeof getPrismaClient>>; user: AuthSessionUser }
	| { ok: false; status: number; error: string };

export async function resolveAuthenticatedUserFromSession(): Promise<AuthUserResolution> {
	const session = await auth();
	if (!session?.user) {
		return { ok: false, status: 401, error: "unauthorized" };
	}

	const prisma = getPrismaClient();
	if (!prisma) {
		return { ok: false, status: 503, error: "database unavailable" };
	}

	const userId = typeof session.user.id === "string" ? session.user.id.trim() : "";
	const email =
		typeof session.user.email === "string" ? session.user.email.trim().toLowerCase() : "";
	if (!userId && !email) {
		return { ok: false, status: 401, error: "session missing user identity" };
	}

	const user = userId
		? await prisma.user.findUnique({ where: { id: userId } })
		: await prisma.user.findUnique({ where: { email } });

	if (!user) {
		return { ok: false, status: 404, error: "user not found" };
	}

	return {
		ok: true,
		prisma,
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
		},
	};
}
