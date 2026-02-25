import { getBodyPointLayers } from "@/features/geopolitical/layers/bodyPointLayers";
import type {
	BodyPointLayer,
	BodyPointLayerLegend,
} from "@/features/geopolitical/layers/bodyPointLayerTypes";
import type { GeoMapBody } from "@/features/geopolitical/store";

export interface BodyPointLayerLegendEntry {
	id: string;
	name: string;
	legend: BodyPointLayerLegend;
}

export function getBodyPointLayerLegendEntries(body: GeoMapBody): BodyPointLayerLegendEntry[] {
	return getBodyPointLayers(body)
		.filter((layer): layer is BodyPointLayer & { legend: BodyPointLayerLegend } => {
			return Boolean(layer.legend) && layer.points.length > 0;
		})
		.map((layer) => ({
			id: layer.id,
			name: layer.name,
			legend: layer.legend,
		}));
}

export function getBodyPointLayerDefaultVisibilityMap(body: GeoMapBody): Record<string, boolean> {
	return Object.fromEntries(
		getBodyPointLayers(body).map((layer) => [layer.id, layer.defaultVisible ?? true]),
	);
}

export function getRenderableBodyPointLayers(
	body: GeoMapBody,
	visibilityOverrides?: Partial<Record<string, boolean>> | null,
): BodyPointLayer[] {
	return getBodyPointLayers(body).filter((layer) => {
		const defaultVisible = layer.defaultVisible ?? true;
		const override = visibilityOverrides?.[layer.id];
		return override ?? defaultVisible;
	});
}
