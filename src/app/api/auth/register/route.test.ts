import { afterEach, describe, expect, it, mock } from "bun:test";
import { POST } from "./route";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
	mock.restore();
	delete process.env.AUTH_STACK_BYPASS;
	delete process.env.NEXT_PUBLIC_ENABLE_AUTH;
});

describe("POST /api/auth/register", () => {
	it("forwards registration to the go-owned auth owner endpoint", async () => {
		process.env.AUTH_STACK_BYPASS = "false";
		process.env.NEXT_PUBLIC_ENABLE_AUTH = "true";

		globalThis.fetch = mock(async (input, init) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/auth/owner/register");
			expect(init?.method).toBe("POST");
			const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
			expect(body.email).toBe("user@example.com");
			expect(body.username).toBe("test_user");
			expect(typeof body.passwordHash).toBe("string");
			return new Response(
				JSON.stringify({
					user: {
						id: "user-1",
						email: "user@example.com",
						name: "Test User",
						role: "viewer",
						createdAt: "2026-03-19T12:00:00.000Z",
					},
				}),
				{ status: 201, headers: { "Content-Type": "application/json" } },
			);
		}) as typeof fetch;

		const request = new Request("http://localhost:3000/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: "USER@example.com",
				username: "Test_User",
				name: "Test User",
				password: "StrongPassword123!",
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(201);
		const payload = (await response.json()) as {
			created: boolean;
			user: { id: string; email: string | null };
			recoveryCodes: string[];
			nextStep: string;
		};
		expect(payload.created).toBe(true);
		expect(payload.user.id).toBe("user-1");
		expect(payload.user.email).toBe("user@example.com");
		expect(payload.nextStep).toBe("sign-in");
		expect(payload.recoveryCodes).toHaveLength(8);
	});
});
