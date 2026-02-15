// @ts-nocheck
import { describe, expect, it } from "bun:test";
import { parseCreateGeoEventInput, parseUpdateGeoEventInput } from "@/lib/geopolitical/validation";

describe("geopolitical validation", () => {
	it("accepts a valid create payload", () => {
		const result = parseCreateGeoEventInput({
			title: "Policy rate decision in Europe",
			symbol: "percent",
			lat: 50.1109,
			lng: 8.6821,
			severity: 3,
			confidence: 2,
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.category).toBe("monetary_policy_rates");
			expect(result.value.status).toBe("confirmed");
		}
	});

	it("rejects unknown symbols in create payload", () => {
		const result = parseCreateGeoEventInput({
			title: "Invalid marker",
			symbol: "not-a-symbol",
			lat: 0,
			lng: 0,
		});

		expect(result.ok).toBe(false);
	});

	it("requires lat and lng together for updates", () => {
		const result = parseUpdateGeoEventInput({
			title: "Move marker",
			lat: 12.5,
		});

		expect(result.ok).toBe(false);
	});
});
