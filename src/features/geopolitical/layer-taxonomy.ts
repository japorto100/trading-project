import type { GeoFlatViewHandoffReason } from "@/features/geopolitical/flat-view-handoff";

export type GeoMapViewMode = "globe" | "flat";

export type GeoMapLayerFamily = "geo-core" | "conflict" | "macro-state" | "context" | "panel-first";

export type GeoMapLayerPlacement = "shared" | "globe-first" | "flat-first" | "panel-first";

export type GeoMapLayerHint = GeoMapLayerFamily | "story";

export interface GeoMapLayerFamilyDefinition {
	id: GeoMapLayerFamily;
	label: string;
	placement: GeoMapLayerPlacement;
	supportedViews: GeoMapViewMode[];
	description: string;
}

export const GEO_MAP_LAYER_FAMILY_CATALOG: Readonly<
	Record<GeoMapLayerFamily, GeoMapLayerFamilyDefinition>
> = {
	"geo-core": {
		id: "geo-core",
		label: "Geo Core",
		placement: "shared",
		supportedViews: ["globe", "flat"],
		description:
			"Analystisch zentrale, geolokalisierte Ereignisse und orientierende Kernsignale, die in Globe und Flat gleich bleiben sollen.",
	},
	conflict: {
		id: "conflict",
		label: "Conflict",
		placement: "flat-first",
		supportedViews: ["flat"],
		description:
			"Dichte Konfliktobjekte wie Strikes, Threat Zones, Assets, Targets und Replay-Arcs, primär für den operativen Flat-Modus.",
	},
	"macro-state": {
		id: "macro-state",
		label: "Macro / State",
		placement: "shared",
		supportedViews: ["globe", "flat"],
		description:
			"Regime-, Sanktions-, Makro- und staatliche Zustandslayer, die global und regional konsistent erzählt werden müssen.",
	},
	context: {
		id: "context",
		label: "Context",
		placement: "shared",
		supportedViews: ["globe", "flat"],
		description:
			"Kontextuelle News-, Narrative- und Analystenhinweise, die nur bei aktivem Drilldown stärker sichtbar werden.",
	},
	"panel-first": {
		id: "panel-first",
		label: "Panel First",
		placement: "panel-first",
		supportedViews: ["globe", "flat"],
		description:
			"Schwache oder schwer geolokalisierbare Signale, die primär in Panels erscheinen und nicht standardmäßig die Karte überladen.",
	},
};

const GEO_MAP_GLOBE_DEFAULT_LAYER_FAMILIES: GeoMapLayerFamily[] = [
	"geo-core",
	"macro-state",
	"context",
];

const GEO_MAP_FLAT_DEFAULT_LAYER_FAMILIES: GeoMapLayerFamily[] = [
	"geo-core",
	"conflict",
	"macro-state",
	"context",
];

export function getGeoMapLayerFamilyDefinition(
	family: GeoMapLayerFamily,
): GeoMapLayerFamilyDefinition {
	return GEO_MAP_LAYER_FAMILY_CATALOG[family];
}

export function getGeoMapDefaultLayerFamiliesForView(
	viewMode: GeoMapViewMode,
): GeoMapLayerFamily[] {
	return viewMode === "flat"
		? [...GEO_MAP_FLAT_DEFAULT_LAYER_FAMILIES]
		: [...GEO_MAP_GLOBE_DEFAULT_LAYER_FAMILIES];
}

export function getGeoMapLayerFamiliesForHandoffReason(
	reason: GeoFlatViewHandoffReason,
): GeoMapLayerFamily[] {
	if (reason === "story") {
		return ["geo-core", "conflict", "context"];
	}
	if (reason === "region" || reason === "cluster" || reason === "draw_area") {
		return ["geo-core", "conflict", "macro-state"];
	}
	return ["geo-core", "conflict"];
}

export function buildGeoMapLayerHintsForHandoff(params: {
	reason: GeoFlatViewHandoffReason;
	includeStoryHint?: boolean;
}): GeoMapLayerHint[] {
	const hints = getGeoMapLayerFamiliesForHandoffReason(params.reason);
	if (params.includeStoryHint || params.reason === "story") {
		return [...hints, "story"];
	}
	return hints;
}

export function isGeoMapLayerFamilyAvailableOnView(
	family: GeoMapLayerFamily,
	viewMode: GeoMapViewMode,
): boolean {
	return GEO_MAP_LAYER_FAMILY_CATALOG[family].supportedViews.includes(viewMode);
}
