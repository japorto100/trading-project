import { afterEach, describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET } from "./route";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("GET /api/research/home", () => {
	it("returns a degraded fallback payload when local research data is unavailable", async () => {
		globalThis.fetch = (async () => {
			throw new Error("unexpected fetch");
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

	it("never depends on a gateway call for the research home route", async () => {
		let called = false;
		globalThis.fetch = (async () => {
			called = true;
			throw new Error("fetch should not be called");
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
		expect(called).toBe(false);
		expect(payload.source).toBe("fallback");
		expect(payload.degradedReasons).toContain("NO_LOCAL_EVENTS");
	});
});
