import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("/api/fusion/orders route boundaries", () => {
	it("returns an explicit reason when profileKey is missing", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/orders", {
			headers: {
				"x-request-id": "req-orders-missing-profile",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-orders-missing-profile");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("profileKey is required");
		expect(payload.reason).toBe("MISSING_PROFILE_KEY");
	});

	it("returns an explicit reason for invalid JSON request bodies", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/orders", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-orders-invalid-json",
			},
			body: "{",
		});

		const response = await POST(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-orders-invalid-json");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("invalid JSON body");
		expect(payload.reason).toBe("INVALID_JSON_BODY");
	});

	it("returns an explicit reason for invalid order payloads", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/orders", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-orders-invalid-payload",
			},
			body: JSON.stringify({
				profileKey: "paper-default",
				symbol: "AAPL",
				side: "buy",
				type: "market",
				quantity: -1,
				entryPrice: 100,
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-orders-invalid-payload");

		const payload = (await response.json()) as {
			error: string;
			reason: string;
			details: unknown;
		};
		expect(payload.error).toBe("invalid order payload");
		expect(payload.reason).toBe("INVALID_ORDER_PAYLOAD");
		expect(payload.details).toBeTruthy();
	});
});
