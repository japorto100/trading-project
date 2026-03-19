import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { PATCH } from "./route";

describe("/api/fusion/orders/[orderId] route boundaries", () => {
	const context = { params: Promise.resolve({ orderId: "order-1" }) };

	it("returns an explicit reason for invalid JSON request bodies", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/orders/order-1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-order-detail-invalid-json",
			},
			body: "{",
		});

		const response = await PATCH(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-order-detail-invalid-json");

		const payload = (await response.json()) as { error: string; reason: string };
		expect(payload.error).toBe("invalid JSON body");
		expect(payload.reason).toBe("INVALID_JSON_BODY");
	});

	it("returns an explicit reason for invalid order status payloads", async () => {
		const request = new NextRequest("http://localhost:3000/api/fusion/orders/order-1", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-order-detail-invalid-payload",
			},
			body: JSON.stringify({
				profileKey: "paper-default",
				status: "pending",
			}),
		});

		const response = await PATCH(request, context);
		expect(response.status).toBe(400);
		expect(response.headers.get("x-request-id")).toBe("req-order-detail-invalid-payload");

		const payload = (await response.json()) as {
			error: string;
			reason: string;
			details: unknown;
		};
		expect(payload.error).toBe("invalid order status payload");
		expect(payload.reason).toBe("INVALID_ORDER_STATUS_PAYLOAD");
		expect(payload.details).toBeTruthy();
	});
});
