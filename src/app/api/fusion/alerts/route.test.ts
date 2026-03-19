import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("/api/fusion/alerts route boundaries", () => {
	it("returns an explicit reason when profileKey is missing", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/alerts", {
			headers: {
				"x-request-id": "req-alerts-missing-profile",
			},
		});

		const response = await GET(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-alerts-missing-profile");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("profileKey is required");
		expect(payload.reason).toBe("MISSING_PROFILE_KEY");
	});

	it("returns an explicit reason for invalid JSON request bodies", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/alerts", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-alerts-invalid-json",
			},
			body: "{",
		});

		const response = await POST(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-alerts-invalid-json");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("invalid JSON body");
		expect(payload.reason).toBe("INVALID_JSON_BODY");
	});

	it("returns an explicit reason for invalid alert payloads", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/alerts", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-alerts-invalid-payload",
			},
			body: JSON.stringify({
				profileKey: "paper-default",
				symbol: "AAPL",
				condition: "above",
				targetValue: "not-a-number",
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-alerts-invalid-payload");

		const payload = (await response.json()) as {
			error: string;
			reason: string;
			details: unknown;
		};
		expect(payload.error).toBe("invalid alert payload");
		expect(payload.reason).toBe("INVALID_ALERT_PAYLOAD");
		expect(payload.details).toBeTruthy();
	});
});
