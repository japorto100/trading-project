import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { serializeProviderCredentialsCookie } from "@/lib/server/provider-credentials";
import { GET } from "./route";

const originalFetch = globalThis.fetch;
const originalCookieSecret = process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;

afterEach(() => {
	globalThis.fetch = originalFetch;
	if (originalCookieSecret === undefined) {
		delete process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;
		return;
	}
	process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = originalCookieSecret;
});

describe("GET /api/market/providers", () => {
	beforeEach(() => {
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = "provider-cookie-secret-for-providers-tests";
	});

	it("marks finnhub as configured when the provider credential cookie is present", async () => {
		globalThis.fetch = (async () =>
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			})) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/market/providers", {
			headers: {
				cookie: `tradeview_provider_credentials=${serializeProviderCredentialsCookie({
					finnhub: "request-token",
				})}`,
				"x-request-id": "req-providers-configured",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-providers-configured");

		const payload = (await response.json()) as {
			success: boolean;
			providers: Array<{
				name: string;
				configured?: boolean;
				requiresAuth: boolean;
				available: boolean;
			}>;
		};
		expect(payload.success).toBe(true);
		const finnhub = payload.providers.find((provider) => provider.name === "finnhub");
		expect(finnhub).toBeDefined();
		expect(finnhub?.requiresAuth).toBe(true);
		expect(finnhub?.configured).toBe(true);
		expect(finnhub?.available).toBe(true);
	});
});
