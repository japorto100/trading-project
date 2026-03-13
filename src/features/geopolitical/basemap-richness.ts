import type { GeoMapViewMode } from "@/features/geopolitical/layer-taxonomy";
import type { GeoMapBody } from "@/features/geopolitical/store";

export type GeoMapBasemapFeature =
	| "countries"
	| "graticule"
	| "place"
	| "water"
	| "waterway"
	| "terrain"
	| "roads"
	| "admin-detail"
	| "poi";

export type GeoMapBasemapRichness = "minimal" | "analyst" | "detailed";

export interface GeoMapBasemapRichnessPolicy {
	body: GeoMapBody;
	viewMode: GeoMapViewMode;
	richness: GeoMapBasemapRichness;
	minimumFeatures: GeoMapBasemapFeature[];
	optionalFeatures: GeoMapBasemapFeature[];
	pmtilesAllowed: boolean;
	mapLibreAllowed: boolean;
	description: string;
}

const EARTH_GLOBE_POLICY: GeoMapBasemapRichnessPolicy = {
	body: "earth",
	viewMode: "globe",
	richness: "minimal",
	minimumFeatures: ["countries", "graticule", "place", "water", "waterway"],
	optionalFeatures: ["terrain"],
	pmtilesAllowed: false,
	mapLibreAllowed: false,
	description:
		"Globe bleibt strategisch und reduziert. Nur orientierende Basemap-Features sind Mindestziel; tile-basierte Detailebenen bleiben fuer den Flat-Modus reserviert.",
};

const EARTH_FLAT_POLICY: GeoMapBasemapRichnessPolicy = {
	body: "earth",
	viewMode: "flat",
	richness: "analyst",
	minimumFeatures: ["countries", "place", "water", "waterway"],
	optionalFeatures: ["terrain", "roads", "admin-detail", "poi"],
	pmtilesAllowed: true,
	mapLibreAllowed: true,
	description:
		"Flat/Regional dient als operativer Analystenmodus und darf detailreichere PMTiles-/MapLibre-Basemaps nutzen, solange Layer-Vertraege stabil bleiben.",
};

const MOON_GLOBE_POLICY: GeoMapBasemapRichnessPolicy = {
	body: "moon",
	viewMode: "globe",
	richness: "minimal",
	minimumFeatures: ["graticule"],
	optionalFeatures: [],
	pmtilesAllowed: false,
	mapLibreAllowed: false,
	description:
		"Moon bleibt im v2-Kern ein spezialisierter Body-Mode ohne reichhaltige Basemap. Fokus liegt auf der koerperspezifischen Ansicht statt auf Tile-Details.",
};

const MOON_FLAT_POLICY: GeoMapBasemapRichnessPolicy = {
	body: "moon",
	viewMode: "flat",
	richness: "detailed",
	minimumFeatures: ["graticule"],
	optionalFeatures: ["terrain", "place"],
	pmtilesAllowed: false,
	mapLibreAllowed: false,
	description:
		"Moon besitzt im aktuellen Scope keinen Flat-/Regional-Analystenmodus. Ein spaeterer Scene-/Science-Track kann einen eigenen Renderer einfuehren.",
};

export function getGeoMapBasemapRichnessPolicy(params: {
	body: GeoMapBody;
	viewMode: GeoMapViewMode;
}): GeoMapBasemapRichnessPolicy {
	if (params.body === "moon") {
		return params.viewMode === "flat" ? MOON_FLAT_POLICY : MOON_GLOBE_POLICY;
	}
	return params.viewMode === "flat" ? EARTH_FLAT_POLICY : EARTH_GLOBE_POLICY;
}

export function supportsGeoMapBasemapFeature(params: {
	body: GeoMapBody;
	viewMode: GeoMapViewMode;
	feature: GeoMapBasemapFeature;
}): boolean {
	const policy = getGeoMapBasemapRichnessPolicy({
		body: params.body,
		viewMode: params.viewMode,
	});
	return (
		policy.minimumFeatures.includes(params.feature) ||
		policy.optionalFeatures.includes(params.feature)
	);
}
