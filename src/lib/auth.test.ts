import { afterAll, afterEach, describe, expect, it, mock } from "bun:test";

const originalFetch = globalThis.fetch;
const originalEnv = {
	AUTH_STACK_BYPASS: process.env.AUTH_STACK_BYPASS,
	NEXT_PUBLIC_ENABLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_AUTH,
	AUTH_PASSKEY_PROVIDER_ENABLED: process.env.AUTH_PASSKEY_PROVIDER_ENABLED,
	GO_GATEWAY_INTERNAL_URL: process.env.GO_GATEWAY_INTERNAL_URL,
	NEXTAUTH_URL: process.env.NEXTAUTH_URL,
};

process.env.AUTH_STACK_BYPASS = "false";
process.env.NEXT_PUBLIC_ENABLE_AUTH = "true";
process.env.AUTH_PASSKEY_PROVIDER_ENABLED = "false";
process.env.GO_GATEWAY_INTERNAL_URL = "http://127.0.0.1:9060";
process.env.NEXTAUTH_URL = "http://localhost:3000";

const { authOptions } = await import("./auth");

type CredentialsProviderLike = {
	id?: string;
	name?: string;
	options?: {
		id?: string;
		credentials?: Record<string, unknown>;
		authorize?: (credentials?: Record<string, unknown>) => Promise<unknown>;
	};
	authorize?: (credentials?: Record<string, unknown>) => Promise<unknown>;
};

function getCredentialsProvider(): CredentialsProviderLike {
	const provider = (authOptions.providers ?? []).find((entry) => {
		if (!entry || typeof entry !== "object") return false;
		const candidate = entry as CredentialsProviderLike;
		return (
			candidate.id === "credentials" &&
			candidate.options?.id !== "passkey-scaffold" &&
			"username" in (candidate.options?.credentials ?? {})
		);
	});
	if (!provider || typeof provider !== "object") {
		throw new Error("credentials provider not found");
	}
	return provider as CredentialsProviderLike;
}

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restore();
});

afterAll(() => {
	process.env.AUTH_STACK_BYPASS = originalEnv.AUTH_STACK_BYPASS;
	process.env.NEXT_PUBLIC_ENABLE_AUTH = originalEnv.NEXT_PUBLIC_ENABLE_AUTH;
	process.env.AUTH_PASSKEY_PROVIDER_ENABLED = originalEnv.AUTH_PASSKEY_PROVIDER_ENABLED;
	process.env.GO_GATEWAY_INTERNAL_URL = originalEnv.GO_GATEWAY_INTERNAL_URL;
	process.env.NEXTAUTH_URL = originalEnv.NEXTAUTH_URL;
	globalThis.fetch = originalFetch;
	mock.restore();
});

describe("auth verify", () => {
	it("authorizes credentials through the go-owned auth endpoint", async () => {
		const provider = getCredentialsProvider();
		const authorize = provider.options?.authorize ?? provider.authorize;
		if (typeof authorize !== "function") {
			throw new Error("credentials authorize callback unavailable");
		}

		globalThis.fetch = mock(async (input, init) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/auth/owner/authorize");
			expect(init?.method).toBe("POST");
			const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
			expect(body.identifier).toBe("analyst");
			expect(body.password).toBe("StrongPassword123!");
			return new Response(
				JSON.stringify({
					user: {
						id: "user-123",
						email: "analyst@example.com",
						name: "Analyst",
						role: "trader",
					},
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}) as typeof fetch;

		const user = (await authorize({
			username: "analyst",
			password: "StrongPassword123!",
		})) as Record<string, unknown> | null;

		expect(user).not.toBeNull();
		expect(user?.id).toBe("user-123");
		expect(user?.email).toBe("analyst@example.com");
		expect(user?.role).toBe("trader");
	});

	it("enriches jwt/session from go-owned security state", async () => {
		const callbacks = authOptions.callbacks;
		if (!callbacks?.jwt || !callbacks.session) {
			throw new Error("auth callbacks unavailable");
		}

		globalThis.fetch = mock(async (input) => {
			const url = typeof input === "string" ? input : input.toString();
			if (url.includes("/api/v1/auth/owner/user-security")) {
				return new Response(JSON.stringify({ hasTOTP: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
			if (url.includes("/api/v1/auth/revocations/audit")) {
				return new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
			throw new Error(`unexpected fetch: ${url}`);
		}) as typeof fetch;

		const token = (await callbacks.jwt({
			token: {},
			user: {
				id: "user-123",
				name: "Analyst",
				email: "analyst@example.com",
				role: "analyst",
			},
			trigger: "signIn",
			account: null,
			profile: null,
			session: null,
		} as never)) as Record<string, unknown> | null;

		expect(token).not.toBeNull();
		expect(token?.sub).toBe("user-123");
		expect(token?.role).toBe("analyst");
		expect(Array.isArray(token?.amr)).toBe(true);
		expect(token?.amr).toContain("pwd");
		expect(token?.amr).toContain("mfa");
		expect(typeof token?.jti).toBe("string");

		const session = (await callbacks.session({
			session: {
				user: {
					name: "Analyst",
					email: "analyst@example.com",
				},
				expires: "2026-03-20T12:00:00.000Z",
			},
			token: token as never,
			user: undefined,
			newSession: undefined,
			trigger: undefined,
		} as never)) as {
			user?: {
				id?: string;
				role?: string;
			};
		};

		expect(session.user?.id).toBe("user-123");
		expect(session.user?.role).toBe("analyst");
	});
});
