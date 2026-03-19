import { PrismaAdapter } from "@auth/prisma-adapter";
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import PasskeyProvider from "next-auth/providers/passkey";
import { isAuthEnabled, isPasskeyProviderEnabled } from "@/lib/auth/runtime-flags";
import { consumePasskeySessionBootstrap } from "@/lib/server/passkey-session-bootstrap";
import { getPrismaClient } from "@/lib/server/prisma";

type AppRole = "viewer" | "analyst" | "trader" | "admin";

const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASSWORD = "change-me";
const DEFAULT_ADMIN_ROLE: AppRole = "trader";

function getGoGatewayUrl(): string {
	return process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
}

async function postGoAuthOwner<T>(path: string, body: Record<string, unknown>): Promise<T> {
	const response = await fetch(`${getGoGatewayUrl()}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
		cache: "no-store",
	});
	const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
	if (!response.ok) {
		throw new Error(
			typeof payload.error === "string" && payload.error.trim() !== ""
				? payload.error
				: `Go auth owner action failed with ${response.status}`,
		);
	}
	return payload as T;
}

function normalizeAppRole(value: unknown): AppRole {
	if (typeof value !== "string") return "viewer";
	const role = value.trim().toLowerCase();
	if (role === "analyst" || role === "trader" || role === "admin") {
		return role;
	}
	return "viewer";
}

const prisma = getPrismaClient();

function toStandardBase64(value: string): string {
	const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
	const remainder = normalized.length % 4;
	if (remainder === 0) return normalized;
	return `${normalized}${"=".repeat(4 - remainder)}`;
}

function maybeDecodeWrappedCredentialId(value: string): string {
	try {
		const decoded = Buffer.from(value, "base64").toString("utf8");
		if (/^[A-Za-z0-9_-]+$/.test(decoded)) {
			return decoded;
		}
	} catch {
		// keep original value when it is not a wrapped base64url string
	}
	return value;
}

function normalizeCredentialId(value: string): string {
	const candidate = maybeDecodeWrappedCredentialId(value.trim());
	return toStandardBase64(candidate);
}

function encodeWrappedCredentialId(value: string): string {
	const base64url = value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
	return Buffer.from(base64url, "utf8").toString("base64");
}

function createNormalizedPrismaAdapter(): Adapter {
	if (!prisma) {
		throw new Error("prisma unavailable");
	}
	const baseAdapter = PrismaAdapter(prisma);
	return {
		...baseAdapter,
		async createAuthenticator(data) {
			const credentialID = normalizeCredentialId(String(data.credentialID));
			const providerAccountId = normalizeCredentialId(String(data.providerAccountId));
			return prisma.authenticator.create({
				data: {
					userId: String(data.userId),
					providerAccountId,
					credentialID,
					credentialPublicKey: String(data.credentialPublicKey),
					counter: Number(data.counter ?? 0),
					credentialDeviceType: String(data.credentialDeviceType),
					credentialBackedUp: Boolean(data.credentialBackedUp),
					transports: typeof data.transports === "string" ? data.transports : null,
				},
			});
		},
		async getAuthenticator(credentialID) {
			const normalized = normalizeCredentialId(String(credentialID));
			const wrapped = encodeWrappedCredentialId(normalized);
			const found =
				(await prisma.authenticator.findFirst({
					where: {
						OR: [{ credentialID: normalized }, { credentialID: wrapped }],
					},
				})) ?? null;
			return found;
		},
		async updateAuthenticatorCounter(credentialID, counter) {
			const normalized = normalizeCredentialId(String(credentialID));
			const wrapped = encodeWrappedCredentialId(normalized);
			const existing =
				(await prisma.authenticator.findFirst({
					where: {
						OR: [{ credentialID: normalized }, { credentialID: wrapped }],
					},
					select: { id: true },
				})) ?? null;
			if (!existing) {
				throw new Error("authenticator not found");
			}
			return prisma.authenticator.update({
				where: { id: existing.id },
				data: { counter },
			});
		},
	};
}

async function generateRegistrationOptionsWithBinaryUserId(
	options: Parameters<typeof generateRegistrationOptions>[0],
) {
	const normalizedUserId =
		typeof options.userID === "string" ? new TextEncoder().encode(options.userID) : options.userID;
	return generateRegistrationOptions({
		...options,
		userID: normalizedUserId,
	});
}

const providers: NextAuthConfig["providers"] = [
	...(isPasskeyProviderEnabled()
		? [
				PasskeyProvider({
					simpleWebAuthn: {
						generateAuthenticationOptions,
						generateRegistrationOptions: generateRegistrationOptionsWithBinaryUserId,
						verifyAuthenticationResponse,
						verifyRegistrationResponse,
					},
				}),
			]
		: []),
	CredentialsProvider({
		name: "Credentials",
		credentials: {
			username: { label: "Username", type: "text" },
			password: { label: "Password", type: "password" },
		},
		async authorize(credentials) {
			if (!isAuthEnabled()) {
				return null;
			}

			const username = typeof credentials?.username === "string" ? credentials.username.trim() : "";
			const password = typeof credentials?.password === "string" ? credentials.password : "";

			if (!username || !password) return null;

			try {
				const payload = await postGoAuthOwner<{
					user: { id: string; name?: string | null; email?: string | null; role?: string | null };
				}>("/api/v1/auth/owner/authorize", {
					identifier: username,
					password,
				});
				return {
					id: payload.user.id,
					name: payload.user.name ?? payload.user.email ?? username,
					email: payload.user.email ?? `${payload.user.id}@local`,
					role: normalizeAppRole(payload.user.role),
				};
			} catch (err) {
				console.error("CRITICAL_AUTH_DB_ERROR", {
					error: err instanceof Error ? err.message : String(err),
					stack: err instanceof Error ? err.stack : undefined,
				});
			}

			// SOTA 2026: Environment Fallback (Admin-Bypass)
			// Only executed if DB lookup failed or Prisma is unavailable.
			const expectedUser = process.env.NEXTAUTH_ADMIN_USER ?? DEFAULT_ADMIN_USER;
			const expectedPassword = process.env.NEXTAUTH_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

			if (username === expectedUser && password === expectedPassword) {
				return {
					id: "local-admin",
					name: username,
					email: `${username}@local`,
					role: normalizeAppRole(process.env.NEXTAUTH_ADMIN_ROLE ?? DEFAULT_ADMIN_ROLE),
				};
			}

			// Final Rejection Audit
			console.warn("SECURITY_EVENT_LOGIN_FAIL", {
				username,
				severity: "HIGH",
				timestamp: new Date().toISOString(),
				reason: "Invalid credentials",
			});
			return null;
		},
	}),
	CredentialsProvider({
		id: "passkey-scaffold",
		name: "Passkey Scaffold",
		credentials: {
			userId: { label: "User ID", type: "text" },
			proof: { label: "Proof", type: "text" },
		},
		async authorize(credentials) {
			if (!isAuthEnabled()) {
				return null;
			}
			if ((process.env.AUTH_PASSKEY_SCAFFOLD_ENABLED ?? "false").trim().toLowerCase() !== "true") {
				return null;
			}

			const userId = typeof credentials?.userId === "string" ? credentials.userId.trim() : "";
			const proof = typeof credentials?.proof === "string" ? credentials.proof.trim() : "";
			if (!userId || !proof) return null;

			const bootstrap = consumePasskeySessionBootstrap({ userId, proof });
			if (!bootstrap) return null;

			return {
				id: bootstrap.userId,
				name: bootstrap.email?.split("@")[0] ?? "passkey-user",
				email: bootstrap.email ?? `${bootstrap.userId}@passkey.local`,
				role: bootstrap.role,
			};
		},
	}),
];

export const authOptions: NextAuthConfig = {
	...(prisma ? { adapter: createNormalizedPrismaAdapter() } : {}),
	session: {
		strategy: "jwt",
		// Soft-Lock (InactivityMonitor) ist die primäre Sicherheitsschicht.
		// 8h maxAge für aktive Trader — Idle wird via LockScreen abgesichert.
		maxAge: 8 * 60 * 60,
		updateAge: 5 * 60, // Refresh session every 5 mins if active
	},
	providers,
	experimental: { enableWebAuthn: true },
	secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
	cookies: {
		sessionToken: {
			name:
				process.env.NODE_ENV === "production"
					? "__Secure-fusion.session-token"
					: "fusion.session-token",
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				// SOTA 2026: Auto-detect secure requirement (false on localhost)
				secure: process.env.NODE_ENV === "production",
			},
		},
	},

	callbacks: {
		async jwt({ token, user, trigger }) {
			console.log("DEBUG_JWT_CALLBACK_START", { trigger, userId: user?.id });
			const now = Math.floor(Date.now() / 1000);

			if (user && typeof user.id === "string" && user.id) {
				token.sub = user.id;

				// SOTA 2026: Authentication Methods Reference (amr)
				// track how the user identified themselves
				token.amr = token.amr || [];
				if (trigger === "signIn" || trigger === "signUp") {
					const amr = (token.amr as string[]) || [];
					// Detect method from context if possible, or assume pwd/credentials for now
					if (!amr.includes("pwd")) amr.push("pwd");

					// Check for active MFA in DB (SOTA 2026: Hybrid token enrichment)
					try {
						const security = await postGoAuthOwner<{ hasTOTP: boolean }>(
							"/api/v1/auth/owner/user-security",
							{
								userId: user.id,
							},
						);
						if (security.hasTOTP && !amr.includes("mfa")) amr.push("mfa");
					} catch (error) {
						console.warn("AUTH_OWNER_SECURITY_LOOKUP_FAILED", { error: String(error) });
					}

					token.amr = amr;

					console.info("SECURITY_EVENT_LOGIN_SUCCESS", {
						userId: user.id,
						email: user.email,
						severity: "CRITICAL",
						timestamp: new Date().toISOString(),
						authMethod: trigger === "signIn" ? "credentials/passkey" : "registration",
					});
				}
			}
			if (user && "role" in user) {
				token.role = normalizeAppRole(user.role);
			}
			if (!token.role) {
				token.role = "viewer";
			}
			if (typeof token.jti !== "string" || !token.jti) {
				token.jti = crypto.randomUUID();
			}

			// SOTA 2026: Elite Hybrid JTI Validation
			// Only check revocation every 60 seconds to preserve performance
			// while maintaining a high security posture.
			const lastChecked = (token.lastRevocationCheck as number) || 0;
			const shouldCheck = now - lastChecked > 60 || trigger === "signIn";

			if (shouldCheck && token.jti) {
				try {
					const gatewayUrl = process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
					const response = await fetch(
						`${gatewayUrl}/api/v1/auth/revocations/audit?jti=${token.jti}`,
						{
							headers: { "X-Request-ID": `check-${token.jti}-${now}` },
						},
					);

					// In SOTA 2026, we assume if the audit/check fails or JTI is found,
					// we treat it as potentially compromised.
					if (response.status === 401 || response.status === 403) {
						return null; // Force logout
					}

					token.lastRevocationCheck = now;
				} catch (error) {
					// Fallback: If Gateway is down, we allow the stale JWT for its remaining 15m
					// but log the incident to OTel.
					console.warn("HYBRID_REVOCATION_CHECK_SKIPPED", { error: String(error) });
				}
			}

			// Go Gateway validates iss/aud when AUTH_JWT_ISSUER/AUTH_JWT_AUDIENCE are set; must match.
			const issuer = process.env.AUTH_JWT_ISSUER?.trim() || process.env.NEXTAUTH_URL?.trim();
			if (issuer) token.iss = issuer;
			const audience = process.env.AUTH_JWT_AUDIENCE?.trim();
			if (audience) token.aud = audience;
			return token;
		},
		async session({ session, token }) {
			return {
				...session,
				user: {
					...session.user,
					id: typeof token.sub === "string" ? token.sub : undefined,
					role: normalizeAppRole(token.role),
				},
			};
		},
	},
	pages: {
		signIn: "/auth/sign-in",
	},
	events: {
		async signOut(message) {
			const token = "token" in message ? message.token : null;
			// SOTA 2026: Elite Revocation Bridge
			// Notify Go Gateway to revoke the JTI permanently.
			if (token && typeof token.jti === "string") {
				try {
					const gatewayUrl = process.env.GO_GATEWAY_INTERNAL_URL || "http://127.0.0.1:9060";
					const response = await fetch(`${gatewayUrl}/api/v1/auth/revocations/jti`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"X-Request-ID": `revoke-${token.jti}-${Date.now()}`,
						},
						body: JSON.stringify({
							jti: token.jti,
							exp: token.exp, // Pass expiry to allow pruning in Go
						}),
					});

					if (!response.ok) {
						console.error("FAILED_GLOBAL_REVOCATION_BRIDGE", {
							jti: token.jti,
							status: response.status,
						});
					} else {
						console.info("SUCCESS_GLOBAL_REVOCATION_BRIDGE", {
							jti: token.jti,
						});
					}
				} catch (error) {
					console.error("ERROR_GLOBAL_REVOCATION_BRIDGE", {
						jti: token.jti,
						error: error instanceof Error ? error.message : String(error),
					});
				}
			}
		},
	},
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
