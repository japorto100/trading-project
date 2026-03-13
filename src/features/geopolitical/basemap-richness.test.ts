import { describe, expect, it } from "bun:test";
import {
	getGeoMapBasemapRichnessPolicy,
	supportsGeoMapBasemapFeature,
} from "@/features/geopolitical/basemap-richness";

describe("basemap-richness", () => {
	it("keeps earth globe minimal and tile-free", () => {
		const policy = getGeoMapBasemapRichnessPolicy({ body: "earth", viewMode: "globe" });
		expect(policy.richness).toBe("minimal");
		expect(policy.pmtilesAllowed).toBeFalse();
		expect(policy.mapLibreAllowed).toBeFalse();
		expect(policy.minimumFeatures).toEqual([
			"countries",
			"graticule",
			"place",
			"water",
			"waterway",
		]);
	});

	it("allows richer earth flat basemap features", () => {
		const policy = getGeoMapBasemapRichnessPolicy({ body: "earth", viewMode: "flat" });
		expect(policy.richness).toBe("analyst");
		expect(policy.pmtilesAllowed).toBeTrue();
		expect(policy.mapLibreAllowed).toBeTrue();
		expect(policy.optionalFeatures).toContain("roads");
		expect(policy.optionalFeatures).toContain("admin-detail");
	});

	it("treats moon flat as deferred renderer territory", () => {
		const policy = getGeoMapBasemapRichnessPolicy({ body: "moon", viewMode: "flat" });
		expect(policy.pmtilesAllowed).toBeFalse();
		expect(policy.mapLibreAllowed).toBeFalse();
	});

	it("answers feature support by body and view", () => {
		expect(
			supportsGeoMapBasemapFeature({
				body: "earth",
				viewMode: "globe",
				feature: "waterway",
			}),
		).toBeTrue();
		expect(
			supportsGeoMapBasemapFeature({
				body: "earth",
				viewMode: "globe",
				feature: "roads",
			}),
		).toBeFalse();
	});
});
