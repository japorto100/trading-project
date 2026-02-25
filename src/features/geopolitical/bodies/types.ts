import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import type { GeoMapBody } from "@/features/geopolitical/store";

export interface GeoMapBodyVisualConfig {
	id: GeoMapBody;
	label: string;
	sphereGradientId: "globe-gradient" | "moon-gradient";
	atmosphereStroke: string;
	atmosphereOpacity: number;
	atmosphereStrokeWidth: number;
	graticuleStroke: string;
	graticuleOpacity: number;
	countryLayerEnabled: boolean;
	cloudOverlayEnabled: boolean;
	cloudOverlayStroke: string;
	cloudOverlayOpacity: number;
}

export type GeoMapBasemapFeatureCollection = FeatureCollection<Geometry, GeoJsonProperties>;
