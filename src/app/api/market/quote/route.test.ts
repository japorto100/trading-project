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

describe("GET /api/market/quote", () => {
	beforeEach(() => {
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = "provider-cookie-secret-for-quote-tests";
	});

	it("rebuilds the gateway provider credentials header from the cookie", async () => {
		let forwardedHeader: string | null = null;
		globalThis.fetch = (async (input, init) => {
			const url = typeof input === "string" ? input : input.toString();
			if (!url.includes("/api/v1/quote")) {
				throw new Error(`unexpected fetch url: ${url}`);
			}
			forwardedHeader =
				(init?.headers as Record<string, string> | undefined)?.[
					"X-Tradeview-Provider-Credentials"
				] ?? null;
			return new Response(
				JSON.stringify({
					success: true,
					data: {
						symbol: "AAPL",
						exchange: "finnhub",
						assetType: "equity",
						last: 205.12,
						bid: 205.1,
						ask: 205.14,
						high: 207.5,
						low: 203.9,
						volume: 1200,
						timestamp: 1771200000,
						source: "finnhub",
					},
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			);
		}) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/market/quote?symbol=AAPL", {
			headers: {
				cookie: `tradeview_provider_credentials=${serializeProviderCredentialsCookie({
					finnhub: "request-token",
				})}`,
				"x-request-id": "req-quote-cookie-credentials",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-quote-cookie-credentials");
		expect(forwardedHeader).toBeTruthy();

		const decoded = JSON.parse(Buffer.from(forwardedHeader!, "base64").toString("utf8")) as {
			finnhub?: { key: string };
		};
		expect(decoded.finnhub?.key).toBe("request-token");

		const payload = (await response.json()) as {
			success: boolean;
			provider: string;
			quote: { symbol: string; price: number };
		};
		expect(payload.success).toBe(true);
		expect(payload.provider).toBe("finnhub");
		expect(payload.quote.symbol).toBe("AAPL");
		expect(payload.quote.price).toBe(205.12);
	});

	it("returns a gateway failure instead of silently falling back when the upstream quote fails", async () => {
		globalThis.fetch = (async () =>
			new Response(JSON.stringify({ success: false, error: "missing credentials" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			})) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/market/quote?symbol=AAPL", {
			headers: {
				"x-request-id": "req-quote-upstream-failure",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(502);
		expect(response.headers.get("x-request-id")).toBe("req-quote-upstream-failure");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("Gateway quote endpoint rejected with status 401");
		expect(payload.reason).toBe("DOWNSTREAM_UNAVAILABLE");
	});

	it("rejects requests without symbol query parameters with an explicit reason", async () => {
		const request = new NextRequest("http://localhost:3000/api/market/quote", {
			headers: {
				"x-request-id": "req-quote-missing-query",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-quote-missing-query");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("Either symbol or symbols is required");
		expect(payload.reason).toBe("INVALID_QUERY");
	});

	it("rejects requests that provide both symbol and symbols", async () => {
		const request = new NextRequest(
			"http://localhost:3000/api/market/quote?symbol=AAPL&symbols=MSFT,NVDA",
			{
				headers: {
					"x-request-id": "req-quote-conflicting-query",
				},
			},
		);

		const response = await GET(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-quote-conflicting-query");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("Provide either symbol or symbols, not both");
		expect(payload.reason).toBe("INVALID_QUERY");
	});
});
