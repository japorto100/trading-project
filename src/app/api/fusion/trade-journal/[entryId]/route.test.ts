import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { DELETE, PATCH } from "./route";

describe("/api/fusion/trade-journal/[entryId] route boundaries", () => {
	const context = { params: Promise.resolve({ entryId: "entry-1" }) };

	it("returns an explicit reason for invalid PATCH JSON bodies", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/trade-journal/entry-1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-journal-entry-invalid-json",
			},
			body: "{",
		});

		const response = await PATCH(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-journal-entry-invalid-json");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("invalid JSON body");
		expect(payload.reason).toBe("INVALID_JSON_BODY");
	});

	it("returns an explicit reason for invalid PATCH payloads", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/trade-journal/entry-1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-journal-entry-invalid-payload",
			},
			body: JSON.stringify({
				profileKey: "paper-default",
				note: "",
			}),
		});

		const response = await PATCH(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-journal-entry-invalid-payload");

		const payload = (await response.json()) as {
			error: string;
			reason: string;
			details: unknown;
		};
		expect(payload.error).toBe("invalid journal update payload");
		expect(payload.reason).toBe("INVALID_JOURNAL_UPDATE_PAYLOAD");
		expect(payload.details).toBeTruthy();
	});

	it("returns an explicit reason for invalid DELETE payloads", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/trade-journal/entry-1", {
			method: "DELETE",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-journal-entry-invalid-delete",
			},
			body: JSON.stringify({}),
		});

		const response = await DELETE(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-journal-entry-invalid-delete");

		const payload = (await response.json()) as {
			error: string;
			reason: string;
			details: unknown;
		};
		expect(payload.error).toBe("invalid delete payload");
		expect(payload.reason).toBe("INVALID_DELETE_PAYLOAD");
		expect(payload.details).toBeTruthy();
	});
});
