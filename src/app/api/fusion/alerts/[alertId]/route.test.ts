import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { DELETE, PATCH } from "./route";

describe("/api/fusion/alerts/[alertId] route boundaries", () => {
	const context = { params: Promise.resolve({ alertId: "alert-1" }) };

	it("returns an explicit reason for invalid PATCH JSON request bodies", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/alerts/alert-1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-alert-detail-invalid-json",
			},
			body: "{",
		});

		const response = await PATCH(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-alert-detail-invalid-json");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("invalid JSON body");
		expect(payload.reason).toBe("INVALID_JSON_BODY");
	});

	it("returns an explicit reason for invalid PATCH payloads", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/alerts/alert-1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-alert-detail-invalid-payload",
			},
			body: JSON.stringify({
				profileKey: "paper-default",
				triggeredAt: -5,
			}),
		});

		const response = await PATCH(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-alert-detail-invalid-payload");

		const payload = (await response.json()) as {
			error: string;
			reason: string;
			details: unknown;
		};
		expect(payload.error).toBe("invalid update payload");
		expect(payload.reason).toBe("INVALID_UPDATE_PAYLOAD");
		expect(payload.details).toBeTruthy();
	});

	it("returns an explicit reason when profileKey is missing on DELETE", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/alerts/alert-1", {
			method: "DELETE",
			headers: {
				"x-request-id": "req-alert-detail-missing-profile",
			},
		});

		const response = await DELETE(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-alert-detail-missing-profile");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("profileKey is required");
		expect(payload.reason).toBe("MISSING_PROFILE_KEY");
	});
});
