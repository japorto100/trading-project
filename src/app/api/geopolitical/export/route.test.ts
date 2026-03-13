import { describe, expect, it } from "bun:test";
import { NextRequest } from "next/server";
import { POST } from "./route";

describe("POST /api/geopolitical/export", () => {
	it("returns a JSON snapshot payload", async () => {
		const request = new NextRequest("http://localhost:3000/api/geopolitical/export", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-geomap-export-json",
			},
			body: JSON.stringify({
				format: "json",
				regionLabel: "All regions",
				includeItems: true,
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(200);

		const payload = (await response.json()) as {
			success: boolean;
			filename: string;
			mimeType: string;
			content: string;
			requestId: string;
			contract_version: string;
		};

		expect(payload.success).toBe(true);
		expect(payload.filename).toMatch(/^geomap-export-\d+\.json$/);
		expect(payload.mimeType).toBe("application/json");
		expect(payload.requestId).toBe("req-geomap-export-json");
		expect(payload.contract_version).toBe("phase12-export-v1");

		const exported = JSON.parse(payload.content) as {
			generatedAt: string;
			region: string;
			counts: Record<string, number>;
			items?: Record<string, unknown[]>;
		};
		expect(exported.region).toBe("All regions");
		expect(typeof exported.generatedAt).toBe("string");
		expect(exported.counts).toEqual(
			expect.objectContaining({
				events: expect.any(Number),
				candidates: expect.any(Number),
				contradictions: expect.any(Number),
				timeline: expect.any(Number),
			}),
		);
		expect(exported.items).toBeDefined();
	});

	it("returns a CSV summary payload", async () => {
		const request = new NextRequest("http://localhost:3000/api/geopolitical/export", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-request-id": "req-geomap-export-csv",
			},
			body: JSON.stringify({
				format: "csv",
				regionLabel: "MENA",
			}),
		});

		const response = await POST(request);
		expect(response.status).toBe(200);

		const payload = (await response.json()) as {
			success: boolean;
			filename: string;
			mimeType: string;
			content: string;
			requestId: string;
			contract_version: string;
		};

		expect(payload.success).toBe(true);
		expect(payload.filename).toMatch(/^geomap-summary-\d+\.csv$/);
		expect(payload.mimeType).toBe("text/csv;charset=utf-8");
		expect(payload.requestId).toBe("req-geomap-export-csv");
		expect(payload.contract_version).toBe("phase12-export-v1");
		expect(payload.content).toContain("metric,value");
		expect(payload.content).toContain('region,"MENA"');
		expect(payload.content).toContain("events,");
		expect(payload.content).toContain("candidates,");
		expect(payload.content).toContain("contradictions,");
		expect(payload.content).toContain("timeline,");
	});
});
