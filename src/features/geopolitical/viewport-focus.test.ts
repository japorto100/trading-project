import { describe, expect, it } from "bun:test";
import { buildGeoViewportFocusTarget } from "@/features/geopolitical/viewport-focus";

describe("geo viewport focus", () => {
	it("builds a stable viewport focus target for valid coordinates", () => {
		const target = buildGeoViewportFocusTarget({
			lat: 30.04,
			lng: 31.24,
			currentScale: 220,
			initialScale: 180,
		});

		expect(target).not.toBeNull();
		expect(target?.rotation).toEqual([-31.24, -30.04, 0]);
		expect(target?.scale).toBeGreaterThanOrEqual(225);
	});

	it("clamps invalid latitudes and scale ceilings", () => {
		const target = buildGeoViewportFocusTarget({
			lat: 120,
			lng: -12,
			currentScale: 5000,
			initialScale: 180,
			maxScaleMultiplier: 4,
		});

		expect(target).not.toBeNull();
		expect(target?.rotation).toEqual([12, -85, 0]);
		expect(target?.scale).toBe(720);
	});

	it("returns null for non-finite coordinates", () => {
		expect(
			buildGeoViewportFocusTarget({
				lat: Number.NaN,
				lng: 20,
				currentScale: 220,
				initialScale: 180,
			}),
		).toBeNull();
	});
});
