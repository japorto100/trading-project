import { auth } from "@/lib/auth";

export interface AuthSessionUser {
	id: string;
	email: string | null;
	role: string;
}

export type AuthUserResolution =
	| { ok: true; user: AuthSessionUser }
	| { ok: false; status: number; error: string };

function gatewayBaseUrl() {
	return process.env.GO_GATEWAY_BASE_URL?.trim() || null;
}

export async function resolveAuthenticatedUserFromSession(): Promise<AuthUserResolution> {
	const session = await auth();
	if (!session?.user) {
		return { ok: false, status: 401, error: "unauthorized" };
	}

	const userId = typeof session.user.id === "string" ? session.user.id.trim() : "";
	const email =
		typeof session.user.email === "string" ? session.user.email.trim().toLowerCase() : "";
	if (!userId && !email) {
		return { ok: false, status: 401, error: "session missing user identity" };
	}

	const gatewayUrl = gatewayBaseUrl();
	if (!gatewayUrl) {
		return { ok: false, status: 503, error: "gateway unavailable" };
	}

	try {
		const response = await fetch(`${gatewayUrl}/api/v1/auth/current-user`, {
			cache: "no-store",
			headers: {
				"x-auth-user-id": userId,
				"x-auth-user-email": email,
				"x-auth-user-role": typeof session.user.role === "string" ? session.user.role : "viewer",
			},
		});
		const payload = (await response.json()) as {
			error?: string;
			user?: { id: string; email: string | null; role: string };
		};
		if (!response.ok || !payload.user) {
			return { ok: false, status: response.status, error: payload.error ?? "user lookup failed" };
		}
		return { ok: true, user: payload.user };
	} catch {
		return { ok: false, status: 502, error: "gateway lookup failed" };
	}
}
