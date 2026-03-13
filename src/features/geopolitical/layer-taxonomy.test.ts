import { describe, expect, it } from "bun:test";
import {
	buildGeoMapLayerHintsForHandoff,
	getGeoMapDefaultLayerFamiliesForView,
	getGeoMapLayerFamilyDefinition,
	isGeoMapLayerFamilyAvailableOnView,
} from "@/features/geopolitical/layer-taxonomy";

describe("layer-taxonomy", () => {
	it("keeps conflict as flat-first", () => {
		const definition = getGeoMapLayerFamilyDefinition("conflict");
		expect(definition.placement).toBe("flat-first");
		expect(definition.supportedViews).toEqual(["flat"]);
	});

	it("exposes globe defaults without conflict", () => {
		expect(getGeoMapDefaultLayerFamiliesForView("globe")).toEqual([
			"geo-core",
			"macro-state",
			"context",
		]);
	});

	it("builds story handoff hints with story tag", () => {
		expect(buildGeoMapLayerHintsForHandoff({ reason: "story" })).toEqual([
			"geo-core",
			"conflict",
			"context",
			"story",
		]);
	});

	it("marks panel-first as available on both views", () => {
		expect(isGeoMapLayerFamilyAvailableOnView("panel-first", "globe")).toBeTrue();
		expect(isGeoMapLayerFamilyAvailableOnView("panel-first", "flat")).toBeTrue();
	});
});
