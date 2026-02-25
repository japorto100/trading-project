import type { GeoMapBody } from "@/features/geopolitical/store";

export interface BodyPointLayerPoint {
	id: string;
	lat: number;
	lng: number;
	label: string;
	title: string;
	ariaLabel: string;
	fill: string;
	stroke: string;
	strokeWidth: number;
	coreRadius: number;
	haloRadius: number;
	haloOpacity: number;
}

export interface BodyPointLayerLegendItem {
	id: string;
	label: string;
	color: string;
	description?: string;
}

export interface BodyPointLayerLegend {
	title?: string;
	items: BodyPointLayerLegendItem[];
	note?: string;
}

export interface BodyPointLayer {
	id: string;
	name: string;
	body: GeoMapBody;
	group?: "missions" | "sites" | "infrastructure" | "science";
	defaultVisible?: boolean;
	renderStage?: "body-point-layers";
	rendererHint?: "svg" | "canvas";
	legend?: BodyPointLayerLegend;
	points: BodyPointLayerPoint[];
}
