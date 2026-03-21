import { afterEach, describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("GET /api/intelligence-calendar/events", () => {
	it("returns a fallback payload when local calendar data is unavailable", async () => {
		globalThis.fetch = (async (input) => {
			const url = typeof input === "string" ? input : input.toString();
			expect(url).toContain("/api/v1/geopolitical/local-events");
			return new Response(JSON.stringify({ success: true, source: "local", events: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}) as typeof fetch;

		const request = new NextRequest("http://localhost:3000/api/intelligence-calendar/events", {
			headers: { "x-request-id": "req-calendar-fallback" },
		});

		const response = await GET(request);
		expect(response.status).toBe(200);
		expect(response.headers.get("x-request-id")).toBe("req-calendar-fallback");

		const payload = (await response.json()) as {
			degraded: boolean;
			source: string;
			degradedReasons: string[];
			events: unknown[];
		};
		expect(payload.degraded).toBe(true);
		expect(payload.source).toBe("fallback");
		expect(payload.degradedReasons).toContain("NO_LOCAL_EVENTS");
		expect(Array.isArray(payload.events)).toBe(true);
	});
});
