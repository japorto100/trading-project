import { createHmac } from "node:crypto";
import { getAuthBypassRole, isAuthStackBypassEnabled } from "@/lib/auth/runtime-flags";
import { resolveAuthenticatedUserFromSession } from "@/lib/server/auth-user";

function base64Url(bytes: Buffer): string {
	return bytes.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

export async function getKGFallbackKeyMaterialForCurrentUser(): Promise<
	| {
			ok: true;
			user: { id: string; email: string | null; role: string };
			keyMaterialB64Url: string;
			source: "fallback";
			prfSupported: false;
	  }
	| { ok: false; status: number; error: string }
> {
	const secret = (process.env.AUTH_KG_FALLBACK_KEY ?? process.env.NEXTAUTH_SECRET ?? "").trim();
	if (isAuthStackBypassEnabled()) {
		if (!secret) {
			return { ok: false, status: 503, error: "kg fallback key unavailable" };
		}
		const bypassUserId = "auth-bypass-test-user";
		const digest = createHmac("sha256", secret)
			.update(`tvf:kg-fallback:${bypassUserId}`, "utf8")
			.digest();
		return {
			ok: true,
			user: {
				id: bypassUserId,
				email: "auth-bypass@local",
				role: getAuthBypassRole(),
			},
			keyMaterialB64Url: base64Url(digest),
			source: "fallback",
			prfSupported: false,
		};
	}

	const resolved = await resolveAuthenticatedUserFromSession();
	if (!resolved.ok) return resolved;

	if (!secret) {
		return { ok: false, status: 503, error: "kg fallback key unavailable" };
	}

	const digest = createHmac("sha256", secret)
		.update(`tvf:kg-fallback:${resolved.user.id}`, "utf8")
		.digest();

	return {
		ok: true,
		user: resolved.user,
		keyMaterialB64Url: base64Url(digest),
		source: "fallback",
		prfSupported: false,
	};
}
