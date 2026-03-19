import {
	getAuthBypassRole,
	isAuthEnabled,
	isAuthStackBypassEnabled,
} from "@/lib/auth/runtime-flags";
import { resolveAuthenticatedUserFromSession } from "@/lib/server/auth-user";

export interface UserConsentSnapshot {
	llmProcessing: boolean;
	analyticsEnabled: boolean;
	marketingEnabled: boolean;
	privacyVersion: string;
	consentedAt: string | null;
	withdrawnAt: string | null;
}

function gatewayBaseUrl() {
	return process.env.GO_GATEWAY_BASE_URL?.trim() || null;
}

function buildBypassConsentResult(input?: {
	llmProcessing?: boolean;
	analyticsEnabled?: boolean;
	marketingEnabled?: boolean;
}) {
	const now = new Date().toISOString();
	const llmProcessing = input?.llmProcessing ?? true;
	const analyticsEnabled = input?.analyticsEnabled ?? true;
	const marketingEnabled = input?.marketingEnabled ?? false;
	return {
		ok: true as const,
		user: {
			id: "auth-bypass-test-user",
			email: "auth-bypass@local",
			role: getAuthBypassRole(),
		},
		consent: {
			llmProcessing,
			analyticsEnabled,
			marketingEnabled,
			privacyVersion: "bypass",
			consentedAt: now,
			withdrawnAt: null,
		},
	};
}

async function requestConsent(
	method: "GET" | "PATCH",
	user: { id: string; email: string | null; role: string },
	body?: Record<string, unknown>,
) {
	const gatewayUrl = gatewayBaseUrl();
	if (!gatewayUrl) {
		return { ok: false as const, status: 503, error: "gateway unavailable" };
	}
	try {
		const response = await fetch(`${gatewayUrl}/api/v1/auth/consent`, {
			method,
			cache: "no-store",
			headers: {
				"x-auth-user-id": user.id,
				"x-auth-user-email": user.email ?? "",
				"x-auth-user-role": user.role,
				...(body ? { "content-type": "application/json" } : {}),
			},
			...(body ? { body: JSON.stringify(body) } : {}),
		});
		const payload = (await response.json()) as {
			error?: string;
			consent?: UserConsentSnapshot;
		};
		if (!response.ok || !payload.consent) {
			return {
				ok: false as const,
				status: response.status,
				error: payload.error ?? "consent request failed",
			};
		}
		return {
			ok: true as const,
			user,
			consent: payload.consent,
		};
	} catch {
		return { ok: false as const, status: 502, error: "gateway consent request failed" };
	}
}

export async function getOrCreateUserConsentSnapshot(): Promise<
	| {
			ok: true;
			user: { id: string; email: string | null; role: string };
			consent: UserConsentSnapshot;
	  }
	| { ok: false; status: number; error: string }
> {
	if (isAuthStackBypassEnabled()) {
		return buildBypassConsentResult();
	}

	const resolved = await resolveAuthenticatedUserFromSession();
	if (!resolved.ok) return resolved;

	return requestConsent("GET", resolved.user);
}

export async function updateUserConsentSnapshot(input: {
	llmProcessing?: boolean;
	analyticsEnabled?: boolean;
	marketingEnabled?: boolean;
}): Promise<
	| {
			ok: true;
			user: { id: string; email: string | null; role: string };
			consent: UserConsentSnapshot;
	  }
	| { ok: false; status: number; error: string }
> {
	if (isAuthStackBypassEnabled()) {
		return buildBypassConsentResult(input);
	}

	const resolved = await resolveAuthenticatedUserFromSession();
	if (!resolved.ok) return resolved;

	return requestConsent("PATCH", resolved.user, input);
}

export async function hasLLMConsentForCurrentUser(): Promise<
	{ ok: true; allowed: boolean } | { ok: false; status: number; error: string }
> {
	if (!isAuthEnabled()) {
		return { ok: true, allowed: true };
	}

	const consent = await getOrCreateUserConsentSnapshot();
	if (!consent.ok) {
		return { ok: false, status: consent.status, error: consent.error };
	}
	return { ok: true, allowed: consent.consent.llmProcessing };
}
