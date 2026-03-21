import { describe, expect, it } from "bun:test";
import { buildGeoFlatLayerMatrixForFamilies } from "@/features/geopolitical/flat-view/flat-view-layer-matrix";

describe("flat-view-layer-matrix", () => {
	it("builds explicit placement rules for non-conflict families", () => {
		const matrix = buildGeoFlatLayerMatrixForFamilies([
			"geo-core",
			"macro-state",
			"context",
			"panel-first",
		]);

		expect(matrix.find((entry) => entry.optionId === "events")).toEqual({
			optionId: "events",
			label: "Events",
			family: "geo-core",
			placementMode: "overlay",
			visibilityMode: "default-on",
			selectionMode: "map-select",
			sourceRefs: ["pharos-ai"],
		});
		expect(matrix.find((entry) => entry.optionId === "macro-state")).toEqual({
			optionId: "macro-state",
			label: "Macro State",
			family: "macro-state",
			placementMode: "hybrid",
			visibilityMode: "toggle-only",
			selectionMode: "hybrid-select",
			sourceRefs: ["tradeview-fusion"],
		});
		expect(matrix.find((entry) => entry.optionId === "region-news")).toEqual({
			optionId: "region-news",
			label: "Region News",
			family: "context",
			placementMode: "hybrid",
			visibilityMode: "toggle-only",
			selectionMode: "hybrid-select",
			sourceRefs: ["worldwideview", "GeoSentinel"],
		});
		expect(matrix.find((entry) => entry.optionId === "panel-signals")).toEqual({
			optionId: "panel-signals",
			label: "Panel Signals",
			family: "panel-first",
			placementMode: "panel",
			visibilityMode: "focus-driven",
			selectionMode: "panel-select",
			sourceRefs: ["worldwideview", "GeoSentinel", "Shadowbroker"],
		});
	});
});
