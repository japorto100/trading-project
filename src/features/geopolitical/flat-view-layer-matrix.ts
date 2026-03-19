import {
	type GeoFlatLayerOptionDefinition,
	type GeoFlatLayerOptionId,
	type GeoMapLayerFamily,
	getGeoMapFlatLayerOptionsByFamily,
} from "@/features/geopolitical/layer-taxonomy";

export type GeoFlatLayerPlacementMode = "overlay" | "hybrid" | "panel";
export type GeoFlatLayerVisibilityMode = "default-on" | "toggle-only" | "focus-driven";
export type GeoFlatLayerSelectionMode = "map-select" | "hybrid-select" | "panel-select";

export interface GeoFlatLayerMatrixEntry {
	optionId: GeoFlatLayerOptionId;
	label: string;
	family: GeoMapLayerFamily;
	placementMode: GeoFlatLayerPlacementMode;
	visibilityMode: GeoFlatLayerVisibilityMode;
	selectionMode: GeoFlatLayerSelectionMode;
	sourceRefs: string[];
}

function buildGeoFlatLayerMatrixEntry(
	option: GeoFlatLayerOptionDefinition,
): GeoFlatLayerMatrixEntry {
	switch (option.id) {
		case "events":
		case "flights":
		case "vessels":
		case "surveillance":
		case "orbital":
		case "rf":
		case "infra":
		case "strikes":
		case "targets":
		case "assets":
		case "zones":
		case "heat":
			return {
				optionId: option.id,
				label: option.label,
				family: option.family,
				placementMode: "overlay",
				visibilityMode: "default-on",
				selectionMode: "map-select",
				sourceRefs: option.sourceRefs,
			};
		case "macro-state":
		case "regime":
		case "sanctions":
		case "region-news":
		case "analyst-notes":
			return {
				optionId: option.id,
				label: option.label,
				family: option.family,
				placementMode: "hybrid",
				visibilityMode: "toggle-only",
				selectionMode: "hybrid-select",
				sourceRefs: option.sourceRefs,
			};
		case "panel-signals":
			return {
				optionId: option.id,
				label: option.label,
				family: option.family,
				placementMode: "panel",
				visibilityMode: "focus-driven",
				selectionMode: "panel-select",
				sourceRefs: option.sourceRefs,
			};
		case "missiles":
		case "arcs":
		case "paths":
		case "rings":
		case "hexbin":
			return {
				optionId: option.id,
				label: option.label,
				family: option.family,
				placementMode: "overlay",
				visibilityMode: "toggle-only",
				selectionMode: "map-select",
				sourceRefs: option.sourceRefs,
			};
	}
}

export function buildGeoFlatLayerMatrixForFamilies(
	families: GeoMapLayerFamily[],
): GeoFlatLayerMatrixEntry[] {
	return families.flatMap((family) =>
		getGeoMapFlatLayerOptionsByFamily(family).map((option) => buildGeoFlatLayerMatrixEntry(option)),
	);
}
