import {
	EARTH_BODY_VISUAL_CONFIG,
	getEarthBasemapFeatures,
} from "@/features/geopolitical/bodies/earth";
import {
	getMoonBasemapFeatures,
	MOON_BODY_VISUAL_CONFIG,
} from "@/features/geopolitical/bodies/moon";
import type { GeoMapBody } from "@/features/geopolitical/store";

export { EARTH_BODY_VISUAL_CONFIG, MOON_BODY_VISUAL_CONFIG };
export type {
	GeoMapBasemapFeatureCollection,
	GeoMapBodyVisualConfig,
} from "@/features/geopolitical/bodies/types";

export function getGeoMapBodyVisualConfig(body: GeoMapBody) {
	if (body === "moon") {
		return MOON_BODY_VISUAL_CONFIG;
	}
	return EARTH_BODY_VISUAL_CONFIG;
}

export function getGeoMapBodyBasemapFeatures(body: GeoMapBody) {
	if (body === "moon") {
		return getMoonBasemapFeatures();
	}
	return getEarthBasemapFeatures();
}
