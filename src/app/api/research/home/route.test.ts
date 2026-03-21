import { afterEach, describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("GET /api/research/home", () => {
	it("returns a degraded fallback payload when local research data is unavailable", async () => {
		globalThis.fetch = (async (input) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/geopolitical/local-events");
			return new Response(JSON.stringify({ success: true, source: "local", events: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/research/home", {
			headers: { "x-request-id": "req-research-home-fallback" },
		});

		const response = await GET(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-research-home-fallback");

		const payload = (await response.json()) as {
			degraded: boolean;
			degradedReasons: string[];
			source: string;
			payload: { mattersNow: unknown[] };
		};
		expect(payload.degraded).toBe(true);
		expect(payload.source).toBe("fallback");
		expect(payload.degradedReasons).toContain("NO_LOCAL_EVENTS");
		expect(Array.isArray(payload.payload.mattersNow)).toBe(true);
	});

	it("uses the go-owned local events gateway route instead of external provider fetches", async () => {
		let callCount = 0;
		globalThis.fetch = (async (input) => {
			const url = typeof input === "string" ? input : input.toString();
			callCount += 1;
			expect(url).toContain("/api/v1/geopolitical/local-events");
			return new Response(JSON.stringify({ success: true, source: "local", events: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}) as typeof fetch;
		const request = new NextRequest("http://localhost:3000/api/research/home", {
			headers: { "x-request-id": "req-research-home-local-only" },
		});

		const response = await GET(request);
		expect(response.status).toBe(200);

		const payload = (await response.json()) as {
			degraded: boolean;
			degradedReasons: string[];
			source: string;
		};
		expect(callCount).toBe(1);
		expect(payload.source).toBe("fallback");
		expect(payload.degradedReasons).toContain("NO_LOCAL_EVENTS");
	});
});
