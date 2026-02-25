import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries110 from "world-atlas/countries-110m.json";
import type {
	GeoMapBasemapFeatureCollection,
	GeoMapBodyVisualConfig,
} from "@/features/geopolitical/bodies/types";

export const EARTH_BODY_VISUAL_CONFIG: GeoMapBodyVisualConfig = {
	id: "earth",
	label: "Earth",
	sphereGradientId: "globe-gradient",
	atmosphereStroke: "#3b82f6",
	atmosphereOpacity: 0.2,
	atmosphereStrokeWidth: 1.5,
	graticuleStroke: "#334155",
	graticuleOpacity: 0.3,
	countryLayerEnabled: true,
	cloudOverlayEnabled: true,
	cloudOverlayStroke: "white",
	cloudOverlayOpacity: 0.05,
};

type CountriesTopology = Topology<{
	countries: GeometryCollection;
}>;

export function getEarthBasemapFeatures(): GeoMapBasemapFeatureCollection {
	return feature(
		countries110 as unknown as CountriesTopology,
		(countries110 as unknown as CountriesTopology).objects.countries,
	) as GeoMapBasemapFeatureCollection;
}
