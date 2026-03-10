import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { serializeProviderCredentialsCookie } from "@/lib/server/provider-credentials";
import { GET } from "./route";

const originalFetch = globalThis.fetch;
const originalLegacyFallback = process.env.MARKET_STREAM_LEGACY_FALLBACK_ENABLED;
const originalCookieSecret = process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;

afterEach(() => {
	globalThis.fetch = originalFetch;
	if (originalLegacyFallback === undefined) {
		delete process.env.MARKET_STREAM_LEGACY_FALLBACK_ENABLED;
	} else {
		process.env.MARKET_STREAM_LEGACY_FALLBACK_ENABLED = originalLegacyFallback;
	}
	if (originalCookieSecret === undefined) {
		delete process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET;
		return;
	}
	process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = originalCookieSecret;
});

describe("GET /api/market/stream", () => {
	beforeEach(() => {
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET = "provider-cookie-secret-for-stream-tests";
	});

	it("rebuilds the gateway provider credentials header from the cookie for go-backed SSE", async () => {
		let forwardedHeader: string | null = null;
		globalThis.fetch = (async (input, init) => {
			const url = typeof input === "string" ? input : input.toString();
			if (!url.includes("/api/v1/stream/market")) {
				throw new Error(`unexpected fetch url: ${url}`);
			}
			forwardedHeader =
				(init?.headers as Record<string, string> | undefined)?.[
					"X-Tradeview-Provider-Credentials"
				] ?? null;
			return new Response(
				'event: ready\ndata: {"backend":"go-sse","symbol":"AAPL","timeframe":"1H"}\n\n',
				{
					status: 200,
					headers: { "Content-Type": "text/event-stream" },
				},
			);
		}) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/market/stream?symbol=AAPL", {
			headers: {
				cookie: `tradeview_provider_credentials=${serializeProviderCredentialsCookie({
					finnhub: "request-token",
				})}`,
				"x-request-id": "req-stream-cookie-credentials",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-stream-cookie-credentials");
		expect(response.headers.get("x-stream-backend")).toBe("go-sse");
		expect(forwardedHeader).toBeTruthy();

		const decoded = JSON.parse(Buffer.from(forwardedHeader!, "base64").toString("utf8")) as {
			finnhub?: { key: string };
		};
		expect(decoded.finnhub?.key).toBe("request-token");

		const payload = await response.text();
		expect(payload).toContain("event: ready");
		expect(payload).toContain('"backend":"go-sse"');
	});

	it("returns a 502 when go stream is unavailable and legacy fallback is disabled", async () => {
		process.env.MARKET_STREAM_LEGACY_FALLBACK_ENABLED = "false";
		globalThis.fetch = (async () =>
			new Response(JSON.stringify({ success: false, error: "missing credentials" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			})) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/market/stream?symbol=AAPL", {
			headers: {
				"x-request-id": "req-stream-upstream-failure",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(502);
		expect(response.headers.get("x-request-id")).toBe("req-stream-upstream-failure");
		expect(response.headers.get("x-stream-backend")).toBe("unavailable");

		const payload = (await response.json()) as {
			success: boolean;
			code: string;
			error: string;
			degraded: boolean;
		};
		expect(payload.success).toBe(false);
		expect(payload.code).toBe("stream_fallback_disabled");
		expect(payload.error).toContain("Go stream unavailable");
		expect(payload.degraded).toBe(true);
	});
});
