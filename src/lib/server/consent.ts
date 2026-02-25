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

	const consent = await resolved.prisma.userConsent.upsert({
		where: { userId: resolved.user.id },
		create: {
			userId: resolved.user.id,
			llmProcessing: false,
			analyticsEnabled: false,
			marketingEnabled: false,
			privacyVersion: "v1",
		},
		update: {},
	});

	return {
		ok: true,
		user: resolved.user,
		consent: {
			llmProcessing: consent.llmProcessing,
			analyticsEnabled: consent.analyticsEnabled,
			marketingEnabled: consent.marketingEnabled,
			privacyVersion: consent.privacyVersion,
			consentedAt: consent.consentedAt?.toISOString() ?? null,
			withdrawnAt: consent.withdrawnAt?.toISOString() ?? null,
		},
	};
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

	const existing = await resolved.prisma.userConsent.findUnique({
		where: { userId: resolved.user.id },
	});
	const nextLlm =
		typeof input.llmProcessing === "boolean"
			? input.llmProcessing
			: (existing?.llmProcessing ?? false);
	const nextAnalytics =
		typeof input.analyticsEnabled === "boolean"
			? input.analyticsEnabled
			: (existing?.analyticsEnabled ?? false);
	const nextMarketing =
		typeof input.marketingEnabled === "boolean"
			? input.marketingEnabled
			: (existing?.marketingEnabled ?? false);

	const consentedAt =
		nextLlm || nextAnalytics || nextMarketing
			? (existing?.consentedAt ?? new Date())
			: existing?.consentedAt;
	const withdrawnAt = nextLlm || nextAnalytics || nextMarketing ? null : new Date();

	const consent = await resolved.prisma.userConsent.upsert({
		where: { userId: resolved.user.id },
		create: {
			userId: resolved.user.id,
			llmProcessing: nextLlm,
			analyticsEnabled: nextAnalytics,
			marketingEnabled: nextMarketing,
			privacyVersion: "v1",
			consentedAt,
			withdrawnAt,
		},
		update: {
			llmProcessing: nextLlm,
			analyticsEnabled: nextAnalytics,
			marketingEnabled: nextMarketing,
			consentedAt,
			withdrawnAt,
		},
	});

	return {
		ok: true,
		user: resolved.user,
		consent: {
			llmProcessing: consent.llmProcessing,
			analyticsEnabled: consent.analyticsEnabled,
			marketingEnabled: consent.marketingEnabled,
			privacyVersion: consent.privacyVersion,
			consentedAt: consent.consentedAt?.toISOString() ?? null,
			withdrawnAt: consent.withdrawnAt?.toISOString() ?? null,
		},
	};
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
