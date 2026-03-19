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

export type GeoFlatLayerOptionId =
	| "events"
	| "flights"
	| "vessels"
	| "surveillance"
	| "orbital"
	| "rf"
	| "infra"
	| "strikes"
	| "missiles"
	| "targets"
	| "assets"
	| "zones"
	| "heat"
	| "arcs"
	| "paths"
	| "rings"
	| "hexbin"
	| "regime"
	| "sanctions"
	| "macro-state"
	| "region-news"
	| "analyst-notes"
	| "panel-signals";

export interface GeoFlatLayerOptionDefinition {
	id: GeoFlatLayerOptionId;
	label: string;
	family: GeoMapLayerFamily;
	placement: GeoMapLayerPlacement;
	sourceRefs: string[];
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

export const GEO_MAP_FLAT_LAYER_OPTION_CATALOG: readonly GeoFlatLayerOptionDefinition[] = [
	{
		id: "events",
		label: "Events",
		family: "geo-core",
		placement: "shared",
		sourceRefs: ["pharos-ai"],
	},
	{
		id: "flights",
		label: "Flights",
		family: "geo-core",
		placement: "shared",
		sourceRefs: ["GeoSentinel", "Shadowbroker", "Sovereign_Watch"],
	},
	{
		id: "vessels",
		label: "Vessels",
		family: "geo-core",
		placement: "shared",
		sourceRefs: ["GeoSentinel", "Shadowbroker", "Sovereign_Watch"],
	},
	{
		id: "surveillance",
		label: "Surveillance",
		family: "geo-core",
		placement: "shared",
		sourceRefs: ["GeoSentinel", "Shadowbroker"],
	},
	{
		id: "orbital",
		label: "Orbital",
		family: "geo-core",
		placement: "shared",
		sourceRefs: ["Sovereign_Watch"],
	},
	{
		id: "rf",
		label: "RF",
		family: "geo-core",
		placement: "shared",
		sourceRefs: ["Sovereign_Watch"],
	},
	{
		id: "infra",
		label: "Infra",
		family: "geo-core",
		placement: "shared",
		sourceRefs: ["Sovereign_Watch", "Shadowbroker"],
	},
	{
		id: "strikes",
		label: "Strikes",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["pharos-ai"],
	},
	{
		id: "missiles",
		label: "Missiles",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["pharos-ai", "conflict_globe_gl"],
	},
	{
		id: "targets",
		label: "Targets",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["pharos-ai"],
	},
	{
		id: "assets",
		label: "Assets",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["pharos-ai"],
	},
	{
		id: "zones",
		label: "Zones",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["pharos-ai"],
	},
	{
		id: "heat",
		label: "Heat",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["pharos-ai", "conflict_globe_gl"],
	},
	{
		id: "arcs",
		label: "Arcs",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["conflict_globe_gl"],
	},
	{
		id: "paths",
		label: "Paths",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["conflict_globe_gl"],
	},
	{
		id: "rings",
		label: "Rings",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["conflict_globe_gl"],
	},
	{
		id: "hexbin",
		label: "Hexbin",
		family: "conflict",
		placement: "flat-first",
		sourceRefs: ["conflict_globe_gl"],
	},
	{
		id: "regime",
		label: "Regime",
		family: "macro-state",
		placement: "shared",
		sourceRefs: ["tradeview-fusion"],
	},
	{
		id: "sanctions",
		label: "Sanctions",
		family: "macro-state",
		placement: "shared",
		sourceRefs: ["tradeview-fusion"],
	},
	{
		id: "macro-state",
		label: "Macro State",
		family: "macro-state",
		placement: "shared",
		sourceRefs: ["tradeview-fusion"],
	},
	{
		id: "region-news",
		label: "Region News",
		family: "context",
		placement: "shared",
		sourceRefs: ["worldwideview", "GeoSentinel"],
	},
	{
		id: "analyst-notes",
		label: "Analyst Notes",
		family: "context",
		placement: "shared",
		sourceRefs: ["tradeview-fusion"],
	},
	{
		id: "panel-signals",
		label: "Panel Signals",
		family: "panel-first",
		placement: "panel-first",
		sourceRefs: ["worldwideview", "GeoSentinel", "Shadowbroker"],
	},
] as const;

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

export function getGeoMapFlatLayerOptionsByFamily(
	family: GeoMapLayerFamily,
): GeoFlatLayerOptionDefinition[] {
	return GEO_MAP_FLAT_LAYER_OPTION_CATALOG.filter((option) => option.family === family);
}

export function getGeoMapFlatLayerOptionsForFamilies(
	families: GeoMapLayerFamily[],
): GeoFlatLayerOptionDefinition[] {
	const familySet = new Set(families);
	return GEO_MAP_FLAT_LAYER_OPTION_CATALOG.filter((option) => familySet.has(option.family));
}
