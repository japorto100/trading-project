import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { GET, PUT } from "./route";

describe("/api/fusion/preferences route boundaries", () => {
	it("returns an explicit reason when profileKey is missing on GET", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/preferences");
		const response = await GET(request);

		expect(response.status).toBe(400);
		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("profileKey is required");
		expect(payload.reason).toBe("MISSING_PROFILE_KEY");
	});

	it("returns an explicit reason for invalid JSON request bodies", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/preferences", {
			method: "PUT",
			headers: {
				"content-type": "application/json",
			},
			body: "{",
		});

		const response = await PUT(request);
		expect(response.status).toBe(400);

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("invalid JSON body");
		expect(payload.reason).toBe("INVALID_JSON_BODY");
	});

	it("returns an explicit reason for invalid preferences payloads", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/preferences", {
			method: "PUT",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				profileKey: "paper-default",
				favorites: ["AAPL"],
				sidebarOpen: "yes",
			}),
		});

		const response = await PUT(request);
		expect(response.status).toBe(400);

		const payload = (await response.json()) as {
			error: string;
			reason: string;
			details: unknown;
		};
		expect(payload.error).toBe("invalid preferences payload");
		expect(payload.reason).toBe("INVALID_PREFERENCES_PAYLOAD");
		expect(payload.details).toBeTruthy();
	});
});
