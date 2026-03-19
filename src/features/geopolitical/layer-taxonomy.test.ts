import { describe, expect, it } from "bun:test";
import {
	buildGeoMapLayerHintsForHandoff,
	GEO_MAP_FLAT_LAYER_OPTION_CATALOG,
	getGeoMapDefaultLayerFamiliesForView,
	getGeoMapFlatLayerOptionsByFamily,
	getGeoMapFlatLayerOptionsForFamilies,
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

	it("keeps the flat layer option catalog deduplicated by option id", () => {
		const ids = GEO_MAP_FLAT_LAYER_OPTION_CATALOG.map((option) => option.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("groups deduplicated flat options by family", () => {
		expect(getGeoMapFlatLayerOptionsByFamily("conflict").map((option) => option.id)).toEqual([
			"strikes",
			"missiles",
			"targets",
			"assets",
			"zones",
			"heat",
			"arcs",
			"paths",
			"rings",
			"hexbin",
		]);
		expect(getGeoMapFlatLayerOptionsByFamily("geo-core").map((option) => option.id)).toEqual([
			"events",
			"flights",
			"vessels",
			"surveillance",
			"orbital",
			"rf",
			"infra",
		]);
	});

	it("builds a deduplicated flat option matrix for active families", () => {
		expect(
			getGeoMapFlatLayerOptionsForFamilies(["geo-core", "conflict", "panel-first"]).map(
				(option) => option.id,
			),
		).toEqual([
			"events",
			"flights",
			"vessels",
			"surveillance",
			"orbital",
			"rf",
			"infra",
			"strikes",
			"missiles",
			"targets",
			"assets",
			"zones",
			"heat",
			"arcs",
			"paths",
			"rings",
			"hexbin",
			"panel-signals",
		]);
	});
});
