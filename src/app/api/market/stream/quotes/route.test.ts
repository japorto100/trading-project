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

describe("GET /api/market/stream/quotes", () => {
	beforeEach(() => {
		process.env.PROVIDER_CREDENTIALS_COOKIE_SECRET =
			"provider-cookie-secret-for-stream-quotes-tests";
	});

	it("rebuilds the gateway provider credentials header from the cookie for go multiplex streams", async () => {
		const forwardedHeaders: string[] = [];
		globalThis.fetch = (async (_input, init) => {
			const headers = init?.headers as Record<string, string> | undefined;
			const forwardedHeader = headers?.["X-Tradeview-Provider-Credentials"];
			if (forwardedHeader) {
				forwardedHeaders.push(forwardedHeader);
			}
			return new Response(
				new ReadableStream({
					start() {
						// keep upstream open long enough for the route to emit its ready event
					},
				}),
				{
					status: 200,
					headers: { "Content-Type": "text/event-stream" },
				},
			);
		}) as typeof fetch;

		const request = new NextRequest(
			"http://localhost:3000/api/market/stream/quotes?symbols=AAPL,MSFT",
			{
				headers: {
					cookie: `tradeview_provider_credentials=${serializeProviderCredentialsCookie({
						finnhub: "request-token",
					})}`,
					"x-request-id": "req-quotes-stream-cookie-credentials",
				},
			},
		);

		const response = await GET(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-quotes-stream-cookie-credentials");
		expect(response.headers.get("x-stream-backend")).toBe("go-sse-multiplex");

		const reader = response.body?.getReader();
		expect(reader).toBeTruthy();
		const firstChunk = await reader!.read();
		expect(firstChunk.done).toBe(false);

		const payload = new TextDecoder().decode(firstChunk.value);
		expect(payload).toContain("event: ready");
		expect(payload).toContain('"backend":"go-sse-multiplex"');

		expect(forwardedHeaders.length).toBe(2);
		for (const header of forwardedHeaders) {
			const decoded = JSON.parse(Buffer.from(header, "base64").toString("utf8")) as {
				finnhub?: { key: string };
			};
			expect(decoded.finnhub?.key).toBe("request-token");
		}

		await reader!.cancel();
	});
});
