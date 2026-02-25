import type {
	GeoMapBasemapFeatureCollection,
	GeoMapBodyVisualConfig,
} from "@/features/geopolitical/bodies/types";

export const MOON_BODY_VISUAL_CONFIG: GeoMapBodyVisualConfig = {
	id: "moon",
	label: "Moon",
	sphereGradientId: "moon-gradient",
	atmosphereStroke: "#cbd5e1",
	atmosphereOpacity: 0.12,
	atmosphereStrokeWidth: 1.5,
	graticuleStroke: "#71717a",
	graticuleOpacity: 0.24,
	countryLayerEnabled: false,
	cloudOverlayEnabled: false,
	cloudOverlayStroke: "#d4d4d8",
	cloudOverlayOpacity: 0.03,
};

export function getMoonBasemapFeatures(): GeoMapBasemapFeatureCollection {
	return {
		type: "FeatureCollection",
		features: [],
	};
}
